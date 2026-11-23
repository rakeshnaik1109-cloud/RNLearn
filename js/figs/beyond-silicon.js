/* ==========================================================================
   RNLearn — Beyond Silicon (From Switch to Supercomputer, Part 14)
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
    { name: 'New ideas', color: '#b45309' },
    { name: 'New devices', color: '#1d4ed8' },
    { name: 'New systems', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1982', icon: '⚛️', era: 0, sec: 7, title: 'Simulating physics with computers', text: 'Richard Feynman argues that simulating quantum systems efficiently needs a computer that is itself quantum.' },
    { year: '1990', icon: '🧠', era: 0, sec: 6, title: 'Neuromorphic electronics', text: 'Carver Mead describes analogue circuits that mimic the nervous system, coining “neuromorphic” systems.' },
    { year: '1994', icon: '🔐', era: 0, sec: 7, title: 'Shor’s algorithm', text: 'Peter Shor shows that a quantum computer could factor large numbers efficiently, threatening widely used encryption.' },
    { year: '2004', icon: '💡', era: 1, sec: 5, title: 'Fast silicon modulator', text: 'Intel researchers demonstrate a silicon optical modulator above 1 GHz, a milestone for silicon photonics.' },
    { year: '2008', icon: '〰️', era: 1, sec: 6, title: 'The memristor', text: 'HP Labs reports a titanium dioxide device behaving as a memristor, a resistor with memory, proposed for brain-like computing.' },
    { year: '2014', icon: '🔴', era: 1, sec: 6, title: 'A million-neuron chip', text: 'IBM’s TrueNorth chip implements a million spiking neurons using about 70 mW.' },
    { year: '2017', icon: '🧩', era: 2, sec: 3, title: 'Chiplets go mainstream', text: 'AMD’s first EPYC server processor combines four dies in one package; later generations mix dies made in different processes.' },
    { year: '2019', icon: '🧊', era: 2, sec: 7, title: 'Quantum advantage claim', text: 'Google reports a 53-qubit processor performing a sampling task it estimated would take a supercomputer thousands of years.' },
    { year: '2024', icon: '🛡️', era: 2, sec: 7, title: 'Error correction below threshold', text: 'Google reports logical qubits whose errors fall as the error-correcting code grows (published 2025).' }
  ];

  FIG['fig-el14-timeline'] = function (figEl) {
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

  var EL_PART = 14;
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
  /* Logic gates */
  var GATES = {
    AND: function (a, b) { return a & b; }, OR: function (a, b) { return a | b; }, NOT: function (a) { return a ? 0 : 1; },
    NAND: function (a, b) { return (a & b) ? 0 : 1; }, NOR: function (a, b) { return (a | b) ? 0 : 1; }, XOR: function (a, b) { return a ^ b; }, XNOR: function (a, b) { return (a ^ b) ? 0 : 1; }
  };
  /* Draw a gate symbol (distinctive shapes) centred at (x, y), width w, with input/output pins. */
  function drawGate(svg, c, kind, x, y, w, on) {
    var h = w * 0.7, l = x - w / 2, r = x + w / 2, t = y - h / 2, b = y + h / 2, col = on ? EC : c.ink2, fill = on ? EC + '22' : c.surface, d;
    var base = kind.replace(/^N(?=AND|OR)/, '').replace('XNOR', 'XOR'), inv = /^N(AND|OR)$|^NOT$|^XNOR$/.test(kind);
    if (base === 'AND') d = 'M' + l + ' ' + t + 'L' + x + ' ' + t + 'A' + (h / 2) + ' ' + (h / 2) + ' 0 0 1 ' + x + ' ' + b + 'L' + l + ' ' + b + 'Z';
    else if (base === 'NOT') d = 'M' + l + ' ' + t + 'L' + (r - 8) + ' ' + y + 'L' + l + ' ' + b + 'Z';
    else d = 'M' + l + ' ' + t + 'Q' + (x + w * 0.1) + ' ' + t + ' ' + (r - (inv ? 8 : 0)) + ' ' + y + 'Q' + (x + w * 0.1) + ' ' + b + ' ' + l + ' ' + b + 'Q' + (l + w * 0.22) + ' ' + y + ' ' + l + ' ' + t + 'Z';
    el('path', { d: d, fill: fill, stroke: col, 'stroke-width': 2 }, svg);
    if (base === 'XOR') el('path', { d: 'M' + (l - 6) + ' ' + t + 'Q' + (l - 6 + w * 0.22) + ' ' + y + ' ' + (l - 6) + ' ' + b, fill: 'none', stroke: col, 'stroke-width': 2 }, svg);
    if (inv) el('circle', { cx: r - 4, cy: y, r: 4, fill: c.surface, stroke: col, 'stroke-width': 2 }, svg);
    return { inA: [l + (base === 'OR' || base === 'XOR' ? w * 0.1 : 0), y - h * 0.25], inB: [l + (base === 'OR' || base === 'XOR' ? w * 0.1 : 0), y + h * 0.25], inN: [l, y], out: [r, y] };
  }
  function wire(svg, c, p, q, on) { var mx = (p[0] + q[0]) / 2; el('path', { d: 'M' + p[0] + ' ' + p[1] + 'L' + mx + ' ' + p[1] + 'L' + mx + ' ' + q[1] + 'L' + q[0] + ' ' + q[1], fill: 'none', stroke: on ? EC : c.muted, 'stroke-width': on ? 2.6 : 1.6 }, svg); }

  /* -----------------------------------------------------------------------
     Figure: series map
     ----------------------------------------------------------------------- */
  var EL_PARTS = [
    ['Bits, Logic and Boolean Algebra', 'Binary numbers, truth tables, logic gates, Boolean laws and De Morgan’s theorem.'],
    ['Combinational Circuits', 'Karnaugh maps, multiplexers, decoders, adders and two’s complement.'],
    ['Memory and Time', 'Latches, flip-flops, clocks, registers, counters and state machines.'],
    ['Circuits and Signals', 'Charge, current, voltage, Ohm’s and Kirchhoff’s laws, RC circuits and switching energy.'],
    ['Band Theory', 'Why semiconductors conduct: energy bands, electrons and holes, doping and the Fermi level.'],
    ['The p–n Junction', 'Depletion, diodes, the Shockley equation, LEDs, photodiodes and solar cells.'],
    ['The Bipolar Transistor', 'How a BJT amplifies and switches; operating regions and gain.'],
    ['The MOSFET', 'The MOS capacitor, threshold voltage and the most-manufactured device in history.'],
    ['CMOS Logic', 'Inverters, noise margins, gates from transistors, power, delay and memory cells.'],
    ['Making Chips', 'Wafers, lithography, fabrication, yield, Moore’s law and Dennard scaling.'],
    ['Modern Transistors', 'Short-channel effects, high-k gates, FinFETs and gate-all-around nanosheets.'],
    ['The Processor', 'How a CPU executes instructions: datapath, pipelining, caches and prediction.'],
    ['GPUs and Parallel Computing', 'SIMD and SIMT, memory bandwidth, Amdahl’s law and why AI runs on GPUs.'],
    ['Beyond Silicon', 'Chiplets, accelerators, photonics, neuromorphic and quantum computing.']
  ];
  FIG['fig-el-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CUR = EL_PART, sel = CUR;
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var SHORT = ['Logic', 'Circuits', 'Memory', 'Signals', 'Bands', 'Diode', 'BJT', 'MOSFET', 'CMOS', 'Chips', 'FinFET', 'CPU', 'GPU', 'Future'];
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, per = narrow ? 5 : 7, rows = Math.ceil(14 / per), A = newSVG(svgWrap, container, rows * 74 + 14, 'Map of the fourteen parts of the series'), W = A.W, svg = A.svg, fs = A.fs;
      var cols = ['#2563eb', '#16a34a', '#d97706', '#0e7490'];
      for (var i = 0; i < 14; i++) {
        var rr = Math.floor(i / per), kk = i % per, cx = 26 + (W - 52) * (kk + 0.5) / per, cy = 32 + rr * 74, col = cols[i < 3 ? 0 : i < 8 ? 1 : i < 12 ? 2 : 3];
        if (kk > 0) el('line', { x1: 26 + (W - 52) * (kk - 0.5) / per + 13, y1: cy, x2: cx - 13, y2: cy, stroke: c.border, 'stroke-width': 2 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + ': ' + EL_PARTS[i][0], style: 'cursor:pointer' }, svg);
        el('circle', { cx: cx, cy: cy, r: i + 1 === sel ? 14 : 11, fill: i + 1 === CUR ? col : c.surface, stroke: col, 'stroke-width': i + 1 === sel ? 3 : 2 }, g);
        txt(g, cx, cy + 4, String(i + 1), { size: fs(10), weight: 700, fill: i + 1 === CUR ? '#fff' : col });
        txt(g, cx, cy + 30, SHORT[i], { size: fs(9), fill: c.ink2 });
        (function (n) { g.addEventListener('click', function () { sel = n; draw(); }); keyClick(g, function () { sel = n; draw(); }); })(i + 1);
      }
      out.innerHTML = '<strong>Part ' + sel + ': ' + EL_PARTS[sel - 1][0] + '.</strong> ' + EL_PARTS[sel - 1][1] + (sel === CUR ? ' <em>(you are here)</em>' : '') + NOTE + 'Blue: logic (Parts 1–3). Green: the physics of switches (4–8). Amber: building computers (9–12). Teal: parallel and future computing (13–14).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: chiplet economics
     ----------------------------------------------------------------------- */
  FIG['fig-el-chiplet'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var area = 600, D = 0.1, ov = 8, N = 4;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ch-a', label: 'Total logic area (mm²)', min: 100, max: 1000, step: 10, value: area, onChange: function (x) { area = x; draw(); } });
    FIG.slider(controls, { id: 'ch-d', label: 'Defects per cm²', min: 0.02, max: 0.5, step: 0.01, value: D, onChange: function (x) { D = x; draw(); } });
    FIG.slider(controls, { id: 'ch-o', label: 'Extra area per chiplet for die-to-die links (%)', min: 0, max: 25, step: 1, value: ov, onChange: function (x) { ov = x; draw(); } });
    FIG.slider(controls, { id: 'ch-n', label: 'Number of chiplets', min: 1, max: 8, step: 1, value: N, onChange: function (x) { N = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function cost(n) { var a = n === 1 ? area : area / n * (1 + ov / 100), y = Math.exp(-a / 100 * D), asm = n === 1 ? 1 : Math.pow(0.99, n); return n * a / y / asm; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Silicon cost per working product against number of chiplets'), W = A.W, svg = A.svg, fs = A.fs;
      var base = cost(1), vals = [], mx = 0; for (var n = 1; n <= 8; n++) { vals.push(cost(n) / base); mx = Math.max(mx, cost(n) / base); }
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0.5, xh: 8.5, yl: 0, yh: Math.max(1.2, Math.ceil(mx * 5) / 5), xticks: [1, 2, 3, 4, 5, 6, 7, 8], yticks: [0, 0.5, 1], yfmt: function (v) { return fmt(v, 1); }, xlab: 'number of chiplets (1 = one monolithic die)', ylab: 'cost (× monolithic)' });
      vals.forEach(function (v, i) { var x = P.X(i + 1), bw = (P.X(2) - P.X(1)) * 0.6; el('rect', { x: x - bw / 2, y: P.Y(v), width: bw, height: P.Y(0) - P.Y(v), fill: i + 1 === N ? EC : c.border, rx: 3 }, svg); txt(svg, x, P.Y(v) - 4, fmt(v, 2), { size: fs(9), fill: i + 1 === N ? c.ink : c.muted, weight: i + 1 === N ? 700 : 400 }); });
      el('line', { x1: P.X(0.5), y1: P.Y(1), x2: P.X(8.5), y2: P.Y(1), stroke: AMBER, 'stroke-dasharray': '4 3' }, svg);
      legend(svg, c, fs, W, 'silicon cost per working product, including die-to-die area overhead and 99% assembly yield per chiplet', 'cost per working product');
      var yM = Math.exp(-area / 100 * D), yC = Math.exp(-area / N * (1 + ov / 100) / 100 * D);
      out.innerHTML = 'Monolithic die yield <strong>' + fmt(yM * 100, 0) + '%</strong>; each of ' + N + ' chiplets yields <strong>' + fmt(yC * 100, 0) + '%</strong>. Silicon cost per working product: <strong>' + fmt(cost(N) / base, 2) + '×</strong> the monolithic design.' + NOTE + 'Splitting a large design into smaller dies raises yield sharply (Part 10), and each chiplet can be tested before assembly so that only good ones are packaged. The costs are extra area for the interfaces between chiplets, assembly losses, and the energy and delay of sending signals between dies. Chiplets also let different parts be made in different processes: logic on the newest node, input/output and analogue circuits on cheaper ones. [Simple model: wafer cost proportional to area, Poisson yield.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: electrical versus optical links
     ----------------------------------------------------------------------- */
  FIG['fig-el-link'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 0.1, eo = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'lk-k', label: 'Electrical wire energy (pJ per bit per mm)', min: 0.02, max: 0.5, step: 0.01, value: k, onChange: function (x) { k = x; draw(); } });
    FIG.slider(controls, { id: 'lk-o', label: 'Optical link fixed energy (pJ per bit)', min: 0.1, max: 5, step: 0.1, value: eo, onChange: function (x) { eo = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Ee(L) { return 0.02 + k * L; }
    function Eo(L) { return eo + 1e-5 * L; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Energy per bit against link distance for electrical and optical links'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0.1, xh: 10000, yl: 0.01, yh: 1000, logx: true, logy: true, xticks: [0.1, 1, 10, 100, 1000, 10000], yticks: [0.01, 0.1, 1, 10, 100, 1000], xfmt: function (v) { return v < 1 ? '0.1 mm' : v < 1000 ? v + ' mm' : v / 1000 + ' m'; }, xlab: 'link distance', ylab: 'energy (pJ/bit)' });
      (W < 560 ? [[1, 'core'], [20, 'chip'], [200, 'board'], [3000, 'racks']] : [[1, 'across a core'], [20, 'across a chip'], [200, 'across a board'], [3000, 'between racks']]).forEach(function (z) { txt(svg, P.X(z[0]), 238, z[1], { size: fs(8), fill: c.muted }); });
      plotLine(svg, P, Ee, 0.1, 10000, 200, AMBER, 2.6, null, true); plotLine(svg, P, Eo, 0.1, 10000, 200, EC, 2.6, null, true);
      var Lx = (eo - 0.02) / k; if (Lx > 0.1 && Lx < 10000) { el('circle', { cx: P.X(Lx), cy: P.Y(Ee(Lx)), r: 5, fill: RED }, svg); txt(svg, P.X(Lx) + 6, P.Y(Ee(Lx)) + 16, 'crossover ' + (Lx < 1000 ? fmt(Lx, Lx < 10 ? 1 : 0) + ' mm' : fmt(Lx / 1000, 1) + ' m'), { anchor: 'start', size: fs(9), fill: RED }); }
      txt(svg, P.X(0.15), P.Y(Ee(0.15)) - 8, 'electrical wire', { anchor: 'start', size: fs(9), fill: AMBER, weight: 700 }); txt(svg, P.X(0.15), P.Y(Eo(0.15)) - 8, 'optical link', { anchor: 'start', size: fs(9), fill: EC, weight: 700 });
      legend(svg, c, fs, W, 'a wire’s energy grows with its length (more capacitance to charge); light costs a fixed amount to make and detect', 'wire: grows with length · light: fixed cost');
      out.innerHTML = 'Below about <strong>' + (Lx < 1000 ? fmt(Lx, Lx < 10 ? 1 : 0) + ' mm' : fmt(Lx / 1000, 1) + ' m') + '</strong> electrical wires use less energy per bit; beyond it, light wins. At 1 m, the wire costs ' + fmt(Ee(1000), 0) + ' pJ/bit and the optical link ' + fmt(Eo(1000), 1) + ' pJ/bit.' + NOTE + 'A wire is a capacitor that must be charged for every bit (Part 4), so its energy grows with length; at high data rates it also needs power-hungry equalisers. An optical link pays a fixed price for the laser, modulator and photodetector, but light travels through a fibre or waveguide with almost no loss. That is why long-distance links became optical decades ago, and why researchers are working to bring light ever closer to the chip, even inside the package. [Illustrative numbers.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a spiking neuron
     ----------------------------------------------------------------------- */
  FIG['fig-el-lif'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var RI = 20, tau = 20, noise = false;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'lf-i', label: 'Input drive R·I (mV)', min: 0, max: 50, step: 0.5, value: RI, onChange: function (x) { RI = x; draw(); } });
    FIG.slider(controls, { id: 'lf-t', label: 'Membrane time constant τ (ms)', min: 5, max: 50, step: 1, value: tau, onChange: function (x) { tau = x; draw(); } });
    choice(controls, 'Input noise', ['Off', 'On'], 0, function (i) { noise = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Membrane voltage of a leaky integrate-and-fire neuron'), W = A.W, svg = A.svg, fs = A.fs, th = 15, T = 500, dt = 0.1, v = 0, spikes = [], d = '', r = rngSeed(4), ref = 0;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: T, yl: -2, yh: 30, xticks: [0, 100, 200, 300, 400, 500], yticks: [0, 10, 20, 30], xlab: 'time (ms)', ylab: 'voltage above rest (mV)' });
      el('line', { x1: P.X(0), y1: P.Y(th), x2: P.X(T), y2: P.Y(th), stroke: RED, 'stroke-dasharray': '4 3' }, svg); txt(svg, P.X(T) - 2, P.Y(th) - 4, 'threshold', { anchor: 'end', size: fs(9), fill: RED });
      for (var k = 0; k <= T / dt; k++) { var t = k * dt, I = RI + (noise ? (r() - 0.5) * 2 * 60 : 0); if (ref > 0) { ref -= dt; v = 0; } else { v += dt / tau * (-v + I); if (v >= th) { spikes.push(t); v = 0; ref = 2; } } if (k % 5 === 0) d += (k ? 'L' : 'M') + P.X(t).toFixed(1) + ' ' + P.Y(v).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 1.8 }, svg);
      spikes.forEach(function (s) { el('line', { x1: P.X(s), y1: P.Y(th), x2: P.X(s), y2: P.Y(29), stroke: PURPLE, 'stroke-width': 1.6 }, svg); });
      legend(svg, c, fs, W, 'blue: membrane voltage integrating its input and leaking away · purple: spikes (the neuron then resets)', 'blue: voltage · purple: spikes');
      var rate = spikes.length / (T / 1000), pred = RI > th ? 1000 / (tau * Math.log(RI / (RI - th)) + 2) : 0;
      out.innerHTML = '<strong>' + spikes.length + ' spikes</strong> in 0.5 s: a rate of <strong>' + fmt(rate, 0) + ' per second</strong>' + (noise ? '' : ' (theory: ' + fmt(pred, 0) + ' Hz)') + '.' + NOTE + 'A leaky integrate-and-fire neuron, a model introduced by Louis Lapicque in 1907, adds up its input like a capacitor charging through a leaky resistor (Part 4), with τ = RC. When the voltage crosses a threshold it emits a spike and resets. Below threshold drive (R·I &lt; 15 mV) it never fires, unless noise kicks it over. Neuromorphic chips implement millions of such neurons, communicating only by sparse spikes, so they use energy only when something happens.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el14'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'The main economic advantage of chiplets is…', options: ['Smaller dies have much higher yield', 'They need no packaging', 'They run at higher voltage', 'They avoid lithography'], answer: 0, explanation: 'Yield falls roughly as e^(−AD).' },
      { question: 'Domain-specific accelerators gain efficiency mainly by…', options: ['Higher clock speeds', 'Tailoring hardware to one class of computation, cutting overheads and data movement', 'Using more cache only', 'Running older software'], answer: 1, explanation: 'Hennessy and Patterson’s “new golden age”.' },
      { question: 'Why do optical links win over long distances?', options: ['Light is free', 'A wire’s energy grows with length, while light costs a roughly fixed energy to generate and detect', 'Electrons are slower than light', 'Optical fibres are cheaper than copper'], answer: 1, explanation: 'There is a crossover length.' },
      { question: 'Neuromorphic chips such as TrueNorth and Loihi communicate using…', options: ['Clocked buses only', 'Sparse spikes, using energy mainly when events occur', 'Radio waves', 'Quantum entanglement'], answer: 1, explanation: 'Event-driven computing.' },
      { question: 'A leaky integrate-and-fire neuron fires when…', options: ['Its input is zero', 'Its membrane voltage crosses a threshold', 'The clock ticks', 'It runs out of energy'], answer: 1, explanation: 'Then it resets.' },
      { question: 'A memristor is…', options: ['A memory chip', 'A resistor whose resistance depends on the history of current through it', 'A type of transistor', 'An optical switch'], answer: 1, explanation: 'Proposed by Leon Chua in 1971.' },
      { question: 'Describing the full state of 50 qubits on a classical computer needs about…', options: ['50 numbers', '2500 numbers', '10¹⁵ complex numbers', '50² numbers'], answer: 2, explanation: '2⁵⁰ ≈ 1.1 × 10¹⁵ amplitudes.' },
      { question: 'Shor’s algorithm would let a large quantum computer…', options: ['Sort lists faster', 'Factor large numbers efficiently, breaking RSA encryption', 'Speed up all programs', 'Store more data'], answer: 1, explanation: 'Hence post-quantum cryptography.' },
      { question: 'Why is quantum error correction essential?', options: ['Qubits are perfectly stable', 'Physical qubits are noisy, so many must be combined to make reliable logical qubits', 'To save power', 'It is not needed'], answer: 1, explanation: 'Below threshold, bigger codes give fewer errors.' },
      { question: 'A modern logic gate switching about 0.1 fF at 0.7 V uses roughly how much more energy than Landauer’s limit?', options: ['About the same', 'About 10×', 'About 10⁴×', 'About 10¹⁰×'], answer: 2, explanation: '½CV² ≈ 2.5 × 10⁻¹⁷ J versus kT ln 2 ≈ 2.9 × 10⁻²¹ J.' }
    ]);
  };
})();
