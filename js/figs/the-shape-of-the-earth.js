/* ==========================================================================
   RNLearn — How We Measured the Universe, Part 2:
   The Shape of the Earth and the Birth of the Metre
   Figures:
     1. fig-shape-timeline   The story at a glance (clickable timeline)
     2. fig-degree-length    Squashed, round or stretched? Degree length against latitude
     3. fig-pendulum-clock   Why Richer's clock lost time near the equator
     4. fig-peak-height      Measuring a mountain from 175 km away
     5. fig-quiz-m2          Test yourself
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
    { name: 'The shape debate', color: '#b45309' },
    { name: 'The metre', color: '#1d4ed8' },
    { name: 'The Great Arc of India', color: '#0f766e' },
    { name: 'Modern', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1672', icon: '🕰️', era: 0, sec: 3, title: 'A clock runs slow in Cayenne', text: 'Jean Richer finds his pendulum clock loses about two and a half minutes a day near the equator.' },
    { year: '1687', icon: '🍎', era: 0, sec: 3, title: 'Newton: a squashed Earth', text: 'Newton calculates that a spinning Earth should bulge at the equator and be flattened at the poles.' },
    { year: '1720', icon: '🥚', era: 0, sec: 3, title: 'Cassini: a stretched Earth?', text: 'Jacques Cassini’s surveys in France suggest the opposite: an Earth longer from pole to pole.' },
    { year: '1735', icon: '⛰️', era: 0, sec: 4, title: 'Expedition to Peru', text: 'A French expedition sets out to measure a degree near the equator, in what is now Ecuador. It takes about nine years.' },
    { year: '1737', icon: '❄️', era: 0, sec: 4, title: 'Lapland settles it', text: 'Maupertuis’s team measures a degree near the Arctic Circle and finds it longer than in France: the Earth is flattened.' },
    { year: '1791', icon: '📏', era: 1, sec: 6, title: 'A new unit: the metre', text: 'Revolutionary France defines the metre as one ten-millionth of the distance from the North Pole to the equator.' },
    { year: '1798', icon: '🗺️', era: 1, sec: 6, title: 'Dunkirk to Barcelona', text: 'Delambre and Méchain finish surveying the meridian through Paris to fix the metre’s length.' },
    { year: '1802', icon: '📐', era: 2, sec: 8, title: 'The Great Trigonometrical Survey', text: 'William Lambton measures a baseline near Madras and begins surveying India.' },
    { year: '1852', icon: '🏔️', era: 2, sec: 9, title: 'Peak XV is the highest', text: 'Calculations by Radhanath Sikdar’s computing office show Peak XV is the highest known mountain.' },
    { year: '1875', icon: '🤝', era: 1, sec: 7, title: 'The Metre Convention', text: 'Seventeen nations agree to share the metric system and set up an international bureau.' },
    { year: '1983', icon: '💡', era: 1, sec: 7, title: 'A metre of light', text: 'The metre is redefined by the distance light travels in a tiny fraction of a second.' },
    { year: '2020', icon: '🛰️', era: 3, sec: 10, title: 'Everest: 8,848.86 m', text: 'Nepal and China jointly announce a new height for Everest, measured with satellites and surveying on the summit.' }
  ];
  FIG['fig-shape-timeline'] = function (figEl) {
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
    var selected = 4;
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1672 to 2020');
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
     Figure 2. Length of one degree of latitude for different shapes
     ----------------------------------------------------------------------- */
  // Length (km) of one degree of latitude on an ellipsoid with mean size fixed and flattening f
  // (f > 0 squashed at the poles, f < 0 stretched)
  function degLen(latDeg, f) {
    var a = 6371.0 * (1 + f / 3), e2 = 2 * f - f * f, s = Math.sin(latDeg * Math.PI / 180);
    return a * (1 - e2) / Math.pow(1 - e2 * s * s, 1.5) * Math.PI / 180;
  }
  var MEAS = [
    { name: 'Peru (1735–44)', lat: 1.5, km: 110.6 },
    { name: 'France, Picard (1670)', lat: 49.3, km: 111.2 },
    { name: 'Lapland (1736–37)', lat: 66.3, km: 111.9 }
  ];
  FIG['fig-degree-length'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var finv = 298, sign = 1;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Shape of the Earth');
    var bO = btn('Squashed (Newton)', row), bS = btn('Perfect sphere', row), bP = btn('Stretched (Cassini)', row);
    bO.addEventListener('click', function () { sign = 1; draw(); });
    bS.addEventListener('click', function () { sign = 0; draw(); });
    bP.addEventListener('click', function () { sign = -1; draw(); });
    FIG.slider(controls, { id: 'dl-f', label: 'Amount of flattening (1 part in …)', min: 100, max: 600, step: 2, value: finv, onChange: function (v) { finv = v; draw(); } });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.92rem;color:var(--ink-secondary);line-height:1.55;';
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620), f = sign / finv;
      bO.classList.toggle('active', sign === 1); bS.classList.toggle('active', sign === 0); bP.classList.toggle('active', sign === -1);
      svgWrap.innerHTML = '';
      var W = 620, H = 300, L = 62, Rm = 16, T = 18, B = 44;
      var svg = FIG.createSVG(svgWrap, W, H, 'Length of one degree of latitude from the equator to the pole');
      var lo = 109.8, hi = 112.6;
      var X = function (lat) { return L + lat / 90 * (W - L - Rm); }, Y = function (km) { return T + (hi - km) / (hi - lo) * (H - T - B); };
      [110, 110.5, 111, 111.5, 112, 112.5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: W - Rm, y2: Y(v), stroke: c.border }, svg); txt(svg, L - 6, Y(v) + 4, v.toFixed(1), { anchor: 'end', size: fs(10.5), fill: c.muted }); });
      [0, 30, 60, 90].forEach(function (v) { txt(svg, X(v), H - B + 16, v + '°', { size: fs(10.5), fill: c.muted }); });
      txt(svg, (L + W - Rm) / 2, H - 6, 'latitude: equator (0°) to pole (90°)', { size: fs(11), fill: c.muted });
      var t = txt(svg, 14, (T + H - B) / 2, 'km per degree', { size: fs(11), fill: c.muted }); t.setAttribute('transform', 'rotate(-90 14 ' + (T + H - B) / 2 + ')');
      var d = '';
      for (var lat = 0; lat <= 90; lat += 1) d += (d ? 'L' : 'M') + X(lat).toFixed(1) + ' ' + Y(degLen(lat, f)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 3 }, svg);
      var dm = '';
      for (var l2 = 0; l2 <= 90; l2 += 1) dm += (dm ? 'L' : 'M') + X(l2).toFixed(1) + ' ' + Y(degLen(l2, 1 / 298.257)).toFixed(1);
      el('path', { d: dm, fill: 'none', stroke: c.faint, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      MEAS.forEach(function (m, i) {
        el('circle', { cx: X(m.lat), cy: Y(m.km), r: 6, fill: c.warn, stroke: '#fff', 'stroke-width': 1.5 }, svg);
        txt(svg, X(m.lat) + (i === 2 ? -10 : 10), Y(m.km) - 10, m.name, { anchor: i === 2 ? 'end' : 'start', size: fs(11.5), weight: 600, fill: c.warn });
      });
      read.innerHTML = 'Orange dots: the 18th-century measurements. Blue line: what your chosen shape predicts. Dashed line: the modern shape (flattened by about 1 part in 298). ' +
        (sign === 1 ? 'On a <strong>squashed</strong> Earth the surface is flatter near the poles, so you must travel further to see the Pole Star rise by one degree: degrees get <strong>longer</strong> towards the poles, as the measurements show.'
          : sign === 0 ? 'On a <strong>perfect sphere</strong> every degree would be the same length. The measurements clearly are not.'
          : 'On a <strong>stretched</strong> Earth degrees would get <strong>shorter</strong> towards the poles, the opposite of what Lapland and Peru found.');
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Richer's pendulum clock
     ----------------------------------------------------------------------- */
  function gravity(latDeg) { // International gravity formula (WGS 84 form), sea level, m/s²
    var s = Math.sin(latDeg * Math.PI / 180), s2 = s * s;
    return 9.7803253359 * (1 + 0.00193185265241 * s2) / Math.sqrt(1 - 0.00669437999013 * s2);
  }
  var PLACES = [['Equator (Quito area)', 0], ['Cayenne (Richer, 1672)', 4.9], ['Chennai', 13.1], ['Delhi', 28.6], ['Paris', 48.9], ['Tornio, Lapland', 65.8], ['North Pole', 90]];
  FIG['fig-pendulum-clock'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lat = 4.9, swing = 0, timer = null;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sl = FIG.slider(controls, { id: 'pc-l', label: 'Take the clock to latitude', min: 0, max: 90, step: 0.5, value: lat, unit: '°', onChange: function (v) { lat = v; draw(); } });
    var row = group(controls, 'Places');
    PLACES.forEach(function (p) { btn(p[0], row).addEventListener('click', function () { lat = p[1]; sl.setValue(lat); draw(); }); });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:0 1 200px;margin:0 auto;';
    var read = div('', lay); read.style.cssText = 'flex:1 1 280px;font-family:var(--font-sans);font-size:0.95rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var c = C(), g = gravity(lat), g0 = gravity(48.9), rate = Math.sqrt(g / g0), perDay = 86400 * (rate - 1);
      svgWrap.innerHTML = '';
      var svg = FIG.createSVG(svgWrap, 200, 230, 'A pendulum clock');
      el('rect', { x: 30, y: 10, width: 140, height: 210, rx: 10, fill: c.raised, stroke: c.ink2, 'stroke-width': 2 }, svg);
      el('circle', { cx: 100, cy: 58, r: 38, fill: c.surface, stroke: c.ink2, 'stroke-width': 2 }, svg);
      var hand = (perDay / 180) * Math.PI; // exaggerated drift
      el('line', { x1: 100, y1: 58, x2: 100 + 28 * Math.sin(hand), y2: 58 - 28 * Math.cos(hand), stroke: perDay < -1 ? '#dc2626' : c.tip, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      txt(svg, 100, 92, '12', { size: 10, fill: c.muted });
      var a = 0.32 * Math.sin(swing);
      el('line', { x1: 100, y1: 100, x2: 100 + 92 * Math.sin(a), y2: 100 + 92 * Math.cos(a), stroke: c.ink2, 'stroke-width': 2 }, svg);
      el('circle', { cx: 100 + 92 * Math.sin(a), cy: 100 + 92 * Math.cos(a), r: 11, fill: c.warn }, svg);
      read.innerHTML = 'Gravity at sea level here: <strong>' + g.toFixed(4) + ' m/s²</strong> (Paris: ' + g0.toFixed(4) + ').<br>' +
        'A pendulum clock set to keep perfect time in Paris would ' + (Math.abs(perDay) < 1 ? 'keep almost perfect time here.' : (perDay < 0 ? '<strong style="color:#dc2626;">lose ' + fmt(-perDay) + ' seconds a day</strong>' : '<strong style="color:var(--callout-tip);">gain ' + fmt(perDay) + ' seconds a day</strong>') + ' here.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Weaker gravity makes the pendulum swing more slowly. Gravity is weaker near the equator because the ground there is further from the Earth’s centre and because the Earth’s spin flings it outwards slightly.</span>';
    }
    draw();
    var anim = FIG.animate(figEl, function (t) { swing = t / 1000 * Math.PI * Math.sqrt(gravity(lat) / 9.81); draw(); });
    onTheme(draw);
    return anim;
  };

  /* -----------------------------------------------------------------------
     Figure 4. Measuring a mountain's height from far away
     ----------------------------------------------------------------------- */
  FIG['fig-peak-height'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d = 175, ang = 2.21, k = 0.13, useCurv = true, useRef = true;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sd = FIG.slider(controls, { id: 'ph-d', label: 'Distance to the peak', min: 50, max: 250, step: 1, value: d, unit: 'km', onChange: function (v) { d = v; draw(); } });
    var sa = FIG.slider(controls, { id: 'ph-a', label: 'Measured angle up to the summit', min: 0.5, max: 8, step: 0.01, value: ang, unit: '°', onChange: function (v) { ang = v; draw(); } });
    var row = group(controls, 'Corrections');
    var cB = btn('Earth’s curve: on', row), rB = btn('Bending of light: on', row);
    cB.addEventListener('click', function () { useCurv = !useCurv; draw(); });
    rB.addEventListener('click', function () { useRef = !useRef; draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620);
      cB.textContent = 'Earth’s curve: ' + (useCurv ? 'on' : 'off'); cB.classList.toggle('active', useCurv);
      rB.textContent = 'Bending of light: ' + (useRef ? 'on' : 'off'); rB.classList.toggle('active', useRef);
      var flat = d * Math.tan(ang * Math.PI / 180), curv = d * d / (2 * 6371), refr = k * curv;
      var h = flat + (useCurv ? curv : 0) - (useRef ? refr : 0);
      svgWrap.innerHTML = '';
      var W = 620, H = 260;
      var svg = FIG.createSVG(svgWrap, W, H, 'Surveyor sighting a distant summit over the curve of the Earth');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 8, fill: c.sunken }, svg);
      var x0 = 60, xp = 500, lv = 132, drop = function (x) { var u = Math.max(0, x - x0) / (xp - x0); return 62 * u * u; };
      var gd = 'M0 ' + (lv + 4);
      for (var x = 0; x <= W; x += 10) gd += ' L' + x + ' ' + (lv + 4 + drop(x));
      el('path', { d: gd + ' L' + W + ' ' + H + ' L0 ' + H + ' Z', fill: '#c7d9c3', stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      var baseY = lv + 4 + drop(xp), topY = 58;
      el('path', { d: 'M' + (xp - 70) + ' ' + (baseY + 6) + ' L' + xp + ' ' + topY + ' L' + (xp + 62) + ' ' + (baseY + 8) + ' Z', fill: '#a8a29e', stroke: c.ink2 }, svg);
      el('path', { d: 'M' + (xp - 13) + ' ' + (topY + 22) + ' L' + xp + ' ' + topY + ' L' + (xp + 12) + ' ' + (topY + 21) + ' Z', fill: '#fff' }, svg);
      el('line', { x1: x0, y1: lv, x2: W - 10, y2: lv, stroke: c.ink2, 'stroke-dasharray': '6 4' }, svg);
      txt(svg, x0 + 150, lv - 6, 'level line', { anchor: 'start', size: fs(11), fill: c.muted });
      // light path from the summit curves slightly, so the surveyor sees the summit a little too high
      el('path', { d: 'M' + x0 + ' ' + (lv - 4) + ' Q' + ((x0 + xp) / 2) + ' ' + (topY - 18) + ' ' + xp + ' ' + topY, fill: 'none', stroke: c.key, 'stroke-width': 2 }, svg);
      el('line', { x1: x0, y1: lv - 4, x2: xp + 20, y2: topY - 30, stroke: c.key, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, xp - 6, topY - 34, 'where the summit seems to be', { anchor: 'end', size: fs(10.5), fill: c.key });
      txt(svg, (x0 + xp) / 2 - 30, topY - 4, 'light bends slightly in the air', { size: fs(11), fill: c.key });
      el('rect', { x: x0 - 6, y: lv - 18, width: 12, height: 14, fill: c.warn }, svg);
      txt(svg, x0 - 4, lv + 26, 'survey station', { size: fs(11.5), weight: 700, anchor: 'start' });
      el('line', { x1: xp - 92, y1: lv, x2: xp - 92, y2: lv + 4 + drop(xp - 92), stroke: c.warn, 'stroke-width': 3 }, svg);
      txt(svg, xp - 98, lv + 4 + drop(xp - 92) + 18, 'ground hidden below the level by the curve', { anchor: 'end', size: fs(10.5), weight: 600, fill: c.warn });
      txt(svg, W - 10, H - 10, 'curve and bending hugely exaggerated', { anchor: 'end', size: fs(10.5), fill: c.muted });
      read.innerHTML = 'Height from the angle alone: <strong>' + fmt(flat * 1000) + ' m</strong>' +
        '<br>' + (useCurv ? '+ ' : '<s>+ ') + 'the Earth’s curve hides the mountain’s base below the level line: <strong>' + fmt(curv * 1000) + ' m</strong>' + (useCurv ? '' : '</s>') +
        '<br>' + (useRef ? '− ' : '<s>− ') + 'the air bends light downwards, making the summit look higher: <strong>' + fmt(refr * 1000) + ' m</strong>' + (useRef ? '' : '</s>') +
        '<br>= height of the summit above the station: <strong style="color:var(--ink);font-size:1.05rem;">' + fmt(h * 1000) + ' m</strong>' +
        '<br><span style="font-size:0.85rem;color:var(--ink-muted);">The bending (refraction) correction uses a typical value; the real one varies with weather, which is why the Survey of India averaged readings from six stations.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What did Jean Richer notice in Cayenne in 1672?', options: ['The Sun rose in the west', 'His pendulum clock lost about two and a half minutes a day compared with Paris', 'The stars disappeared', 'His telescope broke'], answer: 1, explanation: 'Gravity is slightly weaker near the equator, so pendulums swing more slowly.' },
      { question: 'What shape did Newton predict for the Earth?', options: ['A perfect sphere', 'Stretched at the poles like an egg', 'Flattened at the poles and bulging at the equator, because it spins', 'A cube'], answer: 2, explanation: 'He estimated a flattening of about 1 part in 230; the modern value is about 1 part in 298.' },
      { question: 'How could measuring degrees of latitude reveal the Earth’s shape?', options: ['It could not', 'Where the surface is flatter, you must travel further for the stars to shift by one degree, so degrees are longer there', 'Degrees are always the same length', 'By weighing the Earth'], answer: 1, explanation: 'Longer degrees near the poles mean the Earth is flatter there: squashed at the poles.' },
      { question: 'What did the Lapland expedition of 1736–37 find?', options: ['A degree there was shorter than in France', 'A degree there was longer than in France, so the Earth is flattened at the poles', 'The Earth is a perfect sphere', 'Nothing useful'], answer: 1, explanation: 'Together with Peru, the result confirmed Newton over the Cassinis.' },
      { question: 'How was the metre first defined in 1791?', options: ['As the length of the king’s foot', 'As one ten-millionth of the distance from the North Pole to the equator', 'By the speed of light', 'As the length of a pendulum'], answer: 1, explanation: 'Delambre and Méchain surveyed from Dunkirk to Barcelona to find that distance.' },
      { question: 'What secret did Pierre Méchain keep?', options: ['He never went to Spain', 'An unexplained difference of a few seconds of arc in his latitude measurements at Barcelona', 'He invented the kilogram', 'He was a spy'], answer: 1, explanation: 'It haunted him for the rest of his life; the cause was probably instrument and refraction errors.' },
      { question: 'How is the metre defined today?', options: ['By a platinum bar in Paris', 'As the distance light travels in a vacuum in 1/299,792,458 of a second', 'By the Earth’s size', 'By a pendulum'], answer: 1, explanation: 'Since 1983 the speed of light has been fixed exactly, and the metre follows from it.' },
      { question: 'What was the Great Trigonometrical Survey of India?', options: ['A tax survey', 'A huge triangulation of the subcontinent begun in 1802, including the Great Arc along the meridian', 'A railway', 'A population count'], answer: 1, explanation: 'It produced accurate maps and one of the longest arcs of meridian ever measured.' },
      { question: 'Why must the Earth’s curve be included when measuring a mountain 175 km away?', options: ['It makes no difference', 'Because the curve hides the mountain’s base below the surveyor’s level, by over two kilometres at that distance', 'Because mountains are curved', 'Because of the Moon'], answer: 1, explanation: 'The bending of light in the air works the other way, and must be subtracted.' },
      { question: 'Who led the calculations that showed Peak XV was the highest mountain?', options: ['George Everest himself', 'Radhanath Sikdar, chief computer of the Survey', 'Isaac Newton', 'Edmund Hillary'], answer: 1, explanation: 'The famous dramatic quote attributed to him is poorly documented, but his central role in the computations is well established.' }
    ]);
  };
})();
