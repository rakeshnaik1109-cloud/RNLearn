/* ==========================================================================
   RNLearn — The p–n Junction (From Switch to Supercomputer, Part 6)
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
    { name: 'Detectors and valves', color: '#b45309' },
    { name: 'Junction physics', color: '#1d4ed8' },
    { name: 'Junctions and light', color: '#0e7490' }
  ];
  var EVENTS = [
    { year: '1904', icon: '💡', era: 0, sec: 1, title: 'The vacuum diode', text: 'John Ambrose Fleming patents the thermionic valve, a vacuum tube that lets current flow one way, to detect radio signals.' },
    { year: '1907', icon: '✨', era: 2, sec: 8, title: 'First light from a junction', text: 'Henry Round at Marconi reports a yellowish glow from a carborundum crystal under voltage, the first observed LED effect.' },
    { year: '1934', icon: '⚡', era: 1, sec: 6, title: 'Zener’s theory', text: 'Clarence Zener explains electrical breakdown by electrons tunnelling across a band gap in a strong field.' },
    { year: '1940', icon: '☀️', era: 1, sec: 3, title: 'The p–n junction', text: 'Russell Ohl discovers a junction in silicon that generates a voltage in light.' },
    { year: '1949', icon: '📈', era: 1, sec: 5, title: 'Junction theory', text: 'William Shockley publishes the theory of the p–n junction, including the diode equation.' },
    { year: '1954', icon: '🔆', era: 2, sec: 8, title: 'Silicon solar cell', text: 'Daryl Chapin, Calvin Fuller and Gerald Pearson at Bell Labs demonstrate a silicon solar cell with about 6% efficiency.' },
    { year: '1958', icon: '🌀', era: 1, sec: 6, title: 'The tunnel diode', text: 'Leo Esaki reports current tunnelling through very heavily doped, very thin junctions, showing negative resistance.' },
    { year: '1962', icon: '🔴', era: 2, sec: 8, title: 'Visible LED', text: 'Nick Holonyak at General Electric makes the first practical visible (red) light-emitting diode from gallium arsenide phosphide.' },
    { year: '1993', icon: '🔵', era: 2, sec: 8, title: 'Bright blue LED', text: 'Shuji Nakamura at Nichia demonstrates bright blue gallium nitride LEDs, enabling white LED lighting (published 1994).' }
  ];

  FIG['fig-el6-timeline'] = function (figEl) {
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

  var EL_PART = 6;
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

  var Q = 1.602e-19, EPS = 11.7 * 8.854e-14, NI = 1e10, VT = 0.02585;

  /* -----------------------------------------------------------------------
     Figure: the p-n junction (bands, charge and field)
     ----------------------------------------------------------------------- */
  FIG['fig-el-junction'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var la = 16, ld = 16, V = 0;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'pn-a', label: 'p-side doping N_A (log₁₀ cm⁻³)', min: 14, max: 18, step: 0.1, value: la, onChange: function (x) { la = x; draw(); } });
    FIG.slider(controls, { id: 'pn-d', label: 'n-side doping N_D (log₁₀ cm⁻³)', min: 14, max: 18, step: 0.1, value: ld, onChange: function (x) { ld = x; draw(); } });
    FIG.slider(controls, { id: 'pn-v', label: 'Applied voltage (V)', min: -5, max: 0.6, step: 0.05, value: V, onChange: function (x) { V = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 380, 'Band diagram, charge and electric field across a p-n junction'), W = A.W, svg = A.svg, fs = A.fs;
      var Na = Math.pow(10, la), Nd = Math.pow(10, ld), Vbi = VT * Math.log(Na * Nd / (NI * NI)), Vj = Math.max(0.05, Vbi - V);
      var Wd = Math.sqrt(2 * EPS * Vj / Q * (1 / Na + 1 / Nd)), xp = Wd * Nd / (Na + Nd), xn = Wd * Na / (Na + Nd), Em = Q * Nd * xn / EPS;
      var Wmax = Math.sqrt(2 * EPS * (Vbi + 5) / Q * (1 / Na + 1 / Nd)), dom = Wmax * 0.8, L = 20, R = W - 20;
      var X = function (x) { return (L + R) / 2 + x / dom * (R - L) / 2; };
      function phi(x) { if (x <= -xp) return 0; if (x <= 0) return Q * Na / (2 * EPS) * Math.pow(x + xp, 2); if (x < xn) return Vj - Q * Nd / (2 * EPS) * Math.pow(xn - x, 2); return Vj; }
      var Ytop = 34, Ybot = 180, Erange = Vj + 1.12 + 0.75, Ey = function (e) { return Ytop + (0.6 - e) / Erange * (Ybot - Ytop); };
      var ec = '', ev = '';
      for (var k = 0; k <= 200; k++) { var x = -dom + 2 * dom * k / 200, e = 0.3 - phi(x); ec += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Ey(e).toFixed(1); ev += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Ey(e - 1.12).toFixed(1); }
      el('path', { d: ec, fill: 'none', stroke: EC, 'stroke-width': 2.4 }, svg); el('path', { d: ev, fill: 'none', stroke: AMBER, 'stroke-width': 2.4 }, svg);
      var efp = 0.3 - 1.12 + (0.56 - VT * Math.log(Na / NI)), efn = 0.3 - Vj - (0.56 - VT * Math.log(Nd / NI));
      el('line', { x1: X(-dom), y1: Ey(efp), x2: X(-xp), y2: Ey(efp), stroke: RED, 'stroke-dasharray': '6 3', 'stroke-width': 1.6 }, svg); el('line', { x1: X(xn), y1: Ey(efn), x2: X(dom), y2: Ey(efn), stroke: RED, 'stroke-dasharray': '6 3', 'stroke-width': 1.6 }, svg);
      txt(svg, X(-dom) + 4, Ey(0.3) - 6, 'E꜀', { anchor: 'start', size: fs(10), fill: EC }); txt(svg, X(-dom) + 4, Ey(efp) - 5, 'E_F', { anchor: 'start', size: fs(9), fill: RED }); txt(svg, X(-dom) + 4, Ey(-0.82) + 14, 'Eᵥ', { anchor: 'start', size: fs(10), fill: AMBER });
      txt(svg, X(-dom * 0.6), Ey(0.3 - 1.12) + 18, 'p-type', { size: fs(11), fill: c.ink, weight: 700 }); txt(svg, X(dom * 0.6), Ey(0.3 - Vj) - 8, 'n-type', { size: fs(11), fill: c.ink, weight: 700 });
      [-xp, xn].forEach(function (x) { el('line', { x1: X(x), y1: Ytop, x2: X(x), y2: 360, stroke: c.border, 'stroke-dasharray': '3 3' }, svg); });
      txt(svg, (X(-xp) + X(xn)) / 2, 196, 'depletion region ' + fmt(Wd * 1e4, 2) + ' µm', { size: fs(9), fill: c.ink2 });
      var y0 = 252, hmax = 34, rho = Math.max(Na, Nd);
      el('line', { x1: L, y1: y0, x2: R, y2: y0, stroke: c.muted }, svg); txt(svg, L, y0 - hmax - 2, 'charge density', { anchor: 'start', size: fs(9), fill: c.muted });
      el('rect', { x: X(-xp), y: y0, width: X(0) - X(-xp), height: Math.max(1, hmax * Na / rho), fill: BLUE + '55', stroke: BLUE }, svg);
      el('rect', { x: X(0), y: y0 - Math.max(1, hmax * Nd / rho), width: X(xn) - X(0), height: Math.max(1, hmax * Nd / rho), fill: RED + '55', stroke: RED }, svg);
      txt(svg, X(xn) + 4, y0 - 6, '+ ionised donors', { anchor: 'start', size: fs(9), fill: RED }); txt(svg, X(-xp) - 4, y0 + 14, 'ionised acceptors −', { anchor: 'end', size: fs(9), fill: BLUE });
      var yf = 300, fh = 50; txt(svg, L, yf - 6, 'electric field', { anchor: 'start', size: fs(9), fill: c.muted }); el('line', { x1: L, y1: yf, x2: R, y2: yf, stroke: c.muted }, svg);
      var Ef0 = Q * Math.max(Na, Nd) * Math.sqrt(2 * EPS * (Vbi + 5) / Q * (1 / Na + 1 / Nd)) * Math.min(Na, Nd) / (Na + Nd) / EPS;
      el('path', { d: 'M' + X(-xp) + ' ' + yf + 'L' + X(0) + ' ' + (yf + fh * Em / Ef0) + 'L' + X(xn) + ' ' + yf + 'Z', fill: PURPLE + '44', stroke: PURPLE }, svg);
      txt(svg, X(0) + 6, yf + fh * Em / Ef0 + 4, '|E|max = ' + fmt(Em / 1000, 0) + ' kV/cm', { anchor: 'start', size: fs(9), fill: PURPLE });
      txt(svg, 10, 14, V > 0.01 ? 'forward bias: barrier lowered, depletion region narrows' : V < -0.01 ? 'reverse bias: barrier raised, depletion region widens' : 'equilibrium: the Fermi level is flat', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Built-in voltage V<sub>bi</sub> = (kT/q) ln(N<sub>A</sub>N<sub>D</sub>/n<sub>i</sub>²) = <strong>' + fmt(Vbi, 2) + ' V</strong>. Barrier now ' + fmt(Vj, 2) + ' V; depletion width <strong>' + fmt(Wd * 1e4, 3) + ' µm</strong> (' + fmt(xp / Wd * 100, 0) + '% of it on the p side); peak field ' + fmt(Em / 1000, 0) + ' kV/cm.' + NOTE + 'Electrons diffuse from the n side into the p side and holes the other way, leaving behind fixed charged dopant ions. Their electric field opposes further diffusion, and in equilibrium the bands bend until the Fermi level is flat. The depletion region extends further into the more lightly doped side, because the two sides must hold equal and opposite charge. Applying a voltage V changes the barrier to V<sub>bi</sub> − V.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: diode current-voltage characteristic
     ----------------------------------------------------------------------- */
  FIG['fig-el-diodeiv'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lis = -14, T = 300, nId = 1, Vbr = 6, logv = false;
    var controls = div('fig-controls', container);
    choice(controls, 'Scale', ['Linear', 'Logarithmic (forward)'], 0, function (i) { logv = !!i; draw(); });
    FIG.slider(controls, { id: 'iv-is', label: 'Saturation current at 300 K (log₁₀ A)', min: -16, max: -9, step: 0.5, value: lis, onChange: function (x) { lis = x; draw(); } });
    FIG.slider(controls, { id: 'iv-t', label: 'Temperature (K)', min: 250, max: 400, step: 5, value: T, onChange: function (x) { T = x; draw(); } });
    FIG.slider(controls, { id: 'iv-n', label: 'Ideality factor n', min: 1, max: 2, step: 0.05, value: nId, onChange: function (x) { nId = x; draw(); } });
    FIG.slider(controls, { id: 'iv-b', label: 'Breakdown voltage (V)', min: 2, max: 10, step: 0.1, value: Vbr, onChange: function (x) { Vbr = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function Is() { return Math.pow(10, lis) * Math.pow(T / 300, 3) * Math.exp(-(1.12 / 8.617e-5) * (1 / T - 1 / 300)); }
    function I(v) { var vt = 8.617e-5 * T, i = Is() * (Math.exp(v / (nId * vt)) - 1); if (v < -Vbr + 0.6) i -= 1e-3 * Math.exp((-v - Vbr) / 0.08); return i; }
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 290, 'Diode current against voltage'), W = A.W, svg = A.svg, fs = A.fs, vt = 8.617e-5 * T, P;
      if (!logv) {
        P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: -11, xh: 1, yl: -20, yh: 50, xticks: [-10, -8, -6, -4, -2, 0, 1], yticks: [-20, 0, 20, 40], xlab: 'voltage (V)', ylab: 'current (mA)' });
        el('line', { x1: P.X(0), y1: 30, x2: P.X(0), y2: 244, stroke: c.border }, svg); el('line', { x1: P.X(-11), y1: P.Y(0), x2: P.X(1), y2: P.Y(0), stroke: c.border }, svg);
        plotLine(svg, P, function (v) { return I(v) * 1000; }, -11, 1, 600, EC, 2.6);
        txt(svg, P.X(-Vbr) - 4, P.Y(-14), 'breakdown', { anchor: 'end', size: fs(9), fill: RED });
        txt(svg, P.X(-3), P.Y(4), 'reverse: tiny leakage', { size: fs(9), fill: c.muted }); txt(svg, P.X(0.5) - 6, P.Y(44), 'forward', { anchor: 'end', size: fs(9), fill: c.muted });
      } else {
        P = plotAxes(svg, c, fs, { L: 54, R: W - 14, T: 30, B: 244, xl: 0, xh: 1, yl: 1e-14, yh: 1, logy: true, xticks: [0, 0.2, 0.4, 0.6, 0.8, 1], yticks: [1e-14, 1e-11, 1e-8, 1e-5, 1e-2], xfmt: function (v) { return fmt(v, 1); }, xlab: 'forward voltage (V)', ylab: 'current (A)' });
        plotLine(svg, P, function (v) { return Math.max(1e-20, I(v)); }, 0.001, 1, 300, EC, 2.6);
        txt(svg, P.X(0.15), P.Y(1e-3), 'slope: one decade per ' + fmt(nId * vt * Math.LN10 * 1000, 0) + ' mV', { anchor: 'start', size: fs(10), fill: c.ink2 });
      }
      var v1 = nId * vt * Math.log(1e-3 / Is() + 1);
      legend(svg, c, fs, W, 'I = I_s (e^(V/nkT) − 1): exponential forward current, tiny reverse current until breakdown', 'I = I_s(e^(V/nkT) − 1)');
      out.innerHTML = 'Saturation current at ' + T + ' K: <strong>' + sciHTML(Is(), 1) + ' A</strong>. Voltage needed for 1 mA: <strong>' + fmt(v1, 3) + ' V</strong>. Each tenfold increase in current needs only ' + fmt(nId * vt * Math.LN10 * 1000, 0) + ' mV more.' + NOTE + 'Forward bias lowers the barrier, and the number of carriers able to cross it rises as e<sup>qV/kT</sup>, giving Shockley’s diode equation. In reverse, only the trickle of minority carriers flows, until the field is strong enough to cause breakdown. Heating the diode raises I<sub>s</sub> steeply (it follows n<sub>i</sub>²), so the voltage for a fixed current falls by about 2 mV per kelvin, a property used in electronic thermometers.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: rectifier and smoothing capacitor
     ----------------------------------------------------------------------- */
  FIG['fig-el-rectifier'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var full = false, Cu = 100, Rl = 1000;
    var controls = div('fig-controls', container);
    choice(controls, 'Circuit', ['Half-wave (1 diode)', 'Full-wave bridge (4 diodes)'], 0, function (i) { full = !!i; draw(); });
    FIG.slider(controls, { id: 'rf-c', label: 'Smoothing capacitor (µF)', min: 0, max: 1000, step: 10, value: Cu, onChange: function (x) { Cu = x; draw(); } });
    FIG.slider(controls, { id: 'rf-r', label: 'Load resistance (Ω)', min: 100, max: 5000, step: 100, value: Rl, onChange: function (x) { Rl = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 270, 'Mains input and rectified output'), W = A.W, svg = A.svg, fs = A.fs, f = 50, Vp = 12, tmax = 0.06;
      var P = plotAxes(svg, c, fs, { L: 50, R: W - 14, T: 30, B: 224, xl: 0, xh: tmax * 1000, yl: -13, yh: 13, xticks: [0, 20, 40, 60], yticks: [-12, -6, 0, 6, 12], xlab: 'time (ms)', ylab: 'voltage (V)' });
      plotLine(svg, P, function (t) { return Vp * Math.sin(2 * Math.PI * f * t / 1000); }, 0, tmax * 1000, 300, c.muted, 1.4, '5 3');
      var drop = full ? 1.4 : 0.7, tau = Rl * Cu * 1e-6, vo = 0, d = '', N = 1200, dt = tmax / N, vmin = 99, vmax = 0;
      for (var k = 0; k <= N; k++) { var t = k * dt, vs = Vp * Math.sin(2 * Math.PI * f * t), vr = Math.max(0, (full ? Math.abs(vs) : vs) - drop); if (Cu === 0) vo = vr; else { vo = Math.max(vr, vo * Math.exp(-dt / tau)); } d += (k ? 'L' : 'M') + P.X(t * 1000).toFixed(1) + ' ' + P.Y(vo).toFixed(1); if (t > 0.02) { vmin = Math.min(vmin, vo); vmax = Math.max(vmax, vo); } }
      el('path', { d: d, fill: 'none', stroke: EC, 'stroke-width': 2.6 }, svg);
      legend(svg, c, fs, W, 'dashed: 12 V-peak, 50 Hz input · blue: output across the load', 'dashed: input · blue: output');
      var rip = vmax - vmin, Iav = (vmax + vmin) / 2 / Rl;
      out.innerHTML = 'Output between ' + fmt(vmin, 2) + ' V and ' + fmt(vmax, 2) + ' V: ripple <strong>' + fmt(rip, 2) + ' V</strong>' + (Cu ? ' (estimate I/(f<sub>ripple</sub>C) = ' + fmt(Iav / ((full ? 100 : 50) * Cu * 1e-6), 2) + ' V)' : '') + '.' + NOTE + 'Diodes pass only one direction of current. A single diode keeps the positive half-cycles; a bridge of four flips the negative halves over too, doubling the ripple frequency to 100 Hz. The capacitor charges at each peak and discharges through the load between peaks, so a larger capacitor or a lighter load gives smoother DC. Every mains adapter starts with a stage like this (modern ones then switch at high frequency to shrink the transformer).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure: the solar cell
     ----------------------------------------------------------------------- */
  FIG['fig-el-solar'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var sun = 1, lj0 = -12;
    var controls = div('fig-controls', container);
    FIG.slider(controls, { id: 'sc-s', label: 'Sunlight (fraction of full sun)', min: 0, max: 1, step: 0.05, value: sun, onChange: function (x) { sun = x; draw(); } });
    FIG.slider(controls, { id: 'sc-j', label: 'Dark saturation current (log₁₀ A/cm²)', min: -14, max: -9, step: 0.5, value: lj0, onChange: function (x) { lj0 = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), A = newSVG(svgWrap, container, 280, 'Solar cell current and power against voltage'), W = A.W, svg = A.svg, fs = A.fs;
      var JL = 40 * sun, J0 = Math.pow(10, lj0) * 1000, J = function (v) { return JL - J0 * (Math.exp(v / VT) - 1); };
      var P = plotAxes(svg, c, fs, { L: 54, R: W - 50, T: 30, B: 234, xl: 0, xh: 0.8, yl: 0, yh: 45, xticks: [0, 0.2, 0.4, 0.6, 0.8], yticks: [0, 10, 20, 30, 40], xfmt: function (v) { return fmt(v, 1); }, xlab: 'voltage (V)', ylab: 'current (mA/cm²)' });
      plotLine(svg, P, function (v) { var j = J(v); return j >= 0 ? j : NaN; }, 0, 0.8, 400, EC, 2.6);
      var Pp = function (v) { return Math.max(0, J(v) * v); }, best = 0, vb = 0;
      for (var k = 0; k <= 800; k++) { var v = k * 0.001; if (Pp(v) > best) { best = Pp(v); vb = v; } }
      var Pmax = 25, Y2 = function (p) { return 234 - p / Pmax * 204; }, d = '';
      for (k = 0; k <= 400; k++) { v = 0.8 * k / 400; if (J(v) < 0) break; d += (k ? 'L' : 'M') + P.X(v).toFixed(1) + ' ' + Y2(Pp(v)).toFixed(1); }
      el('path', { d: d, fill: 'none', stroke: AMBER, 'stroke-width': 2.2, 'stroke-dasharray': '5 3' }, svg);
      [0, 5, 10, 15, 20, 25].forEach(function (p) { txt(svg, W - 44, Y2(p) + 4, String(p), { anchor: 'start', size: fs(9), fill: AMBER }); });
      var r2 = txt(svg, W - 10, 132, 'power (mW/cm²)', { size: fs(9), fill: AMBER }); r2.setAttribute('transform', 'rotate(90 ' + (W - 10) + ' 132)');
      var Voc = sun > 0 ? VT * Math.log(JL / J0 + 1) : 0;
      if (best > 0) { el('rect', { x: P.X(0), y: P.Y(J(vb)), width: P.X(vb) - P.X(0), height: P.Y(0) - P.Y(J(vb)), fill: EC + '18', stroke: EC, 'stroke-dasharray': '3 3' }, svg); el('circle', { cx: P.X(vb), cy: P.Y(J(vb)), r: 5, fill: RED }, svg); txt(svg, P.X(vb) + 8, P.Y(J(vb)) - 6, 'maximum power', { anchor: 'start', size: fs(9), fill: RED }); }
      legend(svg, c, fs, W, 'blue: current the cell delivers · dashed: power = current × voltage', 'blue: current · dashed: power');
      var FF = best > 0 ? best / (JL * Voc) : 0, eff = sun > 0 ? best / (100 * sun) : 0;
      out.innerHTML = (sun > 0 ? 'Short-circuit current ' + fmt(JL, 1) + ' mA/cm²; open-circuit voltage <strong>' + fmt(Voc, 3) + ' V</strong>; maximum power <strong>' + fmt(best, 1) + ' mW/cm²</strong> at ' + fmt(vb, 2) + ' V; fill factor ' + fmt(FF * 100, 0) + '%; efficiency <strong>' + fmt(eff * 100, 1) + '%</strong>.' : 'In the dark the cell is just a diode and produces no power.') + NOTE + 'Light creates electron–hole pairs; the junction’s field sweeps electrons to the n side and holes to the p side, driving a current I<sub>L</sub> through an external load. The cell’s own diode current flows the other way, so I = I<sub>L</sub> − I<sub>0</sub>(e<sup>qV/kT</sup> − 1). Better material quality (lower I<sub>0</sub>) raises the voltage; full sunlight delivers about 100 mW/cm².</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  FIG['fig-quiz-el6'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What forms the depletion region of a p–n junction?', options: ['A layer of oxide', 'Carriers diffusing across and recombining, leaving fixed charged dopant ions', 'Metal contacts', 'Light'], answer: 1, explanation: 'Their field opposes further diffusion.' },
      { question: 'For N_A = N_D = 10¹⁶ cm⁻³ in silicon at 300 K, the built-in voltage is about…', options: ['0.026 V', '0.36 V', '0.72 V', '1.12 V'], answer: 2, explanation: '0.0259 × ln(10³²/10²⁰) ≈ 0.72 V.' },
      { question: 'If one side of a junction is doped 100 times more heavily, the depletion region lies mostly…', options: ['In the heavily doped side', 'In the lightly doped side', 'Equally on both sides', 'Outside the junction'], answer: 1, explanation: 'Equal charge needs a wider region of lower density.' },
      { question: 'Reverse bias makes the depletion region…', options: ['Narrower', 'Wider', 'Disappear', 'Unchanged'], answer: 1, explanation: 'W ∝ √(V_bi − V).' },
      { question: 'In an ideal diode at room temperature, increasing the forward current tenfold requires an extra…', options: ['0.6 V', '60 mV', '6 mV', '26 mV'], answer: 1, explanation: '2.3 kT/q ≈ 60 mV.' },
      { question: 'Zener breakdown in heavily doped junctions is caused by…', options: ['Melting', 'Electrons tunnelling directly across the narrow junction in a strong field', 'Photons', 'Oxidation'], answer: 1, explanation: 'Avalanche multiplication dominates in lightly doped junctions.' },
      { question: 'A full-wave rectifier on 50 Hz mains gives ripple at…', options: ['25 Hz', '50 Hz', '100 Hz', '200 Hz'], answer: 2, explanation: 'Both half-cycles are used.' },
      { question: 'The colour of an LED is set mainly by…', options: ['The plastic case', 'The band gap of the semiconductor', 'The current', 'The voltage of the battery'], answer: 1, explanation: 'Photon energy ≈ E_g.' },
      { question: 'Why was the blue LED so important?', options: ['Blue is the most efficient colour', 'With red and green, or with phosphors, it makes efficient white light', 'It is cheaper', 'It works without electricity'], answer: 1, explanation: 'Nobel Prize in Physics 2014.' },
      { question: 'A solar cell operates in which quadrant of the diode I–V curve?', options: ['Forward voltage, forward current (consuming power)', 'Forward voltage, reverse (generated) current: delivering power', 'Reverse voltage, reverse current', 'Breakdown'], answer: 1, explanation: 'It acts as a source.' }
    ]);
  };
})();
