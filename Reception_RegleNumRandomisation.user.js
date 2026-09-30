// ==UserScript==
// @name         RECEPTION : Regle numero de randomisation
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.3
// @description  Regle pour la saisie du numéro de randomisation
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/ResourceReceipt.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Reception_RegleNumRandomisation.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Reception_RegleNumRandomisation.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function ajouterLabel() {
        const input = document.querySelector('input[name="randomizationNumber"]');
        if (!input) return;
        if (document.getElementById('labelRandomizationNumber')) return;

        const label = document.createElement('div');
        label.id = 'labelRandomizationNumber';
        label.innerHTML = `
            <div style="margin-bottom:2px;"> <strong style="color:#2E7D32;">Si déjà inclus</strong> : récupérer le numéro déjà existant</div>
            <div style="margin-bottom:2px;"> <strong style="color:#1565C0;">Si nouveau patient</strong> : pas d'initiale, mettre les <u>3 premières lettres</u> du protocole</div>
            <div> <strong style="color:#C62828;">Si code attribué par l'étude</strong> : prendre leur code sans poser de question, initiale ou pas</div>
        `;
        label.style.cssText = [
            'display:block',
            'margin-bottom:6px',
            'font-size:12px',
            'font-weight:500',
            'line-height:1.6',
            'color:#333',
            'max-width:480px'
        ].join(';');

        input.parentNode.insertBefore(label, input);
        input.parentNode.insertBefore(document.createElement('br'), input);
    }

    ajouterLabel();

    new MutationObserver(ajouterLabel)
        .observe(document.documentElement, { childList: true, subtree: true });
})();
