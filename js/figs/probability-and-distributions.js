/* ==========================================================================
   RNLearn — Probability and Distributions (Making Sense of Data, Part 2)
   Figures:
     1. fig-prob-timeline    The story at a glance (clickable timeline)
     2. fig-two-dice         Probability as long-run frequency
     3. fig-poisson          Counting rare events
     4. fig-dist-explorer    A distribution explorer
     5. fig-normal-z         The standard normal curve
     6. fig-galton           The Galton board
     7. fig-clt              The central limit theorem machine
     8. fig-qq               Reading a Q-Q plot
     9. fig-quiz-d2          Test yourself
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
    { name: 'Games of chance', color: '#b45309' },
    { name: 'Laws of error', color: '#1d4ed8' },
    { name: 'Modern foundations', color: '#be123c' }
  ];
  var EVENTS = [
    { year: 'c. 1564', icon: '🎲', era: 0, sec: 3, title: 'Cardano on dice', text: 'Gerolamo Cardano, a gambler and physician, writes the first book analysing games of chance; it is published only in 1663.' },
    { year: '1654', icon: '✉️', era: 0, sec: 3, title: 'Pascal and Fermat', text: 'Blaise Pascal and Pierre de Fermat exchange letters on how to divide the stakes of an unfinished game, founding probability theory.' },
    { year: '1657', icon: '⚖️', era: 0, sec: 4, title: 'Expected value', text: 'Christiaan Huygens publishes the first printed book on probability, built around the idea of the expected value of a game.' },
    { year: '1713', icon: '📘', era: 0, sec: 10, title: 'The law of large numbers', text: 'Jacob Bernoulli’s <em>Ars Conjectandi</em> proves that observed frequencies settle towards true probabilities as trials increase.' },
    { year: '1733', icon: '🔔', era: 1, sec: 7, title: 'The bell curve appears', text: 'Abraham de Moivre finds that the binomial distribution for many coin tosses is approximated by a bell-shaped curve.' },
    { year: '1809', icon: '🔭', era: 1, sec: 7, title: 'Gauss and errors', text: 'Gauss derives the normal distribution as the law of errors in astronomical measurements.' },
    { year: '1810', icon: '➕', era: 1, sec: 11, title: 'The central limit theorem', text: 'Pierre-Simon Laplace shows that sums of many independent errors tend to the normal distribution.' },
    { year: '1837', icon: '🐟', era: 1, sec: 5, title: 'Poisson’s distribution', text: 'Siméon Denis Poisson describes the distribution of rare events, in a book on the probability of jury verdicts.' },
    { year: '1889', icon: '📍', era: 1, sec: 11, title: 'The Galton board', text: 'Francis Galton’s “quincunx”, a board of pins, shows balls falling into a bell-shaped pile.' },
    { year: '1898', icon: '🐴', era: 1, sec: 5, title: 'Deaths by horse kick', text: 'Ladislaus Bortkiewicz shows that deaths from horse kicks in the Prussian army follow Poisson’s distribution.' },
    { year: '1933', icon: '📐', era: 2, sec: 3, title: 'Kolmogorov’s axioms', text: 'Andrey Kolmogorov gives probability a rigorous mathematical foundation in three axioms.' },
    { year: '1965', icon: '🧪', era: 2, sec: 12, title: 'Testing normality', text: 'Samuel Shapiro and Martin Wilk publish their widely used test of whether data come from a normal distribution.' }
  ];
  FIG['fig-prob-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from about 1564 to 1965');
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
  var BLUE = '#2563eb', RED = '#dc2626', GREEN = '#16a34a', AMBER = '#d97706';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) { var b = btn(it, row); bs.push(b); b.addEventListener('click', function () { set(i); onPick(i); }); });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    set(initial);
    return row;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function normInv(p) {
    var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
      b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
      c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
      d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], q, r;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - 0.02425) return -normInv(1 - p);
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function lnFact(n) { var s = 0; for (var i = 2; i <= n; i++) s += Math.log(i); return s; }
  function binomPmf(k, n, p) { if (p <= 0) return k === 0 ? 1 : 0; if (p >= 1) return k === n ? 1 : 0; return Math.exp(lnFact(n) - lnFact(k) - lnFact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
  function poisPmf(k, l) { return Math.exp(-l + k * Math.log(l) - lnFact(k)); }
  function poisDraw(l) { if (l > 50) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sdv(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function axisSVG(svgWrap, container, H, label) { svgWrap.innerHTML = ''; var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)); return { W: W, svg: FIG.createSVG(svgWrap, W, H, label), fs: scaler(svgWrap, 360) }; }

  /* -----------------------------------------------------------------------
     Figure 2. Two dice: probability as long-run frequency
     ----------------------------------------------------------------------- */
  FIG['fig-two-dice'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var counts = new Array(13).fill(0), n = 0, sevens = [];
    var controls = div('fig-controls', container);
    var row = group(controls, 'Roll two dice');
    [1, 10, 100, 1000].forEach(function (k) { btn(k === 1 ? 'Roll once' : 'Roll ' + fmt(k, 0) + ' times', row).addEventListener('click', function () { roll(k); }); });
    btn('Start again', row).addEventListener('click', function () { counts = new Array(13).fill(0); n = 0; sevens = []; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var last = null;
    function roll(k) {
      for (var i = 0; i < k; i++) { var a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6); counts[a + b]++; n++; last = [a, b]; if (n <= 5000) sevens.push(counts[7] / n); }
      draw();
    }
    function exact(s) { return (6 - Math.abs(s - 7)) / 36; }
    function draw() {
      var c = C(), A = axisSVG(svgWrap, container, (svgWrap.clientWidth || container.clientWidth || 700) < 560 ? 290 : 250, 'Distribution of the sum of two dice'), W = A.W, svg = A.svg, fs = A.fs;
      var narrow = W < 560, gw = narrow ? W - 20 : W * 0.55, L = 10, B = 150, T = 24;
      for (var s = 2; s <= 12; s++) {
        var bw = gw / 11, x = L + (s - 2) * bw, fe = exact(s), fo = n ? counts[s] / n : 0, Y = function (f) { return B - f / 0.2 * (B - T); };
        el('rect', { x: x + bw * 0.12, y: Y(fo), width: bw * 0.76, height: B - Y(fo), fill: s === 7 ? RED : BLUE, opacity: 0.7 }, svg);
        el('line', { x1: x + bw * 0.05, y1: Y(fe), x2: x + bw * 0.95, y2: Y(fe), stroke: c.ink, 'stroke-width': 2 }, svg);
        txt(svg, x + bw / 2, B + 14, String(s), { size: fs(10), fill: c.muted });
      }
      txt(svg, L, 14, narrow ? 'Share of each sum (bars) vs exact (lines)' : 'Share of rolls giving each sum (bars) vs exact probability (black lines)', { anchor: 'start', size: fs(10), fill: c.muted });
      // running frequency of 7
      var px = narrow ? 34 : W * 0.6 + 30, py = narrow ? 206 : 30, pw = narrow ? W - 44 : W * 0.4 - 40, ph = narrow ? 60 : 120;
      {
        el('rect', { x: px, y: py, width: pw, height: ph, fill: 'none', stroke: c.border }, svg);
        var Yr = function (f) { return py + ph - f / 0.4 * ph; };
        el('line', { x1: px, y1: Yr(1 / 6), x2: px + pw, y2: Yr(1 / 6), stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
        if (sevens.length > 1) { var d = '', m = sevens.length; sevens.forEach(function (f, i) { d += (d ? 'L' : 'M') + (px + Math.log(i + 1) / Math.log(Math.max(m, 10)) * pw).toFixed(1) + ' ' + Math.max(py, Yr(f)).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 1.6 }, svg); }
        txt(svg, px, py - 6, 'Running share of 7s (dashed: 1/6)', { anchor: 'start', size: fs(10), fill: c.muted });
      }
      out.innerHTML = (last ? 'Last roll: <strong>' + last[0] + ' + ' + last[1] + ' = ' + (last[0] + last[1]) + '</strong>. ' : '') + 'Rolls so far: <strong>' + fmt(n, 0) + '</strong>' + (n ? '; share of 7s: <strong>' + fmt(counts[7] / n * 100, 1) + '%</strong> (exact: 6/36 = 16.7%).' : '. Start rolling.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">There are 36 equally likely outcomes, and 6 of them add up to 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), so 7 is the most likely sum. With few rolls the bars jump around; with thousands, they settle onto the exact probabilities: the law of large numbers.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Distribution explorer
     ----------------------------------------------------------------------- */
  var DISTS = ['Binomial', 'Poisson', 'Uniform', 'Exponential', 'Normal', 'Log-normal'];
  FIG['fig-dist-explorer'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 0, p1 = 0.5, p2 = 0.5, xq = 0.5;
    var controls = div('fig-controls', container);
    choice(controls, 'Distribution', DISTS, 0, function (i) { di = i; p1 = 0.5; p2 = 0.5; s1.setValue(p1); s2.setValue(p2); draw(); });
    var s1 = FIG.slider(controls, { id: 'de-a', label: 'Parameter 1', min: 0, max: 1, step: 0.01, value: p1, onChange: function (x) { p1 = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'de-b', label: 'Parameter 2', min: 0, max: 1, step: 0.01, value: p2, onChange: function (x) { p2 = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'de-x', label: 'Shade up to this point', min: 0, max: 1, step: 0.005, value: xq, onChange: function (x) { xq = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function setLabel(sl, t) { sl.element.parentNode.querySelector('label').textContent = t; }
    function draw() {
      var c = C(), A = axisSVG(svgWrap, container, 220, 'Probability distribution'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 40, R = W - 12, T = 16, B = 180, desc, mu, sd, xs = [], ys = [], discrete = di < 2, lo, hi, cdf = 0, xv;
      if (di === 0) { var n = Math.round(1 + p1 * 59), p = Math.min(0.99, Math.max(0.01, p2)); setLabel(s1, 'Number of trials n'); setLabel(s2, 'Probability of success p'); valText(s1, String(n)); valText(s2, fmt(p, 2)); lo = 0; hi = n; for (var k = 0; k <= n; k++) { xs.push(k); ys.push(binomPmf(k, n, p)); } mu = n * p; sd = Math.sqrt(n * p * (1 - p)); desc = 'Number of successes in ' + n + ' independent trials, each with probability ' + fmt(p, 2) + ': defective parts in a batch, heads in coin tosses, patients who respond.'; }
      if (di === 1) { var l = 0.1 + p1 * 29.9; setLabel(s1, 'Average count λ'); setLabel(s2, '(not used)'); valText(s1, fmt(l, 1)); valText(s2, '–'); lo = 0; hi = Math.ceil(l + 5 * Math.sqrt(l) + 3); for (var k2 = 0; k2 <= hi; k2++) { xs.push(k2); ys.push(poisPmf(k2, l)); } mu = l; sd = Math.sqrt(l); desc = 'Number of rare, independent events in a fixed time or space: photons in a detector, radioactive decays per second, typos per page. Mean and variance are both λ.'; }
      if (di === 2) { var a = 0, b2 = 1 + p1 * 9; setLabel(s1, 'Upper limit b (lower limit 0)'); setLabel(s2, '(not used)'); valText(s1, fmt(b2, 1)); valText(s2, '–'); lo = -0.5; hi = b2 + 0.5; mu = b2 / 2; sd = b2 / Math.sqrt(12); desc = 'Every value between 0 and ' + fmt(b2, 1) + ' is equally likely: rounding errors, a random angle, a well-made random number generator.'; }
      if (di === 3) { var r = 0.1 + p1 * 2.9; setLabel(s1, 'Rate λ (events per unit time)'); setLabel(s2, '(not used)'); valText(s1, fmt(r, 2)); valText(s2, '–'); lo = 0; hi = 6 / r; mu = 1 / r; sd = 1 / r; desc = 'Waiting time until the next random event at rate ' + fmt(r, 2) + ' per unit: time between decays, between customers, until a component fails. It is “memoryless”: having waited already does not shorten the remaining wait.'; }
      if (di === 4) { var m = -3 + p1 * 6, s = 0.3 + p2 * 2.7; setLabel(s1, 'Mean μ'); setLabel(s2, 'Standard deviation σ'); valText(s1, fmt(m, 2)); valText(s2, fmt(s, 2)); lo = -10; hi = 10; mu = m; sd = s; desc = 'The bell curve: measurement errors, heights, and averages of many independent influences (the central limit theorem).'; }
      if (di === 5) { var ml = -1 + p1 * 2, sl = 0.1 + p2 * 1.2; setLabel(s1, 'Mean of the logarithm'); setLabel(s2, 'SD of the logarithm'); valText(s1, fmt(ml, 2)); valText(s2, fmt(sl, 2)); lo = 0; hi = Math.exp(ml + 3 * sl); mu = Math.exp(ml + sl * sl / 2); sd = Math.sqrt((Math.exp(sl * sl) - 1) * Math.exp(2 * ml + sl * sl)); desc = 'Values whose logarithm is normal: particle sizes, incomes, concentrations, reaction times. Skewed to the right; the median is e^μ = ' + fmt(Math.exp(ml), 2) + ', below the mean.'; }
      xv = lo + xq * (hi - lo);
      valText(s3, discrete ? 'x ≤ ' + Math.round(xv) : 'x ≤ ' + fmt(xv, 2));
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      if (discrete) {
        var mx = Math.max.apply(null, ys), bw = Math.max(1, (R - L) / (xs.length) * 0.8), Y = function (y) { return B - y / mx * (B - T); };
        xs.forEach(function (x, i) { var inside = x <= Math.round(xv); if (inside) cdf += ys[i]; el('rect', { x: X(x) - bw / 2, y: Y(ys[i]), width: bw, height: B - Y(ys[i]), fill: inside ? BLUE : c.faint, opacity: 0.8 }, svg); });
        txt(svg, L - 5, Y(mx) + 4, fmt(mx, 3), { anchor: 'end', size: fs(10), fill: c.muted });
      } else {
        var f = function (x) {
          if (di === 2) return x >= 0 && x <= b2 ? 1 / b2 : 0;
          if (di === 3) return x >= 0 ? r * Math.exp(-r * x) : 0;
          if (di === 4) return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI));
          return x > 0 ? Math.exp(-0.5 * Math.pow((Math.log(x) - ml) / sl, 2)) / (x * sl * Math.sqrt(2 * Math.PI)) : 0;
        };
        var F = function (x) {
          if (di === 2) return Math.min(1, Math.max(0, x / b2));
          if (di === 3) return x > 0 ? 1 - Math.exp(-r * x) : 0;
          if (di === 4) return Phi((x - m) / s);
          return x > 0 ? Phi((Math.log(x) - ml) / sl) : 0;
        };
        var mxv = 0, step = (hi - lo) / 300, x;
        for (x = lo; x <= hi; x += step) mxv = Math.max(mxv, f(x));
        var Yc = function (y) { return B - y / mxv * (B - T); }, path = '', area = 'M' + X(lo) + ' ' + B;
        for (x = lo; x <= hi + 1e-9; x += step) { path += (path ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Yc(f(x)).toFixed(1); if (x <= xv) area += ' L' + X(x).toFixed(1) + ' ' + Yc(f(x)).toFixed(1); }
        el('path', { d: area + ' L' + X(Math.min(xv, hi)) + ' ' + B + ' Z', fill: BLUE, opacity: 0.3 }, svg);
        el('path', { d: path, fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, svg);
        cdf = F(xv);
      }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: X(mu), y1: T, x2: X(mu), y2: B, stroke: RED, 'stroke-dasharray': '4 3' }, svg);
      [lo, (lo + hi) / 2, hi].forEach(function (v, i) { txt(svg, X(v), B + 15, discrete ? String(Math.round(v)) : fmt(v, Math.abs(hi - lo) < 5 ? 2 : 1), { size: fs(10), fill: c.muted, anchor: i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }); });
      txt(svg, Math.min(X(mu) + 4, R - 2), T + 8, 'mean', { anchor: X(mu) > W - 60 ? 'end' : 'start', size: fs(10), fill: RED });
      out.innerHTML = '<strong>' + DISTS[di] + '.</strong> ' + desc + '<br>Mean <strong>' + fmt(mu, 3) + '</strong> · standard deviation <strong>' + fmt(sd, 3) + '</strong> · probability of a value ≤ ' + (discrete ? Math.round(xv) : fmt(xv, 2)) + ': <strong>' + fmt(cdf * 100, 1) + '%</strong> (shaded).';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Counting rare events: Poisson
     ----------------------------------------------------------------------- */
  var HORSE = [109, 65, 22, 3, 1];
  FIG['fig-poisson'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lam = 4, mode = 0, counts = [];
    var controls = div('fig-controls', container);
    choice(controls, 'Data', ['Simulated photon counts', 'Prussian horse kicks, 1875–94'], 0, function (i) { mode = i; draw(); });
    var sl = FIG.slider(controls, { id: 'po-l', label: 'Average photons per time bin (λ)', min: 0.5, max: 100, step: 0.5, value: lam, onChange: function (x) { lam = x; sim(); } });
    var row = group(controls, 'Actions');
    btn('Count 200 more bins', row).addEventListener('click', function () { sim(true); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function sim(add) { if (!add) counts = []; for (var i = 0; i < 200; i++) counts.push(poisDraw(lam)); draw(); }
    function draw() {
      var c = C(), A = axisSVG(svgWrap, container, 220, 'Histogram of counts with Poisson prediction'), W = A.W, svg = A.svg, fs = A.fs;
      valText(sl, fmt(lam, 1));
      var L = 40, R = W - 12, T = 16, B = 180, obs, l, N, kmin, kmax;
      if (mode) { obs = HORSE; N = 200; l = 0.61; kmin = 0; kmax = 4; }
      else { l = lam; N = counts.length; kmin = Math.max(0, Math.floor(lam - 4.5 * Math.sqrt(lam) - 1)); kmax = Math.ceil(lam + 4.5 * Math.sqrt(lam) + 2); obs = []; for (var k = kmin; k <= kmax; k++) obs.push(0); counts.forEach(function (v) { if (v >= kmin && v <= kmax) obs[v - kmin]++; }); }
      var K = kmax - kmin + 1, exp = [], mx = 0;
      for (var j = 0; j < K; j++) { exp.push(N * poisPmf(kmin + j, l)); mx = Math.max(mx, exp[j], obs[j]); }
      var bw = (R - L) / K, Y = function (v) { return B - v / mx * (B - T); };
      for (j = 0; j < K; j++) {
        el('rect', { x: L + j * bw + bw * 0.12, y: Y(obs[j]), width: bw * 0.76, height: B - Y(obs[j]), fill: BLUE, opacity: 0.7 }, svg);
        el('circle', { cx: L + j * bw + bw / 2, cy: Y(exp[j]), r: Math.min(5, bw / 3 + 1), fill: RED }, svg);
        var step = K > 30 ? 5 : K > 15 ? 2 : 1;
        if ((kmin + j) % step === 0) txt(svg, L + j * bw + bw / 2, B + 14, String(kmin + j), { size: fs(10), fill: c.muted });
      }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      txt(svg, L - 5, Y(mx) + 4, fmt(mx, 0), { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, (L + R) / 2, B + 32, mode ? 'deaths per army corps per year' : 'photons counted in a bin', { size: fs(10), fill: c.muted });
      var all = []; if (mode) HORSE.forEach(function (v, k) { for (var i = 0; i < v; i++) all.push(k); }); else all = counts;
      var m = all.length ? mean(all) : 0, v = all.length > 1 ? Math.pow(sdv(all), 2) : 0;
      out.innerHTML = 'Bars: observed. Red dots: Poisson prediction with λ = ' + fmt(l, 2) + '. Observed mean <strong>' + fmt(m, 2) + '</strong>, variance <strong>' + fmt(v, 2) + '</strong>.' +
        (mode ? '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Ladislaus Bortkiewicz’s famous data: in 200 corps-years, 109 had no deaths from horse kicks, 65 had one, 22 had two, 3 had three and 1 had four. The Poisson distribution predicts 108.7, 66.3, 20.2, 4.1 and 0.6.</span>' :
          '<br><span style="font-size:0.86rem;color:var(--ink-muted);">For Poisson counts, the variance equals the mean, so the standard deviation is √λ. The relative noise, √λ/λ = 1/√λ, shrinks as counts grow: with 100 photons the counts vary by about 10%, with 10,000 by about 1%. This is “shot noise”, which sets the ultimate limit for light detectors.</span>');
    }
    sim();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. The normal curve and z-scores
     ----------------------------------------------------------------------- */
  FIG['fig-normal-z'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var z1 = -1, z2 = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'nz-a', label: 'Lower z', min: -4, max: 4, step: 0.01, value: z1, onChange: function (x) { z1 = Math.min(x, z2); draw(); } });
    var s2 = FIG.slider(controls, { id: 'nz-b', label: 'Upper z', min: -4, max: 4, step: 0.01, value: z2, onChange: function (x) { z2 = Math.max(x, z1); draw(); } });
    var row = group(controls, 'Try');
    [['±1 SD', 1], ['±2 SD', 2], ['±3 SD', 3], ['±1.96 (95%)', 1.96]].forEach(function (p) { btn(p[0], row).addEventListener('click', function () { z1 = -p[1]; z2 = p[1]; s1.setValue(z1); s2.setValue(z2); draw(); }); });
    btn('Above z = 1.625', row).addEventListener('click', function () { z1 = 1.625; z2 = 4; s1.setValue(z1); s2.setValue(z2); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function pdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); }
    function draw() {
      var c = C(), A = axisSVG(svgWrap, container, 210, 'Standard normal curve'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(z1, 2)); valText(s2, fmt(z2, 2));
      var L = 10, R = W - 10, T = 14, B = 170, X = function (z) { return L + (z + 4) / 8 * (R - L); }, Y = function (y) { return B - y / 0.42 * (B - T); };
      var area = 'M' + X(z1) + ' ' + B, path = '', z;
      for (z = z1; z <= z2 + 1e-9; z += 0.02) area += ' L' + X(z).toFixed(1) + ' ' + Y(pdf(z)).toFixed(1);
      el('path', { d: area + ' L' + X(z2) + ' ' + B + ' Z', fill: BLUE, opacity: 0.35 }, svg);
      for (z = -4; z <= 4; z += 0.02) path += (path ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(pdf(z)).toFixed(1);
      el('path', { d: path, fill: 'none', stroke: c.ink2, 'stroke-width': 2 }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      for (var k = -4; k <= 4; k++) { el('line', { x1: X(k), y1: B, x2: X(k), y2: B + 4, stroke: c.muted }, svg); txt(svg, X(k), B + 16, (k > 0 ? '+' : '') + k, { size: fs(10), fill: c.muted }); }
      txt(svg, (L + R) / 2, B + 34, 'z = number of standard deviations from the mean', { size: fs(10), fill: c.muted });
      var p = Phi(z2) - Phi(z1);
      out.innerHTML = 'Probability between z = ' + fmt(z1, 2) + ' and z = ' + fmt(z2, 2) + ': <strong>' + fmt(p * 100, p < 0.01 ? 3 : 2) + '%</strong>' + (z2 >= 3.99 && z1 > -3.99 ? ' (the share of values above z = ' + fmt(z1, 2) + '; percentile ' + fmt(Phi(z1) * 100, 1) + ')' : '') + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The 68–95–99.7 rule: about 68% of normally distributed values lie within 1 standard deviation of the mean, 95% within 2 (more precisely 1.96), and 99.7% within 3. Any normal distribution becomes this one after converting values to z-scores, z = (x − μ)/σ.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. The Galton board
     ----------------------------------------------------------------------- */
  FIG['fig-galton'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var rows = 10, p = 0.5, bins = [], balls = [], dropped = 0;
    function reset() { bins = new Array(rows + 1).fill(0); balls = []; dropped = 0; }
    reset();
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'gb-r', label: 'Rows of pins', min: 2, max: 16, step: 1, value: rows, onChange: function (x) { rows = x; reset(); draw(); } });
    var s2 = FIG.slider(controls, { id: 'gb-p', label: 'Chance of bouncing right', min: 0.1, max: 0.9, step: 0.05, value: p, onChange: function (x) { p = x; reset(); draw(); } });
    var row = group(controls, 'Actions');
    btn('Drop 1 ball', row).addEventListener('click', function () { add(1); });
    btn('Drop 100 balls', row).addEventListener('click', function () { add(100); });
    btn('Drop 1,000 instantly', row).addEventListener('click', function () { for (var i = 0; i < 1000; i++) { var r = 0; for (var j = 0; j < rows; j++) if (Math.random() < p) r++; bins[r]++; dropped++; } draw(); });
    btn('Empty', row).addEventListener('click', function () { reset(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function add(k) { for (var i = 0; i < k; i++) { var path = []; for (var j = 0; j < rows; j++) path.push(Math.random() < p ? 1 : 0); balls.push({ path: path, t0: performance.now() + i * 40 }); } }
    var geo = {};
    function draw(now) {
      var c = C(), A = axisSVG(svgWrap, container, 330, 'Galton board'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(rows)); valText(s2, fmt(p, 2));
      var top = 20, boardH = 170, cx = W / 2, dx = Math.min(22, (W - 40) / (rows + 1)), dy = boardH / rows, binTop = top + boardH + 10, binH = 110;
      geo = { top: top, cx: cx, dx: dx, dy: dy };
      for (var r = 0; r < rows; r++) for (var k = 0; k <= r; k++) el('circle', { cx: cx + (k - r / 2) * dx, cy: top + r * dy, r: 2.2, fill: c.muted }, svg);
      var mx = Math.max(1, Math.max.apply(null, bins)), exp = 0;
      for (k = 0; k <= rows; k++) {
        var x = cx + (k - rows / 2) * dx, h = bins[k] / mx * binH;
        el('rect', { x: x - dx * 0.42, y: binTop + binH - h, width: dx * 0.84, height: h, fill: BLUE, opacity: 0.75 }, svg);
        if (dropped) { var e = binomPmf(k, rows, p) * dropped / mx * binH; el('circle', { cx: x, cy: binTop + binH - e, r: 3, fill: RED }, svg); }
      }
      el('line', { x1: cx - (rows / 2 + 0.6) * dx, y1: binTop + binH, x2: cx + (rows / 2 + 0.6) * dx, y2: binTop + binH, stroke: c.border }, svg);
      balls.forEach(function (b) {
        var t = ((now || 0) - b.t0) / 90; if (t < 0) return;
        var step = Math.min(rows, Math.floor(t)), frac = Math.min(1, t - step), pos = 0;
        for (var j = 0; j < step; j++) pos += b.path[j];
        var nextPos = step < rows ? pos + b.path[step] * frac : pos, yy = top + (step + (step < rows ? frac : 0)) * dy - 6;
        el('circle', { cx: cx + (nextPos - (step + (step < rows ? frac : 0)) / 2) * dx, cy: yy, r: 3.5, fill: AMBER }, svg);
      });
      out.innerHTML = 'Balls dropped: <strong>' + fmt(dropped, 0) + '</strong>. Each ball bounces left or right at each of ' + rows + ' rows; its final bin is the number of rightward bounces. Red dots: the binomial distribution.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The sum of many small, independent left–right steps piles up into a bell shape. With more rows the pile looks ever more like the normal curve: de Moivre’s discovery, and a first glimpse of the central limit theorem. With an unfair bounce the pile shifts, but still becomes bell-shaped when there are enough rows.</span>';
    }
    draw();
    FIG.animate(figEl, function (now) {
      if (!balls.length) return;
      var done = [];
      balls.forEach(function (b, i) { if ((now - b.t0) / 90 >= rows + 1) done.push(i); });
      for (var i = done.length - 1; i >= 0; i--) { var b = balls[done[i]], r = 0; b.path.forEach(function (v) { r += v; }); bins[r]++; dropped++; balls.splice(done[i], 1); }
      draw(now);
    });
    window.addEventListener('resize', function () { draw(); });
    onTheme(function () { draw(); });
  };

  /* -----------------------------------------------------------------------
     Figure 7. The central limit theorem machine
     ----------------------------------------------------------------------- */
  var SRC = [
    { n: 'A fair die', draw: function () { return 1 + Math.floor(Math.random() * 6); }, mu: 3.5, sd: Math.sqrt(35 / 12) },
    { n: 'Waiting times (exponential)', draw: function () { return -Math.log(1 - Math.random()); }, mu: 1, sd: 1 },
    { n: 'Two peaks', draw: function () { return (Math.random() < 0.5 ? 0 : 10) + gauss(); }, mu: 5, sd: Math.sqrt(26) }
  ];
  FIG['fig-clt'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var si = 1, n = 1, means = [];
    var controls = div('fig-controls', container);
    choice(controls, 'Population', SRC.map(function (s) { return s.n; }), si, function (i) { si = i; means = []; run(); });
    var sl = FIG.slider(controls, { id: 'cl-n', label: 'Values averaged in each sample (n)', min: 1, max: 50, step: 1, value: n, onChange: function (x) { n = x; means = []; run(); } });
    var row = group(controls, 'Actions');
    btn('Take 1,000 more samples', row).addEventListener('click', run);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function run() { var s = SRC[si]; for (var t = 0; t < 1000; t++) { var a = 0; for (var i = 0; i < n; i++) a += s.draw(); means.push(a / n); } draw(); }
    function draw() {
      var c = C(), s = SRC[si], A = axisSVG(svgWrap, container, 220, 'Histogram of sample means'), W = A.W, svg = A.svg, fs = A.fs;
      valText(sl, String(n));
      var se = s.sd / Math.sqrt(n), lo = si === 1 ? 0 : s.mu - Math.max(4 * se, si === 0 ? 2.6 : 9), hi = si === 1 ? Math.max(3 * s.mu, s.mu + 4.5 * se) : s.mu + Math.max(4 * se, si === 0 ? 2.6 : 9);
      if (si === 0) { lo = Math.min(lo, 0.5); hi = Math.max(hi, 6.5); }
      var L = 10, R = W - 10, T = 16, B = 180, nb = 50, cnt = new Array(nb).fill(0), w = (hi - lo) / nb;
      means.forEach(function (m) { var b = Math.floor((m - lo) / w); if (b >= 0 && b < nb) cnt[b]++; });
      var dens = cnt.map(function (k) { return k / (means.length * w); }), peak = 1 / (se * Math.sqrt(2 * Math.PI)), mx = Math.max(Math.max.apply(null, dens), n >= 2 ? peak : 0) * 1.05 || 1;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - v / mx * (B - T); };
      dens.forEach(function (d, i) { el('rect', { x: X(lo + i * w) + 0.5, y: Y(d), width: Math.max(1, (R - L) / nb - 1), height: B - Y(d), fill: BLUE, opacity: 0.7 }, svg); });
      var path = ''; for (var x = lo; x <= hi; x += (hi - lo) / 200) path += (path ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(Math.exp(-0.5 * Math.pow((x - s.mu) / se, 2)) * peak).toFixed(1);
      el('path', { d: path, fill: 'none', stroke: RED, 'stroke-width': 2, opacity: n >= 2 ? 1 : 0.35 }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      [lo, s.mu, hi].forEach(function (v, i) { txt(svg, X(v), B + 15, fmt(v, 1), { size: fs(10), fill: c.muted, anchor: i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }); });
      txt(svg, L, 12, n === 1 ? 'Single values (n = 1): the shape of the population itself' : 'Means of samples of ' + n + ' (red: normal curve predicted by the CLT)', { anchor: 'start', size: fs(10), fill: c.muted });
      var sdm = means.length > 1 ? sdv(means) : 0;
      out.innerHTML = 'Samples: <strong>' + fmt(means.length, 0) + '</strong>. Spread of the sample means: <strong>' + fmt(sdm, 3) + '</strong>; the theory predicts σ/√n = ' + fmt(s.sd, 2) + '/√' + n + ' = <strong>' + fmt(se, 3) + '</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Whatever the shape of the population (flat, skewed or with two peaks), the averages of samples of n values become bell-shaped as n grows, centred on the true mean and with spread σ/√n. Increase n step by step and watch it happen. This spread of averages, the standard error, is the star of Part 4.</span>';
    }
    run();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Q–Q plots
     ----------------------------------------------------------------------- */
  var QQ = [
    { n: 'Normal', g: function () { return gauss(); }, note: 'Points follow the straight line: consistent with a normal distribution. Small wiggles at the ends are normal for small samples.' },
    { n: 'Right-skewed', g: function () { return Math.exp(0.6 * gauss()); }, note: 'A curve bending upwards (convex): the right tail is longer than a normal one. Taking logarithms might help.' },
    { n: 'Heavy tails', g: function () { var z = gauss(), w = 0; for (var i = 0; i < 3; i++) w += Math.pow(gauss(), 2); return z / Math.sqrt(w / 3 + 1e-9); }, note: 'An S-shape with both ends pulled away from the line: more extreme values than a normal distribution produces. Outlier rules based on the normal will fire often.' },
    { n: 'Uniform', g: function () { return Math.random(); }, note: 'An S-shape the other way: lighter tails than normal, no values far from the centre.' },
    { n: 'Two groups', g: function () { return (Math.random() < 0.5 ? -2 : 2) + 0.6 * gauss(); }, note: 'A flat step in the middle: a gap where a normal distribution would have most of its values. Two groups are mixed.' }
  ];
  FIG['fig-qq'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var qi = 0, n = 50, data = [];
    var controls = div('fig-controls', container);
    choice(controls, 'Data', QQ.map(function (q) { return q.n; }), 0, function (i) { qi = i; gen(); });
    var sl = FIG.slider(controls, { id: 'qq-n', label: 'Sample size', min: 10, max: 500, step: 10, value: n, onChange: function (x) { n = x; gen(); } });
    var row = group(controls, 'Actions');
    btn('New sample', row).addEventListener('click', gen);
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function gen() { data = []; for (var i = 0; i < n; i++) data.push(QQ[qi].g()); data.sort(function (a, b) { return a - b; }); draw(); }
    function draw() {
      var c = C(), A = axisSVG(svgWrap, container, 270, 'Normal Q-Q plot and histogram'), W = A.W, svg = A.svg, fs = A.fs;
      valText(sl, String(n));
      var m = mean(data), s = sdv(data), narrow = W < 560, size = narrow ? Math.min(W - 60, 220) : 220, L = narrow ? (W - size) / 2 + 10 : 50, T = 22;
      var th = data.map(function (x, i) { return normInv((i + 0.5) / n); }), zs = data.map(function (x) { return (x - m) / s; });
      var lim = Math.max(3, Math.max.apply(null, zs.map(Math.abs)), Math.max.apply(null, th.map(Math.abs))) * 1.05;
      var X = function (v) { return L + (v + lim) / (2 * lim) * size; }, Y = function (v) { return T + size - (v + lim) / (2 * lim) * size; };
      el('rect', { x: L, y: T, width: size, height: size, fill: 'none', stroke: c.border }, svg);
      el('line', { x1: X(-lim), y1: Y(-lim), x2: X(lim), y2: Y(lim), stroke: RED, 'stroke-width': 1.5 }, svg);
      th.forEach(function (t, i) { el('circle', { cx: X(t), cy: Y(zs[i]), r: 2.8, fill: BLUE, opacity: 0.75 }, svg); });
      txt(svg, L + size / 2, T + size + 16, 'expected (normal) quantiles', { size: fs(10), fill: c.muted });
      txt(svg, L, T - 8, 'observed quantiles (standardised)', { anchor: 'start', size: fs(10), fill: c.muted });
      if (!narrow) {
        var hx = L + size + 50, hw = W - hx - 14, nb = 20, lo = data[0], hi = data[n - 1], cnt = new Array(nb).fill(0), w = (hi - lo) / nb || 1;
        data.forEach(function (x) { cnt[Math.min(nb - 1, Math.floor((x - lo) / w))]++; });
        var mx = Math.max.apply(null, cnt);
        cnt.forEach(function (k, i) { var h = k / mx * (size - 20); el('rect', { x: hx + i * hw / nb, y: T + size - h, width: hw / nb - 1, height: h, fill: c.faint }, svg); });
        txt(svg, hx, T - 8, 'histogram of the same data', { anchor: 'start', size: fs(10), fill: c.muted });
      }
      out.innerHTML = QQ[qi].note + '<br><span style="font-size:0.86rem;color:var(--ink-muted);">A Q–Q (quantile–quantile) plot puts each sorted data value against where it would be expected if the data were normal. Normal data fall on the line; the pattern of departures shows how the data differ. Try a small sample of normal data: even genuinely normal data wander from the line.</span>';
    }
    gen();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 9. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is the probability of rolling a total of 7 with two fair dice?', options: ['1/12', '1/6', '1/11', '7/36'], answer: 1, explanation: '6 of the 36 equally likely outcomes give 7.' },
      { question: 'A fair coin has landed heads 8 times in a row. The chance of heads next time is…', options: ['Less than 50%: tails is “due”', 'Exactly 50%', 'More than 50%: heads is on a streak', 'Impossible to say'], answer: 1, explanation: 'Independent events have no memory. Expecting tails is the gambler’s fallacy.' },
      { question: 'What is the expected value of one roll of a fair die?', options: ['3', '3.5', '4', '6'], answer: 1, explanation: '(1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5, though no single roll can give it.' },
      { question: 'Which distribution describes the number of photons hitting a detector in a fixed time?', options: ['Uniform', 'Poisson', 'Normal', 'Binomial with n = 2'], answer: 1, explanation: 'Rare, independent events in a fixed interval follow the Poisson distribution.' },
      { question: 'A detector counts on average 400 photons per second. The typical fluctuation (SD) is about…', options: ['4', '20', '40', '400'], answer: 1, explanation: 'For Poisson counts the SD is √400 = 20, a relative noise of 5%.' },
      { question: 'About what share of normally distributed values lie within 2 standard deviations of the mean?', options: ['68%', '95%', '99.7%', '50%'], answer: 1, explanation: 'The 68–95–99.7 rule.' },
      { question: 'An exam has mean 65 and SD 8. A score of 78 has a z-score of…', options: ['13', '1.625', '0.62', '8.1'], answer: 1, explanation: 'z = (78 − 65)/8 = 1.625, about the 95th percentile if marks are normal.' },
      { question: 'The central limit theorem says that…', options: ['All data are normally distributed', 'Averages of many independent values tend to be normally distributed, whatever the population’s shape', 'Large samples have no error', 'The mean equals the median'], answer: 1, explanation: 'It is about averages and sums, not individual values.' },
      { question: 'Averages of samples of 25 values have a spread (standard error) of…', options: ['The same as single values', '1/25 of the population SD', '1/5 of the population SD', '5 times the population SD'], answer: 2, explanation: 'σ/√n = σ/√25 = σ/5.' },
      { question: 'On a normal Q–Q plot, the points curve upwards at the right end. The data are probably…', options: ['Normal', 'Skewed to the right', 'Uniform', 'Exactly symmetric'], answer: 1, explanation: 'The largest values are larger than a normal distribution would produce: a long right tail.' }
    ]);
  };
})();
