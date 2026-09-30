// ==UserScript==
// @name         RECEPTION : Regle numero de randomisation
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.2
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
            <div style="display:flex;align-items:flex-start;gap:6px;">
                <span style="font-size:16px;line-height:1;">⚠️</span>
                <div>
                    <div>✅ <strong>Si déjà inclus</strong> : récupérer le numéro déjà existant</div>
                    <div>🆕 <strong>Si nouveau patient</strong> : pas d'initiale, mettre les <u>3 premières lettres</u> du protocole</div>
                </div>
            </div>
        `;
        label.style.cssText = [
            'display:block',
            'margin-bottom:8px',
            'padding:8px 10px',
            'background:linear-gradient(135deg, #FFF9C4, #FFEB3B)',
            'color:#3E2723',
            'font-size:12px',
            'font-weight:500',
            'line-height:1.5',
            'border:2px solid #F9A825',
            'border-radius:6px',
            'box-shadow:0 2px 4px rgba(0,0,0,0.15)',
            'max-width:420px'
        ].join(';');

        input.parentNode.insertBefore(label, input);
        input.parentNode.insertBefore(document.createElement('br'), input);
    }

    ajouterLabel();

    new MutationObserver(ajouterLabel)
        .observe(document.documentElement, { childList: true, subtree: true });
})();
