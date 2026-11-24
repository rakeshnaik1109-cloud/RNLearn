/* ==========================================================================
   RNLearn — Plots for Machine Learning (Reading the Picture, Part 11)
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

  var ERAS = [
    { name: 'Statistical roots', color: '#b45309' },
    { name: 'Evaluating classifiers', color: '#7c3aed' },
    { name: 'Explaining models', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1901', icon: '📐', era: 0, sec: 9, title: 'Principal components', text: 'Karl Pearson finds the lines and planes of closest fit to a cloud of points; Harold Hotelling develops principal component analysis in 1933.' },
    { year: '1954', icon: '📡', era: 1, sec: 6, title: 'ROC curves', text: 'Signal-detection theory, developed for radar, introduces the receiver operating characteristic curve.' },
    { year: '1983', icon: '🌦️', era: 1, sec: 7, title: 'Reliability diagrams', text: 'Morris DeGroot and Stephen Fienberg analyse how well forecasters’ stated probabilities match outcomes.' },
    { year: '2001', icon: '🌲', era: 2, sec: 10, title: 'Permutation importance', text: 'Leo Breiman’s random forests introduce measuring a feature’s importance by shuffling it.' },
    { year: '2005', icon: '🎯', era: 1, sec: 7, title: 'Calibrating classifiers', text: 'Alexandru Niculescu-Mizil and Rich Caruana compare how well common learning algorithms’ probabilities are calibrated.' },
    { year: '2008', icon: '🗺️', era: 2, sec: 9, title: 't-SNE', text: 'Laurens van der Maaten and Geoffrey Hinton publish t-SNE for mapping high-dimensional data to two dimensions.' },
    { year: '2017', icon: '🧩', era: 2, sec: 10, title: 'SHAP', text: 'Scott Lundberg and Su-In Lee unify many explanation methods using Shapley values from game theory.' },
    { year: '2018', icon: '🌐', era: 2, sec: 9, title: 'UMAP', text: 'Leland McInnes and colleagues introduce UMAP, a faster alternative to t-SNE.' }
  ];
  FIG['fig-p11-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of key events');
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
     Shared for the series: random numbers, plotting helpers, logic gates
     ----------------------------------------------------------------------- */
  var EC = '#0e7490';
  function rngSeed(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sup10(e) { return '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; }
  function sciHTML(v, d) { if (v === 0) return '0'; var e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 4) return fmt(v, d === undefined ? 3 : d); return fmt(v / Math.pow(10, e), d === undefined ? 2 : d) + ' × 10<sup>' + e + '</sup>'; }
  /* A generic x–y plot frame. o = {L,R,T,B,xl,xh,yl,yh,xticks,yticks,xlab,ylab,logx,logy,xfmt,yfmt}; returns mappers and a clip id. */
  var PLOT_ID = 0;
  function plotAxes(svg, c, fs, o) {
    var lx = function (v) { return o.logx ? Math.log10(v) : v; }, ly = function (v) { return o.logy ? Math.log10(Math.max(v, 1e-300)) : v; };
    var X = function (v) { return o.L + (lx(v) - lx(o.xl)) / (lx(o.xh) - lx(o.xl)) * (o.R - o.L); }, Y = function (v) { return o.B - (ly(v) - ly(o.yl)) / (ly(o.yh) - ly(o.yl)) * (o.B - o.T); };
    (o.yticks || []).forEach(function (v) { el('line', { x1: o.L, y1: Y(v), x2: o.R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, o.L - 6, Y(v) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); if (o.logy) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.yfmt ? o.yfmt(v) : String(v); });
    (o.xticks || []).forEach(function (v) { var t = txt(svg, X(v), o.B + 14, '', { size: fs(9), fill: c.muted }); if (o.logx) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.xfmt ? o.xfmt(v) : String(v); });
    el('line', { x1: o.L, y1: o.B, x2: o.R, y2: o.B, stroke: c.muted }, svg); el('line', { x1: o.L, y1: o.T, x2: o.L, y2: o.B, stroke: c.muted }, svg);
    if (o.xlab) txt(svg, (o.L + o.R) / 2, o.B + 30, o.xlab, { size: fs(10), fill: c.muted });
    if (o.ylab) { var yt = txt(svg, 12, (o.T + o.B) / 2, o.ylab, { size: fs(10), fill: c.muted }); yt.setAttribute('transform', 'rotate(-90 12 ' + ((o.T + o.B) / 2) + ')'); }
    var id = 'pc' + (++PLOT_ID), cp = el('clipPath', { id: id }, svg); el('rect', { x: o.L, y: o.T - 2, width: o.R - o.L, height: o.B - o.T + 4 }, cp);
    return { X: X, Y: Y, clip: 'url(#' + id + ')' };
  }
  function plotLine(svg, P, f, x0, x1, n, col, w, dash, logx) { var d = ''; for (var k = 0; k <= n; k++) { var x = logx ? Math.pow(10, Math.log10(x0) + (Math.log10(x1) - Math.log10(x0)) * k / n) : x0 + (x1 - x0) * k / n, y = f(x); if (!isFinite(y)) continue; d += (d ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); } el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2.2, 'stroke-dasharray': dash || 'none', 'clip-path': P.clip }, svg); }
  function legend(svg, c, fs, W, wide, narrow) { txt(svg, 10, 14, W < 520 ? narrow : wide, { anchor: 'start', size: fs(10), fill: c.muted }); }
  /* -----------------------------------------------------------------------
     Shared for Reading the Picture: palette, random data and statistics
     ----------------------------------------------------------------------- */
  var PC = '#6b21a8';
  var OI = ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#CC79A7', '#56B4E9', '#F0E442', '#000000']; /* Okabe–Ito colour-blind-safe palette */
  function rnorm(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function sampleN(seed, n, mu, sd) { var r = rngSeed(seed), a = []; for (var i = 0; i < n; i++) a.push(mu + sd * rnorm(r)); return a; }
  function qsorted(s, q) { var h = (s.length - 1) * q, i = Math.floor(h); return i + 1 < s.length ? s[i] + (h - i) * (s[i + 1] - s[i]) : s[i]; }
  function boxStats(a) {
    var s = a.slice().sort(function (x, y) { return x - y; }), q1 = qsorted(s, 0.25), q2 = qsorted(s, 0.5), q3 = qsorted(s, 0.75), iqr = q3 - q1;
    var lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr, inl = s.filter(function (v) { return v >= lo && v <= hi; });
    return { q1: q1, med: q2, q3: q3, iqr: iqr, wlo: inl[0], whi: inl[inl.length - 1], out: s.filter(function (v) { return v < lo || v > hi; }), min: s[0], max: s[s.length - 1], n: s.length, mean: mean(s), sd: s.length > 1 ? sdv(s) : 0 };
  }
  function kde(a, bw, x) { var s = 0; for (var i = 0; i < a.length; i++) { var z = (x - a[i]) / bw; s += Math.exp(-0.5 * z * z); } return s / (a.length * bw * Math.sqrt(2 * Math.PI)); }
  function silverman(a) { var s = boxStats(a); return 0.9 * Math.min(s.sd, s.iqr / 1.34) * Math.pow(a.length, -0.2); }
  function linfit(xs, ys) { var mx = mean(xs), my = mean(ys), sxy = 0, sxx = 0, syy = 0; for (var i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); syy += (ys[i] - my) * (ys[i] - my); } var b = sxy / sxx; return { a: my - b * mx, b: b, r: sxy / Math.sqrt(sxx * syy) }; }
  function niceTicks(lo, hi, n) { var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / (n || 5)))), err = span / (n || 5) / step; if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2; var t = [], v = Math.ceil(lo / step - 1e-9) * step; for (; v <= hi + 1e-9; v += step) t.push(+v.toFixed(10)); return t; }
  function lineXY(svg, P, xs, ys, col, w, dash) { var d = ''; xs.forEach(function (x, i) { d += (i ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(ys[i]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2, 'stroke-dasharray': dash || '' }, svg); }
  function legend2(svg, x, y, items, fs, c) { items.forEach(function (it, i) { el('line', { x1: x + i * 110, y1: y, x2: x + i * 110 + 18, y2: y, stroke: it[1], 'stroke-width': 2.5 }, svg); txt(svg, x + i * 110 + 22, y + 4, it[0], { anchor: 'start', size: fs(9.5), fill: c.ink2 }); }); }

  /* -----------------------------------------------------------------------
     Figure: learning curves
     ----------------------------------------------------------------------- */
  FIG['fig-learning-curve'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Too simple (high bias)', 'About right', 'Too complex (high variance)'], k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var ns = [50, 100, 200, 400, 800, 1600, 3200], r = rngSeed(11 + k);
      var tr = ns.map(function (n) { var t = Math.log(n / 50) / Math.log(64); return [0.8 - 0.04 * t, 0.97 - 0.06 * t, 1.0][k] + 0.005 * rnorm(r); });
      var va = ns.map(function (n) { var t = Math.log(n / 50) / Math.log(64); return [0.72 + 0.05 * t, 0.68 + 0.22 * t, 0.6 + 0.2 * t][k] + 0.008 * rnorm(r); });
      var c = C(), A = newSVG(svgWrap, container, 280, 'Training and validation accuracy against the number of training examples'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 240, xl: 50, xh: 3200, yl: 0.55, yh: 1.02, xticks: [50, 200, 800, 3200], yticks: [0.6, 0.7, 0.8, 0.9, 1.0], logx: true, xlab: 'number of training examples (log scale)', ylab: 'accuracy' });
      svg.querySelectorAll('text').forEach(function (t) { if (t.innerHTML.indexOf('tspan') > -1) t.textContent = ''; });
      [50, 200, 800, 3200].forEach(function (n) { txt(svg, P.X(n), 254, String(n), { size: fs(9), fill: c.muted }); });
      lineXY(svg, P, ns, tr, OI[0], 2.2); lineXY(svg, P, ns, va, OI[3], 2.2);
      legend2(svg, 60, 14, [['training', OI[0]], ['validation', OI[3]]], fs, c);
      out.innerHTML = ['Both curves level off at a low accuracy and close together. More data will not help: the model is too simple to capture the pattern (<strong>underfitting</strong>, high bias). Try a more flexible model or better features.', 'The validation accuracy rises with more data and the gap narrows. The model generalises well; more data would still help a little.', 'Training accuracy is perfect but validation accuracy is much lower: a big gap means the model memorises the training data (<strong>overfitting</strong>, high variance). More data narrows the gap; so would regularisation or a simpler model.'][k] + NOTE + 'A learning curve plots performance on the training data and on held-out validation data as the training set grows. The gap between the curves and where they level off tell you whether to collect more data, use a more complex model, or a simpler one. The curves here are illustrative.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: training loss curves
     ----------------------------------------------------------------------- */
  FIG['fig-loss-curves'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Training run', ['Learning rate too low', 'Good', 'Learning rate too high', 'Overfitting'], k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var E = [], tr = [], va = [], r = rngSeed(30 + k);
      for (var e = 0; e <= 100; e++) { E.push(e); var t, v;
        if (k === 0) { t = 2.3 * Math.exp(-e / 160) + 0.2; v = t + 0.05; }
        else if (k === 1) { t = 2.1 * Math.exp(-e / 12) + 0.25; v = 2.1 * Math.exp(-e / 12) + 0.33; }
        else if (k === 2) { t = 1.2 + 0.6 * Math.abs(Math.sin(e * 0.9)) + 0.004 * e; v = t + 0.1; }
        else { t = 2.1 * Math.exp(-e / 10) + 0.05 * Math.exp(-e / 60); v = 2.1 * Math.exp(-e / 10) + 0.35 + 0.006 * Math.max(0, e - 15); }
        tr.push(Math.max(0.02, t + 0.025 * rnorm(r))); va.push(Math.max(0.02, v + 0.04 * rnorm(r))); }
      var c = C(), A = newSVG(svgWrap, container, 280, 'Training and validation loss over 100 epochs'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 240, xl: 0, xh: 100, yl: 0, yh: 2.6, xticks: [0, 25, 50, 75, 100], yticks: [0, 1, 2], xlab: 'epoch', ylab: 'loss' });
      lineXY(svg, P, E, tr, OI[0], 2); lineXY(svg, P, E, va, OI[3], 2);
      if (k === 3) { var best = va.indexOf(Math.min.apply(null, va)); el('line', { x1: P.X(best), y1: 30, x2: P.X(best), y2: 240, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg); txt(svg, P.X(best) + 5, 44, 'early stopping', { anchor: 'start', size: fs(9), fill: c.muted }); }
      legend2(svg, 60, 14, [['training loss', OI[0]], ['validation loss', OI[3]]], fs, c);
      out.innerHTML = ['Both losses fall, but very slowly: after 100 epochs training is far from finished. Increase the learning rate or train for longer.', 'Both losses fall quickly and flatten, with validation loss a little above training loss. A healthy run.', 'The loss jumps around and never settles, and may even grow: each step overshoots. Reduce the learning rate.', 'Training loss keeps falling, but validation loss reaches a minimum and then rises: the model has started to memorise noise in the training data. Stop at the minimum (<strong>early stopping</strong>), or add regularisation or data.'][k] + NOTE + 'Loss curves are the first thing to check when training a neural network or any iteratively trained model. Always plot a validation curve as well as the training curve: the training loss alone cannot reveal overfitting. The curves are illustrative.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: confusion matrix
     ----------------------------------------------------------------------- */
  FIG['fig-confusion'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CL = ['Cat', 'Dog', 'Fox'], M = [[480, 60, 10], [70, 300, 30], [8, 22, 20]], norm = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['Counts', 'Row %: recall', 'Column %: precision'], norm, function (i) { norm = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var rs = M.map(function (r) { return r.reduce(function (a, b) { return a + b; }, 0); }), cs = CL.map(function (_, j) { return M.reduce(function (s, r) { return s + r[j]; }, 0); }), tot = rs.reduce(function (a, b) { return a + b; }, 0), acc = (M[0][0] + M[1][1] + M[2][2]) / tot;
      var c = C(), A = newSVG(svgWrap, container, 290, 'A three-class confusion matrix'), W = A.W, svg = A.svg, fs = A.fs, S = Math.min(70, (W - 140) / 3), L = (W - 3 * S) / 2 + 20, T = 40;
      M.forEach(function (row, i) { txt(svg, L - 8, T + i * S + S / 2 + 4, CL[i], { anchor: 'end', size: fs(10), fill: c.ink2, weight: 700 }); row.forEach(function (v, j) { var val = norm === 0 ? v : norm === 1 ? v / rs[i] : v / cs[j], t = norm === 0 ? Math.sqrt(v / 480) : val; el('rect', { x: L + j * S, y: T + i * S, width: S - 2, height: S - 2, fill: cmapB(t) }, svg); txt(svg, L + j * S + S / 2 - 1, T + i * S + S / 2 + 4, norm === 0 ? String(v) : Math.round(100 * val) + '%', { size: fs(11), fill: t > 0.5 ? '#fff' : '#222', weight: i === j ? 700 : 400 }); }); txt(svg, L + i * S + S / 2, T - 8, CL[i], { size: fs(10), fill: c.ink2, weight: 700 }); });
      txt(svg, L + 1.5 * S, 16, 'predicted class', { size: fs(9.5), fill: c.muted });
      var lt = txt(svg, L - 50, T + 1.5 * S, 'true class', { size: fs(9.5), fill: c.muted }); lt.setAttribute('transform', 'rotate(-90 ' + (L - 50) + ' ' + (T + 1.5 * S) + ')');
      out.innerHTML = 'Overall accuracy <strong>' + fmt(100 * acc, 0) + '%</strong>, but recall for foxes is only <strong>' + Math.round(100 * M[2][2] / rs[2]) + '%</strong> and precision for foxes ' + Math.round(100 * M[2][2] / cs[2]) + '%. ' + ['Raw counts are dominated by the common classes; the 50 foxes are easy to overlook.', 'Each row is divided by its total, so the diagonal shows <strong>recall</strong>: of all true dogs, what share were called dogs?', 'Each column is divided by its total, so the diagonal shows <strong>precision</strong>: of everything called a fox, what share really were foxes?'][norm] + NOTE + 'A confusion matrix counts predictions against true classes: correct predictions on the diagonal, mistakes off it. It shows not just how often a model is wrong, but <em>which</em> classes it confuses (here, cats and dogs). With imbalanced classes, look at the normalised versions; accuracy alone can hide a class the model almost never gets right. The counts are synthetic; the companion article on model metrics covers every score derived from the matrix.</span>';
    }
    function cmapB(t) { t = Math.max(0, Math.min(1, t)); return 'rgb(' + Math.round(240 - 210 * t) + ',' + Math.round(244 - 150 * t) + ',' + Math.round(250 - 80 * t) + ')'; }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: ROC and precision–recall curves with a moving threshold
     ----------------------------------------------------------------------- */
  FIG['fig-roc-pr'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var thr = 0.5, prev = 0.1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rp-t', label: 'Decision threshold', min: 0.02, max: 0.98, step: 0.02, value: thr, onChange: function (x) { thr = x; draw(); } });
    FIG.slider(controls, { id: 'rp-p', label: 'Share of positives in the data', min: 0.01, max: 0.5, step: 0.01, value: prev, onChange: function (x) { prev = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var d = 1.6;
    function tpr(t) { var z = Math.log(t / (1 - t)); return 1 - ncdf(z - d / 2); }
    function fpr(t) { var z = Math.log(t / (1 - t)); return 1 - ncdf(z + d / 2); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 560 ? 520 : 280, 'An ROC curve and a precision–recall curve with the current threshold marked'), W = A.W, svg = A.svg, fs = A.fs, wide = W >= 560, pw = wide ? W / 2 : W, ts = [];
      for (var i = 1; i < 200; i++) ts.push(i / 200);
      var P1 = plotAxes(svg, c, fs, { L: 44, R: pw - 14, T: 22, B: 230, xl: 0, xh: 1, yl: 0, yh: 1, xticks: [0, 0.5, 1], yticks: [0, 0.5, 1], xlab: 'false positive rate' });
      txt(svg, 14, 126, '', {}); var yl1 = txt(svg, 14, 126, 'true positive rate (recall)', { size: fs(9.5), fill: c.muted }); yl1.setAttribute('transform', 'rotate(-90 14 126)');
      el('line', { x1: P1.X(0), y1: P1.Y(0), x2: P1.X(1), y2: P1.Y(1), stroke: c.border, 'stroke-dasharray': '4 4' }, svg);
      lineXY(svg, P1, ts.map(fpr).concat([0]), ts.map(tpr).concat([0]), OI[0], 2.2); el('circle', { cx: P1.X(fpr(thr)), cy: P1.Y(tpr(thr)), r: 6, fill: OI[3] }, svg); txt(svg, (44 + pw - 14) / 2, 14, 'ROC curve', { size: fs(10), fill: c.ink2, weight: 700 });
      var x0 = wide ? pw : 0, y0 = wide ? 0 : 265, P2 = plotAxes(svg, c, fs, { L: x0 + 44, R: W - 14, T: y0 + 22, B: y0 + 230, xl: 0, xh: 1, yl: 0, yh: 1, xticks: [0, 0.5, 1], yticks: [0, 0.5, 1], xlab: 'recall' });
      var yl2 = txt(svg, x0 + 14, y0 + 126, 'precision', { size: fs(9.5), fill: c.muted }); yl2.setAttribute('transform', 'rotate(-90 ' + (x0 + 14) + ' ' + (y0 + 126) + ')');
      var prec = function (t) { var tp = prev * tpr(t), fp = (1 - prev) * fpr(t); return tp / Math.max(1e-9, tp + fp); };
      el('line', { x1: P2.X(0), y1: P2.Y(prev), x2: P2.X(1), y2: P2.Y(prev), stroke: c.border, 'stroke-dasharray': '4 4' }, svg);
      lineXY(svg, P2, ts.map(tpr), ts.map(prec), OI[2], 2.2); el('circle', { cx: P2.X(tpr(thr)), cy: P2.Y(prec(thr)), r: 6, fill: OI[3] }, svg); txt(svg, (x0 + 44 + W - 14) / 2, y0 + 14, 'precision–recall curve', { size: fs(10), fill: c.ink2, weight: 700 });
      var auc = 0, pf = 1, pt = 1; for (var k = 1; k <= 400; k++) { var t = k / 401, f = fpr(t), tt = tpr(t); auc += (pf - f) * (pt + tt) / 2; pf = f; pt = tt; } auc += pf * pt / 2;
      out.innerHTML = 'Threshold ' + fmt(thr, 2) + ': recall <strong>' + fmt(100 * tpr(thr), 0) + '%</strong>, false positive rate ' + fmt(100 * fpr(thr), 0) + '%, precision <strong>' + fmt(100 * prec(thr), 0) + '%</strong>. ROC AUC ≈ ' + fmt(auc, 2) + ' (does not depend on the share of positives).' + NOTE + 'Each threshold turns a model’s scores into yes/no decisions, giving one point on each curve; sliding it traces the whole curve. The <strong>ROC curve</strong> plots the true positive rate against the false positive rate; its shape does not change when positives become rarer. The <strong>precision–recall curve</strong> does: lower the share of positives and precision collapses, because even a small false positive rate produces many false alarms among a large majority of negatives. For rare events, look at the PR curve. The scores are simulated; the companion article on model metrics explains every measure in detail.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: calibration (reliability) diagram
     ----------------------------------------------------------------------- */
  FIG['fig-calibration'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Well calibrated', 'Overconfident', 'Underconfident'], k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var r = rngSeed(90 + k), bins = []; for (var b = 0; b < 10; b++) bins.push([0, 0, 0]);
      for (var i = 0; i < 4000; i++) { var p = r(), q = k === 0 ? p : k === 1 ? 1 / (1 + Math.exp(-3 * Math.log(p / (1 - p)))) : 1 / (1 + Math.exp(-0.45 * Math.log(p / (1 - p)))), y = r() < p ? 1 : 0, bi = Math.min(9, Math.floor(q * 10)); bins[bi][0] += q; bins[bi][1] += y; bins[bi][2]++; }
      var c = C(), A = newSVG(svgWrap, container, 300, 'A reliability diagram comparing predicted probabilities with observed frequencies'), W = A.W, svg = A.svg, fs = A.fs, S = Math.min(W - 80, 240), x0 = (W - S) / 2 + 10;
      var P = plotAxes(svg, c, fs, { L: x0, R: x0 + S, T: 14, B: 14 + S, xl: 0, xh: 1, yl: 0, yh: 1, xticks: [0, 0.5, 1], yticks: [0, 0.5, 1], xlab: 'predicted probability', ylab: 'observed frequency' });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(1), y2: P.Y(1), stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      var mx = Math.max.apply(null, bins.map(function (b) { return b[2]; })), xs = [], ys = [], ece = 0;
      bins.forEach(function (b, j) { el('rect', { x: P.X(j / 10) + 1, y: 14 + S - 30 * b[2] / mx, width: S / 10 - 2, height: 30 * b[2] / mx, fill: c.border }, svg); if (b[2] > 20) { xs.push(b[0] / b[2]); ys.push(b[1] / b[2]); ece += b[2] * Math.abs(b[0] / b[2] - b[1] / b[2]); } });
      lineXY(svg, P, xs, ys, OI[0], 2.2); xs.forEach(function (x, j) { el('circle', { cx: P.X(x), cy: P.Y(ys[j]), r: 4, fill: OI[0] }, svg); });
      out.innerHTML = 'Expected calibration error: <strong>' + fmt(100 * ece / 4000, 1) + ' percentage points</strong>. ' + ['The points follow the diagonal: when the model says 70%, the event happens about 70% of the time.', 'The curve is flatter than the diagonal: above it on the left and below it on the right. When the model says 90%, the event happens far less often, and when it says 10%, far more often. Its probabilities are too extreme.', 'The curve is steeper than the diagonal: below it on the left and above it on the right. The model’s probabilities huddle near 50% even when it could be more certain.'][k] + NOTE + 'A reliability diagram groups predictions into bins by their predicted probability and plots, for each bin, how often the event actually happened. A well-calibrated model lies on the diagonal. Calibration matters whenever probabilities are used for decisions, such as medical risk or weather forecasts; a model can rank cases well (high AUC) and still be badly calibrated. The grey bars show how many predictions fall in each bin. The predictions are simulated.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: decision boundaries of k-nearest neighbours
     ----------------------------------------------------------------------- */
  FIG['fig-boundary'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(4), PTS = [];
    for (var i = 0; i < 240; i++) { var cl = i % 2, t = Math.PI * r(), x = cl ? 1 - Math.cos(t) : Math.cos(t), y = cl ? 0.5 - Math.sin(t) : Math.sin(t); PTS.push([x + 0.3 * rnorm(r), y + 0.3 * rnorm(r), cl]); }
    var k = 15;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bd-k', label: 'Number of neighbours k', min: 1, max: 119, step: 2, value: k, onChange: function (x) { k = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function predict(x, y) { var d = PTS.map(function (p) { return [(p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y), p[2]]; }); d.sort(function (a, b) { return a[0] - b[0]; }); var s = 0; for (var j = 0; j < k; j++) s += d[j][1]; return s / k; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Points of two classes and the regions a k-nearest-neighbour classifier assigns to each'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 30, R: W - 14, T: 10, B: 285, xl: -1.8, xh: 2.8, yl: -1.4, yh: 1.8, xticks: [], yticks: [] }), nx = 46, ny = 30, cw = (W - 44) / nx, ch = 275 / ny;
      var g = el('g', { opacity: 0.55 }, svg);
      for (var ix = 0; ix < nx; ix++) for (var iy = 0; iy < ny; iy++) { var x = -1.8 + 4.6 * (ix + 0.5) / nx, y = 1.8 - 3.2 * (iy + 0.5) / ny, p = predict(x, y); el('rect', { x: 30 + ix * cw, y: 10 + iy * ch, width: cw + 0.5, height: ch + 0.5, fill: 'rgb(' + Math.round(60 + 170 * (1 - p)) + ',' + Math.round(110 + 60 * Math.abs(p - 0.5) * 0) + ',' + Math.round(60 + 170 * p) + ')' }, g); }
      var err = 0; PTS.forEach(function (pt) { el('circle', { cx: P.X(pt[0]), cy: P.Y(pt[1]), r: 3, fill: pt[2] ? OI[0] : OI[3], stroke: '#fff', 'stroke-width': 0.6 }, svg); if ((predict(pt[0], pt[1]) > 0.5 ? 1 : 0) !== pt[2]) err++; });
      out.innerHTML = 'k = ' + k + ': training accuracy <strong>' + fmt(100 * (1 - err / PTS.length), 0) + '%</strong>. ' + (k <= 3 ? 'With so few neighbours the boundary is jagged and wraps around individual points: it memorises noise (overfitting), so training accuracy is near perfect but new points will often be misclassified.' : k >= 80 ? 'With so many neighbours the boundary becomes too smooth and misses the curved shape of the classes (underfitting).' : 'A moderate k follows the interlocking crescents without chasing individual noisy points.') + NOTE + 'For models with two input features, colouring every point of the plane by the class the model would predict shows its <strong>decision boundary</strong> directly. Here a k-nearest-neighbour classifier gives each location the majority class of its k nearest training points. Watching the boundary change with model settings is the clearest way to see overfitting and underfitting. The data are synthetic “two moons”.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p11'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A learning curve with a large gap between high training accuracy and lower validation accuracy suggests…', options: ['Underfitting', 'Overfitting', 'A perfect model', 'Too little noise'], answer: 1, explanation: 'More data or regularisation can help.' },
      { question: 'If training and validation curves both level off at a low accuracy, the model is…', options: ['Overfitting', 'Too simple (underfitting)', 'Perfect', 'Broken'], answer: 1, explanation: 'More data will not help much.' },
      { question: 'Validation loss falls and then rises while training loss keeps falling. What should you do?', options: ['Train longer', 'Stop at the validation minimum (early stopping) or regularise', 'Increase the learning rate', 'Ignore it'], answer: 1, explanation: 'The model has begun to memorise.' },
      { question: 'A loss curve that jumps around and never settles usually means…', options: ['The learning rate is too high', 'The model is perfect', 'There is too much data', 'Overfitting'], answer: 0, explanation: 'Each step overshoots.' },
      { question: 'In a confusion matrix normalised by rows, the diagonal shows…', options: ['Precision', 'Recall for each class', 'Accuracy', 'F1'], answer: 1, explanation: 'Normalise by columns for precision.' },
      { question: 'Which curve changes shape when positives become rarer?', options: ['ROC', 'Precision–recall', 'Both equally', 'Neither'], answer: 1, explanation: 'ROC is insensitive to class balance.' },
      { question: 'What does a reliability diagram check?', options: ['Speed', 'Whether predicted probabilities match observed frequencies', 'Feature importance', 'Training time'], answer: 1, explanation: 'Calibrated models lie on the diagonal.' },
      { question: 'A very small k in k-nearest neighbours gives a decision boundary that is…', options: ['Smooth', 'Jagged, wrapping around individual points', 'Straight', 'Missing'], answer: 1, explanation: 'It overfits.' },
      { question: 'In a t-SNE map, the distance between two well-separated clusters…', options: ['Is exactly meaningful', 'Should not be over-interpreted', 'Is always zero', 'Shows their size'], answer: 1, explanation: 't-SNE preserves local neighbourhoods, not global distances.' },
      { question: 'Permutation importance measures a feature’s importance by…', options: ['Its correlation with the target', 'How much performance drops when the feature is shuffled', 'Its mean value', 'The number of times it is used'], answer: 1, explanation: 'Breiman, 2001.' }
    ]);
  };
})();
