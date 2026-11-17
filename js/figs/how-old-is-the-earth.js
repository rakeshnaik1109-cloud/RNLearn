/* ==========================================================================
   RNLearn — How Old Is the Earth? (How We Measured the Universe, Part 7)
   Figures:
     1. fig-age-timeline        The story at a glance (clickable timeline)
     2. fig-salt-clock          The salt clock
     3. fig-kelvin-cooling      Kelvin's cooling Earth
     4. fig-radioactive-clock   A radioactive clock
     5. fig-coin-decay          Radioactive decay with coins
     6. fig-quiz-m7             Test yourself
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
    { name: 'Texts and rocks', color: '#b45309' },
    { name: 'Physics: salt and heat', color: '#1d4ed8' },
    { name: 'Radioactive clocks', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1650', icon: '📜', era: 0, sec: 3, title: 'Ussher’s chronology', text: 'Archbishop James Ussher adds up the generations of the Bible and dates creation to 4004 BC.' },
    { year: '1715', icon: '🌊', era: 1, sec: 6, title: 'Halley’s salty sea', text: 'Edmond Halley suggests that the saltiness of the sea, built up by rivers, could reveal the Earth’s age.' },
    { year: '1778', icon: '🔥', era: 1, sec: 5, title: 'Buffon’s cooling balls', text: 'Buffon heats iron balls and times their cooling; scaled up to the Earth, he gets about 75,000 years.' },
    { year: '1788', icon: '🪨', era: 0, sec: 4, title: 'Hutton’s deep time', text: 'James Hutton finds “no vestige of a beginning, no prospect of an end” in the rocks.' },
    { year: '1862', icon: '🌡️', era: 1, sec: 7, title: 'Kelvin’s cooling Earth', text: 'William Thomson (Lord Kelvin) calculates how long the Earth has been cooling: about 100 million years, perhaps 20 to 400.' },
    { year: '1896', icon: '☢️', era: 2, sec: 8, title: 'Radioactivity', text: 'Henri Becquerel discovers that uranium gives off rays. Radioactive atoms turn out to release heat and to change into other elements.' },
    { year: '1899', icon: '🧂', era: 1, sec: 6, title: 'Joly’s salt clock', text: 'John Joly estimates from the sodium in the oceans that they are about 90–100 million years old.' },
    { year: '1907', icon: '⚗️', era: 2, sec: 9, title: 'Lead from uranium', text: 'Bertram Boltwood dates minerals by the lead that uranium has turned into: up to 2.2 billion years.' },
    { year: '1913', icon: '📘', era: 2, sec: 10, title: 'Holmes’s Age of the Earth', text: 'Arthur Holmes uses radioactive dating to show that some rocks are at least 1.6 billion years old.' },
    { year: '1956', icon: '☄️', era: 2, sec: 11, title: 'Patterson’s meteorite', text: 'Clair Patterson measures lead in meteorites and finds the age of the Earth: 4.55 billion years.' },
    { year: '2001', icon: '💎', era: 2, sec: 12, title: 'The oldest crystal', text: 'A tiny zircon crystal from Jack Hills in Western Australia is dated to 4.4 billion years.' },
    { year: '2012', icon: '🌌', era: 2, sec: 12, title: 'The first solids', text: 'The oldest grains in meteorites, the first solids of the solar system, are dated to 4,567 million years.' }
  ];
  FIG['fig-age-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1650 to 2012');
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
  var YEAR = 3.15576e7;
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) {
      var b = btn(it, row); bs.push(b);
      b.addEventListener('click', function () { setOn(i); onPick(i); });
      if (i === initial) { b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); }
    });
    function setOn(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    row.setOn = setOn;
    return row;
  }
  function years(y) {
    if (y >= 1e9) return fmt(y / 1e9, y >= 1e10 ? 1 : 2) + ' billion years';
    if (y >= 1e6) return fmt(y / 1e6, y >= 1e7 ? 0 : 1) + ' million years';
    return fmt(y, 0) + ' years';
  }

  /* -----------------------------------------------------------------------
     Figure 2. The salt clock
     ----------------------------------------------------------------------- */
  FIG['fig-salt-clock'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var stock = 1.4, input = 1.6, loss = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sc-stock', label: 'Sodium dissolved in all the oceans (× 10¹⁶ tonnes)', min: 0.5, max: 3, step: 0.05, value: stock, onChange: function (v) { stock = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'sc-in', label: 'Sodium brought by rivers each year (× 10⁸ tonnes)', min: 0.5, max: 5, step: 0.05, value: input, onChange: function (v) { input = v; draw(); } });
    choice(controls, 'Does salt ever leave the sea?', ['No (Joly’s assumption)', 'Yes, as fast as it arrives'], 0, function (i) { loss = i; draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), age = stock * 1e16 / (input * 1e8);
      valText(s1, fmt(stock, 2)); valText(s2, fmt(input, 2));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 200, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Salt building up in the sea over time');
      var L = 40, R = W - 14, T = 18, B = H - 34, tmax = 300e6;
      var X = function (t) { return L + t / tmax * (R - L); }, Y = function (s) { return B - s / 3e16 * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      [0, 100, 200, 300].forEach(function (m) { txt(svg, X(m * 1e6), B + 15, String(m), { size: fs(10), fill: c.muted, anchor: m === 300 ? 'end' : 'middle' }); });
      txt(svg, (L + R) / 2, H - 4, 'millions of years after the oceans formed', { size: fs(10), fill: c.muted });
      txt(svg, L + 4, T - 4, 'sodium in the sea', { anchor: 'start', size: fs(10), fill: c.muted });
      el('line', { x1: L, y1: Y(stock * 1e16), x2: R, y2: Y(stock * 1e16), stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      txt(svg, R - 4, Y(stock * 1e16) - 5, 'today', { anchor: 'end', size: fs(10), fill: c.muted });
      var d = '', tau = age;
      for (var t = 0; t <= tmax; t += tmax / 150) {
        var s = loss ? stock * 1e16 * (1 - Math.exp(-t / tau)) : input * 1e8 * t;
        if (s > 3e16) { d += 'L' + X(3e16 / (input * 1e8)).toFixed(1) + ' ' + Y(3e16).toFixed(1); break; }
        d += (d ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(s).toFixed(1);
      }
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 2.4 }, svg);
      if (!loss && age <= tmax) el('circle', { cx: X(age), cy: Y(stock * 1e16), r: 6, fill: c.warn, stroke: c.surface, 'stroke-width': 2 }, svg);
      read.innerHTML = (loss ?
        'If salt leaves the sea (trapped in sediments and rocks, or blown ashore as spray) as fast as rivers bring it, the saltiness levels off. The ' + years(age) + ' you get from the salt clock is then only the average time a sodium atom stays in the sea (its <strong>residence time</strong>), not the age of the oceans.' :
        'Age of the oceans = sodium in the sea ÷ sodium added each year = <strong>' + years(age) + '</strong>.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Joly’s figures gave about 90 million years. The oceans are in fact about 4 billion years old: salt is removed about as fast as it arrives, so the salt clock really measures how long salt stays, not how long the sea has existed. Illustrative values.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Kelvin's cooling Earth
     ----------------------------------------------------------------------- */
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  FIG['fig-kelvin-cooling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T0 = 3870, grad = 36.5, kap = 1.18;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'kc-t0', label: 'Starting temperature of the molten Earth', min: 1000, max: 7000, step: 10, value: T0, onChange: function (v) { T0 = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'kc-g', label: 'How fast rocks warm with depth today', min: 10, max: 60, step: 0.5, value: grad, onChange: function (v) { grad = v; draw(); } });
    var s3 = FIG.slider(controls, { id: 'kc-k', label: 'Rock’s thermal diffusivity (× 10⁻⁶ m²/s)', min: 0.4, max: 2, step: 0.01, value: kap, onChange: function (v) { kap = v; draw(); } });
    var row = group(controls, 'Try');
    btn('Kelvin, 1862', row).addEventListener('click', function () { T0 = 3870; grad = 36.5; kap = 1.18; s1.setValue(T0); s2.setValue(grad); s3.setValue(kap); draw(); });
    btn('A cooler start', row).addEventListener('click', function () { T0 = 2000; s1.setValue(T0); draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), G = grad / 1000, k = kap * 1e-6;
      valText(s1, fmt(T0, 0) + ' °C'); valText(s2, fmt(grad, 1) + ' °C per km'); valText(s3, fmt(kap, 2));
      var tsec = T0 * T0 / (Math.PI * k * G * G), ty = tsec / YEAR;
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 220, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Temperature inside a cooling Earth');
      var L = 46, R = W - 14, T = 22, B = H - 34, zmax = 300; // km
      var X = function (z) { return L + z / zmax * (R - L); }, Y = function (tc) { return B - tc / 7000 * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      [0, 2000, 4000, 6000].forEach(function (v) { txt(svg, L - 5, Y(v) + 4, fmt(v, 0), { anchor: 'end', size: fs(10), fill: c.muted }); });
      [0, 100, 200, 300].forEach(function (z) { txt(svg, X(z), B + 15, String(z), { size: fs(10), fill: c.muted, anchor: z === 300 ? 'end' : 'middle' }); });
      txt(svg, (L + R) / 2, H - 4, 'depth below the surface (km)', { size: fs(10), fill: c.muted });
      txt(svg, L + 4, T - 8, 'temperature (°C) after ' + years(ty), { anchor: 'start', size: fs(10.5), fill: c.muted });
      var d = '', s = 2 * Math.sqrt(k * tsec) / 1000; // km
      for (var z = 0; z <= zmax; z += 2) d += (d ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(T0 * erf(z / s)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.warn, 'stroke-width': 2.4 }, svg);
      el('line', { x1: X(0), y1: Y(0), x2: X(Math.min(zmax, 7000 / grad)), y2: Y(Math.min(7000, grad * zmax)), stroke: c.accent, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, X(18), Y(Math.min(6500, grad * 18)) - 8, 'today’s surface gradient', { anchor: 'start', size: fs(10), fill: c.accent });
      read.innerHTML = 'For the surface to warm by ' + fmt(grad, 1) + ' °C per km of depth, the Earth must have been cooling for <strong>' + years(ty) + '</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Kelvin’s formula: age = (starting temperature)² ÷ (π × diffusivity × gradient²). A young Earth would still be hot close to the surface, with a steep gradient; an old one has cooled to a gentle gradient. Kelvin assumed heat escapes only by conduction through solid rock. In fact the hot interior flows slowly (convection), carrying heat up to just below the surface, which allows a far older Earth with the same surface gradient.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. A radioactive clock
     ----------------------------------------------------------------------- */
  var ISO = [
    { n: 'Uranium-238 → lead-206', p: 'uranium-238', d: 'lead-206', h: 4.468e9 },
    { n: 'Uranium-235 → lead-207', p: 'uranium-235', d: 'lead-207', h: 7.04e8 },
    { n: 'Rubidium-87 → strontium-87', p: 'rubidium-87', d: 'strontium-87', h: 4.97e10 },
    { n: 'Carbon-14 → nitrogen-14', p: 'carbon-14', d: 'nitrogen-14', h: 5730 }
  ];
  FIG['fig-radioactive-clock'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var iso = 0, frac = 0.5;
    var controls = div('fig-controls', container);
    choice(controls, 'Radioactive clock', ISO.map(function (x) { return x.n; }), iso, function (i) { iso = i; draw(); });
    var sl = FIG.slider(controls, { id: 'rc-f', label: 'Fraction of the original parent atoms still left', min: 1, max: 100, step: 0.5, value: frac * 100, onChange: function (v) { frac = v / 100; draw(); } });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), x = ISO[iso], n = Math.log(1 / frac) / Math.LN2, age = n * x.h, ratio = (1 - frac) / frac;
      valText(sl, fmt(frac * 100, frac < 0.1 ? 1 : 0) + '%');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 220, fs = scaler(svgWrap, 420);
      var svg = FIG.createSVG(svgWrap, W, H, 'Parent and daughter atoms over time');
      var L = 40, R = W - 14, T = 22, B = H - 34, nmax = 7;
      var X = function (k) { return L + k / nmax * (R - L); }, Y = function (f) { return B - f * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      for (var k = 0; k <= nmax; k++) txt(svg, X(k), B + 15, String(k), { size: fs(10), fill: c.muted });
      txt(svg, (L + R) / 2, H - 4, 'time in half-lives (one half-life = ' + years(x.h) + ')', { size: fs(10), fill: c.muted });
      ['0', '50%', '100%'].forEach(function (s, i) { txt(svg, L - 5, Y(i / 2) + 4, s, { anchor: 'end', size: fs(10), fill: c.muted }); });
      var dp = '', dd = '';
      for (var t = 0; t <= nmax; t += 0.05) { var f = Math.pow(0.5, t); dp += (dp ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(f).toFixed(1); dd += (dd ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(1 - f).toFixed(1); }
      el('path', { d: dp, fill: 'none', stroke: c.accent, 'stroke-width': 2.4 }, svg);
      el('path', { d: dd, fill: 'none', stroke: c.warn, 'stroke-width': 2.4 }, svg);
      var nx = Math.min(nmax, n);
      el('line', { x1: X(nx), y1: T, x2: X(nx), y2: B, stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
      el('circle', { cx: X(nx), cy: Y(frac), r: 5.5, fill: c.accent }, svg);
      el('circle', { cx: X(nx), cy: Y(1 - frac), r: 5.5, fill: c.warn }, svg);
      txt(svg, R - 4, T + (B - T) * 0.45, 'parent: ' + x.p, { anchor: 'end', size: fs(10.5), fill: c.accent, weight: 600 });
      txt(svg, R - 4, T + (B - T) * 0.45 + 16, 'daughter: ' + x.d, { anchor: 'end', size: fs(10.5), fill: c.warn, weight: 600 });
      read.innerHTML = fmt(frac * 100, frac < 0.1 ? 1 : 0) + '% of the ' + x.p + ' is left, so <strong>' + fmt(n, 2) + ' half-lives</strong> have passed: age = <strong>' + years(age) + '</strong>.' +
        (iso < 3 ? ' There are now ' + fmt(ratio, ratio < 10 ? 2 : 0) + ' atoms of ' + x.d + ' for every atom of ' + x.p + ' (if the mineral started with none).' : '') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (iso === 3 ? 'Carbon-14 dates things that were once alive, up to about 50,000 years old. It is useless for rocks billions of years old: after 10 half-lives, less than 0.1% is left.' : age > 4.6e9 ? 'Older than the Earth itself! No mineral on Earth gives an age above about 4.4 billion years.' : 'Age = half-life × log₂(original amount ÷ amount left). Geologists measure the ratio of daughter to parent atoms in a mineral, and need it to have kept all its atoms since it formed.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Half-life with coins
     ----------------------------------------------------------------------- */
  FIG['fig-coin-decay'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 200, alive, history;
    function reset() { alive = []; for (var i = 0; i < N; i++) alive.push(true); history = [N]; }
    reset();
    var controls = div('fig-controls', container);
    var row = group(controls, 'Actions');
    btn('Toss all the coins left', row).addEventListener('click', function () { toss(); draw(); });
    btn('Toss until none are left', row).addEventListener('click', function () { var g = 0; while (history[history.length - 1] > 0 && g++ < 40) toss(); draw(); });
    btn('Start again', row).addEventListener('click', function () { reset(); draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function toss() {
      var left = 0;
      for (var i = 0; i < N; i++) if (alive[i]) { if (Math.random() < 0.5) alive[i] = false; else left++; }
      history.push(left);
    }
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, fs = scaler(svgWrap, 420);
      var gw = narrow ? W - 20 : W * 0.45, cols = 20, cell = gw / cols, gh = cell * 10, H = narrow ? gh + 210 : Math.max(gh + 30, 220);
      var svg = FIG.createSVG(svgWrap, W, H, 'Coins remaining after each toss');
      for (var i = 0; i < N; i++) {
        var x = 10 + (i % cols) * cell + cell / 2, y = 20 + Math.floor(i / cols) * cell + cell / 2;
        el('circle', { cx: x, cy: y, r: cell * 0.38, fill: alive[i] ? '#d4a017' : c.sunken, stroke: alive[i] ? '#a16207' : c.border }, svg);
      }
      txt(svg, 10, 13, 'Gold: tails so far (not yet "decayed")', { anchor: 'start', size: fs(10), fill: c.muted });
      var gx = narrow ? 48 : W * 0.53, gy = narrow ? gh + 60 : 26, pw = narrow ? W - 54 : W * 0.45 - 30, ph = narrow ? 130 : H - 70, rounds = Math.max(8, history.length - 1);
      var X = function (r) { return gx + 8 + r / rounds * (pw - 8); }, Y = function (v) { return gy + ph - v / N * ph; };
      el('line', { x1: gx, y1: gy + ph, x2: gx + pw, y2: gy + ph, stroke: c.border }, svg);
      el('line', { x1: gx, y1: gy, x2: gx, y2: gy + ph, stroke: c.border }, svg);
      var d = '';
      for (var r = 0; r <= rounds; r += 0.1) d += (d ? 'L' : 'M') + X(r).toFixed(1) + ' ' + Y(N * Math.pow(0.5, r)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.faint, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      history.forEach(function (v, k) {
        var bw = Math.max(3, pw / rounds * 0.5);
        el('rect', { x: X(k) - bw / 2, y: Y(v), width: bw, height: gy + ph - Y(v), fill: c.accent, opacity: 0.8 }, svg);
      });
      txt(svg, gx, gy - 8, 'Coins left after each toss', { anchor: 'start', size: fs(10.5), fill: c.muted });
      txt(svg, gx - 5, Y(N) + 4, String(N), { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, gx - 5, Y(0) + 4, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, gx + pw / 2, gy + ph + 20, narrow ? 'tosses (dashed: exact halving)' : 'number of tosses (dashed: exactly half each time)', { size: fs(10), fill: c.muted });
      var last = history[history.length - 1];
      read.innerHTML = 'After <strong>' + (history.length - 1) + '</strong> toss' + (history.length === 2 ? '' : 'es') + ', <strong>' + last + '</strong> of ' + N + ' coins are left.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Each coin has the same 50% chance of "decaying" (landing heads) at every toss, however long it has survived. Nobody can predict which coin goes next, yet the total halves very regularly. Radioactive atoms behave the same way, and one toss corresponds to one half-life.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'How did Archbishop Ussher arrive at a creation date of 4004 BC?', options: ['By measuring rocks', 'By adding up the generations and reigns recorded in the Bible', 'By counting tree rings', 'By radioactive dating'], answer: 1, explanation: 'It was a careful historical calculation from written records.' },
      { question: 'What did Buffon time in his experiments on the Earth’s age?', options: ['The flow of rivers', 'The cooling of heated iron balls', 'The swing of pendulums', 'The growth of crystals'], answer: 1, explanation: 'Scaling up to the size of the Earth, he estimated about 75,000 years.' },
      { question: 'Why does the salt clock not measure the age of the oceans?', options: ['Salt evaporates', 'Salt is removed from the sea about as fast as rivers bring it', 'Rivers carry no salt', 'The sea is too deep'], answer: 1, explanation: 'It measures how long salt stays in the sea, its residence time.' },
      { question: 'What did Kelvin assume about the Earth’s interior?', options: ['That it was hollow', 'That heat escaped only by conduction through solid rock', 'That it was made of ice', 'That it contained radioactive elements'], answer: 1, explanation: 'Slow flow (convection) inside the Earth carries heat much more effectively.' },
      { question: 'Who first pointed out, in 1895, that convection inside the Earth would undermine Kelvin’s age?', options: ['John Perry', 'Charles Darwin', 'Marie Curie', 'Arthur Holmes'], answer: 0, explanation: 'Perry, a former assistant of Kelvin, showed the Earth could be far older.' },
      { question: 'What is a half-life?', options: ['Half the age of the Earth', 'The time for half of a sample of radioactive atoms to decay', 'Half the time a rock has existed', 'The time to dig halfway down'], answer: 1, explanation: 'After one half-life, half remain; after two, a quarter; and so on.' },
      { question: 'A mineral has 25% of its original uranium-238 left. How many half-lives have passed?', options: ['One', 'Two', 'Three', 'Four'], answer: 1, explanation: 'Half, then half again: 100% → 50% → 25%.' },
      { question: 'Why did Patterson date the Earth using meteorites?', options: ['Meteorites are easy to find', 'They formed with the Earth and have not been melted and mixed since', 'They are radioactive', 'They come from the Moon'], answer: 1, explanation: 'The Earth’s own first rocks have been recycled by its geology.' },
      { question: 'What was an unexpected result of Patterson’s work?', options: ['A new planet', 'A campaign that removed lead from petrol', 'The discovery of radioactivity', 'A new calendar'], answer: 1, explanation: 'Fighting lead contamination in his lab, he found lead pollution everywhere.' },
      { question: 'How old is the Earth?', options: ['About 6,000 years', 'About 100 million years', 'About 4.54 billion years', 'About 13.8 billion years'], answer: 2, explanation: '13.8 billion years is the age of the universe (Part 10).' }
    ]);
  };
})();
