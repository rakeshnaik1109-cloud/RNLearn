/* ==========================================================================
   RNLearn — The Riemann Hypothesis, and the Claimed Proof Found with Claude
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

  var ERAS = [
    { name: 'The question', color: '#b45309' },
    { name: 'Partial progress', color: '#7c3aed' },
    { name: 'Machines and proof', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1737', icon: '🔑', era: 0, sec: 4, title: 'Euler’s product', text: 'Leonhard Euler shows that a sum over all whole numbers equals a product over all primes: the link between primes and the zeta function.' },
    { year: '1790s', icon: '📒', era: 0, sec: 3, title: 'Gauss’s guess', text: 'The teenage Carl Friedrich Gauss notices that primes near x occur with density about 1/ln x.' },
    { year: '1859', icon: '📜', era: 0, sec: 5, title: 'Riemann’s paper', text: 'Bernhard Riemann’s eight-page paper on counting primes states the hypothesis in passing, as “very probable”.' },
    { year: '1896', icon: '✅', era: 1, sec: 9, title: 'Prime number theorem', text: 'Hadamard and de la Vallée Poussin prove Gauss’s guess, using the fact that no zeros lie on the edge of the critical strip.' },
    { year: '1900', icon: '📋', era: 1, sec: 9, title: 'Hilbert’s eighth problem', text: 'David Hilbert includes the Riemann hypothesis in his list of the great problems for the new century.' },
    { year: '1914', icon: '♾️', era: 1, sec: 9, title: 'Hardy', text: 'G. H. Hardy proves that infinitely many zeros lie on the critical line.' },
    { year: '1974', icon: '⅓', era: 1, sec: 9, title: 'Levinson', text: 'Norman Levinson proves that more than a third of the zeros lie on the line.' },
    { year: '2000', icon: '💰', era: 1, sec: 14, title: 'A million dollars', text: 'The Clay Mathematics Institute names the Riemann hypothesis one of seven Millennium Prize Problems.' },
    { year: '2021', icon: '🖥️', era: 1, sec: 9, title: 'Three trillion zeros', text: 'David Platt and Tim Trudgian confirm by computer that all zeros up to height 3 × 10¹² lie on the line.' },
    { year: 'Aug 2026', icon: '🤖', era: 2, sec: 11, title: 'Two thirds', text: 'Anthropic reports that a research version of Claude raised the proven share of zeros on the line from about 41.7% to two thirds.' },
    { year: '20 Nov 2026', icon: '📦', era: 2, sec: 12, title: 'A claimed proof', text: 'Levent Alpöge announces a proof of the Riemann hypothesis, found working with Claude, published only as 17 million lines of Lean.' },
    { year: 'Nov 2026', icon: '🔍', era: 2, sec: 13, title: 'Checking begins', text: 'Members of the Lean community check the formal proof with independent tools. Human understanding and refereeing lie ahead.' }
  ];
  FIG['fig-rh-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of key events');
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
     Shared for the series: random numbers, plotting helpers, logic gates
     ----------------------------------------------------------------------- */
  var EC = '#0e7490';
  function rngSeed(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sup10(e) { return '10<tspan baseline-shift="super" font-size="75%">' + e + '</tspan>'; }
  function sciHTML(v, d) { if (v === 0) return '0'; var e = Math.floor(Math.log10(Math.abs(v))); if (e >= -2 && e < 4) return fmt(v, d === undefined ? 3 : d); return fmt(v / Math.pow(10, e), d === undefined ? 2 : d) + ' × 10<sup>' + e + '</sup>'; }
  /* A generic x–y plot frame. o = {L,R,T,B,xl,xh,yl,yh,xticks,yticks,xlab,ylab,logx,logy,xfmt,yfmt}; returns mappers and a clip id. */
  var PLOT_ID = 0;
  function plotAxes(svg, c, fs, o) {
    var lx = function (v) { return o.logx ? Math.log10(v) : v; }, ly = function (v) { return o.logy ? Math.log10(Math.max(v, 1e-300)) : v; };
    var X = function (v) { return o.L + (lx(v) - lx(o.xl)) / (lx(o.xh) - lx(o.xl)) * (o.R - o.L); }, Y = function (v) { return o.B - (ly(v) - ly(o.yl)) / (ly(o.yh) - ly(o.yl)) * (o.B - o.T); };
    (o.yticks || []).forEach(function (v) { el('line', { x1: o.L, y1: Y(v), x2: o.R, y2: Y(v), stroke: c.border, 'stroke-width': 0.5 }, svg); var t = txt(svg, o.L - 6, Y(v) + 4, '', { anchor: 'end', size: fs(9), fill: c.muted }); if (o.logy) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.yfmt ? o.yfmt(v) : String(v); });
    (o.xticks || []).forEach(function (v) { var t = txt(svg, X(v), o.B + 14, '', { size: fs(9), fill: c.muted }); if (o.logx) t.innerHTML = sup10(Math.round(Math.log10(v))); else t.textContent = o.xfmt ? o.xfmt(v) : String(v); });
    el('line', { x1: o.L, y1: o.B, x2: o.R, y2: o.B, stroke: c.muted }, svg); el('line', { x1: o.L, y1: o.T, x2: o.L, y2: o.B, stroke: c.muted }, svg);
    if (o.xlab) txt(svg, (o.L + o.R) / 2, o.B + 30, o.xlab, { size: fs(10), fill: c.muted });
    if (o.ylab) { var yt = txt(svg, 12, (o.T + o.B) / 2, o.ylab, { size: fs(10), fill: c.muted }); yt.setAttribute('transform', 'rotate(-90 12 ' + ((o.T + o.B) / 2) + ')'); }
    var id = 'pc' + (++PLOT_ID), cp = el('clipPath', { id: id }, svg); el('rect', { x: o.L, y: o.T - 2, width: o.R - o.L, height: o.B - o.T + 4 }, cp);
    return { X: X, Y: Y, clip: 'url(#' + id + ')' };
  }
  function plotLine(svg, P, f, x0, x1, n, col, w, dash, logx) { var d = ''; for (var k = 0; k <= n; k++) { var x = logx ? Math.pow(10, Math.log10(x0) + (Math.log10(x1) - Math.log10(x0)) * k / n) : x0 + (x1 - x0) * k / n, y = f(x); if (!isFinite(y)) continue; d += (d ? 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); } el('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w || 2.2, 'stroke-dasharray': dash || 'none', 'clip-path': P.clip }, svg); }
  function legend(svg, c, fs, W, wide, narrow) { txt(svg, 10, 14, W < 520 ? narrow : wide, { anchor: 'start', size: fs(10), fill: c.muted }); }
  /* Riemann zeta by Euler–Maclaurin summation, for 0 < σ < 1 and |t| up to about 110 */
  var BERN = [1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6, -3617 / 510];
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function npow(n, s) { var l = Math.log(n), m = Math.exp(-s[0] * l); return [m * Math.cos(-s[1] * l), m * Math.sin(-s[1] * l)]; } /* n^(-s) */
  function zeta(s) {
    var N = 50, sum = [0, 0], i, k;
    for (i = 1; i < N; i++) { var p = npow(i, s); sum[0] += p[0]; sum[1] += p[1]; }
    var Ns = npow(N, s), t1 = cdiv(cmul(Ns, [N, 0]), [s[0] - 1, s[1]]);
    sum[0] += t1[0] + Ns[0] / 2; sum[1] += t1[1] + Ns[1] / 2;
    var poch = s.slice(), fact = 2, Npow = cdiv(Ns, [N, 0]);
    for (k = 1; k <= 8; k++) {
      var term = cmul(poch, Npow); var c = BERN[k - 1] / fact;
      sum[0] += c * term[0]; sum[1] += c * term[1];
      poch = cmul(cmul(poch, [s[0] + 2 * k - 1, s[1]]), [s[0] + 2 * k, s[1]]);
      fact *= (2 * k + 1) * (2 * k + 2); Npow = cdiv(Npow, [N * N, 0]);
    }
    return sum;
  }
  var MU = '#0e7490';
  var GAMMAS = [14.134725, 21.022040, 25.010858, 30.424876, 32.935062, 37.586178, 40.918719, 43.327073, 48.005151, 49.773832, 52.970321, 56.446248, 59.347044, 60.831779, 65.112544, 67.079811, 69.546402, 72.067158, 75.704691, 77.144840, 79.337375, 82.910381, 84.735493, 87.425275, 88.809111, 92.491899, 94.651344, 95.870634, 98.831194, 101.317851];
  var SIEVE = (function () { var n = 1000001, a = new Uint8Array(n), pr = []; for (var i = 2; i < n; i++) { if (!a[i]) { pr.push(i); for (var j = i * i; j < n; j += i) a[j] = 1; } } return pr; })();
  function piX(x) { var lo = 0, hi = SIEVE.length; while (lo < hi) { var m = (lo + hi) >> 1; if (SIEVE[m] <= x) lo = m + 1; else hi = m; } return lo; }
  function li(x) { var L = Math.log(x), s = 0, term = 1; for (var k = 1; k < 200; k++) { term *= L / k; s += term / k; if (term / k < 1e-17 * s) break; } return 0.5772156649 + Math.log(L) + s; }
  function Li(x) { return li(x) - li(2); }

  /* -----------------------------------------------------------------------
     Figure: counting primes
     ----------------------------------------------------------------------- */
  FIG['fig-prime-count'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lg = 2;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'pc-x', label: 'Count primes up to x', min: 2, max: 6, step: 0.05, value: lg, onChange: function (v) { lg = v; valText(sl, fmt(Math.round(Math.pow(10, v)), 0)); draw(); } });
    valText(sl, '100');
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'The number of primes up to x, compared with x divided by ln x and with the logarithmic integral'), W = A.W, svg = A.svg, fs = A.fs;
      var X = Math.round(Math.pow(10, lg)), ymax = Li(X) * 1.12;
      var P = plotAxes(svg, c, fs, { L: 58, R: W - 16, T: 26, B: 245, xl: 0, xh: X, yl: 0, yh: ymax, xticks: [0, X / 2, X].map(Math.round), yticks: [0, Math.round(ymax / 2), Math.round(ymax)], xfmt: function (v) { return fmt(v, 0); }, yfmt: function (v) { return fmt(v, 0); }, xlab: 'x', ylab: 'how many primes' });
      var d = '', n = Math.min(600, X), prev = 0;
      for (var i = 0; i <= n; i++) { var x = 2 + (X - 2) * i / n, y = piX(x); d += (i ? 'L' + P.X(x).toFixed(1) + ' ' + P.Y(prev).toFixed(1) + 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); prev = y; }
      el('path', { d: d, fill: 'none', stroke: c.ink, 'stroke-width': 1.6 }, svg);
      plotLine(svg, P, function (x) { return x / Math.log(x); }, 3, X, 200, AMBER, 2, '6 4');
      plotLine(svg, P, Li, 2.5, X, 200, MU, 2);
      legend(svg, c, fs, W, 'black: π(x), the true count · amber dashed: x / ln x · teal: Li(x)', 'black: π(x) · amber: x/ln x · teal: Li(x)');
      var p = piX(X), a = X / Math.log(X), b = Li(X);
      out.innerHTML = 'Up to <strong>' + fmt(X, 0) + '</strong> there are <strong>' + fmt(p, 0) + '</strong> primes. Gauss’s x / ln x gives ' + fmt(a, 0) + ' (' + fmt(100 * (a - p) / p, 1) + '%); the logarithmic integral Li(x) gives ' + fmt(b, 0) + ' (' + (b >= p ? '+' : '') + fmt(100 * (b - p) / p, 2) + '%).' + NOTE + 'Primes thin out, but in a regular way: near <em>x</em>, about one number in ln <em>x</em> is prime. Adding up these chances gives Li(<em>x</em>), a remarkably good estimate. The Riemann hypothesis is equivalent to saying that the error of Li(<em>x</em>) never grows much faster than √<em>x</em>: roughly, the primes are as regular as they could possibly be.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: hunting zeros of the zeta function
     ----------------------------------------------------------------------- */
  FIG['fig-zeta-zeros'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sig = 0.5;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'zz-s', label: 'Real part σ of s = σ + it', min: 0.1, max: 0.9, step: 0.05, value: sig, onChange: function (v) { sig = v; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'The size of the zeta function along a vertical line in the complex plane; it touches zero only on the critical line'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 16, T: 26, B: 245, xl: 0, xh: 52, yl: 0, yh: 3.2, xticks: [0, 10, 20, 30, 40, 50], yticks: [0, 1, 2, 3], xlab: 't (height up the line)', ylab: '|ζ(σ + it)|' });
      var d = '', mn = 9, n = 900;
      for (var i = 0; i <= n; i++) { var t = 0.5 + 51.5 * i / n, z = zeta([sig, t]), m = Math.hypot(z[0], z[1]); if (t > 10) mn = Math.min(mn, m); d += (i ? 'L' : 'M') + P.X(t).toFixed(1) + ' ' + P.Y(Math.min(m, 3.2)).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: MU, 'stroke-width': 2, 'clip-path': P.clip }, svg);
      if (Math.abs(sig - 0.5) < 1e-9) GAMMAS.slice(0, 10).forEach(function (g, j) { el('circle', { cx: P.X(g), cy: P.Y(0), r: 4, fill: RED }, svg); if (j < (W > 560 ? 6 : 1)) txt(svg, P.X(g), P.Y(0) - 10, fmt(g, 2), { size: fs(8.5), fill: RED }); });
      out.innerHTML = (Math.abs(sig - 0.5) < 1e-9 ? 'The curve touches <strong>zero</strong> at each red dot.' : 'Smallest value between t = 10 and 52: <strong>' + fmt(mn, 3) + '</strong>, never zero.') + NOTE + (Math.abs(sig - 0.5) < 1e-9 ? 'On the critical line σ = ½ the curve touches zero again and again: at t = 14.13, 21.02, 25.01, 30.42… These are the first nontrivial zeros of the zeta function, computed by this figure. ' : 'Off the critical line the curve dips but never reaches zero. ') + 'The Riemann hypothesis says that this is true for every zero, however high up the line: all nontrivial zeros have real part exactly ½. Computers have checked the first 12 trillion or so; the hypothesis is about all of them.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the zeros rebuild the primes (explicit formula)
     ----------------------------------------------------------------------- */
  FIG['fig-explicit-formula'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var K = 10;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'ef-k', label: 'Number of zeros used', min: 0, max: 30, step: 1, value: K, onChange: function (v) { K = v; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var XM = 50;
    function psi(x) { var s = 0; for (var i = 0; i < SIEVE.length && SIEVE[i] <= x; i++) { var p = SIEVE[i], q = p; while (q <= x) { s += Math.log(p); q *= p; } } return s; }
    function approx(x, k) { var L = Math.log(x), s = x - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (x * x)); for (var j = 0; j < k; j++) { var g = GAMMAS[j]; s -= 2 * Math.sqrt(x) * (0.5 * Math.cos(g * L) + g * Math.sin(g * L)) / (0.25 + g * g); } return s; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'A staircase that jumps at each prime power, and a smooth curve built from zeros of the zeta function that approaches it'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 16, T: 26, B: 245, xl: 0, xh: XM, yl: 0, yh: 55, xticks: [0, 10, 20, 30, 40, 50], yticks: [0, 25, 50], xlab: 'x', ylab: 'ψ(x)' });
      var d = '', prev = 0; for (var i = 0; i <= 500; i++) { var x = 1 + (XM - 1) * i / 500, y = psi(x); d += (i ? 'L' + P.X(x).toFixed(1) + ' ' + P.Y(prev).toFixed(1) + 'L' : 'M') + P.X(x).toFixed(1) + ' ' + P.Y(y).toFixed(1); prev = y; }
      el('path', { d: d, fill: 'none', stroke: c.ink, 'stroke-width': 1.4 }, svg);
      plotLine(svg, P, function (x) { return approx(x, K); }, 1.5, XM, 700, MU, 2);
      [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47].forEach(function (p) { if (W > 560) txt(svg, P.X(p), 290, String(p), { size: fs(8), fill: AMBER }); });
      legend(svg, c, fs, W, 'black: ψ(x), jumping by ln p at every prime power p^k · teal: Riemann’s formula with ' + K + ' pairs of zeros', 'black: ψ(x) · teal: formula, ' + K + ' zeros');
      out.innerHTML = 'Using the first <strong>' + K + '</strong> zero' + (K === 1 ? '' : 's') + '. ' + (K === 0 ? 'Without zeros the formula is just the smooth trend, x.' : K < 10 ? 'Each zero adds a wave; the curve starts to bend towards the steps.' : 'The waves combine to put a step at every prime and prime power.') + NOTE + 'Riemann’s explicit formula writes a prime-counting staircase, ψ(<em>x</em>), exactly as a smooth trend minus a sum of waves, one for each zero ρ of the zeta function: ψ(<em>x</em>) = <em>x</em> − Σ <em>x</em><sup>ρ</sup>/ρ − ln 2π − ½ ln(1 − <em>x</em><sup>−2</sup>). Each zero’s height sets the frequency of its wave, and its real part sets how fast the wave grows. If every real part is ½, every wave grows like √<em>x</em>, and the primes stay close to their average trend. The zeros used here are the true ones.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: how much of the line has been proven?
     ----------------------------------------------------------------------- */
  FIG['fig-zero-records'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var REC = [
      [1914, 0, 'Hardy', 'Infinitely many zeros on the line, but a vanishing proportion of them.'],
      [1942, 2, 'Selberg', 'A positive proportion of zeros on the line: the first constant fraction, though very small.'],
      [1974, 34.74, 'Levinson', 'More than a third of the zeros lie on the line.'],
      [1989, 40.88, 'Conrey', 'More than two fifths.'],
      [2020, 41.73, 'Pratt, Robles, Zaharescu and Zeindler', 'More than five twelfths: the record before 2026.'],
      [2026, 66.67, 'Alpöge and Furman (proof by Claude)', 'At least two thirds of the zeros are simple and on the line (67.25% with a refinement); a preprint, checked by experts and formalised in Lean.']
    ];
    var k = 5;
    var controls = div('fig-controls', container);
    choice(controls, 'Result', REC.map(function (r) { return String(r[0]); }), k, function (i) { k = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 260, 'Proven lower bounds on the percentage of zeta zeros on the critical line, over time'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 16, T: 20, B: 220, xl: 1905, xh: 2030, yl: 0, yh: 100, xticks: [1910, 1950, 1990, 2030], yticks: [0, 25, 50, 75, 100], xlab: 'year', ylab: '% of zeros proven on the line' });
      el('line', { x1: P.X(1905), y1: P.Y(100), x2: P.X(2030), y2: P.Y(100), stroke: RED, 'stroke-dasharray': '5 4' }, svg);
      txt(svg, P.X(1907), P.Y(100) + 14, 'Riemann hypothesis: 100%', { anchor: 'start', size: fs(9.5), fill: RED });
      var d = ''; REC.forEach(function (r, i) { d += (i ? 'L' + P.X(r[0]).toFixed(1) + ' ' + P.Y(REC[i - 1][1]).toFixed(1) + 'L' : 'M') + P.X(r[0]).toFixed(1) + ' ' + P.Y(r[1]).toFixed(1); });
      el('path', { d: d, fill: 'none', stroke: MU, 'stroke-width': 2 }, svg);
      REC.forEach(function (r, i) { el('circle', { cx: P.X(r[0]), cy: P.Y(r[1]), r: i === k ? 6 : 4, fill: i === 5 ? PURPLE : MU, stroke: i === k ? c.ink : 'none', 'stroke-width': 1.5 }, svg); });
      var r = REC[k];
      out.innerHTML = '<strong>' + r[0] + ', ' + r[2] + ':</strong> ' + r[3] + (k === 1 ? ' (Selberg’s fraction was not computed explicitly; its height here is only schematic.)' : '') + NOTE + 'Since Hardy, mathematicians have proved that a growing share of the zeros, counted up to great heights, lie exactly on the critical line. Each step needed new ideas, and progress from 1974 to 2020 was only about seven percentage points. The 2026 jump to two thirds came from Claude. A proof of the Riemann hypothesis would mean 100%, with no exceptions at all.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-rh'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Near a large number x, roughly what fraction of numbers are prime?', options: ['1/x', '1/ln x', '1/√x', 'Half'], answer: 1, explanation: 'Gauss’s observation, made precise by the prime number theorem.' },
      { question: 'What did Euler’s product (1737) connect?', options: ['Primes and the zeta function', 'Circles and triangles', 'Light and gravity', 'Primes and π only'], answer: 0, explanation: 'A sum over all numbers equals a product over all primes.' },
      { question: 'What does the Riemann hypothesis say?', options: ['There are infinitely many primes', 'All nontrivial zeros of the zeta function have real part ½', 'Every even number is a sum of two primes', 'The zeta function has no zeros'], answer: 1, explanation: 'They all lie on the critical line.' },
      { question: 'Why do mathematicians care about where the zeros are?', options: ['They control how far the primes stray from their average distribution', 'They give the digits of π', 'They are needed for arithmetic', 'They are prime numbers'], answer: 0, explanation: 'Through Riemann’s explicit formula.' },
      { question: 'Who proved in 1914 that infinitely many zeros are on the critical line?', options: ['Riemann', 'Hardy', 'Hilbert', 'Euler'], answer: 1, explanation: 'G. H. Hardy.' },
      { question: 'What did a research version of Claude prove, as reported in August 2026?', options: ['The full Riemann hypothesis', 'That at least two thirds of the zeros are on the critical line', 'The prime number theorem', 'That the hypothesis is false'], answer: 1, explanation: 'Raising the record from about 41.7%.' },
      { question: 'In what form was the November 2026 claimed proof released?', options: ['A 300-page journal article', 'A formal proof of about 17 million lines in the Lean proof assistant', 'A video lecture', 'A short note with all details'], answer: 1, explanation: 'With a four-page note and no human-readable proof.' },
      { question: 'What does a proof assistant’s kernel check?', options: ['That every step follows logically from the axioms and earlier results', 'That the proof is easy to read', 'That the result is interesting', 'That the author is reliable'], answer: 0, explanation: 'Humans must still confirm the statement means what we intend.' },
      { question: 'What does the Clay Institute require before awarding its prize?', options: ['A press release', 'Publication in a qualifying outlet, two years’ wait and general acceptance by mathematicians', 'A computer check only', 'Nothing'], answer: 1, explanation: 'Acceptance takes time.' },
      { question: 'Would a proof of the Riemann hypothesis break internet encryption?', options: ['Yes, immediately', 'No: it would not give a fast way to factor large numbers', 'Only for passwords', 'Only for banks'], answer: 1, explanation: 'A common myth.' }
    ]);
  };
})();
