/* ==========================================================================
   RNLearn — Counts and Categories (Making Sense of Data, Part 8)
   Figures:
     1. fig-count-timeline   The story at a glance (clickable timeline)
     2. fig-gof              The chi-square goodness-of-fit test
     3. fig-contingency      A 2 x 2 table: chi-square, Fisher, risk and odds
     4. fig-overdispersion   Poisson counts and overdispersion
     5. fig-kappa            Cohen's kappa and chance agreement
     6. fig-quiz-d8          Test yourself
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
    { name: 'Counting in nature', color: '#15803d' },
    { name: 'Testing tables', color: '#1d4ed8' },
    { name: 'Beyond the 2 × 2 table', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1866', icon: '🫛', era: 0, sec: 4, title: 'Mendel’s peas', text: 'Gregor Mendel publishes counts of pea plants showing ratios close to 3:1 and 9:3:3:1, the foundation of genetics.' },
    { year: '1900', icon: '🧮', era: 1, sec: 4, title: 'Pearson’s chi-square', text: 'Karl Pearson introduces the χ² test of how well observed counts fit expected ones.' },
    { year: '1907', icon: '🍺', era: 0, sec: 9, title: 'Counting yeast cells', text: 'W. S. Gosset (“Student”) shows that counts of yeast cells in a haemacytometer follow the Poisson distribution.' },
    { year: '1922', icon: '🔧', era: 1, sec: 5, title: 'Degrees of freedom', text: 'Ronald Fisher corrects the degrees of freedom for the χ² test of a contingency table, to (r − 1)(c − 1).' },
    { year: '1934', icon: '✂️', era: 1, sec: 6, title: 'Yates’s correction', text: 'Frank Yates proposes a continuity correction for χ² tests of small 2 × 2 tables.' },
    { year: '1935', icon: '☕', era: 1, sec: 6, title: 'An exact test', text: 'Fisher describes an exact test for a 2 × 2 table, illustrated by a lady who claimed she could taste whether milk was added before the tea.' },
    { year: '1936', icon: '🔍', era: 0, sec: 15, title: 'Too good to be true?', text: 'Fisher argues that Mendel’s published counts agree with theory more closely than chance would allow.' },
    { year: '1947', icon: '🔁', era: 1, sec: 7, title: 'McNemar’s test', text: 'Quinn McNemar gives a test for comparing two proportions measured on the same subjects.' },
    { year: '1954', icon: '📏', era: 1, sec: 6, title: 'Cochran’s rules', text: 'William Cochran sets out guidance on when χ² approximations can be trusted, including the famous “expected counts of at least 5”.' },
    { year: '1959', icon: '🧩', era: 2, sec: 8, title: 'Mantel–Haenszel', text: 'Nathan Mantel and William Haenszel show how to combine 2 × 2 tables across strata to adjust for confounding.' },
    { year: '1960', icon: '🤝', era: 2, sec: 11, title: 'Cohen’s kappa', text: 'Jacob Cohen proposes kappa, a measure of agreement between raters corrected for chance.' },
    { year: '1972', icon: '🧬', era: 2, sec: 9, title: 'Generalised linear models', text: 'John Nelder and Robert Wedderburn unify regression for counts, proportions and continuous data in one framework.' }
  ];

  FIG['fig-count-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1866 to 1972');
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

  function gammaP(a, x) {
    if (x <= 0) return 0;
    var gln = lgamma(a), n, sum, del, ap;
    if (x < a + 1) { ap = a; sum = del = 1 / a; for (n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; } return sum * Math.exp(-x + a * Math.log(x) - gln); }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (n = 1; n < 300; n++) { var an = -n * (n - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var dl = d * c; h *= dl; if (Math.abs(dl - 1) < 1e-14) break; }
    return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
  }

  function pfmt(p) { return p < 0.0001 ? '&lt; 0.0001' : '= ' + (p < 0.001 ? fmt(p, 4) : fmt(p, 3)); }
  function chi2sf(x, k) { return x <= 0 ? 1 : 1 - gammaP(k / 2, x / 2); }
  function lfact(n) { return lgamma(n + 1); }
  function fisherExact(a, b, c, d) {
    var r1 = a + b, r2 = c + d, c1 = a + c, n = r1 + r2;
    var lp = function (x) { return lfact(r1) + lfact(r2) + lfact(c1) + lfact(n - c1) - lfact(n) - lfact(x) - lfact(r1 - x) - lfact(c1 - x) - lfact(r2 - c1 + x); };
    var p0 = lp(a), s = 0, lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1);
    for (var x = lo; x <= hi; x++) { var l = lp(x); if (l <= p0 + 1e-7) s += Math.exp(l); }
    return Math.min(1, s);
  }
  var GCOL = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777', '#0891b2'];

  /* -----------------------------------------------------------------------
     Figure 2. Goodness of fit
     ----------------------------------------------------------------------- */
  FIG['fig-gof'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SETS = [
      { name: 'Mendel’s peas', labels: ['Round yellow', 'Round green', 'Wrinkled yellow', 'Wrinkled green'], short: ['RY', 'RG', 'WY', 'WG'], obs: [315, 108, 101, 32], ratio: [9, 3, 3, 1], note: 'Mendel’s 1866 counts for seed shape and colour, against the 9:3:3:1 ratio predicted by his theory of inheritance.' },
      { name: 'A fair die?', labels: ['1', '2', '3', '4', '5', '6'], obs: [8, 9, 12, 7, 10, 14], ratio: [1, 1, 1, 1, 1, 1], note: '60 rolls of a die. The counts look uneven, but is that more than chance?' },
      { name: 'A loaded die?', labels: ['1', '2', '3', '4', '5', '6'], obs: [6, 7, 8, 9, 10, 20], ratio: [1, 1, 1, 1, 1, 1], note: 'Another 60 rolls, with far too many sixes.' },
      { name: 'Roll your own (fair die)', labels: ['1', '2', '3', '4', '5', '6'], obs: null, ratio: [1, 1, 1, 1, 1, 1], note: 'Simulated rolls of a perfectly fair die. Roll again and again: about 1 time in 20 the test will wrongly call it unfair.' }
    ];
    var si = 0, rolls = 60, own = null;
    var controls = div('fig-controls', container);
    choice(controls, 'Data', SETS.map(function (s) { return s.name; }), si, function (i) { si = i; if (i === 3 && !own) roll(); draw(); });
    var row = group(controls, 'Actions');
    btn('Roll 60 times', row).addEventListener('click', function () { si = 3; roll(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function roll() { own = [0, 0, 0, 0, 0, 0]; for (var i = 0; i < rolls; i++) own[Math.floor(Math.random() * 6)]++; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Observed and expected counts'), W = A.W, svg = A.svg, fs = A.fs, s = SETS[si];
      if (si === 3 && !own) roll();
      var obs = si === 3 ? own : s.obs, N = obs.reduce(function (a, b) { return a + b; }, 0), R = s.ratio.reduce(function (a, b) { return a + b; }, 0);
      var exp = s.ratio.map(function (r) { return N * r / R; }), contrib = obs.map(function (o, i) { return (o - exp[i]) * (o - exp[i]) / exp[i]; });
      var chi = contrib.reduce(function (a, b) { return a + b; }, 0), df = obs.length - 1, p = chi2sf(chi, df);
      var mx = Math.max.apply(null, obs.concat(exp)) * 1.15, L = 44, Rr = W - 14, T = 22, B = 190, k = obs.length, gw = (Rr - L) / k;
      var Y = function (v) { return B - v / mx * (B - T); }, narrow = W < 560;
      var st = [1, 2, 5, 10, 20, 25, 50, 100, 200].filter(function (q) { return mx / q <= 5; })[0] || 500; for (var v = 0; v <= mx; v += st) { el('line', { x1: L, y1: Y(v), x2: Rr, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); }
      obs.forEach(function (o, i) {
        var x = L + gw * i, bw = gw * 0.34;
        el('rect', { x: x + gw * 0.14, y: Y(o), width: bw, height: B - Y(o), fill: BLUE, opacity: 0.85 }, svg);
        el('rect', { x: x + gw * 0.52, y: Y(exp[i]), width: bw, height: B - Y(exp[i]), fill: c.faint }, svg);
        txt(svg, x + gw * 0.5, B + 16, narrow && s.short ? s.short[i] : s.labels[i], { size: fs(10), fill: c.ink2 });
        txt(svg, x + gw * 0.5, B + 30, '+' + fmt(contrib[i], 2), { size: fs(9), fill: contrib[i] > 3.84 ? RED : c.muted });
      });
      txt(svg, L, 12, narrow ? 'blue: observed · grey: expected' : 'blue: observed · grey: expected · below: each category’s share of χ²', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'χ² = Σ(O − E)²/E = <strong>' + fmt(chi, 2) + '</strong> with ' + df + ' degrees of freedom, <strong>p ' + pfmt(p) + '</strong> (N = ' + N + ').' + NOTE + s.note + ' ' +
        (p < 0.05 ? 'The deviations are larger than chance would usually produce: the data do not fit the expected ratio.' : 'The deviations are about what chance alone would produce: no evidence against the expected ratio.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. A 2 × 2 table
     ----------------------------------------------------------------------- */
  FIG['fig-contingency'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 45, b = 15, cc = 30, d = 30;
    var controls = div('fig-controls', container);
    var sa = FIG.slider(controls, { id: 'ct-a', label: 'Treated: germinated', min: 0, max: 100, step: 1, value: a, onChange: function (x) { a = x; draw(); } });
    var sb = FIG.slider(controls, { id: 'ct-b', label: 'Treated: did not', min: 0, max: 100, step: 1, value: b, onChange: function (x) { b = x; draw(); } });
    var sc = FIG.slider(controls, { id: 'ct-c', label: 'Control: germinated', min: 0, max: 100, step: 1, value: cc, onChange: function (x) { cc = x; draw(); } });
    var sd = FIG.slider(controls, { id: 'ct-d', label: 'Control: did not', min: 0, max: 100, step: 1, value: d, onChange: function (x) { d = x; draw(); } });
    var row = group(controls, 'Try');
    function set(v) { a = v[0]; b = v[1]; cc = v[2]; d = v[3]; sa.setValue(a); sb.setValue(b); sc.setValue(cc); sd.setValue(d); draw(); }
    btn('Worked example', row).addEventListener('click', function () { set([45, 15, 30, 30]); });
    btn('Small sample', row).addEventListener('click', function () { set([7, 1, 2, 6]); });
    btn('Same proportions', row).addEventListener('click', function () { set([40, 20, 40, 20]); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 140, 'Proportion germinating in each group'), W = A.W, svg = A.svg, fs = A.fs;
      valText(sa, String(a)); valText(sb, String(b)); valText(sc, String(cc)); valText(sd, String(d));
      var n1 = a + b, n2 = cc + d, N = n1 + n2, c1 = a + cc, c2 = b + d;
      var L = 90, R = W - 60;
      [[a, n1, 'Treated', BLUE], [cc, n2, 'Control', AMBER]].forEach(function (g, i) {
        var y = 20 + i * 46, p = g[1] ? g[0] / g[1] : 0;
        txt(svg, L - 8, y + 16, g[2], { anchor: 'end', size: fs(11), fill: c.ink2 });
        el('rect', { x: L, y: y, width: R - L, height: 24, fill: c.sunken, rx: 3 }, svg);
        el('rect', { x: L, y: y, width: (R - L) * p, height: 24, fill: g[3], rx: 3 }, svg);
        txt(svg, R + 6, y + 16, pct(p, 0), { anchor: 'start', size: fs(11), fill: c.ink2 });
      });
      txt(svg, L, 122, 'share germinating (n = ' + n1 + ' and ' + n2 + ')', { anchor: 'start', size: fs(10), fill: c.muted });
      if (!n1 || !n2 || !c1 || !c2) { out.innerHTML = 'Every row and column needs at least one count.'; return; }
      var E = [n1 * c1 / N, n1 * c2 / N, n2 * c1 / N, n2 * c2 / N], O = [a, b, cc, d], chi = 0, chiY = 0;
      O.forEach(function (o, i) { chi += (o - E[i]) * (o - E[i]) / E[i]; var dd = Math.max(0, Math.abs(o - E[i]) - 0.5); chiY += dd * dd / E[i]; });
      var p = chi2sf(chi, 1), pY = chi2sf(chiY, 1), pF = fisherExact(a, b, cc, d), minE = Math.min.apply(null, E);
      var p1 = a / n1, p2 = cc / n2, rr = p1 / p2, orr = (a * d) / (b * cc);
      var seLOR = Math.sqrt(1 / a + 1 / b + 1 / cc + 1 / d), seLRR = Math.sqrt(1 / a - 1 / n1 + 1 / cc - 1 / n2);
      var ci = function (v, se) { return isFinite(se) && v > 0 && isFinite(v) ? ' (95% CI ' + fmt(v * Math.exp(-1.96 * se), 2) + ' to ' + fmt(v * Math.exp(1.96 * se), 2) + ')' : ''; };
      out.innerHTML = 'Difference in proportions: <strong>' + fmt(100 * (p1 - p2), 1) + '</strong> percentage points. Risk ratio <strong>' + (isFinite(rr) ? fmt(rr, 2) : '∞') + '</strong>' + ci(rr, seLRR) + '; odds ratio <strong>' + (isFinite(orr) ? fmt(orr, 2) : '∞') + '</strong>' + ci(orr, seLOR) + '.<br>' +
        'χ² test: χ² = ' + fmt(chi, 2) + ', <strong>p ' + pfmt(p) + '</strong> · with Yates’s correction: p ' + pfmt(pY) + ' · Fisher’s exact test: <strong>p ' + pfmt(pF) + '</strong>.' +
        NOTE + 'Expected counts if germination were independent of treatment: ' + E.map(function (e) { return fmt(e, 1); }).join(', ') + '. ' + (minE < 5 ? '<strong style="color:' + RED + '">The smallest expected count is below 5, so the χ² approximation is doubtful: rely on Fisher’s exact test.</strong>' : 'All expected counts are at least 5, so the χ² test and Fisher’s exact test should broadly agree.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Poisson counts and overdispersion
     ----------------------------------------------------------------------- */
  FIG['fig-overdispersion'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var mu = 10, extra = 0, n = 12, U = [], G = [];
    function rgamma(k) { if (k < 1) return rgamma(k + 1) * Math.pow(Math.random(), 1 / k); var d = k - 1 / 3, cc = 1 / Math.sqrt(9 * d); for (;;) { var x = gauss(), v = Math.pow(1 + cc * x, 3); if (v <= 0) continue; var u = Math.random(); if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v; } }
    function rpois(l) { var L = Math.exp(-l), k = 0, p = 1; if (l > 50) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); do { k++; p *= Math.random(); } while (p > L); return k - 1; }
    function gen() { U = []; G = []; for (var i = 0; i < 60; i++) { U.push(Math.random()); G.push(null); } }
    var cache = null;
    function sample() { var out = []; for (var i = 0; i < n; i++) { var lam = extra > 0 ? mu * rgamma(1 / extra) * extra : mu; out.push(rpois(lam)); } return out; }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'od-m', label: 'Mean count per plate', min: 1, max: 40, step: 1, value: mu, onChange: function (x) { mu = x; cache = sample(); draw(); } });
    var s2 = FIG.slider(controls, { id: 'od-e', label: 'Extra plate-to-plate variation', min: 0, max: 1, step: 0.02, value: extra, onChange: function (x) { extra = x; cache = sample(); draw(); } });
    var s3 = FIG.slider(controls, { id: 'od-n', label: 'Number of plates', min: 5, max: 40, step: 1, value: n, onChange: function (x) { n = x; cache = sample(); draw(); } });
    var row = group(controls, 'Actions');
    btn('New plates', row).addEventListener('click', function () { cache = sample(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    cache = sample();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 220, 'Counts on each plate compared with the Poisson distribution'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(mu)); valText(s2, fmt(extra, 2)); valText(s3, String(n));
      var x = cache, m = mean(x), v = x.length > 1 ? Math.pow(sdv(x), 2) : 0, D = x.reduce(function (s, y) { return s + (y - m) * (y - m); }, 0) / Math.max(m, 1e-9), p = chi2sf(D, n - 1);
      var hi = Math.max(Math.max.apply(null, x), mu + 4 * Math.sqrt(mu)) + 2, L = 40, R = W - 14, T = 24, B = 170;
      var X = function (k) { return L + (k + 0.5) / (hi + 1) * (R - L); }, cnt = {}, cmax = 1;
      x.forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; cmax = Math.max(cmax, cnt[k]); });
      var pm = function (k) { return Math.exp(k * Math.log(m) - m - lgamma(k + 1)); }, pmax = 0;
      for (var k = 0; k <= hi; k++) pmax = Math.max(pmax, n * pm(k));
      var ymax = Math.max(cmax, pmax) * 1.15, Y = function (q) { return B - q / ymax * (B - T); }, bw = Math.max(2, (R - L) / (hi + 1) - 1);
      Object.keys(cnt).forEach(function (k) { el('rect', { x: X(+k) - bw / 2, y: Y(cnt[k]), width: bw, height: B - Y(cnt[k]), fill: BLUE, opacity: 0.8 }, svg); });
      var d = ''; for (k = 0; k <= hi; k++) d += (k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(n * pm(k)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      var step = hi > 60 ? 20 : hi > 25 ? 10 : 5; for (k = 0; k <= hi; k += step) txt(svg, X(k), B + 16, String(k), { size: fs(10), fill: c.muted });
      txt(svg, (L + R) / 2, B + 32, 'count per plate', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, W < 560 ? 'blue: plates · red: Poisson' : 'blue: number of plates with each count · red: expected if counts were Poisson with the same mean', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Mean <strong>' + fmt(m, 1) + '</strong>, variance <strong>' + fmt(v, 1) + '</strong>, ratio ' + fmt(v / Math.max(m, 1e-9), 2) + '. Dispersion test: D = Σ(x − x̄)²/x̄ = ' + fmt(D, 1) + ' on ' + (n - 1) + ' degrees of freedom, <strong>p ' + pfmt(p) + '</strong>.' +
        NOTE + 'For Poisson counts the variance equals the mean, so the ratio should be near 1. ' + (p < 0.05 ? 'Here the counts vary far more than Poisson allows: <strong>overdispersion</strong>. A standard error of √x̄/√n would be too small; use a negative binomial or quasi-Poisson model, or treat plates as the unit of analysis.' : 'Here the scatter is consistent with pure Poisson counting noise.') + ' Raise the extra variation to mimic plates that genuinely differ.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Cohen's kappa
     ----------------------------------------------------------------------- */
  FIG['fig-kappa'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var agree = 0.9, prev = 0.5, N = 100;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'kp-a', label: 'Raw agreement', min: 0.5, max: 1, step: 0.01, value: agree, onChange: function (x) { agree = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'kp-p', label: 'Share of samples rated positive', min: 0.05, max: 0.95, step: 0.01, value: prev, onChange: function (x) { prev = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 170, 'Two raters’ classifications of 100 samples'), W = A.W, svg = A.svg, fs = A.fs;
      var dis = 1 - agree, maxDis = 2 * Math.min(prev, 1 - prev); if (dis > maxDis) dis = maxDis;
      var bb = N * dis / 2, aa = N * prev - bb, dd = N * (1 - prev) - bb;
      valText(s1, pct(1 - dis, 0)); valText(s2, pct(prev, 0));
      var po = (aa + dd) / N, pe = prev * prev + (1 - prev) * (1 - prev), k = (po - pe) / (1 - pe);
      var cw = Math.min(110, (W - 140) / 2), L = (W - 2 * cw) / 2 + 30, T = 40, ch = 50;
      txt(svg, L + cw, 16, 'Rater B', { size: fs(11), fill: c.ink2 });
      txt(svg, L + cw / 2, 32, 'positive', { size: fs(10), fill: c.muted }); txt(svg, L + 1.5 * cw, 32, 'negative', { size: fs(10), fill: c.muted });
      txt(svg, L - 70, T + ch, 'Rater A', { anchor: 'middle', size: fs(11), fill: c.ink2 });
      txt(svg, L - 8, T + ch / 2 + 4, 'pos.', { anchor: 'end', size: fs(10), fill: c.muted }); txt(svg, L - 8, T + 1.5 * ch + 4, 'neg.', { anchor: 'end', size: fs(10), fill: c.muted });
      [[aa, 0, 0, true], [bb, 1, 0, false], [bb, 0, 1, false], [dd, 1, 1, true]].forEach(function (q) {
        el('rect', { x: L + q[1] * cw, y: T + q[2] * ch, width: cw - 2, height: ch - 2, fill: q[3] ? GREEN : RED, opacity: 0.12 + 0.6 * q[0] / N, stroke: c.border }, svg);
        txt(svg, L + q[1] * cw + cw / 2, T + q[2] * ch + ch / 2 + 5, fmt(q[0], 0), { size: fs(13), fill: c.ink }, svg);
      });
      out.innerHTML = 'Observed agreement p<sub>o</sub> = <strong>' + pct(po, 0) + '</strong>; agreement expected by chance p<sub>e</sub> = ' + pct(pe, 0) + '. <strong>κ = (p<sub>o</sub> − p<sub>e</sub>)/(1 − p<sub>e</sub>) = ' + fmt(k, 2) + '</strong>.' +
        NOTE + 'Kappa asks how much better than chance the two raters agree. When almost all samples are negative (or positive), two raters guessing would agree often by chance alone, so the same raw agreement gives a much lower kappa. Move the share of positives towards 5% or 95% at a fixed 90% agreement and watch kappa fall.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d8'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Which of these is an ordinal variable?', options: ['Blood group', 'Severity rated mild, moderate or severe', 'Colour of a flower', 'Temperature in kelvin'], answer: 1, explanation: 'Ordinal categories have a natural order but no fixed spacing.' },
      { question: 'In a χ² goodness-of-fit test, each category contributes…', options: ['O − E', '(O − E)² / E', 'O / E', 'E − O'], answer: 1, explanation: 'Squared deviations, scaled by the expected count.' },
      { question: 'A 3 × 4 contingency table has how many degrees of freedom for the test of independence?', options: ['12', '6', '11', '7'], answer: 1, explanation: '(3 − 1)(4 − 1) = 6.' },
      { question: 'When is Fisher’s exact test preferred over the χ² test for a 2 × 2 table?', options: ['When counts are very large', 'When some expected counts are small (below about 5)', 'When the data are continuous', 'Never'], answer: 1, explanation: 'The χ² distribution is only an approximation, which fails for small expected counts.' },
      { question: 'The same 100 samples are tested by two methods (positive or negative). Which test compares the two methods?', options: ['χ² test of independence', 'McNemar’s test', 'Kruskal–Wallis test', 'Welch’s t-test'], answer: 1, explanation: 'Paired yes/no data need McNemar’s test, which uses only the discordant pairs.' },
      { question: '75% of treated and 50% of control seeds germinate. The risk ratio is…', options: ['0.25', '1.5', '3.0', '25'], answer: 1, explanation: '0.75 / 0.50 = 1.5. The odds ratio is (0.75/0.25)/(0.50/0.50) = 3.0.' },
      { question: 'Counts of colonies on plates have mean 11.5 and variance 89. This suggests…', options: ['Perfect Poisson counts', 'Overdispersion: the plates differ by more than counting noise', 'Underdispersion', 'A calculation error'], answer: 1, explanation: 'For Poisson counts the variance should be close to the mean.' },
      { question: 'Two raters agree on 90% of samples, but kappa is only 0.44. How can that be?', options: ['Kappa is wrong', 'One category is so common that much of the agreement is expected by chance', 'The raters are biased', 'There were too few samples'], answer: 1, explanation: 'Kappa corrects for chance agreement, which is high when one category dominates.' },
      { question: 'Why did Fisher suspect Mendel’s data?', options: ['The ratios were far from theory', 'The counts agreed with theory more closely than chance would usually allow', 'Mendel used too many plants', 'The peas were the wrong species'], answer: 1, explanation: 'A χ² that is too small is as suspicious, in its way, as one that is too large.' },
      { question: 'What is lost by splitting a continuous measurement into “high” and “low”?', options: ['Nothing', 'Information and statistical power', 'Only the units', 'The need for a test'], answer: 1, explanation: 'Dichotomising throws away the differences within each group.' }
    ]);
  };
})();
