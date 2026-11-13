/* ==========================================================================
   RNLearn — fig-core.js
   Accessible, vanilla, responsive interactive figure library.
   Supports SVG line/scatter/bar/area plots (linear & log), sliders,
   readouts, canvas DPR scaling, visible-only animation loop, quiz,
   timeline, vector map, and sortable data tables.
   ========================================================================== */

(function () {
  'use strict';

  var FIG = window.FIG || {};

  /* --- Helpers: CSS Variable lookup & Numbers --- */
  FIG.getCSSVar = function (name, fallback) {
    var val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (val && val.trim()) || fallback || '#17181c';
  };

  FIG.formatNumber = function (val, precision) {
    if (typeof val !== 'number' || isNaN(val)) return String(val);
    if (precision !== undefined) return val.toFixed(precision);
    if (Math.abs(val) >= 1e6 || (Math.abs(val) < 1e-3 && val !== 0)) {
      return val.toExponential(2);
    }
    return Number(val.toFixed(3)).toString();
  };

  /* --- SVG Construction Helper --- */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  FIG.createSVG = function (container, width, height, ariaLabel) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', '100%');
    svg.style.height = 'auto';
    svg.setAttribute('role', 'img');
    if (ariaLabel) {
      svg.setAttribute('aria-label', ariaLabel);
    }
    svg.style.display = 'block';
    svg.style.overflow = 'visible';
    container.appendChild(svg);
    return svg;
  };

  /* --- Scales (Linear & Logarithmic) --- */
  FIG.createLinearScale = function (domain, range) {
    var d0 = domain[0], d1 = domain[1];
    var r0 = range[0], r1 = range[1];
    var span = d1 - d0 || 1;
    return function (val) {
      return r0 + ((val - d0) / span) * (r1 - r0);
    };
  };

  FIG.createLogScale = function (domain, range) {
    var d0 = Math.max(1e-9, domain[0]), d1 = Math.max(1e-9, domain[1]);
    var logD0 = Math.log10(d0), logD1 = Math.log10(d1);
    var r0 = range[0], r1 = range[1];
    var span = logD1 - logD0 || 1;
    return function (val) {
      var v = Math.max(1e-9, val);
      return r0 + ((Math.log10(v) - logD0) / span) * (r1 - r0);
    };
  };

  /* --- General Plot Component --- */
  FIG.plot = function (container, opt) {
    container.innerHTML = '';
    var w = opt.width || 680;
    var h = opt.height || 360;
    var pad = opt.padding || { top: 30, right: 30, bottom: 50, left: 60 };

    var plotW = w - pad.left - pad.right;
    var plotH = h - pad.top - pad.bottom;

    var xScale = opt.logX
      ? FIG.createLogScale(opt.xDomain, [pad.left, pad.left + plotW])
      : FIG.createLinearScale(opt.xDomain, [pad.left, pad.left + plotW]);

    var yScale = opt.logY
      ? FIG.createLogScale(opt.yDomain, [pad.top + plotH, pad.top])
      : FIG.createLinearScale(opt.yDomain, [pad.top + plotH, pad.top]);

    var svg = FIG.createSVG(container, w, h, opt.title || 'Interactive chart');

    var borderCol = FIG.getCSSVar('--border', '#e5e3dd');
    var inkMuted = FIG.getCSSVar('--ink-muted', '#737785');
    var inkText = FIG.getCSSVar('--ink', '#17181c');
    var fontMono = FIG.getCSSVar('--font-mono', 'monospace');

    // Background Grid
    var gridG = document.createElementNS(SVG_NS, 'g');
    gridG.setAttribute('class', 'fig-grid');
    gridG.setAttribute('stroke', borderCol);
    gridG.setAttribute('stroke-dasharray', '3 3');
    gridG.setAttribute('stroke-width', '1');

    var xTicks = opt.xTicks || 6;
    for (var i = 0; i <= xTicks; i++) {
      var xVal = opt.xDomain[0] + (i / xTicks) * (opt.xDomain[1] - opt.xDomain[0]);
      var px = xScale(xVal);
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', px);
      line.setAttribute('y1', pad.top);
      line.setAttribute('x2', px);
      line.setAttribute('y2', pad.top + plotH);
      gridG.appendChild(line);

      // Tick label
      var txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('x', px);
      txt.setAttribute('y', pad.top + plotH + 20);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', fontMono);
      txt.setAttribute('fill', inkMuted);
      txt.textContent = FIG.formatNumber(xVal);
      svg.appendChild(txt);
    }

    var yTicks = opt.yTicks || 5;
    for (var j = 0; j <= yTicks; j++) {
      var yVal = opt.yDomain[0] + (j / yTicks) * (opt.yDomain[1] - opt.yDomain[0]);
      var py = yScale(yVal);
      var yLine = document.createElementNS(SVG_NS, 'line');
      yLine.setAttribute('x1', pad.left);
      yLine.setAttribute('y1', py);
      yLine.setAttribute('x2', pad.left + plotW);
      yLine.setAttribute('y2', py);
      gridG.appendChild(yLine);

      // Tick label
      var yTxt = document.createElementNS(SVG_NS, 'text');
      yTxt.setAttribute('x', pad.left - 10);
      yTxt.setAttribute('y', py + 4);
      yTxt.setAttribute('text-anchor', 'end');
      yTxt.setAttribute('font-size', '11');
      yTxt.setAttribute('font-family', fontMono);
      yTxt.setAttribute('fill', inkMuted);
      yTxt.textContent = FIG.formatNumber(yVal);
      svg.appendChild(yTxt);
    }
    svg.appendChild(gridG);

    // Axis Labels
    if (opt.xLabel) {
      var xl = document.createElementNS(SVG_NS, 'text');
      xl.setAttribute('x', pad.left + plotW / 2);
      xl.setAttribute('y', h - 10);
      xl.setAttribute('text-anchor', 'middle');
      xl.setAttribute('font-size', '12');
      xl.setAttribute('font-weight', '600');
      xl.setAttribute('fill', inkText);
      xl.textContent = opt.xLabel;
      svg.appendChild(xl);
    }

    if (opt.yLabel) {
      var yl = document.createElementNS(SVG_NS, 'text');
      yl.setAttribute('x', -(pad.top + plotH / 2));
      yl.setAttribute('y', 18);
      yl.setAttribute('text-anchor', 'middle');
      yl.setAttribute('transform', 'rotate(-90)');
      yl.setAttribute('font-size', '12');
      yl.setAttribute('font-weight', '600');
      yl.setAttribute('fill', inkText);
      yl.textContent = opt.yLabel;
      svg.appendChild(yl);
    }

    // Shaded Bands
    if (opt.bands && opt.bands.length) {
      opt.bands.forEach(function (band) {
        var rect = document.createElementNS(SVG_NS, 'rect');
        var bx1 = xScale(band.x0);
        var bx2 = xScale(band.x1);
        rect.setAttribute('x', Math.min(bx1, bx2));
        rect.setAttribute('y', pad.top);
        rect.setAttribute('width', Math.abs(bx2 - bx1));
        rect.setAttribute('height', plotH);
        rect.setAttribute('fill', band.color || 'rgba(0,0,0,0.05)');
        svg.appendChild(rect);
      });
    }

    // Series rendering
    if (opt.series && opt.series.length) {
      opt.series.forEach(function (s) {
        var col = s.color || FIG.getCSSVar('--accent', '#1b4965');

        if (s.type === 'area') {
          var areaPath = document.createElementNS(SVG_NS, 'path');
          var dArea = '';
          var baselineY = yScale(s.baseline !== undefined ? s.baseline : opt.yDomain[0]);
          s.data.forEach(function (pt, idx) {
            var px = xScale(pt[0]);
            var py = yScale(pt[1]);
            dArea += (idx === 0 ? 'M' : 'L') + px + ',' + py;
          });
          if (s.data.length) {
            dArea += 'L' + xScale(s.data[s.data.length - 1][0]) + ',' + baselineY;
            dArea += 'L' + xScale(s.data[0][0]) + ',' + baselineY + 'Z';
          }
          areaPath.setAttribute('d', dArea);
          areaPath.setAttribute('fill', s.fill || col);
          areaPath.setAttribute('opacity', s.opacity || '0.25');
          svg.appendChild(areaPath);
        }

        if (s.type === 'line' || s.type === 'area') {
          var linePath = document.createElementNS(SVG_NS, 'path');
          var dLine = '';
          s.data.forEach(function (pt, idx) {
            var px = xScale(pt[0]);
            var py = yScale(pt[1]);
            dLine += (idx === 0 ? 'M' : 'L') + px + ',' + py;
          });
          linePath.setAttribute('d', dLine);
          linePath.setAttribute('fill', 'none');
          linePath.setAttribute('stroke', col);
          linePath.setAttribute('stroke-width', s.width || '2.5');
          if (s.dashed) linePath.setAttribute('stroke-dasharray', '4 3');
          svg.appendChild(linePath);
        }

        if (s.type === 'scatter') {
          var scatterG = document.createElementNS(SVG_NS, 'g');
          s.data.forEach(function (pt) {
            var circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', xScale(pt[0]));
            circle.setAttribute('cy', yScale(pt[1]));
            circle.setAttribute('r', s.radius || '4');
            circle.setAttribute('fill', col);
            scatterG.appendChild(circle);
          });
          svg.appendChild(scatterG);
        }

        if (s.type === 'bar') {
          var barW = (plotW / (s.data.length || 1)) * 0.7;
          s.data.forEach(function (pt) {
            var bx = xScale(pt[0]) - barW / 2;
            var by = yScale(pt[1]);
            var bH = yScale(0) - by;
            var bar = document.createElementNS(SVG_NS, 'rect');
            bar.setAttribute('x', bx);
            bar.setAttribute('y', by);
            bar.setAttribute('width', barW);
            bar.setAttribute('height', Math.max(0, bH));
            bar.setAttribute('fill', col);
            bar.setAttribute('rx', '3');
            svg.appendChild(bar);
          });
        }
      });
    }

    // Legend
    if (opt.legend && opt.series) {
      var legG = document.createElementNS(SVG_NS, 'g');
      legG.setAttribute('transform', 'translate(' + (pad.left + 15) + ',' + (pad.top + 15) + ')');
      var legOffset = 0;
      opt.series.forEach(function (s) {
        if (!s.label) return;
        var dot = document.createElementNS(SVG_NS, 'rect');
        dot.setAttribute('x', legOffset);
        dot.setAttribute('y', 0);
        dot.setAttribute('width', 12);
        dot.setAttribute('height', 12);
        dot.setAttribute('rx', 2);
        dot.setAttribute('fill', s.color || FIG.getCSSVar('--accent'));
        legG.appendChild(dot);

        var lbl = document.createElementNS(SVG_NS, 'text');
        lbl.setAttribute('x', legOffset + 18);
        lbl.setAttribute('y', 10);
        lbl.setAttribute('font-size', '11');
        lbl.setAttribute('font-weight', '600');
        lbl.setAttribute('fill', inkText);
        lbl.textContent = s.label;
        legG.appendChild(lbl);

        legOffset += (s.label.length * 7) + 35;
      });
      svg.appendChild(legG);
    }

    return { svg: svg, xScale: xScale, yScale: yScale };
  };

  /* --- Control Helpers (Sliders, Selects, Buttons, Readouts) --- */
  FIG.slider = function (container, opt) {
    var group = document.createElement('div');
    group.className = 'fig-control-group';

    var labelRow = document.createElement('div');
    labelRow.className = 'fig-control-label';

    var labelTxt = document.createElement('label');
    labelTxt.htmlFor = opt.id;
    labelTxt.textContent = opt.label;

    var valDisplay = document.createElement('span');
    valDisplay.className = 'fig-control-value';
    valDisplay.textContent = opt.value + (opt.unit ? ' ' + opt.unit : '');

    labelRow.appendChild(labelTxt);
    labelRow.appendChild(valDisplay);
    group.appendChild(labelRow);

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.id = opt.id;
    slider.className = 'fig-slider';
    slider.min = opt.min;
    slider.max = opt.max;
    slider.step = opt.step || 1;
    slider.value = opt.value;
    slider.setAttribute('aria-valuemin', opt.min);
    slider.setAttribute('aria-valuemax', opt.max);
    slider.setAttribute('aria-valuenow', opt.value);

    slider.addEventListener('input', function () {
      var val = parseFloat(slider.value);
      valDisplay.textContent = val + (opt.unit ? ' ' + opt.unit : '');
      slider.setAttribute('aria-valuenow', val);
      if (opt.onChange) opt.onChange(val);
    });

    group.appendChild(slider);
    container.appendChild(group);

    return {
      element: slider,
      getValue: function () { return parseFloat(slider.value); },
      setValue: function (v) {
        slider.value = v;
        valDisplay.textContent = v + (opt.unit ? ' ' + opt.unit : '');
      }
    };
  };

  FIG.select = function (container, opt) {
    var group = document.createElement('div');
    group.className = 'fig-control-group';

    var labelTxt = document.createElement('label');
    labelTxt.htmlFor = opt.id;
    labelTxt.className = 'fig-control-label';
    labelTxt.textContent = opt.label;
    group.appendChild(labelTxt);

    var sel = document.createElement('select');
    sel.id = opt.id;
    sel.className = 'fig-select';

    opt.options.forEach(function (o) {
      var optEl = document.createElement('option');
      optEl.value = o.value;
      optEl.textContent = o.label;
      if (o.value === opt.value) optEl.selected = true;
      sel.appendChild(optEl);
    });

    sel.addEventListener('change', function () {
      if (opt.onChange) opt.onChange(sel.value);
    });

    group.appendChild(sel);
    container.appendChild(group);

    return {
      element: sel,
      getValue: function () { return sel.value; }
    };
  };

  FIG.button = function (container, opt) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fig-button';
    btn.textContent = opt.label;
    btn.addEventListener('click', function (e) {
      if (opt.onClick) opt.onClick(e);
    });
    container.appendChild(btn);
    return btn;
  };

  FIG.readouts = function (container, items) {
    var row = document.createElement('div');
    row.className = 'fig-readouts-row';
    row.style.display = 'flex';
    row.style.gap = '1.5rem';
    row.style.flexWrap = 'wrap';
    row.style.marginTop = '0.75rem';
    row.style.fontFamily = FIG.getCSSVar('--font-mono');
    row.style.fontSize = '0.85rem';

    var map = {};
    items.forEach(function (item) {
      var span = document.createElement('div');
      span.innerHTML = '<span style="color:var(--ink-muted);">' + item.label + ':</span> ' +
        '<strong id="' + item.id + '" style="color:var(--accent);">' + item.value + '</strong>' +
        (item.unit ? ' ' + item.unit : '');
      row.appendChild(span);
      map[item.id] = span.querySelector('#' + item.id);
    });

    container.appendChild(row);

    return {
      update: function (id, val) {
        if (map[id]) map[id].textContent = val;
      }
    };
  };

  /* --- Canvas Helper with DPR Scaling --- */
  FIG.createCanvas = function (container, width, height) {
    var canvas = document.createElement('canvas');
    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.maxWidth = '100%';
    canvas.style.width = width + 'px';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    container.appendChild(canvas);

    return { canvas: canvas, ctx: ctx, dpr: dpr, width: width, height: height };
  };

  /* --- Visible-Only Animation Loop --- */
  FIG.animate = function (figureEl, renderFn) {
    var isRunning = false;
    var rafId = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function loop(timestamp) {
      if (!isRunning) return;
      renderFn(timestamp);
      rafId = window.requestAnimationFrame(loop);
    }

    function start() {
      if (reduced) {
        // Run single frame for reduced-motion users
        renderFn(0);
        return;
      }
      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(loop);
      }
    }

    function stop() {
      isRunning = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    if ('IntersectionObserver' in window && figureEl) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            start();
          } else {
            stop();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(figureEl);
    } else {
      start();
    }

    return { start: start, stop: stop };
  };

  /* --- Quiz Component --- */
  FIG.quiz = function (container, questions) {
    container.innerHTML = '';
    var widget = document.createElement('div');
    widget.className = 'quiz-widget';

    var score = 0;
    var answered = 0;

    var header = document.createElement('div');
    header.className = 'quiz-header';
    header.innerHTML = '<span class="quiz-title">Test Your Understanding</span>' +
      '<span class="quiz-score" aria-live="polite">Score: 0 / ' + questions.length + '</span>';
    widget.appendChild(header);

    var scoreEl = header.querySelector('.quiz-score');

    questions.forEach(function (q, qIdx) {
      var box = document.createElement('div');
      box.className = 'quiz-question-box';

      var qTitle = document.createElement('div');
      qTitle.className = 'quiz-question-text';
      qTitle.textContent = (qIdx + 1) + '. ' + q.question;
      box.appendChild(qTitle);

      var optList = document.createElement('div');
      optList.className = 'quiz-options';
      optList.setAttribute('role', 'group');
      optList.setAttribute('aria-label', 'Question ' + (qIdx + 1));

      var explBox = document.createElement('div');
      explBox.className = 'quiz-explanation';
      explBox.style.display = 'none';

      q.options.forEach(function (optText, oIdx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = optText;

        btn.addEventListener('click', function () {
          // Disable options in this question
          var siblings = optList.querySelectorAll('.quiz-option');
          for (var s = 0; s < siblings.length; s++) {
            siblings[s].disabled = true;
          }

          if (oIdx === q.answer) {
            btn.classList.add('correct');
            score++;
          } else {
            btn.classList.add('incorrect');
            siblings[q.answer].classList.add('correct');
          }

          answered++;
          scoreEl.textContent = 'Score: ' + score + ' / ' + questions.length;

          explBox.style.display = 'block';
          explBox.innerHTML = '<strong>' + (oIdx === q.answer ? 'Correct! ' : 'Incorrect. ') + '</strong>' + q.explanation;
        });

        optList.appendChild(btn);
      });

      box.appendChild(optList);
      box.appendChild(explBox);
      widget.appendChild(box);
    });

    container.appendChild(widget);
  };

  /* --- Timeline Component --- */
  FIG.timeline = function (container, events) {
    container.innerHTML = '';
    var list = document.createElement('ol');
    list.className = 'timeline-strip';

    events.forEach(function (ev) {
      var item = document.createElement('li');
      item.className = 'timeline-item';

      var date = document.createElement('div');
      date.className = 'timeline-date';
      date.textContent = ev.date;

      var title = document.createElement('div');
      title.className = 'timeline-title';
      title.textContent = ev.title;

      var desc = document.createElement('div');
      desc.className = 'timeline-desc';
      desc.textContent = ev.desc;

      item.appendChild(date);
      item.appendChild(title);
      item.appendChild(desc);
      list.appendChild(item);
    });

    container.appendChild(list);
  };

  /* --- Vector Map Component --- */
  FIG.map = function (container, opt) {
    container.innerHTML = '';
    var w = opt.width || 720;
    var h = opt.height || 420;
    var svg = FIG.createSVG(container, w, h, opt.title || 'Interactive vector map');

    var oceanCol = FIG.getCSSVar('--surface-sunken', '#eef2f6');
    var landCol = FIG.getCSSVar('--surface-raised', '#dedbd2');
    var routeCol = FIG.getCSSVar('--accent', '#1b4965');
    var inkText = FIG.getCSSVar('--ink', '#17181c');

    // Base background
    var bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('width', w);
    bg.setAttribute('height', h);
    bg.setAttribute('fill', oceanCol);
    bg.setAttribute('rx', '8');
    svg.appendChild(bg);

    // Landmass paths
    if (opt.landPaths) {
      opt.landPaths.forEach(function (p) {
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', p);
        path.setAttribute('fill', landCol);
        path.setAttribute('stroke', FIG.getCSSVar('--border'));
        path.setAttribute('stroke-width', '1');
        svg.appendChild(path);
      });
    }

    // Trade routes or vectors
    if (opt.routes) {
      opt.routes.forEach(function (r) {
        var route = document.createElementNS(SVG_NS, 'path');
        route.setAttribute('d', r.d);
        route.setAttribute('fill', 'none');
        route.setAttribute('stroke', r.color || routeCol);
        route.setAttribute('stroke-width', r.width || '2.5');
        if (r.dashed) route.setAttribute('stroke-dasharray', '5 4');
        svg.appendChild(route);
      });
    }

    // Ports / Markers
    if (opt.markers) {
      opt.markers.forEach(function (m) {
        var g = document.createElementNS(SVG_NS, 'g');
        var circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', m.x);
        circle.setAttribute('cy', m.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', m.color || routeCol);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1.5');
        g.appendChild(circle);

        if (m.label) {
          var lbl = document.createElementNS(SVG_NS, 'text');
          lbl.setAttribute('x', m.x + (m.align === 'left' ? -8 : 8));
          lbl.setAttribute('y', m.y + 4);
          lbl.setAttribute('text-anchor', m.align === 'left' ? 'end' : 'start');
          lbl.setAttribute('font-size', '11');
          lbl.setAttribute('font-weight', '600');
          lbl.setAttribute('fill', inkText);
          lbl.textContent = m.label;
          g.appendChild(lbl);
        }
        svg.appendChild(g);
      });
    }

    // Attribution
    var attr = document.createElementNS(SVG_NS, 'text');
    attr.setAttribute('x', w - 10);
    attr.setAttribute('y', h - 10);
    attr.setAttribute('text-anchor', 'end');
    attr.setAttribute('font-size', '10');
    attr.setAttribute('fill', FIG.getCSSVar('--ink-muted'));
    attr.textContent = opt.attribution || 'Map data: Natural Earth (Public Domain)';
    svg.appendChild(attr);

    return svg;
  };

  /* --- Sortable Data Table Component --- */
  FIG.table = function (container, opt) {
    container.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'table-wrapper';

    var table = document.createElement('table');
    table.className = 'data-table';

    var thead = document.createElement('thead');
    var trHead = document.createElement('tr');

    var currentSortCol = -1;
    var sortAsc = true;
    var rowsData = opt.rows.slice();

    opt.headers.forEach(function (h, colIdx) {
      var th = document.createElement('th');
      th.textContent = h + ' ↕';
      th.setAttribute('tabindex', '0');
      th.setAttribute('role', 'columnheader');
      th.setAttribute('aria-sort', 'none');

      function doSort() {
        if (currentSortCol === colIdx) {
          sortAsc = !sortAsc;
        } else {
          currentSortCol = colIdx;
          sortAsc = true;
        }

        rowsData.sort(function (a, b) {
          var valA = a[colIdx];
          var valB = b[colIdx];
          var numA = parseFloat(valA);
          var numB = parseFloat(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortAsc ? numA - numB : numB - numA;
          }
          return sortAsc
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        });

        renderBody();
      }

      th.addEventListener('click', doSort);
      th.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          doSort();
        }
      });

      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    function renderBody() {
      tbody.innerHTML = '';
      rowsData.forEach(function (row) {
        var tr = document.createElement('tr');
        row.forEach(function (cell) {
          var td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    renderBody();
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  };

  /* --- Global Initializer for <figure class="fig" data-fig="name"> --- */
  FIG.initAll = function () {
    var figures = document.querySelectorAll('figure.fig[data-fig], figure[data-fig]');
    for (var i = 0; i < figures.length; i++) {
      var figEl = figures[i];
      if (!figEl.classList.contains('fig')) {
        figEl.classList.add('fig');
      }
      var name = figEl.getAttribute('data-fig');
      if (figEl.getAttribute('data-fig-ready')) continue;
      if (name && typeof FIG[name] === 'function') {
        figEl.setAttribute('data-fig-ready', '1');
        try {
          FIG[name](figEl);
        } catch (err) {
          console.error('Error initializing figure "' + name + '":', err);
        }
      }
    }
  };

  window.FIG = FIG;

  // Start only after every deferred figure script has registered its figures.
  // (Deferred scripts run before DOMContentLoaded; starting earlier left figures blank.)
  var started = false;
  function startFigures() {
    if (started) return;
    started = true;
    FIG.initAll();
  }
  if (document.readyState === 'complete') {
    startFigures();
  } else {
    document.addEventListener('DOMContentLoaded', startFigures);
    window.addEventListener('load', startFigures);
  }
})();
