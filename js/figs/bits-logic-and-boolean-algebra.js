/* ==========================================================================
   RNLearn — Bits, Logic and Boolean Algebra (From Switch to Supercomputer, Part 1)
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
    { name: 'Logic on paper', color: '#b45309' },
    { name: 'Logic in switches', color: '#1d4ed8' },
    { name: 'Logic on chips', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1703', icon: '0️⃣', era: 0, sec: 3, title: 'Binary arithmetic', text: 'Gottfried Wilhelm Leibniz publishes his account of arithmetic using only 0 and 1.' },
    { year: '1847', icon: '📜', era: 0, sec: 5, title: 'De Morgan’s laws', text: 'Augustus De Morgan publishes <em>Formal Logic</em>; the rules relating “not (A and B)” and “not A or not B” bear his name.' },
    { year: '1854', icon: '🧮', era: 0, sec: 5, title: 'Boolean algebra', text: 'George Boole’s <em>Laws of Thought</em> turns logic into algebra with variables that are true or false.' },
    { year: '1886', icon: '🔌', era: 1, sec: 4, title: 'Logic with electricity', text: 'Charles Sanders Peirce suggests in a letter that logical operations could be carried out by electrical switching circuits.' },
    { year: '1913', icon: '✂️', era: 0, sec: 6, title: 'One operation suffices', text: 'Henry Sheffer shows that all of Boolean algebra can be built from a single operation, now called NAND.' },
    { year: '1938', icon: '🎓', era: 1, sec: 4, title: 'Shannon’s thesis', text: 'Claude Shannon shows that Boolean algebra describes and simplifies relay switching circuits.' },
    { year: '1941', icon: '⚙️', era: 1, sec: 3, title: 'Binary computers', text: 'Konrad Zuse completes the Z3, a programmable computer working in binary with relays.' },
    { year: '1948', icon: '📡', era: 1, sec: 3, title: 'The bit', text: 'Shannon’s information theory introduces the word “bit”, which he credits to John Tukey.' },
    { year: '1971', icon: '🔲', era: 2, sec: 8, title: 'Logic on one chip', text: 'The Intel 4004 puts a whole processor, about 2,300 transistors, on a single chip.' }
  ];

  FIG['fig-el1-timeline'] = function (figEl) {
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

  var EL_PART = 1;
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
  /* Logic gates */
  var GATES = {
    AND: function (a, b) { return a & b; }, OR: function (a, b) { return a | b; }, NOT: function (a) { return a ? 0 : 1; },
    NAND: function (a, b) { return (a & b) ? 0 : 1; }, NOR: function (a, b) { return (a | b) ? 0 : 1; }, XOR: function (a, b) { return a ^ b; }, XNOR: function (a, b) { return (a ^ b) ? 0 : 1; }
  };
  /* Draw a gate symbol (distinctive shapes) centred at (x, y), width w, with input/output pins. */
  function drawGate(svg, c, kind, x, y, w, on) {
    var h = w * 0.7, l = x - w / 2, r = x + w / 2, t = y - h / 2, b = y + h / 2, col = on ? EC : c.ink2, fill = on ? EC + '22' : c.surface, d;
    var base = kind.replace(/^N(?=AND|OR)/, '').replace('XNOR', 'XOR'), inv = /^N(AND|OR)$|^NOT$|^XNOR$/.test(kind);
    if (base === 'AND') d = 'M' + l + ' ' + t + 'L' + x + ' ' + t + 'A' + (h / 2) + ' ' + (h / 2) + ' 0 0 1 ' + x + ' ' + b + 'L' + l + ' ' + b + 'Z';
    else if (base === 'NOT') d = 'M' + l + ' ' + t + 'L' + (r - 8) + ' ' + y + 'L' + l + ' ' + b + 'Z';
    else d = 'M' + l + ' ' + t + 'Q' + (x + w * 0.1) + ' ' + t + ' ' + (r - (inv ? 8 : 0)) + ' ' + y + 'Q' + (x + w * 0.1) + ' ' + b + ' ' + l + ' ' + b + 'Q' + (l + w * 0.22) + ' ' + y + ' ' + l + ' ' + t + 'Z';
    el('path', { d: d, fill: fill, stroke: col, 'stroke-width': 2 }, svg);
    if (base === 'XOR') el('path', { d: 'M' + (l - 6) + ' ' + t + 'Q' + (l - 6 + w * 0.22) + ' ' + y + ' ' + (l - 6) + ' ' + b, fill: 'none', stroke: col, 'stroke-width': 2 }, svg);
    if (inv) el('circle', { cx: r - 4, cy: y, r: 4, fill: c.surface, stroke: col, 'stroke-width': 2 }, svg);
    return { inA: [l + (base === 'OR' || base === 'XOR' ? w * 0.1 : 0), y - h * 0.25], inB: [l + (base === 'OR' || base === 'XOR' ? w * 0.1 : 0), y + h * 0.25], inN: [l, y], out: [r, y] };
  }
  function wire(svg, c, p, q, on) { var mx = (p[0] + q[0]) / 2; el('path', { d: 'M' + p[0] + ' ' + p[1] + 'L' + mx + ' ' + p[1] + 'L' + mx + ' ' + q[1] + 'L' + q[0] + ' ' + q[1], fill: 'none', stroke: on ? EC : c.muted, 'stroke-width': on ? 2.6 : 1.6 }, svg); }

  /* -----------------------------------------------------------------------
     Figure: series map
     ----------------------------------------------------------------------- */
  var EL_PARTS = [
    ['Bits, Logic and Boolean Algebra', 'Binary numbers, truth tables, logic gates, Boolean laws and De Morgan’s theorem.'],
    ['Combinational Circuits', 'Karnaugh maps, multiplexers, decoders, adders and two’s complement.'],
    ['Memory and Time', 'Latches, flip-flops, clocks, registers, counters and state machines.'],
    ['Circuits and Signals', 'Charge, current, voltage, Ohm’s and Kirchhoff’s laws, RC circuits and switching energy.'],
    ['Band Theory', 'Why semiconductors conduct: energy bands, electrons and holes, doping and the Fermi level.'],
    ['The p–n Junction', 'Depletion, diodes, the Shockley equation, LEDs, photodiodes and solar cells.'],
    ['The Bipolar Transistor', 'How a BJT amplifies and switches; operating regions and gain.'],
    ['The MOSFET', 'The MOS capacitor, threshold voltage and the most-manufactured device in history.'],
    ['CMOS Logic', 'Inverters, noise margins, gates from transistors, power, delay and memory cells.'],
    ['Making Chips', 'Wafers, lithography, fabrication, yield, Moore’s law and Dennard scaling.'],
    ['Modern Transistors', 'Short-channel effects, high-k gates, FinFETs and gate-all-around nanosheets.'],
    ['The Processor', 'How a CPU executes instructions: datapath, pipelining, caches and prediction.'],
    ['GPUs and Parallel Computing', 'SIMD and SIMT, memory bandwidth, Amdahl’s law and why AI runs on GPUs.'],
    ['Beyond Silicon', 'Chiplets, accelerators, photonics, neuromorphic and quantum computing.']
  ];
  FIG['fig-el-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var CUR = EL_PART, sel = CUR;
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var SHORT = ['Logic', 'Circuits', 'Memory', 'Signals', 'Bands', 'Diode', 'BJT', 'MOSFET', 'CMOS', 'Chips', 'FinFET', 'CPU', 'GPU', 'Future'];
    function draw() {
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, per = narrow ? 5 : 7, rows = Math.ceil(14 / per), A = newSVG(svgWrap, container, rows * 74 + 14, 'Map of the fourteen parts of the series'), W = A.W, svg = A.svg, fs = A.fs;
      var cols = ['#2563eb', '#16a34a', '#d97706', '#0e7490'];
      for (var i = 0; i < 14; i++) {
        var rr = Math.floor(i / per), kk = i % per, cx = 26 + (W - 52) * (kk + 0.5) / per, cy = 32 + rr * 74, col = cols[i < 3 ? 0 : i < 8 ? 1 : i < 12 ? 2 : 3];
        if (kk > 0) el('line', { x1: 26 + (W - 52) * (kk - 0.5) / per + 13, y1: cy, x2: cx - 13, y2: cy, stroke: c.border, 'stroke-width': 2 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + ': ' + EL_PARTS[i][0], style: 'cursor:pointer' }, svg);
        el('circle', { cx: cx, cy: cy, r: i + 1 === sel ? 14 : 11, fill: i + 1 === CUR ? col : c.surface, stroke: col, 'stroke-width': i + 1 === sel ? 3 : 2 }, g);
        txt(g, cx, cy + 4, String(i + 1), { size: fs(10), weight: 700, fill: i + 1 === CUR ? '#fff' : col });
        txt(g, cx, cy + 30, SHORT[i], { size: fs(9), fill: c.ink2 });
        (function (n) { g.addEventListener('click', function () { sel = n; draw(); }); keyClick(g, function () { sel = n; draw(); }); })(i + 1);
      }
      out.innerHTML = '<strong>Part ' + sel + ': ' + EL_PARTS[sel - 1][0] + '.</strong> ' + EL_PARTS[sel - 1][1] + (sel === CUR ? ' <em>(you are here)</em>' : '') + NOTE + 'Blue: logic (Parts 1–3). Green: the physics of switches (4–8). Amber: building computers (9–12). Teal: parallel and future computing (13–14).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: counting in binary
     ----------------------------------------------------------------------- */
  FIG['fig-el-binary'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var bits = [1, 0, 0, 1, 1, 1, 0, 0];
    var controls = div('fig-controls', container), row = group(controls, 'Shortcuts');
    btn('All zero', row).addEventListener('click', function () { bits = bits.map(function () { return 0; }); draw(); });
    btn('Add 1', row).addEventListener('click', function () { var v = (val() + 1) % 256; setV(v); draw(); });
    btn('Shift left (× 2)', row).addEventListener('click', function () { setV((val() * 2) % 256); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function val() { return bits.reduce(function (s, b) { return s * 2 + b; }, 0); }
    function setV(v) { for (var i = 7; i >= 0; i--) { bits[i] = v % 2; v = Math.floor(v / 2); } }
    function draw() {
      var c = C(), W0 = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), cw = Math.min(70, (W0 - 20) / 8), A = newSVG(svgWrap, container, Math.round(cw + 70), 'Eight bits with their place values'), W = A.W, svg = A.svg, fs = A.fs;
      var L = (W - cw * 8) / 2;
      bits.forEach(function (b, i) {
        var x = L + i * cw, g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'bit ' + (7 - i) + ' is ' + b, style: 'cursor:pointer' }, svg);
        el('rect', { x: x + 3, y: 40, width: cw - 6, height: cw - 6, rx: 8, fill: b ? EC : c.surface, stroke: b ? EC : c.border, 'stroke-width': 2 }, g);
        txt(g, x + cw / 2, 40 + (cw - 6) / 2 + cw * 0.15, String(b), { size: Math.round(cw * 0.42), weight: 700, fill: b ? '#fff' : c.ink2 });
        txt(svg, x + cw / 2, 34, String(Math.pow(2, 7 - i)), { size: fs(10), fill: c.muted });
        txt(svg, x + cw / 2, 40 + cw + 12, b ? '+' + Math.pow(2, 7 - i) : '', { size: fs(10), fill: EC });
        (function (k) { var f = function () { bits[k] = 1 - bits[k]; draw(); }; g.addEventListener('click', f); keyClick(g, f); })(i);
      });
      txt(svg, 10, 14, 'place values (powers of 2) · tap a bit to flip it', { anchor: 'start', size: fs(10), fill: c.muted });
      var v = val();
      out.innerHTML = 'Binary <strong>' + bits.join('') + '</strong> = decimal <strong>' + v + '</strong> = hexadecimal <strong>' + v.toString(16).toUpperCase().padStart(2, '0') + '</strong>.' + NOTE + 'Each position is worth twice the one to its right, just as each decimal place is worth ten times more. Eight bits make a byte and can represent 2⁸ = 256 values, 0 to 255. Hexadecimal groups bits in fours: 1001 1100 is 9C.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: logic gates and their switch circuits
     ----------------------------------------------------------------------- */
  FIG['fig-el-gates'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var KINDS = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'], ki = 0, a = 1, b = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Gate', KINDS, ki, function (i) { ki = i; draw(); });
    var row = group(controls, 'Inputs');
    var bA = btn('A = 1', row), bB = btn('B = 0', row);
    bA.addEventListener('click', function () { a = 1 - a; draw(); }); bB.addEventListener('click', function () { b = 1 - b; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    var SW = { AND: 'Two switches in series: the lamp lights only if A and B are both closed.', OR: 'Two switches in parallel: the lamp lights if either is closed.', NOT: 'A switch that breaks the circuit when pressed: output is the opposite of the input.', NAND: 'AND followed by NOT: the output is 0 only when both inputs are 1.', NOR: 'OR followed by NOT: the output is 1 only when both inputs are 0.', XOR: 'Exclusive OR: 1 when the inputs differ. It adds two bits, ignoring the carry.' };
    function draw() {
      var k = KINDS[ki], one = k === 'NOT', y = GATES[k](a, b);
      bA.textContent = 'A = ' + a; bB.textContent = 'B = ' + b; bB.style.display = one ? 'none' : '';
      var c = C(), narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560, A = newSVG(svgWrap, container, narrow ? 330 : 190, 'Logic gate symbol and truth table'), W = A.W, svg = A.svg, fs = A.fs;
      var gx = narrow ? W / 2 : W * 0.25, gy = 90, P = drawGate(svg, c, k, gx, gy, 90, y);
      var pinsIn = one ? [P.inN] : [P.inA, P.inB];
      pinsIn.forEach(function (p, i) { var v = i ? b : a; el('line', { x1: p[0] - 50, y1: p[1], x2: p[0], y2: p[1], stroke: v ? EC : c.muted, 'stroke-width': v ? 3 : 1.6 }, svg); txt(svg, p[0] - 58, p[1] + 4, (i ? 'B' : 'A') + '=' + v, { anchor: 'end', size: fs(11), fill: c.ink2 }); });
      el('line', { x1: P.out[0], y1: gy, x2: P.out[0] + 46, y2: gy, stroke: y ? EC : c.muted, 'stroke-width': y ? 3 : 1.6 }, svg);
      el('circle', { cx: P.out[0] + 60, cy: gy, r: 12, fill: y ? '#facc15' : c.surface, stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      txt(svg, P.out[0] + 60, gy + 30, 'Y = ' + y, { size: fs(11), fill: c.ink, weight: 700 });
      var rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]], tx = narrow ? W / 2 - 80 : W * 0.6, ty = narrow ? 170 : 30, rh = 26;
      var heads = one ? ['A', 'Y'] : ['A', 'B', 'Y'];
      heads.forEach(function (h, j) { txt(svg, tx + j * 50 + 25, ty + 14, h, { size: fs(11), fill: c.ink2, weight: 700 }); });
      rows.forEach(function (r, i) {
        var yy = ty + 20 + i * rh, cur = one ? r[0] === a : (r[0] === a && r[1] === b), out2 = one ? GATES[k](r[0]) : GATES[k](r[0], r[1]);
        el('rect', { x: tx, y: yy, width: heads.length * 50, height: rh - 2, rx: 4, fill: cur ? EC + '22' : 'none', stroke: cur ? EC : c.border }, svg);
        r.concat([out2]).forEach(function (v, j) { txt(svg, tx + j * 50 + 25, yy + 17, String(v), { size: fs(11), fill: c.ink }); });
      });
      txt(svg, 10, 14, 'tap the inputs; the highlighted row is the current case', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = '<strong>' + k + '</strong>: output Y = <strong>' + y + '</strong>.' + NOTE + SW[k] + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: testing Boolean identities by truth table
     ----------------------------------------------------------------------- */
  var IDS = [
    ['De Morgan: NOT(A AND B) = (NOT A) OR (NOT B)', function (a, b) { return 1 - (a & b); }, function (a, b) { return (1 - a) | (1 - b); }],
    ['De Morgan: NOT(A OR B) = (NOT A) AND (NOT B)', function (a, b) { return 1 - (a | b); }, function (a, b) { return (1 - a) & (1 - b); }],
    ['Absorption: A OR (A AND B) = A', function (a, b) { return a | (a & b); }, function (a) { return a; }],
    ['Combining: (A AND B) OR (A AND NOT B) = A', function (a, b) { return (a & b) | (a & (1 - b)); }, function (a) { return a; }],
    ['XOR: A XOR B = (A AND NOT B) OR (NOT A AND B)', function (a, b) { return a ^ b; }, function (a, b) { return (a & (1 - b)) | ((1 - a) & b); }],
    ['Tempting but false: NOT(A AND B) = (NOT A) AND (NOT B)', function (a, b) { return 1 - (a & b); }, function (a, b) { return (1 - a) & (1 - b); }]
  ];
  FIG['fig-el-boolean'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ii = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Identity to test', IDS.map(function (q, i) { return String(i + 1); }), ii, function (i) { ii = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var Q = IDS[ii], c = C(), A = newSVG(svgWrap, container, 170, 'Truth table comparing two Boolean expressions'), W = A.W, svg = A.svg, fs = A.fs;
      var cols = ['A', 'B', 'left side', 'right side', 'equal?'], cw = Math.min(110, (W - 20) / 5), L = (W - cw * 5) / 2, T = 36, rh = 26, all = true;
      cols.forEach(function (h, j) { txt(svg, L + j * cw + cw / 2, T - 8, h, { size: fs(10), fill: c.ink2, weight: 700 }); });
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (r, i) {
        var l = Q[1](r[0], r[1]), rr = Q[2](r[0], r[1]), ok = l === rr; if (!ok) all = false;
        var yy = T + i * rh; el('rect', { x: L, y: yy, width: cw * 5, height: rh - 2, rx: 4, fill: ok ? 'none' : RED + '22', stroke: c.border }, svg);
        [r[0], r[1], l, rr].forEach(function (v, j) { txt(svg, L + j * cw + cw / 2, yy + 17, String(v), { size: fs(11), fill: c.ink }); });
        txt(svg, L + 4 * cw + cw / 2, yy + 17, ok ? '✓' : '✗', { size: fs(12), fill: ok ? GREEN : RED, weight: 700 });
      });
      txt(svg, 10, 14, Q[0], { anchor: 'start', size: fs(W < 520 ? 8 : 10), fill: c.muted });
      out.innerHTML = Q[0].replace(/^[^:]+: /, '') + ' — ' + (all ? '<strong style="color:#16a34a">true for every input</strong>: the identity holds.' : '<strong style="color:#dc2626">fails</strong> for the shaded rows: not an identity.') + NOTE + 'With two inputs there are only four cases, so checking a truth table is a complete proof. Identities like these let engineers replace a circuit with a smaller one that behaves identically.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: everything from NAND
     ----------------------------------------------------------------------- */
  FIG['fig-el-nand'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var ti = 0, a = 1, b = 1, TARGETS = ['NOT from 1 NAND', 'AND from 2 NANDs', 'OR from 3 NANDs'];
    var controls = div('fig-controls', container);
    choice(controls, 'Build', TARGETS, ti, function (i) { ti = i; draw(); });
    var row = group(controls, 'Inputs');
    var bA = btn('A = 1', row), bB = btn('B = 1', row);
    bA.addEventListener('click', function () { a = 1 - a; draw(); }); bB.addEventListener('click', function () { b = 1 - b; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function nand(x, y) { return (x & y) ? 0 : 1; }
    function draw() {
      bA.textContent = 'A = ' + a; bB.textContent = 'B = ' + b; bB.style.display = ti === 0 ? 'none' : '';
      var c = C(), A = newSVG(svgWrap, container, 190, 'Gates built from NAND gates'), W = A.W, svg = A.svg, fs = A.fs, y, sx = Math.max(60, W / 2 - 160);
      function inLabel(p, name, v) { el('line', { x1: sx - 30, y1: p[1], x2: p[0], y2: p[1], stroke: v ? EC : c.muted, 'stroke-width': v ? 2.6 : 1.6 }, svg); txt(svg, sx - 36, p[1] + 4, name + '=' + v, { anchor: 'end', size: fs(10), fill: c.ink2 }); }
      if (ti === 0) { y = nand(a, a); var G = drawGate(svg, c, 'NAND', sx + 100, 95, 80, y); inLabel(G.inA, 'A', a); el('line', { x1: sx + 20, y1: G.inA[1], x2: sx + 20, y2: G.inB[1], stroke: a ? EC : c.muted, 'stroke-width': 2 }, svg); el('line', { x1: sx + 20, y1: G.inB[1], x2: G.inB[0], y2: G.inB[1], stroke: a ? EC : c.muted, 'stroke-width': 2 }, svg); el('line', { x1: G.out[0], y1: 95, x2: G.out[0] + 40, y2: 95, stroke: y ? EC : c.muted, 'stroke-width': 2.6 }, svg); txt(svg, G.out[0] + 46, 99, 'Y=' + y, { anchor: 'start', size: fs(11), fill: c.ink, weight: 700 }); }
      else if (ti === 1) { var m = nand(a, b); y = nand(m, m); var G1 = drawGate(svg, c, 'NAND', sx + 80, 95, 80, m), G2 = drawGate(svg, c, 'NAND', sx + 240, 95, 80, y); inLabel(G1.inA, 'A', a); inLabel(G1.inB, 'B', b); wire(svg, c, G1.out, G2.inA, m); wire(svg, c, G1.out, G2.inB, m); el('line', { x1: G2.out[0], y1: 95, x2: G2.out[0] + 36, y2: 95, stroke: y ? EC : c.muted, 'stroke-width': 2.6 }, svg); txt(svg, G2.out[0] + 42, 99, 'Y=' + y, { anchor: 'start', size: fs(11), fill: c.ink, weight: 700 }); txt(svg, (G1.out[0] + G2.inA[0]) / 2, 70, String(m), { size: fs(10), fill: c.muted }); }
      else { var na = nand(a, a), nb = nand(b, b); y = nand(na, nb); var H1 = drawGate(svg, c, 'NAND', sx + 80, 55, 70, na), H2 = drawGate(svg, c, 'NAND', sx + 80, 140, 70, nb), H3 = drawGate(svg, c, 'NAND', sx + 240, 97, 80, y); inLabel(H1.inA, 'A', a); el('line', { x1: sx + 20, y1: H1.inA[1], x2: sx + 20, y2: H1.inB[1], stroke: a ? EC : c.muted, 'stroke-width': 2 }, svg); el('line', { x1: sx + 20, y1: H1.inB[1], x2: H1.inB[0], y2: H1.inB[1], stroke: a ? EC : c.muted, 'stroke-width': 2 }, svg); inLabel(H2.inA, 'B', b); el('line', { x1: sx + 20, y1: H2.inA[1], x2: sx + 20, y2: H2.inB[1], stroke: b ? EC : c.muted, 'stroke-width': 2 }, svg); el('line', { x1: sx + 20, y1: H2.inB[1], x2: H2.inB[0], y2: H2.inB[1], stroke: b ? EC : c.muted, 'stroke-width': 2 }, svg); wire(svg, c, H1.out, H3.inA, na); wire(svg, c, H2.out, H3.inB, nb); el('line', { x1: H3.out[0], y1: 97, x2: H3.out[0] + 36, y2: 97, stroke: y ? EC : c.muted, 'stroke-width': 2.6 }, svg); txt(svg, H3.out[0] + 42, 101, 'Y=' + y, { anchor: 'start', size: fs(11), fill: c.ink, weight: 700 }); }
      var expect = ti === 0 ? 1 - a : ti === 1 ? a & b : a | b;
      txt(svg, 10, 14, 'every gate below is a NAND gate', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = TARGETS[ti] + ': output <strong>' + y + '</strong>, which matches ' + ['NOT A', 'A AND B', 'A OR B'][ti] + ' = ' + expect + ' ' + (y === expect ? '✓' : '✗') + '.' + NOTE + ['Joining both inputs of a NAND gives NAND(A, A) = NOT A.', 'A NAND followed by a NOT (made from a NAND) undoes the inversion, leaving AND.', 'By De Morgan’s law, A OR B = NOT(NOT A AND NOT B) = NAND(NOT A, NOT B).'][ti] + ' Since NOT, AND and OR can describe any logic function, NAND alone can build any digital circuit.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What is binary 1011 in decimal?', options: ['10', '11', '13', '1011'], answer: 1, explanation: '8 + 0 + 2 + 1 = 11.' },
      { question: 'How many different values can 8 bits represent?', options: ['8', '64', '256', '255'], answer: 2, explanation: '2⁸ = 256 (0 to 255).' },
      { question: 'An AND gate outputs 1 when…', options: ['Any input is 1', 'All inputs are 1', 'The inputs differ', 'All inputs are 0'], answer: 1, explanation: 'Like switches in series.' },
      { question: 'Which gate outputs 1 only when its two inputs differ?', options: ['OR', 'NAND', 'XOR', 'NOR'], answer: 2, explanation: 'Exclusive OR.' },
      { question: 'By De Morgan’s law, NOT(A AND B) equals…', options: ['NOT A AND NOT B', 'NOT A OR NOT B', 'A OR B', 'A AND B'], answer: 1, explanation: 'Negating an AND turns it into an OR of the negations.' },
      { question: 'Simplify (A AND B) OR (A AND NOT B).', options: ['B', 'A', 'A AND B', '1'], answer: 1, explanation: 'A AND (B OR NOT B) = A AND 1 = A.' },
      { question: 'Why is NAND called a universal gate?', options: ['It is the fastest', 'Any logic function can be built from NAND gates alone', 'It uses no power', 'It has three inputs'], answer: 1, explanation: 'Sheffer, 1913; Figure 6 builds NOT, AND and OR.' },
      { question: 'Who showed that Boolean algebra describes switching circuits?', options: ['George Boole', 'Claude Shannon', 'Alan Turing', 'John von Neumann'], answer: 1, explanation: 'In his 1938 paper based on his master’s thesis.' },
      { question: 'Why do computers use two states rather than ten?', options: ['Tradition', 'Two widely separated levels are easy to distinguish reliably despite noise', 'Ten is impossible', 'Binary uses less memory'], answer: 1, explanation: 'Noise margins make binary robust.' },
      { question: 'Hexadecimal 9C equals which binary number?', options: ['10011100', '11001001', '10101100', '00011100'], answer: 0, explanation: '9 = 1001, C = 1100.' }
    ]);
  };
})();
