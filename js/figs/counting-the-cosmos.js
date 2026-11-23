/* ==========================================================================
   RNLearn — Counting the Cosmos (How We Measured the Universe, Part 11)
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
    { name: 'Counting stars', color: '#b45309' },
    { name: 'Counting galaxies', color: '#0e7490' },
    { name: 'Weighing the unseen', color: '#7c3aed' }
  ];
  var EVENTS = [
    { year: 'c. 150', icon: '📜', era: 0, sec: 3, title: 'Ptolemy’s catalogue', text: 'Ptolemy’s Almagest lists the positions and brightnesses of 1,022 stars.' },
    { year: '1785', icon: '🔭', era: 0, sec: 4, title: 'Star gauges', text: 'William Herschel counts stars in sample fields across the sky to map the Milky Way.' },
    { year: '1906', icon: '🧩', era: 0, sec: 4, title: 'Selected Areas', text: 'Jacobus Kapteyn proposes counting stars in 206 sample areas spread over the sky, rather than everywhere.' },
    { year: '1933', icon: '❓', era: 2, sec: 9, title: 'Zwicky’s missing mass', text: 'Fritz Zwicky finds that galaxies in the Coma cluster move far too fast to be held by the mass of their stars.' },
    { year: '1970', icon: '🌀', era: 2, sec: 10, title: 'Andromeda’s rotation', text: 'Vera Rubin and Kent Ford measure Andromeda’s rotation out to its faint outskirts.' },
    { year: '1980', icon: '📈', era: 2, sec: 10, title: 'Flat rotation curves', text: 'Rubin, Ford and Norbert Thonnard show that stars far out in spiral galaxies orbit as fast as those near the centre.' },
    { year: '1995', icon: '🖼️', era: 1, sec: 7, title: 'Hubble Deep Field', text: 'Hubble stares at a tiny, apparently empty patch of sky for ten days and finds about 3,000 galaxies.' },
    { year: '2004', icon: '🔍', era: 1, sec: 7, title: 'Ultra Deep Field', text: 'An even deeper image shows about 10,000 galaxies in a patch a tenth the width of the full Moon.' },
    { year: '2006', icon: '💥', era: 2, sec: 11, title: 'The Bullet Cluster', text: 'In two colliding clusters, the mass mapped by gravitational lensing is separated from the hot gas: strong evidence for dark matter.' },
    { year: '2016', icon: '🔢', era: 1, sec: 8, title: 'Two trillion?', text: 'A study estimates that there are about two trillion galaxies in the observable universe, ten times more than before.' },
    { year: '2021', icon: '🛰️', era: 1, sec: 8, title: 'Hundreds of billions', text: 'Measurements of the faint glow of the sky from New Horizons, far beyond Pluto, suggest the number is hundreds of billions after all.' },
    { year: '2022', icon: '🌌', era: 0, sec: 6, title: 'Gaia’s census', text: 'Gaia’s third data release catalogues about 1.8 billion objects: roughly 1% of the stars in the Milky Way.' }
  ];
  FIG['fig-mu11-timeline'] = function (figEl) {
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
  var MU = '#0e7490';
  function bigN(n) { return n >= 1e12 ? fmt(n / 1e12, 1) + ' trillion' : n >= 1e9 ? fmt(n / 1e9, 0) + ' billion' : n >= 1e6 ? fmt(n / 1e6, 1) + ' million' : fmt(n, 0); }

  /* -----------------------------------------------------------------------
     Figure: weigh the Milky Way, then count its stars
     ----------------------------------------------------------------------- */
  FIG['fig-weigh-galaxy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var v = 230, fStar = 0.5, mAvg = 0.4;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'wg-v', label: 'Sun’s orbital speed (km/s)', min: 180, max: 270, step: 5, value: v, onChange: function (x) { v = x; draw(); } });
    FIG.slider(controls, { id: 'wg-f', label: 'Fraction of that mass in stars', min: 0.2, max: 1, step: 0.05, value: fStar, onChange: function (x) { fStar = x; draw(); } });
    FIG.slider(controls, { id: 'wg-m', label: 'Average star mass (Suns)', min: 0.2, max: 1, step: 0.05, value: mAvg, onChange: function (x) { mAvg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 600 ? 245 : 160, 'Steps from the Sun’s orbital speed to the mass of the Galaxy inside its orbit and the number of stars'), W = A.W, svg = A.svg, fs = A.fs;
      var r = 8.2 * 3.086e19, G = 6.674e-11, Msun = 1.989e30, M = (v * 1000) * (v * 1000) * r / G / Msun, N = M * fStar / mAvg;
      var steps = [['Orbital speed', v + ' km/s'], ['Mass inside the Sun’s orbit', bigN(M) + ' Suns'], ['Mass in stars', bigN(M * fStar) + ' Suns'], ['Number of stars', bigN(N)]];
      var narrow = W < 600, cols = narrow ? 2 : 4, bw = (W - 20) / cols;
      steps.forEach(function (s, i) {
        var col = i % cols, rowi = Math.floor(i / cols), x = 10 + col * bw, y = 30 + rowi * 85;
        el('rect', { x: x + 4, y: y, width: bw - 8, height: 70, rx: 8, fill: i === 3 ? MU : c.surface, stroke: i === 3 ? MU : c.border }, svg);
        txt(svg, x + bw / 2, y + 26, s[0], { size: fs(9), fill: i === 3 ? '#fff' : c.muted });
        txt(svg, x + bw / 2, y + 52, s[1], { size: fs(11), fill: i === 3 ? '#fff' : c.ink, weight: 700 });
        if (col < cols - 1) txt(svg, x + bw, y + 40, '→', { size: fs(14), fill: c.muted });
      });
      txt(svg, W / 2, W < 600 ? 230 : 140, 'M = v² r / G, with r = 8.2 kpc (26,700 light-years)', { size: fs(10), fill: c.muted });
      out.innerHTML = 'Estimate: about <strong>' + bigN(N) + ' stars</strong>.' + NOTE + 'The Sun orbits the centre of the Galaxy once every 230 million years or so. The speed needed to stay in orbit depends on how much mass is pulling inwards, exactly as the Moon’s orbit weighs the Earth (Part 6): <em>M</em> = <em>v</em>²<em>r</em>/<em>G</em>. This gives the mass inside the Sun’s orbit, about a hundred billion Suns. Part of it is gas and dark matter, and most stars are red dwarfs much lighter than the Sun, so the answer depends on two uncertain fractions. That is why published estimates range from about 100 to 400 billion stars. (The Galaxy’s total mass, including the dark matter far outside the Sun’s orbit, is about ten times larger.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: rotation curves
     ----------------------------------------------------------------------- */
  FIG['fig-rotation-curve'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var halo = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rc-h', label: 'Add an invisible halo (mass within 30 kpc, × visible mass)', min: 0, max: 6, step: 0.25, value: halo, onChange: function (x) { halo = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var rd = 3, Mvis = 6e10, Gk = 4.30e-6;
    function vVis(r) { var x = r / rd, m = Mvis * (1 - Math.exp(-x) * (1 + x)); return Math.sqrt(Gk * m / Math.max(r, 0.05)); }
    function vHalo(r, h) { if (!h) return 0; var a = 5, M30 = h * Mvis, rho = M30 / (30 - a * Math.atan(30 / a)), m = rho * (r - a * Math.atan(r / a)); return Math.sqrt(Gk * m / Math.max(r, 0.05)); }
    var rng = rngSeed(41), OBS = []; for (var r = 2; r <= 30; r += 2) OBS.push([r, Math.sqrt(vVis(r) * vVis(r) + vHalo(r, 3) * vHalo(r, 3)) * (1 + (rng() - 0.5) * 0.06)]);
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Orbital speed against distance from the centre of a spiral galaxy: observed points stay flat while the curve from visible matter falls'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 16, T: 26, B: 250, xl: 0, xh: 32, yl: 0, yh: 320, xticks: [0, 10, 20, 30], yticks: [0, 100, 200, 300], xlab: 'distance from the centre (kpc)', ylab: 'orbital speed (km/s)' });
      if (halo) plotLine(svg, P, function (r) { return vHalo(r, halo); }, 0.2, 32, 120, PURPLE, 1.5, '2 3');
      plotLine(svg, P, function (r) { return Math.sqrt(vVis(r) * vVis(r) + vHalo(r, halo) * vHalo(r, halo)); }, 0.2, 32, 120, MU, 2.5);
      plotLine(svg, P, vVis, 0.2, 32, 120, AMBER, 2, '6 4');
      OBS.forEach(function (o) { el('circle', { cx: P.X(o[0]), cy: P.Y(o[1]), r: 4, fill: c.ink }, svg); });
      legend(svg, c, fs, W, 'dots: measured speeds (simulated) · amber dashed: stars and gas only · purple: halo · teal: total', 'dots: measured · amber: visible · teal: total');
      var err = 0; OBS.forEach(function (o) { var m = Math.sqrt(vVis(o[0]) * vVis(o[0]) + vHalo(o[0], halo) * vHalo(o[0], halo)); err += Math.pow(m - o[1], 2); });
      var rms = Math.sqrt(err / OBS.length);
      out.innerHTML = 'Mismatch with the measured speeds: <strong>' + fmt(rms, 0) + ' km/s</strong> (typical). ' + (rms < 12 ? '<strong>A good fit</strong>: the halo outweighs the visible galaxy.' : 'Try adding more unseen mass.') + NOTE + 'If a galaxy’s mass were where its light is, stars far from the bright centre should orbit more slowly, as the outer planets do around the Sun. Vera Rubin and her colleagues found instead that the speeds stay roughly constant far into the faint outskirts, and radio astronomers using the 21-cm line of hydrogen gas found the same even farther out. The extra pull requires a large, roughly spherical halo of unseen matter. The galaxy and data here are simulated, but shaped like real ones.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: will the cluster hold together?
     ----------------------------------------------------------------------- */
  FIG['fig-cluster-escape'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mult = 1, gals = [], t = 0, svg, dots = [], geo;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ce-m', label: 'Cluster mass (× the mass of its visible stars)', min: 1, max: 30, step: 1, value: mult, onChange: function (x) { mult = x; reset(); } });
    var row = group(controls, 'Simulation'); btn('Restart', row).addEventListener('click', reset);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var rng0 = rngSeed(77), INIT = [];
    for (var i = 0; i < 40; i++) { var r = 0.15 + 0.85 * Math.sqrt(rng0()), a = rng0() * 2 * Math.PI, sp = 0.55 * (0.6 + 0.8 * rng0()), b = rng0() * 2 * Math.PI; INIT.push([r * Math.cos(a), r * Math.sin(a), sp * Math.cos(b), sp * Math.sin(b)]); }
    function reset() { gals = INIT.map(function (g) { return g.slice(); }); t = 0; draw(); }
    function acc(x, y) { var GM = 0.015 * mult, eps = 0.3, d2 = x * x + y * y + eps * eps, f = -GM / Math.pow(d2, 1.5); return [f * x, f * y]; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Galaxies moving in a cluster; with too little mass they fly apart'); svg = A.svg; var W = A.W, fs = A.fs;
      geo = { cx: W / 2, cy: 150, s: Math.min(W, 300) / 4.6 };
      el('circle', { cx: geo.cx, cy: geo.cy, r: geo.s, fill: c.border, opacity: 0.3 }, svg);
      txt(svg, geo.cx, geo.cy + geo.s + 16, 'starting size of the cluster', { size: fs(9), fill: c.muted });
      dots = gals.map(function () { return el('circle', { r: 3.5, fill: AMBER, stroke: c.ink, 'stroke-width': 0.4 }, svg); });
      place(); report();
    }
    function place() { gals.forEach(function (g, i) { dots[i].setAttribute('cx', (geo.cx + g[0] * geo.s).toFixed(1)); dots[i].setAttribute('cy', (geo.cy + g[1] * geo.s).toFixed(1)); }); }
    function report() {
      var inside = gals.filter(function (g) { return Math.hypot(g[0], g[1]) < 1.6; }).length;
      out.innerHTML = 'Galaxies still within the cluster region: <strong>' + inside + ' of ' + gals.length + '</strong>.' + NOTE + 'The galaxies start with random speeds like those Zwicky measured in the Coma cluster, around 1,000 km/s. Each is pulled by the cluster’s total mass. With only the mass of the visible stars, the cluster flies apart in a short time, yet real clusters are clearly old, stable systems. To hold them together, clusters need many times more mass than their stars provide; hot X-ray-emitting gas supplies some of it, but most is dark matter. (This is a simplified model with the mass fixed at the centre.)</span>';
    }
    reset();
    FIG.animate(figEl, function () {
      if (!dots.length || t > 2400) return;
      for (var k = 0; k < 4; k++) { gals.forEach(function (g) { var dt = 0.01, a1 = acc(g[0], g[1]); g[2] += a1[0] * dt / 2; g[3] += a1[1] * dt / 2; g[0] += g[2] * dt; g[1] += g[3] * dt; var a2 = acc(g[0], g[1]); g[2] += a2[0] * dt / 2; g[3] += a2[1] * dt / 2; }); t++; }
      place(); if (t % 20 === 0) report();
    });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: estimate the number of stars by counting a small square
     ----------------------------------------------------------------------- */
  FIG['fig-count-patch'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var seed = 1, clumpy = 0, samples = [], N = 1200, STARS = [];
    var controls = div('fig-controls', container);
    choice(controls, 'Sky', ['Even', 'Clumpy (like the Milky Way)'], 0, function (i) { clumpy = i; make(); });
    var row = group(controls, 'Sampling'); var bS = btn('Count a random square', row), bC = btn('Clear', row), bN = btn('New sky', row);
    bS.addEventListener('click', function () { var x = Math.random() * 0.9, y = Math.random() * 0.9; var n = STARS.filter(function (s) { return s[0] >= x && s[0] < x + 0.1 && s[1] >= y && s[1] < y + 0.1; }).length; samples.push([x, y, n]); draw(); });
    bC.addEventListener('click', function () { samples = []; draw(); });
    bN.addEventListener('click', function () { seed++; make(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function make() {
      var r = rngSeed(seed * 13 + clumpy), n = clumpy ? 1000 + Math.floor(r() * 600) : 900 + Math.floor(r() * 600); STARS = [];
      for (var i = 0; i < n; i++) { if (clumpy) { var y = 0.5 + 0.13 * gaussR(r) + 0.15 * Math.sin(6 * r()), x = r(); if (r() < 0.25) y = r(); STARS.push([x, Math.min(0.999, Math.max(0, y))]); } else STARS.push([r(), r()]); }
      N = STARS.length; samples = []; draw();
    }
    function gaussR(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 320, 'A field of stars with sample squares; counting the squares and scaling up estimates the total'), W = A.W, svg = A.svg, fs = A.fs;
      var S = Math.min(W - 20, 300), x0 = (W - S) / 2, y0 = 10;
      el('rect', { x: x0, y: y0, width: S, height: S, fill: '#0b1020' }, svg);
      STARS.forEach(function (s) { el('circle', { cx: x0 + s[0] * S, cy: y0 + s[1] * S, r: 0.9, fill: '#e5e7eb' }, svg); });
      samples.forEach(function (sm, i) { el('rect', { x: x0 + sm[0] * S, y: y0 + sm[1] * S, width: S * 0.1, height: S * 0.1, fill: 'none', stroke: i === samples.length - 1 ? '#facc15' : '#38bdf8', 'stroke-width': 1.5 }, svg); });
      var m = samples.length ? samples.reduce(function (a, b) { return a + b[2]; }, 0) / samples.length : 0, est = m * 100;
      out.innerHTML = samples.length ? 'Last square: <strong>' + samples[samples.length - 1][2] + '</strong> stars. Average of ' + samples.length + ' square' + (samples.length > 1 ? 's' : '') + ': ' + fmt(m, 1) + ' × 100 squares = <strong>' + fmt(est, 0) + '</strong> stars. True number: <strong>' + N + '</strong> (' + (est >= N ? '+' : '') + fmt(100 * (est - N) / N, 0) + '%).' + NOTE + 'Each square covers 1% of the field, so the total is about 100 times the average count. More squares give a better estimate. On a clumpy sky, a few squares can land all in the dense band or all outside it, so you need more of them, spread evenly: that is why Kapteyn chose his Selected Areas systematically across the whole sky.</span>' : 'Press “Count a random square” to sample 1% of the sky.';
    }
    make();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m11'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Roughly how many stars can be seen with the naked eye over the whole sky?', options: ['About 500', 'About 9,000', 'About a million', 'About 100 billion'], answer: 1, explanation: 'Only a few thousand are above the horizon at once.' },
      { question: 'Why did Kapteyn propose counting stars only in “Selected Areas”?', options: ['To save effort while sampling the whole sky fairly', 'Because other areas had no stars', 'To find planets', 'To measure parallax'], answer: 0, explanation: 'Sampling, as in an opinion poll.' },
      { question: 'How can the Sun’s orbital speed tell us the Galaxy’s mass?', options: ['Faster orbits need more mass pulling inwards', 'It cannot', 'Faster orbits mean less mass', 'Through the Sun’s temperature'], answer: 0, explanation: 'M = v²r/G.' },
      { question: 'About how many stars are in the Milky Way?', options: ['About 1 million', 'About 1 billion', '100–400 billion', 'About 10 trillion'], answer: 2, explanation: 'The range reflects uncertainty about faint stars and dark matter.' },
      { question: 'What did the Hubble Deep Field (1995) show?', options: ['A black hole', 'About 3,000 galaxies in a tiny, apparently empty patch', 'A new planet', 'The edge of the universe'], answer: 1, explanation: 'Scaling up gave tens of billions of galaxies, later more.' },
      { question: 'Why was the 2016 estimate of two trillion galaxies revised?', options: ['Telescopes broke', 'The faint glow of the sky measured by New Horizons left little room for so many unseen galaxies', 'Galaxies merged', 'It was a typing error'], answer: 1, explanation: 'Current estimates are hundreds of billions.' },
      { question: 'What did Zwicky find in the Coma cluster in 1933?', options: ['Galaxies moving too fast to be held by their visible mass', 'A supernova', 'Cepheids', 'The cluster is shrinking'], answer: 0, explanation: 'He called the missing mass “dunkle Materie”.' },
      { question: 'What is a “flat rotation curve”?', options: ['A galaxy with no rotation', 'Orbital speeds that stay about constant far from a galaxy’s centre', 'A flat galaxy', 'A curve on a graph of brightness'], answer: 1, explanation: 'Visible matter alone predicts falling speeds.' },
      { question: 'Why is the Bullet Cluster important?', options: ['It is the nearest cluster', 'Its mass, mapped by lensing, is separated from its hot gas', 'It contains the oldest stars', 'It is moving at light speed'], answer: 1, explanation: 'Hard to explain without dark matter.' },
      { question: 'What fraction of the universe’s content is ordinary matter?', options: ['About 5%', 'About 27%', 'About 68%', 'About 100%'], answer: 0, explanation: 'Dark matter is about 27% and dark energy about 68%.' }
    ]);
  };
})();
