/* ==========================================================================
   RNLearn — Marie Curie and Ernst Mach (Minds That Changed How We Know, Part 9)
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
    { name: 'The sceptic', color: '#b45309' },
    { name: 'Radioactivity', color: '#1d4ed8' },
    { name: 'Atoms made real', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1838', icon: '👶', era: 0, sec: 3, title: 'Mach born', text: 'Ernst Mach is born in Chrlice, Moravia (now in the Czech Republic).' },
    { year: '1867', icon: '👶', era: 1, sec: 6, title: 'Maria Skłodowska born', text: 'Maria Skłodowska, later Marie Curie, is born in Warsaw, then under Russian rule.' },
    { year: '1883', icon: '📘', era: 0, sec: 4, title: 'The Science of Mechanics', text: 'Mach’s critical history of mechanics attacks Newton’s absolute space and calls for science to describe only what can be observed.' },
    { year: '1887', icon: '💥', era: 0, sec: 5, title: 'Photographing shock waves', text: 'Mach and Peter Salcher photograph the shock waves around a supersonic bullet.' },
    { year: '1896', icon: '☢️', era: 1, sec: 7, title: 'Becquerel’s rays', text: 'Henri Becquerel finds that uranium salts emit penetrating rays that fog photographic plates.' },
    { year: '1898', icon: '⚗️', era: 1, sec: 7, title: 'Polonium and radium', text: 'Marie and Pierre Curie announce two new radioactive elements, polonium (July) and radium (December).' },
    { year: '1903', icon: '🏅', era: 1, sec: 8, title: 'First Nobel Prize', text: 'Marie Curie, Pierre Curie and Becquerel share the Nobel Prize in Physics; she is the first woman to win one.' },
    { year: '1905', icon: '🔬', era: 2, sec: 10, title: 'Einstein on Brownian motion', text: 'Einstein predicts how far suspended particles should wander if liquids are made of molecules.' },
    { year: '1908–09', icon: '📏', era: 2, sec: 10, title: 'Perrin counts atoms', text: 'Jean Perrin measures Brownian motion and sedimentation, confirming Einstein and determining Avogadro’s number.' },
    { year: '1911', icon: '🏅', era: 1, sec: 9, title: 'Second Nobel Prize', text: 'Marie Curie wins the Nobel Prize in Chemistry for discovering radium and polonium.' },
    { year: '1916', icon: '🪦', era: 0, sec: 12, title: 'Mach dies', text: 'Mach dies near Munich, still doubtful about atoms.' },
    { year: '1934', icon: '🪦', era: 1, sec: 12, title: 'Curie dies', text: 'Marie Curie dies of aplastic anaemia, probably caused by years of radiation exposure.' }
  ];

  FIG['fig-m9-timeline'] = function (figEl) {
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
     Figure: random decay and the half-life
     ----------------------------------------------------------------------- */
  FIG['fig-decay'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N0 = 400, hl = 5, seed = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dc-n', label: 'Number of atoms', min: 10, max: 2000, step: 10, value: N0, onChange: function (x) { N0 = x; draw(); } });
    FIG.slider(controls, { id: 'dc-h', label: 'Half-life (time steps)', min: 1, max: 20, step: 1, value: hl, onChange: function (x) { hl = x; draw(); } });
    var row = group(controls, 'Chance'); btn('Run again', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Number of undecayed atoms against time'), W = A.W, svg = A.svg, fs = A.fs, T = 4 * hl, p = 1 - Math.pow(0.5, 1 / hl), r = rngSeed(seed * 7 + N0);
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: T, yl: 0, yh: N0, xticks: [0, hl, 2 * hl, 3 * hl, 4 * hl], yticks: [0, N0 / 4, N0 / 2, N0], yfmt: function (v) { return fmt(v, 0); }, xlab: 'time (steps)', ylab: 'atoms remaining' });
      plotLine(svg, P, function (t) { return N0 * Math.pow(0.5, t / hl); }, 0, T, 120, MC, 2, '5 3');
      var n = N0, d = 'M' + P.X(0) + ' ' + P.Y(n), first = -1, firstAt = '—';
      for (var t = 1; t <= T; t++) { var dec = 0; for (var i = 0; i < n; i++) if (r() < p) dec++; n -= dec; d += 'L' + P.X(t) + ' ' + P.Y(n + dec) + 'L' + P.X(t) + ' ' + P.Y(n); }
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, svg);
      [1, 2, 3].forEach(function (k) { el('line', { x1: P.X(k * hl), y1: P.Y(N0 * Math.pow(0.5, k)), x2: P.X(k * hl), y2: P.Y(0), stroke: c.border, 'stroke-dasharray': '2 3' }, svg); });
      legend(svg, c, fs, W, 'amber: one random run · dashed: N₀ × (½)^(t / half-life)', 'amber: random run · dashed: exponential');
      out.innerHTML = 'Each atom has the same chance, ' + fmt(p * 100, 1) + '% per step, of decaying, whatever its age and whatever its neighbours do. After one half-life, about half remain; after two, a quarter.' + NOTE + 'Marie Curie showed that the intensity of uranium’s rays depends only on the amount of uranium, not on its chemical form, temperature or light: the radiation comes from inside the atoms themselves. In 1902 Ernest Rutherford and Frederick Soddy showed that radioactive atoms transform into other elements at a characteristic rate. Individual decays are unpredictable, yet large numbers follow the exponential law exactly; with few atoms, chance fluctuations are obvious. Press “Run again” with 20 atoms.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Brownian motion
     ----------------------------------------------------------------------- */
  FIG['fig-brownian'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 0.5, T = 293, seed = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'br-a', label: 'Particle radius (µm)', min: 0.2, max: 3, step: 0.1, value: a, onChange: function (x) { a = x; draw(); } });
    FIG.slider(controls, { id: 'br-t', label: 'Water temperature (K)', min: 275, max: 365, step: 5, value: T, onChange: function (x) { T = x; draw(); } });
    var row = group(controls, 'Particles'); btn('New particles', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var kB = 1.380649e-23;
    function eta(T) { return 2.414e-5 * Math.pow(10, 247.8 / (T - 140)); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 318, 'Paths of particles in water, recorded every 30 seconds'), W = A.W, svg = A.svg, fs = A.fs, r = rngSeed(seed * 17 + 3);
      var D = kB * T / (6 * Math.PI * eta(T) * a * 1e-6), dt = 30, sig = Math.sqrt(2 * D * dt) * 1e6, box = Math.min(W - 40, 260), sc = box / 60, cx = W / 2, cy = 155;
      el('rect', { x: cx - box / 2, y: cy - 130, width: box, height: 260, fill: c.surface, stroke: c.border }, svg);
      for (var g = -30; g <= 30; g += 10) { el('line', { x1: cx + g * sc, y1: cy - 130, x2: cx + g * sc, y2: cy + 130, stroke: c.border, 'stroke-width': 0.5 }, svg); }
      var msd = 0, COLS = [MC, AMBER, PURPLE];
      COLS.forEach(function (col) { var x = 0, y = 0, d = 'M' + cx + ' ' + cy; for (var k = 0; k < 50; k++) { var u = Math.max(1e-12, r()), v = r(), z1 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v), z2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v); x += z1 * sig; y += z2 * sig; msd += z1 * z1 * sig * sig; d += 'L' + (cx + Math.max(-30, Math.min(30, x)) * sc).toFixed(1) + ' ' + (cy + Math.max(-30 * 260 / box, Math.min(30 * 260 / box, y)) * sc).toFixed(1); } el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 1.5 }, svg); });
      txt(svg, cx - box / 2, cy + 146, 'grid: 10 µm', { anchor: 'start', size: fs(9), fill: c.muted });
      legend(svg, c, fs, W, 'three particles, positions joined every 30 s, as Perrin recorded them under the microscope', 'positions every 30 s');
      out.innerHTML = 'Diffusion coefficient D = kT / (6πηa) = <strong>' + sciHTML(D * 1e12, 2) + ' µm²/s</strong>; typical step in 30 s: <strong>' + fmt(sig * Math.SQRT2, 1) + ' µm</strong>.' + NOTE + 'Tiny particles in water jiggle endlessly, as the botanist Robert Brown saw in 1827. In 1905 Einstein showed that if water is made of molecules, the particles are being kicked by them, and the mean square distance travelled should grow in proportion to time, with a rate D = RT/(6πηaN<sub>A</sub>) that depends on Avogadro’s number N<sub>A</sub>. Bigger particles and colder, more viscous water mean slower wandering. Measuring the wandering therefore counts the molecules, which is what Jean Perrin did in 1908.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Perrin's sedimentation equilibrium
     ----------------------------------------------------------------------- */
  FIG['fig-perrin'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NA = 4.0, a = 0.21;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pe-n', label: 'Try a value of Avogadro’s number (× 10²³)', min: 1, max: 12, step: 0.1, value: NA, onChange: function (x) { NA = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var R = 8.314, T = 293, g = 9.81, rhoP = 1233, rhoW = 998, OBS = [[0, 100], [30, 47], [60, 22.6], [90, 12]];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Number of particles against height in a settled suspension'), W = A.W, svg = A.svg, fs = A.fs;
      var m = 4 / 3 * Math.PI * Math.pow(a * 1e-6, 3) * (rhoP - rhoW), k = R * T / (NA * 1e23), Lh = k / (m * g) * 1e6;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 234, xl: 0, xh: 100, yl: 0, yh: 110, xticks: [0, 25, 50, 75, 100], yticks: [0, 50, 100], xlab: 'height above the lowest level counted (µm)', ylab: 'particles counted' });
      plotLine(svg, P, function (h) { return 100 * Math.exp(-h / Lh); }, 0, 100, 100, MC, 2.6);
      OBS.forEach(function (o) { el('circle', { cx: P.X(o[0]), cy: P.Y(o[1]), r: 5, fill: RED }, svg); });
      legend(svg, c, fs, W, 'red: Perrin’s counts at four heights (gamboge grains 0.21 µm in radius) · blue: prediction for your N_A', 'red: Perrin · blue: your prediction');
      var err = 0; OBS.forEach(function (o) { err += Math.pow(Math.log(100 * Math.exp(-o[0] / Lh)) - Math.log(o[1]), 2); });
      out.innerHTML = 'With N<sub>A</sub> = ' + fmt(NA, 1) + ' × 10²³, the concentration halves every <strong>' + fmt(Lh * Math.LN2, 1) + ' µm</strong>. ' + (err < 0.02 ? '<strong style="color:#16a34a">Good fit to Perrin’s counts.</strong>' : 'Adjust N<sub>A</sub> until the curve passes through the red points.') + NOTE + 'Perrin made emulsions of gamboge resin grains of carefully measured size and let them settle. Gravity pulls them down; collisions with molecules kick them up. In equilibrium their number falls exponentially with height, exactly like the air in the atmosphere, but over micrometres rather than kilometres, with a scale height kT/(m′g) that depends on Boltzmann’s constant k = R/N<sub>A</sub>. Counting grains at different heights under a microscope gave N<sub>A</sub> ≈ 6.8 × 10²³ in 1909 (modern value 6.022 × 10²³). [Counts at four levels 30 µm apart as reported by Perrin; the grain density is set so the model reproduces his result.]</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the Mach cone
     ----------------------------------------------------------------------- */
  FIG['fig-machcone'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = 1.8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mc-m', label: 'Speed of the bullet (Mach number = speed ÷ speed of sound)', min: 0.3, max: 4, step: 0.05, value: M, onChange: function (x) { M = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Sound waves emitted by a moving bullet'), W = A.W, svg = A.svg, fs = A.fs;
      var cy = 140, xb = W * 0.82, n = 10, dt = 1, vs = Math.min(22, (W * 0.7) / (n * Math.max(1, M))), cid = 'mcc' + Math.floor(Math.random() * 1e6), cpth = el('clipPath', { id: cid }, el('defs', {}, svg)); el('rect', { x: 0, y: 26, width: W, height: 234 }, cpth); var gC = el('g', { 'clip-path': 'url(#' + cid + ')' }, svg); var svg0 = svg; svg = gC;
      for (var k = 1; k <= n; k++) { var x = xb - M * vs * k * dt, r = vs * k * dt; el('circle', { cx: x, cy: cy, r: r, fill: 'none', stroke: MC, 'stroke-width': 1.2, opacity: 0.85 }, svg); }
      el('ellipse', { cx: xb, cy: cy, rx: 10, ry: 4, fill: AMBER }, svg);
      if (M > 1) { var mu = Math.asin(1 / M), L = W; el('line', { x1: xb, y1: cy, x2: xb - L * Math.cos(mu), y2: cy - L * Math.sin(mu), stroke: RED, 'stroke-width': 2 }, svg); el('line', { x1: xb, y1: cy, x2: xb - L * Math.cos(mu), y2: cy + L * Math.sin(mu), stroke: RED, 'stroke-width': 2 }, svg); }
      svg = svg0;
      legend(svg, c, fs, W, 'circles: sound emitted at equal intervals in the past · red: the shock front where they pile up', 'circles: past sound · red: shock');
      out.innerHTML = (M > 1 ? 'Supersonic: the waves pile up into a cone with half-angle μ, where sin μ = 1/M = ' + fmt(1 / M, 3) + ', so <strong>μ = ' + fmt(Math.asin(1 / M) * 180 / Math.PI, 1) + '°</strong>.' : 'Subsonic: sound runs ahead of the bullet and no shock forms.') + NOTE + 'In 1887 Mach and Peter Salcher photographed a bullet in flight, using a spark timed by the bullet itself, and saw the shock waves for the first time. The ratio of an object’s speed to the speed of sound is now called the Mach number in his honour. Mach believed in only what can be observed; his photographs made the invisible visible, yet he refused to extend the same trust to atoms.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Who coined the word “radioactivity”?', options: ['Becquerel', 'Marie Curie', 'Rutherford', 'Röntgen'], answer: 1, explanation: 'In 1898.' },
      { question: 'Marie Curie’s key observation about uranium’s rays was that their intensity depends…', options: ['On the temperature', 'Only on the amount of uranium, not its chemical form', 'On sunlight', 'On the container'], answer: 1, explanation: 'So the radiation comes from inside atoms.' },
      { question: 'Why did the Curies suspect new elements in pitchblende?', options: ['It was heavier than expected', 'It was more radioactive than its uranium content could explain', 'It glowed green', 'It was magnetic'], answer: 1, explanation: 'Leading to polonium and radium.' },
      { question: 'Marie Curie is the only person to have won Nobel Prizes in…', options: ['Physics and medicine', 'Two different sciences (physics and chemistry)', 'Peace and chemistry', 'Physics twice'], answer: 1, explanation: '1903 and 1911.' },
      { question: 'Mach’s philosophy held that science should…', options: ['Describe only relations between observable sensations', 'Seek hidden mechanisms', 'Rely on authority', 'Avoid measurement'], answer: 0, explanation: 'He doubted atoms for this reason.' },
      { question: 'The Mach number is…', options: ['The number of atoms in a mole', 'An object’s speed divided by the speed of sound', 'A unit of radioactivity', 'A temperature scale'], answer: 1, explanation: 'Named for his shock-wave work.' },
      { question: 'In Brownian motion, the mean square distance a particle travels grows…', options: ['With the square of time', 'In proportion to time', 'Exponentially', 'Not at all'], answer: 1, explanation: 'Einstein, 1905.' },
      { question: 'What did Jean Perrin’s experiments establish?', options: ['The speed of light', 'The reality of atoms, by measuring Avogadro’s number in several independent ways', 'Radioactive decay', 'The electron’s charge'], answer: 1, explanation: 'Nobel Prize 1926.' },
      { question: 'After one half-life, what fraction of a large sample of radioactive atoms remains?', options: ['All', 'Half', 'A quarter', 'None'], answer: 1, explanation: 'A quarter after two half-lives.' },
      { question: 'Mach’s criticism of Newton’s absolute space influenced…', options: ['Darwin', 'Einstein', 'Bacon', 'Curie'], answer: 1, explanation: 'Einstein called it “Mach’s principle”.' }
    ]);
  };
})();
