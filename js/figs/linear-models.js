/* ==========================================================================
   RNLearn — Linear Models (Inside the Machine, Part 2)
   Figures:
     fig-ml-map         The map of the series
     fig-ml2-timeline   The story at a glance
     fig-ml-gd          Gradient descent on a real loss surface
     fig-ml-reg         The regularisation lab
     fig-ml-l1l2        The geometry of L1 and L2
     fig-ml-logreg      The logistic regression playground
     fig-quiz-ml2       Test yourself
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
    { name: 'Fitting lines', color: '#b45309' },
    { name: 'Learning step by step', color: '#a21caf' },
    { name: 'Taming complexity', color: '#1d4ed8' }
  ];
  var EVENTS = [
    { year: '1805', icon: '☄️', era: 0, sec: 3, title: 'Least squares', text: 'Adrien-Marie Legendre publishes the method of least squares, still the standard way to fit a linear regression.' },
    { year: '1847', icon: '⛰️', era: 1, sec: 4, title: 'Steepest descent', text: 'Augustin-Louis Cauchy describes solving equations by repeatedly stepping in the direction that most decreases an error.' },
    { year: '1943', icon: '🧮', era: 2, sec: 7, title: 'Stabilising solutions', text: 'Andrey Tikhonov shows how adding a penalty makes unstable “inverse problems” solvable: the idea behind ridge regression.' },
    { year: '1951', icon: '🎲', era: 1, sec: 5, title: 'Stochastic approximation', text: 'Herbert Robbins and Sutton Monro show that noisy, step-by-step updates can still converge: the root of stochastic gradient descent.' },
    { year: '1958', icon: '🔀', era: 0, sec: 9, title: 'Logistic regression and the perceptron', text: 'David Cox develops logistic regression for binary outcomes; Frank Rosenblatt publishes the perceptron.' },
    { year: '1960', icon: '📡', era: 1, sec: 5, title: 'The LMS rule', text: 'Bernard Widrow and Ted Hoff train the ADALINE with the least-mean-squares rule, an early form of stochastic gradient descent.' },
    { year: '1970', icon: '🏔️', era: 2, sec: 7, title: 'Ridge regression', text: 'Arthur Hoerl and Robert Kennard propose ridge regression for badly conditioned, correlated predictors.' },
    { year: '1972', icon: '🧬', era: 0, sec: 10, title: 'Generalised linear models', text: 'John Nelder and Robert Wedderburn unify linear, logistic and Poisson regression.' },
    { year: '1996', icon: '🪢', era: 2, sec: 8, title: 'The lasso', text: 'Robert Tibshirani proposes the lasso, whose L1 penalty both shrinks and selects variables.' },
    { year: '2005', icon: '🕸️', era: 2, sec: 7, title: 'Elastic net', text: 'Hui Zou and Trevor Hastie combine the ridge and lasso penalties.' },
    { year: '2010', icon: '⚙️', era: 2, sec: 8, title: 'Fast regularisation paths', text: 'Jerome Friedman, Hastie and Tibshirani show that coordinate descent computes whole lasso paths quickly.' },
    { year: '2020', icon: '🌱', era: 2, sec: 13, title: 'Benign overfitting', text: 'Theory shows when even linear models that fit noisy training data exactly can still predict well.' }
  ];

  FIG['fig-ml2-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1805 to 2020');
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

  var ML_PART = 2;
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
  function fitLogistic(pts, d, lam) {
    var F = pts.map(function (p) { return polyFeat(p[0], p[1], d); }), m = F[0].length, mu = [], sd = [], j, i;
    for (j = 0; j < m; j++) { var s = 0, q = 0; F.forEach(function (f) { s += f[j]; q += f[j] * f[j]; }); mu.push(s / F.length); sd.push(Math.sqrt(Math.max(q / F.length - Math.pow(s / F.length, 2), 1e-12))); }
    var X = F.map(function (f) { return [1].concat(f.map(function (v, k) { return (v - mu[k]) / sd[k]; })); }), w = new Array(m + 1).fill(0), n = X.length;
    for (var it = 0; it < 40; it++) {
      var H = [], g = new Array(m + 1).fill(0);
      for (i = 0; i <= m; i++) H.push(new Array(m + 1).fill(0));
      X.forEach(function (x, k) { var z = 0; for (var a = 0; a <= m; a++) z += w[a] * x[a]; var p = sigmoid(z), e = p - pts[k][2], ww = p * (1 - p); for (a = 0; a <= m; a++) { g[a] += e * x[a] / n; for (var b = 0; b <= m; b++) H[a][b] += ww * x[a] * x[b] / n; } });
      for (i = 1; i <= m; i++) { g[i] += lam * w[i]; H[i][i] += lam; }
      H[0][0] += 1e-9;
      var step = solveSym(H, g), mx = 0; for (i = 0; i <= m; i++) { w[i] -= step[i]; mx = Math.max(mx, Math.abs(step[i])); }
      if (mx < 1e-8) break;
    }
    return function (x, y) { var f = polyFeat(x, y, d), z = w[0]; for (var k = 0; k < m; k++) z += w[k + 1] * (f[k] - mu[k]) / sd[k]; return sigmoid(z); };
  }
  function evalClf(f, pts) { var ok = 0, ll = 0; pts.forEach(function (p) { var q = Math.min(1 - 1e-12, Math.max(1e-12, f(p[0], p[1]))); if ((q >= 0.5 ? 1 : 0) === p[2]) ok++; ll -= p[2] ? Math.log(q) : Math.log(1 - q); }); return [ok / pts.length, ll / pts.length]; }

  /* Ridge and lasso on standardised polynomial features of the running example */
  function polyDesign(xs, d) { return xs.map(function (x) { var u = (x - 0.5) * 2, r = []; for (var k = 1; k <= d; k++) r.push(Math.pow(u, k)); return r; }); }
  function standardiser(X) { var m = X[0].length, mu = [], sd = []; for (var j = 0; j < m; j++) { var s = 0, q = 0; X.forEach(function (r) { s += r[j]; q += r[j] * r[j]; }); mu.push(s / X.length); sd.push(Math.sqrt(q / X.length - Math.pow(s / X.length, 2))); } return { mu: mu, sd: sd, apply: function (X2) { return X2.map(function (r) { return r.map(function (v, k) { return (v - mu[k]) / sd[k]; }); }); } }; }
  function fitPenalised(xs, ys, d, lam, kind) {
    var X0 = polyDesign(xs, d), S = standardiser(X0), X = S.apply(X0), n = X.length, m = d, ym = mean(ys), yc = ys.map(function (v) { return v - ym; }), w = new Array(m).fill(0), j, i;
    if (kind === 'ridge') {
      var A = [], b = []; for (j = 0; j < m; j++) { A.push(new Array(m).fill(0)); b.push(0); }
      X.forEach(function (r, k) { for (var a = 0; a < m; a++) { b[a] += r[a] * yc[k] / n; for (var c2 = 0; c2 < m; c2++) A[a][c2] += r[a] * r[c2] / n; } });
      for (j = 0; j < m; j++) A[j][j] += lam;
      w = solveSym(A, b);
    } else {
      var res = yc.slice();
      for (var it = 0; it < 20000; it++) {
        var mx = 0;
        for (j = 0; j < m; j++) {
          var rho = 0; for (i = 0; i < n; i++) rho += X[i][j] * (res[i] + X[i][j] * w[j]); rho /= n;
          var nw = Math.sign(rho) * Math.max(Math.abs(rho) - lam, 0);
          if (nw !== w[j]) { for (i = 0; i < n; i++) res[i] -= X[i][j] * (nw - w[j]); mx = Math.max(mx, Math.abs(nw - w[j])); w[j] = nw; }
        }
        if (mx < 1e-10) break;
      }
    }
    var f = function (x) { var r = S.apply(polyDesign([x], d))[0], s = ym; for (var k = 0; k < m; k++) s += w[k] * r[k]; return s; };
    f.w = w; return f;
  }

  /* -----------------------------------------------------------------------
     Figure: gradient descent from scratch
     ----------------------------------------------------------------------- */
  FIG['fig-ml-gd'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(5), XS = [], YS = [];
    for (var i = 0; i < 30; i++) { var x = 10 * r(); XS.push(x); YS.push(2 * x + 5 + 2 * gaussR(r)); }
    var lr = 0.1, scaled = 1, path = [], timer = null;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'gd-lr', label: 'Learning rate η (log scale)', min: -3, max: 0.3, step: 0.01, value: Math.log10(lr), onChange: function (x) { lr = Math.pow(10, x); reset(); } });
    choice(controls, 'Feature x', ['Raw (0 to 10)', 'Standardised'], scaled, function (i) { scaled = i; reset(); });
    var row = group(controls, 'Actions');
    btn('Take 1 step', row).addEventListener('click', function () { step(); draw(); });
    btn('Run 50 steps', row).addEventListener('click', function () { for (var k = 0; k < 50; k++) step(); draw(); });
    btn('Reset', row).addEventListener('click', function () { reset(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var mx = mean(XS), sx = Math.sqrt(XS.reduce(function (s, v) { return s + (v - mx) * (v - mx); }, 0) / XS.length);
    function feat(x) { return scaled ? (x - mx) / sx : x; }
    function loss(w, b) { var s = 0; for (var k = 0; k < XS.length; k++) { var e = w * feat(XS[k]) + b - YS[k]; s += e * e; } return s / XS.length; }
    function grad(w, b) { var gw = 0, gb = 0; for (var k = 0; k < XS.length; k++) { var e = w * feat(XS[k]) + b - YS[k]; gw += 2 * e * feat(XS[k]); gb += 2 * e; } return [gw / XS.length, gb / XS.length]; }
    function opt() { var a = 0, bb = 0, c = 0, d = 0, e = 0, n = XS.length; XS.forEach(function (x, k) { var f = feat(x); a += f * f; bb += f; c += f * YS[k]; d += YS[k]; }); var det = a * n - bb * bb; return [(c * n - bb * d) / det, (a * d - bb * c) / det]; }
    function reset() { path = [[0, 0]]; draw(); }
    function step() { var p = path[path.length - 1], g = grad(p[0], p[1]); var np = [p[0] - lr * g[0], p[1] - lr * g[1]]; if (!isFinite(np[0]) || Math.abs(np[0]) > 1e6) np = p; path.push(np); }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 270, 'Loss surface with the path of gradient descent'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(lr, lr < 0.01 ? 4 : 3));
      var o = opt(), wl = scaled ? -5 : -1, wh = scaled ? 15 : 5, bl = scaled ? -5 : -10, bh = scaled ? 30 : 20;
      var pw = narrow ? W : W * 0.55, L = 44, R = pw - 10, T = 20, B = 230;
      var X = function (w) { return L + (w - wl) / (wh - wl) * (R - L); }, Y = function (b) { return B - (b - bl) / (bh - bl) * (B - T); };
      var nx = 48, ny = 36, cw = (R - L) / nx, ch = (B - T) / ny, lmin = loss(o[0], o[1]);
      for (var ix = 0; ix < nx; ix++) for (var iy = 0; iy < ny; iy++) { var w = wl + (ix + 0.5) * (wh - wl) / nx, b = bl + (iy + 0.5) * (bh - bl) / ny, f = Math.min(1, Math.log10(loss(w, b) / lmin) / 3.5); el('rect', { x: L + ix * cw, y: B - (iy + 1) * ch, width: cw + 0.5, height: ch + 0.5, fill: 'rgb(' + Math.round(30 + 222 * f) + ',' + Math.round(64 + 180 * f) + ',' + Math.round(175 + 60 * f) + ')' }, svg); }
      el('rect', { x: L, y: T, width: R - L, height: B - T, fill: 'none', stroke: c.border }, svg);
      el('path', { d: 'M' + (X(o[0]) - 6) + ' ' + Y(o[1]) + ' L' + (X(o[0]) + 6) + ' ' + Y(o[1]) + ' M' + X(o[0]) + ' ' + (Y(o[1]) - 6) + ' L' + X(o[0]) + ' ' + (Y(o[1]) + 6), stroke: '#fff', 'stroke-width': 2.5 }, svg);
      var d = ''; path.forEach(function (p, k) { var px = Math.max(L - 40, Math.min(R + 40, X(p[0]))), py = Math.max(T - 40, Math.min(B + 40, Y(p[1]))); d += (k ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1); });
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 2 }, svg);
      path.forEach(function (p) { if (X(p[0]) >= L && X(p[0]) <= R && Y(p[1]) >= T && Y(p[1]) <= B) el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.4, fill: AMBER }, svg); });
      txt(svg, (L + R) / 2, B + 16, 'slope w', { size: fs(10), fill: c.muted });
      txt(svg, 12, (T + B) / 2, 'intercept b', { size: fs(10), fill: c.muted }).setAttribute('transform', 'rotate(-90 12 ' + (T + B) / 2 + ')');
      txt(svg, L, 12, narrow ? 'dark = low loss · orange: path' : 'loss surface (dark = low) · white cross: best fit · orange: path', { anchor: 'start', size: fs(10), fill: c.muted });
      var ox = narrow ? 0 : pw, oy = narrow ? 260 : 0, L2 = ox + 46, R2 = ox + (narrow ? W : W - pw) - 10, T2 = oy + 20, B2 = oy + 190;
      var ls = path.map(function (p) { return loss(p[0], p[1]); }), lo = Math.log10(lmin) - 0.1, hi = Math.max(Math.log10(lmin) + 3, Math.log10(Math.max.apply(null, ls)) + 0.1), nmax = Math.max(10, path.length - 1);
      var X2 = function (k) { return L2 + k / nmax * (R2 - L2); }, Y2 = function (v) { return B2 - (Math.min(hi, Math.log10(v)) - lo) / (hi - lo) * (B2 - T2); };
      el('line', { x1: L2, y1: B2, x2: R2, y2: B2, stroke: c.border }, svg); el('line', { x1: L2, y1: T2, x2: L2, y2: B2, stroke: c.border }, svg);
      var dd = ''; ls.forEach(function (v, k) { dd += (k ? 'L' : 'M') + X2(k).toFixed(1) + ' ' + Y2(v).toFixed(1); }); el('path', { d: dd, fill: 'none', stroke: AMBER, 'stroke-width': 2 }, svg);
      el('line', { x1: L2, y1: Y2(lmin), x2: R2, y2: Y2(lmin), stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, L2, T2 - 6, 'loss (log scale) against step', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, R2, B2 + 15, String(nmax) + ' steps', { anchor: 'end', size: fs(10), fill: c.muted });
      var p = path[path.length - 1], cur = loss(p[0], p[1]), diverge = cur > 1e4 || !isFinite(cur) || (path.length > 3 && ls[ls.length - 1] > ls[ls.length - 2] * 1.0001 && ls[ls.length - 2] > ls[ls.length - 3]);
      out.innerHTML = 'Step ' + (path.length - 1) + ': w = ' + fmt(p[0], 3) + ', b = ' + fmt(p[1], 3) + ', loss = <strong>' + efmt(cur) + '</strong> (minimum ' + fmt(lmin, 3) + ').' + (diverge ? ' <strong style="color:' + RED + '">The steps are too large: the loss is growing, and descent is diverging.</strong>' : '') +
        NOTE + 'Each step moves the parameters a distance η × gradient downhill. Too small a learning rate crawls; too large overshoots and diverges. With the raw feature, the valley is long and narrow because x ranges from 0 to 10, so a learning rate that is safe for the steep direction is painfully slow along the valley. Standardising the feature makes the valley round and descent fast.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: ridge and lasso
     ----------------------------------------------------------------------- */
  FIG['fig-ml-reg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 0, ll = -3, D = 9;
    var controls = div('fig-controls', container);
    choice(controls, 'Penalty', ['Ridge (L2)', 'Lasso (L1)'], kind, function (i) { kind = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'rg-l', label: 'Regularisation strength λ (log scale)', min: -6, max: 1, step: 0.05, value: ll, onChange: function (x) { ll = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var pathCache = {};
    function coefPath(k) {
      if (pathCache[k]) return pathCache[k];
      var res = [];
      for (var v = -6; v <= 1.001; v += 0.25) { var f = fitPenalised(XTR, YTR, D, Math.pow(10, v), k ? 'lasso' : 'ridge'); res.push([v, f.w.slice(), mse(f, XTE, YTE)]); }
      return (pathCache[k] = res);
    }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 450 : 250, 'Fitted curve and coefficient paths'), W = A.W, svg = A.svg, fs = A.fs;
      var lam = Math.pow(10, ll); valText(s1, lam < 0.001 ? lam.toExponential(1) : fmt(lam, 3));
      var f = fitPenalised(XTR, YTR, D, lam, kind ? 'lasso' : 'ridge'), pw = narrow ? W : W * 0.5;
      var P = plotFrame(svg, c, fs, 40, pw - 10, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      curve(svg, P, f, RED, 2.4);
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, 40, 12, 'degree-9 polynomial, penalised', { anchor: 'start', size: fs(10), fill: c.muted });
      var cp = coefPath(kind), ox = narrow ? 0 : pw, oy = narrow ? 240 : 0, L2 = ox + 46, R2 = ox + (narrow ? W : W - pw) - 12, T2 = oy + 22, B2 = oy + 190;
      var amax = 0; cp.forEach(function (q) { q[1].forEach(function (v) { amax = Math.max(amax, Math.abs(v)); }); }); amax = Math.min(amax, 6);
      var X2 = function (v) { return L2 + (v + 6) / 7 * (R2 - L2); }, Y2 = function (v) { return (T2 + B2) / 2 - Math.max(-amax, Math.min(amax, v)) / amax * (B2 - T2) / 2; };
      el('line', { x1: L2, y1: Y2(0), x2: R2, y2: Y2(0), stroke: c.border }, svg);
      for (var j = 0; j < D; j++) { var d = ''; cp.forEach(function (q, k) { d += (k ? 'L' : 'M') + X2(q[0]).toFixed(1) + ' ' + Y2(q[1][j]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#dc2626', '#475569'][j], 'stroke-width': 1.6 }, svg); }
      el('line', { x1: X2(ll), y1: T2, x2: X2(ll), y2: B2, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      [-6, -4, -2, 0].forEach(function (v) { txt(svg, X2(v), B2 + 15, '10' + ['⁻⁶', '', '⁻⁴', '', '⁻²', '', '⁰'][v + 6], { size: fs(10), fill: c.muted }); });
      txt(svg, (L2 + R2) / 2, B2 + 30, 'λ', { size: fs(11), fill: c.muted });
      txt(svg, L2, T2 - 8, 'the 9 coefficients as λ grows', { anchor: 'start', size: fs(10), fill: c.muted });
      var nz = f.w.filter(function (v) { return Math.abs(v) > 1e-8; }).length, te = mse(f, XTE, YTE), tr = mse(f, XTR, YTR);
      var best = cp.reduce(function (a, q) { return q[2] < a[2] ? q : a; });
      out.innerHTML = (kind ? 'Lasso' : 'Ridge') + ' with λ = ' + (lam < 0.001 ? lam.toExponential(1) : fmt(lam, 3)) + ': training error ' + efmt(tr) + ', test error <strong>' + efmt(te) + '</strong>, ' + nz + ' of 9 coefficients non-zero.' +
        NOTE + 'With almost no penalty, the degree-9 polynomial overfits as in Part 1 (test error ' + efmt(cp[0][2]) + '). As λ grows, the coefficients shrink and the curve calms down; too much penalty flattens it into underfitting. On this grid the lowest test error, ' + efmt(best[2]) + ', is near λ = 10<sup>' + fmt(best[0], 2) + '</sup>. ' + (kind ? 'The lasso sets coefficients exactly to zero one after another: it selects features.' : 'Ridge shrinks all coefficients smoothly towards zero but never exactly to zero.') + ' In practice λ is chosen by cross-validation.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: why the lasso gives zeros
     ----------------------------------------------------------------------- */
  FIG['fig-ml-l1l2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var budget = 1.2, kind = 1, OLS = [2.2, 0.5];
    var controls = div('fig-controls', container);
    choice(controls, 'Constraint', ['L2 (circle): ridge', 'L1 (diamond): lasso'], kind, function (i) { kind = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'l12-t', label: 'Budget t (size of the constraint)', min: 0.2, max: 3, step: 0.02, value: budget, onChange: function (x) { budget = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Lq(w1, w2) { var a = w1 - OLS[0], b = w2 - OLS[1]; return 1.0 * a * a - 0.6 * a * b + 1.2 * b * b; }
    function solve() {
      if ((kind ? Math.abs(OLS[0]) + Math.abs(OLS[1]) : Math.hypot(OLS[0], OLS[1])) <= budget) return OLS.slice();
      var best = null, bl = 1e9;
      for (var k = 0; k < 4000; k++) { var th = 2 * Math.PI * k / 4000, w1, w2; if (kind) { var cth = Math.cos(th), sth = Math.sin(th), s = Math.abs(cth) + Math.abs(sth); w1 = budget * cth / s; w2 = budget * sth / s; } else { w1 = budget * Math.cos(th); w2 = budget * Math.sin(th); } var l = Lq(w1, w2); if (l < bl) { bl = l; best = [w1, w2]; } }
      return best;
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Loss contours and the constraint region'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(budget, 2));
      var S = Math.min(W - 40, 300), cx = W / 2 - S * 0.1, cy = 150, sc = S / 7, X = function (v) { return cx + v * sc; }, Y = function (v) { return cy - v * sc; };
      el('line', { x1: X(-3), y1: Y(0), x2: X(3.8), y2: Y(0), stroke: c.border }, svg); el('line', { x1: X(0), y1: Y(-2.4), x2: X(0), y2: Y(2.4), stroke: c.border }, svg);
      txt(svg, X(3.8), Y(0) - 6, 'w₁', { anchor: 'end', size: fs(11), fill: c.muted }); txt(svg, X(0) + 6, Y(2.4) + 10, 'w₂', { anchor: 'start', size: fs(11), fill: c.muted });
      [0.15, 0.6, 1.4, 2.6, 4.2].forEach(function (lev) { var d = ''; for (var k = 0; k <= 120; k++) { var th = 2 * Math.PI * k / 120, ux = Math.cos(th), uy = Math.sin(th), q = 1.0 * ux * ux - 0.6 * ux * uy + 1.2 * uy * uy, rr = Math.sqrt(lev / q); d += (k ? 'L' : 'M') + X(OLS[0] + rr * ux).toFixed(1) + ' ' + Y(OLS[1] + rr * uy).toFixed(1); } el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 1.3, opacity: 0.8 }, svg); });
      if (kind) el('path', { d: 'M' + X(budget) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(budget) + ' L' + X(-budget) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(-budget) + ' Z', fill: BLUE, opacity: 0.2, stroke: BLUE, 'stroke-width': 2 }, svg);
      else el('circle', { cx: X(0), cy: Y(0), r: budget * sc, fill: BLUE, opacity: 0.2, stroke: BLUE, 'stroke-width': 2 }, svg);
      el('circle', { cx: X(OLS[0]), cy: Y(OLS[1]), r: 4, fill: AMBER }, svg); txt(svg, X(OLS[0]) + 6, Y(OLS[1]) - 6, 'least squares', { anchor: 'start', size: fs(10), fill: AMBER });
      var s = solve(); el('circle', { cx: X(s[0]), cy: Y(s[1]), r: 6, fill: RED, stroke: '#fff', 'stroke-width': 1.5 }, svg);
      var zero = Math.abs(s[1]) < 0.02;
      out.innerHTML = 'Penalised solution: w₁ = <strong>' + fmt(s[0], 2) + '</strong>, w₂ = <strong>' + fmt(Math.abs(s[1]) < 0.005 ? 0 : s[1], 2) + '</strong>.' + (kind && zero ? ' <strong>w₂ is exactly zero</strong>: the lasso has dropped a feature.' : '') +
        NOTE + 'Penalising the size of the coefficients is the same as requiring them to stay inside a region (blue) while making the loss (orange contours, centred on the unpenalised least-squares answer) as small as possible. The solution is where the smallest contour touches the region. A circle has no corners, so ridge solutions are rarely exactly zero; a diamond has corners on the axes, and the contours usually touch it there, so lasso solutions often have coefficients that are exactly zero.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: logistic regression playground
     ----------------------------------------------------------------------- */
  FIG['fig-ml-logreg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DS = ['blobs', 'moons', 'circles'], di = 1, deg = 1, ll = -3, data = makeData('moons');
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Two clouds', 'Two moons', 'Circles'], di, function (i) { di = i; data = makeData(DS[i]); draw(); });
    choice(controls, 'Features', ['x₁, x₂ (straight boundary)', 'Polynomial, degree 3'], 0, function (i) { deg = i ? 3 : 1; draw(); });
    var s1 = FIG.slider(controls, { id: 'lg-l', label: 'Regularisation λ (log scale)', min: -4, max: 1, step: 0.1, value: ll, onChange: function (x) { ll = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Training points and the predicted probability of class 1'), W = A.W, svg = A.svg, fs = A.fs;
      var lam = Math.pow(10, ll); valText(s1, lam < 0.01 ? lam.toExponential(0) : fmt(lam, 2));
      var f = fitLogistic(data.train, deg, lam), tr = evalClf(f, data.train), te = evalClf(f, data.test);
      var S = Math.min(W - 20, 380), L = (W - S) / 2, T = 10, xl = -1.6, xh = 2.6, yl = -1.4, yh = 1.8, X = function (v) { return L + (v - xl) / (xh - xl) * S; }, Y = function (v) { return T + (yh - v) / (yh - yl) * 280; };
      var nx = 44, ny = 32, cw = S / nx, ch = 280 / ny;
      for (var ix = 0; ix < nx; ix++) for (var iy = 0; iy < ny; iy++) { var px = xl + (ix + 0.5) * (xh - xl) / nx, py = yh - (iy + 0.5) * (yh - yl) / ny, p = f(px, py); el('rect', { x: L + ix * cw, y: T + iy * ch, width: cw + 0.5, height: ch + 0.5, fill: p > 0.5 ? AMBER : BLUE, opacity: 0.08 + 0.32 * Math.abs(p - 0.5) * 2 }, svg); }
      var G = [], gx = 60, gy = 44;
      for (ix = 0; ix <= gx; ix++) { G.push([]); for (iy = 0; iy <= gy; iy++) G[ix].push(f(xl + ix * (xh - xl) / gx, yh - iy * (yh - yl) / gy) - 0.5); }
      var px2 = function (ix) { return L + ix * S / gx; }, py2 = function (iy) { return T + iy * 280 / gy; }, segs = '';
      for (ix = 0; ix < gx; ix++) for (iy = 0; iy < gy; iy++) {
        var v = [G[ix][iy], G[ix + 1][iy], G[ix + 1][iy + 1], G[ix][iy + 1]], P2 = [[ix, iy], [ix + 1, iy], [ix + 1, iy + 1], [ix, iy + 1]], cr = [];
        for (var e = 0; e < 4; e++) { var v1 = v[e], v2 = v[(e + 1) % 4]; if ((v1 > 0) !== (v2 > 0)) { var t = v1 / (v1 - v2), q1 = P2[e], q2 = P2[(e + 1) % 4]; cr.push([px2(q1[0] + t * (q2[0] - q1[0])), py2(q1[1] + t * (q2[1] - q1[1]))]); } }
        for (e = 0; e + 1 < cr.length; e += 2) segs += 'M' + cr[e][0].toFixed(1) + ' ' + cr[e][1].toFixed(1) + 'L' + cr[e + 1][0].toFixed(1) + ' ' + cr[e + 1][1].toFixed(1);
      }
      if (segs) el('path', { d: segs, fill: 'none', stroke: c.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      data.train.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 3.6, fill: p[2] ? AMBER : BLUE, stroke: '#fff', 'stroke-width': 0.8 }, svg); });
      data.test.forEach(function (p) { el('rect', { x: X(p[0]) - 3, y: Y(p[1]) - 3, width: 6, height: 6, fill: 'none', stroke: p[2] ? AMBER : BLUE, 'stroke-width': 1.5 }, svg); });
      el('rect', { x: L, y: T, width: S, height: 280, fill: 'none', stroke: c.border }, svg);
      out.innerHTML = 'Training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong> (log loss ' + fmt(tr[1], 3) + ' and ' + fmt(te[1], 3) + ').' +
        NOTE + 'Dots: 140 training points; squares: 60 test points. Shading: the predicted probability of the orange class; the black line is where it equals 0.5. ' + (deg === 1 ? 'With the raw features, logistic regression can only draw a straight boundary, which suits the two clouds but not the moons or circles.' : 'With polynomial features the model is still linear in its parameters, yet its boundary can curve. Strong regularisation pulls it back towards a simple shape.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A polynomial regression ŷ = w₀ + w₁x + w₂x² is…', options: ['A nonlinear model in its parameters', 'A linear model: linear in its parameters, though not in x', 'A neural network', 'A decision tree'], answer: 1, explanation: 'Linear models are linear in the weights; the features can be any functions of the inputs.' },
      { question: 'In gradient descent, the learning rate controls…', options: ['How many features are used', 'The size of each step downhill', 'The number of training examples', 'The regularisation strength'], answer: 1, explanation: 'Too small is slow; too large overshoots and can diverge.' },
      { question: 'Why does standardising features often speed up gradient descent?', options: ['It removes outliers', 'It makes the loss surface rounder, so one learning rate suits all directions', 'It reduces the number of parameters', 'It adds regularisation'], answer: 1, explanation: 'Features on very different scales create long, narrow valleys.' },
      { question: 'What is stochastic gradient descent?', options: ['Gradient descent with random learning rates', 'Updating the parameters using the gradient from one example or a small batch at a time', 'A method without gradients', 'Gradient descent on random data'], answer: 1, explanation: 'Each step is cheap and noisy, and many steps make good progress.' },
      { question: 'Which penalty can set coefficients exactly to zero?', options: ['Ridge (L2)', 'Lasso (L1)', 'Neither', 'Both equally'], answer: 1, explanation: 'The corners of the L1 diamond lie on the axes.' },
      { question: 'As the ridge penalty λ grows very large, the model…', options: ['Overfits more', 'Shrinks towards a constant and underfits', 'Becomes a lasso', 'Uses more features'], answer: 1, explanation: 'All coefficients are pushed towards zero.' },
      { question: 'Logistic regression outputs…', options: ['A class label only', 'A probability between 0 and 1, via the sigmoid of a linear score', 'A count', 'A cluster'], answer: 1, explanation: 'Thresholding the probability gives a class.' },
      { question: 'Which loss is minimised in logistic regression?', options: ['Mean squared error', 'Cross-entropy (log loss)', 'Hinge loss', 'Absolute error'], answer: 1, explanation: 'Log loss is the negative log-likelihood of the Bernoulli model.' },
      { question: 'Logistic regression on raw x₁, x₂ fails on two interlocking moons because…', options: ['It needs more data', 'Its decision boundary is a straight line', 'The learning rate is wrong', 'The classes are unbalanced'], answer: 1, explanation: 'Adding nonlinear features, or using a nonlinear model, fixes this.' },
      { question: 'Softmax regression is used for…', options: ['Regression with outliers', 'Classification with more than two classes', 'Clustering', 'Feature selection'], answer: 1, explanation: 'It turns one linear score per class into probabilities that sum to one.' }
    ]);
  };
})();
