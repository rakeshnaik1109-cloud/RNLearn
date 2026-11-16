/* ==========================================================================
   RNLearn — How Far Is the Sun? (How We Measured the Universe, Part 4)
   Figures:
     1. fig-sun-timeline   The story at a glance (clickable timeline)
     2. fig-half-moon      Aristarchus's triangle
     3. fig-venus-transit  Halley's method: timing a transit of Venus
     4. fig-radar-venus    Measuring the astronomical unit with radar
     5. fig-quiz-m4        Test yourself
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
    { name: 'Geometry and guesses', color: '#b45309' },
    { name: 'Parallax and transits', color: '#1d4ed8' },
    { name: 'Radar and definition', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'c. 270 BC', icon: '🌓', era: 0, sec: 3, title: 'Aristarchus and the half Moon', text: 'Aristarchus measures the angle between the half Moon and the Sun as 87° and concludes that the Sun is 18 to 20 times farther away than the Moon.' },
    { year: 'c. 150', icon: '📜', era: 0, sec: 4, title: 'Ptolemy: 1,210 Earth radii', text: 'Ptolemy’s <em>Almagest</em> puts the Sun about 1,210 Earth radii away, a figure that lasts for some 1,500 years.' },
    { year: '1619', icon: '🪐', era: 1, sec: 5, title: 'Kepler’s third law', text: 'Kepler links each planet’s period to its distance from the Sun. The map of the solar system now has the right shape, but no scale.' },
    { year: '1639', icon: '♀️', era: 1, sec: 7, title: 'The first transit of Venus seen', text: 'Jeremiah Horrocks and William Crabtree in England become the first people known to watch Venus cross the face of the Sun.' },
    { year: '1672', icon: '🔴', era: 1, sec: 6, title: 'Mars from Paris and Cayenne', text: 'Cassini in Paris and Richer in Cayenne measure Mars’s parallax, putting the Sun about 140 million km away.' },
    { year: '1716', icon: '📐', era: 1, sec: 7, title: 'Halley’s plan', text: 'Edmond Halley publishes his method of finding the Sun’s distance by timing transits of Venus from distant places.' },
    { year: '1761', icon: '🌍', era: 1, sec: 8, title: 'The first global campaign', text: 'Observers at dozens of stations, from Siberia to the Cape of Good Hope, time the transit of Venus.' },
    { year: '1769', icon: '⛵', era: 1, sec: 8, title: 'Cook at Tahiti', text: 'James Cook and Charles Green observe the transit from Tahiti; Maximilian Hell from Vardø in the Arctic; Le Gentil is clouded out at Pondicherry.' },
    { year: '1824', icon: '🧮', era: 1, sec: 8, title: 'Encke’s answer', text: 'Johann Encke combines the 1761 and 1769 observations: about 153 million km.' },
    { year: '1882', icon: '📷', era: 1, sec: 10, title: 'Transits photographed', text: 'Nations send expeditions with cameras to the transits of 1874 and 1882.' },
    { year: '1896', icon: '🤝', era: 1, sec: 10, title: 'An agreed value', text: 'A conference in Paris adopts a solar parallax of 8.80 seconds of arc, about 149.5 million km.' },
    { year: '1931', icon: '☄️', era: 1, sec: 10, title: 'The asteroid Eros', text: 'Observatories worldwide measure the parallax of Eros as it passes close to the Earth; the result is published in 1941.' },
    { year: '1961', icon: '📡', era: 2, sec: 11, title: 'Radar echoes from Venus', text: 'Radar pulses bounced off Venus fix the Sun’s distance to within about 500 km.' },
    { year: '2012', icon: '📏', era: 2, sec: 11, title: 'The AU is defined', text: 'The International Astronomical Union defines the astronomical unit as exactly 149,597,870,700 metres.' }
  ];
  FIG['fig-sun-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from about 270 BC to 2012');
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

  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  var SUN = '#f59e0b', MOONC = '#94a3b8', EARTH = '#2563eb', VENUS = '#d97706';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function bigKm(km) {
    if (km >= 1e6) return fmt(km / 1e6, km >= 1e8 ? 1 : 2) + ' million km';
    return fmt(km, 0) + ' km';
  }

  /* -----------------------------------------------------------------------
     Figure 2. Aristarchus and the half Moon
     ----------------------------------------------------------------------- */
  var MOON_KM = 384400, TRUE_AU = 149597870.7, SYNODIC = 29.53;
  FIG['fig-half-moon'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var th = 87;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'hm-angle', label: 'Angle between the half Moon and the Sun', min: 80, max: 89.95, step: 0.001, value: th, onChange: function (v) { th = v; draw(); } });
    var row = group(controls, 'Try');
    [['Aristarchus: 87°', 87], ['89°', 89], ['The true angle: 89.85°', 89.853]].forEach(function (p) {
      btn(p[0], row).addEventListener('click', function () { th = p[1]; sl.setValue(th); draw(); });
    });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C();
      valText(sl, fmt(th, th % 1 && Math.round(th * 100) !== th * 100 ? 3 : 2) + '°');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 230, fs = scaler(svgWrap, 520);
      var svg = FIG.createSVG(svgWrap, W, H, 'Triangle of Earth, half Moon and Sun');
      var ex = 34, ey = H - 40, t = Math.tan(th * Math.PI / 180), avail = W - ex - 60;
      var h = 120, full = h * t, off = full > avail, sx = ex + (off ? avail : full);
      var my = ey - h;
      el('line', { x1: ex, y1: ey, x2: ex, y2: my, stroke: c.muted, 'stroke-width': 1.5 }, svg);
      el('line', { x1: ex, y1: my, x2: sx, y2: my, stroke: c.muted, 'stroke-width': 1.5 }, svg);
      el('line', { x1: ex, y1: ey, x2: sx, y2: my, stroke: SUN, 'stroke-width': 2 }, svg);
      if (off) {
        // a break mark: the Sun is really much farther away than drawn
        var bx = ex + avail * 0.72;
        [-1, 1].forEach(function (k) { el('line', { x1: bx + k * 5 - 4, y1: my - 7, x2: bx + k * 5 + 4, y2: my + 7, stroke: c.ink2, 'stroke-width': 1.5 }, svg); });
      }
      // right-angle mark at the Moon
      el('path', { d: 'M' + (ex + 8) + ' ' + my + ' L' + (ex + 8) + ' ' + (my + 8) + ' L' + ex + ' ' + (my + 8), fill: 'none', stroke: c.muted }, svg);
      // angle arc at the Earth
      var r = 26, a1 = -Math.PI / 2, a2 = -Math.PI / 2 + Math.atan2(sx - ex, h);
      el('path', { d: 'M' + (ex + r * Math.cos(a1)) + ' ' + (ey + r * Math.sin(a1)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (ex + r * Math.cos(a2)) + ' ' + (ey + r * Math.sin(a2)), fill: 'none', stroke: c.warn, 'stroke-width': 2 }, svg);
      txt(svg, ex + 30, ey - 26, fmt(th, 2) + '°', { anchor: 'start', size: fs(12), weight: 700, fill: c.warn });
      el('circle', { cx: ex, cy: ey, r: 9, fill: EARTH }, svg);
      txt(svg, ex, ey + 24, 'Earth', { size: fs(11), fill: c.ink2 });
      el('circle', { cx: ex, cy: my, r: 6, fill: '#1f2937', stroke: MOONC }, svg);
      el('path', { d: 'M' + ex + ' ' + (my - 6) + ' A6 6 0 0 1 ' + ex + ' ' + (my + 6) + ' Z', fill: '#e5e7eb' }, svg);
      txt(svg, ex + 10, my - 9, 'half Moon', { anchor: 'start', size: fs(11), fill: c.ink2 });
      el('circle', { cx: sx, cy: my, r: 16, fill: SUN }, svg);
      if (W < 560) txt(svg, sx, my - 24, 'Sun', { size: fs(11), fill: c.ink2 });
      else txt(svg, sx + (off ? 16 : 0), my - 24, off ? 'Sun (much farther than drawn)' : 'Sun', { anchor: off ? 'end' : 'middle', size: fs(11), fill: c.ink2 });
      txt(svg, W - 8, H - 8, 'Not to scale.', { anchor: 'end', size: fs(9.5), fill: c.faint });
      var ratio = 1 / Math.cos(th * Math.PI / 180), dist = ratio * MOON_KM;
      var dt = 2 * (90 - th) / 360 * SYNODIC * 24; // hours
      read.innerHTML = 'The Sun is <strong>' + fmt(ratio, ratio < 100 ? 1 : 0) + '</strong> times farther away than the Moon: <strong>' + bigKm(dist) + '</strong> (using today’s Moon distance). True value: ' + bigKm(TRUE_AU) + '.<br>' +
        'From new Moon to half Moon would take <strong>' + (dt >= 1 ? fmt(dt, 1) + ' hours' : fmt(dt * 60, 0) + ' minutes') + '</strong> less than from half Moon to full Moon.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Near 90° a tiny change in the angle makes an enormous change in the distance: from 89.8° to 89.9° the answer doubles. Aristarchus’s method was right; the measurement was impossible with his instruments.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Timing a transit of Venus
     ----------------------------------------------------------------------- */
  var SUN_ARCSEC = 960, VREL = 240, KV = 1 / 0.277 - 1, B0 = 0.6;
  FIG['fig-venus-transit'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var base = 9000, au = 149.6, blur = 30;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'vt-base', label: 'North–south distance between the two observers', min: 1000, max: 12000, step: 100, value: base, onChange: function (v) { base = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'vt-au', label: 'Suppose the Sun is this far away', min: 5, max: 300, step: 0.1, value: au, onChange: function (v) { au = v; draw(); } });
    var s3 = FIG.slider(controls, { id: 'vt-blur', label: 'Timing error at each contact (black drop)', min: 0, max: 90, step: 5, value: blur, onChange: function (v) { blur = v; draw(); } });
    var row = group(controls, 'Try');
    [['Ptolemy’s Sun', 7.7], ['Cassini’s Sun', 140], ['True distance', 149.6]].forEach(function (p) {
      btn(p[0], row).addEventListener('click', function () { au = p[1]; s2.setValue(au); draw(); });
    });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function dur(b) { return b >= 1 ? 0 : 2 * SUN_ARCSEC * Math.sqrt(1 - b * b) / VREL; } // hours
    function fmtHM(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + ' h ' + (m % 60 < 10 ? '0' : '') + (m % 60) + ' min'; }
    function draw() {
      var c = C();
      valText(s1, fmt(base, 0) + ' km');
      valText(s2, au < 20.05 && au > 7 ? fmt(au, 1) + ' million km' : fmt(au, 1) + ' million km');
      valText(s3, '± ' + blur + ' s');
      var shift = 206265 * KV * base / (au * 1e6); // arcsec between the two chords
      var bN = B0 - shift / SUN_ARCSEC / 2, bS = B0 + shift / SUN_ARCSEC / 2;
      var tN = dur(bN), tS = dur(bS), dT = (tN - tS) * 60; // minutes
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = Math.min(340, Math.max(250, W * 0.5)) + (W < 560 ? 40 : 0), fs = scaler(svgWrap, 520);
      var svg = FIG.createSVG(svgWrap, W, H, 'Venus crossing the Sun as seen by two observers');
      var R = Math.min(H / 2 - 18 - (W < 560 ? 20 : 0), W / 2 - 20), cx = W / 2, cy = H / 2 - (W < 560 ? 20 : 0);
      var grad = el('radialGradient', { id: 'vt-limb' }, el('defs', {}, svg));
      el('stop', { offset: '0%', 'stop-color': '#fde68a' }, grad);
      el('stop', { offset: '80%', 'stop-color': '#fbbf24' }, grad);
      el('stop', { offset: '100%', 'stop-color': '#d97706' }, grad);
      el('circle', { cx: cx, cy: cy, r: R, fill: 'url(#vt-limb)' }, svg);
      [[bN, EARTH, 'northern observer', tN], [bS, '#be123c', 'southern observer', tS]].forEach(function (s, k) {
        if (s[0] >= 1) return;
        var y = cy + s[0] * R, half = R * Math.sqrt(1 - s[0] * s[0]);
        // the path is tilted slightly, as in a real transit
        el('line', { x1: cx - half, y1: y, x2: cx + half, y2: y, stroke: s[1], 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg);
        el('circle', { cx: cx - half * 0.35, cy: y, r: Math.max(3, R * 0.031), fill: '#111827' }, svg);
        if (k === 0) txt(svg, cx - half - 6, y + 4, s[2], { anchor: 'end', size: fs(10.5), fill: s[1], weight: 600 });
        else txt(svg, cx + half + 6, y + 4, s[2], { anchor: 'start', size: fs(10.5), fill: s[1], weight: 600 });
      });
      if (W < 560) {
        // labels may run off the side on narrow screens: put them below instead
        Array.prototype.slice.call(svg.querySelectorAll('text')).forEach(function (t) { t.parentNode.removeChild(t); });
        txt(svg, 8, H - 22, 'Blue: northern observer', { anchor: 'start', size: fs(10.5), fill: EARTH });
        txt(svg, 8, H - 5, 'Red: southern observer', { anchor: 'start', size: fs(10.5), fill: '#be123c' });
      }
      var err = Math.SQRT2 * 2 * blur / 60 / Math.max(0.01, Math.abs(dT)); // fractional error in the distance
      var bad = bN < 0 || bS >= 1;
      read.innerHTML = 'The two observers see Venus’s path shifted by <strong>' + fmt(shift, 1) + ' seconds of arc</strong> (the Sun is about 1,920 seconds of arc across).<br>' +
        'Transit lasts <strong>' + (tN ? fmtHM(tN) : 'no transit') + '</strong> in the north and <strong>' + (tS ? fmtHM(tS) : 'no transit') + '</strong> in the south: a difference of <strong>' + fmt(Math.abs(dT), 1) + ' minutes</strong>.<br>' +
        (bad ? 'With the Sun this close, the shift is so large that one observer would miss the transit altogether. ' :
          'Working backwards from that difference gives the Sun’s distance. A ±' + blur + '-second error at each contact makes it uncertain by about <strong>±' + fmt(Math.min(99, err * 100), 0) + '%</strong>' + (blur ? '; averaging many observers reduces this.' : '.')) +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The farther away the Sun, the closer together the two paths and the smaller the time difference. Simplified geometry: illustrative path position and speed, Venus 0.277 AU from Earth.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Radar echoes from Venus
     ----------------------------------------------------------------------- */
  var C_KMS = 299792.458, PE = 365.25, PV = 224.7;
  FIG['fig-radar-venus'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var day = 0, pulse = null;
    var aV = Math.pow(PV / PE, 2 / 3);
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'rv-day', label: 'Days after Venus’s closest approach', min: 0, max: 292, step: 1, value: day, onChange: function (v) { day = v; pulse = null; draw(); } });
    var row = group(controls, 'Actions');
    btn('Send a radar pulse', row).addEventListener('click', function () { pulse = { t0: performance.now() }; });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function pos() {
      var ae = 2 * Math.PI * day / PE, av = 2 * Math.PI * day / PV;
      return { ex: Math.cos(ae), ey: Math.sin(ae), vx: aV * Math.cos(av), vy: aV * Math.sin(av) };
    }
    function draw(frac) {
      var c = C(), p = pos(), d = Math.hypot(p.ex - p.vx, p.ey - p.vy), delay = 2 * d * TRUE_AU / C_KMS;
      valText(sl, day + ' days');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = Math.min(320, Math.max(240, W * 0.55)), fs = scaler(svgWrap, 520);
      var svg = FIG.createSVG(svgWrap, W, H, 'Orbits of Earth and Venus with a radar pulse');
      var narrow = W < 560, cx = narrow ? W / 2 : W * 0.32, cy = H / 2, R = Math.min(H / 2 - 16, (narrow ? W / 2 : W * 0.32) - 12);
      el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: c.border, 'stroke-dasharray': '3 4' }, svg);
      el('circle', { cx: cx, cy: cy, r: R * aV, fill: 'none', stroke: c.border, 'stroke-dasharray': '3 4' }, svg);
      el('circle', { cx: cx, cy: cy, r: 11, fill: SUN }, svg);
      var EX = cx + R * p.ex, EY = cy - R * p.ey, VX = cx + R * p.vx, VY = cy - R * p.vy;
      el('line', { x1: EX, y1: EY, x2: VX, y2: VY, stroke: c.faint, 'stroke-width': 1 }, svg);
      if (frac !== undefined) {
        var f = frac < 0.5 ? frac * 2 : 2 - frac * 2;
        el('circle', { cx: EX + (VX - EX) * f, cy: EY + (VY - EY) * f, r: 4, fill: '#16a34a' }, svg);
      }
      el('circle', { cx: EX, cy: EY, r: 7, fill: EARTH }, svg);
      el('circle', { cx: VX, cy: VY, r: 6, fill: VENUS }, svg);
      txt(svg, EX, EY + 22, 'Earth', { size: fs(10.5), fill: c.ink2 });
      txt(svg, VX, VY - 11, 'Venus', { size: fs(10.5), fill: c.ink2 });
      if (!narrow) {
        var x0 = W * 0.66, y = 34, lh = 22;
        [['Venus’s year (measured):', PV + ' days'], ['Kepler’s third law gives its orbit:', fmt(aV, 3) + ' AU'], ['Distance to Venus now:', fmt(d, 3) + ' AU'], ['Radar echo delay:', fmt(delay, 1) + ' s'], ['So 1 AU = c × delay ÷ (2 × ' + fmt(d, 3) + ')', '']].forEach(function (r, i) {
          txt(svg, x0, y + i * lh * 1.6, r[0], { anchor: 'start', size: fs(11), fill: c.muted });
          if (r[1]) txt(svg, x0, y + i * lh * 1.6 + 16, r[1], { anchor: 'start', size: fs(13), weight: 700, fill: c.ink });
        });
      }
      if (frac === undefined) {
        read.innerHTML = 'Venus is <strong>' + fmt(d, 3) + ' AU</strong> from Earth. A radar echo takes <strong>' + fmt(delay, 1) + ' seconds</strong> (' + fmt(delay / 60, 1) + ' minutes) to return.<br>' +
          '1 AU = 299,792 km/s × ' + fmt(delay, 1) + ' s ÷ (2 × ' + fmt(d, 3) + ') = <strong>' + fmt(C_KMS * delay / (2 * d), 0) + ' km</strong>.' +
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Kepler’s third law gives the shape of the solar system (Venus’s orbit is 0.723 times the size of Earth’s); one timed echo gives the scale. Circular orbits are assumed here; the real analysis uses the exact orbits.</span>';
      }
    }
    draw();
    FIG.animate(figEl, function (ts) {
      if (!pulse) return;
      var p = pos(), d = Math.hypot(p.ex - p.vx, p.ey - p.vy), real = 2 * d * TRUE_AU / C_KMS;
      var shown = 1500 + real * 6; // ms: sped up so a 5-minute echo takes a few seconds
      var frac = (performance.now() - pulse.t0) / shown;
      if (frac >= 1) { pulse = null; draw(); return; }
      draw(frac);
    });
    window.addEventListener('resize', function () { draw(); });
    onTheme(function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure 5. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why is the Sun’s distance so much harder to measure than the Moon’s?', options: ['The Sun is too bright to look at', 'Its parallax is tiny: about 9 seconds of arc, 400 times smaller than the Moon’s', 'The Sun moves too fast', 'Nobody tried before 1900'], answer: 1, explanation: 'From the Earth’s centre to its edge, the Sun shifts by about as much as a coin seen from 600 metres away.' },
      { question: 'Aristarchus measured the angle between the half Moon and the Sun as 87°. What is the true angle?', options: ['80°', '87°', 'About 89.85°', 'Exactly 90°'], answer: 2, explanation: 'So close to 90° that the half Moon had to be timed to within minutes, impossible with his instruments.' },
      { question: 'What did Kepler’s third law give astronomers?', options: ['The Sun’s distance in kilometres', 'The relative distances of all the planets, but no scale', 'The speed of light', 'The size of the Moon'], answer: 1, explanation: 'Measure any one distance in the solar system, and all the others follow.' },
      { question: 'Who measured the parallax of Mars from Paris and Cayenne in 1672?', options: ['Halley and Cook', 'Cassini and Richer', 'Kepler and Tycho', 'Newton and Hooke'], answer: 1, explanation: 'Their result, about 140 million km, was the first estimate in the right range.' },
      { question: 'What did Halley’s method of timing transits of Venus avoid needing?', options: ['A telescope', 'An exact knowledge of the observer’s longitude', 'Clear skies', 'A clock'], answer: 1, explanation: 'It compares how long the transit lasts at each place, so only good local timing is needed.' },
      { question: 'What was the “black drop”?', options: ['A sunspot', 'A blurred dark bridge between Venus and the Sun’s edge that made contact times uncertain', 'An eclipse of the Moon', 'Ink spilt on Cook’s logbook'], answer: 1, explanation: 'Caused mainly by telescope blurring and the darkening of the Sun towards its edge.' },
      { question: 'Which astronomer was clouded out at Pondicherry in 1769, after missing the 1761 transit at sea?', options: ['Le Gentil', 'Mason', 'Hell', 'Encke'], answer: 0, explanation: 'He returned to France after 11 years away to find he had been declared dead.' },
      { question: 'About how long does a radar echo from Venus at its closest take to return?', options: ['2.5 seconds', 'About 4.6 minutes', 'About 8 hours', 'About 1 day'], answer: 1, explanation: 'Venus is then about 41 million km away, so the round trip is about 83 million km.' },
      { question: 'In 2012 the astronomical unit was…', options: ['Measured again by radar', 'Defined as exactly 149,597,870,700 metres', 'Abolished', 'Set equal to one light-year'], answer: 1, explanation: 'Measurement is now so good that the unit was fixed by definition.' },
      { question: 'Roughly how far away is the Sun?', options: ['15 million km', '150 million km', '1.5 billion km', '15 billion km'], answer: 1, explanation: 'About 149.6 million km, a distance light covers in about 8 minutes 19 seconds.' }
    ]);
  };
})();
