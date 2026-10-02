// ==UserScript==
// @name         STOCKAGE : Surbrillance recherche
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Ajoute un champ de recherche dans le <th> et colore les options de #containers
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/StoreSamples.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Stockage_RechercheSurbrillance.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Stockage_RechercheSurbrillance.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    function init() {
        if (document.getElementById('tm-search-input')) return; // anti-doublon

        const selectElement = document.getElementById('containers');
        if (!selectElement) return;

        // --- Trouver le <th> cible ---
        // On part du select et on remonte à la ligne <tr>, puis on prend son <th>
        const tr = selectElement.closest('tr');
        let th = tr ? tr.querySelector('th') : null;

        // Repli : on cherche le <th> contenant le span .boxLabel
        if (!th) {
            const lbl = document.querySelector('th .boxLabel');
            if (lbl) th = lbl.closest('th');
        }

        // Dernier repli : on se colle juste avant le select
        const cible = th || selectElement.parentNode;

        // --- Construire le champ ---
        const wrap = document.createElement('span');
        wrap.style.cssText = 'display:inline-block;margin-left:8px;white-space:nowrap';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'tm-search-input';
        input.placeholder = 'Rechercher...';
        input.autocomplete = 'off';
        input.style.cssText = 'padding:2px 4px;width:140px;border:1px solid #999;' +
                              'border-radius:3px;font:12px Arial,sans-serif;vertical-align:middle';

        const info = document.createElement('span');
        info.id = 'tm-search-info';
        info.style.cssText = 'margin-left:6px;font:11px Arial,sans-serif;color:#555;vertical-align:middle';

        wrap.appendChild(input);
        wrap.appendChild(info);

        if (th) {
            th.appendChild(wrap);
        } else {
            selectElement.parentNode.insertBefore(wrap, selectElement);
        }

        // --- Coloration ---
        function colorier(texte) {
            const q = texte.trim().toLowerCase();
            const opts = selectElement.options;
            let nb = 0;

            for (let i = 0; i < opts.length; i++) {
                const o = opts[i];
                o.style.color = '';
                o.style.backgroundColor = '';
                o.style.fontWeight = '';

                if (q && o.textContent.toLowerCase().indexOf(q) !== -1) {
                    o.style.color = '#c00000';
                    o.style.backgroundColor = '#ffe08a';
                    o.style.fontWeight = 'bold';
                    nb++;
                }
            }

            info.textContent = q ? (nb + ' / ' + opts.length) : '';
        }

        input.addEventListener('input', function (e) {
            colorier(e.target.value);
        });

        // Empêche la touche Entrée de soumettre le formulaire de la page
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') e.preventDefault();
        });
    }

    // --- Attendre que #containers existe ---
    function attendre() {
        if (document.getElementById('containers')) { init(); return; }
        const obs = new MutationObserver(function () {
            if (document.getElementById('containers')) {
                obs.disconnect();
                init();
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(function () { obs.disconnect(); }, 20000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attendre);
    } else {
        attendre();
    }
})();
