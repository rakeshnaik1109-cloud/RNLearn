/* ==========================================================================
   RNLearn — Is 99% Accuracy Good? A Complete Guide to Model Metrics
   Figures:
     1. fig-metrics-timeline   The story at a glance (clickable timeline)
     2. fig-confusion-calc     The confusion-matrix calculator
     3. fig-imbalance          The imbalance trap
     4. fig-base-rate          The base-rate trap, with 1,000 people
     5. fig-metrics-disagree   When metrics disagree
     6. fig-threshold-roc      Threshold, ROC and precision-recall curves
     7. fig-cost-threshold     Choosing a threshold by cost
     8. fig-multiclass         Micro, macro and weighted averages
     9. fig-calibration        Calibration and the reliability diagram
    10. fig-regression         The regression metrics lab
    11. fig-quiz-metrics       Test yourself
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
    { name: 'Errors and forecasts', color: '#b45309' },
    { name: 'Signals, agreement and retrieval', color: '#1d4ed8' },
    { name: 'Machine-learning practice', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1805', icon: '📉', era: 0, sec: 20, title: 'Least squares', text: 'Adrien-Marie Legendre publishes the method of least squares: choose the line that makes the sum of squared errors as small as possible.' },
    { year: '1886', icon: '📏', era: 0, sec: 20, title: '“Regression”', text: 'Francis Galton studies the heights of parents and children and names the tendency of extreme values to move towards the average “regression”.' },
    { year: '1940s', icon: '📡', era: 1, sec: 13, title: 'Radar and the ROC', text: 'Wartime radar operators must decide whether a blip is an aircraft or noise; the trade-off between hits and false alarms leads to the receiver operating characteristic.' },
    { year: '1950', icon: '🌦️', era: 0, sec: 17, title: 'The Brier score', text: 'Meteorologist Glenn Brier proposes scoring probability forecasts by their squared error.' },
    { year: '1950', icon: '🩺', era: 0, sec: 7, title: 'Youden’s index', text: 'William Youden proposes sensitivity + specificity − 1 as a single index for rating diagnostic tests.' },
    { year: '1954', icon: '📶', era: 1, sec: 13, title: 'Signal detection theory', text: 'Peterson, Birdsall and Fox publish the theory of signal detectability, the mathematics behind ROC curves.' },
    { year: '1960', icon: '🤝', era: 1, sec: 10, title: 'Cohen’s kappa', text: 'Jacob Cohen introduces kappa, a measure of agreement corrected for chance.' },
    { year: '1966', icon: '🧠', era: 1, sec: 13, title: 'ROC in psychology', text: 'Green and Swets bring signal detection theory and ROC curves to psychology; medicine soon follows.' },
    { year: '1975', icon: '🧬', era: 1, sec: 9, title: 'Matthews correlation', text: 'Biochemist Brian Matthews uses a correlation coefficient to judge predictions of protein structure: today’s MCC.' },
    { year: '1979', icon: '📚', era: 1, sec: 8, title: 'The F-measure', text: 'C. J. van Rijsbergen’s book on information retrieval sets out the effectiveness measure behind the F-score.' },
    { year: '1982', icon: '📈', era: 1, sec: 13, title: 'AUC as a probability', text: 'Hanley and McNeil show that the area under the ROC curve is the probability that a random positive is ranked above a random negative.' },
    { year: '1988', icon: '⚖️', era: 2, sec: 18, title: 'Comparing AUCs', text: 'DeLong and colleagues publish a widely used test for comparing two areas under correlated ROC curves.' },
    { year: '2006', icon: '📊', era: 2, sec: 14, title: 'ROC and PR', text: 'Fawcett’s tutorial on ROC analysis, and Davis and Goadrich’s analysis of precision–recall curves, shape machine-learning practice.' },
    { year: '2017', icon: '🎯', era: 2, sec: 17, title: 'Overconfident networks', text: 'Guo and colleagues show that modern deep neural networks are often poorly calibrated: overconfident in their probabilities.' },
    { year: '2020', icon: '🏆', era: 2, sec: 9, title: 'The case for MCC', text: 'Chicco and Jurman argue that MCC is more informative than F1 and accuracy for binary classification.' }
  ];
  FIG['fig-metrics-timeline'] = function (figEl) {
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
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1805 to 2020');
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
  var TPC = '#16a34a', FNC = '#dc2626', FPC = '#f59e0b', TNC = '#64748b', BLUE = '#2563eb', RED = '#dc2626';
  function valText(sl, s) { var v = sl.element.parentNode.querySelector('.fig-control-value'); if (v) v.textContent = s; sl.element.setAttribute('aria-valuetext', s); }
  function choice(parent, label, items, initial, onPick) {
    var row = group(parent, label), bs = [];
    items.forEach(function (it, i) { var b = btn(it, row); bs.push(b); b.addEventListener('click', function () { set(i); onPick(i); }); });
    function set(i) { bs.forEach(function (x, j) { x.classList.toggle('active', j === i); x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    if (initial >= 0) set(initial);
    row.set = set;
    return row;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function phi(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); }
  // All the binary metrics from a confusion matrix (NaN where undefined)
  function binMetrics(tp, fp, fn, tn) {
    var n = tp + fp + fn + tn, P = tp + fn, N = fp + tn, PP = tp + fp, PN = fn + tn;
    var sens = P ? tp / P : NaN, spec = N ? tn / N : NaN, prec = PP ? tp / PP : NaN, npv = PN ? tn / PN : NaN;
    var f1 = (2 * tp + fp + fn) ? 2 * tp / (2 * tp + fp + fn) : NaN;
    var f2 = (5 * tp + 4 * fn + fp) ? 5 * tp / (5 * tp + 4 * fn + fp) : NaN;
    var den = Math.sqrt(PP * P * N * PN), mcc = den ? (tp * tn - fp * fn) / den : 0;
    var po = (tp + tn) / n, pe = (PP * P + PN * N) / (n * n), kappa = pe < 1 ? (po - pe) / (1 - pe) : NaN;
    return { n: n, prev: P / n, acc: po, bacc: (sens + spec) / 2, sens: sens, spec: spec, prec: prec, npv: npv, f1: f1, f2: f2, mcc: mcc, kappa: kappa, youden: sens + spec - 1, mccDefined: den > 0 };
  }
  function f3(x, d) { return isNaN(x) ? 'undefined' : fmt(x, d === undefined ? 3 : d); }
  function pct(x, d) { return isNaN(x) ? 'undefined' : fmt(x * 100, d === undefined ? 1 : d) + '%'; }
  function cmGrid(tp, fp, fn, tn, labels) {
    labels = labels || ['Positive', 'Negative'];
    var cell = function (v, name, col) { return '<td style="padding:0.55rem 0.6rem;text-align:center;background:' + col + '22;border:1px solid var(--border);"><div style="font-size:1.15rem;font-weight:700;color:var(--ink);">' + fmt(v, 0) + '</div><div style="font-size:0.78rem;color:' + col + ';font-weight:600;">' + name + '</div></td>'; };
    var th = 'padding:0.35rem 0.5rem;font-size:0.8rem;color:var(--ink-muted);font-weight:600;';
    return '<table style="border-collapse:collapse;font-family:var(--font-sans);margin:0.4rem auto;"><tr><td></td><td colspan="2" style="' + th + 'text-align:center;">Predicted</td></tr>' +
      '<tr><td></td><td style="' + th + 'text-align:center;">' + labels[0] + '</td><td style="' + th + 'text-align:center;">' + labels[1] + '</td></tr>' +
      '<tr><td style="' + th + 'text-align:right;">Actual ' + labels[0].toLowerCase() + '</td>' + cell(tp, 'True positive', TPC) + cell(fn, 'False negative', FNC) + '</tr>' +
      '<tr><td style="' + th + 'text-align:right;">Actual ' + labels[1].toLowerCase() + '</td>' + cell(fp, 'False positive', FPC) + cell(tn, 'True negative', TNC) + '</tr></table>';
  }

  /* -----------------------------------------------------------------------
     Figure 2. The confusion-matrix calculator
     ----------------------------------------------------------------------- */
  var CM_PRESETS = [
    { n: 'Spam filter', v: [90, 10, 30, 870] },
    { n: 'Disease screening', v: [99, 495, 1, 9405] },
    { n: '“Always healthy”', v: [0, 0, 100, 9900] },
    { n: '“Always positive”', v: [950, 50, 0, 0] }
  ];
  FIG['fig-confusion-calc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var v = CM_PRESETS[0].v.slice(), sl = [];
    var controls = div('fig-controls', container);
    var pr = choice(controls, 'Examples', CM_PRESETS.map(function (p) { return p.n; }), 0, function (i) { v = CM_PRESETS[i].v.slice(); sl.forEach(function (s, k) { s.element.max = Math.max(+s.element.max, v[k]); s.setValue(v[k]); }); draw(); });
    [['True positives (TP)', 500], ['False positives (FP)', 1000], ['False negatives (FN)', 500], ['True negatives (TN)', 10000]].forEach(function (d, k) {
      sl.push(FIG.slider(controls, { id: 'cc-' + k, label: d[0], min: 0, max: d[1], step: 1, value: v[k], onChange: function (x) { v[k] = x; pr.set(-1); draw(); } }));
    });
    var gridWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var m = binMetrics(v[0], v[1], v[2], v[3]);
      sl.forEach(function (s, k) { valText(s, fmt(v[k], 0)); });
      gridWrap.innerHTML = cmGrid(v[0], v[1], v[2], v[3]);
      var rows = [
        ['Accuracy', '(TP + TN) / all', pct(m.acc)],
        ['Sensitivity (recall, TPR)', 'TP / (TP + FN)', pct(m.sens)],
        ['Specificity (TNR)', 'TN / (TN + FP)', pct(m.spec)],
        ['Precision (PPV)', 'TP / (TP + FP)', pct(m.prec)],
        ['Negative predictive value', 'TN / (TN + FN)', pct(m.npv)],
        ['Balanced accuracy', '(sensitivity + specificity) / 2', pct(m.bacc)],
        ['F1 score', '2TP / (2TP + FP + FN)', f3(m.f1)],
        ['F2 score', 'recall weighted 2× as much as precision', f3(m.f2)],
        ['MCC', '(TP·TN − FP·FN) / √(…)', m.mccDefined ? f3(m.mcc) : '0 (undefined)'],
        ['Cohen’s kappa', '(observed − chance agreement) / (1 − chance)', f3(m.kappa)]
      ];
      var td = 'padding:0.3rem 0.5rem;border-bottom:1px solid var(--border);';
      out.innerHTML = 'Total: ' + fmt(m.n, 0) + ' cases, of which ' + pct(m.prev) + ' are actually positive.' +
        '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.86rem;margin-top:0.4rem;"><tbody>' +
        rows.map(function (r) { return '<tr><td style="' + td + 'font-weight:600;color:var(--ink);">' + r[0] + '</td><td style="' + td + 'color:var(--ink-muted);">' + r[1] + '</td><td style="' + td + 'text-align:right;font-weight:700;color:var(--ink);white-space:nowrap;">' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 3. The imbalance trap
     ----------------------------------------------------------------------- */
  FIG['fig-imbalance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var prev = 1, N = 10000;
    var controls = div('fig-controls', container);
    var sl = FIG.slider(controls, { id: 'im-p', label: 'Share of cases that are positive (prevalence)', min: 0.5, max: 50, step: 0.5, value: prev, onChange: function (x) { prev = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), P = Math.round(N * prev / 100), Nn = N - P;
      valText(sl, fmt(prev, 1) + '%');
      var lazy = binMetrics(0, 0, P, Nn), real = binMetrics(Math.round(0.8 * P), Math.round(0.1 * Nn), P - Math.round(0.8 * P), Nn - Math.round(0.1 * Nn));
      var names = [['Accuracy', 'acc', 'Acc.'], ['Balanced accuracy', 'bacc', 'Bal. acc.'], ['F1', 'f1', 'F1'], ['MCC', 'mcc', 'MCC']];
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 230, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Metrics of a useless and a useful model');
      var L = 10, R = W - 10, gw = (R - L) / names.length, bh = 120, B = 170;
      names.forEach(function (nm, i) {
        var x0 = L + i * gw, vals = [lazy[nm[1]], real[nm[1]]];
        txt(svg, x0 + gw / 2, B + 20, W < 560 ? nm[2] : nm[0], { size: fs(10.5), fill: c.ink2, weight: 600 });
        vals.forEach(function (val, k) {
          var vv = isNaN(val) ? 0 : Math.max(0, val), x = x0 + gw * 0.18 + k * gw * 0.34, w = gw * 0.28;
          el('rect', { x: x, y: B - vv * bh, width: w, height: Math.max(1, vv * bh), fill: k ? TPC : TNC, rx: 3 }, svg);
          txt(svg, x + w / 2, B - vv * bh - 5, isNaN(val) ? '–' : fmt(val, 2), { size: fs(10), fill: c.ink2 });
        });
        el('line', { x1: x0 + 4, y1: B, x2: x0 + gw - 4, y2: B, stroke: c.border }, svg);
      });
      txt(svg, L, 16, 'Grey: always predicts “negative”', { anchor: 'start', size: fs(10.5), fill: TNC, weight: 600 });
      txt(svg, L, 32, 'Green: real model (80% sensitivity, 90% specificity)', { anchor: 'start', size: fs(10.5), fill: TPC, weight: 600 });
      out.innerHTML = 'With ' + fmt(prev, 1) + '% positives, the model that <em>always says negative</em> has accuracy <strong>' + pct(lazy.acc) + '</strong>, but balanced accuracy 50%, F1 0 and MCC 0. The real model has accuracy ' + pct(real.acc) + ', precision ' + pct(real.prec) + ' and MCC ' + f3(real.mcc, 2) + '.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">The rarer the positive class, the better a useless model looks on accuracy. Balanced accuracy and MCC stay honest. Notice also that the real model’s precision and F1 fall as positives become rarer, even though its sensitivity and specificity never change.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. The base-rate trap: 1,000 people
     ----------------------------------------------------------------------- */
  FIG['fig-base-rate'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var prev = 1, sens = 99, spec = 95;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'br-p', label: 'How many people have the disease (prevalence)', min: 0.1, max: 50, step: 0.1, value: prev, onChange: function (x) { prev = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'br-se', label: 'Sensitivity of the test', min: 50, max: 100, step: 0.5, value: sens, onChange: function (x) { sens = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'br-sp', label: 'Specificity of the test', min: 50, max: 100, step: 0.5, value: spec, onChange: function (x) { spec = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), N = 10000, P = N * prev / 100, tp = P * sens / 100, fn = P - tp, fp = (N - P) * (1 - spec / 100), tn = N - P - fp;
      valText(s1, fmt(prev, 1) + '%'); valText(s2, fmt(sens, 1) + '%'); valText(s3, fmt(spec, 1) + '%');
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, cols = narrow ? 25 : 50, rows = 1000 / cols;
      var cell = (W - 20) / cols, H = rows * cell + 46, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, '1,000 people tested');
      // scale counts to 1,000 people, rounded
      var k = 1000 / N, a = Math.round(tp * k), b = Math.round(fn * k), d = Math.round(fp * k), e = 1000 - a - b - d;
      var cats = [[a, TPC, true], [b, FNC, false], [d, FPC, true], [e, TNC, false]], idx = 0;
      cats.forEach(function (ct) {
        for (var i = 0; i < ct[0]; i++, idx++) {
          var x = 10 + (idx % cols) * cell + cell / 2, y = 36 + Math.floor(idx / cols) * cell + cell / 2;
          el('circle', { cx: x, cy: y, r: cell * 0.36, fill: ct[2] ? ct[1] : 'none', stroke: ct[1], 'stroke-width': ct[2] ? 0 : 1.2, opacity: ct[1] === TNC ? 0.45 : 1 }, svg);
        }
      });
      var lg = [['sick, test +', TPC, true], ['sick, test −', FNC, false], ['healthy, test +', FPC, true], ['healthy, test −', TNC, false]], lx = 10;
      lg.forEach(function (l, i) {
        var x = narrow ? 10 + (i % 2) * (W / 2) : lx, y = narrow ? 12 + Math.floor(i / 2) * 14 : 16;
        el('circle', { cx: x + 5, cy: y - 4, r: 4.5, fill: l[2] ? l[1] : 'none', stroke: l[1] }, svg);
        txt(svg, x + 14, y, l[0], { anchor: 'start', size: fs(10), fill: c.ink2 });
        lx += (W - 20) / 4;
      });
      var ppv = tp / (tp + fp);
      out.innerHTML = 'Out of 1,000 people tested, about <strong>' + fmt(a + d, 0) + '</strong> test positive. Only <strong>' + fmt(a, 0) + '</strong> of them are actually sick, so a positive result means a <strong>' + pct(ppv, 1) + '</strong> chance of disease (the precision, or positive predictive value).' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Filled dots tested positive. When a disease is rare, even a small false-positive rate among the many healthy people produces more false alarms than true cases. Raise the prevalence, or the specificity, and watch the green share grow.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 5. Threshold, ROC and PR curves
     ----------------------------------------------------------------------- */
  FIG['fig-threshold-roc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var d = 1.5, prev = 50, t = 0.75, pairs = { n: 0, win: 0 };
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'tr-t', label: 'Decision threshold', min: -3, max: 6, step: 0.05, value: t, onChange: function (x) { t = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'tr-d', label: 'How well the model separates the classes', min: 0, max: 4, step: 0.05, value: d, onChange: function (x) { d = x; pairs = { n: 0, win: 0 }; draw(); } });
    var s3 = FIG.slider(controls, { id: 'tr-p', label: 'Share of positives (prevalence)', min: 1, max: 50, step: 1, value: prev, onChange: function (x) { prev = x; draw(); } });
    var row = group(controls, 'The meaning of AUC');
    btn('Draw 100 random positive–negative pairs', row).addEventListener('click', function () { for (var i = 0; i < 100; i++) { pairs.n++; if (gauss() + d > gauss()) pairs.win++; } draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function rates(th) { return { tpr: 1 - Phi(th - d), fpr: 1 - Phi(th) }; }
    function precAt(th) { var r = rates(th), pi = prev / 100, num = pi * r.tpr, den = num + (1 - pi) * r.fpr; return den > 0 ? num / den : 1; }
    function draw() {
      var c = C(), pi = prev / 100, r = rates(t), prec = precAt(t), auc = Phi(d / Math.SQRT2);
      valText(s1, fmt(t, 2)); valText(s2, 'd = ' + fmt(d, 2)); valText(s3, prev + '%');
      // average precision by integrating precision over recall
      var ap = 0, lastR = 0;
      for (var th = 10; th >= -8; th -= 0.02) { var rr = rates(th); ap += (rr.tpr - lastR) * precAt(th); lastR = rr.tpr; }
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), narrow = W < 560, fs = scaler(svgWrap, 360);
      var pwPre = narrow ? (W - 50) / 2 : 150, H = (narrow ? 150 : 120) + 40 + pwPre + 26;
      var svg = FIG.createSVG(svgWrap, W, H, 'Score distributions with ROC and precision-recall curves');
      // score distributions
      var L = 10, Rr = W - 10, T = 26, B = narrow ? 150 : 120, lo = -3.5, hi = Math.max(5, d + 3.5);
      var X = function (z) { return L + (z - lo) / (hi - lo) * (Rr - L); }, mx = Math.max(pi, 1 - pi) * 0.4, Y = function (y) { return B - y / mx * (B - T); };
      [[0, 1 - pi, TNC, 'negatives'], [d, pi, TPC, 'positives']].forEach(function (s) {
        var path = 'M' + X(Math.max(lo, t)) + ' ' + B, z;
        for (z = Math.max(lo, t); z <= hi; z += 0.05) path += ' L' + X(z).toFixed(1) + ' ' + Y(s[1] * phi(z - s[0])).toFixed(1);
        el('path', { d: path + ' L' + X(hi) + ' ' + B + ' Z', fill: s[2] === TPC ? TPC : FPC, opacity: 0.25 }, svg);
        var line = ''; for (z = lo; z <= hi; z += 0.05) line += (line ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(s[1] * phi(z - s[0])).toFixed(1);
        el('path', { d: line, fill: 'none', stroke: s[2], 'stroke-width': 2 }, svg);
      });
      el('line', { x1: X(t), y1: T - 6, x2: X(t), y2: B, stroke: c.ink, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
      el('line', { x1: L, y1: B, x2: Rr, y2: B, stroke: c.border }, svg);
      txt(svg, L, 14, narrow ? 'Scores: grey negatives, green positives' : 'Model scores: grey = negatives, green = positives; right of the line = “predict positive”', { anchor: 'start', size: fs(10), fill: c.muted });
      // ROC and PR panels
      var pw = narrow ? (W - 50) / 2 : 150, top = B + 40, px1 = narrow ? 30 : W * 0.5 - pw - 20, px2 = narrow ? px1 + pw + 20 : W * 0.5 + 40;
      if (!narrow) { px1 = W / 2 - pw - 30; px2 = W / 2 + 30; }
      [[px1, (narrow ? 'ROC, AUC ' : 'ROC curve (AUC ') + fmt(auc, 3) + (narrow ? '' : ')'), 'false positive rate', 'true positive rate'], [px2, (narrow ? 'PR, AP ' : 'Precision–recall (AP ') + fmt(ap, 3) + (narrow ? '' : ')'), 'recall', 'precision']].forEach(function (pn, k) {
        var x0 = pn[0], y0 = top, xs = function (v) { return x0 + v * pw; }, ys = function (v) { return y0 + pw - v * pw; };
        el('rect', { x: x0, y: y0, width: pw, height: pw, fill: 'none', stroke: c.border }, svg);
        txt(svg, x0, y0 - 8, pn[1], { anchor: 'start', size: fs(10), fill: c.ink2, weight: 600 });
        txt(svg, x0 + pw / 2, y0 + pw + 14, pn[2], { size: fs(9.5), fill: c.muted });
        if (k === 0) el('line', { x1: xs(0), y1: ys(0), x2: xs(1), y2: ys(1), stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
        else el('line', { x1: xs(0), y1: ys(pi), x2: xs(1), y2: ys(pi), stroke: c.faint, 'stroke-dasharray': '3 3' }, svg);
        var path = '';
        for (var th = 8; th >= -6; th -= 0.05) { var rr = rates(th), xv = k ? rr.tpr : rr.fpr, yv = k ? precAt(th) : rr.tpr; path += (path ? 'L' : 'M') + xs(xv).toFixed(1) + ' ' + ys(yv).toFixed(1); }
        el('path', { d: path, fill: 'none', stroke: BLUE, 'stroke-width': 2 }, svg);
        el('circle', { cx: xs(k ? r.tpr : r.fpr), cy: ys(k ? prec : r.tpr), r: 5.5, fill: RED, stroke: c.surface, 'stroke-width': 2 }, svg);
      });
      var n = 1000, tp = n * pi * r.tpr, fp = n * (1 - pi) * r.fpr;
      out.innerHTML = 'At this threshold: sensitivity <strong>' + pct(r.tpr) + '</strong>, false positive rate <strong>' + pct(r.fpr) + '</strong>, precision <strong>' + pct(prec) + '</strong>. Per 1,000 cases: ' + fmt(tp, 0) + ' true positives and ' + fmt(fp, 0) + ' false positives.' +
        (pairs.n ? '<br>Random pairs so far: in <strong>' + pairs.win + ' of ' + pairs.n + '</strong> (' + pct(pairs.win / pairs.n) + ') the positive outscored the negative. The AUC is ' + fmt(auc, 3) + '.' : '') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Moving the threshold moves the red dot along both curves; the curves themselves depend only on how well the scores separate the classes. Now lower the prevalence: the ROC curve and AUC do not change at all, but the precision–recall curve sinks, because the same false positive rate now swamps the few positives. Dashed lines show a model that guesses at random.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. When metrics disagree
     ----------------------------------------------------------------------- */
  var PAIRS = [
    { n: 'Rare disease', a: 'Cautious model', b: 'Alert model', A: [5, 0, 95, 9900], B: [80, 300, 20, 9600], note: 'With 1% positives, the cautious model almost never says “positive”. Accuracy prefers it; balanced accuracy, F1 and MCC all prefer the alert model, which finds 80 of the 100 cases.' },
    { n: 'Mostly positive data', a: '“Always positive”', b: 'Real model', A: [950, 50, 0, 0], B: [900, 10, 50, 40], note: 'Here 95% of cases are positive. A model that says “positive” to everything gets a higher F1 than a genuinely useful model, because F1 never looks at true negatives. MCC (0 versus 0.57) and balanced accuracy expose it.' },
    { n: 'Precision vs recall', a: 'Precise model', b: 'Sensitive model', A: [60, 5, 40, 895], B: [90, 60, 10, 840], note: 'The precise model rarely raises false alarms but misses 40% of positives; the sensitive model catches 90% but raises 60 false alarms. F1 and MCC nearly tie; F2 (missing cases matters more) prefers the sensitive model. The right answer depends on the costs, not on a formula.' }
  ];
  FIG['fig-metrics-disagree'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var pi = 0;
    var controls = div('fig-controls', container);
    choice(controls, 'Scenario', PAIRS.map(function (p) { return p.n; }), 0, function (i) { pi = i; draw(); });
    var out = div('', container);
    function draw() {
      var p = PAIRS[pi], a = binMetrics.apply(null, p.A), b = binMetrics.apply(null, p.B);
      var rows = [['Accuracy', 'acc', 1], ['Balanced accuracy', 'bacc', 1], ['Precision', 'prec', 1], ['Recall (sensitivity)', 'sens', 1], ['Specificity', 'spec', 1], ['F1', 'f1', 0], ['F2', 'f2', 0], ['MCC', 'mcc', 0]];
      var th = 'padding:0.35rem 0.5rem;text-align:left;border-bottom:2px solid var(--border);', td = 'padding:0.35rem 0.5rem;border-bottom:1px solid var(--border);';
      var cmini = function (v) { return 'TP ' + v[0] + ', FP ' + v[1] + ', FN ' + v[2] + ', TN ' + v[3]; };
      out.innerHTML = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-sans);font-size:0.88rem;"><thead><tr><th style="' + th + '">Metric</th><th style="' + th + '">' + p.a + '<div style="font-weight:400;font-size:0.75rem;color:var(--ink-muted);">' + cmini(p.A) + '</div></th><th style="' + th + '">' + p.b + '<div style="font-weight:400;font-size:0.75rem;color:var(--ink-muted);">' + cmini(p.B) + '</div></th><th style="' + th + '">Prefers</th></tr></thead><tbody>' +
        rows.map(function (r) {
          var va = a[r[1]], vb = b[r[1]], fmtv = function (x) { return r[2] ? pct(x) : f3(x); }, win = Math.abs(va - vb) < 0.005 ? 'tie' : va > vb ? p.a : p.b;
          return '<tr><td style="' + td + 'font-weight:600;">' + r[0] + '</td><td style="' + td + (win === p.a ? 'font-weight:700;color:var(--ink);' : '') + '">' + fmtv(va) + '</td><td style="' + td + (win === p.b ? 'font-weight:700;color:var(--ink);' : '') + '">' + fmtv(vb) + '</td><td style="' + td + 'color:' + (win === p.a ? TNC : win === p.b ? TPC : 'var(--ink-muted)') + ';">' + win + '</td></tr>';
        }).join('') + '</tbody></table></div><div style="' + READ_CSS + '">' + p.note + '</div>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 7. Cost-based threshold
     ----------------------------------------------------------------------- */
  FIG['fig-cost-threshold'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var cFN = 20, cFP = 1, prev = 5, d = 2;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ct-fn', label: 'Cost of missing a positive (false negative)', min: 1, max: 100, step: 1, value: cFN, onChange: function (x) { cFN = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ct-fp', label: 'Cost of a false alarm (false positive)', min: 1, max: 100, step: 1, value: cFP, onChange: function (x) { cFP = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'ct-p', label: 'Prevalence', min: 1, max: 50, step: 1, value: prev, onChange: function (x) { prev = x; draw(); } });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function cost(t) { var pi = prev / 100; return 1000 * (pi * Phi(t - d) * cFN + (1 - pi) * (1 - Phi(t)) * cFP); }
    function draw() {
      var c = C(), pi = prev / 100;
      valText(s1, String(cFN)); valText(s2, String(cFP)); valText(s3, prev + '%');
      var tStar = d / 2 + Math.log((1 - pi) * cFP / (pi * cFN)) / d, cStar = cost(tStar);
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), H = 200, fs = scaler(svgWrap, 360);
      var svg = FIG.createSVG(svgWrap, W, H, 'Expected cost against threshold');
      var L = 50, R = W - 12, T = 24, B = H - 32, lo = -3, hi = 5, cmax = 0, x;
      for (x = lo; x <= hi; x += 0.05) cmax = Math.max(cmax, cost(x));
      var X = function (z) { return L + (z - lo) / (hi - lo) * (R - L); }, Y = function (v) { return B - v / cmax * (B - T); };
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.border }, svg);
      el('line', { x1: L, y1: T, x2: L, y2: B, stroke: c.border }, svg);
      var path = ''; for (x = lo; x <= hi; x += 0.05) path += (path ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(cost(x)).toFixed(1);
      el('path', { d: path, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, svg);
      if (tStar > lo && tStar < hi) { el('line', { x1: X(tStar), y1: T, x2: X(tStar), y2: B, stroke: RED, 'stroke-dasharray': '4 3' }, svg); el('circle', { cx: X(tStar), cy: Y(cStar), r: 6, fill: RED }, svg); }
      [-2, 0, 2, 4].forEach(function (v) { txt(svg, X(v), B + 15, String(v), { size: fs(10), fill: c.muted }); });
      txt(svg, (L + R) / 2, H - 4, 'decision threshold on the model’s score', { size: fs(10), fill: c.muted });
      txt(svg, L + 4, T - 8, 'expected cost per 1,000 cases', { anchor: 'start', size: fs(10), fill: c.muted });
      txt(svg, L - 5, Y(0) + 4, '0', { anchor: 'end', size: fs(10), fill: c.muted });
      var sens = 1 - Phi(tStar - d), spec = Phi(tStar);
      out.innerHTML = 'Cheapest threshold: <strong>' + fmt(tStar, 2) + '</strong>, giving sensitivity <strong>' + pct(sens) + '</strong> and specificity <strong>' + pct(spec) + '</strong>, at an expected cost of ' + fmt(cStar, 0) + ' per 1,000 cases.' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">When a missed case is expensive (cancer, fraud), the best threshold moves left: flag more, accept more false alarms. When false alarms are expensive (blocking a customer’s card), it moves right. Prevalence matters too. Same model (separation d = 2) throughout; only the decision changes.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 8. Multiclass averaging
     ----------------------------------------------------------------------- */
  var CLS = ['cat', 'dog', 'bird', 'fox'];
  FIG['fig-multiclass'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var foxes = 0, nfox = 5;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'mc-f', label: 'Foxes correctly recognised', min: 0, max: 5, step: 1, value: foxes, onChange: function (x) { foxes = Math.min(x, nfox); draw(); } });
    var s2 = FIG.slider(controls, { id: 'mc-n', label: 'Number of foxes in the test set', min: 5, max: 50, step: 1, value: nfox, onChange: function (x) { nfox = x; s1.element.max = nfox; if (foxes > nfox) foxes = nfox; draw(); } });
    var out = div('', container);
    function matrix() {
      var m = [[45, 4, 1, 0], [5, 38, 2, 0], [1, 2, 36, 1], [0, 0, 0, 0]];
      // the missed foxes are mistaken for dogs (60%) and cats (40%)
      var miss = nfox - foxes, toDog = Math.round(miss * 0.6);
      m[3] = [miss - toDog, toDog, 0, foxes];
      return m;
    }
    function draw() {
      var m = matrix(), K = 4, i, j, s = 0, tr = 0, t = [0, 0, 0, 0], p = [0, 0, 0, 0];
      valText(s1, foxes + ' of ' + nfox); valText(s2, String(nfox));
      for (i = 0; i < K; i++) for (j = 0; j < K; j++) { s += m[i][j]; t[i] += m[i][j]; p[j] += m[i][j]; if (i === j) tr += m[i][j]; }
      var per = [], macroF = 0, wF = 0, macroR = 0;
      for (i = 0; i < K; i++) {
        var tp = m[i][i], prec = p[i] ? tp / p[i] : 0, rec = t[i] ? tp / t[i] : 0, f = prec + rec ? 2 * prec * rec / (prec + rec) : 0;
        per.push([CLS[i], prec, rec, f, t[i]]); macroF += f / K; wF += f * t[i] / s; macroR += rec / K;
      }
      var sumPT = 0, sumP2 = 0, sumT2 = 0; for (i = 0; i < K; i++) { sumPT += p[i] * t[i]; sumP2 += p[i] * p[i]; sumT2 += t[i] * t[i]; }
      var mcc = (tr * s - sumPT) / Math.sqrt((s * s - sumP2) * (s * s - sumT2));
      var th = 'padding:0.3rem 0.45rem;border-bottom:2px solid var(--border);text-align:center;font-size:0.8rem;', td = 'padding:0.3rem 0.45rem;border-bottom:1px solid var(--border);text-align:center;';
      var mx = 0; for (i = 0; i < K; i++) for (j = 0; j < K; j++) mx = Math.max(mx, m[i][j]);
      var grid = '<table style="border-collapse:collapse;font-family:var(--font-sans);font-size:0.85rem;margin:0.3rem auto;"><tr><td style="font-size:0.75rem;color:var(--ink-muted);padding:0.2rem;">actual ↓ / predicted →</td>' + CLS.map(function (n) { return '<td style="' + th + '">' + n + '</td>'; }).join('') + '</tr>' +
        m.map(function (r, a) { return '<tr><td style="' + th + 'text-align:right;">' + CLS[a] + '</td>' + r.map(function (v, b) { var op = mx ? v / mx : 0; return '<td style="padding:0.35rem 0.6rem;text-align:center;border:1px solid var(--border);background:' + (a === b ? 'rgba(22,163,74,' : 'rgba(220,38,38,') + (0.1 + 0.6 * op).toFixed(2) + ');font-weight:' + (a === b ? 700 : 400) + ';">' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      var tbl = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-sans);font-size:0.86rem;margin-top:0.5rem;"><thead><tr><th style="' + th + 'text-align:left;">Class</th><th style="' + th + '">Precision</th><th style="' + th + '">Recall</th><th style="' + th + '">F1</th><th style="' + th + '">Examples</th></tr></thead><tbody>' +
        per.map(function (r) { return '<tr><td style="' + td + 'text-align:left;font-weight:600;">' + r[0] + '</td><td style="' + td + '">' + fmt(r[1], 3) + '</td><td style="' + td + '">' + fmt(r[2], 3) + '</td><td style="' + td + '">' + fmt(r[3], 3) + '</td><td style="' + td + '">' + r[4] + '</td></tr>'; }).join('') + '</tbody></table></div>';
      out.innerHTML = grid + tbl + '<div style="' + READ_CSS + '">Accuracy = micro-F1 = <strong>' + fmt(tr / s, 3) + '</strong> · macro-F1 = <strong>' + fmt(macroF, 3) + '</strong> · weighted F1 = <strong>' + fmt(wF, 3) + '</strong> · balanced accuracy (macro recall) = <strong>' + fmt(macroR, 3) + '</strong> · multiclass MCC = <strong>' + fmt(mcc, 3) + '</strong>' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Micro averaging pools every prediction, so it is dominated by the common classes and equals accuracy. Macro averaging gives each class an equal vote, so a rare class the model completely ignores drags it down hard. Weighted averaging weights each class by its size, landing close to micro. Recognise more foxes and watch macro-F1 jump while accuracy barely moves. (Illustrative counts.)</span></div>';
    }
    draw();
  };

  /* -----------------------------------------------------------------------
     Figure 9. Calibration
     ----------------------------------------------------------------------- */
  FIG['fig-calibration'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var k = 1, b = 0;
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'ca-k', label: 'Confidence (below 1: too timid; above 1: overconfident)', min: 0.3, max: 3, step: 0.05, value: k, onChange: function (x) { k = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'ca-b', label: 'Bias (negative: underestimates; positive: overestimates)', min: -2, max: 2, step: 0.05, value: b, onChange: function (x) { b = x; draw(); } });
    var row = group(controls, 'Try');
    btn('Perfectly calibrated', row).addEventListener('click', function () { k = 1; b = 0; s1.setValue(1); s2.setValue(0); draw(); });
    btn('Overconfident (like many deep networks)', row).addEventListener('click', function () { k = 2.5; b = 0; s1.setValue(2.5); s2.setValue(0); draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function q(p) { var l = Math.log(p / (1 - p)); return 1 / (1 + Math.exp(-(k * l + b))); }
    function draw() {
      var c = C(), NP = 2000, bins = [], i;
      valText(s1, fmt(k, 2)); valText(s2, (b >= 0 ? '+' : '') + fmt(b, 2));
      for (i = 0; i < 10; i++) bins.push({ q: 0, p: 0, n: 0 });
      var brier = 0, ll = 0;
      for (i = 0; i < NP; i++) {
        var p = (i + 0.5) / NP, qq = Math.min(1 - 1e-9, Math.max(1e-9, q(p))), bi = Math.min(9, Math.floor(qq * 10));
        bins[bi].q += qq; bins[bi].p += p; bins[bi].n++;
        brier += qq * qq - 2 * qq * p + p; ll += -(p * Math.log(qq) + (1 - p) * Math.log(1 - qq));
      }
      brier /= NP; ll /= NP;
      var ece = 0; bins.forEach(function (bn) { if (bn.n) ece += bn.n / NP * Math.abs(bn.q / bn.n - bn.p / bn.n); });
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), fs = scaler(svgWrap, 360);
      var size = Math.min(W - 80, 260), H = size + 50, L = (W - size) / 2 + 10, T = 20;
      var svg = FIG.createSVG(svgWrap, W, H, 'Reliability diagram');
      var X = function (v) { return L + v * size; }, Y = function (v) { return T + size - v * size; };
      el('rect', { x: L, y: T, width: size, height: size, fill: 'none', stroke: c.border }, svg);
      el('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: c.faint, 'stroke-dasharray': '4 3' }, svg);
      bins.forEach(function (bn, j) {
        if (!bn.n) return;
        var obs = bn.p / bn.n;
        el('rect', { x: X(j / 10) + 1, y: Y(obs), width: size / 10 - 2, height: Y(0) - Y(obs), fill: BLUE, opacity: 0.55 }, svg);
        el('circle', { cx: X(bn.q / bn.n), cy: Y(obs), r: 3.5, fill: RED }, svg);
      });
      [0, 0.5, 1].forEach(function (v) { txt(svg, X(v), Y(0) + 14, String(v), { size: fs(10), fill: c.muted }); txt(svg, L - 5, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      txt(svg, X(0.5), H - 6, 'predicted probability', { size: fs(10), fill: c.muted });
      txt(svg, L, 12, 'how often it actually happened', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'Brier score <strong>' + fmt(brier, 4) + '</strong> · log loss <strong>' + fmt(ll, 4) + '</strong> · expected calibration error <strong>' + fmt(ece, 3) + '</strong> · AUC <strong>0.833</strong> (unchanged).' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Bars show how often the event really happened among cases given each predicted probability; a calibrated model follows the dashed diagonal. An overconfident model pushes its probabilities towards 0 and 1, so its “90%” events happen far less than 90% of the time. Because these changes never alter the <em>ranking</em> of cases, the AUC stays exactly the same: ranking and calibration are different properties. Brier score and log loss reward both. (Expected values for a simulated model.)</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 10. Regression metrics lab
     ----------------------------------------------------------------------- */
  FIG['fig-regression'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var noise = 6, bias = 0, outl = 0, nearZero = 0, model = 0, base = [], eps = [];
    for (var i = 0; i < 60; i++) { base.push(10 + Math.random() * 90); eps.push(gauss()); }
    var controls = div('fig-controls', container);
    var s1 = FIG.slider(controls, { id: 'rg-n', label: 'Random error (noise)', min: 0, max: 25, step: 0.5, value: noise, onChange: function (x) { noise = x; draw(); } });
    var s2 = FIG.slider(controls, { id: 'rg-b', label: 'Systematic bias', min: -20, max: 20, step: 0.5, value: bias, onChange: function (x) { bias = x; draw(); } });
    var s3 = FIG.slider(controls, { id: 'rg-o', label: 'Number of large outlier errors', min: 0, max: 6, step: 1, value: outl, onChange: function (x) { outl = x; draw(); } });
    choice(controls, 'Predictions from', ['A model', 'Always the average'], 0, function (k) { model = k; draw(); });
    choice(controls, 'True values', ['Mostly 10–100', 'Some near zero'], 0, function (k) { nearZero = k; draw(); });
    var svgWrap = div('', container), out = div('', container);
    out.style.cssText = READ_CSS;
    function draw() {
      var c = C(), y = base.slice(), yhat = [], n = y.length, k;
      valText(s1, '±' + fmt(noise, 1)); valText(s2, (bias >= 0 ? '+' : '') + fmt(bias, 1)); valText(s3, String(outl));
      if (nearZero) for (k = 0; k < 6; k++) y[k] = 0.1 + k * 0.1;
      var ym = y.reduce(function (a, v) { return a + v; }, 0) / n;
      for (k = 0; k < n; k++) yhat.push(model ? ym : y[k] + bias + noise * eps[k] + (k >= n - outl ? 45 : 0));
      if (!model && nearZero) for (k = 0; k < 6; k++) yhat[k] = y[k] + 4;
      var ae = [], se = 0, ape = 0, ss = 0;
      for (k = 0; k < n; k++) { var e = yhat[k] - y[k]; ae.push(Math.abs(e)); se += e * e; ape += Math.abs(e) / Math.abs(y[k]); ss += (y[k] - ym) * (y[k] - ym); }
      var mae = ae.reduce(function (a, v) { return a + v; }, 0) / n, rmse = Math.sqrt(se / n), mape = ape / n * 100, r2 = 1 - se / ss;
      var sorted = ae.slice().sort(function (a, b2) { return a - b2; }), med = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      svgWrap.innerHTML = '';
      var W = Math.max(300, Math.round(svgWrap.clientWidth || container.clientWidth || 700)), fs = scaler(svgWrap, 360);
      var size = Math.min(W - 70, 280), H = size + 46, L = (W - size) / 2 + 14, T = 18;
      var svg = FIG.createSVG(svgWrap, W, H, 'Predicted against true values');
      var lo = -10, hi = 160, X = function (v) { return L + (v - lo) / (hi - lo) * size; }, Y = function (v) { return T + size - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * size; };
      el('rect', { x: L, y: T, width: size, height: size, fill: 'none', stroke: c.border }, svg);
      el('line', { x1: X(lo), y1: Y(lo), x2: X(hi), y2: Y(hi), stroke: c.faint, 'stroke-dasharray': '4 3' }, svg);
      for (k = 0; k < n; k++) el('circle', { cx: X(y[k]), cy: Y(yhat[k]), r: 3.6, fill: k >= n - outl && !model ? RED : BLUE, opacity: 0.75 }, svg);
      [0, 50, 100, 150].forEach(function (v) { txt(svg, X(v), Y(lo) + 14, String(v), { size: fs(10), fill: c.muted }); txt(svg, L - 5, Y(v) + 4, String(v), { anchor: 'end', size: fs(10), fill: c.muted }); });
      txt(svg, X((lo + hi) / 2), H - 4, 'true value', { size: fs(10), fill: c.muted });
      txt(svg, L, 11, 'predicted value (dashed line: perfect prediction)', { anchor: 'start', size: fs(10), fill: c.muted });
      out.innerHTML = 'MAE <strong>' + fmt(mae, 2) + '</strong> · RMSE <strong>' + fmt(rmse, 2) + '</strong> · median absolute error <strong>' + fmt(med, 2) + '</strong> · MAPE <strong>' + (mape > 1000 ? 'over 1,000%' : fmt(mape, 1) + '%') + '</strong> · R² <strong>' + fmt(r2, 3) + '</strong>' +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">' +
        (model ? 'Always predicting the average gives R² = 0 exactly: R² measures improvement over this baseline. A model worse than the average has negative R².' :
          outl ? 'Each outlier error of 45 adds far more to RMSE (which squares errors) than to MAE, and barely moves the median error.' :
            nearZero ? 'A few true values near zero make the percentage errors explode, although the absolute errors are small: MAPE is unreliable when values can be close to zero.' :
              Math.abs(bias) > 2 ? 'A systematic bias raises every error metric and lowers R², even though the points still lie on a straight line: correlation alone would miss it.' :
                'Add noise, bias, outliers or values near zero and watch which metrics react.') + ' Synthetic data.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 11. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-metrics'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'A fraud detector is 99.5% accurate on data where 0.5% of transactions are fraud. What should you check first?', options: ['Nothing: 99.5% is excellent', 'What a model that always says “not fraud” would score, plus recall, precision and MCC', 'The training time', 'The number of features'], answer: 1, explanation: 'Always saying “not fraud” also scores 99.5% accuracy.' },
      { question: 'Sensitivity is…', options: ['TN / (TN + FP)', 'TP / (TP + FN): the share of actual positives found', 'TP / (TP + FP)', '(TP + TN) / all'], answer: 1, explanation: 'Also called recall or true positive rate.' },
      { question: 'A test has 99% sensitivity and 95% specificity for a disease affecting 1% of people. Roughly what share of positive results are true?', options: ['99%', '95%', 'About 17%', '1%'], answer: 2, explanation: 'Per 10,000 people: 99 true positives and 495 false positives, so 99/594 ≈ 17%.' },
      { question: 'Why does F1 use the harmonic mean of precision and recall?', options: ['It is easier to compute', 'It stays low unless both precision and recall are high', 'It ignores false positives', 'It equals accuracy'], answer: 1, explanation: 'Precision 1.0 and recall 0.01 give an arithmetic mean of 0.5 but F1 of only about 0.02.' },
      { question: 'Which metric uses all four cells of the confusion matrix?', options: ['Precision', 'Recall', 'F1', 'MCC'], answer: 3, explanation: 'F1 ignores true negatives; MCC uses TP, TN, FP and FN.' },
      { question: 'An AUC of 0.85 means…', options: ['85% accuracy', 'A random positive gets a higher score than a random negative 85% of the time', '85% precision', 'The best threshold is 0.85'], answer: 1, explanation: 'AUC is a ranking measure, independent of any threshold.' },
      { question: 'Positives are 0.1% of the data. Which curve better reveals false-alarm problems?', options: ['ROC curve', 'Precision–recall curve', 'Neither', 'A pie chart'], answer: 1, explanation: 'ROC curves do not change with prevalence; precision does, and the PR curve shows it.' },
      { question: 'In a single-label multiclass problem, micro-averaged F1 equals…', options: ['Macro-F1', 'Accuracy', 'MCC', 'Balanced accuracy'], answer: 1, explanation: 'Every false positive for one class is a false negative for another, so micro precision = micro recall = accuracy.' },
      { question: 'A rare class is never predicted correctly. Which average reveals this most clearly?', options: ['Micro-F1', 'Weighted F1', 'Macro-F1', 'Accuracy'], answer: 2, explanation: 'Macro averaging gives each class an equal vote.' },
      { question: 'A model has excellent AUC but its “90%” predictions come true only 60% of the time. It is…', options: ['Well calibrated', 'Poorly calibrated (overconfident) but good at ranking', 'Useless', 'Overfitted to the threshold'], answer: 1, explanation: 'Calibration and discrimination are separate; recalibration can fix the probabilities without changing the AUC.' },
      { question: 'Which regression metric is most affected by a few very large errors?', options: ['MAE', 'Median absolute error', 'RMSE', 'All equally'], answer: 2, explanation: 'RMSE squares the errors before averaging.' },
      { question: 'A regression model has R² = −0.2 on the test set. This means…', options: ['A calculation error: R² cannot be negative', 'The model predicts worse than always guessing the test-set average', '20% of variance explained', 'The model is perfect'], answer: 1, explanation: 'R² compares the model with the mean; out of sample it can be negative.' }
    ]);
  };
})();
