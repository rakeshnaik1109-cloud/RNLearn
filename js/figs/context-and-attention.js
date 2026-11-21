/* ==========================================================================
   RNLearn — Context and Attention (One Word at a Time, Part 3)
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
    { name: 'Memory through recurrence', color: '#b45309' },
    { name: 'Attention takes over', color: '#1d4ed8' },
    { name: 'Looking inside', color: '#a21caf' }
  ];
  var EVENTS = [
    { year: '1990', icon: '🔁', era: 0, sec: 4, title: 'Simple recurrent networks', text: 'Jeffrey Elman’s networks carry a hidden state from word to word and discover structure in sequences.' },
    { year: '1997', icon: '🧠', era: 0, sec: 4, title: 'LSTM', text: 'Sepp Hochreiter and Jürgen Schmidhuber add a gated memory cell that keeps information over long stretches.' },
    { year: '2014', icon: '🔀', era: 0, sec: 4, title: 'Sequence to sequence', text: 'Ilya Sutskever, Oriol Vinyals and Quoc Le translate by squeezing a whole sentence into one vector.' },
    { year: '2015', icon: '🎯', era: 1, sec: 5, title: 'Attention', text: 'Dzmitry Bahdanau, Kyunghyun Cho and Yoshua Bengio let the translator look back at every source word.' },
    { year: '2016', icon: '🔑', era: 1, sec: 3, title: 'Testing agreement', text: 'Tal Linzen, Emmanuel Dupoux and Yoav Goldberg test whether networks match verbs to distant subjects.' },
    { year: '2017', icon: '⚡', era: 1, sec: 5, title: 'The transformer', text: 'Ashish Vaswani and colleagues build a network from attention alone.' },
    { year: '2018', icon: '📖', era: 1, sec: 8, title: 'GPT', text: 'Alec Radford and colleagues pre-train a transformer to predict the next word on thousands of books.' },
    { year: '2020', icon: '🧪', era: 1, sec: 7, title: 'Learning in context', text: 'GPT-3 performs new tasks from a few examples in its prompt, without any retraining.' },
    { year: '2022', icon: '📋', era: 2, sec: 7, title: 'Induction heads', text: 'Catherine Olsson and colleagues find attention heads that copy patterns from earlier in the context.' },
    { year: '2024', icon: '🕳️', era: 2, sec: 9, title: 'Lost in the middle', text: 'Nelson Liu and colleagues show that models use information at the start and end of a long context better than in the middle.' }
  ];

  FIG['fig-lm3-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1990 to 2024');
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

  var LM_PART = 3;
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
     Figure: long-distance agreement
     ----------------------------------------------------------------------- */
  FIG['fig-lm-agree'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var MODS = ['', 'to the cabinet', 'to the old cabinet', 'to the old wooden cabinet in the hall'], mi = 2, plural = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Subject', ['The key (one)', 'The keys (many)'], 1, function (i) { plural = i === 1; draw(); });
    choice(controls, 'Words in between', ['none', '3 words', '4 words', '8 words'], mi, function (i) { mi = i; draw(); });
    var box = div('', container), out = div('', container);
    box.style.cssText = 'font-family:var(--font-sans);font-size:0.9rem;line-height:1.6;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);overflow-x:auto;';
    out.style.cssText = READ_CSS;
    function draw() {
      var toks = ['The', plural ? 'keys' : 'key'].concat(MODS[mi] ? MODS[mi].split(' ') : []), right = plural ? 'are' : 'is';
      var nounIdx = toks.map(function (w, i) { return ['key', 'keys', 'cabinet', 'hall'].indexOf(w) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      var rows = [['Bigram (sees 1 word)', 1], ['Trigram (sees 2 words)', 2], ['5-gram (sees 4 words)', 4], ['Attention (sees everything)', 99]];
      var html = '';
      rows.forEach(function (r) {
        var start = Math.max(0, toks.length - r[1]), seen = toks.slice(start), nearestNoun = null;
        for (var i = toks.length - 1; i >= start; i--) if (nounIdx.indexOf(i) >= 0) { nearestNoun = i; break; }
        var guess = r[1] === 99 ? right : (nearestNoun === null ? '?' : (toks[nearestNoun] === 'keys' ? 'are' : 'is'));
        var ok = guess === right;
        html += '<div style="margin:0.25rem 0;"><span style="display:inline-block;width:13.5rem;color:var(--ink-secondary);">' + r[0] + '</span>' + toks.map(function (w, i) { var inW = i >= start, isSubj = i === 1; return '<span style="padding:1px 4px;margin-right:2px;border-radius:3px;' + (inW ? 'background:#a21caf22;' : 'color:var(--ink-muted);') + (r[1] === 99 && isSubj ? 'outline:2px solid #a21caf;' : '') + '">' + w + '</span>'; }).join('') + ' → <strong style="color:' + (guess === '?' ? 'var(--ink-muted)' : ok ? '#16a34a' : '#dc2626') + ';">' + (guess === '?' ? 'no clue' : guess) + '</strong></div>';
      });
      box.innerHTML = html;
      out.innerHTML = 'The correct verb is <strong>“' + right + '”</strong>, because the subject is “' + toks[1] + '”.' + NOTE + 'Shaded words are those each model can see when choosing the verb. A short window either misses every noun or sees only “cabinet” or “hall”, an attractor that points to the wrong number. A model that can look back over the whole sentence can find the real subject, however far away. (A simplified illustration: real models weigh all clues, but distance and attractors cause the same kinds of errors.)</span>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure: attention computed step by step
     ----------------------------------------------------------------------- */
  var QK_TOK = ['the', 'hungry', 'cat', 'eats', 'fish'], QK_FEAT = ['noun', 'animate', 'verb', 'adjective'], QK_SHORT = ['noun', 'anim', 'verb', 'adj'];
  var QK_E = [[0, 0, 0, 0], [0, 0, 0, 1], [1, 1, 0, 0], [0, 0, 1, 0], [1, 0, 0, 0]];
  var QK_WQ = [[0, 0, 3, 0], [0, 0, 3, 0], [3, -3, 0, 0], [0, 3, 0, 0]];
  function matVec(M, v) { return M.map(function (r) { return r.reduce(function (s, x, i) { return s + x * v[i]; }, 0); }); }
  FIG['fig-lm-qkv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var qi = 3, causal = true;
    var controls = div('fig-controls', container);
    choice(controls, 'Word doing the looking (query)', QK_TOK, qi, function (i) { qi = i; draw(); });
    choice(controls, 'Causal mask', ['On (only earlier words)', 'Off'], 0, function (i) { causal = i === 0; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 196, 'Attention scores and weights for one query'), W = A.W, svg = A.svg, fs = A.fs;
      var q = matVec(QK_WQ, QK_E[qi]), sc = QK_E.map(function (k, j) { return (causal && j > qi) ? null : q.reduce(function (s, x, i) { return s + x * k[i]; }, 0) / 2; });
      var avail = sc.filter(function (v) { return v !== null; }), m = Math.max.apply(null, avail), ex = sc.map(function (v) { return v === null ? 0 : Math.exp(v - m); }), Z = ex.reduce(function (a, b) { return a + b; }, 0), w = ex.map(function (e) { return e / Z; });
      var outv = [0, 0, 0, 0]; w.forEach(function (a, j) { QK_E[j].forEach(function (x, i) { outv[i] += a * x; }); });
      var L = W < 520 ? 70 : 110, cw = (W - L - 14) / 5, T = 48;
      QK_TOK.forEach(function (t, j) { var x = L + (j + 0.5) * cw; txt(svg, x, T - 12, t, { size: fs(11), fill: j === qi ? '#a21caf' : c.ink2, weight: j === qi ? 700 : 400 }); });
      var rowsL = ['key features', 'score q·k/√d', 'weight'];
      rowsL.forEach(function (r, k) { txt(svg, L - 8, T + 22 + k * 40, r, { anchor: 'end', size: fs(9), fill: c.muted }); });
      QK_TOK.forEach(function (t, j) {
        var x = L + (j + 0.5) * cw, masked = sc[j] === null;
        txt(svg, x, T + 22, QK_E[j].map(function (v, i) { return v ? QK_SHORT[i] : ''; }).filter(Boolean).join('+') || '—', { size: fs(9), fill: masked ? c.border : c.ink2 });
        txt(svg, x, T + 62, masked ? 'masked' : fmt(sc[j], 1), { size: fs(10), fill: masked ? c.muted : c.ink });
        el('rect', { x: x - cw * 0.35, y: T + 80, width: cw * 0.7, height: 22, fill: '#a21caf', opacity: masked ? 0.05 : 0.1 + 0.85 * w[j], rx: 3 }, svg);
        txt(svg, x, T + 96, masked ? '' : fmt(w[j], 2), { size: fs(10), fill: w[j] > 0.5 ? '#fff' : c.ink });
      });
      txt(svg, 10, 14, 'query features of “' + QK_TOK[qi] + '” look for: ' + (q.some(function (v) { return v; }) ? q.map(function (v, i) { return v ? QK_FEAT[i] + ' (' + v + ')' : ''; }).filter(Boolean).join(', ') : 'nothing in particular'), { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, 10, 182, (W < 520 ? 'output: ' : 'output = weighted mix of values: ') + outv.map(function (v, i) { return QK_SHORT[i] + ' ' + fmt(v, 2); }).join(' · '), { anchor: 'start', size: fs(10), fill: c.ink2 });
      var best = w.indexOf(Math.max.apply(null, w));
      out.innerHTML = '“' + QK_TOK[qi] + '” attends most to <strong>“' + QK_TOK[best] + '”</strong> (weight ' + fmt(w[best], 2) + ').' + NOTE + 'Each word has four features. A query matrix turns the looking word’s features into what it is looking for: the verb “eats” looks for an animate noun (its subject), the object “fish” looks for a verb, and “cat” looks for an adjective. Scores are dot products of the query with each word’s key, divided by √4; a softmax turns them into weights, and the output is the weighted mix of the words’ values. With the causal mask on, a word may look only at itself and earlier words. In a real model the matrices are learned, not written by hand.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: attention patterns of different heads
     ----------------------------------------------------------------------- */
  FIG['fig-lm-heads'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var TOK = ['Ziba', 'visits', 'Lumo', 'on', 'Tuesday', '.', 'Ziba', 'visits'], hi = 2, qsel = 7;
    var HEADS = ['Previous word', 'First word (resting place)', 'Induction (copy what came next)'];
    function scores(h, t) { return TOK.map(function (w, j) { if (j > t) return null; if (h === 0) return j === t - 1 ? 4 : 0; if (h === 1) return j === 0 ? 4 : 0; var match = j > 0 && TOK[j - 1] === TOK[t] && j - 1 < t; return match ? 5 : (j === 0 ? 1 : 0); }); }
    function weights(h, t) { var s = scores(h, t), av = s.filter(function (v) { return v !== null; }), m = Math.max.apply(null, av), e = s.map(function (v) { return v === null ? 0 : Math.exp(v - m); }), Z = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (v) { return v / Z; }); }
    var controls = div('fig-controls', container);
    choice(controls, 'Attention head', HEADS, hi, function (i) { hi = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'hd-q', label: 'Position doing the looking', min: 1, max: 7, step: 1, value: qsel, onChange: function (x) { qsel = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), n = TOK.length, cell = Math.min(40, (Math.min(W0(), 520) - 110) / n), A = newSVG(svgWrap, container, Math.round(cell * n + 90), 'Attention pattern of one head'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, qsel + ' (' + TOK[qsel] + ')');
      var L = 80, T = 60;
      TOK.forEach(function (w, j) { var t = txt(svg, L + (j + 0.5) * cell, T - 8, w, { size: fs(9), fill: c.ink2 }); t.setAttribute('transform', 'rotate(-35 ' + (L + (j + 0.5) * cell) + ' ' + (T - 8) + ')'); txt(svg, L - 6, T + (j + 0.5) * cell + 4, w, { anchor: 'end', size: fs(9), fill: j === qsel ? '#a21caf' : c.ink2, weight: j === qsel ? 700 : 400 }); });
      for (var t = 0; t < n; t++) { var wv = weights(hi, t); for (var j = 0; j < n; j++) el('rect', { x: L + j * cell, y: T + t * cell, width: cell - 1, height: cell - 1, fill: j > t ? c.surface : '#a21caf', opacity: j > t ? 1 : 0.06 + 0.9 * wv[j], stroke: t === qsel ? c.ink : 'none', 'stroke-width': t === qsel ? 1 : 0 }, svg); }
      txt(svg, 10, 14, 'rows: word doing the looking · columns: word looked at · darker = more attention · blank = future (masked)', { anchor: 'start', size: fs(W < 520 ? 8 : 10), fill: c.muted });
      var wq = weights(hi, qsel), best = wq.indexOf(Math.max.apply(null, wq)), pred = hi === 2 ? TOK[best] : null;
      out.innerHTML = 'At “' + TOK[qsel] + '” (position ' + qsel + '), this head looks mostly at <strong>“' + TOK[best] + '”</strong> (weight ' + fmt(wq[best], 2) + ')' + (hi === 2 && qsel === 7 ? ', so it can predict that the next word is <strong>“' + pred + '”</strong>, copying what followed “visits” last time.' : '.') + NOTE + ['A previous-word head passes each word information about the word just before it, building up short phrases.', 'Many heads put most of their attention on the first token when nothing else is relevant, a kind of resting place.', 'An induction head finds an earlier occurrence of the current word and attends to the word that followed it. Combined with a previous-word head, this lets a model continue a pattern it has seen only once in its context: the basis of learning from examples in the prompt.'][hi] + ' (Patterns constructed to illustrate kinds of heads found in trained models.)</span>';
    }
    function W0() { return Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the cost of context
     ----------------------------------------------------------------------- */
  FIG['fig-lm-cost'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var MODELS = [['Small (12 layers, width 768)', 12, 768], ['Medium (32 layers, width 4,096)', 32, 4096], ['Large (80 layers, width 8,192)', 80, 8192]], mi = 1, lg = 3.6;
    var controls = div('fig-controls', container);
    choice(controls, 'Model size', MODELS.map(function (m) { return m[0]; }), mi, function (i) { mi = i; draw(); });
    var s1 = FIG.slider(controls, { id: 'cs-n', label: 'Context length (tokens, log₁₀)', min: 2, max: 6, step: 0.1, value: lg, onChange: function (x) { lg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function human(b) { var u = ['bytes', 'KB', 'MB', 'GB', 'TB']; var k = 0; while (b >= 1024 && k < 4) { b /= 1024; k++; } return fmt(b, b < 10 ? 1 : 0) + ' ' + u[k]; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Memory for remembered keys and values, and number of attention scores, against context length'), W = A.W, svg = A.svg, fs = A.fs;
      var n = Math.round(Math.pow(10, lg)), M = MODELS[mi], kv = function (nn) { return 2 * M[1] * M[2] * nn * 2; }, scoresN = function (nn) { return nn * nn; };
      valText(s1, n.toLocaleString('en-GB'));
      var L = 56, R = W - 14, T = 26, B = 186, X = function (e) { return L + (e - 2) / 4 * (R - L); }, Y = function (lb) { return B - (lb - 4) / 12 * (B - T); };
      [4, 6, 8, 10, 12, 14, 16].forEach(function (e) { el('line', { x1: L, y1: Y(e), x2: R, y2: Y(e), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, L - 6, Y(e) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      [2, 3, 4, 5, 6].forEach(function (e) { var t = txt(svg, X(e), B + 15, '', { size: fs(9), fill: c.muted }); t.innerHTML = '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; });
      txt(svg, (L + R) / 2, B + 32, 'context length (tokens)', { size: fs(10), fill: c.muted });
      [[kv, '#a21caf', 'memory for keys and values (bytes)'], [scoresN, AMBER, 'attention scores per head and layer']].forEach(function (q) { var d = ''; for (var e = 2; e <= 6.001; e += 0.05) d += (e > 2 ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(Math.log10(q[0](Math.pow(10, e)))).toFixed(1); el('path', { d: d, fill: 'none', stroke: q[1], 'stroke-width': 2.4 }, svg); });
      el('line', { x1: X(lg), y1: T, x2: X(lg), y2: B, stroke: c.ink, 'stroke-dasharray': '2 3' }, svg);
      txt(svg, L, 14, W < 520 ? 'purple: key–value memory · amber: attention scores' : 'purple: memory to store keys and values (bytes) · amber: attention scores per head per layer (both log scale)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'With ' + n.toLocaleString('en-GB') + ' tokens, the ' + M[0].split(' (')[0].toLowerCase() + ' model must keep <strong>' + human(kv(n)) + '</strong> of keys and values, and each attention head computes <strong>' + (function (v) { var e = Math.floor(Math.log10(v)); return fmt(v / Math.pow(10, e), 1) + ' × 10<sup>' + e + '</sup>'; })(scoresN(n)) + '</strong> scores per layer.' + NOTE + 'To generate the next token, the model attends to the keys and values of every earlier token, so they are stored (the “KV cache”): 2 vectors per token per layer, here at 2 bytes per number. The memory grows in proportion to the context, and the number of query–key scores with its square. Real systems cut these costs with tricks such as sharing keys and values between heads, which this simple count ignores.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-lm3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why do n-gram models struggle with “The keys to the old wooden cabinet … are”?', options: ['They do not know verbs', 'The subject is outside their short window, and nearer nouns point the wrong way', 'They cannot count', 'The sentence is too short'], answer: 1, explanation: 'Figure 3 shows the windows.' },
      { question: 'What was the bottleneck of early sequence-to-sequence translation?', options: ['Too many layers', 'The whole source sentence had to be squeezed into a single vector', 'No training data', 'Slow tokenisers'], answer: 1, explanation: 'Attention removed it by letting the decoder look back.' },
      { question: 'In attention, a word’s query is compared with…', options: ['Its own value only', 'The keys of the words it may look at', 'A dictionary', 'The output layer'], answer: 1, explanation: 'Dot products of the query with each key give the scores.' },
      { question: 'Why are attention scores divided by √d?', options: ['To save memory', 'To keep scores from growing with the vector length and saturating the softmax', 'To make them positive', 'It is a typo'], answer: 1, explanation: 'Dot products of long random vectors grow like √d.' },
      { question: 'The causal mask in a GPT-style model ensures that…', options: ['Words attend only to themselves', 'Each word can attend only to itself and earlier words, never future ones', 'Attention is random', 'Long sentences are cut'], answer: 1, explanation: 'Otherwise the model could cheat by looking at the word it should predict.' },
      { question: 'Why does a transformer have many attention heads?', options: ['For decoration', 'Different heads can track different relationships at the same time', 'To make it slower', 'One head per word'], answer: 1, explanation: 'Figure 5 shows three kinds of heads.' },
      { question: 'An induction head…', options: ['Starts the model', 'Finds an earlier occurrence of the current word and attends to what followed it, enabling copying', 'Removes repetition', 'Counts tokens'], answer: 1, explanation: 'Olsson and colleagues linked these heads to learning from examples in the prompt.' },
      { question: 'Why can a transformer be trained on every position of a text at once?', options: ['It cannot', 'With the causal mask, each position predicts its next token from earlier ones, all in parallel', 'Because texts are short', 'It ignores order'], answer: 1, explanation: 'One pass gives thousands of training examples.' },
      { question: 'How does the memory for keys and values grow with the context length?', options: ['It stays fixed', 'In proportion to the number of tokens', 'With the square root', 'It shrinks'], answer: 1, explanation: 'The number of attention scores grows with the square.' },
      { question: '“Lost in the middle” refers to…', options: ['Forgetting the prompt', 'Models using information at the start and end of a long context better than in the middle', 'Tokenisation errors', 'Missing layers'], answer: 1, explanation: 'Liu and colleagues, 2024.' }
    ]);
  };
})();
