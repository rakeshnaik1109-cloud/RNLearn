/* ==========================================================================
   RNLearn — Ensembles (Inside the Machine, Part 4)
   Figures:
     fig-ml-map         The map of the series
     fig-ml4-timeline   The story at a glance
     fig-ml-ensavg      The mathematics of combining
     fig-ml-forest      One tree, bagging and a random forest
     fig-ml-adaboost    AdaBoost builds a circle from straight lines
     fig-ml-gboost      Gradient boosting on the running example
     fig-quiz-ml4       Test yourself
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
    { name: 'Crowds and votes', color: '#b45309' },
    { name: 'Bagging and forests', color: '#15803d' },
    { name: 'Boosting', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1785', icon: '🗳️', era: 0, sec: 3, title: 'The jury theorem', text: 'The Marquis de Condorcet shows that a majority of independent voters, each more likely right than wrong, is almost certainly right when the group is large.' },
    { year: '1907', icon: '🐂', era: 0, sec: 1, title: 'Vox populi', text: 'Francis Galton finds that the middle estimate of 787 visitors guessing the weight of an ox is within 1% of the truth.' },
    { year: '1990', icon: '💡', era: 2, sec: 7, title: 'Weak becomes strong', text: 'Robert Schapire proves that any learner slightly better than guessing can be “boosted” into an arbitrarily accurate one.' },
    { year: '1992', icon: '🥞', era: 0, sec: 11, title: 'Stacked generalisation', text: 'David Wolpert proposes training a model to combine the predictions of other models.' },
    { year: '1995', icon: '🌲', era: 1, sec: 5, title: 'Random decision forests', text: 'Tin Kam Ho builds forests of trees grown on random subsets of the features.' },
    { year: '1996', icon: '🎒', era: 1, sec: 4, title: 'Bagging', text: 'Leo Breiman introduces bootstrap aggregating: train on resampled data and average.' },
    { year: '1997', icon: '🚀', era: 2, sec: 7, title: 'AdaBoost', text: 'Yoav Freund and Schapire publish AdaBoost, later honoured with the Gödel Prize.' },
    { year: '1998', icon: '📏', era: 2, sec: 13, title: 'Margins', text: 'Schapire and colleagues offer an explanation for why boosting often keeps improving after training error reaches zero.' },
    { year: '2001', icon: '🌳', era: 1, sec: 5, title: 'Random forests', text: 'Breiman combines bagging with random feature selection at each split, and adds out-of-bag estimates and variable importance.' },
    { year: '2001', icon: '📉', era: 2, sec: 8, title: 'Gradient boosting', text: 'Jerome Friedman recasts boosting as gradient descent in function space.' },
    { year: '2009', icon: '🎬', era: 0, sec: 16, title: 'The Netflix Prize', text: 'A team blending hundreds of models wins Netflix’s $1 million competition to improve its film recommendations.' },
    { year: '2016', icon: '⚡', era: 2, sec: 9, title: 'XGBoost', text: 'Tianqi Chen and Carlos Guestrin describe XGBoost, a fast, scalable gradient-boosting system that dominated machine-learning competitions.' },
    { year: '2018', icon: '🐱', era: 2, sec: 9, title: 'LightGBM and CatBoost', text: 'New libraries (LightGBM, 2017; CatBoost, 2018) make gradient boosting faster and better with categorical features.' }
  ];

  FIG['fig-ml4-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1785 to 2018');
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

  var ML_PART = 4;
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
  function knnClf(train, k, metric) {
    return function (x, y) {
      var d = train.map(function (p) { var a = p[0] - x, b = p[1] - y; return [metric ? Math.abs(a) + Math.abs(b) : a * a + b * b, p[2]]; });
      d.sort(function (u, v) { return u[0] - v[0]; });
      var s = 0; for (var i = 0; i < k; i++) s += d[i][1]; return s / k;
    };
  }
  function knnReg(xs, ys, k) {
    return function (x) { var d = xs.map(function (v, i) { return [Math.abs(v - x), ys[i]]; }); d.sort(function (u, v) { return u[0] - v[0]; }); var s = 0; for (var i = 0; i < k; i++) s += d[i][1]; return s / k; };
  }
  function gnb(train) {
    var st = [0, 1].map(function (cl) { var P = train.filter(function (p) { return p[2] === cl; }), m = [mean(P.map(function (p) { return p[0]; })), mean(P.map(function (p) { return p[1]; }))]; var v = [0, 1].map(function (j) { return P.reduce(function (s, p) { return s + Math.pow(p[j] - m[j], 2); }, 0) / P.length + 1e-9; }); return { m: m, v: v, prior: P.length / train.length }; });
    var f = function (x, y) { var lp = st.map(function (s) { var l = Math.log(s.prior); [x, y].forEach(function (z, j) { l += -0.5 * Math.log(2 * Math.PI * s.v[j]) - Math.pow(z - s.m[j], 2) / (2 * s.v[j]); }); return l; }); var mx = Math.max(lp[0], lp[1]); return Math.exp(lp[1] - mx) / (Math.exp(lp[0] - mx) + Math.exp(lp[1] - mx)); };
    f.st = st; return f;
  }
  function impurity(n1, n, crit) { if (!n) return 0; var p = n1 / n; if (crit === 'entropy') return (p > 0 ? -p * Math.log2(p) : 0) + (p < 1 ? -(1 - p) * Math.log2(1 - p) : 0); return 2 * p * (1 - p); }
  function growTree(pts, depth, crit, minLeaf) {
    minLeaf = minLeaf || 1;
    function node(P, d) {
      var n1 = P.filter(function (p) { return p[2] === 1; }).length, nd = { n: P.length, p: n1 / P.length, leaf: true };
      if (d >= depth || n1 === 0 || n1 === P.length || P.length < 2 * minLeaf) return nd;
      var best = null, base = impurity(n1, P.length, crit);
      [0, 1].forEach(function (j) {
        var S = P.slice().sort(function (a, b) { return a[j] - b[j]; }), l1 = 0;
        for (var i = 0; i < S.length - 1; i++) {
          l1 += S[i][2]; if (S[i][j] === S[i + 1][j]) continue;
          var nl = i + 1, nr = S.length - nl; if (nl < minLeaf || nr < minLeaf) continue;
          var g = base - (nl * impurity(l1, nl, crit) + nr * impurity(n1 - l1, nr, crit)) / S.length;
          if (!best || g > best.g + 1e-12) best = { g: g, j: j, t: (S[i][j] + S[i + 1][j]) / 2 };
        }
      });
      if (!best || best.g <= 1e-12) return nd;
      nd.leaf = false; nd.j = best.j; nd.t = best.t; nd.gain = best.g;
      nd.l = node(P.filter(function (p) { return p[best.j] <= best.t; }), d + 1);
      nd.r = node(P.filter(function (p) { return p[best.j] > best.t; }), d + 1);
      return nd;
    }
    var root = node(pts, 0);
    var f = function (x, y) { var nd = root; while (!nd.leaf) nd = (nd.j ? y : x) <= nd.t ? nd.l : nd.r; return nd.p; };
    f.root = root; return f;
  }
  function countLeaves(nd) { return nd.leaf ? 1 : countLeaves(nd.l) + countLeaves(nd.r); }
  function growRegTree(xs, ys, depth) {
    function node(I, d) {
      var m = mean(I.map(function (i) { return ys[i]; })), nd = { m: m, leaf: true };
      if (d >= depth || I.length < 2) return nd;
      var S = I.slice().sort(function (a, b) { return xs[a] - xs[b]; }), tot = 0, tot2 = 0; S.forEach(function (i) { tot += ys[i]; tot2 += ys[i] * ys[i]; });
      var best = null, l = 0, l2 = 0;
      for (var k = 0; k < S.length - 1; k++) { l += ys[S[k]]; l2 += ys[S[k]] * ys[S[k]]; var nl = k + 1, nr = S.length - nl, sse = (l2 - l * l / nl) + ((tot2 - l2) - (tot - l) * (tot - l) / nr); if (xs[S[k]] !== xs[S[k + 1]] && (!best || sse < best.sse)) best = { sse: sse, t: (xs[S[k]] + xs[S[k + 1]]) / 2 }; }
      if (!best) return nd;
      nd.leaf = false; nd.t = best.t; nd.l = node(I.filter(function (i) { return xs[i] <= best.t; }), d + 1); nd.r = node(I.filter(function (i) { return xs[i] > best.t; }), d + 1); return nd;
    }
    var root = node(xs.map(function (_, i) { return i; }), 0);
    return function (x) { var nd = root; while (!nd.leaf) nd = x <= nd.t ? nd.l : nd.r; return nd.m; };
  }


  /* -----------------------------------------------------------------------
     Ensemble models
     ----------------------------------------------------------------------- */
  function rfTree(pts, r, mtry) {
    function node(P) {
      var n1 = 0; P.forEach(function (p) { n1 += p[2]; });
      var nd = { p: n1 / P.length, leaf: true };
      if (n1 === 0 || n1 === P.length || P.length < 2) return nd;
      var feats = mtry === 1 ? [r() < 0.5 ? 0 : 1] : [0, 1], best = null, base = 2 * nd.p * (1 - nd.p);
      feats.forEach(function (j) {
        var S = P.slice().sort(function (a, b) { return a[j] - b[j]; }), l1 = 0;
        for (var i = 0; i < S.length - 1; i++) { l1 += S[i][2]; if (S[i][j] === S[i + 1][j]) continue; var nl = i + 1, nr = S.length - nl, pl = l1 / nl, pr = (n1 - l1) / nr, g = base - (nl * 2 * pl * (1 - pl) + nr * 2 * pr * (1 - pr)) / S.length; if (!best || g > best.g + 1e-12) best = { g: g, j: j, t: (S[i][j] + S[i + 1][j]) / 2 }; }
      });
      if (!best || best.g <= 1e-12) { if (mtry === 1) { /* try the other feature before giving up */ var alt = rfTreeSplit(P, 1 - feats[0], n1, base); if (alt) best = alt; else return nd; } else return nd; }
      nd.leaf = false; nd.j = best.j; nd.t = best.t;
      nd.l = node(P.filter(function (p) { return p[best.j] <= best.t; })); nd.r = node(P.filter(function (p) { return p[best.j] > best.t; }));
      return nd;
    }
    var root = node(pts);
    return function (x, y) { var nd = root; while (!nd.leaf) nd = (nd.j ? y : x) <= nd.t ? nd.l : nd.r; return nd.p; };
  }
  function rfTreeSplit(P, j, n1, base) {
    var S = P.slice().sort(function (a, b) { return a[j] - b[j]; }), l1 = 0, best = null;
    for (var i = 0; i < S.length - 1; i++) { l1 += S[i][2]; if (S[i][j] === S[i + 1][j]) continue; var nl = i + 1, nr = S.length - nl, pl = l1 / nl, pr = (n1 - l1) / nr, g = base - (nl * 2 * pl * (1 - pl) + nr * 2 * pr * (1 - pr)) / S.length; if (!best || g > best.g + 1e-12) best = { g: g, j: j, t: (S[i][j] + S[i + 1][j]) / 2 }; }
    return best && best.g > 1e-12 ? best : null;
  }
  function buildForest(train, B, mode, seed) {
    var r = rngSeed(seed || 31), trees = [], bags = [];
    for (var b = 0; b < B; b++) {
      var idx = [], P = [];
      if (mode === 0) { for (var i = 0; i < train.length; i++) idx.push(i); }
      else for (var k = 0; k < train.length; k++) idx.push(Math.floor(r() * train.length));
      idx.forEach(function (i) { P.push(train[i]); });
      trees.push(rfTree(P, r, mode === 2 ? 1 : 2)); bags.push(idx);
      if (mode === 0) break;
    }
    var f = function (x, y) { var s = 0; trees.forEach(function (t) { s += t(x, y); }); return s / trees.length; };
    f.trees = trees; f.bags = bags; return f;
  }
  function oobAccuracy(f, train) {
    var ok = 0, n = 0;
    train.forEach(function (p, i) { var s = 0, c = 0; f.trees.forEach(function (t, b) { if (f.bags[b].indexOf(i) < 0) { s += t(p[0], p[1]); c++; } }); if (c) { n++; if ((s / c >= 0.5 ? 1 : 0) === p[2]) ok++; } });
    return n ? ok / n : NaN;
  }
  function adaboost(train, T) {
    var n = train.length, w = train.map(function () { return 1 / n; }), y = train.map(function (p) { return p[2] ? 1 : -1; }), stumps = [];
    for (var t = 0; t < T; t++) {
      var best = null;
      [0, 1].forEach(function (j) {
        var S = train.map(function (p, i) { return [p[j], i]; }).sort(function (a, b) { return a[0] - b[0]; }), tot = 0, left = 0;
        y.forEach(function (yy, i) { tot += w[i] * yy; });
        for (var k = -1; k < n; k++) {
          if (k >= 0) left += w[S[k][1]] * y[S[k][1]];
          if (k >= 0 && k < n - 1 && S[k][0] === S[k + 1][0]) continue;
          var th = k < 0 ? S[0][0] - 1 : k === n - 1 ? S[n - 1][0] + 1 : (S[k][0] + S[k + 1][0]) / 2;
          var score = -left + (tot - left);
          [1, -1].forEach(function (pol) { var err = 0.5 - pol * score / 2; if (!best || err < best.err) best = { err: err, j: j, th: th, pol: pol }; });
        }
      });
      var err = Math.min(Math.max(best.err, 1e-10), 1 - 1e-10), alpha = 0.5 * Math.log((1 - err) / err);
      var h = function (b) { return function (p) { return ((p[b.j] > b.th) ? 1 : -1) * b.pol; }; }(best);
      var s = 0; train.forEach(function (p, i) { w[i] *= Math.exp(-alpha * y[i] * h(p)); s += w[i]; }); w = w.map(function (v) { return v / s; });
      stumps.push({ a: alpha, h: h, err: best.err });
    }
    var F = function (x, yy) { var s = 0, p = [x, yy]; stumps.forEach(function (st) { s += st.a * st.h(p); }); return s; };
    var f = function (x, yy) { return 1 / (1 + Math.exp(-2 * F(x, yy))); };
    f.w = w; f.stumps = stumps; return f;
  }
  function gboost(xs, ys, M, nu, depth) {
    var F0 = mean(ys), pred = xs.map(function () { return F0; }), trees = [];
    for (var m = 0; m < M; m++) { var res = ys.map(function (y, i) { return y - pred[i]; }), t = growRegTree(xs, res, depth); trees.push(t); pred = pred.map(function (p, i) { return p + nu * t(xs[i]); }); }
    var f = function (x, upto) { var s = F0, K = upto === undefined ? trees.length : upto; for (var k = 0; k < K; k++) s += nu * trees[k](x); return s; };
    f.trees = trees; f.F0 = F0; return f;
  }

  /* -----------------------------------------------------------------------
     Figure: why averaging works
     ----------------------------------------------------------------------- */
  FIG['fig-ml-ensavg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, rho = 0.3, p = 0.6;
    var controls = div('fig-controls', container);
    choice(controls, 'Combine by', ['Averaging numbers', 'Majority vote'], mode, function (i) { mode = i; build(); draw(); });
    var box = div('', controls); box.style.cssText = 'display:contents;'; var sl;
    function build() { box.innerHTML = ''; sl = mode === 0 ? FIG.slider(box, { id: 'ea-r', label: 'Correlation between models’ errors ρ', min: 0, max: 1, step: 0.01, value: rho, onChange: function (x) { rho = x; draw(); } }) : FIG.slider(box, { id: 'ea-p', label: 'Accuracy of each independent voter', min: 0.4, max: 0.9, step: 0.01, value: p, onChange: function (x) { p = x; draw(); } }); }
    build();
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function majority(B, q) { var s = 0; for (var k = Math.floor(B / 2) + 1; k <= B; k++) s += Math.exp(lgamma(B + 1) - lgamma(k + 1) - lgamma(B - k + 1) + k * Math.log(q) + (B - k) * Math.log(1 - q)); return s; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, mode ? 'Accuracy of a majority vote against the number of voters' : 'Variance of an average against the number of models'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 50, R = W - 16, T = 22, B = 180, Nmax = 101, X = function (n) { return L + (n - 1) / (Nmax - 1) * (R - L); }, Y = function (v) { return B - v * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, mode ? pct(v, 0) : fmt(v, 2), { anchor: 'end', size: fs(10), fill: c.muted }); });
      var d = '';
      if (mode === 0) { valText(sl, fmt(rho, 2)); for (var n = 1; n <= Nmax; n++) d += (n > 1 ? 'L' : 'M') + X(n).toFixed(1) + ' ' + Y(rho + (1 - rho) / n).toFixed(1); el('line', { x1: L, y1: Y(rho), x2: R, y2: Y(rho), stroke: RED, 'stroke-dasharray': '4 3' }, svg); txt(svg, R, Y(rho) - 5, 'floor = ρ', { anchor: 'end', size: fs(10), fill: RED }); }
      else { valText(sl, pct(p, 0)); for (var m = 1; m <= Nmax; m += 2) d += (m > 1 ? 'L' : 'M') + X(m).toFixed(1) + ' ' + Y(majority(m, p)).toFixed(1); el('line', { x1: L, y1: Y(p), x2: R, y2: Y(p), stroke: c.muted, 'stroke-dasharray': '4 3' }, svg); }
      el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, svg);
      [1, 25, 50, 75, 101].forEach(function (n) { txt(svg, X(n), B + 15, String(n), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, mode ? 'number of voters' : 'number of models averaged', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, mode ? 'probability the majority is right' : 'variance of the average (one model = 1)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = mode === 0 ? 'Averaging 10 models whose errors have correlation ρ = ' + fmt(rho, 2) + ' cuts the variance to <strong>' + fmt(rho + (1 - rho) / 10, 2) + '</strong> of a single model’s; averaging 100, to ' + fmt(rho + (1 - rho) / 100, 2) + '. No number of models can get below ρ.' + NOTE + 'Averaging only cancels errors that differ between models. Identical models (ρ = 1) gain nothing; independent ones (ρ = 0) reduce variance as 1/B. This is why ensembles work hard to make their members different.</span>'
        : 'With independent voters each right ' + pct(p, 0) + ' of the time, a majority of 11 is right <strong>' + pct(majority(11, p), 1) + '</strong> of the time and a majority of 101, <strong>' + pct(majority(101, p), 1) + '</strong>.' + NOTE + 'This is Condorcet’s jury theorem (1785): if voters are independent and each better than chance, the majority becomes almost certainly right as the group grows. If each is worse than chance, the majority becomes almost certainly wrong. Real models are never fully independent, so real gains are smaller.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: tree, bagging and random forest
     ----------------------------------------------------------------------- */
  FIG['fig-ml-forest'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 1, mode = 2, B = 100, data = makeData('moons'), cache = {};
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); cache = {}; draw(); });
    choice(controls, 'Method', ['One deep tree', 'Bagging', 'Random forest'], mode, function (i) { mode = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'rf-b', label: 'Number of trees', min: 1, max: 200, step: 1, value: B, onChange: function (x) { B = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Decision boundary of a tree ensemble'), W = A.W, svg = A.svg;
      valText(s1, mode === 0 ? '1' : String(B));
      var key = mode + '_' + (mode ? B : 1), f = cache[key] || (cache[key] = buildForest(data.train, mode ? B : 1, mode, 31)), S = Math.min(W - 20, 380);
      drawClfPanel(svg, c, f, data, (W - S) / 2, 10, S, 280, { grid: 64 });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test), oob = mode ? oobAccuracy(f, data.train) : NaN;
      out.innerHTML = (mode === 0 ? 'One fully grown tree' : (mode === 1 ? 'Bagging' : 'Random forest') + ' of ' + B + ' trees') + ': training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>' + (mode && isFinite(oob) ? ', out-of-bag estimate ' + pct(oob, 0) : '') + '.' +
        NOTE + (mode === 0 ? 'A single unpruned tree draws a jagged boundary around noisy points.' : mode === 1 ? 'Each tree is grown on a bootstrap sample (drawn with replacement) of the training points; the shading is their average vote. The jagged edges of individual trees average out into a smoother boundary.' : 'As in bagging, but at each split a tree may only consider a randomly chosen feature (here 1 of the 2), which makes the trees more different from one another, so their errors cancel better.') + ' The out-of-bag estimate uses, for each training point, only the trees that never saw it: a free substitute for cross-validation.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: AdaBoost
     ----------------------------------------------------------------------- */
  FIG['fig-ml-adaboost'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 2, T = 5, data = makeData('circles'), cache = {};
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); cache = {}; draw(); });
    var s1 = FIG.slider(controls, { id: 'ab-t', label: 'Boosting rounds (stumps)', min: 1, max: 300, step: 1, value: T, onChange: function (x) { T = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'AdaBoost boundary with point weights'), W = A.W, svg = A.svg;
      valText(s1, String(T));
      var f = cache[T] || (cache[T] = adaboost(data.train, T)), S = Math.min(W - 20, 380), L = (W - S) / 2;
      var P = drawClfPanel(svg, c, f, data, L, 10, S, 280, { grid: 64 });
      var wmax = Math.max.apply(null, f.w);
      data.train.forEach(function (p, i) { var r = 2 + 9 * Math.sqrt(f.w[i] / wmax); if (f.w[i] > 2 / data.train.length) el('circle', { cx: P.X(p[0]), cy: P.Y(p[1]), r: r, fill: 'none', stroke: p[2] ? AMBER : BLUE, 'stroke-width': 1.5 }, svg); });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test), last = f.stumps[f.stumps.length - 1];
      out.innerHTML = T + ' stump' + (T > 1 ? 's' : '') + ': training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>. The latest stump has weighted error ' + pct(last.err, 0) + ' and vote weight α = ' + fmt(last.a, 2) + '.' +
        NOTE + 'Each round fits a stump (a one-split tree) to weighted data, then increases the weights of the points it got wrong (rings: points with large weight), so the next stump concentrates on them. The final model is a weighted vote of all the stumps. Single stumps can only draw a straight vertical or horizontal line; hundreds of them build a ring.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: gradient boosting on the running example
     ----------------------------------------------------------------------- */
  FIG['fig-ml-gboost'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = 20, NU = [1, 0.3, 0.1], ni = 2, depth = 1, cache = {};
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'gb-m', label: 'Boosting rounds', min: 0, max: 300, step: 1, value: M, onChange: function (x) { M = x; draw(); } });
    choice(controls, 'Learning rate ν', ['1', '0.3', '0.1'], ni, function (i) { ni = i; draw(); });
    choice(controls, 'Tree depth', ['1 (stumps)', '2', '3'], 0, function (i) { depth = i + 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 450 : 250, 'Gradient boosting fit and error by round'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(M));
      var key = ni + '_' + depth, g = cache[key] || (cache[key] = gboost(XTR, YTR, 300, NU[ni], depth)), pw = narrow ? W : W * 0.56;
      var f = function (x) { return g(x, M); };
      var P = plotFrame(svg, c, fs, 40, pw - 10, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      var d = ''; for (var q = 0; q <= 400; q++) { var x = q / 400; d += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(f(x)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, svg);
      XTR.forEach(function (x, i) { el('line', { x1: P.X(x), y1: P.Y(YTR[i]), x2: P.X(x), y2: P.Y(f(x)), stroke: PURPLE, 'stroke-width': 1.2 }, svg); el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, 40, 12, narrow ? 'red: model · purple: residuals' : 'red: boosted model · purple: residuals the next tree will fit', { anchor: 'start', size: fs(10), fill: c.muted });
      var ox = narrow ? 0 : pw, oy = narrow ? 240 : 0, L2 = ox + 46, R2 = ox + (narrow ? W : W - pw) - 12, T2 = oy + 22, B2 = oy + 180, lo = -3, hi = 0;
      var X2 = function (m) { return L2 + m / 300 * (R2 - L2); }, Y2 = function (v) { return B2 - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-3)))) - lo) / (hi - lo) * (B2 - T2); };
      [0.001, 0.01, 0.1, 1].forEach(function (v) { el('line', { x1: L2, y1: Y2(v), x2: R2, y2: Y2(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L2 - 6, Y2(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      var dtr = '', dte = '', bestM = 0, bestE = 1e9;
      for (var m = 0; m <= 300; m += 3) { var ft = function (x) { return g(x, m); }, a = mse(ft, XTR, YTR), b = mse(ft, XTE, YTE); if (b < bestE) { bestE = b; bestM = m; } dtr += (m ? 'L' : 'M') + X2(m).toFixed(1) + ' ' + Y2(a).toFixed(1); dte += (m ? 'L' : 'M') + X2(m).toFixed(1) + ' ' + Y2(b).toFixed(1); }
      el('path', { d: dtr, fill: 'none', stroke: BLUE, 'stroke-width': 2 }, svg); el('path', { d: dte, fill: 'none', stroke: AMBER, 'stroke-width': 2 }, svg);
      el('line', { x1: X2(M), y1: T2, x2: X2(M), y2: B2, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      [0, 100, 200, 300].forEach(function (m) { txt(svg, X2(m), B2 + 15, String(m), { size: fs(10), fill: c.muted }); });
      txt(svg, (L2 + R2) / 2, B2 + 30, 'rounds', { size: fs(10), fill: c.muted });
      txt(svg, L2, T2 - 8, 'blue: training error · orange: test error', { anchor: 'start', size: fs(9), fill: c.muted });
      out.innerHTML = M + ' rounds, ν = ' + NU[ni] + ', depth ' + depth + ': training error ' + efmt(mse(f, XTR, YTR)) + ', test error <strong>' + efmt(mse(f, XTE, YTE)) + '</strong>. Over 0–300 rounds the lowest test error, ' + efmt(bestE) + ', comes at about ' + bestM + ' rounds.' +
        NOTE + 'Gradient boosting starts from the average and adds small trees one at a time, each fitted to the residuals (the errors) left by the model so far, scaled down by the learning rate ν. Training error falls steadily; test error falls and then slowly rises as later trees chase noise. A small ν with more rounds, stopped early, usually works best.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why does averaging many models reduce error?', options: ['Each model becomes more accurate', 'Errors that differ between models partly cancel, reducing variance', 'It removes bias completely', 'It uses more data'], answer: 1, explanation: 'Averaging cancels uncorrelated errors; correlated errors remain.' },
      { question: 'In bagging, each model is trained on…', options: ['The full training set', 'A bootstrap sample drawn with replacement from the training set', 'A different feature only', 'The test set'], answer: 1, explanation: 'Bootstrap aggregating: about 63% of the distinct points appear in each sample.' },
      { question: 'What does a random forest add to bagging?', options: ['Boosting weights', 'A random subset of features considered at each split', 'Deeper trees', 'Linear models at the leaves'], answer: 1, explanation: 'This decorrelates the trees so their errors cancel better.' },
      { question: 'What is the out-of-bag estimate?', options: ['The error on the test set', 'An estimate of test error using, for each point, only the trees that did not see it in training', 'The training error', 'The number of trees needed'], answer: 1, explanation: 'It comes free with bagging and random forests.' },
      { question: 'Bagging mainly reduces…, while boosting mainly reduces…', options: ['bias; variance', 'variance; bias', 'training time; memory', 'features; examples'], answer: 1, explanation: 'Bagging averages high-variance models; boosting builds up weak, biased models step by step.' },
      { question: 'In AdaBoost, after each round the weights of misclassified points…', options: ['Decrease', 'Increase', 'Stay the same', 'Are set to zero'], answer: 1, explanation: 'The next weak learner focuses on the hard cases.' },
      { question: 'In gradient boosting for squared error, each new tree is fitted to…', options: ['The original targets', 'The residuals of the current model', 'Random noise', 'The test errors'], answer: 1, explanation: 'Residuals are the negative gradient of the squared-error loss.' },
      { question: 'What does a small learning rate (shrinkage) in gradient boosting do?', options: ['Makes training faster', 'Takes smaller steps, usually needing more trees but generalising better', 'Removes the need for trees', 'Increases overfitting'], answer: 1, explanation: 'Combine it with early stopping on validation data.' },
      { question: 'Stacking combines models by…', options: ['Averaging them equally', 'Training a second-level model to combine their predictions', 'Using only the best model', 'Growing them one after another on residuals'], answer: 1, explanation: 'The meta-model learns how much to trust each base model, using out-of-fold predictions.' },
      { question: 'Why did Netflix not deploy the full winning Netflix Prize ensemble?', options: ['It was inaccurate', 'The extra accuracy did not justify the engineering cost', 'It was illegal', 'It used too little data'], answer: 1, explanation: 'Accuracy is not the only thing that matters in production.' }
    ]);
  };
})();
