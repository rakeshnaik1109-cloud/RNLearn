/* ==========================================================================
   RNLearn — Memory and Time (From Switch to Supercomputer, Part 3)
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
    { name: 'Circuits that remember', color: '#b45309' },
    { name: 'Theory of machines', color: '#1d4ed8' },
    { name: 'Memory on chips', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1918', icon: '🔁', era: 0, sec: 3, title: 'The flip-flop', text: 'William Eccles and Frank Jordan invent a two-state “trigger relay” from vacuum tubes, the first electronic flip-flop (published 1919).' },
    { year: '1951', icon: '🧲', era: 0, sec: 6, title: 'Magnetic-core memory', text: 'Jay Forrester describes storing bits in tiny magnetic rings, the main computer memory for two decades.' },
    { year: '1955', icon: '⚙️', era: 1, sec: 7, title: 'Mealy machines', text: 'George Mealy formalises state machines whose outputs depend on state and input.' },
    { year: '1956', icon: '🔣', era: 1, sec: 7, title: 'Moore machines', text: 'Edward Moore analyses machines whose outputs depend only on their state.' },
    { year: '1966', icon: '💡', era: 2, sec: 6, title: 'One-transistor DRAM', text: 'Robert Dennard at IBM invents dynamic memory that stores a bit as charge on one capacitor with one transistor (patented 1968).' },
    { year: '1970', icon: '🔲', era: 2, sec: 6, title: 'DRAM on sale', text: 'Intel’s 1103 becomes the first commercially successful DRAM chip, starting the end of core memory.' },
    { year: '1973', icon: '⚠️', era: 1, sec: 8, title: 'Metastability recognised', text: 'Thomas Chaney and Charles Molnar publish evidence that flip-flops can hang between 0 and 1 for unbounded time.' }
  ];

  FIG['fig-el3-timeline'] = function (figEl) {
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

  var EL_PART = 3;
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
     Figure: SR latch and D latch
     ----------------------------------------------------------------------- */
  FIG['fig-el-latch'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, S = 0, R = 0, D = 1, E = 0, Q = 0, hist = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var controls = div('fig-controls', container);
    choice(controls, 'Circuit', ['SR latch (two NOR gates)', 'D latch'], 0, function (i) { mode = i; S = R = 0; E = 0; update(); });
    var row = group(controls, 'Inputs');
    var b1 = btn('', row), b2 = btn('', row);
    b1.addEventListener('click', function () { if (mode) D = 1 - D; else S = 1 - S; update(); });
    b2.addEventListener('click', function () { if (mode) E = 1 - E; else R = 1 - R; update(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function update() { var s = mode ? (E & D) : S, r = mode ? (E & (1 - D)) : R; if (s && !r) Q = 1; else if (r && !s) Q = 0; hist.push(Q); if (hist.length > 24) hist.shift(); draw(s, r); }
    function draw(s, r) {
      b1.textContent = mode ? 'D = ' + D : 'S (set) = ' + S; b2.textContent = mode ? 'Enable = ' + E : 'R (reset) = ' + R;
      var c = C(), A = newSVG(svgWrap, container, 210, 'Cross-coupled latch'), W = A.W, svg = A.svg, fs = A.fs, cx = Math.max(150, W * 0.35), bad = s && r;
      var Qn = bad ? 0 : Q, Qb = bad ? 0 : 1 - Q;
      var G1 = drawGate(svg, c, 'NOR', cx, 60, 80, Qn), G2 = drawGate(svg, c, 'NOR', cx, 150, 80, Qb);
      el('line', { x1: cx - 120, y1: G1.inA[1], x2: G1.inA[0], y2: G1.inA[1], stroke: r ? EC : c.muted, 'stroke-width': r ? 3 : 1.5 }, svg); txt(svg, cx - 126, G1.inA[1] + 4, (mode ? 'R′' : 'R') + '=' + r, { anchor: 'end', size: fs(10), fill: c.ink2 });
      el('line', { x1: cx - 120, y1: G2.inB[1], x2: G2.inB[0], y2: G2.inB[1], stroke: s ? EC : c.muted, 'stroke-width': s ? 3 : 1.5 }, svg); txt(svg, cx - 126, G2.inB[1] + 4, (mode ? 'S′' : 'S') + '=' + s, { anchor: 'end', size: fs(10), fill: c.ink2 });
      el('path', { d: 'M' + G1.out[0] + ' 60 L' + (G1.out[0] + 20) + ' 60 L' + (G1.out[0] + 20) + ' 95 L' + (cx - 60) + ' 120 L' + (cx - 60) + ' ' + G2.inA[1] + ' L' + G2.inA[0] + ' ' + G2.inA[1], fill: 'none', stroke: Qn ? EC : c.muted, 'stroke-width': 2 }, svg);
      el('path', { d: 'M' + G2.out[0] + ' 150 L' + (G2.out[0] + 30) + ' 150 L' + (G2.out[0] + 30) + ' 112 L' + (cx - 70) + ' 92 L' + (cx - 70) + ' ' + G1.inB[1] + ' L' + G1.inB[0] + ' ' + G1.inB[1], fill: 'none', stroke: Qb ? EC : c.muted, 'stroke-width': 2 }, svg);
      txt(svg, G1.out[0] + 28, 64, 'Q = ' + Qn, { anchor: 'start', size: fs(12), fill: c.ink, weight: 700 }); txt(svg, G2.out[0] + 38, 154, 'Q̅ = ' + Qb, { anchor: 'start', size: fs(12), fill: c.ink, weight: 700 });
      var hx = Math.max(cx + 170, W * 0.62), hw = W - hx - 14;
      if (hw > 80) { txt(svg, hx, 30, 'Q over time', { anchor: 'start', size: fs(10), fill: c.muted }); var d = ''; hist.forEach(function (q, i) { var x = hx + i * hw / 24, y = q ? 50 : 80; d += (i ? 'L' + x + ' ' + (d ? y : y) : 'M' + x + ' ' + y) + 'L' + (x + hw / 24) + ' ' + y; }); el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2 }, svg); }
      txt(svg, 10, 14, mode ? 'the D latch feeds S′ = E·D and R′ = E·D̅ into the same NOR pair' : 'each gate’s output feeds back into the other gate', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (bad ? '<strong style="color:#dc2626">S = R = 1: both outputs forced to 0 — the forbidden state.</strong> Releasing both together leaves the latch in an unpredictable state.' : 'Stored bit Q = <strong>' + Q + '</strong>.') + NOTE + (mode ? 'When Enable is 1 the latch is “transparent”: Q follows D. When Enable returns to 0, Q holds the last value of D, however D changes afterwards. That is one bit of memory.' : 'Set (S = 1) makes Q = 1; Reset (R = 1) makes Q = 0. With both at 0, the feedback loop holds whichever value was last written: the circuit remembers.') + '</span>';
    }
    update();
    window.addEventListener('resize', function () { draw(mode ? (E & D) : S, mode ? (E & (1 - D)) : R); });
    onTheme(function () { draw(mode ? (E & D) : S, mode ? (E & (1 - D)) : R); });
  };

  /* -----------------------------------------------------------------------
     Figure: latch versus edge-triggered flip-flop timing
     ----------------------------------------------------------------------- */
  FIG['fig-el-dff'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 32, Dw = [0,0,0,1,1,1,0,1,1,0,0,0,1,0,0,1,1,1,1,0,0,1,0,1,0,0,1,1,1,0,0,0];
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function clk(t) { return Math.floor(t / 4) % 2; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Timing diagram of a D latch and a D flip-flop'), W = A.W, svg = A.svg, fs = A.fs, L = 92, R = W - 12, tw = (R - L) / N;
      var latch = [], ff = [], q1 = 0, q2 = 0;
      for (var t = 0; t < N; t++) { if (clk(t)) q1 = Dw[t]; if (t > 0 && clk(t) === 1 && clk(t - 1) === 0) q2 = Dw[t]; latch.push(q1); ff.push(q2); }
      var rows = [['clock', function (t) { return clk(t); }, c.ink2], ['D (tap to edit)', function (t) { return Dw[t]; }, AMBER], ['D latch Q', function (t) { return latch[t]; }, PURPLE], ['flip-flop Q', function (t) { return ff[t]; }, EC]];
      rows.forEach(function (r, k) {
        var y0 = 46 + k * 50, hi = y0, lo = y0 + 26, d = '';
        txt(svg, L - 8, y0 + 18, r[0], { anchor: 'end', size: fs(10), fill: c.ink2 });
        for (var t2 = 0; t2 < N; t2++) { var y = r[1](t2) ? hi : lo, x = L + t2 * tw; d += (t2 ? 'L' + x + ' ' + y : 'M' + x + ' ' + y) + 'L' + (x + tw) + ' ' + y; }
        el('path', { d: d, fill: 'none', stroke: r[2], 'stroke-width': 2.2 }, svg);
      });
      for (var t3 = 0; t3 < N; t3++) { if (t3 > 0 && clk(t3) && !clk(t3 - 1)) el('line', { x1: L + t3 * tw, y1: 40, x2: L + t3 * tw, y2: 240, stroke: c.border, 'stroke-dasharray': '3 3' }, svg);
        var g = el('rect', { x: L + t3 * tw, y: 92, width: tw, height: 34, fill: 'transparent', style: 'cursor:pointer' }, svg); (function (k) { g.addEventListener('click', function () { Dw[k] = 1 - Dw[k]; draw(); }); })(t3); }
      legend(svg, c, fs, W, 'dashed lines: rising clock edges · tap the D trace to change it', 'dashed: rising edges · tap D to edit');
      var chL = 0, chF = 0; for (t = 1; t < N; t++) { if (latch[t] !== latch[t - 1]) chL++; if (ff[t] !== ff[t - 1]) chF++; }
      out.innerHTML = 'Output changes: D latch <strong>' + chL + '</strong>, flip-flop <strong>' + chF + '</strong>.' + NOTE + 'The latch is transparent for the whole time the clock is high, so glitches in D pass straight through. The edge-triggered flip-flop samples D only at the instant the clock rises and holds it for the whole cycle. Building systems from flip-flops means every stage changes together, once per clock cycle, which makes large designs predictable.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a binary counter
     ----------------------------------------------------------------------- */
  FIG['fig-el-counter'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mod = 16, count = 0, hist = [0], running = false, last = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Counter', ['4-bit binary (0–15)', 'Decade (0–9)'], 0, function (i) { mod = i ? 10 : 16; count = 0; hist = [0]; draw(); });
    var row = group(controls, 'Clock');
    btn('One clock pulse', row).addEventListener('click', function () { tick(); });
    var bRun = btn('Run', row); bRun.addEventListener('click', function () { running = !running; bRun.textContent = running ? 'Stop' : 'Run'; });
    btn('Reset', row).addEventListener('click', function () { count = 0; hist = [0]; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function tick() { count = (count + 1) % mod; hist.push(count); if (hist.length > 33) hist.shift(); draw(); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Counter outputs as waveforms'), W = A.W, svg = A.svg, fs = A.fs, L = 70, R = W - 12, n = 32, tw = (R - L) / n;
      for (var b = 0; b < 4; b++) {
        var y0 = 40 + b * 46, d = '';
        txt(svg, L - 8, y0 + 18, 'Q' + b + ' (÷' + Math.pow(2, b + 1) + ')', { anchor: 'end', size: fs(10), fill: c.ink2 });
        hist.forEach(function (v, i) { var y = (v >> b) & 1 ? y0 : y0 + 24, x = L + i * tw; d += (i ? 'L' + x + ' ' + y : 'M' + x + ' ' + y) + 'L' + (x + tw) + ' ' + y; });
        el('path', { d: d, fill: 'none', stroke: [EC, BLUE, PURPLE, AMBER][b], 'stroke-width': 2.2 }, svg);
      }
      txt(svg, 10, 14, 'each output toggles at half the rate of the one above it', { anchor: 'start', size: fs(10), fill: c.muted });
      var bits = ('000' + count.toString(2)).slice(-4);
      txt(svg, W - 14, 236, 'count = ' + bits + ' = ' + count, { anchor: 'end', size: fs(12), fill: c.ink, weight: 700 });
      out.innerHTML = 'Count <strong>' + bits + '</strong> = ' + count + (mod === 10 ? ' (decade counter: after 9 it resets to 0)' : '') + '.' + NOTE + 'Four flip-flops store the count; on each clock pulse, logic computes count + 1 and the flip-flops load it. Output Q0 toggles every pulse, Q1 every 2, Q2 every 4, Q3 every 8, so each divides the clock frequency by 2: a 4-bit counter divides by 16. Counters time everything from watches (counting 32,768 crystal oscillations per second, 2¹⁵) to processor instructions.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function (now) { if (!running) return; if (!last || now - last > 350) { last = now; tick(); } });
  };

  /* -----------------------------------------------------------------------
     Figure: a traffic-light state machine
     ----------------------------------------------------------------------- */
  FIG['fig-el-fsm'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ST = [['Main green', 'G', 'R', 5], ['Main yellow', 'Y', 'R', 2], ['Side green', 'R', 'G', 3], ['Side yellow', 'R', 'Y', 2]], s = 0, timer = 0, car = false, log = [];
    var controls = div('fig-controls', container), row = group(controls, 'Inputs and clock');
    var bCar = btn('Car waiting on side road: no', row); bCar.addEventListener('click', function () { car = !car; draw(); });
    btn('Clock tick (1 s)', row).addEventListener('click', function () { step(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function step() {
      var old = s; timer++;
      if (s === 0 && timer >= ST[0][3] && car) { s = 1; timer = 0; }
      else if (s === 1 && timer >= ST[1][3]) { s = 2; timer = 0; }
      else if (s === 2 && timer >= ST[2][3]) { s = 3; timer = 0; car = false; }
      else if (s === 3 && timer >= ST[3][3]) { s = 0; timer = 0; }
      log.push(ST[s][0]); if (log.length > 6) log.shift(); if (old !== s) {} draw();
    }
    function draw() {
      bCar.textContent = 'Car waiting on side road: ' + (car ? 'yes' : 'no');
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 380 : 240, 'State diagram of a traffic-light controller'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = narrow ? W / 2 : W * 0.36, cy = 125, rx = narrow ? W * 0.32 : 120, ry = 70, pos = [[cx - rx, cy - ry * 0.0 - 50], [cx + rx, cy - 50], [cx + rx, cy + 50], [cx - rx, cy + 50]];
      pos = [[cx - rx * 0.75, cy - ry * 0.7], [cx + rx * 0.75, cy - ry * 0.7], [cx + rx * 0.75, cy + ry * 0.7], [cx - rx * 0.75, cy + ry * 0.7]];
      var labels = ['car waiting, ≥ 5 s', 'after 2 s', 'after 3 s', 'after 2 s'];
      for (var i = 0; i < 4; i++) { var p = pos[i], q = pos[(i + 1) % 4], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: c.muted, 'stroke-width': 1.5, 'marker-end': '' }, svg); var ang = Math.atan2(q[1] - p[1], q[0] - p[0]), ax = q[0] - Math.cos(ang) * 34, ay = q[1] - Math.sin(ang) * 34; el('path', { d: 'M' + ax + ' ' + ay + 'l' + (-8 * Math.cos(ang - 0.4)) + ' ' + (-8 * Math.sin(ang - 0.4)) + 'M' + ax + ' ' + ay + 'l' + (-8 * Math.cos(ang + 0.4)) + ' ' + (-8 * Math.sin(ang + 0.4)), stroke: c.muted, 'stroke-width': 1.5 }, svg); txt(svg, mx + (i === 1 ? 8 : i === 3 ? -8 : 0), my + (i === 0 ? -30 : i === 2 ? 38 : 4), labels[i], { anchor: i === 1 ? 'start' : i === 3 ? 'end' : 'middle', size: fs(9), fill: c.muted }); }
      ST.forEach(function (st, i) { var p = pos[i], on = i === s; el('ellipse', { cx: p[0], cy: p[1], rx: 50, ry: 24, fill: c.surface }, svg); el('ellipse', { cx: p[0], cy: p[1], rx: 50, ry: 24, fill: on ? EC + '33' : c.surface, stroke: on ? EC : c.border, 'stroke-width': on ? 3 : 1.5 }, svg); txt(svg, p[0], p[1] + 4, st[0], { size: fs(10), fill: c.ink, weight: on ? 700 : 400 }); });
      var lx = narrow ? W / 2 - 60 : W * 0.78, ly = narrow ? 262 : 60, COL = { G: '#16a34a', Y: '#eab308', R: '#dc2626' };
      [['Main', ST[s][1]], ['Side', ST[s][2]]].forEach(function (L2, k) { var x = lx + k * 70; el('rect', { x: x - 18, y: ly - 10, width: 36, height: 90, rx: 8, fill: '#1f2937' }, svg); ['R', 'Y', 'G'].forEach(function (col, j) { el('circle', { cx: x, cy: ly + 6 + j * 28, r: 10, fill: L2[1] === col ? COL[col] : '#374151' }, svg); }); txt(svg, x, ly + 98, L2[0], { size: fs(10), fill: c.ink2 }); });
      txt(svg, 10, 14, 'circles: states · arrows: transitions on clock ticks', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'State: <strong>' + ST[s][0] + '</strong> (' + timer + ' s in this state). Recent: ' + (log.length ? log.join(' → ') : '—') + '.' + NOTE + 'A finite-state machine stores its current state in flip-flops (two bits suffice for four states) and uses combinational logic to choose the next state from the current state, the inputs (a car sensor) and a timer. The lights depend only on the state, which makes this a Moore machine. The main road stays green until a car waits on the side road.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: metastability and synchroniser MTBF
     ----------------------------------------------------------------------- */
  FIG['fig-el-mtbf'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var tau = 20, fc = 2, Tw = 20e-12, fd = 1e8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mt-tau', label: 'Flip-flop time constant τ (ps)', min: 5, max: 50, step: 1, value: tau, onChange: function (x) { tau = x; draw(); } });
    FIG.slider(controls, { id: 'mt-f', label: 'Clock frequency (GHz)', min: 0.2, max: 4, step: 0.1, value: fc, onChange: function (x) { fc = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function mtbf(tr) { return Math.exp(tr / (tau * 1e-12)) / (Tw * fc * 1e9 * fd); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Mean time between synchroniser failures against resolution time'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0, xh: 2, yl: 1e-6, yh: 1e30, logy: true, xticks: [0, 0.5, 1, 1.5, 2], yticks: [1e-6, 1e0, 1e6, 1e12, 1e18, 1e24, 1e30], xlab: 'time allowed to resolve (ns)', ylab: 'MTBF (s)' });
      [[1, '1 second'], [3.156e7, '1 year'], [4.35e17, 'age of the Universe']].forEach(function (r) { el('line', { x1: P.X(0), y1: P.Y(r[0]), x2: P.X(2), y2: P.Y(r[0]), stroke: AMBER, 'stroke-dasharray': '4 3' }, svg); txt(svg, P.X(0.03), P.Y(r[0]) - 4, r[1], { anchor: 'start', size: fs(9), fill: AMBER }); });
      plotLine(svg, P, function (t) { return mtbf(t * 1e-9); }, 0, 2, 200, EC, 2.6);
      var T = 1 / fc;
      [[T, '1 stage'], [2 * T, '2 stages']].forEach(function (m) { if (m[0] <= 2) { el('line', { x1: P.X(m[0]), y1: 30, x2: P.X(m[0]), y2: 244, stroke: PURPLE, 'stroke-dasharray': '3 3' }, svg); txt(svg, P.X(m[0]) - 4, 44, m[1], { anchor: 'end', size: fs(9), fill: PURPLE }); } });
      legend(svg, c, fs, W, 'each extra τ of waiting multiplies the MTBF by e ≈ 2.72', 'each τ multiplies MTBF by e');
      function show(s) { if (s < 60) return sciHTML(s) + ' s'; if (s < 3.156e7) return sciHTML(s / 86400) + ' days'; return sciHTML(s / 3.156e7) + ' years'; }
      out.innerHTML = 'Clock period ' + fmt(T * 1000, 0) + ' ps. MTBF with one flip-flop (about one period to settle): <strong>' + show(mtbf(T * 1e-9)) + '</strong>; with a two-flip-flop synchroniser: <strong>' + show(mtbf(2 * T * 1e-9)) + '</strong>.' + NOTE + 'MTBF = e<sup>t/τ</sup> ÷ (T<sub>w</sub> f<sub>clk</sub> f<sub>data</sub>), with an assumed window T<sub>w</sub> = 20 ps and data changing at 100 MHz. Because the dependence on waiting time is exponential, adding one more flip-flop can turn failures every few hours into failures once in tens of millions of years or less often still. Faster clocks leave less time to settle.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What gives a latch its memory?', options: ['A capacitor', 'Feedback: each gate’s output feeds the other gate’s input', 'A clock', 'A battery'], answer: 1, explanation: 'The loop holds whichever state was last set.' },
      { question: 'In a NOR SR latch, which input combination is forbidden?', options: ['S = 0, R = 0', 'S = 1, R = 0', 'S = 0, R = 1', 'S = 1, R = 1'], answer: 3, explanation: 'Both outputs become 0 and the next state is unpredictable.' },
      { question: 'An edge-triggered D flip-flop copies D to Q…', options: ['Whenever the clock is high', 'Only at the clock’s rising (or falling) edge', 'Continuously', 'Never'], answer: 1, explanation: 'Unlike a transparent latch.' },
      { question: 'A 4-bit binary counter driven by a 1 MHz clock: what is the frequency of its most significant output?', options: ['1 MHz', '250 kHz', '62.5 kHz', '16 MHz'], answer: 2, explanation: '1 MHz ÷ 16.' },
      { question: 'What limits the maximum clock frequency of a synchronous circuit?', options: ['The number of flip-flops', 'The slowest path between flip-flops plus their timing overheads', 'The colour of the chip', 'The supply voltage only'], answer: 1, explanation: 'T ≥ t_clk→Q + t_logic + t_setup.' },
      { question: 'How many flip-flops are needed for a state machine with 6 states (binary encoding)?', options: ['2', '3', '6', '64'], answer: 1, explanation: '2³ = 8 ≥ 6.' },
      { question: 'In a Moore machine, the outputs depend on…', options: ['Only the inputs', 'Only the current state', 'The state and the inputs', 'The clock frequency'], answer: 1, explanation: 'In a Mealy machine they also depend on the inputs.' },
      { question: 'Metastability is…', options: ['A memory leak', 'A flip-flop hanging between 0 and 1 when its input changes too close to the clock edge', 'A software bug', 'Radiation damage'], answer: 1, explanation: 'Synchronisers reduce the risk.' },
      { question: 'Why must DRAM be refreshed?', options: ['To save power', 'Its bits are stored as charge on tiny capacitors, which leaks away', 'To clear viruses', 'Because of the clock'], answer: 1, explanation: 'Typically every 64 ms.' },
      { question: 'A watch crystal oscillates at 32,768 Hz. How many divide-by-2 stages give 1 Hz?', options: ['8', '12', '15', '16'], answer: 2, explanation: '32,768 = 2¹⁵.' }
    ]);
  };
})();
