/* ==========================================================================
   RNLearn — Galileo and Francis Bacon (Minds That Changed How We Know, Part 5)
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
    { name: 'A moving Earth', color: '#b45309' },
    { name: 'Galileo', color: '#1d4ed8' },
    { name: 'Bacon and the new method', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1543', icon: '☀️', era: 0, sec: 3, title: 'Copernicus', text: 'Nicolaus Copernicus’ On the Revolutions puts the Sun at the centre and sets the Earth spinning and moving.' },
    { year: '1564', icon: '👶', era: 1, sec: 4, title: 'Galileo born', text: 'Galileo Galilei is born in Pisa, three years after Francis Bacon is born in London (1561).' },
    { year: '1604', icon: '⛰️', era: 1, sec: 5, title: 'The law of fall', text: 'Galileo writes to Paolo Sarpi that distances fallen grow as the squares of the times.' },
    { year: '1610', icon: '🔭', era: 1, sec: 7, title: 'The Starry Messenger', text: 'Galileo publishes Sidereus Nuncius: mountains on the Moon, countless stars, and four moons of Jupiter. Later that year he sees the phases of Venus.' },
    { year: '1616', icon: '⛔', era: 1, sec: 11, title: 'Copernicanism condemned', text: 'The Congregation of the Index suspends Copernicus’ book; Cardinal Bellarmine instructs Galileo not to hold or defend the Earth’s motion.' },
    { year: '1620', icon: '📘', era: 2, sec: 9, title: 'The New Organon', text: 'Francis Bacon publishes Novum Organum, a new logic of discovery by careful induction from collected instances.' },
    { year: '1623', icon: '📖', era: 1, sec: 12, title: 'The book of nature', text: 'In The Assayer, Galileo writes that the book of nature is written in the language of mathematics.' },
    { year: '1626', icon: '❄️', era: 2, sec: 9, title: 'Bacon dies', text: 'Bacon dies of pneumonia; John Aubrey later tells that he caught a chill stuffing a chicken with snow.' },
    { year: '1633', icon: '⚖️', era: 1, sec: 11, title: 'The trial', text: 'After his Dialogue on the two world systems, Galileo is tried by the Inquisition, forced to abjure and placed under house arrest.' },
    { year: '1638', icon: '📐', era: 1, sec: 6, title: 'Two New Sciences', text: 'Published in Leiden, Galileo’s last book sets out the laws of falling bodies, projectiles and the strength of materials.' },
    { year: '1660', icon: '🏛️', era: 2, sec: 13, title: 'The Royal Society', text: 'The Royal Society of London is founded, consciously inspired by Bacon’s vision of collaborative experimental science.' }
  ];

  FIG['fig-m5-timeline'] = function (figEl) {
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
     Figure: the inclined plane
     ----------------------------------------------------------------------- */
  FIG['fig-incline'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ang = 3, running = false, t0 = 0, Lm = 5.5;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'in-a', label: 'Slope of the plane (degrees)', min: 1, max: 12, step: 0.5, value: ang, onChange: function (x) { ang = x; running = false; draw(-1); } });
    var row = group(controls, 'Experiment');
    btn('Release the ball', row).addEventListener('click', function () { running = true; t0 = 0; });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var a = function () { return 9.81 * Math.sin(ang * Math.PI / 180) * 5 / 7; };
    function tEnd() { return Math.sqrt(2 * Lm / a()); }
    var ball, svg, G;
    function draw(t) {
      var c = C(), A = newSVG(svgWrap, container, 230, 'A ball rolling down an inclined plane, marked at equal time intervals'), W = A.W; svg = A.svg; var fs = A.fs;
      var x0 = 30, x1 = W - 30, drop = Math.min(150, (x1 - x0) * Math.tan(Math.max(ang, 4) * Math.PI / 180)), y0 = 60, y1 = y0 + drop;
      G = { x0: x0, x1: x1, y0: y0, y1: y1 };
      el('path', { d: 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1 + 'L' + x0 + ' ' + y1 + 'Z', fill: AMBER + '22', stroke: AMBER }, svg);
      var T = tEnd(), dt = T / 6;
      for (var k = 1; k <= 6; k++) { var s = 0.5 * a() * Math.pow(k * dt, 2) / Lm, px = x0 + s * (x1 - x0), py = y0 + s * (y1 - y0); el('line', { x1: px, y1: py - 10, x2: px, y2: py + 6, stroke: c.ink2, 'stroke-width': 1.5 }, svg); txt(svg, px, py - 14, String(k * k), { size: fs(10), fill: c.ink, weight: 700 }); }
      txt(svg, x0, y1 + 22, W < 560 ? 'numbers: distance after 1, 2, 3 … beats' : 'marks: where the ball is after 1, 2, 3 … equal beats; numbers: distance in units of the first', { anchor: 'start', size: fs(9), fill: c.muted });
      ball = el('circle', { cx: x0, cy: y0 - 7, r: 7, fill: BLUE }, svg);
      if (t >= 0) place(t);
      legend(svg, c, fs, W, 'Galileo timed balls on a gentle slope to slow the fall, measuring time by weighing water from a vessel', 'a slow fall that can be timed');
      out.innerHTML = 'On a ' + fmt(ang, 1) + '° slope, a ball rolls the 5.5 m plane in <strong>' + fmt(T, 2) + ' s</strong>. Distances after 1, 2, 3, 4, 5, 6 equal intervals: 1, 4, 9, 16, 25, 36; distances covered in each interval: <strong>1, 3, 5, 7, 9, 11</strong>.' + NOTE + 'Galileo found that the distance grows as the square of the time, so the distances in successive equal intervals go as the odd numbers. Because the rule holds at every slope, he argued, it holds in the limit of a vertical drop: free fall is uniformly accelerated motion. The gentle slope was the key trick: it slowed the motion enough to time with a water clock. In 1961 Thomas Settle rebuilt the apparatus and showed that it gives results as good as Galileo claimed. (A rolling ball accelerates at 5/7 of g sin θ; the law of squares is unaffected.)</span>';
    }
    function place(t) { var s = Math.min(1, 0.5 * a() * t * t / Lm); ball.setAttribute('cx', (G.x0 + s * (G.x1 - G.x0)).toFixed(1)); ball.setAttribute('cy', (G.y0 + s * (G.y1 - G.y0) - 7).toFixed(1)); }
    draw(-1);
    window.addEventListener('resize', function () { draw(-1); });
    onTheme(function () { draw(-1); });
    FIG.animate(figEl, function (now) { if (!running) return; if (!t0) t0 = now; var t = (now - t0) / 1000; place(t); if (t > tEnd() + 0.5) running = false; });
  };

  /* -----------------------------------------------------------------------
     Figure: the height of lunar mountains
     ----------------------------------------------------------------------- */
  FIG['fig-moonpeak'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var frac = 0.05;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mp-f', label: 'Lit peak’s distance beyond the terminator (fraction of the Moon’s diameter)', min: 0.005, max: 0.1, step: 0.005, value: frac, onChange: function (x) { frac = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Sunlight grazing the Moon and catching a mountain top beyond the terminator'), W = A.W, svg = A.svg, fs = A.fs;
      var R = Math.min(105, W * 0.25), cx = W * 0.42, cy = 150, dpx = frac * 2 * R;
      el('circle', { cx: cx, cy: cy, r: R, fill: '#374151' }, svg);
      el('path', { d: 'M' + cx + ' ' + (cy - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + cx + ' ' + (cy + R) + 'Z', fill: '#e5e7eb' }, svg);
      el('line', { x1: cx, y1: cy - R - 30, x2: cx + R + 120, y2: cy - R - 30, stroke: AMBER, 'stroke-width': 0 }, svg);
      for (var k = -2; k <= 2; k++) el('line', { x1: W - 20, y1: cy - R + k * 18, x2: cx + R, y2: cy - R + k * 18, stroke: AMBER, 'stroke-width': 1, opacity: 0.4, 'stroke-dasharray': '4 4' }, svg);
      var tx = cx, ty = cy - R;
      el('line', { x1: W - 20, y1: ty, x2: cx - dpx, y2: ty, stroke: AMBER, 'stroke-width': 2.2 }, svg);
      var Rp = Math.sqrt(R * R + dpx * dpx), pAng = Math.atan2(-R, -dpx), px = cx + Rp * Math.cos(pAng), py = cy + Rp * Math.sin(pAng);
      el('line', { x1: cx, y1: cy, x2: px, y2: py, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg); el('line', { x1: cx, y1: cy, x2: tx, y2: ty, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      el('path', { d: 'M' + (px - 6) + ' ' + (py + 9) + 'L' + px + ' ' + (py - 2) + 'L' + (px + 6) + ' ' + (py + 9) + 'Z', fill: '#fef3c7', stroke: AMBER }, svg);
      txt(svg, cx - dpx / 2, ty - 8, 'd', { size: fs(11), fill: c.ink, weight: 700 }); txt(svg, cx + 6, cy + 4, 'R', { anchor: 'start', size: fs(11), fill: c.ink, weight: 700 });
      txt(svg, W - 24, ty - 8, 'sunlight', { anchor: 'end', size: fs(10), fill: AMBER });
      txt(svg, cx, cy + R + 22, 'terminator: boundary between the Moon’s day and night', { size: fs(9), fill: c.muted });
      var hG = 1000 * (Math.sqrt(1 + Math.pow(frac * 2, 2)) - 1), hM = 1737.4 * (Math.sqrt(1 + Math.pow(frac * 2, 2)) - 1);
      legend(svg, c, fs, W, 'a sunlit point in the dark part must stick up into the grazing sunlight; Pythagoras gives its height', 'Pythagoras gives the peak’s height');
      out.innerHTML = 'Height h = √(R² + d²) − R: with Galileo’s Moon diameter of 2,000 Italian miles, <strong>' + fmt(hG, 1) + ' miles</strong>; with the true radius of 1,737 km, <strong>' + fmt(hM, 1) + ' km</strong>.' + NOTE + 'Through his telescope Galileo saw bright points in the dark part of the Moon, near the terminator, which grew and joined the lit region as the Sun rose: mountain tops catching sunlight before the plains below them. Some lay a twentieth of the Moon’s diameter into the darkness, which by this geometry made them over four miles high, higher than any mountain then known on Earth. (The estimate was too high; the tallest lunar mountains rise about 5 km above their surroundings.) The point was revolutionary: the Moon is a rough world like ours, not a perfect heavenly sphere.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the phases of Venus test two world systems
     ----------------------------------------------------------------------- */
  FIG['fig-venus'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var model = 1, ph = 0, svg, W, gV, refs = {};
    var controls = div('fig-controls', container);
    choice(controls, 'World system', ['Ptolemy: Earth at the centre', 'Copernicus (or Tycho): Venus circles the Sun'], 1, function (i) { model = i; setup(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function pos(t) {
      if (model === 1) { var aE = t * 2 * Math.PI / 1.6, aV = t * 2 * Math.PI; return { E: [1.0 * Math.cos(aE), 1.0 * Math.sin(aE)], S: [0, 0], V: [0.72 * Math.cos(aV), 0.72 * Math.sin(aV)] }; }
      var aS = t * 2 * Math.PI / 1.6, S = [1.0 * Math.cos(aS), 1.0 * Math.sin(aS)], C0 = [0.55 * Math.cos(aS), 0.55 * Math.sin(aS)], ae = t * 2 * Math.PI * 0.95; return { E: [0, 0], S: S, V: [C0[0] + 0.3 * Math.cos(ae), C0[1] + 0.3 * Math.sin(ae)], C: C0 };
    }
    function disc(g, x, y, r, alpha, c) {
      el('circle', { cx: x, cy: y, r: r, fill: '#1f2937', stroke: '#4b5563' }, g);
      var k = Math.cos(alpha), d = 'M' + x + ' ' + (y - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + r) + 'A' + Math.abs(k) * r + ' ' + r + ' 0 0 ' + (k > 0 ? 1 : 0) + ' ' + x + ' ' + (y - r) + 'Z';
      el('path', { d: d, fill: '#fde68a' }, g);
    }
    function look(p) { var vs = [p.S[0] - p.V[0], p.S[1] - p.V[1]], ve = [p.E[0] - p.V[0], p.E[1] - p.V[1]], dot = vs[0] * ve[0] + vs[1] * ve[1], n = Math.hypot(vs[0], vs[1]) * Math.hypot(ve[0], ve[1]); return { alpha: Math.acos(Math.max(-1, Math.min(1, dot / n))), dist: Math.hypot(ve[0], ve[1]) }; }
    function setup() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 500 : 300, 'Orbits of Venus in two world systems and its appearance in a telescope'); W = A.W; svg = A.svg; var fs = A.fs;
      refs = { cx: narrow ? W / 2 : W * 0.25, cy: 160, s: narrow ? Math.min(100, W * 0.3) : 100, vx: narrow ? W / 2 : W * 0.68, vy: narrow ? 360 : 130, narrow: narrow, fs: fs };
      el('rect', { x: refs.cx - refs.s * 1.3, y: refs.cy - refs.s * 1.3, width: refs.s * 2.6, height: refs.s * 2.6, fill: '#0b1023', rx: 8 }, svg);
      gV = el('g', {}, svg);
      var row = el('g', {}, svg), N = 8, sx = narrow ? 30 : W * 0.5, sw = narrow ? W - 60 : W * 0.48, sy = narrow ? 470 : 265;
      for (var k = 0; k < N; k++) { var p = pos(k * (model ? 2.67 : 1.6) / N), L = look(p); disc(row, sx + (k + 0.5) * sw / N, sy, Math.max(3, Math.min(sw / N / 2 - 3, 6 / L.dist)), L.alpha, c); }
      txt(svg, sx + sw / 2, sy - 24, 'appearance over one full cycle (size shows distance)', { size: fs(9), fill: c.muted });
      legend(svg, c, fs, W, model ? 'Venus circles the Sun: it shows a full set of phases, small when full, large when a crescent' : 'Venus on an epicycle between Earth and Sun: it can only ever show crescents', model ? 'full phases, size changes' : 'only crescents');
      out.innerHTML = (model ? '<strong>Copernican (or Tychonic) prediction:</strong> Venus goes through all phases like the Moon, from a small full disc (far side of the Sun) to a large thin crescent (near side). This is what Galileo saw from autumn 1610.' : '<strong>Ptolemaic prediction:</strong> Venus always lies between the Earth and the Sun, so we see mostly its unlit side: it should appear only as a crescent or new, never full or gibbous.') + NOTE + 'Galileo’s observation of a full cycle of phases refuted Ptolemy’s arrangement of Venus. It did not prove Copernicus right: Tycho Brahe’s system, in which the planets circle the Sun while the Sun circles a fixed Earth, predicts exactly the same phases. Deciding between Copernicus and Tycho needed other evidence, ultimately Newton’s physics and the detection of stellar parallax in 1838.</span>';
    }
    function frame() {
      ph += 0.003; gV.innerHTML = ''; var c = C(), p = pos(ph), s = refs.s, X = function (q) { return refs.cx + q[0] * s; }, Y = function (q) { return refs.cy + q[1] * s; };
      if (model === 1) { el('circle', { cx: refs.cx, cy: refs.cy, r: s, fill: 'none', stroke: '#3b82f6', 'stroke-dasharray': '3 3' }, gV); el('circle', { cx: refs.cx, cy: refs.cy, r: 0.72 * s, fill: 'none', stroke: '#fde68a', 'stroke-dasharray': '3 3', opacity: 0.6 }, gV); }
      else { el('circle', { cx: refs.cx, cy: refs.cy, r: s, fill: 'none', stroke: '#f59e0b', 'stroke-dasharray': '3 3', opacity: 0.6 }, gV); el('circle', { cx: X(p.C), cy: Y(p.C), r: 0.3 * s, fill: 'none', stroke: '#fde68a', 'stroke-dasharray': '3 3', opacity: 0.6 }, gV); el('line', { x1: X(p.E), y1: Y(p.E), x2: X(p.S), y2: Y(p.S), stroke: '#f59e0b', opacity: 0.3 }, gV); }
      el('circle', { cx: X(p.S), cy: Y(p.S), r: 9, fill: '#f59e0b' }, gV); el('circle', { cx: X(p.E), cy: Y(p.E), r: 6, fill: '#3b82f6' }, gV); el('circle', { cx: X(p.V), cy: Y(p.V), r: 4, fill: '#fde68a' }, gV);
      var L = look(p); disc(gV, refs.vx, refs.vy, Math.max(6, Math.min(60, 22 / L.dist)), L.alpha, c);
      txt(gV, refs.vx, refs.vy + 72, 'Venus in the telescope now', { size: refs.fs(9), fill: c.muted });
    }
    setup();
    window.addEventListener('resize', setup);
    onTheme(setup);
    FIG.animate(figEl, frame);
  };

  /* -----------------------------------------------------------------------
     Figure: Bacon's tables and eliminative induction
     ----------------------------------------------------------------------- */
  FIG['fig-bacon'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CAND = ['light', 'comes from the heavens', 'flame', 'agitated motion of small parts'];
    var INST = [
      ['The Sun’s rays', true, [1, 1, 0, 1]], ['Fire', true, [1, 0, 1, 1]], ['Moonlight', false, [1, 1, 0, 0]], ['Rubbing two sticks', true, [0, 0, 0, 1]],
      ['Rotting, fermenting compost', true, [0, 0, 0, 1]], ['A glow-worm', false, [1, 0, 0, 0]], ['Boiling water', true, [0, 0, 0, 1]], ['Iron hammered hard', true, [0, 0, 0, 1]]
    ];
    var on = INST.map(function (x, i) { return i < 2; });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function render() {
      var alive = CAND.map(function (cn, j) { return INST.every(function (ins, i) { if (!on[i]) return true; return ins[1] ? ins[2][j] === 1 : ins[2][j] === 0; }); });
      var head = '<tr><th style="text-align:left;padding:4px 6px">Instance (tap to include)</th><th style="padding:4px 6px">hot?</th>' + CAND.map(function (cn, j) { return '<th style="padding:4px 6px;font-weight:600;color:' + (alive[j] ? 'var(--ink)' : 'var(--ink-faint)') + ';' + (alive[j] ? '' : 'text-decoration:line-through;') + '">' + cn + '</th>'; }).join('') + '</tr>';
      var rows = INST.map(function (ins, i) { return '<tr data-i="' + i + '" style="cursor:pointer;background:' + (on[i] ? 'var(--surface-raised)' : 'transparent') + ';opacity:' + (on[i] ? 1 : 0.55) + '"><td style="padding:4px 6px">' + (on[i] ? '☑ ' : '☐ ') + ins[0] + '</td><td style="text-align:center;padding:4px 6px">' + (ins[1] ? '🔥' : '—') + '</td>' + ins[2].map(function (v) { return '<td style="text-align:center;padding:4px 6px">' + (v ? '✓' : '·') + '</td>'; }).join('') + '</tr>'; }).join('');
      view.innerHTML = '<div style="overflow-x:auto;margin-top:0.6rem;font-family:var(--font-sans);font-size:0.86rem"><table style="border-collapse:collapse;width:100%">' + head + rows + '</table></div>';
      Array.prototype.forEach.call(view.querySelectorAll('tr[data-i]'), function (tr) { tr.addEventListener('click', function () { var i = +tr.getAttribute('data-i'); on[i] = !on[i]; render(); }); });
      var left = CAND.filter(function (cn, j) { return alive[j]; });
      out.innerHTML = 'Candidate causes still standing: <strong>' + (left.length ? left.join(', ') : 'none') + '</strong>.' + NOTE + 'Bacon’s method: list instances where a nature (here, heat) is present, instances that are similar but where it is absent, and instances where it varies in degree; then reject every candidate “form” that is missing where heat is present or present where heat is missing. Moonlight is light from the heavens yet not hot; rubbing sticks makes heat with no light. Including all the instances leaves only motion. Bacon’s own “first vintage” concluded that heat is a kind of expansive, agitated motion of small particles, close to the kinetic theory of the nineteenth century.</span>';
    }
    render();
  };

  FIG['fig-quiz-m5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why did Galileo roll balls down gentle slopes?', options: ['To save the balls', 'To slow the motion enough to time it accurately', 'Because free fall is different', 'To measure friction only'], answer: 1, explanation: 'He timed them with a water clock.' },
      { question: 'In uniformly accelerated motion from rest, distances in successive equal times go as…', options: ['1, 2, 3, 4', '1, 3, 5, 7', '1, 2, 4, 8', '1, 1, 1, 1'], answer: 1, explanation: 'Total distances 1, 4, 9, 16.' },
      { question: 'What did Galileo see on the Moon with his telescope?', options: ['A perfectly smooth surface', 'Mountains and valleys whose shadows changed with the Sun', 'Oceans of water', 'Canals'], answer: 1, explanation: 'Sidereus Nuncius, 1610.' },
      { question: 'Why were Jupiter’s moons important?', options: ['They proved the Sun is a star', 'They showed that not everything circles the Earth, and that a moving body can keep its moons', 'They are made of gold', 'They explained tides'], answer: 1, explanation: 'Galileo named them the Medicean stars.' },
      { question: 'The full cycle of Venus’s phases refuted…', options: ['Copernicus', 'Tycho Brahe', 'Ptolemy’s arrangement of Venus', 'Kepler'], answer: 2, explanation: 'Tycho’s system predicts the same phases as Copernicus.' },
      { question: 'Bacon’s “idols” are…', options: ['Religious statues', 'Habitual errors of the mind that distort knowledge', 'Famous scientists', 'Experimental instruments'], answer: 1, explanation: 'Of the tribe, the cave, the marketplace and the theatre.' },
      { question: 'Bacon’s method of tables aims to find causes by…', options: ['Pure mathematical deduction', 'Collecting instances of presence, absence and degree and eliminating false candidates', 'Asking authorities', 'Random guessing'], answer: 1, explanation: 'Eliminative induction.' },
      { question: 'Galileo wrote that the book of nature is written in the language of…', options: ['Latin', 'Mathematics', 'Scripture', 'Music'], answer: 1, explanation: 'The Assayer, 1623.' },
      { question: 'What happened to Galileo in 1633?', options: ['He was knighted', 'He was tried by the Inquisition, forced to abjure and placed under house arrest', 'He moved to England', 'He discovered Neptune'], answer: 1, explanation: 'After publishing his Dialogue in 1632.' },
      { question: 'The Leaning Tower experiment is first described by…', options: ['Galileo in his own books', 'His pupil Vincenzo Viviani, writing decades later', 'Aristotle', 'Bacon'], answer: 1, explanation: 'Galileo never mentions it.' }
    ]);
  };
})();
