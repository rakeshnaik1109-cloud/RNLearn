/**
 * Figures for Part 7: From Alchemy to the Periodic Table
 * RNLearn - Long-form Learning & Essays
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  /* -------------------------------------------------------------------------
   * Figure 1: Jābir’s Alembic & Fractional Distillation
   * ------------------------------------------------------------------------- */
  FIG['fig-alembic-distillation'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-alembic-heat">Furnace Heat Level: ' +
            '<span id="fig-alembic-heat-val" class="fig-readout">Moderate Heat (78°C - Alcohol boils)</span>' +
          '</label>' +
          '<input type="range" id="fig-alembic-heat" min="1" max="3" step="1" value="2">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-alembic-btn-low" class="fig-btn">Gentle Heat (50°C)</button>' +
          '<button type="button" id="fig-alembic-btn-med" class="fig-btn">Moderate (78°C: Ethanol)</button>' +
          '<button type="button" id="fig-alembic-btn-high" class="fig-btn">High Heat (100°C: Water)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-alembic-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-alembic-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-alembic-heat');
    var heatVal = container.querySelector('#fig-alembic-heat-val');
    var btnLow = container.querySelector('#fig-alembic-btn-low');
    var btnMed = container.querySelector('#fig-alembic-btn-med');
    var btnHigh = container.querySelector('#fig-alembic-btn-high');
    var svg = container.querySelector('#fig-alembic-svg');
    var explain = container.querySelector('#fig-alembic-explain');

    var heatStages = [
      '',
      { temp: '50°C (Warm)', desc: 'Below volatile boiling point; minimal vapor', distColor: '#cbd5e1', drops: false },
      { temp: '78°C (Moderate)', desc: 'Ethanol boils (*al-kuḥūl*); distilled spirit collects', distColor: '#38bdf8', drops: true },
      { temp: '100°C+ (High)', desc: 'Water and heavier acids vaporize; total distillation', distColor: '#93c5fd', drops: true }
    ];

    function draw() {
      var h = parseInt(slider.value, 10);
      var stage = heatStages[h];
      heatVal.textContent = stage.temp + ' — ' + stage.desc;

      var flameH = h === 1 ? 15 : h === 2 ? 30 : 45;
      var flameColor = h === 1 ? '#f59e0b' : h === 2 ? '#ef4444' : '#dc2626';

      var svgContent =
        '<!-- Furnace Base (Athanor) -->' +
        '<rect x="80" y="270" width="140" height="60" fill="#78350f" rx="4"/>' +
        '<text x="150" y="305" font-size="11" fill="#fef3c7" font-weight="bold" text-anchor="middle">Brick Furnace (Atanor)</text>' +

        '<!-- Charcoal Flames -->' +
        '<polygon points="120,270 130,' + (270 - flameH) + ' 140,270" fill="' + flameColor + '"/>' +
        '<polygon points="140,270 150,' + (270 - flameH - 8) + ' 160,270" fill="#f59e0b"/>' +
        '<polygon points="160,270 170,' + (270 - flameH) + ' 180,270" fill="' + flameColor + '"/>' +

        '<!-- Boiling Flask (Cucurbit / Qar\') -->' +
        '<path d="M 110 260 C 110 200 130 180 135 150 L 165 150 C 170 180 190 200 190 260 Z" ' +
              'fill="rgba(255, 255, 255, 0.25)" stroke="#a1a1aa" stroke-width="2.5"/>' +

        '<!-- Liquid in Flask -->' +
        '<path d="M 112 258 C 112 220 125 210 150 210 C 175 210 188 220 188 258 Z" ' +
              'fill="rgba(180, 83, 9, 0.45)"/>' +
        '<text x="150" y="245" font-size="10" fill="#fef3c7" font-weight="600" text-anchor="middle">Liquid Mixture</text>';

      // Rising Vapors inside flask
      if (h >= 2) {
        svgContent +=
          '<!-- Rising vapor arrows -->' +
          '<path d="M 145 195 Q 150 175 145 155 M 155 195 Q 150 175 155 155" ' +
                'fill="none" stroke="' + stage.distColor + '" stroke-width="2.5" stroke-dasharray="3 3"/>';
      }

      // Alembic Head (Al-Inbīq)
      svgContent +=
        '<!-- Alembic Still-Head (Cap) -->' +
        '<path d="M 125 150 C 125 105 175 105 175 150 Z" ' +
              'fill="rgba(255, 255, 255, 0.3)" stroke="#71717a" stroke-width="2.5"/>' +
        '<text x="150" y="132" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Al-Inbīq (Alembic)</text>' +

        '<!-- Condensing Spout / Beak (Downward Delivery Tube) -->' +
        '<path d="M 172 135 Q 220 140 280 230" fill="none" stroke="#71717a" stroke-width="6"/>' +
        '<path d="M 172 135 Q 220 140 280 230" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3"/>' +

        '<!-- Receiving Flask (Qabilah) -->' +
        '<path d="M 265 240 L 295 240 L 315 310 L 245 310 Z" ' +
              'fill="rgba(255, 255, 255, 0.3)" stroke="#71717a" stroke-width="2.5"/>' +
        '<text x="280" y="332" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Receiver (Qābilah)</text>';

      // Distillate in Receiver
      if (stage.drops) {
        svgContent +=
          '<!-- Distillate Liquid in Receiver -->' +
          '<polygon points="250,308 310,308 300,285 260,285" fill="' + stage.distColor + '" opacity="0.8"/>' +
          '<!-- Falling distillate drops -->' +
          '<circle cx="280" cy="252" r="3" fill="' + stage.distColor + '"/>' +
          '<circle cx="280" cy="268" r="3" fill="' + stage.distColor + '"/>';
      }

      // Right Information Card
      svgContent +=
        '<g transform="translate(365, 40)">' +
          '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="#3b82f6">Jābir ibn Ḥayyān (c. 800)</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="11" fill="currentColor">The father of Arab</text>' +
          '<text x="12" y="70" font-size="11" font-weight="600" fill="#3b82f6">alchemy (Geber).</text>' +
          '<line x1="12" y1="86" x2="153" y2="86" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="106" font-size="11" font-weight="bold" fill="#d97706">Key Chemical Tools:</text>' +
          '<text x="12" y="124" font-size="10" fill="currentColor">• Alembic (*al-inbīq*)</text>' +
          '<text x="12" y="138" font-size="10" fill="currentColor">• Cucurbit (*qar\'*)</text>' +
          '<text x="12" y="152" font-size="10" fill="currentColor">• Crystallization</text>' +
          '<text x="12" y="166" font-size="10" fill="currentColor">• Sublimation</text>' +
          '<line x1="12" y1="180" x2="153" y2="180" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="198" font-size="10" fill="var(--color-text-muted, #666)">Separated pure alcohol</text>' +
          '<text x="12" y="212" font-size="10" fill="var(--color-text-muted, #666)">and mineral acids</text>' +
          '<text x="12" y="226" font-size="10" fill="var(--color-text-muted, #666)">(nitric and sulfuric),</text>' +
          '<text x="12" y="240" font-size="10" font-weight="bold" fill="#10b981">founding chemical craft.</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Birth of Distillation Technology:</strong> Islamic alchemists like Jābir ibn Ḥayyān (eighth century) transformed ancient metallurgy and medicine into an experimental art. By inventing the <em>alembic</em> still-head with an internal condensation gutter and downward-sloping spout, they mastered fractional distillation—separating substances by their differing boiling points and discovering pure alcohol (*al-kuḥūl*) and mineral acids (sulfuric, nitric, and aqua regia).';
    }

    slider.addEventListener('input', draw);
    btnLow.addEventListener('click', function () { slider.value = 1; draw(); });
    btnMed.addEventListener('click', function () { slider.value = 2; draw(); });
    btnHigh.addEventListener('click', function () { slider.value = 3; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 2: The Phlogiston Anomaly vs Oxygen Combustion
   * ------------------------------------------------------------------------- */
  FIG['fig-phlogiston-vs-oxygen'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Competing Theory of Combustion: ' +
            '<span id="fig-phlog-mode-val" class="fig-readout">Phlogiston Theory (Stahl, c. 1700)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-phlog" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. Phlogiston Model (1700)</button>' +
          '<button type="button" id="fig-btn-oxygen" class="fig-btn">2. Lavoisier\'s Oxygen Model (1777)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-phlog-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-phlog-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnPhlog = container.querySelector('#fig-btn-phlog');
    var btnOxy = container.querySelector('#fig-btn-oxygen');
    var modeVal = container.querySelector('#fig-phlog-mode-val');
    var svg = container.querySelector('#fig-phlog-svg');
    var explain = container.querySelector('#fig-phlog-explain');

    var currentMode = 'phlogiston';

    function setBtnActive(activeBtn) {
      btnPhlog.style.background = ''; btnPhlog.style.color = ''; btnPhlog.style.borderColor = '';
      btnOxy.style.background = ''; btnOxy.style.color = ''; btnOxy.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      var cx = 180, cy = 180;

      if (currentMode === 'phlogiston') {
        modeVal.textContent = "Phlogiston Theory (Becher & Stahl, c. 1700)";
        var svgContent =
          '<!-- Balance Beam scale tilted (Anomaly) -->' +
          '<line x1="80" y1="130" x2="280" y2="170" stroke="#71717a" stroke-width="4"/>' +
          '<polygon points="180,150 170,220 190,220" fill="#52525b"/>' +

          '<!-- Left Pan: Original Metal (Lead/Tin) -->' +
          '<line x1="80" y1="130" x2="80" y2="190" stroke="#a1a1aa" stroke-width="1.5"/>' +
          '<path d="M 50 190 Q 80 205 110 190" fill="none" stroke="#71717a" stroke-width="2"/>' +
          '<rect x="65" y="175" width="30" height="15" fill="#64748b" rx="2"/>' +
          '<text x="80" y="215" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Metal (100 g)</text>' +

          '<!-- Right Pan: Calx after Burning (Heavier!) -->' +
          '<line x1="280" y1="170" x2="280" y2="230" stroke="#a1a1aa" stroke-width="1.5"/>' +
          '<path d="M 250 230 Q 280 245 310 230" fill="none" stroke="#71717a" stroke-width="2"/>' +
          '<circle cx="280" cy="225" r="14" fill="#d97706"/>' +
          '<text x="280" y="255" font-size="10" font-weight="bold" fill="#d97706" text-anchor="middle">Calx / Ash (108 g!)</text>' +

          '<!-- Escape of Phlogiston smoke -->' +
          '<path d="M 80 160 Q 60 130 90 100 Q 120 70 80 50" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="3 3"/>' +
          '<text x="105" y="80" font-size="11" font-weight="bold" fill="#ef4444">Phlogiston Escapes (↑)</text>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#ef4444">The Phlogiston Paradox</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Theory stated:</text>' +
            '<text x="12" y="70" font-size="11" font-weight="bold" fill="#ef4444">Metal = Calx + Phlogiston</text>' +
            '<line x1="12" y1="86" x2="153" y2="86" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="106" font-size="11" fill="currentColor">Burning releases the</text>' +
            '<text x="12" y="120" font-size="11" fill="currentColor">phlogiston into air.</text>' +
            '<line x1="12" y1="135" x2="153" y2="135" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="155" font-size="11" font-weight="bold" fill="#ef4444">The Fatal Anomaly:</text>' +
            '<text x="12" y="173" font-size="10" fill="currentColor">If something is released,</text>' +
            '<text x="12" y="187" font-size="10" fill="currentColor">why does the remaining</text>' +
            '<text x="12" y="201" font-size="10" font-weight="bold" fill="#ef4444">calx weigh MORE (+8%)?</text>' +
            '<line x1="12" y1="215" x2="153" y2="215" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="233" font-size="10" fill="var(--color-text-muted, #666)">Some claimed phlogiston</text>' +
            '<text x="12" y="247" font-size="10" fill="var(--color-text-muted, #666)">had "negative weight"!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Phlogiston Anomaly (c. 1700–1775):</strong> Georg Stahl proposed that all combustible bodies contain <em>phlogiston</em>, released upon burning. While elegant for explaining smelting, it suffered a crippling quantitative failure: when metals were roasted into a calx (oxide), the ash gained weight. Desperate defenders argued that phlogiston possessed "negative gravity" (levity), floating upward and making metals lighter.';
      } else {
        modeVal.textContent = "Lavoisier's Oxygen Combustion Model (1777)";
        var svgContent =
          '<!-- Balance Scale in perfect equilibrium with captured oxygen -->' +
          '<line x1="80" y1="150" x2="280" y2="150" stroke="#71717a" stroke-width="4"/>' +
          '<polygon points="180,150 170,220 190,220" fill="#52525b"/>' +

          '<!-- Left: Metal (100g) + Absorbed Oxygen (8g) in Sealed Chamber -->' +
          '<line x1="80" y1="150" x2="80" y2="200" stroke="#a1a1aa" stroke-width="1.5"/>' +
          '<path d="M 50 200 Q 80 215 110 200" fill="none" stroke="#71717a" stroke-width="2"/>' +
          '<rect x="65" y="185" width="30" height="15" fill="#64748b" rx="2"/>' +
          '<circle cx="80" cy="170" r="10" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8"/>' +
          '<text x="80" y="225" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Metal (100g) + O₂ (8g)</text>' +

          '<!-- Right: Resulting Metal Calx (108g) -->' +
          '<line x1="280" y1="150" x2="280" y2="200" stroke="#a1a1aa" stroke-width="1.5"/>' +
          '<path d="M 250 200 Q 280 215 310 200" fill="none" stroke="#71717a" stroke-width="2"/>' +
          '<circle cx="280" cy="190" r="14" fill="#10b981"/>' +
          '<text x="280" y="225" font-size="10" font-weight="bold" fill="#10b981" text-anchor="middle">Metal Oxide (108g)</text>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#10b981">Lavoisier\'s Solution</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" font-weight="bold" fill="#10b981">Conservation of Mass:</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">Combustion is COMBINATION</text>' +
            '<text x="12" y="86" font-size="11" fill="currentColor">with Oxygen (*oxygène*).</text>' +
            '<line x1="12" y1="102" x2="153" y2="102" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="122" font-size="11" font-weight="bold" fill="#3b82f6">Mass Equation:</text>' +
            '<text x="12" y="140" font-size="10" fill="currentColor">Mass(Metal) + Mass(O₂)</text>' +
            '<text x="12" y="156" font-size="11" font-weight="bold" fill="#10b981">= Mass(Calx Oxide)</text>' +
            '<line x1="12" y1="172" x2="153" y2="172" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="192" font-size="10" fill="var(--color-text-muted, #666)">In a sealed vessel,</text>' +
            '<text x="12" y="206" font-size="10" fill="var(--color-text-muted, #666)">the total mass</text>' +
            '<text x="12" y="220" font-size="10" font-weight="bold" fill="#10b981">remains STRICTLY CONSTANT.</text>' +
            '<text x="12" y="244" font-size="10" fill="var(--color-text-muted, #666)">Phlogiston was dead.</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Lavoisier’s Chemical Revolution (1777):</strong> Antoine-Laurent Lavoisier demonstrated that combustion is not decomposition (loss of phlogiston), but <strong>synthesis</strong> (combination with oxygen gas from the atmosphere). The gain in the calx’s weight equals precisely the weight of air lost from the sealed container. Matter is neither created nor destroyed.';
      }

      svg.innerHTML = svgContent;
    }

    btnPhlog.addEventListener('click', function () { currentMode = 'phlogiston'; setBtnActive(btnPhlog); draw(); });
    btnOxy.addEventListener('click', function () { currentMode = 'oxygen'; setBtnActive(btnOxy); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 3: Lavoisier’s Sealed 12-Day Mercury Experiment
   * ------------------------------------------------------------------------- */
  FIG['fig-lavoisier-balance'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-mercury-day">Heating Duration: ' +
            '<span id="fig-mercury-day-val" class="fig-readout">Day 0 (Initial Setup)</span>' +
          '</label>' +
          '<input type="range" id="fig-mercury-day" min="0" max="12" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-mercury-btn-start" class="fig-btn">Day 0 (Start)</button>' +
          '<button type="button" id="fig-mercury-btn-mid" class="fig-btn">Day 6 (Active Calcination)</button>' +
          '<button type="button" id="fig-mercury-btn-end" class="fig-btn">Day 12 (about 1/6 of the air absorbed)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-mercury-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-mercury-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-mercury-day');
    var dayVal = container.querySelector('#fig-mercury-day-val');
    var btnStart = container.querySelector('#fig-mercury-btn-start');
    var btnMid = container.querySelector('#fig-mercury-btn-mid');
    var btnEnd = container.querySelector('#fig-mercury-btn-end');
    var svg = container.querySelector('#fig-mercury-svg');
    var explain = container.querySelector('#fig-mercury-explain');

    function draw() {
      var day = parseInt(slider.value, 10);
      dayVal.textContent = 'Day ' + day + (day === 0 ? ' (Air Volume: 50 cubic inches)' : day === 12 ? ' (Air Volume: 42 cu. in. - about 1/6 absorbed)' : ' (Calx accumulating)');

      // In Lavoisier's experiment: 50 cubic inches of air initially in bell jar
      // Over 12 days, 8 cubic inches (about 1/6 of the enclosed air) is consumed
      var airLostFraction = (day / 12) * 0.16; // 16% volume loss
      var waterRise = airLostFraction * 90; // pixels mercury level rises inside bell jar

      var svgContent =
        '<!-- Furnace on Left holding Retort -->' +
        '<rect x="40" y="220" width="100" height="90" fill="#78350f" rx="4"/>' +
        '<text x="90" y="270" font-size="11" fill="#fef3c7" font-weight="bold" text-anchor="middle">Furnace</text>' +

        '<!-- Glass Retort Matrass containing boiling Mercury (Hg) -->' +
        '<path d="M 60 215 C 60 170 120 170 120 215 Z" fill="rgba(255,255,255,0.3)" stroke="#71717a" stroke-width="2"/>' +
        '<!-- Liquid Mercury in Retort -->' +
        '<path d="M 62 214 C 62 195 118 195 118 214 Z" fill="#94a3b8"/>' +
        '<!-- Red Calx specks (HgO) forming on mercury surface -->' +
        '<circle cx="80" cy="195" r="' + (day * 0.3 + 1) + '" fill="#ef4444"/>' +
        '<circle cx="95" cy="193" r="' + (day * 0.3 + 1) + '" fill="#ef4444"/>' +
        '<circle cx="105" cy="197" r="' + (day * 0.3 + 1) + '" fill="#ef4444"/>' +

        '<!-- Long glass neck curving from retort over to Bell Jar in trough -->' +
        '<path d="M 90 170 Q 90 90 180 90 Q 230 90 230 200" fill="none" stroke="#71717a" stroke-width="5"/>' +
        '<path d="M 90 170 Q 90 90 180 90 Q 230 90 230 200" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>' +

        '<!-- Mercury Trough (Cistern) on Right -->' +
        '<rect x="180" y="260" width="160" height="50" fill="#64748b" rx="2"/>' +
        '<text x="260" y="295" font-size="11" fill="#f8fafc" font-weight="bold" text-anchor="middle">Mercury Trough</text>' +

        '<!-- Inverted Glass Bell Jar in Trough -->' +
        '<rect x="200" y="110" width="120" height="150" fill="rgba(56, 189, 248, ' + (0.15 - airLostFraction * 0.3) + ')" stroke="#71717a" stroke-width="2.5"/>' +
        '<!-- Rising Mercury Level inside Bell Jar -->' +
        '<rect x="202" y="' + (260 - waterRise) + '" width="116" height="' + waterRise + '" fill="#94a3b8"/>' +
        '<line x1="202" y1="' + (260 - waterRise) + '" x2="318" y2="' + (260 - waterRise) + '" stroke="#334155" stroke-width="2"/>' +
        '<text x="260" y="' + (255 - waterRise) + '" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">Mercury Level</text>' +

        '<!-- Label for trapped air volume -->' +
        '<text x="260" y="145" font-size="11" font-weight="bold" fill="#3b82f6" text-anchor="middle">Air Volume: ' + (50 - (day/12)*8).toFixed(1) + ' in³</text>' +

        '<!-- Right Info Card -->' +
        '<g transform="translate(365, 40)">' +
          '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Lavoisier\'s 12-Day Test</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" fill="currentColor">1. Heated mercury for 12</text>' +
          '<text x="12" y="66" font-size="11" fill="currentColor">days at boiling point.</text>' +
          '<line x1="12" y1="80" x2="153" y2="80" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="98" font-size="11" font-weight="bold" fill="#ef4444">Red Calx Formed:</text>' +
          '<text x="12" y="114" font-size="10" fill="currentColor">45 grains of red scale</text>' +
          '<text x="12" y="128" font-size="10" fill="currentColor">(Mercuric Oxide, HgO).</text>' +
          '<line x1="12" y1="142" x2="153" y2="142" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="160" font-size="11" font-weight="bold" fill="#3b82f6">Air Absorbed:</text>' +
          '<text x="12" y="176" font-size="10" fill="currentColor">Volume dropped by about 1/6</text>' +
          '<text x="12" y="190" font-size="10" fill="currentColor">(from 50 to 42 in³).</text>' +
          '<line x1="12" y1="204" x2="153" y2="204" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="222" font-size="11" font-weight="bold" fill="#10b981">2. Reverse Step:</text>' +
          '<text x="12" y="238" font-size="10" fill="var(--color-text-muted, #666)">Heating the calx released</text>' +
          '<text x="12" y="252" font-size="10" font-weight="bold" fill="#10b981">EXACTLY 8 in³ of pure O₂!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Lavoisier’s Quantitative Masterpiece (mid-1770s):</strong> Lavoisier heated liquid mercury in a sealed glass retort connected to a bell jar for 12 days. The air in the jar contracted by about one-sixth ($8$ of $50$ cubic inches), leaving behind unbreathable nitrogen (*azote*), while red mercuric oxide formed in the retort. He then collected that red oxide and heated it intensely: it decomposed into pure liquid mercury, releasing <em>exactly 8 cubic inches of pure respirable oxygen gas</em>. Synthesis and analysis were in perfect quantitative balance.';
    }

    slider.addEventListener('input', draw);
    btnStart.addEventListener('click', function () { slider.value = 0; draw(); });
    btnMid.addEventListener('click', function () { slider.value = 6; draw(); });
    btnEnd.addEventListener('click', function () { slider.value = 12; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 4: Dalton’s Law of Multiple Proportions
   * ------------------------------------------------------------------------- */
  FIG['fig-dalton-stoichiometry'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Compound Pair to Compare: ' +
            '<span id="fig-dalton-pair-val" class="fig-readout">Carbon Oxides (CO vs CO₂)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-dalton-carbon" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">Carbon Oxides (CO / CO₂)</button>' +
          '<button type="button" id="fig-btn-dalton-nitrogen" class="fig-btn">Nitrogen Oxides (N₂O / NO / NO₂)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-dalton-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-dalton-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnCarbon = container.querySelector('#fig-btn-dalton-carbon');
    var btnNitro = container.querySelector('#fig-btn-dalton-nitrogen');
    var pairVal = container.querySelector('#fig-dalton-pair-val');
    var svg = container.querySelector('#fig-dalton-svg');
    var explain = container.querySelector('#fig-dalton-explain');

    var currentSystem = 'carbon';

    function setBtnActive(activeBtn) {
      btnCarbon.style.background = ''; btnCarbon.style.color = ''; btnCarbon.style.borderColor = '';
      btnNitro.style.background = ''; btnNitro.style.color = ''; btnNitro.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (currentSystem === 'carbon') {
        pairVal.textContent = "Carbon Oxides (CO vs CO₂)";

        var svgContent =
          '<!-- Compound 1: Carbon Monoxide (CO) -->' +
          '<g transform="translate(40, 60)">' +
            '<rect x="0" y="0" width="300" height="95" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1.5"/>' +
            '<text x="15" y="28" font-size="13" font-weight="bold" fill="currentColor">Carbon Monoxide (CO)</text>' +
            '<!-- Carbon atom -->' +
            '<circle cx="60" cy="62" r="18" fill="#1e293b"/>' +
            '<text x="60" y="67" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">C</text>' +
            '<text x="60" y="93" font-size="9" fill="currentColor" text-anchor="middle">12 g</text>' +
            '<!-- Oxygen atom -->' +
            '<circle cx="105" cy="62" r="18" fill="#ef4444"/>' +
            '<text x="105" y="67" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">O</text>' +
            '<text x="105" y="93" font-size="9" fill="currentColor" text-anchor="middle">16 g</text>' +
            '<!-- Stoichiometry ratio -->' +
            '<text x="145" y="66" font-size="12" fill="#3b82f6" font-weight="bold">Ratio: 12g C : 16g O</text>' +
          '</g>' +

          '<!-- Compound 2: Carbon Dioxide (CO2) -->' +
          '<g transform="translate(40, 180)">' +
            '<rect x="0" y="0" width="300" height="95" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1.5"/>' +
            '<text x="15" y="28" font-size="13" font-weight="bold" fill="currentColor">Carbon Dioxide (CO₂)</text>' +
            '<!-- Oxygen atom 1 -->' +
            '<circle cx="45" cy="62" r="18" fill="#ef4444"/>' +
            '<text x="45" y="67" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">O</text>' +
            '<text x="45" y="93" font-size="9" fill="currentColor" text-anchor="middle">16 g</text>' +
            '<!-- Carbon atom -->' +
            '<circle cx="85" cy="62" r="18" fill="#1e293b"/>' +
            '<text x="85" y="67" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">C</text>' +
            '<text x="85" y="93" font-size="9" fill="currentColor" text-anchor="middle">12 g</text>' +
            '<!-- Oxygen atom 2 -->' +
            '<circle cx="125" cy="62" r="18" fill="#ef4444"/>' +
            '<text x="125" y="67" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">O</text>' +
            '<text x="125" y="93" font-size="9" fill="currentColor" text-anchor="middle">16 g</text>' +
            '<!-- Stoichiometry ratio -->' +
            '<text x="155" y="66" font-size="12" fill="#10b981" font-weight="bold">Ratio: 12g C : 32g O</text>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Multiple Proportions</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">John Dalton (1803):</text>' +
            '<text x="12" y="70" font-size="10" fill="currentColor">For a fixed mass of C</text>' +
            '<text x="12" y="84" font-size="10" fill="currentColor">(12 grams):</text>' +
            '<line x1="12" y1="98" x2="153" y2="98" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="118" font-size="11" fill="#3b82f6">CO has: <tspan font-weight="bold">16 g oxygen</tspan></text>' +
            '<text x="12" y="136" font-size="11" fill="#10b981">CO₂ has: <tspan font-weight="bold">32 g oxygen</tspan></text>' +
            '<line x1="12" y1="152" x2="153" y2="152" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="172" font-size="11" font-weight="bold" fill="#ef4444">Ratio of Oxygen:</text>' +
            '<text x="12" y="196" font-size="16" font-weight="800" fill="#ef4444">16 : 32 = 1 : 2</text>' +
            '<line x1="12" y1="210" x2="153" y2="210" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="228" font-size="10" fill="var(--color-text-muted, #666)">Small whole numbers!</text>' +
            '<text x="12" y="242" font-size="10" font-weight="bold" fill="#10b981">Strong evidence for atoms</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Dalton’s Law of Multiple Proportions (1803):</strong> When two elements combine to form more than one compound, the masses of one element that combine with a fixed mass of the other stand in <strong>small whole-number ratios</strong> ($1:2$). There are no fractional atoms (no $1.5$ atoms of oxygen). This integer stepping is exactly what you expect if matter is made of discrete particles — atoms.';
      } else {
        pairVal.textContent = "Nitrogen Oxides (N₂O vs NO vs NO₂)";

        var svgContent =
          '<!-- Compound 1: N2O -->' +
          '<g transform="translate(40, 40)">' +
            '<rect x="0" y="0" width="300" height="70" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="11" font-weight="bold" fill="currentColor">Nitrous Oxide (N₂O): 28g N : 16g O (Ratio = 1)</text>' +
            '<circle cx="40" cy="46" r="14" fill="#3b82f6"/><circle cx="72" cy="46" r="14" fill="#3b82f6"/><circle cx="104" cy="46" r="14" fill="#ef4444"/>' +
          '</g>' +
          '<!-- Compound 2: NO -->' +
          '<g transform="translate(40, 130)">' +
            '<rect x="0" y="0" width="300" height="70" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="11" font-weight="bold" fill="currentColor">Nitric Oxide (NO): 28g N : 32g O (Ratio = 2)</text>' +
            '<circle cx="56" cy="46" r="14" fill="#3b82f6"/><circle cx="88" cy="46" r="14" fill="#ef4444"/>' +
          '</g>' +
          '<!-- Compound 3: NO2 -->' +
          '<g transform="translate(40, 220)">' +
            '<rect x="0" y="0" width="300" height="70" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="11" font-weight="bold" fill="currentColor">Nitrogen Dioxide (NO₂): 28g N : 64g O (Ratio = 4)</text>' +
            '<circle cx="40" cy="46" r="14" fill="#ef4444"/><circle cx="72" cy="46" r="14" fill="#3b82f6"/><circle cx="104" cy="46" r="14" fill="#ef4444"/>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Nitrogen Series</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="10" fill="currentColor">For fixed 28g of Nitrogen:</text>' +
            '<text x="12" y="78" font-size="11" fill="#3b82f6">N₂O: 16g Oxygen (1×)</text>' +
            '<text x="12" y="98" font-size="11" fill="#f59e0b">NO: 32g Oxygen (2×)</text>' +
            '<text x="12" y="118" font-size="11" fill="#ef4444">NO₂: 64g Oxygen (4×)</text>' +
            '<line x1="12" y1="135" x2="153" y2="135" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="155" font-size="12" font-weight="bold" fill="#10b981">Integer Step Ratios:</text>' +
            '<text x="12" y="180" font-size="16" font-weight="800" fill="#10b981">1 : 2 : 4</text>' +
            '<line x1="12" y1="200" x2="153" y2="200" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="220" font-size="10" fill="var(--color-text-muted, #666)">A continuous fluid</text>' +
            '<text x="12" y="234" font-size="10" fill="var(--color-text-muted, #666)">cannot explain integer</text>' +
            '<text x="12" y="248" font-size="10" font-weight="bold" fill="#ef4444">multiples: evidence for atoms.</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Nitrogen Series (1:2:4 Ratio):</strong> For a fixed 28 grams of nitrogen, the masses of oxygen in nitrous oxide, nitric oxide, and nitrogen dioxide are 16g, 32g, and 64g—an exact mathematical ratio of $1:2:4$. Dalton read this as strong evidence that compounds are built from discrete, whole units of matter.';
      }

      svg.innerHTML = svgContent;
    }

    btnCarbon.addEventListener('click', function () { currentSystem = 'carbon'; setBtnActive(btnCarbon); draw(); });
    btnNitro.addEventListener('click', function () { currentSystem = 'nitrogen'; setBtnActive(btnNitro); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 5: Gay-Lussac & Avogadro Gas Combining Volumes
   * ------------------------------------------------------------------------- */
  FIG['fig-avogadro-volumes'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Reaction Progress: ' +
            '<span id="fig-avo-state-val" class="fig-readout">Reactants (2 Vol H₂ + 1 Vol O₂)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-avo-react" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. Separate Gas Volumes</button>' +
          '<button type="button" id="fig-btn-avo-prod" class="fig-btn">2. React to Form Steam (2H₂O)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-avo-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-avo-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnReact = container.querySelector('#fig-btn-avo-react');
    var btnProd = container.querySelector('#fig-btn-avo-prod');
    var stateVal = container.querySelector('#fig-avo-state-val');
    var svg = container.querySelector('#fig-avo-svg');
    var explain = container.querySelector('#fig-avo-explain');

    var isReacted = false;

    function setBtnActive(activeBtn) {
      btnReact.style.background = ''; btnReact.style.color = ''; btnReact.style.borderColor = '';
      btnProd.style.background = ''; btnProd.style.color = ''; btnProd.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (!isReacted) {
        stateVal.textContent = "Reactants: 2 Volumes of Hydrogen + 1 Volume of Oxygen";

        var svgContent =
          '<!-- Container 1: 1 Volume of Hydrogen -->' +
          '<g transform="translate(30, 80)">' +
            '<rect x="0" y="0" width="90" height="120" rx="6" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="45" y="-12" font-size="11" font-weight="bold" fill="#3b82f6" text-anchor="middle">1 Vol H₂</text>' +
            '<!-- Diatomic molecules H2 (2 pairs) -->' +
            '<circle cx="30" cy="40" r="7" fill="#3b82f6"/><circle cx="42" cy="40" r="7" fill="#3b82f6"/>' +
            '<circle cx="50" cy="85" r="7" fill="#3b82f6"/><circle cx="62" cy="85" r="7" fill="#3b82f6"/>' +
          '</g>' +
          '<text x="135" y="145" font-size="20" font-weight="bold" fill="currentColor">+</text>' +

          '<!-- Container 2: 2nd Volume of Hydrogen -->' +
          '<g transform="translate(150, 80)">' +
            '<rect x="0" y="0" width="90" height="120" rx="6" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" stroke-width="2"/>' +
            '<text x="45" y="-12" font-size="11" font-weight="bold" fill="#3b82f6" text-anchor="middle">1 Vol H₂</text>' +
            '<circle cx="35" cy="50" r="7" fill="#3b82f6"/><circle cx="47" cy="50" r="7" fill="#3b82f6"/>' +
            '<circle cx="45" cy="95" r="7" fill="#3b82f6"/><circle cx="57" cy="95" r="7" fill="#3b82f6"/>' +
          '</g>' +
          '<text x="255" y="145" font-size="20" font-weight="bold" fill="currentColor">+</text>' +

          '<!-- Container 3: 1 Volume of Oxygen -->' +
          '<g transform="translate(270, 80)">' +
            '<rect x="0" y="0" width="90" height="120" rx="6" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>' +
            '<text x="45" y="-12" font-size="11" font-weight="bold" fill="#ef4444" text-anchor="middle">1 Vol O₂</text>' +
            '<!-- Diatomic O2 (2 pairs of bigger atoms) -->' +
            '<circle cx="35" cy="45" r="10" fill="#ef4444"/><circle cx="53" cy="45" r="10" fill="#ef4444"/>' +
            '<circle cx="40" cy="90" r="10" fill="#ef4444"/><circle cx="58" cy="90" r="10" fill="#ef4444"/>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(380, 40)">' +
            '<rect x="0" y="0" width="150" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Gay-Lussac (1808)</text>' +
            '<line x1="12" y1="34" x2="138" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Gases combine in</text>' +
            '<text x="12" y="70" font-size="11" font-weight="bold" fill="#3b82f6">simple volume ratios:</text>' +
            '<line x1="12" y1="86" x2="138" y2="86" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="106" font-size="11" fill="#3b82f6">2 Vol Hydrogen</text>' +
            '<text x="12" y="122" font-size="11" fill="currentColor">+ 1 Vol Oxygen</text>' +
            '<text x="12" y="142" font-size="11" font-weight="bold" fill="#10b981">→ 2 Vol Steam!</text>' +
            '<line x1="12" y1="158" x2="138" y2="158" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="178" font-size="10" fill="var(--color-text-muted, #666)">Why 2 volumes</text>' +
            '<text x="12" y="192" font-size="10" fill="var(--color-text-muted, #666)">instead of 3 or 1?</text>' +
            '<text x="12" y="210" font-size="10" font-weight="bold" fill="#ef4444">Click button 2 to see</text>' +
            '<text x="12" y="226" font-size="10" font-weight="bold" fill="#ef4444">Avogadro\'s solution!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Volumetric Puzzle:</strong> Gay-Lussac showed that 2 liters of hydrogen gas combine with 1 liter of oxygen gas to produce exactly 2 liters of water vapor. Dalton rejected this, believing atoms could not split. How could 3 total volumes of gas become 2 volumes?';
      } else {
        stateVal.textContent = "Product: Exactly 2 Volumes of Water Vapor (Steam H₂O)";

        var svgContent =
          '<!-- Container 1: 1 Volume of Steam (H2O) -->' +
          '<g transform="translate(60, 80)">' +
            '<rect x="0" y="0" width="110" height="130" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2.5"/>' +
            '<text x="55" y="-12" font-size="12" font-weight="bold" fill="#10b981" text-anchor="middle">1 Vol Steam (H₂O)</text>' +
            '<!-- H2O Molecule 1 -->' +
            '<circle cx="45" cy="45" r="10" fill="#ef4444"/><circle cx="34" cy="55" r="6" fill="#3b82f6"/><circle cx="56" cy="55" r="6" fill="#3b82f6"/>' +
            '<!-- H2O Molecule 2 -->' +
            '<circle cx="65" cy="95" r="10" fill="#ef4444"/><circle cx="54" cy="105" r="6" fill="#3b82f6"/><circle cx="76" cy="105" r="6" fill="#3b82f6"/>' +
          '</g>' +
          '<text x="195" y="150" font-size="20" font-weight="bold" fill="currentColor">+</text>' +

          '<!-- Container 2: 2nd Volume of Steam (H2O) -->' +
          '<g transform="translate(225, 80)">' +
            '<rect x="0" y="0" width="110" height="130" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2.5"/>' +
            '<text x="55" y="-12" font-size="12" font-weight="bold" fill="#10b981" text-anchor="middle">1 Vol Steam (H₂O)</text>' +
            '<!-- H2O Molecule 3 -->' +
            '<circle cx="45" cy="45" r="10" fill="#ef4444"/><circle cx="34" cy="55" r="6" fill="#3b82f6"/><circle cx="56" cy="55" r="6" fill="#3b82f6"/>' +
            '<!-- H2O Molecule 4 -->' +
            '<circle cx="65" cy="95" r="10" fill="#ef4444"/><circle cx="54" cy="105" r="6" fill="#3b82f6"/><circle cx="76" cy="105" r="6" fill="#3b82f6"/>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(380, 40)">' +
            '<rect x="0" y="0" width="150" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#10b981">Avogadro (1811)</text>' +
            '<line x1="12" y1="34" x2="138" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="52" font-size="10" font-weight="bold" fill="currentColor">Avogadro\'s Hypothesis:</text>' +
            '<text x="12" y="68" font-size="10" fill="currentColor">Equal gas volumes</text>' +
            '<text x="12" y="82" font-size="10" fill="currentColor">contain EQUAL numbers</text>' +
            '<text x="12" y="96" font-size="10" font-weight="bold" fill="#3b82f6">of molecules!</text>' +
            '<line x1="12" y1="110" x2="138" y2="110" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="128" font-size="11" font-weight="bold" fill="#ef4444">Diatomic Molecules:</text>' +
            '<text x="12" y="146" font-size="10" fill="currentColor">Hydrogen is H₂;</text>' +
            '<text x="12" y="160" font-size="10" fill="currentColor">Oxygen is O₂.</text>' +
            '<line x1="12" y1="174" x2="138" y2="174" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="192" font-size="11" font-weight="bold" fill="#10b981">2 H₂ + 1 O₂ → 2 H₂O</text>' +
            '<text x="12" y="210" font-size="10" fill="var(--color-text-muted, #666)">Each O₂ splits its</text>' +
            '<text x="12" y="224" font-size="10" fill="var(--color-text-muted, #666)">two atoms between</text>' +
            '<text x="12" y="238" font-size="10" font-weight="bold" fill="#10b981">two water molecules!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Avogadro’s Molecular Hypothesis (1811):</strong> Amedeo Avogadro resolved the crisis by proposing that pure gaseous elements do not exist as solitary atoms, but as <strong>diatomic molecules</strong> ($H_2, O_2, N_2, Cl_2$). When 2 volumes of $H_2$ react with 1 volume of $O_2$, the oxygen molecule splits, distributing one oxygen atom into each of two water molecules ($2H_2O$), filling exactly 2 volumes of steam. Ignored for fifty years, it was finally vindicated by Stanislao Cannizzaro at the 1860 Karlsruhe Congress.';
      }

      svg.innerHTML = svgContent;
    }

    btnReact.addEventListener('click', function () { isReacted = false; setBtnActive(btnReact); draw(); });
    btnProd.addEventListener('click', function () { isReacted = true; setBtnActive(btnProd); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 6: Humphry Davy’s 1807 Electrolysis
   * ------------------------------------------------------------------------- */
  FIG['fig-davy-electrolysis'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Voltaic Battery Circuit: ' +
            '<span id="fig-davy-status-val" class="fig-readout">Circuit Open (No Current)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-davy-toggle" class="fig-btn">⚡ Connect 250-Plate Voltaic Battery</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-davy-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-davy-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnToggle = container.querySelector('#fig-btn-davy-toggle');
    var statusVal = container.querySelector('#fig-davy-status-val');
    var svg = container.querySelector('#fig-davy-svg');
    var explain = container.querySelector('#fig-davy-explain');

    var isLive = false;

    function draw() {
      if (!isLive) {
        statusVal.textContent = "Circuit Open — Molten Potash is inert";
        btnToggle.textContent = "⚡ Connect 250-Plate Voltaic Battery";
      } else {
        statusVal.textContent = "⚡ Active Electrolysis: Liberating Metallic Potassium!";
        btnToggle.textContent = "Disconnect Battery";
      }

      var svgContent =
        '<!-- Voltaic Pile Battery on Left -->' +
        '<g transform="translate(40, 100)">' +
          '<rect x="0" y="0" width="70" height="140" fill="var(--color-surface, #fff)" stroke="#71717a" stroke-width="2"/>' +
          '<text x="35" y="-12" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Voltaic Pile</text>';
      // Stack of copper and zinc discs
      for (var s = 0; s < 10; s++) {
        svgContent +=
          '<rect x="10" y="' + (15 + s * 11) + '" width="50" height="4" fill="#b45309"/>' +
          '<rect x="10" y="' + (19 + s * 11) + '" width="50" height="4" fill="#94a3b8"/>';
      }
      svgContent +=
        '<text x="35" y="155" font-size="9" fill="var(--color-text-muted, #666)" text-anchor="middle">250 Pairs</text>' +
        '</g>' +

        '<!-- Platinum Dish (Anode +) holding molten potash -->' +
        '<path d="M 200 240 L 320 240 L 305 275 L 215 275 Z" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>' +
        '<text x="260" y="295" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Platinum Dish (Anode +)</text>' +

        '<!-- Slightly moist Potassium Hydroxide (Potash) -->' +
        '<ellipse cx="260" cy="245" rx="45" ry="10" fill="#e2e8f0"/>' +
        '<text x="260" y="235" font-size="9" fill="#475569" text-anchor="middle">Moist Potash (KOH)</text>' +

        '<!-- Platinum Wire Electrode (Cathode -) descending into potash -->' +
        '<line x1="260" y1="90" x2="260" y2="242" stroke="#475569" stroke-width="4"/>' +
        '<text x="260" y="80" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">Platinum Wire (Cathode -)</text>' +

        '<!-- Connecting Wires -->' +
        '<!-- Positive wire from battery top to dish -->' +
        '<path d="M 75 110 Q 140 110 140 260 L 200 260" fill="none" stroke="' + (isLive ? '#ef4444' : '#71717a') + '" stroke-width="2.5"/>' +
        '<!-- Negative wire from battery bottom to cathode -->' +
        '<path d="M 75 230 Q 170 230 170 90 L 260 90" fill="none" stroke="' + (isLive ? '#3b82f6' : '#71717a') + '" stroke-width="2.5"/>';

      if (isLive) {
        // Bubbles of Oxygen at Anode (+)
        svgContent +=
          '<circle cx="225" cy="248" r="3" fill="#38bdf8"/><circle cx="232" cy="244" r="2.5" fill="#38bdf8"/>' +
          '<circle cx="295" cy="248" r="3" fill="#38bdf8"/><circle cx="288" cy="244" r="2.5" fill="#38bdf8"/>' +
          '<text x="320" y="230" font-size="10" font-weight="bold" fill="#38bdf8">O₂ Gas Bubbles (Anode)</text>' +

          '<!-- Globules of Potassium Metal at Cathode (-) with lilac flame -->' +
          '<circle cx="260" cy="242" r="6" fill="#cbd5e1" stroke="#3b82f6" stroke-width="1.5"/>' +
          '<!-- Lilac combustion flame of potassium -->' +
          '<polygon points="256,236 260,215 264,236" fill="#a855f7"/>' +
          '<polygon points="258,236 260,222 262,236" fill="#fef08a"/>' +
          '<text x="260" y="210" font-size="11" font-weight="bold" fill="#a855f7" text-anchor="middle">Metallic Potassium (K)!</text>';
      }

      // Card on right
      svgContent +=
        '<g transform="translate(370, 40)">' +
          '<rect x="0" y="0" width="160" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="#a855f7">Humphry Davy (1807)</text>' +
          '<line x1="12" y1="34" x2="148" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="10" fill="currentColor">At the Royal Institution,</text>' +
          '<text x="12" y="66" font-size="10" fill="currentColor">London: electricity as</text>' +
          '<text x="12" y="80" font-size="10" font-weight="bold" fill="#3b82f6">the chemical knife!</text>' +
          '<line x1="12" y1="94" x2="148" y2="94" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="112" font-size="11" font-weight="bold" fill="currentColor">Alkalis were NOT elements:</text>' +
          '<text x="12" y="130" font-size="10" fill="currentColor">Potash was proven to be</text>' +
          '<text x="12" y="144" font-size="10" fill="currentColor">the oxide of a brand new,</text>' +
          '<text x="12" y="158" font-size="10" font-weight="bold" fill="#a855f7">highly reactive metal!</text>' +
          '<line x1="12" y1="172" x2="148" y2="172" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="190" font-size="10" fill="currentColor">Davy isolated in rapid</text>' +
          '<text x="12" y="204" font-size="10" fill="currentColor">succession:</text>' +
          '<text x="12" y="220" font-size="10" font-weight="bold" fill="#10b981">K, Na, Ca, Mg, Sr, Ba</text>' +
          '<text x="12" y="244" font-size="9" fill="var(--color-text-muted, #777)">and proved Chlorine is elemental.</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Humphry Davy’s Electrochemical Breakthrough (October 1807):</strong> For centuries, caustic potash and soda were assumed to be irreducible elements. By connecting a colossal 250-plate Voltaic pile to molten potash on a platinum dish, Davy decomposed it. At the negative cathode wire, minute metallic globules with high metallic luster formed and spontaneously burst into brilliant lilac flame. Davy had isolated elemental <strong>potassium</strong>, proving that chemical affinity is fundamentally electrical in nature.';
    }

    btnToggle.addEventListener('click', function () {
      isLive = !isLive;
      draw();
    });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 7: Mendeleev’s 1869 Periodic Matrix & Predictive Gaps
   * ------------------------------------------------------------------------- */
  FIG['fig-mendeleev-table'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Mystery Element in 1869 Table: ' +
            '<span id="fig-mende-elem-val" class="fig-readout">Gap at Atomic Weight ~68 (Eka-Aluminium)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-mende-gap" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. 1869 Gap: Eka-Aluminium (? = 68)</button>' +
          '<button type="button" id="fig-btn-mende-disc" class="fig-btn">2. 1875 Discovery: Gallium (Ga = 69.7)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-mende-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-mende-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnGap = container.querySelector('#fig-btn-mende-gap');
    var btnDisc = container.querySelector('#fig-btn-mende-disc');
    var elemVal = container.querySelector('#fig-mende-elem-val');
    var svg = container.querySelector('#fig-mende-svg');
    var explain = container.querySelector('#fig-mende-explain');

    var isDiscovered = false;

    function setBtnActive(activeBtn) {
      btnGap.style.background = ''; btnGap.style.color = ''; btnGap.style.borderColor = '';
      btnDisc.style.background = ''; btnDisc.style.color = ''; btnDisc.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (!isDiscovered) {
        elemVal.textContent = "1869: Deliberate Gap Left Below Aluminium (? = 68)";
      } else {
        elemVal.textContent = "1875: Lecoq de Boisbaudran Discovers Gallium (Ga = 69.7)";
      }

      var cardBox = function (x, y, sym, weight, name, isMystery) {
        var fill = isMystery ? (isDiscovered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.15)') : 'var(--color-surface, #fff)';
        var stroke = isMystery ? (isDiscovered ? '#10b981' : '#ef4444') : 'var(--color-border, #ddd)';
        return (
          '<g transform="translate(' + x + ', ' + y + ')">' +
            '<rect x="0" y="0" width="70" height="55" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (isMystery ? '2' : '1') + '"/>' +
            '<text x="8" y="18" font-size="10" fill="var(--color-text-muted, #777)">' + weight + '</text>' +
            '<text x="35" y="36" font-size="16" font-weight="bold" fill="' + (isMystery ? (isDiscovered ? '#10b981' : '#ef4444') : 'currentColor') + '" text-anchor="middle">' + sym + '</text>' +
            '<text x="35" y="49" font-size="8" fill="var(--color-text-muted, #666)" text-anchor="middle">' + name + '</text>' +
          '</g>'
        );
      };

      var svgContent =
        '<!-- Section of Mendeleev’s 1869 Table (Groups III and IV) -->' +
        '<text x="60" y="30" font-size="11" font-weight="bold" fill="#3b82f6">Group III (R₂O₃)</text>' +
        '<text x="145" y="30" font-size="11" font-weight="bold" fill="#f59e0b">Group IV (RO₂)</text>' +
        '<text x="230" y="30" font-size="11" font-weight="bold" fill="#8b5cf6">Group V (R₂O₅)</text>' +

        // Row 2
        cardBox(40, 45, 'B', '11', 'Boron', false) +
        cardBox(125, 45, 'C', '12', 'Carbon', false) +
        cardBox(210, 45, 'N', '14', 'Nitrogen', false) +

        // Row 3
        cardBox(40, 110, 'Al', '27.4', 'Aluminium', false) +
        cardBox(125, 110, 'Si', '28', 'Silicon', false) +
        cardBox(210, 110, 'P', '31', 'Phosphorus', false) +

        // Row 4: The Gaps!
        (!isDiscovered
          ? cardBox(40, 175, '?=68', '68', 'Eka-Al', true)
          : cardBox(40, 175, 'Ga', '69.7', 'Gallium', true)) +

        cardBox(125, 175, '?=72', '72', 'Eka-Si', true) +
        cardBox(210, 175, 'As', '75', 'Arsenic', false) +

        // Row 5
        cardBox(40, 240, 'In', '113', 'Indium', false) +
        cardBox(125, 240, 'Sn', '118', 'Tin', false) +
        cardBox(210, 240, 'Sb', '122', 'Antimony', false) +

        // Comparison Data Card on Right
        '<g transform="translate(310, 35)">' +
          '<rect x="0" y="0" width="215" height="270" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Mendeleev\'s Prediction (1871)</text>' +
          '<line x1="12" y1="34" x2="203" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="10" font-weight="bold" fill="#ef4444">Predicted: Eka-Aluminium (Ea)</text>' +
          '<text x="12" y="68" font-size="10" fill="currentColor">• Atomic weight: ~68</text>' +
          '<text x="12" y="84" font-size="10" fill="currentColor">• Density: ~5.9 g/cm³</text>' +
          '<text x="12" y="100" font-size="10" fill="currentColor">• Melting point: Low (melts in hand)</text>' +
          '<text x="12" y="116" font-size="10" fill="currentColor">• Oxide formula: Ea₂O₃</text>' +
          '<line x1="12" y1="130" x2="203" y2="130" stroke="var(--color-border, #eee)"/>';

      if (isDiscovered) {
        svgContent +=
          '<text x="12" y="150" font-size="10" font-weight="bold" fill="#10b981">Actual Discovery: Gallium (1875)</text>' +
          '<text x="12" y="166" font-size="10" fill="currentColor">• Atomic weight: <tspan font-weight="bold">69.72</tspan></text>' +
          '<text x="12" y="182" font-size="10" fill="currentColor">• Density: <tspan font-weight="bold">5.91 g/cm³</tspan></text>' +
          '<text x="12" y="198" font-size="10" fill="currentColor">• Melting point: <tspan font-weight="bold">29.8°C</tspan></text>' +
          '<text x="12" y="214" font-size="10" fill="currentColor">• Oxide formula: <tspan font-weight="bold">Ga₂O₃</tspan></text>' +
          '<line x1="12" y1="228" x2="203" y2="228" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="248" font-size="10" font-weight="bold" fill="#10b981">Astonishing Accuracy! (&lt; 1% err)</text>';
      } else {
        svgContent +=
          '<text x="12" y="160" font-size="10" fill="var(--color-text-muted, #777)">Mendeleev left deliberate gaps</text>' +
          '<text x="12" y="176" font-size="10" fill="var(--color-text-muted, #777)">insisting that Nature would</text>' +
          '<text x="12" y="192" font-size="10" fill="var(--color-text-muted, #777)">provide the missing elements.</text>' +
          '<text x="12" y="220" font-size="10" font-weight="bold" fill="#3b82f6">Click Button 2 to reveal</text>' +
          '<text x="12" y="236" font-size="10" font-weight="bold" fill="#3b82f6">the 1875 discovery!</text>';
      }

      svgContent += '</g>';
      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Triumph of the Periodic Law (1869–1875):</strong> Others had noticed periodic patterns, but Dmitri Mendeleev did what no one else dared: where an element did not fit, he insisted that the atomic weights were measured incorrectly or that an element was yet undiscovered. When Paul-Émile Lecoq de Boisbaudran discovered <strong>Gallium</strong> in 1875, its measured density ($5.91$ g/cm³), atomic weight ($69.7$), and low melting point ($29.8^\\circ$C) matched Mendeleev’s predictions almost to the decimal point.';
    }

    btnGap.addEventListener('click', function () { isDiscovered = false; setBtnActive(btnGap); draw(); });
    btnDisc.addEventListener('click', function () { isDiscovered = true; setBtnActive(btnDisc); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 8: Part 7 Interactive Self-Scoring Quiz
   * ------------------------------------------------------------------------- */
  FIG['fig-quiz-part7'] = function (container) {
    var questions = [
      {
        question: "How did Robert Boyle define a chemical element in 'The Sceptical Chymist' (1661)?",
        options: [
          "As perfectly unmingled bodies, not made of any other bodies, of which compound bodies are composed (while doubting any known substance qualified)",
          "As one of four primordial qualities: earth, water, air, or fire",
          "As any substance that glows under phosphorus",
          "As a substance possessing negative weight"
        ],
        answer: 0,
        explanation: "Boyle rejected both Aristotle's four elements and Paracelsus's three principles (tria prima), describing an element as a simple, unmingled body that is not made of other bodies — while doubting that any known substance qualified. Lavoisier later turned this into a working laboratory definition."
      },
      {
        question: "What major observational anomaly plagued the phlogiston theory of combustion throughout the 18th century?",
        options: [
          "Combustion could occur underwater without oxygen",
          "When metals were roasted into a calx (oxide), the remaining ash was heavier than the original metal, contradicting the idea that phlogiston had escaped",
          "Flames were found to have negative temperature",
          "Diamonds resisted burning entirely"
        ],
        answer: 1,
        explanation: "If combustion was the escape of a material essence (phlogiston), metals should have lost weight upon calcination. Instead, metals like lead and tin gained weight, forcing defenders to propose unscientific ad-hoc theories like 'negative weight'."
      },
      {
        question: "What fundamental chemical principle was established by Antoine Lavoisier's sealed-vessel experiments?",
        options: [
          "The Law of Octaves",
          "The Conservation of Mass: in every chemical reaction, the total mass of the products equals the total mass of the reactants",
          "The Uncertainty Principle",
          "Electrochemical Dualism"
        ],
        answer: 1,
        explanation: "By conducting reactions in hermetically sealed vessels on precision balances, Lavoisier proved that the gain in the metal calx's mass equaled the exact mass of air absorbed from the flask, establishing the universal conservation of mass."
      },
      {
        question: "What was the purpose of the 1787 Chemical Nomenclature created by Guyton de Morveau, Lavoisier, Berthollet, and Fourcroy?",
        options: [
          "To replace obscure, mystical alchemical names ('butter of antimony', 'flowers of zinc') with systematic names reflecting elemental chemical composition",
          "To translate ancient Egyptian hieroglyphics into Latin",
          "To classify elements by their astrological constellations",
          "To encrypt military gunpowder recipes"
        ],
        answer: 0,
        explanation: "The 1787 reform abolished alchemical jargon and created a rational, compositional vocabulary based on oxygen acids and metal bases (e.g. sulfuric acid, copper sulfate, zinc oxide), providing the language modern chemistry still speaks."
      },
      {
        question: "What does John Dalton’s Law of Multiple Proportions (1803) demonstrate about matter?",
        options: [
          "Chemical elements combine in continuous, infinitely variable ratios like mixed liquids",
          "When two elements form multiple compounds, the masses of one element combining with a fixed mass of the other stand in small whole-number ratios (1:2, 1:3), proving discrete atoms",
          "Gases expand by 1/273 of their volume for every degree Celsius",
          "Atomic weight is equal to atomic number times two"
        ],
        answer: 1,
        explanation: "Dalton showed that in compounds like CO and CO₂, or N₂O, NO, and NO₂, the fixed mass of one element combines with integer multiples of the other (16g, 32g, 64g), proving matter is structured from indivisible integer units (atoms)."
      },
      {
        question: "How did Amedeo Avogadro (1811) resolve the conflict between Gay-Lussac’s gas volumes and Dalton’s atomic theory?",
        options: [
          "He proved that all gases have zero mass",
          "He showed that gases become liquid at room temperature",
          "He proposed that equal volumes of gases at the same temperature and pressure contain equal numbers of particles, and that elemental gases exist as diatomic molecules (H₂, O₂, N₂)",
          "He abandoned atomic theory entirely in favor of caloric fluid"
        ],
        answer: 2,
        explanation: "Avogadro showed that 2 volumes of H₂ combine with 1 volume of O₂ to yield 2 volumes of steam because oxygen molecules are diatomic (O₂) and split their atoms between two separate water molecules (2H₂O)."
      },
      {
        question: "What laboratory tool enabled Humphry Davy to isolate potassium, sodium, calcium, and magnesium in 1807–1808?",
        options: [
          "The electric current from a powerful Voltaic battery (electrolysis)",
          "The compound achromatic microscope",
          "A high-pressure steam centrifuge",
          "Fractional crystallization"
        ],
        answer: 0,
        explanation: "Davy connected hundreds of Voltaic battery plates to molten alkalis and alkaline earths, using electrical current to break powerful chemical bonds and isolate pure, lustrous metallic potassium and sodium."
      },
      {
        question: "What did the 1860 Karlsruhe Congress achieve for international chemistry?",
        options: [
          "It banned the manufacture of synthetic dyes",
          "Stanislao Cannizzaro revived Avogadro's hypothesis, standardizing a single, universally accepted set of atomic weights across Europe",
          "It officially adopted the phlogiston theory into university curricula",
          "It discovered the neutron"
        ],
        answer: 1,
        explanation: "Cannizzaro distributed his landmark pamphlet at Karlsruhe, showing how Avogadro's hypothesis consistently resolved the 50-year confusion between atomic weights and equivalent weights, providing the reliable data Mendeleev needed."
      },
      {
        question: "Why was Dmitri Mendeleev’s 1869 Periodic Table superior to previous periodic arrangements (such as Newlands or Meyer)?",
        options: [
          "He organized elements strictly in alphabetical order",
          "He proved that there are only 50 elements in the universe",
          "He incorporated electron orbital shells",
          "He left deliberate gaps for undiscovered elements and accurately predicted their atomic weights, densities, and chemical reactions before they were found"
        ],
        answer: 3,
        explanation: "Mendeleev recognized that the periodic law was an objective law of nature. Where elements did not fit, he left empty spaces and predicted the properties of unknown elements (like eka-aluminium / gallium and eka-silicon / germanium)."
      },
      {
        question: "Which metal’s discovery in 1875 by Lecoq de Boisbaudran dramatically confirmed Mendeleev’s periodic predictions?",
        options: [
          "Gallium (predicted by Mendeleev as 'eka-aluminium')",
          "Uranium",
          "Titanium",
          "Platinum"
        ],
        answer: 0,
        explanation: "Lecoq de Boisbaudran discovered Gallium in zinc blende ore; its measured density (5.91 g/cm³), atomic weight (69.7), and low melting point matched Mendeleev's 1871 prediction for eka-aluminium almost exactly."
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
            '<h4 style="margin:0; font-size:1.15rem;">Part 7 Evaluation: The Making of Chemistry</h4>' +
            '<span style="font-size:0.85rem; color:var(--color-text-muted, #666);">' + total + ' Questions</span>' +
          '</div>';

      for (var qIdx = 0; qIdx < questions.length; qIdx++) {
        var q = questions[qIdx];
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
