/* ==========================================================================
   RNLearn — How Fast Is Light? (How We Measured the Universe, Part 5)
   Figures:
     1. fig-light-timeline     The story at a glance (clickable timeline)
     2. fig-galileo-lanterns   Light versus reaction time
     3. fig-io-eclipse         Rømer's clock in the sky
     4. fig-aberration         Aberration: walking through the rain
     5. fig-toothed-wheel      Fizeau's toothed wheel
     6. fig-quiz-m5            Test yourself
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
    { name: 'Is light instant?', color: '#b45309' },
    { name: 'Astronomy and spinning machines', color: '#1d4ed8' },
    { name: 'Waves, lasers and definition', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1638', icon: '🏮', era: 0, sec: 3, title: 'Galileo’s lanterns', text: 'Galileo describes trying to time light between two lanterns about a mile apart. Light is either instant or “extraordinarily rapid”.' },
    { year: '1676', icon: '🪐', era: 1, sec: 4, title: 'Rømer and Io', text: 'Ole Rømer announces that eclipses of Jupiter’s moon Io run late when the Earth is far from Jupiter, because light takes time to cross the extra distance.' },
    { year: '1690', icon: '📘', era: 1, sec: 4, title: 'Huygens’s number', text: 'Christiaan Huygens uses Rømer’s delay to give the first value for the speed of light, about 212,000 km/s.' },
    { year: '1729', icon: '☔', era: 1, sec: 5, title: 'Bradley’s aberration', text: 'James Bradley finds that stars shift because the Earth moves through their light, and calculates that sunlight takes 8 minutes 12 seconds to reach us.' },
    { year: '1849', icon: '⚙️', era: 1, sec: 6, title: 'Fizeau’s toothed wheel', text: 'Hippolyte Fizeau sends light through a spinning toothed wheel to a mirror 8.6 km away and back: about 315,000 km/s.' },
    { year: '1862', icon: '🪞', era: 1, sec: 7, title: 'Foucault’s spinning mirror', text: 'Léon Foucault measures 298,000 km/s inside a laboratory, using a mirror spinning hundreds of times a second.' },
    { year: '1865', icon: '🧲', era: 2, sec: 8, title: 'Light is electromagnetic', text: 'James Clerk Maxwell shows that electric and magnetic waves travel at the speed of light, and concludes that light is such a wave.' },
    { year: '1879', icon: '🔭', era: 1, sec: 9, title: 'Michelson begins', text: 'A young Albert Michelson improves Foucault’s method and measures 299,910 km/s.' },
    { year: '1905', icon: '⏱️', era: 2, sec: 9, title: 'Einstein', text: 'Einstein’s special relativity makes the speed of light the same for every observer.' },
    { year: '1926', icon: '⛰️', era: 1, sec: 9, title: 'Between two mountains', text: 'Michelson times light between Mount Wilson and Mount San Antonio, 35 km apart: 299,796 km/s.' },
    { year: '1950', icon: '📻', era: 2, sec: 10, title: 'Microwaves in a cavity', text: 'Louis Essen measures 299,792.5 km/s from the resonances of a metal cavity.' },
    { year: '1972', icon: '🔴', era: 2, sec: 10, title: 'Laser frequency × wavelength', text: 'A team at the US National Bureau of Standards measures the frequency and wavelength of a laser: 299,792,456.2 m/s.' },
    { year: '1983', icon: '📏', era: 2, sec: 10, title: 'Measurement becomes definition', text: 'The metre is redefined so that the speed of light is exactly 299,792,458 metres per second.' }
  ];
  FIG['fig-light-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1638 to 1983');
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
  var C_KMS = 299792.458, AU_KM = 149597870.7;
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) {
      var b = btn(it, row); bs.push(b);
      b.addEventListener('click', function () { bs.forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); onPick(i); });
      if (i === initial) { b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); }
    });
    return row;
  }

  /* -----------------------------------------------------------------------
     Figure 2. Galileo's lanterns
     ----------------------------------------------------------------------- */
  FIG['fig-galileo-lanterns'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var km = 1.6, react = 0.25;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'gl-km', label: 'Distance between the two lanterns', min: 0.5, max: 30, step: 0.1, value: km, onChange: function (v) { km = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'gl-r', label: 'Human reaction time', min: 0.1, max: 0.5, step: 0.01, value: react, onChange: function (v) { react = v; draw(); } });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C();
      valText(s1, (km < 10 ? fmt(km, 1) : fmt(km, 0)) + ' km');
      valText(s2, fmt(react, 2) + ' s');
      var light = 2 * km / C_KMS, total = 2 * react + light; // seconds: two reactions (assistant and Galileo) plus the light's round trip
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 150, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Time for the light compared with human reaction time');
      var L = 10, R = W - 10, X = function (t) { return L + t / total * (R - L); };
      txt(svg, L, 18, W < 560 ? 'From your signal to the reply:' : 'Time between uncovering your lantern and seeing the reply:', { anchor: 'start', size: fs(11), fill: c.muted });
      el('rect', { x: X(0), y: 30, width: X(react) - X(0), height: 34, fill: '#94a3b8' }, svg);
      el('rect', { x: X(react), y: 30, width: Math.max(1.5, X(react + light) - X(react)), height: 34, fill: '#f59e0b' }, svg);
      el('rect', { x: X(react + light), y: 30, width: X(total) - X(react + light), height: 34, fill: '#64748b' }, svg);
      txt(svg, (X(0) + X(react)) / 2, 52, W < 560 ? 'assistant' : 'your assistant reacts', { size: fs(10.5), fill: '#fff', weight: 600 });
      txt(svg, (X(react + light) + X(total)) / 2, 52, 'you react', { size: fs(10.5), fill: '#fff', weight: 600 });
      el('line', { x1: X(react), y1: 70, x2: X(react), y2: 92, stroke: '#f59e0b', 'stroke-width': 1.5 }, svg);
      txt(svg, X(react) + 4, 106, (W < 560 ? 'light: ' : 'light’s round trip: ') + fmt(light * 1e6, 1) + (W < 560 ? ' µs' : ' millionths of a second (the thin orange sliver)'), { anchor: 'start', size: fs(10.5), fill: c.warn });
      txt(svg, L, H - 10, W < 560 ? 'Total: about ' + fmt(total, 2) + ' s' : 'Total: about ' + fmt(total, 2) + ' s, of which light is ' + (light / total * 100 < 0.001 ? 'less than 0.001%' : fmt(light / total * 100, 4) + '%'), { anchor: 'start', size: fs(10.5), fill: c.ink2 });
      read.innerHTML = 'Light crosses ' + fmt(2 * km, 1) + ' km and back in <strong>' + fmt(light * 1e6, 1) + ' µs</strong>, while the two human reactions take about <strong>' + fmt(2 * react, 2) + ' s</strong>, ' + fmt(2 * react / light, 0) + ' times longer.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Even at 30 km apart, the light’s share is far smaller than the variation in reaction time from one try to the next. Galileo’s experiment could never have worked: the method, not the experimenter, was the limit.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Rømer and the moons of Jupiter
     ----------------------------------------------------------------------- */
  var PJ = 4332.6, PE = 365.25, AJ = 5.203;
  FIG['fig-io-eclipse'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var day = 0, speed = 0;
    var SPEEDS = [{ n: 'True speed of light', c: C_KMS }, { n: 'Rømer’s 22 minutes', c: 2 * AU_KM / (22 * 60) }, { n: 'Light ten times faster', c: C_KMS * 10 }];
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'io-day', label: 'Days after Jupiter is closest (opposition)', min: 0, max: 399, step: 1, value: day, onChange: function (v) { day = v; draw(); } });
    choice(controls, 'Speed of light', SPEEDS.map(function (s) { return s.n; }), 0, function (i) { speed = i; draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function pos(d) {
      var ae = 2 * Math.PI * d / PE, aj = 2 * Math.PI * d / PJ;
      return { ex: Math.cos(ae), ey: Math.sin(ae), jx: AJ * Math.cos(aj), jy: AJ * Math.sin(aj) };
    }
    function dist(d) { var p = pos(d); return Math.hypot(p.jx - p.ex, p.jy - p.ey); }
    function draw() {
      var c = C(), p = pos(day), dAU = dist(day), dmin = dist(0), cc = SPEEDS[speed].c;
      var late = (dAU - dmin) * AU_KM / cc / 60; // minutes
      valText(sl, day + ' days');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560;
      var H = narrow ? 420 : 260, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Earth, Jupiter and the delay of Io’s eclipses');
      // left: orbits (Jupiter's orbit drawn compressed)
      var ow = narrow ? W : W * 0.45, cx = ow / 2, cy = narrow ? 120 : H / 2, Re = Math.min(ow / 2 - 30, (narrow ? 110 : H / 2 - 16)) * 0.45, Rj = Re * 2.1;
      el('circle', { cx: cx, cy: cy, r: Re, fill: 'none', stroke: c.border, 'stroke-dasharray': '3 4' }, svg);
      el('circle', { cx: cx, cy: cy, r: 9, fill: '#f59e0b' }, svg);
      var aj = Math.atan2(p.jy, p.jx), JX = cx + Rj * Math.cos(aj), JY = cy - Rj * Math.sin(aj), EX = cx + Re * p.ex, EY = cy - Re * p.ey;
      el('path', { d: 'M' + (cx + Rj * Math.cos(aj - 0.5)) + ' ' + (cy - Rj * Math.sin(aj - 0.5)) + ' A' + Rj + ' ' + Rj + ' 0 0 0 ' + (cx + Rj * Math.cos(aj + 0.5)) + ' ' + (cy - Rj * Math.sin(aj + 0.5)), fill: 'none', stroke: c.border, 'stroke-dasharray': '3 4' }, svg);
      el('line', { x1: EX, y1: EY, x2: JX, y2: JY, stroke: '#f59e0b', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, svg);
      el('circle', { cx: EX, cy: EY, r: 6, fill: '#2563eb' }, svg);
      el('circle', { cx: JX, cy: JY, r: 10, fill: '#c2410c' }, svg);
      txt(svg, EX, EY + (EY >= cy - 2 ? 22 : -12), 'Earth', { size: fs(10.5), fill: c.ink2 });
      txt(svg, JX, JY - 15, 'Jupiter', { size: fs(10.5), fill: c.ink2 });
      txt(svg, 6, 14, 'Orbits not to scale', { anchor: 'start', size: fs(9.5), fill: c.faint });
      // right: delay curve over a year
      var gx = narrow ? 34 : W * 0.5 + 30, gy = narrow ? 260 : 30, gw = (narrow ? W - 44 : W * 0.5 - 44), gh = narrow ? 120 : H - 80;
      var maxLate = (dist(199.5) - dmin) * AU_KM / cc / 60, top = Math.max(1, maxLate * 1.1);
      var X = function (d) { return gx + d / 399 * gw; }, Y = function (m) { return gy + gh - m / top * gh; };
      el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: c.border }, svg);
      el('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, stroke: c.border }, svg);
      var d = '';
      for (var t = 0; t <= 399; t += 3) d += (d ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y((dist(t) - dmin) * AU_KM / cc / 60).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 2.4 }, svg);
      el('circle', { cx: X(day), cy: Y(late), r: 6, fill: c.warn, stroke: c.surface, 'stroke-width': 2 }, svg);
      txt(svg, gx, gy - 10, narrow ? 'Delay of Io’s eclipses (min)' : 'How late Io’s eclipses appear (minutes)', { anchor: 'start', size: fs(10.5), fill: c.muted });
      txt(svg, gx - 4, Y(0) + 4, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, gx - 4, Y(maxLate) + 4, fmt(maxLate, maxLate < 10 ? 1 : 0), { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, gx + gw / 2, gy + gh + 20, narrow ? 'days after opposition' : 'days after opposition (one Earth–Jupiter cycle)', { size: fs(10), fill: c.muted });
      read.innerHTML = 'Earth–Jupiter distance: <strong>' + fmt(dAU, 2) + ' AU</strong> (closest ' + fmt(dmin, 2) + ' AU). ' + (late < 0.05 ? 'The Earth is as close to Jupiter as it gets, so Io’s eclipses appear <strong>on time</strong>; move through the year.' : 'The extra ' + fmt((dAU - dmin) * AU_KM / 1e6, 0) + ' million km makes Io’s eclipses appear <strong>' + fmt(late, 1) + ' minutes late</strong>.') + '<br>' +
        '<span style="font-size:0.86rem;color:var(--ink-muted);">Across the full width of the Earth’s orbit (2 AU) the true delay is about 16.6 minutes. Rømer’s data suggested about 22 minutes, which would make light about ' + fmt(2 * AU_KM / 1320, 0) + ' km/s with today’s AU. Simplified: circular orbits; Jupiter’s orbit not drawn to scale.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Bradley's aberration: walking in the rain
     ----------------------------------------------------------------------- */
  FIG['fig-aberration'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0, v = 2;
    var controls = div('fig-controls', container), sl;
    var MODES = [{ n: 'Walking in the rain', fall: 5, max: 6, step: 0.1, unit: 'm/s', label: 'Your walking speed' }, { n: 'The Earth and starlight', fall: C_KMS, max: 60, step: 0.5, unit: 'km/s', label: 'Speed of the Earth' }];
    choice(controls, 'Situation', MODES.map(function (m) { return m.n; }), 0, function (i) { mode = i; v = i ? 29.8 : 2; build(); draw(); });
    var slotWrap = div('', controls);
    function build() {
      slotWrap.innerHTML = '';
      var m = MODES[mode];
      sl = FIG.slider(slotWrap, { id: 'ab-v', label: m.label, min: 0, max: m.max, step: m.step, value: v, onChange: function (x) { v = x; draw(); } });
    }
    build();
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), m = MODES[mode];
      valText(sl, fmt(v, 1) + ' ' + m.unit);
      var ang = Math.atan2(v, m.fall), shown = mode ? Math.min(0.45, ang * 3000) : ang; // exaggerate the starlight case
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 240, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Tilting a tube to catch falling drops');
      var cx = W / 2, base = H - 40, len = 150;
      // falling drops (vertical)
      for (var k = 0; k < 14; k++) {
        var x = 20 + (k * 53) % (W - 40), y = 20 + (k * 37) % 120;
        el('line', { x1: x, y1: y, x2: x, y2: y + 12, stroke: mode ? '#fbbf24' : '#60a5fa', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
      }
      // tilted tube (telescope / umbrella handle)
      var tx = cx + len * Math.sin(shown), ty = base - len * Math.cos(shown);
      el('line', { x1: cx, y1: base, x2: tx, y2: ty, stroke: c.ink2, 'stroke-width': 14, 'stroke-linecap': 'butt', opacity: 0.85 }, svg);
      el('line', { x1: cx, y1: base, x2: cx, y2: base - len, stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      var r = 50;
      el('path', { d: 'M' + cx + ' ' + (base - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.sin(shown)) + ' ' + (base - r * Math.cos(shown)), fill: 'none', stroke: c.warn, 'stroke-width': 2 }, svg);
      // motion arrow
      el('line', { x1: cx - 60, y1: base + 22, x2: cx + 40, y2: base + 22, stroke: c.accent, 'stroke-width': 2.5 }, svg);
      el('path', { d: 'M' + (cx + 40) + ' ' + (base + 16) + ' L' + (cx + 52) + ' ' + (base + 22) + ' L' + (cx + 40) + ' ' + (base + 28) + ' Z', fill: c.accent }, svg);
      txt(svg, cx + 58, base + 26, mode ? 'Earth moving' : 'you walking', { anchor: 'start', size: fs(10.5), fill: c.accent });
      txt(svg, cx + 10, base - r - 6, mode ? 'tilt exaggerated' : '', { anchor: 'start', size: fs(10), fill: c.warn });
      var deg = ang * 180 / Math.PI;
      read.innerHTML = (mode ?
        'Starlight falls at 299,792 km/s; the Earth moves at ' + fmt(v, 1) + ' km/s. The telescope must tilt by <strong>' + fmt(ang * 206265, 1) + ' seconds of arc</strong> to catch the light.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">As the Earth goes round the Sun, its direction of motion changes, so every star traces a tiny yearly loop about 20.5 seconds of arc in radius. Bradley measured this angle and the Earth’s speed (from the size of its orbit) and so found the speed of light.</span>' :
        'Rain falls straight down at 5 m/s; you walk at ' + fmt(v, 1) + ' m/s. To keep the drops falling straight down a tube (or to keep dry under an umbrella), tilt it forward by <strong>' + fmt(deg, 1) + '°</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Walk faster and you must tilt more. The angle depends only on the ratio of the two speeds, so if you know your speed and measure the angle, you can work out how fast the rain falls.</span>');
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Fizeau's toothed wheel
     ----------------------------------------------------------------------- */
  var FZ_D = 8.633, FZ_N = 720;
  FIG['fig-toothed-wheel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var f = 6, cGuess = C_KMS;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'tw-f', label: 'Wheel speed', min: 0, max: 40, step: 0.1, value: f, onChange: function (v) { f = v; draw(); } });
    var row = group(controls, 'Jump to');
    [['First darkness', 1], ['Bright again', 2], ['Second darkness', 3]].forEach(function (p) {
      btn(p[0], row).addEventListener('click', function () { f = Math.round(p[1] * C_KMS / (4 * FZ_D * FZ_N) * 10) / 10; sl.setValue(f); draw(); });
    });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function bright(ff) {
      var shift = 2 * FZ_D / cGuess * FZ_N * ff, ph = shift - Math.floor(shift); // in tooth periods
      return 1 - 2 * Math.min(ph, 1 - ph);
    }
    var angle = 0, last = 0;
    function draw(ts) {
      var c = C();
      valText(sl, fmt(f, 1) + ' turns per second');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560;
      var H = narrow ? 390 : 230, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'A toothed wheel and the brightness of the returning light');
      // the wheel (only 36 teeth drawn)
      var wr = narrow ? 70 : 80, wx = narrow ? W / 2 : 20 + wr, wy = narrow ? 90 : H / 2, nt = 36;
      var g = el('g', { transform: 'rotate(' + angle.toFixed(1) + ' ' + wx + ' ' + wy + ')' }, svg);
      el('circle', { cx: wx, cy: wy, r: wr - 10, fill: c.sunken, stroke: c.muted }, g);
      for (var k = 0; k < nt; k++) {
        var a0 = 2 * Math.PI * k / nt, a1 = a0 + Math.PI / nt;
        el('path', { d: 'M' + (wx + (wr - 10) * Math.cos(a0)) + ' ' + (wy + (wr - 10) * Math.sin(a0)) + ' L' + (wx + wr * Math.cos(a0)) + ' ' + (wy + wr * Math.sin(a0)) + ' L' + (wx + wr * Math.cos(a1)) + ' ' + (wy + wr * Math.sin(a1)) + ' L' + (wx + (wr - 10) * Math.cos(a1)) + ' ' + (wy + (wr - 10) * Math.sin(a1)) + ' Z', fill: c.muted }, g);
      }
      el('circle', { cx: wx, cy: wy, r: 6, fill: c.ink2 }, svg);
      var b = bright(f);
      el('circle', { cx: wx, cy: wy - wr - (narrow ? 0 : 0), r: 7, fill: '#f59e0b', opacity: (0.15 + 0.85 * b).toFixed(2) }, svg);
      txt(svg, wx, wy + wr + 18, '(720 teeth in Fizeau’s wheel; 36 drawn)', { size: fs(9.5), fill: c.faint });
      // brightness curve
      var gx = narrow ? 34 : wx + wr + 50, gy = narrow ? 220 : 26, gw = narrow ? W - 46 : W - gx - 14, gh = narrow ? 110 : H - 70;
      var X = function (ff) { return gx + ff / 40 * gw; }, Y = function (v) { return gy + gh - v * gh; };
      el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: c.border }, svg);
      el('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, stroke: c.border }, svg);
      var d = '';
      for (var t = 0; t <= 40.001; t += 0.1) d += (d ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(bright(t)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 2.2 }, svg);
      el('circle', { cx: X(f), cy: Y(b), r: 6, fill: c.warn, stroke: c.surface, 'stroke-width': 2 }, svg);
      txt(svg, gx, gy - 8, 'Brightness of the returning light', { anchor: 'start', size: fs(10.5), fill: c.muted });
      [0, 10, 20, 30, 40].forEach(function (v) { txt(svg, X(v), gy + gh + 15, String(v), { size: fs(10), fill: c.muted }); });
      txt(svg, gx + gw / 2, gy + gh + 34, 'turns per second', { size: fs(10), fill: c.muted });
      if (ts === undefined) {
        var f1 = C_KMS / (4 * FZ_D * FZ_N);
        read.innerHTML = 'The light takes <strong>' + fmt(2 * FZ_D / C_KMS * 1e6, 1) + ' µs</strong> to travel to the mirror 8.633 km away and back. In that time the wheel turns by ' + fmt(2 * FZ_D / C_KMS * FZ_N * f, 2) + ' tooth spacings. Returning brightness: <strong>' + fmt(b * 100, 0) + '%</strong>.<br>' +
          'The light first disappears at ' + fmt(f1, 1) + ' turns per second, when the wheel turns half a tooth spacing during the round trip, so <em>c</em> = 4 × distance × teeth × turns per second = 4 × 8.633 km × 720 × ' + fmt(f1, 2) + ' = <strong>' + fmt(4 * FZ_D * FZ_N * f1, 0) + ' km/s</strong>.' +
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Fizeau saw the first darkness at about 12.6 turns per second, giving about 315,000 km/s. The rotation was drawn slowed down.</span>';
      }
    }
    draw();
    FIG.animate(figEl, function (ts) {
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
      angle = (angle + f * 360 * dt / 30) % 360; // shown 30 times slower
      var gEl = svgWrap.querySelector('svg > g');
      if (gEl) {
        var tr = gEl.getAttribute('transform').replace(/rotate\([^ ]+/, 'rotate(' + angle.toFixed(1));
        gEl.setAttribute('transform', tr);
      }
    });
    window.addEventListener('resize', function () { draw(); });
    onTheme(function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why could Galileo’s lantern experiment not measure the speed of light?', options: ['His lanterns were too dim', 'Light’s travel time was millions of times shorter than human reaction times', 'It was always cloudy', 'Light does not travel through air'], answer: 1, explanation: 'Over a few kilometres, light takes millionths of a second; people react in about a quarter of a second.' },
      { question: 'What did Rømer notice about Jupiter’s moon Io?', options: ['It changes colour', 'Its eclipses appear late when the Earth is far from Jupiter', 'It orbits backwards', 'It has an atmosphere'], answer: 1, explanation: 'The extra distance takes light extra time to cross.' },
      { question: 'Who first turned Rømer’s observations into a number for the speed of light?', options: ['Rømer himself', 'Christiaan Huygens', 'Isaac Newton', 'Galileo'], answer: 1, explanation: 'Huygens gave about 212,000 km/s in his Treatise on Light (1690).' },
      { question: 'Bradley’s aberration is like…', options: ['an echo', 'tilting an umbrella forward when walking through rain', 'a rainbow', 'a shadow'], answer: 1, explanation: 'Because the Earth moves through the starlight, telescopes must be tilted slightly forward.' },
      { question: 'In Fizeau’s experiment, why does the returning light disappear at a certain wheel speed?', options: ['The mirror breaks', 'The wheel turns by half a tooth spacing during the light’s round trip, so a tooth blocks it', 'The light runs out', 'The wheel melts'], answer: 1, explanation: 'Light leaving through a gap comes back to find a tooth in the way.' },
      { question: 'Foucault found that light travels more slowly in water than in air. Why did this matter?', options: ['It supported the wave theory of light', 'It proved light is a particle', 'It showed water is transparent', 'It measured the Sun’s distance'], answer: 0, explanation: 'Newton’s particle theory predicted light would be faster in water; the wave theory predicted slower.' },
      { question: 'What did Maxwell conclude from the speed of his electromagnetic waves?', options: ['That light is an electromagnetic wave', 'That sound is electric', 'That the Sun is magnetic', 'That light is instantaneous'], answer: 0, explanation: 'The waves’ predicted speed matched the measured speed of light.' },
      { question: 'Over what distance did Michelson time light between two mountains in 1926?', options: ['About 35 m', 'About 35 km', 'About 350 km', 'About 3,500 km'], answer: 1, explanation: 'Mount Wilson to Mount San Antonio in California, about 35 km.' },
      { question: 'Since 1983, the speed of light is…', options: ['Measured every year', 'Exactly 299,792,458 m/s by definition of the metre', 'Unknown', 'Exactly 300,000 km/s'], answer: 1, explanation: 'The metre is now defined as the distance light travels in 1/299,792,458 of a second.' },
      { question: 'About how long does sunlight take to reach the Earth?', options: ['8 seconds', 'About 8 minutes 19 seconds', 'About 8 hours', 'Instantly'], answer: 1, explanation: '149.6 million km ÷ 299,792 km/s ≈ 499 seconds.' }
    ]);
  };
})();
