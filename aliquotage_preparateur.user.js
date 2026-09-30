// ==UserScript==
// @name         ALIQUOTAGE : Gestion du "Préparateur"
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Bloque la création si le champ assistant n'est pas rempli, et vide le champ au chargement
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/SampleTreatment.do*
// @updateURL    https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/aliquotage_preparateur.user.js
// @downloadURL  https://github.com/FLORECHU/tmkscript/raw/refs/heads/main/aliquotage_preparateur.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ID_BOUTON = 'createButton';

    function estRempli() {
        const id  = document.getElementById('assistantId'); // champ hidden = ID métier
        const txt = document.getElementById('assistant');   // champ texte visible

        // priorité au champ hidden qui porte l'ID métier
        if (id) {
            const v = (id.value || '').trim();
            return v !== '' && v !== '0' && v !== '';
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

        if (txt)        txt.value = '';        // vide le champ visible
        if (id)         id.value  = '';       // remet l'ID à "pas de sélection"
        if (saveAssist) saveAssist.value = '';  // vide la sauvegarde texte

        majEtatBouton(); // met à jour l'état du bouton immédiatement
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

    // Vide le champ assistant dès le chargement de la page
    viderAssistant();

    // Polling simple : aucun risque de casser l'input
    setInterval(majEtatBouton, 300);
    majEtatBouton();
})();
