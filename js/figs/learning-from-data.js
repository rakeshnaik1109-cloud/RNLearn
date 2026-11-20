/* ==========================================================================
   RNLearn — Learning from Data (Inside the Machine, Part 1)
   Figures:
     fig-ml-map         The map of the series
     fig-ml1-timeline   The story at a glance
     fig-ml-overfit     The overfitting playground
     fig-ml-biasvar     Bias and variance made visible
     fig-ml-cv          Cross-validation in action
     fig-ml-leak        The leakage trap
     fig-ml-learncurve  Learning curves
     fig-quiz-ml1       Test yourself
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
    { name: 'Machines that learn', color: '#a21caf' },
    { name: 'Theory of generalisation', color: '#1d4ed8' },
    { name: 'Practice and pitfalls', color: '#b45309' }
  ];
  var EVENTS = [
    { year: '1950', icon: '🧠', era: 0, sec: 1, title: 'Learning machines', text: 'Alan Turing suggests that instead of programming an adult mind, we might build a “child machine” and educate it.' },
    { year: '1958', icon: '⚡', era: 0, sec: 4, title: 'The perceptron', text: 'Frank Rosenblatt describes the perceptron, a machine whose connection weights are adjusted from examples.' },
    { year: '1959', icon: '♟️', era: 0, sec: 1, title: 'Checkers that improve', text: 'Arthur Samuel publishes his studies of a checkers program that improves by playing, and popularises the phrase “machine learning”.' },
    { year: '1974', icon: '🔁', era: 2, sec: 10, title: 'Cross-validation', text: 'Mervyn Stone sets out cross-validation as a systematic way to choose and assess predictions.' },
    { year: '1984', icon: '📐', era: 1, sec: 13, title: 'PAC learning', text: 'Leslie Valiant proposes a mathematical theory of what can be learned efficiently from examples.' },
    { year: '1992', icon: '🎯', era: 1, sec: 8, title: 'Bias and variance', text: 'Stuart Geman, Elie Bienenstock and René Doursat analyse the bias–variance dilemma for neural networks.' },
    { year: '1995', icon: '📘', era: 1, sec: 5, title: 'Statistical learning theory', text: 'Vladimir Vapnik’s book sets out learning as minimising risk, with guarantees on how well a model generalises.' },
    { year: '1996', icon: '🍽️', era: 1, sec: 13, title: 'No free lunch', text: 'David Wolpert proves that, averaged over all possible problems, no learning algorithm beats any other.' },
    { year: '1997', icon: '📖', era: 0, sec: 1, title: 'A definition', text: 'Tom Mitchell’s textbook defines learning in terms of a task, experience and a measure of performance.' },
    { year: '2012', icon: '💧', era: 2, sec: 11, title: 'Leakage', text: 'A study of data-mining competitions describes how information from outside the training data “leaks” into models.' },
    { year: '2017', icon: '🎲', era: 1, sec: 13, title: 'Memorising noise', text: 'Experiments show that deep networks can perfectly fit random labels, challenging classical ideas of generalisation.' },
    { year: '2019', icon: '〰️', era: 1, sec: 13, title: 'Double descent', text: 'Mikhail Belkin and colleagues describe test error that falls again as models grow far beyond the size needed to fit the data.' },
    { year: '2023', icon: '🔬', era: 2, sec: 11, title: 'A reproducibility crisis', text: 'A review finds data leakage affecting hundreds of published papers that use machine learning in science.' }
  ];

  FIG['fig-ml1-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1950 to 2023');
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
    var CUR = 1, sel = CUR;
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
     Figure: overfitting playground
     ----------------------------------------------------------------------- */
  FIG['fig-ml-overfit'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var deg = 3, showTest = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'of-d', label: 'Model complexity (polynomial degree)', min: 0, max: 12, step: 1, value: deg, onChange: function (x) { deg = x; draw(); } });
    choice(controls, 'Show', ['Training data only', 'Training and test data'], showTest, function (i) { showTest = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var curves = []; for (var d = 0; d <= 12; d++) { var f = polyFit(XTR, YTR, d); curves.push([mse(f, XTR, YTR), mse(f, XTE, YTE)]); }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 430 : 250, 'Fitted curve and error against complexity'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(deg));
      var f = polyFit(XTR, YTR, deg), pw = narrow ? W : W * 0.58;
      var P = plotFrame(svg, c, fs, 40, pw - 12, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      txt(svg, 40, 12, narrow ? 'blue: train · orange: test · red: model' : 'blue: training · orange: test · grey dashed: true curve · red: model', { anchor: 'start', size: fs(10), fill: c.muted });
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      if (showTest) XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.6, fill: AMBER, opacity: 0.7 }, svg); });
      curve(svg, P, f, RED, 2.4);
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4.2, fill: BLUE }, svg); });
      var ox = narrow ? 0 : pw, oy = narrow ? 240 : 0, L2 = ox + 50, R2 = ox + (narrow ? W : W - pw) - 14, T2 = oy + 22, B2 = oy + 170;
      var lo = -3.5, hi = 1, Y2 = function (v) { return B2 - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-4)))) - lo) / (hi - lo) * (B2 - T2); }, X2 = function (d) { return L2 + d / 12 * (R2 - L2); };
      [-3, -2, -1, 0, 1].forEach(function (v) { el('line', { x1: L2, y1: Y2(Math.pow(10, v)), x2: R2, y2: Y2(Math.pow(10, v)), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L2 - 6, Y2(Math.pow(10, v)) + 4, v === 1 ? '≥10' : String(Math.pow(10, v)), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [[0, BLUE], [1, AMBER]].forEach(function (q) { var dd = ''; curves.forEach(function (e, d) { dd += (d ? 'L' : 'M') + X2(d).toFixed(1) + ' ' + Y2(e[q[0]]).toFixed(1); }); el('path', { d: dd, fill: 'none', stroke: q[1], 'stroke-width': 2 }, svg); curves.forEach(function (e, d) { el('circle', { cx: X2(d), cy: Y2(e[q[0]]), r: d === deg ? 5 : 2.5, fill: q[1] }, svg); }); });
      [0, 3, 6, 9, 12].forEach(function (d) { txt(svg, X2(d), B2 + 15, String(d), { size: fs(10), fill: c.muted }); });
      txt(svg, (L2 + R2) / 2, B2 + 30, 'degree', { size: fs(10), fill: c.muted });
      txt(svg, L2, T2 - 8, 'mean squared error (log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      var e = curves[deg], verdict = deg <= 1 ? '<strong>Underfitting</strong>: the model is too simple to follow the curve, so it is poor on both training and test data.' : deg <= 5 ? '<strong>About right</strong>: the model captures the shape without chasing the noise.' : '<strong>Overfitting</strong>: the model bends to pass close to every training point, including their noise, and fails on new data, especially where training data are sparse.';
      out.innerHTML = 'Degree ' + deg + ': training error <strong>' + efmt(e[0]) + '</strong>, test error <strong>' + efmt(e[1]) + '</strong>. ' + verdict + NOTE + 'Fifteen training points and sixty test points drawn from the same noisy sine curve (noise SD 0.25, so even a perfect model has an error of about 0.06). Training error always falls as complexity grows; test error falls, then rises. The best test error here is at degree 3.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: bias and variance
     ----------------------------------------------------------------------- */
  FIG['fig-ml-biasvar'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var deg = 1, nSets = 30, seed = 7;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'bv-d', label: 'Polynomial degree', min: 0, max: 10, step: 1, value: deg, onChange: function (x) { deg = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('New training sets', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Models fitted to thirty different training sets'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(deg));
      var r = rngSeed(seed * 1000 + 1), fits = [];
      for (var s = 0; s < nSets; s++) { var xs = [], ys = []; for (var i = 0; i < 15; i++) { var x = r(); xs.push(x); ys.push(truth(x) + 0.25 * gaussR(r)); } fits.push(polyFit(xs, ys, deg)); }
      var P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      fits.forEach(function (f) { curve(svg, P, f, BLUE, 1, 0.25); });
      var avg = function (x) { var s2 = 0; fits.forEach(function (f) { s2 += f(x); }); return s2 / fits.length; };
      curve(svg, P, truth, c.ink, 1.5); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      curve(svg, P, avg, RED, 2.6);
      txt(svg, 40, 12, W < 560 ? 'blue: 30 fits · red: average · dashed: truth' : 'blue: models from 30 different training sets · red: their average · dashed: the true curve', { anchor: 'start', size: fs(10), fill: c.muted });
      var b2 = 0, vr = 0, G = 100;
      for (var k = 0; k < G; k++) { var x2 = (k + 0.5) / G, vals = fits.map(function (f) { return Math.max(-5, Math.min(5, f(x2))); }), m = mean(vals), v = 0; vals.forEach(function (q) { v += (q - m) * (q - m); }); b2 += Math.pow(m - truth(x2), 2) / G; vr += v / vals.length / G; }
      out.innerHTML = 'Degree ' + deg + ': bias² ≈ <strong>' + efmt(b2) + '</strong>, variance ≈ <strong>' + efmt(vr) + '</strong>, irreducible noise = 0.0625. Expected test error ≈ bias² + variance + noise ≈ <strong>' + efmt(b2 + vr + 0.0625) + '</strong>.' +
        NOTE + (deg <= 1 ? 'Simple models are stable (low variance: the blue curves agree) but systematically wrong (high bias: the red average misses the truth).' : deg <= 4 ? 'A balance: the average is close to the truth and the individual fits do not scatter much.' : 'Flexible models are right on average (low bias) but each one depends heavily on its particular training set (high variance: the blue curves fly apart).') + ' Each training set has 15 points from the same noisy curve.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: k-fold cross-validation
     ----------------------------------------------------------------------- */
  FIG['fig-ml-cv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var KS = [2, 3, 5, 15], ki = 2, perm = XTR.map(function (_, i) { return i; }), pseed = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Number of folds k', ['2', '3', '5', '15 (leave-one-out)'], ki, function (i) { ki = i; draw(); });
    var row = group(controls, 'Actions');
    btn('Shuffle the folds', row).addEventListener('click', function () { var r = rngSeed(++pseed); for (var i = perm.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; } draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var FC = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777'];
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 430 : 240, 'Folds and cross-validated error against degree'), W = A.W, svg = A.svg, fs = A.fs;
      var k = KS[ki], fold = []; perm.forEach(function (p, j) { fold[p] = j % k; });
      var cv = [], test = [];
      for (var d = 0; d <= 8; d++) {
        var e = 0;
        for (var f = 0; f < k; f++) { var xs = [], ys = [], vx = [], vy = []; XTR.forEach(function (x, i) { if (fold[i] === f) { vx.push(x); vy.push(YTR[i]); } else { xs.push(x); ys.push(YTR[i]); } }); var g = polyFit(xs, ys, d); e += mse(g, vx, vy) * vx.length; }
        cv.push(e / XTR.length); test.push(mse(polyFit(XTR, YTR, d), XTE, YTE));
      }
      var best = cv.indexOf(Math.min.apply(null, cv)), pw = narrow ? W : W * 0.45;
      var P = plotFrame(svg, c, fs, 36, pw - 10, 22, 200, -2, 2, [-1, 0, 1], 'x');
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 5, fill: k <= 5 ? FC[fold[i]] : BLUE }, svg); });
      txt(svg, 36, 12, k <= 5 ? 'each colour is one fold (' + k + ' folds)' : 'each point is left out once', { anchor: 'start', size: fs(10), fill: c.muted });
      var ox = narrow ? 0 : pw, oy = narrow ? 240 : 0, L2 = ox + 50, R2 = ox + (narrow ? W : W - pw) - 14, T2 = oy + 22, B2 = oy + 170, lo = -2, hi = 1;
      var Y2 = function (v) { return B2 - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-3)))) - lo) / (hi - lo) * (B2 - T2); }, X2 = function (d) { return L2 + d / 8 * (R2 - L2); };
      [-2, -1, 0, 1].forEach(function (v) { el('line', { x1: L2, y1: Y2(Math.pow(10, v)), x2: R2, y2: Y2(Math.pow(10, v)), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L2 - 6, Y2(Math.pow(10, v)) + 4, v === 1 ? '≥10' : String(Math.pow(10, v)), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [[cv, PURPLE, ''], [test, AMBER, '4 3']].forEach(function (q) { var dd = ''; q[0].forEach(function (e, d) { dd += (d ? 'L' : 'M') + X2(d).toFixed(1) + ' ' + Y2(e).toFixed(1); }); el('path', { d: dd, fill: 'none', stroke: q[1], 'stroke-width': 2, 'stroke-dasharray': q[2] }, svg); });
      el('circle', { cx: X2(best), cy: Y2(cv[best]), r: 6, fill: 'none', stroke: PURPLE, 'stroke-width': 2.5 }, svg);
      [0, 2, 4, 6, 8].forEach(function (d) { txt(svg, X2(d), B2 + 15, String(d), { size: fs(10), fill: c.muted }); });
      txt(svg, (L2 + R2) / 2, B2 + 30, 'degree', { size: fs(10), fill: c.muted });
      txt(svg, L2, T2 - 8, narrow ? 'purple: CV error · orange: test error' : 'purple: cross-validated error · orange: true test error', { anchor: 'start', size: fs(9), fill: c.muted });
      out.innerHTML = k + '-fold cross-validation picks <strong>degree ' + best + '</strong> (estimated error ' + efmt(cv[best]) + '). The error on the 60 held-out test points for that degree is ' + efmt(test[best]) + '.' +
        NOTE + 'The training data are split into k folds; each fold in turn is held out while a model is fitted to the rest, and the errors on the held-out folds are averaged. Only the 15 training points are used, yet the curve tracks the true test error and finds the same best degree. Shuffle the folds: with so few points, the estimate wobbles, which is why repeated cross-validation is often used.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: data leakage
     ----------------------------------------------------------------------- */
  FIG['fig-ml-leak'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var P = 1000, res = { w: [], r: [] }, seed = 11;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'lk-p', label: 'Number of random features', min: 50, max: 2000, step: 50, value: P, onChange: function (x) { P = x; res = { w: [], r: [] }; draw(); } });
    var row = group(controls, 'Actions');
    btn('Run 10 experiments', row).addEventListener('click', function () { for (var i = 0; i < 10; i++) one(); draw(); });
    btn('Clear', row).addEventListener('click', function () { res = { w: [], r: [] }; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function one() {
      var r = rngSeed(++seed * 7919), N = 50, X = [], y = [], i, j;
      for (i = 0; i < N; i++) { var row2 = new Float64Array(P); for (j = 0; j < P; j++) row2[j] = gaussR(r); X.push(row2); y.push(i < 25 ? 0 : 1); }
      for (i = N - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); var t = y[i]; y[i] = y[j]; y[j] = t; }
      function select(idx) { var sc = []; for (var jj = 0; jj < P; jj++) { var m0 = 0, m1 = 0, n0 = 0, n1 = 0; idx.forEach(function (ii) { if (y[ii]) { m1 += X[ii][jj]; n1++; } else { m0 += X[ii][jj]; n0++; } }); sc.push([Math.abs(m1 / n1 - m0 / n0), jj]); } sc.sort(function (a, b) { return b[0] - a[0]; }); return sc.slice(0, 20).map(function (q) { return q[1]; }); }
      var all = []; for (i = 0; i < N; i++) all.push(i);
      var order = all.slice(); for (i = N - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); var t2 = order[i]; order[i] = order[j]; order[j] = t2; }
      var Sall = select(all);
      [['w', true], ['r', false]].forEach(function (mode) {
        var ok = 0;
        for (var f = 0; f < 5; f++) {
          var test = order.filter(function (_, q) { return q % 5 === f; }), train = order.filter(function (_, q) { return q % 5 !== f; }), S = mode[1] ? Sall : select(train);
          var c0 = S.map(function () { return 0; }), c1 = S.map(function () { return 0; }), n0 = 0, n1 = 0;
          train.forEach(function (ii) { S.forEach(function (jj, q) { if (y[ii]) c1[q] += X[ii][jj]; else c0[q] += X[ii][jj]; }); if (y[ii]) n1++; else n0++; });
          test.forEach(function (ii) { var d0 = 0, d1 = 0; S.forEach(function (jj, q) { d0 += Math.pow(X[ii][jj] - c0[q] / n0, 2); d1 += Math.pow(X[ii][jj] - c1[q] / n1, 2); }); if ((d1 < d0 ? 1 : 0) === y[ii]) ok++; });
        }
        res[mode[0]].push(ok / N);
      });
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 170, 'Cross-validated accuracy with and without leakage'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(P));
      var L = W < 560 ? 104 : 200, R = W - 40, X = function (v) { return L + v * (R - L); };
      [['w', 'Features chosen using all data', 'Chosen on all data', RED], ['r', 'Features chosen inside each fold', 'Chosen in each fold', GREEN]].forEach(function (q, i) {
        var y = 30 + i * 60;
        txt(svg, L - 8, y + 4, W < 560 ? q[2] : q[1], { anchor: 'end', size: fs(10), fill: c.ink2 });
        el('line', { x1: L, y1: y, x2: R, y2: y, stroke: c.border }, svg);
        res[q[0]].forEach(function (a) { el('circle', { cx: X(a), cy: y + (Math.random() - 0.5) * 14, r: 3.5, fill: q[3], opacity: 0.7 }, svg); });
        if (res[q[0]].length) { var m = mean(res[q[0]]); el('line', { x1: X(m), y1: y - 14, x2: X(m), y2: y + 14, stroke: q[3], 'stroke-width': 3 }, svg); }
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), 128, pct(v, 0), { size: fs(10), fill: c.muted }); el('line', { x1: X(v), y1: 16, x2: X(v), y2: 116, stroke: c.border, 'stroke-width': 0.4 }, svg); });
      el('line', { x1: X(0.5), y1: 16, x2: X(0.5), y2: 116, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, (L + R) / 2, 148, 'cross-validated accuracy (50% = guessing)', { size: fs(10), fill: c.muted });
      var n = res.w.length;
      out.innerHTML = (n ? 'After ' + n + ' experiments: average accuracy <strong style="color:' + RED + '">' + pct(mean(res.w), 0) + '</strong> when the 20 “best” features were chosen using all 50 samples, and <strong style="color:' + GREEN + '">' + pct(mean(res.r), 0) + '</strong> when they were chosen using only the training folds.' : 'Press Run. Each experiment has 50 samples, ' + P + ' features of pure random noise and random labels: no model can truly do better than 50%.') +
        NOTE + 'Choosing the features that best separate the classes using all the data lets information about the test folds leak into the model. With enough random features, some will separate any labels by chance, and the leaky analysis reports impressive accuracy on pure noise. Every step that learns from data, including feature selection and scaling, must happen inside the training folds.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: learning curves
     ----------------------------------------------------------------------- */
  FIG['fig-ml-learncurve'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DEG = [1, 3, 9], di = 0, cache = {};
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Too simple (degree 1)', 'About right (degree 3)', 'Very flexible (degree 9)'], di, function (i) { di = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var NS = [12, 15, 20, 30, 40, 60, 80, 120, 160, 200];
    function compute(d) {
      if (cache[d]) return cache[d];
      var r = rngSeed(99 + d), tr = [], va = [], vx = [], vy = [];
      for (var i = 0; i < 300; i++) { var x = r(); vx.push(x); vy.push(truth(x) + 0.25 * gaussR(r)); }
      NS.forEach(function (n) { var a = [], b = []; for (var rep = 0; rep < 20; rep++) { var xs = [], ys = []; for (var i = 0; i < n; i++) { var x = r(); xs.push(x); ys.push(truth(x) + 0.25 * gaussR(r)); } var f = polyFit(xs, ys, d); a.push(mse(f, xs, ys)); b.push(Math.min(10, mse(f, vx, vy))); } a.sort(function (p, q) { return p - q; }); b.sort(function (p, q) { return p - q; }); tr.push(a[10]); va.push(b[10]); });
      return (cache[d] = [tr, va]);
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Training and validation error against training-set size'), W = A.W, svg = A.svg, fs = A.fs;
      var d = DEG[di], cv = compute(d), L = 50, R = W - 16, T = 22, B = 190, lo = -2, hi = 0.5;
      var X = function (n) { return L + (Math.log(n) - Math.log(12)) / (Math.log(200) - Math.log(12)) * (R - L); }, Y = function (v) { return B - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-3)))) - lo) / (hi - lo) * (B - T); };
      [0.01, 0.1, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      el('line', { x1: L, y1: Y(0.0625), x2: R, y2: Y(0.0625), stroke: c.ink, 'stroke-dasharray': '4 3' }, svg); txt(svg, R, Y(0.0625) - 4, 'noise floor', { anchor: 'end', size: fs(9), fill: c.ink2 });
      [[cv[0], BLUE], [cv[1], AMBER]].forEach(function (q) { var dd = ''; q[0].forEach(function (e, k) { dd += (k ? 'L' : 'M') + X(NS[k]).toFixed(1) + ' ' + Y(e).toFixed(1); }); el('path', { d: dd, fill: 'none', stroke: q[1], 'stroke-width': 2.4 }, svg); q[0].forEach(function (e, k) { el('circle', { cx: X(NS[k]), cy: Y(e), r: 3, fill: q[1] }, svg); }); });
      [12, 20, 40, 80, 200].forEach(function (n) { txt(svg, X(n), B + 15, String(n), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'number of training examples (log scale)', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, W < 560 ? 'blue: training · orange: validation' : 'blue: training error · orange: validation error (medians of 20 repeats, log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = ['<strong>High bias.</strong> Training and validation error quickly meet, well above the noise floor. More data will not help: the model is too simple. Use a more flexible model or better features.', '<strong>About right.</strong> Both errors approach the noise floor as data grow: little more can be gained.', '<strong>High variance.</strong> With few examples, training error is tiny but validation error is huge; the gap closes slowly as data grow. More data, or regularisation (Part 2), will help.'][di] +
        NOTE + 'A learning curve plots error against the amount of training data. Its shape tells you whether to collect more data or change the model, one of the most practical diagnostics in machine learning.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Predicting the price of a house from its size and location is…', options: ['Classification', 'Regression', 'Clustering', 'Reinforcement learning'], answer: 1, explanation: 'The target is a continuous number.' },
      { question: 'What is the difference between a parameter and a hyperparameter?', options: ['There is none', 'Parameters are learned from data; hyperparameters are set before training, such as the polynomial degree', 'Hyperparameters are learned; parameters are set by hand', 'Parameters only exist in neural networks'], answer: 1, explanation: 'Hyperparameters control the learning process or model size.' },
      { question: 'A model has very low training error but high test error. It is…', options: ['Underfitting', 'Overfitting', 'Perfectly fitted', 'Leaking'], answer: 1, explanation: 'It has memorised the training data, noise included.' },
      { question: 'High bias means…', options: ['The model changes a lot between training sets', 'The model is systematically wrong, usually because it is too simple', 'The data are unfair', 'The model is too complex'], answer: 1, explanation: 'Bias is error from wrong assumptions; variance is sensitivity to the training set.' },
      { question: 'Why keep a separate test set that is never used during model selection?', options: ['To save time', 'To get an unbiased estimate of performance on new data', 'Because cross-validation requires it', 'To increase the training data'], answer: 1, explanation: 'Any data used to make choices no longer gives an honest estimate.' },
      { question: 'In 5-fold cross-validation, each data point is used for validation…', options: ['Five times', 'Exactly once', 'Never', 'Randomly'], answer: 1, explanation: 'Each fold is held out once.' },
      { question: 'Features are selected using the whole data set, and then cross-validation is run. The problem is…', options: ['Nothing', 'Data leakage: the selection has already seen the validation folds', 'Too few features', 'Underfitting'], answer: 1, explanation: 'Every data-dependent step must be repeated inside each training fold.' },
      { question: 'Training and validation error are both high and close together, even with lots of data. The best next step is…', options: ['Collect much more data', 'Use a more flexible model or better features', 'Add regularisation', 'Remove the test set'], answer: 1, explanation: 'This is high bias: more data will not fix it.' },
      { question: 'What does the no-free-lunch theorem say?', options: ['Deep learning is always best', 'Averaged over all possible problems, no learning algorithm outperforms any other', 'Free software is better', 'More data is always better'], answer: 1, explanation: 'An algorithm works well only if its assumptions match the problem.' },
      { question: 'A model scores 95% accuracy on a test set that also helped choose its hyperparameters. This estimate is probably…', options: ['Accurate', 'Optimistic', 'Pessimistic', 'Exact'], answer: 1, explanation: 'Selecting on the test set fits it a little; a fresh test set would likely score lower.' }
    ]);
  };
})();
