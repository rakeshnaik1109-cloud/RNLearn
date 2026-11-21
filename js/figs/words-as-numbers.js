/* ==========================================================================
   RNLearn — Words as Numbers (One Word at a Time, Part 2)
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
    { name: 'Meaning from company', color: '#b45309' },
    { name: 'Vectors and pieces', color: '#1d4ed8' },
    { name: 'Neural word vectors', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1954', icon: '🗺️', era: 0, sec: 5, title: 'The distributional hypothesis', text: 'Zellig Harris argues that words occurring in similar environments tend to have similar meanings.' },
    { year: '1957', icon: '👥', era: 0, sec: 5, title: '“The company it keeps”', text: 'John Rupert Firth: “You shall know a word by the company it keeps.”' },
    { year: '1990', icon: '📐', era: 1, sec: 6, title: 'Latent semantic analysis', text: 'Scott Deerwester and colleagues compress a word–document matrix into a few dimensions that capture topics.' },
    { year: '1994', icon: '🗜️', era: 1, sec: 3, title: 'Byte-pair encoding', text: 'Philip Gage describes byte-pair encoding as a simple data-compression method.' },
    { year: '2003', icon: '🧠', era: 2, sec: 7, title: 'Neural language model', text: 'Yoshua Bengio and colleagues learn a vector for each word while predicting the next one.' },
    { year: '2013', icon: '👑', era: 2, sec: 6, title: 'word2vec', text: 'Tomas Mikolov and colleagues train word vectors quickly on billions of words; analogies emerge as vector arithmetic.' },
    { year: '2014', icon: '🧤', era: 2, sec: 6, title: 'GloVe', text: 'Jeffrey Pennington, Richard Socher and Christopher Manning derive word vectors from global co-occurrence counts.' },
    { year: '2016', icon: '✂️', era: 1, sec: 3, title: 'Subword units', text: 'Rico Sennrich, Barry Haddow and Alexandra Birch use byte-pair encoding to split rare words into pieces for translation.' },
    { year: '2018', icon: '🧩', era: 1, sec: 3, title: 'SentencePiece', text: 'Taku Kudo and John Richardson release a tokeniser that works directly on raw text in any language.' }
  ];

  FIG['fig-lm2-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1954 to 2018');
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

  var LM_PART = 2;
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
     Tokens, distributional vectors and a neural bigram model
     ----------------------------------------------------------------------- */
  var VOCAB = (function () { var V = vocabOf(CORPUS.train), w = Object.keys(V).sort(function (a, b) { return V[b] - V[a] || (a < b ? -1 : 1); }); return w; })();
  var WIDX = {}; VOCAB.forEach(function (w, i) { WIDX[w] = i; });
  var CAT = function (w) { for (var k in LEX) if (LEX[k].indexOf(w) >= 0) return k; return 'other'; };
  var CAT_COL = { animal: '#d97706', person: '#2563eb', food: '#16a34a', drink: '#0891b2', place: '#7c3aed', adj: '#db2777', other: '#64748b' };
  /* Byte-pair encoding on the words of the training text */
  function bpeTrain(nMerges) {
    var freq = {}; CORPUS.train.forEach(function (s) { s.forEach(function (w) { if (w !== '.') freq[w] = (freq[w] || 0) + 1; }); });
    var words = Object.keys(freq).map(function (w) { return { sym: w.split('').concat(['_']), f: freq[w] }; }), merges = [];
    for (var m = 0; m < nMerges; m++) {
      var pc = {}; words.forEach(function (o) { for (var i = 0; i + 1 < o.sym.length; i++) { var k = o.sym[i] + '\u0001' + o.sym[i + 1]; pc[k] = (pc[k] || 0) + o.f; } });
      var best = null, bc = 0; Object.keys(pc).sort().forEach(function (k) { if (pc[k] > bc) { bc = pc[k]; best = k; } });
      if (!best) break; var ab = best.split('\u0001'); merges.push([ab[0], ab[1], bc]);
      words.forEach(function (o) { var out = []; for (var i = 0; i < o.sym.length; i++) { if (i + 1 < o.sym.length && o.sym[i] === ab[0] && o.sym[i + 1] === ab[1]) { out.push(ab[0] + ab[1]); i++; } else out.push(o.sym[i]); } o.sym = out; });
    }
    return merges;
  }
  function bpeApply(word, merges) { var sym = word.split('').concat(['_']); merges.forEach(function (mg) { var out = []; for (var i = 0; i < sym.length; i++) { if (i + 1 < sym.length && sym[i] === mg[0] && sym[i + 1] === mg[1]) { out.push(mg[0] + mg[1]); i++; } else out.push(sym[i]); } sym = out; }); return sym; }
  /* Context counts: for each word, how often each word appears 2 before, 1 before, 1 after, 2 after it */
  var OFFS = [-2, -1, 1, 2], OFF_NAMES = ['2 before', '1 before', '1 after', '2 after'];
  function contextMatrix() {
    var V = VOCAB.length, M = VOCAB.map(function () { return new Array(4 * V).fill(0); });
    CORPUS.train.forEach(function (s) { for (var a = 0; a < s.length; a++) OFFS.forEach(function (o, oi) { var b = a + o; if (b >= 0 && b < s.length) M[WIDX[s[a]]][oi * V + WIDX[s[b]]]++; }); });
    return M;
  }
  /* Positive pointwise mutual information, with context-frequency smoothing (power 0.75) */
  function ppmi(M) { var tot = 0, rs = M.map(function () { return 0; }), cs = new Array(M[0].length).fill(0); M.forEach(function (r, i) { r.forEach(function (v, j) { tot += v; rs[i] += v; cs[j] += v; }); }); return M.map(function (r, i) { return r.map(function (v, j) { return v ? Math.max(0, Math.log(v * tot / (rs[i] * Math.pow(cs[j], 0.75) * Math.pow(tot, 0.25)))) : 0; }); }); }
  /* Symmetric eigen-decomposition by Jacobi rotations */
  function jacobiEig(A0) {
    var n = A0.length, A = A0.map(function (r) { return r.slice(); }), Vv = [], i, j, k, it;
    for (i = 0; i < n; i++) { Vv.push(new Array(n).fill(0)); Vv[i][i] = 1; }
    for (it = 0; it < 60; it++) {
      var off = 0; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) off += A[i][j] * A[i][j]; if (off < 1e-18) break;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-14) continue;
        var th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (k = 0; k < n; k++) { var akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (k = 0; k < n; k++) { var apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (k = 0; k < n; k++) { var vkp = Vv[k][p], vkq = Vv[k][q]; Vv[k][p] = c * vkp - s * vkq; Vv[k][q] = s * vkp + c * vkq; }
      }
    }
    var ord = []; for (i = 0; i < n; i++) ord.push(i); ord.sort(function (a, b) { return A[b][b] - A[a][a]; });
    return { vals: ord.map(function (i) { return A[i][i]; }), vecs: ord.map(function (i) { return Vv.map(function (r) { return r[i]; }); }) };
  }
  var EMB = null, PPMI = null;
  function ppmiRows() { if (!PPMI) PPMI = ppmi(contextMatrix()); return PPMI; }
  /* Embeddings: the top k directions of the PPMI rows (a truncated SVD via the Gram matrix) */
  function embeddings(k) {
    if (!EMB) { var P = ppmiRows(), G = P.map(function (a) { return P.map(function (b2) { var t = 0; for (var i = 0; i < a.length; i++) t += a[i] * b2[i]; return t; }); }); EMB = jacobiEig(G); }
    return VOCAB.map(function (w, i) { var v = []; for (var j = 0; j < k; j++) v.push(EMB.vecs[j][i] * Math.pow(Math.max(0, EMB.vals[j]), 0.25)); return v; });
  }
  /* A 2-D picture of k-dimensional embeddings: unit-length vectors projected on their top two principal directions */
  function project2(E) { var U = E.map(function (v) { var n = Math.sqrt(v.reduce(function (a, x) { return a + x * x; }, 0)) || 1; return v.map(function (x) { return x / n; }); }), k = U[0].length, mu = new Array(k).fill(0); U.forEach(function (v) { v.forEach(function (x, j) { mu[j] += x / U.length; }); }); var Cv = []; for (var a = 0; a < k; a++) { Cv.push([]); for (var b = 0; b < k; b++) { var t = 0; U.forEach(function (v) { t += (v[a] - mu[a]) * (v[b] - mu[b]); }); Cv[a].push(t); } } var Eg = jacobiEig(Cv); return U.map(function (v) { return [0, 1].map(function (c) { var t = 0; for (var j = 0; j < k; j++) t += (v[j] - mu[j]) * Eg.vecs[c][j]; return t; }); }); }
  function cosine(a, b) { var s = 0, na = 0, nb = 0; for (var i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return s / Math.sqrt(na * nb + 1e-12); }
  /* A neural bigram model: embed the previous word, then a softmax over the vocabulary */
  function neuralBigram(d, seed) {
    var V = VOCAB.length, r = rngSeed(seed || 3), E = [], U = [], b = new Array(V).fill(0), i, j, k;
    for (i = 0; i < V; i++) { E.push([]); for (k = 0; k < d; k++) E[i].push(0.3 * gaussR(r)); }
    for (k = 0; k < d; k++) { U.push([]); for (j = 0; j < V; j++) U[k].push(0.3 * gaussR(r)); }
    var C = ngramCounts(CORPUS.train, 2), pairs = [], N = 0; Object.keys(C).forEach(function (a) { if (WIDX[a] === undefined) return; Object.keys(C[a]).forEach(function (w) { pairs.push([WIDX[a], WIDX[w], C[a][w]]); N += C[a][w]; }); });
    var mE = E.map(function (r2) { return r2.map(function () { return 0; }); }), vE = mE.map(function (r2) { return r2.slice(); }), mU = U.map(function (r2) { return r2.map(function () { return 0; }); }), vU = mU.map(function (r2) { return r2.slice(); }), mb = b.slice(), vb = b.slice(), t = 0;
    function logits(a) { var z = b.slice(); for (var kk = 0; kk < d; kk++) { var e = E[a][kk]; if (!e) continue; for (var jj = 0; jj < V; jj++) z[jj] += e * U[kk][jj]; } return z; }
    function probs(a) { return softmaxT(logits(a), 1); }
    function step(lr, wd) {
      var gE = E.map(function (r2) { return r2.map(function () { return 0; }); }), gU = U.map(function (r2) { return r2.map(function () { return 0; }); }), gb = new Array(V).fill(0), byPrev = {}, loss = 0;
      pairs.forEach(function (p) { (byPrev[p[0]] = byPrev[p[0]] || []).push(p); });
      Object.keys(byPrev).forEach(function (a) { a = +a; var ps = byPrev[a], cnt = 0; ps.forEach(function (p) { cnt += p[2]; }); var q = probs(a), dz = q.map(function (v) { return v * cnt / N; }); ps.forEach(function (p) { dz[p[1]] -= p[2] / N; loss -= p[2] * Math.log(q[p[1]] + 1e-12) / N; });
        for (var jj = 0; jj < V; jj++) { gb[jj] += dz[jj]; for (var kk = 0; kk < d; kk++) { gU[kk][jj] += E[a][kk] * dz[jj]; gE[a][kk] += U[kk][jj] * dz[jj]; } } });
      t++; var c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
      function upd(P2, G, M2, V2, decay) { for (var x = 0; x < P2.length; x++) for (var y = 0; y < P2[x].length; y++) { var g = G[x][y] + decay * P2[x][y]; M2[x][y] = 0.9 * M2[x][y] + 0.1 * g; V2[x][y] = 0.999 * V2[x][y] + 0.001 * g * g; P2[x][y] -= lr * (M2[x][y] / c1) / (Math.sqrt(V2[x][y] / c2) + 1e-8); } }
      upd(E, gE, mE, vE, wd); upd(U, gU, mU, vU, wd); upd([b], [gb], [mb], [vb], 0);
      return loss;
    }
    return { step: step, probs: probs, steps: function () { return t; }, E: E };
  }

  /* -----------------------------------------------------------------------
     Figure: byte-pair encoding
     ----------------------------------------------------------------------- */
  FIG['fig-lm-bpe'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var nm = 30, ALL = bpeTrain(120);
    var SENT = 'the hungry teacher gives the cheese to the horse', NEW = ['hungriest', 'teachers', 'catnap', 'horseshoe'];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'bp-n', label: 'Number of merges learned', min: 0, max: 120, step: 5, value: nm, onChange: function (x) { nm = x; draw(); } });
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-mono);font-size:0.88rem;line-height:2.1;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);';
    out.style.cssText = READ_CSS;
    var COLS = ['#a21caf', '#2563eb', '#16a34a', '#d97706', '#0891b2', '#db2777'];
    function chips(toks) { return toks.map(function (t, i) { return '<span style="display:inline-block;margin:0 2px 2px 0;padding:0 5px;border-radius:4px;background:' + COLS[i % COLS.length] + '22;border:1px solid ' + COLS[i % COLS.length] + '66;">' + t.replace(/_/g, '▁') + '</span>'; }).join(''); }
    function draw() {
      valText(s1, String(nm));
      var M = ALL.slice(0, nm), symbols = {};
      var all = 0, words = 0; CORPUS.train.forEach(function (s) { s.forEach(function (w) { if (w === '.') return; var t = bpeApply(w, M); all += t.length; words++; t.forEach(function (x) { symbols[x] = 1; }); }); });
      var st = SENT.split(' ').map(function (w) { return bpeApply(w, M); }), stc = st.reduce(function (a, t) { return a + t.length; }, 0);
      box.innerHTML = '<div style="color:var(--ink-muted);font-family:var(--font-sans);font-size:0.8rem;">Known sentence (' + stc + ' tokens):</div>' + st.map(chips).join(' &nbsp; ') +
        '<div style="color:var(--ink-muted);font-family:var(--font-sans);font-size:0.8rem;margin-top:0.4rem;">Words never seen in training:</div>' + NEW.map(function (w) { return chips(bpeApply(w, M)); }).join(' &nbsp; ') +
        '<div style="color:var(--ink-muted);font-family:var(--font-sans);font-size:0.8rem;margin-top:0.4rem;">Latest merges:</div>' + (nm ? M.slice(-6).map(function (m) { return '<span style="margin-right:0.8rem;">' + m[0].replace(/_/g, '▁') + ' + ' + m[1].replace(/_/g, '▁') + ' → ' + (m[0] + m[1]).replace(/_/g, '▁') + '</span>'; }).join('') : '(none yet: every character is its own token)');
      out.innerHTML = 'After <strong>' + nm + '</strong> merges, the training words use <strong>' + Object.keys(symbols).length + '</strong> different tokens, about <strong>' + fmt(all / words, 2) + '</strong> tokens per word.' + NOTE + 'Byte-pair encoding starts from single characters (▁ marks the end of a word) and repeatedly merges the most frequent adjacent pair into a new token. Common words soon become single tokens; rare and new words are still spelled out from smaller pieces, so nothing is ever “unknown”. Real tokenisers learn tens of thousands of merges from huge text collections.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: words known by their company
     ----------------------------------------------------------------------- */
  FIG['fig-lm-context'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var PAIRS = [['cat', 'dog'], ['cat', 'horse'], ['milk', 'water'], ['park', 'field'], ['cat', 'tea'], ['eats', 'drinks']], pi = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Compare', PAIRS.map(function (p) { return p[0] + ' / ' + p[1]; }), pi, function (i) { pi = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var CM = contextMatrix(), P = ppmiRows(), V = VOCAB.length;
    function draw() {
      var a = WIDX[PAIRS[pi][0]], b = WIDX[PAIRS[pi][1]], ra = CM[a], rb = CM[b], sa = ra.reduce(function (x, y) { return x + y; }, 0), sb = rb.reduce(function (x, y) { return x + y; }, 0);
      var idx = []; for (var j = 0; j < 4 * V; j++) if (ra[j] || rb[j]) idx.push(j);
      idx.sort(function (x, y) { return (rb[y] / sb + ra[y] / sa) - (rb[x] / sb + ra[x] / sa); }); idx = idx.slice(0, 12);
      var c = C(), A = newSVG(svgWrap, container, idx.length * 24 + 50, 'Context profiles of two words'), W = A.W, svg = A.svg, fs = A.fs;
      var L = W < 520 ? 120 : 160, R = W - 14, mid = (L + R) / 2, T = 30, mx = 0; idx.forEach(function (j) { mx = Math.max(mx, ra[j] / sa, rb[j] / sb); });
      txt(svg, mid - 6, 16, '“' + PAIRS[pi][0] + '”', { anchor: 'end', size: fs(11), fill: '#a21caf', weight: 700 }); txt(svg, mid + 6, 16, '“' + PAIRS[pi][1] + '”', { anchor: 'start', size: fs(11), fill: '#2563eb', weight: 700 });
      idx.forEach(function (j, k) { var y = T + k * 24, off = Math.floor(j / V), w = VOCAB[j % V]; txt(svg, L - 8, y + 15, (w === '.' ? '(stop)' : w) + ', ' + OFF_NAMES[off], { anchor: 'end', size: fs(9), fill: c.ink2 }); el('rect', { x: mid - (mid - L - 4) * (ra[j] / sa) / mx, y: y + 4, width: (mid - L - 4) * (ra[j] / sa) / mx, height: 15, fill: '#a21caf', opacity: 0.8 }, svg); el('rect', { x: mid, y: y + 4, width: (R - mid) * (rb[j] / sb) / mx, height: 15, fill: '#2563eb', opacity: 0.8 }, svg); });
      el('line', { x1: mid, y1: T, x2: mid, y2: T + idx.length * 24, stroke: c.muted }, svg);
      var cs = cosine(P[a], P[b]);
      out.innerHTML = 'Similarity of the two context profiles (cosine of their PPMI vectors): <strong>' + fmt(cs, 2) + '</strong> (1 = identical company, 0 = nothing in common).' + NOTE + 'Each bar shows how often a neighbouring word appears at a given position, as a share of all the word’s neighbours. Words that keep the same company, such as “milk” and “water”, have nearly identical profiles, though the model has never been told what either means. This is the <em>distributional hypothesis</em>: meaning shows in usage.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a map of word vectors
     ----------------------------------------------------------------------- */
  FIG['fig-lm-embed'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sel = WIDX['horse'], E = embeddings(8), P2 = project2(E);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 340 : 380, 'Word vectors projected onto two dimensions'), W = A.W, svg = A.svg, fs = A.fs;
      var xs = P2.map(function (p) { return p[0]; }), ys = P2.map(function (p) { return p[1]; }), xl = Math.min.apply(null, xs) - 0.15, xh = Math.max.apply(null, xs) + 0.15, yl = Math.min.apply(null, ys) - 0.12, yh = Math.max.apply(null, ys) + 0.12;
      var L = 14, R = W - 14, T = 30, B = (narrow ? 340 : 380) - 14, X = function (v) { return L + (v - xl) / (xh - xl) * (R - L); }, Y = function (v) { return B - (v - yl) / (yh - yl) * (B - T); };
      el('rect', { x: L, y: T, width: R - L, height: B - T, fill: c.surface, stroke: c.border }, svg);
      var sims = E.map(function (v) { return cosine(v, E[sel]); });
      var nb = VOCAB.map(function (w, i) { return [i, sims[i]]; }).filter(function (q) { return q[0] !== sel; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 4);
      nb.forEach(function (q) { el('line', { x1: X(P2[sel][0]), y1: Y(P2[sel][1]), x2: X(P2[q[0]][0]), y2: Y(P2[q[0]][1]), stroke: c.muted, 'stroke-dasharray': '3 3' }, svg); });
      /* merge labels of words that sit on top of each other */
      var groups = [];
      VOCAB.forEach(function (w, i) { var x = X(P2[i][0]), y = Y(P2[i][1]), g0 = null; groups.forEach(function (g) { if (Math.abs(g.x - x) < 16 && Math.abs(g.y - y) < 16) g0 = g; }); if (g0) g0.items.push(i); else groups.push({ x: x, y: y, items: [i] }); });
      var placed = [];
      groups.forEach(function (gr) {
        var x = gr.x, y = gr.y, hasSel = gr.items.indexOf(sel) >= 0, col = CAT_COL[CAT(VOCAB[gr.items[0]])];
        gr.items.forEach(function (i) { var g = el('g', { tabindex: 0, role: 'button', 'aria-label': VOCAB[i], style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r: i === sel ? 7 : 5, fill: col, stroke: i === sel ? c.ink : '#fff', 'stroke-width': i === sel ? 2 : 1 }, g); (function (n) { g.addEventListener('click', function () { sel = n; draw(); }); keyClick(g, function () { sel = n; draw(); }); })(i); });
        var label = gr.items.map(function (i) { return VOCAB[i] === '.' ? '(stop)' : VOCAB[i]; }).join(' · '), lw = label.length * 5.2;
        var dy = -9, tries = 0; while (tries < 8 && placed.some(function (p) { return Math.abs(p[0] - x) < (p[2] + lw) / 2 + 4 && Math.abs(p[1] - (y + dy)) < 11; })) { dy = (tries % 2 ? -1 : 1) * 13 * (Math.floor(tries / 2) + 1) + (tries % 2 ? -9 : 4); tries++; }
        placed.push([x, y + dy, lw]);
        var lx = Math.max(L + lw / 2 + 2, Math.min(R - lw / 2 - 2, x));
        var t = txt(svg, lx, y + dy, label, { size: fs(9), fill: c.ink2, weight: hasSel ? 700 : 400 });
        if (gr.items.length > 1) { t.style.cursor = 'pointer'; }
      });
      txt(svg, L, 16, narrow ? 'tap a word · orange animals · blue people · green foods · teal drinks · purple places' : 'tap a word to see its nearest neighbours · orange: animals · blue: people · green: foods · teal: drinks · purple: places · pink: adjectives', { anchor: 'start', size: fs(narrow ? 8 : 10), fill: c.muted });
      out.innerHTML = 'Nearest neighbours of <strong>“' + VOCAB[sel] + '”</strong> (cosine similarity of 8-number vectors): ' + nb.map(function (q) { return '“' + VOCAB[q[0]] + '” ' + fmt(q[1], 2); }).join(', ') + '.' + NOTE + 'Every word is now a list of 8 numbers, computed only from which words appear around it. Words of the same kind end up close together; the map flattens the 8 dimensions onto 2, so some distances are distorted. Nothing in the text says which words are animals or foods: the groups emerge from usage alone.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a neural bigram model generalises
     ----------------------------------------------------------------------- */
  FIG['fig-lm-neural'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DS = [2, 4, 8], di = 0, MAX = 400, net, running = false;
    var C2 = ngramCounts(CORPUS.train, 2), V = VOCAB.length;
    function countProbs(w) { var d = C2[w] || {}, t = 0; Object.keys(d).forEach(function (q) { t += d[q]; }); return VOCAB.map(function (u) { return ((d[u] || 0) + 0.01) / (t + 0.01 * V); }); }
    function reset() { net = neuralBigram(DS[di], 3); running = false; bRun.textContent = 'Train'; draw(); }
    var controls = div('fig-controls', container);
    choice(controls, 'Numbers per word vector', DS.map(String), di, function (i) { di = i; reset(); });
    var row = group(controls, 'Training');
    var bRun = btn('Train', row); bRun.addEventListener('click', function () { if (net.steps() >= MAX) reset(); running = !running; bRun.textContent = running ? 'Pause' : 'Train'; });
    btn('All 400 steps', row).addEventListener('click', function () { while (net.steps() < MAX) net.step(0.05, 0); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var SHOW = ['eats', 'drinks', 'sleeps', 'runs', 'plays', '.'];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, SHOW.length * 30 + 50, 'Next-word probabilities after “horse” from counts and from a neural model'), W = A.W, svg = A.svg, fs = A.fs;
      var pc = countProbs('horse'), pn = net.probs(WIDX['horse']), L = 90, R = W - 60, T = 30, mx = 0.5;
      txt(svg, 10, 14, W < 520 ? 'after “horse”: grey counts · purple neural' : 'after “… the horse”: grey = counts (smoothed), purple = neural model', { anchor: 'start', size: fs(10), fill: c.muted });
      SHOW.forEach(function (w, k) { var y = T + k * 30, a = pc[WIDX[w]], b = pn[WIDX[w]]; txt(svg, L - 8, y + 17, w === '.' ? '(stop)' : w, { anchor: 'end', size: fs(11), fill: w === 'drinks' ? c.ink : c.ink2, weight: w === 'drinks' ? 700 : 400 }); el('rect', { x: L, y: y + 3, width: Math.max(1, (R - L) * Math.min(a, mx) / mx), height: 11, fill: c.muted, opacity: 0.7 }, svg); el('rect', { x: L, y: y + 15, width: Math.max(1, (R - L) * Math.min(b, mx) / mx), height: 11, fill: '#a21caf', opacity: 0.85 }, svg); txt(svg, L + (R - L) * Math.min(Math.max(a, b), mx) / mx + 6, y + 18, fmt(a, 3) + ' / ' + fmt(b, 3), { anchor: 'start', size: fs(9), fill: c.muted }); });
      out.innerHTML = 'Step <strong>' + net.steps() + '</strong>: P(drinks | horse) from counts <strong>' + fmt(pc[WIDX['drinks']], 4) + '</strong>, from the neural model <strong>' + fmt(pn[WIDX['drinks']], 4) + '</strong>.' + NOTE + 'In the training text horses never drink, but cats, dogs and birds do. The neural model represents each word by a short vector and predicts the next word from it. Squeezed into 2 numbers, “horse” must share its vector with the other animals, so it inherits their habits and “the horse drinks” becomes plausible. With 8 numbers there is room to memorise that exception. Generalising and memorising pull against each other, in this toy and in real models.</span>';
    }
    reset();
    window.addEventListener('resize', draw);
    onTheme(draw);
    FIG.animate(figEl, function () { if (!running) return; for (var k = 0; k < 10 && net.steps() < MAX; k++) net.step(0.05, 0); if (net.steps() >= MAX) { running = false; bRun.textContent = 'Train'; } draw(); });
  };

  FIG['fig-quiz-lm2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is a token?', options: ['A password', 'A unit of text, often a word or a piece of a word, that the model reads and writes', 'A sentence', 'A letter only'], answer: 1, explanation: 'Models predict the next token, not literally the next word.' },
      { question: 'Byte-pair encoding builds its vocabulary by…', options: ['Listing a dictionary', 'Repeatedly merging the most frequent adjacent pair of symbols', 'Splitting at every vowel', 'Random choice'], answer: 1, explanation: 'Figure 3 shows the merges as they are learned.' },
      { question: 'Why do subword tokens help with unseen words?', options: ['They ignore them', 'An unseen word can still be spelled from known pieces', 'They translate them', 'They delete rare words'], answer: 1, explanation: '“hungriest” becomes known pieces plus a few characters.' },
      { question: 'The distributional hypothesis says that…', options: ['Words are distributed randomly', 'Words used in similar contexts tend to have similar meanings', 'Every word has one meaning', 'Long words are rare'], answer: 1, explanation: 'Harris, 1954; Firth, 1957: “the company it keeps”.' },
      { question: 'A word embedding is…', options: ['A picture of the word', 'A list of numbers representing a word, learned so that similar words get similar lists', 'A dictionary definition', 'The word’s frequency'], answer: 1, explanation: 'In Figure 5 each word has 8 numbers.' },
      { question: 'Cosine similarity between two vectors measures…', options: ['Their length', 'How closely they point in the same direction', 'Their difference in size', 'Nothing useful'], answer: 1, explanation: '1 means the same direction, 0 unrelated.' },
      { question: 'Why can a neural model assign probability to “the horse drinks” when counts give zero?', options: ['It looked it up', 'Horse’s vector resembles those of other animals, which do drink', 'It ignores the counts', 'It uses a bigger corpus'], answer: 1, explanation: 'Similar vectors produce similar predictions.' },
      { question: 'What happens when the word vectors are given much more room (more numbers)?', options: ['Nothing', 'The model can memorise exceptions instead of sharing patterns', 'It stops working', 'It becomes a count model'], answer: 1, explanation: 'Figure 6: with 8 numbers the horse’s exception is memorised.' },
      { question: 'word2vec (2013) showed that word vectors can…', options: ['Replace grammar', 'Capture analogies such as king − man + woman ≈ queen', 'Translate any language', 'Remove bias'], answer: 1, explanation: 'Vector differences encode relationships.' },
      { question: 'Why can the same text cost different numbers of tokens in different languages?', options: ['It cannot', 'Tokenisers are trained mostly on some languages, so others are split into more pieces', 'Some languages have no words', 'Because of punctuation'], answer: 1, explanation: 'Petrov and colleagues found differences of more than ten times.' }
    ]);
  };
})();
