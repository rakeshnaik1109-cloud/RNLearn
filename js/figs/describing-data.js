/* ==========================================================================
   RNLearn — Describing Data (Making Sense of Data, Part 1)
   Figures:
     1. fig-data-timeline     The story at a glance (clickable timeline)
     2. fig-data-types        What kind of data is it?
     3. fig-histogram-bins    The same data, different bins
     4. fig-mean-median       Mean, median and mode
     5. fig-which-average     Which average?
     6. fig-bessel            Why divide by n - 1?
     7. fig-box-plot          Spread and the box plot
     8. fig-anscombe          Anscombe's quartet
     9. fig-quiz-d1           Test yourself
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
    { name: 'Counting and averaging', color: '#b45309' },
    { name: 'Naming the measures', color: '#1d4ed8' },
    { name: 'Looking at data', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1662', icon: '📜', era: 0, sec: 1, title: 'Graunt’s tables', text: 'John Graunt summarises London’s weekly records of deaths in tables: one of the first uses of data to describe a population.' },
    { year: '1755', icon: '🔭', era: 0, sec: 5, title: 'Why take the mean?', text: 'Thomas Simpson argues mathematically that the mean of several observations is more reliable than a single careful one.' },
    { year: '1809', icon: '🔔', era: 0, sec: 5, title: 'Gauss and errors', text: 'Carl Friedrich Gauss links the arithmetic mean to the bell-shaped distribution of measurement errors.' },
    { year: '1835', icon: '🧍', era: 0, sec: 18, title: 'The average man', text: 'Adolphe Quetelet describes “l’homme moyen”, the average man, applying averages to human characteristics.' },
    { year: '1858', icon: '🌹', era: 2, sec: 4, title: 'Nightingale’s diagrams', text: 'Florence Nightingale uses her “rose” diagrams to show that most soldiers’ deaths came from preventable disease.' },
    { year: '1875', icon: '📏', era: 1, sec: 11, title: 'Medians and percentiles', text: 'Francis Galton popularises ranking data and describing it by its median and percentiles.' },
    { year: '1894', icon: '📐', era: 1, sec: 10, title: '“Standard deviation”', text: 'Karl Pearson introduces the term standard deviation for the typical spread of data around the mean.' },
    { year: '1918', icon: '🧮', era: 1, sec: 10, title: '“Variance”', text: 'Ronald Fisher names the square of the standard deviation the variance.' },
    { year: '1946', icon: '🏷️', era: 1, sec: 3, title: 'Levels of measurement', text: 'Stanley Smith Stevens classifies data as nominal, ordinal, interval and ratio.' },
    { year: '1973', icon: '📊', era: 2, sec: 12, title: 'Anscombe’s quartet', text: 'Francis Anscombe shows four data sets with identical statistics that look completely different when plotted.' },
    { year: '1977', icon: '📦', era: 2, sec: 11, title: 'The box plot', text: 'John Tukey’s <em>Exploratory Data Analysis</em> popularises box plots and the habit of looking at data before modelling it.' },
    { year: '2017', icon: '🦖', era: 2, sec: 12, title: 'The Datasaurus', text: 'Justin Matejka and George Fitzmaurice create a dinosaur-shaped data set and others with exactly the same summary statistics.' }
  ];
  FIG['fig-data-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1662 to 2017');
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
  var BLUE = '#2563eb', RED = '#dc2626', GREEN = '#16a34a', AMBER = '#d97706';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) { var b = btn(it, row); bs.push(b); b.addEventListener('click', function () { set(i); onPick(i); }); });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    set(initial);
    return row;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gaussR(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function mean(a) { return sum(a) / a.length; }
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function quantile(a, q) { var s = sorted(a), pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo); }
  function median(a) { return quantile(a, 0.5); }
  function sdv(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function mad(a) { var m = median(a); return median(a.map(function (x) { return Math.abs(x - m); })); }
  function modes(a, dp) {
    var c = {}, best = 0, out = [];
    a.forEach(function (x) { var k = x.toFixed(dp || 1); c[k] = (c[k] || 0) + 1; if (c[k] > best) best = c[k]; });
    for (var k in c) if (c[k] === best) out.push(+k);
    return { values: out.sort(function (x, y) { return x - y; }), count: best };
  }
  function skew(a) { var n = a.length, m = mean(a), s = sdv(a), t = 0; a.forEach(function (x) { t += Math.pow((x - m) / s, 3); }); return n / ((n - 1) * (n - 2)) * t; }

  /* -----------------------------------------------------------------------
     Figure 2. What kind of data is it?
     ----------------------------------------------------------------------- */
  var VARS = [
    { n: 'Blood group', t: 'Nominal', ex: 'A, B, AB, O', ok: 'Counts, proportions and the mode.', no: 'There is no order, so no median, and certainly no mean.' },
    { n: 'PIN code', t: 'Nominal', ex: '110001, 247667, …', ok: 'Counts and the mode.', no: 'It looks like a number, but the “average PIN code” means nothing: the digits are just labels.' },
    { n: 'Star rating', t: 'Ordinal', ex: '★ to ★★★★★', ok: 'Mode, median, percentiles.', no: 'The gap between 1 and 2 stars need not equal the gap between 4 and 5, so a mean is only a rough guide.' },
    { n: 'Pain score 0–10', t: 'Ordinal', ex: '0, 1, 2, … 10', ok: 'Median and percentiles (means are common but debatable).', no: 'A score of 8 is not “twice as painful” as 4.' },
    { n: 'Temperature in °C', t: 'Interval', ex: '−5, 20, 37 °C', ok: 'Mean, standard deviation, differences.', no: 'Ratios are meaningless: 20 °C is not twice as hot as 10 °C, because 0 °C is not “no temperature”.' },
    { n: 'Temperature in kelvin', t: 'Ratio', ex: '268, 293, 310 K', ok: 'Everything, including ratios: 300 K is twice 150 K.', no: '–' },
    { n: 'Mass', t: 'Ratio', ex: '2.31 g, 70 kg', ok: 'Everything: mean, geometric mean, coefficient of variation, ratios.', no: '–' },
    { n: 'Defects per batch', t: 'Ratio (discrete count)', ex: '0, 1, 2, 3 …', ok: 'Mean, median, mode; often analysed with count distributions (Part 2).', no: 'Counts cannot be negative or fractional, which matters for some methods.' },
    { n: 'pH', t: 'Interval (logarithmic scale)', ex: '4.5, 7.0, 8.2', ok: 'Median; means of pH values are often used, but correspond to a geometric mean of hydrogen-ion concentration.', no: 'pH 4 is ten times more acidic than pH 5, not 25% more.' }
  ];
  FIG['fig-data-types'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var list = div('', container);
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;';
    var panel = div('', container);
    panel.style.cssText = READ_CSS + 'min-height:7rem;';
    panel.setAttribute('aria-live', 'polite');
    var bs = VARS.map(function (v, i) { var b = btn(v.n, list); b.addEventListener('click', function () { show(i); }); return b; });
    function show(i) {
      var v = VARS[i];
      bs.forEach(function (b, j) { b.classList.toggle('active', i === j); b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      panel.innerHTML = '<div style="font-weight:700;color:var(--ink);">' + v.n + ' <span style="font-weight:600;color:var(--accent);">→ ' + v.t + '</span></div>' +
        '<div style="margin-top:0.25rem;"><strong>Example values:</strong> ' + v.ex + '</div>' +
        '<div style="margin-top:0.25rem;"><strong>Sensible summaries:</strong> ' + v.ok + '</div>' +
        '<div style="margin-top:0.25rem;"><strong>Beware:</strong> ' + v.no + '</div>';
    }
    show(0);
  };

  /* -----------------------------------------------------------------------
     Figure 3. Histogram bin explorer
     ----------------------------------------------------------------------- */
  var HDATA = (function () {
    var r = rng(7), rt = [], ht = [], nz = [], i;
    for (i = 0; i < 200; i++) rt.push(Math.exp(5.6 + 0.35 * gaussR(r)));                  // reaction times, ms
    for (i = 0; i < 200; i++) ht.push(i % 2 ? 175 + 7 * gaussR(r) : 162 + 6.5 * gaussR(r)); // adult heights, cm
    for (i = 0; i < 200; i++) nz.push(5 + 0.2 * gaussR(r));                                 // sensor voltage, V
    return [{ n: 'Reaction times (ms)', d: rt, note: 'Reaction times are skewed: most people react in 200–350 ms, but a long tail of slow responses stretches to the right.' },
      { n: 'Heights of adults (cm)', d: ht, note: 'A mixture of two groups (here, men and women) can produce two peaks. Too few bins hide them; too many make noise look like peaks.' },
      { n: 'Sensor voltage (V)', d: nz, note: 'Random electronic noise gives a symmetric, bell-shaped histogram, the normal distribution of Part 2.' }];
  })();
  FIG['fig-histogram-bins'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 0, bins = 12;
    var controls = div('fig-controls', container);
    choice(controls, 'Data (200 measurements each)', HDATA.map(function (d) { return d.n; }), 0, function (i) { di = i; draw(); });
    var sl = FIG.slider(controls, { id: 'hb-b', label: 'Number of bins', min: 3, max: 60, step: 1, value: bins, onChange: function (x) { bins = x; draw(); } });
    var row = group(controls, 'Rules of thumb');
    btn('Sturges', row).addEventListener('click', function () { bins = Math.ceil(Math.log2(200) + 1); sl.setValue(bins); draw(); });
    btn('Freedman–Diaconis', row).addEventListener('click', function () { var d = HDATA[di].d, w = 2 * (quantile(d, 0.75) - quantile(d, 0.25)) / Math.cbrt(d.length), s = sorted(d); bins = Math.max(3, Math.min(60, Math.round((s[s.length - 1] - s[0]) / w))); sl.setValue(bins); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), d = HDATA[di].d, s = sorted(d), lo = s[0], hi = s[s.length - 1], w = (hi - lo) / bins, cnt = new Array(bins).fill(0);
      valText(sl, String(bins));
      d.forEach(function (x) { cnt[Math.min(bins - 1, Math.floor((x - lo) / w))]++; });
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 230, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Histogram');
      var L = 34, R = W - 10, T = 14, B = H - 52, mx = Math.max.apply(null, cnt);
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      cnt.forEach(function (k, i) { var h = k / mx * (B - T); el('rect', { x: X(lo + i * w) + 0.5, y: B - h, width: Math.max(1, (R - L) / bins - 1), height: h, fill: BLUE, opacity: 0.7 }, svg); });
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      txt(svg, L - 4, T + 8, String(mx), { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, L - 4, B, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      // rug of individual values
      d.forEach(function (x) { el('line', { x1: X(x), y1: B + 6, x2: X(x), y2: B + 14, stroke: c.ink2, opacity: 0.35 }, svg); });
      [0, 0.5, 1].forEach(function (f) { var v = lo + f * (hi - lo); txt(svg, X(v), B + 30, fmt(v, v > 100 ? 0 : 1), { size: fs(10), fill: c.muted, anchor: f === 0 ? 'start' : f === 1 ? 'end' : 'middle' }); });
      txt(svg, (L + R) / 2, H - 4, 'each tick below the axis is one measurement', { size: fs(10), fill: c.muted });
      out.innerHTML = 'Bin width: <strong>' + fmt(w, w < 1 ? 3 : 1) + '</strong>. Mean ' + fmt(mean(d), 2) + ', median ' + fmt(median(d), 2) + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + HDATA[di].note + ' Sturges’s rule (1926) suggests about log₂(n) + 1 bins; the Freedman–Diaconis rule (1981) sets the bin width from the interquartile range and copes better with skewed data. (Simulated data.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Mean, median and mode
     ----------------------------------------------------------------------- */
  var MM_BASE = [3.1, 3.4, 3.6, 3.6, 3.8, 3.9, 4.0, 4.2, 4.5, 4.8, 5.0];
  FIG['fig-mean-median'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var big = 5.0, cluster = 0;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'mm-x', label: 'Move the largest value', min: 5, max: 40, step: 0.1, value: big, onChange: function (x) { big = x; draw(); } });
    choice(controls, 'Shape', ['One group', 'Two separate groups'], 0, function (i) { cluster = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), d = MM_BASE.slice();
      if (cluster) d = [2.0, 2.2, 2.3, 2.3, 2.5, 7.5, 7.7, 7.8, 7.8, 8.0, 8.2];
      d[d.length - 1] = cluster ? Math.max(8.2, big + 3.2) : big;
      valText(sl, fmt(d[d.length - 1], 1));
      var m = mean(d), md = median(d), mo = modes(d, 1);
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 170, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Dot plot with mean, median and mode');
      var lo = cluster ? 1 : 2.5, hi = cluster ? Math.max(10, Math.ceil(d[d.length - 1] + 1)) : Math.max(6, Math.ceil(d[d.length - 1] + 0.5)), L = 14, R = W - 14, Y = 100, X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); };
      el('line', { x1: L, y1: Y, x2: R, y2: Y, stroke: c.border, 'stroke-width': 1.5 }, svg);
      var stack = {};
      d.forEach(function (v) { var k = v.toFixed(1), o = (stack[k] = (stack[k] || 0) + 1); el('circle', { cx: X(v), cy: Y - 8 - (o - 1) * 12, r: 5.5, fill: c.muted }, svg); });
      [[m, 'mean', RED, 22], [md, 'median', BLUE, 40], [mo.values[0], 'mode', GREEN, 58]].forEach(function (s, i) {
        el('line', { x1: X(s[0]), y1: Y + 4, x2: X(s[0]), y2: Y + s[3] - 10, stroke: s[2], 'stroke-width': 2 }, svg);
        txt(svg, X(s[0]), Y + s[3] + 2, s[1] + ' ' + fmt(s[0], 2), { size: fs(10.5), fill: s[2], weight: 700, anchor: X(s[0]) > W - 70 ? 'end' : X(s[0]) < 70 ? 'start' : 'middle' });
      });
      for (var t = Math.ceil(lo); t <= hi; t += (hi > 20 ? 5 : 1)) txt(svg, X(t), 16, String(t), { size: fs(9.5), fill: c.faint });
      out.innerHTML = 'Mean <strong>' + fmt(m, 2) + '</strong> · median <strong>' + fmt(md, 2) + '</strong> · mode <strong>' + mo.values.map(function (v) { return fmt(v, 1); }).join(' and ') + '</strong> (appears ' + mo.count + ' times).' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (cluster ? 'With two separate groups, the mean and median can land in the empty gap between them, describing nobody. Report the groups separately, or show the histogram.' : big > 8 ? 'One extreme value drags the mean towards it, while the median, the middle value, does not move at all. That is why median house prices and median incomes are reported.' : 'Drag the largest value to the right and watch which average follows it.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Which average?
     ----------------------------------------------------------------------- */
  var AVG = [
    { n: 'Investment growth', data: '+10%, +50%, −20% over three years', calc: function () { var g = Math.cbrt(1.1 * 1.5 * 0.8); return [['Arithmetic mean of the rates', '+13.3% per year'], ['Geometric mean of the growth factors', '+' + fmt((g - 1) * 100, 1) + '% per year'], ['Check: 1.10 × 1.50 × 0.80', '1.32, the same as ' + fmt(g, 4) + '³']]; }, note: 'Growth compounds, so the right average multiplies: the geometric mean. £100 really grows to £132, which is 9.7% a year, not 13.3%.' },
    { n: 'Average speed', data: '10 km at 60 km/h, then 10 km at 40 km/h', calc: function () { return [['Arithmetic mean of speeds', '50 km/h'], ['Harmonic mean of speeds', '48 km/h'], ['Check: 20 km ÷ (10/60 + 10/40) h', '48 km/h']]; }, note: 'For rates over equal distances, use the harmonic mean: you spend longer at the slower speed, so it counts for more.' },
    { n: 'Salaries in a small firm', data: '3, 4, 4, 5, 5, 5, 6, 6, 7 and 30 (lakh ₹ per year)', calc: function () { return [['Mean', '7.5'], ['Median', '5.0'], ['Mode', '5'], ['10% trimmed mean (drop the top and bottom value)', fmt((4 + 4 + 5 + 5 + 5 + 6 + 6 + 7) / 8, 2)]]; }, note: 'One very high salary lifts the mean above what nine of the ten people earn. The median describes a typical employee.' },
    { n: 'Course grade', data: 'Lab 80 (weight 20%), mid-term 65 (30%), final 74 (50%)', calc: function () { return [['Plain mean of the three marks', fmt((80 + 65 + 74) / 3, 1)], ['Weighted mean', fmt(0.2 * 80 + 0.3 * 65 + 0.5 * 74, 1)]]; }, note: 'When items have different importance or sample sizes, use a weighted mean: each value multiplied by its weight, divided by the total weight.' },
    { n: 'Shoe sizes sold', data: 'Sizes 6, 7, 7, 8, 8, 8, 8, 9, 9, 10, 11', calc: function () { return [['Mean', fmt(mean([6, 7, 7, 8, 8, 8, 8, 9, 9, 10, 11]), 2)], ['Median', '8'], ['Mode', '8']]; }, note: 'A shop stocking shoes cares about the most common size, the mode. A mean size of 8.27 is not a size anyone can buy.' }
  ];
  FIG['fig-which-average'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var controls = div('fig-controls', container);
    var out = div('', container);
    choice(controls, 'Situation', AVG.map(function (a) { return a.n; }), 0, show);
    function show(i) {
      var a = AVG[i], rows = a.calc(), td = 'padding:0.35rem 0.5rem;border-bottom:1px solid var(--border);';
      out.innerHTML = '<div style="' + READ_CSS + '"><div><strong>Data:</strong> ' + a.data + '</div><table style="width:100%;border-collapse:collapse;margin:0.4rem 0;font-size:0.88rem;"><tbody>' +
        rows.map(function (r) { return '<tr><td style="' + td + '">' + r[0] + '</td><td style="' + td + 'text-align:right;font-weight:700;color:var(--ink);white-space:nowrap;">' + r[1] + '</td></tr>'; }).join('') + '</tbody></table><div style="font-size:0.88rem;">' + a.note + '</div></div>';
    }
    show(0);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Spread and the box plot
     ----------------------------------------------------------------------- */
  var RES = [99.2, 100.4, 99.8, 100.1, 99.5, 100.9, 100.0, 99.7, 100.3, 99.9, 100.2, 99.6, 100.6, 99.4, 100.0, 100.8, 99.3, 100.5, 103.9, 99.8];
  FIG['fig-box-plot'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var di = 0;
    var sets = [
      { n: 'Resistors, with one bad reading', d: RES, u: 'Ω', dp: 2 },
      { n: 'Resistors, bad reading removed', d: RES.filter(function (x) { return x < 103; }), u: 'Ω', dp: 2 },
      { n: 'Reaction times', d: HDATA[0].d.slice(0, 60), u: 'ms', dp: 0 },
      { n: 'Adult heights', d: HDATA[1].d.slice(0, 60), u: 'cm', dp: 1 }
    ];
    var controls = div('fig-controls', container);
    choice(controls, 'Data', sets.map(function (s) { return s.n; }), 0, function (i) { di = i; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), S = sets[di], d = S.d, s = sorted(d), q1 = quantile(d, 0.25), q2 = median(d), q3 = quantile(d, 0.75), iqr = q3 - q1;
      var lf = q1 - 1.5 * iqr, uf = q3 + 1.5 * iqr, wl = s.filter(function (x) { return x >= lf; })[0], wu = s.filter(function (x) { return x <= uf; }).pop();
      var outl = s.filter(function (x) { return x < lf || x > uf; });
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 190, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Box plot and dot plot');
      var lo = s[0] - (s[s.length - 1] - s[0]) * 0.05, hi = s[s.length - 1] + (s[s.length - 1] - s[0]) * 0.05, L = 14, R = W - 14;
      var X = function (v) { return L + (v - lo) / (hi - lo) * (R - L); }, yb = 70;
      el('line', { x1: X(wl), y1: yb, x2: X(q1), y2: yb, stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      el('line', { x1: X(q3), y1: yb, x2: X(wu), y2: yb, stroke: c.ink2, 'stroke-width': 1.5 }, svg);
      [wl, wu].forEach(function (v) { el('line', { x1: X(v), y1: yb - 10, x2: X(v), y2: yb + 10, stroke: c.ink2, 'stroke-width': 1.5 }, svg); });
      el('rect', { x: X(q1), y: yb - 22, width: Math.max(2, X(q3) - X(q1)), height: 44, fill: BLUE, opacity: 0.2, stroke: BLUE }, svg);
      el('line', { x1: X(q2), y1: yb - 22, x2: X(q2), y2: yb + 22, stroke: BLUE, 'stroke-width': 3 }, svg);
      el('circle', { cx: X(mean(d)), cy: yb, r: 4, fill: RED }, svg);
      outl.forEach(function (v) { el('circle', { cx: X(v), cy: yb, r: 5, fill: 'none', stroke: RED, 'stroke-width': 2 }, svg); });
      d.forEach(function (v, i) { el('circle', { cx: X(v), cy: 132 + (i % 5) * 7, r: 3, fill: c.muted, opacity: 0.7 }, svg); });
      txt(svg, L, 20, W < 560 ? 'Box: Q1 to Q3 · line: median · dot: mean' : 'Box: middle 50% (Q1 to Q3) · thick line: median · red dot: mean · circles: outliers', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, L, 122, 'Every value:', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, X(s[0]), H - 6, fmt(s[0], S.dp), { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, X(s[s.length - 1]), H - 6, fmt(s[s.length - 1], S.dp), { anchor: 'end', size: fs(10), fill: c.muted });
      var sd = sdv(d), u = ' ' + S.u, dp = S.dp + 1;
      out.innerHTML = 'n = ' + d.length + ' · mean <strong>' + fmt(mean(d), dp) + u + '</strong> · median <strong>' + fmt(q2, dp) + u + '</strong><br>' +
        'Range ' + fmt(s[s.length - 1] - s[0], dp) + u + ' · standard deviation <strong>' + fmt(sd, dp) + u + '</strong> · interquartile range <strong>' + fmt(iqr, dp) + u + '</strong> · median absolute deviation ' + fmt(mad(d), dp) + u + ' · coefficient of variation ' + fmt(sd / mean(d) * 100, 2) + '% · skewness ' + fmt(skew(d), 2) +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (outl.length ? outl.length + ' value' + (outl.length > 1 ? 's lie' : ' lies') + ' beyond Tukey’s fences (more than 1.5 × IQR outside the box). ' : 'No values beyond Tukey’s fences. ') +
        (di < 2 ? 'Compare the two resistor data sets: removing one bad reading halves the standard deviation, but barely changes the median, IQR or MAD.' : di === 2 ? 'Skewed data: the long right whisker and the mean sitting to the right of the median give it away.' : 'Two groups mixed together: the box plot alone cannot show the two peaks that the histogram revealed.') + '</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Why divide by n − 1?
     ----------------------------------------------------------------------- */
  FIG['fig-bessel'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 3, draws = 0, sN = 0, sN1 = 0, r = Math.random;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'bs-n', label: 'Sample size n', min: 2, max: 30, step: 1, value: n, onChange: function (x) { n = x; draws = 0; sN = 0; sN1 = 0; draw(); } });
    var row = group(controls, 'Actions');
    btn('Draw 1,000 samples', row).addEventListener('click', function () { run(1000); });
    btn('Start again', row).addEventListener('click', function () { draws = 0; sN = 0; sN1 = 0; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function g() { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function run(k) {
      for (var t = 0; t < k; t++) { var x = [], i; for (i = 0; i < n; i++) x.push(g()); var m = mean(x), ss = 0; for (i = 0; i < n; i++) ss += (x[i] - m) * (x[i] - m); sN += ss / n; sN1 += ss / (n - 1); draws++; }
      draw();
    }
    function draw() {
      var c = C();
      valText(sl, String(n));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 150, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Average sample variance compared with the true variance');
      var L = 10, R = W - 10, bw = R - L, X = function (v) { return L + Math.min(1.5, v) / 1.5 * bw; };
      el('line', { x1: X(1), y1: 20, x2: X(1), y2: 130, stroke: c.ink, 'stroke-dasharray': '4 3' }, svg);
      txt(svg, X(1) + 4, 16, 'true variance = 1', { anchor: 'start', size: fs(10), fill: c.ink2 });
      [[draws ? sN / draws : 0, 'divide by n', AMBER, 40], [draws ? sN1 / draws : 0, 'divide by n − 1', GREEN, 88]].forEach(function (s) {
        el('rect', { x: L, y: s[3], width: Math.max(1, X(s[0]) - L), height: 28, fill: s[2], opacity: 0.8, rx: 3 }, svg);
        txt(svg, L + 6, s[3] + 19, s[1] + ': ' + (draws ? fmt(s[0], 3) : '–'), { anchor: 'start', size: fs(11), weight: 700, fill: '#fff' });
      });
      out.innerHTML = (draws ? 'Average over <strong>' + fmt(draws, 0) + '</strong> samples of size ' + n + ': dividing by n gives <strong>' + fmt(sN / draws, 3) + '</strong>, dividing by n − 1 gives <strong>' + fmt(sN1 / draws, 3) + '</strong>. Theory: ' + fmt((n - 1) / n, 3) + ' and 1.' : 'Press “Draw 1,000 samples”.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Each sample is drawn from a population whose true variance is exactly 1. Deviations are measured from the sample’s own mean, which sits closer to the sample than the true mean does, so dividing by n underestimates the variance on average. Dividing by n − 1 (Bessel’s correction) fixes this. The effect is large for tiny samples and vanishes for large ones.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Anscombe's quartet
     ----------------------------------------------------------------------- */
  var ANS = [
    { x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68] },
    { x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74] },
    { x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73] },
    { x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89] }
  ];
  FIG['fig-anscombe'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var shown = false;
    var controls = div('fig-controls', container);
    var row = group(controls, 'Actions');
    var b = btn('Show the plots', row);
    b.addEventListener('click', function () { shown = !shown; b.textContent = shown ? 'Hide the plots' : 'Show the plots'; draw(); });
    var tblWrap = div('', container), svgWrap = div('', container);
    function stats(s) {
      var mx = mean(s.x), my = mean(s.y), sxx = 0, syy = 0, sxy = 0;
      for (var i = 0; i < s.x.length; i++) { sxx += (s.x[i] - mx) * (s.x[i] - mx); syy += (s.y[i] - my) * (s.y[i] - my); sxy += (s.x[i] - mx) * (s.y[i] - my); }
      var slope = sxy / sxx;
      return { mx: mx, my: my, vx: sxx / (s.x.length - 1), vy: syy / (s.x.length - 1), r: sxy / Math.sqrt(sxx * syy), a: my - slope * mx, b: slope };
    }
    function draw() {
      var c = C(), st = ANS.map(stats), th = 'padding:0.3rem 0.45rem;border-bottom:2px solid var(--border);text-align:center;', td = 'padding:0.3rem 0.45rem;border-bottom:1px solid var(--border);text-align:center;';
      tblWrap.innerHTML = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-sans);font-size:0.86rem;"><thead><tr><th style="' + th + 'text-align:left;">Statistic</th><th style="' + th + '">I</th><th style="' + th + '">II</th><th style="' + th + '">III</th><th style="' + th + '">IV</th></tr></thead><tbody>' +
        [['Mean of x', 'mx', 2], ['Mean of y', 'my', 2], ['Variance of x', 'vx', 2], ['Variance of y', 'vy', 2], ['Correlation', 'r', 3]].map(function (r) { return '<tr><td style="' + td + 'text-align:left;">' + r[0] + '</td>' + st.map(function (s) { return '<td style="' + td + '">' + fmt(s[r[1]], r[2]) + '</td>'; }).join('') + '</tr>'; }).join('') +
        '<tr><td style="' + td + 'text-align:left;">Best-fit line</td>' + st.map(function (s) { return '<td style="' + td + '">y = ' + fmt(s.a, 2) + ' + ' + fmt(s.b, 2) + 'x</td>'; }).join('') + '</tr></tbody></table></div>';
      svgWrap.innerHTML = '';
      if (!shown) return;
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), cols = W < 560 ? 2 : 4, pw = (W - 20) / cols - 10, H = Math.ceil(4 / cols) * (pw + 30) + 10, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'The four data sets of Anscombe’s quartet');
      ANS.forEach(function (s, k) {
        var x0 = 10 + (k % cols) * (pw + 10), y0 = 24 + Math.floor(k / cols) * (pw + 30), X = function (v) { return x0 + (v - 2) / 18 * pw; }, Y = function (v) { return y0 + pw - (v - 2) / 12 * pw; };
        el('rect', { x: x0, y: y0, width: pw, height: pw, fill: 'none', stroke: c.border }, svg);
        txt(svg, x0 + 4, y0 - 6, ['I', 'II', 'III', 'IV'][k], { anchor: 'start', size: fs(11), weight: 700, fill: c.ink2 });
        el('line', { x1: X(2), y1: Y(st[k].a + st[k].b * 2), x2: X(20), y2: Y(st[k].a + st[k].b * 20), stroke: RED, 'stroke-width': 1.3, opacity: 0.7 }, svg);
        s.x.forEach(function (v, i) { el('circle', { cx: X(v), cy: Y(s.y[i]), r: 3.5, fill: BLUE }, svg); });
      });
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 9. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-d1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A survey records people’s blood groups. Which summary makes sense?', options: ['The mean', 'The median', 'The mode and the proportions', 'The standard deviation'], answer: 2, explanation: 'Blood group is nominal: categories without order.' },
      { question: 'Why is “20 °C is twice as warm as 10 °C” wrong?', options: ['Celsius is ordinal', 'Celsius is an interval scale whose zero is arbitrary', 'Temperature cannot be averaged', 'It is only wrong in winter'], answer: 1, explanation: 'Ratios need a true zero, as in kelvin: 293 K is only about 3.5% warmer than 283 K.' },
      { question: 'One house in a street sells for ten times the others. Which average barely changes?', options: ['Mean', 'Median', 'Both change equally', 'Neither'], answer: 1, explanation: 'The median depends only on the middle value.' },
      { question: 'An investment grows by +100% then −50%. What is the average yearly growth?', options: ['+25%', '0%', '+50%', '−25%'], answer: 1, explanation: 'Geometric mean: √(2 × 0.5) = 1, so 0% per year. You end where you started.' },
      { question: 'You drive 10 km at 30 km/h and 10 km at 60 km/h. Average speed?', options: ['45 km/h', '40 km/h', '50 km/h', '35 km/h'], answer: 1, explanation: 'Harmonic mean: 2 ÷ (1/30 + 1/60) = 40 km/h.' },
      { question: 'Why do we divide by n − 1 for the sample standard deviation?', options: ['It is a tradition', 'Deviations from the sample mean are slightly too small, and n − 1 corrects the bias in the variance', 'To make the number larger for safety', 'Because the first value is ignored'], answer: 1, explanation: 'This is Bessel’s correction.' },
      { question: 'Which measure of spread is least affected by a single extreme outlier?', options: ['Range', 'Standard deviation', 'Interquartile range', 'Variance'], answer: 2, explanation: 'The IQR uses only the middle 50% of the data.' },
      { question: 'In a box plot, what does the box show?', options: ['The mean ± one SD', 'The middle 50% of the data, from Q1 to Q3', 'All the data', 'The outliers'], answer: 1, explanation: 'The line inside is the median; whiskers extend to the most extreme non-outlying values.' },
      { question: 'A data set’s mean is much larger than its median. It is probably…', options: ['Symmetric', 'Skewed to the right', 'Skewed to the left', 'Bimodal'], answer: 1, explanation: 'A long right tail pulls the mean up.' },
      { question: 'Anscombe’s quartet shows that…', options: ['Correlation implies causation', 'Data sets with identical summary statistics can look completely different, so always plot your data', 'The mean is always better than the median', 'Small samples are useless'], answer: 1, explanation: 'Four data sets, same means, variances, correlation and best-fit line, four different stories.' }
    ]);
  };
})();
