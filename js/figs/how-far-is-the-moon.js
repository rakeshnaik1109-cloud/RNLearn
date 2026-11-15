/* ==========================================================================
   RNLearn — How We Measured the Universe, Part 3:
   How Far Is the Moon?
   Figures:
     1. fig-moon-timeline    The story at a glance (clickable timeline)
     2. fig-lunar-eclipse    Aristarchus: the Moon's size and distance from the Earth's shadow
     3. fig-moon-parallax    Two observers, one Moon: lunar parallax
     4. fig-laser-ranging    Timing laser pulses to the Moon and back
     5. fig-quiz-m3          Test yourself
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
    { name: 'Ancient geometry', color: '#b45309' },
    { name: 'Parallax and gravity', color: '#1d4ed8' },
    { name: 'Radar and lasers', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'c. 270 BC', icon: '🌘', era: 0, sec: 3, title: 'Aristarchus uses the Earth’s shadow', text: 'From the size of the Earth’s shadow during a lunar eclipse, Aristarchus works out that the Moon is roughly a third the width of the Earth.' },
    { year: '190 BC', icon: '🌑', era: 0, sec: 4, title: 'One eclipse, two views', text: 'A solar eclipse is total at the Hellespont but only four-fifths at Alexandria. Hipparchus later uses this difference to estimate the Moon’s distance.' },
    { year: 'c. 150', icon: '📜', era: 0, sec: 5, title: 'Ptolemy: 59 Earth radii', text: 'Ptolemy gives a mean distance close to the truth, but his model makes the Moon swing nearly twice as far at some times as at others.' },
    { year: '499', icon: '📐', era: 0, sec: 5, title: 'Aryabhata’s Moon', text: 'The Āryabhaṭīya gives the Moon’s diameter as 315 yojanas and the Earth’s as 1,050: a ratio of 0.30.' },
    { year: '1609', icon: '🥚', era: 1, sec: 7, title: 'Orbits are ellipses', text: 'Kepler shows that planets move in ellipses. The Moon’s orbit is an ellipse too, so its distance varies.' },
    { year: '1687', icon: '🍎', era: 1, sec: 7, title: 'Newton’s Moon test', text: 'Newton shows that gravity 3,600 times weaker than at the Earth’s surface, at 60 Earth radii, explains the Moon’s orbit.' },
    { year: '1752', icon: '🔭', era: 1, sec: 6, title: 'Berlin and the Cape', text: 'Lalande in Berlin and Lacaille at the Cape of Good Hope measure the Moon’s parallax from nearly 10,000 km apart.' },
    { year: '1946', icon: '📡', era: 2, sec: 8, title: 'Radar echoes from the Moon', text: 'Project Diana bounces radio waves off the Moon; the echo returns about 2.5 seconds later.' },
    { year: '1962', icon: '🔦', era: 2, sec: 9, title: 'Laser light reaches the Moon', text: 'Scientists at MIT detect laser light reflected from the bare surface of the Moon.' },
    { year: '1969', icon: '🪞', era: 2, sec: 9, title: 'Mirrors on the Moon', text: 'Apollo 11 astronauts leave a panel of reflectors; on 1 August, Lick Observatory detects the first laser returns.' },
    { year: '2006', icon: '⏱️', era: 2, sec: 10, title: 'Millimetre precision', text: 'The APOLLO project at Apache Point Observatory begins ranging to the Moon with millimetre-level precision.' },
    { year: '2010', icon: '🚙', era: 2, sec: 9, title: 'A lost reflector found', text: 'Lunokhod 1’s reflector, lost for nearly 40 years, is found again after a spacecraft photographs the rover.' }
  ];
  FIG['fig-moon-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from about 270 BC to 2010');
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
     Figure 2. Aristarchus's eclipse method
     ----------------------------------------------------------------------- */
  var EARTH_D = 12742, EARTH_R = 6371;
  FIG['fig-lunar-eclipse'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 2.67, ang = 0.52;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sn = FIG.slider(controls, { id: 'le-n', label: 'Width of the Earth’s shadow at the Moon (in Moon-widths)', min: 1.5, max: 4, step: 0.01, value: n, onChange: function (v) { n = v; draw(); } });
    var sa = FIG.slider(controls, { id: 'le-a', label: 'How wide the Moon looks in the sky', min: 0.3, max: 2.2, step: 0.01, value: ang, unit: '°', onChange: function (v) { ang = v; draw(); } });
    var row = group(controls, 'Try these values');
    var presets = [['Aristarchus’s book (2 widths, 2°)', 2, 2], ['Aristarchus with a ½° Moon', 2, 0.5], ['Modern values', 2.67, 0.52]];
    presets.forEach(function (p) {
      btn(p[0], row).addEventListener('click', function () { n = p[1]; ang = p[2]; sn.setValue(n); sa.setValue(ang); draw(); });
    });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620);
      svgWrap.innerHTML = '';
      var W = 620, H = 270, cy = 128;
      var svg = FIG.createSVG(svgWrap, W, H, 'The Earth’s shadow narrowing towards the Moon during a lunar eclipse');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: '#1e293b' }, svg);
      // sunlight from the left
      for (var k = -2; k <= 2; k++) el('line', { x1: 0, y1: cy + k * 26, x2: 60, y2: cy + k * 26, stroke: '#fbbf24', 'stroke-width': 1.5, opacity: 0.7 }, svg);
      txt(svg, 10, 22, 'sunlight →', { anchor: 'start', size: fs(11), fill: '#fbbf24' });
      var ex = 140, RE = 62, rm = RE / (n + 1), mx = 470;
      // shadow cone: half-width shrinks by one Moon radius between Earth and Moon
      var slope = rm / (mx - ex), apex = ex + RE / slope;
      var xEnd = Math.min(W, apex);
      var hEnd = RE - slope * (xEnd - ex);
      el('path', { d: 'M' + ex + ' ' + (cy - RE) + ' L' + xEnd + ' ' + (cy - hEnd) + ' L' + xEnd + ' ' + (cy + hEnd) + ' L' + ex + ' ' + (cy + RE) + ' Z', fill: '#000', opacity: 0.75, stroke: '#64748b', 'stroke-dasharray': '4 3' }, svg);
      el('circle', { cx: ex, cy: cy, r: RE, fill: '#2563eb', stroke: '#93c5fd', 'stroke-width': 1.5 }, svg);
      txt(svg, ex, cy + 4, 'Earth', { size: fs(12), weight: 700, fill: '#fff' });
      // shadow width at the Moon, marked in Moon-widths
      var hw = RE - rm; // = n * rm
      el('line', { x1: mx, y1: cy - hw, x2: mx, y2: cy + hw, stroke: '#f87171', 'stroke-width': 2 }, svg);
      for (var j = 0; j <= Math.floor(n); j++) {
        var yy = cy - hw + j * 2 * rm;
        el('line', { x1: mx - 6, y1: yy, x2: mx + 6, y2: yy, stroke: '#f87171', 'stroke-width': 2 }, svg);
      }
      // Moon inside the shadow, partly darkened, and ghost Moons stacked across the shadow
      for (var q = 0; q < Math.floor(n); q++) el('circle', { cx: mx + 40, cy: cy - hw + rm + q * 2 * rm, r: rm, fill: 'none', stroke: '#cbd5e1', 'stroke-dasharray': '3 3', opacity: 0.7 }, svg);
      el('circle', { cx: mx, cy: cy, r: rm, fill: '#7f1d1d', stroke: '#fca5a5', 'stroke-width': 1.2 }, svg);
      txt(svg, mx + 40, cy - hw - 8, 'Moon-widths', { size: fs(11), fill: '#cbd5e1' });
      txt(svg, mx, cy + hw + 22, 'shadow = ' + n.toFixed(2) + ' Moon-widths', { size: fs(11.5), weight: 700, fill: '#f87171' });
      // Earth-width bracket
      el('line', { x1: ex - RE - 14, y1: cy - RE, x2: ex - RE - 14, y2: cy + RE, stroke: '#93c5fd', 'stroke-width': 1.5 }, svg);
      txt(svg, 12, cy + RE + 24, 'Earth = shadow + 1 Moon-width', { anchor: 'start', size: fs(11.5), weight: 700, fill: '#93c5fd' });
      txt(svg, W - 10, H - 10, 'distance hugely squashed', { anchor: 'end', size: fs(10.5), fill: '#94a3b8' });
      var dm = EARTH_D / (n + 1), dist = dm / Math.tan(ang * Math.PI / 180), rr = dist / EARTH_R;
      var widths = 1 / Math.tan(ang * Math.PI / 180);
      var verdict = Math.abs(rr - 60.3) / 60.3 < 0.05 ? '<span style="color:var(--callout-tip);font-weight:600;">Close to the modern 60.3 Earth radii.</span>'
        : (rr < 60.3 ? 'Too close: the modern value is 60.3 Earth radii.' : 'Too far: the modern value is 60.3 Earth radii.');
      read.innerHTML = '<strong>Step 1.</strong> Earth = ' + n.toFixed(2) + ' + 1 = ' + (n + 1).toFixed(2) + ' Moon-widths, so the Moon is <strong>' + (1 / (n + 1)).toFixed(2) + '</strong> of the Earth’s width: about <strong>' + fmt(dm) + ' km</strong> across (true value 3,475 km).' +
        '<br><strong>Step 2.</strong> A Moon that looks ' + ang.toFixed(2) + '° wide is ' + fmt(widths) + ' Moon-widths away: ' + fmt(widths) + ' × ' + fmt(dm) + ' km ≈ <strong style="color:var(--ink);">' + fmt(dist) + ' km</strong>, or <strong>' + rr.toFixed(1) + ' Earth radii</strong>. ' + verdict +
        '<br><span style="font-size:0.85rem;color:var(--ink-muted);">The shadow narrows by one Moon-width on the way because the Sun and Moon look the same size in the sky. This simple version treats the Sun as very far away, as Aristarchus’s method effectively does.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Lunar parallax from two observers
     ----------------------------------------------------------------------- */
  var PAIRS = [
    ['Berlin and the Cape (1752)', 'Berlin', 52.5, 'Cape', -33.9],
    ['Hellespont and Alexandria', 'Hellespont', 40.2, 'Alexandria', 31.2],
    ['Delhi and Chennai', 'Delhi', 28.6, 'Chennai', 13.1],
    ['North Pole and South Pole', 'N Pole', 90, 'S Pole', -90]
  ];
  FIG['fig-moon-parallax'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var pair = 0, D = 60.3;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Observers');
    var pbs = PAIRS.map(function (p, i) { var b = btn(p[0], row); b.addEventListener('click', function () { pair = i; draw(); }); return b; });
    FIG.slider(controls, { id: 'mp-d', label: 'Distance to the Moon (Earth radii)', min: 20, max: 100, step: 0.1, value: D, onChange: function (v) { D = v; draw(); } });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620), p = PAIRS[pair];
      pbs.forEach(function (b, i) { b.classList.toggle('active', i === pair); });
      // true parallax: angle at the Moon between the two observers (Moon on the equator, same meridian)
      var r1 = p[2] * Math.PI / 180, r2 = p[4] * Math.PI / 180;
      var v1 = [Math.cos(r1) - D, Math.sin(r1)], v2 = [Math.cos(r2) - D, Math.sin(r2)];
      var a1 = Math.atan2(v1[1], -v1[0]), a2 = Math.atan2(v2[1], -v2[0]);
      var par = Math.abs(a1 - a2) * 180 / Math.PI, arcmin = par * 60;
      svgWrap.innerHTML = '';
      var W = 620, H = 270, cy = 135, ex = 100, R = 62;
      var svg = FIG.createSVG(svgWrap, W, H, 'Two observers on the Earth see the Moon against different background stars');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: '#0f172a' }, svg);
      // star field at the right
      var stars = [[575, 30], [600, 62], [588, 98], [606, 132], [580, 160], [598, 196], [584, 232], [560, 80], [565, 210], [610, 250], [568, 120]];
      stars.forEach(function (s) { el('circle', { cx: s[0], cy: s[1], r: 1.6, fill: '#e2e8f0' }, svg); });
      txt(svg, W - 8, 16, 'distant stars', { anchor: 'end', size: fs(10.5), fill: '#94a3b8' });
      el('circle', { cx: ex, cy: cy, r: R, fill: '#2563eb', stroke: '#93c5fd', 'stroke-width': 1.5 }, svg);
      el('line', { x1: ex - R, y1: cy, x2: ex + R, y2: cy, stroke: '#93c5fd', 'stroke-dasharray': '3 3', opacity: 0.6 }, svg);
      // Moon position in the drawing: squashed scale
      var mx = ex + R + 40 + (D - 20) / 80 * 300, mr = 11;
      var o1 = [ex + R * Math.cos(r1), cy - R * Math.sin(r1)], o2 = [ex + R * Math.cos(r2), cy - R * Math.sin(r2)];
      var cols = ['#fbbf24', '#34d399'];
      [o1, o2].forEach(function (o, i) {
        var dx = mx - o[0], dy = cy - o[1], t = (W - 12 - o[0]) / dx;
        var hx = o[0] + dx * t, hy = o[1] + dy * t;
        el('line', { x1: o[0], y1: o[1], x2: hx, y2: hy, stroke: cols[i], 'stroke-width': 1.6, opacity: 0.9 }, svg);
        el('circle', { cx: hx, cy: hy, r: 5, fill: 'none', stroke: cols[i], 'stroke-width': 2 }, svg);
        el('circle', { cx: o[0], cy: o[1], r: 5, fill: cols[i], stroke: '#0f172a' }, svg);
        var lbl = i === 0 ? p[1] : p[3], up = o[1] < cy || (o[1] === cy && i === 0);
        txt(svg, o[0] + 6, o[1] + (up ? -10 : 20), lbl, { anchor: 'start', size: fs(11.5), weight: 700, fill: cols[i] });
      });
      el('circle', { cx: mx, cy: cy, r: mr, fill: '#e5e7eb', stroke: '#94a3b8' }, svg);
      txt(svg, mx, cy + mr + 16, 'Moon', { size: fs(11.5), weight: 700, fill: '#e5e7eb' });
      txt(svg, 10, H - 10, 'not to scale: the angles are exaggerated', { anchor: 'start', size: fs(10.5), fill: '#94a3b8' });
      var km = D * EARTH_R;
      read.innerHTML = 'The two observers see the Moon shifted against the stars by <strong style="color:var(--ink);">' + par.toFixed(2) + '°</strong> (' + fmt(arcmin) + ' minutes of arc), about <strong>' + (par / 0.52).toFixed(1) + ' Moon-widths</strong>.' +
        '<br>Moon distance: <strong>' + D.toFixed(1) + ' Earth radii</strong> = ' + fmt(km) + ' km. ' +
        (pair === 0 ? 'At the real distance, Berlin and the Cape see a shift of about 1.3°; Lalande and Lacaille used shifts like this to find the Moon’s parallax of about 57′ (by convention, the shift between the Earth’s centre and a point on its equator).' :
          pair === 2 ? 'Delhi and Chennai are only about 15° of latitude apart, so the shift is much smaller and harder to measure.' :
          pair === 1 ? 'These are the two places in Hipparchus’s eclipse: about 9° of latitude apart.' : 'The widest possible north–south baseline: the whole diameter of the Earth.') +
        '<br><span style="font-size:0.85rem;color:var(--ink-muted);">Move the Moon further away and the shift shrinks: the parallax angle is roughly the baseline divided by the distance.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Lunar laser ranging
     ----------------------------------------------------------------------- */
  var CKM = 299792.458;
  var ORBIT = [['Perigee (closest)', 363300], ['Average', 384400], ['Apogee (furthest)', 405500]];
  function poisson(mean) { var L = Math.exp(-mean), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  FIG['fig-laser-ranging'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var oi = 1, dist = ORBIT[1][1], t0 = null, phase = 0;
    var hits = [], pulses = 0, BINS = 40, WIN = 2; // residuals in ns, window ±2 ns
    var SIG = 0.2, MEAN = 0.5, NOISE = 0.08; // per-photon spread (ns), photons per pulse, noise per pulse in the window
    var offset = (Math.random() - 0.5) * 0.4; // the unknown small offset of the true distance from the prediction, ns
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Where is the Moon in its orbit?');
    var obs = ORBIT.map(function (o, i) { var b = btn(o[0], row); b.addEventListener('click', function () { oi = i; dist = o[1]; t0 = null; reset(); drawTrip(0); }); return b; });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var tripRead = div('', container); tripRead.style.cssText = 'margin-top:0.35rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    var c2 = div('fig-controls', container); c2.style.marginTop = '0.9rem';
    var row2 = group(c2, 'Fire the laser');
    btn('Fire 100 pulses', row2).addEventListener('click', function () { fire(100); });
    btn('Fire 2,000 pulses', row2).addEventListener('click', function () { fire(2000); });
    btn('Start again', row2).addEventListener('click', function () { reset(); drawHist(); });
    var histWrap = div('', container); histWrap.style.marginTop = '0.5rem';
    var histRead = div('', container); histRead.style.cssText = 'margin-top:0.35rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function reset() { hits = []; pulses = 0; offset = (Math.random() - 0.5) * 0.4; drawHist(); }
    function fire(np) {
      for (var i = 0; i < np; i++) {
        var ns = poisson(MEAN);
        for (var j = 0; j < ns; j++) hits.push({ t: offset + SIG * gauss(), sig: true });
        var nn = poisson(NOISE);
        for (var k = 0; k < nn; k++) hits.push({ t: (Math.random() * 2 - 1) * WIN, sig: false });
      }
      pulses += np;
      drawHist();
    }
    function drawTrip(frac) {
      var c = C(), fs = scaler(svgWrap, 620), rt = 2 * dist / CKM;
      obs.forEach(function (b, i) { b.classList.toggle('active', i === oi); });
      svgWrap.innerHTML = '';
      var W = 620, H = 130, cy = 62;
      var svg = FIG.createSVG(svgWrap, W, H, 'A laser pulse travelling from the Earth to the Moon and back');
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: '#0f172a' }, svg);
      var ex = 52, mx = 470 + (dist - 363300) / (405500 - 363300) * 100;
      el('circle', { cx: ex, cy: cy, r: 38, fill: '#2563eb', stroke: '#93c5fd' }, svg);
      txt(svg, ex, cy + 4, 'Earth', { size: fs(11), weight: 700, fill: '#fff' });
      el('circle', { cx: mx, cy: cy, r: 12, fill: '#e5e7eb', stroke: '#94a3b8' }, svg);
      txt(svg, mx, cy + 30, 'Moon', { size: fs(11), weight: 700, fill: '#e5e7eb' });
      el('line', { x1: ex + 38, y1: cy, x2: mx - 12, y2: cy, stroke: '#334155', 'stroke-dasharray': '3 4' }, svg);
      var x = frac < 0.5 ? ex + 38 + (mx - 12 - ex - 38) * frac * 2 : mx - 12 - (mx - 12 - ex - 38) * (frac - 0.5) * 2;
      el('circle', { cx: x, cy: cy, r: 5, fill: '#22c55e' }, svg);
      el('line', { x1: x + (frac < 0.5 ? -26 : 26), y1: cy, x2: x, y2: cy, stroke: '#22c55e', 'stroke-width': 2, opacity: 0.6 }, svg);
      txt(svg, W / 2, 20, (frac < 0.5 ? 'going out…' : 'coming back…') + ' ' + (frac * rt).toFixed(2) + ' s', { size: fs(12), weight: 700, fill: '#86efac' });
      txt(svg, W - 10, H - 10, 'sizes not to scale; timing is real', { anchor: 'end', size: fs(10.5), fill: '#94a3b8' });
      tripRead.innerHTML = 'Distance: <strong>' + fmt(dist) + ' km</strong>. Round trip at the speed of light: 2 × ' + fmt(dist) + ' ÷ ' + fmt(CKM, 0) + ' km/s = <strong style="color:var(--ink);">' + rt.toFixed(3) + ' seconds</strong>.' +
        '<br><span style="font-size:0.85rem;color:var(--ink-muted);">The pulse in the drawing moves at the real speed: watch how long the round trip takes.</span>';
    }
    function drawHist() {
      var c = C(), fs = scaler(histWrap, 620);
      histWrap.innerHTML = '';
      var W = 620, H = 210, L = 46, Rm = 14, T = 16, B = 40;
      var svg = FIG.createSVG(histWrap, W, H, 'Histogram of photon return times');
      var counts = []; for (var i = 0; i < BINS; i++) counts.push(0);
      hits.forEach(function (h) { var b = Math.floor((h.t + WIN) / (2 * WIN) * BINS); if (b >= 0 && b < BINS) counts[b]++; });
      var mxc = Math.max(5, Math.max.apply(null, counts));
      if (!hits.length) txt(svg, (L + W - Rm) / 2, (T + H - B) / 2, 'Fire some pulses to see the returning photons', { size: fs(12), fill: c.faint });
      var bw = (W - L - Rm) / BINS;
      el('line', { x1: L, y1: H - B, x2: W - Rm, y2: H - B, stroke: c.ink2 }, svg);
      counts.forEach(function (n, i) {
        var h = n / mxc * (H - T - B);
        if (n) el('rect', { x: L + i * bw + 1, y: H - B - h, width: bw - 2, height: h, fill: c.accent, opacity: 0.85 }, svg);
      });
      [-2, -1, 0, 1, 2].forEach(function (v) { var x = L + (v + WIN) / (2 * WIN) * (W - L - Rm); el('line', { x1: x, y1: H - B, x2: x, y2: H - B + 5, stroke: c.ink2 }, svg); txt(svg, x, H - B + 17, (v > 0 ? '+' : '') + v + ' ns', { size: fs(10.5), fill: c.muted }); });
      txt(svg, (L + W - Rm) / 2, H - 5, 'photon arrival time, compared with the predicted time (1 ns = 15 cm of distance)', { size: fs(10.5), fill: c.muted });
      var t = txt(svg, 14, (T + H - B) / 2, 'photons', { size: fs(11), fill: c.muted }); t.setAttribute('transform', 'rotate(-90 14 ' + (T + H - B) / 2 + ')');
      // estimate: average of photons near the peak
      var near = [], peak = 0, best = -1;
      counts.forEach(function (n, i) { if (n > best) { best = n; peak = i; } });
      var pc = -WIN + (peak + 0.5) * 2 * WIN / BINS;
      hits.forEach(function (h) { if (Math.abs(h.t - pc) < 0.6) near.push(h.t); });
      var sig = hits.filter(function (h) { return h.sig; }).length;
      if (!pulses) { histRead.innerHTML = 'Fire some pulses. Each pulse sends out about 10<sup>17</sup> photons; on a good night, about one comes back to be detected, and stray photons from moonlight sneak in too.'; return; }
      var html = '<strong>' + fmt(pulses) + '</strong> pulses fired, <strong>' + fmt(hits.length) + '</strong> photons detected (' + fmt(sig) + ' from the reflector, ' + fmt(hits.length - sig) + ' stray background photons scattered across the window).';
      if (near.length >= 5) {
        var m = near.reduce(function (a, b) { return a + b; }, 0) / near.length;
        var err = SIG / Math.sqrt(near.length) * 150; // ns round trip -> mm one way
        html += '<br>The reflector’s photons pile up in a sharp peak. Averaging the ' + fmt(near.length) + ' photons in it: the Moon is <strong style="color:var(--ink);">' + (m * 150 >= 0 ? '+' : '−') + fmt(Math.abs(m * 150)) + ' mm</strong> from the predicted distance, with an uncertainty of about <strong>±' + (err < 10 ? err.toFixed(1) : fmt(err)) + ' mm</strong>.' +
          (err > 5 ? ' Fire more pulses to shrink the uncertainty.' : ' That is millimetre precision over 384,000 km.');
      } else html += '<br>Not enough photons yet to see a clear peak. Keep firing.';
      histRead.innerHTML = html;
    }
    drawTrip(0); drawHist();
    var anim = FIG.animate(figEl, function (ts) {
      if (t0 === null) t0 = ts;
      var rt = 2 * dist / CKM, pause = 0.8, cyc = rt + pause;
      var e = ((ts - t0) / 1000) % cyc;
      drawTrip(Math.min(1, e / rt));
    });
    onTheme(function () { drawTrip(0); drawHist(); });
    window.addEventListener('resize', function () { drawHist(); });
    return anim;
  };

  /* -----------------------------------------------------------------------
     Figure 5. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did Aristarchus use to estimate the size of the Moon?', options: ['A telescope', 'The size of the Earth’s shadow on the Moon during a lunar eclipse', 'A radar echo', 'The tides'], answer: 1, explanation: 'He judged the shadow to be about two Moon-widths across at the Moon’s distance.' },
      { question: 'Why does the Earth’s shadow narrow by about one Moon-width on its way to the Moon?', options: ['Because the Moon is shiny', 'Because the shadow narrows at the rate set by the Sun’s apparent size, and the Sun and Moon look the same size', 'Because the air bends it', 'It does not narrow'], answer: 1, explanation: 'So the Earth’s width is the shadow’s width plus one Moon-width.' },
      { question: 'The Moon looks about half a degree wide. What does that tell you?', options: ['It is about 110 Moon-widths away', 'It is very small', 'It is closer than the Sun', 'Nothing'], answer: 0, explanation: 'An object half a degree wide is about 110 times further away than it is wide.' },
      { question: 'What was wrong with one of the numbers in Aristarchus’s book?', options: ['He thought the Earth was flat', 'He assumed the Moon looks 2° wide, four times too big', 'He used the wrong eclipse', 'He forgot the Sun'], answer: 1, explanation: 'With 2°, his geometry places the Moon only about 20 Earth radii away instead of about 60.' },
      { question: 'How did Hipparchus use a solar eclipse to measure the Moon’s distance?', options: ['By timing how long it lasted', 'By comparing places where it was total and only partial, and using the distance between them', 'By measuring the temperature drop', 'By looking at the stars'], answer: 1, explanation: 'The eclipse was total near the Hellespont but only four-fifths at Alexandria: a parallax effect.' },
      { question: 'What was the problem with Ptolemy’s model of the Moon?', options: ['It got the Moon’s position wrong', 'It made the Moon’s distance vary so much that it should sometimes look nearly twice as wide', 'It put the Moon beyond the Sun', 'It had no epicycles'], answer: 1, explanation: 'Its mean distance, 59 Earth radii, was good; its range was not.' },
      { question: 'Where did Lalande and Lacaille observe the Moon’s parallax in 1751–52?', options: ['London and Paris', 'Berlin and the Cape of Good Hope', 'Delhi and Chennai', 'Rome and Cairo'], answer: 1, explanation: 'Nearly the same longitude, about 86° of latitude apart.' },
      { question: 'What did Newton show using the Moon’s distance of about 60 Earth radii?', options: ['That the Moon is made of cheese', 'That gravity 3,600 times weaker than at the Earth’s surface explains the Moon’s orbit', 'That the Moon is hollow', 'That light has a speed'], answer: 1, explanation: '60 × 60 = 3,600, matching the inverse-square law.' },
      { question: 'How is the Moon’s distance measured today?', options: ['By parallax from two cities', 'By timing laser pulses reflected from mirrors left on the Moon', 'By the size of eclipses', 'By weighing the Moon'], answer: 1, explanation: 'Apollo 11, 14 and 15 and two Soviet Lunokhod rovers left reflectors; the precision is now a few millimetres.' },
      { question: 'What has lunar laser ranging revealed?', options: ['The Moon is getting closer', 'The Moon is moving away by about 3.8 cm a year', 'The Moon does not move at all', 'The Moon is shrinking fast'], answer: 1, explanation: 'Tides slowly transfer energy from the Earth’s spin to the Moon’s orbit.' }
    ]);
  };
})();
