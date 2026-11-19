/* ==========================================================================
   RNLearn — Correlation and Regression (Making Sense of Data, Part 7)
   Figures:
     1. fig-reg-timeline     The story at a glance (clickable timeline)
     2. fig-correlation      Correlation and its uncertainty
     3. fig-anscombe         Anscombe's quartet
     4. fig-least-squares    Least squares with bands
     5. fig-residuals        Reading residual plots
     6. fig-curve-fit        Underfitting, overfitting and chi-square
     7. fig-logistic         Logistic dose-response curve
     8. fig-quiz-d7          Test yourself
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
    { name: 'Least squares and the heavens', color: '#b45309' },
    { name: 'Heredity and correlation', color: '#15803d' },
    { name: 'Modern regression', color: '#1d4ed8' }
  ];
  var EVENTS = [
    { year: '1805', icon: '☄️', era: 0, sec: 6, title: 'Least squares in print', text: 'Adrien-Marie Legendre publishes the method of least squares in an appendix on determining the orbits of comets.' },
    { year: '1809', icon: '🪐', era: 0, sec: 6, title: 'Gauss’s claim', text: 'Carl Friedrich Gauss publishes his own account of least squares, linking it to the normal distribution of errors, and says he had used it since 1795.' },
    { year: '1838', icon: '📈', era: 0, sec: 12, title: 'The logistic curve', text: 'Pierre-François Verhulst proposes the S-shaped logistic curve to describe the growth of populations.' },
    { year: '1886', icon: '👪', era: 1, sec: 7, title: '“Regression”', text: 'Francis Galton finds that children of very tall or very short parents are, on average, closer to the mean height, and calls it regression towards mediocrity.' },
    { year: '1888', icon: '📏', era: 1, sec: 4, title: 'Co-relation', text: 'Galton introduces a measure of “co-relation” between two characteristics, such as forearm length and height.' },
    { year: '1896', icon: '🧮', era: 1, sec: 4, title: 'Pearson’s r', text: 'Karl Pearson gives the product-moment formula for the correlation coefficient used today.' },
    { year: '1904', icon: '🔢', era: 1, sec: 5, title: 'Rank correlation', text: 'Charles Spearman proposes measuring association using ranks.' },
    { year: '1921', icon: '🔄', era: 1, sec: 4, title: 'Fisher’s z', text: 'Ronald Fisher introduces the z transformation that gives confidence intervals for a correlation coefficient.' },
    { year: '1944', icon: '💊', era: 2, sec: 12, title: 'The logit', text: 'Joseph Berkson advocates logistic models for dose–response experiments and coins the term “logit”.' },
    { year: '1951', icon: '🔀', era: 2, sec: 16, title: 'Simpson’s paradox', text: 'Edward Simpson describes how an association can reverse when data are combined across groups.' },
    { year: '1965', icon: '🚬', era: 2, sec: 16, title: 'From association to causation', text: 'Austin Bradford Hill lists the considerations for judging whether an association is causal.' },
    { year: '1973', icon: '📊', era: 2, sec: 5, title: 'Anscombe’s quartet', text: 'Francis Anscombe publishes four data sets with identical statistics but very different pictures.' },
    { year: '1977', icon: '🎯', era: 2, sec: 8, title: 'Cook’s distance', text: 'R. Dennis Cook proposes a measure of how much each point influences a regression fit.' }
  ];

  FIG['fig-reg-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1805 to 1977');
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
  function tp(t, df) { return 2 * (1 - tcdf(Math.abs(t), df)); }
  function zs(n) { var a = []; for (var i = 0; i < n; i++) a.push(gauss()); return a; }
  function corr(x, y) { var mx = mean(x), my = mean(y), sxy = 0, sxx = 0, syy = 0; for (var i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); } return sxy / Math.sqrt(sxx * syy); }
  function linfit(x, y) {
    var n = x.length, mx = mean(x), my = mean(y), sxy = 0, sxx = 0, sse = 0, syy = 0;
    for (var i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); }
    var b = sxy / sxx, a = my - b * mx;
    for (i = 0; i < n; i++) { var r = y[i] - a - b * x[i]; sse += r * r; }
    var s = Math.sqrt(sse / (n - 2));
    return { a: a, b: b, s: s, sse: sse, sxx: sxx, mx: mx, n: n, r2: 1 - sse / syy, seb: s / Math.sqrt(sxx), sea: s * Math.sqrt(1 / n + mx * mx / sxx) };
  }
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
  function polyfit(x, y, deg) {
    var u = x.map(function (v) { return (v - 5) / 5; }), m = deg + 1, A = [], b = [];
    for (var i = 0; i < m; i++) { A.push([]); b.push(0); for (var j = 0; j < m; j++) A[i].push(0); }
    u.forEach(function (ui, k) { for (var i = 0; i < m; i++) { b[i] += Math.pow(ui, i) * y[k]; for (var j = 0; j < m; j++) A[i][j] += Math.pow(ui, i + j); } });
    var c = solve(A, b);
    return function (v) { var w = (v - 5) / 5, s = 0; for (var i = 0; i < m; i++) s += c[i] * Math.pow(w, i); return s; };
  }
  function axes(svg, c, fs, L, R, T, B, xl, xh, yl, yh, xt, yt, xlab, ylab) {
    var X = function (v) { return L + (v - xl) / (xh - xl) * (R - L); }, Y = function (v) { return B - (v - yl) / (yh - yl) * (B - T); };
    yt.forEach(function (v) { el('line', { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); txt(svg, L - 6, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
    el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
    xt.forEach(function (v) { el('line', { x1: X(v), y1: B, x2: X(v), y2: B + 4, stroke: c.border }, svg); txt(svg, X(v), B + 16, String(v), { size: fs(10), fill: c.muted }); });
    if (xlab) txt(svg, (L + R) / 2, B + 32, xlab, { size: fs(10), fill: c.muted });
    if (ylab) txt(svg, L, T - 8, ylab, { anchor: 'start', size: fs(10), fill: c.muted });
    return { X: X, Y: Y };
  }

  /* -----------------------------------------------------------------------
     Figure 2. Correlation
     ----------------------------------------------------------------------- */
  FIG['fig-correlation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var rho = 0.6, n = 20, Z1 = zs(200), Z2 = zs(200);
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'co-r', label: 'True correlation ρ', min: -1, max: 1, step: 0.01, value: rho, onChange: function (x) { rho = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'co-n', label: 'Number of points n', min: 5, max: 200, step: 1, value: n, onChange: function (x) { n = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('New sample', row).addEventListener('click', function () { Z1 = zs(200); Z2 = zs(200); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Scatter plot of a sample from a population with the chosen correlation'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(rho, 2)); valText(s2, String(n));
      var x = Z1.slice(0, n), y = x.map(function (v, i) { return rho * v + Math.sqrt(Math.max(0, 1 - rho * rho)) * Z2[i]; });
      var side = Math.min(W - 60, 230), L = (W - side) / 2, T = 14, B = T + side;
      var ax = axes(svg, c, fs, L, L + side, T, B, -3, 3, -3, 3, [-2, 0, 2], [-2, 0, 2], null, null);
      x.forEach(function (v, i) { el('circle', { cx: ax.X(Math.max(-3, Math.min(3, v))), cy: ax.Y(Math.max(-3, Math.min(3, y[i]))), r: n > 100 ? 2.4 : 3.6, fill: BLUE, opacity: 0.7 }, svg); });
      var r = corr(x, y), z = 0.5 * Math.log((1 + r) / (1 - r)), se = 1 / Math.sqrt(n - 3), lo = Math.tanh(z - 1.96 * se), hi = Math.tanh(z + 1.96 * se);
      var t = r * Math.sqrt((n - 2) / (1 - r * r)), p = tp(t, n - 2);
      out.innerHTML = 'Sample correlation <strong>r = ' + fmt(r, 3) + '</strong>, r² = ' + fmt(r * r, 2) + '. 95% CI (Fisher’s z): <strong>' + fmt(lo, 2) + ' to ' + fmt(hi, 2) + '</strong>. Test of no correlation: p ' + pfmt(p) + '.' +
        NOTE + 'r measures how closely the points follow a straight line, from −1 (perfect falling line) through 0 (no linear relation) to +1 (perfect rising line). With small samples r varies a lot from sample to sample: with n = 20, a true correlation of 0.6 can easily give r anywhere from about 0.2 to 0.8. Try n = 10 and press New sample a few times.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Anscombe's quartet
     ----------------------------------------------------------------------- */
  FIG['fig-anscombe'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], X4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8];
    var D = [[X, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]], [X, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]], [X, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]], [X4, [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]]];
    var show = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Show', ['Numbers only', 'The plots'], show, function (i) { show = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, H = show ? (narrow ? 420 : 230) : 150;
      var A = newSVG(svgWrap, container, H, 'Anscombe’s four data sets'), W = A.W, svg = A.svg, fs = A.fs;
      var stats = D.map(function (d) { var f = linfit(d[0], d[1]); return [mean(d[0]), mean(d[1]), Math.pow(sdv(d[1]), 2), corr(d[0], d[1]), f.a, f.b]; });
      if (!show) {
        var td = ['Data set', 'mean x', 'mean y', 'var y', 'r', 'fitted line'], fr = [0.12, 0.12, 0.12, 0.12, 0.12, 0.4];
        if (narrow) { td.splice(1, 1); td[0] = 'Set'; fr = [0.12, 0.16, 0.16, 0.16, 0.4]; }
        var cx = [], acc = 10; fr.forEach(function (f) { cx.push(acc + f * (W - 20) / 2); acc += f * (W - 20); });
        td.forEach(function (h, j) { txt(svg, cx[j], 22, h, { size: fs(narrow ? 10 : 11), fill: c.muted }); });
        stats.forEach(function (s, i) {
          var y = 50 + i * 24, v = ['ABCD'[i], fmt(s[0], 1), fmt(s[1], 2), fmt(s[2], 2), fmt(s[3], 3), 'y = ' + fmt(s[4], 2) + ' + ' + fmt(s[5], 3) + 'x'];
          if (narrow) v.splice(1, 1);
          v.forEach(function (t, j) { txt(svg, cx[j], y, t, { size: fs(narrow ? 10 : 11), fill: j ? c.ink2 : c.ink }); });
        });
      } else {
        var cols = narrow ? 2 : 4, pw = (W - 10) / cols, ph = narrow ? 200 : 220;
        D.forEach(function (d, i) {
          var ox = 5 + (i % cols) * pw, oy = Math.floor(i / cols) * ph, L = ox + 28, R = ox + pw - 8, T = oy + 22, B = oy + ph - 30;
          var ax = axes(svg, c, fs, L, R, T, B, 2, 20, 2, 14, [5, 10, 15], [4, 8, 12], null, null);
          txt(svg, L + 4, T - 6, 'Data set ' + 'ABCD'[i], { anchor: 'start', size: fs(10), fill: c.ink2 });
          el('line', { x1: ax.X(2), y1: ax.Y(3 + 0.5 * 2), x2: ax.X(20), y2: ax.Y(3 + 0.5 * 20), stroke: RED, 'stroke-width': 1.5 }, svg);
          d[0].forEach(function (v, k) { el('circle', { cx: ax.X(v), cy: ax.Y(d[1][k]), r: 3.4, fill: BLUE }, svg); });
        });
      }
      out.innerHTML = (show ? 'The same summary statistics and the same fitted line, y = 3.00 + 0.500x, for four completely different patterns: <strong>A</strong> a reasonable linear relation with scatter, <strong>B</strong> a smooth curve, <strong>C</strong> a perfect line spoiled by one outlier, <strong>D</strong> no relation at all except for one extreme point.' : 'Four data sets of 11 points each. Their means, variances, correlations and fitted lines agree to two or three decimal places. Can you guess what they look like? Then show the plots.') +
        NOTE + 'Francis Anscombe constructed these data in 1973 to show that statistics are no substitute for looking at the data. A correlation or a regression line summarises a relationship only if a straight line is a sensible description of it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Least squares
     ----------------------------------------------------------------------- */
  FIG['fig-least-squares'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = [0, 50, 100, 150, 200, 250, 300], E = [2.0, 4.2, 5.7, 7.2, 9.5, 11.0, 13.8], best = linfit(M, E);
    var a = 4, b = 0.025, band = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ls-b', label: 'Slope (mm per g)', min: 0, max: 0.07, step: 0.0005, value: b, onChange: function (x) { b = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ls-a', label: 'Intercept (mm)', min: -2, max: 8, step: 0.05, value: a, onChange: function (x) { a = x; draw(); } });
    var row = group(controls, 'Actions');
    btn('Best fit', row).addEventListener('click', function () { a = best.a; b = best.b; s1.setValue(b); s2.setValue(a); draw(); });
    choice(controls, 'Bands (best fit)', ['None', '95% confidence band', '95% prediction band'], band, function (i) { band = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Spring extension against mass with an adjustable line and its residuals'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(b, 4)); valText(s2, fmt(a, 2));
      var L = 44, R = W - 16, T = 24, B = 220, ax = axes(svg, c, fs, L, R, T, B, -10, 320, -2, 18, [0, 100, 200, 300], [0, 5, 10, 15], 'mass (g)', 'extension (mm)');
      if (band) {
        var tc = tinv(0.975, best.n - 2), up = '', dn = '';
        for (var k = 0; k <= 40; k++) { var m = -10 + 330 * k / 40, h = tc * best.s * Math.sqrt((band === 2 ? 1 : 0) + 1 / best.n + Math.pow(m - best.mx, 2) / best.sxx), y = best.a + best.b * m; up += (k ? 'L' : 'M') + ax.X(m).toFixed(1) + ' ' + ax.Y(y + h).toFixed(1); dn = 'L' + ax.X(m).toFixed(1) + ' ' + ax.Y(y - h).toFixed(1) + dn; }
        el('path', { d: up + dn + 'Z', fill: band === 1 ? BLUE : GREEN, opacity: 0.15 }, svg);
      }
      var sse = 0;
      M.forEach(function (m, i) {
        var yh = a + b * m, r = E[i] - yh; sse += r * r;
        var px = Math.abs(ax.Y(E[i]) - ax.Y(yh));
        el('rect', { x: ax.X(m), y: Math.min(ax.Y(E[i]), ax.Y(yh)), width: Math.min(px, R - ax.X(m)), height: px, fill: AMBER, opacity: 0.2, stroke: AMBER, 'stroke-width': 0.6 }, svg);
        el('line', { x1: ax.X(m), y1: ax.Y(E[i]), x2: ax.X(m), y2: ax.Y(yh), stroke: RED, 'stroke-width': 1.5 }, svg);
      });
      el('line', { x1: ax.X(-10), y1: ax.Y(a - 10 * b), x2: ax.X(320), y2: ax.Y(a + 320 * b), stroke: c.ink, 'stroke-width': 2 }, svg);
      M.forEach(function (m, i) { el('circle', { cx: ax.X(m), cy: ax.Y(E[i]), r: 4.5, fill: BLUE }, svg); });
      var isBest = Math.abs(a - best.a) < 0.01 && Math.abs(b - best.b) < 0.0001;
      out.innerHTML = 'Sum of squared residuals (the orange squares): <strong>' + fmt(sse, 2) + '</strong> mm²; the least-squares minimum is ' + fmt(best.sse, 2) + ' mm².' + (isBest ? ' This is the best fit: slope <strong>' + fmt(best.b, 4) + ' ± ' + fmt(best.seb, 4) + '</strong> mm/g, intercept ' + fmt(best.a, 2) + ' ± ' + fmt(best.sea, 2) + ' mm, R² = ' + fmt(best.r2, 3) + '.' : ' Adjust the line to make the squares as small as you can, then press Best fit.') +
        NOTE + 'The least-squares line minimises the total area of the squares: the sum of squared vertical distances from the points to the line. The confidence band shows where the true line probably lies; the wider prediction band shows where a new single measurement would probably fall. Both are narrowest at the mean of x.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Residual diagnostics
     ----------------------------------------------------------------------- */
  FIG['fig-residuals'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var N = 25, U = [], Z = zs(N), si = 0;
    for (var i = 0; i < N; i++) U.push(0.5 + 9.5 * i / (N - 1));
    var SC = [
      { name: 'Good fit', f: function (x, z) { return 2 + 0.8 * x + 0.8 * z; }, note: 'Residuals scatter evenly around zero with no pattern: the straight-line model is adequate.' },
      { name: 'Curved', f: function (x, z) { return 1 + 0.15 * x * x + 0.6 * z; }, note: 'The residuals form a U: the relation is curved, and a straight line systematically misses. R² can still look high. Fit a curve, or transform a variable.' },
      { name: 'Funnel', f: function (x, z) { return 2 + 0.8 * x + 0.25 * x * z; }, note: 'The residuals fan out as x grows: the scatter is not constant (heteroscedasticity). The slope is still unbiased, but its standard error is wrong. Use weights, a transformation, or robust standard errors.' },
      { name: 'Influential point', f: function (x, z, i) { return i === N - 1 ? 2 : 2 + 0.8 * x + 0.6 * z; }, note: 'One point far out in x with an unusual y pulls the whole line towards it. Its Cook’s distance is far above the others. Check it: a typo, a failed run, or genuinely important?' }
    ];
    var controls = div('fig-controls', container);
    choice(controls, 'Scenario', SC.map(function (s) { return s.name; }), si, function (k) { si = k; draw(); });
    var row = group(controls, 'Actions');
    btn('New data', row).addEventListener('click', function () { Z = zs(N); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 440 : 240, 'Data with fitted line, and residuals against fitted values'), W = A.W, svg = A.svg, fs = A.fs;
      var s = SC[si], x = U.map(function (u, k) { return si === 3 && k === N - 1 ? 18 : u; }), y = x.map(function (v, k) { return s.f(v, Z[k], k); }), f = linfit(x, y);
      var res = y.map(function (v, k) { return v - f.a - f.b * x[k]; }), fit = x.map(function (v) { return f.a + f.b * v; });
      var cook = x.map(function (v, k) { var h = 1 / N + Math.pow(v - f.mx, 2) / f.sxx; return res[k] * res[k] / (2 * f.s * f.s) * h / Math.pow(1 - h, 2); }), cmax = Math.max.apply(null, cook);
      var pw = narrow ? W : W / 2, ph = narrow ? 220 : 240;
      var xl = 0, xh = Math.max.apply(null, x) + 1, yl = Math.min(0, Math.min.apply(null, y)) - 1, yh = Math.max.apply(null, y) + 1;
      var ax = axes(svg, c, fs, 40, pw - 14, 24, ph - 40, xl, xh, yl, yh, [], [], 'x', 'data and fitted line');
      el('line', { x1: ax.X(xl), y1: ax.Y(f.a + f.b * xl), x2: ax.X(xh), y2: ax.Y(f.a + f.b * xh), stroke: RED, 'stroke-width': 2 }, svg);
      x.forEach(function (v, k) { el('circle', { cx: ax.X(v), cy: ax.Y(y[k]), r: 3.4, fill: cook[k] === cmax && cmax > 0.5 ? AMBER : BLUE }, svg); });
      var ox = narrow ? 0 : pw, oy = narrow ? ph : 0, rl = Math.min.apply(null, res), rh = Math.max.apply(null, res), rr = Math.max(Math.abs(rl), Math.abs(rh)) * 1.15;
      var fl = Math.min.apply(null, fit), fh = Math.max.apply(null, fit);
      var ax2 = axes(svg, c, fs, ox + 40, ox + pw - 14, oy + 24, oy + ph - 40, fl - 0.5, fh + 0.5, -rr, rr, [], [], 'fitted value', 'residuals');
      el('line', { x1: ax2.X(fl - 0.5), y1: ax2.Y(0), x2: ax2.X(fh + 0.5), y2: ax2.Y(0), stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      res.forEach(function (r, k) { el('circle', { cx: ax2.X(fit[k]), cy: ax2.Y(r), r: 3.4, fill: cook[k] === cmax && cmax > 0.5 ? AMBER : PURPLE }, svg); });
      out.innerHTML = '<strong>' + s.name + '.</strong> R² = ' + fmt(f.r2, 3) + ', largest Cook’s distance = ' + fmt(cmax, 2) + (cmax > 1 ? ' (above 1: highly influential)' : '') + '.' + NOTE + s.note + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Curve fitting and chi-square
     ----------------------------------------------------------------------- */
  FIG['fig-curve-fit'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var XS = [], YS = [1.35, 3.09, 5.99, 5.86, 4.23, 6.33, 5.99, 6.83, 4.95, 6.48, 5.95, 6.58], SIG = 1, deg = 1;
    for (var i = 0; i < 12; i++) XS.push(10 * i / 11);
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cf-d', label: 'Polynomial degree', min: 0, max: 8, step: 1, value: deg, onChange: function (x) { deg = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Twelve measurements with error bars and a fitted polynomial'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, String(deg) + (deg === 0 ? ' (constant)' : deg === 1 ? ' (straight line)' : deg === 2 ? ' (quadratic)' : ''));
      var f = polyfit(XS, YS, deg), chi = 0, nu = 12 - (deg + 1);
      XS.forEach(function (x, k) { chi += Math.pow((YS[k] - f(x)) / SIG, 2); });
      var ax = axes(svg, c, fs, 40, W - 14, 24, 200, -0.3, 10.3, -1, 10, [0, 2, 4, 6, 8, 10], [0, 2, 4, 6, 8], 'x', 'y (error bars ± 1σ)');
      var d = '';
      for (var k = 0; k <= 200; k++) { var x = -0.3 + 10.6 * k / 200, y = Math.max(-1, Math.min(10, f(x))); d += (k ? 'L' : 'M') + ax.X(x).toFixed(1) + ' ' + ax.Y(y).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg);
      XS.forEach(function (x, k) { el('line', { x1: ax.X(x), y1: ax.Y(YS[k] - SIG), x2: ax.X(x), y2: ax.Y(YS[k] + SIG), stroke: BLUE, 'stroke-width': 1.3 }, svg); el('circle', { cx: ax.X(x), cy: ax.Y(YS[k]), r: 3.8, fill: BLUE }, svg); });
      var red = nu > 0 ? chi / nu : NaN, pv = nu > 0 ? 1 - gammaP(nu / 2, chi / 2) : NaN;
      var verdict = nu <= 0 ? 'With as many parameters as points, the curve passes through every point: χ² = 0 but there are no degrees of freedom left, and the fit says nothing.' : red > 2 ? 'χ²/ν is well above 1: the model does not describe the data within their uncertainties. Underfitting.' : red < 0.6 ? 'χ²/ν is well below 1: the curve is chasing the noise. Overfitting (or the error bars are too large).' : 'χ²/ν is close to 1: the model fits the data about as well as their uncertainties allow.';
      out.innerHTML = 'χ² = Σ((y − fit)/σ)² = <strong>' + fmt(chi, 2) + '</strong> with ν = ' + nu + ' degrees of freedom; reduced χ²/ν = <strong>' + (nu > 0 ? fmt(red, 2) : '—') + '</strong>' + (nu > 0 ? ' (p = ' + fmt(pv, 3) + ')' : '') + '.' +
        NOTE + verdict + ' The data were generated from a quadratic curve with σ = 1. Higher degrees always reduce χ², but beyond degree 2 the extra wiggles fit the noise, and the curve behaves wildly outside the data.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Logistic regression
     ----------------------------------------------------------------------- */
  FIG['fig-logistic'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = [1, 2, 3, 4, 5, 6], Y = [1, 3, 7, 12, 16, 19], N = 20, dose = 3.6, showLin = 0;
    var b0 = 0, b1 = 0;
    for (var it = 0; it < 30; it++) {
      var g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
      D.forEach(function (d, i) { var p = 1 / (1 + Math.exp(-(b0 + b1 * d))), w = N * p * (1 - p), r = Y[i] - N * p; g0 += r; g1 += r * d; h00 += w; h01 += w * d; h11 += w * d * d; });
      var det = h00 * h11 - h01 * h01; b0 += (h11 * g0 - h01 * g1) / det; b1 += (h00 * g1 - h01 * g0) / det;
    }
    var se1 = (function () { var h00 = 0, h01 = 0, h11 = 0; D.forEach(function (d) { var p = 1 / (1 + Math.exp(-(b0 + b1 * d))), w = N * p * (1 - p); h00 += w; h01 += w * d; h11 += w * d * d; }); return Math.sqrt(h00 / (h00 * h11 - h01 * h01)); })();
    var lin = linfit(D, Y.map(function (y) { return y / N; }));
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'lg-d', label: 'Dose', min: 0, max: 8, step: 0.05, value: dose, onChange: function (x) { dose = x; draw(); } });
    choice(controls, 'Compare with', ['Logistic only', 'Straight-line fit'], showLin, function (i) { showLin = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 250, 'Proportion responding against dose with a fitted logistic curve'), W = A.W, svg = A.svg, fs = A.fs;
      valText(s1, fmt(dose, 2));
      var ax = axes(svg, c, fs, 44, W - 16, 24, 200, 0, 8, -0.2, 1.2, [0, 2, 4, 6, 8], [0, 0.5, 1], 'dose', 'proportion responding');
      [0, 1].forEach(function (v) { el('line', { x1: ax.X(0), y1: ax.Y(v), x2: ax.X(8), y2: ax.Y(v), stroke: c.muted, 'stroke-dasharray': '3 3' }, svg); });
      if (showLin) el('line', { x1: ax.X(0), y1: ax.Y(Math.max(-0.2, lin.a)), x2: ax.X(8), y2: ax.Y(Math.min(1.2, lin.a + 8 * lin.b)), stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '6 3' }, svg);
      var d = '';
      for (var k = 0; k <= 160; k++) { var x = 8 * k / 160; d += (k ? 'L' : 'M') + ax.X(x).toFixed(1) + ' ' + ax.Y(1 / (1 + Math.exp(-(b0 + b1 * x)))).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 2.5 }, svg);
      D.forEach(function (x, i) { el('circle', { cx: ax.X(x), cy: ax.Y(Y[i] / N), r: 5, fill: c.ink }, svg); });
      var p = 1 / (1 + Math.exp(-(b0 + b1 * dose)));
      el('line', { x1: ax.X(dose), y1: ax.Y(0), x2: ax.X(dose), y2: ax.Y(p), stroke: GREEN, 'stroke-width': 1.5 }, svg); el('circle', { cx: ax.X(dose), cy: ax.Y(p), r: 5, fill: GREEN }, svg);
      var orr = Math.exp(b1);
      out.innerHTML = 'At dose ' + fmt(dose, 2) + ': predicted probability of response <strong>' + fmt(p, 3) + '</strong>, odds ' + fmt(p / (1 - p), 2) + ', log-odds ' + fmt(b0 + b1 * dose, 2) + '. Fitted model: log-odds = ' + fmt(b0, 2) + ' + ' + fmt(b1, 3) + ' × dose. Each unit of dose multiplies the odds by <strong>' + fmt(orr, 2) + '</strong> (95% CI ' + fmt(Math.exp(b1 - 1.96 * se1), 2) + ' to ' + fmt(Math.exp(b1 + 1.96 * se1), 2) + '). Dose giving a 50% response: ' + fmt(-b0 / b1, 2) + '.' +
        NOTE + 'Dots: the share of 20 units responding at each dose. ' + (showLin ? 'The straight line predicts impossible proportions below 0 and above 1 at the ends: proportions need a curve that flattens towards 0 and 1.' : 'The logistic curve is a straight line on the log-odds scale, so it can never leave the range 0 to 1.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A correlation of r = −0.9 means…', options: ['Almost no relation', 'A strong relation in which y tends to fall as x rises', 'x causes y to fall', 'An error in the data'], answer: 1, explanation: 'The sign gives the direction; the size, how closely points follow a line.' },
      { question: 'r = 0 means that…', options: ['x and y are unrelated in every way', 'There is no linear relationship; there could still be a strong curved one', 'The data are wrong', 'The slope is 1'], answer: 1, explanation: 'A perfect U-shape can have r = 0.' },
      { question: 'What lesson does Anscombe’s quartet teach?', options: ['Correlations are always reliable', 'Always plot the data: identical statistics can hide very different patterns', 'Use only Spearman correlations', 'Small samples are always wrong'], answer: 1, explanation: 'The four data sets share means, variances, r and regression line.' },
      { question: 'The least-squares line minimises…', options: ['The sum of the absolute residuals', 'The sum of the squared vertical distances from the points to the line', 'The number of points off the line', 'The perpendicular distances'], answer: 1, explanation: 'Ordinary least squares uses vertical (y) residuals.' },
      { question: 'Why is a prediction band wider than a confidence band?', options: ['It uses a higher confidence level', 'It includes the scatter of single new measurements as well as the uncertainty of the line', 'It is a mistake', 'It uses fewer data'], answer: 1, explanation: 'Confidence bands describe the mean response; prediction bands describe individual values.' },
      { question: 'A residual plot shows a clear U-shape. What does it suggest?', options: ['The fit is perfect', 'The relationship is curved and a straight line is inadequate', 'There are too many data points', 'The errors are too small'], answer: 1, explanation: 'Systematic patterns in residuals indicate a missing term in the model.' },
      { question: 'A weighted fit gives a reduced chi-square χ²/ν = 5. Most likely…', options: ['The fit is excellent', 'The model is wrong or the uncertainties are underestimated', 'The uncertainties are overestimated', 'There are too few parameters to fit'], answer: 1, explanation: 'χ²/ν should be close to 1 if model and uncertainties are both right.' },
      { question: 'Why use logistic rather than linear regression for a yes/no outcome?', options: ['It is easier to compute', 'It models the probability with a curve that stays between 0 and 1', 'Linear regression cannot use doses', 'Logistic regression needs no data'], answer: 1, explanation: 'A straight line can predict impossible probabilities.' },
      { question: 'In logistic regression, an odds ratio of 3 per unit of dose means…', options: ['The probability triples', 'The odds of response are multiplied by 3 for each extra unit of dose', 'Three units are needed for a response', 'The response rate is 3%'], answer: 1, explanation: 'Odds ratios multiply odds, not probabilities.' },
      { question: 'Ice-cream sales and drownings are positively correlated. The most likely explanation is…', options: ['Ice cream causes drowning', 'A common cause, such as hot weather, drives both', 'Drowning increases ice-cream sales', 'Coincidence only'], answer: 1, explanation: 'A confounding variable can create a correlation without causation.' }
    ]);
  };
})();
