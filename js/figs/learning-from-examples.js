/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 4: Learning from Examples
   Figures:
     1. fig-ai-timeline-4  The story at a glance (clickable timeline)
     2. fig-nn-playground  Train a small neural network with backpropagation
     3. fig-convolution    What a convolution filter sees
     4. fig-spam           A word-counting spam filter (naive Bayes)
     5. fig-overfit        Training, testing and overfitting
     6. fig-quiz-ai4       Test yourself
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
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function onTheme(fn) {
    if (!window.MutationObserver) return;
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    new MutationObserver(fn).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  function keyClick(node, fn) {
    node.addEventListener('click', fn);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function rng(seed) { // mulberry32
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function gauss(r) { var u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
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
    { name: 'Neural networks', color: '#1d4ed8' },
    { name: 'Statistics and data', color: '#0f766e' },
    { name: 'Games', color: '#b45309' },
    { name: 'The revival', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1982', icon: '🧲', era: 0, sec: 3, title: 'Hopfield networks', text: 'Physicist John Hopfield shows how a network of artificial neurons can store memories, reviving interest in neural networks.' },
    { year: '1986', icon: '🔁', era: 0, sec: 3, title: 'Backpropagation', text: 'Rumelhart, Hinton and Williams show that backpropagation can train networks with hidden layers, and that the hidden neurons learn useful features.' },
    { year: '1988', icon: '🎲', era: 1, sec: 6, title: 'Probabilistic reasoning', text: 'Judea Pearl’s book shows how machines can reason with uncertainty using probabilities and Bayesian networks.' },
    { year: '1989', icon: '✉️', era: 0, sec: 4, title: 'Reading zip codes', text: 'Yann LeCun’s convolutional network learns to read handwritten digits on US mail.' },
    { year: '1990', icon: '🗣️', era: 1, sec: 5, title: 'Statistical translation', text: 'IBM researchers translate by learning from millions of sentences of Canadian parliamentary records in English and French.' },
    { year: '1992', icon: '🎯', era: 2, sec: 7, title: 'TD-Gammon', text: 'Gerald Tesauro’s program teaches itself backgammon by playing against itself, reaching near world-class play.' },
    { year: '1995', icon: '📏', era: 1, sec: 9, title: 'Support vector machines', text: 'Corinna Cortes and Vladimir Vapnik publish the support vector machine, which dominates machine learning for a decade.' },
    { year: '1997', icon: '♟️', era: 2, sec: 8, title: 'Deep Blue beats Kasparov', text: 'IBM’s chess computer defeats world champion Garry Kasparov in a six-game match.' },
    { year: '1997', icon: '🧠', era: 0, sec: 9, title: 'LSTM', text: 'Sepp Hochreiter and Jürgen Schmidhuber design a network that can remember things over long sequences.' },
    { year: '1998', icon: '🔢', era: 0, sec: 4, title: 'LeNet-5 and MNIST', text: 'LeCun’s improved network reads cheques for banks, and his team releases the MNIST set of 70,000 handwritten digits.' },
    { year: '2001', icon: '🌳', era: 1, sec: 9, title: 'Random forests', text: 'Leo Breiman’s random forests combine hundreds of simple decision trees into one accurate predictor.' },
    { year: '2002', icon: '🚫', era: 1, sec: 6, title: 'Learning spam filters', text: 'Spam filters that learn word probabilities from your own email become widespread.' },
    { year: '2005', icon: '🚙', era: 1, sec: 11, title: 'A car drives itself across the desert', text: 'Stanford’s robot car Stanley wins the DARPA Grand Challenge, driving 212 km on its own.' },
    { year: '2006', icon: '🌱', era: 3, sec: 12, title: '"Deep learning" revives', text: 'Geoffrey Hinton and colleagues show a way to train networks with many layers.' },
    { year: '2009', icon: '🎬', era: 1, sec: 11, title: 'Netflix Prize', text: 'A team wins $1 million for improving Netflix’s film recommendations by 10%, by combining many learned models.' },
    { year: '2009', icon: '🖼️', era: 3, sec: 12, title: 'ImageNet', text: 'Fei-Fei Li’s team releases ImageNet, millions of labelled photos that would soon change everything (Part 5).' }
  ];
  FIG['fig-ai-timeline-4'] = function (figEl) {
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
      var rows = W < 560 ? 3 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 26;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of machine learning from 1982 to 2009');
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
     Figure 2. A neural network playground (2 inputs → hidden tanh → sigmoid)
     ----------------------------------------------------------------------- */
  function makeData(kind, seed) {
    var r = rng(seed), pts = [];
    for (var i = 0; i < 120; i++) {
      var x, y, lab;
      if (kind === 'blobs') { lab = i % 2; x = (lab ? 0.45 : -0.45) + gauss(r) * 0.22; y = (lab ? 0.35 : -0.35) + gauss(r) * 0.22; }
      else if (kind === 'xor') { x = r() * 2 - 1; y = r() * 2 - 1; if (Math.abs(x) < 0.08 || Math.abs(y) < 0.08) { i--; continue; } lab = x * y > 0 ? 1 : 0; }
      else { var a = r() * 2 * Math.PI, rad = i % 2 ? r() * 0.38 : 0.6 + r() * 0.32; x = Math.cos(a) * rad; y = Math.sin(a) * rad; lab = i % 2; }
      pts.push([Math.max(-0.98, Math.min(0.98, x)), Math.max(-0.98, Math.min(0.98, y)), lab]);
    }
    return pts;
  }
  FIG['fig-nn-playground'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 'circle', H = 4, lr = 0.3, data = makeData(kind, 7), net, epoch = 0, losses = [], running = false, seed = 1;
    function init() {
      var r = rng(seed++);
      net = { W1: [], b1: [], W2: [], b2: 0 };
      for (var j = 0; j < H; j++) { net.W1.push([gauss(r) * 0.9, gauss(r) * 0.9]); net.b1.push(gauss(r) * 0.3); net.W2.push(gauss(r) * 0.9); }
      epoch = 0; losses = [];
    }
    function forward(x, y, keep) {
      var h = [], z = net.b2;
      for (var j = 0; j < H; j++) { var a = Math.tanh(net.W1[j][0] * x + net.W1[j][1] * y + net.b1[j]); h.push(a); z += net.W2[j] * a; }
      var o = 1 / (1 + Math.exp(-z));
      return keep ? { h: h, o: o } : o;
    }
    function trainEpoch() {
      // One pass of full-batch gradient descent: backpropagate the error to every weight
      var gW1 = [], gb1 = [], gW2 = [], gb2 = 0, loss = 0, n = data.length;
      for (var j = 0; j < H; j++) { gW1.push([0, 0]); gb1.push(0); gW2.push(0); }
      data.forEach(function (p) {
        var f = forward(p[0], p[1], true), o = Math.min(1 - 1e-7, Math.max(1e-7, f.o));
        loss += -(p[2] * Math.log(o) + (1 - p[2]) * Math.log(1 - o));
        var dz = f.o - p[2];               // error at the output
        gb2 += dz;
        for (var j = 0; j < H; j++) {
          gW2[j] += dz * f.h[j];
          var dh = dz * net.W2[j] * (1 - f.h[j] * f.h[j]);   // error passed back to hidden neuron j
          gW1[j][0] += dh * p[0]; gW1[j][1] += dh * p[1]; gb1[j] += dh;
        }
      });
      for (var k = 0; k < H; k++) {
        net.W2[k] -= lr * gW2[k] / n; net.W1[k][0] -= lr * gW1[k][0] / n; net.W1[k][1] -= lr * gW1[k][1] / n; net.b1[k] -= lr * gb1[k] / n;
      }
      net.b2 -= lr * gb2 / n;
      epoch++;
      return loss / n;
    }
    init();
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowR = group(controls, 'Training');
    var playB = btn('▶ Train', rowR, 'fig-button'), stepB = btn('One step', rowR), resetB = btn('New random weights', rowR);
    var rowD = group(controls, 'Data');
    var dBtns = {};
    [['Two groups', 'blobs'], ['XOR', 'xor'], ['Circle', 'circle']].forEach(function (p) {
      dBtns[p[1]] = btn(p[0], rowD); dBtns[p[1]].addEventListener('click', function () { kind = p[1]; data = makeData(kind, 7); init(); draw(); });
    });
    FIG.slider(controls, { id: 'nn-h', label: 'Hidden neurons', min: 1, max: 8, step: 1, value: H, onChange: function (v) { H = v; init(); draw(); } });
    var rowL = group(controls, 'Learning rate (step size)');
    var lBtns = {};
    [0.03, 0.3, 3, 30].forEach(function (v) { lBtns[v] = btn(String(v), rowL); lBtns[v].addEventListener('click', function () { lr = v; draw(); }); });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;margin-top:0.75rem;';
    var cWrap = div('', lay); cWrap.style.cssText = 'flex:1 1 240px;max-width:330px;margin:0 auto;';
    var canvas = document.createElement('canvas'); canvas.style.cssText = 'width:100%;aspect-ratio:1;border-radius:var(--radius-sm);border:1px solid var(--border);display:block;';
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'The data points and the regions the network assigns to each class');
    cWrap.appendChild(canvas);
    var side = div('', lay); side.style.cssText = 'flex:1 1 220px;font-family:var(--font-sans);font-size:0.88rem;line-height:1.5;color:var(--ink-secondary);';
    var chartWrap = div('', side), info = div('', side);
    chartWrap.style.maxWidth = '300px';
    function draw() {
      var c = C(), S = 300, dpr = window.devicePixelRatio || 1;
      for (var k in dBtns) dBtns[k].classList.toggle('active', k === kind);
      for (var v in lBtns) lBtns[v].classList.toggle('active', +v === lr);
      canvas.width = S * dpr; canvas.height = S * dpr;
      var ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var N = 50, cell = S / N;
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var o = forward(-1 + (i + 0.5) * 2 / N, 1 - (j + 0.5) * 2 / N);
        var t = Math.abs(o - 0.5) * 2;
        ctx.fillStyle = o > 0.5 ? 'rgba(37,99,235,' + (0.08 + 0.32 * t) + ')' : 'rgba(217,119,6,' + (0.08 + 0.32 * t) + ')';
        var x0 = Math.round(i * cell), y0 = Math.round(j * cell);
        ctx.fillRect(x0, y0, Math.round((i + 1) * cell) - x0, Math.round((j + 1) * cell) - y0);
      }
      data.forEach(function (p) {
        var X = (p[0] + 1) / 2 * S, Y = (1 - p[1]) / 2 * S;
        ctx.beginPath(); ctx.arc(X, Y, 4.2, 0, 2 * Math.PI);
        ctx.fillStyle = p[2] ? '#2563eb' : '#d97706'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
      });
      var correct = data.filter(function (p) { return (forward(p[0], p[1]) > 0.5 ? 1 : 0) === p[2]; }).length;
      chartWrap.innerHTML = '';
      var W = 280, Hc = 110, svg = FIG.createSVG(chartWrap, W, Hc, 'How the error falls during training');
      el('rect', { x: 0, y: 0, width: W, height: Hc, rx: 6, fill: c.raised, stroke: c.border }, svg);
      txt(svg, 8, 16, 'Error (loss) during training', { anchor: 'start', size: 11.5, weight: 600, fill: c.ink2 });
      if (losses.length > 1) {
        var mx = Math.max(0.75, Math.max.apply(null, losses)), pts = losses.map(function (l, i) { return (8 + i / (losses.length - 1) * (W - 16)).toFixed(1) + ',' + (Hc - 8 - Math.min(l, mx) / mx * (Hc - 30)).toFixed(1); });
        el('polyline', { points: pts.join(' '), fill: 'none', stroke: c.accent, 'stroke-width': 2 }, svg);
      } else txt(svg, W / 2, Hc / 2 + 10, 'Press Train to start', { size: 12, fill: c.muted });
      info.innerHTML = '<div style="margin-top:0.4rem;">Training steps: <strong>' + epoch + '</strong> &nbsp; Error: <strong>' + (losses.length ? losses[losses.length - 1].toFixed(3) : '–') + '</strong></div>' +
        '<div>Points classified correctly: <strong>' + correct + ' of ' + data.length + '</strong></div>' +
        '<div style="margin-top:0.4rem;color:var(--ink-muted);">Blue and orange shading show what the network predicts everywhere. Try XOR or Circle with 1 hidden neuron, then with 4. Then try learning rate 0.03 (slow) and 30 (wild).</div>';
    }
    var anim = FIG.animate(figEl, function () {
      if (!running) return;
      for (var i = 0; i < 6; i++) { var l = trainEpoch(); if (i === 5) { losses.push(isFinite(l) ? l : 5); if (losses.length > 400) losses.shift(); } }
      draw();
    });
    playB.addEventListener('click', function () { running = !running; playB.textContent = running ? '⏸ Pause' : '▶ Train'; });
    stepB.addEventListener('click', function () { var l = trainEpoch(); losses.push(isFinite(l) ? l : 5); draw(); });
    resetB.addEventListener('click', function () { init(); draw(); });
    draw();
    onTheme(draw);
    return anim;
  };

  /* -----------------------------------------------------------------------
     Figure 3. Convolution: what a filter sees
     ----------------------------------------------------------------------- */
  var KERNELS = {
    v: { label: 'Vertical edges', k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
    h: { label: 'Horizontal edges', k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
    d: { label: 'Diagonal (/) lines', k: [[-1, -1, 2], [-1, 2, -1], [2, -1, -1]] },
    b: { label: 'Blur', k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }
  };
  var SEVEN = ['............', '.#########..', '.#########..', '........##..', '.......##...', '.......##...', '......##....', '......##....', '.....##.....', '.....##.....', '....##......', '............'];
  FIG['fig-convolution'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 12, img = SEVEN.map(function (r) { return r.split('').map(function (ch) { return ch === '#' ? 1 : 0; }); }), kk = 'v', hover = null, painting = false, paintVal = 1;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowK = group(controls, 'Filter');
    var kBtns = {};
    Object.keys(KERNELS).forEach(function (k) { kBtns[k] = btn(KERNELS[k].label, rowK); kBtns[k].addEventListener('click', function () { kk = k; draw(); }); });
    var rowI = group(controls, 'Picture');
    btn('Clear', rowI).addEventListener('click', function () { img = img.map(function (r) { return r.map(function () { return 0; }); }); draw(); });
    btn('Draw a 7', rowI).addEventListener('click', function () { img = SEVEN.map(function (r) { return r.split('').map(function (ch) { return ch === '#' ? 1 : 0; }); }); draw(); });
    var svgWrap = div('', container); svgWrap.style.cssText = 'margin-top:0.75rem;display:flex;flex-wrap:wrap;gap:0.5rem 1rem;justify-content:center;align-items:center;';
    var note = div('', container); note.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-secondary);line-height:1.5;min-height:2.6em;';
    function conv(i, j) { var s = 0, K = KERNELS[kk].k; for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) s += K[a][b] * img[i + a][j + b]; return s; }
    function panel(w, h, label) { var d = div('', svgWrap); d.style.cssText = 'flex:0 1 ' + w + 'px;max-width:' + w + 'px;'; return FIG.createSVG(d, w, h, label); }
    function draw() {
      var c = C();
      for (var k in kBtns) kBtns[k].classList.toggle('active', k === kk);
      svgWrap.innerHTML = '';
      var cs = 20, g0 = 4, gy = 24, M = N - 2;
      var svg = panel(N * cs + 2 * g0, gy + N * cs + 4, 'The drawing');
      txt(svg, g0 + N * cs / 2, 15, 'Picture (tap to draw)', { size: 13, weight: 600, fill: c.ink2 });
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) (function (i, j) {
        var r = el('rect', { x: g0 + j * cs, y: gy + i * cs, width: cs - 1, height: cs - 1, fill: img[i][j] ? c.ink : c.surface, stroke: c.border, style: 'cursor:pointer;touch-action:none;' }, svg);
        r.addEventListener('pointerdown', function (e) { e.preventDefault(); painting = true; paintVal = 1 - img[i][j]; img[i][j] = paintVal; draw(); });
        r.addEventListener('pointerenter', function () { if (painting && img[i][j] !== paintVal) { img[i][j] = paintVal; draw(); } });
      })(i, j);
      if (hover) el('rect', { x: g0 + hover[1] * cs - 1, y: gy + hover[0] * cs - 1, width: 3 * cs + 1, height: 3 * cs + 1, fill: 'none', stroke: c.warn, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      var K = KERNELS[kk].k, kc = 32, ksvg = panel(3 * kc + 20, 180, 'The 3 by 3 filter');
      txt(ksvg, 10 + 1.5 * kc, 18, 'Filter', { size: 13, weight: 600, fill: c.ink2 });
      for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
        var v = K[a][b];
        el('rect', { x: 10 + b * kc, y: 30 + a * kc, width: kc - 2, height: kc - 2, rx: 3, fill: v > 0 ? 'rgba(21,128,61,' + (0.15 + 0.15 * v) + ')' : v < 0 ? 'rgba(220,38,38,' + (0.15 - 0.12 * v) + ')' : c.raised, stroke: c.border }, ksvg);
        txt(ksvg, 10 + b * kc + kc / 2 - 1, 30 + a * kc + kc / 2 + 4, (v > 0 ? '+' : '') + v, { size: 13, weight: 700, fill: c.ink });
      }
      txt(ksvg, 10 + 1.5 * kc, 30 + 3 * kc + 22, 'slides over', { size: 12, fill: c.muted });
      txt(ksvg, 10 + 1.5 * kc, 30 + 3 * kc + 38, 'every 3 × 3 patch', { size: 12, fill: c.muted });
      var max = 0, out = [];
      for (var p = 0; p < M; p++) { out.push([]); for (var q = 0; q < M; q++) { var s = conv(p, q); out[p].push(s); max = Math.max(max, Math.abs(s)); } }
      var msvg = panel(M * cs + 2 * g0, gy + M * cs + 4, 'The feature map');
      txt(msvg, g0 + M * cs / 2, 15, 'Feature map (hover or tap)', { size: 13, weight: 600, fill: c.ink2 });
      for (var p2 = 0; p2 < M; p2++) for (var q2 = 0; q2 < M; q2++) (function (p, q) {
        var s = out[p][q], t = max ? Math.abs(s) / max : 0, on = hover && hover[0] === p && hover[1] === q;
        var col = kk === 'b' ? 'rgba(27,73,101,' + t + ')' : (s > 0 ? 'rgba(21,128,61,' + t + ')' : 'rgba(220,38,38,' + t + ')');
        var r = el('rect', { x: g0 + q * cs, y: gy + p * cs, width: cs - 1, height: cs - 1, fill: s ? col : c.surface, stroke: on ? c.warn : c.border, 'stroke-width': on ? 2.5 : 1, style: 'cursor:pointer;' }, msvg);
        var showIt = function () { hover = [p, q]; draw(); };
        r.addEventListener('pointerenter', showIt); r.addEventListener('click', showIt);
      })(p2, q2);
      if (hover) {
        var parts = [];
        for (var a2 = 0; a2 < 3; a2++) for (var b2 = 0; b2 < 3; b2++) if (img[hover[0] + a2][hover[1] + b2] && K[a2][b2]) parts.push((K[a2][b2] > 0 ? '+' : '') + K[a2][b2]);
        note.innerHTML = 'At the highlighted patch, multiply each filter number by the pixel under it (1 = ink, 0 = blank) and add them up: ' +
          (parts.length ? parts.join(' ') + ' = <strong>' + out[hover[0]][hover[1]] + '</strong>' : 'no inked pixels meet a non-zero filter number, so the total is <strong>0</strong>') + '.';
      } else note.innerHTML = 'Green means the filter’s pattern is present; red means its opposite. Hover over (or tap) a square of the feature map to see the sum.';
    }
    document.addEventListener('pointerup', function () { painting = false; });
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. A naive Bayes spam filter
     ----------------------------------------------------------------------- */
  var TRAIN = {
    spam: ['WIN a FREE prize now click here', 'Congratulations you have won cash claim your prize today', 'Cheap pills buy now limited offer', 'Claim your free gift card click the link now',
      'You are a winner urgent reply to claim money', 'Lowest price offer buy cheap watches now', 'Earn cash fast from home free bonus', 'Urgent your account prize click here to claim'],
    ham: ['Can we move the meeting to Tuesday afternoon', 'Here are the notes from today’s lecture', 'Are you free for lunch tomorrow', 'Please review the attached draft report',
      'Happy birthday hope you have a lovely day', 'The train is running late see you soon', 'Thanks for your help with the project', 'Reminder the seminar starts at four today']
  };
  function words(s) { return (s.toLowerCase().match(/[a-z']+/g) || []).filter(function (w) { return w.length > 1 || w === 'a'; }); }
  FIG['fig-spam'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var counts = { spam: {}, ham: {} }, tot = { spam: 0, ham: 0 }, vocab = {};
    ['spam', 'ham'].forEach(function (cl) { TRAIN[cl].forEach(function (m) { words(m).forEach(function (w) { counts[cl][w] = (counts[cl][w] || 0) + 1; tot[cl]++; vocab[w] = 1; }); }); });
    var V = Object.keys(vocab).length;
    function p(w, cl) { return ((counts[cl][w] || 0) + 1) / (tot[cl] + V); } // add-one smoothing
    var starters = div('', container); starters.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;';
    var ta = document.createElement('textarea'); ta.rows = 2; ta.maxLength = 300; ta.setAttribute('aria-label', 'Message to classify');
    ta.style.cssText = 'width:100%;box-sizing:border-box;padding:0.5rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface);color:var(--ink);font-family:var(--font-sans);font-size:0.95rem;resize:vertical;';
    ta.value = 'Click here to claim your free prize';
    container.appendChild(ta);
    var out = div('', container); out.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.88rem;';
    var trainBox = document.createElement('details'); trainBox.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.84rem;color:var(--ink-muted);';
    trainBox.innerHTML = '<summary style="cursor:pointer;">Show the 16 made-up training emails it learned from</summary><div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.4rem;"><div style="flex:1 1 220px;"><strong>Spam</strong><br>' + TRAIN.spam.map(esc).join('<br>') + '</div><div style="flex:1 1 220px;"><strong>Not spam</strong><br>' + TRAIN.ham.map(esc).join('<br>') + '</div></div>';
    container.appendChild(trainBox);
    function run() {
      var ws = words(ta.value), logOdds = 0, ev = [];
      ws.forEach(function (w) {
        if (!vocab[w]) { ev.push({ w: w, v: 0, unk: true }); return; }
        var v = Math.log(p(w, 'spam') / p(w, 'ham')); logOdds += v; ev.push({ w: w, v: v });
      });
      var prob = 1 / (1 + Math.exp(-logOdds)), spam = prob > 0.5;
      var mx = Math.max(0.5, Math.max.apply(null, ev.map(function (e) { return Math.abs(e.v); }).concat([0])));
      var h = '<div style="font-size:1.05rem;font-weight:700;color:' + (spam ? '#dc2626' : 'var(--callout-tip)') + ';">' + (ws.length ? (spam ? 'Spam' : 'Not spam') + ' (' + Math.round(prob * 100) + '% likely to be spam)' : 'Type a message') + '</div>' +
        '<div style="margin:0.3rem 0 0.4rem;color:var(--ink-muted);">Each word’s evidence: how much more often it appeared in spam (red, right) or in normal email (green, left).</div>';
      ev.slice(0, 14).forEach(function (e) {
        var wpx = Math.round(Math.abs(e.v) / mx * 46);
        h += '<div style="display:flex;align-items:center;gap:0.4rem;margin:2px 0;"><span style="width:6.5rem;text-align:right;font-family:var(--font-mono);font-size:0.82rem;color:var(--ink);">' + esc(e.w) + '</span>' +
          '<span style="flex:0 0 46%;display:flex;justify-content:flex-end;">' + (e.v < 0 ? '<span style="height:12px;width:' + wpx * 2 + '%;background:var(--callout-tip);border-radius:2px;"></span>' : '') + '</span>' +
          '<span style="width:1px;height:14px;background:var(--border-strong);"></span>' +
          '<span style="flex:0 0 46%;">' + (e.v > 0 ? '<span style="display:inline-block;height:12px;width:' + wpx * 2 + '%;background:#dc2626;border-radius:2px;"></span>' : '') + (e.unk ? '<span style="font-size:0.78rem;color:var(--ink-faint);">never seen: ignored</span>' : '') + '</span></div>';
      });
      out.innerHTML = h;
    }
    ['Click here to claim your free prize', 'Are you free for lunch on Tuesday', 'Thanks for the free tickets see you at the seminar', 'Urgent meeting notes attached'].forEach(function (s) {
      btn(s, starters).addEventListener('click', function () { ta.value = s; run(); });
    });
    ta.addEventListener('input', run);
    run();
  };

  /* -----------------------------------------------------------------------
     Figure 5. Overfitting
     ----------------------------------------------------------------------- */
  function truth(x) { return Math.sin(2.6 * x) * 0.7 + 0.15 * x; }
  function polyfit(pts, deg) {
    var n = deg + 1, A = [], bv = [];
    for (var i = 0; i < n; i++) { A.push(new Array(n).fill(0)); bv.push(0); }
    pts.forEach(function (p) {
      var pw = []; for (var k = 0; k < n; k++) pw.push(Math.pow(p[0], k));
      for (var i = 0; i < n; i++) { bv[i] += pw[i] * p[1]; for (var j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]; }
    });
    for (var d = 0; d < n; d++) A[d][d] += 1e-9;
    for (var col = 0; col < n; col++) { // Gaussian elimination with partial pivoting
      var piv = col; for (var r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      var tmp = A[col]; A[col] = A[piv]; A[piv] = tmp; var tb = bv[col]; bv[col] = bv[piv]; bv[piv] = tb;
      for (var r2 = col + 1; r2 < n; r2++) { var f = A[r2][col] / A[col][col]; for (var c2 = col; c2 < n; c2++) A[r2][c2] -= f * A[col][c2]; bv[r2] -= f * bv[col]; }
    }
    var w = new Array(n).fill(0);
    for (var i2 = n - 1; i2 >= 0; i2--) { var s = bv[i2]; for (var j2 = i2 + 1; j2 < n; j2++) s -= A[i2][j2] * w[j2]; w[i2] = s / A[i2][i2]; }
    return function (x) { var y = 0; for (var k = n - 1; k >= 0; k--) y = y * x + w[k]; return y; };
  }
  FIG['fig-overfit'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var deg = 3, seed = 3, showTest = true, train, test;
    function sample() {
      var r = rng(seed); train = []; test = [];
      for (var i = 0; i < 12; i++) { var x = -0.95 + 1.9 * (i + 0.2 + 0.6 * r()) / 12; train.push([x, truth(x) + gauss(r) * 0.17]); }
      for (var j = 0; j < 30; j++) { var x2 = -0.95 + 1.9 * r(); test.push([x2, truth(x2) + gauss(r) * 0.17]); }
    }
    sample();
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'of-deg', label: 'Model flexibility (polynomial degree)', min: 1, max: 11, step: 1, value: deg, onChange: function (v) { deg = v; draw(); } });
    var row = group(controls, 'Data');
    btn('New sample', row).addEventListener('click', function () { seed++; sample(); draw(); });
    var tB = btn('Hide test points', row);
    tB.addEventListener('click', function () { showTest = !showTest; tB.textContent = showTest ? 'Hide test points' : 'Show test points'; draw(); });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var plotWrap = div('', lay); plotWrap.style.cssText = 'flex:3 1 300px;';
    var errWrap = div('', lay); errWrap.style.cssText = 'flex:2 1 220px;font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-secondary);';
    function mse(f, pts) { return pts.reduce(function (a, p) { var d = f(p[0]) - p[1]; return a + d * d; }, 0) / pts.length; }
    function draw() {
      var c = C(), W = 420, H = 260, m = { l: 10, r: 10, t: 10, b: 10 };
      var X = function (x) { return m.l + (x + 1) / 2 * (W - m.l - m.r); }, Y = function (y) { return m.t + (1.3 - y) / 2.6 * (H - m.t - m.b); };
      plotWrap.innerHTML = '';
      var svg = FIG.createSVG(plotWrap, W, H, 'Training points, test points and the fitted curve');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 6, fill: c.surface, stroke: c.border }, svg);
      var f = polyfit(train, deg), pathT = '', pathF = '';
      for (var i = 0; i <= 200; i++) {
        var x = -1 + i / 100;
        pathT += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(truth(x)).toFixed(1);
        var yf = Math.max(-3, Math.min(3, f(x)));
        pathF += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(yf).toFixed(1);
      }
      el('path', { d: pathT, fill: 'none', stroke: c.faint, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      el('path', { d: pathF, fill: 'none', stroke: c.key, 'stroke-width': 2.5 }, svg);
      if (showTest) test.forEach(function (p) { el('rect', { x: X(p[0]) - 3.5, y: Y(p[1]) - 3.5, width: 7, height: 7, fill: '#d97706', opacity: 0.85 }, svg); });
      train.forEach(function (p) { el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5, fill: '#2563eb', stroke: '#fff', 'stroke-width': 1.2 }, svg); });
      // error-versus-flexibility chart
      var tr = [], te = [];
      for (var d = 1; d <= 11; d++) { var g = polyfit(train, d); tr.push(mse(g, train)); te.push(mse(g, test)); }
      errWrap.innerHTML = '';
      var W2 = 260, H2 = 160, svg2 = FIG.createSVG(errWrap, W2, H2, 'Training and test error for each degree');
      el('rect', { x: 0, y: 0, width: W2, height: H2, rx: 6, fill: c.raised, stroke: c.border }, svg2);
      var top = 0.25, xs = function (d) { return 16 + (d - 1) / 10 * (W2 - 32); }, ys = function (v) { return H2 - 26 - Math.min(v, top) / top * (H2 - 50); };
      [[tr, '#2563eb'], [te, '#d97706']].forEach(function (s) {
        el('polyline', { points: s[0].map(function (v, i) { return xs(i + 1).toFixed(1) + ',' + ys(v).toFixed(1); }).join(' '), fill: 'none', stroke: s[1], 'stroke-width': 2 }, svg2);
      });
      el('line', { x1: xs(deg), y1: 22, x2: xs(deg), y2: H2 - 26, stroke: c.key, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, svg2);
      txt(svg2, 8, 16, 'Error for each degree', { anchor: 'start', size: 11.5, weight: 600, fill: c.ink2 });
      txt(svg2, 16, H2 - 8, 'simple', { anchor: 'start', size: 11, fill: c.muted });
      txt(svg2, W2 - 16, H2 - 8, 'flexible', { anchor: 'end', size: 11, fill: c.muted });
      var best = te.indexOf(Math.min.apply(null, te)) + 1;
      errWrap.insertAdjacentHTML('beforeend', '<div style="margin-top:0.35rem;"><span style="color:#2563eb;font-weight:700;">●</span> training error: <strong>' + tr[deg - 1].toFixed(3) + '</strong><br>' +
        '<span style="color:#d97706;font-weight:700;">■</span> test error: <strong>' + te[deg - 1].toFixed(3) + '</strong><br>' +
        '<span style="color:var(--ink-muted);">' + (deg === best ? 'This degree gives the lowest test error for this sample.' : deg > best ? 'Too flexible: it is fitting the noise. Try degree ' + best + '.' : 'Too simple: it misses the shape. Try degree ' + best + '.') + '</span></div>');
    }
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What problem did backpropagation solve?', options: ['How to make computers faster', 'How to train neural networks with hidden layers, by sending the error backwards to adjust every weight', 'How to store more data', 'How to write expert-system rules'], answer: 1, explanation: 'It works out how much each weight contributed to the error, so all of them can be nudged downhill at once (gradient descent).' },
      { question: 'What is gradient descent?', options: ['A way of cooling computers', 'Repeatedly adjusting the weights a little in the direction that reduces the error most, like walking downhill in fog', 'A type of chess opening', 'A way of drawing graphs'], answer: 1, explanation: 'The learning rate sets the step size: too small and learning crawls, too big and it overshoots.' },
      { question: 'What is special about a convolutional network like LeCun’s?', options: ['It has no weights', 'It slides the same small filters across the whole image, so a pattern is recognised wherever it appears', 'It only works on colour photos', 'It uses rules written by experts'], answer: 1, explanation: 'Sharing the same filter everywhere means far fewer weights to learn, and early layers learn edge detectors by themselves.' },
      { question: 'What was the "statistical turn" in speech recognition and translation?', options: ['Replacing hand-written rules of grammar with probabilities learned from large amounts of real data', 'Counting how many people use computers', 'Banning statistics from AI', 'Using only small dictionaries'], answer: 0, explanation: 'IBM’s translation work, for example, learned from millions of sentences of Canadian parliamentary records in two languages.' },
      { question: 'How does a naive Bayes spam filter decide?', options: ['It reads the email like a person', 'It adds up evidence from each word, based on how often that word appeared in spam and in normal email', 'It blocks every email with a link', 'It asks the sender'], answer: 1, explanation: 'It is "naive" because it treats each word as independent evidence, which is not true but works surprisingly well.' },
      { question: 'How did TD-Gammon learn backgammon?', options: ['From a grandmaster’s notes', 'By playing hundreds of thousands of games against itself and learning from the results', 'By searching every possible game', 'It was programmed with fixed rules'], answer: 1, explanation: 'It used temporal-difference learning, improving its estimates of each position to match later ones.' },
      { question: 'How did Deep Blue beat Kasparov in 1997?', options: ['By learning from millions of games against itself', 'Mainly by searching about 200 million positions a second with special chips and a hand-tuned scoring rule', 'By reading Kasparov’s mind', 'By using a neural network'], answer: 1, explanation: 'Deep Blue was a triumph of engineering and search, not of learning, which is why some called it "brute force".' },
      { question: 'What is overfitting?', options: ['A model too simple to fit the data', 'A model so flexible that it memorises the noise in its training data and does badly on new data', 'A computer that is too full', 'Training for too short a time'], answer: 1, explanation: 'That is why models are always judged on test data they never saw during training.' },
      { question: 'Why did support vector machines and random forests overtake neural networks in the late 1990s and 2000s?', options: ['They were more reliable, easier to train and often more accurate with the data and computers of the time', 'Neural networks were banned', 'They could think', 'They did not need any data'], answer: 0, explanation: 'Deep neural networks were hard to train (the "vanishing gradient" problem) until better methods, more data and faster chips arrived.' },
      { question: 'What did the Netflix Prize (2006–2009) show?', options: ['That people dislike films', 'That combining many learned models, trained on lots of data, can beat any single clever method', 'That expert systems are best', 'That recommendations can’t be improved'], answer: 1, explanation: 'The winning team blended hundreds of models to improve predictions by just over 10%.' }
    ]);
  };
})();
