/* ==========================================================================
   RNLearn — From Scores to Words (One Word at a Time, Part 4)
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
    { name: 'Search and sampling', color: '#b45309' },
    { name: 'Decoding neural text', color: '#1d4ed8' },
    { name: 'Better answers from many tries', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1948', icon: '🎲', era: 0, sec: 6, title: 'Sampling text', text: 'Claude Shannon builds sentences by drawing each word at random according to its frequency after the previous one.' },
    { year: '1976', icon: '🔦', era: 0, sec: 7, title: 'Beam search', text: 'Bruce Lowerre’s Harpy speech recogniser keeps only the most promising partial hypotheses at each step.' },
    { year: '1985', icon: '🌡️', era: 0, sec: 4, title: 'Temperature', text: 'David Ackley, Geoffrey Hinton and Terrence Sejnowski use a temperature to control randomness in Boltzmann machines.' },
    { year: '2014', icon: '🔀', era: 1, sec: 7, title: 'Beam search for neural translation', text: 'Sequence-to-sequence translators decode with small beams to find high-probability translations.' },
    { year: '2018', icon: '🔝', era: 1, sec: 5, title: 'Top-k sampling', text: 'Angela Fan, Mike Lewis and Yann Dauphin sample stories only from the k most likely next words.' },
    { year: '2019', icon: '🔁', era: 1, sec: 6, title: 'Repetition traps', text: 'GPT-2’s greedy and beam-search outputs often loop, repeating the same phrase.' },
    { year: '2020', icon: '🥜', era: 1, sec: 5, title: 'Nucleus sampling', text: 'Ari Holtzman and colleagues sample from the smallest set of words covering a chosen share of the probability.' },
    { year: '2023', icon: '🗳️', era: 2, sec: 8, title: 'Self-consistency', text: 'Xuezhi Wang and colleagues sample many reasoning paths and take a majority vote on the final answer.' },
    { year: '2023', icon: '⏩', era: 2, sec: 8, title: 'Speculative decoding', text: 'Yaniv Leviathan, Matan Kalman and Yossi Matias speed up generation with a small model that drafts tokens for a large one to check.' }
  ];

  FIG['fig-lm4-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1948 to 2023');
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

  var LM_PART = 4;
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
     Figure: temperature, top-k and top-p
     ----------------------------------------------------------------------- */
  var NEXT = [['Canberra', 9.0], ['Sydney', 7.4], ['a', 6.0], ['located', 5.5], ['Melbourne', 5.2], ['the', 5.0], ['not', 4.0], ['home', 3.8], ['one', 3.5], ['Perth', 3.0]];
  function decodeDist(logits, T, k, p) {
    var probs = softmaxT(logits, T), order = probs.map(function (v, i) { return i; }).sort(function (a, b) { return probs[b] - probs[a]; }), keep = {}, cum = 0;
    for (var r = 0; r < order.length; r++) { var i = order[r]; if (r >= k) break; if (cum >= p) break; keep[i] = true; cum += probs[i]; }
    var Z = 0; order.forEach(function (i) { if (keep[i]) Z += probs[i]; });
    return { raw: probs, fin: probs.map(function (v, i) { return keep[i] ? v / Z : 0; }), kept: Object.keys(keep).length };
  }
  FIG['fig-lm-temp'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 1, K = 10, P = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'tp-t', label: 'Temperature', min: 0.1, max: 2, step: 0.1, value: T, onChange: function (x) { T = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'tp-k', label: 'Top-k (keep the k most likely)', min: 1, max: 10, step: 1, value: K, onChange: function (x) { K = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'tp-p', label: 'Top-p (keep until this share is covered)', min: 0.5, max: 1, step: 0.05, value: P, onChange: function (x) { P = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      valText(s1, fmt(T, 1)); valText(s2, String(K)); valText(s3, fmt(P, 2));
      var D = decodeDist(NEXT.map(function (q) { return q[1]; }), T, K, P), c = C(), A = newSVG(svgWrap, container, NEXT.length * 25 + 46, 'Next-token probabilities after temperature, top-k and top-p'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 92, R = W - 92, Tt = 28;
      txt(svg, 10, 14, W < 520 ? 'grey: after temperature · purple: final' : '“The capital of Australia is …” · grey: after temperature · purple: final, after top-k and top-p', { anchor: 'start', size: fs(10), fill: c.muted });
      NEXT.forEach(function (q, i) { var y = Tt + i * 25, raw = D.raw[i], fin = D.fin[i]; txt(svg, L - 8, y + 15, q[0], { anchor: 'end', size: fs(11), fill: fin ? c.ink2 : c.muted }); el('rect', { x: L, y: y + 3, width: Math.max(1, (R - L) * raw), height: 8, fill: c.muted, opacity: 0.6 }, svg); el('rect', { x: L, y: y + 12, width: Math.max(fin ? 1 : 0, (R - L) * fin), height: 9, fill: '#a21caf', opacity: 0.85 }, svg); txt(svg, L + (R - L) * Math.max(raw, fin) + 6, y + 17, fin ? fmt(fin, 3) : 'removed', { anchor: 'start', size: fs(9), fill: c.muted }); });
      var H = 0; D.fin.forEach(function (v) { if (v > 0) H -= v * Math.log2(v); });
      out.innerHTML = 'Chance of “Canberra”: <strong>' + fmt(D.fin[0], 3) + '</strong>; of “Sydney”: <strong>' + fmt(D.fin[1], 3) + '</strong>. ' + D.kept + ' candidate' + (D.kept > 1 ? 's' : '') + ' kept; uncertainty (entropy) ' + fmt(H, 2) + ' bits.' + NOTE + 'The model’s raw scores (logits, made up for this illustration) are divided by the temperature before the softmax. Low temperature sharpens the distribution towards the top choice; high temperature flattens it, giving wrong answers like “Sydney” a real chance. Top-k keeps only the k most likely tokens; top-p keeps the smallest set whose probabilities add up to p. Both cut off the long tail of unlikely tokens.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: sampling sentences from the toy world
     ----------------------------------------------------------------------- */
  var TRI = null;
  function triModel() {
    if (TRI) return TRI;
    var C1 = ngramCounts(CORPUS.train, 1)[''], C2 = ngramCounts(CORPUS.train, 2), C3 = ngramCounts(CORPUS.train, 3), V = Object.keys(C1), N1 = 0; V.forEach(function (w) { N1 += C1[w]; });
    function dist(a, b) { var d2 = C2[b] || {}, d3 = C3[a + ' ' + b] || {}, t2 = 0, t3 = 0; Object.keys(d2).forEach(function (w) { t2 += d2[w]; }); Object.keys(d3).forEach(function (w) { t3 += d3[w]; }); return V.map(function (w) { return 0.8 * (t3 ? (d3[w] || 0) / t3 : (t2 ? (d2[w] || 0) / t2 : C1[w] / N1)) + 0.17 * (t2 ? (d2[w] || 0) / t2 : C1[w] / N1) + 0.03 * C1[w] / N1; }); }
    TRI = { V: V, dist: dist }; return TRI;
  }
  function sampleSentence(T, r) {
    var M = triModel(), a = '<s>', b = '<s>', out = [], lp = 0;
    while (out.length < 20) {
      var p = M.dist(a, b), w;
      if (T === 0) { var bi = 0; p.forEach(function (v, i) { if (v > p[bi]) bi = i; }); w = bi; }
      else { var q = p.map(function (v) { return Math.pow(v, 1 / T); }), Z = q.reduce(function (s, v) { return s + v; }, 0), u = r() * Z, acc = 0; w = q.length - 1; for (var i = 0; i < q.length; i++) { acc += q[i]; if (u <= acc) { w = i; break; } } }
      lp += Math.log(p[w]); out.push(M.V[w]); a = b; b = M.V[w]; if (M.V[w] === '.') break;
    }
    return { words: out, lp: lp };
  }
  FIG['fig-lm-sample'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var T = 1, seed = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sa-t', label: 'Temperature (0 = always the top word)', min: 0, max: 2, step: 0.1, value: T, onChange: function (x) { T = x; draw(); } });
    var row = group(controls, 'Sample');
    btn('Sample again', row).addEventListener('click', function () { seed++; draw(); });
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-mono);font-size:0.88rem;line-height:1.7;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);';
    out.style.cssText = READ_CSS;
    var TRAIN = {}; CORPUS.train.forEach(function (s) { TRAIN[s.join(' ')] = true; });
    function draw() {
      valText(s1, T === 0 ? '0 (greedy)' : fmt(T, 1));
      var r = rngSeed(seed * 13 + Math.round(T * 10)), S = [], distinct = {}, odd = 0, lpS = 0;
      for (var i = 0; i < 6; i++) { var s = sampleSentence(T, r); S.push(s); distinct[s.words.join(' ')] = 1; }
      var r2 = rngSeed(999 + Math.round(T * 10)), M = 200; for (i = 0; i < M; i++) { var s2 = sampleSentence(T, r2); lpS += s2.lp / s2.words.length; if (!TRAIN[s2.words.join(' ')] && s2.words.length > 0) { var ok = s2.words[s2.words.length - 1] === '.' && s2.words.length <= 14; if (!ok) odd++; } }
      box.innerHTML = S.map(function (s) { return '<div>' + s.words.join(' ').replace(/ \.$/, '.') + ' <span style="color:var(--ink-muted);font-size:0.78rem;">(log-prob ' + fmt(s.lp, 1) + ')</span></div>'; }).join('');
      out.innerHTML = 'Temperature ' + (T === 0 ? '0' : fmt(T, 1)) + ': <strong>' + Object.keys(distinct).length + '</strong> different sentences out of 6; average log-probability per word over 200 samples <strong>' + fmt(lpS / M, 2) + '</strong>; runaway sentences (no full stop within 14 words) <strong>' + Math.round(odd / 2) + '%</strong>.' + NOTE + 'A trigram model of the toy world. At temperature 0 the model always picks the most likely word, so every sample is identical. Around 1, samples are varied and still sensible. At high temperature unlikely words creep in and sentences ramble: the text becomes less probable, word by word, but also less predictable.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: greedy decoding versus beam search
     ----------------------------------------------------------------------- */
  var TREE = { w: '', p: 1, kids: [
    { w: 'very', p: 0.45, kids: [{ w: 'nice', p: 0.30 }, { w: 'cold', p: 0.30 }, { w: 'warm', p: 0.25 }, { w: 'wet', p: 0.15 }] },
    { w: 'sunny', p: 0.40, kids: [{ w: '.', p: 0.85 }, { w: 'and', p: 0.15 }] },
    { w: 'cold', p: 0.15, kids: [{ w: '.', p: 0.60 }, { w: 'and', p: 0.40 }] }] };
  FIG['fig-lm-beam'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var bw = 1;
    var controls = div('fig-controls', container);
    choice(controls, 'Beam width', ['1 (greedy)', '2', '3'], 0, function (i) { bw = i + 1; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A tree of next-word probabilities searched greedily or with a beam'), W = A.W, svg = A.svg, fs = A.fs;
      var step1 = TREE.kids.slice().sort(function (a, b) { return b.p - a.p; }).slice(0, bw), cands = [];
      step1.forEach(function (k) { k.kids.forEach(function (g) { cands.push([k, g, k.p * g.p]); }); });
      cands.sort(function (a, b) { return b[2] - a[2]; }); var best = cands[0];
      var all = []; TREE.kids.forEach(function (k) { k.kids.forEach(function (g) { all.push([k, g, k.p * g.p]); }); }); all.sort(function (a, b) { return b[2] - a[2]; });
      var narrow = W < 520, x0 = narrow ? 6 : 16, x1 = W * (narrow ? 0.3 : 0.36), x2 = W * (narrow ? 0.56 : 0.7), rows = 0; TREE.kids.forEach(function (k) { rows += k.kids.length; });
      var T = 30, rh = (300 - T - 10) / rows, yy = T;
      txt(svg, x0, T + (300 - T) / 2 - 10, '“The weather', { anchor: 'start', size: fs(10), fill: c.ink2 }); txt(svg, x0, T + (300 - T) / 2 + 4, 'today is …”', { anchor: 'start', size: fs(10), fill: c.ink2 });
      TREE.kids.forEach(function (k) {
        var yk = yy + k.kids.length * rh / 2, inBeam = step1.indexOf(k) >= 0;
        el('line', { x1: x0 + (narrow ? 62 : 80), y1: T + (300 - T) / 2 - 3, x2: x1 - 4, y2: yk, stroke: inBeam ? '#a21caf' : c.border, 'stroke-width': inBeam ? 2 : 1 }, svg);
        txt(svg, x1, yk + 4, k.w + ' (' + fmt(k.p, 2) + ')', { anchor: 'start', size: fs(10), fill: inBeam ? c.ink : c.muted, weight: inBeam ? 700 : 400 });
        k.kids.forEach(function (g, gi) { var yg = yy + (gi + 0.5) * rh, isBest = best[0] === k && best[1] === g; el('line', { x1: x1 + (narrow ? 62 : 78), y1: yk, x2: x2 - 4, y2: yg, stroke: isBest ? RED : (inBeam ? '#a21caf' : c.border), 'stroke-width': isBest ? 2.5 : 1, opacity: inBeam ? 1 : 0.5 }, svg); txt(svg, x2, yg + 4, (g.w === '.' ? '(stop)' : g.w) + ' ' + fmt(g.p, 2) + ' → ' + fmt(k.p * g.p, 3), { anchor: 'start', size: fs(10), fill: isBest ? RED : (inBeam ? c.ink2 : c.muted), weight: isBest ? 700 : 400 }); });
        yy += k.kids.length * rh;
      });
      txt(svg, 10, 14, narrow ? 'word probability → whole continuation' : 'numbers: probability of each word, and of the whole two-word continuation', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Beam width ' + bw + ' finds “' + best[0].w + ' ' + (best[1].w === '.' ? '(stop)' : best[1].w) + '” with probability <strong>' + fmt(best[2], 3) + '</strong>. The most probable continuation overall is “' + all[0][0].w + ' ' + (all[0][1].w === '.' ? '(stop)' : all[0][1].w) + '” (' + fmt(all[0][2], 3) + ').' + NOTE + 'Greedy decoding takes the single most likely word at each step: “very” (0.45) beats “sunny” (0.40), but after “very” the probability splits among four adjectives, so the best it can do is 0.135. Beam search keeps the best few partial continuations at each step and finds “sunny (stop)” at 0.34. (Probabilities made up for illustration.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: many samples, majority vote
     ----------------------------------------------------------------------- */
  FIG['fig-lm-vote'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var p = 0.5, m = 3;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'vt-p', label: 'Chance one sample is right', min: 0.2, max: 0.9, step: 0.05, value: p, onChange: function (x) { p = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'vt-m', label: 'Number of different wrong answers', min: 1, max: 6, step: 1, value: m, onChange: function (x) { m = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function voteAcc(k) { var r = rngSeed(4000 + k * 31 + Math.round(p * 100) * 7 + m), ok = 0, N = 4000; for (var t = 0; t < N; t++) { var cnt = new Array(m + 1).fill(0); for (var i = 0; i < k; i++) { var u = r(); if (u < p) cnt[0]++; else cnt[1 + Math.floor((u - p) / (1 - p) * m)]++; } var mx = Math.max.apply(null, cnt), ties = cnt.filter(function (v) { return v === mx; }).length; if (cnt[0] === mx) ok += 1 / ties; } return ok / N; }
    function draw() {
      valText(s1, fmt(p, 2)); valText(s2, String(m));
      var c = C(), A = newSVG(svgWrap, container, 230, 'Accuracy of a majority vote over many samples'), W = A.W, svg = A.svg, fs = A.fs;
      var KS = [1, 3, 5, 7, 9, 15, 25, 40], acc = KS.map(voteAcc);
      var L = 44, R = W - 14, T = 26, B = 186, X = function (i) { return L + i / (KS.length - 1) * (R - L); }, Y = function (v) { return B - v * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      KS.forEach(function (k, i) { txt(svg, X(i), B + 15, String(k), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 30, 'number of samples voted on', { size: fs(10), fill: c.muted });
      el('line', { x1: L, y1: Y(p), x2: R, y2: Y(p), stroke: c.muted, 'stroke-dasharray': '4 3' }, svg);
      var d = ''; acc.forEach(function (v, i) { d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); el('circle', { cx: X(i), cy: Y(v), r: 4, fill: '#a21caf' }, svg); }); el('path', { d: d, fill: 'none', stroke: '#a21caf', 'stroke-width': 2.4 }, svg);
      txt(svg, L, 14, W < 520 ? 'purple: majority vote · dashed: one sample' : 'purple: accuracy of the most common answer · dashed: accuracy of a single sample', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'One sample is right ' + Math.round(p * 100) + '% of the time; a vote over 9 samples is right <strong>' + fmt(acc[4] * 100, 0) + '%</strong>, over 40 samples <strong>' + fmt(acc[7] * 100, 0) + '%</strong>.' + NOTE + 'Each sample reaches the right answer with the chosen probability, and otherwise one of several wrong answers at random. Right answers agree with each other; wrong ones scatter. So the most common answer is right more often than any single sample, provided the right answer is more likely than each individual wrong one. If one wrong answer is very tempting, voting cannot help. (Simulated: 4,000 trials per point.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-lm4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does the softmax do at the end of a language model?', options: ['Chooses the answer', 'Turns the raw scores for every token into probabilities that sum to 1', 'Removes rare words', 'Counts tokens'], answer: 1, explanation: 'One probability per token in the vocabulary.' },
      { question: 'Raising the temperature…', options: ['Makes the model more accurate', 'Flattens the distribution, giving less likely tokens more chance', 'Sharpens the distribution', 'Has no effect'], answer: 1, explanation: 'Figure 3: at high temperature “Sydney” becomes a real possibility.' },
      { question: 'Top-p (nucleus) sampling keeps…', options: ['The top p tokens', 'The smallest set of tokens whose probabilities add up to at least p', 'Tokens with probability above p', 'Every token'], answer: 1, explanation: 'Holtzman and colleagues, 2020.' },
      { question: 'Greedy decoding always chooses…', options: ['A random token', 'The single most likely next token', 'The longest word', 'The least likely token'], answer: 1, explanation: 'It is the same as temperature 0.' },
      { question: 'Why can greedy decoding miss the most probable sentence?', options: ['It is too slow', 'A likely first word can lead to continuations whose probability is split many ways', 'It ignores probabilities', 'It needs more memory'], answer: 1, explanation: 'Figure 5: “very” leads to only 0.135; “sunny .” reaches 0.34.' },
      { question: 'Beam search…', options: ['Samples at random', 'Keeps the few best partial sequences at each step', 'Uses a laser', 'Removes the softmax'], answer: 1, explanation: 'Common in translation, less so for open-ended chat.' },
      { question: 'Why do open-ended texts generated greedily often repeat themselves?', options: ['The model is broken', 'Repeating a phrase makes repeating it again even more likely, a self-reinforcing loop', 'Tokenisers repeat words', 'Random seeds'], answer: 1, explanation: 'Holtzman and colleagues called this neural text degeneration.' },
      { question: 'Self-consistency improves accuracy by…', options: ['Training longer', 'Sampling several answers and choosing the most common one', 'Using temperature 0', 'Shortening the prompt'], answer: 1, explanation: 'Right answers agree; wrong ones scatter.' },
      { question: 'When does majority voting fail to help?', options: ['Never', 'When one particular wrong answer is more likely than the right one', 'When there are many samples', 'When temperature is 1'], answer: 1, explanation: 'Then the vote reliably picks the wrong answer.' },
      { question: 'Speculative decoding is a way to…', options: ['Guess the user’s question', 'Generate faster by letting a small model draft tokens that the large model checks', 'Increase randomness', 'Translate text'], answer: 1, explanation: 'The output distribution of the large model is preserved.' }
    ]);
  };
})();
