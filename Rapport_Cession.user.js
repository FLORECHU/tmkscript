// ==UserScript==
// @name         Surligner les lignes CESSION - TD Biobank
// @namespace    http://svm-crbbio/
// @version      1.0.0
// @description  Met en évidence les lignes dont le titre contient "CESSION _"
// @match        http://svm-crbbio/TD-Biobank/ListReportTemplates.do*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
    #template tr.cession-highlight td {
      background-color: #fff3a0 !important;
      font-weight: bold;
    }
    #template tr.cession-highlight td:first-child {
      border-left: 6px solid #e67e00;
    }
    #template tr.cession-highlight:hover td {
      background-color: #ffe766 !important;
    }
  `);

  function surligner() {
    document.querySelectorAll('#template tbody tr').forEach(function (tr) {
      const td = tr.querySelector('td:first-child');
      if (td && /CESSION\s*_/i.test(td.textContent)) {
        tr.classList.add('cession-highlight');
      }
    });
  }

  surligner();

  // Si le tableau est rechargé dynamiquement (tri, pagination, AJAX)
  const table = document.getElementById('template');
  if (table) {
    new MutationObserver(surligner).observe(table, { childList: true, subtree: true });
  }
})();
