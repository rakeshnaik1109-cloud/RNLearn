/* ==========================================================================
   RNLearn — CPUs and GPUs, Generation by Generation
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
    { name: 'Early microprocessors', color: '#b45309' },
    { name: 'Clock race and 3D graphics', color: '#7c3aed' },
    { name: 'Multicore and GPU computing', color: '#15803d' },
    { name: 'AI and exascale', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1971', icon: '🔲', era: 0, sec: 4, title: 'Intel 4004', text: 'The first commercial single-chip microprocessor: 2,300 transistors, 4-bit, up to 740 kHz, designed for a Busicom calculator.' },
    { year: '1978', icon: '💾', era: 0, sec: 4, title: 'Intel 8086', text: 'A 16-bit processor whose instruction set, x86, still runs most PCs and servers today.' },
    { year: '1985', icon: '🦾', era: 0, sec: 8, title: 'Intel 386 and Acorn ARM1', text: 'The 386 brings 32-bit computing to the PC; in Cambridge, Acorn’s first ARM chip starts the RISC line that now powers almost every phone.' },
    { year: '1993', icon: '🏁', era: 1, sec: 5, title: 'Pentium', text: 'Intel’s superscalar Pentium can execute two instructions per clock cycle.' },
    { year: '1996', icon: '🎮', era: 1, sec: 9, title: '3dfx Voodoo', text: 'An add-in card that brings smooth 3D graphics to PC games.' },
    { year: '1999', icon: '🖼️', era: 1, sec: 9, title: 'GeForce 256', text: 'Nvidia markets the first chip it calls a “GPU”, with hardware transform and lighting.' },
    { year: '2000', icon: '⏱️', era: 1, sec: 5, title: '1 gigahertz', text: 'AMD’s Athlon becomes the first x86 processor sold at 1 GHz, just ahead of Intel.' },
    { year: '2001', icon: '✨', era: 1, sec: 10, title: 'Programmable shaders', text: 'The GeForce 3 lets programmers write small programs that run for every vertex and pixel.' },
    { year: '2004', icon: '🔥', era: 2, sec: 6, title: 'The power wall', text: 'Intel cancels its faster Pentium 4 successors; clock speeds stop rising near 4 GHz.' },
    { year: '2005', icon: '👯', era: 2, sec: 6, title: 'Dual-core desktops', text: 'AMD and Intel ship desktop processors with two cores on one chip.' },
    { year: '2006', icon: '⚙️', era: 2, sec: 11, title: 'GeForce 8800 and CUDA', text: 'Nvidia’s G80 has 128 unified shader cores; its CUDA platform, released in 2007, lets them run ordinary C programs.' },
    { year: '2008', icon: '🏛️', era: 2, sec: 16, title: 'First petaflop', text: 'Roadrunner at Los Alamos passes one quadrillion operations per second.' },
    { year: '2012', icon: '🧠', era: 2, sec: 12, title: 'AlexNet', text: 'A neural network trained on two gaming GPUs wins the ImageNet contest by a wide margin, starting the deep-learning boom.' },
    { year: '2017', icon: '🧮', era: 3, sec: 12, title: 'Tensor cores', text: 'Nvidia’s V100 adds units that multiply small matrices, built for neural networks. AMD’s Zen cores revive competition in CPUs.' },
    { year: '2018', icon: '💡', era: 3, sec: 12, title: 'Real-time ray tracing', text: 'Nvidia’s RTX 20 series adds hardware to trace light rays in games.' },
    { year: '2020', icon: '🍏', era: 3, sec: 7, title: 'Apple M1', text: 'Apple moves the Mac to its own Arm chip, with 16 billion transistors and memory shared by CPU and GPU.' },
    { year: '2022', icon: '🚀', era: 3, sec: 16, title: 'Exascale', text: 'Frontier at Oak Ridge, built from AMD CPUs and GPUs, becomes the first computer measured above one exaflop.' },
    { year: '2024', icon: '🧩', era: 3, sec: 12, title: 'Blackwell', text: 'Nvidia’s B200 joins two chips into one GPU with 208 billion transistors and adds 4-bit arithmetic for AI.' }
  ];
  FIG['fig-cg-timeline'] = function (figEl) {
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


  /* ---------------- data ---------------- */
  /* t: transistors; nm: process; mhz: clock; c: cores; f: FP32 peak GFLOPS (CPUs: cores x clock x FLOPs per cycle, approximate);
     ai: dense FP16 tensor TFLOPS; bw: memory bandwidth GB/s; w: rated power W */
  var CHIPS = [
    { n: 'Intel 4004', y: 1971, k: 'CPU', t: 2300, nm: 10000, mhz: 0.74, c: 1 },
    { n: 'Intel 8086', y: 1978, k: 'CPU', t: 29000, nm: 3000, mhz: 10, c: 1 },
    { n: 'Intel 386', y: 1985, k: 'CPU', t: 275000, nm: 1500, mhz: 16, c: 1 },
    { n: 'Intel 486', y: 1989, k: 'CPU', t: 1.2e6, nm: 1000, mhz: 25, c: 1 },
    { n: 'Intel Pentium', y: 1993, k: 'CPU', t: 3.1e6, nm: 800, mhz: 66, c: 1 },
    { n: 'Intel Pentium 4', y: 2000, k: 'CPU', t: 42e6, nm: 180, mhz: 1500, c: 1 },
    { n: 'GeForce 3', y: 2001, k: 'GPU', t: 57e6, nm: 150 },
    { n: 'Pentium 4 (3.8 GHz)', y: 2004, k: 'CPU', t: 125e6, nm: 90, mhz: 3800, c: 1, w: 115 },
    { n: 'Core 2 Duo E6600', y: 2006, k: 'CPU', t: 291e6, nm: 65, mhz: 2400, c: 2, f: 38, w: 65 },
    { n: 'GeForce 8800 GTX', y: 2006, k: 'GPU', t: 681e6, nm: 90, c: 128, f: 346, bw: 86.4, w: 155 },
    { n: 'Core i7-920', y: 2008, k: 'CPU', t: 731e6, nm: 45, mhz: 2660, c: 4, f: 85, bw: 25.6, w: 130 },
    { n: 'GeForce GTX 280', y: 2008, k: 'GPU', t: 1.4e9, nm: 65, c: 240, f: 622, bw: 141.7, w: 236 },
    { n: 'GeForce GTX 580', y: 2010, k: 'GPU', t: 3.0e9, nm: 40, c: 512, f: 1581, bw: 192.4, w: 244 },
    { n: 'Core i7-2600K', y: 2011, k: 'CPU', t: 1.16e9, nm: 32, mhz: 3400, c: 4, f: 218, bw: 21.3, w: 95 },
    { n: 'GeForce GTX 680', y: 2012, k: 'GPU', t: 3.54e9, nm: 28, c: 1536, f: 3090, bw: 192.3, w: 195 },
    { n: 'GeForce GTX 1080', y: 2016, k: 'GPU', t: 7.2e9, nm: 16, c: 2560, f: 8873, bw: 320, w: 180 },
    { n: 'Ryzen 7 1800X', y: 2017, k: 'CPU', t: 4.8e9, nm: 14, mhz: 3600, c: 8, f: 461, w: 95 },
    { n: 'Tesla V100', y: 2017, k: 'GPU', t: 21.1e9, nm: 12, c: 5120, f: 15700, ai: 125, bw: 900, w: 300 },
    { n: 'GeForce RTX 2080 Ti', y: 2018, k: 'GPU', t: 18.6e9, nm: 12, c: 4352, f: 13450, bw: 616, w: 250 },
    { n: 'Apple M1', y: 2020, k: 'CPU', t: 16e9, nm: 5, mhz: 3200, c: 8, bw: 68 },
    { n: 'A100', y: 2020, k: 'GPU', t: 54.2e9, nm: 7, c: 6912, f: 19500, ai: 312, bw: 1555, w: 400 },
    { n: 'GeForce RTX 3090', y: 2020, k: 'GPU', t: 28.3e9, nm: 8, c: 10496, f: 35580, bw: 936, w: 350 },
    { n: 'Ryzen 9 7950X', y: 2022, k: 'CPU', nm: 5, mhz: 4500, c: 16, f: 2304, bw: 83.2, w: 170 },
    { n: 'H100 (SXM)', y: 2022, k: 'GPU', t: 80e9, nm: 4, c: 16896, f: 67000, ai: 989, bw: 3350, w: 700 },
    { n: 'GeForce RTX 4090', y: 2022, k: 'GPU', t: 76.3e9, nm: 4, c: 16384, f: 82580, bw: 1008, w: 450 },
    { n: 'Apple M3 Max', y: 2023, k: 'CPU', t: 92e9, nm: 3, c: 16, bw: 400 },
    { n: 'AMD Instinct MI300X', y: 2023, k: 'GPU', t: 153e9, nm: 5, c: 19456, f: 163400, ai: 1307, bw: 5300, w: 750 },
    { n: 'AMD EPYC 9965', y: 2024, k: 'CPU', nm: 3, mhz: 2250, c: 192, f: 27648, bw: 614, w: 500 },
    { n: 'B200', y: 2024, k: 'GPU', t: 208e9, nm: 4, ai: 2250, bw: 8000, w: 1000 },
    { n: 'GeForce RTX 5090', y: 2025, k: 'GPU', t: 92.2e9, nm: 4, c: 21760, f: 104800, bw: 1792, w: 575 }
  ];
  function cgNum(v) { if (v >= 1e9) return fmt(v / 1e9, v >= 1e10 ? 0 : 1) + ' billion'; if (v >= 1e6) return fmt(v / 1e6, v >= 1e7 ? 0 : 1) + ' million'; return fmt(v, 0); }
  function cgDot(svg, x, y, col, r, sq) { if (sq) el('rect', { x: x - r, y: y - r, width: 2 * r, height: 2 * r, fill: col, stroke: '#fff', 'stroke-width': 1 }, svg); else el('circle', { cx: x, cy: y, r: r, fill: col, stroke: '#fff', 'stroke-width': 1 }, svg); }
  function cgLogTicks(lo, hi) { var t = [], step = Math.log10(hi / lo) > 8 ? 2 : 1; for (var e = Math.log10(lo); e <= Math.log10(hi) + 1e-9; e += step) t.push(Math.pow(10, e)); return t; }
  function cgSelect(parent, label, items, initial, onPick) {
    var g = group(parent, label), s = document.createElement('select');
    s.style.cssText = 'font:inherit;font-size:0.9rem;padding:0.3rem 0.4rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);color:var(--ink);max-width:100%;';
    items.forEach(function (it, i) { var o = document.createElement('option'); o.value = i; o.textContent = it; if (i === initial) o.selected = true; s.appendChild(o); });
    s.setAttribute('aria-label', label); s.addEventListener('change', function () { onPick(+s.value); }); g.appendChild(s); return s;
  }

  /* -----------------------------------------------------------------------
     Figure: few fast workers against many slow ones
     ----------------------------------------------------------------------- */
  FIG['fig-paint'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var task = 0, t = 0, raf = null, last = 0;
    var COLS = 48, ROWS = 30, N = COLS * ROWS, CPU = { w: 8, slow: 1 }, GPU = { w: 480, slow: 8 };
    var controls = div('fig-controls', container);
    choice(controls, 'Job', ['Independent pixels', 'Each pixel needs the one before'], task, function (i) { task = i; reset(); });
    var row = group(controls, 'Run'); var bS = btn('Start', row), bR = btn('Reset', row);
    bS.addEventListener('click', function () { if (raf) { stop(); } else { if (done(CPU) && done(GPU)) t = 0; bS.textContent = 'Pause'; last = 0; raf = window.requestAnimationFrame(loop); } });
    bR.addEventListener('click', reset);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function finish(P) { return task === 0 ? Math.ceil(N / P.w) * P.slow : N * P.slow; }
    function painted(P) { var steps = Math.floor(t / P.slow); return Math.min(N, task === 0 ? steps * P.w : steps); }
    function done(P) { return painted(P) >= N; }
    function stop() { if (raf) window.cancelAnimationFrame(raf); raf = null; bS.textContent = 'Start'; }
    function reset() { stop(); t = 0; draw(); }
    function loop(ts) { if (!raf) return; var speed = task === 0 ? 0.06 : 1.2; if (last) t += (ts - last) * speed; last = ts; if (t >= finish(CPU) && t >= finish(GPU)) { t = Math.max(finish(CPU), finish(GPU)); draw(); stop(); return; } draw(); raf = window.requestAnimationFrame(loop); }
    function draw() {
      var c = C(), Wc = svgWrap.clientWidth || container.clientWidth || 700, narrow = Wc < 560;
      var pw0 = narrow ? Math.max(300, Wc) - 20 : (Math.max(300, Wc) - 40) / 2, cell0 = Math.min(pw0 / COLS, narrow ? 5.5 : 7), H = narrow ? 2 * cell0 * ROWS + 110 : cell0 * ROWS + 56;
      var A = newSVG(svgWrap, container, H, 'Two processors painting the same picture: a few fast workers and many slow ones'), W = A.W, svg = A.svg, fs = A.fs;
      var pw = narrow ? W - 20 : (W - 40) / 2, cell = Math.min(pw / COLS, narrow ? 5.5 : 7), gw = cell * COLS, gh = cell * ROWS;
      [[CPU, 'CPU-style: 8 fast workers', OI[0]], [GPU, 'GPU-style: 480 workers, 8× slower each', OI[3]]].forEach(function (q, i) {
        var P = q[0], x0 = narrow ? (W - gw) / 2 : 10 + i * (pw + 20) + (pw - gw) / 2, y0 = narrow ? 24 + i * (gh + 52) : 24, k = painted(P);
        txt(svg, x0, y0 - 8, q[1], { anchor: 'start', size: fs(10), fill: q[2], weight: 600 });
        el('rect', { x: x0, y: y0, width: gw, height: gh, fill: c.sunken, stroke: c.border }, svg);
        var full = Math.floor(k / COLS); if (full) el('rect', { x: x0, y: y0, width: gw, height: full * cell, fill: q[2], 'fill-opacity': 0.75 }, svg);
        if (k % COLS && full < ROWS) el('rect', { x: x0, y: y0 + full * cell, width: (k % COLS) * cell, height: cell, fill: q[2], 'fill-opacity': 0.75 }, svg);
        txt(svg, x0 + gw / 2, y0 + gh + 16, (k >= N ? 'done at t = ' + fmt(finish(P), 0) : fmt(100 * k / N, 0) + '% painted'), { size: fs(10), fill: c.ink2 });
      });
      var fc = finish(CPU), fg = finish(GPU);
      out.innerHTML = 'Time: <strong>' + fmt(Math.min(t, Math.max(fc, fg)), 0) + '</strong> units. CPU-style finishes at t = ' + fmt(fc, 0) + ', GPU-style at t = ' + fmt(fg, 0) + ': the ' + (fc < fg ? 'CPU' : 'GPU') + ' wins by a factor of ' + fmt(Math.max(fc, fg) / Math.min(fc, fg), 1) + '.' + NOTE + (task === 0 ? 'When every pixel can be painted without waiting for any other, the 480 slow workers share the job and finish long before the 8 fast ones. Graphics, matrix multiplication and neural networks are like this: millions of similar, independent operations. GPUs are built for this <em>throughput</em>.' : 'When each step needs the result of the one before, only one worker can be busy at a time, and what matters is how fast that one worker is. Most everyday programs are full of such chains: decisions, branches, lookups. CPUs are built for this low <em>latency</em>, with fast clocks, deep caches and clever prediction.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: clock speed and core counts
     ----------------------------------------------------------------------- */
  var CLOCK = [[1971, 0.74, 1], [1978, 10, 1], [1982, 8, 1], [1985, 16, 1], [1989, 25, 1], [1993, 66, 1], [1995, 200, 1], [1997, 300, 1], [1999, 600, 1], [2000, 1500, 1], [2001, 2000, 1], [2002, 3060, 1], [2004, 3800, 1],
    [2005, 3200, 2], [2006, 2930, 4], [2008, 3200, 4], [2010, 3330, 6], [2011, 3800, 6], [2013, 3900, 8], [2015, 4200, 8], [2017, 4500, 16], [2019, 5000, 32], [2020, 4900, 64], [2022, 5800, 64], [2023, 6000, 96], [2024, 6200, 96]];
  FIG['fig-clock-wall'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var yr = 2004;
    var controls = div('fig-controls', container);
    var sy = FIG.slider(controls, { id: 'cg-cy', label: 'Year', min: 1971, max: 2024, step: 1, value: yr, onChange: function (z) { yr = Math.round(z); draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function at(y) { var r = CLOCK[0]; CLOCK.forEach(function (q) { if (q[0] <= y) r = q; }); return r; }
    function draw() {
      valText(sy, String(yr));
      var c = C(), A = newSVG(svgWrap, container, 300, 'Fastest desktop processor clock speed and largest core count in desktop and workstation chips, by year'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 26, B: 252, xl: 1966, xh: 2026, yl: 0.5, yh: 1e4, logy: true, xticks: [1970, 1980, 1990, 2000, 2010, 2020], yticks: [1, 10, 100, 1000, 10000], xlab: 'Year', ylab: '' });
      el('rect', { x: P.X(2004), y: 26, width: P.X(2026) - P.X(2004), height: 226, fill: OI[2], 'fill-opacity': 0.06 }, svg);
      function line(idx, col) { var d = ''; CLOCK.forEach(function (q, i) { d += (i ? 'L' : 'M') + P.X(q[0]).toFixed(1) + ' ' + P.Y(q[idx]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 2.2 }, svg); CLOCK.forEach(function (q) { cgDot(svg, P.X(q[0]), P.Y(q[idx]), col, 2.6, idx === 2); }); }
      line(1, OI[0]); line(2, OI[3]);
      el('line', { x1: P.X(yr), y1: 26, x2: P.X(yr), y2: 252, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      var q = at(yr);
      legend(svg, c, fs, W, 'blue: fastest clock (MHz)    red squares: most cores in a desktop or workstation chip    green: after the power wall', 'blue clock (MHz) · red cores');
      out.innerHTML = 'In ' + yr + ': fastest clock about <strong>' + (q[1] >= 1000 ? fmt(q[1] / 1000, 2) + ' GHz' : fmt(q[1], q[1] < 1 ? 2 : 0) + ' MHz') + '</strong>, up to <strong>' + q[2] + '</strong> core' + (q[2] > 1 ? 's' : '') + '.' + NOTE + 'Clock speed rose about ten-thousand-fold in 30 years, then stalled near 4–6 GHz after 2004: power rises steeply with frequency and voltage, and chips could no longer be cooled. Since then extra transistors have gone into more cores, wider vector units and bigger caches. The values are approximate, for the fastest consumer parts of each year.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: generations explorer
     ----------------------------------------------------------------------- */
  FIG['fig-explorer'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = [
      { name: 'Transistors', key: 't', fmtv: cgNum, lab: 'Transistors per chip' },
      { name: 'FP32 GFLOPS', key: 'f', fmtv: function (v) { return fmt(v, 0) + ' GFLOPS'; }, lab: 'Peak FP32 GFLOPS' },
      { name: 'Memory bandwidth', key: 'bw', fmtv: function (v) { return fmt(v, v < 100 ? 1 : 0) + ' GB/s'; }, lab: 'Memory bandwidth (GB/s)' },
      { name: 'GFLOPS per watt', key: 'eff', fmtv: function (v) { return fmt(v, v < 10 ? 2 : 0) + ' GFLOPS/W'; }, lab: 'FP32 GFLOPS per watt' }
    ], mi = 0, hi = CHIPS.length - 1;
    CHIPS.forEach(function (q) { if (q.f && q.w) q.eff = q.f / q.w; });
    var controls = div('fig-controls', container);
    choice(controls, 'Measure', M.map(function (m) { return m.name; }), mi, function (i) { mi = i; draw(); });
    var sh = FIG.slider(controls, { id: 'cg-ex', label: 'Highlight chip', min: 0, max: CHIPS.length - 1, step: 1, value: hi, onChange: function (z) { hi = Math.round(z); draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var m = M[mi], q = CHIPS[hi], c = C(); valText(sh, q.n);
      var D = CHIPS.filter(function (r) { return r[m.key]; }), vals = D.map(function (r) { return r[m.key]; });
      var lo = Math.pow(10, Math.floor(Math.log10(Math.min.apply(null, vals)))), up = Math.pow(10, Math.ceil(Math.log10(Math.max.apply(null, vals))));
      var A = newSVG(svgWrap, container, 300, m.lab + ' of CPUs and GPUs by year, on a logarithmic scale'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 26, B: 252, xl: 1966, xh: 2026, yl: lo, yh: up, logy: true, xticks: [1970, 1980, 1990, 2000, 2010, 2020], yticks: cgLogTicks(lo, up), xlab: 'Year', ylab: '' });
      D.forEach(function (r) { cgDot(svg, P.X(r.y), P.Y(r[m.key]), r.k === 'CPU' ? OI[0] : OI[3], r === q ? 7 : 4, r.k === 'GPU'); });
      if (q[m.key]) { var X = P.X(q.y), Y = P.Y(q[m.key]); el('circle', { cx: X, cy: Y, r: 11, fill: 'none', stroke: c.ink, 'stroke-width': 1.5 }, svg); }
      legend(svg, c, fs, W, 'blue circles: CPUs    red squares: GPUs    (logarithmic scale)', 'blue CPU · red GPU (log scale)');
      var parts = [q.n + ' (' + q.k + ', ' + q.y + ')'];
      if (q.t) parts.push(cgNum(q.t) + ' transistors'); if (q.nm) parts.push(q.nm >= 1000 ? fmt(q.nm / 1000, 1) + ' µm process' : q.nm + ' nm-class process');
      if (q.mhz) parts.push(q.mhz >= 1000 ? fmt(q.mhz / 1000, 2) + ' GHz' : fmt(q.mhz, q.mhz < 1 ? 2 : 0) + ' MHz'); if (q.c) parts.push(fmt(q.c, 0) + (q.k === 'GPU' ? ' shader cores' : ' core' + (q.c > 1 ? 's' : '')));
      if (q.f) parts.push(fmt(q.f, 0) + ' GFLOPS FP32'); if (q.ai) parts.push(fmt(q.ai, 0) + ' TFLOPS FP16 on tensor/matrix units'); if (q.bw) parts.push(fmt(q.bw, 0) + ' GB/s memory'); if (q.w) parts.push(q.w + ' W');
      out.innerHTML = '<strong>' + parts[0] + '</strong>: ' + parts.slice(1).join(' · ') + '.' + (q[m.key] ? '' : ' (No ' + m.name.toLowerCase() + ' figure for this chip.)') + NOTE + ['Both kinds of chip have followed Moore’s law, doubling their transistor count roughly every two years. The biggest GPUs now hold more transistors than any CPU.', 'Peak arithmetic is where GPUs pull away: by 2006 a gaming card out-computed any desktop CPU, and the gap is now roughly a factor of 30–50 between flagship consumer parts. CPU figures are theoretical peaks using their vector units.', 'Feeding thousands of cores needs bandwidth. GPUs use wide, fast memory (GDDR, or HBM stacked beside the chip) and lead CPUs here by a factor of ten or more.', 'Work done per joule has improved by more than a hundredfold since 2006, faster for GPUs than CPUs. Energy, not transistors, now limits what chips can do.'][mi] + ' Figures are manufacturers’ published peak values.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: compare two chips
     ----------------------------------------------------------------------- */
  FIG['fig-compare'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var names = CHIPS.map(function (q) { return q.n + ' (' + q.y + ')'; }), a = 4, b = CHIPS.length - 1;
    CHIPS.forEach(function (q, i) { if (q.n === 'Intel Pentium') a = i; });
    var controls = div('fig-controls', container);
    cgSelect(controls, 'Chip A', names, a, function (i) { a = i; draw(); });
    cgSelect(controls, 'Chip B', names, b, function (i) { b = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var F = [['t', 'Transistors'], ['mhz', 'Clock speed'], ['c', 'Cores'], ['f', 'FP32 GFLOPS'], ['bw', 'Memory bandwidth'], ['w', 'Power']];
    function draw() {
      var A0 = CHIPS[a], B0 = CHIPS[b], c = C(), rows = F.filter(function (f) { return A0[f[0]] && B0[f[0]]; });
      var H = 40 + Math.max(rows.length, 1) * 36, G = newSVG(svgWrap, container, H, 'Ratios between the two chosen chips'), W = G.W, svg = G.svg, fs = G.fs;
      var L = W < 560 ? 120 : 150, R = W - 70, mid = (L + R) / 2, X = function (r) { return mid + Math.max(-1, Math.min(1, Math.log10(r) / 6)) * (R - L) / 2; };
      el('line', { x1: mid, y1: 14, x2: mid, y2: H - 10, stroke: c.muted }, svg);
      txt(svg, L, 12, '← A larger', { anchor: 'start', size: fs(9), fill: c.muted }); txt(svg, R, 12, 'B larger →', { anchor: 'end', size: fs(9), fill: c.muted });
      if (!rows.length) txt(svg, mid, 40, 'No shared measurements for these two chips', { size: fs(10), fill: c.muted });
      rows.forEach(function (f, i) { var r = B0[f[0]] / A0[f[0]], y = 34 + i * 36;
        txt(svg, L - 10, y + 4, f[1], { anchor: 'end', size: fs(10), fill: c.ink2 });
        el('rect', { x: Math.min(mid, X(r)), y: y - 9, width: Math.abs(X(r) - mid), height: 18, fill: r >= 1 ? OI[3] : OI[0], 'fill-opacity': 0.75 }, svg);
        txt(svg, r >= 1 ? Math.min(X(r) + 6, W - 4) : Math.max(X(r) - 6, L), y + 4, (r >= 1 ? '×' + (r >= 100 ? fmt(r, 0) : fmt(r, r >= 10 ? 0 : 1)) : '÷' + (1 / r >= 100 ? fmt(1 / r, 0) : fmt(1 / r, 1 / r >= 10 ? 0 : 1))), { anchor: r >= 1 ? 'start' : 'end', size: fs(10), fill: c.ink, weight: 600 });
      });
      var yrs = B0.y - A0.y, msg = '';
      if (A0.t && B0.t && yrs > 0) msg = ' Over ' + yrs + ' years, the transistor count grew ×' + fmt(B0.t / A0.t, 0) + ', a doubling every ' + fmt(yrs * Math.LN2 / Math.log(B0.t / A0.t), 1) + ' years.';
      out.innerHTML = '<strong>' + A0.n + '</strong> (' + A0.k + ', ' + A0.y + ') against <strong>' + B0.n + '</strong> (' + B0.k + ', ' + B0.y + ').' + msg + NOTE + 'Bars use a logarithmic scale, capped at a factor of a million either way. Only measurements known for both chips are shown; for GPUs, “cores” means shader cores, which are much simpler than CPU cores. Peak figures are not the whole story: real programs rarely reach them, and a CPU and a GPU with the same GFLOPS are good at very different jobs.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: number formats
     ----------------------------------------------------------------------- */
  FIG['fig-formats'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var FM = [['FP64', 11, 52, 1.7976931348623157e308], ['FP32', 8, 23, 3.4028234663852886e38], ['TF32', 8, 10, 3.4011621342146535e38], ['BF16', 8, 7, 3.3895313892515355e38], ['FP16', 5, 10, 65504], ['FP8 (E4M3)', 4, 3, 448], ['FP4 (E2M1)', 2, 1, 6]];
    var VAL = [['π', Math.PI], ['1/3', 1 / 3], ['0.1', 0.1], ['1000.7', 1000.7], ['70,000', 70000], ['0.00003', 3e-5]], vi = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Number to store', VAL.map(function (v) { return v[0]; }), vi, function (i) { vi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function store(x, e, m, mx) {
      var bias = Math.pow(2, e - 1) - 1, emin = 1 - bias;
      if (x > mx * (1 + Math.pow(2, -m - 1))) return Infinity;
      var ex = Math.max(Math.floor(Math.log2(x)), emin), q = Math.pow(2, ex - m), v = Math.round(x / q) * q;
      return Math.min(v, mx);
    }
    function draw() {
      var x = VAL[vi][1], c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560;
      var A = newSVG(svgWrap, container, 30 + FM.length * 34, 'Bit layouts of floating-point formats and how each stores the chosen number'), W = A.W, svg = A.svg, fs = A.fs;
      var L = narrow ? 78 : 96, bw = narrow ? (W - L - 10) / 64 : Math.min(8, (W - L - 300) / 64), R0 = L + 64 * bw + 12;
      FM.forEach(function (f, i) {
        var y = 20 + i * 34, bits = 1 + f[1] + f[2], v = store(x, f[1], f[2], f[3]), err = isFinite(v) ? Math.abs(v - x) / x : NaN;
        txt(svg, L - 8, y + 12, f[0], { anchor: 'end', size: fs(10), fill: c.ink, weight: 600 });
        for (var k = 0; k < bits; k++) el('rect', { x: L + k * bw, y: y, width: Math.max(1, bw - (bw > 3 ? 1 : 0)), height: 16, fill: k === 0 ? c.muted : k <= f[1] ? OI[0] : OI[3], 'fill-opacity': 0.8 }, svg);
        var s = f[0] === 'FP64' ? String(+v.toPrecision(12)) + '  (reference)' : !isFinite(v) ? 'too large' : (v === 0 ? '0 (too small)' : (Math.abs(v) >= 1e5 || Math.abs(v) < 1e-3 ? v.toExponential(4) : String(+v.toPrecision(10))) + (err > 1e-12 ? '  (error ' + (err < 1e-4 ? err.toExponential(1) : fmt(100 * err, err < 0.01 ? 3 : 1) + '%') + ')' : '  (exact)'));
        if (narrow) txt(svg, L, y + 28, s, { anchor: 'start', size: fs(9), fill: isFinite(v) && v !== 0 ? c.ink2 : OI[3] });
        else txt(svg, R0, y + 12, s, { anchor: 'start', size: fs(10), fill: isFinite(v) && v !== 0 ? c.ink2 : OI[3] });
      });
      out.innerHTML = 'Storing ' + VAL[vi][0] + ' in each format. Grey: sign bit. Blue: exponent bits, which set the <em>range</em>. Red: mantissa bits, which set the <em>precision</em>.' + NOTE + 'Halving the bits roughly doubles how many numbers a chip can move and multiply per second, so AI hardware has moved from FP32 to FP16 and BF16, then to 8 and 4 bits. BF16 keeps FP32’s 8 exponent bits, so it rarely overflows, but has only about 3 significant digits. FP8 and FP4 need careful scaling, and values are usually stored in blocks that share a scale factor. FP64 is the reference: this page itself computes in FP64. Values here ignore subnormal numbers and special cases.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-cg'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'How many transistors did the first microprocessor, the Intel 4004 (1971), have?', options: ['About 230', 'About 2,300', 'About 23,000', 'About 2.3 million'], answer: 1, explanation: 'Today’s largest GPUs have around 200 billion.' },
      { question: 'A CPU is designed mainly for…', options: ['Maximum throughput on identical tasks', 'Low latency on a few varied, branching tasks', 'Displaying images only', 'Storing data'], answer: 1, explanation: 'Fast clocks, big caches, branch prediction and out-of-order execution.' },
      { question: 'Why did processor clock speeds stop rising quickly around 2004?', options: ['Software could not use them', 'Power and heat grew too fast to cool the chips', 'Transistors stopped shrinking', 'Memory became too fast'], answer: 1, explanation: 'Dennard scaling ended, so power density kept rising with frequency.' },
      { question: 'What did Nvidia’s CUDA (2007) make possible?', options: ['Real-time ray tracing', 'Writing general-purpose programs for GPUs in a C-like language', 'Running Windows on a GPU', '4-bit arithmetic'], answer: 1, explanation: 'It opened GPUs to science and, later, deep learning.' },
      { question: 'Which result in 2012 showed GPUs could transform AI?', options: ['Deep Blue beating Kasparov', 'AlexNet winning the ImageNet contest', 'AlphaGo beating Lee Sedol', 'The launch of ChatGPT'], answer: 1, explanation: 'It was trained on two GeForce GTX 580 cards.' },
      { question: 'What are tensor cores?', options: ['Extra CPU cores', 'Units that multiply small matrices at low precision, built for neural networks', 'Memory chips', 'Ray-tracing units'], answer: 1, explanation: 'Introduced with the V100 in 2017.' },
      { question: 'Why do AI chips advertise FP8 and FP4 performance?', options: ['Those formats are more accurate', 'Fewer bits per number let the chip do more operations per second and move less data', 'They are required by law', 'Graphics needs them'], answer: 1, explanation: 'Neural networks tolerate low precision with careful scaling.' },
      { question: 'Which instruction set do almost all smartphones use?', options: ['x86', 'Arm', 'RISC-V', 'PowerPC'], answer: 1, explanation: 'Arm began with Acorn in Cambridge in 1985.' },
      { question: 'Which was the first supercomputer measured above one exaflop?', options: ['Roadrunner', 'Fugaku', 'Frontier', 'Summit'], answer: 2, explanation: 'Frontier at Oak Ridge, in 2022, using AMD CPUs and GPUs.' },
      { question: 'For a short program full of if-statements that depend on each other, which usually runs it faster?', options: ['A GPU', 'A CPU', 'Both equally', 'Neither can run it'], answer: 1, explanation: 'Serial, branchy code needs one fast core, not many slow ones.' }
    ]);
  };
})();
