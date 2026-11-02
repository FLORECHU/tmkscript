// ==UserScript==
// @name         RAPPORT BIRT : Mise en forme cession
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.3
// @description  Met en évidence les lignes dont le titre contient "CESSION _"
// @author       Flo
// @include      *ListReportTemplates.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Rapport_Cession.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Rapport_Cession.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ===== Configuration =====

  const COULEURS = {
    cession: { odd: '#efe3f8', even: '#e0ccf0', bord: '#9b6fc9', pastille: '#b794d6' }, // violet
    rq:      { odd: '#e6f6e9', even: '#d0ecd6', bord: '#4fae65', pastille: '#6cc283' }, // vert
    rqna:    { odd: '#ffeddc', even: '#ffdab8', bord: '#ee8a2b', pastille: '#f5a458' }  // orange
  };

  // La première règle qui correspond l'emporte (RQNA avant RQ)
  const REGLES = [
    { classe: 'hl-rqna',    regex: /\[\s*RQNA\s*\]/i },
    { classe: 'hl-rq',      regex: /\[\s*RQ\s*\]/i },
    { classe: 'hl-cession', regex: /CESSION/i }
  ];

  // Ordre d'affichage dans la légende
  const LEGENDE = [
    { cle: 'cession', texte: 'Rapport lié aux cessions' },
    { cle: 'rqna',    texte: 'Export de données incluant des données patientes' },
    { cle: 'rq',      texte: "Export de données n'incluant pas de données patientes" }
  ];

  const CLASSE_OPTIONS = 'boutons-optionnels'; // posée sur <html>

  // ===== CSS =====

  function cssCategorie(classe, c) {
    return `
      table#template tr.${classe}.odd,
      table#template tr.${classe}.odd > td {
        background: ${c.odd} !important;
        background-color: ${c.odd} !important;
        background-image: none !important;
      }
      table#template tr.${classe}.even,
      table#template tr.${classe}.even > td {
        background: ${c.even} !important;
        background-color: ${c.even} !important;
        background-image: none !important;
      }
      table#template tr.${classe} > td:first-child {
        border-left: 6px solid ${c.bord} !important;
      }
    `;
  }

  function injecterStyle() {
    if (document.getElementById('style-biobank-perso')) return;

    const style = document.createElement('style');
    style.id = 'style-biobank-perso';
    style.textContent =
      cssCategorie('hl-cession', COULEURS.cession) +
      cssCategorie('hl-rq',      COULEURS.rq) +
      cssCategorie('hl-rqna',    COULEURS.rqna) +
      `
      /* ===== Uniformisation du tableau ===== */
      table#template tbody tr.odd > td,
      table#template tbody tr.even > td {
        height: 30px !important;
        padding-top: 4px !important;
        padding-bottom: 4px !important;
        vertical-align: middle !important;
        line-height: 1.3 !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.10) !important;
        box-sizing: border-box;
      }

      table#template tbody tr > td:first-child {
        padding-left: 10px !important;
        white-space: nowrap;
      }

      table#template td.ItemListAction {
        text-align: center !important;
        width: 60px;
        white-space: nowrap;
      }
      table#template td.ItemListAction img {
        vertical-align: middle;
      }

      /* Lignes sans catégorie : alternance blanc / gris clair */
      table#template tbody tr.odd:not(.hl-cession):not(.hl-rq):not(.hl-rqna) > td {
        background: #ffffff !important;
      }
      table#template tbody tr.even:not(.hl-cession):not(.hl-rq):not(.hl-rqna) > td {
        background: #f3f5f7 !important;
      }

      /* Liseré transparent sur les lignes neutres => noms alignés */
      table#template tbody tr:not(.hl-cession):not(.hl-rq):not(.hl-rqna) > td:first-child {
        border-left: 6px solid transparent !important;
      }

      /* Survol */
      table#template tbody tr:hover > td {
        filter: brightness(0.96);
      }

      /* ===== Légende ===== */
      #legende-couleurs {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 22px;
        margin: 8px 0 10px 0;
        padding: 6px 12px;
        background: #ffffff;
        border: 1px solid #9a9a9a;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        font-size: 13px;
        line-height: 1.2;
      }
      #legende-couleurs .legende-titre {
        font-size: 13px;
        font-weight: bold;
        color: #222;
      }
      #legende-couleurs .legende-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #111;
      }
      #legende-couleurs .legende-pastille {
        display: inline-block;
        width: 30px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.35);
        border-left-width: 6px;
        box-sizing: border-box;
        flex-shrink: 0;
      }
      #legende-couleurs .legende-options {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding-left: 14px;
        border-left: 1px solid #ccc;
        cursor: pointer;
        user-select: none;
        color: #111;
      }
      #legende-couleurs .legende-options input {
        margin: 0;
        cursor: pointer;
      }

      /* ===== Boutons optionnels (Supprimer + Afficher) masqués par défaut ===== */
      html:not(.${CLASSE_OPTIONS}) a[href*="method=Supprimer"],
      html:not(.${CLASSE_OPTIONS}) a[href*="method=Afficher"],
      html:not(.${CLASSE_OPTIONS}) a:has(> img[src*="fff_report_delete"]),
      html:not(.${CLASSE_OPTIONS}) a:has(> img[src*="fff_report_magnify"]) {
        display: none !important;
      }
      `;

    (document.head || document.documentElement).appendChild(style);
  }

  // ===== Légende =====

  function creerLegende() {
    if (document.getElementById('legende-couleurs')) return;

    const table = document.querySelector('table#template');
    if (!table || !table.parentNode) return;

    const div = document.createElement('div');
    div.id = 'legende-couleurs';

    const titre = document.createElement('span');
    titre.className = 'legende-titre';
    titre.textContent = 'Légende :';
    div.appendChild(titre);

    LEGENDE.forEach(function (entree) {
      const c = COULEURS[entree.cle];

      const item = document.createElement('span');
      item.className = 'legende-item';

      const pastille = document.createElement('span');
      pastille.className = 'legende-pastille';
      pastille.style.background = c.pastille;
      pastille.style.borderLeftColor = c.bord;

      item.appendChild(pastille);
      item.appendChild(document.createTextNode(entree.texte));
      div.appendChild(item);
    });

    // Case à cocher : visibilité des boutons optionnels (FALSE par défaut)
    const label = document.createElement('label');
    label.className = 'legende-options';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'chk-boutons-optionnels';
    checkbox.checked = document.documentElement.classList.contains(CLASSE_OPTIONS);
    checkbox.addEventListener('change', function () {
      document.documentElement.classList.toggle(CLASSE_OPTIONS, checkbox.checked);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode('Visibilité boutons optionnels'));
    div.appendChild(label);

    table.parentNode.insertBefore(div, table);
  }

  // ===== Surlignage des lignes =====

  function surligner() {
    document.querySelectorAll('table#template tr').forEach(function (tr) {
      const td = tr.querySelector('td');
      if (!td) return;
      const texte = td.textContent;

      for (const regle of REGLES) {
        if (regle.regex.test(texte)) {
          tr.classList.add(regle.classe);
          break; // une seule mise en forme par ligne
        }
      }
    });
  }

  // ===== Exécution =====

  function appliquer() {
    injecterStyle();
    surligner();
    creerLegende();
  }

  appliquer();
  setTimeout(appliquer, 500);
  setTimeout(appliquer, 1500);
  setTimeout(appliquer, 3000);

  // Si la page est modifiée dynamiquement, on réapplique
  let timer = null;
  new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(appliquer, 200);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
