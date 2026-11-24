/* ==========================================================================
   RNLearn — Logarithms from Basics to Advanced
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
    { name: 'Invention', color: '#b45309' },
    { name: 'Calculus and e', color: '#7c3aed' },
    { name: 'Scales of nature', color: '#15803d' },
    { name: 'Information age', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1614', icon: '📖', era: 0, sec: 5, title: 'Napier’s Descriptio', text: 'John Napier publishes Mirifici Logarithmorum Canonis Descriptio in Edinburgh, with tables that turn multiplication into addition.' },
    { year: '1617', icon: '🔟', era: 0, sec: 5, title: 'Base ten', text: 'Henry Briggs, after visiting Napier, prints the first table of logarithms with log 1 = 0 and log 10 = 1. His Arithmetica Logarithmica follows in 1624.' },
    { year: '1620', icon: '📏', era: 0, sec: 6, title: 'Bürgi and Gunter', text: 'Jost Bürgi publishes his independently computed tables in Prague; Edmund Gunter puts a logarithmic scale on a ruler.' },
    { year: 'c.1622', icon: '🎚️', era: 0, sec: 6, title: 'The slide rule', text: 'William Oughtred slides two logarithmic scales against each other. The slide rule is described in print in 1632.' },
    { year: '1647', icon: '〽️', era: 1, sec: 7, title: 'Areas under a hyperbola', text: 'Grégoire de Saint-Vincent shows that areas under y = 1/x grow in equal steps when x grows in equal ratios; in 1649 de Sarasa links this to logarithms.' },
    { year: '1668', icon: '∑', era: 1, sec: 17, title: 'A series for the logarithm', text: 'Nicholas Mercator publishes ln(1 + x) = x − x²/2 + x³/3 − …' },
    { year: '1683', icon: '💰', era: 1, sec: 7, title: 'Compound interest', text: 'Jacob Bernoulli studies interest compounded ever more often and finds a limit between 2 and 3: the number now called e.' },
    { year: '1748', icon: 'e', era: 1, sec: 7, title: 'Euler’s Introductio', text: 'Leonhard Euler defines logarithms as exponents and gives e to 23 decimal places.' },
    { year: '1856', icon: '⭐', era: 2, sec: 10, title: 'Star magnitudes', text: 'Norman Pogson fixes five magnitudes as a brightness ratio of exactly 100.' },
    { year: '1860', icon: '👂', era: 2, sec: 11, title: 'Psychophysics', text: 'Gustav Fechner, building on Ernst Weber’s experiments, proposes that sensation grows with the logarithm of the stimulus.' },
    { year: '1881', icon: '1️⃣', era: 2, sec: 16, title: 'Worn first pages', text: 'Simon Newcomb notices that tables of logarithms are dirtiest at the pages for numbers starting with 1. Frank Benford tests the idea on 20,229 numbers in 1938.' },
    { year: '1909', icon: '🧪', era: 2, sec: 10, title: 'pH', text: 'Søren Sørensen introduces the hydrogen-ion exponent, now written pH.' },
    { year: '1929', icon: '🔊', era: 2, sec: 10, title: 'The decibel', text: 'The Bell System names its logarithmic transmission unit the decibel, after Alexander Graham Bell.' },
    { year: '1935', icon: '🌋', era: 2, sec: 10, title: 'Richter magnitude', text: 'Charles Richter defines earthquake magnitude as the logarithm of the amplitude recorded on a seismograph.' },
    { year: '1948', icon: '💡', era: 3, sec: 13, title: 'Information theory', text: 'Claude Shannon measures information with logarithms and uses the word “bit”, which he credits to John Tukey.' },
    { year: '1979', icon: '📈', era: 3, sec: 10, title: 'Moment magnitude', text: 'Thomas Hanks and Hiroo Kanamori define the moment magnitude scale used for large earthquakes today.' }
  ];
  FIG['fig-log-timeline'] = function (figEl) {
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

  function lgYLab(svg, c, fs, x, y0, y1, s) { var t = txt(svg, x, (y0 + y1) / 2, s, { size: fs(10), fill: c.muted }); t.setAttribute('transform', 'rotate(-90 ' + x + ' ' + ((y0 + y1) / 2) + ')'); }
  function lgNum(v) { var a = Math.abs(v); if (a !== 0 && (a >= 1e5 || a < 1e-3)) return sciHTML(v, 2); return fmt(v, a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : 3); }
  function lgDot(svg, x, y, col, r) { el('circle', { cx: x, cy: y, r: r || 5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, svg); }

  /* -----------------------------------------------------------------------
     Figure: exponent and logarithm explorer
     ----------------------------------------------------------------------- */
  FIG['fig-log-explorer'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var BASES = [2, Math.E, 10], NAMES = ['2', 'e', '10'], bi = 2, v = 0.5;
    var controls = div('fig-controls', container);
    choice(controls, 'Base', ['2', 'e ≈ 2.718', '10'], bi, function (i) { bi = i; draw(); });
    var sl = FIG.slider(controls, { id: 'lg-x', label: 'Number x', min: -1, max: 2, step: 0.01, value: v, onChange: function (z) { v = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var b = BASES[bi], x = Math.pow(10, v), y = Math.log(x) / Math.log(b), c = C();
      valText(sl, lgNum(x));
      var A = newSVG(svgWrap, container, 320, 'The curves y = b to the power x and y = log base b of x, mirror images in the line y = x'), W = A.W, svg = A.svg, fs = A.fs;
      var S = Math.min(W - 70, 290), L = (W - S) / 2 + 10;
      var P = plotAxes(svg, c, fs, { L: L, R: L + S, T: 12, B: 12 + S, xl: -3, xh: 7, yl: -3, yh: 7, xticks: [-2, 0, 2, 4, 6], yticks: [-2, 0, 2, 4, 6] });
      el('line', { x1: P.X(-3), y1: P.Y(0), x2: P.X(7), y2: P.Y(0), stroke: c.faint }, svg); el('line', { x1: P.X(0), y1: P.Y(-3), x2: P.X(0), y2: P.Y(7), stroke: c.faint }, svg);
      el('line', { x1: P.X(-3), y1: P.Y(-3), x2: P.X(7), y2: P.Y(7), stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      plotLine(svg, P, function (t) { return Math.pow(b, t); }, -3, 7, 300, OI[0], 2.4);
      plotLine(svg, P, function (t) { return t > 0 ? Math.log(t) / Math.log(b) : NaN; }, 0.0005, 7, 400, OI[3], 2.4);
      if (x <= 7 && y >= -3 && y <= 7) {
        el('line', { x1: P.X(x), y1: P.Y(0), x2: P.X(x), y2: P.Y(y), stroke: OI[3], 'stroke-dasharray': '3 3', 'clip-path': P.clip }, svg);
        lgDot(svg, P.X(x), P.Y(y), OI[3]);
      }
      if (y <= 7 && x <= 7 && y >= -3) { lgDot(svg, P.X(y), P.Y(x), OI[0]); }
      txt(svg, P.X(1.9), P.Y(6.6), 'y = ' + NAMES[bi] + 'ˣ', { anchor: 'end', size: fs(11), fill: OI[0], weight: 600 });
      txt(svg, P.X(6.9), P.Y(Math.log(6.9) / Math.log(b)) - 8, 'y = log' + (bi === 1 ? '' : NAMES[bi]) + (bi === 1 ? ' (ln) x' : ' x'), { anchor: 'end', size: fs(11), fill: OI[3], weight: 600 });
      txt(svg, P.X(6.8), P.Y(6.4) + 14, 'y = x', { anchor: 'end', size: fs(9), fill: c.muted });
      var nm = bi === 1 ? 'ln' : 'log<sub>' + NAMES[bi] + '</sub>';
      out.innerHTML = nm + '(' + lgNum(x) + ') = <strong>' + fmt(y, 3) + '</strong>, because ' + (bi === 1 ? 'e' : NAMES[bi]) + '<sup>' + fmt(y, 3) + '</sup> = ' + lgNum(x) + '.' + (x > 7 ? ' (The point is off the right of the plot.)' : '') + NOTE + 'The logarithm answers the question “what power of the base gives this number?”. The orange curve is the blue curve reflected in the dashed line y = x: a logarithm undoes an exponential. Note what every base shares: the log of 1 is 0, numbers between 0 and 1 have negative logs, and 0 itself has no logarithm at all. The curve climbs ever more slowly: from 1 to 100 the base-10 log rises only from 0 to 2.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: slide rule
     ----------------------------------------------------------------------- */
  FIG['fig-slide-rule'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 2, b = 3, op = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Operation', ['Multiply a × b', 'Divide a ÷ b'], op, function (i) { op = i; draw(); });
    var sa = FIG.slider(controls, { id: 'lg-sa', label: 'a', min: 1, max: 9.9, step: 0.1, value: a, onChange: function (z) { a = z; draw(); } });
    var sb = FIG.slider(controls, { id: 'lg-sb', label: 'b', min: 1, max: 9.9, step: 0.1, value: b, onChange: function (z) { b = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(); valText(sa, fmt(a, 1)); valText(sb, fmt(b, 1));
      var A = newSVG(svgWrap, container, 190, 'A slide rule: the C scale slides along the D scale so that lengths, which are logarithms, add'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 24, len = (W - 48) / 2, X = function (t) { return L + len * Math.log10(t); }, narrow = len < 260;
      var shift, res, low = '', exact = op === 0 ? a * b : a / b;
      if (op === 0) { shift = Math.log10(a); res = a * b; }
      else if (a >= b) { shift = Math.log10(a / b); res = a / b; }
      else { shift = Math.log10(10 * a / b); res = 10 * a / b; low = ' ÷ 10'; }
      var yD = 120, yC = 62, off = shift * len;
      function ticks(y, dx, up, t0, t1) {
        for (var t = t0; t <= t1 + 1e-6; t += (t < 10 - 1e-9 ? 0.1 : 1)) { var tt = Math.round(t * 10) / 10, major = Math.abs(tt - Math.round(tt)) < 1e-6, sub = t >= 10, half = Math.abs(tt * 2 - Math.round(tt * 2)) < 1e-6, h = major ? 14 : half ? 9 : 5, xx = X(tt) + dx;
          if (sub) { major = tt % 10 === 0; h = major ? 14 : tt % 5 === 0 ? 9 : 6; }
          if (!sub && narrow && !major && !half) continue;
          el('line', { x1: xx, y1: y, x2: xx, y2: up ? y - h : y + h, stroke: c.ink2, 'stroke-width': major ? 1.3 : 0.7 }, svg);
          var LAB = sub ? (narrow ? [20, 50, 100] : [20, 30, 40, 50, 60, 70, 80, 90, 100]) : (narrow ? [1, 2, 3, 5, 10] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), lab = LAB.indexOf(tt) >= 0;
          if (lab && !(sub && tt === 10)) txt(svg, xx, up ? y - 19 : y + 27, String(Math.round(tt)), { size: fs(10), fill: c.ink });
        }
      }
      el('rect', { x: L - 6, y: yD, width: 2 * len + 12, height: 34, fill: c.raised, stroke: c.border, rx: 3 }, svg);
      ticks(yD, 0, false, 1, 100);
      txt(svg, L - 10, yD + 18, 'D', { anchor: 'end', size: fs(10), fill: c.ink2, weight: 700 });
      el('rect', { x: L + off - 6, y: yC - 34, width: len + 12, height: 34, fill: c.surface, stroke: OI[0], rx: 3 }, svg);
      ticks(yC, off, true, 1, 10);
      txt(svg, L + off - 10, yC - 12, 'C', { anchor: 'end', size: fs(10), fill: OI[0], weight: 700 });
      var xr = X(res), xc = op === 0 ? X(b) + off : X(1) + off;
      el('line', { x1: xr, y1: 20, x2: xr, y2: 168, stroke: OI[3], 'stroke-width': 2 }, svg); lgDot(svg, xr, yD, OI[3], 4); lgDot(svg, xc, yC, OI[0], 4);
      el('line', { x1: X(1), y1: yD + 40, x2: X(op === 0 ? a : (low ? 10 * a : a)), y2: yD + 40, stroke: c.muted, 'stroke-width': 1 }, svg);
      txt(svg, Math.min(Math.max(xr, 70), W - 70), 184, (op === 0 ? 'a × b' : 'a ÷ b') + ' ≈ ' + fmt(res, res >= 10 ? 1 : 2) + low, { size: fs(11), fill: OI[3], weight: 700 });
      out.innerHTML = (op === 0 ? fmt(a, 1) + ' × ' + fmt(b, 1) : fmt(a, 1) + ' ÷ ' + fmt(b, 1)) + ' = <strong>' + fmt(exact, op === 0 ? 2 : 3) + '</strong>. ' + (op === 0 ? 'The 1 of the C scale sits over a on the D scale; the answer lies on D under b on C. The length to a plus the length to b is log a + log b = log(a × b).' : 'b on the C scale sits over ' + (low ? '10 × a' : 'a') + ' on the D scale; the answer lies on D under the 1 of C. The length to a minus the length to b is log(a ÷ b).' + (low ? ' Because b is bigger than a, the rule reads 10a ÷ b and the user moves the decimal point.' : '')) + NOTE + 'Each number is drawn at a distance proportional to its logarithm, so the gap from 1 to 2 equals the gap from 2 to 4 and from 4 to 8. Adding two lengths multiplies two numbers. This D scale spans two factors of ten (1 to 100); most real slide rules had one, and users kept track of the decimal point in their heads. Engineers worked this way, to about three significant figures, from the 1620s until pocket calculators arrived in the 1970s.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: e from compound interest and from the area under 1/x
     ----------------------------------------------------------------------- */
  FIG['fig-e'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, nv = 0, t = 2, sn, st;
    var controls = div('fig-controls', container);
    choice(controls, 'View', ['Compound interest', 'Area under 1/x'], mode, function (i) { mode = i; build(); });
    var slot = div('fig-controls', container);
    function build() { slot.innerHTML = '';
      if (!mode) sn = FIG.slider(slot, { id: 'lg-n', label: 'Compounding periods per year', min: 0, max: 6, step: 0.05, value: nv, onChange: function (z) { nv = z; draw(); } });
      else st = FIG.slider(slot, { id: 'lg-t', label: 'Right edge t', min: 0.2, max: 8, step: 0.05, value: t, onChange: function (z) { t = z; draw(); } });
      draw(); }
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, mode ? 'The area under the curve 1/x from 1 to t, which equals the natural logarithm of t' : 'The value of one unit after a year at 100 percent interest compounded n times, approaching e'), W = A.W, svg = A.svg, fs = A.fs;
      if (!mode) {
        var n = Math.max(1, Math.round(Math.pow(10, nv))), val = Math.pow(1 + 1 / n, n); valText(sn, fmt(n, 0));
        var P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 16, B: 252, xl: 1, xh: 1e6, yl: 1.9, yh: 2.8, logx: true, xticks: [1, 10, 100, 1e3, 1e4, 1e5, 1e6], yticks: [2, 2.2, 2.4, 2.6, 2.8], yfmt: function (q) { return q.toFixed(1); }, xlab: 'Compounding periods per year, n (log scale)', ylab: 'Value after one year' });
        el('line', { x1: P.X(1), y1: P.Y(Math.E), x2: P.X(1e6), y2: P.Y(Math.E), stroke: OI[3], 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, svg);
        txt(svg, P.X(1e6) - 4, P.Y(Math.E) - 6, 'e = 2.71828…', { anchor: 'end', size: fs(10), fill: OI[3], weight: 600 });
        var d = ''; for (var k = 0; k <= 240; k++) { var m = Math.pow(10, 6 * k / 240), mm = Math.max(1, Math.round(m)); d += (d ? 'L' : 'M') + P.X(m).toFixed(1) + ' ' + P.Y(Math.pow(1 + 1 / mm, mm)).toFixed(1); }
        el('path', { d: d, fill: 'none', stroke: OI[0], 'stroke-width': 2.2 }, svg);
        [1, 2, 4, 12, 52, 365].forEach(function (q) { lgDot(svg, P.X(q), P.Y(Math.pow(1 + 1 / q, q)), c.faint, 3); });
        lgDot(svg, P.X(n), P.Y(val), OI[0]);
        out.innerHTML = 'Invest 1 at 100% interest for a year, compounded <strong>' + fmt(n, 0) + '</strong> time' + (n > 1 ? 's' : '') + ': you end with (1 + 1/' + fmt(n, 0) + ')<sup>' + fmt(n, 0) + '</sup> = <strong>' + val.toFixed(6) + '</strong>.' + NOTE + 'Yearly gives 2, monthly 2.613, daily 2.7146. Compounding more often helps less and less: the value creeps up to a limit, e = 2.718281828…, found by Jacob Bernoulli in 1683. The grey dots mark yearly, half-yearly, quarterly, monthly, weekly and daily compounding.</span>';
      } else {
        valText(st, fmt(t, 2));
        var Q = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 16, B: 252, xl: 0, xh: 8, yl: 0, yh: 3, xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], yticks: [0, 1, 2, 3], xlab: 'x', ylab: 'y = 1/x' });
        var lo = Math.min(1, t), hi = Math.max(1, t), p = 'M' + Q.X(lo) + ' ' + Q.Y(0);
        for (var j = 0; j <= 100; j++) { var xx = lo + (hi - lo) * j / 100; p += 'L' + Q.X(xx).toFixed(1) + ' ' + Q.Y(Math.min(3, 1 / xx)).toFixed(1); }
        p += 'L' + Q.X(hi) + ' ' + Q.Y(0) + 'Z';
        el('path', { d: p, fill: t >= 1 ? OI[0] : OI[3], 'fill-opacity': 0.3, 'clip-path': Q.clip }, svg);
        plotLine(svg, Q, function (x) { return 1 / x; }, 0.3, 8, 300, c.ink, 2);
        el('line', { x1: Q.X(Math.E), y1: Q.Y(0), x2: Q.X(Math.E), y2: Q.Y(1 / Math.E), stroke: OI[2], 'stroke-dasharray': '3 3' }, svg);
        txt(svg, Q.X(Math.E), Q.Y(1 / Math.E) - 8, 'x = e', { size: fs(9), fill: OI[2] });
        out.innerHTML = 'Area under 1/x from 1 to ' + fmt(t, 2) + ' = <strong>' + (t >= 1 ? '' : '−') + fmt(Math.abs(Math.log(t)), 3) + '</strong> = ln ' + fmt(t, 2) + '.' + NOTE + 'This area is the natural logarithm. It behaves like a logarithm because stretching the x-axis by a factor squashes the curve by the same factor: the area from 1 to 2 equals the area from 2 to 4, and from 4 to 8. The area reaches exactly 1 at x = e. To the left of 1 the area is counted as negative.</span>';
      }
    }
    build();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: linear versus logarithmic axis for growth
     ----------------------------------------------------------------------- */
  FIG['fig-log-axis'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var logy = 0, set = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Outbreak', 'Two growth rates', 'Computer chips'], set, function (i) { set = i; draw(); });
    choice(controls, 'Vertical axis', ['Linear', 'Logarithmic'], logy, function (i) { logy = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function series() {
      var r = rngSeed(31), s = [];
      if (set === 0) { var y = 20; for (var d = 0; d <= 60; d++) { var g = d < 30 ? 0.18 : d < 42 ? 0.18 - 0.012 * (d - 30) : Math.max(0.006, 0.036 - 0.003 * (d - 42)); y *= Math.exp(g * (1 + 0.15 * rnorm(r))); s.push([d, y]); } return [{ pts: s, col: OI[0], name: 'cases' }]; }
      if (set === 1) { var a = [], b = []; for (var t = 0; t <= 40; t++) { a.push([t, 100 * Math.pow(1.05, t)]); b.push([t, 1 * Math.pow(1.15, t)]); } return [{ pts: a, col: OI[0], name: '5% a year from 100' }, { pts: b, col: OI[3], name: '15% a year from 1' }]; }
      var m = []; for (var yr = 1971; yr <= 2021; yr += 2) m.push([yr, 2300 * Math.pow(2, (yr - 1971) / 2) * Math.exp(0.5 * rnorm(r))]); return [{ pts: m, col: OI[2], name: 'transistors per chip (synthetic, doubling every 2 years)' }];
    }
    function draw() {
      var c = C(), S = series(), all = []; S.forEach(function (q) { q.pts.forEach(function (p) { all.push(p[1]); }); });
      var xl = S[0].pts[0][0], xh = S[0].pts[S[0].pts.length - 1][0], ymax = Math.max.apply(null, all), ymin = Math.min.apply(null, all);
      var A = newSVG(svgWrap, container, 300, 'Growth plotted on a ' + (logy ? 'logarithmic' : 'linear') + ' vertical axis'), W = A.W, svg = A.svg, fs = A.fs;
      var lo = Math.pow(10, Math.floor(Math.log10(ymin))), hi = Math.pow(10, Math.ceil(Math.log10(ymax))), yt = [];
      if (logy) for (var e = Math.log10(lo); e <= Math.log10(hi); e += (Math.log10(hi / lo) > 8 ? 2 : 1)) yt.push(Math.pow(10, e));
      var nt = niceTicks(0, ymax, 4);
      var P = plotAxes(svg, c, fs, { L: 62, R: W - 16, T: 24, B: 252, xl: xl, xh: xh, yl: logy ? lo : 0, yh: logy ? hi : nt[nt.length - 1], logy: !!logy, yticks: logy ? yt : nt, yfmt: function (v) { return v >= 1e6 ? (v / 1e6) + 'M' : v >= 1e3 ? (v / 1e3) + 'k' : String(v); }, xticks: niceTicks(xl, xh, 5), xlab: set === 2 ? 'Year' : set === 0 ? 'Day' : 'Year', ylab: '' });
      S.forEach(function (q) { var d = ''; q.pts.forEach(function (p) { d += (d ? 'L' : 'M') + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: q.col, 'stroke-width': 2.2 }, svg); });
      legend(svg, c, fs, W, S.map(function (q) { return q.name; }).join('   ·   '), set === 2 ? 'transistors per chip (synthetic)' : S.map(function (q) { return q.name.split(' from')[0]; }).join(' · '));
      var msg = [
        logy ? 'On the log axis the early weeks form a straight line: a constant growth rate (here about 18% a day, doubling every 4 days). The bend shows exactly when growth began to slow, around day 30, long before the curve on the linear axis looks any flatter.' : 'On the linear axis nothing seems to happen for a month, then cases explode. You cannot tell whether growth is speeding up or slowing down, or read the early numbers at all.',
        logy ? 'On the log axis each line is straight, and its slope is its growth rate. The steeper red line will cross the blue one: the faster growth always wins in the end, whatever the starting point.' : 'On the linear axis the slower series looks bigger for 30 years, then the faster one shoots past. The shapes hide that both are simple constant-percentage growth.',
        logy ? 'Doubling every two years is a straight line on the log axis, spanning more than seven factors of ten. Points scattered above or below the line are easy to see at every scale.' : 'On the linear axis the first 30 years are flattened onto the floor of the plot; only the last few points are visible.'
      ][set];
      out.innerHTML = msg + NOTE + 'On a logarithmic axis, equal distances mean equal <em>ratios</em>: each grid line is ten times the one below. Exponential growth (a fixed percentage per step) becomes a straight line whose slope is the growth rate. Always check which kind of axis a chart uses before comparing heights.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: doubling time and the rule of 70
     ----------------------------------------------------------------------- */
  FIG['fig-doubling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = 7;
    var controls = div('fig-controls', container);
    var sr = FIG.slider(controls, { id: 'lg-r', label: 'Growth rate per period (%)', min: 0.5, max: 30, step: 0.5, value: r, onChange: function (z) { r = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sr, fmt(r, 1) + '%');
      var c = C(), A = newSVG(svgWrap, container, 300, 'Exact doubling time compared with the rules of 70 and 72'), W = A.W, svg = A.svg, fs = A.fs;
      var ex = function (q) { return Math.log(2) / Math.log(1 + q / 100); };
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 24, B: 252, xl: 0.5, xh: 30, yl: 2, yh: 150, logx: false, logy: true, xticks: [1, 5, 10, 15, 20, 25, 30], yticks: [10, 100], xlab: 'Growth rate per period (%)', ylab: 'Periods to double' });
      [2, 3, 5, 20, 30, 50].forEach(function (v) { var y = P.Y(v); el('line', { x1: 54, y1: y, x2: W - 16, y2: y, stroke: c.border, 'stroke-width': 0.4 }, svg); txt(svg, 48, y + 4, String(v), { anchor: 'end', size: fs(8), fill: c.faint }); });
      plotLine(svg, P, function (q) { return 70 / q; }, 0.5, 30, 200, OI[2], 1.8, '5 4');
      plotLine(svg, P, function (q) { return 72 / q; }, 0.5, 30, 200, OI[1], 1.8, '2 3');
      plotLine(svg, P, ex, 0.5, 30, 300, OI[0], 2.4);
      lgDot(svg, P.X(r), P.Y(ex(r)), OI[0]);
      legend(svg, c, fs, W, 'blue: exact ln 2 / ln(1 + r)    green dashed: 70 / r    orange dotted: 72 / r', 'blue exact · green 70/r · orange 72/r');
      var e = ex(r), e70 = 70 / r, e72 = 72 / r;
      out.innerHTML = 'At ' + fmt(r, 1) + '% per period, the quantity doubles in <strong>' + fmt(e, 2) + '</strong> periods. Rule of 70: ' + fmt(e70, 2) + ' (' + (e70 >= e ? '+' : '') + fmt(100 * (e70 / e - 1), 1) + '%). Rule of 72: ' + fmt(e72, 2) + ' (' + (e72 >= e ? '+' : '') + fmt(100 * (e72 / e - 1), 1) + '%).' + NOTE + 'Solving (1 + r)<sup>t</sup> = 2 needs a logarithm: t = ln 2 / ln(1 + r). For small r, ln(1 + r) ≈ r, and ln 2 ≈ 0.693, so t ≈ 69.3 / (rate in %). Seventy is easy to divide; 72 has many divisors and happens to be more accurate near 8%. For continuous growth at rate k, the doubling time is exactly ln 2 / k, and a half-life works the same way for decay.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: logarithmic scales in science
     ----------------------------------------------------------------------- */
  FIG['fig-scales'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SC = [
      { name: 'pH', lo: 0, hi: 14, step: 0.1, a: 3, b: 7, unit: '', marks: [[1, 'stomach acid'], [2.5, 'lemon juice'], [4, 'tomato'], [7, 'pure water'], [8.1, 'sea water'], [11.5, 'ammonia'], [13.5, 'drain cleaner']],
        ratio: function (a, b) { return Math.pow(10, b - a); }, say: function (a, b, q) { return 'pH ' + fmt(a, 1) + ' has <strong>' + lgNum(q) + '</strong> times the hydrogen-ion concentration of pH ' + fmt(b, 1) + '.'; },
        note: 'pH = −log<sub>10</sub>[H<sup>+</sup>], with the concentration in moles per litre. The minus sign makes lower numbers more acidic; each step of one is a factor of ten.' },
      { name: 'Sound level (dB)', lo: 0, hi: 130, step: 1, a: 60, b: 90, unit: ' dB', marks: [[0, 'threshold of hearing'], [30, 'whisper'], [60, 'conversation'], [85, 'heavy traffic'], [100, 'motorbike'], [120, 'thunder']],
        ratio: function (a, b) { return Math.pow(10, (b - a) / 10); }, say: function (a, b, q) { return fmt(b, 0) + ' dB carries <strong>' + lgNum(q) + '</strong> times the sound intensity (power) of ' + fmt(a, 0) + ' dB, and ' + lgNum(Math.sqrt(q)) + ' times the pressure amplitude.'; },
        note: 'Level in decibels = 10 log<sub>10</sub>(I / I<sub>0</sub>). +10 dB is ten times the power, +3 dB about double. Perceived loudness roughly doubles every 10 dB, so the ear itself is compressing the range.' },
      { name: 'Earthquake magnitude', lo: 2, hi: 9.5, step: 0.1, a: 5, b: 7, unit: '', marks: [[2.5, 'barely felt'], [5, 'moderate'], [6.5, 'strong'], [7.8, 'major'], [9.1, 'largest in decades'], [9.5, 'largest recorded (1960)']],
        ratio: function (a, b) { return Math.pow(10, 1.5 * (b - a)); }, say: function (a, b, q) { return 'Magnitude ' + fmt(b, 1) + ' releases about <strong>' + lgNum(q) + '</strong> times the energy of magnitude ' + fmt(a, 1) + ' (and ' + lgNum(Math.pow(10, b - a)) + ' times the seismograph amplitude).'; },
        note: 'Richter’s magnitude was the base-10 log of a seismograph amplitude, so +1 means ten times the wave amplitude. Energy grows faster, by about 10<sup>1.5</sup> ≈ 32 per step. Today’s moment magnitude is built to match, using the size of the fault slip.' },
      { name: 'Star magnitude', lo: -1.5, hi: 6.5, step: 0.1, a: 0, b: 5, unit: '', marks: [[-1.5, 'Sirius'], [0, 'Vega'], [1, 'Spica'], [2, 'Polaris'], [4, 'dim stars in a city'], [6, 'naked-eye limit']],
        ratio: function (a, b) { return Math.pow(100, (b - a) / 5); }, say: function (a, b, q) { return 'A magnitude ' + fmt(a, 1) + ' star looks <strong>' + lgNum(q) + '</strong> times brighter than one of magnitude ' + fmt(b, 1) + '.'; },
        note: 'Pogson’s rule: five magnitudes is exactly a factor of 100, so one magnitude is 100<sup>1/5</sup> ≈ 2.512. The scale runs backwards (brighter stars have smaller numbers) because it began with ancient “first-class” and “sixth-class” stars.' }
    ], k = 0, sa, sb, a, b;
    var controls = div('fig-controls', container);
    choice(controls, 'Scale', SC.map(function (s) { return s.name; }), k, function (i) { k = i; build(); });
    var slots = div('fig-controls', container), svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function build() {
      var s = SC[k]; slots.innerHTML = ''; a = s.a; b = s.b;
      sa = FIG.slider(slots, { id: 'lg-sc-a', label: 'Value A', min: s.lo, max: s.hi, step: s.step, value: a, onChange: function (z) { a = z; draw(); } });
      sb = FIG.slider(slots, { id: 'lg-sc-b', label: 'Value B', min: s.lo, max: s.hi, step: s.step, value: b, onChange: function (z) { b = z; draw(); } });
      draw();
    }
    function draw() {
      var s = SC[k], c = C(), d = s.step < 1 ? 1 : 0; valText(sa, fmt(a, d) + s.unit); valText(sb, fmt(b, d) + s.unit);
      var narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = narrow ? 120 + 4 * 15 : 150;
      var A = newSVG(svgWrap, container, H, 'A ' + s.name + ' scale with familiar examples and the two chosen values'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 20, R = W - 20, X = function (v) { return L + (v - s.lo) / (s.hi - s.lo) * (R - L); }, y = 70;
      el('line', { x1: L, y1: y, x2: R, y2: y, stroke: c.ink2, 'stroke-width': 2 }, svg);
      var ts = niceTicks(s.lo, s.hi, narrow ? 5 : 8); ts.forEach(function (v) { if (v < s.lo - 1e-9 || v > s.hi + 1e-9) return; el('line', { x1: X(v), y1: y - 5, x2: X(v), y2: y + 5, stroke: c.ink2 }, svg); txt(svg, X(v), y + 18, String(v), { size: fs(9), fill: c.muted }); });
      s.marks.forEach(function (m, i) { var lvl = narrow ? i % 4 : i % 2, yy = y + 40 + lvl * 15; el('line', { x1: X(m[0]), y1: y + 6, x2: X(m[0]), y2: yy - 10, stroke: c.faint, 'stroke-width': 0.8 }, svg); txt(svg, Math.min(Math.max(X(m[0]), 40), W - 40), yy, m[1], { size: fs(9), fill: c.ink2 }); });
      [[a, OI[0], 'A'], [b, OI[3], 'B']].forEach(function (p, i) { lgDot(svg, X(p[0]), y, p[1], 6); txt(svg, X(p[0]), y - 14 - (Math.abs(a - b) < (s.hi - s.lo) * 0.04 && i ? 14 : 0), p[2], { size: fs(11), fill: p[1], weight: 700 }); });
      var lo = Math.min(a, b), hi = Math.max(a, b), q = s.ratio(lo, hi);
      out.innerHTML = s.say(lo, hi, q) + ' The two values differ by ' + fmt(hi - lo, d) + ' on the scale.' + NOTE + s.note + '</span>';
    }
    build();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the mental number line
     ----------------------------------------------------------------------- */
  FIG['fig-number-line'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w = 1;
    var controls = div('fig-controls', container);
    var sw = FIG.slider(controls, { id: 'lg-w', label: 'Thinking: linear ← → logarithmic', min: 0, max: 1, step: 0.05, value: w, onChange: function (z) { w = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sw, fmt(100 * w, 0) + '% log');
      var c = C(), A = newSVG(svgWrap, container, 170, 'Where numbers from 1 to 100 are placed on a line by linear and logarithmic thinking'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 26, R = W - 26, N = [1, 2, 3, 5, 10, 20, 30, 50, 100], pos = function (n) { return (1 - w) * (n - 1) / 99 + w * Math.log10(n) / 2; };
      el('line', { x1: L, y1: 50, x2: R, y2: 50, stroke: c.ink2, 'stroke-width': 2 }, svg); el('line', { x1: L, y1: 120, x2: R, y2: 120, stroke: c.ink2, 'stroke-width': 2 }, svg);
      txt(svg, L, 30, 'Accurate (linear) line', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, L, 152, 'Where the numbers are placed', { anchor: 'start', size: fs(10), fill: c.muted });
      var lastX = -99;
      N.forEach(function (n, i) { var x1 = L + (R - L) * (n - 1) / 99, x2 = L + (R - L) * pos(n);
        el('line', { x1: x1, y1: 54, x2: x2, y2: 116, stroke: OI[i % 2 ? 0 : 5], 'stroke-opacity': 0.55 }, svg);
        lgDot(svg, x1, 50, c.faint, 3); lgDot(svg, x2, 120, OI[i % 2 ? 0 : 5], 4);
        if (x2 - lastX > 16) { txt(svg, x2, 138, String(n), { size: fs(9), fill: c.ink }); lastX = x2; }
      });
      out.innerHTML = 'With ' + fmt(100 * w, 0) + '% logarithmic thinking, 10 lands ' + fmt(100 * pos(10), 0) + '% of the way along a 1-to-100 line (the accurate position is 9%).' + NOTE + 'Young children, and adults in cultures without schooling in measurement, tend to place numbers like the logarithmic line: 1 and 2 far apart, 80 and 90 almost together. Most schooled adults learn the linear line for small numbers, but for large quantities (millions versus billions, risks, prices) intuition stays ratio-based. A rise from 1 to 2 feels like a rise from 50 to 100.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: power laws on log-log axes
     ----------------------------------------------------------------------- */
  FIG['fig-power-law'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var b = 0.75, logs = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Axes', ['Linear', 'Log–log'], logs, function (i) { logs = i; draw(); });
    var sb = FIG.slider(controls, { id: 'lg-pb', label: 'True exponent b', min: -1, max: 2, step: 0.05, value: b, onChange: function (z) { b = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sb, fmt(b, 2));
      var r = rngSeed(77), xs = [], ys = [];
      for (var i = 0; i < 50; i++) { var x = Math.pow(10, -1 + 4 * r()); xs.push(x); ys.push(2 * Math.pow(x, b) * Math.exp(0.25 * rnorm(r))); }
      var f = linfit(xs.map(Math.log10), ys.map(Math.log10)), c = C();
      var A = newSVG(svgWrap, container, 300, 'Synthetic data following a power law, on ' + (logs ? 'log–log' : 'linear') + ' axes'), W = A.W, svg = A.svg, fs = A.fs;
      var ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys), P;
      if (logs) { var lo = Math.pow(10, Math.floor(Math.log10(ymin))), hi = Math.pow(10, Math.ceil(Math.log10(ymax))), yt = []; for (var e = Math.log10(lo); e <= Math.log10(hi) + 1e-9; e += (Math.log10(hi / lo) > 6 ? 2 : 1)) yt.push(Math.pow(10, e));
        P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 24, B: 252, xl: 0.1, xh: 1000, yl: lo, yh: hi, logx: true, logy: true, xticks: [0.1, 1, 10, 100, 1000], yticks: yt, xlab: 'x (log scale)', ylab: 'y (log scale)' }); }
      else { var nt = niceTicks(0, ymax, 4); P = plotAxes(svg, c, fs, { L: 62, R: W - 16, T: 24, B: 252, xl: 0, xh: 1000, yl: 0, yh: Math.max(nt[nt.length - 1], 1e-9), xticks: [0, 250, 500, 750, 1000], yticks: nt, yfmt: function (v) { return v >= 1e3 ? fmt(v, 0) : String(v); }, xlab: 'x', ylab: 'y' }); }
      xs.forEach(function (x, i) { el('circle', { cx: P.X(x), cy: P.Y(ys[i]), r: 3.5, fill: OI[0], 'fill-opacity': 0.7, 'clip-path': P.clip }, svg); });
      plotLine(svg, P, function (x) { return Math.pow(10, f.a + f.b * Math.log10(x)); }, logs ? 0.1 : 0.5, 1000, 300, OI[3], 2, null, true);
      out.innerHTML = 'Fitted straight line on the log–log plot: log y = ' + fmt(f.a, 2) + ' + <strong>' + fmt(f.b, 3) + '</strong> log x, so y ≈ ' + fmt(Math.pow(10, f.a), 2) + ' x<sup>' + fmt(f.b, 2) + '</sup> (true values 2 and ' + fmt(b, 2) + ').' + NOTE + (logs ? 'Taking logs of y = a·x<sup>b</sup> gives log y = log a + b log x: a straight line whose <strong>slope is the exponent</strong>. Points spread evenly over four factors of ten, and the noise (a constant percentage error) has the same width everywhere.' : 'On linear axes the curve hugs the corner: most points crowd near zero and a few large ones dominate. You cannot read off the exponent, or even tell a power law from an exponential.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: entropy of a coin
     ----------------------------------------------------------------------- */
  FIG['fig-entropy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p = 0.5;
    var controls = div('fig-controls', container);
    var sp = FIG.slider(controls, { id: 'lg-p', label: 'Probability of heads', min: 0, max: 1, step: 0.01, value: p, onChange: function (z) { p = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function H(q) { return q <= 0 || q >= 1 ? 0 : -(q * Math.log2(q) + (1 - q) * Math.log2(1 - q)); }
    function draw() {
      valText(sp, fmt(p, 2));
      var c = C(), A = newSVG(svgWrap, container, 300, 'Shannon entropy of a coin as its bias changes'), W = A.W, svg = A.svg, fs = A.fs;
      var narrow = W < 560, R1 = narrow ? W - 16 : W * 0.66;
      var P = plotAxes(svg, c, fs, { L: 50, R: R1, T: 20, B: 252, xl: 0, xh: 1, yl: 0, yh: 1.05, xticks: [0, 0.25, 0.5, 0.75, 1], yticks: [0, 0.5, 1], xlab: 'Probability of heads', ylab: 'Entropy (bits)' });
      plotLine(svg, P, H, 0, 1, 300, OI[0], 2.4);
      el('line', { x1: P.X(p), y1: P.Y(0), x2: P.X(p), y2: P.Y(H(p)), stroke: OI[0], 'stroke-dasharray': '3 3' }, svg);
      lgDot(svg, P.X(p), P.Y(H(p)), OI[0]);
      if (!narrow) {
        var bx = R1 + 40, bw = (W - 16 - bx) / 2 - 8, top = 40, bot = 220;
        [['H', p, OI[3]], ['T', 1 - p, OI[2]]].forEach(function (s, i) { var x = bx + i * (bw + 16), h = (bot - top) * s[1];
          el('rect', { x: x, y: bot - h, width: bw, height: h, fill: s[2], 'fill-opacity': 0.75 }, svg); txt(svg, x + bw / 2, bot + 16, s[0], { size: fs(10), fill: c.ink });
          txt(svg, x + bw / 2, bot - h - 6, s[1] > 0 && s[1] < 1 ? fmt(-Math.log2(s[1]), 2) + ' bits' : s[1] === 1 ? '0 bits' : '—', { size: fs(9), fill: c.muted }); });
        txt(svg, bx + bw + 8, 24, 'Surprise of each outcome', { size: fs(9), fill: c.muted });
      }
      out.innerHTML = 'Entropy H = <strong>' + fmt(H(p), 3) + ' bits</strong> per toss.' + (p > 0 && p < 1 ? ' Heads carries a surprise of −log<sub>2</sub>(' + fmt(p, 2) + ') = ' + fmt(-Math.log2(p), 2) + ' bits; tails −log<sub>2</sub>(' + fmt(1 - p, 2) + ') = ' + fmt(-Math.log2(1 - p), 2) + ' bits.' : ' The outcome is certain, so a toss tells you nothing.') + NOTE + 'The information in an outcome of probability p is −log<sub>2</sub> p bits: rare events surprise more. Entropy is the average surprise. A fair coin gives the maximum, 1 bit; a biased coin is more predictable, which is why its tosses can be compressed. Logs make information add up: two independent tosses carry twice the information of one, even though the number of possible outcomes multiplies.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: binary search
     ----------------------------------------------------------------------- */
  FIG['fig-binary-search'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nv = 3, seed = 1, steps = [];
    var controls = div('fig-controls', container);
    var sn = FIG.slider(controls, { id: 'lg-bn', label: 'Items in the sorted list', min: 1, max: 9, step: 0.1, value: nv, onChange: function (z) { nv = z; run(); } });
    var row = group(controls, 'Target'); btn('New target', row).addEventListener('click', function () { seed++; run(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var N, target;
    function run() { N = Math.round(Math.pow(10, nv)); var r = rngSeed(seed * 97 + 5); target = 1 + Math.floor(r() * N); steps = []; var lo = 1, hi = N; while (lo <= hi) { var mid = Math.floor((lo + hi) / 2); steps.push([lo, hi, mid]); if (mid === target) break; if (mid < target) lo = mid + 1; else hi = mid - 1; } draw(); }
    function draw() {
      valText(sn, fmt(N, 0));
      var c = C(), A = newSVG(svgWrap, container, 60 + 22 * Math.max(steps.length, 4) + 20, 'Binary search halving the range at each step'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 70, R = W - 16, X = function (v) { return L + (v - 1) / Math.max(N - 1, 1) * (R - L); };
      txt(svg, L, 18, '1', { size: fs(9), fill: c.muted }); txt(svg, R, 18, fmt(N, 0), { size: fs(9), fill: c.muted });
      el('line', { x1: X(target), y1: 24, x2: X(target), y2: 40 + 22 * steps.length, stroke: OI[3], 'stroke-dasharray': '3 3' }, svg);
      steps.forEach(function (s, i) { var y = 34 + 22 * i; el('rect', { x: X(s[0]) - 1, y: y, width: Math.max(2, X(s[1]) - X(s[0]) + 2), height: 12, fill: OI[0], 'fill-opacity': 0.35, rx: 2 }, svg); lgDot(svg, X(s[2]), y + 6, s[2] === target ? OI[3] : c.ink2, 3.5); txt(svg, L - 8, y + 10, 'step ' + (i + 1), { anchor: 'end', size: fs(9), fill: c.muted }); });
      out.innerHTML = 'Finding item ' + fmt(target, 0) + ' among ' + fmt(N, 0) + ' took <strong>' + steps.length + '</strong> step' + (steps.length > 1 ? 's' : '') + '. log<sub>2</sub>(' + fmt(N, 0) + ') = ' + fmt(Math.log2(N), 1) + ', so it never needs more than ' + (Math.floor(Math.log2(N)) + 1) + '. Checking items one by one would take ' + fmt(Math.ceil(N / 2), 0) + ' steps on average.' + NOTE + 'Each step compares the target with the middle item and throws away half of what is left. The number of halvings needed to get from N down to 1 is log<sub>2</sub> N. That is why binary search is written O(log N): a billion sorted items need only about 30 comparisons, and doubling the list adds just one.</span>';
    }
    run();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: log transform of skewed data
     ----------------------------------------------------------------------- */
  FIG['fig-log-transform'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var logt = 0, vals = [], r = rngSeed(11);
    for (var i = 0; i < 2000; i++) vals.push(Math.exp(Math.log(30000) + 0.8 * rnorm(r)));
    var controls = div('fig-controls', container);
    choice(controls, 'Scale', ['Original values', 'Log10 of values'], logt, function (i) { logt = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), v = logt ? vals.map(Math.log10) : vals, s = v.slice().sort(function (a, b) { return a - b; });
      var lo = logt ? 3.4 : 0, hi = logt ? 6 : 300000, nb = 40, bins = new Array(nb).fill(0);
      v.forEach(function (x) { var k = Math.floor((x - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) bins[k]++; });
      var mx = Math.max.apply(null, bins), mu = mean(v), med = qsorted(s, 0.5);
      var A = newSVG(svgWrap, container, 290, 'Histogram of skewed synthetic incomes, ' + (logt ? 'after a log transform' : 'on the original scale')), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 30, B: 246, xl: lo, xh: hi, yl: 0, yh: mx * 1.1, xticks: logt ? [3.5, 4, 4.5, 5, 5.5, 6] : [0, 100000, 200000, 300000], xfmt: logt ? null : function (q) { return q ? (q / 1000) + 'k' : '0'; }, yticks: [], xlab: logt ? 'log10(income)' : 'Income (synthetic)', ylab: 'Count' });
      bins.forEach(function (n, k) { var x0 = P.X(lo + (hi - lo) * k / nb), x1 = P.X(lo + (hi - lo) * (k + 1) / nb); el('rect', { x: x0, y: P.Y(n), width: Math.max(0.5, x1 - x0 - 1), height: P.Y(0) - P.Y(n), fill: OI[0], 'fill-opacity': 0.7 }, svg); });
      [[mu, OI[3], 'mean'], [med, OI[2], 'median']].forEach(function (q, j) { el('line', { x1: P.X(q[0]), y1: P.Y(0), x2: P.X(q[0]), y2: 30, stroke: q[1], 'stroke-width': 2 }, svg); txt(svg, P.X(q[0]) + (j ? -4 : 4), 24, q[2], { anchor: j ? 'end' : 'start', size: fs(10), fill: q[1], weight: 600 }); });
      var back = Math.pow(10, mu);
      out.innerHTML = (logt ? 'After taking logs the histogram is a symmetric bell, and the mean and median agree. Converting the mean of the logs back, 10<sup>' + fmt(mu, 3) + '</sup> = ' + fmt(back, 0) + ', gives the <strong>geometric mean</strong>, close to the median.' : 'The incomes are strongly right-skewed: a long tail of high values pulls the mean (' + fmt(mu, 0) + ') well above the median (' + fmt(med, 0) + ').') + NOTE + 'Many positive quantities, such as incomes, city sizes, concentrations and reaction times, arise from multiplying many factors, and come out <em>log-normal</em>. A log transform makes them symmetric, steadies their spread, and turns multiplicative effects into additive ones, so standard methods such as t-tests and linear regression work better. A difference of 0.1 in log<sub>10</sub> is a factor of 1.26 in the original units.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Benford's law
     ----------------------------------------------------------------------- */
  FIG['fig-benford'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 0;
    var SETS = ['Powers of 2', 'Fibonacci numbers', 'Multiplied growth', 'Uniform 1–999', 'Adult heights (cm)'];
    var controls = div('fig-controls', container);
    choice(controls, 'Numbers', SETS, k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function lead(x) { return Math.floor(x / Math.pow(10, Math.floor(Math.log10(x)))); }
    function data() {
      var d = [], r = rngSeed(5 + k), i;
      if (k === 0) { for (i = 0; i < 1000; i++) d.push(lead10(i * Math.LN2 / Math.LN10)); return d; }
      if (k === 1) { for (i = 1; i <= 1000; i++) { var phi = (1 + Math.sqrt(5)) / 2, l = i * Math.log10(phi) - Math.log10(Math.sqrt(5)); d.push(lead10(l)); } return d; }
      if (k === 2) { for (i = 0; i < 3000; i++) { var v = 100; for (var j = 0; j < 30; j++) v *= Math.exp(0.3 * rnorm(r)); d.push(lead(v)); } return d; }
      if (k === 3) { for (i = 0; i < 3000; i++) d.push(lead(1 + Math.floor(999 * r()))); return d; }
      for (i = 0; i < 3000; i++) d.push(lead(170 + 9 * rnorm(r))); return d;
    }
    function lead10(l) { var f = l - Math.floor(l); return Math.min(9, Math.floor(Math.pow(10, f) + 1e-9)); }
    function draw() {
      var d = data(), c = C(), freq = [];
      for (var g = 1; g <= 9; g++) freq.push(d.filter(function (x) { return x === g; }).length / d.length);
      var A = newSVG(svgWrap, container, 290, 'First-digit frequencies compared with Benford’s law'), W = A.W, svg = A.svg, fs = A.fs;
      var top = Math.max(0.35, Math.max.apply(null, freq) * 1.05);
      var P = plotAxes(svg, c, fs, { L: 48, R: W - 16, T: 24, B: 246, xl: 0.5, xh: 9.5, yl: 0, yh: top, xticks: [1, 2, 3, 4, 5, 6, 7, 8, 9], yticks: [0, 0.1, 0.2, 0.3].concat(top > 0.45 ? [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].filter(function (q) { return q <= top; }) : []), yfmt: function (q) { return Math.round(q * 100) + '%'; }, xlab: 'First digit', ylab: 'Share of numbers' });
      var bw = (P.X(2) - P.X(1)) * 0.6;
      freq.forEach(function (f, i) { el('rect', { x: P.X(i + 1) - bw / 2, y: P.Y(f), width: bw, height: P.Y(0) - P.Y(f), fill: OI[0], 'fill-opacity': 0.7 }, svg); });
      var pth = ''; for (var q = 1; q <= 9; q++) { pth += (pth ? 'L' : 'M') + P.X(q) + ' ' + P.Y(Math.log10(1 + 1 / q)); }
      el('path', { d: pth, fill: 'none', stroke: OI[3], 'stroke-width': 2 }, svg);
      for (q = 1; q <= 9; q++) lgDot(svg, P.X(q), P.Y(Math.log10(1 + 1 / q)), OI[3], 3.5);
      legend(svg, c, fs, W, 'bars: the chosen numbers    red: Benford, log10(1 + 1/d)', 'bars: data · red: Benford');
      var dev = 0; freq.forEach(function (f, i) { dev = Math.max(dev, Math.abs(f - Math.log10(2 + i) + Math.log10(1 + i))); });
      var msg = ['The first 1,000 powers of 2 follow Benford’s law almost perfectly.', 'Fibonacci numbers grow by a nearly constant factor (about 1.618), so they too follow the law.', 'Numbers made by multiplying many random growth factors spread evenly on a log scale and follow the law.', 'Numbers spread evenly between 1 and 999 do not: every first digit appears about one time in nine.', 'Heights cluster in a narrow range (150–190 cm), so nearly all start with 1. A quantity must span several factors of ten for Benford’s law to apply.'][k];
      out.innerHTML = 'The digit 1 leads <strong>' + fmt(100 * freq[0], 1) + '%</strong> of these numbers (Benford predicts 30.1%). Largest gap from the law: ' + fmt(100 * dev, 1) + ' percentage points. ' + msg + NOTE + 'If numbers are spread evenly on a <em>logarithmic</em> scale, the chance of starting with digit d is the width of the stretch from log d to log(d + 1): log<sub>10</sub>(1 + 1/d). The stretch from 1 to 2 covers 30% of each factor of ten, the stretch from 9 to 10 under 5%.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: ln(1 + x) ≈ x and log differences as percentages
     ----------------------------------------------------------------------- */
  FIG['fig-log-approx'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var x = 0.1;
    var controls = div('fig-controls', container);
    var sx = FIG.slider(controls, { id: 'lg-ax', label: 'Change x', min: -0.6, max: 1.5, step: 0.01, value: x, onChange: function (z) { x = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sx, (x >= 0 ? '+' : '') + fmt(100 * x, 0) + '%');
      var c = C(), A = newSVG(svgWrap, container, 300, 'The curve ln(1 + x) and its tangent line y = x at zero'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 16, T: 20, B: 252, xl: -0.6, xh: 1.5, yl: -1, yh: 1.5, xticks: [-0.5, 0, 0.5, 1, 1.5], yticks: [-1, -0.5, 0, 0.5, 1, 1.5], xlab: 'x', ylab: '' });
      el('line', { x1: P.X(-0.6), y1: P.Y(0), x2: P.X(1.5), y2: P.Y(0), stroke: c.faint }, svg); el('line', { x1: P.X(0), y1: P.Y(-1), x2: P.X(0), y2: P.Y(1.5), stroke: c.faint }, svg);
      el('rect', { x: P.X(-0.1), y: 20, width: P.X(0.1) - P.X(-0.1), height: 232, fill: OI[2], 'fill-opacity': 0.08 }, svg);
      plotLine(svg, P, function (t) { return t; }, -0.6, 1.5, 2, OI[3], 1.8, '5 4');
      plotLine(svg, P, function (t) { return Math.log(1 + t); }, -0.6, 1.5, 300, OI[0], 2.4);
      el('line', { x1: P.X(x), y1: P.Y(x), x2: P.X(x), y2: P.Y(Math.log(1 + x)), stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      lgDot(svg, P.X(x), P.Y(Math.log(1 + x)), OI[0]); lgDot(svg, P.X(x), P.Y(x), OI[3], 4);
      legend(svg, c, fs, W, 'blue: ln(1 + x)    red dashed: y = x    green band: |x| < 10%', 'blue ln(1+x) · red y = x');
      var l = Math.log(1 + x);
      out.innerHTML = 'A change of ' + (x >= 0 ? '+' : '') + fmt(100 * x, 0) + '% has natural-log change ln(1 + ' + fmt(x, 2) + ') = <strong>' + fmt(l, 4) + '</strong>' + (Math.abs(x) > 0.005 ? '; the approximation x is off by ' + fmt(100 * Math.abs(x - l) / Math.abs(l), 1) + '%.' : '.') + NOTE + 'Near zero, ln(1 + x) ≈ x, because the slope of ln at 1 is 1/1 = 1. So small differences in natural logs read directly as percentage changes: a rise from 100 to 105 is ln 1.05 = 0.049. Log changes also add up and are symmetric (up 10% then down by the same log step returns you to the start), which is why economists and biologists prefer them to percentages for large changes.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-log'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is log₁₀(1000)?', options: ['10', '3', '100', '0.001'], answer: 1, explanation: '10³ = 1000.' },
      { question: 'log(a × b) equals…', options: ['log a × log b', 'log a + log b', 'log(a + b)', 'log a − log b'], answer: 1, explanation: 'This is the rule that made logarithms famous: it turns multiplication into addition.' },
      { question: 'In NumPy, np.log(100) returns about…', options: ['2', '4.605', '6.644', '10'], answer: 1, explanation: 'np.log is the natural log, ln 100 ≈ 4.605. Use np.log10 for base 10.' },
      { question: 'An investment grows 7% a year. Roughly how long until it doubles?', options: ['7 years', '10 years', '14 years', '70 years'], answer: 1, explanation: 'Rule of 70: 70 / 7 = 10 years (exactly 10.24).' },
      { question: 'Lemon juice has pH about 2.5 and tomato juice about 4.5. How many times more hydrogen ions per litre does lemon juice have?', options: ['2', '20', '100', '1.8'], answer: 2, explanation: 'Two pH units is a factor of 10² = 100.' },
      { question: 'Who made logarithms with base 10 standard?', options: ['John Napier', 'Henry Briggs', 'Leonhard Euler', 'Isaac Newton'], answer: 1, explanation: 'Briggs proposed log 1 = 0 and log 10 = 1 and computed the first tables.' },
      { question: 'On a log–log plot, a power law y = a·xᵇ appears as…', options: ['An exponential curve', 'A straight line with slope b', 'A parabola', 'A horizontal line'], answer: 1, explanation: 'log y = log a + b log x.' },
      { question: 'How many bits of information does one toss of a fair coin give?', options: ['0', '0.5', '1', '2'], answer: 2, explanation: '−log₂(½) = 1 bit.' },
      { question: 'About how many comparisons does binary search need for a sorted list of one million items?', options: ['20', '1,000', '500,000', '1,000,000'], answer: 0, explanation: 'log₂(1,000,000) ≈ 19.9.' },
      { question: 'According to Benford’s law, about what share of numbers in many real data sets start with 1?', options: ['11%', '20%', '30%', '50%'], answer: 2, explanation: 'log₁₀(2) ≈ 0.301.' }
    ]);
  };
})();
