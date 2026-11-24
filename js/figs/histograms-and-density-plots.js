/* ==========================================================================
   RNLearn — Histograms and Density Plots (Reading the Picture, Part 4)
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
    { name: 'Histograms', color: '#b45309' },
    { name: 'Smooth densities', color: '#7c3aed' },
    { name: 'Every point visible', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1895', icon: '📊', era: 0, sec: 3, title: '“Histogram”', text: 'Karl Pearson uses the word histogram in print, having introduced it in lectures a few years earlier.' },
    { year: '1926', icon: '🔢', era: 0, sec: 4, title: 'Sturges’ rule', text: 'Herbert Sturges proposes a rule for the number of histogram bins based on the sample size.' },
    { year: '1956', icon: '〰️', era: 1, sec: 6, title: 'Kernel density', text: 'Murray Rosenblatt describes estimating a density by smoothing each data point; Emanuel Parzen develops the idea in 1962.' },
    { year: '1970', icon: '📡', era: 1, sec: 10, title: 'Stacked pulsar profiles', text: 'Harold Craft’s thesis plots successive radio pulses of pulsar CP 1919 as stacked curves, the image later used on an album cover.' },
    { year: '1977', icon: '🌿', era: 2, sec: 7, title: 'Stem-and-leaf', text: 'John Tukey’s Exploratory Data Analysis popularises the stem-and-leaf display, a histogram made of the data’s own digits.' },
    { year: '1979–81', icon: '📏', era: 0, sec: 4, title: 'Better bin rules', text: 'David Scott (1979) and David Freedman and Persi Diaconis (1981) derive bin widths from the spread of the data.' },
    { year: '1999', icon: '⚫', era: 2, sec: 7, title: 'Dot plots', text: 'Leland Wilkinson describes an algorithm for dot plots, which stack one dot per observation.' }
  ];
  FIG['fig-p4-timeline'] = function (figEl) {
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
  function histCounts(a, w, off) { var lo = Math.floor((Math.min.apply(null, a) - off) / w) * w + off, bins = {}; a.forEach(function (v) { var k = Math.floor((v - lo) / w); bins[k] = (bins[k] || 0) + 1; }); var ks = Object.keys(bins).map(Number), n = Math.max.apply(null, ks) + 1, out = []; for (var i = 0; i < n; i++) out.push([lo + i * w, lo + (i + 1) * w, bins[i] || 0]); return out; }
  function drawHist(svg, P, H, col, opts) { opts = opts || {}; H.forEach(function (h) { var v = opts.density ? h[2] / opts.n / (h[1] - h[0]) : h[2]; if (!v) return; el('rect', { x: P.X(h[0]) + 0.5, y: P.Y(v), width: Math.max(0.5, P.X(h[1]) - P.X(h[0]) - 1), height: P.Y(0) - P.Y(v), fill: col, 'fill-opacity': opts.op || 1 }, svg); }); }
  var WAIT = sampleN(42, 300, 12, 3).concat(sampleN(43, 200, 25, 4));

  /* -----------------------------------------------------------------------
     Figure: bin width and bin position
     ----------------------------------------------------------------------- */
  FIG['fig-hist-bins'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w = 1.5, off = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'hb-w', label: 'Bin width (minutes)', min: 0.25, max: 10, step: 0.25, value: w, onChange: function (x) { w = x; draw(); } });
    FIG.slider(controls, { id: 'hb-o', label: 'Shift the bin edges (fraction of a bin)', min: 0, max: 0.95, step: 0.05, value: off, onChange: function (x) { off = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var H = histCounts(WAIT, w, off * w), ymax = Math.max.apply(null, H.map(function (h) { return h[2]; })) * 1.12;
      var c = C(), A = newSVG(svgWrap, container, 280, 'A histogram of 500 waiting times whose shape changes with the bin width'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 16, B: 235, xl: 0, xh: 42, yl: 0, yh: ymax, xticks: [0, 10, 20, 30, 40], yticks: niceTicks(0, ymax, 4), xlab: 'waiting time (minutes)', ylab: 'customers' });
      drawHist(svg, P, H, OI[0]);
      var nb = H.length, peaks = 0; for (var i = 1; i < nb - 1; i++) if (H[i][2] > H[i - 1][2] && H[i][2] >= H[i + 1][2] && H[i][2] > 0.25 * ymax) peaks++;
      out.innerHTML = '<strong>' + nb + ' bins</strong> of ' + fmt(w, 2) + ' minutes. ' + (w >= 7 ? 'With bins this wide, the two groups of customers merge into one lump: the histogram hides the most important feature of the data.' : w <= 0.75 ? 'With bins this narrow, random noise creates many spiky peaks that mean nothing.' : 'This width shows the two peaks clearly: quick customers around 12 minutes and slow ones around 25.') + NOTE + 'A histogram counts how many values fall in each interval (bin). The same 500 values can look smooth, spiky or single-peaked depending on the bin width, and even sliding the bin edges without changing their width alters the shape, especially for small samples. Always try a few bin widths before drawing conclusions about shape.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: shapes of distributions
     ----------------------------------------------------------------------- */
  FIG['fig-shapes'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SH = ['Symmetric', 'Right-skewed', 'Left-skewed', 'Bimodal', 'Uniform', 'Heavy-tailed'], k = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Shape', SH, k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function data(i) {
      var r = rngSeed(100 + i), a = [], n = 800, j;
      for (j = 0; j < n; j++) {
        if (i === 0) a.push(50 + 10 * rnorm(r));
        else if (i === 1) a.push(20 + 15 * Math.exp(0.6 * rnorm(r)));
        else if (i === 2) a.push(100 - 15 * Math.exp(0.6 * rnorm(r)));
        else if (i === 3) a.push(j % 2 ? 35 + 6 * rnorm(r) : 65 + 7 * rnorm(r));
        else if (i === 4) a.push(20 + 60 * r());
        else { var z1 = rnorm(r), z2 = rnorm(r), z3 = rnorm(r), t = rnorm(r) / Math.sqrt((z1 * z1 + z2 * z2 + z3 * z3) / 3); a.push(50 + 6 * t); }
      }
      return a.filter(function (v) { return v > 0 && v < 100; });
    }
    function draw() {
      var a = data(k), H = histCounts(a, 2.5, 0), ymax = Math.max.apply(null, H.map(function (h) { return h[2]; })) * 1.15, s = boxStats(a);
      var c = C(), A = newSVG(svgWrap, container, 270, 'A histogram of the chosen shape with its mean and median marked'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 46, R: W - 14, T: 22, B: 230, xl: 0, xh: 100, yl: 0, yh: ymax, xticks: [0, 25, 50, 75, 100], yticks: niceTicks(0, ymax, 4), ylab: 'count' });
      drawHist(svg, P, H, OI[0], { op: 0.75 });
      el('line', { x1: P.X(s.mean), y1: 22, x2: P.X(s.mean), y2: 230, stroke: OI[3], 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
      el('line', { x1: P.X(s.med), y1: 22, x2: P.X(s.med), y2: 230, stroke: c.ink, 'stroke-width': 2 }, svg);
      txt(svg, W - 16, 14, 'dashed: mean ' + fmt(s.mean, 1) + ' · solid: median ' + fmt(s.med, 1), { anchor: 'end', size: fs(9.5), fill: c.ink2 });
      var msg = ['Symmetric and single-peaked: mean and median coincide, and the spread is the same on both sides. The normal (bell) curve is the best-known example.', 'Right-skewed: a long tail to the right pulls the <strong>mean above the median</strong>. Incomes, house prices, waiting times and reaction times often look like this.', 'Left-skewed: the tail is on the left and the mean falls below the median, as for exam scores with a ceiling or ages at death in rich countries.', 'Bimodal: two peaks usually mean two groups mixed together. The mean (and median) may fall in the valley where few values are, describing nobody.', 'Uniform: every value in the range is about equally common, like the last digits of telephone numbers.', 'Heavy-tailed: looks bell-shaped in the middle but has far more extreme values than a normal curve, as do financial returns. Outliers are expected, not errors.'][k];
      out.innerHTML = msg + NOTE + 'Describe a distribution by its <strong>centre</strong>, its <strong>spread</strong>, its <strong>shape</strong> (symmetry, skew, number of peaks) and any <strong>unusual values</strong> or gaps. The gap between mean and median is a quick check for skew.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: kernel density estimation
     ----------------------------------------------------------------------- */
  FIG['fig-kde'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 20, bwF = 1, showK = true, seed = 3;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'kd-n', label: 'Number of observations', min: 5, max: 200, step: 5, value: n, onChange: function (x) { n = x; draw(); } });
    FIG.slider(controls, { id: 'kd-b', label: 'Bandwidth (× rule of thumb)', min: 0.2, max: 3, step: 0.1, value: bwF, onChange: function (x) { bwF = x; draw(); } });
    choice(controls, 'Show kernels', ['Yes', 'No'], 0, function (i) { showK = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var r = rngSeed(seed), a = []; for (var i = 0; i < n; i++) a.push(i % 5 < 3 ? 12 + 3 * rnorm(r) : 25 + 4 * rnorm(r));
      var bw = silverman(a) * bwF, c = C(), A = newSVG(svgWrap, container, 280, 'A density curve built by adding a small bell curve at every data point'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 16, B: 225, xl: 0, xh: 42, yl: 0, yh: 0.12, xticks: [0, 10, 20, 30, 40], yticks: [0, 0.05, 0.1], xlab: 'waiting time (minutes)', ylab: 'density' });
      if (showK && n <= 60) a.forEach(function (v) { plotLine(svg, P, function (x) { var z = (x - v) / bw; return Math.exp(-0.5 * z * z) / (n * bw * Math.sqrt(2 * Math.PI)); }, Math.max(0, v - 4 * bw), Math.min(42, v + 4 * bw), 40, PC, 0.8); });
      plotLine(svg, P, function (x) { return kde(a, bw, x); }, 0, 42, 300, OI[0], 2.5);
      a.forEach(function (v) { el('line', { x1: P.X(v), y1: 225, x2: P.X(v), y2: 213, stroke: c.ink, 'stroke-width': 1 }, svg); });
      out.innerHTML = 'Bandwidth: <strong>' + fmt(bw, 2) + ' minutes</strong>. ' + (bwF < 0.6 ? 'Too narrow: every point gets its own bump, and the curve is as spiky as a histogram with tiny bins.' : bwF > 1.8 ? 'Too wide: the two groups are smoothed into a single broad hump.' : 'The rule-of-thumb bandwidth balances smoothness against detail.') + (showK && n > 60 ? ' (Individual kernels are hidden above 60 points.)' : '') + NOTE + 'A <strong>kernel density estimate</strong> places a small bell curve (the kernel) on every observation, shown by the ticks along the bottom, and adds them up. The bandwidth, the width of each bell, plays the role of the bin width in a histogram. Unlike a histogram it does not depend on where bins start. But it can spill past natural limits: here the curve may extend below zero minutes, which is impossible.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: rug, strip and dot plots
     ----------------------------------------------------------------------- */
  FIG['fig-strip'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 80, mode = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Display', ['Rug', 'Strip with jitter', 'Dot plot (stacked)'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'st-n', label: 'Number of students', min: 10, max: 300, step: 10, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var a = sampleN(3, n, 65, 12).map(function (v) { return Math.max(20, Math.min(100, Math.round(v))); }), r = rngSeed(9);
      var c = C(), A = newSVG(svgWrap, container, 250, 'Exam scores shown as a rug, a jittered strip or a stacked dot plot'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 20, R: W - 14, T: 10, B: 210, xl: 20, xh: 100, yl: 0, yh: 1, xticks: [20, 40, 60, 80, 100], yticks: [], xlab: 'score' });
      if (mode === 0) a.forEach(function (v) { el('line', { x1: P.X(v), y1: 150, x2: P.X(v), y2: 200, stroke: OI[0], 'stroke-width': 1.2, opacity: 0.7 }, svg); });
      else if (mode === 1) a.forEach(function (v) { el('circle', { cx: P.X(v), cy: 120 + 70 * (r() - 0.5), r: 3, fill: OI[0], 'fill-opacity': 0.55 }, svg); });
      else { var cnt = {}, bw = 2, rr = Math.max(1.5, Math.min(4, (P.X(bw) - P.X(0)) / 2.2)); a.forEach(function (v) { var b = Math.round(v / bw) * bw; cnt[b] = (cnt[b] || 0) + 1; el('circle', { cx: P.X(b), cy: 205 - (cnt[b] - 0.5) * 2.1 * rr, r: rr, fill: OI[0] }, svg); }); }
      var distinct = Object.keys(a.reduce(function (o, v) { o[v] = 1; return o; }, {})).length;
      out.innerHTML = n + ' students but only <strong>' + distinct + ' distinct scores</strong>, so in a rug plot ' + (n - distinct) + ' ticks are hidden behind others. ' + ['A rug plot shows every value as a tick, but ties and near-ties overlap invisibly.', 'Jitter adds a small random vertical offset so that overlapping points separate. It shows individual values and their density at once; the vertical position means nothing.', 'A dot plot stacks one dot per value (here grouped into 2-point bins), giving a histogram in which you can count every observation.'][mode] + NOTE + 'For small and medium samples, showing every point is more honest than a summary: nothing is hidden, and readers can see how many observations there are. Seaborn calls the jittered version <code>stripplot</code> and the non-overlapping version <code>swarmplot</code>.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: comparing several distributions
     ----------------------------------------------------------------------- */
  FIG['fig-compare-hist'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var G = [['Morning', sampleN(61, 250, 14, 4)], ['Midday', sampleN(62, 250, 22, 5)], ['Afternoon', sampleN(63, 250, 18, 6)], ['Evening', sampleN(64, 250, 26, 4)]], mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Layout', ['Overlaid histograms', 'Overlaid outlines', 'Small multiples', 'Ridgeline'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), H0 = mode === 2 ? 440 : 300, A = newSVG(svgWrap, container, H0, 'Distributions of waiting times at four times of day, compared in different layouts'), W = A.W, svg = A.svg, fs = A.fs;
      if (mode < 2) {
        var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 255, xl: 0, xh: 45, yl: 0, yh: 60, xticks: [0, 10, 20, 30, 40], yticks: [0, 20, 40, 60], xlab: 'waiting time (minutes)', ylab: 'count' });
        G.forEach(function (g, i) { var H = histCounts(g[1], 1.5, 0); if (mode === 0) drawHist(svg, P, H, OI[i], { op: 0.45 }); else { var d = ''; H.forEach(function (h, j) { d += (j ? 'L' : 'M') + P.X(h[0]).toFixed(1) + ' ' + P.Y(h[2]).toFixed(1) + 'L' + P.X(h[1]).toFixed(1) + ' ' + P.Y(h[2]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: OI[i], 'stroke-width': 2 }, svg); } });
        var sp = Math.min(90, (W - 60) / 4); G.forEach(function (g, i) { el('rect', { x: 56 + i * sp, y: 8, width: 12, height: 12, fill: OI[i] }, svg); txt(svg, 72 + i * sp, 18, W < 420 ? g[0].slice(0, 4) : g[0], { anchor: 'start', size: fs(9.5), fill: c.ink2 }); });
      } else if (mode === 2) {
        G.forEach(function (g, i) { var T = 10 + i * 105, P2 = plotAxes(svg, c, fs, { L: 90, R: W - 14, T: T + 10, B: T + 90, xl: 0, xh: 45, yl: 0, yh: 60, xticks: i === 3 ? [0, 10, 20, 30, 40] : [], yticks: [] }); drawHist(svg, P2, histCounts(g[1], 1.5, 0), OI[i]); txt(svg, 82, T + 55, g[0], { anchor: 'end', size: fs(10), fill: OI[i], weight: 700 }); });
      } else {
        var P3 = plotAxes(svg, c, fs, { L: 90, R: W - 14, T: 10, B: 270, xl: 0, xh: 45, yl: 0, yh: 1, xticks: [0, 10, 20, 30, 40], yticks: [], xlab: 'waiting time (minutes)' });
        G.slice().reverse().forEach(function (g, jj) { var i = 3 - jj, base = 250 - i * 55, bw = silverman(g[1]), d = 'M' + P3.X(0) + ' ' + base; for (var x = 0; x <= 45; x += 0.5) d += 'L' + P3.X(x).toFixed(1) + ' ' + (base - kde(g[1], bw, x) * 1100).toFixed(1); d += 'L' + P3.X(45) + ' ' + base + 'Z'; el('path', { d: d, fill: OI[i], 'fill-opacity': 0.8, stroke: c.surface, 'stroke-width': 1.5 }, svg); txt(svg, 84, base - 4, g[0], { anchor: 'end', size: fs(10), fill: OI[i], weight: 700 }); });
      }
      out.innerHTML = ['Four overlaid histograms in transparent colours: where they overlap, colours mix and it is hard to tell which group is which.', 'Outlines (step histograms) overlap more cleanly, but four lines are still a lot to untangle.', 'Small multiples, one histogram per group on the same axes, are easy to read one at a time and to compare by looking down the column.', 'A ridgeline plot stacks density curves with a slight overlap. It is compact and shows the shift in the typical wait clearly, at the cost of hiding the exact heights.'][mode] + NOTE + 'Overlaying works for two groups; beyond that, use small multiples, a ridgeline plot, or the box and violin plots of Part 5, which are designed for comparing many groups.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does the height of a bar in an ordinary histogram show?', options: ['The value of one observation', 'How many observations fall in that bin', 'The mean of the bin', 'The bin width'], answer: 1, explanation: 'With density=True it shows count ÷ (total × width).' },
      { question: 'What happens if the bins are too wide?', options: ['The histogram is spiky', 'Important features such as two peaks can disappear', 'Nothing', 'The total changes'], answer: 1, explanation: 'Too narrow gives meaningless spikes instead.' },
      { question: 'In a right-skewed distribution, the mean is usually…', options: ['Below the median', 'Above the median', 'Equal to the mode', 'Zero'], answer: 1, explanation: 'The long right tail pulls the mean up.' },
      { question: 'Two clear peaks in a histogram often mean…', options: ['A mistake', 'Two different groups mixed together', 'A normal distribution', 'Too few bins'], answer: 1, explanation: 'Look for a variable that separates them.' },
      { question: 'A kernel density estimate is made by…', options: ['Joining bar tops', 'Adding up a small bell curve placed on every data point', 'Fitting a normal curve', 'Counting values'], answer: 1, explanation: 'The bandwidth sets the width of each bell.' },
      { question: 'What plays the role of the bin width in a kernel density estimate?', options: ['The sample size', 'The bandwidth', 'The mean', 'The kernel height'], answer: 1, explanation: 'Too small is spiky, too large oversmooths.' },
      { question: 'What is jitter in a strip plot?', options: ['A measurement error', 'A small random offset added so that overlapping points separate', 'A smoothing method', 'A colour scale'], answer: 1, explanation: 'The offset itself carries no meaning.' },
      { question: 'Which display shows the actual digits of the data?', options: ['Kernel density', 'Stem-and-leaf display', 'Ridgeline', 'Violin plot'], answer: 1, explanation: 'Tukey’s stem-and-leaf.' },
      { question: 'How should strongly right-skewed data such as incomes often be shown?', options: ['On a log axis with log-spaced bins', 'As a pie chart', 'With fewer bins only', 'As a line chart'], answer: 0, explanation: 'The log scale spreads out the crowded low values.' },
      { question: 'For comparing waiting times across six groups, which is a good choice?', options: ['Six overlaid transparent histograms', 'Small multiples or a ridgeline plot', 'A pie chart', 'A dual-axis chart'], answer: 1, explanation: 'Or box and violin plots (Part 5).' }
    ]);
  };
})();
