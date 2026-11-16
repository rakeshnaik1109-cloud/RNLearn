/* ==========================================================================
   RNLearn — Why Is My Laser Spot Grainy? Speckle, Stray Fringes and Other Gremlins
   Figures:
     1. fig-speckle-timeline   The story at a glance (clickable timeline)
     2. fig-coherence-length   Coherence length and fringe visibility
     3. fig-phasor-walk        Speckle as a random walk of waves
     4. fig-speckle-generator  A speckle generator (FFT of a rough surface)
     5. fig-etalon             A glass plate as an accidental etalon
     6. fig-spatial-filter     Dust rings and the spatial filter
     7. fig-vibration          Vibration washes out fringes
     8. fig-artifact-doctor    What's that artifact?
     9. fig-quiz-speckle       Test yourself
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


  /* -----------------------------------------------------------------------
     Figure 1. The story at a glance
     ----------------------------------------------------------------------- */
  var ERAS = [
    { name: 'Before the laser', color: '#b45309' },
    { name: 'The laser era: speckle appears', color: '#1d4ed8' },
    { name: 'Taming it and using it', color: '#15803d' }
  ];
  var EVENTS = [
    { year: '1704', icon: '🌈', era: 0, sec: 7, title: 'Newton’s rings', text: 'Newton’s <em>Opticks</em> describes coloured rings where a curved lens touches flat glass: interference between two nearby surfaces, the same effect that makes unwanted fringes today.' },
    { year: '1815', icon: '🔆', era: 0, sec: 7, title: 'Brewster’s angle', text: 'David Brewster finds the angle at which light polarised in one direction is not reflected at all, later used for windows that send no reflection back.' },
    { year: '1818', icon: '⚪', era: 0, sec: 9, title: 'A bright spot in a shadow', text: 'Fresnel’s wave theory predicts a bright spot in the middle of a round object’s shadow. Arago looks and finds it: the same diffraction makes the ring patterns around dust.' },
    { year: '1845', icon: '🧲', era: 0, sec: 8, title: 'The Faraday effect', text: 'Michael Faraday finds that a magnetic field rotates the polarisation of light in glass, the principle of today’s optical isolators.' },
    { year: '1887', icon: '🪨', era: 0, sec: 11, title: 'A table floating on mercury', text: 'Michelson and Morley float their interferometer on a heavy stone slab in a bath of mercury, to keep vibrations from blurring the fringes.' },
    { year: '1899', icon: '🪟', era: 0, sec: 7, title: 'The Fabry–Pérot etalon', text: 'Charles Fabry and Alfred Pérot use two parallel partly reflecting surfaces as a precise interferometer. Any window can become an accidental one.' },
    { year: '1960', icon: '🔴', era: 1, sec: 4, title: 'The first laser', text: 'Theodore Maiman makes the first laser from a ruby crystal. Highly coherent light soon reveals a new problem.' },
    { year: '1962', icon: '✨', era: 1, sec: 4, title: 'Speckle noticed', text: 'Rigden and Gordon at Bell Labs describe the strange granularity of laser light scattered from ordinary surfaces, and explain it as random interference.' },
    { year: '1970', icon: '🔭', era: 2, sec: 13, title: 'Speckle interferometry', text: 'Antoine Labeyrie shows how to analyse speckle in star images to beat the blurring of the atmosphere.' },
    { year: '1971', icon: '📐', era: 2, sec: 13, title: 'ESPI', text: 'Butters and Leendertz combine speckle and video cameras to measure tiny deformations of objects.' },
    { year: '1978', icon: '🧵', era: 1, sec: 10, title: 'Modal noise named', text: 'Richard Epworth names “modal noise”, speckle inside multimode optical fibres that disturbs signals.' },
    { year: '1981', icon: '🩸', era: 2, sec: 13, title: 'Seeing blood flow', text: 'Fercher and Briers show that speckle blurred by moving blood cells can map blood flow in the eye.' },
    { year: '1990', icon: '🛰️', era: 1, sec: 16, title: 'Hubble’s flawed mirror', text: 'A test instrument set up using a laser reflection from the wrong surface leads to a mirror ground to the wrong shape.' },
    { year: '2002', icon: '📽️', era: 2, sec: 6, title: 'Speckle-free projectors', text: 'Engineers analyse how to average away speckle in laser projectors using angle, polarisation and wavelength diversity.' },
    { year: '2007', icon: '🌫️', era: 2, sec: 13, title: 'Focusing through fog', text: 'Vellekoop and Mosk shape a laser wavefront so that speckle behind an opaque layer becomes a single bright focus.' }
  ];
  FIG['fig-speckle-timeline'] = function (figEl) {
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
    var selected = 7;
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
      var rows = W < 560 ? 2 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 30;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1704 to 2007');
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
     Shared numerical helpers
     ----------------------------------------------------------------------- */
  // In-place radix-2 FFT on (re, im) arrays of length n (power of two).
  function fft1(re, im, inv) {
    var n = re.length, i, j, k, m, t;
    for (i = 1, j = 0; i < n; i++) {
      var bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (m = 2; m <= n; m <<= 1) {
      var ang = (inv ? 2 : -2) * Math.PI / m, wr = Math.cos(ang), wi = Math.sin(ang);
      for (k = 0; k < n; k += m) {
        var cr = 1, ci = 0;
        for (j = 0; j < m / 2; j++) {
          var a = k + j, b = a + m / 2;
          var xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  function fft2(re, im, N, inv) {
    var r = new Float64Array(N), q = new Float64Array(N), x, y;
    for (y = 0; y < N; y++) {
      for (x = 0; x < N; x++) { r[x] = re[y * N + x]; q[x] = im[y * N + x]; }
      fft1(r, q, inv);
      for (x = 0; x < N; x++) { re[y * N + x] = r[x]; im[y * N + x] = q[x]; }
    }
    for (x = 0; x < N; x++) {
      for (y = 0; y < N; y++) { r[y] = re[y * N + x]; q[y] = im[y * N + x]; }
      fft1(r, q, inv);
      for (y = 0; y < N; y++) { re[y * N + x] = r[y]; im[y * N + x] = q[y]; }
    }
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function figBox(container, css) { var d = div('', container); d.style.cssText = css || ''; return d; }
  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  function setActive(row, b) { Array.prototype.forEach.call(row.children, function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label);
    items.forEach(function (it, i) {
      var b = btn(it, row);
      b.addEventListener('click', function () { setActive(row, b); onPick(i); });
      if (i === initial) setActive(row, b);
    });
    return row;
  }
  // Grey-scale (theme aware) intensity image onto a canvas.
  function paint(cv, img, N, scale, gamma, crop) {
    var off = cv._off || (cv._off = document.createElement('canvas'));
    off.width = N; off.height = N;
    var octx = off.getContext('2d'), ctx = cv.getContext('2d'), id = octx.createImageData(N, N), d = id.data;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark');
    for (var i = 0; i < N * N; i++) {
      var v = Math.min(1, img[i] * scale);
      if (gamma) v = Math.pow(v, gamma);
      // red laser light on a dark background
      d[4 * i] = Math.round(255 * Math.min(1, v * 1.15));
      d[4 * i + 1] = Math.round(255 * Math.max(0, v - 0.55) * 1.4);
      d[4 * i + 2] = Math.round(255 * Math.max(0, v - 0.6) * 1.2);
      d[4 * i + 3] = 255;
    }
    octx.putImageData(id, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, cv.width, cv.height);
    var c0 = crop || 0;
    ctx.drawImage(off, c0, c0, N - 2 * c0, N - 2 * c0, 0, 0, cv.width, cv.height);
    return dark;
  }
  function makeCanvas(parent, N, cssW) {
    parent.style.cssText = 'flex:0 1 ' + cssW + 'px;width:' + cssW + 'px;max-width:100%;';
    var cv = document.createElement('canvas');
    cv.width = cssW; cv.height = cssW;
    cv.style.cssText = 'width:100%;height:auto;aspect-ratio:1/1;image-rendering:pixelated;border-radius:6px;display:block;background:#000;';
    parent.appendChild(cv);
    return cv;
  }
  function histSVG(wrap, data, maxX, title, curve) {
    var c = C();
    wrap.innerHTML = '';
    var W = Math.max(240, Math.min(420, wrap.clientWidth || 320)), H = 180, L = 34, R = W - 10, T = 22, B = H - 30;
    var fs = scaler(wrap, 300);
    var svg = FIG.createSVG(wrap, W, H, title);
    var nb = 24, bins = new Array(nb).fill(0), n = data.length;
    for (var i = 0; i < n; i++) { var k = Math.floor(data[i] / maxX * nb); if (k < nb) bins[k]++; }
    var dens = bins.map(function (b) { return b / (n * maxX / nb); });
    var ymax = Math.max(1.05, Math.max.apply(null, dens) * 1.05);
    var X = function (v) { return L + v / maxX * (R - L); }, Y = function (v) { return B - v / ymax * (B - T); };
    el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
    el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
    dens.forEach(function (v, k) { el('rect', { x: X(k * maxX / nb) + 0.5, y: Y(v), width: Math.max(1, (R - L) / nb - 1), height: B - Y(v), fill: c.accent, opacity: 0.55 }, svg); });
    if (curve) {
      var d = '';
      for (var x = 0; x <= maxX; x += maxX / 80) d += (d ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(curve(x)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.warn, 'stroke-width': 2 }, svg);
    }
    for (var t = 0; t <= maxX; t++) txt(svg, X(t), B + 14, String(t), { size: fs(10), fill: c.muted });
    txt(svg, (L + R) / 2, H - 3, 'brightness ÷ average brightness', { size: fs(10.5), fill: c.muted });
    txt(svg, L + 4, T - 8, title, { anchor: 'start', size: fs(11), weight: 600, fill: c.ink2 });
    return svg;
  }

  /* -----------------------------------------------------------------------
     Figure 2. Coherence and path difference
     ----------------------------------------------------------------------- */
  var SOURCES = [
    { name: 'Narrow-line laser', lam: 1550, Lc: 300e3, note: 'a single-frequency laser with a linewidth of about 1 MHz' },
    { name: 'Helium–neon laser', lam: 633, Lc: 200, note: 'an ordinary multimode helium–neon laser (gain width about 1.5 GHz)' },
    { name: 'Laser pointer', lam: 650, Lc: 1, note: 'a cheap multimode red diode laser (spectral width roughly 0.4 nm; real pointers vary a lot)' },
    { name: 'SLED', lam: 840, Lc: 0.018, note: 'a superluminescent diode about 40 nm wide' },
    { name: 'Red LED', lam: 630, Lc: 0.02, note: 'a red LED about 20 nm wide' },
    { name: 'White light', lam: 550, Lc: 0.001, note: 'white light about 300 nm wide' }
  ];
  var PATHS = [
    { mm: 0.01, label: 'rough paper' },
    { mm: 0.52, label: 'cover slip' },
    { mm: 3, label: '1 mm window' },
    { mm: 100, label: 'unequal arms' },
    { mm: 2000, label: 'reflection 1 m away' }
  ];
  function visibility(dmm, Lc) { var u = Math.PI * dmm / Lc; return Math.exp(-u * u / (4 * Math.LN2)); }
  function fmtLen(mm) {
    if (mm >= 1000) return fmt(mm / 1000, mm >= 10000 ? 0 : 1) + ' m';
    if (mm >= 10) return fmt(mm / 10, 0) + ' cm';
    if (mm >= 1) return fmt(mm, 1) + ' mm';
    return fmt(mm * 1000, 0) + ' µm';
  }
  FIG['fig-coherence-length'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var src = 2, logd = Math.log10(3);
    var controls = div('fig-controls', container);
    choice(controls, 'Light source', SOURCES.map(function (s) { return s.name; }), src, function (i) { src = i; draw(); });
    var sl = FIG.slider(controls, { id: 'coh-path', label: 'Path difference between the two waves', min: -3, max: 6, step: 0.05, value: logd, onChange: function (v) { logd = v; draw(); } });
    sl.element.setAttribute('aria-valuetext', fmtLen(Math.pow(10, logd)));
    var jump = group(controls, 'Jump to a typical path difference');
    PATHS.forEach(function (p) { btn(p.label, jump).addEventListener('click', function () { logd = Math.log10(p.mm); sl.setValue(Math.round(logd * 100) / 100); draw(); }); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), s = SOURCES[src], d = Math.pow(10, logd), V = visibility(d, s.Lc);
      sl.element.parentNode.querySelector('.fig-control-value').textContent = fmtLen(d);
      sl.element.setAttribute('aria-valuetext', fmtLen(d));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 520;
      var H = 290, L = 38, R = W - 14, T = 44, B = 144, fs = scaler(svgWrap, 520);
      var svg = FIG.createSVG(svgWrap, W, H, 'Fringe visibility against path difference');
      var X = function (lg) { return L + (lg + 3) / 9 * (R - L); }, Y = function (v) { return B - v * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      txt(svg, L - 5, Y(1) + 4, '1', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, L - 5, Y(0) + 4, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      [[-3, '1 µm'], [0, '1 mm'], [3, '1 m'], [6, '1 km']].forEach(function (t) {
        el('line', { x1: X(t[0]), y1: B, x2: X(t[0]), y2: B + 4, stroke: c.muted }, svg);
        txt(svg, X(t[0]), B + 16, t[1], { size: fs(10), fill: c.muted, anchor: t[0] === -3 ? 'start' : t[0] === 6 ? 'end' : 'middle' });
      });
      txt(svg, 4, 12, 'fringe visibility', { anchor: 'start', size: fs(10.5), fill: c.muted });
      PATHS.forEach(function (p, i) {
        var x = X(Math.log10(p.mm));
        el('line', { x1: x, y1: T - 4 + (i % 2) * 11, x2: x, y2: B, stroke: c.faint, 'stroke-dasharray': '2 3' }, svg);
        if (!narrow) txt(svg, x, T - 18 + (i % 2) * 11, p.label, { size: fs(9.5), fill: c.faint });
      });
      var path = '';
      for (var lg = -3; lg <= 6.001; lg += 0.02) path += (path ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(visibility(Math.pow(10, lg), s.Lc)).toFixed(1);
      el('path', { d: path, fill: 'none', stroke: c.accent, 'stroke-width': 2.5 }, svg);
      el('circle', { cx: X(logd), cy: Y(V), r: 6.5, fill: c.warn, stroke: c.surface, 'stroke-width': 2 }, svg);
      // fringes as seen on a screen
      var fy = 190, fh = 70, n = 70, sw = (R - L) / n;
      txt(svg, L, fy - 6, 'What you would see on a screen:', { anchor: 'start', size: fs(10.5), fill: c.muted });
      for (var k = 0; k < n; k++) {
        var I = 0.5 * (1 + V * Math.cos(2 * Math.PI * k / 10));
        el('rect', { x: L + k * sw, y: fy, width: sw + 0.6, height: fh, fill: '#ff2a1a', opacity: (0.08 + 0.92 * I).toFixed(3) }, svg);
      }
      el('rect', { x: L, y: fy, width: R - L, height: fh, fill: 'none', stroke: c.border }, svg);
      txt(svg, (L + R) / 2, H - 6, 'path difference (each step ×10)', { size: fs(10.5), fill: c.muted });
      var verdict = V > 0.7 ? 'clear, high-contrast fringes' : V > 0.2 ? 'weak, washed-out fringes' : V > 0.02 ? 'barely visible fringes' : 'no fringes at all: the two waves simply add their brightness';
      read.innerHTML = '<strong>' + s.name + '</strong>: ' + s.note + '. Coherence length ≈ <strong>' + fmtLen(s.Lc) + '</strong>.<br>' +
        'Path difference ' + fmtLen(d) + ' → visibility <strong>' + fmt(V * 100, V < 0.01 && V > 0 ? 1 : 0) + '%</strong>: ' + verdict + '.' +
        (narrow ? '<br><span style="font-size:0.85rem;color:var(--ink-muted);">Dotted lines, left to right: rough paper, cover slip, 1 mm window, unequal arms, reflection 1 m away.</span>' : '');
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. The random phasor walk
     ----------------------------------------------------------------------- */
  FIG['fig-phasor-walk'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 20, phases = [], samples = [];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pw-n', label: 'Number of scattering points', min: 1, max: 50, step: 1, value: N, onChange: function (v) { N = v; samples = []; newSurface(); } });
    var row = group(controls, 'Actions');
    btn('New surface', row).addEventListener('click', function () { newSurface(); });
    btn('Add 500 surfaces to the histogram', row).addEventListener('click', function () { for (var i = 0; i < 500; i++) samples.push(intensity(randPhases())); draw(); });
    btn('Clear histogram', row).addEventListener('click', function () { samples = []; draw(); });
    var grid = div('', container);
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.75rem;align-items:flex-start;';
    var left = div('', grid), right = div('', grid);
    left.style.cssText = 'flex:1 1 260px;min-width:240px;';
    right.style.cssText = 'flex:1 1 260px;min-width:240px;';
    var read = div('', container);
    read.style.cssText = READ_CSS;
    function randPhases() { var p = []; for (var i = 0; i < N; i++) p.push(Math.random() * 2 * Math.PI); return p; }
    function intensity(p) { var x = 0, y = 0; p.forEach(function (a) { x += Math.cos(a); y += Math.sin(a); }); return (x * x + y * y) / N; }
    function newSurface() { phases = randPhases(); samples.push(intensity(phases)); draw(); }
    function draw() {
      var c = C();
      left.innerHTML = '';
      var W = Math.max(240, Math.min(420, left.clientWidth || 300)), H = W * 0.9;
      var svg = FIG.createSVG(left, W, H, 'Adding waves with random phases');
      var fs = scaler(left, 300);
      var s = Math.min(W, H) * 0.42 / Math.max(2.2, Math.sqrt(N) * 1.6), cx = W / 2, cy = H / 2;
      el('circle', { cx: cx, cy: cy, r: s * Math.sqrt(N), fill: 'none', stroke: c.faint, 'stroke-dasharray': '3 4' }, svg);
      el('line', { x1: cx - 6, y1: cy, x2: cx + 6, y2: cy, stroke: c.muted }, svg);
      el('line', { x1: cx, y1: cy - 6, x2: cx, y2: cy + 6, stroke: c.muted }, svg);
      var x = cx, y = cy;
      phases.forEach(function (a, i) {
        var nx = x + s * Math.cos(a), ny = y - s * Math.sin(a);
        el('line', { x1: x, y1: y, x2: nx, y2: ny, stroke: c.accent, 'stroke-width': 1.6, opacity: 0.85 }, svg);
        el('circle', { cx: nx, cy: ny, r: 1.8, fill: c.accent }, svg);
        x = nx; y = ny;
      });
      el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: c.warn, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      el('circle', { cx: x, cy: y, r: 4.5, fill: c.warn }, svg);
      txt(svg, 6, 14, 'Blue: one wave from each point', { anchor: 'start', size: fs(10.5), fill: c.ink2 });
      txt(svg, 6, 28, 'Red: the total wave', { anchor: 'start', size: fs(10.5), fill: c.warn });
      txt(svg, 6, H - 6, 'Dashed circle: typical size of the total', { anchor: 'start', size: fs(10), fill: c.muted });
      histSVG(right, samples, 5, 'Brightness of ' + samples.length + (samples.length === 1 ? ' surface' : ' surfaces'), N >= 6 ? function (v) { return Math.exp(-v); } : null);
      var I = phases.length ? intensity(phases) : 0, mean = 0, sd = 0;
      samples.forEach(function (v) { mean += v; }); mean /= samples.length || 1;
      samples.forEach(function (v) { sd += (v - mean) * (v - mean); }); sd = Math.sqrt(sd / Math.max(1, samples.length - 1));
      read.innerHTML = 'This surface: brightness = <strong>' + fmt(I, 2) + '</strong> × the average.' +
        (samples.length > 30 ? ' Speckle contrast of your histogram (spread ÷ average) = <strong>' + fmt(sd / mean, 2) + '</strong>.' : ' Add surfaces to build up a histogram.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' +
        (N === 1 ? 'With one scattering point there is no interference, so every surface is equally bright and the contrast is 0.' :
          N < 6 ? 'With only a few points the histogram has an odd shape. Try 20 or more.' :
          'With many points the histogram follows the red curve, e<sup>−x</sup>: dark spots are the most common brightness, and the contrast approaches 1. This is “fully developed” speckle.') + '</span>';
    }
    newSurface();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. A speckle generator
     ----------------------------------------------------------------------- */
  var NAVG = [1, 2, 4, 8, 16, 32, 64];
  FIG['fig-speckle-generator'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 128, spot = 12, rough = 1, avgI = 0, cache = null;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'sp-spot', label: 'Size of the illuminated spot (or of the camera aperture)', min: 4, max: 40, step: 1, value: spot, onChange: function (v) { spot = v; cache = null; draw(); } });
    choice(controls, 'Surface', ['Mirror-smooth', 'Slightly rough', 'Rough (paper, paint)'], 2, function (i) { rough = [0, 0.06, 1][i]; cache = null; draw(); });
    var sl = FIG.slider(controls, { id: 'sp-avg', label: 'Number of independent patterns averaged', min: 0, max: 6, step: 1, value: 0, onChange: function (v) { avgI = v; draw(); } });
    var row = group(controls, 'Actions');
    btn('New surface', row).addEventListener('click', function () { cache = null; draw(); });
    var grid = div('', container);
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.9rem;align-items:center;justify-content:center;';
    var imgWrap = div('', grid), histWrap = div('', grid);
    histWrap.style.cssText = 'flex:1 1 260px;min-width:240px;max-width:420px;';
    var cv = makeCanvas(imgWrap, N, 300);
    var read = div('', container);
    read.style.cssText = READ_CSS;
    function onePattern() {
      var re = new Float64Array(N * N), im = new Float64Array(N * N), out = new Float64Array(N * N);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var dx = x - N / 2, dy = y - N / 2;
        if (dx * dx + dy * dy <= spot * spot) {
          var ph = rough >= 1 ? Math.random() * 2 * Math.PI : 2 * Math.PI * rough * gauss();
          re[y * N + x] = Math.cos(ph); im[y * N + x] = Math.sin(ph);
        }
      }
      fft2(re, im, N, false);
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var k = j * N + i, t = ((j + N / 2) % N) * N + ((i + N / 2) % N);
        out[t] = re[k] * re[k] + im[k] * im[k];
      }
      return out;
    }
    function draw() {
      var n = NAVG[avgI];
      sl.element.parentNode.querySelector('.fig-control-value').textContent = String(n);
      if (!cache) cache = [];
      while (cache.length < n) cache.push(onePattern());
      var img = new Float64Array(N * N), m = 0, s2 = 0, i;
      for (var p = 0; p < n; p++) for (i = 0; i < N * N; i++) img[i] += cache[p][i] / n;
      // statistics in the central region (where the pattern is roughly uniform)
      var vals = [];
      for (var y = N / 4; y < 3 * N / 4; y++) for (var x = N / 4; x < 3 * N / 4; x++) vals.push(img[y * N + x]);
      vals.forEach(function (v) { m += v; }); m /= vals.length;
      vals.forEach(function (v) { s2 += (v - m) * (v - m); });
      var contrast = Math.sqrt(s2 / vals.length) / m;
      paint(cv, img, N, 1 / (2.6 * m), 0.8);
      histSVG(histWrap, vals.map(function (v) { return v / m; }), 5, 'Brightness histogram (centre of image)',
        rough >= 1 ? (n === 1 ? function (v) { return Math.exp(-v); } : function (v) { return Math.pow(n, n) * Math.pow(v, n - 1) * Math.exp(-n * v) / gammaFn(n); }) : null);
      var grain = N / (2 * spot);
      read.innerHTML = (rough >= 1 ? 'Measured speckle contrast: <strong>' + fmt(contrast, 2) + '</strong>' : 'No fully developed speckle here') +
        (rough >= 1 ? ' (theory for ' + n + ' independent pattern' + (n > 1 ? 's' : '') + ': 1 ÷ √' + n + ' = ' + fmt(1 / Math.sqrt(n), 2) + ').' : '.') +
        (rough >= 1 ? ' Typical grain size: about ' + fmt(grain, grain < 10 ? 1 : 0) + ' pixels.' : '') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' +
        (rough === 0 ? 'A mirror sends the light into one clean spot (with faint diffraction rings). No speckle.' :
          rough < 1 ? 'A slightly rough surface gives a bright mirror-like spot surrounded by a faint speckle halo.' :
            'Bigger spot → smaller grains: the grain size is set by the wavelength divided by the angle the spot (or aperture) fills. Averaging patterns smooths the image but only slowly: 4 patterns halve the contrast, 100 would cut it to a tenth.') + '</span>';
    }
    function gammaFn(n) { var g = 1; for (var k = 2; k < n; k++) g *= k; return g; }
    draw();
    var lastW = 0;
    window.addEventListener('resize', function () { var w = container.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. The accidental etalon
     ----------------------------------------------------------------------- */
  var COATS = [{ name: 'Uncoated glass', R: 0.04 }, { name: 'Single-layer AR', R: 0.013 }, { name: 'V-coat AR', R: 0.0025 }];
  FIG['fig-etalon'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d = 1, coat = 0, src = 1, wedge = 0, n = 1.5;
    var esrc = [SOURCES[1], SOURCES[2], SOURCES[4]];
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'et-d', label: 'Glass thickness', min: 0.1, max: 10, step: 0.1, value: d, unit: 'mm', onChange: function (v) { d = v; draw(); } });
    choice(controls, 'Surfaces', COATS.map(function (x) { return x.name; }), coat, function (i) { coat = i; draw(); });
    choice(controls, 'Light source', esrc.map(function (x) { return x.name; }), 0, function (i) { src = i + 1; draw(); });
    choice(controls, 'Shape', ['Parallel faces', 'Wedged by 0.5°'], 0, function (i) { wedge = i; draw(); });
    src = 1;
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), s = esrc[src - 1], R = COATS[coat].R, lam = s.lam * 1e-6; // mm
      var opd = 2 * n * d, V = visibility(opd, s.Lc);
      var alpha = wedge ? 0.5 * Math.PI / 180 : 0, dev = 2 * n * alpha, sep = dev * 200, eta = Math.exp(-sep * sep);
      var depth = 4 * eta * V * R / (1 + R * R);
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 230, L = 46, Rr = W - 12, T = 16, B = H - 40;
      var fs = scaler(svgWrap, 520);
      var svg = FIG.createSVG(svgWrap, W, H, 'Transmitted brightness as the glass thickness changes');
      var period = s.lam / (2 * n), span = 4 * period; // nm of thickness change
      var X = function (t) { return L + t / span * (Rr - L); }, Y = function (v) { return T + (1.2 - v) / 0.4 * (B - T); };
      [0.8, 0.9, 1, 1.1, 1.2].forEach(function (v) {
        el('line', { x1: L, y1: Y(v), x2: Rr, y2: Y(v), stroke: c.border, 'stroke-width': v === 1 ? 1.2 : 0.6 }, svg);
        txt(svg, L - 5, Y(v) + 4, (v === 1 ? '' : (v > 1 ? '+' : '−')) + fmt(Math.abs(v - 1) * 100, 0) + '%', { anchor: 'end', size: fs(10), fill: c.muted });
      });
      var path = '';
      for (var t = 0; t <= span; t += span / 300) {
        var I = 1 + depth / 2 * Math.cos(4 * Math.PI * n * (t * 1e-6) / lam);
        path += (path ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(Math.max(0.8, Math.min(1.2, I))).toFixed(1);
      }
      el('path', { d: path, fill: 'none', stroke: c.accent, 'stroke-width': 2.4 }, svg);
      for (var k = 0; k <= 4; k++) txt(svg, X(k * period), B + 15, fmt(k * period, 0), { size: fs(10), fill: c.muted, anchor: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' });
      txt(svg, (L + Rr) / 2, H - 6, 'change in glass thickness (nm)', { size: fs(10.5), fill: c.muted });
      txt(svg, L + 4, T + 10, 'transmitted brightness', { anchor: 'start', size: fs(10.5), fill: c.muted });
      var perC = s.lam * 1e-6 / (2 * d * 1.2e-5); // °C per fringe, using d(nL)/dT/L ≈ 1.2e-5 per °C
      read.innerHTML = 'Extra path of the twice-reflected wave: 2<em>nd</em> = <strong>' + fmtLen(opd) + '</strong>; ' + s.name.toLowerCase() + ' coherence length ≈ ' + fmtLen(s.Lc) + '.<br>' +
        'Brightness ripple (peak to peak): <strong>' + (depth < 0.001 ? 'less than 0.1%' : fmt(depth * 100, depth < 0.1 ? 1 : 0) + '%') + '</strong>. ' +
        (wedge ? 'The wedge tilts the twice-reflected beam by ' + fmt(dev * 180 / Math.PI, 1) + '°, so 20 cm away it lands ' + fmt(sep, 0) + ' mm to the side of a 2 mm beam and no longer overlaps it. ' : '') +
        (V < 0.05 && !wedge ? 'The two waves are no longer coherent with each other, so they do not interfere. ' : '') +
        (depth >= 0.001 ? 'One fringe passes for every ' + fmt(period, 0) + ' nm of thickness change, which for this plate means warming it by only about ' + fmt(perC, perC < 10 ? 1 : 0) + ' °C.' : '') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Simplified two-beam model with an illustrative temperature coefficient for ordinary glass; the curve is clipped at ±20%.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Dust rings and the spatial filter
     ----------------------------------------------------------------------- */
  FIG['fig-spatial-filter'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 256, w = 34, dusty = 1, pin = 0, k = 1.5, specks = [];
    function newDust() {
      specks = [];
      for (var i = 0; i < 4; i++) specks.push({ x: N / 2 + (Math.random() - 0.5) * 70, y: N / 2 + (Math.random() - 0.5) * 70, a: 0.22 + 0.12 * Math.random(), th: Math.random() * 6.283 });
    }
    newDust();
    var controls = div('fig-controls', container);
    choice(controls, 'Optics', ['Clean', 'Dusty'], 1, function (i) { dusty = i; draw(); });
    choice(controls, 'Spatial filter', ['No pinhole', 'Lens + pinhole'], 0, function (i) { pin = i; draw(); });
    FIG.slider(controls, { id: 'sf-k', label: 'Pinhole diameter ÷ focused spot diameter', min: 0.5, max: 4, step: 0.1, value: k, onChange: function (v) { k = v; if (pin) draw(); } });
    var row = group(controls, 'Actions');
    btn('New dust', row).addEventListener('click', function () { newDust(); draw(); });
    var grid = div('', container);
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.9rem;align-items:center;justify-content:center;';
    var imgWrap = div('', grid), plotWrap = div('', grid);
    plotWrap.style.cssText = 'flex:1 1 260px;min-width:240px;max-width:420px;';
    var cv = makeCanvas(imgWrap, N, 300);
    var read = div('', container);
    read.style.cssText = READ_CSS;
    function compute(dustOn) {
      var re = new Float64Array(N * N), im = new Float64Array(N * N), x, y, i, p0 = 0, p1 = 0;
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
        var dx = x - N / 2, dy = y - N / 2, g = Math.exp(-(dx * dx + dy * dy) / (w * w)), er = 1, ei = 0;
        if (dustOn) specks.forEach(function (s) {
          var r2 = (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y), env = s.a * Math.exp(-r2 / 700) * (1 - Math.exp(-r2 / 30)), ph = Math.PI * r2 / 90 + s.th;
          er += env * Math.cos(ph); ei += env * Math.sin(ph);
        });
        re[y * N + x] = g * er; im[y * N + x] = g * ei;
      }
      for (i = 0; i < N * N; i++) p0 += re[i] * re[i] + im[i] * im[i];
      if (pin) {
        fft2(re, im, N, false);
        var rf = k * N / (Math.PI * w); // pinhole radius in frequency bins (k × focused 1/e² radius)
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
          var fx = x < N / 2 ? x : x - N, fy = y < N / 2 ? y : y - N;
          if (fx * fx + fy * fy > rf * rf) { re[y * N + x] = 0; im[y * N + x] = 0; }
        }
        fft2(re, im, N, true);
        for (i = 0; i < N * N; i++) { re[i] /= N * N; im[i] /= N * N; }
      }
      var img = new Float64Array(N * N);
      for (i = 0; i < N * N; i++) { img[i] = re[i] * re[i] + im[i] * im[i]; p1 += img[i]; }
      return { img: img, p0: p0, p1: p1 };
    }
    function draw() {
      var c = C(), x, y, cur = compute(dusty), img = cur.img, p0 = cur.p0, p1 = cur.p1;
      paint(cv, img, N, 0.85, 0.9, 48);
      // cross-section through the centre
      plotWrap.innerHTML = '';
      var W = Math.max(240, Math.min(420, plotWrap.clientWidth || 320)), H = 190, L = 12, R = W - 12, T = 26, B = H - 26;
      var fs = scaler(plotWrap, 300);
      var svg = FIG.createSVG(plotWrap, W, H, 'Brightness along a line through the beam centre');
      var X = function (px) { return L + px / (N - 1) * (R - L); }, Y = function (v) { return B - Math.min(1.6, v) / 1.6 * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      var pi = '', pg = '', rms = 0, cnt = 0, yc = Math.round(N / 2);
      for (x = 0; x < N; x++) {
        var v = img[yc * N + x], gi = Math.exp(-2 * (x - N / 2) * (x - N / 2) / (w * w));
        pi += (pi ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(v).toFixed(1);
        pg += (pg ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(gi).toFixed(1);
      }
      if (dusty) {
        var ref = compute(false).img, peak = ref[(N / 2) * N + N / 2];
        for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
          var r2 = (x - N / 2) * (x - N / 2) + (y - N / 2) * (y - N / 2);
          if (r2 < w * w) { rms += Math.pow(img[y * N + x] - ref[y * N + x], 2); cnt++; }
        }
        rms = Math.sqrt(rms / cnt) / peak;
      }
      el('path', { d: pg, fill: 'none', stroke: c.faint, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      el('path', { d: pi, fill: 'none', stroke: c.warn, 'stroke-width': 2 }, svg);
      txt(svg, L, 12, 'Red: brightness along the middle row', { anchor: 'start', size: fs(10.5), fill: c.warn });
      txt(svg, L, T - 2, 'Dashed: a perfect Gaussian beam', { anchor: 'start', size: fs(10.5), fill: c.muted });
      var trans = p1 / p0;
      read.innerHTML = (pin ? 'Power through the pinhole: <strong>' + fmt(trans * 100, 0) + '%</strong>. ' : '') +
        (dusty ? 'Ripple caused by the dust: <strong>' + fmt(rms * 100, 1) + '%</strong> of the peak brightness.' : 'No dust, so no rings.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' +
        (!dusty && !pin ? 'A clean Gaussian beam: smooth, with no rings.' :
          dusty && !pin ? 'Each dust speck adds a faint wave that spreads out and interferes with the beam, drawing a set of rings (a “bullseye”) around it.' :
            k < 1 ? 'The pinhole is now smaller than the focused spot: it cuts off part of the beam itself, wasting power and spreading the beam into rings of its own.' :
              k > 2.6 ? 'A large pinhole passes almost all the power, but also lets some of the scattered light through, so a little ripple survives.' :
                'The lens focuses the clean beam to a tiny spot, while light scattered by dust is focused off to the side and is blocked. A pinhole about 1.5 times the focused spot passes almost all the power and removes the rings.') +
        ' (An illustrative model, not drawn to scale.)</span>';
    }
    draw();
    var lastW = 0;
    window.addEventListener('resize', function () { var ww = container.clientWidth; if (Math.abs(ww - lastW) > 30) { lastW = ww; draw(); } });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Vibration washes out fringes
     ----------------------------------------------------------------------- */
  var EXPO = [0.1, 0.3, 1, 3, 10, 30, 100];
  FIG['fig-vibration'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var amp = 120, ei = 4, table = 0, f = 30, lam = 633, shot = { m: 1, ph: 0 };
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'vb-a', label: 'Mirror vibration amplitude', min: 0, max: 400, step: 5, value: amp, unit: 'nm', onChange: function (v) { amp = v; takeShot(); } });
    var se = FIG.slider(controls, { id: 'vb-e', label: 'Camera exposure time', min: 0, max: 6, step: 1, value: ei, onChange: function (v) { ei = v; takeShot(); } });
    choice(controls, 'Table', ['Ordinary bench', 'Floating optical table'], 0, function (i) { table = i; takeShot(); });
    var row = group(controls, 'Actions');
    btn('Take another photo', row).addEventListener('click', function () { takeShot(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function effAmp() { return table ? amp / 20 : amp; }
    function phase(t) { return 4 * Math.PI * effAmp() * Math.sin(2 * Math.PI * f * t) / lam; }
    function takeShot() {
      var T = EXPO[ei] / 1000, t0 = Math.random(), sr = 0, si = 0, M = 400;
      for (var k = 0; k < M; k++) { var p = phase(t0 + T * (k + 0.5) / M); sr += Math.cos(p); si += Math.sin(p); }
      shot = { m: Math.hypot(sr, si) / M, ph: Math.atan2(si, sr) };
      draw(0);
    }
    function stripes(svg, x0, y0, w, h, V, ph, n) {
      var bars = 90, sw = w / bars;
      for (var k = 0; k < bars; k++) {
        var I = 0.5 * (1 + V * Math.cos(2 * Math.PI * n * k / bars + ph));
        el('rect', { x: x0 + k * sw, y: y0, width: sw + 0.6, height: h, fill: '#ff2a1a', opacity: (0.06 + 0.94 * I).toFixed(3) }, svg);
      }
      el('rect', { x: x0, y: y0, width: w, height: h, fill: 'none', stroke: C().border }, svg);
    }
    function j0(x) { var s = 0, t = 1; for (var k = 0; k < 30; k++) { if (k) t *= -(x * x / 4) / (k * k); s += t; } return s; }
    function draw(ts) {
      var c = C();
      se.element.parentNode.querySelector('.fig-control-value').textContent = EXPO[ei] + ' ms';
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 520;
      var fs = scaler(svgWrap, 420), H = narrow ? 250 : 140;
      var svg = FIG.createSVG(svgWrap, W, H, 'Live view and recorded photo of interference fringes');
      var pw = narrow ? W - 20 : (W - 40) / 2, ph = 80;
      var t = (ts || 0) / 1000 / 20; // slowed down 20 times
      txt(svg, 10, 14, 'Live view (slowed down 20×)', { anchor: 'start', size: fs(11), weight: 600, fill: c.ink2 });
      drawLive(ts || 0);
      var x2 = narrow ? 10 : 30 + pw, y2 = narrow ? 140 : 22;
      txt(svg, x2, y2 - 8, 'Photo with a ' + EXPO[ei] + ' ms exposure', { anchor: 'start', size: fs(11), weight: 600, fill: c.ink2 });
      stripes(svg, x2, y2, pw, ph, shot.m, shot.ph, 6);
      if (!ts) {
        var arg = 4 * Math.PI * effAmp() / lam, long = Math.abs(j0(arg));
        read.innerHTML = 'Effective mirror vibration: <strong>' + fmt(effAmp(), effAmp() < 10 ? 1 : 0) + ' nm</strong> at ' + f + ' Hz. Fringe visibility in this photo: <strong>' + fmt(shot.m * 100, 0) + '%</strong>.' +
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Moving a mirror by half a wavelength (' + fmt(lam / 2, 0) + ' nm) shifts the pattern by one whole fringe. ' +
          (EXPO[ei] >= 30 ? 'This exposure covers whole vibration cycles, so the visibility settles at about ' + fmt(long * 100, 0) + '%. ' : 'Short exposures freeze the fringes, but each photo catches them in a different place: press “Take another photo”. ') +
          (table ? 'The floating table cuts the vibration about twentyfold (an illustrative figure).' : 'Try the floating optical table.') + '</span>';
      }
    }
    takeShot();
    var lastTs = 0;
    function drawLive(ts) {
      var svg = svgWrap.querySelector('svg'); if (!svg) return;
      var W = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || parseFloat(svg.getAttribute('width')) || svgWrap.clientWidth, narrow = W < 520, pw = narrow ? W - 20 : (W - 40) / 2;
      var old = svg.querySelector('g.live'); if (old) old.parentNode.removeChild(old);
      var g = el('g', { 'class': 'live' }, svg);
      stripes(g, 10, 22, pw, 80, 1, phase(ts / 1000 / 20), 6);
    }
    FIG.animate(figEl, function (ts) { lastTs = ts; drawLive(ts); });
    window.addEventListener('resize', function () { draw(0); });
    onTheme(function () { draw(0); });
  };

  /* -----------------------------------------------------------------------
     Figure 8. What's that artifact?
     ----------------------------------------------------------------------- */
  var SYMPTOMS = [
    { s: 'Grainy, sparkling pattern on a beam or image', cause: 'Laser speckle: random interference of light scattered from a rough surface or diffuser.', test: 'Move your head or the camera slightly. Speckle changes completely; a real feature stays put. Close the camera aperture: speckle grains grow.', fix: 'Average many patterns: a moving diffuser, a vibrating multimode fibre, several wavelengths or angles, or a broadband source if you do not need coherence.', sec: 6 },
    { s: 'Stripes or rings that drift slowly over minutes', cause: 'An accidental etalon: two parallel surfaces (window, filter, cover slip, camera cover glass) interfere.', test: 'Tilt or tap each optic in turn, or warm it with your hand. The fringes move when you touch the culprit.', fix: 'Wedged or anti-reflection-coated optics, a small tilt, index-matching fluid, or a source with a shorter coherence length.', sec: 7 },
    { s: 'A faint second spot or image next to the real one', cause: 'A ghost reflection: light reflected twice inside a lens, window or beamsplitter.', test: 'Tilt the suspect optic: a ghost moves at a different rate from the real image.', fix: 'AR coatings, wedged beamsplitters, slight tilts, and beam dumps for the stray beams.', sec: 8 },
    { s: 'Laser power jumps or gets noisy when you add an optic', cause: 'Back-reflection into the laser (optical feedback), causing mode hops and intensity noise.', test: 'Block the beam just after the laser, then step by step further along. The noise appears when the reflecting surface is reached.', fix: 'An optical isolator, angled (APC) fibre connectors, and tilting surfaces so no reflection goes straight back.', sec: 8 },
    { s: 'Bullseye rings that stay fixed in one place', cause: 'Diffraction from dust, scratches or fingerprints on an optic.', test: 'Rotate or slide each optic: the rings move with the dirty one.', fix: 'Clean the optic properly, and clean up the beam with a spatial filter (lens plus pinhole).', sec: 9 },
    { s: 'Fringes shimmer, wash out or jump; worse when people walk by', cause: 'Vibration or air currents changing the path lengths by fractions of a wavelength.', test: 'Watch the fringes while tapping the table, or while the air conditioning switches on and off.', fix: 'A floating optical table, short and rigid mounts, an enclosure or tubes around the beam, and shorter exposures.', sec: 11 },
    { s: 'The light from a fibre flickers when the fibre is touched', cause: 'Modal noise (speckle inside a multimode fibre) or polarisation changes in the fibre.', test: 'Gently move the fibre and watch the output pattern or power after a polariser.', fix: 'Single-mode or polarisation-maintaining fibre, taping fibres down, or deliberately scrambling the modes (a mode scrambler).', sec: 10 },
    { s: 'The signal slowly drifts over hours', cause: 'Temperature changes: mounts expand, alignment walks, etalon fringes drift, the laser warms up.', test: 'Log the room temperature next to your signal and compare the two.', fix: 'Warm the laser up first, control the room temperature, use a reference beam to normalise, and avoid long lever arms in mounts.', sec: 11 },
    { s: 'Flat-topped peaks, or streaks from a bright spot', cause: 'Detector saturation (and blooming in some cameras).', test: 'Halve the light with a filter. If the measured peak does not halve, the detector was saturated.', fix: 'Neutral-density filters, shorter exposures, and staying in the detector’s linear range.', sec: 12 },
    { s: 'The background changes when the room lights or screens change', cause: 'Stray light reaching the detector.', test: 'Block the laser and see what signal remains.', fix: 'Turn off room lights, add baffles, tubes and black covers, use filters, or modulate the laser and use lock-in detection.', sec: 11 },
    { s: 'Wavy patterns when imaging fine stripes or grids', cause: 'Aliasing (moiré): the pattern is finer than the camera pixels can record.', test: 'Change the magnification slightly. Moiré changes dramatically; real structure does not.', fix: 'Increase the magnification so the finest detail covers at least two pixels.', sec: 12 },
    { s: 'Single-photon counts with no light, or just after a pulse', cause: 'Dark counts and afterpulsing in single-photon detectors, or stray light in a dark room.', test: 'Cover the detector completely and count; then look at the time delays between counts.', fix: 'Cool the detector, add a dead time after each count, block stray light carefully, and subtract a measured background.', sec: 12 }
  ];
  FIG['fig-artifact-doctor'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var list = div('', container);
    list.setAttribute('role', 'group');
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;';
    var panel = div('', container);
    panel.style.cssText = READ_CSS + 'min-height:8rem;';
    panel.setAttribute('aria-live', 'polite');
    var buttons = SYMPTOMS.map(function (x, i) {
      var b = btn(x.s, list);
      b.style.cssText = 'text-align:left;white-space:normal;line-height:1.3;';
      b.addEventListener('click', function () { show(i); });
      return b;
    });
    function show(i) {
      var x = SYMPTOMS[i];
      buttons.forEach(function (b, j) { b.classList.toggle('active', i === j); b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      panel.innerHTML = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.3rem;">' + x.s + '</div>' +
        '<div><strong>Likely cause:</strong> ' + x.cause + '</div>' +
        '<div style="margin-top:0.25rem;"><strong>Quick test:</strong> ' + x.test + '</div>' +
        '<div style="margin-top:0.25rem;"><strong>Fixes:</strong> ' + x.fix + '</div>' +
        '<a href="#section-' + x.sec + '" style="display:inline-block;margin-top:0.35rem;font-size:0.85rem;">Read more in section ' + x.sec + ' →</a>';
    }
    show(0);
  };

  /* -----------------------------------------------------------------------
     Figure 9. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-speckle'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why does a laser spot on a wall look grainy, while a torch beam does not?', options: ['The laser is dirty', 'Laser light is coherent, so waves scattered from the rough wall interfere', 'The wall absorbs red light', 'Our eyes are damaged by lasers'], answer: 1, explanation: 'Each point of the rough surface sends back a wave with a random phase. With coherent light they interfere, making bright and dark grains.' },
      { question: 'Roughly what is the coherence length of light with wavelength λ and spectral width Δλ?', options: ['λ × Δλ', 'λ² ÷ Δλ', 'Δλ ÷ λ', 'Always 1 metre'], answer: 1, explanation: 'A narrower spectrum means a longer coherence length.' },
      { question: 'In fully developed speckle, what is the most common brightness?', options: ['The average', 'Twice the average', 'Nearly dark', 'Exactly zero everywhere'], answer: 2, explanation: 'The brightness follows a negative exponential distribution, so dark spots are the most common.' },
      { question: 'You average 16 independent speckle patterns. What happens to the speckle contrast?', options: ['It falls to 1/16', 'It falls to 1/4', 'It does not change', 'It doubles'], answer: 1, explanation: 'Contrast falls as 1 ÷ √N, so 16 patterns give a quarter of the original contrast.' },
      { question: 'You close down a camera’s aperture while photographing laser speckle. What happens?', options: ['The speckle disappears', 'The speckle grains get bigger', 'The grains get smaller', 'Nothing'], answer: 1, explanation: 'Grain size is about the wavelength divided by the angle of the aperture: a smaller aperture gives bigger grains.' },
      { question: 'What does a wedged window do?', options: ['Polarises the light', 'Sends the twice-reflected beam off at an angle, so it cannot interfere with the main beam', 'Makes the beam bigger', 'Increases the coherence length'], answer: 1, explanation: 'Wedging (often about half a degree) separates the unwanted reflection from the main beam.' },
      { question: 'Which device stops reflected light from going back into a laser?', options: ['A beam expander', 'An optical isolator using the Faraday effect', 'A diffraction grating', 'A neutral-density filter'], answer: 1, explanation: 'The Faraday rotator turns the polarisation the same way in both directions, so the returning light is blocked by a polariser.' },
      { question: 'How do you clean up rings caused by dust on a laser beam?', options: ['Add a second laser', 'Focus the beam through a small pinhole (a spatial filter)', 'Increase the power', 'Use a longer fibre'], answer: 1, explanation: 'The clean beam focuses to a small spot that passes the pinhole; scattered light focuses elsewhere and is blocked.' },
      { question: 'By how much must a mirror move to shift an interference pattern by one whole fringe?', options: ['One wavelength', 'Half a wavelength', 'One millimetre', 'One centimetre'], answer: 1, explanation: 'Reflection doubles the path change, so λ/2 of mirror movement changes the path by a whole wavelength.' },
      { question: 'Which of these uses speckle as a signal rather than treating it as noise?', options: ['Laser speckle contrast imaging of blood flow', 'An anti-reflection coating', 'A Faraday isolator', 'A neutral-density filter'], answer: 0, explanation: 'Moving blood cells blur the speckle, and the loss of contrast maps the flow.' }
    ]);
  };
})();
