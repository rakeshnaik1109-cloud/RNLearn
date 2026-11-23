/* ==========================================================================
   RNLearn — The Bipolar Transistor (From Switch to Supercomputer, Part 7)
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
    { name: 'Invention', color: '#b45309' },
    { name: 'From lab to product', color: '#1d4ed8' },
    { name: 'Bipolar logic and beyond', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1947', icon: '🔺', era: 0, sec: 3, title: 'The point-contact transistor', text: 'On 16 December, John Bardeen and Walter Brattain at Bell Labs amplify a signal with two gold contacts pressed onto germanium.' },
    { year: '1948', icon: '🥪', era: 0, sec: 3, title: 'The junction transistor', text: 'William Shockley conceives a sandwich of n, p and n layers, the bipolar junction transistor; Bell Labs announces the transistor in June.' },
    { year: '1951', icon: '🔬', era: 0, sec: 4, title: 'Junction transistors work', text: 'Shockley, Morgan Sparks and Gordon Teal report working grown-junction transistors.' },
    { year: '1954', icon: '📻', era: 1, sec: 6, title: 'Silicon transistors and pocket radios', text: 'Gordon Teal at Texas Instruments announces silicon transistors; the Regency TR-1, the first commercial transistor radio, goes on sale.' },
    { year: '1956', icon: '🏅', era: 1, sec: 3, title: 'Nobel Prize', text: 'Shockley, Bardeen and Brattain share the Nobel Prize in Physics for the transistor.' },
    { year: '1957', icon: '🌈', era: 2, sec: 8, title: 'Heterojunction transistor', text: 'Herbert Kroemer proposes a wide-gap emitter, the idea behind today’s fastest transistors (Nobel Prize 2000).' },
    { year: '1961', icon: '🔲', era: 2, sec: 7, title: 'Bipolar logic chips', text: 'Fairchild’s Micrologic family brings resistor-transistor logic gates onto integrated circuits.' },
    { year: '1964', icon: '7️⃣', era: 2, sec: 7, title: 'TTL takes over', text: 'Transistor-transistor logic (TTL) families such as Texas Instruments’ 7400 series become the standard building blocks of digital systems for two decades.' }
  ];

  FIG['fig-el7-timeline'] = function (figEl) {
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

  var EL_PART = 7;
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

  var VT = 0.02585;

  /* -----------------------------------------------------------------------
     Figure: inside an npn transistor
     ----------------------------------------------------------------------- */
  FIG['fig-el-bjt'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var vbe = 0.65, wb = 0.3, parts = [], rnd = rngSeed(11), svg, W, geo, last = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bj-v', label: 'Base–emitter voltage V_BE (V)', min: 0.5, max: 0.75, step: 0.005, value: vbe, onChange: function (x) { vbe = x; info(); } });
    FIG.slider(controls, { id: 'bj-w', label: 'Base width (µm)', min: 0.1, max: 1.5, step: 0.05, value: wb, onChange: function (x) { wb = x; setup(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function beta() { return 1 / (wb * wb / (2 * 25) + 0.004 * wb / 0.2); }
    function Ic() { return 1e-15 * (0.3 / wb) * Math.exp(vbe / VT); }
    function setup() {
      var c = C(), A = newSVG(svgWrap, container, 230, 'Electrons crossing an npn transistor from emitter through base to collector'); W = A.W; svg = A.svg; var fs = A.fs;
      var L = 14, R = W - 14, bw = Math.max(16, (R - L) * 0.06 * wb / 0.3), ex = L + (R - L) * 0.3, cx = ex + bw;
      geo = { L: L, R: R, ex: ex, cx: cx, top: 40, bot: 170 };
      el('rect', { x: L, y: 40, width: ex - L, height: 130, fill: BLUE + '22', stroke: BLUE }, svg); el('rect', { x: ex, y: 40, width: bw, height: 130, fill: RED + '22', stroke: RED }, svg); el('rect', { x: cx, y: 40, width: R - cx, height: 130, fill: BLUE + '14', stroke: BLUE }, svg);
      txt(svg, (L + ex) / 2, 34, 'emitter (n⁺)', { size: fs(10), fill: c.ink, weight: 700 }); txt(svg, ex + bw / 2, 186, 'base (p)', { size: fs(10), fill: RED, weight: 700 }); txt(svg, (cx + R) / 2, 34, 'collector (n)', { size: fs(10), fill: c.ink, weight: 700 });
      txt(svg, (L + ex) / 2, 204, 'E', { size: fs(11), fill: c.ink2 }); txt(svg, ex + bw / 2, 204, 'B', { size: fs(11), fill: c.ink2 }); txt(svg, (cx + R) / 2, 204, 'C', { size: fs(11), fill: c.ink2 });
      legend(svg, c, fs, W, 'blue dots: electrons injected by the emitter · red: the few lost in the base (base current)', 'electrons: most cross, a few are lost');
      parts.forEach(function (p) { if (p.node && p.node.parentNode) p.node.parentNode.removeChild(p.node); }); parts = [];
      info();
    }
    function info() {
      var b = beta(), ic = Ic();
      out.innerHTML = 'Collector current I<sub>C</sub> = <strong>' + (ic < 1e-3 ? fmt(ic * 1e6, 1) + ' µA' : fmt(ic * 1e3, 2) + ' mA') + '</strong>; base current I<sub>B</sub> = I<sub>C</sub>/β = ' + (ic / b < 1e-3 ? fmt(ic / b * 1e6, 2) + ' µA' : fmt(ic / b * 1e3, 3) + ' mA') + '; current gain <strong>β ≈ ' + fmt(b, 0) + '</strong>.' + NOTE + 'Forward-biasing the base–emitter junction lowers its barrier, so the heavily doped emitter injects electrons into the thin p-type base, I<sub>C</sub> ∝ e<sup>V<sub>BE</sub>/kT</sup>. Because the base is thin, almost all of them diffuse across before recombining and are swept into the collector by the reverse-biased collector junction. A small base current, which replaces the holes lost to recombination and back-injection into the emitter, controls a current β times larger. Thinner bases give higher gain and higher speed.</span>';
    }
    setup();
    window.addEventListener('resize', setup);
    onTheme(setup);
    FIG.animate(figEl, function (now) {
      if (!geo) return;
      var rate = Math.max(0, Math.min(1, (Math.log10(Ic()) + 8) / 6)), b = beta();
      if (now - last > 30) { last = now; if (rnd() < rate * 1.4 && parts.length < 120) { var node = el('circle', { r: 3, fill: BLUE }, svg); parts.push({ x: geo.L + 4, y: geo.top + 8 + rnd() * 114, lost: rnd() < 1 / b * 6, node: node, vx: 2 + rnd() * 2 }); } }
      parts = parts.filter(function (p) {
        p.x += p.vx; p.y += (rnd() - 0.5) * 2.4; p.y = Math.max(geo.top + 4, Math.min(geo.bot - 4, p.y));
        if (p.lost && p.x > (geo.ex + geo.cx) / 2) { p.node.setAttribute('fill', RED); p.vx *= 0.8; if (p.vx < 0.2) { p.node.parentNode && p.node.parentNode.removeChild(p.node); return false; } }
        if (p.x > geo.R - 4) { p.node.parentNode && p.node.parentNode.removeChild(p.node); return false; }
        p.node.setAttribute('cx', p.x.toFixed(1)); p.node.setAttribute('cy', p.y.toFixed(1)); return true;
      });
    });
  };

  /* -----------------------------------------------------------------------
     Figure: output characteristics and load line
     ----------------------------------------------------------------------- */
  FIG['fig-el-bjtcurves'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var b = 100, VA = 50, ib = 30, Rc = 2;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'bc-b', label: 'Current gain β', min: 50, max: 300, step: 10, value: b, onChange: function (x) { b = x; draw(); } });
    FIG.slider(controls, { id: 'bc-a', label: 'Early voltage V_A (V)', min: 10, max: 200, step: 5, value: VA, onChange: function (x) { VA = x; draw(); } });
    FIG.slider(controls, { id: 'bc-i', label: 'Base current I_B (µA)', min: 0, max: 50, step: 1, value: ib, onChange: function (x) { ib = x; draw(); } });
    FIG.slider(controls, { id: 'bc-r', label: 'Load resistor R_C (kΩ), V_CC = 10 V', min: 0.5, max: 10, step: 0.1, value: Rc, onChange: function (x) { Rc = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Ic(vce, iB) { return b * iB * 1e-6 * (1 + vce / VA) * (1 - Math.exp(-vce / 0.08)); }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 300, 'Collector current against collector–emitter voltage for several base currents'), W = A.W, svg = A.svg, fs = A.fs;
      var ymax = Math.max(6, Math.ceil(Ic(10, 50) * 1000 / 2) * 2), P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 254, xl: 0, xh: 10, yl: 0, yh: ymax, xticks: [0, 2, 4, 6, 8, 10], yticks: [0, ymax / 4, ymax / 2, 3 * ymax / 4, ymax], yfmt: function (v) { return fmt(v, 1); }, xlab: 'collector–emitter voltage V_CE (V)', ylab: 'collector current (mA)' });
      [10, 20, 30, 40, 50].forEach(function (i) { plotLine(svg, P, function (v) { return Ic(v, i) * 1000; }, 0, 10, 200, c.border, 1.6); var y = Ic(10, i) * 1000; if (y < ymax) txt(svg, P.X(9.9), P.Y(y) - 4, i + ' µA', { anchor: 'end', size: fs(9), fill: c.muted }); });
      plotLine(svg, P, function (v) { return Ic(v, ib) * 1000; }, 0, 10, 200, EC, 2.6);
      plotLine(svg, P, function (v) { return (10 - v) / Rc; }, 0, 10, 2, AMBER, 2, '6 3');
      var lo = 0, hi = 10; for (var k = 0; k < 60; k++) { var m = (lo + hi) / 2; if (Ic(m, ib) * 1000 > (10 - m) / Rc) hi = m; else lo = m; } var vq = (lo + hi) / 2, iq = (10 - vq) / Rc;
      el('circle', { cx: P.X(vq), cy: P.Y(iq), r: 5, fill: RED }, svg);
      el('rect', { x: P.X(0), y: 30, width: P.X(0.3) - P.X(0), height: 224, fill: PURPLE + '18' }, svg); txt(svg, P.X(0.35), 44, 'saturation', { anchor: 'start', size: fs(9), fill: PURPLE });
      legend(svg, c, fs, W, 'grey: curves for I_B = 10–50 µA · blue: your I_B · dashed: load line · red: operating point', 'blue: your I_B · dashed: load line');
      var region = ib === 0 ? 'cut-off (off)' : vq < 0.3 ? 'saturation (fully on, like a closed switch)' : 'active (amplifying)';
      out.innerHTML = 'Operating point: V<sub>CE</sub> = <strong>' + fmt(vq, 2) + ' V</strong>, I<sub>C</sub> = <strong>' + fmt(iq, 2) + ' mA</strong>; region: <strong>' + region + '</strong>.' + NOTE + 'In the active region the collector current is set by the base current (I<sub>C</sub> ≈ βI<sub>B</sub>) almost regardless of V<sub>CE</sub>: the transistor acts as a current source. The slight upward slope is the Early effect: more collector voltage widens the collector depletion region and thins the base. The load line shows all the (V<sub>CE</sub>, I<sub>C</sub>) pairs the resistor allows; where it crosses the transistor curve is where the circuit sits. Push I<sub>B</sub> high enough and the transistor saturates, with only about 0.2 V across it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: common-emitter amplifier
     ----------------------------------------------------------------------- */
  FIG['fig-el-amp'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Iq = 1, Rc = 5, vin = 5;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'am-i', label: 'Bias collector current (mA)', min: 0.1, max: 2, step: 0.05, value: Iq, onChange: function (x) { Iq = x; draw(); } });
    FIG.slider(controls, { id: 'am-r', label: 'Collector resistor R_C (kΩ)', min: 0.5, max: 10, step: 0.5, value: Rc, onChange: function (x) { Rc = x; draw(); } });
    FIG.slider(controls, { id: 'am-v', label: 'Input amplitude (mV)', min: 0, max: 40, step: 0.5, value: vin, onChange: function (x) { vin = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Input and output waveforms of a common-emitter amplifier'), W = A.W, svg = A.svg, fs = A.fs, Vcc = 10;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 44, T: 30, B: 244, xl: 0, xh: 2, yl: 0, yh: 10, xticks: [0, 0.5, 1, 1.5, 2], yticks: [0, 2, 4, 6, 8, 10], xfmt: function (v) { return fmt(v, 1); }, xlab: 'time (cycles)', ylab: 'output voltage V_C (V)' });
      var vc = function (t) { var v = vin / 1000 * Math.sin(2 * Math.PI * t), ic = Iq * Math.exp(v / VT); return Math.max(0.2, Math.min(Vcc, Vcc - ic * Rc)); };
      var Vq = Math.max(0.2, Vcc - Iq * Rc);
      el('line', { x1: P.X(0), y1: P.Y(Vq), x2: P.X(2), y2: P.Y(Vq), stroke: c.border, 'stroke-dasharray': '3 3' }, svg);
      var Y2 = function (v) { return P.Y(5) - v / 40 * 100; };
      var d = ''; for (var k = 0; k <= 200; k++) { var t = 2 * k / 200; d += (k ? 'L' : 'M') + P.X(t).toFixed(1) + ' ' + Y2(vin * Math.sin(2 * Math.PI * t)).toFixed(1); } el('path', { d: d, fill: 'none', stroke: c.muted, 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }, svg);
      [-40, 0, 40].forEach(function (v) { txt(svg, W - 40, Y2(v) + 4, (v > 0 ? '+' : '') + v, { anchor: 'start', size: fs(9), fill: c.muted }); }); txt(svg, W - 40, 26, 'in (mV)', { anchor: 'start', size: fs(9), fill: c.muted });
      plotLine(svg, P, vc, 0, 2, 300, EC, 2.6);
      var mx = 0, mn = 99; for (k = 0; k <= 400; k++) { var y = vc(2 * k / 400); mx = Math.max(mx, y); mn = Math.min(mn, y); }
      legend(svg, c, fs, W, 'dashed: input signal (right scale) · blue: amplified, inverted output (left scale)', 'dashed: input · blue: output');
      var gm = Iq / 1000 / VT, Av = gm * Rc * 1000, clip = mn <= 0.21 || mx >= Vcc - 0.001;
      out.innerHTML = 'g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub> = ' + fmt(gm * 1000, 1) + ' mS; small-signal gain −g<sub>m</sub>R<sub>C</sub> = <strong>−' + fmt(Av, 0) + '</strong>. Output swings from ' + fmt(mn, 2) + ' to ' + fmt(mx, 2) + ' V' + (vin > 0 ? ' (measured gain ≈ ' + fmt((mx - mn) / (2 * vin / 1000), 0) + ')' : '') + '.' + (clip ? ' <strong style="color:#dc2626">The output is clipping.</strong>' : '') + NOTE + 'A small voltage wiggle on the base changes the collector current exponentially; the collector resistor turns that current change into a large voltage change, inverted. For small inputs the gain is −g<sub>m</sub>R<sub>C</sub> = −I<sub>C</sub>R<sub>C</sub>/V<sub>T</sub>. Larger inputs reveal the exponential: the output is no longer a clean sine (distortion), and eventually it hits the supply or saturation.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: a bipolar inverter and its power cost
     ----------------------------------------------------------------------- */
  FIG['fig-el-rtl'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var Rc = 1, b = 50;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'rt-r', label: 'Collector resistor (kΩ)', min: 0.5, max: 20, step: 0.5, value: Rc, onChange: function (x) { Rc = x; draw(); } });
    FIG.slider(controls, { id: 'rt-b', label: 'Current gain β', min: 20, max: 200, step: 10, value: b, onChange: function (x) { b = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function vout(vin) { var Rb = 10, ibm = Math.max(0, (vin - 0.7) / Rb), ic = Math.min(b * ibm, (5 - 0.2) / Rc); return 5 - ic * Rc; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Transfer curve of a resistor-transistor inverter'), W = A.W, svg = A.svg, fs = A.fs;
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 224, xl: 0, xh: 5, yl: 0, yh: 5.2, xticks: [0, 1, 2, 3, 4, 5], yticks: [0, 1, 2, 3, 4, 5], xlab: 'input voltage (V)', ylab: 'output voltage (V)' });
      plotLine(svg, P, function (v) { return v; }, 0, 5, 2, c.border, 1, '3 3');
      plotLine(svg, P, vout, 0, 5, 300, EC, 2.6);
      legend(svg, c, fs, W, 'output of a one-transistor inverter (V_CC = 5 V, base resistor 10 kΩ) against its input', 'inverter output vs input');
      var Pon = 5 * (4.8 / Rc) / 1000, total = Pon / 2 * 1e9;
      out.innerHTML = 'When the output is low (transistor on), current ' + fmt(4.8 / Rc, 2) + ' mA flows continuously: <strong>' + fmt(Pon * 1000, 1) + ' mW</strong> per gate, even when nothing changes. A billion such gates, half of them on, would draw about <strong>' + (total > 1e6 ? fmt(total / 1e6, 1) + ' MW' : fmt(total / 1e3, 0) + ' kW') + '</strong>.' + NOTE + 'Early integrated logic (RTL, then DTL and TTL) used bipolar transistors as switches. A larger resistor saves power but makes the output rise more slowly (RC delay, Part 4), and a saturated transistor is slow to turn off because charge stored in its base must first be removed. Static power like this is why bipolar logic was abandoned for CMOS (Part 9), which draws almost no current when idle.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el7'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'Who demonstrated the first transistor in December 1947?', options: ['Shockley alone', 'Bardeen and Brattain', 'Kilby and Noyce', 'Edison'], answer: 1, explanation: 'A point-contact device on germanium.' },
      { question: 'In an npn transistor in the active region, the base–emitter junction is…', options: ['Reverse-biased', 'Forward-biased', 'Unbiased', 'Broken down'], answer: 1, explanation: 'And the base–collector junction is reverse-biased.' },
      { question: 'Why must the base be thin?', options: ['To save silicon', 'So most injected electrons cross it before recombining', 'To increase resistance', 'For appearance'], answer: 1, explanation: 'Thinner base: higher β and speed.' },
      { question: 'A transistor with β = 150 and I_B = 10 µA has a collector current of about…', options: ['0.15 mA', '1.5 mA', '15 mA', '150 mA'], answer: 1, explanation: '150 × 10 µA.' },
      { question: 'Collector current depends on V_BE as…', options: ['Linearly', 'Quadratically', 'Exponentially', 'Not at all'], answer: 2, explanation: 'I_C = I_S e^{V_BE/V_T}.' },
      { question: 'The transconductance of a bipolar transistor at I_C = 2.6 mA is about…', options: ['1 mS', '10 mS', '100 mS', '1 S'], answer: 2, explanation: 'g_m = I_C/V_T = 2.6 mA/26 mV.' },
      { question: 'The Early effect is…', options: ['Early failure', 'The slight rise of I_C with V_CE as the base narrows', 'Base current noise', 'Thermal runaway'], answer: 1, explanation: 'Described by James Early in 1952.' },
      { question: 'A transistor used as a closed switch operates in…', options: ['Cut-off', 'The active region', 'Saturation', 'Breakdown'], answer: 2, explanation: 'Only about 0.2 V remains across it.' },
      { question: 'Why did bipolar logic give way to CMOS?', options: ['Bipolar transistors are slower in all cases', 'Bipolar gates draw static current even when idle, so power was unmanageable at high density', 'CMOS was invented first', 'Bipolar transistors cannot amplify'], answer: 1, explanation: 'Power density.' },
      { question: 'Heterojunction bipolar transistors (HBTs) use…', options: ['Two different semiconductors, e.g. a wide-gap emitter, to boost speed and gain', 'Vacuum', 'Magnetic fields', 'Only germanium'], answer: 0, explanation: 'Kroemer’s idea; used in phone power amplifiers.' }
    ]);
  };
})();
