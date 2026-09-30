// ==UserScript==
// @name         RECEPTION : Regle numero de randomisation
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.1
// @description  Regle pour la saisie du numéro de randomisation
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/ResourceReceipt.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Reception_RegleNumRandomisation.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Reception_RegleNumRandomisation.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TEXTE = `Si déjà inclus on récupère le numéro déjà existant
Si nouveau patient, pas d'initiale et mettre les 3 premières lettres du protocole.`;

    function ajouterLabel() {
        const input = document.querySelector('input[name="randomizationNumber"]');
        if (!input) return;
        if (document.getElementById('labelRandomizationNumber')) return;

        const label = document.createElement('label');
        label.id = 'labelRandomizationNumber';
        label.textContent = TEXTE;
        label.style.cssText = [
            'display:inline-block',
            'margin-bottom:4px',
            'padding:2px 6px',
            'background-color:#FFFF00',
            'color:#000',
            'font-size:11px',
            'font-weight:bold',
            'white-space:pre-line',
            'border-radius:3px',
            'line-height:1.4'
        ].join(';');

        input.parentNode.insertBefore(label, input);
        input.parentNode.insertBefore(document.createElement('br'), input);
    }

    ajouterLabel();

    new MutationObserver(ajouterLabel)
        .observe(document.documentElement, { childList: true, subtree: true });
})();
