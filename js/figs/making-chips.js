/* ==========================================================================
   RNLearn — Making Chips (From Switch to Supercomputer, Part 10)
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
    { name: 'Perfect crystals', color: '#b45309' },
    { name: 'The integrated circuit', color: '#1d4ed8' },
    { name: 'Scaling', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1916', icon: '🧪', era: 0, sec: 3, title: 'Czochralski’s method', text: 'Jan Czochralski discovers how to pull a single crystal from a melt (published 1918); the method now grows almost all silicon wafers.' },
    { year: '1950', icon: '💎', era: 0, sec: 3, title: 'Single-crystal semiconductors', text: 'Gordon Teal and John Little at Bell Labs grow large single crystals of germanium, greatly improving transistors.' },
    { year: '1958', icon: '🔧', era: 1, sec: 4, title: 'The first integrated circuit', text: 'Jack Kilby at Texas Instruments builds an oscillator with all components on one piece of germanium, connected by gold wires.' },
    { year: '1959', icon: '🗺️', era: 1, sec: 4, title: 'Planar process and monolithic IC', text: 'At Fairchild, Jean Hoerni devises the planar process and Robert Noyce patents an integrated circuit with metal wiring on top of the oxide.' },
    { year: '1965', icon: '📈', era: 2, sec: 7, title: 'Moore’s law', text: 'Gordon Moore predicts that the number of components per chip will keep doubling every year; in 1975 he revises it to every two years.' },
    { year: '1974', icon: '📏', era: 2, sec: 8, title: 'Dennard scaling', text: 'Robert Dennard and colleagues show how to shrink MOSFETs so that they become faster and use less power at constant power density.' },
    { year: '2006', icon: '💧', era: 2, sec: 5, title: 'Immersion lithography', text: 'Chips begin to be patterned with 193 nm light through a layer of water, pushing numerical apertures above 1.' },
    { year: '2019', icon: '🔆', era: 2, sec: 5, title: 'EUV in production', text: 'Extreme-ultraviolet lithography at 13.5 nm enters high-volume chip manufacturing.' }
  ];

  FIG['fig-el10-timeline'] = function (figEl) {
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

  var EL_PART = 10;
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
     Figure: lithography resolution and the aerial image
     ----------------------------------------------------------------------- */
  FIG['fig-el-litho'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SRC = [['i-line 365 nm', 365, 0.65], ['KrF 248 nm', 248, 0.85], ['ArF 193 nm dry', 193, 0.93], ['ArF 193 nm immersion', 193, 1.35], ['EUV 13.5 nm', 13.5, 0.55]];
    var si = 3, NA = 1.35, pitch = 100, sig = 0.8;
    var controls = div('fig-controls', container);
    choice(controls, 'Light source', SRC.map(function (s) { return s[0]; }), si, function (i) { si = i; NA = Math.min(NA, SRC[i][2]); naS.max = SRC[i][2]; draw(); });
    var naS = FIG.slider(controls, { id: 'li-na', label: 'Numerical aperture NA', min: 0.2, max: 1.35, step: 0.01, value: NA, onChange: function (x) { NA = Math.min(x, SRC[si][2]); draw(); } });
    FIG.slider(controls, { id: 'li-p', label: 'Line pitch on the wafer (nm)', min: 20, max: 800, step: 2, value: pitch, onChange: function (x) { pitch = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function image(x, lam) {
      var I = 0, ns = 15;
      for (var s = 0; s < ns; s++) { var sx = -sig + 2 * sig * s / (ns - 1), re = 0, im = 0; for (var m = -12; m <= 12; m++) { var f = m * lam / pitch + sx * NA; if (Math.abs(f) > NA) continue; var cm = m === 0 ? 0.5 : Math.sin(Math.PI * m / 2) / (Math.PI * m); re += cm * Math.cos(2 * Math.PI * m * x / pitch); im += cm * Math.sin(2 * Math.PI * m * x / pitch); } I += re * re + im * im; }
      return I / ns;
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Light intensity on the wafer under a pattern of lines'), W = A.W, svg = A.svg, fs = A.fs, lam = SRC[si][1];
      NA = Math.min(NA, SRC[si][2]);
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 214, xl: -1.5, xh: 1.5, yl: 0, yh: 1.4, xticks: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], yticks: [0, 0.5, 1], xfmt: function (v) { return fmt(v * pitch, 0); }, xlab: 'position on wafer (nm)', ylab: 'light intensity' });
      for (var k = -2; k <= 1; k++) { var x0 = (k + 0.25) * 1, x1 = x0 + 0.5; if (x1 < -1.5 || x0 > 1.5) continue; el('rect', { x: P.X(Math.max(-1.5, x0)), y: 262, width: P.X(Math.min(1.5, x1)) - P.X(Math.max(-1.5, x0)), height: 12, fill: c.ink2 }, svg); }
      txt(svg, 54, 290, 'mask: dark lines and clear spaces of equal width', { anchor: 'start', size: fs(9), fill: c.muted });
      var mx = 0, mn = 9, d = ''; for (k = 0; k <= 300; k++) { var x = -1.5 + 3 * k / 300, I = image(x * pitch, lam); mx = Math.max(mx, I); mn = Math.min(mn, I); d += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(I).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2.6, 'clip-path': P.clip }, svg);
      el('line', { x1: P.X(-1.5), y1: P.Y(0.3), x2: P.X(1.5), y2: P.Y(0.3), stroke: AMBER, 'stroke-dasharray': '4 3' }, svg); var rt = txt(svg, P.X(1.48), P.Y(0.3) - 4, 'resist threshold', { anchor: 'end', size: fs(9), fill: AMBER, weight: 700 }); rt.setAttribute('stroke', c.surface); rt.setAttribute('stroke-width', 4); rt.setAttribute('paint-order', 'stroke');
      var contrast = mx + mn > 0 ? (mx - mn) / (mx + mn) : 0, k1 = pitch / 2 * NA / lam, hpMin = 0.25 * lam / NA, ok = contrast > 0.25;
      legend(svg, c, fs, W, 'image of the mask formed by the projection lens (σ = 0.8 partially coherent illumination)', 'aerial image of the mask');
      out.innerHTML = 'Half-pitch ' + fmt(pitch / 2, 0) + ' nm, k₁ = (half-pitch × NA)/λ = <strong>' + fmt(k1, 2) + '</strong>; image contrast <strong>' + fmt(contrast * 100, 0) + '%</strong>' + (ok ? ' — the lines print.' : ' — <strong style="color:#dc2626">too little contrast: the pattern cannot be printed.</strong>') + ' Smallest half-pitch for this tool (k₁ = 0.25): <strong>' + fmt(hpMin, 1) + ' nm</strong>.' + NOTE + 'A lens can only collect diffracted light within its numerical aperture. A grating of pitch p diffracts light at angles sin θ = mλ/p; if even the first orders miss the lens, the image is a uniform grey. The Rayleigh-type limit, half-pitch = k₁λ/NA with k₁ ≥ 0.25 for single exposures, is why the industry moved to shorter wavelengths, higher NA (immersion in water raises NA above 1) and finally EUV light. Patterns finer than one exposure allows are made by multiple exposures.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: wafer yield
     ----------------------------------------------------------------------- */
  FIG['fig-el-yield'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = 0.2, area = 100, seed = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'yi-d', label: 'Killer defects per cm²', min: 0, max: 1.5, step: 0.05, value: D, onChange: function (x) { D = x; draw(); } });
    FIG.slider(controls, { id: 'yi-a', label: 'Chip (die) area (mm²)', min: 20, max: 800, step: 10, value: area, onChange: function (x) { area = x; draw(); } });
    var row = group(controls, 'Wafer');
    btn('New wafer', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 330, 'A 300 mm wafer with chips and random defects'), W = A.W, svg = A.svg, fs = A.fs;
      var Rpx = Math.min(140, W / 2 - 20), cx = Math.min(W / 2, Rpx + 20 + (W > 620 ? 40 : 0)), cy = 175, mm = Rpx / 150, side = Math.sqrt(area);
      el('circle', { cx: cx, cy: cy, r: Rpx, fill: '#94a3b8' + '44', stroke: c.muted, 'stroke-width': 1.5 }, svg);
      var rnd = rngSeed(seed * 97 + 3), nd = Math.round(D * Math.PI * 15 * 15), defects = [];
      for (var k = 0; k < nd; k++) { var r = 150 * Math.sqrt(rnd()), th = 2 * Math.PI * rnd(); defects.push([r * Math.cos(th), r * Math.sin(th)]); }
      var n = Math.ceil(150 / side), good = 0, total = 0;
      for (var i = -n; i < n; i++) for (var j = -n; j < n; j++) {
        var x0 = i * side, y0 = j * side, corners = [[x0, y0], [x0 + side, y0], [x0, y0 + side], [x0 + side, y0 + side]];
        if (!corners.every(function (p) { return p[0] * p[0] + p[1] * p[1] <= 147 * 147; })) continue;
        total++; var bad = defects.some(function (d) { return d[0] >= x0 && d[0] < x0 + side && d[1] >= y0 && d[1] < y0 + side; });
        if (!bad) good++;
        el('rect', { x: cx + x0 * mm + 0.5, y: cy + y0 * mm + 0.5, width: Math.max(1, side * mm - 1), height: Math.max(1, side * mm - 1), fill: bad ? RED + 'aa' : EC + '99' }, svg);
      }
      defects.forEach(function (d) { el('circle', { cx: cx + d[0] * mm, cy: cy + d[1] * mm, r: 1.6, fill: '#111827' }, svg); });
      var Y = Math.exp(-area / 100 * D);
      if (W > 620) { var tx = cx + Rpx + 30; [['chips on wafer', total], ['good chips', good], ['yield', fmt(total ? good / total * 100 : 0, 0) + '%'], ['Poisson model e^(−AD)', fmt(Y * 100, 0) + '%']].forEach(function (r2, q) { txt(svg, tx, 120 + q * 26, r2[0] + ': ', { anchor: 'start', size: fs(11), fill: c.ink2 }); txt(svg, W - 14, 120 + q * 26, String(r2[1]), { anchor: 'end', size: fs(12), fill: c.ink, weight: 700 }); }); }
      legend(svg, c, fs, W, 'blue: working chips · red: chips hit by a defect (black dots) · 300 mm wafer', 'blue: good · red: defective');
      out.innerHTML = '<strong>' + total + '</strong> whole chips fit on the wafer; <strong>' + good + '</strong> are free of defects (' + fmt(total ? good / total * 100 : 0, 0) + '%; the Poisson model predicts ' + fmt(Y * 100, 0) + '%).' + NOTE + 'Even in the cleanest factories a few random particles or flaws land on each wafer, and one in the wrong place ruins a chip. The chance that a chip of area A escapes all defects at density D is about e<sup>−AD</sup>. Large chips suffer twice: fewer fit on the wafer, and a larger fraction of them fail. That is a powerful economic reason to split large processors into smaller “chiplets” (Part 14) and to build in spare cores and memory rows that can replace defective ones.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Moore's law
     ----------------------------------------------------------------------- */
  FIG['fig-el-moore'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DATA = [['Intel 4004', 1971, 2300], ['Intel 8086', 1978, 29000], ['Intel 80386', 1985, 275000], ['Intel 80486', 1989, 1.2e6], ['Pentium', 1993, 3.1e6], ['Pentium 4', 2000, 4.2e7], ['Core 2 Duo', 2006, 2.91e8], ['Nvidia GK110', 2012, 7.1e9], ['Apple M1', 2020, 1.6e10], ['Nvidia H100', 2022, 8e10]];
    var dbl = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mo-d', label: 'Doubling time of your trend line (years)', min: 1, max: 4, step: 0.1, value: dbl, onChange: function (x) { dbl = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var sx = 0, sy = 0, sxx = 0, sxy = 0; DATA.forEach(function (d) { var x = d[1], y = Math.log2(d[2]); sx += x; sy += y; sxx += x * x; sxy += x * y; }); var nD = DATA.length, slope = (nD * sxy - sx * sy) / (nD * sxx - sx * sx), icpt = (sy - slope * sx) / nD;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Transistors per chip against year, on a logarithmic scale'), W = A.W, svg = A.svg, fs = A.fs, narrow = W < 560;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 254, xl: 1970, xh: 2025, yl: 1e3, yh: 1e12, logy: true, xticks: [1970, 1980, 1990, 2000, 2010, 2020], yticks: [1e3, 1e6, 1e9, 1e12], xlab: 'year', ylab: 'transistors per chip' });
      plotLine(svg, P, function (y) { return 2300 * Math.pow(2, (y - 1971) / dbl); }, 1970, 2025, 100, AMBER, 2, '6 3');
      plotLine(svg, P, function (y) { return Math.pow(2, icpt + slope * y); }, 1970, 2025, 100, c.border, 1.5);
      DATA.forEach(function (d, i) { var x = P.X(d[1]), y = P.Y(d[2]); var g = el('circle', { cx: x, cy: y, r: 5, fill: EC }, svg); var t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = d[0] + ' (' + d[1] + '): ' + d[2].toLocaleString('en-GB') + ' transistors'; g.appendChild(t); if (!narrow || i % 3 === 0 || i === DATA.length - 1) txt(svg, x + (i > 7 ? -8 : 8), y + (i === 9 ? -8 : i === 8 ? 16 : i % 2 ? 14 : -6), d[0], { anchor: i > 7 ? 'end' : 'start', size: fs(9), fill: c.ink2 }); });
      legend(svg, c, fs, W, 'dots: selected processors · grey: best-fit line · dashed: your trend from the 4004', 'dots: chips · dashed: your trend');
      var pred = 2300 * Math.pow(2, (2022 - 1971) / dbl);
      out.innerHTML = 'Best fit through these chips: doubling every <strong>' + fmt(1 / slope, 2) + ' years</strong>. Your ' + fmt(dbl, 1) + '-year trend from the 4004 predicts <strong>' + sciHTML(pred, 1) + '</strong> transistors in 2022 (the H100 has 8 × 10<sup>10</sup>).' + NOTE + 'In 1965 Gordon Moore noticed that the most economical number of components per chip was doubling every year and predicted that it would continue for a decade; in 1975 he revised the rate to every two years. The prediction became a self-fulfilling industry roadmap. Recent growth in the largest chips has also come from making them physically bigger and stacking several dies in one package. (Data: manufacturers’ published transistor counts.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el10'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Almost all silicon wafers are grown by…', options: ['Casting in moulds', 'The Czochralski method: pulling a single crystal from a melt', 'Sputtering', 'Mining natural crystals'], answer: 1, explanation: 'Discovered by Jan Czochralski in 1916.' },
      { question: 'What did the planar process contribute?', options: ['Faster transistors', 'A flat, oxide-protected surface on which wiring could be laid, making monolithic ICs practical', 'Germanium crystals', 'EUV light'], answer: 1, explanation: 'Hoerni, 1959.' },
      { question: 'The Rayleigh-type resolution of lithography is half-pitch = k₁λ/NA. Which change improves resolution?', options: ['Longer wavelength', 'Larger numerical aperture', 'Larger k₁', 'Thicker resist'], answer: 1, explanation: 'Also shorter λ and smaller k₁.' },
      { question: 'Immersion lithography places water between lens and wafer to…', options: ['Cool the wafer', 'Raise the numerical aperture above 1', 'Clean the wafer', 'Make the light green'], answer: 1, explanation: 'NA = n sin θ.' },
      { question: 'EUV lithography uses light of wavelength…', options: ['193 nm', '248 nm', '13.5 nm', '1 nm'], answer: 2, explanation: 'It needs mirrors and vacuum.' },
      { question: 'Doubling a chip’s area at a defect density where the small chip yields 80% gives a yield of about…', options: ['80%', '64%', '40%', '90%'], answer: 1, explanation: 'e^(−2AD) = 0.8².' },
      { question: 'Moore’s 1975 revision predicted transistor counts doubling every…', options: ['Six months', 'Year', 'Two years', 'Ten years'], answer: 2, explanation: 'Originally (1965) every year.' },
      { question: 'Under ideal Dennard scaling by factor κ, power density…', options: ['Rises by κ²', 'Stays constant', 'Falls by κ', 'Rises by κ'], answer: 1, explanation: 'Voltage, current and capacitance all scale down.' },
      { question: 'Why did Dennard scaling end around 2005?', options: ['Lithography stopped improving', 'Threshold and supply voltages could not keep falling without huge leakage', 'Silicon ran out', 'Clocks became too accurate'], answer: 1, explanation: 'The 60 mV/decade limit.' },
      { question: '“Dark silicon” refers to…', options: ['Black chip packaging', 'The fraction of a chip that cannot be powered at full speed at the same time within its power budget', 'Defective chips', 'Silicon in solar cells'], answer: 1, explanation: 'A consequence of the end of Dennard scaling.' }
    ]);
  };
})();
