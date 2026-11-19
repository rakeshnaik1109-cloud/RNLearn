/* ==========================================================================
   RNLearn — Analysis of Variance (Making Sense of Data, Part 5)
   Figures:
     1. fig-anova-timeline   The story at a glance (clickable timeline)
     2. fig-many-tests       Why not lots of t-tests?
     3. fig-anova-explorer   Signal against noise
     4. fig-f-dist           The F distribution
     5. fig-assumptions      When the assumptions fail
     6. fig-posthoc          Which groups differ?
     7. fig-quiz-d5          Test yourself
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
    { name: 'Fisher at Rothamsted', color: '#15803d' },
    { name: 'Tools for messy data', color: '#1d4ed8' },
    { name: 'Many comparisons', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1918', icon: '🧬', era: 0, sec: 4, title: 'A word is born', text: 'In a paper on inheritance, Ronald Fisher introduces the term “variance” and the idea of splitting it into parts due to different causes.' },
    { year: '1919', icon: '🌾', era: 0, sec: 4, title: 'Rothamsted', text: 'Fisher joins the Rothamsted Experimental Station in England, with decades of crop records to analyse.' },
    { year: '1923', icon: '🥔', era: 0, sec: 5, title: 'The first ANOVA table', text: 'Fisher and Winifred Mackenzie analyse how potato varieties respond to fertilisers: the first analysis of variance in recognisably modern form.' },
    { year: '1925', icon: '📗', era: 0, sec: 6, title: 'The textbook', text: '<em>Statistical Methods for Research Workers</em> spreads the analysis of variance to scientists everywhere.' },
    { year: '1934', icon: '🔤', era: 1, sec: 6, title: 'F for Fisher', text: 'George Snedecor tabulates the variance ratio and names it F in Fisher’s honour.' },
    { year: '1949', icon: '🔍', era: 2, sec: 10, title: 'Which means differ?', text: 'John Tukey publishes methods for comparing individual means after an analysis of variance; his “honestly significant difference” follows.' },
    { year: '1951', icon: '⚖️', era: 1, sec: 9, title: 'Welch’s ANOVA', text: 'Bernard Welch extends his unequal-variance method from two groups to several.' },
    { year: '1952', icon: '🔢', era: 1, sec: 9, title: 'Kruskal–Wallis', text: 'William Kruskal and W. Allen Wallis publish a rank-based alternative that does not assume normal data.' },
    { year: '1955', icon: '🎛️', era: 2, sec: 10, title: 'Dunnett’s test', text: 'Charles Dunnett gives a method for comparing several treatments with a single control.' },
    { year: '1960', icon: '📏', era: 1, sec: 8, title: 'Levene’s test', text: 'Howard Levene proposes a robust test of whether groups have equal variances.' },
    { year: '1979', icon: '🪜', era: 2, sec: 10, title: 'Holm’s method', text: 'Sture Holm publishes a step-down correction that is always at least as powerful as Bonferroni’s.' },
    { year: '1995', icon: '🧮', era: 2, sec: 10, title: 'False discovery rate', text: 'Yoav Benjamini and Yosef Hochberg propose controlling the expected proportion of false discoveries instead of the chance of any.' }
  ];

  FIG['fig-anova-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1918 to 1995');
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


  /* ANOVA helpers: F and chi-square distributions, one-way ANOVA, Welch, Kruskal–Wallis */
  function fcdf(f, d1, d2) { return f <= 0 ? 0 : betainc(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2)); }
  function fsf(f, d1, d2) { return f <= 0 ? 1 : betainc(d2 / 2, d1 / 2, d2 / (d2 + d1 * f)); }
  function fpdf(f, d1, d2) { if (f <= 0) return 0; return Math.exp(0.5 * (d1 * Math.log(d1 * f) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * f + d2)) - Math.log(f) - (lgamma(d1 / 2) + lgamma(d2 / 2) - lgamma((d1 + d2) / 2))); }
  function finv(p, d1, d2) { var lo = 0, hi = 200; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (fcdf(m, d1, d2) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function gammaP(a, x) {
    if (x <= 0) return 0;
    var gln = lgamma(a), n, sum, del, ap;
    if (x < a + 1) { ap = a; sum = del = 1 / a; for (n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; } return sum * Math.exp(-x + a * Math.log(x) - gln); }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (n = 1; n < 300; n++) { var an = -n * (n - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var dl = d * c; h *= dl; if (Math.abs(dl - 1) < 1e-14) break; }
    return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
  }
  function chi2sf(x, k) { return 1 - gammaP(k / 2, x / 2); }
  function anova1(groups) {
    var all = [].concat.apply([], groups), N = all.length, k = groups.length, gm = mean(all), ssb = 0, ssw = 0;
    groups.forEach(function (g) { var m = mean(g); ssb += g.length * (m - gm) * (m - gm); g.forEach(function (v) { ssw += (v - m) * (v - m); }); });
    var d1 = k - 1, d2 = N - k, msb = ssb / d1, msw = ssw / d2, F = msb / msw;
    return { ssb: ssb, ssw: ssw, sst: ssb + ssw, d1: d1, d2: d2, msb: msb, msw: msw, F: F, p: fsf(F, d1, d2), gm: gm, eta: ssb / (ssb + ssw), omega: Math.max(0, (ssb - d1 * msw) / (ssb + ssw + msw)) };
  }
  function welch1(groups) {
    var k = groups.length, w = [], m = [], W = 0, mw = 0, A = 0, tmp = 0;
    groups.forEach(function (g, i) { var s = sdv(g); w[i] = g.length / (s * s); m[i] = mean(g); W += w[i]; mw += w[i] * m[i]; });
    mw /= W;
    groups.forEach(function (g, i) { A += w[i] * (m[i] - mw) * (m[i] - mw); tmp += Math.pow(1 - w[i] / W, 2) / (g.length - 1); });
    A /= (k - 1); var B = 1 + 2 * (k - 2) / (k * k - 1) * tmp, F = A / B, d2 = (k * k - 1) / (3 * tmp);
    return { F: F, d1: k - 1, d2: d2, p: fsf(F, k - 1, d2) };
  }
  function kruskal(groups) {
    var all = [];
    groups.forEach(function (g, i) { g.forEach(function (v) { all.push([v, i]); }); });
    all.sort(function (a, b) { return a[0] - b[0]; });
    var N = all.length, R = groups.map(function () { return 0; }), i = 0;
    while (i < N) { var j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; var r = (i + j) / 2 + 1; for (var q = i; q <= j; q++) R[all[q][1]] += r; i = j + 1; }
    var H = 0; groups.forEach(function (g, gi) { H += R[gi] * R[gi] / g.length; }); H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
    return { H: H, p: chi2sf(H, groups.length - 1) };
  }
  function pfmt(p) { return p < 0.0001 ? '&lt; 0.0001' : '= ' + (p < 0.001 ? fmt(p, 4) : fmt(p, 3)); }
  var GCOL = ['#2563eb', '#d97706', '#16a34a', '#7c3aed', '#db2777'];

  /* -----------------------------------------------------------------------
     Figure 2. Why not lots of t-tests?
     ----------------------------------------------------------------------- */
  FIG['fig-many-tests'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 5, res = null, RUNS = 1000, NG = 10;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'mt-k', label: 'Number of groups', min: 2, max: 10, step: 1, value: k, onChange: function (x) { k = x; res = null; draw(); } });
    var row = group(controls, 'Actions');
    btn('Run 1,000 experiments with no real differences', row).addEventListener('click', function () { run(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function run() {
      var raw = 0, bon = 0, an = 0, m = k * (k - 1) / 2, tc = tinv(0.975, 2 * NG - 2), tb = tinv(1 - 0.025 / m, 2 * NG - 2);
      for (var r = 0; r < RUNS; r++) {
        var g = [], st = [];
        for (var i = 0; i < k; i++) { var a = []; for (var j = 0; j < NG; j++) a.push(gauss()); g.push(a); st.push([mean(a), sdv(a)]); }
        var anyRaw = false, anyBon = false;
        for (i = 0; i < k; i++) for (j = i + 1; j < k; j++) { var t = Math.abs(st[i][0] - st[j][0]) / Math.sqrt((st[i][1] * st[i][1] + st[j][1] * st[j][1]) / NG); if (t > tc) anyRaw = true; if (t > tb) anyBon = true; }
        if (anyRaw) raw++; if (anyBon) bon++; if (anova1(g).p < 0.05) an++;
      }
      res = { k: k, raw: raw / RUNS, bon: bon / RUNS, an: an / RUNS };
    }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Chance of at least one false positive'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(k));
      var m = k * (k - 1) / 2, naive = 1 - Math.pow(0.95, m), narrow = W < 560;
      var L = narrow ? 112 : 230, R = W - 56, X = function (v) { return L + v * (R - L); };
      var rows = [['Simple formula 1 − 0.95ᵐ', 'Formula 1 − 0.95ᵐ', naive, c.faint], ['All pairwise t-tests (simulated)', 'Pairwise t-tests', res && res.raw, RED], ['Bonferroni-corrected t-tests', 'Bonferroni', res && res.bon, PURPLE], ['One ANOVA F-test', 'ANOVA F-test', res && res.an, BLUE]];
      txt(svg, L, 14, 'Chance of at least one “significant” result when nothing is going on', { anchor: narrow ? 'start' : 'start', size: fs(10), fill: c.muted });
      if (narrow) svg.lastChild.textContent = 'Chance of ≥ 1 false positive';
      rows.forEach(function (r, i) {
        var y = 34 + i * 40;
        txt(svg, L - 8, y + 14, narrow ? r[1] : r[0], { anchor: 'end', size: fs(10), fill: c.ink2 });
        el('rect', { x: L, y: y, width: R - L, height: 20, fill: c.sunken, rx: 3 }, svg);
        if (r[2] !== null && r[2] !== undefined) { el('rect', { x: L, y: y, width: Math.max(1, X(r[2]) - L), height: 20, fill: r[3], rx: 3 }, svg); txt(svg, X(r[2]) + 6, y + 14, pct(r[2], 0), { anchor: 'start', size: fs(10), fill: c.ink2 }); }
        else txt(svg, X(0.1), y + 14, 'press Run', { anchor: 'start', size: fs(10), fill: c.muted });
      });
      el('line', { x1: X(0.05), y1: 28, x2: X(0.05), y2: 196, stroke: c.ink, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, X(0.05), 214, '5%', { size: fs(10), fill: c.ink2 });
      out.innerHTML = 'With ' + k + ' groups there are <strong>' + m + '</strong> pairs to compare.' + (res ? ' In ' + RUNS.toLocaleString('en-GB') + ' simulated experiments with no real differences (10 measurements per group), at least one pairwise t-test was “significant” in <strong>' + pct(res.raw, 0) + '</strong> of them; a single ANOVA in <strong>' + pct(res.an, 0) + '</strong>.' : ' Press Run to simulate.') +
        NOTE + 'Each test has a 5% false-positive rate, but the chances add up across tests. The simple formula 1 − 0.95<sup>m</sup> overstates it a little, because tests that share groups are correlated; the simulation shows the real rate. One overall ANOVA keeps the rate at 5%.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Signal and noise: the ANOVA explorer
     ----------------------------------------------------------------------- */
  FIG['fig-anova-explorer'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sep = 1, sd = 1, n = 8, show = 0, eps = [], OFF = [-1.5, 0.5, -0.5, 1.5];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ae-s', label: 'Spread of group means (signal)', min: 0, max: 3, step: 0.05, value: sep, onChange: function (x) { sep = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ae-n', label: 'Scatter within groups (noise SD)', min: 0.2, max: 3, step: 0.05, value: sd, onChange: function (x) { sd = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'ae-k', label: 'Measurements per group', min: 3, max: 20, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    choice(controls, 'Show deviations', ['None', 'Between groups', 'Within groups'], show, function (i) { show = i; draw(); });
    var row = group(controls, 'Actions');
    btn('New data', row).addEventListener('click', function () { gen(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function gen() { eps = []; for (var i = 0; i < 4; i++) { var a = []; for (var j = 0; j < 20; j++) a.push(gauss()); eps.push(a); } }
    gen();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Four groups of measurements and the split of their variation'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(sep, 2)); valText(s2, fmt(sd, 2)); valText(s3, String(n));
      var groups = eps.map(function (e, i) { return e.slice(0, n).map(function (z) { return 10 + sep * OFF[i] + sd * z; }); });
      var r = anova1(groups);
      var L = 40, R = W - 12, T = 16, B = 210, lo = 10 - 8, hi = 10 + 8;
      var Y = function (v) { return B - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (B - T); };
      [4, 8, 12, 16].forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      el('line', { x1: L, y1: Y(r.gm), x2: R, y2: Y(r.gm), stroke: c.ink, 'stroke-dasharray': '5 3' }, svg);
      var gw = (R - L) / 4;
      groups.forEach(function (g, i) {
        var cx = L + gw * (i + 0.5), m = mean(g);
        g.forEach(function (v, j) {
          var x = cx - gw * 0.3 + gw * 0.6 * (j + 0.5) / g.length;
          if (show === 2) el('line', { x1: x, y1: Y(v), x2: x, y2: Y(m), stroke: GCOL[i], opacity: 0.6 }, svg);
          el('circle', { cx: x, cy: Y(v), r: 3.5, fill: GCOL[i], opacity: 0.85 }, svg);
        });
        el('line', { x1: cx - gw * 0.36, y1: Y(m), x2: cx + gw * 0.36, y2: Y(m), stroke: GCOL[i], 'stroke-width': 3 }, svg);
        if (show === 1) el('line', { x1: cx + gw * 0.38, y1: Y(m), x2: cx + gw * 0.38, y2: Y(r.gm), stroke: GCOL[i], 'stroke-width': 4, opacity: 0.7 }, svg);
        txt(svg, cx, B + 16, 'Group ' + 'ABCD'[i], { size: fs(10), fill: c.ink2 });
      });
      var by = 250, fb = r.ssb / r.sst;
      txt(svg, L, by - 6, 'Total variation (sum of squares) split into:', { anchor: 'start', size: fs(10), fill: c.muted });
      el('rect', { x: L, y: by, width: (R - L) * fb, height: 18, fill: AMBER }, svg);
      el('rect', { x: L + (R - L) * fb, y: by, width: (R - L) * (1 - fb), height: 18, fill: c.faint }, svg);
      txt(svg, L, by + 32, 'between groups ' + pct(fb, 0), { anchor: 'start', size: fs(10), fill: AMBER });
      txt(svg, R, by + 32, 'within groups ' + pct(1 - fb, 0), { anchor: 'end', size: fs(10), fill: c.muted });
      out.innerHTML = 'F = MS<sub>between</sub> / MS<sub>within</sub> = ' + fmt(r.msb, 2) + ' / ' + fmt(r.msw, 2) + ' = <strong>' + fmt(r.F, 2) + '</strong> with (' + r.d1 + ', ' + r.d2 + ') degrees of freedom, <strong>p ' + pfmt(r.p) + '</strong>. η² = ' + fmt(r.eta, 2) + '.' +
        NOTE + 'The dashed line is the grand mean. ANOVA compares how far the group means (thick bars) sit from it with how much individual points scatter around their own group mean. If the groups really had the same mean, F would usually be near 1. More signal, less noise or more measurements all make F larger.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. The F distribution
     ----------------------------------------------------------------------- */
  FIG['fig-f-dist'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d1 = 3, d2 = 16, F = 3;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'fd-1', label: 'Between-groups df (k − 1)', min: 1, max: 10, step: 1, value: d1, onChange: function (x) { d1 = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'fd-2', label: 'Within-groups df (N − k)', min: 2, max: 60, step: 1, value: d2, onChange: function (x) { d2 = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'fd-f', label: 'Observed F', min: 0, max: 10, step: 0.05, value: F, onChange: function (x) { F = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'F distribution with the observed value and its tail area'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(d1)); valText(s2, String(d2)); valText(s3, fmt(F, 2));
      var L = 20, R = W - 16, T = 26, B = 186, hi = 8, ymax = 0;
      for (var i = 1; i <= 300; i++) { var v = hi * i / 300; if (v > 0.15) ymax = Math.max(ymax, fpdf(v, d1, d2)); }
      ymax = Math.min(1.2, ymax * 1.1);
      var X = function (v) { return L + v / hi * (R - L); }, Y = function (v) { return B - Math.min(v, ymax) / ymax * (B - T); };
      var fc = finv(0.95, d1, d2), p = fsf(F, d1, d2), path = '', tail = 'M' + X(Math.min(F, hi)) + ' ' + B;
      for (i = 1; i <= 300; i++) { var x = hi * i / 300; path += (i > 1 ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(fpdf(x, d1, d2)).toFixed(1); }
      for (i = 0; i <= 120; i++) { var xx = Math.min(F, hi) + (hi - Math.min(F, hi)) * i / 120; tail += ' L' + X(xx).toFixed(1) + ' ' + Y(fpdf(Math.max(xx, 1e-6), d1, d2)).toFixed(1); }
      el('path', { d: tail + ' L' + X(hi) + ' ' + B + ' Z', fill: RED, opacity: 0.3 }, svg);
      el('path', { d: path, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, svg);
      if (fc < hi) { el('line', { x1: X(fc), y1: T, x2: X(fc), y2: B, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg); txt(svg, X(fc) + 4, T + 10, 'F crit (5%) = ' + fmt(fc, 2), { anchor: X(fc) > R - 110 ? 'end' : 'start', size: fs(10), fill: c.ink2 }); }
      if (F <= hi) { el('line', { x1: X(F), y1: T + 18, x2: X(F), y2: B, stroke: RED, 'stroke-width': 2 }, svg); txt(svg, X(F), B + 30, 'F = ' + fmt(F, 2), { size: fs(10), fill: RED }); }
      txt(svg, L, 14, W < 560 ? 'blue: F if no real differences · red: tail' : 'blue: distribution of F when the groups do not really differ · red: area beyond the observed F', { anchor: 'start', size: fs(10), fill: c.muted });
      axisX(svg, c, fs, L, R, B, 0, hi, [0, 1, 2, 3, 4, 5, 6, 7, 8], null);
      out.innerHTML = 'If all groups had the same true mean, an F of ' + fmt(F, 2) + ' or larger would occur with probability <strong>p ' + pfmt(p) + '</strong>. The 5% critical value is <strong>' + fmt(fc, 2) + '</strong>, so this result is ' + (F > fc ? '<strong>statistically significant</strong> at the 5% level.' : '<strong>not</strong> statistically significant at the 5% level.') +
        NOTE + 'F is a ratio of two variance estimates, so it is never negative and is skewed to the right. Its shape depends on two degrees of freedom: k − 1 for the groups and N − k for the scatter within them. With more data (larger N − k) the critical value falls towards a limit.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. When the assumptions fail
     ----------------------------------------------------------------------- */
  FIG['fig-assumptions'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var SC = [
      { name: 'Ideal', n: [10, 10, 10], sd: [1, 1, 1], d: 'n', note: 'Normal data, equal sizes and variances: all three methods hold their 5% false-positive rate.' },
      { name: 'Smallest group noisiest', n: [6, 12, 24], sd: [3, 1.5, 1], d: 'n', note: 'The classical ANOVA pools the variances, so the large, quiet group makes the noisy small group look too precise: false positives soar. Welch’s ANOVA copes. Kruskal–Wallis also suffers, because it tests whether the distributions differ, and they do.' },
      { name: 'Largest group noisiest', n: [6, 12, 24], sd: [1, 1.5, 3], d: 'n', note: 'The reverse pattern makes the classical ANOVA too cautious: it rarely gives false positives, but it also loses power to find real effects.' },
      { name: 'Equal sizes, unequal variances', n: [10, 10, 10], sd: [1, 1, 3], d: 'n', note: 'With equal group sizes the classical ANOVA is fairly robust to unequal variances, which is one reason balanced designs are recommended.' },
      { name: 'Skewed data', n: [10, 10, 10], sd: [1, 1, 1], d: 'e', note: 'Strongly skewed (exponential) data with equal sizes: all methods stay close to 5%. ANOVA is robust to non-normality in balanced designs of moderate size.' }
    ];
    var si = 1, res = null, ex = null;
    var controls = div('fig-controls', container);
    var pick = group(controls, 'Scenario (all groups have the same true mean)'), bs = [];
    SC.forEach(function (s, i) { var b = btn(s.name, pick); bs.push(b); b.addEventListener('click', function () { si = i; bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); res = null; example(); draw(); }); });
    bs[si].classList.add('active'); bs[si].setAttribute('aria-pressed', 'true');
    var row = group(controls, 'Actions');
    btn('Run 2,000 simulated experiments', row).addEventListener('click', function () { run(); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function sample(s) { return s.n.map(function (nn, i) { var a = []; for (var j = 0; j < nn; j++) a.push(s.d === 'n' ? s.sd[i] * gauss() : -s.sd[i] * Math.log(1 - Math.random())); return a; }); }
    function example() { ex = sample(SC[si]); }
    function run() { var s = SC[si], h = [0, 0, 0], R = 2000; for (var r = 0; r < R; r++) { var g = sample(s); if (anova1(g).p < 0.05) h[0]++; if (welch1(g).p < 0.05) h[1]++; if (kruskal(g).p < 0.05) h[2]++; } res = h.map(function (x) { return x / R; }); }
    example();
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, (svgWrap.clientWidth || container.clientWidth || 700) < 560 ? 268 : 230, 'Example data and false-positive rates of three methods'), W = A.W, svg = A.svg, fs = A.fs, s = SC[si];
      var narrow = W < 560, split = narrow ? W : W * 0.42;
      var L = 30, R = split - 10, T = 20, B = narrow ? 110 : 200;
      var all = [].concat.apply([], ex), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * 0.08;
      lo -= pad; hi += pad;
      var Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); }, gw = (R - L) / 3;
      txt(svg, L, 12, 'One example data set', { anchor: 'start', size: fs(10), fill: c.muted });
      ex.forEach(function (g, i) {
        var cx = L + gw * (i + 0.5);
        g.forEach(function (v, j) { el('circle', { cx: cx - gw * 0.3 + gw * 0.6 * (j + 0.5) / g.length, cy: Y(v), r: 2.8, fill: GCOL[i], opacity: 0.8 }, svg); });
        el('line', { x1: cx - gw * 0.35, y1: Y(mean(g)), x2: cx + gw * 0.35, y2: Y(mean(g)), stroke: GCOL[i], 'stroke-width': 2.5 }, svg);
        txt(svg, cx, B + 14, 'n = ' + g.length, { size: fs(9), fill: c.muted });
      });
      var L2 = narrow ? 104 : split + 140, R2 = W - 50, T2 = narrow ? B + 34 : 30;
      var X2 = function (v) { return L2 + Math.min(v, 0.3) / 0.3 * (R2 - L2); };
      if (!narrow) txt(svg, L2 - 130, 12, 'False-positive rate (should be 5%)', { anchor: 'start', size: fs(10), fill: c.muted });
      ['Classical ANOVA', 'Welch’s ANOVA', 'Kruskal–Wallis'].forEach(function (nm, i) {
        var y = T2 + i * (narrow ? 26 : 44);
        txt(svg, L2 - 8, y + 12, nm, { anchor: 'end', size: fs(10), fill: c.ink2 });
        el('rect', { x: L2, y: y, width: R2 - L2, height: 16, fill: c.sunken, rx: 3 }, svg);
        if (res) { el('rect', { x: L2, y: y, width: Math.max(1, X2(res[i]) - L2), height: 16, fill: [RED, BLUE, PURPLE][i], rx: 3 }, svg); txt(svg, X2(res[i]) + 5, y + 12, pct(res[i], 1), { anchor: 'start', size: fs(10), fill: c.ink2 }); }
        else txt(svg, X2(0.09), y + 12, 'press Run', { anchor: 'start', size: fs(10), fill: c.muted });
      });
      var yb = T2 + (narrow ? 3 * 26 - 6 : 3 * 44 - 10);
      el('line', { x1: X2(0.05), y1: T2 - 4, x2: X2(0.05), y2: yb, stroke: c.ink, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, X2(0.05), yb + 13, '5%', { size: fs(9), fill: c.ink2 });
      txt(svg, R2, yb + 13, '30%', { anchor: 'end', size: fs(9), fill: c.muted });
      out.innerHTML = '<strong>' + s.name + '.</strong> Group sizes ' + s.n.join(', ') + '; standard deviations ' + s.sd.join(', ') + (s.d === 'e' ? ' (skewed, exponential data)' : ' (normal data)') + '.' + NOTE + s.note + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Which groups differ? Post-hoc intervals
     ----------------------------------------------------------------------- */
  FIG['fig-posthoc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = { A: 72.96, B: 75.70, C: 73.36, D: 77.28 }, MSW = 0.6645, n = 5, df = 16, meth = 2;
    var MULT = [tinv(0.975, df), tinv(1 - 0.025 / 6, df), 4.0461 / Math.SQRT2];
    var NAMES = ['Unadjusted t', 'Bonferroni', 'Tukey HSD'];
    var controls = div('fig-controls', container);
    choice(controls, 'Intervals', NAMES, meth, function (i) { meth = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var PAIRS = [['B', 'A'], ['C', 'A'], ['D', 'A'], ['C', 'B'], ['D', 'B'], ['D', 'C']];
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Pairwise differences between catalyst means with confidence intervals'), W = A.W, svg = A.svg, fs = A.fs;
      var se = Math.sqrt(2 * MSW / n), h = MULT[meth] * se, L = 60, R = W - 16, T = 24, lo = -5, hi = 7;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, sig = 0;
      txt(svg, L, 12, W < 560 ? 'Difference in mean yield (%), 95% intervals' : 'Difference in mean yield (percentage points) with 95% intervals', { anchor: 'start', size: fs(10), fill: c.muted });
      el('line', { x1: X(0), y1: T, x2: X(0), y2: T + 6 * 34, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      PAIRS.forEach(function (p, i) {
        var d = M[p[0]] - M[p[1]], y = T + 17 + i * 34, s = d - h > 0 || d + h < 0; if (s) sig++;
        txt(svg, L - 8, y + 4, p[0] + ' − ' + p[1], { anchor: 'end', size: fs(11), fill: c.ink2 });
        el('line', { x1: X(d - h), y1: y, x2: X(d + h), y2: y, stroke: s ? BLUE : c.muted, 'stroke-width': 3 }, svg);
        el('circle', { cx: X(d), cy: y, r: 5, fill: s ? BLUE : c.muted }, svg);
      });
      axisX(svg, c, fs, L, R, T + 6 * 34 + 4, lo, hi, [-4, -2, 0, 2, 4, 6], null);
      out.innerHTML = NAMES[meth] + ': each interval is the difference ± ' + fmt(MULT[meth], 3) + ' × ' + fmt(se, 3) + ' = ± <strong>' + fmt(h, 2) + '</strong> percentage points. <strong>' + sig + ' of 6</strong> differences exclude zero (blue).' +
        NOTE + ['Unadjusted intervals are each 95%, but with six of them the chance that at least one misses its true difference is much higher than 5%.', 'Bonferroni divides the 5% among the six comparisons. It is simple and safe, but becomes very conservative with many comparisons.', 'Tukey’s honestly significant difference is designed for all pairwise comparisons: the six intervals have a joint 95% confidence, and they are narrower than Bonferroni’s.'][meth] + ' Only A − C is too small to call; D − B is the closest call.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d5'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Why not compare five groups with ten separate t-tests?', options: ['t-tests cannot handle five groups', 'The chance of at least one false positive grows well above 5%', 'It takes too long', 'ANOVA is always more accurate for each pair'], answer: 1, explanation: 'Each test has a 5% false-positive rate; across ten tests the chance of at least one is around 25–40%.' },
      { question: 'What does ANOVA compare?', options: ['The variances of the groups with each other', 'Variation between group means with variation within groups', 'The medians of the groups', 'Each group with zero'], answer: 1, explanation: 'Despite its name, ANOVA tests means, by comparing two estimates of variance.' },
      { question: 'If the groups really have the same mean, the F ratio is typically…', options: ['Close to 0', 'Close to 1', 'Close to 100', 'Negative'], answer: 1, explanation: 'Both mean squares then estimate the same noise variance.' },
      { question: 'An experiment has 4 groups of 5. What are the degrees of freedom for F?', options: ['(4, 20)', '(3, 16)', '(3, 19)', '(5, 4)'], answer: 1, explanation: 'k − 1 = 3 between groups; N − k = 20 − 4 = 16 within.' },
      { question: 'η² = 0.30 means…', options: ['p = 0.30', '30% of the total variation is between groups', 'The groups differ by 30%', '30% of measurements are outliers'], answer: 1, explanation: 'Eta squared is the share of the total sum of squares explained by the groups.' },
      { question: 'A significant ANOVA tells you…', options: ['Every group differs from every other', 'At least one group mean differs from the others', 'Which group is best', 'The data are normal'], answer: 1, explanation: 'Post-hoc tests or planned contrasts are needed to say which groups differ.' },
      { question: 'You want to compare three new treatments with one control only. A suitable method is…', options: ['Tukey HSD', 'Dunnett’s test', 'Kruskal–Wallis', 'Levene’s test'], answer: 1, explanation: 'Dunnett’s test is designed for many-versus-control comparisons and is more powerful than testing all pairs.' },
      { question: 'Group sizes are unequal and the smallest group has by far the largest variance. Which test is safest?', options: ['Classical one-way ANOVA', 'Welch’s ANOVA', 'Many t-tests', 'Levene’s test'], answer: 1, explanation: 'The classical ANOVA can give far too many false positives in this situation.' },
      { question: 'What does Levene’s test check?', options: ['Normality', 'Whether the group variances are equal', 'Whether the means are equal', 'Independence'], answer: 1, explanation: 'It is an ANOVA on the absolute deviations from each group’s centre.' },
      { question: 'The letter F in the F-test honours…', options: ['Frequency', 'Ronald Fisher', 'Factor', 'Fermat'], answer: 1, explanation: 'George Snedecor named it in 1934 after Fisher, who had worked with a related quantity he called z.' }
    ]);
  };
})();
