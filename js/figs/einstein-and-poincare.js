/* ==========================================================================
   RNLearn — Einstein and Poincare (Minds That Changed How We Know, Part 10)
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
    { name: 'Crisis of the ether', color: '#b45309' },
    { name: 'Relativity', color: '#1d4ed8' },
    { name: 'Confirmation', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1854', icon: '👶', era: 0, sec: 3, title: 'Poincaré born', text: 'Henri Poincaré is born in Nancy, France.' },
    { year: '1879', icon: '👶', era: 1, sec: 5, title: 'Einstein born', text: 'Albert Einstein is born in Ulm, Germany.' },
    { year: '1887', icon: '🔦', era: 0, sec: 4, title: 'Michelson–Morley', text: 'Albert Michelson and Edward Morley find no sign of the Earth’s motion through the supposed ether.' },
    { year: '1898', icon: '⏱️', era: 0, sec: 4, title: '“The Measure of Time”', text: 'Poincaré argues that the simultaneity of distant events is fixed by convention, for example by exchanging light signals.' },
    { year: '1902', icon: '📘', era: 0, sec: 9, title: 'Science and Hypothesis', text: 'Poincaré’s book argues that geometry is a convention; Einstein and his friends read it avidly in Bern.' },
    { year: '1905', icon: '⚡', era: 1, sec: 6, title: 'Special relativity', text: 'Einstein’s “On the Electrodynamics of Moving Bodies”; Poincaré independently completes the mathematics of the Lorentz transformations.' },
    { year: '1908', icon: '🧊', era: 1, sec: 7, title: 'Spacetime', text: 'Hermann Minkowski declares that space and time by themselves are doomed to fade away; only their union, spacetime, survives.' },
    { year: '1912', icon: '🪦', era: 0, sec: 12, title: 'Poincaré dies', text: 'Poincaré dies in Paris, aged 58.' },
    { year: '1915', icon: '🌍', era: 1, sec: 10, title: 'General relativity', text: 'Einstein’s field equations describe gravity as the curvature of spacetime.' },
    { year: '1919', icon: '🌒', era: 2, sec: 11, title: 'The eclipse', text: 'Eddington and Dyson’s eclipse expeditions report starlight bending by the amount Einstein predicted.' },
    { year: '2015', icon: '🌊', era: 2, sec: 11, title: 'Gravitational waves', text: 'LIGO detects ripples in spacetime from two merging black holes, a century after Einstein’s prediction.' }
  ];

  FIG['fig-m10-timeline'] = function (figEl) {
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

  var MC = '#0e7490';

  /* -----------------------------------------------------------------------
     Figure: the light clock
     ----------------------------------------------------------------------- */
  FIG['fig-lightclock'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var beta = 0.6, ph = 0, svg, W, geo;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'lc-b', label: 'Speed of the moving clock (fraction of the speed of light)', min: 0, max: 0.99, step: 0.01, value: beta, onChange: function (x) { beta = x; setup(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var dots = [];
    function setup() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'A light clock at rest and a moving light clock'); W = A.W; svg = A.svg; var fs = A.fs;
      var h = 140, top = 60, xs = W * 0.15;
      geo = { h: h, top: top, xs: xs, xm0: W * 0.35, span: W * 0.6 };
      [xs].forEach(function (x) { el('line', { x1: x - 18, y1: top, x2: x + 18, y2: top, stroke: c.ink2, 'stroke-width': 3 }, svg); el('line', { x1: x - 18, y1: top + h, x2: x + 18, y2: top + h, stroke: c.ink2, 'stroke-width': 3 }, svg); });
      txt(svg, xs, top + h + 22, 'clock at rest', { size: fs(9), fill: c.muted });
      var g = 1 / Math.sqrt(1 - beta * beta), dx = beta * h * g;
      var d = 'M' + geo.xm0 + ' ' + (top + h); for (var k = 0; k < 6; k++) { var x0 = geo.xm0 + k * dx; if (x0 + dx > W - 10) break; d += 'L' + (x0 + dx / 2) + ' ' + top + 'L' + (x0 + dx) + ' ' + (top + h); }
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, geo.xm0, top + h + 22, 'moving clock, seen by you', { anchor: 'start', size: fs(9), fill: c.muted });
      dots = [el('circle', { r: 5, fill: '#facc15' }, svg), el('circle', { r: 5, fill: '#facc15' }, svg), el('line', { stroke: c.ink2, 'stroke-width': 3 }, svg), el('line', { stroke: c.ink2, 'stroke-width': 3 }, svg)];
      legend(svg, c, fs, W, 'a pulse of light bounces between two mirrors; each round trip is one tick', 'light bouncing between mirrors');
      out.innerHTML = 'Time-dilation factor γ = 1/√(1 − v²/c²) = <strong>' + fmt(g, 3) + '</strong>: while the clock at rest ticks once, the moving clock ticks only <strong>' + fmt(1 / g, 3) + '</strong> times.' + NOTE + 'In the moving clock, the light must travel a longer, diagonal path. If the speed of light is the same for every observer, as Einstein postulated in 1905, the moving clock’s ticks must take longer: moving clocks run slow. The effect is symmetric (the moving observer sees your clock run slow) and real: muons created by cosmic rays survive to reach the ground only because their internal clocks are slowed, and atomic clocks flown around the world in 1971 confirmed the prediction.</span>';
    }
    setup();
    window.addEventListener('resize', setup);
    onTheme(setup);
    FIG.animate(figEl, function () {
      if (!geo) return; ph += 0.012; var g = 1 / Math.sqrt(1 - beta * beta), dx = beta * geo.h * g;
      var u = ph % 2, y = geo.top + geo.h - (u < 1 ? u : 2 - u) * geo.h; dots[0].setAttribute('cx', geo.xs); dots[0].setAttribute('cy', y.toFixed(1));
      var um = (ph / g) % 2, ym = geo.top + geo.h - (um < 1 ? um : 2 - um) * geo.h, xoff = ((ph / g) * dx / 2) % Math.max(1, Math.min(geo.span, 5 * dx)), xm = geo.xm0 + xoff;
      dots[1].setAttribute('cx', xm.toFixed(1)); dots[1].setAttribute('cy', ym.toFixed(1));
      dots[2].setAttribute('x1', xm - 18); dots[2].setAttribute('x2', xm + 18); dots[2].setAttribute('y1', geo.top); dots[2].setAttribute('y2', geo.top);
      dots[3].setAttribute('x1', xm - 18); dots[3].setAttribute('x2', xm + 18); dots[3].setAttribute('y1', geo.top + geo.h); dots[3].setAttribute('y2', geo.top + geo.h);
    });
  };

  /* -----------------------------------------------------------------------
     Figure: the relativity of simultaneity
     ----------------------------------------------------------------------- */
  FIG['fig-simultaneity'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var beta = 0.4;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'sm-b', label: 'Speed of the train (fraction of c)', min: -0.8, max: 0.8, step: 0.02, value: beta, onChange: function (x) { beta = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Spacetime diagram with lines of simultaneity for the platform and the train'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 30, B: 262, xl: -2, xh: 2, yl: -0.4, yh: 2, xticks: [-2, -1, 0, 1, 2], yticks: [0, 1, 2], xlab: 'position (light-seconds)', ylab: 'time (s)' });
      plotLine(svg, P, function (x) { return Math.abs(x); }, -2, 2, 2, AMBER, 1, '3 3');
      el('line', { x1: P.X(-2), y1: P.Y(0), x2: P.X(2), y2: P.Y(0), stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      for (var k = 0; k < 3; k++) { var t = 0.6 * k; plotLine(svg, P, function (x) { return t + beta * x; }, -2, 2, 2, MC, 1.4); }
      plotLine(svg, P, function (x) { return x / beta; }, -2, 2, 200, MC, 2.2, '6 3');
      var A1 = [-1, 0], B1 = [1, 0];
      [A1, B1].forEach(function (p, i) { el('path', { d: 'M' + (P.X(p[0]) - 6) + ' ' + (P.Y(p[1]) + 6) + 'l6 -14l6 14z', fill: '#facc15', stroke: AMBER }, svg); txt(svg, P.X(p[0]), P.Y(p[1]) + 22, i ? 'lightning B' : 'lightning A', { size: fs(9), fill: c.ink2 }); });
      legend(svg, c, fs, W, 'black: events at the same time for the platform · teal lines: events at the same time for the train · dashed teal: the train’s path · amber: light', 'black: platform “now” · teal: train “now”');
      var dt = beta * 2 / Math.sqrt(1 - beta * beta);
      out.innerHTML = (Math.abs(beta) < 0.01 ? 'For the train at rest, lightning strikes A and B are simultaneous for everyone.' : 'For the platform, strikes A and B are simultaneous. For the train, moving ' + (beta > 0 ? 'towards B' : 'towards A') + ', strike ' + (beta > 0 ? 'B' : 'A') + ' happened first, by <strong>' + fmt(Math.abs(dt), 2) + ' s</strong>.') + NOTE + 'Einstein imagined lightning striking both ends of a train. An observer midway on the platform sees the flashes at once and calls the strikes simultaneous. An observer midway on the moving train is rushing towards one flash and away from the other; since light travels at the same speed for her, she must conclude that the strikes were not simultaneous. On the spacetime diagram, the train’s lines of “now” are tilted. Neither view is privileged. Poincaré had already argued in 1898 that the simultaneity of distant events rests on a convention for synchronising clocks with light signals.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: relativity in GPS
     ----------------------------------------------------------------------- */
  FIG['fig-gps'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var alt = 20200;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'gp-a', label: 'Orbit altitude (km)', min: 400, max: 36000, step: 100, value: alt, onChange: function (x) { alt = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var GM = 3.986e14, Re = 6.371e6, c2 = 8.98755e16;
    function rates(h) { var r = Re + h * 1000, v2 = GM / r, sr = -v2 / (2 * c2) * 86400e6, gr = (GM / Re - GM / r) / c2 * 86400e6; return [sr, gr]; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Daily clock offset of an orbiting clock from special and general relativity'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: 36000, yl: -40, yh: 60, xticks: [0, 10000, 20000, 30000], yticks: [-40, -20, 0, 20, 40, 60], xfmt: function (v) { return fmt(v / 1000, 0) + 'k'; }, xlab: 'altitude (km)', ylab: 'µs gained per day' });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(36000), y2: P.Y(0), stroke: c.border }, svg);
      plotLine(svg, P, function (h) { return rates(h)[0]; }, 200, 36000, 200, RED, 2, '5 3');
      plotLine(svg, P, function (h) { return rates(h)[1]; }, 200, 36000, 200, BLUE, 2, '5 3');
      plotLine(svg, P, function (h) { return rates(h)[0] + rates(h)[1]; }, 200, 36000, 200, MC, 2.8);
      var rr = rates(alt), net = rr[0] + rr[1];
      el('circle', { cx: P.X(alt), cy: P.Y(net), r: 5, fill: MC }, svg);
      legend(svg, c, fs, W, 'red: special relativity (speed slows the clock) · blue: general relativity (weaker gravity speeds it) · teal: total', 'red: speed · blue: gravity · teal: total');
      out.innerHTML = 'At ' + alt.toLocaleString('en-GB') + ' km, an orbiting clock loses ' + fmt(-rr[0], 1) + ' µs a day from its speed and gains ' + fmt(rr[1], 1) + ' µs from weaker gravity: net <strong>' + (net >= 0 ? '+' : '') + fmt(net, 1) + ' µs per day</strong>, a position error of about <strong>' + fmt(Math.abs(net) * 0.3, 0) + ' m per day</strong> if uncorrected.' + NOTE + 'GPS satellites orbit at about 20,200 km. Their clocks run fast by about 38 microseconds a day, the sum of a 7 µs loss from special relativity and a 45 µs gain from general relativity. Since light travels 300 m in a microsecond, ignoring relativity would make positions drift by kilometres within a day; the satellite clocks are deliberately set to tick slightly slow before launch. (Circular-orbit approximation; Earth’s rotation ignored.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Poincaré's disc world
     ----------------------------------------------------------------------- */
  FIG['fig-poincaredisc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var s = 0.6;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pd-s', label: 'Size of the triangle (distance of its corners from the centre)', min: 0.05, max: 0.95, step: 0.01, value: s, onChange: function (x) { s = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A disc whose inhabitants’ rulers shrink towards the rim, with a triangle of their straightest lines'), W = A.W, svg = A.svg, fs = A.fs, cx = W / 2, cy = 155, R = Math.min(130, W * 0.38);
      var grad = el('radialGradient', { id: 'pdg' }, el('defs', {}, svg)); el('stop', { offset: '0%', 'stop-color': '#fde68a' }, grad); el('stop', { offset: '100%', 'stop-color': '#1e3a8a' }, grad);
      el('circle', { cx: cx, cy: cy, r: R, fill: 'url(#pdg)', opacity: 0.55, stroke: c.ink2 }, svg);
      var pts = [0, 1, 2].map(function (k) { var a = -Math.PI / 2 + k * 2 * Math.PI / 3; return [s * Math.cos(a), s * Math.sin(a)]; });
      function geo(p, q) { var cr = p[0] * q[1] - p[1] * q[0]; if (Math.abs(cr) < 1e-6) return 'L' + (cx + q[0] * R) + ' ' + (cy + q[1] * R); var p2 = p[0] * p[0] + p[1] * p[1] + 1, q2 = q[0] * q[0] + q[1] * q[1] + 1, det = 2 * (p[0] * q[1] - p[1] * q[0]), ox = (p2 * q[1] - q2 * p[1]) / det, oy = (p[0] * q2 - q[0] * p2) / det, rr = Math.sqrt(ox * ox + oy * oy - 1); var sweep = cr > 0 ? 0 : 1; return 'A' + (rr * R).toFixed(1) + ' ' + (rr * R).toFixed(1) + ' 0 0 ' + sweep + ' ' + (cx + q[0] * R).toFixed(1) + ' ' + (cy + q[1] * R).toFixed(1); }
      var d = 'M' + (cx + pts[0][0] * R) + ' ' + (cy + pts[0][1] * R) + geo(pts[0], pts[1]) + geo(pts[1], pts[2]) + geo(pts[2], pts[0]) + 'Z';
      el('path', { d: d, fill: AMBER + '44', stroke: AMBER, 'stroke-width': 2.4 }, svg);
      var rh = 2 * Math.atanh(s), side = Math.acosh(Math.cosh(rh) * Math.cosh(rh) - Math.sinh(rh) * Math.sinh(rh) * Math.cos(2 * Math.PI / 3)), cosA = (Math.cosh(side) * Math.cosh(side) - Math.cosh(side)) / (Math.sinh(side) * Math.sinh(side)), ang = Math.acos(cosA) * 180 / Math.PI;
      legend(svg, c, fs, W, 'Poincaré’s world: it is hot at the centre, cold at the rim, and everything shrinks as it cools', 'hot centre, cold rim, rulers shrink');
      out.innerHTML = 'Each angle of the inhabitants’ triangle: <strong>' + fmt(ang, 1) + '°</strong>; angle sum: <strong>' + fmt(3 * ang, 1) + '°</strong>, less than 180°.' + NOTE + 'In <em>Science and Hypothesis</em> (1902), Poincaré imagined beings in a disc where temperature falls towards the rim and all objects, including their rulers and their own bodies, shrink as they cool. They can never reach the edge, which seems infinitely far away, and their shortest paths look curved to us. Measuring with their rulers, they would find a non-Euclidean (hyperbolic) geometry. But they could equally keep Euclid and postulate a mysterious shrinking force. Poincaré concluded that the choice of geometry is a <em>convention</em>, chosen for convenience, not a fact that experiment forces on us. (The figure is the Poincaré disc model of hyperbolic geometry.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m10'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did the Michelson–Morley experiment (1887) find?', options: ['The speed of the ether wind', 'No detectable motion of the Earth through the ether', 'That light is slower in water', 'Gravitational waves'], answer: 1, explanation: 'A famous null result.' },
      { question: 'Einstein’s two postulates of special relativity are…', options: ['Energy and momentum conservation', 'The laws of physics are the same in all uniformly moving frames, and light’s speed is the same for all observers', 'Absolute space and time', 'Gravity and inertia'], answer: 1, explanation: '1905.' },
      { question: 'A moving clock, compared with one at rest, runs…', options: ['Faster', 'Slower', 'At the same rate', 'Backwards'], answer: 1, explanation: 'By the factor γ.' },
      { question: 'Poincaré argued in 1898 that the simultaneity of distant events…', options: ['Is obvious', 'Depends on a convention for synchronising clocks', 'Is impossible to define', 'Requires the ether'], answer: 1, explanation: 'Clocks synchronised by light signals.' },
      { question: 'Who first wrote E = mc² as a general relation between mass and energy?', options: ['Poincaré', 'Einstein, 1905', 'Newton', 'Minkowski'], answer: 1, explanation: 'Poincaré had found related results for radiation.' },
      { question: 'In general relativity, gravity is…', options: ['A force between masses', 'The curvature of spacetime', 'An illusion', 'Electricity'], answer: 1, explanation: '1915.' },
      { question: 'GPS satellite clocks, without correction, would run…', options: ['Slow by 38 µs a day', 'Fast by about 38 µs a day', 'Exactly right', 'Fast by 38 seconds a day'], answer: 1, explanation: '+45 µs from gravity, −7 µs from speed.' },
      { question: 'Poincaré’s conventionalism holds that…', options: ['All science is arbitrary', 'Some basic principles, like the choice of geometry, are chosen for convenience rather than forced by experiment', 'Experiments are useless', 'Only mathematics is true'], answer: 1, explanation: 'From Science and Hypothesis (1902).' },
      { question: 'The 1919 eclipse expeditions tested…', options: ['Time dilation', 'The bending of starlight by the Sun', 'The speed of light', 'Gravitational waves'], answer: 1, explanation: 'Twice the Newtonian value was predicted.' },
      { question: 'Einstein’s school record in mathematics was…', options: ['A failure', 'Excellent', 'Average', 'Not recorded'], answer: 1, explanation: 'He mastered calculus by about 15.' }
    ]);
  };
})();
