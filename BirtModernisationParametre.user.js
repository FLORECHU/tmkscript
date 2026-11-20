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

  const ROOT = '#parameterDialogdialogContentContainer';
  const TABLE = '#parameter_table';
  const TITLE = '#parameterDialogdialogTitleBar';
  const BACKGROUND = '.dialogBackground';
  const BODY = '.dialogBackground > .dBackground';
  const CONTENT = '#parameterDialogdialogContentContainer';
  const TOGGLE = 'tm-birt-classic-toggle';
  const ACTIVE = 'tm-birt-modern';
  const MARKS = ['tm-birt-label-row', 'tm-birt-control-row', 'tm-birt-group-row'];

  GM_addStyle(`
    html.${ACTIVE} { color-scheme: light; --tm-bg:#f3f6fb; --tm-paper:#fff; --tm-ink:#17243a; --tm-muted:#63728a; --tm-line:#dce4ef; --tm-blue:#315eea; --tm-focus:rgba(49,94,234,.2); font:15px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif !important; color:var(--tm-ink) !important; }
    html.${ACTIVE} #parameterDialogdialogTitleBar {
      width:min(900px,92vw) !important; min-height:58px !important; box-sizing:border-box !important;
      padding:10px 18px !important; color:#fff !important; background:#17243a !important;
      border:0 !important; border-radius:14px 14px 0 0 !important; box-shadow:0 4px 14px rgba(23,36,58,.18) !important;
    }
    html.${ACTIVE} #parameterDialogdialogTitleBar .dialogTitleText,
    html.${ACTIVE} #parameterDialogdialogTitleBar .dTitleText { color:#fff !important; font-size:17px !important; font-weight:700 !important; }
    html.${ACTIVE} #parameterDialogdialogCloseBtn { width:34px !important; height:34px !important; border-radius:9px !important; background:rgba(255,255,255,.14) !important; cursor:pointer !important; }
    html.${ACTIVE} #parameterDialogdialogCloseBtn::before { content:"×"; display:block; color:#fff; text-align:center; font:26px/34px system-ui,sans-serif; }

    /* BIRT owns position/display and its JS lifecycle; only geometry is overridden. */
    html.${ACTIVE} .dialogBackground { width:100vw !important; max-width:100vw !important; overflow:auto !important; }
    html.${ACTIVE} .dialogBackground > .dBackground {
      width:min(900px,92vw) !important; max-width:92vw !important;
      height:calc(85vh - 58px) !important; max-height:calc(85vh - 58px) !important;
      box-sizing:border-box !important; overflow:auto !important;
      background:var(--tm-bg) !important; border:1px solid var(--tm-line) !important;
      border-top:0 !important; border-radius:0 0 14px 14px !important;
      box-shadow:0 18px 48px rgba(23,36,58,.18) !important;
    }
    html.${ACTIVE} #parameterDialogdialogContentContainer {
      width:100% !important; height:calc(85vh - 132px) !important;
      min-width:0 !important; max-width:100% !important; max-height:calc(85vh - 132px) !important;
      box-sizing:border-box !important; overflow:auto !important; padding:18px 22px !important;
      background:var(--tm-bg) !important;
    }
    html.${ACTIVE} .birtviewer_parameter_dialog { width:100% !important; max-width:100% !important; }
    html.${ACTIVE} #parameter_table { width:100% !important; border:0 !important; border-collapse:collapse !important; background:transparent !important; }
    html.${ACTIVE} #parameter_table > tbody > tr > td { padding:0 !important; border:0 !important; }
    html.${ACTIVE} #parameter_table > tbody > tr > td > table { width:100% !important; border:0 !important; border-collapse:collapse !important; font:inherit !important; }
    html.${ACTIVE} #parameter_table img[src*="parameter.gif"],
    html.${ACTIVE} #parameter_table img[src*="parameter_group.gif"],
    html.${ACTIVE} .birtviewer_hidden_label, html.${ACTIVE} #birt_hint { display:none !important; }
    html.${ACTIVE} #parameter_table font[color="red"] { color:#c2413a !important; font-weight:700 !important; }
    html.${ACTIVE} #parameter_table tr.tm-birt-label-row td,
    html.${ACTIVE} #parameter_table tr.tm-birt-control-row td { display:block !important; width:100% !important; padding:0 !important; white-space:normal !important; border:0 !important; text-align:left !important; }
    html.${ACTIVE} #parameter_table tr.tm-birt-label-row { margin-top:12px !important; }
    html.${ACTIVE} #parameter_table tr.tm-birt-label-row td:first-child,
    html.${ACTIVE} #parameter_table tr.tm-birt-control-row td:first-child { display:none !important; }
    html.${ACTIVE} #parameter_table tr.tm-birt-label-row td:last-child { color:var(--tm-ink) !important; font-weight:650 !important; padding-bottom:7px !important; }
    html.${ACTIVE} #parameter_table table.birtviewer_parameter_dialog_Label { display:block !important; width:100% !important; margin:10px 0 0 !important; padding:13px 16px !important; border:1px solid var(--tm-line) !important; border-radius:13px !important; border-collapse:separate !important; background:var(--tm-paper) !important; box-shadow:0 3px 12px rgba(23,36,58,.045) !important; }
    html.${ACTIVE} #parameter_table table.birtviewer_parameter_dialog_Label > tbody,
    html.${ACTIVE} #parameter_table table.birtviewer_parameter_dialog_Label tr { display:block !important; width:100% !important; }
    html.${ACTIVE} #parameter_table tr.tm-birt-group-row td { padding:12px 2px 4px !important; color:var(--tm-ink) !important; font-size:15px !important; font-weight:750 !important; }
    html.${ACTIVE} #parameter_table input:not([type="hidden"]):not([type="button"]),
    html.${ACTIVE} #parameter_table select, html.${ACTIVE} #parameter_table textarea {
      display:block !important; width:100% !important; max-width:100% !important; min-width:0 !important; min-height:43px !important;
      box-sizing:border-box !important; margin:0 !important; padding:9px 12px !important;
      color:var(--tm-ink) !important; background:#fff !important; border:1px solid #cbd6e5 !important; border-radius:9px !important;
      outline:none !important; box-shadow:0 1px 2px rgba(23,36,58,.035) !important; font:inherit !important;
    }
    html.${ACTIVE} #parameter_table select { cursor:pointer !important; }
    html.${ACTIVE} #parameter_table input:not([type="hidden"]):not([type="button"]):focus,
    html.${ACTIVE} #parameter_table select:focus, html.${ACTIVE} #parameter_table textarea:focus { border-color:var(--tm-blue) !important; box-shadow:0 0 0 4px var(--tm-focus) !important; }
    html.${ACTIVE} .dialogBtnBarContainer { box-sizing:border-box !important; padding:12px 20px !important; background:#fff !important; border-top:1px solid var(--tm-line) !important; }
    html.${ACTIVE} .dBtnBarDividerTop, html.${ACTIVE} .dBtnBarDividerBottom,
    html.${ACTIVE} .dialogBtnBarDivider, html.${ACTIVE} .dialogBtnBarButtonLeftBackgroundEnabled,
    html.${ACTIVE} .dialogBtnBarButtonRightBackgroundEnabled { display:none !important; }
    html.${ACTIVE} .dialogBtnBar input[type="button"] {
      box-sizing:border-box !important; width:auto !important; max-width:none !important; min-width:88px !important; min-height:40px !important;
      padding:9px 17px !important; white-space:nowrap !important; border:1px solid #cbd6e5 !important; border-radius:9px !important;
      background:#fff !important; color:var(--tm-ink) !important; font:600 14px/1.2 system-ui,sans-serif !important; cursor:pointer !important;
    }
    html.${ACTIVE} #parameterDialogokButton input[type="button"] { background:var(--tm-blue) !important; color:#fff !important; border-color:var(--tm-blue) !important; }
    html.${ACTIVE} #parameterDialogcancelButton input[type="button"] { width:auto !important; white-space:nowrap !important; }
    html.${ACTIVE} #${TOGGLE} { margin-left:12px !important; padding:7px 10px !important; border:1px solid rgba(255,255,255,.28) !important; border-radius:8px !important; background:rgba(255,255,255,.1) !important; color:#fff !important; font:600 12px/1.2 system-ui,sans-serif !important; cursor:pointer !important; }
    @media(max-width:600px) {
      html.${ACTIVE} #parameterDialogdialogContentContainer { padding:14px !important; }
      html.${ACTIVE} .dialogBtnBarContainer { padding:10px 12px !important; }
      html.${ACTIVE} #parameterDialogdialogTitleBar { padding-inline:13px !important; }
    }
    @media(prefers-reduced-motion:reduce) { html.${ACTIVE} *,html.${ACTIVE} *::before,html.${ACTIVE} *::after { transition:none !important; scroll-behavior:auto !important; } }
  `);

  let modern = false;
  let initialized = false;
  let observer = null;
  let framePending = false;
  const originalStyles = new WeakMap();

  function dialogPresent() {
    return !!(document.querySelector(ROOT) && document.querySelector(TABLE) && document.querySelector(TITLE));
  }

  function saveOriginalStyle(element) {
    if (!originalStyles.has(element)) originalStyles.set(element, element.getAttribute('style'));
  }

  function important(element, property, value) {
    if (!element) return;
    saveOriginalStyle(element);
    if (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important') {
      element.style.setProperty(property, value, 'important');
    }
  }

  function markRows(table) {
    table.querySelectorAll('select[id], input:not([type="hidden"]):not([type="button"])[id], textarea[id]').forEach(control => {
      const label = Array.from(table.querySelectorAll('label[for]')).find(candidate => candidate.htmlFor === control.id);
      const labelRow = label && label.closest('tr');
      const controlRow = control.closest('tr');
      if (labelRow) labelRow.classList.add('tm-birt-label-row');
      if (controlRow) controlRow.classList.add('tm-birt-control-row');
    });
    table.querySelectorAll('img[src*="parameter_group.gif"]').forEach(img => {
      const row = img.closest('tr');
      if (row) row.classList.add('tm-birt-group-row');
    });
  }

  function setGeometry() {
    framePending = false;
    if (!modern || !dialogPresent()) return;
    const title = document.querySelector(TITLE);
    const body = document.querySelector(BODY);
    const content = document.querySelector(CONTENT);
    const buttonBar = document.querySelector('.dialogBtnBarContainer');
    const frame = document.querySelector('#parameterDialogiframe');
    if (!title || !body || !content || !buttonBar) return;

    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;
    const width = Math.min(900, vw * .92);
    const titleHeight = Math.min(58, vh * .11);
    const totalHeight = vh * .85;
    const left = Math.max(0, (vw - width) / 2);
    const top = Math.max(0, (vh - totalHeight) / 2);
    const titleHeightPx = `${titleHeight}px`;
    const bodyHeight = `${Math.max(160, totalHeight - titleHeight)}px`;
    const buttonHeight = Math.max(54, buttonBar.getBoundingClientRect().height || 58);
    const contentHeight = `${Math.max(100, totalHeight - titleHeight - buttonHeight)}px`;

    important(title, 'width', `${width}px`);
    important(title, 'left', `${left}px`);
    important(title, 'top', `${top}px`);
    important(title, 'height', titleHeightPx);
    important(body, 'width', `${width}px`);
    important(body, 'height', bodyHeight);
    important(body, 'left', `${left}px`);
    important(body, 'top', `${top + titleHeight}px`);
    important(content, 'width', '100%');
    important(content, 'height', contentHeight);
    if (frame) {
      important(frame, 'width', `${width}px`);
      important(frame, 'height', `${totalHeight}px`);
      important(frame, 'left', `${left}px`);
      important(frame, 'top', `${top}px`);
    }
    markRows(document.querySelector(TABLE));
  }

  function scheduleGeometry() {
    if (framePending) return;
    framePending = true;
    (window.requestAnimationFrame || (fn => window.setTimeout(fn, 0)))(setGeometry);
  }

  function restoreElementStyle(element) {
    if (!originalStyles.has(element)) return;
    const value = originalStyles.get(element);
    if (value === null) element.removeAttribute('style');
    else element.setAttribute('style', value);
  }

  function restoreClassic() {
    document.documentElement.classList.remove(ACTIVE);
    document.querySelectorAll(`${TITLE}, ${BODY}, ${CONTENT}, #parameterDialogiframe`).forEach(restoreElementStyle);
    document.querySelectorAll(`#${TABLE} .tm-birt-label-row, #${TABLE} .tm-birt-control-row, #${TABLE} .tm-birt-group-row`).forEach(row => {
      row.classList.remove(...MARKS);
    });
  }

  function updateToggle(button) {
    button.textContent = modern ? 'Mode classique' : 'Mode modernisé';
    button.title = modern ? 'Revenir au dialogue classique' : 'Activer le dialogue modernisé';
    button.setAttribute('aria-pressed', String(modern));
  }

  function enhance() {
    if (!dialogPresent()) return;
    const title = document.querySelector(TITLE);
    let button = document.getElementById(TOGGLE);
    if (!button) {
      button = document.createElement('button');
      button.id = TOGGLE;
      button.type = 'button';
      button.addEventListener('click', () => {
        modern = !modern;
        if (modern) {
          document.documentElement.classList.add(ACTIVE);
          markRows(document.querySelector(TABLE));
          scheduleGeometry();
        } else restoreClassic();
        updateToggle(button);
      });
      title.appendChild(button);
    }
    if (!initialized) {
      initialized = true;
      modern = true;
      button.dataset.ready = 'yes';
      document.documentElement.classList.add(ACTIVE);
      markRows(document.querySelector(TABLE));
      scheduleGeometry();
    } else {
      document.documentElement.classList.toggle(ACTIVE, modern);
      if (modern) {
        markRows(document.querySelector(TABLE));
        scheduleGeometry();
      }
    }
    updateToggle(button);
  }

  function start() {
    // Wait for BIRT's dynamically-created dialogue; remain inert until its exact signature exists.
    enhance();
    observer = new MutationObserver(records => {
      if (!dialogPresent()) return;
      if (!document.getElementById(TOGGLE)) enhance();
      if (!modern) return;
      const geometryChanged = records.some(record => record.type === 'attributes' && record.attributeName === 'style');
      if (geometryChanged) scheduleGeometry();
      if (records.some(record => record.type === 'childList')) {
        markRows(document.querySelector(TABLE));
        scheduleGeometry();
      }
    });
    observer.observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:['style'] });
    window.addEventListener('resize', scheduleGeometry, { passive:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
