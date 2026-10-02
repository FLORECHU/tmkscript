// ==UserScript==
// @name         LISTE DES RESSOURCES : Lignes sélectionnées jaunes
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.5
// @description  Colore les lignes sélectionnées en jaune
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/ListSamplesSearch.do?*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/ListeRessources_SelectionLigne.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/ListeRessources_SelectionLigne.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    /* ------------------------------------------------------------------
     *  RÉGLAGES — modifie uniquement ces valeurs si besoin
     * ------------------------------------------------------------------ */
    const COULEUR_FOND       = '#ffe9a8';   // jaune doux (ligne cochée)
    const COULEUR_BORDURE    = '#e0a800';   // liseré à gauche (ligne cochée)
    const COULEUR_HOVER      = '#fff3cd';   // jaune clair (survol, non cochée)
    const COULEUR_HOVER_COCHE= '#ffdf7e';   // jaune plus soutenu (survol + cochée)
    const GRAS               = false;       // true pour mettre le texte en gras
    const NOM_CHECKBOX       = 'ids';       // attribut name des cases à cocher
    /* ------------------------------------------------------------------ */

    const CLASSE = 'tm-ligne-cochee';

    /* 1 --- Styles ---------------------------------------------------- */
    GM_addStyle(`
        /* Ligne cochée */
        tr.${CLASSE} > td {
            background-color: ${COULEUR_FOND} !important;
            ${GRAS ? 'font-weight: 600;' : ''}
        }
        tr.${CLASSE} > td:first-child {
            box-shadow: inset 4px 0 0 ${COULEUR_BORDURE};
        }

        /* Survol d'une ligne NON cochée */
        table tr:hover > td {
            background-color: ${COULEUR_HOVER} !important;
        }

        /* Survol d'une ligne COCHÉE : couleur distincte pour garder le repère visuel */
        table tr.${CLASSE}:hover > td {
            background-color: ${COULEUR_HOVER_COCHE} !important;
        }
    `);

    /* 2 --- Utilitaires ----------------------------------------------- */
    function trParent(el) {
        while (el && el.tagName !== 'TR') el = el.parentElement;
        return el;
    }

    function majLigne(cb) {
        const tr = trParent(cb);
        if (!tr) return;
        tr.classList.toggle(CLASSE, cb.checked);
    }

    function majTout() {
        document
            .querySelectorAll(`input[type="checkbox"][name="${NOM_CHECKBOX}"]`)
            .forEach(majLigne);
    }

    /* 3 --- Événements ------------------------------------------------- */
    document.addEventListener('change', function (e) {
        const t = e.target;
        if (t && t.type === 'checkbox' && t.name === NOM_CHECKBOX) {
            majLigne(t);
        }
    }, true);

    document.addEventListener('click', function (e) {
        const t = e.target;
        if (t && (t.type === 'checkbox' || t.tagName === 'A' || t.tagName === 'BUTTON')) {
            setTimeout(majTout, 0);
        }
    }, true);

    /* 4 --- Tableau rechargé en AJAX / pagination ---------------------- */
    const observer = new MutationObserver(function () {
        clearTimeout(observer._t);
        observer._t = setTimeout(majTout, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    /* 5 --- Initialisation --------------------------------------------- */
    majTout();

})();
