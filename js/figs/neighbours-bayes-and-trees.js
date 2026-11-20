/* ==========================================================================
   RNLearn — Neighbours, Bayes and Trees (Inside the Machine, Part 3)
   Figures:
     fig-ml-map         The map of the series
     fig-ml3-timeline   The story at a glance
     fig-ml-knn         k-nearest neighbours
     fig-ml-knnreg      k-NN regression on the running example
     fig-ml-curse       Distances in high dimensions
     fig-ml-nb          Gaussian naive Bayes
     fig-ml-tree        Growing a decision tree
     fig-ml-regtree     A regression tree on the running example
     fig-quiz-ml3       Test yourself
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
    { name: 'Probability', color: '#b45309' },
    { name: 'Neighbours', color: '#1d4ed8' },
    { name: 'Trees', color: '#15803d' }
  ];
  var EVENTS = [
    { year: '1763', icon: '📜', era: 0, sec: 6, title: 'Bayes’ essay', text: 'Thomas Bayes’ essay on reasoning from evidence to causes is published after his death, the root of Bayes’ theorem.' },
    { year: '1951', icon: '📍', era: 1, sec: 3, title: 'Nearest neighbours', text: 'Evelyn Fix and Joseph Hodges describe classifying a new case by the classes of its nearest neighbours, in a report for the US Air Force.' },
    { year: '1957', icon: '🧊', era: 1, sec: 5, title: 'The curse of dimensionality', text: 'Richard Bellman coins the phrase for the explosive growth of space as dimensions are added.' },
    { year: '1961', icon: '📚', era: 0, sec: 7, title: 'Classifying documents', text: 'Melvin Maron uses word probabilities to assign documents to subjects automatically: an early naive Bayes text classifier.' },
    { year: '1963', icon: '🌳', era: 2, sec: 8, title: 'The first regression trees', text: 'James Morgan and John Sonquist split survey data by repeated binary questions in their AID program.' },
    { year: '1967', icon: '📐', era: 1, sec: 3, title: 'A guarantee', text: 'Thomas Cover and Peter Hart prove that with enough data, the nearest-neighbour rule has at most twice the lowest possible error.' },
    { year: '1984', icon: '🌲', era: 2, sec: 9, title: 'CART', text: 'Leo Breiman, Jerome Friedman, Richard Olshen and Charles Stone publish <em>Classification and Regression Trees</em>.' },
    { year: '1986', icon: '🧠', era: 2, sec: 9, title: 'ID3', text: 'Ross Quinlan describes ID3, which grows trees by choosing splits with the largest information gain.' },
    { year: '1993', icon: '✂️', era: 2, sec: 11, title: 'C4.5', text: 'Quinlan’s C4.5 adds pruning and handles missing and continuous values, becoming a standard tool.' },
    { year: '1997', icon: '🤔', era: 0, sec: 7, title: 'Why naive works', text: 'Pedro Domingos and Michael Pazzani show why naive Bayes can classify optimally even when its independence assumption is false.' },
    { year: '1998', icon: '📧', era: 0, sec: 7, title: 'Filtering junk e-mail', text: 'Mehran Sahami and colleagues apply naive Bayes to spam filtering, an approach that soon spread widely.' },
    { year: '2022', icon: '📊', era: 2, sec: 13, title: 'Trees still win on tables', text: 'A benchmark study finds tree-based models still outperform deep learning on typical tabular data.' }
  ];

  FIG['fig-ml3-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1763 to 2022');
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

  var ML_PART = 3;
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
     Models of Part 3: k-NN, Gaussian naive Bayes, CART trees
     ----------------------------------------------------------------------- */
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
     Figure: k-nearest neighbours
     ----------------------------------------------------------------------- */
  FIG['fig-ml-knn'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 1, k = 15, metric = 0, data = makeData('moons');
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); draw(); });
    var s1 = FIG.slider(controls, { id: 'kn-k', label: 'Number of neighbours k', min: 1, max: 61, step: 2, value: k, onChange: function (x) { k = x; draw(); } });
    choice(controls, 'Distance', ['Euclidean', 'Manhattan'], metric, function (i) { metric = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Training points and the k-nearest-neighbour vote'), W = A.W, svg = A.svg;
      valText(s1, String(k));
      var f = knnClf(data.train, k, metric), S = Math.min(W - 20, 380);
      drawClfPanel(svg, c, f, data, (W - S) / 2, 10, S, 280, { grid: 56 });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test);
      out.innerHTML = 'k = ' + k + ': training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>.' +
        NOTE + 'Each point of the plane takes the majority vote of its k nearest training points; the shading shows the share of orange votes. ' + (k <= 3 ? 'With very few neighbours the boundary wraps around individual points, including noisy ones: low bias, high variance, and perfect or near-perfect training accuracy that says little.' : k >= 41 ? 'With many neighbours the vote averages over a large region and the boundary becomes too smooth to follow the shape: high bias.' : 'A moderate k smooths out the noise while still following the shape of the classes.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: k-NN regression on the running example
     ----------------------------------------------------------------------- */
  FIG['fig-ml-knnreg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 3;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'kr-k', label: 'Number of neighbours k', min: 1, max: 15, step: 1, value: k, onChange: function (x) { k = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'k-nearest-neighbour regression on the running example'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(k));
      var f = knnReg(XTR, YTR, k), P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      var d = ''; for (var q = 0; q <= 400; q++) { var x = q / 400; d += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(f(x)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, svg);
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, 40, 12, W < 560 ? 'red: k-NN prediction' : 'red: average of the k nearest training points · orange: test data', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'k = ' + k + ': training error ' + efmt(mse(f, XTR, YTR)) + ', test error <strong>' + efmt(mse(f, XTE, YTE)) + '</strong>.' +
        NOTE + 'For regression, k-NN predicts the average of the k nearest training targets, giving a step-shaped curve. k = 1 reproduces every training point (training error 0) but jumps with the noise; k = 15 averages all the data into a flat line. Notice the poor fit in the gap between x = 0.13 and 0.37, where there are no training points to ask.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the curse of dimensionality
     ----------------------------------------------------------------------- */
  FIG['fig-ml-curse'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000], di = 1, cache = {};
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cu-d', label: 'Number of dimensions', min: 0, max: D.length - 1, step: 1, value: di, onChange: function (x) { di = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function dists(d) {
      if (cache[d]) return cache[d];
      var r = rngSeed(17 + d), N = 400, pts = [], i, j;
      for (i = 0; i < N; i++) { var p = new Float64Array(d); for (j = 0; j < d; j++) p[j] = r(); pts.push(p); }
      var q = new Float64Array(d); for (j = 0; j < d; j++) q[j] = r();
      var ds = pts.map(function (p) { var s = 0; for (var k = 0; k < d; k++) s += (p[k] - q[k]) * (p[k] - q[k]); return Math.sqrt(s); });
      return (cache[d] = ds);
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 220, 'Distances from one point to 400 random points'), W = A.W, svg = A.svg, fs = A.fs;
      var d = D[di]; valText(s1, String(d));
      var ds = dists(d), mn = Math.min.apply(null, ds), mx = Math.max.apply(null, ds), mu = mean(ds);
      var L = 30, R = W - 14, T = 24, B = 170, bins = 40, h = new Array(bins).fill(0);
      ds.forEach(function (v) { h[Math.min(bins - 1, Math.floor(v / mx * bins))]++; });
      var hm = Math.max.apply(null, h), bw = (R - L) / bins;
      h.forEach(function (v, i) { el('rect', { x: L + i * bw, y: B - v / hm * (B - T), width: bw - 1, height: v / hm * (B - T), fill: BLUE, opacity: 0.8 }, svg); });
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) { txt(svg, L + f * (R - L), B + 15, fmt(f * mx, mx > 10 ? 0 : 2), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'distance to the query point', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, W < 560 ? 'distances from one point to 400 others' : 'histogram of distances from one random point to 400 others in the unit cube', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'In ' + d + ' dimension' + (d > 1 ? 's' : '') + ': nearest neighbour at distance <strong>' + fmt(mn, 3) + '</strong>, farthest at <strong>' + fmt(mx, 3) + '</strong>; the nearest is ' + pct(mn / mx, 0) + ' of the farthest.' +
        NOTE + 'In low dimensions some points are close and others far, so “nearest” means something. As dimensions grow, all distances crowd around the same value: the nearest neighbour is hardly nearer than the farthest, and the idea behind k-NN breaks down. Real data usually lie near a lower-dimensional structure, which is why k-NN can still work, but irrelevant features hurt it badly.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Gaussian naive Bayes
     ----------------------------------------------------------------------- */
  FIG['fig-ml-nb'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 0, data = makeData('blobs');
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Naive Bayes class distributions and decision boundary'), W = A.W, svg = A.svg;
      var f = gnb(data.train), S = Math.min(W - 20, 380), L = (W - S) / 2, P = drawClfPanel(svg, c, f, data, L, 10, S, 280);
      var cid = 'nbclip' + Math.floor(Math.random() * 1e6), cp = el('clipPath', { id: cid }, svg); el('rect', { x: L, y: 10, width: S, height: 280 }, cp); var eg = el('g', { 'clip-path': 'url(#' + cid + ')' }, svg);
      f.st.forEach(function (s, cl) { [1, 2].forEach(function (k) { var rx = k * Math.sqrt(s.v[0]) * S / (CLF_BOX.xh - CLF_BOX.xl), ry = k * Math.sqrt(s.v[1]) * 280 / (CLF_BOX.yh - CLF_BOX.yl); el('ellipse', { cx: P.X(s.m[0]), cy: P.Y(s.m[1]), rx: rx, ry: ry, fill: 'none', stroke: cl ? AMBER : BLUE, 'stroke-width': 2, 'stroke-dasharray': k === 2 ? '5 4' : '' }, eg); }); el('circle', { cx: P.X(s.m[0]), cy: P.Y(s.m[1]), r: 5, fill: cl ? AMBER : BLUE, stroke: '#fff', 'stroke-width': 1.5 }, svg); });
      var tr = evalClf(f, data.train), te = evalClf(f, data.test);
      out.innerHTML = 'Training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>.' +
        NOTE + 'Gaussian naive Bayes models each class as a bell curve along each feature separately (ellipses: 1 and 2 standard deviations, always aligned with the axes because the features are assumed independent within each class). It then uses Bayes’ theorem to turn these into probabilities. ' + (di === 2 ? 'Because the inner class has a small spread and the outer a large one, the boundary becomes a closed curve, and naive Bayes separates the circles well.' : di === 1 ? 'The moons are not bell-shaped, so the model is a rough approximation, yet it still does reasonably.' : 'For roughly bell-shaped classes it does very well with almost no computation.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: growing a decision tree
     ----------------------------------------------------------------------- */
  FIG['fig-ml-tree'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 1, depth = 3, crit = 'gini', data = makeData('moons');
    var controls = div('fig-controls', container);
    choice(controls, 'Data', DS_NAMES, di, function (i) { di = i; data = makeData(DS_KEYS[i]); draw(); });
    var s1 = FIG.slider(controls, { id: 'tr-d', label: 'Maximum depth', min: 1, max: 12, step: 1, value: depth, onChange: function (x) { depth = x; draw(); } });
    choice(controls, 'Split criterion', ['Gini impurity', 'Entropy'], 0, function (i) { crit = i ? 'entropy' : 'gini'; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function rules(nd, d, pre, acc) { if (acc.length > 14) return; if (nd.leaf) { acc.push(pre + '→ ' + (nd.p >= 0.5 ? 'orange' : 'blue') + ' (' + nd.n + (nd.n === 1 ? ' point, ' : ' points, ') + pct(Math.max(nd.p, 1 - nd.p), 0) + ' pure)'); return; } var v = nd.j ? 'x₂' : 'x₁'; rules(nd.l, d + 1, pre + (pre ? ' and ' : 'if ') + v + ' ≤ ' + fmt(nd.t, 2) + ' ', acc); rules(nd.r, d + 1, pre + (pre ? ' and ' : 'if ') + v + ' > ' + fmt(nd.t, 2) + ' ', acc); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Decision tree partition of the plane'), W = A.W, svg = A.svg;
      valText(s1, String(depth));
      var f = growTree(data.train, depth, crit), S = Math.min(W - 20, 380), L = (W - S) / 2;
      var P = drawClfPanel(svg, c, f, data, L, 10, S, 280, { grid: 84 });
      (function lines(nd, x0, x1, y0, y1, lev) { if (nd.leaf || lev > 3) return; if (nd.j === 0) { el('line', { x1: P.X(nd.t), y1: P.Y(y0), x2: P.X(nd.t), y2: P.Y(y1), stroke: PURPLE, 'stroke-width': lev === 0 ? 2.5 : 1.4, opacity: 0.8 }, svg); lines(nd.l, x0, nd.t, y0, y1, lev + 1); lines(nd.r, nd.t, x1, y0, y1, lev + 1); } else { el('line', { x1: P.X(x0), y1: P.Y(nd.t), x2: P.X(x1), y2: P.Y(nd.t), stroke: PURPLE, 'stroke-width': lev === 0 ? 2.5 : 1.4, opacity: 0.8 }, svg); lines(nd.l, x0, x1, y0, nd.t, lev + 1); lines(nd.r, x0, x1, nd.t, y1, lev + 1); } })(f.root, CLF_BOX.xl, CLF_BOX.xh, CLF_BOX.yl, CLF_BOX.yh, 0);
      var tr = evalClf(f, data.train), te = evalClf(f, data.test), nl = countLeaves(f.root), rl = [];
      if (depth <= 3) rules(f.root, 0, '', rl);
      out.innerHTML = 'Depth ' + depth + ': ' + nl + ' leaves, training accuracy <strong>' + pct(tr[0], 0) + '</strong>, test accuracy <strong>' + pct(te[0], 0) + '</strong>.' +
        (rl.length ? '<br><span style="font-size:0.84rem;font-family:var(--font-mono, monospace);">' + rl.join('<br>') + '</span>' : '') +
        NOTE + 'Each split asks one yes/no question about one feature, so the boundary is made of horizontal and vertical steps (purple lines: the first splits). ' + (depth >= 8 ? 'A deep tree keeps splitting until almost every leaf is pure, carving out tiny regions around individual noisy points: overfitting.' : 'Deeper trees fit the training data more closely; past a point they start to fit noise.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: regression tree on the running example
     ----------------------------------------------------------------------- */
  FIG['fig-ml-regtree'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var depth = 2;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rt-d', label: 'Maximum depth', min: 0, max: 5, step: 1, value: depth, onChange: function (x) { depth = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Regression tree fitted to the running example'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(depth));
      var f = growRegTree(XTR, YTR, depth), P = plotFrame(svg, c, fs, 40, W - 14, 22, 200, -2, 2, [-2, -1, 0, 1, 2], 'x');
      curve(svg, P, truth, c.muted, 1.5, 0.7); svg.lastChild.setAttribute('stroke-dasharray', '5 4');
      XTE.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTE[i]), r: 2.4, fill: AMBER, opacity: 0.6 }, svg); });
      var d = ''; for (var q = 0; q <= 400; q++) { var x = q / 400; d += (q ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(f(x)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, svg);
      XTR.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(YTR[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, 40, 12, 'red: regression tree (a constant in each leaf)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Depth ' + depth + ' (up to ' + Math.pow(2, depth) + ' leaves): training error ' + efmt(mse(f, XTR, YTR)) + ', test error <strong>' + efmt(mse(f, XTE, YTE)) + '</strong>.' +
        NOTE + 'A regression tree splits x where it most reduces the squared error and predicts the mean of the training targets in each piece. The result is a staircase: it can follow any shape given enough splits, but it cannot extrapolate or produce a smooth curve, and deep trees chase individual points.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ml3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'How does k-nearest neighbours make a prediction?', options: ['It fits a line', 'It takes a vote (or average) of the k most similar training examples', 'It builds a tree of questions', 'It multiplies probabilities'], answer: 1, explanation: 'k-NN stores the training data and consults the nearest examples.' },
      { question: 'What happens as k increases in k-NN?', options: ['Variance rises', 'The boundary gets smoother: bias rises and variance falls', 'Training accuracy always improves', 'Nothing'], answer: 1, explanation: 'k = 1 memorises; very large k averages everything.' },
      { question: 'Why must features be scaled before using k-NN?', options: ['It speeds up training', 'Distances are dominated by features with large numerical ranges', 'It removes outliers', 'It is not necessary'], answer: 1, explanation: 'A feature in thousands swamps one in fractions.' },
      { question: 'The curse of dimensionality means that in many dimensions…', options: ['Computers run out of memory', 'Distances between points become nearly equal, so neighbours lose meaning', 'Data become normally distributed', 'Trees cannot be grown'], answer: 1, explanation: 'Points spread out and nearest and farthest become alike.' },
      { question: 'What does naive Bayes assume?', options: ['All classes are equally likely', 'Features are independent of each other within each class', 'Features are normally distributed overall', 'The data are linearly separable'], answer: 1, explanation: 'This lets it multiply simple one-feature probabilities.' },
      { question: 'Why does naive Bayes often classify well even when its assumption is false?', options: ['It does not use the assumption', 'Classification only needs the right class to have the highest score, not accurate probabilities', 'It ignores correlated features', 'It always has more data'], answer: 1, explanation: 'Its probabilities can be badly calibrated while its decisions are right.' },
      { question: 'A decision tree chooses each split to…', options: ['Balance the number of points', 'Most reduce impurity, such as Gini impurity or entropy', 'Use every feature once', 'Maximise depth'], answer: 1, explanation: 'Greedy splits maximise the impurity decrease.' },
      { question: 'A pure node has a Gini impurity of…', options: ['1', '0', '0.5', 'It depends on the depth'], answer: 1, explanation: 'All its points belong to one class.' },
      { question: 'A fully grown decision tree typically…', options: ['Underfits', 'Overfits: perfect training accuracy, worse test accuracy', 'Is the same as k-NN', 'Cannot be used for regression'], answer: 1, explanation: 'Limit depth, require minimum leaf sizes, or prune.' },
      { question: 'Small changes in the training data can produce a very different tree. This is…', options: ['High bias', 'High variance (instability)', 'Leakage', 'The curse of dimensionality'], answer: 1, explanation: 'Ensembles of trees, in Part 4, exploit and tame this.' }
    ]);
  };
})();
