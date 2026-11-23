/* ==========================================================================
   RNLearn — Band Theory (From Switch to Supercomputer, Part 5)
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
    { name: 'Puzzling crystals', color: '#b45309' },
    { name: 'Quantum theory of solids', color: '#1d4ed8' },
    { name: 'Engineering purity', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1874', icon: '💎', era: 0, sec: 1, title: 'A one-way conductor', text: 'Ferdinand Braun finds that contacts on metal sulphide crystals conduct better in one direction, the first semiconductor rectifier.' },
    { year: '1925', icon: '🚫', era: 1, sec: 3, title: 'Exclusion principle', text: 'Wolfgang Pauli proposes that no two electrons can occupy the same quantum state.' },
    { year: '1926', icon: '📊', era: 1, sec: 8, title: 'Fermi–Dirac statistics', text: 'Enrico Fermi and Paul Dirac independently work out how particles obeying Pauli’s principle fill energy levels.' },
    { year: '1928', icon: '🌊', era: 1, sec: 3, title: 'Bloch waves', text: 'Felix Bloch shows that electron waves can travel through a perfect periodic crystal without scattering (published 1929).' },
    { year: '1931', icon: '📐', era: 1, sec: 5, title: 'Band theory of semiconductors', text: 'Alan Wilson explains insulators, metals and semiconductors by whether their energy bands are full, empty or separated by a small gap.' },
    { year: '1940', icon: '⚡', era: 2, sec: 7, title: 'p and n silicon', text: 'Russell Ohl at Bell Labs finds a silicon rod that generates a voltage under light: impurities had made one end p-type and the other n-type.' },
    { year: '1952', icon: '🔥', era: 2, sec: 7, title: 'Zone refining', text: 'William Pfann describes zone refining, which purifies germanium and later silicon to better than one impurity atom in a billion.' }
  ];

  FIG['fig-el5-timeline'] = function (figEl) {
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

  var EL_PART = 5;
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

  var KB = 8.617e-5;
  var SEMI = {
    Si: { name: 'Silicon', Eg0: 1.17, a: 4.73e-4, b: 636, Nc: 3.2e19, Nv: 1.8e19, col: EC },
    Ge: { name: 'Germanium', Eg0: 0.7437, a: 4.77e-4, b: 235, Nc: 1.04e19, Nv: 6.0e18, col: AMBER },
    GaAs: { name: 'Gallium arsenide', Eg0: 1.519, a: 5.405e-4, b: 204, Nc: 4.7e17, Nv: 7.0e18, col: PURPLE }
  };
  function Eg(m, T) { return m.Eg0 - m.a * T * T / (T + m.b); }
  function ni(m, T) { var s = Math.pow(T / 300, 1.5); return Math.sqrt(m.Nc * m.Nv) * s * Math.exp(-Eg(m, T) / (2 * KB * T)); }

  /* -----------------------------------------------------------------------
     Figure: atomic levels broadening into bands
     ----------------------------------------------------------------------- */
  FIG['fig-el-bands'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 8, a = 0.32;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bd-n', label: 'Number of atoms in the chain', min: 1, max: 40, step: 1, value: N, onChange: function (x) { N = x; draw(); } });
    FIG.slider(controls, { id: 'bd-a', label: 'Spacing between atoms (relative)', min: 0.2, max: 1, step: 0.01, value: a, onChange: function (x) { a = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var LV = [{ E: -6, t0: 3, lam: 0.18 }, { E: -1, t0: 4.5, lam: 0.22 }];
    function hop(L, x) { return L.t0 * Math.exp(-(x - 0.2) / L.lam) * 0.35; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Energy levels of a chain of atoms against their spacing'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 254, xl: 0.2, xh: 1, yl: -10, yh: 3, xticks: [0.2, 0.4, 0.6, 0.8, 1], yticks: [-10, -8, -6, -4, -2, 0, 2], xfmt: function (v) { return fmt(v, 1); }, xlab: 'spacing between atoms (close ← → far apart)', ylab: 'electron energy (eV)' });
      LV.forEach(function (L, j) {
        var up = '', dn = '';
        for (var k = 0; k <= 80; k++) { var x = 0.2 + 0.8 * k / 80, t = hop(L, x); up += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(L.E + 2 * t).toFixed(1); dn = 'L' + P.X(x).toFixed(1) + ' ' + P.Y(L.E - 2 * t).toFixed(1) + dn; }
        el('path', { d: up + dn.replace(/^L/, 'L') + 'Z', fill: (j ? AMBER : EC) + '22', stroke: j ? AMBER : EC, 'stroke-width': 1, 'clip-path': P.clip }, svg);
        var t = hop(L, a);
        for (var m = 1; m <= N; m++) { var E = L.E - 2 * t * Math.cos(Math.PI * m / (N + 1)); el('line', { x1: P.X(a) - 18, y1: P.Y(E), x2: P.X(a) + 18, y2: P.Y(E), stroke: j ? AMBER : EC, 'stroke-width': N > 20 ? 1 : 2, 'clip-path': P.clip }, svg); }
      });
      el('line', { x1: P.X(a), y1: 30, x2: P.X(a), y2: 254, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      var t0 = hop(LV[0], a), t1 = hop(LV[1], a), top0 = LV[0].E + 2 * t0, bot1 = LV[1].E - 2 * t1, gap = bot1 - top0;
      if (gap > 0.15) { el('line', { x1: P.X(a) + 24, y1: P.Y(top0), x2: P.X(a) + 24, y2: P.Y(bot1), stroke: RED, 'stroke-width': 1.5 }, svg); txt(svg, P.X(a) + 28, P.Y((top0 + bot1) / 2) + 4, 'gap ' + fmt(gap, 1) + ' eV', { anchor: P.X(a) > W * 0.7 ? 'end' : 'start', size: fs(10), fill: RED, weight: 700 }); }
      legend(svg, c, fs, W, 'shaded: bands for a long chain · short lines: the ' + N + ' allowed levels for your chain', 'shaded: bands · lines: your ' + N + ' levels');
      out.innerHTML = (N === 1 ? 'One atom: two sharp energy levels.' : N + ' atoms: each atomic level splits into <strong>' + N + '</strong> closely spaced levels.') + ' ' + (gap > 0.15 ? 'A <strong>band gap of ' + fmt(gap, 1) + ' eV</strong> separates the two bands.' : '<strong>The bands overlap</strong>: there is no gap.') + NOTE + 'When atoms come close, their electron waves overlap and, by Pauli’s exclusion principle, each atomic level must split into as many levels as there are atoms. A crystal has about 10<sup>23</sup> atoms per cubic centimetre, so the levels merge into continuous <em>bands</em>, separated by forbidden <em>gaps</em>. This simple chain model (tight binding) is a cartoon, but it captures the origin of the band gap.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: intrinsic carrier concentration against temperature
     ----------------------------------------------------------------------- */
  FIG['fig-el-ni'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 300;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ni-t', label: 'Temperature (K)', min: 200, max: 600, step: 5, value: T, onChange: function (x) { T = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Intrinsic carrier concentration of silicon, germanium and gallium arsenide against temperature'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 200, xh: 600, yl: 1e0, yh: 1e18, logy: true, xticks: [200, 300, 400, 500, 600], yticks: [1e0, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18], xlab: 'temperature (K)', ylab: 'carriers per cm³' });
      ['Si', 'Ge', 'GaAs'].forEach(function (k) { var m = SEMI[k]; plotLine(svg, P, function (t) { return ni(m, t); }, 200, 600, 120, m.col, 2.4); var y = ni(m, 215); txt(svg, P.X(215), P.Y(y) - 8, m.name, { anchor: 'start', size: fs(10), fill: m.col, weight: 700 }); });
      el('line', { x1: P.X(T), y1: 30, x2: P.X(T), y2: 244, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      ['Si', 'Ge', 'GaAs'].forEach(function (k) { el('circle', { cx: P.X(T), cy: P.Y(ni(SEMI[k], T)), r: 4, fill: SEMI[k].col }, svg); });
      el('line', { x1: P.X(200), y1: P.Y(5e14), x2: P.X(600), y2: P.Y(5e14), stroke: RED, 'stroke-dasharray': '4 3' }, svg); txt(svg, P.X(595), P.Y(5e14) - 4, 'typical light doping', { anchor: 'end', size: fs(9), fill: RED });
      legend(svg, c, fs, W, 'free electrons (= holes) per cm³ in the pure crystal, from thermal excitation across the gap', 'thermally excited carriers in pure crystal');
      var s = SEMI.Si;
      out.innerHTML = 'At ' + T + ' K (' + fmt(T - 273, 0) + ' °C): silicon gap ' + fmt(Eg(s, T), 2) + ' eV, n<sub>i</sub> ≈ <strong>' + sciHTML(ni(s, T), 1) + '</strong> cm<sup>−3</sup>; germanium ' + sciHTML(ni(SEMI.Ge, T), 1) + '; gallium arsenide ' + sciHTML(ni(SEMI.GaAs, T), 1) + '.' + NOTE + 'n<sub>i</sub> ∝ T<sup>3/2</sup> e<sup>−E<sub>g</sub>/2kT</sup>. Silicon has 5 × 10<sup>22</sup> atoms per cm³, so at room temperature only about one atom in 10<sup>12</sup> contributes a free electron. When n<sub>i</sub> rises past the doping level (red line), the device loses its designed behaviour, which is why germanium devices fail at lower temperatures than silicon ones, and wide-gap materials survive the hottest.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: doping, carriers and the Fermi level
     ----------------------------------------------------------------------- */
  FIG['fig-el-doping'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var type = 1, lg = 16, nI = 1e10, phase = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Impurity', ['None (pure)', 'Phosphorus (n-type)', 'Boron (p-type)'], 1, function (i) { type = i; draw(); });
    FIG.slider(controls, { id: 'dp-n', label: 'Impurity atoms per cm³ (log₁₀)', min: 13, max: 19, step: 0.1, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var carrier;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 520 : 270, 'Silicon lattice with an impurity atom, and the band diagram'), W = A.W, svg = A.svg, fs = A.fs;
      var cw = narrow ? W - 20 : W * 0.5, s = Math.min((cw - 20) / 5, 46), ox = 10 + (cw - 20 - s * 4) / 2, oy = 40;
      for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) { var x = ox + i * s, y = oy + j * s; if (i < 4) { el('line', { x1: x + 9, y1: y - 3, x2: x + s - 9, y2: y - 3, stroke: c.border, 'stroke-width': 1.5 }, svg); el('line', { x1: x + 9, y1: y + 3, x2: x + s - 9, y2: y + 3, stroke: c.border, 'stroke-width': 1.5 }, svg); } if (j < 4) { el('line', { x1: x - 3, y1: y + 9, x2: x - 3, y2: y + s - 9, stroke: c.border, 'stroke-width': 1.5 }, svg); el('line', { x1: x + 3, y1: y + 9, x2: x + 3, y2: y + s - 9, stroke: c.border, 'stroke-width': 1.5 }, svg); } }
      for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) { var cx = ox + i * s, cy = oy + j * s, dop = i === 2 && j === 2 && type; el('circle', { cx: cx, cy: cy, r: 9, fill: dop ? (type === 1 ? EC : AMBER) : c.surface, stroke: dop ? 'none' : c.muted, 'stroke-width': 1.2 }, svg); txt(svg, cx, cy + 3.5, dop ? (type === 1 ? 'P' : 'B') : 'Si', { size: fs(8), fill: dop ? '#fff' : c.ink2, weight: 700 }); }
      var mx = ox + 2 * s, my = oy + 2 * s;
      if (type === 1) { carrier = el('circle', { cx: mx + s * 0.55, cy: my - s * 0.55, r: 5, fill: BLUE }, svg); txt(svg, cw / 2, oy + 4 * s + 30, narrow ? 'P: 5th electron barely bound, roams free' : 'P has 5 outer electrons: the 5th is barely bound (0.045 eV) and roams free', { size: fs(9), fill: c.ink2 }); }
      else if (type === 2) { carrier = el('circle', { cx: mx + s * 0.5, cy: my - 3, r: 5, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg); txt(svg, cw / 2, oy + 4 * s + 30, narrow ? 'B: one bond lacks an electron, a hole (+)' : 'B has 3: one bond is missing an electron, a mobile hole (+)', { size: fs(9), fill: c.ink2 }); }
      else { carrier = null; txt(svg, cw / 2, oy + 4 * s + 30, 'each Si shares 4 electrons in 4 covalent bonds', { size: fs(9), fill: c.ink2 }); }
      var N = type ? Math.pow(10, lg) : 0, n, p;
      if (type === 2) { p = N / 2 + Math.sqrt(N * N / 4 + nI * nI); n = nI * nI / p; } else { n = N / 2 + Math.sqrt(N * N / 4 + nI * nI); p = nI * nI / n; }
      var kT = 0.02585, EFi = kT * Math.log(n / nI);
      var bx = narrow ? 60 : W * 0.56, bw = narrow ? W - 120 : W - bx - 90, by = narrow ? 300 : 40, bh = 200, Yc = by + 30, Yv = by + bh - 30, Ye = function (e) { return (Yc + Yv) / 2 - e / 0.56 * (Yv - Yc) / 2; };
      el('rect', { x: bx, y: by, width: bw, height: Yc - by, fill: EC + '22' }, svg); el('rect', { x: bx, y: Yv, width: bw, height: by + bh - Yv, fill: AMBER + '22' }, svg);
      el('line', { x1: bx, y1: Yc, x2: bx + bw, y2: Yc, stroke: EC, 'stroke-width': 2 }, svg); el('line', { x1: bx, y1: Yv, x2: bx + bw, y2: Yv, stroke: AMBER, 'stroke-width': 2 }, svg);
      txt(svg, bx + bw + 6, Yc + 4, 'E꜀', { anchor: 'start', size: fs(10), fill: EC }); txt(svg, bx + bw + 6, Yv + 4, 'Eᵥ', { anchor: 'start', size: fs(10), fill: AMBER });
      txt(svg, bx + 4, by + 16, 'conduction band', { anchor: 'start', size: fs(9), fill: EC }); txt(svg, bx + 4, by + bh - 8, 'valence band', { anchor: 'start', size: fs(9), fill: AMBER });
      el('line', { x1: bx, y1: Ye(0), x2: bx + bw, y2: Ye(0), stroke: c.muted, 'stroke-dasharray': '2 3' }, svg); txt(svg, bx + bw + 6, Ye(0) + 4, 'Eᵢ', { anchor: 'start', size: fs(10), fill: c.muted });
      var yF = Math.max(Yc - 2, Math.min(Yv + 2, Ye(EFi)));
      el('line', { x1: bx, y1: yF, x2: bx + bw, y2: yF, stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '6 3' }, svg); txt(svg, bx + bw + 6, yF + (Math.abs(yF - Ye(0)) < 12 ? 16 : 4), 'E_F', { anchor: 'start', size: fs(10), fill: RED, weight: 700 });
      if (type === 1) for (i = 0; i < 8; i++) el('line', { x1: bx + 10 + i * bw / 8, y1: Yc + 8, x2: bx + 10 + i * bw / 8 + bw / 16, y2: Yc + 8, stroke: EC, 'stroke-width': 1.5 }, svg);
      if (type === 2) for (i = 0; i < 8; i++) el('line', { x1: bx + 10 + i * bw / 8, y1: Yv - 8, x2: bx + 10 + i * bw / 8 + bw / 16, y2: Yv - 8, stroke: AMBER, 'stroke-width': 1.5 }, svg);
      var ne = Math.min(14, Math.round(2 + Math.log10(Math.max(n, 1)) - 10)), nh = Math.min(14, Math.round(2 + Math.log10(Math.max(p, 1)) - 10)), r2 = rngSeed(3);
      for (i = 0; i < Math.max(0, ne); i++) el('circle', { cx: bx + 8 + r2() * (bw - 16), cy: by + 20 + r2() * (Yc - by - 26), r: 3.5, fill: BLUE }, svg);
      for (i = 0; i < Math.max(0, nh); i++) el('circle', { cx: bx + 8 + r2() * (bw - 16), cy: Yv + 6 + r2() * (by + bh - Yv - 22), r: 3.5, fill: 'none', stroke: RED, 'stroke-width': 1.5 }, svg);
      legend(svg, c, fs, W, 'left: the crystal · right: energy bands (dots: electrons, rings: holes, numbers on a log scale)', 'crystal and energy bands');
      var rho = 1 / (1.602e-19 * (n * 1400 + p * 450));
      function sci(v) { var e = Math.floor(Math.log10(v)); return e < 3 ? fmt(v, 0) : fmt(v / Math.pow(10, e), 1) + ' × 10<sup>' + e + '</sup>'; }
      out.innerHTML = 'Electrons n = <strong>' + sci(n) + '</strong> cm<sup>−3</sup>, holes p = <strong>' + sci(p) + '</strong> cm<sup>−3</sup>; n × p = n<sub>i</sub>² = 10<sup>20</sup>. Fermi level ' + (Math.abs(EFi) < 0.005 ? 'at mid-gap' : fmt(Math.abs(EFi), 2) + ' eV ' + (EFi > 0 ? 'above' : 'below') + ' mid-gap') + '. Resistivity ≈ <strong>' + (rho > 1e3 ? sciHTML(rho, 1) : fmt(rho, rho < 1 ? 3 : 1)) + ' Ω cm</strong>.' + NOTE + 'Adding one phosphorus atom per million silicon atoms (5 × 10<sup>16</sup> cm<sup>−3</sup>) raises the electron count a million-fold. The law of mass action, np = n<sub>i</sub>², means the holes drop by the same factor. (Mobilities are taken as constant here; in reality they fall at high doping.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function (now) { if (!carrier || !type) return; phase = now / 900; var s2 = parseFloat(carrier.getAttribute('r')); var bx = carrier.cx.baseVal.value; carrier.setAttribute('transform', 'translate(' + (8 * Math.cos(phase)).toFixed(1) + ' ' + (8 * Math.sin(phase * 1.3)).toFixed(1) + ')'); });
  };

  /* -----------------------------------------------------------------------
     Figure: the Fermi–Dirac distribution
     ----------------------------------------------------------------------- */
  FIG['fig-el-fermi'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 300, ef = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'fd-t', label: 'Temperature (K)', min: 0, max: 1500, step: 10, value: T, onChange: function (x) { T = x; draw(); } });
    FIG.slider(controls, { id: 'fd-e', label: 'Fermi level (eV from mid-gap)', min: -0.5, max: 0.5, step: 0.01, value: ef, onChange: function (x) { ef = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function f(E) { if (T === 0) return E < ef ? 1 : E > ef ? 0 : 0.5; return 1 / (1 + Math.exp((E - ef) / (KB * T))); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Fermi–Dirac occupation probability against energy'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: -1, xh: 1, yl: 0, yh: 1.05, xticks: [-1, -0.56, 0, 0.56, 1], yticks: [0, 0.5, 1], xfmt: function (v) { return fmt(v, 2); }, xlab: 'energy relative to mid-gap (eV)', ylab: 'probability occupied' });
      el('rect', { x: P.X(-1), y: 30, width: P.X(-0.56) - P.X(-1), height: 214, fill: AMBER + '18' }, svg); el('rect', { x: P.X(0.56), y: 30, width: P.X(1) - P.X(0.56), height: 214, fill: EC + '18' }, svg);
      txt(svg, (P.X(-1) + P.X(-0.56)) / 2, P.Y(0.06), 'valence band', { size: fs(9), fill: AMBER }); txt(svg, (P.X(0.56) + P.X(1)) / 2, 46, 'conduction band', { size: fs(9), fill: EC }); txt(svg, P.X(0), 46, 'gap', { size: fs(9), fill: c.muted });
      plotLine(svg, P, f, -1, 1, 400, RED, 2.6);
      el('line', { x1: P.X(ef), y1: 30, x2: P.X(ef), y2: 244, stroke: RED, 'stroke-dasharray': '3 3' }, svg); txt(svg, P.X(ef) + 4, P.Y(0.5) - 6, 'E_F', { anchor: 'start', size: fs(10), fill: RED, weight: 700 });
      legend(svg, c, fs, W, 'f(E) = 1 / (1 + e^((E − E_F)/kT)): chance that a state at energy E holds an electron', 'f(E): chance a state is filled');
      var fc = f(0.56), kT = KB * T;
      out.innerHTML = 'kT = ' + fmt(kT * 1000, 1) + ' meV. Chance that a state at the conduction-band edge is occupied: <strong>' + (fc > 0 ? sciHTML(fc, 2) : '0') + '</strong>; chance that a state at the valence-band edge is empty (a hole): <strong>' + (T ? sciHTML(1 - f(-0.56), 2) : '0') + '</strong>.' + NOTE + 'At absolute zero every state below the Fermi level is full and every state above is empty. Heat blurs the edge over a few kT. Because the conduction band is many kT above the Fermi level in a semiconductor, its occupation follows the tail e<sup>−(E − E<sub>F</sub>)/kT</sup>, and moving E<sub>F</sub> by just 60 meV changes the electron density about tenfold at room temperature. Doping moves E<sub>F</sub>; so, in a transistor, does a gate voltage.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why do energy levels form bands in a crystal?', options: ['Heat melts the levels together', 'Overlapping electron waves split each atomic level into as many levels as there are atoms', 'Electrons lose energy in collisions', 'Light excites them'], answer: 1, explanation: 'Pauli’s exclusion principle forbids identical states.' },
      { question: 'According to band theory, a material with a completely full band and a large gap above it is…', options: ['A metal', 'An insulator', 'A superconductor', 'A semiconductor at any gap'], answer: 1, explanation: 'Full bands carry no net current.' },
      { question: 'The band gap of silicon at room temperature is about…', options: ['0.026 eV', '0.66 eV', '1.12 eV', '9 eV'], answer: 2, explanation: 'Germanium is 0.66 eV; SiO₂ about 9 eV.' },
      { question: 'A hole is…', options: ['A missing atom', 'An empty electron state in the valence band that behaves like a positive charge', 'A positron', 'A gap in a wire'], answer: 1, explanation: 'Neighbouring electrons move into it.' },
      { question: 'Phosphorus in silicon is a donor because…', options: ['It has 3 outer electrons', 'It has 5 outer electrons, one of which is easily freed', 'It is a metal', 'It absorbs light'], answer: 1, explanation: 'Group V.' },
      { question: 'Silicon doped with 10¹⁶ boron atoms per cm³ (n_i = 10¹⁰ cm⁻³) has an electron concentration of about…', options: ['10¹⁶ cm⁻³', '10¹⁰ cm⁻³', '10⁴ cm⁻³', '0'], answer: 2, explanation: 'n = n_i²/p = 10²⁰/10¹⁶.' },
      { question: 'As temperature rises, the intrinsic carrier concentration of a semiconductor…', options: ['Falls', 'Rises roughly exponentially', 'Stays constant', 'Oscillates'], answer: 1, explanation: 'n_i ∝ T^{3/2} e^{−E_g/2kT}.' },
      { question: 'At room temperature, kT is about…', options: ['26 meV', '1.1 eV', '0.5 eV', '1 meV'], answer: 0, explanation: 'kT ≈ 0.0259 eV at 300 K.' },
      { question: 'In an n-type semiconductor, the Fermi level lies…', options: ['Below mid-gap, near the valence band', 'Above mid-gap, nearer the conduction band', 'Exactly at mid-gap', 'Inside the valence band always'], answer: 1, explanation: 'More electrons in the conduction band.' },
      { question: 'Why did silicon replace germanium for most devices?', options: ['It conducts better', 'Its larger gap gives fewer thermal carriers, and it grows an excellent insulating oxide', 'It is a metal', 'It is softer'], answer: 1, explanation: 'Both mattered; the oxide was decisive for integrated circuits.' }
    ]);
  };
})();
