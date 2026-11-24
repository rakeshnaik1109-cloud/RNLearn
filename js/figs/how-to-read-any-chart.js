/* ==========================================================================
   RNLearn — How to Read Any Chart (Reading the Picture, Part 1)
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
    { name: 'Inventing charts', color: '#b45309' },
    { name: 'Charts with a cause', color: '#7c3aed' },
    { name: 'The science of graphics', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1644', icon: '📏', era: 0, sec: 13, title: 'van Langren’s line', text: 'Michael Florent van Langren plots twelve astronomers’ estimates of the longitude difference between Toledo and Rome on a single line: one of the first statistical graphs.' },
    { year: '1786', icon: '📈', era: 0, sec: 13, title: 'Playfair’s atlas', text: 'William Playfair publishes line and bar charts of England’s trade in The Commercial and Political Atlas.' },
    { year: '1801', icon: '🥧', era: 0, sec: 13, title: 'The first pie chart', text: 'Playfair’s Statistical Breviary includes pie charts of the territories of European states.' },
    { year: '1858', icon: '🌹', era: 1, sec: 13, title: 'Nightingale’s rose', text: 'Florence Nightingale’s diagrams show that most soldiers in the Crimean War died of preventable disease, not wounds.' },
    { year: '1869', icon: '🗺️', era: 1, sec: 13, title: 'Minard’s march', text: 'Charles Joseph Minard maps the shrinking of Napoleon’s army in Russia, combining six variables in one picture.' },
    { year: '1973', icon: '4️⃣', era: 2, sec: 5, title: 'Anscombe’s quartet', text: 'Francis Anscombe publishes four data sets with the same statistics and very different pictures.' },
    { year: '1977', icon: '🔎', era: 2, sec: 4, title: 'Exploratory data analysis', text: 'John Tukey’s book urges analysts to look at data before testing it, introducing the box plot and stem-and-leaf plot.' },
    { year: '1983', icon: '📘', era: 2, sec: 10, title: 'Tufte', text: 'Edward Tufte’s The Visual Display of Quantitative Information popularises “data-ink” and attacks “chartjunk”.' },
    { year: '1984', icon: '👁️', era: 2, sec: 9, title: 'Cleveland and McGill', text: 'Experiments show which visual encodings people read most accurately: position first, colour and area last.' },
    { year: '2003', icon: '🐍', era: 2, sec: 11, title: 'matplotlib', text: 'John Hunter releases matplotlib, which becomes the standard plotting library for Python.' },
    { year: '2017', icon: '🦖', era: 2, sec: 6, title: 'The Datasaurus Dozen', text: 'Justin Matejka and George Fitzmaurice create thirteen data sets, one shaped like a dinosaur, with identical summary statistics.' }
  ];
  FIG['fig-p1-timeline'] = function (figEl) {
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
  /* -----------------------------------------------------------------------
     Figure: the anatomy of a chart
     ----------------------------------------------------------------------- */
  FIG['fig-anatomy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var PARTS = [
      ['Title', 'Says what the chart shows. A good title can even state the finding (“Site A is warmer all year”).'],
      ['Axes and labels', 'Each axis needs a name and a unit. “Temperature (°C)” tells you much more than “Temp”.'],
      ['Tick marks and scale', 'Ticks show the scale. Check where the axis starts, whether the steps are equal, and whether the scale is linear or logarithmic.'],
      ['Data marks', 'The points, lines or bars that carry the data. Everything else on the chart is there to help you read them.'],
      ['Legend', 'Tells you which colour or symbol is which group. Labelling lines directly is often even clearer.'],
      ['Gridlines', 'Faint lines that help you read values. They should stay in the background.'],
      ['Annotation', 'A note or arrow that draws attention to something important.'],
      ['Source', 'Where the data came from, so that readers can check it.']
    ];
    var k = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Part of the chart', PARTS.map(function (p) { return p[0]; }), k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var r = rngSeed(1), A_ = [], B_ = [];
    for (var m = 1; m <= 12; m++) { A_.push(18 + 8 * Math.sin((m - 4) * Math.PI / 6) + 0.8 * rnorm(r)); B_.push(15 + 7 * Math.sin((m - 4) * Math.PI / 6) + 0.8 * rnorm(r)); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 330, 'A labelled line chart of monthly temperatures at two sites, with one part of the chart highlighted'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 60, R = W - 20, T = 50, B = 270;
      var P = plotAxes(svg, c, fs, { L: L, R: R, T: T, B: B, xl: 0.5, xh: 12.5, yl: 5, yh: 30, xticks: [], yticks: [10, 15, 20, 25, 30], ylab: '' });
      'JFMAMJJASOND'.split('').forEach(function (ch, i) { txt(svg, P.X(i + 1), B + 14, ch, { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'Month', { size: fs(10), fill: c.ink2 });
      var yl = txt(svg, 16, (T + B) / 2, 'Temperature (°C)', { size: fs(10), fill: c.ink2 }); yl.setAttribute('transform', 'rotate(-90 16 ' + ((T + B) / 2) + ')');
      txt(svg, (L + R) / 2, 22, 'Average monthly temperature at two sites', { size: fs(12), fill: c.ink, weight: 700 });
      [[A_, OI[0]], [B_, OI[1]]].forEach(function (s) { var d = ''; s[0].forEach(function (v, i) { d += (i ? 'L' : 'M') + P.X(i + 1).toFixed(1) + ' ' + P.Y(v).toFixed(1); el('circle', { cx: P.X(i + 1), cy: P.Y(v), r: 3, fill: s[1] }, svg); }); el('path', { d: d, fill: 'none', stroke: s[1], 'stroke-width': 2 }, svg); });
      var lx = R - 90; el('rect', { x: lx - 8, y: T + 4, width: 96, height: 40, fill: c.surface, stroke: c.border, rx: 4 }, svg);
      [['Site A', OI[0]], ['Site B', OI[1]]].forEach(function (s, i) { el('line', { x1: lx, y1: T + 17 + i * 16, x2: lx + 18, y2: T + 17 + i * 16, stroke: s[1], 'stroke-width': 2.5 }, svg); txt(svg, lx + 24, T + 21 + i * 16, s[0], { anchor: 'start', size: fs(9.5), fill: c.ink2 }); });
      var pk = A_.indexOf(Math.max.apply(null, A_)); el('line', { x1: P.X(pk + 1) - 40, y1: P.Y(A_[pk]) + 40, x2: P.X(pk + 1) - 4, y2: P.Y(A_[pk]) + 4, stroke: c.ink2 }, svg); txt(svg, P.X(pk + 1) - 44, P.Y(A_[pk]) + 52, 'warmest month', { anchor: 'end', size: fs(9), fill: c.ink2 });
      txt(svg, 8, 324, 'Source: synthetic data for illustration', { anchor: 'start', size: fs(8.5), fill: c.muted });
      var HL = [[L, 6, R - L, 24], [4, T, R - 4, B + 38 - T], [L - 32, T - 6, R - L + 34, B - T + 26], [L + 4, T + 2, R - L - 104, B - T - 4], [lx - 12, T, 104, 48], [L, T, R - L, B - T], [P.X(pk + 1) - 120, P.Y(A_[pk]) - 6, 120, 66], [4, 310, 230, 18]][k];
      el('rect', { x: HL[0], y: HL[1], width: HL[2], height: HL[3], fill: AMBER, 'fill-opacity': 0.12, stroke: AMBER, 'stroke-width': 2.5, rx: 6 }, svg);
      if (k === 5) [10, 15, 20, 25, 30].forEach(function (v) { el('line', { x1: L, y1: P.Y(v), x2: R, y2: P.Y(v), stroke: AMBER, 'stroke-width': 1 }, svg); });
      out.innerHTML = '<strong>' + PARTS[k][0] + ':</strong> ' + PARTS[k][1] + NOTE + 'Before reading the data, read the frame: what is measured, in what units, on what scale, for which groups, and from what source. Most misreadings of charts come from skipping this step.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Anscombe's quartet
     ----------------------------------------------------------------------- */
  var ANS_X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
  var ANS = [[ANS_X, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]], [ANS_X, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]], [ANS_X, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]], [[8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]]];
  FIG['fig-anscombe'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var show = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['Summary statistics only', 'The plots', 'Plots with fitted lines'], show, function (i) { show = i; draw(); });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      view.innerHTML = '';
      if (show === 0) {
        var rows = ANS.map(function (d, i) { var s = linfit(d[0], d[1]); return '<tr><td style="padding:3px 6px;font-weight:700">' + ['I', 'II', 'III', 'IV'][i] + '</td><td style="padding:3px 6px">' + fmt(mean(d[0]), 2) + '</td><td style="padding:3px 6px">' + fmt(mean(d[1]), 2) + '</td><td style="padding:3px 6px">' + fmt(Math.pow(sdv(d[0]), 2), 2) + '</td><td style="padding:3px 6px">' + fmt(Math.pow(sdv(d[1]), 2), 2) + '</td><td style="padding:3px 6px">' + fmt(s.r, 3) + '</td><td style="padding:3px 6px">y = ' + fmt(s.a, 2) + ' + ' + fmt(s.b, 3) + 'x</td></tr>'; }).join('');
        view.innerHTML = '<div style="overflow-x:auto;margin-top:0.6rem"><table style="border-collapse:collapse;font-family:var(--font-sans);font-size:0.84rem;margin:auto"><tr style="color:var(--ink-muted)"><th style="padding:3px 6px">Set</th><th style="padding:3px 6px">mean x</th><th style="padding:3px 6px">mean y</th><th style="padding:3px 6px">var x</th><th style="padding:3px 6px">var y</th><th style="padding:3px 6px">r</th><th style="padding:3px 6px">fitted line</th></tr>' + rows + '</table></div>';
      } else {
        var svgWrap = div('', view), c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 560 ? 520 : 300, 'Four scatter plots of Anscombe’s quartet'), W = A.W, svg = A.svg, fs = A.fs, narrow = W < 560;
        ANS.forEach(function (d, i) {
          var col = narrow ? i % 2 : i, row = narrow ? Math.floor(i / 2) : 0, pw = narrow ? W / 2 : W / 4, x0 = col * pw, y0 = row * 255;
          var P = plotAxes(svg, c, fs, { L: x0 + 30, R: x0 + pw - 8, T: y0 + 26, B: y0 + 225, xl: 2, xh: 20, yl: 2, yh: 14, xticks: [5, 10, 15, 20], yticks: [4, 8, 12] });
          txt(svg, x0 + pw / 2 + 10, y0 + 16, 'Set ' + ['I', 'II', 'III', 'IV'][i], { size: fs(10), fill: c.ink, weight: 700 });
          if (show === 2) { var s = linfit(d[0], d[1]); el('line', { x1: P.X(3), y1: P.Y(s.a + 3 * s.b), x2: P.X(20), y2: P.Y(s.a + 20 * s.b), stroke: c.muted, 'stroke-width': 1.2 }, svg); }
          d[0].forEach(function (x, j) { el('circle', { cx: P.X(x), cy: P.Y(d[1][j]), r: 3.5, fill: OI[0] }, svg); });
        });
      }
      out.innerHTML = (show === 0 ? 'The four data sets have the same means, the same variances, the same correlation and the same fitted line, to two or three decimal places. They look identical.' : 'Now look: <strong>I</strong> is a noisy straight line, <strong>II</strong> a smooth curve, <strong>III</strong> a perfect line with one outlier, and <strong>IV</strong> no relationship at all except one extreme point.') + NOTE + 'Francis Anscombe constructed these numbers in 1973 to show that “a computer should make both calculations and graphs”. Summary statistics compress data; a plot shows what the compression throws away.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: same statistics, different pictures
     ----------------------------------------------------------------------- */
  FIG['fig-same-stats'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 0, SH = ['Cloud', 'Circle', 'Star', 'Cross', 'Two clusters', 'Parallel lines'];
    var controls = div('fig-controls', container);
    choice(controls, 'Shape', SH, k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function raw(i) {
      var r = rngSeed(11 + i), P = [], n = 140, j, t;
      for (j = 0; j < n; j++) {
        t = j / n;
        if (i === 0) P.push([rnorm(r), 0.6 * rnorm(r)]);
        else if (i === 1) { var a = 2 * Math.PI * t; P.push([Math.cos(a) + 0.03 * rnorm(r), Math.sin(a) + 0.03 * rnorm(r)]); }
        else if (i === 2) { var a2 = 2 * Math.PI * t, rr = 0.55 + 0.45 * Math.abs(Math.cos(2.5 * a2)); P.push([rr * Math.cos(a2), rr * Math.sin(a2)]); }
        else if (i === 3) { var s = 2 * r() - 1; P.push(j % 2 ? [s, s + 0.04 * rnorm(r)] : [s, -s + 0.04 * rnorm(r)]); }
        else if (i === 4) P.push(j % 2 ? [-1 + 0.25 * rnorm(r), 0.25 * rnorm(r)] : [1 + 0.25 * rnorm(r), 0.25 * rnorm(r)]);
        else { var x = 2 * r() - 1; P.push([x, (j % 3) - 1 + 0.02 * rnorm(r)]); }
      }
      return P;
    }
    function fit(P) {
      /* affine transform so that every shape has mean (50, 50), SDs (15, 15) and correlation 0.40 */
      var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; }), mx = mean(xs), my = mean(ys), sx = sdv(xs), sy = sdv(ys);
      var u = P.map(function (p) { return [(p[0] - mx) / sx, (p[1] - my) / sy]; }), r0 = mean(u.map(function (p) { return p[0] * p[1]; })) * u.length / (u.length - 1);
      var e = u.map(function (p) { return [p[0], (p[1] - r0 * p[0]) / Math.sqrt(1 - r0 * r0)]; }), rho = 0.4;
      return e.map(function (p) { return [50 + 15 * p[0], 50 + 15 * (rho * p[0] + Math.sqrt(1 - rho * rho) * p[1])]; });
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A scatter plot whose shape changes while its summary statistics stay the same'), W = A.W, svg = A.svg, fs = A.fs;
      var Q = fit(raw(k)), S = Math.min(W - 80, 260), x0 = (W - S) / 2;
      var P = plotAxes(svg, c, fs, { L: x0, R: x0 + S, T: 14, B: 14 + S, xl: 0, xh: 100, yl: 0, yh: 100, xticks: [0, 50, 100], yticks: [0, 50, 100] });
      Q.forEach(function (q) { el('circle', { cx: P.X(q[0]), cy: P.Y(q[1]), r: 2.6, fill: OI[k % 6], 'fill-opacity': 0.8 }, svg); });
      var xs = Q.map(function (q) { return q[0]; }), ys = Q.map(function (q) { return q[1]; }), f = linfit(xs, ys);
      out.innerHTML = 'mean x = <strong>' + fmt(mean(xs), 2) + '</strong>, mean y = <strong>' + fmt(mean(ys), 2) + '</strong>, SD x = <strong>' + fmt(sdv(xs), 2) + '</strong>, SD y = <strong>' + fmt(sdv(ys), 2) + '</strong>, correlation r = <strong>' + fmt(f.r, 2) + '</strong>.' + NOTE + 'Every shape has been stretched and sheared so that the five numbers above are exactly the same, yet the pictures could hardly be more different. Justin Matejka and George Fitzmaurice made the point memorably in 2017 with the “Datasaurus Dozen”, thirteen data sets including one shaped like a dinosaur, all sharing the same statistics.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: linear and logarithmic scales
     ----------------------------------------------------------------------- */
  FIG['fig-log-scale'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var logy = false;
    var controls = div('fig-controls', container);
    choice(controls, 'Vertical scale', ['Linear', 'Logarithmic'], 0, function (i) { logy = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var D = [], v = 10; for (var d = 0; d < 120; d++) { D.push(v); v *= Math.exp(d < 60 ? Math.LN2 / 7 : Math.LN2 / 20); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'A count growing over 120 days, shown on a linear or logarithmic vertical scale'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, logy ? { L: 58, R: W - 16, T: 20, B: 245, xl: 0, xh: 120, yl: 5, yh: 1e5, xticks: [0, 30, 60, 90, 120], yticks: [10, 100, 1000, 1e4, 1e5], logy: true, xlab: 'day', ylab: W < 560 ? '' : 'count' } : { L: 58, R: W - 16, T: 20, B: 245, xl: 0, xh: 120, yl: 0, yh: 35000, xticks: [0, 30, 60, 90, 120], yticks: [0, 10000, 20000, 30000], yfmt: function (x) { return fmt(x, 0); }, xlab: 'day', ylab: W < 560 ? '' : 'count' });
      el('line', { x1: P.X(60), y1: 20, x2: P.X(60), y2: 245, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      txt(svg, P.X(60) + 6, 34, 'growth slows here', { anchor: 'start', size: fs(9.5), fill: c.muted });
      var path = ''; D.forEach(function (y, i) { path += (i ? 'L' : 'M') + P.X(i).toFixed(1) + ' ' + P.Y(y).toFixed(1); });
      el('path', { d: path, fill: 'none', stroke: PC, 'stroke-width': 2.2 }, svg);
      out.innerHTML = (logy ? 'On a logarithmic scale each gridline is <strong>ten times</strong> the one below, so steady doubling is a straight line, and the slowdown on day 60 is obvious: the line bends.' : 'On a linear scale the first 50 days look flat, and the curve shoots up after day 60, <strong>exactly when growth slowed</strong> from doubling every 7 days to every 20 days.') + NOTE + 'Use a logarithmic scale when what matters is the rate of change (percentages, doubling times) or when values span several orders of magnitude. Read it in ratios: equal distances mean equal multiplication. Always check the axis labels; a log scale should say so.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: where should the axis start? (lie factor)
     ----------------------------------------------------------------------- */
  FIG['fig-axis-start'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var base = 48, A1 = 50, B1 = 54;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'as-b', label: 'Where the vertical axis starts', min: 0, max: 49, step: 1, value: base, onChange: function (x) { base = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Two bars whose apparent difference depends on where the axis starts'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 60, R: Math.min(W - 20, 420), T: 20, B: 225, xl: 0, xh: 2, yl: base, yh: 56, xticks: [], yticks: niceTicks(base, 56, 5), yfmt: function (x) { return fmt(x, 0); }, ylab: 'sales' });
      [[A1, 'A', OI[0]], [B1, 'B', OI[1]]].forEach(function (b, i) { var x = P.X(0.3 + i), w = P.X(0.7) - P.X(0); el('rect', { x: x, y: P.Y(b[0]), width: w, height: P.Y(base) - P.Y(b[0]), fill: b[2] }, svg); txt(svg, x + w / 2, 242, 'Product ' + b[1], { size: fs(10), fill: c.ink2 }); txt(svg, x + w / 2, P.Y(b[0]) - 6, String(b[0]), { size: fs(10), fill: c.ink }); });
      var shown = (B1 - base) / (A1 - base), lie = (shown - 1) / (B1 / A1 - 1);
      out.innerHTML = 'Bar B looks <strong>' + fmt(shown, 2) + ' times</strong> as tall as bar A, but its value is only <strong>' + fmt(B1 / A1, 2) + '</strong> times as large. Lie factor: <strong>' + fmt(lie, 1) + '</strong>.' + NOTE + 'The length of a bar represents a quantity, so bars must start at zero, or the eye reads a small difference as a large one. Edward Tufte’s “lie factor” compares the size of an effect shown in a graphic with its size in the data; 1 is honest. Line charts and dot plots are different: they encode values by position, not length, so a non-zero baseline that zooms in on the variation is often fine, as long as the axis is clearly labelled.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: what the eye reads best (Cleveland and McGill)
     ----------------------------------------------------------------------- */
  FIG['fig-perception'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ENC = ['Position', 'Length', 'Angle', 'Area'], k = 0, trial = 1, guess = 50, errs = [[], [], [], []], shown = false, pair;
    var controls = div('fig-controls', container);
    choice(controls, 'Encoding', ENC, k, function (i) { k = i; shown = false; newPair(); draw(); });
    var sl = FIG.slider(controls, { id: 'pc-g', label: 'Your guess: smaller is what % of larger?', min: 5, max: 100, step: 1, value: guess, onChange: function (x) { guess = x; } });
    var row = group(controls, 'Answer'); var bC = btn('Check', row), bN = btn('Next pair', row);
    bC.addEventListener('click', function () { if (!shown) { errs[k].push(Math.abs(guess - pair[2])); shown = true; draw(); } });
    bN.addEventListener('click', function () { shown = false; newPair(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function newPair() { var r = rngSeed(trial++ * 97 + k * 13); var a = 30 + r() * 70, p = 15 + Math.round(r() * 80); pair = [a, a * p / 100, p]; }
    newPair();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Two values to compare, drawn as positions, lengths, angles or areas'), W = A.W, svg = A.svg, fs = A.fs;
      var big = pair[0], sm = pair[1], cx = W / 2, labs = ['X', 'Y'], vals = trial % 2 ? [big, sm] : [sm, big];
      if (k === 0) { var L = cx - 140, R = cx + 140; el('line', { x1: L, y1: 200, x2: R, y2: 200, stroke: c.muted }, svg); el('line', { x1: L, y1: 20, x2: L, y2: 200, stroke: c.muted }, svg); vals.forEach(function (v, i) { var x = L + 80 + i * 120; el('circle', { cx: x, cy: 200 - v * 1.75, r: 6, fill: OI[i] }, svg); txt(svg, x, 218, labs[i], { size: fs(10), fill: c.ink2 }); }); }
      if (k === 1) vals.forEach(function (v, i) { var x = cx - 90 + i * 120, y0 = i ? 190 : 205; el('rect', { x: x, y: y0 - v * 1.7, width: 50, height: v * 1.7, fill: OI[i] }, svg); txt(svg, x + 25, 222, labs[i], { size: fs(10), fill: c.ink2 }); });
      if (k === 2) { var tot = vals[0] + vals[1], a0 = -Math.PI / 2 + 0.7; vals.forEach(function (v, i) { var a1 = a0 + 2 * Math.PI * v / tot, rr = 90, x0 = cx + rr * Math.cos(a0), y0 = 115 + rr * Math.sin(a0), x1 = cx + rr * Math.cos(a1), y1 = 115 + rr * Math.sin(a1); el('path', { d: 'M' + cx + ' 115L' + x0 + ' ' + y0 + 'A' + rr + ' ' + rr + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1 + ' ' + y1 + 'Z', fill: OI[i], stroke: c.surface, 'stroke-width': 2 }, svg); var am = (a0 + a1) / 2; txt(svg, cx + 105 * Math.cos(am), 119 + 105 * Math.sin(am), labs[i], { size: fs(11), fill: c.ink2, weight: 700 }); a0 = a1; }); }
      if (k === 3) vals.forEach(function (v, i) { var rr = Math.sqrt(v) * 9.5; el('circle', { cx: cx - 80 + i * 160, cy: 110, r: rr, fill: OI[i] }, svg); txt(svg, cx - 80 + i * 160, 218, labs[i], { size: fs(10), fill: c.ink2 }); });
      var means = errs.map(function (e) { return e.length ? fmt(mean(e), 1) + ' points (' + e.length + ')' : '–'; });
      out.innerHTML = (shown ? 'The smaller value is <strong>' + pair[2] + '%</strong> of the larger; you guessed ' + guess + '%, an error of ' + Math.abs(guess - pair[2]) + ' points.' : 'Compare X and Y, set your guess, then press Check.') + '<br>Your average error so far: ' + ENC.map(function (e, i) { return e + ' ' + means[i]; }).join(' · ') + NOTE + 'In experiments published in 1984, William Cleveland and Robert McGill found that people judge positions along a common scale most accurately, then lengths, then angles, then areas, with colour shading worst. Try a few pairs of each and see whether your errors follow the same order. That is why dot plots and bar charts usually beat pie charts and bubble charts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-p1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is the first thing to check when reading an unfamiliar chart?', options: ['The colours', 'What is plotted on each axis, and in what units', 'The biggest value', 'The title font'], answer: 1, explanation: 'Read the frame before the data.' },
      { question: 'What does Anscombe’s quartet show?', options: ['Statistics are useless', 'Data sets with identical summary statistics can look completely different', 'Four types of chart', 'Correlation proves causation'], answer: 1, explanation: 'Always plot your data.' },
      { question: 'On a logarithmic axis, equal distances represent…', options: ['Equal differences', 'Equal ratios', 'Random amounts', 'Percentages of the total'], answer: 1, explanation: 'Each step multiplies by the same factor.' },
      { question: 'A quantity that doubles every week appears on a log-scale plot as…', options: ['A curve bending upwards', 'A straight line', 'A horizontal line', 'A bell shape'], answer: 1, explanation: 'Constant growth rate, constant slope.' },
      { question: 'Why should bar charts start at zero?', options: ['It is a tradition', 'The length of a bar encodes the value, so a cut axis exaggerates differences', 'Software requires it', 'It makes bars thinner'], answer: 1, explanation: 'Line charts encode by position, so they can zoom in.' },
      { question: 'Values 50 and 54 drawn as bars on an axis starting at 48: how much taller does the second bar look?', options: ['8% taller', 'Twice as tall', 'Three times as tall', 'The same'], answer: 2, explanation: '(54 − 48) / (50 − 48) = 3.' },
      { question: 'According to Cleveland and McGill, which is judged most accurately?', options: ['Area', 'Angle', 'Position along a common scale', 'Colour shade'], answer: 2, explanation: 'Then length, angle, area and colour.' },
      { question: 'Why use a colour-blind-safe palette such as Okabe–Ito?', options: ['It is brighter', 'About 1 in 12 men cannot distinguish some common colour pairs, such as red and green', 'It prints faster', 'It is required by law'], answer: 1, explanation: 'Also add labels or shapes, not colour alone.' },
      { question: 'In matplotlib, what is an Axes?', options: ['The x and y lines only', 'A single plot area inside a Figure', 'A colour map', 'A file format'], answer: 1, explanation: 'fig, ax = plt.subplots() creates both.' },
      { question: 'Who first published line and bar charts of economic data, in 1786?', options: ['Florence Nightingale', 'William Playfair', 'John Tukey', 'Edward Tufte'], answer: 1, explanation: 'In The Commercial and Political Atlas.' }
    ]);
  };
})();
