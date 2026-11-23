/* ==========================================================================
   RNLearn — Aryabhata and Brahmagupta (Minds That Changed How We Know, Part 3)
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
    { name: 'Place value', color: '#b45309' },
    { name: 'Aryabhata and Brahmagupta', color: '#1d4ed8' },
    { name: 'Spreading the numerals', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '458', icon: '🔢', era: 0, sec: 3, title: 'Place value in a Jain text', text: 'The Lokavibhāga, a Jain cosmology dated to 458 CE, writes large numbers with a decimal place-value system using words, including a word for zero.' },
    { year: '499', icon: '📜', era: 1, sec: 4, title: 'The Āryabhaṭīya', text: 'Aryabhata, aged 23, composes 121 verses on arithmetic, astronomy and a rotating Earth.' },
    { year: '628', icon: '0️⃣', era: 1, sec: 8, title: 'Rules for zero', text: 'Brahmagupta’s Brāhmasphuṭasiddhānta gives rules for calculating with zero and with negative numbers (“debts”).' },
    { year: '683', icon: '🪨', era: 0, sec: 15, title: 'A dot for zero in stone', text: 'An inscription in Cambodia dated 605 of the Śaka era (683 CE) writes the year with a dot for zero: one of the oldest dated zeros.' },
    { year: 'c. 773', icon: '🕌', era: 2, sec: 10, title: 'Indian astronomy in Baghdad', text: 'An Indian astronomer brings a Sanskrit astronomical text to the court of the caliph al-Manṣūr; it is translated into Arabic as the Sindhind.' },
    { year: 'c. 825', icon: '📗', era: 2, sec: 10, title: 'Al-Khwārizmī', text: 'Muḥammad ibn Mūsā al-Khwārizmī writes on calculation with Indian numerals; his name later gives us the word “algorithm”.' },
    { year: '876', icon: '🛕', era: 0, sec: 15, title: 'Zero at Gwalior', text: 'An inscription at the Chaturbhuj temple in Gwalior writes 270 and 50 with a round zero, the oldest dated zero of this shape in India.' },
    { year: '1150', icon: '🔄', era: 1, sec: 11, title: 'Bhāskara II', text: 'Bhāskara II solves x² − 61y² = 1 with the chakravāla method, five centuries before Fermat posed the same problem in Europe.' },
    { year: '1202', icon: '🇮🇹', era: 2, sec: 10, title: 'Fibonacci’s Liber Abaci', text: 'Leonardo of Pisa introduces the nine Indian figures and the zero to European merchants.' },
    { year: 'c. 1400', icon: '♾️', era: 1, sec: 11, title: 'Mādhava’s series', text: 'Mādhava of Saṅgamagrāma in Kerala finds infinite series for π and for sines, three centuries before similar series in Europe.' }
  ];

  FIG['fig-m3-timeline'] = function (figEl) {
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
     Figure: does the Earth turn or the sky?
     ----------------------------------------------------------------------- */
  FIG['fig-rotation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, ang = 0, svg, W, gE, gS, view, stars = [], rnd = rngSeed(21);
    for (var k = 0; k < 40; k++) stars.push([rnd() * 2 * Math.PI, 0.55 + rnd() * 0.4]);
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Aryabhata: the Earth turns', 'Traditional: the sky turns'], 0, function (i) { mode = i; });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var vstars = [];
    function setup() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 470 : 285, 'Two models of daily motion and the view from the ground'); W = A.W; svg = A.svg; var fs = A.fs;
      var cx = narrow ? W / 2 : W * 0.25, cy = narrow ? 130 : 135, R = 105;
      el('circle', { cx: cx, cy: cy, r: R + 8, fill: '#0b1023' }, svg);
      gS = el('g', {}, svg); stars.forEach(function (s) { el('circle', { cx: cx + R * s[1] * Math.cos(s[0]), cy: cy + R * s[1] * Math.sin(s[0]), r: 1.6, fill: '#fef3c7' }, gS); });
      gE = el('g', {}, svg); el('circle', { cx: cx, cy: cy, r: 28, fill: '#2563eb' }, gE); el('circle', { cx: cx, cy: cy - 28, r: 5, fill: '#f59e0b', stroke: '#fff' }, gE); el('line', { x1: cx, y1: cy - 28, x2: cx, y2: cy - 52, stroke: '#f59e0b', 'stroke-width': 2 }, gE);
      txt(svg, cx, cy + R + 24, 'seen from above the North Pole', { size: fs(9), fill: c.muted });
      var vx = narrow ? 20 : W * 0.52, vy = narrow ? 290 : 40, vw = narrow ? W - 40 : W * 0.45, vh = 150;
      el('rect', { x: vx, y: vy, width: vw, height: vh, fill: '#0b1023', rx: 6 }, svg);
      el('rect', { x: vx, y: vy + vh - 26, width: vw, height: 26, fill: '#14532d', rx: 0 }, svg);
      txt(svg, vx + 8, vy + vh - 9, 'east', { anchor: 'start', size: fs(9), fill: '#d1fae5' }); txt(svg, vx + vw - 8, vy + vh - 9, 'west', { anchor: 'end', size: fs(9), fill: '#d1fae5' });
      txt(svg, vx + vw / 2, vy + vh + 16, 'what the observer (orange) sees overhead', { size: fs(9), fill: c.muted });
      view = { x: vx, y: vy, w: vw, h: vh - 26, cx: cx, cy: cy, R: R };
      vstars = stars.map(function () { return el('circle', { r: 1.8, fill: '#fef3c7' }, svg); });
      legend(svg, c, fs, W, 'left: the cosmos in the chosen model · right: the observer’s sky, identical in both models', 'left: model · right: observer’s view');
    }
    function frame() {
      ang += 0.006;
      var e = mode === 0 ? ang : 0, s = mode === 0 ? 0 : -ang;
      gE.setAttribute('transform', 'rotate(' + (e * 180 / Math.PI) + ' ' + view.cx + ' ' + view.cy + ')');
      gS.setAttribute('transform', 'rotate(' + (s * 180 / Math.PI) + ' ' + view.cx + ' ' + view.cy + ')');
      stars.forEach(function (st, i) { var rel = st[0] + s - e + Math.PI / 2, u = Math.sin(rel), vis = Math.cos(rel) < 0; var x = view.x + view.w / 2 - u * view.w / 2, y = view.y + view.h * (1 - st[1]) * 0.9 + 6; vstars[i].setAttribute('cx', x.toFixed(1)); vstars[i].setAttribute('cy', y.toFixed(1)); vstars[i].setAttribute('opacity', vis ? 1 : 0); });
    }
    setup();
    out.innerHTML = 'Both models produce exactly the same view from the ground: stars rise in the east and set in the west once a day.' + NOTE + 'Aryabhata wrote: “Just as a man in a boat moving forward sees stationary objects moving backward, so the stationary stars are seen by people at Laṅkā [on the equator] as moving exactly towards the west.” He gave 1,582,237,500 rotations of the Earth in a cycle of 4,320,000 years, a sidereal day of about 23 h 56 min 4.1 s, very close to the modern value. Without instruments able to detect the Earth’s motion, observation alone could not decide between the models, and most later Indian astronomers kept the turning sky.</span>';
    window.addEventListener('resize', setup);
    onTheme(setup);
    FIG.animate(figEl, frame);
  };

  /* -----------------------------------------------------------------------
     Figure: Aryabhata's sine table
     ----------------------------------------------------------------------- */
  FIG['fig-jya'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = [225, 224, 222, 219, 215, 210, 205, 199, 191, 183, 174, 164, 154, 143, 131, 119, 106, 93, 79, 65, 51, 37, 22, 7], J = [], s = 0, sel = 8;
    D.forEach(function (d) { s += d; J.push(s); });
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'jy-i', label: 'Table entry (each step is 3° 45′)', min: 1, max: 24, step: 1, value: sel, onChange: function (x) { sel = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Aryabhata’s tabulated sines compared with modern values'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 58, R: W - 14, T: 30, B: 234, xl: 0, xh: 90, yl: 0, yh: 3600, xticks: [0, 15, 30, 45, 60, 75, 90], yticks: [0, 1000, 2000, 3000], xlab: 'angle (degrees)', ylab: 'jyā (half-chord), radius 3438' });
      plotLine(svg, P, function (a) { return 3438 * Math.sin(a * Math.PI / 180); }, 0, 90, 120, c.border, 2);
      J.forEach(function (v, i) { var a = (i + 1) * 3.75; el('circle', { cx: P.X(a), cy: P.Y(v), r: i + 1 === sel ? 6 : 3.5, fill: i + 1 === sel ? RED : MC }, svg); });
      var a = sel * 3.75, tv = 3438 * Math.sin(a * Math.PI / 180);
      el('line', { x1: P.X(a), y1: P.Y(0), x2: P.X(a), y2: P.Y(J[sel - 1]), stroke: RED, 'stroke-dasharray': '3 3' }, svg);
      legend(svg, c, fs, W, 'dots: Aryabhata’s 24 values, built by adding his sine differences · grey: modern R sin θ', 'dots: Aryabhata · grey: modern');
      var deg = Math.floor(a), mins = Math.round((a - deg) * 60);
      out.innerHTML = 'Entry ' + sel + ': angle ' + deg + '° ' + mins + '′. Aryabhata: <strong>' + J[sel - 1] + '</strong>; modern 3438 × sin θ = <strong>' + fmt(tv, 1) + '</strong> (difference ' + fmt(J[sel - 1] - tv, 1) + ').' + NOTE + 'Greek astronomers tabulated whole chords; Indian astronomers used the half-chord, <em>jyā</em>, which is our sine. Aryabhata gave only the 24 differences between successive values (225, 224, 222, …, 7) in a single compact verse, using a circle of radius 3438, the number of minutes of arc in a radian, so that small angles and their sines have the same numerical value. Through Arabic <em>jiba</em>, misread as <em>jaib</em> (“fold”) and translated into Latin as <em>sinus</em>, the word became “sine”.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Brahmagupta's rules for fortunes, debts and zero
     ----------------------------------------------------------------------- */
  FIG['fig-zero'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 3, b = -5, op = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'zr-a', label: 'First number', min: -9, max: 9, step: 1, value: a, onChange: function (x) { a = x; draw(); } });
    FIG.slider(controls, { id: 'zr-b', label: 'Second number', min: -9, max: 9, step: 1, value: b, onChange: function (x) { b = x; draw(); } });
    choice(controls, 'Operation', ['add', 'subtract', 'multiply', 'divide'], 0, function (i) { op = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function name(x) { return x > 0 ? 'a fortune of ' + x : x < 0 ? 'a debt of ' + (-x) : 'zero'; }
    function kind(x) { return x > 0 ? 'fortune' : x < 0 ? 'debt' : 'zero'; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 150, 'A number line of fortunes and debts'), W = A.W, svg = A.svg, fs = A.fs;
      var res, rule, modern;
      if (op === 0) { res = a + b; rule = (a && b && kind(a) === kind(b)) ? 'The sum of two ' + kind(a) + 's is a ' + kind(a) + '.' : (!a || !b) ? 'A ' + (a ? kind(a) : kind(b)) + ' plus zero is ' + (a || b ? 'the same ' + (a ? kind(a) : kind(b)) : 'zero') + '; zero plus zero is zero.' : 'The sum of a fortune and a debt is their difference; if they are equal, it is zero.'; }
      else if (op === 1) { res = a - b; rule = b === 0 ? 'A ' + kind(a) + ' minus zero is a ' + kind(a) + '.' : a === 0 ? 'Zero minus a ' + kind(b) + ' is a ' + (b > 0 ? 'debt' : 'fortune') + '.' : 'Subtracting a ' + kind(b) + ' is like adding the opposite: when the greater is taken from the less, the difference is reversed.'; }
      else if (op === 2) { res = a * b; rule = (!a || !b) ? 'The product of zero and a fortune, a debt or zero is zero.' : kind(a) === kind(b) ? 'The product of two ' + kind(a) + 's is a fortune.' : 'The product of a debt and a fortune is a debt.'; }
      else { if (b !== 0) { res = a / b; rule = a === 0 ? 'Zero divided by a fortune or a debt is zero.' : kind(a) === kind(b) ? 'A ' + kind(a) + ' divided by a ' + kind(b) + ' is a fortune.' : 'A fortune divided by a debt, or a debt by a fortune, is a debt.'; } else if (a === 0) { res = 0; rule = 'Zero divided by zero is zero. (Brahmagupta’s rule; today 0 ÷ 0 is left undefined.)'; } else { res = null; rule = 'A ' + kind(a) + ' divided by zero is a fraction with zero as its denominator (<em>taccheda</em>). (Brahmagupta left it there; today division by zero is undefined.)'; } }
      var L = 30, R = W - 30, X = function (v) { return L + (v + 81) / 162 * (R - L); }, rng = Math.max(10, Math.abs(a), Math.abs(b), Math.abs(res || 0)), Xs = function (v) { return (L + R) / 2 + v / rng * (R - L) / 2; };
      el('line', { x1: L, y1: 80, x2: R, y2: 80, stroke: c.muted, 'stroke-width': 1.5 }, svg);
      el('rect', { x: L, y: 74, width: (R - L) / 2, height: 12, fill: RED + '22' }, svg); el('rect', { x: (L + R) / 2, y: 74, width: (R - L) / 2, height: 12, fill: GREEN + '22' }, svg);
      txt(svg, L, 104, 'debts (negative)', { anchor: 'start', size: fs(9), fill: RED }); txt(svg, R, 104, 'fortunes (positive)', { anchor: 'end', size: fs(9), fill: GREEN }); txt(svg, (L + R) / 2, 104, '0', { size: fs(10), fill: c.ink, weight: 700 });
      [[a, BLUE, 'a'], [b, AMBER, 'b']].forEach(function (p, i) { el('circle', { cx: Xs(p[0]), cy: 80, r: 6, fill: p[1] }, svg); txt(svg, Xs(p[0]), 66 - i * 14, p[2] + ' = ' + p[0], { size: fs(10), fill: p[1], weight: 700 }); });
      if (res !== null && isFinite(res)) { el('path', { d: 'M' + Xs(res) + ' 92l-7 12h14z', fill: MC }, svg); txt(svg, Xs(res), 132, 'result ' + (Number.isInteger(res) ? res : fmt(res, 3)), { size: fs(10), fill: MC, weight: 700 }); }
      legend(svg, c, fs, W, 'Brahmagupta called positive numbers “fortunes” (dhana) and negative numbers “debts” (ṛṇa)', 'fortunes (+) and debts (−)');
      var sym = ['+', '−', '×', '÷'][op];
      out.innerHTML = '<strong>' + name(a) + ' ' + sym + ' ' + name(b) + '</strong> = ' + (res === null ? '<strong>undefined</strong>' : '<strong>' + name(Number.isInteger(res) ? res : +res.toFixed(3)) + '</strong>') + '.<br>Brahmagupta’s rule: ' + rule + NOTE + 'In 628 CE Brahmagupta stated, in verse, rules for arithmetic with zero and negative numbers that are almost exactly those taught today. Treating zero as a number in its own right, not just an empty place, was a decisive step. Only his rule that 0 ÷ 0 = 0 and his vagueness about a ÷ 0 differ from modern practice, where both are left undefined.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Brahmagupta's composition and Pell's equation
     ----------------------------------------------------------------------- */
  FIG['fig-pell'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 92, more = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pl-n', label: 'N in x² − N y² = 1 (not a square)', min: 2, max: 99, step: 1, value: N, onChange: function (x) { N = x; more = 0; draw(); } });
    var row = group(controls, 'Composition');
    btn('Compose again: next solution', row).addEventListener('click', function () { more = Math.min(more + 1, 6); draw(); });
    var view = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function fund(n) { var a0 = BigInt(Math.floor(Math.sqrt(n))), m = 0n, d = 1n, a = a0, h1 = 1n, h = a0, k1 = 0n, k = 1n, Nb = BigInt(n); for (var it = 0; it < 500; it++) { if (h * h - Nb * k * k === 1n) return [h, k]; m = d * a - m; d = (Nb - m * m) / d; a = (a0 + m) / d; var h2 = a * h + h1, k2 = a * k + k1; h1 = h; h = h2; k1 = k; k = k2; } return null; }
    function draw() {
      var sq = Math.round(Math.sqrt(N)); if (sq * sq === N) { view.innerHTML = '<p style="font-family:var(--font-sans);padding:0.6rem;color:var(--ink-muted)">' + N + ' is a perfect square: x² − ' + N + 'y² = 1 has no solutions in positive whole numbers. Choose another N.</p>'; out.innerHTML = 'Choose a number that is not a perfect square.'; return; }
      var f = fund(N), sols = [f], Nb = BigInt(N);
      for (var i = 0; i < more; i++) { var p = sols[sols.length - 1]; sols.push([p[0] * f[0] + Nb * p[1] * f[1], p[0] * f[1] + p[1] * f[0]]); }
      var rows = sols.map(function (s, i) { return '<tr><td style="padding:3px 8px;color:var(--ink-muted)">' + (i + 1) + '</td><td style="padding:3px 8px;font-family:var(--font-mono,monospace);word-break:break-all">' + s[0].toString() + '</td><td style="padding:3px 8px;font-family:var(--font-mono,monospace);word-break:break-all">' + s[1].toString() + '</td></tr>'; }).join('');
      var route = N === 92 ? '<p style="margin:0.6rem 0 0"><strong>Brahmagupta’s route for N = 92:</strong> 10² − 92 × 1² = 8 (an easy “near miss”). Compose it with itself: (10² + 92 × 1², 2 × 10 × 1) = (192, 20), with 192² − 92 × 20² = 64 = 8². Divide by 8: (24, 5/2) satisfies 24² − 92 × (5/2)² = 1. Compose that with itself: (24² + 92 × (5/2)², 2 × 24 × 5/2) = <strong>(1151, 120)</strong>. ✓</p>' : '';
      view.innerHTML = '<div style="font-family:var(--font-sans);font-size:0.9rem;margin-top:0.6rem;overflow-x:auto"><table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;padding:3px 8px">#</th><th style="text-align:left;padding:3px 8px">x</th><th style="text-align:left;padding:3px 8px">y</th></tr></thead><tbody>' + rows + '</tbody></table>' + route + '</div>';
      out.innerHTML = 'Smallest solution of x² − ' + N + 'y² = 1: x = <strong>' + f[0].toString() + '</strong>, y = <strong>' + f[1].toString() + '</strong> (' + f[0].toString().length + ' digits).' + NOTE + 'Brahmagupta discovered that solutions can be combined: if x₁² − Ny₁² = k₁ and x₂² − Ny₂² = k₂, then (x₁x₂ + Ny₁y₂)² − N(x₁y₂ + x₂y₁)² = k₁k₂. This <em>bhāvanā</em> (composition) turns one solution into infinitely many, and turns near misses into exact solutions. He wrote that anyone who could solve x² − 92y² = 1 within a year was truly a mathematician. Try N = 61, the case Fermat set as a challenge in 1657, which Bhāskara II had already solved in 1150.</span>';
    }
    draw();
  };

  FIG['fig-quiz-m3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'In what year did Aryabhata write the Āryabhaṭīya?', options: ['c. 300 BCE', '499 CE', '628 CE', '1150 CE'], answer: 1, explanation: 'He says he was 23 when 3,600 years of the Kali age had passed.' },
      { question: 'What did Aryabhata claim about the daily motion of the stars?', options: ['The stars really circle the Earth', 'The Earth rotates, and the stars only appear to move west', 'The stars do not move at all, nor does the Earth', 'The Sun pulls the stars'], answer: 1, explanation: 'His analogy: a man in a moving boat sees the shore move backwards.' },
      { question: 'Aryabhata’s value of π, 62,832 ÷ 20,000, equals…', options: ['3.14', '3.1416', '3.142857', '3.16'], answer: 1, explanation: 'He called it “approximate” (āsanna).' },
      { question: 'The word “sine” comes ultimately from…', options: ['Latin sinus, a translation of a misread Arabic version of Sanskrit jyā', 'Greek sinos', 'English sign', 'Arabic sifr'], answer: 0, explanation: 'Jyā → jiba → jaib (“fold”) → sinus.' },
      { question: 'What did Brahmagupta call negative numbers?', options: ['Fortunes', 'Debts', 'Shadows', 'Voids'], answer: 1, explanation: 'Positive numbers were fortunes (dhana).' },
      { question: 'By Brahmagupta’s rules, a debt multiplied by a debt is…', options: ['A debt', 'A fortune', 'Zero', 'Undefined'], answer: 1, explanation: 'As today: negative × negative = positive.' },
      { question: 'Which of Brahmagupta’s rules differs from modern mathematics?', options: ['A fortune plus zero is a fortune', 'Zero divided by zero is zero', 'A fortune times a debt is a debt', 'Zero times anything is zero'], answer: 1, explanation: 'Today 0 ÷ 0 is undefined.' },
      { question: 'Brahmagupta’s bhāvanā lets you…', options: ['Measure angles', 'Combine solutions of x² − Ny² = k to produce new ones', 'Find primes', 'Predict eclipses'], answer: 1, explanation: 'A key tool for “Pell’s equation”.' },
      { question: 'Who introduced the Indian numerals to European merchants in 1202?', options: ['Al-Khwārizmī', 'Fibonacci (Leonardo of Pisa)', 'Gerbert of Aurillac', 'Copernicus'], answer: 1, explanation: 'In the Liber Abaci.' },
      { question: 'What is the oldest dated zero of the familiar round shape in India?', options: ['In the Āryabhaṭīya', 'In an inscription at Gwalior, 876 CE', 'On a Harappan seal', 'In Fibonacci’s book'], answer: 1, explanation: 'A dot for zero appears in a Cambodian inscription of 683 CE.' }
    ]);
  };
})();
