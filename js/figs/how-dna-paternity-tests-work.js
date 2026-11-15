/* ==========================================================================
   RNLearn — Who's the Father? How a DNA Paternity Test Works
   Figures:
     1. fig-paternity-timeline  The story at a glance (clickable timeline)
     2. fig-inheritance         Half from each parent
     3. fig-str-repeats         Counting short tandem repeats
     4. fig-paternity-match     A paternity test at 20 loci
     5. fig-paternity-bayes     From the combined paternity index to a probability
     6. fig-quiz-paternity      Test yourself
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
    { name: 'Blood groups', color: '#b45309' },
    { name: 'DNA fingerprints and STRs', color: '#1d4ed8' },
    { name: 'Courts and new methods', color: '#be123c' }
  ];
  var EVENTS = [
    { year: '1901', icon: '🩸', era: 0, sec: 5, title: 'Blood groups discovered', text: 'Karl Landsteiner discovers the A, B and O blood groups, and soon suggests they could help settle disputed paternity.' },
    { year: '1910', icon: '🧬', era: 0, sec: 5, title: 'Blood groups are inherited', text: 'Von Dungern and Hirszfeld show that blood groups follow Mendel’s rules of inheritance.' },
    { year: '1927', icon: '🔬', era: 0, sec: 5, title: 'M and N groups', text: 'Landsteiner and Levine discover the M and N blood groups, soon used in paternity cases.' },
    { year: '1944', icon: '🎬', era: 0, sec: 5, title: 'The Chaplin case', text: 'Blood tests show Charlie Chaplin cannot be the father of Joan Barry’s daughter, yet a jury in 1945 finds him to be the father.' },
    { year: '1983', icon: '🧪', era: 1, sec: 8, title: 'PCR invented', text: 'Kary Mullis invents the polymerase chain reaction, a way to copy chosen pieces of DNA millions of times.' },
    { year: '1984', icon: '💡', era: 1, sec: 6, title: 'DNA fingerprinting', text: 'Alec Jeffreys sees the first DNA fingerprint in Leicester on the morning of 10 September.' },
    { year: '1985', icon: '✈️', era: 1, sec: 6, title: 'The first case', text: 'DNA fingerprints prove that a boy from a Ghanaian family is his mother’s son, and he is allowed to stay in Britain.' },
    { year: 'c. 1988', icon: '🇮🇳', era: 1, sec: 6, title: 'DNA fingerprinting in India', text: 'Lalji Singh’s lab in Hyderabad provides DNA evidence in a paternity case in a Kerala court.' },
    { year: '1991', icon: '🔁', era: 1, sec: 7, title: 'Short tandem repeats', text: 'Researchers show that short repeats of three or four letters make excellent markers for DNA typing.' },
    { year: '1998', icon: '🏛️', era: 2, sec: 12, title: 'Jefferson and Hemings', text: 'Y-chromosome tests link a descendant of Eston Hemings to the male line of Thomas Jefferson’s family.' },
    { year: '2012', icon: '⚖️', era: 2, sec: 13, title: 'The Tiwari case', text: 'The Delhi High Court announces that N. D. Tiwari is Rohit Shekhar’s biological father, from a DNA test by CDFD Hyderabad.' },
    { year: '2014', icon: '👯', era: 2, sec: 12, title: 'Telling twins apart', text: 'Ultra-deep sequencing finds rare mutations that reveal which identical twin is a child’s father.' },
    { year: '2017', icon: '🗂️', era: 2, sec: 7, title: '20 core STR loci', text: 'The US national DNA database expands its standard set from 13 to 20 STR loci.' },
    { year: '2026', icon: '🏛️', era: 2, sec: 13, title: 'Supreme Court of India', text: 'In Nikhat Parveen v. Rafique, the Court holds that the presumption of legitimacy must yield to an accurate, undisputed DNA report already on record.' }
  ];
  FIG['fig-paternity-timeline'] = function (figEl) {
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
    var selected = 5;
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
      var rows = W < 560 ? 2 : 1, per = Math.ceil(EVENTS.length / rows), rowH = 118, H = rows * rowH + 6, pad = 30;
      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline from 1901 to 2026');
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
     Figure 2. Half from each parent
     ----------------------------------------------------------------------- */
  var MUM = '#db2777', DAD = '#2563eb';
  var FAM_LOCI = ['D8S1179', 'TH01', 'vWA', 'FGA'];
  var FAM_M = [[12, 14], [6, 9.3], [16, 17], [21, 24]];
  var FAM_F = [[15, 17], [7, 8], [18, 19], [22, 25]];
  var chipSmall = false;
  function chip(v, col, faded) {
    return '<span style="display:inline-block;min-width:' + (chipSmall ? '1.75em' : '2.3em') + ';text-align:center;padding:' + (chipSmall ? '0.1rem 0.12rem' : '0.15rem 0.35rem') + ';margin:0.06rem;' + (chipSmall ? 'font-size:0.78rem;' : '') + 'border-radius:6px;font-weight:700;font-variant-numeric:tabular-nums;' +
      (faded ? 'border:1.5px dashed ' + col + ';color:' + col + ';opacity:0.55;' : 'background:' + col + ';color:#fff;') + '">' + v + '</span>';
  }
  FIG['fig-inheritance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var kids = [];
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Children');
    btn('Make a child', row).addEventListener('click', function () { if (kids.length >= 5) kids.shift(); kids.push(FAM_LOCI.map(function () { return [Math.random() < 0.5 ? 0 : 1, Math.random() < 0.5 ? 0 : 1]; })); draw(); });
    btn('Start again', row).addEventListener('click', function () { kids = []; draw(); });
    var wrap = div('', container); wrap.style.cssText = 'margin-top:0.75rem;overflow-x:auto;';
    var read = div('', container); read.style.cssText = 'margin-top:0.5rem;font-family:var(--font-sans);font-size:0.93rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var nar = (container.clientWidth || 600) < 480; chipSmall = nar;
      var th = 'padding:0.35rem ' + (nar ? '0.12rem' : '0.4rem') + ';text-align:left;font-size:' + (nar ? '0.68rem' : '0.8rem') + ';color:var(--ink-muted);font-weight:600;';
      var td = 'padding:0.3rem ' + (nar ? '0.12rem' : '0.4rem') + ';white-space:nowrap;';
      var h = '<table style="border-collapse:collapse;font-family:var(--font-sans);font-size:0.88rem;width:100%;"><thead><tr><th style="' + th + '"></th>' +
        FAM_LOCI.map(function (l) { return '<th style="' + th + '">' + l + '</th>'; }).join('') + '</tr></thead><tbody>';
      h += '<tr style="border-bottom:1px solid var(--border);"><td style="' + td + 'font-weight:700;color:' + MUM + ';">' + (nar ? 'Mum' : 'Mother') + '</td>' + FAM_M.map(function (g) { return '<td style="' + td + '">' + chip(g[0], MUM) + chip(g[1], MUM) + '</td>'; }).join('') + '</tr>';
      h += '<tr style="border-bottom:2px solid var(--border);"><td style="' + td + 'font-weight:700;color:' + DAD + ';">' + (nar ? 'Dad' : 'Father') + '</td>' + FAM_F.map(function (g) { return '<td style="' + td + '">' + chip(g[0], DAD) + chip(g[1], DAD) + '</td>'; }).join('') + '</tr>';
      if (!kids.length) h += '<tr><td colspan="5" style="padding:0.8rem 0.4rem;color:var(--ink-faint);">Press “Make a child”.</td></tr>';
      kids.forEach(function (k, n) {
        var last = n === kids.length - 1;
        h += '<tr style="border-bottom:1px solid var(--border);' + (last ? '' : 'opacity:0.6;') + '"><td style="' + td + 'font-weight:700;">' + (nar ? 'C' : 'Child ') + (n + 1) + '</td>' +
          k.map(function (p, i) { return '<td style="' + td + '">' + chip(FAM_M[i][p[0]], MUM) + chip(FAM_F[i][p[1]], DAD) + '</td>'; }).join('') + '</tr>';
      });
      h += '</tbody></table>';
      wrap.innerHTML = h;
      var msg = 'Pink alleles came from the mother, blue from the father. ';
      if (kids.length) {
        var k = kids[kids.length - 1];
        msg += 'Child ' + kids.length + ' got ' + k.map(function (p, i) { return FAM_M[i][p[0]] + ' and ' + FAM_F[i][p[1]]; }).join('; ') + '. ';
      }
      msg += '<br><span style="font-size:0.86rem;color:var(--ink-muted);">With two different alleles in each parent, there are 4 possible combinations at each locus, so 4 × 4 × 4 × 4 = <strong>256</strong> possible children at just these four loci. At 20 loci, there are about a trillion.</span>';
      read.innerHTML = msg;
    }
    draw();
    var lastW = 0;
    window.addEventListener('resize', function () { var w = container.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
  };

  /* -----------------------------------------------------------------------
     Figure 3. Short tandem repeats
     ----------------------------------------------------------------------- */
  FIG['fig-str-repeats'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var a = 6, b = 9;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    FIG.slider(controls, { id: 'str-a', label: 'Repeats on the chromosome from the mother', min: 4, max: 12, step: 1, value: a, onChange: function (v) { a = v; draw(); } });
    FIG.slider(controls, { id: 'str-b', label: 'Repeats on the chromosome from the father', min: 4, max: 12, step: 1, value: b, onChange: function (v) { b = v; draw(); } });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function len(n) { return 160 + 4 * n; }
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620);
      svgWrap.innerHTML = '';
      var W = 620, H = 330;
      var svg = FIG.createSVG(svgWrap, W, H, 'Two copies of an STR locus and the peaks they make');
      [[a, MUM, 'from mother', 22], [b, DAD, 'from father', 88]].forEach(function (s) {
        var y = s[3], x = 12;
        txt(svg, x, y - 4, 'Chromosome ' + s[2] + ': AATG × ' + s[0], { anchor: 'start', size: fs(11.5), weight: 700, fill: s[1] });
        el('rect', { x: x, y: y + 4, width: 46, height: 26, rx: 4, fill: c.sunken, stroke: c.faint }, svg);
        x += 48;
        for (var i = 0; i < s[0]; i++) {
          el('rect', { x: x + i * 38, y: y + 4, width: 36, height: 26, rx: 3, fill: s[1], opacity: 0.85 }, svg);
          txt(svg, x + i * 38 + 18, y + 21, 'AATG', { size: 9.5, weight: 700, fill: '#fff', font: 'monospace' });
        }
        x += s[0] * 38;
        el('rect', { x: x, y: y + 4, width: 46, height: 26, rx: 4, fill: c.sunken, stroke: c.faint }, svg);
      });
      // electropherogram
      var L = 30, R = W - 14, T = 176, B = H - 40, lo = len(3.5), hi = len(12.5);
      var X = function (bp) { return L + (bp - lo) / (hi - lo) * (R - L); };
      el('rect', { x: L, y: T - 6, width: R - L, height: B - T + 6, fill: c.raised, rx: 4 }, svg);
      for (var n = 4; n <= 12; n++) {
        el('line', { x1: X(len(n)), y1: B, x2: X(len(n)), y2: B + 5, stroke: c.ink2 }, svg);
        txt(svg, X(len(n)), B + 17, String(n), { size: fs(10.5), fill: c.muted });
      }
      txt(svg, (L + R) / 2, H - 6, 'number of repeats (longer pieces of DNA to the right)', { size: fs(10.5), fill: c.muted });
      el('line', { x1: L, y1: B, x2: R, y2: B, stroke: c.ink2 }, svg);
      var d = 'M' + L + ' ' + B;
      for (var px = L; px <= R; px += 2) {
        var bp = lo + (px - L) / (R - L) * (hi - lo), yv = 0;
        [a, b].forEach(function (k) { yv += Math.exp(-Math.pow((bp - len(k)) / 0.9, 2)); });
        d += ' L' + px + ' ' + (B - yv * 62).toFixed(1);
      }
      el('path', { d: d, fill: 'none', stroke: c.accent, 'stroke-width': 2 }, svg);
      if (a === b) txt(svg, X(len(a)), B - 130, 'one tall peak', { size: fs(11), weight: 700, fill: c.accent });
      else [[a, MUM], [b, DAD]].forEach(function (s) { txt(svg, X(len(s[0])), B - 70, String(s[0]), { size: fs(12), weight: 700, fill: s[1] }); });
      read.innerHTML = 'Result at this locus (TH01): <strong style="color:var(--ink);">' + Math.min(a, b) + ', ' + Math.max(a, b) + '</strong>. The copied pieces are ' + len(a) + ' and ' + len(b) + ' letters long (simplified lengths).' +
        (a === b ? ' Both chromosomes carry the same allele, so there is a single peak twice as tall: the person is <strong>homozygous</strong> at this locus.' : ' Two different alleles make two peaks: the person is <strong>heterozygous</strong> at this locus.') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">A real profile shows about 20 loci like this at once, in different colours and length ranges.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 4. A paternity test at 20 loci
     ----------------------------------------------------------------------- */
  var PLOCI = [['D3S1358', 12, 19], ['vWA', 13, 21], ['D16S539', 8, 14], ['CSF1PO', 8, 14], ['TPOX', 7, 12], ['D8S1179', 9, 17], ['D21S11', 27, 33], ['D18S51', 11, 21], ['D2S441', 9, 15], ['D19S433', 11, 17],
    ['TH01', 5, 10], ['FGA', 19, 27], ['D22S1045', 11, 18], ['D5S818', 8, 14], ['D13S317', 8, 14], ['D7S820', 7, 13], ['D10S1248', 11, 17], ['D1S1656', 11, 18], ['D12S391', 16, 24], ['D2S1338', 16, 26]];
  // illustrative allele frequencies: a bell shape over each locus's range, plus a small floor
  var FREQ = PLOCI.map(function (l) {
    var lo = l[1], hi = l[2], mid = (lo + hi) / 2 + 0.4, sd = (hi - lo) / 3.2, f = {}, tot = 0;
    for (var a = lo; a <= hi; a++) { f[a] = Math.exp(-Math.pow((a - mid) / sd, 2)) + 0.04; tot += f[a]; }
    for (var k in f) f[k] /= tot;
    return f;
  });
  var MU = 0.002;
  function pick(i) { var r = Math.random(), f = FREQ[i]; for (var a in f) { r -= f[a]; if (r <= 0) return +a; } return PLOCI[i][2]; }
  function geno(i) { return [pick(i), pick(i)]; }
  function kid(m, f) { return [m[Math.random() < 0.5 ? 0 : 1], f[Math.random() < 0.5 ? 0 : 1]]; } // [maternal, paternal]
  function sameSet(x, y, a, b) { return (x === a && y === b) || (x === b && y === a); }
  function locusPI(i, M, Cc, A) {
    var f = FREQ[i], c1 = Cc[0], c2 = Cc[1], num = 0, den = 0, ob = {};
    if (M) {
      M.forEach(function (m) {
        var need = m === c1 ? c2 : (m === c2 ? c1 : null);
        if (need === null) return;
        ob[need] = 1;
        den += 0.5 * f[need];
        num += 0.5 * A.filter(function (x) { return x === need; }).length / 2;
      });
    } else {
      A.forEach(function (x) {
        var need = x === c1 ? c2 : (x === c2 ? c1 : null);
        if (need !== null) num += 0.5 * f[need];
      });
      den = c1 === c2 ? f[c1] * f[c1] : 2 * f[c1] * f[c2];
      ob[c1] = 1; ob[c2] = 1;
      den = den; // P(child) for a random man and random mother
      num = num; // P(child | this man, random mother)
    }
    var obl = Object.keys(ob).map(Number).sort(function (p, q) { return p - q; });
    var pmin = Math.min.apply(null, obl.map(function (a) { return f[a]; }));
    if (num === 0) return { pi: MU / (2 * pmin), bad: true, obl: obl };
    return { pi: num / den, bad: false, obl: obl };
  }
  function bigNum(x) {
    if (x < 1000) return x.toFixed(x < 10 ? 2 : 0);
    if (x < 1e6) return fmt(x);
    if (x < 1e9) return (x / 1e6).toFixed(1) + ' million';
    if (x < 1e12) return (x / 1e9).toFixed(1) + ' billion';
    var e = Math.floor(Math.log10(x));
    return (x / Math.pow(10, e)).toFixed(1) + ' × 10<sup>' + e + '</sup>';
  }
  function probText(cpi, prior) {
    prior = prior === undefined ? 0.5 : prior;
    var odds = cpi * prior / (1 - prior), q = 1 / (odds + 1), w = 1 - q;
    if (w < 0.99) return (w * 100).toFixed(w < 0.1 ? 3 : 1) + '%';
    var dec = Math.min(8, Math.max(2, Math.ceil(-Math.log10(q * 100) - 0.01)));
    if (q * 100 < 1e-8) return '&gt; 99.99999999%';
    return (w * 100).toFixed(dec) + '%';
  }
  FIG['fig-paternity-match'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var who = 'father', withMum = true, fam = null;
    function newFam() {
      var G1 = PLOCI.map(function (l, i) { return geno(i); }), G2 = PLOCI.map(function (l, i) { return geno(i); });
      var F = PLOCI.map(function (l, i) { return kid(G1[i], G2[i]); }), Bro = PLOCI.map(function (l, i) { return kid(G1[i], G2[i]); });
      var M = PLOCI.map(function (l, i) { return geno(i); }), U = PLOCI.map(function (l, i) { return geno(i); });
      var Ch = PLOCI.map(function (l, i) { return kid(M[i], F[i]); });
      // a child of the true father with one paternal mutation
      var mi = Math.floor(Math.random() * PLOCI.length), ChMut = Ch.map(function (g) { return g.slice(); });
      var pa = Ch[mi][1], cand = [pa + 1, pa - 1, pa + 2, pa - 2, pa + 3, pa - 3].filter(function (v) { return v > 0 && F[mi].indexOf(v) < 0 && M[mi].indexOf(v) < 0; });
      if (FREQ[mi][cand[0]] === undefined) FREQ[mi][cand[0]] = 0.01;
      ChMut[mi][1] = cand[0];
      fam = { M: M, F: F, U: U, B: Bro, C: Ch, CM: ChMut, mi: mi };
    }
    newFam();
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var row = group(controls, 'Who is tested as the alleged father?');
    var opts = [['father', 'The true father'], ['unrelated', 'An unrelated man'], ['brother', 'The father’s brother'], ['mutation', 'True father, with a mutation']];
    var wbs = opts.map(function (o) { var b = btn(o[1], row); b.addEventListener('click', function () { who = o[0]; draw(); }); return b; });
    var row2 = group(controls, 'Options');
    var mB = btn('Mother tested: yes', row2);
    mB.addEventListener('click', function () { withMum = !withMum; draw(); });
    btn('New family', row2).addEventListener('click', function () { newFam(); draw(); });
    var summary = div('', container); summary.style.cssText = 'margin-top:0.75rem;padding:0.75rem 1rem;border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:0.95rem;line-height:1.55;';
    var wrap = div('', container); wrap.style.cssText = 'margin-top:0.6rem;overflow-x:auto;max-height:430px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);';
    function draw() {
      wbs.forEach(function (b, i) { b.classList.toggle('active', opts[i][0] === who); });
      mB.textContent = 'Mother tested: ' + (withMum ? 'yes' : 'no'); mB.classList.toggle('active', withMum);
      var Cc = who === 'mutation' ? fam.CM : fam.C;
      var A = who === 'unrelated' ? fam.U : who === 'brother' ? fam.B : fam.F;
      var cpi = 1, bad = 0;
      var nar = (container.clientWidth || 600) < 560, pd = nar ? '0.22rem' : '0.45rem';
      var th = 'padding:0.35rem ' + pd + ';text-align:left;font-size:0.78rem;color:var(--ink-muted);font-weight:600;position:sticky;top:0;background:var(--surface-raised);';
      var td = 'padding:0.28rem ' + pd + ';white-space:nowrap;font-variant-numeric:tabular-nums;';
      var h = '<table style="border-collapse:collapse;font-family:var(--font-sans);font-size:' + (nar ? '0.78rem' : '0.85rem') + ';width:100%;"><thead><tr>' +
        (nar ? ['Locus', 'Mother', 'Child', 'Man', 'PI'] : ['Locus', 'Mother', 'Child', 'From father', 'Man', 'PI']).map(function (t) { return '<th style="' + th + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>';
      PLOCI.forEach(function (l, i) {
        var r = locusPI(i, withMum ? fam.M[i] : null, Cc[i], A[i]);
        cpi *= r.pi; if (r.bad) bad++;
        var cg = Cc[i].slice().sort(function (p, q) { return p - q; }), mg = fam.M[i].slice().sort(function (p, q) { return p - q; }), ag = A[i].slice().sort(function (p, q) { return p - q; });
        var oblTxt = r.obl.join(' or ');
        var manTxt = ag.map(function (v) { return r.obl.indexOf(v) >= 0 && !r.bad ? '<strong style="color:var(--callout-tip);">' + v + '</strong>' : v; }).join(', ');
        h += '<tr style="border-top:1px solid var(--border);' + (r.bad ? 'background:rgba(220,38,38,0.12);' : '') + '">' +
          '<td style="' + td + 'font-weight:600;">' + (nar ? l[0].replace(/^D(\d+)S/, 'D$1S') : l[0]) + '</td>' +
          '<td style="' + td + (withMum ? '' : 'color:var(--ink-faint);') + '">' + (withMum ? mg.join(', ') : 'not tested') + '</td>' +
          '<td style="' + td + '">' + (nar && withMum ? cg.map(function (v) { return r.obl.indexOf(v) >= 0 ? '<u style="text-decoration-thickness:2px;">' + v + '</u>' : v; }).join(', ') : cg.join(', ')) + '</td>' +
          (nar ? '' : '<td style="' + td + '">' + oblTxt + '</td>') +
          '<td style="' + td + '">' + manTxt + (r.bad ? ' <strong style="color:#dc2626;">✗</strong>' : '') + '</td>' +
          '<td style="' + td + (r.bad ? 'color:#dc2626;font-weight:700;' : '') + '">' + (r.pi < 0.1 ? r.pi.toFixed(4) : r.pi.toFixed(2)) + '</td></tr>';
      });
      h += '</tbody></table>';
      wrap.innerHTML = h + (nar && withMum ? '<div style="padding:0.4rem 0.5rem;font-size:0.78rem;color:var(--ink-muted);font-family:var(--font-sans);">Underlined: the allele(s) the child must have got from the father.</div>' : '');
      var html;
      if (bad >= 2) {
        summary.style.background = 'rgba(220,38,38,0.1)'; summary.style.border = '1px solid rgba(220,38,38,0.35)';
        html = '<strong style="color:#dc2626;">Excluded.</strong> The man does not carry the father’s allele at <strong>' + bad + '</strong> of 20 loci, far too many to explain by mutation. Probability of paternity: <strong>0%</strong>.';
      } else {
        summary.style.background = 'rgba(21,128,61,0.08)'; summary.style.border = '1px solid rgba(21,128,61,0.3)';
        html = '<strong style="color:var(--callout-tip);">Not excluded.</strong> ' + (bad === 1 ? 'There is <strong>one</strong> inconsistency (red row), which could be a mutation; it is included with a small, mutation-adjusted index. ' : 'He carries the father’s allele at all 20 loci. ') +
          'Combined paternity index: <strong>' + bigNum(cpi) + '</strong>. Probability of paternity (50% prior): <strong style="color:var(--ink);">' + probText(cpi) + '</strong>.';
      }
      if (who === 'brother') html += '<br><span style="font-size:0.88rem;color:var(--ink-secondary);">The father’s brother shares many alleles with the true father, so he fails at far fewer loci than an unrelated man (compare the two). With 20 loci and the mother tested he is still almost always excluded, but with fewer loci, or without the mother (try it), a close relative is much harder to rule out. This is why labs must be told if a relative could be the father.</span>';
      if (!withMum) html += '<br><span style="font-size:0.88rem;color:var(--ink-secondary);">Without the mother, either of the child’s alleles could be the father’s, so each locus gives weaker evidence.</span>';
      if (who === 'mutation') html += '<br><span style="font-size:0.88rem;color:var(--ink-secondary);">Mutations like this happen roughly once in every few hundred to a thousand transmissions at each locus, which is why a single inconsistency is not treated as an exclusion.</span>';
      summary.innerHTML = html;
    }
    draw();
    var lastW = 0;
    window.addEventListener('resize', function () { var w = container.clientWidth; if (Math.abs(w - lastW) > 30) { lastW = w; draw(); } });
  };

  /* -----------------------------------------------------------------------
     Figure 5. From CPI to probability (Bayes)
     ----------------------------------------------------------------------- */
  FIG['fig-paternity-bayes'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';
    var lg = 4, prior = 50;
    var controls = div('fig-controls', container); controls.style.marginTop = '0';
    var s1 = FIG.slider(controls, { id: 'pb-c', label: 'Combined paternity index (powers of ten)', min: 0, max: 9, step: 0.1, value: lg, onChange: function (v) { lg = v; draw(); } });
    FIG.slider(controls, { id: 'pb-p', label: 'Prior probability before the test', min: 1, max: 99, step: 1, value: prior, unit: '%', onChange: function (v) { prior = v; draw(); } });
    var row = group(controls, 'Examples');
    [['CPI 1 (no evidence)', 0], ['CPI 100', 2], ['CPI 10,000', 4], ['CPI 1 million', 6]].forEach(function (p) {
      btn(p[0], row).addEventListener('click', function () { lg = p[1]; s1.setValue(lg); draw(); });
    });
    var svgWrap = div('', container); svgWrap.style.marginTop = '0.75rem';
    var read = div('', container); read.style.cssText = 'margin-top:0.4rem;font-family:var(--font-sans);font-size:0.94rem;color:var(--ink-secondary);line-height:1.6;';
    function draw() {
      var c = C(), fs = scaler(svgWrap, 620), cpi = Math.pow(10, lg), pr = prior / 100;
      svgWrap.innerHTML = '';
      var W = 620, H = 250, L = 52, R = W - 16, T = 16, B = H - 40;
      var svg = FIG.createSVG(svgWrap, W, H, 'Probability of paternity against the combined paternity index');
      var X = function (l) { return L + l / 9 * (R - L); }, Y = function (p) { return T + (1 - p) * (B - T); };
      [0, 0.25, 0.5, 0.75, 1].forEach(function (p) { el('line', { x1: L, y1: Y(p), x2: R, y2: Y(p), stroke: c.border }, svg); txt(svg, L - 6, Y(p) + 4, (p * 100) + '%', { anchor: 'end', size: fs(10.5), fill: c.muted }); });
      [0, 3, 6, 9].forEach(function (k) { txt(svg, X(k), B + 16, ['1', '1,000', '1 million', '1 billion'][k / 3], { anchor: k === 0 ? 'start' : k === 9 ? 'end' : 'middle', size: fs(10.5), fill: c.muted }); });
      txt(svg, (L + R) / 2, H - 4, 'combined paternity index (each step ×10)', { size: fs(10.5), fill: c.muted });
      [[0.5, c.faint, '5 3'], [pr, c.accent, '']].forEach(function (s, j) {
        var d = '';
        for (var l = 0; l <= 9.001; l += 0.05) { var o = Math.pow(10, l) * s[0] / (1 - s[0]); d += (d ? 'L' : 'M') + X(l).toFixed(1) + ' ' + Y(o / (o + 1)).toFixed(1); }
        el('path', { d: d, fill: 'none', stroke: s[1], 'stroke-width': j ? 3 : 1.5, 'stroke-dasharray': s[2] }, svg);
      });
      var odds = cpi * pr / (1 - pr), w = odds / (odds + 1);
      el('circle', { cx: X(lg), cy: Y(w), r: 7, fill: c.warn, stroke: '#fff', 'stroke-width': 2 }, svg);
      if (prior !== 50) txt(svg, R - 4, Y(0.5) + 16, 'dashed: 50% prior', { anchor: 'end', size: fs(10.5), fill: c.muted });
      read.innerHTML = 'CPI = <strong>' + bigNum(cpi) + '</strong>. Prior odds = ' + prior + ' : ' + (100 - prior) + '. ' +
        'Posterior odds = prior odds × CPI = <strong>' + bigNum(odds) + ' : 1</strong>.' +
        '<br>Probability of paternity = <strong style="color:var(--ink);font-size:1.05rem;">' + probText(cpi, pr) + '</strong>' +
        (lg === 0 ? ' A CPI of 1 means the DNA is equally likely either way, so the answer is just the prior.' : '') +
        '<br><span style="font-size:0.86rem;color:var(--ink-muted);">Laboratories use a 50% prior by convention. With strong DNA evidence, the prior hardly matters: try a 10% prior with a CPI of 1 million. The curve gets ever closer to 100% but never reaches it.</span>';
    }
    draw();
    window.addEventListener('resize', draw);
    onTheme(draw);
  };

  /* -----------------------------------------------------------------------
     Figure 6. Test yourself
     ----------------------------------------------------------------------- */
  FIG['fig-quiz-paternity'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    FIG.quiz(container, [
      { question: 'How many chromosomes does a typical human cell contain?', options: ['23', '46, in 23 pairs', '100', '2'], answer: 1, explanation: 'One of each pair comes from the mother and one from the father.' },
      { question: 'What are the two possible kinds of answer from a paternity test?', options: ['Yes or no, with 100% certainty', 'Excluded, or not excluded with a probability of paternity', 'Father or uncle', 'Blood group A or B'], answer: 1, explanation: 'An exclusion is close to certain; an inclusion is a very high probability, never quite 100%.' },
      { question: 'Why could blood groups only exclude a man, never identify him?', options: ['Blood groups change with age', 'Millions of men share any blood group, so a match proves little', 'Blood groups are not inherited', 'They were too expensive'], answer: 1, explanation: 'An impossible combination, like in the Chaplin case, can exclude; a match cannot identify.' },
      { question: 'What is a short tandem repeat (STR)?', options: ['A gene for height', 'A place where a short DNA "word", often four letters, is repeated a varying number of times', 'A kind of blood cell', 'A mutation that causes disease'], answer: 1, explanation: 'The number of repeats varies between people and is written as a number, such as 9.' },
      { question: 'What does PCR do in a DNA test?', options: ['Destroys the DNA', 'Copies chosen pieces of DNA millions of times', 'Measures blood pressure', 'Reads the whole genome'], answer: 1, explanation: 'Each heating and cooling cycle doubles the copies; about 30 cycles make around a billion.' },
      { question: 'Mother 12, 14; child 12, 15. What is the obligate paternal allele?', options: ['12', '14', '15', 'Cannot tell'], answer: 2, explanation: 'The mother has no 15, so the 15 must have come from the father.' },
      { question: 'Why is one mismatched locus usually not enough to exclude a man?', options: ['Labs ignore mismatches', 'STRs occasionally mutate between generations, about 1–3 times per 1,000 transmissions', 'Mothers can change their DNA', 'Because of the 50% prior'], answer: 1, explanation: 'Most labs require two or more, often three, inconsistencies to exclude.' },
      { question: 'At one locus, the man has one copy of the obligate allele, which has a frequency of 0.1. What is the paternity index?', options: ['0.1', '1', '5', '10'], answer: 2, explanation: 'PI = X ÷ Y = 0.5 ÷ 0.1 = 5.' },
      { question: 'With a 50% prior, what probability of paternity does a CPI of 10,000 give?', options: ['50%', '99%', '99.99%', '100%'], answer: 2, explanation: 'Probability = CPI ÷ (CPI + 1) = 10,000 ÷ 10,001 ≈ 99.99%.' },
      { question: 'Which case is hard for a standard paternity test?', options: ['The mother is not tested', 'The two possible fathers are identical twins', 'The child is a girl', 'The sample is a cheek swab'], answer: 1, explanation: 'Identical twins share the same standard DNA profile; only ultra-deep sequencing has told them apart.' }
    ]);
  };
})();
