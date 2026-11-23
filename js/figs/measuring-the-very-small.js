/* ==========================================================================
   RNLearn — Measuring the Very Small (How We Measured the Universe, Part 12)
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
    { name: 'Thin films and gases', color: '#b45309' },
    { name: 'Atoms become real', color: '#7c3aed' },
    { name: 'Counting atoms', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1773', icon: '🫗', era: 0, sec: 4, title: 'Franklin’s teaspoon', text: 'Benjamin Franklin pours a teaspoon of oil on a pond at Clapham Common; it calms the ripples over half an acre.' },
    { year: '1808–11', icon: '⚗️', era: 0, sec: 3, title: 'Dalton and Avogadro', text: 'John Dalton’s atomic theory of chemistry; Amedeo Avogadro proposes that equal volumes of gases contain equal numbers of molecules.' },
    { year: '1827', icon: '🌼', era: 1, sec: 7, title: 'Brown’s jiggling grains', text: 'Robert Brown sees tiny particles from pollen grains jiggling endlessly in water under the microscope.' },
    { year: '1865', icon: '💨', era: 0, sec: 6, title: 'Loschmidt', text: 'Josef Loschmidt makes the first sound estimate of the size of molecules, from the properties of gases.' },
    { year: '1890–91', icon: '🧪', era: 0, sec: 5, title: 'Rayleigh and Pockels', text: 'Lord Rayleigh and Agnes Pockels show that an oil film calms water when it is about one molecule thick.' },
    { year: '1905', icon: '📄', era: 1, sec: 7, title: 'Einstein', text: 'Einstein explains Brownian motion as the result of molecular collisions and shows how to count molecules from it.' },
    { year: '1908–09', icon: '🔬', era: 1, sec: 8, title: 'Perrin', text: 'Jean Perrin measures Brownian motion and finds Avogadro’s number; sceptics accept the reality of atoms.' },
    { year: '1909–13', icon: '⚡', era: 1, sec: 9, title: 'Millikan’s oil drops', text: 'Robert Millikan measures the charge on tiny drops of oil and finds that it always comes in multiples of one value: the electron’s charge.' },
    { year: '1911', icon: '🎯', era: 1, sec: 12, title: 'The nucleus', text: 'Ernest Rutherford shows that an atom’s mass is concentrated in a nucleus about 100,000 times smaller than the atom.' },
    { year: '1981', icon: '🖥️', era: 2, sec: 10, title: 'Seeing atoms', text: 'Gerd Binnig and Heinrich Rohrer build the scanning tunnelling microscope, which can image individual atoms.' },
    { year: '2019', icon: '⚖️', era: 2, sec: 11, title: 'A new kilogram', text: 'The SI is redefined: Avogadro’s number and the electron’s charge become exact, and the kilogram is defined by a constant of nature.' }
  ];
  FIG['fig-mu12-timeline'] = function (figEl) {
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
  function nmTxt(m) { return m >= 1e-6 ? fmt(m * 1e6, 2) + ' µm' : fmt(m * 1e9, 2) + ' nm'; }

  /* -----------------------------------------------------------------------
     Figure: zoom from a metre to a nucleus
     ----------------------------------------------------------------------- */
  FIG['fig-zoom-scale'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var z = -5;
    var OBJ = [[1.7, 'a person', '#64748b'], [1e-1, 'a hand', '#94a3b8'], [1e-3, 'a grain of sand', '#d97706'], [8e-5, 'width of a hair', '#78350f'], [7e-6, 'a red blood cell', '#dc2626'], [2e-6, 'a bacterium', '#16a34a'], [1e-6, 'a Brownian particle', '#0e7490'], [1e-7, 'a virus', '#7c3aed'], [2e-9, 'oil film / oleic acid molecule', '#ca8a04'], [3e-10, 'a water molecule', '#2563eb'], [1e-10, 'an atom', '#0f766e'], [1.7e-15, 'a proton', '#be123c'], [1e-14, 'a heavy nucleus', '#9f1239']];
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'zs-z', label: 'Zoom (width of the window)', min: -15, max: 0.5, step: 0.05, value: z, onChange: function (x) { z = x; valText(sl, lab(x)); draw(); } });
    function lab(x) { var m = Math.pow(10, x); return m >= 1 ? fmt(m, 1) + ' m' : m >= 1e-3 ? fmt(m * 1000, 1) + ' mm' : m >= 1e-6 ? fmt(m * 1e6, 1) + ' µm' : m >= 1e-9 ? fmt(m * 1e9, 1) + ' nm' : m >= 1e-12 ? fmt(m * 1e12, 1) + ' pm' : fmt(m * 1e15, 1) + ' fm'; }
    valText(sl, lab(z));
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Objects from a person to an atomic nucleus, drawn to scale in a window of the chosen width'), W = A.W, svg = A.svg, fs = A.fs;
      var win = Math.pow(10, z), cx = W / 2, cy = 120, Wpx = Math.min(W - 40, 360);
      el('rect', { x: cx - Wpx / 2, y: 20, width: Wpx, height: 200, fill: 'none', stroke: c.border }, svg);
      var shown = OBJ.filter(function (o) { var px = o[0] / win * Wpx; return px > 2 && px < Wpx * 6; }).sort(function (a, b) { return b[0] - a[0]; });
      shown.forEach(function (o, i) { var px = o[0] / win * Wpx; var r = Math.min(px / 2, 600); el('circle', { cx: cx, cy: cy, r: r, fill: o[2], 'fill-opacity': 0.18, stroke: o[2], 'stroke-width': 1.5, 'clip-path': 'url(#zsclip)' }, svg); });
      var cp = el('clipPath', { id: 'zsclip' }, svg); el('rect', { x: cx - Wpx / 2, y: 20, width: Wpx, height: 200 }, cp);
      var ruler = Wpx / 5; el('line', { x1: cx - Wpx / 2 + 10, y1: 210, x2: cx - Wpx / 2 + 10 + ruler, y2: 210, stroke: c.ink, 'stroke-width': 2 }, svg); txt(svg, cx - Wpx / 2 + 10 + ruler / 2, 204, lab(z - Math.log10(5)), { size: fs(9), fill: c.ink });
      var P = plotAxes(svg, c, fs, { L: 20, R: W - 20, T: 240, B: 262, xl: 1e-15, xh: 3, yl: 0, yh: 1, xticks: [1e-15, 1e-12, 1e-9, 1e-6, 1e-3, 1], logx: true });
      el('rect', { x: P.X(win / 6), y: 244, width: Math.max(2, P.X(win * 6) - P.X(win / 6)), height: 14, fill: MU, opacity: 0.35 }, svg);
      var list = shown.map(function (o) { return '<span style="color:' + o[2] + ';font-weight:700">●</span> ' + o[1] + ' (' + lab(Math.log10(o[0])) + ')'; });
      out.innerHTML = (list.length ? 'In view: ' + list.join(' · ') : 'Nothing in our list has this size: keep zooming.') + NOTE + 'Every step of the slider is a factor of ten. An atom is about a ten-billionth of a metre across: as many atoms fit across a grain of sand as grains of sand would fit across 1,000 km. The nucleus is a hundred thousand times smaller again. The scale bar is at the bottom left of the window.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Brownian motion and Avogadro's number
     ----------------------------------------------------------------------- */
  FIG['fig-brownian-count'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var aIdx = 1, A_ = [0.25e-6, 0.5e-6, 1e-6], P = [], steps = 0, running = true, tick = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Particle radius', ['0.25 µm', '0.5 µm', '1 µm'], aIdx, function (i) { aIdx = i; reset(); });
    var row = group(controls, 'Observation'); var bP = btn('Pause', row); btn('New sample', row).addEventListener('click', reset);
    bP.addEventListener('click', function () { running = !running; bP.textContent = running ? 'Pause' : 'Resume'; });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var kB = 1.380649e-23, T = 293, eta = 1.0e-3, NP = 16, dt = 1;
    function D() { return kB * T / (6 * Math.PI * eta * A_[aIdx]); }
    function reset() { P = []; for (var i = 0; i < NP; i++) P.push({ x: [0], y: [0], ox: (i % 4) * 25 - 37.5, oy: Math.floor(i / 4) * 25 - 37.5 }); steps = 0; draw(); }
    function step() { var s = Math.sqrt(2 * D() * dt) * 1e6; P.forEach(function (p) { p.x.push(p.x[p.x.length - 1] + s * gauss()); p.y.push(p.y[p.y.length - 1] + s * gauss()); }); steps++; }
    function draw() {
      var c = C(), Aa = newSVG(svgWrap, container, 300, 'Paths of jiggling particles, and their mean squared displacement growing in proportion to time'), W = Aa.W, svg = Aa.svg, fs = Aa.fs;
      var wide = W >= 620, bx = wide ? W * 0.25 : W / 2, by = wide ? 150 : 95, sc = (wide ? 2.2 : 1.3) / (aIdx === 0 ? 1.4 : aIdx === 1 ? 1 : 0.7);
      el('rect', { x: bx - (wide ? 130 : 85), y: by - (wide ? 130 : 85), width: wide ? 260 : 170, height: wide ? 260 : 170, fill: c.surface, stroke: c.border }, svg);
      var cpid = 'bwc' + Math.floor(Math.random() * 1e6), cp = el('clipPath', { id: cpid }, svg); el('rect', { x: bx - (wide ? 130 : 85), y: by - (wide ? 130 : 85), width: wide ? 260 : 170, height: wide ? 260 : 170 }, cp);
      var g = el('g', { 'clip-path': 'url(#' + cpid + ')' }, svg);
      P.forEach(function (p, i) { var d = ''; for (var k = 0; k < p.x.length; k++) d += (k ? 'L' : 'M') + (bx + (p.ox + p.x[k] * 5) * sc * (wide ? 1 : 0.65)).toFixed(1) + ' ' + (by + (p.oy + p.y[k] * 5) * sc * (wide ? 1 : 0.65)).toFixed(1); el('path', { d: d, fill: 'none', stroke: i ? MU : AMBER, 'stroke-width': i ? 0.8 : 1.6, opacity: i ? 0.55 : 1 }, g); var L = p.x.length - 1; el('circle', { cx: bx + (p.ox + p.x[L] * 5) * sc * (wide ? 1 : 0.65), cy: by + (p.oy + p.y[L] * 5) * sc * (wide ? 1 : 0.65), r: 2.5, fill: i ? MU : AMBER }, g); });
      var maxT = 40, msd = [], tt; for (tt = 1; tt <= Math.min(steps, maxT); tt++) { var s = 0, n = 0; P.forEach(function (p) { for (var k = 0; k + tt < p.x.length; k += tt) { s += Math.pow(p.x[k + tt] - p.x[k], 2); n++; } }); msd.push([tt, s / n]); }
      var ymax = 2 * D() * 1e12 * maxT * 1.6;
      var Q = plotAxes(svg, c, fs, { L: wide ? W * 0.55 : 54, R: W - 16, T: wide ? 30 : 205, B: wide ? 250 : 275, xl: 0, xh: maxT, yl: 0, yh: ymax, xticks: [0, 10, 20, 30, 40], yticks: wide ? [0, ymax / 2, ymax].map(function (v) { return +v.toPrecision(2); }) : [], xlab: 'time interval (s)', ylab: wide ? '⟨x²⟩ (µm²)' : '' });
      var sxy = 0, sxx = 0; msd.forEach(function (m) { sxy += m[0] * m[1]; sxx += m[0] * m[0]; el('circle', { cx: Q.X(m[0]), cy: Q.Y(Math.min(m[1], ymax)), r: 2.5, fill: AMBER }, svg); });
      var slope = sxx ? sxy / sxx : 0;
      if (slope) el('line', { x1: Q.X(0), y1: Q.Y(0), x2: Q.X(maxT), y2: Q.Y(Math.min(slope * maxT, ymax)), stroke: MU, 'stroke-width': 1.5, 'clip-path': Q.clip }, svg);
      var Dest = slope / 2 * 1e-12, NA = Dest ? 8.314 * T / (6 * Math.PI * eta * A_[aIdx] * Dest) : 0;
      out.innerHTML = (steps < 3 ? 'Watching the particles…' : 'After ' + steps + ' seconds of observation: diffusion coefficient <strong>' + fmt(Dest * 1e12, 3) + ' µm²/s</strong>, so Avogadro’s number ≈ <strong>' + sciHTML(NA, 2) + '</strong> (true value 6.02 × 10<sup>23</sup>).') + NOTE + 'Each particle is kicked about by unseen water molecules. Einstein showed in 1905 that the mean squared displacement along one direction grows in proportion to time, ⟨<em>x</em>²⟩ = 2<em>Dt</em>, and that <em>D</em> = <em>RT</em> / (6π<em>ηa</em><em>N</em><sub>A</sub>) for a sphere of radius <em>a</em> in a liquid of viscosity <em>η</em> at temperature <em>T</em>. Measuring <em>D</em> under a microscope therefore counts molecules. Larger particles jiggle less. The simulation uses water at 20 °C; each new sample gives a slightly different estimate, as Perrin’s measurements did.</span>';
    }
    reset();
    FIG.animate(figEl, function () { if (!running || steps >= 120) return; tick++; if (tick % 10 === 0) { step(); draw(); } });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: Millikan's oil-drop balance
     ----------------------------------------------------------------------- */
  FIG['fig-millikan'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var e = 1.602176634e-19, g0 = 9.81, rho = 919, d = 0.016, V = 1000, drop, y = 0.5, rec = [], seed = 3;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'mk-v', label: 'Voltage across the plates (V)', min: 0, max: 4000, step: 1, value: V, onChange: function (x) { V = x; } });
    var row = group(controls, 'Drop'); var bR = btn('Record charge', row), bN = btn('New drop', row);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function newDrop() { var r = rngSeed(seed++ * 7919); var rad = 0.5e-6 + r() * 0.45e-6, n = 1 + Math.floor(r() * 7), m = 4 / 3 * Math.PI * Math.pow(rad, 3) * rho; drop = { rad: rad, n: n, m: m, Vb: m * g0 * d / (n * e) }; y = 0.5; }
    bN.addEventListener('click', function () { newDrop(); draw(); });
    bR.addEventListener('click', function () { if (Math.abs(V - drop.Vb) / drop.Vb < 0.03) { rec.push(drop.m * g0 * d / V); newDrop(); } draw(true); });
    var dotEl, geo, msg = '';
    function draw(tried) {
      var c = C(), A = newSVG(svgWrap, container, (container.clientWidth || 700) < 560 ? 340 : 300, 'Two horizontal plates with an oil drop between them, and a line showing the charges recorded so far'), W = A.W, svg = A.svg, fs = A.fs;
      var px = W < 560 ? W / 2 : W * 0.3, top = 40, bot = 190;
      el('rect', { x: px - 90, y: top - 8, width: 180, height: 8, fill: c.ink2 }, svg); el('rect', { x: px - 90, y: bot, width: 180, height: 8, fill: c.ink2 }, svg);
      txt(svg, px + 96, top, '+', { anchor: 'start', size: fs(14), fill: RED, weight: 700 }); txt(svg, px + 96, bot + 10, '−', { anchor: 'start', size: fs(14), fill: BLUE, weight: 700 });
      dotEl = el('circle', { cx: px, cy: top + (bot - top) * y, r: 5, fill: AMBER, stroke: c.ink, 'stroke-width': 0.6 }, svg); geo = { top: top, bot: bot };
      txt(svg, px, bot + 30, 'Drop radius ' + fmt(drop.rad * 1e6, 2) + ' µm (from its fall speed)', { size: fs(9.5), fill: c.muted });
      var L = W < 560 ? 30 : W * 0.6, R = W - 20, ly = W < 560 ? 290 : 120, qmax = 8 * e;
      el('line', { x1: L, y1: ly, x2: R, y2: ly, stroke: c.muted }, svg);
      for (var k = 0; k <= 8; k++) { var x = L + (R - L) * k / 8; el('line', { x1: x, y1: ly - 5, x2: x, y2: ly + 5, stroke: c.muted }, svg); txt(svg, x, ly + 18, k ? k + 'e' : '0', { size: fs(9), fill: c.muted }); }
      rec.forEach(function (q, i) { var x = L + (R - L) * Math.min(q, qmax) / qmax; el('circle', { cx: x, cy: ly - 12 - (i % 4) * 9, r: 4, fill: MU }, svg); });
      txt(svg, (L + R) / 2, W < 560 ? ly + 36 : ly - 52, 'Charges recorded', { size: fs(10), fill: c.muted });
      if (tried) msg = Math.abs(V - drop.Vb) / drop.Vb < 0.03 ? '' : 'The drop is not hovering yet, so the charge cannot be worked out. Adjust the voltage until it stays still.';
      var last = rec.length ? rec[rec.length - 1] : 0;
      out.innerHTML = (msg ? '<strong>' + msg + '</strong> ' : '') + (rec.length ? 'Last charge: <strong>' + sciHTML(last, 3) + ' C</strong> = ' + fmt(last / e, 2) + ' × 1.602 × 10<sup>−19</sup> C. Recorded ' + rec.length + ' drop' + (rec.length > 1 ? 's' : '') + '.' : 'Adjust the voltage until the drop hovers, then record its charge.') + NOTE + 'When the drop hovers, the electric force balances its weight: <em>qV</em>/<em>d</em> = <em>mg</em>, so <em>q</em> = <em>mgd</em>/<em>V</em>. Millikan found the mass from how fast the drop fell with the field off. Whatever the drop, the charges cluster at whole multiples of one value: the charge of a single electron. The drops here are simulated, with plates 16 mm apart as in Millikan’s apparatus.</span>';
    }
    newDrop(); draw();
    FIG.animate(figEl, function () { if (!dotEl || !drop) return; var vrel = (V - drop.Vb) / drop.Vb; y -= Math.max(-0.02, Math.min(0.02, vrel * 0.01)); if (y < 0.03) y = 0.03; if (y > 0.97) y = 0.97; dotEl.setAttribute('cy', (geo.top + (geo.bot - geo.top) * y).toFixed(1)); });
    window.addEventListener('resize', function () { draw(); });
    onTheme(function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure: an oil film one molecule thick
     ----------------------------------------------------------------------- */
  FIG['fig-oil-film'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 1, dia = 25, dil = 200;
    var controls = div('fig-controls', container);
    choice(controls, 'Experiment', ['Franklin’s pond (1773)', 'Kitchen version'], mode, function (i) { mode = i; draw(); });
    FIG.slider(controls, { id: 'of-d', label: 'Patch diameter (cm), kitchen version', min: 5, max: 40, step: 1, value: dia, onChange: function (x) { dia = x; draw(); } });
    FIG.slider(controls, { id: 'of-l', label: 'Oil diluted 1 part in (kitchen version)', min: 50, max: 1000, step: 50, value: dil, onChange: function (x) { dil = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'A drop of oil spreading into a thin patch on water, and a side view of the film'), W = A.W, svg = A.svg, fs = A.fs;
      var vol = mode ? 0.02e-6 / dil : 2e-6, area = mode ? Math.PI * Math.pow(dia / 200, 2) : 2023, t = vol / area;
      var cx = W < 560 ? W / 2 : W * 0.28, cy = 100;
      el('rect', { x: cx - 100, y: 20, width: 200, height: 160, rx: 10, fill: '#bfdbfe', opacity: 0.5 }, svg);
      var r = mode ? 15 + dia * 2 : 70; el('circle', { cx: cx, cy: cy, r: Math.min(r, 78), fill: '#facc15', opacity: 0.35, stroke: AMBER }, svg);
      txt(svg, cx, 198, mode ? 'patch ' + dia + ' cm across' : 'half an acre (about 2,000 m²)', { size: fs(9.5), fill: c.muted });
      var sx = W < 560 ? 20 : W * 0.55, sw = W < 560 ? W - 40 : W * 0.42, sy = W < 560 ? 222 : 120;
      if (W >= 560) {
        txt(svg, sx + sw / 2, 40, 'Side view (molecules not to scale)', { size: fs(9.5), fill: c.muted });
        el('rect', { x: sx, y: sy, width: sw, height: 60, fill: '#bfdbfe', opacity: 0.5 }, svg);
        var nmol = Math.floor(sw / 9), h = Math.max(4, Math.min(40, t / 2e-9 * 18));
        for (var i = 0; i < nmol; i++) { var x = sx + 4 + i * 9; el('circle', { cx: x, cy: sy - 3, r: 3, fill: RED }, svg); el('line', { x1: x, y1: sy - 3, x2: x, y2: sy - 3 - h, stroke: AMBER, 'stroke-width': 2 }, svg); }
        txt(svg, sx + sw / 2, sy + 80, 'water-loving heads down, oily tails up', { size: fs(9), fill: c.muted });
      }
      out.innerHTML = 'Oil volume: <strong>' + (mode ? sciHTML(vol * 1e6, 2) + ' mL' : 'about 2 mL (a teaspoon)') + '</strong>; area: <strong>' + (mode ? fmt(area * 1e4, 0) + ' cm²' : 'about 2,000 m²') + '</strong>; film thickness = volume ÷ area = <strong>' + nmTxt(t) + '</strong>.' + NOTE + (mode ? 'A dropper gives about 50 drops per millilitre (0.02 mL each). Diluting the oil (oleic acid, or cooking oil in a solvent that evaporates) makes the patch small enough for a basin. If the film is one molecule thick, its thickness is the length of a molecule: about 2 nm for oleic acid. ' : 'Franklin’s teaspoon of oil spread over about half an acre, giving a film about a millionth of a millimetre thick. He did not do this calculation; Lord Rayleigh did, in 1890. ') + 'The oil stops spreading when it forms a single layer of molecules, so the thickness of the film estimates the size of one molecule.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m12'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A teaspoon of oil (2 mL) spreads over 2,000 m². How thick is the film?', options: ['1 mm', '1 µm', '1 nm', '1 pm'], answer: 2, explanation: '2 × 10⁻⁶ m³ ÷ 2,000 m² = 10⁻⁹ m.' },
      { question: 'Why does the thickness of an oil film estimate the size of a molecule?', options: ['Oil is made of one molecule', 'The film stops spreading when it is one molecule thick', 'Oil molecules are spheres', 'Water dissolves the oil'], answer: 1, explanation: 'A monolayer.' },
      { question: 'What is Brownian motion?', options: ['The motion of the Earth', 'The random jiggling of small particles caused by collisions with molecules', 'Motion of electrons in wires', 'The flow of rivers'], answer: 1, explanation: 'First described in detail by Robert Brown in 1827.' },
      { question: 'In Einstein’s theory, how does the mean squared displacement of a Brownian particle grow?', options: ['With the square of time', 'In proportion to time', 'Exponentially', 'It stays constant'], answer: 1, explanation: '⟨x²⟩ = 2Dt.' },
      { question: 'What did Jean Perrin’s experiments establish?', options: ['The speed of light', 'Avogadro’s number, convincing sceptics that atoms are real', 'The charge of the electron', 'The size of the nucleus'], answer: 1, explanation: 'He won the Nobel Prize in 1926.' },
      { question: 'In Millikan’s experiment, when an oil drop hovers…', options: ['It has no charge', 'The electric force balances its weight', 'The voltage is zero', 'It has lost its mass'], answer: 1, explanation: 'qV/d = mg.' },
      { question: 'What did Millikan find about the charges on his drops?', options: ['They were random', 'They were all whole multiples of one basic charge', 'They were all zero', 'They were all equal'], answer: 1, explanation: 'The charge of the electron, about 1.6 × 10⁻¹⁹ C.' },
      { question: 'About how big is an atom?', options: ['10⁻⁵ m', '10⁻⁷ m', '10⁻¹⁰ m', '10⁻¹⁵ m'], answer: 2, explanation: 'A tenth of a nanometre; the nucleus is about 10⁻¹⁵ m.' },
      { question: 'What happened to the kilogram in 2019?', options: ['It was abolished', 'It was redefined by fixing the value of Planck’s constant', 'It was made heavier', 'Nothing'], answer: 1, explanation: 'Avogadro’s number and the electron’s charge also became exact.' },
      { question: 'Why was the old International Prototype Kilogram a problem?', options: ['It was too heavy', 'Its mass appeared to drift relative to its copies, and it could be damaged or lost', 'It was made of iron', 'Nobody knew where it was'], answer: 1, explanation: 'Differences of tens of micrograms over a century.' }
    ]);
  };
})();
