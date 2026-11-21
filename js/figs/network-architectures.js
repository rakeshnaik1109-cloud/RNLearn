/* ==========================================================================
   RNLearn — Network Architectures (Inside the Machine, Part 9)
   Figures:
     fig-ml-map         The map of the series
     fig-ml9-timeline   The story at a glance
     fig-ml-conv        Convolution on a small image
     fig-ml-rf          Receptive fields
     fig-ml-rnn         Memory in recurrent networks
     fig-ml-attn        Attention as a soft lookup
     fig-ml-pos         Sinusoidal positional encodings
     fig-ml-ae          A linear and a nonlinear autoencoder
     fig-quiz-ml9       Test yourself
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
    { name: 'Vision and memory', color: '#b45309' },
    { name: 'The deep-learning boom', color: '#1d4ed8' },
    { name: 'Attention and generation', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1962', icon: '👁️', era: 0, sec: 4, title: 'Receptive fields', text: 'David Hubel and Torsten Wiesel find neurons in the cat’s visual cortex that respond to edges at particular orientations and positions.' },
    { year: '1980', icon: '🧩', era: 0, sec: 4, title: 'The neocognitron', text: 'Kunihiko Fukushima builds a layered network of local feature detectors inspired by the visual cortex.' },
    { year: '1989', icon: '✉️', era: 0, sec: 4, title: 'Convolutional networks', text: 'Yann LeCun and colleagues train a convolutional network by backpropagation to read handwritten zip codes.' },
    { year: '1990', icon: '🔁', era: 0, sec: 6, title: 'Simple recurrent networks', text: 'Jeffrey Elman shows how a network with feedback connections finds structure in sequences.' },
    { year: '1997', icon: '🧠', era: 0, sec: 6, title: 'LSTM', text: 'Sepp Hochreiter and Jürgen Schmidhuber add a gated memory cell that carries information across long stretches of time.' },
    { year: '2006', icon: '🗜️', era: 1, sec: 9, title: 'Deep autoencoders', text: 'Geoffrey Hinton and Ruslan Salakhutdinov compress images through a narrow bottleneck far better than principal components.' },
    { year: '2012', icon: '🏆', era: 1, sec: 5, title: 'AlexNet', text: 'Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton win the ImageNet challenge by a wide margin with a deep convolutional network trained on GPUs.' },
    { year: '2014', icon: '🔀', era: 1, sec: 6, title: 'Sequence to sequence', text: 'Ilya Sutskever, Oriol Vinyals and Quoc Le translate sentences with one LSTM that reads and another that writes.' },
    { year: '2015', icon: '🎯', era: 2, sec: 7, title: 'Attention', text: 'Dzmitry Bahdanau, Kyunghyun Cho and Yoshua Bengio let a translator look back at the relevant source words for each output word.' },
    { year: '2016', icon: '↪️', era: 1, sec: 5, title: 'Residual networks', text: 'Kaiming He and colleagues train networks over a hundred layers deep using skip connections.' },
    { year: '2017', icon: '⚡', era: 2, sec: 8, title: 'The transformer', text: 'Ashish Vaswani and colleagues drop recurrence altogether: “Attention is all you need”.' },
    { year: '2021', icon: '🖼️', era: 2, sec: 8, title: 'Vision transformer', text: 'Alexey Dosovitskiy and colleagues apply a transformer to patches of images and match convolutional networks when trained on enough data.' }
  ];

  FIG['fig-ml9-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1962 to 2021');
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

  var ML_PART = 9;
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
     Convolution, recurrence, attention and a small autoencoder
     ----------------------------------------------------------------------- */
  /* A 16 × 16 picture of a little house (1 = ink) */
  var IMG = (function () {
    var R = [
      '................',
      '.......##.......',
      '......####......',
      '.....######.....',
      '....########....',
      '...##########...',
      '..############..',
      '...#........#...',
      '...#........#...',
      '...#.##..##.#...',
      '...#.##..##.#...',
      '...#........#...',
      '...#...##...#...',
      '...#...##...#...',
      '...##########...',
      '................'];
    return R.map(function (r) { return r.split('').map(function (ch) { return ch === '#' ? 1 : 0; }); });
  })();
  var KERNELS = [
    ['Vertical edges', [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]],
    ['Horizontal edges', [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]],
    ['Blur', [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]]],
    ['Sharpen', [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]],
    ['Diagonal', [[2, -1, -1], [-1, 2, -1], [-1, -1, 2]]]
  ];
  function conv2(img, k) { var n = img.length, out = []; for (var i = 0; i < n; i++) { var row = []; for (var j = 0; j < n; j++) { var s = 0; for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { var y = i + a, x = j + b; if (y >= 0 && y < n && x >= 0 && x < n) s += img[y][x] * k[a + 1][b + 1]; } row.push(s); } out.push(row); } return out; }
  /* Sensitivity of a recurrent state to the state t steps earlier */
  function rnnMemory(w, f, T) {
    var r = rngSeed(17), h = 0, prod = 1, A = [1], Bv = [1];
    for (var t = 1; t <= T; t++) { var x = 0.5 * gaussR(r); h = Math.tanh(w * h + x); prod *= w * (1 - h * h); A.push(Math.abs(prod)); Bv.push(Math.pow(f, t)); }
    return { rnn: A, lstm: Bv };
  }
  /* Sinusoidal positional encoding (Vaswani et al., 2017) */
  function posEnc(pos, d) { var v = []; for (var i = 0; i < d; i++) { var k = Math.floor(i / 2), ang = pos / Math.pow(10000, 2 * k / d); v.push(i % 2 ? Math.cos(ang) : Math.sin(ang)); } return v; }
  /* Data for the autoencoder: an arc with noise */
  function arcData() { var r = rngSeed(31), P = []; for (var i = 0; i < 200; i++) { var t = Math.PI * (0.1 + 0.8 * r()), x = Math.cos(t) * 1.4, y = Math.sin(t) * 1.4 - 0.6; P.push([x + 0.06 * gaussR(r), y + 0.06 * gaussR(r), t]); } return P; }
  function pcaLine(P) { var mx = mean(P.map(function (p) { return p[0]; })), my = mean(P.map(function (p) { return p[1]; })), sxx = 0, sxy = 0, syy = 0; P.forEach(function (p) { var a = p[0] - mx, b = p[1] - my; sxx += a * a; sxy += a * b; syy += b * b; }); var th = 0.5 * Math.atan2(2 * sxy, sxx - syy); return { mx: mx, my: my, u: [Math.cos(th), Math.sin(th)] }; }
  /* Autoencoder 2 → H tanh → 1 → H tanh → 2, trained with Adam */
  function AE(H, seed) {
    var r = rngSeed(seed || 4), sizes = [[H, 2], [1, H], [H, 1], [2, H]], P = [];
    sizes.forEach(function (s) { var W = [], b = []; for (var i = 0; i < s[0]; i++) { var row = []; for (var j = 0; j < s[1]; j++) row.push(gaussR(r) / Math.sqrt(s[1])); W.push(row); b.push(0); } P.push({ W: W, b: b }); });
    var flat = function () { var a = []; P.forEach(function (L) { L.W.forEach(function (row) { row.forEach(function (v) { a.push(v); }); }); L.b.forEach(function (v) { a.push(v); }); }); return a; };
    var n = flat().length, m = new Array(n).fill(0), v = new Array(n).fill(0), t = 0;
    var ACT = [true, false, true, false];
    function fwd(x) { var acts = [x], zs = []; for (var l = 0; l < 4; l++) { var L = P[l], z = L.W.map(function (row, i) { var s = L.b[i]; for (var j = 0; j < row.length; j++) s += row[j] * acts[l][j]; return s; }); zs.push(z); acts.push(ACT[l] ? z.map(Math.tanh) : z); } return { acts: acts, zs: zs }; }
    function step(D, lr) {
      var G = P.map(function (L) { return { W: L.W.map(function (row) { return row.map(function () { return 0; }); }), b: L.b.map(function () { return 0; }) }; }), loss = 0;
      D.forEach(function (p) {
        var f = fwd([p[0], p[1]]), out = f.acts[4], d = [2 * (out[0] - p[0]) / D.length, 2 * (out[1] - p[1]) / D.length];
        loss += ((out[0] - p[0]) * (out[0] - p[0]) + (out[1] - p[1]) * (out[1] - p[1])) / D.length;
        for (var l = 3; l >= 0; l--) {
          if (ACT[l]) d = d.map(function (q, i) { var a = f.acts[l + 1][i]; return q * (1 - a * a); });
          var L = P[l], nd = new Array(L.W[0].length).fill(0);
          for (var i = 0; i < L.W.length; i++) { G[l].b[i] += d[i]; for (var j = 0; j < L.W[i].length; j++) { G[l].W[i][j] += d[i] * f.acts[l][j]; nd[j] += L.W[i][j] * d[i]; } }
          d = nd;
        }
      });
      t++; var k = 0, c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
      function upd(obj, key, g) { m[k] = 0.9 * m[k] + 0.1 * g; v[k] = 0.999 * v[k] + 0.001 * g * g; obj[key] -= lr * (m[k] / c1) / (Math.sqrt(v[k] / c2) + 1e-8); k++; }
      P.forEach(function (L, l) { L.W.forEach(function (row, i) { row.forEach(function (_, j) { upd(row, j, G[l].W[i][j]); }); }); L.b.forEach(function (_, i) { upd(L.b, i, G[l].b[i]); }); });
      return loss;
    }
    return { step: step, rec: function (x, y) { return fwd([x, y]).acts[4]; }, code: function (x, y) { return fwd([x, y]).acts[2][0]; }, steps: function () { return t; } };
  }

  function divColor(v, vmax) { var t = Math.max(-1, Math.min(1, v / (vmax || 1))); return t >= 0 ? 'rgba(217,119,6,' + (0.08 + 0.85 * t).toFixed(3) + ')' : 'rgba(37,99,235,' + (0.08 + 0.85 * -t).toFixed(3) + ')'; }

  /* -----------------------------------------------------------------------
     Figure: convolution on a small image
     ----------------------------------------------------------------------- */
  FIG['fig-ml-conv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ki = 0, pr = 8, pc = 2;
    var controls = div('fig-controls', container);
    choice(controls, 'Filter', KERNELS.map(function (k) { return k[0]; }), ki, function (i) { ki = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'cv-r', label: 'Window row', min: 0, max: 15, step: 1, value: pr, onChange: function (x) { pr = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'cv-c', label: 'Window column', min: 0, max: 15, step: 1, value: pc, onChange: function (x) { pc = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function grid(svg, c, M, L, T, cs, colf) { for (var i = 0; i < M.length; i++) for (var j = 0; j < M[i].length; j++) el('rect', { x: L + j * cs, y: T + i * cs, width: cs, height: cs, fill: colf(M[i][j]), stroke: c.border, 'stroke-width': 0.3 }, svg); el('rect', { x: L, y: T, width: M[0].length * cs, height: M.length * cs, fill: 'none', stroke: c.border }, svg); }
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560;
      var cs = narrow ? Math.floor((W0 - 30) / 16) : Math.floor(Math.min(16, (W0 - 140) / 32)), side = cs * 16, kc = narrow ? 24 : 28;
      var A = newSVG(svgWrap, container, narrow ? Math.round(2 * side + 3 * kc + 90) : Math.round(side + 40), 'Input image, filter and feature map'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(pr)); valText(s2, String(pc));
      var K = KERNELS[ki][1], O = conv2(IMG, K), vmax = 0; O.forEach(function (r) { r.forEach(function (v) { vmax = Math.max(vmax, Math.abs(v)); }); });
      var L1 = 10, T1 = 24, Lk, Tk, L2, T2;
      if (narrow) { Lk = (W - 3 * kc) / 2; Tk = T1 + side + 30; L2 = 10; T2 = Tk + 3 * kc + 30; } else { Lk = L1 + side + (W - 2 * side - 20 - 3 * kc) / 2; Tk = T1 + side / 2 - 1.5 * kc; L2 = W - 10 - side; T2 = T1; }
      grid(svg, c, IMG, L1, T1, cs, function (v) { return v ? c.ink : c.surface; });
      el('rect', { x: L1 + (pc - 1) * cs, y: T1 + (pr - 1) * cs, width: 3 * cs, height: 3 * cs, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, svg);
      txt(svg, L1, T1 - 8, 'input (16 × 16 pixels)', { anchor: 'start', size: fs(10), fill: c.ink2 });
      for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) { var kv = K[a][b]; el('rect', { x: Lk + b * kc, y: Tk + a * kc, width: kc, height: kc, fill: divColor(kv, 2), stroke: c.border }, svg); txt(svg, Lk + b * kc + kc / 2, Tk + a * kc + kc / 2 + 4, Math.abs(kv - 1 / 9) < 1e-9 ? '⅑' : String(kv), { size: fs(10), fill: c.ink }); }
      txt(svg, Lk + 1.5 * kc, Tk - 8, 'filter (3 × 3)', { size: fs(10), fill: c.ink2 });
      grid(svg, c, O, L2, T2, cs, function (v) { return divColor(v, vmax); });
      el('rect', { x: L2 + pc * cs, y: T2 + pr * cs, width: cs, height: cs, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, svg);
      txt(svg, L2, T2 - 8, 'feature map (orange +, blue −)', { anchor: 'start', size: fs(10), fill: c.ink2 });
      var terms = [], s = 0; for (a = -1; a <= 1; a++) for (b = -1; b <= 1; b++) { var y = pr + a, x = pc + b, px = (y >= 0 && y < 16 && x >= 0 && x < 16) ? IMG[y][x] : 0, k = K[a + 1][b + 1]; s += px * k; if (px && k) terms.push(Math.abs(k - 1 / 9) < 1e-9 ? '⅑' : String(k)); }
      out.innerHTML = 'At row ' + pr + ', column ' + pc + ': the sum of filter weights over the inked pixels in the red window = ' + (terms.length ? terms.join(' + ').replace(/\+ -/g, '− ') : '0') + ' = <strong>' + fmt(s, 2) + '</strong>.' + NOTE + 'The same nine weights slide over every position of the image, so the filter detects its pattern wherever it occurs. ' + ['This filter responds to vertical edges: positive where ink starts on the right, negative where it ends.', 'This filter responds to horizontal edges, such as the roof line and the floor.', 'Averaging each pixel with its neighbours smooths the picture.', 'Sharpening exaggerates the difference between a pixel and its neighbours.', 'This filter responds to lines running from top-left to bottom-right, such as one side of the roof.'][ki] + ' In a trained network, the filter weights are learned, not chosen.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: receptive fields in a stack of convolutional layers
     ----------------------------------------------------------------------- */
  FIG['fig-ml-rf'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nl = 3, k = 3, st = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rf-l', label: 'Number of layers', min: 1, max: 6, step: 1, value: nl, onChange: function (x) { nl = x; draw(); } });
    choice(controls, 'Filter width', ['3', '5'], 0, function (i) { k = i ? 5 : 3; draw(); });
    choice(controls, 'Stride (downsampling)', ['1', '2'], 0, function (i) { st = i ? 2 : 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 60 + nl * 46, 'Receptive field of one unit in a stack of convolutional layers'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(nl));
      var rf = 1, jump = 1; for (var l = 0; l < nl; l++) { rf += (k - 1) * jump; jump *= st; }
      var N = Math.max(rf + 6, 21), L = 30, R = W - 14, cw = (R - L) / N, rr = Math.min(6, cw * 0.38), Yl = function (l) { return 28 + (nl - l) * 46; }, mid = Math.floor(N / 2);
      /* for each layer, which positions feed the top unit */
      var sets = [], cur = {}; cur[mid] = true; sets[nl] = cur;
      for (l = nl; l >= 1; l--) { var spacing = Math.pow(st, l - 1), nxt = {}; Object.keys(sets[l]).forEach(function (p) { p = +p; for (var d = -(k - 1) / 2; d <= (k - 1) / 2; d++) nxt[p + d * spacing] = true; }); sets[l - 1] = nxt; }
      for (l = 0; l <= nl; l++) {
        var spacing2 = Math.pow(st, l);
        txt(svg, 6, Yl(l) + 4, l === 0 ? 'in' : String(l), { anchor: 'start', size: fs(9), fill: c.muted });
        for (var p = 0; p < N; p++) {
          if ((p - mid) % spacing2 !== 0) continue;
          var on = sets[l][p];
          el('circle', { cx: L + (p + 0.5) * cw, cy: Yl(l), r: rr, fill: on ? (l === nl ? RED : l === 0 ? AMBER : BLUE) : c.surface, stroke: on ? 'none' : c.border }, svg);
          if (l > 0 && on) { var sp = Math.pow(st, l - 1); for (var d2 = -(k - 1) / 2; d2 <= (k - 1) / 2; d2++) { var q = p + d2 * sp; el('line', { x1: L + (p + 0.5) * cw, y1: Yl(l) + rr, x2: L + (q + 0.5) * cw, y2: Yl(l - 1) - rr, stroke: BLUE, 'stroke-width': 0.7, opacity: 0.5 }, svg); } }
        }
      }
      txt(svg, L, 14, 'one unit at the top (red) and every input it can see (orange)', { anchor: 'start', size: fs(10), fill: c.muted });
      var dense = 224 * 224 * 3 * 64, convp = k * k * 3 * 64;
      out.innerHTML = 'Receptive field: <strong>' + rf + ' inputs</strong> after ' + nl + ' layer' + (nl > 1 ? 's' : '') + ' of width-' + k + ' filters with stride ' + st + '.' + NOTE + 'Each layer only looks at ' + k + ' neighbours, but stacking layers widens the view: by ' + (k - 1) + ' per layer with stride 1, and much faster when each layer downsamples (stride 2), since every step then spans twice as many inputs. Weight sharing keeps this cheap: a layer of 64 ' + k + ' × ' + k + ' filters on a colour image has ' + convp.toLocaleString('en-GB') + ' weights, whereas connecting every pixel of a 224 × 224 colour image to just 64 units would take ' + dense.toLocaleString('en-GB') + '.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: memory in recurrent networks
     ----------------------------------------------------------------------- */
  FIG['fig-ml-rnn'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w = 1, f = 0.95, T = 50;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rn-w', label: 'Recurrent weight (simple RNN)', min: 0.5, max: 3, step: 0.1, value: w, onChange: function (x) { w = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'rn-f', label: 'Forget gate (LSTM)', min: 0.5, max: 0.999, step: 0.001, value: f, onChange: function (x) { f = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'How much a recurrent state depends on the state many steps earlier'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(w, 1)); valText(s2, fmt(f, 3));
      var M = rnnMemory(w, f, T), L = 48, R = W - 14, Tp = 26, B = 206, lo = -10, hi = 0, X = function (t) { return L + t / T * (R - L); }, Y = function (v) { return B - (Math.max(lo, Math.log10(Math.max(v, 1e-300))) - lo) / (hi - lo) * (B - Tp); };
      [-10, -8, -6, -4, -2, 0].forEach(function (e) { el('line', { x1: L, y1: Y(Math.pow(10, e)), x2: R, y2: Y(Math.pow(10, e)), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, L - 5, Y(Math.pow(10, e)) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      [0, 10, 20, 30, 40, 50].forEach(function (v) { txt(svg, X(v), B + 14, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'steps back in time', { size: fs(10), fill: c.muted });
      txt(svg, L, 14, W < 520 ? 'red: simple RNN · blue: LSTM memory cell' : 'sensitivity of the current state to a state t steps earlier · red: simple RNN · blue: LSTM memory cell', { anchor: 'start', size: fs(10), fill: c.muted });
      [[M.rnn, RED], [M.lstm, BLUE]].forEach(function (q) { var d = ''; q[0].forEach(function (v, t) { d += (t ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(v).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: q[1], 'stroke-width': 2.4 }, svg); });
      function e(v) { if (v >= 1e-3) return fmt(v, 3); var p = v.toExponential(1).split('e'); return p[0] + ' × 10<sup>' + (+p[1]) + '</sup>'; }
      out.innerHTML = 'After 20 steps: simple RNN <strong>' + e(M.rnn[20]) + '</strong>, LSTM cell <strong>' + e(M.lstm[20]) + '</strong>. After 50 steps: ' + e(M.rnn[50]) + ' and ' + e(M.lstm[50]) + '.' + NOTE + 'A simple RNN feeds its state through a weight and a tanh at every step, so the gradient is multiplied by w(1 − h²) each time: it shrinks exponentially, and a larger weight only pushes the tanh into saturation. The LSTM’s memory cell is updated by addition and scaled only by its forget gate; with the gate near 1, information and gradients survive for many steps.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: attention as a soft lookup
     ----------------------------------------------------------------------- */
  FIG['fig-ml-attn'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var TOK = [['cat', 30, 1.0], ['sat', 105, 0.9], ['on', 160, 0.7], ['the', 210, 0.6], ['mat', 55, 1.0], ['softly', 300, 0.8]];
    var qa = 40, sharp = 2;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'at-q', label: 'Query direction (degrees)', min: 0, max: 355, step: 5, value: qa, onChange: function (x) { qa = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'at-s', label: 'Query length (sharpness)', min: 0, max: 8, step: 0.5, value: sharp, onChange: function (x) { sharp = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 262, 'Attention weights of a query over six keys'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(qa) + '°'); valText(s2, fmt(sharp, 1));
      var rad = function (d) { return d * Math.PI / 180; }, q = [sharp * Math.cos(rad(qa)), sharp * Math.sin(rad(qa))];
      var keys = TOK.map(function (t) { return [t[2] * Math.cos(rad(t[1])), t[2] * Math.sin(rad(t[1]))]; });
      var sc = keys.map(function (k) { return (q[0] * k[0] + q[1] * k[1]) / Math.SQRT2; }), mx = Math.max.apply(null, sc), ex = sc.map(function (s) { return Math.exp(s - mx); }), sum = ex.reduce(function (a, b) { return a + b; }, 0), wts = ex.map(function (e) { return e / sum; });
      var outv = [0, 0]; wts.forEach(function (a, i) { outv[0] += a * keys[i][0]; outv[1] += a * keys[i][1]; });
      var cx = narrow ? W / 2 : 130, cy = 142, Rr = 90;
      el('circle', { cx: cx, cy: cy, r: Rr, fill: 'none', stroke: c.border, 'stroke-dasharray': '3 3' }, svg);
      keys.forEach(function (k, i) { var x = cx + k[0] * Rr, y = cy - k[1] * Rr; el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: c.muted, 'stroke-width': 1 + 4 * wts[i] }, svg); el('circle', { cx: x, cy: y, r: 4 + 10 * wts[i], fill: BLUE, opacity: 0.25 + 0.75 * wts[i] }, svg); txt(svg, cx + k[0] * (Rr + 22), cy - k[1] * (Rr + 22) + 4, TOK[i][0], { size: fs(10), fill: c.ink2 }); });
      var qs = Math.min(1.25, 0.25 + sharp / 8); el('line', { x1: cx, y1: cy, x2: cx + Math.cos(rad(qa)) * Rr * qs, y2: cy - Math.sin(rad(qa)) * Rr * qs, stroke: RED, 'stroke-width': 3 }, svg);
      el('line', { x1: cx, y1: cy, x2: cx + outv[0] * Rr, y2: cy - outv[1] * Rr, stroke: PURPLE, 'stroke-width': 3, 'stroke-dasharray': '5 3' }, svg);
      txt(svg, 10, 14, narrow ? 'red: query · blue: keys · purple: output' : 'red: query · blue: keys (size = attention weight) · purple dashed: output (weighted average)', { anchor: 'start', size: fs(10), fill: c.muted });
      var L2 = narrow ? 70 : 300, R2 = W - 40, T2 = narrow ? 290 : 40, bh = narrow ? 26 : 30;
      TOK.forEach(function (t, i) { var y = T2 + i * bh; txt(svg, L2 - 8, y + bh / 2 + 4, t[0], { anchor: 'end', size: fs(10), fill: c.ink2 }); el('rect', { x: L2, y: y + 4, width: (R2 - L2) * wts[i], height: bh - 8, fill: BLUE, opacity: 0.8 }, svg); txt(svg, L2 + (R2 - L2) * wts[i] + 4, y + bh / 2 + 4, fmt(wts[i], 2), { anchor: 'start', size: fs(9), fill: c.muted }); });
      var best = wts.indexOf(Math.max.apply(null, wts));
      out.innerHTML = 'Largest weight: <strong>“' + TOK[best][0] + '”</strong> (' + fmt(wts[best], 2) + '). Weights sum to 1.' + NOTE + 'Each word offers a <em>key</em>; the word doing the looking has a <em>query</em>. Their dot products, divided by √d (here d = 2), go through a softmax to give attention weights, and the output is the weighted average of the words’ <em>values</em> (here the same vectors as the keys). A longer query makes the softmax sharper; length 0 spreads attention evenly. In a transformer, queries, keys and values are learned linear maps of each word’s vector, with many such “heads” in parallel.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: sinusoidal positional encodings
     ----------------------------------------------------------------------- */
  FIG['fig-ml-pos'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p0 = 10, NP = 50, D = 32;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ps-p', label: 'Position', min: 0, max: 49, step: 1, value: p0, onChange: function (x) { p0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var PE = []; for (var p = 0; p < NP; p++) PE.push(posEnc(p, D));
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 430 : 230, 'Positional encodings and their similarity'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(p0));
      var L = 40, R = narrow ? W - 12 : W * 0.5, T = 26, H = narrow ? 170 : 170, cw = (R - L) / NP, ch = H / D;
      for (var pp = 0; pp < NP; pp++) for (var d = 0; d < D; d++) el('rect', { x: L + pp * cw, y: T + d * ch, width: cw + 0.3, height: ch + 0.3, fill: divColor(PE[pp][d], 1) }, svg);
      el('rect', { x: L + p0 * cw, y: T, width: cw, height: H, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg);
      txt(svg, L, T - 8, 'encoding: 32 dimensions (down) × 50 positions (across)', { anchor: 'start', size: fs(10), fill: c.ink2 });
      txt(svg, L - 5, T + 8, '0', { anchor: 'end', size: fs(9), fill: c.muted }); txt(svg, L - 5, T + H, '31', { anchor: 'end', size: fs(9), fill: c.muted });
      [0, 25, 49].forEach(function (v) { txt(svg, L + (v + 0.5) * cw, T + H + 14, String(v), { size: fs(9), fill: c.muted }); });
      var dots = PE.map(function (v) { var s = 0; for (var i = 0; i < D; i++) s += v[i] * PE[p0][i]; return s; });
      var L2 = narrow ? 40 : W * 0.5 + 50, R2 = W - 12, T2 = narrow ? 250 : 26, B2 = narrow ? 390 : 196, X = function (q) { return L2 + q / (NP - 1) * (R2 - L2); }, Y = function (v) { return B2 - (v + 4) / 20 * (B2 - T2); };
      [0, 8, 16].forEach(function (v) { el('line', { x1: L2, y1: Y(v), x2: R2, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L2 - 5, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [0, 25, 49].forEach(function (v) { txt(svg, X(v), B2 + 14, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, L2, T2 - 8, 'similarity (dot product) with position ' + p0, { anchor: 'start', size: fs(10), fill: c.ink2 });
      var dd = ''; dots.forEach(function (v, q) { dd += (q ? 'L' : 'M') + X(q).toFixed(1) + ' ' + Y(v).toFixed(1); }); el('path', { d: dd, fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, svg);
      el('circle', { cx: X(p0), cy: Y(dots[p0]), r: 4.5, fill: RED }, svg);
      out.innerHTML = 'Position ' + p0 + ' is most similar to itself (' + fmt(dots[p0], 1) + ') and to its neighbours: positions ' + Math.max(0, p0 - 1) + ' and ' + Math.min(49, p0 + 1) + ' score ' + fmt(dots[Math.max(0, p0 - 1)], 1) + ' and ' + fmt(dots[Math.min(49, p0 + 1)], 1) + '; position ' + (p0 < 25 ? p0 + 20 : p0 - 20) + ' scores ' + fmt(dots[p0 < 25 ? p0 + 20 : p0 - 20], 1) + '.' + NOTE + 'Attention by itself ignores word order, so the transformer adds a position code to each word’s vector. Each pair of dimensions is a sine and cosine wave of a different wavelength, from fast (top rows) to very slow (bottom rows), like the hands of a clock. Nearby positions get similar codes, and a fixed offset corresponds to the same rotation wherever it occurs.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: linear versus nonlinear autoencoder
     ----------------------------------------------------------------------- */
  FIG['fig-ml-ae'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = arcData(), pl = pcaLine(D), MAX = 2000, net, loss, running = false, seed = 4, mode = 1;
    var linMSE = 0; D.forEach(function (p) { var a = p[0] - pl.mx, b = p[1] - pl.my, s = a * pl.u[0] + b * pl.u[1], rx = pl.mx + s * pl.u[0] - p[0], ry = pl.my + s * pl.u[1] - p[1]; linMSE += (rx * rx + ry * ry) / D.length; });
    function reset() { net = AE(16, seed); loss = null; running = false; bRun.textContent = 'Train'; draw(); }
    var controls = div('fig-controls', container);
    choice(controls, 'Autoencoder', ['Linear (PCA)', 'Nonlinear (16 tanh units each side)'], mode, function (i) { mode = i; draw(); });
    var row = group(controls, 'Training');
    var bRun = btn('Train', row); bRun.addEventListener('click', function () { if (net.steps() >= MAX) reset(); running = !running; bRun.textContent = running ? 'Pause' : 'Train'; });
    btn('All 2,000 steps', row).addEventListener('click', function () { for (var k = net.steps(); k < MAX; k++) loss = net.step(D, 0.01); draw(); });
    btn('New start', row).addEventListener('click', function () { seed++; reset(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), S0 = Math.min(W0 - 20, 440), A = newSVG(svgWrap, container, Math.round(S0 * 0.5 + 36), 'Data points and their reconstructions through a one-number bottleneck'), W = A.W, svg = A.svg, fs = A.fs;
      var S = Math.min(W - 20, 440), L = (W - S) / 2, T = 24, H = S * 0.5, xl = -1.8, xh = 1.8, yl = -0.9, yh = 0.9; var X = function (x) { return L + (x - xl) / (xh - xl) * S; }, Y = function (y) { return T + (yh - y) / (yh - yl) * H; };
      el('rect', { x: L, y: T, width: S, height: H, fill: c.surface, stroke: c.border }, svg);
      var rec = mode ? function (p) { return net.rec(p[0], p[1]); } : function (p) { var a = p[0] - pl.mx, b = p[1] - pl.my, s = a * pl.u[0] + b * pl.u[1]; return [pl.mx + s * pl.u[0], pl.my + s * pl.u[1]]; };
      var mse = 0;
      D.forEach(function (p) { var r = rec(p); mse += ((r[0] - p[0]) * (r[0] - p[0]) + (r[1] - p[1]) * (r[1] - p[1])) / D.length; el('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(r[0]), y2: Y(r[1]), stroke: c.muted, 'stroke-width': 0.6 }, svg); });
      D.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.4, fill: c.ink2, opacity: 0.6 }, svg); });
      D.forEach(function (p) { var r = rec(p); el('circle', { cx: X(r[0]), cy: Y(r[1]), r: 2.4, fill: RED }, svg); });
      txt(svg, L, 14, 'grey: 200 data points · red: their reconstructions from one number', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (mode ? 'Nonlinear autoencoder, step <strong>' + net.steps() + '</strong>' : 'Linear autoencoder (principal component analysis)') + ': reconstruction error <strong>' + fmt(mse, 4) + '</strong> (linear: ' + fmt(linMSE, 4) + ').' + NOTE + 'Each two-dimensional point is squeezed through a bottleneck of a single number and then expanded back. A linear autoencoder can only project onto the best straight line, which is what principal component analysis finds. A nonlinear one learns to code each point by where it lies along the curve, and reconstructs the arc. The bottleneck number is a learned <em>embedding</em> of the data.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function () { if (!running || !mode) return; for (var k = 0; k < 20 && net.steps() < MAX; k++) loss = net.step(D, 0.01); if (net.steps() >= MAX) { running = false; bRun.textContent = 'Train'; } draw(); });
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why do convolutional networks need far fewer weights than fully connected ones on images?', options: ['They use smaller images', 'Each small filter is shared across all positions of the image', 'They have no biases', 'They skip training'], answer: 1, explanation: 'Weight sharing: 64 filters of 3 × 3 × 3 have 1,728 weights.' },
      { question: 'What does stacking convolutional layers do to the receptive field?', options: ['Keeps it fixed', 'Widens it, so deeper units see larger parts of the input', 'Shrinks it', 'Makes it random'], answer: 1, explanation: 'Each width-3 layer adds 2 inputs with stride 1, and more with downsampling.' },
      { question: 'A recurrent network is designed for…', options: ['Tabular data only', 'Sequences, carrying a state from one step to the next', 'Images only', 'Clustering'], answer: 1, explanation: 'The same weights are applied at every time step.' },
      { question: 'What problem did the LSTM address?', options: ['Overfitting', 'Vanishing gradients over long sequences', 'Slow data loading', 'Too few parameters'], answer: 1, explanation: 'Its additive, gated memory cell lets information survive many steps.' },
      { question: 'In attention, the output for a word is…', options: ['The most similar word', 'A weighted average of value vectors, with weights from a softmax of query–key scores', 'The sum of all keys', 'A random word'], answer: 1, explanation: 'softmax(QKᵀ/√d)V.' },
      { question: 'Why does a transformer need positional encodings?', options: ['To save memory', 'Attention alone ignores the order of the words', 'To normalise the inputs', 'To add dropout'], answer: 1, explanation: 'Without them, shuffling the words would not change the result.' },
      { question: 'How does the cost of self-attention grow with sequence length n?', options: ['Linearly', 'Roughly with n², since every word attends to every other', 'It does not grow', 'Exponentially'], answer: 1, explanation: 'This is why long contexts are expensive.' },
      { question: 'An autoencoder is trained to…', options: ['Classify images', 'Reproduce its input after passing it through a narrow bottleneck', 'Generate random noise', 'Predict the next word only'], answer: 1, explanation: 'The bottleneck forces it to learn a compact code, an embedding.' },
      { question: 'A linear autoencoder with a bottleneck of k units learns the same subspace as…', options: ['k-means', 'Principal component analysis', 'A decision tree', 'Naive Bayes'], answer: 1, explanation: 'Figure 8 compares the two on a curved data set.' },
      { question: 'Which architecture is usually the first choice for tabular data with a few dozen columns?', options: ['A transformer', 'Gradient-boosted trees (Part 4), or a small fully connected network', 'A convolutional network', 'An LSTM'], answer: 1, explanation: 'Architectures pay off when their built-in assumptions match the structure of the data.' }
    ]);
  };
})();
