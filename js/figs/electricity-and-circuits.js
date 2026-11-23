/* ==========================================================================
   RNLearn — Electricity and Circuits (From Switch to Supercomputer, Part 4)
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
    { name: 'Discovering electricity', color: '#b45309' },
    { name: 'Laws of circuits', color: '#1d4ed8' },
    { name: 'The electron', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1745', icon: '🫙', era: 0, sec: 6, title: 'The Leyden jar', text: 'Ewald von Kleist and Pieter van Musschenbroek independently store electric charge in a glass jar lined with metal: the first capacitor.' },
    { year: '1800', icon: '🔋', era: 0, sec: 3, title: 'Volta’s pile', text: 'Alessandro Volta stacks zinc and copper discs separated by brine-soaked card, producing the first steady electric current.' },
    { year: '1820', icon: '🧭', era: 0, sec: 3, title: 'Current makes magnetism', text: 'Hans Christian Ørsted sees a compass needle swing near a current-carrying wire, linking electricity and magnetism.' },
    { year: '1827', icon: 'Ω', era: 1, sec: 4, title: 'Ohm’s law', text: 'Georg Simon Ohm publishes that current is proportional to voltage for a given conductor; his work is at first poorly received.' },
    { year: '1831', icon: '🧲', era: 1, sec: 6, title: 'Induction', text: 'Michael Faraday discovers that a changing magnetic field induces a current, the principle of generators and transformers.' },
    { year: '1845', icon: '🔀', era: 1, sec: 5, title: 'Kirchhoff’s laws', text: 'Gustav Kirchhoff, still a student, states the current and voltage laws that let any network of resistors be solved.' },
    { year: '1897', icon: '⚛️', era: 2, sec: 3, title: 'The electron', text: 'J. J. Thomson shows that cathode rays are made of particles far lighter than atoms: electrons.' },
    { year: '1900', icon: '🎱', era: 2, sec: 3, title: 'The Drude model', text: 'Paul Drude explains metallic conduction as a gas of electrons colliding with ions, giving the first microscopic picture of resistance.' }
  ];

  FIG['fig-el4-timeline'] = function (figEl) {
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

  var EL_PART = 4;
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

  function resistor(svg, c, x1, y1, x2, y2, col, w) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, a = L * 0.25, b = L * 0.75, n = 6, d = 'M' + x1 + ' ' + y1 + 'L' + (x1 + ux * a) + ' ' + (y1 + uy * a);
    for (var k = 1; k <= n; k++) { var t = a + (b - a) * (k - 0.5) / n, s = k % 2 ? 7 : -7; d += 'L' + (x1 + ux * t + nx * s) + ' ' + (y1 + uy * t + ny * s); }
    d += 'L' + (x1 + ux * b) + ' ' + (y1 + uy * b) + 'L' + x2 + ' ' + y2;
    el('path', { d: d, fill: 'none', stroke: col || c.ink2, 'stroke-width': w || 2, 'stroke-linejoin': 'round' }, svg);
  }
  function battery(svg, c, x, y1, y2, label, fs) {
    var m = (y1 + y2) / 2;
    el('line', { x1: x, y1: y1, x2: x, y2: m - 8, stroke: c.ink2, 'stroke-width': 2 }, svg); el('line', { x1: x, y1: m + 8, x2: x, y2: y2, stroke: c.ink2, 'stroke-width': 2 }, svg);
    el('line', { x1: x - 16, y1: m - 8, x2: x + 16, y2: m - 8, stroke: c.ink, 'stroke-width': 2.5 }, svg); el('line', { x1: x - 8, y1: m + 8, x2: x + 8, y2: m + 8, stroke: c.ink, 'stroke-width': 4 }, svg);
    txt(svg, x - 22, m + 4, label, { anchor: 'end', size: fs(11), fill: c.ink, weight: 700 });
  }
  function fmtSI(v, u, d) { var a = Math.abs(v), P = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f'], [1e-18, 'a']]; if (a === 0) return '0 ' + u; for (var i = 0; i < P.length; i++) if (a >= P[i][0] * 0.9995) return fmt(v / P[i][0], d === undefined ? (a / P[i][0] >= 100 ? 0 : a / P[i][0] >= 10 ? 1 : 2) : d) + ' ' + P[i][1] + u; return sciHTML(v) + ' ' + u; }

  /* -----------------------------------------------------------------------
     Figure: voltage divider, Ohm's and Kirchhoff's laws
     ----------------------------------------------------------------------- */
  FIG['fig-el-divider'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var V = 5, R1 = 2000, R2 = 3000, load = false, RL = 3000;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dv-v', label: 'Battery voltage (V)', min: 1, max: 12, step: 0.5, value: V, onChange: function (x) { V = x; draw(); } });
    FIG.slider(controls, { id: 'dv-r1', label: 'R₁ (kΩ)', min: 0.5, max: 10, step: 0.5, value: R1 / 1000, onChange: function (x) { R1 = x * 1000; draw(); } });
    FIG.slider(controls, { id: 'dv-r2', label: 'R₂ (kΩ)', min: 0.5, max: 10, step: 0.5, value: R2 / 1000, onChange: function (x) { R2 = x * 1000; draw(); } });
    choice(controls, 'Load on the output', ['None', '3 kΩ load'], 0, function (i) { load = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 260, 'Voltage divider circuit and voltage around the loop'), W = A.W, svg = A.svg, fs = A.fs;
      var R2e = load ? R2 * RL / (R2 + RL) : R2, I = V / (R1 + R2e), Vo = I * R2e, I2 = Vo / R2, IL = load ? Vo / RL : 0;
      var x0 = 80, xr = 200, y1 = 40, ym = 130, y2 = 220;
      battery(svg, c, x0, y1, y2, V + ' V', fs);
      el('path', { d: 'M' + x0 + ' ' + y1 + 'L' + xr + ' ' + y1, stroke: EC, 'stroke-width': 2, fill: 'none' }, svg);
      resistor(svg, c, xr, y1, xr, ym, EC); resistor(svg, c, xr, ym, xr, y2, EC);
      el('path', { d: 'M' + xr + ' ' + y2 + 'L' + x0 + ' ' + y2, stroke: EC, 'stroke-width': 2, fill: 'none' }, svg);
      txt(svg, xr + 14, (y1 + ym) / 2 + 4, 'R₁ = ' + fmtSI(R1, 'Ω'), { anchor: 'start', size: fs(10), fill: c.ink2 }); txt(svg, xr - 14, (ym + y2) / 2 + 4, 'R₂ = ' + fmtSI(R2, 'Ω'), { anchor: 'end', size: fs(10), fill: c.ink2 });
      el('circle', { cx: xr, cy: ym, r: 4, fill: c.ink }, svg); txt(svg, xr + 14, ym + 4, 'V_out = ' + fmt(Vo, 2) + ' V', { anchor: 'start', size: fs(11), fill: c.ink, weight: 700 });
      if (load) { var xl = xr + 120; el('path', { d: 'M' + xr + ' ' + ym + 'L' + (xr + 10) + ' ' + ym + 'M' + (xr + 10) + ' ' + (ym + 14) + 'L' + xl + ' ' + (ym + 14) + 'L' + xl + ' ' + (ym + 20), stroke: AMBER, 'stroke-width': 2, fill: 'none' }, svg); el('line', { x1: xr + 10, y1: ym, x2: xr + 10, y2: ym + 14, stroke: AMBER, 'stroke-width': 2 }, svg); resistor(svg, c, xl, ym + 20, xl, y2, AMBER); el('line', { x1: xl, y1: y2, x2: xr, y2: y2, stroke: AMBER, 'stroke-width': 2 }, svg); txt(svg, xl + 12, (ym + y2) / 2 + 14, 'load 3 kΩ', { anchor: 'start', size: fs(10), fill: AMBER }); }
      txt(svg, (x0 + xr) / 2, y1 - 8, 'I = ' + fmtSI(I, 'A'), { size: fs(10), fill: EC, weight: 700 });
      var gx = narrow ? 50 : Math.max(380, W * 0.56), gy = narrow ? 290 : 40, gw = narrow ? W - 70 : W - gx - 16, gh = 150;
      var P = plotAxes(svg, c, fs, { L: gx, R: gx + gw, T: gy, B: gy + gh, xl: 0, xh: 4, yl: 0, yh: 12, yticks: [0, 4, 8, 12], xticks: [], ylab: '' });
      var pts = [[0, 0], [0.5, 0], [0.5, V], [1, V], [2, V - I * R1], [3, 0], [4, 0]], d = '';
      pts.forEach(function (p, i) { d += (i ? 'L' : 'M') + P.X(p[0]) + ' ' + P.Y(p[1]); }); el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2.6 }, svg);
      [['battery', 0.5], ['across R₁', 1.5], ['across R₂', 2.5], ['back', 3.5]].forEach(function (l) { txt(svg, P.X(l[1]), gy + gh + 14, l[0], { size: fs(9), fill: c.muted }); });
      txt(svg, P.X(1.5), P.Y((V + V - I * R1) / 2) - 6, '−' + fmt(I * R1, 2) + ' V', { anchor: 'start', size: fs(9), fill: c.ink2 }); txt(svg, P.X(2.5), P.Y((V - I * R1) / 2) - 6, '−' + fmt(Vo, 2) + ' V', { anchor: 'start', size: fs(9), fill: c.ink2 });
      txt(svg, gx, gy - 10, 'voltage going round the loop (V)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Current I = V ÷ (R₁ + R₂' + (load ? ' ∥ R_L' : '') + ') = <strong>' + fmtSI(I, 'A') + '</strong>; output <strong>' + fmt(Vo, 2) + ' V</strong>' + (load ? ' (without the load it would be ' + fmt(V * R2 / (R1 + R2), 2) + ' V)' : '') + '; power from the battery ' + fmtSI(V * I, 'W') + '.' + NOTE + 'Ohm’s law (V = IR) gives the drop across each resistor. Kirchhoff’s voltage law: the rises and drops round any loop sum to zero, as the staircase shows. Kirchhoff’s current law: at the output node, current in equals current out' + (load ? ' (' + fmtSI(I, 'A') + ' = ' + fmtSI(I2, 'A') + ' through R₂ + ' + fmtSI(IL, 'A') + ' through the load)' : '') + '. A load draws current and pulls the output down: the divider’s output depends on what it drives.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: drift velocity of electrons in a wire
     ----------------------------------------------------------------------- */
  FIG['fig-el-drift'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var I = 1, dmm = 1, rnd = rngSeed(7), E = [], ions = [];
    for (var k = 0; k < 70; k++) E.push({ x: rnd(), y: rnd(), vx: rnd() - 0.5, vy: rnd() - 0.5 });
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dr-i', label: 'Current (A)', min: 0, max: 10, step: 0.1, value: I, onChange: function (x) { I = x; info(); } });
    FIG.slider(controls, { id: 'dr-d', label: 'Wire diameter (mm)', min: 0.2, max: 3, step: 0.1, value: dmm, onChange: function (x) { dmm = x; info(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var n = 8.5e28, q = 1.602e-19, svg, W, dots = [];
    function vd() { var A = Math.PI * Math.pow(dmm * 1e-3 / 2, 2); return I / (n * q * A); }
    function setup() {
      var c = C(), A = newSVG(svgWrap, container, 170, 'Electrons drifting slowly through a copper wire'); W = A.W; svg = A.svg; var fs = A.fs;
      el('rect', { x: 10, y: 34, width: W - 20, height: 110, rx: 12, fill: '#b4530922', stroke: '#b45309', 'stroke-width': 1.5 }, svg);
      for (var i = 0; i < 9; i++) for (var j = 0; j < 4; j++) el('circle', { cx: 30 + i * (W - 60) / 8, cy: 52 + j * 25, r: 5, fill: c.border }, svg);
      dots = E.map(function () { return el('circle', { r: 3, fill: EC }, svg); });
      legend(svg, c, fs, W, 'electrons (blue) dart about at ~10⁶ m/s; the current is only a tiny average drift, shown greatly exaggerated', 'fast random motion + tiny drift (exaggerated)');
      txt(svg, W - 14, 160, 'electrons drift → (current flows ←)', { anchor: 'end', size: fs(9), fill: c.muted });
      info();
    }
    function info() {
      var v = vd();
      out.innerHTML = 'Drift velocity v<sub>d</sub> = I ÷ (n q A) = <strong>' + (v > 0 ? sciHTML(v * 1000) + ' mm/s' : '0') + '</strong>' + (v > 0 ? ': crossing 1 m of wire takes about <strong>' + (1 / v / 3600 > 1 ? fmt(1 / v / 3600, 1) + ' hours' : fmt(1 / v / 60, 0) + ' minutes') + '</strong>.' : '.') + NOTE + 'Copper has about n = 8.5 × 10<sup>28</sup> free electrons per cubic metre. Each moves randomly at about 1.6 × 10<sup>6</sup> m/s (the Fermi velocity), colliding constantly; a voltage adds only a slow drift. Yet a light turns on almost instantly, because the electric field, carried by the electromagnetic wave guided along the wires, travels at a large fraction of the speed of light and pushes all the electrons at once, like water in a full pipe.</span>';
    }
    setup();
    window.addEventListener('resize', setup);
    onTheme(setup);
    FIG.animate(figEl, function () {
      var drift = I > 0 ? Math.min(0.012, 0.0004 + 0.0025 * Math.log10(1 + vd() * 1e5)) : 0;
      E.forEach(function (e, i) {
        if (rnd() < 0.08) { e.vx = rnd() - 0.5; e.vy = rnd() - 0.5; }
        e.x += e.vx * 0.02 + drift; e.y += e.vy * 0.03; if (e.y < 0) { e.y = -e.y; e.vy = -e.vy; } if (e.y > 1) { e.y = 2 - e.y; e.vy = -e.vy; } if (e.x > 1) e.x -= 1; if (e.x < 0) e.x += 1;
        if (dots[i]) { dots[i].setAttribute('cx', (16 + e.x * (W - 32)).toFixed(1)); dots[i].setAttribute('cy', (40 + e.y * 98).toFixed(1)); }
      });
    });
  };

  /* -----------------------------------------------------------------------
     Figure: RC charging and logic signals
     ----------------------------------------------------------------------- */
  FIG['fig-el-rc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var R = 2, Cf = 10, Tp = 200;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rc-r', label: 'Resistance R (kΩ)', min: 0.5, max: 10, step: 0.5, value: R, onChange: function (x) { R = x; draw(); } });
    FIG.slider(controls, { id: 'rc-c', label: 'Capacitance C (fF)', min: 1, max: 50, step: 1, value: Cf, onChange: function (x) { Cf = x; draw(); } });
    FIG.slider(controls, { id: 'rc-t', label: 'Clock period (ps)', min: 20, max: 1000, step: 10, value: Tp, onChange: function (x) { Tp = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Square wave and RC-filtered output'), W = A.W, svg = A.svg, fs = A.fs, tau = R * Cf, tmax = 4 * Tp;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 34, B: 214, xl: 0, xh: tmax, yl: -0.05, yh: 1.1, yticks: [0, 0.5, 1], xticks: [0, Tp, 2 * Tp, 3 * Tp, 4 * Tp], xfmt: function (v) { return fmt(v, 0); }, xlab: 'time (ps)', ylab: 'voltage (× V_DD)' });
      var vin = function (t) { return Math.floor(t / (Tp / 2)) % 2 ? 0 : 1; };
      var din = ''; for (var k = 0; k <= 8; k++) { var t0 = k * Tp / 2; if (t0 > tmax) break; var v = vin(t0 + 0.01); din += (k ? 'L' : 'M') + P.X(t0) + ' ' + P.Y(v) + 'L' + P.X(Math.min(tmax, t0 + Tp / 2)) + ' ' + P.Y(v); }
      el('path', { d: din, fill: 'none', stroke: c.muted, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }, svg);
      el('line', { x1: P.X(0), y1: P.Y(0.5), x2: P.X(tmax), y2: P.Y(0.5), stroke: AMBER, 'stroke-dasharray': '3 3' }, svg); var th = txt(svg, P.X(tmax) - 2, P.Y(0.5) - 4, '50% threshold', { anchor: 'end', size: fs(9), fill: AMBER, weight: 700 }); th.setAttribute('stroke', c.surface); th.setAttribute('stroke-width', 4); th.setAttribute('paint-order', 'stroke');
      var vo = 0, d = 'M' + P.X(0) + ' ' + P.Y(0), steps = 400, dt = tmax / steps, minHi = 1, maxLo = 0;
      for (var s = 1; s <= steps; s++) { var t = s * dt, target = vin(t - dt / 2); vo = target + (vo - target) * Math.exp(-dt / tau); d += 'L' + P.X(t).toFixed(1) + ' ' + P.Y(vo).toFixed(1); if (t > Tp) { var ph = (t % Tp) / Tp; if (ph > 0.49 && ph < 0.5) minHi = Math.min(minHi, vo); if (ph > 0.99) maxLo = Math.max(maxLo, vo); } }
      el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2.6, 'clip-path': P.clip }, svg);
      legend(svg, c, fs, W, 'dashed: input from a gate · blue: voltage at the far end of a wire with resistance R and capacitance C', 'dashed: input · blue: output');
      var ok = Tp / 2 > 3 * tau, fail = Tp / 2 < 0.69 * tau;
      out.innerHTML = 'Time constant τ = RC = <strong>' + fmt(tau, 0) + ' ps</strong>; the output crosses 50% after 0.69τ = <strong>' + fmt(0.69 * tau, 0) + ' ps</strong>.' + (fail ? ' <strong style="color:#dc2626">The half-period is shorter than this: the signal never reaches the threshold and the logic fails.</strong>' : ok ? ' The output settles fully each half-cycle.' : ' The output switches, but never quite reaches full voltage.') + NOTE + 'Charging a capacitor through a resistor follows V(t) = V<sub>DD</sub>(1 − e<sup>−t/RC</sup>): 63% after τ, 95% after 3τ. Every wire and every gate input on a chip is a small capacitor, and every transistor driving it has resistance, so RC delay sets how fast logic can switch (1 kΩ × 1 fF = 1 ps).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: switching energy
     ----------------------------------------------------------------------- */
  FIG['fig-el-energy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var V = 1, R = 2, Cf = 10;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'en-v', label: 'Supply voltage (V)', min: 0.4, max: 5, step: 0.1, value: V, onChange: function (x) { V = x; draw(); } });
    FIG.slider(controls, { id: 'en-r', label: 'Resistance R (kΩ)', min: 0.5, max: 10, step: 0.5, value: R, onChange: function (x) { R = x; draw(); } });
    FIG.slider(controls, { id: 'en-c', label: 'Capacitance C (fF)', min: 1, max: 50, step: 1, value: Cf, onChange: function (x) { Cf = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 260, 'Current while charging a capacitor and where the energy goes'), W = A.W, svg = A.svg, fs = A.fs, tau = R * Cf;
      var pw = narrow ? W - 14 : W * 0.58, P = plotAxes(svg, c, fs, { L: 54, R: pw, T: 34, B: 214, xl: 0, xh: 250, yl: 0, yh: 2 * V, yticks: [0, 0.5 * V, V, 1.5 * V, 2 * V], yfmt: function (v) { return fmt(v, v < 10 ? 1 : 0); }, xticks: [0, 50, 100, 150, 200, 250], xlab: 'time (ps)', ylab: 'current (mA)' });
      var I0 = V / (R * 1000) * 1000;
      var d = 'M' + P.X(0) + ' ' + P.Y(0), area = d; for (var k = 0; k <= 200; k++) { var t = k * 250 / 200, i = I0 * Math.exp(-t / tau); d += 'L' + P.X(t).toFixed(1) + ' ' + P.Y(i).toFixed(1); }
      el('path', { d: d + 'L' + P.X(250) + ' ' + P.Y(0) + 'Z', fill: EC + '22', stroke: 'none', 'clip-path': P.clip }, svg);
      el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2.4, 'clip-path': P.clip }, svg);
      txt(svg, 10, 14, 'charging current i(t) = (V/R) e^(−t/RC)', { anchor: 'start', size: fs(10), fill: c.muted });
      var E = Cf * 1e-15 * V * V, bx = narrow ? 70 : pw + 50, by = narrow ? 290 : 40, bw = narrow ? W - 90 : W - bx - 16, bh = narrow ? 150 : 170, Emax = 50e-15 * 25;
      var bars = [['from supply', E, c.ink2], ['stored in C', E / 2, EC], ['heat in R', E / 2, RED]], barW = bw / 3 - 12, top = Math.max(E, 1e-18);
      bars.forEach(function (b, j) { var h = b[1] / top * (bh - 30), x = bx + j * (bw / 3); el('rect', { x: x, y: by + bh - h, width: barW, height: h, fill: b[2], opacity: 0.8, rx: 3 }, svg); txt(svg, x + barW / 2, by + bh + 14, b[0], { size: fs(9), fill: c.ink2 }); txt(svg, x + barW / 2, by + bh - h - 5, fmtSI(b[1], 'J'), { size: fs(9), fill: c.ink, weight: 700 }); });
      out.innerHTML = 'Energy taken from the supply to charge C: CV² = <strong>' + fmtSI(E, 'J') + '</strong>. Half (' + fmtSI(E / 2, 'J') + ') is stored in the capacitor; the other half is turned into heat in the resistor, <strong>whatever the value of R</strong> (change R: the current curve changes shape, the energies do not).' + NOTE + 'When the gate switches back, the stored half is also dumped as heat. So each full 0→1→0 cycle costs CV², and a chip switching total capacitance C at frequency f with a fraction α of nodes active uses power P ≈ α C V² f. Because the power goes as V², lowering the supply voltage was the main way to save energy for decades (Parts 9 and 10).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A 2 kΩ resistor carries 3 mA. What is the voltage across it?', options: ['0.67 V', '1.5 V', '6 V', '6000 V'], answer: 2, explanation: 'V = IR = 0.003 × 2000 = 6 V.' },
      { question: 'Kirchhoff’s current law says that at any junction…', options: ['Voltages add to zero', 'Current in equals current out', 'Resistance is constant', 'Power is conserved only in loops'], answer: 1, explanation: 'Charge is conserved.' },
      { question: 'Two 4 kΩ resistors in parallel have a total resistance of…', options: ['8 kΩ', '4 kΩ', '2 kΩ', '1 kΩ'], answer: 2, explanation: '1/R = 1/4 + 1/4.' },
      { question: 'A divider of 1 kΩ (top) and 3 kΩ (bottom) across 8 V gives an output of…', options: ['2 V', '4 V', '6 V', '8 V'], answer: 2, explanation: '8 × 3/4.' },
      { question: 'Roughly how fast do electrons drift in a household copper wire carrying a few amps?', options: ['Near the speed of light', 'About 1 km/s', 'A fraction of a millimetre per second', 'They do not move at all'], answer: 2, explanation: 'The field, not the electrons, travels fast.' },
      { question: 'An RC circuit has R = 1 kΩ and C = 1 pF. Its time constant is…', options: ['1 ps', '1 ns', '1 µs', '1 ms'], answer: 1, explanation: '10³ × 10⁻¹² = 10⁻⁹ s.' },
      { question: 'After one time constant, a charging capacitor reaches about what fraction of its final voltage?', options: ['37%', '50%', '63%', '100%'], answer: 2, explanation: '1 − 1/e.' },
      { question: 'Charging a capacitor C to voltage V through a resistor dissipates how much energy in the resistor?', options: ['Zero', '½CV², whatever R is', 'CV²/R', 'It depends on R only'], answer: 1, explanation: 'Half the energy drawn from the supply.' },
      { question: 'If a chip’s supply voltage is reduced from 1.0 V to 0.8 V (same C and f), its dynamic power falls to about…', options: ['80%', '64%', '50%', '20%'], answer: 1, explanation: 'P ∝ V²: 0.8² = 0.64.' },
      { question: 'Resistance of a wire R = ρL/A. If a wire on a chip is made half as wide and half as thick, its resistance…', options: ['Halves', 'Stays the same', 'Doubles', 'Quadruples'], answer: 3, explanation: 'The area falls by 4.' }
    ]);
  };
})();
