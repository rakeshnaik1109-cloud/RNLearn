/* ==========================================================================
   RNLearn — Choosing and Explaining Models (Inside the Machine, Part 10)
   Figures:
     fig-ml-map         The map of the series
     fig-ml10-timeline  The story at a glance
     fig-ml-cv          Six models compared by cross-validation
     fig-ml-search      Grid search and random search
     fig-ml-curse       The winner's curse
     fig-ml-perm        Permutation importance
     fig-ml-pdp         Partial dependence and ICE curves
     fig-ml-shap        Shapley values for one prediction
     fig-quiz-ml10      Test yourself
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
    { name: 'Choosing models', color: '#b45309' },
    { name: 'Explaining models', color: '#1d4ed8' },
    { name: 'Trust and accountability', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1953', icon: '🤝', era: 1, sec: 11, title: 'Shapley values', text: 'Lloyd Shapley shows how to share a game’s payout fairly among players, the idea behind today’s SHAP explanations.' },
    { year: '1974', icon: '🔄', era: 0, sec: 5, title: 'Cross-validation', text: 'Mervyn Stone sets out cross-validatory choice and assessment of statistical predictions.' },
    { year: '1996', icon: '🍽️', era: 0, sec: 3, title: 'No free lunch', text: 'David Wolpert proves that, averaged over all possible problems, no learning algorithm beats any other.' },
    { year: '2001', icon: '🌲', era: 1, sec: 9, title: 'Permutation importance', text: 'Leo Breiman measures a feature’s importance in a random forest by shuffling it and seeing how much accuracy drops.' },
    { year: '2001', icon: '📈', era: 1, sec: 10, title: 'Partial dependence', text: 'Jerome Friedman introduces partial dependence plots to show how a boosted model’s prediction varies with one feature.' },
    { year: '2006', icon: '🪆', era: 0, sec: 7, title: 'Nested cross-validation', text: 'Sudhir Varma and Richard Simon show that tuning and evaluating on the same folds gives badly optimistic error estimates.' },
    { year: '2012', icon: '🎲', era: 0, sec: 6, title: 'Random search', text: 'James Bergstra and Yoshua Bengio show that random search finds good hyperparameters faster than grid search.' },
    { year: '2015', icon: '🧊', era: 1, sec: 10, title: 'ICE curves', text: 'Alex Goldstein and colleagues plot one curve per example, revealing interactions that averages hide.' },
    { year: '2016', icon: '🍋', era: 1, sec: 11, title: 'LIME', text: 'Marco Ribeiro, Sameer Singh and Carlos Guestrin explain single predictions with simple local models.' },
    { year: '2017', icon: '🧮', era: 1, sec: 11, title: 'SHAP', text: 'Scott Lundberg and Su-In Lee unify many explanation methods using Shapley values.' },
    { year: '2019', icon: '🐴', era: 2, sec: 13, title: 'Clever Hans', text: 'Sebastian Lapuschkin and colleagues find image classifiers that recognise horses by a copyright tag.' },
    { year: '2019', icon: '⚖️', era: 2, sec: 8, title: 'Interpretable by design', text: 'Cynthia Rudin argues that high-stakes decisions should use models that are interpretable in the first place.' }
  ];

  FIG['fig-ml10-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1953 to 2019');
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

  var ML_PART = 10;
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
     Model comparison, tuning and explanation tools
     ----------------------------------------------------------------------- */
  function sgm(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
  function logisticFit(P, deg) {
    var F = P.map(function (p) { return [1].concat(polyFeat(p[0], p[1], deg)); }), d = F[0].length, w = new Array(d).fill(0);
    for (var it = 0; it < 25; it++) {
      var Hm = [], g = new Array(d).fill(0), i, j, k;
      for (j = 0; j < d; j++) { Hm.push(new Array(d).fill(0)); Hm[j][j] = 1e-3; g[j] = 1e-3 * w[j]; }
      F.forEach(function (f, n) { var z = 0; for (j = 0; j < d; j++) z += w[j] * f[j]; var q = sgm(z), e = q - P[n][2], s = q * (1 - q); for (j = 0; j < d; j++) { g[j] += e * f[j]; for (k = 0; k < d; k++) Hm[j][k] += s * f[j] * f[k]; } });
      var step = solveSym(Hm, g); for (j = 0; j < d; j++) w[j] -= step[j];
    }
    return function (x, y) { var f = [1].concat(polyFeat(x, y, deg)), z = 0; for (var j = 0; j < d; j++) z += w[j] * f[j]; return sgm(z); };
  }
  function forestClf(P, nT, depth, seed) {
    var r = rngSeed(seed || 1), trees = [];
    for (var t = 0; t < nT; t++) { var B = []; for (var i = 0; i < P.length; i++) B.push(P[Math.floor(r() * P.length)]); trees.push(growTree(B, depth, 'gini', 2)); }
    return function (x, y) { var s = 0; trees.forEach(function (f) { s += f(x, y); }); return s / trees.length; };
  }
  function mlpClf(P, H, steps, seed) {
    var r = rngSeed(seed || 3), th = [], i; for (i = 0; i < 3 * H; i++) th.push(gaussR(r) * (i < 2 * H ? 1 : 1 / Math.sqrt(H))); for (i = 0; i < H; i++) th.push(0); th.push(0);
    var n = th.length, m = new Array(n).fill(0), v = new Array(n).fill(0);
    function fw(x, y, h) { var o = th[n - 1]; for (var k = 0; k < H; k++) { h[k] = Math.tanh(th[k] * x + th[H + k] * y + th[3 * H + k]); o += th[2 * H + k] * h[k]; } return o; }
    for (var t = 1; t <= steps; t++) {
      var g = new Array(n).fill(0), h = [];
      P.forEach(function (p) { var e = (sgm(fw(p[0], p[1], h)) - p[2]) / P.length; g[n - 1] += e; for (var k = 0; k < H; k++) { g[2 * H + k] += e * h[k]; var dz = e * th[2 * H + k] * (1 - h[k] * h[k]); g[k] += dz * p[0]; g[H + k] += dz * p[1]; g[3 * H + k] += dz; } });
      var c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
      for (var q = 0; q < n; q++) { m[q] = 0.9 * m[q] + 0.1 * g[q]; v[q] = 0.999 * v[q] + 0.001 * g[q] * g[q]; th[q] -= 0.03 * (m[q] / c1) / (Math.sqrt(v[q] / c2) + 1e-8); }
    }
    return function (x, y) { return sgm(fw(x, y, [])); };
  }
  var CV_MODELS = [
    ['Logistic regression', function (P) { return logisticFit(P, 1); }],
    ['Naive Bayes', function (P) { return gnb(P); }],
    ['k-nearest neighbours (k = 15)', function (P) { return knnClf(P, 15); }],
    ['Decision tree (depth 4)', function (P) { return growTree(P, 4, 'gini', 2); }],
    ['Random forest (50 trees)', function (P) { return forestClf(P, 50, 8, 7); }],
    ['Neural network (8 units)', function (P) { return mlpClf(P, 8, 600, 3); }]
  ];
  function cvAll(kind) {
    var D = makeData(kind), P = D.train.concat(D.test), K = 10, res = CV_MODELS.map(function () { return []; });
    for (var f = 0; f < K; f++) {
      var tr = P.filter(function (_, i) { return i % K !== f; }), te = P.filter(function (_, i) { return i % K === f; });
      CV_MODELS.forEach(function (M, mi) { var g = M[1](tr), ok = 0; te.forEach(function (p) { if ((g(p[0], p[1]) >= 0.5 ? 1 : 0) === p[2]) ok++; }); res[mi].push(ok / te.length); });
    }
    return res;
  }
  /* A regression data set with known structure: six features */
  var FEAT = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆'];
  function trueF(x) { return 3 * x[0] + 2 * Math.sin(2 * Math.PI * x[1]) + 3 * x[2] * (2 * x[3] - 1); }
  function regData(n, seed) { var r = rngSeed(seed || 12), X = [], y = []; for (var i = 0; i < n; i++) { var x = [r(), r(), r(), r(), r()]; x.push(Math.min(1, Math.max(0, x[0] + 0.05 * gaussR(r)))); X.push(x); y.push(trueF(x) + 0.3 * gaussR(r)); } return { X: X, y: y }; }
  /* Random forest for regression: bootstrap samples, three random features per split */
  function regForest(X, y, nT, depth, seed) {
    var r = rngSeed(seed || 5), d = X[0].length, trees = [];
    function grow(I, dep) {
      var m = 0; I.forEach(function (i) { m += y[i]; }); m /= I.length; var nd = { m: m };
      if (dep >= depth || I.length < 6) return nd;
      var feats = []; while (feats.length < 3) { var j = Math.floor(r() * d); if (feats.indexOf(j) < 0) feats.push(j); }
      var best = null;
      feats.forEach(function (j) {
        var S = I.slice().sort(function (a, b) { return X[a][j] - X[b][j]; }), tot = 0, tot2 = 0, l = 0, l2 = 0;
        S.forEach(function (i) { tot += y[i]; tot2 += y[i] * y[i]; });
        for (var k = 0; k < S.length - 1; k++) { l += y[S[k]]; l2 += y[S[k]] * y[S[k]]; var nl = k + 1, nr = S.length - nl; if (nl < 3 || nr < 3 || X[S[k]][j] === X[S[k + 1]][j]) continue; var sse = (l2 - l * l / nl) + ((tot2 - l2) - (tot - l) * (tot - l) / nr); if (!best || sse < best.sse) best = { sse: sse, j: j, t: (X[S[k]][j] + X[S[k + 1]][j]) / 2 }; }
      });
      if (!best) return nd;
      nd.j = best.j; nd.t = best.t; nd.l = grow(I.filter(function (i) { return X[i][best.j] <= best.t; }), dep + 1); nd.r = grow(I.filter(function (i) { return X[i][best.j] > best.t; }), dep + 1);
      return nd;
    }
    for (var t = 0; t < nT; t++) { var I = []; for (var i = 0; i < X.length; i++) I.push(Math.floor(r() * X.length)); trees.push(grow(I, 0)); }
    return function (x) { var s = 0; trees.forEach(function (nd) { while (nd.j !== undefined) nd = x[nd.j] <= nd.t ? nd.l : nd.r; s += nd.m; }); return s / trees.length; };
  }
  function mseOf(f, X, y) { var s = 0; X.forEach(function (x, i) { var e = f(x) - y[i]; s += e * e; }); return s / X.length; }
  function permImp(f, X, y, reps, seed) {
    var r = rngSeed(seed || 9), base = mseOf(f, X, y), d = X[0].length, out = [];
    for (var j = 0; j < d; j++) { var inc = []; for (var k = 0; k < reps; k++) { var col = X.map(function (x) { return x[j]; }); for (var i = col.length - 1; i > 0; i--) { var q = Math.floor(r() * (i + 1)), t = col[i]; col[i] = col[q]; col[q] = t; } var Xp = X.map(function (x, i) { var z = x.slice(); z[j] = col[i]; return z; }); inc.push(mseOf(f, Xp, y) - base); } out.push({ m: mean(inc), s: inc.length > 1 ? sdv(inc) : 0 }); }
    return { base: base, imp: out };
  }
  function iceCurves(f, X, j, grid) { return X.map(function (x) { return grid.map(function (g) { var z = x.slice(); z[j] = g; return f(z); }); }); }
  function shapley(f, x, B) {
    var d = x.length, N = 1 << d, val = new Array(N), S, i;
    for (S = 0; S < N; S++) { var s = 0; B.forEach(function (b) { var z = b.slice(); for (i = 0; i < d; i++) if (S & (1 << i)) z[i] = x[i]; s += f(z); }); val[S] = s / B.length; }
    var fact = [1]; for (i = 1; i <= d; i++) fact.push(fact[i - 1] * i);
    var phi = new Array(d).fill(0);
    for (i = 0; i < d; i++) for (S = 0; S < N; S++) { if (S & (1 << i)) continue; var sz = 0; for (var k = 0; k < d; k++) if (S & (1 << k)) sz++; phi[i] += fact[sz] * fact[d - sz - 1] / fact[d] * (val[S | (1 << i)] - val[S]); }
    return { phi: phi, base: val[0], pred: val[N - 1] };
  }

  /* -----------------------------------------------------------------------
     Figure: comparing six models by cross-validation
     ----------------------------------------------------------------------- */
  FIG['fig-ml-cv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 1, cache = {}, COLS = [BLUE, '#0891b2', GREEN, AMBER, '#b45309', PURPLE];
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var key = DS_KEYS[di];
      if (!cache[key]) { out.innerHTML = 'Running 10-fold cross-validation for six models…'; setTimeout(function () { cache[key] = cvAll(key); draw(); }, 30); return; }
      var R = cache[key], c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, 6 * 40 + 60, 'Cross-validated accuracy of six models'), W = A.W, svg = A.svg, fs = A.fs;
      var L = narrow ? 120 : 210, Rr = W - 50, lo = 0.4, hi = 1, X = function (v) { return L + (Math.max(lo, v) - lo) / (hi - lo) * (Rr - L); }, T = 30;
      (narrow ? [0.4, 0.6, 0.8, 1] : [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]).forEach(function (v) { el('line', { x1: X(v), y1: T - 6, x2: X(v), y2: T + 6 * 40, stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, X(v), T + 6 * 40 + 14, Math.round(v * 100) + '%', { size: fs(9), fill: c.muted }); });
      var means = R.map(function (a) { return mean(a); }), best = means.indexOf(Math.max.apply(null, means));
      R.forEach(function (a, i) {
        var y = T + i * 40 + 20, m = means[i], s = sdv(a), name = narrow ? CV_MODELS[i][0].replace(' (k = 15)', '').replace(' (depth 4)', '').replace(' (50 trees)', '').replace(' (8 units)', '').replace('k-nearest neighbours', 'k-NN').replace('Logistic regression', 'Logistic').replace('Neural network', 'Neural net') : CV_MODELS[i][0];
        txt(svg, L - 8, y + 4, name, { anchor: 'end', size: fs(10), fill: i === best ? c.ink : c.ink2, weight: i === best ? 700 : 400 });
        a.forEach(function (v, k) { el('circle', { cx: X(v), cy: y + (k - 4.5) * 1.6, r: 2.6, fill: COLS[i], opacity: 0.45 }, svg); });
        el('line', { x1: X(m - s), y1: y, x2: X(m + s), y2: y, stroke: COLS[i], 'stroke-width': 2 }, svg);
        el('circle', { cx: X(m), cy: y, r: 6, fill: COLS[i], stroke: '#fff', 'stroke-width': 1.5 }, svg);
        txt(svg, Rr + 6, y + 4, fmt(m * 100, 1) + '%', { anchor: 'start', size: fs(9), fill: c.muted });
      });
      txt(svg, narrow ? 10 : L, 14, narrow ? 'mean (big dot), ± 1 sd, each fold (small dots)' : 'mean accuracy over 10 folds (big dot), ± one standard deviation (line), each fold (small dots)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = DS_NAMES[di] + ': best mean accuracy <strong>' + CV_MODELS[best][0] + '</strong> (' + fmt(means[best] * 100, 1) + '%); worst ' + CV_MODELS[means.indexOf(Math.min.apply(null, means))][0] + ' (' + fmt(Math.min.apply(null, means) * 100, 1) + '%).' + NOTE + 'Each model is trained on 9 of 10 folds of the 200 points and tested on the tenth, ten times over. The folds’ accuracies scatter by about ±5 percentage points, so differences of a point or two between models mean little. Which model wins depends on the data: no single method is best everywhere.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: grid search versus random search
     ----------------------------------------------------------------------- */
  FIG['fig-ml-search'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NB = [4, 9, 16, 25], bi = 1, seed = 1;
    function score(a, b) { return 0.70 + 0.22 * Math.exp(-Math.pow((a - 0.42) / 0.06, 2)) + 0.02 * Math.sin(3 * b); }
    var controls = div('fig-controls', container);
    choice(controls, 'Budget (trials)', NB.map(String), bi, function (i) { bi = i; draw(); });
    var row = group(controls, 'Random search');
    btn('New random draw', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W0 < 560, S0 = narrow ? Math.min(W0 - 60, 260) : Math.min((W0 - 80) / 2, 260), A = newSVG(svgWrap, container, Math.round(narrow ? 2 * S0 + 130 : S0 + 70), 'Grid search and random search on a score that depends mostly on one hyperparameter'), W = A.W, svg = A.svg, fs = A.fs;
      var n = NB[bi], g = Math.round(Math.sqrt(n)), r = rngSeed(seed * 7919), grid = [], rnd = [], i, j;
      for (i = 0; i < g; i++) for (j = 0; j < g; j++) grid.push([(i + 0.5) / g, (j + 0.5) / g]);
      for (i = 0; i < n; i++) rnd.push([r(), r()]);
      var S = narrow ? Math.min(W - 60, 260) : Math.min((W - 80) / 2, 260);
      function panel(P, L, T, title, col) {
        for (var a = 0; a < 30; a++) for (var b = 0; b < 30; b++) { var v = score((a + 0.5) / 30, (b + 0.5) / 30); el('rect', { x: L + a * S / 30, y: T + (29 - b) * S / 30, width: S / 30 + 0.4, height: S / 30 + 0.4, fill: GREEN, opacity: Math.max(0.03, (v - 0.68) / 0.26 * 0.75) }, svg); }
        el('rect', { x: L, y: T, width: S, height: S, fill: 'none', stroke: c.border }, svg);
        var bestv = -1, bp = null;
        P.forEach(function (p) { var v = score(p[0], p[1]); if (v > bestv) { bestv = v; bp = p; } el('circle', { cx: L + p[0] * S, cy: T + (1 - p[1]) * S, r: 4.5, fill: col, stroke: '#fff', 'stroke-width': 1 }, svg); el('line', { x1: L + p[0] * S, y1: T + S, x2: L + p[0] * S, y2: T + S + 8, stroke: col, 'stroke-width': 1.5 }, svg); });
        el('circle', { cx: L + bp[0] * S, cy: T + (1 - bp[1]) * S, r: 9, fill: 'none', stroke: c.ink, 'stroke-width': 2 }, svg);
        txt(svg, L, T - 8, title + ': best ' + fmt(bestv, 3), { anchor: 'start', size: fs(10), fill: c.ink2 });
        txt(svg, L + S / 2, T + S + 22, 'important hyperparameter →', { size: fs(9), fill: c.muted });
        return bestv;
      }
      var T = 34, L1 = narrow ? (W - S) / 2 : 40, L2 = narrow ? L1 : W / 2 + 20, T2 = narrow ? T + S + 56 : T;
      var bg = panel(grid, L1, T, 'Grid (' + g + ' × ' + g + ')', RED), br = panel(rnd, L2, T2, 'Random (' + n + ')', BLUE);
      txt(svg, 10, 14, narrow ? 'shading: score; ticks: values tried' : 'shading: validation score; ticks below each panel: the distinct values tried for the important hyperparameter', { anchor: 'start', size: fs(10), fill: c.muted });
      var wins = 0, r2 = rngSeed(4242); for (var t = 0; t < 1000; t++) { var bb = -1; for (i = 0; i < n; i++) bb = Math.max(bb, score(r2(), r2())); if (bb > bg) wins++; }
      out.innerHTML = 'Budget ' + n + ': grid search best <strong>' + fmt(bg, 3) + '</strong>, this random draw <strong>' + fmt(br, 3) + '</strong>. Over 1,000 random draws, random search beats the grid <strong>' + Math.round(wins / 10) + '%</strong> of the time.' + NOTE + 'The score depends strongly on the horizontal hyperparameter and hardly at all on the vertical one, as is common in practice. A grid of ' + g + ' × ' + g + ' tries only ' + g + ' distinct values of the important one; random search tries ' + n + '.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the winner's curse when choosing among many models
     ----------------------------------------------------------------------- */
  FIG['fig-ml-curse'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NV = [50, 200, 1000], vi = 0, lgN = 2, seed = 1;
    function binomDraw(r, n) { var s = 0; for (var i = 0; i < n; i++) if (r() < 0.5) s++; return s / n; }
    var controls = div('fig-controls', container);
    choice(controls, 'Validation examples', NV.map(String), vi, function (i) { vi = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'wc-n', label: 'Models tried (log₁₀)', min: 0, max: 3, step: 0.5, value: lgN, onChange: function (x) { lgN = x; draw(); } });
    var row = group(controls, 'Simulation');
    btn('Try again', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Best validation accuracy among many useless models'), W = A.W, svg = A.svg, fs = A.fs;
      var nv = NV[vi], N = Math.round(Math.pow(10, lgN)), r = rngSeed(seed * 31 + vi);
      valText(s1, N.toLocaleString('en-GB'));
      var accs = []; for (var k = 0; k < N; k++) accs.push(binomDraw(r, nv));
      var best = Math.max.apply(null, accs), testAcc = binomDraw(r, nv);
      var L = 40, R = W - 14, T = 30, B = 200, lo = 0.3, hi = 0.8, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      var bins = 50, H = new Array(bins).fill(0); accs.forEach(function (a) { var b = Math.floor((a - lo) / (hi - lo) * bins); if (b >= 0 && b < bins) H[b]++; });
      var hm = Math.max.apply(null, H);
      H.forEach(function (h, b) { if (h) el('rect', { x: L + b * (R - L) / bins + 1, y: B - h / hm * (B - T - 20), width: (R - L) / bins - 2, height: h / hm * (B - T - 20), fill: c.muted, opacity: 0.6 }, svg); });
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach(function (v) { txt(svg, X(v), B + 15, Math.round(v * 100) + '%', { size: fs(9), fill: c.muted }); });
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      txt(svg, (L + R) / 2, B + 30, 'validation accuracy of models that are guessing at random', { size: fs(10), fill: c.muted });
      el('line', { x1: X(0.5), y1: T, x2: X(0.5), y2: B, stroke: c.ink, 'stroke-dasharray': '3 3' }, svg);
      el('line', { x1: X(best), y1: T, x2: X(best), y2: B, stroke: RED, 'stroke-width': 2.5 }, svg); txt(svg, X(best) + 4, T + 10, 'chosen: ' + fmt(best * 100, 0) + '%', { anchor: 'start', size: fs(10), fill: RED });
      txt(svg, L, 14, W < 520 ? 'grey: models’ scores · dashed: true 50%' : 'grey: histogram of the ' + N.toLocaleString('en-GB') + ' models’ validation scores · dashed: true accuracy 50%', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Best of ' + N.toLocaleString('en-GB') + ' models on ' + nv + ' validation examples: <strong>' + fmt(best * 100, 1) + '%</strong>. The same model on fresh test data: <strong>' + fmt(testAcc * 100, 1) + '%</strong>.' + NOTE + 'Every “model” here guesses at random, so its true accuracy is 50%. Picking the best of many on the same validation set rewards luck: the more models (or hyperparameter settings) you try and the smaller the validation set, the more optimistic the winner’s score. Only data untouched by the selection gives an honest estimate.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* Shared regression model for the explanation figures */
  var EXPL = null;
  function explModel() {
    if (EXPL) return EXPL;
    var D = regData(400), Xtr = D.X.slice(0, 300), ytr = D.y.slice(0, 300), Xte = D.X.slice(300), yte = D.y.slice(300);
    var f = regForest(Xtr, ytr, 60, 10, 5);
    EXPL = { Xtr: Xtr, ytr: ytr, Xte: Xte, yte: yte, forest: f, cache: {} };
    return EXPL;
  }
  var FEAT_COLS = [BLUE, GREEN, AMBER, PURPLE, '#64748b', '#0891b2'];

  /* -----------------------------------------------------------------------
     Figure: permutation importance
     ----------------------------------------------------------------------- */
  FIG['fig-ml-perm'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mi = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Random forest (fitted)', 'The true function'], mi, function (i) { mi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var E = explModel(), key = 'perm' + mi;
      if (!E.cache[key]) E.cache[key] = permImp(mi ? trueF : E.forest, E.Xte, E.yte, 10, 9);
      var P = E.cache[key], c = C(), A = newSVG(svgWrap, container, 6 * 34 + 56, 'Permutation importance of six features'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 40, R = W - 60, T = 26, mx = 4.5, X = function (v) { return L + Math.max(0, Math.min(mx, v)) / mx * (R - L); };
      [0, 1, 2, 3, 4].forEach(function (v) { el('line', { x1: X(v), y1: T, x2: X(v), y2: T + 6 * 34, stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, X(v), T + 6 * 34 + 14, String(v), { size: fs(9), fill: c.muted }); });
      P.imp.forEach(function (q, j) { var y = T + j * 34; txt(svg, L - 8, y + 21, FEAT[j], { anchor: 'end', size: fs(11), fill: c.ink2 }); el('rect', { x: L, y: y + 8, width: Math.max(1, X(q.m) - L), height: 18, fill: FEAT_COLS[j], opacity: 0.85 }, svg); el('line', { x1: X(q.m - q.s), y1: y + 17, x2: X(q.m + q.s), y2: y + 17, stroke: c.ink, 'stroke-width': 1.2 }, svg); txt(svg, X(q.m + q.s) + 6, y + 21, fmt(q.m, 2), { anchor: 'start', size: fs(9), fill: c.muted }); });
      txt(svg, L, 14, W < 520 ? 'rise in test error when shuffled' : 'increase in test error when the feature is shuffled (bar: mean of 10 shuffles; line: ± 1 sd)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (mi ? 'The true function' : 'Random forest') + ': test error ' + fmt(P.base, 3) + ' before shuffling. Importance of x₁ <strong>' + fmt(P.imp[0].m, 2) + '</strong>, of its near-copy x₆ <strong>' + fmt(P.imp[5].m, 2) + '</strong>, of x₃ ' + fmt(P.imp[2].m, 2) + ', of the pure-noise x₅ ' + fmt(P.imp[4].m, 2) + '.' + NOTE + 'The data follow y = 3x₁ + 2 sin(2πx₂) + 3x₃(2x₄ − 1) + noise; x₅ is irrelevant and x₆ is x₁ plus a little noise. Shuffling an important feature breaks its link with the outcome, so the error rises. The fitted forest spreads x₁’s importance over x₁ and its copy x₆, which the true function never uses: importance describes the model, not the world.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: partial dependence and ICE curves
     ----------------------------------------------------------------------- */
  FIG['fig-ml-pdp'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fj = 2, mi = 0, showIce = true, G = []; for (var g = 0; g <= 20; g++) G.push(g / 20);
    var controls = div('fig-controls', container);
    choice(controls, 'Feature', FEAT.slice(0, 5), fj, function (i) { fj = i; draw(); });
    choice(controls, 'Model', ['Random forest', 'True function'], mi, function (i) { mi = i; draw(); });
    choice(controls, 'Show', ['Average + individual curves', 'Average only'], 0, function (i) { showIce = i === 0; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var E = explModel(), key = 'ice' + mi + '_' + fj;
      if (!E.cache[key]) E.cache[key] = iceCurves(mi ? trueF : E.forest, E.Xte, fj, G);
      var ICE = E.cache[key], PD = G.map(function (_, k) { return mean(ICE.map(function (cv) { return cv[k]; })); });
      var c = C(), A = newSVG(svgWrap, container, 250, 'Partial dependence and individual conditional expectation curves'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 44, R = W - 14, T = 26, B = 206, yl = -4, yh = 7, X = function (v) { return L + v * (R - L); }, Y = function (v) { return B - (Math.max(yl, Math.min(yh, v)) - yl) / (yh - yl) * (B - T); };
      [-4, -2, 0, 2, 4, 6].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'value of ' + FEAT[fj] + ' (all other features kept as they are)', { size: fs(10), fill: c.muted });
      if (showIce) ICE.forEach(function (cv, i) { var d = ''; cv.forEach(function (v, k) { d += (k ? 'L' : 'M') + X(G[k]).toFixed(1) + ' ' + Y(v).toFixed(1); }); var hi4 = E.Xte[i][3] > 0.5; el('path', { d: d, fill: 'none', stroke: fj === 2 ? (hi4 ? AMBER : BLUE) : c.muted, 'stroke-width': 0.8, opacity: 0.45 }, svg); });
      var d2 = ''; PD.forEach(function (v, k) { d2 += (k ? 'L' : 'M') + X(G[k]).toFixed(1) + ' ' + Y(v).toFixed(1); }); el('path', { d: d2, fill: 'none', stroke: RED, 'stroke-width': 3.2 }, svg);
      txt(svg, L, 14, W < 520 ? 'red: average' + (showIce ? (fj === 2 ? ' · orange: x₄ > 0.5 · blue: x₄ ≤ 0.5' : ' · thin: each example') : '') : 'red: partial dependence (average)' + (showIce ? (fj === 2 ? ' · thin: one curve per test example (orange if x₄ > 0.5, blue if not)' : ' · thin: one curve per test example') : ''), { anchor: 'start', size: fs(10), fill: c.muted });
      var rng = Math.max.apply(null, PD) - Math.min.apply(null, PD);
      var NOTES = ['x₁ has a straight-line effect of slope 3' + (mi ? '.' : '; the forest captures part of it and gives the rest to its near-copy x₆, so the curve is flatter than the truth.'), 'x₂ has a wave-shaped effect: up, then down, then up again. A single coefficient could not describe it.', 'The average curve is almost flat, as if x₃ did not matter. The individual curves show why: they rise when x₄ is large and fall when x₄ is small, and the two cancel. Partial dependence hides interactions; ICE curves reveal them.', 'x₄ matters through its interaction with x₃: its curves fan out according to each example’s x₃.', 'x₅ is pure noise, and the curves are flat.'];
      out.innerHTML = 'Range of the average curve for ' + FEAT[fj] + ': <strong>' + fmt(rng, 2) + '</strong>.' + NOTE + NOTES[fj] + ' Partial dependence (Friedman, 2001) sets one feature to each value for every example and averages the predictions; ICE curves (Goldstein and colleagues, 2015) show each example separately.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Shapley values for one prediction
     ----------------------------------------------------------------------- */
  FIG['fig-ml-shap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ii = 0, mi = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sh-i', label: 'Test example', min: 0, max: 99, step: 1, value: ii, onChange: function (x) { ii = x; draw(); } });
    choice(controls, 'Model', ['Random forest', 'True function'], mi, function (i) { mi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var E = explModel(), key = 'sh' + mi + '_' + ii;
      if (!E.cache[key]) E.cache[key] = shapley(mi ? trueF : E.forest, E.Xte[ii], E.Xtr.slice(0, 100));
      var S = E.cache[key], x = E.Xte[ii], c = C(), A = newSVG(svgWrap, container, 8 * 30 + 40, 'Shapley values for one prediction'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(ii));
      var vals = [S.base]; S.phi.forEach(function (p) { vals.push(vals[vals.length - 1] + p); });
      var lo = Math.min.apply(null, vals) - 0.3, hi = Math.max.apply(null, vals) + 0.3; lo = Math.min(lo, -1); hi = Math.max(hi, 3);
      var L = W < 520 ? 116 : 150, R = W - 50, T = 24, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      for (var t = Math.ceil(lo); t <= Math.floor(hi); t++) { el('line', { x1: X(t), y1: T, x2: X(t), y2: T + 8 * 30, stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, X(t), T + 8 * 30 + 14, String(t), { size: fs(9), fill: c.muted }); }
      txt(svg, L - 8, T + 19, 'average prediction', { anchor: 'end', size: fs(10), fill: c.ink2 });
      el('rect', { x: Math.min(X(0), X(S.base)), y: T + 8, width: Math.abs(X(S.base) - X(0)), height: 16, fill: c.muted, opacity: 0.5 }, svg);
      txt(svg, X(S.base) + (S.base >= 0 ? 6 : -6), T + 20, fmt(S.base, 2), { anchor: S.base >= 0 ? 'start' : 'end', size: fs(9), fill: c.muted });
      S.phi.forEach(function (p, j) { var y = T + (j + 1) * 30; txt(svg, L - 8, y + 19, FEAT[j] + ' = ' + fmt(x[j], 2), { anchor: 'end', size: fs(10), fill: c.ink2 }); el('rect', { x: Math.min(X(vals[j]), X(vals[j + 1])), y: y + 8, width: Math.max(1, Math.abs(X(vals[j + 1]) - X(vals[j]))), height: 16, fill: p >= 0 ? AMBER : BLUE, opacity: 0.9 }, svg); txt(svg, Math.max(X(vals[j]), X(vals[j + 1])) + 6, y + 20, (p >= 0 ? '+' : '−') + fmt(Math.abs(p), 2), { anchor: 'start', size: fs(9), fill: c.muted }); });
      var yP = T + 7 * 30; txt(svg, L - 8, yP + 19, 'this prediction', { anchor: 'end', size: fs(10), fill: c.ink, weight: 700 });
      el('rect', { x: Math.min(X(0), X(S.pred)), y: yP + 8, width: Math.abs(X(S.pred) - X(0)), height: 16, fill: RED, opacity: 0.85 }, svg);
      txt(svg, X(S.pred) + (S.pred >= 0 ? 6 : -6), yP + 20, fmt(S.pred, 2), { anchor: S.pred >= 0 ? 'start' : 'end', size: fs(9), fill: c.ink });
      el('line', { x1: X(0), y1: T, x2: X(0), y2: T + 8 * 30, stroke: c.muted }, svg);
      txt(svg, W < 520 ? 10 : L, 13, 'orange pushes the prediction up, blue pushes it down', { anchor: 'start', size: fs(10), fill: c.muted });
      var top = S.phi.map(function (p, j) { return [Math.abs(p), j]; }).sort(function (a, b) { return b[0] - a[0]; })[0][1];
      out.innerHTML = 'Test example ' + ii + ': prediction <strong>' + fmt(S.pred, 2) + '</strong> = average ' + fmt(S.base, 2) + ' ' + S.phi.map(function (p, j) { return (p >= 0 ? '+ ' : '− ') + fmt(Math.abs(p), 2) + ' (' + FEAT[j] + ')'; }).join(' ') + '. Largest contribution: <strong>' + FEAT[top] + '</strong>.' + NOTE + 'Shapley values share the difference between this prediction and the average prediction among the features. Each feature’s share is its average added effect over every order in which the features could be revealed, here computed exactly over all 64 subsets of the six features, with 100 training examples standing in for the features not yet revealed. The shares always add up to the prediction.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml10'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does the “no free lunch” theorem say?', options: ['Deep learning always wins', 'Averaged over all possible problems, no learning algorithm beats any other', 'Training is never free', 'Simple models are always best'], answer: 1, explanation: 'Wolpert, 1996: a method only wins when its assumptions match the problem.' },
      { question: 'Why use cross-validation to compare models?', options: ['It is faster', 'Every example is used for testing once, giving a more reliable estimate and a sense of its spread', 'It removes the need for test data', 'It increases accuracy'], answer: 1, explanation: 'Figure 3 shows fold-to-fold scatter of about ±5 points.' },
      { question: 'Why does random search often beat grid search?', options: ['It is more expensive', 'It tries more distinct values of the hyperparameters that actually matter', 'It uses gradients', 'It never repeats'], answer: 1, explanation: 'Bergstra and Bengio, 2012.' },
      { question: 'If you try 1,000 settings and report the best validation score…', options: ['The score is unbiased', 'The score is optimistic; you need untouched test data or nested cross-validation', 'The test score will be higher', 'Nothing can go wrong'], answer: 1, explanation: 'Figure 5: pure guessing can score 65% on 50 examples.' },
      { question: 'Permutation importance measures…', options: ['A feature’s causal effect', 'How much the model’s error rises when a feature’s values are shuffled', 'The size of a coefficient', 'How often a feature is missing'], answer: 1, explanation: 'It describes the model’s reliance on the feature.' },
      { question: 'Two strongly correlated features in a random forest will typically…', options: ['Both get full importance', 'Share the importance between them', 'Both get zero importance', 'Crash the model'], answer: 1, explanation: 'x₁ and its copy x₆ in Figure 6.' },
      { question: 'A flat partial dependence curve means…', options: ['The feature never matters', 'On average the prediction does not change, though it may through interactions', 'The model is linear', 'The data are wrong'], answer: 1, explanation: 'x₃ in Figure 7: ICE curves rise and fall and cancel.' },
      { question: 'Shapley values for one prediction…', options: ['Are always positive', 'Add up to the difference between the prediction and the average prediction', 'Ignore interactions', 'Need the true function'], answer: 1, explanation: 'This additivity is one of their defining properties.' },
      { question: 'The “Clever Hans” effect in machine learning is…', options: ['A clever new architecture', 'A model getting the right answer for the wrong reason, such as a watermark', 'Overfitting to noise', 'A training trick'], answer: 1, explanation: 'Named after the horse that read its trainer’s cues rather than doing arithmetic.' },
      { question: 'For high-stakes decisions, Cynthia Rudin argues for…', options: ['The largest possible model', 'Models that are interpretable by design, rather than explaining black boxes after the fact', 'Never using machine learning', 'Random forests only'], answer: 1, explanation: 'Rudin, 2019, Nature Machine Intelligence.' }
    ]);
  };
})();
