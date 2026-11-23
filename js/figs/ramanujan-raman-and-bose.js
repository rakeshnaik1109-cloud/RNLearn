/* ==========================================================================
   RNLearn — Ramanujan, Raman and Bose (Minds That Changed How We Know, Part 11)
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
    { name: 'Ramanujan', color: '#b45309' },
    { name: 'Raman', color: '#1d4ed8' },
    { name: 'Bose', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1887', icon: '👶', era: 0, sec: 3, title: 'Ramanujan born', text: 'Srinivasa Ramanujan is born in Erode, in the Madras Presidency, on 22 December.' },
    { year: '1888', icon: '👶', era: 1, sec: 7, title: 'Raman born', text: 'Chandrasekhara Venkata Raman is born in Tiruchirappalli on 7 November.' },
    { year: '1894', icon: '👶', era: 2, sec: 10, title: 'Bose born', text: 'Satyendra Nath Bose is born in Calcutta on 1 January.' },
    { year: '1913', icon: '✉️', era: 0, sec: 4, title: 'A letter to Hardy', text: 'Ramanujan, a clerk in the Madras Port Trust, sends G. H. Hardy pages of astonishing theorems.' },
    { year: '1914', icon: '🚢', era: 0, sec: 5, title: 'To Cambridge', text: 'Ramanujan sails to England to work with Hardy at Trinity College.' },
    { year: '1918', icon: '🏅', era: 0, sec: 5, title: 'Fellow of the Royal Society', text: 'Ramanujan becomes one of the youngest Fellows of the Royal Society; the Hardy–Ramanujan partition formula is published.' },
    { year: '1920', icon: '🪦', era: 0, sec: 6, title: 'Ramanujan dies', text: 'Ramanujan dies in Kumbakonam, aged 32, leaving notebooks still being studied.' },
    { year: '1921', icon: '🌊', era: 1, sec: 8, title: 'The colour of the sea', text: 'Sailing to Europe, Raman argues that the sea is blue because water scatters light, not only because it reflects the sky.' },
    { year: '1924', icon: '📨', era: 2, sec: 10, title: 'Bose writes to Einstein', text: 'Bose sends Einstein a new derivation of Planck’s law by counting photons; Einstein translates and publishes it.' },
    { year: '1928', icon: '🌈', era: 1, sec: 8, title: 'The Raman effect', text: 'Raman and K. S. Krishnan report a faint new kind of scattered light, shifted in colour by molecular vibrations.' },
    { year: '1930', icon: '🏅', era: 1, sec: 9, title: 'Raman’s Nobel Prize', text: 'Raman becomes the first Asian to win the Nobel Prize in Physics.' },
    { year: '1995', icon: '🧊', era: 2, sec: 11, title: 'Bose–Einstein condensate', text: 'Eric Cornell and Carl Wieman, and then Wolfgang Ketterle, create the state of matter Einstein predicted from Bose’s counting.' }
  ];

  FIG['fig-m11-timeline'] = function (figEl) {
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
     Figure: partitions
     ----------------------------------------------------------------------- */
  FIG['fig-partitions'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 5, P = [1n];
    for (var m = 1; m <= 1000; m++) P.push(0n);
    for (var k = 1; k <= 1000; k++) for (var j = k; j <= 1000; j++) P[j] += P[j - k];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pt-n', label: 'n', min: 1, max: 1000, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    var view = div('', container), svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function parts(nn) { var res = []; (function rec(left, max, cur) { if (res.length >= 30) return; if (left === 0) { res.push(cur.join(' + ')); return; } for (var i = Math.min(left, max); i >= 1; i--) rec(left - i, i, cur.concat([i])); })(nn, nn, []); return res; }
    function hr(nn) { return Math.exp(Math.PI * Math.sqrt(2 * nn / 3)) / (4 * nn * Math.sqrt(3)); }
    function draw() {
      var exact = P[n], ex = Number(exact), approx = hr(n);
      view.innerHTML = n <= 8 ? '<div style="font-family:var(--font-sans);font-size:0.9rem;margin:0.6rem 0;color:var(--ink-secondary)">' + parts(n).join(' &nbsp;·&nbsp; ') + '</div>' : '';
      var c = C(), A = newSVG(svgWrap, container, 240, 'Exact partition numbers and the Hardy–Ramanujan approximation'), W = A.W, svg = A.svg, fs = A.fs;
      var Pl = plotAxes(svg, c, fs, { L: 58, R: W - 14, T: 30, B: 200, xl: 1, xh: 1000, yl: 1, yh: 1e32, logy: true, xticks: [1, 250, 500, 750, 1000], yticks: [1, 1e8, 1e16, 1e24, 1e32], xlab: 'n', ylab: 'p(n)' });
      plotLine(svg, Pl, hr, 1, 1000, 200, AMBER, 2, '5 3');
      var d = ''; for (var q = 1; q <= 1000; q += 5) { d += (q === 1 ? 'M' : 'L') + Pl.X(q).toFixed(1) + ' ' + Pl.Y(Math.min(1e32, Number(P[q]))).toFixed(1); } el('path', { d: d, fill: 'none', stroke: MC, 'stroke-width': 2.2, 'clip-path': Pl.clip }, svg);
      if (ex < 1e32) el('circle', { cx: Pl.X(n), cy: Pl.Y(ex), r: 5, fill: RED }, svg);
      legend(svg, c, fs, W, 'teal: exact p(n) · dashed amber: Hardy and Ramanujan’s leading formula e^(π√(2n/3)) / (4n√3)', 'teal: exact · amber: formula');
      var s = exact.toString();
      out.innerHTML = 'p(' + n + ') = <strong style="word-break:break-all">' + (s.length > 40 ? s.slice(0, 20) + '…' + s.slice(-10) + ' (' + s.length + ' digits)' : Number(s).toLocaleString('en-GB')) + '</strong>; leading Hardy–Ramanujan estimate ≈ ' + sciHTML(approx, 3) + ' (ratio ' + fmt(approx / ex, 4) + ').' + NOTE + 'A partition of n is a way of writing it as a sum of positive whole numbers, ignoring order: 4 = 3 + 1 = 2 + 2 = 2 + 1 + 1 = 1 + 1 + 1 + 1, so p(4) = 5. The numbers grow explosively: p(200) has 13 digits. In 1918 Hardy and Ramanujan found an asymptotic formula; with its full series of correction terms it gives p(200) exactly, a feat that astonished mathematicians. Ramanujan also noticed patterns such as p(5k + 4) always being divisible by 5. (Exact values computed here with whole-number arithmetic.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a Raman spectrum
     ----------------------------------------------------------------------- */
  FIG['fig-raman'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 300, mol = 0;
    var MOL = [['carbon tetrachloride', [[218, 1], [314, 0.9], [459, 2.2], [762, 0.4], [790, 0.4]]], ['benzene', [[606, 0.5], [849, 0.3], [992, 3], [1178, 0.6], [1585, 0.5], [3062, 1.4]]]];
    var controls = div('fig-controls', container);
    choice(controls, 'Sample', ['Carbon tetrachloride', 'Benzene'], 0, function (i) { mol = i; draw(); });
    FIG.slider(controls, { id: 'rm-t', label: 'Temperature (K)', min: 77, max: 600, step: 1, value: T, onChange: function (x) { T = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Intensity of scattered light against frequency shift'), W = A.W, svg = A.svg, fs = A.fs, lines = MOL[mol][1], xm = mol ? 3300 : 900;
      var P = plotAxes(svg, c, fs, { L: 40, R: W - 14, T: 30, B: 224, xl: -xm, xh: xm, yl: 0, yh: 1.1, xticks: mol ? [-3000, -1500, 0, 1500, 3000] : [-800, -400, 0, 400, 800], yticks: [], xlab: 'Raman shift (cm⁻¹): anti-Stokes ← | → Stokes' });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(0), y2: P.Y(1.08), stroke: c.muted, 'stroke-width': 3 }, svg); txt(svg, P.X(0), P.Y(1.08) - 4, 'laser (×10⁶ stronger)', { size: fs(9), fill: c.muted });
      var mx = Math.max.apply(null, lines.map(function (l) { return l[1]; })), ratios = [];
      lines.forEach(function (l) { var hS = l[1] / mx * 0.9, boltz = Math.exp(-1.4388 * l[0] / T), hA = hS * boltz; ratios.push([l[0], boltz]); [[l[0], hS, MC], [-l[0], hA, PURPLE]].forEach(function (b) { el('line', { x1: P.X(b[0]), y1: P.Y(0), x2: P.X(b[0]), y2: P.Y(b[1]), stroke: b[2], 'stroke-width': 3 }, svg); }); txt(svg, P.X(l[0]), P.Y(hS) - 4, String(l[0]), { size: fs(8), fill: MC }); });
      legend(svg, c, fs, W, 'teal: Stokes lines (light loses energy to molecular vibrations) · purple: anti-Stokes lines (light gains energy)', 'teal: Stokes · purple: anti-Stokes');
      out.innerHTML = 'At ' + T + ' K, the anti-Stokes line at ' + ratios[0][0] + ' cm⁻¹ is <strong>' + fmt(ratios[0][1] * 100, 1) + '%</strong> as strong as its Stokes partner; at ' + ratios[ratios.length - 1][0] + ' cm⁻¹ only ' + sciHTML(ratios[ratios.length - 1][1] * 100, 2) + '%.' + NOTE + 'When light scatters off molecules, about one photon in millions exchanges energy with a molecular vibration and emerges with a slightly different colour. Shifts to lower energy (Stokes lines) need the molecule to absorb a quantum of vibration; shifts to higher energy (anti-Stokes lines) need a molecule already vibrating, which becomes rarer as e<sup>−hcν̃/kT</sup> for higher frequencies and lower temperatures. The pattern of lines is a fingerprint of the molecule, which is why Raman spectroscopy now identifies substances from pharmaceuticals to pigments in paintings. (Line positions approximate, intensities schematic; frequency-dependence of scattering ignored.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: counting like Bose
     ----------------------------------------------------------------------- */
  FIG['fig-bosecount'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 2, g = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bc-n', label: 'Particles', min: 2, max: 6, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    FIG.slider(controls, { id: 'bc-g', label: 'States (boxes)', min: 2, max: 6, step: 1, value: g, onChange: function (x) { g = x; draw(); } });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function binom(a, b) { if (b < 0 || b > a) return 0; var r = 1; for (var i = 1; i <= b; i++) r = r * (a - b + i) / i; return Math.round(r); }
    function draw() {
      var MB = Math.pow(g, n), BE = binom(n + g - 1, n), FD = binom(g, n);
      var pMB = g / MB, pBE = g / BE;
      var ex = '';
      if (n === 2 && g === 2) ex = '<div style="font-family:var(--font-sans);font-size:0.88rem;margin:0.6rem 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">' +
        '<div style="padding:8px;border:1px solid var(--border);border-radius:6px"><strong>Distinguishable coins (classical)</strong><br>HH, HT, TH, TT: 4 equally likely outcomes; both in the same state 2 times in 4 (50%).</div>' +
        '<div style="padding:8px;border:1px solid var(--border);border-radius:6px"><strong>Identical photons (Bose)</strong><br>both H, one each, both T: 3 equally likely; both in the same state 2 times in 3 (67%).</div>' +
        '<div style="padding:8px;border:1px solid var(--border);border-radius:6px"><strong>Electrons (Fermi–Dirac)</strong><br>only “one each” is allowed: 1 arrangement; never in the same state.</div></div>';
      view.innerHTML = ex + '<div style="font-family:var(--font-sans);font-size:0.9rem;overflow-x:auto;margin-top:0.4rem"><table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;padding:4px 8px">Counting rule</th><th style="padding:4px 8px">Arrangements</th><th style="padding:4px 8px">Chance all ' + n + ' share one state</th></tr></thead><tbody>' +
        '<tr><td style="padding:4px 8px">Classical, distinguishable (Maxwell–Boltzmann)</td><td style="text-align:center">' + MB.toLocaleString('en-GB') + '</td><td style="text-align:center">' + fmt(pMB * 100, 2) + '%</td></tr>' +
        '<tr><td style="padding:4px 8px">Identical bosons (Bose–Einstein)</td><td style="text-align:center">' + BE.toLocaleString('en-GB') + '</td><td style="text-align:center;font-weight:700">' + fmt(pBE * 100, 2) + '%</td></tr>' +
        '<tr><td style="padding:4px 8px">Identical fermions (Fermi–Dirac)</td><td style="text-align:center">' + FD.toLocaleString('en-GB') + '</td><td style="text-align:center">0%</td></tr></tbody></table></div>';
      out.innerHTML = 'With ' + n + ' particles in ' + g + ' states, identical bosons are <strong>' + fmt(pBE / pMB, 1) + ' times</strong> more likely than classical particles to be found all together in one state.' + NOTE + 'Bose’s 1924 derivation of Planck’s law counted photons as truly indistinguishable: swapping two photons does not create a new arrangement. Einstein saw that the same counting should apply to atoms, and that it gives bosons a tendency to bunch into the same state. At very low temperatures, he predicted in 1925, a gas of such atoms should collapse into a single quantum state: a Bose–Einstein condensate. Particles that obey Bose’s statistics are now called bosons; electrons, protons and neutrons are fermions, which obey Pauli’s exclusion principle instead.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: Planck's law from Bose's counting
     ----------------------------------------------------------------------- */
  FIG['fig-planck'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 5800;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pl-t', label: 'Temperature (K)', min: 1000, max: 12000, step: 100, value: T, onChange: function (x) { T = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var h = 6.626e-34, cc = 2.998e8, k = 1.381e-23;
    function B(lnm, TT) { var l = lnm * 1e-9; return 2 * h * cc * cc / Math.pow(l, 5) / (Math.exp(h * cc / (l * k * TT)) - 1); }
    function RJ(lnm, TT) { var l = lnm * 1e-9; return 2 * cc * k * TT / Math.pow(l, 4); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Blackbody spectrum: Planck’s law and the classical prediction'), W = A.W, svg = A.svg, fs = A.fs, peak = 2.898e6 / T, ymax = B(peak, T) * 1.25;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 100, xh: 3000, yl: 0, yh: ymax, xticks: [100, 500, 1000, 1500, 2000, 2500, 3000], yticks: [], xlab: 'wavelength (nm)', ylab: 'brightness' });
      el('rect', { x: P.X(380), y: 30, width: P.X(750) - P.X(380), height: 194, fill: AMBER + '18' }, svg); txt(svg, P.X(565), 44, 'visible', { size: fs(9), fill: AMBER });
      plotLine(svg, P, function (l) { return RJ(l, T); }, 100, 3000, 200, RED, 1.8, '5 3');
      plotLine(svg, P, function (l) { return B(l, T); }, 100, 3000, 300, MC, 2.6);
      el('line', { x1: P.X(peak), y1: P.Y(B(peak, T)), x2: P.X(peak), y2: P.Y(0), stroke: c.muted, 'stroke-dasharray': '2 3' }, svg);
      legend(svg, c, fs, W, 'teal: Planck’s law, which Bose derived by counting photons · dashed red: classical theory, which blows up at short wavelengths', 'teal: Planck · red: classical');
      out.innerHTML = 'Peak at <strong>' + fmt(peak, 0) + ' nm</strong> (Wien’s law: λ<sub>max</sub> = 2.898 mm·K / T). ' + (T > 5000 && T < 6500 ? 'This is roughly the Sun’s surface temperature.' : '') + NOTE + 'A hot object glows with a spectrum that depends only on its temperature. Classical physics predicted ever more radiation at shorter wavelengths, the “ultraviolet catastrophe”. In 1900 Max Planck fixed this by assuming that energy is exchanged in quanta, but his derivation mixed classical and quantum ideas. Bose, preparing lectures in Dhaka in 1924, derived the formula purely by counting how indistinguishable photons can be distributed among cells of phase space. Einstein called it “an important step forward”.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m11'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Before he wrote to Hardy, Ramanujan worked as…', options: ['A professor in Madras', 'A clerk in the Madras Port Trust', 'A teacher in Cambridge', 'An engineer'], answer: 1, explanation: 'He had failed college exams outside mathematics.' },
      { question: 'What is p(5), the number of partitions of 5?', options: ['5', '6', '7', '10'], answer: 2, explanation: '5, 4+1, 3+2, 3+1+1, 2+2+1, 2+1+1+1, 1+1+1+1+1.' },
      { question: 'Why is 1729 called the taxicab number?', options: ['It was Hardy’s phone number', 'It is the smallest number expressible as a sum of two cubes in two different ways', 'It is prime', 'It is a perfect square'], answer: 1, explanation: '1³ + 12³ = 9³ + 10³.' },
      { question: 'The Raman effect is…', options: ['Reflection from mirrors', 'Inelastic scattering of light, shifted in frequency by molecular vibrations', 'Fluorescence', 'The blue colour of the sky'], answer: 1, explanation: 'Discovered with K. S. Krishnan in 1928.' },
      { question: 'Anti-Stokes Raman lines are weaker than Stokes lines because…', options: ['The laser is weak', 'Fewer molecules are already in excited vibrational states', 'They are absorbed', 'They are blue'], answer: 1, explanation: 'Boltzmann factor.' },
      { question: 'Raman was the first Asian to win a Nobel Prize in…', options: ['Literature', 'Physics', 'Chemistry', 'Medicine'], answer: 1, explanation: '1930.' },
      { question: 'What was new in Bose’s 1924 derivation of Planck’s law?', options: ['He used classical waves', 'He counted photons as indistinguishable particles', 'He measured the Sun', 'He used relativity'], answer: 1, explanation: 'Einstein translated and published it.' },
      { question: 'Particles obeying Bose’s statistics are called…', options: ['Fermions', 'Bosons', 'Quarks', 'Photinos'], answer: 1, explanation: 'Named by Dirac.' },
      { question: 'A Bose–Einstein condensate forms when…', options: ['A gas is heated', 'Bosons are cooled so much that many occupy the same quantum state', 'Electrons pair up in metals', 'Light is focused'], answer: 1, explanation: 'First made in 1995.' },
      { question: 'Which of these was said of Ramanujan by Hardy?', options: ['That he could not do proofs at all', 'That the formulas “must be true, because if they were not true, no one would have had the imagination to invent them”', 'That he was an average student', 'That he copied results'], answer: 1, explanation: 'On first reading the 1913 letter.' }
    ]);
  };
})();
