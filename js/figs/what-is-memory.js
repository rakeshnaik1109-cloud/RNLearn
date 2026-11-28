/* ==========================================================================
   RNLearn — What Is Memory? (Memory, from Synapse to Silicon, Part 1)
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
  function onTheme(fn) {
    if (!window.MutationObserver) return;
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    new MutationObserver(fn).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  function keyClick(node, fn) {
    node.addEventListener('click', fn);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function onResize(fn) {
    var last = 0;
    window.addEventListener('resize', function () { var w = window.innerWidth; if (Math.abs(w - last) > 20) { last = w; fn(); } });
  }
  function scaler(svgWrap, base) { var k = Math.min(1.8, Math.max(1, base / (svgWrap.clientWidth || base))); return function (n) { return Math.round(n * k * 10) / 10; }; }
  function newSVG(svgWrap, container, H, label) { svgWrap.innerHTML = ''; var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); return { W: W, svg: FIG.createSVG(svgWrap, W, H, label), fs: scaler(svgWrap, 360) }; }
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
      warn: FIG.getCSSVar('--callout-warn', '#b45309'),
      tip: FIG.getCSSVar('--callout-tip', '#15803d'),
      key: FIG.getCSSVar('--callout-key', '#7c3aed')
    };
  }
  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  var NOTE = '<br><span style="font-size:0.86rem;color:var(--ink-muted);">';
  var ROW_CSS = 'display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;margin-bottom:0.6rem;';

  /* Physics helpers */
  var KB = 1.380649e-23, EV = 1.602176634e-19, YEAR = 365.25 * 86400;
  function erfc(x) {
    var z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function Qf(z) { return 0.5 * erfc(z / Math.SQRT2); }
  function sup(n) { var m = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }; return String(n).split('').map(function (ch) { return m[ch] || ch; }).join(''); }
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(e) < 3) return sig2(v);
    return m.toFixed(d === undefined ? 1 : d - 1) + ' × 10' + sup(e);
  }
  function oneIn(p) {
    if (p >= 0.5) return 'about 1 in 2 or worse';
    if (p < 1e-15) return 'less than 1 in 10' + sup(15);
    var n = 1 / p;
    if (n < 1e4) return '1 in ' + Math.round(n).toLocaleString('en-GB');
    return '1 in ' + sci(n, 2);
  }
  function sig2(v) { return Number(Number(v).toPrecision(2)).toLocaleString('en-GB', { maximumFractionDigits: 3 }); }
  function duration(s) {
    if (!isFinite(s) || s > 1e30) return 'longer than the age of the universe';
    var a = Math.abs(s);
    if (a < 1e-6) return sci(s * 1e9, 2) + ' ns';
    if (a < 1e-3) return sig2(s * 1e6) + ' µs';
    if (a < 1) return sig2(s * 1e3) + ' ms';
    if (a < 120) return sig2(s) + ' s';
    if (a < 7200) return sig2(s / 60) + ' minutes';
    if (a < 2 * 86400) return sig2(s / 3600) + ' hours';
    if (a < YEAR) return sig2(s / 86400) + ' days';
    if (a < 1e3 * YEAR) return sig2(s / YEAR) + ' years';
    if (a > 4.35e17) return sci(s / YEAR, 2) + ' years (longer than the age of the universe)';
    return sci(s / YEAR, 2) + ' years';
  }

  /* -----------------------------------------------------------------------
     Figure: series map
     ----------------------------------------------------------------------- */
  var MEM_PART = 1;
  var MEM_PARTS = [
    ['What Is Memory?', 'Distinguishable states, energy barriers against heat, writing and reading, bits, and the minimum energy to erase a bit.'],
    ['Memory in the Brain', 'Kinds of memory, the patient H.M., the hippocampus, consolidation and sleep, and the search for the engram.'],
    ['Neurons and Synapses', 'Membrane potentials, the action potential, synaptic transmission, Hebb’s rule, LTP and LTD, and molecular switches.'],
    ['Materials That Remember', 'Magnets, ferroelectrics, trapped charge and hysteresis: the physics that memory chips are built on.'],
    ['DRAM and SRAM, Inside the Cell', 'Capacitors, latches, sense amplifiers, refresh, leakage, row hammer and high-bandwidth memory.'],
    ['Flash and Storage', 'Floating gates and charge traps, tunnelling, multi-level cells, 3D NAND, wear, error correction and hard disks.'],
    ['Building a Memory Chip', 'Arrays, decoders and sense amplifiers, deep-trench and stacked capacitors, 3D stacks and the memory hierarchy.'],
    ['Emerging and Brain-Inspired Memory', 'MRAM, phase-change memory, memristors, ferroelectric transistors and computing inside memory.']
  ];
  FIG['fig-mem-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CUR = MEM_PART, sel = CUR, N = MEM_PARTS.length;
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var SHORT = ['Basics', 'Brain', 'Synapse', 'Materials', 'DRAM', 'Flash', 'Chips', 'Future'];
    var cols = ['#7c3aed', '#16a34a', '#d97706', '#0e7490'];
    function colOf(i) { return cols[i === 0 ? 0 : i < 3 ? 1 : i < 4 ? 2 : 3]; }
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 520, per = narrow ? 4 : 8, rows = Math.ceil(N / per);
      var A = newSVG(svgWrap, container, rows * 74 + 14, 'Map of the eight parts of the series'), W = A.W, svg = A.svg, fs = A.fs;
      for (var i = 0; i < N; i++) {
        var rr = Math.floor(i / per), kk = i % per, cx = 26 + (W - 52) * (kk + 0.5) / per, cy = 32 + rr * 74, col = colOf(i);
        if (kk > 0) el('line', { x1: 26 + (W - 52) * (kk - 0.5) / per + 13, y1: cy, x2: cx - 13, y2: cy, stroke: c.border, 'stroke-width': 2 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + ': ' + MEM_PARTS[i][0], style: 'cursor:pointer' }, svg);
        el('circle', { cx: cx, cy: cy, r: i + 1 === sel ? 14 : 11, fill: i + 1 === CUR ? col : c.surface, stroke: col, 'stroke-width': i + 1 === sel ? 3 : 2 }, g);
        txt(g, cx, cy + 4, String(i + 1), { size: fs(10), weight: 700, fill: i + 1 === CUR ? '#fff' : col });
        txt(g, cx, cy + 30, SHORT[i], { size: fs(9), fill: c.ink2 });
        (function (n) { keyClick(g, function () { sel = n; draw(); }); })(i + 1);
      }
      out.innerHTML = '<strong>Part ' + sel + ': ' + MEM_PARTS[sel - 1][0] + '.</strong> ' + MEM_PARTS[sel - 1][1] + (sel === CUR ? ' <em>(you are here)</em>' : '') + NOTE + 'Purple: foundations (Part 1). Green: memory in living things (2–3). Amber: the physics of materials (4). Teal: memory chips (5–8).</span>';
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: timeline
     ----------------------------------------------------------------------- */
  var ERAS = [
    { name: 'Remembering', color: '#16a34a' },
    { name: 'Rates and barriers', color: '#d97706' },
    { name: 'Information is physical', color: '#7c3aed' }
  ];
  var EVENTS = [
    { year: 'c. 3200 BCE', icon: '📜', era: 0, sec: 3, title: 'Clay tablets', text: 'Scribes in Uruk, in Mesopotamia, press marks into wet clay: one of the earliest durable external memories, still readable five thousand years later.' },
    { year: '1871', icon: '😈', era: 2, sec: 7, title: 'Maxwell’s demon', text: 'James Clerk Maxwell describes (first in an 1867 letter, then in his book Theory of Heat) a being that sorts molecules and seems to defeat the second law of thermodynamics.' },
    { year: '1885', icon: '📉', era: 0, sec: 8, title: 'The forgetting curve', text: 'Hermann Ebbinghaus publishes the first quantitative study of memory, using nonsense syllables and himself as the subject.' },
    { year: '1889', icon: '⚗️', era: 1, sec: 5, title: 'The Arrhenius law', text: 'Svante Arrhenius shows that reaction rates rise exponentially with temperature, as if molecules must climb an energy barrier.' },
    { year: '1929', icon: '🔀', era: 2, sec: 7, title: 'Szilard’s engine', text: 'Leo Szilard shows that one bit of information about a single molecule is worth at most kT ln 2 of work.' },
    { year: '1940', icon: '⛰️', era: 1, sec: 5, title: 'Kramers’ escape rate', text: 'Hendrik Kramers derives the rate at which a randomly jostled particle escapes over a barrier, putting the Arrhenius law on a physical footing.' },
    { year: '1948', icon: '🔢', era: 2, sec: 4, title: 'Information theory', text: 'Claude Shannon defines information in bits and shows how noise limits how much can be stored and sent.' },
    { year: '1949', icon: '🧲', era: 1, sec: 5, title: 'Néel relaxation', text: 'Louis Néel explains how tiny magnetic grains keep, or lose, their magnetisation through thermal activation over a barrier.' },
    { year: '1961', icon: '🔥', era: 2, sec: 7, title: 'Landauer’s principle', text: 'Rolf Landauer argues that erasing one bit must dissipate at least kT ln 2 of heat.' },
    { year: '1982', icon: '🧹', era: 2, sec: 7, title: 'The demon exorcised', text: 'Charles Bennett shows that the demon must eventually erase its memory, and that erasure pays the entropy debt.' },
    { year: '2012', icon: '🔬', era: 2, sec: 7, title: 'Landauer measured', text: 'Bérut and colleagues erase a one-bit memory made from a trapped glass bead and measure heat approaching kT ln 2, but never below it.' }
  ];
  FIG['fig-mem1-timeline'] = function (figEl) {
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
      var rows = W < 560 ? 3 : W < 860 ? 2 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 40;
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
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the four ingredients in seven memories
     ----------------------------------------------------------------------- */
  var MEMS = [
    { name: 'Clay tablet', kind: 'passive', life: 'Thousands of years',
      states: 'A mark pressed into the clay, or no mark. Many shapes of mark make many signs.',
      stab: 'Dried or baked clay is hard; only breakage or water erases it.',
      write: 'A reed stylus pressed into wet clay. Once dry, it cannot be rewritten.',
      read: 'By eye. Reading does not change the tablet.' },
    { name: 'DNA', kind: 'passive + repair', life: 'A lifetime in cells; up to about two million years in cold sediment',
      states: 'Four bases (A, C, G, T) at each position: 2 bits per base.',
      stab: 'Strong covalent bonds, plus enzymes that constantly find and repair damage.',
      write: 'Copied by polymerase enzymes when a cell divides, or made chemically in a laboratory.',
      read: 'Transcription into RNA inside the cell, or sequencing machines outside it.' },
    { name: 'Synapse', kind: 'active', life: 'Seconds to a lifetime',
      states: 'The strength of a connection between two neurons: a handful of distinguishable levels.',
      stab: 'Its molecules are replaced over days to weeks, so the strength must be actively maintained.',
      write: 'Coincident activity of the two neurons strengthens or weakens it (Part 3).',
      read: 'Signals passing through it are scaled by its strength. Recall can modify the memory.' },
    { name: 'Magnetic grain (hard disk)', kind: 'passive', life: 'Years to billions of years',
      states: 'Magnetisation pointing one way or the opposite way.',
      stab: 'An energy barrier set by the grain’s volume and material resists thermal flipping.',
      write: 'A strong local magnetic field from the write head tilts the landscape.',
      read: 'A magnetoresistive head senses the field above the grain without changing it.' },
    { name: 'SRAM cell', kind: 'active', life: 'As long as the power is on',
      states: 'Two cross-coupled inverters: one output high and the other low, or the reverse.',
      stab: 'Feedback keeps restoring the state, but only while current flows.',
      write: 'Bit lines overpower the feedback loop through two access transistors.',
      read: 'A sense amplifier detects a small voltage difference between two bit lines.' },
    { name: 'DRAM cell', kind: 'active', life: 'Milliseconds without refresh; refreshed every 64 ms',
      states: 'A tiny capacitor that is charged or empty.',
      stab: 'Poor: charge leaks away within milliseconds, so every row is read and rewritten regularly.',
      write: 'A transistor connects the capacitor to a bit line and charges or empties it.',
      read: 'The charge is shared with the bit line and sensed. This destroys it, so it is written back.' },
    { name: 'Flash cell', kind: 'passive', life: 'About ten years when new; less when worn',
      states: 'Different amounts of charge trapped on a floating gate or charge-trap layer, shifting the transistor’s threshold voltage.',
      stab: 'An insulating barrier of about 3 eV keeps the electrons in place.',
      write: 'A high voltage lets electrons tunnel through the barrier, then the barrier is effectively closed again.',
      read: 'Test whether the transistor turns on at a set of reference voltages.' }
  ];
  FIG['fig-mem-four'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var row = div('', container); row.style.cssText = ROW_CSS;
    var card = div('', container);
    var btns = [], sel = 0;
    MEMS.forEach(function (m, i) {
      var b = btn(m.name, row);
      b.addEventListener('click', function () { sel = i; draw(); });
      btns.push(b);
    });
    var LABELS = [['states', '1. States', '#2563eb'], ['stab', '2. Stability', '#16a34a'], ['write', '3. Writing', '#d97706'], ['read', '4. Reading', '#7c3aed']];
    function draw() {
      var m = MEMS[sel];
      btns.forEach(function (b, i) { b.classList.toggle('active', i === sel); b.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); });
      var badgeCol = m.kind === 'passive' ? '#16a34a' : m.kind === 'active' ? '#d97706' : '#0e7490';
      var h = '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:0.6rem;font-family:var(--font-sans);">' +
        '<strong style="font-size:1rem;color:var(--ink);">' + m.name + '</strong>' +
        '<span style="font-size:0.78rem;padding:0.1rem 0.5rem;border-radius:999px;border:1px solid ' + badgeCol + ';color:' + badgeCol + ';">Stability: ' + m.kind + '</span>' +
        '<span style="font-size:0.82rem;color:var(--ink-muted);">Lasts: ' + m.life + '</span></div>';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0.6rem;">';
      LABELS.forEach(function (L) {
        h += '<div style="border:1px solid var(--border);border-left:4px solid ' + L[2] + ';border-radius:var(--radius-sm);padding:0.6rem 0.75rem;background:var(--surface);font-family:var(--font-sans);font-size:0.88rem;line-height:1.45;color:var(--ink-secondary);">' +
          '<div style="font-weight:700;color:' + L[2] + ';margin-bottom:0.2rem;">' + L[1] + '</div>' + m[L[0]] + '</div>';
      });
      h += '</div>';
      card.innerHTML = h;
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: levels and noise
     ----------------------------------------------------------------------- */
  FIG['fig-mem-levels'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = 4, sig = 0.04;
    var svgWrap = div('', container);
    var ctr = div('fig-controls', container);
    FIG.slider(ctr, { id: 'mem-lv-n', label: 'Levels per cell', min: 2, max: 16, step: 1, value: M, onChange: function (v) { M = v; draw(); } });
    FIG.slider(ctr, { id: 'mem-lv-s', label: 'Noise σ (% of window)', min: 0.5, max: 12, step: 0.5, value: sig * 100, onChange: function (v) { sig = v / 100; draw(); } });
    var out = div('', container); out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 220, 'Overlapping noise distributions of stored levels'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 20, R = W - 20, T = 16, B = 180, x0 = -0.12, x1 = 1.12;
      function X(v) { return L + (v - x0) / (x1 - x0) * (R - L); }
      var d = 1 / (M - 1), peak = 1 / (sig * Math.sqrt(2 * Math.PI)), ymax = Math.max(peak, 1 / (0.04 * Math.sqrt(2 * Math.PI)));
      function Y(p) { return B - p / ymax * (B - T - 26); }
      el('rect', { x: X(0), y: T, width: X(1) - X(0), height: B - T, fill: c.raised, opacity: 0.6 }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.muted, 'stroke-width': 1 }, svg);
      txt(svg, X(0), B + 16, '0 V', { size: fs(10), fill: c.muted });
      txt(svg, X(1), B + 16, 'full scale', { size: fs(10), fill: c.muted });
      txt(svg, (X(0) + X(1)) / 2, B + 32, 'stored voltage', { size: fs(10), fill: c.muted });
      var palette = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#0e7490', '#dc2626'];
      for (var k = 1; k < M; k++) {
        var th = (k - 0.5) * d;
        el('line', { x1: X(th), y1: T, x2: X(th), y2: B, stroke: c.faint, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
      }
      for (var i = 0; i < M; i++) {
        var mu = i * d, pts = [];
        for (var s = 0; s <= 160; s++) {
          var v = mu - 4.5 * sig + s * 9 * sig / 160;
          if (v < x0 || v > x1) continue;
          var p = peak * Math.exp(-0.5 * Math.pow((v - mu) / sig, 2));
          pts.push(X(v).toFixed(1) + ',' + Y(p).toFixed(1));
        }
        if (pts.length < 2) continue;
        var col = palette[i % palette.length];
        el('polyline', { points: pts.join(' '), fill: col, 'fill-opacity': 0.15, stroke: col, 'stroke-width': 1.6 }, svg);
        if (M <= 8) txt(svg, X(mu), T + 12, String(i), { size: fs(10), weight: 700, fill: col });
      }
      var z = d / (2 * sig), pe = 2 * (M - 1) / M * Qf(z), bits = Math.log(M) / Math.LN2;
      out.innerHTML = '<strong>' + M + ' levels = ' + (Math.round(bits * 100) / 100) + ' bits per cell.</strong> Neighbouring levels are ' + (d / sig).toFixed(1) + 'σ apart, so the noise must push a level ' + z.toFixed(1) + 'σ to cross a threshold (dashed lines). Chance of misreading a level: <strong>' + oneIn(pe) + '</strong>.' +
        NOTE + 'Error rate per read = 2(M − 1)/M × Q(d/2σ), for Gaussian noise and thresholds halfway between levels.</span>';
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a bit in a double well (overdamped Langevin simulation)
     ----------------------------------------------------------------------- */
  FIG['fig-mem-well'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Bh = 5, Tk = 300, x = -1, F = 0, writeLeft = 0, paused = false;
    var simT = 0, hops = 0, state = -1, trace = [], TR = 420;
    var DT = 0.002, STEPS = 300;
    var canvasWrap = div('', container);
    var cv = null, ctx = null, CW = 0, CH = 300;
    function makeCanvas() {
      canvasWrap.innerHTML = '';
      CW = Math.max(300, Math.round(canvasWrap.clientWidth || container.clientWidth || 680));
      var cc = FIG.createCanvas(canvasWrap, CW, CH);
      cv = cc.canvas; ctx = cc.ctx;
      cv.style.width = '100%';
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A particle hopping between two energy wells, with a trace of its position over time');
    }
    makeCanvas();
    var ctr = div('fig-controls', container);
    FIG.slider(ctr, { id: 'mem-w-b', label: 'Barrier ΔE (in kT at 300 K)', min: 1, max: 12, step: 0.5, value: Bh, onChange: function (v) { Bh = v; resetCount(); } });
    FIG.slider(ctr, { id: 'mem-w-t', label: 'Temperature', min: 150, max: 600, step: 10, value: Tk, unit: 'K', onChange: function (v) { Tk = v; resetCount(); } });
    var brow = div('', container); brow.style.cssText = ROW_CSS + 'margin-top:0.5rem;';
    FIG.button(brow, { label: 'Write (flip the bit)', onClick: function () { if (writeLeft <= 0) { writeLeft = 0.4; F = (state < 0 ? 1 : -1) * 2.2 * Bh; } } });
    var pbtn = FIG.button(brow, { label: 'Pause', onClick: function () { paused = !paused; pbtn.textContent = paused ? 'Run' : 'Pause'; } });
    FIG.button(brow, { label: 'Reset count', onClick: function () { resetCount(); } });
    var out = div('', container); out.style.cssText = READ_CSS;
    function resetCount() { simT = 0; hops = 0; }
    function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function U(xx) { return Bh * Math.pow(xx * xx - 1, 2) - F * xx; }
    function step() {
      var th = Tk / 300, amp = Math.sqrt(2 * th * DT);
      for (var s = 0; s < STEPS; s++) {
        var force = -4 * Bh * x * (x * x - 1) + F;
        x += force * DT + amp * gauss();
        if (x > 2.4) x = 2.4; if (x < -2.4) x = -2.4;
        if (writeLeft > 0) { writeLeft -= DT; if (writeLeft <= 0) F = 0; }
        if (state < 0 && x > 0.6) { state = 1; if (writeLeft <= 0 && F === 0) hops++; }
        else if (state > 0 && x < -0.6) { state = -1; if (writeLeft <= 0 && F === 0) hops++; }
      }
      simT += STEPS * DT;
      trace.push(x); if (trace.length > TR) trace.shift();
    }
    var lastOut = 0;
    function render(ts) {
      if (!paused) step();
      var c = C();
      ctx.clearRect(0, 0, CW, CH);
      var L = 16, R = CW - 16, top = 10, potH = 160, xmin = -1.55, xmax = 1.55;
      function PX(v) { return L + (v - xmin) / (xmax - xmin) * (R - L); }
      var umax = Math.max(U(xmin), U(xmax)) + 0.5;
      function PY(u) { return top + potH - (u + 1) / (umax + 1) * potH; }
      ctx.fillStyle = c.ink2; ctx.font = '12px ' + FIG.getCSSVar('--font-sans', 'sans-serif');
      ctx.textAlign = 'center';
      ctx.fillText('“0”', PX(-1), top + potH + 14); ctx.fillText('“1”', PX(1), top + potH + 14);
      ctx.beginPath();
      for (var i = 0; i <= 200; i++) { var xv = xmin + i * (xmax - xmin) / 200, uy = Math.min(PY(U(xv)), top + potH + 40); uy = Math.max(uy, top - 4); if (i === 0) ctx.moveTo(PX(xv), uy); else ctx.lineTo(PX(xv), uy); }
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2.2; ctx.stroke();
      // barrier marker
      ctx.setLineDash([3, 3]); ctx.strokeStyle = c.faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PX(-1), PY(U(-1))); ctx.lineTo(PX(0.15), PY(U(-1))); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX(0.15), PY(U(0))); ctx.lineTo(PX(0.15), PY(U(-1))); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.muted; ctx.textAlign = 'left'; ctx.fillText('ΔE', PX(0.2), (PY(U(0)) + PY(U(-1))) / 2 + 4);
      // ball
      var by = PY(U(x)) - 9;
      ctx.beginPath(); ctx.arc(PX(x), Math.max(by, top + 2), 8, 0, 2 * Math.PI);
      ctx.fillStyle = state < 0 ? '#2563eb' : '#d97706'; ctx.fill();
      if (writeLeft > 0) { ctx.fillStyle = c.warn; ctx.textAlign = 'center'; ctx.fillText('write pulse: landscape tilted', CW / 2, top + 12); }
      // trace
      var t0 = top + potH + 26, tH = CH - t0 - 8;
      ctx.strokeStyle = c.border; ctx.lineWidth = 1; ctx.strokeRect(L, t0, R - L, tH);
      ctx.fillStyle = c.muted; ctx.textAlign = 'left'; ctx.fillText('1', L + 4, t0 + 13); ctx.fillText('0', L + 4, t0 + tH - 4);
      ctx.beginPath();
      for (var k = 0; k < trace.length; k++) {
        var tx = R - (trace.length - 1 - k) * (R - L - 18) / (TR - 1), ty = t0 + tH / 2 - Math.max(-1.6, Math.min(1.6, trace[k])) / 1.6 * (tH / 2 - 4);
        if (k === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = c.key; ctx.lineWidth = 1.4; ctx.stroke();
      if (!ts || ts - lastOut > 250) {
        lastOut = ts || 0;
        var eff = Bh / (Tk / 300), rate = Math.sqrt(32) * Bh / (2 * Math.PI) * Math.exp(-eff), tau = 1 / rate;
        out.innerHTML = 'Barrier at this temperature: <strong>ΔE/kT = ' + eff.toFixed(1) + '</strong>. Kramers’ theory predicts a hop every <strong>' + (tau < 1e6 ? sig2(tau) : sci(tau, 2)) + '</strong> time units on average. Observed: <strong>' + hops + '</strong> thermal hops in ' + Math.round(simT) + ' time units' + (hops > 0 ? ' (one per ' + sig2(simT / hops) + ')' : '') + '.' +
          NOTE + 'Each extra kT of barrier makes hops about 2.7 times rarer. Hops caused by the write pulse are not counted.</span>';
      }
    }
    FIG.animate(figEl, render);
    render(0);
    onResize(function () { makeCanvas(); render(0); });
  };

  /* -----------------------------------------------------------------------
     Figure: retention time against barrier height
     ----------------------------------------------------------------------- */
  FIG['fig-mem-retention'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Tk = 300, lt0 = -9, lN = 0;
    var svgWrap = div('', container);
    var ctr = div('fig-controls', container);
    FIG.slider(ctr, { id: 'mem-r-t', label: 'Temperature', min: 250, max: 450, step: 5, value: Tk, unit: 'K', onChange: function (v) { Tk = v; draw(); } });
    FIG.slider(ctr, { id: 'mem-r-t0', label: 'Attempt time τ₀ (log₁₀ s)', min: -12, max: -6, step: 1, value: lt0, onChange: function (v) { lt0 = v; draw(); } });
    FIG.slider(ctr, { id: 'mem-r-n', label: 'Bits that must all survive (log₁₀)', min: 0, max: 12, step: 1, value: lN, onChange: function (v) { lN = v; draw(); } });
    var out = div('', container); out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Retention time against barrier height'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 52, R = W - 14, T = 12, B = 246, e0 = 0, e1 = 2.4, y0 = -9, y1 = 20;
      function X(e) { return L + (e - e0) / (e1 - e0) * (R - L); }
      function Y(l) { return B - (l - y0) / (y1 - y0) * (B - T); }
      var kT = KB * Tk / EV;
      [[0, '1 s'], [Math.log10(86400), '1 day'], [Math.log10(10 * YEAR), '10 years'], [Math.log10(4.35e17), 'age of universe']].forEach(function (r) {
        el('line', { x1: L, y1: Y(r[0]), x2: R, y2: Y(r[0]), stroke: c.border, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
        txt(svg, R - 2, Y(r[0]) - 4, r[1], { anchor: 'end', size: fs(9.5), fill: c.muted });
      });
      for (var yl = -9; yl <= 20; yl += 3) txt(svg, L - 6, Y(yl) + 4, '10' + sup(yl), { anchor: 'end', size: fs(9.5), fill: c.muted });
      for (var ex = 0; ex <= 2.4001; ex += 0.4) {
        txt(svg, X(ex), B + 15, ex.toFixed(1), { size: fs(9.5), fill: c.muted });
        el('line', { x1: X(ex), y1: B, x2: X(ex), y2: B + 4, stroke: c.muted }, svg);
      }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.muted }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.muted }, svg);
      txt(svg, (L + R) / 2, B + 32, 'barrier height ΔE (eV)', { size: fs(10), fill: c.ink2 });
      var yl2 = el('text', { x: 12, y: (T + B) / 2, 'text-anchor': 'middle', 'font-size': fs(10), fill: c.ink2, 'font-family': FIG.getCSSVar('--font-sans'), transform: 'rotate(-90 12 ' + ((T + B) / 2) + ')' }, svg);
      yl2.textContent = 'time to first flip (s)';
      function curve(TT, col, w, dash) {
        var kk = KB * TT / EV, pts = [];
        for (var i = 0; i <= 120; i++) {
          var e = e0 + i * (e1 - e0) / 120, l = lt0 + e / kk / Math.LN10 - lN;
          if (l < y0 || l > y1) continue;
          pts.push(X(e).toFixed(1) + ',' + Y(l).toFixed(1));
        }
        if (pts.length > 1) el('polyline', { points: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }, svg);
      }
      if (Tk !== 300) curve(300, c.faint, 1.5, '5 4');
      curve(Tk, c.accent, 2.4);
      var need = kT * (Math.log(10 * YEAR) - lt0 * Math.LN10 + lN * Math.LN10);
      if (need <= e1) {
        el('circle', { cx: X(need), cy: Y(Math.log10(10 * YEAR)), r: 5, fill: c.warn }, svg);
        el('line', { x1: X(need), y1: Y(Math.log10(10 * YEAR)), x2: X(need), y2: B, stroke: c.warn, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, svg);
      }
      out.innerHTML = 'At ' + Tk + ' K, kT = ' + (kT * 1000).toFixed(1) + ' meV. To keep ' + (lN === 0 ? 'one bit' : 'all of 10' + sup(lN) + ' bits') + ' for ten years with τ₀ = 10' + sup(lt0) + ' s needs <strong>ΔE ≈ ' + need.toFixed(2) + ' eV = ' + (need / kT).toFixed(1) + ' kT</strong>.' +
        (Tk !== 300 ? NOTE + 'Dashed curve: the same memory at 300 K.</span>' : NOTE + 'Time to first flip ≈ τ₀ e^(ΔE/kT) / N for N independent bits.</span>');
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: writing by tilting the landscape
     ----------------------------------------------------------------------- */
  FIG['fig-mem-tilt'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var B0 = 40, FC = 8 * B0 / (3 * Math.sqrt(3)), frac = 0;
    var svgWrap = div('', container);
    var ctr = div('fig-controls', container);
    var sl = FIG.slider(ctr, { id: 'mem-t-f', label: 'Applied force (% of critical)', min: 0, max: 120, step: 1, value: 0, unit: '%', onChange: function (v) { frac = v / 100; draw(); } });
    var brow = div('', container); brow.style.cssText = ROW_CSS + 'margin-top:0.5rem;';
    [['No force', 0], ['Read (5 %)', 5], ['Half (50 %)', 50], ['Write (100 %)', 100]].forEach(function (p) {
      var b = btn(p[0], brow); b.addEventListener('click', function () { sl.setValue(p[1]); frac = p[1] / 100; draw(); });
    });
    var out = div('', container); out.style.cssText = READ_CSS;
    function analyse(F) {
      function dU(x) { return 4 * B0 * x * (x * x - 1) - F; }
      function U(x) { return B0 * Math.pow(x * x - 1, 2) - F * x; }
      var roots = [], prev = dU(-2), step = 0.0005;
      for (var x = -2 + step; x <= 2; x += step) { var cur = dU(x); if ((prev < 0 && cur >= 0) || (prev > 0 && cur <= 0)) roots.push(x); prev = cur; }
      if (roots.length >= 3) return { left: roots[0], top: roots[1], right: roots[2], barrier: U(roots[1]) - U(roots[0]), U: U };
      return { left: null, right: roots[roots.length - 1], barrier: 0, U: U };
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Double-well energy landscape tilted by an applied force'), W = A.W, svg = A.svg, fs = A.fs;
      var F = frac * FC, an = analyse(F), U = an.U;
      var L = 20, R = W - 20, T = 26, Bt = 200, x0 = -1.55, x1 = 1.55, umin = Infinity, umax = 1.25 * B0;
      for (var q = 0; q <= 200; q++) umin = Math.min(umin, U(x0 + q * (x1 - x0) / 200));
      umin -= 0.08 * (umax - umin);
      function X(v) { return L + (v - x0) / (x1 - x0) * (R - L); }
      function Y(u) { return Bt - (u - umin) / (umax - umin) * (Bt - T); }
      var pts = [];
      for (var i = 0; i <= 200; i++) { var xv = x0 + i * (x1 - x0) / 200, u = U(xv); if (u > umax) continue; pts.push(X(xv).toFixed(1) + ',' + Math.max(T - 10, Y(u)).toFixed(1)); }
      if (frac > 0) {
        var p0 = [];
        for (var j = 0; j <= 200; j++) { var xx = x0 + j * (x1 - x0) / 200, uu = B0 * Math.pow(xx * xx - 1, 2); if (uu > umax) continue; p0.push(X(xx).toFixed(1) + ',' + Math.max(T - 10, Y(uu)).toFixed(1)); }
        el('polyline', { points: p0.join(' '), fill: 'none', stroke: c.faint, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, svg);
      }
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: c.accent, 'stroke-width': 2.4 }, svg);
      txt(svg, X(-1), Bt + 18, 'old state “0”', { size: fs(10), fill: c.ink2 });
      txt(svg, X(1), Bt + 18, 'new state “1”', { size: fs(10), fill: c.ink2 });
      if (an.left !== null) {
        var yl = Y(U(an.left)), yt = Y(U(an.top));
        el('line', { x1: X(an.left), y1: yl, x2: X(an.top) + 14, y2: yl, stroke: c.warn, 'stroke-dasharray': '3 3' }, svg);
        el('line', { x1: X(an.top) + 14, y1: yl, x2: X(an.top) + 14, y2: yt, stroke: c.warn, 'stroke-width': 1.5 }, svg);
        txt(svg, X(an.top) + 20, (yl + yt) / 2 + 4, 'ΔE_eff', { anchor: 'start', size: fs(10), fill: c.warn });
        el('circle', { cx: X(an.left), cy: yl - 9, r: 8, fill: '#2563eb' }, svg);
      } else {
        el('circle', { cx: X(an.right), cy: Y(U(an.right)) - 9, r: 8, fill: '#d97706' }, svg);
        txt(svg, (L + R) / 2, T + 4, 'Barrier gone: the bit rolls into the new state at once', { size: fs(10.5), weight: 700, fill: c.warn });
      }
      var tau = 1e-9 * Math.exp(an.barrier), verdict;
      if (an.barrier <= 0) verdict = 'This is a write: the old state no longer exists.';
      else if (an.barrier > 38) verdict = 'Safe: the bit is still protected for years. A read force must stay down here.';
      else if (an.barrier > 15) verdict = 'Danger zone: too weak to write quickly, but strong enough to shorten retention. Repeated reads like this cause “read disturb”.';
      else verdict = 'Nearly a write: thermal noise will finish the job within ' + duration(tau) + '.';
      out.innerHTML = 'Barrier protecting the old state: <strong>' + an.barrier.toFixed(1) + ' kT</strong> (it was ' + B0 + ' kT with no force). Mean time to flip: <strong>' + (an.barrier <= 0 ? 'immediate' : duration(tau)) + '</strong>, taking τ₀ = 1 ns. ' + verdict +
        NOTE + 'U(x) = ΔE₀(x² − 1)² − Fx with ΔE₀ = 40 kT. The barrier vanishes at the critical force F_c = 8ΔE₀/(3√3) ≈ 1.54 ΔE₀.</span>';
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: energy per bit ladder
     ----------------------------------------------------------------------- */
  var ENERGY = [
    { name: 'Landauer limit (erase 1 bit, 300 K)', v: 2.87e-21, col: '#7c3aed', note: 'k<sub>B</sub>T ln 2: the minimum heat released by erasing one bit at room temperature. Bérut and colleagues approached it in 2012 by erasing very slowly.' },
    { name: 'Thermal energy k<sub>B</sub>T (300 K)', v: 4.14e-21, col: '#7c3aed', note: 'The typical size of a single thermal kick. Every memory must survive countless of them.' },
    { name: 'Energy from one ATP molecule', v: 1e-19, col: '#16a34a', note: 'Hydrolysing one ATP, the cell’s energy currency, releases roughly 10⁻¹⁹ J under cellular conditions.' },
    { name: 'Barrier for a 10-year bit (40 k<sub>B</sub>T)', v: 1.67e-19, col: '#0e7490', note: 'Not an energy that is spent, but the height of hill needed to keep one bit for about ten years (section 5). Writing must overcome it.' },
    { name: 'Switching one logic gate in a modern chip', v: 1e-16, col: '#d97706', note: 'Of order 0.1–1 fJ, the energy αCV² for charging the gate and its wires. A rough figure that depends on the circuit.' },
    { name: 'Energy stored in one DRAM cell', v: 1e-14, col: '#d97706', note: '½CV² for a 20 fF capacitor at 1 V (worked problem 5): about 3.5 million times the Landauer limit.' },
    { name: 'One synaptic vesicle release', v: 1.6e-14, col: '#16a34a', note: 'Releasing one packet of neurotransmitter and restoring the ion balance afterwards costs of order 10⁵ ATP molecules (Attwell and Laughlin, 2001).' },
    { name: 'Reading one bit from off-chip DRAM', v: 1e-11, col: '#d97706', note: 'Of order 10 pJ per bit, mostly spent driving signals along wires between the memory chip and the processor.' }
  ];
  FIG['fig-mem-energy'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sel = 0;
    var svgWrap = div('', container), out = div('', container); out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || 700) < 560, rowH = narrow ? 44 : 30, labW = narrow ? 0 : 250;
      var A = newSVG(svgWrap, container, ENERGY.length * rowH + 40, 'Energy per bit on a logarithmic scale'), W = A.W, svg = A.svg, fs = A.fs;
      var L = labW + 10, R = W - 16, lo = -21, hi = -10;
      function X(v) { return L + (Math.log10(v) - lo) / (hi - lo) * (R - L); }
      for (var e = lo; e <= hi; e++) {
        el('line', { x1: X(Math.pow(10, e)), y1: 6, x2: X(Math.pow(10, e)), y2: ENERGY.length * rowH + 10, stroke: c.border, 'stroke-width': 1 }, svg);
        if ((e - lo) % (narrow ? 2 : 1) === 0) txt(svg, X(Math.pow(10, e)), ENERGY.length * rowH + 26, '10' + sup(e), { size: fs(9.5), fill: c.muted });
      }
      ENERGY.forEach(function (it, i) {
        var y = 10 + i * rowH, h = narrow ? 14 : 18, by = narrow ? y + 18 : y;
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': it.name.replace(/<[^>]+>/g, ''), style: 'cursor:pointer' }, svg);
        var label = it.name.replace(/<sub>(.*?)<\/sub>/g, '$1');
        if (narrow) txt(g, L, y + 12, label, { anchor: 'start', size: fs(10), fill: i === sel ? c.ink : c.ink2, weight: i === sel ? 700 : 400 });
        else txt(g, labW, y + 13, label, { anchor: 'end', size: 11, fill: i === sel ? c.ink : c.ink2, weight: i === sel ? 700 : 400 });
        el('rect', { x: L, y: by, width: Math.max(2, X(it.v) - L), height: h, rx: 3, fill: it.col, opacity: i === sel ? 1 : 0.55 }, g);
        keyClick(g, function () { sel = i; draw(); });
      });
      var it = ENERGY[sel], ratio = it.v / ENERGY[0].v;
      out.innerHTML = '<strong>' + it.name + ': about ' + sci(it.v, 2) + ' J' + (sel > 0 ? ', roughly ' + (ratio < 100 ? sig2(ratio) : sci(ratio, 1)) + ' times the Landauer limit' : '') + '.</strong> ' + it.note +
        NOTE + 'Rough orders of magnitude for comparison, not precise values. Green: biology. Amber: electronics. Purple: physical limits.</span>';
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: how long memories last (log ruler)
     ----------------------------------------------------------------------- */
  var SPANS = [
    { t: 0.064, name: 'DRAM cell between refreshes', col: '#d97706', text: 'DRAM charge leaks within milliseconds to seconds, so standard chips refresh every cell at least once every 64 ms.' },
    { t: 0.5, name: 'Visual sensory memory', col: '#16a34a', text: 'Sperling (1960): a glimpse of a grid of letters leaves a detailed visual trace that fades in well under a second.' },
    { t: 18, name: 'Short-term memory, no rehearsal', col: '#16a34a', text: 'Peterson and Peterson (1959): stopped from rehearsing, people forgot most three-letter strings within about 18 seconds.' },
    { t: 86400, name: 'Ebbinghaus, one day later', col: '#16a34a', text: 'After one day Ebbinghaus saved only about a third of the time needed to relearn his lists; most forgetting happens early.' },
    { t: YEAR, name: 'Worn-out SSD, unpowered', col: '#d97706', text: 'The JEDEC standard asks a consumer SSD at the end of its rated life to keep data for one year unpowered at 30 °C.' },
    { t: 10 * YEAR, name: 'Fresh flash memory', col: '#d97706', text: 'New flash memory is typically specified to keep data for about ten years, limited by electrons leaking through the barrier.' },
    { t: 80 * YEAR, name: 'Human long-term memory', col: '#16a34a', text: 'Some memories, like a childhood home or a first language, last a lifetime, despite constant replacement of the molecules that hold them.' },
    { t: 5000 * YEAR, name: 'Clay tablets', col: '#0e7490', text: 'Tablets written in Mesopotamia from about 3200 BCE can still be read today.' },
    { t: 2e6 * YEAR, name: 'Ancient DNA', col: '#0e7490', text: 'DNA about two million years old has been recovered from frozen sediments in northern Greenland (Kjær et al., 2022).' },
    { t: 3.45e9 * YEAR, name: 'Magnetic grains in rocks', col: '#7c3aed', text: 'Tiny magnetic grains in ancient rocks record the Earth’s magnetic field from 3.4 to 3.45 billion years ago (Tarduno et al., 2010), protected by Néel’s energy barrier.' }
  ];
  FIG['fig-mem-timescales'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sel = 2;
    var svgWrap = div('', container), out = div('', container); out.style.cssText = READ_CSS;
    var TICKS = [[1e-3, '1 ms'], [1, '1 s'], [60, '1 min'], [3600, '1 h'], [86400, '1 day'], [YEAR, '1 yr'], [100 * YEAR, '100 yr'], [1e4 * YEAR, '10⁴ yr'], [1e6 * YEAR, '1 Myr'], [1e9 * YEAR, '1 Gyr']];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 150, 'Logarithmic ruler of memory lifetimes'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 22, R = W - 22, ly = 78, lo = -3, hi = 17.2;
      function X(t) { return L + (Math.log10(t) - lo) / (hi - lo) * (R - L); }
      el('line', { x1: L, y1: ly, x2: R, y2: ly, stroke: c.border, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
      var narrow = W < 560;
      TICKS.forEach(function (tk, i) {
        el('line', { x1: X(tk[0]), y1: ly + 4, x2: X(tk[0]), y2: ly + 12, stroke: c.muted }, svg);
        if (!narrow || i % 2 === 0) txt(svg, X(tk[0]), ly + 26, tk[1], { size: fs(9.5), fill: c.muted });
      });
      SPANS.forEach(function (s, i) {
        var x = X(s.t), up = i % 2 === 0, g = el('g', { tabindex: 0, role: 'button', 'aria-label': s.name, style: 'cursor:pointer' }, svg);
        el('line', { x1: x, y1: ly, x2: x, y2: up ? ly - 26 : ly + 40, stroke: s.col, opacity: 0.5 }, g);
        el('circle', { cx: x, cy: up ? ly - 34 : ly + 48, r: i === sel ? 11 : 9, fill: i === sel ? s.col : c.surface, stroke: s.col, 'stroke-width': 2 }, g);
        txt(g, x, (up ? ly - 34 : ly + 48) + 4, String(i + 1), { size: fs(9), weight: 700, fill: i === sel ? '#fff' : s.col });
        el('circle', { cx: x, cy: ly, r: 3.5, fill: s.col }, g);
        keyClick(g, function () { sel = i; draw(); });
      });
      var s = SPANS[sel];
      out.innerHTML = '<strong>' + (sel + 1) + '. ' + s.name + ': about ' + duration(s.t) + '.</strong> ' + s.text +
        NOTE + 'Green: biology and psychology. Amber: electronics. Teal: durable records. Purple: physics. Each tick is a much bigger step in time than the one before.</span>';
    }
    draw();
    onResize(draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Quiz
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-mem1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which is NOT one of the four basic ingredients of a memory?', options: ['Distinguishable states', 'Stability against disturbance', 'Electricity', 'A way to read the state'], answer: 2, explanation: 'Clay tablets, DNA and knots remember without electricity. The four are states, stability, writing and reading.' },
      { question: 'How many bits can a cell with 8 distinguishable levels hold?', options: ['2', '3', '4', '8'], answer: 1, explanation: 'log₂ 8 = 3.' },
      { question: 'What limits how many levels a single memory cell can hold?', options: ['The colour of the chip', 'Noise, which blurs neighbouring levels together', 'The number of wires', 'Nothing: any number is possible'], answer: 1, explanation: 'Levels must be several standard deviations of noise apart to be read reliably.' },
      { question: 'At room temperature, k_BT is about…', options: ['26 meV', '1 eV', '1.6 × 10⁻¹⁹ J', '300 J'], answer: 0, explanation: '4.1 × 10⁻²¹ J ≈ 0.026 eV.' },
      { question: 'The mean retention time of a bit protected by a barrier ΔE is about…', options: ['τ₀ ΔE/k_BT', 'τ₀ e^(ΔE/k_BT)', 'τ₀ e^(−ΔE/k_BT)', 'ΔE/τ₀'], answer: 1, explanation: 'The Arrhenius–Kramers–Néel law: each extra k_BT multiplies τ by e.' },
      { question: 'Roughly what barrier keeps one bit for ten years if τ₀ = 1 ns?', options: ['4 k_BT', '10 k_BT', '40 k_BT', '400 k_BT'], answer: 2, explanation: 'ln(3 × 10¹⁷) ≈ 40.' },
      { question: 'Why does heat shorten how long stored data lasts?', options: ['It melts the chip', 'It raises k_BT, so the fixed barrier is fewer k_BT tall', 'It lowers the attempt time to zero', 'It adds extra bits'], answer: 1, explanation: 'Retention depends exponentially on ΔE/k_BT.' },
      { question: 'DRAM keeps its data by…', options: ['A tall energy barrier', 'Being read and rewritten (refreshed) every few tens of milliseconds', 'Storing data on magnets', 'Using DNA'], answer: 1, explanation: 'Its charge leaks, so it is actively maintained.' },
      { question: 'Landauer’s principle says that a minimum energy of k_BT ln 2 must be dissipated when…', options: ['A bit is read', 'A bit is erased (reset regardless of its value)', 'A bit is copied', 'A computer is switched on'], answer: 1, explanation: 'Erasure is logically irreversible and reduces the memory’s entropy.' },
      { question: 'Which statement about human memory is best supported by experiments?', options: ['It records events like a video camera', 'Recall reconstructs the past and can change the memory', 'It never forgets anything', 'It holds unlimited items in short-term memory'], answer: 1, explanation: 'Bartlett, Loftus and reconsolidation studies all show memory is reconstructive.' }
    ]);
  };
})();
