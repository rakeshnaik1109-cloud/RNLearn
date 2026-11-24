/* ==========================================================================
   RNLearn — Scientific Plots and Choosing the Right Chart (Reading the Picture, Part 12)
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
    { name: 'Scientific graphics', color: '#b45309' },
    { name: 'Quality and medicine', color: '#7c3aed' },
    { name: 'Theory of graphics', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1701', icon: '🧭', era: 0, sec: 4, title: 'Halley’s isolines', text: 'Edmond Halley publishes a chart of the Atlantic with lines joining places of equal magnetic variation, an early contour map of a measured quantity.' },
    { year: '1896', icon: '📉', era: 0, sec: 3, title: 'Pareto’s log–log plot', text: 'Vilfredo Pareto plots the number of people above each income on logarithmic axes and finds a straight line: a power law.' },
    { year: '1924', icon: '🏭', era: 1, sec: 7, title: 'The control chart', text: 'Walter Shewhart sketches the first control chart in a memo at Bell Telephone Laboratories.' },
    { year: '1946', icon: '🎙️', era: 0, sec: 5, title: 'The sound spectrograph', text: 'Bell Labs engineers describe the sound spectrograph, which shows the frequencies of speech over time.' },
    { year: '1958', icon: '📊', era: 1, sec: 6, title: 'Kaplan–Meier', text: 'Edward Kaplan and Paul Meier publish their estimator of survival curves from incomplete observations.' },
    { year: '1999', icon: '📚', era: 2, sec: 8, title: 'The grammar of graphics', text: 'Leland Wilkinson describes charts as combinations of data, scales, marks and coordinates, an idea behind modern plotting libraries.' }
  ];
  FIG['fig-p12-timeline'] = function (figEl) {
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
  function lineXY(svg, P, xs, ys, col, w, dash) { var d = ''; xs.forEach(function (x, i) { if (!isFinite(ys[i])) return; d += (d ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(ys[i]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2, 'stroke-dasharray': dash || '', 'clip-path': P.clip }, svg); }

  /* -----------------------------------------------------------------------
     Figure: linear, semi-log and log–log axes
     ----------------------------------------------------------------------- */
  FIG['fig-loglog'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var law = 0, ax = 2, b = 1.5;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Power law y = 2xᵇ', 'Exponential y = 2e^(0.08x)'], law, function (i) { law = i; draw(); });
    choice(controls, 'Axes', ['Linear', 'Semi-log (log y)', 'Log–log'], ax, function (i) { ax = i; draw(); });
    FIG.slider(controls, { id: 'll-b', label: 'Exponent b (power law)', min: -1, max: 3, step: 0.1, value: b, onChange: function (x) { b = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var xs = [], ys = [], r = rngSeed(3); for (var i = 0; i < 40; i++) { var x = 1 + 99 * Math.pow(i / 39, ax === 2 ? 2.2 : 1); xs.push(x); ys.push((law ? 2 * Math.exp(0.08 * x) : 2 * Math.pow(x, b)) * Math.exp(0.08 * rnorm(r))); }
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), logy = ax > 0, logx = ax === 2;
      var c = C(), A = newSVG(svgWrap, container, 280, 'Data plotted on linear, semi-logarithmic or log–log axes'), W = A.W, svg = A.svg, fs = A.fs;
      var yl = logy ? Math.pow(10, Math.floor(Math.log10(lo))) : Math.min(0, lo), yh = logy ? Math.pow(10, Math.ceil(Math.log10(hi))) : hi * 1.05, yt = [];
      if (logy) for (var e = Math.log10(yl); e <= Math.log10(yh) + 1e-9; e++) yt.push(Math.pow(10, e)); else yt = niceTicks(yl, yh, 4);
      var P = plotAxes(svg, c, fs, { L: 56, R: W - 14, T: 14, B: 240, xl: 1, xh: 100, yl: yl, yh: yh, xticks: logx ? [1, 10, 100] : [1, 25, 50, 75, 100], yticks: yt, logx: logx, logy: logy, yfmt: function (v) { return fmt(v, 0); }, xlab: 'x', ylab: 'y' });
      xs.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(ys[i]), r: 3, fill: OI[0] }, svg); });
      var lx = xs.map(Math.log), ly = ys.map(Math.log), fpow = linfit(lx, ly), fexp = linfit(xs, ly);
      out.innerHTML = (law === 0 ? 'Power law with b = ' + fmt(b, 1) + '. ' + (ax === 2 ? 'On log–log axes it is a <strong>straight line whose slope is the exponent</strong>: the fitted slope is ' + fmt(fpow.b, 2) + '.' : 'On these axes it curves; switch to log–log to straighten it.') : 'Exponential growth. ' + (ax === 1 ? 'On a semi-log plot (log y, linear x) it is a <strong>straight line</strong>; its slope gives the growth rate: ' + fmt(fexp.b, 3) + ' per unit of x (true 0.08).' : 'On these axes it curves; on a semi-log plot it would be straight.')) + NOTE + 'Logarithmic axes turn certain curves into straight lines, which makes them a test of the underlying law. <strong>Exponential</strong> processes (compound interest, early epidemics, radioactive decay) are straight on semi-log axes. <strong>Power laws</strong> (y ∝ xᵇ: the area of a shape against its length, metabolic rate against body mass, city sizes) are straight on log–log axes, with slope b. A straight line on log–log axes over a narrow range is weak evidence of a power law, though: many curves look straight over one or two factors of ten.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: contour plot
     ----------------------------------------------------------------------- */
  FIG['fig-contour'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nl = 8, filled = true;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ct-n', label: 'Number of contour levels', min: 3, max: 20, step: 1, value: nl, onChange: function (x) { nl = x; draw(); } });
    choice(controls, 'Style', ['Filled with lines', 'Lines only'], 0, function (i) { filled = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function f(x, y) { return Math.exp(-((x - 1) * (x - 1) + y * y)) + 0.8 * Math.exp(-((x + 1.2) * (x + 1.2) + (y - 0.5) * (y - 0.5)) / 0.5); }
    function vir(t) { var s = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]]; t = Math.max(0, Math.min(1, t)); var xx = t * 4, i = Math.min(3, Math.floor(xx)), q = xx - i; return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(s[i][k] + q * (s[i + 1][k] - s[i][k])); }).join(',') + ')'; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A contour map of a surface with two peaks'), W = A.W, svg = A.svg, fs = A.fs, L = Math.max(14, (W - 405) / 2), R = Math.min(W - 14, L + 405), T = 10, B = 280, nx = 90, ny = 60, Xf = function (i) { return -3 + 6 * i / nx; }, Yf = function (j) { return 2 - 4 * j / ny; }, sx = (R - L) / nx, sy = (B - T) / ny, Z = [];
      for (var j = 0; j <= ny; j++) { Z.push([]); for (var i = 0; i <= nx; i++) Z[j].push(f(Xf(i), Yf(j))); }
      var levels = []; for (var k = 1; k <= nl; k++) levels.push(1.02 * k / (nl + 1));
      if (filled) for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) { var v = (Z[j][i] + Z[j + 1][i + 1]) / 2, band = levels.filter(function (l) { return v >= l; }).length; el('rect', { x: L + i * sx, y: T + j * sy, width: sx + 0.5, height: sy + 0.5, fill: vir(band / nl) }, svg); }
      var path = '';
      levels.forEach(function (lv) { for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) { var a = Z[j][i], b = Z[j][i + 1], cc = Z[j + 1][i + 1], d = Z[j + 1][i], pts = [], X0 = L + i * sx, Y0 = T + j * sy;
        var e = function (p, q, x1, y1, x2, y2) { if ((p < lv) !== (q < lv)) { var t = (lv - p) / (q - p); pts.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]); } };
        e(a, b, X0, Y0, X0 + sx, Y0); e(b, cc, X0 + sx, Y0, X0 + sx, Y0 + sy); e(cc, d, X0 + sx, Y0 + sy, X0, Y0 + sy); e(d, a, X0, Y0 + sy, X0, Y0);
        for (var m = 0; m + 1 < pts.length; m += 2) path += 'M' + pts[m][0].toFixed(1) + ' ' + pts[m][1].toFixed(1) + 'L' + pts[m + 1][0].toFixed(1) + ' ' + pts[m + 1][1].toFixed(1); } });
      el('path', { d: path, fill: 'none', stroke: filled ? 'rgba(255,255,255,0.7)' : c.ink, 'stroke-width': 1 }, svg);
      el('rect', { x: L, y: T, width: R - L, height: B - T, fill: 'none', stroke: c.border }, svg);
      out.innerHTML = nl + ' contour levels, spaced ' + fmt(1.02 / (nl + 1), 2) + ' apart.' + NOTE + 'A contour plot shows a surface, such as height on a map, as lines joining points of equal value. Read it like a hiking map: closely spaced lines mean a steep slope, widely spaced lines a gentle one, and closed rings mark peaks or pits. Here there are two peaks: a broad one on the right and a slightly lower, sharper one on the left. Filled contours add colour between the lines. Contours are usually clearer than 3D surface plots, which hide parts of the surface behind others and make values hard to read.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Kaplan–Meier survival curves
     ----------------------------------------------------------------------- */
  FIG['fig-km'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var proper = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Method', ['Kaplan–Meier (handles censoring)', 'Ignore censored patients (wrong)'], 0, function (i) { proper = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function groupData(seed, scale) { var r = rngSeed(seed), D = []; for (var i = 0; i < 80; i++) { var te = -scale * Math.log(1 - r()), tc = 6 + 30 * r(); D.push([Math.min(te, tc), te <= tc ? 1 : 0]); } return D; }
    var G = [['Standard treatment', groupData(71, 10), OI[3]], ['New treatment', groupData(72, 24), OI[0]]];
    function km(D) { var d = D.filter(function (x) { return proper || x[1] === 1; }).sort(function (a, b) { return a[0] - b[0]; }), n = d.length, s = 1, pts = [[0, 1]], cens = []; d.forEach(function (x) { if (x[1]) { s *= 1 - 1 / n; pts.push([x[0], s]); } else cens.push([x[0], s]); n--; }); return { pts: pts, cens: cens }; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Kaplan–Meier survival curves for two treatments'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 240, xl: 0, xh: 36, yl: 0, yh: 1, xticks: [0, 6, 12, 18, 24, 30, 36], yticks: [0, 0.25, 0.5, 0.75, 1], xlab: 'months since treatment', ylab: 'relapse-free' });
      el('line', { x1: P.X(0), y1: P.Y(0.5), x2: P.X(36), y2: P.Y(0.5), stroke: c.border, 'stroke-dasharray': '4 4' }, svg);
      var med = G.map(function (g, gi) { var k = km(g[1]), d = 'M' + P.X(0) + ' ' + P.Y(1), m = null; k.pts.forEach(function (p, i) { if (i) d += 'L' + P.X(p[0]).toFixed(1) + ' ' + P.Y(k.pts[i - 1][1]).toFixed(1) + 'L' + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1]).toFixed(1); if (m === null && p[1] <= 0.5) m = p[0]; }); var last = k.pts[k.pts.length - 1]; d += 'L' + P.X(Math.min(36, Math.max(last[0], 30))) + ' ' + P.Y(last[1]); el('path', { d: d, fill: 'none', stroke: g[2], 'stroke-width': 2.2, 'clip-path': P.clip }, svg); k.cens.forEach(function (cp) { el('line', { x1: P.X(cp[0]), y1: P.Y(cp[1]) - 4, x2: P.X(cp[0]), y2: P.Y(cp[1]) + 4, stroke: g[2], 'stroke-width': 1.3 }, svg); }); el('line', { x1: 60 + gi * 170, y1: 16, x2: 78 + gi * 170, y2: 16, stroke: g[2], 'stroke-width': 2.5 }, svg); txt(svg, 82 + gi * 170, 20, g[0], { anchor: 'start', size: fs(9.5), fill: c.ink2 }); return m; });
      var nc = G.reduce(function (s, g) { return s + g[1].filter(function (x) { return !x[1]; }).length; }, 0);
      out.innerHTML = 'Median relapse-free time: standard <strong>' + (med[0] ? fmt(med[0], 1) + ' months' : 'not reached') + '</strong>, new <strong>' + (med[1] ? fmt(med[1], 1) + ' months' : 'not reached') + '</strong>. ' + (proper ? nc + ' patients were still relapse-free when their follow-up ended (tick marks). Kaplan–Meier counts them as “at risk” until then.' : 'Dropping the ' + nc + ' censored patients keeps only those who relapsed, so every curve falls to zero and survival looks far worse than it is, especially for the better treatment.') + NOTE + 'A survival curve shows the proportion of people who have not yet had an event (death, relapse, machine failure) over time. Many are <em>censored</em>: the study ended, or they moved away, before anything happened. Edward Kaplan and Paul Meier’s 1958 method uses each person’s information for as long as they were observed. Read the median where a curve crosses 0.5, and remember that the right-hand end, with few people still at risk, is the least certain. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: control chart
     ----------------------------------------------------------------------- */
  FIG['fig-control'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var shift = 1.5, at = 40, Z = sampleN(55, 60, 0, 1);
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'cc-s', label: 'Size of the drift (in standard deviations)', min: 0, max: 4, step: 0.25, value: shift, onChange: function (x) { shift = x; draw(); } });
    FIG.slider(controls, { id: 'cc-a', label: 'Drift starts at sample', min: 21, max: 59, step: 1, value: at, onChange: function (x) { at = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var y = Z.map(function (z, i) { return 500 + 2 * (z + (i >= at ? shift : 0)); }), base = y.slice(0, 20), m = mean(base), s = sdv(base), ucl = m + 3 * s, lcl = m - 3 * s;
      var c = C(), A = newSVG(svgWrap, container, 280, 'A control chart of fill weights with centre line and control limits'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 40, T: 14, B: 240, xl: 0, xh: 59, yl: 490, yh: 514, xticks: [0, 20, 40, 59], yticks: [492, 500, 508], xlab: 'sample number', ylab: 'fill weight (g)' });
      [[m, 'centre', ''], [ucl, 'UCL', '5 4'], [lcl, 'LCL', '5 4']].forEach(function (l) { el('line', { x1: P.X(0), y1: P.Y(l[0]), x2: P.X(59), y2: P.Y(l[0]), stroke: c.muted, 'stroke-dasharray': l[2] }, svg); txt(svg, W - 36, P.Y(l[0]) + 4, l[1], { anchor: 'start', size: fs(9), fill: c.muted }); });
      el('rect', { x: P.X(at), y: 14, width: P.X(59) - P.X(at), height: 226, fill: AMBER, 'fill-opacity': 0.08 }, svg);
      var d = '', flag = [], run = 0, runFlag = -1;
      y.forEach(function (v, i) { d += (i ? 'L' : 'M') + P.X(i).toFixed(1) + ' ' + P.Y(v).toFixed(1); run = v > m ? (run > 0 ? run + 1 : 1) : (run < 0 ? run - 1 : -1); if (Math.abs(run) >= 8 && runFlag < 0) runFlag = i; if (v > ucl || v < lcl) flag.push(i); });
      el('path', { d: d, fill: 'none', stroke: OI[0], 'stroke-width': 1.5 }, svg);
      y.forEach(function (v, i) { var f = flag.indexOf(i) >= 0; el('circle', { cx: P.X(i), cy: P.Y(v), r: f ? 5.5 : 3, fill: f ? OI[3] : OI[0] }, svg); });
      if (runFlag >= 0) { el('circle', { cx: P.X(runFlag), cy: P.Y(y[runFlag]), r: 8, fill: 'none', stroke: PC, 'stroke-width': 2 }, svg); }
      var first = flag.filter(function (i) { return i >= 20; })[0];
      out.innerHTML = (first !== undefined ? 'First point outside the limits: sample <strong>' + first + '</strong>' + (first >= at ? ' (' + (first - at) + ' samples after the drift began).' : ' (a false alarm, before any drift).') : 'No point falls outside the limits.') + (runFlag >= 0 ? ' A run of 8 points on one side of the centre line is flagged at sample ' + runFlag + ' (purple ring).' : '') + NOTE + 'Walter Shewhart’s control chart plots a process measurement over time with a centre line and control limits, usually three standard deviations either side, calculated from a period when the process was stable. Points beyond the limits, or patterns such as long runs on one side of the centre, signal a special cause worth investigating; ordinary variation within the limits should be left alone. Small drifts can take many samples to detect, which is why run rules are added. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: which chart should I use?
     ----------------------------------------------------------------------- */
  FIG['fig-chooser'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var PARTS = { 1: ['how-to-read-any-chart', 'How to Read Any Chart'], 2: ['bars-dots-and-pies', 'Bars, Dots and Pies'], 3: ['lines-and-time', 'Lines and Time'], 4: ['histograms-and-density-plots', 'Histograms and Density Plots'], 5: ['box-plots-violins-and-ecdfs', 'Box Plots, Violins and ECDFs'], 6: ['scatter-plots-and-relationships', 'Scatter Plots and Relationships'], 7: ['error-bars-and-uncertainty', 'Error Bars and Uncertainty'], 8: ['heatmaps-and-many-variables', 'Heatmaps and Many Variables'], 9: ['diagnostic-plots', 'Diagnostic Plots'], 10: ['treemaps-sankeys-and-waterfalls', 'Treemaps, Sankeys and Waterfalls'], 11: ['plots-for-machine-learning', 'Plots for Machine Learning'], 12: ['scientific-plots-and-choosing-the-right-chart', 'this part'] };
    var GOALS = [
      ['Compare categories', [['Bar chart, sorted', 2, 'counts and totals'], ['Dot plot', 2, 'many categories or small differences'], ['Grouped bars or small multiples', 2, 'subgroups']]],
      ['Show change over time', [['Line chart', 3, 'one or a few series'], ['Small multiples or highlighting', 3, 'many series'], ['Index chart or log scale', 3, 'growth of things on different scales'], ['Slope or dumbbell chart', 7, 'before and after']]],
      ['Show a distribution', [['Histogram or density curve', 4, 'one variable'], ['Strip plot or beeswarm', 4, 'small samples, every point'], ['ECDF', 5, 'precise comparison of tails']]],
      ['Compare distributions', [['Box plots (with points)', 5, 'many groups'], ['Violin or raincloud plot', 5, 'shapes and peaks'], ['Ridgeline plot', 4, 'many groups, compact']]],
      ['Show a relationship', [['Scatter plot', 6, 'two numeric variables'], ['Scatter + LOWESS or fit', 6, 'the trend'], ['Hexbin', 6, 'thousands of points'], ['Scatter-plot matrix or heatmap', 8, 'many variables']]],
      ['Show parts of a whole', [['Stacked or 100% stacked bar', 2, 'a few parts'], ['Treemap or sunburst', 10, 'large hierarchies'], ['Waterfall chart', 10, 'how a total changes'], ['Sankey diagram', 10, 'flows between stages']]],
      ['Show uncertainty', [['Error bars (say which!)', 7, 'means and estimates'], ['Forest plot', 7, 'many studies'], ['Confidence or prediction band', 7, 'around a fitted line'], ['Fan chart or quantile dots', 7, 'for general audiences']]],
      ['Check an analysis', [['Q–Q plot', 9, 'normality'], ['Residual plot', 9, 'model fit'], ['Bland–Altman plot', 9, 'agreement of methods'], ['Learning and loss curves', 11, 'machine-learning models']]]
    ], k = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'I want to…', GOALS.map(function (g) { return g[0]; }), k, function (i) { k = i; draw(); });
    var view = div('', container);
    function draw() {
      var g = GOALS[k];
      view.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.6rem;margin-top:0.8rem">' + g[1].map(function (r) { var p = PARTS[r[1]], link = r[1] === 12 ? 'this part' : '<a href="' + p[0] + '.html">Part ' + r[1] + ': ' + p[1] + '</a>'; return '<div style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 0.8rem;background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.45"><div style="font-weight:700;color:var(--ink)">' + r[0] + '</div><div style="color:var(--ink-secondary)">for ' + r[2] + '</div><div style="margin-top:0.3rem;font-size:0.82rem">' + link + '</div></div>'; }).join('') + '</div><p style="font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-muted);margin-top:0.7rem">Start from the question, not the chart type: what comparison should the reader make first? Then choose the encoding the eye reads best for that comparison (Part 1).</p>';
    }
    draw();
  };

  FIG['fig-quiz-p12'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Exponential growth appears as a straight line on…', options: ['Linear axes', 'A semi-log plot (log y)', 'A polar plot', 'A pie chart'], answer: 1, explanation: 'Its slope is the growth rate.' },
      { question: 'On log–log axes, a power law y = a·xᵇ appears as…', options: ['A curve', 'A straight line with slope b', 'A circle', 'A horizontal line'], answer: 1, explanation: 'Fit log y against log x.' },
      { question: 'On a contour map, closely spaced lines indicate…', options: ['A flat area', 'A steep slope', 'Missing data', 'A peak'], answer: 1, explanation: 'Like a hiking map.' },
      { question: 'Why are contour plots often preferred to 3D surface plots?', options: ['They are prettier', '3D surfaces hide parts of themselves and make values hard to read', 'They need less data', 'They show time'], answer: 1, explanation: 'Perspective distorts.' },
      { question: 'What does a spectrogram show?', options: ['Prices', 'How the frequency content of a signal changes over time', 'Survival', 'Income'], answer: 1, explanation: 'Time on x, frequency on y, colour for intensity.' },
      { question: 'What is a censored observation in survival analysis?', options: ['A deleted error', 'Someone whose follow-up ended before the event happened', 'An outlier', 'A secret result'], answer: 1, explanation: 'Kaplan–Meier uses their information until then.' },
      { question: 'Where do you read the median survival time on a Kaplan–Meier plot?', options: ['At the start', 'Where the curve crosses 0.5', 'At the end', 'At the steepest point'], answer: 1, explanation: 'If it never reaches 0.5, the median is not reached.' },
      { question: 'In a Shewhart control chart, the control limits are usually…', options: ['±1 standard deviation', '±3 standard deviations from the centre line', 'The specification limits', 'Chosen at random'], answer: 1, explanation: 'Calculated from a stable period.' },
      { question: 'What should be your first step when choosing a chart?', options: ['Pick the prettiest type', 'Decide which comparison the reader needs to make', 'Use 3D', 'Use as many colours as possible'], answer: 1, explanation: 'Then choose the encoding.' },
      { question: 'Which export format is best for figures in printed papers?', options: ['Low-resolution JPEG', 'A vector format such as PDF or SVG', 'A screenshot', 'GIF'], answer: 1, explanation: 'Vectors scale without blurring.' }
    ]);
  };
})();
