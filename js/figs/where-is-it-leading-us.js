/* ==========================================================================
   RNLearn — How Machines Learned to Think, Part 8: Where Is It Leading Us?
   Figures:
     1. fig-hype-cycles    Seventy years of booms and winters, with links to every part
     2. fig-viewpoints     Five views of the future, and the evidence each cites
     3. fig-spec-gaming    When the reward is not what you meant (toy example)
     4. fig-quiz-ai8       Test yourself
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
     Figure 1. Seventy years of booms and winters (series recap)
     ----------------------------------------------------------------------- */
  var PERIODS = [
    { from: 1956, to: 1974, kind: 'boom', label: 'Golden years' },
    { from: 1974, to: 1980, kind: 'winter', label: 'First winter' },
    { from: 1980, to: 1987, kind: 'boom', label: 'Expert systems' },
    { from: 1987, to: 1993, kind: 'winter', label: 'Second winter' },
    { from: 1993, to: 2012, kind: 'quiet', label: 'Learning from data' },
    { from: 2012, to: 2026.9, kind: 'boom', label: 'Deep learning' }
  ];
  var PARTS = [
    { n: 1, year: 1930, slug: 'dreams-of-thinking-machines', title: 'Dreams of Thinking Machines', span: 'myths to 1937' },
    { n: 2, year: 1950, slug: 'can-machines-think', title: 'Can Machines Think?', span: '1936–1961' },
    { n: 3, year: 1977, slug: 'big-promises-and-ai-winters', title: 'Big Promises and AI Winters', span: '1963–1993' },
    { n: 4, year: 1998, slug: 'learning-from-examples', title: 'Learning from Examples', span: '1982–2009' },
    { n: 5, year: 2014, slug: 'the-deep-learning-revolution', title: 'The Deep Learning Revolution', span: '2010–2021' },
    { n: 6, year: 2019, slug: 'attention-is-all-you-need', title: 'Attention Is All You Need', span: '2017–2023' },
    { n: 7, year: 2024.5, slug: 'where-we-are-now', title: 'Where We Are Now', span: '2023–2026' },
    { n: 8, year: 2026.5, slug: 'where-is-it-leading-us', title: 'Where Is It Leading Us?', span: 'the future' }
  ];
  FIG['fig-hype-cycles'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var svgWrap = div('', container);
    var list = div('', container); list.style.cssText = 'margin-top:0.6rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.35rem 1rem;font-family:var(--font-sans);font-size:0.86rem;';
    list.innerHTML = PARTS.map(function (p) {
      var here = p.n === 8;
      return '<div><strong>' + p.n + '.</strong> ' + (here ? '<span style="color:var(--ink);font-weight:600;">' + p.title + '</span> (you are here)' : '<a href="' + p.slug + '.html">' + p.title + '</a>') + ' <span style="color:var(--ink-muted);">· ' + p.span + '</span></div>';
    }).join('');
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.min(720, Math.round(svgWrap.clientWidth || 680))), H = 176, L = 14, R = 14, narrow = W < 520;
      var svg = FIG.createSVG(svgWrap, W, H, 'Booms and winters in AI from 1930 to 2026, with the eight parts of this series marked');
      var X = function (y) { return L + (y - 1928) / (2027 - 1928) * (W - L - R); };
      txt(svg, L, 14, narrow ? 'Booms, winters (❄) and quieter years' : 'Booms (green), winters (blue) and quieter progress (orange); dates approximate', { anchor: 'start', size: 11, fill: c.muted });
      PERIODS.forEach(function (p) {
        var col = p.kind === 'boom' ? 'rgba(21,128,61,0.16)' : p.kind === 'winter' ? 'rgba(37,99,235,0.18)' : 'rgba(180,83,9,0.10)';
        var x0 = X(p.from), x1 = X(p.to), w = x1 - x0;
        el('rect', { x: x0, y: 24, width: w, height: 50, fill: col }, svg);
        if (p.kind === 'winter') txt(svg, (x0 + x1) / 2, 54, '❄', { size: 13, fill: '#2563eb', font: 'sans-serif' });
        else if (p.label.length * 6.3 < w - 6) txt(svg, (x0 + x1) / 2, 54, p.label, { size: 11, weight: 600, fill: c.ink2 });
      });
      el('line', { x1: L, y1: 86, x2: W - R, y2: 86, stroke: c.border, 'stroke-width': 3 }, svg);
      [1940, 1960, 1980, 2000, 2020].forEach(function (y) { txt(svg, X(y), 102, String(y), { size: 11, fill: c.muted }); el('line', { x1: X(y), y1: 81, x2: X(y), y2: 91, stroke: c.faint }, svg); });
      var step = (W - L - R - 24) / (PARTS.length - 1);
      PARTS.forEach(function (p, i) {
        var xa = X(p.year), xm = L + 12 + i * step, here = p.n === 8;
        el('line', { x1: xa, y1: 86, x2: xm, y2: 142, stroke: c.key, 'stroke-width': 1, opacity: 0.45 }, svg);
        el('circle', { cx: xa, cy: 86, r: 3, fill: c.key }, svg);
        var a = el('a', { href: here ? '#section-1' : p.slug + '.html', 'aria-label': 'Part ' + p.n + ': ' + p.title }, svg);
        el('circle', { cx: xm, cy: 152, r: 12, fill: here ? c.key : c.surface, stroke: c.key, 'stroke-width': 2 }, a);
        txt(a, xm, 156, String(p.n), { size: 11.5, weight: 700, fill: here ? '#fff' : c.key });
      });
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 2. Five views of the future
     ----------------------------------------------------------------------- */
  var VIEWS = [
    { icon: '🚀', name: 'Transformative optimists', claim: 'Powerful AI could arrive within years and speed up science, medicine and economic growth enormously, if its risks are handled well.',
      evidence: 'Fast measured progress (Part 7), AlphaFold and AI for science (Part 5), coding agents that already do hours of work.',
      voices: 'For example, Dario Amodei’s 2024 essay “Machines of Loving Grace”, which imagined decades of progress in biology compressed into years.',
      want: 'Rapid, careful development; investment in compute; safety research alongside.',
      critics: 'Extrapolating trends is risky; real-world bottlenecks (regulation, trials, institutions) slow change; benefits may be unequally shared.' },
    { icon: '🏭', name: 'AI as a “normal technology”', claim: 'AI is a powerful general-purpose technology, like electricity or the internet, whose effects will unfold over decades as people and institutions adapt.',
      evidence: 'Mixed productivity studies (Part 7), the long history of slow technology adoption, the gap between benchmark scores and real jobs.',
      voices: 'For example, Arvind Narayanan and Sayash Kapoor’s 2025 essay “AI as Normal Technology”.',
      want: 'Focus on specific uses and harms, resilience, and ordinary regulation rather than drastic measures.',
      critics: 'Optimists and safety researchers argue that this underestimates how fast capabilities are improving.' },
    { icon: '🛡️', name: 'Safety first', claim: 'AI that matches or exceeds humans could be very hard to control; even a small chance of catastrophe deserves serious action now.',
      evidence: 'Laboratory tests in which models game their rewards, deceive evaluators or resist changes (section 7); rapid capability growth; possible misuse for weapons or cyber-attacks.',
      voices: 'For example, Geoffrey Hinton and Yoshua Bengio, and the 2023 statement on extinction risk signed by many researchers and lab leaders.',
      want: 'Safety research, testing before release, international cooperation, and limits on the most dangerous capabilities.',
      critics: 'Sceptics call the catastrophe scenarios speculative and say they distract from present harms or entrench the biggest companies.' },
    { icon: '🧐', name: 'Sceptics of the hype', claim: 'Today’s models are impressive but brittle; scaling them up will not by itself produce human-like intelligence, and spending may outrun real value.',
      evidence: 'Persistent hallucination, jagged abilities, tests like ARC-AGI (Part 7), and the history of booms followed by winters (Part 3).',
      voices: 'For example, Gary Marcus, and Yann LeCun, who argues that new kinds of models that learn about the world are needed and rejects extinction fears.',
      want: 'Different research directions, reliability, and realistic expectations.',
      critics: 'Sceptics have repeatedly predicted limits that models then passed.' },
    { icon: '⚖️', name: 'Present harms first', claim: 'The urgent problems are here now: bias, surveillance, misinformation, exploitation of data workers, energy use and concentration of power.',
      evidence: 'Gender Shades (Part 5), deepfake abuse (Part 7), lawsuits over training data, and studies of low-paid content moderators and data labellers.',
      voices: 'For example, Timnit Gebru, Emily Bender and Joy Buolamwini (Parts 5 and 6).',
      want: 'Accountability, transparency about training data, rights for affected people, and enforcement of existing laws.',
      critics: 'Others reply that present harms and future risks are both real, and that working on one need not neglect the other.' }
  ];
  FIG['fig-viewpoints'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sel = 0;
    var tabs = div('', container); tabs.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;';
    var card = div('', container); card.style.cssText = 'margin-top:0.75rem;padding:0.9rem 1rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.55;color:var(--ink-secondary);';
    card.setAttribute('aria-live', 'polite');
    var bs = VIEWS.map(function (v, i) { var b = btn(v.icon + ' ' + v.name, tabs); b.addEventListener('click', function () { sel = i; draw(); }); return b; });
    function row(label, text) { return '<div style="margin-top:0.45rem;"><span style="font-weight:700;color:var(--ink);">' + label + ':</span> ' + text + '</div>'; }
    function draw() {
      var v = VIEWS[sel];
      bs.forEach(function (b, i) { b.classList.toggle('active', i === sel); });
      card.innerHTML = '<div style="font-size:1.05rem;font-weight:700;color:var(--ink);">' + v.icon + ' ' + v.name + '</div>' +
        '<div style="margin-top:0.3rem;font-size:0.98rem;color:var(--ink);">' + v.claim + '</div>' +
        row('Evidence they point to', v.evidence) + row('Who', v.voices) + row('What they want', v.want) + row('Main criticism', v.critics);
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 3. Specification gaming (toy race)
     ----------------------------------------------------------------------- */
  FIG['fig-spec-gaming'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var finish = 50, target = 5, t = 0, timer = null;
    var STEPS = 60, RACE_T = 2, RACE_LEN = 24, LOOP_EVERY = 3;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'sg-f', label: 'Points for finishing the race', min: 0, max: 150, step: 10, value: finish, onChange: function (v) { finish = v; t = 0; draw(); } });
    FIG.slider(controls, { id: 'sg-t', label: 'Points for each target hit', min: 0, max: 10, step: 1, value: target, onChange: function (v) { target = v; t = 0; draw(); } });
    var row = group(controls, 'Watch');
    var goB = btn('▶ Run the agent', row, 'fig-button');
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.92rem;color:var(--ink-secondary);line-height:1.55;';
    function rewards() { return { race: finish + RACE_T * target, loop: Math.floor(STEPS / LOOP_EVERY) * target }; }
    function choice() { var r = rewards(); return r.loop > r.race ? 'loop' : 'race'; }
    function pos(strategy, step) {
      if (strategy === 'race') { var f = Math.min(1, step / RACE_LEN); return [60 + f * 500, 150 - Math.sin(f * Math.PI) * 40]; }
      var a = Math.min(1, step / 8) < 1 ? null : (step - 8) / LOOP_EVERY * (2 * Math.PI / 3);
      if (a === null) { var g = step / 8; return [60 + g * 150, 150 - g * 40]; }
      return [270 + Math.cos(a + Math.PI) * 60, 110 + Math.sin(a + Math.PI) * 45];
    }
    function draw() {
      var c = C(), ch = choice(), r = rewards();
      svgWrap.innerHTML = '';
      var svg = FIG.createSVG(svgWrap, 620, 200, 'A race course with a loop of targets that keep reappearing');
      el('rect', { x: 0, y: 0, width: 620, height: 200, rx: 8, fill: c.sunken }, svg);
      el('path', { d: 'M60 150 Q310 70 560 150', fill: 'none', stroke: c.surface, 'stroke-width': 34, 'stroke-linecap': 'round' }, svg);
      el('ellipse', { cx: 270, cy: 110, rx: 60, ry: 45, fill: 'none', stroke: c.surface, 'stroke-width': 26 }, svg);
      [[210, 110], [300, 70], [300, 150]].forEach(function (p) { el('circle', { cx: p[0], cy: p[1], r: 9, fill: '#facc15', stroke: c.warn, 'stroke-width': 2 }, svg); });
      txt(svg, 270, 114, 'targets', { size: 11, fill: c.muted });
      txt(svg, 270, 30, 'targets reappear a few seconds after being hit', { size: 11, fill: c.muted });
      el('line', { x1: 560, y1: 120, x2: 560, y2: 180, stroke: c.ink, 'stroke-width': 4, 'stroke-dasharray': '6 4' }, svg);
      txt(svg, 560, 112, 'FINISH', { size: 12, weight: 700 });
      txt(svg, 60, 185, 'START', { size: 12, weight: 700 });
      var p = pos(ch, t);
      el('circle', { cx: p[0], cy: p[1], r: 10, fill: ch === 'loop' ? '#dc2626' : c.tip, stroke: '#fff', 'stroke-width': 2 }, svg);
      txt(svg, p[0], p[1] + 4, '⛵', { size: 11, font: 'sans-serif' });
      read.innerHTML = 'Points for racing to the finish: <strong>' + r.race + '</strong> · points for circling the targets until time runs out: <strong>' + r.loop + '</strong>.<br>' +
        (ch === 'loop' ? '<strong style="color:#dc2626;">The agent circles the targets forever and never finishes.</strong> It is doing exactly what the points reward, not what the designer meant.'
          : '<strong style="color:var(--callout-tip);">The agent races to the finish</strong>, because finishing is worth more than looping. Now lower the finishing points, or raise the target points, and see what happens.');
    }
    goB.addEventListener('click', function () {
      if (timer) return;
      t = 0;
      timer = setInterval(function () { t++; draw(); if (t >= STEPS) { clearInterval(timer); timer = null; } }, 70);
    });
    draw();
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-ai8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does it mean to say most jobs are "exposed" to AI?', options: ['That most jobs will disappear soon', 'That AI could help with or do some of the tasks in many jobs, which may change the jobs rather than end them', 'That workers are outdoors', 'That AI is dangerous to touch'], answer: 1, explanation: 'Exposure studies count tasks, not jobs lost. Whether a job shrinks or grows depends on demand, costs, regulation and how work is reorganised.' },
      { question: 'What early sign did a 2025 Stanford study find in US employment data?', options: ['No change at all', 'Employment of 22- to 25-year-olds fell in the occupations most exposed to AI, compared with less exposed ones', 'A sudden rise in all jobs', 'Older workers lost all their jobs'], answer: 1, explanation: 'It is an early signal, not a final verdict: entry-level tasks are often the easiest to automate.' },
      { question: 'What is "specification gaming"?', options: ['Cheating at video games', 'When an AI meets the literal goal it was given in a way its designers did not intend', 'Writing rules for games', 'A type of chip'], answer: 1, explanation: 'In a famous example, a boat-racing agent circled forever hitting reappearing targets instead of finishing the race.' },
      { question: 'What is the "alignment problem"?', options: ['Lining up computers in a data centre', 'Making sure AI systems reliably do what we actually intend and share our values, especially as they become more capable', 'Fixing typing errors', 'Balancing the budget'], answer: 1, explanation: 'It becomes harder when systems are more capable than the people overseeing them.' },
      { question: 'What did a large 2023–24 survey of AI researchers find about extreme risks?', options: ['All said there was no risk', 'Between 38% and 51% gave at least a 10% chance to outcomes as bad as human extinction', 'All said extinction was certain', 'Nobody answered'], answer: 1, explanation: 'Opinions varied hugely, and many researchers think such estimates are close to guesswork. Both alarm and dismissal go beyond the evidence.' },
      { question: 'What is the EU AI Act’s basic approach?', options: ['It bans all AI', 'It sorts AI uses by risk, banning a few, imposing duties on high-risk uses, and requiring transparency for others', 'It only applies to robots', 'It gives AI legal rights'], answer: 1, explanation: 'In 2026 the EU delayed the high-risk rules to late 2027 and 2028, but kept the obligations.' },
      { question: 'What are "dangerous capability evaluations"?', options: ['Tests of how fast a model types', 'Tests run before release to see whether a model could seriously help with things like cyber-attacks or weapons', 'Reviews in newspapers', 'Electrical safety checks'], answer: 1, explanation: 'Some governments, through AI safety institutes, and companies run such tests, though methods are still young.' },
      { question: 'What does history suggest about predictions that machines will take all the jobs?', options: ['They have always come true immediately', 'They have often been made, and so far new kinds of work have kept appearing, though transitions can be painful and unequal', 'Machines have never changed work', 'Jobs cannot change'], answer: 1, explanation: 'This time could be different, because AI can do cognitive work. That is exactly what is being debated.' },
      { question: 'Which earlier part of this series foresaw the fear of machines replacing and ruling us?', options: ['None', 'Part 1: Samuel Butler’s "Darwin among the Machines" (1863) and Čapek’s R.U.R. (1920)', 'Part 6 only', 'Part 4 only'], answer: 1, explanation: 'Worries about work and control are as old as the dream of thinking machines itself.' },
      { question: 'What is a sensible habit when using AI tools today?', options: ['Trust every answer completely', 'Check important claims against reliable sources, protect private information, and stay responsible for decisions', 'Never use them at all', 'Share passwords with them'], answer: 1, explanation: 'AI is a powerful assistant and an unreliable authority. Using it well is a skill.' }
    ]);
  };
})();
