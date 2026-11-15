/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 1: Dreams of Thinking Machines
   Figures:
     1. fig-ai-timeline-1     The story at a glance (clickable timeline)
     2. fig-peg-drum          Program a machine with pegs (or punched holes)
     3. fig-llull-wheel       Llull's turning wheels of ideas
     4. fig-difference-engine Babbage's method of differences: tables by adding
     5. fig-boole-switches    Boole's logic as switches and a lamp
     6. fig-quiz-ai1          Test yourself
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
  // Redraw when the reader switches between light and dark themes
  function onTheme(fn) {
    if (!window.MutationObserver) return;
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    new MutationObserver(fn).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  function C() {
    return {
      ink: FIG.getCSSVar('--ink', '#17181c'),
      ink2: FIG.getCSSVar('--ink-secondary', '#4a4d57'),
      muted: FIG.getCSSVar('--ink-muted', '#6b6f7b'),
      faint: FIG.getCSSVar('--ink-faint', '#a2a6b4'),
      accent: FIG.getCSSVar('--accent', '#1b4965'),
      accentLight: FIG.getCSSVar('--accent-light', '#e6eef5'),
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
    { name: 'Myths', color: '#b45309' },
    { name: 'Automata', color: '#0f766e' },
    { name: 'Reasoning as calculation', color: '#7c3aed' },
    { name: 'Engines and logic', color: '#1d4ed8' },
    { name: 'Into the 20th century', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'c. 700 BC', icon: '⚱️', era: 0, sec: 3, title: 'Golden helpers in Homer', text: 'In the Iliad, the smith-god Hephaestus is helped by maidens made of gold who can think, speak and work.' },
    { year: 'c. 250 BC', icon: '🛡️', era: 0, sec: 3, title: 'Talos, the bronze giant', text: 'In the Argonautica, a bronze giant made by Hephaestus guards the island of Crete, until Medea finds his one weak spot.' },
    { year: '1st c. AD', icon: '⚙️', era: 1, sec: 4, title: 'Hero’s automatic theatre', text: 'Hero of Alexandria describes a puppet show that runs by itself, driven by a falling weight and strings wound round a drum.' },
    { year: 'c. 850', icon: '🎶', era: 1, sec: 4, title: 'A flute player with a program', text: 'The Banu Musa brothers in Baghdad describe an automatic flute player whose tune is set by pins on a turning cylinder.' },
    { year: '1206', icon: '🥁', era: 1, sec: 4, title: 'Al-Jazari’s musical boat', text: 'Al-Jazari’s book of ingenious devices includes a boat of mechanical musicians, with pegs on a turning shaft working the drummer.' },
    { year: 'c. 1305', icon: '☸️', era: 2, sec: 6, title: 'Llull’s turning wheels', text: 'Ramon Llull builds paper wheels that combine basic ideas mechanically, hoping to settle arguments by method.' },
    { year: '1642', icon: '🧮', era: 2, sec: 7, title: 'Pascal’s adding machine', text: 'The teenage Blaise Pascal builds a machine that adds and subtracts with geared wheels, to help his tax-collector father.' },
    { year: '1651', icon: '📖', era: 2, sec: 6, title: 'Hobbes: reasoning is reckoning', text: 'Thomas Hobbes writes that reasoning is "nothing but reckoning", that is, adding and subtracting.' },
    { year: '1673', icon: '⚙️', era: 2, sec: 7, title: 'Leibniz’s calculating machine', text: 'Gottfried Leibniz shows the Royal Society a machine designed to multiply as well as add. He dreams of settling disputes by calculation.' },
    { year: '1739', icon: '🦆', era: 1, sec: 5, title: 'Vaucanson’s duck', text: 'A mechanical duck that flaps, quacks, eats and seems to digest. (The "digestion" was a trick.)' },
    { year: '1770', icon: '♟️', era: 1, sec: 14, title: 'The chess-playing Turk', text: 'A famous chess "machine" amazes Europe for decades. A human player was hidden inside.' },
    { year: '1774', icon: '✍️', era: 1, sec: 5, title: 'The Writer', text: 'The Jaquet-Droz family’s boy automaton writes any short text that is set up on a wheel inside it. It still works today.' },
    { year: '1804', icon: '🧵', era: 3, sec: 8, title: 'Jacquard’s punched cards', text: 'Joseph-Marie Jacquard’s loom weaves patterns controlled by chains of punched cards: a pattern stored as holes.' },
    { year: '1822', icon: '🔢', era: 3, sec: 9, title: 'Babbage’s Difference Engine', text: 'Charles Babbage proposes a machine to calculate and print mathematical tables without human error.' },
    { year: '1843', icon: '📝', era: 3, sec: 10, title: 'Ada Lovelace’s notes', text: 'Lovelace publishes notes on Babbage’s Analytical Engine, including a full plan of a calculation for it and the idea that it could handle more than numbers.' },
    { year: '1854', icon: '🔣', era: 3, sec: 11, title: 'Boole’s Laws of Thought', text: 'George Boole shows that logical reasoning can be written as algebra using just 1 (true) and 0 (false).' },
    { year: '1870', icon: '🎹', era: 3, sec: 11, title: 'Jevons’s logic piano', text: 'William Stanley Jevons describes a machine with piano-like keys that works out logical conclusions.' },
    { year: '1921', icon: '🤖', era: 4, sec: 12, title: 'The word "robot"', text: 'Karel Čapek’s play R.U.R. opens in Prague and gives the world the word "robot".' },
    { year: '1937', icon: '💡', era: 4, sec: 11, title: 'Switches can do logic', text: 'Claude Shannon shows that Boole’s logic can be built from electrical switches: the bridge to modern computers (Part 2).' }
  ];

  FIG['fig-ai-timeline-1'] = function (figEl) {
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
    var selected = 13;

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
      var rows = W < 560 ? 3 : 1;
      var per = Math.ceil(EVENTS.length / rows);
      var rowH = 118, H = rows * rowH + 6;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of thinking-machine ideas from about 700 BC to 1937');
      var pad = 26;
      for (var r = 0; r < rows; r++) {
        var y0 = r * rowH, ly = y0 + 62;
        var list = EVENTS.slice(r * per, (r + 1) * per);
        if (!list.length) continue;
        var step = list.length > 1 ? (W - 2 * pad) / (list.length - 1) : 0;
        el('line', { x1: pad - 14, y1: ly, x2: W - pad + 14, y2: ly, stroke: c.border, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        if (rows > 1 && r < rows - 1) txt(svg, W - 6, ly + 4, '→', { anchor: 'end', size: 13, fill: c.faint });
        list.forEach(function (ev, k) {
          var i = r * per + k, x = pad + k * step, era = ERAS[ev.era];
          var g = el('g', { tabindex: 0, role: 'button', 'aria-label': ev.year + ': ' + ev.title, style: 'cursor:pointer;outline:none;' }, svg);
          var above = k % 2 === 0;
          el('line', { x1: x, y1: ly, x2: x, y2: above ? ly - 24 : ly + 24, stroke: era.color, 'stroke-width': 1.2, opacity: 0.6 }, g);
          el('circle', { cx: x, cy: ly, r: i === selected ? 15 : 12.5, fill: i === selected ? era.color : c.surface, stroke: era.color, 'stroke-width': 2 }, g);
          var ic = txt(g, x, ly + 5, ev.icon, { size: 13 });
          ic.setAttribute('font-family', 'sans-serif');
          txt(g, x, above ? ly - 29 : ly + 39, ev.year, { size: 10.5, weight: i === selected ? 700 : 500, fill: i === selected ? c.ink : c.ink2 });
          g.addEventListener('click', function () { show(i); });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
        });
      }
    }
    show(selected);
    var lastW = 0;
    window.addEventListener('resize', function () { var w = svgWrap.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 2. Program a machine with pegs (or holes)
     ----------------------------------------------------------------------- */
  FIG['fig-peg-drum'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ROWS = [
      { name: 'Big drum', icon: '🥁', freq: 70 },
      { name: 'Small drum', icon: '🪘', freq: 180 },
      { name: 'Cymbal', icon: '🔔', freq: 0 },
      { name: 'Flute', icon: '🎶', freq: 660 }
    ];
    var STEPS = 12;
    var PRESETS = {
      'March': ['100000100000', '000100000100', '001000001000', '100010001000'],
      'Dance': ['100100100100', '001001001001', '010101010101', '100000010000'],
      'Slow': ['100000000000', '000000100000', '000000000001', '100000100000']
    };
    var grid = [];
    function load(name) { grid = PRESETS[name].map(function (r) { return r.split('').map(function (c) { return c === '1'; }); }); }
    load('March');
    var mode = 'drum', playing = false, pos = -1, timer = null, sound = false, audio = null;

    var controls = div('fig-controls', container);
    controls.style.marginTop = '0';
    var g1 = div('fig-control-group', controls, '<span class="fig-control-label">Machine</span>');
    var row1 = div('', g1); row1.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    var playB = btn('▶ Play', row1, 'fig-button');
    var soundB = btn('Sound: off', row1);
    var g2 = div('fig-control-group', controls, '<span class="fig-control-label">Load a program</span>');
    var row2 = div('', g2); row2.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    Object.keys(PRESETS).forEach(function (n) {
      btn(n, row2).addEventListener('click', function () { load(n); draw(); });
    });
    btn('Clear', row2).addEventListener('click', function () { grid = grid.map(function (r) { return r.map(function () { return false; }); }); draw(); });
    var g3 = div('fig-control-group', controls, '<span class="fig-control-label">Show the program as</span>');
    var row3 = div('', g3); row3.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    var drumB = btn('Pegs on a drum', row3), cardB = btn('Holes in a card', row3);
    drumB.addEventListener('click', function () { mode = 'drum'; draw(); });
    cardB.addEventListener('click', function () { mode = 'card'; draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var note = div('fig-readout', container); note.style.cssText = 'margin-top:0.5rem;font-family:var(--font-sans);font-size:0.85rem;color:var(--ink-muted);font-weight:400;';
    note.textContent = 'Tap the grid to add or remove pegs, then press Play. The machine stays the same; only the pattern changes.';

    function hit(r) {
      if (!sound) return;
      try {
        if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
        var t = audio.currentTime, gain = audio.createGain();
        gain.connect(audio.destination);
        if (ROWS[r].freq === 0) {
          var len = audio.sampleRate * 0.15, buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
          for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
          var src = audio.createBufferSource(); src.buffer = buf;
          gain.gain.value = 0.15; src.connect(gain); src.start(t);
        } else {
          var o = audio.createOscillator();
          o.type = r === 3 ? 'triangle' : 'sine';
          o.frequency.setValueAtTime(ROWS[r].freq * (r === 3 ? 1 : 2), t);
          if (r < 2) o.frequency.exponentialRampToValueAtTime(ROWS[r].freq, t + 0.12);
          gain.gain.setValueAtTime(r === 3 ? 0.12 : 0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + (r === 3 ? 0.25 : 0.2));
          o.connect(gain); o.start(t); o.stop(t + 0.3);
        }
      } catch (e) { /* sound is optional */ }
    }

    function draw() {
      var c = C();
      drumB.classList.toggle('active', mode === 'drum');
      cardB.classList.toggle('active', mode === 'card');
      svgWrap.innerHTML = '';
      var W = Math.max(290, Math.min(640, Math.round(svgWrap.clientWidth || 600)));
      var narrow = W < 520, left = narrow ? 42 : 120, top = 30, cw = (W - left - 14) / STEPS, ch = narrow ? 38 : 42, H = top + ROWS.length * ch + (narrow ? 14 : 30);
      var svg = FIG.createSVG(svgWrap, W, H, 'A grid of pegs that acts as a program for mechanical musicians');
      var card = mode === 'card';
      el('rect', { x: left - 6, y: top - 8, width: STEPS * cw + 12, height: ROWS.length * ch + 16, rx: card ? 3 : 14,
        fill: card ? '#e9dcc0' : c.sunken, stroke: card ? '#b8a37a' : c.border }, svg);
      if (!card) for (var s = 0; s < STEPS; s++) el('line', { x1: left + s * cw + cw / 2, y1: top - 8, x2: left + s * cw + cw / 2, y2: top + ROWS.length * ch + 8, stroke: c.border, 'stroke-width': 1 }, svg);
      if (pos >= 0) el('rect', { x: left + pos * cw + 2, y: top - 12, width: cw - 4, height: ROWS.length * ch + 24, rx: 4, fill: c.accent, opacity: 0.16 }, svg);
      ROWS.forEach(function (row, r) {
        var y = top + r * ch + ch / 2;
        var on = pos >= 0 && grid[r][pos];
        var ic = txt(svg, 22, y + 7, row.icon, { size: on ? 24 : 19 });
        ic.setAttribute('font-family', 'sans-serif');
        if (!narrow) txt(svg, 44, y + 4, row.name, { anchor: 'start', size: 12, weight: on ? 700 : 500, fill: on ? c.accent : c.ink2 });
        for (var s2 = 0; s2 < STEPS; s2++) {
          var x = left + s2 * cw + cw / 2, v = grid[r][s2];
          var cell = el('g', { style: 'cursor:pointer;', role: 'button', tabindex: 0, 'aria-label': row.name + ', step ' + (s2 + 1) + (v ? ', on' : ', off') }, svg);
          el('rect', { x: x - cw / 2, y: y - ch / 2, width: cw, height: ch, fill: 'transparent' }, cell);
          if (card) {
            var hw = Math.min(8, cw / 2 - 3);
            if (v) el('rect', { x: x - hw, y: y - 12, width: 2 * hw, height: 24, rx: 3, fill: '#2b2418' }, cell);
            else el('rect', { x: x - hw, y: y - 12, width: 2 * hw, height: 24, rx: 3, fill: 'none', stroke: '#c9b48a', 'stroke-dasharray': '2 3' }, cell);
          } else {
            if (v) {
              el('rect', { x: x - 5, y: y - 13, width: 10, height: 26, rx: 4, fill: (pos === s2) ? c.accent : c.ink2 }, cell);
            } else el('circle', { cx: x, cy: y, r: 3, fill: c.faint }, cell);
          }
          (function (rr, ss) {
            var toggle = function () { grid[rr][ss] = !grid[rr][ss]; draw(); };
            cell.addEventListener('click', toggle);
            cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
          })(r, s2);
        }
      });
      if (!narrow) txt(svg, left + (STEPS * cw) / 2, H - 6, card ? 'Each row of holes tells one part of the machine when to act (as in Jacquard’s cards)' : 'The drum turns left to right; each peg trips a lever when it comes round', { size: 11, fill: c.muted });
    }
    function tick() {
      pos = (pos + 1) % STEPS;
      for (var r = 0; r < ROWS.length; r++) if (grid[r][pos]) hit(r);
      draw();
    }
    playB.addEventListener('click', function () {
      playing = !playing;
      playB.textContent = playing ? '⏸ Pause' : '▶ Play';
      if (playing) { tick(); timer = setInterval(tick, 300); } else { clearInterval(timer); }
    });
    soundB.addEventListener('click', function () {
      sound = !sound;
      soundB.textContent = sound ? 'Sound: on' : 'Sound: off';
      soundB.classList.toggle('active', sound);
    });
    draw();
    onTheme(draw);
    window.addEventListener('resize', function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure 3. Llull's wheels
     ----------------------------------------------------------------------- */
  var LLULL = [
    { l: 'B', noun: 'Goodness', adj: 'good' },
    { l: 'C', noun: 'Greatness', adj: 'great' },
    { l: 'D', noun: 'Eternity', adj: 'eternal' },
    { l: 'E', noun: 'Power', adj: 'powerful' },
    { l: 'F', noun: 'Wisdom', adj: 'wise' },
    { l: 'G', noun: 'Will', adj: 'willing' },
    { l: 'H', noun: 'Virtue', adj: 'virtuous' },
    { l: 'I', noun: 'Truth', adj: 'true' },
    { l: 'K', noun: 'Glory', adj: 'glorious' }
  ];
  FIG['fig-llull-wheel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var turn = 1, pick = 0, seen = {};
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var g = div('fig-control-group', controls, '<span class="fig-control-label">Turn the inner wheel</span>');
    var row = div('', g); row.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;';
    var back = btn('◀ Back', row), fwd = btn('Forward ▶', row);
    var readTurn = document.createElement('span'); readTurn.className = 'fig-readout'; row.appendChild(readTurn);
    var g2 = div('fig-control-group', controls, '<span class="fig-control-label">Pairings found so far</span>');
    var countEl = div('fig-readout', g2);
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:1 1 260px;max-width:380px;margin:0 auto;';
    var list = div('', lay); list.style.cssText = 'flex:1 1 240px;font-family:var(--font-sans);font-size:0.88rem;line-height:1.55;color:var(--ink-secondary);';

    function draw() {
      var c = C();
      for (var i = 0; i < 9; i++) seen[i + ',' + ((i + turn) % 9)] = 1;
      readTurn.textContent = 'Turn ' + (turn || 9) + ' of 9';
      countEl.textContent = Object.keys(seen).length + ' of 81 (with a third wheel: 729)';
      svgWrap.innerHTML = '';
      var S = 360, cx = 180, cy = 180;
      var svg = FIG.createSVG(svgWrap, S, S, 'Two concentric wheels of lettered ideas, as in Ramon Llull’s Art');
      el('circle', { cx: cx, cy: cy, r: 172, fill: c.raised, stroke: c.border, 'stroke-width': 2 }, svg);
      el('circle', { cx: cx, cy: cy, r: 118, fill: c.surface, stroke: c.accent, 'stroke-width': 2 }, svg);
      el('circle', { cx: cx, cy: cy, r: 64, fill: c.raised, stroke: c.border }, svg);
      txt(svg, cx, cy - 4, 'Turn the', { size: 12, fill: c.muted });
      txt(svg, cx, cy + 12, 'inner wheel', { size: 12, fill: c.muted });
      for (var k = 0; k < 9; k++) {
        var a = -Math.PI / 2 + k * 2 * Math.PI / 9;
        var inner = LLULL[(k + turn) % 9], outer = LLULL[k];
        var hl = k === pick;
        var ox = cx + 146 * Math.cos(a), oy = cy + 146 * Math.sin(a);
        var ix = cx + 92 * Math.cos(a), iy = cy + 92 * Math.sin(a);
        el('line', { x1: cx + 66 * Math.cos(a), y1: cy + 66 * Math.sin(a), x2: cx + 116 * Math.cos(a), y2: cy + 116 * Math.sin(a), stroke: c.border }, svg);
        if (hl) el('line', { x1: ix, y1: iy, x2: ox, y2: oy, stroke: c.warn, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        var go = el('g', { style: 'cursor:pointer;', tabindex: 0, role: 'button', 'aria-label': outer.noun + ' with ' + inner.noun }, svg);
        el('circle', { cx: ox, cy: oy, r: 19, fill: hl ? c.warn : c.surface, stroke: c.warn, 'stroke-width': 1.5 }, go);
        txt(go, ox, oy + 6, outer.l, { size: 17, weight: 700, fill: hl ? '#fff' : c.warn, font: FIG.getCSSVar('--font-serif') });
        el('circle', { cx: ix, cy: iy, r: 17, fill: hl ? c.accent : c.surface, stroke: c.accent, 'stroke-width': 1.5 }, go);
        txt(go, ix, iy + 6, inner.l, { size: 16, weight: 700, fill: hl ? '#fff' : c.accent, font: FIG.getCSSVar('--font-serif') });
        (function (kk) {
          go.addEventListener('click', function () { pick = kk; draw(); });
          go.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick = kk; draw(); } });
        })(k);
      }
      var html = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.3rem;">The wheel now pairs:</div><ul style="margin:0;padding-left:1.1rem;">';
      for (var j = 0; j < 9; j++) {
        var o = LLULL[j], n = LLULL[(j + turn) % 9];
        var line = o.l + '–' + n.l + ': ' + o.noun + ' is ' + n.adj;
        html += '<li' + (j === pick ? ' style="color:var(--ink);font-weight:700;"' : '') + '>' + line + '</li>';
      }
      list.innerHTML = html + '</ul>';
    }
    back.addEventListener('click', function () { turn = (turn + 8) % 9; draw(); });
    fwd.addEventListener('click', function () { turn = (turn + 1) % 9; draw(); });
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Babbage's method of differences
     ----------------------------------------------------------------------- */
  var POLYS = {
    sq: { label: 'Squares: n × n', start: [0, 1, 2], f: function (n) { return n * n; } },
    euler: { label: 'Babbage’s favourite: n × n + n + 41', start: [41, 2, 2], f: function (n) { return n * n + n + 41; }, primes: true },
    cube: { label: 'Cubes: n × n × n', start: [0, 1, 6, 6], f: function (n) { return n * n * n; } }
  };
  function isPrime(x) { if (x < 2) return false; for (var d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; }
  FIG['fig-difference-engine'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var key = 'euler', cols, n, printed, adds, flash = -1;
    function reset() { cols = POLYS[key].start.slice(); n = 0; printed = [cols[0]]; adds = 0; flash = -1; }
    reset();
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sel = FIG.select(controls, {
      id: 'de-poly', label: 'Table to calculate', value: key,
      options: Object.keys(POLYS).map(function (k) { return { value: k, label: POLYS[k].label }; }),
      onChange: function (v) { key = v; reset(); draw(); }
    });
    var g = div('fig-control-group', controls, '<span class="fig-control-label">Engine</span>');
    var row = div('', g); row.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    var turnB = btn('Turn the handle', row, 'fig-button');
    var fiveB = btn('×5', row);
    var resetB = btn('Reset', row);
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:2 1 300px;';
    var table = div('', lay); table.style.cssText = 'flex:1 1 170px;font-family:var(--font-mono);font-size:0.85rem;line-height:1.6;max-height:260px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;background:var(--surface-raised);';
    var note = div('fig-readout', container); note.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.86rem;font-weight:500;';

    function step() {
      // Each column receives the column to its right: value += 1st difference, 1st += 2nd, ...
      for (var i = 0; i < cols.length - 1; i++) { cols[i] += cols[i + 1]; adds++; }
      n++; printed.push(cols[0]); flash = n;
    }
    function draw() {
      var c = C(), P = POLYS[key];
      svgWrap.innerHTML = '';
      var k = cols.length, W = Math.max(280, Math.min(440, Math.round(svgWrap.clientWidth || 440))), H = 272;
      var cw = Math.min(92, (W - 10 * (k + 1)) / k), gap = (W - k * cw) / (k + 1), narrowDE = W < 400;
      var svg = FIG.createSVG(svgWrap, W, H, 'Columns of number wheels in a difference engine');
      var names = ['Value', '1st difference', '2nd difference', '3rd difference'];
      for (var i = 0; i < k; i++) {
        var x = gap + i * (cw + gap);
        txt(svg, x + cw / 2, 22, narrowDE ? ['Value', '1st diff.', '2nd diff.', '3rd diff.'][i] : names[i], { size: 12, weight: 600, fill: i === 0 ? c.accent : c.ink2 });
        el('rect', { x: x, y: 34, width: cw, height: 150, rx: 10, fill: c.raised, stroke: i === 0 ? c.accent : c.border, 'stroke-width': i === 0 ? 2 : 1 }, svg);
        // Digit wheels, top = highest digit
        var digits = String(cols[i]).padStart(4, '0').slice(-4).split('');
        digits.forEach(function (d, j) {
          var yy = 44 + j * 34;
          var inset = Math.min(16, cw * 0.18);
          el('rect', { x: x + inset, y: yy, width: cw - 2 * inset, height: 28, rx: 6, fill: c.surface, stroke: c.border }, svg);
          txt(svg, x + cw / 2, yy + 20, d, { size: 17, weight: 700, font: FIG.getCSSVar('--font-mono'), fill: c.ink });
        });
        txt(svg, x + cw / 2, 206, '= ' + cols[i], { size: 13, weight: 700, fill: i === 0 ? c.accent : c.ink2 });
        if (i < k - 1) {
          el('path', { d: 'M' + (x + cw + gap + cw * 0.38) + ' 232 L' + (x + cw - cw * 0.38) + ' 232', stroke: c.warn, 'stroke-width': 2, fill: 'none', 'marker-end': 'url(#de-arrow)' }, svg);
        }
      }
      var defs = el('defs', {}, svg);
      var m = el('marker', { id: 'de-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      el('path', { d: 'M0 0 L10 5 L0 10 z', fill: c.warn }, m);
      if (narrowDE) { txt(svg, W / 2, 254, 'Each turn, every column adds in', { size: 11.5, fill: c.muted }); txt(svg, W / 2, 268, 'the number from the column on its right', { size: 11.5, fill: c.muted }); }
      else txt(svg, W / 2, 262, 'Each turn: every column adds in the number from the column on its right', { size: 11.5, fill: c.muted });
      var html = '<div style="font-family:var(--font-sans);font-weight:700;color:var(--ink);margin-bottom:0.25rem;">Printed table</div>';
      printed.forEach(function (v, i) {
        var ok = v === P.f(i);
        var pr = P.primes ? (isPrime(v) ? ' <span style="color:var(--callout-tip);">prime</span>' : ' <span style="color:var(--callout-warn);">not prime</span>') : '';
        html += '<div' + (i === flash ? ' style="background:var(--accent-light);border-radius:3px;"' : '') + '>n = ' + i + ': <strong>' + v + '</strong>' + (ok ? '' : ' ✗') + pr + '</div>';
      });
      table.innerHTML = html;
      table.scrollTop = table.scrollHeight;
      note.innerHTML = 'Additions so far: <strong>' + adds + '</strong>. Multiplications: <strong>0</strong>.' +
        (P.primes && n >= 40 ? ' At n = 40 the formula gives 1681 = 41 × 41, its first non-prime.' : '');
      turnB.disabled = cols[0] > 9999 - 200;
      fiveB.disabled = turnB.disabled;
    }
    turnB.addEventListener('click', function () { step(); draw(); });
    fiveB.addEventListener('click', function () { for (var i = 0; i < 5 && cols[0] < 9500; i++) step(); draw(); });
    resetB.addEventListener('click', function () { reset(); draw(); });
    draw();
    onTheme(draw);
    window.addEventListener('resize', function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure 5. Boole's logic as switches and a lamp
     ----------------------------------------------------------------------- */
  FIG['fig-boole-switches'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var A = 1, B = 0, op = 'AND';
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var g = div('fig-control-group', controls, '<span class="fig-control-label">Rule</span>');
    var row = div('', g); row.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    var opBtns = {};
    ['AND', 'OR', 'NOT'].forEach(function (o) { opBtns[o] = btn(o, row); opBtns[o].addEventListener('click', function () { op = o; draw(); }); });
    var g2 = div('fig-control-group', controls, '<span class="fig-control-label">Switches (or tap them in the picture)</span>');
    var row2 = div('', g2); row2.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
    var aB = btn('', row2), bB = btn('', row2);
    aB.addEventListener('click', function () { A = 1 - A; draw(); });
    bB.addEventListener('click', function () { B = 1 - B; draw(); });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgCol = div('', lay); svgCol.style.cssText = 'flex:2 1 300px;';
    var svgWrap = div('', svgCol);
    var hint = div('', svgCol); hint.style.cssText = 'font-family:var(--font-sans);font-size:0.85rem;color:var(--ink-muted);text-align:center;margin-top:0.25rem;';
    var side = div('', lay); side.style.cssText = 'flex:1 1 200px;font-family:var(--font-sans);font-size:0.88rem;';

    function out() { return op === 'AND' ? A & B : op === 'OR' ? A | B : 1 - A; }
    function sw(svg, x, y, closed, label, c, live, onClick) {
      var gg = el('g', { style: 'cursor:pointer;', tabindex: 0, role: 'button', 'aria-label': 'Switch ' + label + (closed ? ' closed' : ' open') }, svg);
      el('rect', { x: x - 6, y: y - 30, width: 62, height: 46, fill: 'transparent' }, gg);
      var col = live ? c.warn : c.ink2;
      el('circle', { cx: x, cy: y, r: 4, fill: col }, gg);
      el('circle', { cx: x + 50, cy: y, r: 4, fill: col }, gg);
      var ex = closed ? x + 50 : x + 40, ey = closed ? y : y - 24;
      el('line', { x1: x, y1: y, x2: ex, y2: ey, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }, gg);
      txt(gg, x + 25, y + 26, label, { size: 17, weight: 700, fill: c.ink });
      gg.addEventListener('click', onClick);
      gg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } });
    }
    function wire(svg, pts, on, c) {
      el('polyline', { points: pts, fill: 'none', stroke: on ? c.warn : c.faint, 'stroke-width': on ? 3 : 2, 'stroke-linejoin': 'round' }, svg);
    }
    function draw() {
      var c = C(), lit = out();
      for (var k in opBtns) opBtns[k].classList.toggle('active', k === op);
      aB.textContent = 'A: ' + (A ? 'on (1)' : 'off (0)'); aB.classList.toggle('active', !!A);
      bB.textContent = 'B: ' + (B ? 'on (1)' : 'off (0)'); bB.classList.toggle('active', !!B);
      bB.style.display = op === 'NOT' ? 'none' : '';
      svgWrap.innerHTML = '';
      var W = 490, H = 230;
      var svg = FIG.createSVG(svgWrap, W, H, 'A battery, switches and a lamp wired to show the ' + op + ' rule');
      // Battery on the left
      el('line', { x1: 30, y1: 102, x2: 70, y2: 102, stroke: c.ink, 'stroke-width': 3 }, svg);
      el('line', { x1: 38, y1: 114, x2: 62, y2: 114, stroke: c.ink, 'stroke-width': 3 }, svg);
      txt(svg, 78, 113, 'battery', { size: 14, fill: c.muted, anchor: 'start' });
      wire(svg, '50,102 50,40 120,40', lit, c);
      wire(svg, '50,114 50,190 380,190 380,150', lit, c);
      if (op === 'AND') {
        sw(svg, 120, 40, !!A, 'A', c, lit, function () { A = 1 - A; draw(); });
        wire(svg, '170,40 220,40', lit, c);
        sw(svg, 220, 40, !!B, 'B', c, lit, function () { B = 1 - B; draw(); });
        wire(svg, '270,40 380,40 380,94', lit, c);
        hint.textContent = 'Switches in a row (series): both must be on.';
      } else if (op === 'OR') {
        wire(svg, '120,40 150,40', lit, c);
        wire(svg, '150,40 150,100 190,100', lit && B, c);
        sw(svg, 190, 40, !!A, 'A', c, lit && A, function () { A = 1 - A; draw(); });
        sw(svg, 190, 100, !!B, 'B', c, lit && B, function () { B = 1 - B; draw(); });
        wire(svg, '140,40 190,40', lit && A, c);
        wire(svg, '240,100 290,100 290,40', lit && B, c);
        wire(svg, '240,40 380,40 380,94', lit, c);
        hint.textContent = 'Switches side by side (parallel): either one will do.';
      } else {
        sw(svg, 170, 40, !A, 'A', c, lit, function () { A = 1 - A; draw(); });
        wire(svg, '120,40 170,40', lit, c);
        wire(svg, '220,40 380,40 380,94', lit, c);
        hint.textContent = 'A spring keeps this switch closed; turning A on pushes it open and breaks the circuit.';
      }
      // Lamp
      if (lit) el('circle', { cx: 380, cy: 122, r: 34, fill: '#fde68a', opacity: 0.55 }, svg);
      el('circle', { cx: 380, cy: 122, r: 22, fill: lit ? '#facc15' : c.surface, stroke: c.ink2, 'stroke-width': 2 }, svg);
      el('path', { d: 'M366 122 q7 -12 14 0 q7 12 14 0', fill: 'none', stroke: lit ? '#92400e' : c.faint, 'stroke-width': 2 }, svg);
      txt(svg, 418, 127, lit ? 'ON (1)' : 'OFF (0)', { size: 15, weight: 700, anchor: 'start', fill: lit ? c.warn : c.muted });

      var rowsT = op === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
      var h = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.35rem;">Truth table for ' + op + '</div>' +
        '<table style="border-collapse:collapse;font-family:var(--font-mono);font-size:0.86rem;"><tr>' +
        '<th style="padding:2px 10px;border-bottom:1px solid var(--border);">A</th>' + (op === 'NOT' ? '' : '<th style="padding:2px 10px;border-bottom:1px solid var(--border);">B</th>') +
        '<th style="padding:2px 10px;border-bottom:1px solid var(--border);">' + (op === 'NOT' ? 'NOT A' : 'A ' + op + ' B') + '</th></tr>';
      rowsT.forEach(function (r) {
        var a = r[0], b = r[1] || 0, o = op === 'AND' ? a & b : op === 'OR' ? a | b : 1 - a;
        var cur = a === A && (op === 'NOT' || b === B);
        h += '<tr style="' + (cur ? 'background:var(--accent-light);font-weight:700;' : '') + '"><td style="padding:2px 10px;text-align:center;">' + a + '</td>' +
          (op === 'NOT' ? '' : '<td style="padding:2px 10px;text-align:center;">' + b + '</td>') + '<td style="padding:2px 10px;text-align:center;">' + o + '</td></tr>';
      });
      h += '</table><div style="margin-top:0.5rem;color:var(--ink-muted);line-height:1.45;">' +
        (op === 'AND' ? 'Boole wrote AND as multiplication: 1 × 0 = 0, and only 1 × 1 = 1.' : op === 'OR' ? 'OR is true if at least one input is true.' : 'NOT flips the value: Boole wrote it as 1 − A.') + '</div>';
      side.innerHTML = h;
    }
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      {
        question: 'In Greek myth, what was Talos?',
        options: ['A clockwork bird that sang', 'A bronze giant who guarded the island of Crete', 'A talking statue in Athens', 'A calculating machine used by Archimedes'],
        answer: 1,
        explanation: 'Talos was a bronze giant, said to be made by the smith-god Hephaestus, who walked round Crete and threw rocks at approaching ships.'
      },
      {
        question: 'What made the Banu Musa brothers’ flute player (about 850) an early example of a programmable machine?',
        options: ['It could understand speech', 'It ran on electricity', 'Its tune was set by pins on a cylinder that could be swapped for a different one', 'It was operated by a hidden musician'],
        answer: 2,
        explanation: 'Change the pinned cylinder and the same machine plays a different tune: the behaviour is set by a replaceable pattern, which is the core idea of a program.'
      },
      {
        question: 'What did Ramon Llull’s paper wheels do?',
        options: ['They combined a small set of basic ideas mechanically, to generate every pairing for an argument', 'They told the time', 'They added and subtracted numbers', 'They printed books'],
        answer: 0,
        explanation: 'Turning the wheels lined up letters standing for ideas such as Goodness and Truth, so that every combination could be considered in turn.'
      },
      {
        question: 'What did Thomas Hobbes claim about reasoning in 1651?',
        options: ['Only God can reason', 'Reasoning is "nothing but reckoning": adding and subtracting', 'Machines will never calculate', 'Reasoning happens in the heart'],
        answer: 1,
        explanation: 'Hobbes’s claim that thinking is a kind of calculation is one of the earliest statements of the idea behind AI.'
      },
      {
        question: 'What did Leibniz hope people would say when they disagreed?',
        options: ['"Let us vote"', '"Let us pray"', '"Let us calculate"', '"Let us fight"'],
        answer: 2,
        explanation: 'Leibniz dreamed of a precise language of thought in which arguments could be settled by calculation, the way a sum is checked.'
      },
      {
        question: 'What did Jacquard’s loom (1804) use to control the pattern it wove?',
        options: ['A hidden weaver', 'A chain of punched cards', 'Electric switches', 'A spoken command'],
        answer: 1,
        explanation: 'Holes in the cards decided which threads were lifted. Babbage borrowed the idea for his Analytical Engine.'
      },
      {
        question: 'Why could Babbage’s Difference Engine work out tables using only additions?',
        options: ['Because it guessed the answers', 'Because it used a table of logarithms', 'Because of the method of differences: for polynomials, each new value can be built by adding up differences', 'Because it only worked with even numbers'],
        answer: 2,
        explanation: 'For a formula like n × n, the differences between values eventually become constant, so every new entry can be reached by adding.'
      },
      {
        question: 'What was Ada Lovelace’s big idea about the Analytical Engine?',
        options: ['That it would be too expensive to build', 'That it could act on anything expressed in symbols, such as music, not just numbers', 'That it would one day think for itself', 'That it should be powered by steam'],
        answer: 1,
        explanation: 'She saw a general symbol-handling machine. But she also warned it could not "originate anything": it does what we order it to do.'
      },
      {
        question: 'What did George Boole show in 1854?',
        options: ['That logical reasoning can be written as algebra, using 1 for true and 0 for false', 'That machines can feel', 'That all numbers are prime', 'How to build a steam engine'],
        answer: 0,
        explanation: 'Boole’s algebra of logic later became the language of computer circuits, after Shannon showed switches could carry it out.'
      },
      {
        question: 'Where does the word "robot" come from?',
        options: ['A Greek word for bronze', 'Karel Čapek’s 1920 play R.U.R., from a Czech word for forced labour', 'Babbage’s notebooks', 'An American comic book'],
        answer: 1,
        explanation: 'The word, suggested by Čapek’s brother Josef, comes from "robota", forced labour. Čapek’s robots were artificial people rather than metal machines.'
      }
    ]);
  };
})();
