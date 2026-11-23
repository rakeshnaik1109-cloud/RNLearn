/* ==========================================================================
   RNLearn — The Expanding Universe and Its Age (How We Measured the Universe, Part 10)
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
    { name: 'Expansion', color: '#b45309' },
    { name: 'The Big Bang', color: '#7c3aed' },
    { name: 'Precision cosmology', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1912–17', icon: '🌈', era: 0, sec: 3, title: 'Slipher’s redshifts', text: 'Vesto Slipher measures the speeds of spiral nebulae from their spectra. Andromeda approaches, but most are rushing away.' },
    { year: '1917', icon: '🧮', era: 0, sec: 4, title: 'A static universe', text: 'Einstein adds a cosmological constant to general relativity so that the universe can stand still.' },
    { year: '1922', icon: '📐', era: 0, sec: 4, title: 'Friedmann', text: 'Alexander Friedmann finds solutions of Einstein’s equations in which the universe expands or contracts.' },
    { year: '1927', icon: '📄', era: 0, sec: 5, title: 'Lemaître', text: 'Georges Lemaître derives an expanding universe and estimates the expansion rate from published data.' },
    { year: '1929', icon: '📈', era: 0, sec: 6, title: 'Hubble’s law', text: 'Edwin Hubble shows that galaxies’ speeds increase in proportion to their distances.' },
    { year: '1931', icon: '⚛️', era: 1, sec: 8, title: 'The primeval atom', text: 'Lemaître proposes that the universe began from a single dense “primeval atom”.' },
    { year: '1948', icon: '🔥', era: 1, sec: 8, title: 'A hot beginning', text: 'Ralph Alpher and Robert Herman predict that the early universe left behind radiation, now at a few kelvin.' },
    { year: '1958', icon: '📏', era: 1, sec: 7, title: 'A slower expansion', text: 'Allan Sandage estimates a Hubble constant of about 75 km/s per megaparsec, making the universe old enough for its stars.' },
    { year: '1965', icon: '📡', era: 1, sec: 9, title: 'The cosmic background', text: 'Arno Penzias and Robert Wilson detect microwave radiation from every direction: the afterglow of the hot early universe.' },
    { year: '1998', icon: '💥', era: 2, sec: 11, title: 'Acceleration', text: 'Two teams find that distant supernovae are fainter than expected: the expansion is speeding up.' },
    { year: '2013–18', icon: '🛰️', era: 2, sec: 12, title: 'Planck', text: 'The Planck satellite maps the background radiation; the universe’s age comes out as 13.8 billion years.' },
    { year: 'Today', icon: '⚖️', era: 2, sec: 12, title: 'The Hubble tension', text: 'Measurements of the expansion rate from nearby galaxies and from the early universe disagree, and the reason is not known.' }
  ];
  FIG['fig-mu10-timeline'] = function (figEl) {
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
  function wlColor(nm) { var h = 270 - (nm - 380) / (700 - 380) * 270; return 'hsl(' + Math.max(0, Math.min(270, h)).toFixed(0) + ',85%,55%)'; }

  /* -----------------------------------------------------------------------
     Figure: redshift in a galaxy's spectrum
     ----------------------------------------------------------------------- */
  FIG['fig-redshift'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var v = 7000;
    var LINES = [[393.4, 'K'], [396.8, 'H'], [486.1, 'Hβ'], [589.3, 'Na'], [656.3, 'Hα']];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rs-v', label: 'Galaxy’s speed away from us (km/s)', min: -600, max: 30000, step: 100, value: v, onChange: function (x) { v = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 210, 'A laboratory spectrum and a galaxy spectrum: the galaxy’s dark absorption lines are shifted towards the red'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 20, R = W - 20, lo = 370, hi = 720, z = v / 299792, X = function (nm) { return L + (nm - lo) / (hi - lo) * (R - L); };
      [[40, 'Laboratory (at rest)', 0], [120, 'Galaxy', z]].forEach(function (row) {
        var y = row[0];
        for (var nm = lo; nm < hi; nm += 2) el('rect', { x: X(nm), y: y, width: (R - L) / (hi - lo) * 2 + 0.6, height: 44, fill: nm < 380 || nm > 700 ? c.border : wlColor(nm) }, svg);
        LINES.forEach(function (ln) { var w = ln[0] * (1 + row[2]); if (w < hi) { el('rect', { x: X(w) - 1.5, y: y, width: 3, height: 44, fill: '#111' }, svg); if (row[2] === 0 || W > 560) txt(svg, X(w), y - 5, ln[1], { size: fs(9), fill: c.ink2 }); } });
        txt(svg, L, y + 60, row[1], { anchor: 'start', size: fs(10), fill: c.muted });
      });
      LINES.forEach(function (ln) { var w = ln[0] * (1 + z); if (w < hi) el('line', { x1: X(ln[0]), y1: 86, x2: X(w), y2: 118, stroke: c.muted, 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, svg); });
      [400, 500, 600, 700].forEach(function (nm) { txt(svg, X(nm), 200, nm + ' nm', { size: fs(9), fill: c.muted }); });
      var d = v / 70;
      out.innerHTML = 'Each line is shifted by <strong>' + fmt(z * 100, 2) + '%</strong> of its wavelength: a redshift <em>z</em> = ' + fmt(z, 4) + '. ' + (v < 0 ? 'A negative value is a blueshift: the galaxy is approaching, as Andromeda is.' : 'With the modern Hubble constant (about 70 km/s per megaparsec), a galaxy receding at ' + fmt(v, 0) + ' km/s is about <strong>' + fmt(d, 0) + ' megaparsecs</strong> (' + fmt(d * 3.26, 0) + ' million light-years) away.') + NOTE + 'Atoms absorb light at exact wavelengths, leaving dark lines in a spectrum, such as the H and K lines of calcium and the lines of hydrogen and sodium. When the source moves away, every line shifts to longer (redder) wavelengths by the same fraction: <em>z</em> = Δλ/λ, and for speeds much less than light’s, <em>v</em> ≈ <em>cz</em>. For distant galaxies, the redshift is better understood as the stretching of light by the expansion of space while it travelled.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: fit Hubble's law
     ----------------------------------------------------------------------- */
  FIG['fig-hubble-fit'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var H = 300, set = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Galaxy distances', ['1929-style (too small)', 'Modern'], 0, function (i) { set = i; draw(); });
    FIG.slider(controls, { id: 'hf-h', label: 'Your line’s slope, H₀ (km/s per megaparsec)', min: 20, max: 700, step: 5, value: H, onChange: function (x) { H = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var rng = rngSeed(29), G = [];
    for (var i = 0; i < 24; i++) { var dTrue = 0.6 + rng() * 19.4, vel = 70 * dTrue + (rng() - 0.5) * 2 * 160; G.push([dTrue, vel, 0.75 + 0.5 * rng()]); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Speeds of galaxies against their distances, with a straight line whose slope you choose'), W = A.W, svg = A.svg, fs = A.fs;
      var pts = G.map(function (g) { return [set ? g[0] : g[0] * 0.14 * g[2], g[1]]; });
      var xh = set ? 22 : 3.5, P = plotAxes(svg, c, fs, { L: 58, R: W - 18, T: 20, B: 250, xl: 0, xh: xh, yl: -400, yh: 1800, xticks: set ? [0, 5, 10, 15, 20] : [0, 1, 2, 3], yticks: [0, 500, 1000, 1500], xlab: 'distance (megaparsecs)', ylab: 'speed (km/s)' });
      el('line', { x1: P.X(0), y1: P.Y(0), x2: P.X(xh), y2: P.Y(H * xh), stroke: MU, 'stroke-width': 2, 'clip-path': P.clip }, svg);
      var sxx = 0, sxy = 0, ss = 0;
      pts.forEach(function (p) { sxx += p[0] * p[0]; sxy += p[0] * p[1]; el('circle', { cx: P.X(p[0]), cy: P.Y(p[1]), r: 4, fill: AMBER, stroke: c.ink, 'stroke-width': 0.5 }, svg); });
      var best = sxy / sxx; pts.forEach(function (p) { ss += Math.pow(p[1] - H * p[0], 2); });
      var age = 977.8 / H;
      out.innerHTML = 'Your slope: <strong>' + H + ' km/s per Mpc</strong>; the best fit through the origin is <strong>' + fmt(best, 0) + '</strong>. Rough age of the universe from your slope (1/H₀): <strong>' + fmt(age, 1) + ' billion years</strong>.' + NOTE + 'These 24 galaxies are simulated, with random scatter like that from real galaxies’ own motions. If every galaxy has been moving at a steady speed since they were all together, the time since then is distance ÷ speed = 1/H₀ (977.8 divided by H₀ in km/s/Mpc gives billions of years). ' + (set ? 'With modern distances the slope is about 70 and 1/H₀ is about 14 billion years. The true age, 13.8 billion years, differs a little because the expansion first slowed and then sped up.' : 'With distances seven times too small, as in the 1920s, the slope is about 500, giving an age of only about 2 billion years: less than the age of the Earth (Part 7).') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the cosmic distance ladder
     ----------------------------------------------------------------------- */
  FIG['fig-distance-ladder'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var RUNGS = [
      { n: 'Radar and spacecraft', lo: 2e-7, hi: 3e-4, col: '#64748b', t: 'Radar echoes from planets and tracking of spacecraft measure the solar system and give the astronomical unit to a few metres (Part 4). It is the baseline for everything else.' },
      { n: 'Parallax', lo: 1, hi: 1e4, col: BLUE, t: 'Geometry with the Earth’s orbit as baseline (Part 8). Gaia reaches thousands of parsecs, enough to calibrate Cepheids in our Galaxy.' },
      { n: 'Cepheids', lo: 100, hi: 4e7, col: PURPLE, t: 'Leavitt’s law (Part 9), calibrated with parallaxes, measures galaxies out to about 40 megaparsecs (130 million light-years) with the Hubble and Webb space telescopes.' },
      { n: 'Type Ia supernovae', lo: 1e7, hi: 5e9, col: RED, t: 'Exploding white dwarfs reach a nearly standard peak brightness, billions of times the Sun’s. Calibrated in galaxies with Cepheids, they are seen across billions of light-years.' },
      { n: 'Hubble’s law', lo: 5e7, hi: 1.5e10, col: MU, t: 'Far enough away, a galaxy’s redshift gives its distance directly, once H₀ is known from the rungs below.' }
    ];
    var k = 2, err = 2;
    var controls = div('fig-controls', container);
    choice(controls, 'Rung', RUNGS.map(function (r) { return r.n; }), k, function (i) { k = i; draw(); });
    FIG.slider(controls, { id: 'dl-e', label: 'Uncertainty added at each rung (%)', min: 0.5, max: 10, step: 0.5, value: err, onChange: function (x) { err = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 70 + RUNGS.length * 40, 'Ranges of distance covered by each method of the cosmic distance ladder, on a logarithmic scale'), W = A.W, svg = A.svg, fs = A.fs;
      var L = W < 560 ? 20 : 150, P = plotAxes(svg, c, fs, { L: L, R: W - 20, T: 14, B: 34 + RUNGS.length * 40, xl: 1e-7, xh: 2e10, yl: 0, yh: 1, xticks: [1e-6, 1e-3, 1, 1e3, 1e6, 1e9], logx: true, xlab: 'distance (parsecs, logarithmic)' });
      RUNGS.forEach(function (r, i) { var y = 34 + i * 40; el('rect', { x: P.X(r.lo), y: y, width: P.X(r.hi) - P.X(r.lo), height: 18, rx: 4, fill: r.col, opacity: i === k ? 0.95 : 0.35 }, svg); txt(svg, W < 560 ? Math.min(P.X(r.lo) + 2, W - 130) : L - 8, W < 560 ? y - 4 : y + 13, r.n, { anchor: W < 560 ? 'start' : 'end', size: fs(10), fill: i === k ? c.ink : c.muted, weight: i === k ? 700 : 400 }); });
      var tot = Math.sqrt((k + 1) * err * err);
      out.innerHTML = '<strong>' + RUNGS[k].n + ':</strong> ' + RUNGS[k].t + '<br>If each rung adds an independent ' + fmt(err, 1) + '% uncertainty, distances on this rung carry about <strong>' + fmt(tot, 1) + '%</strong>.' + NOTE + 'No single method covers all distances, so each is calibrated with the one below, like the rungs of a ladder. Independent errors add in quadrature (the square root of the sum of squares), so they grow slowly up the ladder; a systematic error in a lower rung, such as Baade’s mix-up of two kinds of Cepheid, shifts everything above it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: an expanding grid of galaxies (balloon model)
     ----------------------------------------------------------------------- */
  FIG['fig-expanding-grid'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 1.5, home = 12, running = false;
    var controls = div('fig-controls', container);
    var sa = FIG.slider(controls, { id: 'eg-a', label: 'Size of the universe (scale factor)', min: 1, max: 2, step: 0.01, value: a, onChange: function (x) { a = x; draw(); } });
    var row = group(controls, 'Expansion'); var bP = btn('Play', row), bR = btn('Reset', row);
    bP.addEventListener('click', function () { running = !running; bP.textContent = running ? 'Pause' : 'Play'; });
    bR.addEventListener('click', function () { running = false; bP.textContent = 'Play'; a = 1; sa.element.value = 1; valText(sa, '1'); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var rng = rngSeed(5), D = [];
    for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) D.push([(i - 2) + (rng() - 0.5) * 0.5, (j - 2) + (rng() - 0.5) * 0.5]);
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A grid of galaxies that stretches; tap a galaxy to watch the others recede from it'), W = A.W, svg = A.svg, fs = A.fs;
      var cx = W / 2, cy = 150, s = Math.min(W, 300) / 9, h = D[home];
      D.forEach(function (d, i) {
        var x0 = cx + (d[0] - h[0]) * s, y0 = cy + (d[1] - h[1]) * s, x = cx + (d[0] - h[0]) * s * a, y = cy + (d[1] - h[1]) * s * a;
        if (i !== home && a > 1.01) el('line', { x1: x0, y1: y0, x2: x, y2: y, stroke: MU, 'stroke-width': 1.2, opacity: 0.6 }, svg);
        var g = el('circle', { cx: x, cy: y, r: i === home ? 8 : 6, fill: i === home ? AMBER : MU, stroke: c.ink, 'stroke-width': 0.6, style: 'cursor:pointer' }, svg);
        g.addEventListener('click', function () { home = i; draw(); });
      });
      txt(svg, 10, 290, 'Tap any galaxy to make it your home.', { anchor: 'start', size: fs(9.5), fill: c.muted });
      var rows = [1, 7, 24].map(function (i) { var j = i === home ? 0 : i; var dd = Math.hypot(D[j][0] - h[0], D[j][1] - h[1]); return [dd, dd * (a - 1)]; }).filter(function (r) { return r[0] > 0; });
      out.innerHTML = 'Scale factor ' + fmt(a, 2) + ': ' + rows.map(function (r) { return 'a galaxy first ' + fmt(r[0], 2) + ' units away has moved ' + fmt(r[1], 2) + ' units'; }).join('; ') + '. Each has moved in proportion to its starting distance.' + NOTE + 'Every distance in the grid is multiplied by the same factor, so a galaxy twice as far away recedes twice as fast: Hubble’s law. Choose a different home and the same is true from there. There is no centre: every galaxy sees all the others moving away. In the real universe, galaxies, stars and atoms are held together by their own gravity and forces, so they do not expand; the spaces between groups of galaxies do.</span>';
    }
    draw();
    FIG.animate(figEl, function () { if (!running) return; a += 0.004; if (a >= 2) { a = 2; running = false; bP.textContent = 'Play'; } sa.element.value = a; valText(sa, fmt(a, 2)); draw(); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m10'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did Vesto Slipher measure from 1912?', options: ['Distances to galaxies', 'Speeds of spiral nebulae from their spectra', 'The age of the Sun', 'The size of the Milky Way'], answer: 1, explanation: 'Most were moving away at hundreds of km/s.' },
      { question: 'A spectral line normally at 500 nm is seen at 505 nm. What is the redshift z?', options: ['0.001', '0.01', '0.1', '5'], answer: 1, explanation: 'z = 5/500 = 0.01, a speed of about 3,000 km/s.' },
      { question: 'Why did Einstein add a cosmological constant in 1917?', options: ['To make the universe expand', 'To keep the universe static', 'To explain dark matter', 'To fit Hubble’s data'], answer: 1, explanation: 'Like nearly everyone, he expected a universe that does not change.' },
      { question: 'Who first published an expanding universe with an estimate of the expansion rate, in 1927?', options: ['Hubble', 'Lemaître', 'Einstein', 'Slipher'], answer: 1, explanation: 'In a Belgian journal that few astronomers read.' },
      { question: 'Hubble’s law says that…', options: ['All galaxies move towards us', 'A galaxy’s recession speed is proportional to its distance', 'Galaxies are evenly spaced', 'The universe is static'], answer: 1, explanation: 'v = H₀d.' },
      { question: 'Why was Hubble’s 1929 value of about 500 km/s/Mpc a problem?', options: ['It made the universe younger than the Earth', 'It made the universe infinite', 'It contradicted Einstein', 'It was negative'], answer: 0, explanation: '1/H₀ was only about 2 billion years.' },
      { question: 'What is the cosmic microwave background?', options: ['Radio noise from Earth', 'The afterglow of the hot early universe, now at 2.7 K', 'Light from the first stars', 'Microwaves from the Sun'], answer: 1, explanation: 'Discovered by Penzias and Wilson in 1965.' },
      { question: 'What did the supernova teams discover in 1998?', options: ['The expansion is slowing', 'The expansion is speeding up', 'The universe is static', 'Supernovae are rare'], answer: 1, explanation: 'Distant supernovae were fainter than expected.' },
      { question: 'What is the age of the universe according to the Planck satellite?', options: ['4.5 billion years', '10 billion years', '13.8 billion years', '20 billion years'], answer: 2, explanation: 'With an uncertainty of about 20 million years, assuming the standard model.' },
      { question: 'What is the “Hubble tension”?', options: ['A dispute about who discovered expansion', 'Disagreement between expansion rates measured nearby and inferred from the early universe', 'Stress in the Hubble telescope’s mirror', 'The universe’s acceleration'], answer: 1, explanation: 'About 73 versus about 67 km/s/Mpc.' }
    ]);
  };
})();
