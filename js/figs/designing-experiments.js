/* ==========================================================================
   RNLearn — Designing Experiments (Making Sense of Data, Part 9)
   Figures:
     1. fig-design-timeline  The story at a glance (clickable timeline)
     2. fig-randomisation    Why randomise?
     3. fig-latin-square     A random Latin square
     4. fig-response-surface Finding the best conditions
     5. fig-peeking          The danger of peeking
     6. fig-quiz-d9          Test yourself
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
    { name: 'Randomisation', color: '#15803d' },
    { name: 'Industrial design', color: '#1d4ed8' },
    { name: 'Reproducibility', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1885', icon: '⚖️', era: 0, sec: 5, title: 'A randomised, blinded test', text: 'Charles Sanders Peirce and Joseph Jastrow use random sequences and blinding in experiments on how small a difference in weight a person can sense.' },
    { year: '1926', icon: '🌾', era: 0, sec: 5, title: 'Randomised blocks', text: 'Ronald Fisher argues that randomisation is what makes a valid estimate of experimental error possible, and proposes randomised blocks.' },
    { year: '1935', icon: '☕', era: 0, sec: 16, title: 'The lady tasting tea', text: 'Fisher’s <em>The Design of Experiments</em> opens with an experiment on a lady who claimed she could taste whether milk or tea was poured first.' },
    { year: '1938', icon: '📐', era: 0, sec: 17, title: 'Balanced or random?', text: 'In a paper published after his death, Gosset (“Student”) defends systematic field layouts against Fisher’s randomisation.' },
    { year: '1946', icon: '🔬', era: 1, sec: 9, title: 'Screening designs', text: 'Robin Plackett and J. Peter Burman publish designs for screening many factors in very few runs.' },
    { year: '1948', icon: '💊', era: 0, sec: 5, title: 'A randomised trial', text: 'The Medical Research Council’s trial of streptomycin for tuberculosis assigns patients by random numbers, a landmark for randomised clinical trials.' },
    { year: '1951', icon: '⛰️', era: 1, sec: 10, title: 'Response surfaces', text: 'George Box and K. B. Wilson show how to climb towards optimum conditions with designed experiments in chemical industry.' },
    { year: '1961', icon: '🧩', era: 1, sec: 9, title: 'Fractional factorials', text: 'Box and J. Stuart Hunter set out the theory of fractional factorial designs, studying many factors with a fraction of the runs.' },
    { year: '1969', icon: '👀', era: 2, sec: 11, title: 'The danger of peeking', text: 'Peter Armitage and colleagues show that testing accumulating data again and again inflates the rate of false positives.' },
    { year: '2005', icon: '📰', era: 2, sec: 12, title: '“Most published findings are false”', text: 'John Ioannidis argues that small studies, small effects and flexible analyses make many published findings unreliable.' },
    { year: '2010', icon: '🐭', era: 2, sec: 12, title: 'ARRIVE guidelines', text: 'Guidelines for reporting animal research set out what every experiment report should include.' },
    { year: '2015', icon: '🔁', era: 2, sec: 12, title: 'Replicating psychology', text: 'A large collaboration repeats 100 published psychology studies; far fewer give significant results the second time.' }
  ];

  FIG['fig-design-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1885 to 2015');
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


  function tp(t, df) { return 2 * (1 - tcdf(Math.abs(t), df)); }
  function ttest(a, b) { var na = a.length, nb = b.length, sp = Math.sqrt(((na - 1) * Math.pow(sdv(a), 2) + (nb - 1) * Math.pow(sdv(b), 2)) / (na + nb - 2)); return tp((mean(b) - mean(a)) / (sp * Math.sqrt(1 / na + 1 / nb)), na + nb - 2); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      for (r = c + 1; r < n; r++) { var f = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    var x = new Array(n);
    for (r = n - 1; r >= 0; r--) { var s = M[r][n]; for (k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
  }
  var GCOL = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777', '#0891b2'];

  /* -----------------------------------------------------------------------
     Figure 2. Why randomise?
     ----------------------------------------------------------------------- */
  FIG['fig-randomisation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kind = 0, drift = 0.25, lab = null, Z = zs(12), res = null;
    function zs(n) { var a = []; for (var i = 0; i < n; i++) a.push(gauss()); return a; }
    function alloc(k) { return k === 0 ? [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1] : k === 1 ? [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] : shuffle([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]); }
    lab = alloc(kind);
    var controls = div('fig-controls', container);
    choice(controls, 'Order of runs', ['All A first, then all B', 'Alternating', 'Randomised'], kind, function (i) { kind = i; lab = alloc(kind); res = null; draw(); });
    var s1 = FIG.slider(controls, { id: 'rz-d', label: 'Instrument drift per run', min: 0, max: 0.6, step: 0.01, value: drift, onChange: function (x) { drift = x; res = null; draw(); } });
    var row = group(controls, 'Actions');
    btn('New example', row).addEventListener('click', function () { Z = zs(12); lab = alloc(kind); draw(); });
    btn('Run 2,000 experiments', row).addEventListener('click', function () { run(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function run() { var fp = 0, est = 0, R = 2000; for (var r = 0; r < R; r++) { var L = alloc(kind), z = zs(12), a = [], b = []; z.forEach(function (e, i) { (L[i] ? b : a).push(drift * i + e); }); if (ttest(a, b) < 0.05) fp++; est += mean(b) - mean(a); } res = [fp / R, est / R]; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Twelve runs in time order, coloured by treatment'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(drift, 2));
      var y = Z.map(function (e, i) { return drift * i + e; }), lo = Math.min.apply(null, y) - 0.5, hi = Math.max.apply(null, y) + 0.5;
      var L = 40, R = W - 14, T = 24, B = 180, X = function (i) { return L + (i + 0.5) / 12 * (R - L); }, Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: X(0), y1: Y(0), x2: X(11), y2: Y(11 * drift), stroke: c.muted, 'stroke-dasharray': '5 3' }, svg);
      y.forEach(function (v, i) { el('circle', { cx: X(i), cy: Y(v), r: W < 560 ? 6 : 7, fill: lab[i] ? AMBER : BLUE }, svg); txt(svg, X(i), Y(v) + 4, lab[i] ? 'B' : 'A', { size: fs(9), fill: '#fff' }); txt(svg, X(i), B + 16, String(i + 1), { size: fs(9), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'run order', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, W < 560 ? 'blue: A · orange: B · dashed: drift' : 'blue: treatment A · orange: treatment B · dashed: instrument drift (no real treatment effect)', { anchor: 'start', size: fs(10), fill: c.muted });
      var a = [], b = []; y.forEach(function (v, i) { (lab[i] ? b : a).push(v); });
      out.innerHTML = 'This experiment: B − A = <strong>' + fmt(mean(b) - mean(a), 2) + '</strong>, t-test p = ' + fmt(ttest(a, b), 3) + '. The true treatment effect is zero.' + (res ? ' Over 2,000 experiments with this run order: average B − A = <strong>' + fmt(res[1], 2) + '</strong>; “significant” in <strong>' + pct(res[0], 1) + '</strong> (should be 5%).' : ' Press Run to see the long-run behaviour.') +
        NOTE + ['Running all of A before all of B confounds the treatment with time: any drift, warming, fatigue or change of reagent batch looks like a treatment effect.', 'Alternating removes most of the bias from a steady drift, but any pattern that happens to follow the alternation (every other run on a different machine, morning versus afternoon) would still be confounded.', 'Random order cannot remove drift, but it turns it into ordinary noise: on average the estimate is unbiased and the false-positive rate is right, whatever the hidden pattern. Better still, block by time and randomise within blocks.'][kind] + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. A random Latin square
     ----------------------------------------------------------------------- */
  FIG['fig-latin-square'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 4, sq = null;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ls-n', label: 'Number of treatments', min: 3, max: 6, step: 1, value: n, onChange: function (x) { n = x; make(); draw(); } });
    var row = group(controls, 'Actions');
    btn('New random square', row).addEventListener('click', function () { make(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function make() {
      var rows = shuffle(Array.from({ length: n }, function (_, i) { return i; })), cols = shuffle(Array.from({ length: n }, function (_, i) { return i; })), sym = shuffle(Array.from({ length: n }, function (_, i) { return i; }));
      sq = rows.map(function (r) { return cols.map(function (cc) { return sym[(r + cc) % n]; }); });
    }
    make();
    function draw() {
      var c = C(), cell = Math.min(52, ((svgWrap.clientWidth || 600) - 110) / n), H = 40 + cell * n + 10;
      var A = newSVG(svgWrap, container, H, 'A Latin square: each treatment once in every row and column'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(n));
      var L = (W - cell * n) / 2 + 30, T = 36;
      txt(svg, L + cell * n / 2, 14, 'Instrument position →', { size: fs(10), fill: c.muted });
      for (var j = 0; j < n; j++) txt(svg, L + cell * (j + 0.5), 30, String(j + 1), { size: fs(10), fill: c.muted });
      sq.forEach(function (r, i) {
        txt(svg, L - 10, T + cell * (i + 0.5) + 4, 'Day ' + (i + 1), { anchor: 'end', size: fs(10), fill: c.muted });
        r.forEach(function (s, j) { el('rect', { x: L + cell * j, y: T + cell * i, width: cell - 2, height: cell - 2, fill: GCOL[s], opacity: 0.8, rx: 4 }, svg); txt(svg, L + cell * j + cell / 2 - 1, T + cell * i + cell / 2 + 5, 'ABCDEF'[s], { size: fs(14), fill: '#fff' }); });
      });
      out.innerHTML = n + ' treatments, ' + n + ' days and ' + n + ' positions in only ' + n * n + ' runs. Every treatment appears exactly once on each day and once in each position.' +
        NOTE + 'A Latin square blocks two nuisance factors at once: here, the day of the experiment and the position in the instrument (or the operator, the batch, the plot row and column). Choosing the square at random among all possible squares keeps the advantages of randomisation. It assumes the nuisance factors do not interact with the treatments.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Finding the best conditions
     ----------------------------------------------------------------------- */
  FIG['fig-response-surface'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    function yld(T, t) { var u = (T - 175) / 15, v = (t - 60) / 20; return 90 - 4 * u * u - 4 * v * v + 6.4 * u * v; }
    var mode = 0, runs = [], best = null, fitOpt = null, noise = 0.4;
    var controls = div('fig-controls', container);
    var row = group(controls, 'Strategy');
    btn('One factor at a time', row).addEventListener('click', function () { ofat(); draw(); });
    btn('Designed experiment (3 × 3)', row).addEventListener('click', function () { designed(); draw(); });
    btn('Clear', row).addEventListener('click', function () { runs = []; best = null; fitOpt = null; mode = 0; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function meas(T, t) { return yld(T, t) + noise * gauss(); }
    function ofat() {
      mode = 1; runs = []; fitOpt = null; var t0 = 30, bT = 0, bY = -1e9;
      for (var T = 140; T <= 210; T += 5) { var y = meas(T, t0); runs.push([T, t0, y]); if (y > bY) { bY = y; bT = T; } }
      var bt = t0;
      for (var t = 20; t <= 100; t += 10) { if (t === t0) continue; var y2 = meas(bT, t); runs.push([bT, t, y2]); if (y2 > bY) { bY = y2; bt = t; } }
      best = [bT, bt, yld(bT, bt)];
    }
    function designed() {
      mode = 2; runs = []; best = null;
      var X = [], Y = [];
      [150, 175, 200].forEach(function (T) { [30, 60, 90].forEach(function (t) { var y = meas(T, t); runs.push([T, t, y]); var u = (T - 175) / 25, v = (t - 60) / 30; X.push([1, u, v, u * u, v * v, u * v]); Y.push(y); }); });
      var A = [], b = [];
      for (var i = 0; i < 6; i++) { A.push([0, 0, 0, 0, 0, 0]); b.push(0); }
      X.forEach(function (r, k) { for (var i = 0; i < 6; i++) { b[i] += r[i] * Y[k]; for (var j = 0; j < 6; j++) A[i][j] += r[i] * r[j]; } });
      var cf = solve(A, b), det = 4 * cf[3] * cf[4] - cf[5] * cf[5];
      var u0 = (-2 * cf[4] * cf[1] + cf[5] * cf[2]) / det, v0 = (-2 * cf[3] * cf[2] + cf[5] * cf[1]) / det;
      fitOpt = [175 + 25 * u0, 60 + 30 * v0];
      fitOpt.push(yld(fitOpt[0], fitOpt[1]));
    }
    function draw() {
      function shade(y) { var f = Math.max(0, Math.min(1, (y - 70) / 20)); return 'rgb(' + Math.round(252 - 222 * f) + ',' + Math.round(244 - 154 * f) + ',' + Math.round(214 - 44 * f) + ')'; }
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 280 : 320, 'Map of yield against temperature and time, with experimental runs'), W = A.W, svg = A.svg, fs = A.fs;
      var L = 50, R = W - (narrow ? 14 : 110), T = 16, B = narrow ? 230 : 270, Tl = 140, Th = 210, tl = 20, th = 100;
      var X = function (v) { return L + (v - Tl) / (Th - Tl) * (R - L); }, Y = function (v) { return B - (v - tl) / (th - tl) * (B - T); };
      var nx = 35, ny = 20, cw = (R - L) / nx, ch = (B - T) / ny;
      for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
        var Tv = Tl + (i + 0.5) * (Th - Tl) / nx, tv = tl + (j + 0.5) * (th - tl) / ny, y = yld(Tv, tv);
        el('rect', { x: L + i * cw, y: B - (j + 1) * ch, width: cw + 0.5, height: ch + 0.5, fill: shade(y) }, svg);
      }
      [60, 70, 80, 85, 88].forEach(function (lev) {
        for (var i2 = 0; i2 < nx; i2++) for (var j2 = 0; j2 < ny; j2++) { var T1 = Tl + (i2 + 0.5) * (Th - Tl) / nx, t1 = tl + (j2 + 0.5) * (th - tl) / ny, T2 = Tl + (i2 + 1.5) * (Th - Tl) / nx; if ((yld(T1, t1) - lev) * (yld(T2, t1) - lev) < 0) el('circle', { cx: L + (i2 + 1) * cw, cy: B - (j2 + 0.5) * ch, r: 1.3, fill: '#1e293b', opacity: 0.7 }, svg); }
      });
      el('rect', { x: L, y: T, width: R - L, height: B - T, fill: 'none', stroke: c.border }, svg);
      [140, 160, 180, 200].forEach(function (v) { txt(svg, X(v), B + 16, v + '', { size: fs(10), fill: c.muted }); });
      [20, 40, 60, 80, 100].forEach(function (v) { txt(svg, L - 6, Y(v) + 4, v + '', { anchor: 'end', size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'temperature (°C)', { size: fs(10), fill: c.muted });
      txt(svg, 14, (T + B) / 2, 'time (min)', { size: fs(10), fill: c.muted }).setAttribute('transform', 'rotate(-90 14 ' + (T + B) / 2 + ')');
      if (mode === 1) { var d = ''; runs.forEach(function (r, k) { el('circle', { cx: X(r[0]), cy: Y(r[1]), r: 4, fill: AMBER, stroke: '#fff', 'stroke-width': 1 }, svg); }); el('circle', { cx: X(best[0]), cy: Y(best[1]), r: 8, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, svg); }
      if (mode === 2) { runs.forEach(function (r) { el('circle', { cx: X(r[0]), cy: Y(r[1]), r: 5, fill: BLUE, stroke: '#fff', 'stroke-width': 1 }, svg); }); if (fitOpt) el('path', { d: 'M' + (X(fitOpt[0]) - 8) + ' ' + Y(fitOpt[1]) + ' L' + (X(fitOpt[0]) + 8) + ' ' + Y(fitOpt[1]) + ' M' + X(fitOpt[0]) + ' ' + (Y(fitOpt[1]) - 8) + ' L' + X(fitOpt[0]) + ' ' + (Y(fitOpt[1]) + 8), stroke: RED, 'stroke-width': 3 }, svg); }
      if (!narrow) { txt(svg, R + 10, T + 12, 'yield (%)', { anchor: 'start', size: fs(10), fill: c.muted }); [90, 85, 80, 75, 70].forEach(function (v, k) { el('rect', { x: R + 10, y: T + 22 + k * 22, width: 16, height: 16, fill: shade(v), stroke: c.border }, svg); txt(svg, R + 32, T + 34 + k * 22, String(v), { anchor: 'start', size: fs(10), fill: c.ink2 }); }); }
      out.innerHTML = (mode === 0 ? 'The shaded map shows the true yield, which the experimenter cannot see. The best conditions lie on a diagonal ridge: higher temperatures need longer times. Try each strategy.' :
        mode === 1 ? 'One factor at a time: vary temperature at 30 min, keep the best, then vary time at that temperature. <strong>' + runs.length + ' runs</strong> end at ' + best[0] + ' °C, ' + best[1] + ' min, true yield <strong>' + fmt(best[2], 1) + '%</strong>, short of the true optimum of 90% at 175 °C, 60 min.' :
        'Nine runs on a 3 × 3 grid, a quadratic surface fitted to them, and its predicted optimum (red cross): <strong>' + fmt(fitOpt[0], 0) + ' °C, ' + fmt(fitOpt[1], 0) + ' min</strong>, true yield <strong>' + fmt(fitOpt[2], 1) + '%</strong>, from <strong>9 runs</strong>.') +
        NOTE + 'Because the effect of temperature depends on the time (an interaction), changing one factor at a time gets stuck on the side of the ridge. A designed experiment spreads its runs to learn the shape of the surface, including the interaction, and so heads straight for the top. In practice the design is repeated around the new best point, a strategy called response surface methodology.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. The danger of peeking
     ----------------------------------------------------------------------- */
  FIG['fig-peeking'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var maxN = 100, every = 10, res = null, path = null;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'pk-n', label: 'Maximum measurements per group', min: 20, max: 200, step: 10, value: maxN, onChange: function (x) { maxN = x; res = null; one(); draw(); } });
    var s2 = FIG.slider(controls, { id: 'pk-e', label: 'Test after every … measurements', min: 1, max: 50, step: 1, value: every, onChange: function (x) { every = x; res = null; draw(); } });
    var row = group(controls, 'Actions');
    btn('New experiment', row).addEventListener('click', function () { one(); draw(); });
    btn('Run 1,000 experiments', row).addEventListener('click', function () { run(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function seq(n) {
      var sa = 0, sb = 0, qa = 0, qb = 0, ps = [];
      for (var k = 1; k <= n; k++) {
        var a = gauss(), b = gauss(); sa += a; sb += b; qa += a * a; qb += b * b;
        if (k >= 3) { var ma = sa / k, mb = sb / k, va = (qa - k * ma * ma) / (k - 1), vb = (qb - k * mb * mb) / (k - 1), t = (mb - ma) / Math.sqrt((va + vb) / k); ps.push([k, tp(t, 2 * k - 2)]); }
      }
      return ps;
    }
    function one() { path = seq(maxN); }
    function run() {
      var hit = 0, fix = 0, R = 1000;
      for (var r = 0; r < R; r++) { var ps = seq(maxN), h = false; ps.forEach(function (q) { if (!h && q[0] % every === 0 && q[1] < 0.05) h = true; }); if (h) hit++; if (ps[ps.length - 1][1] < 0.05) fix++; }
      res = [hit / R, fix / R];
    }
    one();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'p-value as measurements accumulate in one experiment with no real effect'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(maxN)); valText(s2, String(every));
      var L = 44, R = W - 14, T = 22, B = 180, X = function (k) { return L + k / maxN * (R - L); }, Y = function (p) { var lp = -Math.log10(Math.max(p, 1e-4)); return B - Math.min(lp, 3) / 3 * (B - T); };
      [1, 0.1, 0.01, 0.001].forEach(function (p) { el('line', { x1: L, y1: Y(p), x2: R, y2: Y(p), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(p) + 4, String(p), { anchor: 'end', size: fs(10), fill: c.muted }); });
      el('line', { x1: L, y1: Y(0.05), x2: R, y2: Y(0.05), stroke: RED, 'stroke-dasharray': '5 3' }, svg); txt(svg, R, Y(0.05) - 4, 'p = 0.05', { anchor: 'end', size: fs(10), fill: RED });
      var d = '', stopAt = null; path.forEach(function (q, i) { d += (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); if (stopAt === null && q[0] % every === 0 && q[1] < 0.05) stopAt = q; });
      el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 1.6 }, svg);
      path.forEach(function (q) { if (q[0] % every === 0) el('circle', { cx: X(q[0]), cy: Y(q[1]), r: 2.6, fill: BLUE }, svg); });
      if (stopAt) el('circle', { cx: X(stopAt[0]), cy: Y(stopAt[1]), r: 7, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, svg);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) { txt(svg, X(f * maxN), B + 16, String(Math.round(f * maxN)), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, B + 32, 'measurements per group so far', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, 'p-value (log scale) · dots: the moments you look', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (stopAt ? 'In this experiment, a researcher who stopped at the first p &lt; 0.05 would have stopped at n = <strong>' + stopAt[0] + '</strong> and declared a “significant” effect that does not exist.' : 'In this experiment the p-value never dipped below 0.05 at a look.') +
        (res ? ' Over 1,000 experiments with no real effect: testing every ' + every + ' and stopping at the first p &lt; 0.05 gave a false positive in <strong>' + pct(res[0], 1) + '</strong>; a single test at the planned end gave <strong>' + pct(res[1], 1) + '</strong>.' : ' Press Run to see how often this happens.') +
        NOTE + 'The p-value wanders up and down as data accumulate. Each look is another chance to cross 0.05 by luck, so “collect more data until it is significant” inflates the false-positive rate, the more so the more often you look. Fix the sample size in advance, or use a sequential design with adjusted thresholds.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d9'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is the main purpose of randomisation?', options: ['To make the experiment faster', 'To prevent known and unknown factors from being systematically linked to the treatments', 'To increase the effect size', 'To avoid the need for controls'], answer: 1, explanation: 'Randomisation turns hidden systematic effects into ordinary random error.' },
      { question: 'All treatment A samples are run in the morning and all B samples in the afternoon. The problem is…', options: ['Too few samples', 'Treatment is confounded with time of day', 'The samples are blinded', 'The experiment is too balanced'], answer: 1, explanation: 'Any morning–afternoon difference becomes indistinguishable from the treatment effect.' },
      { question: 'A drug is tested along with an injection of the solvent alone. That solvent group is…', options: ['A positive control', 'A vehicle (negative) control', 'A blocking factor', 'A covariate'], answer: 1, explanation: 'It shows the effect of everything except the active substance.' },
      { question: 'Three measurements of the same sample on the same instrument are…', options: ['Biological replicates', 'Technical replicates', 'Independent experiments', 'Blocks'], answer: 1, explanation: 'They measure instrument precision, not variation between samples or subjects.' },
      { question: 'What does a Latin square design allow?', options: ['Testing many factors with no replicates', 'Blocking two nuisance factors at once with few runs', 'Avoiding randomisation', 'Measuring interactions between all factors'], answer: 1, explanation: 'Each treatment appears once in every row and column.' },
      { question: 'Why should the person scoring outcomes be blinded to the treatment?', options: ['To save time', 'Because knowing the treatment can unconsciously bias judgements', 'It is only a legal requirement', 'To increase the sample size'], answer: 1, explanation: 'Non-blinded assessments tend to exaggerate effects.' },
      { question: 'A fractional factorial design is useful when…', options: ['There is only one factor', 'Many factors must be screened with limited runs', 'No interactions can exist', 'Randomisation is impossible'], answer: 1, explanation: 'It estimates main effects (and some interactions) from a fraction of all combinations.' },
      { question: 'A researcher tests the data after every 10 measurements and stops as soon as p < 0.05. The false-positive rate is…', options: ['Exactly 5%', 'Well above 5%', 'Below 5%', 'Zero'], answer: 1, explanation: 'Each look is another chance for a false positive; with ten looks it can be around 20%.' },
      { question: 'What is pre-registration?', options: ['Registering the laboratory', 'Recording the hypotheses, design and analysis plan before collecting data', 'Paying for publication', 'Repeating an experiment'], answer: 1, explanation: 'It separates planned (confirmatory) analyses from exploratory ones.' },
      { question: 'Why is “one factor at a time” optimisation risky?', options: ['It uses too few runs', 'With interactions, it can stop far from the true optimum', 'It cannot be randomised', 'It always finds the optimum'], answer: 1, explanation: 'When the best level of one factor depends on another, changing them separately can stall on a ridge.' }
    ]);
  };
})();
