/* ==========================================================================
   RNLearn — Training Deep Networks (Inside the Machine, Part 8)
   Figures:
     fig-ml-map         The map of the series
     fig-ml8-timeline   The story at a glance
     fig-ml-lr          The learning rate on a narrow valley
     fig-ml-optim       An optimiser race
     fig-ml-batch       Mini-batch size
     fig-ml-sched       Learning-rate schedules
     fig-ml-lrfind      The learning-rate range test
     fig-ml-deep        The signal through 20 layers
     fig-ml-reg         Overfitting and regularisation
     fig-quiz-ml8       Test yourself
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
    { name: 'Optimisation foundations', color: '#b45309' },
    { name: 'Taming deep networks', color: '#1d4ed8' },
    { name: 'Modern training recipes', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1951', icon: '🎲', era: 0, sec: 3, title: 'Stochastic approximation', text: 'Herbert Robbins and Sutton Monro show that noisy steps with shrinking step sizes still converge: the root of stochastic gradient descent.' },
    { year: '1964', icon: '🏐', era: 0, sec: 5, title: 'Momentum', text: 'Boris Polyak’s “heavy ball” method adds a fraction of the previous step to the current one.' },
    { year: '1983', icon: '⏩', era: 0, sec: 5, title: 'Nesterov acceleration', text: 'Yurii Nesterov devises an accelerated gradient method that looks ahead before stepping.' },
    { year: '1992', icon: '⚖️', era: 1, sec: 11, title: 'Weight decay', text: 'Anders Krogh and John Hertz show how a simple decay of the weights improves generalisation.' },
    { year: '2011', icon: '📏', era: 1, sec: 5, title: 'AdaGrad', text: 'John Duchi, Elad Hazan and Yoram Singer give each parameter its own adaptive step size.' },
    { year: '2012', icon: '🎓', era: 1, sec: 5, title: 'RMSProp', text: 'Tijmen Tieleman and Geoffrey Hinton present RMSProp in an online course: divide each step by a running average of recent gradient sizes.' },
    { year: '2014', icon: '🎭', era: 1, sec: 11, title: 'Dropout', text: 'Nitish Srivastava, Geoffrey Hinton and colleagues publish dropout: randomly silence units during training to prevent co-adaptation.' },
    { year: '2015', icon: '🅰️', era: 2, sec: 5, title: 'Adam', text: 'Diederik Kingma and Jimmy Ba combine momentum with adaptive step sizes; Adam becomes the default optimiser.' },
    { year: '2015', icon: '📊', era: 2, sec: 9, title: 'Batch normalisation', text: 'Sergey Ioffe and Christian Szegedy normalise each layer’s inputs over the mini-batch, making deep networks far easier to train.' },
    { year: '2016', icon: '↪️', era: 2, sec: 10, title: 'Residual networks', text: 'Kaiming He and colleagues add skip connections and train networks over a hundred layers deep.' },
    { year: '2017', icon: '🔥', era: 2, sec: 7, title: 'Warm-up and large batches', text: 'Priya Goyal and colleagues train an ImageNet model in one hour, scaling the learning rate with the batch size after a gradual warm-up.' },
    { year: '2019', icon: '🧹', era: 2, sec: 11, title: 'AdamW', text: 'Ilya Loshchilov and Frank Hutter separate weight decay from Adam’s adaptive steps, now standard for training transformers.' }
  ];

  FIG['fig-ml8-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1951 to 2019');
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

  var ML_PART = 8;
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
     Optimisers, a small regression network and a deep-network probe
     ----------------------------------------------------------------------- */
  function sgm(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  /* A narrow, tilted valley: f(x, y) = ½(u² + 50 v²) in coordinates rotated by 30° */
  var VAL = { k: 50, c: Math.cos(Math.PI / 6), s: Math.sin(Math.PI / 6) };
  function valF(x, y) { var u = VAL.c * x + VAL.s * y, v = -VAL.s * x + VAL.c * y; return 0.5 * (u * u + VAL.k * v * v); }
  function valG(x, y) { var u = VAL.c * x + VAL.s * y, v = -VAL.s * x + VAL.c * y, gu = u, gv = VAL.k * v; return [VAL.c * gu - VAL.s * gv, VAL.s * gu + VAL.c * gv]; }
  /* One optimiser state; kind: sgd, mom, nest, rms, adam */
  function Opt(kind, lr) {
    var m = [0, 0], v = [0, 0], t = 0;
    return function (p, g) {
      t++;
      for (var i = 0; i < 2; i++) {
        if (kind === 'sgd') p[i] -= lr * g[i];
        else if (kind === 'mom') { m[i] = 0.9 * m[i] + g[i]; p[i] -= lr * m[i]; }
        else if (kind === 'rms') { v[i] = 0.9 * v[i] + 0.1 * g[i] * g[i]; p[i] -= lr * g[i] / (Math.sqrt(v[i]) + 1e-8); }
        else { m[i] = 0.9 * m[i] + 0.1 * g[i]; v[i] = 0.999 * v[i] + 0.001 * g[i] * g[i]; p[i] -= lr * (m[i] / (1 - Math.pow(0.9, t))) / (Math.sqrt(v[i] / (1 - Math.pow(0.999, t))) + 1e-8); }
      }
    };
  }
  /* Linear regression data for mini-batch experiments: y = 0.5 + 2x + noise, 512 points */
  function linData() { var r = rngSeed(8), P = []; for (var i = 0; i < 512; i++) { var x = 2 * r() - 1; P.push([x, 0.5 + 2 * x + 0.5 * gaussR(r)]); } return P; }
  /* A regression network 1 → H tanh → 1 with Adam, decoupled weight decay and dropout */
  function RegNet(H, seed) {
    var r = rngSeed(seed || 11), th = [], i;
    for (i = 0; i < H; i++) th.push(3 * gaussR(r));
    for (i = 0; i < H; i++) th.push(1.5 * gaussR(r));
    for (i = 0; i < H; i++) th.push(gaussR(r) / Math.sqrt(H));
    th.push(0);
    var m = th.map(function () { return 0; }), s = th.map(function () { return 0; }), t = 0, rd = rngSeed((seed || 11) + 1000);
    function f(x) { var u = (x - 0.5) * 2, o = th[3 * H]; for (var k = 0; k < H; k++) o += th[2 * H + k] * Math.tanh(th[k] * u + th[H + k]); return o; }
    function step(xs, ys, lr, wd, drop, sgd) {
      var g = th.map(function () { return 0; }), n = xs.length, L = 0, keep = 1 - (drop || 0);
      for (var j = 0; j < n; j++) {
        var u = (xs[j] - 0.5) * 2, h = [], msk = [], o = th[3 * H];
        for (var k = 0; k < H; k++) { msk[k] = drop ? (rd() < keep ? 1 / keep : 0) : 1; h[k] = Math.tanh(th[k] * u + th[H + k]); o += th[2 * H + k] * h[k] * msk[k]; }
        var e = o - ys[j]; L += e * e; var d = 2 * e / n; g[3 * H] += d;
        for (k = 0; k < H; k++) { if (!msk[k]) continue; g[2 * H + k] += d * h[k] * msk[k]; var dz = d * th[2 * H + k] * msk[k] * (1 - h[k] * h[k]); g[k] += dz * u; g[H + k] += dz; }
      }
      t++; var c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
      if (sgd) { for (var q2 = 0; q2 < th.length; q2++) { m[q2] = 0.9 * m[q2] + g[q2]; th[q2] -= lr * m[q2]; } return L / n; }
      for (var q = 0; q < th.length; q++) { m[q] = 0.9 * m[q] + 0.1 * g[q]; s[q] = 0.999 * s[q] + 0.001 * g[q] * g[q]; th[q] -= lr * ((m[q] / c1) / (Math.sqrt(s[q] / c2) + 1e-8) + (q < 3 * H ? wd * th[q] : 0)); }
      return L / n;
    }
    return { f: f, step: step, steps: function () { return t; } };
  }
  function mseF(f, xs, ys) { var s = 0; for (var i = 0; i < xs.length; i++) { var e = f(xs[i]) - ys[i]; s += e * e; } return s / xs.length; }
  /* Activations through a deep random network: returns per-layer standard deviation and fraction saturated or dead */
  function deepProbe(depth, act, scale, norm, seed) {
    var r = rngSeed(seed || 5), N = 64, B = 128, X = [], l, i, j, k, out = [];
    for (i = 0; i < B; i++) { var row = []; for (j = 0; j < N; j++) row.push(gaussR(r)); X.push(row); }
    for (l = 0; l < depth; l++) {
      var W = []; for (j = 0; j < N; j++) { var wr = []; for (k = 0; k < N; k++) wr.push(gaussR(r) * scale / Math.sqrt(N)); W.push(wr); }
      var Z = X.map(function (x) { var z = []; for (var a = 0; a < N; a++) { var s = 0; for (var b = 0; b < N; b++) s += W[a][b] * x[b]; z.push(s); } return z; });
      if (norm) Z = Z.map(function (z) { var mu = 0, v = 0; z.forEach(function (q) { mu += q; }); mu /= N; z.forEach(function (q) { v += (q - mu) * (q - mu); }); var sd = Math.sqrt(v / N + 1e-5); return z.map(function (q) { return (q - mu) / sd; }); });
      X = Z.map(function (z) { return z.map(function (q) { return act === 'relu' ? Math.max(0, q) : Math.tanh(q); }); });
      var all = [], bad = 0; X.forEach(function (x) { x.forEach(function (q) { all.push(q); if (act === 'relu' ? q === 0 : Math.abs(q) > 0.99) bad++; }); });
      var mu2 = mean(all), sd2 = 0; all.forEach(function (q) { sd2 += (q - mu2) * (q - mu2); }); sd2 = Math.sqrt(sd2 / all.length);
      out.push({ sd: sd2, bad: bad / all.length, q: [quantile(all.slice().sort(function (a, b) { return a - b; }), 0.1), quantile(all.slice().sort(function (a, b) { return a - b; }), 0.9)] });
    }
    return out;
  }

  /* Shared drawing for the tilted valley */
  var VBOX = { xl: -3, xh: 3, yl: -2, yh: 2 };
  function valleyPanel(svg, c, L, T, S, H, clipId) {
    var X = function (x) { return L + (x - VBOX.xl) / (VBOX.xh - VBOX.xl) * S; }, Y = function (y) { return T + (VBOX.yh - y) / (VBOX.yh - VBOX.yl) * H; };
    var cp = el('clipPath', { id: clipId }, svg); el('rect', { x: L, y: T, width: S, height: H }, cp);
    var g = el('g', { 'clip-path': 'url(#' + clipId + ')' }, svg);
    el('rect', { x: L, y: T, width: S, height: H, fill: c.surface }, g);
    [0.02, 0.1, 0.4, 1, 2, 4, 8].forEach(function (lev) {
      var d = '';
      for (var k = 0; k <= 72; k++) { var a = 2 * Math.PI * k / 72, u = Math.sqrt(2 * lev) * Math.cos(a), v = Math.sqrt(2 * lev / VAL.k) * Math.sin(a), x = VAL.c * u - VAL.s * v, y = VAL.s * u + VAL.c * v; d += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: c.border, 'stroke-width': 1 }, g);
    });
    el('circle', { cx: X(0), cy: Y(0), r: 4, fill: c.ink }, g);
    el('rect', { x: L, y: T, width: S, height: H, fill: 'none', stroke: c.border }, svg);
    return { X: X, Y: Y, g: g };
  }
  function pathD(P, pts) { var d = ''; pts.forEach(function (p, i) { var x = Math.max(-50, Math.min(50, p[0])), y = Math.max(-50, Math.min(50, p[1])); d += (i ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); }); return d; }
  function logPanel(svg, c, fs, L, R, T, B, lo, hi, n, title, xlab) {
    var X = function (t) { return L + t / n * (R - L); }, Y = function (v) { var lv = Math.log10(Math.max(v, Math.pow(10, lo - 1))); return B - (Math.min(hi + 1, lv) - lo) / (hi - lo) * (B - T); };
    for (var e = lo; e <= hi; e += (hi - lo > 6 ? 2 : 1)) { el('line', { x1: L, y1: Y(Math.pow(10, e)), x2: R, y2: Y(Math.pow(10, e)), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, L - 5, Y(Math.pow(10, e)) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; }
    [0, n / 2, n].forEach(function (v) { txt(svg, X(v), B + 14, String(v), { size: fs(9), fill: c.muted }); });
    txt(svg, (L + R) / 2, B + 28, xlab || 'steps', { size: fs(9), fill: c.muted });
    txt(svg, L, T - 8, title, { anchor: 'start', size: fs(10), fill: c.ink2 });
    el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
    var cp = el('clipPath', { id: 'lp' + Math.round(L) + '_' + Math.round(T) }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T + 1 }, cp);
    return { X: X, Y: Y, clip: 'url(#lp' + Math.round(L) + '_' + Math.round(T) + ')' };
  }
  function series(svg, P, arr, col, w, dash) { var d = ''; arr.forEach(function (v, t) { d += (t ? 'L' : 'M') + P.X(t).toFixed(1) + ' ' + P.Y(v).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2, 'stroke-dasharray': dash || 'none', 'clip-path': P.clip }, svg); }

  /* -----------------------------------------------------------------------
     Figure: the learning rate on a narrow valley
     ----------------------------------------------------------------------- */
  FIG['fig-ml-lr'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lr = 0.02, N = 60, S0 = [-2.6, -0.4];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'lr-lr', label: 'Learning rate', min: 0.002, max: 0.05, step: 0.002, value: lr, onChange: function (x) { lr = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560;
      var S = narrow ? W0 - 20 : Math.min(W0 * 0.52, 420), Hh = S * 2 / 3;
      var A = newSVG(svgWrap, container, narrow ? Math.round(Hh + 250) : Math.round(Math.max(Hh + 30, 240)), 'Gradient descent path on a narrow valley and its loss'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(lr, 3));
      var p = S0.slice(), pts = [p.slice()], Ls = [valF(p[0], p[1])];
      for (var t = 0; t < N; t++) { var g = valG(p[0], p[1]); p[0] -= lr * g[0]; p[1] -= lr * g[1]; pts.push(p.slice()); Ls.push(valF(p[0], p[1])); }
      var P = valleyPanel(svg, c, 10, 20, S, Hh, 'lr-clip');
      el('path', { d: pathD(P, pts), fill: 'none', stroke: RED, 'stroke-width': 1.8 }, P.g);
      pts.forEach(function (q, i) { if (i % 2 === 0 || i < 6) el('circle', { cx: P.X(Math.max(-50, Math.min(50, q[0]))), cy: P.Y(Math.max(-50, Math.min(50, q[1]))), r: 2.5, fill: RED }, P.g); });
      el('circle', { cx: P.X(S0[0]), cy: P.Y(S0[1]), r: 5, fill: AMBER, stroke: '#fff', 'stroke-width': 1.5 }, svg);
      txt(svg, 10, 13, 'contours of the loss; orange: start; black: minimum', { anchor: 'start', size: fs(10), fill: c.muted });
      var L2 = narrow ? 44 : 10 + S + 50, T2 = narrow ? Hh + 64 : 40, B2 = narrow ? T2 + 140 : Math.max(Hh, 200) - 10;
      var Q = logPanel(svg, c, fs, L2, W - 12, T2, B2, -3, 2, N, 'loss after each step (log scale)');
      series(svg, Q, Ls, RED, 2.2);
      var fin = Ls[N], verdict = lr > 0.04 ? 'Above 0.04 the steps across the narrow direction overshoot by more each time and the path <strong>diverges</strong>.' : lr > 0.03 ? 'The path <strong>zigzags</strong> across the steep walls of the valley while creeping along its floor, but still converges.' : lr < 0.01 ? 'The steps are safe but <strong>tiny</strong>: after 60 steps the path is still far from the minimum along the shallow direction.' : 'A good compromise: fast progress along the valley without wild oscillation.';
      out.innerHTML = 'Learning rate ' + fmt(lr, 3) + ': loss after 60 steps <strong>' + (isFinite(fin) && fin < 1e6 ? (fin < 0.001 ? fin.toExponential(1) : fmt(fin, 3)) : 'diverged') + '</strong> (start ' + fmt(Ls[0], 2) + ').' + NOTE + verdict + ' The valley is 50 times steeper across than along, and the largest stable learning rate is 2 divided by the steepest curvature: 2/50 = 0.04.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: an optimiser race
     ----------------------------------------------------------------------- */
  FIG['fig-ml-optim'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var OPTS = [['SGD', 'sgd', 0.03, RED], ['Momentum', 'mom', 0.02, AMBER], ['RMSProp', 'rms', 0.03, GREEN], ['Adam', 'adam', 0.1, PURPLE]], S0 = [-2.6, -1.1];
    var mult = 1, noisy = false, MAX = 150, st, running = false;
    function reset() { st = OPTS.map(function (o) { return { p: S0.slice(), f: Opt(o[1], o[2] * mult), pts: [S0.slice()], L: [valF(S0[0], S0[1])], hit: -1 }; }); running = false; bRun.textContent = 'Run'; draw(); }
    var rng = rngSeed(3);
    function adv(n) { for (var k = 0; k < n && st[0].pts.length <= MAX; k++) { var e1 = noisy ? 3 * gaussR(rng) : 0, e2 = noisy ? 3 * gaussR(rng) : 0; st.forEach(function (s) { var g = valG(s.p[0], s.p[1]); g[0] += e1; g[1] += e2; s.f(s.p, g); s.pts.push(s.p.slice()); var v = valF(s.p[0], s.p[1]); s.L.push(v); if (s.hit < 0 && v < 1e-3) s.hit = s.pts.length - 1; }); } }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'op-m', label: 'Step-size multiplier', min: 0.25, max: 2, step: 0.25, value: mult, onChange: function (x) { mult = x; rng = rngSeed(3); reset(); } });
    choice(controls, 'Gradients', ['Exact', 'Noisy'], 0, function (i) { noisy = i === 1; rng = rngSeed(3); reset(); });
    var row = group(controls, 'Race');
    var bRun = btn('Run', row); bRun.addEventListener('click', function () { if (st[0].pts.length > MAX) { rng = rngSeed(3); reset(); } running = !running; bRun.textContent = running ? 'Pause' : 'Run'; });
    btn('All 150 steps', row).addEventListener('click', function () { adv(MAX); draw(); });
    btn('Reset', row).addEventListener('click', function () { rng = rngSeed(3); reset(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560;
      var S = narrow ? W0 - 20 : Math.min(W0 * 0.52, 420), Hh = S * 2 / 3;
      var A = newSVG(svgWrap, container, narrow ? Math.round(Hh + 250) : Math.round(Math.max(Hh + 30, 240)), 'Paths and losses of four optimisers'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(mult, 2) + '×');
      var P = valleyPanel(svg, c, 10, 20, S, Hh, 'op-clip');
      st.forEach(function (s, i) { el('path', { d: pathD(P, s.pts), fill: 'none', stroke: OPTS[i][3], 'stroke-width': 2 }, P.g); var q = s.pts[s.pts.length - 1]; el('circle', { cx: P.X(Math.max(-50, Math.min(50, q[0]))), cy: P.Y(Math.max(-50, Math.min(50, q[1]))), r: 4.5, fill: OPTS[i][3], stroke: '#fff', 'stroke-width': 1 }, P.g); });
      txt(svg, 10, 13, narrow ? 'red SGD · amber momentum · green RMSProp · purple Adam' : 'red: SGD · amber: momentum · green: RMSProp · purple: Adam', { anchor: 'start', size: fs(10), fill: c.muted });
      var L2 = narrow ? 44 : 10 + S + 50, T2 = narrow ? Hh + 64 : 40, B2 = narrow ? T2 + 140 : Math.max(Hh, 200) - 10;
      var Q = logPanel(svg, c, fs, L2, W - 12, T2, B2, -8, 2, MAX, 'loss (log scale)');
      st.forEach(function (s, i) { series(svg, Q, s.L, OPTS[i][3], 2); });
      var n = st[0].pts.length - 1;
      out.innerHTML = 'Step <strong>' + n + '</strong>. ' + st.map(function (s, i) { var v = s.L[n]; return OPTS[i][0] + ' (rate ' + fmt(OPTS[i][2] * mult, 3) + '): ' + (s.hit >= 0 ? 'loss below 0.001 at step <strong>' + s.hit + '</strong>' : 'loss <strong>' + (isFinite(v) && v < 1e6 ? (v < 0.001 ? v.toExponential(1) : fmt(v, 3)) : 'diverged') + '</strong>'); }).join('; ') + '.' + NOTE + 'Momentum builds up speed along the valley floor and damps the zigzag. RMSProp and Adam divide each step by the recent size of that coordinate’s gradient, so steep and shallow directions get similar steps. With noisy gradients, none of them settles exactly: they jitter around the minimum at a distance set by the step size.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function () { if (!running) return; adv(2); if (st[0].pts.length > MAX) { running = false; bRun.textContent = 'Run'; } draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure: mini-batch size
     ----------------------------------------------------------------------- */
  FIG['fig-ml-batch'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = linData(), BS = [1, 4, 16, 64, 512], bi = 1, lr = 0.05;
    var A0 = D.map(function (p) { return [1, p[0]]; }), opt = lstsq(A0, D.map(function (p) { return p[1]; }));
    var mx = mean(D.map(function (p) { return p[0]; })), mxx = mean(D.map(function (p) { return p[0] * p[0]; }));
    function lossAt(w) { var s = 0; D.forEach(function (p) { var e = w[0] + w[1] * p[0] - p[1]; s += e * e; }); return s / D.length; }
    var Lopt = lossAt(opt);
    var controls = div('fig-controls', container);
    choice(controls, 'Batch size', BS.map(String), bi, function (i) { bi = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'bt-lr', label: 'Learning rate', min: 0.01, max: 0.5, step: 0.01, value: lr, onChange: function (x) { lr = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560, S = narrow ? W0 - 20 : Math.min(W0 - 20, 520), Hh = S * 0.55;
      var A = newSVG(svgWrap, container, Math.round(Hh + 30), 'Stochastic gradient descent paths for a mini-batch size'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(lr, 2));
      var B = BS[bi], w = [-1.5, -1], r = rngSeed(4), pts = [w.slice()], ups = 0;
      for (var ep = 0; ep < 3; ep++) {
        var idx = D.map(function (_, i) { return i; });
        for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
        for (var s = 0; s < 512; s += B) { var g = [0, 0]; for (var k = s; k < s + B; k++) { var p = D[idx[k]], e = w[0] + w[1] * p[0] - p[1]; g[0] += 2 * e / B; g[1] += 2 * e * p[0] / B; } w[0] -= lr * g[0]; w[1] -= lr * g[1]; ups++; pts.push(w.slice()); }
      }
      var L = 10, T = 20, bl = -2, bh = 2.5, wl = -1.5, wh = 3, X = function (b) { return L + (b - bl) / (bh - bl) * S; }, Y = function (v) { return T + (wh - v) / (wh - wl) * Hh; };
      var cp = el('clipPath', { id: 'bt-clip' }, svg); el('rect', { x: L, y: T, width: S, height: Hh }, cp); var gg = el('g', { 'clip-path': 'url(#bt-clip)' }, svg);
      el('rect', { x: L, y: T, width: S, height: Hh, fill: c.surface }, gg);
      /* contours of excess loss d' M d with M = [[1, mx], [mx, mxx]] */
      var a = 1, bb = mx, cc = mxx, tr = a + cc, det = a * cc - bb * bb, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det), ang = Math.atan2(l1 - a, bb);
      [0.01, 0.05, 0.2, 0.6, 1.5, 3, 6].forEach(function (lev) { var d = ''; for (var q = 0; q <= 72; q++) { var th = 2 * Math.PI * q / 72, u = Math.sqrt(lev / l1) * Math.cos(th), v = Math.sqrt(lev / l2) * Math.sin(th), db = Math.cos(ang) * u - Math.sin(ang) * v, dw = Math.sin(ang) * u + Math.cos(ang) * v; d += (q ? 'L' : 'M') + X(opt[0] + db).toFixed(1) + ' ' + Y(opt[1] + dw).toFixed(1); } el('path', { d: d, fill: 'none', stroke: c.border }, gg); });
      var d2 = ''; pts.forEach(function (q, i) { d2 += (i ? 'L' : 'M') + X(Math.max(-20, Math.min(20, q[0]))).toFixed(1) + ' ' + Y(Math.max(-20, Math.min(20, q[1]))).toFixed(1); });
      el('path', { d: d2, fill: 'none', stroke: BLUE, 'stroke-width': B === 1 ? 0.8 : 1.6, opacity: 0.9 }, gg);
      el('circle', { cx: X(opt[0]), cy: Y(opt[1]), r: 4, fill: c.ink }, gg);
      el('circle', { cx: X(-1.5), cy: Y(-1), r: 5, fill: AMBER, stroke: '#fff', 'stroke-width': 1.5 }, svg);
      var q = pts[pts.length - 1]; el('circle', { cx: X(Math.max(-20, Math.min(20, q[0]))), cy: Y(Math.max(-20, Math.min(20, q[1]))), r: 5, fill: BLUE, stroke: '#fff', 'stroke-width': 1.5 }, gg);
      el('rect', { x: L, y: T, width: S, height: Hh, fill: 'none', stroke: c.border }, svg);
      txt(svg, L, 13, 'intercept (across) and slope (up) of a fitted line; orange: start; black: best fit', { anchor: 'start', size: fs(10), fill: c.muted });
      var ex = lossAt(w) - Lopt;
      out.innerHTML = 'Batch size ' + B + ', 3 passes over the 512 points: <strong>' + ups + '</strong> updates; excess loss at the end <strong>' + (isFinite(ex) && ex < 1e6 ? (ex < 0.01 ? ex.toExponential(1) : fmt(ex, 3)) : 'diverged') + '</strong>.' + NOTE + 'Each update uses the gradient of a random mini-batch, a noisy estimate of the full gradient. Small batches make many cheap, noisy updates; the full batch (512) makes one exact update per pass, only 3 in all. For the same amount of computation, intermediate batches get closest. Larger batches tolerate larger learning rates: try 512 with a rate of 0.5.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: learning-rate schedules
     ----------------------------------------------------------------------- */
  FIG['fig-ml-sched'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NAMES = ['Constant', 'Step decay', 'Cosine', 'Warm-up + cosine', 'One-cycle'], si = 2, base = 0.03, N = 400;
    function sched(k, t) {
      var x = t / N;
      if (k === 0) return 1;
      if (k === 1) return x < 0.5 ? 1 : x < 0.75 ? 0.1 : 0.01;
      if (k === 2) return 0.5 * (1 + Math.cos(Math.PI * x));
      if (k === 3) return x < 0.1 ? x / 0.1 : 0.5 * (1 + Math.cos(Math.PI * (x - 0.1) / 0.9));
      return x < 0.3 ? 0.1 + 0.9 * x / 0.3 : 0.5 * (1 + Math.cos(Math.PI * (x - 0.3) / 0.7)) * 0.999 + 0.001;
    }
    function run(k) { var p = [-2.6, -1.1], r = rngSeed(9), L = [valF(p[0], p[1])]; for (var t = 0; t < N; t++) { var g = valG(p[0], p[1]), a = base * sched(k, t); p[0] -= a * (g[0] + 3 * gaussR(r)); p[1] -= a * (g[1] + 3 * gaussR(r)); L.push(valF(p[0], p[1])); } return L; }
    var controls = div('fig-controls', container);
    choice(controls, 'Schedule', NAMES, si, function (i) { si = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'sc-b', label: 'Peak learning rate', min: 0.005, max: 0.04, step: 0.005, value: base, onChange: function (x) { base = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 420 : 230, 'Learning-rate schedule and the resulting loss with noisy gradients'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(base, 3));
      var L1 = 44, R1 = narrow ? W - 12 : W * 0.42, T1 = 30, B1 = narrow ? 150 : 190;
      var X1 = function (t) { return L1 + t / N * (R1 - L1); }, Y1 = function (v) { return B1 - v * (B1 - T1); };
      [0, 0.5, 1].forEach(function (v) { el('line', { x1: L1, y1: Y1(v), x2: R1, y2: Y1(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L1 - 5, Y1(v) + 4, v === 0 ? '0' : v === 1 ? 'peak' : '½', { anchor: 'end', size: fs(9), fill: c.muted }); });
      [0, 200, 400].forEach(function (v) { txt(svg, X1(v), B1 + 14, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, L1, T1 - 10, 'learning rate during training', { anchor: 'start', size: fs(10), fill: c.ink2 });
      var d = ''; for (var t = 0; t <= N; t++) d += (t ? 'L' : 'M') + X1(t).toFixed(1) + ' ' + Y1(sched(si, Math.min(t, N - 1))).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, svg);
      var L2 = narrow ? 44 : W * 0.42 + 56, T2 = narrow ? 230 : 30, B2 = narrow ? 380 : 190;
      var Q = logPanel(svg, c, fs, L2, W - 12, T2, B2, -4, 1, N, 'loss (log scale; grey: constant rate)');
      var LC = run(0), LS = run(si);
      series(svg, Q, LC, c.muted, 1.2); series(svg, Q, LS, BLUE, 2);
      function tailMean(a) { var s = 0; for (var k = N - 49; k <= N; k++) s += a[k]; return s / 50; }
      var fC = tailMean(LC), fS = tailMean(LS);
      out.innerHTML = NAMES[si] + ': average loss over the last 50 steps <strong>' + (fS < 0.01 ? fS.toExponential(1) : fmt(fS, 3)) + '</strong> (constant rate: ' + (fC < 0.01 ? fC.toExponential(1) : fmt(fC, 3)) + ').' + NOTE + 'With noisy gradients, a constant learning rate makes fast progress at first but then bounces around the minimum at a level set by the rate. Lowering the rate as training proceeds shrinks the bounce. Warm-up starts small to avoid unstable early steps, which matters most for large models and large batches.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the learning-rate range test
     ----------------------------------------------------------------------- */
  FIG['fig-ml-lrfind'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NS = 300, curve = (function () { var n = RegNet(40, 11), out = [], ema = null; for (var i = 0; i <= NS; i++) { var lr = 1e-4 * Math.pow(1e5, i / NS), L = n.step(XTR, YTR, lr, 0, 0, true); if (!isFinite(L) || L > 1e6) { out.push([lr, Infinity]); continue; } ema = ema === null ? L : 0.8 * ema + 0.2 * L; out.push([lr, ema]); } return out; })();
    var pick = -1.5;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'lf-p', label: 'Learning rate to read off (log₁₀)', min: -4, max: 0, step: 0.1, value: pick, onChange: function (x) { pick = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Training loss as the learning rate is increased step by step'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(Math.pow(10, pick), pick < -2.5 ? 4 : 3));
      var L = 48, R = W - 14, T = 26, B = 220, X = function (lr) { return L + (Math.log10(lr) + 4) / 5 * (R - L); }, Y = function (v) { return B - (Math.log10(Math.min(v, 10)) + 2) / 3 * (B - T); };
      [-2, -1, 0, 1].forEach(function (e) { el('line', { x1: L, y1: Y(Math.pow(10, e)), x2: R, y2: Y(Math.pow(10, e)), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, L - 5, Y(Math.pow(10, e)) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      [-4, -3, -2, -1, 0, 1].forEach(function (e) { var t = txt(svg, X(Math.pow(10, e)), B + 15, '', { size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      txt(svg, (L + R) / 2, B + 32, 'learning rate (increased every step)', { size: fs(10), fill: c.muted });
      txt(svg, L, 13, 'smoothed training loss (log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      var d = '', blow = null, best = [Infinity, 0];
      curve.forEach(function (q, i) { if (!isFinite(q[1]) || q[1] > 10) { if (blow === null) blow = q[0]; return; } if (blow === null) { d += (d ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); if (q[1] < best[0]) best = [q[1], q[0]]; } });
      el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, svg);
      if (blow) { el('line', { x1: X(blow), y1: T, x2: X(blow), y2: B, stroke: RED, 'stroke-dasharray': '4 3' }, svg); txt(svg, X(blow) + 4, T + 12, 'diverges', { anchor: 'start', size: fs(9), fill: RED }); }
      var rec = best[1] / 3; el('rect', { x: X(rec / 3), y: T, width: X(rec) - X(rec / 3), height: B - T, fill: GREEN, opacity: 0.12 }, svg);
      var lr = Math.pow(10, pick), qi = Math.round((pick + 4) / 5 * NS), qv = curve[Math.max(0, Math.min(NS, qi))][1];
      el('line', { x1: X(lr), y1: T, x2: X(lr), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      if (isFinite(qv) && qv <= 10) el('circle', { cx: X(lr), cy: Y(qv), r: 5, fill: BLUE, stroke: '#fff', 'stroke-width': 1.2 }, svg);
      out.innerHTML = 'At a learning rate of ' + fmt(lr, lr < 0.01 ? 4 : 3) + ' the smoothed loss is <strong>' + (isFinite(qv) && qv < 1e6 ? fmt(qv, 3) : 'diverged') + '</strong>. Lowest loss near ' + fmt(best[1], 3) + '; training blows up above about ' + fmt(blow || 1, 2) + '.' + NOTE + 'A short trial run that multiplies the learning rate a little at every step. The loss barely moves at tiny rates, falls fastest over a middle range, and explodes beyond a threshold. A good choice (green band) sits a few times below the point of lowest loss, comfortably short of the blow-up.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: activations through a deep network, with and without normalisation
     ----------------------------------------------------------------------- */
  FIG['fig-ml-deep'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ai = 1, ii = 1, ni = 0, cache = {};
    var controls = div('fig-controls', container);
    choice(controls, 'Activation', ['Tanh', 'ReLU'], ai, function (i) { ai = i; draw(); });
    choice(controls, 'Initial weights', ['Too small (½×)', 'Standard (Xavier / He)', 'Too large (2×)'], ii, function (i) { ii = i; draw(); });
    choice(controls, 'Normalisation', ['None', 'Normalise each layer'], ni, function (i) { ni = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Typical size of the activations at each of 20 layers'), W = A.W, svg = A.svg, fs = A.fs;
      var act = ai ? 'relu' : 'tanh', sc = (ai ? Math.SQRT2 : 1) * [0.5, 1, 2][ii], key = act + sc + ni;
      if (!cache[key]) cache[key] = deepProbe(20, act, sc, ni === 1);
      var o = cache[key];
      var L = 48, R = W - 12, T = 26, B = 200, lo = -8, hi = 6, n = 20, bw = (R - L) / n, Y = function (v) { return B - (Math.max(lo, Math.min(hi, Math.log10(v))) - lo) / (hi - lo) * (B - T); };
      [-8, -6, -4, -2, 0, 2, 4, 6].forEach(function (e) { el('line', { x1: L, y1: Y(Math.pow(10, e)), x2: R, y2: Y(Math.pow(10, e)), stroke: e === 0 ? c.muted : c.border, 'stroke-width': e === 0 ? 1 : 0.5 }, svg); var t = txt(svg, L - 5, Y(Math.pow(10, e)) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      o.forEach(function (q, l) { var col = q.sd < 0.05 ? RED : q.sd > 5 ? PURPLE : q.bad > 0.25 && act === 'tanh' ? AMBER : GREEN; el('rect', { x: L + l * bw + 2, y: Y(q.sd), width: bw - 4, height: Math.max(1, B - Y(q.sd)), fill: col, opacity: 0.85 }, svg); });
      txt(svg, L, B + 15, 'layer 1', { anchor: 'start', size: fs(9), fill: c.muted }); txt(svg, R, B + 15, 'layer 20', { anchor: 'end', size: fs(9), fill: c.muted });
      txt(svg, L, 13, W < 520 ? 'size of the activations at each layer (log scale)' : 'standard deviation of the activations at each layer (log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      var last = o[19];
      var msg = last.sd < 0.05 ? 'The signal <strong>shrinks</strong> layer after layer: by layer 20 almost nothing is left, and the gradients shrink with it.' : last.sd > 5 ? 'The signal <strong>explodes</strong>, growing by a constant factor at every layer.' : act === 'tanh' && last.bad > 0.25 ? 'The size holds, but many tanh units are <strong>saturated</strong> (|output| &gt; 0.99), where their gradient is nearly zero.' : 'The signal keeps a <strong>steady size</strong> through all 20 layers.';
      function sci(v) { if (v >= 0.01 && v < 1000) return fmt(v, v < 0.1 ? 3 : v < 10 ? 2 : 0); var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return fmt(m, 1) + ' × 10<sup>' + e + '</sup>'; }
      out.innerHTML = 'Layer 1: ' + sci(o[0].sd) + '; layer 10: ' + sci(o[9].sd) + '; layer 20: <strong>' + sci(last.sd) + '</strong>' + (act === 'tanh' ? ' (saturated units at layer 20: ' + Math.round(last.bad * 100) + '%)' : ' (inactive ReLU outputs at layer 20: ' + Math.round(last.bad * 100) + '%)') + '.' + NOTE + msg + ' A random network 64 units wide, fed 128 random inputs. Normalising each layer’s pre-activations to mean 0 and standard deviation 1 (as layer normalisation does; batch normalisation averages over the mini-batch instead) keeps the size steady whatever the initial weights.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: overfitting and regularisation
     ----------------------------------------------------------------------- */
  FIG['fig-ml-reg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var WDS = [0, 0.01, 0.03, 0.1, 0.3, 1, 3], wi = 0, drop = 0, MAX = 4000, net, tr, va, best, running = false;
    function reset() { net = RegNet(40, 11); tr = [mseF(net.f, XTR, YTR)]; va = [mseF(net.f, XTE, YTE)]; best = [va[0], 0]; running = false; bRun.textContent = 'Train'; draw(); }
    function adv(n) { for (var k = 0; k < n && net.steps() < MAX; k++) { net.step(XTR, YTR, 0.01, WDS[wi], drop); if (net.steps() % 20 === 0) { tr.push(mseF(net.f, XTR, YTR)); var v = mseF(net.f, XTE, YTE); va.push(v); if (v < best[0]) best = [v, net.steps()]; } } }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rg-w', label: 'Weight decay', min: 0, max: 6, step: 1, value: wi, onChange: function (x) { wi = x; reset(); } });
    var s2 = FIG.slider(controls, { id: 'rg-d', label: 'Dropout rate', min: 0, max: 0.5, step: 0.1, value: drop, onChange: function (x) { drop = x; reset(); } });
    var row = group(controls, 'Training (40 tanh units, Adam)');
    var bRun = btn('Train', row); bRun.addEventListener('click', function () { if (net.steps() >= MAX) reset(); running = !running; bRun.textContent = running ? 'Pause' : 'Train'; });
    btn('All 4,000 steps', row).addEventListener('click', function () { adv(MAX); draw(); });
    btn('Reset', row).addEventListener('click', reset);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 250, 'Fitted curve and training and validation error during training'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(WDS[wi])); valText(s2, fmt(drop, 1));
      var R1 = narrow ? W - 12 : W * 0.5, P = plotFrame(svg, c, fs, 40, R1, 30, 200, -1.5, 1.5, [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], 'x');
      curve(svg, P, truth, c.muted, 1.5, 0.8);
      XTE.forEach(function (x, i) { el('rect', { x: P.X(x) - 2.5, y: P.Y(YTE[i]) - 2.5, width: 5, height: 5, fill: 'none', stroke: c.muted, 'stroke-width': 1 }, svg); });
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE, stroke: '#fff', 'stroke-width': 1 }, svg); });
      var cp = el('clipPath', { id: 'rg-clip' }, svg); el('rect', { x: 40, y: 30, width: R1 - 40, height: 170 }, cp);
      var d = ''; for (var k = 0; k <= 300; k++) { var x = k / 300; d += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(net.f(x)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.2, 'clip-path': 'url(#rg-clip)' }, svg);
      txt(svg, 40, 13, narrow ? 'blue: training · squares: validation · red: network' : 'blue: 15 training points · squares: 60 validation points · grey: truth · red: network', { anchor: 'start', size: fs(10), fill: c.muted });
      var L2 = narrow ? 48 : W * 0.5 + 56, T2 = narrow ? 270 : 30, B2 = narrow ? 420 : 200;
      var Q = logPanel(svg, c, fs, L2, W - 12, T2, B2, -3, 1, MAX / 20, 'error (log scale): blue training, amber validation', 'steps ÷ 20');
      series(svg, Q, tr, BLUE, 2); series(svg, Q, va, AMBER, 2.2);
      if (best[1] > 0) { el('line', { x1: Q.X(best[1] / 20), y1: T2, x2: Q.X(best[1] / 20), y2: B2, stroke: GREEN, 'stroke-dasharray': '4 3' }, svg); }
      var n = tr.length - 1;
      out.innerHTML = 'Step <strong>' + net.steps() + '</strong>: training error <strong>' + fmt(tr[n], 4) + '</strong>, validation error <strong>' + fmt(va[n], 3) + '</strong>; lowest validation error so far ' + fmt(best[0], 3) + ' at step ' + best[1] + ' (green line).' + NOTE + 'The noise in the data has variance 0.0625, so a validation error near 0.06 is as good as it gets. Without regularisation the network passes through every training point and its validation error climbs. Early stopping keeps the weights from the green line; weight decay pulls weights towards zero; dropout randomly silences hidden units at each step. Too much of either makes the curve too stiff to follow the data.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function () { if (!running) return; adv(40); if (net.steps() >= MAX) { running = false; bRun.textContent = 'Train'; } draw(); });
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What happens if the learning rate is too large?', options: ['Training is slow but safe', 'Steps overshoot the minimum and training can diverge', 'The network gets more layers', 'Nothing changes'], answer: 1, explanation: 'On the valley of Figure 3, any rate above 0.1 diverges.' },
      { question: 'What does momentum do?', options: ['Adds random noise', 'Accumulates past gradients, speeding up progress along consistent directions and damping zigzags', 'Lowers the learning rate', 'Normalises the data'], answer: 1, explanation: 'Polyak’s heavy ball keeps rolling in directions where gradients agree.' },
      { question: 'Adam combines…', options: ['Dropout and batch normalisation', 'Momentum and per-parameter step sizes scaled by recent gradient magnitudes', 'Two networks', 'L1 and L2 penalties'], answer: 1, explanation: 'Kingma and Ba, 2015.' },
      { question: 'An epoch is…', options: ['One gradient step', 'One full pass through the training data', 'One layer', 'One hyperparameter'], answer: 1, explanation: 'With 512 examples and batches of 16, one epoch is 32 steps.' },
      { question: 'Why lower the learning rate late in training?', options: ['To save memory', 'To reduce the noisy bouncing around the minimum caused by mini-batch gradients', 'To add layers', 'It has no effect'], answer: 1, explanation: 'Figure 6: decaying schedules reach a lower loss than a constant rate.' },
      { question: 'What is warm-up?', options: ['Pre-training on another task', 'Starting with a small learning rate and increasing it over the first steps', 'Heating the GPU', 'Training twice'], answer: 1, explanation: 'It avoids unstable early steps, especially with large batches and transformers.' },
      { question: 'Batch normalisation…', options: ['Removes bad examples', 'Normalises each layer’s inputs using mini-batch statistics, then rescales them with learned parameters', 'Sets all weights to one', 'Replaces the loss'], answer: 1, explanation: 'Ioffe and Szegedy, 2015.' },
      { question: 'Dropout works by…', options: ['Deleting training examples', 'Randomly silencing hidden units during training', 'Removing layers after training', 'Stopping early'], answer: 1, explanation: 'At test time all units are used.' },
      { question: 'Early stopping means…', options: ['Training for a fixed tiny number of steps', 'Keeping the weights from the point where validation error was lowest', 'Stopping when training error is zero', 'Using a smaller network'], answer: 1, explanation: 'In Figure 9, validation error is lowest near step 600 without regularisation.' },
      { question: 'Gradient clipping is used to…', options: ['Speed up the forward pass', 'Limit the size of occasional huge gradients so they do not wreck training', 'Remove small gradients', 'Prune the network'], answer: 1, explanation: 'Common in recurrent networks and transformers (Pascanu, Mikolov and Bengio, 2013).' }
    ]);
  };
})();
