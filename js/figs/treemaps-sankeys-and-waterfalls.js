/* ==========================================================================
   RNLearn — Treemaps, Sankeys and Waterfalls (Reading the Picture, Part 10)
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
    { name: 'Flows', color: '#b45309' },
    { name: 'Parts of a whole', color: '#7c3aed' },
    { name: 'Hierarchies', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1869', icon: '🗺️', era: 0, sec: 10, title: 'Minard’s flow map', text: 'Charles Joseph Minard draws Napoleon’s army as a band whose width shows the number of soldiers.' },
    { year: '1898', icon: '🚂', era: 0, sec: 7, title: 'Sankey’s steam engine', text: 'Captain Matthew Sankey shows the energy flows of a steam engine with arrows whose widths are proportional to the quantities.' },
    { year: '1981', icon: '🧱', era: 1, sec: 5, title: 'Mosaic displays', text: 'John Hartigan and Beat Kleiner describe mosaic displays for tables of counts.' },
    { year: '1992', icon: '🟩', era: 2, sec: 3, title: 'Treemaps', text: 'Ben Shneiderman invents treemaps to see which files fill a computer’s hard disk.' },
    { year: '2000', icon: '🔲', era: 2, sec: 3, title: 'Squarified treemaps', text: 'Mark Bruls, Kees Huizing and Jarke van Wijk lay out treemaps with near-square rectangles.' },
    { year: '2000', icon: '☀️', era: 2, sec: 4, title: 'Sunbursts', text: 'John Stasko and Eugene Zhang study radial, space-filling displays of hierarchies: the sunburst.' }
  ];
  FIG['fig-p10-timeline'] = function (figEl) {
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
  function squarify(vals, x, y, w, h) {
    var out = [], items = vals.slice(), tot = items.reduce(function (a, b) { return a + b.v; }, 0), scale = w * h / tot;
    items = items.map(function (it) { return { v: it.v * scale, d: it }; });
    function worst(row, len) { var s = row.reduce(function (a, b) { return a + b.v; }, 0), mx = Math.max.apply(null, row.map(function (r) { return r.v; })), mn = Math.min.apply(null, row.map(function (r) { return r.v; })); return Math.max(len * len * mx / (s * s), s * s / (len * len * mn)); }
    function layout(row, rx, ry, rw, rh) { var s = row.reduce(function (a, b) { return a + b.v; }, 0); if (rw >= rh) { var cw = s / rh, yy = ry; row.forEach(function (r) { var hh = r.v / cw; out.push({ x: rx, y: yy, w: cw, h: hh, d: r.d }); yy += hh; }); return [rx + cw, ry, rw - cw, rh]; } else { var chh = s / rw, xx = rx; row.forEach(function (r) { var ww = r.v / chh; out.push({ x: xx, y: ry, w: ww, h: chh, d: r.d }); xx += ww; }); return [rx, ry + chh, rw, rh - chh]; } }
    var rect = [x, y, w, h], row = [];
    while (items.length) { var it = items[0], len = Math.min(rect[2], rect[3]); if (!row.length || worst(row.concat([it]), len) <= worst(row, len)) { row.push(it); items.shift(); } else { rect = layout(row, rect[0], rect[1], rect[2], rect[3]); row = []; } }
    if (row.length) layout(row, rect[0], rect[1], rect[2], rect[3]);
    return out;
  }
  var BUDGET = [['Education', OI[0], [['Schools', 420], ['Universities', 160], ['Libraries', 35]]], ['Health', OI[3], [['Hospitals', 310], ['Clinics', 90], ['Public health', 40]]], ['Transport', OI[2], [['Roads', 180], ['Transit', 120]]], ['Safety', OI[1], [['Police', 150], ['Fire', 70]]], ['Other', '#888888', [['Parks', 60], ['Admin', 45], ['Housing', 140]]]];

  /* -----------------------------------------------------------------------
     Figure: treemap and sunburst
     ----------------------------------------------------------------------- */
  FIG['fig-treemap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Layout', ['Squarified treemap', 'Slice-and-dice treemap', 'Sunburst'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 340, 'A city budget shown as a treemap or sunburst, with sectors and items'), W = A.W, svg = A.svg, fs = A.fs, tot = 0;
      var secs = BUDGET.map(function (b) { var s = b[2].reduce(function (a, x) { return a + x[1]; }, 0); tot += s; return { v: s, b: b }; }).sort(function (a, b) { return b.v - a.v; });
      if (mode < 2) {
        var X0 = 10, Y0 = 10, WW = W - 20, HH = 320, top;
        if (mode === 0) top = squarify(secs, X0, Y0, WW, HH);
        else { var xx = X0; top = secs.map(function (s) { var w = WW * s.v / tot, r = { x: xx, y: Y0, w: w, h: HH, d: s }; xx += w; return r; }); }
        top.forEach(function (t) { var items = t.d.b[2].map(function (x) { return { v: x[1], n: x[0] }; }).sort(function (a, b) { return b.v - a.v; }), sub;
          if (mode === 0) sub = squarify(items, t.x + 2, t.y + 16, t.w - 4, t.h - 18); else { var yy = t.y + 16, sv = t.d.v; sub = items.map(function (it) { var h = (t.h - 18) * it.v / sv, r = { x: t.x + 2, y: yy, w: t.w - 4, h: h, d: it }; yy += h; return r; }); }
          el('rect', { x: t.x, y: t.y, width: t.w, height: t.h, fill: t.d.b[1], 'fill-opacity': 0.25, stroke: c.surface, 'stroke-width': 2 }, svg);
          txt(svg, t.x + 4, t.y + 12, t.w > 60 ? t.d.b[0] : '', { anchor: 'start', size: fs(9.5), fill: c.ink, weight: 700 });
          sub.forEach(function (s) { el('rect', { x: s.x, y: s.y, width: Math.max(0, s.w), height: Math.max(0, s.h), fill: t.d.b[1], 'fill-opacity': 0.75, stroke: c.surface, 'stroke-width': 1 }, svg); if (s.w > 54 && s.h > 26) { txt(svg, s.x + s.w / 2, s.y + s.h / 2, s.d.n, { size: fs(9), fill: '#fff' }); txt(svg, s.x + s.w / 2, s.y + s.h / 2 + 12, String(s.d.v), { size: fs(8.5), fill: '#fff' }); } }); });
      } else {
        var cx = W / 2, cy = 170, r0 = 45, r1 = 95, r2 = 150, a = -Math.PI / 2;
        var arc = function (ri, ro, a0, a1) { var p = function (r, t) { return (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1); }, lg = a1 - a0 > Math.PI ? 1 : 0; return 'M' + p(ro, a0) + 'A' + ro + ' ' + ro + ' 0 ' + lg + ' 1 ' + p(ro, a1) + 'L' + p(ri, a1) + 'A' + ri + ' ' + ri + ' 0 ' + lg + ' 0 ' + p(ri, a0) + 'Z'; };
        secs.forEach(function (s) { var a1 = a + 2 * Math.PI * s.v / tot; el('path', { d: arc(r0, r1, a, a1), fill: s.b[1], 'fill-opacity': 0.55, stroke: c.surface, 'stroke-width': 2 }, svg); var am = (a + a1) / 2; txt(svg, cx + 70 * Math.cos(am), cy + 70 * Math.sin(am) + 4, s.b[0], { size: fs(9), fill: c.ink, weight: 700 });
          var b = a; s.b[2].forEach(function (it) { var b1 = b + 2 * Math.PI * it[1] / tot; el('path', { d: arc(r1, r2, b, b1), fill: s.b[1], 'fill-opacity': 0.85, stroke: c.surface, 'stroke-width': 1 }, svg); if (b1 - b > 0.18) { var bm = (b + b1) / 2; txt(svg, cx + 123 * Math.cos(bm), cy + 123 * Math.sin(bm) + 4, it[0].split(' ')[0], { size: fs(8.5), fill: '#fff' }); } b = b1; }); a = a1; });
        txt(svg, cx, cy + 4, fmt(tot, 0), { size: fs(11), fill: c.ink, weight: 700 });
      }
      out.innerHTML = ['A <strong>squarified treemap</strong> divides a rectangle into areas proportional to spending, sector by sector and item by item, keeping the rectangles close to square so that their areas are easier to compare. Total budget: ' + fmt(tot, 0) + ' million.', 'The original <strong>slice-and-dice</strong> layout alternates vertical and horizontal cuts. It keeps a simple order, but produces long thin slivers whose areas are very hard to judge.', 'A <strong>sunburst</strong> shows the same hierarchy as rings: sectors in the inner ring, items in the outer ring, with angles proportional to spending. The levels of the hierarchy are clearer than in a treemap, but angles and curved areas are harder to compare than rectangles.'][mode] + NOTE + 'Treemaps and sunbursts show parts of a whole <em>and</em> how they nest. They are good for spotting the biggest items at a glance in large hierarchies, such as budgets, disk usage or market sectors, but not for precise comparisons, because area and angle are weak encodings (Part 1). The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: mosaic plot
     ----------------------------------------------------------------------- */
  FIG['fig-mosaic'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var AG = ['18–34', '35–54', '55+'], MD = ['Phone', 'Laptop', 'Paper'], N = [210, 240, 150], ASSOC = [[0.6, 0.3, 0.1], [0.35, 0.45, 0.2], [0.15, 0.35, 0.5]], assoc = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Preference depends on age', 'Preference independent of age'], 0, function (i) { assoc = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var tot = N.reduce(function (a, b) { return a + b; }, 0), overall = MD.map(function (_, j) { return N.reduce(function (s, n, i) { return s + n * ASSOC[i][j]; }, 0) / tot; }), P = assoc ? ASSOC : AG.map(function () { return overall; });
      var c = C(), A = newSVG(svgWrap, container, 300, 'A mosaic plot of news medium by age group'), W = A.W, svg = A.svg, fs = A.fs, L = 60, Rr = W - 90, T = 14, B = 260, gap = 4, x = L;
      AG.forEach(function (ag, i) { var w = (Rr - L - 2 * gap) * N[i] / tot, y = B; MD.forEach(function (m, j) { var h = (B - T - 2 * gap) * P[i][j]; el('rect', { x: x, y: y - h, width: w, height: h, fill: OI[j] }, svg); if (h > 16 && w > 40) txt(svg, x + w / 2, y - h / 2 + 4, Math.round(100 * P[i][j]) + '%', { size: fs(9), fill: '#fff' }); y -= h + gap; }); txt(svg, x + w / 2, B + 16, W < 560 ? ag : ag + ' (n=' + N[i] + ')', { size: fs(9), fill: c.ink2 }); x += w + gap; });
      MD.forEach(function (m, j) { el('rect', { x: W - 80, y: 30 + j * 18, width: 10, height: 10, fill: OI[j] }, svg); txt(svg, W - 66, 39 + j * 18, m, { anchor: 'start', size: fs(9.5), fill: c.ink2 }); });
      out.innerHTML = (assoc ? 'The columns differ: young people mostly read news on phones, older people on paper. When the horizontal divisions do not line up across columns, the two variables are <strong>associated</strong>.' : 'If preference did not depend on age, the horizontal divisions would line up across every column, like a brick wall: the variables would be <strong>independent</strong>.') + NOTE + 'A mosaic plot shows a table of counts for two categorical variables. Column widths are proportional to the size of each group (here, age), and the heights within each column to the shares of the second variable, so every tile’s area is proportional to its count. Mosaics extend to three or four variables by further splitting, and can be shaded by how far each tile departs from independence. The survey is synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: waterfall chart
     ----------------------------------------------------------------------- */
  FIG['fig-waterfall'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var cogs = 210;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'wf-c', label: 'Cost of goods (thousands)', min: 100, max: 400, step: 10, value: cogs, onChange: function (x) { cogs = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var S = [['Revenue', 500], ['Cost of goods', -cogs], ['Salaries', -120], ['Rent', -40], ['Marketing', -35], ['Other income', 15], ['Tax', -30]], run = 0, lv = [];
      S.forEach(function (s) { lv.push([run, run + s[1]]); run += s[1]; });
      var c = C(), A = newSVG(svgWrap, container, 300, 'A waterfall chart from revenue to profit'), W = A.W, svg = A.svg, fs = A.fs, lo = Math.min(0, run) - 20;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 14, B: 240, xl: 0, xh: 8, yl: lo, yh: 540, xticks: [], yticks: niceTicks(lo, 540, 5), ylab: 'thousands' });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(8), y2: P.Y(0), stroke: c.muted }, svg);
      S.forEach(function (s, i) { var a = lv[i][0], b = lv[i][1], col = i === 0 ? OI[0] : s[1] > 0 ? OI[2] : OI[3], bw = (P.X(1) - P.X(0)) * 0.7, x = P.X(i + 0.15); el('rect', { x: x, y: P.Y(Math.max(a, b)), width: bw, height: Math.abs(P.Y(a) - P.Y(b)), fill: col }, svg); if (i < 7) el('line', { x1: x + bw, y1: P.Y(b), x2: P.X(i + 1.15), y2: P.Y(b), stroke: c.muted, 'stroke-dasharray': '2 2' }, svg); txt(svg, x + bw / 2, P.Y(Math.max(a, b)) - 4, (i && s[1] > 0 ? '+' : '') + s[1], { size: fs(8.5), fill: c.ink2 }); var t = txt(svg, x + bw / 2, 252, s[0], { size: fs(8.5), fill: c.ink2, anchor: 'end' }); t.setAttribute('transform', 'rotate(-30 ' + (x + bw / 2) + ' 252)'); });
      var bw2 = (P.X(1) - P.X(0)) * 0.7, xp = P.X(7.15); el('rect', { x: xp, y: P.Y(Math.max(0, run)), width: bw2, height: Math.abs(P.Y(0) - P.Y(run)), fill: run >= 0 ? '#555' : RED }, svg); txt(svg, xp + bw2 / 2, P.Y(Math.max(0, run)) - 4, String(run), { size: fs(9), fill: c.ink, weight: 700 }); var tp = txt(svg, xp + bw2 / 2, 252, run >= 0 ? 'Profit' : 'Loss', { size: fs(8.5), fill: c.ink2, anchor: 'end' }); tp.setAttribute('transform', 'rotate(-30 ' + (xp + bw2 / 2) + ' 252)');
      out.innerHTML = (run >= 0 ? 'Profit: <strong>' + run + '</strong> thousand.' : 'A <strong>loss of ' + (-run) + '</strong> thousand: the running total ends below zero.') + NOTE + 'A waterfall (or bridge) chart starts from one total and shows how each positive or negative step moves it, ending at another total. Each floating bar begins where the previous one ended, with thin connectors to guide the eye. It answers “what explains the difference between these two numbers?”, which is why it is popular in finance for explaining changes in profit, cash or budgets. The figures are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Sankey diagram
     ----------------------------------------------------------------------- */
  FIG['fig-sankey'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NODES = [['Coal', 0], ['Gas', 0], ['Renewables', 0], ['Nuclear', 0], ['Electricity', 1], ['Heating', 1], ['Homes', 2], ['Industry', 2], ['Transport', 2], ['Losses', 2]];
    var LINKS = [[0, 4, 20], [1, 4, 25], [1, 5, 20], [2, 4, 30], [3, 4, 15], [4, 6, 30], [4, 7, 25], [4, 8, 5], [4, 9, 30], [5, 6, 14], [5, 7, 4], [5, 9, 2]], hi = -1;
    var controls = div('fig-controls', container);
    choice(controls, 'Highlight', ['None', 'Gas', 'Electricity', 'Homes', 'Losses'], 0, function (i) { hi = [-1, 1, 4, 6, 9][i]; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 320, 'A Sankey diagram of energy flowing from sources through electricity and heating to uses and losses'), W = A.W, svg = A.svg, fs = A.fs;
      var val = NODES.map(function (_, i) { var inn = 0, outv = 0; LINKS.forEach(function (l) { if (l[1] === i) inn += l[2]; if (l[0] === i) outv += l[2]; }); return Math.max(inn, outv); });
      var colX = [W < 560 ? 70 : 110, W / 2 - 8, W - (W < 560 ? 80 : 120)], total = 110, gap = 14, H = 300, sc = (H - 20 - 3 * gap) / total, pos = [], yc = [10, 10, 10];
      var colTot = [0, 1, 2].map(function (k) { return NODES.reduce(function (s, n, i) { return s + (n[1] === k ? val[i] : 0); }, 0); });
      NODES.forEach(function (n, i) { var k = n[1]; if (pos.filter(function (p) { return p && p.k === k; }).length === 0) yc[k] = 10 + (H - 20 - (colTot[k] * sc + (NODES.filter(function (m) { return m[1] === k; }).length - 1) * gap)) / 2; pos[i] = { k: k, x: colX[k], y: yc[k], h: val[i] * sc, outY: yc[k], inY: yc[k] }; yc[k] += val[i] * sc + gap; });
      LINKS.forEach(function (l) { var s = pos[l[0]], t = pos[l[1]], w = l[2] * sc, x0 = s.x + 12, x1 = t.x, y0 = s.outY + w / 2, y1 = t.inY + w / 2, xm = (x0 + x1) / 2, on = hi < 0 || l[0] === hi || l[1] === hi; el('path', { d: 'M' + x0 + ' ' + y0 + 'C' + xm + ' ' + y0 + ' ' + xm + ' ' + y1 + ' ' + x1 + ' ' + y1, fill: 'none', stroke: on ? (hi < 0 ? c.muted : PC) : c.border, 'stroke-width': Math.max(1, w), 'stroke-opacity': on ? 0.45 : 0.25 }, svg); s.outY += w; t.inY += w; });
      NODES.forEach(function (n, i) { var p = pos[i]; el('rect', { x: p.x, y: p.y, width: 12, height: p.h, fill: OI[i % 8] }, svg); var t = txt(svg, n[1] === 2 ? p.x + 16 : p.x - 4, p.y + p.h / 2 + 4, n[0] + ' ' + val[i], { anchor: n[1] === 2 ? 'start' : 'end', size: fs(9), fill: c.ink, weight: n[1] === 1 ? 700 : 400 }); t.setAttribute('stroke', c.surface); t.setAttribute('stroke-width', '3'); t.setAttribute('paint-order', 'stroke'); });
      var lossShare = Math.round(100 * 32 / 110);
      out.innerHTML = (hi < 0 ? 'Energy flows from left to right; every band’s width is proportional to the amount. About <strong>' + lossShare + '%</strong> of the energy ends as losses, mostly in generating electricity.' : '<strong>' + NODES[hi][0] + '</strong>: ' + val[hi] + ' units in total. Its incoming and outgoing flows are highlighted.') + NOTE + 'A Sankey diagram shows how quantities flow and split between stages, with the width of each band proportional to the flow. At every node, what comes in must equal what goes out (except at the start and end), so the diagram is also a check that the accounts balance. The figures are synthetic, loosely shaped like national energy-flow charts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p10'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'In a treemap, what does the area of each rectangle show?', options: ['Its rank', 'Its share of the total', 'Its growth', 'Nothing'], answer: 1, explanation: 'Nested rectangles show the hierarchy.' },
      { question: 'Why are squarified treemaps preferred to slice-and-dice layouts?', options: ['They are faster', 'Near-square rectangles are easier to compare than long thin slivers', 'They use more colours', 'They show time'], answer: 1, explanation: 'Bruls, Huizing and van Wijk, 2000.' },
      { question: 'Who invented the treemap, and to look at what?', options: ['Sankey, steam engines', 'Ben Shneiderman, files on a hard disk', 'Playfair, trade', 'Tukey, outliers'], answer: 1, explanation: 'In 1992.' },
      { question: 'A sunburst shows a hierarchy as…', options: ['Bars', 'Concentric rings divided by angle', 'Lines', 'Dots'], answer: 1, explanation: 'Inner rings are higher levels.' },
      { question: 'In a mosaic plot, if the horizontal divisions line up across all columns, the two variables are…', options: ['Associated', 'Independent', 'Missing', 'Correlated perfectly'], answer: 1, explanation: 'Like a brick wall.' },
      { question: 'What does the width of a column in a mosaic plot show?', options: ['Nothing', 'The size of that group', 'The p-value', 'The mean'], answer: 1, explanation: 'Tile areas are proportional to counts.' },
      { question: 'What question does a waterfall chart answer?', options: ['How is something distributed?', 'Which steps explain the change from one total to another?', 'Are two variables correlated?', 'What is the trend?'], answer: 1, explanation: 'Popular for profit bridges.' },
      { question: 'In a Sankey diagram, the width of a band is proportional to…', options: ['Time', 'The quantity flowing', 'Distance', 'Importance chosen by the designer'], answer: 1, explanation: 'Sankey, 1898.' },
      { question: 'At a middle node of a Sankey diagram, inflow should…', options: ['Exceed outflow', 'Equal outflow', 'Be zero', 'Be random'], answer: 1, explanation: 'Unless there are gains or losses not shown.' },
      { question: 'Why are treemaps poor for precise comparisons?', options: ['They use area, a weak visual encoding', 'They cannot show many items', 'They need 3D', 'They hide totals'], answer: 0, explanation: 'Good for spotting the biggest items.' }
    ]);
  };
})();
