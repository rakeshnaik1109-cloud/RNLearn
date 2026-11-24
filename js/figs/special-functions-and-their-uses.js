/* ==========================================================================
   RNLearn — Special Functions and Their Uses
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
    { name: 'Euler’s century', color: '#b45309' },
    { name: 'Physics of waves and heat', color: '#7c3aed' },
    { name: 'Quantum age', color: '#15803d' },
    { name: 'Computing', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1729', icon: 'Γ', era: 0, sec: 4, title: 'Factorials between the integers', text: 'In letters to Christian Goldbach, Leonhard Euler finds a formula that gives n! for whole numbers and also makes sense in between: the gamma function.' },
    { year: '1732', icon: '⛓️', era: 0, sec: 7, title: 'A hanging chain', text: 'Daniel Bernoulli analyses the swinging of a heavy hanging chain and meets the series now called the Bessel function J₀.' },
    { year: '1785', icon: '🌍', era: 0, sec: 8, title: 'Legendre polynomials', text: 'Adrien-Marie Legendre expands the gravitational attraction of a spheroid in the polynomials that bear his name.' },
    { year: '1812', icon: '∑', era: 1, sec: 15, title: 'The hypergeometric series', text: 'Carl Friedrich Gauss publishes a systematic study of the hypergeometric series, which contains many other functions as special cases.' },
    { year: '1818', icon: '🌗', era: 1, sec: 13, title: 'Fresnel’s diffraction', text: 'Augustin Fresnel’s prize memoir on diffraction uses the integrals now named after him to predict the fringes beside a shadow.' },
    { year: '1824', icon: '🪐', era: 1, sec: 7, title: 'Bessel’s functions', text: 'Friedrich Wilhelm Bessel studies the functions systematically while calculating how the Sun’s motion disturbs the planets.' },
    { year: '1825', icon: '🕰️', era: 1, sec: 12, title: 'Elliptic integrals', text: 'Legendre begins publishing his Traité des fonctions elliptiques, the fruit of decades of work; Abel and Jacobi soon turn the subject inside out.' },
    { year: '1838', icon: '🌈', era: 1, sec: 11, title: 'The Airy function', text: 'George Biddell Airy computes the brightness of light near a caustic, explaining the faint extra bows inside a rainbow.' },
    { year: '1854', icon: '⚙️', era: 1, sec: 10, title: 'Chebyshev’s polynomials', text: 'Pafnuty Chebyshev, studying the linkages of steam engines, introduces the polynomials that give the best approximations.' },
    { year: '1859', icon: 'ζ', era: 1, sec: 14, title: 'Riemann’s zeta function', text: 'Bernhard Riemann extends the zeta function to complex numbers and links its zeros to the primes.' },
    { year: '1871', icon: '📉', era: 1, sec: 6, title: 'The name “erf”', text: 'James Whitbread Lee Glaisher names the error function and gives it the symbol erf.' },
    { year: '1926', icon: '⚛️', era: 2, sec: 9, title: 'Schrödinger’s equation', text: 'Erwin Schrödinger solves the hydrogen atom: its wavefunctions are built from Laguerre polynomials and spherical harmonics.' },
    { year: '1964', icon: '📕', era: 3, sec: 17, title: 'Abramowitz and Stegun', text: 'The US National Bureau of Standards publishes the Handbook of Mathematical Functions, one of the most cited books in science.' },
    { year: '1996', icon: 'W', era: 3, sec: 16, title: 'Lambert W named', text: 'Corless, Gonnet, Hare, Jeffrey and Knuth publish the paper that names and popularises the Lambert W function.' },
    { year: '2010', icon: '🌐', era: 3, sec: 17, title: 'The DLMF', text: 'NIST releases the Digital Library of Mathematical Functions online and in print, the successor to Abramowitz and Stegun.' }
  ];
  FIG['fig-sf-timeline'] = function (figEl) {
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

  /* ---------------- numerical helpers ---------------- */
  function sfGamma(x) { if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * sfGamma(1 - x)); return Math.exp(lgamma(x)); }
  function sfJ(n, x) { var N = 96, s = 0; for (var k = 0; k < N; k++) { var t = 2 * Math.PI * k / N; s += Math.cos(n * t - x * Math.sin(t)); } return s / N; }
  function sfJZeros(n, count) { var z = [], x = 0.5, step = 0.05, prev = sfJ(n, x); while (z.length < count && x < 60) { var nx = x + step, v = sfJ(n, nx); if (prev === 0 || prev * v < 0) { var lo = x, hi = nx; for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (sfJ(n, lo) * sfJ(n, m) <= 0) hi = m; else lo = m; } z.push((lo + hi) / 2); } x = nx; prev = v; } return z; }
  function sfLegendre(l, x) { if (l === 0) return 1; var p0 = 1, p1 = x; for (var k = 1; k < l; k++) { var p2 = ((2 * k + 1) * x * p1 - k * p0) / (k + 1); p0 = p1; p1 = p2; } return p1; }
  function sfPsi(n, x) { var p0 = Math.pow(Math.PI, -0.25) * Math.exp(-x * x / 2); if (n === 0) return p0; var p1 = Math.SQRT2 * x * p0; for (var k = 1; k < n; k++) { var p2 = Math.sqrt(2 / (k + 1)) * x * p1 - Math.sqrt(k / (k + 1)) * p0; p0 = p1; p1 = p2; } return p1; }
  function sfAiry(x) {
    if (x < -7) { var z = -x, ze = 2 / 3 * Math.pow(z, 1.5), a = Math.pow(z, -0.25) / Math.sqrt(Math.PI), ph = ze + Math.PI / 4, c = 5 / 72 / ze;
      return [a * (Math.sin(ph) - c * Math.cos(ph)), a * (Math.cos(ph) + c * Math.sin(ph))]; }
    var x3 = x * x * x, f = 0, g = 0, t = 1, u = x;
    for (var k = 0; k < 200; k++) { f += t; g += u; t *= x3 / ((3 * k + 2) * (3 * k + 3)); u *= x3 / ((3 * k + 3) * (3 * k + 4)); if (Math.abs(t) < 1e-17 * Math.abs(f) && Math.abs(u) < 1e-17 * (Math.abs(g) + 1e-300)) break; }
    var c1 = 0.355028053887817, c2 = 0.258819403792807; return [c1 * f - c2 * g, Math.sqrt(3) * (c1 * f + c2 * g)];
  }
  function sfEllipK(k) { var a = 1, b = Math.sqrt(1 - k * k); for (var i = 0; i < 40; i++) { var an = (a + b) / 2; b = Math.sqrt(a * b); a = an; } return Math.PI / (2 * a); }
  var SF_FR = null;
  function sfFresnelTable() { if (SF_FR) return SF_FR; var h = 0.002, n = 3000, C = [0], S = [0]; for (var i = 1; i <= n; i++) { var t0 = (i - 1) * h, t1 = i * h, tm = (t0 + t1) / 2, f = function (q) { return q * q * Math.PI / 2; };
      C.push(C[i - 1] + h / 6 * (Math.cos(f(t0)) + 4 * Math.cos(f(tm)) + Math.cos(f(t1)))); S.push(S[i - 1] + h / 6 * (Math.sin(f(t0)) + 4 * Math.sin(f(tm)) + Math.sin(f(t1)))); }
    SF_FR = { h: h, n: n, C: C, S: S }; return SF_FR; }
  function sfFresnel(t) { var T = sfFresnelTable(), s = t < 0 ? -1 : 1, i = Math.min(T.n, Math.round(Math.abs(t) / T.h)); return [s * T.C[i], s * T.S[i]]; }
  function sfDiv(v) { var w = Math.max(-1, Math.min(1, v)), a = Math.abs(w), lo = [247, 247, 247], hi = w > 0 ? [178, 24, 43] : [33, 102, 172]; return 'rgb(' + lo.map(function (q, i) { return Math.round(q + (hi[i] - q) * a); }).join(',') + ')'; }
  function sfDot(svg, x, y, col, r) { el('circle', { cx: x, cy: y, r: r || 5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, svg); }
  function sfPath(svg, pts, col, w, dash) { var d = ''; pts.forEach(function (p) { if (!isFinite(p[1]) || !isFinite(p[0])) { d += ' '; return; } d += (d && d.slice(-1) !== ' ' ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }); el('path', { d: d.replace(/ M/g, 'M').trim(), fill: 'none', stroke: col, 'stroke-width': w || 2.2, 'stroke-dasharray': dash || 'none' }, svg); }

  /* -----------------------------------------------------------------------
     Figure: the gamma function
     ----------------------------------------------------------------------- */
  FIG['fig-gamma'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var x = 3.5;
    var controls = div('fig-controls', container);
    var sx = FIG.slider(controls, { id: 'sf-gx', label: 'x', min: -4.5, max: 5.5, step: 0.05, value: x, onChange: function (z) { x = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sx, fmt(x, 2));
      var c = C(), A = newSVG(svgWrap, container, 300, 'The gamma function, which passes through the factorials and has poles at zero and the negative integers'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 16, B: 252, xl: -4.5, xh: 5.5, yl: -8, yh: 26, xticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5], yticks: [-5, 0, 5, 10, 15, 20, 25], xlab: 'x', ylab: 'Γ(x)' });
      el('line', { x1: P.X(-4.5), y1: P.Y(0), x2: P.X(5.5), y2: P.Y(0), stroke: c.faint }, svg);
      for (var p = 0; p >= -4; p--) el('line', { x1: P.X(p), y1: 16, x2: P.X(p), y2: 252, stroke: c.faint, 'stroke-dasharray': '3 4' }, svg);
      var pts = []; for (var i = 0; i <= 1600; i++) { var t = -4.5 + 10 * i / 1600, v = Math.abs(t - Math.round(t)) < 0.004 && t < 0.3 ? NaN : sfGamma(t); pts.push([P.X(t), Math.abs(v) > 40 ? NaN : P.Y(Math.max(-9, Math.min(27, v)))]); }
      var g = el('g', { 'clip-path': P.clip }, svg); sfPath(g, pts, OI[0], 2.3);
      for (var n = 1; n <= 5; n++) { sfDot(svg, P.X(n), P.Y(sfGamma(n)), OI[3], 4); if (W > 500 || n > 2) txt(svg, P.X(n) + (n < 3 ? 0 : -6), P.Y(sfGamma(n)) - 9, (n - 1) + '!', { anchor: n < 3 ? 'middle' : 'end', size: fs(9), fill: OI[3] }); }
      var pole = x <= 0 && Math.abs(x - Math.round(x)) < 1e-9, v = pole ? NaN : sfGamma(x);
      if (!pole && Math.abs(v) < 26) sfDot(svg, P.X(x), P.Y(v), OI[0]);
      var whole = Math.abs(x - Math.round(x)) < 1e-9 && x > 0;
      out.innerHTML = (pole ? 'Γ(' + fmt(x, 0) + ') is <strong>undefined</strong>: the function shoots off to ±∞ at zero and every negative integer.' : 'Γ(' + fmt(x, 2) + ') = <strong>' + (Math.abs(v) > 1e4 ? sciHTML(v, 3) : fmt(v, 4)) + '</strong>' + (whole ? ' = ' + fmt(x - 1, 0) + '!' : '') + (Math.abs(x - 0.5) < 1e-9 ? ' = √π' : '') + '.') + NOTE + 'The gamma function joins the dots of the factorials, 0! = 1, 1! = 1, 2! = 2, 3! = 6, 4! = 24, with a smooth curve, shifted by one: Γ(n) = (n − 1)!. It obeys Γ(x + 1) = x Γ(x) everywhere, which lets it continue to the left of zero, where it has a pole at every non-positive integer. Try x = 0.5: Γ(½) = √π ≈ 1.7725, which is why π turns up in the volume of a sphere in any number of dimensions.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the beta distribution
     ----------------------------------------------------------------------- */
  FIG['fig-beta'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 3, b = 2;
    var controls = div('fig-controls', container);
    var sa = FIG.slider(controls, { id: 'sf-ba', label: 'a (successes + 1)', min: 0.5, max: 20, step: 0.5, value: a, onChange: function (z) { a = z; draw(); } });
    var sb = FIG.slider(controls, { id: 'sf-bb', label: 'b (failures + 1)', min: 0.5, max: 20, step: 0.5, value: b, onChange: function (z) { b = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sa, fmt(a, 1)); valText(sb, fmt(b, 1));
      var lB = lgamma(a) + lgamma(b) - lgamma(a + b), f = function (p) { return p <= 0 || p >= 1 ? NaN : Math.exp((a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p) - lB); };
      var mx = 0; for (var i = 1; i < 400; i++) mx = Math.max(mx, f(i / 400)); var top = Math.min(Math.max(2, mx * 1.1), 12), yt = niceTicks(0, top, 4);
      var c = C(), A = newSVG(svgWrap, container, 290, 'The beta distribution with the chosen parameters a and b'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 16, B: 246, xl: 0, xh: 1, yl: 0, yh: top, xticks: [0, 0.25, 0.5, 0.75, 1], yticks: yt.filter(function (q) { return q <= top; }), xlab: 'Probability p', ylab: 'Density' });
      var pts = [[P.X(0.0005), P.Y(0)]]; for (i = 1; i < 600; i++) { var p = i / 600, v = f(p); pts.push([P.X(p), P.Y(Math.min(v, top * 1.05))]); } pts.push([P.X(0.9995), P.Y(0)]);
      var g = el('g', { 'clip-path': P.clip }, svg);
      el('path', { d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z', fill: OI[0], 'fill-opacity': 0.2, stroke: OI[0], 'stroke-width': 2.2 }, g);
      var m = a / (a + b); el('line', { x1: P.X(m), y1: P.Y(0), x2: P.X(m), y2: 16, stroke: OI[3], 'stroke-dasharray': '4 3' }, svg); txt(svg, P.X(m) + (m > 0.8 ? -4 : 4), 28, 'mean ' + fmt(m, 2), { anchor: m > 0.8 ? 'end' : 'start', size: fs(10), fill: OI[3] });
      out.innerHTML = 'B(' + fmt(a, 1) + ', ' + fmt(b, 1) + ') = Γ(a)Γ(b)/Γ(a + b) = <strong>' + (Math.exp(-lB) > 1e4 ? sciHTML(Math.exp(lB), 3) : Math.exp(lB) < 1e-4 ? sciHTML(Math.exp(lB), 3) : fmt(Math.exp(lB), 5)) + '</strong>. Mean of the distribution: ' + fmt(m, 3) + '.' + NOTE + 'The beta function is the area under p<sup>a−1</sup>(1 − p)<sup>b−1</sup>; dividing by it makes the curve a probability distribution. With a − 1 successes and b − 1 failures and a flat starting belief, this curve is what Bayes’ rule says about an unknown success rate: try a = 8, b = 4 (7 successes, 3 failures), then a = 15, b = 7, and watch the belief narrow around the same rate.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the error function and the normal distribution
     ----------------------------------------------------------------------- */
  FIG['fig-erf'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 1, tail = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Shade', ['Within ±k sd', 'Beyond +k sd'], tail, function (i) { tail = i; draw(); });
    var sk = FIG.slider(controls, { id: 'sf-ek', label: 'k (standard deviations)', min: 0, max: 4, step: 0.05, value: k, onChange: function (z) { k = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function erf(x) { return 1 - erfc(x); }
    function draw() {
      valText(sk, fmt(k, 2));
      var c = C(), A = newSVG(svgWrap, container, 280, 'A normal distribution with the chosen region shaded'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 16, T: 16, B: 238, xl: -4, xh: 4, yl: 0, yh: 0.45, xticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yticks: [], xlab: 'Standard deviations from the mean', ylab: '' });
      var lo = tail ? k : -k, hi = tail ? 4 : k, pts = [P.X(lo) + ' ' + P.Y(0)];
      for (var i = 0; i <= 200; i++) { var t = lo + (hi - lo) * i / 200; pts.push(P.X(t).toFixed(1) + ' ' + P.Y(npdf(t)).toFixed(1)); } pts.push(P.X(hi) + ' ' + P.Y(0));
      if (hi > lo) el('path', { d: 'M' + pts.join('L') + 'Z', fill: tail ? OI[3] : OI[0], 'fill-opacity': 0.35 }, svg);
      plotLine(svg, P, npdf, -4, 4, 300, c.ink, 2);
      var within = erf(k / Math.SQRT2), up = 0.5 * erfc(k / Math.SQRT2);
      out.innerHTML = (tail ? 'Probability of landing more than ' + fmt(k, 2) + ' sd <em>above</em> the mean: ½ erfc(' + fmt(k, 2) + '/√2) = <strong>' + (up < 1e-3 ? sciHTML(up, 3) : fmt(up, 5)) + '</strong>' + (up > 0 ? ', about 1 in ' + fmt(1 / up, 0) : '') + '.' : 'Probability of landing within ±' + fmt(k, 2) + ' sd of the mean: erf(' + fmt(k, 2) + '/√2) = <strong>' + fmt(within, 5) + '</strong> (' + fmt(100 * within, 2) + '%).') + NOTE + 'The area under the bell curve has no formula in terms of powers, roots, exponentials or logs: it needs a new function, the error function erf. The 68–95–99.7 rule is just erf(1/√2), erf(2/√2) and erf(3/√2). Particle physicists announce a discovery at 5 sd, a one-sided tail of about 1 in 3.5 million.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Bessel functions and drum modes
     ----------------------------------------------------------------------- */
  FIG['fig-drum'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 0, m = 1, phase = 0, anim = null;
    var controls = div('fig-controls', container);
    choice(controls, 'Nodal diameters n', ['0', '1', '2', '3'], n, function (i) { n = i; prep(); draw(); });
    choice(controls, 'Ring m', ['1', '2', '3'], m - 1, function (i) { m = i + 1; prep(); draw(); });
    var row = group(controls, 'Motion'); var bP = btn('Vibrate', row);
    var cells = [];
    function paint() { var amp = Math.cos(phase * 2 * Math.PI); cells.forEach(function (q) { var col = sfDiv(amp * q[1]); q[0].setAttribute('fill', col); q[0].setAttribute('stroke', col); }); }
    function loop(ts) { if (!anim) return; phase = ts / 900; paint(); anim = window.requestAnimationFrame(loop); }
    bP.addEventListener('click', function () { if (anim) { window.cancelAnimationFrame(anim); anim = null; bP.textContent = 'Vibrate'; phase = 0; paint(); } else { bP.textContent = 'Stop'; anim = window.requestAnimationFrame(loop); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var Z = {}, k, ring;
    function zeros(q) { if (!Z[q]) Z[q] = sfJZeros(q, 3); return Z[q]; }
    var R = 26, S = 72;
    function prep() { k = zeros(n)[m - 1]; ring = []; for (var i = 0; i < R; i++) ring.push(sfJ(n, k * (i + 0.5) / R)); }
    prep();
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = narrow ? 520 : 290;
      var A = newSVG(svgWrap, container, H, 'A circular drum vibrating in the chosen mode, and the Bessel function that shapes it'), W = A.W, svg = A.svg, fs = A.fs;
      var rad = narrow ? Math.min(W / 2 - 20, 120) : 120, cx = narrow ? W / 2 : 20 + rad, cy = 20 + rad, amp = Math.cos(phase * 2 * Math.PI);
      var mx = 0; ring.forEach(function (v) { mx = Math.max(mx, Math.abs(v)); }); cells = [];
      for (var i = 0; i < R; i++) for (var j = 0; j < S; j++) {
        var r0 = rad * i / R, r1 = rad * (i + 1) / R, a0 = 2 * Math.PI * j / S, a1 = 2 * Math.PI * (j + 1) / S, v = amp * ring[i] / mx * Math.cos(n * (a0 + a1) / 2);
        cells.push([el('path', { d: 'M' + (cx + r0 * Math.cos(a0)).toFixed(1) + ' ' + (cy + r0 * Math.sin(a0)).toFixed(1) + 'L' + (cx + r1 * Math.cos(a0)).toFixed(1) + ' ' + (cy + r1 * Math.sin(a0)).toFixed(1) + 'L' + (cx + r1 * Math.cos(a1)).toFixed(1) + ' ' + (cy + r1 * Math.sin(a1)).toFixed(1) + 'L' + (cx + r0 * Math.cos(a1)).toFixed(1) + ' ' + (cy + r0 * Math.sin(a1)).toFixed(1) + 'Z', fill: sfDiv(v), stroke: sfDiv(v), 'stroke-width': 0.4 }, svg), ring[i] / mx * Math.cos(n * (a0 + a1) / 2)]);
      }
      el('circle', { cx: cx, cy: cy, r: rad, fill: 'none', stroke: c.ink2, 'stroke-width': 2 }, svg);
      var L = narrow ? 44 : cx + rad + 60, T = narrow ? 2 * rad + 60 : 20, B = narrow ? H - 40 : 252;
      var P = plotAxes(svg, c, fs, { L: L, R: W - 16, T: T, B: B, xl: 0, xh: 12, yl: -0.45, yh: 1.05, xticks: [0, 2, 4, 6, 8, 10, 12], yticks: [-0.4, 0, 0.5, 1], xlab: 'x', ylab: '' });
      txt(svg, L - 8, T - 6, 'J' + n + '(x)', { anchor: 'start', size: fs(10), fill: OI[0], weight: 600 });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(12), y2: P.Y(0), stroke: c.faint }, svg);
      el('rect', { x: P.X(0), y: T, width: P.X(k) - P.X(0), height: B - T, fill: OI[2], 'fill-opacity': 0.08 }, svg);
      plotLine(svg, P, function (q) { return sfJ(n, q); }, 0, 12, 300, OI[0], 2.2);
      zeros(n).forEach(function (z, i) { if (z <= 12) sfDot(svg, P.X(z), P.Y(0), i === m - 1 ? OI[3] : c.faint, i === m - 1 ? 5 : 3.5); });
      var f01 = zeros(0)[0], ratio = k / f01;
      out.innerHTML = 'Mode (n = ' + n + ', m = ' + m + '): the drum’s edge sits at the zero x = ' + fmt(k, 3) + ' of J<sub>' + n + '</sub>, so this mode vibrates at <strong>' + fmt(ratio, 3) + '</strong> times the fundamental frequency.' + NOTE + 'The radial shape of each mode is a Bessel function J<sub>n</sub> stretched so that one of its zeros falls on the rim (the green band is the part used). Its frequency is proportional to that zero. The ratios 1, 1.593, 2.136, 2.295, 2.653… are not whole numbers, which is why a drum has no clear musical pitch, unlike a string with its harmonics 1, 2, 3, 4…</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Legendre polynomials and their polar shapes
     ----------------------------------------------------------------------- */
  FIG['fig-legendre'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var l = 2;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'sf-l', label: 'Degree l', min: 0, max: 8, step: 1, value: l, onChange: function (z) { l = Math.round(z); draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sl, String(l));
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = narrow ? 575 : 290;
      var A = newSVG(svgWrap, container, H, 'The Legendre polynomial of the chosen degree, and the same function drawn as a shape around an axis'), W = A.W, svg = A.svg, fs = A.fs;
      var R1 = narrow ? W - 16 : W * 0.56, B1 = narrow ? 250 : 252;
      var P = plotAxes(svg, c, fs, { L: 44, R: R1, T: 16, B: B1, xl: -1, xh: 1, yl: -1.05, yh: 1.05, xticks: [-1, -0.5, 0, 0.5, 1], yticks: [-1, -0.5, 0, 0.5, 1], xlab: 'x = cos θ', ylab: 'P' + l + '(x)' });
      el('line', { x1: P.X(-1), y1: P.Y(0), x2: P.X(1), y2: P.Y(0), stroke: c.faint }, svg);
      for (var q = 0; q < l; q++) plotLine(svg, P, function (x) { return sfLegendre(q, x); }, -1, 1, 120, c.faint, 1);
      plotLine(svg, P, function (x) { return sfLegendre(l, x); }, -1, 1, 300, OI[0], 2.4);
      var cx = narrow ? W / 2 : (R1 + W) / 2 + 10, cy = narrow ? B1 + 180 : 140, rad = narrow ? 120 : Math.min(120, (W - R1) / 2 - 10);
      el('line', { x1: cx, y1: cy - rad - 8, x2: cx, y2: cy + rad + 8, stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
      for (var i = 0; i < 360; i++) { var t0 = 2 * Math.PI * i / 360, t1 = 2 * Math.PI * (i + 1) / 360, v = sfLegendre(l, Math.cos((t0 + t1) / 2)), r = rad * Math.abs(v);
        el('path', { d: 'M' + cx + ' ' + cy + 'L' + (cx + r * Math.sin(t0)).toFixed(1) + ' ' + (cy - r * Math.cos(t0)).toFixed(1) + 'L' + (cx + r * Math.sin(t1)).toFixed(1) + ' ' + (cy - r * Math.cos(t1)).toFixed(1) + 'Z', fill: v >= 0 ? OI[3] : OI[0], 'fill-opacity': 0.75, stroke: 'none' }, svg); }
      txt(svg, cx, cy - rad - 12, 'axis', { size: fs(9), fill: c.muted });
      var roots = 0; for (var j = 0; j < 400; j++) if (sfLegendre(l, -1 + j / 200) * sfLegendre(l, -1 + (j + 1) / 200) < 0) roots++;
      out.innerHTML = 'P<sub>' + l + '</sub> has degree ' + l + ' and <strong>' + roots + '</strong> zero' + (roots === 1 ? '' : 's') + ' between −1 and 1, which become ' + roots + ' nodal cone' + (roots === 1 ? '' : 's') + ' in the shape on the right (red positive, blue negative).' + NOTE + 'Legendre polynomials describe how anything spread around an axis varies with angle: the bulge of the Earth’s gravity field, the radiation pattern of an antenna, the angular shape of a p or d orbital (l = 1 and 2 with m = 0). Each new degree adds one more lobe. Grey curves are the lower degrees, which are all <em>orthogonal</em> to this one.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: quantum harmonic oscillator
     ----------------------------------------------------------------------- */
  FIG['fig-oscillator'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 0, prob = 0;
    var controls = div('fig-controls', container);
    var sn = FIG.slider(controls, { id: 'sf-on', label: 'Energy level n', min: 0, max: 20, step: 1, value: n, onChange: function (z) { n = Math.round(z); draw(); } });
    choice(controls, 'Show', ['Wavefunction ψ', 'Probability |ψ|²'], prob, function (i) { prob = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sn, String(n));
      var E = n + 0.5, A0 = Math.sqrt(2 * E), xm = Math.max(4.5, A0 + 2), c = C();
      var A = newSVG(svgWrap, container, 300, 'Wavefunction of the quantum harmonic oscillator at the chosen energy level'), W = A.W, svg = A.svg, fs = A.fs;
      var top = prob ? 0.65 : 0.8, P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 16, B: 252, xl: -xm, xh: xm, yl: prob ? 0 : -top, yh: top, xticks: niceTicks(-xm, xm, 6).filter(function (q) { return Math.abs(q) <= xm; }), yticks: [], xlab: 'Position x', ylab: prob ? 'Probability density' : 'ψ(x)' });
      if (!prob) el('line', { x1: P.X(-xm), y1: P.Y(0), x2: P.X(xm), y2: P.Y(0), stroke: c.faint }, svg);
      [-A0, A0].forEach(function (t) { el('line', { x1: P.X(t), y1: 16, x2: P.X(t), y2: 252, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg); });
      el('rect', { x: P.X(-xm), y: 16, width: P.X(-A0) - P.X(-xm), height: 236, fill: c.faint, 'fill-opacity': 0.15 }, svg); el('rect', { x: P.X(A0), y: 16, width: P.X(xm) - P.X(A0), height: 236, fill: c.faint, 'fill-opacity': 0.15 }, svg);
      if (prob) plotLine(svg, P, function (x) { return Math.abs(x) < A0 * 0.999 ? 1 / (Math.PI * Math.sqrt(A0 * A0 - x * x)) : NaN; }, -A0 * 0.999, A0 * 0.999, 300, OI[3], 1.8, '5 4');
      plotLine(svg, P, function (x) { var p = sfPsi(n, x); return prob ? p * p : p; }, -xm, xm, 600, OI[0], 2.2);
      var outside = 0, dx = 0.001; for (var x = A0 + dx / 2; x < A0 + 8; x += dx) { var p = sfPsi(n, x); outside += 2 * p * p * dx; }
      legend(svg, c, fs, W, prob ? 'blue: quantum probability    red dashed: classical ball    grey: forbidden classically' : 'shaded: beyond the classical turning points', prob ? 'blue quantum · red classical' : 'shaded: classically forbidden');
      out.innerHTML = 'Level n = ' + n + ': energy E = (n + ½)ħω = <strong>' + fmt(E, 1) + '</strong>ħω, with ' + n + ' node' + (n === 1 ? '' : 's') + '. Chance of finding the particle where a classical ball could never go: <strong>' + fmt(100 * outside, 1) + '%</strong>.' + NOTE + 'Each wavefunction is a Hermite polynomial times a Gaussian bell. The energy levels are equally spaced, a fact behind the vibrations of molecules, the quanta of light in a cavity and the phonons of a crystal. Switch to probability and raise n: the quantum pattern starts to follow the classical one (the ball spends most time near the turning points, where it moves slowest), as Bohr’s correspondence principle requires.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Runge's phenomenon and Chebyshev points
     ----------------------------------------------------------------------- */
  FIG['fig-runge'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 10, cheb = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Interpolation points', ['Equally spaced', 'Chebyshev'], cheb, function (i) { cheb = i; draw(); });
    var sn = FIG.slider(controls, { id: 'sf-rn', label: 'Polynomial degree', min: 2, max: 30, step: 1, value: n, onChange: function (z) { n = Math.round(z); draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function f(x) { return 1 / (1 + 25 * x * x); }
    function draw() {
      valText(sn, String(n));
      var xs = [], i, j; for (i = 0; i <= n; i++) xs.push(cheb ? Math.cos((2 * i + 1) * Math.PI / (2 * n + 2)) : -1 + 2 * i / n);
      var w = xs.map(function (xi, a) { var p = 1; xs.forEach(function (xk, b) { if (a !== b) p *= (xi - xk); }); return 1 / p; }), ys = xs.map(f);
      function pI(x) { var nu = 0, de = 0; for (var a = 0; a < xs.length; a++) { var d = x - xs[a]; if (Math.abs(d) < 1e-14) return ys[a]; var t = w[a] / d; nu += t * ys[a]; de += t; } return nu / de; }
      var err = 0; for (i = 0; i <= 2000; i++) { var x = -1 + i / 1000; err = Math.max(err, Math.abs(pI(x) - f(x))); }
      var c = C(), A = newSVG(svgWrap, container, 290, 'Polynomial interpolation of Runge’s function with ' + (cheb ? 'Chebyshev' : 'equally spaced') + ' points'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 24, B: 246, xl: -1, xh: 1, yl: -1, yh: 2, xticks: [-1, -0.5, 0, 0.5, 1], yticks: [-1, 0, 1, 2], xlab: 'x', ylab: '' });
      el('line', { x1: P.X(-1), y1: P.Y(0), x2: P.X(1), y2: P.Y(0), stroke: c.faint }, svg);
      plotLine(svg, P, f, -1, 1, 300, c.ink, 2.4);
      plotLine(svg, P, pI, -1, 1, 1200, cheb ? OI[2] : OI[3], 2);
      xs.forEach(function (x, a) { sfDot(svg, P.X(x), P.Y(ys[a]), cheb ? OI[2] : OI[3], 3.5); });
      legend(svg, c, fs, W, 'black: f(x) = 1/(1 + 25x²)    coloured: degree-' + n + ' polynomial through the dots', 'black f(x) · coloured: polynomial');
      out.innerHTML = 'Largest error of the degree-' + n + ' polynomial: <strong>' + (err > 1000 ? sciHTML(err, 2) : fmt(err, err < 0.01 ? 5 : 3)) + '</strong>.' + NOTE + (cheb ? 'Chebyshev points crowd towards the ends of the interval (they are the shadows of equally spaced points on a semicircle). With them the error shrinks steadily as the degree rises: Chebyshev polynomials are the basis of modern function approximation, from calculator chips to the Chebfun software.' : 'With equally spaced points the polynomial passes through every dot but swings wildly near the ends, and raising the degree makes it worse. Carl Runge described this in 1901. Switch to Chebyshev points.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Airy functions
     ----------------------------------------------------------------------- */
  FIG['fig-airy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, x = -2.34;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['Ai and Bi', 'Light near a caustic'], mode, function (i) { mode = i; draw(); });
    var sx = FIG.slider(controls, { id: 'sf-ax', label: 'x', min: -14, max: 3, step: 0.02, value: -2.34, onChange: function (z) { x = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(sx, fmt(x, 2));
      var c = C(), A = newSVG(svgWrap, container, 290, mode ? 'Light intensity near a caustic, proportional to the square of the Airy function' : 'The Airy functions Ai and Bi'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 44, R: W - 16, T: 24, B: 246, xl: -14, xh: 3, yl: mode ? 0 : -0.6, yh: mode ? 0.32 : 1.2, xticks: [-14, -12, -10, -8, -6, -4, -2, 0, 2], yticks: mode ? [0, 0.1, 0.2, 0.3] : [-0.5, 0, 0.5, 1], xlab: mode ? 'Distance across the caustic (scaled); dark side to the right' : 'x', ylab: '' });
      if (!mode) el('line', { x1: P.X(-14), y1: P.Y(0), x2: P.X(3), y2: P.Y(0), stroke: c.faint }, svg);
      el('line', { x1: P.X(0), y1: 24, x2: P.X(0), y2: 246, stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
      if (mode) { plotLine(svg, P, function (q) { var a = sfAiry(q)[0]; return a * a; }, -14, 3, 900, OI[1], 2.4); }
      else { plotLine(svg, P, function (q) { return sfAiry(q)[1]; }, -14, 3, 900, OI[3], 2); plotLine(svg, P, function (q) { return sfAiry(q)[0]; }, -14, 3, 900, OI[0], 2.4); }
      var v = sfAiry(x); sfDot(svg, P.X(x), P.Y(mode ? v[0] * v[0] : v[0]), mode ? OI[1] : OI[0]);
      legend(svg, c, fs, W, mode ? 'intensity ∝ Ai(x)²: bright main fringe, fainter fringes, then darkness' : 'blue: Ai(x)    red: Bi(x)', mode ? 'intensity ∝ Ai²' : 'blue Ai · red Bi');
      out.innerHTML = 'Ai(' + fmt(x, 2) + ') = <strong>' + fmt(v[0], 4) + '</strong>, Bi(' + fmt(x, 2) + ') = ' + (Math.abs(v[1]) > 100 ? fmt(v[1], 0) : fmt(v[1], 4)) + '.' + NOTE + (mode ? 'Where light rays fold back on themselves, as at the edge of a rainbow, ray optics predicts infinite brightness. Airy showed in 1838 that the wave intensity follows Ai²: a strong main bow, then fainter <em>supernumerary</em> bows on the bright side, and a smooth fade into the dark side. The spacing of the fringes depends on the size of the raindrops.' : 'The Airy equation y″ = x y describes any wave at a turning point: to the left it oscillates (like a wave in an allowed region), to the right it decays (Ai) or grows (Bi). It appears in quantum tunnelling, light near caustics, and waves in the ocean and atmosphere. The first zero of Ai is at x ≈ −2.338.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the pendulum period
     ----------------------------------------------------------------------- */
  FIG['fig-pendulum'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var th = 60;
    var controls = div('fig-controls', container);
    var st = FIG.slider(controls, { id: 'sf-pt', label: 'Amplitude (degrees)', min: 1, max: 179, step: 1, value: th, onChange: function (z) { th = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function ratio(d) { return 2 / Math.PI * sfEllipK(Math.sin(d * Math.PI / 360)); }
    function draw() {
      valText(st, fmt(th, 0) + '°');
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = narrow ? 470 : 290;
      var A = newSVG(svgWrap, container, H, 'Period of a pendulum compared with the small-swing formula, as the amplitude grows'), W = A.W, svg = A.svg, fs = A.fs;
      var R1 = narrow ? W - 16 : W * 0.66;
      var P = plotAxes(svg, c, fs, { L: 44, R: R1, T: 24, B: 252, xl: 0, xh: 180, yl: 0.9, yh: 4, xticks: [0, 30, 60, 90, 120, 150, 180], yticks: [1, 2, 3, 4], xlab: 'Amplitude (degrees)', ylab: 'Period ÷ small-swing period' });
      plotLine(svg, P, function () { return 1; }, 0, 180, 2, c.muted, 1.5, '5 4');
      plotLine(svg, P, function (d) { var t = d * Math.PI / 180; return 1 + t * t / 16; }, 0, 180, 200, OI[2], 1.6, '2 3');
      plotLine(svg, P, ratio, 0.5, 179.5, 400, OI[0], 2.4);
      sfDot(svg, P.X(th), P.Y(ratio(th)), OI[0]);
      legend(svg, c, fs, W, 'blue: exact, 4√(L/g) K(sin θ₀/2)    grey: 2π√(L/g)    green: 1 + θ₀²/16', 'blue exact · grey simple · green approx');
      var px = narrow ? W / 2 : (R1 + W) / 2 + 8, py = narrow ? 300 : 70, Lp = narrow ? 120 : Math.min(110, (W - R1) / 2 - 8), a = th * Math.PI / 180;
      el('path', { d: 'M' + (px + Lp * Math.sin(-a)).toFixed(1) + ' ' + (py + Lp * Math.cos(a)).toFixed(1) + ' A ' + Lp + ' ' + Lp + ' 0 ' + (a > Math.PI / 2 ? 1 : 0) + ' 0 ' + (px + Lp * Math.sin(a)).toFixed(1) + ' ' + (py + Lp * Math.cos(a)).toFixed(1), fill: 'none', stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
      el('line', { x1: px, y1: py, x2: px, y2: py + Lp, stroke: c.faint }, svg);
      el('line', { x1: px, y1: py, x2: px + Lp * Math.sin(a), y2: py + Lp * Math.cos(a), stroke: c.ink2, 'stroke-width': 2 }, svg);
      sfDot(svg, px + Lp * Math.sin(a), py + Lp * Math.cos(a), OI[3], 8); sfDot(svg, px, py, c.ink2, 3);
      var r = ratio(th);
      out.innerHTML = 'Released from ' + fmt(th, 0) + '°, a pendulum takes <strong>' + fmt(r, 4) + '</strong> times as long per swing as the textbook formula T = 2π√(L/g) predicts. For a 1 m pendulum: ' + fmt(2 * Math.PI * Math.sqrt(1 / 9.81) * r, 3) + ' s instead of 2.006 s.' + NOTE + 'The familiar formula assumes small swings. The exact period needs the complete elliptic integral of the first kind, K. The error is under 1% up to about 23°, but the period grows without limit as the amplitude nears 180°, where the bob balances upside down. Pendulum clocks keep their swings small for this reason.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the Cornu spiral and diffraction at an edge
     ----------------------------------------------------------------------- */
  FIG['fig-cornu'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var t = 1.2;
    var controls = div('fig-controls', container);
    var stt = FIG.slider(controls, { id: 'sf-ct', label: 'Position past the edge, u', min: -3, max: 5, step: 0.02, value: t, onChange: function (z) { t = z; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function I(u) { var q = sfFresnel(u); return 0.5 * ((q[0] + 0.5) * (q[0] + 0.5) + (q[1] + 0.5) * (q[1] + 0.5)); }
    function draw() {
      valText(stt, fmt(t, 2));
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = narrow ? 560 : 300;
      var A = newSVG(svgWrap, container, H, 'The Cornu spiral and the intensity of light past a straight edge'), W = A.W, svg = A.svg, fs = A.fs;
      var S = narrow ? Math.min(W - 30, 270) : Math.min(270, W * 0.42), sx0 = narrow ? (W - S) / 2 : 14, sy0 = 14, X = function (v) { return sx0 + (v + 0.9) / 1.8 * S; }, Y = function (v) { return sy0 + (0.9 - v) / 1.8 * S; };
      el('line', { x1: X(-0.9), y1: Y(0), x2: X(0.9), y2: Y(0), stroke: c.faint }, svg); el('line', { x1: X(0), y1: Y(-0.9), x2: X(0), y2: Y(0.9), stroke: c.faint }, svg);
      var pts = []; for (var i = 0; i <= 1200; i++) { var u = -6 + 12 * i / 1200, q = sfFresnel(u); pts.push([X(q[0]), Y(q[1])]); } sfPath(svg, pts, OI[0], 1.4);
      var q0 = sfFresnel(t);
      el('line', { x1: X(-0.5), y1: Y(-0.5), x2: X(q0[0]), y2: Y(q0[1]), stroke: OI[3], 'stroke-width': 2.2 }, svg);
      sfDot(svg, X(-0.5), Y(-0.5), c.ink2, 3.5); sfDot(svg, X(q0[0]), Y(q0[1]), OI[3]);
      txt(svg, X(0.5) - 28, Y(0.5) + 4, 'u → +∞', { anchor: 'end', size: fs(9), fill: c.muted }); txt(svg, X(-0.5) + 28, Y(-0.5) + 4, 'u → −∞', { anchor: 'start', size: fs(9), fill: c.muted });
      var L = narrow ? 44 : sx0 + S + 50, T = narrow ? S + 50 : 24, B = narrow ? H - 40 : 252;
      var P = plotAxes(svg, c, fs, { L: L, R: W - 16, T: T, B: B, xl: -3, xh: 5, yl: 0, yh: 1.5, xticks: [-3, -2, -1, 0, 1, 2, 3, 4, 5], yticks: [0, 0.5, 1, 1.5], xlab: 'u (shadow ← edge → lit side)', ylab: '' });
      txt(svg, L, T - 8, 'Intensity', { anchor: 'start', size: fs(10), fill: c.muted });
      el('rect', { x: P.X(-3), y: T, width: P.X(0) - P.X(-3), height: B - T, fill: c.faint, 'fill-opacity': 0.2 }, svg);
      plotLine(svg, P, function () { return 1; }, -3, 5, 2, c.muted, 1, '4 4');
      plotLine(svg, P, I, -3, 5, 800, OI[0], 2.2);
      sfDot(svg, P.X(t), P.Y(I(t)), OI[3]);
      out.innerHTML = 'At u = ' + fmt(t, 2) + ' the intensity is <strong>' + fmt(I(t), 3) + '</strong> times the unobstructed value: half the squared length of the red chord on the spiral.' + NOTE + 'The spiral plots the Fresnel integrals C(u) and S(u) against each other. The light reaching a point past an edge is the sum of wavelets from the open part of the wavefront, and that sum is the chord from the spiral’s lower eye to the point u. In the geometric shadow (grey) the light fades smoothly instead of stopping dead; on the lit side it overshoots to 1.37 and rings with fringes. The same curve, the clothoid, joins straight track to curves on railways and motorways, because its curvature grows steadily with distance.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-sf'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is Γ(5)?', options: ['5', '24', '120', '25'], answer: 1, explanation: 'Γ(n) = (n − 1)!, so Γ(5) = 4! = 24.' },
      { question: 'Γ(½) equals…', options: ['½', '√2', '√π', 'π/2'], answer: 2, explanation: 'This is why π appears in the normal distribution and in the volumes of spheres.' },
      { question: 'The share of a normal distribution within ±2 standard deviations is erf(?)', options: ['2', '2/√2 = √2', '1/2', '4'], answer: 1, explanation: 'Within ±k sd is erf(k/√2): erf(√2) ≈ 0.9545.' },
      { question: 'Why does a drum not have a clear musical pitch like a guitar string?', options: ['It is too loud', 'Its overtone frequencies follow the zeros of Bessel functions, which are not whole-number multiples', 'Its skin is too thick', 'It has no fundamental'], answer: 1, explanation: 'The ratios are 1, 1.59, 2.14, 2.30…' },
      { question: 'Which special functions give the angular shapes of atomic orbitals?', options: ['Bessel functions', 'Spherical harmonics', 'Error functions', 'Elliptic integrals'], answer: 1, explanation: 'Spherical harmonics, built from associated Legendre functions.' },
      { question: 'The energy levels of the quantum harmonic oscillator are…', options: ['Equally spaced', 'Closer together at high energy', 'Farther apart at high energy', 'All equal'], answer: 0, explanation: 'E = (n + ½)ħω; the wavefunctions use Hermite polynomials.' },
      { question: 'Interpolating at equally spaced points with high-degree polynomials can fail because of…', options: ['Simpson’s paradox', 'Runge’s phenomenon', 'The Gibbs paradox', 'Benford’s law'], answer: 1, explanation: 'Chebyshev points fix it.' },
      { question: 'The exact period of a pendulum swinging through a large angle needs…', options: ['The gamma function', 'A complete elliptic integral', 'The zeta function', 'A Bessel function'], answer: 1, explanation: 'T = 4√(L/g) K(sin θ₀/2).' },
      { question: 'Lambert W solves which equation for w?', options: ['w² = z', 'w e^w = z', 'e^w = z', 'sin w = z'], answer: 1, explanation: 'It appears in Wien’s law, enzyme kinetics and many equations mixing x and eˣ.' },
      { question: 'In SciPy, which call computes the logarithm of the gamma function without overflow?', options: ['scipy.special.gamma', 'scipy.special.gammaln', 'math.factorial', 'numpy.log'], answer: 1, explanation: 'gammaln(200) is about 857.9, while gamma(200) overflows.' }
    ]);
  };
})();
