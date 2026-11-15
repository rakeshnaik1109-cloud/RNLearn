/* ==========================================================================
   RNLearn — How We Measured the Universe, Part 1: How Big Is the Earth?
   Figures:
     1. fig-earth-timeline   The story at a glance (clickable timeline)
     2. fig-eratosthenes     Shadows in two cities: round Earth or flat Earth?
     3. fig-biruni           Al-Biruni's mountain method
     4. fig-triangulation    A chain of triangles, and how errors add up
     5. fig-quiz-m1          Test yourself
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
  function rng(seed) {
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }
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
    { name: 'Ancient Greece', color: '#b45309' },
    { name: 'Islamic world', color: '#0f766e' },
    { name: 'Early modern Europe', color: '#1d4ed8' },
    { name: 'Today', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'c. 350 BC', icon: '🌑', era: 0, sec: 3, title: 'Aristotle: the Earth is round', text: 'Aristotle gives evidence that the Earth is a sphere, and reports that mathematicians put its circumference at 400,000 stadia.' },
    { year: 'c. 240 BC', icon: '📏', era: 0, sec: 4, title: 'Eratosthenes and the shadows', text: 'Eratosthenes compares the noon Sun at Syene and Alexandria and finds a circumference of about 250,000 stadia.' },
    { year: 'c. 100 BC', icon: '⭐', era: 0, sec: 5, title: 'Posidonius and the star Canopus', text: 'Posidonius uses the height of a star instead of the Sun’s shadow.' },
    { year: 'c. 830', icon: '🐪', era: 1, sec: 5, title: 'The caliph’s survey', text: 'Astronomers working for the caliph al-Ma’mun measure the length of one degree on a desert plain in Mesopotamia.' },
    { year: 'c. 1020s', icon: '⛰️', era: 1, sec: 6, title: 'Al-Biruni’s mountain', text: 'Al-Biruni measures the Earth from a single mountaintop in what is now Pakistan.' },
    { year: '1525', icon: '🎡', era: 2, sec: 7, title: 'Counting wheel turns', text: 'Jean Fernel measures the distance from Paris to Amiens by counting the turns of a carriage wheel.' },
    { year: '1617', icon: '📐', era: 2, sec: 8, title: 'Snell’s triangles', text: 'Willebrord Snell uses a chain of triangles across the Netherlands to measure a degree.' },
    { year: '1670', icon: '🔭', era: 2, sec: 9, title: 'Picard’s telescope sights', text: 'Jean Picard adds telescopes with crosshairs to surveying instruments and gets a value within about 0.1 per cent.' },
    { year: '1735', icon: '🧭', era: 2, sec: 10, title: 'Is the Earth squashed?', text: 'French expeditions set out for Lapland and Peru to settle the Earth’s shape (Part 2).' },
    { year: 'Today', icon: '🛰️', era: 3, sec: 10, title: 'Measured from space', text: 'Satellites and GPS measure the Earth’s size and shape to within centimetres.' }
  ];
  FIG['fig-earth-timeline'] = function (figEl) {
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
    var selected = 1;
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of measurements of the Earth from about 350 BC to today');
      for (var r = 0; r < rows; r++) {
        var ly = r * rowH + 62, list = EVENTS.slice(r * per, (r + 1) * per);
        if (!list.length) continue;
        var step = list.length > 1 ? (W - 2 * pad) / (list.length - 1) : 0;
        el('line', { x1: pad - 22, y1: ly, x2: W - pad + 22, y2: ly, stroke: c.border, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
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
     Figure 2. Eratosthenes: round Earth with a distant Sun, or flat Earth with a near one?
     ----------------------------------------------------------------------- */
  FIG['fig-eratosthenes'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fs = function (n) { return n; };
    var ang = 7.2, dist = 800, model = 'round';
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'er-a', label: 'Shadow angle at Alexandria', min: 1, max: 20, step: 0.1, value: ang, unit: '°', onChange: function (v) { ang = v; draw(); } });
    FIG.slider(controls, { id: 'er-d', label: 'Distance from Syene to Alexandria', min: 200, max: 2000, step: 10, value: dist, unit: 'km', onChange: function (v) { dist = v; draw(); } });
    var row = group(controls, 'Explain the shadows with');
    var rB = btn('A round Earth, distant Sun', row), fB = btn('A flat Earth, nearby Sun', row);
    rB.addEventListener('click', function () { model = 'round'; draw(); });
    fB.addEventListener('click', function () { model = 'flat'; draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--ink-secondary);line-height:1.55;';
    function stick(svg, x, y, rot, shadow, c, label) {
      var g = el('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + rot + ')' }, svg);
      if (shadow > 0.5) el('line', { x1: 0, y1: 0, x2: shadow, y2: 0, stroke: c.ink2, 'stroke-width': 4, opacity: 0.45, 'stroke-linecap': 'round' }, g);
      el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: c.warn, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      var t = txt(svg, 0, 0, label, { size: fs(12.5), weight: 700, fill: c.ink });
      return t;
    }
    function draw() {
      var c = C(), W = 620, H = 330;
      rB.classList.toggle('active', model === 'round'); fB.classList.toggle('active', model === 'flat');
      svgWrap.innerHTML = '';
      var kf = Math.min(1.8, Math.max(1, 620 / (svgWrap.clientWidth || 620)));
      fs = function (n) { return Math.round(n * kf * 10) / 10; };
      var svg = FIG.createSVG(svgWrap, W, H, model === 'round' ? 'Parallel sunlight on a round Earth' : 'Light from a nearby Sun on a flat Earth');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: c.sunken }, svg);
      var a = ang * Math.PI / 180;
      if (model === 'round') {
        var cx = 230, cy = 318, R = 212, angDraw = Math.min(ang * 2.2, 40) * Math.PI / 180; // angle exaggerated for visibility
        for (var i = 0; i < 9; i++) el('line', { x1: 40 + i * 70, y1: 0, x2: 40 + i * 70, y2: 70, stroke: '#facc15', 'stroke-width': 2, opacity: 0.8 }, svg);
        txt(svg, W - 12, 18, 'sunlight: parallel rays from far away', { anchor: 'end', size: fs(11.5), fill: c.muted });
        el('circle', { cx: cx, cy: cy, r: R, fill: '#c7d9c3', stroke: c.ink2, 'stroke-width': 1.5 }, svg);
        var sx = cx, sy = cy - R, ax = cx + R * Math.sin(angDraw), ay = cy - R * Math.cos(angDraw);
        el('line', { x1: cx, y1: cy, x2: sx, y2: sy - 40, stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
        el('line', { x1: cx, y1: cy, x2: ax + (ax - cx) / R * 40, y2: ay + (ay - cy) / R * 40, stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
        el('path', { d: 'M' + cx + ' ' + (cy - 60) + ' A60 60 0 0 1 ' + (cx + 60 * Math.sin(angDraw)) + ' ' + (cy - 60 * Math.cos(angDraw)), fill: 'none', stroke: c.key, 'stroke-width': 2 }, svg);
        txt(svg, cx + 34 * Math.sin(angDraw / 2) + 12, cy - 70, ang.toFixed(1) + '°', { size: fs(12), weight: 700, fill: c.key, anchor: 'start' });
        el('circle', { cx: cx, cy: cy, r: 3, fill: c.ink2 }, svg);
        txt(svg, cx - 8, cy + 2, 'Earth’s centre', { size: fs(11), fill: c.muted, anchor: 'end' });
        var t1 = stick(svg, sx, sy, 0, 0, c, ''); t1.setAttribute('x', sx - 8); t1.setAttribute('y', sy + 22); t1.setAttribute('text-anchor', 'end'); t1.textContent = 'Syene: no shadow';
        var t2 = stick(svg, ax, ay, angDraw * 180 / Math.PI, 34 * Math.tan(angDraw), c, ''); t2.setAttribute('x', ax + 14); t2.setAttribute('y', ay + 26); t2.setAttribute('text-anchor', 'start'); t2.textContent = 'Alexandria: shadow at ' + ang.toFixed(1) + '°';
        el('path', { d: 'M' + sx + ' ' + sy + ' A' + R + ' ' + R + ' 0 0 1 ' + ax + ' ' + ay, fill: 'none', stroke: c.accent, 'stroke-width': 4 }, svg);
        txt(svg, (sx + ax) / 2 + 4, Math.min(sy, ay) - 44, fmt(dist) + ' km', { size: fs(12), weight: 700, fill: c.accent });
        var circ = 360 / ang * dist;
        read.innerHTML = 'The angle between the two cities, seen from the Earth’s centre, equals the shadow angle: ' + ang.toFixed(1) + '°, which is <strong>1/' + (360 / ang).toFixed(1).replace(/\.0$/, '') + '</strong> of a full circle. So the whole circumference is ' + (360 / ang).toFixed(1).replace(/\.0$/, '') + ' × ' + fmt(dist) + ' km = <strong>' + fmt(circ) + ' km</strong>' +
          (Math.abs(circ - 40008) / 40008 < 0.03 ? ' (the true value is about 40,000 km).' : ' (true value: about 40,000 km).') +
          '<br><span style="font-size:0.84rem;color:var(--ink-muted);">The angle in the drawing is exaggerated so it can be seen.</span>';
      } else {
        var y0 = 250, x1 = 120, x2 = x1 + 380, h = dist / Math.tan(a), sunY = 44;
        el('rect', { x: 0, y: y0, width: W, height: H - y0, fill: '#c7d9c3' }, svg);
        el('circle', { cx: x1, cy: sunY, r: 16, fill: '#facc15', stroke: c.warn, 'stroke-width': 2 }, svg);
        el('line', { x1: x1, y1: sunY + 16, x2: x1, y2: y0, stroke: '#facc15', 'stroke-width': 2 }, svg);
        var shLen = 34 * (x2 - x1) / (y0 - 34 - sunY);
        el('line', { x1: x1, y1: sunY, x2: x2 + shLen, y2: y0, stroke: '#facc15', 'stroke-width': 2 }, svg);
        stick(svg, x1, y0, 0, 0, c, '');
        stick(svg, x2, y0, 0, shLen, c, '');
        txt(svg, x1, y0 + 22, 'Syene: no shadow', { size: fs(12.5), weight: 700 });
        txt(svg, x2, y0 + 22, 'Alexandria: shadow at ' + ang.toFixed(1) + '°', { size: fs(12.5), weight: 700 });
        el('line', { x1: x1, y1: y0 + 34, x2: x2, y2: y0 + 34, stroke: c.accent, 'stroke-width': 3 }, svg);
        txt(svg, (x1 + x2) / 2, y0 + 30, fmt(dist) + ' km', { size: fs(12), weight: 700, fill: c.accent });
        txt(svg, x1 + 24, sunY + 5, 'a small Sun about ' + fmt(h) + ' km up', { size: fs(12), weight: 600, fill: c.warn, anchor: 'start' });
        txt(svg, W - 12, 18, 'drawing not to scale', { anchor: 'end', size: fs(11.5), fill: c.muted });
        read.innerHTML = 'The same two shadows also fit a <strong>flat Earth</strong>, if the Sun were small and only about <strong>' + fmt(h) + ' km</strong> overhead. Two shadows alone cannot tell the models apart. Eratosthenes assumed the Sun is very far away, so its rays arrive parallel, and other evidence (section 3) shows that the Earth is round.';
      }
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Al-Biruni's mountain method
     ----------------------------------------------------------------------- */
  FIG['fig-biruni'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fs = function (n) { return n; };
    var h = 310, dip = 34;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sh = FIG.slider(controls, { id: 'bi-h', label: 'Height of the mountain', min: 100, max: 2000, step: 10, value: h, unit: 'm', onChange: function (v) { h = v; draw(); } });
    var sd = FIG.slider(controls, { id: 'bi-d', label: 'Measured dip of the horizon (arcminutes)', min: 10, max: 90, step: 0.5, value: dip, unit: '′', onChange: function (v) { dip = v; draw(); } });
    var row = group(controls, 'Try');
    btn('Al-Biruni’s values', row).addEventListener('click', function () { h = 310; dip = 34; sh.setValue(h); sd.setValue(dip); draw(); });
    btn('A perfect measurement', row).addEventListener('click', function () { dip = Math.round(Math.acos(6371 / (6371 + h / 1000)) * 180 / Math.PI * 60 * 2) / 2; sd.setValue(dip); draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--ink-secondary);line-height:1.55;';
    function draw() {
      var c = C(), W = 620, H = 290;
      svgWrap.innerHTML = '';
      var kf = Math.min(1.8, Math.max(1, 620 / (svgWrap.clientWidth || 620)));
      fs = function (n) { return Math.round(n * kf * 10) / 10; };
      var svg = FIG.createSVG(svgWrap, W, H, 'A mountain on a round Earth and the line of sight to the horizon');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: c.sunken }, svg);
      // Exaggerated geometry: Earth radius 220 px, mountain drawn tall
      var cx = 200, cy = 330, R = 220, mh = 60, theta = Math.acos(R / (R + mh));
      el('circle', { cx: cx, cy: cy, r: R, fill: '#c7d9c3', stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      var tx = cx, ty = cy - R - mh;
      el('path', { d: 'M' + (cx - 40) + ' ' + (cy - R + 4) + ' L' + tx + ' ' + ty + ' L' + (cx + 40) + ' ' + (cy - R + 4) + ' Z', fill: '#a8a29e', stroke: c.ink2 }, svg);
      var hx = cx + R * Math.sin(theta), hy = cy - R * Math.cos(theta);
      el('line', { x1: tx, y1: ty, x2: hx + (hx - tx) * 0.5, y2: hy + (hy - ty) * 0.5, stroke: c.key, 'stroke-width': 2 }, svg);
      el('line', { x1: tx, y1: ty, x2: tx + 300, y2: ty, stroke: c.ink2, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, svg);
      txt(svg, tx + 300, ty - 6, 'level line', { size: fs(11.5), fill: c.muted, anchor: 'end' });
      el('path', { d: 'M' + (tx + 90) + ' ' + ty + ' A90 90 0 0 1 ' + (tx + 90 * Math.cos(theta)) + ' ' + (ty + 90 * Math.sin(theta)), fill: 'none', stroke: c.key, 'stroke-width': 2 }, svg);
      txt(svg, tx + 98, ty + 22, 'dip', { size: fs(12), weight: 700, fill: c.key, anchor: 'start' });
      el('circle', { cx: hx, cy: hy, r: 4, fill: c.key }, svg);
      txt(svg, hx + 8, hy + 16, 'horizon', { size: fs(12), fill: c.ink2, anchor: 'start' });
      el('line', { x1: cx, y1: cy, x2: hx, y2: hy, stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      el('line', { x1: cx, y1: cy, x2: tx, y2: cy - R, stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      txt(svg, cx - 20, ty + 30, 'h', { size: fs(13), weight: 700, fill: c.warn });
      txt(svg, (cx + hx) / 2 + 10, (cy + hy) / 2 + 30, 'R', { size: fs(13), weight: 700, fill: c.ink2 });
      txt(svg, W - 12, H - 10, 'mountain and angle hugely exaggerated', { anchor: 'end', size: fs(11), fill: c.muted });
      var th = dip / 60 * Math.PI / 180, Rkm = (h / 1000) * Math.cos(th) / (1 - Math.cos(th)), err = (Rkm - 6371) / 6371 * 100;
      read.innerHTML = 'From the top of a mountain <strong>' + fmt(h) + ' m</strong> high, the horizon appears <strong>' + dip + ' arcminutes</strong> below the level. The right-angled triangle gives: radius = height × cos(dip) ÷ (1 − cos(dip)) = <strong>' + fmt(Rkm) + ' km</strong>, ' +
        (Math.abs(err) < 1 ? 'within 1% of the true 6,371 km.' : (err > 0 ? Math.round(err) + '% too big' : Math.round(-err) + '% too small') + ' compared with the true 6,371 km.') +
        '<br><span style="font-size:0.84rem;color:var(--ink-muted);">A dip angle off by just 1 arcminute (one sixtieth of a degree) changes the answer by several per cent.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Triangulation chain
     ----------------------------------------------------------------------- */
  FIG['fig-triangulation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fs = function (n) { return n; };
    var errMin = 2, seed = 3;
    // True positions (km): a zigzag chain of stations running north
    var P = [[0, 0], [9, 0.5], [3, 9], [11, 15], [4, 22], [12, 29], [6, 37]];
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'tr-e', label: 'Typical error in each angle (arcminutes)', min: 0, max: 30, step: 1, value: errMin, unit: '′', onChange: function (v) { errMin = v; draw(); } });
    var row = group(controls, 'Survey');
    btn('Do the survey again', row, 'fig-button').addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.92rem;color:var(--ink-secondary);line-height:1.55;';
    function angleAt(a, b, c) { var v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - a[0], c[1] - a[1]]; return Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(v1[0], v1[1]) / Math.hypot(v2[0], v2[1])); }
    function draw() {
      var c = C(), r = rng(seed * 101), noise = function () { return (r() * 2 - 1) * errMin / 60 * Math.PI / 180 * 1.5; };
      // Survey: measured baseline P0–P1 exactly; each new station found from the previous two using measured angles (sine rule)
      var Q = [P[0].slice(), P[1].slice()];
      for (var i = 2; i < P.length; i++) {
        var A = P[i - 2], B = P[i - 1], X = P[i];
        var aA = angleAt(A, B, X) + noise(), aB = angleAt(B, A, X) + noise(), aX = Math.PI - aA - aB;
        var qa = Q[i - 2], qb = Q[i - 1], base = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
        var dAX = base * Math.sin(aB) / Math.sin(aX);
        var dir = Math.atan2(qb[1] - qa[1], qb[0] - qa[0]), side = ((B[0] - A[0]) * (X[1] - A[1]) - (B[1] - A[1]) * (X[0] - A[0])) > 0 ? 1 : -1;
        Q.push([qa[0] + dAX * Math.cos(dir + side * aA), qa[1] + dAX * Math.sin(dir + side * aA)]);
      }
      svgWrap.innerHTML = '';
      var kf = Math.min(1.8, Math.max(1, 620 / (svgWrap.clientWidth || 620)));
      fs = function (n) { return Math.round(n * kf * 10) / 10; };
      var W = 620, H = 300, sc = 7, ox = 150, oy = 270;
      var svg = FIG.createSVG(svgWrap, W, H, 'A chain of triangles between stations, with true and surveyed positions');
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: c.sunken }, svg);
      var X = function (p) { return ox + p[1] * sc * 1.35; }, Y = function (p) { return oy - p[0] * sc * 2.4; };
      for (var t = 0; t < P.length - 2; t++) el('polygon', { points: [P[t], P[t + 1], P[t + 2]].map(function (p) { return X(p) + ',' + Y(p); }).join(' '), fill: 'rgba(29,78,216,0.06)', stroke: c.accent, 'stroke-width': 1.2 }, svg);
      el('line', { x1: X(P[0]), y1: Y(P[0]), x2: X(P[1]), y2: Y(P[1]), stroke: c.warn, 'stroke-width': 4 }, svg);
      var bmx = (X(P[0]) + X(P[1])) / 2 - 10, bmy = (Y(P[0]) + Y(P[1])) / 2;
      txt(svg, bmx, bmy - 3, 'measured', { size: fs(11.5), weight: 700, fill: c.warn, anchor: 'end' });
      txt(svg, bmx, bmy + fs(11.5) + 1, 'baseline', { size: fs(11.5), weight: 700, fill: c.warn, anchor: 'end' });
      P.forEach(function (p, i) { el('circle', { cx: X(p), cy: Y(p), r: 5, fill: c.accent }, svg); if (i === 0) txt(svg, X(p) - 8, Y(p) + 18, 'Start', { size: fs(12), weight: 700, anchor: 'start' }); });
      txt(svg, X(P[6]) + 10, Y(P[6]) - 10, 'End', { size: fs(12), weight: 700, anchor: 'start' });
      Q.forEach(function (q, i) { if (i > 1) { el('circle', { cx: X(q), cy: Y(q), r: 6, fill: 'none', stroke: '#dc2626', 'stroke-width': 2 }, svg); el('line', { x1: X(P[i]), y1: Y(P[i]), x2: X(q), y2: Y(q), stroke: '#dc2626', 'stroke-width': 1 }, svg); } });
      txt(svg, W - 12, 20, 'blue: true stations · red rings: where the survey puts them', { anchor: 'end', size: fs(11.5), fill: c.muted });
      var trueD = Math.hypot(P[6][0] - P[0][0], P[6][1] - P[0][1]), survD = Math.hypot(Q[6][0] - Q[0][0], Q[6][1] - Q[0][1]);
      read.innerHTML = 'Only the short baseline is measured with rods or chains; every other distance comes from angles. True start-to-end distance: <strong>' + trueD.toFixed(2) + ' km</strong>. Surveyed: <strong>' + survD.toFixed(2) + ' km</strong>, an error of <strong>' + (Math.abs(survD - trueD) / trueD * 100).toFixed(2) + '%</strong>. Errors in the angles add up along the chain, which is why surveyors measured each angle many times and checked their work with a second baseline at the far end.';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which piece of evidence did Aristotle give that the Earth is round?', options: ['Photographs from space', 'The Earth’s shadow on the Moon during an eclipse is always curved', 'The Sun rises in the east', 'Rivers flow downhill'], answer: 1, explanation: 'Only a sphere casts a round shadow from every direction. He also noted that the stars visible change as you travel north or south.' },
      { question: 'What did Eratosthenes measure at Alexandria?', options: ['The time of sunrise', 'The angle of the Sun’s rays from the vertical at noon, about one-fiftieth of a circle', 'The height of the lighthouse', 'The speed of ships'], answer: 1, explanation: 'At Syene the noon Sun was overhead on the summer solstice; at Alexandria it was about 7.2° from overhead.' },
      { question: 'Why is it hard to say exactly how accurate Eratosthenes was?', options: ['His books survive in full', 'We do not know exactly how long the stadion he used was', 'He used kilometres', 'He never gave a number'], answer: 1, explanation: 'Depending on the stadion, his 250,000 stadia equals roughly 39,000 to 46,000 km, compared with about 40,000 km today.' },
      { question: 'What key assumption did Eratosthenes make about the Sun?', options: ['That it is very far away, so its rays arrive parallel', 'That it goes round the Earth', 'That it is the same size as the Moon', 'That it never moves'], answer: 0, explanation: 'With a nearby Sun, the same shadows could be explained by a flat Earth.' },
      { question: 'How did the caliph al-Ma’mun’s astronomers measure a degree?', options: ['By sailing round the world', 'By travelling north and south across a flat plain until the height of the pole star changed by one degree, and measuring the distance', 'By using GPS', 'By looking at the Moon'], answer: 1, explanation: 'They found about 56⅔ Arabic miles per degree.' },
      { question: 'What did al-Biruni measure from the top of a mountain?', options: ['The temperature', 'How far the horizon dips below the level', 'The speed of the wind', 'The time of sunset only'], answer: 1, explanation: 'Knowing the mountain’s height and the dip angle, a right-angled triangle gives the Earth’s radius.' },
      { question: 'What is triangulation?', options: ['Measuring every distance with a chain', 'Measuring one baseline carefully, then finding all other distances from angles in a chain of triangles', 'Using three satellites', 'Drawing triangles on maps for decoration'], answer: 1, explanation: 'Angles are far easier to measure accurately over long distances than lengths.' },
      { question: 'What improvement made Picard’s 1670 measurement so accurate?', options: ['Using camels', 'Fitting telescopes with crosshairs to his angle-measuring instruments', 'Measuring at night only', 'Counting footsteps'], answer: 1, explanation: 'His result was within about 0.1 per cent, and Newton used it in his theory of gravity.' },
      { question: 'What did people in Columbus’s time believe about the Earth’s shape?', options: ['Educated people thought it was flat', 'Educated Europeans knew it was round; the argument was about its size', 'Nobody had any idea', 'They thought it was a cube'], answer: 1, explanation: 'Columbus used figures that made the Earth much too small. The "flat Earth" story was largely invented in the 1800s.' },
      { question: 'What is the Earth’s circumference through the poles, measured today?', options: ['About 4,000 km', 'About 40,000 km', 'About 400,000 km', 'About 4 million km'], answer: 1, explanation: 'About 40,008 km through the poles and 40,075 km round the equator: the Earth is slightly squashed (Part 2).' }
    ]);
  };
})();
