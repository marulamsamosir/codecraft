/**
 * CodeCraft Beautifier — beautifier-config.js
 * Configuration & formatter routing for all supported languages.
 * Languages: HTML, CSS, JavaScript, PHP, JSON, SQL, Java
 */

window.BeautifierConfig = (function () {
  'use strict';

  /* ─── Language metadata ─── */
  const LANGUAGES = {
    html: {
      label: 'HTML',
      ext:   'html',
      mime:  'text/html',
      prism: 'html',
      dot:   'html-dot',
    },
    css: {
      label: 'CSS',
      ext:   'css',
      mime:  'text/css',
      prism: 'css',
      dot:   'css-dot',
    },
    javascript: {
      label: 'JavaScript',
      ext:   'js',
      mime:  'text/javascript',
      prism: 'javascript',
      dot:   'js-dot',
    },
    php: {
      label: 'PHP',
      ext:   'php',
      mime:  'application/x-httpd-php',
      prism: 'php',
      dot:   'php-dot',
    },
    json: {
      label: 'JSON',
      ext:   'json',
      mime:  'application/json',
      prism: 'json',
      dot:   'json-dot',
    },
    sql: {
      label: 'SQL',
      ext:   'sql',
      mime:  'text/x-sql',
      prism: 'sql',
      dot:   'sql-dot',
    },
    java: {
      label: 'Java',
      ext:   'java',
      mime:  'text/x-java',
      prism: 'java',
      dot:   'java-dot',
    },
  };

  /* ─── js-beautify shared options factory ─── */
  function jsBeautifyOpts(indentSize, useTabs) {
    return {
      indent_size:              useTabs ? 1 : indentSize,
      indent_char:              useTabs ? '\t' : ' ',
      indent_with_tabs:         useTabs,
      preserve_newlines:        true,
      max_preserve_newlines:    2,
      jslint_happy:             false,
      space_after_anon_function: true,
      brace_style:              'collapse',
      keep_array_indentation:   false,
      keep_function_indentation: false,
      space_before_conditional: true,
      break_chained_methods:    false,
      eval_code:                false,
      unescape_strings:         false,
      wrap_line_length:         0,
      wrap_attributes:          'auto',
      wrap_attributes_indent_size: indentSize,
      end_with_newline:         true,
      templating:               ['auto'],
    };
  }

  /* ─── HTML beautify options ─── */
  function htmlOpts(indentSize, useTabs) {
    return Object.assign(jsBeautifyOpts(indentSize, useTabs), {
      wrap_line_length:         0,
      wrap_attributes:          'auto',
      indent_inner_html:        true,
      indent_body_inner_html:   true,
      indent_head_inner_html:   true,
      indent_handlebars:        false,
      unformatted:              [],
      content_unformatted:      ['pre', 'textarea'],
      extra_liners:             ['head', 'body', '/html'],
      end_with_newline:         true,
    });
  }

  /* ─── CSS beautify options ─── */
  function cssOpts(indentSize, useTabs) {
    return {
      indent_size:              useTabs ? 1 : indentSize,
      indent_char:              useTabs ? '\t' : ' ',
      indent_with_tabs:         useTabs,
      selector_separator_newline: true,
      end_with_newline:         true,
      newline_between_rules:    true,
      space_around_combinator:  true,
    };
  }

  /* ─── SQL dialect detection ─── */
  function detectSqlDialect(code) {
    const lower = code.toLowerCase();
    if (lower.includes('top ') || lower.includes('nolock') || lower.includes('with('))
      return 'tsql';
    if (lower.includes('show tables') || lower.includes('show databases') || lower.includes('engine='))
      return 'mysql';
    if (lower.includes('serial') || lower.includes('pg_') || lower.includes('returning'))
      return 'postgresql';
    return 'sql'; // standard
  }

  /* ─── PHP beautifier (wraps JS beautify after stripping <?php) ─── */
  function phpBeautify(code, indentSize, useTabs) {
    // If pure PHP (starts with <?php or <?), beautify the script content as JS-like
    // We use html_beautify which handles <?php tags via templating
    const opts = htmlOpts(indentSize, useTabs);
    opts.templating = ['php'];
    // Try html_beautify with php templating
    return window.html_beautify(code, opts);
  }

  /* ─── Java beautifier (rule-based, no external lib needed) ─── */
  function javaBeautify(code, indentSize, useTabs) {
    const indent = useTabs ? '\t' : ' '.repeat(indentSize);
    let level  = 0;
    let result = '';
    let i      = 0;
    const len  = code.length;

    // Remove excess whitespace/newlines first
    const tokens = tokenizeJava(code);
    let inString  = false;
    let inComment = false;

    // Simple re-formatter: track braces, handle semicolons
    let formatted  = '';
    let indentLevel = 0;
    let prevToken  = '';
    let needNewline = false;

    function addLine(text) {
      if (text.trim() === '') return;
      formatted += indent.repeat(Math.max(0, indentLevel)) + text.trimEnd() + '\n';
    }

    // Split by lines first, then reindent
    const lines = code
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''));

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (!line) { formatted += '\n'; continue; }

      // Decrease indent for closing braces/brackets BEFORE printing
      const closingMatch = line.match(/^(\}|\)|\])/);
      if (closingMatch) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Decrease for lines starting with case/default at same level as switch
      if (/^(case\s|default\s*:)/.test(line) && indentLevel > 0) {
        // keep as-is for Java switch
      }

      addLine(line);

      // Increase indent after opening braces
      if (line.endsWith('{')) {
        indentLevel++;
      }
      // Decrease for lines that close but also had opening (e.g. "} else {")
      if (/^\}.*\{$/.test(line)) {
        // net zero change already handled above
      }
    }

    return formatted;
  }

  /* ─── Tokenize Java (minimal, for reference) ─── */
  function tokenizeJava(code) {
    return code.match(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\w+|[^\w\s]/g) || [];
  }

  /* ─── Main beautify dispatcher ─── */
  function beautify(lang, code, indentSize, useTabs) {
    if (!code || !code.trim()) return '';

    switch (lang) {
      case 'html':
        return window.html_beautify(code, htmlOpts(indentSize, useTabs));

      case 'css':
        return window.css_beautify(code, cssOpts(indentSize, useTabs));

      case 'javascript':
        return window.js_beautify(code, jsBeautifyOpts(indentSize, useTabs));

      case 'json': {
        // Validate and pretty-print JSON
        try {
          // Strip comments before parsing (lenient JSON)
          const stripped = code
            .replace(/\/\/[^\n]*/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .trim();
          const parsed = JSON.parse(stripped);
          const indentChar = useTabs ? '\t' : indentSize;
          return JSON.stringify(parsed, null, indentChar);
        } catch (e) {
          throw new Error('Invalid JSON: ' + e.message);
        }
      }

      case 'sql': {
        if (typeof window.sqlFormatter === 'undefined') {
          throw new Error('sql-formatter library not loaded.');
        }
        const dialect = detectSqlDialect(code);
        return window.sqlFormatter.format(code, {
          language:   dialect,
          tabWidth:   useTabs ? 1 : indentSize,
          useTabs:    useTabs,
          keywordCase: 'upper',
          dataTypeCase: 'upper',
          functionCase: 'upper',
          expressionWidth: 60,
          linesBetweenQueries: 2,
          denseOperators: false,
          newlineBeforeSemicolon: false,
        });
      }

      case 'php':
        return phpBeautify(code, indentSize, useTabs);

      case 'java':
        return javaBeautify(code, indentSize, useTabs);

      default:
        return code;
    }
  }

  /* ─── Get Prism language class ─── */
  function getPrismClass(lang) {
    const map = {
      html:       'language-html',
      css:        'language-css',
      javascript: 'language-javascript',
      php:        'language-php',
      json:       'language-json',
      sql:        'language-sql',
      java:       'language-java',
    };
    return map[lang] || 'language-none';
  }

  /* ─── Detect language from code heuristic ─── */
  function autoDetect(code) {
    if (!code || !code.trim()) return null;
    const t = code.trim();

    if (t.startsWith('{') || t.startsWith('['))              return 'json';
    if (/<(!DOCTYPE|html|head|body|div|span|p |br|hr)/i.test(t)) return 'html';
    if (/<\?php/i.test(t))                                   return 'php';
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\b/i.test(t)) return 'sql';
    if (/(^|\n)\s*@(media|keyframes|import|charset|font-face)/i.test(t))    return 'css';
    if (/\{[^}]*:[^}]*;/.test(t) && !/</.test(t))           return 'css';
    if (/(public|private|protected)\s+(static\s+)?\w+\s+\w+\s*\(/.test(t)) return 'java';
    if (/class\s+\w+\s*(extends|implements)?/.test(t) && /\bvoid\b/.test(t)) return 'java';
    if (/(function|var|let|const|=>|\bwindow\b|\bdocument\b)/.test(t))       return 'javascript';

    return null;
  }

  /* ─── Public API ─── */
  return {
    LANGUAGES,
    beautify,
    getPrismClass,
    autoDetect,
  };

})();
