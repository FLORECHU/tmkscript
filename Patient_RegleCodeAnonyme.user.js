// ==UserScript==
// @name         PATIENT : Regle code anonyme
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Regle code anonyme
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/CreatePatient.do?*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Patient_RegleCodeAnonyme.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Patient_RegleCodeAnonyme.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TEXTE = 'Code du patient + Trois premières lettres du protocole';

    function ajouterLabel() {
        const input = document.getElementById('codeAnonymous');
        if (!input) return;
        if (document.getElementById('labelCodeAnonymous')) return;

        const label = document.createElement('label');
        label.id = 'labelCodeAnonymous';
        label.setAttribute('for', 'codeAnonymous');
        label.textContent = TEXTE;
        label.style.cssText = [
            'display:inline-block',
            'margin-bottom:4px',
            'padding:2px 6px',
            'background-color:#FFFF00',   // surlignage jaune
            'color:#000',
            'font-size:11px',
            'font-weight:bold',
            'white-space:nowrap',
            'border-radius:3px',
            'line-height:1.4'
        ].join(';');

        // On insère le label puis un retour à la ligne avant l'input
        input.parentNode.insertBefore(label, input);
        input.parentNode.insertBefore(document.createElement('br'), input);
    }

    ajouterLabel();

    new MutationObserver(ajouterLabel)
        .observe(document.documentElement, { childList: true, subtree: true });
})();
