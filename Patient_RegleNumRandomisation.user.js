// ==UserScript==
// @name         RECEPTION : Règle n° de randomisation
// @namespace    http://tampermonkey.net/
// @version      2026-09-01
// @description  try to take over the world!
// @author       You
// @match        http://svm-crbbio/TD-Biobank/ResourceReceipt.do
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mammouth.ai
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TEXTE = 'Code patient + 3 premières lettres protocole';   // ← adaptez le texte ici

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
            'white-space:nowrap',
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
