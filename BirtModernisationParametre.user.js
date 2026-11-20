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
  const BODY = '.dialogBackground > .dBackground';
  const CONTENT = '#parameterDialogdialogContentContainer';
  const TOGGLE = 'tm-birt-classic-toggle';
  const ACTIVE = 'tm-birt-modern';
  const MARKS = ['tm-birt-label-row', 'tm-birt-control-row', 'tm-birt-group-row'];

  GM_addStyle(`
    html.${ACTIVE} { color-scheme: light; --tm-bg:#f3f6fb; --tm-paper:#fff; --tm-ink:#17243a; --tm-muted:#63728a; --tm-line:#dce4ef; --tm-blue:#315eea; --tm-focus:rgba(49,94,234,.2); font:15px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif !important; color:var(--tm-ink) !important; }
    html.${ACTIVE} #parameterDialogdialogTitleBar {
      min-height:58px !important; box-sizing:border-box !important;
      padding:10px 18px !important; color:#fff !important; background:#17243a !important;
      border:0 !important; border-radius:14px 14px 0 0 !important; box-shadow:0 4px 14px rgba(23,36,58,.18) !important;
    }
    html.${ACTIVE} #parameterDialogdialogTitleBar .dialogTitleText,
    html.${ACTIVE} #parameterDialogdialogTitleBar .dTitleText { color:#fff !important; font-size:17px !important; font-weight:700 !important; }
    html.${ACTIVE} #parameterDialogdialogCloseBtn { width:34px !important; height:34px !important; border-radius:9px !important; background:rgba(255,255,255,.14) !important; cursor:pointer !important; }
    html.${ACTIVE} #parameterDialogdialogCloseBtn::before { content:"×"; display:block; color:#fff; text-align:center; font:26px/34px system-ui,sans-serif; }

    /* Geometry is coordinated by layoutDialog(); these rules are visual only. */
    html.${ACTIVE} .dialogBackground > .dBackground {
      box-sizing:border-box !important; overflow:hidden !important; display:flex !important; flex-direction:column !important;
      background:var(--tm-bg) !important; border:1px solid var(--tm-line) !important;
      border-top:0 !important; border-radius:0 0 14px 14px !important;
      box-shadow:0 18px 48px rgba(23,36,58,.18) !important;
    }
    html.${ACTIVE} #parameterDialogdialogContentContainer {
      min-width:0 !important; max-width:100% !important; flex:1 1 auto !important;
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
    html.${ACTIVE} .dialogBtnBarContainer { box-sizing:border-box !important; flex:0 0 auto !important; padding:12px 20px !important; background:#fff !important; border-top:1px solid var(--tm-line) !important; }
    html.${ACTIVE} .dialogBtnBar, html.${ACTIVE} .dialogBtnBarButtonContainer { display:flex !important; flex-flow:row nowrap !important; align-items:center !important; justify-content:flex-end !important; gap:10px !important; width:100% !important; box-sizing:border-box !important; }
    html.${ACTIVE} .dialogBtnBarButtonEnabled, html.${ACTIVE} #parameterDialogcancelButton { display:inline-flex !important; flex:0 0 auto !important; align-items:center !important; }
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
  let originalStyles = new WeakMap();
  const styledElements = new Set();

  function dialogPresent() {
    return !!(document.querySelector(ROOT) && document.querySelector(TABLE) && document.querySelector(TITLE));
  }

  function saveOriginalStyle(element) {
    if (!originalStyles.has(element)) {
      originalStyles.set(element, element.getAttribute('style'));
      styledElements.add(element);
    }
  }

  function important(element, property, value) {
    if (!element) return;
    const normalized = String(value);
    if (element.style.getPropertyValue(property) === normalized && element.style.getPropertyPriority(property) === 'important') return;
    saveOriginalStyle(element);
    element.style.setProperty(property, normalized, 'important');
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

  function layoutDialog() {
    framePending = false;
    if (!modern || !dialogPresent()) return;
    const title = document.querySelector(TITLE);
    const body = document.querySelector(BODY);
    const visualRoot = document.querySelector('#parameterDialog') || body;
    const background = document.querySelector('.dialogBackground');
    const content = document.querySelector(CONTENT);
    const buttonBar = document.querySelector('.dialogBtnBarContainer');
    const buttonRow = document.querySelector('.dialogBtnBar');
    const buttonGroup = document.querySelector('.dialogBtnBarButtonContainer');
    const frame = document.querySelector('#parameterDialogiframe');
    if (!title || !visualRoot || !background || !body || !content || !buttonBar) return;

    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const W = Math.max(0, Math.min(900, .92 * vw));
    const innerW = Math.max(0, W - 2); // account for the .dBackground border
    const titleH = 58;
    const left = Math.max(0, (vw - W) / 2);
    let buttonH = 60;

    // Ensure the frame has its target width before measuring its natural content height.
    important(body, 'width', `${W}px`);
    important(body, 'box-sizing', 'border-box');
    important(content, 'width', `${innerW}px`);
    important(content, 'max-width', `${innerW}px`);
    for (const el of body.querySelectorAll('[style], [width]')) {
      const inlineWidth = el.style && el.style.getPropertyValue('width');
      const widthAttr = el.getAttribute && el.getAttribute('width');
      if (/^(500|522)(?:px)?$/i.test((inlineWidth || '').trim()) || /^(500|522)$/i.test((widthAttr || '').trim())) {
        important(el, 'width', `${W}px`);
      }
    }
    for (const table of title.querySelectorAll('table')) important(table, 'width', '100%');
    for (const el of [buttonBar, buttonRow, buttonGroup]) {
      if (el) important(el, 'width', '100%');
    }
    if (buttonRow) {
      important(buttonRow, 'display', 'flex');
      important(buttonRow, 'flex-flow', 'row nowrap');
      important(buttonRow, 'align-items', 'center');
      important(buttonRow, 'justify-content', 'flex-end');
    }
    if (buttonGroup) {
      important(buttonGroup, 'display', 'flex');
      important(buttonGroup, 'flex-flow', 'row nowrap');
      important(buttonGroup, 'align-items', 'center');
      important(buttonGroup, 'justify-content', 'flex-end');
    }
    for (const el of buttonGroup ? buttonGroup.children : []) {
      if (el.matches && (el.matches('#parameterDialogokButton') || el.matches('#parameterDialogcancelButton'))) {
        important(el, 'display', 'inline-flex');
        important(el, 'width', 'auto');
        important(el, 'flex', '0 0 auto');
      }
    }

    buttonH = Math.max(56, buttonBar.getBoundingClientRect().height || 60);
    const natural = Math.max(content.scrollHeight || 0, content.getBoundingClientRect().height || 0);
    const H = Math.max(1, Math.min(.85 * vh, titleH + natural + buttonH));
    const contentH = Math.max(0, H - titleH - buttonH);
    // This HTML has no #parameterDialog ancestor: .dialogBackground is the screen wrapper,
    // .dBackground is its positioned dialog body, while the title and hidden iframe are siblings.
    important(background, 'position', 'fixed');
    important(background, 'left', '0px');
    important(background, 'top', '0px');
    important(background, 'width', `${vw}px`);
    important(background, 'height', `${vh}px`);
    important(background, 'overflow', 'visible');

    important(visualRoot, 'position', 'absolute');
    important(visualRoot, 'left', `${left}px`);
    important(visualRoot, 'top', `${(vh - H) / 2 + titleH}px`);
    important(visualRoot, 'width', `${W}px`);
    important(visualRoot, 'height', `${H - titleH}px`);
    important(visualRoot, 'max-width', 'none');
    important(visualRoot, 'overflow', 'hidden');
    important(visualRoot, 'display', 'flex');
    important(visualRoot, 'flex-direction', 'column');

    important(title, 'position', 'fixed');
    important(title, 'left', `${left}px`);
    important(title, 'top', `${(vh - H) / 2}px`);
    important(title, 'width', `${W}px`);
    important(title, 'height', `${titleH}px`);
    important(title, 'max-width', 'none');
    important(title, 'box-sizing', 'border-box');

    important(content, 'width', `${innerW}px`);
    important(content, 'height', `${contentH}px`);
    important(content, 'min-height', '0');
    important(content, 'max-height', `${contentH}px`);
    important(content, 'flex', '1 1 auto');
    important(content, 'overflow', 'auto');
    important(buttonBar, 'width', `${W}px`);
    important(buttonBar, 'flex', '0 0 auto');
    important(buttonBar, 'box-sizing', 'border-box');

    if (frame) {
      important(frame, 'position', 'fixed');
      important(frame, 'left', `${left}px`);
      important(frame, 'top', `${(vh - H) / 2}px`);
      important(frame, 'width', `${W}px`);
      important(frame, 'height', `${H}px`);
      // BIRT's supplied frame is a hidden legacy mask; retain that hidden state.
    }
    markRows(document.querySelector(TABLE));
  }

  function scheduleGeometry() {
    if (!modern || framePending) return;
    framePending = true;
    window.setTimeout(layoutDialog, 0);
    window.setTimeout(layoutDialog, 100);
  }

  function restoreClassic() {
    document.documentElement.classList.remove(ACTIVE);
    for (const element of styledElements) {
      if (!element || !element.isConnected) continue;
      const value = originalStyles.get(element);
      if (value === null) element.removeAttribute('style');
      else element.setAttribute('style', value);
    }
    styledElements.clear();
    originalStyles = new WeakMap();
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
      if (records.some(record => record.type === 'attributes' && record.attributeName === 'style')) scheduleGeometry();
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

