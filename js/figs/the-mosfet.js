/* ==========================================================================
   RNLearn — The MOSFET (From Switch to Supercomputer, Part 8)
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
    { name: 'An idea ahead of its time', color: '#b45309' },
    { name: 'Taming the surface', color: '#1d4ed8' },
    { name: 'MOS takes over', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1925', icon: '📜', era: 0, sec: 3, title: 'Lilienfeld’s patent', text: 'Julius Edgar Lilienfeld files patents for controlling current in a thin layer with an electric field: the field-effect transistor, decades too early to build.' },
    { year: '1934', icon: '📄', era: 0, sec: 3, title: 'Heil’s patent', text: 'Oskar Heil patents an insulated-gate field-effect device in Britain (granted 1935).' },
    { year: '1948', icon: '🧱', era: 0, sec: 3, title: 'Surface states block the way', text: 'Bardeen explains why field-effect experiments failed: electrons trapped at the semiconductor surface screen the field.' },
    { year: '1957', icon: '🛡️', era: 1, sec: 3, title: 'Oxide masking', text: 'Carl Frosch and Lincoln Derick at Bell Labs show that a grown silicon dioxide layer protects silicon and masks it during doping.' },
    { year: '1959', icon: '🎯', era: 1, sec: 3, title: 'The first MOSFET', text: 'Mohamed Atalla and Dawon Kahng at Bell Labs build a working metal–oxide–semiconductor field-effect transistor (presented in 1960).' },
    { year: '1963', icon: '☯️', era: 2, sec: 8, title: 'CMOS', text: 'Frank Wanlass and Chih-Tang Sah at Fairchild show that pairing n-channel and p-channel MOSFETs gives logic that draws almost no power at rest.' },
    { year: '1964', icon: '📐', era: 2, sec: 6, title: 'The square law', text: 'Sah publishes the classic model of MOSFET current against gate and drain voltage.' },
    { year: '1971', icon: '🧠', era: 2, sec: 8, title: 'MOS microprocessor', text: 'Intel’s 4004, the first commercial single-chip microprocessor, is built from about 2,300 MOS transistors.' }
  ];

  FIG['fig-el8-timeline'] = function (figEl) {
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

  var EL_PART = 8;
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

  var VT = 0.02585, Q = 1.602e-19, ESI = 1.036e-12, EOX = 3.45e-13, NI = 1e10;

  /* -----------------------------------------------------------------------
     Figure: the MOS capacitor
     ----------------------------------------------------------------------- */
  FIG['fig-el-moscap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Vg = 1, la = 17, tox = 5;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mc-v', label: 'Gate voltage (V)', min: -2, max: 2, step: 0.02, value: Vg, onChange: function (x) { Vg = x; draw(); } });
    FIG.slider(controls, { id: 'mc-a', label: 'Substrate doping N_A (log₁₀ cm⁻³)', min: 15, max: 18, step: 0.1, value: la, onChange: function (x) { la = x; draw(); } });
    FIG.slider(controls, { id: 'mc-t', label: 'Oxide thickness (nm)', min: 1, max: 20, step: 0.5, value: tox, onChange: function (x) { tox = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Band bending and charge in a MOS capacitor'), W = A.W, svg = A.svg, fs = A.fs;
      var Na = Math.pow(10, la), Cox = EOX / (tox * 1e-7), phiF = VT * Math.log(Na / NI), Vfb = -0.56 - phiF;
      function Qs(p) { var a = Math.exp(-p / VT) + p / VT - 1, b = (NI * NI / (Na * Na)) * (Math.exp(p / VT) - p / VT - 1), F = Math.sqrt(Math.max(0, a + b)); return (p >= 0 ? -1 : 1) * Math.sqrt(2 * ESI * Q * Na * VT) * F; }
      var lo = -0.6, hi = 2 * phiF + 0.5;
      for (var k = 0; k < 80; k++) { var m = (lo + hi) / 2; if (m - Qs(m) / Cox > Vg - Vfb) hi = m; else lo = m; }
      var ps = (lo + hi) / 2, Qd = ps > 0 ? -Math.sqrt(2 * ESI * Q * Na * Math.min(ps, 2 * phiF + 6 * VT)) : 0, Qn = ps > 0 ? Math.min(0, Qs(ps) - Qd) : 0;
      var Vth = Vfb + 2 * phiF + Math.sqrt(2 * ESI * Q * Na * 2 * phiF) / Cox;
      var region = ps < -0.005 ? 'accumulation' : ps < phiF ? 'depletion' : ps < 2 * phiF ? 'weak inversion' : 'strong inversion';
      var gx = 20, ox0 = 70, ox1 = ox0 + Math.max(10, tox * 3), sx = ox1, sw = W - sx - 50, Wd = ps > 0 ? Math.sqrt(2 * ESI * Math.min(ps, 2 * phiF) / (Q * Na)) : 0, depth = 0.4e-4;
      var X = function (x) { return sx + x / depth * sw; }, Etop = 50, Ebot = 230, Ey = function (e) { return Etop + (1.3 - e) / 2.6 * (Ebot - Etop); };
      el('rect', { x: gx, y: 40, width: ox0 - gx, height: 200, fill: c.muted + '44' }, svg); txt(svg, (gx + ox0) / 2, 256, 'gate', { size: fs(9), fill: c.ink2 });
      el('rect', { x: ox0, y: 40, width: ox1 - ox0, height: 200, fill: AMBER + '33' }, svg); txt(svg, (ox0 + ox1) / 2, 270, 'oxide', { size: fs(9), fill: AMBER });
      txt(svg, sx + sw / 2, 256, 'p-type silicon (depth →)', { size: fs(9), fill: c.ink2 });
      function psi(x) { if (ps >= 0) { return x < Wd ? ps * Math.pow(1 - x / Wd, 2) : 0; } var Ld = Math.sqrt(ESI * VT / (Q * Na)); return ps * Math.exp(-x / Ld); }
      var ec = '', ev = '', ei = '';
      for (k = 0; k <= 160; k++) { var x = depth * k / 160, s = psi(x), base = 0.56 + phiF; ec += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Ey(base - s).toFixed(1); ev += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Ey(base - 1.12 - s).toFixed(1); ei += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Ey(base - 0.56 - s).toFixed(1); }
      el('path', { d: ec, fill: 'none', stroke: EC, 'stroke-width': 2.4 }, svg); el('path', { d: ev, fill: 'none', stroke: AMBER, 'stroke-width': 2.4 }, svg); el('path', { d: ei, fill: 'none', stroke: c.muted, 'stroke-dasharray': '2 3' }, svg);
      el('line', { x1: X(0), y1: Ey(0), x2: X(depth), y2: Ey(0), stroke: RED, 'stroke-dasharray': '6 3', 'stroke-width': 1.6 }, svg);
      txt(svg, X(depth) + 4, Ey(0.56 + phiF) + 4, 'E꜀', { anchor: 'start', size: fs(10), fill: EC }); txt(svg, X(depth) + 4, Ey(phiF - 0.56) + 4, 'Eᵥ', { anchor: 'start', size: fs(10), fill: AMBER }); txt(svg, X(depth) + 4, Ey(0) + 4, 'E_F', { anchor: 'start', size: fs(10), fill: RED });
      var gy = Ey(-Vg); el('line', { x1: gx, y1: Math.max(42, Math.min(238, gy)), x2: ox0, y2: Math.max(42, Math.min(238, gy)), stroke: RED, 'stroke-width': 2 }, svg);
      if (Wd > 0) el('rect', { x: X(0), y: 40, width: X(Wd) - X(0), height: 10, fill: BLUE + '55' }, svg);
      var r2 = rngSeed(5), nn = region === 'strong inversion' ? 14 : region === 'weak inversion' ? 3 : 0, np = region === 'accumulation' ? Math.min(14, Math.round(-ps * 60)) : 0;
      for (k = 0; k < nn; k++) el('circle', { cx: X(0) + 3 + r2() * 6, cy: 60 + r2() * 160, r: 2.6, fill: BLUE }, svg);
      for (k = 0; k < np; k++) el('circle', { cx: X(0) + 3 + r2() * 6, cy: 60 + r2() * 160, r: 2.6, fill: 'none', stroke: RED, 'stroke-width': 1.4 }, svg);
      txt(svg, 10, 14, region + (Wd > 0 ? ' · blue bar: depletion layer ' + fmt(Wd * 1e7, 0) + ' nm' : ''), { anchor: 'start', size: fs(10), fill: c.ink2, weight: 700 });
      out.innerHTML = 'Region: <strong>' + region + '</strong>. Surface potential ψ<sub>s</sub> = ' + fmt(ps, 3) + ' V (strong inversion needs 2φ<sub>F</sub> = ' + fmt(2 * phiF, 2) + ' V). Electrons at the surface: <strong>' + (Qn < 0 ? sciHTML(-Qn / Q, 1) : '≈ 0') + ' cm<sup>−2</sup></strong>. Threshold voltage for these settings: <strong>' + fmt(Vth, 2) + ' V</strong>.' + NOTE + 'A negative gate attracts holes to the surface (accumulation). A small positive gate pushes them away, leaving negative acceptor ions (depletion). Beyond the threshold, the bands bend so far that the surface turns n-type: a thin sheet of electrons forms, the <em>inversion layer</em>, which becomes the transistor’s channel. A thinner oxide gives the gate more control (C<sub>ox</sub> = ε<sub>ox</sub>/t<sub>ox</sub>).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: MOSFET output characteristics and pinch-off
     ----------------------------------------------------------------------- */
  FIG['fig-el-mosiv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var vgs = 0.9, vds = 0.3, Vt = 0.35, k = 0.3, lam = 0.08;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mi-g', label: 'Gate–source voltage V_GS (V)', min: 0, max: 1.2, step: 0.01, value: vgs, onChange: function (x) { vgs = x; draw(); } });
    FIG.slider(controls, { id: 'mi-d', label: 'Drain–source voltage V_DS (V)', min: 0, max: 1.2, step: 0.01, value: vds, onChange: function (x) { vds = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Id(g, d) { var ov = g - Vt; if (ov <= 0) return 0; if (d < ov) return k * (ov * d - d * d / 2) * (1 + lam * d); return 0.5 * k * ov * ov * (1 + lam * d); }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 450 : 270, 'Drain current against drain voltage, and the channel'), W = A.W, svg = A.svg, fs = A.fs;
      var pr = narrow ? W - 14 : W * 0.58, P = plotAxes(svg, c, fs, { L: 54, R: pr, T: 30, B: 224, xl: 0, xh: 1.2, yl: 0, yh: 0.14, xticks: [0, 0.4, 0.8, 1.2], yticks: [0, 0.05, 0.1], xfmt: function (v) { return fmt(v, 1); }, yfmt: function (v) { return fmt(v * 1000, 0); }, xlab: 'V_DS (V)', ylab: 'drain current (µA)' });
      [0.5, 0.7, 0.9, 1.1].forEach(function (g) { plotLine(svg, P, function (d) { return Id(g, d); }, 0, 1.2, 120, c.border, 1.5); });
      plotLine(svg, P, function (d) { return 0.5 * k * d * d; }, 0, 0.85, 80, PURPLE, 1.2, '4 3');
      plotLine(svg, P, function (d) { return Id(vgs, d); }, 0, 1.2, 160, EC, 2.6);
      el('circle', { cx: P.X(vds), cy: P.Y(Id(vgs, vds)), r: 5, fill: RED }, svg);
      txt(svg, P.X(0.62), P.Y(0.5 * k * 0.62 * 0.62) - 6, 'pinch-off', { anchor: 'end', size: fs(9), fill: PURPLE });
      var cx0 = narrow ? 30 : pr + 30, cw = narrow ? W - 60 : W - cx0 - 16, cy0 = narrow ? 290 : 70, ov = vgs - Vt;
      el('rect', { x: cx0, y: cy0 + 50, width: cw, height: 70, fill: AMBER + '18', stroke: c.border }, svg);
      el('rect', { x: cx0 - 6, y: cy0 + 50, width: cw * 0.22, height: 30, fill: BLUE + '44', stroke: BLUE }, svg); el('rect', { x: cx0 + cw * 0.78 + 6, y: cy0 + 50, width: cw * 0.22, height: 30, fill: BLUE + '44', stroke: BLUE }, svg);
      txt(svg, cx0 + cw * 0.1, cy0 + 98, 'source n⁺', { size: fs(9), fill: BLUE }); txt(svg, cx0 + cw * 0.9, cy0 + 98, 'drain n⁺', { size: fs(9), fill: BLUE });
      el('rect', { x: cx0 + cw * 0.22, y: cy0 + 26, width: cw * 0.56, height: 16, fill: c.muted + '66' }, svg); el('rect', { x: cx0 + cw * 0.22, y: cy0 + 42, width: cw * 0.56, height: 6, fill: AMBER + '88' }, svg); txt(svg, cx0 + cw / 2, cy0 + 20, 'gate (' + fmt(vgs, 2) + ' V)', { size: fs(9), fill: c.ink2 });
      if (ov > 0) { var x0 = cx0 + cw * 0.22, x1 = cx0 + cw * 0.78, d = 'M' + x0 + ' ' + (cy0 + 50), n = 40, pinch = vds >= ov; for (var i = 0; i <= n; i++) { var f = i / n, vloc = Math.min(vds, ov) * (pinch ? Math.min(1, f / 0.92) : f), th = 12 * Math.sqrt(Math.max(0, 1 - vloc / ov)) * Math.min(1, ov / 0.5) + 0.5; d += 'L' + (x0 + (x1 - x0) * f).toFixed(1) + ' ' + (cy0 + 50 + th).toFixed(1); } d += 'L' + x1 + ' ' + (cy0 + 50) + 'Z'; el('path', { d: d, fill: BLUE, opacity: 0.7 }, svg); if (pinch) txt(svg, x1 - 4, cy0 + 76, 'pinched off', { anchor: 'end', size: fs(9), fill: RED }); }
      txt(svg, cx0 + cw / 2, cy0 + 140, ov <= 0 ? 'no channel: transistor off' : vds < ov ? 'linear region: channel acts like a resistor' : 'saturation: channel pinched off near the drain', { size: fs(9), fill: c.ink2 });
      legend(svg, c, fs, W, 'grey: V_GS = 0.5–1.1 V · blue: your V_GS · dashed: pinch-off boundary V_DS = V_GS − V_T', 'blue: your V_GS · dashed: pinch-off');
      var id = Id(vgs, vds);
      out.innerHTML = 'I<sub>D</sub> = <strong>' + fmt(id * 1000, 1) + ' µA</strong> at V<sub>GS</sub> = ' + fmt(vgs, 2) + ' V, V<sub>DS</sub> = ' + fmt(vds, 2) + ' V (V<sub>T</sub> = 0.35 V); region: <strong>' + (ov <= 0 ? 'off (below threshold)' : vds < ov ? 'linear (triode)' : 'saturation') + '</strong>.' + NOTE + 'Above threshold, the gate induces a channel of electrons between source and drain. For small V<sub>DS</sub> the current rises linearly: I<sub>D</sub> ≈ μC<sub>ox</sub>(W/L)(V<sub>GS</sub> − V<sub>T</sub>)V<sub>DS</sub>. As V<sub>DS</sub> grows, the channel thins near the drain, where the gate-to-channel voltage is smallest, until at V<sub>DS</sub> = V<sub>GS</sub> − V<sub>T</sub> it pinches off. Beyond that the current saturates at ½μC<sub>ox</sub>(W/L)(V<sub>GS</sub> − V<sub>T</sub>)², the “square law”.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: subthreshold leakage
     ----------------------------------------------------------------------- */
  FIG['fig-el-subth'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Vt = 0.35, S = 80, Vdd = 0.8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'st-t', label: 'Threshold voltage V_T (V)', min: 0.1, max: 0.6, step: 0.01, value: Vt, onChange: function (x) { Vt = x; draw(); } });
    FIG.slider(controls, { id: 'st-s', label: 'Subthreshold swing S (mV/decade)', min: 60, max: 120, step: 1, value: S, onChange: function (x) { S = x; draw(); } });
    FIG.slider(controls, { id: 'st-v', label: 'Supply voltage V_DD (V)', min: 0.4, max: 1.2, step: 0.05, value: Vdd, onChange: function (x) { Vdd = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function I(v) { var n = S / 59.6, u = (v - Vt) / (2 * n * VT), l = u > 30 ? u : Math.log(1 + Math.exp(u)); return 1e-5 / n * l * l; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Drain current on a logarithmic scale against gate voltage'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0, xh: 1.2, yl: 1e-13, yh: 1e-2, logy: true, xticks: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2], yticks: [1e-13, 1e-11, 1e-9, 1e-7, 1e-5, 1e-3], xfmt: function (v) { return fmt(v, 1); }, xlab: 'gate voltage V_GS (V)', ylab: 'current per µm of width (A)' });
      plotLine(svg, P, I, 0, 1.2, 300, EC, 2.6);
      el('line', { x1: P.X(Vt), y1: 30, x2: P.X(Vt), y2: 244, stroke: PURPLE, 'stroke-dasharray': '3 3' }, svg); txt(svg, P.X(Vt) + 4, 236, 'V_T', { anchor: 'start', size: fs(10), fill: PURPLE });
      el('line', { x1: P.X(Vdd), y1: 30, x2: P.X(Vdd), y2: 244, stroke: AMBER, 'stroke-dasharray': '3 3' }, svg); txt(svg, P.X(Vdd) + 4, 236, 'V_DD', { anchor: 'start', size: fs(10), fill: AMBER });
      var ion = I(Vdd), ioff = I(0);
      el('circle', { cx: P.X(0), cy: P.Y(ioff), r: 5, fill: RED }, svg); el('circle', { cx: P.X(Vdd), cy: P.Y(ion), r: 5, fill: GREEN }, svg);
      txt(svg, P.X(0.02), P.Y(ioff) - 8, 'off current', { anchor: 'start', size: fs(9), fill: RED });
      legend(svg, c, fs, W, 'below threshold the current falls by 10× for every S millivolts: it never reaches zero', 'current falls 10× per S mV');
      var leakW = ioff * 0.1 * 1e10 * Vdd;
      out.innerHTML = 'On current ' + sciHTML(ion, 2) + ' A/µm; off current <strong>' + sciHTML(ioff, 2) + ' A/µm</strong>; on/off ratio <strong>' + sciHTML(ion / ioff, 1) + '</strong>. A chip with 10<sup>10</sup> transistors, each 0.1 µm wide, would leak about <strong>' + (leakW < 1 ? fmt(leakW * 1000, 0) + ' mW' : fmt(leakW, 1) + ' W') + '</strong> while doing nothing.' + NOTE + 'Below threshold, electrons still cross the source barrier by thermal excitation, so the current is exponential in gate voltage: I ∝ 10<sup>V<sub>GS</sub>/S</sup>. Boltzmann statistics set S ≥ (kT/q) ln 10 ≈ 60 mV per decade at room temperature, however good the transistor. Lowering V<sub>T</sub> lets a lower supply voltage give enough on-current, but every 60–100 mV of V<sub>T</sub> removed multiplies leakage by ten. This is the trap that stopped supply voltages falling (Part 10).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Who patented the field-effect transistor idea in the 1920s?', options: ['Shockley', 'Julius Lilienfeld', 'Edison', 'Kilby'], answer: 1, explanation: 'Too early to build.' },
      { question: 'What finally made working MOSFETs possible around 1959?', options: ['Germanium', 'A clean, thermally grown silicon dioxide layer that tamed surface states', 'Vacuum tubes', 'Lasers'], answer: 1, explanation: 'Atalla and Kahng.' },
      { question: 'In an n-channel MOSFET on p-type silicon, the channel is formed by…', options: ['Holes accumulating at the surface', 'An inversion layer of electrons at the surface', 'The oxide', 'The gate metal'], answer: 1, explanation: 'Above threshold the surface inverts.' },
      { question: 'Strong inversion begins when the surface potential reaches about…', options: ['φ_F', '2φ_F', 'kT/q', 'The band gap'], answer: 1, explanation: 'Electron density at the surface then equals the bulk hole density.' },
      { question: 'Reducing the oxide thickness…', options: ['Weakens the gate’s control', 'Increases C_ox and strengthens the gate’s control', 'Has no effect', 'Increases V_T always'], answer: 1, explanation: 'C_ox = ε_ox/t_ox.' },
      { question: 'In saturation, the ideal long-channel MOSFET current depends on overdrive as…', options: ['Linearly', '(V_GS − V_T)²', 'Exponentially', 'Not at all'], answer: 1, explanation: 'The square law.' },
      { question: 'A MOSFET with V_GS = 1 V and V_T = 0.4 V is in saturation when V_DS exceeds…', options: ['0.4 V', '0.6 V', '1 V', '1.4 V'], answer: 1, explanation: 'V_DS ≥ V_GS − V_T.' },
      { question: 'The minimum subthreshold swing at room temperature is about…', options: ['6 mV/decade', '60 mV/decade', '600 mV/decade', '1 V/decade'], answer: 1, explanation: '(kT/q) ln 10.' },
      { question: 'If the subthreshold swing is 100 mV/decade, lowering V_T by 0.2 V raises the off current by…', options: ['2×', '20×', '100×', '1000×'], answer: 2, explanation: '10^(200/100).' },
      { question: 'Why do pMOS transistors need to be wider than nMOS for the same current?', options: ['Holes have lower mobility than electrons', 'pMOS uses germanium', 'pMOS has no gate', 'They do not'], answer: 0, explanation: 'Roughly 2–3× lower in silicon.' }
    ]);
  };
})();
