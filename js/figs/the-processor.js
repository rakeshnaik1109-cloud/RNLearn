/* ==========================================================================
   RNLearn — Processor (From Switch to Supercomputer, Part 12)
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
    { name: 'Stored programs', color: '#b45309' },
    { name: 'Faster machines', color: '#1d4ed8' },
    { name: 'Microprocessors', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1945', icon: '📝', era: 0, sec: 3, title: 'The EDVAC report', text: 'John von Neumann’s draft report describes a computer that keeps its program in the same memory as its data.' },
    { year: '1949', icon: '🖥️', era: 0, sec: 3, title: 'EDSAC runs', text: 'Maurice Wilkes’s EDSAC at Cambridge becomes one of the first practical stored-program computers in regular service.' },
    { year: '1964', icon: '⚡', era: 1, sec: 7, title: 'CDC 6600', text: 'Seymour Cray’s CDC 6600 issues instructions to several functional units in parallel, tracked by a scoreboard; it is the fastest computer of its day.' },
    { year: '1965', icon: '🗄️', era: 1, sec: 6, title: 'The cache', text: 'Maurice Wilkes proposes “slave memories”: a small fast memory holding recently used data, the idea of the cache.' },
    { year: '1967', icon: '🔀', era: 1, sec: 7, title: 'Tomasulo’s algorithm', text: 'Robert Tomasulo at IBM shows how to execute instructions out of order as soon as their operands are ready.' },
    { year: '1971', icon: '🧠', era: 2, sec: 4, title: 'The microprocessor', text: 'Intel’s 4004 puts a complete processor on one chip.' },
    { year: '1980', icon: '✂️', era: 2, sec: 4, title: 'RISC', text: 'David Patterson and David Ditzel argue for reduced instruction sets that are simple to pipeline.' },
    { year: '2018', icon: '👻', era: 2, sec: 7, title: 'Spectre and Meltdown', text: 'Researchers disclose that speculative execution can leak secrets through caches, forcing changes to processors and operating systems.' }
  ];

  FIG['fig-el12-timeline'] = function (figEl) {
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

  var EL_PART = 12;
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
     Figure: a tiny stored-program computer
     ----------------------------------------------------------------------- */
  FIG['fig-el-cpu'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var OPS = ['LDA', 'ADD', 'SUB', 'STA', 'JMP', 'JZ', 'OUT', 'HLT'];
    var PROGS = [
      { name: 'Multiply 6 × 7', mem: [[0, 14], [1, 12], [3, 14], [0, 13], [2, 15], [3, 13], [5, 8], [4, 0], [0, 14], [6, 0], [7, 0], 0, 6, 7, 0, 1], labels: { 12: 'A', 13: 'B (counter)', 14: 'result', 15: 'one' } },
      { name: 'Sum 1 to 10', mem: [[0, 14], [1, 13], [3, 14], [0, 13], [2, 15], [3, 13], [5, 8], [4, 0], [0, 14], [6, 0], [7, 0], 0, 0, 10, 0, 1], labels: { 13: 'n (counter)', 14: 'sum', 15: 'one' } }
    ];
    var pi = 0, M, pc, acc, ir, halted, steps, outv, msg, running = false, last = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Program', PROGS.map(function (p) { return p.name; }), 0, function (i) { pi = i; reset(); });
    var row = group(controls, 'Clock');
    btn('Step (one instruction)', row).addEventListener('click', function () { step(); });
    var bRun = btn('Run', row); bRun.addEventListener('click', function () { running = !running; bRun.textContent = running ? 'Pause' : 'Run'; });
    btn('Reset', row).addEventListener('click', function () { reset(); });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function enc(w) { return Array.isArray(w) ? w[0] * 16 + w[1] : w; }
    function dis(v) { var op = v >> 4, a = v & 15; return OPS[op] + (op <= 5 ? ' ' + a : ''); }
    function reset() { M = PROGS[pi].mem.map(enc); pc = 0; acc = 0; ir = 0; halted = false; steps = 0; outv = '—'; msg = 'Ready. Press Step to fetch the first instruction.'; running = false; bRun.textContent = 'Run'; render(); }
    function step() {
      if (halted) return;
      ir = M[pc]; var op = ir >> 4, a = ir & 15, f = 'Fetch: IR ← M[' + pc + '] = ' + ('0000000' + ir.toString(2)).slice(-8) + ' (' + dis(ir) + '); PC ← ' + ((pc + 1) & 15) + '. ';
      pc = (pc + 1) & 15; steps++;
      var e;
      switch (op) {
        case 0: acc = M[a]; e = 'Execute: ACC ← M[' + a + '] = ' + acc; break;
        case 1: acc = (acc + M[a]) & 255; e = 'Execute: ACC ← ACC + M[' + a + '] = ' + acc; break;
        case 2: acc = (acc - M[a] + 256) & 255; e = 'Execute: ACC ← ACC − M[' + a + '] = ' + acc; break;
        case 3: M[a] = acc; e = 'Execute: M[' + a + '] ← ACC (' + acc + ')'; break;
        case 4: pc = a; e = 'Execute: PC ← ' + a + ' (jump)'; break;
        case 5: if (acc === 0) { pc = a; e = 'Execute: ACC is 0, so PC ← ' + a; } else e = 'Execute: ACC is ' + acc + ', not 0, so no jump'; break;
        case 6: outv = acc; e = 'Execute: output ACC = ' + acc; break;
        default: halted = true; running = false; bRun.textContent = 'Run'; e = 'Execute: halt';
      }
      if (steps > 400) { halted = true; e += ' (stopped after 400 steps)'; }
      msg = f + e + '.'; render();
    }
    function render() {
      var c = C(), lab = PROGS[pi].labels, narrow = (container.clientWidth || 700) < 560;
      var cells = M.map(function (v, i) { var isCode = i <= 10, cur = i === pc && !halted, bg = cur ? 'background:' + EC + '33;border-color:' + EC + ';' : ''; return '<div style="display:flex;gap:0.5rem;align-items:center;padding:2px 6px;border:1px solid var(--border);border-radius:4px;font-family:var(--font-mono,monospace);font-size:0.8rem;' + bg + '"><span style="color:var(--ink-muted);width:1.6em;text-align:right">' + i + '</span><span style="color:var(--ink-faint)">' + ('0000000' + v.toString(2)).slice(-8) + '</span><span style="color:var(--ink);font-weight:600">' + (isCode ? dis(v) : v) + '</span><span style="color:var(--ink-muted);font-size:0.72rem">' + (lab[i] || '') + '</span></div>'; }).join('');
      var reg = function (n, v) { return '<div style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface-raised)"><div style="font-size:0.72rem;color:var(--ink-muted)">' + n + '</div><div style="font-family:var(--font-mono,monospace);font-size:1rem;font-weight:700;color:var(--ink)">' + v + '</div></div>'; };
      view.innerHTML = '<div style="font-family:var(--font-sans);display:grid;grid-template-columns:' + (narrow ? '1fr' : '1.4fr 1fr') + ';gap:0.8rem;margin-top:0.6rem"><div><div style="font-size:0.78rem;color:var(--ink-muted);margin-bottom:4px">Memory: 16 words of 8 bits (addresses 0–10 hold the program, 11–15 data)</div><div style="display:grid;grid-template-columns:' + (narrow ? '1fr' : '1fr 1fr') + ';gap:3px">' + cells + '</div></div><div><div style="font-size:0.78rem;color:var(--ink-muted);margin-bottom:4px">Processor</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' + reg('Program counter PC', pc) + reg('Accumulator ACC', acc) + reg('Instruction register IR', dis(ir)) + reg('Instructions executed', steps) + reg('Output', outv) + reg('State', halted ? 'halted' : 'running') + '</div><div style="font-size:0.75rem;color:var(--ink-muted);margin-top:6px">Instruction format: 3-bit operation code + 1 unused bit + 4-bit address. LDA load, ADD, SUB, STA store, JMP jump, JZ jump if ACC = 0, OUT, HLT halt.</div></div></div>';
      out.innerHTML = msg + NOTE + 'This is a complete stored-program computer: instructions and numbers sit side by side in the same memory as bit patterns, and only the program counter decides which words are treated as instructions. Each step fetches the word at PC, increments PC, decodes the operation code and executes it. Real processors follow the same cycle, billions of times per second, with dozens of registers and hundreds of instruction types.</span>';
    }
    reset();
    FIG.animate(figEl, function (now) { if (!running || halted) return; if (!last || now - last > 300) { last = now; step(); } });
  };

  /* -----------------------------------------------------------------------
     Figure: pipeline diagram with hazards
     ----------------------------------------------------------------------- */
  FIG['fig-el-pipe'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fwd = true, mispredict = false;
    var INS = [['lw  r1, 0(r2)', [], 'load'], ['add r3, r1, r4', [0], 'alu'], ['sub r5, r3, r6', [1], 'alu'], ['beq r5, r0, L', [2], 'branch'], ['or  r7, r8, r9', [], 'alu'], ['and r10, r7, r1', [4, 0], 'alu']];
    var controls = div('fig-controls', container);
    choice(controls, 'Forwarding', ['On', 'Off'], 0, function (i) { fwd = !i; draw(); });
    choice(controls, 'Branch prediction', ['Correct', 'Wrong'], 0, function (i) { mispredict = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function schedule() {
      var S = [];
      INS.forEach(function (ins, i) {
        var IF = i ? S[i - 1].ID : 0;
        if (i && INS[i - 1][2] === 'branch' && mispredict) IF = S[i - 1].EX + 1;
        var ID = IF + 1;
        ins[1].forEach(function (p) { var P = S[p]; if (!fwd) ID = Math.max(ID, P.WB); else if (INS[p][2] === 'load') ID = Math.max(ID, P.MEM); else ID = Math.max(ID, P.EX); });
        if (i && INS[i - 1][2] === 'branch' && !fwd) {}
        S.push({ IF: IF, ID: ID, EX: ID + 1, MEM: ID + 2, WB: ID + 3 });
      });
      return S;
    }
    function draw() {
      var c = C(), S = schedule(), ncyc = S[S.length - 1].WB + 1, narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560;
      var A = newSVG(svgWrap, container, 60 + INS.length * 34, 'Pipeline diagram: stages of each instruction in each clock cycle'), W = A.W, svg = A.svg, fs = A.fs;
      var L = narrow ? 92 : 130, cw = Math.min(46, (W - L - 10) / ncyc);
      for (var t = 0; t < ncyc; t++) txt(svg, L + t * cw + cw / 2, 40, String(t + 1), { size: fs(9), fill: c.muted });
      txt(svg, L, 22, 'clock cycle →', { anchor: 'start', size: fs(9), fill: c.muted });
      var COL = { IF: BLUE, ID: PURPLE, EX: EC, MEM: AMBER, WB: GREEN };
      INS.forEach(function (ins, i) {
        var y = 52 + i * 34, s = S[i];
        txt(svg, L - 6, y + 18, narrow ? ins[0].split(' ')[0] + ' ' + ins[0].split(' ').slice(1).join(' ').split(',')[0] : ins[0], { anchor: 'end', size: fs(narrow ? 9 : 10), fill: c.ink2, family: 'monospace' });
        for (var t2 = s.IF + 1; t2 < s.ID; t2++) { el('rect', { x: L + t2 * cw + 1, y: y + 2, width: cw - 2, height: 26, fill: c.border, rx: 3 }, svg); txt(svg, L + t2 * cw + cw / 2, y + 19, 'stall', { size: fs(narrow ? 7 : 8), fill: c.muted }); }
        ['IF', 'ID', 'EX', 'MEM', 'WB'].forEach(function (st) { var tt = s[st]; el('rect', { x: L + tt * cw + 1, y: y + 2, width: cw - 2, height: 26, fill: COL[st] + '33', stroke: COL[st], rx: 3 }, svg); txt(svg, L + tt * cw + cw / 2, y + 19, st, { size: fs(narrow ? 7 : 9), fill: c.ink, weight: 700 }); });
      });
      var stalls = ncyc - (INS.length + 4), cpi = (ncyc - 4) / INS.length;
      out.innerHTML = 'Six instructions take <strong>' + ncyc + ' cycles</strong> (' + stalls + ' lost to hazards); cycles per instruction ≈ <strong>' + fmt(cpi, 2) + '</strong> (ideal 1.00).' + NOTE + 'Each instruction passes through five stages: fetch (IF), decode and read registers (ID), execute (EX), memory access (MEM) and write back (WB). Ideally a new instruction starts every cycle. <strong>Data hazards</strong> arise when an instruction needs a result not yet written: without forwarding it must wait until the producer writes back; with forwarding, results are passed straight from one stage to the next, and only a load followed immediately by its use costs a stall. <strong>Control hazards</strong> arise at branches: if the predicted direction is wrong, the instructions fetched after it are thrown away and fetching restarts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a cache simulator
     ----------------------------------------------------------------------- */
  FIG['fig-el-cache'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var pat = 0, lines = 16, ways = 1;
    var PATS = ['Array, in order', 'Array, every 16th word', 'Random addresses', 'Matrix by rows', 'Matrix by columns'];
    var controls = div('fig-controls', container);
    choice(controls, 'Access pattern', PATS, 0, function (i) { pat = i; draw(); });
    FIG.slider(controls, { id: 'ca-l', label: 'Cache size (lines of 8 words)', min: 4, max: 64, step: 4, value: lines, onChange: function (x) { lines = x; draw(); } });
    choice(controls, 'Associativity', ['Direct-mapped', '4-way'], 0, function (i) { ways = i ? 4 : 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function addrs() {
      var a = [], r = rngSeed(9), N = 64;
      if (pat === 0) for (var k = 0; k < 2048; k++) a.push(k % 1024);
      else if (pat === 1) for (k = 0; k < 2048; k++) a.push((k * 16) % 4096 + Math.floor(k * 16 / 4096));
      else if (pat === 2) for (k = 0; k < 2048; k++) a.push(Math.floor(r() * 4096));
      else if (pat === 3) for (var rep = 0; rep < 2; rep++) for (var i = 0; i < 32; i++) for (var j = 0; j < 32; j++) a.push(i * N + j);
      else for (rep = 0; rep < 2; rep++) for (j = 0; j < 32; j++) for (i = 0; i < 32; i++) a.push(i * N + j);
      return a;
    }
    function draw() {
      var W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), cs0 = Math.min(12, (W0 - 20) / 64), c = C(), A = newSVG(svgWrap, container, Math.round(42 + 4 * cs0 + 34 + 30), 'Cache hits and misses for a stream of memory accesses'), W = A.W, svg = A.svg, fs = A.fs;
      var sets = lines / ways, tags = []; for (var s = 0; s < sets; s++) tags.push([]);
      var hist = [], hits = 0, as = addrs();
      as.forEach(function (ad) { var blk = Math.floor(ad / 8), si = blk % sets, set = tags[si], pos = set.indexOf(blk), hit = pos >= 0; if (hit) { set.splice(pos, 1); hits++; } else if (set.length >= ways) set.shift(); set.push(blk); hist.push(hit); });
      var nShow = Math.min(hist.length, 256), cols = 64, cs = Math.min(12, (W - 20) / cols), rows = Math.ceil(nShow / cols);
      txt(svg, 10, 34, 'first ' + nShow + ' accesses (green = hit, red = miss):', { anchor: 'start', size: fs(10), fill: c.ink2 });
      for (var k = 0; k < nShow; k++) el('rect', { x: 10 + (k % cols) * cs, y: 42 + Math.floor(k / cols) * cs, width: cs - 1, height: cs - 1, fill: hist[k] ? GREEN : RED, opacity: 0.8 }, svg);
      var by = 42 + rows * cs + 34, rate = hits / hist.length, bw = W - 20;
      txt(svg, 10, by - 8, 'overall hit rate', { anchor: 'start', size: fs(10), fill: c.ink2 });
      el('rect', { x: 10, y: by, width: bw, height: 18, fill: RED + '55', rx: 4 }, svg); el('rect', { x: 10, y: by, width: bw * rate, height: 18, fill: GREEN, rx: 4 }, svg);
      txt(svg, 14 + bw * rate, by + 13, fmt(rate * 100, 1) + '%', { anchor: rate > 0.85 ? 'end' : 'start', size: fs(10), fill: rate > 0.85 ? '#fff' : c.ink, weight: 700 });
      legend(svg, c, fs, W, 'cache of ' + lines + ' lines × 8 words (' + (lines * 32) + ' bytes), ' + (ways === 1 ? 'direct-mapped' : '4-way set-associative, least-recently-used replacement'), lines * 32 + '-byte cache');
      var amat = 1 + (1 - rate) * 100;
      out.innerHTML = 'Hit rate <strong>' + fmt(rate * 100, 1) + '%</strong>; average memory access time = 1 + miss rate × 100 = <strong>' + fmt(amat, 1) + ' cycles</strong> (a hit costs 1 cycle, a miss 100).' + NOTE + 'A cache keeps copies of recently used memory in fast SRAM, in lines of several consecutive words. It works because programs show <em>locality</em>: they reuse data (temporal locality) and use neighbouring addresses (spatial locality). Walking through an array in order misses only once per line. Large strides, random addresses and walking a row-major matrix down its columns defeat it. In a direct-mapped cache, addresses that share an index evict each other (conflict misses); associativity reduces this.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el12'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'In a stored-program computer, instructions are kept…', options: ['On punched cards only', 'In the same memory as data, as bit patterns', 'In the ALU', 'In the clock'], answer: 1, explanation: 'The von Neumann architecture.' },
      { question: 'The program counter holds…', options: ['The number of programs', 'The address of the next instruction', 'The result of the last addition', 'The clock speed'], answer: 1, explanation: 'Jumps change it.' },
      { question: 'By the “iron law”, execution time equals…', options: ['Instructions × CPI × cycle time', 'Clock speed × cores', 'Cache size ÷ bandwidth', 'Transistors × voltage'], answer: 0, explanation: 'Each factor can be attacked separately.' },
      { question: 'Ideal pipelining with 5 stages can speed up throughput by up to about…', options: ['1.2×', '2×', '5×', '25×'], answer: 2, explanation: 'Less in practice because of hazards and overheads.' },
      { question: 'Forwarding (bypassing) solves…', options: ['Most data hazards by passing results directly between pipeline stages', 'Cache misses', 'Branch mispredictions', 'Power problems'], answer: 0, explanation: 'A load followed by use still stalls one cycle.' },
      { question: 'Caches work because of…', options: ['Locality of reference', 'Random access', 'High voltage', 'Long wires'], answer: 0, explanation: 'Temporal and spatial locality.' },
      { question: 'With a 1-cycle hit time, 5% miss rate and 100-cycle miss penalty, the average memory access time is…', options: ['1 cycle', '5 cycles', '6 cycles', '100 cycles'], answer: 2, explanation: '1 + 0.05 × 100.' },
      { question: 'Out-of-order execution means…', options: ['Running programs backwards', 'Executing instructions as soon as their operands are ready while preserving the program’s results', 'Ignoring dependencies', 'Random execution'], answer: 1, explanation: 'Tomasulo, 1967.' },
      { question: 'A 2-bit branch predictor on a loop branch taken 9 times then not taken, repeatedly, mispredicts about…', options: ['Never', 'Once per loop', 'Twice per loop', 'Every time'], answer: 1, explanation: 'A 1-bit predictor mispredicts twice.' },
      { question: 'The Spectre attacks exploited…', options: ['Weak passwords', 'Speculative execution leaving traces in caches', 'Overheating', 'Faulty adders'], answer: 1, explanation: 'Disclosed in 2018.' }
    ]);
  };
})();
