/* ==========================================================================
   RNLearn — Hume and Kant (Minds That Changed How We Know, Part 7)
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
    { name: 'Hume’s scepticism', color: '#b45309' },
    { name: 'Kant’s answer', color: '#1d4ed8' },
    { name: 'Afterlife', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1711', icon: '👶', era: 0, sec: 3, title: 'Hume born', text: 'David Hume is born in Edinburgh.' },
    { year: '1724', icon: '👶', era: 1, sec: 7, title: 'Kant born', text: 'Immanuel Kant is born in Königsberg, East Prussia, where he will spend almost his whole life.' },
    { year: '1739–40', icon: '📗', era: 0, sec: 4, title: 'A Treatise of Human Nature', text: 'Hume’s Treatise “fell dead-born from the press”, as he later put it.' },
    { year: '1748', icon: '📘', era: 0, sec: 5, title: 'The Enquiry', text: 'Hume’s Enquiry Concerning Human Understanding restates his arguments about causation and induction more accessibly.' },
    { year: '1755', icon: '🌌', era: 1, sec: 8, title: 'The nebular hypothesis', text: 'Kant’s Universal Natural History proposes that the Solar System formed from a rotating cloud, and that nebulae are distant galaxies.' },
    { year: '1763', icon: '🎲', era: 2, sec: 6, title: 'Bayes’s essay', text: 'Richard Price publishes Thomas Bayes’s posthumous essay on reasoning from evidence to probabilities, partly as a reply to Hume.' },
    { year: '1776', icon: '🪦', era: 0, sec: 11, title: 'Hume dies', text: 'Hume dies calmly in Edinburgh, to the dismay of those who expected a deathbed conversion.' },
    { year: '1781', icon: '📕', era: 1, sec: 9, title: 'Critique of Pure Reason', text: 'Kant’s Critique, written after Hume woke him from his “dogmatic slumber”, appears.' },
    { year: '1796', icon: '☀️', era: 2, sec: 8, title: 'Laplace’s version', text: 'Pierre-Simon Laplace independently proposes a nebular origin of the Solar System.' },
    { year: '1804', icon: '🪦', era: 1, sec: 11, title: 'Kant dies', text: 'Kant dies in Königsberg; his last words are reported as “Es ist gut” (“It is good”).' }
  ];

  FIG['fig-m7-timeline'] = function (figEl) {
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
     Figure: will the Sun rise tomorrow?
     ----------------------------------------------------------------------- */
  FIG['fig-sunrise'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 100, turkey = false;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'sr-n', label: 'Days observed so far (log₁₀)', min: 0, max: 6.3, step: 0.1, value: 2, onChange: function (x) { n = Math.round(Math.pow(10, x)); draw(); } });
    choice(controls, 'Who is reasoning?', ['A person watching sunrises', 'Russell’s turkey'], 0, function (i) { turkey = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Confidence that a pattern will continue against the number of past observations'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 214, xl: 1, xh: 2e6, yl: 0.5, yh: 1, logx: true, xticks: [1, 10, 100, 1e3, 1e4, 1e5, 1e6], yticks: [0.5, 0.75, 1], yfmt: function (v) { return fmt(v * 100, 0) + '%'; }, xlab: 'past successes n', ylab: 'probability next' });
      plotLine(svg, P, function (k) { return (k + 1) / (k + 2); }, 1, 2e6, 200, MC, 2.6, null, true);
      el('circle', { cx: P.X(n), cy: P.Y((n + 1) / (n + 2)), r: 5, fill: turkey ? RED : AMBER }, svg);
      legend(svg, c, fs, W, 'Laplace’s rule of succession: after n successes and no failures, estimate (n + 1)/(n + 2)', 'rule of succession (n + 1)/(n + 2)');
      var p = (n + 1) / (n + 2);
      out.innerHTML = (turkey ? 'The turkey has been fed every morning for <strong>' + n.toLocaleString('en-GB') + ' days</strong> and is ' + fmt(p * 100, p > 0.999 ? 4 : 1) + '% confident of breakfast tomorrow. Tomorrow is Christmas Eve.' : 'After <strong>' + n.toLocaleString('en-GB') + '</strong> sunrises, the rule of succession gives a probability of <strong>' + (p > 0.9999 ? '1 − ' + sciHTML(1 - p, 1) : fmt(p * 100, 2) + '%') + '</strong> that the Sun rises tomorrow.') + NOTE + 'Hume asked what justifies expecting the future to resemble the past. Probability theory, developed by Bayes and Laplace partly in response, can tell us how confident to be <em>if</em> we assume the world is uniform; Laplace famously applied his rule to sunrises. But no calculation removes the assumption. Bertrand Russell’s turkey reasoned impeccably from experience, and was wrong. Unless we know <em>why</em> a pattern holds, more instances cannot rule out a change.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: constant conjunction and hidden causes
     ----------------------------------------------------------------------- */
  FIG['fig-conjunction'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var view = 0, seed = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['All days together', 'Separate summer and winter days'], 0, function (i) { view = i; draw(); });
    var row = group(controls, 'Data'); btn('New year of data', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), r = rngSeed(seed * 13 + 1), pts = [];
      for (var d = 0; d < 120; d++) { var hot = r() < 0.5, T = hot ? 22 + r() * 10 : 4 + r() * 12, ice = 20 + 6 * T + (r() - 0.5) * 60, swim = 2 + 0.3 * T + (r() - 0.5) * 4; pts.push([ice, Math.max(0, swim), hot]); }
      var A = newSVG(svgWrap, container, 270, 'Ice cream sales against sunburn cases on each day'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: 260, yl: 0, yh: 16, xticks: [0, 50, 100, 150, 200, 250], yticks: [0, 4, 8, 12, 16], xlab: 'ice creams sold', ylab: 'sunburn cases' });
      function corr(a) { var n = a.length, mx = 0, my = 0; a.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= n; my /= n; var sxy = 0, sxx = 0, syy = 0; a.forEach(function (p) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); syy += (p[1] - my) * (p[1] - my); }); return sxy / Math.sqrt(sxx * syy); }
      pts.forEach(function (p) { el('circle', { cx: P.X(p[0]), cy: P.Y(p[1]), r: 3.5, fill: view ? (p[2] ? AMBER : BLUE) : MC, opacity: 0.75 }, svg); });
      var rAll = corr(pts), rS = corr(pts.filter(function (p) { return p[2]; })), rW = corr(pts.filter(function (p) { return !p[2]; }));
      legend(svg, c, fs, W, view ? 'amber: hot summer days · blue: cool days; within each group the link is much weaker' : 'each dot is one day: more ice cream, more sunburn', view ? 'amber: summer · blue: winter' : 'each dot is a day');
      out.innerHTML = 'Correlation over all days: <strong>r = ' + fmt(rAll, 2) + '</strong>' + (view ? '; summer days only: r = ' + fmt(rS, 2) + '; cool days only: r = ' + fmt(rW, 2) : '') + '.' + NOTE + 'Hume argued that all we ever observe is <em>constant conjunction</em>: one kind of event regularly followed or accompanied by another. We never see a “necessary connection”. Here ice cream and sunburn rise and fall together, yet neither causes the other: a hidden common cause, sunny weather, drives both. Separating the days by season reveals it. Modern statistics and causal inference, with randomised experiments and causal diagrams, are ways of getting from Humean correlations to justified claims about causes.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Kant's nebular hypothesis
     ----------------------------------------------------------------------- */
  FIG['fig-nebula'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var t = 0, tilt = 70, P0 = [], r = rngSeed(5);
    for (var k = 0; k < 500; k++) { var u = r() * 2 - 1, ph = r() * 2 * Math.PI, rad = 0.35 + 0.65 * Math.cbrt(r()), s = Math.sqrt(1 - u * u); P0.push([rad * s * Math.cos(ph), rad * s * Math.sin(ph), rad * u, r()]); }
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'nb-t', label: 'Time since the cloud began to collapse', min: 0, max: 1, step: 0.01, value: t, onChange: function (x) { t = x; draw(); } });
    FIG.slider(controls, { id: 'nb-v', label: 'Viewing angle (degrees from the pole)', min: 0, max: 90, step: 1, value: tilt, onChange: function (x) { tilt = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A rotating cloud flattening into a disc'), W = A.W, svg = A.svg, fs = A.fs, cx = W / 2, cy = 155, R = Math.min(130, W * 0.38), ti = tilt * Math.PI / 180;
      el('rect', { x: 0, y: 0, width: W, height: 300, fill: '#0b1023', rx: 6 }, svg);
      var zf = 1 - 0.95 * t, rf = 1 - 0.35 * t, sp = t * 6;
      P0.forEach(function (p) { var x = p[0] * rf, y = p[1] * rf, z = p[2] * zf, a = sp / (0.3 + Math.hypot(p[0], p[1])), xr = x * Math.cos(a) - y * Math.sin(a), yr = x * Math.sin(a) + y * Math.cos(a), sx = xr, sy = yr * Math.cos(ti) - z * Math.sin(ti); el('circle', { cx: cx + sx * R, cy: cy + sy * R, r: 1.4, fill: '#fde68a', opacity: 0.55 + 0.4 * p[3] }, svg); });
      el('circle', { cx: cx, cy: cy, r: 4 + 10 * t, fill: '#f59e0b' }, svg);
      txt(svg, 12, 20, 'a slowly rotating cloud of gas and dust', { anchor: 'start', size: fs(10), fill: '#e5e7eb' });
      out.innerHTML = (t < 0.3 ? 'A roughly spherical, slowly turning cloud.' : t < 0.75 ? 'Gravity pulls the cloud inwards; its rotation speeds up and it flattens.' : 'A flat, spinning disc around a central star: the birthplace of planets, all orbiting the same way in nearly the same plane.') + NOTE + 'In 1755 Kant proposed that the Solar System formed from a rotating cloud of particles collapsing under Newtonian gravity. Collapse is easy along the rotation axis but resisted around it, because spinning matter keeps its angular momentum, so the cloud flattens into a disc. This explained why the planets orbit in nearly one plane and in the same direction. Laplace proposed a similar theory in 1796. Modern telescopes now photograph such discs around young stars. Kant also guessed that some faint nebulae are distant “island universes” of stars, confirmed by Hubble in the 1920s. [Illustration, not a physical simulation.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: triangles on curved surfaces
     ----------------------------------------------------------------------- */
  FIG['fig-curvedtri'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var size = 60;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ct-s', label: 'Size of the triangle on a sphere (side as degrees of arc)', min: 1, max: 90, step: 1, value: size, onChange: function (x) { size = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'An equilateral triangle drawn on a sphere'), W = A.W, svg = A.svg, fs = A.fs;
      var a = size * Math.PI / 180, cosA = (Math.cos(a) - Math.cos(a) * Math.cos(a)) / (Math.sin(a) * Math.sin(a)), ang = Math.acos(cosA) * 180 / Math.PI, sum = 3 * ang;
      var cx = W / 2, cy = 150, R = Math.min(120, W * 0.35);
      el('circle', { cx: cx, cy: cy, r: R, fill: BLUE + '22', stroke: c.muted }, svg);
      function proj(lat, lon) { var x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon); var t = 0.45, y2 = y * Math.cos(t) - z * Math.sin(t), z2 = y * Math.sin(t) + z * Math.cos(t); return [cx + R * x, cy - R * y2, z2]; }
      function v(lat, lon) { return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)]; }
            var cr = Math.asin(Math.sqrt((1 - Math.cos(a)) / 1.5));
      var pts = [0, 1, 2].map(function (k) { var th = -Math.PI / 2 + k * 2 * Math.PI / 3; return [Math.sin(cr) * Math.cos(th), Math.sin(cr) * Math.sin(th), Math.cos(cr)]; });
      function arc(p, q) { var d = ''; for (var i = 0; i <= 30; i++) { var s = i / 30, om = Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))), w1 = om < 1e-6 ? 1 - s : Math.sin((1 - s) * om) / Math.sin(om), w2 = om < 1e-6 ? s : Math.sin(s * om) / Math.sin(om), x = w1 * p[0] + w2 * q[0], y = w1 * p[1] + w2 * q[1], z = w1 * p[2] + w2 * q[2]; d += (i ? 'L' : 'M') + (cx + R * x).toFixed(1) + ' ' + (cy + R * y).toFixed(1); } return d; }
      el('path', { d: arc(pts[0], pts[1]) + arc(pts[1], pts[2]).replace('M', 'L') + arc(pts[2], pts[0]).replace('M', 'L'), fill: AMBER + '44', stroke: AMBER, 'stroke-width': 2.4 }, svg);
      legend(svg, c, fs, W, 'each side is the shortest path (a great-circle arc) on the sphere', 'sides are great-circle arcs');
      out.innerHTML = 'Each angle: <strong>' + fmt(ang, 1) + '°</strong>; angle sum: <strong>' + fmt(sum, 1) + '°</strong> (excess over 180°: ' + fmt(sum - 180, 1) + '°).' + NOTE + 'Kant argued that Euclidean geometry is <em>synthetic a priori</em>: genuinely about the world, yet known with certainty independently of experience, because space is the form our minds impose on everything we perceive. But on a curved surface the angles of a triangle add up to more than 180°, and the excess grows with the triangle’s area. Small triangles look Euclidean; only large ones reveal curvature. Within decades of Kant’s death, mathematicians showed that non-Euclidean geometries are perfectly consistent (Part 2), and Einstein showed that physical space is in fact curved by matter (Part 10).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'According to Hume, what do we actually observe when one billiard ball strikes another?', options: ['A necessary connection', 'One event followed by another (constant conjunction)', 'A force', 'God’s will'], answer: 1, explanation: 'The connection is supplied by habit.' },
      { question: 'The problem of induction asks…', options: ['How to do experiments', 'What justifies expecting the future to resemble the past', 'How to prove theorems', 'Why the Sun shines'], answer: 1, explanation: 'Any justification seems circular.' },
      { question: 'Hume’s “fork” divides knowledge into…', options: ['Science and religion', 'Relations of ideas and matters of fact', 'Mind and body', 'Physics and metaphysics'], answer: 1, explanation: 'Mathematics versus empirical claims.' },
      { question: 'Laplace’s rule of succession estimates the chance of another success after n successes as…', options: ['1', 'n/(n + 1)', '(n + 1)/(n + 2)', '1/2'], answer: 2, explanation: 'Applied by Laplace to sunrises.' },
      { question: 'Russell’s turkey illustrates…', options: ['That turkeys are clever', 'That induction from past regularity can fail', 'That probability is useless', 'That causes are visible'], answer: 1, explanation: 'Fed every day until Christmas.' },
      { question: 'What did Kant say Hume had done for him?', options: ['Converted him to religion', 'Woken him from his dogmatic slumber', 'Taught him physics', 'Refuted Newton'], answer: 1, explanation: 'In the Prolegomena (1783).' },
      { question: 'A synthetic a priori judgement is one that…', options: ['Is true by definition', 'Is known only by experience', 'Extends our knowledge yet is known independently of experience', 'Is false'], answer: 2, explanation: 'Kant’s examples: geometry, causation.' },
      { question: 'Kant’s nebular hypothesis explains why the planets…', options: ['Have moons', 'Orbit in nearly the same plane and the same direction', 'Are made of rock', 'Are inhabited'], answer: 1, explanation: 'A rotating cloud flattens into a disc.' },
      { question: 'On a sphere, the angles of a triangle add up to…', options: ['Exactly 180°', 'Less than 180°', 'More than 180°', 'Always 270°'], answer: 2, explanation: 'The excess grows with area.' },
      { question: 'Kant’s “Copernican revolution” in philosophy proposed that…', options: ['The Earth moves', 'Objects must conform to our ways of knowing, not the reverse', 'Senses are always wrong', 'God is a mathematician'], answer: 1, explanation: 'The mind structures experience.' }
    ]);
  };
})();
