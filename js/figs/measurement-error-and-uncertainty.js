/* ==========================================================================
   RNLearn — Measurement, Error and Uncertainty (Making Sense of Data, Part 3)
   Figures:
     1. fig-uncert-timeline  The story at a glance (clickable timeline)
     2. fig-target           Accuracy and precision on a target
     3. fig-averaging        What averaging can and cannot do
     4. fig-budget           An uncertainty budget for a pendulum
     5. fig-propagation      Propagation: formula versus simulation
     6. fig-weighted-mean    The weighted mean and the Birge ratio
     7. fig-calibration-lod  Calibration curve, LOD and LOQ
     8. fig-quiz-d3          Test yourself
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
    { name: 'Errors and observers', color: '#b45309' },
    { name: 'Standards and constants', color: '#1d4ed8' },
    { name: 'A common language of uncertainty', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1796', icon: '🔭', era: 0, sec: 4, title: 'The sacked assistant', text: 'Astronomer Royal Nevil Maskelyne dismisses his assistant David Kinnebrook, whose star timings were consistently about 0.8 seconds later than his own.' },
    { year: '1823', icon: '👁️', era: 0, sec: 4, title: 'The personal equation', text: 'Friedrich Bessel shows that every observer has a characteristic systematic delay: the “personal equation”.' },
    { year: '1875', icon: '📏', era: 1, sec: 3, title: 'The Metre Convention', text: 'Seventeen nations sign the Metre Convention, creating an international system of standards for measurement.' },
    { year: '1929', icon: '⚛️', era: 1, sec: 11, title: 'Birge’s constants', text: 'Raymond Birge publishes the first systematic evaluation of the fundamental constants, combining measurements with weighted means.' },
    { year: '1968', icon: '🧪', era: 1, sec: 14, title: 'Detection limits', text: 'Lloyd Currie publishes a clear statistical framework for detection and quantification limits in chemical analysis.' },
    { year: '1980', icon: '🅰️', era: 2, sec: 7, title: 'Type A and Type B', text: 'An international working group recommends classifying uncertainty components as Type A (statistical) or Type B (other means).' },
    { year: '1993', icon: '📘', era: 2, sec: 8, title: 'The GUM', text: 'The <em>Guide to the Expression of Uncertainty in Measurement</em> gives the world a common method for evaluating uncertainty.' },
    { year: '1999', icon: '🚀', era: 2, sec: 17, title: 'Mars Climate Orbiter', text: 'A spacecraft is lost at Mars after one team’s software used pound-force seconds where another expected newton seconds.' },
    { year: '2008', icon: '🎲', era: 2, sec: 9, title: 'Monte Carlo propagation', text: 'A supplement to the GUM sets out how to propagate uncertainty by computer simulation.' },
    { year: '2019', icon: '🧭', era: 1, sec: 3, title: 'A new SI', text: 'The kilogram, ampere, kelvin and mole are redefined by fixing the values of fundamental constants.' }
  ];
  FIG['fig-uncert-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1796 to 2019');
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
  function newSVG(svgWrap, container, H, label) { svgWrap.innerHTML = ''; var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); return { W: W, svg: FIG.createSVG(svgWrap, W, H, label), fs: scaler(svgWrap, 360) }; }
  function sig(x, n) { if (x === 0 || !isFinite(x)) return String(x); var d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x)))); return fmt(x, d); }

  /* -----------------------------------------------------------------------
     Figure 2. Accuracy and precision: the target
     ----------------------------------------------------------------------- */
  FIG['fig-target'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var bias = 0, spread = 1, shots = [];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'tg-b', label: 'Systematic error (bias)', min: 0, max: 4, step: 0.1, value: bias, onChange: function (x) { bias = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'tg-s', label: 'Random error (scatter)', min: 0.1, max: 3, step: 0.05, value: spread, onChange: function (x) { spread = x; draw(); } });
    var row = group(controls, 'Try');
    [['Accurate and precise', 0, 0.3], ['Precise but biased', 3, 0.3], ['Unbiased but imprecise', 0, 2.2], ['Neither', 3, 2.2]].forEach(function (p) { btn(p[0], row).addEventListener('click', function () { bias = p[1]; spread = p[2]; s1.setValue(bias); s2.setValue(spread); draw(); }); });
    btn('New measurements', row).addEventListener('click', function () { gen(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function gen() { shots = []; for (var i = 0; i < 20; i++) shots.push([gauss(), gauss()]); }
    gen();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Target with twenty measurements'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(bias, 1)); valText(s2, fmt(spread, 2));
      var cx = W / 2, cy = 130, R = 115, k = R / 6;
      [6, 4.5, 3, 1.5].forEach(function (r, i) { el('circle', { cx: cx, cy: cy, r: r * k, fill: i % 2 ? c.sunken : c.surface, stroke: c.border }, svg); });
      el('circle', { cx: cx, cy: cy, r: 4, fill: RED }, svg);
      var pts = shots.map(function (s) { return [bias * 0.7071 + spread * s[0], bias * 0.7071 + spread * s[1]]; });
      pts.forEach(function (p) { el('circle', { cx: cx + p[0] * k, cy: cy - p[1] * k, r: 4.5, fill: BLUE, opacity: 0.8 }, svg); });
      var mx = mean(pts.map(function (p) { return p[0]; })), my = mean(pts.map(function (p) { return p[1]; }));
      el('path', { d: 'M' + (cx + mx * k - 7) + ' ' + (cy - my * k) + ' L' + (cx + mx * k + 7) + ' ' + (cy - my * k) + ' M' + (cx + mx * k) + ' ' + (cy - my * k - 7) + ' L' + (cx + mx * k) + ' ' + (cy - my * k + 7), stroke: AMBER, 'stroke-width': 3 }, svg);
      txt(svg, 8, 16, W < 560 ? 'Red: true value · blue: readings · cross: average' : 'Red dot: true value · blue: measurements · cross: their average', { anchor: 'start', size: fs(10), fill: c.muted });
      var off = Math.hypot(mx, my), sc = Math.sqrt((sdv(pts.map(function (p) { return p[0]; })) ** 2 + sdv(pts.map(function (p) { return p[1]; })) ** 2) / 2);
      var verdict = bias < 1 ? (spread <= 1 ? 'true and precise, so accurate' : 'true (unbiased) but imprecise, so single readings are not accurate') : (spread <= 1 ? 'precise but biased, so not accurate' : 'neither true nor precise');
      out.innerHTML = 'Distance of the average (cross) from the true value: <strong>' + fmt(off, 2) + '</strong> · scatter (SD): <strong>' + fmt(sc, 2) + '</strong>. These measurements are <strong>' + verdict + '</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Precision is about how tightly measurements cluster; trueness about whether their average is in the right place; accuracy needs both. Averaging more shots moves the cross closer to the centre of the cluster, but never removes the bias: a precise instrument can be precisely wrong.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Repeated measurements: what averaging can and cannot do
     ----------------------------------------------------------------------- */
  FIG['fig-averaging'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sigma = 0.5, bias = 0.3, N = 100, eps = [];
    for (var i = 0; i < 200; i++) eps.push(gauss());
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'av-s', label: 'Random error of one reading (SD)', min: 0.05, max: 1.5, step: 0.05, value: sigma, onChange: function (x) { sigma = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'av-b', label: 'Systematic error (offset)', min: 0, max: 1, step: 0.05, value: bias, onChange: function (x) { bias = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'av-n', label: 'Number of readings', min: 2, max: 200, step: 1, value: N, onChange: function (x) { N = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('New readings', row).addEventListener('click', function () { for (var i = 0; i < 200; i++) eps[i] = gauss(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Running mean of repeated readings'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(sigma, 2)); valText(s2, fmt(bias, 2)); valText(s3, String(N));
      var truth = 10, x = eps.slice(0, N).map(function (e) { return truth + bias + sigma * e; });
      var L = 44, R = W - 44, T = 22, B = 190, lo = truth - 1.6, hi = truth + 1.6;
      var X = function (k) { return L + (k - 1) / Math.max(1, N - 1) * (R - L); }, Y = function (v) { return B - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (B - T); };
      el('line', { x1: L, y1: Y(truth), x2: R, y2: Y(truth), stroke: RED, 'stroke-width': 1.5 }, svg);
      txt(svg, R + 4, Y(truth) - 2, 'true', { anchor: 'start', size: fs(10), fill: RED });
      txt(svg, R + 4, Y(truth) + 10, 'value', { anchor: 'start', size: fs(10), fill: RED });
      x.forEach(function (v, k) { el('circle', { cx: X(k + 1), cy: Y(v), r: 2.3, fill: c.faint }, svg); });
      var band = '', line = '', sum = 0, lower = [];
      x.forEach(function (v, k) { sum += v; var n = k + 1, m = sum / n, se = sigma / Math.sqrt(n); line += (line ? 'L' : 'M') + X(n).toFixed(1) + ' ' + Y(m).toFixed(1); band += (band ? 'L' : 'M') + X(n).toFixed(1) + ' ' + Y(m + se).toFixed(1); lower.push(X(n).toFixed(1) + ' ' + Y(m - se).toFixed(1)); });
      el('path', { d: band + ' L' + lower.reverse().join(' L') + ' Z', fill: BLUE, opacity: 0.15 }, svg);
      el('path', { d: line, fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      txt(svg, L - 4, Y(truth) + 4, '10.0', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, (L + R) / 2, B + 18, 'number of readings averaged', { size: fs(10), fill: c.muted });
      txt(svg, L, 14, W < 560 ? 'grey: readings · blue: running mean ± SE' : 'grey: single readings · blue: running mean ± its standard error', { anchor: 'start', size: fs(10), fill: c.muted });
      var m = mean(x), s = sdv(x), se = s / Math.sqrt(N);
      out.innerHTML = 'After ' + N + ' readings: mean <strong>' + fmt(m, 3) + '</strong>, SD <strong>' + fmt(s, 3) + '</strong>, standard error of the mean <strong>' + fmt(se, 3) + '</strong>. True value 10.000; the mean is off by ' + fmt(m - truth, 3) + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The SD (the scatter of single readings) does not shrink as you take more readings; the standard error of the mean does, as 1/√n. But the running mean settles on the true value <em>plus the offset</em>. Averaging fights random error, never systematic error, which must be found by calibration and thought, and included as a Type B uncertainty.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. The uncertainty budget
     ----------------------------------------------------------------------- */
  FIG['fig-budget'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    // pendulum: g = 4π² L / T² ; components expressed as relative contributions to u(g)/g
    var comp = [
      { n: 'Timing scatter, 20 swings (Type A)', u: 0.0250, unit: 's', how: '20-swing timings: SD 0.056 s of 5 timings ÷ √5', kind: 'A', sens: function (u) { return 2 * (u / 20) / 2.0028; }, max: 0.1 },
      { n: 'Reaction time, 20 swings (Type B)', u: 0.0577, unit: 's', how: 'per 20-swing timing: ±0.1 s, rectangular: 0.1/√3', kind: 'B', sens: function (u) { return 2 * (u / 20) / 2.0028; }, max: 0.15 },
      { n: 'Tape resolution (Type B)', u: 0.29, unit: 'mm', how: '±0.5 mm, rectangular: 0.5/√3', kind: 'B', sens: function (u) { return u / 1000 / 0.995; }, max: 2 },
      { n: 'Finding the bob’s centre (Type B)', u: 0.58, unit: 'mm', how: '±1 mm, rectangular: 1/√3', kind: 'B', sens: function (u) { return u / 1000 / 0.995; }, max: 3 },
      { n: 'Tape calibration (Type B)', u: 0.30, unit: 'mm', how: 'certificate: U = 0.6 mm (k = 2)', kind: 'B', sens: function (u) { return u / 1000 / 0.995; }, max: 2 }
    ];
    var controls = div('fig-controls', container), sliders = [];
    comp.forEach(function (cp, i) { sliders.push(FIG.slider(controls, { id: 'ub-' + i, label: cp.n, min: 0, max: cp.max, step: cp.max / 100, value: cp.u, onChange: function (x) { cp.u = x; draw(); } })); });
    var row = group(controls, 'Try');
    btn('Use a light gate (reaction time ±0.001 s)', row).addEventListener('click', function () { comp[1].u = 0.0006; sliders[1].setValue(0.0006); draw(); });
    btn('Reset', row).addEventListener('click', function () { [0.0250, 0.0577, 0.29, 0.58, 0.30].forEach(function (v, i) { comp[i].u = v; sliders[i].setValue(v); }); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), g = 9.7928, rel = comp.map(function (cp) { return cp.sens(cp.u); }), tot = Math.sqrt(rel.reduce(function (a, r) { return a + r * r; }, 0));
      comp.forEach(function (cp, i) { valText(sliders[i], sig(cp.u, 2) + '\u00a0' + cp.unit); });
      var A = newSVG(svgWrap, container, 40 + comp.length * 34, 'Contribution of each component to the variance'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 10, R = W - 70, narrow = W < 560;
      txt(svg, L, 14, 'Share of the total variance of g', { anchor: 'start', size: fs(10.5), fill: c.muted });
      comp.forEach(function (cp, i) {
        var share = tot ? rel[i] * rel[i] / (tot * tot) : 0, y = 28 + i * 34;
        txt(svg, L, y + 10, narrow ? cp.n.replace(/ \(Type [AB]\)/, '') : cp.n, { anchor: 'start', size: fs(10), fill: c.ink2 });
        el('rect', { x: L, y: y + 14, width: R - L, height: 12, fill: c.sunken, rx: 3 }, svg);
        el('rect', { x: L, y: y + 14, width: Math.max(1, share * (R - L)), height: 12, fill: cp.kind === 'A' ? BLUE : AMBER, rx: 3 }, svg);
        txt(svg, R + 6, y + 24, fmt(share * 100, 1) + '%', { anchor: 'start', size: fs(10.5), weight: 700, fill: c.ink });
      });
      var ug = g * tot;
      out.innerHTML = 'g = 4π²L/T² = <strong>9.793 m/s²</strong>. Combined standard uncertainty u(g) = <strong>' + sig(ug, 2) + ' m/s²</strong> (relative ' + fmt(tot * 100, 2) + '%). Expanded uncertainty U = 2u = <strong>' + sig(2 * ug, 2) + ' m/s²</strong> (k = 2, about 95%).' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Components combine as the square root of the sum of squares, so the largest one dominates: here the reaction-time bias of a hand-held stopwatch. Improving the tape measure would achieve almost nothing; a light gate transforms the result. An uncertainty budget tells you where to spend your effort. Blue: Type A; orange: Type B.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Propagation of uncertainty: formula vs Monte Carlo
     ----------------------------------------------------------------------- */
  var FORMS = [
    { n: 'Sum: a + b', f: function (a, b) { return a + b; }, lin: function (a, b, ua, ub) { return Math.sqrt(ua * ua + ub * ub); }, rule: 'u = √(u<sub>a</sub>² + u<sub>b</sub>²): absolute uncertainties add in quadrature.' },
    { n: 'Difference: a − b', f: function (a, b) { return a - b; }, lin: function (a, b, ua, ub) { return Math.sqrt(ua * ua + ub * ub); }, rule: 'Same as for a sum. Beware: the difference of two nearly equal values can have a huge relative uncertainty.' },
    { n: 'Product: a × b', f: function (a, b) { return a * b; }, lin: function (a, b, ua, ub) { return Math.abs(a * b) * Math.sqrt(Math.pow(ua / a, 2) + Math.pow(ub / b, 2)); }, rule: 'u/q = √((u<sub>a</sub>/a)² + (u<sub>b</sub>/b)²): relative uncertainties add in quadrature.' },
    { n: 'Quotient: a ÷ b', f: function (a, b) { return a / b; }, lin: function (a, b, ua, ub) { return Math.abs(a / b) * Math.sqrt(Math.pow(ua / a, 2) + Math.pow(ub / b, 2)); }, rule: 'Same relative rule as for a product. Large relative uncertainty in b makes the result skewed.' },
    { n: 'Power: a²', f: function (a) { return a * a; }, lin: function (a, b, ua) { return Math.abs(2 * a * ua); }, rule: 'u/q = 2 × u<sub>a</sub>/a: the relative uncertainty is multiplied by the exponent.' }
  ];
  FIG['fig-propagation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var fi = 3, a = 10, b = 4, ua = 0.5, ub = 0.4, sims = [];
    var controls = div('fig-controls', container);
    choice(controls, 'Formula', FORMS.map(function (f) { return f.n; }), fi, function (i) { fi = i; run(); });
    var sa = FIG.slider(controls, { id: 'pr-a', label: 'a', min: 1, max: 20, step: 0.1, value: a, onChange: function (x) { a = x; run(); } });
    var sua = FIG.slider(controls, { id: 'pr-ua', label: 'uncertainty of a', min: 0, max: 5, step: 0.05, value: ua, onChange: function (x) { ua = x; run(); } });
    var sb = FIG.slider(controls, { id: 'pr-b', label: 'b', min: 0.5, max: 20, step: 0.1, value: b, onChange: function (x) { b = x; run(); } });
    var sub = FIG.slider(controls, { id: 'pr-ub', label: 'uncertainty of b', min: 0, max: 5, step: 0.05, value: ub, onChange: function (x) { ub = x; run(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function run() { sims = []; var F = FORMS[fi]; for (var i = 0; i < 20000; i++) sims.push(F.f(a + ua * gauss(), b + ub * gauss())); draw(); }
    function draw() {
      var c = C(), F = FORMS[fi], q = F.f(a, b), u = F.lin(a, b, ua, ub);
      valText(sa, fmt(a, 1)); valText(sua, fmt(ua, 2)); valText(sb, fi === 4 ? '(not used)' : fmt(b, 1)); valText(sub, fi === 4 ? '–' : fmt(ub, 2));
      var A = newSVG(svgWrap, container, 210, 'Monte Carlo distribution of the result'), W = A.W, svg = A.svg, fs = A.fs;
      var srt = sims.slice().sort(function (x, y) { return x - y; }), lo = srt[Math.floor(0.002 * srt.length)], hi = srt[Math.floor(0.998 * srt.length)];
      if (!(hi > lo)) { lo = q - 1; hi = q + 1; }
      var L = 10, R = W - 10, T = 20, B = 170, nb = 50, w = (hi - lo) / nb, cnt = new Array(nb).fill(0);
      sims.forEach(function (v) { var k = Math.floor((v - lo) / w); if (k >= 0 && k < nb) cnt[k]++; });
      var dens = cnt.map(function (k) { return k / (sims.length * w); }), pk = u > 0 ? 1 / (u * Math.sqrt(2 * Math.PI)) : 0, mx = Math.max(Math.max.apply(null, dens), pk) * 1.05 || 1;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - v / mx * (B - T); };
      dens.forEach(function (d, k) { el('rect', { x: X(lo + k * w) + 0.5, y: Y(d), width: Math.max(1, (R - L) / nb - 1), height: B - Y(d), fill: BLUE, opacity: 0.6 }, svg); });
      if (u > 0) { var p = ''; for (var x = lo; x <= hi; x += (hi - lo) / 200) p += (p ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(pk * Math.exp(-0.5 * Math.pow((x - q) / u, 2))).toFixed(1); el('path', { d: p, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg); }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      [lo, q, hi].forEach(function (v, i) { txt(svg, X(v), B + 15, sig(v, 3), { size: fs(10), fill: c.muted, anchor: i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }); });
      txt(svg, L, 14, W < 560 ? 'Blue: simulation · red: formula' : 'Blue: 20,000 simulated results · red: normal curve from the formula', { anchor: 'start', size: fs(10), fill: c.muted });
      var ms = mean(sims), ss = sdv(sims), skew = 0; sims.forEach(function (v) { skew += Math.pow((v - ms) / ss, 3); }); skew /= sims.length;
      out.innerHTML = 'Result: <strong>' + sig(q, 4) + '</strong>. Uncertainty from the formula: <strong>' + sig(u, 3) + '</strong> · from Monte Carlo: <strong>' + sig(ss, 3) + '</strong> (simulated mean ' + sig(ms, 4) + ', skewness ' + fmt(skew, 2) + ').<br>' + F.rule +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The formula assumes small uncertainties and a nearly linear function. Push the relative uncertainty of b towards 30% in a quotient and the simulated distribution becomes skewed, its mean shifts, and the formula underestimates the spread. Monte Carlo simulation handles such cases. Independent, normally distributed inputs assumed.</span>';
    }
    run();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Weighted mean and consistency
     ----------------------------------------------------------------------- */
  var WM_SETS = [
    { n: 'Four consistent labs', x: [9.807, 9.815, 9.801, 9.812], u: [0.004, 0.006, 0.005, 0.003] },
    { n: 'One discrepant lab', x: [9.807, 9.815, 9.801, 9.812, 9.840], u: [0.004, 0.006, 0.005, 0.003, 0.004] },
    { n: 'One very precise lab', x: [9.807, 9.815, 9.801, 9.8095], u: [0.004, 0.006, 0.005, 0.0008] }
  ];
  FIG['fig-weighted-mean'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var si = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Measurements of g (m/s²)', WM_SETS.map(function (s) { return s.n; }), 0, function (i) { si = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), S = WM_SETS[si], n = S.x.length, w = S.u.map(function (u) { return 1 / (u * u); }), sw = w.reduce(function (a, v) { return a + v; }, 0);
      var xw = S.x.reduce(function (a, v, i) { return a + w[i] * v; }, 0) / sw, uw = 1 / Math.sqrt(sw), chi2 = S.x.reduce(function (a, v, i) { return a + w[i] * (v - xw) * (v - xw); }, 0), birge = Math.sqrt(chi2 / (n - 1));
      var A = newSVG(svgWrap, container, 40 + n * 30 + 30, 'Measurements with error bars and their weighted mean'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 70, R = W - 16, lo = 9.78, hi = 9.85, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      el('rect', { x: X(xw - uw), y: 18, width: Math.max(1, X(xw + uw) - X(xw - uw)), height: n * 30 + 10, fill: GREEN, opacity: 0.18 }, svg);
      el('line', { x1: X(xw), y1: 18, x2: X(xw), y2: n * 30 + 28, stroke: GREEN, 'stroke-width': 2 }, svg);
      S.x.forEach(function (v, i) {
        var y = 34 + i * 30;
        el('line', { x1: X(v - S.u[i]), y1: y, x2: X(v + S.u[i]), y2: y, stroke: BLUE, 'stroke-width': 2 }, svg);
        [v - S.u[i], v + S.u[i]].forEach(function (e) { el('line', { x1: X(e), y1: y - 5, x2: X(e), y2: y + 5, stroke: BLUE, 'stroke-width': 2 }, svg); });
        el('circle', { cx: X(v), cy: y, r: 4, fill: BLUE }, svg);
        txt(svg, 8, y + 4, 'Lab ' + (i + 1), { anchor: 'start', size: fs(10.5), fill: c.ink2 });
      });
      [9.79, 9.81, 9.83, 9.85].forEach(function (v) { txt(svg, X(v), n * 30 + 50, fmt(v, 2), { size: fs(10), fill: c.muted }); });
      txt(svg, L, 12, 'green: weighted mean ± its uncertainty', { anchor: 'start', size: fs(10), fill: GREEN });
      out.innerHTML = 'Weighted mean <strong>' + fmt(xw, 4) + ' ± ' + fmt(uw, 4) + ' m/s²</strong> · χ² = ' + fmt(chi2, 1) + ' for ' + (n - 1) + ' degrees of freedom · Birge ratio = <strong>' + fmt(birge, 2) + '</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (birge > 2 ? 'A Birge ratio well above 1 means the measurements disagree by more than their stated uncertainties allow: at least one has an unrecognised systematic error. Averaging them blindly gives a falsely precise result; investigate first.' : si === 2 ? 'Weights are 1/u², so a lab ten times more precise counts a hundred times more. The weighted mean is pulled almost onto it, and its uncertainty is barely smaller than that lab’s own.' : 'A Birge ratio near 1 means the scatter between labs matches their stated uncertainties: the results are consistent, and the weighted mean is more precise than any single one.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Calibration curve and detection limit
     ----------------------------------------------------------------------- */
  FIG['fig-calibration-lod'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var noise = 0.02, sample = 0.45, eps = [], blanks = [];
    for (var i = 0; i < 7; i++) eps.push(gauss());
    for (i = 0; i < 10; i++) blanks.push(gauss());
    var std = [0, 1, 2, 4, 6, 8, 10];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cl-n', label: 'Instrument noise (SD of signal)', min: 0.005, max: 0.1, step: 0.005, value: noise, onChange: function (x) { noise = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'cl-s', label: 'Signal measured for the unknown sample', min: 0, max: 1.1, step: 0.005, value: sample, onChange: function (x) { sample = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('Repeat the calibration', row).addEventListener('click', function () { for (var i = 0; i < 7; i++) eps[i] = gauss(); for (i = 0; i < 10; i++) blanks[i] = gauss(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), slope0 = 0.1, icpt0 = 0.02, y = std.map(function (x, i) { return icpt0 + slope0 * x + noise * eps[i]; });
      valText(s1, fmt(noise, 3)); valText(s2, fmt(sample, 3));
      var n = std.length, mx = mean(std), my = mean(y), sxx = 0, sxy = 0; std.forEach(function (x, i) { sxx += (x - mx) * (x - mx); sxy += (x - mx) * (y[i] - my); });
      var b = sxy / sxx, a = my - b * mx, sres = Math.sqrt(y.reduce(function (s, v, i) { return s + Math.pow(v - (a + b * std[i]), 2); }, 0) / (n - 2));
      var sb = sdv(blanks.map(function (e) { return noise * e; })), lod = 3 * sb / b, loq = 10 * sb / b, conc = (sample - a) / b;
      var A = newSVG(svgWrap, container, 240, 'Calibration curve'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 46, R = W - 14, T = 18, B = 200, X = function (v) { return L + v / 11 * (R - L); }, Y = function (v) { return B - (v + 0.05) / 1.2 * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg); el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      el('rect', { x: X(0), y: T, width: Math.max(1, X(Math.min(11, loq)) - X(0)), height: B - T, fill: AMBER, opacity: 0.12 }, svg);
      el('rect', { x: X(0), y: T, width: Math.max(1, X(Math.min(11, lod)) - X(0)), height: B - T, fill: RED, opacity: 0.15 }, svg);
      el('line', { x1: X(0), y1: Y(a), x2: X(11), y2: Y(a + 11 * b), stroke: BLUE, 'stroke-width': 2 }, svg);
      std.forEach(function (x, i) { el('circle', { cx: X(x), cy: Y(y[i]), r: 4.5, fill: BLUE }, svg); });
      if (conc > -0.5 && conc < 11) {
        el('line', { x1: L, y1: Y(sample), x2: X(conc), y2: Y(sample), stroke: GREEN, 'stroke-dasharray': '4 3' }, svg);
        el('line', { x1: X(conc), y1: Y(sample), x2: X(conc), y2: B, stroke: GREEN, 'stroke-dasharray': '4 3' }, svg);
        el('circle', { cx: X(conc), cy: Y(sample), r: 5, fill: GREEN }, svg);
      }
      [0, 2, 4, 6, 8, 10].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      [0, 0.5, 1].forEach(function (v) { txt(svg, L - 5, Y(v) + 4, fmt(v, 1), { anchor: 'end', size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'concentration of standard (mg/L)', { size: fs(10), fill: c.muted });
      txt(svg, L + 4, T + 10, 'signal (absorbance)', { anchor: 'start', size: fs(10), fill: c.muted });
      var verdict = conc < lod ? 'below the limit of detection: report “not detected (&lt; ' + fmt(lod, 2) + ' mg/L)”' : conc < loq ? 'detected, but below the limit of quantification: present, but the number is too uncertain to report with confidence' : 'above the limit of quantification: report the concentration with its uncertainty';
      out.innerHTML = 'Fitted line: signal = ' + fmt(a, 3) + ' + ' + fmt(b, 4) + ' × concentration (residual SD ' + fmt(sres, 3) + '). Blank SD from 10 blanks: ' + fmt(sb, 4) + '.<br>' +
        'Limit of detection (3σ/slope): <strong>' + fmt(lod, 2) + ' mg/L</strong> · limit of quantification (10σ/slope): <strong>' + fmt(loq, 2) + ' mg/L</strong>. Unknown sample: <strong>' + fmt(conc, 2) + ' mg/L</strong>, ' + verdict + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">A calibration curve converts an instrument’s signal into the quantity you want, using standards of known value. Read it “backwards” for an unknown sample (green). Noisier instruments have higher detection limits: red shading marks below the LOD, orange below the LOQ. (Simulated data; Part 7 covers fitting lines properly.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is the difference between error and uncertainty?', options: ['They are the same', 'Error is the (unknown) difference from the true value; uncertainty quantifies our doubt about the result', 'Uncertainty is a mistake', 'Error is always smaller'], answer: 1, explanation: 'We can never know the error exactly, but we can estimate the uncertainty.' },
      { question: 'A balance always reads 0.3 g too high. This is…', options: ['A random error', 'A systematic error', 'An uncertainty of 0.3 g', 'A blunder'], answer: 1, explanation: 'It affects every reading in the same way, so averaging cannot remove it.' },
      { question: 'Repeated measurements cluster tightly, but far from the true value. They are…', options: ['Accurate and precise', 'Precise but not accurate (biased)', 'Accurate but not precise', 'Neither precise nor accurate'], answer: 1, explanation: 'Precision is about scatter; trueness about bias; accuracy needs both.' },
      { question: 'You take 25 readings instead of 4. The standard error of the mean…', options: ['Stays the same', 'Falls to 2/5 of its value', 'Falls to 4/25', 'Doubles'], answer: 1, explanation: 'It scales as 1/√n: √(4/25) = 2/5.' },
      { question: 'A digital display shows readings to 0.01 V. The standard uncertainty from rounding is about…', options: ['0.01 V', '0.005 V', '0.0029 V', '0.1 V'], answer: 2, explanation: 'A rectangular distribution ±0.005 V gives 0.005/√3 ≈ 0.0029 V (equivalently 0.01/√12).' },
      { question: 'Two independent uncertainties, 3 and 4 units, combine to…', options: ['7', '5', '1', '12'], answer: 1, explanation: '√(3² + 4²) = 5. Independent uncertainties add in quadrature.' },
      { question: 'Area = length × width. Length has 1% relative uncertainty, width 2%. The area’s relative uncertainty is about…', options: ['3%', '2.2%', '1.5%', '2%'], answer: 1, explanation: '√(1² + 2²) ≈ 2.24%: relative uncertainties add in quadrature for products.' },
      { question: 'The period T of a pendulum has 0.5% relative uncertainty. g ∝ 1/T² has relative uncertainty…', options: ['0.25%', '0.5%', '1%', '2%'], answer: 2, explanation: 'Powers multiply the relative uncertainty by the exponent: 2 × 0.5% = 1%.' },
      { question: 'How should a result usually be reported?', options: ['g = 9.79283 ± 0.0315542 m/s²', 'g = 9.793 ± 0.032 m/s²', 'g = 9.8 ± 0.031554 m/s²', 'g = 10 m/s²'], answer: 1, explanation: 'Give the uncertainty to one or two significant figures and round the value to match.' },
      { question: 'Measurements from five labs disagree far more than their uncertainties allow (Birge ratio 3). What should you do?', options: ['Average them anyway', 'Suspect unrecognised systematic errors and investigate before combining', 'Keep only the lab you like', 'Report the smallest uncertainty'], answer: 1, explanation: 'Inconsistent data signal a problem that a weighted mean would hide.' }
    ]);
  };
})();
