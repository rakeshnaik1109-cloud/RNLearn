/* ==========================================================================
   RNLearn — Neurons and Activation Functions (Inside the Machine, Part 6)
   Figures:
     fig-ml-map         The map of the series
     fig-ml6-timeline   The story at a glance
     fig-ml-neuron      Wire a neuron by hand
     fig-ml-acts        Activation functions and their derivatives
     fig-ml-approx      Building a curve from ReLU hinges
     fig-ml-backprop    Backpropagation step by step
     fig-ml-vanish      Gradients in a deep network
     fig-ml-playground  A neural network playground
     fig-quiz-ml6       Test yourself
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
    { name: 'Artificial neurons', color: '#b45309' },
    { name: 'Learning in layers', color: '#1d4ed8' },
    { name: 'Modern activations', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1943', icon: '🧠', era: 0, sec: 3, title: 'The logical neuron', text: 'Warren McCulloch and Walter Pitts model a neuron as a unit that fires when its weighted inputs exceed a threshold.' },
    { year: '1958', icon: '⚡', era: 0, sec: 3, title: 'The perceptron', text: 'Frank Rosenblatt builds a neuron that learns its weights from examples.' },
    { year: '1969', icon: '✖️', era: 0, sec: 4, title: 'Perceptrons', text: 'Marvin Minsky and Seymour Papert analyse what single-layer perceptrons cannot compute, such as XOR.' },
    { year: '1970', icon: '🔁', era: 1, sec: 8, title: 'Reverse-mode differentiation', text: 'Seppo Linnainmaa describes the efficient method for computing derivatives that underlies backpropagation.' },
    { year: '1986', icon: '📉', era: 1, sec: 8, title: 'Backpropagation', text: 'David Rumelhart, Geoffrey Hinton and Ronald Williams show that backpropagation trains hidden layers to learn useful representations.' },
    { year: '1989', icon: '∞', era: 1, sec: 7, title: 'Universal approximation', text: 'George Cybenko proves that one hidden layer of sigmoid units can approximate any continuous function.' },
    { year: '1991', icon: '🕳️', era: 1, sec: 9, title: 'Vanishing gradients', text: 'Sepp Hochreiter analyses why gradients shrink as they flow back through many layers or time steps.' },
    { year: '2010', icon: '📐', era: 2, sec: 5, title: 'Rectified linear units', text: 'Vinod Nair and Geoffrey Hinton use ReLUs in neural networks; a year later Xavier Glorot and colleagues show they ease the training of deep networks.' },
    { year: '2013', icon: '💧', era: 2, sec: 5, title: 'Leaky ReLU', text: 'Andrew Maas, Awni Hannun and Andrew Ng give ReLU a small negative slope.' },
    { year: '2016', icon: '〰️', era: 2, sec: 5, title: 'GELU', text: 'Dan Hendrycks and Kevin Gimpel propose the Gaussian error linear unit, later standard in transformers.' },
    { year: '2017', icon: '🔍', era: 2, sec: 5, title: 'Swish', text: 'Prajit Ramachandran, Barret Zoph and Quoc Le find the Swish activation by automated search.' },
    { year: '2020', icon: '🚪', era: 2, sec: 12, title: 'Gated activations', text: 'Noam Shazeer shows that gated units such as SwiGLU improve transformers, later adopted in many large language models.' }
  ];

  FIG['fig-ml6-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1943 to 2020');
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

  var ML_PART = 6;
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
     Activation functions and a small neural network
     ----------------------------------------------------------------------- */
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  function sgm(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  var ACTS = {
    step: { name: 'Step', f: function (z) { return z >= 0 ? 1 : 0; }, d: function () { return 0; } },
    sigmoid: { name: 'Sigmoid', f: sgm, d: function (z) { var s = sgm(z); return s * (1 - s); } },
    tanh: { name: 'Tanh', f: Math.tanh, d: function (z) { var t = Math.tanh(z); return 1 - t * t; } },
    relu: { name: 'ReLU', f: function (z) { return z > 0 ? z : 0; }, d: function (z) { return z > 0 ? 1 : 0; } },
    leaky: { name: 'Leaky ReLU', f: function (z) { return z > 0 ? z : 0.05 * z; }, d: function (z) { return z > 0 ? 1 : 0.05; } },
    elu: { name: 'ELU', f: function (z) { return z > 0 ? z : Math.exp(z) - 1; }, d: function (z) { return z > 0 ? 1 : Math.exp(z); } },
    gelu: { name: 'GELU', f: function (z) { return 0.5 * z * (1 + erf(z / Math.SQRT2)); }, d: function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)) + z * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); } },
    swish: { name: 'Swish / SiLU', f: function (z) { return z * sgm(z); }, d: function (z) { var s = sgm(z); return s + z * s * (1 - s); } },
    softplus: { name: 'Softplus', f: function (z) { return z > 20 ? z : Math.log(1 + Math.exp(z)); }, d: sgm }
  };
  function makeXor(seed) { var r = rngSeed(seed || 77), P = []; for (var i = 0; i < 200; i++) { var x = r() * 3.6 - 1.4, y = r() * 2.8 - 1.2; P.push([x, y, (x - 0.5) * (y - 0.2) > 0 ? 1 : 0]); } return { train: P.slice(0, 140), test: P.slice(140) }; }
  function MLP(H, act, seed) {
    var r = rngSeed(seed || 3), A = ACTS[act], s1 = act === 'relu' ? Math.sqrt(2 / 2) : Math.sqrt(1 / 2), s2 = act === 'relu' ? Math.sqrt(2 / H) : Math.sqrt(1 / H);
    var W1 = [], b1 = [], w2 = [], b2 = 0, i;
    for (i = 0; i < H; i++) { W1.push([s1 * gaussR(r), s1 * gaussR(r)]); b1.push(0.1 * gaussR(r)); w2.push(s2 * gaussR(r)); }
    var P = { W1: W1, b1: b1, w2: w2, b2: b2 }, m = zeroLike(P), v = zeroLike(P), t = 0;
    function zeroLike(Q) { return { W1: Q.W1.map(function () { return [0, 0]; }), b1: Q.b1.map(function () { return 0; }), w2: Q.w2.map(function () { return 0; }), b2: 0 }; }
    function fwd(x, y) { var h = [], z = []; for (var k = 0; k < H; k++) { z[k] = P.W1[k][0] * x + P.W1[k][1] * y + P.b1[k]; h[k] = A.f(z[k]); } var o = P.b2; for (k = 0; k < H; k++) o += P.w2[k] * h[k]; return { z: z, h: h, p: sgm(o) }; }
    function step(data, lr, l2) {
      var g = zeroLike(P), n = data.length, loss = 0;
      data.forEach(function (q) { var f = fwd(q[0], q[1]), e = f.p - q[2]; loss -= q[2] ? Math.log(Math.max(f.p, 1e-12)) : Math.log(Math.max(1 - f.p, 1e-12)); g.b2 += e / n; for (var k = 0; k < H; k++) { g.w2[k] += e * f.h[k] / n; var dz = e * P.w2[k] * A.d(f.z[k]) / n; g.W1[k][0] += dz * q[0]; g.W1[k][1] += dz * q[1]; g.b1[k] += dz; } });
      for (var k = 0; k < H; k++) { g.w2[k] += l2 * P.w2[k]; g.W1[k][0] += l2 * P.W1[k][0]; g.W1[k][1] += l2 * P.W1[k][1]; }
      t++; var b1c = 1 - Math.pow(0.9, t), b2c = 1 - Math.pow(0.999, t);
      function upd(obj, key, gv, mo, vo) { mo[key] = 0.9 * mo[key] + 0.1 * gv; vo[key] = 0.999 * vo[key] + 0.001 * gv * gv; obj[key] -= lr * (mo[key] / b1c) / (Math.sqrt(vo[key] / b2c) + 1e-8); }
      upd(P, 'b2', g.b2, m, v);
      for (k = 0; k < H; k++) { upd(P.w2, k, g.w2[k], m.w2, v.w2); upd(P.b1, k, g.b1[k], m.b1, v.b1); upd(P.W1[k], 0, g.W1[k][0], m.W1[k], v.W1[k]); upd(P.W1[k], 1, g.W1[k][1], m.W1[k], v.W1[k]); }
      return loss / n;
    }
    return { fwd: fwd, step: step, steps: function () { return t; }, P: P };
  }

  /* -----------------------------------------------------------------------
     Figure: a single neuron and the XOR problem
     ----------------------------------------------------------------------- */
  FIG['fig-ml-neuron'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w1 = 1, w2 = 1, b = -1.5, ai = 0, task = 0, TASKS = [['AND', [0, 0, 0, 1]], ['OR', [0, 1, 1, 1]], ['NAND', [1, 1, 1, 0]], ['XOR', [0, 1, 1, 0]]], PTS = [[0, 0], [0, 1], [1, 0], [1, 1]];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ne-w1', label: 'Weight w₁', min: -3, max: 3, step: 0.1, value: w1, onChange: function (x) { w1 = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ne-w2', label: 'Weight w₂', min: -3, max: 3, step: 0.1, value: w2, onChange: function (x) { w2 = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'ne-b', label: 'Bias b', min: -3, max: 3, step: 0.1, value: b, onChange: function (x) { b = x; draw(); } });
    choice(controls, 'Target', TASKS.map(function (q) { return q[0]; }), task, function (i) { task = i; draw(); });
    choice(controls, 'Activation', ['Step', 'Sigmoid'], ai, function (i) { ai = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 286, 'A single neuron on the four corners of the unit square'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(w1, 1)); valText(s2, fmt(w2, 1)); valText(s3, fmt(b, 1));
      var f = ai ? sgm : ACTS.step.f, S = Math.min(W - 60, 250), L = (W - S) / 2, T = 10, lo = -0.5, hi = 1.5, X = function (v) { return L + (v - lo) / (hi - lo) * S; }, Y = function (v) { return T + (hi - v) / (hi - lo) * S; }, n = 40, cw = S / n;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var x = lo + (i + 0.5) * (hi - lo) / n, y = hi - (j + 0.5) * (hi - lo) / n, o = f(w1 * x + w2 * y + b); el('rect', { x: L + i * cw, y: T + j * cw, width: cw + 0.5, height: cw + 0.5, fill: o > 0.5 ? AMBER : BLUE, opacity: 0.1 + 0.35 * Math.abs(o - 0.5) * 2 }, svg); }
      if (Math.abs(w2) > 1e-6 || Math.abs(w1) > 1e-6) { var cp = el('clipPath', { id: 'ne-clip' }, svg); el('rect', { x: L, y: T, width: S, height: S }, cp); var pts = []; if (Math.abs(w2) > 1e-6) { pts = [[lo, -(w1 * lo + b) / w2], [hi, -(w1 * hi + b) / w2]]; } else { pts = [[-b / w1, lo], [-b / w1, hi]]; } el('line', { x1: X(pts[0][0]), y1: Y(pts[0][1]), x2: X(pts[1][0]), y2: Y(pts[1][1]), stroke: c.ink, 'stroke-width': 2, 'clip-path': 'url(#ne-clip)' }, svg); }
      el('rect', { x: L, y: T, width: S, height: S, fill: 'none', stroke: c.border }, svg);
      var ok = 0, tg = TASKS[task][1];
      PTS.forEach(function (p, k) { var o = f(w1 * p[0] + w2 * p[1] + b), pred = o > 0.5 ? 1 : 0; if (pred === tg[k]) ok++; el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 11, fill: tg[k] ? AMBER : BLUE, stroke: pred === tg[k] ? '#fff' : RED, 'stroke-width': pred === tg[k] ? 2 : 4 }, svg); txt(svg, X(p[0]), Y(p[1]) + 4, String(tg[k]), { size: fs(11), weight: 700, fill: '#fff' }); });
      txt(svg, X(0), T + S + 16, 'x₁ = 0', { size: fs(10), fill: c.muted }); txt(svg, X(1), T + S + 16, 'x₁ = 1', { size: fs(10), fill: c.muted });
      out.innerHTML = 'Output = ' + (ai ? 'σ' : 'step') + '(' + fmt(w1, 1) + ' x₁ + ' + fmt(w2, 1) + ' x₂ ' + (b < 0 ? '− ' + fmt(-b, 1) : '+ ' + fmt(b, 1)) + '). <strong>' + ok + ' of 4</strong> corners correct for ' + TASKS[task][0] + (ok === 4 ? ' ✓' : '') + '.' +
        NOTE + (task === 3 ? 'XOR outputs 1 when exactly one input is 1. No single straight line can put (0,1) and (1,0) on one side and (0,0) and (1,1) on the other, so no setting of the weights works: a single neuron cannot compute XOR. Two layers can (Section 4).' : 'A neuron computes a weighted sum of its inputs plus a bias, then applies an activation. The black line, where the weighted sum is zero, is its decision boundary: a single neuron is a linear classifier, like logistic regression in Part 2. Try to find weights for AND, OR and NAND, then try XOR.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: activation functions and their derivatives
     ----------------------------------------------------------------------- */
  FIG['fig-ml-acts'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var KEYS = ['sigmoid', 'tanh', 'relu', 'leaky', 'elu', 'gelu', 'swish', 'softplus'], ki = 2, z0 = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Function', KEYS.map(function (k) { return ACTS[k].name; }), ki, function (i) { ki = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'ac-z', label: 'Input z', min: -5, max: 5, step: 0.1, value: z0, onChange: function (x) { z0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var NOTES = {
      sigmoid: 'Squashes any input into (0, 1). Its derivative is at most 0.25 and almost zero for large |z|, so gradients shrink layer after layer. Still used for probabilities at the output and for gates in LSTMs.',
      tanh: 'Like a sigmoid stretched to (−1, 1) and centred on zero, which helps learning; its derivative reaches 1 at z = 0 but still vanishes for large |z|.',
      relu: 'max(0, z): cheap, and its gradient is exactly 1 for positive inputs, so it does not shrink. The default for most networks since about 2010–2012. Its weakness: units stuck at negative inputs get zero gradient and can “die”.',
      leaky: 'Like ReLU, but with a small slope (here 0.05) for negative inputs, so no unit is ever completely switched off.',
      elu: 'Smooth for negative inputs, tending to −1, which pushes average activations towards zero.',
      gelu: 'z × Φ(z), where Φ is the normal cumulative distribution: a smooth ReLU that lets small negative values through. The standard choice in transformers such as BERT and GPT.',
      swish: 'z × σ(z), found by an automated search; very close to GELU. Its gated form, SwiGLU, is used in many large language models.',
      softplus: 'log(1 + eᶻ): a smooth version of ReLU whose derivative is the sigmoid. Used where a positive output is needed, such as a predicted variance.'
    };
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Activation function and its derivative'), W = A.W, svg = A.svg, fs = A.fs, a = ACTS[KEYS[ki]];
      valText(s1, fmt(z0, 1));
      var L = 40, R = W - 14, T = 20, B = 210, lo = -5, hi = 5, yl = -1.5, yh = 5, X = function (z) { return L + (z - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - (Math.max(yl, Math.min(yh, v)) - yl) / (yh - yl) * (B - T); };
      [-1, 0, 1, 2, 3, 4, 5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: v === 0 ? c.muted : c.border, 'stroke-width': v === 0 ? 1 : 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      el('line', { x1: X(0), y1: T, x2: X(0), y2: B, stroke: c.muted }, svg);
      [-4, -2, 0, 2, 4].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      var d1 = '', d2 = ''; for (var k = 0; k <= 300; k++) { var z = lo + (hi - lo) * k / 300; d1 += (k ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(a.f(z)).toFixed(1); d2 += (k ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(a.d(z)).toFixed(1); }
      el('path', { d: d1, fill: 'none', stroke: BLUE, 'stroke-width': 2.6 }, svg); el('path', { d: d2, fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
      el('line', { x1: X(z0), y1: T, x2: X(z0), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      el('circle', { cx: X(z0), cy: Y(a.f(z0)), r: 5, fill: BLUE }, svg); el('circle', { cx: X(z0), cy: Y(a.d(z0)), r: 5, fill: RED }, svg);
      txt(svg, L, 12, 'blue: f(z) · red dashed: its derivative f′(z)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = '<strong>' + a.name + '</strong> at z = ' + fmt(z0, 1) + ': f(z) = <strong>' + fmt(a.f(z0), 3) + '</strong>, f′(z) = <strong>' + fmt(a.d(z0), 3) + '</strong>.' + NOTE + NOTES[KEYS[ki]] + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: universal approximation with ReLU pieces
     ----------------------------------------------------------------------- */
  FIG['fig-ml-approx'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 4, ti = 0, TG = [['Sine wave', truth], ['Step', function (x) { return x < 0.5 ? -0.5 : 0.8; }], ['Bump', function (x) { return Math.exp(-80 * (x - 0.6) * (x - 0.6)) * 1.5 - 0.5; }]];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ap-n', label: 'Hidden ReLU units', min: 1, max: 40, step: 1, value: N, onChange: function (x) { N = x; draw(); } });
    choice(controls, 'Target function', TG.map(function (q) { return q[0]; }), ti, function (i) { ti = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'A one-hidden-layer ReLU network approximating a function'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(N));
      var tf = TG[ti][1], knots = []; for (var k = 0; k < N; k++) knots.push(k / N);
      var xs = [], ys = []; for (var q = 0; q <= 400; q++) { xs.push(q / 400); ys.push(tf(q / 400)); }
      var Am = xs.map(function (x) { return [1].concat(knots.map(function (t) { return Math.max(0, x - t); })); }), cf = lstsq(Am, ys);
      var f = function (x) { var s = cf[0]; knots.forEach(function (t, j) { s += cf[j + 1] * Math.max(0, x - t); }); return s; };
      var P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -1.5, 1.5, [-1, 0, 1], 'x');
      if (N <= 12) knots.forEach(function (t, j) { var g = function (x) { return cf[j + 1] * Math.max(0, x - t); }; curve(svg, P, g, PURPLE, 1, 0.35); });
      curve(svg, P, tf, c.muted, 2, 0.8); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      curve(svg, P, f, RED, 2.4);
      var mx = 0; xs.forEach(function (x, i) { mx = Math.max(mx, Math.abs(f(x) - ys[i])); });
      txt(svg, 40, 12, W < 560 ? 'red: network · dashed: target' : 'red: network output · dashed: target · purple: individual ReLU units', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = N + ' hidden unit' + (N > 1 ? 's' : '') + ': largest error <strong>' + fmt(mx, 3) + '</strong>.' + NOTE + 'Each hidden ReLU unit contributes a “hinge”, a line that bends at one point; the output adds them up with learned weights, giving a piecewise-linear curve. With enough units the curve can follow any continuous function as closely as you like: the universal approximation theorem. Here the bend points are fixed and only the output weights are fitted; a trained network also learns where to bend.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: backpropagation step by step
     ----------------------------------------------------------------------- */
  FIG['fig-ml-backprop'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var x = 1, w1 = 0.5, b1 = 0, w2 = 0.8, b2 = 0, y = 1.5, lr = 0.1, hist = [];
    var controls = div('fig-controls', container);
    var sx = FIG.slider(controls, { id: 'bp-x', label: 'Input x', min: -2, max: 2, step: 0.1, value: x, onChange: function (v) { x = v; draw(); } });
    var sy = FIG.slider(controls, { id: 'bp-y', label: 'Target y', min: -2, max: 2, step: 0.1, value: y, onChange: function (v) { y = v; draw(); } });
    var row = group(controls, 'Actions');
    btn('Take a gradient step', row).addEventListener('click', function () { var g = grads(); w1 -= lr * g.w1; b1 -= lr * g.b1; w2 -= lr * g.w2; b2 -= lr * g.b2; hist.push(g.L); draw(); });
    btn('Reset weights', row).addEventListener('click', function () { w1 = 0.5; b1 = 0; w2 = 0.8; b2 = 0; hist = []; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function grads() {
      var z1 = w1 * x + b1, h = Math.tanh(z1), yh = w2 * h + b2, L = 0.5 * (yh - y) * (yh - y), dyh = yh - y, dw2 = dyh * h, db2 = dyh, dh = dyh * w2, dz1 = dh * (1 - h * h), dw1 = dz1 * x, db1 = dz1;
      return { z1: z1, h: h, yh: yh, L: L, dyh: dyh, dw2: dw2, db2: db2, dh: dh, dz1: dz1, w1: dw1, b1: db1, w2: dw2, b2: db2 };
    }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 250 : 125, 'Computational graph with forward values and backward gradients'), W = A.W, svg = A.svg, fs = A.fs;
      valText(sx, fmt(x, 1)); valText(sy, fmt(y, 1));
      var g = grads(), nodes = [['x', fmt(x, 2), '—'], ['z = w₁x + b₁', fmt(g.z1, 3), fmt(g.dz1, 3)], ['h = tanh(z)', fmt(g.h, 3), fmt(g.dh, 3)], ['ŷ = w₂h + b₂', fmt(g.yh, 3), fmt(g.dyh, 3)], ['L = ½(ŷ − y)²', fmt(g.L, 4), '1']];
      var per = narrow ? 3 : 5, bw = Math.min(150, (W - 20) / per - 14), bh = 70;
      nodes.forEach(function (nd, k) {
        var r = Math.floor(k / per), col = k % per, cx = 10 + (W - 20) * (col + 0.5) / per, cy = 50 + r * 125;
        if (k > 0 && col > 0) { var px = 10 + (W - 20) * (col - 0.5) / per; el('line', { x1: px + bw / 2, y1: cy - 8, x2: cx - bw / 2 - 4, y2: cy - 8, stroke: BLUE, 'stroke-width': 2 }, svg); el('path', { d: 'M' + (cx - bw / 2 - 4) + ' ' + (cy - 8) + ' l-6 -4 l0 8 z', fill: BLUE }, svg); el('line', { x1: cx - bw / 2, y1: cy + 18, x2: px + bw / 2 + 4, y2: cy + 18, stroke: RED, 'stroke-width': 2 }, svg); el('path', { d: 'M' + (px + bw / 2 + 4) + ' ' + (cy + 18) + ' l6 -4 l0 8 z', fill: RED }, svg); }
        el('rect', { x: cx - bw / 2, y: cy - 25, width: bw, height: bh, rx: 6, fill: c.surface, stroke: c.border }, svg);
        txt(svg, cx, cy - 8, nd[0], { size: fs(10), fill: c.ink2 });
        txt(svg, cx, cy + 12, 'value ' + nd[1], { size: fs(10), fill: BLUE });
        txt(svg, cx, cy + 30, '∂L/∂ = ' + nd[2], { size: fs(10), fill: RED });
      });
      txt(svg, 10, 12, W < 560 ? 'blue: forward · red: backward' : 'blue arrows: forward pass (values) · red arrows: backward pass (gradients of the loss)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Weights: w₁ = ' + fmt(w1, 3) + ', b₁ = ' + fmt(b1, 3) + ', w₂ = ' + fmt(w2, 3) + ', b₂ = ' + fmt(b2, 3) + '. Gradients: ∂L/∂w₂ = ' + fmt(g.dw2, 3) + ', ∂L/∂w₁ = ' + fmt(g.w1, 3) + '. Loss <strong>' + fmt(g.L, 4) + '</strong>' + (hist.length ? ' after ' + hist.length + ' step' + (hist.length > 1 ? 's' : '') + ' (started at ' + fmt(hist[0], 4) + ')' : '') + '.' +
        NOTE + 'The forward pass computes each value from left to right. The backward pass starts from ∂L/∂L = 1 and moves right to left, multiplying by each node’s local derivative (the chain rule): ∂L/∂h = (ŷ − y) × w₂, then ∂L/∂z = ∂L/∂h × (1 − h²). Each weight’s gradient is the gradient arriving at its node times the value it multiplies. Press the button to take steps of gradient descent (learning rate 0.1).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: vanishing and exploding gradients
     ----------------------------------------------------------------------- */
  FIG['fig-ml-vanish'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var depth = 20, ai = 0, ii = 0, KEYS = ['sigmoid', 'tanh', 'relu'], INIT = ['Standard (σ = 1/√n)', 'He (σ = √(2/n))', 'Large (σ = 2/√n)'];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'vg-d', label: 'Number of layers', min: 2, max: 40, step: 1, value: depth, onChange: function (x) { depth = x; draw(); } });
    choice(controls, 'Activation', ['Sigmoid', 'Tanh', 'ReLU'], ai, function (i) { ai = i; draw(); });
    choice(controls, 'Initial weights', INIT, ii, function (i) { ii = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function norms() {
      var n = 64, r = rngSeed(91), A = ACTS[KEYS[ai]], sc = [1, Math.SQRT2, 2][ii] / Math.sqrt(n), Ws = [], zs = [], h = [], l, i, j;
      for (i = 0; i < n; i++) h.push(gaussR(r));
      for (l = 0; l < depth; l++) { var Wl = []; for (i = 0; i < n; i++) { var row = new Float64Array(n); for (j = 0; j < n; j++) row[j] = sc * gaussR(r); Wl.push(row); } Ws.push(Wl); var z = new Float64Array(n); for (i = 0; i < n; i++) { var s = 0; for (j = 0; j < n; j++) s += Wl[i][j] * h[j]; z[i] = s; } zs.push(z); h = Array.from(z).map(A.f); }
      var g = []; for (i = 0; i < n; i++) g.push(gaussR(r)); var res = [];
      for (l = depth - 1; l >= 0; l--) { var dz = g.map(function (v, k) { return v * A.d(zs[l][k]); }), gn = new Float64Array(n); for (j = 0; j < n; j++) { var s2 = 0; for (i = 0; i < n; i++) s2 += Ws[l][i][j] * dz[i]; gn[j] = s2; } g = Array.from(gn); res.unshift(Math.sqrt(g.reduce(function (a, v) { return a + v * v; }, 0) / n)); }
      return res;
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Size of the gradient at each layer'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(depth));
      var nr = norms(), L = 52, R = W - 14, T = 22, B = 180, lo = -12, hi = 6;
      var X = function (l) { return L + (l + 0.5) / depth * (R - L); }, Y = function (v) { return B - (Math.max(lo, Math.min(hi, Math.log10(Math.max(v, 1e-30)))) - lo) / (hi - lo) * (B - T); };
      [-12, -8, -4, 0, 4].forEach(function (v) { el('line', { x1: L, y1: Y(Math.pow(10, v)), x2: R, y2: Y(Math.pow(10, v)), stroke: v === 0 ? c.muted : c.border, 'stroke-width': 0.6 }, svg); txt(svg, L - 6, Y(Math.pow(10, v)) + 4, '10' + ({ '-12': '⁻¹²', '-8': '⁻⁸', '-4': '⁻⁴', '0': '⁰', '4': '⁴' })[v], { anchor: 'end', size: fs(10), fill: c.muted }); });
      var bw = Math.max(2, (R - L) / depth - 2);
      nr.forEach(function (v, l) { var y0 = Y(1), y1 = Y(v); el('rect', { x: X(l) - bw / 2, y: Math.min(y0, y1), width: bw, height: Math.max(1, Math.abs(y1 - y0)), fill: v < 1e-3 ? RED : v > 1e3 ? PURPLE : GREEN, opacity: 0.8 }, svg); });
      txt(svg, L, B + 16, 'layer 1 (input side)', { anchor: 'start', size: fs(10), fill: c.muted }); txt(svg, R, B + 16, 'layer ' + depth + ' (output side)', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, L, 12, 'typical size of the gradient reaching each layer (log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      var ratio = nr[0] / nr[nr.length - 1];
      out.innerHTML = 'Gradient at the first layer is <strong>' + (ratio < 1 ? '1/' + efmt(1 / ratio) : efmt(ratio) + ' times') + '</strong> ' + (ratio < 1 ? 'of' : '') + ' the gradient at the last layer (' + depth + ' layers, ' + ['sigmoid', 'tanh', 'ReLU'][ai] + ').' +
        NOTE + 'Backpropagation multiplies by each layer’s weights and activation derivatives. If those factors are typically below 1, gradients shrink exponentially towards the input (red: vanishing), and early layers barely learn; if above 1, they explode (purple). The sigmoid’s derivative is at most 0.25, so deep sigmoid networks vanish quickly. ReLU with He initialisation keeps gradients roughly constant (green), one reason deep networks became trainable.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: train a neural network in the browser
     ----------------------------------------------------------------------- */
  FIG['fig-ml-playground'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DSK = ['blobs', 'moons', 'circles', 'xor'], di = 1, H = 8, ai = 0, AK = ['tanh', 'relu', 'sigmoid'], data = makeData('moons'), net, losses, running = false, seed = 3, MAX = 3000, frame = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Two clouds', 'Two moons', 'Circles', 'XOR'], di, function (i) { di = i; data = i === 3 ? makeXor() : makeData(DSK[i]); reset(); });
    var s1 = FIG.slider(controls, { id: 'pg-h', label: 'Hidden units', min: 1, max: 32, step: 1, value: H, onChange: function (x) { H = x; reset(); } });
    choice(controls, 'Activation', ['Tanh', 'ReLU', 'Sigmoid'], ai, function (i) { ai = i; reset(); });
    var row = group(controls, 'Training');
    var bTrain = btn('Train', row); bTrain.addEventListener('click', function () { running = !running; bTrain.textContent = running ? 'Pause' : 'Train'; });
    btn('+100 steps', row).addEventListener('click', function () { for (var k = 0; k < 100 && net.steps() < MAX; k++) losses.push(net.step(data.train, 0.03, 1e-4)); draw(); });
    btn('New start', row).addEventListener('click', function () { seed++; reset(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function reset() { net = MLP(H, AK[ai], seed); losses = []; running = false; bTrain.textContent = 'Train'; draw(); }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 420 : 300, 'Neural network decision boundary during training'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(H));
      var f = function (x, y) { return net.fwd(x, y).p; }, S = narrow ? Math.min(W - 20, 360) : Math.min(W * 0.58, 380), L = narrow ? (W - S) / 2 : 10, Hh = narrow ? S * 280 / 380 : 280;
      drawClfPanel(svg, c, f, data, L, 10, S, Hh, { grid: 44 });
      var ox = narrow ? 40 : S + 50, oy = narrow ? Hh + 40 : 30, R2 = W - 14, B2 = oy + (narrow ? 110 : 200);
      el('line', { x1: ox, y1: B2, x2: R2, y2: B2, stroke: c.border }, svg); el('line', { x1: ox, y1: oy, x2: ox, y2: B2, stroke: c.border }, svg);
      var lmax = 0.8, X2 = function (k) { return ox + k / MAX * (R2 - ox); }, Y2 = function (v) { return B2 - Math.min(v, lmax) / lmax * (B2 - oy); };
      if (losses.length) { var d = ''; for (var k = 0; k < losses.length; k += Math.max(1, Math.floor(losses.length / 300))) d += (k ? 'L' : 'M') + X2(k).toFixed(1) + ' ' + Y2(losses[k]).toFixed(1); el('path', { d: d, fill: 'none', stroke: PURPLE, 'stroke-width': 2 }, svg); }
      txt(svg, ox, oy - 8, 'training loss (cross-entropy)', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, R2, B2 + 15, MAX + ' steps', { anchor: 'end', size: fs(10), fill: c.muted }); txt(svg, ox - 4, Y2(0.693) + 4, '0.69', { anchor: 'end', size: fs(9), fill: c.muted }); txt(svg, ox - 4, B2 + 4, '0', { anchor: 'end', size: fs(9), fill: c.muted });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test);
      out.innerHTML = 'Step <strong>' + net.steps() + '</strong>: training loss ' + (losses.length ? fmt(losses[losses.length - 1], 3) : '—') + ', training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>. Network: 2 inputs → ' + H + ' ' + ['tanh', 'ReLU', 'sigmoid'][ai] + ' units → 1 sigmoid output (' + (4 * H + 1) + ' parameters).' +
        NOTE + 'Press Train to run gradient descent (the Adam optimiser of Part 8, learning rate 0.03) with backpropagation on the 140 training points, and watch the boundary bend into shape. With one hidden unit the network is just logistic regression; a few units can draw curves no straight line can. “New start” draws different random initial weights: the result can differ, a sign that training a network is not a convex problem.</span>';
    }
    reset();
    FIG.animate(figEl, function () { if (!running) return; frame++; for (var k = 0; k < 20 && net.steps() < MAX; k++) losses.push(net.step(data.train, 0.03, 1e-4)); if (net.steps() >= MAX) { running = false; bTrain.textContent = 'Train'; } if (frame % 2 === 0 || !running) draw(); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'An artificial neuron computes…', options: ['A random number', 'A weighted sum of its inputs plus a bias, passed through an activation function', 'The average of its inputs', 'A decision tree'], answer: 1, explanation: 'output = f(w·x + b).' },
      { question: 'Why can a single neuron not compute XOR?', options: ['It has too few weights', 'Its decision boundary is a straight line, and XOR’s classes cannot be separated by one line', 'XOR needs a sigmoid', 'It needs more data'], answer: 1, explanation: 'Minsky and Papert made this limitation famous in 1969; a hidden layer solves it.' },
      { question: 'What happens if every layer of a deep network uses no activation function (or a linear one)?', options: ['It becomes more powerful', 'The whole network collapses to a single linear function', 'It cannot be trained', 'It becomes a decision tree'], answer: 1, explanation: 'A composition of linear maps is linear.' },
      { question: 'The universal approximation theorem says that…', options: ['Any network learns any function quickly', 'A network with one hidden layer and enough units can approximate any continuous function as closely as desired', 'Deep networks never overfit', 'ReLU is always best'], answer: 1, explanation: 'It guarantees that a suitable network exists, not that training will find it.' },
      { question: 'Backpropagation is…', options: ['A new optimiser', 'An efficient way of computing all gradients of the loss using the chain rule, from output back to input', 'A way of removing neurons', 'Training on the test set'], answer: 1, explanation: 'It is reverse-mode automatic differentiation.' },
      { question: 'The derivative of the sigmoid is at most…', options: ['1', '0.25', '0.5', '2'], answer: 1, explanation: 'At z = 0, σ′ = σ(1 − σ) = 0.25, so gradients shrink through many sigmoid layers.' },
      { question: 'Why did ReLU help train deeper networks?', options: ['It is bounded', 'Its gradient is 1 for positive inputs, so gradients do not shrink as they pass through it', 'It never outputs zero', 'It is a probability'], answer: 1, explanation: 'Combined with good initialisation, it eases the vanishing gradient problem.' },
      { question: 'What is a “dead” ReLU unit?', options: ['A unit with very large weights', 'A unit whose input is negative for all examples, so it outputs zero and receives no gradient', 'A unit with a sigmoid', 'A unit in the output layer'], answer: 1, explanation: 'Leaky ReLU and similar functions avoid this.' },
      { question: 'Which activation is standard in transformer language models such as BERT and GPT?', options: ['Step', 'GELU (or the related SwiGLU)', 'Sigmoid', 'Linear'], answer: 1, explanation: 'Smooth ReLU-like functions work well in transformers.' },
      { question: 'A network for binary classification should usually end with…', options: ['A ReLU', 'A sigmoid output, trained with cross-entropy', 'A tanh with squared error', 'No output'], answer: 1, explanation: 'Part 7 pairs each output activation with its loss.' }
    ]);
  };
})();
