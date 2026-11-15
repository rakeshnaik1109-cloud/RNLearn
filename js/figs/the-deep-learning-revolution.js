/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 5: The Deep Learning Revolution
   Figures:
     1. fig-ai-timeline-5   The story at a glance (clickable timeline)
     2. fig-gpu-race        Why GPUs: a few fast workers against thousands of slow ones
     3. fig-imagenet-chart  ImageNet error, year by year
     4. fig-word-vectors    Words as points: analogies by arithmetic (toy example)
     5. fig-adversarial     Fooling a classifier with tiny changes (toy example)
     6. fig-quiz-ai5        Test yourself
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
    { name: 'Seeing and hearing', color: '#1d4ed8' },
    { name: 'Language', color: '#0f766e' },
    { name: 'Games and science', color: '#b45309' },
    { name: 'Growing pains', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '2010', icon: '🏁', era: 0, sec: 3, title: 'The ImageNet challenge begins', text: 'An annual contest asks programs to sort photos into 1,000 categories. The best systems get about 28% of answers wrong.' },
    { year: '2012', icon: '🗣️', era: 0, sec: 6, title: 'Deep nets for speech', text: 'Groups at Toronto, Microsoft, Google and IBM report that deep networks cut speech-recognition errors sharply.' },
    { year: '2012', icon: '🐱', era: 0, sec: 6, title: 'The "cat neuron"', text: 'A Google network watching YouTube frames, with no labels, develops a neuron that responds to cats.' },
    { year: '2012', icon: '💥', era: 0, sec: 3, title: 'AlexNet', text: 'A deep network trained on two gaming graphics cards wins ImageNet by a huge margin. The deep-learning era begins.' },
    { year: '2013', icon: '📍', era: 1, sec: 7, title: 'word2vec', text: 'Words become points in space, so that "king − man + woman" lands near "queen".' },
    { year: '2013', icon: '🕹️', era: 2, sec: 10, title: 'Playing Atari', text: 'DeepMind’s network learns to play classic video games from the screen pixels and the score alone.' },
    { year: '2014', icon: '🎭', era: 1, sec: 9, title: 'GANs', text: 'Ian Goodfellow’s generative adversarial networks pit two networks against each other to create realistic images.' },
    { year: '2014', icon: '🔀', era: 1, sec: 8, title: 'Sequence to sequence and attention', text: 'Networks learn to translate whole sentences, and "attention" lets them look back at the relevant words.' },
    { year: '2015', icon: '🏔️', era: 0, sec: 5, title: 'ResNet: 152 layers', text: 'Microsoft’s very deep network makes fewer ImageNet errors than a trained human tester.' },
    { year: '2016', icon: '⚫', era: 2, sec: 10, title: 'AlphaGo beats Lee Sedol', text: 'DeepMind’s AlphaGo defeats one of the world’s best Go players 4–1 in Seoul.' },
    { year: '2016', icon: '🌐', era: 1, sec: 8, title: 'Neural translation goes live', text: 'Google switches its translation service to a neural network, cutting errors on major language pairs.' },
    { year: '2017', icon: '♾️', era: 2, sec: 10, title: 'AlphaGo Zero', text: 'A new version learns Go entirely by playing itself, and beats the original AlphaGo 100 games to 0.' },
    { year: '2018', icon: '⚖️', era: 3, sec: 12, title: 'Gender Shades', text: 'Joy Buolamwini and Timnit Gebru show commercial face-analysis systems make far more errors on darker-skinned women.' },
    { year: '2019', icon: '🏆', era: 3, sec: 12, title: 'Turing Award', text: 'Bengio, Hinton and LeCun receive computing’s highest honour for deep learning.' },
    { year: '2020', icon: '🧬', era: 2, sec: 11, title: 'AlphaFold 2', text: 'DeepMind’s AlphaFold predicts protein structures with accuracy close to laboratory experiments.' },
    { year: '2021', icon: '📚', era: 2, sec: 11, title: 'Structures for everyone', text: 'Predicted structures are released for free; within a year the database covers over 200 million proteins.' }
  ];
  FIG['fig-ai-timeline-5'] = function (figEl) {
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
    var selected = 3;
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
      var rows = W < 560 ? 3 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 26;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of deep learning from 2010 to 2021');
      for (var r = 0; r < rows; r++) {
        var ly = r * rowH + 62, list = EVENTS.slice(r * per, (r + 1) * per);
        if (!list.length) continue;
        var step = list.length > 1 ? (W - 2 * pad) / (list.length - 1) : 0;
        el('line', { x1: pad - 14, y1: ly, x2: W - pad + 14, y2: ly, stroke: c.border, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        if (rows > 1 && r < rows - 1) txt(svg, W - 6, ly + 4, '→', { anchor: 'end', size: 13, fill: c.faint });
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
     Figure 2. Why GPUs: a race between a few fast workers and many slow ones
     ----------------------------------------------------------------------- */
  FIG['fig-gpu-race'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var COLS = 32, ROWS = 18, N = COLS * ROWS, tick = 0, timer = null;
    var CPU = { workers: 4, perCell: 1 }, GPU = { workers: N, perCell: 12 };
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Race');
    var goB = btn('▶ Start the race', row, 'fig-button'), resetB = btn('Reset', row);
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.75rem;';
    function lane(title, sub) {
      var d = div('', lay); d.style.cssText = 'flex:1 1 260px;font-family:var(--font-sans);';
      d.insertAdjacentHTML('beforeend', '<div style="font-weight:700;color:var(--ink);font-size:0.92rem;">' + title + '</div><div style="color:var(--ink-muted);font-size:0.8rem;margin-bottom:0.3rem;">' + sub + '</div>');
      var cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;aspect-ratio:' + COLS + '/' + ROWS + ';border:1px solid var(--border);border-radius:var(--radius-sm);display:block;';
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', title + ': grid of calculations filling in');
      d.appendChild(cv);
      var r = div('fig-readout', d); r.style.marginTop = '0.3rem';
      return { cv: cv, read: r };
    }
    var A = lane('CPU: 4 fast workers', 'Each finishes one calculation per time step'), B = lane('GPU: 576 slower workers', 'Each needs 12 time steps per calculation, but they all work at once');
    function doneCount(spec) {
      if (spec === CPU) return Math.min(N, tick * CPU.workers / CPU.perCell);
      return tick >= GPU.perCell ? N : 0;
    }
    function paint(l, spec, color) {
      var c = C(), dpr = window.devicePixelRatio || 1, w = Math.max(200, l.cv.parentNode.clientWidth || 300), h = w * ROWS / COLS;
      l.cv.width = w * dpr; l.cv.height = h * dpr;
      var ctx = l.cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = c.sunken; ctx.fillRect(0, 0, w, h);
      var cw = w / COLS, ch = h / ROWS, done = Math.floor(doneCount(spec)), partial = spec === GPU && tick < GPU.perCell ? tick / GPU.perCell : 0;
      for (var i = 0; i < N; i++) {
        var x = (i % COLS) * cw, y = Math.floor(i / COLS) * ch;
        if (i < done) { ctx.fillStyle = color; ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1); }
        else if (partial > 0) { ctx.globalAlpha = partial * 0.8; ctx.fillStyle = color; ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1); ctx.globalAlpha = 1; }
        else if (spec === CPU && i < done + CPU.workers && tick > 0) { ctx.fillStyle = c.faint; ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1); }
      }
      l.read.textContent = 'Time steps: ' + Math.min(tick, spec === CPU ? N / CPU.workers : GPU.perCell) + ' · done: ' + done + ' of ' + N + (done >= N ? ' ✓' : '');
    }
    function draw() { paint(A, CPU, '#d97706'); paint(B, GPU, '#2563eb'); }
    function stop() { clearInterval(timer); timer = null; goB.textContent = '▶ Start the race'; }
    goB.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (tick >= N / CPU.workers) tick = 0;
      goB.textContent = '⏸ Pause';
      timer = setInterval(function () { tick++; draw(); if (tick >= N / CPU.workers) stop(); }, 45);
    });
    resetB.addEventListener('click', function () { stop(); tick = 0; draw(); });
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. ImageNet error, year by year
     ----------------------------------------------------------------------- */
  var INET = [
    { y: 2010, e: 28, who: 'NEC and University of Illinois', how: 'Hand-designed image features plus a support vector machine (Part 4).' },
    { y: 2011, e: 26, who: 'Xerox Research Centre Europe', how: 'Hand-designed features again: progress was slowing.' },
    { y: 2012, e: 15, who: 'SuperVision (AlexNet), University of Toronto', how: 'A deep convolutional network with 8 learned layers, trained on two graphics cards.', deep: true },
    { y: 2013, e: 12, who: 'Clarifai', how: 'A refined deep network. By now almost every entry was deep.', deep: true },
    { y: 2014, e: 7, who: 'GoogLeNet, Google', how: 'A 22-layer network built from repeated "inception" modules.', deep: true },
    { y: 2015, e: 3.6, who: 'ResNet, Microsoft Research', how: '152 layers, made trainable by "shortcut" connections that let signals skip layers.', deep: true },
    { y: 2016, e: 3.0, who: 'Trimps-Soushen', how: 'A combination of several very deep networks.', deep: true },
    { y: 2017, e: 2.3, who: 'SENet (Momenta and Oxford)', how: 'Networks that learn which features to emphasise. The final year of the contest.', deep: true }
  ];
  FIG['fig-imagenet-chart'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sel = 2;
    var svgWrap = div('', container);
    var info = div('', container); info.style.cssText = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;min-height:3.6rem;';
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.min(680, Math.round(svgWrap.clientWidth || 640))), H = 270, L = 38, Rm = 8, T = 16, B = 34;
      var svg = FIG.createSVG(svgWrap, W, H, 'Bar chart of the winning ImageNet error rate each year from 2010 to 2017');
      var y = function (v) { return T + (1 - v / 30) * (H - T - B); };
      [0, 10, 20, 30].forEach(function (v) {
        el('line', { x1: L, y1: y(v), x2: W - Rm, y2: y(v), stroke: c.border, 'stroke-width': 1 }, svg);
        txt(svg, L - 6, y(v) + 4, v + '%', { anchor: 'end', size: 11, fill: c.muted });
      });
      var bw = (W - L - Rm) / INET.length;
      INET.forEach(function (d, i) {
        var x = L + i * bw + bw * 0.18, w = bw * 0.64, on = i === sel;
        var g = el('g', { style: 'cursor:pointer;outline:none;', tabindex: 0, role: 'button', 'aria-label': d.y + ': ' + d.e + ' per cent error' }, svg);
        el('rect', { x: L + i * bw, y: T, width: bw, height: H - T - B, fill: 'transparent' }, g);
        el('rect', { x: x, y: y(d.e), width: w, height: y(0) - y(d.e), rx: 3, fill: d.deep ? '#2563eb' : c.faint, opacity: on ? 1 : 0.75, stroke: on ? c.ink : 'none', 'stroke-width': 2 }, g);
        txt(g, x + w / 2, d.e < 7 ? y(5.1) - 7 : y(d.e) - 5, d.e + '%', { size: 11.5, weight: on ? 700 : 500, fill: c.ink });
        txt(g, x + w / 2, H - B + 16, String(d.y), { size: 11, weight: on ? 700 : 400, fill: c.ink2 });
        keyClick(g, function () { sel = i; draw(); });
      });
      el('line', { x1: L, y1: y(5.1), x2: W - Rm, y2: y(5.1), stroke: c.warn, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
      var hl = txt(svg, L + 6, y(5.1) + 15, W < 520 ? 'human ≈ 5%' : 'one trained human: about 5%', { anchor: 'start', size: 11.5, weight: 700, fill: c.warn });
      hl.setAttribute('paint-order', 'stroke'); hl.setAttribute('stroke', c.surface); hl.setAttribute('stroke-width', '3');
      var d = INET[sel];
      info.innerHTML = '<strong style="color:var(--ink);">' + d.y + ': ' + d.e + '% wrong</strong> &nbsp;<span style="color:var(--ink-muted);">winner: ' + d.who + '</span><br><span style="color:var(--ink-secondary);">' + d.how + '</span>';
    }
    draw();
    var lastW = 0;
    window.addEventListener('resize', function () { var w = svgWrap.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Word vectors: analogies by arithmetic (hand-made 2-D toy)
     ----------------------------------------------------------------------- */
  var WORDS = {
    man: [1, 1], woman: [1, 3], king: [3, 1.2], queen: [3, 3.2], boy: [0.4, 0.3], girl: [0.4, 2.3], prince: [2.4, 0.5], princess: [2.4, 2.5],
    France: [5.6, 4.1], Paris: [6.3, 2.7], Italy: [7.2, 4.4], Rome: [7.9, 3.0], Japan: [8.6, 4.0], Tokyo: [9.3, 2.6], Germany: [5.9, 1.6], Berlin: [6.6, 0.2], Spain: [8.2, 1.9], Madrid: [8.9, 0.5]
  };
  var ANALOGIES = [['man', 'woman', 'king'], ['king', 'queen', 'prince'], ['France', 'Paris', 'Japan'], ['Italy', 'Rome', 'Germany'], ['man', 'king', 'woman']];
  FIG['fig-word-vectors'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = ANALOGIES[0].slice(), names = Object.keys(WORDS);
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowP = group(controls, 'Try an analogy');
    ANALOGIES.forEach(function (q) { btn(q[0] + ' : ' + q[1] + ' :: ' + q[2] + ' : ?', rowP).addEventListener('click', function () { a = q.slice(); sync(); draw(); }); });
    var rowS = group(controls, 'Or choose your own: A is to B as C is to ?');
    var sels = [0, 1, 2].map(function (i) {
      var s = document.createElement('select'); s.className = 'fig-select'; s.setAttribute('aria-label', ['A', 'B', 'C'][i]);
      names.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; s.appendChild(o); });
      s.addEventListener('change', function () { a[i] = s.value; draw(); });
      rowS.appendChild(s); return s;
    });
    function sync() { sels.forEach(function (s, i) { s.value = a[i]; }); }
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var out = div('', container); out.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--ink-secondary);line-height:1.5;';
    function draw() {
      var c = C(), W = Math.max(300, Math.min(640, Math.round(svgWrap.clientWidth || 620))), H = W < 500 ? 360 : 300, fs = W < 500 ? 11.5 : 13;
      var X = function (v) { return 20 + v / 10.4 * (W - 70); }, Y = function (v) { return H - 24 - v / 4.6 * (H - 48); };
      svgWrap.innerHTML = '';
      var svg = FIG.createSVG(svgWrap, W, H, 'Words drawn as points; arrows show the analogy');
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 6, fill: c.surface, stroke: c.border }, svg);
      var defs = el('defs', {}, svg);
      [['wv-a', c.warn], ['wv-b', c.key]].forEach(function (m) {
        var mk = el('marker', { id: m[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
        el('path', { d: 'M0 0 L10 5 L0 10 z', fill: m[1] }, mk);
      });
      var A = WORDS[a[0]], B = WORDS[a[1]], Cc = WORDS[a[2]], T = [B[0] - A[0] + Cc[0], B[1] - A[1] + Cc[1]];
      var best = null, bd = 1e9;
      names.forEach(function (n) { if (a.indexOf(n) >= 0) return; var p = WORDS[n], d = Math.hypot(p[0] - T[0], p[1] - T[1]); if (d < bd) { bd = d; best = n; } });
      el('line', { x1: X(A[0]), y1: Y(A[1]), x2: X(B[0]), y2: Y(B[1]), stroke: c.warn, 'stroke-width': 2.5, 'marker-end': 'url(#wv-a)' }, svg);
      el('line', { x1: X(Cc[0]), y1: Y(Cc[1]), x2: X(T[0]), y2: Y(T[1]), stroke: c.key, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', 'marker-end': 'url(#wv-b)' }, svg);
      el('circle', { cx: X(T[0]), cy: Y(T[1]), r: 14, fill: 'none', stroke: c.key, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, svg);
      names.forEach(function (n) {
        var p = WORDS[n], role = a.indexOf(n) >= 0 || n === best;
        el('circle', { cx: X(p[0]), cy: Y(p[1]), r: role ? 6 : 4.5, fill: n === best ? c.key : role ? c.warn : c.faint }, svg);
        txt(svg, X(p[0]) + 8, Y(p[1]) + 4, n, { anchor: 'start', size: fs, weight: role ? 700 : 400, fill: role ? c.ink : c.ink2 });
      });
      out.innerHTML = '<strong style="color:var(--ink);">' + a[0] + '</strong> is to <strong style="color:var(--ink);">' + a[1] + '</strong> as <strong style="color:var(--ink);">' + a[2] + '</strong> is to <strong style="color:var(--callout-key);font-size:1.05rem;">' + best + '</strong>' +
        '<br><span style="color:var(--ink-muted);font-size:0.86rem;">Worked out as ' + a[1] + ' − ' + a[0] + ' + ' + a[2] + ': take the orange arrow and start it from ' + a[2] + ' (purple arrow), then pick the nearest word.</span>';
    }
    sync(); draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Fooling a classifier (toy linear model on 40 × 40 images)
     ----------------------------------------------------------------------- */
  FIG['fig-adversarial'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var S = 40, N = S * S, r = rng(11), eps = 0;
    function shape(kind) {
      var img = new Float32Array(N);
      for (var i = 0; i < S; i++) for (var j = 0; j < S; j++) {
        var x = j - 19.5, y = i - 19.5, ink;
        if (kind === 'O') { var d = Math.hypot(x, y); ink = Math.abs(d - 12) < 2.2; }
        else ink = (Math.abs(x - y) < 2.4 || Math.abs(x + y) < 2.4) && Math.abs(x) < 14 && Math.abs(y) < 14;
        img[i * S + j] = ink ? 0.12 : 0.86;
      }
      return img;
    }
    var X0 = shape('X'), O0 = shape('O'), w = new Float32Array(N), sum = 0;
    // Weights: a faint "X minus O" pattern buried in pixel-by-pixel noise, as learned weights often look
    for (var k = 0; k < N; k++) { w[k] = 0.3 * (O0[k] - X0[k]) / 0.74 + (r() * 2 - 1); }
    var dot = function (v) { var s = 0; for (var i = 0; i < N; i++) s += w[i] * v[i]; return s; };
    var sx = dot(X0), so = dot(O0), bias = (sx + so) / 2, scale = Math.abs(sx - so) / 6;
    for (var m = 0; m < N; m++) sum += Math.abs(w[m]);
    var flipAt = Math.abs(so - bias) / sum;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'adv-eps', label: 'Size of the change to each pixel', min: 0, max: 0.12, step: 0.005, value: 0, unit: '', onChange: function (v) { eps = v; draw(); } });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.75rem 1.25rem;justify-content:center;align-items:flex-start;margin-top:0.75rem;font-family:var(--font-sans);font-size:0.85rem;color:var(--ink-secondary);';
    function pane(title) {
      var d = div('', lay); d.style.cssText = 'flex:0 1 150px;text-align:center;';
      var cv = document.createElement('canvas'); cv.width = 160; cv.height = 160; cv.style.cssText = 'max-width:100%;border:1px solid var(--border);border-radius:4px;display:block;margin:0 auto;';
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', title);
      d.appendChild(cv); var cap = div('', d, title); cap.style.marginTop = '0.3rem';
      return { cv: cv, cap: cap };
    }
    var p1 = pane('Original picture'), p2 = pane('The change (made 8× stronger so you can see it)'), p3 = pane('Original + change');
    var verdict = div('', container); verdict.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.92rem;line-height:1.6;';
    function put(cv, f) {
      var off = document.createElement('canvas'); off.width = S; off.height = S;
      var octx = off.getContext('2d'), im = octx.createImageData(S, S);
      for (var i = 0; i < N; i++) { var v = Math.max(0, Math.min(1, f(i))) * 255; im.data[4 * i] = im.data[4 * i + 1] = im.data[4 * i + 2] = v; im.data[4 * i + 3] = 255; }
      octx.putImageData(im, 0, 0);
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, cv.width, cv.height);
    }
    function draw() {
      var adv = new Float32Array(N);
      for (var i = 0; i < N; i++) adv[i] = Math.max(0, Math.min(1, O0[i] - eps * Math.sign(w[i])));
      put(p1.cv, function (i) { return O0[i]; });
      put(p2.cv, function (i) { return 0.5 + 8 * (adv[i] - O0[i]); });
      put(p3.cv, function (i) { return adv[i]; });
      var pO = function (v) { return 1 / (1 + Math.exp(-(dot(v) - bias) / scale)); };
      var a = pO(O0), b = pO(adv);
      var bar = function (p) { return '<span style="display:inline-block;width:120px;height:10px;background:var(--surface-sunken);border-radius:3px;vertical-align:middle;"><span style="display:block;height:10px;width:' + Math.round(p * 120) + 'px;background:' + (p > 0.5 ? 'var(--callout-tip)' : '#dc2626') + ';border-radius:3px;"></span></span>'; };
      verdict.innerHTML = 'Classifier on the original: ' + bar(a) + ' <strong>' + Math.round(a * 100) + '% sure it is an O</strong><br>' +
        'Classifier on the changed picture: ' + bar(b) + ' <strong>' + (b >= 0.5 ? Math.round(b * 100) + '% sure it is an O' : Math.round((1 - b) * 100) + '% sure it is an X') + '</strong>' +
        '<br><span style="color:var(--ink-muted);font-size:0.85rem;">Each pixel changes by at most ' + Math.round(eps * 100) + '% of full brightness. The answer flips at about ' + Math.round(flipAt * 100) + '%.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What happened at the 2012 ImageNet contest?', options: ['A human team beat all the computers', 'A deep convolutional network, AlexNet, made far fewer errors than any other entry', 'The contest was cancelled', 'Expert systems won'], answer: 1, explanation: 'About 15% of its answers were wrong, against about 26% for the next-best team. Within two years nearly every entry was a deep network.' },
      { question: 'Why did graphics chips (GPUs) matter so much?', options: ['They made pictures prettier', 'They can do thousands of simple calculations at the same time, which is exactly what training a neural network needs', 'They store more data', 'They are needed to connect to the internet'], answer: 1, explanation: 'AlexNet was trained in about a week on two gaming graphics cards.' },
      { question: 'What three ingredients came together around 2012?', options: ['Rules, logic and search', 'Huge labelled datasets, fast parallel hardware and better training tricks for deep networks', 'Robots, lasers and satellites', 'Steam, gears and punched cards'], answer: 1, explanation: 'ImageNet supplied the data, GPUs the speed, and tricks like ReLU and dropout made deep networks trainable.' },
      { question: 'What did word2vec (2013) show?', options: ['That words can be spelled backwards', 'That words can be turned into points in space so that meaning becomes geometry, e.g. king − man + woman ≈ queen', 'That computers cannot handle language', 'How to count words'], answer: 1, explanation: 'The positions are learned just from which words appear near each other in text.' },
      { question: 'How does a GAN learn to make realistic images?', options: ['By copying photos exactly', 'A generator tries to fool a discriminator, which tries to spot fakes; each improves the other', 'By following drawing rules', 'By asking people to rate every image'], answer: 1, explanation: 'This contest between two networks later made "deepfakes" possible.' },
      { question: 'How did the original AlphaGo learn?', options: ['Only from rules written by Go masters', 'First from about 30 million positions from human games, then by playing against itself, combined with search', 'By trying every possible game', 'Entirely by playing itself from the start'], answer: 1, explanation: 'Learning purely from self-play came a year later, with AlphaGo Zero.' },
      { question: 'Why was AlphaGo’s "move 37" against Lee Sedol famous?', options: ['It was a mistake', 'It was a move strong human players would almost never have chosen, yet it turned out to be brilliant', 'It broke the rules', 'It was played by a person'], answer: 1, explanation: 'AlphaGo itself estimated that a human would play it only about 1 time in 10,000.' },
      { question: 'What problem did AlphaFold 2 largely solve?', options: ['Folding paper aeroplanes', 'Predicting the 3-D shape of a protein from its sequence of amino acids', 'Weather forecasting', 'Translating languages'], answer: 1, explanation: 'Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for it, with David Baker.' },
      { question: 'What is an adversarial example?', options: ['A difficult exam question', 'An input changed in tiny, carefully chosen ways that makes a network confidently give a wrong answer', 'A network that argues', 'A very large dataset'], answer: 1, explanation: 'It showed that networks can be right for reasons quite unlike ours, and can be fragile.' },
      { question: 'What did the 2018 "Gender Shades" study find?', options: ['Face-analysis systems worked equally well for everyone', 'Commercial systems made far more errors on darker-skinned women than on lighter-skinned men', 'Face recognition was impossible', 'Only humans can recognise faces'], answer: 1, explanation: 'Systems learn from their training data, so gaps in the data become gaps in performance.' }
    ]);
  };
})();
