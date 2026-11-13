/* ==========================================================================
   RNLearn — Tap-to-define glossary
   Marks the first appearance of each glossary term in an article and shows a
   short definition when the reader taps, clicks, hovers or presses Enter.
   Definitions live in js/glossary-data.js. Vanilla ES5-compatible JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.RNLEARN_GLOSSARY || [];
  if (!DATA.length) return;

  var SKIP = 'h1,h2,h3,h4,h5,h6,a,button,input,select,textarea,label,code,pre,script,style,noscript,' +
             'svg,canvas,nav,figure,.fig,.fig-container,.katex,.katex-display,.toc,.article-references,' +
             '.references-list,.series-banner,.article-meta,.gloss-term,blockquote cite';

  var entries = [];   // [{term, def}]
  var lookup = {};    // lower-case form -> entry index
  var forms = [];
  DATA.forEach(function (row, i) {
    entries.push({ term: row[0], def: row[1] });
    [row[0]].concat(row[2] || []).forEach(function (f) {
      var k = f.toLowerCase();
      if (!(k in lookup)) { lookup[k] = i; forms.push(f); }
    });
  });
  forms.sort(function (a, b) { return b.length - a.length; });   // longest phrases first
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var LETTER = 'A-Za-z0-9\\u00C0-\\u024F\\u1E00-\\u1EFF';
  var RE = new RegExp('(^|[^' + LETTER + '])(' + forms.map(esc).join('|') + ')(?![' + LETTER + '])', 'gi');

  var pop = null, current = null, hideTimer = null, uid = 0;

  function buildPopup() {
    pop = document.createElement('div');
    pop.id = 'gloss-pop';
    pop.className = 'gloss-pop';
    pop.setAttribute('role', 'tooltip');
    pop.hidden = true;
    pop.innerHTML = '<div class="gloss-pop-term"></div><div class="gloss-pop-def"></div>';
    pop.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    pop.addEventListener('mouseleave', function () { if (current && !current._pinned) scheduleHide(); });
    document.body.appendChild(pop);
  }

  function place(el) {
    var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth, gap = 8, margin = 12;
    pop.style.maxWidth = Math.min(340, vw - 2 * margin) + 'px';
    pop.style.left = '0px'; pop.style.top = '0px';
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(margin, Math.min(left, vw - pw - margin));
    var top = r.bottom + gap;
    var below = true;
    if (top + ph > window.innerHeight - margin && r.top - gap - ph > margin) { top = r.top - gap - ph; below = false; }
    pop.style.left = (left + window.pageXOffset) + 'px';
    pop.style.top = (top + window.pageYOffset) + 'px';
    pop.setAttribute('data-side', below ? 'below' : 'above');
  }

  function show(el, pinned) {
    clearTimeout(hideTimer);
    if (current && current !== el) { current.setAttribute('aria-expanded', 'false'); current._pinned = false; }
    var e = entries[+el.getAttribute('data-gloss')];
    pop.querySelector('.gloss-pop-term').textContent = e.term;
    pop.querySelector('.gloss-pop-def').textContent = e.def;
    pop.hidden = false;
    current = el;
    el._pinned = !!pinned || el._pinned;
    el.setAttribute('aria-expanded', 'true');
    el.setAttribute('aria-describedby', 'gloss-pop');
    place(el);
  }

  function hide() {
    if (!pop) return;
    pop.hidden = true;
    if (current) { current.setAttribute('aria-expanded', 'false'); current.removeAttribute('aria-describedby'); current._pinned = false; }
    current = null;
  }

  function scheduleHide() { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 180); }

  function skip(node) {
    var p = node.parentNode;
    return !p || (p.closest && p.closest(SKIP));
  }

  function mark(root) {
    var used = {};
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      if (!text || text.length < 3 || skip(node)) return;
      if (text.indexOf('$') !== -1 || text.indexOf('\\(') !== -1 || text.indexOf('\\[') !== -1) return;   // leave unrendered maths alone
      RE.lastIndex = 0;
      var m, pieces = [], last = 0;
      while ((m = RE.exec(text))) {
        var word = m[2], idx = lookup[word.toLowerCase()];
        if (idx === undefined || used[idx]) continue;
        used[idx] = true;
        var start = m.index + m[1].length;
        pieces.push(document.createTextNode(text.slice(last, start)));
        var b = document.createElement('span');
        b.className = 'gloss-term';
        b.setAttribute('role', 'button');
        b.setAttribute('tabindex', '0');
        b.id = 'gloss-' + (++uid);
        b.setAttribute('data-gloss', idx);
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-label', word + ' — show definition');
        b.textContent = word;
        pieces.push(b);
        last = start + word.length;
      }
      if (!pieces.length) return;
      pieces.push(document.createTextNode(text.slice(last)));
      var frag = document.createDocumentFragment();
      pieces.forEach(function (p) { frag.appendChild(p); });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function init() {
    var root = document.querySelector('.article-content');
    if (!root || root.getAttribute('data-gloss-done')) return;
    root.setAttribute('data-gloss-done', '1');
    buildPopup();
    mark(root);

    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    root.addEventListener('click', function (ev) {
      var t = ev.target.closest && ev.target.closest('.gloss-term');
      if (!t) return;
      ev.preventDefault();
      if (current === t && t._pinned) hide(); else show(t, true);
    });
    if (canHover) {
      root.addEventListener('mouseover', function (ev) {
        var t = ev.target.closest && ev.target.closest('.gloss-term');
        if (t && !(current && current._pinned)) show(t, false);
      });
      root.addEventListener('mouseout', function (ev) {
        var t = ev.target.closest && ev.target.closest('.gloss-term');
        if (t && current === t && !t._pinned) scheduleHide();
      });
    }
    root.addEventListener('focusin', function (ev) {
      var t = ev.target.closest && ev.target.closest('.gloss-term');
      if (t && ev.target.matches(':focus-visible')) show(t, false);
    });
    root.addEventListener('focusout', function (ev) {
      var t = ev.target.closest && ev.target.closest('.gloss-term');
      if (t && current === t && !t._pinned) scheduleHide();
    });
    document.addEventListener('click', function (ev) {
      if (!current) return;
      if (ev.target.closest && (ev.target.closest('.gloss-term') || ev.target.closest('#gloss-pop'))) return;
      hide();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && current) { var t = current; hide(); t.focus(); return; }
      var g = ev.target.closest && ev.target.closest('.gloss-term');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        if (current === g && g._pinned) hide(); else show(g, true);
      }
    });
    window.addEventListener('resize', function () { if (current) place(current); });
  }

  // Run after KaTeX has rendered the maths (site.js renders on load).
  function start() { setTimeout(init, 60); }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
