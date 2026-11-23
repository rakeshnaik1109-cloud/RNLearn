/* ==========================================================================
   RNLearn — CMOS (From Switch to Supercomputer, Part 9)
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
    { name: 'Low-power logic', color: '#b45309' },
    { name: 'Memories on chips', color: '#1d4ed8' },
    { name: 'Designing with millions', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1963', icon: '☯️', era: 0, sec: 3, title: 'CMOS invented', text: 'Frank Wanlass and Chih-Tang Sah demonstrate complementary MOS logic drawing nanowatts at rest.' },
    { year: '1967', icon: '🎈', era: 1, sec: 7, title: 'The floating gate', text: 'Dawon Kahng and Simon Sze propose storing charge on an isolated gate for non-volatile memory.' },
    { year: '1968', icon: '🧮', era: 0, sec: 5, title: 'CMOS chips on sale', text: 'RCA launches the CD4000 series of CMOS logic chips, soon used in digital watches and calculators.' },
    { year: '1978', icon: '⚡', era: 1, sec: 7, title: 'Fast CMOS memory', text: 'Hitachi’s Toshiaki Masuhara and colleagues show a CMOS static RAM as fast as nMOS with far lower power.' },
    { year: '1980', icon: '📘', era: 2, sec: 8, title: 'Mead and Conway', text: 'Carver Mead and Lynn Conway’s textbook teaches a generation to design chips with simple layout rules.' },
    { year: '1984', icon: '💾', era: 1, sec: 7, title: 'Flash memory', text: 'Fujio Masuoka and colleagues at Toshiba present flash memory, erasable in large blocks at once.' },
    { year: '1985', icon: '🖥️', era: 2, sec: 8, title: 'CMOS goes mainstream', text: 'Intel’s 80386 is made in CMOS; through the late 1980s and early 1990s CMOS displaces nMOS and then bipolar logic, even in mainframes.' }
  ];

  FIG['fig-el9-timeline'] = function (figEl) {
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

  var EL_PART = 9;
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

  var VT = 0.02585;
  function ekv(ov, vds, n) { var a = ov / (2 * n * VT), b = (ov - n * vds) / (2 * n * VT), la = a > 30 ? a : Math.log(1 + Math.exp(a)), lb = b > 30 ? b : Math.log(1 + Math.exp(b)); return la * la - lb * lb; }

  /* -----------------------------------------------------------------------
     Figure: CMOS inverter transfer curve
     ----------------------------------------------------------------------- */
  FIG['fig-el-vtc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Vdd = 0.8, ratio = 1, Vt = 0.3;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'vt-v', label: 'Supply voltage V_DD (V)', min: 0.2, max: 1.2, step: 0.02, value: Vdd, onChange: function (x) { Vdd = x; draw(); } });
    FIG.slider(controls, { id: 'vt-r', label: 'pMOS strength ÷ nMOS strength', min: 0.25, max: 4, step: 0.05, value: ratio, onChange: function (x) { ratio = x; draw(); } });
    FIG.slider(controls, { id: 'vt-t', label: 'Threshold voltage (V)', min: 0.15, max: 0.45, step: 0.01, value: Vt, onChange: function (x) { Vt = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function vout(vin) { var lo = 0, hi = Vdd, n = 1.35; for (var k = 0; k < 50; k++) { var m = (lo + hi) / 2, In = ekv(vin - Vt, m, n) * (1 + 0.6 * m), Ip = ratio * ekv(Vdd - vin - Vt, Vdd - m, n) * (1 + 0.6 * (Vdd - m)); if (In > Ip) hi = m; else lo = m; } return (lo + hi) / 2; }
    function icur(vin) { var v = vout(vin); return ekv(vin - Vt, v, 1.35); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Output against input voltage of a CMOS inverter'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 254, xl: 0, xh: Vdd, yl: 0, yh: Vdd * 1.05, xticks: [0, Vdd / 4, Vdd / 2, 3 * Vdd / 4, Vdd], yticks: [0, Vdd / 2, Vdd], xfmt: function (v) { return fmt(v, 2); }, yfmt: function (v) { return fmt(v, 2); }, xlab: 'input voltage (V)', ylab: 'output voltage (V)' });
      var N = 240, pts = [], imax = 0; for (var k = 0; k <= N; k++) { var vi = Vdd * k / N; pts.push([vi, vout(vi)]); imax = Math.max(imax, icur(vi)); }
      var vil = 0, vih = Vdd, vm = 0, gmax = 0;
      for (k = 1; k <= N; k++) { var g = (pts[k][1] - pts[k - 1][1]) / (pts[k][0] - pts[k - 1][0]); if (-g > gmax) gmax = -g; if (g < -1 && !vil) vil = pts[k - 1][0]; if (g < -1) vih = pts[k][0]; if (pts[k - 1][1] >= pts[k - 1][0] && pts[k][1] < pts[k][0]) vm = pts[k][0]; }
      var voh = vout(vil), vol = vout(vih), nml = vil - vol, nmh = voh - vih;
      el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1] / 1).toFixed(1); }).join(''), fill: 'none', stroke: c.border, 'stroke-width': 0 }, svg);
      var di = ''; for (k = 0; k <= N; k++) { var vi2 = Vdd * k / N; di += (k ? 'L' : 'M') + P.X(vi2).toFixed(1) + ' ' + P.Y(icur(vi2) / imax * Vdd * 0.6).toFixed(1); } el('path', { d: di, fill: AMBER + '22', stroke: AMBER, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      plotLine(svg, P, function (v) { return v; }, 0, Vdd, 2, c.border, 1, '3 3');
      el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1]).toFixed(1); }).join(''), fill: 'none', stroke: EC, 'stroke-width': 2.8 }, svg);
      if (vil) { [vil, vih].forEach(function (v) { el('line', { x1: P.X(v), y1: 30, x2: P.X(v), y2: 254, stroke: PURPLE, 'stroke-dasharray': '2 3' }, svg); }); txt(svg, P.X(vil) - 3, 44, 'V_IL', { anchor: 'end', size: fs(9), fill: PURPLE }); txt(svg, P.X(vih) + 3, 44, 'V_IH', { anchor: 'start', size: fs(9), fill: PURPLE }); }
      el('circle', { cx: P.X(vm), cy: P.Y(vm), r: 4.5, fill: RED }, svg); txt(svg, P.X(vm) + 6, P.Y(vm) - 6, 'V_M', { anchor: 'start', size: fs(9), fill: RED });
      legend(svg, c, fs, W, 'blue: output · dashed amber: current through both transistors (spikes only while switching) · purple: slope = −1', 'blue: output · amber: current');
      out.innerHTML = 'Switching point V<sub>M</sub> = <strong>' + fmt(vm, 3) + ' V</strong> (' + fmt(vm / Vdd * 100, 0) + '% of V<sub>DD</sub>); peak gain ' + fmt(gmax, 1) + '. Noise margins: low <strong>' + (vil ? fmt(nml * 1000, 0) + ' mV' : '—') + '</strong>, high <strong>' + (vil ? fmt(nmh * 1000, 0) + ' mV' : '—') + '</strong>.' + (gmax < 1 ? ' <strong style="color:#dc2626">Gain below 1: the inverter can no longer restore logic levels.</strong>' : '') + NOTE + 'With the input low, the pMOS is on and the nMOS off: the output is pulled firmly to V<sub>DD</sub>, and no current flows. With the input high, the reverse. Current flows only briefly while switching. The steep middle section (gain above 1) means small errors in the input are squashed at the output: a chain of inverters restores degraded signals. Balancing the pMOS and nMOS strengths centres V<sub>M</sub> and equalises the noise margins. CMOS keeps working down to supply voltages of a few hundred millivolts, though ever more slowly.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: CMOS NAND and NOR gates
     ----------------------------------------------------------------------- */
  FIG['fig-el-cmosgate'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 0, A = 0, B = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Gate', ['Inverter', 'NAND', 'NOR'], 0, function (i) { kind = i; draw(); });
    var row = group(controls, 'Inputs');
    var bA = btn('', row), bB = btn('', row);
    bA.addEventListener('click', function () { A = 1 - A; draw(); }); bB.addEventListener('click', function () { B = 1 - B; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function mos(svg, c, fs, x, y, p, gate, on, lab) {
      var col = on ? GREEN : c.muted;
      el('line', { x1: x, y1: y - 22, x2: x, y2: y + 22, stroke: col, 'stroke-width': on ? 4 : 2 }, svg);
      el('line', { x1: x - 10, y1: y - 16, x2: x - 10, y2: y + 16, stroke: c.ink2, 'stroke-width': 2 }, svg);
      if (p) el('circle', { cx: x - 15, cy: y, r: 4, fill: c.surface, stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      el('line', { x1: x - (p ? 19 : 10), y1: y, x2: x - 34, y2: y, stroke: gate ? EC : c.muted, 'stroke-width': gate ? 2.5 : 1.5 }, svg);
      txt(svg, x - 38, y + 4, lab + '=' + (gate ? 1 : 0), { anchor: 'end', size: fs(10), fill: c.ink2 });
      txt(svg, x + 8, y + 4, (p ? 'pMOS ' : 'nMOS ') + (on ? 'on' : 'off'), { anchor: 'start', size: fs(9), fill: on ? GREEN : c.muted });
    }
    function wire(svg, pts, on) { el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(''), fill: 'none', stroke: on ? GREEN : FIG.getCSSVar('--ink-muted', '#888'), 'stroke-width': on ? 3 : 1.5 }, svg); }
    function draw() {
      bA.textContent = 'A = ' + A; bB.textContent = 'B = ' + B; bB.style.display = kind ? '' : 'none';
      var c = C(), S = newSVG(svgWrap, container, 330, 'CMOS gate schematic with conducting transistors highlighted'), W = S.W, svg = S.svg, fs = S.fs, cx = Math.max(115, W * 0.38), top = 30, bot = 300, mid = 165;
      var pu, pd, outv;
      el('line', { x1: cx - 90, y1: top, x2: cx + 90, y2: top, stroke: RED, 'stroke-width': 3 }, svg); txt(svg, cx + 96, top + 4, 'V_DD', { anchor: 'start', size: fs(10), fill: RED, weight: 700 });
      el('line', { x1: cx - 90, y1: bot, x2: cx + 90, y2: bot, stroke: c.ink2, 'stroke-width': 3 }, svg); txt(svg, cx + 96, bot + 4, 'ground', { anchor: 'start', size: fs(10), fill: c.ink2, weight: 700 });
      if (kind === 0) {
        pu = !A; pd = !!A;
        wire(svg, [[cx, top], [cx, 75]], pu); mos(svg, c, fs, cx, 97, true, A, !A, 'A'); wire(svg, [[cx, 119], [cx, mid]], pu);
        wire(svg, [[cx, mid], [cx, 211]], pd); mos(svg, c, fs, cx, 233, false, A, !!A, 'A'); wire(svg, [[cx, 255], [cx, bot]], pd);
      } else if (kind === 1) {
        var p1 = !A, p2 = !B, n1 = !!A, n2 = !!B; pu = p1 || p2; pd = n1 && n2;
        wire(svg, [[cx - 50, top], [cx - 50, 68]], p1); wire(svg, [[cx + 50, top], [cx + 50, 68]], p2);
        mos(svg, c, fs, cx - 50, 90, true, A, p1, 'A'); mos(svg, c, fs, cx + 50, 90, true, B, p2, 'B');
        wire(svg, [[cx - 50, 112], [cx - 50, 130], [cx, 130]], p1); wire(svg, [[cx + 50, 112], [cx + 50, 130], [cx, 130]], p2); wire(svg, [[cx, 130], [cx, mid]], pu);
        wire(svg, [[cx, mid], [cx, 180]], pd); mos(svg, c, fs, cx, 202, false, A, n1, 'A'); wire(svg, [[cx, 224], [cx, 236]], n1 && n2); mos(svg, c, fs, cx, 258, false, B, n2, 'B'); wire(svg, [[cx, 280], [cx, bot]], pd);
      } else {
        var q1 = !A, q2 = !B, m1 = !!A, m2 = !!B; pu = q1 && q2; pd = m1 || m2;
        wire(svg, [[cx, top], [cx, 46]], pu); mos(svg, c, fs, cx, 68, true, A, q1, 'A'); wire(svg, [[cx, 90], [cx, 100]], pu); mos(svg, c, fs, cx, 122, true, B, q2, 'B'); wire(svg, [[cx, 144], [cx, mid]], pu);
        wire(svg, [[cx, mid], [cx, 190], [cx - 50, 190], [cx - 50, 210]], m1); wire(svg, [[cx, 190], [cx + 50, 190], [cx + 50, 210]], m2);
        mos(svg, c, fs, cx - 50, 232, false, A, m1, 'A'); mos(svg, c, fs, cx + 50, 232, false, B, m2, 'B');
        wire(svg, [[cx - 50, 254], [cx - 50, bot]], m1); wire(svg, [[cx + 50, 254], [cx + 50, bot]], m2);
      }
      outv = pu ? 1 : 0;
      el('line', { x1: cx, y1: mid, x2: cx + 80, y2: mid, stroke: outv ? RED : c.ink2, 'stroke-width': 3 }, svg); el('circle', { cx: cx, cy: mid, r: 4, fill: c.ink }, svg);
      txt(svg, cx + 86, mid + 5, 'output = ' + outv, { anchor: 'start', size: fs(12), fill: c.ink, weight: 700 });
      legend(svg, c, fs, W, 'top: pull-up network (pMOS) · bottom: pull-down network (nMOS) · green: conducting', 'top: pMOS · bottom: nMOS · green: on');
      var name = ['NOT A', 'NAND: NOT (A AND B)', 'NOR: NOT (A OR B)'][kind];
      out.innerHTML = '<strong>' + name + '</strong> = <strong>' + outv + '</strong>. ' + (pu ? 'The pull-up network connects the output to V<sub>DD</sub>; the pull-down network is open.' : 'The pull-down network connects the output to ground; the pull-up network is open.') + NOTE + 'Every static CMOS gate has a pMOS pull-up network and an nMOS pull-down network that are logical duals: where nMOS transistors are in series, the pMOS are in parallel, and vice versa. For any input exactly one network conducts, so there is never a direct path from supply to ground except briefly while switching. NAND needs 4 transistors and inverts naturally; AND needs an extra inverter (6 transistors). Designers prefer NAND to NOR because series pMOS transistors, already weaker, are slow.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: energy and delay against supply voltage
     ----------------------------------------------------------------------- */
  FIG['fig-el-mep'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Vdd = 0.8, Vt = 0.35, depth = 20;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'me-v', label: 'Supply voltage V_DD (V)', min: 0.15, max: 1.2, step: 0.01, value: Vdd, onChange: function (x) { Vdd = x; draw(); } });
    FIG.slider(controls, { id: 'me-t', label: 'Threshold voltage (V)', min: 0.2, max: 0.5, step: 0.01, value: Vt, onChange: function (x) { Vt = x; draw(); } });
    FIG.slider(controls, { id: 'me-d', label: 'Gates in the critical path', min: 5, max: 60, step: 1, value: depth, onChange: function (x) { depth = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var n = 1.4, alpha = 0.1;
    function ion(v) { return ekv(v - Vt, v, n); }
    function ioff(v) { return ekv(-Vt, v, n); }
    function delay(v) { return v / ion(v); }
    function Edyn(v) { return alpha * v * v; }
    function Eleak(v) { return ioff(v) * v * delay(v) * depth * 4; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Energy per operation against supply voltage'), W = A.W, svg = A.svg, fs = A.fs;
      var e1 = Edyn(1) + Eleak(1), P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0.15, xh: 1.2, yl: 0, yh: 1.5, xticks: [0.2, 0.4, 0.6, 0.8, 1, 1.2], yticks: [0, 0.5, 1, 1.5], xfmt: function (v) { return fmt(v, 1); }, yfmt: function (v) { return fmt(v, 1); }, xlab: 'supply voltage (V)', ylab: 'energy per operation (× value at 1 V)' });
      plotLine(svg, P, function (v) { return Edyn(v) / e1; }, 0.15, 1.2, 200, BLUE, 1.8, '5 3');
      plotLine(svg, P, function (v) { return Eleak(v) / e1; }, 0.15, 1.2, 200, RED, 1.8, '5 3');
      plotLine(svg, P, function (v) { return (Edyn(v) + Eleak(v)) / e1; }, 0.15, 1.2, 200, EC, 2.8);
      var best = 9, vb = 0; for (var k = 0; k <= 400; k++) { var v = 0.15 + 1.05 * k / 400, e = Edyn(v) + Eleak(v); if (e < best) { best = e; vb = v; } }
      el('circle', { cx: P.X(vb), cy: P.Y(best / e1), r: 5, fill: GREEN }, svg); txt(svg, P.X(vb) + 8, P.Y(best / e1) - 10, 'minimum energy', { anchor: 'start', size: fs(9), fill: GREEN });
      el('line', { x1: P.X(Vdd), y1: 30, x2: P.X(Vdd), y2: 244, stroke: AMBER, 'stroke-dasharray': '3 3' }, svg);
      
      legend(svg, c, fs, W, 'dashed blue: switching energy αCV² · dashed red: leakage energy · solid: total', 'blue: switching · red: leakage');
      var d = delay(Vdd) / delay(1), et = (Edyn(Vdd) + Eleak(Vdd)) / e1;
      out.innerHTML = 'At ' + fmt(Vdd, 2) + ' V: energy per operation <strong>' + fmt(et, 2) + '×</strong> and gate delay <strong>' + (d < 100 ? fmt(d, 1) : sciHTML(d, 1)) + '×</strong> their values at 1 V. Minimum energy at about <strong>' + fmt(vb, 2) + ' V</strong>, where operations take ' + sciHTML(delay(vb) / delay(1), 1) + '× longer.' + NOTE + 'Lowering the supply voltage cuts switching energy as V², but transistors deliver less current, so each operation takes longer, and leakage keeps flowing for that whole time. Below threshold the delay grows exponentially and leakage energy wins. The total is lowest near or just below the threshold voltage, which is why sensor nodes and some medical implants run their logic at 0.3–0.5 V and low speed, while fast processors run near 1 V. [Model: smooth long-channel transistor equations; values are illustrative.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'In a CMOS inverter with its input at logic 1, which transistor is on?', options: ['The pMOS', 'The nMOS', 'Both', 'Neither'], answer: 1, explanation: 'The output is pulled to ground.' },
      { question: 'Why does an idle CMOS gate draw almost no current?', options: ['It is switched off', 'In either state one of the two networks is off, so there is no path from supply to ground', 'It uses superconductors', 'It runs at low frequency'], answer: 1, explanation: 'Only leakage flows.' },
      { question: 'A 2-input CMOS NAND gate uses…', options: ['2 transistors', '4 transistors', '6 transistors', '8 transistors'], answer: 1, explanation: '2 pMOS in parallel, 2 nMOS in series.' },
      { question: 'In a NOR gate, the pMOS transistors are…', options: ['In parallel', 'In series', 'Absent', 'Connected to ground'], answer: 1, explanation: 'Duals of the parallel nMOS.' },
      { question: 'Noise margins measure…', options: ['The speed of a gate', 'How much noise a logic level can tolerate before being misread', 'Power consumption', 'Transistor count'], answer: 1, explanation: 'NM_L = V_IL − V_OL, NM_H = V_OH − V_IH.' },
      { question: 'Why does a chain of CMOS inverters restore degraded signals?', options: ['Because each stage has gain greater than 1 around the switching point', 'Because of capacitors', 'Because of the clock', 'It does not'], answer: 0, explanation: 'Gain squashes errors.' },
      { question: 'Dynamic power P = αCV²f. Halving V_DD (all else equal) changes P by a factor of…', options: ['1/2', '1/4', '2', '4'], answer: 1, explanation: 'V² dependence.' },
      { question: 'An SRAM cell stores a bit in…', options: ['A capacitor', 'Two cross-coupled inverters', 'A magnetic ring', 'A floating gate'], answer: 1, explanation: 'Six transistors including two access transistors.' },
      { question: 'Flash memory keeps data without power by…', options: ['Constant refresh', 'Trapping charge on an isolated floating gate', 'Using a battery', 'Magnetism'], answer: 1, explanation: 'Kahng and Sze, 1967; Masuoka, 1984.' },
      { question: 'Lowering the supply voltage far below threshold…', options: ['Always saves energy', 'Makes gates exponentially slower, so leakage energy eventually dominates', 'Speeds up gates', 'Stops leakage'], answer: 1, explanation: 'There is a minimum-energy point.' }
    ]);
  };
})();
