// ==UserScript==
// @name         PATIENT : Selection numero de randomisation
// @namespace    https://github.com/FLORECHU/tmkscript
// @version      1.0.0
// @description  Selection numero de rando
// @author       Flo
// @match        http://svm-crbbio/TD-Biobank/CreatePatient.do?*
// @updateURL    https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Patient_AutoSelectionNumRando.user.js
// @downloadURL  https://raw.githubusercontent.com/FLORECHU/tmkscript/refs/heads/main/Patient_AutoSelectionNumRando.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    //////////////////////////////////////////////////////
    // Utilitaire : appliquer des styles
    //////////////////////////////////////////////////////

    function appliquerStyles(el, styles) {
        for (var prop in styles) {
            if (styles.hasOwnProperty(prop)) {
                el.style[prop] = styles[prop];
            }
        }
    }

    //////////////////////////////////////////////////////
    // Utilitaire : copie dans le presse-papier
    //////////////////////////////////////////////////////

    function copierDansClipboard(texte) {
        var textarea = document.createElement("textarea");
        textarea.value = texte;
        appliquerStyles(textarea, {
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            opacity: "0"
        });
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
            console.log("Copie OK : " + texte);
        } catch (e) {
            console.log("Echec copie : " + e);
        }
        document.body.removeChild(textarea);
    }

    //////////////////////////////////////////////////////
    // Utilitaire : copier + naviguer vers la réception
    //////////////////////////////////////////////////////

    function copierEtOuvrir(numeroRandomisation, patientId) {
        copierDansClipboard(numeroRandomisation);
        setTimeout(function () {
            window.location.href =
                "http://svm-crbbio/TD-Biobank/ResourceReceipt.do" +
                "?method=R%c3%a9ceptionner+une+ressource+pour+ce+patient" +
                "&patientId=" + patientId;
        }, 150);
    }

    function ouvrirReception(patientId) {
        window.location.href =
            "http://svm-crbbio/TD-Biobank/ResourceReceipt.do" +
            "?method=R%c3%a9ceptionner+une+ressource+pour+ce+patient" +
            "&patientId=" + patientId;
    }

    //////////////////////////////////////////////////////
    // Utilitaire : récupérer le patientId (via lien <a>)
    //////////////////////////////////////////////////////

    function getPatientId() {
        var liens = document.querySelectorAll("a[href*='patientId=']");
        for (var i = 0; i < liens.length; i++) {
            var match = liens[i].href.match(/patientId=(\d+)/);
            if (match) {
                console.log("patientId trouve : " + match[1]);
                return match[1];
            }
        }
        return null;
    }

    //////////////////////////////////////////////////////
    // Utilitaire : trouver la cellule <td> de randomisation
    //////////////////////////////////////////////////////

    function trouverCelluleRandomisation() {
        var allTh = document.querySelectorAll("th");
        var th = null;

        for (var i = 0; i < allTh.length; i++) {
            var texte = allTh[i].textContent || allTh[i].innerText;
            if (texte.toLowerCase().indexOf("randomisation") !== -1) {
                th = allTh[i];
                break;
            }
        }

        if (!th) return null;

        var ligne = th.parentNode;
        if (!ligne) return null;

        // Cas 1 : <td> sur la même ligne que le <th>
        var tdMemeLigne = ligne.querySelector("td");
        if (tdMemeLigne) return tdMemeLigne;

        // Cas 2 : <td> sur la ligne suivante
        var ligneSuivante = ligne.nextSibling;
        // Ignorer les noeuds texte entre les TR
        while (ligneSuivante && ligneSuivante.nodeType !== 1) {
            ligneSuivante = ligneSuivante.nextSibling;
        }
        if (ligneSuivante) {
            var tdSuivante = ligneSuivante.querySelector("td");
            if (tdSuivante) return tdSuivante;
        }

        // Cas 3 : <td> directement adjacent au <th>
        var tdSibling = th.nextSibling;
        while (tdSibling && tdSibling.nodeType !== 1) {
            tdSibling = tdSibling.nextSibling;
        }
        if (tdSibling && tdSibling.tagName === "TD") return tdSibling;

        return null;
    }

    //////////////////////////////////////////////////////
    // Utilitaire : extraire les numéros depuis la <td>
    //////////////////////////////////////////////////////

    function extraireNumeros(td) {
        var liElements = td.querySelectorAll("li");
        var items = [];

        for (var i = 0; i < liElements.length; i++) {
            var li = liElements[i];
            var texteItem = "";
            // Parcourir les noeuds enfants pour ne garder que TEXT_NODE
            for (var j = 0; j < li.childNodes.length; j++) {
                var node = li.childNodes[j];
                if (node.nodeType === 3) { // 3 = TEXT_NODE (compatible IE)
                    var t = node.nodeValue.replace(/^\s+|\s+$/g, "");
                    if (t) texteItem += t;
                }
            }
            texteItem = texteItem.replace(/^\s+|\s+$/g, "");
            if (texteItem) items.push(texteItem);
        }

        if (items.length > 0) return items;

        // Fallback : texte brut si pas de <li>
        var brut = (td.textContent || td.innerText).replace(/\s+/g, " ");
        brut = brut.replace(/^\s+|\s+$/g, "");
        if (brut.length > 0 && /\d/.test(brut)) return [brut];

        return [];
    }

    //////////////////////////////////////////////////////
    // Popup de sélection si plusieurs numéros
    //////////////////////////////////////////////////////

    function afficherSelect(numeros, patientId) {
        var overlay = document.createElement("div");
        appliquerStyles(overlay, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "10000"
        });

        var box = document.createElement("div");
        appliquerStyles(box, {
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            textAlign: "center",
            minWidth: "320px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        });

        var titre = document.createElement("p");
        titre.textContent = "Choisir un numero de randomisation";
        appliquerStyles(titre, {
            fontWeight: "bold",
            marginBottom: "12px",
            fontSize: "15px"
        });

        var select = document.createElement("select");
        appliquerStyles(select, {
            width: "100%",
            padding: "3px",
            marginBottom: "16px",
            fontSize: "12px"
        });

        for (var i = 0; i < numeros.length; i++) {
            var option = document.createElement("option");
            option.value = numeros[i];
            option.textContent = numeros[i];
            select.appendChild(option);
        }

        var btnValider = document.createElement("button");
        btnValider.textContent = "Valider";
        appliquerStyles(btnValider, {
            margin: "5px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
        });

        var btnAnnuler = document.createElement("button");
        btnAnnuler.textContent = "Annuler";
        appliquerStyles(btnAnnuler, {
            margin: "5px",
            padding: "8px 16px",
            backgroundColor: "#e0e0e0",
            color: "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
        });

        function fermer() {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            document.removeEventListener("keydown", onKeyDown);
        }

        function onKeyDown(e) {
            var key = e.key || e.keyCode;
            if (key === "Escape" || key === 27) fermer();
        }

        document.addEventListener("keydown", onKeyDown);

        btnValider.onclick = function () {
            fermer();
            copierEtOuvrir(select.value, patientId);
        };

        btnAnnuler.onclick = fermer;

        box.appendChild(titre);
        box.appendChild(select);
        box.appendChild(document.createElement("br"));
        box.appendChild(btnValider);
        box.appendChild(btnAnnuler);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    //////////////////////////////////////////////////////
    // CREATION DU BOUTON
    //////////////////////////////////////////////////////

    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Reception";
    appliquerStyles(btn, {
        zIndex: "9999",
        padding: "2px 8px",
        backgroundColor: "#f5b7b1",
        color: "#641e16",
        border: "solid 1px #e6a09a",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "11px",
        fontFamily: "Arial",
        marginBottom: "6px",
        marginLeft: "auto",
        display: "block"
    });

    var tableau = document.querySelector(
        "[name='resourceGroupResource'], #resourceGroupResource, table.resourceGroupResource"
    );

    if (tableau) {
        tableau.parentNode.insertBefore(btn, tableau);
    } else {
        appliquerStyles(btn, {
            position: "fixed",
            top: "427px",
            right: "860px"
        });
        document.body.appendChild(btn);
    }

    //////////////////////////////////////////////////////
    // Logique principale au clic
    //////////////////////////////////////////////////////

    btn.onclick = function (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();

        btn.disabled = true;
        btn.textContent = "Chargement...";

        function resetBtn() {
            btn.disabled = false;
            btn.textContent = "Reception";
        }

        // 1 - Récupération du patientId
        var patientId = getPatientId();

        if (!patientId) {
            alert("Impossible de trouver l'ID patient.");
            resetBtn();
            return;
        }

        // 2 - Recherche de la cellule Randomisation
        var td = trouverCelluleRandomisation();

        if (!td) {
            resetBtn();
            ouvrirReception(patientId);
            return;
        }

        // 3 - Extraction des numéros
        var numeros = extraireNumeros(td);
        console.log("Numeros trouves : " + numeros.join(", "));

        if (numeros.length === 0) {
            resetBtn();
            ouvrirReception(patientId);
            return;
        }

        // 4 - Un seul numéro → action directe
        if (numeros.length === 1) {
            copierEtOuvrir(numeros[0], patientId);
            return;
        }

        // 5 - Plusieurs numéros → popup de sélection
        resetBtn();
        afficherSelect(numeros, patientId);
    };

})();
