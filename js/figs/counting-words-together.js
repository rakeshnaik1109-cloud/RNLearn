/* ==========================================================================
   RNLearn — Counting Words Together (One Word at a Time, Part 1)
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
    { name: 'Chains and information', color: '#b45309' },
    { name: 'Statistical language models', color: '#1d4ed8' },
    { name: 'Towards neural models', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1913', icon: '🔗', era: 0, sec: 3, title: 'Markov counts letters', text: 'Andrey Markov tallies how vowels and consonants follow each other in Pushkin’s <em>Eugene Onegin</em>, founding the theory of Markov chains.' },
    { year: '1948', icon: '📡', era: 0, sec: 5, title: 'Shannon’s n-grams', text: 'Claude Shannon generates increasingly English-like text from letter and word statistics, and defines entropy.' },
    { year: '1951', icon: '🎯', era: 0, sec: 3, title: 'The guessing game', text: 'Shannon asks people to guess text letter by letter and estimates how predictable English is.' },
    { year: '1976', icon: '🎙️', era: 1, sec: 7, title: 'Statistical speech recognition', text: 'Frederick Jelinek’s group at IBM recognises speech by combining acoustic models with n-gram language models.' },
    { year: '1987', icon: '↩️', era: 1, sec: 7, title: 'Back-off', text: 'Slava Katz backs off to shorter contexts when a longer one has never been seen.' },
    { year: '1995', icon: '🧮', era: 1, sec: 7, title: 'Kneser–Ney smoothing', text: 'Reinhard Kneser and Hermann Ney’s smoothing method becomes the strongest classic n-gram technique.' },
    { year: '2003', icon: '🧠', era: 2, sec: 8, title: 'Neural language model', text: 'Yoshua Bengio and colleagues predict the next word with a neural network and learned word vectors (Part 2).' },
    { year: '2007', icon: '📚', era: 2, sec: 6, title: '“Large language models”', text: 'Thorsten Brants and colleagues at Google train n-gram models on up to 2 trillion words for machine translation.' }
  ];

  FIG['fig-lm1-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1913 to 2007');
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

  var LM_PART = 1;
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
     Figure: next-word probabilities from counts
     ----------------------------------------------------------------------- */
  FIG['fig-lm-next'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CTX = ['the', 'cat', 'horse', 'eats the', 'cat drinks the', 'sleeps in the'], ci = 3, ni = 1;
    var C2 = ngramCounts(CORPUS.train, 2), C3 = ngramCounts(CORPUS.train, 3), C4 = ngramCounts(CORPUS.train, 4);
    var controls = div('fig-controls', container);
    choice(controls, 'Words so far', CTX.map(function (c) { return '… ' + c; }), ci, function (i) { ci = i; draw(); });
    choice(controls, 'Model looks back', ['1 word (bigram)', '2 words (trigram)', '3 words (4-gram)'], 1, function (i) { ni = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var words = CTX[ci].split(' '), n = ni + 1, ctxW = words.slice(Math.max(0, words.length - n)), ctx = ctxW.join(' '), used = ctxW.length;
      var table = used === 1 ? C2 : used === 2 ? C3 : C4, d = table[ctx] || {}, keys = Object.keys(d), tot = 0;
      keys.forEach(function (k) { tot += d[k]; }); keys.sort(function (a, b) { return d[b] - d[a]; }); keys = keys.slice(0, 10);
      var c = C(), A = newSVG(svgWrap, container, Math.max(1, keys.length) * 26 + 46, 'Next-word probabilities from counts'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 92, R = W - 70, T = 26, mx = keys.length ? d[keys[0]] / tot : 1;
      txt(svg, 10, 14, 'context used: “' + ctx + '” (' + tot + ' times in the training text)', { anchor: 'start', size: fs(10), fill: c.muted });
      keys.forEach(function (k, i) { var p = d[k] / tot, y = T + i * 26; txt(svg, L - 8, y + 16, k === '.' ? '(full stop)' : k, { anchor: 'end', size: fs(11), fill: c.ink2 }); el('rect', { x: L, y: y + 4, width: Math.max(1, (R - L) * p / mx), height: 17, fill: '#a21caf', opacity: 0.8, rx: 2 }, svg); txt(svg, L + (R - L) * p / mx + 6, y + 16, fmt(p, 3) + ' (' + d[k] + ')', { anchor: 'start', size: fs(9), fill: c.muted }); });
      out.innerHTML = 'After “… ' + CTX[ci] + '”, the model looks at the last ' + used + ' word' + (used > 1 ? 's' : '') + ', “' + ctx + '”, and predicts <strong>' + (keys[0] === '.' ? 'a full stop' : '“' + keys[0] + '”') + '</strong> with probability <strong>' + fmt(d[keys[0]] / tot, 2) + '</strong>.' + NOTE + 'Each probability is simply a count divided by a count: how often the next word followed this context in 800 training sentences, divided by how often the context occurred. A longer look-back sharpens the prediction (after “cat drinks the”, only drinks a cat likes remain) but relies on rarer contexts.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: generating text from n-gram counts
     ----------------------------------------------------------------------- */
  FIG['fig-lm-gen'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ni = 1, seed = 1, TABLES = [1, 2, 3, 4, 6].map(function (n) { return ngramCounts(CORPUS.train, n); }), NS = [1, 2, 3, 4, 6];
    var TRAIN = {}; CORPUS.train.forEach(function (s) { TRAIN[s.join(' ')] = true; });
    var controls = div('fig-controls', container);
    choice(controls, 'Context length n', ['1 (no context)', '2', '3', '4', '6'], ni, function (i) { ni = i; draw(); });
    var row = group(controls, 'Sample');
    btn('Generate again', row).addEventListener('click', function () { seed++; draw(); });
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-mono);font-size:0.9rem;line-height:1.7;padding:0.8rem 1rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);';
    out.style.cssText = READ_CSS;
    function draw() {
      var n = NS[ni], C = TABLES[ni], r = rngSeed(seed * 101 + ni), lines = [];
      for (var i = 0; i < 6; i++) { var g = generateNgram(C, n, r, 18), s = g.join(' '); lines.push('<div>' + (TRAIN[s] ? '<span style="color:var(--ink-muted);" title="appears in the training text">⧉</span> ' : '<span style="color:#a21caf;" title="new sentence">✦</span> ') + s.replace(/ \.$/, '.') + '</div>'); }
      var r2 = rngSeed(777 + ni), cp = 0; for (i = 0; i < 300; i++) if (TRAIN[generateNgram(C, n, r2, 18).join(' ')]) cp++;
      box.innerHTML = lines.join('');
      out.innerHTML = 'With n = ' + n + ', <strong>' + Math.round(cp / 3) + '%</strong> of 300 generated sentences are exact copies of a training sentence (⧉); the rest are new (✦).' + NOTE + 'Each word is drawn at random in proportion to how often it followed the previous n − 1 words. With no context the output is word salad; with one word of context it is locally plausible but wanders (“eats the garden”); with longer contexts it becomes fluent, but increasingly by copying what it has seen.</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: running out of data
     ----------------------------------------------------------------------- */
  FIG['fig-lm-sparse'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ntr = 100;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'sp-n', label: 'Training sentences', min: 25, max: 800, step: 25, value: ntr, onChange: function (x) { ntr = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Share of test n-grams never seen in training'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(ntr));
      var tr = CORPUS.train.slice(0, ntr), res = [];
      for (var n = 1; n <= 6; n++) { var Ctr = ngramCounts(tr, n), Cte = ngramCounts(CORPUS.test, n), tot = 0, un = 0; Object.keys(Cte).forEach(function (ctx) { Object.keys(Cte[ctx]).forEach(function (w) { var k = Cte[ctx][w]; tot += k; if (!(Ctr[ctx] && Ctr[ctx][w])) un += k; }); }); res.push(un / tot); }
      var L = 44, R = W - 14, T = 26, B = 186, bw = (R - L) / 6, Y = function (v) { return B - v / 0.5 * (B - T); };
      [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, Math.round(v * 100) + '%', { anchor: 'end', size: fs(9), fill: c.muted }); });
      res.forEach(function (v, i) { el('rect', { x: L + i * bw + bw * 0.2, y: Y(Math.min(v, 0.5)), width: bw * 0.6, height: B - Y(Math.min(v, 0.5)), fill: '#a21caf', opacity: 0.8 }, svg); txt(svg, L + (i + 0.5) * bw, Y(Math.min(v, 0.5)) - 5, fmt(v * 100, 1) + '%', { size: fs(9), fill: c.ink2 }); txt(svg, L + (i + 0.5) * bw, B + 15, (i + 1) + '-gram', { size: fs(9), fill: c.muted }); });
      txt(svg, L, 14, W < 520 ? 'share of test n-grams unseen in training' : 'share of the n-grams in 200 test sentences that never occur in the training sentences', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'With ' + ntr + ' training sentences, <strong>' + fmt(res[2] * 100, 1) + '%</strong> of test trigrams and <strong>' + fmt(res[5] * 100, 1) + '%</strong> of test 6-grams were never seen in training.' + NOTE + 'A count model gives every unseen n-gram a probability of zero, so a single unseen phrase makes a whole sentence “impossible”. Longer contexts and less data make this worse. This toy world has only 39 words and very regular sentences; with a real vocabulary of 50,000 words there are 50,000³ = 1.25 × 10<sup>14</sup> possible trigrams, far more than any text collection contains.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: smoothing and perplexity
     ----------------------------------------------------------------------- */
  FIG['fig-lm-smooth'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NT = [50, 200, 800], ti = 0, lk = -1;
    var V = Object.keys(vocabOf(CORPUS.train)).length;
    function pp(C, k) { var lp = 0, n = 0; CORPUS.test.forEach(function (s) { var w = ['<s>'].concat(s); for (var j = 1; j < w.length; j++) { var d = C[w[j - 1]] || {}, tot = 0; Object.keys(d).forEach(function (q) { tot += d[q]; }); var p = ((d[w[j]] || 0) + k) / (tot + k * V); lp += Math.log(p); n++; } }); return Math.exp(-lp / n); }
    var controls = div('fig-controls', container);
    choice(controls, 'Training sentences', NT.map(String), ti, function (i) { ti = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'sm-k', label: 'Pseudo-count k (log₁₀)', min: -4, max: 1, step: 0.25, value: lk, onChange: function (x) { lk = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Test perplexity of a bigram model as the pseudo-count changes'), W = A.W, svg = A.svg, fs = A.fs;
      var k = Math.pow(10, lk); valText(s1, k < 0.01 ? k.toExponential(0) : fmt(k, k < 1 ? 3 : 1));
      var C2 = ngramCounts(CORPUS.train.slice(0, NT[ti]), 2), curve = [], best = [Infinity, 0];
      for (var e = -4; e <= 1.0001; e += 0.125) { var v = pp(C2, Math.pow(10, e)); curve.push([e, v]); if (v < best[0]) best = [v, e]; }
      var L = 48, R = W - 14, T = 26, B = 186, yl = 0, yh = 25, X = function (e) { return L + (e + 4) / 5 * (R - L); }, Y = function (v) { return B - (Math.min(yh, v) - yl) / (yh - yl) * (B - T); };
      [0, 5, 10, 15, 20, 25].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(9), fill: c.muted }); });
      [-4, -3, -2, -1, 0, 1].forEach(function (e) { var t = txt(svg, X(e), B + 15, '', { size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      txt(svg, (L + R) / 2, B + 32, 'pseudo-count k added to every count', { size: fs(10), fill: c.muted });
      var d = ''; curve.forEach(function (q, i) { d += (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: '#a21caf', 'stroke-width': 2.4 }, svg);
      var cur = pp(C2, k); el('circle', { cx: X(lk), cy: Y(cur), r: 5, fill: RED }, svg);
      txt(svg, L, 14, W < 520 ? 'test perplexity (lower is better)' : 'perplexity on 200 test sentences (lower is better; 39 would be a blind guess among 39 words)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = NT[ti] + ' training sentences, k = ' + (k < 0.01 ? k.toExponential(0) : fmt(k, 3)) + ': test perplexity <strong>' + fmt(cur, 2) + '</strong>. Best k ≈ ' + fmt(Math.pow(10, best[1]), 3) + ', perplexity ' + fmt(best[0], 2) + '.' + NOTE + 'Add-k smoothing pretends every word pair was seen k extra times, so no pair is impossible. Too little and rare pairs are scored near zero; too much and every word becomes equally likely. Perplexity is the model’s average “number of equally likely choices” per word: a perplexity of 4 means the model is as uncertain as if it were picking among 4 words.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-lm1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'At its core, a language model assigns…', options: ['A grammar tree to each sentence', 'A probability to each possible next word, given the words so far', 'A translation', 'A single correct answer'], answer: 1, explanation: 'Everything else, including generating text, is built on these probabilities.' },
      { question: 'In a bigram model, P(next | previous) is estimated as…', options: ['A random number', 'count(previous, next) ÷ count(previous)', 'count(next) ÷ count(all words)', 'Always 1/V'], answer: 1, explanation: 'Figure 3 shows these ratios for the toy world.' },
      { question: 'What does the chain rule let us do?', options: ['Remove rare words', 'Write the probability of a whole sentence as a product of next-word probabilities', 'Speed up counting', 'Translate sentences'], answer: 1, explanation: 'P(w₁…wₙ) = P(w₁) P(w₂|w₁) P(w₃|w₁w₂)…' },
      { question: 'The Markov assumption in an n-gram model is that…', options: ['All words are independent', 'The next word depends only on the previous n − 1 words', 'The next word depends on the whole document', 'Sentences have fixed length'], answer: 1, explanation: 'It is what makes counting feasible, and what limits the model.' },
      { question: 'Why do longer n-grams generate more copied sentences?', options: ['They are trained longer', 'Their contexts are so specific that only the continuation seen in training remains', 'They use more vocabulary', 'Randomness is switched off'], answer: 1, explanation: 'Figure 4: with n = 6, most generated sentences are exact copies.' },
      { question: 'Data sparsity means that…', options: ['The text has many spaces', 'Most possible word sequences never appear in any training text, so counts are zero', 'Words are rare', 'The model is small'], answer: 1, explanation: 'With 50,000 words there are 1.25 × 10¹⁴ possible trigrams.' },
      { question: 'Add-k smoothing…', options: ['Deletes rare words', 'Adds a pseudo-count to every pair so that no continuation has probability zero', 'Averages sentences', 'Doubles the training data'], answer: 1, explanation: 'Kneser–Ney and back-off are smarter versions of the same idea.' },
      { question: 'A perplexity of 4 means the model is, on average, as uncertain as…', options: ['Being wrong 4 times', 'Choosing uniformly among 4 words at each step', 'Using 4-grams', '4% error'], answer: 1, explanation: 'Perplexity = exp(average negative log-probability).' },
      { question: 'Who first used word and letter statistics to generate English-like text?', options: ['Alan Turing', 'Claude Shannon (1948)', 'Noam Chomsky', 'Geoffrey Hinton'], answer: 1, explanation: 'In “A mathematical theory of communication”.' },
      { question: 'What can a count-based model not do?', options: ['Predict common phrases', 'Use the similarity between words like “cat” and “dog” to predict phrases it has never seen', 'Generate text', 'Estimate probabilities'], answer: 1, explanation: 'That is what word vectors, in Part 2, make possible.' }
    ]);
  };
})();
