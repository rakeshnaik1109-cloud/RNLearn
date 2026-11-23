/* ==========================================================================
   RNLearn — Euclid and Archimedes (Minds That Changed How We Know, Part 2)
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
    { name: 'Alexandria', color: '#b45309' },
    { name: 'Syracuse', color: '#1d4ed8' },
    { name: 'Lost and found', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: 'c. 331 BCE', icon: '🏛️', era: 0, sec: 3, title: 'Alexandria founded', text: 'Alexander the Great founds Alexandria in Egypt; under the Ptolemies it gains the Museum and its great Library.' },
    { year: 'c. 300 BCE', icon: '📐', era: 0, sec: 4, title: 'Euclid’s Elements', text: 'Euclid, working in Alexandria, compiles the Elements: thirteen books of geometry and number theory built from definitions, postulates and proofs.' },
    { year: 'c. 287 BCE', icon: '👶', era: 1, sec: 7, title: 'Archimedes born', text: 'Archimedes is born in Syracuse, Sicily, son of an astronomer named Phidias.' },
    { year: 'c. 250 BCE', icon: '⭕', era: 1, sec: 10, title: 'Measuring the circle', text: 'Archimedes traps π between 3 10/71 and 3 1/7 using polygons of 96 sides, and in the Sand-Reckoner counts the grains of sand that would fill the universe.' },
    { year: '212 BCE', icon: '⚔️', era: 1, sec: 13, title: 'Death of Archimedes', text: 'Roman troops under Marcellus capture Syracuse after a long siege; Archimedes is killed.' },
    { year: '75 BCE', icon: '🪦', era: 1, sec: 13, title: 'Cicero finds the tomb', text: 'Cicero, a Roman official in Sicily, finds Archimedes’ overgrown tomb, marked with a sphere inside a cylinder.' },
    { year: '1229', icon: '📖', era: 2, sec: 11, title: 'A book scraped clean', text: 'A scribe scrapes a tenth-century copy of Archimedes’ works and reuses the parchment for a prayer book: the Archimedes palimpsest.' },
    { year: '1906', icon: '🔍', era: 2, sec: 11, title: 'Heiberg reads the palimpsest', text: 'Johan Ludvig Heiberg identifies Archimedes beneath the prayers, including the only copy of The Method.' },
    { year: '1998', icon: '🔆', era: 2, sec: 11, title: 'Rediscovery and imaging', text: 'The palimpsest reappears at auction; over the next decade imaging with ultraviolet light and X-rays recovers much of the hidden text.' }
  ];

  FIG['fig-m2-timeline'] = function (figEl) {
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

  var MC = '#0e7490';

  /* -----------------------------------------------------------------------
     Figure: Euclid I.1 and I.47, step by step
     ----------------------------------------------------------------------- */
  FIG['fig-euclid-proof'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var which = 0, step = 0;
    var PROOFS = [
      { name: 'Book I, Proposition 1', steps: [
        'Given: a straight line AB. Task: construct an equilateral triangle on it.',
        'Postulate 3: draw the circle with centre A and radius AB.',
        'Postulate 3 again: draw the circle with centre B and radius BA.',
        'Let C be a point where the circles meet. Postulate 1: join CA and CB.',
        'AC = AB (radii of the first circle) and BC = BA (radii of the second). Common notion 1: things equal to the same thing are equal to each other, so AC = BC = AB. ∎',
        'The gap: nothing in Euclid’s postulates guarantees that the two circles actually meet. David Hilbert repaired this in 1899 by adding axioms of continuity.'] },
      { name: 'Book I, Proposition 47 (Pythagoras)', steps: [
        'Given: a right-angled triangle ABC with the right angle at A. Claim: the square on BC equals the squares on AB and AC.',
        'Draw squares on all three sides.',
        'Drop a line from A perpendicular to BC, splitting the big square into two rectangles.',
        'A pair of congruent triangles (two sides and the included angle equal) shows that the left rectangle has the same area as the square on AB: each is twice the area of one of the triangles.',
        'In the same way, the right rectangle equals the square on AC.',
        'So the square on BC, made of the two rectangles, equals the sum of the squares on AB and AC. ∎ (Euclid’s figure is sometimes called the “windmill”.)'] }
    ];
    var controls = div('fig-controls', container);
    choice(controls, 'Proof', PROOFS.map(function (p) { return p.name; }), 0, function (i) { which = i; step = 0; draw(); });
    var row = group(controls, 'Steps');
    btn('◀ Back', row).addEventListener('click', function () { step = Math.max(0, step - 1); draw(); });
    btn('Next step ▶', row).addEventListener('click', function () { step = Math.min(PROOFS[which].steps.length - 1, step + 1); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function P(svg, c, fs, x, y, lab, dx, dy) { el('circle', { cx: x, cy: y, r: 3.5, fill: c.ink }, svg); txt(svg, x + (dx || 0), y + (dy || 0), lab, { size: fs(12), fill: c.ink, weight: 700 }); }
    function L(svg, a, b, col, w, dash) { el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: col, 'stroke-width': w || 2, 'stroke-dasharray': dash || 'none' }, svg); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 330, PROOFS[which].name), W = A.W, svg = A.svg, fs = A.fs, cx = W / 2;
      if (which === 0) {
        var r = Math.min(120, W * 0.28), a = [cx - r / 2, 210], b = [cx + r / 2, 210], cc = [cx, 210 - r * Math.sqrt(3) / 2];
        if (step >= 1) el('circle', { cx: a[0], cy: a[1], r: r, fill: 'none', stroke: BLUE, 'stroke-width': 1.6, opacity: 0.8 }, svg);
        if (step >= 2) el('circle', { cx: b[0], cy: b[1], r: r, fill: 'none', stroke: AMBER, 'stroke-width': 1.6, opacity: 0.8 }, svg);
        L(svg, a, b, c.ink, 2.6);
        if (step >= 3) { L(svg, a, cc, MC, 2.6); L(svg, b, cc, MC, 2.6); P(svg, c, fs, cc[0], cc[1], 'C', 0, -10); }
        if (step >= 4) { el('path', { d: 'M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + 'L' + cc[0] + ' ' + cc[1] + 'Z', fill: MC + '22' }, svg); }
        if (step >= 5) { el('circle', { cx: cc[0], cy: cc[1], r: 12, fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, svg); }
        P(svg, c, fs, a[0], a[1], 'A', -10, 18); P(svg, c, fs, b[0], b[1], 'B', 10, 18);
      } else {
        var s = Math.min(1, (W - 40) / 360), A0 = [cx - 20 * s, 170], B0 = [cx - 80 * s, 170 + 0], C0 = [cx + 60 * s, 170];
        var Ap = [cx - 20 * s + 0, 170 - 0];
        var bx = cx - 75 * s, by = 175, Cx = cx + 75 * s, ah = [bx + (Cx - bx) * 0.36, by - Math.sqrt(0.36 * 0.64) * (Cx - bx)];
        var Bp = [bx, by], Cp = [Cx, by], Aq = ah;
        function sq(p, q, col) { var dx = q[0] - p[0], dy = q[1] - p[1], p3 = [q[0] - dy, q[1] + dx], p4 = [p[0] - dy, p[1] + dx]; el('path', { d: 'M' + p[0] + ' ' + p[1] + 'L' + q[0] + ' ' + q[1] + 'L' + p3[0] + ' ' + p3[1] + 'L' + p4[0] + ' ' + p4[1] + 'Z', fill: col + '22', stroke: col, 'stroke-width': 1.5 }, svg); return [p3, p4]; }
        if (step >= 1) { var big = sq(Bp, Cp, c.muted); sq(Aq, Bp, BLUE); sq(Cp, Aq, AMBER); }
        var foot = [Aq[0], by];
        if (step >= 2) { L(svg, Aq, [Aq[0], by + (Cx - bx)], RED, 1.6, '5 3'); }
        if (step >= 3) { el('rect', { x: bx, y: by, width: Aq[0] - bx, height: Cx - bx, fill: BLUE + '33' }, svg); }
        if (step >= 4) { el('rect', { x: Aq[0], y: by, width: Cx - Aq[0], height: Cx - bx, fill: AMBER + '33' }, svg); }
        el('path', { d: 'M' + Bp[0] + ' ' + Bp[1] + 'L' + Cp[0] + ' ' + Cp[1] + 'L' + Aq[0] + ' ' + Aq[1] + 'Z', fill: MC + '33', stroke: c.ink, 'stroke-width': 2 }, svg);
        P(svg, c, fs, Aq[0], Aq[1], 'A', 0, -8); P(svg, c, fs, Bp[0], Bp[1], 'B', -12, -4); P(svg, c, fs, Cp[0], Cp[1], 'C', 12, -4);
      }
      txt(svg, 10, 14, 'step ' + (step + 1) + ' of ' + PROOFS[which].steps.length, { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = '<strong>Step ' + (step + 1) + '.</strong> ' + PROOFS[which].steps[step] + NOTE + 'Every step of a Euclidean proof cites a definition, a postulate, a common notion or an earlier proposition. Nothing is accepted because it looks true in the drawing.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the Euclidean algorithm as squares in a rectangle
     ----------------------------------------------------------------------- */
  FIG['fig-gcd'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 21, b = 12;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'gc-a', label: 'Length a', min: 2, max: 60, step: 1, value: a, onChange: function (x) { a = x; draw(); } });
    FIG.slider(controls, { id: 'gc-b', label: 'Width b', min: 1, max: 60, step: 1, value: b, onChange: function (x) { b = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var COLS = [BLUE, AMBER, MC, PURPLE, GREEN, RED];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A rectangle filled with the largest possible squares'), W = A.W, svg = A.svg, fs = A.fs;
      var x0 = Math.max(a, b), y0 = Math.min(a, b), sc = Math.min((W - 30) / x0, 250 / y0), ox = (W - x0 * sc) / 2, oy = 30;
      var X = 0, Y = 0, w = x0, h = y0, k = 0, steps = [], horiz = true;
      while (w > 0 && h > 0 && k < 200) {
        var s = Math.min(w, h), n = Math.floor(Math.max(w, h) / s);
        steps.push(Math.max(w, h) + ' = ' + n + ' × ' + s + ' + ' + (Math.max(w, h) - n * s));
        for (var i = 0; i < n; i++) { var rx = w >= h ? X + i * s : X, ry = w >= h ? Y : Y + i * s; el('rect', { x: ox + rx * sc, y: oy + ry * sc, width: s * sc, height: s * sc, fill: COLS[k % COLS.length] + '44', stroke: COLS[k % COLS.length], 'stroke-width': 1.5 }, svg); }
        if (w >= h) { X += n * s; w -= n * s; } else { Y += n * s; h -= n * s; }
        k++;
      }
      var g = (function gcd(p, q) { return q ? gcd(q, p % q) : p; })(x0, y0);
      if (g * sc > 6) for (var gx = 0; gx < x0; gx += g) for (var gy = 0; gy < y0; gy += g) el('rect', { x: ox + gx * sc, y: oy + gy * sc, width: g * sc, height: g * sc, fill: 'none', stroke: c.ink, 'stroke-width': 0.4, opacity: 0.35 }, svg);
      legend(svg, c, fs, W, 'cut off the largest squares you can, then repeat on the leftover strip, until nothing is left', 'cut off squares, repeat on the leftover');
      out.innerHTML = 'Greatest common divisor of ' + x0 + ' and ' + y0 + ': <strong>' + g + '</strong>' + (g === 1 ? ' (the numbers are coprime)' : '') + '. Steps: ' + steps.join('; ') + '.' + NOTE + 'This is the procedure of <em>Elements</em> VII.1–2: repeatedly take away the smaller from the larger. The last nonzero remainder is the largest unit that measures both lengths exactly; the faint grid shows it. If the procedure never stopped, the lengths would be incommensurable, like the side and diagonal of a square (Part 1). Donald Knuth called it the oldest nontrivial algorithm still in use.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the law of the lever
     ----------------------------------------------------------------------- */
  FIG['fig-lever'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var m1 = 3, d1 = 2, m2 = 1, d2 = 5;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'lv-m1', label: 'Left weight', min: 1, max: 10, step: 1, value: m1, onChange: function (x) { m1 = x; draw(); } });
    FIG.slider(controls, { id: 'lv-d1', label: 'Left distance', min: 1, max: 6, step: 1, value: d1, onChange: function (x) { d1 = x; draw(); } });
    FIG.slider(controls, { id: 'lv-m2', label: 'Right weight', min: 1, max: 10, step: 1, value: m2, onChange: function (x) { m2 = x; draw(); } });
    FIG.slider(controls, { id: 'lv-d2', label: 'Right distance', min: 1, max: 6, step: 1, value: d2, onChange: function (x) { d2 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'A balance beam with weights on each side'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, cy = 150, u = Math.min(36, (W - 60) / 13), t1 = m1 * d1, t2 = m2 * d2, ang = Math.max(-14, Math.min(14, (t2 - t1) * 2)) * Math.PI / 180;
      el('path', { d: 'M' + cx + ' ' + cy + 'L' + (cx - 20) + ' ' + (cy + 60) + 'L' + (cx + 20) + ' ' + (cy + 60) + 'Z', fill: c.muted + '66', stroke: c.muted }, svg);
      el('line', { x1: 30, y1: cy + 60, x2: W - 30, y2: cy + 60, stroke: c.border, 'stroke-width': 2 }, svg);
      var g = el('g', { transform: 'rotate(' + (ang * 180 / Math.PI) + ' ' + cx + ' ' + cy + ')' }, svg);
      el('rect', { x: cx - 6.5 * u, y: cy - 4, width: 13 * u, height: 8, rx: 3, fill: AMBER }, g);
      for (var k = -6; k <= 6; k++) el('line', { x1: cx + k * u, y1: cy - 4, x2: cx + k * u, y2: cy + 4, stroke: '#00000055' }, g);
      function stack(n, x, col) { for (var i = 0; i < n; i++) el('rect', { x: x - 11, y: cy - 4 - (i + 1) * 13, width: 22, height: 12, rx: 2, fill: col, stroke: '#00000033' }, g); }
      stack(m1, cx - d1 * u, BLUE); stack(m2, cx + d2 * u, RED);
      txt(svg, 10, 14, t1 === t2 ? 'balanced' : (t1 > t2 ? 'the left side goes down' : 'the right side goes down'), { anchor: 'start', size: fs(11), fill: t1 === t2 ? GREEN : c.ink2, weight: 700 });
      out.innerHTML = 'Left: ' + m1 + ' × ' + d1 + ' = <strong>' + t1 + '</strong>; right: ' + m2 + ' × ' + d2 + ' = <strong>' + t2 + '</strong>. ' + (t1 === t2 ? '<strong style="color:#16a34a">In equilibrium.</strong>' : 'Not balanced.') + NOTE + 'Archimedes proved, in <em>On the Equilibrium of Planes</em>, that weights balance at distances inversely proportional to their magnitudes. He began from postulates that seem obvious, such as “equal weights at equal distances balance”, and deduced the law like a theorem of Euclid. With a long enough lever, a small weight can balance a huge one: hence his boast, “give me a place to stand and I will move the Earth.”</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the golden crown
     ----------------------------------------------------------------------- */
  FIG['fig-crown'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var silver = 30, dia = 20, method = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'cr-s', label: 'Silver mixed into the 1 kg crown (% by mass)', min: 0, max: 50, step: 1, value: silver, onChange: function (x) { silver = x; draw(); } });
    FIG.slider(controls, { id: 'cr-d', label: 'Diameter of the water vessel (cm)', min: 8, max: 40, step: 1, value: dia, onChange: function (x) { dia = x; draw(); } });
    choice(controls, 'Test', ['Overflowing water (Vitruvius)', 'Balance under water (Galileo’s reconstruction)'], 0, function (i) { method = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var RG = 19.3, RS = 10.5;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Testing a crown for added silver'), W = A.W, svg = A.svg, fs = A.fs;
      var mg = 1000 * (1 - silver / 100), ms = 1000 * silver / 100, Vc = mg / RG + ms / RS, Vg = 1000 / RG, area = Math.PI * dia * dia / 4, dh = (Vc - Vg) / area * 10;
      if (method === 0) {
        [[Vg, 'pure gold, 1 kg', AMBER], [Vc, 'the crown, 1 kg', BLUE]].forEach(function (o, i) {
          var x = W * (i ? 0.72 : 0.28), w = Math.min(140, W * 0.3), h = 150, top = 60, lvl = top + 90 - o[0] / area * 2.2;
          el('rect', { x: x - w / 2, y: top, width: w, height: h, fill: 'none', stroke: c.muted, 'stroke-width': 2 }, svg);
          el('rect', { x: x - w / 2 + 2, y: lvl, width: w - 4, height: top + h - lvl - 2, fill: BLUE + '33' }, svg);
          el('circle', { cx: x, cy: top + h - 30, r: 10 + Math.cbrt(o[0]) * 2.4, fill: o[2], opacity: 0.85 }, svg);
          txt(svg, x, top + h + 20, (W < 560 ? (i ? 'crown ' : 'gold ') : o[1] + ': ') + fmt(o[0], 1) + ' cm³', { size: fs(10), fill: c.ink2 });
        });
        txt(svg, 10, 14, (W < 560 ? 'rise difference ' : 'water rise difference: ') + fmt(dh, 2) + ' mm' + (W < 560 ? '' : ' (exaggerated in the drawing)'), { anchor: 'start', size: fs(10), fill: c.ink2, weight: 700 });
      } else {
        var cx = W / 2, cy = 70, buoyC = Vc, buoyG = Vg, tilt = Math.max(-12, Math.min(12, (buoyC - buoyG) * 0.8));
        var g = el('g', { transform: 'rotate(' + (-tilt) + ' ' + cx + ' ' + cy + ')' }, svg);
        el('rect', { x: cx - 130, y: cy - 3, width: 260, height: 6, fill: c.ink2 }, g);
        el('line', { x1: cx - 120, y1: cy, x2: cx - 120, y2: cy + 90, stroke: c.muted }, g); el('line', { x1: cx + 120, y1: cy, x2: cx + 120, y2: cy + 90, stroke: c.muted }, g);
        el('circle', { cx: cx - 120, cy: cy + 100, r: 12 + Math.cbrt(Vg) * 2, fill: AMBER }, g); el('circle', { cx: cx + 120, cy: cy + 100, r: 12 + Math.cbrt(Vc) * 2, fill: BLUE }, g);
        el('rect', { x: 20, y: cy + 70, width: W - 40, height: 120, fill: BLUE + '18' }, svg);
        el('path', { d: 'M' + cx + ' ' + cy + 'l-12 30h24z', fill: c.muted }, svg);
        txt(svg, 10, 14, silver ? 'under water the crown rises: it is bulkier, so the water pushes it up harder' : 'balanced in air and under water: same density as gold', { anchor: 'start', size: fs(10), fill: c.ink2, weight: 700 });
        txt(svg, cx - 120, 250, 'gold 1 kg', { size: fs(10), fill: c.ink2 }); txt(svg, cx + 120, 250, 'crown 1 kg', { size: fs(10), fill: c.ink2 });
      }
      var bd = (Vc - Vg);
      out.innerHTML = 'Crown volume ' + fmt(Vc, 1) + ' cm³ versus ' + fmt(Vg, 1) + ' cm³ for pure gold: ' + fmt(bd, 1) + ' cm³ more. In a ' + dia + ' cm vessel the water rises only <strong>' + fmt(dh, 2) + ' mm</strong> more, hard to see; but under water the crown is buoyed up by an extra <strong>' + fmt(bd, 1) + ' g</strong>, easy to detect on a balance.' + NOTE + 'Archimedes’ principle (<em>On Floating Bodies</em>): a body in a fluid is pushed up by a force equal to the weight of fluid it displaces. A crown with silver has the same weight but a larger volume, because silver (10.5 g/cm³) is much less dense than gold (19.3 g/cm³). In 1586 the young Galileo argued that Archimedes would have used a balance rather than overflowing water, which is far too crude.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: trapping pi between polygons
     ----------------------------------------------------------------------- */
  FIG['fig-pi'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pi-k', label: 'Number of sides (6 × 2ⁿ)', min: 0, max: 6, step: 1, value: k, onChange: function (x) { k = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Polygons inside and outside a circle'), W = A.W, svg = A.svg, fs = A.fs;
      var n = 6 * Math.pow(2, k), r = Math.min(120, W * 0.3), cx = W < 560 ? W / 2 : W * 0.32, cy = 160;
      var inner = '', outer = '', R2 = r / Math.cos(Math.PI / n);
      for (var i = 0; i <= n; i++) { var t = 2 * Math.PI * i / n - Math.PI / 2; inner += (i ? 'L' : 'M') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1); outer += (i ? 'L' : 'M') + (cx + R2 * Math.cos(t + Math.PI / n)).toFixed(1) + ' ' + (cy + R2 * Math.sin(t + Math.PI / n)).toFixed(1); }
      el('path', { d: outer, fill: AMBER + '22', stroke: AMBER, 'stroke-width': 1.5 }, svg);
      el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: c.ink, 'stroke-width': 2 }, svg);
      el('path', { d: inner, fill: MC + '22', stroke: MC, 'stroke-width': 1.5 }, svg);
      var lo = n * Math.sin(Math.PI / n), hi = n * Math.tan(Math.PI / n);
      if (W >= 560) {
        var tx = W * 0.62; [['sides', 0], ['lower bound', 70], ['upper bound', 170]].forEach(function (h) { txt(svg, tx + h[1], 50, h[0], { anchor: 'start', size: fs(10), fill: c.muted }); });
        for (var j = 0; j <= 6; j++) { var nn = 6 * Math.pow(2, j), st = { anchor: 'start', size: fs(10), fill: j === k ? c.ink : c.muted, weight: j === k ? 700 : 400 }; txt(svg, tx, 74 + j * 22, String(nn), st); txt(svg, tx + 70, 74 + j * 22, (nn * Math.sin(Math.PI / nn)).toFixed(5), st); txt(svg, tx + 170, 74 + j * 22, (nn * Math.tan(Math.PI / nn)).toFixed(5), st); }
      }
      legend(svg, c, fs, W, 'teal: inscribed polygon (shorter than the circle) · amber: circumscribed polygon (longer)', 'teal inside · amber outside');
      out.innerHTML = 'With <strong>' + n + ' sides</strong>: ' + lo.toFixed(5) + ' &lt; π &lt; ' + hi.toFixed(5) + ' (gap ' + (hi - lo).toFixed(5) + ').' + NOTE + 'In <em>Measurement of a Circle</em>, Archimedes started with hexagons and doubled the number of sides four times, to 96, computing each step with hand-calculated square roots that he always rounded in the safe direction. He concluded that π lies between 3 10/71 ≈ 3.14085 and 3 1/7 ≈ 3.14286. Squeezing an unknown quantity between two calculable bounds that close in on it is the idea behind the limits of calculus.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Where did Euclid work?', options: ['Athens', 'Alexandria', 'Syracuse', 'Rome'], answer: 1, explanation: 'Probably around 300 BCE, under the early Ptolemies.' },
      { question: 'What is a postulate in Euclid’s Elements?', options: ['A proved theorem', 'A starting assumption accepted without proof', 'A diagram', 'An experiment'], answer: 1, explanation: 'Five postulates, plus definitions and common notions.' },
      { question: 'Which postulate troubled mathematicians for two thousand years?', options: ['Any two points can be joined by a line', 'All right angles are equal', 'The parallel postulate', 'A circle can be drawn with any centre'], answer: 2, explanation: 'Its independence led to non-Euclidean geometry in the 1800s.' },
      { question: 'Euclid proved that the prime numbers are…', options: ['Finite in number', 'More numerous than any given amount', 'All odd', 'Evenly spaced'], answer: 1, explanation: 'Elements IX.20.' },
      { question: 'The Euclidean algorithm finds…', options: ['Square roots', 'The greatest common divisor of two numbers', 'The area of a circle', 'Prime factors directly'], answer: 1, explanation: 'Repeatedly subtract the smaller from the larger.' },
      { question: 'By the law of the lever, 2 kg at 3 m balances how much at 1 m on the other side?', options: ['2 kg', '3 kg', '6 kg', '1.5 kg'], answer: 2, explanation: '2 × 3 = 6 × 1.' },
      { question: 'Archimedes’ principle says the upward force on a submerged body equals…', options: ['Its own weight', 'The weight of the fluid it displaces', 'Its volume', 'The depth'], answer: 1, explanation: 'From On Floating Bodies.' },
      { question: 'Archimedes showed that π lies between…', options: ['3 and 4', '3 10/71 and 3 1/7', '3.1 and 3.2', '22/7 and 3.15'], answer: 1, explanation: 'Using 96-sided polygons.' },
      { question: 'The story of Archimedes shouting “Eureka” in the bath comes from…', options: ['Archimedes himself', 'Vitruvius, writing about two centuries later', 'Euclid', 'Galileo'], answer: 1, explanation: 'De architectura, Book IX.' },
      { question: 'Where was the only copy of Archimedes’ Method found?', options: ['In the Library of Alexandria', 'Under the text of a medieval prayer book (a palimpsest)', 'In a tomb', 'In Cicero’s letters'], answer: 1, explanation: 'Identified by Heiberg in 1906.' }
    ]);
  };
})();
