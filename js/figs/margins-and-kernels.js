/* ==========================================================================
   RNLearn — Margins and Kernels (Inside the Machine, Part 5)
   Figures:
     fig-ml-map          The map of the series
     fig-ml5-timeline    The story at a glance
     fig-ml-svm-linear   The widest street
     fig-ml-lift         Lifting a line into a plane
     fig-ml-svm-kernel   The kernel SVM playground
     fig-ml-svr          Support vector regression
     fig-ml-gp           Gaussian process regression
     fig-quiz-ml5        Test yourself
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

  /* -----------------------------------------------------------------------
     Figure: the story at a glance
     ----------------------------------------------------------------------- */
  var ERAS = [
    { name: 'Mathematics of kernels', color: '#b45309' },
    { name: 'Support vector machines', color: '#1d4ed8' },
    { name: 'Kernels everywhere', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1909', icon: '∫', era: 0, sec: 7, title: 'Mercer’s theorem', text: 'James Mercer shows when a function of two points can be written as an inner product, the mathematical heart of kernel methods.' },
    { year: '1950', icon: '🧮', era: 0, sec: 7, title: 'Reproducing kernels', text: 'Nachman Aronszajn sets out the theory of reproducing kernel Hilbert spaces.' },
    { year: '1963', icon: '📐', era: 1, sec: 3, title: 'The optimal hyperplane', text: 'Vladimir Vapnik and Alexander Lerner describe the “generalised portrait”, a classifier that maximises the margin between classes.' },
    { year: '1964', icon: '🪄', era: 0, sec: 6, title: 'The kernel trick', text: 'Mark Aizerman, Emmanuel Braverman and Lev Rozonoer interpret kernels as inner products in a feature space, in their method of potential functions.' },
    { year: '1992', icon: '🧠', era: 1, sec: 6, title: 'Kernel SVMs', text: 'Bernhard Boser, Isabelle Guyon and Vapnik combine maximum margins with the kernel trick.' },
    { year: '1995', icon: '🧷', era: 1, sec: 4, title: 'Soft margins', text: 'Corinna Cortes and Vapnik allow some points inside the margin, making SVMs practical for noisy data.' },
    { year: '1997', icon: '📈', era: 1, sec: 9, title: 'Support vector regression', text: 'Harris Drucker and colleagues extend support vector machines to predicting numbers.' },
    { year: '1998', icon: '⚙️', era: 1, sec: 5, title: 'SMO', text: 'John Platt’s sequential minimal optimisation trains SVMs by solving tiny two-variable problems.' },
    { year: '1998', icon: '🔭', era: 2, sec: 11, title: 'Kernel PCA', text: 'Bernhard Schölkopf, Alexander Smola and Klaus-Robert Müller apply the kernel trick to principal component analysis.' },
    { year: '2006', icon: '🌫️', era: 2, sec: 12, title: 'Gaussian processes for ML', text: 'Carl Rasmussen and Christopher Williams’ book makes Gaussian processes a standard machine-learning tool.' },
    { year: '2007', icon: '🎲', era: 2, sec: 13, title: 'Random features', text: 'Ali Rahimi and Benjamin Recht approximate kernels with random features, scaling kernel methods to large data.' },
    { year: '2018', icon: '🔗', era: 2, sec: 13, title: 'The neural tangent kernel', text: 'Arthur Jacot and colleagues show that very wide neural networks trained by gradient descent behave like kernel methods.' }
  ];

  FIG['fig-ml5-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1909 to 2018');
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

  var ML_PART = 5;
  /* -----------------------------------------------------------------------
     Shared for the series: seeded random numbers, least squares, data
     ----------------------------------------------------------------------- */
  function rngSeed(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gaussR(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function lstsq(A, y) {
    var m = A.length, n = A[0].length, Q = A.map(function (r) { return r.slice(); }), b = y.slice(), i, j, k;
    for (k = 0; k < n; k++) {
      var norm = 0; for (i = k; i < m; i++) norm += Q[i][k] * Q[i][k]; norm = Math.sqrt(norm);
      if (norm < 1e-14) continue;
      var alpha = Q[k][k] > 0 ? -norm : norm, v = []; for (i = 0; i < m; i++) v.push(i < k ? 0 : Q[i][k]); v[k] -= alpha;
      var vv = 0; for (i = k; i < m; i++) vv += v[i] * v[i]; if (vv < 1e-30) continue;
      for (j = k; j < n; j++) { var s = 0; for (i = k; i < m; i++) s += v[i] * Q[i][j]; s = 2 * s / vv; for (i = k; i < m; i++) Q[i][j] -= s * v[i]; }
      var sb = 0; for (i = k; i < m; i++) sb += v[i] * b[i]; sb = 2 * sb / vv; for (i = k; i < m; i++) b[i] -= sb * v[i];
    }
    var x = new Array(n).fill(0);
    for (i = n - 1; i >= 0; i--) { if (i >= m || Math.abs(Q[i][i]) < 1e-12) { x[i] = 0; continue; } var s2 = b[i]; for (j = i + 1; j < n; j++) s2 -= Q[i][j] * x[j]; x[i] = s2 / Q[i][i]; }
    return x;
  }
  function polyFit(xs, ys, d) { var A = xs.map(function (x) { var u = (x - 0.5) * 2, r = []; for (var k = 0; k <= d; k++) r.push(Math.pow(u, k)); return r; }); var c = lstsq(A, ys); return function (x) { var u = (x - 0.5) * 2, s = 0; for (var k = 0; k <= d; k++) s += c[k] * Math.pow(u, k); return s; }; }
  function mse(f, xs, ys) { var s = 0; for (var i = 0; i < xs.length; i++) { var e = f(xs[i]) - ys[i]; s += e * e; } return s / xs.length; }
  function truth(x) { return Math.sin(2 * Math.PI * x); }
  var XTR = [0.094, 0.128, 0.371, 0.439, 0.443, 0.45, 0.644, 0.697, 0.761, 0.774, 0.786, 0.823, 0.859, 0.927, 0.976];
  var YTR = [0.342, 0.812, 0.485, 0.594, 0.338, 0.263, -0.957, -0.639, -1.036, -1.096, -1.063, -0.764, -0.683, -0.34, -0.043];
  var XTE = [0.007, 0.023, 0.031, 0.058, 0.09, 0.115, 0.13, 0.14, 0.14, 0.161, 0.167, 0.189, 0.2, 0.215, 0.227, 0.234, 0.281, 0.288, 0.294, 0.304, 0.312, 0.326, 0.37, 0.387, 0.406, 0.409, 0.437, 0.437, 0.459, 0.462, 0.47, 0.471, 0.476, 0.501, 0.554, 0.557, 0.559, 0.565, 0.569, 0.635, 0.662, 0.664, 0.665, 0.668, 0.67, 0.682, 0.7, 0.705, 0.722, 0.745, 0.765, 0.781, 0.784, 0.787, 0.805, 0.814, 0.832, 0.833, 0.853, 0.968];
  var YTE = [0.164, 0.256, 0.36, 0.332, 0.43, 0.641, 0.307, 0.409, 0.44, 0.598, 0.967, 0.701, 0.857, 1.301, 0.901, 1.179, 0.748, 0.92, 0.725, 0.858, 1.135, 0.456, 0.838, 0.711, 0.408, 0.18, 0.404, 0.253, 0.313, 0.242, 0.588, 0.121, -0.106, 0.039, -0.278, -0.011, -0.153, -0.308, -0.054, -1.047, -1.011, -1.089, -0.958, -1.214, -0.718, -0.966, -1.319, -1.214, -0.906, -0.79, -0.496, -0.253, -0.874, -1.22, -1.474, -0.853, -1.073, -0.971, -0.951, -0.235];
  function efmt(v) { if (v >= 1000) { var e = v.toExponential(1).split('e+'); return e[0] + ' × 10<sup>' + e[1] + '</sup>'; } return fmt(v, v < 0.1 ? 4 : v < 10 ? 3 : 1); }
  function plotFrame(svg, c, fs, L, R, T, B, yl, yh, yt, xlab) {
    var X = function (x) { return L + x * (R - L); }, Y = function (v) { return B - (Math.max(yl, Math.min(yh, v)) - yl) / (yh - yl) * (B - T); };
    yt.forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
    if (xlab) txt(svg, (L + R) / 2, B + 30, xlab, { size: fs(10), fill: c.muted });
    el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
    return { X: X, Y: Y };
  }
  function curve(svg, P, f, col, w, op) { var d = ''; for (var k = 0; k <= 200; k++) { var x = k / 200; d += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(f(x)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2, opacity: op === undefined ? 1 : op }, svg); }

  /* -----------------------------------------------------------------------
     Figure: series map
     ----------------------------------------------------------------------- */
  var PARTS = [
    ['Learning from Data', 'Models, loss, generalisation, bias–variance, validation and leakage.'],
    ['Linear Models', 'Linear and logistic regression, regularisation and gradient descent.'],
    ['Neighbours, Bayes and Trees', 'k-nearest neighbours, Naive Bayes and decision trees.'],
    ['Ensembles', 'Bagging, random forests, boosting and stacking.'],
    ['Margins and Kernels', 'Support vector machines and the kernel trick.'],
    ['Neurons and Activations', 'The artificial neuron, activation functions and backpropagation.'],
    ['Loss Functions', 'What networks minimise, for regression, classification and beyond.'],
    ['Training Deep Networks', 'Optimisers, learning rates, initialisation, normalisation and regularisation.'],
    ['Architectures', 'Convolutional, recurrent and transformer networks, and autoencoders.'],
    ['Choosing and Explaining', 'Picking a model, tuning it and understanding its predictions.']
  ];
  FIG['fig-ml-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CUR = ML_PART, sel = CUR;
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, rows = narrow ? 2 : 1, per = 10 / rows;
      var A = newSVG(svgWrap, container, rows * 78 + 10, 'Map of the ten parts of the series'), W = A.W, svg = A.svg, fs = A.fs;
      var groups = [[0, 1, '#1d4ed8', 'Classical machine learning'], [5, 9, '#a21caf', 'Neural networks']];
      for (var i = 0; i < 10; i++) {
        var r = Math.floor(i / per), k = i % per, cx = 30 + (W - 60) * (k + 0.5) / per, cy = 30 + r * 78, col = i < 5 ? '#1d4ed8' : '#a21caf';
        if (k > 0) el('line', { x1: 30 + (W - 60) * (k - 0.5) / per + 14, y1: cy, x2: cx - 14, y2: cy, stroke: c.border, 'stroke-width': 2 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + ': ' + PARTS[i][0], style: 'cursor:pointer' }, svg);
        el('circle', { cx: cx, cy: cy, r: i + 1 === sel ? 15 : 12, fill: i + 1 === CUR ? col : c.surface, stroke: col, 'stroke-width': i + 1 === sel ? 3 : 2 }, g);
        txt(g, cx, cy + 4, String(i + 1), { size: fs(11), weight: 700, fill: i + 1 === CUR ? '#fff' : col });
        var SHORT = ['Data', 'Linear', 'Trees', 'Ensembles', 'Kernels', 'Neurons', 'Loss', 'Training', 'Networks', 'Choosing'];
        txt(g, cx, cy + 30, SHORT[i], { size: fs(9), fill: c.ink2 });
        (function (n) { g.addEventListener('click', function () { sel = n; draw(); }); keyClick(g, function () { sel = n; draw(); }); })(i + 1);
      }
      out.innerHTML = '<strong>Part ' + sel + ': ' + PARTS[sel - 1][0] + '.</strong> ' + PARTS[sel - 1][1] + (sel === CUR ? ' <em>(you are here)</em>' : '') + NOTE + 'Parts 1–5 cover classical machine learning (blue); Parts 6–10 neural networks and deep learning (purple). Tap a part to see what it covers.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Classification data sets (seeded, the same in every part)
     ----------------------------------------------------------------------- */
  function makeData(kind, seed) {
    var r = rngSeed(seed || 2026), P = [];
    for (var i = 0; i < 200; i++) {
      var cl = i % 2, x, y;
      if (kind === 'moons') { var t = Math.PI * r(); if (cl === 0) { x = Math.cos(t); y = Math.sin(t); } else { x = 1 - Math.cos(t); y = 0.5 - Math.sin(t); } x += 0.2 * gaussR(r); y += 0.2 * gaussR(r); }
      else if (kind === 'circles') { var a = 2 * Math.PI * r(), rad = cl === 0 ? 1 : 0.45; x = rad * Math.cos(a) + 0.12 * gaussR(r); y = rad * Math.sin(a) + 0.12 * gaussR(r); x = x * 1.1 + 0.5; y = y * 1.1 + 0.25; }
      else { x = (cl ? 1.3 : -0.3) + 0.55 * gaussR(r); y = (cl ? -0.2 : 0.7) + 0.55 * gaussR(r); }
      P.push([x, y, cl]);
    }
    for (i = P.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tt = P[i]; P[i] = P[j]; P[j] = tt; }
    return { train: P.slice(0, 140), test: P.slice(140) };
  }
  function polyFeat(x, y, d) { var f = []; for (var a = 0; a <= d; a++) for (var b = 0; b <= d - a; b++) if (a + b > 0) f.push(Math.pow(x, a) * Math.pow(y, b)); return f; }
  function sigmoid(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  function solveSym(A, b) { var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }); for (var c = 0; c < n; c++) { var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; var t = M[c]; M[c] = M[p]; M[p] = t; if (Math.abs(M[c][c]) < 1e-12) continue; for (r = c + 1; r < n; r++) { var f = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } var x = new Array(n).fill(0); for (r = n - 1; r >= 0; r--) { var s = M[r][n]; for (k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = Math.abs(M[r][r]) < 1e-12 ? 0 : s / M[r][r]; } return x; }
  function evalClf(f, pts) { var ok = 0, ll = 0; pts.forEach(function (p) { var q = Math.min(1 - 1e-12, Math.max(1e-12, f(p[0], p[1]))); if ((q >= 0.5 ? 1 : 0) === p[2]) ok++; ll -= p[2] ? Math.log(q) : Math.log(1 - q); }); return [ok / pts.length, ll / pts.length]; }

  /* Draw a classification panel: probability shading, smooth 0.5 boundary, train dots, test squares */
  var CLF_BOX = { xl: -1.6, xh: 2.6, yl: -1.4, yh: 1.8 };
  function drawClfPanel(svg, c, f, data, L, T, S, H, opts) {
    opts = opts || {}; var B = CLF_BOX, xl = B.xl, xh = B.xh, yl = B.yl, yh = B.yh;
    var X = function (v) { return L + (v - xl) / (xh - xl) * S; }, Y = function (v) { return T + (yh - v) / (yh - yl) * H; };
    var gx = opts.grid || 60, gy = Math.round(gx * H / S), G = [], ix, iy;
    for (ix = 0; ix <= gx; ix++) { G.push([]); for (iy = 0; iy <= gy; iy++) G[ix].push(f(xl + ix * (xh - xl) / gx, yh - iy * (yh - yl) / gy)); }
    var cw = S / gx, ch = H / gy;
    for (ix = 0; ix < gx; ix++) for (iy = 0; iy < gy; iy++) { var p = (G[ix][iy] + G[ix + 1][iy] + G[ix][iy + 1] + G[ix + 1][iy + 1]) / 4; el('rect', { x: L + ix * cw, y: T + iy * ch, width: cw + 0.5, height: ch + 0.5, fill: p > 0.5 ? AMBER : BLUE, opacity: 0.06 + 0.34 * Math.abs(p - 0.5) * 2 }, svg); }
    var segs = '';
    for (ix = 0; ix < gx; ix++) for (iy = 0; iy < gy; iy++) {
      var v = [G[ix][iy] - 0.5, G[ix + 1][iy] - 0.5, G[ix + 1][iy + 1] - 0.5, G[ix][iy + 1] - 0.5], P2 = [[ix, iy], [ix + 1, iy], [ix + 1, iy + 1], [ix, iy + 1]], cr = [];
      for (var e = 0; e < 4; e++) { var v1 = v[e], v2 = v[(e + 1) % 4]; if ((v1 > 0) !== (v2 > 0)) { var t = v1 / (v1 - v2), q1 = P2[e], q2 = P2[(e + 1) % 4]; cr.push([L + (q1[0] + t * (q2[0] - q1[0])) * cw, T + (q1[1] + t * (q2[1] - q1[1])) * ch]); } }
      for (e = 0; e + 1 < cr.length; e += 2) segs += 'M' + cr[e][0].toFixed(1) + ' ' + cr[e][1].toFixed(1) + 'L' + cr[e + 1][0].toFixed(1) + ' ' + cr[e + 1][1].toFixed(1);
    }
    if (segs) el('path', { d: segs, fill: 'none', stroke: c.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    data.train.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 3.5, fill: p[2] ? AMBER : BLUE, stroke: '#fff', 'stroke-width': 0.8 }, svg); });
    if (opts.test !== false) data.test.forEach(function (p) { el('rect', { x: X(p[0]) - 3, y: Y(p[1]) - 3, width: 6, height: 6, fill: 'none', stroke: p[2] ? AMBER : BLUE, 'stroke-width': 1.5 }, svg); });
    el('rect', { x: L, y: T, width: S, height: H, fill: 'none', stroke: c.border }, svg);
    return { X: X, Y: Y };
  }
  var DS_KEYS = ['blobs', 'moons', 'circles'], DS_NAMES = ['Two clouds', 'Two moons', 'Circles'];

  /* -----------------------------------------------------------------------
     Kernels and a LIBSVM-style SMO solver
     ----------------------------------------------------------------------- */
  function makeKernel(kind, gamma, degree) {
    if (kind === 'linear') return function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
    if (kind === 'poly') return function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return Math.pow(gamma * s + 1, degree || 3); };
    return function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return Math.exp(-gamma * s); };
  }
  /* minimise ½ βᵀQβ + pᵀβ, Q_ij = y_i y_j K_ij, 0 ≤ β ≤ C, yᵀβ = 0 */
  function smo(X, y, p, C, kern) {
    var n = X.length, K = [], i, j, t;
    for (i = 0; i < n; i++) { K.push(new Float64Array(n)); }
    for (i = 0; i < n; i++) for (j = i; j < n; j++) { var v = kern(X[i], X[j]); K[i][j] = v; K[j][i] = v; }
    var a = new Float64Array(n), G = Float64Array.from(p), it = 0, m = 0, M = 0;
    for (it = 0; it < 100000; it++) {
      var bi = -1, bj = -1; m = -Infinity; M = Infinity;
      for (t = 0; t < n; t++) {
        var up = (y[t] > 0 && a[t] < C) || (y[t] < 0 && a[t] > 0), low = (y[t] > 0 && a[t] > 0) || (y[t] < 0 && a[t] < C), v2 = -y[t] * G[t];
        if (up && v2 > m) { m = v2; bi = t; }
        if (low && v2 < M) { M = v2; bj = t; }
      }
      if (bi < 0 || bj < 0 || m - M < 1e-3) break;
      i = bi; j = bj;
      var curv = K[i][i] + K[j][j] - 2 * K[i][j]; if (curv <= 1e-12) curv = 1e-12;
      var slope = y[i] * G[i] - y[j] * G[j], step = -slope / curv;
      var lo = 0, hi = Infinity;
      if (y[i] > 0) hi = Math.min(hi, C - a[i]); else hi = Math.min(hi, a[i]);
      if (y[j] > 0) hi = Math.min(hi, a[j]); else hi = Math.min(hi, C - a[j]);
      step = Math.max(lo, Math.min(hi, step));
      a[i] += y[i] * step; a[j] -= y[j] * step;
      for (t = 0; t < n; t++) G[t] += y[t] * step * (K[t][i] - K[t][j]);
    }
    var bs = 0, nf = 0;
    for (t = 0; t < n; t++) if (a[t] > 1e-8 && a[t] < C - 1e-8) { bs += -y[t] * G[t]; nf++; }
    var b = nf ? bs / nf : (m + M) / 2;
    return { a: a, b: b, iters: it };
  }
  function svc(train, kind, C, gamma) {
    var X = train.map(function (q) { return [q[0], q[1]]; }), y = train.map(function (q) { return q[2] ? 1 : -1; }), kern = makeKernel(kind, gamma, 3);
    var s = smo(X, y, y.map(function () { return -1; }), C, kern), sv = [];
    for (var t = 0; t < X.length; t++) if (s.a[t] > 1e-8) sv.push([X[t], s.a[t] * y[t], s.a[t] >= C - 1e-8]);
    var dec = function (x1, x2) { var v = s.b, q = [x1, x2]; for (var k = 0; k < sv.length; k++) v += sv[k][1] * kern(sv[k][0], q); return v; };
    var f = function (x1, x2) { return 1 / (1 + Math.exp(-3 * dec(x1, x2))); };
    f.dec = dec; f.sv = sv; return f;
  }
  function svr(xs, ys, C, eps, gamma) {
    var n = xs.length, X = [], y = [], p = [];
    for (var i = 0; i < n; i++) { X.push([xs[i]]); y.push(1); p.push(eps - ys[i]); }
    for (i = 0; i < n; i++) { X.push([xs[i]]); y.push(-1); p.push(eps + ys[i]); }
    var kern = makeKernel('rbf', gamma), s = smo(X, y, p, C, kern), coef = [];
    for (i = 0; i < n; i++) coef.push(s.a[i] - s.a[i + n]);
    var f = function (x) { var v = s.b; for (var k = 0; k < n; k++) if (coef[k] !== 0) v += coef[k] * kern([xs[k]], [x]); return v; };
    f.coef = coef; return f;
  }
  function cholesky(A) { var n = A.length, L = []; for (var i = 0; i < n; i++) { L.push(new Float64Array(n)); for (var j = 0; j <= i; j++) { var s = A[i][j]; for (var k = 0; k < j; k++) s -= L[i][k] * L[j][k]; L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j]; } } return L; }
  function cholSolve(L, b) { var n = L.length, y = new Float64Array(n), x = new Float64Array(n), i, k; for (i = 0; i < n; i++) { var s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } for (i = n - 1; i >= 0; i--) { var s2 = y[i]; for (k = i + 1; k < n; k++) s2 -= L[k][i] * x[k]; x[i] = s2 / L[i][i]; } return x; }
  function gpFit(xs, ys, ell, sf, sn) {
    var n = xs.length, k = function (a, b) { return sf * sf * Math.exp(-(a - b) * (a - b) / (2 * ell * ell)); }, ym = mean(ys), yc = ys.map(function (v) { return v - ym; }), A = [], i, j;
    for (i = 0; i < n; i++) { A.push([]); for (j = 0; j < n; j++) A[i].push(k(xs[i], xs[j]) + (i === j ? sn * sn : 0)); }
    var L = cholesky(A), alpha = cholSolve(L, yc), logdet = 0; for (i = 0; i < n; i++) logdet += 2 * Math.log(L[i][i]);
    var lml = -0.5 * yc.reduce(function (s, v, q) { return s + v * alpha[q]; }, 0) - 0.5 * logdet - n / 2 * Math.log(2 * Math.PI);
    var f = function (x) { var ks = xs.map(function (v) { return k(v, x); }), mu = ym; for (var q = 0; q < n; q++) mu += ks[q] * alpha[q]; var v = cholSolve(L, ks), var_ = sf * sf; for (q = 0; q < n; q++) var_ -= ks[q] * v[q]; return [mu, Math.max(var_, 0)]; };
    f.lml = lml; return f;
  }
  function contourAt(svg, c, fn, level, L, T, S, H, col, dash) {
    var B = CLF_BOX, gx = 70, gy = Math.round(gx * H / S), G = [], ix, iy, cw = S / gx, ch = H / gy, segs = '';
    for (ix = 0; ix <= gx; ix++) { G.push([]); for (iy = 0; iy <= gy; iy++) G[ix].push(fn(B.xl + ix * (B.xh - B.xl) / gx, B.yh - iy * (B.yh - B.yl) / gy) - level); }
    for (ix = 0; ix < gx; ix++) for (iy = 0; iy < gy; iy++) { var v = [G[ix][iy], G[ix + 1][iy], G[ix + 1][iy + 1], G[ix][iy + 1]], P2 = [[ix, iy], [ix + 1, iy], [ix + 1, iy + 1], [ix, iy + 1]], cr = []; for (var e = 0; e < 4; e++) { var v1 = v[e], v2 = v[(e + 1) % 4]; if ((v1 > 0) !== (v2 > 0)) { var t = v1 / (v1 - v2), q1 = P2[e], q2 = P2[(e + 1) % 4]; cr.push([L + (q1[0] + t * (q2[0] - q1[0])) * cw, T + (q1[1] + t * (q2[1] - q1[1])) * ch]); } } for (e = 0; e + 1 < cr.length; e += 2) segs += 'M' + cr[e][0].toFixed(1) + ' ' + cr[e][1].toFixed(1) + 'L' + cr[e + 1][0].toFixed(1) + ' ' + cr[e + 1][1].toFixed(1); }
    if (segs) el('path', { d: segs, fill: 'none', stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': dash || '' }, svg);
  }

  /* -----------------------------------------------------------------------
     Figure: the widest street (linear SVM)
     ----------------------------------------------------------------------- */
  FIG['fig-ml-svm-linear'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lc = 0, data = makeData('blobs'), cache = {};
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sl-c', label: 'Penalty C (log scale)', min: -2, max: 3, step: 0.25, value: lc, onChange: function (x) { lc = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Linear support vector machine with its margin'), W = A.W, svg = A.svg;
      var Cv = Math.pow(10, lc); valText(s1, Cv < 1 ? fmt(Cv, 2) : fmt(Cv, Cv < 10 ? 1 : 0));
      var f = cache[lc] || (cache[lc] = svc(data.train, 'linear', Cv, 1)), S = Math.min(W - 20, 380), L = (W - S) / 2;
      var P = drawClfPanel(svg, c, f, data, L, 10, S, 280, { grid: 50 });
      contourAt(svg, c, f.dec, 1, L, 10, S, 280, c.ink, '5 4'); contourAt(svg, c, f.dec, -1, L, 10, S, 280, c.ink, '5 4');
      var inside = 0;
      f.sv.forEach(function (s) { el('circle', { cx: P.X(s[0][0]), cy: P.Y(s[0][1]), r: 7, fill: 'none', stroke: s[2] ? RED : c.ink, 'stroke-width': 1.8 }, svg); if (s[2]) inside++; });
      var w = [0, 0]; f.sv.forEach(function (s) { w[0] += s[1] * s[0][0]; w[1] += s[1] * s[0][1]; }); var width = 2 / Math.hypot(w[0], w[1]);
      var tr = evalClf(f, data.train), te = evalClf(f, data.test);
      out.innerHTML = 'C = ' + (Cv < 1 ? fmt(Cv, 2) : fmt(Cv, 1)) + ': margin width <strong>' + fmt(width, 2) + '</strong>, <strong>' + f.sv.length + '</strong> support vectors (' + inside + ' on or inside the margin, red). Training accuracy ' + pct(tr[0], 0) + ', test accuracy <strong>' + pct(te[0], 0) + '</strong>.' +
        NOTE + 'The solid line is the decision boundary; the dashed lines are the edges of the margin, the “street”. Only the circled points, the support vectors, determine where the street lies: move any other point and nothing changes. A small C tolerates many points inside the street in exchange for a wide margin; a large C narrows the street to avoid violations.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the kernel trick, lifting a line into a plane
     ----------------------------------------------------------------------- */
  FIG['fig-ml-lift'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var t = 0, r = rngSeed(12), P = [];
    for (var i = 0; i < 24; i++) { var inner = i % 2 === 0, x = inner ? (r() * 2 - 1) * 0.9 : (r() < 0.5 ? -1 : 1) * (1.35 + r() * 0.8); P.push([x, inner ? 0 : 1]); }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'lf-t', label: 'Add the feature x² (lift)', min: 0, max: 1, step: 0.01, value: t, onChange: function (v) { t = v; draw(); } });
    var row = group(controls, 'Try');
    btn('Flat line', row).addEventListener('click', function () { t = 0; s1.setValue(0); draw(); });
    btn('Fully lifted', row).addEventListener('click', function () { t = 1; s1.setValue(1); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Points on a line lifted onto a parabola'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(t, 2));
      var L = 30, R = W - 30, T = 20, B = 200, X = function (x) { return L + (x + 2.3) / 4.6 * (R - L); }, Y = function (z) { return B - z / 5.4 * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      if (t > 0) { var d = ''; for (var k = 0; k <= 100; k++) { var x = -2.3 + 4.6 * k / 100; d += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(t * x * x).toFixed(1); } el('path', { d: d, fill: 'none', stroke: c.faint, 'stroke-width': 1.2 }, svg); }
      if (t > 0.85) { el('line', { x1: L, y1: Y(1.3 * t), x2: R, y2: Y(1.3 * t), stroke: GREEN, 'stroke-width': 2.2 }, svg); txt(svg, R, Y(1.3 * t) - 6, 'a straight line separates them', { anchor: 'end', size: fs(10), fill: GREEN }); }
      else { [-1.15, 1.15].forEach(function (q) { el('line', { x1: X(q), y1: B - 8, x2: X(q), y2: B + 8, stroke: RED, 'stroke-width': 2 }, svg); }); txt(svg, X(0), B + 22, 'on the line, two cuts are needed', { size: fs(10), fill: RED }); }
      P.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(t * p[0] * p[0]), r: 5, fill: p[1] ? AMBER : BLUE, stroke: '#fff', 'stroke-width': 1 }, svg); });
      txt(svg, L, 12, W < 560 ? 'x along the bottom; height = x²' : 'horizontal: the original feature x · vertical: the new feature x²', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (t > 0.85 ? 'In the lifted space (x, x²) the classes can be separated by a <strong>straight line</strong>: x² = 1.3, which back on the original line means |x| = 1.14.' : 'On the original line, the blue class sits in the middle and the orange class on both sides: no single threshold separates them.') +
        NOTE + 'Adding the feature x² lifts each point onto a parabola. A linear classifier in the new space draws a curved boundary in the old one. The kernel trick lets an SVM work in such lifted spaces, even infinitely many dimensions, without ever computing the new features: it only needs the inner products between pairs of points.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: kernel SVM playground
     ----------------------------------------------------------------------- */
  FIG['fig-ml-svm-kernel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 2, ki = 2, lc = 0, lg = 0, data = makeData('circles'), KN = ['linear', 'poly', 'rbf'], cache = {};
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); cache = {}; draw(); });
    choice(controls, 'Kernel', ['Linear', 'Polynomial (degree 3)', 'RBF (Gaussian)'], ki, function (i) { ki = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'sk-c', label: 'Penalty C (log scale)', min: -2, max: 3, step: 0.25, value: lc, onChange: function (x) { lc = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'sk-g', label: 'Kernel width γ (log scale)', min: -2, max: 2, step: 0.25, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Kernel SVM boundary and support vectors'), W = A.W, svg = A.svg;
      var Cv = Math.pow(10, lc), g = Math.pow(10, lg); valText(s1, Cv < 1 ? fmt(Cv, 2) : fmt(Cv, Cv < 10 ? 1 : 0)); valText(s2, g < 1 ? fmt(g, 2) : fmt(g, 1));
      var key = ki + '_' + lc + '_' + lg, f = cache[key] || (cache[key] = svc(data.train, KN[ki], Cv, g)), S = Math.min(W - 20, 380), L = (W - S) / 2;
      var P = drawClfPanel(svg, c, f, data, L, 10, S, 280, { grid: 50 });
      contourAt(svg, c, f.dec, 1, L, 10, S, 280, c.ink, '5 4'); contourAt(svg, c, f.dec, -1, L, 10, S, 280, c.ink, '5 4');
      f.sv.forEach(function (s) { el('circle', { cx: P.X(s[0][0]), cy: P.Y(s[0][1]), r: 6, fill: 'none', stroke: c.ink, 'stroke-width': 1.2, opacity: 0.7 }, svg); });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test);
      out.innerHTML = ['Linear', 'Polynomial', 'RBF'][ki] + ' kernel, C = ' + (Cv < 1 ? fmt(Cv, 2) : fmt(Cv, 1)) + (ki ? ', γ = ' + (g < 1 ? fmt(g, 2) : fmt(g, 1)) : '') + ': <strong>' + f.sv.length + '</strong> support vectors, training accuracy ' + pct(tr[0], 0) + ', test accuracy <strong>' + pct(te[0], 0) + '</strong>.' +
        NOTE + (ki === 2 ? 'The RBF kernel measures similarity by distance: γ sets how far each support vector’s influence reaches. Small γ gives smooth, almost linear boundaries; large γ gives wiggly boundaries that wrap around individual points (overfitting).' : ki === 1 ? 'The polynomial kernel corresponds to all products of the features up to degree 3, like the polynomial features of Part 2, without computing them.' : 'The linear kernel is the plain SVM of Figure 3: a straight boundary.') + ' Circles mark support vectors; dashed lines, the margin.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: support vector regression
     ----------------------------------------------------------------------- */
  FIG['fig-ml-svr'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var eps = 0.2, lc = 1, lg = 1, cache = {};
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sv-e', label: 'Tube half-width ε', min: 0, max: 0.8, step: 0.05, value: eps, onChange: function (x) { eps = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'sv-c', label: 'Penalty C (log scale)', min: -1, max: 3, step: 0.25, value: lc, onChange: function (x) { lc = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'sv-g', label: 'RBF γ (log scale)', min: -1, max: 3, step: 0.25, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Support vector regression with its epsilon tube'), W = A.W, svg = A.svg, fs = A.fs;
      var Cv = Math.pow(10, lc), g = Math.pow(10, lg); valText(s1, fmt(eps, 2)); valText(s2, Cv < 1 ? fmt(Cv, 2) : fmt(Cv, Cv < 10 ? 1 : 0)); valText(s3, g < 1 ? fmt(g, 2) : fmt(g, g < 10 ? 1 : 0));
      var key = eps + '_' + lc + '_' + lg, f = cache[key] || (cache[key] = svr(XTR, YTR, Cv, eps, g)), P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      var up = '', dn = ''; for (var q = 0; q <= 200; q++) { var x = q / 200, v = f(x); up += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(v + eps).toFixed(1); dn = 'L' + P.X(x).toFixed(1) + ' ' + P.Y(v - eps).toFixed(1) + dn; }
      el('path', { d: up + dn + 'Z', fill: BLUE, opacity: 0.12 }, svg);
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      curve(svg, P, f, RED, 2.2);
      var nsv = 0; XTR.forEach(function (x, i) { var isSv = Math.abs(f.coef[i]) > 1e-8; if (isSv) nsv++; el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); if (isSv) el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 7.5, fill: 'none', stroke: c.ink, 'stroke-width': 1.4 }, svg); });
      txt(svg, 40, 12, W < 560 ? 'shaded: ε-tube · circled: support vectors' : 'shaded: the ε-tube, inside which errors cost nothing · circled: support vectors', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'ε = ' + fmt(eps, 2) + ': <strong>' + nsv + ' of 15</strong> training points are support vectors. Training error ' + efmt(mse(f, XTR, YTR)) + ', test error <strong>' + efmt(mse(f, XTE, YTE)) + '</strong>.' +
        NOTE + 'Support vector regression ignores errors smaller than ε and penalises larger ones linearly. Points inside the tube have no influence on the fit; only those on or outside it (circled) are support vectors. A wider tube gives a simpler model with fewer support vectors.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Gaussian process regression
     ----------------------------------------------------------------------- */
  FIG['fig-ml-gp'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ll = Math.log10(0.1), sn = 0.25;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'gp-l', label: 'Length-scale ℓ (log scale)', min: -2, max: 0, step: 0.02, value: ll, onChange: function (x) { ll = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'gp-n', label: 'Assumed noise σₙ', min: 0.01, max: 0.8, step: 0.01, value: sn, onChange: function (x) { sn = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('Fit by maximum likelihood', row).addEventListener('click', function () { var best = null, i, j, a, b; function tryAB(a, b) { if (a < -2 - 1e-9 || a > 1e-9 || b < 0.01 - 1e-9 || b > 0.8 + 1e-9) return; var g = gpFit(XTR, YTR, Math.pow(10, a), 1, b); if (!best || g.lml > best[0]) best = [g.lml, a, b]; } for (i = 0; i <= 20; i++) for (j = 0; j <= 19; j++) tryAB(-2 + 0.1 * i, 0.02 + 0.04 * j); var a0 = best[1], b0 = best[2]; for (i = -5; i <= 5; i++) for (j = -4; j <= 4; j++) tryAB(a0 + 0.02 * i, b0 + 0.01 * j); ll = Math.round(best[1] * 50) / 50; sn = Math.round(best[2] * 100) / 100; s1.setValue(ll); s2.setValue(sn); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Gaussian process regression with a 95% band'), W = A.W, svg = A.svg, fs = A.fs;
      var ell = Math.pow(10, ll); valText(s1, fmt(ell, 3)); valText(s2, fmt(sn, 2));
      var g = gpFit(XTR, YTR, ell, 1, sn), P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -2.5, 2.5, [-2, -1, 0, 1, 2], 'x');
      var up = '', dn = '', mu = ''; for (var q = 0; q <= 200; q++) { var x = q / 200, r = g(x), s = 1.96 * Math.sqrt(r[1] + sn * sn); up += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(r[0] + s).toFixed(1); dn = 'L' + P.X(x).toFixed(1) + ' ' + P.Y(r[0] - s).toFixed(1) + dn; mu += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(r[0]).toFixed(1); }
      el('path', { d: up + dn + 'Z', fill: PURPLE, opacity: 0.15 }, svg);
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      el('path', { d: mu, fill: 'none', stroke: PURPLE, 'stroke-width': 2.4 }, svg);
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, 40, 12, W < 560 ? 'line: mean · band: 95% prediction' : 'purple line: posterior mean · band: 95% interval for a new observation', { anchor: 'start', size: fs(10), fill: c.muted });
      var cover = 0, fm = function (x) { return g(x)[0]; }; XTE.forEach(function (x, i) { var r = g(x), s = 1.96 * Math.sqrt(r[1] + sn * sn); if (Math.abs(YTE[i] - r[0]) <= s) cover++; });
      out.innerHTML = 'ℓ = ' + fmt(ell, 3) + ', σₙ = ' + fmt(sn, 2) + ': test error <strong>' + efmt(mse(fm, XTE, YTE)) + '</strong>; the band contains <strong>' + cover + ' of 60</strong> test points; log marginal likelihood ' + fmt(g.lml, 1) + '.' +
        NOTE + 'A Gaussian process predicts with a kernel, like an SVM, but returns a full probability distribution. The band widens where there are no training data, such as the gap between x = 0.13 and 0.37: the model knows what it does not know. The length-scale sets how quickly the function can change; maximising the marginal likelihood chooses it from the training data alone.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Among all lines that separate two classes, a support vector machine chooses…', options: ['The first one found', 'The one with the widest margin to the nearest points', 'The one through the class means', 'The one with the most support vectors'], answer: 1, explanation: 'The maximum-margin boundary.' },
      { question: 'What are support vectors?', options: ['All training points', 'The training points on or inside the margin, which alone determine the boundary', 'The test points', 'The features'], answer: 1, explanation: 'Removing any other point leaves the solution unchanged.' },
      { question: 'In a soft-margin SVM, a large penalty C…', options: ['Widens the margin and allows more violations', 'Narrows the margin to reduce violations, risking overfitting', 'Has no effect', 'Removes the kernel'], answer: 1, explanation: 'Small C favours a wide margin; large C favours fitting every point.' },
      { question: 'What loss does a soft-margin SVM minimise (with a penalty on the weights)?', options: ['Squared error', 'Hinge loss', 'Cross-entropy', 'Absolute error'], answer: 1, explanation: 'Hinge loss is zero for points correctly classified beyond the margin.' },
      { question: 'The kernel trick lets an SVM…', options: ['Train without data', 'Work in a high-dimensional feature space using only inner products, without computing the features', 'Avoid choosing hyperparameters', 'Produce probabilities directly'], answer: 1, explanation: 'Kernels compute inner products in the lifted space directly.' },
      { question: 'In the RBF kernel, a very large γ tends to…', options: ['Give an almost linear boundary', 'Overfit, with each support vector influencing only a tiny region', 'Remove all support vectors', 'Make training impossible'], answer: 1, explanation: 'γ is the inverse squared width of the Gaussian.' },
      { question: 'Why should features be scaled before training an RBF SVM?', options: ['It is not necessary', 'Distances, and so the kernel, are dominated by features with large ranges', 'It reduces the number of support vectors to zero', 'To produce probabilities'], answer: 1, explanation: 'As with k-NN, distances depend on scale.' },
      { question: 'In support vector regression, errors smaller than ε…', options: ['Are squared', 'Cost nothing', 'Are doubled', 'Are removed from the data'], answer: 1, explanation: 'Points inside the ε-tube do not affect the fit.' },
      { question: 'What does a Gaussian process give that an SVM does not?', options: ['A kernel', 'A full predictive distribution with uncertainty', 'Support vectors', 'Faster training on millions of points'], answer: 1, explanation: 'Its predictive band widens where data are scarce.' },
      { question: 'A main practical limitation of kernel SVMs and Gaussian processes is…', options: ['They cannot classify', 'Their cost grows quickly with the number of training examples', 'They need deep networks', 'They only work in one dimension'], answer: 1, explanation: 'The kernel matrix has n² entries; exact Gaussian processes need about n³ operations.' }
    ]);
  };
})();
