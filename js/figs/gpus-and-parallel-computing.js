/* ==========================================================================
   RNLearn — GPUs (From Switch to Supercomputer, Part 13)
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
    { name: 'Vectors and supercomputers', color: '#b45309' },
    { name: 'Graphics chips', color: '#1d4ed8' },
    { name: 'Parallel computing for all', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1966', icon: '🗂️', era: 0, sec: 4, title: 'Flynn’s taxonomy', text: 'Michael Flynn classifies computers by instruction and data streams: SISD, SIMD, MISD and MIMD.' },
    { year: '1967', icon: '⚖️', era: 0, sec: 3, title: 'Amdahl’s argument', text: 'Gene Amdahl argues that the serial part of a program limits the benefit of many processors.' },
    { year: '1976', icon: '🛋️', era: 0, sec: 4, title: 'Cray-1', text: 'The Cray-1 vector supercomputer processes whole arrays with single instructions.' },
    { year: '1999', icon: '🎮', era: 1, sec: 5, title: 'The “GPU”', text: 'Nvidia markets the GeForce 256 as a graphics processing unit, doing 3D transformation and lighting on one chip.' },
    { year: '2005', icon: '🔀', era: 2, sec: 4, title: 'Multicore desktops', text: 'Dual-core processors reach desktop PCs as clock speeds stop rising: “the free lunch is over”.' },
    { year: '2007', icon: '🧮', era: 1, sec: 5, title: 'CUDA', text: 'Nvidia releases CUDA for its unified G80 architecture, letting programmers use GPUs for general computing in a C-like language.' },
    { year: '2012', icon: '🖼️', era: 2, sec: 8, title: 'Deep learning on GPUs', text: 'AlexNet, trained on two gaming GPUs, wins the ImageNet image-recognition challenge by a wide margin.' },
    { year: '2017', icon: '🟩', era: 2, sec: 8, title: 'Tensor cores and TPUs', text: 'Nvidia’s Volta GPU adds tensor cores for matrix multiplication; Google publishes its Tensor Processing Unit.' }
  ];

  FIG['fig-el13-timeline'] = function (figEl) {
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

  var EL_PART = 13;
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
     Figure: Amdahl's and Gustafson's laws
     ----------------------------------------------------------------------- */
  FIG['fig-el-amdahl'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p = 95, lgN = 6;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'am-p', label: 'Parallel fraction of the program (%)', min: 50, max: 99.9, step: 0.1, value: p, onChange: function (x) { p = x; draw(); } });
    FIG.slider(controls, { id: 'am-n', label: 'Processors (log₂)', min: 0, max: 12, step: 1, value: lgN, onChange: function (x) { lgN = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function am(f, n) { return 1 / ((1 - f) + f / n); }
    function gu(f, n) { return (1 - f) + f * n; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Speedup against number of processors'), W = A.W, svg = A.svg, fs = A.fs, f = p / 100, N = Math.pow(2, lgN);
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 1, xh: 4096, yl: 1, yh: 4096, logx: true, logy: true, xticks: [1, 10, 100, 1000], yticks: [1, 10, 100, 1000], xlab: 'number of processors', ylab: 'speedup' });
      plotLine(svg, P, function (n) { return n; }, 1, 4096, 2, c.border, 1, '3 3', true);
      [0.5, 0.9, 0.99].forEach(function (g) { plotLine(svg, P, function (n) { return am(g, n); }, 1, 4096, 120, c.border, 1.4, null, true); var y = am(g, 4096); txt(svg, P.X(4096) - 4, P.Y(y) - 4, fmt(g * 100, 0) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      plotLine(svg, P, function (n) { return gu(f, n); }, 1, 4096, 120, AMBER, 2, '6 3', true);
      plotLine(svg, P, function (n) { return am(f, n); }, 1, 4096, 160, EC, 2.8, null, true);
      el('circle', { cx: P.X(N), cy: P.Y(am(f, N)), r: 5, fill: EC }, svg); el('circle', { cx: P.X(N), cy: P.Y(gu(f, N)), r: 5, fill: AMBER }, svg);
      legend(svg, c, fs, W, 'blue: Amdahl (fixed problem) · dashed amber: Gustafson (problem grows with machine) · grey: Amdahl for 50, 90, 99% · dotted: perfect', 'blue: Amdahl · amber: Gustafson');
      out.innerHTML = 'With ' + fmt(p, 1) + '% parallel work on ' + N.toLocaleString('en-GB') + ' processors: Amdahl speedup <strong>' + fmt(am(f, N), 1) + '×</strong> (limit ' + fmt(1 / (1 - f), 0) + '× however many processors); Gustafson scaled speedup <strong>' + fmt(gu(f, N), 0) + '×</strong>.' + NOTE + 'Amdahl’s law: if a fraction 1 − p of a fixed job must run serially, the speedup on N processors is 1/((1 − p) + p/N), never more than 1/(1 − p). Gustafson’s observation: in practice people use bigger machines to solve bigger problems, in which the parallel part grows while the serial part stays roughly fixed, giving a scaled speedup of (1 − p) + pN. Both are right about different questions.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: latency hiding with many warps
     ----------------------------------------------------------------------- */
  FIG['fig-el-warp'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nw = 8, lat = 100, comp = 8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'wp-n', label: 'Warps resident on the core', min: 1, max: 32, step: 1, value: nw, onChange: function (x) { nw = x; draw(); } });
    FIG.slider(controls, { id: 'wp-l', label: 'Memory latency (cycles)', min: 20, max: 400, step: 10, value: lat, onChange: function (x) { lat = x; draw(); } });
    FIG.slider(controls, { id: 'wp-c', label: 'Instructions between memory loads', min: 1, max: 30, step: 1, value: comp, onChange: function (x) { comp = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function sim(T) {
      var ready = [], left = [], grid = [], busy = 0;
      for (var w = 0; w < nw; w++) { ready.push(0); left.push(comp); grid.push([]); }
      var rr = 0;
      for (var t = 0; t < T; t++) {
        var issued = -1;
        for (var k = 0; k < nw; k++) { var w2 = (rr + k) % nw; if (ready[w2] <= t) { issued = w2; break; } }
        for (w = 0; w < nw; w++) grid[w].push(w === issued ? 1 : ready[w] > t ? 2 : 0);
        if (issued >= 0) { busy++; left[issued]--; if (left[issued] === 0) { ready[issued] = t + 1 + lat; left[issued] = comp; } rr = (issued + 1) % nw; }
      }
      return { grid: grid, util: busy / T };
    }
    function draw() {
      var c = C(), T = 200, rows = Math.min(nw, 16), A = newSVG(svgWrap, container, 50 + rows * 14 + 20, 'Timeline of warps computing and waiting for memory'), W = A.W, svg = A.svg, fs = A.fs;
      var S = sim(4000), G = sim(T).grid, L = 60, cw = (W - L - 10) / T;
      for (var w = 0; w < rows; w++) { txt(svg, L - 6, 44 + w * 14 + 9, 'warp ' + (w + 1), { anchor: 'end', size: fs(8), fill: c.muted }); for (var t = 0; t < T; t++) { var v = G[w][t]; if (v) el('rect', { x: L + t * cw, y: 44 + w * 14, width: Math.max(cw, 0.6), height: 11, fill: v === 1 ? EC : c.border }, svg); } }
      if (nw > rows) txt(svg, L, 44 + rows * 14 + 14, '… and ' + (nw - rows) + ' more warps', { anchor: 'start', size: fs(9), fill: c.muted });
      legend(svg, c, fs, W, 'first 200 cycles · blue: warp issuing an instruction · grey: waiting for memory · blank: ready but another warp issued', 'blue: computing · grey: waiting');
      var need = Math.ceil((comp + lat) / comp);
      out.innerHTML = 'Core busy <strong>' + fmt(S.util * 100, 0) + '%</strong> of cycles. To hide a ' + lat + '-cycle latency with ' + comp + ' instructions between loads, you need about (' + comp + ' + ' + lat + ')/' + comp + ' ≈ <strong>' + need + ' warps</strong>.' + NOTE + 'A GPU core does not try to make memory fast; it hides the delay. It keeps many groups of threads (warps of 32 on Nvidia GPUs) resident at once, and whenever one warp stalls on a memory access, the scheduler issues an instruction from another, at zero cost. With enough warps the arithmetic units never idle. This is why GPU programs launch tens of thousands of threads, and why the number of warps a core can hold (its occupancy) matters so much.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the roofline model
     ----------------------------------------------------------------------- */
  FIG['fig-el-roofline'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var peak = 60, bw = 3;
    var K = [['vector add', 1 / 12], ['sparse matrix–vector', 0.25], ['3D stencil', 0.5], ['FFT', 2], ['dense matrix multiply', 200]];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rf-p', label: 'Peak compute (TFLOP/s)', min: 1, max: 1000, step: 1, value: peak, onChange: function (x) { peak = x; draw(); } });
    FIG.slider(controls, { id: 'rf-b', label: 'Memory bandwidth (TB/s)', min: 0.1, max: 8, step: 0.1, value: bw, onChange: function (x) { bw = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function att(ai) { return Math.min(peak * 1000, bw * 1000 * ai); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Roofline: attainable performance against arithmetic intensity'), W = A.W, svg = A.svg, fs = A.fs, narrow = W < 560;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 254, xl: 0.01, xh: 1000, yl: 1, yh: 1e6, logx: true, logy: true, xticks: [0.01, 0.1, 1, 10, 100, 1000], yticks: [1, 100, 1e4, 1e6], xlab: 'arithmetic intensity (FLOPs per byte from memory)', ylab: 'GFLOP/s' });
      plotLine(svg, P, att, 0.01, 1000, 300, EC, 3, null, true);
      var ridge = peak / bw; el('line', { x1: P.X(ridge), y1: 30, x2: P.X(ridge), y2: 254, stroke: PURPLE, 'stroke-dasharray': '3 3' }, svg); txt(svg, P.X(ridge) + 4, 44, 'ridge ' + fmt(ridge, 0) + ' FLOP/B', { anchor: P.X(ridge) > W * 0.7 ? 'end' : 'start', size: fs(9), fill: PURPLE });
      K.forEach(function (k, i) { var x = P.X(k[1]), y = P.Y(att(k[1])); el('circle', { cx: x, cy: y, r: 5, fill: AMBER }, svg); if (!narrow || i % 2 === 0) txt(svg, x + (i === 4 || i === 1 ? -6 : 6), y + (i === 4 ? -10 : i % 2 ? -8 : 16), k[0], { anchor: i === 4 || i === 1 ? 'end' : 'start', size: fs(9), fill: c.ink2 }); });
      legend(svg, c, fs, W, 'slanted roof: limited by memory bandwidth · flat roof: limited by arithmetic · dots: typical kernels', 'slant: memory-bound · flat: compute-bound');
      out.innerHTML = 'Ridge point at <strong>' + fmt(ridge, 1) + ' FLOPs per byte</strong>. Vector addition reaches only ' + fmt(att(1 / 12) / 1000, 2) + ' TFLOP/s (' + fmt(att(1 / 12) / (peak * 1000) * 100, 1) + '% of peak); dense matrix multiplication reaches ' + fmt(att(200) / 1000, 1) + ' TFLOP/s.' + NOTE + 'The roofline model says a kernel’s speed is the smaller of peak arithmetic rate and memory bandwidth × arithmetic intensity (operations per byte moved). Adding two arrays does one addition per 12 bytes moved, so it is bandwidth-bound on every modern chip. Multiplying large matrices reuses each number many times and can approach peak. Raising peak compute without raising bandwidth helps only the kernels to the right of the ridge, which is why GPUs use expensive stacked high-bandwidth memory.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el13'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'If 90% of a program is parallel, the maximum speedup with unlimited processors is…', options: ['9×', '10×', '90×', 'Unlimited'], answer: 1, explanation: '1/(1 − 0.9).' },
      { question: 'Gustafson’s law differs from Amdahl’s by assuming…', options: ['The problem size grows with the number of processors', 'No serial part', 'Faster clocks', 'Shared memory'], answer: 0, explanation: 'Scaled speedup.' },
      { question: 'In Flynn’s taxonomy, a GPU executing one instruction on many data elements is…', options: ['SISD', 'SIMD (or SIMT)', 'MISD', 'MIMD only'], answer: 1, explanation: 'Single instruction, multiple data.' },
      { question: 'On Nvidia GPUs, a warp is…', options: ['A memory chip', 'A group of 32 threads executing the same instruction together', 'A type of cache', 'A cooling system'], answer: 1, explanation: 'SIMT execution.' },
      { question: 'Branch divergence within a warp causes…', options: ['Faster execution', 'The two paths to be executed one after the other, with some threads idle', 'A crash', 'Memory errors'], answer: 1, explanation: 'Threads take turns.' },
      { question: 'GPUs hide memory latency mainly by…', options: ['Huge caches', 'Switching between many resident warps', 'Faster DRAM', 'Branch prediction'], answer: 1, explanation: 'Massive multithreading.' },
      { question: 'Arithmetic intensity is…', options: ['FLOPs per second', 'FLOPs per byte moved from memory', 'Bytes per second', 'Clock cycles per instruction'], answer: 1, explanation: 'The x-axis of the roofline.' },
      { question: 'Adding two large float arrays on a GPU is limited by…', options: ['Arithmetic', 'Memory bandwidth', 'The clock', 'Branch prediction'], answer: 1, explanation: 'One FLOP per 12 bytes.' },
      { question: 'Tensor cores accelerate…', options: ['Branching', 'Small matrix multiply–accumulate operations, often at low precision', 'Disk access', 'Video output only'], answer: 1, explanation: 'The core of neural networks.' },
      { question: 'Moving a 32-bit value from DRAM costs roughly how much more energy than a 32-bit addition?', options: ['About the same', 'About 10×', 'Hundreds of times', 'Less'], answer: 2, explanation: 'Horowitz’s 45 nm figures: ~640 pJ versus ~1 pJ.' }
    ]);
  };
})();
