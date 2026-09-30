// ==UserScript==
// @name         GESTIONNAIRE STOCKAGE : Case à cocher
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.2
// @description  Case à cocher pour marquer les boites
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/StorageBrowser.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/GestionnaireStockage_CaseACocher.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/GestionnaireStockage_CaseACocher.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SEL   = 'div.storage-container-box';
    const LS_ST = 'stBoxChk.state';

    let state = {};
    try { state = JSON.parse(localStorage.getItem(LS_ST) || '{}'); } catch (e) {}
    const save = () => localStorage.setItem(LS_ST, JSON.stringify(state));

    const css = document.createElement('style');
    css.id = 'st-style';
    css.textContent = `
        input.st-chk {
            display: inline-block !important;
            visibility: visible !important;
            width: 13px !important; height: 13px !important;
            margin: 0 5px 0 0 !important; padding: 0 !important;
            vertical-align: middle !important;
            position: static !important; opacity: 1 !important;
            cursor: pointer;
        }
        div.storage-container-box.st-done > span:not(.storage-card) {
            font-style: italic; color: #777;
        }
    `;
    (document.head || document.documentElement).appendChild(css);

    function keyOf(box) {
        const cls = [...box.classList].find(c => /^storage-container-\d+$/.test(c));
        if (cls) return cls;
        const t = box.querySelector('span');
        return 'txt:' + (t ? t.textContent.trim() : '?');
    }

    function decorate(box) {
        if (box.querySelector(':scope > input.st-chk')) return;

        const key = keyOf(box);
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'st-chk';
        chk.checked = !!state[key];
        box.classList.toggle('st-done', chk.checked);

        ['click', 'mousedown', 'dblclick'].forEach(ev =>
            chk.addEventListener(ev, e => e.stopPropagation())
        );

        chk.addEventListener('change', () => {
            state[key] = chk.checked;
            if (!chk.checked) delete state[key];
            box.classList.toggle('st-done', chk.checked);
            save();
        });

        box.insertBefore(chk, box.firstChild);
    }

    function scan() {
        document.querySelectorAll(SEL).forEach(decorate);
    }

    new MutationObserver(() => scan())
        .observe(document.documentElement, { childList: true, subtree: true });

    function boot() {
        scan();
        console.log('[ST] actif —', document.querySelectorAll(SEL).length, 'boîtes');
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', boot)
        : boot();
})();
