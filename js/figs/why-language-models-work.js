/* ==========================================================================
   RNLearn — Why It Works (One Word at a Time, Part 5)
   Figures: see FIG registrations below
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
     Figure: the story at a glance
     ----------------------------------------------------------------------- */
  var ERAS = [
    { name: 'Prediction and knowledge', color: '#b45309' },
    { name: 'Scale', color: '#1d4ed8' },
    { name: 'From predictor to assistant', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1951', icon: '🎯', era: 0, sec: 4, title: 'How predictable is English?', text: 'Claude Shannon estimates the information in English from people’s guesses of the next letter.' },
    { year: '2017', icon: '😊', era: 0, sec: 7, title: 'A sentiment neuron', text: 'Alec Radford, Rafal Jozefowicz and Ilya Sutskever find a unit that tracks sentiment in a network trained only to predict the next character of reviews.' },
    { year: '2017', icon: '👍', era: 2, sec: 8, title: 'Learning from preferences', text: 'Paul Christiano and colleagues train agents from human comparisons of pairs of behaviours.' },
    { year: '2020', icon: '📈', era: 1, sec: 5, title: 'Scaling laws', text: 'Jared Kaplan and colleagues find that loss falls as a smooth power law with model size, data and compute.' },
    { year: '2022', icon: '🐹', era: 1, sec: 5, title: 'Chinchilla', text: 'Jordan Hoffmann and colleagues show that models should be trained on far more data than was usual: about 20 tokens per parameter.' },
    { year: '2022', icon: '🧑‍🏫', era: 2, sec: 8, title: 'InstructGPT', text: 'Long Ouyang and colleagues fine-tune GPT-3 with human feedback; people prefer a 1.3-billion-parameter tuned model to the 175-billion original.' },
    { year: '2022', icon: '🪜', era: 2, sec: 9, title: 'Chain of thought', text: 'Jason Wei and colleagues show that prompting a model to write out intermediate steps improves its reasoning.' },
    { year: '2022', icon: '✨', era: 1, sec: 6, title: 'Emergent abilities', text: 'Wei and colleagues catalogue abilities that seem to appear suddenly as models grow.' },
    { year: '2023', icon: '🔍', era: 1, sec: 6, title: 'A mirage?', text: 'Rylan Schaeffer, Brando Miranda and Sanmi Koyejo argue that many sudden jumps are created by all-or-nothing scoring.' },
    { year: '2023', icon: '⚫', era: 0, sec: 7, title: 'A world model in Othello', text: 'Kenneth Li and colleagues find that a model trained only on Othello moves represents the board internally.' },
    { year: '2024', icon: '🌍', era: 0, sec: 7, title: 'Space and time', text: 'Wes Gurnee and Max Tegmark find that language models contain linear representations of places’ locations and events’ dates.' }
  ];

  FIG['fig-lm5-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1951 to 2024');
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

  var LM_PART = 5;
  /* -----------------------------------------------------------------------
     Shared for the series: random numbers, a toy world of sentences, n-grams
     ----------------------------------------------------------------------- */
  function rngSeed(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gaussR(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function softmaxT(z, T) { var m = Math.max.apply(null, z), e = z.map(function (v) { return Math.exp((v - m) / (T || 1)); }), s = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (v) { return v / s; }); }
  /* The toy world: animals, people, foods, drinks and places, with preferences */
  var LEX = {
    animal: ['cat', 'dog', 'bird', 'horse'], person: ['girl', 'boy', 'teacher', 'farmer'],
    food: ['fish', 'bread', 'apple', 'cake', 'cheese'], drink: ['milk', 'water', 'tea'],
    place: ['garden', 'kitchen', 'park', 'field', 'house'], adj: ['small', 'big', 'old', 'happy', 'hungry']
  };
  var LIKES = { cat: ['fish', 'cheese', 'milk', 'water'], dog: ['bread', 'cheese', 'water', 'milk'], bird: ['bread', 'apple', 'water'], horse: ['apple', 'bread', 'water'], girl: ['cake', 'apple', 'bread', 'milk', 'tea', 'water'], boy: ['cake', 'bread', 'cheese', 'milk', 'water'], teacher: ['bread', 'cheese', 'tea', 'apple'], farmer: ['bread', 'cheese', 'apple', 'tea', 'water'] };
  var HOME = { cat: ['house', 'kitchen', 'garden'], dog: ['garden', 'park', 'house'], bird: ['garden', 'park', 'field'], horse: ['field', 'park'], girl: ['park', 'garden', 'house'], boy: ['park', 'garden', 'kitchen'], teacher: ['house', 'park', 'kitchen'], farmer: ['field', 'kitchen', 'house'] };
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function makeSentence(r) {
    var anim = r() < 0.5, who = anim ? pick(r, LEX.animal) : pick(r, LEX.person), np = 'the ' + (r() < 0.3 ? pick(r, LEX.adj) + ' ' : '') + who;
    var likes = LIKES[who], home = HOME[who], t = r(), food = likes.filter(function (x) { return LEX.food.indexOf(x) >= 0; }), drink = likes.filter(function (x) { return LEX.drink.indexOf(x) >= 0; });
    if (t < 0.28) return np + ' eats the ' + pick(r, food) + ' .';
    if (t < 0.44 && drink.length && who !== 'horse') return np + ' drinks the ' + pick(r, drink) + ' .';
    if (t < 0.60) return np + ' sleeps in the ' + pick(r, home) + ' .';
    if (t < 0.72) return anim ? np + ' runs to the ' + pick(r, home) + ' .' : np + ' reads a book in the ' + pick(r, home) + ' .';
    if (t < 0.86) { if (anim) return np + ' plays in the ' + pick(r, home) + ' .'; return np + ' gives the ' + pick(r, food) + ' to the ' + pick(r, LEX.animal) + ' .'; }
    return np + ' eats the ' + pick(r, food) + ' in the ' + pick(r, home) + ' .';
  }
  var CORPUS = (function () { var r = rngSeed(2026), S = []; for (var i = 0; i < 1000; i++) S.push(makeSentence(r).split(' ')); return { train: S.slice(0, 800), test: S.slice(800) }; })();
  /* n-gram counts with sentence-start padding <s> */
  function ngramCounts(sents, n) { var C = {}; sents.forEach(function (s) { var w = []; for (var i = 1; i < n; i++) w.push('<s>'); w = w.concat(s); for (var j = n - 1; j < w.length; j++) { var ctx = w.slice(j - n + 1, j).join(' '), nx = w[j]; if (!C[ctx]) C[ctx] = {}; C[ctx][nx] = (C[ctx][nx] || 0) + 1; } }); return C; }
  function vocabOf(sents) { var V = {}; sents.forEach(function (s) { s.forEach(function (w) { V[w] = (V[w] || 0) + 1; }); }); return V; }
  function sampleFrom(dist, r) { var u = r(), acc = 0, keys = Object.keys(dist), tot = 0; keys.forEach(function (k) { tot += dist[k]; }); for (var i = 0; i < keys.length; i++) { acc += dist[keys[i]] / tot; if (u <= acc) return keys[i]; } return keys[keys.length - 1]; }
  function generateNgram(C, n, r, maxLen) { var w = []; for (var i = 1; i < n; i++) w.push('<s>'); var out = []; while (out.length < (maxLen || 16)) { var ctx = w.slice(w.length - n + 1).join(' '); if (n === 1) ctx = ''; var d = C[ctx]; if (!d) break; var nx = sampleFrom(d, r); out.push(nx); w.push(nx); if (nx === '.') break; } return out; }

  /* -----------------------------------------------------------------------
     Figure: series map
     ----------------------------------------------------------------------- */
  var LM_PARTS = [
    ['Counting Words Together', 'n-grams: probabilities from counts, generating text, and why counting runs out.'],
    ['Words as Numbers', 'Tokens, embeddings and how similarity lets a model generalise.'],
    ['Context and Attention', 'How each word looks back at the words that matter, layer by layer.'],
    ['From Scores to Words', 'Softmax, temperature, top-k, top-p, beam search and sampling.'],
    ['Why It Works', 'Prediction as compression, scaling laws, emergent abilities and learning from feedback.'],
    ['Why It Fails', 'Hallucination, calibration, tokenisation blind spots, and measuring accuracy honestly.']
  ];
  FIG['fig-lm-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CUR = LM_PART, sel = CUR;
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, rows = narrow ? 2 : 1, per = 6 / rows, A = newSVG(svgWrap, container, rows * 76 + 16, 'Map of the six parts of the series'), W = A.W, svg = A.svg, fs = A.fs, SHORT = ['Counting', 'Numbers', 'Attention', 'Choosing', 'Works', 'Fails'], col = '#a21caf';
      for (var i = 0; i < 6; i++) {
        var rr = Math.floor(i / per), kk = i % per, cx = 30 + (W - 60) * (kk + 0.5) / per, cy = 34 + rr * 76;
        if (kk > 0) el('line', { x1: 30 + (W - 60) * (kk - 0.5) / per + 14, y1: cy, x2: cx - 14, y2: cy, stroke: c.border, 'stroke-width': 2 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + ': ' + LM_PARTS[i][0], style: 'cursor:pointer' }, svg);
        el('circle', { cx: cx, cy: cy, r: i + 1 === sel ? 15 : 12, fill: i + 1 === CUR ? col : c.surface, stroke: col, 'stroke-width': i + 1 === sel ? 3 : 2 }, g);
        txt(g, cx, cy + 4, String(i + 1), { size: fs(11), weight: 700, fill: i + 1 === CUR ? '#fff' : col });
        txt(g, cx, cy + 32, SHORT[i], { size: fs(9), fill: c.ink2 });
        (function (n) { g.addEventListener('click', function () { sel = n; draw(); }); keyClick(g, function () { sel = n; draw(); }); })(i + 1);
      }
      out.innerHTML = '<strong>Part ' + sel + ': ' + LM_PARTS[sel - 1][0] + '.</strong> ' + LM_PARTS[sel - 1][1] + (sel === CUR ? ' <em>(you are here)</em>' : '') + NOTE + 'Parts 1–4 follow a sentence through a language model; Parts 5–6 ask why the result is so often right, and when it is not.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };
  /* -----------------------------------------------------------------------
     Models of the toy world for measuring prediction as compression
     ----------------------------------------------------------------------- */
  var LM5 = (function () {
    var C1 = ngramCounts(CORPUS.train, 1)[''], C2 = ngramCounts(CORPUS.train, 2), C3 = ngramCounts(CORPUS.train, 3), V = Object.keys(C1), N1 = 0; V.forEach(function (w) { N1 += C1[w]; });
    function tot(d) { var t = 0; Object.keys(d || {}).forEach(function (k) { t += d[k]; }); return t; }
    function uni(w) { return (C1[w] || 0.5) / N1; }
    function bi(a, w) { var d = C2[a] || {}, t = tot(d); return 0.95 * (t ? (d[w] || 0) / t : 0) + 0.05 * uni(w) + (t ? 0 : 0.95 * uni(w)); }
    function tri(a, b, w) { var d = C3[a + ' ' + b] || {}, t = tot(d); return 0.8 * (t ? (d[w] || 0) / t : bi(b, w)) + 0.2 * bi(b, w); }
    return { V: V, models: [['Uniform guess', function () { return 1 / V.length; }], ['Unigram (word frequencies)', function (a, b, w) { return uni(w); }], ['Bigram (previous word)', function (a, b, w) { return bi(b, w); }], ['Trigram (previous two words)', function (a, b, w) { return tri(a, b, w); }]] };
  })();
  function bitsPerWord(mi) { var f = LM5.models[mi][1], s = 0, n = 0; CORPUS.test.forEach(function (sent) { var a = '<s>', b = '<s>'; sent.forEach(function (w) { s -= Math.log2(f(a, b, w)); n++; a = b; b = w; }); }); return s / n; }

  /* -----------------------------------------------------------------------
     Figure: what must you know to predict the next word?
     ----------------------------------------------------------------------- */
  FIG['fig-lm-know'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ITEMS = [
      ['Grammar', 'The keys to the old wooden cabinet …', 'are', 'Which noun is the subject, and whether it is plural.'],
      ['Facts', 'The chemical symbol for gold is …', 'Au', 'A fact about the world, stated in many texts.'],
      ['Arithmetic', '17 + 25 = …', '42', 'How to add, or a memory of this particular sum.'],
      ['Logic', 'All bloops are razzies and all razzies are lazzies, so all bloops are …', 'lazzies', 'A rule of inference applied to made-up words that no text has ever contained.'],
      ['Everyday physics', 'I left the ice cream in the sun, and an hour later it had …', 'melted', 'What heat does to ice cream.'],
      ['Other minds', 'Sam put the ball in the box and left. Ana moved it to the bag. Sam will look in the …', 'box', 'That Sam did not see the move and still believes the ball is in the box.'],
      ['Code', 'def square(x): return x * …', 'x', 'What the function name promises the code will do.']
    ], shown = {};
    var box = div('', container), out = div('', container);
    box.style.cssText = 'display:grid;gap:0.5rem;';
    out.style.cssText = READ_CSS;
    function draw() {
      box.innerHTML = '';
      ITEMS.forEach(function (it, i) {
        var card = div('', box); card.style.cssText = 'padding:0.6rem 0.8rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);font-family:var(--font-sans);font-size:0.92rem;line-height:1.5;';
        card.innerHTML = '<div style="font-size:0.78rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.04em;">' + it[0] + '</div><div>' + it[1] + (shown[i] ? ' <strong style="color:#a21caf;">' + it[2] + '</strong>' : '') + '</div>' + (shown[i] ? '<div style="color:var(--ink-secondary);font-size:0.86rem;margin-top:0.2rem;">To predict this, you need: ' + it[3] + '</div>' : '');
        var b = btn(shown[i] ? 'Hide' : 'Reveal the next word', card); b.style.marginTop = '0.35rem';
        b.addEventListener('click', function () { shown[i] = !shown[i]; draw(); });
      });
      var n = Object.keys(shown).filter(function (k) { return shown[k]; }).length;
      out.innerHTML = 'Revealed ' + n + ' of ' + ITEMS.length + '.' + NOTE + 'Each next word is easy for a person and impossible to guess from word counts alone. A model that drives its prediction error down across trillions of such sentences is pushed to pick up grammar, facts, arithmetic, logic, physical common sense and even a crude model of what people believe, because all of them help predict text.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: prediction is compression
     ----------------------------------------------------------------------- */
  FIG['fig-lm-compress'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mi = 2, SENTS = ['the hungry cat drinks the milk .', 'the farmer sleeps in the field .', 'the girl gives the cake to the horse .'], si = 0, bpw = [0, 1, 2, 3].map(bitsPerWord);
    var controls = div('fig-controls', container);
    choice(controls, 'Model', LM5.models.map(function (m) { return m[0]; }), mi, function (i) { mi = i; draw(); });
    choice(controls, 'Sentence', SENTS.map(function (s) { return s.split(' ').slice(1, 3).join(' ') + ' …'; }), si, function (i) { si = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), toks = SENTS[si].split(' '), f = LM5.models[mi][1], a = '<s>', b = '<s>', bits = [];
      toks.forEach(function (w) { bits.push(-Math.log2(f(a, b, w))); a = b; b = w; });
      var A = newSVG(svgWrap, container, 210, 'Surprise of each word under a model, in bits'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 40, R = W - 14, T = 30, B = 160, bw = (R - L) / toks.length, Y = function (v) { return B - Math.min(v, 8) / 8 * (B - T); };
      [0, 2, 4, 6, 8].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      bits.forEach(function (v, i) { el('rect', { x: L + i * bw + bw * 0.15, y: Y(v), width: bw * 0.7, height: Math.max(1, B - Y(v)), fill: '#a21caf', opacity: 0.25 + 0.7 * Math.min(1, v / 7) }, svg); txt(svg, L + (i + 0.5) * bw, Y(v) - 5, fmt(v, 1), { size: fs(9), fill: c.ink2 }); txt(svg, L + (i + 0.5) * bw, B + 16, toks[i] === '.' ? '(stop)' : toks[i], { size: fs(10), fill: c.ink2 }); });
      txt(svg, L, 14, W < 520 ? 'surprise of each word (bits)' : 'surprise of each word in bits (−log₂ of the probability the model gave it)', { anchor: 'start', size: fs(10), fill: c.muted });
      var tot = bits.reduce(function (s, v) { return s + v; }, 0);
      out.innerHTML = LM5.models[mi][0] + ': this sentence costs <strong>' + fmt(tot, 1) + ' bits</strong>. Over all 200 test sentences: uniform ' + fmt(bpw[0], 2) + ', unigram ' + fmt(bpw[1], 2) + ', bigram ' + fmt(bpw[2], 2) + ', trigram <strong>' + fmt(bpw[3], 2) + '</strong> bits per word.' + NOTE + 'A word the model expected costs few bits; a surprising one costs many. With an encoding called arithmetic coding, a model that predicts well can store text in almost exactly this many bits, so better prediction literally means better compression. To push the cost down further, a model must capture more of what makes text predictable.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a scaling law
     ----------------------------------------------------------------------- */
  FIG['fig-lm-scaling'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lg = 9;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sc-n', label: 'Parameters (log₁₀)', min: 5, max: 13, step: 0.25, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function loss(N) { return Math.pow(8.8e13 / N, 0.076); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Test loss against number of parameters, on log scales'), W = A.W, svg = A.svg, fs = A.fs, N = Math.pow(10, lg);
      valText(s1, N >= 1e9 ? fmt(N / 1e9, N < 1e10 ? 1 : 0) + ' billion' : N >= 1e6 ? fmt(N / 1e6, 0) + ' million' : Math.round(N).toLocaleString('en-GB'));
      var L = 50, R = W - 14, T = 26, B = 196, X = function (e) { return L + (e - 5) / 8 * (R - L); }, Y = function (v) { return B - (Math.log10(v) - Math.log10(1.1)) / (Math.log10(6) - Math.log10(1.1)) * (B - T); };
      [1.5, 2, 3, 4, 5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [5, 7, 9, 11, 13].forEach(function (e) { var t = txt(svg, X(e), B + 15, '', { size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      txt(svg, (L + R) / 2, B + 31, 'parameters (excluding embeddings)', { size: fs(10), fill: c.muted });
      var d = ''; for (var e = 5; e <= 13.001; e += 0.1) d += (e > 5 ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(loss(Math.pow(10, e))).toFixed(1); el('path', { d: d, fill: 'none', stroke: '#a21caf', 'stroke-width': 2.4 }, svg);
      el('circle', { cx: X(lg), cy: Y(loss(N)), r: 5, fill: RED }, svg);
      txt(svg, L, 14, W < 520 ? 'test loss (nats per token, log scale)' : 'test loss (nats per token, log scale) predicted by L = (8.8 × 10¹³ / N) to the power 0.076', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'At ' + valTextS(N) + ' parameters the fitted law predicts a loss of <strong>' + fmt(loss(N), 2) + '</strong> nats per token (perplexity ' + fmt(Math.exp(loss(N)), 1) + '). Ten times more parameters multiplies the loss by <strong>' + fmt(Math.pow(10, -0.076), 3) + '</strong>.' + NOTE + 'Kaplan and colleagues fitted this power law to language models trained on plenty of data, from about a thousand to over a billion parameters. On log scales it is a straight line: every tenfold increase cuts the loss by the same 16%, with no sign of levelling off in their range. Values beyond it are extrapolations, and the law only holds if data and compute grow too.</span>';
    }
    function valTextS(N) { return N >= 1e9 ? fmt(N / 1e9, N < 1e10 ? 1 : 0) + ' billion' : N >= 1e6 ? fmt(N / 1e6, 0) + ' million' : Math.round(N).toLocaleString('en-GB'); }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: emergent abilities and the choice of metric
     ----------------------------------------------------------------------- */
  FIG['fig-lm-emerge'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 5;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'em-k', label: 'Tokens that must all be right', min: 1, max: 12, step: 1, value: k, onChange: function (x) { k = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function pTok(e) { return 1 / (1 + Math.exp(-(e - 9) * 1.1)) * 0.98 + 0.01; }
    function draw() {
      valText(s1, String(k));
      var c = C(), A = newSVG(svgWrap, container, 230, 'Per-token accuracy and exact-match accuracy against model scale'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 44, R = W - 14, T = 26, B = 186, X = function (e) { return L + (e - 6) / 6 * (R - L); }, Y = function (v) { return B - v * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      [6, 8, 10, 12].forEach(function (e) { var t = txt(svg, X(e), B + 15, '', { size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      txt(svg, (L + R) / 2, B + 31, 'model scale (parameters, illustrative)', { size: fs(10), fill: c.muted });
      var d1 = '', d2 = ''; for (var e = 6; e <= 12.001; e += 0.05) { d1 += (e > 6 ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(pTok(e)).toFixed(1); d2 += (e > 6 ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(Math.pow(pTok(e), k)).toFixed(1); }
      el('path', { d: d1, fill: 'none', stroke: c.muted, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg); el('path', { d: d2, fill: 'none', stroke: '#a21caf', 'stroke-width': 2.6 }, svg);
      txt(svg, L, 14, W < 520 ? 'dashed: per token · purple: all ' + k + ' right' : 'dashed: chance each token is right (smooth) · purple: chance all ' + k + ' are right (exact match)', { anchor: 'start', size: fs(10), fill: c.muted });
      var e1 = 6; while (e1 < 12 && Math.pow(pTok(e1), k) < 0.1) e1 += 0.01; var e2 = e1; while (e2 < 12 && Math.pow(pTok(e2), k) < 0.5) e2 += 0.01;
      out.innerHTML = 'With ' + k + ' tokens to get right, exact-match accuracy climbs from 10% to 50% over a factor of <strong>' + fmt(Math.pow(10, e2 - e1), 1) + '</strong> in scale, while per-token accuracy rises from ' + Math.round(pTok(e1) * 100) + '% to ' + Math.round(pTok(e2) * 100) + '%.' + NOTE + 'The per-token skill improves smoothly with scale. But if an answer counts only when every one of its k tokens is right, its accuracy is the per-token accuracy to the power k, which stays near zero for a long time and then shoots up. The ability looks as if it “emerges” suddenly, although nothing sudden happened underneath. (An illustrative curve, not data from a real model.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: learning from human preferences
     ----------------------------------------------------------------------- */
  FIG['fig-lm-pref'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var dr = 1, n = 20, seed = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'pf-d', label: 'True quality gap between answers A and B', min: -3, max: 3, step: 0.25, value: dr, onChange: function (x) { dr = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'pf-n', label: 'Human comparisons collected', min: 5, max: 200, step: 5, value: n, onChange: function (x) { n = x; draw(); } });
    var row = group(controls, 'People');
    btn('Ask new people', row).addEventListener('click', function () { seed++; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(s1, fmt(dr, 2)); valText(s2, String(n));
      var p = sgmL(dr), r = rngSeed(seed * 17 + n), wins = 0; for (var i = 0; i < n; i++) if (r() < p) wins++;
      var ph = Math.min(0.995, Math.max(0.005, wins / n)), est = Math.log(ph / (1 - ph));
      var c = C(), A = newSVG(svgWrap, container, 220, 'Probability that people prefer answer A, as a function of the quality gap'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 44, R = W - 14, T = 26, B = 176, X = function (v) { return L + (v + 4) / 8 * (R - L); }, Y = function (v) { return B - v * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      [-4, -2, 0, 2, 4].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 31, 'reward of A minus reward of B', { size: fs(10), fill: c.muted });
      var d = ''; for (var v = -4; v <= 4.001; v += 0.05) d += (v > -4 ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(sgmL(v)).toFixed(1); el('path', { d: d, fill: 'none', stroke: '#a21caf', 'stroke-width': 2.4 }, svg);
      el('circle', { cx: X(dr), cy: Y(p), r: 5, fill: '#a21caf' }, svg); el('circle', { cx: X(Math.max(-4, Math.min(4, est))), cy: Y(wins / n), r: 5, fill: AMBER, stroke: '#fff', 'stroke-width': 1.2 }, svg);
      txt(svg, L, 14, W < 520 ? 'purple: Bradley–Terry · orange: estimate' : 'purple: chance A is preferred (Bradley–Terry model) · orange: estimate from the comparisons collected', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'True gap ' + fmt(dr, 2) + ': people should prefer A ' + Math.round(p * 100) + '% of the time. In ' + n + ' comparisons, A won <strong>' + wins + '</strong>, giving an estimated gap of <strong>' + fmt(est, 2) + '</strong>.' + NOTE + 'People find it easier to say which of two answers is better than to score one. The Bradley–Terry model turns such choices into a reward: the larger the reward gap, the more often the better answer is chosen. A reward model is trained on many thousands of comparisons to predict which answer people prefer, and the language model is then tuned to produce answers that score highly. With few comparisons, the estimated reward is noisy.</span>';
    }
    function sgmL(z) { return 1 / (1 + Math.exp(-z)); }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-lm5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why might predicting the next word require knowledge?', options: ['It does not', 'Many next words depend on grammar, facts, logic or what people believe', 'Because of tokenisation', 'Because models read dictionaries'], answer: 1, explanation: 'Figure 3 gives examples of each kind.' },
      { question: 'What is the link between prediction and compression?', options: ['None', 'A model that predicts text better can encode it in fewer bits', 'Compression makes models faster', 'Both use the softmax'], answer: 1, explanation: 'Bits per word = average −log₂ probability.' },
      { question: 'A scaling law says that test loss…', options: ['Is constant', 'Falls as a smooth power law as parameters, data and compute grow', 'Rises with size', 'Jumps suddenly'], answer: 1, explanation: 'Kaplan and colleagues, 2020.' },
      { question: 'What did Chinchilla show?', options: ['Bigger is always better', 'Many models were too big for their data; about 20 tokens per parameter is compute-optimal', 'Data does not matter', 'Small models cannot learn'], answer: 1, explanation: 'Chinchilla (70B) beat larger models trained on less data.' },
      { question: 'Why can an ability seem to “emerge” suddenly?', options: ['Models become conscious', 'All-or-nothing scoring turns smooth per-token gains into a sharp jump', 'Training restarts', 'Random chance'], answer: 1, explanation: 'Figure 6: exact match = (per-token accuracy)^k.' },
      { question: 'Othello-GPT showed that a model trained only on moves…', options: ['Could not play', 'Built an internal representation of the board', 'Memorised every game', 'Needed the rules'], answer: 1, explanation: 'Li and colleagues, 2023.' },
      { question: 'Instruction tuning and RLHF turn a text predictor into…', options: ['A search engine', 'An assistant that follows requests and gives answers people prefer', 'A smaller model', 'A translator only'], answer: 1, explanation: 'InstructGPT, 2022.' },
      { question: 'In the Bradley–Terry model, a larger reward gap means…', options: ['Random preferences', 'The better answer is chosen more often', 'Fewer comparisons', 'Lower quality'], answer: 1, explanation: 'P(A preferred) = 1/(1 + e^−gap).' },
      { question: 'Why does writing out steps (“chain of thought”) help?', options: ['It looks nicer', 'Each token gets a fixed amount of computation; more tokens give more computation and a place to store intermediate results', 'It shortens answers', 'It changes the weights'], answer: 1, explanation: 'Wei and colleagues, 2022.' },
      { question: 'Which statement is best supported by the evidence?', options: ['LLMs understand exactly as people do', 'Next-word training produces useful internal representations, but how far they amount to understanding is debated', 'LLMs know nothing', 'LLMs look up a database'], answer: 1, explanation: 'Section 10 discusses both sides.' }
    ]);
  };
})();
