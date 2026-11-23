/* ==========================================================================
   RNLearn — Newton and Leibniz (Minds That Changed How We Know, Part 6)
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
    { name: 'Young geniuses', color: '#b45309' },
    { name: 'The great books', color: '#1d4ed8' },
    { name: 'The quarrel', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1642', icon: '👶', era: 0, sec: 3, title: 'Newton born', text: 'Isaac Newton is born on Christmas Day (Old Style) at Woolsthorpe, Lincolnshire, the year Galileo dies.' },
    { year: '1646', icon: '👶', era: 0, sec: 4, title: 'Leibniz born', text: 'Gottfried Wilhelm Leibniz is born in Leipzig.' },
    { year: '1665–66', icon: '🍎', era: 0, sec: 3, title: 'The plague years', text: 'With Cambridge closed by plague, Newton develops his method of fluxions, his theory of colours and the beginnings of his theory of gravity.' },
    { year: '1672', icon: '🌈', era: 0, sec: 8, title: 'Light and colours', text: 'Newton’s first paper argues that white light is a mixture of colours, sparking bitter disputes with Robert Hooke.' },
    { year: '1675', icon: '∫', era: 0, sec: 4, title: 'Leibniz’s calculus', text: 'In Paris, Leibniz introduces the notation ∫ and dx and works out the rules of his differential calculus.' },
    { year: '1684', icon: '📰', era: 1, sec: 5, title: 'First publication of calculus', text: 'Leibniz publishes “Nova methodus pro maximis et minimis” in the Acta Eruditorum.' },
    { year: '1687', icon: '📕', era: 1, sec: 6, title: 'The Principia', text: 'Newton’s Philosophiæ Naturalis Principia Mathematica sets out the laws of motion and universal gravitation.' },
    { year: '1704', icon: '🔦', era: 1, sec: 8, title: 'Opticks', text: 'Newton publishes Opticks, with two mathematical treatises including his method of fluxions.' },
    { year: '1712', icon: '⚖️', era: 2, sec: 9, title: 'The Commercium Epistolicum', text: 'A Royal Society committee, secretly guided by its president Newton, finds in Newton’s favour on the invention of calculus.' },
    { year: '1715–16', icon: '✉️', era: 2, sec: 10, title: 'Leibniz–Clarke letters', text: 'Leibniz debates Samuel Clarke, Newton’s ally, on space, time, God and gravity. Leibniz dies in 1716.' },
    { year: '1727', icon: '🪦', era: 2, sec: 11, title: 'Newton dies', text: 'Newton dies and is buried in Westminster Abbey.' }
  ];

  FIG['fig-m6-timeline'] = function (figEl) {
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
     Figure: from secant to tangent
     ----------------------------------------------------------------------- */
  FIG['fig-tangent'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var x0 = 1, h = 1, fn = 0;
    var F = [['x²', function (x) { return x * x; }, function (x) { return 2 * x; }], ['x³ − 2x', function (x) { return x * x * x - 2 * x; }, function (x) { return 3 * x * x - 2; }], ['sin x', Math.sin, Math.cos]];
    var controls = div('fig-controls', container);
    choice(controls, 'Curve', F.map(function (f) { return 'y = ' + f[0]; }), 0, function (i) { fn = i; draw(); });
    FIG.slider(controls, { id: 'tg-x', label: 'Point x', min: -1.5, max: 1.5, step: 0.05, value: x0, onChange: function (x) { x0 = x; draw(); } });
    FIG.slider(controls, { id: 'tg-h', label: 'Gap h (dx)', min: 0.01, max: 1.5, step: 0.01, value: h, onChange: function (x) { h = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'A secant line approaching the tangent'), W = A.W, svg = A.svg, fs = A.fs, f = F[fn][1];
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 244, xl: -2, xh: 3, yl: -3, yh: 6, xticks: [-2, -1, 0, 1, 2, 3], yticks: [-2, 0, 2, 4, 6], xlab: 'x', ylab: 'y' });
      plotLine(svg, P, f, -2, 3, 200, c.ink2, 2.4);
      var s = (f(x0 + h) - f(x0)) / h, d = F[fn][2](x0);
      plotLine(svg, P, function (x) { return f(x0) + s * (x - x0); }, -2, 3, 2, AMBER, 2);
      plotLine(svg, P, function (x) { return f(x0) + d * (x - x0); }, -2, 3, 2, MC, 1.6, '5 3');
      el('circle', { cx: P.X(x0), cy: P.Y(f(x0)), r: 5, fill: MC }, svg); el('circle', { cx: P.X(x0 + h), cy: P.Y(f(x0 + h)), r: 5, fill: AMBER }, svg);
      legend(svg, c, fs, W, 'amber: line through two points a gap h apart · dashed: the tangent, the limit as h → 0', 'amber: secant · dashed: tangent');
      out.innerHTML = 'Slope of the secant [f(x + h) − f(x)]/h = <strong>' + fmt(s, 3) + '</strong>; slope of the tangent f′(x) = <strong>' + fmt(d, 3) + '</strong>.' + NOTE + 'Shrink h and the secant swings onto the tangent. Newton thought of this as the speed (“fluxion”) of a flowing quantity in a vanishingly small moment of time; Leibniz as the ratio dy/dx of “infinitely small” differences. Both found the same rules, for example d(x²)/dx = 2x. What exactly an infinitely small quantity is remained unclear, and was criticised by Bishop Berkeley as the “ghosts of departed quantities”, until limits were made rigorous in the nineteenth century.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Newton's cannon
     ----------------------------------------------------------------------- */
  FIG['fig-cannon'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var v = 7.8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'cn-v', label: 'Launch speed from a very high mountain (km/s)', min: 2, max: 12, step: 0.1, value: v, onChange: function (x) { v = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var GM = 398600, Re = 6371, h0 = 300;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 320, 'Trajectories of a cannonball fired horizontally from a high mountain'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, cy = 165, sc = Math.min(95, W * 0.22) / Re;
      el('circle', { cx: cx, cy: cy, r: Re * sc, fill: '#2563eb', opacity: 0.85 }, svg);
      var x = 0, y = Re + h0, vx = v, vy = 0, dt = 2, d = 'M' + cx + ' ' + (cy - y * sc), hit = false, esc = false, tmax = 60000, t = 0, rmin = 1e9;
      for (; t < tmax; t += dt) { var r = Math.hypot(x, y); var a = -GM / (r * r * r); vx += a * x * dt; vy += a * y * dt; x += vx * dt; y += vy * dt; r = Math.hypot(x, y); rmin = Math.min(rmin, r); if (r < Re) { hit = true; break; } if (r > Re * 18) { esc = true; break; } d += 'L' + (cx + x * sc).toFixed(1) + ' ' + (cy - y * sc).toFixed(1); if (t > 200 && Math.hypot(x, y - (Re + h0)) < 40 && vx > 0) break; }
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, svg);
      el('path', { d: 'M' + (cx - 6) + ' ' + (cy - Re * sc) + 'L' + cx + ' ' + (cy - (Re + h0) * sc - 2) + 'L' + (cx + 6) + ' ' + (cy - Re * sc) + 'Z', fill: '#6b7280' }, svg);
      var vc = Math.sqrt(GM / (Re + h0)), ve = Math.sqrt(2 * GM / (Re + h0));
      legend(svg, c, fs, W, 'Newton’s thought experiment: fire faster and the ball falls around the curve of the Earth (mountain height exaggerated)', 'fire faster, the ball falls around the Earth');
      out.innerHTML = (hit ? 'The ball falls back to Earth.' : esc ? 'The ball escapes from the Earth for ever.' : 'The ball is in <strong>orbit</strong>: it keeps falling, but the Earth curves away beneath it.') + ' Circular orbit speed at this height: <strong>' + fmt(vc, 2) + ' km/s</strong>; escape speed <strong>' + fmt(ve, 2) + ' km/s</strong>.' + NOTE + 'In <em>A Treatise of the System of the World</em>, Newton imagined a cannon on a high mountain. Each faster shot lands farther away, until the ball never lands: the same force that pulls an apple down keeps the Moon, and any satellite, in orbit. Between the circular and escape speeds the orbit is an ellipse, exactly as Kepler had found for the planets.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the Moon test
     ----------------------------------------------------------------------- */
  FIG['fig-moontest'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mt-n', label: 'Guess: gravity weakens as 1 / distanceⁿ, with n =', min: 0, max: 4, step: 0.1, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var g = 9.81, Rm = 3.844e8, Re = 6.371e6, T = 27.32 * 86400;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Predicted and observed acceleration of the Moon'), W = A.W, svg = A.svg, fs = A.fs;
      var obs = 4 * Math.PI * Math.PI * Rm / (T * T), pred = g * Math.pow(Re / Rm, n), ratio = pred / obs;
      var P = plotAxes(svg, c, fs, { L: 150, R: W - 20, T: 40, B: 190, xl: 1e-6, xh: 10, yl: 0, yh: 3, logx: true, xticks: [1e-6, 1e-4, 1e-2, 1, 10], yticks: [], xlab: 'acceleration (m/s²)' });
      [['at the Earth’s surface', g, c.ink2, 0.5], ['predicted at the Moon', pred, AMBER, 1.5], ['observed at the Moon', obs, MC, 2.5]].forEach(function (b) { var y = P.Y(b[3]); el('rect', { x: P.X(1e-6), y: y - 12, width: Math.max(2, P.X(Math.min(10, Math.max(1e-6, b[1]))) - P.X(1e-6)), height: 24, fill: b[2], opacity: 0.8, rx: 3 }, svg); txt(svg, 144, y + 4, b[0], { anchor: 'end', size: fs(10), fill: c.ink2 }); });
      legend(svg, c, fs, W, 'the Moon is 60 Earth radii away; how fast must it “fall” towards the Earth to follow its orbit?', 'does gravity reach the Moon?');
      out.innerHTML = 'Observed: the Moon’s orbit (radius 384,400 km, period 27.3 days) requires an acceleration of <strong>' + sciHTML(obs, 3) + ' m/s²</strong>. Predicted with n = ' + fmt(n, 1) + ': <strong>' + sciHTML(pred, 3) + ' m/s²</strong> (' + (Math.abs(Math.log10(ratio)) < 0.03 ? 'agreement!' : fmt(ratio, ratio > 10 || ratio < 0.1 ? 0 : 2) + ' times the observed value') + ').' + NOTE + 'Newton compared the fall of an apple with the “fall” of the Moon. Because the Moon is about 60 times farther from the Earth’s centre, an inverse-square law predicts 60² = 3,600 times weaker gravity: in one second the Moon should fall about 1.4 mm towards the Earth, while an apple falls 4.9 m. Only n ≈ 2 fits. Newton later wrote that he found the agreement “pretty nearly” in the plague years, though he published the full theory only in 1687.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the experimentum crucis
     ----------------------------------------------------------------------- */
  FIG['fig-prism'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var second = 1, pick = 3;
    var COLS = [['red', '#ef4444', 1.513], ['orange', '#f97316', 1.516], ['yellow', '#eab308', 1.519], ['green', '#22c55e', 1.523], ['blue', '#3b82f6', 1.528], ['violet', '#8b5cf6', 1.533]];
    var controls = div('fig-controls', container);
    choice(controls, 'Second prism', ['Remove', 'Insert'], 1, function (i) { second = i; draw(); });
    FIG.slider(controls, { id: 'pr-c', label: 'Colour passed through the slit', min: 0, max: 5, step: 1, value: pick, onChange: function (x) { pick = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'White light dispersed by one prism, one colour refracted again by a second'), W = A.W, svg = A.svg, fs = A.fs;
      var s = Math.min(1, W / 700), p1 = [W * 0.25, 140], bx = W * 0.5, p2 = [W * 0.7, 120];
      el('rect', { x: 0, y: 0, width: W, height: 260, fill: '#0b1023', rx: 6 }, svg);
      el('line', { x1: 10, y1: 150, x2: p1[0] - 20 * s, y2: 150, stroke: '#fff', 'stroke-width': 4 }, svg);
      el('path', { d: 'M' + (p1[0] - 30 * s) + ' ' + (p1[1] + 45 * s) + 'L' + p1[0] + ' ' + (p1[1] - 50 * s) + 'L' + (p1[0] + 30 * s) + ' ' + (p1[1] + 45 * s) + 'Z', fill: '#93c5fd33', stroke: '#bfdbfe' }, svg);
      COLS.forEach(function (cl, i) { var y = 70 + i * 16; el('line', { x1: p1[0] + 12 * s, y1: 145, x2: bx, y2: y, stroke: cl[1], 'stroke-width': 2, opacity: i === pick ? 1 : 0.7 }, svg); });
      el('rect', { x: bx - 3, y: 40, width: 6, height: 200, fill: '#9ca3af' }, svg); el('rect', { x: bx - 3, y: 70 + pick * 16 - 3, width: 6, height: 6, fill: '#0b1023' }, svg);
      var cl = COLS[pick], y0 = 70 + pick * 16;
      if (second) { el('path', { d: 'M' + (p2[0] - 30 * s) + ' ' + (p2[1] + 45 * s) + 'L' + p2[0] + ' ' + (p2[1] - 50 * s) + 'L' + (p2[0] + 30 * s) + ' ' + (p2[1] + 45 * s) + 'Z', fill: '#93c5fd33', stroke: '#bfdbfe' }, svg); el('line', { x1: bx, y1: y0, x2: p2[0] - 10 * s, y2: y0 + 20, stroke: cl[1], 'stroke-width': 2.5 }, svg); var bend = (cl[2] - 1.5) * 2500; el('line', { x1: p2[0] + 10 * s, y1: y0 + 20, x2: W - 14, y2: y0 + 20 - 40 - bend * 0.6, stroke: cl[1], 'stroke-width': 2.5 }, svg); }
      else el('line', { x1: bx, y1: y0, x2: W - 14, y2: y0 + 30, stroke: cl[1], 'stroke-width': 2.5 }, svg);
      txt(svg, 14, 20, 'sunlight through a hole', { anchor: 'start', size: fs(9), fill: '#e5e7eb' }); txt(svg, bx, 255, 'board with a slit', { size: fs(9), fill: '#e5e7eb' });
      out.innerHTML = 'The ' + cl[0] + ' ray passing the slit ' + (second ? 'is bent again by the second prism, by an amount fixed by its colour, and <strong>stays ' + cl[0] + '</strong>: no new colours appear.' : 'continues as a single colour.') + NOTE + 'The prevailing view held that prisms <em>modify</em> white light, creating colours. In Newton’s “crucial experiment”, described in his 1672 paper, a second prism refracted a single selected colour but did not change it further, and each colour was always bent by its own characteristic amount (violet most, red least). He concluded that white light is a mixture of rays of different refrangibility, which the prism merely separates.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did Newton call the rate of change of a flowing quantity?', options: ['A differential', 'A fluxion', 'An integral', 'A monad'], answer: 1, explanation: 'Leibniz wrote dy/dx.' },
      { question: 'Who published the calculus first?', options: ['Newton, 1666', 'Leibniz, 1684', 'Newton, 1687', 'Leibniz, 1704'], answer: 1, explanation: 'In the Acta Eruditorum.' },
      { question: 'Which notation, still used today, did Leibniz introduce?', options: ['ẋ (dot)', '∫ and dx', 'Δ', 'lim'], answer: 1, explanation: 'Newton’s dots survive mainly in mechanics.' },
      { question: 'Newton’s Moon test compared…', options: ['The Moon’s brightness with the Sun’s', 'The fall of an apple with the Moon’s fall towards the Earth', 'Tides in two oceans', 'Two pendulums'], answer: 1, explanation: 'At 60 Earth radii, gravity is 3,600 times weaker.' },
      { question: 'In Newton’s cannon thought experiment, a fast enough cannonball…', options: ['Stops in mid-air', 'Falls around the Earth in orbit', 'Breaks the sound barrier', 'Reaches the Sun'], answer: 1, explanation: 'About 7.7 km/s for a low orbit.' },
      { question: 'What did Newton’s experimentum crucis show?', options: ['Prisms create colours', 'White light is a mixture of colours that a prism separates', 'Light is a wave', 'Light has no speed'], answer: 1, explanation: 'A single colour stays the same through a second prism.' },
      { question: 'The Royal Society report of 1712 on the calculus dispute was…', options: ['Neutral', 'Secretly guided by Newton himself', 'Written by Leibniz', 'Never published'], answer: 1, explanation: 'He was president and wrote its review.' },
      { question: 'In the Leibniz–Clarke correspondence, Leibniz argued that space is…', options: ['An absolute container', 'A system of relations between things', 'Made of ether', 'God’s body'], answer: 1, explanation: 'Newton held space to be absolute.' },
      { question: '“Hypotheses non fingo” (I feign no hypotheses) refers to Newton’s refusal to…', options: ['Use mathematics', 'Speculate about the cause of gravity', 'Do experiments', 'Publish'], answer: 1, explanation: 'From the General Scholium (1713).' },
      { question: 'The story of the falling apple was first recorded…', options: ['By Newton in the Principia', 'By acquaintances in Newton’s old age, decades after 1666', 'By Leibniz', 'Never'], answer: 1, explanation: 'William Stukeley and John Conduitt.' }
    ]);
  };
})();
