/**
 * CodeCraft Beautifier — app.js
 * Main jQuery application logic.
 * Handles: instant formatting, UI state, copy/paste/download, line numbers.
 */

$(function () {
  'use strict';

  /* ───────────────────────────────────────────────
     STATE
  ─────────────────────────────────────────────── */
  let currentLang       = 'html';
  let highlightEnabled  = false;
  let debounceTimer     = null;
  let lastInput         = '';
  let isProcessing      = false;

  const DEBOUNCE_MS = 320;  // ms after last keystroke before auto-format

  /* ───────────────────────────────────────────────
     ELEMENT REFERENCES
  ─────────────────────────────────────────────── */
  const $input           = $('#codeInput');
  const $output          = $('#codeOutput');
  const $outputPlain     = $('#outputPlain');
  const $outputHL        = $('#outputHighlighted');
  const $hlCode          = $('#highlightedCode');
  const $lineNumIn       = $('#lineNumbersInput');
  const $lineNumOut      = $('#lineNumbersOutput');
  const $langTabs        = $('#langTabs');
  const $inputBadge      = $('#inputBadge');
  const $outputBadge     = $('#outputBadge');
  const $inputChars      = $('#inputChars');
  const $inputLines      = $('#inputLines');
  const $outputChars     = $('#outputChars');
  const $outputLines     = $('#outputLines');
  const $formatStatus    = $('#formatStatus');
  const $formatTime      = $('#formatTime');
  const $btnBeautify     = $('#btnBeautify');
  const $btnCopy         = $('#btnCopy');
  const $btnDownload     = $('#btnDownload');
  const $btnPaste        = $('#btnPaste');
  const $btnClearInput   = $('#btnClearInput');
  const $btnClearAll     = $('#btnClearAll');
  const $btnToggleHL     = $('#btnToggleHighlight');
  const $indentSize      = $('#indentSize');
  const $wrapLines       = $('#wrapLines');
  const $headerProgress  = $('#headerProgress');
  const $toast           = $('#toast');
  const $toastMsg        = $('#toastMsg');
  const $errorModal      = $('#errorModal');
  const $errorMsg        = $('#errorMsg');
  const $modalClose      = $('#modalClose');

  /* ───────────────────────────────────────────────
     INIT
  ─────────────────────────────────────────────── */
  function init() {
    setLanguage('html');
    updateLineNumbers($lineNumIn,  $input);
    updateLineNumbers($lineNumOut, $output);
    bindEvents();
  }

  /* ───────────────────────────────────────────────
     LANGUAGE SELECTION
  ─────────────────────────────────────────────── */
  function setLanguage(lang) {
    currentLang = lang;
    const meta  = BeautifierConfig.LANGUAGES[lang];

    // Update tabs
    $langTabs.find('.lang-tab').removeClass('active');
    $langTabs.find(`[data-lang="${lang}"]`).addClass('active');

    // Update badges
    $inputBadge.text(meta.label);
    $outputBadge.text(meta.label);

    // Update highlight code class
    $hlCode.attr('class', BeautifierConfig.getPrismClass(lang));

    // Re-beautify with new language
    if ($input.val().trim()) {
      scheduleBeautify(0);
    }
  }

  /* ───────────────────────────────────────────────
     LINE NUMBERS
  ─────────────────────────────────────────────── */
  function updateLineNumbers($numEl, $textareaEl) {
    const lines = ($textareaEl.val() || '').split('\n');
    const count = lines.length;
    const nums  = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    $numEl.text(nums);
  }

  function syncScroll($textareaEl, $numEl) {
    $numEl.scrollTop($textareaEl.scrollTop());
  }

  /* ───────────────────────────────────────────────
     STATS UPDATE
  ─────────────────────────────────────────────── */
  function updateInputStats() {
    const val   = $input.val();
    const chars = val.length;
    const lines = val ? val.split('\n').length : 0;
    $inputChars.text(`${chars.toLocaleString()} chars`);
    $inputLines.text(`${lines.toLocaleString()} lines`);
  }

  function updateOutputStats(val) {
    const chars = val.length;
    const lines = val ? val.split('\n').length : 0;
    $outputChars.text(`${chars.toLocaleString()} chars`);
    $outputLines.text(`${lines.toLocaleString()} lines`);
  }

  /* ───────────────────────────────────────────────
     BEAUTIFY CORE
  ─────────────────────────────────────────────── */
  function getIndentSettings() {
    const val    = $indentSize.val();
    const useTabs = val === 'tab';
    const size   = useTabs ? 2 : parseInt(val, 10);
    return { size, useTabs };
  }

  function runBeautify() {
    const code = $input.val();
    if (!code.trim()) {
      $output.val('');
      $hlCode.text('');
      updateOutputStats('');
      updateLineNumbers($lineNumOut, $output);
      setStatus('Ready');
      return;
    }

    isProcessing = true;
    $btnBeautify.addClass('processing');
    triggerProgress();
    setStatus('Formatting…');

    const { size, useTabs } = getIndentSettings();
    const t0 = performance.now();

    // Use setTimeout to allow UI to update before heavy work
    setTimeout(function () {
      try {
        const result = BeautifierConfig.beautify(currentLang, code, size, useTabs);
        const elapsed = (performance.now() - t0).toFixed(1);

        $output.val(result);
        updateOutputStats(result);
        updateLineNumbers($lineNumOut, $output);
        $formatTime.text(`${elapsed}ms`);

        // Flash output panel
        $('.panel-output').addClass('has-output').addClass('flash');
        setTimeout(() => $('.panel-output').removeClass('flash'), 500);

        // Update highlight if visible
        if (highlightEnabled) {
          renderHighlight(result);
        }

        setStatus('Formatted ✓');
        lastInput = code;

      } catch (err) {
        showError(err.message || 'An unknown error occurred during formatting.');
        setStatus('Error');
      } finally {
        isProcessing = false;
        $btnBeautify.removeClass('processing');
      }
    }, 10);
  }

  function scheduleBeautify(delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runBeautify, delay !== undefined ? delay : DEBOUNCE_MS);
  }

  /* ───────────────────────────────────────────────
     SYNTAX HIGHLIGHT (Prism)
  ─────────────────────────────────────────────── */
  function renderHighlight(code) {
    if (!code) { $hlCode.text(''); return; }

    // Safely escape HTML entities for Prism
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    $hlCode.html(escaped);

    // Apply Prism highlighting
    if (window.Prism) {
      Prism.highlightElement($hlCode[0]);
    }
  }

  /* ───────────────────────────────────────────────
     STATUS & PROGRESS
  ─────────────────────────────────────────────── */
  function setStatus(msg) {
    $formatStatus.text(msg);
  }

  function triggerProgress() {
    $headerProgress.removeClass('active');
    // Force reflow
    void $headerProgress[0].offsetWidth;
    $headerProgress.addClass('active');
    setTimeout(() => $headerProgress.removeClass('active'), 700);
  }

  /* ───────────────────────────────────────────────
     TOAST
  ─────────────────────────────────────────────── */
  let toastTimer = null;
  function showToast(msg, isError) {
    $toastMsg.text(msg);
    $toast.find('.toast-icon').text(isError ? '✗' : '✓');
    $toast.css({
      'border-color': isError ? 'var(--accent-red)' : 'var(--accent-dim)',
      'color':        isError ? 'var(--accent-red)' : 'var(--accent)',
      'box-shadow':   isError
        ? '0 8px 32px rgba(0,0,0,.4), 0 0 20px rgba(247,94,123,.2)'
        : '0 8px 32px rgba(0,0,0,.4), 0 0 20px var(--accent-glow)',
    });
    $toast.addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.removeClass('show'), 2200);
  }

  /* ───────────────────────────────────────────────
     ERROR MODAL
  ─────────────────────────────────────────────── */
  function showError(msg) {
    $errorMsg.text(msg);
    $errorModal.removeClass('hidden');
  }

  function hideError() {
    $errorModal.addClass('hidden');
  }

  /* ───────────────────────────────────────────────
     AUTO-DETECT LANGUAGE
  ─────────────────────────────────────────────── */
  function tryAutoDetect(code) {
    const detected = BeautifierConfig.autoDetect(code);
    if (detected && detected !== currentLang) {
      setLanguage(detected);
      showToast(`Auto-detected: ${BeautifierConfig.LANGUAGES[detected].label}`);
      return true;
    }
    return false;
  }

  /* ───────────────────────────────────────────────
     COPY TO CLIPBOARD
  ─────────────────────────────────────────────── */
  function copyOutput() {
    const text = $output.val();
    if (!text) { showToast('Nothing to copy', true); return; }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('Copied to clipboard!'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    $output[0].select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch {
      showToast('Copy failed — please select and copy manually', true);
    }
  }

  /* ───────────────────────────────────────────────
     DOWNLOAD
  ─────────────────────────────────────────────── */
  function downloadOutput() {
    const text = $output.val();
    if (!text) { showToast('Nothing to download', true); return; }

    const meta = BeautifierConfig.LANGUAGES[currentLang];
    const filename = `beautified_code.${meta.ext}`;
    const blob = new Blob([text], { type: meta.mime + ';charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href      = url;
    a.download  = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded as ${filename}`);
  }

  /* ───────────────────────────────────────────────
     PASTE FROM CLIPBOARD
  ─────────────────────────────────────────────── */
  function pasteFromClipboard() {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.readText()
        .then(function (text) {
          $input.val(text);
          updateInputStats();
          updateLineNumbers($lineNumIn, $input);
          tryAutoDetect(text);
          scheduleBeautify(0);
          showToast('Pasted from clipboard!');
        })
        .catch(function () {
          showToast('Clipboard access denied — paste manually (Ctrl+V)', true);
        });
    } else {
      showToast('Clipboard API not available — paste manually (Ctrl+V)', true);
    }
  }

  /* ───────────────────────────────────────────────
     CLEAR
  ─────────────────────────────────────────────── */
  function clearAll() {
    $input.val('');
    $output.val('');
    $hlCode.text('');
    updateInputStats();
    updateOutputStats('');
    updateLineNumbers($lineNumIn,  $input);
    updateLineNumbers($lineNumOut, $output);
    $formatTime.text('');
    setStatus('Ready');
    $('.panel-output').removeClass('has-output');
    $input.focus();
  }

  /* ───────────────────────────────────────────────
     TOGGLE HIGHLIGHT
  ─────────────────────────────────────────────── */
  function toggleHighlight() {
    highlightEnabled = !highlightEnabled;
    $btnToggleHL.toggleClass('active', highlightEnabled);

    if (highlightEnabled) {
      $outputPlain.addClass('hidden');
      $outputHL.removeClass('hidden');
      renderHighlight($output.val());
    } else {
      $outputHL.addClass('hidden');
      $outputPlain.removeClass('hidden');
    }
  }

  /* ───────────────────────────────────────────────
     WRAP LINES
  ─────────────────────────────────────────────── */
  function applyWrapLines() {
    const wrap = $wrapLines.is(':checked');
    $('body').toggleClass('wrap-lines', wrap);
  }

  /* ───────────────────────────────────────────────
     EVENT BINDING
  ─────────────────────────────────────────────── */
  function bindEvents() {

    /* Language tab clicks */
    $langTabs.on('click', '.lang-tab', function () {
      const lang = $(this).data('lang');
      setLanguage(lang);
    });

    /* Input — instant formatting on type */
    $input.on('input', function () {
      updateInputStats();
      updateLineNumbers($lineNumIn, $input);
      scheduleBeautify();
    });

    /* Input scroll sync */
    $input.on('scroll', function () {
      syncScroll($input, $lineNumIn);
    });

    /* Output scroll sync */
    $output.on('scroll', function () {
      syncScroll($output, $lineNumOut);
    });

    /* Tab key in textarea — insert spaces/tab instead of focus-out */
    $input.on('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const { size, useTabs } = getIndentSettings();
        const indent = useTabs ? '\t' : ' '.repeat(size);
        const el  = this;
        const start = el.selectionStart;
        const end   = el.selectionEnd;
        const val   = el.value;

        // Handle multi-line indent (shift+tab to unindent)
        if (e.shiftKey) {
          const lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const lineText  = val.substring(lineStart, start);
          if (lineText.startsWith(indent)) {
            el.value = val.substring(0, lineStart) + lineText.substring(indent.length) + val.substring(start);
            el.selectionStart = el.selectionEnd = start - indent.length;
          }
        } else {
          el.value = val.substring(0, start) + indent + val.substring(end);
          el.selectionStart = el.selectionEnd = start + indent.length;
        }
        $(el).trigger('input');
      }
    });

    /* Beautify button */
    $btnBeautify.on('click', function () {
      scheduleBeautify(0);
    });

    /* Copy button */
    $btnCopy.on('click', copyOutput);

    /* Download button */
    $btnDownload.on('click', downloadOutput);

    /* Paste button */
    $btnPaste.on('click', pasteFromClipboard);

    /* Clear input button */
    $btnClearInput.on('click', function () {
      $input.val('');
      updateInputStats();
      updateLineNumbers($lineNumIn, $input);
      scheduleBeautify(0);
      $input.focus();
    });

    /* Clear all */
    $btnClearAll.on('click', clearAll);

    /* Toggle syntax highlight */
    $btnToggleHL.on('click', toggleHighlight);

    /* Indent size / wrap lines change → re-beautify */
    $indentSize.on('change', function () {
      if ($input.val().trim()) scheduleBeautify(0);
    });

    $wrapLines.on('change', function () {
      applyWrapLines();
      if (highlightEnabled) renderHighlight($output.val());
    });

    /* Error modal close */
    $modalClose.on('click', hideError);
    $errorModal.on('click', function (e) {
      if ($(e.target).is($errorModal)) hideError();
    });

    /* Keyboard shortcuts */
    $(document).on('keydown', function (e) {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Enter → Beautify
      if (ctrl && e.key === 'Enter') {
        e.preventDefault();
        scheduleBeautify(0);
        return;
      }
      // Ctrl+Shift+C → Copy output
      if (ctrl && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyOutput();
        return;
      }
      // Ctrl+Shift+D → Download
      if (ctrl && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        downloadOutput();
        return;
      }
      // Escape → close modal
      if (e.key === 'Escape') {
        hideError();
      }
    });

    /* Drag & Drop file onto input area */
    const $inputWrapper = $input.closest('.panel-input');
    $inputWrapper.on('dragover dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).css('border-color', 'var(--accent)');
    });

    $inputWrapper.on('dragleave dragend', function () {
      $(this).css('border-color', '');
    });

    $inputWrapper.on('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).css('border-color', '');

      const file = e.originalEvent.dataTransfer.files[0];
      if (!file) return;

      // Detect language from extension
      const ext  = file.name.split('.').pop().toLowerCase();
      const extMap = {
        html: 'html', htm: 'html',
        css:  'css',
        js:   'javascript', mjs: 'javascript',
        php:  'php',
        json: 'json',
        sql:  'sql',
        java: 'java',
      };
      if (extMap[ext]) setLanguage(extMap[ext]);

      const reader = new FileReader();
      reader.onload = function (ev) {
        const content = ev.target.result;
        $input.val(content);
        updateInputStats();
        updateLineNumbers($lineNumIn, $input);
        scheduleBeautify(0);
        showToast(`Loaded: ${file.name}`);
      };
      reader.onerror = function () {
        showToast('Failed to read file', true);
      };
      reader.readAsText(file);
    });

    /* Paste event on input (auto-detect on paste) */
    $input.on('paste', function () {
      // After paste the value hasn't updated yet, so defer
      setTimeout(function () {
        const code = $input.val();
        updateInputStats();
        updateLineNumbers($lineNumIn, $input);
        tryAutoDetect(code);
        scheduleBeautify(0);
      }, 20);
    });

  }

  /* ───────────────────────────────────────────────
     START
  ─────────────────────────────────────────────── */
  init();

  /* Expose for console debugging */
  window._CodeCraft = {
    setLang:    setLanguage,
    beautify:   runBeautify,
    clearAll:   clearAll,
  };

});
