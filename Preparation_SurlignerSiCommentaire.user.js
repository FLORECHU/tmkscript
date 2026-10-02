// ==UserScript==
// @name         PREPARATION : Surligner échantillons avec commentaire
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.1
// @description  Colore en jaune pâle les tables ItemList dont une ressource porte un commentaire
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/CreatePatient.do?*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Preparation_SurlignerSiCommentaire.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Preparation_SurlignerSiCommentaire.user.js
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const COLOR = '#fffbcc';
    const CLASSE = 'tm-note-hl';

    GM_addStyle(`
        table.ItemList.${CLASSE},
        table.ItemList.${CLASSE} tr,
        table.ItemList.${CLASSE} td,
        table.ItemList.${CLASSE} th {
            background-color: ${COLOR} !important;
        }
    `);

    function isVisible(img) {
        if (!img) return false;
        return window.getComputedStyle(img).display !== 'none' &&
               (img.offsetParent !== null || img.getClientRects().length > 0);
    }

    function clearAll() {
        document.querySelectorAll('table.' + CLASSE).forEach(t => {
            t.classList.remove(CLASSE);
        });
    }

    function refresh() {
        clearAll();

        document.querySelectorAll('img[src*="fff_note.gif"]').forEach(img => {
            if (!isVisible(img)) return;

            let table = img.closest('table.ItemList');
            while (table) {
                const parent = table.parentElement &&
                               table.parentElement.closest('table.ItemList');
                if (!parent) break;
                table = parent;
            }
            if (table) table.classList.add(CLASSE);
        });
    }

    let timer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(refresh, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    refresh();
})();
