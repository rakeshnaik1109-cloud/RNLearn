/* ==========================================================================
   RNLearn — Beyond One Factor (Making Sense of Data, Part 6)
   Figures:
     1. fig-factor-timeline  The story at a glance (clickable timeline)
     2. fig-interaction      Main effects and interactions
     3. fig-blocking         Blocking by day
     4. fig-repeated         Paired versus unpaired analysis
     5. fig-ancova           Adjusting for a covariate
     6. fig-pseudorep        The cost of pseudoreplication
     7. fig-quiz-d6          Test yourself
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
    { name: 'Designing for many factors', color: '#15803d' },
    { name: 'Repeated and nested data', color: '#1d4ed8' },
    { name: 'Mixed models', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1926', icon: '🌾', era: 0, sec: 3, title: 'Ask Nature many questions', text: 'Ronald Fisher argues that field trials should study several factors at once, not one at a time, and that experiments should be arranged in randomised blocks.' },
    { year: '1934', icon: '📐', era: 0, sec: 8, title: 'Variance and covariance', text: 'George Snedecor’s book spreads the analysis of variance and of covariance among experimenters.' },
    { year: '1935', icon: '📕', era: 0, sec: 6, title: 'The Design of Experiments', text: 'Fisher’s book sets out randomisation, replication and blocking as the foundations of experimental design.' },
    { year: '1937', icon: '🧩', era: 0, sec: 4, title: 'Factorial experiments', text: 'Frank Yates publishes a classic account of how to design and analyse factorial experiments.' },
    { year: '1940', icon: '🔵', era: 1, sec: 7, title: 'Sphericity', text: 'John Mauchly proposes a test of the sphericity condition needed for repeated-measures ANOVA.' },
    { year: '1947', icon: '🎲', era: 1, sec: 9, title: 'Fixed or random?', text: 'Churchill Eisenhart distinguishes fixed-effects and random-effects models of the analysis of variance.' },
    { year: '1953', icon: '🐄', era: 2, sec: 10, title: 'Variance components', text: 'Charles Henderson, working on dairy cattle breeding, publishes methods for estimating variance components.' },
    { year: '1959', icon: '📉', era: 1, sec: 7, title: 'Greenhouse–Geisser', text: 'Samuel Greenhouse and Seymour Geisser give a correction to the degrees of freedom when sphericity fails.' },
    { year: '1971', icon: '🧮', era: 2, sec: 10, title: 'REML', text: 'H. Desmond Patterson and Robin Thompson introduce restricted maximum likelihood for estimating variance components.' },
    { year: '1982', icon: '📈', era: 2, sec: 10, title: 'Random-effects models', text: 'Nan Laird and James Ware popularise mixed models for repeated measurements over time.' },
    { year: '1984', icon: '🐟', era: 1, sec: 9, title: 'Pseudoreplication', text: 'Stuart Hurlbert shows that many ecological experiments treated non-independent measurements as true replicates.' },
    { year: '2015', icon: '💻', era: 2, sec: 10, title: 'Mixed models for everyone', text: 'A widely used open-source package for fitting linear mixed models is described in detail, helping make them routine.' }
  ];

  FIG['fig-factor-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1926 to 2015');
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


  function fsf(f, d1, d2) { return f <= 0 ? 1 : betainc(d2 / 2, d1 / 2, d2 / (d2 + d1 * f)); }
  function pfmt(p) { return p < 0.0001 ? '&lt; 0.0001' : '= ' + (p < 0.001 ? fmt(p, 4) : fmt(p, 3)); }
  function tp(t, df) { return 2 * (1 - tcdf(Math.abs(t), df)); }
  function zs(n) { var a = []; for (var i = 0; i < n; i++) a.push(gauss()); return a; }
  var GCOL = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777', '#0891b2'];
  function tableHTML(rows, noSS) {
    var td = 'padding:0.2rem 0.3rem;text-align:right;white-space:nowrap;', th = td + 'font-weight:600;';
    return '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin:0.2rem 0 0.4rem;"><tr style="border-bottom:1px solid var(--border);"><th style="' + th + 'text-align:left;">Source</th>' + (noSS ? '' : '<th style="' + th + '">SS</th>') + '<th style="' + th + '">df</th><th style="' + th + '">F</th><th style="' + th + '">p</th></tr>' +
      rows.map(function (r) { return '<tr><td style="' + td + 'text-align:left;">' + r[0] + '</td>' + (noSS ? '' : '<td style="' + td + '">' + fmt(r[1], 2) + '</td>') + '<td style="' + td + '">' + r[2] + '</td><td style="' + td + '">' + (r[3] === null ? '' : fmt(r[3], 2)) + '</td><td style="' + td + '">' + (r[4] === null ? '' : pfmt(r[4]).replace('= ', '')) + '</td></tr>'; }).join('') + '</table></div>';
  }

  /* -----------------------------------------------------------------------
     Figure 2. Main effects and interactions in a 2 × 2 experiment
     ----------------------------------------------------------------------- */
  FIG['fig-interaction'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 0.35, b = 2.6, ab = 4.4, sd = 0.7, n = 4, Z = [zs(n), zs(n), zs(n), zs(n)];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ia-a', label: 'Catalyst Y − X at 60 °C', min: -4, max: 6, step: 0.05, value: a, onChange: function (x) { a = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ia-b', label: 'Effect of 80 °C with catalyst X', min: -4, max: 6, step: 0.05, value: b, onChange: function (x) { b = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'ia-i', label: 'Extra effect of Y at 80 °C (interaction)', min: -8, max: 8, step: 0.05, value: ab, onChange: function (x) { ab = x; draw(); } });
    var s4 = FIG.slider(controls, { id: 'ia-s', label: 'Noise SD', min: 0.1, max: 3, step: 0.05, value: sd, onChange: function (x) { sd = x; draw(); } });
    var row = group(controls, 'Try');
    function preset(v) { a = v[0]; b = v[1]; ab = v[2]; s1.setValue(a); s2.setValue(b); s3.setValue(ab); draw(); }
    btn('Worked example', row).addEventListener('click', function () { preset([0.35, 2.6, 4.4]); });
    btn('No interaction', row).addEventListener('click', function () { preset([2, 2.6, 0]); });
    btn('Crossover', row).addEventListener('click', function () { preset([3, 0, -6]); });
    btn('New data', row).addEventListener('click', function () { Z = [zs(n), zs(n), zs(n), zs(n)]; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Interaction plot: mean yield for each catalyst at two temperatures'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(a, 2)); valText(s2, fmt(b, 2)); valText(s3, fmt(ab, 2)); valText(s4, fmt(sd, 2));
      var tm = [70.6, 70.6 + b, 70.6 + a, 70.6 + a + b + ab];
      var cells = tm.map(function (m, i) { return Z[i].map(function (z) { return m + sd * z; }); }), cm = cells.map(mean);
      var G = mean(cm), Ai = [(cm[0] + cm[1]) / 2, (cm[2] + cm[3]) / 2], Bj = [(cm[0] + cm[2]) / 2, (cm[1] + cm[3]) / 2];
      var ssA = 2 * n * ((Ai[0] - G) * (Ai[0] - G) + (Ai[1] - G) * (Ai[1] - G)), ssB = 2 * n * ((Bj[0] - G) * (Bj[0] - G) + (Bj[1] - G) * (Bj[1] - G)), ssAB = 0, ssE = 0;
      [[0, 0, 0], [1, 0, 1], [2, 1, 0], [3, 1, 1]].forEach(function (q) { var r = cm[q[0]] - Ai[q[1]] - Bj[q[2]] + G; ssAB += n * r * r; cells[q[0]].forEach(function (v) { ssE += (v - cm[q[0]]) * (v - cm[q[0]]); }); });
      var dfE = 4 * (n - 1), mse = ssE / dfE, FA = ssA / mse, FB = ssB / mse, FAB = ssAB / mse;
      var all = [].concat.apply([], cells), lo = Math.min.apply(null, all) - 1, hi = Math.max.apply(null, all) + 1;
      var L = 50, R = W - (W < 560 ? 90 : 130), T = 20, B = 210;
      var X = function (i) { return L + (R - L) * (0.15 + 0.7 * i); }, Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
      var step = (hi - lo) > 12 ? 4 : (hi - lo) > 6 ? 2 : 1;
      for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); }
      txt(svg, L, 12, 'mean yield (%)', { anchor: 'start', size: fs(10), fill: c.muted });
      [[0, 1, BLUE, 'Catalyst X'], [2, 3, AMBER, 'Catalyst Y']].forEach(function (g) {
        [0, 1].forEach(function (k) { cells[g[k]].forEach(function (y, j) { el('circle', { cx: X(k) + (j - 1.5) * 5 + (g[2] === BLUE ? -12 : 12), cy: Y(y), r: 2.6, fill: g[2], opacity: 0.45 }, svg); }); });
        el('line', { x1: X(0), y1: Y(cm[g[0]]), x2: X(1), y2: Y(cm[g[1]]), stroke: g[2], 'stroke-width': 3 }, svg);
        [0, 1].forEach(function (k) { el('circle', { cx: X(k), cy: Y(cm[g[k]]), r: 6, fill: g[2] }, svg); });
        txt(svg, X(1) + 26, Y(cm[g[1]]) + 4, g[3], { anchor: 'start', size: fs(11), fill: g[2] });
      });
      txt(svg, X(0), B + 18, '60 °C', { size: fs(11), fill: c.ink2 }); txt(svg, X(1), B + 18, '80 °C', { size: fs(11), fill: c.ink2 });
      var par = Math.abs(ab) < 0.5 ? 'The lines are nearly parallel: the effect of the catalyst is about the same at both temperatures, so there is little interaction.' : (a * (a + ab) < 0 ? 'The lines cross: the better catalyst depends on the temperature. Talking about “the effect of the catalyst” on its own is misleading.' : 'The lines are not parallel: the catalyst matters more at one temperature than the other. That is an interaction.');
      out.innerHTML = tableHTML([['Catalyst', ssA, 1, FA, fsf(FA, 1, dfE)], ['Temperature', ssB, 1, FB, fsf(FB, 1, dfE)], [(W < 560 ? 'Interaction' : 'Catalyst × temperature'), ssAB, 1, FAB, fsf(FAB, 1, dfE)], ['Residual', ssE, dfE, null, null]], W < 560) +
        '<span style="font-size:0.86rem;color:var(--ink-muted);">' + par + ' Four runs per combination; the large dots are cell means.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Blocking
     ----------------------------------------------------------------------- */
  FIG['fig-blocking'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Y0 = [[20.5, 22.7, 23.0, 17.7, 20.5, 18.9], [21.3, 23.4, 23.0, 20.1, 20.8, 19.6], [21.6, 24.8, 23.4, 19.5, 21.3, 20.1]];
    var dm = [0, 1, 2, 3, 4, 5].map(function (j) { return (Y0[0][j] + Y0[1][j] + Y0[2][j]) / 3; }), gm0 = mean(dm);
    var scale = 1, useB = 1;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'bl-s', label: 'Day-to-day variation (× actual)', min: 0, max: 2, step: 0.05, value: scale, onChange: function (x) { scale = x; draw(); } });
    choice(controls, 'Analysis', ['Ignore days', 'Block by day'], useB, function (i) { useB = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Three treatments measured on six days'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(scale, 2) + '×');
      var Y = Y0.map(function (r) { return r.map(function (v, j) { return v - dm[j] + gm0 + scale * (dm[j] - gm0); }); });
      var all = [].concat.apply([], Y), G = mean(all), tmn = Y.map(mean), dmn = [0, 1, 2, 3, 4, 5].map(function (j) { return (Y[0][j] + Y[1][j] + Y[2][j]) / 3; });
      var ssT = 6 * tmn.reduce(function (s, m) { return s + (m - G) * (m - G); }, 0), ssD = 3 * dmn.reduce(function (s, m) { return s + (m - G) * (m - G); }, 0), ssTot = all.reduce(function (s, v) { return s + (v - G) * (v - G); }, 0);
      var ssE1 = ssTot - ssT, F1 = (ssT / 2) / (ssE1 / 15), p1 = fsf(F1, 2, 15), ssE2 = ssTot - ssT - ssD, F2 = (ssT / 2) / (ssE2 / 10), p2 = fsf(F2, 2, 10);
      var lo = Math.min.apply(null, all) - 0.8, hi = Math.max.apply(null, all) + 0.8, L = 44, R = W - 16, T = 20, B = 200;
      var X = function (i) { return L + (R - L) * (i + 0.5) / 3; }, Yp = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
      for (var v = Math.ceil(lo); v <= hi; v += (hi - lo) > 10 ? 2 : 1) { el('line', { x1: L, y1: Yp(v), x2: R, y2: Yp(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Yp(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); }
      for (var j = 0; j < 6; j++) {
        var d = ''; for (var i = 0; i < 3; i++) d += (i ? 'L' : 'M') + X(i) + ' ' + Yp(Y[i][j]);
        if (useB) el('path', { d: d, fill: 'none', stroke: GCOL[j], 'stroke-width': 1.4, opacity: 0.7 }, svg);
        for (i = 0; i < 3; i++) el('circle', { cx: X(i), cy: Yp(Y[i][j]), r: 4.5, fill: useB ? GCOL[j] : c.muted, opacity: 0.85 }, svg);
      }
      for (i = 0; i < 3; i++) { el('line', { x1: X(i) - 26, y1: Yp(tmn[i]), x2: X(i) + 26, y2: Yp(tmn[i]), stroke: c.ink, 'stroke-width': 2.5 }, svg); txt(svg, X(i), B + 18, 'Treatment ' + (i + 1), { size: fs(11), fill: c.ink2 }); }
      txt(svg, L, 12, useB ? (W < 560 ? 'one colour per day' : 'each colour is one day; lines join the three treatments measured that day') : (W < 560 ? 'days ignored · bars: means' : 'all 18 measurements, day ignored · bars: treatment means'), { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = (useB ? tableHTML([['Treatment', ssT, 2, F2, p2], [(W < 560 ? 'Day' : 'Day (block)'), ssD, 5, (ssD / 5) / (ssE2 / 10), fsf((ssD / 5) / (ssE2 / 10), 5, 10)], ['Residual', ssE2, 10, null, null]]) : tableHTML([['Treatment', ssT, 2, F1, p1], ['Residual', ssE1, 15, null, null]])) +
        '<span style="font-size:0.86rem;color:var(--ink-muted);">Treatment means ' + tmn.map(function (m) { return fmt(m, 2); }).join(', ') + ', the same in both analyses. Ignoring days: p ' + pfmt(p1) + '. Blocking by day: p ' + pfmt(p2) + '. ' +
        (scale > 0.3 ? 'Day-to-day differences are large compared with the treatment effects. Within each day the order of the treatments is nearly always the same, which blocking can see and the unblocked analysis cannot.' : 'With little day-to-day variation, blocking gains almost nothing and costs a few degrees of freedom.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Repeated measures: paired versus unpaired
     ----------------------------------------------------------------------- */
  FIG['fig-repeated'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var NS = 8, between = 2, eff = 0.8, ER = 0.6, Zs = zs(NS), Z1 = zs(NS), Z2 = zs(NS);
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rp-b', label: 'Differences between samples (SD)', min: 0, max: 4, step: 0.05, value: between, onChange: function (x) { between = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'rp-e', label: 'True effect of treatment', min: 0, max: 2, step: 0.05, value: eff, onChange: function (x) { eff = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('New samples', row).addEventListener('click', function () { Zs = zs(NS); Z1 = zs(NS); Z2 = zs(NS); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 240, 'Each sample measured before and after treatment'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(between, 2)); valText(s2, fmt(eff, 2));
      var pre = Zs.map(function (z, i) { return 10 + between * z + ER * Z1[i]; }), post = Zs.map(function (z, i) { return 10 + between * z + eff + ER * Z2[i]; });
      var dif = post.map(function (v, i) { return v - pre[i]; }), md = mean(dif), sdd = sdv(dif), tpair = md / (sdd / Math.sqrt(NS)), pp = tp(tpair, NS - 1);
      var sp = Math.sqrt((Math.pow(sdv(pre), 2) + Math.pow(sdv(post), 2)) / 2), tun = (mean(post) - mean(pre)) / (sp * Math.sqrt(2 / NS)), pu = tp(tun, 2 * NS - 2);
      var all = pre.concat(post), lo = Math.min.apply(null, all) - 0.5, hi = Math.max.apply(null, all) + 0.5, L = 44, R = W - 16, T = 20, B = 200;
      var X0 = L + (R - L) * 0.28, X1 = L + (R - L) * 0.72, Yp = function (v) { return B - (v - lo) / (hi - lo) * (B - T); };
      var st = (hi - lo) > 10 ? 2 : 1;
      for (var v = Math.ceil(lo); v <= hi; v += st) { el('line', { x1: L, y1: Yp(v), x2: R, y2: Yp(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Yp(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); }
      pre.forEach(function (p, i) { var up = post[i] > p; el('line', { x1: X0, y1: Yp(p), x2: X1, y2: Yp(post[i]), stroke: up ? GREEN : RED, 'stroke-width': 1.6, opacity: 0.8 }, svg); el('circle', { cx: X0, cy: Yp(p), r: 4, fill: c.muted }, svg); el('circle', { cx: X1, cy: Yp(post[i]), r: 4, fill: BLUE }, svg); });
      txt(svg, X0, B + 18, 'Before', { size: fs(11), fill: c.ink2 }); txt(svg, X1, B + 18, 'After', { size: fs(11), fill: c.ink2 });
      txt(svg, L, 12, W < 560 ? 'green: up · red: down' : 'one line per sample · green: went up · red: went down', { anchor: 'start', size: fs(10), fill: c.muted });
      var ups = dif.filter(function (d) { return d > 0; }).length;
      out.innerHTML = 'Mean change <strong>' + fmt(md, 2) + '</strong>; ' + ups + ' of ' + NS + ' samples went up. Paired t-test (on the differences): <strong>p ' + pfmt(pp) + '</strong>. Unpaired t-test (wrongly treating before and after as separate groups): <strong>p ' + pfmt(pu) + '</strong>.' +
        NOTE + 'The paired analysis compares each sample with itself, so the differences between samples, however large, cancel out. The unpaired analysis lumps them into the noise. Increase the differences between samples and watch the unpaired p-value grow while the paired one hardly changes. A repeated-measures ANOVA does the same for three or more time points or conditions.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. ANCOVA: adjusting for a covariate
     ----------------------------------------------------------------------- */
  FIG['fig-ancova'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 10, eff = 1, imb = 0, slope = 1, X0 = zs(N), X1 = zs(N), E0 = zs(N), E1 = zs(N);
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'an-e', label: 'True treatment effect', min: -2, max: 3, step: 0.05, value: eff, onChange: function (x) { eff = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'an-i', label: 'Treated group starts higher by', min: -3, max: 3, step: 0.05, value: imb, onChange: function (x) { imb = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'an-s', label: 'Dependence on starting value (slope)', min: 0, max: 2, step: 0.05, value: slope, onChange: function (x) { slope = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('New data', row).addEventListener('click', function () { X0 = zs(N); X1 = zs(N); E0 = zs(N); E1 = zs(N); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Final value against starting value for two groups, with parallel fitted lines'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(eff, 2)); valText(s2, fmt(imb, 2)); valText(s3, fmt(slope, 2));
      var x0 = X0.map(function (z) { return 10 + 1.5 * z; }), x1 = X1.map(function (z) { return 10 + imb + 1.5 * z; });
      var y0 = x0.map(function (x, i) { return 5 + slope * x + 0.7 * E0[i]; }), y1 = x1.map(function (x, i) { return 5 + slope * x + eff + 0.7 * E1[i]; });
      var mx0 = mean(x0), mx1 = mean(x1), my0 = mean(y0), my1 = mean(y1), sxy = 0, sxx = 0;
      x0.forEach(function (x, i) { sxy += (x - mx0) * (y0[i] - my0); sxx += (x - mx0) * (x - mx0); });
      x1.forEach(function (x, i) { sxy += (x - mx1) * (y1[i] - my1); sxx += (x - mx1) * (x - mx1); });
      var b = sxy / sxx, raw = my1 - my0, adj = raw - b * (mx1 - mx0), ssr = 0;
      x0.forEach(function (x, i) { var r = y0[i] - my0 - b * (x - mx0); ssr += r * r; }); x1.forEach(function (x, i) { var r = y1[i] - my1 - b * (x - mx1); ssr += r * r; });
      var s2a = ssr / (2 * N - 3), seA = Math.sqrt(s2a * (2 / N + Math.pow(mx1 - mx0, 2) / sxx)), pA = tp(adj / seA, 2 * N - 3);
      var sp = Math.sqrt((Math.pow(sdv(y0), 2) + Math.pow(sdv(y1), 2)) / 2), pR = tp(raw / (sp * Math.sqrt(2 / N)), 2 * N - 2);
      var allx = x0.concat(x1), ally = y0.concat(y1), xl = Math.min.apply(null, allx) - 0.5, xh = Math.max.apply(null, allx) + 0.5, yl = Math.min.apply(null, ally) - 0.5, yh = Math.max.apply(null, ally) + 0.5;
      var L = 44, R = W - 16, T = 20, B = 200, Xp = function (v) { return L + (v - xl) / (xh - xl) * (R - L); }, Yp = function (v) { return B - (v - yl) / (yh - yl) * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg); el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      [[x0, y0, mx0, my0, BLUE], [x1, y1, mx1, my1, AMBER]].forEach(function (g) {
        el('line', { x1: Xp(xl), y1: Yp(g[3] + b * (xl - g[2])), x2: Xp(xh), y2: Yp(g[3] + b * (xh - g[2])), stroke: g[4], 'stroke-width': 2 }, svg);
        g[0].forEach(function (x, i) { el('circle', { cx: Xp(x), cy: Yp(g[1][i]), r: 4, fill: g[4], opacity: 0.8 }, svg); });
      });
      txt(svg, (L + R) / 2, B + 18, 'starting value (covariate)', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, 'blue: control · orange: treated · final value', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Raw difference in final means: <strong>' + fmt(raw, 2) + '</strong> (t-test p ' + pfmt(pR) + '). Difference adjusted for the starting value: <strong>' + fmt(adj, 2) + '</strong> (ANCOVA p ' + pfmt(pA) + '). True effect: ' + fmt(eff, 2) + '.' +
        NOTE + 'ANCOVA fits parallel lines and measures the vertical gap between them: the treatment effect at the same starting value. It removes variation explained by the covariate, which usually makes the test more powerful, and corrects for chance imbalance in the starting values. Make the treated group start higher and watch the raw difference mislead while the adjusted one stays close to the truth.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Pseudoreplication
     ----------------------------------------------------------------------- */
  FIG['fig-pseudorep'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var icc = 0.1, res = null, TANKS = 3, FISH = 10, RUNS = 2000;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ps-i', label: 'Share of variation due to tanks (ICC)', min: 0, max: 0.5, step: 0.01, value: icc, onChange: function (x) { icc = x; res = null; draw(); } });
    var row = group(controls, 'Actions');
    btn('Run 2,000 experiments with no treatment effect', row).addEventListener('click', function () { run(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var ex = null;
    function sim() { var ts = Math.sqrt(icc), fs_ = Math.sqrt(1 - icc), g = []; for (var t = 0; t < 2 * TANKS; t++) { var u = ts * gauss(), a = []; for (var f = 0; f < FISH; f++) a.push(u + fs_ * gauss()); g.push(a); } return g; }
    function tt(a, b) { var sp = Math.sqrt(((a.length - 1) * Math.pow(sdv(a), 2) + (b.length - 1) * Math.pow(sdv(b), 2)) / (a.length + b.length - 2)); return tp((mean(a) - mean(b)) / (sp * Math.sqrt(1 / a.length + 1 / b.length)), a.length + b.length - 2); }
    function run() { var h1 = 0, h2 = 0; for (var r = 0; r < RUNS; r++) { var g = sim(), A_ = [].concat.apply([], g.slice(0, TANKS)), B_ = [].concat.apply([], g.slice(TANKS)); if (tt(A_, B_) < 0.05) h1++; if (tt(g.slice(0, TANKS).map(mean), g.slice(TANKS).map(mean)) < 0.05) h2++; } res = [h1 / RUNS, h2 / RUNS]; ex = sim(); }
    ex = sim();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, W0() < 560 ? 290 : 220, 'Fish in tanks, and false-positive rates of two analyses'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(icc, 2));
      var narrow = W < 560, R1 = narrow ? W - 10 : W * 0.48, L = 20, T = 30, B = 160;
      var all = [].concat.apply([], ex), lo = Math.min.apply(null, all) - 0.3, hi = Math.max.apply(null, all) + 0.3, Yp = function (v) { return B - (v - lo) / (hi - lo) * (B - T); }, tw = (R1 - L) / 6;
      txt(svg, L, 14, 'One experiment: 3 tanks per treatment, 10 fish per tank', { anchor: 'start', size: fs(10), fill: c.muted });
      ex.forEach(function (g, t) {
        var cx = L + tw * (t + 0.5), col = t < TANKS ? BLUE : AMBER;
        el('rect', { x: cx - tw * 0.42, y: T - 4, width: tw * 0.84, height: B - T + 8, fill: 'none', stroke: c.border, rx: 4 }, svg);
        g.forEach(function (v, f) { el('circle', { cx: cx - tw * 0.3 + tw * 0.6 * (f + 0.5) / FISH, cy: Yp(v), r: 2.4, fill: col, opacity: 0.8 }, svg); });
        el('line', { x1: cx - tw * 0.38, y1: Yp(mean(g)), x2: cx + tw * 0.38, y2: Yp(mean(g)), stroke: col, 'stroke-width': 2.5 }, svg);
      });
      txt(svg, L + tw * 1.5, B + 20, 'treatment A', { size: fs(10), fill: BLUE }); txt(svg, L + tw * 4.5, B + 20, 'treatment B', { size: fs(10), fill: AMBER });
      var L2 = narrow ? 120 : W * 0.48 + 150, R2 = W - 50, T2 = narrow ? 210 : 50, X2 = function (v) { return L2 + Math.min(v, 0.5) / 0.5 * (R2 - L2); };
      if (!narrow) txt(svg, W * 0.48 + 16, 30, 'False-positive rate (should be 5%)', { anchor: 'start', size: fs(10), fill: c.muted });
      [['Fish as replicates (n = 30 + 30)', 'Fish as replicates', RED], ['Tank means (n = 3 + 3)', 'Tank means', GREEN]].forEach(function (r, i) {
        var y = T2 + i * 38;
        txt(svg, L2 - 8, y + 12, narrow ? r[1] : r[0].replace(' (n', ' (n'), { anchor: 'end', size: fs(narrow ? 10 : 9), fill: c.ink2 });
        el('rect', { x: L2, y: y, width: R2 - L2, height: 16, fill: c.sunken, rx: 3 }, svg);
        if (res) { el('rect', { x: L2, y: y, width: Math.max(1, X2(res[i]) - L2), height: 16, fill: r[2], rx: 3 }, svg); txt(svg, X2(res[i]) + 5, y + 12, pct(res[i], 1), { anchor: 'start', size: fs(10), fill: c.ink2 }); }
        else txt(svg, X2(0.08), y + 12, 'press Run', { anchor: 'start', size: fs(10), fill: c.muted });
      });
      el('line', { x1: X2(0.05), y1: T2 - 4, x2: X2(0.05), y2: T2 + 60, stroke: c.ink, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, X2(0.05), T2 + 74, '5%', { size: fs(9), fill: c.ink2 });
      out.innerHTML = (res ? 'With ICC = ' + fmt(icc, 2) + ', treating the 60 fish as independent gave a “significant” difference in <strong>' + pct(res[0], 1) + '</strong> of experiments with no real effect; analysing tank means gave <strong>' + pct(res[1], 1) + '</strong>.' : 'Press Run to simulate.') +
        NOTE + 'The treatment was applied to tanks, not to individual fish, so the tank is the experimental unit. Fish in the same tank share its water, temperature and history, so they are not independent. Even a small tank effect makes the fish-level analysis far too confident. A mixed model with tank as a random effect gives the right answer while still using every fish.</span>';
    }
    function W0() { return svgWrap.clientWidth || container.clientWidth || 700; }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is the main advantage of a factorial design over changing one factor at a time?', options: ['It needs no randomisation', 'It estimates every factor using all the runs, and can reveal interactions', 'It avoids the need for replicates', 'It always gives smaller p-values'], answer: 1, explanation: 'Each run contributes to every main effect, and only a factorial design can show that one factor’s effect depends on another.' },
      { question: 'In an interaction plot, the lines for two catalysts cross. This means…', options: ['Neither catalyst has an effect', 'The better catalyst depends on the temperature', 'The experiment failed', 'Temperature has no effect'], answer: 1, explanation: 'Crossing lines show a strong (crossover) interaction.' },
      { question: 'If the interaction is large, how should you describe the main effects?', options: ['As usual, ignoring the interaction', 'With care: describe the effect of each factor at each level of the other (simple effects)', 'Delete the interaction from the model', 'Report only the p-values'], answer: 1, explanation: 'An average effect can hide very different effects at different levels.' },
      { question: 'An experiment runs every treatment once on each of six days. Days differ a lot. What should the analysis include?', options: ['Nothing extra', 'Day as a block', 'Day as the response', 'Only the best day'], answer: 1, explanation: 'Blocking removes day-to-day variation from the error term.' },
      { question: 'The same eight samples are measured before and after a treatment. The correct simple test is…', options: ['An unpaired t-test', 'A paired t-test on the differences', 'A one-way ANOVA with eight groups', 'A chi-square test'], answer: 1, explanation: 'Pairing removes the differences between samples.' },
      { question: 'What does the sphericity assumption of repeated-measures ANOVA concern?', options: ['The shape of the containers', 'Equal variances of the differences between all pairs of conditions', 'Normality of the subjects', 'The number of subjects'], answer: 1, explanation: 'When it fails, the Greenhouse–Geisser correction reduces the degrees of freedom.' },
      { question: 'What does ANCOVA add to an ANOVA?', options: ['A second response variable', 'A continuous covariate, such as a starting value, to adjust for', 'Random effects', 'Non-parametric ranks'], answer: 1, explanation: 'It compares groups at the same value of the covariate.' },
      { question: 'A drug is given to 3 tanks of fish and a placebo to 3 others, with 10 fish per tank. How many true replicates per treatment?', options: ['30', '3', '10', '60'], answer: 1, explanation: 'The treatment was applied to tanks, so tanks are the experimental units.' },
      { question: 'Which factor is most naturally treated as a random effect?', options: ['Three temperatures chosen by the experimenter', 'Eight patients sampled from a larger population', 'Two catalysts being compared', 'Male and female'], answer: 1, explanation: 'Random effects represent levels sampled from a wider population we want to generalise to.' },
      { question: 'Why are mixed models increasingly used instead of repeated-measures ANOVA?', options: ['They need no data', 'They handle missing values, unequal spacing and several random factors', 'They always give smaller p-values', 'They do not need assumptions'], answer: 1, explanation: 'They are more flexible, though they still have assumptions to check.' }
    ]);
  };
})();
