/* ==========================================================================
   RNLearn — The Milky Way and Other Galaxies (How We Measured the Universe, Part 9)
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
    { name: 'Mapping the Milky Way', color: '#b45309' },
    { name: 'Standard candles', color: '#7c3aed' },
    { name: 'Other galaxies', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1610', icon: '🔭', era: 0, sec: 3, title: 'A river of stars', text: 'Galileo’s telescope shows that the Milky Way is made of countless faint stars.' },
    { year: '1755', icon: '🏝️', era: 0, sec: 3, title: 'Island universes', text: 'Immanuel Kant suggests that the faint elliptical nebulae are other Milky Ways, very far away.' },
    { year: '1785', icon: '🗺️', era: 0, sec: 4, title: 'Herschel’s star gauges', text: 'William Herschel counts stars in hundreds of directions and maps the Milky Way as a flattened disc with the Sun near the centre.' },
    { year: '1912', icon: '📈', era: 1, sec: 6, title: 'Leavitt’s law', text: 'Henrietta Leavitt shows that Cepheid variables in the Small Magellanic Cloud with longer periods are brighter.' },
    { year: '1918', icon: '🎯', era: 1, sec: 8, title: 'Shapley moves the Sun', text: 'Harlow Shapley finds that the globular clusters are centred far away in Sagittarius: the Sun is not at the centre of the Galaxy.' },
    { year: '1920', icon: '🎤', era: 1, sec: 9, title: 'The Great Debate', text: 'Shapley and Heber Curtis debate the size of the Galaxy and the nature of the spiral nebulae in Washington.' },
    { year: '1923', icon: '❗', era: 2, sec: 10, title: '“VAR!”', text: 'Edwin Hubble finds a Cepheid in the Andromeda nebula on a plate taken with the 100-inch telescope at Mount Wilson.' },
    { year: '1925', icon: '🌌', era: 2, sec: 10, title: 'Other galaxies', text: 'Hubble’s Cepheid distances, announced at a meeting in January, show that the spiral nebulae are galaxies far outside our own.' },
    { year: '1930', icon: '🌫️', era: 2, sec: 11, title: 'Interstellar dust', text: 'Robert Trumpler shows that dust dims distant starlight, which had misled earlier maps of the Galaxy.' },
    { year: '1952', icon: '✖️', era: 2, sec: 11, title: 'Two kinds of Cepheid', text: 'Walter Baade finds two kinds of Cepheid; the correction roughly doubles the distances to other galaxies.' },
    { year: '2019', icon: '🎯', era: 2, sec: 12, title: 'The centre measured', text: 'Stars orbiting the black hole at the Galactic centre give its distance: about 8.2 kiloparsecs (26,700 light-years).' }
  ];
  FIG['fig-mu9-timeline'] = function (figEl) {
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
  function plMag(P, old) { return -2.43 * (Math.log10(P) - 1) - 4.05 + (old ? 1.5 : 0); }
  function lyTxt(pc) { var ly = pc * 3.2616; return ly >= 1e6 ? fmt(ly / 1e6, 2) + ' million light-years' : ly >= 1e4 ? fmt(Math.round(ly / 1000), 0) + ',000 light-years' : fmt(ly, 0) + ' light-years'; }

  /* -----------------------------------------------------------------------
     Figure: Shapley's globular clusters
     ----------------------------------------------------------------------- */
  FIG['fig-globular'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var R0 = 8;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'gc-r', label: 'Sun’s distance from the centre of the cluster system (kpc)', min: 0, max: 15, step: 0.5, value: R0, onChange: function (x) { R0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var rng = rngSeed(21), GC = [];
    for (var i = 0; i < 150; i++) { var r = 1.5 + 12 * Math.pow(rng(), 1.6), th = rng() * 2 * Math.PI, ph = Math.acos(2 * rng() - 1); GC.push([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)]); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 360, 'Left: globular clusters around the Galactic centre seen from above. Right: how many clusters appear in each direction as seen from the Sun'), W = A.W, svg = A.svg, fs = A.fs;
      var wide = W >= 620, mapW = wide ? W * 0.48 : W, mx = mapW / 2, my = wide ? 175 : 110, sc = (wide ? Math.min(mapW, 300) : Math.min(W, 260)) / 2 / 16;
      el('ellipse', { cx: mx, cy: my, rx: 15 * sc, ry: 15 * sc, fill: c.border, opacity: 0.35 }, svg);
      GC.forEach(function (g) { el('circle', { cx: mx + g[0] * sc, cy: my + g[1] * sc, r: 2.2, fill: AMBER, opacity: 0.85 }, svg); });
      var sx = mx - R0 * sc, sy = my; el('circle', { cx: sx, cy: sy, r: 4.5, fill: BLUE }, svg); txt(svg, sx, sy - 9, 'Sun', { size: fs(10), fill: BLUE, weight: 700 });
      el('circle', { cx: mx, cy: my, r: 3, fill: c.ink }, svg); txt(svg, mx, my + 16, 'centre', { size: fs(9), fill: c.muted });
      txt(svg, 10, 16, wide ? 'Globular clusters seen from above' : 'Clusters seen from above', { anchor: 'start', size: fs(10), fill: c.muted });
      var bins = new Array(12).fill(0);
      GC.forEach(function (g) { var a = Math.atan2(g[1] - 0, g[0] + R0); var k = Math.floor(((a + Math.PI / 12 + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 6)) % 12; bins[k]++; });
      var hx = wide ? W * 0.55 : 40, hR = W - 15, hT = wide ? 50 : 240, hB = wide ? 300 : 330, bw = (hR - hx) / 12, mxb = Math.max.apply(null, bins);
      bins.forEach(function (b, k) { var h = (hB - hT - 20) * b / Math.max(30, mxb); el('rect', { x: hx + k * bw + 2, y: hB - h, width: bw - 4, height: h, fill: k === 0 ? RED : MU, opacity: 0.8 }, svg); var lab = k * 30; txt(svg, hx + k * bw + bw / 2, hB + 13, (W < 420 && k % 2) ? '' : lab + '°', { size: fs(8.5), fill: c.muted }); });
      el('line', { x1: hx, y1: hB, x2: hR, y2: hB, stroke: c.muted }, svg);
      txt(svg, (hx + hR) / 2, hT - 12, 'Clusters in each direction seen from the Sun', { size: fs(10), fill: c.muted });
      txt(svg, (hx + hR) / 2, hB + 27, 'direction (0° = towards the centre)', { size: fs(9), fill: c.muted });
      var frac = (bins[11] + bins[0] + bins[1]) / GC.length, half = 0; GC.forEach(function (g) { if (g[0] + R0 > 0) half++; });
      out.innerHTML = 'With the Sun ' + (R0 ? fmt(R0, 1) + ' kpc from the centre' : 'at the centre') + ', <strong>' + Math.round(100 * half / GC.length) + '%</strong> of the clusters lie in the half of the sky facing the centre, and <strong>' + Math.round(100 * frac) + '%</strong> within 45° of that direction.' + NOTE + 'These 150 clusters are invented but spread like real ones. Globular clusters, balls of hundreds of thousands of old stars, swarm in a roughly spherical cloud around the centre of the Galaxy. Seen from the centre they would be spread evenly around the sky. Harlow Shapley noticed in 1918 that, in fact, they crowd into one half of the sky, towards Sagittarius. Measuring their distances with variable stars, he located the centre of their system, and of the Galaxy, far from the Sun. The real distance is about 8.2 kpc (26,700 light-years).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a Cepheid's light curve and its distance
     ----------------------------------------------------------------------- */
  FIG['fig-cepheid'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var STARS = [
      { n: 'Delta Cephei', P: 5.37, m: 3.95, d: 'the prototype Cepheid, in the constellation Cepheus' },
      { n: 'A Cepheid in the Small Magellanic Cloud', P: 10, m: 15.1, d: 'a typical Cepheid of the kind Leavitt studied' },
      { n: 'A Cepheid in Andromeda', P: 31.4, m: 19.0, d: 'like Hubble’s first Cepheid, V1' }
    ];
    var k = 0, old = false, t0 = null;
    var controls = div('fig-controls', container);
    choice(controls, 'Star', W0() < 560 ? ['Delta Cephei', 'In the SMC', 'In Andromeda'] : STARS.map(function (s) { return s.n; }), 0, function (i) { k = i; draw(); });
    choice(controls, 'Brightness scale', ['Modern', '1920s (before 1952)'], 0, function (i) { old = !!i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function W0() { return container.clientWidth || 700; }
    function curve(ph) { ph = ph - Math.floor(ph); return ph < 0.2 ? ph / 0.2 : 1 - (ph - 0.2) / 0.8; }
    var dot, geo;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A Cepheid’s brightness rising quickly and fading slowly, repeating with its period, and the period–luminosity relation'), W = A.W, svg = A.svg, fs = A.fs, s = STARS[k];
      var wide = W >= 620, L = 46, R1 = wide ? W * 0.5 - 10 : W - 15, T = 30, B = wide ? 250 : 130;
      txt(svg, (L + R1) / 2, 16, 'Brightness over three cycles (period ' + fmt(s.P, 2) + ' days)', { size: fs(10), fill: c.muted });
      var d = ''; for (var i = 0; i <= 300; i++) { var x = L + (R1 - L) * i / 300, y = B - (B - T - 10) * (0.15 + 0.7 * curve(3 * i / 300)); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
      el('line', { x1: L, y1: B, x2: R1, y2: B, stroke: c.muted }, svg); el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.muted }, svg);
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, svg);
      [0, 1, 2, 3].forEach(function (j) { txt(svg, L + (R1 - L) * j / 3, B + 14, fmt(j * s.P, j ? 1 : 0), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R1) / 2, B + 28, 'days', { size: fs(9), fill: c.muted });
      var yt = txt(svg, 14, (T + B) / 2, 'brightness', { size: fs(9), fill: c.muted }); yt.setAttribute('transform', 'rotate(-90 14 ' + ((T + B) / 2) + ')');
      dot = el('circle', { cx: L, cy: B, r: 5, fill: AMBER, stroke: c.ink }, svg); geo = { L: L, R: R1, T: T, B: B };
      var px = wide ? W * 0.5 + 40 : 46, pR = W - 15, pT = wide ? 30 : 170, pB = wide ? 250 : 270;
      var P = plotAxes(svg, c, fs, { L: px, R: pR, T: pT, B: pB, xl: 1, xh: 100, yl: -2, yh: -7.5, xticks: [1, 10, 100], yticks: [-2, -4, -6], logx: true, xlab: 'period (days)' });
      txt(svg, px + 4, pT + 4, 'brighter ↑ (absolute magnitude)', { anchor: 'start', size: fs(9), fill: c.muted });
      plotLine(svg, P, function (x) { return plMag(x, false); }, 1, 100, 60, MU, 2, null, true);
      if (old) plotLine(svg, P, function (x) { return plMag(x, true); }, 1, 100, 60, RED, 1.5, '5 4', true);
      el('circle', { cx: P.X(s.P), cy: P.Y(plMag(s.P, old)), r: 5, fill: old ? RED : MU }, svg);
      var M = plMag(s.P, old), dpc = Math.pow(10, (s.m - M + 5) / 5);
      out.innerHTML = '<strong>' + s.n + '</strong> (' + s.d + '): period ' + fmt(s.P, 2) + ' days gives an average absolute magnitude of <strong>' + fmt(M, 2) + '</strong>. It appears at magnitude ' + fmt(s.m, 1) + ', so its distance is about <strong>' + (dpc >= 1e4 ? fmt(Math.round(dpc / 1000), 0) + ',000' : fmt(dpc, 0)) + ' parsecs</strong> (' + lyTxt(dpc) + ').' + NOTE + 'Leavitt found that brighter Cepheids have longer periods. Once the relation is calibrated with a few Cepheids of known distance, timing a Cepheid’s cycle gives its true brightness, and comparing that with how bright it looks gives its distance through the inverse-square law: <em>d</em> = 10<sup>(<em>m</em> − <em>M</em> + 5)/5</sup> parsecs. ' + (old ? 'The dashed red line shows a calibration about 1.5 magnitudes too faint, roughly the error that Walter Baade uncovered in 1952: the distances come out about half the modern values.' : 'The line is a modern calibration from Hubble Space Telescope parallaxes; this simple version ignores the dimming by dust, so the distances are only approximate.') + '</span>';
    }
    draw();
    FIG.animate(figEl, function (now) { if (!dot) return; if (t0 === null) t0 = now; var ph = ((now - t0) / 4000) % 3; dot.setAttribute('cx', (geo.L + (geo.R - geo.L) * ph / 3).toFixed(1)); dot.setAttribute('cy', (geo.B - (geo.B - geo.T - 10) * (0.15 + 0.7 * curve(ph))).toFixed(1)); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: how big is the Andromeda nebula?
     ----------------------------------------------------------------------- */
  FIG['fig-andromeda-size'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lg = Math.log10(2.5e6);
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'an-d', label: 'Assumed distance to Andromeda (light-years)', min: 3, max: 7, step: 0.01, value: lg, onChange: function (x) { lg = x; valText(sl, lyF(Math.pow(10, x))); draw(); } });
    function lyF(v) { return v >= 1e6 ? fmt(v / 1e6, 2) + ' million' : fmt(Math.round(v), 0); }
    valText(sl, lyF(Math.pow(10, lg)));
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'The physical size of the Andromeda nebula at the chosen distance, compared with the Milky Way as estimated by Curtis and Shapley'), W = A.W, svg = A.svg, fs = A.fs;
      var d = Math.pow(10, lg), size = d * 3.2 * Math.PI / 180, maxS = 300000, sc = (W - 140) / maxS, y0 = 60;
      var rows = [['Andromeda at this distance', size, AMBER], ['Milky Way (Curtis, 1920)', 30000, BLUE], ['Milky Way (Shapley, 1920)', 300000, RED], ['Milky Way (today)', 100000, MU]];
      rows.forEach(function (r, i) { var y = y0 + i * 45, w = Math.min(r[1], maxS * 1.05) * sc; el('ellipse', { cx: 20 + w / 2, cy: y, rx: Math.max(1.5, w / 2), ry: Math.max(1.5, Math.min(14, w / 8)), fill: r[2], opacity: 0.6 }, svg); txt(svg, 20, y - 16, r[0], { anchor: 'start', size: fs(10), fill: c.ink2 }); txt(svg, Math.min(W - 10, 28 + w), y + 4, (r[1] > maxS * 1.05 ? '▶ ' : '') + fmt(Math.round(r[1] / 1000), 0) + ',000 ly', { anchor: Math.min(W - 10, 28 + w) > W - 90 ? 'end' : 'start', size: fs(9.5), fill: c.muted }); });
      txt(svg, 20, 18, W < 560 ? 'Andromeda appears about 3° across.' : 'Andromeda appears about 3° across in long photographs (six full Moons).', { anchor: 'start', size: fs(9.5), fill: c.muted });
      out.innerHTML = 'At ' + lyF(d) + ' light-years, Andromeda would be about <strong>' + fmt(Math.round(size / 1000), 0) + ',000 light-years</strong> across.' + NOTE + 'An angle alone does not give a size: a nearby small cloud and a distant giant system can look the same. If the spiral nebulae were inside the Milky Way, Andromeda would be a modest cloud of gas. At Hubble’s 1925 distance of about 900,000 light-years it would be a galaxy tens of thousands of light-years across, and at the modern 2.5 million light-years it is at least as large as our own Milky Way. In the 1920 debate, Curtis’s small Galaxy made island universes plausible, while Shapley’s huge one made them seem impossible: the spirals would have to be absurdly far away to be outside it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the inverse-square law with a torch
     ----------------------------------------------------------------------- */
  FIG['fig-inverse-square'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var dist = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'is-d', label: 'Distance from the torch to the card (units)', min: 1, max: 4, step: 0.1, value: dist, onChange: function (x) { dist = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Light from a torch spreading over a growing area of graph paper as the distance increases'), W = A.W, svg = A.svg, fs = A.fs;
      var x0 = 40, cy = 140, unit = (W - 140) / 4.3, xs = x0 + dist * unit, half = 22 * dist;
      el('path', { d: 'M' + x0 + ' ' + cy + 'L' + (x0 + unit) + ' ' + (cy - 22) + 'L' + (x0 + unit) + ' ' + (cy + 22) + 'Z', fill: '#facc15', opacity: 0.35 }, svg);
      el('path', { d: 'M' + x0 + ' ' + cy + 'L' + xs + ' ' + (cy - half) + 'L' + xs + ' ' + (cy + half) + 'Z', fill: '#facc15', opacity: 0.25 }, svg);
      el('rect', { x: x0 - 26, y: cy - 9, width: 26, height: 18, rx: 3, fill: c.ink2 }, svg);
      el('line', { x1: x0 + unit, y1: cy - 26, x2: x0 + unit, y2: cy + 26, stroke: c.muted, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, x0 + unit, cy + 42, '1 unit: 1 square', { size: fs(9), fill: c.muted });
      el('line', { x1: xs, y1: cy - half - 4, x2: xs, y2: cy + half + 4, stroke: c.ink, 'stroke-width': 3 }, svg);
      txt(svg, xs, Math.min(272, cy + half + 20), fmt(dist, 1) + ' units', { size: fs(10), fill: c.ink });
      var gx = W - 92, gs = 84, n = dist * dist, side = Math.sqrt(n), cell = gs / 4;
      txt(svg, gx + gs / 2, 26, 'Lit area on the card', { size: fs(9), fill: c.muted });
      for (var i = 0; i <= 4; i++) { el('line', { x1: gx, y1: 40 + i * cell, x2: gx + gs, y2: 40 + i * cell, stroke: c.border }, svg); el('line', { x1: gx + i * cell, y1: 40, x2: gx + i * cell, y2: 40 + gs, stroke: c.border }, svg); }
      el('rect', { x: gx, y: 40, width: side * cell, height: side * cell, fill: '#facc15', opacity: Math.max(0.12, 0.9 / n), stroke: AMBER }, svg);
      out.innerHTML = 'At ' + fmt(dist, 1) + ' units, the same light covers <strong>' + fmt(n, 2) + ' squares</strong>, so each square gets <strong>1/' + fmt(n, 2) + '</strong> (' + fmt(100 / n, 1) + '%) of the light it gets at 1 unit.' + NOTE + 'The beam spreads in two directions at once, so doubling the distance spreads the light over four times the area, and each part of the card receives a quarter as much. This is the inverse-square law. It works backwards too: if two identical lamps differ in brightness by a factor of 100, the fainter one is 10 times farther away. Astronomers use it with “standard candles”, objects whose true brightness is known.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-m9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did Galileo see when he turned his telescope on the Milky Way in 1610?', options: ['A cloud of gas', 'Countless faint stars', 'Other galaxies', 'Nothing new'], answer: 1, explanation: 'The milky glow is the light of many unresolved stars.' },
      { question: 'If a lamp is moved three times farther away, its light on a card is…', options: ['1/3 as bright', '1/6 as bright', '1/9 as bright', 'Unchanged'], answer: 2, explanation: 'The inverse-square law.' },
      { question: 'What is a “standard candle”?', options: ['A candle used in the lab', 'An object whose true brightness is known', 'The brightest star', 'A unit of distance'], answer: 1, explanation: 'Comparing true and apparent brightness gives the distance.' },
      { question: 'What did Henrietta Leavitt discover?', options: ['The first exoplanet', 'That Cepheids with longer periods are more luminous', 'The expanding universe', 'The parallax of 61 Cygni'], answer: 1, explanation: 'Published in 1912 from stars in the Small Magellanic Cloud.' },
      { question: 'Why did it matter that Leavitt’s stars were all in the Small Magellanic Cloud?', options: ['They were bright', 'They are all at about the same distance, so differences in apparent brightness are real', 'The Cloud is close to the Sun', 'They were easy to photograph'], answer: 1, explanation: 'A natural laboratory.' },
      { question: 'How did Shapley show that the Sun is not at the centre of the Galaxy?', options: ['From the Sun’s motion', 'Globular clusters are concentrated towards one side of the sky', 'Counting stars', 'Measuring parallaxes'], answer: 1, explanation: 'Towards Sagittarius.' },
      { question: 'Who argued in 1920 that the spiral nebulae are separate galaxies?', options: ['Shapley', 'Curtis', 'Leavitt', 'Herschel'], answer: 1, explanation: 'Curtis was right about the spirals; Shapley was closer about the size of the Galaxy.' },
      { question: 'What did Hubble find in the Andromeda nebula in 1923?', options: ['A planet', 'A Cepheid variable', 'A black hole', 'A comet'], answer: 1, explanation: 'He wrote “VAR!” on the plate.' },
      { question: 'Why did early maps of the Galaxy put the Sun near the centre?', options: ['Religious belief', 'Interstellar dust hides distant stars in every direction along the Milky Way', 'Bad telescopes', 'The Sun really is at the centre'], answer: 1, explanation: 'Trumpler showed the importance of dust in 1930.' },
      { question: 'What is the modern distance to the Andromeda galaxy?', options: ['About 25,000 light-years', 'About 900,000 light-years', 'About 2.5 million light-years', 'About 13.8 billion light-years'], answer: 2, explanation: 'Hubble’s original distance was too small because of the Cepheid calibration.' }
    ]);
  };
})();
