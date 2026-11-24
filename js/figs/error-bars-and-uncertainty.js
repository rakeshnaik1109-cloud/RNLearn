/* ==========================================================================
   RNLearn — Error Bars and Uncertainty (Reading the Picture, Part 7)
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
    { name: 'Measuring uncertainty', color: '#b45309' },
    { name: 'Pooling evidence', color: '#7c3aed' },
    { name: 'Communicating it', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1908', icon: '🍺', era: 0, sec: 3, title: 'Student’s t', text: 'William Gosset, a chemist at the Guinness brewery writing as “Student”, works out how uncertain a mean from a small sample is.' },
    { year: '1937', icon: '📐', era: 0, sec: 5, title: 'Confidence intervals', text: 'Jerzy Neyman sets out the theory of confidence intervals.' },
    { year: '1983', icon: '📉', era: 2, sec: 7, title: 'Slopegraphs', text: 'Edward Tufte shows a chart of before-and-after values joined by lines, later called a slopegraph.' },
    { year: '1993', icon: '🌲', era: 1, sec: 11, title: 'A forest plot as a logo', text: 'The new Cochrane Collaboration adopts a forest plot of trials of steroids before premature birth as its logo.' },
    { year: '1996', icon: '🪭', era: 2, sec: 9, title: 'Fan charts', text: 'The Bank of England starts publishing inflation forecasts as fan charts, with bands of shading for uncertainty.' },
    { year: '2005', icon: '❓', era: 0, sec: 4, title: 'Misreading error bars', text: 'A study finds that many published researchers misjudge what overlapping confidence intervals and standard-error bars mean.' },
    { year: '2016', icon: '🚌', era: 2, sec: 9, title: 'Quantile dot plots', text: 'Matthew Kay and colleagues show that dot plots of possible bus arrival times help people make better decisions.' }
  ];
  FIG['fig-p7-timeline'] = function (figEl) {
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
  function tq(df) { return tinv(0.975, df); }
  function errBar(svg, P, x, m, h, col, c, cap) { el('line', { x1: x, y1: P.Y(m - h), x2: x, y2: P.Y(m + h), stroke: col, 'stroke-width': 2.2 }, svg); [m - h, m + h].forEach(function (v) { el('line', { x1: x - (cap || 8), y1: P.Y(v), x2: x + (cap || 8), y2: P.Y(v), stroke: col, 'stroke-width': 2.2 }, svg); }); el('circle', { cx: x, cy: P.Y(m), r: 5, fill: col }, svg); }

  /* -----------------------------------------------------------------------
     Figure: SD, SE or CI?
     ----------------------------------------------------------------------- */
  FIG['fig-error-types'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 0, n = 20;
    var controls = div('fig-controls', container);
    choice(controls, 'Error bar', ['± 1 SD', '± 1 SE', '95% CI'], kind, function (i) { kind = i; draw(); });
    FIG.slider(controls, { id: 'et-n', label: 'Observations per group', min: 5, max: 200, step: 5, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var G = [['Control', sampleN(301, n, 50, 10)], ['Treated', sampleN(302, n, 58, 10)]], c = C(), A = newSVG(svgWrap, container, 280, 'Two groups of measurements with error bars of the chosen kind'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 14, B: 245, xl: 0, xh: 2, yl: 20, yh: 90, xticks: [], yticks: [20, 40, 60, 80], ylab: 'measurement' });
      var info = G.map(function (g, i) { var s = boxStats(g[1]), se = s.sd / Math.sqrt(n), h = [s.sd, se, tq(n - 1) * se][kind], xc = P.X(i + 0.5), r = rngSeed(i + 9); g[1].forEach(function (v) { el('circle', { cx: xc - 40 + 30 * r(), cy: P.Y(v), r: 2.2, fill: c.muted, 'fill-opacity': 0.6 }, svg); }); errBar(svg, P, xc + 20, s.mean, h, OI[i], c); txt(svg, xc, 262, g[0], { size: fs(10), fill: c.ink2 }); return [s.mean, s.sd, se, h]; });
      out.innerHTML = 'Control: mean ' + fmt(info[0][0], 1) + ', SD ' + fmt(info[0][1], 1) + ', SE ' + fmt(info[0][2], 2) + '. The bars shown are <strong>± ' + fmt(info[0][3], 2) + '</strong> long. ' + ['The <strong>standard deviation</strong> describes the spread of individual values. It does not shrink as the sample grows; about two-thirds of values lie within ±1 SD of the mean if the data are roughly normal.', 'The <strong>standard error</strong> (SD/√n) describes the uncertainty of the <em>mean</em>. It shrinks as the sample grows. ±1 SE is only about a 68% interval.', 'A <strong>95% confidence interval</strong> (about ±2 SE, using the t distribution for small samples) is a range that would capture the true mean in 95% of repeated experiments.'][kind] + NOTE + 'The same data can carry error bars of very different lengths. Increase the number of observations: SD bars stay the same length while SE and CI bars shrink. A figure that does not say which error bar it shows cannot be interpreted.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: overlapping error bars and significance
     ----------------------------------------------------------------------- */
  FIG['fig-overlap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var diff = 6, kind = 1, n = 20, sd = 10;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ov-d', label: 'Difference between the means', min: 0, max: 16, step: 0.5, value: diff, onChange: function (x) { diff = x; draw(); } });
    choice(controls, 'Error bars', ['± 1 SE', '95% CI'], kind, function (i) { kind = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var se = sd / Math.sqrt(n), h = kind ? tq(n - 1) * se : se, m1 = 50, m2 = 50 + diff, c = C(), A = newSVG(svgWrap, container, 250, 'Two means with error bars that may or may not overlap'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 14, B: 225, xl: 0, xh: 2, yl: 35, yh: 75, xticks: [], yticks: [40, 50, 60, 70], ylab: 'mean' });
      errBar(svg, P, P.X(0.7), m1, h, OI[0], c, 12); errBar(svg, P, P.X(1.3), m2, h, OI[1], c, 12);
      el('line', { x1: P.X(0.5), y1: P.Y(m1 + h), x2: P.X(1.5), y2: P.Y(m1 + h), stroke: c.border, 'stroke-dasharray': '3 3' }, svg);
      var t = diff / (se * Math.SQRT2), df = 2 * n - 2, p = 2 * (1 - tcdf(t, df)), gap = (m2 - h) - (m1 + h);
      out.innerHTML = (gap >= 0 ? 'The bars <strong>do not overlap</strong> (gap ' + fmt(gap, 1) + ').' : 'The bars <strong>overlap</strong> by ' + fmt(-gap, 1) + ' (' + fmt(100 * -gap / (2 * h), 0) + '% of one bar’s length).') + ' Two-sample t-test: <strong>p = ' + (p < 0.001 ? '&lt; 0.001' : fmt(p, 3)) + '</strong> (' + (p < 0.05 ? 'below' : 'above') + ' 0.05). n = 20 per group, SD 10.' + NOTE + 'Overlap is a poor guide to statistical significance, and the rules differ by bar type. Two <strong>95% CIs</strong> can overlap by up to about a quarter of their length and still differ at p &lt; 0.05; just touching means roughly p ≈ 0.006. Two <strong>SE bars</strong> that just fail to overlap mean only p ≈ 0.16; they need a gap of about one bar length for p ≈ 0.05. These rules of thumb, set out by Geoff Cumming and colleagues, assume independent groups of similar size. For paired or repeated measurements, overlap says almost nothing.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the dance of confidence intervals
     ----------------------------------------------------------------------- */
  FIG['fig-ci-dance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 15, lvl = 1, seed = 4, total = 0, misses = 0;
    var LV = [0.9, 0.95, 0.99];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'cd-n', label: 'Sample size per experiment', min: 5, max: 100, step: 5, value: n, onChange: function (x) { n = x; draw(); } });
    choice(controls, 'Confidence level', ['90%', '95%', '99%'], lvl, function (i) { lvl = i; draw(); });
    var row = group(controls, 'Experiments'); btn('Run 20 more', row).addEventListener('click', function () { seed++; draw(true); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw(add) {
      var r = rngSeed(seed * 977 + n), c = C(), A = newSVG(svgWrap, container, 330, 'Twenty repeated experiments, each with a confidence interval; some miss the true mean'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 30, R: W - 14, T: 10, B: 295, xl: 30, xh: 70, yl: 0, yh: 21, xticks: [30, 40, 50, 60, 70], yticks: [], xlab: 'sample mean and confidence interval (true mean = 50)' });
      el('line', { x1: P.X(50), y1: 10, x2: P.X(50), y2: 295, stroke: c.ink, 'stroke-dasharray': '5 4' }, svg);
      var miss = 0;
      for (var k = 0; k < 20; k++) { var a = []; for (var i = 0; i < n; i++) a.push(50 + 10 * rnorm(r)); var m = mean(a), h = tinv(1 - (1 - LV[lvl]) / 2, n - 1) * sdv(a) / Math.sqrt(n), hit = m - h <= 50 && 50 <= m + h; if (!hit) miss++;
        var y = P.Y(k + 1), col = hit ? OI[0] : OI[3]; el('line', { x1: P.X(Math.max(30, m - h)), y1: y, x2: P.X(Math.min(70, m + h)), y2: y, stroke: col, 'stroke-width': 2 }, svg); el('circle', { cx: P.X(m), cy: y, r: 3.5, fill: col }, svg); }
      if (add) { total += 20; misses += miss; } else { total = 20; misses = miss; }
      out.innerHTML = 'This batch: <strong>' + miss + ' of 20</strong> intervals miss the true mean (red). Running total: ' + misses + ' of ' + total + ' (' + fmt(100 * misses / total, 1) + '%; expected ' + fmt(100 * (1 - LV[lvl]), 0) + '%).' + NOTE + 'Each line is one experiment of ' + n + ' measurements. The sample means jump around, and so do the intervals: Geoff Cumming called this “the dance of the confidence intervals”. A 95% CI does not mean there is a 95% chance that this particular interval contains the true value; it means that the method captures the true value in 95% of experiments. Larger samples give narrower intervals, but still about one in twenty misses.</span>';
    }
    draw();
    window.addEventListener('resize', function () { draw(); });
    onTheme(function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure: forest plot
     ----------------------------------------------------------------------- */
  FIG['fig-forest'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var S = [['Study A', -0.35, 0.20], ['Study B', -0.10, 0.15], ['Study C', -0.45, 0.30], ['Study D', 0.05, 0.25], ['Study E', -0.25, 0.10], ['Study F', -0.30, 0.18]], drop = -1;
    var controls = div('fig-controls', container);
    choice(controls, 'Leave out', ['None'].concat(S.map(function (s) { return s[0].slice(-1); })), 0, function (i) { drop = i - 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var use = S.filter(function (_, i) { return i !== drop; }), w = use.map(function (s) { return 1 / (s[2] * s[2]); }), sw = w.reduce(function (a, b) { return a + b; }, 0), pooled = use.reduce(function (a, s, i) { return a + w[i] * s[1]; }, 0) / sw, pse = 1 / Math.sqrt(sw);
      var c = C(), A = newSVG(svgWrap, container, 300, 'A forest plot of six studies with a pooled estimate'), W = A.W, svg = A.svg, fs = A.fs, lw = 70;
      var P = plotAxes(svg, c, fs, { L: lw, R: W - 14, T: 10, B: 260, xl: 0.3, xh: 2.2, yl: 0, yh: 8, xticks: [], yticks: [], logx: true });
      txt(svg, (lw + W - 14) / 2, 292, W < 560 ? '← treatment better   risk ratio   control better →' : '← favours treatment        risk ratio (log scale)        favours control →', { size: fs(9.5), fill: c.muted });
      [0.5, 0.7, 1, 1.5, 2].forEach(function (v) { txt(svg, P.X(v), 274, String(v), { size: fs(9), fill: c.muted }); });
      el('line', { x1: P.X(1), y1: 10, x2: P.X(1), y2: 260, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      var mw = Math.max.apply(null, S.map(function (s) { return 1 / (s[2] * s[2]); }));
      S.forEach(function (s, i) { var y = P.Y(7 - i), off = i === drop, lo = Math.exp(s[1] - 1.96 * s[2]), hi = Math.exp(s[1] + 1.96 * s[2]), sz = 4 + 9 * Math.sqrt(1 / (s[2] * s[2]) / mw); txt(svg, lw - 6, y + 4, s[0], { anchor: 'end', size: fs(9.5), fill: off ? c.faint : c.ink2 }); el('line', { x1: P.X(Math.max(0.3, lo)), y1: y, x2: P.X(Math.min(2.2, hi)), y2: y, stroke: off ? c.border : c.ink, 'stroke-width': 1.5 }, svg); el('rect', { x: P.X(Math.exp(s[1])) - sz / 2, y: y - sz / 2, width: sz, height: sz, fill: off ? c.border : OI[0] }, svg); });
      var yp = P.Y(0.6), lo = Math.exp(pooled - 1.96 * pse), hi = Math.exp(pooled + 1.96 * pse);
      el('path', { d: 'M' + P.X(lo) + ' ' + yp + 'L' + P.X(Math.exp(pooled)) + ' ' + (yp - 8) + 'L' + P.X(hi) + ' ' + yp + 'L' + P.X(Math.exp(pooled)) + ' ' + (yp + 8) + 'Z', fill: OI[3] }, svg); txt(svg, lw - 6, yp + 4, 'Pooled', { anchor: 'end', size: fs(9.5), fill: c.ink, weight: 700 });
      var nsig = S.filter(function (s) { return s[1] + 1.96 * s[2] < 0; }).length;
      out.innerHTML = 'Pooled risk ratio <strong>' + fmt(Math.exp(pooled), 2) + '</strong> (95% CI ' + fmt(lo, 2) + ' to ' + fmt(hi, 2) + ')' + (drop >= 0 ? ', leaving out ' + S[drop][0] : '') + '. Only ' + nsig + ' of the 6 individual studies ' + (nsig === 1 ? 'has an interval' : 'have intervals') + ' entirely below 1, yet the pooled interval ' + (hi < 1 ? 'excludes 1.' : 'includes 1.') + NOTE + 'A forest plot shows each study’s estimate as a square, sized by its weight (more precise studies are bigger), with a horizontal line for its 95% confidence interval. The diamond at the bottom is the pooled estimate from a meta-analysis; its width is its confidence interval. The vertical line marks no effect. Ratios are plotted on a log scale so that halving and doubling are equal distances from 1. Leave out each study in turn to see how much the conclusion depends on it. The studies are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: before and after
     ----------------------------------------------------------------------- */
  FIG['fig-slope'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = ['Ash', 'Birch', 'Cedar', 'Elm', 'Oak', 'Pine'], B = [62, 55, 71, 48, 66, 58], Af = [70, 54, 78, 63, 67, 72], mode = 2;
    var controls = div('fig-controls', container);
    choice(controls, 'Chart', ['Grouped bars', 'Dumbbell', 'Slope chart'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Pass rates of six schools before and after a programme'), W = A.W, svg = A.svg, fs = A.fs;
      if (mode === 0) { var P = plotAxes(svg, c, fs, { L: 44, R: W - 14, T: 24, B: 245, xl: 0, xh: 6, yl: 0, yh: 85, xticks: [], yticks: [0, 20, 40, 60, 80], ylab: 'pass rate (%)' }); N.forEach(function (nm, i) { var bw = (P.X(1) - P.X(0)) * 0.34; el('rect', { x: P.X(i + 0.15), y: P.Y(B[i]), width: bw, height: P.Y(0) - P.Y(B[i]), fill: c.muted }, svg); el('rect', { x: P.X(i + 0.15) + bw, y: P.Y(Af[i]), width: bw, height: P.Y(0) - P.Y(Af[i]), fill: OI[0] }, svg); txt(svg, P.X(i + 0.5), 262, nm, { size: fs(9.5), fill: c.ink2 }); }); }
      else if (mode === 1) { var idx = N.map(function (_, i) { return i; }).sort(function (a, b) { return (Af[b] - B[b]) - (Af[a] - B[a]); }), P2 = plotAxes(svg, c, fs, { L: 60, R: W - 14, T: 24, B: 245, xl: 40, xh: 85, yl: 0, yh: 6, xticks: [40, 50, 60, 70, 80], yticks: [], xlab: 'pass rate (%)' }); idx.forEach(function (i, k) { var y = P2.Y(5.5 - k); el('line', { x1: P2.X(B[i]), y1: y, x2: P2.X(Af[i]), y2: y, stroke: c.border, 'stroke-width': 4 }, svg); el('circle', { cx: P2.X(B[i]), cy: y, r: 5, fill: c.muted }, svg); el('circle', { cx: P2.X(Af[i]), cy: y, r: 5, fill: Af[i] >= B[i] ? OI[0] : OI[3] }, svg); txt(svg, 54, y + 4, N[i], { anchor: 'end', size: fs(9.5), fill: c.ink2 }); }); }
      else { var x0 = Math.max(70, W * 0.25), x1 = Math.min(W - 80, W * 0.7), Y = function (v) { return 260 - (v - 40) / 45 * 230; }; txt(svg, x0, 18, 'Before', { size: fs(10), fill: c.ink2, weight: 700 }); txt(svg, x1, 18, 'After', { size: fs(10), fill: c.ink2, weight: 700 });
        var ends = N.map(function (nm, i) { return [Y(Af[i]), i]; }).sort(function (a, b) { return a[0] - b[0]; }); for (var k = 1; k < ends.length; k++) if (ends[k][0] - ends[k - 1][0] < 12) ends[k][0] = ends[k - 1][0] + 12;
        N.forEach(function (nm, i) { var col = Af[i] >= B[i] ? OI[0] : OI[3]; el('line', { x1: x0, y1: Y(B[i]), x2: x1, y2: Y(Af[i]), stroke: col, 'stroke-width': 2 }, svg); el('circle', { cx: x0, cy: Y(B[i]), r: 4, fill: col }, svg); el('circle', { cx: x1, cy: Y(Af[i]), r: 4, fill: col }, svg); txt(svg, x0 - 8, Y(B[i]) + 4, String(B[i]), { anchor: 'end', size: fs(9), fill: c.muted }); });
        ends.forEach(function (e) { var i = e[1]; txt(svg, x1 + 8, e[0] + 4, N[i] + ' ' + Af[i], { anchor: 'start', size: fs(9.5), fill: Af[i] >= B[i] ? OI[0] : OI[3] }); }); }
      out.innerHTML = ['Grouped bars make you compare pairs of bars school by school; the <em>change</em>, which is the point, has to be worked out in your head.', 'A dumbbell chart puts before and after on one line per school, sorted by the size of the change. Elm improved most; Birch fell slightly.', 'A slope chart joins each school’s before and after values. Rising and falling lines stand out at once, as do crossings in rank: Elm overtook Birch and Pine overtook Ash.'][mode] + NOTE + 'When the story is change between two moments or two conditions, show the change directly. Dumbbells work well for many items; slope charts for a handful, especially when ranks matter. The data are synthetic.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which error bar describes the spread of individual measurements?', options: ['Standard error', 'Standard deviation', '95% confidence interval', 'p-value'], answer: 1, explanation: 'SE and CI describe the uncertainty of the mean.' },
      { question: 'What happens to SE bars when the sample size quadruples?', options: ['They double', 'They halve', 'They stay the same', 'They vanish'], answer: 1, explanation: 'SE = SD/√n.' },
      { question: 'Two independent 95% CIs just touch. The difference is roughly…', options: ['Not significant', 'Significant at about p = 0.006', 'Exactly p = 0.05', 'Impossible to say'], answer: 1, explanation: 'CIs can overlap a little and still be significant.' },
      { question: 'Two SE bars just fail to overlap. The difference is roughly…', options: ['p ≈ 0.16, not significant at 0.05', 'p ≈ 0.001', 'p ≈ 0.05 exactly', 'Huge'], answer: 0, explanation: 'SE bars need a gap of about one bar length.' },
      { question: 'What does a 95% confidence interval mean?', options: ['95% of the data lie inside it', 'The method captures the true value in 95% of repeated experiments', 'There is a 95% chance this interval is right', 'The result is 95% important'], answer: 1, explanation: 'It is a property of the procedure.' },
      { question: 'In a forest plot, what does the size of each square show?', options: ['The effect size', 'The weight (precision) of the study', 'The year', 'The p-value'], answer: 1, explanation: 'Bigger, more precise studies get bigger squares.' },
      { question: 'Why are ratios plotted on a log scale in forest plots?', options: ['To make them look smaller', 'So that halving and doubling are equal distances from 1', 'Because software requires it', 'To hide uncertainty'], answer: 1, explanation: 'Symmetric treatment of increases and decreases.' },
      { question: 'What does the diamond at the bottom of a forest plot represent?', options: ['The largest study', 'The pooled estimate and its confidence interval', 'An outlier', 'The median'], answer: 1, explanation: 'From a meta-analysis.' },
      { question: 'Which chart best shows how six schools changed between two years?', options: ['A pie chart', 'A slope chart or dumbbell chart', 'A histogram', 'A box plot'], answer: 1, explanation: 'Show the change directly.' },
      { question: 'A prediction band around a regression line is wider than the confidence band because…', options: ['It is drawn by hand', 'It includes the scatter of individual new observations as well as the uncertainty of the line', 'It uses fewer data', 'It is always 99%'], answer: 1, explanation: 'Predicting one point is harder than estimating the average.' }
    ]);
  };
})();
