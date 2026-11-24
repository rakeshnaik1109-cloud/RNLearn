/* ==========================================================================
   RNLearn — Bars, Dots and Pies (Reading the Picture, Part 2)
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
    { name: 'Inventions', color: '#b45309' },
    { name: 'Quality and business', color: '#7c3aed' },
    { name: 'Evidence about perception', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1786', icon: '📊', era: 0, sec: 3, title: 'The first bar chart', text: 'William Playfair draws a bar chart of Scotland’s trade with 17 countries, because he lacked the year-by-year data for a line chart.' },
    { year: '1801', icon: '🥧', era: 0, sec: 8, title: 'The first pie chart', text: 'Playfair’s Statistical Breviary shows the territories of European states as circles divided into slices.' },
    { year: '1858', icon: '🌹', era: 0, sec: 8, title: 'Polar area diagrams', text: 'Florence Nightingale divides circles into equal-angle wedges whose areas show deaths in the Crimean War.' },
    { year: '1896', icon: '⚖️', era: 1, sec: 7, title: 'Pareto’s observation', text: 'Vilfredo Pareto notes that a small fraction of people hold most of the land and wealth.' },
    { year: '1951', icon: '🏭', era: 1, sec: 7, title: 'The Pareto principle', text: 'Joseph Juran’s Quality Control Handbook popularises “the vital few and the trivial many”, and the Pareto chart becomes a standard quality tool.' },
    { year: '1984', icon: '⚫', era: 2, sec: 5, title: 'The dot chart', text: 'William Cleveland recommends dot charts as an alternative to bar charts, especially for many categories.' },
    { year: '1991', icon: '🔬', era: 2, sec: 12, title: 'Pies tested', text: 'Ian Spence and Stephan Lewandowsky find that pie charts are about as accurate as bars for judging proportions of a whole.' },
    { year: '2014', icon: '↔️', era: 2, sec: 6, title: 'Diverging bars', text: 'Richard Heiberger and Naomi Robbins set out the design of diverging stacked bar charts for survey (Likert) data.' }
  ];
  FIG['fig-p2-timeline'] = function (figEl) {
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
  function hbarsSVG(svg, c, fs, x0, x1, y0, names, vals, xmax, col, opt) {
    opt = opt || {};
    var n = names.length, rh = opt.rh || 24, lw = opt.lw || 80;
    var X = function (v) { return x0 + lw + (v - (opt.base || 0)) / (xmax - (opt.base || 0)) * (x1 - x0 - lw - 30); };
    names.forEach(function (nm, i) {
      var y = y0 + i * rh, colr = typeof col === 'function' ? col(i) : col;
      txt(svg, x0 + lw - 6, y + rh / 2 + 4, nm, { anchor: 'end', size: fs(9.5), fill: c.ink2 });
      if (opt.mode === 'dot') { el('line', { x1: X(opt.base || 0), y1: y + rh / 2, x2: x1 - 30, y2: y + rh / 2, stroke: c.border, 'stroke-width': 0.6 }, svg); el('circle', { cx: X(vals[i]), cy: y + rh / 2, r: 5, fill: colr }, svg); }
      else if (opt.mode === 'lolli') { el('line', { x1: X(opt.base || 0), y1: y + rh / 2, x2: X(vals[i]), y2: y + rh / 2, stroke: c.muted, 'stroke-width': 1.5 }, svg); el('circle', { cx: X(vals[i]), cy: y + rh / 2, r: 5, fill: colr }, svg); }
      else el('rect', { x: X(opt.base || 0), y: y + 3, width: Math.max(0, X(vals[i]) - X(opt.base || 0)), height: rh - 6, fill: colr }, svg);
      if (opt.labels) txt(svg, X(vals[i]) + 6, y + rh / 2 + 4, String(vals[i]), { anchor: 'start', size: fs(9), fill: c.muted });
    });
    return X;
  }

  /* -----------------------------------------------------------------------
     Figure: sorting and orienting a bar chart
     ----------------------------------------------------------------------- */
  FIG['fig-bar-sort'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NAMES = ['Mango', 'Apple', 'Pear', 'Banana', 'Grape', 'Cherry', 'Orange', 'Kiwi', 'Plum', 'Peach'], VALS = [51, 42, 12, 67, 25, 18, 39, 21, 15, 33];
    var ord = 0, horiz = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Order', ['As collected', 'Alphabetical', 'By value'], ord, function (i) { ord = i; draw(); });
    choice(controls, 'Bars', ['Vertical', 'Horizontal'], horiz, function (i) { horiz = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var idx = NAMES.map(function (_, i) { return i; });
      if (ord === 1) idx.sort(function (a, b) { return NAMES[a] < NAMES[b] ? -1 : 1; });
      if (ord === 2) idx.sort(function (a, b) { return VALS[b] - VALS[a]; });
      var names = idx.map(function (i) { return NAMES[i]; }), vals = idx.map(function (i) { return VALS[i]; });
      var c = C(), A = newSVG(svgWrap, container, 300, 'Bar chart of votes for ten fruits'), W = A.W, svg = A.svg, fs = A.fs;
      if (horiz) hbarsSVG(svg, c, fs, 10, W - 10, 20, names, vals, 70, OI[0], { rh: 26, lw: 70, labels: true });
      else {
        var P = plotAxes(svg, c, fs, { L: 44, R: W - 10, T: 20, B: 240, xl: 0, xh: 10, yl: 0, yh: 70, xticks: [], yticks: [0, 20, 40, 60], ylab: 'votes' });
        names.forEach(function (nm, i) { var x = P.X(i + 0.15), w = P.X(0.7) - P.X(0); el('rect', { x: x, y: P.Y(vals[i]), width: w, height: P.Y(0) - P.Y(vals[i]), fill: OI[0] }, svg); var t = txt(svg, x + w / 2, 252, nm, { size: fs(9), fill: c.ink2, anchor: W < 560 ? 'end' : 'middle' }); if (W < 560) t.setAttribute('transform', 'rotate(-45 ' + (x + w / 2) + ' 252)'); });
      }
      out.innerHTML = (ord === 2 ? '<strong>Sorted by value</strong>, the ranking reads itself: Banana, then Mango, then Apple.' : ord === 1 ? 'Alphabetical order helps you <em>find</em> a category, but not compare them.' : 'In the order collected, you have to hunt to find the largest or the fourth largest.') + ' ' + (horiz ? 'Horizontal bars leave room for long labels.' : 'Vertical bars suit a few categories with short names.') + NOTE + 'Sort categories by value unless they have a natural order of their own (months, age groups, ratings), in which case keep that order. Use horizontal bars when labels are long or there are many categories.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: grouped, stacked and 100% stacked bars
     ----------------------------------------------------------------------- */
  FIG['fig-stacked'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Q = ['Q1', 'Q2', 'Q3', 'Q4'], REG = ['North', 'South', 'West'], D = [[20, 24, 30, 28], [15, 18, 16, 22], [10, 14, 19, 25]], mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Layout', ['Grouped', 'Stacked', '100% stacked'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Sales of three regions over four quarters as grouped, stacked or 100% stacked bars'), W = A.W, svg = A.svg, fs = A.fs;
      var tot = Q.map(function (_, j) { return D[0][j] + D[1][j] + D[2][j]; }), ymax = mode === 0 ? 35 : mode === 1 ? 80 : 100;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 16, T: 30, B: 245, xl: 0, xh: 4, yl: 0, yh: ymax, xticks: [], yticks: niceTicks(0, ymax, 4), ylab: mode === 2 ? 'share (%)' : 'sales' });
      Q.forEach(function (q, j) {
        txt(svg, P.X(j + 0.5), 262, q, { size: fs(10), fill: c.ink2 });
        var acc = 0;
        REG.forEach(function (r, i) {
          var v = D[i][j], bw = P.X(1) - P.X(0);
          if (mode === 0) { var w = bw * 0.24, x = P.X(j) + bw * 0.14 + i * w; el('rect', { x: x, y: P.Y(v), width: w - 2, height: P.Y(0) - P.Y(v), fill: OI[i] }, svg); }
          else { var vv = mode === 2 ? 100 * v / tot[j] : v; el('rect', { x: P.X(j) + bw * 0.2, y: P.Y(acc + vv), width: bw * 0.6, height: P.Y(acc) - P.Y(acc + vv), fill: OI[i], stroke: c.surface, 'stroke-width': 1 }, svg); acc += vv; }
        });
      });
      REG.forEach(function (r, i) { el('rect', { x: 60 + i * 80, y: 10, width: 12, height: 12, fill: OI[i] }, svg); txt(svg, 76 + i * 80, 20, r, { anchor: 'start', size: fs(9.5), fill: c.ink2 }); });
      var msg = ['Grouped bars make it easy to compare <strong>regions within a quarter</strong>: North leads in every quarter, and West overtakes South in Q3.', 'Stacked bars show the <strong>total</strong>, which grows every quarter, and North’s share at the bottom. But the South and West segments do not share a baseline, so their trends are hard to judge.', '100% stacked bars compare <strong>shares</strong>: West’s share rises from 22% to 33% while the total is hidden. Use them when the proportion matters, not the size.'][mode];
      out.innerHTML = msg + NOTE + 'Only the bottom segment of a stacked bar, and any segment of a grouped bar, sits on a common baseline. Choose the layout according to the comparison that matters most, and keep the number of groups small (about five at most).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: bars, dots and lollipops
     ----------------------------------------------------------------------- */
  FIG['fig-dot-lollipop'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(7), NAMES = [], VALS = []; for (var i = 0; i < 12; i++) { NAMES.push('Region ' + 'ABCDEFGHIJKL'[i]); VALS.push(Math.round((71 + 13 * r()) * 10) / 10); }
    var idx = NAMES.map(function (_, i) { return i; }).sort(function (a, b) { return VALS[b] - VALS[a]; }), names = idx.map(function (i) { return NAMES[i]; }), vals = idx.map(function (i) { return VALS[i]; });
    var mode = 2;
    var controls = div('fig-controls', container);
    choice(controls, 'Chart', ['Bars from zero', 'Bars from 70 (wrong)', 'Dot plot', 'Lollipop'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 360, 'Life expectancy in twelve regions shown as bars, dots or lollipops'), W = A.W, svg = A.svg, fs = A.fs;
      var base = mode === 0 ? 0 : 70, X = hbarsSVG(svg, c, fs, 10, W - 10, 18, names, vals, 85, mode === 1 ? RED : OI[0], { rh: 25, lw: 74, base: base, mode: mode === 2 ? 'dot' : mode === 3 ? 'lolli' : 'bar' });
      (mode === 0 ? [0, 20, 40, 60, 80] : [70, 75, 80, 85]).forEach(function (t) { var x = X(t); el('line', { x1: x, y1: 14, x2: x, y2: 322, stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, x, 338, String(t), { size: fs(9), fill: c.muted }); });
      txt(svg, (84 + W) / 2, 354, 'life expectancy (years)', { size: fs(9.5), fill: c.muted });
      var msg = ['Bars from zero are honest, but the differences of a few years almost vanish: every bar looks about the same.', 'Bars starting at 70 make Region ' + names[0].slice(-1) + ' look about ' + fmt((vals[0] - 70) / (vals[11] - 70), 0) + ' times “longer” than Region ' + names[11].slice(-1) + ', but the values differ by only ' + fmt(100 * (vals[0] / vals[11] - 1), 0) + '%. A bar’s length must mean something.', 'A dot plot uses position, not length, so the axis can zoom in on 70–85 years honestly. The differences are clear and nothing is distorted.', 'A lollipop is a thin bar with a dot at the end: less ink than a bar. With a baseline of 70, its stem still suggests a length, so label the axis clearly.'][mode];
      out.innerHTML = msg + NOTE + 'William Cleveland recommended dot charts for this kind of data: they are accurate, uncluttered and work well with many categories. Bars are best when the quantity starts naturally at zero, such as counts and totals.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: diverging stacked bars for survey (Likert) data
     ----------------------------------------------------------------------- */
  FIG['fig-likert'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var QS = ['Easy to use', 'Good value', 'Fast delivery', 'Helpful staff', 'Would recommend'], PCT = [[5, 10, 15, 45, 25], [15, 25, 20, 30, 10], [10, 15, 30, 30, 15], [3, 7, 10, 40, 40], [8, 12, 20, 35, 25]];
    var COL = ['#B2182B', '#EF8A62', '#BBBBBB', '#67A9CF', '#2166AC'], LAB = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'], mode = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Layout', ['100% stacked', 'Diverging (centred on neutral)'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Survey responses to five statements as stacked or diverging bars'), W = A.W, svg = A.svg, fs = A.fs, lw = W < 560 ? 92 : 120;
      var x0 = lw + 10, x1 = W - 14, lo = mode ? -60 : 0, hi = mode ? 90 : 100, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
      QS.forEach(function (q, i) {
        var y = 20 + i * 36, left = mode ? -(PCT[i][0] + PCT[i][1] + PCT[i][2] / 2) : 0;
        txt(svg, x0 - 6, y + 17, q, { anchor: 'end', size: fs(9.5), fill: c.ink2 });
        PCT[i].forEach(function (p, j) { el('rect', { x: X(left), y: y, width: X(left + p) - X(left), height: 26, fill: COL[j], stroke: c.surface, 'stroke-width': 1 }, svg); left += p; });
      });
      if (mode) el('line', { x1: X(0), y1: 14, x2: X(0), y2: 206, stroke: c.ink, 'stroke-width': 1.2 }, svg);
      (mode ? [-50, 0, 50] : [0, 50, 100]).forEach(function (t) { txt(svg, X(t), 222, (mode ? Math.abs(t) : t) + '%', { size: fs(9), fill: c.muted }); });
      LAB.forEach(function (l, j) { var xx = 10 + j * (W - 20) / 5; el('rect', { x: xx, y: 238, width: 10, height: 10, fill: COL[j] }, svg); txt(svg, xx + 14, 247, W < 560 ? ['SD', 'D', 'N', 'A', 'SA'][j] : l, { anchor: 'start', size: fs(8.5), fill: c.ink2 }); });
      out.innerHTML = (mode ? 'Centred on the middle of “Neutral”, agreement extends to the right and disagreement to the left. It is now obvious that <strong>Helpful staff</strong> is the most positive and <strong>Good value</strong> the most negative.' : 'In a 100% stacked bar, only “Strongly disagree” and “Strongly agree” sit on a common baseline. Comparing total agreement across statements means judging lengths that start at different places.') + NOTE + 'Survey answers on an agree–disagree scale (a Likert scale) are ordered, with a natural middle. Diverging stacked bars, recommended by Heiberger and Robbins, use that structure. Some designers move “Neutral” to a separate column so that it does not hide the balance of opinion.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Pareto chart
     ----------------------------------------------------------------------- */
  FIG['fig-pareto'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CAUSES = ['Scratches', 'Misalignment', 'Loose screws', 'Paint drips', 'Cracks', 'Wrong label', 'Other'], CNT = [142, 96, 51, 24, 15, 9, 13], thr = 80;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pa-t', label: 'Target share of all defects (%)', min: 50, max: 95, step: 5, value: thr, onChange: function (x) { thr = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Pareto chart: defect counts sorted from largest to smallest, with a cumulative percentage line'), W = A.W, svg = A.svg, fs = A.fs;
      var tot = CNT.reduce(function (a, b) { return a + b; }, 0), cum = 0, cums = CNT.map(function (v) { cum += v; return 100 * cum / tot; });
      var need = cums.findIndex(function (v) { return v >= thr - 1e-9; }) + 1;
      var P = plotAxes(svg, c, fs, { L: 46, R: W - 46, T: 20, B: 230, xl: 0, xh: 7, yl: 0, yh: 160, xticks: [], yticks: [0, 50, 100, 150], ylab: 'defects' });
      var Y2 = function (p) { return 230 - p / 100 * 190; };
      [0, 50, 100].forEach(function (p) { txt(svg, W - 40, Y2(p) + 4, p + '%', { anchor: 'start', size: fs(9), fill: RED }); });
      CAUSES.forEach(function (cs, i) { var x = P.X(i + 0.12), w = P.X(0.76) - P.X(0); el('rect', { x: x, y: P.Y(CNT[i]), width: w, height: P.Y(0) - P.Y(CNT[i]), fill: i < need ? OI[0] : c.border }, svg); var t = txt(svg, x + w / 2, 244, cs, { size: fs(8.5), fill: c.ink2, anchor: 'end' }); t.setAttribute('transform', 'rotate(-35 ' + (x + w / 2) + ' 244)'); });
      el('line', { x1: P.X(0), y1: Y2(thr), x2: P.X(7), y2: Y2(thr), stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      var d = ''; cums.forEach(function (v, i) { d += (i ? 'L' : 'M') + P.X(i + 0.5).toFixed(1) + ' ' + Y2(v).toFixed(1); el('circle', { cx: P.X(i + 0.5), cy: Y2(v), r: 3.5, fill: RED }, svg); });
      el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg);
      out.innerHTML = 'To deal with at least <strong>' + thr + '%</strong> of defects, fix the first <strong>' + need + '</strong> of ' + CAUSES.length + ' causes (' + CAUSES.slice(0, need).join(', ') + '), which together account for ' + fmt(cums[need - 1], 0) + '%.' + NOTE + 'A Pareto chart sorts categories from largest to smallest and adds a line for the running total as a percentage. It answers the question “where should we start?” The rule of thumb that about 80% of effects come from 20% of causes, the Pareto principle, is a tendency, not a law. A catch-all “Other” bar conventionally goes at the end, whatever its size.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: pie versus bar
     ----------------------------------------------------------------------- */
  FIG['fig-pie-vs-bar'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var seed = 1, mode = 0, shown = false, vals;
    var controls = div('fig-controls', container);
    choice(controls, 'Chart', ['Pie', 'Donut', 'Bar'], mode, function (i) { mode = i; draw(); });
    var row = group(controls, 'Puzzle'); var bR = btn('Reveal the values', row), bN = btn('New data', row);
    bR.addEventListener('click', function () { shown = true; draw(); }); bN.addEventListener('click', function () { seed++; shown = false; make(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function make() { var r = rngSeed(seed * 31), v = [0, 0, 0, 0, 0].map(function () { return 17 + r() * 6; }), s = v.reduce(function (a, b) { return a + b; }, 0); vals = v.map(function (x) { return 100 * x / s; }); }
    make();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Five similar shares shown as a pie, donut or bar chart'), W = A.W, svg = A.svg, fs = A.fs, L = 'ABCDE';
      if (mode < 2) {
        var cx = W / 2, cy = 128, R = 100, a0 = -Math.PI / 2;
        vals.forEach(function (v, i) { var a1 = a0 + 2 * Math.PI * v / 100, ri = mode ? 55 : 0, p = function (rr, a) { return (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); };
          el('path', { d: 'M' + p(R, a0) + 'A' + R + ' ' + R + ' 0 0 1 ' + p(R, a1) + (ri ? 'L' + p(ri, a1) + 'A' + ri + ' ' + ri + ' 0 0 0 ' + p(ri, a0) + 'Z' : 'L' + cx + ' ' + cy + 'Z'), fill: OI[i], stroke: c.surface, 'stroke-width': 2 }, svg);
          var am = (a0 + a1) / 2; txt(svg, cx + 118 * Math.cos(am), cy + 118 * Math.sin(am) + 4, L[i] + (shown ? ' ' + fmt(v, 1) + '%' : ''), { size: fs(10), fill: c.ink2, weight: 700 }); a0 = a1; });
      } else {
        var P = plotAxes(svg, c, fs, { L: 50, R: Math.min(W - 16, 460), T: 16, B: 220, xl: 0, xh: 5, yl: 0, yh: 25, xticks: [], yticks: [0, 5, 10, 15, 20, 25], ylab: 'share (%)' });
        vals.forEach(function (v, i) { var x = P.X(i + 0.15), w = P.X(0.7) - P.X(0); el('rect', { x: x, y: P.Y(v), width: w, height: P.Y(0) - P.Y(v), fill: OI[i] }, svg); txt(svg, x + w / 2, 236, L[i], { size: fs(10), fill: c.ink2, weight: 700 }); if (shown) txt(svg, x + w / 2, P.Y(v) - 5, fmt(v, 1), { size: fs(9), fill: c.ink2 }); });
      }
      var rank = vals.map(function (v, i) { return [v, L[i]]; }).sort(function (a, b) { return b[0] - a[0]; }).map(function (x) { return x[1]; }).join(' > ');
      out.innerHTML = (shown ? 'Ranking: <strong>' + rank + '</strong>.' : 'Can you rank the five slices from largest to smallest? Decide, then reveal the values, or switch to the bar chart.') + NOTE + 'With similar values, pies and donuts make ranking nearly impossible, because angles and areas are hard to compare; on a bar chart the answer is instant. Pie charts work best for showing one part against the whole, with two or three slices, when the exact values matter less than the rough proportion. If you use one, start at 12 o’clock, order the slices by size and label them directly.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'When should the categories of a bar chart be sorted by value?', options: ['Always', 'When they have no natural order of their own', 'Never', 'Only for pie charts'], answer: 1, explanation: 'Keep natural orders such as months or ratings.' },
      { question: 'When are horizontal bars a good choice?', options: ['When labels are long or there are many categories', 'Never', 'For time series', 'When values are negative'], answer: 0, explanation: 'Labels stay readable.' },
      { question: 'In a stacked bar chart, which segment is easiest to compare across bars?', options: ['The top one', 'The middle one', 'The bottom one, which sits on the baseline', 'All are equally easy'], answer: 2, explanation: 'The others start at different heights.' },
      { question: 'What does a 100% stacked bar chart hide?', options: ['The shares', 'The totals', 'The categories', 'The colours'], answer: 1, explanation: 'Every bar is the same height.' },
      { question: 'Why can a dot plot use an axis that does not start at zero?', options: ['Dots are smaller', 'It encodes values by position, not by length', 'It is never allowed', 'Because of colour'], answer: 1, explanation: 'Bars encode length, so they must start at zero.' },
      { question: 'What is a diverging stacked bar chart used for?', options: ['Time series', 'Survey answers on an ordered scale with a neutral middle', 'Maps', 'Correlations'], answer: 1, explanation: 'Agreement to one side, disagreement to the other.' },
      { question: 'What does the line on a Pareto chart show?', options: ['The average', 'The cumulative percentage of the total', 'A trend over time', 'The error'], answer: 1, explanation: 'It shows how quickly the top categories add up.' },
      { question: 'When is a pie chart reasonable?', options: ['To compare many similar values', 'To show a part of a whole with two or three slices', 'To show change over time', 'Never'], answer: 1, explanation: 'Avoid pies for ranking similar values.' },
      { question: 'Which do people judge more accurately?', options: ['Angles in a pie', 'Lengths of bars on a common baseline', 'Areas of circles', 'Colour shades'], answer: 1, explanation: 'Cleveland and McGill’s ranking.' },
      { question: 'Who drew the first pie chart?', options: ['Florence Nightingale', 'William Playfair', 'John Tukey', 'Vilfredo Pareto'], answer: 1, explanation: 'In 1801.' }
    ]);
  };
})();
