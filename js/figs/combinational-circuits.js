/* ==========================================================================
   RNLearn — Combinational Circuits (From Switch to Supercomputer, Part 2)
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
    { name: 'Relay adders', color: '#b45309' },
    { name: 'Simplifying logic', color: '#1d4ed8' },
    { name: 'Fast arithmetic', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1937', icon: '🍳', era: 0, sec: 5, title: 'The kitchen-table adder', text: 'George Stibitz at Bell Labs builds a relay circuit on his kitchen table that adds two binary digits, later called the Model K.' },
    { year: '1952', icon: '🗺️', era: 1, sec: 3, title: 'Veitch charts', text: 'Edward Veitch publishes a chart method for simplifying logic functions.' },
    { year: '1952', icon: '✍️', era: 1, sec: 3, title: 'Quine’s method', text: 'Willard Van Orman Quine describes how to find the simplest form of a truth function.' },
    { year: '1953', icon: '🟩', era: 1, sec: 3, title: 'Karnaugh maps', text: 'Maurice Karnaugh refines the chart into the map now taught to every engineering student.' },
    { year: '1956', icon: '📋', era: 1, sec: 3, title: 'Quine–McCluskey', text: 'Edward McCluskey turns Quine’s method into a systematic tabular algorithm suitable for computers.' },
    { year: '1958', icon: '⚡', era: 2, sec: 7, title: 'Carry lookahead', text: 'Arnold Weinberger and John Smith describe logic for high-speed addition that avoids waiting for carries to ripple.' },
    { year: '1964', icon: '🖥️', era: 2, sec: 6, title: 'Two’s complement goes mainstream', text: 'IBM’s System/360 uses two’s complement for binary integers, the convention almost all computers follow today.' },
    { year: '1973', icon: '🌳', era: 2, sec: 7, title: 'Parallel prefix adders', text: 'Peter Kogge and Harold Stone publish a parallel algorithm that computes all carries in logarithmic time.' }
  ];

  FIG['fig-el2-timeline'] = function (figEl) {
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

  var EL_PART = 2;
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
  /* Quine–McCluskey prime implicants and an exact minimum cover (n ≤ 4 variables) */
  function primeImplicants(n, ones, dcs) {
    var terms = ones.concat(dcs).map(function (m) { return { v: m, mask: 0, ms: [m] }; }), primes = [], key = function (t) { return t.v + '/' + t.mask; };
    while (terms.length) {
      var next = {}, used = {};
      for (var i = 0; i < terms.length; i++) for (var j = i + 1; j < terms.length; j++) {
        var a = terms[i], b = terms[j]; if (a.mask !== b.mask) continue; var d = a.v ^ b.v; if (d && !(d & (d - 1))) { var t = { v: a.v & ~d, mask: a.mask | d, ms: a.ms.concat(b.ms) }; next[key(t)] = t; used[key(a)] = used[key(b)] = true; }
      }
      terms.forEach(function (t) { if (!used[key(t)] && !primes.some(function (p) { return key(p) === key(t); })) primes.push(t); });
      terms = Object.keys(next).map(function (k) { return next[k]; });
    }
    primes.forEach(function (p) { p.ms = p.ms.filter(function (m, i, a) { return a.indexOf(m) === i; }); });
    return primes;
  }
  function literals(p, n) { var c = 0; for (var b = 0; b < n; b++) if (!(p.mask & (1 << b))) c++; return c; }
  function minimalCover(n, ones, dcs) {
    if (!ones.length) return [];
    var P = primeImplicants(n, ones, dcs).filter(function (p) { return p.ms.some(function (m) { return ones.indexOf(m) >= 0; }); }), best = null;
    var N = P.length;
    for (var k = 1; k <= N && !best; k++) {
      (function rec(start, chosen) {
        if (chosen.length === k) { var cov = ones.every(function (m) { return chosen.some(function (p) { return p.ms.indexOf(m) >= 0; }); }); if (cov) { var lit = chosen.reduce(function (s, p) { return s + literals(p, n); }, 0); if (!best || lit < best.lit) best = { set: chosen.slice(), lit: lit }; } return; }
        for (var i = start; i < N; i++) { chosen.push(P[i]); rec(i + 1, chosen); chosen.pop(); }
      })(0, []);
    }
    return best ? best.set : [];
  }
  function termString(p, n, names) { var s = ''; for (var b = n - 1; b >= 0; b--) { if (p.mask & (1 << b)) continue; s += names[n - 1 - b] + ((p.v >> b) & 1 ? '' : '̅'); } return s || '1'; }

  /* -----------------------------------------------------------------------
     Figure: a Karnaugh map with automatic simplification
     ----------------------------------------------------------------------- */
  var GRAY = [0, 1, 3, 2];
  FIG['fig-el-kmap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var cells = new Array(16).fill(0), PRESETS = [['Example: B̅D̅ + BD', [0, 2, 5, 7, 8, 10, 13, 15], []], ['Majority of A, B, C (D ignored)', [6, 7, 10, 11, 12, 13, 14, 15], []], ['With don’t-cares', [1, 3, 7, 11, 15], [0, 2, 5]], ['Clear', [], []]];
    function load(i) { cells = new Array(16).fill(0); PRESETS[i][1].forEach(function (m) { cells[m] = 1; }); PRESETS[i][2].forEach(function (m) { cells[m] = 2; }); }
    load(0);
    var controls = div('fig-controls', container);
    choice(controls, 'Start from', PRESETS.map(function (p) { return p[0]; }), 0, function (i) { load(i); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var GCOL = ['#2563eb', '#16a34a', '#d97706', '#a21caf', '#dc2626', '#0891b2'];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Karnaugh map'), W = A.W, svg = A.svg, fs = A.fs, cs = Math.min(52, (W - 120) / 4), L = Math.max(70, (W - cs * 4) / 2), T = 56;
      var ones = [], dcs = []; cells.forEach(function (v, m) { if (v === 1) ones.push(m); if (v === 2) dcs.push(m); });
      var cover = minimalCover(4, ones, dcs);
      txt(svg, L - 10, T - 10, 'AB \\ CD', { anchor: 'end', size: fs(10), fill: c.muted });
      GRAY.forEach(function (g, j) { txt(svg, L + j * cs + cs / 2, T - 10, ('0' + g.toString(2)).slice(-2), { size: fs(10), fill: c.ink2 }); txt(svg, L - 10, T + j * cs + cs / 2 + 4, ('0' + g.toString(2)).slice(-2), { anchor: 'end', size: fs(10), fill: c.ink2 }); });
      for (var r = 0; r < 4; r++) for (var q = 0; q < 4; q++) {
        var m = GRAY[r] * 4 + GRAY[q], v = cells[m], x = L + q * cs, y = T + r * cs, g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'minterm ' + m + ' value ' + (v === 2 ? 'don’t care' : v), style: 'cursor:pointer' }, svg);
        el('rect', { x: x, y: y, width: cs, height: cs, fill: v === 1 ? EC + '22' : c.surface, stroke: c.border }, g);
        txt(g, x + cs / 2, y + cs / 2 + 6, v === 2 ? '×' : String(v), { size: fs(16), fill: v ? c.ink : c.muted, weight: v ? 700 : 400 });
        txt(g, x + 4, y + 11, String(m), { anchor: 'start', size: fs(8), fill: c.muted });
        (function (mm) { var f = function () { cells[mm] = (cells[mm] + 1) % 3; draw(); }; g.addEventListener('click', f); keyClick(g, f); })(m);
      }
      cover.forEach(function (p, k) {
        var col = GCOL[k % GCOL.length];
        p.ms.forEach(function (m) { var r2 = GRAY.indexOf(m >> 2), q2 = GRAY.indexOf(m & 3); el('rect', { x: L + q2 * cs + 3 + k * 2, y: T + r2 * cs + 3 + k * 2, width: cs - 6 - k * 4, height: cs - 6 - k * 4, rx: 8, fill: 'none', stroke: col, 'stroke-width': 2.5 }, svg); });
      });
      txt(svg, 10, 14, 'tap a cell to cycle 0 → 1 → × (don’t care) · coloured loops: the groups used', { anchor: 'start', size: fs(W < 520 ? 8 : 10), fill: c.muted });
      var expr = ones.length === 0 ? '0' : ones.length + dcs.length === 16 && cover.length === 1 && cover[0].mask === 15 ? '1' : cover.map(function (p, k) { return '<span style="color:' + GCOL[k % GCOL.length] + '">' + termString(p, 4, ['A', 'B', 'C', 'D']) + '</span>'; }).join(' + ');
      var lit = cover.reduce(function (s, p) { return s + literals(p, 4); }, 0);
      out.innerHTML = 'Simplest sum of products: <strong>F = ' + expr + '</strong> (' + cover.length + ' term' + (cover.length === 1 ? '' : 's') + ', ' + lit + ' literals; the unsimplified form has ' + ones.length + ' terms of 4 literals each).' + NOTE + 'Rows and columns follow Gray-code order (00, 01, 11, 10), so neighbouring cells differ in one variable, and the map wraps around at the edges. Each loop covers 1, 2, 4 or 8 cells that share the same values of some variables; the bigger the loop, the fewer the variables in its term. Don’t-care cells (×) may be included in loops if that helps. The simplification here is computed exactly (Quine–McCluskey method).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: multiplexer and decoder
     ----------------------------------------------------------------------- */
  FIG['fig-el-mux'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, s1 = 1, s0 = 0, D = [0, 1, 1, 0];
    var controls = div('fig-controls', container);
    choice(controls, 'Circuit', ['4-to-1 multiplexer', '2-to-4 decoder'], 0, function (i) { mode = i; draw(); });
    var row = group(controls, 'Select lines');
    var b1 = btn('S1 = 1', row), b0 = btn('S0 = 0', row);
    b1.addEventListener('click', function () { s1 = 1 - s1; draw(); }); b0.addEventListener('click', function () { s0 = 1 - s0; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      b1.textContent = 'S1 = ' + s1; b0.textContent = 'S0 = ' + s0;
      var c = C(), A = newSVG(svgWrap, container, 230, 'Multiplexer or decoder'), W = A.W, svg = A.svg, fs = A.fs, sel = s1 * 2 + s0, cx = W / 2, T = 40, H = 150;
      el('path', { d: 'M' + (cx - 40) + ' ' + T + 'L' + (cx + 40) + ' ' + (T + 30) + 'L' + (cx + 40) + ' ' + (T + H - 30) + 'L' + (cx - 40) + ' ' + (T + H) + 'Z', fill: c.surface, stroke: c.ink2, 'stroke-width': 2 }, svg);
      if (mode === 0) {
        txt(svg, cx, T + H / 2 + 4, 'MUX', { size: fs(12), fill: c.ink2, weight: 700 });
        D.forEach(function (d, i) { var y = T + 25 + i * (H - 50) / 3, on = i === sel, g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'input D' + i, style: 'cursor:pointer' }, svg); el('line', { x1: cx - 150, y1: y, x2: cx - 40, y2: y, stroke: on ? EC : c.muted, 'stroke-width': on ? 3 : 1.5 }, g); el('rect', { x: cx - 190, y: y - 12, width: 36, height: 24, rx: 5, fill: d ? EC : c.surface, stroke: c.border }, g); txt(g, cx - 172, y + 5, 'D' + i + '=' + d, { size: fs(9), fill: d ? '#fff' : c.ink2 }); (function (k) { var f = function () { D[k] = 1 - D[k]; draw(); }; g.addEventListener('click', f); keyClick(g, f); })(i); if (on) el('path', { d: 'M' + (cx - 40) + ' ' + y + 'L' + (cx + 40) + ' ' + (T + H / 2), stroke: EC, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', fill: 'none' }, svg); });
        var Y = D[sel]; el('line', { x1: cx + 40, y1: T + H / 2, x2: cx + 140, y2: T + H / 2, stroke: Y ? EC : c.muted, 'stroke-width': 3 }, svg); txt(svg, cx + 148, T + H / 2 + 4, 'Y = ' + Y, { anchor: 'start', size: fs(12), fill: c.ink, weight: 700 });
        out.innerHTML = 'Select lines S1S0 = ' + s1 + s0 + ' (= ' + sel + ') route input <strong>D' + sel + '</strong> to the output: Y = <strong>' + Y + '</strong>. Tap the inputs to change them.' + NOTE + 'A multiplexer is a data selector: Y = S̅1S̅0·D0 + S̅1S0·D1 + S1S̅0·D2 + S1S0·D3. Processors use multiplexers everywhere to choose which register or result flows on. Setting the data inputs to a function’s truth table turns a multiplexer into any logic function of its select inputs, the principle behind lookup tables in programmable chips (FPGAs).</span>';
      } else {
        txt(svg, cx, T + H / 2 + 4, 'DEC', { size: fs(12), fill: c.ink2, weight: 700 });
        el('line', { x1: cx - 140, y1: T + H / 2 - 20, x2: cx - 40, y2: T + H / 2 - 20, stroke: s1 ? EC : c.muted, 'stroke-width': 2.5 }, svg); el('line', { x1: cx - 140, y1: T + H / 2 + 20, x2: cx - 40, y2: T + H / 2 + 20, stroke: s0 ? EC : c.muted, 'stroke-width': 2.5 }, svg);
        txt(svg, cx - 146, T + H / 2 - 16, 'S1=' + s1, { anchor: 'end', size: fs(10), fill: c.ink2 }); txt(svg, cx - 146, T + H / 2 + 24, 'S0=' + s0, { anchor: 'end', size: fs(10), fill: c.ink2 });
        for (var i = 0; i < 4; i++) { var y = T + 25 + i * (H - 50) / 3, on = i === sel; el('line', { x1: cx + 40, y1: y, x2: cx + 140, y2: y, stroke: on ? EC : c.muted, 'stroke-width': on ? 3 : 1.5 }, svg); el('circle', { cx: cx + 152, cy: y, r: 8, fill: on ? '#facc15' : c.surface, stroke: c.ink2 }, svg); txt(svg, cx + 166, y + 4, 'Y' + i + ' = ' + (on ? 1 : 0), { anchor: 'start', size: fs(10), fill: c.ink2 }); }
        out.innerHTML = 'Input S1S0 = ' + s1 + s0 + ' activates exactly one output: <strong>Y' + sel + '</strong>.' + NOTE + 'A decoder turns an n-bit number into one of 2ⁿ lines. Memory chips use decoders to select one row out of thousands from the address bits; processors use them to turn instruction bits into control signals.</span>';
      }
      txt(svg, 10, 14, mode === 0 ? 'the select lines choose which input reaches the output' : 'exactly one output is 1 for each input number', { anchor: 'start', size: fs(10), fill: c.muted });
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a 4-bit adder / subtractor with two's complement
     ----------------------------------------------------------------------- */
  FIG['fig-el-adder'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Ab = [0, 1, 1, 0], Bb = [0, 1, 1, 1], sub = false;
    var controls = div('fig-controls', container);
    choice(controls, 'Operation', ['A + B', 'A − B (add two’s complement)'], 0, function (i) { sub = i === 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function toInt(b) { return b.reduce(function (s, x) { return s * 2 + x; }, 0); }
    function signed(b) { var u = toInt(b); return u >= 8 ? u - 16 : u; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Four-bit ripple-carry adder'), W = A.W, svg = A.svg, fs = A.fs, cw = Math.min(110, (W - 40) / 4), L = (W - cw * 4) / 2;
      var Beff = Bb.map(function (b) { return sub ? 1 - b : b; }), carry = sub ? 1 : 0, S = [0, 0, 0, 0], C4 = [];
      for (var i = 3; i >= 0; i--) { var s = Ab[i] ^ Beff[i] ^ carry, co = (Ab[i] & Beff[i]) | (carry & (Ab[i] ^ Beff[i])); S[i] = s; C4[i] = co; carry = co; }
      var cin = sub ? 1 : 0, cout = C4[0], cIntoMSB = 3 > 0 ? C4[1] : cin, ovf = cout !== cIntoMSB;
      ['A', 'B'].forEach(function (nm, r) { var arr = r ? Bb : Ab; txt(svg, L - 8, 46 + r * 30, nm, { anchor: 'end', size: fs(11), fill: c.ink2, weight: 700 }); arr.forEach(function (bv, i) { var x = L + i * cw + cw / 2, g = el('g', { tabindex: 0, role: 'button', 'aria-label': nm + ' bit ' + (3 - i), style: 'cursor:pointer' }, svg); el('rect', { x: x - 16, y: 30 + r * 30, width: 32, height: 24, rx: 5, fill: bv ? EC : c.surface, stroke: c.border }, g); txt(g, x, 47 + r * 30, String(bv), { size: fs(12), fill: bv ? '#fff' : c.ink2, weight: 700 }); (function (ar, k) { var f = function () { ar[k] = 1 - ar[k]; draw(); }; g.addEventListener('click', f); keyClick(g, f); })(arr, i); }); });
      for (i = 0; i < 4; i++) {
        var x = L + i * cw, cxx = x + cw / 2;
        el('rect', { x: x + 10, y: 100, width: cw - 20, height: 50, rx: 6, fill: c.surface, stroke: c.ink2 }, svg); txt(svg, cxx, 129, 'FA', { size: fs(11), fill: c.ink2 });
        txt(svg, cxx, 172, String(S[i]), { size: fs(15), fill: c.ink, weight: 700 });
        var cin_i = i === 3 ? cin : C4[i + 1];
        el('path', { d: 'M' + (x + cw + 10) + ' 125 L' + (x + cw - 10) + ' 125', stroke: cin_i ? EC : c.muted, 'stroke-width': cin_i ? 3 : 1.5 }, svg);
        txt(svg, x + cw, 118, 'c=' + cin_i, { size: fs(8), fill: cin_i ? EC : c.muted });
      }
      txt(svg, L - 6, 129, 'c=' + cout, { anchor: 'end', size: fs(9), fill: cout ? EC : c.muted });
      txt(svg, L - 8, 172, 'S', { anchor: 'end', size: fs(11), fill: c.ink2, weight: 700 });
      if (sub) txt(svg, W / 2, 210, 'B is inverted and the first carry-in is 1: A + (NOT B) + 1 = A − B', { size: fs(10), fill: c.muted });
      txt(svg, 10, 14, 'tap the bits of A and B · FA = full adder · c = carry', { anchor: 'start', size: fs(10), fill: c.muted });
      var uA = toInt(Ab), uB = toInt(Bb), uS = toInt(S);
      out.innerHTML = (sub ? 'A − B' : 'A + B') + ': ' + Ab.join('') + (sub ? ' − ' : ' + ') + Bb.join('') + ' = <strong>' + S.join('') + '</strong>' + (cout && !sub ? ' with carry out 1' : '') + '. As unsigned numbers: ' + uA + (sub ? ' − ' : ' + ') + uB + ' → ' + uS + (sub ? (uA < uB ? ' (borrow: the true answer is negative)' : '') : (cout ? ' (true sum ' + (uA + uB) + ' does not fit in 4 bits)' : '')) + '. As signed (two’s complement): ' + signed(Ab) + (sub ? ' − ' : ' + ') + signed(Bb) + ' → <strong>' + signed(S) + '</strong>' + (ovf ? ' <span style="color:#dc2626">— overflow! the true result ' + (sub ? signed(Ab) - signed(Bb) : signed(Ab) + signed(Bb)) + ' is outside −8…7</span>' : '') + '.' + NOTE + 'Each full adder adds two bits and a carry: S = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B). In two’s complement the leftmost bit has weight −8, so the same adder handles negative numbers, and subtraction is addition of the inverted B plus one. Signed overflow happens when the carry into the leftmost bit differs from the carry out of it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: ripple-carry versus carry-lookahead delay
     ----------------------------------------------------------------------- */
  FIG['fig-el-carry'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nb = 32, tg = 15;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cy-n', label: 'Bits in the adder', min: 4, max: 64, step: 4, value: nb, onChange: function (x) { nb = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'cy-t', label: 'Gate delay (picoseconds)', min: 5, max: 50, step: 5, value: tg, onChange: function (x) { tg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function ripple(n) { return 2 * n; }
    function prefix(n) { return 2 * Math.ceil(Math.log2(n)) + 2; }
    function draw() {
      valText(s1, String(nb)); valText(s2, String(tg));
      var c = C(), A = newSVG(svgWrap, container, 240, 'Worst-case adder delay in gate delays against number of bits'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 26, B: 196, xl: 4, xh: 64, yl: 0, yh: 130, xticks: [4, 16, 32, 48, 64], yticks: [0, 32, 64, 96, 128], xlab: 'bits', ylab: 'gate delays' });
      plotLine(svg, P, ripple, 4, 64, 60, RED, 2.4); plotLine(svg, P, prefix, 4, 64, 240, EC, 2.4);
      el('line', { x1: P.X(nb), y1: 26, x2: P.X(nb), y2: 196, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      legend(svg, c, fs, W, 'red: ripple carry (2n gate delays) · teal: parallel-prefix lookahead (about 2 log₂ n + 2)', 'red: ripple · teal: lookahead');
      var r = ripple(nb), p = prefix(nb);
      out.innerHTML = nb + '-bit adder: ripple carry ' + r + ' gate delays = <strong>' + r * tg + ' ps</strong>; parallel-prefix lookahead ' + p + ' gate delays = <strong>' + p * tg + ' ps</strong>, ' + fmt(r / p, 1) + ' times faster.' + NOTE + 'In a ripple-carry adder each bit must wait for the carry from the bit before, so the delay grows in proportion to the number of bits. Carry-lookahead logic computes from the inputs whether each group of bits will generate or propagate a carry, so all carries are found in a time that grows only with the logarithm of the width, at the cost of more gates. (Idealised gate counts; real adders vary in detail.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why are Karnaugh map rows ordered 00, 01, 11, 10?', options: ['Alphabetical order', 'So that neighbouring cells differ in only one variable (Gray code)', 'To save space', 'It is arbitrary'], answer: 1, explanation: 'Adjacent 1s can then be grouped and a variable eliminated.' },
      { question: 'A group of 4 adjacent 1s in a 4-variable K-map gives a term with how many variables?', options: ['4', '3', '2', '1'], answer: 2, explanation: 'Each doubling of the group removes one variable.' },
      { question: 'What does a “don’t-care” entry allow?', options: ['Ignoring the output entirely', 'Treating the cell as 0 or 1, whichever makes the circuit simpler', 'Deleting an input', 'Adding a clock'], answer: 1, explanation: 'Used for input combinations that never occur.' },
      { question: 'A 4-to-1 multiplexer needs how many select lines?', options: ['1', '2', '3', '4'], answer: 1, explanation: '2² = 4 inputs.' },
      { question: 'For a full adder, the sum bit is…', options: ['A AND B', 'A XOR B XOR Cin', 'A OR B', 'NOT A'], answer: 1, explanation: 'And Cout = AB + Cin(A XOR B).' },
      { question: 'What is −5 in 8-bit two’s complement?', options: ['10000101', '11111011', '11111010', '00000101'], answer: 1, explanation: 'Invert 00000101 → 11111010, add 1 → 11111011.' },
      { question: 'In 4-bit signed arithmetic, 0111 + 0001 gives…', options: ['1000 = 8', '1000 = −8: overflow', '0000', 'An error message'], answer: 1, explanation: '7 + 1 = 8 does not fit in −8…7.' },
      { question: 'How do most computers subtract?', options: ['With a separate subtractor', 'By adding the two’s complement of the second number', 'By repeated division', 'In decimal'], answer: 1, explanation: 'The same adder does both.' },
      { question: 'Why are ripple-carry adders slow for wide numbers?', options: ['They use more power', 'Each bit waits for the carry from the previous bit, so delay grows with width', 'They need a clock', 'They cannot add negatives'], answer: 1, explanation: 'Lookahead adders fix this.' },
      { question: 'Roughly how does a parallel-prefix adder’s delay grow with the number of bits n?', options: ['Like n²', 'Like n', 'Like log n', 'It does not grow'], answer: 2, explanation: 'Kogge and Stone, 1973.' }
    ]);
  };
})();
