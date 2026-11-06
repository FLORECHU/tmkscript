// ==UserScript==
// @name         TD-Biobank – Tableau des ressources amélioré
// @namespace    biobank.ui
// @version      1.3.0
// @description  Tableau lisible et pro : capsules colorées, état interne visible, type de code-barre, recherche et filtres
// @include      *ListSamplesSearch.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/ListeRessources_MiseEnForme.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/ListeRessources_MiseEnForme.user.js
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ================= CONFIGURATION ================= */
  const ESPACEMENT_LIGNES = 10;   // px en haut et en bas de chaque ligne
  const TITRE_MAX_PX = 120;       // largeur max d'un titre avant retour à la ligne
  const NB_CHIFFRES_GRAS = 4;     // nombre de chiffres mis en gras dans le code-barre
  const LARGEUR_ETIQUETTE = 74;   // px : largeur identique pour PRIMAIRE / ÉCHANT. / SCANNÉ

  const TITRES_COURTS = {
    'Date de réception ou de préparation': 'Réception / préparation',
    'Date de prélèvement': 'Prélèvement',
    'Date de Stockage': 'Stockage',
    'Etat de prélèvement': 'Etat prélèv.',
    'N° de randomisation': 'N° randomis.'
  };

  /* ---- Formats de code-barre ----
     Ordre important : l'échantillon est testé AVANT le primaire.
     - Échantillon : T + code de la ressource primaire + E + 2 chiffres
     - Primaire    : commence par T
     - Libre       : tout le reste (code scanné)
     Si vos codes classiques ne contiennent que des chiffres après le T, utilisez plutôt :
       RE_ECHANTILLON = /^(T\d+)(E\d{2})$/i   et   RE_PRIMAIRE = /^T\d+$/i
     pour éviter qu'un code scanné commençant par T soit pris pour un code classique. */
  const RE_ECHANTILLON = /^(T.+?)(E\d{2})$/i;
  const RE_PRIMAIRE    = /^T\S+$/i;

  // label : 8 caractères maximum | motsCles : termes ajoutés à la recherche
  const TYPES_CODE = {
    pri:   { label: 'PRIMAIRE', titre: 'Code classique – ressource primaire', motsCles: 'primaire' },
    ech:   { label: 'ÉCHANT.',  titre: 'Code classique – échantillon',        motsCles: 'echantillon' },
    libre: { label: 'SCANNÉ',   titre: 'Code libre (scanné)',                 motsCles: 'scanne libre' }
  };

  /* ================= DÉTECTION DU TABLEAU ================= */
  const firstTh = document.querySelector('th.ItemListHeader');
  if (!firstTh) return;
  const table = firstTh.closest('table');
  if (!table || table.classList.contains('bb-table')) return;
  table.classList.add('bb-table');

  // Ligne d'en-tête : celle qui contient les titres (qu'elle soit dans <thead> ou <tbody>)
  const headerRow = firstTh.closest('tr');
  headerRow.classList.add('bb-head');

  /* ================= ÉTATS INTERNES ================= */
  const ETATS = [
    { re: /a stocker/i,  cls: 'bb-blue',   ligne: '#eaf3ff', bord: '#5b9bf0' },
    { re: /vide/i,       cls: 'bb-gray',   ligne: '#f3f4f6', bord: '#c4c9d1' },
    { re: /c[ée]d[ée]/i, cls: 'bb-purple', ligne: '#f7f3fd', bord: '#b79bea' },
    { re: /d[ée]truit/i, cls: 'bb-red',    ligne: '#fdf1f1', bord: '#e88a8a' },
    { re: /transfert/i,  cls: 'bb-teal',   ligne: '#effaf8', bord: '#4cc0b0' },
    { re: /sort/i,       cls: 'bb-brown',  ligne: '#f8f2ec', bord: '#c9a27e' },
    { re: /stock/i,      cls: 'bb-green',  ligne: null,      bord: null      }
  ];
  const ETATS_TEINTES = ETATS.filter(e => e.ligne);

  /* ================= STYLES ================= */
  const POLICE_MONO = '"Cascadia Mono", Consolas, "Roboto Mono", "DejaVu Sans Mono", "Courier New", monospace';

  GM_addStyle(`
    .bb-table {
      border-collapse: separate !important; border-spacing: 0 !important;
      width: 100%; font: 13px/1.4 "Segoe UI", Roboto, Arial, sans-serif !important;
      background: #fff; border-radius: 10px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(15,40,80,.10); border: 1px solid #e3e8ef !important;
    }
    .bb-table *:not(.bb-mono):not(.bb-mono *) {
      font-family: "Segoe UI", Roboto, Arial, sans-serif !important;
    }

    /* ---- TITRES : jamais de capsule ---- */
    .bb-table tr.bb-head th {
      position: sticky; top: 0; z-index: 5;
      background: linear-gradient(#2f4a6d, #263d5a) !important; color: #fff !important;
      padding: 9px 8px !important; font-weight: 600; font-size: 12px; line-height: 1.25;
      text-align: left; vertical-align: middle; border: none !important;
      max-width: ${TITRE_MAX_PX}px; white-space: normal;
    }
    .bb-table tr.bb-head th *,
    .bb-table tr.bb-head th a,
    .bb-table tr.bb-head th span {
      background: transparent !important; border: none !important; border-radius: 0 !important;
      box-shadow: none !important; padding: 0 !important; margin: 0 !important;
      display: inline !important; color: #fff !important; font-weight: 600 !important;
      font-size: 12px !important; text-decoration: none !important; font-style: normal !important;
    }
    .bb-table tr.bb-head th a:hover { text-decoration: underline !important; }

    /* ---- LIGNES ---- */
    .bb-table tr.bb-row td {
      padding: ${ESPACEMENT_LIGNES}px 8px !important; border: none !important;
      border-bottom: 2px solid #c9d3e0 !important;
      vertical-align: middle;
    }
    .bb-table tr.bb-row.bb-last td { border-bottom: none !important; }
    .bb-table tr.bb-row.odd  td { background: #fff !important; }
    .bb-table tr.bb-row.even td { background: #f7f9fc !important; }
    .bb-table tr.bb-row.bb-hidden-row { display: none !important; }
    .bb-table tr.bb-row { cursor: pointer; transition: background .15s; }
    .bb-table tr.bb-row:hover td { background: #eaf2ff !important; }
    .bb-table tr.bb-row.bb-selected td { background: #dcebff !important; }
    .bb-table tr.bb-row.bb-selected td:first-child { box-shadow: inset 4px 0 0 #2b7cff !important; }

    /* Teintes d'état interne (subtiles) */
    ${ETATS_TEINTES.map((e, i) => `
    .bb-table tr.bb-row.bb-etat-${i} td { background: ${e.ligne} !important; }
    .bb-table tr.bb-row.bb-etat-${i} td:first-child { box-shadow: inset 3px 0 0 ${e.bord}; }
    .bb-table tr.bb-row.bb-etat-${i}:hover td { background: #eaf2ff !important; }
    .bb-table tr.bb-row.bb-etat-${i}.bb-selected td { background: #dcebff !important; }`).join('')}

    .bb-table a.LienNoir { color: #1f5fbf !important; text-decoration: none !important; }
    .bb-table a.LienNoir:hover { text-decoration: underline !important; }

    /* ---- CAPSULES (données uniquement) ---- */
    .bb-table tr.bb-row .bb-badge {
      display: inline-block; padding: 2px 10px; border-radius: 999px;
      font-size: 11.5px; font-weight: 600; white-space: nowrap; line-height: 18px;
    }
    .bb-red     { background:#fde4e4; color:#b42318; }
    .bb-wine    { background:#f6d5da; color:#8b1e2d; }
    .bb-amber   { background:#fdecc0; color:#8a5a00; }
    .bb-orange  { background:#ffe4cc; color:#c2410c; }
    .bb-sky     { background:#d9f0ff; color:#0369a1; }
    .bb-indigo  { background:#e0e3ff; color:#3730a3; }
    .bb-brown   { background:#f3e9df; color:#6b4226; }
    .bb-purple  { background:#efe7fd; color:#5b2bb5; }
    .bb-teal    { background:#d5f5ef; color:#0f766e; }
    .bb-blue    { background:#e3efff; color:#1d4ed8; }
    .bb-green   { background:#dcfce7; color:#15803d; }
    .bb-gray    { background:#eef1f5; color:#475467; }
    .bb-muted   { color:#b0b8c4; }

    .bb-code-prefix { font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px;
                      margin-right:5px; background:#eef1f5; color:#475467; }
    .bb-code-prefix.PRI { background:#e3efff; color:#1d4ed8; }
    .bb-code-prefix.ECH { background:#efe7fd; color:#5b2bb5; }

    .bb-pat-code { font-size:11px; color:#667085;
                   background:#f2f4f7; padding:1px 6px; border-radius:4px; margin-right:6px; }
    .bb-pat-name { font-weight:600; color:#1d2939; }

    .bb-qty { min-width: 90px; }
    .bb-qty-txt { font-size:12px; }
    .bb-qty-bar { height:5px; background:#e5e9f0; border-radius:3px; margin-top:3px; overflow:hidden; }
    .bb-qty-bar > div { height:100%; border-radius:3px; }

    .bb-date { white-space:nowrap; font-variant-numeric: tabular-nums; }

    .bb-table td img { vertical-align: middle; opacity:.75; transition: opacity .15s, transform .15s; }
    .bb-table td a:hover img { opacity:1; transform: scale(1.2); }

    /* ---- CODE-BARRES (élément crucial : grand, lisible, aligné) ---- */
    .bb-table td.bb-cb-cell { white-space: nowrap; min-width: 220px; }
    .bb-cb-wrap { display:flex; align-items:center; gap:10px; }

    .bb-table .bb-cb-tag {
      flex: 0 0 ${LARGEUR_ETIQUETTE}px; width: ${LARGEUR_ETIQUETTE}px; box-sizing: border-box;
      display:inline-flex; align-items:center; justify-content:center; gap:5px;
      height: 20px; padding: 0 4px; border-radius: 4px;
      font-size: 10px !important; font-weight: 700; letter-spacing: .3px; line-height: 1;
      white-space: nowrap; text-decoration: none !important;
    }
    .bb-cb-tag::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; flex:none; }
    .bb-cb-tag.pri   { background:#e3efff; color:#1d4ed8; border:1px solid #b9d3fb; }
    .bb-cb-tag.ech   { background:#efe7fd; color:#5b2bb5; border:1px solid #d6c4f7; }
    .bb-cb-tag.libre { background:#fff1e0; color:#b45309; border:1px solid #f7cf9c; }

    .bb-table .bb-cb-code.bb-mono,
    .bb-table .bb-cb-code.bb-mono * {
      font-family: "Segoe UI", Roboto, Arial, sans-serif !important;
      font-size: 12px !important; line-height: 20px !important;
      font-weight: 400 !important; font-style: normal !important;
      letter-spacing: 0.1px !important; color: #344054 !important;
      font-variant-numeric: tabular-nums; text-decoration: none !important;
    }

    .bb-table .bb-cb-code.bb-mono .bb-cb-fort { font-weight: 700 !important; color: #000 !important; }
    .bb-table .bb-cb-code.bb-mono .bb-cb-ech  { font-weight: 700 !important; color: #d50000 !important; }
    .bb-table .bb-cb-code.bb-mono.bb-cb-libre { font-weight: 700 !important; color: #000 !important; }
    .bb-table a:hover .bb-cb-code.bb-mono { text-decoration: underline !important; }

    /* Liseré gauche de la cellule Code-barres selon le type */
    .bb-table tr.bb-cb-row-pri   td.bb-cb-cell { border-left:4px solid #5b9bf0 !important; }
    .bb-table tr.bb-cb-row-ech   td.bb-cb-cell { border-left:4px solid #b79bea !important; }
    .bb-table tr.bb-cb-row-libre td.bb-cb-cell { border-left:4px solid #f0a75a !important; }

    /* ---- RECHERCHE + FILTRES ---- */
    .bb-search-bar {
      display:flex; align-items:center; gap:12px; margin:10px 0; flex-wrap:wrap;
      font: 13px "Segoe UI", Roboto, Arial, sans-serif;
    }
    .bb-search-wrap { position:relative; flex: 0 1 380px; }
    .bb-search-wrap input {
      width:100%; box-sizing:border-box; padding:8px 30px 8px 12px;
      border:1px solid #cfd6e0; border-radius:8px; outline:none;
      font: 13px "Segoe UI", Roboto, Arial, sans-serif; background:#fff;
    }
    .bb-search-wrap input:focus { border-color:#2b7cff; box-shadow:0 0 0 3px rgba(43,124,255,.15); }
    .bb-search-clear {
      position:absolute; right:6px; top:50%; transform:translateY(-50%);
      border:none; background:transparent; color:#98a2b3; cursor:pointer;
      font-size:13px; display:none; padding:2px 6px;
    }
    .bb-search-clear:hover { color:#344054; }
    .bb-search-count { color:#667085; }

    .bb-type-filters { display:flex; gap:6px; }
    .bb-type-filters button {
      display:inline-flex; align-items:center; gap:6px;
      border:1px solid #cfd6e0; background:#fff; border-radius:999px; padding:5px 11px;
      cursor:pointer; font:12px "Segoe UI", Roboto, Arial, sans-serif; color:#344054;
    }
    .bb-type-filters button:hover { background:#f2f6fc; }
    .bb-type-filters button.active { background:#2f4a6d; color:#fff; border-color:#2f4a6d; }
    .bb-type-filters button .bb-nb { opacity:.7; }
    .bb-type-filters .bb-dot { width:8px; height:8px; border-radius:50%; }
    .bb-type-filters .bb-dot.pri   { background:#1d4ed8; }
    .bb-type-filters .bb-dot.ech   { background:#5b2bb5; }
    .bb-type-filters .bb-dot.libre { background:#b45309; }
  `);

  /* ================= INDEX DES COLONNES + TITRES COURTS ================= */
  const headers = [...headerRow.cells];

  const norm = s => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  // Remplace le texte d'un titre sans toucher au lien de tri
  function remplacerTitre(th, nouveau) {
    const walker = document.createTreeWalker(th, NodeFilter.SHOW_TEXT, {
      acceptNode: n => norm(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const noeuds = [];
    while (walker.nextNode()) noeuds.push(walker.currentNode);

    if (noeuds.length === 0) {
      th.appendChild(document.createTextNode(nouveau));
      return;
    }
    noeuds[0].nodeValue = nouveau;
    for (let i = 1; i < noeuds.length; i++) noeuds[i].nodeValue = '';
    th.querySelectorAll('br').forEach(br => br.remove());
  }

  const col = {};
  headers.forEach((th, i) => {
    const original = norm(th.textContent);
    if (original) col[original] = i;

    const court = TITRES_COURTS[original];
    if (court) {
      th.title = original;
      remplacerTitre(th, court);
      col[court] = i;
    }
  });

  // Recherche tolérante d'une colonne (ex. "Code-barres", "Code barre", "Code-barre")
  const trouverCol = re => {
    const i = headers.findIndex(th => re.test(norm(th.textContent)));
    return i >= 0 ? i : undefined;
  };

  const C = {
    code:      col['Code'],
    codeBarre: col['Code-barres'] ?? trouverCol(/^code[\s-]*barres?$/i),
    patient:   col['Patient'],
    type:      col['Type de ressource'],
    etatPrel:  col['Etat de prélèvement'] ?? col['Etat prélèv.'],
    emballage: col['Emballage'],
    cond:      col['Conditionnement'],
    reception: col['Date de réception ou de préparation'] ?? col['Réception / préparation'],
    prelev:    col['Date de prélèvement'] ?? col['Prélèvement'],
    stockage:  col['Date de Stockage'] ?? col['Stockage'],
    qty:       col['Quantité'],
    protocole: col['Protocoles'],
    collect:   col['Collections'],
    statut:    col['Statut'],
    etatInt:   col['Etat interne'],
  };

  /* ================= OUTILS ================= */
  const txt = td => (td ? td.textContent.replace(/\u00a0/g, ' ').trim() : '');

  function setBadge(td, cls) {
    if (!td) return;
    const t = txt(td);
    td.textContent = '';
    const s = document.createElement('span');
    if (!t || t === '-') { s.className = 'bb-muted'; s.textContent = '—'; }
    else { s.className = 'bb-badge ' + cls; s.textContent = t; }
    td.appendChild(s);
  }

  function pick(t, rules, def = 'bb-gray') {
    for (const [re, cls] of rules) if (re.test(t)) return cls;
    return def;
  }

  // Détermine le type d'un code-barre : 'ech', 'pri' ou 'libre'
  function typeCodeBarre(code) {
    const mE = code.match(RE_ECHANTILLON);
    if (mE) return { type: 'ech', parent: mE[1], suffixe: mE[2].toUpperCase() };
    if (RE_PRIMAIRE.test(code)) return { type: 'pri', parent: code };
    return { type: 'libre' };
  }

  // Ajoute "début normal" + "N derniers caractères en gras noir" dans un conteneur
  function ajouterAvecFin(conteneur, texte) {
    const n = Math.min(NB_CHIFFRES_GRAS, texte.length);
    const debut = texte.slice(0, texte.length - n);
    const fin = document.createElement('span');
    fin.className = 'bb-cb-fort';
    fin.textContent = texte.slice(texte.length - n);
    if (debut) conteneur.append(debut);
    conteneur.append(fin);
  }

  /* ================= COULEURS DES RESSOURCES =================
     Ordre important : "Sang total" est testé AVANT "Sang". */
  const REGLES_TYPE = [
    [/sang\s*total/i,           'bb-wine'],
    [/sang/i,                   'bb-red'],
    [/s[ée]rum/i,               'bb-amber'],
    [/plasma/i,                 'bb-orange'],
    [/urine/i,                  'bb-sky'],
    [/cellule|pbmc|azote|crb/i, 'bb-indigo'],
    [/selle/i,                  'bb-brown'],
    [/adn|arn|dna|rna/i,        'bb-purple'],
    [/tissu|biopsie/i,          'bb-teal']
  ];

  const REGLES_ETAT_PREL = [
    [/ambiante/i, 'bb-orange'], [/-80|congel/i, 'bb-blue'],
    [/\+?4\s*°|r[ée]frig/i, 'bb-teal'], [/azote|-196|-150/i, 'bb-indigo']
  ];

  /* ================= LIGNES DE DONNÉES =================
     On exclut la ligne d'en-tête et toute ligne contenant des <th>. */
  const rows = [...table.rows].filter(tr =>
    tr !== headerRow &&
    tr.closest('table') === table &&
    !tr.querySelector('th') &&
    tr.cells.length >= headers.length - 1
  );
  rows.forEach(tr => tr.classList.add('bb-row'));
  if (rows.length) rows[rows.length - 1].classList.add('bb-last');

  const compteTypes = { pri: 0, ech: 0, libre: 0 };

  /* ================= TRAITEMENT DES LIGNES ================= */
  rows.forEach(tr => {
    const c = tr.cells;

    // Code : préfixe PRI / ECH
    const codeLink = c[C.code]?.querySelector('a');
    if (codeLink) {
      const m = codeLink.textContent.trim().match(/^([A-Z]+)\.(.+)$/);
      if (m) {
        codeLink.textContent = '';
        const p = document.createElement('span');
        p.className = 'bb-code-prefix ' + m[1]; p.textContent = m[1];
        codeLink.append(p, m[2]);
      }
    }

    // Code-barres : type (primaire / échantillon / scanné) + mise en forme
    const cbTd = c[C.codeBarre];
    if (cbTd) {
      const brut = txt(cbTd);
      if (brut && brut !== '-') {
        const info = typeCodeBarre(brut);
        const def = TYPES_CODE[info.type];
        compteTypes[info.type]++;

        tr.classList.add('bb-cb-row-' + info.type);
        tr.dataset.cbType = info.type;
        cbTd.classList.add('bb-cb-cell');

        const tag = document.createElement('span');
        tag.className = 'bb-cb-tag ' + info.type;
        tag.title = def.titre;
        tag.textContent = def.label;

        const code = document.createElement('span');
        code.className = 'bb-cb-code bb-mono';

        if (info.type === 'ech') {
          // T2610 + 3914 (gras noir) + E01 (rouge gras)
          ajouterAvecFin(code, info.parent);
          const s = document.createElement('span');
          s.className = 'bb-cb-ech';
          s.textContent = info.suffixe;
          code.append(s);
          code.title = 'Ressource primaire : ' + info.parent;
        } else if (info.type === 'pri') {
          // T2610 + 4074 (gras noir)
          ajouterAvecFin(code, brut);
        } else {
          code.classList.add('bb-cb-libre');
          code.textContent = brut;
        }

        const wrap = document.createElement('div');
        wrap.className = 'bb-cb-wrap';

        // On conserve un éventuel lien existant dans la cellule
        const lien = cbTd.querySelector('a');
        if (lien) {
          lien.textContent = '';
          lien.append(code);
          wrap.append(tag, lien);
        } else {
          wrap.append(tag, code);
        }
        cbTd.textContent = '';
        cbTd.append(wrap);
      } else {
        cbTd.textContent = '';
        const s = document.createElement('span'); s.className = 'bb-muted'; s.textContent = '—';
        cbTd.append(s);
      }
    }

    // Patient : code + nom
    const patLink = c[C.patient]?.querySelector('a');
    if (patLink) {
      const m = patLink.textContent.trim().match(/^\[(.+?)\]\s*(.*)$/);
      if (m) {
        patLink.textContent = '';
        const code = document.createElement('span'); code.className = 'bb-pat-code'; code.textContent = m[1];
        const nom  = document.createElement('span'); nom.className  = 'bb-pat-name'; nom.textContent  = m[2];
        patLink.append(code, nom);
      }
    }

    const typeTxt = txt(c[C.type]);
    const etatIntTxt = txt(c[C.etatInt]);

    // Capsules sur les données
    setBadge(c[C.type], pick(typeTxt, REGLES_TYPE));
    setBadge(c[C.etatPrel], pick(txt(c[C.etatPrel]), REGLES_ETAT_PREL));
    setBadge(c[C.emballage], 'bb-gray');
    setBadge(c[C.cond], 'bb-gray');
    setBadge(c[C.protocole], 'bb-gray');
    setBadge(c[C.collect], 'bb-gray');
    setBadge(c[C.statut], 'bb-gray');

    // État interne : capsule + teinte de ligne
    const etat = ETATS.find(e => e.re.test(etatIntTxt)) || null;
    setBadge(c[C.etatInt], etat ? etat.cls : 'bb-gray');
    if (etat && etat.ligne) tr.classList.add('bb-etat-' + ETATS_TEINTES.indexOf(etat));

    [C.reception, C.prelev, C.stockage].forEach(i => c[i]?.classList.add('bb-date'));

    // Quantité : barre de progression
    const qtd = c[C.qty];
    if (qtd) {
      const m = txt(qtd).match(/([\d.,]+)\s*\/\s*([\d.,]+)\s*(\S*)/);
      if (m) {
        const cur = parseFloat(m[1].replace(',', '.')), tot = parseFloat(m[2].replace(',', '.'));
        const pct = tot ? Math.max(0, Math.min(100, cur / tot * 100)) : 0;
        const color = pct > 50 ? '#22a55a' : pct > 20 ? '#f0a020' : '#e5484d';
        qtd.textContent = '';
        qtd.classList.add('bb-qty');
        const t = document.createElement('div');
        t.className = 'bb-qty-txt';
        const b = document.createElement('b'); b.textContent = cur;
        const u = document.createElement('span'); u.style.color = '#98a2b3'; u.textContent = ` / ${tot} ${m[3]}`;
        t.append(b, ' ', u);
        const bar = document.createElement('div');
        bar.className = 'bb-qty-bar';
        const fill = document.createElement('div');
        fill.style.width = pct + '%'; fill.style.background = color;
        bar.append(fill);
        qtd.append(t, bar);
      }
    }

    // Clic sur la ligne = coche la case Panier
    const cb = tr.querySelector('input[type=checkbox][name=ids]');
    if (cb) {
      const sync = () => tr.classList.toggle('bb-selected', cb.checked);
      sync();
      cb.addEventListener('change', sync);
      tr.addEventListener('click', e => {
        if (e.target.closest('a, input, button, select, label')) return;
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  });

  /* ================= RECHERCHE ================= */
  const normaliser = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Index construit APRÈS le traitement + mots-clés du type de code-barre
  const index = rows.map(tr => {
    const parts = [];
    [...tr.cells].forEach(td => {
      if (td.querySelector('input[type=checkbox]')) return;
      const t = td.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
    });
    const typeCb = tr.dataset.cbType;
    if (typeCb) parts.push(TYPES_CODE[typeCb].motsCles);
    return normaliser(parts.join(' '));
  });

  const barre = document.createElement('div');
  barre.className = 'bb-search-bar';
  barre.innerHTML = `
    <div class="bb-search-wrap">
      <input type="text" placeholder="🔍 Rechercher (patient, code, ressource, protocole…)" autocomplete="off" spellcheck="false">
      <button type="button" class="bb-search-clear" title="Effacer (Échap)">✕</button>
    </div>
    <div class="bb-type-filters">
      <button type="button" data-type="" class="active">Tous<span class="bb-nb">(${rows.length})</span></button>
      <button type="button" data-type="pri"><span class="bb-dot pri"></span>Primaires<span class="bb-nb">(${compteTypes.pri})</span></button>
      <button type="button" data-type="ech"><span class="bb-dot ech"></span>Échantillons<span class="bb-nb">(${compteTypes.ech})</span></button>
      <button type="button" data-type="libre"><span class="bb-dot libre"></span>Scannés<span class="bb-nb">(${compteTypes.libre})</span></button>
    </div>
    <span class="bb-search-count"></span>
  `;

  // Masque les filtres si la colonne Code-barres est absente
  if (C.codeBarre === undefined) barre.querySelector('.bb-type-filters').style.display = 'none';

  // Place la barre au-dessus du tableau, hors de tout conteneur de tableau
  let cible = table;
  const tableParent = table.parentElement.closest('table');
  if (tableParent) cible = tableParent;
  cible.parentNode.insertBefore(barre, cible);

  const champ = barre.querySelector('input');
  const effacer = barre.querySelector('.bb-search-clear');
  const compteur = barre.querySelector('.bb-search-count');
  const boutonsType = [...barre.querySelectorAll('.bb-type-filters button')];

  let filtreType = '';

  function filtrer() {
    const mots = normaliser(champ.value).split(/\s+/).filter(Boolean);
    let visibles = 0;
    rows.forEach((tr, i) => {
      const ok = mots.every(m => index[i].includes(m))
              && (!filtreType || tr.dataset.cbType === filtreType);
      tr.classList.toggle('bb-hidden-row', !ok);
      if (ok) visibles++;
    });
    effacer.style.display = champ.value ? 'block' : 'none';
    compteur.textContent = (mots.length || filtreType)
      ? `${visibles} / ${rows.length} ligne(s)`
      : `${rows.length} ligne(s)`;
  }

  boutonsType.forEach(btn => {
    btn.addEventListener('click', () => {
      filtreType = btn.dataset.type;
      boutonsType.forEach(b => b.classList.toggle('active', b === btn));
      filtrer();
    });
  });

  champ.addEventListener('input', filtrer);
  effacer.addEventListener('click', () => { champ.value = ''; filtrer(); champ.focus(); });
  champ.addEventListener('keydown', e => {
    if (e.key === 'Escape') { champ.value = ''; filtrer(); }
  });

  // Ctrl+F : curseur dans la recherche (2e appui = recherche du navigateur)
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && document.activeElement !== champ) {
      e.preventDefault();
      champ.focus();
      champ.select();
    }
  });

  filtrer();
})();
