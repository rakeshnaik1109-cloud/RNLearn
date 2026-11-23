/* ==========================================================================
   RNLearn — Modern (From Switch to Supercomputer, Part 11)
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
    { name: 'New materials', color: '#b45309' },
    { name: 'Into the third dimension', color: '#1d4ed8' },
    { name: 'Gate all around', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1989', icon: '🔺', era: 1, sec: 5, title: 'DELTA', text: 'Digh Hisamoto and colleagues at Hitachi build a vertical ultrathin transistor with a gate on both sides, a forerunner of the FinFET.' },
    { year: '1999', icon: '🐟', era: 1, sec: 5, title: 'FinFET', text: 'Chenming Hu’s group at Berkeley, with Hisamoto, demonstrates self-aligned FinFETs with gates below 50 nm (published 1999–2000).' },
    { year: '2003', icon: '🪢', era: 0, sec: 4, title: 'Strained silicon', text: 'Intel’s 90 nm process stretches and squeezes the silicon lattice to speed up electrons and holes.' },
    { year: '2007', icon: '🧱', era: 0, sec: 4, title: 'High-k metal gate', text: 'Intel’s 45 nm process replaces the silicon dioxide gate insulator with hafnium-based high-k material and polysilicon with metal gates.' },
    { year: '2011', icon: '🏗️', era: 1, sec: 5, title: 'Tri-gate in production', text: 'Intel announces 22 nm tri-gate (FinFET) transistors, shipping in processors in 2012; other foundries follow at 16/14 nm.' },
    { year: '2017', icon: '🥞', era: 2, sec: 6, title: 'Stacked nanosheets', text: 'IBM, GlobalFoundries and Samsung researchers report stacked nanosheet gate-all-around transistors as the successor to FinFETs.' },
    { year: '2022', icon: '🌐', era: 2, sec: 6, title: 'GAA in production', text: 'Samsung begins mass production of a 3 nm-class process with gate-all-around transistors.' }
  ];

  FIG['fig-el11-timeline'] = function (figEl) {
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

  var EL_PART = 11;
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
     Figure: short-channel effects and the scale length
     ----------------------------------------------------------------------- */
  FIG['fig-el-sce'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var L = 20, ST = [['Planar (bulk)', 6.7, BLUE], ['FinFET', 3.2, EC], ['Gate-all-around', 1.9, PURPLE]];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'sc-l', label: 'Gate length L (nm)', min: 5, max: 60, step: 1, value: L, onChange: function (x) { L = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function S(lam, l) { var e = Math.exp(-l / (2 * lam)); return Math.min(400, 60 * (1 + 0.1) / Math.max(0.05, 1 - 4 * e)); }
    function dibl(lam, l) { return Math.min(999, 1000 * Math.exp(-l / (2 * lam)) * 0.9); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Subthreshold swing against gate length for three transistor structures'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 5, xh: 60, yl: 60, yh: 200, xticks: [5, 10, 20, 30, 40, 50, 60], yticks: [60, 100, 140, 180], xlab: 'gate length (nm)', ylab: 'subthreshold swing (mV/dec)' });
      el('rect', { x: P.X(5), y: P.Y(90), width: P.X(60) - P.X(5), height: P.Y(60) - P.Y(90), fill: GREEN + '14' }, svg); txt(svg, P.X(59), P.Y(62) - 4, 'good switching', { anchor: 'end', size: fs(9), fill: GREEN });
      ST.forEach(function (s, i) { plotLine(svg, P, function (l) { return S(s[1], l); }, 5, 60, 200, s[2], 2.4); var lx = 3.93 * s[1]; txt(svg, P.X(lx) + 6, P.Y(150 + i * 14), s[0], { anchor: 'start', size: fs(9), fill: s[2], weight: 700 }); });
      el('line', { x1: P.X(L), y1: 30, x2: P.X(L), y2: 244, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      ST.forEach(function (s) { el('circle', { cx: P.X(L), cy: P.Y(Math.min(199, S(s[1], L))), r: 4.5, fill: s[2] }, svg); });
      legend(svg, c, fs, W, 'the gate loses control when the channel is shorter than about 5–6 natural lengths λ of the structure', 'gate loses control below ~5λ');
      out.innerHTML = 'At L = ' + L + ' nm — ' + ST.map(function (s) { var v = S(s[1], L); return s[0] + ': S ≈ <strong>' + (v >= 200 ? '> 200' : fmt(v, 0)) + '</strong> mV/dec, DIBL ≈ ' + (dibl(s[1], L) >= 300 ? '> 300' : fmt(dibl(s[1], L), 0)) + ' mV/V'; }).join('; ') + '.' + NOTE + 'In a short channel, the drain’s electric field reaches under the gate and helps lower the source barrier, competing with the gate. The threshold falls as L shrinks (roll-off), falls further at high drain voltage (drain-induced barrier lowering, DIBL), and the swing worsens. These effects grow as e<sup>−L/2λ</sup>, where the natural length λ ≈ √((ε<sub>Si</sub>/ε<sub>ox</sub>) t<sub>ox</sub> t<sub>Si</sub>/N) depends on oxide thickness, silicon thickness and the number N of gates. Wrapping the gate around a thin channel shrinks λ (here 6.7, 3.2 and 1.9 nm), allowing shorter gates. [Simplified model; values illustrative.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: gate tunnelling and high-k dielectrics
     ----------------------------------------------------------------------- */
  FIG['fig-el-tunnel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var eot = 1.0, k = 20;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'tu-e', label: 'Equivalent oxide thickness (nm)', min: 0.5, max: 2.5, step: 0.05, value: eot, onChange: function (x) { eot = x; draw(); } });
    FIG.slider(controls, { id: 'tu-k', label: 'High-k dielectric constant', min: 8, max: 30, step: 1, value: k, onChange: function (x) { k = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Jsio(t) { return 1e7 * Math.exp(-11.4 * t); }
    function Jhk(t) { return 3e5 * Math.exp(-5.6 * t); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Gate tunnelling current against physical insulator thickness'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0, xh: 8, yl: 1e-8, yh: 1e6, logy: true, xticks: [0, 1, 2, 3, 4, 5, 6, 7, 8], yticks: [1e-8, 1e-4, 1e0, 1e4], xlab: 'physical thickness of the gate insulator (nm)', ylab: 'leakage (A/cm²)' });
      plotLine(svg, P, Jsio, 0.3, 8, 200, AMBER, 2.4); plotLine(svg, P, Jhk, 0.3, 8, 200, EC, 2.4);
      txt(svg, P.X(1.6), P.Y(Jsio(1.6)) - 8, 'SiO₂', { anchor: 'start', size: fs(10), fill: AMBER, weight: 700 }); txt(svg, P.X(5.5), P.Y(Jhk(5.5)) - 8, 'high-k (HfO₂-like)', { anchor: 'start', size: fs(10), fill: EC, weight: 700 });
      var tH = eot * k / 3.9, j1 = Jsio(eot), j2 = Jhk(tH);
      el('circle', { cx: P.X(eot), cy: P.Y(j1), r: 5, fill: AMBER }, svg); if (tH <= 8) el('circle', { cx: P.X(tH), cy: P.Y(j2), r: 5, fill: EC }, svg);
      el('line', { x1: P.X(eot), y1: P.Y(j1), x2: P.X(Math.min(8, tH)), y2: P.Y(Math.max(j2, 1e-8)), stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      legend(svg, c, fs, W, 'both dots give the same gate capacitance; the thicker high-k layer blocks tunnelling far better', 'same capacitance, different leakage');
      out.innerHTML = 'For the same capacitance as ' + fmt(eot, 2) + ' nm of SiO₂, a high-k film with κ = ' + k + ' can be <strong>' + fmt(tH, 1) + ' nm</strong> thick. Leakage: SiO₂ ≈ <strong>' + sciHTML(j1, 1) + ' A/cm²</strong>, high-k ≈ <strong>' + sciHTML(j2, 1) + ' A/cm²</strong> (' + (j1 / j2 > 1 ? sciHTML(j1 / j2, 1) + '× less' : 'no better') + ').' + NOTE + 'Electrons tunnel through an insulator with a probability that falls exponentially with thickness: for SiO₂, roughly tenfold for every 0.2 nm. By 2005 gate oxides were only about 1.2 nm, five atomic layers, and leaking badly. Capacitance depends on ε/t, so a material with a higher dielectric constant gives the same capacitance in a thicker layer. Its lower tunnelling barrier partly offsets the gain. The <em>equivalent oxide thickness</em> (EOT) is the SiO₂ thickness with the same capacitance. [Illustrative curves.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: planar, FinFET and nanosheet cross-sections
     ----------------------------------------------------------------------- */
  FIG['fig-el-3d'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 1, h = 50, n = 3;
    var controls = div('fig-controls', container);
    choice(controls, 'Structure', ['Planar', 'FinFET', 'Nanosheet (GAA)'], 1, function (i) { kind = i; draw(); });
    FIG.slider(controls, { id: 'fd-h', label: 'Fin height / sheet width (nm)', min: 20, max: 60, step: 1, value: h, onChange: function (x) { h = x; draw(); } });
    FIG.slider(controls, { id: 'fd-n', label: 'Fins / stacked sheets', min: 1, max: 4, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Cross-section of a transistor channel and gate'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, base = 230, sc = Math.min(2.2, (W - 60) / 160), fp, weff, sides;
      el('rect', { x: 20, y: base, width: W - 40, height: 30, fill: c.muted + '33' }, svg); txt(svg, 26, base + 20, 'silicon substrate', { anchor: 'start', size: fs(9), fill: c.ink2 });
      if (kind === 0) {
        fp = 90; weff = 90; sides = 1;
        var w0 = fp * sc; el('rect', { x: cx - w0 / 2, y: base - 6, width: w0, height: 6, fill: BLUE }, svg); el('rect', { x: cx - w0 / 2, y: base - 9, width: w0, height: 3, fill: AMBER }, svg); el('rect', { x: cx - w0 / 2, y: base - 60, width: w0, height: 51, fill: GREEN + '66', stroke: GREEN }, svg);
        txt(svg, cx, base - 30, 'gate', { size: fs(10), fill: c.ink, weight: 700 }); txt(svg, cx + w0 / 2 + 6, base - 2, 'channel (top surface only)', { anchor: 'start', size: fs(9), fill: BLUE });
      } else if (kind === 1) {
        var fw = 7, pitch = 30; fp = n * pitch; weff = n * (2 * h + fw); sides = 3;
        var x0 = cx - fp * sc / 2; el('rect', { x: x0 - 6, y: base - (h + 20) * sc, width: fp * sc + 12, height: (h + 20) * sc, fill: GREEN + '55', stroke: GREEN }, svg);
        for (var i = 0; i < n; i++) { var fx = x0 + (i + 0.5) * pitch * sc; el('rect', { x: fx - (fw / 2 + 1.5) * sc, y: base - (h + 1.5) * sc, width: (fw + 3) * sc, height: (h + 1.5) * sc, fill: AMBER }, svg); el('rect', { x: fx - fw / 2 * sc, y: base - h * sc, width: fw * sc, height: h * sc, fill: BLUE }, svg); }
        txt(svg, cx, base - (h + 10) * sc, 'gate wraps three sides of each fin', { size: fs(10), fill: c.ink, weight: 700 });
      } else {
        var t = 5, gap = 10, sp = h + 20; fp = sp; weff = n * 2 * (h + t); sides = 4;
        var gx = cx - (sp / 2) * sc, top = base - n * (t + gap) * sc - 10 * sc; el('rect', { x: gx, y: top, width: sp * sc, height: base - top, fill: GREEN + '55', stroke: GREEN }, svg);
        for (var j = 0; j < n; j++) { var yy = base - (j + 1) * (t + gap) * sc; el('rect', { x: cx - (h / 2 + 1.5) * sc, y: yy - 1.5 * sc, width: (h + 3) * sc, height: (t + 3) * sc, fill: AMBER }, svg); el('rect', { x: cx - h / 2 * sc, y: yy, width: h * sc, height: t * sc, fill: BLUE }, svg); }
        txt(svg, cx, top - 8, 'gate surrounds every sheet', { size: fs(10), fill: c.ink, weight: 700 });
      }
      legend(svg, c, fs, W, 'green: gate · amber: gate insulator · blue: silicon channel (current flows into the page)', 'green: gate · blue: channel');
      out.innerHTML = 'Gate controls the channel from <strong>' + sides + '</strong> side' + (sides > 1 ? 's' : '') + '. Effective channel width ≈ <strong>' + fmt(weff, 0) + ' nm</strong> in a footprint of about ' + fmt(fp, 0) + ' nm: <strong>' + fmt(weff / fp, 1) + '×</strong> the width of a planar transistor of the same footprint.' + NOTE + 'A planar transistor’s gate touches only the top of the channel, and the substrate below lets the drain’s field leak around it. A FinFET stands the channel up as a thin fin and wraps the gate over three sides; current flows along both side walls, so tall fins give more current per unit of chip area. Nanosheets turn the fin on its side and stack several thin sheets, each surrounded completely by the gate: the best electrostatic control, and a width that can be chosen continuously rather than in whole fins.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el11'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Drain-induced barrier lowering (DIBL) is…', options: ['A lithography defect', 'The drain voltage lowering the source barrier, reducing V_T in short channels', 'A type of memory', 'Heating of the drain'], answer: 1, explanation: 'A key short-channel effect.' },
      { question: 'In short-channel transistors, the saturation current is limited mainly by…', options: ['The square law', 'Velocity saturation of carriers', 'The battery', 'Gate leakage'], answer: 1, explanation: 'Carriers stop speeding up at about 10⁷ cm/s.' },
      { question: 'Why were high-k gate dielectrics introduced?', options: ['To make chips shinier', 'To give high capacitance with a physically thicker layer that tunnels less', 'To raise V_T', 'To replace copper'], answer: 1, explanation: 'Intel 45 nm, 2007.' },
      { question: 'A 3 nm layer of HfO₂ (κ = 20) has an equivalent oxide thickness of about…', options: ['3 nm', '1.5 nm', '0.6 nm', '15 nm'], answer: 2, explanation: '3 × 3.9/20.' },
      { question: 'Strained silicon improves transistors by…', options: ['Adding defects', 'Changing the band structure to raise carrier mobility', 'Lowering the band gap to zero', 'Thickening the oxide'], answer: 1, explanation: 'Tensile for electrons, compressive for holes.' },
      { question: 'A FinFET’s gate controls the channel from…', options: ['One side', 'Three sides', 'Below only', 'No sides'], answer: 1, explanation: 'Top and both side walls.' },
      { question: 'What is the main advantage of gate-all-around nanosheets over FinFETs?', options: ['Lower cost', 'Complete gate control and adjustable width', 'No lithography needed', 'They use germanium only'], answer: 1, explanation: 'Better electrostatics and design flexibility.' },
      { question: 'The “3 nm” in a process name refers to…', options: ['The gate length', 'The metal pitch', 'A marketing label for a generation, not a physical dimension', 'The fin width'], answer: 2, explanation: 'Gate pitches are around 45–50 nm.' },
      { question: 'Short-channel effects grow roughly as…', options: ['L²', 'e^(−L/2λ), where λ is the natural length', '1/L only', 'They are independent of L'], answer: 1, explanation: 'Thinner channels and more gates shrink λ.' },
      { question: 'A complementary FET (CFET) aims to…', options: ['Stack nMOS and pMOS transistors on top of each other', 'Use only pMOS', 'Remove the gate', 'Use vacuum'], answer: 0, explanation: 'Saves area in standard cells.' }
    ]);
  };
})();
