/* ==========================================================================
   RNLearn — "The human story at a glance": an interactive timeline
   Used in Part 1 ("Before Science"). Registers FIG['fig-human-timeline'].
   Three zoom levels (7 million, 400,000 and 100,000 years). Species are drawn
   as bars showing roughly when their fossils are found; events are drawn as
   pictures on stems. Tap or click an event (or use Tab and Enter) to read
   about it. Ages are approximate and given in years before present.
   ========================================================================== */
(function () {
  'use strict';

  var FIG = window.FIG || (window.FIG = {});
  var NS = 'http://www.w3.org/2000/svg';

  // Species: from/to in millions of years ago (approximate fossil ranges)
  var SPECIES = [
    { name: 'Sahelanthropus', from: 7.2, to: 6.8, color: '#a8a29e', note: 'One of the oldest possible members of the human family, from Chad.' },
    { name: 'Ardipithecus', from: 5.8, to: 4.4, color: '#a3a380', note: 'Walked upright on the ground but still climbed trees.' },
    { name: 'Australopithecus afarensis', short: 'Au. afarensis', from: 3.9, to: 2.9, color: '#c08552', note: 'The species of "Lucy". Upright walkers with chimpanzee-sized brains.' },
    { name: 'Kenyanthropus', from: 3.5, to: 3.2, color: '#b5835a', note: 'A flat-faced relative from Kenya; a possible maker of the Lomekwi tools.' },
    { name: 'Homo habilis', short: 'H. habilis', from: 2.4, to: 1.5, color: '#8f9e5b', note: 'An early member of our own genus, Homo, linked with Oldowan tools.' },
    { name: 'Homo erectus', short: 'H. erectus', from: 1.9, to: 0.11, color: '#5f8a6b', note: 'Long legs, bigger brains, handaxes and fire. The first humans to leave Africa.' },
    { name: 'Homo heidelbergensis', short: 'H. heidelbergensis', from: 0.7, to: 0.2, color: '#4f7f8f', note: 'A broad group that may include the ancestors of Neanderthals and of us.' },
    { name: 'Neanderthals', from: 0.4, to: 0.04, color: '#5b6fa8', note: 'Our closest relatives, in Europe and western Asia. Many people today carry some Neanderthal DNA.' },
    { name: 'Homo sapiens', short: 'H. sapiens', from: 0.315, to: 0, color: '#c0504d', note: 'Us. The oldest known fossils are about 315,000 years old, from Jebel Irhoud in Morocco.' }
  ];

  // Events: age in years before present; sec = section of the article that tells the story
  var EVENTS = [
    { age: 7000000, icon: '🦴', title: 'Oldest possible human relative', text: 'A skull from Chad, Sahelanthropus, about 7 million years old, may come from near the split between our line and the chimpanzees\' line.' },
    { age: 3200000, icon: '🚶', title: '"Lucy" walks upright', text: 'The Lucy skeleton from Hadar, Ethiopia (about 3.2 million years old) shows our ancestors walked on two legs long before their brains grew large.' },
    { age: 3300000, icon: '🪨', title: 'First stone tools', text: 'Flaked stones at Lomekwi 3, Kenya, about 3.3 million years old: older than any known fossil of Homo.', sec: 1 },
    { age: 2800000, icon: '💀', title: 'Our genus, Homo, appears', text: 'The oldest jaw assigned to Homo comes from Ledi-Geraru, Ethiopia, about 2.8 million years old.', sec: 1 },
    { age: 2600000, icon: '🔨', title: 'Oldowan tools', text: 'The first long-lasting toolmaking tradition, at Gona, Ethiopia (2.6 million years ago) and later Olduvai Gorge.', sec: 2 },
    { age: 1800000, icon: '🌍', title: 'Leaving Africa', text: 'Homo erectus reaches Dmanisi in Georgia by about 1.8 million years ago, and later spreads as far as China and Java.' },
    { age: 1760000, icon: '🔺', title: 'Handaxes', text: 'Teardrop-shaped Acheulean handaxes appear at Kokiselei, Kenya, about 1.76 million years ago: tools made to a planned shape.', sec: 2 },
    { age: 1000000, icon: '🔥', title: 'Fire in a cave', text: 'Burned bone and plant ash deep inside Wonderwerk Cave, South Africa, about a million years old.', sec: 3 },
    { age: 790000, icon: '🔥', title: 'Fire used again and again', text: 'Burned seeds, wood and flint in patches at Gesher Benot Ya\'aqov, Israel, about 790,000 years ago.', sec: 3 },
    { age: 315000, icon: '👤', title: 'Our species: Jebel Irhoud', text: 'The oldest known Homo sapiens fossils, from Morocco, about 315,000 years old.', sec: 5 },
    { age: 300000, icon: '🎨', title: 'Pigment and long-distance trade', text: 'At Olorgesailie, Kenya, people were using red pigment and carrying obsidian long distances about 300,000 years ago.', sec: 11 },
    { age: 290000, icon: '🐢', title: 'Levallois: planning ahead', text: 'The prepared-core method spreads: shape a block so one blow gives a flake of planned shape.', sec: 6 },
    { age: 164000, icon: '🐚', title: 'Seafood on the menu', text: 'People collect shellfish at Pinnacle Point, South Africa, about 164,000 years ago.', sec: 11 },
    { age: 82000, icon: '📿', title: 'Shell beads', text: 'Pierced shell beads at Taforalt, Morocco (about 82,000 years) and Blombos, South Africa (about 75,000 years).', sec: 8 },
    { age: 77000, icon: '✏️', title: 'Engraved ochre', text: 'Deliberate cross-hatched patterns on ochre at Blombos Cave, about 77,000 years old. The oldest known drawing follows at about 73,000 years.', sec: 8 },
    { age: 70000, icon: '🧪', title: 'Glue and handles', text: 'At Sibudu Cave, people fix stone points to handles with a cooked glue of plant gum and ochre, about 70,000 years ago.', sec: 7 },
    { age: 55000, icon: '🛶', title: 'Spreading across the world', text: 'Between roughly 60,000 and 45,000 years ago, Homo sapiens spreads across Asia and reaches Australia, crossing open sea.' },
    { age: 44000, icon: '🌙', title: 'Lebombo bone', text: 'A baboon bone with 29 notches, about 44,000 years old: perhaps a tally, perhaps a Moon count.', sec: 9 },
    { age: 40000, icon: '👋', title: 'Last Neanderthals', text: 'Neanderthals disappear from Europe around 40,000 years ago, after thousands of years of overlap with modern humans.' },
    { age: 20000, icon: '❄️', title: 'Ishango bone; height of the Ice Age', text: 'The notched Ishango bone (about 20,000 years old) comes from the coldest, driest part of the last ice age.', sec: 9 },
    { age: 12000, icon: '🌾', title: 'Farming begins', text: 'In the Fertile Crescent people start growing crops and herding animals, around 12,000 years ago. Part 2 picks up the story.' },
    { age: 5200, icon: '📜', title: 'Writing', text: 'Writing begins in Mesopotamia about 5,200 years ago, as a way of keeping accounts (Part 2).' }
  ];

  var VIEWS = [
    { id: 'all', label: '7 million years', span: 7300000, ticks: [7, 6, 5, 4, 3, 2, 1, 0], unit: 1e6, unitLabel: 'million years ago' },
    { id: 'sapiens', label: '400,000 years', span: 400000, ticks: [400, 300, 200, 100, 0], unit: 1e3, unitLabel: 'thousand years ago' },
    { id: 'recent', label: '100,000 years', span: 100000, ticks: [100, 80, 60, 40, 20, 0], unit: 1e3, unitLabel: 'thousand years ago' }
  ];

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function fmtAge(a) {
    if (a >= 1e6) return (a / 1e6).toFixed(a % 1e6 ? (a % 1e5 ? 2 : 1) : 0).replace(/\.?0+$/, '') + ' million years ago';
    return a.toLocaleString('en-GB') + ' years ago';
  }

  FIG['fig-human-timeline'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;
    container.innerHTML = '';

    var view = VIEWS[0], selected = 2;

    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var group = document.createElement('div');
    group.className = 'fig-control-group';
    var lab = document.createElement('div');
    lab.className = 'fig-control-label';
    lab.textContent = 'Show the last:';
    controls.appendChild(lab);
    var btns = VIEWS.map(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fig-btn fig-map-btn';
      b.textContent = v.label;
      b.setAttribute('aria-pressed', v === view ? 'true' : 'false');
      b.addEventListener('click', function () {
        view = v;
        btns.forEach(function (x, i) { x.classList.toggle('active', VIEWS[i] === v); x.setAttribute('aria-pressed', VIEWS[i] === v ? 'true' : 'false'); });
        var vis = visibleEvents();
        if (vis.indexOf(selected) < 0) selected = vis[0];
        render();
      });
      if (v === view) b.classList.add('active');
      group.appendChild(b);
      return b;
    });
    controls.appendChild(group);
    container.appendChild(controls);

    var svgWrap = document.createElement('div');
    svgWrap.className = 'fig-canvas-container';
    container.appendChild(svgWrap);

    var panel = document.createElement('div');
    panel.className = 'timeline-panel';
    panel.setAttribute('aria-live', 'polite');
    container.appendChild(panel);

    function visibleEvents() {
      var out = [];
      EVENTS.forEach(function (e, i) { if (e.age <= view.span) out.push(i); });
      return out;
    }

    function showPanel() {
      var e = EVENTS[selected];
      panel.innerHTML = '';
      var h = document.createElement('div');
      h.className = 'timeline-panel-title';
      h.textContent = e.icon + '  ' + e.title;
      var d = document.createElement('div');
      d.className = 'timeline-panel-date';
      d.textContent = 'About ' + fmtAge(e.age);
      var p = document.createElement('p');
      p.textContent = e.text;
      panel.appendChild(h); panel.appendChild(d); panel.appendChild(p);
      if (e.sec) {
        var a = document.createElement('a');
        a.href = '#section-' + e.sec;
        a.textContent = 'Read more in section ' + e.sec + ' →';
        panel.appendChild(a);
      }
    }

    function render() {
      svgWrap.innerHTML = '';
      var narrow = (svgWrap.clientWidth || container.clientWidth || 700) < 560;
      var W = narrow ? Math.max(300, Math.round(svgWrap.clientWidth || 340)) : 760;
      var left = narrow ? 14 : 24, right = W - (narrow ? 14 : 24);
      var ink = FIG.getCSSVar ? FIG.getCSSVar('--ink', '#1f2430') : '#1f2430';
      var muted = FIG.getCSSVar ? FIG.getCSSVar('--ink-muted', '#6b7080') : '#6b7080';
      var border = FIG.getCSSVar ? FIG.getCSSVar('--border-strong', '#c9c6bd') : '#c9c6bd';
      var accent = FIG.getCSSVar ? FIG.getCSSVar('--accent', '#2160c4') : '#2160c4';
      var x = function (yearsAgo) { return left + (1 - yearsAgo / view.span) * (right - left); };

      // Species bars: lay out greedily in rows so bars and their names never overlap
      var fs = narrow ? 11 : 11.5;
      var rows = [], bars = [];
      SPECIES.forEach(function (s) {
        var from = Math.min(s.from * 1e6, view.span), to = s.to * 1e6;
        if (to >= view.span) return;
        var x0 = x(from), x1 = Math.max(x(to), x0 + 4);
        var label = narrow && s.short ? s.short : s.name;
        var tw = label.length * fs * 0.56 + 8;
        var inside = (x1 - x0) > tw;
        var extentEnd = inside ? x1 : x1 + tw;
        var lx = inside ? x0 + 5 : x1 + 5;
        if (!inside && extentEnd > right) { lx = x0 - 5; extentEnd = x1; }
        var start = (!inside && lx < x0) ? x0 - tw : x0;
        var r = 0;
        while (rows[r] !== undefined && rows[r] > start - 6) r++;
        rows[r] = extentEnd;
        bars.push({ s: s, x0: x0, x1: x1, row: r, label: label, inside: inside, lx: lx, anchorEnd: (!inside && lx < x0) });
      });
      var nRows = Math.max(rows.length, 1);
      var rowH = 22, top = 30;
      var axisY = top + nRows * rowH + 18;

      // Event pictures: stagger into levels so they don't overlap
      var iconSize = narrow ? 18 : 20, minGap = iconSize + 6;
      var vis = visibleEvents().slice().sort(function (a, b) { return EVENTS[b].age - EVENTS[a].age; });
      // In the widest view the last few hundred thousand years are too crowded to draw one by one,
      // so they become a single "zoom in" marker.
      var cluster = null;
      if (view.id === 'all') {
        var recent = vis.filter(function (i) { return EVENTS[i].age < 400000; });
        if (recent.length) {
          vis = vis.filter(function (i) { return EVENTS[i].age >= 400000; });
          cluster = { n: recent.length, x: x(150000) };
        }
      }
      var levels = [];
      var placed = vis.map(function (i) {
        var ex = x(EVENTS[i].age), lv = 0;
        while (levels[lv] !== undefined && ex - levels[lv] < minGap) lv++;
        levels[lv] = ex;
        return { i: i, x: ex, lv: lv };
      });
      if (cluster) {
        var clv = 0;
        while (levels[clv] !== undefined && cluster.x - levels[clv] < minGap) clv++;
        levels[clv] = cluster.x;
        cluster.lv = clv;
      }
      var nLv = Math.max(levels.length, 1), lvH = iconSize + 10;
      var H = axisY + 24 + nLv * lvH + 10;

      var svg = FIG.createSVG(svgWrap, W, H, 'Timeline of human evolution, ' + view.label);
      var title = el('text', { x: left, y: 16, 'font-size': 12, 'font-weight': 700, fill: ink }, svg);
      title.textContent = 'Species (roughly when their fossils are found)';

      bars.forEach(function (b) {
        var y = top + b.row * rowH;
        var g = el('g', {}, svg);
        var t = el('title', {}, g); t.textContent = b.s.name + ': ' + b.s.note;
        el('rect', { x: b.x0, y: y, width: b.x1 - b.x0, height: 16, rx: 4, fill: b.s.color, opacity: 0.9 }, g);
        var tx = el('text', { x: b.lx, y: y + 12, 'font-size': fs, 'font-style': 'italic', fill: b.inside ? '#fff' : ink, 'text-anchor': b.anchorEnd ? 'end' : 'start' }, g);
        tx.textContent = b.label;
      });

      // Axis
      el('line', { x1: left, y1: axisY, x2: right, y2: axisY, stroke: border, 'stroke-width': 1.5 }, svg);
      view.ticks.forEach(function (t) {
        var tx = x(t * view.unit);
        el('line', { x1: tx, y1: axisY - 4, x2: tx, y2: axisY + 4, stroke: border }, svg);
        var tl = el('text', { x: tx, y: axisY + 16, 'font-size': 10.5, fill: muted, 'text-anchor': t === 0 ? 'end' : (tx - left < 10 ? 'start' : 'middle') }, svg);
        tl.textContent = t === 0 ? 'today' : String(t);
        if (t === 0) tl.setAttribute('x', right);
      });
      var ul = el('text', { x: (left + right) / 2, y: axisY - 6, 'font-size': 10, fill: muted, 'text-anchor': 'middle' }, svg);
      ul.textContent = view.unitLabel;

      // Events
      placed.forEach(function (p) {
        var e = EVENTS[p.i];
        var cy = axisY + 24 + p.lv * lvH + iconSize / 2;
        var isSel = p.i === selected;
        el('line', { x1: p.x, y1: axisY, x2: p.x, y2: cy - iconSize / 2 - 1, stroke: isSel ? accent : border, 'stroke-width': isSel ? 2 : 1 }, svg);
        var g = el('g', { tabindex: 0, role: 'button', 'aria-label': e.title + ', about ' + fmtAge(e.age), style: 'cursor:pointer' }, svg);
        el('circle', { cx: p.x, cy: cy, r: iconSize / 2 + 3, fill: isSel ? accent : 'var(--surface, #fff)', stroke: isSel ? accent : border, 'stroke-width': 1.5 }, g);
        var it = el('text', { x: p.x, y: cy + iconSize * 0.34, 'font-size': iconSize * 0.9, 'text-anchor': 'middle' }, g);
        it.textContent = e.icon;
        var tt = el('title', {}, g); tt.textContent = e.title;
        var pick = function () { selected = p.i; render(); var n = svgWrap.querySelector('[data-sel="1"]'); if (n) n.focus(); };
        if (isSel) g.setAttribute('data-sel', '1');
        g.addEventListener('click', pick);
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
      });

      if (cluster) {
        var ccy = axisY + 24 + cluster.lv * lvH + iconSize / 2;
        el('line', { x1: cluster.x, y1: axisY, x2: cluster.x, y2: ccy - iconSize / 2 - 1, stroke: border }, svg);
        var cg = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Zoom in on the last 400,000 years (' + cluster.n + ' more events)', style: 'cursor:pointer' }, svg);
        el('rect', { x: cluster.x - (narrow ? 60 : 64), y: ccy - iconSize / 2 - 3, width: narrow ? 60 : 64, height: iconSize + 6, rx: (iconSize + 6) / 2, fill: accent }, cg);
        var ct = el('text', { x: cluster.x - (narrow ? 30 : 32), y: ccy + 4, 'font-size': 11, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }, cg);
        ct.textContent = '+' + cluster.n + ' more';
        var zoom = function () { btns[1].click(); };
        cg.addEventListener('click', zoom);
        cg.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); zoom(); } });
      }

      showPanel();
    }

    render();
    var lastW = svgWrap.clientWidth;
    window.addEventListener('resize', function () {
      var w = svgWrap.clientWidth;
      if (((w < 560) !== (lastW < 560)) || (w < 560 && Math.abs(w - lastW) > 20)) render();
      lastW = w;
    });
  };
})();
