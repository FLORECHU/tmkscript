// ==UserScript==
// @name         RAPPORT BIRT : Mise en forme cession
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Met en évidence les lignes dont le titre contient "CESSION _"
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/ListReportTemplates.do*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Rapport_Cession.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Rapport_Cession.user.js
// @grant        none
// ==/UserScript==


(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    /* Ligne "odd" : violet très clair */
    table#template tr.cession-highlight.odd,
    table#template tr.cession-highlight.odd > td {
      background: #f5effa !important;
      background-color: #f5effa !important;
      background-image: none !important;
    }

    /* Ligne "even" : violet pastel un peu plus soutenu */
    table#template tr.cession-highlight.even,
    table#template tr.cession-highlight.even > td {
      background: #eadcf5 !important;
      background-color: #eadcf5 !important;
      background-image: none !important;
    }

    /* Liseré discret à gauche */
    table#template tr.cession-highlight > td:first-child {
      border-left: 5px solid #b794d6 !important;
    }
  `;
  document.body.appendChild(style);

  function surligner() {
    document.querySelectorAll('table#template tr').forEach(function (tr) {
      const td = tr.querySelector('td');
      if (td && /CESSION/i.test(td.textContent)) {
        tr.classList.add('cession-highlight');
      }
    });
  }

  surligner();
  setTimeout(surligner, 1000);
  setTimeout(surligner, 3000);
})();
