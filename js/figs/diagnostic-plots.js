/* ==========================================================================
   RNLearn — Diagnostic Plots (Reading the Picture, Part 9)
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
    { name: 'Checking models', color: '#b45309' },
    { name: 'Comparing and pooling', color: '#7c3aed' },
    { name: 'Thousands of tests', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1963', icon: '🔍', era: 0, sec: 4, title: 'Looking at residuals', text: 'Frank Anscombe and John Tukey publish a classic paper on examining the residuals of a fitted model.' },
    { year: '1968', icon: '📏', era: 0, sec: 3, title: 'Probability plots', text: 'Martin Wilk and Ram Gnanadesikan set out quantile–quantile (Q–Q) plots for comparing distributions.' },
    { year: '1977', icon: '⚖️', era: 0, sec: 5, title: 'Cook’s distance', text: 'R. Dennis Cook proposes a measure of how much each observation changes a fitted regression.' },
    { year: '1984', icon: '🔻', era: 1, sec: 7, title: 'Funnel plots', text: 'Richard Light and David Pillemer suggest plotting studies’ effects against their size to spot missing studies.' },
    { year: '1986', icon: '🩺', era: 1, sec: 6, title: 'Bland–Altman', text: 'Martin Bland and Douglas Altman show in The Lancet how to judge whether two measurement methods agree.' },
    { year: '1997', icon: '📐', era: 1, sec: 7, title: 'Egger’s test', text: 'Matthias Egger and colleagues give a test for funnel-plot asymmetry, a sign of publication bias.' },
    { year: '2000s', icon: '🌋', era: 2, sec: 8, title: 'Volcano plots', text: 'Gene-expression studies adopt volcano plots of fold change against significance for thousands of genes at once.' }
  ];
  FIG['fig-p9-timeline'] = function (figEl) {
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
  function yLab(svg, x, T, B, text, fs, c) { var t = txt(svg, x, (T + B) / 2, text, { size: fs(10), fill: c.muted }); t.setAttribute('transform', 'rotate(-90 ' + x + ' ' + ((T + B) / 2) + ')'); }
  function dotsP(svg, P, xs, ys, col, r, op) { xs.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(ys[i]), r: r || 3, fill: col, 'fill-opacity': op || 0.8 }, svg); }); }

  /* -----------------------------------------------------------------------
     Figure: Q–Q plots
     ----------------------------------------------------------------------- */
  FIG['fig-qq'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = ['Normal', 'Right-skewed', 'Left-skewed', 'Heavy tails', 'Light tails', 'Bimodal'], k = 1, n = 100;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', D, k, function (i) { k = i; draw(); });
    FIG.slider(controls, { id: 'qq-n', label: 'Sample size', min: 10, max: 500, step: 10, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function sample() { var r = rngSeed(500 + k), a = []; for (var i = 0; i < n; i++) { var z = rnorm(r), v; if (k === 0) v = z; else if (k === 1) v = Math.exp(0.6 * z); else if (k === 2) v = -Math.exp(0.6 * z); else if (k === 3) { var c2 = 0; for (var j = 0; j < 3; j++) { var q = rnorm(r); c2 += q * q; } v = z / Math.sqrt(c2 / 3); } else if (k === 4) v = 2 * r() - 1; else v = (i % 2 ? -1.5 : 1.5) + 0.5 * z; a.push(v); } return a; }
    function draw() {
      var a = sample().sort(function (x, y) { return x - y; }), m = mean(a), s = sdv(a), z = a.map(function (v) { return (v - m) / s; }), th = a.map(function (_, i) { return ninv((i + 0.5) / n); });
      var c = C(), A = newSVG(svgWrap, container, 290, 'A histogram of the sample and its normal quantile–quantile plot'), W = A.W, svg = A.svg, fs = A.fs, wide = W >= 560, half = wide ? W / 2 : W;
      if (wide) { var H = histCounts2(z, 0.4), ym = Math.max.apply(null, H.map(function (h) { return h[2]; })) * 1.1, P1 = plotAxes(svg, c, fs, { L: 20, R: half - 20, T: 20, B: 250, xl: -4.5, xh: 4.5, yl: 0, yh: ym, xticks: [-4, -2, 0, 2, 4], yticks: [], xlab: 'standardised value' }); H.forEach(function (h) { el('rect', { x: P1.X(h[0]) + 0.5, y: P1.Y(h[2]), width: Math.max(0.5, P1.X(h[1]) - P1.X(h[0]) - 1), height: P1.Y(0) - P1.Y(h[2]), fill: OI[0], 'fill-opacity': 0.7 }, svg); }); plotLine(svg, P1, function (x) { return npdf(x) * n * 0.4; }, -4.5, 4.5, 100, c.ink, 1.2, '4 3'); txt(svg, (20 + half - 20) / 2, 12, 'histogram (dashed: normal curve)', { size: fs(9.5), fill: c.muted }); }
      var P2 = plotAxes(svg, c, fs, { L: (wide ? half : 0) + 44, R: W - 14, T: 20, B: 250, xl: -3.2, xh: 3.2, yl: -4.5, yh: 4.5, xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [-4, -2, 0, 2, 4], xlab: 'theoretical normal quantile' });
      yLab(svg, (wide ? half : 0) + 12, 20, 250, 'sample quantile', fs, c);
      el('line', { x1: P2.X(-3.2), y1: P2.Y(-3.2), x2: P2.X(3.2), y2: P2.Y(3.2), stroke: OI[3], 'stroke-width': 1.5, 'clip-path': P2.clip }, svg);
      th.forEach(function (t, i) { if (Math.abs(z[i]) < 4.5) el('circle', { cx: P2.X(t), cy: P2.Y(z[i]), r: 2.6, fill: OI[0] }, svg); });
      out.innerHTML = ['Points follow the straight line: the data are consistent with a normal distribution. Small wiggles at the ends are normal, especially for small samples.', 'A curve bending upwards (convex), with the right end far above the line: a long right tail. The largest values are larger than a normal distribution would produce.', 'A curve bending downwards (concave): a long left tail.', 'An S-shape steep at both ends: both tails are heavier than normal, so extreme values are more common than a normal model expects.', 'An S-shape flat at both ends: the tails are lighter than normal; values stop abruptly, as in a uniform distribution.', 'A flat stretch in the middle with steep parts either side: a gap in the data between two clusters.'][k] + NOTE + 'A <strong>quantile–quantile (Q–Q) plot</strong> sorts the data and plots each value against where it would be expected to fall if the data came from a normal distribution. If the shapes match, the points lie on a straight line. The plot shows not just whether the data are non-normal but <em>how</em>: which tail, and in what direction. With fewer than about 30 points, even normal data wobble noticeably.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };
  function histCounts2(a, w) { var lo = Math.floor(Math.min.apply(null, a) / w) * w, b = {}; a.forEach(function (v) { var k = Math.floor((v - lo) / w); b[k] = (b[k] || 0) + 1; }); var n = Math.max.apply(null, Object.keys(b).map(Number)) + 1, o = []; for (var i = 0; i < n; i++) o.push([lo + i * w, lo + (i + 1) * w, b[i] || 0]); return o; }

  /* -----------------------------------------------------------------------
     Figure: residual plots
     ----------------------------------------------------------------------- */
  FIG['fig-residuals'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CASES = ['Good fit', 'Missed curve', 'Growing spread', 'Outlier'], k = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', CASES, k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var r = rngSeed(700 + k), X = [], Y = [];
      for (var i = 0; i < 80; i++) { var x = 10 * r(), e = rnorm(r), y; if (k === 0) y = 2 + x + e; else if (k === 1) y = 2 + 0.15 * x * x + e; else if (k === 2) y = 2 + x + (0.25 * x + 0.2) * e; else { y = 2 + x + e; if (i === 0) { x = 5; y = 16; } } X.push(x); Y.push(y); }
      var f = linfit(X, Y), fit = X.map(function (x) { return f.a + f.b * x; }), res = Y.map(function (y, i) { return y - fit[i]; });
      var c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 560 ? 510 : 260, 'Data with a straight-line fit, and the residuals plotted against the fitted values'), W = A.W, svg = A.svg, fs = A.fs, wide = W >= 560, pw = wide ? W / 2 : W;
      var P1 = plotAxes(svg, c, fs, { L: 40, R: pw - 14, T: 20, B: 220, xl: 0, xh: 10, yl: Math.min.apply(null, Y) - 1, yh: Math.max.apply(null, Y) + 1, xticks: [0, 5, 10], yticks: [], xlab: 'x' });
      dotsP(svg, P1, X, Y, OI[0], 2.8); el('line', { x1: P1.X(0), y1: P1.Y(f.a), x2: P1.X(10), y2: P1.Y(f.a + 10 * f.b), stroke: OI[3], 'stroke-width': 2 }, svg); txt(svg, (40 + pw - 14) / 2, 12, 'data and straight-line fit', { size: fs(9.5), fill: c.muted });
      var mr = Math.max.apply(null, res.map(Math.abs)) * 1.15, x0 = wide ? pw : 0, y0 = wide ? 0 : 268, P2 = plotAxes(svg, c, fs, { L: x0 + 44, R: W - 14, T: y0 + 20, B: y0 + 220, xl: Math.min.apply(null, fit), xh: Math.max.apply(null, fit), yl: -mr, yh: mr, xticks: [], yticks: [0], xlab: 'fitted value' });
      yLab(svg, x0 + 14, y0 + 20, y0 + 220, 'residual', fs, c);
      el('line', { x1: x0 + 44, y1: P2.Y(0), x2: W - 14, y2: P2.Y(0), stroke: c.muted }, svg); dotsP(svg, P2, fit, res, OI[2], 2.8); txt(svg, (x0 + 44 + W - 14) / 2, y0 + 12, 'residuals against fitted values', { size: fs(9.5), fill: c.muted });
      out.innerHTML = ['The residuals form a shapeless horizontal band around zero: no pattern left to explain. This is what a good fit looks like.', 'The residuals make a U-shape: positive at both ends, negative in the middle. The straight line has missed a curve; try a curved model or a transformation.', 'The residuals fan out as the fitted value grows: the spread is not constant (heteroscedasticity). Standard errors from the straight-line fit are unreliable; consider a log scale or weighted regression.', 'One residual stands far from the rest: an outlier. Check it for errors, and check whether it changes the fit (Section 6).'][k] + NOTE + 'A <strong>residual</strong> is the difference between an observed value and the value the model predicts. Plotting residuals against fitted values magnifies whatever the model failed to capture, which is often invisible in the original scatter plot. Ideally you should see nothing but random scatter.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: leverage and influence
     ----------------------------------------------------------------------- */
  FIG['fig-influence'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(2), X = [], Y = []; for (var i = 0; i < 30; i++) { var x = 10 * r(); X.push(x); Y.push(3 + 0.5 * x + rnorm(r)); }
    var px = 20, py = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'in-x', label: 'Extra point: x', min: 0, max: 22, step: 0.5, value: px, onChange: function (v) { px = v; draw(); } });
    FIG.slider(controls, { id: 'in-y', label: 'Extra point: y', min: 0, max: 16, step: 0.5, value: py, onChange: function (v) { py = v; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var Xa = X.concat([px]), Ya = Y.concat([py]), f0 = linfit(X, Y), f1 = linfit(Xa, Ya), n = Xa.length, mx = mean(Xa), sxx = Xa.reduce(function (s, x) { return s + (x - mx) * (x - mx); }, 0), h = 1 / n + (px - mx) * (px - mx) / sxx;
      var res = Ya.map(function (y, i) { return y - f1.a - f1.b * Xa[i]; }), s2 = res.reduce(function (s, e) { return s + e * e; }, 0) / (n - 2), e = res[n - 1], cook = e * e / (2 * s2) * h / ((1 - h) * (1 - h));
      var c = C(), A = newSVG(svgWrap, container, 280, 'A scatter plot with one movable point and the regression line with and without it'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 14, B: 240, xl: 0, xh: 22, yl: 0, yh: 16, xticks: [0, 5, 10, 15, 20], yticks: [0, 5, 10, 15], xlab: 'x', ylab: 'y' });
      dotsP(svg, P, X, Y, OI[0], 3);
      el('line', { x1: P.X(0), y1: P.Y(f0.a), x2: P.X(22), y2: P.Y(f0.a + 22 * f0.b), stroke: c.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', 'clip-path': P.clip }, svg);
      el('line', { x1: P.X(0), y1: P.Y(f1.a), x2: P.X(22), y2: P.Y(f1.a + 22 * f1.b), stroke: OI[3], 'stroke-width': 2.2, 'clip-path': P.clip }, svg);
      el('circle', { cx: P.X(px), cy: P.Y(py), r: 7, fill: AMBER, stroke: c.ink }, svg);
      out.innerHTML = 'Slope without the point: ' + fmt(f0.b, 2) + '; with it: <strong>' + fmt(f1.b, 2) + '</strong>. Leverage h = <strong>' + fmt(h, 2) + '</strong>, Cook’s distance = <strong>' + fmt(cook, 2) + '</strong>' + (cook > 1 ? ' (very influential).' : cook > 4 / n ? ' (worth checking).' : '.') + NOTE + 'A point’s <strong>leverage</strong> depends only on how far its x is from the others: a point far out on the x-axis can pull the line like a long lever. Its <strong>influence</strong> depends on both leverage and how far it lies from the line the other points suggest. Cook’s distance combines the two; values above about 4/n are often flagged and above 1 are very influential. Move the point to the far right but onto the line (y ≈ 13): high leverage, little influence. Move it far below: the line swings.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Bland–Altman
     ----------------------------------------------------------------------- */
  FIG['fig-bland-altman'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var bias = 5, prop = 0.08;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ba-b', label: 'Constant bias of method B', min: -10, max: 10, step: 1, value: bias, onChange: function (x) { bias = x; draw(); } });
    FIG.slider(controls, { id: 'ba-p', label: 'Proportional bias of B', min: 0, max: 0.2, step: 0.01, value: prop, onChange: function (x) { prop = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var r = rngSeed(3), T = [], EA = [], EB = []; for (var i = 0; i < 60; i++) { T.push(80 + 100 * r()); EA.push(4 * rnorm(r)); EB.push(4 * rnorm(r)); }
    function draw() {
      var Aa = T.map(function (t, i) { return t + EA[i]; }), Bb = T.map(function (t, i) { return t * (1 + prop) - 130 * prop + bias + EB[i]; }), M = Aa.map(function (a, i) { return (a + Bb[i]) / 2; }), Dd = Aa.map(function (a, i) { return Bb[i] - a; }), md = mean(Dd), sd = sdv(Dd), rr = linfit(Aa, Bb).r;
      var c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 560 ? 510 : 260, 'Two methods compared by a scatter plot with the line of equality and by a Bland–Altman plot'), W = A.W, svg = A.svg, fs = A.fs, wide = W >= 560, pw = wide ? W / 2 : W;
      var P1 = plotAxes(svg, c, fs, { L: 44, R: pw - 14, T: 20, B: 220, xl: 60, xh: 210, yl: 60, yh: 210, xticks: [100, 150, 200], yticks: [100, 150, 200], xlab: 'method A', ylab: 'method B' });
      el('line', { x1: P1.X(60), y1: P1.Y(60), x2: P1.X(210), y2: P1.Y(210), stroke: c.muted, 'stroke-dasharray': '4 4' }, svg); dotsP(svg, P1, Aa, Bb, OI[0], 2.8); txt(svg, (44 + pw - 14) / 2, 12, 'B against A (dashed: equality)', { size: fs(9.5), fill: c.muted });
      var x0 = wide ? pw : 0, y0 = wide ? 0 : 268, P2 = plotAxes(svg, c, fs, { L: x0 + 44, R: W - 14, T: y0 + 20, B: y0 + 220, xl: 60, xh: 210, yl: -30, yh: 40, xticks: [100, 150, 200], yticks: [-20, 0, 20, 40], xlab: 'mean of A and B' });
      yLab(svg, x0 + 12, y0 + 20, y0 + 220, 'B − A', fs, c);
      [[md, c.ink, ''], [md + 1.96 * sd, OI[3], '4 3'], [md - 1.96 * sd, OI[3], '4 3'], [0, c.border, '']].forEach(function (l) { el('line', { x1: x0 + 44, y1: P2.Y(l[0]), x2: W - 14, y2: P2.Y(l[0]), stroke: l[1], 'stroke-width': 1.4, 'stroke-dasharray': l[2] }, svg); });
      dotsP(svg, P2, M, Dd, OI[2], 2.8); txt(svg, (x0 + 44 + W - 14) / 2, y0 + 12, 'Bland–Altman plot', { size: fs(9.5), fill: c.muted });
      out.innerHTML = 'Correlation between methods: <strong>r = ' + fmt(rr, 3) + '</strong>. Mean difference (bias) <strong>' + fmt(md, 1) + '</strong>; 95% limits of agreement <strong>' + fmt(md - 1.96 * sd, 1) + ' to ' + fmt(md + 1.96 * sd, 1) + '</strong>.' + NOTE + 'When two methods measure the same thing, a high correlation does not mean they agree: any two methods that both track the true value correlate, even if one always reads 10 units high. Martin Bland and Douglas Altman suggested plotting the <strong>difference</strong> between the methods against their <strong>average</strong>. The mean difference shows the bias, the limits (mean ± 1.96 SD) show how far apart individual readings can be, and a slope in the points reveals bias that grows with the size of the measurement. Whether the agreement is good enough is a practical question, not a statistical one.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: funnel plot and publication bias
     ----------------------------------------------------------------------- */
  FIG['fig-funnel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(4), S = [], truth = 0.2; for (var i = 0; i < 90; i++) { var se = 0.05 + 0.45 * r(); S.push([truth + se * rnorm(r), se]); }
    var bias = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Studies shown', ['Only published (with publication bias)', 'All studies conducted'], 0, function (i) { bias = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var shown = S.filter(function (s) { return !bias || s[0] / s[1] > 1 || s[1] < 0.15; }), w = shown.map(function (s) { return 1 / (s[1] * s[1]); }), pooled = shown.reduce(function (a, s, i) { return a + w[i] * s[0]; }, 0) / w.reduce(function (a, b) { return a + b; }, 0), naive = mean(shown.map(function (s) { return s[0]; }));
      var c = C(), A = newSVG(svgWrap, container, 300, 'A funnel plot of study estimates against their standard errors'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 14, B: 260, xl: -1, xh: 1.4, yl: 0.55, yh: 0, xticks: [-1, -0.5, 0, 0.5, 1], yticks: [0, 0.2, 0.4], xlab: 'estimated effect', ylab: 'standard error (precise at top)' });
      el('path', { d: 'M' + P.X(truth) + ' ' + P.Y(0) + 'L' + P.X(truth - 1.96 * 0.55) + ' ' + P.Y(0.55) + 'M' + P.X(truth) + ' ' + P.Y(0) + 'L' + P.X(truth + 1.96 * 0.55) + ' ' + P.Y(0.55), stroke: c.muted, fill: 'none' }, svg);
      el('line', { x1: P.X(truth), y1: P.Y(0), x2: P.X(truth), y2: P.Y(0.55), stroke: c.ink, 'stroke-dasharray': '4 4' }, svg);
      shown.forEach(function (s) { el('circle', { cx: P.X(s[0]), cy: P.Y(s[1]), r: 3.5, fill: OI[0], 'fill-opacity': 0.8 }, svg); });
      el('line', { x1: P.X(pooled), y1: P.Y(0), x2: P.X(pooled), y2: P.Y(0.55), stroke: OI[3], 'stroke-width': 2 }, svg);
      out.innerHTML = shown.length + ' studies shown. Pooled (weighted) estimate <strong>' + fmt(pooled, 2) + '</strong> (red line); simple average ' + fmt(naive, 2) + '; true effect <strong>' + truth + '</strong> (dashed). ' + (bias ? 'The bottom-left of the funnel is empty: small studies with weak or negative results were never published, so the funnel is lopsided and the evidence overstates the effect.' : 'With every study included, the points fill a symmetrical funnel around the true effect: small studies scatter widely, large ones cluster tightly.') + NOTE + 'A funnel plot shows each study’s estimate against its precision (here its standard error, with the most precise at the top). Without bias, studies form a symmetrical, inverted funnel. Asymmetry suggests that some results are missing, often because journals and authors favour “positive” findings, though it can have other causes such as genuine differences between small and large studies. The studies are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: volcano plot
     ----------------------------------------------------------------------- */
  FIG['fig-volcano'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(5), G = [], n = 6;
    for (var g = 0; g < 2000; g++) { var real = r() < 0.05, eff = real ? 2 * rnorm(r) : 0, a = [], b = []; for (var i = 0; i < n; i++) { a.push(rnorm(r)); b.push(eff + rnorm(r)); } var ma = mean(a), mb = mean(b), sp = Math.sqrt((Math.pow(sdv(a), 2) + Math.pow(sdv(b), 2)) / 2), t = (mb - ma) / (sp * Math.sqrt(2 / n)), p = 2 * (1 - tcdf(Math.abs(t), 2 * n - 2)); G.push([mb - ma, Math.max(1e-12, p), real]); }
    var fc = 1, pt = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'vo-f', label: 'Fold-change threshold (|log₂ FC|)', min: 0, max: 3, step: 0.25, value: fc, onChange: function (x) { fc = x; draw(); } });
    FIG.slider(controls, { id: 'vo-p', label: 'Significance threshold (−log₁₀ p)', min: 1, max: 5, step: 0.25, value: pt, onChange: function (x) { pt = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'A volcano plot: fold change against minus log ten p-value for 2,000 genes'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 14, T: 14, B: 250, xl: -6, xh: 6, yl: 0, yh: 8, xticks: [-6, -3, 0, 3, 6], yticks: [0, 2, 4, 6, 8], xlab: 'log₂ fold change', ylab: '−log₁₀ p' });
      var hits = 0, fp = 0;
      G.forEach(function (gg) { var y = Math.min(8, -Math.log10(gg[1])), hit = Math.abs(gg[0]) > fc && y > pt; if (hit) { hits++; if (!gg[2]) fp++; } el('circle', { cx: P.X(Math.max(-6, Math.min(6, gg[0]))), cy: P.Y(y), r: hit ? 2.8 : 1.8, fill: hit ? (gg[0] > 0 ? OI[3] : OI[0]) : c.border }, svg); });
      el('line', { x1: P.X(-6), y1: P.Y(pt), x2: P.X(6), y2: P.Y(pt), stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      [-fc, fc].forEach(function (v) { el('line', { x1: P.X(v), y1: P.Y(0), x2: P.X(v), y2: P.Y(8), stroke: c.muted, 'stroke-dasharray': '4 4' }, svg); });
      var real = G.filter(function (gg) { return gg[2]; }).length;
      out.innerHTML = '<strong>' + hits + '</strong> genes pass both thresholds (coloured); in this simulation, <strong>' + fp + '</strong> of them are false positives. ' + real + ' of the 2,000 genes truly change.' + NOTE + 'A volcano plot shows thousands of tests at once: each dot is a gene, placed by the size of its change (log₂ fold change; +1 means doubled, −1 halved) and by the strength of the evidence (−log₁₀ of the p-value; 2 means p = 0.01, 5 means p = 0.00001). Interesting genes sit in the upper corners: big changes with strong evidence. With 2,000 tests, about 20 will reach p &lt; 0.01 by chance alone, which is why real analyses correct for multiple testing. Lower the thresholds and watch the false positives grow. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'If data come from a normal distribution, their normal Q–Q plot shows…', options: ['A U-shape', 'Points close to a straight line', 'A horizontal line', 'A circle'], answer: 1, explanation: 'Deviations show how the shape differs.' },
      { question: 'A Q–Q plot whose upper end curves far above the line suggests…', options: ['A long right tail', 'A long left tail', 'Light tails', 'Perfect normality'], answer: 0, explanation: 'The largest values are bigger than normal would give.' },
      { question: 'An S-shaped Q–Q plot that is steep at both ends indicates…', options: ['Heavy tails', 'Light tails', 'Skew', 'A good fit'], answer: 0, explanation: 'More extreme values than normal.' },
      { question: 'A U-shaped pattern in a residual plot means…', options: ['A good fit', 'The model missed a curve', 'Constant variance', 'No data'], answer: 1, explanation: 'Try a curved model or transformation.' },
      { question: 'Residuals that fan out as fitted values increase indicate…', options: ['Heteroscedasticity (non-constant spread)', 'A perfect model', 'Missing data', 'Normality'], answer: 0, explanation: 'Standard errors become unreliable.' },
      { question: 'What gives a point high leverage in regression?', options: ['A large residual', 'An x-value far from the others', 'Being red', 'A small y-value'], answer: 1, explanation: 'Influence needs leverage and a large residual.' },
      { question: 'Why is correlation not enough to show that two measurement methods agree?', options: ['It is always low', 'Two methods can correlate highly while one reads consistently higher', 'It needs a pie chart', 'It ignores sample size'], answer: 1, explanation: 'Use a Bland–Altman plot.' },
      { question: 'What does a Bland–Altman plot show on its axes?', options: ['A against B', 'The difference between methods against their average', 'Time against value', 'p against fold change'], answer: 1, explanation: 'With mean bias and limits of agreement.' },
      { question: 'An asymmetric funnel plot, with small negative studies missing, suggests…', options: ['A perfect meta-analysis', 'Possible publication bias', 'Too many studies', 'Normal data'], answer: 1, explanation: 'Though other explanations exist.' },
      { question: 'In a volcano plot, the most interesting points are…', options: ['At the bottom centre', 'In the upper left and right corners', 'On the x-axis', 'Hidden'], answer: 1, explanation: 'Large changes with strong evidence.' }
    ]);
  };
})();
