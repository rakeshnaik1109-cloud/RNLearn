/* ==========================================================================
   RNLearn — How Far Are the Stars? (How We Measured the Universe, Part 8)
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
    { name: 'No shift seen', color: '#b45309' },
    { name: 'The hunt', color: '#7c3aed' },
    { name: 'Measured', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: 'c. 350 BC', icon: '🏛️', era: 0, sec: 3, title: 'Aristotle’s objection', text: 'If the Earth moved, the stars should shift in the sky. No shift is seen, so the Earth must be still.' },
    { year: 'c. 250 BC', icon: '☀️', era: 0, sec: 3, title: 'Aristarchus', text: 'Aristarchus of Samos puts the Sun at the centre; Archimedes reports that he placed the stars at an immense distance, which would hide any shift.' },
    { year: '1543', icon: '📖', era: 0, sec: 4, title: 'Copernicus', text: 'Copernicus revives the moving Earth and, like Aristarchus, must make the stars extremely distant.' },
    { year: '1580s', icon: '🔭', era: 0, sec: 4, title: 'Tycho’s dilemma', text: 'Tycho Brahe measures to about one minute of arc, finds no parallax, and rejects the moving Earth.' },
    { year: '1674', icon: '❌', era: 1, sec: 5, title: 'Hooke’s claim', text: 'Robert Hooke reports a parallax for Gamma Draconis. It is not confirmed.' },
    { year: '1729', icon: '🌧️', era: 1, sec: 5, title: 'Aberration', text: 'James Bradley, hunting parallax, discovers the aberration of starlight: the first direct proof that the Earth moves.' },
    { year: '1803', icon: '♊', era: 1, sec: 6, title: 'Double stars orbit', text: 'William Herschel, also hunting parallax, finds that many double stars orbit each other.' },
    { year: '1838', icon: '🎯', era: 2, sec: 7, title: 'Bessel and 61 Cygni', text: 'Friedrich Bessel announces a parallax of 0.314″ for 61 Cygni: the first accepted distance to a star.' },
    { year: '1839', icon: '🌟', era: 2, sec: 7, title: 'Alpha Centauri', text: 'Thomas Henderson publishes the parallax of Alpha Centauri, measured at the Cape in 1832–33.' },
    { year: '1915', icon: '🔴', era: 2, sec: 10, title: 'Proxima Centauri', text: 'Robert Innes finds a faint red star near Alpha Centauri: the nearest star to the Sun.' },
    { year: '1989', icon: '🛰️', era: 2, sec: 11, title: 'Hipparcos', text: 'ESA launches Hipparcos, which measures about 118,000 stars to about a thousandth of a second of arc.' },
    { year: '2013–2025', icon: '🌌', era: 2, sec: 12, title: 'Gaia', text: 'Gaia surveys about 1.8 billion objects; its third data release (2022) gives parallaxes for about 1.5 billion.' }
  ];
  FIG['fig-mu8-timeline'] = function (figEl) {
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
  function lyFmt(v) { return v >= 100 ? fmt(v, 0) : fmt(v, 1); }

  /* -----------------------------------------------------------------------
     Figure: stellar parallax as the Earth orbits the Sun
     ----------------------------------------------------------------------- */
  FIG['fig-stellar-parallax'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lgLy = 1.06, month = 0, running = false;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'sp-d', label: 'Distance to the star (light-years)', min: 0.62, max: 3, step: 0.01, value: lgLy, onChange: function (x) { lgLy = x; valText(sl, lyFmt(Math.pow(10, x))); draw(); } });
    valText(sl, lyFmt(Math.pow(10, lgLy)));
    var sm = FIG.slider(controls, { id: 'sp-m', label: 'Months since January', min: 0, max: 12, step: 0.1, value: 0, onChange: function (x) { month = x; draw(); } });
    var row = group(controls, 'Orbit'); var bP = btn('Play the year', row);
    bP.addEventListener('click', function () { running = !running; bP.textContent = running ? 'Pause' : 'Play the year'; });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 340, 'Top-down view of the Earth orbiting the Sun, with a nearby star and distant background stars'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, cy = 240, r = Math.min(66, W * 0.16), yB = 40, ly = Math.pow(10, lgLy);
      var frac = (lgLy - 0.62) / 2.38, yS = cy - r * (1.25 + 1.55 * frac) - 10;
      var rng = rngSeed(7); for (var i = 0; i < 40; i++) el('circle', { cx: 10 + rng() * (W - 20), cy: yB - 14 + rng() * 22, r: 1 + rng() * 1.4, fill: c.muted }, svg);
      txt(svg, W - 10, yB + 22, W < 520 ? 'distant stars' : 'very distant background stars', { anchor: 'end', size: fs(9), fill: c.muted });
      el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: c.border, 'stroke-dasharray': '4 4' }, svg);
      el('circle', { cx: cx, cy: cy, r: 9, fill: AMBER }, svg); txt(svg, cx, cy + 24, 'Sun', { size: fs(10), fill: c.muted });
      var ang = Math.PI + 2 * Math.PI * month / 12, ex = cx + r * Math.cos(ang), ey = cy + r * Math.sin(ang) * 0.999;
      function proj(px, py) { var t = (yB - py) / (yS - py); return px + (cx - px) * t; }
      var xJan = proj(cx - r, cy), xJul = proj(cx + r, cy), xNow = proj(ex, ey);
      el('line', { x1: cx - r, y1: cy, x2: xJan, y2: yB, stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.6 }, svg);
      el('line', { x1: cx + r, y1: cy, x2: xJul, y2: yB, stroke: RED, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.6 }, svg);
      el('line', { x1: ex, y1: ey, x2: xNow, y2: yB, stroke: MU, 'stroke-width': 1.6 }, svg);
      el('circle', { cx: xJan, cy: yB, r: 4, fill: 'none', stroke: BLUE, 'stroke-width': 1.5 }, svg);
      el('circle', { cx: xJul, cy: yB, r: 4, fill: 'none', stroke: RED, 'stroke-width': 1.5 }, svg);
      el('circle', { cx: xNow, cy: yB, r: 5, fill: MU }, svg);
      el('circle', { cx: cx, cy: yS, r: 6, fill: '#facc15', stroke: c.ink, 'stroke-width': 0.8 }, svg);
      txt(svg, cx + 12, yS + 4, 'nearby star', { anchor: 'start', size: fs(10), fill: c.ink });
      el('circle', { cx: ex, cy: ey, r: 6, fill: BLUE }, svg); txt(svg, ex + (Math.cos(ang) < 0 ? -10 : 10), ey + 4, 'Earth', { anchor: Math.cos(ang) < 0 ? 'end' : 'start', size: fs(10), fill: c.ink });
      txt(svg, cx - r - 6, cy + 18, 'Jan', { anchor: 'end', size: fs(9), fill: BLUE }); txt(svg, cx + r + 6, cy + 18, 'Jul', { anchor: 'start', size: fs(9), fill: RED });
      txt(svg, 10, H0 - 8, W < 560 ? 'Not to scale: real angles are far smaller.' : 'Not to scale: the real angles are hundreds of thousands of times smaller.', { anchor: 'start', size: fs(9), fill: c.muted });
      var p = 3.2616 / ly, coin = 0.02 / Math.tan(p / 206265) / 1000;
      out.innerHTML = 'At <strong>' + lyFmt(ly) + ' light-years</strong> (' + fmt(ly / 3.2616, 2) + ' parsecs), the parallax angle is <strong>' + (p >= 0.1 ? fmt(p, 3) : fmt(p * 1000, 1) + ' thousandths of') + ' a second of arc</strong>. That is the angle covered by a 2 cm coin seen from <strong>' + fmt(coin, 0) + ' km</strong> away.' + NOTE + 'As the Earth moves around its orbit, a nearby star seems to drift back and forth against much more distant stars, returning to the same place each year. The parallax angle is half the full swing, measured from a baseline of one astronomical unit (the Earth–Sun distance). The distance in parsecs is simply 1 divided by the parallax in seconds of arc. Even the nearest star, Proxima Centauri, shifts by less than one second of arc, which is why the effect escaped astronomers for two thousand years.</span>';
    }
    var H0 = 340;
    draw();
    FIG.animate(figEl, function () { if (!running) return; month = (month + 0.04) % 12; sm.element.value = month; valText(sm, fmt(month, 1)); draw(); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: aberration of starlight, the rain analogy
     ----------------------------------------------------------------------- */
  FIG['fig-aberration'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, v = [4, 30];
    var controls = div('fig-controls', container);
    var sl;
    choice(controls, 'What is falling?', ['Rain on a walker', 'Starlight on the Earth'], 0, function (i) { mode = i; sl.element.max = i ? 60 : 10; sl.element.step = i ? 1 : 0.5; sl.element.value = v[i]; valText(sl, v[i] + (i ? ' km/s' : ' m/s')); draw(); });
    sl = FIG.slider(controls, { id: 'ab-v', label: 'Your sideways speed', min: 0, max: 10, step: 0.5, value: v[0], onChange: function (x) { v[mode] = x; valText(sl, x + (mode ? ' km/s' : ' m/s')); draw(); } });
    valText(sl, v[0] + ' m/s');
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'A tube must be tilted forward to catch drops falling straight down while it moves sideways'), W = A.W, svg = A.svg, fs = A.fs;
      var u = mode ? 299792 : 8, vv = v[mode], ang = Math.atan(vv / u), shown = mode ? Math.atan(vv / u * 4000) : ang;
      var bx = W / 2, by = 225, Lt = 150;
      var rng = rngSeed(3); for (var i = 0; i < 26; i++) { var x = 20 + rng() * (W - 40), y = 20 + rng() * 150; el('line', { x1: x, y1: y, x2: x, y2: y + (mode ? 14 : 10), stroke: mode ? '#facc15' : BLUE, 'stroke-width': mode ? 1.5 : 1.2, opacity: 0.7 }, svg); }
      var tx = bx + Lt * Math.sin(shown), ty = by - Lt * Math.cos(shown);
      el('line', { x1: bx, y1: by, x2: tx, y2: ty, stroke: c.ink, 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.25 }, svg);
      el('line', { x1: bx, y1: by, x2: tx, y2: ty, stroke: c.ink, 'stroke-width': 2 }, svg);
      el('line', { x1: bx, y1: by, x2: bx, y2: by - Lt, stroke: c.muted, 'stroke-dasharray': '4 4' }, svg);
      el('line', { x1: bx, y1: by + 22, x2: bx + 30 + vv / (mode ? 60 : 10) * 80, y2: by + 22, stroke: RED, 'stroke-width': 2.5 }, svg);
      el('path', { d: 'M' + (bx + 30 + vv / (mode ? 60 : 10) * 80) + ' ' + (by + 17) + 'l8 5l-8 5z', fill: RED }, svg);
      txt(svg, bx - 8, by + 26, mode ? 'Earth’s motion' : 'walking', { anchor: 'end', size: fs(10), fill: RED });
      txt(svg, tx + 10, ty, mode ? 'telescope' : 'tube', { anchor: 'start', size: fs(10), fill: c.ink });
      if (mode) txt(svg, 10, 262, 'Tilt exaggerated 4,000 times so that you can see it.', { anchor: 'start', size: fs(9), fill: c.muted });
      var deg = ang * 180 / Math.PI;
      out.innerHTML = 'Tilt needed: <strong>' + (mode ? fmt(ang * 206265, 1) + ' seconds of arc' : fmt(deg, 1) + '°') + '</strong>.' + NOTE + (mode ? 'Light travels about 10,000 times faster than the Earth moves around the Sun (30 km/s), so a telescope must point about 20 seconds of arc ahead of a star’s true direction. As the Earth’s direction of motion changes through the year, every star traces a small ellipse. James Bradley found this effect in 1725–28 while looking for parallax. It is more than 25 times larger than even the largest stellar parallax, follows the Earth’s velocity rather than its position (so it peaks three months later), and is the same for every star in the same part of the sky: proof that the Earth moves, and a new measurement of the speed of light.' : 'Raindrops fall straight down, but if you walk, the rain seems to come towards you at an angle, and you must tilt a tube (or an umbrella) forward to keep the drops going straight through it. The faster you walk compared with the falling rain, the larger the tilt. Switch to starlight to see the same effect for a telescope on the moving Earth.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: how far can parallax reach?
     ----------------------------------------------------------------------- */
  FIG['fig-parallax-reach'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var INST = [
      { n: 'Tycho (1580s)', s: 60, d: 'naked-eye instruments, about 1 minute of arc' },
      { n: 'Bessel (1838)', s: 0.02, d: 'the Königsberg heliometer, uncertainty about 0.02″' },
      { n: 'Photographic plates (1900s)', s: 0.01, d: 'long-focus telescopes and photographic plates, about 0.01″' },
      { n: 'Hipparcos (1989–93)', s: 0.001, d: 'the first astrometry satellite, about 0.001″' },
      { n: 'Gaia (2013–25)', s: 0.00002, d: 'about 0.00002″ (20 micro-arcseconds) for bright stars' }
    ];
    var k = 4;
    var controls = div('fig-controls', container);
    choice(controls, 'Instrument', INST.map(function (x) { return x.n; }), k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var MARKS = [[1.30, 'Proxima Cen', 'Proxima'], [3.50, '61 Cygni', '61 Cyg'], [136, 'Pleiades', 'Pleiades'], [410, 'Orion Nebula', 'Orion'], [8200, 'Galactic centre', 'Centre']];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 330, 'The Milky Way seen from above, with a circle showing how far an instrument can measure distances by parallax to 10% accuracy'), W = A.W, svg = A.svg, fs = A.fs;
      var reach = 1 / (10 * INST[k].s), gx = W / 2, gy = 110, R = Math.min(95, W * 0.27), pc2px = R / 15000;
      for (var arm = 0; arm < 4; arm++) { var d = ''; for (var t = 0; t <= 60; t++) { var rr = R * (0.15 + 0.85 * t / 60), th = arm * Math.PI / 2 + t / 60 * 3.6; d += (t ? 'L' : 'M') + (gx + rr * Math.cos(th)).toFixed(1) + ' ' + (gy + rr * Math.sin(th) * 0.95).toFixed(1); } el('path', { d: d, fill: 'none', stroke: c.border, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.8 }, svg); }
      el('circle', { cx: gx, cy: gy, r: R * 0.18, fill: c.border }, svg);
      var sx = gx + 8200 * pc2px, sy = gy;
      el('circle', { cx: sx, cy: sy, r: Math.max(1.5, reach * pc2px), fill: MU, 'fill-opacity': 0.25, stroke: MU, 'stroke-width': 1.5 }, svg);
      el('circle', { cx: sx, cy: sy, r: 3, fill: AMBER }, svg); txt(svg, sx + Math.max(8, reach * pc2px + 4), sy - 6, 'Sun', { anchor: 'start', size: fs(10), fill: c.ink });
      txt(svg, 10, 16, 'The Milky Way from above (about 30,000 parsecs across)', { anchor: 'start', size: fs(10), fill: c.muted });
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 20, T: 240, B: 280, xl: 1, xh: 1e5, yl: 0, yh: 1, xticks: [1, 10, 100, 1000, 1e4, 1e5], logx: true, xlab: 'distance (parsecs, logarithmic scale)' });
      if (reach > 1) el('rect', { x: P.X(1), y: 252, width: P.X(Math.min(reach, 1e5)) - P.X(1), height: 16, fill: MU, opacity: 0.55 }, svg);
      MARKS.forEach(function (m, j) { var x = P.X(m[0]); el('line', { x1: x, y1: 246, x2: x, y2: 280, stroke: c.ink, 'stroke-width': 1 }, svg); var t = txt(svg, x, 236 - (j % 2) * 13, W < 560 ? m[2] : m[1], { size: fs(9), fill: c.ink2 }); });
      out.innerHTML = '<strong>' + INST[k].n + '</strong>: ' + INST[k].d + '. ' + (reach < 1 ? 'No star is close enough: even Proxima Centauri’s shift is <strong>80 times smaller</strong> than this precision.' : 'Distances good to 10% out to about <strong>' + (reach >= 1000 ? fmt(reach / 1000, 0) + ',000' : fmt(reach, 0)) + ' parsecs</strong> (' + fmt(reach * 3.26, 0) + ' light-years).') + NOTE + 'To get a distance to 10%, the parallax must be at least ten times the measurement uncertainty, so the reach is 1 ÷ (10 × uncertainty) parsecs. Each improvement in precision stretches the sphere of measured stars; Gaia’s reaches thousands of parsecs, a sizeable part of the Galaxy, with lower accuracy farther out. The circle on the map is drawn to scale.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: parallax with your thumb
     ----------------------------------------------------------------------- */
  FIG['fig-thumb-parallax'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var arm = 60, eyes = 6.3, eye = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'tp-a', label: 'Thumb distance from your eyes (cm)', min: 20, max: 80, step: 1, value: arm, onChange: function (x) { arm = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'tp-e', label: 'Distance between your eyes (cm)', min: 5.5, max: 7.5, step: 0.1, value: eyes, onChange: function (x) { eyes = x; draw(); } });
    choice(controls, 'Eye open', ['Left eye', 'Right eye'], 0, function (i) { eye = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Top view of two eyes, a thumb and a distant wall: each eye sees the thumb against a different part of the wall'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, yE = 270, yW = 40, yT = yE - (arm / 80) * 150, sep = 40;
      el('rect', { x: 20, y: yW - 12, width: W - 40, height: 12, fill: c.border }, svg);
      txt(svg, 24, yW - 18, 'far wall', { anchor: 'start', size: fs(9), fill: c.muted });
      var exs = [cx - sep / 2, cx + sep / 2];
      exs.forEach(function (x, i) {
        var t = (yW - yE) / (yT - yE), xw = x + (cx - x) * t, on = i === eye;
        el('line', { x1: x, y1: yE, x2: xw, y2: yW, stroke: i ? RED : BLUE, 'stroke-width': on ? 2 : 1, 'stroke-dasharray': on ? '' : '4 4', opacity: on ? 1 : 0.5 }, svg);
        el('circle', { cx: xw, cy: yW - 6, r: on ? 6 : 4, fill: i ? RED : BLUE, opacity: on ? 1 : 0.5 }, svg);
        el('ellipse', { cx: x, cy: yE, rx: 9, ry: 6, fill: on ? c.surface : c.border, stroke: c.ink }, svg);
        el('circle', { cx: x, cy: yE, r: 3, fill: on ? c.ink : c.muted }, svg);
      });
      el('rect', { x: cx - 6, y: yT - 10, width: 12, height: 20, rx: 5, fill: AMBER }, svg);
      txt(svg, cx + 12, yT + 4, 'thumb', { anchor: 'start', size: fs(10), fill: c.ink });
      txt(svg, cx, yE + 22, 'your eyes (separation exaggerated)', { size: fs(9), fill: c.muted });
      var jump = 2 * Math.atan(eyes / 2 / arm) * 180 / Math.PI, km = eyes / 100 / (0.314 / 206265) / 1000;
      out.innerHTML = 'Your thumb jumps by about <strong>' + fmt(jump, 1) + '°</strong> when you switch eyes: roughly ' + fmt(jump / 0.5, 0) + ' full-Moon widths.' + NOTE + 'Your two eyes are a baseline of ' + fmt(eyes, 1) + ' cm. The farther away your thumb, the smaller the jump; the jump angle and the baseline together give the distance. To see a jump as small as Bessel’s 0.314″ for 61 Cygni with the same eyes, your thumb would have to be about <strong>' + fmt(km, 0) + ' km</strong> away. Astronomers use the Earth’s orbit as a baseline 300 million kilometres wide instead, and still need precise instruments.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is stellar parallax?', options: ['The twinkling of stars', 'The yearly apparent shift of a nearby star against distant ones as the Earth orbits', 'The motion of a star through space', 'The bending of starlight by the Sun'], answer: 1, explanation: 'It is caused by our changing viewpoint.' },
      { question: 'Why did Aristotle think the Earth does not move?', options: ['The Sun rises in the east', 'No stellar parallax was seen', 'Objects fall straight down only', 'The Moon has phases'], answer: 1, explanation: 'A moving Earth predicts a shift that no one could detect.' },
      { question: 'What did James Bradley discover while looking for parallax?', options: ['Binary stars', 'The aberration of starlight', 'Neptune', 'Proper motion'], answer: 1, explanation: 'Published in 1729.' },
      { question: 'Which star did Bessel measure in 1838?', options: ['Vega', 'Sirius', '61 Cygni', 'Proxima Centauri'], answer: 2, explanation: 'He found 0.314 seconds of arc.' },
      { question: 'Why did Bessel choose 61 Cygni?', options: ['It is the brightest star', 'It has a large proper motion, a hint that it is close', 'It is a planet', 'It is in the southern sky'], answer: 1, explanation: 'Fast-moving stars across the sky tend to be nearby.' },
      { question: 'A star has a parallax of 0.5 seconds of arc. How far away is it?', options: ['0.5 parsecs', '2 parsecs', '5 parsecs', '50 parsecs'], answer: 1, explanation: 'Distance in parsecs = 1 ÷ parallax in arcseconds.' },
      { question: 'About how many light-years are in one parsec?', options: ['1', '3.26', '10', '206,265'], answer: 1, explanation: '206,265 is the number of astronomical units in a parsec.' },
      { question: 'What is the nearest star to the Sun?', options: ['Alpha Centauri A', 'Proxima Centauri', 'Sirius', 'Barnard’s Star'], answer: 1, explanation: 'About 4.2 light-years away, found by Robert Innes in 1915.' },
      { question: 'Why did Tycho Brahe reject the moving Earth?', options: ['He saw no parallax, so the stars would have to be unbelievably far and large', 'He saw the Earth move', 'He trusted Copernicus', 'He found aberration'], answer: 0, explanation: 'A reasonable conclusion from the evidence available to him.' },
      { question: 'What did the Gaia mission do?', options: ['Landed on Mars', 'Measured positions, parallaxes and motions of over a billion stars', 'Photographed black holes', 'Measured the age of the Earth'], answer: 1, explanation: 'Its third data release in 2022 gave parallaxes for about 1.5 billion objects.' }
    ]);
  };
})();
