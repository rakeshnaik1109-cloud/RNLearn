/* ==========================================================================
   RNLearn — Heatmaps and Many Variables (Reading the Picture, Part 8)
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
    { name: 'Early inventions', color: '#b45309' },
    { name: 'New ideas', color: '#7c3aed' },
    { name: 'Data-rich science', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1873', icon: '🟥', era: 0, sec: 12, title: 'Loua’s shaded table', text: 'Toussaint Loua shades a table of social statistics for the districts of Paris: an ancestor of the heatmap.' },
    { year: '1877', icon: '🕸️', era: 0, sec: 9, title: 'Star charts', text: 'Georg von Mayr draws star-shaped charts with one ray per variable, the ancestors of radar charts.' },
    { year: '1885', icon: '║', era: 0, sec: 8, title: 'Parallel axes', text: 'Maurice d’Ocagne describes parallel coordinates as a calculating tool (nomography).' },
    { year: '1973', icon: '🙂', era: 1, sec: 12, title: 'Chernoff faces', text: 'Herman Chernoff represents each data point as a cartoon face whose features encode the variables.' },
    { year: '1985', icon: '📈', era: 1, sec: 8, title: 'Inselberg', text: 'Alfred Inselberg develops parallel coordinates as a method for visualising many dimensions.' },
    { year: '1998', icon: '🧬', era: 2, sec: 6, title: 'Clustered heatmaps', text: 'Michael Eisen and colleagues popularise clustered heatmaps for gene expression data.' },
    { year: '2015', icon: '🎨', era: 2, sec: 4, title: 'Viridis', text: 'Stéfan van der Walt and Nathaniel Smith design the viridis colour map, soon matplotlib’s default.' }
  ];
  FIG['fig-p8-timeline'] = function (figEl) {
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
  var CMAPS = {
    viridis: [[68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]],
    jet: [[0, 0, 128], [0, 0, 255], [0, 128, 255], [0, 255, 255], [128, 255, 128], [255, 255, 0], [255, 128, 0], [255, 0, 0], [128, 0, 0]],
    rdbu: [[5, 48, 97], [33, 102, 172], [67, 147, 195], [146, 197, 222], [209, 229, 240], [247, 247, 247], [253, 219, 199], [244, 165, 130], [214, 96, 77], [178, 24, 43], [103, 0, 31]],
    grey: [[250, 250, 250], [20, 20, 20]]
  };
  function cmap(name, t) { var s = CMAPS[name]; t = Math.max(0, Math.min(1, t)); var x = t * (s.length - 1), i = Math.min(s.length - 2, Math.floor(x)), f = x - i, a = s[i], b = s[i + 1]; return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + f * (b[k] - a[k])); }).join(',') + ')'; }
  function colorbar(svg, x, y, w, h, name, lo, hi, fs, c, lab) { for (var i = 0; i < 40; i++) el('rect', { x: x + i * w / 40, y: y, width: w / 40 + 0.5, height: h, fill: cmap(name, i / 39) }, svg); txt(svg, x, y + h + 12, fmt(lo, 0), { anchor: 'start', size: fs(9), fill: c.muted }); txt(svg, x + w, y + h + 12, fmt(hi, 0), { anchor: 'end', size: fs(9), fill: c.muted }); if (lab) txt(svg, x + w / 2, y + h + 12, lab, { size: fs(9), fill: c.muted }); }
  function corrMat(cols) { var k = cols.length, n = cols[0].length, R = []; for (var i = 0; i < k; i++) { R.push([]); for (var j = 0; j < k; j++) R[i].push(linfit(cols[i], cols[j]).r); } return R; }

  /* -----------------------------------------------------------------------
     Figure: a heatmap and its colour scale
     ----------------------------------------------------------------------- */
  FIG['fig-heatmap-colors'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], r = rngSeed(0), D = [];
    for (var d = 0; d < 7; d++) { D.push([]); for (var h = 0; h < 24; h++) D[d].push((d < 5 ? 30 + 60 * Math.exp(-Math.pow((h - 9) / 2, 2)) + 80 * Math.exp(-Math.pow((h - 20) / 2.5, 2)) : 25 + 90 * Math.exp(-Math.pow((h - 12) / 3.5, 2))) + 4 * rnorm(r)); }
    var k = 0, NM = ['viridis', 'jet', 'rdbu', 'grey'];
    var controls = div('fig-controls', container);
    choice(controls, 'Colour map', ['Sequential (viridis)', 'Rainbow (jet)', 'Diverging (misused)', 'Greyscale'], k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 275, 'A heatmap of website traffic by day of week and hour of day'), W = A.W, svg = A.svg, fs = A.fs, L = 40, cw = (W - L - 10) / 24, ch = 24, lo = 15, hi = 120;
      D.forEach(function (row, d) { txt(svg, L - 6, 44 + d * ch + 16, DAYS[d], { anchor: 'end', size: fs(9.5), fill: c.ink2 }); row.forEach(function (v, h) { el('rect', { x: L + h * cw, y: 44 + d * ch, width: cw + 0.4, height: ch + 0.4, fill: cmap(NM[k], (v - lo) / (hi - lo)) }, svg); }); });
      [0, 6, 12, 18, 23].forEach(function (h) { txt(svg, L + (h + 0.5) * cw, 44 + 7 * ch + 14, String(h), { size: fs(9), fill: c.muted }); });
      txt(svg, L + 12 * cw, 44 + 7 * ch + 28, 'hour of day', { size: fs(9.5), fill: c.muted });
      colorbar(svg, W - 200, 4, 180, 10, NM[k], lo, hi, fs, c, 'visits per minute');
      out.innerHTML = ['<strong>Viridis</strong> is perceptually uniform: equal steps in the data look like equal steps in colour, it runs from dark to light so it also works in greyscale, and it is readable by most colour-blind people. The weekday morning and evening peaks and the weekend midday peak are easy to see.', 'The <strong>rainbow</strong> (jet) colour map creates bands and sharp boundaries that are not in the data: the jump from cyan to yellow looks like an edge. Its brightest colours are in the middle, so the eye is drawn to middling values. It is hard for colour-blind readers.', 'A <strong>diverging</strong> colour map has a neutral middle and two contrasting ends, meant for data with a meaningful centre, such as changes above and below zero. Used for counts, it makes values near the arbitrary middle look like “nothing” and splits the data into two false camps.', '<strong>Greyscale</strong> is honest and prints well, but few distinct levels can be told apart.'][k] + NOTE + 'A heatmap shows a table of numbers as a grid of coloured cells. Its colour scale is part of the data encoding, so choose it as carefully as an axis: sequential for quantities running from low to high, diverging for values above and below a meaningful centre, and qualitative palettes only for categories.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: ordering a correlation matrix
     ----------------------------------------------------------------------- */
  FIG['fig-corr-order'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = rngSeed(1), n = 300, F1 = [], F2 = [], F3 = [];
    for (var i = 0; i < n; i++) { F1.push(rnorm(r)); F2.push(rnorm(r)); F3.push(rnorm(r)); }
    var mk = function (f, a, s) { return f.map(function (v) { return a * v + s * rnorm(r); }); };
    var V = [['sleep', mk(F1, 1, 0.7)], ['income', mk(F2, 1, 0.7)], ['steps', mk(F3, 1, 0.6)], ['mood', mk(F1, 1, 0.8)], ['commute', mk(F2, -0.6, 1)], ['gym', mk(F3, 1, 0.8)], ['education', mk(F2, 1, 0.8)], ['energy', mk(F1, 1, 0.9)], ['weight', mk(F3, -0.7, 1)]];
    var R0 = corrMat(V.map(function (v) { return v[1]; })), ordered = false, CL = [0, 3, 7, 1, 6, 4, 2, 5, 8];
    var controls = div('fig-controls', container);
    choice(controls, 'Order of variables', ['As collected', 'Grouped by similarity'], 0, function (i) { ordered = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var ord = ordered ? CL : V.map(function (_, i) { return i; }), c = C(), A = newSVG(svgWrap, container, 340, 'A correlation matrix of nine variables'), W = A.W, svg = A.svg, fs = A.fs, L = 72, S = Math.min(W - L - 20, 270) / 9;
      ord.forEach(function (a, i) { txt(svg, L - 5, 10 + i * S + S / 2 + 4, V[a][0], { anchor: 'end', size: fs(9), fill: c.ink2 }); var t = txt(svg, L + i * S + S / 2, 10 + 9 * S + 6, V[a][0], { anchor: 'end', size: fs(9), fill: c.ink2 }); t.setAttribute('transform', 'rotate(-70 ' + (L + i * S + S / 2) + ' ' + (10 + 9 * S + 6) + ')');
        ord.forEach(function (b, j) { var v = R0[a][b]; el('rect', { x: L + j * S, y: 10 + i * S, width: S - 1, height: S - 1, fill: cmap('rdbu', (v + 1) / 2) }, svg); if (S > 24 && a !== b) txt(svg, L + j * S + S / 2, 10 + i * S + S / 2 + 4, fmt(v, 1).replace('-0.0', '0.0'), { size: fs(8), fill: Math.abs(v) > 0.6 ? '#fff' : '#333' }); }); });
      colorbar(svg, L + 9 * S + 16 > W - 30 ? L : L + 9 * S + 16, L + 9 * S + 16 > W - 30 ? 10 + 9 * S + 60 : 20, Math.min(120, W - L - 9 * S - 30) > 60 ? Math.min(120, W - L - 9 * S - 30) : 120, 10, 'rdbu', -1, 1, fs, c, 'r');
      out.innerHTML = (ordered ? 'Reordered so that strongly correlated variables sit together, three blocks appear: <strong>sleep, mood and energy</strong>; <strong>income, education and commute</strong> (commute negatively); and <strong>steps, gym and weight</strong> (weight negatively).' : 'In the order the variables were collected, the matrix looks like a patchwork, and the structure is hard to see.') + NOTE + 'A correlation matrix shows the correlation between every pair of variables as a coloured cell, using a <em>diverging</em> colour map centred on zero: red for positive, blue for negative, white for none. The diagonal is always 1, and the matrix is symmetric, so half of it is redundant. Ordering the variables, by hand or by clustering, often reveals groups. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: normalise before colouring
     ----------------------------------------------------------------------- */
  FIG['fig-normalise'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var P = ['Laptop A', 'Laptop B', 'Laptop C', 'Laptop D', 'Laptop E'], M = ['Price ($)', 'Weight (g)', 'Battery (h)', 'Rating (1–5)'], D = [[900, 1400, 9, 4.1], [1300, 1250, 12, 4.6], [650, 1900, 7, 3.8], [1100, 1100, 15, 4.4], [800, 1600, 10, 4.0]], z = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Colour by', ['Raw numbers', 'Standardised per column (z-scores)'], 1, function (i) { z = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'A table of laptop specifications coloured by raw values or by standardised values'), W = A.W, svg = A.svg, fs = A.fs, L = 76, cw = (W - L - 10) / 4, ch = 30;
      var all = [].concat.apply([], D), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), mu = M.map(function (_, j) { return mean(D.map(function (r) { return r[j]; })); }), sd = M.map(function (_, j) { return sdv(D.map(function (r) { return r[j]; })); });
      M.forEach(function (m, j) { txt(svg, L + j * cw + cw / 2, 16, W < 560 ? m.split(' ')[0] : m, { size: fs(9.5), fill: c.ink2, weight: 700 }); });
      D.forEach(function (row, i) { txt(svg, L - 6, 24 + i * ch + 20, P[i], { anchor: 'end', size: fs(9.5), fill: c.ink2 }); row.forEach(function (v, j) { var t = z ? ((v - mu[j]) / sd[j] + 2) / 4 : (v - lo) / (hi - lo), col = cmap('viridis', t); el('rect', { x: L + j * cw, y: 24 + i * ch, width: cw - 2, height: ch - 2, fill: col }, svg); txt(svg, L + j * cw + cw / 2, 24 + i * ch + 19, String(v), { size: fs(9.5), fill: t > 0.6 ? '#222' : '#fff' }); }); });
      out.innerHTML = (z ? 'Each column is converted to <strong>z-scores</strong> (how many standard deviations above or below the column average), so every column uses the full colour range. Now you can see at a glance that Laptop D is light with a long battery, and Laptop C is cheap but heavy.' : 'Coloured by raw numbers, price and weight (hundreds and thousands) take up the whole colour scale, and battery life and rating (single digits) all look the same dark colour. The colours say more about the units than about the laptops.') + NOTE + 'When columns have different units or scales, standardise them before colouring, as seaborn’s <code>z_score</code> and <code>standard_scale</code> options do. Remember that the colours then show relative positions within each column, not absolute amounts, and that “higher” is not always better (a high price, a heavy weight). The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: parallel coordinates
     ----------------------------------------------------------------------- */
  FIG['fig-parallel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var AX = ['length', 'width', 'height', 'mass', 'speed'], CENT = [[0.25, 0.7, 0.3, 0.2, 0.8], [0.6, 0.4, 0.55, 0.5, 0.5], [0.8, 0.3, 0.8, 0.85, 0.2]], CL = ['Type A', 'Type B', 'Type C'], r = rngSeed(8), D = [];
    for (var i = 0; i < 90; i++) { var g = i % 3; D.push([g, CENT[g].map(function (m) { return Math.max(0, Math.min(1, m + 0.09 * rnorm(r))); })]); }
    var hi = -1, order = 0, ORD = [[0, 1, 2, 3, 4], [1, 4, 0, 2, 3]];
    var controls = div('fig-controls', container);
    choice(controls, 'Highlight', ['All', 'Type A', 'Type B', 'Type C'], 0, function (i) { hi = i - 1; draw(); });
    choice(controls, 'Axis order', ['Original', 'Rearranged'], 0, function (i) { order = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Parallel coordinates: each object is a line crossing five vertical axes'), W = A.W, svg = A.svg, fs = A.fs, L = 30, Rr = W - 30, T = 20, B = 240, ord = ORD[order], X = function (k) { return L + k * (Rr - L) / 4; };
      ord.forEach(function (a, k) { el('line', { x1: X(k), y1: T, x2: X(k), y2: B, stroke: c.ink, 'stroke-width': 1.2 }, svg); txt(svg, X(k), B + 18, AX[a], { size: fs(10), fill: c.ink2, weight: 700 }); });
      D.forEach(function (d) { var on = hi < 0 || d[0] === hi, p = ''; ord.forEach(function (a, k) { p += (k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + (B - d[1][a] * (B - T)).toFixed(1); }); el('path', { d: p, fill: 'none', stroke: on ? OI[d[0]] : c.border, 'stroke-width': on ? 1.3 : 0.8, opacity: on ? 0.7 : 0.6 }, svg); });
      CL.forEach(function (cl, g) { el('rect', { x: L + g * 80, y: 4, width: 10, height: 10, fill: OI[g] }, svg); txt(svg, L + 14 + g * 80, 13, cl, { anchor: 'start', size: fs(9), fill: c.ink2 }); });
      out.innerHTML = (hi < 0 ? 'Each of the 90 objects is a line that crosses every axis at its value (scaled 0–1). Groups show up as bundles of lines with similar paths.' : CL[hi] + ' highlighted: its lines follow a common path, for example ' + (hi === 0 ? 'short, wide and fast.' : hi === 1 ? 'middling on everything.' : 'long, tall, heavy and slow.')) + NOTE + 'Parallel coordinates draw one vertical axis per variable. Lines that run parallel between two neighbouring axes mean a positive relationship; lines that cross in an X mean a negative one. The order of the axes matters, because only neighbouring axes can be compared directly: rearrange them and different relationships appear. With many objects the plot becomes cluttered, so highlighting and transparency are essential. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: radar charts and axis order
     ----------------------------------------------------------------------- */
  FIG['fig-radar-order'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var LAB = ['Speed', 'Battery', 'Camera', 'Screen', 'Value', 'Storage'], A1 = [9, 5, 9, 6, 4, 8], B1 = [6, 9, 6, 8, 7, 5], order = 0, ORD = [[0, 1, 2, 4, 5, 3], [0, 2, 3, 4, 1, 5]];
    var controls = div('fig-controls', container);
    choice(controls, 'Axis order', ['Order 1', 'Order 2'], 0, function (i) { order = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function area(v, o) { var s = 0, n = o.length; for (var k = 0; k < n; k++) s += 0.5 * v[o[k]] * v[o[(k + 1) % n]] * Math.sin(2 * Math.PI / n); return s; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A radar chart comparing two phones on six scores'), W = A.W, svg = A.svg, fs = A.fs, cx = W / 2, cy = 150, R = 110, o = ORD[order];
      var pt = function (k, v) { var a = -Math.PI / 2 + 2 * Math.PI * k / 6; return [cx + R * v / 10 * Math.cos(a), cy + R * v / 10 * Math.sin(a)]; };
      [2, 4, 6, 8, 10].forEach(function (g) { var d = ''; for (var k = 0; k <= 6; k++) { var p = pt(k % 6, g); d += (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); } el('path', { d: d, fill: 'none', stroke: c.border }, svg); });
      o.forEach(function (a, k) { var p = pt(k, 10), q = pt(k, 11.6); el('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: c.border }, svg); txt(svg, q[0], q[1] + 4, LAB[a], { size: fs(9.5), fill: c.ink2 }); });
      [[A1, OI[0]], [B1, OI[3]]].forEach(function (s) { var d = ''; o.forEach(function (a, k) { var p = pt(k, s[0][a]); d += (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }); el('path', { d: d + 'Z', fill: s[1], 'fill-opacity': 0.2, stroke: s[1], 'stroke-width': 2 }, svg); });
      el('rect', { x: 10, y: 10, width: 10, height: 10, fill: OI[0] }, svg); txt(svg, 24, 19, 'Phone A', { anchor: 'start', size: fs(9.5), fill: c.ink2 }); el('rect', { x: 10, y: 26, width: 10, height: 10, fill: OI[3] }, svg); txt(svg, 24, 35, 'Phone B', { anchor: 'start', size: fs(9.5), fill: c.ink2 });
      var aa = area(A1, o), ab = area(B1, o);
      out.innerHTML = 'Polygon areas: Phone A <strong>' + fmt(aa, 0) + '</strong>, Phone B <strong>' + fmt(ab, 0) + '</strong>. ' + (aa > ab ? 'A looks bigger.' : 'B looks bigger.') + ' The total scores never change: A ' + A1.reduce(function (a, b) { return a + b; }, 0) + ', B ' + B1.reduce(function (a, b) { return a + b; }, 0) + '.' + NOTE + 'A radar (spider) chart puts each variable on a spoke and joins the values into a polygon. It is popular for profiles of products, players or skills, but its main visual impression, the area of the polygon, depends on the order of the spokes: switch the order and the apparent winner can change, although no number has changed. Values on different spokes are also hard to compare. A dot plot or small bar charts usually do the job better.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What kind of colour map suits values running from low to high, such as counts?', options: ['Diverging', 'Sequential', 'Qualitative', 'Rainbow'], answer: 1, explanation: 'For example viridis.' },
      { question: 'When is a diverging colour map appropriate?', options: ['For any data', 'When the data have a meaningful centre, such as zero change or zero correlation', 'For categories', 'Never'], answer: 1, explanation: 'Two contrasting colours either side of a neutral middle.' },
      { question: 'Why is the rainbow (jet) colour map discouraged?', options: ['It is too dull', 'It creates false boundaries, is not perceptually uniform and is hard for colour-blind readers', 'It is slow', 'It cannot show negative values'], answer: 1, explanation: 'Use viridis or similar instead.' },
      { question: 'In a correlation matrix, the diagonal is always…', options: ['0', '1', '−1', 'Random'], answer: 1, explanation: 'Every variable correlates perfectly with itself.' },
      { question: 'What does reordering the rows and columns of a correlation matrix achieve?', options: ['Changes the correlations', 'Places related variables together so that blocks of correlation appear', 'Nothing', 'Removes outliers'], answer: 1, explanation: 'Clustering often does this automatically.' },
      { question: 'A clustered heatmap adds…', options: ['Error bars', 'Dendrograms showing how rows and columns group by similarity', 'Pie charts', 'A second y-axis'], answer: 1, explanation: 'Popular for gene expression data.' },
      { question: 'Why standardise columns before colouring a heatmap of mixed units?', options: ['To make it smaller', 'So that columns with large numbers do not dominate the colour scale', 'To remove the units', 'It is required by seaborn'], answer: 1, explanation: 'Colours then show relative position within each column.' },
      { question: 'In parallel coordinates, lines crossing in an X between two axes indicate…', options: ['A positive relationship', 'A negative relationship', 'No data', 'Outliers'], answer: 1, explanation: 'Parallel lines indicate a positive one.' },
      { question: 'What is the main problem with comparing radar charts by their area?', options: ['Area is hard to compute', 'The area depends on the arbitrary order of the spokes', 'They need colour', 'They cannot show more than three variables'], answer: 1, explanation: 'Reorder the axes and the winner can change.' },
      { question: 'What is faceting?', options: ['Adding 3D effects', 'Splitting a plot into small multiples, one per value of a variable', 'Colouring by category', 'Sorting bars'], answer: 1, explanation: 'seaborn’s col= and row= arguments.' }
    ]);
  };
})();
