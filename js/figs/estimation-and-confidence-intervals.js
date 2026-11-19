/* ==========================================================================
   RNLearn — Estimation (Making Sense of Data, Part 4)
   Figures:
     1. fig-est-timeline     The story at a glance (clickable timeline)
     2. fig-ci-coverage      One hundred confidence intervals
     3. fig-t-dist           Student's t distribution
     4. fig-proportion       Intervals for a proportion and their coverage
     5. fig-bootstrap        The bootstrap
     6. fig-error-bars       Error bars: SD, SE or CI?
     7. fig-sample-size      Sample size and power
     8. fig-quiz-d4          Test yourself
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
    { name: 'Small samples', color: '#b45309' },
    { name: 'The idea of confidence', color: '#1d4ed8' },
    { name: 'Computers and good practice', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1908', icon: '🍺', era: 0, sec: 5, title: 'Student’s t', text: 'William Sealy Gosset, a chemist at the Guinness brewery, publishes “The probable error of a mean” under the pen name “Student”, solving the problem of small samples.' },
    { year: '1925', icon: '📗', era: 0, sec: 10, title: 'Statistical Methods for Research Workers', text: 'Ronald Fisher’s textbook gives tables of t and makes small-sample methods routine in laboratories and field trials.' },
    { year: '1927', icon: '📐', era: 1, sec: 6, title: 'Wilson’s interval', text: 'Edwin Bidwell Wilson describes a better interval for a proportion; it was largely forgotten for seventy years.' },
    { year: '1934', icon: '🎯', era: 1, sec: 6, title: 'The “exact” interval', text: 'Charles Clopper and Egon Pearson publish a binomial interval that never covers less than its stated level.' },
    { year: '1937', icon: '🔔', era: 1, sec: 4, title: 'Confidence intervals', text: 'Jerzy Neyman sets out the theory of confidence intervals and their long-run interpretation.' },
    { year: '1947', icon: '⚖️', era: 1, sec: 7, title: 'Welch’s correction', text: 'Bernard Welch shows how to compare two means when the groups have different variances.' },
    { year: '1979', icon: '🥾', era: 2, sec: 8, title: 'The bootstrap', text: 'Bradley Efron introduces the bootstrap: resampling the data on a computer to estimate uncertainty without formulas.' },
    { year: '1983', icon: '0️⃣', era: 2, sec: 6, title: 'The rule of three', text: 'If none of n trials shows an event, a simple 95% upper limit for its probability is about 3/n.' },
    { year: '1988', icon: '🔋', era: 2, sec: 11, title: 'Power analysis', text: 'The second edition of Jacob Cohen’s book makes power and sample-size planning standard practice.' },
    { year: '2005', icon: '📊', era: 2, sec: 9, title: 'Error bars misread', text: 'A study finds that many published researchers misjudge what overlapping error bars mean.' },
    { year: '2014', icon: '❓', era: 2, sec: 16, title: 'What does 95% mean?', text: 'Researchers and students alike endorse, on average, more than three of six false statements about a confidence interval.' }
  ];

  FIG['fig-est-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1908 to 2014');
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
     Figure 2. One hundred confidence intervals
     ----------------------------------------------------------------------- */
  FIG['fig-ci-coverage'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 5, levels = [0.8, 0.9, 0.95, 0.99], li = 2, useT = 1, samples = [], total = 0, hits = 0;
    var MU = 50, SIG = 10;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cc-n', label: 'Sample size n', min: 2, max: 50, step: 1, value: n, onChange: function (x) { n = x; regen(); } });
    choice(controls, 'Confidence level', ['80%', '90%', '95%', '99%'], li, function (i) { li = i; reset(); draw(); });
    choice(controls, 'Multiplier', ['z (normal)', 't (Student)'], useT, function (i) { useT = i; reset(); draw(); });
    var row = group(controls, 'Actions');
    btn('Draw 100 new samples', row).addEventListener('click', function () { regen(); });
    btn('Draw 1,000 more (tally only)', row).addEventListener('click', function () { for (var r = 0; r < 10; r++) { gen(); tally(); } gen(); tally(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function gen() { samples = []; for (var k = 0; k < 100; k++) { var a = []; for (var i = 0; i < n; i++) a.push(MU + SIG * gauss()); samples.push([mean(a), sdv(a)]); } }
    function mult() { var p = 1 - (1 - levels[li]) / 2; return useT ? tinv(p, n - 1) : ninv(p); }
    function tally() { var m = mult(); samples.forEach(function (s) { total++; if (Math.abs(s[0] - MU) <= m * s[1] / Math.sqrt(n)) hits++; }); }
    function reset() { total = 0; hits = 0; tally(); }
    function regen() { gen(); reset(); draw(); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'One hundred confidence intervals for the same true mean'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(n));
      var L = 30, R = W - 10, T = 26, B = 250, lo = MU - 30, hi = MU + 30, m = mult(), miss = 0;
      var X = function (v) { return L + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (R - L); };
      var dy = (B - T) / 100;
      samples.forEach(function (s, k) {
        var h = m * s[1] / Math.sqrt(n), ok = Math.abs(s[0] - MU) <= h, y = T + (k + 0.5) * dy; if (!ok) miss++;
        el('line', { x1: X(s[0] - h), y1: y, x2: X(s[0] + h), y2: y, stroke: ok ? BLUE : RED, 'stroke-width': ok ? 1.3 : 2, opacity: ok ? 0.75 : 1 }, svg);
      });
      el('line', { x1: X(MU), y1: T - 4, x2: X(MU), y2: B + 2, stroke: c.ink, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, X(MU), T - 10, 'true mean μ = 50', { size: fs(10), fill: c.ink2 });
      axisX(svg, c, fs, L, R, B + 4, lo, hi, [20, 30, 40, 50, 60, 70, 80], 'value');
      out.innerHTML = '<strong>' + (100 - miss) + ' of these 100</strong> intervals contain the true mean (red: missed). Over all ' + total.toLocaleString('en-GB') + ' intervals drawn with these settings: <strong>' + pct(hits / total) + '</strong> captured μ, against a nominal ' + pct(levels[li], 0) + '.' +
        NOTE + 'Each line is a ' + pct(levels[li], 0) + ' interval, mean ± ' + fmt(m, 2) + ' × s/√' + n + ', from a different random sample of ' + n + ' values. The method captures μ in about ' + pct(levels[li], 0) + ' of samples; any single interval either contains μ or does not. ' + (useT ? 'The t multiplier makes the coverage right even for tiny samples.' : 'With the z multiplier and a sample SD, small samples give intervals that are too narrow: coverage falls short, as Gosset found.') + '</span>';
    }
    regen();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Student's t distribution
     ----------------------------------------------------------------------- */
  FIG['fig-t-dist'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var df = 4;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'td-df', label: 'Degrees of freedom (n − 1)', min: 1, max: 60, step: 1, value: df, onChange: function (x) { df = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Student t distribution compared with the normal'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(df));
      var L = 20, R = W - 20, T = 30, B = 196, lo = -5, hi = 5, ymax = 0.42;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - v / ymax * (B - T); };
      var tc = tinv(0.975, df), area = '', pn = '', pt = '';
      for (var i = 0; i <= 300; i++) { var v = lo + (hi - lo) * i / 300; pn += (i ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(npdf(v)).toFixed(1); pt += (i ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(tpdf(v, df)).toFixed(1); }
      [[lo, -tc], [tc, hi]].forEach(function (r) {
        var d = 'M' + X(r[0]).toFixed(1) + ' ' + B;
        for (var i = 0; i <= 60; i++) { var v = r[0] + (r[1] - r[0]) * i / 60; d += ' L' + X(v).toFixed(1) + ' ' + Y(tpdf(v, df)).toFixed(1); }
        el('path', { d: d + ' L' + X(r[1]).toFixed(1) + ' ' + B + ' Z', fill: RED, opacity: 0.25 }, svg);
      });
      el('path', { d: pn, fill: 'none', stroke: c.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }, svg);
      el('path', { d: pt, fill: 'none', stroke: BLUE, 'stroke-width': 2.5 }, svg);
      [-tc, tc].forEach(function (v) { if (v > lo && v < hi) { el('line', { x1: X(v), y1: B, x2: X(v), y2: Y(tpdf(v, df)) - 6, stroke: RED }, svg); } });
      if (tc < hi) txt(svg, Math.min(X(tc) + 4, R - 40), Y(tpdf(tc, df)) - 10, 't* = ' + fmt(tc, 2), { anchor: 'start', size: fs(10), fill: RED });
      txt(svg, L, 14, W < 560 ? 'blue: t · dashed: normal · red: outer 5%' : 'blue: t distribution · dashed grey: normal · red: the outer 5% of t', { anchor: 'start', size: fs(10), fill: c.muted });
      axisX(svg, c, fs, L, R, B, lo, hi, [-4, -2, 0, 2, 4], 'standard errors from the true mean');
      var zc = 1.96, extra = 1 - (tcdf(zc, df) - tcdf(-zc, df));
      out.innerHTML = 'With ' + df + ' degree' + (df > 1 ? 's' : '') + ' of freedom (a sample of ' + (df + 1) + '), a 95% interval needs <strong>t* = ' + fmt(tc, 3) + '</strong> standard errors, not 1.96. Using 1.96 would leave <strong>' + pct(extra) + '</strong> in the tails instead of 5%.' +
        NOTE + 'The t distribution has heavier tails because the sample standard deviation is itself uncertain. As n grows it approaches the normal: t* is 12.71 for n = 2, 2.26 for n = 10, 2.05 for n = 30 and 1.98 for n = 101.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Intervals for a proportion
     ----------------------------------------------------------------------- */
  FIG['fig-proportion'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 20, x = 2;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'pr-n', label: 'Number of trials n', min: 5, max: 200, step: 1, value: n, onChange: function (v) { n = v; if (x > n) { x = n; } s2.element.max = n; s2.setValue(x); draw(); } });
    var s2 = FIG.slider(controls, { id: 'pr-x', label: 'Successes x', min: 0, max: n, step: 1, value: x, onChange: function (v) { x = Math.min(v, n); draw(); } });
    var row = group(controls, 'Try');
    btn('7 defects in 50', row).addEventListener('click', function () { n = 50; x = 7; s1.setValue(n); s2.element.max = n; s2.setValue(x); draw(); });
    btn('0 in 20', row).addEventListener('click', function () { n = 20; x = 0; s1.setValue(n); s2.element.max = n; s2.setValue(x); draw(); });
    btn('50 in 100', row).addEventListener('click', function () { n = 100; x = 50; s1.setValue(n); s2.element.max = n; s2.setValue(x); draw(); });
    var svgWrap = div('', container), svgWrap2 = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var NAMES = ['Wald (textbook)', 'Wilson', 'Clopper–Pearson'], COLS = [RED, BLUE, PURPLE], KEYS = ['wald', 'wilson', 'cp'];
    var cache = {};
    function coverage(nn) {
      if (cache[nn]) return cache[nn];
      var iv = [], k, j, res = [[], [], []], P = [];
      for (k = 0; k <= nn; k++) iv.push(propIntervals(k, nn, 0.95));
      for (j = 1; j < 200; j++) {
        var p = j / 200, cov = [0, 0, 0], lp = Math.log(p), lq = Math.log(1 - p);
        for (k = 0; k <= nn; k++) {
          var pm = Math.exp(lgamma(nn + 1) - lgamma(k + 1) - lgamma(nn - k + 1) + k * lp + (nn - k) * lq);
          for (var q = 0; q < 3; q++) { var I = iv[k][KEYS[q]]; if (I[0] <= p + 1e-12 && p <= I[1] + 1e-12) cov[q] += pm; }
        }
        P.push(p); for (q = 0; q < 3; q++) res[q].push(cov[q]);
      }
      return (cache[nn] = { p: P, c: res });
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 130, 'Three 95% intervals for the observed proportion'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(n)); valText(s2, String(x));
      var iv = propIntervals(x, n, 0.95), ph = x / n, narrow = W < 560;
      var L = narrow ? 92 : 120, R = W - 24, X = function (v) { return L + v * (R - L); };
      KEYS.forEach(function (k, i) {
        var y = 22 + i * 26, I = iv[k];
        txt(svg, L - 8, y + 4, narrow ? NAMES[i].replace(' (textbook)', '').replace('Clopper–Pearson', 'Clopper–P.') : NAMES[i], { anchor: 'end', size: fs(10), fill: c.ink2 });
        el('line', { x1: X(I[0]), y1: y, x2: X(I[1]), y2: y, stroke: COLS[i], 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
        el('circle', { cx: X(ph), cy: y, r: 4, fill: c.ink }, svg);
      });
      axisX(svg, c, fs, L, R, 98, 0, 1, [0, 0.25, 0.5, 0.75, 1], null, function (t) { return pct(t, 0); });
      var B2 = newSVG(svgWrap2, container, 200, 'Actual coverage of each method across true proportions'), svg2 = B2.svg;
      var cv = coverage(n), L2 = 40, R2 = W - 24, T2 = 22, Bt = 160, ylo = 0.7, yhi = 1;
      var X2 = function (v) { return L2 + v * (R2 - L2); }, Y2 = function (v) { return Bt - (Math.max(ylo, v) - ylo) / (yhi - ylo) * (Bt - T2); };
      [0.7, 0.8, 0.9, 1].forEach(function (v) { el('line', { x1: L2, y1: Y2(v), x2: R2, y2: Y2(v), stroke: c.border, 'stroke-width': 0.6 }, svg2); txt(svg2, L2 - 5, Y2(v) + 4, pct(v, 0), { anchor: 'end', size: fs(9), fill: c.muted }); });
      el('line', { x1: L2, y1: Y2(0.95), x2: R2, y2: Y2(0.95), stroke: c.ink, 'stroke-dasharray': '4 3' }, svg2);
      for (var q = 0; q < 3; q++) { var d = ''; cv.p.forEach(function (p, j) { d += (j ? 'L' : 'M') + X2(p).toFixed(1) + ' ' + Y2(cv.c[q][j]).toFixed(1); }); el('path', { d: d, fill: 'none', stroke: COLS[q], 'stroke-width': 1.4 }, svg2); }
      txt(svg2, L2, 12, narrow ? 'Coverage vs true proportion (n = ' + n + ')' : 'Actual coverage of each “95%” method versus the true proportion (n = ' + n + ')', { anchor: 'start', size: fs(10), fill: c.muted });
      axisX(svg2, c, fs, L2, R2, Bt, 0, 1, [0, 0.25, 0.5, 0.75, 1], 'true proportion', function (t) { return pct(t, 0); });
      var f = function (I) { return pct(I[0]) + ' to ' + pct(I[1]); };
      var worst = Math.min.apply(null, cv.c[0]);
      out.innerHTML = 'Observed ' + x + ' of ' + n + ' = <strong>' + pct(ph) + '</strong>. 95% intervals: <span style="color:' + RED + '">Wald ' + f(iv.wald) + '</span> · <span style="color:' + BLUE + '">Wilson ' + f(iv.wilson) + '</span> · <span style="color:' + PURPLE + '">Clopper–Pearson ' + f(iv.cp) + '</span>.' +
        NOTE + 'Lower panel: how often each method really captures the true proportion, for every possible truth. The Wald interval, p̂ ± 1.96√(p̂(1 − p̂)/n), dips as low as ' + pct(worst, 0) + ' here, worst near 0% and 100%' + (x === 0 || x === n ? ', and for ' + x + ' of ' + n + ' it has zero width, which is absurd' : '') + '. Wilson stays close to 95%; Clopper–Pearson never falls below 95% but is wider than necessary.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. The bootstrap
     ----------------------------------------------------------------------- */
  FIG['fig-bootstrap'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var DATA = [2.1, 2.4, 2.6, 2.9, 3.1, 3.3, 3.6, 3.8, 4.4, 5.0, 5.9, 7.2, 8.8, 12.5, 19.0];
    var stat = 1, boots = [], last = null;
    var controls = div('fig-controls', container);
    choice(controls, 'Statistic', ['Mean', 'Median'], stat, function (i) { stat = i; boots = []; last = null; draw(); });
    var row = group(controls, 'Resample');
    btn('1 resample', row).addEventListener('click', function () { one(); draw(); });
    btn('1,000 resamples', row).addEventListener('click', function () { for (var i = 0; i < 1000; i++) one(); draw(); });
    btn('Clear', row).addEventListener('click', function () { boots = []; last = null; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function S(a) { return stat ? median(a) : mean(a); }
    function one() { var idx = [], a = []; for (var i = 0; i < DATA.length; i++) { var j = Math.floor(Math.random() * DATA.length); idx.push(j); a.push(DATA[j]); } last = idx; boots.push(S(a)); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Bootstrap distribution of the statistic'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 20, R = W - 14, lo = 0, hi = 20, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      txt(svg, L, 14, W < 560 ? 'The sample: 15 values (grey); one resample (orange)' : 'The sample (15 values); a resample draws 15 of them with replacement', { anchor: 'start', size: fs(10), fill: c.muted });
      var counts = {};
      if (last) last.forEach(function (j) { counts[j] = (counts[j] || 0) + 1; });
      DATA.forEach(function (v, j) {
        el('circle', { cx: X(v), cy: 40, r: 5, fill: c.faint }, svg);
        for (var k = 0; k < (counts[j] || 0); k++) el('circle', { cx: X(v), cy: 58 + k * 9, r: 3.6, fill: AMBER }, svg);
      });
      var obs = S(DATA);
      el('line', { x1: X(obs), y1: 30, x2: X(obs), y2: 284, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      var Bt = 254, T = 110;
      axisX(svg, c, fs, L, R, Bt, lo, hi, [0, 5, 10, 15, 20], 'value');
      var ci = null;
      if (boots.length) {
        var bw = 0.25, bins = {}, mx = 0;
        boots.forEach(function (b) { var k = Math.floor(b / bw); bins[k] = (bins[k] || 0) + 1; if (bins[k] > mx) mx = bins[k]; });
        Object.keys(bins).forEach(function (k) { var h = bins[k] / mx * (Bt - T - 8); el('rect', { x: X(k * bw), y: Bt - h, width: Math.max(1, X(bw) - X(0) - 1), height: h, fill: BLUE, opacity: 0.75 }, svg); });
        if (boots.length >= 100) {
          var s = boots.slice().sort(function (a, b) { return a - b; }); ci = [quantile(s, 0.025), quantile(s, 0.975)];
          el('rect', { x: X(ci[0]), y: T - 6, width: X(ci[1]) - X(ci[0]), height: Bt - T + 6, fill: GREEN, opacity: 0.12 }, svg);
          [ci[0], ci[1]].forEach(function (v) { el('line', { x1: X(v), y1: T - 6, x2: X(v), y2: Bt, stroke: GREEN, 'stroke-width': 1.5 }, svg); });
        }
      }
      txt(svg, Math.min(X(obs) + 4, R - 90), T - 12, (stat ? 'sample median ' : 'sample mean ') + fmt(obs, 2), { anchor: 'start', size: fs(10), fill: c.ink2 });
      var sd = boots.length > 1 ? sdv(boots) : 0;
      out.innerHTML = 'Resamples so far: <strong>' + boots.length.toLocaleString('en-GB') + '</strong>.' + (boots.length > 1 ? ' Bootstrap standard error of the ' + (stat ? 'median' : 'mean') + ': <strong>' + fmt(sd, 2) + '</strong>.' : '') +
        (ci ? ' 95% percentile interval (green): <strong>' + fmt(ci[0], 2) + ' to ' + fmt(ci[1], 2) + '</strong>.' : boots.length ? ' Draw at least 100 resamples to see an interval.' : ' Press a button to start.') +
        NOTE + 'Orange dots show which values the latest resample picked: some twice or more, some not at all. Each resample gives a new ' + (stat ? 'median' : 'mean') + '; the spread of those values (blue) estimates how much the statistic would vary between real samples. No formula is needed, which is why the bootstrap works for medians, ratios and other awkward statistics. Notice how lopsided the interval is for skewed data.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Error bars: SD, SE or CI?
     ----------------------------------------------------------------------- */
  FIG['fig-error-bars'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 10, diff = 1.0, kind = 2;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'eb-n', label: 'Measurements per group', min: 3, max: 50, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'eb-d', label: 'Difference between means (in SDs)', min: 0, max: 2.5, step: 0.05, value: diff, onChange: function (x) { diff = x; draw(); } });
    choice(controls, 'Error bars show', ['± 1 SD', '± 1 SE', '95% CI'], kind, function (i) { kind = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Two group means with error bars'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(n)); valText(s2, fmt(diff, 2));
      var se = 1 / Math.sqrt(n), arm = [1, se, tinv(0.975, n - 1) * se][kind];
      var L = 50, R = W - 20, T = 20, B = 210, lo = -2, hi = 4.5;
      var Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
      [-2, -1, 0, 1, 2, 3, 4].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      var xs = [L + (R - L) * 0.32, L + (R - L) * 0.68], ms = [0, diff], cols = [BLUE, AMBER];
      xs.forEach(function (x, i) {
        el('line', { x1: x, y1: Y(ms[i] - arm), x2: x, y2: Y(ms[i] + arm), stroke: cols[i], 'stroke-width': 2.5 }, svg);
        [ms[i] - arm, ms[i] + arm].forEach(function (v) { el('line', { x1: x - 10, y1: Y(v), x2: x + 10, y2: Y(v), stroke: cols[i], 'stroke-width': 2.5 }, svg); });
        el('circle', { cx: x, cy: Y(ms[i]), r: 6, fill: cols[i] }, svg);
        txt(svg, x, B + 22, 'Group ' + 'AB'[i], { size: fs(11), fill: c.ink2 });
      });
      var df = 2 * n - 2, tstat = diff / Math.sqrt(2 / n), p = 2 * (1 - tcdf(tstat, df));
      var gap = diff - 2 * arm, rel = gap / arm;
      var ov = gap >= 0 ? 'do not overlap (gap ' + fmt(gap, 2) + ')' : 'overlap by ' + fmt(-gap, 2) + ' (' + fmt(-rel * 100, 0) + '% of one arm)';
      var hd = tinv(0.975, df) * Math.sqrt(2 / n);
      out.innerHTML = 'The bars ' + ov + '. A two-sample t-test gives <strong>p = ' + (p < 0.001 ? '&lt; 0.001' : fmt(p, 3)) + '</strong>; the 95% CI for the difference is <strong>' + fmt(diff - hd, 2) + ' to ' + fmt(diff + hd, 2) + '</strong>.' +
        NOTE + ['SD bars describe the spread of individual measurements; they say nothing directly about how well the means are known.', 'SE bars are short: even a clear gap between them can mean p &gt; 0.05. For n ≥ 10, a gap of about one arm’s length corresponds to p ≈ 0.05.', '95% CI bars can overlap and the difference still be significant: for n ≥ 10, overlap of about half an arm corresponds to p ≈ 0.05, and bars just touching to p ≈ 0.01.'][kind] + ' Always say which kind of bar you plot.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. How many measurements?
     ----------------------------------------------------------------------- */
  FIG['fig-sample-size'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mode = 1, sigma = 2, E = 0.5, d = 0.5, alpha = 0.05, power = 0.8;
    var controls = div('fig-controls', container);
    var modeRow = choice(controls, 'Goal', ['Estimate a mean to ± E', 'Detect a difference between two groups'], mode, function (i) { mode = i; build(); draw(); });
    var box = div('', controls), sl = {};
    box.style.cssText = 'display:contents;';
    function build() {
      box.innerHTML = ''; sl = {};
      if (mode === 0) {
        sl.s = FIG.slider(box, { id: 'ss-s', label: 'Standard deviation σ', min: 0.5, max: 5, step: 0.1, value: sigma, onChange: function (x) { sigma = x; draw(); } });
        sl.e = FIG.slider(box, { id: 'ss-e', label: 'Margin of error E (95%)', min: 0.1, max: 2, step: 0.05, value: E, onChange: function (x) { E = x; draw(); } });
      } else {
        sl.d = FIG.slider(box, { id: 'ss-d', label: 'Effect size d (difference ÷ SD)', min: 0.1, max: 1.5, step: 0.05, value: d, onChange: function (x) { d = x; draw(); } });
        sl.p = FIG.slider(box, { id: 'ss-p', label: 'Desired power', min: 0.5, max: 0.99, step: 0.01, value: power, onChange: function (x) { power = x; draw(); } });
        sl.a = FIG.slider(box, { id: 'ss-a', label: 'Significance level α', min: 0.01, max: 0.1, step: 0.01, value: alpha, onChange: function (x) { alpha = x; draw(); } });
      }
    }
    build();
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function pw(nn) { var df = 2 * nn - 2, tc = tinv(1 - alpha / 2, df), del = d * Math.sqrt(nn / 2); return 1 - tcdf(tc - del, df) + tcdf(-tc - del, df); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, mode ? 'Power against sample size' : 'Margin of error against sample size'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 46, R = W - 14, T = 24, B = 180, nmax = mode ? Math.max(40, Math.min(1000, Math.ceil(2.5 * 2 * Math.pow((1.96 + 0.84) / d, 2)))) : 300;
      var X = function (v) { return L + v / nmax * (R - L); };
      var nreq, y0, y1, f, yl, ticksY;
      if (mode === 0) {
        valText(sl.s, fmt(sigma, 1)); valText(sl.e, fmt(E, 2));
        nreq = Math.ceil(Math.pow(1.96 * sigma / E, 2));
        f = function (nn) { return tinv(0.975, Math.max(1, nn - 1)) * sigma / Math.sqrt(nn); }; y0 = 0; y1 = Math.max(2 * E, 1.96 * sigma / Math.sqrt(5)); yl = '95% margin of error';
      } else {
        valText(sl.d, fmt(d, 2)); valText(sl.p, pct(power, 0)); valText(sl.a, fmt(alpha, 2));
        var za = ninv(1 - alpha / 2), zb = ninv(power); nreq = Math.ceil(2 * Math.pow((za + zb) / d, 2) + za * za / 4);
        f = pw; y0 = 0; y1 = 1; yl = 'power';
      }
      var Y = function (v) { return B - (Math.max(y0, Math.min(y1, v)) - y0) / (y1 - y0) * (B - T); };
      for (var k = 0; k <= 4; k++) { var v = y0 + (y1 - y0) * k / 4; el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 5, Y(v) + 4, mode ? pct(v, 0) : fmt(v, 2), { anchor: 'end', size: fs(9), fill: c.muted }); }
      var path = '';
      for (var nn = 2; nn <= nmax; nn += Math.max(1, Math.round(nmax / 200))) path += (path ? 'L' : 'M') + X(nn).toFixed(1) + ' ' + Y(f(nn)).toFixed(1);
      el('path', { d: path, fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, svg);
      var target = mode ? power : E;
      el('line', { x1: L, y1: Y(target), x2: R, y2: Y(target), stroke: RED, 'stroke-dasharray': '4 3' }, svg);
      if (nreq <= nmax) { el('line', { x1: X(nreq), y1: Y(target), x2: X(nreq), y2: B, stroke: GREEN, 'stroke-width': 1.5 }, svg); el('circle', { cx: X(nreq), cy: Y(target), r: 5, fill: GREEN }, svg); }
      txt(svg, L, 14, yl + (mode ? ' (approximate)' : ''), { anchor: 'start', size: fs(10), fill: c.muted });
      var st = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500].filter(function (v) { return nmax / v <= 6; })[0] || 1000, tk = []; for (var q = 0; q <= nmax; q += st) tk.push(q);
      axisX(svg, c, fs, L, R, B, 0, nmax, tk, mode ? 'measurements per group' : 'number of measurements');
      if (mode === 0) {
        out.innerHTML = 'To estimate the mean to within <strong>± ' + fmt(E, 2) + '</strong> with 95% confidence when σ = ' + fmt(sigma, 1) + ', you need about <strong>n = (1.96σ/E)² ≈ ' + nreq + '</strong> measurements.' +
          NOTE + 'Halving the margin needs four times as many measurements, because the margin shrinks as 1/√n. The curve uses the t multiplier, so for small n it lies a little above the simple formula.</span>';
      } else {
        var p20 = pw(20);
        out.innerHTML = 'To detect a difference of <strong>d = ' + fmt(d, 2) + '</strong> standard deviations with ' + pct(power, 0) + ' power at α = ' + fmt(alpha, 2) + ', you need about <strong>' + nreq + ' measurements per group</strong> (' + 2 * nreq + ' in total).' +
          NOTE + 'With only 20 per group, the power would be about ' + pct(p20, 0) + ': a real effect of this size would be missed ' + pct(1 - p20, 0) + ' of the time. Small effects need large samples: d = 0.2 needs about 394 per group, d = 0.5 about 64, and d = 0.8 about 26.</span>';
      }
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d4'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A sample mean is an example of…', options: ['A parameter', 'A statistic used as an estimate of a parameter', 'A population', 'A confidence level'], answer: 1, explanation: 'Parameters describe the population; statistics are calculated from samples to estimate them.' },
      { question: 'Why does the sample standard deviation divide by n − 1 rather than n?', options: ['It is a tradition', 'Dividing by n underestimates the population variance on average', 'To make it larger for small samples only', 'Because one value is always wrong'], answer: 1, explanation: 'The deviations are measured from the sample mean, which sits closer to the data than the true mean; n − 1 corrects the bias.' },
      { question: 'A 95% confidence interval for a mean is 4.2 to 5.8. Which statement is correct?', options: ['There is a 95% probability that the true mean is between 4.2 and 5.8', '95% of individual values lie between 4.2 and 5.8', 'The method used gives intervals that capture the true mean in 95% of samples', '95% of future sample means will lie between 4.2 and 5.8'], answer: 2, explanation: 'The 95% describes the long-run performance of the method, not the probability for this particular interval.' },
      { question: 'For a sample of 5, the 95% t multiplier is 2.78. Why is it larger than 1.96?', options: ['Small samples are biased', 'The sample SD is itself uncertain, so the t distribution has heavier tails', 'Because 5 is odd', 'It is a rounding error'], answer: 1, explanation: 'Gosset’s t distribution accounts for estimating σ from the data.' },
      { question: 'To halve the width of a confidence interval, you need roughly…', options: ['Twice as many measurements', 'Four times as many measurements', 'Half as many measurements', 'The same number at a higher confidence level'], answer: 1, explanation: 'Width shrinks as 1/√n.' },
      { question: 'You observe 0 failures in 300 trials. A quick 95% upper limit on the failure rate is…', options: ['0%', 'About 1% (the rule of three: 3/300)', '0.33%', 'It cannot be estimated'], answer: 1, explanation: 'Zero events does not mean zero probability; 3/n is a good upper limit.' },
      { question: 'Which interval for a proportion is known to perform badly for small samples or proportions near 0 or 1?', options: ['Wilson', 'Clopper–Pearson', 'The simple Wald interval p̂ ± 1.96√(p̂(1 − p̂)/n)', 'Bootstrap'], answer: 2, explanation: 'Its coverage can fall far below 95%; Wilson or Clopper–Pearson are better choices.' },
      { question: 'What does the bootstrap do?', options: ['Collects more data', 'Resamples the observed data with replacement to estimate the variability of a statistic', 'Removes outliers', 'Makes data normal'], answer: 1, explanation: 'It uses the sample as a stand-in for the population.' },
      { question: 'Two groups have 95% CI error bars that overlap slightly. Can the difference be statistically significant?', options: ['No, never', 'Yes: modest overlap of 95% CIs is consistent with p < 0.05', 'Only if n > 1000', 'Only for SD bars'], answer: 1, explanation: 'Overlapping 95% CIs do not imply p > 0.05; compute the CI of the difference instead.' },
      { question: 'A study has 20% power to detect the effect it is looking for. This means…', options: ['The effect is 20% large', 'If the effect is real, the study will usually miss it', 'There is a 20% chance the effect is real', 'The p-value will be 0.2'], answer: 1, explanation: 'Low power means real effects are often missed, and significant results tend to exaggerate effect sizes.' }
    ]);
  };
})();
