/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 3: Big Promises and AI Winters
   Figures:
     1. fig-ai-timeline-3  The story at a glance (clickable timeline)
     2. fig-eliza          Talk to a small ELIZA-style program
     3. fig-xor-hidden     Why one neuron can't do XOR, and two layers can
     4. fig-explosion      The combinatorial explosion
     5. fig-expert         A tiny expert system that asks questions and explains
     6. fig-quiz-ai3       Test yourself
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
    { name: 'Golden years', color: '#15803d' },
    { name: 'First winter', color: '#1d4ed8' },
    { name: 'Expert-system boom', color: '#b45309' },
    { name: 'Second winter', color: '#6d28d9' }
  ];
  var EVENTS = [
    { year: '1963', icon: '💵', era: 0, sec: 3, title: 'Money with few strings', text: 'The US defence research agency ARPA begins giving MIT millions of dollars for computing and AI research, with few conditions attached.' },
    { year: '1965', icon: '🔮', era: 0, sec: 3, title: '"Any work a man can do"', text: 'Herbert Simon predicts machines will be able to do any work a person can do within twenty years.' },
    { year: '1965', icon: '🧪', era: 2, sec: 10, title: 'DENDRAL begins', text: 'At Stanford, a program starts to work out chemical structures from experimental data, using an expert chemist’s knowledge: the first expert system.' },
    { year: '1966', icon: '💬', era: 0, sec: 5, title: 'ELIZA', text: 'Joseph Weizenbaum’s ELIZA imitates a therapist by turning your words back into questions. People confide in it.' },
    { year: '1966', icon: '📉', era: 1, sec: 6, title: 'The ALPAC report', text: 'A US report finds machine translation slower, less accurate and more expensive than human translators. Funding is cut.' },
    { year: '1966', icon: '🤖', era: 0, sec: 4, title: 'Shakey the robot', text: 'Work begins at SRI on Shakey, the first mobile robot to reason about its own actions.' },
    { year: '1968', icon: '🗺️', era: 0, sec: 4, title: 'A* search', text: 'Shakey’s team invents A*, a way of finding shortest routes that is still used in maps and games.' },
    { year: '1969', icon: '📕', era: 1, sec: 7, title: 'Perceptrons', text: 'Minsky and Papert’s book shows what single-layer perceptrons cannot learn. Interest in neural networks collapses.' },
    { year: '1970', icon: '🧱', era: 0, sec: 4, title: 'SHRDLU', text: 'Terry Winograd’s program understands typed English commands about a small world of blocks.' },
    { year: '1972', icon: '🧐', era: 1, sec: 15, title: 'What Computers Can’t Do', text: 'Philosopher Hubert Dreyfus argues that human expertise is not rule-following at all.' },
    { year: '1973', icon: '🇬🇧', era: 1, sec: 9, title: 'The Lighthill report', text: 'A report for the British government says AI has failed to deliver. UK funding collapses.' },
    { year: '1974', icon: '❄️', era: 1, sec: 9, title: 'The first AI winter', text: 'DARPA cuts back AI funding in the US too. Researchers start avoiding the words "artificial intelligence".' },
    { year: '1976', icon: '💊', era: 2, sec: 10, title: 'MYCIN', text: 'A Stanford expert system recommends antibiotics for blood infections, and explains its reasoning.' },
    { year: '1980', icon: '🖥️', era: 2, sec: 10, title: 'XCON makes money', text: 'An expert system at Digital Equipment Corporation configures computer orders, saving the company millions a year.' },
    { year: '1982', icon: '🇯🇵', era: 2, sec: 11, title: 'Japan’s Fifth Generation', text: 'Japan launches a ten-year national project to build intelligent computers. The West responds with its own programmes.' },
    { year: '1984', icon: '⚠️', era: 3, sec: 12, title: '"AI winter" warning', text: 'At a major conference, leading researchers warn that the hype will lead to another collapse. They coin the phrase "AI winter".' },
    { year: '1987', icon: '📦', era: 3, sec: 12, title: 'The crash', text: 'The market for specialised AI computers collapses as cheaper desktop machines catch up. Expert systems prove costly to maintain.' },
    { year: '1992', icon: '🏁', era: 3, sec: 12, title: 'Fifth Generation ends', text: 'Japan’s project closes without reaching its ambitious goals.' }
  ];

  FIG['fig-ai-timeline-3'] = function (figEl) {
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
    var selected = 10;
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of AI from 1963 to 1992');
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
     Figure 2. An ELIZA-style program
     ----------------------------------------------------------------------- */
  var REFLECT = { 'i': 'you', 'me': 'you', 'my': 'your', 'am': 'are', 'mine': 'yours', 'myself': 'yourself', 'you': 'I', 'your': 'my', 'yours': 'mine', 'yourself': 'myself', 'are': 'am', "i'm": 'you are', "you're": 'I am', 'was': 'were' };
  var RULES = [
    { key: 'sorry', re: /\bsorry\b/, out: ['Please don’t apologise.', 'Apologies are not necessary.'] },
    { key: 'dream', re: /\bdream(?:s|t|ed)?\b/, out: ['What does that dream suggest to you?', 'Do you dream often?'] },
    { key: 'computer', re: /\b(?:computers?|machines?|robots?|ai)\b/, out: ['Do computers worry you?', 'Why do you mention computers?', 'What do you think machines have to do with your problem?'] },
    { key: 'family word', re: /\b(mother|father|mum|mom|dad|sister|brother|family|wife|husband)\b/, out: ['Tell me more about your family.', 'How do you get on with your {1}?', 'Who else in your family comes to mind?'] },
    { key: 'i need / i want', re: /\bi (?:need|want) (.+)/, out: ['Why do you need {1}?', 'Would it really help you to get {1}?', 'What would it mean to you if you got {1}?'] },
    { key: 'i feel', re: /\bi feel (.+)/, out: ['Tell me more about such feelings.', 'Do you often feel {1}?', 'What makes you feel {1}?'] },
    { key: 'i am', re: /\b(?:i am|i'm) (.+)/, out: ['How long have you been {1}?', 'Do you believe it is normal to be {1}?', 'Why do you tell me you are {1}?'] },
    { key: 'you ... me', re: /\byou (.+) me\b/, out: ['What makes you think I {1} you?', 'Does it please you to believe I {1} you?', 'Perhaps you would like to {1} me.'] },
    { key: 'because', re: /\bbecause (.+)/, out: ['Is that the real reason?', 'What other reasons come to mind?', 'Does that reason explain anything else?'] },
    { key: 'always', re: /\b(?:always|never)\b/, out: ['Can you think of a specific example?', 'Really, always?'] },
    { key: 'my ...', re: /\bmy (.+)/, out: ['Your {1}?', 'Why do you say your {1}?', 'Does anyone else know about your {1}?'] },
    { key: 'yes', re: /^\s*yes\b/, out: ['You seem quite sure.', 'I see. Please go on.'] },
    { key: 'no', re: /^\s*no\b/, out: ['Why not?', 'Are you saying no just to be negative?'] },
    { key: 'question', re: /\?\s*$/, out: ['Why do you ask?', 'What do you think?', 'Does that question interest you?'] }
  ];
  var FALLBACK = ['Please go on.', 'I see.', 'What does that suggest to you?', 'Can you say more about that?'];
  function reflect(s) {
    return s.replace(/[.!?,;]+$/, '').split(/\s+/).map(function (w) { var k = w.toLowerCase(); return REFLECT.hasOwnProperty(k) ? REFLECT[k] : w; }).join(' ');
  }
  FIG['fig-eliza'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var counts = {}, fb = 0;
    var starters = div('', container); starters.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.6rem;';
    var log = div('', container);
    log.setAttribute('aria-live', 'polite');
    log.style.cssText = 'height:230px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);padding:0.75rem;font-family:var(--font-mono);font-size:0.88rem;line-height:1.5;';
    var form = document.createElement('form'); form.style.cssText = 'display:flex;gap:0.4rem;margin-top:0.5rem;';
    var input = document.createElement('input'); input.type = 'text'; input.placeholder = 'Type something and press Enter'; input.setAttribute('aria-label', 'Your message to ELIZA'); input.maxLength = 160;
    input.style.cssText = 'flex:1;min-width:0;padding:0.5rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface);color:var(--ink);font-family:var(--font-sans);font-size:0.95rem;';
    var send = btn('Send', form, 'fig-button'); send.type = 'submit';
    form.insertBefore(input, send);
    container.appendChild(form);
    var how = div('', container);
    how.style.cssText = 'margin-top:0.6rem;padding:0.6rem 0.8rem;border-left:3px solid var(--accent);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.85rem;color:var(--ink-secondary);line-height:1.5;';
    how.innerHTML = '<strong>How ELIZA chose its reply</strong> will appear here.';

    function add(who, s) {
      var line = div('', log);
      line.innerHTML = '<strong style="color:' + (who === 'ELIZA' ? 'var(--accent)' : 'var(--callout-warn)') + ';">' + who + ':</strong> ' + esc(s);
      log.scrollTop = log.scrollHeight;
    }
    function reply(text) {
      var low = text.toLowerCase();
      for (var i = 0; i < RULES.length; i++) {
        var r = RULES[i], m = low.match(r.re);
        if (!m) continue;
        var n = counts[r.key] = (counts[r.key] || 0) + 1, tpl = r.out[(n - 1) % r.out.length];
        var frag = m[1] ? reflect(text.substr(low.indexOf(m[1]), m[1].length)) : '';
        var out = tpl.replace('{1}', frag);
        how.innerHTML = '<strong>How ELIZA chose its reply:</strong> it looked for keywords in order of priority and found <strong>"' + r.key + '"</strong>.' +
          (m[1] ? ' It copied the words after it ("' + esc(m[1]) + '"), swapped I/you and my/your to get "' + esc(frag) + '",' : '') +
          ' and dropped them into the template <em>"' + esc(tpl.replace('{1}', '…')) + '"</em>. It understood nothing.';
        return out;
      }
      var f = FALLBACK[fb++ % FALLBACK.length];
      how.innerHTML = '<strong>How ELIZA chose its reply:</strong> no keyword matched, so it used a stock phrase: <em>"' + f + '"</em>.';
      return f;
    }
    function say(text) {
      text = text.trim();
      if (!text) return;
      add('You', text);
      var r = reply(text);
      setTimeout(function () { add('ELIZA', r); }, 350);
    }
    ['I feel sad today', 'My mother doesn’t understand me', 'I think computers are taking over', 'You don’t listen to me', 'I need a holiday'].forEach(function (s) {
      btn(s, starters).addEventListener('click', function () { say(s.replace(/’/g, "'")); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); say(input.value); input.value = ''; });
    add('ELIZA', 'Hello. How are you feeling today?');
  };

  /* -----------------------------------------------------------------------
     Figure 3. XOR: one line can't, two lines can
     ----------------------------------------------------------------------- */
  FIG['fig-xor-hidden'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var PTS = [[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]];
    var mode = 'one', A = { a: 30, c: 0.1 }, B = { a: 45, c: 0.35 };
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowM = group(controls, 'Network');
    var oneB = btn('One neuron (one line)', rowM), twoB = btn('Two hidden neurons (two lines)', rowM);
    var solB = btn('Show a solution', rowM);
    oneB.addEventListener('click', function () { mode = 'one'; build(); draw(); });
    twoB.addEventListener('click', function () { mode = 'two'; build(); draw(); });
    solB.addEventListener('click', function () {
      if (mode === 'one') { mode = 'two'; }
      A = { a: 45, c: -0.35 }; B = { a: 45, c: 0.35 }; build(); draw();
    });
    var sliders = div('fig-controls', container);
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:1 1 240px;max-width:340px;margin:0 auto;';
    var side = div('', lay); side.style.cssText = 'flex:1 1 220px;font-family:var(--font-sans);font-size:0.88rem;line-height:1.5;color:var(--ink-secondary);';
    function build() {
      sliders.innerHTML = '';
      FIG.slider(sliders, { id: 'xor-a1', label: mode === 'one' ? 'Line angle' : 'Line 1 angle', min: 0, max: 355, step: 5, value: A.a, unit: '°', onChange: function (v) { A.a = v; draw(); } });
      FIG.slider(sliders, { id: 'xor-c1', label: mode === 'one' ? 'Line position' : 'Line 1 position', min: -0.8, max: 0.8, step: 0.05, value: A.c, onChange: function (v) { A.c = v; draw(); } });
      if (mode === 'two') {
        FIG.slider(sliders, { id: 'xor-a2', label: 'Line 2 angle', min: 0, max: 355, step: 5, value: B.a, unit: '°', onChange: function (v) { B.a = v; draw(); } });
        FIG.slider(sliders, { id: 'xor-c2', label: 'Line 2 position', min: -0.8, max: 0.8, step: 0.05, value: B.c, onChange: function (v) { B.c = v; draw(); } });
      }
    }
    function sgn(L, x, y) { var t = L.a * Math.PI / 180; return Math.cos(t) * (x - 0.5) + Math.sin(t) * (y - 0.5) - L.c; }
    function out(x, y) { return mode === 'one' ? (sgn(A, x, y) > 0 ? 1 : 0) : (sgn(A, x, y) > 0 && sgn(B, x, y) < 0 ? 1 : 0); }
    function draw() {
      var c = C();
      oneB.classList.toggle('active', mode === 'one'); twoB.classList.toggle('active', mode === 'two');
      svgWrap.innerHTML = '';
      var S = 320, lo = -0.3, hi = 1.3, m = function (v) { return (v - lo) / (hi - lo) * S; };
      var svg = FIG.createSVG(svgWrap, S, S, 'The four XOR points and the dividing lines');
      svg.style.overflow = 'hidden';
      el('rect', { x: 0, y: 0, width: S, height: S, rx: 6, fill: c.surface, stroke: c.border }, svg);
      var N = 64, cell = S / N, path1 = '';
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var x = lo + (i + 0.5) / N * (hi - lo), y = hi - (j + 0.5) / N * (hi - lo);
        if (out(x, y)) path1 += 'M' + (i * cell) + ' ' + (j * cell) + 'h' + cell + 'v' + cell + 'h-' + cell + 'z';
      }
      el('path', { d: path1, fill: '#3b82f6', opacity: 0.12 }, svg);
      [A].concat(mode === 'two' ? [B] : []).forEach(function (L, k) {
        var t = L.a * Math.PI / 180, nx = Math.cos(t), ny = Math.sin(t);
        var px = 0.5 + nx * L.c, py = 0.5 + ny * L.c, dx = -ny * 3, dy = nx * 3;
        el('line', { x1: m(px - dx), y1: S - m(py - dy), x2: m(px + dx), y2: S - m(py + dy), stroke: k ? c.key : c.ink, 'stroke-width': 2.5 }, svg);
        // small arrow showing the "on" side
        el('line', { x1: m(px), y1: S - m(py), x2: m(px + nx * 0.12), y2: S - m(py + ny * 0.12), stroke: k ? c.key : c.ink, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, svg);
      });
      var right = 0;
      PTS.forEach(function (p) {
        var ok = out(p[0], p[1]) === p[2]; if (ok) right++;
        var X = m(p[0]), Y = S - m(p[1]);
        if (p[2]) el('circle', { cx: X, cy: Y, r: 12, fill: '#2563eb', stroke: ok ? c.tip : '#dc2626', 'stroke-width': 4 }, svg);
        else el('rect', { x: X - 11, y: Y - 11, width: 22, height: 22, fill: '#d97706', stroke: ok ? c.tip : '#dc2626', 'stroke-width': 4 }, svg);
        txt(svg, X, Y + (p[1] ? -20 : 30), '(' + p[0] + ', ' + p[1] + ')', { size: 12, fill: c.muted });
      });
      side.innerHTML = '<div style="font-weight:700;color:var(--ink);font-size:1rem;">' + right + ' of 4 correct' + (right === 4 ? ' ✓' : '') + '</div>' +
        '<div style="margin-top:0.35rem;">Blue circles should be inside the shaded "fires" region; orange squares outside. A green ring means correct, red means wrong.</div>' +
        (mode === 'one'
          ? '<div style="margin-top:0.5rem;">One neuron can only draw one straight line. However you turn it, the best you can do is <strong>3 of 4</strong>.</div>'
          : '<div style="margin-top:0.5rem;">Each hidden neuron draws its own line; the output neuron fires only for points on the arrow side of line 1 <em>and</em> the far side of line 2, so it can pick out a band.</div>');
    }
    build(); draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. The combinatorial explosion
     ----------------------------------------------------------------------- */
  function bigNum(x) {
    if (x < 1e6) return Math.round(x).toLocaleString('en-GB');
    var names = [[1e18, 'quintillion'], [1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
    if (x >= 1e21) return '10^' + Math.floor(Math.log10(x)) + ' (a 1 with ' + Math.floor(Math.log10(x)) + ' zeros)';
    for (var i = 0; i < names.length; i++) if (x >= names[i][0]) return (x / names[i][0]).toPrecision(3).replace(/\.?0+$/, '') + ' ' + names[i][1];
  }
  function duration(s) {
    if (s < 1) return 'less than a second';
    var u = [[3.156e7, 'year'], [86400, 'day'], [3600, 'hour'], [60, 'minute'], [1, 'second']];
    for (var i = 0; i < u.length; i++) if (s >= u[i][0]) {
      var v = s / u[i][0];
      if (u[i][1] === 'year' && v > 1.38e10) return 'about ' + bigNum(v / 1.38e10) + ' times the age of the universe';
      var t = v >= 100 ? bigNum(v) : v.toPrecision(2).replace(/\.0$/, '');
      return 'about ' + t + ' ' + u[i][1] + (v >= 1.5 ? 's' : '');
    }
  }
  FIG['fig-explosion'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var b = 4, d = 6, speed = 1e3;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var sb = FIG.slider(controls, { id: 'ex-b', label: 'Choices at each step', min: 2, max: 40, step: 1, value: b, onChange: function (v) { b = v; draw(); } });
    var sd = FIG.slider(controls, { id: 'ex-d', label: 'Steps to look ahead', min: 1, max: 20, step: 1, value: d, onChange: function (v) { d = v; draw(); } });
    var rowS = group(controls, 'Computer speed');
    var s1 = btn('1970s: 1,000 a second', rowS), s2 = btn('Today: 100 million a second', rowS);
    s1.addEventListener('click', function () { speed = 1e3; draw(); });
    s2.addEventListener('click', function () { speed = 1e8; draw(); });
    var rowP = group(controls, 'Examples');
    [['Noughts and crosses', 4, 9], ['Chess, 6 moves', 35, 6], ['Chess, whole game', 35, 20]].forEach(function (p) {
      btn(p[0], rowP).addEventListener('click', function () { b = p[1]; d = p[2]; sb.setValue(b); sd.setValue(d); draw(); });
    });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.5rem;font-family:var(--font-sans);font-size:0.95rem;line-height:1.6;color:var(--ink-secondary);';
    function draw() {
      var c = C();
      s1.classList.toggle('active', speed === 1e3); s2.classList.toggle('active', speed === 1e8);
      svgWrap.innerHTML = '';
      var W = Math.max(290, Math.min(640, Math.round(svgWrap.clientWidth || 600))), H = 200;
      var svg = FIG.createSVG(svgWrap, W, H, 'A tree of possibilities growing with each step');
      var levels = Math.min(d, 4), shown = Math.min(b, 4), prev = [[(W + 42) / 2, 18]];
      el('circle', { cx: (W + 42) / 2, cy: 18, r: 6, fill: c.accent }, svg);
      for (var L = 1; L <= levels; L++) {
        var y = 18 + L * 38, nodes = [], count = Math.pow(shown, L), gap = (W - 62) / count;
        for (var k = 0; k < count; k++) {
          var x = 52 + gap * (k + 0.5), par = prev[Math.floor(k / shown)];
          el('line', { x1: par[0], y1: par[1], x2: x, y2: y, stroke: c.faint, 'stroke-width': count > 80 ? 0.4 : 1 }, svg);
          nodes.push([x, y]);
        }
        nodes.forEach(function (n) { el('circle', { cx: n[0], cy: n[1], r: count > 60 ? 1.2 : 4, fill: c.accent, opacity: 0.85 }, svg); });
        txt(svg, 4, y + 4, 'step ' + L, { anchor: 'start', size: 11, fill: c.muted });
        prev = nodes;
      }
      if (b > shown || d > levels) txt(svg, W / 2, H - 4, 'Drawing only ' + shown + ' branches and ' + levels + ' steps; the real tree is far bigger', { size: 11.5, fill: c.muted });
      var n = Math.pow(b, d);
      read.innerHTML = 'Possibilities to check: <strong style="color:var(--ink);">' + b + '<sup>' + d + '</sup> = ' + bigNum(n) + '</strong><br>' +
        'Time at ' + (speed === 1e3 ? '1,000' : '100 million') + ' per second: <strong style="color:var(--ink);">' + duration(n / speed) + '</strong>';
    }
    draw();
    window.addEventListener('resize', function () { draw(); });
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. A tiny expert system (backward chaining, with explanations)
     ----------------------------------------------------------------------- */
  var KB = {
    rules: [
      { id: 1, then: 'mammal', if: ['has hair'] },
      { id: 2, then: 'mammal', if: ['gives milk'] },
      { id: 3, then: 'bird', if: ['has feathers'] },
      { id: 4, then: 'bird', if: ['flies', 'lays eggs'] },
      { id: 5, then: 'carnivore', if: ['mammal', 'eats meat'] },
      { id: 6, then: 'ungulate', if: ['mammal', 'has hooves'] },
      { id: 7, then: 'cheetah', if: ['carnivore', 'is tawny', 'has dark spots'] },
      { id: 8, then: 'tiger', if: ['carnivore', 'is tawny', 'has black stripes'] },
      { id: 9, then: 'giraffe', if: ['ungulate', 'has a long neck', 'has dark spots'] },
      { id: 10, then: 'zebra', if: ['ungulate', 'has black stripes'] },
      { id: 11, then: 'ostrich', if: ['bird', 'cannot fly', 'has a long neck'] },
      { id: 12, then: 'penguin', if: ['bird', 'cannot fly', 'swims'] },
      { id: 13, then: 'albatross', if: ['bird', 'flies well'] }
    ],
    goals: ['cheetah', 'tiger', 'giraffe', 'zebra', 'ostrich', 'penguin', 'albatross'],
    q: {
      'has hair': 'Does the animal have hair or fur?', 'gives milk': 'Does it feed its young on milk?', 'has feathers': 'Does it have feathers?',
      'flies': 'Does it fly?', 'lays eggs': 'Does it lay eggs?', 'eats meat': 'Does it eat meat?', 'has hooves': 'Does it have hooves?',
      'is tawny': 'Is it tawny (sandy yellow-brown)?', 'has dark spots': 'Does it have dark spots?', 'has black stripes': 'Does it have black stripes?',
      'has a long neck': 'Does it have a long neck?', 'cannot fly': 'Is it unable to fly?', 'swims': 'Does it swim?', 'flies well': 'Is it an excellent flyer?'
    }
  };
  var ANIMALS = { cheetah: '🐆', tiger: '🐅', giraffe: '🦒', zebra: '🦓', ostrich: '🐦', penguin: '🐧', albatross: '🕊️' };
  FIG['fig-expert'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var facts, trace, pending, active;
    function reset() { facts = {}; trace = []; pending = null; active = null; }
    reset();
    var top = div('', container); top.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;';
    var talk = div('', top); talk.style.cssText = 'flex:1 1 260px;';
    var rulesBox = div('', top); rulesBox.style.cssText = 'flex:1 1 240px;font-family:var(--font-mono);font-size:0.78rem;line-height:1.55;color:var(--ink-muted);max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.7rem;background:var(--surface-raised);';
    // Evaluate a goal against the facts known so far.
    // Returns true / false, or {need: fact, rule: r} when a question must be asked.
    function evalGoal(g, stack) {
      if (KB.q[g]) {
        if (facts.hasOwnProperty(g)) return facts[g];
        return { need: g, rule: stack[stack.length - 1] };
      }
      var rs = KB.rules.filter(function (r) { return r.then === g; }), unknown = null;
      for (var i = 0; i < rs.length; i++) {
        var res = evalRule(rs[i], stack.concat([rs[i]]));
        if (res === true) return true;
        if (res !== false && !unknown) unknown = res;
        if (res !== false) return res; // ask about this rule before trying the next
      }
      return unknown || false;
    }
    function evalRule(r, stack) {
      for (var i = 0; i < r.if.length; i++) {
        var v = evalGoal(r.if[i], stack);
        if (v === false) return false;
        if (v !== true) return v;
      }
      if (trace.indexOf(r.id) < 0) trace.push(r.id);
      return true;
    }
    function ruleText(r) { return 'Rule ' + r.id + ': IF ' + r.if.join(' AND ') + ' THEN it is ' + (/^[aeiou]/.test(r.then) ? 'an ' : 'a ') + r.then; }
    function run() {
      for (var i = 0; i < KB.goals.length; i++) {
        var g = KB.goals[i], res = evalGoal(g, []);
        if (res === true) return { found: g };
        if (res !== false) return res;
      }
      return { found: null };
    }
    function render() {
      var st = run();
      pending = st.need || null; active = st.rule || null;
      var h = '';
      if (st.need) {
        h += '<div style="font-family:var(--font-sans);font-size:1.02rem;font-weight:700;color:var(--ink);margin-bottom:0.6rem;">' + KB.q[st.need] + '</div>';
        talk.innerHTML = h;
        var row = div('', talk); row.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;';
        btn('Yes', row, 'fig-button').addEventListener('click', function () { facts[pending] = true; render(); });
        btn('No', row, 'fig-button').addEventListener('click', function () { facts[pending] = false; render(); });
        var why = btn('Why are you asking?', row);
        var whyBox = div('', talk); whyBox.style.cssText = 'margin-top:0.6rem;font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-secondary);line-height:1.5;';
        why.addEventListener('click', function () {
          whyBox.innerHTML = 'Because I am trying <strong>' + ruleText(st.rule) + '</strong>. ' +
            (Object.keys(facts).length ? 'I already know: ' + Object.keys(facts).map(function (k) { return (facts[k] ? '' : 'NOT ') + k; }).join(', ') + '.' : '');
        });
      } else {
        var r = st.found;
        h += '<div style="font-family:var(--font-sans);font-size:1.1rem;font-weight:700;color:var(--ink);">' + (r ? 'I conclude it is ' + (/^[aeiou]/.test(r) ? 'an ' : 'a ') + r + ' ' + ANIMALS[r] : 'I can’t identify this animal. It isn’t one of the seven I know about.') + '</div>';
        if (r) h += '<div style="margin-top:0.5rem;font-family:var(--font-sans);font-size:0.86rem;color:var(--ink-secondary);line-height:1.5;"><strong>How I decided:</strong><br>' +
          trace.map(function (id) { return ruleText(KB.rules[id - 1]); }).join('<br>') + '</div>';
        talk.innerHTML = h;
        var again = btn('Start again', div('', talk), 'fig-button');
        again.parentNode.style.marginTop = '0.6rem';
        again.addEventListener('click', function () { reset(); render(); });
      }
      rulesBox.innerHTML = '<div style="font-family:var(--font-sans);font-weight:700;color:var(--ink);margin-bottom:0.25rem;">The knowledge base: 13 rules</div>' +
        KB.rules.map(function (r) {
          var on = active && active.id === r.id, done = trace.indexOf(r.id) >= 0;
          return '<div style="' + (on ? 'color:var(--ink);font-weight:700;background:var(--accent-light);border-radius:3px;' : done ? 'color:var(--callout-tip);' : '') + '">' + (done ? '✓ ' : on ? '▶ ' : '&nbsp;&nbsp;') + esc(ruleText(r)) + '</div>';
        }).join('');
    }
    render();
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      {
        question: 'What did Herbert Simon predict in 1965?',
        options: ['That computers would never play chess', 'That within twenty years machines would be able to do any work a person can do', 'That AI would be banned', 'That neural networks would win'],
        answer: 1,
        explanation: 'Predictions like this, and Minsky’s "within a generation", raised expectations that the technology of the time could not meet.'
      },
      {
        question: 'Why could SHRDLU understand English so well?',
        options: ['It had read the whole internet', 'It worked in a tiny "microworld" of blocks on a table, where everything could be spelled out', 'It was secretly operated by a person', 'It used a neural network'],
        answer: 1,
        explanation: 'Inside its blocks world it was impressive, but the methods did not scale up to the messy real world.'
      },
      {
        question: 'How did ELIZA produce its replies?',
        options: ['By understanding the user’s feelings', 'By spotting keywords and slotting the user’s own words into ready-made templates', 'By searching a medical database', 'By copying a real therapist'],
        answer: 1,
        explanation: 'Weizenbaum was alarmed at how readily people treated this simple trick as real understanding: the "ELIZA effect".'
      },
      {
        question: 'What did the 1966 ALPAC report conclude about machine translation?',
        options: ['That it was already better than people', 'That it was slower, less accurate and more expensive than human translation', 'That it should be made compulsory', 'That Russian was too hard to learn'],
        answer: 1,
        explanation: 'US government funding for machine translation was cut sharply afterwards.'
      },
      {
        question: 'What did Minsky and Papert’s book "Perceptrons" (1969) show?',
        options: ['That perceptrons could learn anything', 'That single-layer perceptrons cannot learn some simple patterns, such as XOR', 'That the brain has no neurons', 'How to train multi-layer networks'],
        answer: 1,
        explanation: 'Networks with a hidden layer could do it, but nobody yet had a good way to train them. Funding for neural networks dried up for over a decade.'
      },
      {
        question: 'What is the "combinatorial explosion"?',
        options: ['A fire in an early computer', 'The way the number of possibilities to check grows astronomically as a problem gets bigger', 'A type of chemical reaction', 'A sudden rise in AI funding'],
        answer: 1,
        explanation: 'Methods that worked on toy problems drowned in possibilities on real ones. The Lighthill report singled this out.'
      },
      {
        question: 'What was the main idea behind expert systems such as MYCIN?',
        options: ['Learning everything from raw data', 'Capturing a human expert’s knowledge as hundreds of IF–THEN rules', 'Copying the structure of the brain', 'Searching every possibility'],
        answer: 1,
        explanation: 'Feigenbaum summed it up: "knowledge is power". General cleverness mattered less than lots of specific knowledge.'
      },
      {
        question: 'Why were expert systems hard to keep working?',
        options: ['They needed too much electricity', 'Rules had to be extracted from experts by hand, were brittle outside their narrow area, and became costly to maintain', 'Experts refused to use computers', 'They ran too fast'],
        answer: 1,
        explanation: 'This "knowledge acquisition bottleneck" was one reason the 1980s boom ended in a second winter.'
      },
      {
        question: 'What does "Moravec’s paradox" say?',
        options: ['Computers find chess hard but walking easy', 'What is hard for people (like advanced maths) can be easy for computers, and what is easy for a small child (like seeing and moving) is very hard', 'AI will always be ten years away', 'More data always helps'],
        answer: 1,
        explanation: 'Skills that evolution has polished over millions of years feel effortless to us, which hides how complex they are.'
      },
      {
        question: 'What is an "AI winter"?',
        options: ['A period when AI research is done in cold climates', 'A period of disappointment when funding and interest in AI collapse after hype', 'A season when computers run faster', 'A project to model the weather'],
        answer: 1,
        explanation: 'There were two major winters: in the mid-1970s and from the late 1980s into the early 1990s.'
      }
    ]);
  };
})();
