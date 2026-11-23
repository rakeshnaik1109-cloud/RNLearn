/* ==========================================================================
   RNLearn — Darwin and Wallace (Minds That Changed How We Know, Part 8)
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
    { name: 'Voyages', color: '#b45309' },
    { name: 'The theory', color: '#1d4ed8' },
    { name: 'Testing it', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1798', icon: '📈', era: 0, sec: 5, title: 'Malthus', text: 'Thomas Malthus argues that population tends to grow faster than food supply, checked by famine and disease.' },
    { year: '1809', icon: '👶', era: 0, sec: 3, title: 'Darwin born', text: 'Charles Darwin is born in Shrewsbury, England, on 12 February.' },
    { year: '1831–36', icon: '⛵', era: 0, sec: 3, title: 'The Beagle', text: 'Darwin sails round the world as naturalist on HMS Beagle, visiting South America and the Galápagos Islands.' },
    { year: '1838', icon: '💡', era: 1, sec: 5, title: 'Reading Malthus', text: 'In September, reading Malthus “for amusement”, Darwin grasps the idea of natural selection.' },
    { year: '1848–62', icon: '🦋', era: 0, sec: 4, title: 'Wallace’s journeys', text: 'Alfred Russel Wallace collects in the Amazon (1848–52) and then the Malay Archipelago (1854–62).' },
    { year: '1858', icon: '✉️', era: 1, sec: 6, title: 'The Ternate letter', text: 'Wallace sends Darwin an essay describing natural selection; on 1 July their papers are read together at the Linnean Society.' },
    { year: '1859', icon: '📗', era: 1, sec: 7, title: 'On the Origin of Species', text: 'Darwin’s book is published on 24 November.' },
    { year: '1860', icon: '🎤', era: 2, sec: 9, title: 'The Oxford debate', text: 'Thomas Henry Huxley and Bishop Samuel Wilberforce clash at the British Association meeting in Oxford.' },
    { year: '1930s–40s', icon: '🧬', era: 2, sec: 11, title: 'The modern synthesis', text: 'Fisher, Haldane, Wright and others unite natural selection with Mendelian genetics.' },
    { year: '1977', icon: '🐦', era: 2, sec: 10, title: 'Evolution observed', text: 'On Daphne Major, Peter and Rosemary Grant measure beaks deepening in a single generation after a drought.' }
  ];

  FIG['fig-m8-timeline'] = function (figEl) {
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
     Figure: Malthus' struggle for existence
     ----------------------------------------------------------------------- */
  FIG['fig-malthus'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var r = 3, K = 100;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ml-r', label: 'Growth per generation (%) if unchecked', min: 1, max: 30, step: 1, value: r, onChange: function (x) { r = x; draw(); } });
    FIG.slider(controls, { id: 'ml-k', label: 'Food added each generation (people it feeds)', min: 20, max: 300, step: 10, value: K, onChange: function (x) { K = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Geometric growth of population against arithmetic growth of food'), W = A.W, svg = A.svg, fs = A.fs, N0 = 1000, G = 100;
      var pop = function (g) { return N0 * Math.pow(1 + r / 100, g); }, food = function (g) { return N0 * 1.2 + K * g; };
      var ymax = Math.max(food(G), 5000);
      var P = plotAxes(svg, c, fs, { L: 64, R: W - 14, T: 30, B: 224, xl: 0, xh: G, yl: 0, yh: ymax, xticks: [0, 25, 50, 75, 100], yticks: [0, ymax / 2, ymax], yfmt: function (v) { return fmt(v, 0); }, xlab: 'generations', ylab: 'people' });
      plotLine(svg, P, food, 0, G, 2, GREEN, 2.4); plotLine(svg, P, pop, 0, G, 200, RED, 2.4, '6 3');
      var cross = null; for (var g = 0; g <= G; g += 0.1) if (pop(g) > food(g)) { cross = g; break; }
      if (cross !== null) { el('circle', { cx: P.X(cross), cy: P.Y(food(cross)), r: 5, fill: AMBER }, svg); }
      legend(svg, c, fs, W, 'red dashed: unchecked population, growing geometrically · green: food, growing arithmetically', 'red: population · green: food');
      out.innerHTML = (cross !== null ? 'Population would outstrip food after about <strong>' + fmt(cross, 0) + ' generations</strong>; afterwards, most of those born cannot survive.' : 'Within 100 generations food keeps up, but any constant geometric growth must eventually overtake arithmetic growth.') + NOTE + 'Malthus argued in 1798 that population, unchecked, increases geometrically (1, 2, 4, 8…) while food can increase only arithmetically (1, 2, 3, 4…), so famine, disease and other checks must hold numbers down. Reading this in 1838, Darwin realised that in nature, where every species produces far more offspring than can survive, a constant struggle must favour any variation that gives the slightest advantage. Wallace had the same insight, also from Malthus, twenty years later.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: selection on the peppered moth
     ----------------------------------------------------------------------- */
  FIG['fig-moth'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var s = 0.2, p0 = 0.01, env = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'mo-s', label: 'Survival advantage of camouflaged moths (%)', min: 0, max: 50, step: 1, value: s * 100, onChange: function (x) { s = x / 100; draw(); } });
    choice(controls, 'Tree bark', ['Sooty (industrial)', 'Clean (after clean-air laws)'], 0, function (i) { env = i; p0 = i ? 0.95 : 0.01; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Frequency of dark moths over generations'), W = A.W, svg = A.svg, fs = A.fs, G = 100;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: G, yl: 0, yh: 1, xticks: [0, 20, 40, 60, 80, 100], yticks: [0, 0.5, 1], yfmt: function (v) { return fmt(v * 100, 0) + '%'; }, xlab: 'generations (one per year)', ylab: 'dark moths' });
      var q = p0, pts = [], half = null;
      for (var g = 0; g <= G; g++) { pts.push([g, q]); if (half === null && (env ? q < 0.5 : q > 0.5)) half = g; var wD = env ? 1 - s : 1, wL = env ? 1 : 1 - s; q = q * wD / (q * wD + (1 - q) * wL); }
      el('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + P.X(p[0]).toFixed(1) + ' ' + P.Y(p[1]).toFixed(1); }).join(''), fill: 'none', stroke: c.ink2, 'stroke-width': 2.6 }, svg);
      legend(svg, c, fs, W, env ? 'clean bark: pale moths are better camouflaged and birds eat more dark ones' : 'sooty bark: dark moths are better camouflaged and birds eat more pale ones', env ? 'clean bark favours pale moths' : 'sooty bark favours dark moths');
      out.innerHTML = 'With a ' + fmt(s * 100, 0) + '% survival advantage, the dark form ' + (env ? 'falls below half' : 'passes half the population') + (half !== null ? ' after about <strong>' + half + ' generations</strong>' : ' only after more than 100 generations') + '.' + NOTE + 'Dark (melanic) peppered moths were first recorded near Manchester in 1848; by the 1890s they made up about 98% of local populations, as soot darkened the trees. After clean-air laws in the 1950s, the pale form returned. Bernard Kettlewell’s experiments in the 1950s linked the change to bird predation; critics later questioned his methods, but a large study by Michael Majerus, published in 2012, confirmed that birds eat conspicuous moths more often. A small, steady advantage compounds over generations into a large change. (Simplified one-gene model.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the Grants' finches and the breeder's equation
     ----------------------------------------------------------------------- */
  FIG['fig-beaks'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var surv = 15, h2 = 0.7;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bk-s', label: 'Birds surviving the drought (%)', min: 5, max: 100, step: 5, value: surv, onChange: function (x) { surv = x; draw(); } });
    FIG.slider(controls, { id: 'bk-h', label: 'Heritability of beak depth', min: 0, max: 1, step: 0.05, value: h2, onChange: function (x) { h2 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var mu = 9.4, sd = 0.9;
    function npdf(x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); }
    function qnorm(p) { var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924], b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857], cc = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878], d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], q, r; if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((cc[0] * q + cc[1]) * q + cc[2]) * q + cc[3]) * q + cc[4]) * q + cc[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } if (p > 1 - 0.02425) return -qnorm(1 - p); q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Distribution of beak depth before and after selection'), W = A.W, svg = A.svg, fs = A.fs;
      var f = surv / 100, z = f >= 1 ? -9 : qnorm(1 - f), cut = mu + z * sd, meanSel = f >= 1 ? mu : mu + sd * npdf(z, 0, 1) / f, S = meanSel - mu, R = h2 * S;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 6.5, xh: 13, yl: 0, yh: 0.55, xticks: [7, 8, 9, 10, 11, 12, 13], yticks: [], xlab: 'beak depth (mm)' });
      var d1 = '', d2 = '', d3 = ''; for (var k = 0; k <= 200; k++) { var x = 6.5 + 6.5 * k / 200; d1 += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(npdf(x, mu, sd)).toFixed(1); d3 += (k ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(npdf(x, mu + R, sd)).toFixed(1); }
      var area = 'M' + P.X(Math.max(6.5, cut)) + ' ' + P.Y(0); for (k = 0; k <= 100; k++) { var x2 = Math.max(6.5, cut) + (13 - Math.max(6.5, cut)) * k / 100; area += 'L' + P.X(x2).toFixed(1) + ' ' + P.Y(npdf(x2, mu, sd)).toFixed(1); } area += 'L' + P.X(13) + ' ' + P.Y(0) + 'Z';
      el('path', { d: area, fill: AMBER + '55' }, svg);
      el('path', { d: d1, fill: 'none', stroke: c.ink2, 'stroke-width': 2 }, svg); el('path', { d: d3, fill: 'none', stroke: MC, 'stroke-width': 2.4, 'stroke-dasharray': '6 3' }, svg);
      [[mu, c.ink2, 'parents’ mean'], [meanSel, AMBER, 'survivors’ mean'], [mu + R, MC, 'offspring mean']].forEach(function (m, i) { el('line', { x1: P.X(m[0]), y1: P.Y(0.5) + i * 0, x2: P.X(m[0]), y2: P.Y(0), stroke: m[1], 'stroke-width': 1.5, 'stroke-dasharray': '2 2' }, svg); });
      legend(svg, c, fs, W, 'grey: beaks before the drought · shaded: survivors (deep beaks crack the remaining hard seeds) · dashed: next generation', 'grey: before · shaded: survivors · dashed: offspring');
      out.innerHTML = 'Selection differential S = ' + fmt(S, 2) + ' mm; response in the next generation R = h²S = <strong>' + fmt(R, 2) + ' mm</strong> (' + fmt(R / mu * 100, 1) + '% deeper beaks).' + NOTE + 'In the 1977 drought on the Galápagos island Daphne Major, most small seeds were eaten, and medium ground finches with deeper, stronger beaks, able to crack large hard seeds, survived far better; about 85% of the population died. Peter and Rosemary Grant found that the next generation’s beaks were measurably deeper, by roughly 4–5%. The “breeder’s equation” R = h²S predicts the change from the strength of selection S and the heritability h², the fraction of variation passed from parents to offspring. Here survival is modelled as a sharp cut-off by beak size, which exaggerates the effect: in reality survival depended only partly on beaks.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: genetic drift
     ----------------------------------------------------------------------- */
  FIG['fig-drift'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 50, seed = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'dr-n', label: 'Population size (log₁₀)', min: 1, max: 4, step: 0.1, value: 1.7, onChange: function (x) { N = Math.round(Math.pow(10, x)); draw(); } });
    var row = group(controls, 'Chance'); btn('Run again', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function binom(n, p, r) { if (n < 60) { var k = 0; for (var i = 0; i < n; i++) if (r() < p) k++; return k; } var m = n * p, s = Math.sqrt(n * p * (1 - p)); var u = Math.max(1e-12, r()), v = r(), z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); return Math.max(0, Math.min(n, Math.round(m + s * z))); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Random changes in gene frequency in small and large populations'), W = A.W, svg = A.svg, fs = A.fs, G = 200, r = rngSeed(seed * 101 + N);
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: G, yl: 0, yh: 1, xticks: [0, 50, 100, 150, 200], yticks: [0, 0.5, 1], yfmt: function (v) { return fmt(v * 100, 0) + '%'; }, xlab: 'generations', ylab: 'frequency of a neutral variant' });
      var fixed = 0, lost = 0, COLS = [MC, AMBER, PURPLE, BLUE, RED, GREEN, '#db2777', '#65a30d'];
      for (var run = 0; run < 8; run++) { var q = 0.5, d = 'M' + P.X(0) + ' ' + P.Y(q); for (var g = 1; g <= G; g++) { q = binom(2 * N, q, r) / (2 * N); d += 'L' + P.X(g).toFixed(1) + ' ' + P.Y(q).toFixed(1); } if (q === 1) fixed++; if (q === 0) lost++; el('path', { d: d, fill: 'none', stroke: COLS[run], 'stroke-width': 1.6, opacity: 0.85 }, svg); }
      legend(svg, c, fs, W, 'eight populations, each starting at 50%; no selection at all, only the luck of which parents happen to reproduce', 'eight runs, no selection, only chance');
      out.innerHTML = 'Population of <strong>' + N.toLocaleString('en-GB') + '</strong>: in 200 generations the variant was lost in ' + lost + ' and fixed (reached 100%) in ' + fixed + ' of 8 populations.' + NOTE + 'Not all evolution is adaptive. In every generation, chance decides which individuals happen to reproduce, so gene frequencies wander even when no variant is better than another: <em>genetic drift</em>. In small populations drift is fast and can fix or eliminate variants regardless of their value; in large ones selection dominates. Sewall Wright developed the mathematics of drift in the 1930s, and Motoo Kimura’s neutral theory of 1968 argued that much molecular evolution is drift. Darwin knew nothing of genes; combining his theory with genetics was the work of the twentieth century. (Wright–Fisher model.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which book gave both Darwin and Wallace the key to natural selection?', options: ['Lyell’s Principles of Geology', 'Malthus’s Essay on the Principle of Population', 'Paley’s Natural Theology', 'Newton’s Principia'], answer: 1, explanation: 'Overproduction leads to a struggle for existence.' },
      { question: 'What three ingredients does natural selection need?', options: ['Mutation, sex and death', 'Variation, inheritance and differential survival or reproduction', 'Climate, food and predators', 'Time, energy and chance'], answer: 1, explanation: 'Darwin did not know the mechanism of inheritance.' },
      { question: 'Where was Wallace when he wrote his essay on natural selection in 1858?', options: ['London', 'The Galápagos', 'The Malay Archipelago (Ternate/Gilolo)', 'Brazil'], answer: 2, explanation: 'During a bout of malarial fever.' },
      { question: 'How were Darwin’s and Wallace’s ideas first presented in 1858?', options: ['In Darwin’s book', 'As a joint reading at the Linnean Society', 'In a newspaper', 'At the Royal Society'], answer: 1, explanation: 'Arranged by Lyell and Hooker.' },
      { question: 'The Wallace Line separates…', options: ['Africa from Asia', 'The animals of Asian and Australian character in the Indonesian islands', 'North and South America', 'Two oceans'], answer: 1, explanation: 'Between Bali and Lombok, among others.' },
      { question: 'In the peppered moth, dark moths increased in the 19th century because…', options: ['Soot caused mutations', 'Soot-darkened trees made them better camouflaged from birds', 'They were bred deliberately', 'They migrated in'], answer: 1, explanation: 'And declined again after clean-air laws.' },
      { question: 'The breeder’s equation R = h²S predicts…', options: ['Mutation rates', 'The response to selection from heritability and selection strength', 'Population size', 'Extinction risk'], answer: 1, explanation: 'Used by the Grants for finch beaks.' },
      { question: 'Genetic drift is strongest in…', options: ['Large populations', 'Small populations', 'Populations under strong selection', 'Plants only'], answer: 1, explanation: 'Chance sampling matters most when numbers are small.' },
      { question: 'Darwin’s biggest gap was…', options: ['No evidence of variation', 'No correct theory of inheritance', 'No fossils', 'No time'], answer: 1, explanation: 'Filled by Mendelian genetics in the 20th century.' },
      { question: 'Wallace later differed from Darwin by arguing that…', options: ['Selection does not exist', 'Natural selection could not fully explain the human mind', 'Species never change', 'Evolution is fast'], answer: 1, explanation: 'He was also drawn to spiritualism.' }
    ]);
  };
})();
