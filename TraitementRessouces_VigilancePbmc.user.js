// ==UserScript==
// @name         TRAITEMENT DES RESSOURCES : Vigilance PBMC
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Aide au technicien sur la saisie des PBMC
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/SampleTreatment.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/TraitementRessouces_VigilancePbmc.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/TraitementRessouces_VigilancePbmc.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ID de la valeur "Cellule azote CRB" dans resourceTypeId
    const CELLULE_AZOTE_CRB_ID = '42';

    // Liste des IDs correspondant aux méthodes PBMC dans preparationMethodId
    const PBMC_IDS = ['8', '6', '7', '11', '10', '18', '15', '16', '12'];

    // Couleur rouge douce
    const COULEUR_ALERTE = '#FC846A'; // rouge pastel léger
    //const COULEUR_ALERTE = '#ffe0e0'; // rouge pastel léger
    //const COULEUR_ALERTE = '#ff9999'; // rouge pastel léger
    //const COULEUR_ALERTE = '#f8d7da'; // rouge pastel léger

    function checkAndHighlight() {
        const resourceTypeSelect = document.getElementById('resourceTypeId');
        const preparationMethodSelect = document.querySelector('select[name="preparationMethodId"]');

        if (!resourceTypeSelect || !preparationMethodSelect) {
            return;
        }

        const resourceTypeValue = resourceTypeSelect.value;
        const preparationMethodValue = preparationMethodSelect.value;

        const isCelluleAzoteCRB = resourceTypeValue === CELLULE_AZOTE_CRB_ID;
        const hasPBMC = PBMC_IDS.includes(preparationMethodValue);

        if (isCelluleAzoteCRB && !hasPBMC) {
            resourceTypeSelect.style.backgroundColor = COULEUR_ALERTE;
            preparationMethodSelect.style.backgroundColor = COULEUR_ALERTE;
        } else {
            resourceTypeSelect.style.backgroundColor = '';
            preparationMethodSelect.style.backgroundColor = '';
        }
    }

    function init() {
        const resourceTypeSelect = document.getElementById('resourceTypeId');
        const preparationMethodSelect = document.querySelector('select[name="preparationMethodId"]');

        if (resourceTypeSelect && preparationMethodSelect) {
            checkAndHighlight();

            resourceTypeSelect.addEventListener('change', checkAndHighlight);
            preparationMethodSelect.addEventListener('change', checkAndHighlight);
        } else {
            setTimeout(init, 500);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    const observer = new MutationObserver(() => {
        checkAndHighlight();
    });

    const targetNode = document.body;
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }

})();
