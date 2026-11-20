/* ==========================================================================
   RNLearn — Loss Functions (Inside the Machine, Part 7)
   Figures:
     fig-ml-map         The map of the series
     fig-ml7-timeline   The story at a glance
     fig-ml-onenum      Fitting one number
     fig-ml-robust      A line fitted with three losses
     fig-ml-ce          Cross-entropy and squared error on a sigmoid output
     fig-ml-wrong       Starting confidently wrong
     fig-ml-softmax     Softmax, temperature and label smoothing
     fig-ml-margin      Classification losses as functions of the margin
     fig-ml-focal       Focal loss and the weight of easy examples
     fig-ml-proper      Proper and improper scoring rules
     fig-quiz-ml7       Test yourself
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
    { name: 'Errors and likelihood', color: '#b45309' },
    { name: 'Information and scoring', color: '#1d4ed8' },
    { name: 'Losses for learning machines', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1805', icon: '📏', era: 0, sec: 4, title: 'Least squares', text: 'Adrien-Marie Legendre publishes the method of least squares for fitting the orbits of comets: choose the line that minimises the sum of squared errors.' },
    { year: '1809', icon: '🔔', era: 0, sec: 6, title: 'Gauss and the normal curve', text: 'Carl Friedrich Gauss justifies least squares by assuming normally distributed errors, linking a loss to a probability model.' },
    { year: '1922', icon: '🎯', era: 0, sec: 6, title: 'Maximum likelihood', text: 'Ronald Fisher sets out maximum likelihood estimation: choose the parameters that make the observed data most probable.' },
    { year: '1948', icon: '📡', era: 1, sec: 7, title: 'Entropy', text: 'Claude Shannon defines the entropy of a source of information, the quantity behind cross-entropy.' },
    { year: '1950', icon: '🌦️', era: 1, sec: 11, title: 'The Brier score', text: 'Glenn Brier proposes scoring probability forecasts of the weather by their squared error.' },
    { year: '1951', icon: '↔️', era: 1, sec: 7, title: 'KL divergence', text: 'Solomon Kullback and Richard Leibler define a measure of how one probability distribution differs from another.' },
    { year: '1964', icon: '🛡️', era: 1, sec: 5, title: 'Robust estimation', text: 'Peter Huber introduces a loss that is squared for small errors and linear for large ones, limiting the pull of outliers.' },
    { year: '1978', icon: '📊', era: 1, sec: 12, title: 'Quantile regression', text: 'Roger Koenker and Gilbert Bassett show how a tilted absolute loss estimates any quantile, not just the mean.' },
    { year: '1990', icon: '🔢', era: 2, sec: 8, title: 'Softmax', text: 'John Bridle names the softmax and interprets network outputs as probabilities trained by cross-entropy.' },
    { year: '1995', icon: '📐', era: 2, sec: 9, title: 'The hinge loss', text: 'Corinna Cortes and Vladimir Vapnik’s soft-margin support vector machine minimises the hinge loss.' },
    { year: '2016', icon: '🧈', era: 2, sec: 8, title: 'Label smoothing', text: 'Christian Szegedy and colleagues soften the training targets of an image classifier so that it is less overconfident.' },
    { year: '2017', icon: '🔦', era: 2, sec: 10, title: 'Focal loss', text: 'Tsung-Yi Lin and colleagues down-weight easy examples so that an object detector can learn from rare, hard ones.' }
  ];

  FIG['fig-ml7-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1805 to 2017');
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

  var ML_PART = 7;
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
     Loss functions and small fitting routines
     ----------------------------------------------------------------------- */
  function sgm(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  /* Huber loss with threshold dl: squared near zero, linear beyond dl */
  function huberRaw(r, dl) { var a = Math.abs(r); return a <= dl ? 0.5 * r * r : dl * (a - 0.5 * dl); }
  /* Minimise sum of a loss over a constant c (golden-section on a convex function) */
  function bestConst(ys, lossf) {
    var lo = Math.min.apply(null, ys) - 1, hi = Math.max.apply(null, ys) + 1, g = (Math.sqrt(5) - 1) / 2;
    function F(c) { var s = 0; for (var i = 0; i < ys.length; i++) s += lossf(ys[i] - c); return s; }
    var a = lo, b = hi, x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = F(x1), f2 = F(x2);
    for (var k = 0; k < 120; k++) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = F(x1); } else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = F(x2); } }
    return (a + b) / 2;
  }
  /* Robust straight-line fits by iteratively reweighted least squares */
  function lineFit(P, kind, dl) {
    var w = P.map(function () { return 1; }), c = [0, 0];
    for (var it = 0; it < (kind === 'mse' ? 1 : 200); it++) {
      var A = [], y = [];
      P.forEach(function (p, i) { var s = Math.sqrt(w[i]); A.push([s, s * p[0]]); y.push(s * p[1]); });
      c = lstsq(A, y);
      P.forEach(function (p, i) { var r = Math.abs(p[1] - c[0] - c[1] * p[0]); w[i] = kind === 'huber' ? (r <= dl ? 1 : dl / r) : 1 / Math.max(r, 1e-6); });
    }
    return c;
  }
  function robustData(k) {
    var r = rngSeed(21), P = [];
    for (var i = 0; i < 30; i++) { var x = r(); P.push([x, 1 + 2 * x + 0.25 * gaussR(r), 0]); }
    var r2 = rngSeed(5);
    for (i = 0; i < k; i++) { var x2 = 0.72 + 0.27 * r2(); P.push([x2, 1 + 2 * x2 - 3.5 - 0.5 * r2(), 1]); }
    return P;
  }

  /* -----------------------------------------------------------------------
     Figure: fitting one number with different losses
     ----------------------------------------------------------------------- */
  var BASE12 = [4.1, 4.5, 4.8, 5.0, 5.2, 5.4, 5.6, 5.8, 6.0, 6.3, 6.6, 6.7];
  FIG['fig-ml-onenum'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var o = 15, li = 0, dl = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'on-o', label: 'Outlier value', min: 5, max: 40, step: 0.5, value: o, onChange: function (x) { o = x; draw(); } });
    choice(controls, 'Loss', ['Squared', 'Absolute', 'Huber'], li, function (i) { li = i; draw(); });
    var s2 = FIG.slider(controls, { id: 'on-d', label: 'Huber threshold δ', min: 0.2, max: 4, step: 0.1, value: dl, onChange: function (x) { dl = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Data on a line and the total loss as a function of the fitted constant'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(o, 1)); valText(s2, fmt(dl, 1));
      var ys = BASE12.concat([o]), mu = mean(ys), md = median(ys), hb = bestConst(ys, function (r) { return huberRaw(r, dl); });
      var LF = [function (r) { return r * r; }, function (r) { return Math.abs(r); }, function (r) { return huberRaw(r, dl); }][li];
      var est = [mu, md, hb][li], col = [RED, BLUE, PURPLE][li];
      var L = 46, R = W - 16, lo = 3, hi = 41, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      /* top: number line */
      var yl = 44;
      txt(svg, L, 14, W < 520 ? 'values · ▼ red mean, blue median, purple Huber' : 'the 13 values (12 typical + 1 outlier) · triangles: mean (red), median (blue), Huber (purple)', { anchor: 'start', size: fs(10), fill: c.muted });
      el('line', { x1: L, y1: yl, x2: R, y2: yl, stroke: c.border }, svg);
      [5, 10, 15, 20, 25, 30, 35, 40].forEach(function (v) { el('line', { x1: X(v), y1: yl - 3, x2: X(v), y2: yl + 3, stroke: c.muted }, svg); txt(svg, X(v), yl + 16, String(v), { size: fs(9), fill: c.muted }); });
      BASE12.forEach(function (v) { el('circle', { cx: X(v), cy: yl, r: 4, fill: c.ink2, opacity: 0.7 }, svg); });
      el('circle', { cx: X(o), cy: yl, r: 6, fill: AMBER, stroke: '#fff', 'stroke-width': 1.5 }, svg);
      [[mu, RED, 'mean'], [md, BLUE, 'median'], [hb, PURPLE, 'Huber']].forEach(function (e, k) {
        el('path', { d: 'M' + X(e[0]) + ' ' + (yl - 8) + ' l-5 -9 l10 0 z', fill: e[1], opacity: k === li ? 1 : 0.45 }, svg);
      });
      /* bottom: total loss against c */
      var T = 86, B = 262, cl = 3, ch = 12, Xc = function (v) { return L + (v - cl) / (ch - cl) * (R - L); };
      var F = function (cc) { var s = 0; ys.forEach(function (y) { s += LF(y - cc); }); return s; }, fmax = 0, fmin = Infinity, k, vals = [];
      for (k = 0; k <= 200; k++) { var cc = cl + (ch - cl) * k / 200, v = F(cc); vals.push(v); fmax = Math.max(fmax, v); fmin = Math.min(fmin, v); }
      var Y = function (v) { return B - (v - fmin) / ((fmax - fmin) || 1) * (B - T); }, d = '';
      vals.forEach(function (v, j) { d += (j ? 'L' : 'M') + Xc(cl + (ch - cl) * j / 200).toFixed(1) + ' ' + Y(v).toFixed(1); });
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      for (k = 3; k <= 12; k++) txt(svg, Xc(k), B + 15, String(k), { size: fs(9), fill: c.muted });
      txt(svg, (L + R) / 2, B + 30, 'fitted constant c', { size: fs(10), fill: c.muted });
      txt(svg, L, T - 8, 'total ' + ['squared', 'absolute', 'Huber'][li] + (W < 520 ? ' loss for each c' : ' loss over the 13 values, for each choice of c'), { anchor: 'start', size: fs(10), fill: c.muted });
      el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 2.4 }, svg);
      if (est >= cl && est <= ch) { el('line', { x1: Xc(est), y1: T, x2: Xc(est), y2: B, stroke: col, 'stroke-dasharray': '4 3' }, svg); el('circle', { cx: Xc(est), cy: Y(F(est)), r: 5, fill: col }, svg); }
      var NOTES = ['Squared error is minimised by the <strong>mean</strong>. Every unit the outlier moves drags the mean by 1/13 of a unit: one wild value can move it anywhere.',
        'Absolute error is minimised by the <strong>median</strong>, the middle value. Once the outlier is above the typical values, moving it further changes nothing.',
        'The Huber loss is squared for errors smaller than δ and grows only linearly beyond. Small δ makes it behave like the median, large δ like the mean.'];
      out.innerHTML = 'Outlier at ' + fmt(o, 1) + ': mean <strong>' + fmt(mu, 2) + '</strong>, median <strong>' + fmt(md, 2) + '</strong>, Huber (δ = ' + fmt(dl, 1) + ') <strong>' + fmt(hb, 2) + '</strong>.' + NOTE + NOTES[li] + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a straight line fitted with squared, Huber and absolute loss
     ----------------------------------------------------------------------- */
  FIG['fig-ml-robust'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 4, dl = 0.5;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rb-k', label: 'Number of outliers', min: 0, max: 8, step: 1, value: k, onChange: function (x) { k = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'rb-d', label: 'Huber threshold δ', min: 0.1, max: 3, step: 0.1, value: dl, onChange: function (x) { dl = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Straight lines fitted to data with outliers'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(k)); valText(s2, fmt(dl, 1));
      var P = robustData(k), fits = [['Squared', RED, lineFit(P, 'mse')], ['Huber', PURPLE, lineFit(P, 'huber', dl)], ['Absolute', BLUE, lineFit(P, 'mae')]];
      var L = 40, R = W - 14, T = 26, B = 246, yl = -2, yh = 4, X = function (x) { return L + x * (R - L); }, Y = function (v) { return B - (v - yl) / (yh - yl) * (B - T); };
      [-2, -1, 0, 1, 2, 3, 4].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      el('line', { x1: X(0), y1: Y(1), x2: X(1), y2: Y(3), stroke: c.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      P.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(p[1]), r: p[2] ? 5 : 3.5, fill: p[2] ? AMBER : c.ink2, opacity: p[2] ? 1 : 0.7, stroke: '#fff', 'stroke-width': 0.8 }, svg); });
      fits.forEach(function (f) { el('line', { x1: X(0), y1: Y(f[2][0]), x2: X(1), y2: Y(f[2][0] + f[2][1]), stroke: f[1], 'stroke-width': 2.4 }, svg); });
      var narrow = W < 520;
      txt(svg, L, 14, narrow ? 'red: squared · purple: Huber · blue: absolute' : 'red: squared error · purple: Huber · blue: absolute error · dashed: true line y = 1 + 2x', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Slopes (true value 2): squared <strong>' + fmt(fits[0][2][1], 2) + '</strong>, Huber <strong>' + fmt(fits[1][2][1], 2) + '</strong>, absolute <strong>' + fmt(fits[2][2][1], 2) + '</strong>, with ' + k + ' outlier' + (k === 1 ? '' : 's') + ' among ' + P.length + ' points.' + NOTE + 'The 30 grey points follow y = 1 + 2x with noise; the orange outliers sit 3.5–4 below the line. Squared error weights each point by the square of its error, so a few distant points tilt the whole line. Huber and absolute loss cap the pull of each point and stay close to the truth.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: cross-entropy versus squared error on a sigmoid output
     ----------------------------------------------------------------------- */
  FIG['fig-ml-ce'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var z0 = -3;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ce-z', label: 'Logit z (true class y = 1)', min: -6, max: 6, step: 0.1, value: z0, onChange: function (x) { z0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function panel(svg, c, fs, L, R, T, B, title, fCE, fSE, yh, yt) {
      var lo = -6, hi = 6, X = function (z) { return L + (z - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - Math.max(0, Math.min(yh, v)) / yh * (B - T); };
      yt.forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 5, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [-6, -3, 0, 3, 6].forEach(function (v) { txt(svg, X(v), B + 14, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 28, 'logit z', { size: fs(9), fill: c.muted });
      txt(svg, L, T - 8, title, { anchor: 'start', size: fs(10), fill: c.ink2 });
      [[fCE, BLUE, null], [fSE, RED, '6 4']].forEach(function (q) { var d = ''; for (var k = 0; k <= 240; k++) { var z = lo + (hi - lo) * k / 240; d += (k ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(q[0](z)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: q[1], 'stroke-width': 2.4, 'stroke-dasharray': q[2] || 'none' }, svg); });
      el('line', { x1: X(z0), y1: T, x2: X(z0), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      el('circle', { cx: X(z0), cy: Y(fCE(z0)), r: 5, fill: BLUE }, svg); el('circle', { cx: X(z0), cy: Y(fSE(z0)), r: 5, fill: RED }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
    }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 250, 'Loss and gradient of cross-entropy and squared error'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(z0, 1));
      var ce = function (z) { return -Math.log(Math.max(sgm(z), 1e-300)); }, se = function (z) { var p = sgm(z); return (1 - p) * (1 - p); };
      var gce = function (z) { return 1 - sgm(z); }, gse = function (z) { var p = sgm(z); return 2 * (1 - p) * p * (1 - p); };
      txt(svg, 10, 12, 'blue: cross-entropy · red dashed: squared error', { anchor: 'start', size: fs(10), fill: c.muted });
      if (narrow) { panel(svg, c, fs, 34, W - 12, 46, 200, 'loss', ce, se, 6, [0, 2, 4, 6]); panel(svg, c, fs, 34, W - 12, 276, 430, 'size of the gradient pushing z up', gce, gse, 1, [0, 0.5, 1]); }
      else { var mid = W / 2; panel(svg, c, fs, 36, mid - 20, 46, 200, 'loss', ce, se, 6, [0, 2, 4, 6]); panel(svg, c, fs, mid + 34, W - 12, 46, 200, 'size of the gradient pushing z up', gce, gse, 1, [0, 0.5, 1]); }
      var p = sgm(z0);
      out.innerHTML = 'z = ' + fmt(z0, 1) + ': predicted probability of the true class p = <strong>' + fmt(p, 4) + '</strong>. Cross-entropy loss ' + fmt(ce(z0), 3) + ', gradient ' + fmt(gce(z0), 4) + '; squared-error loss ' + fmt(se(z0), 3) + ', gradient ' + fmt(gse(z0), 4) + (gse(z0) > 1e-9 ? ' (' + fmt(gce(z0) / gse(z0), 1) + ' times smaller).' : '.') + NOTE + 'For cross-entropy the gradient with respect to z is simply 1 − p: the more wrong the prediction, the harder the push. Squared error multiplies by the sigmoid’s slope p(1 − p), which vanishes when the network is confidently wrong, so it learns slowest exactly when it most needs to.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: starting confidently wrong — cross-entropy vs squared error
     ----------------------------------------------------------------------- */
  FIG['fig-ml-wrong'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = makeData('blobs'), sc = 1, MAX = 500, LR = 0.5, wC, wS, hC, hS, running = false;
    function acc(w) { var ok = 0; D.train.forEach(function (p) { if ((w[0] + w[1] * p[0] + w[2] * p[1] >= 0 ? 1 : 0) === p[2]) ok++; }); return ok / D.train.length; }
    function stepW(w, kind) { var g = [0, 0, 0]; D.train.forEach(function (p) { var q = sgm(w[0] + w[1] * p[0] + w[2] * p[1]), e = q - p[2], d = kind ? 2 * e * q * (1 - q) : e; g[0] += d; g[1] += d * p[0]; g[2] += d * p[1]; }); for (var k = 0; k < 3; k++) w[k] -= LR * g[k] / D.train.length; }
    function reset() { wC = [2 * sc, -8 * sc, 7 * sc]; wS = wC.slice(); hC = [acc(wC)]; hS = [acc(wS)]; running = false; bRun.textContent = 'Train'; draw(); }
    function adv(n) { for (var k = 0; k < n && hC.length <= MAX; k++) { stepW(wC, 0); stepW(wS, 1); hC.push(acc(wC)); hS.push(acc(wS)); } }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'wr-s', label: 'How confidently wrong at the start', min: 0, max: 2, step: 0.25, value: sc, onChange: function (x) { sc = x; reset(); } });
    var row = group(controls, 'Training (plain gradient descent)');
    var bRun = btn('Train', row); bRun.addEventListener('click', function () { if (hC.length > MAX) reset(); running = !running; bRun.textContent = running ? 'Pause' : 'Train'; });
    btn('+50 steps', row).addEventListener('click', function () { adv(50); draw(); });
    btn('Reset', row).addEventListener('click', reset);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560, S = narrow ? Math.min((W0 - 24) / 2 - 6, 170) : Math.min((W0 - 40) * 0.24, 190), Hh = S * 0.76, T = 34;
      var A = newSVG(svgWrap, container, narrow ? Math.round(T + Hh + 50 + 200 + 36) : 260, 'Decision boundaries and accuracy for cross-entropy and squared error'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, sc === 0 ? '0 (neutral)' : fmt(sc, 2) + '×');
      [[wC, 'cross-entropy', 0], [wS, 'squared error', 1]].forEach(function (q) {
        var w = q[0], L = 10 + q[2] * (S + 14);
        drawClfPanel(svg, c, function (x, y) { return sgm(w[0] + w[1] * x + w[2] * y); }, D, L, T, S, Hh, { grid: 36, test: false });
        txt(svg, L + S / 2, T - 12, q[1], { size: fs(10), fill: q[2] ? RED : BLUE, weight: 600 });
      });
      var L2 = narrow ? 40 : 10 + 2 * (S + 14) + 34, R2 = W - 12, T2 = narrow ? T + Hh + 50 : T, B2 = narrow ? T2 + 200 : 222;
      var X = function (t) { return L2 + t / MAX * (R2 - L2); }, Y = function (a) { return B2 - a * (B2 - T2); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L2, y1: Y(v), x2: R2, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L2 - 5, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      [0, 250, 500].forEach(function (v) { txt(svg, X(v), B2 + 14, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, (L2 + R2) / 2, B2 + 28, 'gradient-descent steps', { size: fs(9), fill: c.muted });
      txt(svg, L2, T2 - 8, 'training accuracy', { anchor: 'start', size: fs(10), fill: c.ink2 });
      [[hC, BLUE, null], [hS, RED, '6 4']].forEach(function (q) { var d = ''; q[0].forEach(function (a, t) { d += (t ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(a).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: q[1], 'stroke-width': 2.2, 'stroke-dasharray': q[2] || 'none' }, svg); });
      var n = hC.length - 1;
      out.innerHTML = 'Step <strong>' + n + '</strong>: training accuracy with cross-entropy <strong>' + Math.round(hC[n] * 100) + '%</strong>, with squared error <strong>' + Math.round(hS[n] * 100) + '%</strong>.' + NOTE + 'The same logistic-regression model (one sigmoid neuron) and the same learning rate, started from weights that point the wrong way. Cross-entropy recovers within a few dozen steps. With squared error the confidently wrong points sit where the sigmoid is flat, their gradients are tiny, and the model barely moves. Set the start to 0 and both losses learn equally well.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function () { if (!running) return; adv(5); if (hC.length > MAX) { running = false; bRun.textContent = 'Train'; } draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure: softmax, temperature and label smoothing
     ----------------------------------------------------------------------- */
  FIG['fig-ml-softmax'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Z = [2, 1, 0.1], T = 1, eps = 0, yi = 0, NAMES = ['cat', 'dog', 'fox'];
    var controls = div('fig-controls', container), sl = [];
    NAMES.forEach(function (nm, i) { sl.push(FIG.slider(controls, { id: 'sm-z' + i, label: 'Logit for “' + nm + '”', min: -4, max: 6, step: 0.1, value: Z[i], onChange: function (x) { Z[i] = x; draw(); } })); });
    var sT = FIG.slider(controls, { id: 'sm-t', label: 'Temperature', min: 0.2, max: 5, step: 0.1, value: T, onChange: function (x) { T = x; draw(); } });
    var sE = FIG.slider(controls, { id: 'sm-e', label: 'Label smoothing ε', min: 0, max: 0.3, step: 0.05, value: eps, onChange: function (x) { eps = x; draw(); } });
    choice(controls, 'True class', NAMES, yi, function (i) { yi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Softmax probabilities, targets and gradients for three classes'), W = A.W, svg = A.svg, fs = A.fs;
      sl.forEach(function (s, i) { valText(s, fmt(Z[i], 1)); }); valText(sT, fmt(T, 1)); valText(sE, fmt(eps, 2));
      var m = Math.max.apply(null, Z), ex = Z.map(function (z) { return Math.exp((z - m) / T); }), sum = ex.reduce(function (a, b) { return a + b; }, 0), p = ex.map(function (e) { return e / sum; });
      var t = [0, 1, 2].map(function (k) { return (k === yi ? 1 - eps : 0) + eps / 3; });
      var loss = 0; for (var k = 0; k < 3; k++) loss -= t[k] * Math.log(Math.max(p[k], 1e-300));
      var L = 40, R = W - 12, Tp = 30, B = 196, Y = function (v) { return B - v * (B - Tp); }, gw = (R - L) / 3, bw = Math.min(34, gw / 4.2);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      txt(svg, L, 14, W < 520 ? 'blue: p · grey: target · red: p − target' : 'blue: predicted probability p · grey: target · red: gradient p − target (shown as its size)', { anchor: 'start', size: fs(10), fill: c.muted });
      for (k = 0; k < 3; k++) {
        var cx = L + gw * (k + 0.5), g = p[k] - t[k];
        el('rect', { x: cx - 1.5 * bw - 4, y: Y(p[k]), width: bw, height: B - Y(p[k]), fill: BLUE, rx: 2 }, svg);
        el('rect', { x: cx - bw / 2, y: Y(t[k]), width: bw, height: B - Y(t[k]), fill: c.muted, opacity: 0.55, rx: 2 }, svg);
        el('rect', { x: cx + bw / 2 + 4, y: Y(Math.abs(g)), width: bw, height: B - Y(Math.abs(g)), fill: RED, opacity: g < 0 ? 1 : 0.5, rx: 2 }, svg);
        txt(svg, cx, B + 16, NAMES[k] + (k === yi ? ' (true)' : ''), { size: fs(10), fill: k === yi ? c.ink : c.ink2, weight: k === yi ? 700 : 400 });
        txt(svg, cx, B + 32, 'p = ' + fmt(p[k], 3), { size: fs(9), fill: c.muted });
      }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      out.innerHTML = 'Cross-entropy loss <strong>' + fmt(loss, 3) + '</strong>; probability of the true class <strong>' + fmt(p[yi], 3) + '</strong>.' + NOTE + 'Softmax turns the logits into probabilities: p<sub>k</sub> = e<sup>z<sub>k</sub>/T</sup> / Σ e<sup>z<sub>j</sub>/T</sup>. The gradient of the cross-entropy with respect to each logit is p − target: solid red bars push a logit up, pale ones push it down. Higher temperature flattens the probabilities; label smoothing moves ε of the target from the true class to all classes equally, so the network is never asked to be 100% sure.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: margin-based losses for classification
     ----------------------------------------------------------------------- */
  FIG['fig-ml-margin'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var m0 = -0.5;
    var LS = [
      ['0–1', '#64748b', function (m) { return m > 0 ? 0 : 1; }, 'The loss we really care about for classification: 1 for a mistake, 0 otherwise. Flat almost everywhere, so it gives no gradient.'],
      ['Hinge', '#16a34a', function (m) { return Math.max(0, 1 - m); }, 'Support vector machines (Part 5): zero once a point is beyond the margin m ≥ 1, linear for mistakes.'],
      ['Logistic', BLUE, function (m) { return Math.log(1 + Math.exp(-m)) / Math.LN2; }, 'Logistic regression and neural networks with a sigmoid output: the binary cross-entropy, here divided by ln 2 so that it equals 1 at m = 0. Never exactly zero, so it keeps pushing for confidence.'],
      ['Exponential', RED, function (m) { return Math.exp(-m); }, 'AdaBoost (Part 4) minimises this. It punishes badly misclassified points enormously, which makes boosting sensitive to mislabelled data.'],
      ['Squared', AMBER, function (m) { return (1 - m) * (1 - m); }, 'Squared error on ±1 labels. It also penalises points that are “too correct” (m > 1), which can pull the boundary the wrong way.']
    ];
    var on = [true, true, true, true, true];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'mg-m', label: 'Margin m = y·f(x)', min: -2, max: 3, step: 0.1, value: m0, onChange: function (x) { m0 = x; draw(); } });
    var row = group(controls, 'Show'), bs = [];
    LS.forEach(function (l, i) { var b = btn(l[0], row); bs.push(b); b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); b.addEventListener('click', function () { on[i] = !on[i]; b.classList.toggle('active', on[i]); b.setAttribute('aria-pressed', on[i] ? 'true' : 'false'); draw(); }); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Classification losses as functions of the margin'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(m0, 1));
      var L = 40, R = W - 14, T = 24, B = 236, lo = -2, hi = 3, yh = 5, X = function (m) { return L + (m - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - Math.min(yh * 1.5, v) / yh * (B - T); };
      var cp = el('clipPath', { id: 'mg-clip' }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T + 2 }, cp);
      [0, 1, 2, 3, 4, 5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      [-2, -1, 0, 1, 2, 3].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'margin m (negative = wrong side of the boundary)', { size: fs(10), fill: c.muted });
      el('rect', { x: L, y: T, width: X(0) - L, height: B - T, fill: RED, opacity: 0.05 }, svg);
      el('line', { x1: X(0), y1: T, x2: X(0), y2: B, stroke: c.muted }, svg);
      LS.forEach(function (l, i) {
        if (!on[i]) return;
        if (i === 0) { el('path', { d: 'M' + X(lo) + ' ' + Y(1) + 'L' + X(0) + ' ' + Y(1) + 'M' + X(0) + ' ' + Y(0) + 'L' + X(hi) + ' ' + Y(0), fill: 'none', stroke: l[1], 'stroke-width': 3 }, svg); return; }
        var d = ''; for (var k = 0; k <= 250; k++) { var m = lo + (hi - lo) * k / 250; d += (k ? 'L' : 'M') + X(m).toFixed(1) + ' ' + Y(l[2](m)).toFixed(1); }
        el('path', { d: d, fill: 'none', stroke: l[1], 'stroke-width': 2.3, 'clip-path': 'url(#mg-clip)' }, svg);
      });
      el('line', { x1: X(m0), y1: T, x2: X(m0), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      LS.forEach(function (l, i) { if (on[i] && l[2](m0) <= yh) el('circle', { cx: X(m0), cy: Y(l[2](m0)), r: 4.5, fill: l[1] }, svg); });
      var lg = W < 520 ? '0–1 grey · hinge green · logistic blue · exp red' : 'grey: 0–1 · green: hinge · blue: logistic · red: exponential · amber: squared';
      txt(svg, L, 13, lg, { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'At m = ' + fmt(m0, 1) + ': ' + LS.map(function (l) { var v = l[2](m0); return l[0] + ' <strong>' + (v > 99 ? fmt(v, 0) : fmt(v, 2)) + '</strong>'; }).join(', ') + '.' + NOTE + LS.filter(function (l, i) { return on[i]; }).map(function (l) { return '<strong>' + l[0] + ':</strong> ' + l[3]; }).join('<br>') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: focal loss and the weight of easy examples
     ----------------------------------------------------------------------- */
  FIG['fig-ml-focal'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var gm = 2, lne = 4;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'fc-g', label: 'Focusing parameter γ', min: 0, max: 5, step: 0.5, value: gm, onChange: function (x) { gm = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'fc-n', label: 'Number of easy examples', min: 1, max: 5, step: 0.5, value: lne, onChange: function (x) { lne = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function FL(p, g) { return -Math.pow(1 - p, g) * Math.log(p); }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 250, 'Focal loss curves and the share of the total loss from easy examples'), W = A.W, svg = A.svg, fs = A.fs;
      var nE = Math.round(Math.pow(10, lne)), nH = 10, pE = 0.99, pH = 0.3;
      valText(s1, fmt(gm, 1)); valText(s2, nE.toLocaleString('en-GB'));
      var L = 40, R = narrow ? W - 12 : W * 0.58, T = 30, B = 200, X = function (p) { return L + p * (R - L); }, Y = function (v) { return B - Math.min(7, v) / 5 * (B - T); };
      var cp = el('clipPath', { id: 'fc-clip' }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T + 2 }, cp);
      [0, 1, 2, 3, 4, 5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'probability given to the true class', { size: fs(10), fill: c.muted });
      txt(svg, L, T - 12, W < 520 ? 'loss per example (purple: chosen γ)' : 'loss per example (grey: γ = 0, 1, 2, 5; colour: chosen γ)', { anchor: 'start', size: fs(10), fill: c.ink2 });
      [0, 1, 2, 5, gm].forEach(function (g, j) { var d = ''; for (var k = 1; k <= 200; k++) { var p = k / 200 * 0.999 + 0.0005; d += (k > 1 ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(FL(p, g)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: j === 4 ? PURPLE : c.muted, 'stroke-width': j === 4 ? 2.8 : 1.2, opacity: j === 4 ? 1 : 0.7, 'clip-path': 'url(#fc-clip)' }, svg); });
      el('circle', { cx: X(pE), cy: Y(FL(pE, gm)), r: 5, fill: BLUE }, svg); el('circle', { cx: X(pH), cy: Y(FL(pH, gm)), r: 5, fill: AMBER }, svg);
      var eT = nE * FL(pE, gm), hT = nH * FL(pH, gm), share = eT / (eT + hT), e0 = nE * FL(pE, 0), h0 = nH * FL(pH, 0), share0 = e0 / (e0 + h0);
      /* share bars */
      var bx = narrow ? 40 : W * 0.66, bR = W - 14, bT = narrow ? 290 : 40, bh = 40;
      txt(svg, bx, bT - 12, 'share of the total loss', { anchor: 'start', size: fs(10), fill: c.ink2 });
      [[share0, 'cross-entropy (γ = 0)'], [share, 'focal loss, γ = ' + fmt(gm, 1)]].forEach(function (q, j) {
        var y = bT + j * (bh + 34), w = bR - bx;
        el('rect', { x: bx, y: y, width: w * q[0], height: bh, fill: BLUE, opacity: 0.8 }, svg);
        el('rect', { x: bx + w * q[0], y: y, width: w * (1 - q[0]), height: bh, fill: AMBER, opacity: 0.85 }, svg);
        txt(svg, bx, y + bh + 15, q[1] + ': easy ' + fmt(q[0] * 100, q[0] < 0.01 ? 2 : 0) + '%', { anchor: 'start', size: fs(10), fill: c.ink2 });
      });
      txt(svg, bx, bT + 2 * (bh + 34) + 6, 'blue: ' + nE.toLocaleString('en-GB') + ' easy (p = 0.99) · amber: 10 hard (p = 0.3)', { anchor: 'start', size: fs(9), fill: c.muted });
      out.innerHTML = 'With γ = ' + fmt(gm, 1) + ', the ' + nE.toLocaleString('en-GB') + ' easy examples contribute <strong>' + fmt(share * 100, share < 0.01 ? 2 : 1) + '%</strong> of the total loss (with plain cross-entropy: <strong>' + fmt(share0 * 100, 1) + '%</strong>).' + NOTE + 'The focal loss multiplies the cross-entropy by (1 − p)<sup>γ</sup>. An example the model already gets right with p = 0.99 is down-weighted by a factor of 10<sup>' + fmt(2 * gm, 0) + '</sup>; a hard one with p = 0.3 only by about half. The learning signal then comes from the few hard examples instead of the flood of easy ones.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: proper scoring rules
     ----------------------------------------------------------------------- */
  FIG['fig-ml-proper'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p0 = 0.7;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'pr-p', label: 'True probability of rain', min: 0.05, max: 0.95, step: 0.05, value: p0, onChange: function (x) { p0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Expected score of a forecast as a function of the probability it reports'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(p0, 2));
      var S = [
        ['log loss', BLUE, function (q) { return -(p0 * Math.log(q) + (1 - p0) * Math.log(1 - q)); }],
        ['Brier score', PURPLE, function (q) { return p0 * (1 - q) * (1 - q) + (1 - p0) * q * q; }],
        ['absolute error', RED, function (q) { return p0 * (1 - q) + (1 - p0) * q; }]
      ];
      var L = 40, R = W - 14, T = 26, B = 232, yh = 1.5, X = function (q) { return L + q * (R - L); }, Y = function (v) { return B - Math.min(yh * 1.5, v) / yh * (B - T); };
      var cp = el('clipPath', { id: 'pr-clip' }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T + 2 }, cp);
      [0, 0.5, 1, 1.5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'probability the forecaster reports', { size: fs(10), fill: c.muted });
      el('line', { x1: X(p0), y1: T, x2: X(p0), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      var mins = S.map(function (s) { var bq = 0.005, bv = Infinity; for (var k = 1; k < 200; k++) { var q = k / 200, v = s[2](q); if (v < bv - 1e-12) { bv = v; bq = q; } } if (s[0] === 'absolute error') bq = p0 > 0.5 ? 1 : p0 < 0.5 ? 0 : 0.5; return bq; });
      S.forEach(function (s, i) { var d = ''; for (var k = 1; k < 200; k++) { var q = k / 200; d += (k > 1 ? 'L' : 'M') + X(q).toFixed(1) + ' ' + Y(s[2](q)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: s[1], 'stroke-width': 2.4, 'clip-path': 'url(#pr-clip)' }, svg); var mq = Math.min(0.995, Math.max(0.005, mins[i])); el('circle', { cx: X(mins[i]), cy: Y(s[2](mq)), r: 5, fill: s[1], stroke: '#fff', 'stroke-width': 1.2 }, svg); });
      txt(svg, L, 13, W < 520 ? 'blue: log loss · purple: Brier · red: absolute' : 'expected score (lower is better) · blue: log loss · purple: Brier · red: absolute error; dots mark the best report', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'If rain really has probability ' + fmt(p0, 2) + ', the best report under log loss is <strong>' + fmt(mins[0], 2) + '</strong>, under the Brier score <strong>' + fmt(mins[1], 2) + '</strong>, under absolute error <strong>' + fmt(mins[2], 2) + '</strong>.' + NOTE + 'Log loss and the Brier score are <em>proper</em> scoring rules: the forecaster does best by reporting exactly what they believe. Absolute error is not: its expected value is a straight line in the report, so it rewards exaggerating every forecast to 0 or 1.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which single number minimises the total squared error to a set of values?', options: ['The median', 'The mean', 'The mode', 'The largest value'], answer: 1, explanation: 'Squared error is minimised by the mean; absolute error by the median.' },
      { question: 'Why is the absolute error more robust to outliers than the squared error?', options: ['It is always smaller', 'Each point’s pull is capped, instead of growing with the size of its error', 'It ignores half of the data', 'It is differentiable everywhere'], answer: 1, explanation: 'The gradient of |r| has size 1 whatever the error; the gradient of r² grows with r.' },
      { question: 'Minimising squared error is the same as maximum likelihood when the errors are…', options: ['Laplace distributed', 'Normally distributed', 'Uniform', 'Always zero'], answer: 1, explanation: 'The negative log of a normal density is a constant plus a scaled squared error.' },
      { question: 'For a sigmoid output trained with cross-entropy, the gradient with respect to the logit is…', options: ['p(1 − p)', 'p − y', '(p − y)²', 'Always 1'], answer: 1, explanation: 'The sigmoid’s slope cancels, leaving the simple error p − y.' },
      { question: 'Why does squared error train a sigmoid output slowly when it is confidently wrong?', options: ['The loss is infinite', 'Its gradient includes the sigmoid’s slope, which is nearly zero there', 'It uses the wrong learning rate', 'It ignores the labels'], answer: 1, explanation: 'Figure 6 shows a model stuck for hundreds of steps.' },
      { question: 'What does label smoothing do?', options: ['Removes mislabelled examples', 'Moves a little of the target probability from the true class to all classes', 'Averages the logits', 'Lowers the learning rate'], answer: 1, explanation: 'With ε = 0.1 and 3 classes, the target becomes 0.933 / 0.033 / 0.033.' },
      { question: 'Which loss do support vector machines minimise?', options: ['Exponential loss', 'Hinge loss', 'Log loss', 'Focal loss'], answer: 1, explanation: 'The hinge loss max(0, 1 − m) is zero beyond the margin.' },
      { question: 'The focal loss is designed for…', options: ['Regression with outliers', 'Training sets dominated by many easy examples', 'Very small networks', 'Unsupervised learning'], answer: 1, explanation: 'It down-weights well-classified examples by (1 − p)^γ.' },
      { question: 'A scoring rule is “proper” if…', options: ['It is always positive', 'Reporting your true belief gives the best expected score', 'It is differentiable', 'It is bounded'], answer: 1, explanation: 'Log loss and the Brier score are proper; absolute error is not.' },
      { question: 'To predict the 90th percentile of delivery times rather than the average, train with…', options: ['Squared error', 'The quantile (pinball) loss with τ = 0.9', 'Cross-entropy', 'Hinge loss'], answer: 1, explanation: 'The pinball loss penalises under-prediction by τ and over-prediction by 1 − τ.' }
    ]);
  };
})();
