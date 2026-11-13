/**
 * Figures for Part 4: From Tally Marks to Proof
 * RNLearn - Long-form Learning & Essays
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  /* -------------------------------------------------------------------------
   * Figure 1: The Incommensurable Diagonal (Antanairesis on the Square)
   * ------------------------------------------------------------------------- */
  FIG['fig-incommensurable'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-incom-step">Geometric Reciprocal Subtraction Step: ' +
            '<span id="fig-incom-step-val" class="fig-readout">Step 0 (Initial Square)</span>' +
          '</label>' +
          '<input type="range" id="fig-incom-step" min="0" max="4" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-incom-btn-reset" class="fig-btn">Reset</button>' +
          '<button type="button" id="fig-incom-btn-next" class="fig-btn">Next Subtraction Step →</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="position:relative; min-height:360px;">' +
        '<svg id="fig-incom-svg" viewBox="0 0 500 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-incom-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var stepSlider = container.querySelector('#fig-incom-step');
    var stepVal = container.querySelector('#fig-incom-step-val');
    var btnReset = container.querySelector('#fig-incom-btn-reset');
    var btnNext = container.querySelector('#fig-incom-btn-next');
    var svg = container.querySelector('#fig-incom-svg');
    var explain = container.querySelector('#fig-incom-explain');

    var stepNames = [
      'Step 0: Unit Square & Diagonal d = s√2',
      'Step 1: First Subtraction (Cut side s from diagonal d)',
      'Step 2: Construct Perpendicular (New smaller square created)',
      'Step 3: Repeat Reciprocal Subtraction (Scale factor √2 - 1)',
      'Step 4: The Infinite Descent (Never Terminates)'
    ];

    var explanations = [
      'Let the side of square ABCD be s = 1, and its diagonal be d = √2. If s and d were commensurable (had a common unit measure u), then both s and d would be exact integer multiples of u (s = n·u, d = m·u). Euclid and the Pythagoreans tested this using <em>antanairesis</em> (mutual subtraction / the Euclidean algorithm).',
      'Step 1: Mark point E on diagonal AC such that AE = AB = s. The remaining segment EC has length d - s = (√2 - 1)s. If u measured both s and d, it must also measure their difference EC exactly.',
      'Step 2: Erect a perpendicular to AC at E meeting side BC at F. By congruent right triangles, EF = EC = d - s, and the triangle FEC is an isosceles right triangle! A new, smaller square of side s₁ = d - s is formed.',
      'Step 3: The hypotenuse of this smaller triangle is FC = s - (d - s) = 2s - d. Its diagonal is d₁ = s₁√2. We are now performing the exact same subtraction on a new square whose dimensions are reduced by factor (√2 - 1) ≈ 0.4142.',
      'Step 4: Because every subtraction creates an identical smaller right isosceles triangle with non-zero integer multiples of u, this process must continue forever. But in whole numbers, an infinite sequence of strictly decreasing positive integers is impossible (axiom of well-ordering / infinite descent). Therefore, no unit measure u can ever exist. Side and diagonal are strictly <strong>incommensurable</strong>.'
    ];

    function draw(step) {
      stepVal.textContent = stepNames[step];
      explain.innerHTML = explanations[step];

      var originX = 130;
      var originY = 310;
      var side = 220;
      var diag = side * Math.SQRT2;

      var svgContent =
        '<defs>' +
          '<marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
            '<path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-text-muted, #71717a)"/>' +
          '</marker>' +
        '</defs>' +
        '<!-- Background grid hints -->' +
        '<rect x="0" y="0" width="500" height="360" fill="transparent"/>' +
        '<!-- Main Square ABCD -->' +
        '<rect x="' + originX + '" y="' + (originY - side) + '" width="' + side + '" height="' + side + '" ' +
              'fill="rgba(59, 130, 246, 0.06)" stroke="var(--color-border, #3b82f6)" stroke-width="2"/>' +
        '<!-- Diagonal AC -->' +
        '<line x1="' + originX + '" y1="' + originY + '" x2="' + (originX + side) + '" y2="' + (originY - side) + '" ' +
              'stroke="#ef4444" stroke-width="2.5"/>' +
        '<!-- Labels for vertices -->' +
        '<text x="' + (originX - 18) + '" y="' + (originY + 12) + '" font-size="14" font-weight="600" fill="currentColor">A</text>' +
        '<text x="' + (originX + side + 8) + '" y="' + (originY + 12) + '" font-size="14" font-weight="600" fill="currentColor">B</text>' +
        '<text x="' + (originX + side + 8) + '" y="' + (originY - side - 4) + '" font-size="14" font-weight="600" fill="currentColor">C</text>' +
        '<text x="' + (originX - 18) + '" y="' + (originY - side - 4) + '" font-size="14" font-weight="600" fill="currentColor">D</text>' +
        '<text x="' + (originX + side/2) + '" y="' + (originY + 22) + '" font-size="13" fill="var(--color-text-muted, #666)" text-anchor="middle">side s</text>' +
        '<text x="' + (originX + side/2 - 20) + '" y="' + (originY - side/2 - 14) + '" font-size="13" fill="#ef4444" font-weight="600">diagonal d = s√2</text>';

      if (step >= 1) {
        // Cut AE = s on diagonal AC
        // Vector along diagonal is (side, -side), normalized: (1/√2, -1/√2)
        var ae = side; // length = s
        var ex = originX + ae / Math.SQRT2;
        var ey = originY - ae / Math.SQRT2;

        // Circular arc from B to E centered at A
        svgContent +=
          '<!-- Arc showing AE = AB = s -->' +
          '<path d="M ' + (originX + side) + ' ' + originY + ' A ' + side + ' ' + side + ' 0 0 0 ' + ex + ' ' + ey + '" ' +
                'fill="none" stroke="#8b5cf6" stroke-width="1.8" stroke-dasharray="4 3"/>' +
          '<circle cx="' + ex + '" cy="' + ey + '" r="4" fill="#8b5cf6"/>' +
          '<text x="' + (ex - 14) + '" y="' + (ey - 10) + '" font-size="13" font-weight="600" fill="#8b5cf6">E</text>' +
          '<!-- Bracket or label for EC -->' +
          '<line x1="' + ex + '" y1="' + ey + '" x2="' + (originX + side) + '" y2="' + (originY - side) + '" stroke="#10b981" stroke-width="3"/>' +
          '<text x="' + (ex + 35) + '" y="' + (ey - 24) + '" font-size="12" font-weight="600" fill="#10b981">EC = d - s</text>';
      }

      if (step >= 2) {
        // Perpendicular at E meets BC at F
        var ex2 = originX + side / Math.SQRT2;
        var ey2 = originY - side / Math.SQRT2;
        // Point F on BC: x = originX + side.
        // Triangle E F C is right isosceles with right angle at E.
        // Slope of AC is -1. Normal to AC is slope +1.
        // Line from E with slope +1: y - ey2 = 1 * (x - ex2) => y = x - ex2 + ey2.
        // At x = originX + side:
        var fx = originX + side;
        var fy = fx - ex2 + ey2;

        svgContent +=
          '<!-- Perpendicular EF to BC -->' +
          '<line x1="' + ex2 + '" y1="' + ey2 + '" x2="' + fx + '" y2="' + fy + '" stroke="#f59e0b" stroke-width="2.5"/>' +
          '<circle cx="' + fx + '" cy="' + fy + '" r="4" fill="#f59e0b"/>' +
          '<text x="' + (fx + 8) + '" y="' + (fy + 4) + '" font-size="13" font-weight="600" fill="#f59e0b">F</text>' +
          '<!-- Smaller shaded triangle FEC -->' +
          '<polygon points="' + ex2 + ',' + ey2 + ' ' + fx + ',' + fy + ' ' + (originX + side) + ',' + (originY - side) + '" ' +
                   'fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<text x="' + (originX + side + 12) + '" y="' + (originY - side + (fy - (originY - side))/2) + '" font-size="11" fill="#f59e0b">s₁ = d - s</text>';
      }

      if (step >= 3) {
        // New small square constructed on EC
        var s1 = diag - side;
        svgContent +=
          '<!-- Annotation showing the recurrence -->' +
          '<rect x="20" y="25" width="220" height="95" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ccc)" stroke-width="1"/>' +
          '<text x="32" y="48" font-size="12" font-weight="600" fill="currentColor">Recurrence Relation:</text>' +
          '<text x="32" y="70" font-size="12" fill="#10b981">s₁ = d₀ - s₀ = (√2 - 1) s₀</text>' +
          '<text x="32" y="92" font-size="12" fill="#ef4444">d₁ = 2s₀ - d₀ = (√2 - 1) d₀</text>' +
          '<text x="32" y="110" font-size="11" fill="var(--color-text-muted, #666)">Ratio s₁/d₁ = s₀/d₀ is invariant!</text>';
      }

      if (step >= 4) {
        svgContent +=
          '<!-- Infinite descent symbol & summary -->' +
          '<g transform="translate(290, 40)">' +
            '<rect x="0" y="0" width="195" height="110" rx="6" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" stroke-width="1.5"/>' +
            '<text x="12" y="24" font-size="13" font-weight="bold" fill="#ef4444">Infinite Descent</text>' +
            '<text x="12" y="46" font-size="11" fill="currentColor">s > s₁ > s₂ > s₃ > ... > 0</text>' +
            '<text x="12" y="66" font-size="11" fill="currentColor">If s, d were integers, this</text>' +
            '<text x="12" y="84" font-size="11" fill="currentColor">would be an endless chain</text>' +
            '<text x="12" y="102" font-size="11" font-weight="600" fill="#ef4444">of smaller positive integers: ✗</text>' +
          '</g>';
      }

      svg.innerHTML = svgContent;
    }

    stepSlider.addEventListener('input', function () {
      draw(parseInt(stepSlider.value, 10));
    });

    btnReset.addEventListener('click', function () {
      stepSlider.value = 0;
      draw(0);
    });

    btnNext.addEventListener('click', function () {
      var next = (parseInt(stepSlider.value, 10) + 1) % 5;
      stepSlider.value = next;
      draw(next);
    });

    draw(0);
  };

  /* -------------------------------------------------------------------------
   * Figure 2: Euclid’s Windmill (Book I Proposition 47)
   * ------------------------------------------------------------------------- */
  FIG['fig-euclid-i47'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-i47-phase">Shear & Proof Animation Step: ' +
            '<span id="fig-i47-phase-val" class="fig-readout">Step 1: The Windmill Figure</span>' +
          '</label>' +
          '<input type="range" id="fig-i47-phase" min="1" max="5" step="1" value="1">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-i47-btn-prev" class="fig-btn">← Previous</button>' +
          '<button type="button" id="fig-i47-btn-next" class="fig-btn">Next Step →</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:380px;">' +
        '<svg id="fig-i47-svg" viewBox="0 0 540 400" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-i47-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var phaseSlider = container.querySelector('#fig-i47-phase');
    var phaseVal = container.querySelector('#fig-i47-phase-val');
    var btnPrev = container.querySelector('#fig-i47-btn-prev');
    var btnNext = container.querySelector('#fig-i47-btn-next');
    var svg = container.querySelector('#fig-i47-svg');
    var explain = container.querySelector('#fig-i47-explain');

    var phases = [
      '',
      'Step 1: The Classic Windmill Scaffolding (Book I Prop 47)',
      'Step 2: Triangle △ABD and Parallels (Shear to Base BD)',
      'Step 3: Rotation (△ABD ≅ △FBC by SAS Congruence)',
      'Step 4: Shear on Square ABFG (△FBC = Half of Square ABFG)',
      'Step 5: Completion (Both Squares Equal Rectangles of Hypotenuse Square)'
    ];

    var explanations = [
      '',
      'Right-angled triangle △ABC has right angle at A. On each of the three sides BC, AB, and AC, squares BDEC, ABFG, and ACKH are constructed outwards. Euclid’s genius was to avoid algebraic area multiplication ($a^2 + b^2 = c^2$) and prove that the square on BC is physically composed of two rectangles, each having the exact area of the corresponding smaller square.',
      'From A, drop perpendicular AL to the hypotenuse BC and extend it through DE to L. Join AD and FC. Notice triangle △ABD and rectangle BDLM share the same base BD and lie between the same parallels BD and AL. By Proposition I.41, the area of rectangle BDLM is exactly double the area of △ABD.',
      'Now compare △ABD and △FBC: side BD = BC (sides of large square), side AB = FB (sides of smaller square), and angle ∠ABD = ∠ABC + 90° = ∠FBC! Therefore, by Proposition I.4 (SAS), △ABD is congruent to △FBC in every respect.',
      'Now look at △FBC and square ABFG: they share base FB and lie between the same parallels FB and GC. Thus, the area of square ABFG is double the area of △FBC. Since △FBC ≅ △ABD, Double(△ABD) = Double(△FBC), which means: <strong>Rectangle BDLM = Square ABFG</strong>!',
      'By an exactly symmetrical argument, dropping AE and joining BK proves that <strong>Rectangle MCEL = Square ACKH</strong>. Adding the two rectangles together gives the entire square on the hypotenuse BDEC. Therefore: <em>Square on BC = Square on AB + Square on AC</em>. Q.E.D.!'
    ];

    function draw(phase) {
      phaseVal.textContent = phases[phase];
      explain.innerHTML = explanations[phase];

      // Geometry of 3-4-5 triangle
      // A at (250, 180)
      // B at (190, 260) -> dx = -60, dy = 80 -> len AB = 100
      // C at (330, 240) -> len AC around 75... let's set exact right angle
      // Let A = (240, 190)
      // Vector AB = (-80, 60), length = 100
      // Vector AC perpendicular to AB: (60, 80) * 0.75 = (45, 60), length = 75
      // Then dot product = -80*45 + 60*60 = -3600 + 3600 = 0 (exact right angle!)
      var ax = 240, ay = 190;
      var bx = ax - 80, by = ay + 60; // (160, 250)
      var cx = ax + 45, cy = ay + 60; // (285, 250)
      // BC is horizontal! from x=160 to x=285 -> length = 125.
      // Square on BC goes downward:
      var bcLen = cx - bx; // 125
      var dx = bx, dy = by + bcLen; // (160, 375)
      var ex = cx, ey = cy + bcLen; // (285, 375)

      // Square on AB: AB vector = (-80, 60). Outward normal = (-60, -80)
      var fx = bx - 60, fy = by - 80;
      var gx = ax - 60, gy = ay - 80;

      // Square on AC: AC vector = (45, 60). Outward normal = (60, -45)
      var hx = cx + 60, hy = cy - 45;
      var kx = ax + 60, ky = ay - 45;

      // Perpendicular from A to BC: BC is y=250, so foot of perpendicular is (ax, 250) = (240, 250).
      var mx = ax, my = by; // (240, 250)
      var lx = ax, ly = dy; // (240, 375)

      var svgContent =
        '<defs>' +
          '<linearGradient id="rectLeftGrad" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>' +
            '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1"/>' +
          '</linearGradient>' +
          '<linearGradient id="rectRightGrad" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#10b981" stop-opacity="0.1"/>' +
            '<stop offset="100%" stop-color="#10b981" stop-opacity="0.3"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Large Square BDEC on hypotenuse -->' +
        '<polygon points="' + bx + ',' + by + ' ' + cx + ',' + cy + ' ' + ex + ',' + ey + ' ' + dx + ',' + dy + '" ' +
                 'fill="rgba(244, 244, 245, 0.4)" stroke="currentColor" stroke-width="1.8"/>' +
        '<!-- Square ABFG on side AB -->' +
        '<polygon points="' + bx + ',' + by + ' ' + ax + ',' + ay + ' ' + gx + ',' + gy + ' ' + fx + ',' + fy + '" ' +
                 'fill="' + (phase >= 4 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.08)') + '" ' +
                 'stroke="#3b82f6" stroke-width="2"/>' +
        '<!-- Square ACKH on side AC -->' +
        '<polygon points="' + ax + ',' + ay + ' ' + cx + ',' + cy + ' ' + hx + ',' + hy + ' ' + kx + ',' + ky + '" ' +
                 'fill="' + (phase === 5 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.08)') + '" ' +
                 'stroke="#10b981" stroke-width="2"/>' +
        '<!-- Main Triangle ABC -->' +
        '<polygon points="' + ax + ',' + ay + ' ' + bx + ',' + by + ' ' + cx + ',' + cy + '" ' +
                 'fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="2.5"/>' +
        '<!-- Right-angle symbol at A -->' +
        '<path d="M ' + (ax - 8) + ' ' + (ay + 6) + ' L ' + (ax - 2) + ' ' + (ay + 14) + ' L ' + (ax + 6) + ' ' + (ay + 8) + '" ' +
              'fill="none" stroke="#f59e0b" stroke-width="1.5"/>';

      // Altitude AL
      if (phase >= 2) {
        svgContent +=
          '<!-- Altitude line AL dividing the hypotenuse square -->' +
          '<line x1="' + ax + '" y1="' + ay + '" x2="' + lx + '" y2="' + ly + '" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4 3"/>' +
          '<text x="' + (mx + 4) + '" y="' + (my - 6) + '" font-size="11" fill="#ef4444">M</text>' +
          '<text x="' + (lx + 4) + '" y="' + (ly + 14) + '" font-size="11" fill="#ef4444">L</text>';
      }

      // Phase 2: Triangle ABD
      if (phase === 2) {
        svgContent +=
          '<!-- Line AD -->' +
          '<line x1="' + ax + '" y1="' + ay + '" x2="' + dx + '" y2="' + dy + '" stroke="#8b5cf6" stroke-width="2"/>' +
          '<!-- Highlighted Triangle ABD -->' +
          '<polygon points="' + ax + ',' + ay + ' ' + bx + ',' + by + ' ' + dx + ',' + dy + '" fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" stroke-width="2"/>' +
          '<text x="20" y="320" font-size="12" fill="#8b5cf6" font-weight="600">△ABD and Rect BDLM</text>' +
          '<text x="20" y="338" font-size="11" fill="currentColor">share base BD and parallels</text>' +
          '<text x="20" y="354" font-size="11" fill="#3b82f6" font-weight="600">Area(BDLM) = 2 × Area(△ABD)</text>';
      }

      // Phase 3: Compare ABD and FBC
      if (phase === 3) {
        svgContent +=
          '<!-- Lines AD and FC -->' +
          '<line x1="' + ax + '" y1="' + ay + '" x2="' + dx + '" y2="' + dy + '" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="3 3"/>' +
          '<line x1="' + fx + '" y1="' + fy + '" x2="' + cx + '" y2="' + cy + '" stroke="#ec4899" stroke-width="2"/>' +
          '<polygon points="' + fx + ',' + fy + ' ' + bx + ',' + by + ' ' + cx + ',' + cy + '" fill="rgba(236, 72, 153, 0.3)" stroke="#ec4899" stroke-width="2"/>' +
          '<polygon points="' + ax + ',' + ay + ' ' + bx + ',' + by + ' ' + dx + ',' + dy + '" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" stroke-width="1.5"/>' +
          '<text x="15" y="60" font-size="12" fill="#ec4899" font-weight="bold">SAS Congruence Proof:</text>' +
          '<text x="15" y="80" font-size="11" fill="currentColor">1. FB = AB (side of small square)</text>' +
          '<text x="15" y="96" font-size="11" fill="currentColor">2. BC = BD (side of large square)</text>' +
          '<text x="15" y="112" font-size="11" fill="currentColor">3. ∠FBC = 90° + ∠B = ∠ABD</text>' +
          '<text x="15" y="132" font-size="12" font-weight="bold" fill="#8b5cf6">∴ △FBC ≅ △ABD</text>';
      }

      // Phase 4 & 5: Rectangle fills
      if (phase >= 4) {
        svgContent +=
          '<!-- Left rectangle BDLM filled -->' +
          '<polygon points="' + bx + ',' + by + ' ' + mx + ',' + my + ' ' + lx + ',' + ly + ' ' + dx + ',' + dy + '" ' +
                   'fill="url(#rectLeftGrad)" stroke="#3b82f6" stroke-width="2"/>' +
          '<text x="' + (bx + 20) + '" y="' + (by + 70) + '" font-size="12" font-weight="600" fill="#3b82f6">Area = AB²</text>';
      }

      if (phase === 5) {
        svgContent +=
          '<!-- Right rectangle MCEL filled -->' +
          '<polygon points="' + mx + ',' + my + ' ' + cx + ',' + cy + ' ' + ex + ',' + ey + ' ' + lx + ',' + ly + '" ' +
                   'fill="url(#rectRightGrad)" stroke="#10b981" stroke-width="2"/>' +
          '<text x="' + (mx + 10) + '" y="' + (my + 70) + '" font-size="12" font-weight="600" fill="#10b981">Area = AC²</text>' +
          '<!-- Summation callout -->' +
          '<g transform="translate(330, 40)">' +
            '<rect x="0" y="0" width="190" height="75" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Book I Prop 47 Q.E.D.</text>' +
            '<text x="12" y="46" font-size="12" fill="#3b82f6">Rect BDLM = AB²</text>' +
            '<text x="12" y="64" font-size="12" fill="#10b981">Rect MCEL = AC²</text>' +
            '<text x="12" y="82" font-size="12" font-weight="bold" fill="#f59e0b">Total BC² = AB² + AC²</text>' +
          '</g>';
      }

      // Labels for points
      svgContent +=
        '<text x="' + (ax - 4) + '" y="' + (ay - 8) + '" font-size="13" font-weight="bold" fill="currentColor">A</text>' +
        '<text x="' + (bx - 16) + '" y="' + (by - 4) + '" font-size="13" font-weight="bold" fill="currentColor">B</text>' +
        '<text x="' + (cx + 8) + '" y="' + (cy - 4) + '" font-size="13" font-weight="bold" fill="currentColor">C</text>' +
        '<text x="' + (dx - 16) + '" y="' + (dy + 12) + '" font-size="13" font-weight="bold" fill="currentColor">D</text>' +
        '<text x="' + (ex + 8) + '" y="' + (ey + 12) + '" font-size="13" font-weight="bold" fill="currentColor">E</text>' +
        '<text x="' + (fx - 14) + '" y="' + (fy - 4) + '" font-size="12" fill="#3b82f6">F</text>' +
        '<text x="' + (gx - 10) + '" y="' + (gy - 6) + '" font-size="12" fill="#3b82f6">G</text>' +
        '<text x="' + (hx + 8) + '" y="' + (hy - 4) + '" font-size="12" fill="#10b981">H</text>' +
        '<text x="' + (kx + 6) + '" y="' + (ky - 6) + '" font-size="12" fill="#10b981">K</text>';

      svg.innerHTML = svgContent;
    }

    phaseSlider.addEventListener('input', function () {
      draw(parseInt(phaseSlider.value, 10));
    });

    btnPrev.addEventListener('click', function () {
      var cur = parseInt(phaseSlider.value, 10);
      if (cur > 1) {
        phaseSlider.value = cur - 1;
        draw(cur - 1);
      }
    });

    btnNext.addEventListener('click', function () {
      var cur = parseInt(phaseSlider.value, 10);
      if (cur < 5) {
        phaseSlider.value = cur + 1;
        draw(cur + 1);
      }
    });

    draw(1);
  };

  /* -------------------------------------------------------------------------
   * Figure 3: Archimedes' Polygon Method of Exhaustion for Pi
   * ------------------------------------------------------------------------- */
  FIG['fig-archimedes-pi'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-pi-n">Number of Polygon Sides (n): ' +
            '<span id="fig-pi-n-val" class="fig-readout">n = 6 (Hexagon)</span>' +
          '</label>' +
          '<input type="range" id="fig-pi-n" min="0" max="4" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="checkbox" id="fig-pi-show-in" checked> Show Inscribed Polygon</label>' +
          '<label style="margin-left:1rem;"><input type="checkbox" id="fig-pi-show-circ" checked> Show Circumscribed Polygon</label>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-pi-svg" viewBox="0 0 520 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-pi-readout" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var nSlider = container.querySelector('#fig-pi-n');
    var nVal = container.querySelector('#fig-pi-n-val');
    var checkIn = container.querySelector('#fig-pi-show-in');
    var checkCirc = container.querySelector('#fig-pi-show-circ');
    var svg = container.querySelector('#fig-pi-svg');
    var readout = container.querySelector('#fig-pi-readout');

    var sides = [6, 12, 24, 48, 96];

    function draw() {
      var idx = parseInt(nSlider.value, 10);
      var n = sides[idx];
      nVal.textContent = 'n = ' + n + ' sides' + (n === 96 ? ' (Archimedes’ Final Bound)' : '');

      var showIn = checkIn.checked;
      var showCirc = checkCirc.checked;

      // Circle of diameter 1 (radius r = 1/2).
      // Inscribed perimeter: p_in = n * sin(pi / n)
      // Circumscribed perimeter: p_circ = n * tan(pi / n)
      var pIn = n * Math.sin(Math.PI / n);
      var pCirc = n * Math.tan(Math.PI / n);
      var errorIn = ((Math.PI - pIn) / Math.PI * 100).toFixed(4);
      var errorCirc = ((pCirc - Math.PI) / Math.PI * 100).toFixed(4);

      var archimedesText = '';
      if (n === 96) {
        archimedesText = '<div style="margin-top:0.5rem; padding:0.5rem 0.75rem; background:rgba(245, 158, 11, 0.12); border-left:3px solid #f59e0b; border-radius:4px;">' +
          '<strong>Archimedes’ Historic Result (<em>Measurement of a Circle</em>, Prop. 3):</strong><br>' +
          'Lower bound: $3\\frac{10}{71} = \\frac{223}{71} \\approx 3.140845$<br>' +
          'Upper bound: $3\\frac{1}{7} = \\frac{22}{7} \\approx 3.142857$<br>' +
          'Actual $n=96$ theoretical values: Inscribed $p = ' + pIn.toFixed(6) + '$, Circumscribed $p = ' + pCirc.toFixed(6) + '$.' +
        '</div>';
      }

      readout.innerHTML =
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">' +
          '<div style="background:rgba(59, 130, 246, 0.08); padding:0.4rem 0.6rem; border-radius:4px;">' +
            '<span style="color:#3b82f6; font-weight:600;">Inscribed Lower Bound:</span><br>' +
            'Perimeter / Diameter = <strong>' + pIn.toFixed(6) + '</strong> (Error: -' + errorIn + '%)' +
          '</div>' +
          '<div style="background:rgba(239, 68, 68, 0.08); padding:0.4rem 0.6rem; border-radius:4px;">' +
            '<span style="color:#ef4444; font-weight:600;">Circumscribed Upper Bound:</span><br>' +
            'Perimeter / Diameter = <strong>' + pCirc.toFixed(6) + '</strong> (Error: +' + errorCirc + '%)' +
          '</div>' +
        '</div>' +
        'Rigorous trap: $' + pIn.toFixed(5) + ' < \\pi < ' + pCirc.toFixed(5) + '$. True $\\pi \\approx 3.14159265$.' + archimedesText;

      var cx = 180, cy = 180, R = 130;

      var svgContent =
        '<defs>' +
          '<linearGradient id="piCircGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>' +
            '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Main Circle -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#piCircGrad)" stroke="currentColor" stroke-width="2"/>';

      // Circumscribed polygon: radius to vertices = R / cos(pi/n)
      if (showCirc) {
        var R_circ = R / Math.cos(Math.PI / n);
        var circPoints = [];
        for (var i = 0; i < n; i++) {
          var angle = (i * 2 * Math.PI / n) - (Math.PI / 2);
          var px = cx + R_circ * Math.cos(angle);
          var py = cy + R_circ * Math.sin(angle);
          circPoints.push(px.toFixed(2) + ',' + py.toFixed(2));
        }
        svgContent +=
          '<!-- Circumscribed Polygon -->' +
          '<polygon points="' + circPoints.join(' ') + '" fill="none" stroke="#ef4444" stroke-width="' + (n >= 48 ? 1.2 : 2) + '" stroke-dasharray="' + (n >= 48 ? '3 2' : 'none') + '"/>';
      }

      // Inscribed polygon: radius to vertices = R
      if (showIn) {
        var inPoints = [];
        for (var j = 0; j < n; j++) {
          var aIn = (j * 2 * Math.PI / n) - (Math.PI / 2) + (Math.PI / n); // offset so it doesn't overlap exactly
          var ix = cx + R * Math.cos(aIn);
          var iy = cy + R * Math.sin(aIn);
          inPoints.push(ix.toFixed(2) + ',' + iy.toFixed(2));
        }
        svgContent +=
          '<!-- Inscribed Polygon -->' +
          '<polygon points="' + inPoints.join(' ') + '" fill="rgba(59, 130, 246, 0.12)" stroke="#3b82f6" stroke-width="' + (n >= 48 ? 1.4 : 2) + '"/>';
      }

      // Radius line and angle wedge
      svgContent +=
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R) + '" y2="' + cy + '" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="currentColor"/>' +
        '<text x="' + (cx + R/2) + '" y="' + (cy - 6) + '" font-size="11" fill="currentColor">r</text>' +
        '<!-- Legend & explanation panel on right -->' +
        '<g transform="translate(340, 50)">' +
          '<rect x="0" y="0" width="165" height="240" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ccc)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Exhaustion Method</text>' +
          '<line x1="12" y1="36" x2="150" y2="36" stroke="var(--color-border, #eee)"/>' +
          '<rect x="14" y="48" width="12" height="12" fill="none" stroke="#ef4444" stroke-width="2"/>' +
          '<text x="34" y="58" font-size="11" fill="currentColor">Circumscribed</text>' +
          '<text x="34" y="72" font-size="10" fill="#ef4444">Upper Bound: ' + pCirc.toFixed(4) + '</text>' +
          '<circle cx="20" cy="95" r="6" fill="none" stroke="currentColor" stroke-width="2"/>' +
          '<text x="34" y="99" font-size="11" fill="currentColor">Circle (π)</text>' +
          '<text x="34" y="113" font-size="10" fill="currentColor">Exact: 3.14159...</text>' +
          '<rect x="14" y="136" width="12" height="12" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" stroke-width="1.5"/>' +
          '<text x="34" y="146" font-size="11" fill="currentColor">Inscribed</text>' +
          '<text x="34" y="160" font-size="10" fill="#3b82f6">Lower Bound: ' + pIn.toFixed(4) + '</text>' +
          '<line x1="12" y1="180" x2="150" y2="180" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="198" font-size="10" fill="var(--color-text-muted, #777)">As n → ∞:</text>' +
          '<text x="12" y="214" font-size="10" fill="var(--color-text-muted, #777)">Perimeter gap → 0</text>' +
          '<text x="12" y="228" font-size="10" font-weight="600" fill="currentColor">Gap at n=' + n + ': ' + (pCirc - pIn).toFixed(5) + '</text>' +
        '</g>';

      svg.innerHTML = svgContent;
    }

    nSlider.addEventListener('input', draw);
    checkIn.addEventListener('change', draw);
    checkCirc.addEventListener('change', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 4: The Conics of Apollonius
   * ------------------------------------------------------------------------- */
  FIG['fig-conic-sections'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-conic-angle">Cutting Plane Angle (θ): ' +
            '<span id="fig-conic-angle-val" class="fig-readout">θ = 25° (Ellipse)</span>' +
          '</label>' +
          '<input type="range" id="fig-conic-angle" min="0" max="80" step="1" value="25">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-circle" class="fig-btn">Circle (0°)</button>' +
          '<button type="button" id="fig-btn-ellipse" class="fig-btn">Ellipse (25°)</button>' +
          '<button type="button" id="fig-btn-parabola" class="fig-btn">Parabola (45° = α)</button>' +
          '<button type="button" id="fig-btn-hyperbola" class="fig-btn">Hyperbola (65° > α)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-conic-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-conic-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-conic-angle');
    var angleVal = container.querySelector('#fig-conic-angle-val');
    var svg = container.querySelector('#fig-conic-svg');
    var explain = container.querySelector('#fig-conic-explain');

    var btnCircle = container.querySelector('#fig-btn-circle');
    var btnEllipse = container.querySelector('#fig-btn-ellipse');
    var btnParabola = container.querySelector('#fig-btn-parabola');
    var btnHyperbola = container.querySelector('#fig-btn-hyperbola');

    var coneAlpha = 45; // semi-vertical angle or generator slope = 45 deg

    function draw() {
      var theta = parseInt(slider.value, 10);
      var conicType = '';
      var ecc = 0;
      var color = '';

      if (theta === 0) {
        conicType = 'Circle';
        ecc = 0;
        color = '#3b82f6';
      } else if (theta < coneAlpha) {
        conicType = 'Ellipse';
        ecc = Math.sin(theta * Math.PI / 180) / Math.sin(coneAlpha * Math.PI / 180);
        color = '#10b981';
      } else if (theta === coneAlpha) {
        conicType = 'Parabola (Plane parallel to generator)';
        ecc = 1.0;
        color = '#f59e0b';
      } else {
        conicType = 'Hyperbola (Cuts both nappes of double cone)';
        ecc = Math.sin(theta * Math.PI / 180) / Math.sin(coneAlpha * Math.PI / 180);
        color = '#ef4444';
      }

      angleVal.innerHTML = 'θ = ' + theta + '° &nbsp;<strong style="color:' + color + ';">' + conicType + ' (e = ' + ecc.toFixed(2) + ')</strong>';

      explain.innerHTML =
        '<strong>Apollonius of Perga (<em>Conics</em>, c. 200 BCE):</strong> By varying the angle $\\theta$ of a single cutting plane relative to the cone’s generator line (slope angle $\\alpha = 45^\\circ$), all four conic sections are generated from a single geometric surface. ' +
        (theta < coneAlpha
          ? 'When $\\theta < \\alpha$, the plane cuts completely through one cone nappe, forming a closed curve: an <strong>ellipse</strong> ($e < 1$).'
          : theta === coneAlpha
            ? 'When $\\theta = \\alpha$, the plane is exactly parallel to the cone’s side, extending infinitely without closing: a <strong>parabola</strong> ($e = 1$).'
            : 'When $\\theta > \\alpha$, the plane intersects both the upper and lower cones, producing two open branches: a <strong>hyperbola</strong> ($e > 1$).');

      // Drawing: Left side = 3D double cone with cutting plane, Right side = 2D resulting curve
      var apexX = 140, apexY = 175;
      var coneH = 120, coneR = 120; // 45 degree slope

      // Cutting plane line: passes through (apexX, apexY + 30) with angle theta relative to horizontal
      var planePivotX = apexX;
      var planePivotY = apexY + 40;
      var rad = theta * Math.PI / 180;
      var planeLen = 130;
      var px1 = planePivotX - planeLen * Math.cos(rad);
      var py1 = planePivotY + planeLen * Math.sin(rad);
      var px2 = planePivotX + planeLen * Math.cos(rad);
      var py2 = planePivotY - planeLen * Math.sin(rad);

      var svgContent =
        '<!-- Left panel: Double cone 3D view -->' +
        '<g>' +
          '<!-- Upper cone nappe -->' +
          '<polygon points="' + apexX + ',' + apexY + ' ' + (apexX - coneR) + ',' + (apexY - coneH) + ' ' + (apexX + coneR) + ',' + (apexY - coneH) + '" ' +
                   'fill="rgba(100, 116, 139, 0.08)" stroke="currentColor" stroke-width="1.5"/>' +
          '<ellipse cx="' + apexX + '" cy="' + (apexY - coneH) + '" rx="' + coneR + '" ry="18" fill="rgba(100, 116, 139, 0.1)" stroke="currentColor" stroke-width="1.2"/>' +
          '<!-- Lower cone nappe -->' +
          '<polygon points="' + apexX + ',' + apexY + ' ' + (apexX - coneR) + ',' + (apexY + coneH) + ' ' + (apexX + coneR) + ',' + (apexY + coneH) + '" ' +
                   'fill="rgba(100, 116, 139, 0.08)" stroke="currentColor" stroke-width="1.5"/>' +
          '<ellipse cx="' + apexX + '" cy="' + (apexY + coneH) + '" rx="' + coneR + '" ry="18" fill="rgba(100, 116, 139, 0.1)" stroke="currentColor" stroke-width="1.2"/>' +
          '<!-- Axis of cone -->' +
          '<line x1="' + apexX + '" y1="' + (apexY - coneH - 20) + '" x2="' + apexX + '" y2="' + (apexY + coneH + 20) + '" stroke="var(--color-text-muted, #888)" stroke-width="1" stroke-dasharray="3 3"/>' +
          '<!-- Cutting plane line representation -->' +
          '<line x1="' + px1.toFixed(1) + '" y1="' + py1.toFixed(1) + '" x2="' + px2.toFixed(1) + '" y2="' + py2.toFixed(1) + '" stroke="' + color + '" stroke-width="3"/>' +
          '<circle cx="' + planePivotX + '" cy="' + planePivotY + '" r="3" fill="' + color + '"/>' +
          '<text x="20" y="30" font-size="12" font-weight="600" fill="currentColor">Double Cone & Cutting Plane</text>' +
          '<text x="20" y="48" font-size="11" fill="var(--color-text-muted, #777)">Generator angle α = 45°</text>' +
        '</g>' +
        '<!-- Vertical divider -->' +
        '<line x1="280" y1="20" x2="280" y2="340" stroke="var(--color-border, #e5e7eb)" stroke-width="1"/>' +
        '<!-- Right panel: Resulting 2D Conic Section Curve -->' +
        '<g transform="translate(410, 175)">' +
          '<text x="0" y="-140" font-size="13" font-weight="bold" fill="' + color + '" text-anchor="middle">' + conicType + '</text>' +
          '<!-- Axes -->' +
          '<line x1="-110" y1="0" x2="110" y2="0" stroke="var(--color-border, #ccc)" stroke-width="1"/>' +
          '<line x1="0" y1="-120" x2="0" y2="120" stroke="var(--color-border, #ccc)" stroke-width="1"/>';

      if (theta === 0) {
        // Circle
        svgContent +=
          '<circle cx="0" cy="0" r="70" fill="rgba(59, 130, 246, 0.15)" stroke="' + color + '" stroke-width="2.5"/>' +
          '<circle cx="0" cy="0" r="3" fill="' + color + '"/>' +
          '<text x="10" y="-15" font-size="11" fill="' + color + '">Focus (0,0)</text>';
      } else if (theta < coneAlpha) {
        // Ellipse: a = 85, b = a * sqrt(1 - e^2)
        var a = 85;
        var b = a * Math.sqrt(Math.max(0.1, 1 - ecc * ecc));
        var c = a * ecc;
        svgContent +=
          '<ellipse cx="0" cy="0" rx="' + a + '" ry="' + b.toFixed(1) + '" fill="rgba(16, 185, 129, 0.15)" stroke="' + color + '" stroke-width="2.5"/>' +
          '<!-- Foci -->' +
          '<circle cx="' + (-c).toFixed(1) + '" cy="0" r="3.5" fill="' + color + '"/>' +
          '<circle cx="' + c.toFixed(1) + '" cy="0" r="3.5" fill="' + color + '"/>' +
          '<text x="' + (c + 6) + '" y="-6" font-size="10" fill="' + color + '">F₁</text>' +
          '<text x="' + (-c - 16) + '" y="-6" font-size="10" fill="' + color + '">F₂</text>';
      } else if (theta === coneAlpha) {
        // Parabola: y^2 = 4ax => x = y^2 / (4a)
        var parabPoints = [];
        var pScale = 35;
        for (var y = -100; y <= 100; y += 4) {
          var x = -60 + (y * y) / (4 * pScale);
          if (x <= 100) {
            parabPoints.push(x.toFixed(1) + ',' + y);
          }
        }
        svgContent +=
          '<path d="M ' + parabPoints.join(' L ') + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
          '<circle cx="' + (-60 + pScale) + '" cy="0" r="3.5" fill="' + color + '"/>' +
          '<text x="' + (-60 + pScale + 6) + '" y="-6" font-size="10" fill="' + color + '">Focus</text>' +
          '<line x1="' + (-60 - pScale) + '" y1="-100" x2="' + (-60 - pScale) + '" y2="100" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3 3"/>' +
          '<text x="' + (-60 - pScale - 8) + '" y="-85" font-size="9" fill="#f59e0b" text-anchor="end">Directrix</text>';
      } else {
        // Hyperbola: x^2/a^2 - y^2/b^2 = 1 => x = a * sqrt(1 + y^2/b^2)
        var hypA = 32;
        var hypB = hypA * Math.sqrt(ecc * ecc - 1);
        var rightBranch = [];
        var leftBranch = [];
        for (var yH = -100; yH <= 100; yH += 4) {
          var xH = hypA * Math.sqrt(1 + (yH * yH) / (hypB * hypB));
          if (xH <= 105) {
            rightBranch.push(xH.toFixed(1) + ',' + yH);
            leftBranch.push((-xH).toFixed(1) + ',' + yH);
          }
        }
        svgContent +=
          '<path d="M ' + rightBranch.join(' L ') + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
          '<path d="M ' + leftBranch.join(' L ') + '" fill="none" stroke="' + color + '" stroke-width="2.5"/>' +
          '<!-- Asymptotes y = ± (b/a) x -->' +
          '<line x1="-100" y1="' + (-100 * hypB / hypA).toFixed(1) + '" x2="100" y2="' + (100 * hypB / hypA).toFixed(1) + '" stroke="#ef4444" stroke-width="1" stroke-dasharray="3 3"/>' +
          '<line x1="-100" y1="' + (100 * hypB / hypA).toFixed(1) + '" x2="100" y2="' + (-100 * hypB / hypA).toFixed(1) + '" stroke="#ef4444" stroke-width="1" stroke-dasharray="3 3"/>';
      }

      svgContent += '</g>';
      svg.innerHTML = svgContent;
    }

    slider.addEventListener('input', draw);
    btnCircle.addEventListener('click', function () { slider.value = 0; draw(); });
    btnEllipse.addEventListener('click', function () { slider.value = 25; draw(); });
    btnParabola.addEventListener('click', function () { slider.value = 45; draw(); });
    btnHyperbola.addEventListener('click', function () { slider.value = 65; draw(); });

    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 5: The Mechanics of Zero & Radix Systems
   * ------------------------------------------------------------------------- */
  FIG['fig-place-value-zero'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-radix-input">Enter a Number to Compare (1 to 9999): ' +
            '<span id="fig-radix-val" class="fig-readout">2024</span>' +
          '</label>' +
          '<input type="range" id="fig-radix-input" min="1" max="9999" step="1" value="2024">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-num1" class="fig-btn">2024 (Has Interior 0)</button>' +
          '<button type="button" id="fig-btn-num2" class="fig-btn">360 (Sexagesimal Unit)</button>' +
          '<button type="button" id="fig-btn-num3" class="fig-btn">3605 (Multi-zero)</button>' +
          '<button type="button" id="fig-btn-num4" class="fig-btn">888 (No Zeros)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:340px; padding:1rem 0;">' +
        '<div id="fig-radix-display" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;"></div>' +
      '</div>' +
      '<div id="fig-radix-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-radix-input');
    var valReadout = container.querySelector('#fig-radix-val');
    var display = container.querySelector('#fig-radix-display');
    var explain = container.querySelector('#fig-radix-explain');

    var btn1 = container.querySelector('#fig-btn-num1');
    var btn2 = container.querySelector('#fig-btn-num2');
    var btn3 = container.querySelector('#fig-btn-num3');
    var btn4 = container.querySelector('#fig-btn-num4');

    // Roman numeral converter
    function toRoman(num) {
      var roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
      var str = '';
      for (var i in roman) {
        while (num >= roman[i]) {
          str += i;
          num -= roman[i];
        }
      }
      return str || 'None (No Roman 0)';
    }

    // Babylonian sexagesimal representation
    function toSexagesimal(num) {
      var d2 = Math.floor(num / 3600);
      var rem = num % 3600;
      var d1 = Math.floor(rem / 60);
      var d0 = rem % 60;
      var parts = [];
      if (d2 > 0) parts.push(d2 + '×60²');
      if (d1 > 0 || d2 > 0) parts.push(d1 + '×60¹');
      parts.push(d0 + '×60⁰');
      return {
        str: parts.join(' + '),
        raw: [d2, d1, d0],
        ambiguousZero: (d1 === 0 && d2 > 0)
      };
    }

    function update() {
      var n = parseInt(slider.value, 10);
      valReadout.textContent = n;

      var roman = toRoman(n);
      var sexi = toSexagesimal(n);
      var nStr = n.toString();

      var cardStyle = 'background:var(--color-surface, #fff); border:1px solid var(--color-border, #e5e7eb); border-radius:8px; padding:1.2rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);';

      var html =
        '<!-- Card 1: Indian-Arabic Decimal -->' +
        '<div style="' + cardStyle + ' border-top:4px solid #10b981;">' +
          '<div style="font-weight:700; color:#10b981; margin-bottom:0.4rem; font-size:1.05rem;">Indian Decimal System (Base 10)</div>' +
          '<div style="font-size:1.8rem; font-weight:800; font-family:var(--font-mono, monospace); margin:0.5rem 0;">' +
            nStr.split('').map(function(ch) {
              return ch === '0'
                ? '<span style="color:#ef4444; background:rgba(239, 68, 68, 0.15); padding:0 4px; border-radius:3px;">0 (śūnya)</span>'
                : '<span>' + ch + '</span>';
            }).join(' ') +
          '</div>' +
          '<div style="font-size:0.85rem; color:var(--color-text-muted, #666); line-height:1.4;">' +
            '<strong>Positional Value:</strong><br>' +
            nStr.split('').map(function(ch, idx) {
              var p = nStr.length - 1 - idx;
              return ch + ' × 10<sup>' + p + '</sup>';
            }).join(' + ') +
          '</div>' +
          '<div style="margin-top:0.75rem; font-size:0.85rem; padding:0.4rem; background:rgba(16, 185, 129, 0.08); border-radius:4px;">' +
            'Strictly positional: the dot/circle <em>śūnya</em> holds the empty rank, preventing column collapse.' +
          '</div>' +
        '</div>' +

        '<!-- Card 2: Roman Numerals -->' +
        '<div style="' + cardStyle + ' border-top:4px solid #3b82f6;">' +
          '<div style="font-weight:700; color:#3b82f6; margin-bottom:0.4rem; font-size:1.05rem;">Roman Additive System</div>' +
          '<div style="font-size:1.5rem; font-weight:700; font-family:var(--font-mono, monospace); margin:0.5rem 0; word-break:break-all;">' +
            roman +
          '</div>' +
          '<div style="font-size:0.85rem; color:var(--color-text-muted, #666); line-height:1.4;">' +
            '<strong>String Length:</strong> ' + roman.length + ' symbols.<br>' +
            '<strong>Zero Representation:</strong> <span style="color:#ef4444; font-weight:600;">None</span> (conceptually absent; word <em>nulla</em> used in text).' +
          '</div>' +
          '<div style="margin-top:0.75rem; font-size:0.85rem; padding:0.4rem; background:rgba(59, 130, 246, 0.08); border-radius:4px;">' +
            'Multiplication and division require an external physical abacus. No column-wise pen-and-paper algorithms.' +
          '</div>' +
        '</div>' +

        '<!-- Card 3: Babylonian Sexagesimal -->' +
        '<div style="' + cardStyle + ' border-top:4px solid #f59e0b;">' +
          '<div style="font-weight:700; color:#f59e0b; margin-bottom:0.4rem; font-size:1.05rem;">Babylonian Cuneiform (Base 60)</div>' +
          '<div style="font-size:1.2rem; font-weight:700; font-family:var(--font-mono, monospace); margin:0.5rem 0;">' +
            sexi.str +
          '</div>' +
          '<div style="font-size:0.85rem; color:var(--color-text-muted, #666); line-height:1.4;">' +
            'Ranks: [' + sexi.raw.filter(function(x, i){ return !(i===0 && x===0); }).join(', ') + ']<br>' +
            (sexi.ambiguousZero
              ? '<span style="color:#ef4444; font-weight:bold;">⚠️ Ambiguous Internal Zero!</span> Scribes relied on context or empty blank spaces before the Seleucid wedge separator.'
              : 'Positional without terminal zero.') +
          '</div>' +
          '<div style="margin-top:0.75rem; font-size:0.85rem; padding:0.4rem; background:rgba(245, 158, 11, 0.08); border-radius:4px;">' +
            'Place-value power, but lacked an operational zero for centuries; terminal zero was never fully adopted.' +
          '</div>' +
        '</div>';

      display.innerHTML = html;

      explain.innerHTML =
        '<strong>The Revolutionary Simplicity of Brahmagupta (628 CE):</strong> Notice how the decimal representation requires only 10 universal digits (0–9) and enables mechanical pencil-and-paper addition, multiplication, and long division. Without an explicit zero placeholder, writing $2024$ without ambiguity was historically impossible without descriptive text or physical counting board columns.';
    }

    slider.addEventListener('input', update);
    btn1.addEventListener('click', function () { slider.value = 2024; update(); });
    btn2.addEventListener('click', function () { slider.value = 360; update(); });
    btn3.addEventListener('click', function () { slider.value = 3605; update(); });
    btn4.addEventListener('click', function () { slider.value = 888; update(); });

    update();
  };

  /* -------------------------------------------------------------------------
   * Figure 6: From Ptolemy's Chords to the Indian Sine
   * ------------------------------------------------------------------------- */
  FIG['fig-sine-evolution'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-sine-angle">Central Angle Arc (2θ): ' +
            '<span id="fig-sine-angle-val" class="fig-readout">2θ = 60° (θ = 30°)</span>' +
          '</label>' +
          '<input type="range" id="fig-sine-angle" min="10" max="170" step="2" value="60">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="radio" name="fig-sine-mode" value="ptolemy"> Ptolemy’s Full Chord (crd 2θ)</label>' +
          '<label style="margin-left:1.5rem;"><input type="radio" name="fig-sine-mode" value="aryabhata" checked> Āryabhaṭa’s Half-Chord (ardha-jyā = R sin θ)</label>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-sine-svg" viewBox="0 0 520 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-sine-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-sine-angle');
    var angleVal = container.querySelector('#fig-sine-angle-val');
    var radios = container.querySelectorAll('input[name="fig-sine-mode"]');
    var svg = container.querySelector('#fig-sine-svg');
    var explain = container.querySelector('#fig-sine-explain');

    function draw() {
      var twoTheta = parseInt(slider.value, 10);
      var theta = twoTheta / 2;
      var mode = container.querySelector('input[name="fig-sine-mode"]:checked').value;

      angleVal.innerHTML = '2θ = ' + twoTheta + '° &nbsp;(Half-angle θ = ' + theta.toFixed(1) + '°)';

      var cx = 200, cy = 180, R = 130;
      var rad = theta * Math.PI / 180;

      // Circle points
      // Upper point P1: angle = -theta
      // Lower point P2: angle = +theta
      var p1x = cx + R * Math.cos(rad);
      var p1y = cy - R * Math.sin(rad);
      var p2x = cx + R * Math.cos(rad);
      var p2y = cy + R * Math.sin(rad);
      var midX = p1x;
      var midY = cy;

      var chordLen = 2 * R * Math.sin(rad);
      var sineLen = R * Math.sin(rad);
      var cosLen = R * Math.cos(rad);

      // In Ptolemy's Almagest, R = 60 sexagesimal parts. In modern unit, R = 1.
      var ptolemyChord = (120 * Math.sin(rad)).toFixed(3);
      var modernSin = Math.sin(rad).toFixed(4);

      var svgContent =
        '<!-- Main Circle -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="rgba(100, 116, 139, 0.04)" stroke="currentColor" stroke-width="1.8"/>' +
        '<!-- Horizontal axis (Radius) -->' +
        '<line x1="' + (cx - R - 20) + '" y1="' + cy + '" x2="' + (cx + R + 20) + '" y2="' + cy + '" stroke="var(--color-border, #ccc)" stroke-width="1.2"/>' +
        '<!-- Vertical axis -->' +
        '<line x1="' + cx + '" y1="' + (cy - R - 20) + '" x2="' + cx + '" y2="' + (cy + R + 20) + '" stroke="var(--color-border, #ccc)" stroke-width="1.2"/>' +
        '<!-- Center point O -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="currentColor"/>' +
        '<text x="' + (cx - 16) + '" y="' + (cy - 8) + '" font-size="12" font-weight="600" fill="currentColor">O</text>' +
        '<!-- Radii to P1 and P2 -->' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + p1x.toFixed(1) + '" y2="' + p1y.toFixed(1) + '" stroke="currentColor" stroke-width="1.5"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + p2x.toFixed(1) + '" y2="' + p2y.toFixed(1) + '" stroke="currentColor" stroke-width="1.5"/>' +
        '<!-- Arc subtended by 2θ -->' +
        '<path d="M ' + p1x.toFixed(1) + ' ' + p1y.toFixed(1) + ' A ' + R + ' ' + R + ' 0 0 1 ' + p2x.toFixed(1) + ' ' + p2y.toFixed(1) + '" ' +
              'fill="none" stroke="#f59e0b" stroke-width="3"/>' +
        '<circle cx="' + p1x.toFixed(1) + '" cy="' + p1y.toFixed(1) + '" r="4" fill="#f59e0b"/>' +
        '<circle cx="' + p2x.toFixed(1) + '" cy="' + p2y.toFixed(1) + '" r="4" fill="#f59e0b"/>' +
        '<text x="' + (p1x + 8).toFixed(1) + '" y="' + (p1y - 4).toFixed(1) + '" font-size="12" font-weight="600" fill="#f59e0b">P₁</text>' +
        '<text x="' + (p2x + 8).toFixed(1) + '" y="' + (p2y + 14).toFixed(1) + '" font-size="12" font-weight="600" fill="#f59e0b">P₂</text>';

      if (mode === 'ptolemy') {
        // Full Chord P1-P2
        svgContent +=
          '<!-- Ptolemy Full Chord -->' +
          '<line x1="' + p1x.toFixed(1) + '" y1="' + p1y.toFixed(1) + '" x2="' + p2x.toFixed(1) + '" y2="' + p2y.toFixed(1) + '" ' +
                'stroke="#ef4444" stroke-width="3.5"/>' +
          '<text x="' + (p1x + 12).toFixed(1) + '" y="' + cy + '" font-size="13" font-weight="bold" fill="#ef4444">' +
            'crd(2θ) = ' + ptolemyChord + 'p' +
          '</text>' +
          '<!-- Right Panel Explanation -->' +
          '<g transform="translate(360, 40)">' +
            '<rect x="0" y="0" width="150" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#ef4444">Greek Chord (crd)</text>' +
            '<line x1="12" y1="34" x2="138" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Hipparchus & Ptolemy</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">measured the full</text>' +
            '<text x="12" y="86" font-size="11" font-weight="600" fill="#ef4444">straight-line chord</text>' +
            '<text x="12" y="102" font-size="11" fill="currentColor">connecting arc ends.</text>' +
            '<line x1="12" y1="120" x2="138" y2="120" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="140" font-size="11" fill="currentColor">Diameter = 120 parts</text>' +
            '<text x="12" y="160" font-size="11" fill="#ef4444">crd(2θ) = 2R sin(θ)</text>' +
            '<line x1="12" y1="180" x2="138" y2="180" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="200" font-size="10" fill="var(--color-text-muted, #666)">Inconvenience:</text>' +
            '<text x="12" y="216" font-size="10" fill="currentColor">Requires half-angles</text>' +
            '<text x="12" y="232" font-size="10" fill="currentColor">in every calculation!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Ptolemy’s Chord System (c. 150 CE):</strong> Greek astronomers tabulated chords ($crd\\,2\\theta$), the straight distance between two points on a circle of diameter 120. Because the chord connects two opposite arc extremities, every right-triangle calculation required dividing arcs by 2, leading to cumbersome formulas such as $\\sin \\theta = \\frac{1}{2R} \\text{crd}(2\\theta)$.';
      } else {
        // Indian Half-Chord (Sine) and Cosine
        svgContent +=
          '<!-- Right triangle inside circle -->' +
          '<polygon points="' + cx + ',' + cy + ' ' + midX.toFixed(1) + ',' + cy + ' ' + p1x.toFixed(1) + ',' + p1y.toFixed(1) + '" ' +
                   'fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5"/>' +
          '<!-- ardha-jya (sine) vertical segment -->' +
          '<line x1="' + p1x.toFixed(1) + '" y1="' + cy + '" x2="' + p1x.toFixed(1) + '" y2="' + p1y.toFixed(1) + '" ' +
                'stroke="#10b981" stroke-width="3.5"/>' +
          '<!-- ko-jya (cosine) horizontal segment -->' +
          '<line x1="' + cx + '" y1="' + cy + '" x2="' + midX.toFixed(1) + '" y2="' + cy + '" ' +
                'stroke="#3b82f6" stroke-width="3.5"/>' +
          '<text x="' + (p1x + 8).toFixed(1) + '" y="' + (cy - sineLen/2) + '" font-size="12" font-weight="bold" fill="#10b981">' +
            'jyā = R sin θ' +
          '</text>' +
          '<text x="' + (cx + cosLen/2 - 20) + '" y="' + (cy + 16) + '" font-size="12" font-weight="bold" fill="#3b82f6">' +
            'ko-jyā' +
          '</text>' +
          '<!-- Right Panel Explanation -->' +
          '<g transform="translate(360, 40)">' +
            '<rect x="0" y="0" width="150" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#10b981">Indian Jyā (Sine)</text>' +
            '<line x1="12" y1="34" x2="138" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Āryabhaṭa (499 CE)</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">discarded the lower half,</text>' +
            '<text x="12" y="86" font-size="11" font-weight="600" fill="#10b981">keeping the half-chord</text>' +
            '<text x="12" y="102" font-size="11" fill="currentColor">(ardha-jyā = jyā).</text>' +
            '<line x1="12" y1="120" x2="138" y2="120" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="140" font-size="11" fill="#10b981">sin(θ) = ' + modernSin + '</text>' +
            '<text x="12" y="158" font-size="11" fill="#3b82f6">cos(θ) = ' + Math.cos(rad).toFixed(4) + '</text>' +
            '<line x1="12" y1="176" x2="138" y2="176" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="196" font-size="10" fill="var(--color-text-muted, #666)">Linguistic Route:</text>' +
            '<text x="12" y="210" font-size="10" fill="currentColor">jyā → jiba (Arabic)</text>' +
            '<text x="12" y="226" font-size="10" fill="currentColor">→ jaib (bay/fold)</text>' +
            '<text x="12" y="242" font-size="10" font-weight="600" fill="#10b981">→ sinus (Latin: sine)</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Āryabhaṭa’s Trigonometric Revolution (499 CE):</strong> In the <em>Āryabhaṭīya</em>, Indian mathematicians made the decisive conceptual leap: replace the full chord with the half-chord (*ardha-jyā*, shortened to *jyā*, bowstring). This immediately created a direct right triangle with the radius and the complementary perpendicular (*ko-jyā*, cosine). Medieval Islamic astronomers adopted *jiba*, which Latin translators mistook for *jaib* (crease/fold) and translated literally as *sinus* (giving our modern word <em>sine</em>).';
      }

      svg.innerHTML = svgContent;
    }

    slider.addEventListener('input', draw);
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', draw);
    }

    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 7: Completing the Square (Al-Khwarizmi's Geometric Algebra)
   * ------------------------------------------------------------------------- */
  FIG['fig-al-khwarizmi-square'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-alg-x">Value of Unknown Root (x): ' +
            '<span id="fig-alg-x-val" class="fig-readout">x = 3.0</span>' +
          '</label>' +
          '<input type="range" id="fig-alg-x" min="1" max="6" step="0.5" value="3">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-alg-btn-step1" class="fig-btn">1. Given: x² + 10x</button>' +
          '<button type="button" id="fig-alg-btn-step2" class="fig-btn">2. Partition 10x into 4 Rectangles</button>' +
          '<button type="button" id="fig-alg-btn-step3" class="fig-btn">3. Complete the Big Square (+25)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-alg-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-alg-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-alg-x');
    var xVal = container.querySelector('#fig-alg-x-val');
    var btn1 = container.querySelector('#fig-alg-btn-step1');
    var btn2 = container.querySelector('#fig-alg-btn-step2');
    var btn3 = container.querySelector('#fig-alg-btn-step3');
    var svg = container.querySelector('#fig-alg-svg');
    var explain = container.querySelector('#fig-alg-explain');

    var currentStep = 3;

    function draw() {
      var x = parseFloat(slider.value);
      xVal.textContent = 'x = ' + x.toFixed(1) + (x === 3.0 ? ' (Exact True Solution!)' : '');

      var b = 10; // 10x
      var targetArea = 39; // x^2 + 10x = 39
      var currentArea = (x * x) + (b * x);

      // Geometric scaling
      // Big completed square side = x + 5
      var scale = 22; // pixels per unit
      var cx = 180, cy = 180;
      var xPix = x * scale;
      var halfPix = 2.5 * scale; // 2.5 on each side

      var ox = cx - xPix / 2;
      var oy = cy - xPix / 2;

      var svgContent =
        '<defs>' +
          '<pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">' +
            '<path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>' +
          '</pattern>' +
        '</defs>' +
        '<rect x="0" y="0" width="540" height="360" fill="url(#gridPattern)"/>' +
        '<!-- Central x^2 Square -->' +
        '<rect x="' + ox + '" y="' + oy + '" width="' + xPix + '" height="' + xPix + '" ' +
              'fill="rgba(59, 130, 246, 0.25)" stroke="#3b82f6" stroke-width="2"/>' +
        '<text x="' + cx + '" y="' + (cy + 5) + '" font-size="14" font-weight="bold" fill="#3b82f6" text-anchor="middle">x²</text>';

      if (currentStep >= 2) {
        // 4 rectangles of dimensions x by 2.5 on North, South, East, West
        // North
        svgContent +=
          '<rect x="' + ox + '" y="' + (oy - halfPix) + '" width="' + xPix + '" height="' + halfPix + '" ' +
                'fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.5"/>' +
          '<text x="' + cx + '" y="' + (oy - halfPix/2 + 4) + '" font-size="10" fill="#10b981" text-anchor="middle">2.5x</text>' +
          // South
          '<rect x="' + ox + '" y="' + (oy + xPix) + '" width="' + xPix + '" height="' + halfPix + '" ' +
                'fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.5"/>' +
          '<text x="' + cx + '" y="' + (oy + xPix + halfPix/2 + 4) + '" font-size="10" fill="#10b981" text-anchor="middle">2.5x</text>' +
          // West
          '<rect x="' + (ox - halfPix) + '" y="' + oy + '" width="' + halfPix + '" height="' + xPix + '" ' +
                'fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.5"/>' +
          '<text x="' + (ox - halfPix/2) + '" y="' + (cy + 4) + '" font-size="10" fill="#10b981" text-anchor="middle">2.5x</text>' +
          // East
          '<rect x="' + (ox + xPix) + '" y="' + oy + '" width="' + halfPix + '" height="' + xPix + '" ' +
                'fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.5"/>' +
          '<text x="' + (ox + xPix + halfPix/2) + '" y="' + (cy + 4) + '" font-size="10" fill="#10b981" text-anchor="middle">2.5x</text>';
      }

      if (currentStep === 3) {
        // 4 missing corner squares of dimensions 2.5 x 2.5 each => 4 * 6.25 = 25
        svgContent +=
          '<!-- Top-Left Corner -->' +
          '<rect x="' + (ox - halfPix) + '" y="' + (oy - halfPix) + '" width="' + halfPix + '" height="' + halfPix + '" ' +
                'fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<text x="' + (ox - halfPix/2) + '" y="' + (oy - halfPix/2 + 4) + '" font-size="9" font-weight="600" fill="#f59e0b" text-anchor="middle">6.25</text>' +
          '<!-- Top-Right Corner -->' +
          '<rect x="' + (ox + xPix) + '" y="' + (oy - halfPix) + '" width="' + halfPix + '" height="' + halfPix + '" ' +
                'fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<text x="' + (ox + xPix + halfPix/2) + '" y="' + (oy - halfPix/2 + 4) + '" font-size="9" font-weight="600" fill="#f59e0b" text-anchor="middle">6.25</text>' +
          '<!-- Bottom-Left Corner -->' +
          '<rect x="' + (ox - halfPix) + '" y="' + (oy + xPix) + '" width="' + halfPix + '" height="' + halfPix + '" ' +
                'fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<text x="' + (ox - halfPix/2) + '" y="' + (oy + xPix + halfPix/2 + 4) + '" font-size="9" font-weight="600" fill="#f59e0b" text-anchor="middle">6.25</text>' +
          '<!-- Bottom-Right Corner -->' +
          '<rect x="' + (ox + xPix) + '" y="' + (oy + xPix) + '" width="' + halfPix + '" height="' + halfPix + '" ' +
                'fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<text x="' + (ox + xPix + halfPix/2) + '" y="' + (oy + xPix + halfPix/2 + 4) + '" font-size="9" font-weight="600" fill="#f59e0b" text-anchor="middle">6.25</text>' +
          '<!-- Outer boundary box of completed square -->' +
          '<rect x="' + (ox - halfPix) + '" y="' + (oy - halfPix) + '" width="' + (xPix + 2 * halfPix) + '" height="' + (xPix + 2 * halfPix) + '" ' +
                'fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 4"/>';
      }

      // Mathematical derivation card on the right
      svgContent +=
        '<g transform="translate(340, 30)">' +
          '<rect x="0" y="0" width="185" height="300" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Al-Khwārizmī’s Equation</text>' +
          '<text x="12" y="44" font-size="13" font-weight="bold" fill="#3b82f6">x² + 10x = 39</text>' +
          '<line x1="12" y1="54" x2="173" y2="54" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="74" font-size="11" fill="currentColor">1. Divide 10 by 4 = 2.5</text>' +
          '<text x="12" y="90" font-size="11" fill="currentColor">Place 4 bands on sides of x².</text>' +
          '<text x="12" y="106" font-size="11" fill="#10b981">Area of cross = x² + 10x = 39</text>' +
          '<line x1="12" y1="120" x2="173" y2="120" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="140" font-size="11" fill="currentColor">2. Fill 4 corner squares:</text>' +
          '<text x="12" y="156" font-size="11" fill="#f59e0b">4 × (2.5)² = 4 × 6.25 = 25</text>' +
          '<text x="12" y="176" font-size="11" font-weight="600" fill="currentColor">3. Total Large Square:</text>' +
          '<text x="12" y="194" font-size="12" font-weight="bold" fill="#ef4444">39 + 25 = 64</text>' +
          '<line x1="12" y1="208" x2="173" y2="208" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="226" font-size="11" fill="currentColor">4. Side of Large Square:</text>' +
          '<text x="12" y="244" font-size="12" font-weight="bold" fill="currentColor">x + 2.5 + 2.5 = √64 = 8</text>' +
          '<text x="12" y="266" font-size="13" font-weight="bold" fill="#10b981">∴ x = 8 - 5 = 3</text>' +
          '<text x="12" y="286" font-size="10" fill="' + (Math.abs(currentArea - 39) < 0.01 ? '#10b981' : '#ef4444') + '">' +
            'Current Area = ' + currentArea.toFixed(1) + ' (Target: 39)' +
          '</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Birth of "Al-Jabr" (Baghdad, c. 825 CE):</strong> In <em>The Compendious Book on Calculation by Completion and Balancing</em>, al-Khwārizmī did not use symbols ($x$, $+$, $=$). Instead, he gave rigorous geometric proof for why his rhetorical recipe worked: to solve "a square and ten roots equal thirty-nine dirhams," one physically completes the large outer square by adding four corner tiles totaling $25$, making the entire area $64$. The side of that square is $\\sqrt{64} = 8$, so the unknown root is $x = 8 - 5 = 3$.';
    }

    slider.addEventListener('input', draw);
    btn1.addEventListener('click', function () { currentStep = 1; draw(); });
    btn2.addEventListener('click', function () { currentStep = 2; draw(); });
    btn3.addEventListener('click', function () { currentStep = 3; draw(); });

    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 8: Part 4 Interactive Self-Scoring Quiz
   * ------------------------------------------------------------------------- */
  FIG['fig-quiz-part4'] = function (container) {
    var questions = [
      {
        question: "What did the Pythagoreans discover about the diagonal of a unit square that shook their worldview?",
        options: [
          "It can be expressed as the ratio 7/5",
          "It is strictly incommensurable with the side (cannot be expressed as a ratio of integers)",
          "It violates the law of the lever",
          "It can only be drawn using a compass but not a straightedge"
        ],
        answer: 1,
        explanation: "The discovery that the diagonal d = √2 cannot be measured by any common unit divisor of the side s = 1 proved the existence of incommensurable (irrational) magnitudes, shattering the Pythagorean dogma that all cosmic relationships are ratios of whole integers."
      },
      {
        question: "In Book I of Euclid’s Elements, how is the fifth postulate (the Parallel Postulate) distinct from the first four?",
        options: [
          "It was proved directly from Common Notion 1",
          "It is a conditional statement about two lines intersected by a transversal whose interior angles sum to less than two right angles",
          "It applies only to spherical triangles",
          "It explicitly introduces the numerical value of π"
        ],
        answer: 1,
        explanation: "Euclid's Postulate 5 states that if a straight line falling on two straight lines makes interior angles on the same side less than two right angles, the two lines, if produced indefinitely, will meet on that side. Its complexity led mathematicians for two millennia to attempt (unsuccessfully) to prove it from the first four."
      },
      {
        question: "How did Euclid structure his proof of the infinitude of prime numbers (Book IX Proposition 20)?",
        options: [
          "By multiplying all existing primes together and asserting that P = (p₁p₂...pₙ) + 1 is always prime",
          "By using mathematical induction on the Peano axioms",
          "By showing that any finite set of primes {p₁, p₂, ..., pₙ} cannot be exhaustive, because the prime factors of (p₁p₂...pₙ) + 1 cannot be in that set",
          "By calculating prime density using logarithmic integrals"
        ],
        answer: 2,
        explanation: "Euclid did not claim that N = (p₁p₂...pₙ) + 1 is itself prime. He proved that N is either prime or must have a prime factor; and since dividing N by any of the listed primes leaves a remainder of 1, its prime factor must be a new prime not in the original collection. Thus primes exceed any assigned multitude."
      },
      {
        question: "In 'Measurement of a Circle', what polygon did Archimedes use to trap the value of π?",
        options: [
          "A 64-sided polygon",
          "Inscribed and circumscribed regular polygons of 96 sides",
          "A circle inscribed within an equilateral triangle",
          "A 360-sided polygon based on Babylonian degrees"
        ],
        answer: 1,
        explanation: "Starting from a regular hexagon (6 sides) and repeatedly doubling four times (12, 24, 48, 96 sides), Archimedes proved that 3 10/71 < π < 3 1/7 (223/71 < π < 22/7)."
      },
      {
        question: "What single geometric family did Apollonius of Perga demonstrate generates the circle, ellipse, parabola, and hyperbola?",
        options: [
          "Intersections of concentric spheres",
          "Planar slices through a single double circular cone at varying angles",
          "Rolling circles along a straight line (cycloids)",
          "Shadows cast by gnomons at varying latitudes"
        ],
        answer: 1,
        explanation: "In his treatise 'Conics', Apollonius showed that a single oblique or right circular cone with two nappes produces all four curves simply by altering the inclination angle of the cutting plane relative to the generator."
      },
      {
        question: "Which Indian text contains the earliest systematic mathematical rules treating zero and negative numbers as algebraic entities?",
        options: [
          "The Rigveda (c. 1200 BCE)",
          "The Brāhmasphuṭasiddhānta by Brahmagupta (628 CE)",
          "The Sulba Sūtras by Baudhāyana (c. 600 BCE)",
          "The Lilāvatī by Bhāskara II (1150 CE)"
        ],
        answer: 1,
        explanation: "In Chapter 18 of the Brāhmasphuṭasiddhānta (628 CE), Brahmagupta defined operational arithmetic rules for positive numbers (dhana / fortune), negative numbers (ṛṇa / debt), and zero (kha / śūnya), including rules like (-a) × (-b) = +ab and a + 0 = a."
      },
      {
        question: "How did the Indian trigonometric function 'jyā' differ conceptually from Ptolemy’s 'chord' (crd)?",
        options: [
          "Jyā was measured only in degrees rather than sexagesimal minutes",
          "Jyā is the half-chord corresponding to half the central angle (modern R sin θ), creating an immediate right triangle with the radius",
          "Jyā was applied exclusively to hyperbolic geometry",
          "Jyā eliminated the need for circles"
        ],
        answer: 1,
        explanation: "Ptolemy used chords subtending the entire arc 2θ. Āryabhaṭa and Indian astronomers adopted the half-chord (ardha-jyā, later jyā) for arc θ, making it the vertical leg of a right triangle of hypotenuse R, establishing the foundation of modern sine."
      },
      {
        question: "What do the Arabic terms 'al-jabr' and 'al-muqābala' literally mean in al-Khwārizmī’s algebra?",
        options: [
          "Multiplication and division",
          "Restoration (adding subtracted quantities to both sides) and balancing (canceling identical terms from both sides)",
          "Square root and cube root",
          "Proof by contradiction and direct deduction"
        ],
        answer: 1,
        explanation: "Al-jabr ('restoration' or 'setting of bones') referred to removing negative subtractions by adding equal amounts to both sides (e.g. converting x² = 40 - 4x into x² + 4x = 40). Al-muqābala ('balancing') referred to subtracting equal positive terms from both sides."
      },
      {
        question: "How did Omar Khayyam solve general cubic equations in eleventh-century Persia?",
        options: [
          "Using modern Tartaglia-Cardano algebraic radical formulas",
          "Through the geometric intersection of conic sections (e.g. parabolas and circles/hyperbolas)",
          "By claiming that cubic equations have no real solutions",
          "By employing matrix determinants"
        ],
        answer: 1,
        explanation: "Centuries before sixteenth-century Italian algebraists found radical formulas, Omar Khayyam systematically classified and solved cubic equations geometrically by constructing the intersections of conic sections such as a parabola and a circle."
      },
      {
        question: "What was the significance of Leonardo Fibonacci’s 'Liber Abaci' (1202) for European mathematics?",
        options: [
          "It invented the calculus of fluxions",
          "It introduced Hindu-Arabic positional numerals (0–9) and their practical arithmetic algorithms to European commerce and scholarship",
          "It translated Euclid directly into vernacular Italian for the first time",
          "It proved that the Earth orbits the Sun"
        ],
        answer: 1,
        explanation: "Having learned the 'modus Indorum' (the method of the Indians) in North Africa, Fibonacci demonstrated in Liber Abaci how positional decimal arithmetic with zero vastly outperformed the abacus and Roman numerals for merchant bookkeeping, currency exchange, and geometry."
      }
    ];

    var state = {
      userAnswers: {},
      submitted: false
    };

    function render() {
      var score = 0;
      var total = questions.length;

      var html =
        '<div style="background:var(--color-surface, #fff); border:1px solid var(--color-border, #e5e7eb); border-radius:8px; padding:1.5rem;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--color-border, #eee); padding-bottom:0.75rem;">' +
            '<h4 style="margin:0; font-size:1.15rem;">Part 4 Evaluation: The Mathematical Mind</h4>' +
            '<span style="font-size:0.85rem; color:var(--color-text-muted, #666);">' + total + ' Questions</span>' +
          '</div>';

      for (var qIdx = 0; qIdx < questions.length; qIdx++) {
        var q = questions[qIdx];
        var answered = state.userAnswers[qIdx] !== undefined;
        var userChoice = state.userAnswers[qIdx];
        var isCorrect = userChoice === q.answer;

        if (state.submitted && isCorrect) score++;

        html +=
          '<div style="margin-bottom:1.5rem; padding-bottom:1.2rem; border-bottom:1px dashed var(--color-border, #eee);">' +
            '<div style="font-weight:600; margin-bottom:0.6rem; font-size:0.95rem;">' +
              (qIdx + 1) + '. ' + q.question +
            '</div>' +
            '<div style="display:flex; flex-direction:column; gap:0.4rem;">';

        for (var oIdx = 0; oIdx < q.options.length; oIdx++) {
          var opt = q.options[oIdx];
          var optClass = 'padding:0.5rem 0.75rem; border-radius:6px; font-size:0.88rem; cursor:pointer; border:1px solid var(--color-border, #ddd); display:flex; align-items:center; gap:0.5rem; transition:background 0.15s;';
          var optBg = 'background:var(--color-surface, #fff);';

          if (state.submitted) {
            if (oIdx === q.answer) {
              optBg = 'background:rgba(16, 185, 129, 0.15); border-color:#10b981; font-weight:600;';
            } else if (userChoice === oIdx) {
              optBg = 'background:rgba(239, 68, 68, 0.15); border-color:#ef4444;';
            }
          } else if (userChoice === oIdx) {
            optBg = 'background:rgba(59, 130, 246, 0.12); border-color:#3b82f6; font-weight:600;';
          }

          html +=
            '<div class="fig-quiz-option" data-q="' + qIdx + '" data-o="' + oIdx + '" style="' + optClass + optBg + '">' +
              '<span style="display:inline-block; width:1.2rem; height:1.2rem; line-height:1.2rem; text-align:center; border-radius:50%; background:rgba(0,0,0,0.06); font-size:0.75rem; font-weight:bold;">' +
                String.fromCharCode(65 + oIdx) +
              '</span>' +
              '<span>' + opt + '</span>' +
            '</div>';
        }

        html += '</div>';

        if (state.submitted) {
          html +=
            '<div style="margin-top:0.6rem; padding:0.6rem 0.75rem; border-radius:6px; font-size:0.85rem; line-height:1.4; ' +
                        (isCorrect ? 'background:rgba(16, 185, 129, 0.1); color:#065f46;' : 'background:rgba(239, 68, 68, 0.1); color:#991b1b;') + '">' +
              '<strong>' + (isCorrect ? '✓ Correct! ' : '✗ Incorrect. ') + '</strong>' + q.explanation +
            '</div>';
        }

        html += '</div>';
      }

      // Quiz footer
      html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">';
      if (!state.submitted) {
        html +=
          '<button type="button" id="fig-quiz-submit" class="fig-btn" style="background:#3b82f6; color:#fff; border-color:#3b82f6; font-weight:600; padding:0.5rem 1.25rem;">' +
            'Submit Quiz' +
          '</button>' +
          '<span style="font-size:0.85rem; color:var(--color-text-muted, #666);">' +
            Object.keys(state.userAnswers).length + ' of ' + total + ' answered' +
          '</span>';
      } else {
        html +=
          '<div style="font-size:1.05rem; font-weight:700;">' +
            'Final Score: <span style="color:' + (score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444') + ';">' +
              score + ' / ' + total + ' (' + Math.round(score / total * 100) + '%)' +
            '</span>' +
          '</div>' +
          '<button type="button" id="fig-quiz-retry" class="fig-btn">' +
            'Retake Quiz' +
          '</button>';
      }
      html += '</div></div>';

      container.innerHTML = html;

      // Event bindings
      if (!state.submitted) {
        var optEls = container.querySelectorAll('.fig-quiz-option');
        for (var i = 0; i < optEls.length; i++) {
          optEls[i].addEventListener('click', function () {
            var q = parseInt(this.getAttribute('data-q'), 10);
            var o = parseInt(this.getAttribute('data-o'), 10);
            state.userAnswers[q] = o;
            render();
          });
        }

        var subBtn = container.querySelector('#fig-quiz-submit');
        if (subBtn) {
          subBtn.addEventListener('click', function () {
            state.submitted = true;
            render();
          });
        }
      } else {
        var retryBtn = container.querySelector('#fig-quiz-retry');
        if (retryBtn) {
          retryBtn.addEventListener('click', function () {
            state.userAnswers = {};
            state.submitted = false;
            render();
          });
        }
      }
    }

    render();
  };

})();
