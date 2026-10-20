// ==UserScript==
// @name         TRAITEMENT DES RESSOURCES : Gestion du "Préparateur"
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.2.0
// @description  Bloque la création si le champ assistant n'est pas rempli. Vide le champ à l'arrivée sur une nouvelle ressource, puis conserve la saisie tant qu'on reste sur la même ressource.
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/SampleTreatment.do*
// @updateURL    https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/TraitementRessouces_VigilancePreparateur.user.js
// @downloadURL  https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/TraitementRessouces_VigilancePreparateur.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ID_BOUTON = 'createButton';
    const CLE_SESSION = 'TMK_assistant_data';

    // --- Ressource courante (depuis l'URL) ---
    const resourceId = new URLSearchParams(location.search).get('resourceId') || 'inconnue';

    // --- Accès au stockage : { resourceId, assistant, assistantId, saveassistant } ---
    function lireStock() {
        try { return JSON.parse(sessionStorage.getItem(CLE_SESSION)) || null; }
        catch (e) { return null; }
    }
    function ecrireStock(obj) {
        sessionStorage.setItem(CLE_SESSION, JSON.stringify(obj));
    }

    // --- Champs ---
    const champs = () => ({
        txt:  document.getElementById('assistant'),
        id:   document.getElementById('assistantId'),
        save: document.getElementById('saveassistant')
    });

    function estRempli() {
        const { txt, id } = champs();
        if (id) {
            const v = (id.value || '').trim();
            return v !== '' && v !== '0';
        }
        return txt ? txt.value.trim() !== '' : true;
    }

    function majEtatBouton() {
        const bouton = document.getElementById(ID_BOUTON);
        if (!bouton) return;
        const ok = estRempli();
        bouton.disabled = !ok;
        bouton.style.opacity = ok ? '1' : '0.45';
        bouton.style.cursor  = ok ? 'pointer' : 'not-allowed';
        bouton.title = ok ? '' : 'Veuillez renseigner le champ assistant';
    }

    function vider() {
        const { txt, id, save } = champs();
        if (txt)  txt.value  = '';
        if (id)   id.value   = '';
        if (save) save.value = '';
    }

    function appliquer(data) {
        const { txt, id, save } = champs();
        if (txt)  txt.value  = data.assistant   || '';
        if (id)   id.value   = data.assistantId || '';
        if (save) save.value = data.saveassistant || '';
    }

    function capturer() {
        const { txt, id, save } = champs();
        return {
            resourceId,
            assistant:     txt  ? txt.value  : '',
            assistantId:   id   ? id.value   : '',
            saveassistant: save ? save.value : ''
        };
    }

    // --- Blocage au clic (phase de capture) ---
    document.addEventListener('click', e => {
        const btn = e.target.closest('#' + ID_BOUTON);
        if (btn && !estRempli()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            alert('Veuillez renseigner le champ assistant');
        }
    }, true);

    // --- Initialisation ---
    const stock = lireStock();

    if (!stock || stock.resourceId !== resourceId) {
        // Nouvelle ressource : on repart de zéro
        vider();
        ecrireStock({ resourceId, assistant: '', assistantId: '', saveassistant: '' });
    } else if (stock.assistantId && stock.assistantId !== '0') {
        // Même ressource et une valeur a déjà été saisie : on la restaure
        appliquer(stock);
    } else {
        // Même ressource mais rien saisi encore : on laisse vide
        vider();
    }

    // --- Surveillance : mémorise la saisie dès qu'elle change ---
    let derniere = JSON.stringify(capturer());

    setInterval(() => {
        majEtatBouton();

        // On ne mémorise que si une vraie valeur est présente,
        // pour ne pas écraser la saisie avec du vide
        if (estRempli()) {
            const actuelle = JSON.stringify(capturer());
            if (actuelle !== derniere) {
                derniere = actuelle;
                ecrireStock(capturer());
            }
        }
    }, 300);
})();
