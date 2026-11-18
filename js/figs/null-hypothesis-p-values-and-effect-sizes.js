/* ==========================================================================
   RNLearn — Is It Real, or Just Luck? Null Hypotheses, p-Values and Effect Sizes
   Figures:
     1. fig-stats-timeline   The story at a glance (clickable timeline)
     2. fig-coin-test        Lucky or loaded? An exact coin test
     3. fig-null-world       The null world, built by shuffling
     4. fig-power            Errors and power
     5. fig-big-n            Significant but tiny
     6. fig-cliffs-delta     Cliff's delta explorer
     7. fig-multiple-tests   A thousand tests at once
     8. fig-p-dance          The dance of the p-values
     9. fig-model-compare    Comparing two models over seeds
    10. fig-quiz-nhst        Test yourself
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
    { name: 'Founders', color: '#b45309' },
    { name: 'New tools', color: '#1d4ed8' },
    { name: 'Crisis, reform and machine learning', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1710', icon: '👶', era: 0, sec: 3, title: 'Arbuthnot’s baby count', text: 'John Arbuthnot notes that more boys than girls were christened in London in each of 82 years, and argues this could hardly be chance: an early significance test.' },
    { year: '1900', icon: '🧮', era: 0, sec: 7, title: 'Pearson’s chi-square', text: 'Karl Pearson introduces the chi-square test for comparing observed counts with what a theory predicts.' },
    { year: '1908', icon: '🍺', era: 0, sec: 7, title: '“Student” and the t-test', text: 'William Gosset, a chemist at the Guinness brewery, publishes the t-distribution for small samples under the pen name “Student”.' },
    { year: '1925', icon: '📗', era: 0, sec: 5, title: 'Fisher and 0.05', text: 'Ronald Fisher’s <em>Statistical Methods for Research Workers</em> popularises p-values and calls 1 in 20 a “convenient” limit.' },
    { year: '1933', icon: '⚖️', era: 0, sec: 6, title: 'Neyman and Pearson', text: 'Jerzy Neyman and Egon Pearson frame testing as a decision with two kinds of error and the idea of power.' },
    { year: '1935', icon: '🫖', era: 0, sec: 3, title: 'The lady tasting tea', text: 'Fisher’s <em>The Design of Experiments</em> introduces the term “null hypothesis” with a famous tea-tasting experiment.' },
    { year: '1945', icon: '🔢', era: 1, sec: 8, title: 'Tests based on ranks', text: 'Frank Wilcoxon (1945), and Henry Mann and Donald Whitney (1947), introduce tests that use only the ranks of the data.' },
    { year: '1979', icon: '🥾', era: 1, sec: 8, title: 'The bootstrap', text: 'Bradley Efron shows how to estimate uncertainty by resampling the data itself.' },
    { year: '1993', icon: '📊', era: 1, sec: 9, title: 'Cliff’s delta', text: 'Norman Cliff advocates dominance statistics: how often values in one group exceed those in the other.' },
    { year: '1995', icon: '🔍', era: 1, sec: 11, title: 'False discovery rate', text: 'Yoav Benjamini and Yosef Hochberg introduce the false discovery rate for handling many tests at once.' },
    { year: '1998', icon: '🤖', era: 2, sec: 14, title: 'Comparing classifiers', text: 'Thomas Dietterich shows that common tests for comparing learning algorithms give far too many false positives.' },
    { year: '2002', icon: '🧬', era: 1, sec: 11, title: 'The q-value', text: 'John Storey introduces the q-value, a false-discovery counterpart to the p-value, widely used in genomics.' },
    { year: '2005', icon: '⚠️', era: 2, sec: 12, title: '“Most findings are false”', text: 'John Ioannidis argues that most published research findings are probably false.' },
    { year: '2006', icon: '📈', era: 2, sec: 14, title: 'Many datasets', text: 'Janez Demšar recommends Wilcoxon and Friedman tests for comparing classifiers across many datasets.' },
    { year: '2015', icon: '🔁', era: 2, sec: 12, title: 'The replication project', text: 'An attempt to repeat 100 psychology studies finds significant results in only about 36% of them.' },
    { year: '2016', icon: '📜', era: 2, sec: 12, title: 'The ASA statement', text: 'The American Statistical Association issues its first formal statement on what p-values do and do not mean.' }
  ];
  FIG['fig-stats-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1710 to 2016');
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
     Shared statistics helpers
     ----------------------------------------------------------------------- */
  var READ_CSS = 'margin-top:0.6rem;padding:0.7rem 0.9rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-raised);font-family:var(--font-sans);font-size:0.9rem;line-height:1.5;color:var(--ink-secondary);';
  var BLUE = '#2563eb', RED = '#dc2626', GREEN = '#16a34a';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) {
      var b = btn(it, row); bs.push(b);
      b.addEventListener('click', function () { set(i); onPick(i); });
    });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    set(initial);
    return row;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sd(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  function normCdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function normInv(p) { // Acklam's approximation
    var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
      b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
      c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
      d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], q, r;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - 0.02425) return -normInv(1 - p);
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function lgamma(x) {
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); var s = 1.000000000190015;
    for (var j = 0; j < 6; j++) s += c[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap, m, m2, aa, del, h;
    if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; h = d;
    for (m = 1; m <= 200; m++) {
      m2 = 2 * m; aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; del = d * c; h *= del;
      if (Math.abs(del - 1) < 3e-12) break;
    }
    return h;
  }
  function incbeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tTwoSided(t, df) { return incbeta(df / (df + t * t), df / 2, 0.5); }
  function welch(a, b) {
    var va = sd(a) * sd(a) / a.length, vb = sd(b) * sd(b) / b.length, t = (mean(b) - mean(a)) / Math.sqrt(va + vb);
    var df = (va + vb) * (va + vb) / (va * va / (a.length - 1) + vb * vb / (b.length - 1));
    return { t: t, df: df, p: tTwoSided(t, df) };
  }
  function pairedT(a, b) {
    var d = b.map(function (x, i) { return x - a[i]; }), s = sd(d), t = mean(d) / (s / Math.sqrt(d.length));
    return { t: t, df: d.length - 1, p: s > 0 ? tTwoSided(t, d.length - 1) : (mean(d) === 0 ? 1 : 0) };
  }
  function wilcoxon(a, b) { // exact two-sided signed-rank test (no ties assumed beyond rounding)
    var d = b.map(function (x, i) { return x - a[i]; }).filter(function (x) { return Math.abs(x) > 1e-9; });
    var n = d.length; if (!n) return { W: 0, p: 1 };
    var idx = d.map(function (x, i) { return i; }).sort(function (i, j) { return Math.abs(d[i]) - Math.abs(d[j]); });
    var ranks = new Array(n), k = 0, ties = false, tieSum = 0;
    while (k < n) { var j = k; while (j + 1 < n && Math.abs(Math.abs(d[idx[j + 1]]) - Math.abs(d[idx[k]])) < 1e-9) j++; if (j > k) { ties = true; tieSum += Math.pow(j - k + 1, 3) - (j - k + 1); } for (var q = k; q <= j; q++) ranks[idx[q]] = (k + j + 2) / 2; k = j + 1; }
    var wp = 0; for (var i = 0; i < n; i++) if (d[i] > 0) wp += ranks[i];
    var W = Math.min(wp, n * (n + 1) / 2 - wp);
    if (n <= 25 && !ties) { // exact distribution using integer ranks
      var max = n * (n + 1) / 2, cnt = [1]; for (i = 1; i <= max; i++) cnt.push(0);
      for (var r = 1; r <= n; r++) for (var s = max; s >= r; s--) cnt[s] += cnt[s - r];
      var tot = Math.pow(2, n), acc = 0; for (s = 0; s <= Math.floor(W + 1e-9); s++) acc += cnt[s];
      return { W: W, p: Math.min(1, 2 * acc / tot) };
    }
    var mu = n * (n + 1) / 4, sg = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24 - tieSum / 48);
    return { W: W, p: Math.min(1, 2 * normCdf((W - mu + 0.5) / sg)) };
  }
  function cliff(a, b) { var s = 0; for (var i = 0; i < b.length; i++) for (var j = 0; j < a.length; j++) s += b[i] > a[j] ? 1 : b[i] < a[j] ? -1 : 0; return s / (a.length * b.length); }
  function cliffLabel(dd) { var x = Math.abs(dd); return x < 0.147 ? 'negligible' : x < 0.33 ? 'small' : x < 0.474 ? 'medium' : 'large'; }
  function pText(p) { return p < 0.0001 ? 'p < 0.0001' : 'p = ' + (p < 0.001 ? p.toExponential(1) : fmt(p, p < 0.01 ? 4 : 3)); }
  function pBare(p) { return p < 0.0001 ? '< 0.0001' : (p < 0.001 ? p.toExponential(1) : fmt(p, p < 0.01 ? 4 : 3)); }

  /* -----------------------------------------------------------------------
     Figure 2. Lucky or loaded? An exact coin test
     ----------------------------------------------------------------------- */
  function binomPmf(n) { var out = [], lc = 0; for (var k = 0; k <= n; k++) { if (k) lc += Math.log((n - k + 1) / k); out.push(Math.exp(lc - n * Math.LN2)); } return out; }
  FIG['fig-coin-test'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var n = 12, k = 9, two = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ct-n', label: 'Number of flips', min: 5, max: 100, step: 1, value: n, onChange: function (v) { n = v; if (k > n) { k = n; s2.setValue(k); } s2.element.max = n; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ct-k', label: 'Number of heads', min: 0, max: n, step: 1, value: k, onChange: function (v) { k = v; draw(); } });
    choice(controls, 'Question', ['Is it biased towards heads? (one-sided)', 'Is it biased either way? (two-sided)'], 0, function (i) { two = i; draw(); });
    var row = group(controls, 'Or flip a coin');
    btn('A fair coin', row).addEventListener('click', function () { flip(0.5); });
    btn('A loaded coin (65% heads)', row).addEventListener('click', function () { flip(0.65); });
    function flip(ph) { var h = 0; for (var i = 0; i < n; i++) if (Math.random() < ph) h++; k = h; s2.setValue(k); draw(); }
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), pm = binomPmf(n), p = 0, i, exp = n / 2;
      valText(s1, String(n)); valText(s2, String(k));
      var extreme = function (j) { return two ? Math.abs(j - exp) >= Math.abs(k - exp) - 1e-9 : j >= k; };
      for (i = 0; i <= n; i++) if (extreme(i)) p += pm[i];
      p = Math.min(1, p);
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 210, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Probability of each number of heads for a fair coin');
      var L = 14, R = W - 10, T = 26, B = H - 30, bw = (R - L) / (n + 1), mx = Math.max.apply(null, pm);
      for (i = 0; i <= n; i++) {
        var h = pm[i] / mx * (B - T);
        el('rect', { x: L + i * bw + bw * 0.1, y: B - h, width: Math.max(1, bw * 0.8), height: h, fill: extreme(i) ? RED : c.faint, opacity: i === k ? 1 : 0.8 }, svg);
      }
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      var stepL = n <= 20 ? 1 : n <= 50 ? 5 : 10;
      for (i = 0; i <= n; i += stepL) txt(svg, L + i * bw + bw / 2, B + 14, String(i), { size: fs(9.5), fill: c.muted });
      txt(svg, L, 14, W < 560 ? 'If the coin is fair, chance of each result:' : 'If the coin is fair (the null hypothesis), chance of each number of heads:', { anchor: 'start', size: fs(10.5), fill: c.muted });
      txt(svg, (L + R) / 2, H - 3, W < 560 ? 'heads (red: as or more extreme)' : 'number of heads (red: as extreme as yours, or more)', { size: fs(10), fill: c.muted });
      read.innerHTML = 'You saw <strong>' + k + ' heads in ' + n + ' flips</strong>. If the coin were fair, the chance of a result at least this extreme is <strong>' + pText(p) + '</strong> (the total height of the red bars).<br>' +
        '<span style="font-size:0.86rem;color:var(--ink-muted);">' + (p < 0.05 ? 'Below 0.05: by the usual convention, “statistically significant”. Fair coins rarely do this, but not never.' : 'Above 0.05: a fair coin does this often enough that we cannot rule out luck. That does not prove the coin is fair.') + ' Try 90 heads in 100 flips, or 9 in 12 with a two-sided question.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 3. The null world: a permutation test
     ----------------------------------------------------------------------- */
  var PT_A = [21, 25, 18, 23, 20, 22, 19, 24, 20, 23], PT_B = [24, 27, 22, 26, 21, 28, 23, 25, 26, 22];
  FIG['fig-null-world'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var diffs = [], obs = mean(PT_B) - mean(PT_A), last = null;
    var controls = div('fig-controls', container);
    var row = group(controls, 'Shuffle the labels');
    btn('Shuffle once', row).addEventListener('click', function () { run(1); });
    btn('Shuffle 1,000 times', row).addEventListener('click', function () { run(1000); });
    btn('Start again', row).addEventListener('click', function () { diffs = []; last = null; draw(); });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function run(times) {
      var all = PT_A.concat(PT_B);
      for (var t = 0; t < times; t++) {
        var s = all.slice();
        for (var i = s.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = s[i]; s[i] = s[j]; s[j] = x; }
        last = s; diffs.push(mean(s.slice(10)) - mean(s.slice(0, 10)));
      }
      draw();
    }
    function draw() {
      var c = C();
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, H = narrow ? 330 : 220, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Plant heights and the shuffled differences');
      // left: the two groups (or the latest shuffle)
      var lw = narrow ? W - 20 : W * 0.38, yA = 50, yB = 100, X0 = 10, sc = function (v) { return X0 + (v - 16) / 14 * lw; };
      var ga = last ? last.slice(0, 10) : PT_A, gb = last ? last.slice(10) : PT_B;
      txt(svg, X0, 16, last ? 'Latest shuffle (labels mixed at random)' : 'Plant heights (cm)', { anchor: 'start', size: fs(10.5), fill: c.muted });
      [[ga, yA, 'old', BLUE], [gb, yB, 'new', RED]].forEach(function (g) {
        el('line', { x1: X0, y1: g[1], x2: X0 + lw, y2: g[1], stroke: c.border }, svg);
        var seen = {};
        g[0].forEach(function (v) { var o = (seen[v] = (seen[v] || 0) + 1); el('circle', { cx: sc(v), cy: g[1] - 8 * (o - 1), r: 5, fill: g[3], opacity: 0.8 }, svg); });
        txt(svg, X0, g[1] + 18, g[2] + ' fertiliser: mean ' + fmt(mean(g[0]), 1), { anchor: 'start', size: fs(10), fill: g[3] });
      });
      // right: histogram of shuffled differences
      var gx = narrow ? 20 : W * 0.46, gy = narrow ? 170 : 30, gw = narrow ? W - 30 : W * 0.52, gh = narrow ? 120 : H - 70;
      var lo = -4.5, hi = 4.5, nb = 36, bins = new Array(nb).fill(0);
      diffs.forEach(function (d) { var b = Math.floor((d - lo) / (hi - lo) * nb); if (b >= 0 && b < nb) bins[b]++; });
      var mx = Math.max(1, Math.max.apply(null, bins)), X = function (v) { return gx + (v - lo) / (hi - lo) * gw; };
      bins.forEach(function (v, b) { var x0 = lo + b * (hi - lo) / nb, h = v / mx * gh; el('rect', { x: X(x0) + 0.5, y: gy + gh - h, width: gw / nb - 1, height: h, fill: Math.abs(x0 + (hi - lo) / nb / 2) >= obs - 1e-9 ? RED : c.faint }, svg); });
      el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: c.border }, svg);
      [-4, -2, 0, 2, 4].forEach(function (v) { txt(svg, X(v), gy + gh + 14, String(v), { size: fs(10), fill: c.muted }); });
      el('line', { x1: X(obs), y1: gy - 4, x2: X(obs), y2: gy + gh, stroke: RED, 'stroke-width': 2 }, svg);
      el('line', { x1: X(-obs), y1: gy - 4, x2: X(-obs), y2: gy + gh, stroke: RED, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
      txt(svg, X(obs) - 4, gy + 8, 'real: +' + fmt(obs, 1), { anchor: 'end', size: fs(10), fill: RED, weight: 600 });
      txt(svg, gx, gy - 10, 'Difference in means after shuffling (cm)', { anchor: 'start', size: fs(10.5), fill: c.muted });
      var ext = diffs.filter(function (d) { return Math.abs(d) >= obs - 1e-9; }).length;
      read.innerHTML = 'Real difference: new − old = <strong>' + fmt(obs, 1) + ' cm</strong>. Shuffles so far: <strong>' + diffs.length + '</strong>' +
        (diffs.length ? '; differences at least as large (either direction): ' + ext + ', so <strong>p ≈ ' + fmt((ext + 1) / (diffs.length + 1), 3) + '</strong>.' : '. Press “Shuffle 1,000 times”.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">If the fertiliser did nothing, the labels “old” and “new” would be arbitrary, and shuffling them would produce differences like the real one quite often. The histogram is that imaginary “null world”. The rarer the real result is in it, the smaller the p-value. (Illustrative data.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. Errors and power
     ----------------------------------------------------------------------- */
  FIG['fig-power'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d = 0.5, n = 30, alpha = 0.05;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'pw-d', label: 'True effect size (Cohen’s d)', min: 0, max: 1.5, step: 0.05, value: d, onChange: function (v) { d = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'pw-n', label: 'Sample size in each group', min: 4, max: 300, step: 1, value: n, onChange: function (v) { n = v; draw(); } });
    var s3 = FIG.slider(controls, { id: 'pw-a', label: 'Significance level α', min: 0.001, max: 0.2, step: 0.001, value: alpha, onChange: function (v) { alpha = v; draw(); } });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function pdf(x, m) { return Math.exp(-0.5 * (x - m) * (x - m)) / Math.sqrt(2 * Math.PI); }
    function draw() {
      var c = C(), shift = d * Math.sqrt(n / 2), zc = normInv(1 - alpha / 2), power = 1 - normCdf(zc - shift) + normCdf(-zc - shift);
      valText(s1, fmt(d, 2)); valText(s2, String(n)); valText(s3, fmt(alpha, 3));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 220, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Null and alternative distributions with error regions');
      var lo = -4, hi = Math.max(5, shift + 4), L = 10, R = W - 10, T = 30, B = H - 32;
      var X = function (z) { return L + (z - lo) / (hi - lo) * (R - L); }, Y = function (y) { return B - y / 0.42 * (B - T); };
      function area(m, from, to, col, op) {
        var dd = 'M' + X(from) + ' ' + B;
        for (var z = from; z <= to + 1e-9; z += (to - from) / 60) dd += ' L' + X(z).toFixed(1) + ' ' + Y(pdf(z, m)).toFixed(1);
        el('path', { d: dd + ' L' + X(to) + ' ' + B + ' Z', fill: col, opacity: op }, svg);
      }
      area(0, zc, hi, RED, 0.45); area(0, lo, -zc, RED, 0.45);
      area(shift, lo, zc, BLUE, 0.25);
      [[0, c.muted], [shift, BLUE]].forEach(function (s) {
        var dd = ''; for (var z = lo; z <= hi; z += 0.05) dd += (dd ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(pdf(z, s[0])).toFixed(1);
        el('path', { d: dd, fill: 'none', stroke: s[1], 'stroke-width': 2 }, svg);
      });
      el('line', { x1: X(zc), y1: T - 6, x2: X(zc), y2: B, stroke: c.ink2, 'stroke-dasharray': '4 3' }, svg);
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      txt(svg, X(0) - 8, Y(0.3), 'no effect', { anchor: 'end', size: fs(10.5), fill: c.muted });
      if (shift > 0.6) txt(svg, Math.min(X(shift) + 10, R - 2), Y(0.3), 'real effect', { anchor: X(shift) + 80 > R ? 'end' : 'start', size: fs(10.5), fill: BLUE });
      txt(svg, Math.min(X(zc) + 4, R - 2), T - 10, W < 560 ? 'significant →' : '“significant” beyond here', { anchor: X(zc) > W * 0.6 ? 'end' : 'start', size: fs(10), fill: c.ink2 });
      txt(svg, (L + R) / 2, H - 6, W < 560 ? 'red: false alarms (α) · blue: misses (β)' : 'test statistic (red: false alarms, α · blue: missed effects, β)', { size: fs(10), fill: c.muted });
      read.innerHTML = 'Chance of a false alarm if there is no effect (Type I error): <strong>' + fmt(alpha * 100, alpha < 0.01 ? 1 : 0) + '%</strong>. ' +
        'Chance of missing this real effect (Type II error, β): <strong>' + fmt((1 - power) * 100, 0) + '%</strong>. <strong>Power = ' + fmt(power * 100, 0) + '%</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (d === 0 ? 'With no real effect, the only possible error is a false alarm, at rate α.' : power < 0.5 ? 'Low power: most experiments like this would miss the effect. Increase the sample size.' : power >= 0.8 ? 'Power of 80% or more is a common target when planning a study.' : 'Moderate power.') + ' Making α smaller cuts false alarms but misses more real effects; only more data (or a bigger effect) improves both. Normal approximation for a two-sided, two-group comparison.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. The dance of the p-values
     ----------------------------------------------------------------------- */
  FIG['fig-p-dance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var D = [0, 0.2, 0.5, 0.8], di = 0, n = 20, ps = [];
    var controls = div('fig-controls', container);
    choice(controls, 'True effect', ['None', 'Small (d = 0.2)', 'Medium (0.5)', 'Large (0.8)'], di, function (i) { di = i; ps = []; run(); });
    var sl = FIG.slider(controls, { id: 'pd-n', label: 'Sample size in each group', min: 5, max: 200, step: 1, value: n, onChange: function (v) { n = v; ps = []; run(); } });
    var row = group(controls, 'Actions');
    btn('Run 50 more experiments', row).addEventListener('click', run);
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function run() {
      for (var e = 0; e < 50; e++) {
        var a = [], b = [];
        for (var i = 0; i < n; i++) { a.push(gauss()); b.push(gauss() + D[di]); }
        ps.push(welch(a, b).p);
      }
      draw();
    }
    function draw() {
      var c = C();
      valText(sl, String(n));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 210, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'p-values from repeated experiments');
      var L = 50, R = W - 10, T = 20, B = H - 30, Y = function (p) { return T + (-Math.log10(Math.max(p, 1e-6))) / 6 * (B - T); };
      [1, 0.05, 0.001, 1e-6].forEach(function (p) {
        el('line', { x1: L, y1: Y(p), x2: R, y2: Y(p), stroke: p === 0.05 ? RED : c.border, 'stroke-dasharray': p === 0.05 ? '5 3' : '', 'stroke-width': p === 0.05 ? 1.5 : 1 }, svg);
        txt(svg, L - 5, Y(p) + 4, p === 1e-6 ? '10⁻⁶' : String(p), { anchor: 'end', size: fs(10), fill: p === 0.05 ? RED : c.muted });
      });
      var show = ps.slice(-200), step = (R - L) / Math.max(50, show.length);
      show.forEach(function (p, i) { el('circle', { cx: L + (i + 0.5) * step, cy: Y(p), r: 3.2, fill: p < 0.05 ? RED : c.faint }, svg); });
      txt(svg, (L + R) / 2, H - 8, W < 560 ? 'one dot per experiment' : 'each dot is one experiment (latest ' + show.length + ' shown)', { size: fs(10), fill: c.muted });
      txt(svg, L - 40, 12, 'p-value (log scale; red: below 0.05)', { anchor: 'start', size: fs(10.5), fill: c.muted });
      var sig = ps.filter(function (p) { return p < 0.05; }).length, ps2 = ps.slice().sort(function (x, y) { return x - y; });
      read.innerHTML = '<strong>' + sig + ' of ' + ps.length + '</strong> experiments (' + fmt(ps.length ? sig / ps.length * 100 : 0, 0) + '%) gave p &lt; 0.05. Middle p-value: ' + (ps.length ? pBare(ps2[Math.floor(ps2.length / 2)]) : '–') + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' + (di === 0 ? 'There is no real effect, yet about 5% of experiments come out “significant”, exactly as α = 0.05 promises. With no effect, p-values are spread evenly between 0 and 1.' : 'The effect is real and identical every time, yet the p-value jumps around enormously from one experiment to the next. A single p-value is a noisy measurement, not a fixed property of the effect.') + '</span>';
    }
    run();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Significant but tiny: huge samples
     ----------------------------------------------------------------------- */
  FIG['fig-big-n'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lg = 2, d = 0.03;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'bn-n', label: 'Sample size in each group', min: 1, max: 7, step: 0.05, value: lg, onChange: function (v) { lg = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'bn-d', label: 'True difference (Cohen’s d)', min: 0, max: 0.8, step: 0.01, value: d, onChange: function (v) { d = v; draw(); } });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), n = Math.round(Math.pow(10, lg)), z = d * Math.sqrt(n / 2), p = 2 * (1 - normCdf(z)), delta = 2 * normCdf(d / Math.SQRT2) - 1;
      valText(s1, fmt(n, 0)); valText(s2, fmt(d, 2));
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 150, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'p-value and effect size compared');
      var L = 10, R = W - 10, bw = R - L - 4;
      [[34, W < 560 ? 'p-value (shorter bar = smaller p)' : 'Typical p-value (smaller bar = smaller p)', Math.min(1, (-Math.log10(Math.max(p, 1e-12))) / 12), p < 0.05 ? RED : c.faint, pText(p)], [100, W < 560 ? 'Cliff’s delta (effect size)' : 'Cliff’s delta (how often one group beats the other)', Math.abs(delta), BLUE, 'δ = ' + fmt(delta, 3) + ' (' + cliffLabel(delta) + ')']].forEach(function (r, i) {
        txt(svg, L, r[0] - 10, r[1], { anchor: 'start', size: fs(10.5), fill: c.muted });
        el('rect', { x: L, y: r[0], width: bw, height: 22, fill: c.sunken, rx: 4 }, svg);
        var w = i === 0 ? bw * (1 - r[2]) : bw * r[2];
        el('rect', { x: L, y: r[0], width: Math.max(2, w), height: 22, fill: r[3], rx: 4, opacity: 0.85 }, svg);
        txt(svg, L + 8, r[0] + 16, r[4], { anchor: 'start', size: fs(11), weight: 700, fill: c.ink });
      });
      read.innerHTML = 'With ' + fmt(n, 0) + ' per group and a true difference of d = ' + fmt(d, 2) + ', a typical study gives <strong>' + pText(p) + '</strong>, while Cliff’s delta is <strong>' + fmt(delta, 3) + '</strong>: a randomly chosen member of one group beats one from the other only ' + fmt((delta + 1) / 2 * 100, 1) + '% of the time instead of 50%.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The p-value depends on both the effect and the sample size; the effect size does not grow with more data. With a million users, almost any difference is “significant”. Always ask: how big? (Typical values for normal data.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 7. Cliff's delta explorer
     ----------------------------------------------------------------------- */
  var CD_A = [4.1, 5.0, 3.6, 4.7, 5.4, 4.4, 3.9, 5.1, 4.6, 4.2], CD_B = [5.2, 4.8, 6.1, 5.5, 4.9, 6.4, 5.8, 5.0, 6.0, 5.6];
  FIG['fig-cliffs-delta'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var shift = 0, out = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'cd-s', label: 'Shift group B', min: -2.5, max: 2, step: 0.05, value: shift, onChange: function (v) { shift = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'cd-o', label: 'Make one value in group A an outlier', min: 0, max: 25, step: 0.5, value: out, onChange: function (v) { out = v; draw(); } });
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function draw() {
      var c = C(), a = CD_A.slice(), b = CD_B.map(function (x) { return x + shift; });
      a[4] = CD_A[4] + out;
      valText(s1, (shift >= 0 ? '+' : '') + fmt(shift, 2)); valText(s2, out ? '+' + fmt(out, 1) : 'none');
      var dl = cliff(a, b), pooled = Math.sqrt((sd(a) * sd(a) + sd(b) * sd(b)) / 2), cd = (mean(b) - mean(a)) / pooled;
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, H = narrow ? 420 : 250, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Two groups and the grid of pairwise comparisons');
      // dot plot
      var lw = narrow ? W - 20 : W * 0.5, X0 = 10, vmin = Math.min.apply(null, a.concat(b)) - 0.3, vmax = Math.max.apply(null, a.concat(b)) + 0.3;
      var sc = function (v) { return X0 + (v - vmin) / (vmax - vmin) * lw; };
      [[a, 60, 'A', BLUE], [b, 120, 'B', RED]].forEach(function (g) {
        el('line', { x1: X0, y1: g[1], x2: X0 + lw, y2: g[1], stroke: c.border }, svg);
        g[0].forEach(function (v) { el('circle', { cx: sc(v), cy: g[1], r: 5.5, fill: g[3], opacity: 0.75 }, svg); });
        txt(svg, X0, g[1] - 14, 'group ' + g[2] + ' (mean ' + fmt(mean(g[0]), 2) + ')', { anchor: 'start', size: fs(10.5), fill: g[3], weight: 600 });
      });
      // dominance grid
      var gs = narrow ? Math.min(W - 60, 220) : Math.min(W * 0.36, 200), cell = gs / 10, gx = narrow ? (W - gs) / 2 + 10 : W * 0.58 + 10, gy = narrow ? 190 : 30;
      txt(svg, gx, gy - 8, narrow ? 'B (rows) vs A (columns)' : 'Every B value (rows) vs every A value (columns)', { anchor: 'start', size: fs(10), fill: c.muted });
      for (var i = 0; i < 10; i++) for (var j = 0; j < 10; j++) {
        var s = b[i] > a[j] ? 1 : b[i] < a[j] ? -1 : 0;
        el('rect', { x: gx + j * cell, y: gy + i * cell, width: cell - 1, height: cell - 1, fill: s > 0 ? RED : s < 0 ? BLUE : c.faint, opacity: 0.75 }, svg);
      }
      var wins = 0, losses = 0; for (i = 0; i < 10; i++) for (j = 0; j < 10; j++) { if (b[i] > a[j]) wins++; else if (b[i] < a[j]) losses++; }
      txt(svg, gx, gy + gs + 16, 'red: B bigger (' + wins + ') · blue: A bigger (' + losses + ')', { anchor: 'start', size: fs(10), fill: c.ink2 });
      read.innerHTML = 'Cliff’s delta = (B wins − A wins) ÷ 100 = (' + wins + ' − ' + losses + ') ÷ 100 = <strong>' + fmt(dl, 2) + '</strong> (<strong>' + cliffLabel(dl) + '</strong>). ' +
        'Equivalent probability that a random B beats a random A (Vargha–Delaney A): <strong>' + fmt((dl + 1) / 2, 2) + '</strong>. Cohen’s d = <strong>' + fmt(cd, 2) + '</strong>.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Drag the outlier slider: one extreme value inflates the standard deviation and drags Cohen’s d towards zero (or even flips it), while Cliff’s delta changes by at most a few hundredths, because it only asks which value is bigger. Labels use the widely quoted thresholds of Romano and colleagues (0.147, 0.33, 0.474).</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Many tests at once
     ----------------------------------------------------------------------- */
  FIG['fig-multiple-tests'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var M = 1000, share = 10, eff = 3, alpha = 0.05, tests = [];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'mt-s', label: 'Share of tests where the effect is real', min: 0, max: 50, step: 1, value: share, onChange: function (v) { share = v; gen(); } });
    var s2 = FIG.slider(controls, { id: 'mt-e', label: 'Strength of the real effects (z)', min: 1, max: 5, step: 0.1, value: eff, onChange: function (v) { eff = v; gen(); } });
    var row = group(controls, 'Actions');
    btn('New set of 1,000 tests', row).addEventListener('click', gen);
    var svgWrap = div('', container), tableWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function gen() {
      tests = [];
      var nt = Math.round(M * share / 100);
      for (var i = 0; i < M; i++) { var real = i < nt, z = gauss() + (real ? eff : 0); tests.push({ real: real, p: 1 - normCdf(z) }); }
      draw();
    }
    function draw() {
      var c = C();
      valText(s1, share + '%'); valText(s2, fmt(eff, 1));
      var sorted = tests.slice().sort(function (x, y) { return x.p - y.p; });
      // BH q-values
      var q = new Array(M), run = 1;
      for (var i = M - 1; i >= 0; i--) { run = Math.min(run, sorted[i].p * M / (i + 1)); q[i] = run; }
      var k = 0; for (i = 0; i < M; i++) if (q[i] <= alpha) k = i + 1;
      var holm = 0; for (i = 0; i < M; i++) { if (sorted[i].p <= alpha / (M - i)) holm = i + 1; else break; }
      function stats(rejectN, rule) {
        var tp = 0, fp = 0;
        sorted.forEach(function (t, j) { var r = rule ? rule(t, j) : j < rejectN; if (r) { if (t.real) tp++; else fp++; } });
        return { n: tp + fp, tp: tp, fp: fp };
      }
      var rows = [
        ['None (p < 0.05)', stats(0, function (t) { return t.p < alpha; })],
        ['Bonferroni', stats(0, function (t) { return t.p < alpha / M; })],
        ['Holm', stats(holm)],
        ['Benjamini–Hochberg (q < 0.05)', stats(k)]
      ];
      var nReal = tests.filter(function (t) { return t.real; }).length;
      // plot: sorted p-values (first 200) with BH line
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 200, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Smallest p-values with the Benjamini–Hochberg line');
      var L = 44, R = W - 10, T = 20, B = H - 30, show = 200, pmax = 0.06, X = function (r) { return L + r / show * (R - L); }, Y = function (p) { return B - Math.min(p, pmax) / pmax * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      el('line', { x1: X(0), y1: Y(0), x2: X(show), y2: Y(alpha * show / M), stroke: GREEN, 'stroke-width': 2 }, svg);
      el('line', { x1: L, y1: Y(alpha), x2: R, y2: Y(alpha), stroke: RED, 'stroke-dasharray': '4 3' }, svg);
      for (i = 0; i < show; i++) el('circle', { cx: X(i + 0.5), cy: Y(sorted[i].p), r: 2.4, fill: sorted[i].real ? BLUE : c.muted, opacity: sorted[i].p > pmax ? 0 : 0.85 }, svg);
      txt(svg, L - 5, Y(0.05) + 4, '0.05', { anchor: 'end', size: fs(10), fill: RED });
      txt(svg, L - 5, Y(0) + 4, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      txt(svg, L, 12, W < 560 ? '200 smallest p-values (blue: real)' : 'The 200 smallest p-values, in order (blue: real effect, grey: no effect)', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, R, Y(alpha * show / M) - 6, 'Benjamini–Hochberg line', { anchor: 'end', size: fs(10), fill: GREEN });
      txt(svg, (L + R) / 2, H - 6, 'rank of p-value (1 = smallest)', { size: fs(10), fill: c.muted });
      var th = 'padding:0.35rem 0.5rem;text-align:left;border-bottom:2px solid var(--border);', td = 'padding:0.35rem 0.5rem;border-bottom:1px solid var(--border);';
      tableWrap.innerHTML = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-sans);font-size:0.86rem;margin-top:0.6rem;"><thead><tr><th style="' + th + '">Correction</th><th style="' + th + '">Found</th><th style="' + th + '">Real</th><th style="' + th + '">False</th><th style="' + th + '">% false</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td style="' + td + '">' + r[0] + '</td><td style="' + td + '">' + r[1].n + '</td><td style="' + td + 'color:' + BLUE + ';">' + r[1].tp + '</td><td style="' + td + 'color:' + RED + ';">' + r[1].fp + '</td><td style="' + td + '">' + (r[1].n ? fmt(r[1].fp / r[1].n * 100, 0) + '%' : '–') + '</td></tr>'; }).join('') + '</tbody></table></div>';
      read.innerHTML = 'Of 1,000 tests, <strong>' + nReal + '</strong> have a real effect. The 10th smallest p-value is ' + pBare(sorted[9].p) + ', and its q-value is <strong>' + pBare(q[9]) + '</strong>: calling it and everything with a smaller p-value a discovery would mean an expected false discovery rate of about ' + fmt(q[9] * 100, 1) + '%.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">With no correction, dozens of false alarms appear even when nothing is real (set the share to 0%). Bonferroni and Holm make any false alarm unlikely but miss many real effects. Benjamini–Hochberg accepts that about 5% of its discoveries may be false, in exchange for finding many more real ones. (One-sided z-tests on simulated data; q-values by the Benjamini–Hochberg method.)</span>';
    }
    gen();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 9. Comparing two ML models over seeds
     ----------------------------------------------------------------------- */
  FIG['fig-model-compare'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var diff = 0.5, seedVar = 1.0, noise = 0.25, nS = 10, base = [], eA = [], eB = [];
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'mc-d', label: 'True advantage of model B (accuracy points)', min: 0, max: 2, step: 0.05, value: diff, onChange: function (v) { diff = v; draw(); } });
    var s2 = FIG.slider(controls, { id: 'mc-s', label: 'How much the score depends on the seed/split', min: 0.1, max: 3, step: 0.05, value: seedVar, onChange: function (v) { seedVar = v; gen(); } });
    var s3 = FIG.slider(controls, { id: 'mc-n', label: 'Number of seeds (or folds)', min: 3, max: 30, step: 1, value: nS, onChange: function (v) { nS = v; gen(); } });
    var row = group(controls, 'Actions');
    btn('New seeds', row).addEventListener('click', gen);
    var svgWrap = div('', container), read = div('', container);
    read.style.cssText = READ_CSS;
    function gen() { base = []; eA = []; eB = []; for (var i = 0; i < nS; i++) { base.push(gauss() * seedVar); eA.push(gauss() * noise); eB.push(gauss() * noise); } draw(); }
    function boot(d) {
      var ms = [];
      for (var r = 0; r < 2000; r++) { var s = 0; for (var i = 0; i < d.length; i++) s += d[Math.floor(Math.random() * d.length)]; ms.push(s / d.length); }
      ms.sort(function (x, y) { return x - y; });
      return [ms[49], ms[1949]];
    }
    function draw() {
      var c = C();
      valText(s1, fmt(diff, 2)); valText(s2, fmt(seedVar, 2)); valText(s3, String(nS));
      var a = base.map(function (b, i) { return 80 + b + eA[i]; }), b = base.map(function (x, i) { return 80 + x + diff + eB[i]; });
      var dd = b.map(function (x, i) { return x - a[i]; }), w = welch(a, b), pt = pairedT(a, b), wx = wilcoxon(a, b), ci = boot(dd), dl = cliff(a, b), wins = dd.filter(function (x) { return x > 0; }).length;
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 220, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Accuracy of two models on the same seeds');
      var lo = Math.min.apply(null, a.concat(b)) - 0.3, hi = Math.max.apply(null, a.concat(b)) + 0.3, L = 50, R = W - 14, T = 24, B = H - 28;
      var Y = function (v) { return B - (v - lo) / (hi - lo) * (B - T); }, xA = L + (R - L) * 0.3, xB = L + (R - L) * 0.7;
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      [lo + 0.3, (lo + hi) / 2, hi - 0.3].forEach(function (v) { txt(svg, L - 5, Y(v) + 4, fmt(v, 1), { anchor: 'end', size: fs(10), fill: c.muted }); });
      for (var i = 0; i < nS; i++) {
        el('line', { x1: xA, y1: Y(a[i]), x2: xB, y2: Y(b[i]), stroke: dd[i] > 0 ? RED : BLUE, 'stroke-width': 1.2, opacity: 0.55 }, svg);
        el('circle', { cx: xA, cy: Y(a[i]), r: 4, fill: BLUE }, svg);
        el('circle', { cx: xB, cy: Y(b[i]), r: 4, fill: RED }, svg);
      }
      txt(svg, xA, H - 8, 'model A', { size: fs(11), fill: BLUE, weight: 600 });
      txt(svg, xB, H - 8, 'model B', { size: fs(11), fill: RED, weight: 600 });
      txt(svg, L, 13, W < 560 ? 'accuracy (%) per seed' : 'accuracy (%) on each seed; lines join the same seed', { anchor: 'start', size: fs(10), fill: c.muted });
      var th = 'padding:0.3rem 0.5rem;text-align:left;border-bottom:2px solid var(--border);', td = 'padding:0.3rem 0.5rem;border-bottom:1px solid var(--border);';
      read.innerHTML = 'Mean difference (B − A): <strong>' + fmt(mean(dd), 2) + ' points</strong>; B wins on <strong>' + wins + ' of ' + nS + '</strong> seeds. 95% bootstrap confidence interval for the mean difference: <strong>[' + fmt(ci[0], 2) + ', ' + fmt(ci[1], 2) + ']</strong>.' +
        '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.86rem;margin:0.5rem 0;"><thead><tr><th style="' + th + '">Test</th><th style="' + th + '">Treats seeds as…</th><th style="' + th + '">p-value</th></tr></thead><tbody>' +
        '<tr><td style="' + td + '">Welch t-test (unpaired)</td><td style="' + td + '">unrelated</td><td style="' + td + '">' + pBare(w.p) + '</td></tr>' +
        '<tr><td style="' + td + '">Paired t-test</td><td style="' + td + '">matched pairs</td><td style="' + td + '"><strong>' + pBare(pt.p) + '</strong></td></tr>' +
        '<tr><td style="' + td + '">Wilcoxon signed-rank (paired)</td><td style="' + td + '">matched pairs, ranks only</td><td style="' + td + '"><strong>' + pBare(wx.p) + '</strong></td></tr></tbody></table></div>' +
        'Cliff’s delta between the two sets of scores: ' + fmt(dl, 2) + ' (' + cliffLabel(dl) + ').' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">When some seeds or splits are simply easier than others, both models go up and down together. An unpaired test mistakes that shared variation for noise and misses the difference; a paired test compares each model on the same seed and sees it clearly. Note also that Cliff’s delta between the score sets is diluted by the seed variation; the paired win rate tells the clearer story. Synthetic scores.</span>';
    }
    gen();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 10. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-nhst'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'What does a p-value of 0.03 mean?', options: ['There is a 3% chance the null hypothesis is true', 'If the null hypothesis were true, data at least this extreme would occur about 3% of the time', 'The effect is 3% large', 'There is a 97% chance the result will replicate'], answer: 1, explanation: 'A p-value is calculated assuming the null is true; it is not the probability that the null is true.' },
      { question: 'A study finds p = 0.4. What can you conclude?', options: ['The null hypothesis is true', 'There is no effect', 'The data are not surprising under the null; the effect may be absent or the study too small to detect it', 'The study was a failure'], answer: 2, explanation: 'Absence of evidence is not evidence of absence. Look at the confidence interval and the power.' },
      { question: 'What is a Type II error?', options: ['A false alarm', 'Missing a real effect', 'Using the wrong test', 'A typing mistake in the data'], answer: 1, explanation: 'Its probability is β; power is 1 − β.' },
      { question: 'Which most directly increases the power of a study?', options: ['A smaller α', 'More data', 'Using a one-sided test after seeing the data', 'Rounding the results'], answer: 1, explanation: 'Larger samples shrink the noise, making real effects easier to detect.' },
      { question: 'Cliff’s delta of 0.6 between groups B and A means…', options: ['B’s mean is 60% higher', 'Picking one value from each, B is larger considerably more often than A (80% vs 20% if no ties)', 'p = 0.6', 'The groups overlap by 60%'], answer: 1, explanation: 'δ = P(B > A) − P(B < A); with no ties, P(B > A) = (1 + δ)/2 = 0.8.' },
      { question: 'Why is Cliff’s delta robust to outliers?', options: ['It ignores half the data', 'It only uses which of two values is bigger, not by how much', 'It uses the mean', 'It removes outliers automatically'], answer: 1, explanation: 'An extreme value counts the same as a value just above the others.' },
      { question: 'You run 20 independent tests on pure noise at α = 0.05. How many “significant” results do you expect?', options: ['0', 'About 1', 'About 5', '20'], answer: 1, explanation: '20 × 0.05 = 1 false alarm on average.' },
      { question: 'What does a q-value of 0.04 for a gene mean?', options: ['A 4% chance this gene is a false positive, exactly', 'If you call this gene and all with smaller p-values discoveries, about 4% of those discoveries are expected to be false', 'The gene has a 4% effect', 'The same as p = 0.04'], answer: 1, explanation: 'The q-value is the smallest false discovery rate at which the test would be called significant.' },
      { question: 'Two models are evaluated on the same 10 random seeds. Which test fits best?', options: ['An unpaired t-test', 'A paired test, such as the paired t-test or Wilcoxon signed-rank', 'A chi-square test on the means', 'No test is possible'], answer: 1, explanation: 'Scores on the same seed are linked; pairing removes the shared seed-to-seed variation.' },
      { question: 'Two classifiers are compared on the same test set. Which test looks at the examples where they disagree?', options: ['McNemar’s test', 'Bonferroni', 'Cohen’s d', 'The bootstrap'], answer: 0, explanation: 'McNemar’s test compares the counts of examples that only one of the classifiers gets right.' },
      { question: 'A team tries 200 hyperparameter settings and reports the best test-set score. What is the main danger?', options: ['The test set becomes too large', 'Overfitting to the test set: the best of many noisy scores is optimistic', 'The model gets slower', 'None'], answer: 1, explanation: 'Selecting the maximum of many noisy measurements is a hidden multiple-comparisons problem.' },
      { question: 'With 1,000,000 users per group, an A/B test gives p = 10⁻⁸. What should you check next?', options: ['Nothing: the effect is huge', 'The effect size and its confidence interval: is the difference large enough to matter?', 'Whether p is below 10⁻⁹', 'The colour of the button'], answer: 1, explanation: 'With huge samples, tiny and unimportant differences become highly significant.' }
    ]);
  };
})();
