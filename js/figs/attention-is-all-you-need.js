/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 6: Attention Is All You Need
   Figures:
     1. fig-ai-timeline-6  The story at a glance (clickable timeline)
     2. fig-self-attention Which words does "it" attend to? (illustrative weights)
     3. fig-next-word      A tiny next-word predictor with temperature (toy n-gram model)
     4. fig-scaling        The shape of a scaling law (illustrative constants)
     5. fig-reward-model   Teach a reward model your preferences (toy)
     6. fig-quiz-ai6       Test yourself
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
    { name: 'The transformer', color: '#1d4ed8' },
    { name: 'Scaling up', color: '#0f766e' },
    { name: 'Pictures and code', color: '#b45309' },
    { name: 'Assistants', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '2017', icon: '⚡', era: 0, sec: 3, title: '"Attention Is All You Need"', text: 'Eight Google researchers introduce the transformer, a network built entirely around attention.' },
    { year: '2017', icon: '👍', era: 3, sec: 10, title: 'Learning from human preferences', text: 'Researchers at OpenAI and DeepMind train an agent from people’s choices between pairs of video clips.' },
    { year: '2018', icon: '📖', era: 0, sec: 5, title: 'GPT-1 and BERT', text: 'OpenAI’s GPT and Google’s BERT show that a transformer pre-trained on lots of text can be adapted to many tasks.' },
    { year: '2019', icon: '🦄', era: 1, sec: 6, title: 'GPT-2', text: 'A 1.5-billion-parameter model writes surprisingly fluent text. OpenAI releases it in stages, citing misuse worries.' },
    { year: '2020', icon: '📈', era: 1, sec: 7, title: 'Scaling laws', text: 'OpenAI researchers find that a language model’s error falls smoothly and predictably as it gets bigger.' },
    { year: '2020', icon: '🧮', era: 1, sec: 7, title: 'GPT-3', text: 'A 175-billion-parameter model can do new tasks from a few examples in its prompt.' },
    { year: '2021', icon: '🖼️', era: 2, sec: 9, title: 'DALL·E and CLIP', text: 'OpenAI shows models that link pictures and words, and generate images from descriptions.' },
    { year: '2021', icon: '💻', era: 2, sec: 9, title: 'GitHub Copilot', text: 'A model trained on public code begins suggesting code to programmers as they type.' },
    { year: '2022', icon: '🎯', era: 3, sec: 10, title: 'InstructGPT', text: 'Training with human feedback makes a small model more helpful, in people’s judgement, than a model 100 times its size.' },
    { year: '2022', icon: '🎨', era: 2, sec: 9, title: 'Image generators for all', text: 'DALL·E 2, Midjourney and the openly released Stable Diffusion put image generation in millions of hands.' },
    { year: '2022', icon: '🐭', era: 1, sec: 7, title: 'Chinchilla', text: 'DeepMind finds that most big models had been trained on too little data for their size.' },
    { year: '2022', icon: '💬', era: 3, sec: 11, title: 'ChatGPT', text: 'On 30 November OpenAI releases a free chatbot. It reaches a million users within a week.' },
    { year: '2023', icon: '🏁', era: 3, sec: 11, title: 'The race begins', text: 'Google, Anthropic, Meta and others release rival models; OpenAI releases GPT-4 in March (Part 7).' }
  ];
  FIG['fig-ai-timeline-6'] = function (figEl) {
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
      var rows = W < 560 ? 2 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 26;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of language models from 2017 to 2023');
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
     Figure 2. Self-attention (illustrative, hand-set weights)
     ----------------------------------------------------------------------- */
  var SENTS = {
    tired: { words: ['The', 'animal', 'didn’t', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'] },
    wide: { words: ['The', 'animal', 'didn’t', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'wide'] }
  };
  // Hand-chosen attention patterns for a few words (others fall back to a local pattern)
  function attn(key, i) {
    var n = 11, w = new Array(n).fill(0.02);
    var set = function (j, v) { w[j] = v; };
    if (i === 7) { // "it"
      if (key === 'tired') { set(1, 0.55); set(10, 0.15); set(5, 0.08); set(0, 0.05); }
      else { set(5, 0.55); set(10, 0.15); set(1, 0.08); set(4, 0.05); }
    } else if (i === 10) { set(7, 0.35); set(key === 'tired' ? 1 : 5, 0.35); set(9, 0.1); }
    else if (i === 3) { set(1, 0.4); set(5, 0.3); set(2, 0.15); }
    else if (i === 2) { set(3, 0.45); set(1, 0.25); }
    else if (i === 6) { set(3, 0.25); set(8, 0.2); set(10, 0.2); set(2, 0.15); }
    else { set(i, 0.35); if (i > 0) set(i - 1, 0.25); if (i < n - 1) set(i + 1, 0.2); }
    var s = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (v) { return v / s; });
  }
  FIG['fig-self-attention'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var key = 'tired', focus = 7;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Sentence ending');
    var tB = btn('… because it was too tired', row), wB = btn('… because it was too wide', row);
    tB.addEventListener('click', function () { key = 'tired'; draw(); });
    wB.addEventListener('click', function () { key = 'wide'; draw(); });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var note = div('', container); note.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.9rem;color:var(--ink-secondary);line-height:1.5;';
    function draw() {
      var c = C();
      tB.classList.toggle('active', key === 'tired'); wB.classList.toggle('active', key === 'wide');
      svgWrap.innerHTML = '';
      var words = SENTS[key].words, W = Math.max(300, Math.min(700, Math.round(svgWrap.clientWidth || 640)));
      var two = W < 560, perRow = two ? 6 : 11, rowH = 126, H = (two ? 2 : 1) * rowH + 6;
      var svg = FIG.createSVG(svgWrap, W, H, 'Attention weights from one word to every word in the sentence');
      var a = attn(key, focus), pos = [];
      words.forEach(function (wd, i) {
        var r = Math.floor(i / perRow), k = i % perRow, cols = Math.min(perRow, words.length - r * perRow);
        var cw = (W - 20) / perRow, x = 10 + cw * (k + 0.5), y = r * rowH + 110;
        pos.push([x, y, cw]);
      });
      var fx = pos[focus][0], fy = pos[focus][1];
      words.forEach(function (wd, i) {
        var x = pos[i][0], y = pos[i][1], cw = pos[i][2], v = a[i];
        var bh = v * 120;
        el('rect', { x: x - cw * 0.3, y: y - 22 - bh, width: cw * 0.6, height: bh, rx: 2, fill: c.key, opacity: 0.25 + 0.75 * Math.min(1, v * 2.2) }, svg);
        if (v > 0.06) txt(svg, x, y - 26 - bh, Math.round(v * 100) + '%', { size: 11, weight: 600, fill: c.key });
        var g = el('g', { style: 'cursor:pointer;', tabindex: 0, role: 'button', 'aria-label': 'Focus on the word ' + wd }, svg);
        el('rect', { x: x - cw * 0.47, y: y - 16, width: cw * 0.94, height: 28, rx: 5, fill: i === focus ? c.accent : c.raised, stroke: i === focus ? c.accent : c.border }, g);
        txt(g, x, y + 3, wd, { size: two ? 11 : 13, weight: i === focus ? 700 : 500, fill: i === focus ? '#fff' : c.ink });
        keyClick(g, function () { focus = i; draw(); });
      });
      var top = a.map(function (v, i) { return [v, i]; }).sort(function (p, q) { return q[0] - p[0]; })[0];
      note.innerHTML = 'The bars show how much the word <strong>"' + esc(words[focus]) + '"</strong> attends to each word when building its meaning. Most attention goes to <strong>"' + esc(words[top[1]]) + '"</strong>.' +
        (focus === 7 ? (key === 'tired' ? ' Change the last word from "tired" to "wide" and watch "it" switch from the animal to the street.' : ' Change the last word back to "tired" and watch "it" switch back to the animal.') : ' Tap any word, especially "it", to see where its attention goes.');
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. A tiny next-word predictor (word-pair and word-triple counts)
     ----------------------------------------------------------------------- */
  var CORPUS = 'the cat sat on the mat . the dog sat on the rug . the cat chased the mouse . the dog chased the cat . ' +
    'the mouse ran under the bed . the cat slept on the bed . the dog slept by the fire . the sun was warm . ' +
    'the rain was cold . the cat was hungry . the dog was hungry . the mouse was clever . the cat ate the fish . ' +
    'the dog ate the bone . the mouse ate the cheese . the children played in the garden . the children ran in the park . ' +
    'the dog ran in the park . the cat sat in the sun . the bird sang in the tree . the bird flew over the garden . ' +
    'the sun was bright . the garden was quiet . the fire was warm . the cat sat by the fire . the dog sat in the garden . ' +
    'the mouse hid under the rug . the bird sat on the fence . the cat watched the bird . the dog watched the children .';
  FIG['fig-next-word'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var toks = CORPUS.split(/\s+/).filter(Boolean), bi = {}, tri = {};
    for (var i = 0; i < toks.length - 1; i++) {
      (bi[toks[i]] = bi[toks[i]] || {})[toks[i + 1]] = (bi[toks[i]][toks[i + 1]] || 0) + 1;
      if (i < toks.length - 2) { var k2 = toks[i] + ' ' + toks[i + 1]; (tri[k2] = tri[k2] || {})[toks[i + 2]] = (tri[k2][toks[i + 2]] || 0) + 1; }
    }
    var text = ['the', 'cat'], temp = 1;
    function dist() {
      var n = text.length, k2 = n >= 2 ? text[n - 2] + ' ' + text[n - 1] : null, src = k2 && tri[k2] ? tri[k2] : bi[text[n - 1]] || bi['.'];
      var items = Object.keys(src).map(function (w) { return [w, Math.pow(src[w], 1 / temp)]; });
      var s = items.reduce(function (a, b) { return a + b[1]; }, 0);
      return { items: items.map(function (p) { return [p[0], p[1] / s]; }).sort(function (a, b) { return b[1] - a[1]; }), ctx: k2 && tri[k2] ? 'the last two words' : 'the last word' };
    }
    function pick(top) {
      var d = dist().items;
      if (top) return d[0][0];
      var r = Math.random(), acc = 0;
      for (var i = 0; i < d.length; i++) { acc += d[i][1]; if (r <= acc) return d[i][0]; }
      return d[d.length - 1][0];
    }
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowA = group(controls, 'Add words');
    var topB = btn('Most likely word', rowA, 'fig-button'), sampB = btn('Pick at random (by probability)', rowA), genB = btn('Write 12 words', rowA);
    var rowS = group(controls, 'Start again with');
    ['the cat', 'the dog', 'the bird', 'the sun'].forEach(function (s) { btn(s, rowS).addEventListener('click', function () { text = s.split(' '); draw(); }); });
    FIG.slider(controls, { id: 'nw-temp', label: 'Temperature (randomness)', min: 0.2, max: 2.5, step: 0.1, value: 1, onChange: function (v) { temp = v; draw(); } });
    var out = div('', container); out.style.cssText = 'margin-top:0.75rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-serif);font-size:1.1rem;line-height:1.6;color:var(--ink);min-height:2.5em;';
    var bars = div('', container); bars.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-secondary);';
    function draw() {
      var d = dist();
      out.innerHTML = esc(text.join(' ').replace(/ \./g, '.')) + '<span style="color:var(--callout-key);font-weight:700;"> ▍</span>';
      var h = '<div style="margin-bottom:0.3rem;">Next-word probabilities, based on ' + d.ctx + ':</div>';
      d.items.slice(0, 8).forEach(function (p) {
        h += '<div style="display:flex;align-items:center;gap:0.5rem;margin:2px 0;"><span style="width:6.5rem;white-space:nowrap;text-align:right;font-family:var(--font-mono);color:var(--ink);">' + (p[0] === '.' ? '(full stop)' : esc(p[0])) + '</span>' +
          '<span style="flex:1;max-width:320px;background:var(--surface-sunken);border-radius:3px;height:12px;"><span style="display:block;height:12px;width:' + Math.max(1, Math.round(p[1] * 100)) + '%;background:var(--callout-key);border-radius:3px;"></span></span>' +
          '<span style="width:3rem;font-family:var(--font-mono);">' + Math.round(p[1] * 100) + '%</span></div>';
      });
      bars.innerHTML = h;
    }
    function add(w) { text.push(w); if (text.length > 60) text = text.slice(-60); }
    topB.addEventListener('click', function () { add(pick(true)); draw(); });
    sampB.addEventListener('click', function () { add(pick(false)); draw(); });
    genB.addEventListener('click', function () { for (var i = 0; i < 12; i++) add(pick(false)); draw(); });
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 4. The shape of a scaling law (illustrative constants)
     ----------------------------------------------------------------------- */
  FIG['fig-scaling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var logN = 9, ALPHA = 0.076;
    var MODELS = [{ n: 1.17e8, name: 'GPT-1' }, { n: 1.5e9, name: 'GPT-2' }, { n: 1.75e11, name: 'GPT-3' }];
    var loss = function (n) { return 1.8 * Math.pow(n / 1e8, -ALPHA) * 2; };
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'sc-n', label: 'Model size (log scale)', min: 6, max: 12, step: 0.1, value: logN, onChange: function (v) { logN = v; draw(); } });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.92rem;color:var(--ink-secondary);line-height:1.55;';
    function fmt(n) { return n >= 1e9 ? (n / 1e9).toPrecision(3).replace(/\.?0+$/, '') + ' billion' : n >= 1e6 ? (n / 1e6).toPrecision(3).replace(/\.?0+$/, '') + ' million' : Math.round(n).toLocaleString('en-GB'); }
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.min(640, Math.round(svgWrap.clientWidth || 600))), H = 280, L = 46, R = 14, T = 16, B = 40;
      var svg = FIG.createSVG(svgWrap, W, H, 'Error falling as a straight line on log–log axes as model size grows');
      var lo = loss(1e12), hi = loss(1e6);
      var X = function (lg) { return L + (lg - 6) / 6 * (W - L - R); }, Y = function (v) { return T + (Math.log(hi * 1.05) - Math.log(v)) / (Math.log(hi * 1.05) - Math.log(lo * 0.95)) * (H - T - B); };
      for (var e = 6; e <= 12; e++) {
        el('line', { x1: X(e), y1: T, x2: X(e), y2: H - B, stroke: c.border }, svg);
        txt(svg, X(e), H - B + 16, e === 6 ? '1 million' : e === 9 ? '1 billion' : e === 12 ? '1 trillion' : '', { size: 11, fill: c.muted, anchor: e === 6 ? 'start' : e === 12 ? 'end' : 'middle' });
      }
      txt(svg, (L + W - R) / 2, H - 6, 'number of parameters (each grid line is 10× more)', { size: 11.5, fill: c.muted });
      var t = txt(svg, 14, (T + H - B) / 2, 'error (lower is better)', { size: 11.5, fill: c.muted });
      t.setAttribute('transform', 'rotate(-90 14 ' + (T + H - B) / 2 + ')');
      var d = '';
      for (var lg = 6; lg <= 12.001; lg += 0.1) d += (d ? 'L' : 'M') + X(lg).toFixed(1) + ' ' + Y(loss(Math.pow(10, lg))).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 2.5 }, svg);
      MODELS.forEach(function (m) {
        var lg = Math.log10(m.n);
        el('circle', { cx: X(lg), cy: Y(loss(m.n)), r: 5, fill: c.surface, stroke: c.warn, 'stroke-width': 2 }, svg);
        txt(svg, X(lg) + 8, Y(loss(m.n)) - 8, m.name, { anchor: 'start', size: 12, weight: 600, fill: c.warn });
      });
      var n = Math.pow(10, logN);
      el('circle', { cx: X(logN), cy: Y(loss(n)), r: 7, fill: c.key }, svg);
      read.innerHTML = 'A model with <strong>' + fmt(n) + '</strong> parameters. Each time the model is made 10 times bigger (with enough data and computing), its error falls by the same fraction, about <strong>' + Math.round((1 - Math.pow(10, -ALPHA)) * 100) + '%</strong>. On log–log axes that steady pattern is a straight line.';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Teach a reward model (toy Bradley–Terry model on hand-labelled features)
     ----------------------------------------------------------------------- */
  var FEATS = ['Answers the question', 'Contains a mistake', 'Polite and friendly', 'Admits uncertainty when unsure', 'Very long-winded'];
  var PAIRS = [
    { q: 'What is the capital of Australia?', a: ['Canberra.', [1, 0, 0, 0, 0]], b: ['Sydney, Australia’s capital and largest city.', [1, 1, 0, 0, 0]] },
    { q: 'How many legs does a spider have?', a: ['Spiders have eight legs. Hope that helps!', [1, 0, 1, 0, 0]], b: ['Six.', [1, 1, 0, 0, 0]] },
    { q: 'Who will win next year’s football league?', a: ['City will definitely win.', [1, 0, 0, 0, 0]], b: ['Nobody can know that yet; here are the teams with the best recent form…', [1, 0, 1, 1, 0]] },
    { q: 'Can you explain what a black hole is?', a: ['A region where gravity is so strong that nothing, not even light, can escape. It forms when a very heavy star collapses.', [1, 0, 0, 0, 0]], b: ['Great question! Black holes are fascinating. Scientists have studied them for many years, and there is so much to say about them, and many people find them interesting, and…', [0, 0, 1, 0, 1]] },
    { q: 'What year did the first person walk on the Moon?', a: ['1969, when Neil Armstrong stepped out of Apollo 11.', [1, 0, 0, 0, 0]], b: ['I’m not completely sure, but I think it was 1972.', [1, 1, 1, 1, 0]] },
    { q: 'Write me a one-line birthday message for my sister.', a: ['Happy birthday to the best sister anyone could ask for!', [1, 0, 1, 0, 0]], b: ['Birthdays are annual celebrations of the anniversary of a person’s birth, observed in many cultures with cakes, candles and gifts.', [0, 0, 0, 0, 1]] },
    { q: 'What is 17 × 3?', a: ['51.', [1, 0, 0, 0, 0]], b: ['Let me think… 17 × 3 is 41.', [1, 1, 0, 0, 0]] },
    { q: 'Is this mole on my arm dangerous?', a: ['It is probably harmless.', [1, 0, 0, 0, 0]], b: ['I can’t tell from a description. Changes in size, shape or colour are reasons to see a doctor soon.', [1, 0, 1, 1, 0]] }
  ];
  FIG['fig-reward-model'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var w = [0, 0, 0, 0, 0], idx = 0, n = 0, agree = 0;
    var sig = function (z) { return 1 / (1 + Math.exp(-z)); };
    var score = function (f) { return f.reduce(function (s, v, i) { return s + v * w[i]; }, 0); };
    var card = div('', container);
    var lay = div('', container); lay.style.cssText = 'margin-top:0.75rem;';
    function chosen(win, lose) {
      // Bradley–Terry update: raise the score of the preferred answer relative to the other
      var p = sig(score(win) - score(lose));
      if (p > 0.5) agree++;
      for (var i = 0; i < w.length; i++) w[i] += 0.8 * (1 - p) * (win[i] - lose[i]);
      n++; idx = (idx + 1) % PAIRS.length; draw();
    }
    function draw() {
      var P = PAIRS[idx], c = C(), predA = sig(score(P.a[1]) - score(P.b[1]));
      card.innerHTML = '<div style="font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-muted);margin-bottom:0.3rem;">Question ' + (n + 1) + ': which answer is better?</div>' +
        '<div style="font-family:var(--font-sans);font-weight:700;color:var(--ink);margin-bottom:0.5rem;">' + esc(P.q) + '</div>';
      var row = div('', card); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.6rem;';
      [['A', P.a, P.b], ['B', P.b, P.a]].forEach(function (o) {
        var b = btn('', row, 'fig-map-btn');
        b.style.cssText = 'flex:1 1 230px;text-align:left;padding:0.6rem 0.8rem;line-height:1.45;font-size:0.9rem;white-space:normal;';
        b.innerHTML = '<strong>' + o[0] + '.</strong> ' + esc(o[1][0]);
        b.addEventListener('click', function () { chosen(o[1][1], o[2][1]); });
      });
      card.insertAdjacentHTML('beforeend', '<div style="margin-top:0.4rem;font-family:var(--font-sans);font-size:0.84rem;color:var(--ink-muted);">' +
        (n ? 'Before you choose, the reward model predicts you will prefer <strong>' + (predA >= 0.5 ? 'A' : 'B') + '</strong> (' + Math.round(Math.max(predA, 1 - predA) * 100) + '% sure).' : 'The reward model has no idea yet: it starts with every weight at zero.') + '</div>');
      var mx = Math.max(1, Math.max.apply(null, w.map(Math.abs)));
      var h = '<div style="font-family:var(--font-sans);font-weight:700;color:var(--ink);font-size:0.9rem;margin-bottom:0.3rem;">What the reward model has learned about your taste (' + n + ' choice' + (n === 1 ? '' : 's') + (n > 1 ? ', it predicted ' + agree + ' of them' : '') + ')</div>';
      FEATS.forEach(function (f, i) {
        var v = w[i], pct = Math.round(Math.abs(v) / mx * 46);
        h += '<div style="display:flex;align-items:center;gap:0.4rem;margin:3px 0;font-family:var(--font-sans);font-size:0.84rem;"><span style="flex:0 0 13.5rem;max-width:45%;text-align:right;color:var(--ink-secondary);">' + f + '</span>' +
          '<span style="flex:1;display:flex;"><span style="flex:1;display:flex;justify-content:flex-end;">' + (v < 0 ? '<span style="height:12px;width:' + pct * 2 + '%;background:#dc2626;border-radius:2px;"></span>' : '') + '</span>' +
          '<span style="width:1px;height:16px;background:var(--border-strong);"></span><span style="flex:1;">' + (v > 0 ? '<span style="display:block;height:12px;width:' + pct * 2 + '%;background:var(--callout-tip);border-radius:2px;"></span>' : '') + '</span></span></div>';
      });
      h += '<div style="font-family:var(--font-sans);font-size:0.8rem;color:var(--ink-muted);margin-top:0.25rem;">Green: you reward it. Red: you penalise it.</div>';
      lay.innerHTML = h;
      var again = btn('Reset the reward model', lay); again.style.marginTop = '0.4rem';
      again.addEventListener('click', function () { w = [0, 0, 0, 0, 0]; idx = 0; n = 0; agree = 0; draw(); });
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What was new about the transformer (2017)?', options: ['It used no data', 'It relied entirely on attention, letting every word look at every other word at once, so it could be trained in parallel on GPUs', 'It was a robot', 'It replaced neural networks with rules'], answer: 1, explanation: 'Earlier networks read text one word at a time. The transformer processes all the words together, which suits GPUs.' },
      { question: 'What is a large language model trained to do, at heart?', options: ['Look up answers in a database', 'Predict the next token (piece of a word) in a text, over and over', 'Translate only', 'Follow hand-written grammar rules'], answer: 1, explanation: 'Everything else, from answering questions to writing code, grows out of that one training task done on enormous amounts of text.' },
      { question: 'What did BERT learn from?', options: ['Filling in hidden words in sentences, using the words on both sides', 'Playing Go', 'Labelled photos', 'Human rankings'], answer: 0, explanation: 'GPT models predict the next word; BERT predicts masked words from both directions, which suits understanding tasks such as search.' },
      { question: 'Why did OpenAI release GPT-2 in stages in 2019?', options: ['It was too slow', 'They were worried it might be misused, for example to mass-produce fake news', 'It did not work', 'It was patented'], answer: 1, explanation: 'Many researchers thought the risk was overstated, and the full model was released nine months later. The debate about releasing models continues.' },
      { question: 'What do "scaling laws" describe?', options: ['How heavy computers are', 'How a model’s error falls smoothly and predictably as model size, data and computing increase', 'The law against copying data', 'How fast GPUs get'], answer: 1, explanation: 'They gave companies the confidence to spend huge sums training ever larger models.' },
      { question: 'What surprised people about GPT-3?', options: ['It could not write sentences', 'It could do new tasks from just a few examples given in its prompt, without retraining', 'It played chess', 'It was smaller than GPT-2'], answer: 1, explanation: 'This "in-context learning" meant one model could be used for many jobs just by changing the prompt.' },
      { question: 'What is RLHF?', options: ['A new kind of chip', 'Reinforcement learning from human feedback: people rank answers, a reward model learns their preferences, and the language model is trained to score well', 'A programming language', 'A type of image generator'], answer: 1, explanation: 'It turned raw text predictors into helpful assistants, and made a small InstructGPT preferred to the much larger GPT-3.' },
      { question: 'How fast did ChatGPT spread after its release on 30 November 2022?', options: ['It took years to reach a million users', 'It passed a million users within about five days', 'Only researchers could use it', 'It was withdrawn after a day'], answer: 1, explanation: 'By early 2023 it was estimated to have around 100 million monthly users.' },
      { question: 'What is a "hallucination" in a language model?', options: ['A picture it draws', 'A confident, fluent statement that is false or made up, such as a fake reference', 'A dream it has at night', 'An error message'], answer: 1, explanation: 'Models are trained to produce plausible text, and plausible is not always true.' },
      { question: 'What does the "stochastic parrots" criticism claim?', options: ['That models are made from birds', 'That language models stitch together patterns from their training text without understanding what it means', 'That models are always right', 'That parrots can program'], answer: 1, explanation: 'Others point to evidence that models build internal representations of the world. The debate is unresolved.' }
    ]);
  };
})();
