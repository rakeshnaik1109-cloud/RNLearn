/* ==========================================================================
   RNLearn — Ibn al-Haytham and Ibn Sina (Minds That Changed How We Know, Part 4)
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
    { name: 'Translation and learning', color: '#b45309' },
    { name: 'Two great scholars', color: '#1d4ed8' },
    { name: 'Into Latin Europe', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '762', icon: '🏙️', era: 0, sec: 3, title: 'Baghdad founded', text: 'The Abbasid caliph al-Manṣūr founds Baghdad, which becomes the centre of a vast movement to translate Greek, Persian and Indian science into Arabic.' },
    { year: 'c. 850', icon: '👁️', era: 0, sec: 5, title: 'Al-Kindī on vision', text: 'Al-Kindī, “the philosopher of the Arabs”, defends the theory that the eye sends out rays, refining Euclid’s geometrical optics.' },
    { year: '965', icon: '👶', era: 1, sec: 4, title: 'Ibn al-Haytham born', text: 'Abū ʿAlī al-Ḥasan ibn al-Haytham is born in Basra, in modern Iraq.' },
    { year: '980', icon: '👶', era: 1, sec: 9, title: 'Ibn Sina born', text: 'Abū ʿAlī al-Ḥusayn ibn Sīnā is born near Bukhara, in modern Uzbekistan.' },
    { year: '984', icon: '🔍', era: 0, sec: 7, title: 'Ibn Sahl’s law of refraction', text: 'Ibn Sahl, in Baghdad, describes the law of refraction geometrically in a work on burning mirrors and lenses.' },
    { year: 'c. 997', icon: '✉️', era: 1, sec: 12, title: 'Questions and answers', text: 'The young al-Bīrūnī and Ibn Sina exchange letters debating Aristotle’s physics.' },
    { year: 'c. 1011–21', icon: '📕', era: 1, sec: 6, title: 'The Book of Optics', text: 'Ibn al-Haytham writes his seven-book Kitāb al-Manāẓir in Cairo.' },
    { year: 'c. 1025', icon: '⚕️', era: 1, sec: 10, title: 'The Canon of Medicine', text: 'Ibn Sina completes the five books of al-Qānūn fī al-Ṭibb, which will be taught in Europe for six centuries.' },
    { year: 'c. 1200', icon: '📚', era: 2, sec: 13, title: 'Into Latin', text: 'The Book of Optics is translated into Latin as De aspectibus; the Canon had been translated by Gerard of Cremona in the 12th century.' },
    { year: '1604', icon: '🔭', era: 2, sec: 13, title: 'Kepler explains the eye', text: 'Johannes Kepler, building on the perspectivist tradition founded on Ibn al-Haytham, shows that the eye forms an inverted image on the retina.' }
  ];

  FIG['fig-m4-timeline'] = function (figEl) {
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
     Figure: the camera obscura
     ----------------------------------------------------------------------- */
  FIG['fig-pinhole'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d = 1, f = 100, eclipse = true;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ph-d', label: 'Pinhole diameter (mm)', min: 0.1, max: 6, step: 0.05, value: d, onChange: function (x) { d = x; draw(); } });
    FIG.slider(controls, { id: 'ph-f', label: 'Distance from hole to screen (cm)', min: 10, max: 300, step: 5, value: f, onChange: function (x) { f = x; draw(); } });
    choice(controls, 'Sun', ['Partial eclipse', 'Full Sun'], 0, function (i) { eclipse = !i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var fid = 'phb' + Math.floor(Math.random() * 1e6);
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 450 : 285, 'A pinhole camera forming an image of the Sun'), W = A.W, svg = A.svg, fs = A.fs;
      var lam = 550e-6, fmm = f * 10, img = fmm * 0.00931, geo = d, dif = 2.44 * lam * fmm / d, blur = Math.sqrt(geo * geo + dif * dif), dopt = Math.sqrt(2.44 * lam * fmm);
      var sx = 20, sw = narrow ? W - 40 : W * 0.55, sy = 50, sh = 170, hx = sx + sw * 0.35, scx = sx + sw;
      el('rect', { x: hx, y: sy, width: scx - hx, height: sh, fill: '#11182722', stroke: c.muted }, svg);
      el('rect', { x: hx - 3, y: sy, width: 6, height: sh / 2 - Math.max(1.5, d * 2), fill: c.ink2 }, svg); el('rect', { x: hx - 3, y: sy + sh / 2 + Math.max(1.5, d * 2), width: 6, height: sh / 2 - Math.max(1.5, d * 2), fill: c.ink2 }, svg);
      var top = [sx + 8, sy + sh / 2 - 28], bot = [sx + 8, sy + sh / 2 + 28];
      el('line', { x1: top[0], y1: top[1], x2: bot[0], y2: bot[1], stroke: AMBER, 'stroke-width': 4 }, svg); el('path', { d: 'M' + top[0] + ' ' + (top[1] - 8) + 'l-6 10h12z', fill: AMBER }, svg);
      [[top, BLUE], [bot, RED]].forEach(function (p) { var hw = Math.max(1.5, d * 2), ty = sy + sh / 2 + (sy + sh / 2 - p[0][1]) * (scx - hx) / (hx - p[0][0]); el('path', { d: 'M' + p[0][0] + ' ' + p[0][1] + 'L' + hx + ' ' + (sy + sh / 2 - hw) + 'L' + scx + ' ' + (ty - hw * 2) + 'L' + scx + ' ' + (ty + hw * 2) + 'L' + hx + ' ' + (sy + sh / 2 + hw) + 'Z', fill: p[1] + '33', stroke: p[1], 'stroke-width': 0.8 }, svg); });
      txt(svg, sx + 8, sy + sh + 18, 'object', { anchor: 'start', size: fs(9), fill: c.muted }); txt(svg, scx, sy + sh + 18, 'screen: image upside down', { anchor: 'end', size: fs(9), fill: c.muted });
      var ix = narrow ? W / 2 : W * 0.8, iy = narrow ? 340 : 135, R = narrow ? 60 : 70, sigma = blur / img * R;
      var defs = el('defs', {}, svg), flt = el('filter', { id: fid, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); el('feGaussianBlur', { stdDeviation: Math.min(40, sigma * 0.5).toFixed(2) }, flt);
      el('rect', { x: ix - R * 1.6, y: iy - R * 1.6, width: R * 3.2, height: R * 3.2, fill: '#1f2937', rx: 6 }, svg);
      var gI = el('g', { filter: 'url(#' + fid + ')' }, svg); el('circle', { cx: ix, cy: iy, r: R, fill: '#fde68a' }, gI); if (eclipse) el('circle', { cx: ix - R * 0.45, cy: iy + R * 0.35, r: R * 0.98, fill: '#1f2937' }, gI);
      txt(svg, ix, iy + R * 1.6 + 16, 'image on the screen (' + fmt(img, 1) + ' mm across)', { size: fs(9), fill: c.muted });
      legend(svg, c, fs, W, 'each point of the object lights a small patch of the screen through the hole; together they form an inverted image', 'each object point lights a patch');
      out.innerHTML = 'Image of the Sun ' + fmt(img, 1) + ' mm across; blur ≈ <strong>' + fmt(blur, 2) + ' mm</strong> (geometric ' + fmt(geo, 2) + ' mm, diffraction ' + fmt(dif, 2) + ' mm). Sharpest pinhole for this distance: about <strong>' + fmt(dopt, 2) + ' mm</strong>.' + NOTE + 'Ibn al-Haytham explained the camera obscura with light travelling in straight lines from every point of an object. A large hole lets each point light a large patch, so the patches overlap and the image blurs; a small hole gives a sharp but dim image. He watched crescent images of the Sun during eclipses this way. Make the hole very small and a new effect appears that he could not have known: diffraction, which spreads light by about 2.44λf/d, so there is an optimum size, worked out by Lord Rayleigh in 1891.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: refraction, Ptolemy's table and Ibn Sahl's law
     ----------------------------------------------------------------------- */
  FIG['fig-refraction'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var inc = 40, med = 0, MED = [['water', 1.333], ['glass', 1.5]];
    var PT = [[10, 8], [20, 15.5], [30, 22.5], [40, 29], [50, 35], [60, 40.5], [70, 45.5], [80, 50]];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rf-i', label: 'Angle of incidence (degrees)', min: 0, max: 89, step: 1, value: inc, onChange: function (x) { inc = x; draw(); } });
    choice(controls, 'From air into', ['Water', 'Glass'], 0, function (i) { med = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function rr(i) { return Math.asin(Math.sin(i * Math.PI / 180) / MED[med][1]) * 180 / Math.PI; }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 500 : 270, 'Refraction of a ray and a graph of refraction angle against incidence'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = narrow ? W / 2 : W * 0.24, cy = 140, R = narrow ? Math.min(110, W * 0.35) : Math.min(110, W * 0.2), r = rr(inc);
      el('rect', { x: cx - R - 10, y: cy, width: 2 * R + 20, height: R + 10, fill: (med ? '#94a3b8' : BLUE) + '33' }, svg);
      el('line', { x1: cx, y1: cy - R - 10, x2: cx, y2: cy + R + 10, stroke: c.border, 'stroke-dasharray': '4 3' }, svg); el('line', { x1: cx - R - 10, y1: cy, x2: cx + R + 10, y2: cy, stroke: c.muted }, svg);
      var ia = inc * Math.PI / 180, ra = r * Math.PI / 180;
      el('line', { x1: cx - R * Math.sin(ia), y1: cy - R * Math.cos(ia), x2: cx, y2: cy, stroke: AMBER, 'stroke-width': 3 }, svg);
      el('line', { x1: cx, y1: cy, x2: cx + R * Math.sin(ra), y2: cy + R * Math.cos(ra), stroke: AMBER, 'stroke-width': 3 }, svg);
      txt(svg, cx - R, cy - 6, 'air', { anchor: 'start', size: fs(10), fill: c.muted }); txt(svg, cx - R, cy + 18, MED[med][0], { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, cx + 8, cy - R * 0.55, fmt(inc, 0) + '°', { anchor: 'start', size: fs(10), fill: c.ink }); txt(svg, cx + 8, cy + R * 0.6, fmt(r, 1) + '°', { anchor: 'start', size: fs(10), fill: c.ink });
      var px = narrow ? 50 : W * 0.5, py = narrow ? 290 : 30, pw = narrow ? W - 64 : W - px - 14, ph = narrow ? 180 : 200;
      var P = plotAxes(svg, c, fs, { L: px, R: px + pw, T: py, B: py + ph, xl: 0, xh: 90, yl: 0, yh: 90, xticks: [0, 30, 60, 90], yticks: [0, 30, 60, 90], xlab: 'incidence (°)', ylab: '' });
      plotLine(svg, P, function (i) { return i; }, 0, 90, 2, c.border, 1, '3 3');
      plotLine(svg, P, rr, 0, 89.9, 120, MC, 2.4);
      if (med === 0) PT.forEach(function (p) { el('circle', { cx: P.X(p[0]), cy: P.Y(p[1]), r: 4, fill: RED }, svg); });
      el('circle', { cx: P.X(inc), cy: P.Y(r), r: 5, fill: AMBER }, svg);
      txt(svg, px + 4, py + 12, 'refraction angle (°)', { anchor: 'start', size: fs(9), fill: c.muted });
      legend(svg, c, fs, W, 'teal curve: Ibn Sahl’s law (Snell’s law), sin i = n sin r · red dots: Ptolemy’s table for water', 'teal: sine law · red: Ptolemy');
      var pt = med === 0 ? (function () { for (var k = 0; k < PT.length; k++) if (PT[k][0] === Math.round(inc / 10) * 10) return PT[k][1]; return null; })() : null;
      out.innerHTML = 'At ' + inc + '° the ray bends to <strong>' + fmt(r, 1) + '°</strong> in ' + MED[med][0] + ' (n = ' + MED[med][1] + ').' + (pt !== null && inc % 10 === 0 ? ' Ptolemy’s table gives ' + pt + '°.' : '') + NOTE + 'Ptolemy, in the second century, measured refraction from air into water, glass and back, and his table (red) follows a smooth pattern, partly smoothed by calculation. Around 984 Ibn Sahl, designing lenses that focus sunlight, described refraction by a constant ratio that is equivalent to the sine law, more than six centuries before Snell and Descartes. Ibn al-Haytham studied refraction experimentally and showed that the angles are not simply proportional, though he did not find the law.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: testing a remedy (Ibn Sina's rules)
     ----------------------------------------------------------------------- */
  FIG['fig-trial'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p0 = 50, eff = 10, design = 0, n = 40, seed = 1;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'tr-p', label: 'Patients who recover anyway (%)', min: 0, max: 90, step: 5, value: p0, onChange: function (x) { p0 = x; draw(); } });
    FIG.slider(controls, { id: 'tr-e', label: 'True extra recovery from the remedy (%)', min: -20, max: 40, step: 5, value: eff, onChange: function (x) { eff = x; draw(); } });
    FIG.slider(controls, { id: 'tr-n', label: 'Patients per group', min: 10, max: 200, step: 10, value: n, onChange: function (x) { n = x; draw(); } });
    choice(controls, 'Design', ['Give the remedy and watch', 'Compare with untreated patients'], 0, function (i) { design = i; draw(); });
    var row = group(controls, 'Patients'); btn('New patients', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), r = rngSeed(seed * 31 + 7), pt = Math.max(0, Math.min(100, p0 + eff)) / 100, pc = p0 / 100;
      var T = [], U = []; for (var i = 0; i < n; i++) { T.push(r() < pt); U.push(r() < pc); }
      var tR = T.filter(Boolean).length, uR = U.filter(Boolean).length, groups = design ? [['given the remedy', T, BLUE], ['not given it', U, c.muted]] : [['given the remedy', T, BLUE]];
      var cols = Math.min(20, n), cs = Math.min(14, ((svgWrap.clientWidth || container.clientWidth || 700) - 40) / (design ? 2 * cols + 3 : cols)), rows = Math.ceil(n / cols);
      var A = newSVG(svgWrap, container, 70 + rows * cs + 20, 'Patients who recovered or did not'), W = A.W, svg = A.svg, fs = A.fs;
      groups.forEach(function (g, gi) { var ox = 20 + gi * (cols + 3) * cs; txt(svg, ox, 40, g[0] + ': ' + g[1].filter(Boolean).length + ' of ' + n + ' recovered', { anchor: 'start', size: fs(10), fill: c.ink2, weight: 700 }); g[1].forEach(function (rec, k) { el('circle', { cx: ox + (k % cols) * cs + cs / 2, cy: 54 + Math.floor(k / cols) * cs + cs / 2, r: cs * 0.38, fill: rec ? GREEN : RED + '88' }, svg); }); });
      legend(svg, c, fs, W, 'green: recovered · red: not recovered', 'green: recovered');
      var concl;
      if (!design) concl = 'Recovery rate ' + fmt(tR / n * 100, 0) + '%. Without a comparison, it is tempting to credit the remedy with every recovery, but ' + p0 + '% of patients would have recovered anyway.';
      else { var diff = (tR - uR) / n * 100, se = Math.sqrt(pt * (1 - pt) / n + pc * (1 - pc) / n) * 100; concl = 'Treated ' + fmt(tR / n * 100, 0) + '% versus untreated ' + fmt(uR / n * 100, 0) + '%: an estimated effect of <strong>' + (diff >= 0 ? '+' : '') + fmt(diff, 0) + ' percentage points</strong> (true value ' + (eff >= 0 ? '+' : '') + eff + '; chance variation about ±' + fmt(2 * se, 0) + ').'; }
      out.innerHTML = concl + NOTE + 'Ibn Sina’s <em>Canon</em> lists conditions for judging whether a drug works: it must be pure; tested on a simple disease, not a mixture of conditions; its effect must appear consistently in many cases and in the right time course; its strength must match the disease; and it must be tested on humans, since animals may respond differently. He did not describe untreated control groups, which came much later, but his insistence on repeated, controlled experience points towards them. Press “New patients” to see how much results vary by chance, especially in small groups.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did the Baghdad translation movement do?', options: ['Translated Arabic works into Latin', 'Translated Greek, Persian and Indian science and philosophy into Arabic', 'Destroyed ancient books', 'Invented printing'], answer: 1, explanation: 'Mainly in the 8th–10th centuries.' },
      { question: 'According to the extramission theory, we see because…', options: ['Light enters the eye', 'Rays leave the eye and strike objects', 'The brain imagines objects', 'Objects send copies of themselves'], answer: 1, explanation: 'Held by Euclid, Ptolemy and al-Kindī.' },
      { question: 'Ibn al-Haytham argued that vision happens because…', options: ['Rays leave the eye', 'Light travels in straight lines from every point of an object into the eye', 'Air carries images', 'The soul perceives directly'], answer: 1, explanation: 'He combined intromission with geometry.' },
      { question: 'In a camera obscura, making the hole larger…', options: ['Makes the image sharper and dimmer', 'Makes the image brighter and blurrier', 'Turns the image right way up', 'Has no effect'], answer: 1, explanation: 'Each point lights a larger patch.' },
      { question: 'Who first described the law of refraction (Snell’s law), around 984?', options: ['Ptolemy', 'Ibn Sahl', 'Descartes', 'Kepler'], answer: 1, explanation: 'In a treatise on burning instruments.' },
      { question: 'Ibn al-Haytham’s Doubts Concerning Ptolemy argued that…', options: ['Ptolemy was always right', 'A seeker of truth must examine even great authorities critically', 'Astronomy is impossible', 'The Earth is flat'], answer: 1, explanation: 'He found contradictions in Ptolemy’s models.' },
      { question: 'Ibn Sina’s Canon of Medicine was used as a textbook in Europe until about…', options: ['1100', '1300', 'the 17th century', 'the 20th century'], answer: 2, explanation: 'At universities such as Montpellier and Louvain.' },
      { question: 'Which was one of Ibn Sina’s rules for testing drugs?', options: ['Test only on animals', 'Test on a simple disease, and look for a consistent effect in many cases', 'Mix many drugs together', 'Rely on the first patient'], answer: 1, explanation: 'Seven conditions in the Canon.' },
      { question: 'Why is a group of untreated patients important in a trial?', options: ['To save money', 'Because many patients recover anyway, so you need a comparison', 'For ethical reasons only', 'It is not important'], answer: 1, explanation: 'Otherwise natural recovery is credited to the drug.' },
      { question: 'Ibn Sina’s “floating man” thought experiment was meant to show that…', options: ['Humans can fly', 'A person could be aware of their own existence without any sensory experience', 'Air has weight', 'The Moon floats'], answer: 1, explanation: 'An argument about the soul and self-awareness.' }
    ]);
  };
})();
