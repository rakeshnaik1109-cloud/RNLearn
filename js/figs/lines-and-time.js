/* ==========================================================================
   RNLearn — Lines and Time (Reading the Picture, Part 3)
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
    { name: 'Early time charts', color: '#b45309' },
    { name: 'Analysing time series', color: '#7c3aed' },
    { name: 'Modern displays', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: 'c. 1000', icon: '🪐', era: 0, sec: 13, title: 'Planets over time', text: 'A medieval manuscript plots the changing positions of the planets against time, an early time-series chart rediscovered in the 1930s.' },
    { year: '1760s–70s', icon: '🌡️', era: 0, sec: 13, title: 'Lambert’s graphs', text: 'Johann Heinrich Lambert plots experimental measurements, such as the evaporation of water and changes in temperature, as curves.' },
    { year: '1786', icon: '📈', era: 0, sec: 3, title: 'Playfair’s line charts', text: 'William Playfair publishes line charts of England’s imports and exports over time.' },
    { year: '1970', icon: '📐', era: 1, sec: 4, title: 'Box and Jenkins', text: 'George Box and Gwilym Jenkins publish their methods for modelling and forecasting time series.' },
    { year: '1990', icon: '🧩', era: 1, sec: 4, title: 'STL decomposition', text: 'Robert Cleveland and colleagues publish STL, a robust way to split a series into trend, seasonal and remainder parts.' },
    { year: '2006', icon: '〰️', era: 2, sec: 10, title: 'Sparklines', text: 'Edward Tufte names and describes sparklines: tiny, word-sized line charts.' },
    { year: '2011', icon: '⚖️', era: 2, sec: 9, title: 'Dual axes studied', text: 'Researchers test how people read charts with two different y-scales and find them easy to misread.' }
  ];
  FIG['fig-p3-timeline'] = function (figEl) {
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
  function linePath(P, xs, ys) { var d = '', pen = false; for (var i = 0; i < xs.length; i++) { if (ys[i] === null || !isFinite(ys[i])) { pen = false; continue; } d += (pen ? 'L' : 'M') + P.X(xs[i]).toFixed(1) + ' ' + P.Y(ys[i]).toFixed(1); pen = true; } return d; }
  function range0(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

  /* -----------------------------------------------------------------------
     Figure: trend, seasonality and noise (classical decomposition)
     ----------------------------------------------------------------------- */
  FIG['fig-decompose'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var slope = 0.3, amp = 8, noise = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dc-s', label: 'Trend per month', min: -0.4, max: 0.6, step: 0.05, value: slope, onChange: function (x) { slope = x; draw(); } });
    FIG.slider(controls, { id: 'dc-a', label: 'Seasonal amplitude', min: 0, max: 15, step: 0.5, value: amp, onChange: function (x) { amp = x; draw(); } });
    FIG.slider(controls, { id: 'dc-n', label: 'Noise (SD)', min: 0, max: 8, step: 0.5, value: noise, onChange: function (x) { noise = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var N = 96, Z = sampleN(5, N, 0, 1);
    function draw() {
      var y = range0(N).map(function (t) { return 50 + slope * t + amp * Math.sin(2 * Math.PI * t / 12) + noise * Z[t]; });
      var tr = y.map(function (_, t) { if (t < 6 || t > N - 7) return null; var s = 0.5 * y[t - 6] + 0.5 * y[t + 6]; for (var k = -5; k <= 5; k++) s += y[t + k]; return s / 12; });
      var sm = []; for (var m = 0; m < 12; m++) { var a = []; for (var t = m; t < N; t += 12) if (tr[t] !== null) a.push(y[t] - tr[t]); sm.push(mean(a)); }
      var mm = mean(sm); sm = sm.map(function (v) { return v - mm; });
      var se = y.map(function (_, t) { return sm[t % 12]; }), re = y.map(function (v, t) { return tr[t] === null ? null : v - tr[t] - se[t]; });
      var c = C(), A = newSVG(svgWrap, container, 420, 'A monthly series and its trend, seasonal and remainder components'), W = A.W, svg = A.svg, fs = A.fs, xs = range0(N);
      var rows = [['data', y, c.ink], ['trend', tr, PC], ['seasonal', se, OI[0]], ['remainder', re, OI[3]]];
      rows.forEach(function (r, i) {
        var vals = r[1].filter(function (v) { return v !== null; }), lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals); if (hi - lo < 4) { var md = (hi + lo) / 2; lo = md - 2; hi = md + 2; }
        var T = 12 + i * 102, P = plotAxes(svg, c, fs, { L: 70, R: W - 12, T: T, B: T + 78, xl: 0, xh: N - 1, yl: lo, yh: hi, xticks: i === 3 ? [0, 24, 48, 72, 95] : [], yticks: [] , xfmt: function (v) { return 'year ' + Math.round(v / 12 + 1); } });
        txt(svg, 62, T + 42, r[0], { anchor: 'end', size: fs(10), fill: r[2], weight: 700 });
        if (i === 3) el('line', { x1: 70, y1: P.Y(0), x2: W - 12, y2: P.Y(0), stroke: c.border }, svg);
        el('path', { d: linePath(P, xs, r[1]), fill: 'none', stroke: r[2], 'stroke-width': 1.6 }, svg);
      });
      var vr = function (a) { a = a.filter(function (v) { return v !== null; }); var m = mean(a); return mean(a.map(function (v) { return (v - m) * (v - m); })); };
      out.innerHTML = 'Recovered seasonal swing: about <strong>±' + fmt((Math.max.apply(null, sm) - Math.min.apply(null, sm)) / 2, 1) + '</strong> (true ±' + fmt(amp, 1) + '). Remainder SD: <strong>' + fmt(Math.sqrt(vr(re)), 1) + '</strong> (true noise ' + fmt(noise, 1) + ').' + NOTE + 'A time series can often be described as a <strong>trend</strong> (the long-term direction), a <strong>seasonal</strong> pattern that repeats every year (or week, or day), and a <strong>remainder</strong> of irregular noise. This classical decomposition finds the trend with a 12-month moving average, then averages the detrended values for each calendar month. Increase the noise and watch the seasonal pattern blur in the data while the decomposition still recovers it. Note that the trend is missing for the first and last six months: a centred average needs data on both sides.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: moving averages
     ----------------------------------------------------------------------- */
  FIG['fig-moving-average'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var win = 15, centred = false, N = 200, Z = sampleN(9, N, 0, 1);
    var Y = range0(N).map(function (t) { return (t < 100 ? 40 : 65) + 8 * Math.sin(t / 9) * 0 + 10 * Z[t]; });
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ma-w', label: 'Window (days)', min: 1, max: 41, step: 2, value: win, onChange: function (x) { win = x; draw(); } });
    choice(controls, 'Average', ['Trailing (past only)', 'Centred'], 0, function (i) { centred = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Noisy daily values with a sudden jump on day 100, and a moving average that smooths them'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 18, B: 235, xl: 0, xh: N - 1, yl: 0, yh: 100, xticks: [0, 50, 100, 150, 199], yticks: [0, 50, 100], xlab: 'day', ylab: 'value' });
      el('path', { d: linePath(P, range0(N), Y), fill: 'none', stroke: c.border, 'stroke-width': 1.2 }, svg);
      var h = Math.floor(win / 2), M = Y.map(function (_, t) { var a = centred ? t - h : t - win + 1, b = centred ? t + h : t; if (a < 0 || b >= N) return null; var s = 0; for (var k = a; k <= b; k++) s += Y[k]; return s / (b - a + 1); });
      el('path', { d: linePath(P, range0(N), M), fill: 'none', stroke: centred ? OI[3] : OI[0], 'stroke-width': 2.4 }, svg);
      el('line', { x1: P.X(100), y1: 18, x2: P.X(100), y2: 235, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg); txt(svg, P.X(100) + 5, 30, 'true jump', { anchor: 'start', size: fs(9), fill: c.muted });
      var cross = -1; for (var t = 90; t < N; t++) if (M[t] !== null && M[t] >= 52.5) { cross = t; break; }
      out.innerHTML = 'Window ' + win + ' day' + (win > 1 ? 's' : '') + ': the average first reaches the halfway level on <strong>day ' + (cross < 0 ? '–' : cross) + '</strong> (the jump happened on day 100).' + NOTE + 'A moving average replaces each value by the mean of a window around it. Wider windows give smoother lines but blur sudden changes. A <strong>trailing</strong> average uses only past values, so it can be computed in real time, but it lags behind by about half the window; a <strong>centred</strong> average has no lag but needs future values, so it is missing at the most recent end, exactly where the latest news is.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: spaghetti, highlighting and small multiples
     ----------------------------------------------------------------------- */
  FIG['fig-spaghetti'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NAMES = 'ABCDEFGHI'.split(''), N = 25, D = NAMES.map(function (_, i) { var r = rngSeed(40 + i), v = 20, a = []; for (var t = 0; t < N; t++) { v += 0.1 + 0.6 * rnorm(r); a.push(v); } return a; });
    var mode = 0, hi = 5;
    var controls = div('fig-controls', container);
    choice(controls, 'Display', ['Spaghetti', 'Highlight one', 'Small multiples'], mode, function (i) { mode = i; draw(); });
    choice(controls, 'City', NAMES, hi, function (i) { hi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), all = [].concat.apply([], D), lo = Math.floor(Math.min.apply(null, all)), top = Math.ceil(Math.max.apply(null, all)), xs = range0(N);
      var A = newSVG(svgWrap, container, mode === 2 ? 420 : 280, 'Nine time series drawn together, with one highlighted, or as small multiples'), W = A.W, svg = A.svg, fs = A.fs;
      if (mode < 2) {
        var P = plotAxes(svg, c, fs, { L: 46, R: W - 30, T: 16, B: 240, xl: 0, xh: N - 1, yl: lo, yh: top, xticks: [0, 8, 16, 24], yticks: niceTicks(lo, top, 4), xfmt: function (v) { return String(2000 + v); }, ylab: '°C' });
        D.forEach(function (d, i) { if (mode === 1 && i === hi) return; el('path', { d: linePath(P, xs, d), fill: 'none', stroke: mode === 0 ? OI[i % 8] : c.border, 'stroke-width': mode === 0 ? 1.5 : 1.2 }, svg); });
        if (mode === 0) { var ends = D.map(function (d, i) { return [P.Y(d[N - 1]), i]; }).sort(function (u, v) { return u[0] - v[0]; }); for (var k = 1; k < ends.length; k++) if (ends[k][0] - ends[k - 1][0] < 11) ends[k][0] = ends[k - 1][0] + 11; ends.forEach(function (e) { txt(svg, W - 26, e[0] + 3, NAMES[e[1]], { anchor: 'start', size: fs(8.5), fill: OI[e[1] % 8] }); }); }
        if (mode === 1) { el('path', { d: linePath(P, xs, D[hi]), fill: 'none', stroke: PC, 'stroke-width': 3 }, svg); txt(svg, W - 26, P.Y(D[hi][N - 1]) + 3, NAMES[hi], { anchor: 'start', size: fs(10), fill: PC, weight: 700 }); }
      } else {
        var cols = 3, pw = (W - 10) / cols, ph = 130;
        D.forEach(function (d, i) { var x0 = 5 + (i % cols) * pw, y0 = Math.floor(i / cols) * (ph + 8); var P2 = plotAxes(svg, c, fs, { L: x0 + 6, R: x0 + pw - 8, T: y0 + 18, B: y0 + ph, xl: 0, xh: N - 1, yl: lo, yh: top, xticks: [], yticks: [] });
          D.forEach(function (o) { el('path', { d: linePath(P2, xs, o), fill: 'none', stroke: c.border, 'stroke-width': 0.8 }, svg); });
          el('path', { d: linePath(P2, xs, d), fill: 'none', stroke: i === hi ? PC : OI[0], 'stroke-width': 2 }, svg); txt(svg, x0 + pw / 2, y0 + 12, 'City ' + NAMES[i], { size: fs(9.5), fill: c.ink2, weight: 700 }); });
      }
      out.innerHTML = ['With nine coloured lines, the chart becomes “spaghetti”: it is hard to follow any one city, and the colours are hard to match to the labels.', 'Greying out the others and highlighting <strong>City ' + NAMES[hi] + '</strong> lets you follow one line while keeping the rest as context.', '<strong>Small multiples</strong>: one panel per city, all on the same scales, each with the others faintly behind. Every city can be read on its own and compared with the rest.'][mode] + NOTE + 'Beyond four or five lines, consider highlighting or small multiples. Small multiples only work if all panels share the same axes; otherwise similar shapes may hide very different values.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: stacked area versus lines
     ----------------------------------------------------------------------- */
  FIG['fig-stacked-area'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 25, coal = range0(N).map(function (t) { return 40 - 22 * t / 24; }), gas = range0(N).map(function (t) { return 20 + 15 * t / 24 - 6 * Math.sin(t / 3.5); }), ren = range0(N).map(function (t) { return 5 * Math.exp(t / 12); });
    var S = [['Coal', coal, '#555555'], ['Gas', gas, OI[5]], ['Renewables', ren, OI[2]]], mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Display', ['Stacked area', 'Lines'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Electricity generation from three sources over 25 years, as a stacked area chart or as lines'), W = A.W, svg = A.svg, fs = A.fs, xs = range0(N);
      var P = plotAxes(svg, c, fs, { L: 46, R: W - 14, T: 30, B: 240, xl: 0, xh: N - 1, yl: 0, yh: mode ? 45 : 100, xticks: [0, 8, 16, 24], yticks: mode ? [0, 20, 40] : [0, 50, 100], xfmt: function (v) { return String(2000 + v); }, ylab: 'TWh' });
      var base = xs.map(function () { return 0; });
      S.forEach(function (s, i) {
        if (mode === 0) { var top = base.map(function (b, t) { return b + s[1][t]; }), d = linePath(P, xs, top); for (var t = N - 1; t >= 0; t--) d += 'L' + P.X(t).toFixed(1) + ' ' + P.Y(base[t]).toFixed(1); el('path', { d: d + 'Z', fill: s[2], 'fill-opacity': 0.85, stroke: c.surface, 'stroke-width': 1 }, svg); base = top; }
        else el('path', { d: linePath(P, xs, s[1]), fill: 'none', stroke: s[2], 'stroke-width': 2.4 }, svg);
        el('rect', { x: 56 + i * 100, y: 8, width: 12, height: 12, fill: s[2] }, svg); txt(svg, 72 + i * 100, 18, s[0], { anchor: 'start', size: fs(9.5), fill: c.ink2 });
      });
      out.innerHTML = (mode ? 'As lines, each source has its own baseline at zero. Gas clearly rises with ups and downs, renewables overtake coal around 2018, and coal falls steadily.' : 'The stacked area shows the <strong>total</strong> rising and the make-up shifting. But the gas layer sits on top of coal, so its wiggles mix with coal’s decline: is gas rising or falling? Hard to say.') + NOTE + 'Stacked area charts are good for showing a total and roughly how it divides. Only the bottom layer has a flat baseline, so the trends of the upper layers are hard to read, the same problem as stacked bars (Part 2). Put the most stable or most important series at the bottom, or use lines.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: index charts
     ----------------------------------------------------------------------- */
  FIG['fig-index'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 250, ra = rngSeed(8), a = [1500], b = [40];
    for (var t = 1; t < N; t++) { a.push(a[t - 1] * Math.exp(0.0004 + 0.012 * rnorm(ra))); b.push(b[t - 1] * Math.exp(0.0012 + 0.02 * rnorm(ra))); }
    var mode = 1, base = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Display', ['Prices', 'Indexed to 100'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'ix-b', label: 'Base day for the index', min: 0, max: 200, step: 10, value: base, onChange: function (x) { base = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Two share prices on very different levels, shown as prices or as an index'), W = A.W, svg = A.svg, fs = A.fs, xs = range0(N);
      var ya = mode ? a.map(function (v) { return 100 * v / a[base]; }) : a, yb = mode ? b.map(function (v) { return 100 * v / b[base]; }) : b, all = ya.concat(yb), lo = mode ? Math.min.apply(null, all) * 0.95 : 0, hi = Math.max.apply(null, all) * 1.05;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 24, T: 16, B: 240, xl: 0, xh: N - 1, yl: lo, yh: hi, xticks: [0, 50, 100, 150, 200, 249], yticks: niceTicks(lo, hi, 4), xlab: 'trading day', ylab: mode ? 'index' : 'price', yfmt: function (v) { return fmt(v, 0); } });
      if (mode) { el('line', { x1: P.X(0), y1: P.Y(100), x2: P.X(N - 1), y2: P.Y(100), stroke: c.muted, 'stroke-dasharray': '3 3' }, svg); el('circle', { cx: P.X(base), cy: P.Y(100), r: 5, fill: 'none', stroke: c.ink, 'stroke-width': 1.5 }, svg); }
      el('path', { d: linePath(P, xs, ya), fill: 'none', stroke: OI[0], 'stroke-width': 1.8 }, svg); el('path', { d: linePath(P, xs, yb), fill: 'none', stroke: OI[1], 'stroke-width': 1.8 }, svg);
      txt(svg, W - 20, P.Y(ya[N - 1]) + 4, 'A', { anchor: 'start', size: fs(10), fill: OI[0], weight: 700 }); txt(svg, W - 20, P.Y(yb[N - 1]) + 4, 'B', { anchor: 'start', size: fs(10), fill: OI[1], weight: 700 });
      var ga = 100 * (a[N - 1] / a[base] - 1), gb = 100 * (b[N - 1] / b[base] - 1);
      out.innerHTML = (mode ? 'Indexed to day ' + base + ': A has changed by <strong>' + (ga >= 0 ? '+' : '') + fmt(ga, 0) + '%</strong> and B by <strong>' + (gb >= 0 ? '+' : '') + fmt(gb, 0) + '%</strong> since then.' : 'On the price scale, B (around 40) looks flat next to A (around 1,500), although in percentage terms it moves much more.') + NOTE + 'An index chart divides every series by its value on a chosen base date and multiplies by 100, so all lines start at 100 and show relative change. It is the honest way to compare growth of things measured on different scales. But the base date matters: move it and the winner can change. Always check where the index starts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: dual axes
     ----------------------------------------------------------------------- */
  FIG['fig-dual-axis'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 15, r = rngSeed(1), ice = [], cin = []; for (var t = 0; t < N; t++) { ice.push(200 + 3 * t + 4 * rnorm(r)); cin.push(50 + 0.4 * t + rnorm(r)); }
    var lo2 = 50, hi2 = 60;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'da-l', label: 'Right axis: bottom', min: 0, max: 50, step: 1, value: lo2, onChange: function (x) { lo2 = x; draw(); } });
    FIG.slider(controls, { id: 'da-h', label: 'Right axis: top', min: 57, max: 120, step: 1, value: 60, onChange: function (x) { hi2 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Two unrelated series on separate left and right axes'), W = A.W, svg = A.svg, fs = A.fs, xs = range0(N);
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 50, T: 16, B: 240, xl: 0, xh: N - 1, yl: 195, yh: 250, xticks: [0, 5, 10, 14], yticks: [200, 220, 240], xfmt: function (v) { return String(2010 + v); } });
      var Y2 = function (v) { return 240 - (v - lo2) / (hi2 - lo2) * 224; };
      niceTicks(lo2, hi2, 4).forEach(function (v) { txt(svg, W - 44, Y2(v) + 4, fmt(v, 0), { anchor: 'start', size: fs(9), fill: OI[3] }); });
      el('line', { x1: W - 50, y1: 16, x2: W - 50, y2: 240, stroke: OI[3] }, svg);
      el('path', { d: linePath(P, xs, ice), fill: 'none', stroke: OI[0], 'stroke-width': 2.2 }, svg);
      var d = ''; cin.forEach(function (v, i) { d += (i ? 'L' : 'M') + P.X(i).toFixed(1) + ' ' + Y2(v).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: OI[3], 'stroke-width': 2.2 }, svg);
      txt(svg, 56, 28, 'ice cream sales (left)', { anchor: 'start', size: fs(9.5), fill: OI[0] }); txt(svg, W - 56, W < 560 ? 42 : 28, 'cinema visits (right)', { anchor: 'end', size: fs(9.5), fill: OI[3] });
      var gap = mean(cin.map(function (v, i) { return Math.abs(Y2(v) - P.Y(ice[i])); }));
      out.innerHTML = 'Average vertical gap between the lines: <strong>' + fmt(gap, 0) + ' px</strong>. ' + (gap < 30 ? 'The lines move together, suggesting a close link.' : 'Now the lines look unrelated.') + NOTE + 'These two series are made up and independent; both simply drift upwards. With two y-axes, the chart maker chooses both scales freely, and can make the lines cross, overlap or diverge at will, suggesting relationships that are not there. Studies of dual-scale charts found that readers often compare the heights of the two lines directly, as if they shared a scale. Safer alternatives: two panels stacked one above the other with a shared time axis, an index chart, or a scatter plot of one variable against the other (Part 6).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the cherry-picked window
     ----------------------------------------------------------------------- */
  FIG['fig-window'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 60, Z = sampleN(23, N, 0, 1), Y = range0(N).map(function (t) { return 10 + 0.05 * t + 0.6 * Math.sin(2 * Math.PI * t / 11) + 0.35 * Z[t]; });
    var start = 43, len = 12;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'wn-s', label: 'Start of the window (year)', min: 0, max: 55, step: 1, value: start, onChange: function (x) { start = x; draw(); } });
    FIG.slider(controls, { id: 'wn-l', label: 'Length of the window (years)', min: 5, max: 60, step: 1, value: len, onChange: function (x) { len = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var s = Math.min(start, N - 5), e = Math.min(N - 1, s + len - 1), xs = range0(N);
      var c = C(), A = newSVG(svgWrap, container, 280, 'A sixty-year series with a highlighted window and the straight-line trend fitted within it'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 46, R: W - 14, T: 16, B: 240, xl: 0, xh: N - 1, yl: 8, yh: 15, xticks: [0, 10, 20, 30, 40, 50, 59], yticks: [8, 10, 12, 14], xfmt: function (v) { return String(1965 + v); } });
      el('rect', { x: P.X(s), y: 16, width: P.X(e) - P.X(s), height: 224, fill: AMBER, 'fill-opacity': 0.12 }, svg);
      el('path', { d: linePath(P, xs, Y), fill: 'none', stroke: c.border, 'stroke-width': 1.5 }, svg);
      var wx = xs.slice(s, e + 1), wy = Y.slice(s, e + 1); el('path', { d: linePath(P, wx, wy), fill: 'none', stroke: c.ink, 'stroke-width': 1.8 }, svg);
      var f = linfit(wx, wy), F = linfit(xs, Y);
      el('line', { x1: P.X(s), y1: P.Y(f.a + f.b * s), x2: P.X(e), y2: P.Y(f.a + f.b * e), stroke: f.b >= 0 ? OI[3] : OI[0], 'stroke-width': 3 }, svg);
      out.innerHTML = 'Trend within ' + (1965 + s) + '–' + (1965 + e) + ': <strong>' + (f.b >= 0 ? '+' : '') + fmt(f.b * 10, 2) + ' per decade</strong>. Over all 60 years: <strong>+' + fmt(F.b * 10, 2) + ' per decade</strong>.' + NOTE + 'This synthetic series has a steady upward trend plus an 11-year cycle and noise. A short window chosen at the right moment can show a flat or even falling trend, and a window starting at a dip can exaggerate the rise. When you see a trend, ask why the chart starts and ends where it does, and what the longer record shows.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'When is it right to join points with a line?', options: ['Always', 'When the x-axis is continuous, such as time, so that values in between make sense', 'Only for categories', 'Never'], answer: 1, explanation: 'Do not join points for unordered categories.' },
      { question: 'A time series is often described as trend plus seasonality plus…', options: ['Correlation', 'Remainder (noise)', 'Outliers only', 'Median'], answer: 1, explanation: 'Decomposition separates the three.' },
      { question: 'What is the drawback of a trailing moving average?', options: ['It needs future data', 'It lags behind changes by about half the window', 'It is noisier', 'It cannot be computed'], answer: 1, explanation: 'A centred average has no lag but needs future data.' },
      { question: 'What does a wider moving-average window do?', options: ['Shows more noise', 'Gives a smoother line but blurs sudden changes', 'Adds seasonality', 'Removes the trend'], answer: 1, explanation: 'A trade-off between smoothness and responsiveness.' },
      { question: 'What are small multiples?', options: ['Tiny bar charts', 'A grid of small charts with the same axes, one per group', 'A kind of log scale', 'Error bars'], answer: 1, explanation: 'They avoid spaghetti charts.' },
      { question: 'In a stacked area chart, which layer’s trend is easiest to read?', options: ['The top one', 'The bottom one', 'All equally', 'The thickest'], answer: 1, explanation: 'Only the bottom layer has a flat baseline.' },
      { question: 'An index chart divides each series by…', options: ['Its maximum', 'Its value on a base date (×100)', 'The total of all series', 'Its standard deviation'], answer: 1, explanation: 'All series start at 100.' },
      { question: 'Why are charts with two y-axes risky?', options: ['They need colour', 'The chart maker can choose the scales to make the lines appear related or unrelated', 'They cannot show time', 'They are slow to draw'], answer: 1, explanation: 'Use two panels or an index instead.' },
      { question: 'What is a sparkline?', options: ['A colour map', 'A tiny, word-sized line chart without axes', 'A chart of lightning', 'A smoothing method'], answer: 1, explanation: 'Named by Tufte in 2006.' },
      { question: 'A trend over a short, carefully chosen window may…', options: ['Always match the long-term trend', 'Show the opposite of the long-term trend', 'Remove seasonality', 'Be more accurate'], answer: 1, explanation: 'Beware cherry-picked start and end dates.' }
    ]);
  };
})();
