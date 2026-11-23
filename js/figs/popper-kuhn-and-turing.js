/* ==========================================================================
   RNLearn — Popper, Kuhn and Turing (Minds That Changed How We Know, Part 12)
   ========================================================================== */
(function () {
  'use strict';

  var FIG = window.FIG || (window.FIG = {});
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, o) {
    o = o || {};
    var t = el('text', {
      x: x, y: y, 'text-anchor': o.anchor || 'middle',
      'font-size': o.size || 12, 'font-family': o.font || FIG.getCSSVar('--font-sans'),
      'font-weight': o.weight || 400, fill: o.fill || FIG.getCSSVar('--ink')
    }, parent);
    t.textContent = s;
    return t;
  }
  function div(cls, parent, html) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  }
  function btn(label, parent, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls || 'fig-map-btn';
    b.textContent = label;
    parent.appendChild(b);
    return b;
  }
  function group(parent, label) {
    var g = div('fig-control-group', parent, '<span class="fig-control-label">' + label + '</span>');
    var row = div('', g);
    row.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;';
    return row;
  }
  function onTheme(fn) {
    if (!window.MutationObserver) return;
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    new MutationObserver(fn).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  function keyClick(node, fn) {
    node.addEventListener('click', fn);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function fmt(n, d) { return Number(n).toLocaleString('en-GB', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function scaler(svgWrap, base) { var k = Math.min(1.8, Math.max(1, base / (svgWrap.clientWidth || base))); return function (n) { return Math.round(n * k * 10) / 10; }; }
  function C() {
    return {
      ink: FIG.getCSSVar('--ink', '#17181c'),
      ink2: FIG.getCSSVar('--ink-secondary', '#4a4d57'),
      muted: FIG.getCSSVar('--ink-muted', '#6b6f7b'),
      faint: FIG.getCSSVar('--ink-faint', '#a2a6b4'),
      accent: FIG.getCSSVar('--accent', '#1b4965'),
      border: FIG.getCSSVar('--border', '#e2e0da'),
      surface: FIG.getCSSVar('--surface', '#ffffff'),
      raised: FIG.getCSSVar('--surface-raised', '#f4f2ed'),
      sunken: FIG.getCSSVar('--surface-sunken', '#eceae4'),
      warn: FIG.getCSSVar('--callout-warn', '#b45309'),
      tip: FIG.getCSSVar('--callout-tip', '#15803d'),
      key: FIG.getCSSVar('--callout-key', '#7c3aed')
    };
  }

  var ERAS = [
    { name: 'Falsification', color: '#b45309' },
    { name: 'Computation', color: '#1d4ed8' },
    { name: 'Revolutions', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1902', icon: '👶', era: 0, sec: 3, title: 'Popper born', text: 'Karl Popper is born in Vienna.' },
    { year: '1912', icon: '👶', era: 1, sec: 7, title: 'Turing born', text: 'Alan Turing is born in London.' },
    { year: '1919', icon: '🌒', era: 0, sec: 3, title: 'A risky prediction', text: 'Einstein’s light-bending prediction survives the eclipse test; the young Popper contrasts it with theories that can explain anything.' },
    { year: '1934', icon: '📘', era: 0, sec: 4, title: 'Logik der Forschung', text: 'Popper’s book proposes falsifiability as the mark of science (English edition, 1959).' },
    { year: '1936', icon: '📼', era: 1, sec: 7, title: '“On Computable Numbers”', text: 'Turing defines his machine and proves that some problems cannot be solved by any algorithm.' },
    { year: '1939–45', icon: '🔐', era: 1, sec: 8, title: 'Bletchley Park', text: 'Turing helps break the German Enigma cipher, designing the Bombe machines.' },
    { year: '1950', icon: '🤖', era: 1, sec: 9, title: 'The imitation game', text: 'Turing’s “Computing Machinery and Intelligence” asks whether machines can think and proposes a test.' },
    { year: '1954', icon: '🪦', era: 1, sec: 9, title: 'Turing dies', text: 'Two years after being convicted for homosexuality and forced into hormone treatment, Turing dies of cyanide poisoning.' },
    { year: '1962', icon: '📕', era: 2, sec: 10, title: 'Structure of Scientific Revolutions', text: 'Thomas Kuhn introduces paradigms, normal science and revolutions.' },
    { year: '1965', icon: '🎤', era: 2, sec: 12, title: 'Popper meets Kuhn', text: 'At a colloquium in London, Kuhn and Popper debate how science really advances.' },
    { year: '2013', icon: '🕊️', era: 1, sec: 9, title: 'A posthumous pardon', text: 'Turing receives a royal pardon, following a government apology in 2009.' }
  ];

  FIG['fig-m12-timeline'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var legend = div('', container);
    legend.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem 1rem;font-family:var(--font-sans);font-size:0.8rem;color:var(--ink-muted);margin-bottom:0.5rem;';
    ERAS.forEach(function (e) {
      legend.insertAdjacentHTML('beforeend', '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + e.color + ';margin-right:5px;vertical-align:-1px;"></span>' + e.name + '</span>');
    });
    var svgWrap = div('', container);
    var panel = div('timeline-panel', container);
    panel.style.cssText = 'margin-top:0.75rem;padding:0.8rem 1rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;min-height:4.5rem;';
    var selected = 0;
    function show(i) {
      selected = i;
      var ev = EVENTS[i];
      panel.innerHTML = '<div style="font-weight:700;color:var(--ink);">' + ev.icon + ' ' + ev.year + ': ' + ev.title + '</div>' +
        '<div style="color:var(--ink-secondary);margin-top:0.2rem;">' + ev.text + '</div>' +
        '<a href="#section-' + ev.sec + '" style="display:inline-block;margin-top:0.35rem;font-size:0.82rem;">Read more in section ' + ev.sec + ' →</a>';
      draw();
    }
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 720));
      var rows = W < 560 ? 2 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 34;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of key events');
      for (var r = 0; r < rows; r++) {
        var ly = r * rowH + 62, list = EVENTS.slice(r * per, (r + 1) * per);
        if (!list.length) continue;
        var step = list.length > 1 ? (W - 2 * pad) / (list.length - 1) : 0;
        el('line', { x1: pad - 18, y1: ly, x2: W - pad + 18, y2: ly, stroke: c.border, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        if (rows > 1 && r < rows - 1) txt(svg, W - 4, ly + 4, '→', { anchor: 'end', size: 13, fill: c.faint });
        list.forEach(function (ev, k) {
          var i = r * per + k, x = pad + k * step, era = ERAS[ev.era], above = k % 2 === 0;
          var g = el('g', { tabindex: 0, role: 'button', 'aria-label': ev.year + ': ' + ev.title, style: 'cursor:pointer;outline:none;' }, svg);
          el('line', { x1: x, y1: ly, x2: x, y2: above ? ly - 24 : ly + 24, stroke: era.color, 'stroke-width': 1.2, opacity: 0.6 }, g);
          el('circle', { cx: x, cy: ly, r: i === selected ? 15 : 12.5, fill: i === selected ? era.color : c.surface, stroke: era.color, 'stroke-width': 2 }, g);
          txt(g, x, ly + 5, ev.icon, { size: 13, font: 'sans-serif' });
          txt(g, x, above ? ly - 29 : ly + 39, ev.year, { size: 10.5, weight: i === selected ? 700 : 500, fill: i === selected ? c.ink : c.ink2 });
          keyClick(g, function () { show(i); });
        });
      }
    }
    show(selected);
    var lastW = 0;
    window.addEventListener('resize', function () { var w = svgWrap.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Shared helpers
     ----------------------------------------------------------------------- */
  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  var NOTE = '<br><span style="font-size:0.86rem;color:var(--ink-muted);">';
  var BLUE = '#2563eb', RED = '#dc2626', GREEN = '#16a34a', AMBER = '#d97706', PURPLE = '#7c3aed';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) { var b = btn(it, row); bs.push(b); b.addEventListener('click', function () { set(i); onPick(i); }); });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    set(initial);
    return row;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sdv(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; }
  function quantile(sorted, q) { var h = (sorted.length - 1) * q, i = Math.floor(h); return i + 1 < sorted.length ? sorted[i] + (h - i) * (sorted[i + 1] - sorted[i]) : sorted[i]; }
  function newSVG(svgWrap, container, H, label) { svgWrap.innerHTML = ''; var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); return { W: W, svg: FIG.createSVG(svgWrap, W, H, label), fs: scaler(svgWrap, 360) }; }

  /* Distribution functions: log-gamma, regularised incomplete beta, t and normal */
  function lgamma(x) {
    var g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); var s = 1.000000000190015;
    for (var j = 0; j < 6; j++) s += g[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      var del = d * c; h *= del; if (Math.abs(del - 1) < 3e-14) break;
    }
    return h;
  }
  function betainc(a, b, x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tcdf(t, df) { var p = 0.5 * betainc(df / 2, 0.5, df / (df + t * t)); return t > 0 ? 1 - p : p; }
  function tpdf(t, df) { return Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + t * t / df)); }
  function tinv(p, df) { var lo = -60, hi = 60; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (tcdf(m, df) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function ncdf(z) { return 0.5 * erfc(-z / Math.SQRT2); }
  function erfc(x) { var t = 1 / (1 + 0.5 * Math.abs(x)), r = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
  function npdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function ninv(p) { var lo = -10, hi = 10; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (ncdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  /* Binomial: P(X <= k) = I_{1-p}(n-k, k+1) */
  function binomCdf(k, n, p) { if (k < 0) return 0; if (k >= n) return 1; return betainc(n - k, k + 1, 1 - p); }
  function propIntervals(x, n, conf) {
    var z = ninv(1 - (1 - conf) / 2), ph = x / n, a = (1 - conf) / 2;
    var w = z * Math.sqrt(ph * (1 - ph) / n);
    var den = 1 + z * z / n, cen = (ph + z * z / (2 * n)) / den, hw = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / den;
    var lo = 0, hi = 1, i, m, cpL = 0, cpU = 1;
    if (x > 0) { lo = 0; hi = 1; for (i = 0; i < 50; i++) { m = (lo + hi) / 2; if (1 - binomCdf(x - 1, n, m) < a) lo = m; else hi = m; } cpL = (lo + hi) / 2; }
    if (x < n) { lo = 0; hi = 1; for (i = 0; i < 50; i++) { m = (lo + hi) / 2; if (binomCdf(x, n, m) > a) lo = m; else hi = m; } cpU = (lo + hi) / 2; }
    return { wald: [Math.max(0, ph - w), Math.min(1, ph + w)], wilson: [Math.max(0, cen - hw), Math.min(1, cen + hw)], cp: [cpL, cpU] };
  }
  function pct(x, d) { return fmt(100 * x, d === undefined ? 1 : d) + '%'; }
  function axisX(svg, c, fs, L, R, y, lo, hi, ticks, label, f) {
    el('line', { x1: L, y1: y, x2: R, y2: y, stroke: c.border }, svg);
    ticks.forEach(function (t) { var x = L + (t - lo) / (hi - lo) * (R - L); el('line', { x1: x, y1: y, x2: x, y2: y + 4, stroke: c.border }, svg); txt(svg, x, y + 16, f ? f(t) : String(t), { size: fs(10), fill: c.muted }); });
    if (label) txt(svg, (L + R) / 2, y + 32, label, { size: fs(10), fill: c.muted });
  }

  /* -----------------------------------------------------------------------
     Shared for the series: random numbers, plotting helpers, logic gates
     ----------------------------------------------------------------------- */
  var EC = '#0e7490';
  function rngSeed(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sup10(e) { return '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; }
  function sciHTML(v, d) { if (v === 0) return '0'; var e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 4) return fmt(v, d === undefined ? 3 : d); return fmt(v / Math.pow(10, e), d === undefined ? 2 : d) + ' × 10<sup>' + e + '</sup>'; }
  /* A generic x–y plot frame. o = {L,R,T,B,xl,xh,yl,yh,xticks,yticks,xlab,ylab,logx,logy,xfmt,yfmt}; returns mappers and a clip id. */
  var PLOT_ID = 0;
  function plotAxes(svg, c, fs, o) {
    var lx = function (v) { return o.logx ? Math.log10(v) : v; }, ly = function (v) { return o.logy ? Math.log10(Math.max(v, 1e-300)) : v; };
    var X = function (v) { return o.L + (lx(v) - lx(o.xl)) / (lx(o.xh) - lx(o.xl)) * (o.R - o.L); }, Y = function (v) { return o.B - (ly(v) - ly(o.yl)) / (ly(o.yh) - ly(o.yl)) * (o.B - o.T); };
    (o.yticks || []).forEach(function (v) { el('line', { x1: o.L, y1: Y(v), x2: o.R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, o.L - 6, Y(v) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); if (o.logy) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.yfmt ? o.yfmt(v) : String(v); });
    (o.xticks || []).forEach(function (v) { var t = txt(svg, X(v), o.B + 14, '', { size: fs(9), fill: c.muted }); if (o.logx) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.xfmt ? o.xfmt(v) : String(v); });
    el('line', { x1: o.L, y1: o.B, x2: o.R, y2: o.B, stroke: c.muted }, svg); el('line', { x1: o.L, y1: o.T, x2: o.L, y2: o.B, stroke: c.muted }, svg);
    if (o.xlab) txt(svg, (o.L + o.R) / 2, o.B + 30, o.xlab, { size: fs(10), fill: c.muted });
    if (o.ylab) { var yt = txt(svg, 12, (o.T + o.B) / 2, o.ylab, { size: fs(10), fill: c.muted }); yt.setAttribute('transform', 'rotate(-90 12 ' + ((o.T + o.B) / 2) + ')'); }
    var id = 'pc' + (++PLOT_ID), cp = el('clipPath', { id: id }, svg); el('rect', { x: o.L, y: o.T - 2, width: o.R - o.L, height: o.B - o.T + 4 }, cp);
    return { X: X, Y: Y, clip: 'url(#' + id + ')' };
  }
  function plotLine(svg, P, f, x0, x1, n, col, w, dash, logx) { var d = ''; for (var k = 0; k <= n; k++) { var x = logx ? Math.pow(10, Math.log10(x0) + (Math.log10(x1) - Math.log10(x0)) * k / n) : x0 + (x1 - x0) * k / n, y = f(x); if (!isFinite(y)) continue; d += (d ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); } el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2.2, 'stroke-dasharray': dash || 'none', 'clip-path': P.clip }, svg); }
  function legend(svg, c, fs, W, wide, narrow) { txt(svg, 10, 14, W < 520 ? narrow : wide, { anchor: 'start', size: fs(10), fill: c.muted }); }

  var MC = '#0e7490';

  /* -----------------------------------------------------------------------
     Figure: the Wason selection task
     ----------------------------------------------------------------------- */
  FIG['fig-wason'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CARDS = ['A', 'K', '4', '7'], sel = [false, false, false, false], shown = false;
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function render() {
      view.innerHTML = '<p style="font-family:var(--font-sans);margin:0.6rem 0">Each card has a letter on one side and a number on the other. <strong>Rule: “If a card has a vowel on one side, it has an even number on the other.”</strong> Which cards must you turn over to test whether the rule is false? Tap to select, then check.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin:0.4rem 0">' + CARDS.map(function (cd, i) { return '<button data-i="' + i + '" style="width:72px;height:100px;font-size:2rem;font-weight:700;border-radius:10px;border:3px solid ' + (sel[i] ? MC : 'var(--border)') + ';background:' + (sel[i] ? MC + '22' : 'var(--surface-raised)') + ';color:var(--ink);cursor:pointer">' + cd + '</button>'; }).join('') + '</div><button class="fig-btn" id="ws-check" style="margin-top:6px">Check my choice</button> <button class="fig-btn" id="ws-reset" style="margin-top:6px">Reset</button>';
      Array.prototype.forEach.call(view.querySelectorAll('button[data-i]'), function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-i'); sel[i] = !sel[i]; shown = false; render(); }); });
      view.querySelector('#ws-check').addEventListener('click', function () { shown = true; render(); });
      view.querySelector('#ws-reset').addEventListener('click', function () { sel = [false, false, false, false]; shown = false; render(); });
      var right = sel[0] && !sel[1] && !sel[2] && sel[3];
      out.innerHTML = (shown ? (right ? '<strong style="color:#16a34a">Correct: A and 7.</strong> ' : '<strong>The answer is A and 7.</strong> You chose ' + (CARDS.filter(function (c2, i) { return sel[i]; }).join(', ') || 'nothing') + '. ') + 'A could hide an odd number, which would break the rule; 7 could hide a vowel, which would also break it. K is irrelevant, and 4 cannot refute the rule whatever is on its back.' : 'Choose your cards, then press “Check my choice”.') + NOTE + 'In Peter Wason’s experiments of the 1960s, only about one person in ten chose correctly; most picked A and 4, looking for cases that <em>confirm</em> the rule. Popper’s point was the logical asymmetry: no number of confirming instances proves a universal rule, but a single counterexample refutes it. People find the same logic easy in familiar social settings, such as checking who is drinking alcohol under age, which suggests that our reasoning depends on context.</span>';
    }
    render();
  };

  /* -----------------------------------------------------------------------
     Figure: epicycles can fit anything
     ----------------------------------------------------------------------- */
  FIG['fig-epicycles'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nE = 1, shape = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Path to fit', ['A planet’s looping path', 'A square', 'A heart'], 0, function (i) { shape = i; draw(); });
    FIG.slider(controls, { id: 'ep-n', label: 'Number of circles (epicycles)', min: 1, max: 40, step: 1, value: nE, onChange: function (x) { nE = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function target(t) {
      if (shape === 0) { var a = 2 * Math.PI * t; return [Math.cos(a) + 0.5 * Math.cos(3 * a), Math.sin(a) + 0.5 * Math.sin(3 * a)]; }
      if (shape === 1) { var s = (t * 4) % 1, side = Math.floor(t * 4) % 4, P = [[1, 1], [-1, 1], [-1, -1], [1, -1], [1, 1]], p = P[side], q = P[side + 1]; return [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s]; }
      var b = 2 * Math.PI * t; return [16 * Math.pow(Math.sin(b), 3) / 17, (13 * Math.cos(b) - 5 * Math.cos(2 * b) - 2 * Math.cos(3 * b) - Math.cos(4 * b)) / 17];
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A path and its approximation by circles on circles'), W = A.W, svg = A.svg, fs = A.fs, M = 256, cx = W / 2, cy = 150, R = Math.min(100, W * 0.3);
      var z = []; for (var k = 0; k < M; k++) z.push(target(k / M));
      var coef = []; for (var f = -M / 2; f < M / 2; f++) { var re = 0, im = 0; for (k = 0; k < M; k++) { var ang = -2 * Math.PI * f * k / M; re += z[k][0] * Math.cos(ang) - z[k][1] * Math.sin(ang); im += z[k][0] * Math.sin(ang) + z[k][1] * Math.cos(ang); } coef.push([f, re / M, im / M, Math.hypot(re, im) / M]); }
      coef.sort(function (a, b) { return b[3] - a[3]; }); var use = coef.slice(0, nE);
      function approx(t) { var x = 0, y = 0; use.forEach(function (cf) { var a = 2 * Math.PI * cf[0] * t; x += cf[1] * Math.cos(a) - cf[2] * Math.sin(a); y += cf[1] * Math.sin(a) + cf[2] * Math.cos(a); }); return [x, y]; }
      var dT = '', dA = '', err = 0; for (k = 0; k <= 300; k++) { var t = k / 300, p = target(t % 1), q = approx(t); dT += (k ? 'L' : 'M') + (cx + p[0] * R).toFixed(1) + ' ' + (cy - p[1] * R).toFixed(1); dA += (k ? 'L' : 'M') + (cx + q[0] * R).toFixed(1) + ' ' + (cy - q[1] * R).toFixed(1); err += Math.hypot(p[0] - q[0], p[1] - q[1]); }
      el('path', { d: dT, fill: 'none', stroke: c.border, 'stroke-width': 4 }, svg); el('path', { d: dA, fill: 'none', stroke: MC, 'stroke-width': 2 }, svg);
      var x = 0, y = 0; use.forEach(function (cf) { var r = cf[3]; el('circle', { cx: cx + x * R, cy: cy - y * R, r: r * R, fill: 'none', stroke: AMBER, 'stroke-width': 0.8, opacity: 0.6 }, svg); x += cf[1]; y += cf[2]; });
      legend(svg, c, fs, W, 'grey: the path to fit · teal: sum of ' + nE + ' uniformly turning circles · amber: the circles at the start', 'grey: target · teal: circles');
      out.innerHTML = 'Average mismatch with ' + nE + ' circle' + (nE > 1 ? 's' : '') + ': <strong>' + fmt(err / 301 * 100, 1) + '%</strong> of the path’s size.' + NOTE + 'Ptolemaic astronomy added circles upon circles (epicycles) to match planetary motions, and could always add more to fix a discrepancy. Mathematically, enough circles can fit <em>any</em> closed path, even a square or a heart: this is Fourier analysis. A framework that can accommodate any observation risks predicting nothing. Popper argued that good theories forbid things; Kuhn replied that every working paradigm survives anomalies by such adjustments until a crisis makes a rival more attractive.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a Turing machine
     ----------------------------------------------------------------------- */
  FIG['fig-turing'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var PROGS = [
      { name: 'Add 1 to a binary number', tape: '1011', start: 'right', rules: { 'right,0': ['0', 'R', 'right'], 'right,1': ['1', 'R', 'right'], 'right,_': ['_', 'L', 'carry'], 'carry,1': ['0', 'L', 'carry'], 'carry,0': ['1', 'L', 'done'], 'carry,_': ['1', 'L', 'done'] }, desc: 'Move right to the end, then add 1 with carries, moving left.' },
      { name: 'Busy beaver (3 states)', tape: '', start: 'A', rules: { 'A,_': ['1', 'R', 'B'], 'A,1': ['1', 'R', 'HALT'], 'B,_': ['_', 'R', 'C'], 'B,1': ['1', 'R', 'B'], 'C,_': ['1', 'L', 'C'], 'C,1': ['1', 'L', 'A'] }, desc: 'The 3-state, 2-symbol machine that writes the most 1s (six) before halting, starting on a blank tape.' }
    ];
    var pi = 0, tape, head, state, steps, running = false, last = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Program', PROGS.map(function (p) { return p.name; }), 0, function (i) { pi = i; reset(); });
    var row = group(controls, 'Run');
    btn('Step', row).addEventListener('click', function () { step(); });
    var bR = btn('Run', row); bR.addEventListener('click', function () { running = !running; bR.textContent = running ? 'Pause' : 'Run'; });
    btn('Reset', row).addEventListener('click', function () { reset(); });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function reset() { var p = PROGS[pi]; tape = {}; for (var i = 0; i < p.tape.length; i++) tape[i] = p.tape[i]; head = 0; state = p.start; steps = 0; running = false; bR.textContent = 'Run'; render(''); }
    function step() { if (state === 'done' || state === 'HALT') return; var sym = tape[head] || '_', r = PROGS[pi].rules[state + ',' + sym]; if (!r) { state = 'HALT'; render(''); return; } var msg = 'In state ' + state + ' reading ' + sym + ': write ' + r[0] + ', move ' + (r[1] === 'R' ? 'right' : 'left') + ', go to ' + r[2] + '.'; if (r[0] === '_') delete tape[head]; else tape[head] = r[0]; head += r[1] === 'R' ? 1 : -1; state = r[2]; steps++; render(msg); }
    function render(msg) {
      var cells = ''; for (var i = head - 7; i <= head + 7; i++) { var s = tape[i] || '_', isH = i === head; cells += '<div style="width:32px;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);font-family:var(--font-mono,monospace);font-size:1.1rem;font-weight:700;background:' + (isH ? MC + '33' : 'var(--surface-raised)') + ';color:' + (s === '_' ? 'var(--ink-faint)' : 'var(--ink)') + '">' + (s === '_' ? '·' : s) + '</div>'; }
      var ones = Object.keys(tape).filter(function (k) { return tape[k] === '1'; }).length, read = Object.keys(tape).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return tape[k]; }).join('');
      view.innerHTML = '<div style="font-family:var(--font-sans);margin-top:0.6rem"><div style="display:flex;justify-content:center;overflow:hidden">' + cells + '</div><div style="text-align:center;margin:4px 0;color:' + MC + ';font-weight:700">▲ head · state <span style="font-family:var(--font-mono,monospace)">' + state + '</span> · step ' + steps + '</div></div>';
      out.innerHTML = (msg || PROGS[pi].desc) + (state === 'done' || state === 'HALT' ? ' <strong>Halted.</strong> Tape: ' + (read || 'blank') + (pi === 1 ? ' (' + ones + ' ones in ' + steps + ' steps)' : '') + '.' : '') + NOTE + 'Turing’s 1936 machine is the simplest possible computer: an endless tape of squares, a head that reads and writes one symbol at a time, and a finite table of rules saying, for each state and symbol, what to write, which way to move and which state to enter. Turing argued that any calculation a person can do by following rules can be done by such a machine, and showed that one “universal” machine can imitate any other if given its rule table on the tape: the idea of the stored-program computer.</span>';
    }
    reset();
    FIG.animate(figEl, function (now) { if (!running) return; if (!last || now - last > 350) { last = now; step(); if (state === 'done' || state === 'HALT') { running = false; bR.textContent = 'Run'; } } });
  };

  /* -----------------------------------------------------------------------
     Figure: diagonalisation and the halting problem
     ----------------------------------------------------------------------- */
  FIG['fig-diagonal'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 6, seed = 3;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dg-n', label: 'Rows in the list', min: 3, max: 10, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    var row = group(controls, 'List'); btn('New list', row).addEventListener('click', function () { seed++; draw(); });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var r = rngSeed(seed * 11 + n), M = []; for (var i = 0; i < n; i++) { M.push([]); for (var j = 0; j < n; j++) M[i].push(r() < 0.5 ? 0 : 1); }
      var diag = M.map(function (rw, i) { return 1 - rw[i]; });
      var html = '<div style="overflow-x:auto;margin-top:0.6rem"><table style="border-collapse:collapse;font-family:var(--font-mono,monospace);font-size:0.95rem;margin:auto">';
      html += '<tr><td></td>' + M[0].map(function (_, j) { return '<td style="padding:3px 7px;color:var(--ink-muted);font-size:0.75rem">' + (j + 1) + '</td>'; }).join('') + '</tr>';
      M.forEach(function (rw, i) { html += '<tr><td style="padding:3px 8px;color:var(--ink-muted);font-family:var(--font-sans);font-size:0.8rem">sequence ' + (i + 1) + '</td>' + rw.map(function (v, j) { return '<td style="padding:4px 8px;border:1px solid var(--border);text-align:center;' + (i === j ? 'background:' + AMBER + '44;font-weight:700' : '') + '">' + v + '</td>'; }).join('') + '</tr>'; });
      html += '<tr><td style="padding:6px 8px;color:' + MC + ';font-family:var(--font-sans);font-size:0.8rem;font-weight:700">flipped diagonal</td>' + diag.map(function (v) { return '<td style="padding:4px 8px;border:2px solid ' + MC + ';text-align:center;font-weight:700;color:' + MC + '">' + v + '</td>'; }).join('') + '</tr></table></div>';
      view.innerHTML = html;
      out.innerHTML = 'The flipped diagonal differs from sequence 1 in place 1, from sequence 2 in place 2, and so on: it is <strong>not anywhere in the list</strong>, however the list was made.' + NOTE + 'Georg Cantor used this “diagonal argument” in 1891 to show that the infinite sequences of 0s and 1s cannot all be listed. Turing turned it on computation. Suppose some program could decide, for every program and input, whether it eventually halts. Build a contrary program that looks up its own entry and does the opposite: halt if predicted to loop, loop if predicted to halt. Fed itself, it contradicts the prediction. So no such decider exists: the <em>halting problem</em> is undecidable, and there are precise questions no algorithm can ever answer.</span>';
    }
    draw();
  };

  FIG['fig-quiz-m12'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'According to Popper, what makes a theory scientific?', options: ['It has been confirmed many times', 'It could in principle be refuted by observation', 'It is accepted by experts', 'It is mathematical'], answer: 1, explanation: 'Falsifiability.' },
      { question: 'Why did Popper think Einstein’s theory was more scientific than Freud’s or Marx’s?', options: ['It was older', 'It made risky predictions that could have failed', 'It was mathematical', 'Einstein was famous'], answer: 1, explanation: 'The 1919 eclipse test.' },
      { question: 'In the Wason selection task, which cards test “if vowel, then even”?', options: ['A and 4', 'A and 7', 'K and 4', 'All four'], answer: 1, explanation: 'Only those that could reveal a counterexample.' },
      { question: 'For Kuhn, “normal science” is…', options: ['Bad science', 'Puzzle-solving within an accepted paradigm', 'Science done by amateurs', 'Testing every assumption constantly'], answer: 1, explanation: 'Most of scientific work.' },
      { question: 'Kuhn called rival paradigms “incommensurable” because…', options: ['They use different units', 'They lack a fully neutral common standard of comparison', 'One is always wrong', 'They are identical'], answer: 1, explanation: 'Meanings and standards shift.' },
      { question: 'A Turing machine consists of…', options: ['Transistors', 'A tape, a read/write head and a finite table of rules', 'A neural network', 'Gears and levers'], answer: 1, explanation: '1936.' },
      { question: 'The halting problem shows that…', options: ['Computers always halt', 'No algorithm can decide for every program whether it halts', 'Programs never loop', 'Turing machines are slow'], answer: 1, explanation: 'Proved by diagonalisation.' },
      { question: 'Turing’s “imitation game” asks whether…', options: ['A machine can calculate faster than a person', 'An interrogator can tell a machine from a human by conversation', 'A machine can play chess', 'A person can imitate a machine'], answer: 1, explanation: 'Now called the Turing test.' },
      { question: 'Searle’s Chinese Room argument claims that…', options: ['Computers cannot translate', 'Manipulating symbols by rules is not enough for understanding', 'Chinese is hard', 'The Turing test is too easy to pass'], answer: 1, explanation: '1980.' },
      { question: 'Which work did Turing do during the Second World War?', options: ['Radar', 'Breaking the Enigma cipher at Bletchley Park', 'The atomic bomb', 'Rocketry'], answer: 1, explanation: 'He designed the Bombe.' }
    ]);
  };
})();
