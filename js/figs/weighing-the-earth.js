/* ==========================================================================
   RNLearn — Weighing the Earth (How We Measured the Universe, Part 6)
   Figures:
     1. fig-gravity-timeline   The story at a glance (clickable timeline)
     2. fig-pendulum-g         A pendulum measures gravity
     3. fig-schiehallion       Weighing the Earth with a mountain
     4. fig-torsion-balance    Cavendish's torsion balance
     5. fig-weigh-world        Weigh a world
     6. fig-quiz-m6            Test yourself
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
    { name: 'Falling and orbiting', color: '#b45309' },
    { name: 'Mountains and lead balls', color: '#1d4ed8' },
    { name: 'Precision and satellites', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1604', icon: '⚖️', era: 0, sec: 3, title: 'Galileo’s falling bodies', text: 'Galileo finds that falling objects speed up steadily, covering distances in proportion to the square of the time.' },
    { year: '1687', icon: '🍎', era: 0, sec: 4, title: 'Newton’s law of gravity', text: 'Newton’s <em>Principia</em> says every mass attracts every other. He guesses that the Earth is five or six times as dense as water.' },
    { year: '1774', icon: '⛰️', era: 1, sec: 5, title: 'Schiehallion', text: 'Nevil Maskelyne measures how a Scottish mountain pulls plumb lines sideways. Charles Hutton later calculates the Earth’s density: about 4.5.' },
    { year: '1798', icon: '🔩', era: 1, sec: 6, title: 'Cavendish’s balance', text: 'Henry Cavendish measures the attraction between lead balls with a torsion balance: the Earth is about 5.5 times as dense as water.' },
    { year: '1855', icon: '🏔️', era: 1, sec: 9, title: 'The Himalaya pull too little', text: 'Pratt and Airy explain why the Himalaya deflect plumb lines in India less than expected: mountains have light roots.' },
    { year: '1895', icon: '🧵', era: 1, sec: 7, title: 'Boys’s quartz fibres', text: 'Charles Vernon Boys measures G with a tiny torsion balance hung on a quartz fibre.' },
    { year: '1937', icon: '❓', era: 2, sec: 15, title: 'Is G changing?', text: 'Paul Dirac suggests that the strength of gravity might slowly decrease as the universe ages.' },
    { year: '2002', icon: '🛰️', era: 2, sec: 9, title: 'GRACE', text: 'Twin satellites begin mapping the Earth’s gravity month by month, watching ice sheets melt and groundwater drain.' },
    { year: '2014', icon: '⚛️', era: 2, sec: 8, title: 'Weighing with atoms', text: 'Physicists measure G with clouds of ultra-cold atoms falling past heavy tungsten masses.' },
    { year: '2018', icon: '🔬', era: 2, sec: 8, title: 'Two Chinese measurements', text: 'A team in Wuhan measures G with two different methods, with the smallest uncertainties yet, but the values from different labs still disagree.' }
  ];
  FIG['fig-gravity-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1604 to 2018');
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
  var G_TRUE = 6.6743e-11;
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
  function sci(x, d) {
    var e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
    return fmt(m, d === undefined ? 2 : d) + ' × 10<sup>' + e + '</sup>';
  }

  /* -----------------------------------------------------------------------
     Figure 2. A pendulum measures g
     ----------------------------------------------------------------------- */
  var PLACES = [{ n: 'Equator', g: 9.780 }, { n: 'Poles', g: 9.832 }, { n: 'Moon', g: 1.62 }, { n: 'Mars', g: 3.71 }, { n: 'Jupiter', g: 24.8 }];
  FIG['fig-pendulum-g'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var L = 1, place = 0;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'pg-L', label: 'Length of the pendulum', min: 0.2, max: 2, step: 0.01, value: L, onChange: function (v) { L = v; draw(0); } });
    choice(controls, 'Where?', PLACES.map(function (p) { return p.n; }), place, function (i) { place = i; draw(0); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function period() { return 2 * Math.PI * Math.sqrt(L / PLACES[place].g); }
    function draw(ts) {
      var c = C(), g = PLACES[place].g, T = period();
      valText(sl, fmt(L, 2) + ' m');
      var svg = svgWrap.querySelector('svg');
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 230, fs = scaler(svgWrap, 420);
      if (!svg || ts === 0) { svgWrap.innerHTML = ''; svg = FIG.createSVG(svgWrap, W, H, 'A swinging pendulum'); }
      var old = svg.querySelector('g.pend'); if (old) old.parentNode.removeChild(old);
      var gEl = el('g', { 'class': 'pend' }, svg);
      var px = W / 2, py = 16, len = 40 + 160 * (L / 2), amp = 0.25, t = (ts || 0) / 1000;
      var a = amp * Math.cos(2 * Math.PI * t / T);
      el('line', { x1: px - 40, y1: py, x2: px + 40, y2: py, stroke: c.ink2, 'stroke-width': 3 }, gEl);
      var bx = px + len * Math.sin(a), by = py + len * Math.cos(a);
      el('line', { x1: px, y1: py, x2: bx, y2: by, stroke: c.muted, 'stroke-width': 1.5 }, gEl);
      el('circle', { cx: bx, cy: by, r: 11, fill: c.accent }, gEl);
      txt(gEl, 10, H - 10, 'Each full swing (there and back) takes ' + fmt(T, 2) + ' s', { anchor: 'start', size: fs(11), fill: c.ink2 });
      if (ts === 0) {
        read.innerHTML = 'Period <em>T</em> = 2π√(<em>L</em>/<em>g</em>) = <strong>' + fmt(T, 2) + ' s</strong>. Time 10 swings with a stopwatch, divide by 10 to get <em>T</em>, then <em>g</em> = 4π²<em>L</em>/<em>T</em>² = <strong>' + fmt(4 * Math.PI * Math.PI * L / (T * T), 2) + ' m/s²</strong>.' +
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (place === 0 || place === 1 ? 'Gravity is about 0.5% stronger at the poles than at the equator, so the same pendulum swings slightly faster there (the subject of Richer’s slow clock in Part 2).' : 'The Moon, Mars and Jupiter values are average surface gravity. A pendulum on the Moon swings about 2.5 times more slowly than on Earth.') + '</span>';
      }
    }
    draw(0);
    FIG.animate(figEl, function (ts) { draw(ts); });
    window.addEventListener('resize', function () { draw(0); });
    onTheme(function () { draw(0); });
  };

  /* -----------------------------------------------------------------------
     Figure 3. Schiehallion: weighing the Earth with a mountain
     ----------------------------------------------------------------------- */
  var SCH_MEAS = 11.6, SCH_K = 11.6 * 1.8; // Hutton: Earth's density ≈ 1.8 × the mountain's
  FIG['fig-schiehallion'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var rm = 2.5, re = 4.5;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sc-rm', label: 'Density of the mountain’s rock (g/cm³)', min: 2, max: 3, step: 0.05, value: rm, onChange: function (v) { rm = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'sc-re', label: 'Guess for the Earth’s average density (g/cm³)', min: 1, max: 10, step: 0.05, value: re, onChange: function (v) { re = v; draw(); } });
    var row = group(controls, 'Try');
    btn('Newton’s guess (5.5)', row).addEventListener('click', function () { re = 5.5; s2.setValue(re); draw(); });
    btn('Match the measurement', row).addEventListener('click', function () { re = Math.round(SCH_K * rm / SCH_MEAS * 100) / 100; s2.setValue(re); draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C();
      valText(s1, fmt(rm, 2)); valText(s2, fmt(re, 2));
      var pred = SCH_K * rm / re; // combined deflection, arcsec
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 240, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Plumb lines pulled towards a mountain');
      var base = H - 40, cx = W / 2, mw = Math.min(W * 0.36, 260), mh = 110;
      el('path', { d: 'M' + (cx - mw) + ' ' + base + ' L' + (cx - mw * 0.25) + ' ' + (base - mh) + ' Q' + cx + ' ' + (base - mh - 14) + ' ' + (cx + mw * 0.25) + ' ' + (base - mh) + ' L' + (cx + mw) + ' ' + base + ' Z', fill: '#6b7280', opacity: 0.55 }, svg);
      el('line', { x1: 0, y1: base, x2: W, y2: base, stroke: c.border, 'stroke-width': 2 }, svg);
      txt(svg, cx, base - mh / 2, 'Schiehallion', { size: fs(11), fill: '#fff', weight: 600 });
      var tilt = Math.min(0.5, pred / 30 * 0.35); // drawing exaggeration
      [[-1, 'south station'], [1, 'north station']].forEach(function (s) {
        var x = cx + s[0] * mw * 0.62, top = base - 100, ell = 80;
        var bx = x - s[0] * ell * Math.sin(tilt / 2), by = top + ell * Math.cos(tilt / 2);
        el('line', { x1: x, y1: top, x2: x, y2: top + ell, stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
        el('line', { x1: x, y1: top, x2: bx, y2: by, stroke: c.ink2, 'stroke-width': 1.5 }, svg);
        el('circle', { cx: bx, cy: by, r: 5, fill: c.warn }, svg);
        el('rect', { x: x - 10, y: top - 6, width: 20, height: 6, fill: c.ink2 }, svg);
        txt(svg, x, base + 18, s[1], { size: fs(10.5), fill: c.ink2 });
      });
      txt(svg, 8, 16, 'Plumb lines (tilt hugely exaggerated)', { anchor: 'start', size: fs(10), fill: c.faint });
      var implied = SCH_K * rm / SCH_MEAS;
      read.innerHTML = 'Predicted combined pull of the mountain: <strong>' + fmt(pred, 1) + ' seconds of arc</strong>. Maskelyne measured <strong>' + SCH_MEAS + '</strong>.' +
        (Math.abs(pred - SCH_MEAS) < 0.3 ? ' <strong>A match!</strong>' : pred > SCH_MEAS ? ' Too big: the Earth must be denser than your guess.' : ' Too small: the Earth must be less dense than your guess.') +
        '<br>With rock of density ' + fmt(rm, 2) + ', the measurement implies an average density for the Earth of <strong>' + fmt(implied, 2) + ' g/cm³</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The denser the whole Earth, the more strongly it pulls the plumb bob straight down, and the smaller the mountain’s sideways pull looks by comparison. Hutton assumed rock of 2.5 and found 4.5; today’s value is 5.51. Simplified from Hutton’s calculation.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Cavendish's torsion balance
     ----------------------------------------------------------------------- */
  var CV = { L: 1.8, m: 0.73, r: 0.225, T: 900 };
  FIG['fig-torsion-balance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = 158, target = 0, from = 0, t0 = 0, now = 0;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'tb-M', label: 'Mass of each large lead ball', min: 20, max: 300, step: 1, value: M, onChange: function (v) { M = v; if (target) { from = angle(now); t0 = now; } draw(); } });
    var row = group(controls, 'Move the large balls');
    btn('Close to the small balls', row).addEventListener('click', function () { from = angle(now); target = 1; t0 = now; });
    btn('Swing them away', row).addEventListener('click', function () { from = angle(now); target = 0; t0 = now; });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    var I = 2 * CV.m * Math.pow(CV.L / 2, 2), kappa = 4 * Math.PI * Math.PI * I / (CV.T * CV.T);
    function eqAngle() { return G_TRUE * M * CV.m * CV.L / (CV.r * CV.r * kappa); }
    var SPEED = 60; // animation runs 60 times faster than real time
    function angle(tnow) {
      var tt = (tnow - t0) / 1000 * SPEED, w = 2 * Math.PI / CV.T, gam = 0.0006, goal = target * eqAngle();
      return goal + (from - goal) * Math.exp(-gam * tt) * Math.cos(w * tt);
    }
    function draw() {
      var c = C(), th = angle(now), eq = eqAngle();
      valText(sl, M + ' kg');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, H = narrow ? 350 : 240, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Top view of a torsion balance');
      var cx = narrow ? W / 2 : W * 0.3, cy = narrow ? 110 : H / 2, half = Math.min(narrow ? W / 2 - 40 : W * 0.25, 130), show = th * 25; // twist exaggerated 25 times
      // large balls: beside the rod ends (close) or swung round out of the way
      [1, -1].forEach(function (s) {
        var lx = target ? cx + s * half : cx + s * half * 0.3, ly = target ? cy + s * 58 : cy + s * 70;
        el('circle', { cx: lx, cy: ly, r: 20, fill: '#475569' }, svg);
      });
      // rod and small balls
      var x1 = cx + half * Math.cos(show), y1 = cy + half * Math.sin(show);
      el('line', { x1: 2 * cx - x1, y1: 2 * cy - y1, x2: x1, y2: y1, stroke: c.ink2, 'stroke-width': 3 }, svg);
      el('circle', { cx: x1, cy: y1, r: 7, fill: c.warn }, svg);
      el('circle', { cx: 2 * cx - x1, cy: 2 * cy - y1, r: 7, fill: c.warn }, svg);
      el('circle', { cx: cx, cy: cy, r: 4, fill: c.ink }, svg);
      txt(svg, cx, cy + 100, 'Top view, twist exaggerated 25×', { size: fs(10), fill: c.faint });
      // trace of twist over time
      var gx = narrow ? 30 : W * 0.6, gy = narrow ? 250 : 30, gw = narrow ? W - 40 : W * 0.38, gh = narrow ? 80 : H - 80;
      el('rect', { x: gx, y: gy, width: gw, height: gh, fill: 'none', stroke: c.border }, svg);
      var maxA = Math.max(1e-6, 2.1 * eqAngle()), Y = function (a) { return gy + gh / 2 - a / maxA * gh / 2 * 1.6 + gh * 0.3; };
      var path = '';
      for (var k = 0; k <= 120; k++) { var tt = now - (120 - k) * 250; path += (path ? 'L' : 'M') + (gx + k / 120 * gw).toFixed(1) + ' ' + Math.max(gy, Math.min(gy + gh, Y(tt < t0 ? from : angle(tt)))).toFixed(1); }
      el('path', { d: path, fill: 'none', stroke: c.accent, 'stroke-width': 2 }, svg);
      txt(svg, gx, gy - 8, 'Twist over the last ' + fmt(30 * SPEED / 60, 0) + ' minutes', { anchor: 'start', size: fs(10.5), fill: c.muted });
      if (!read._t || now - read._t > 300) {
        read._t = now;
        var Gm = 2 * Math.PI * Math.PI * CV.L * CV.r * CV.r * eq / (M * CV.T * CV.T);
        read.innerHTML = 'Twist when the large balls are close: <strong>' + fmt(eq * 1e3, 2) + ' thousandths of a radian</strong>, so each end of the 1.8 m rod moves about <strong>' + fmt(eq * CV.L / 2 * 1000, 1) + ' mm</strong>. One full swing takes about ' + fmt(CV.T / 60, 0) + ' minutes.<br>' +
          '<em>G</em> = 2π² × rod length × distance² × twist ÷ (large mass × period²) = <strong>' + sci(Gm, 3) + ' m³ kg⁻¹ s⁻²</strong>.' +
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The small balls’ mass cancels out of the calculation. A heavier large ball gives a bigger twist, but the same <em>G</em>. Dimensions and period roughly those of Cavendish’s first experiments; the damping is illustrative, and the animation runs 60 times faster than real time.</span>';
      }
    }
    draw();
    FIG.animate(figEl, function (ts) { now = ts; draw(); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Weigh a world
     ----------------------------------------------------------------------- */
  var WORLDS = [
    { n: 'Earth (from the Moon)', body: 'the Earth', moon: 'the Moon', a: 384400, T: 27.322, R: 6371, true: 5.972e24 },
    { n: 'Sun (from the Earth)', body: 'the Sun', moon: 'the Earth', a: 149597871, T: 365.256, R: 696000, true: 1.989e30 },
    { n: 'Jupiter (from Io)', body: 'Jupiter', moon: 'Io', a: 421700, T: 1.769, R: 69911, true: 1.898e27 },
    { n: 'Saturn (from Titan)', body: 'Saturn', moon: 'Titan', a: 1221870, T: 15.945, R: 58232, true: 5.683e26 },
    { n: 'Mars (from Phobos)', body: 'Mars', moon: 'Phobos', a: 9376, T: 0.3189, R: 3390, true: 6.417e23 }
  ];
  FIG['fig-weigh-world'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w = 0, gScale = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Weigh', WORLDS.map(function (x) { return x.n; }), w, function (i) { w = i; draw(); });
    var sl = FIG.slider(controls, { id: 'ww-g', label: 'Value of G used (× today’s value)', min: 0.5, max: 1.5, step: 0.01, value: 1, onChange: function (v) { gScale = v; draw(); } });
    var out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var x = WORLDS[w], a = x.a * 1000, T = x.T * 86400, G = G_TRUE * gScale;
      valText(sl, fmt(gScale, 2) + '×');
      var GM = 4 * Math.PI * Math.PI * a * a * a / (T * T), M = GM / G, rho = M / (4 / 3 * Math.PI * Math.pow(x.R * 1000, 3)) / 1000;
      out.innerHTML = '<strong>' + x.moon.charAt(0).toUpperCase() + x.moon.slice(1) + '</strong> orbits ' + x.body + ' at ' + fmt(x.a, 0) + ' km every ' + (x.T < 2 ? fmt(x.T * 24, 1) + ' hours' : fmt(x.T, x.T < 30 ? 2 : 1) + ' days') + '.<br>' +
        'Kepler and Newton: <em>GM</em> = 4π²<em>a</em>³/<em>T</em>² = <strong>' + sci(GM, 3) + ' m³/s²</strong>, known as precisely as the orbit.<br>' +
        'Divide by <em>G</em> = ' + sci(G, 3) + ': mass of ' + x.body + ' = <strong>' + sci(M, 2) + ' kg</strong>; average density <strong>' + fmt(rho, 2) + ' g/cm³</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' +
        (Math.abs(gScale - 1) > 0.005 ? 'Change G and every mass in the solar system changes with it: without Cavendish’s measurement, astronomers knew only the products GM. ' : 'Without G, astronomers could only compare masses (for example, the Sun is 333,000 times heavier than the Earth). Cavendish’s measurement turned every one of these ratios into kilograms. ') +
        (w === 0 ? 'The Moon’s own mass makes this estimate about 1% high.' : w === 1 ? 'This needs the Sun’s distance from Part 4.' : '') + '</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why can’t we find the Earth’s mass just from how fast things fall?', options: ['Things fall at different speeds', 'Falling gives only G × M; we also need the gravitational constant G', 'The Earth is too big', 'Gravity changes every day'], answer: 1, explanation: 'g = GM/R². Knowing g and R gives the product GM, but not M on its own.' },
      { question: 'What did Newton guess about the Earth’s density?', options: ['Equal to water', 'Five or six times that of water', 'Twice that of iron', 'He made no guess'], answer: 1, explanation: 'An inspired guess: the modern value is 5.51.' },
      { question: 'What did Maskelyne measure at Schiehallion in 1774?', options: ['The height of the mountain only', 'How much the mountain pulled plumb lines sideways', 'The speed of sound', 'The temperature of the rock'], answer: 1, explanation: 'Comparing stations on either side, the combined pull was about 11.6 seconds of arc.' },
      { question: 'Which map-making tool did Charles Hutton invent while working on the Schiehallion results?', options: ['The compass', 'Contour lines', 'The theodolite', 'Latitude'], answer: 1, explanation: 'Lines joining points of equal height helped him calculate the mountain’s volume.' },
      { question: 'In Cavendish’s experiment, what did the large lead balls do?', options: ['Pulled the small balls and twisted the wire slightly', 'Heated the room', 'Measured the time', 'Reflected light'], answer: 0, explanation: 'The tiny twist, compared with how easily the wire twists, gave the force between the balls.' },
      { question: 'Why did Cavendish watch his apparatus through a telescope from outside the room?', options: ['To protect his eyes', 'His body heat would set up air currents that disturbed the balance', 'The room was locked', 'He was shy'], answer: 1, explanation: 'The forces were so small that warm air moving in the room could swamp them.' },
      { question: 'What value did Cavendish publish for the Earth’s density?', options: ['2.5', '4.5', '5.48', '10'], answer: 2, explanation: 'Very close to the modern 5.51 g/cm³.' },
      { question: 'Once G is known, how can we weigh the Sun?', options: ['From the Earth’s orbit: its size and the length of the year', 'From sunspots', 'From the Sun’s colour', 'It cannot be done'], answer: 0, explanation: 'GM = 4π²a³/T², with a = 1 AU and T = 1 year.' },
      { question: 'What is unusual about our knowledge of G today?', options: ['It is known to 20 decimal places', 'It is the least precisely known fundamental constant, and labs disagree', 'It was defined in 1983', 'It changes every year'], answer: 1, explanation: 'Different careful experiments disagree by several hundred parts per million.' },
      { question: 'Why did the Himalaya pull plumb lines in India less than expected?', options: ['They are hollow', 'Mountains have deep roots of lighter rock (isostasy)', 'The plumb lines were magnetic', 'The Earth is flat there'], answer: 1, explanation: 'Mountains float on denser rock below, like icebergs in water.' }
    ]);
  };
})();
