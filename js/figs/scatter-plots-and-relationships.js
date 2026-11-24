/* ==========================================================================
   RNLearn — Scatter Plots and Relationships (Reading the Picture, Part 6)
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
    { name: 'First scatter plots', color: '#b45309' },
    { name: 'Correlation and its traps', color: '#7c3aed' },
    { name: 'Modern tools', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1833', icon: '✨', era: 0, sec: 11, title: 'Herschel’s double stars', text: 'John Herschel plots the measured angles of a double star against time to work out its orbit: an early scatter plot with a smoothed curve.' },
    { year: '1886', icon: '👪', era: 0, sec: 11, title: 'Regression', text: 'Francis Galton plots children’s heights against their parents’ and finds “regression towards mediocrity”.' },
    { year: '1896', icon: '🔢', era: 1, sec: 4, title: 'Pearson’s r', text: 'Karl Pearson gives the correlation coefficient its modern mathematical form.' },
    { year: '1951', icon: '🔀', era: 1, sec: 6, title: 'Simpson’s paradox', text: 'Edward Simpson describes how a relationship can reverse when data are combined across groups.' },
    { year: '1979', icon: '〰️', era: 2, sec: 5, title: 'LOWESS', text: 'William Cleveland publishes robust locally weighted regression for smoothing scatter plots.' },
    { year: '1983', icon: '🔲', era: 2, sec: 9, title: 'Scatter-plot matrices', text: 'Chambers, Cleveland, Kleiner and Tukey’s Graphical Methods for Data Analysis popularises the matrix of all pairwise scatter plots.' },
    { year: '1987', icon: '⬢', era: 2, sec: 7, title: 'Hexagon binning', text: 'Daniel Carr and colleagues propose hexagonal bins for scatter plots with very many points.' }
  ];
  FIG['fig-p6-timeline'] = function (figEl) {
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
  function dotsSVG(svg, P, xs, ys, col, r, op) { xs.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(ys[i]), r: r || 3, fill: col, 'fill-opacity': op || 0.75 }, svg); }); }
  function lowessJS(xs, ys, frac) { var n = xs.length, k = Math.max(3, Math.round(frac * n)), idx = xs.map(function (_, i) { return i; }).sort(function (a, b) { return xs[a] - xs[b]; }), X = idx.map(function (i) { return xs[i]; }), Y = idx.map(function (i) { return ys[i]; }), out = [];
    for (var i = 0; i < n; i += Math.max(1, Math.floor(n / 80))) { var d = X.map(function (x) { return Math.abs(x - X[i]); }), h = d.slice().sort(function (a, b) { return a - b; })[k - 1] || 1e-9, sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (var j = 0; j < n; j++) { var u = d[j] / h; if (u >= 1) continue; var w = Math.pow(1 - u * u * u, 3); sw += w; sx += w * X[j]; sy += w * Y[j]; sxx += w * X[j] * X[j]; sxy += w * X[j] * Y[j]; }
      var den = sw * sxx - sx * sx, b = Math.abs(den) < 1e-12 ? 0 : (sw * sxy - sx * sy) / den, a = (sy - b * sx) / sw; out.push([X[i], a + b * X[i]]); }
    return out; }

  /* -----------------------------------------------------------------------
     Figure: reading a scatter plot
     ----------------------------------------------------------------------- */
  FIG['fig-scatter-read'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SETS = ['Positive, linear', 'Negative, linear', 'Curved (U-shape)', 'Two clusters', 'One outlier', 'No relationship', 'Fan-shaped'], k = 0, fit = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Pattern', SETS, k, function (i) { k = i; draw(); });
    choice(controls, 'Straight-line fit', ['Show', 'Hide'], 0, function (i) { fit = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function data(i) { var r = rngSeed(200 + i), X = [], Y = []; for (var j = 0; j < 70; j++) { var x = 10 * r(), e = rnorm(r), y;
        if (i === 0) y = 2 + 0.7 * x + e; else if (i === 1) y = 9 - 0.6 * x + e; else if (i === 2) y = 1.5 + 0.28 * (x - 5) * (x - 5) + 0.6 * e; else if (i === 3) { x = j % 2 ? 2 + 1.2 * r() : 7 + 1.2 * r(); y = j % 2 ? 7 + 0.6 * e : 3 + 0.6 * e; } else if (i === 4) { y = 5 + 0.05 * (x - 5) + 0.9 * e; if (j === 0) { x = 9.6; y = 13; } } else if (i === 5) y = 5 + 1.6 * e; else y = 5 + 0.3 * x + 0.12 * x * e;
        X.push(x); Y.push(y); } return [X, Y]; }
    function draw() {
      var d = data(k), f = linfit(d[0], d[1]), c = C(), A = newSVG(svgWrap, container, 290, 'A scatter plot showing the chosen pattern'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 14, B: 250, xl: 0, xh: 10, yl: -1, yh: 14, xticks: [0, 5, 10], yticks: [0, 5, 10], xlab: 'x', ylab: 'y' });
      dotsSVG(svg, P, d[0], d[1], OI[0], 3.5);
      if (fit) el('line', { x1: P.X(0), y1: P.Y(f.a), x2: P.X(10), y2: P.Y(f.a + 10 * f.b), stroke: OI[3], 'stroke-width': 2, 'clip-path': P.clip }, svg);
      var msg = ['A clear upward trend: as x increases, y tends to increase. The points scatter evenly around a straight line.', 'A downward (negative) relationship of similar strength.', 'A strong relationship that is not a straight line. The correlation is near zero, because r measures only <em>linear</em> association.', 'Within each cluster there is no trend, but the two clusters create a strong negative correlation. Look for a grouping variable.', 'One extreme point at the top right: compare the line and r with the outlier selected and imagine it removed. A single point can create or destroy a correlation.', 'A cloud with no visible pattern: knowing x tells you nothing about y.', 'The spread of y grows with x. The trend is real, but predictions are much less precise for large x.'][k];
      out.innerHTML = 'Correlation r = <strong>' + fmt(f.r, 2) + '</strong>. ' + msg + NOTE + 'Read a scatter plot for <strong>direction</strong> (up or down), <strong>form</strong> (straight, curved, clustered), <strong>strength</strong> (how tightly the points follow the form) and <strong>exceptions</strong> (outliers, subgroups, changing spread). The single number r describes only the strength of a straight-line relationship.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: guess the correlation
     ----------------------------------------------------------------------- */
  FIG['fig-guess-r'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var trial = 1, guess = 0.5, shown = false, errs = [], X, Y, R;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'gr-g', label: 'Your guess for r', min: -1, max: 1, step: 0.05, value: guess, onChange: function (x) { guess = x; } });
    var row = group(controls, 'Answer'); var bC = btn('Check', row), bN = btn('New plot', row);
    bC.addEventListener('click', function () { if (!shown) { shown = true; errs.push(Math.abs(guess - R)); draw(); } });
    bN.addEventListener('click', function () { trial++; shown = false; make(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function make() { var r = rngSeed(trial * 71), rho = Math.round((2 * r() - 1) * 100) / 100; X = []; Y = []; for (var i = 0; i < 60; i++) { var a = rnorm(r), b = rnorm(r); X.push(a); Y.push(rho * a + Math.sqrt(1 - rho * rho) * b); } R = linfit(X, Y).r; }
    make();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'A scatter plot whose correlation you are asked to guess'), W = A.W, svg = A.svg, fs = A.fs, S = Math.min(W - 60, 260), x0 = (W - S) / 2;
      var P = plotAxes(svg, c, fs, { L: x0, R: x0 + S, T: 10, B: 10 + S, xl: -3, xh: 3, yl: -3, yh: 3, xticks: [], yticks: [] });
      dotsSVG(svg, P, X, Y, OI[0], 3.5);
      out.innerHTML = (shown ? 'True r = <strong>' + fmt(R, 2) + '</strong>; you guessed ' + fmt(guess, 2) + ' (error ' + fmt(Math.abs(guess - R), 2) + '). ' : 'Estimate the correlation, then press Check. ') + (errs.length ? 'Average error over ' + errs.length + ' plot' + (errs.length > 1 ? 's' : '') + ': <strong>' + fmt(mean(errs), 2) + '</strong>.' : '') + NOTE + 'The correlation coefficient r runs from −1 (a perfect downward line) through 0 (no linear relationship) to +1 (a perfect upward line). Most people underestimate moderate correlations: r = 0.5 looks surprisingly weak, a broad cloud with a slight tilt. And r² is the share of variation in y “explained” by a straight line in x: r = 0.5 explains only 25%.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: trend lines
     ----------------------------------------------------------------------- */
  FIG['fig-trend-lines'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(5), X = [], Y = []; for (var i = 0; i < 120; i++) { var x = 10 * r(); X.push(x); Y.push(10 * x / (2 + x) + 0.9 * rnorm(r)); }
    var mode = 2, frac = 0.4;
    var controls = div('fig-controls', container);
    choice(controls, 'Trend line', ['Straight', 'Quadratic', 'LOWESS'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'tl-f', label: 'LOWESS span (fraction of points)', min: 0.05, max: 1, step: 0.05, value: frac, onChange: function (x) { frac = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function quadfit() { var S = [0, 0, 0, 0, 0], T = [0, 0, 0]; X.forEach(function (x, i) { var p = 1; for (var k = 0; k < 5; k++) { S[k] += p; if (k < 3) T[k] += p * Y[i]; p *= x; } }); var M = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]]; for (var a = 0; a < 3; a++) for (var b = a + 1; b < 3; b++) { var f = M[b][a] / M[a][a]; for (var cc = a; cc < 4; cc++) M[b][cc] -= f * M[a][cc]; } var z = [0, 0, 0]; for (a = 2; a >= 0; a--) { var s = M[a][3]; for (b = a + 1; b < 3; b++) s -= M[a][b] * z[b]; z[a] = s / M[a][a]; } return z; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'A curved relationship with a straight, quadratic or LOWESS trend line'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 14, B: 240, xl: 0, xh: 10, yl: -2, yh: 11, xticks: [0, 5, 10], yticks: [0, 5, 10], xlab: 'dose', ylab: 'effect' });
      dotsSVG(svg, P, X, Y, c.muted, 3, 0.6);
      var resid = [];
      if (mode === 0) { var f = linfit(X, Y); plotLine(svg, P, function (x) { return f.a + f.b * x; }, 0, 10, 2, OI[3], 2.5); resid = X.map(function (x, i) { return Y[i] - f.a - f.b * x; }); }
      else if (mode === 1) { var z = quadfit(); plotLine(svg, P, function (x) { return z[0] + z[1] * x + z[2] * x * x; }, 0, 10, 60, OI[2], 2.5); resid = X.map(function (x, i) { return Y[i] - z[0] - z[1] * x - z[2] * x * x; }); }
      else { var L = lowessJS(X, Y, frac), d = ''; L.forEach(function (p, j) { d += (j ? 'L' : 'M') + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: OI[0], 'stroke-width': 2.5 }, svg); }
      out.innerHTML = ['A straight line misses the curve: it is too low at small doses, too high in the middle, and too low again at the end. The leftover errors follow a pattern, a sign that the form is wrong (Part 9 shows how to spot this with a residual plot).', 'A quadratic curve bends, and fits better here, but it will eventually turn down, predicting that very large doses reduce the effect, which the data do not show.', 'LOWESS fits a weighted straight line around every point, using the nearest ' + Math.round(frac * 100) + '% of the data. ' + (frac < 0.15 ? 'With a span this small the curve chases the noise.' : frac > 0.8 ? 'With a span this large it is nearly straight.' : 'It follows the curve without assuming its shape.')][mode] + NOTE + 'A trend line is a model, and every model makes assumptions. Straight lines assume a constant rate of change; smoothers such as LOWESS (locally weighted scatter-plot smoothing) let the data choose the shape, which makes them excellent for exploring, but they give no simple equation and can wander where data are sparse.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Simpson's paradox
     ----------------------------------------------------------------------- */
  FIG['fig-simpson'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(9), X = [], Y = [], G = [];
    [[2, 9], [5, 6], [8, 3]].forEach(function (cg, g) { for (var i = 0; i < 40; i++) { var x = cg[0] + 0.8 * rnorm(r); X.push(x); Y.push(cg[1] + 0.8 * (x - cg[0]) + 0.5 * rnorm(r)); G.push(g); } });
    var byG = false;
    var controls = div('fig-controls', container);
    choice(controls, 'View', ['All data together', 'Coloured by group'], 0, function (i) { byG = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var NAMES = ['Ward 1', 'Ward 2', 'Ward 3'];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'A scatter plot in which the overall trend is downward but the trend within each group is upward'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 14, B: 240, xl: 0, xh: 10.5, yl: 0, yh: 12, xticks: [0, 5, 10], yticks: [0, 4, 8, 12], xlab: 'treatment dose', ylab: 'recovery score' });
      if (!byG) { dotsSVG(svg, P, X, Y, c.muted, 3); var f = linfit(X, Y); plotLine(svg, P, function (x) { return f.a + f.b * x; }, 0, 10.5, 2, c.ink, 2.2); }
      else [0, 1, 2].forEach(function (g) { var xs = X.filter(function (_, i) { return G[i] === g; }), ys = Y.filter(function (_, i) { return G[i] === g; }), fg = linfit(xs, ys); dotsSVG(svg, P, xs, ys, OI[g], 3); var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs); el('line', { x1: P.X(lo), y1: P.Y(fg.a + fg.b * lo), x2: P.X(hi), y2: P.Y(fg.a + fg.b * hi), stroke: OI[g], 'stroke-width': 2.5 }, svg); txt(svg, P.X(hi) + 4, P.Y(fg.a + fg.b * hi) + 4, NAMES[g], { anchor: 'start', size: fs(9.5), fill: OI[g], weight: 700 }); });
      var fa = linfit(X, Y);
      out.innerHTML = (byG ? 'Within every ward, patients who received more of the treatment recovered better: <strong>all three slopes are positive</strong>. The wards differ: sicker patients (ward 3) got higher doses and recovered less overall.' : 'Taken together, higher doses go with <strong>worse</strong> recovery (slope ' + fmt(fa.b, 2) + '). Should the treatment be stopped?') + NOTE + 'This is <strong>Simpson’s paradox</strong>: a relationship seen in combined data can reverse within every subgroup, because a third variable (here, how ill the patients were) affects both the dose and the outcome. Such a lurking or <em>confounding</em> variable is one reason why correlation alone does not show causation. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: overplotting
     ----------------------------------------------------------------------- */
  FIG['fig-overplot'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 20000, mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Display', ['Plain points', 'Small transparent points', 'Hexagonal bins'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'op-n', label: 'Number of points', min: 500, max: 40000, step: 500, value: n, onChange: function (x) { n = x; draw(); } });
    var cv = document.createElement('canvas'); cv.style.cssText = 'display:block;width:100%;height:300px;margin-top:0.5rem'; container.appendChild(cv);
    var out = div('', container); out.style.cssText = READ_CSS;
    var r = rngSeed(3), PX = [], PY = []; for (var i = 0; i < 40000; i++) { if (i % 13 === 0) { PX.push(-1.2 + 0.2 * rnorm(r)); PY.push(0.6 + 0.2 * rnorm(r)); } else { var x = rnorm(r); PX.push(x); PY.push(0.6 * x + 0.8 * rnorm(r)); } }
    function draw() {
      var dpr = window.devicePixelRatio || 1, W = Math.max(300, container.clientWidth || 700), H = 300; cv.style.width = W + 'px'; cv.style.maxWidth = '100%'; cv.width = W * dpr; cv.height = H * dpr; var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var c = C(); g.fillStyle = c.surface; g.fillRect(0, 0, W, H);
      var L = 40, R = W - 14, T = 10, B = H - 30, X = function (v) { return L + (v + 4.5) / 9 * (R - L); }, Y = function (v) { return B - (v + 4) / 8 * (B - T); };
      g.strokeStyle = c.muted; g.beginPath(); g.moveTo(L, T); g.lineTo(L, B); g.lineTo(R, B); g.stroke();
      g.fillStyle = c.muted; g.font = '11px sans-serif'; [-4, -2, 0, 2, 4].forEach(function (t) { g.fillText(String(t), X(t) - 4, B + 16); });
      if (mode < 2) { g.fillStyle = mode ? 'rgba(0,114,178,0.06)' : OI[0]; var rr = mode ? 1.2 : 2.2; for (var i = 0; i < n; i++) { g.beginPath(); g.arc(X(PX[i]), Y(PY[i]), rr, 0, 6.283); g.fill(); } }
      else { var s = 9, bins = {}, mx = 0; for (var j = 0; j < n; j++) { var px = X(PX[j]), py = Y(PY[j]), row = Math.round(py / (s * 1.5)), col = Math.round((px - (row % 2 ? s * 0.866 : 0)) / (s * 1.732)), key = row + ',' + col; bins[key] = (bins[key] || 0) + 1; if (bins[key] > mx) mx = bins[key]; }
        Object.keys(bins).forEach(function (k) { var p = k.split(',').map(Number), cy = p[0] * s * 1.5, cx = p[1] * s * 1.732 + (p[0] % 2 ? s * 0.866 : 0), t = Math.sqrt(bins[k] / mx); g.fillStyle = 'hsl(' + (260 - 200 * t) + ',70%,' + (30 + 35 * t) + '%)'; g.beginPath(); for (var a = 0; a < 6; a++) { var an = Math.PI / 6 + a * Math.PI / 3; g.lineTo(cx + s * Math.cos(an), cy + s * Math.sin(an)); } g.closePath(); g.fill(); }); }
      out.innerHTML = '<strong>' + fmt(n, 0) + ' points.</strong> ' + ['With many points, plain markers merge into a solid blob: you cannot tell where the data are dense, and a small cluster at the upper left is invisible.', 'Small, nearly transparent points let density show through as darkness. The hidden cluster at the upper left appears.', 'Hexagonal binning counts the points in each hexagon and colours it by the count, like a two-dimensional histogram. It works for any number of points.'][mode] + NOTE + 'Overplotting, points hiding behind other points, is the main problem of scatter plots of large data. Remedies: smaller and transparent markers, jitter for rounded values (Part 4), binning (hexbin or square bins), two-dimensional density contours, or plotting a random sample.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: bubble size, radius or area?
     ----------------------------------------------------------------------- */
  FIG['fig-bubble-scale'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var V = [10, 40, 90], N = ['Town A', 'Town B', 'City C'], byArea = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Bubble size proportional to', ['Area (correct)', 'Radius (wrong)'], 0, function (i) { byArea = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Three bubbles representing populations of 10, 40 and 90 thousand'), W = A.W, svg = A.svg, fs = A.fs, sp = W / 3;
      V.forEach(function (v, i) { var rr = byArea ? 8 * Math.sqrt(v) : 0.85 * v; rr = Math.min(rr, sp / 2 - 4, 110); el('circle', { cx: sp * (i + 0.5), cy: 115, r: rr, fill: OI[i], 'fill-opacity': 0.6, stroke: OI[i] }, svg); txt(svg, sp * (i + 0.5), 232, N[i] + ': ' + v + ',000', { size: fs(10), fill: c.ink2 }); });
      out.innerHTML = (byArea ? 'Area proportional to population: City C has 9 times Town A’s population and 9 times its area (3 times its radius).' : 'Radius proportional to population: City C’s radius is 9 times Town A’s, so its <strong>area is 81 times</strong> larger, wildly exaggerating the difference.') + NOTE + 'People perceive the size of a circle by its area, so bubble size should be proportional to area, which means radius proportional to the square root of the value. Matplotlib’s <code>s</code> argument already sets marker area. Even when drawn correctly, people underestimate area differences, so use bubble size for rough comparisons only and label the important bubbles.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What four things should you look for in a scatter plot?', options: ['Colour, size, title, legend', 'Direction, form, strength and exceptions', 'Mean, median, mode, range', 'Bars, lines, dots, pies'], answer: 1, explanation: 'Then think about what might explain the pattern.' },
      { question: 'A strong U-shaped relationship can have a correlation r close to…', options: ['+1', '−1', '0', 'Any value above 0.9'], answer: 2, explanation: 'r measures only straight-line association.' },
      { question: 'If r = 0.5, what share of the variation in y does a straight line explain?', options: ['50%', '25%', '5%', '0.5%'], answer: 1, explanation: 'r² = 0.25.' },
      { question: 'What does LOWESS do?', options: ['Fits one straight line', 'Fits weighted straight lines locally around each point to trace a smooth curve', 'Removes outliers', 'Bins the data'], answer: 1, explanation: 'The span controls the smoothness.' },
      { question: 'Simpson’s paradox occurs when…', options: ['Two variables are unrelated', 'A trend in combined data reverses within every subgroup', 'Data are skewed', 'A plot has two y-axes'], answer: 1, explanation: 'A lurking variable drives both.' },
      { question: 'Why does correlation not prove causation?', options: ['It is always small', 'A third variable may cause both, or the cause may run the other way', 'It needs more data', 'It ignores units'], answer: 1, explanation: 'Experiments and careful designs are needed.' },
      { question: 'With 50,000 points, a plain scatter plot often…', options: ['Is perfect', 'Becomes a solid blob that hides density and clusters', 'Shows every point clearly', 'Needs a pie chart'], answer: 1, explanation: 'Use transparency or hexagonal bins.' },
      { question: 'In a bubble chart, bubble size should be proportional to the value through its…', options: ['Radius', 'Area', 'Diameter', 'Colour'], answer: 1, explanation: 'Radius scaling exaggerates differences.' },
      { question: 'What is a scatter-plot matrix?', options: ['A table of correlations', 'A grid of scatter plots for every pair of variables', 'A heatmap', 'A 3D plot'], answer: 1, explanation: 'seaborn calls it pairplot.' },
      { question: 'Which variable usually goes on the x-axis?', options: ['The response', 'The explanatory variable (the one thought to influence the other)', 'The larger one', 'It never matters'], answer: 1, explanation: 'By convention.' }
    ]);
  };
})();
