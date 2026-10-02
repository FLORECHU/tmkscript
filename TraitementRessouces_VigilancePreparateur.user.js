// ==UserScript==
// @name         TRAITEMENT DES RESSOURCES : Gestion du "Préparateur"
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.1.0
// @description  Bloque la création si le champ assistant n'est pas rempli, et vide le champ uniquement à la première entrée sur la page (pas au refresh)
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/SampleTreatment.do*
// @updateURL    https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/TraitementRessouces_VigilancePreparateur.user.js
// @downloadURL  https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/TraitementRessouces_VigilancePreparateur.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ID_BOUTON = 'createButton';
    const CLE_SESSION = 'TMK_assistant_deja_vide'; // marqueur de première entrée

    function estRempli() {
        const id  = document.getElementById('assistantId'); // champ hidden = ID métier
        const txt = document.getElementById('assistant');   // champ texte visible

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

    function viderAssistant() {
        const txt        = document.getElementById('assistant');
        const id         = document.getElementById('assistantId');
        const saveAssist = document.getElementById('saveassistant');

        if (txt)        txt.value = '';
        if (id)         id.value  = '';
        if (saveAssist) saveAssist.value = '';

        majEtatBouton();
    }

    function estUnRechargement() {
        // API moderne (recommandée)
        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
            return entries[0].type === 'reload';
        }
        // Fallback pour anciens navigateurs
        if (performance.navigation) {
            return performance.navigation.type === performance.navigation.TYPE_RELOAD;
        }
        return false;
    }

    // Blocage au clic, en phase de capture
    document.addEventListener('click', e => {
        const btn = e.target.closest('#' + ID_BOUTON);
        if (btn && !estRempli()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            alert('Veuillez renseigner le champ assistant');
        }
    }, true);

    // --- Logique de première entrée vs actualisation ---
    const dejaMarque = sessionStorage.getItem(CLE_SESSION) === '1';
    const reload = estUnRechargement();

    if (!dejaMarque && !reload) {
        // Première entrée réelle dans la page (pas un refresh)
        viderAssistant();
        sessionStorage.setItem(CLE_SESSION, '1');
    } else {
        // Refresh ou entrée déjà marquée : on ne touche pas au champ
        majEtatBouton();
    }

    // Polling simple pour maintenir l'état du bouton synchronisé
    setInterval(majEtatBouton, 300);
})();
