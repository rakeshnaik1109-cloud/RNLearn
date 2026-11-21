/* ==========================================================================
   RNLearn — Why It Fails (One Word at a Time, Part 6)
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
    { name: 'Estimating the unseen', color: '#b45309' },
    { name: 'Diagnosing errors', color: '#1d4ed8' },
    { name: 'Fixing and measuring', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1953', icon: '🔢', era: 0, sec: 4, title: 'Good–Turing estimation', text: 'I. J. Good, building on Alan Turing’s wartime codebreaking work, shows how to estimate the chance of meeting something never seen before.' },
    { year: '2020', icon: '📚', era: 2, sec: 7, title: 'Retrieval-augmented generation', text: 'Patrick Lewis and colleagues let a model look up passages in a document collection before answering.' },
    { year: '2021', icon: '🧪', era: 1, sec: 8, title: 'TruthfulQA', text: 'Stephanie Lin, Jacob Hilton and Owain Evans find that larger models repeat popular misconceptions more often.' },
    { year: '2022', icon: '🎚️', era: 1, sec: 5, title: 'Knowing what they know', text: 'Saurav Kadavath and colleagues find that large models’ confidence in multiple-choice answers is well calibrated.' },
    { year: '2023', icon: '⚖️', era: 1, sec: 3, title: 'Invented case law', text: 'A US federal court sanctions lawyers who filed a brief citing court cases invented by a chatbot.' },
    { year: '2023', icon: '🔄', era: 1, sec: 6, title: 'The reversal curse', text: 'Lukas Berglund and colleagues find that models trained on “A is B” often cannot answer “who is B?”.' },
    { year: '2023', icon: '🔧', era: 2, sec: 7, title: 'Toolformer', text: 'Timo Schick and colleagues teach a model to call a calculator, a search engine and other tools by itself.' },
    { year: '2023', icon: '🎭', era: 1, sec: 7, title: 'Unfaithful explanations', text: 'Miles Turpin and colleagues show that a model’s written reasoning can omit what actually drove its answer.' },
    { year: '2024', icon: '📐', era: 0, sec: 4, title: 'Calibrated models must hallucinate', text: 'Adam Tauman Kalai and Santosh Vempala prove a lower bound on hallucination for facts seen only once in training.' },
    { year: '2025', icon: '🧠', era: 2, sec: 7, title: 'Reasoning by reinforcement', text: 'DeepSeek describes training a model to reason at length with reinforcement learning on verifiable answers.' }
  ];

  FIG['fig-lm6-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1953 to 2025');
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

  var LM_PART = 6;
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
     Figure: rare facts and the Good–Turing estimate
     ----------------------------------------------------------------------- */
  FIG['fig-lm-singleton'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sExp = 1.1, lg = 5, F = 100000;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sg-s', label: 'How skewed fame is (Zipf exponent)', min: 0.6, max: 2, step: 0.1, value: sExp, onChange: function (x) { sExp = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'sg-n', label: 'Mentions of facts in the training text (log₁₀)', min: 3, max: 7, step: 0.5, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var n = Math.round(Math.pow(10, lg)); valText(s1, fmt(sExp, 1)); valText(s2, n.toLocaleString('en-GB'));
      var w = [], Z = 0, i; for (i = 1; i <= F; i++) { var v = Math.pow(i, -sExp); w.push(v); Z += v; }
      /* expected counts: each fact appears Poisson(n p_i) times */
      var E0 = 0, E1 = 0, E2 = 0, E5 = 0, N1 = 0; for (i = 0; i < F; i++) { var lam = n * w[i] / Z, p0 = Math.exp(-lam), p1 = lam * p0, p24 = p0 * (lam * lam / 2 + Math.pow(lam, 3) / 6 + Math.pow(lam, 4) / 24); E0 += p0; E1 += p1; E2 += p24; E5 += 1 - p0 - p1 - p24; N1 += p1; }
      var gt = N1 / n;
      var c = C(), A = newSVG(svgWrap, container, 220, 'How many facts are seen never, once, a few times or often'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 50, R = W - 14, T = 30, B = 176, vals = [E0, E1, E2, E5].map(function (v) { return v / F; }), labs = ['never', 'once', '2–4 times', '5+ times'], bw = (R - L) / 4, Y = function (v) { return B - v * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      vals.forEach(function (v, k) { el('rect', { x: L + k * bw + bw * 0.2, y: Y(v), width: bw * 0.6, height: B - Y(v), fill: k === 1 ? RED : '#a21caf', opacity: 0.8 }, svg); txt(svg, L + (k + 0.5) * bw, Y(v) - 5, fmt(v * 100, 1) + '%', { size: fs(9), fill: c.ink2 }); txt(svg, L + (k + 0.5) * bw, B + 15, labs[k], { size: fs(10), fill: c.muted }); });
      txt(svg, L, 14, W < 520 ? 'share of facts by times seen in training' : 'share of 100,000 facts (for example, people’s birthdays) by how often they appear in training', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Facts seen exactly once: <strong>' + Math.round(E1).toLocaleString('en-GB') + '</strong>. Share of all mentions that are of once-seen facts: <strong>' + fmt(gt * 100, 1) + '%</strong>.' + NOTE + 'A few facts are famous and mentioned constantly; most are obscure. For a fact seen once, the model has no second example to tell a real pattern from noise, and when asked about a fact it never saw, a plausible guess is the most probable continuation. Good and Turing showed that the share of mentions that are of once-seen items estimates how likely the next question is to concern something never seen at all. Kalai and Vempala proved that a well-calibrated model must invent false answers at about this rate for such arbitrary facts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: calibration
     ----------------------------------------------------------------------- */
  FIG['fig-lm-calib'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Model', ['Calibrated', 'Overconfident', 'Underconfident'], mode, function (i) { mode = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var r = rngSeed(61), bins = [], i; for (i = 0; i < 10; i++) bins.push({ n: 0, ok: 0, conf: 0 });
      for (i = 0; i < 3000; i++) { var trueP = 0.2 + 0.8 * Math.pow(r(), 0.7), stated = mode === 0 ? trueP : mode === 1 ? Math.min(0.999, 1 - Math.pow(1 - trueP, 2.2)) : 0.5 + (trueP - 0.5) * 0.55, right = r() < trueP, b = Math.min(9, Math.floor(stated * 10)); bins[b].n++; bins[b].ok += right ? 1 : 0; bins[b].conf += stated; }
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), A = newSVG(svgWrap, container, Math.round(26 + Math.min(W0 - 80, 260) * 0.75 + 46), 'Reliability diagram: accuracy against stated confidence'), W = A.W, svg = A.svg, fs = A.fs;
      var S = Math.min(W - 80, 260), L = (W - S) / 2 + 10, T = 26, X = function (v) { return L + v * S; }, Y = function (v) { return T + (1 - v) * (S * 0.75); }, Hh = S * 0.75;
      el('rect', { x: L, y: T, width: S, height: Hh, fill: c.surface, stroke: c.border }, svg);
      [0, 0.5, 1].forEach(function (v) { txt(svg, X(v), T + Hh + 14, Math.round(v * 100) + '%', { size: fs(9), fill: c.muted }); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      el('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: c.muted, 'stroke-dasharray': '4 3' }, svg);
      var ece = 0, tot = 0;
      bins.forEach(function (bn, k) { if (!bn.n) return; var acc = bn.ok / bn.n, cf = bn.conf / bn.n; ece += bn.n * Math.abs(acc - cf); tot += bn.n; el('rect', { x: X(k / 10) + 1, y: Y(acc), width: S / 10 - 2, height: Y(0) - Y(acc), fill: '#a21caf', opacity: 0.75 }, svg); });
      txt(svg, (L + L + S) / 2, T + Hh + 30, 'confidence the model states', { size: fs(10), fill: c.muted });
      txt(svg, 10, 14, W < 520 ? 'bars: share right · dashed: perfect' : 'bars: share of answers actually right in each confidence band · dashed: perfect calibration', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = ['Calibrated', 'Overconfident', 'Underconfident'][mode] + ' model: expected calibration error <strong>' + fmt(ece / tot * 100, 1) + ' percentage points</strong>.' + NOTE + 'Answers are grouped by the confidence the model attaches to them. For a calibrated model, answers given with 80% confidence are right about 80% of the time, and the bars follow the diagonal. An overconfident model’s bars fall below it: it sounds surer than it is. Studies found large pre-trained models fairly well calibrated on multiple-choice questions, and that tuning for helpfulness can make them less so. (Simulated answers for illustration.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: tokens hide letters
     ----------------------------------------------------------------------- */
  FIG['fig-lm-letters'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var WORDS = [['strawberry', ['straw', 'berry'], 'r'], ['banana', ['ban', 'ana'], 'a'], ['bookkeeper', ['book', 'keeper'], 'e'], ['Mississippi', ['Miss', 'iss', 'ippi'], 's'], ['1234567', ['123', '456', '7'], '4']], wi = 0, spell = false;
    var controls = div('fig-controls', container);
    choice(controls, 'Word', WORDS.map(function (w) { return w[0]; }), wi, function (i) { wi = i; draw(); });
    choice(controls, 'Ask the model to', ['Answer directly', 'Spell it out first'], 0, function (i) { spell = i === 1; draw(); });
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-mono);font-size:0.95rem;line-height:2.2;padding:0.8rem 1rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);';
    out.style.cssText = READ_CSS;
    function draw() {
      var Wd = WORDS[wi], word = Wd[0], letter = Wd[2], count = word.toLowerCase().split('').filter(function (ch) { return ch === letter; }).length, ids = Wd[1].map(function (t, k) { var h = 0; for (var q = 0; q < t.length; q++) h = (h * 31 + t.charCodeAt(q)) % 90000; return 10000 + h; });
      box.innerHTML = '<div style="font-family:var(--font-sans);font-size:0.8rem;color:var(--ink-muted);">What you see:</div><div>' + word + '</div>' +
        '<div style="font-family:var(--font-sans);font-size:0.8rem;color:var(--ink-muted);">What the model receives (an illustrative split into tokens, shown with made-up ID numbers):</div><div>' + Wd[1].map(function (t, k) { return '<span style="padding:2px 6px;margin-right:4px;border-radius:4px;background:#a21caf22;border:1px solid #a21caf66;">' + t + ' <span style="color:var(--ink-muted);font-size:0.75rem;">#' + ids[k] + '</span></span>'; }).join('') + '</div>' +
        (spell ? '<div style="font-family:var(--font-sans);font-size:0.8rem;color:var(--ink-muted);">After spelling it out, letter by letter, as separate tokens:</div><div>' + word.split('').map(function (ch) { return '<span style="padding:1px 5px;margin-right:2px;border-radius:3px;' + (ch.toLowerCase() === letter ? 'background:#16a34a33;border:1px solid #16a34a;' : 'border:1px solid var(--border);') + '">' + ch + '</span>'; }).join('') + '</div>' : '');
      out.innerHTML = 'How many “' + letter + '” in “' + word + '”? The answer is <strong>' + count + '</strong>.' + NOTE + (spell ? 'Once the word is spelled out, each letter is its own token and counting becomes a simple pattern the model handles well. Asking a model to work step by step often fixes such errors.' : 'The model never sees the letters, only a few token numbers. To count letters it must have learned how each token is spelled, which text rarely states, so models have long been prone to slips on questions that are trivial for people. The same applies to numbers, which may be cut into arbitrary chunks.') + '</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: how sure is a benchmark score?
     ----------------------------------------------------------------------- */
  FIG['fig-lm-bench'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 200, pa = 0.82, pb = 0.78;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'bn-n', label: 'Questions in the benchmark', min: 50, max: 5000, step: 50, value: n, onChange: function (x) { n = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'bn-a', label: 'Model A accuracy', min: 0.5, max: 0.99, step: 0.01, value: pa, onChange: function (x) { pa = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'bn-b', label: 'Model B accuracy', min: 0.5, max: 0.99, step: 0.01, value: pb, onChange: function (x) { pb = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function wilson(p, nn) { var z = 1.96, d = 1 + z * z / nn, ce = (p + z * z / (2 * nn)) / d, h = z * Math.sqrt(p * (1 - p) / nn + z * z / (4 * nn * nn)) / d; return [ce - h, ce + h]; }
    function binomTail(k, m) { /* P(X <= k), X ~ Bin(m, 0.5) */ var s = 0, lp = -m * Math.LN2, c0 = 0; for (var i = 0; i <= k; i++) { c0 = i === 0 ? 0 : c0 + Math.log((m - i + 1) / i); s += Math.exp(c0 + lp); } return Math.min(1, s); }
    function draw() {
      valText(s1, String(n)); valText(s2, fmt(pa, 2)); valText(s3, fmt(pb, 2));
      var b = Math.round(n * pa * (1 - pb)), cc = Math.round(n * pb * (1 - pa)), m = b + cc, pval = m ? Math.min(1, 2 * binomTail(Math.min(b, cc), m)) : 1;
      var ca = wilson(pa, n), cb = wilson(pb, n);
      var c = C(), A = newSVG(svgWrap, container, 150, 'Accuracy of two models with 95% confidence intervals'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 70, R = W - 20, lo = 0.4, hi = 1, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) { el('line', { x1: X(v), y1: 24, x2: X(v), y2: 110, stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, X(v), 126, Math.round(v * 100) + '%', { size: fs(9), fill: c.muted }); });
      [[pa, ca, 'Model A', '#a21caf', 50], [pb, cb, 'Model B', '#2563eb', 86]].forEach(function (q) { txt(svg, L - 8, q[4] + 4, q[2], { anchor: 'end', size: fs(10), fill: c.ink2 }); el('line', { x1: X(q[1][0]), y1: q[4], x2: X(q[1][1]), y2: q[4], stroke: q[3], 'stroke-width': 3 }, svg); el('circle', { cx: X(q[0]), cy: q[4], r: 6, fill: q[3] }, svg); });
      txt(svg, 10, 14, 'dot: accuracy · bar: 95% confidence interval', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Model A ' + fmt(pa * 100, 0) + '% (95% interval ' + fmt(ca[0] * 100, 1) + '–' + fmt(ca[1] * 100, 1) + '%), model B ' + fmt(pb * 100, 0) + '% (' + fmt(cb[0] * 100, 1) + '–' + fmt(cb[1] * 100, 1) + '%). Questions only A gets right: ' + b + '; only B: ' + cc + '. Paired test p-value: <strong>' + (pval < 0.001 ? '&lt; 0.001' : fmt(pval, 3)) + '</strong>.' + NOTE + 'A benchmark is a sample of possible questions, so its score has sampling error. With 200 questions, a 4-point gap is usually within the noise. The paired (McNemar) test uses only the questions on which the models disagree, assumed here to be independent between models. See our article on null hypotheses and p-values for how to compare models properly.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-lm6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why can a language model state falsehoods confidently?', options: ['It is lying on purpose', 'It produces probable continuations, and a fluent, plausible answer can be probable without being true', 'Its memory is full', 'Temperature is too low'], answer: 1, explanation: 'Training rewards matching text, not checking facts.' },
      { question: 'Which facts is a model most likely to get wrong?', options: ['Very famous ones', 'Rare facts mentioned once or never in its training text', 'Arithmetic only', 'Questions in English'], answer: 1, explanation: 'Figure 3: most facts are rare.' },
      { question: 'The Good–Turing idea estimates…', options: ['Model size', 'How likely the next item is to be one never seen before, from the share of once-seen items', 'Token counts', 'Temperature'], answer: 1, explanation: 'Good, 1953, building on Turing.' },
      { question: 'A model is well calibrated if…', options: ['It is always right', 'Answers given with 70% confidence are right about 70% of the time', 'It never abstains', 'It uses temperature 0'], answer: 1, explanation: 'Figure 4 shows calibrated and overconfident models.' },
      { question: 'Why do models struggle to count letters in a word?', options: ['They cannot count', 'They receive tokens, not letters, and spelling of tokens is rarely stated in text', 'Letters are random', 'Because of the causal mask'], answer: 1, explanation: 'Spelling the word out first helps.' },
      { question: 'The “reversal curse” is…', options: ['A tokenisation bug', 'Failing to answer “who is B?” after learning only “A is B”', 'Reading text backwards', 'Forgetting old facts'], answer: 1, explanation: 'Berglund and colleagues, 2024.' },
      { question: 'Retrieval-augmented generation reduces hallucination by…', options: ['Making the model bigger', 'Giving the model relevant documents to base its answer on', 'Raising the temperature', 'Removing facts'], answer: 1, explanation: 'Lewis and colleagues, 2020.' },
      { question: 'What did TruthfulQA find about larger models?', options: ['They were always more truthful', 'They more often repeated popular misconceptions', 'They refused to answer', 'They were identical'], answer: 1, explanation: 'Imitating human text includes imitating human errors.' },
      { question: 'Why must a benchmark score be reported with uncertainty?', options: ['It need not be', 'The questions are a sample, so the score would vary on another sample', 'Models are random', 'Because of tokenisers'], answer: 1, explanation: 'With 200 questions, a 4-point gap is usually noise.' },
      { question: 'A model’s written chain of thought…', options: ['Always shows exactly how it reached the answer', 'Can help accuracy but may not faithfully reflect what drove the answer', 'Is never useful', 'Is the same as its weights'], answer: 1, explanation: 'Turpin and colleagues, 2023.' }
    ]);
  };
})();
