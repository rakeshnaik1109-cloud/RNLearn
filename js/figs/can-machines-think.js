/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 2: Can Machines Think?
   Figures:
     1. fig-ai-timeline-2  The story at a glance (clickable timeline)
     2. fig-mp-neuron      A McCulloch–Pitts neuron you can wire
     3. fig-tortoise       Grey Walter's light-seeking tortoise
     4. fig-menace         A matchbox machine that learns noughts and crosses
     5. fig-perceptron     Train a perceptron by adding points
     6. fig-quiz-ai2       Test yourself
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
    { name: 'Computers', color: '#1d4ed8' },
    { name: 'Brains and feedback', color: '#0f766e' },
    { name: 'Tests and games', color: '#b45309' },
    { name: 'The new field', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1936', icon: '📜', era: 0, sec: 3, title: 'Turing’s universal machine', text: 'Alan Turing describes, on paper, a simple machine that can carry out any step-by-step calculation, including imitating any other such machine.' },
    { year: '1940', icon: '🔐', era: 0, sec: 3, title: 'Codebreaking machines', text: 'Turing’s "bombe" machines at Bletchley Park start helping to break the German Enigma code.' },
    { year: '1943', icon: '🧠', era: 1, sec: 4, title: 'Neurons as switches', text: 'Warren McCulloch and Walter Pitts show that simplified on/off brain cells, wired together, can carry out logic.' },
    { year: '1944', icon: '📟', era: 0, sec: 3, title: 'Colossus', text: 'Tommy Flowers’s Colossus, an electronic machine with about 1,600 valves, starts reading German teleprinter messages at Bletchley Park.' },
    { year: '1945', icon: '🏛️', era: 0, sec: 3, title: 'ENIAC and the stored program', text: 'ENIAC is completed in the USA, and John von Neumann’s report describes a computer that keeps its program in its own memory.' },
    { year: '1948', icon: '💾', era: 0, sec: 3, title: 'The Manchester Baby', text: 'On 21 June 1948 the Manchester "Baby" runs the first program ever stored in an electronic computer’s memory.' },
    { year: '1948', icon: '🔁', era: 1, sec: 5, title: 'Cybernetics', text: 'Norbert Wiener’s book Cybernetics argues that animals and machines both steer themselves by feedback.' },
    { year: '1948', icon: '0️⃣', era: 2, sec: 6, title: 'Information in bits', text: 'Claude Shannon shows how to measure information in bits, the 0s and 1s that every digital system uses.' },
    { year: '1949', icon: '🐢', era: 1, sec: 5, title: 'Robot tortoises', text: 'Grey Walter’s robot tortoises, Elmer and Elsie, wander towards lights and seem almost alive.' },
    { year: '1949', icon: '🔗', era: 1, sec: 4, title: 'Hebb’s learning rule', text: 'Donald Hebb suggests that the brain learns by strengthening connections between cells that are active together.' },
    { year: '1950', icon: '💬', era: 2, sec: 7, title: 'The imitation game', text: 'Turing asks "Can machines think?" and proposes a conversation test instead.' },
    { year: '1950', icon: '♟️', era: 2, sec: 6, title: 'Shannon on chess', text: 'Shannon explains how a computer could play chess by looking ahead and scoring positions.' },
    { year: '1952', icon: '🔴', era: 2, sec: 9, title: 'Draughts programs', text: 'Christopher Strachey in Britain and Arthur Samuel in the USA write programs that play draughts (checkers).' },
    { year: '1955', icon: '✉️', era: 3, sec: 10, title: '"Artificial intelligence" named', text: 'John McCarthy and colleagues propose a summer workshop on "artificial intelligence", coining the name.' },
    { year: '1956', icon: '🎓', era: 3, sec: 10, title: 'The Dartmouth workshop', text: 'Researchers meet at Dartmouth College for the summer. AI becomes a field with a name.' },
    { year: '1956', icon: '📐', era: 3, sec: 11, title: 'The Logic Theorist', text: 'Allen Newell, Herbert Simon and Cliff Shaw’s program proves theorems from Principia Mathematica.' },
    { year: '1958', icon: '👁️', era: 3, sec: 12, title: 'The perceptron', text: 'Frank Rosenblatt’s perceptron learns to recognise simple patterns by adjusting its connections.' },
    { year: '1959', icon: '📈', era: 2, sec: 9, title: '"Machine learning"', text: 'Samuel’s paper on his self-improving draughts program popularises the term "machine learning".' },
    { year: '1961', icon: '📦', era: 2, sec: 9, title: 'MENACE', text: 'Donald Michie builds a machine from 304 matchboxes and coloured beads that learns to play noughts and crosses.' }
  ];

  FIG['fig-ai-timeline-2'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of AI ideas from 1936 to 1961');
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
     Figure 2. A McCulloch–Pitts neuron
     ----------------------------------------------------------------------- */
  FIG['fig-mp-neuron'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var x = [1, 0], w = [1, 1], th = 2;
    var NAMES = { '0001': 'AND', '0111': 'OR', '1100': 'NOT x₁', '1010': 'NOT x₂', '0110': 'XOR', '0000': 'always off', '1111': 'always on', '0011': 'copy x₁', '0101': 'copy x₂', '1110': 'NOT AND', '1000': 'NOR', '0100': 'x₂ but not x₁', '0010': 'x₁ but not x₂' };
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowP = group(controls, 'Try a ready-made wiring');
    [['AND', [1, 1], 2], ['OR', [1, 1], 1], ['NOT x₁', [-1, 0], 0]].forEach(function (p) {
      btn(p[0], rowP).addEventListener('click', function () { w = p[1].slice(); th = p[2]; draw(); });
    });
    var rowW = group(controls, 'Connection strengths (tap to change)');
    var wB = [btn('', rowW), btn('', rowW)];
    wB.forEach(function (b, i) { b.addEventListener('click', function () { w[i] = w[i] === 1 ? -1 : w[i] === -1 ? 0 : 1; draw(); }); });
    var rowT = group(controls, 'Threshold');
    var tDown = btn('−', rowT), tVal = document.createElement('span'), tUp = btn('+', rowT);
    tVal.className = 'fig-readout'; rowT.insertBefore(tVal, tUp);
    tDown.addEventListener('click', function () { th = Math.max(-1, th - 1); draw(); });
    tUp.addEventListener('click', function () { th = Math.min(3, th + 1); draw(); });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:2 1 300px;';
    var side = div('', lay); side.style.cssText = 'flex:1 1 200px;font-family:var(--font-sans);font-size:0.88rem;';

    function fire(a, b) { return a * w[0] + b * w[1] >= th ? 1 : 0; }
    function draw() {
      var c = C(), sum = x[0] * w[0] + x[1] * w[1], out = sum >= th ? 1 : 0;
      wB.forEach(function (b, i) { b.textContent = 'x' + (i ? '₂' : '₁') + ': ' + (w[i] === 1 ? '+1 (excite)' : w[i] === -1 ? '−1 (inhibit)' : '0 (cut)'); });
      tVal.textContent = String(th);
      svgWrap.innerHTML = '';
      var svg = FIG.createSVG(svgWrap, 460, 230, 'A simple artificial neuron with two inputs');
      var ys = [65, 165];
      [0, 1].forEach(function (i) {
        var y = ys[i], on = x[i] === 1, col = w[i] === 1 ? c.tip : w[i] === -1 ? '#dc2626' : c.faint;
        el('line', { x1: 92, y1: y, x2: 255, y2: 115, stroke: col, 'stroke-width': w[i] === 0 ? 1.5 : (on ? 5 : 2.5), 'stroke-dasharray': w[i] === 0 ? '4 4' : '', opacity: on || w[i] === 0 ? 1 : 0.55 }, svg);
        txt(svg, 175, (y + 115) / 2 + (i ? 22 : -10), w[i] === 1 ? '+1' : w[i] === -1 ? '−1' : '0', { size: 16, weight: 700, fill: col });
        var g = el('g', { style: 'cursor:pointer;', tabindex: 0, role: 'button', 'aria-label': 'Input ' + (i + 1) + (on ? ' on' : ' off') }, svg);
        el('circle', { cx: 60, cy: y, r: 30, fill: on ? c.warn : c.surface, stroke: c.warn, 'stroke-width': 2 }, g);
        txt(g, 60, y + 6, on ? '1' : '0', { size: 20, weight: 700, fill: on ? '#fff' : c.warn });
        txt(g, 60, y - 38, 'input x' + (i ? '₂' : '₁'), { size: 13, fill: c.ink2 });
        keyClick(g, function () { x[i] = 1 - x[i]; draw(); });
      });
      el('circle', { cx: 290, cy: 115, r: 46, fill: out ? c.accent : c.raised, stroke: c.accent, 'stroke-width': 2.5 }, svg);
      txt(svg, 290, 108, 'total ' + sum, { size: 14, weight: 700, fill: out ? '#fff' : c.ink });
      txt(svg, 290, 128, (sum >= th ? '≥ ' : '< ') + th + '?', { size: 13, fill: out ? '#fff' : c.ink2 });
      el('line', { x1: 336, y1: 115, x2: 395, y2: 115, stroke: out ? c.accent : c.faint, 'stroke-width': out ? 5 : 2.5 }, svg);
      el('circle', { cx: 418, cy: 115, r: 22, fill: out ? '#facc15' : c.surface, stroke: c.ink2, 'stroke-width': 2 }, svg);
      txt(svg, 418, 121, String(out), { size: 18, weight: 700, fill: out ? '#713f12' : c.muted });
      txt(svg, 418, 160, out ? 'fires' : 'silent', { size: 13, weight: 600, fill: out ? c.accent : c.muted });
      var code = '' + fire(0, 0) + fire(0, 1) + fire(1, 0) + fire(1, 1);
      var h = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.35rem;">What this neuron computes</div>' +
        '<table style="border-collapse:collapse;font-family:var(--font-mono);font-size:0.86rem;"><tr><th style="padding:2px 10px;border-bottom:1px solid var(--border);">x₁</th><th style="padding:2px 10px;border-bottom:1px solid var(--border);">x₂</th><th style="padding:2px 10px;border-bottom:1px solid var(--border);">output</th></tr>';
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (r) {
        var cur = r[0] === x[0] && r[1] === x[1];
        h += '<tr style="' + (cur ? 'background:var(--accent-light);font-weight:700;' : '') + '"><td style="padding:2px 10px;text-align:center;">' + r[0] + '</td><td style="padding:2px 10px;text-align:center;">' + r[1] + '</td><td style="padding:2px 10px;text-align:center;">' + fire(r[0], r[1]) + '</td></tr>';
      });
      h += '</table><div style="margin-top:0.5rem;color:var(--ink-secondary);">This wiring computes: <strong>' + (NAMES[code] || '?') + '</strong></div>' +
        '<div style="margin-top:0.4rem;color:var(--ink-muted);line-height:1.45;">Challenge: make <strong>XOR</strong> (output 1 when exactly one input is on). Part 3 explains why a single neuron never can.</div>';
      side.innerHTML = h;
    }
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Grey Walter's tortoise
     ----------------------------------------------------------------------- */
  FIG['fig-tortoise'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Tortoise');
    var pauseB = btn('Pause', row), resetB = btn('Start again', row), lampB = btn('Lamp: on', row);
    var rowM = group(controls, 'What it is doing');
    var modeEl = document.createElement('span'); modeEl.className = 'fig-readout'; rowM.appendChild(modeEl);
    var wrap = div('', container); wrap.style.cssText = 'margin-top:0.75rem;';
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;border-radius:var(--radius-sm);border:1px solid var(--border);cursor:crosshair;touch-action:manipulation;display:block;';
    wrap.appendChild(canvas);
    var tip = div('', container, 'Tap or click anywhere to move the lamp.');
    tip.style.cssText = 'font-family:var(--font-sans);font-size:0.85rem;color:var(--ink-muted);margin-top:0.4rem;';
    var W = 600, H = 300, dpr = 1, ctx = canvas.getContext('2d');
    var bot, light, trail, paused = false, lampOn = true, last = 0, mode = '';
    function size() {
      W = Math.max(280, Math.round(wrap.clientWidth || 600)); H = Math.round(Math.min(320, Math.max(220, W * 0.5)));
      dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function reset() {
      size();
      bot = { x: W * 0.2, y: H * 0.75, d: -0.4 };
      light = { x: W * 0.75, y: H * 0.3 };
      trail = [];
    }
    reset();
    function wrapA(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
    function step(dt) {
      // The photocell points the same way as the steering, so the tortoise "looks" where it is going.
      var dx = light.x - bot.x, dy = light.y - bot.y, dist = Math.hypot(dx, dy);
      var a = wrapA(Math.atan2(dy, dx) - bot.d);
      var I = lampOn && Math.abs(a) < 0.32 ? 1 / (1 + Math.pow(dist / (0.35 * W), 2)) : 0;
      var speed;
      if (I > 0.86) { mode = 'Dazzled: too bright, so it turns away'; bot.d += 2.4 * dt; speed = 38; }
      else if (I > 0.12) { mode = 'Light seen: steering stops, it heads for the lamp'; speed = 62; }
      else { mode = lampOn ? 'Exploring: steering turns round, scanning for light' : 'Exploring in the dark'; bot.d += 2.0 * dt; speed = 30; }
      bot.x += Math.cos(bot.d) * speed * dt; bot.y += Math.sin(bot.d) * speed * dt;
      // Touch sensor: on bumping a wall, back off and turn
      var m = 14;
      if (bot.x < m || bot.x > W - m || bot.y < m || bot.y > H - m) {
        bot.x = Math.min(W - m, Math.max(m, bot.x)); bot.y = Math.min(H - m, Math.max(m, bot.y));
        bot.d += 2.2; mode = 'Bumped into the wall: backs off and turns';
      }
      trail.push([bot.x, bot.y]); if (trail.length > 900) trail.shift();
    }
    function render() {
      var c = C();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c.sunken; ctx.fillRect(0, 0, W, H);
      if (lampOn) {
        var gr = ctx.createRadialGradient(light.x, light.y, 2, light.x, light.y, W * 0.35);
        gr.addColorStop(0, 'rgba(250,204,21,0.55)'); gr.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      }
      ctx.beginPath(); ctx.arc(light.x, light.y, 9, 0, 2 * Math.PI);
      ctx.fillStyle = lampOn ? '#facc15' : c.faint; ctx.fill(); ctx.strokeStyle = c.ink2; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5; ctx.beginPath();
      trail.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
      ctx.stroke(); ctx.globalAlpha = 1;
      // Photocell beam
      ctx.save(); ctx.translate(bot.x, bot.y); ctx.rotate(bot.d);
      ctx.fillStyle = 'rgba(29,78,216,0.10)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 70, -0.32, 0.32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, 0, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(9, 0, 3, 0, 2 * Math.PI); ctx.fill();
      ctx.restore();
      modeEl.textContent = mode;
    }
    var anim = FIG.animate(figEl, function (t) {
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
      if (!paused) { step(dt); step(dt); }
      render();
    });
    canvas.addEventListener('click', function (e) {
      var r = canvas.getBoundingClientRect();
      light.x = (e.clientX - r.left) * W / r.width; light.y = (e.clientY - r.top) * H / r.height;
      if (paused) render();
    });
    pauseB.addEventListener('click', function () { paused = !paused; pauseB.textContent = paused ? 'Resume' : 'Pause'; last = 0; });
    resetB.addEventListener('click', function () { reset(); render(); });
    lampB.addEventListener('click', function () { lampOn = !lampOn; lampB.textContent = lampOn ? 'Lamp: on' : 'Lamp: off'; render(); });
    window.addEventListener('resize', function () { var w = wrap.clientWidth; if (Math.abs(w - W) > 30) { reset(); render(); } });
    step(0); render();
    onTheme(render);
    return anim;
  };

  /* -----------------------------------------------------------------------
     Figure 4. MENACE: a matchbox machine that learns noughts and crosses
     ----------------------------------------------------------------------- */
  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  function winner(b) {
    for (var i = 0; i < 8; i++) { var l = LINES[i]; if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]]; }
    return b.indexOf('') < 0 ? 'draw' : null;
  }
  FIG['fig-menace'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var boxes = {}, board, used, over, lastBox = null, history = [], stats = { w: 0, d: 0, l: 0 }, message = '';
    function box(b) {
      var k = b.join(',');
      if (!boxes[k]) {
        var xs = b.filter(function (v) { return v === 'X'; }).length;
        var beads = [4, 3, 2, 1, 1][xs];
        boxes[k] = b.map(function (v) { return v ? 0 : beads; });
      }
      return boxes[k];
    }
    function menaceMove() {
      var bx = box(board), total = bx.reduce(function (a, v) { return a + v; }, 0);
      lastBox = { beads: bx.slice(), board: board.slice() };
      if (!total) return -1; // empty matchbox: MENACE resigns
      var r = Math.random() * total, i = 0;
      for (; i < 9; i++) { r -= bx[i]; if (r < 0) break; }
      used.push([board.join(','), i]);
      board[i] = 'X';
      lastBox.pick = i;
      return i;
    }
    function learn(result) {
      used.forEach(function (u) {
        var bx = boxes[u[0]];
        if (result === 'X') bx[u[1]] += 3; else if (result === 'draw') bx[u[1]] += 1; else bx[u[1]] = Math.max(0, bx[u[1]] - 1);
      });
      if (result === 'X') stats.w++; else if (result === 'draw') stats.d++; else stats.l++;
      history.push(result === 'X' ? 'w' : result === 'draw' ? 'd' : 'l');
    }
    function finish(res) { over = true; learn(res); }
    function newGame() {
      board = ['', '', '', '', '', '', '', '', '']; used = []; over = false;
      if (menaceMove() < 0) { finish('O'); message = 'MENACE has no beads left for this position, so it resigns.'; }
      else message = 'MENACE (X) has moved. Your turn: tap a square to play O.';
    }
    function play(i) {
      if (over || board[i]) return;
      board[i] = 'O';
      var w = winner(board);
      if (w) { finish(w); message = w === 'draw' ? 'A draw. MENACE adds 1 bead to each move it used.' : 'You win! MENACE takes away the beads it used.'; draw(); return; }
      if (menaceMove() < 0) { finish('O'); message = 'MENACE’s matchbox is empty, so it resigns. You win.'; draw(); return; }
      w = winner(board);
      if (w) { finish(w); message = w === 'X' ? 'MENACE wins and adds 3 beads to each move it used.' : 'A draw. MENACE adds 1 bead to each move it used.'; }
      else message = 'Your turn.';
      draw();
    }
    function train(n) {
      for (var g = 0; g < n; g++) {
        board = ['', '', '', '', '', '', '', '', '']; used = []; var res = null;
        while (!res) {
          if (menaceMove() < 0) { res = 'O'; break; }
          res = winner(board); if (res) break;
          var empty = []; board.forEach(function (v, i) { if (!v) empty.push(i); });
          board[empty[Math.floor(Math.random() * empty.length)]] = 'O';
          res = winner(board);
        }
        learn(res);
      }
      over = true; message = 'Trained against a player who moves at random. Tap "New game" to test it yourself.';
    }

    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row1 = group(controls, 'Play');
    btn('New game', row1, 'fig-button').addEventListener('click', function () { newGame(); draw(); });
    var row2 = group(controls, 'Teach it faster');
    btn('Play 100 games vs random', row2).addEventListener('click', function () { train(100); draw(); });
    btn('Forget everything', row2).addEventListener('click', function () { boxes = {}; history = []; stats = { w: 0, d: 0, l: 0 }; newGame(); draw(); });
    var msg = div('', container); msg.style.cssText = 'font-family:var(--font-sans);font-size:0.9rem;color:var(--ink);margin-top:0.75rem;font-weight:600;min-height:1.4em;';
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start;margin-top:0.5rem;';
    var boardWrap = div('', lay); boardWrap.style.cssText = 'flex:1 1 200px;max-width:260px;margin:0 auto;';
    var boxWrap = div('', lay); boxWrap.style.cssText = 'flex:1 1 150px;max-width:200px;margin:0 auto;font-family:var(--font-sans);font-size:0.82rem;color:var(--ink-muted);';
    var chartWrap = div('', lay); chartWrap.style.cssText = 'flex:2 1 240px;font-family:var(--font-sans);font-size:0.82rem;color:var(--ink-muted);';

    function drawBoard(parent, b, opts) {
      var c = C(), S = opts.size, cell = S / 3;
      var svg = FIG.createSVG(parent, S, S, opts.label);
      el('rect', { x: 0, y: 0, width: S, height: S, rx: 8, fill: opts.bg || c.surface, stroke: c.border }, svg);
      for (var k = 1; k < 3; k++) {
        el('line', { x1: k * cell, y1: 6, x2: k * cell, y2: S - 6, stroke: c.ink2, 'stroke-width': opts.thin ? 1.5 : 3 }, svg);
        el('line', { x1: 6, y1: k * cell, x2: S - 6, y2: k * cell, stroke: c.ink2, 'stroke-width': opts.thin ? 1.5 : 3 }, svg);
      }
      for (var i = 0; i < 9; i++) (function (i) {
        var cx = (i % 3) * cell + cell / 2, cy = Math.floor(i / 3) * cell + cell / 2, v = b[i];
        var g = el('g', opts.onClick ? { style: 'cursor:pointer;', tabindex: 0, role: 'button', 'aria-label': 'Square ' + (i + 1) + (v ? ' ' + v : ' empty') } : {}, svg);
        el('rect', { x: cx - cell / 2, y: cy - cell / 2, width: cell, height: cell, fill: opts.pick === i ? c.accentLight : 'transparent' }, g);
        if (v === 'X') txt(g, cx, cy + cell * 0.18, '✕', { size: cell * 0.55, weight: 700, fill: c.accent });
        else if (v === 'O') txt(g, cx, cy + cell * 0.18, '○', { size: cell * 0.6, weight: 700, fill: c.warn });
        else if (opts.beads) txt(g, cx, cy + 5, opts.beads[i] + ' ●', { size: 13, weight: 600, fill: opts.beads[i] ? c.key : c.faint });
        if (opts.onClick && !v) keyClick(g, function () { opts.onClick(i); });
      })(i);
    }
    function draw() {
      var c = C();
      msg.textContent = message;
      boardWrap.innerHTML = '';
      drawBoard(boardWrap, board, { size: 240, label: 'Noughts and crosses board', onClick: play });
      boxWrap.innerHTML = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.3rem;">MENACE’s last matchbox</div>';
      if (lastBox) {
        drawBoard(boxWrap, lastBox.board, { size: 150, thin: true, label: 'Beads in the matchbox for this position', beads: lastBox.beads, pick: lastBox.pick, bg: c.raised });
        boxWrap.insertAdjacentHTML('beforeend', '<div style="margin-top:0.3rem;line-height:1.4;">Purple numbers are beads for each empty square. It drew a bead at random: more beads, more likely.</div>');
      }
      chartWrap.innerHTML = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.3rem;">Results for MENACE, in blocks of 20 games</div>';
      var blocks = [];
      for (var s = 0; s < history.length; s += 20) blocks.push(history.slice(s, s + 20));
      blocks = blocks.slice(-12);
      var W = 300, H = 150, svg = FIG.createSVG(chartWrap, W, H, 'Bar chart of wins, draws and losses over time');
      var bw = Math.min(30, (W - 20) / Math.max(blocks.length, 6) - 4);
      el('line', { x1: 0, y1: H - 18, x2: W, y2: H - 18, stroke: c.border }, svg);
      if (!blocks.length) txt(svg, W / 2, H / 2, 'Play some games to see results', { size: 12, fill: c.muted });
      blocks.forEach(function (bl, k) {
        var x = 10 + k * (bw + 4), y = H - 18, hh = H - 30;
        [['w', c.tip], ['d', c.faint], ['l', '#dc2626']].forEach(function (p) {
          var n = bl.filter(function (r) { return r === p[0]; }).length, h = hh * n / 20;
          if (h) el('rect', { x: x, y: y - h, width: bw, height: h, fill: p[1] }, svg);
          y -= h;
        });
      });
      txt(svg, 4, H - 4, 'older', { anchor: 'start', size: 11, fill: c.muted });
      txt(svg, W - 4, H - 4, 'newer', { anchor: 'end', size: 11, fill: c.muted });
      chartWrap.insertAdjacentHTML('beforeend', '<div style="margin-top:0.25rem;"><span style="color:var(--callout-tip);font-weight:700;">■</span> wins ' + stats.w +
        ' &nbsp; <span style="color:var(--ink-faint);font-weight:700;">■</span> draws ' + stats.d + ' &nbsp; <span style="color:#dc2626;font-weight:700;">■</span> losses ' + stats.l + '</div>');
    }
    newGame();
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. A perceptron
     ----------------------------------------------------------------------- */
  var PRESETS = {
    easy: [[-0.6, 0.5, 1], [-0.3, 0.7, 1], [-0.7, -0.1, 1], [-0.2, 0.2, 1], [0.5, -0.4, -1], [0.3, -0.7, -1], [0.7, 0.1, -1], [0.2, -0.2, -1]],
    harder: [[-0.5, 0.3, 1], [-0.1, 0.6, 1], [0.2, 0.75, 1], [-0.8, -0.3, 1], [0.05, 0.25, 1], [0.6, 0.55, 1], [0.0, -0.2, -1], [0.4, 0.2, -1], [0.7, -0.3, -1], [-0.4, -0.7, -1], [0.3, -0.75, -1], [-0.25, -0.35, -1]],
    xor: [[-0.6, 0.6, 1], [0.6, -0.6, 1], [-0.5, 0.4, 1], [0.5, -0.4, 1], [0.6, 0.6, -1], [-0.6, -0.6, -1], [0.45, 0.5, -1], [-0.45, -0.5, -1]]
  };
  FIG['fig-perceptron'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var pts = PRESETS.easy.map(function (p) { return p.slice(); }), wv = [0.1, 0.3, 0.9], addCls = 1, steps = 0, hl = -1, cursor = 0, timer = null, note = '';
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var rowL = group(controls, 'Learn');
    var oneB = btn('Fix one mistake', rowL, 'fig-button'), allB = btn('Keep learning', rowL), resetB = btn('Reset line', rowL);
    var rowA = group(controls, 'Tap the square to add');
    var blueB = btn('● Blue dot', rowA), orangeB = btn('▲ Orange triangle', rowA);
    blueB.addEventListener('click', function () { addCls = 1; draw(); });
    orangeB.addEventListener('click', function () { addCls = -1; draw(); });
    var rowP = group(controls, 'Examples');
    [['Easy', 'easy'], ['Harder', 'harder'], ['XOR pattern', 'xor'], ['Clear', null]].forEach(function (p) {
      btn(p[0], rowP).addEventListener('click', function () { stop(); pts = p[1] ? PRESETS[p[1]].map(function (q) { return q.slice(); }) : []; steps = 0; hl = -1; note = ''; draw(); });
    });
    var lay = div('', container); lay.style.cssText = 'display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-top:0.75rem;';
    var svgWrap = div('', lay); svgWrap.style.cssText = 'flex:1 1 260px;max-width:360px;margin:0 auto;';
    var side = div('', lay); side.style.cssText = 'flex:1 1 220px;font-family:var(--font-sans);font-size:0.88rem;line-height:1.5;color:var(--ink-secondary);';

    function score(p) { return wv[0] + wv[1] * p[0] + wv[2] * p[1]; }
    function wrong() { return pts.filter(function (p) { return (score(p) >= 0 ? 1 : -1) !== p[2]; }).length; }
    function learnOne() {
      if (!pts.length) return false;
      for (var k = 0; k < pts.length; k++) {
        var i = (cursor + k) % pts.length, p = pts[i];
        if ((score(p) >= 0 ? 1 : -1) !== p[2]) {
          // Rosenblatt's rule: nudge the weights towards the right answer for this point
          var r = 0.25;
          wv[0] += r * p[2]; wv[1] += r * p[2] * p[0]; wv[2] += r * p[2] * p[1];
          hl = i; cursor = i + 1; steps++;
          return true;
        }
      }
      hl = -1; return false;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; allB.textContent = 'Keep learning'; } }
    function draw() {
      var c = C();
      blueB.classList.toggle('active', addCls === 1); orangeB.classList.toggle('active', addCls === -1);
      svgWrap.innerHTML = '';
      var S = 340, m = function (v) { return (v + 1) / 2 * S; };
      var svg = FIG.createSVG(svgWrap, S, S, 'Points of two kinds and the dividing line the perceptron has learned');
      var bg = el('rect', { x: 0, y: 0, width: S, height: S, rx: 6, fill: c.surface, stroke: c.border, style: 'cursor:crosshair;' }, svg);
      // Shade the two sides of the line
      // Clip the square to each side of the line (Sutherland–Hodgman) and tint it
      [[1, '#3b82f6'], [-1, '#f59e0b']].forEach(function (side) {
        var poly = [[-1, -1], [1, -1], [1, 1], [-1, 1]], out = [];
        var f = function (q) { return side[0] * score(q); };
        for (var i = 0; i < 4; i++) {
          var P = poly[i], Q = poly[(i + 1) % 4], fp = f(P), fq = f(Q);
          if (fp >= 0) out.push(P);
          if ((fp >= 0) !== (fq >= 0)) { var t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
        }
        if (out.length > 2) el('polygon', { points: out.map(function (q) { return m(q[0]) + ',' + (S - m(q[1])); }).join(' '), fill: side[1], opacity: 0.1, 'pointer-events': 'none' }, svg);
      });
      // Line w0 + w1 x + w2 y = 0, clipped to the square
      var seg = [];
      [[-1, null], [1, null], [null, -1], [null, 1]].forEach(function (e) {
        var X, Y;
        if (e[0] !== null) { if (Math.abs(wv[2]) < 1e-9) return; X = e[0]; Y = -(wv[0] + wv[1] * X) / wv[2]; }
        else { if (Math.abs(wv[1]) < 1e-9) return; Y = e[1]; X = -(wv[0] + wv[2] * Y) / wv[1]; }
        if (X >= -1.0001 && X <= 1.0001 && Y >= -1.0001 && Y <= 1.0001) seg.push([X, Y]);
      });
      if (seg.length >= 2) el('line', { x1: m(seg[0][0]), y1: S - m(seg[0][1]), x2: m(seg[1][0]), y2: S - m(seg[1][1]), stroke: c.ink, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
      pts.forEach(function (p, i) {
        var X = m(p[0]), Y = S - m(p[1]), ok = (score(p) >= 0 ? 1 : -1) === p[2];
        if (i === hl) el('circle', { cx: X, cy: Y, r: 15, fill: 'none', stroke: c.key, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
        if (p[2] === 1) el('circle', { cx: X, cy: Y, r: 7, fill: '#2563eb', stroke: ok ? '#fff' : '#dc2626', 'stroke-width': ok ? 1.5 : 3, 'pointer-events': 'none' }, svg);
        else el('path', { d: 'M' + X + ' ' + (Y - 8) + ' L' + (X + 7.5) + ' ' + (Y + 6) + ' L' + (X - 7.5) + ' ' + (Y + 6) + 'Z', fill: '#d97706', stroke: ok ? '#fff' : '#dc2626', 'stroke-width': ok ? 1.5 : 3, 'pointer-events': 'none' }, svg);
      });
      bg.addEventListener('click', function (e) {
        var r = svg.getBoundingClientRect();
        var X = (e.clientX - r.left) / r.width * 2 - 1, Y = 1 - (e.clientY - r.top) / r.height * 2;
        pts.push([X, Y, addCls]); hl = -1; note = ''; draw();
      });
      var nw = wrong();
      side.innerHTML = '<div style="font-weight:700;color:var(--ink);margin-bottom:0.3rem;">' + (nw ? nw + ' point' + (nw > 1 ? 's' : '') + ' on the wrong side' : (pts.length ? 'Every point is on the right side!' : 'Add some points')) + '</div>' +
        '<div>Learning steps so far: <strong>' + steps + '</strong></div>' +
        '<div style="font-family:var(--font-mono);font-size:0.82rem;margin-top:0.3rem;">weights: ' + wv[1].toFixed(2) + ', ' + wv[2].toFixed(2) + ' &nbsp;bias: ' + wv[0].toFixed(2) + '</div>' +
        '<div style="margin-top:0.5rem;color:var(--ink-muted);">Points circled in red are misclassified. Each step picks one, circles it in purple and nudges the line towards getting it right.</div>' +
        (note ? '<div style="margin-top:0.5rem;color:var(--callout-warn);font-weight:600;">' + note + '</div>' : '');
    }
    oneB.addEventListener('click', function () { stop(); learnOne(); draw(); });
    allB.addEventListener('click', function () {
      if (timer) { stop(); return; }
      var count = 0;
      allB.textContent = 'Stop';
      timer = setInterval(function () {
        var changed = learnOne(); count++;
        if (!changed) { stop(); note = ''; }
        else if (count >= 150) { stop(); note = 'Still mistakes after 150 steps. If the two kinds can’t be split by a straight line (try the XOR pattern), the perceptron never settles.'; }
        draw();
      }, 120);
    });
    resetB.addEventListener('click', function () { stop(); wv = [0.1, 0.3, 0.9]; steps = 0; hl = -1; note = ''; draw(); });
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      {
        question: 'What was special about the Manchester "Baby" of 21 June 1948?',
        options: ['It was the first machine to play chess', 'It was the first electronic computer to run a program stored in its own memory', 'It broke the Enigma code', 'It was the first computer sold to the public'],
        answer: 1,
        explanation: 'Earlier machines such as Colossus and ENIAC were set up with switches and cables. The Baby kept its program in memory, like every computer since.'
      },
      {
        question: 'What did McCulloch and Pitts show in 1943?',
        options: ['That the brain is made of silicon', 'That simplified on/off model neurons, wired together, can carry out logic', 'How to build a transistor', 'That neurons never change'],
        answer: 1,
        explanation: 'Their model neuron adds up its inputs and "fires" if the total reaches a threshold. Networks of them can compute AND, OR, NOT and more.'
      },
      {
        question: 'How did Grey Walter’s robot tortoises find a light?',
        options: ['With a camera and a map', 'With a few simple rules linking a light sensor to the steering', 'By following a painted line', 'A person steered them by radio'],
        answer: 1,
        explanation: 'Very simple wiring produced behaviour that looked purposeful, a key idea of cybernetics.'
      },
      {
        question: 'In Turing’s imitation game, what does the judge try to do?',
        options: ['Beat the machine at chess', 'Work out, by typed conversation alone, which hidden player is the machine', 'Measure how fast the machine calculates', 'Look inside the machine'],
        answer: 1,
        explanation: 'Turing replaced the vague question "Can machines think?" with a test of behaviour: can it hold a conversation well enough to pass for a person?'
      },
      {
        question: 'What was "Lady Lovelace’s objection", and how did Turing reply?',
        options: ['That computers are too slow; he said they would get faster', 'That a machine can only do what it is told; he said machines can surprise us, and could be made to learn', 'That machines cannot do sums; he built one that could', 'That machines would take jobs; he agreed'],
        answer: 1,
        explanation: 'Turing pointed out that machines often surprised him, and suggested building a "child machine" that could be taught.'
      },
      {
        question: 'How did Arthur Samuel’s draughts program improve?',
        options: ['Samuel rewrote it every night', 'It learned from experience, including playing against itself, adjusting how it scored positions', 'It copied a champion’s moves', 'It became faster each year'],
        answer: 1,
        explanation: 'Samuel’s 1959 paper on the program helped popularise the term "machine learning".'
      },
      {
        question: 'How did Donald Michie’s MENACE learn noughts and crosses?',
        options: ['By reading a rule book', 'By adding beads to matchboxes for moves that led to wins and removing them for moves that led to losses', 'By watching people play', 'By trying every possible game in advance'],
        answer: 1,
        explanation: 'Moves with more beads were more likely to be picked again: learning by reward and punishment, with no electronics at all.'
      },
      {
        question: 'What happened at Dartmouth College in the summer of 1956?',
        options: ['The first computer was built', 'A workshop that gave artificial intelligence its name and brought its founders together', 'Turing proposed his test', 'The perceptron was invented'],
        answer: 1,
        explanation: 'The name had been coined in the 1955 proposal for the workshop by McCarthy, Minsky, Rochester and Shannon.'
      },
      {
        question: 'What did the Logic Theorist do?',
        options: ['It translated Russian', 'It proved theorems from Whitehead and Russell’s Principia Mathematica by searching for proofs with rules of thumb', 'It played draughts', 'It recognised faces'],
        answer: 1,
        explanation: 'It proved 38 of the first 52 theorems in chapter 2, and found one proof shorter than the book’s.'
      },
      {
        question: 'What could Rosenblatt’s perceptron learn?',
        options: ['Any pattern at all', 'To split examples into two groups, if a straight line (or flat cut) can separate them', 'To hold a conversation', 'To walk and talk, as the newspapers claimed'],
        answer: 1,
        explanation: 'It adjusts its weights after each mistake. If no straight line separates the two kinds (as in XOR), a single perceptron can never get them all right, which matters a lot in Part 3.'
      }
    ]);
  };
})();
