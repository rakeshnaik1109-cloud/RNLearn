/* ==========================================================================
   RNLearn — Box Plots, Violins and ECDFs (Reading the Picture, Part 5)
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
    { name: 'The box plot', color: '#b45309' },
    { name: 'Showing more', color: '#7c3aed' },
    { name: 'Show the data', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1952', icon: '📏', era: 0, sec: 11, title: 'Spear’s range bar', text: 'Mary Eleanor Spear’s Charting Statistics shows a bar spanning the middle half of the data with a line at the median.' },
    { year: '1970–77', icon: '📦', era: 0, sec: 3, title: 'Tukey’s box-and-whisker', text: 'John Tukey introduces the box-and-whisker plot, with whiskers and outlier rules, in Exploratory Data Analysis.' },
    { year: '1978', icon: '✂️', era: 0, sec: 5, title: 'Notches and widths', text: 'Robert McGill, John Tukey and Wayne Larsen add notches for the median’s uncertainty and widths for group size.' },
    { year: '1998', icon: '🎻', era: 1, sec: 6, title: 'Violin plots', text: 'Jerry Hintze and Ray Nelson combine a box plot with a mirrored density curve.' },
    { year: '2015', icon: '💥', era: 2, sec: 7, title: 'Beyond bar graphs', text: 'Tracey Weissgerber and colleagues urge biomedical researchers to replace bar charts of means with plots that show the data.' },
    { year: '2019', icon: '🌧️', era: 2, sec: 6, title: 'Raincloud plots', text: 'Micah Allen and colleagues describe raincloud plots: density, box plot and raw data together.' }
  ];
  FIG['fig-p5-timeline'] = function (figEl) {
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
  function boxH(svg, P, s, y, h, col, c, opts) {
    opts = opts || {};
    el('line', { x1: P.X(s.wlo), y1: y, x2: P.X(s.q1), y2: y, stroke: c.ink, 'stroke-width': 1.3 }, svg);
    el('line', { x1: P.X(s.q3), y1: y, x2: P.X(s.whi), y2: y, stroke: c.ink, 'stroke-width': 1.3 }, svg);
    [s.wlo, s.whi].forEach(function (v) { el('line', { x1: P.X(v), y1: y - h / 4, x2: P.X(v), y2: y + h / 4, stroke: c.ink, 'stroke-width': 1.3 }, svg); });
    if (opts.notch) { var nh = 1.57 * s.iqr / Math.sqrt(s.n), a = P.X(s.med - nh), b = P.X(s.med + nh); el('path', { d: 'M' + P.X(s.q1) + ' ' + (y - h / 2) + 'L' + a + ' ' + (y - h / 2) + 'L' + P.X(s.med) + ' ' + (y - h / 4) + 'L' + b + ' ' + (y - h / 2) + 'L' + P.X(s.q3) + ' ' + (y - h / 2) + 'L' + P.X(s.q3) + ' ' + (y + h / 2) + 'L' + b + ' ' + (y + h / 2) + 'L' + P.X(s.med) + ' ' + (y + h / 4) + 'L' + a + ' ' + (y + h / 2) + 'L' + P.X(s.q1) + ' ' + (y + h / 2) + 'Z', fill: col, 'fill-opacity': 0.35, stroke: c.ink, 'stroke-width': 1.3 }, svg); }
    else el('rect', { x: P.X(s.q1), y: y - h / 2, width: P.X(s.q3) - P.X(s.q1), height: h, fill: col, 'fill-opacity': 0.35, stroke: c.ink, 'stroke-width': 1.3 }, svg);
    el('line', { x1: P.X(s.med), y1: y - h / 2, x2: P.X(s.med), y2: y + h / 2, stroke: c.ink, 'stroke-width': 2.5 }, svg);
    if (!opts.noOut) s.out.forEach(function (v) { el('circle', { cx: P.X(v), cy: y, r: 3.5, fill: OI[3] }, svg); });
  }
  function gammaSample(seed, n, k, th) { var r = rngSeed(seed), a = []; for (var i = 0; i < n; i++) { var s = 0; for (var j = 0; j < k; j++) s -= Math.log(1 - r()); a.push(s * th); } return a; }

  /* -----------------------------------------------------------------------
     Figure: anatomy of a box plot
     ----------------------------------------------------------------------- */
  FIG['fig-box-anatomy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var base = gammaSample(10, 60, 4, 5), late = 75, dots = true;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ba-l', label: 'One extra delivery takes (minutes)', min: 5, max: 120, step: 1, value: late, onChange: function (x) { late = x; draw(); } });
    choice(controls, 'Show the data', ['Yes', 'No'], 0, function (i) { dots = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var a = base.concat([late]), s = boxStats(a), c = C(), A = newSVG(svgWrap, container, 250, 'A box plot of delivery times with each part labelled'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 20, R: W - 20, T: 10, B: 210, xl: 0, xh: 125, yl: 0, yh: 1, xticks: [0, 25, 50, 75, 100, 125], yticks: [], xlab: 'delivery time (minutes)' });
      if (dots) { var r = rngSeed(4); a.forEach(function (v) { el('circle', { cx: P.X(v), cy: 170 + 20 * (r() - 0.5), r: 2.5, fill: c.muted, 'fill-opacity': 0.7 }, svg); }); }
      boxH(svg, P, s, 100, 46, OI[0], c);
      var lab = function (x, y, t, anc) { txt(svg, x, y, t, { size: fs(9.5), fill: c.ink2, anchor: anc || 'middle' }); };
      lab(P.X(s.med), 66, 'median ' + fmt(s.med, 1));
      lab(P.X(s.q1), 140, 'Q1 ' + fmt(s.q1, 1), 'end'); lab(P.X(s.q3), 140, 'Q3 ' + fmt(s.q3, 1), 'start');
      el('line', { x1: P.X(s.q1), y1: 48, x2: P.X(s.q3), y2: 48, stroke: PC, 'stroke-width': 1.2 }, svg); lab((P.X(s.q1) + P.X(s.q3)) / 2, 42, 'IQR = ' + fmt(s.iqr, 1));
      lab(P.X(s.whi), 128, 'whisker', 'middle');
      if (s.out.length) lab(P.X(s.out[s.out.length - 1]), 84, s.out.length === 1 ? 'outlier' : s.out.length + ' outliers');
      out.innerHTML = 'Median <strong>' + fmt(s.med, 1) + '</strong>, quartiles ' + fmt(s.q1, 1) + ' and ' + fmt(s.q3, 1) + ', whiskers from ' + fmt(s.wlo, 1) + ' to ' + fmt(s.whi, 1) + '. ' + (s.out.length ? s.out.length + ' point' + (s.out.length > 1 ? 's lie' : ' lies') + ' beyond Q3 + 1.5 × IQR = ' + fmt(s.q3 + 1.5 * s.iqr, 1) + ' and ' + (s.out.length > 1 ? 'are' : 'is') + ' drawn separately.' : 'No points lie beyond 1.5 × IQR.') + ' Mean: ' + fmt(s.mean, 1) + '.' + NOTE + 'The box spans the middle half of the data, from the first quartile (Q1) to the third (Q3); its length is the interquartile range (IQR). The line inside is the median. In Tukey’s convention, each whisker runs to the furthest point within 1.5 × IQR of the box, and points beyond are plotted individually. Move the extra delivery far out: the median and box barely change, but the mean does. That robustness is the box plot’s strength.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: what a box plot hides
     ----------------------------------------------------------------------- */
  FIG['fig-box-hides'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    function norm(a) { var s = boxStats(a); return a.map(function (v) { return 50 + (v - s.med) * 20 / s.iqr; }); }
    var r = rngSeed(31), A1 = [], A2 = [], A3 = [];
    for (var i = 0; i < 120; i++) { A1.push(rnorm(r)); A2.push((i % 2 ? -1 : 1) + 0.18 * rnorm(r)); A3.push(r()); }
    var SETS = [['Bell-shaped', norm(A1)], ['Two clusters', norm(A2)], ['Flat (uniform)', norm(A3)]], show = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['Box plots only', 'Box plots and data'], show, function (i) { show = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Three data sets with almost identical box plots but very different shapes'), W = A.W, svg = A.svg, fs = A.fs, lw = W < 560 ? 70 : 100;
      var P = plotAxes(svg, c, fs, { L: lw, R: W - 14, T: 10, B: 270, xl: 10, xh: 90, yl: 0, yh: 1, xticks: [20, 40, 60, 80], yticks: [] });
      SETS.forEach(function (sd, i) { var y = 50 + i * 85, s = boxStats(sd[1]); txt(svg, lw - 8, y + 4, sd[0], { anchor: 'end', size: fs(9.5), fill: c.ink2 }); boxH(svg, P, s, y, 30, OI[i], c); if (show) { var rr = rngSeed(7 + i); sd[1].forEach(function (v) { el('circle', { cx: P.X(v), cy: y + 30 + 14 * (rr() - 0.5), r: 2, fill: OI[i] }, svg); }); } });
      out.innerHTML = (show ? 'The data reveal three different stories: a single bell, <strong>two separate clusters with almost nothing in the middle</strong>, and a flat spread. The median of the second set falls in a gap where there are hardly any observations.' : 'Three box plots with the same medians and boxes, and only slightly different whiskers. Are the data similar?') + NOTE + 'A box plot reduces a distribution to five numbers, so it cannot show the number of peaks, clusters, gaps or how many observations there are. That is why it is often combined with the raw points, a violin or a density curve.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: comparing groups with notched box plots
     ----------------------------------------------------------------------- */
  FIG['fig-notch'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 30, diff = 4;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'nt-n', label: 'Observations per group', min: 10, max: 300, step: 10, value: n, onChange: function (x) { n = x; draw(); } });
    FIG.slider(controls, { id: 'nt-d', label: 'True difference between B and A', min: 0, max: 12, step: 1, value: diff, onChange: function (x) { diff = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var G = [['A', sampleN(81, n, 50, 10)], ['B', sampleN(82, n, 50 + diff, 10)], ['C', sampleN(83, n, 50 + diff / 2, 10)]];
      var c = C(), A = newSVG(svgWrap, container, 260, 'Three notched box plots; overlapping notches suggest the medians may not differ'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 10, B: 225, xl: 15, xh: 95, yl: 0, yh: 1, xticks: [20, 40, 60, 80], yticks: [], xlab: 'measurement' });
      var S = G.map(function (g, i) { var s = boxStats(g[1]); txt(svg, 30, 50 + i * 65 + 4, g[0], { anchor: 'end', size: fs(11), fill: c.ink, weight: 700 }); boxH(svg, P, s, 50 + i * 65, 34, OI[i], c, { notch: true }); return s; });
      var nh = function (s) { return 1.57 * s.iqr / Math.sqrt(s.n); }, sep = Math.abs(S[1].med - S[0].med) > nh(S[0]) + nh(S[1]);
      out.innerHTML = 'Medians: A ' + fmt(S[0].med, 1) + ', B ' + fmt(S[1].med, 1) + ', C ' + fmt(S[2].med, 1) + '. The notches of A and B <strong>' + (sep ? 'do not overlap' : 'overlap') + '</strong>: ' + (sep ? 'rough evidence that their medians differ.' : 'no strong evidence that their medians differ.') + NOTE + 'A notch shows an approximate 95% confidence interval for the median, ±1.57 × IQR / √n, proposed by McGill, Tukey and Larsen. If the notches of two boxes do not overlap, the medians differ at roughly the 5% level. With more observations the notches shrink, so a small real difference becomes visible. When a notch extends beyond the box, the sample is small and the median very uncertain.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: dynamite, box, violin, beeswarm, raincloud
     ----------------------------------------------------------------------- */
  FIG['fig-dist-compare'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, n = 40;
    var controls = div('fig-controls', container);
    choice(controls, 'Plot', ['Bar ± SE', 'Box', 'Violin', 'Beeswarm', 'Raincloud'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'dcp-n', label: 'Observations per group', min: 10, max: 200, step: 10, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function swarmX(vals, P, x0, r) { var placed = [], res = []; vals.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return a[0] - b[0]; }).forEach(function (vi) { var y = P.Y(vi[0]), k = 0, x; while (true) { var off = Math.ceil(k / 2) * (k % 2 ? 1 : -1) * r * 2.05; x = x0 + off; var ok = placed.every(function (p) { return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) >= 4 * r * r * 0.98; }); if (ok || k > 60) break; k++; } placed.push([x, y]); res.push([x, y]); }); return res; }
    function draw() {
      var r0 = rngSeed(51), g1 = [], g2 = [], g3 = [];
      for (var i = 0; i < n; i++) { g1.push(10 + 2 * rnorm(r0)); g2.push(i % 2 ? 8 + 1.2 * rnorm(r0) : 15 + 1.2 * rnorm(r0)); var s = 0; for (var j = 0; j < 3; j++) s -= Math.log(1 - r0()); g3.push(6 + 2.4 * s); }
      var G = [['Control', g1], ['Drug X', g2], ['Drug Y', g3]], c = C(), A = newSVG(svgWrap, container, 300, 'Three groups shown as the chosen kind of plot'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 46, R: W - 14, T: 10, B: 265, xl: 0, xh: 3, yl: 0, yh: 26, xticks: [], yticks: [0, 5, 10, 15, 20, 25], ylab: 'response' });
      G.forEach(function (g, i) {
        var xc = P.X(i + 0.5), s = boxStats(g[1]), bw = (P.X(1) - P.X(0)) * 0.36; txt(svg, xc, 282, g[0], { size: fs(10), fill: c.ink2 });
        if (mode === 0) { var se = s.sd / Math.sqrt(s.n); el('rect', { x: xc - bw / 2, y: P.Y(s.mean), width: bw, height: P.Y(0) - P.Y(s.mean), fill: OI[i] }, svg); el('line', { x1: xc, y1: P.Y(s.mean - se), x2: xc, y2: P.Y(s.mean + se), stroke: c.ink, 'stroke-width': 1.5 }, svg); el('line', { x1: xc - 8, y1: P.Y(s.mean + se), x2: xc + 8, y2: P.Y(s.mean + se), stroke: c.ink, 'stroke-width': 1.5 }, svg); }
        if (mode === 1 || mode === 4) { var X = function (v) { return P.Y(v); }, bx = mode === 4 ? xc - 6 : xc, half = mode === 4 ? 6 : bw / 3; el('line', { x1: bx, y1: X(s.wlo), x2: bx, y2: X(s.whi), stroke: c.ink }, svg); el('rect', { x: bx - half, y: X(s.q3), width: 2 * half, height: X(s.q1) - X(s.q3), fill: mode === 4 ? c.surface : OI[i], 'fill-opacity': mode === 4 ? 1 : 0.35, stroke: c.ink }, svg); el('line', { x1: bx - half, y1: X(s.med), x2: bx + half, y2: X(s.med), stroke: c.ink, 'stroke-width': 2.5 }, svg); if (mode === 1) s.out.forEach(function (v) { el('circle', { cx: xc, cy: X(v), r: 3, fill: OI[3] }, svg); }); }
        if (mode === 2 || mode === 4) { var bwk = silverman(g[1]), mx = 0, ys = []; for (var y = s.min; y <= s.max; y += 0.2) { var d = kde(g[1], bwk, y); ys.push([y, d]); mx = Math.max(mx, d); } var sc = bw / 2 / mx, dR = '', dL = ''; ys.forEach(function (p, k) { dR += (k ? 'L' : 'M') + (xc + (mode === 4 ? 0 : 0) + p[1] * sc).toFixed(1) + ' ' + P.Y(p[0]).toFixed(1); }); if (mode === 2) { for (var k = ys.length - 1; k >= 0; k--) dL += 'L' + (xc - ys[k][1] * sc).toFixed(1) + ' ' + P.Y(ys[k][0]).toFixed(1); el('path', { d: dR + dL + 'Z', fill: OI[i], 'fill-opacity': 0.45, stroke: c.ink, 'stroke-width': 1 }, svg); el('line', { x1: xc - 10, y1: P.Y(s.med), x2: xc + 10, y2: P.Y(s.med), stroke: c.ink, 'stroke-width': 2.5 }, svg); } else el('path', { d: dR + 'L' + xc + ' ' + P.Y(s.max) + 'L' + xc + ' ' + P.Y(s.min) + 'Z', fill: OI[i], 'fill-opacity': 0.5, stroke: 'none' }, svg); }
        if (mode === 3 || mode === 4) { var rr = n > 120 ? 1.6 : 2.4; if (mode === 3) swarmX(g[1], P, xc, rr).forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: rr, fill: OI[i] }, svg); }); else { var rj = rngSeed(i + 5); g[1].forEach(function (v) { el('circle', { cx: xc - 22 - 10 * rj(), cy: P.Y(v), r: 2, fill: OI[i], 'fill-opacity': 0.8 }, svg); }); } }
      });
      out.innerHTML = ['A bar of the mean with a standard-error bar (a “dynamite plot”) makes the three groups look like simple, similar quantities. It hides that Drug X has two separate kinds of responder and that Drug Y is skewed, and the bar wastes ink on the range from zero where there are no data.', 'Box plots show the medians, spread and skew of Drug Y, but Drug X’s two clusters are invisible: its box just looks wide.', 'Violin plots show the shape of each distribution: Drug X is clearly bimodal and Drug Y skewed. But with few observations, the smooth outline can suggest more certainty than the data justify.', 'A beeswarm shows every observation, arranged so that none overlap. With moderate samples it is the most honest display: shape, spread and sample size are all visible.', 'A raincloud plot combines a half-violin (cloud), a narrow box plot and the jittered raw points (rain), giving summary and data together.'][mode] + NOTE + 'The same three data sets in five displays. Increase the sample size and see which displays stay readable.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: empirical cumulative distribution function
     ----------------------------------------------------------------------- */
  FIG['fig-ecdf'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var oldS = gammaSample(91, 200, 5, 6).sort(function (a, b) { return a - b; }), newS = gammaSample(92, 200, 5, 5).sort(function (a, b) { return a - b; }), x0 = 40;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ec-x', label: 'Read the curves at load time', min: 5, max: 80, step: 1, value: x0, onChange: function (x) { x0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function frac(a, x) { var k = 0; while (k < a.length && a[k] <= x) k++; return k / a.length; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Empirical cumulative distribution functions of page load times for two servers'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 16, B: 235, xl: 0, xh: 85, yl: 0, yh: 1, xticks: [0, 20, 40, 60, 80], yticks: [0, 0.25, 0.5, 0.75, 1], xlab: 'load time', ylab: 'proportion ≤ x' });
      [[oldS, OI[0], 'old server'], [newS, OI[1], 'new server']].forEach(function (g, gi) { var d = 'M' + P.X(0) + ' ' + P.Y(0); g[0].forEach(function (v, i) { d += 'L' + P.X(v).toFixed(1) + ' ' + P.Y(i / g[0].length).toFixed(1) + 'L' + P.X(v).toFixed(1) + ' ' + P.Y((i + 1) / g[0].length).toFixed(1); }); d += 'L' + P.X(85) + ' ' + P.Y(1); el('path', { d: d, fill: 'none', stroke: g[1], 'stroke-width': 2 }, svg); txt(svg, P.X(68), P.Y(0.3 - gi * 0.1), g[2], { anchor: 'start', size: fs(9.5), fill: g[1], weight: 700 }); });
      el('line', { x1: P.X(x0), y1: 16, x2: P.X(x0), y2: 235, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      var fo = frac(oldS, x0), fn = frac(newS, x0);
      [[fo, OI[0]], [fn, OI[1]]].forEach(function (f) { el('circle', { cx: P.X(x0), cy: P.Y(f[0]), r: 4.5, fill: f[1] }, svg); });
      out.innerHTML = 'At load time ' + x0 + ': <strong>' + fmt(100 * fo, 0) + '%</strong> of pages on the old server and <strong>' + fmt(100 * fn, 0) + '%</strong> on the new one load at or below this. Medians: ' + fmt(qsorted(oldS, 0.5), 1) + ' and ' + fmt(qsorted(newS, 0.5), 1) + '; 90th percentiles: ' + fmt(qsorted(oldS, 0.9), 1) + ' and ' + fmt(qsorted(newS, 0.9), 1) + '.' + NOTE + 'An <strong>ECDF</strong> plots, for every value x, the proportion of observations at or below x. It rises in a small step at every data point, so nothing is binned or smoothed. Read it vertically to get proportions and horizontally to get percentiles: the median is where the curve crosses 0.5. A curve further to the left means smaller values overall. ECDFs are less familiar than histograms, but they make comparing whole distributions, and especially their tails, precise.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does the box in a box plot span?', options: ['The full range', 'From the first to the third quartile: the middle half of the data', 'The mean ± one standard deviation', 'The 95% confidence interval'], answer: 1, explanation: 'Its length is the interquartile range.' },
      { question: 'The line inside the box marks…', options: ['The mean', 'The median', 'The mode', 'The maximum'], answer: 1, explanation: 'The mean is sometimes added as a separate marker.' },
      { question: 'In Tukey’s convention, how far do the whiskers reach?', options: ['To the minimum and maximum', 'To the furthest point within 1.5 × IQR of the box', 'To 2 standard deviations', 'To the 5th and 95th percentiles'], answer: 1, explanation: 'Check the caption; conventions vary.' },
      { question: 'What can a box plot NOT show?', options: ['The median', 'Skewness', 'Whether the data have two peaks', 'Outliers'], answer: 2, explanation: 'Add the data points or a violin.' },
      { question: 'If the notches of two box plots do not overlap…', options: ['The means are equal', 'There is rough evidence that the medians differ', 'The data are normal', 'There are no outliers'], answer: 1, explanation: 'Notches are approximate 95% intervals for the median.' },
      { question: 'A violin plot adds to a box plot…', options: ['Error bars', 'A mirrored density curve showing the distribution’s shape', 'Colour', 'A regression line'], answer: 1, explanation: 'Hintze and Nelson, 1998.' },
      { question: 'What is a beeswarm plot?', options: ['A heatmap', 'Every observation as a dot, arranged so that none overlap', 'A 3D chart', 'A map'], answer: 1, explanation: 'Best for small to moderate samples.' },
      { question: 'Why are bar charts of means with error bars (“dynamite plots”) criticised?', options: ['They use colour', 'They hide the distribution, sample size and outliers behind one number', 'They are hard to draw', 'They start at zero'], answer: 1, explanation: 'Show the data instead.' },
      { question: 'On an ECDF, where can you read the median?', options: ['At the highest point', 'Where the curve crosses a proportion of 0.5', 'At x = 0', 'At the steepest point'], answer: 1, explanation: 'Read horizontally for any percentile.' },
      { question: 'One ECDF lies entirely to the left of another. This means…', options: ['The first group has larger values', 'The first group tends to have smaller values', 'They are identical', 'Nothing'], answer: 1, explanation: 'At every value, more of the first group is below it.' }
    ]);
  };
})();
