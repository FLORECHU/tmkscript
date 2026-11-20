// ==UserScript==
// @name         BIRT — formulaire de paramètres modernisé
// @namespace    local.ui.refresh
// @version      1.0.0
// @description  Modernise prudemment le dialogue de paramètres BIRT identifié par sa structure.
// @match        http://svm-crbbio/TD-Biobank/frameset?__report=D:/Technidata/Data/hccrb-documents//birt*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==
(() => {
  'use strict';

  // Le fichier source est un fragment HTML sans URL d'origine. Le motif est donc
  // volontairement large, mais aucun effet n'est appliqué hors du dialogue BIRT ciblé.
  const ROOT_SELECTOR = '#parameterDialogdialogContentContainer';
  const TABLE_SELECTOR = '#parameter_table';
  const STYLE_ID = 'tm-birt-modern-style';
  const TOGGLE_ID = 'tm-birt-classic-toggle';
  const ROOT_CLASS = 'tm-birt-modern';

  GM_addStyle(`
    :root.${ROOT_CLASS} {
      color-scheme: light;
      --tm-bg: #f3f6fb;
      --tm-surface: #ffffff;
      --tm-ink: #17243a;
      --tm-muted: #63728a;
      --tm-line: #dce4ef;
      --tm-accent: #315eea;
      --tm-accent-dark: #2448bf;
      --tm-focus: rgba(49, 94, 234, .22);
      --tm-radius: 14px;
      --tm-shadow: 0 18px 48px rgba(23, 36, 58, .14);
      font: 15px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      color: var(--tm-ink) !important;
      background: var(--tm-bg) !important;
    }

    :root.${ROOT_CLASS} *, :root.${ROOT_CLASS} *::before, :root.${ROOT_CLASS} *::after {
      box-sizing: border-box;
    }

    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      min-height: 58px !important;
      padding: 10px 18px !important;
      background: #17243a !important;
      color: #fff !important;
      border: 0 !important;
      box-shadow: 0 4px 14px rgba(23, 36, 58, .18) !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar table,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar tbody,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar tr,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar td,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar .dTitleTextContainer,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar .dialogCloseBtnContainer {
      display: contents !important;
      width: auto !important;
      height: auto !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar .dialogTitleText,
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar .dTitleText {
      display: block !important;
      flex: 1 1 auto !important;
      color: #fff !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      letter-spacing: .01em !important;
      padding: 0 !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogCloseBtn {
      position: relative !important;
      width: 34px !important;
      height: 34px !important;
      border-radius: 9px !important;
      background: rgba(255,255,255,.12) !important;
      cursor: pointer !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogCloseBtn::before {
      content: "×";
      display: grid;
      place-items: center;
      color: #fff;
      font: 24px/1 system-ui, sans-serif;
    }

    :root.${ROOT_CLASS} .dialogBackground {
      overflow: auto !important;
      background: var(--tm-bg) !important;
      padding: 20px !important;
    }
    :root.${ROOT_CLASS} .dBackground,
    :root.${ROOT_CLASS} #parameterDialogdialogContentContainer,
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog {
      width: min(100%, 760px) !important;
      max-width: 100% !important;
      margin-inline: auto !important;
      background: transparent !important;
      border: 0 !important;
    }
    :root.${ROOT_CLASS} #parameter_table {
      width: 100% !important;
      border: 0 !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      background: transparent !important;
    }
    :root.${ROOT_CLASS} #parameter_table > tbody > tr > td {
      padding: 0 !important;
      border: 0 !important;
    }
    :root.${ROOT_CLASS} #parameter_table table:not(.birtviewer_parameter_dialog_Label) {
      width: 100% !important;
      border: 0 !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      font: inherit !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label {
      display: block !important;
      width: 100% !important;
      margin: 10px 0 0 !important;
      padding: 15px 17px !important;
      border: 1px solid var(--tm-line) !important;
      border-radius: var(--tm-radius) !important;
      background: var(--tm-surface) !important;
      box-shadow: 0 3px 12px rgba(23, 36, 58, .045) !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label > tbody,
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label > tbody > tr {
      display: block !important;
      width: 100% !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label td {
      display: block !important;
      width: 100% !important;
      padding: 0 !important;
      border: 0 !important;
      white-space: normal !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label tr:first-child td:nth-child(2) {
      margin: 0 0 8px !important;
      color: var(--tm-ink) !important;
      font-size: 14px !important;
      font-weight: 650 !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label tr:first-child td:first-child,
    :root.${ROOT_CLASS} #parameter_table img[src*="parameter.gif"],
    :root.${ROOT_CLASS} #parameter_table img[src*="parameter_group.gif"] {
      display: none !important;
    }
    :root.${ROOT_CLASS} #parameter_table font[color="red"] {
      color: #c2413a !important;
      font-weight: 700 !important;
    }
    :root.${ROOT_CLASS} #parameter_table > tbody > tr:first-child > td > table > tbody > tr:first-child,
    :root.${ROOT_CLASS} #parameter_table tr:has(> td[colspan]),
    :root.${ROOT_CLASS} #parameter_table tr:has(> td[height]) {
      color: var(--tm-muted) !important;
      font-size: 12px !important;
    }
    :root.${ROOT_CLASS} #parameter_table tr:has(img[src*="parameter_group.gif"]) {
      display: block !important;
      margin: 23px 0 3px !important;
      color: var(--tm-ink) !important;
      font-size: 16px !important;
      font-weight: 750 !important;
    }
    :root.${ROOT_CLASS} #parameter_table tr:has(img[src*="parameter_group.gif"]) td {
      padding: 0 2px 3px !important;
    }
    :root.${ROOT_CLASS} #parameter_table input:not([type="hidden"]):not([type="button"]),
    :root.${ROOT_CLASS} #parameter_table select,
    :root.${ROOT_CLASS} #parameter_table textarea {
      display: block !important;
      width: 100% !important;
      min-height: 44px !important;
      margin: 0 !important;
      padding: 10px 12px !important;
      color: var(--tm-ink) !important;
      background-color: #fff !important;
      border: 1px solid #cbd6e5 !important;
      border-radius: 10px !important;
      outline: none !important;
      box-shadow: 0 1px 2px rgba(23,36,58,.035) !important;
      font: inherit !important;
      transition: border-color .16s ease, box-shadow .16s ease !important;
    }
    :root.${ROOT_CLASS} #parameter_table input:not([type="hidden"]):not([type="button"]):focus,
    :root.${ROOT_CLASS} #parameter_table select:focus,
    :root.${ROOT_CLASS} #parameter_table textarea:focus {
      border-color: var(--tm-accent) !important;
      box-shadow: 0 0 0 4px var(--tm-focus) !important;
    }
    :root.${ROOT_CLASS} #parameter_table select { cursor: pointer !important; }
    :root.${ROOT_CLASS} .dialogBtnBarContainer {
      position: sticky !important;
      bottom: 0 !important;
      z-index: 5 !important;
      padding: 12px 20px !important;
      background: rgba(255,255,255,.94) !important;
      border-top: 1px solid var(--tm-line) !important;
      backdrop-filter: blur(12px) !important;
    }
    :root.${ROOT_CLASS} .dialogBtnBarContainer > div:first-child,
    :root.${ROOT_CLASS} .dialogBtnBarDivider,
    :root.${ROOT_CLASS} .dialogBtnBarButtonLeftBackgroundEnabled,
    :root.${ROOT_CLASS} .dialogBtnBarButtonRightBackgroundEnabled {
      display: none !important;
    }
    :root.${ROOT_CLASS} .dialogBtnBar,
    :root.${ROOT_CLASS} .dialogBtnBarButtonContainer {
      display: flex !important;
      justify-content: flex-end !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      margin: 0 !important;
    }
    :root.${ROOT_CLASS} .dialogBtnBar input[type="button"] {
      min-width: 100px !important;
      min-height: 42px !important;
      padding: 9px 18px !important;
      border: 1px solid #cbd6e5 !important;
      border-radius: 10px !important;
      background: #fff !important;
      color: var(--tm-ink) !important;
      font: 600 14px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif !important;
      cursor: pointer !important;
      transition: transform .15s ease, background-color .15s ease, box-shadow .15s ease !important;
    }
    :root.${ROOT_CLASS} #parameterDialogokButton input[type="button"] {
      color: #fff !important;
      background: var(--tm-accent) !important;
      border-color: var(--tm-accent) !important;
      box-shadow: 0 5px 12px rgba(49,94,234,.2) !important;
    }
    :root.${ROOT_CLASS} #parameterDialogokButton input[type="button"]:hover {
      background: var(--tm-accent-dark) !important;
      transform: translateY(-1px) !important;
    }
    :root.${ROOT_CLASS} .dialogBtnBar input[type="button"]:focus-visible,
    :root.${ROOT_CLASS} #${TOGGLE_ID}:focus-visible {
      outline: 3px solid var(--tm-focus) !important;
      outline-offset: 2px !important;
    }
    :root.${ROOT_CLASS} #${TOGGLE_ID} {
      flex: 0 0 auto !important;
      padding: 7px 10px !important;
      border: 1px solid rgba(255,255,255,.28) !important;
      border-radius: 8px !important;
      background: rgba(255,255,255,.1) !important;
      color: #fff !important;
      font: 600 12px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif !important;
      cursor: pointer !important;
    }
    :root.${ROOT_CLASS} .birtviewer_hidden_label,
    :root.${ROOT_CLASS} #birt_hint { display: none !important; }

    @media (max-width: 560px) {
      :root.${ROOT_CLASS} .dialogBackground { padding: 12px !important; }
      :root.${ROOT_CLASS} #parameterDialogdialogTitleBar { padding-inline: 13px !important; }
      :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label { padding: 13px !important; }
      :root.${ROOT_CLASS} .dialogBtnBarContainer { padding: 10px 12px !important; }
      :root.${ROOT_CLASS} .dialogBtnBar input[type="button"] { flex: 1 1 0 !important; min-width: 0 !important; }
    }
    /* Override BIRT's inline geometry and make the dialog a bounded flex layout. */
    :root.${ROOT_CLASS} .dialogBackground {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      padding: 4vh 4vw !important;
    }
    :root.${ROOT_CLASS} .dBackground {
      position: fixed !important;
      left: 50% !important;
      top: 50% !important;
      right: auto !important;
      bottom: auto !important;
      transform: translate(-50%, -50%) !important;
      width: min(900px, 92vw) !important;
      min-width: 0 !important;
      max-width: 92vw !important;
      height: min(90vh, 900px) !important;
      min-height: 0 !important;
      max-height: 90vh !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      margin: 0 !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogTitleBar {
      flex: 0 0 auto !important;
    }
    :root.${ROOT_CLASS} #parameterDialogdialogContentContainer {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
      min-height: 0 !important;
      max-width: 100% !important;
      max-height: none !important;
      height: auto !important;
      overflow: auto !important;
      width: 100% !important;
      margin: 0 !important;
    }
    :root.${ROOT_CLASS} .dialogBtnBarContainer {
      position: relative !important;
      flex: 0 0 auto !important;
      width: 100% !important;
      margin: 0 !important;
    }
    /* Flatten BIRT's nested layout tables so labels and controls form one column. */
    :root.${ROOT_CLASS} #parameter_table,
    :root.${ROOT_CLASS} #parameter_table tbody,
    :root.${ROOT_CLASS} #parameter_table tr,
    :root.${ROOT_CLASS} #parameter_table td,
    :root.${ROOT_CLASS} #parameter_table table {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      height: auto !important;
      text-align: left !important;
    }
    :root.${ROOT_CLASS} #parameter_table tr {
      margin: 0 !important;
    }
    :root.${ROOT_CLASS} #parameter_table td {
      padding-inline: 0 !important;
      white-space: normal !important;
    }
    :root.${ROOT_CLASS} .birtviewer_parameter_dialog_Label {
      width: 100% !important;
      margin: 10px 0 0 !important;
    }
    :root.${ROOT_CLASS} #parameter_table input:not([type="hidden"]):not([type="button"]),
    :root.${ROOT_CLASS} #parameter_table select,
    :root.${ROOT_CLASS} #parameter_table textarea {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
    :root.${ROOT_CLASS} #parameter_table tr:has(img[src*="parameter_group.gif"]) {
      width: 100% !important;
      margin: 14px 0 0 !important;
      padding: 12px 16px !important;
      border: 1px solid var(--tm-line) !important;
      border-radius: var(--tm-radius) !important;
      background: #eaf0fb !important;
    }
    :root.${ROOT_CLASS} #parameter_table tr:has(img[src*="parameter_group.gif"]) td {
      padding: 0 !important;
    }

    @media (prefers-reduced-motion: reduce) {
      :root.${ROOT_CLASS} *, :root.${ROOT_CLASS} *::before, :root.${ROOT_CLASS} *::after {
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
      }
    }
  `);

  let observer;
  let modernMode = false;

  function findDialog() {
    const root = document.querySelector(ROOT_SELECTOR);
    const table = document.querySelector(TABLE_SELECTOR);
    // Signature check guards the broad @match: don't style unrelated pages.
    if (!root || !table || !table.querySelector('select, input:not([type="hidden"])')) return null;
    return { root, table };
  }

  function updateToggle(button) {
    button.textContent = modernMode ? 'Mode classique' : 'Mode modernisé';
    button.setAttribute('aria-pressed', String(modernMode));
    button.setAttribute('aria-label', modernMode ? 'Revenir au mode classique' : 'Activer le mode modernisé');
    button.title = modernMode ? 'Revenir au mode classique' : 'Activer le mode modernisé';
  }

  function enhance() {
    const dialog = findDialog();
    if (!dialog) return;

    const titleBar = document.querySelector('#parameterDialogdialogTitleBar');
    if (!titleBar) return;

    let button = document.getElementById(TOGGLE_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = TOGGLE_ID;
      button.type = 'button';
      button.addEventListener('click', () => {
        modernMode = !modernMode;
        document.documentElement.classList.toggle(ROOT_CLASS, modernMode);
        updateToggle(button);
      });
      titleBar.append(button);
    }

    // Initial modern appearance; preserve a deliberate classic choice thereafter.
    if (!button.dataset.initialized) {
      modernMode = true;
      document.documentElement.classList.add(ROOT_CLASS);
      button.dataset.initialized = 'true';
    } else {
      document.documentElement.classList.toggle(ROOT_CLASS, modernMode);
    }
    updateToggle(button);
  }

  function start() {
    enhance();
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      // BIRT may recreate parts of the parameter dialog after a choice changes.
      if (!document.getElementById(TOGGLE_ID) || !document.querySelector(ROOT_SELECTOR)) enhance();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
