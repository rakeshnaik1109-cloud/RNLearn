/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 7: Where We Are Now
   Figures:
     1. fig-ai-timeline-7   The story at a glance (clickable timeline)
     2. fig-think-longer    More attempts plus a majority vote (simulation)
     3. fig-agent-loop      An agent at work, step by step (illustrative script)
     4. fig-doubling        What a doubling trend implies (calculator)
     5. fig-quiz-ai7        Test yourself
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
    { name: 'Models', color: '#1d4ed8' },
    { name: 'Reasoning and science', color: '#0f766e' },
    { name: 'Agents', color: '#b45309' },
    { name: 'Society and cost', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'Mar 2023', icon: '4️⃣', era: 0, sec: 3, title: 'GPT-4', text: 'OpenAI’s GPT-4 can read images as well as text, and does well on many professional exams.' },
    { year: 'Jul 2023', icon: '🦙', era: 0, sec: 3, title: 'Open-weight models', text: 'Meta releases Llama 2 with downloadable weights that companies can run themselves. Many open models follow.' },
    { year: 'Dec 2023', icon: '♊', era: 0, sec: 3, title: 'Gemini', text: 'Google DeepMind launches Gemini, built from the start to handle text, images, audio and video.' },
    { year: 'Dec 2023', icon: '⚖️', era: 3, sec: 12, title: 'The New York Times sues', text: 'The newspaper sues OpenAI and Microsoft over the use of its articles for training, one of many copyright cases.' },
    { year: 'May 2024', icon: '🗣️', era: 0, sec: 9, title: 'Real-time voice', text: 'GPT-4o holds spoken conversations with almost no delay, and can see through a phone camera.' },
    { year: 'May 2024', icon: '🧬', era: 1, sec: 6, title: 'AlphaFold 3', text: 'The new AlphaFold predicts how proteins interact with DNA, RNA and drug-like molecules.' },
    { year: 'Sep 2024', icon: '🤔', era: 1, sec: 4, title: 'Reasoning models', text: 'OpenAI’s o1 is trained to "think" at length before answering, and does much better at maths and coding.' },
    { year: 'Oct 2024', icon: '🖱️', era: 2, sec: 7, title: 'Computer use', text: 'Anthropic releases a model that can operate a computer by looking at the screen and moving the mouse.' },
    { year: 'Jan 2025', icon: '🐋', era: 0, sec: 5, title: 'The DeepSeek moment', text: 'China’s DeepSeek releases R1, an openly available reasoning model trained at far lower reported cost. Chip-maker shares tumble.' },
    { year: 'Jan 2025', icon: '🏗️', era: 3, sec: 11, title: 'Stargate', text: 'OpenAI and partners announce plans to invest up to $500 billion in US data centres.' },
    { year: 'Mar 2025', icon: '⏱️', era: 2, sec: 8, title: 'Measuring task length', text: 'METR finds the length of tasks AI agents can complete has been doubling roughly every seven months.' },
    { year: 'Jul 2025', icon: '🥇', era: 1, sec: 6, title: 'Maths Olympiad gold', text: 'AI systems from Google DeepMind and OpenAI reach gold-medal level at the International Mathematical Olympiad.' },
    { year: 'Aug 2025', icon: '5️⃣', era: 0, sec: 3, title: 'GPT-5', text: 'OpenAI’s GPT-5 decides for itself when to answer quickly and when to reason at length.' },
    { year: 'Oct 2025', icon: '👥', era: 3, sec: 10, title: '800 million a week', text: 'OpenAI says 800 million people use ChatGPT every week.' },
    { year: 'Jan 2026', icon: '📈', era: 2, sec: 8, title: 'The pace quickens', text: 'METR’s updated measurements suggest task length has doubled faster since 2023, roughly every four months.' },
    { year: '2026', icon: '🤖', era: 2, sec: 7, title: 'The year of agents', text: 'Successive models from the leading labs focus on long, multi-step work, especially writing and fixing software.' }
  ];
  FIG['fig-ai-timeline-7'] = function (figEl) {
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
    var selected = 6;
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
      var rows = W < 560 ? 4 : 2, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 34;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of AI from 2023 to 2026');
      for (var r = 0; r < rows; r++) {
        var ly = r * rowH + 62, list = EVENTS.slice(r * per, (r + 1) * per);
        if (!list.length) continue;
        var step = list.length > 1 ? (W - 2 * pad) / (list.length - 1) : 0;
        el('line', { x1: pad - 22, y1: ly, x2: W - pad + 22, y2: ly, stroke: c.border, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        if (r < rows - 1) txt(svg, W - 4, ly + 4, '→', { anchor: 'end', size: 13, fill: c.faint });
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
     Figure 2. Thinking longer: several attempts and a majority vote
     ----------------------------------------------------------------------- */
  FIG['fig-think-longer'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p = 0.4, k = 5, seed = 1, last = null;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'tl-p', label: 'Chance a single attempt is right', min: 0.15, max: 0.8, step: 0.05, value: p, onChange: function (v) { p = v; draw(); } });
    FIG.slider(controls, { id: 'tl-k', label: 'Number of attempts', min: 1, max: 41, step: 2, value: k, onChange: function (v) { k = v; draw(); } });
    var row = group(controls, 'Try one problem');
    btn('Solve it', row, 'fig-button').addEventListener('click', function () { last = runOnce(rng(seed++ * 7919)); draw(); });
    var demo = div('', container); demo.style.cssText = 'margin-top:0.75rem;font-family:var(--font-sans);font-size:0.88rem;color:var(--ink-secondary);min-height:3.2em;line-height:1.6;';
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.5rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.3rem;font-family:var(--font-sans);font-size:0.9rem;color:var(--ink-secondary);line-height:1.5;';
    // A wrong attempt lands on one of 6 plausible wrong answers, so mistakes scatter while right answers agree.
    function runOnce(r) {
      var votes = {}, list = [];
      for (var i = 0; i < k; i++) {
        var a = r() < p ? '42' : String([36, 38, 40, 44, 46, 48][Math.floor(r() * 6)]);
        votes[a] = (votes[a] || 0) + 1; list.push(a);
      }
      var best = Object.keys(votes).sort(function (x, y) { return votes[y] - votes[x]; })[0];
      return { list: list, best: best };
    }
    function accuracy(kk) {
      var r = rng(12345 + kk), ok = 0, T = 1500, save = k; k = kk;
      for (var t = 0; t < T; t++) if (runOnce(r).best === '42') ok++;
      k = save; return ok / T;
    }
    var cache = {};
    function draw() {
      var c = C(), key = p.toFixed(2);
      if (!cache[key]) { cache[key] = []; for (var kk = 1; kk <= 41; kk += 2) cache[key].push([kk, accuracy(kk)]); }
      var data = cache[key];
      if (last) demo.innerHTML = 'Answers given: ' + last.list.map(function (a) { return '<span style="display:inline-block;padding:0 0.3rem;margin:1px;border-radius:3px;font-family:var(--font-mono);background:' + (a === '42' ? 'rgba(21,128,61,0.15)' : 'rgba(220,38,38,0.12)') + ';">' + a + '</span>'; }).join('') +
        '<br>Majority answer: <strong style="color:' + (last.best === '42' ? 'var(--callout-tip)' : '#dc2626') + ';">' + last.best + (last.best === '42' ? ' (correct)' : ' (wrong)') + '</strong>';
      else demo.innerHTML = 'Press "Solve it" to make several attempts at one problem (correct answer: 42) and take the most common answer.';
      svgWrap.innerHTML = '';
      var W = Math.max(290, Math.min(620, Math.round(svgWrap.clientWidth || 560))), H = 220, L = 40, R = 12, T = 12, B = 34;
      var svg = FIG.createSVG(svgWrap, W, H, 'Chance of the majority answer being right, against number of attempts');
      var X = function (v) { return L + (v - 1) / 40 * (W - L - R); }, Y = function (v) { return T + (1 - v) * (H - T - B); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: W - R, y2: Y(v), stroke: c.border }, svg); txt(svg, L - 5, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: 10.5, fill: c.muted }); });
      [1, 11, 21, 31, 41].forEach(function (v) { txt(svg, X(v), H - B + 15, String(v), { size: 10.5, fill: c.muted }); });
      txt(svg, (L + W - R) / 2, H - 4, 'number of attempts', { size: 11, fill: c.muted });
      el('polyline', { points: data.map(function (d) { return X(d[0]).toFixed(1) + ',' + Y(d[1]).toFixed(1); }).join(' '), fill: 'none', stroke: c.accent, 'stroke-width': 2.5 }, svg);
      el('line', { x1: L, y1: Y(p), x2: W - R, y2: Y(p), stroke: c.faint, 'stroke-dasharray': '4 4' }, svg);
      var cur = data.filter(function (d) { return d[0] === k; })[0];
      el('circle', { cx: X(k), cy: Y(cur[1]), r: 6, fill: c.key }, svg);
      read.innerHTML = 'With <strong>' + k + '</strong> attempt' + (k > 1 ? 's' : '') + ', the majority answer is right about <strong>' + Math.round(cur[1] * 100) + '%</strong> of the time, compared with ' + Math.round(p * 100) + '% for a single attempt (dashed line).';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. An agent at work (illustrative script)
     ----------------------------------------------------------------------- */
  var STEPS = [
    { kind: 'task', who: 'Person', text: 'The "Download report" button on our website does nothing. Can you fix it?' },
    { kind: 'think', who: 'Agent thinks', text: 'I need to find the code for that button. I’ll search the project for the button’s label.' },
    { kind: 'act', who: 'Tool: search files', text: 'search "Download report"' },
    { kind: 'see', who: 'Result', text: 'Found in reports.js, line 88: button calls downloadReprot()' },
    { kind: 'think', who: 'Agent thinks', text: 'The function is spelled "downloadReprot" here. Let me check what the real function is called.' },
    { kind: 'act', who: 'Tool: search files', text: 'search "function download"' },
    { kind: 'see', who: 'Result', text: 'Found in reports.js, line 12: function downloadReport()' },
    { kind: 'think', who: 'Agent thinks', text: 'A typo: the button calls a function that doesn’t exist. I’ll fix the spelling, then run the tests to check.' },
    { kind: 'act', who: 'Tool: edit file', text: 'reports.js, line 88: downloadReprot() → downloadReport()' },
    { kind: 'act', who: 'Tool: run tests', text: 'run the project’s tests' },
    { kind: 'see', who: 'Result', text: '47 tests passed, 0 failed' },
    { kind: 'done', who: 'Agent replies', text: 'Fixed: the button was calling a misspelled function name (line 88 of reports.js). All 47 tests pass. Please check the change before it goes live.' }
  ];
  var KIND = { task: ['#1d4ed8', '🧑'], think: ['#7c3aed', '💭'], act: ['#b45309', '🛠️'], see: ['#0f766e', '👀'], done: ['#15803d', '✅'] };
  FIG['fig-agent-loop'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 1, timer = null;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Watch the agent');
    var nextB = btn('Next step', row, 'fig-button'), playB = btn('▶ Play all', row), resetB = btn('Start again', row);
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;margin-top:0.75rem;';
    var loopWrap = div('', lay); loopWrap.style.cssText = 'flex:0 1 260px;margin:0 auto;';
    var log = div('', lay); log.style.cssText = 'flex:1 1 280px;font-family:var(--font-sans);font-size:0.88rem;line-height:1.5;max-height:340px;overflow-y:auto;';
    function draw() {
      var c = C(), cur = STEPS[n - 1].kind;
      loopWrap.innerHTML = '';
      var svg = FIG.createSVG(loopWrap, 260, 250, 'The agent loop: think, act, observe, repeat');
      var nodes = [['think', 130, 56, ['Think']], ['act', 206, 168, ['Act', '(use a tool)']], ['see', 54, 168, ['Observe']]];
      el('circle', { cx: 130, cy: 132, r: 76, fill: 'none', stroke: c.border, 'stroke-width': 2, 'stroke-dasharray': '5 5' }, svg);
      nodes.forEach(function (nd) {
        var on = nd[0] === cur, col = KIND[nd[0]][0];
        el('circle', { cx: nd[1], cy: nd[2], r: on ? 26 : 22, fill: on ? col : c.surface, stroke: col, 'stroke-width': 2 }, svg);
        txt(svg, nd[1], nd[2] + 6, KIND[nd[0]][1], { size: 17, font: 'sans-serif' });
        nd[3].forEach(function (line, j) { txt(svg, nd[1], nd[2] < 100 ? nd[2] - 34 + j * 14 : nd[2] + 42 + j * 14, line, { size: 12, weight: on ? 700 : 500, fill: on ? c.ink : c.muted }); });
      });
      txt(svg, 130, 136, cur === 'done' ? 'Finished' : cur === 'task' ? 'Task given' : 'Step ' + n + ' of ' + STEPS.length, { size: 12, weight: 600, fill: c.ink2 });
      log.innerHTML = STEPS.slice(0, n).map(function (s, i) {
        var col = KIND[s.kind][0], mono = s.kind === 'act' || s.kind === 'see';
        return '<div style="border-left:3px solid ' + col + ';padding:0.25rem 0.6rem;margin-bottom:0.35rem;background:' + (i === n - 1 ? 'var(--surface-raised)' : 'transparent') + ';">' +
          '<div style="font-size:0.78rem;font-weight:700;color:' + col + ';">' + KIND[s.kind][1] + ' ' + s.who + '</div>' +
          '<div style="color:var(--ink);' + (mono ? 'font-family:var(--font-mono);font-size:0.82rem;' : '') + '">' + s.text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div></div>';
      }).join('');
      log.scrollTop = log.scrollHeight;
      nextB.disabled = n >= STEPS.length;
    }
    function stop() { clearInterval(timer); timer = null; playB.textContent = '▶ Play all'; }
    nextB.addEventListener('click', function () { if (n < STEPS.length) { n++; draw(); } });
    playB.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (n >= STEPS.length) n = 1;
      playB.textContent = '⏸ Pause';
      timer = setInterval(function () { if (n >= STEPS.length) { stop(); return; } n++; draw(); }, 1100);
    });
    resetB.addEventListener('click', function () { stop(); n = 1; draw(); });
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. What a doubling trend implies (calculator, not a forecast)
     ----------------------------------------------------------------------- */
  function dur(mins) {
    if (mins < 60) return Math.round(mins) + ' minutes';
    var h = mins / 60;
    if (h < 8 * 5) return (h < 10 ? h.toFixed(1) : Math.round(h)) + ' hours';
    var wk = h / 40;
    if (wk < 52) return (wk < 10 ? wk.toFixed(1) : Math.round(wk)) + ' working weeks';
    return (wk / 48).toFixed(1) + ' working years';
  }
  FIG['fig-doubling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var dbl = 7, years = 3;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowD = group(controls, 'Doubling time');
    var b4 = btn('Every 4 months', rowD), b7 = btn('Every 7 months', rowD), b12 = btn('Every 12 months', rowD);
    b4.addEventListener('click', function () { dbl = 4; draw(); });
    b7.addEventListener('click', function () { dbl = 7; draw(); });
    b12.addEventListener('click', function () { dbl = 12; draw(); });
    FIG.slider(controls, { id: 'db-y', label: 'Years after reaching 1-hour tasks', min: 0, max: 6, step: 0.5, value: years, onChange: function (v) { years = v; draw(); } });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--ink-secondary);line-height:1.55;';
    function draw() {
      var c = C();
      b4.classList.toggle('active', dbl === 4); b7.classList.toggle('active', dbl === 7); b12.classList.toggle('active', dbl === 12);
      svgWrap.innerHTML = '';
      var W = Math.max(290, Math.min(620, Math.round(svgWrap.clientWidth || 560))), H = 230, L = 70, R = 12, T = 12, B = 34;
      var svg = FIG.createSVG(svgWrap, W, H, 'Task length growing exponentially on a logarithmic scale');
      var maxMin = 60 * Math.pow(2, 72 / 4);
      var X = function (y) { return L + y / 6 * (W - L - R); }, Y = function (m) { return T + (1 - Math.log(m) / Math.log(maxMin)) * (H - T - B); };
      [[1, '1 min'], [60, '1 hour'], [60 * 40, '1 week'], [60 * 40 * 48, '1 year'], [60 * 40 * 48 * 100, '100 years']].forEach(function (g) {
        if (g[0] > maxMin) return;
        el('line', { x1: L, y1: Y(g[0]), x2: W - R, y2: Y(g[0]), stroke: c.border }, svg);
        txt(svg, L - 6, Y(g[0]) + 4, g[1], { anchor: 'end', size: 10.5, fill: c.muted });
      });
      for (var y = 0; y <= 6; y++) txt(svg, X(y), H - B + 15, '+' + y + ' yr', { size: 10.5, fill: c.muted });
      [[4, c.faint], [7, c.faint], [12, c.faint]].forEach(function (s) {
        var d = '';
        for (var t = 0; t <= 6.001; t += 0.1) d += (d ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(Math.min(maxMin, 60 * Math.pow(2, t * 12 / s[0]))).toFixed(1);
        el('path', { d: d, fill: 'none', stroke: s[0] === dbl ? c.accent : s[1], 'stroke-width': s[0] === dbl ? 3 : 1.5 }, svg);
      });
      var m = 60 * Math.pow(2, years * 12 / dbl);
      el('circle', { cx: X(years), cy: Y(Math.min(maxMin, m)), r: 6, fill: c.key }, svg);
      read.innerHTML = 'If the trend held, <strong>' + years + ' year' + (years === 1 ? '' : 's') + '</strong> after agents can do 1-hour tasks, they would manage tasks taking a skilled person about <strong>' + dur(m) + '</strong>.' +
        '<br><span style="font-size:0.85rem;color:var(--ink-muted);">This is arithmetic, not a forecast: real trends can speed up, slow down or stop.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is a "multimodal" model?', options: ['A model that runs on many computers', 'A model that can take in and produce more than one kind of data, such as text, images and sound', 'A model with many owners', 'A model that only answers in modes'], answer: 1, explanation: 'GPT-4, Gemini, Claude and others can read images, and some can listen and speak in real time.' },
      { question: 'What is new about "reasoning models" such as OpenAI’s o1 and DeepSeek’s R1?', options: ['They are much smaller', 'They are trained to work through a problem at length before answering, and do better on maths and coding', 'They cannot use language', 'They only play games'], answer: 1, explanation: 'They were trained with reinforcement learning on problems whose answers can be checked. Spending more computing time while answering helps.' },
      { question: 'Why did DeepSeek’s R1 cause such a stir in January 2025?', options: ['It was the largest model ever', 'It matched leading reasoning models while being openly released and reportedly far cheaper to train', 'It was banned everywhere', 'It was a robot'], answer: 1, explanation: 'Investors questioned whether huge spending on chips was needed, and Nvidia lost nearly $600 billion of market value in a day.' },
      { question: 'What did AI systems achieve at the 2025 International Mathematical Olympiad?', options: ['Nothing', 'Gold-medal-level scores, solving five of six problems in natural language', 'They wrote the questions', 'They were disqualified'], answer: 1, explanation: 'Google DeepMind’s result was officially graded by the IMO; OpenAI reported the same score from its own grading.' },
      { question: 'What is an AI "agent"?', options: ['A spy', 'A system that carries out multi-step tasks by planning, using tools (such as search, code or a web browser), checking results and continuing', 'A person who sells AI', 'A chatbot that only answers one question'], answer: 1, explanation: 'Coding agents that read, change and test software became widely used in 2025–26.' },
      { question: 'What does METR’s "time horizon" measure?', options: ['How long a model takes to load', 'The length of task, measured by how long it takes skilled humans, that an AI agent can complete with 50% success', 'How far ahead a model can predict the weather', 'How old a model is'], answer: 1, explanation: 'It roughly doubled every seven months from 2019 to 2025, and faster since 2023.' },
      { question: 'What did a 2025 trial with experienced open-source programmers find?', options: ['AI made them twice as fast', 'With AI tools they were on average 19% slower, though they believed they were faster', 'AI replaced them', 'AI made no difference to anything'], answer: 1, explanation: 'Other studies, for example of customer-support staff, found real productivity gains, especially for less experienced workers. Effects depend on the task and the person.' },
      { question: 'Why do language models still hallucinate?', options: ['They are lazy', 'Training and testing tend to reward a confident guess over saying "I don’t know"', 'They want to deceive', 'They are not connected to electricity'], answer: 1, explanation: 'A 2025 OpenAI paper argued that scoring which gives no credit for admitting uncertainty encourages guessing.' },
      { question: 'What did the IEA project for data-centre electricity use?', options: ['That it would fall', 'That it would roughly double from about 415 TWh in 2024 to about 945 TWh in 2030, with AI the main driver', 'That it would stay the same', 'That data centres use no electricity'], answer: 1, explanation: 'That is still a few per cent of world electricity, but growth is concentrated in particular places, straining local grids.' },
      { question: 'What does it mean to call AI’s abilities "jagged"?', options: ['The models have sharp edges', 'They can be superhuman at some tasks and surprisingly poor at others that seem similar or easier', 'They only work on Tuesdays', 'They improve evenly at everything'], answer: 1, explanation: 'This makes it hard to know when to trust them, and is one reason the "is this AGI?" debate is so unsettled.' }
    ]);
  };
})();
