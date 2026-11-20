/* ==========================================================================
   RNLearn — Socrates, Plato and Aristotle (Minds That Changed How We Know, Part 1)
   Figures:
     1. fig-athens-timeline  The story at a glance (clickable timeline)
     2. fig-elenchus         A Socratic dialogue: what is knowledge?
     3. fig-doubling         Doubling the square (Meno)
     4. fig-solids           The five Platonic solids
     5. fig-syllogism        Testing syllogisms
     6. fig-falling          Do heavier things fall faster?
     7. fig-quiz-m1          Test yourself
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
    { name: 'Socrates', color: '#b45309' },
    { name: 'Plato', color: '#1d4ed8' },
    { name: 'Aristotle', color: '#15803d' }
  ];
  var EVENTS = [
    { year: '469 BCE', icon: '🏛️', era: 0, sec: 3, title: 'Socrates is born', text: 'Socrates is born in Athens, around 470/469 BCE, the son of a stonemason and a midwife.' },
    { year: '427 BCE', icon: '📜', era: 1, sec: 6, title: 'Plato is born', text: 'Plato is born into a wealthy, aristocratic Athenian family, around 428/427 BCE.' },
    { year: '423 BCE', icon: '🎭', era: 0, sec: 3, title: 'Mocked on stage', text: 'Aristophanes’ comedy <em>Clouds</em> portrays Socrates as a fraud who studies the sky and teaches clever arguments.' },
    { year: '399 BCE', icon: '⚖️', era: 0, sec: 5, title: 'Trial and death', text: 'Socrates is tried for impiety and corrupting the young, found guilty and executed by drinking hemlock.' },
    { year: '387 BCE', icon: '🏫', era: 1, sec: 6, title: 'The Academy', text: 'Plato founds a school in a grove outside Athens sacred to the hero Academus: the Academy.' },
    { year: '384 BCE', icon: '👶', era: 2, sec: 9, title: 'Aristotle is born', text: 'Aristotle is born in Stagira in northern Greece, the son of a physician to the Macedonian court.' },
    { year: '367 BCE', icon: '🎓', era: 2, sec: 9, title: 'A student at the Academy', text: 'Aged about seventeen, Aristotle joins Plato’s Academy, where he stays for some twenty years.' },
    { year: '347 BCE', icon: '🐙', era: 2, sec: 11, title: 'To Lesbos', text: 'After Plato dies, Aristotle leaves Athens; on the island of Lesbos he studies the animals of a great lagoon.' },
    { year: '343 BCE', icon: '👑', era: 2, sec: 9, title: 'Tutor to a prince', text: 'Philip II of Macedon invites Aristotle to teach his son, the future Alexander the Great.' },
    { year: '335 BCE', icon: '🚶', era: 2, sec: 9, title: 'The Lyceum', text: 'Aristotle returns to Athens and founds his own school, the Lyceum, where he teaches while walking.' },
    { year: '322 BCE', icon: '🕯️', era: 2, sec: 13, title: 'Aristotle dies', text: 'After Alexander’s death, Aristotle leaves Athens for Chalcis, where he dies the following year.' }
  ];

  FIG['fig-athens-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 469 BCE to 322 BCE');
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

  /* -----------------------------------------------------------------------
     Shared helpers
     ----------------------------------------------------------------------- */
  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  var NOTE = '<br><span style="font-size:0.86rem;color:var(--ink-muted);">';
  var BLUE = '#2563eb', RED = '#dc2626', GREEN = '#16a34a', AMBER = '#d97706', PURPLE = '#7c3aed';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) { var b = btn(it, row); bs.push(b); b.addEventListener('click', function () { set(i); onPick(i); }); });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    set(initial);
    return row;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sdv(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; }
  function quantile(sorted, q) { var h = (sorted.length - 1) * q, i = Math.floor(h); return i + 1 < sorted.length ? sorted[i] + (h - i) * (sorted[i + 1] - sorted[i]) : sorted[i]; }
  function newSVG(svgWrap, container, H, label) { svgWrap.innerHTML = ''; var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); return { W: W, svg: FIG.createSVG(svgWrap, W, H, label), fs: scaler(svgWrap, 360) }; }

  /* Distribution functions: log-gamma, regularised incomplete beta, t and normal */
  function lgamma(x) {
    var g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); var s = 1.000000000190015;
    for (var j = 0; j < 6; j++) s += g[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      var del = d * c; h *= del; if (Math.abs(del - 1) < 3e-14) break;
    }
    return h;
  }
  function betainc(a, b, x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tcdf(t, df) { var p = 0.5 * betainc(df / 2, 0.5, df / (df + t * t)); return t > 0 ? 1 - p : p; }
  function tpdf(t, df) { return Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + t * t / df)); }
  function tinv(p, df) { var lo = -60, hi = 60; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (tcdf(m, df) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function ncdf(z) { return 0.5 * erfc(-z / Math.SQRT2); }
  function erfc(x) { var t = 1 / (1 + 0.5 * Math.abs(x)), r = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
  function npdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function ninv(p) { var lo = -10, hi = 10; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (ncdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  /* Binomial: P(X <= k) = I_{1-p}(n-k, k+1) */
  function binomCdf(k, n, p) { if (k < 0) return 0; if (k >= n) return 1; return betainc(n - k, k + 1, 1 - p); }
  function propIntervals(x, n, conf) {
    var z = ninv(1 - (1 - conf) / 2), ph = x / n, a = (1 - conf) / 2;
    var w = z * Math.sqrt(ph * (1 - ph) / n);
    var den = 1 + z * z / n, cen = (ph + z * z / (2 * n)) / den, hw = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / den;
    var lo = 0, hi = 1, i, m, cpL = 0, cpU = 1;
    if (x > 0) { lo = 0; hi = 1; for (i = 0; i < 50; i++) { m = (lo + hi) / 2; if (1 - binomCdf(x - 1, n, m) < a) lo = m; else hi = m; } cpL = (lo + hi) / 2; }
    if (x < n) { lo = 0; hi = 1; for (i = 0; i < 50; i++) { m = (lo + hi) / 2; if (binomCdf(x, n, m) > a) lo = m; else hi = m; } cpU = (lo + hi) / 2; }
    return { wald: [Math.max(0, ph - w), Math.min(1, ph + w)], wilson: [Math.max(0, cen - hw), Math.min(1, cen + hw)], cp: [cpL, cpU] };
  }
  function pct(x, d) { return fmt(100 * x, d === undefined ? 1 : d) + '%'; }
  function axisX(svg, c, fs, L, R, y, lo, hi, ticks, label, f) {
    el('line', { x1: L, y1: y, x2: R, y2: y, stroke: c.border }, svg);
    ticks.forEach(function (t) { var x = L + (t - lo) / (hi - lo) * (R - L); el('line', { x1: x, y1: y, x2: x, y2: y + 4, stroke: c.border }, svg); txt(svg, x, y + 16, f ? f(t) : String(t), { size: fs(10), fill: c.muted }); });
    if (label) txt(svg, (L + R) / 2, y + 32, label, { size: fs(10), fill: c.muted });
  }


  /* -----------------------------------------------------------------------
     Figure 2. A Socratic dialogue: what is knowledge?
     ----------------------------------------------------------------------- */
  FIG['fig-elenchus'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NODES = {
      start: { q: 'Tell me, my friend: what is knowledge?', opts: [['Knowledge is what we perceive with our senses.', 'perc'], ['Knowledge is believing what is true.', 'tb'], ['Knowledge is believing what is true, when you can give a reason for it.', 'jtb']] },
      perc: { s: 'Then is a straight oar, which looks bent where it enters the water, really bent? And when you dream you are flying, do you know that you fly? Perception differs from person to person and from moment to moment, yet knowledge, surely, cannot be both true and false.', q: 'So perception alone cannot be knowledge. What else might it be?', opts: [['Then it is believing what is true.', 'tb'], ['Then it is true belief with a reason.', 'jtb']] },
      tb: { s: 'Suppose a skilful speaker persuades a jury that a man is guilty, and he is in fact guilty. But none of the jurors saw the crime; they believe it only because they were persuaded. Do they know it, or did they merely believe rightly by luck?', q: 'True belief can come by luck. What must be added?', opts: [['A reason, or an account, that explains why it is true.', 'jtb'], ['Nothing: lucky true belief is good enough.', 'luck']] },
      luck: { s: 'Then a man who guesses the road to Larissa correctly knows the road as well as one who has travelled it? Yet the guesser’s belief may run away from him at the first doubt, while the traveller’s stays fixed. Is not knowledge more lasting than a lucky guess?', q: 'Shall we add something that ties the belief down?', opts: [['Yes: a reason or account.', 'jtb']] },
      jtb: { s: 'Good. But what is this “account”? If it means listing the parts of a thing, I can list the letters of a name and still be unsure of the next name I spell. If it means knowing what makes the thing different from all others, then to have an account I must already <em>know</em> the difference, and we have defined knowledge using knowledge itself.', q: 'Have we found what knowledge is?', opts: [['No. Every definition has failed. We are stuck.', 'end']] },
      end: { s: 'Then we are in <em>aporia</em>, the puzzlement of not knowing. But we are wiser than before: we no longer think we know what we do not know. This, I think, is the beginning of wisdom.', q: null, opts: [] }
    };
    var hist = [], cur = 'start';
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-sans);font-size:0.95rem;line-height:1.55;';
    out.style.cssText = READ_CSS;
    function bubble(who, html, col) {
      var d = document.createElement('div');
      d.style.cssText = 'margin:0.45rem 0;padding:0.6rem 0.85rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:' + (who === 'You' ? 'var(--surface)' : 'var(--surface-raised)') + ';' + (who === 'You' ? 'margin-left:12%;' : 'margin-right:12%;');
      d.innerHTML = '<strong style="color:' + col + '">' + who + ':</strong> ' + html;
      box.appendChild(d);
    }
    function render() {
      box.innerHTML = '';
      hist.forEach(function (h) { if (h[0] === 'S') bubble('Socrates', h[1], AMBER); else bubble('You', h[1], BLUE); });
      var n = NODES[cur];
      if (n.q) bubble('Socrates', n.q, AMBER);
      var row = div('fig-controls', box);
      if (n.opts.length) {
        var g = group(row, 'Your answer');
        n.opts.forEach(function (o) { btn(o[0], g).addEventListener('click', function () { hist.push(['S', n.q]); hist.push(['Y', o[0]]); cur = o[1]; if (NODES[cur].s) hist.push(['S', NODES[cur].s]); render(); }); });
      } else {
        var g2 = group(row, 'Again');
        btn('Start the dialogue again', g2).addEventListener('click', function () { hist = []; cur = 'start'; render(); });
      }
      out.innerHTML = cur === 'end' ? 'You have followed the argument of Plato’s <em>Theaetetus</em>, which tests three definitions of knowledge (perception, true belief, and true belief with an account) and rejects them all. Philosophers still debate the third: in 1963 Edmund Gettier described cases of justified true belief that seem not to be knowledge.' :
        'Choose an answer. Socrates will test it, usually with a counterexample, in the manner of the dialogues Plato wrote.';
    }
    render();
  };

  /* -----------------------------------------------------------------------
     Figure 3. Doubling the square (Meno)
     ----------------------------------------------------------------------- */
  FIG['fig-doubling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var side = 2, diag = false;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'db-s', label: 'Side of the new square (feet)', min: 1, max: 4, step: 0.01, value: side, onChange: function (x) { side = x; diag = false; draw(); } });
    var row = group(controls, 'Try what the boy tried');
    btn('Double the side (4)', row).addEventListener('click', function () { side = 4; diag = false; s1.setValue(4); draw(); });
    btn('Side 3', row).addEventListener('click', function () { side = 3; diag = false; s1.setValue(3); draw(); });
    btn('Use the diagonal', row).addEventListener('click', function () { side = Math.SQRT2 * 2; diag = true; s1.setValue(side); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A two-foot square and a new square whose area we want to be eight square feet'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(side, 2));
      var u = Math.min(54, (W - 40) / 5.2), ox = (W - 4 * u) / 2, oy = 20;
      for (var i = 0; i <= 4; i++) { el('line', { x1: ox, y1: oy + i * u, x2: ox + 4 * u, y2: oy + i * u, stroke: c.border, 'stroke-width': 0.6 }, svg); el('line', { x1: ox + i * u, y1: oy, x2: ox + i * u, y2: oy + 4 * u, stroke: c.border, 'stroke-width': 0.6 }, svg); }
      el('rect', { x: ox, y: oy + 2 * u, width: 2 * u, height: 2 * u, fill: BLUE, opacity: 0.25, stroke: BLUE, 'stroke-width': 2 }, svg);
      txt(svg, ox + u, oy + 3 * u + 4, '4 sq ft', { size: fs(11), fill: BLUE });
      var area = side * side;
      if (diag) {
        var cx = ox + 2 * u, cy = oy + 2 * u, pts = [[cx, cy - 2 * u], [cx + 2 * u, cy], [cx, cy + 2 * u], [cx - 2 * u, cy]];
        el('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join(' L') + ' Z', fill: GREEN, opacity: 0.2, stroke: GREEN, 'stroke-width': 2.5 }, svg);
        [[cx - 2 * u, cy, cx, cy - 2 * u], [cx, cy - 2 * u, cx + 2 * u, cy], [cx + 2 * u, cy, cx, cy + 2 * u], [cx, cy + 2 * u, cx - 2 * u, cy]].forEach(function (l) { el('line', { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: GREEN, 'stroke-width': 2.5 }, svg); });
        txt(svg, cx, cy + 4, 'half of each of 4 squares', { size: fs(10), fill: GREEN });
      } else {
        el('rect', { x: ox, y: oy + 4 * u - side * u, width: side * u, height: side * u, fill: 'none', stroke: Math.abs(area - 8) < 0.05 ? GREEN : RED, 'stroke-width': 2.5 }, svg);
      }
      txt(svg, W / 2, oy + 4 * u + 24, 'grid squares are 1 foot × 1 foot', { size: fs(10), fill: c.muted });
      var msg = diag ? 'The square on the <strong>diagonal</strong> of the original square is made of four half-squares, each half of a 4-square-foot square: 4 × 2 = <strong>8 square feet</strong>, exactly double. Its side is the diagonal, √8 = 2√2 ≈ 2.83 feet.' :
        Math.abs(side - 4) < 0.01 ? 'Doubling the side gives a square of <strong>16 square feet</strong>: four times the area, not twice. This was the boy’s first, confident answer.' :
        Math.abs(side - 3) < 0.01 ? 'A side of 3 feet gives <strong>9 square feet</strong>: too big. Then 2 is too small and 3 too big, and the boy admits he does not know.' :
        'A side of ' + fmt(side, 2) + ' feet gives an area of <strong>' + fmt(area, 2) + ' square feet</strong> (target: 8).';
      out.innerHTML = msg + NOTE + 'In Plato’s <em>Meno</em>, Socrates leads an enslaved boy with no schooling, by questions alone, from wrong answers through confusion to the right one. Plato used the episode to argue that learning is recollection of knowledge the soul already has. It also contains a real mathematical surprise: no whole number or fraction squared equals 8, since √2 is irrational.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. The Platonic solids
     ----------------------------------------------------------------------- */
  FIG['fig-solids'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p = (1 + Math.sqrt(5)) / 2, ip = 1 / p;
    var SOL = [
      { name: 'Tetrahedron', el: 'Fire', faces: 4, shape: 'triangles', v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] },
      { name: 'Cube', el: 'Earth', faces: 6, shape: 'squares', v: [[-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]] },
      { name: 'Octahedron', el: 'Air', faces: 8, shape: 'triangles', v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] },
      { name: 'Icosahedron', el: 'Water', faces: 20, shape: 'triangles', v: [] },
      { name: 'Dodecahedron', el: 'The whole cosmos', faces: 12, shape: 'pentagons', v: [] }
    ];
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { SOL[3].v.push([0, a, b * p], [a, b * p, 0], [b * p, 0, a]); }); });
    [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (cc) { SOL[4].v.push([a, b, cc]); }); SOL[4].v.push([0, a * ip, b * p], [a * ip, b * p, 0], [b * p, 0, a * ip]); }); });
    SOL.forEach(function (s) {
      var d = [], E = [], mn = 1e9, i, j;
      for (i = 0; i < s.v.length; i++) for (j = i + 1; j < s.v.length; j++) { var q = Math.hypot(s.v[i][0] - s.v[j][0], s.v[i][1] - s.v[j][1], s.v[i][2] - s.v[j][2]); if (q < mn - 1e-6) mn = q; d.push([i, j, q]); }
      d.forEach(function (x) { if (Math.abs(x[2] - mn) < 1e-6) E.push([x[0], x[1]]); });
      var r = Math.max.apply(null, s.v.map(function (v) { return Math.hypot(v[0], v[1], v[2]); }));
      s.v = s.v.map(function (v) { return [v[0] / r, v[1] / r, v[2] / r]; }); s.e = E;
    });
    var si = 3, ang = 0, tilt = 0.5;
    var controls = div('fig-controls', container);
    choice(controls, 'Solid', SOL.map(function (s) { return s.name; }), si, function (i) { si = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'ps-t', label: 'Tilt', min: -1.5, max: 1.5, step: 0.01, value: tilt, onChange: function (x) { tilt = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, SOL[si].name + ', rotating'), W = A.W, svg = A.svg, fs = A.fs, s = SOL[si];
      valText(s1, fmt(tilt, 2));
      var R = 100, cx = W / 2, cy = 125, ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
      var P = s.v.map(function (v) { var x = ca * v[0] + sa * v[2], z = -sa * v[0] + ca * v[2], y = ct * v[1] - st * z, z2 = st * v[1] + ct * z; return [cx + R * x, cy - R * y, z2]; });
      s.e.slice().sort(function (a, b) { return (P[a[0]][2] + P[a[1]][2]) - (P[b[0]][2] + P[b[1]][2]); }).forEach(function (e) {
        var z = (P[e[0]][2] + P[e[1]][2]) / 2;
        el('line', { x1: P[e[0]][0], y1: P[e[0]][1], x2: P[e[1]][0], y2: P[e[1]][1], stroke: z > 0 ? BLUE : c.muted, 'stroke-width': z > 0 ? 2.4 : 1, opacity: z > 0 ? 1 : 0.5, 'stroke-dasharray': z > 0 ? '' : '3 3' }, svg);
      });
      P.forEach(function (q) { el('circle', { cx: q[0], cy: q[1], r: q[2] > 0 ? 3 : 2, fill: q[2] > 0 ? BLUE : c.muted }, svg); });
      var V = s.v.length, Ed = s.e.length, F = s.faces;
      out.innerHTML = '<strong>' + s.name + '</strong>: ' + F + ' faces (' + s.shape + '), ' + Ed + ' edges, ' + V + ' vertices. V − E + F = ' + V + ' − ' + Ed + ' + ' + F + ' = <strong>' + (V - Ed + F) + '</strong>. In Plato’s <em>Timaeus</em>: <strong>' + s.el + '</strong>.' +
        NOTE + 'A Platonic solid has identical regular faces with the same number meeting at every corner. There are exactly five, a fact proved in Euclid’s <em>Elements</em> and associated with Plato’s colleague Theaetetus. Plato matched four of them to the elements; the relation V − E + F = 2, true for all five, was noticed only in the eighteenth century.</span>';
    }
    draw();
    FIG.animate(figEl, function () { ang += 0.012; draw(); });
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Testing syllogisms
     ----------------------------------------------------------------------- */
  FIG['fig-syllogism'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Q = ['All', 'No', 'Some', 'Some … not'];
    var q1 = 0, q2 = 0, q3 = 0;
    var controls = div('fig-controls', container);
    var r1 = choice(controls, 'Premise 1: … M are P', Q, q1, function (i) { q1 = i; draw(); });
    var r2 = choice(controls, 'Premise 2: … S are M', Q, q2, function (i) { q2 = i; draw(); });
    var r3 = choice(controls, 'Conclusion: … S are P', Q, q3, function (i) { q3 = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function holds(q, X, Y, model) {
      var ok;
      if (q === 0) return model.every(function (r) { return !(r[X] && !r[Y]); });
      if (q === 1) return model.every(function (r) { return !(r[X] && r[Y]); });
      if (q === 2) return model.some(function (r) { return r[X] && r[Y]; });
      return model.some(function (r) { return r[X] && !r[Y]; });
    }
    var REG = [];
    for (var b = 1; b < 8; b++) REG.push({ s: !!(b & 4), m: !!(b & 2), p: !!(b & 1) });
    function phrase(q, X, Y) { return q === 3 ? 'Some ' + X + ' are not ' + Y : Q[q] + ' ' + X + ' are ' + Y; }
    var NAMES = { '000': 'Barbara', '101': 'Celarent', '022': 'Darii', '123': 'Ferio' };
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 262, 'Venn diagram of the syllogism'), W = A.W, svg = A.svg, fs = A.fs;
      var valid = true, counter = null;
      for (var mask = 0; mask < 128; mask++) {
        var model = REG.filter(function (r, i) { return mask & (1 << i); });
        if (holds(q1, 'm', 'p', model) && holds(q2, 's', 'm', model) && !holds(q3, 's', 'p', model)) { valid = false; counter = model; break; }
      }
      var emptyEvery = REG.map(function (r) { var forced = true; for (var mask = 0; mask < 128; mask++) { var model = REG.filter(function (rr, i) { return mask & (1 << i); }); if (holds(q1, 'm', 'p', model) && holds(q2, 's', 'm', model) && model.indexOf(r) >= 0) { forced = false; break; } } return forced; });
      var R = Math.min(62, W / 7), cx = W / 2, cy = 118, C3 = { s: [cx - R * 0.62, cy - R * 0.35], p: [cx + R * 0.62, cy - R * 0.35], m: [cx, cy + R * 0.55] };
      var step = 3;
      for (var x = cx - 2.2 * R; x < cx + 2.2 * R; x += step) for (var y = cy - 2 * R; y < cy + 2 * R; y += step) {
        var ins = {}; ['s', 'm', 'p'].forEach(function (k) { ins[k] = Math.hypot(x - C3[k][0], y - C3[k][1]) < R; });
        if (!ins.s && !ins.m && !ins.p) continue;
        var idx = REG.findIndex(function (r) { return r.s === ins.s && r.m === ins.m && r.p === ins.p; });
        if (emptyEvery[idx]) el('rect', { x: x, y: y, width: step, height: step, fill: c.muted, opacity: 0.35 }, svg);
      }
      [['s', 'S', BLUE], ['p', 'P', AMBER], ['m', 'M', GREEN]].forEach(function (k) { el('circle', { cx: C3[k[0]][0], cy: C3[k[0]][1], r: R, fill: 'none', stroke: k[2], 'stroke-width': 2.2 }, svg); var lx = C3[k[0]][0] + (k[0] === 's' ? -R * 1.05 : k[0] === 'p' ? R * 1.05 : 0), ly = C3[k[0]][1] + (k[0] === 'm' ? R + 16 : -R * 0.75); txt(svg, lx, ly, k[1], { size: fs(14), weight: 700, fill: k[2] }); });
      txt(svg, 10, 14, 'grey: regions the premises force to be empty', { anchor: 'start', size: fs(10), fill: c.muted });
      var key = '' + q1 + q2 + q3, nm = NAMES[key];
      var cdesc = counter ? counter.map(function (r) { return (r.s ? 'S' : '') + (r.m ? 'M' : '') + (r.p ? 'P' : '') ; }).map(function (t) { return t || '—'; }).join(', ') : '';
      out.innerHTML = phrase(q1, 'M', 'P') + '. ' + phrase(q2, 'S', 'M') + '. Therefore, ' + phrase(q3, 'S', 'P').replace(/^./, function (ch) { return ch.toLowerCase(); }) + '. → <strong style="color:' + (valid ? GREEN : RED) + '">' + (valid ? 'Valid' : 'Invalid') + '</strong>' + (nm ? ' (the medieval name for this form is <em>' + nm + '</em>)' : '') + '.' +
        NOTE + (valid ? 'Whatever S, M and P stand for, if the premises are true the conclusion must be true. Try S = squares, M = rectangles, P = shapes with four sides.' : 'A counterexample world: only things that are ' + cdesc + ' exist. The premises are true there but the conclusion is false, so the form does not guarantee its conclusion.') + ' Validity depends only on the form, not on what the letters mean: Aristotle’s great discovery.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Do heavier things fall faster?
     ----------------------------------------------------------------------- */
  FIG['fig-falling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var MED = [{ name: 'Air', rf: 1.2, mu: 1.8e-5 }, { name: 'Water', rf: 1000, mu: 1e-3 }, { name: 'Honey', rf: 1420, mu: 10 }];
    var mi = 1, t0 = null, traj = null, H = 2;
    var BALLS = [{ name: 'Stone', rho: 2500, col: c0() }, { name: 'Iron', rho: 7800, col: '#475569' }];
    function c0() { return '#a16207'; }
    function sim(rho, med) {
      var r = 0.01, A = Math.PI * r * r, V = 4 / 3 * Math.PI * r * r * r, m = rho * V, v = 0, y = 0, t = 0, dt = med.mu > 1 ? 2e-3 : 1e-4, pts = [[0, 0]];
      while (y < H && t < 500) {
        var Re = 2 * r * med.rf * Math.abs(v) / med.mu, Cd = Re < 1000 ? 24 / Math.max(Re, 1e-9) * (1 + 0.15 * Math.pow(Re, 0.687)) : 0.44;
        var a = (m * 9.81 - med.rf * V * 9.81 - 0.5 * med.rf * Cd * A * v * Math.abs(v)) / (m + 0.5 * med.rf * V);
        v += a * dt; y += v * dt; t += dt; if (pts.length < 4000 && (pts.length < 2 || t - pts[pts.length - 1][0] > 0.002 * (med.mu > 1 ? 20 : 1))) pts.push([t, y]);
      }
      pts.push([t, H]); return { pts: pts, T: t, v: v };
    }
    function prep() { traj = BALLS.map(function (b) { return sim(b.rho, MED[mi]); }); }
    prep();
    var controls = div('fig-controls', container);
    choice(controls, 'Medium', MED.map(function (m) { return m.name; }), mi, function (i) { mi = i; prep(); t0 = null; draw(0); });
    var row = group(controls, 'Actions');
    btn('Drop both', row).addEventListener('click', function () { t0 = performance.now(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function yAt(tr, t) { var p = tr.pts; if (t >= tr.T) return H; var lo = 0, hi = p.length - 1; while (hi - lo > 1) { var md = (lo + hi) >> 1; if (p[md][0] < t) lo = md; else hi = md; } var f = (t - p[lo][0]) / ((p[hi][0] - p[lo][0]) || 1); return p[lo][1] + f * (p[hi][1] - p[lo][1]); }
    function draw(tsim) {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Two balls of the same size falling through a medium'), W = A.W, svg = A.svg, fs = A.fs;
      var T = 20, B = 220, cols = [W * 0.35, W * 0.65], col = ['rgba(186,230,253,0.15)', 'rgba(59,130,246,0.18)', 'rgba(217,119,6,0.25)'][mi];
      el('rect', { x: W * 0.2, y: T, width: W * 0.6, height: B - T, fill: col, stroke: c.border, rx: 6 }, svg);
      BALLS.forEach(function (b, i) {
        var y = yAt(traj[i], tsim || 0);
        el('circle', { cx: cols[i], cy: T + 10 + y / H * (B - T - 20), r: 10, fill: b.col }, svg);
        txt(svg, cols[i], B + 18, b.name, { size: fs(11), fill: c.ink2 });
        if ((tsim || 0) >= traj[i].T) txt(svg, cols[i], B + 34, fmt(traj[i].T, traj[i].T > 10 ? 0 : 2) + ' s', { size: fs(11), weight: 700, fill: c.ink });
      });
      txt(svg, 10, 14, 'simulated time: ' + fmt(tsim || 0, (tsim || 0) > 10 ? 0 : 2) + ' s', { anchor: 'start', size: fs(10), fill: c.muted });
      var r = traj[0].T / traj[1].T;
      out.innerHTML = 'Two balls 2 cm across, one of stone and one of iron (about three times heavier), dropped through 2 m of ' + MED[mi].name.toLowerCase() + ': stone <strong>' + fmt(traj[0].T, traj[0].T > 10 ? 0 : 2) + ' s</strong>, iron <strong>' + fmt(traj[1].T, traj[1].T > 10 ? 0 : 2) + ' s</strong>. The iron ball is ' + fmt(r, 1) + ' times faster.' +
        NOTE + ['In air the two land almost together, as Galileo would later argue: weight barely matters when resistance is small.', 'In water the iron ball falls about twice as fast. The heavier body is faster, though not in proportion to its weight.', 'In thick honey, speed is set by the balance of weight (minus buoyancy) and drag: the heavier ball is several times faster, roughly as Aristotle said. His physics described motion through resisting media well; it failed for free fall.'][mi] + ' (Simulation with standard drag laws; times shown are simulated, not real time.)</span>';
    }
    draw(0);
    FIG.animate(figEl, function () { if (t0 === null) return; var real = (performance.now() - t0) / 1000, Tm = Math.max(traj[0].T, traj[1].T), ts = real * Tm / 4; draw(Math.min(ts, Tm + 0.001)); if (ts > Tm + 0.5) t0 = null; });
    window.addEventListener('resize', function () { draw(0); });
    onTheme(function () { draw(0); });
  };

  /* -----------------------------------------------------------------------
     Figure 7. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-m1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'How do we know what Socrates thought?', options: ['From his own books', 'Mainly from the writings of his pupils, especially Plato, and others such as Xenophon', 'From inscriptions in Athens', 'From Aristotle’s biography of him'], answer: 1, explanation: 'Socrates wrote nothing; Plato’s dialogues are the main source.' },
      { question: 'What is the Socratic method?', options: ['Memorising the answers of authorities', 'Testing a claim by questions and counterexamples until its weaknesses appear', 'Experimenting on animals', 'Voting on the truth'], answer: 1, explanation: 'Socrates’ questioning, or elenchus, exposes contradictions in what people think they know.' },
      { question: 'Socrates was condemned in 399 BCE for…', options: ['Treason in war', 'Impiety and corrupting the young', 'Stealing from the temple', 'Writing forbidden books'], answer: 1, explanation: 'He was found guilty by a jury of hundreds of citizens and executed with hemlock.' },
      { question: 'In Plato’s allegory of the cave, the shadows on the wall stand for…', options: ['The true Forms', 'The world of the senses, which we mistake for reality', 'The Sun', 'The philosophers'], answer: 1, explanation: 'Plato thought the senses show only shadows of the eternal Forms.' },
      { question: 'In the Meno, how is a square of double the area made?', options: ['By doubling the side', 'By drawing a square on the diagonal of the original', 'By using a side of 3 feet', 'It cannot be done'], answer: 1, explanation: 'The diagonal of a 2-foot square is √8, and its square has area 8.' },
      { question: 'Which element did Plato’s Timaeus link with the cube?', options: ['Fire', 'Earth', 'Water', 'Air'], answer: 1, explanation: 'Fire was the tetrahedron, air the octahedron, water the icosahedron.' },
      { question: '“All M are P. All S are M. Therefore all S are P.” This syllogism is…', options: ['Invalid', 'Valid whatever S, M and P mean', 'Valid only if it is true', 'Not a syllogism'], answer: 1, explanation: 'Its medieval name is Barbara; validity depends on form alone.' },
      { question: 'Which of these is one of Aristotle’s four causes?', options: ['The random cause', 'The final cause, or purpose', 'The atomic cause', 'The divine cause'], answer: 1, explanation: 'Material, formal, efficient and final causes.' },
      { question: 'Aristotle said heavier bodies fall faster. When is that roughly correct?', options: ['Never', 'For bodies moving steadily through a thick resisting medium, like honey', 'In a vacuum', 'Only on the Moon'], answer: 1, explanation: 'In a viscous medium, terminal speed grows with weight.' },
      { question: 'What does Raphael’s School of Athens show Plato and Aristotle doing?', options: ['Arguing about politics', 'Plato pointing upward, Aristotle holding his hand out flat towards the world', 'Writing on scrolls', 'Teaching Alexander'], answer: 1, explanation: 'The gestures suggest Plato’s heaven of Forms and Aristotle’s attention to the world we observe.' }
    ]);
  };
})();
