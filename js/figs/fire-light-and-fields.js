/**
 * Interactive Figures for Part 9: Fire, Light and Fields
 * Topics: Thermodynamics, Energy, Electromagnetism, Fields, Statistical Mechanics
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  function isDark() {
    return document.body.classList.contains('dark-theme');
  }

  function getThemeColors() {
    var dark = isDark();
    return {
      bg: dark ? '#181920' : '#ffffff',
      panelBg: dark ? '#22232e' : '#f8f8f6',
      border: dark ? '#333544' : '#e0ded8',
      text: dark ? '#e6e6e8' : '#222222',
      muted: dark ? '#8a8d9b' : '#666666',
      primary: dark ? '#6ab0f8' : '#2160c4',
      accent: dark ? '#f59e0b' : '#d97706',
      hot: dark ? '#f87171' : '#dc2626',
      cold: dark ? '#60a5fa' : '#2563eb',
      success: dark ? '#4ade80' : '#16a34a',
      purple: dark ? '#c084fc' : '#7c3aed',
      gold: dark ? '#fbbf24' : '#b45309'
    };
  }

  // =========================================================================
  // Figure 9.1: Carnot Heat Engine Cycle (P-V & T-S Diagrams)
  // =========================================================================
  FIG['fig-carnot-cycle'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    // Controls
    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Hot Reservoir ($T_H$):</strong>' +
      '<input type="range" id="carnot-th" min="400" max="800" step="10" value="600" style="width:110px;">' +
      '<span id="carnot-th-val">600 K</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Cold Reservoir ($T_C$):</strong>' +
      '<input type="range" id="carnot-tc" min="200" max="400" step="10" value="300" style="width:110px;">' +
      '<span id="carnot-tc-val">300 K</span>' +
      '</label>' +
      '<button id="carnot-play-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Cycle: Run</button>' +
      '<span id="carnot-eff-display" style="font-weight:bold; color:var(--color-primary, #2160c4);">Efficiency: 50.0%</span>';

    wrapper.appendChild(ctrlRow);

    // Canvas
    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    // Caption description
    var infoBox = document.createElement('div');
    infoBox.style.fontSize = '0.85rem';
    infoBox.style.color = 'var(--color-text-muted, #666)';
    infoBox.style.lineHeight = '1.4';
    infoBox.id = 'carnot-step-info';
    infoBox.innerHTML = '<strong>Stroke 1:</strong> Isothermal Expansion ($A \\to B$) absorbing heat $Q_H$ at constant temperature $T_H$. Gas does work on surroundings.';
    wrapper.appendChild(infoBox);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var thInput = ctrlRow.querySelector('#carnot-th');
    var tcInput = ctrlRow.querySelector('#carnot-tc');
    var thVal = ctrlRow.querySelector('#carnot-th-val');
    var tcVal = ctrlRow.querySelector('#carnot-tc-val');
    var playBtn = ctrlRow.querySelector('#carnot-play-btn');
    var effDisplay = ctrlRow.querySelector('#carnot-eff-display');

    var isAnimating = true;
    var cycleProgress = 0.0; // 0 to 4
    var animFrameId = null;

    function getCarnotPoints(TH, TC) {
      // P = nRT/V. For visualization:
      // A -> B: Isothermal at TH (V: 1.0 -> 2.2)
      // B -> C: Adiabatic expansion to TC (V: 2.2 -> 3.6, T drops to TC)
      // C -> D: Isothermal compression at TC (V: 3.6 -> 1.8)
      // D -> A: Adiabatic compression back to TH (V: 1.8 -> 1.0)
      var vA = 1.0, pA = (TH / 600) * 8.0;
      var vB = 2.2, pB = pA * (vA / vB);
      var vC = 3.6, pC = (TC / 600) * (pB * Math.pow(vB / vC, 1.4)) * 1.5;
      var vD = 1.63, pD = pC * (vC / vD);

      return {
        A: { v: vA, p: pA, t: TH, s: 1.0 },
        B: { v: vB, p: pB, t: TH, s: 2.5 },
        C: { v: vC, p: pC, t: TC, s: 2.5 },
        D: { v: vD, p: pD, t: TC, s: 1.0 }
      };
    }

    function render() {
      var colors = getThemeColors();
      var TH = parseFloat(thInput.value);
      var TC = parseFloat(tcInput.value);
      if (TC >= TH) {
        TC = TH - 50;
        tcInput.value = TC;
        tcVal.textContent = TC + ' K';
      }

      var efficiency = (1 - (TC / TH)) * 100;
      effDisplay.textContent = 'Carnot Efficiency: ' + efficiency.toFixed(1) + '% (η = 1 - T_C/T_H)';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var pts = getCarnotPoints(TH, TC);

      // --- Left Plot: P-V Indicator Diagram ---
      var ox1 = 60, oy1 = 280, w1 = 270, h1 = 230;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox1, oy1 - h1);
      ctx.lineTo(ox1, oy1);
      ctx.lineTo(ox1 + w1, oy1);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Volume (V)', ox1 + w1 - 40, oy1 + 20);
      ctx.save();
      ctx.translate(ox1 - 35, oy1 - h1 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Pressure (P)', 0, 0);
      ctx.restore();

      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('P-V Diagram (Clapeyron)', ox1 + 40, 30);

      function mapPV(v, p) {
        var x = ox1 + ((v - 0.6) / 3.4) * w1;
        var y = oy1 - ((p - 0.5) / 9.5) * h1;
        return { x: x, y: y };
      }

      var pA = mapPV(pts.A.v, pts.A.p);
      var pB = mapPV(pts.B.v, pts.B.p);
      var pC = mapPV(pts.C.v, pts.C.p);
      var pD = mapPV(pts.D.v, pts.D.p);

      // Draw P-V loop
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      // A -> B isothermal
      ctx.bezierCurveTo((pA.x + pB.x) / 2, pA.y + 10, pB.x - 20, pB.y - 10, pB.x, pB.y);
      // B -> C adiabatic
      ctx.bezierCurveTo(pB.x + 10, pB.y + 30, pC.x - 20, pC.y - 10, pC.x, pC.y);
      // C -> D isothermal
      ctx.bezierCurveTo((pC.x + pD.x) / 2, pC.y - 10, pD.x + 20, pD.y + 10, pD.x, pD.y);
      // D -> A adiabatic
      ctx.bezierCurveTo(pD.x - 10, pD.y - 30, pA.x + 10, pA.y + 20, pA.x, pA.y);
      ctx.closePath();

      // Enclosed area (Net Work W)
      ctx.fillStyle = isDark() ? 'rgba(106, 176, 248, 0.15)' : 'rgba(33, 96, 196, 0.12)';
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Corner points
      var cornerLabels = [{ p: pA, txt: 'A (T_H)' }, { p: pB, txt: 'B (T_H)' }, { p: pC, txt: 'C (T_C)' }, { p: pD, txt: 'D (T_C)' }];
      cornerLabels.forEach(function (c) {
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(c.p.x, c.p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.font = '11px sans-serif';
        ctx.fillText(c.txt, c.p.x + 6, c.p.y - 4);
      });

      // Work label in center
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Net Work W = ∮ P dV', (pA.x + pC.x) / 2 - 40, (pA.y + pC.y) / 2 + 5);

      // --- Right Plot: T-S Diagram ---
      var ox2 = 420, oy2 = 280, w2 = 250, h2 = 230;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox2, oy2 - h2);
      ctx.lineTo(ox2, oy2);
      ctx.lineTo(ox2 + w2, oy2);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Entropy (S)', ox2 + w2 - 40, oy2 + 20);
      ctx.save();
      ctx.translate(ox2 - 35, oy2 - h2 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Temperature (T)', 0, 0);
      ctx.restore();

      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('T-S Diagram (Rectangle)', ox2 + 40, 30);

      function mapTS(s, t) {
        var x = ox2 + ((s - 0.5) / 2.5) * w2;
        var y = oy2 - ((t - 100) / 800) * h2;
        return { x: x, y: y };
      }

      var tsA = mapTS(pts.A.s, pts.A.t);
      var tsB = mapTS(pts.B.s, pts.B.t);
      var tsC = mapTS(pts.C.s, pts.C.t);
      var tsD = mapTS(pts.D.s, pts.D.t);

      // T-S cycle is a clean rectangle
      ctx.beginPath();
      ctx.moveTo(tsA.x, tsA.y);
      ctx.lineTo(tsB.x, tsB.y);
      ctx.lineTo(tsC.x, tsC.y);
      ctx.lineTo(tsD.x, tsD.y);
      ctx.closePath();
      ctx.fillStyle = isDark() ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Q_H and Q_C annotations
      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Q_H in (Isothermal at T_H)', (tsA.x + tsB.x) / 2 - 50, tsA.y - 8);

      ctx.fillStyle = colors.cold;
      ctx.fillText('Q_C out (Isothermal at T_C)', (tsD.x + tsC.x) / 2 - 50, tsC.y + 18);

      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.fillText('ΔS = 0 (Adiabatic)', tsB.x + 8, (tsB.y + tsC.y) / 2);
      ctx.fillText('ΔS = 0 (Adiabatic)', tsA.x - 70, (tsA.y + tsD.y) / 2);

      // --- Tracer point indicating current state in the cycle ---
      var statePV, stateTS, stepDesc;
      var stage = Math.floor(cycleProgress);
      var frac = cycleProgress - stage;

      if (stage === 0) { // A -> B (Isothermal Expansion)
        statePV = { x: pA.x + (pB.x - pA.x) * frac, y: pA.y + (pB.y - pA.y) * frac + Math.sin(frac * Math.PI) * 12 };
        stateTS = { x: tsA.x + (tsB.x - tsA.x) * frac, y: tsA.y };
        stepDesc = '<strong>Stroke 1 (A → B):</strong> Isothermal Expansion at $T_H = ' + TH + '$ K. Heat $Q_H$ absorbed; system expands and performs work.';
      } else if (stage === 1) { // B -> C (Adiabatic Expansion)
        statePV = { x: pB.x + (pC.x - pB.x) * frac, y: pB.y + (pC.y - pB.y) * frac };
        stateTS = { x: tsB.x, y: tsB.y + (tsC.y - tsB.y) * frac };
        stepDesc = '<strong>Stroke 2 (B → C):</strong> Adiabatic Expansion. Insulated from reservoirs; gas cools from $' + TH + '$ K to $' + TC + '$ K while expanding.';
      } else if (stage === 2) { // C -> D (Isothermal Compression)
        statePV = { x: pC.x + (pD.x - pC.x) * frac, y: pC.y + (pD.y - pC.y) * frac - Math.sin(frac * Math.PI) * 10 };
        stateTS = { x: tsC.x + (tsD.x - tsC.x) * frac, y: tsC.y };
        stepDesc = '<strong>Stroke 3 (C → D):</strong> Isothermal Compression at $T_C = ' + TC + '$ K. Waste heat $Q_C$ dumped into cold sink as surroundings do work on gas.';
      } else { // D -> A (Adiabatic Compression)
        statePV = { x: pD.x + (pA.x - pD.x) * frac, y: pD.y + (pA.y - pD.y) * frac };
        stateTS = { x: tsD.x, y: tsD.y + (tsA.y - tsD.y) * frac };
        stepDesc = '<strong>Stroke 4 (D → A):</strong> Adiabatic Compression. Insulated from reservoirs; compression heats gas back up from $' + TC + '$ K to $' + TH + '$ K.';
      }

      infoBox.innerHTML = stepDesc;

      // Draw tracers
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.arc(statePV.x, statePV.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(stateTS.x, stateTS.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    function tick() {
      if (isAnimating) {
        cycleProgress = (cycleProgress + 0.015) % 4.0;
        render();
      }
      animFrameId = requestAnimationFrame(tick);
    }

    thInput.addEventListener('input', function () {
      thVal.textContent = thInput.value + ' K';
      render();
    });

    tcInput.addEventListener('input', function () {
      tcVal.textContent = tcInput.value + ' K';
      render();
    });

    playBtn.addEventListener('click', function () {
      isAnimating = !isAnimating;
      playBtn.textContent = isAnimating ? 'Cycle: Pause' : 'Cycle: Resume';
    });

    render();
    tick();
  };

  // =========================================================================
  // Figure 9.2: Joule's Paddle-Wheel Calorimeter (Mechanical Equivalent of Heat)
  // =========================================================================
  FIG['fig-joule-apparatus'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Falling Mass ($2m$):</strong>' +
      '<input type="range" id="joule-mass" min="5" max="30" step="1" value="15" style="width:100px;">' +
      '<span id="joule-mass-val">15 kg</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Fall Height ($h$):</strong>' +
      '<input type="range" id="joule-height" min="1" max="5" step="0.5" value="2.5" style="width:90px;">' +
      '<span id="joule-height-val">2.5 m</span>' +
      '</label>' +
      '<button id="joule-drop-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Release Weights</button>' +
      '<button id="joule-reset-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reset</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 360;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var readouts = document.createElement('div');
    readouts.style.display = 'grid';
    readouts.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    readouts.style.gap = '8px';
    readouts.style.fontSize = '0.85rem';
    readouts.style.padding = '8px';
    readouts.style.background = 'var(--color-bg, #fff)';
    readouts.style.borderRadius = '4px';
    readouts.style.border = '1px solid var(--color-border, #eee)';

    readouts.innerHTML =
      '<div><strong>Gravitational Work ($W = 2mgh$):</strong> <span id="joule-w-disp">367.9 J</span></div>' +
      '<div><strong>Equivalent Heat ($Q = W / J$):</strong> <span id="joule-q-disp">87.9 cal</span></div>' +
      '<div><strong>Water Temp Rise ($\\Delta T = Q / C$):</strong> <span id="joule-dt-disp" style="color:var(--color-hot, #dc2626); font-weight:bold;">0.000 °C</span></div>' +
      '<div><strong>Mechanical Equivalent ($J$):</strong> <span>4.184 J / calorie</span></div>';
    wrapper.appendChild(readouts);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var massSlider = ctrlRow.querySelector('#joule-mass');
    var heightSlider = ctrlRow.querySelector('#joule-height');
    var massVal = ctrlRow.querySelector('#joule-mass-val');
    var heightVal = ctrlRow.querySelector('#joule-height-val');
    var dropBtn = ctrlRow.querySelector('#joule-drop-btn');
    var resetBtn = ctrlRow.querySelector('#joule-reset-btn');

    var wDisp = readouts.querySelector('#joule-w-disp');
    var qDisp = readouts.querySelector('#joule-q-disp');
    var dtDisp = readouts.querySelector('#joule-dt-disp');

    var dropProgress = 0.0; // 0 = top, 1 = bottom
    var isDropping = false;
    var paddleAngle = 0;
    var totalDeltaT = 0;

    function render() {
      var colors = getThemeColors();
      var M = parseFloat(massSlider.value); // total kg for 2 masses
      var H = parseFloat(heightSlider.value); // meters
      var waterMassKg = 1.0; // 1 kg of water = 1000 g
      var g = 9.80665;
      var workJoules = M * g * H;
      var calories = workJoules / 4.184;
      var finalDeltaT = calories / 1000.0; // deg C

      wDisp.textContent = workJoules.toFixed(1) + ' J';
      qDisp.textContent = calories.toFixed(1) + ' cal';
      var currentDeltaT = finalDeltaT * dropProgress;
      dtDisp.textContent = '+' + currentDeltaT.toFixed(3) + ' °C (' + (currentDeltaT * 1.8).toFixed(3) + ' °F)';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Diagram setup:
      // Center: insulated calorimeter water copper bath (x: 280 to 440, y: 150 to 300)
      // Left pulley: x: 120, y: 80
      // Right pulley: x: 600, y: 80
      // Central spindle: x: 360, y: 80 to 260

      // Central axle and drum
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(360, 60);
      ctx.lineTo(360, 240);
      ctx.stroke();

      // Top drum
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.fillRect(345, 65, 30, 25);
      ctx.strokeRect(345, 65, 30, 25);

      // Left pulley
      ctx.beginPath();
      ctx.arc(120, 80, 20, 0, Math.PI * 2);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.stroke();

      // Right pulley
      ctx.beginPath();
      ctx.arc(600, 80, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cords from central drum over pulleys to masses
      var weightYLeft = 110 + dropProgress * (H / 5.0) * 160;
      var weightYRight = 110 + dropProgress * (H / 5.0) * 160;

      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.5;

      // Cord left
      ctx.beginPath();
      ctx.moveTo(350, 75);
      ctx.lineTo(120, 60);
      ctx.arc(120, 80, 20, -Math.PI / 2, Math.PI, true);
      ctx.lineTo(100, weightYLeft);
      ctx.stroke();

      // Cord right
      ctx.beginPath();
      ctx.moveTo(370, 75);
      ctx.lineTo(600, 60);
      ctx.arc(600, 80, 20, -Math.PI / 2, 0, false);
      ctx.lineTo(620, weightYRight);
      ctx.stroke();

      // Hanging Weights (lead blocks)
      var massW = 34, massH = 45;
      ctx.fillStyle = isDark() ? '#6b7280' : '#4b5563';
      ctx.fillRect(100 - massW / 2, weightYLeft, massW, massH);
      ctx.strokeRect(100 - massW / 2, weightYLeft, massW, massH);
      ctx.fillRect(620 - massW / 2, weightYRight, massW, massH);
      ctx.strokeRect(620 - massW / 2, weightYRight, massW, massH);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText((M / 2).toFixed(1) + 'kg', 100 - 14, weightYLeft + 26);
      ctx.fillText((M / 2).toFixed(1) + 'kg', 620 - 14, weightYRight + 26);

      // Height scale marks on left
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(70, 110);
      ctx.lineTo(70, 270);
      ctx.stroke();
      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.fillText('0 m', 45, 115);
      ctx.fillText(H.toFixed(1) + ' m', 40, 275);
      ctx.fillText('Fall Height h', 25, 195);

      // Calorimeter Vessel (Insulated copper vessel filled with water)
      var vx = 270, vy = 160, vw = 180, vh = 160;

      // Outer wooden insulating cask
      ctx.fillStyle = isDark() ? '#3b2f2f' : '#d2b48c';
      ctx.fillRect(vx - 8, vy - 4, vw + 16, vh + 12);

      // Inner brass container
      ctx.fillStyle = isDark() ? '#2a4365' : '#e0f2fe';
      ctx.fillRect(vx, vy, vw, vh);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(vx, vy, vw, vh);

      // Water surface waves
      ctx.fillStyle = isDark() ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.25)';
      ctx.fillRect(vx, vy + 20, vw, vh - 20);

      // Brass fixed baffles
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vx + 20, vy + 60); ctx.lineTo(vx + 60, vy + 60);
      ctx.moveTo(vx + vw - 20, vy + 60); ctx.lineTo(vx + vw - 60, vy + 60);
      ctx.moveTo(vx + 20, vy + 110); ctx.lineTo(vx + 60, vy + 110);
      ctx.moveTo(vx + vw - 20, vy + 110); ctx.lineTo(vx + vw - 60, vy + 110);
      ctx.stroke();

      // Rotating brass paddle blades inside water
      var pw = 35;
      var cosA = Math.cos(paddleAngle);
      var sinA = Math.sin(paddleAngle);

      ctx.save();
      ctx.translate(360, vy + 85);
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 4;
      // 4 sets of paddle vanes
      for (var b = 0; b < 4; b++) {
        var ang = paddleAngle + (b * Math.PI) / 2;
        var bx = Math.cos(ang) * pw;
        var by = Math.sin(ang) * 12;
        ctx.beginPath();
        ctx.moveTo(0, (b - 1.5) * 18);
        ctx.lineTo(bx, (b - 1.5) * 18 + by);
        ctx.stroke();
      }
      ctx.restore();

      // Precision Thermometer on right side of vessel
      var tx = 430, ty = 90, tw = 12, th = 180;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeRect(tx, ty, tw, th);

      // Mercury column inside thermometer
      var mercuryHeight = 40 + currentDeltaT * 120; // visual expansion
      ctx.fillStyle = colors.hot;
      ctx.fillRect(tx + 3, ty + th - mercuryHeight, tw - 6, mercuryHeight);
      ctx.beginPath();
      ctx.arc(tx + tw / 2, ty + th + 4, 8, 0, Math.PI * 2);
      ctx.fill();

      // Thermometer label
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Precision Thermometer', tx - 40, ty - 8);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors.hot;
      ctx.fillText('+' + currentDeltaT.toFixed(3) + '°C', tx + 18, ty + th - mercuryHeight + 4);

      // Labels
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Insulated Water Bath (1.0 kg)', vx + 10, vy + vh + 24);
      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('Falling masses turn paddle wheel → fluid friction converts work to heat', 170, 16);
    }

    function animateDrop() {
      if (isDropping) {
        if (dropProgress < 1.0) {
          dropProgress += 0.008;
          paddleAngle += 0.25;
          render();
          requestAnimationFrame(animateDrop);
        } else {
          dropProgress = 1.0;
          isDropping = false;
          render();
        }
      }
    }

    massSlider.addEventListener('input', function () {
      massVal.textContent = massSlider.value + ' kg';
      render();
    });

    heightSlider.addEventListener('input', function () {
      heightVal.textContent = heightSlider.value + ' m';
      render();
    });

    dropBtn.addEventListener('click', function () {
      if (!isDropping && dropProgress < 1.0) {
        isDropping = true;
        animateDrop();
      }
    });

    resetBtn.addEventListener('click', function () {
      isDropping = false;
      dropProgress = 0.0;
      paddleAngle = 0;
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 9.3: Boltzmann Entropy and Irreversible Expansion (S = k ln Ω)
  // =========================================================================
  FIG['fig-entropy-states'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Gas Molecules ($N$):</strong>' +
      '<input type="range" id="entropy-n" min="20" max="200" step="10" value="80" style="width:100px;">' +
      '<span id="entropy-n-val">80</span>' +
      '</label>' +
      '<button id="entropy-barrier-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-hot, #dc2626); color:#fff; cursor:pointer;">Remove Partition (Free Expansion)</button>' +
      '<button id="entropy-reset-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reset to Left Half</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 320;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var statsRow = document.createElement('div');
    statsRow.style.display = 'flex';
    statsRow.style.justifyContent = 'space-around';
    statsRow.style.fontSize = '0.88rem';
    statsRow.style.padding = '8px';
    statsRow.style.background = 'var(--color-bg, #fff)';
    statsRow.style.borderRadius = '4px';
    statsRow.style.border = '1px solid var(--color-border, #eee)';

    statsRow.innerHTML =
      '<div><strong>Left Chamber ($N_L$):</strong> <span id="n-left-disp" style="font-weight:bold; color:var(--color-primary, #2160c4);">80</span></div>' +
      '<div><strong>Right Chamber ($N_R$):</strong> <span id="n-right-disp" style="font-weight:bold; color:var(--color-accent, #d97706);">0</span></div>' +
      '<div><strong>Microstate Multiplicity ($\\Omega = \\frac{N!}{N_L! N_R!}$):</strong> <span id="omega-disp" style="font-weight:bold;">1</span></div>' +
      '<div><strong>Entropy ($S = k_B \\ln \\Omega$):</strong> <span id="entropy-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">0.00 $k_B$</span></div>';

    wrapper.appendChild(statsRow);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var nSlider = ctrlRow.querySelector('#entropy-n');
    var nVal = ctrlRow.querySelector('#entropy-n-val');
    var barrierBtn = ctrlRow.querySelector('#entropy-barrier-btn');
    var resetBtn = ctrlRow.querySelector('#entropy-reset-btn');

    var nLeftDisp = statsRow.querySelector('#n-left-disp');
    var nRightDisp = statsRow.querySelector('#n-right-disp');
    var omegaDisp = statsRow.querySelector('#omega-disp');
    var entropyDisp = statsRow.querySelector('#entropy-disp');

    var hasPartition = true;
    var particles = [];

    function initParticles(N, leftOnly) {
      particles = [];
      var boxLeft = 50, boxTop = 40, boxW = 620, boxH = 240;
      var maxW = leftOnly ? boxW / 2 - 8 : boxW - 8;

      for (var i = 0; i < N; i++) {
        particles.push({
          x: boxLeft + 10 + Math.random() * maxW,
          y: boxTop + 10 + Math.random() * (boxH - 20),
          vx: (Math.random() - 0.5) * 3.5,
          vy: (Math.random() - 0.5) * 3.5,
          radius: 3.5
        });
      }
    }

    function logFactorial(n) {
      if (n <= 1) return 0;
      var sum = 0;
      for (var i = 2; i <= n; i++) sum += Math.log(i);
      return sum;
    }

    function updatePhysics() {
      var boxLeft = 50, boxTop = 40, boxW = 620, boxH = 240;
      var midX = boxLeft + boxW / 2;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Top and bottom walls
        if (p.y - p.radius < boxTop) { p.y = boxTop + p.radius; p.vy *= -1; }
        if (p.y + p.radius > boxTop + boxH) { p.y = boxTop + boxH - p.radius; p.vy *= -1; }

        // Left and right outer walls
        if (p.x - p.radius < boxLeft) { p.x = boxLeft + p.radius; p.vx *= -1; }
        if (p.x + p.radius > boxLeft + boxW) { p.x = boxLeft + boxW - p.radius; p.vx *= -1; }

        // Middle partition collision
        if (hasPartition) {
          if (p.vx > 0 && p.x + p.radius >= midX && p.x - p.vx < midX) {
            p.x = midX - p.radius;
            p.vx *= -1;
          } else if (p.vx < 0 && p.x - p.radius <= midX && p.x - p.vx > midX) {
            p.x = midX + p.radius;
            p.vx *= -1;
          }
        }
      }
    }

    function render() {
      var colors = getThemeColors();
      var boxLeft = 50, boxTop = 40, boxW = 620, boxH = 240;
      var midX = boxLeft + boxW / 2;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Box boundary
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 3;
      ctx.strokeRect(boxLeft, boxTop, boxW, boxH);

      // Partition in the middle
      if (hasPartition) {
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(midX, boxTop);
        ctx.lineTo(midX, boxTop + boxH);
        ctx.stroke();

        ctx.fillStyle = colors.hot;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Removable Partition', midX - 55, boxTop - 5);
      } else {
        ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(midX, boxTop);
        ctx.lineTo(midX, boxTop + boxH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Count molecules in left and right
      var nL = 0, nR = 0;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.x < midX) {
          nL++;
          ctx.fillStyle = colors.primary;
        } else {
          nR++;
          ctx.fillStyle = colors.accent;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Statistical calculations
      var totalN = particles.length;
      nLeftDisp.textContent = nL;
      nRightDisp.textContent = nR;

      // log(Omega) = ln(N!) - ln(nL!) - ln(nR!)
      var lnOmega = logFactorial(totalN) - logFactorial(nL) - logFactorial(nR);
      var entropyVal = lnOmega; // in units of k_B

      if (lnOmega < 10) {
        omegaDisp.textContent = Math.round(Math.exp(lnOmega)).toLocaleString();
      } else {
        var exp10 = lnOmega / Math.LN10;
        var pwr = Math.floor(exp10);
        var mant = Math.pow(10, exp10 - pwr);
        omegaDisp.textContent = mant.toFixed(2) + ' × 10^' + pwr;
      }

      entropyDisp.textContent = entropyVal.toFixed(1) + ' k_B (ΔS = +' + (entropyVal).toFixed(1) + ')';

      // Chamber labels
      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Chamber Left (V/2)', boxLeft + 30, boxTop + boxH + 20);
      ctx.fillText('Chamber Right (V/2)', midX + 30, boxTop + boxH + 20);

      // Epistemic note at top
      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('Microstate distribution: free expansion spontaneously maximizes Ω; spontaneous reversal probability ≈ (1/2)^N ≈ 10^(-' + Math.round(totalN * 0.301) + ')', 60, 16);
    }

    function loop() {
      updatePhysics();
      render();
      requestAnimationFrame(loop);
    }

    initParticles(80, true);

    nSlider.addEventListener('input', function () {
      nVal.textContent = nSlider.value;
      initParticles(parseInt(nSlider.value, 10), hasPartition);
    });

    barrierBtn.addEventListener('click', function () {
      hasPartition = false;
      barrierBtn.style.opacity = '0.5';
      barrierBtn.disabled = true;
    });

    resetBtn.addEventListener('click', function () {
      hasPartition = true;
      barrierBtn.style.opacity = '1.0';
      barrierBtn.disabled = false;
      initParticles(parseInt(nSlider.value, 10), true);
    });

    loop();
  };

  // =========================================================================
  // Figure 9.4: Ørsted’s Compass Needle & Biot-Savart Magnetic Field
  // =========================================================================
  FIG['fig-oersted-compass'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Current in Wire ($I$):</strong>' +
      '<input type="range" id="oersted-current" min="-10" max="10" step="0.5" value="0" style="width:130px;">' +
      '<span id="oersted-current-val">0.0 A (Off)</span>' +
      '</label>' +
      '<button id="oersted-rev-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reverse Polarity</button>' +
      '<span style="color:var(--color-text-muted, #666); font-size:0.85rem;">Click/drag compasses to probe circular field</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var noteBox = document.createElement('div');
    noteBox.style.fontSize = '0.85rem';
    noteBox.style.color = 'var(--color-text-muted, #666)';
    noteBox.id = 'oersted-explanation';
    noteBox.innerHTML = '<strong>Ørsted’s Discovery (July 1820):</strong> When electric current flows through a conductor, it creates circular concentric magnetic field lines ($B = \\frac{\\mu_0 I}{2\\pi r}$) that deflect magnetic compass needles perpendicular to the wire.';
    wrapper.appendChild(noteBox);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var currentSlider = ctrlRow.querySelector('#oersted-current');
    var currentVal = ctrlRow.querySelector('#oersted-current-val');
    var revBtn = ctrlRow.querySelector('#oersted-rev-btn');

    // Compasses distributed around the central conducting wire
    var wireX = 360, wireY = 170;
    var compasses = [
      { x: 360, y: 70, r: 100 },
      { x: 460, y: 170, r: 100 },
      { x: 360, y: 270, r: 100 },
      { x: 260, y: 170, r: 100 },
      { x: 430, y: 100, r: 100 },
      { x: 430, y: 240, r: 100 },
      { x: 290, y: 240, r: 100 },
      { x: 290, y: 100, r: 100 }
    ];

    var draggingIdx = -1;

    function render() {
      var colors = getThemeColors();
      var I = parseFloat(currentSlider.value);

      if (I === 0) {
        currentVal.textContent = '0.0 A (Current Off)';
      } else {
        currentVal.textContent = (I > 0 ? '+' : '') + I.toFixed(1) + ' A (' + (I > 0 ? 'Out of screen ⊙' : 'Into screen ⊗') + ')';
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw concentric circular magnetic field lines if current is non-zero
      if (Math.abs(I) > 0.1) {
        var radii = [50, 100, 150, 200];
        ctx.lineWidth = 1;
        radii.forEach(function (r) {
          ctx.strokeStyle = isDark() ? 'rgba(106, 176, 248, 0.25)' : 'rgba(33, 96, 196, 0.2)';
          ctx.beginPath();
          ctx.arc(wireX, wireY, r, 0, Math.PI * 2);
          ctx.stroke();

          // Field line direction arrows
          var arrowAng = I > 0 ? -Math.PI / 2 : Math.PI / 2;
          var ax = wireX + Math.cos(arrowAng) * r;
          var ay = wireY + Math.sin(arrowAng) * r;
          ctx.fillStyle = colors.primary;
          ctx.beginPath();
          var dir = I > 0 ? 1 : -1;
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - 6 * dir, ay - 4);
          ctx.lineTo(ax - 6 * dir, ay + 4);
          ctx.fill();
        });
      }

      // Draw central vertical conducting wire cross-section
      ctx.beginPath();
      ctx.arc(wireX, wireY, 16, 0, Math.PI * 2);
      ctx.fillStyle = isDark() ? '#b45309' : '#d97706';
      ctx.fill();
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Current symbol: ⊙ (dot = out of page) or ⊗ (cross = into page)
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      if (I > 0.2) {
        ctx.beginPath();
        ctx.arc(wireX, wireY, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (I < -0.2) {
        ctx.beginPath();
        ctx.moveTo(wireX - 6, wireY - 6); ctx.lineTo(wireX + 6, wireY + 6);
        ctx.moveTo(wireX + 6, wireY - 6); ctx.lineTo(wireX - 6, wireY + 6);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Ambient Earth's magnetic field points UP (Geographic North = 90 deg up)
      var BEarth = 2.0; // arbitrary units

      // Draw all compass needles
      compasses.forEach(function (cmp) {
        var dx = cmp.x - wireX;
        var dy = cmp.y - wireY;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r < 20) r = 20;

        // Circular wire field components: B_wire is perpendicular to (dx, dy)
        // Tangent unit vector: (-dy/r, dx/r) for counterclockwise (I > 0)
        var BwireMag = (I * 80.0) / r;
        var Bx_wire = - (dy / r) * BwireMag;
        var By_wire = (dx / r) * BwireMag;

        // Total field = Wire field + Earth field (pointing upwards: By_total = By_wire - BEarth)
        var totalBx = Bx_wire;
        var totalBy = By_wire - BEarth;

        var needleAngle = Math.atan2(totalBy, totalBx);

        // Compass casing
        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cmp.x, cmp.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Compass needle
        var nLen = 14;
        var nx = Math.cos(needleAngle) * nLen;
        var ny = Math.sin(needleAngle) * nLen;

        // North pole (Red)
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.moveTo(cmp.x, cmp.y);
        ctx.lineTo(cmp.x + nx, cmp.y + ny);
        ctx.lineTo(cmp.x - ny * 0.3, cmp.y + nx * 0.3);
        ctx.fill();

        // South pole (Blue / Muted)
        ctx.fillStyle = colors.cold;
        ctx.beginPath();
        ctx.moveTo(cmp.x, cmp.y);
        ctx.lineTo(cmp.x - nx, cmp.y - ny);
        ctx.lineTo(cmp.x + ny * 0.3, cmp.y - nx * 0.3);
        ctx.fill();

        // Center pivot
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(cmp.x, cmp.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Earth's North indicator on side
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 100);
      ctx.lineTo(60, 40);
      ctx.stroke();
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.moveTo(60, 32);
      ctx.lineTo(54, 44);
      ctx.lineTo(66, 44);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Earth North', 32, 118);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('(Ambient B_ext)', 28, 132);

      // Central wire label
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Conducting Wire', wireX - 45, wireY + 36);
    }

    currentSlider.addEventListener('input', render);

    revBtn.addEventListener('click', function () {
      var val = -parseFloat(currentSlider.value);
      if (val === 0) val = 5.0;
      currentSlider.value = val;
      render();
    });

    // Drag compasses
    function getMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('mousedown', function (evt) {
      var pos = getMousePos(evt);
      compasses.forEach(function (cmp, idx) {
        var dx = cmp.x - pos.x;
        var dy = cmp.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 25) {
          draggingIdx = idx;
        }
      });
    });

    canvas.addEventListener('touchstart', function (evt) {
      if (evt.touches && evt.touches.length === 1) {
        var pos = getMousePos(evt);
        compasses.forEach(function (cmp, idx) {
          var dx = cmp.x - pos.x;
          var dy = cmp.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < 25) {
            draggingIdx = idx;
            evt.preventDefault();
          }
        });
      }
    }, { passive: false });

    window.addEventListener('mousemove', function (evt) {
      if (draggingIdx >= 0) {
        var pos = getMousePos(evt);
        compasses[draggingIdx].x = Math.max(30, Math.min(canvas.width - 30, pos.x));
        compasses[draggingIdx].y = Math.max(30, Math.min(canvas.height - 30, pos.y));
        render();
      }
    });

    window.addEventListener('touchmove', function (evt) {
      if (draggingIdx >= 0 && evt.touches && evt.touches.length === 1) {
        evt.preventDefault();
        var pos = getMousePos(evt);
        compasses[draggingIdx].x = Math.max(30, Math.min(canvas.width - 30, pos.x));
        compasses[draggingIdx].y = Math.max(30, Math.min(canvas.height - 30, pos.y));
        render();
      }
    }, { passive: false });

    window.addEventListener('mouseup', function () {
      draggingIdx = -1;
    });

    window.addEventListener('touchend', function () {
      draggingIdx = -1;
    });

    render();
  };

  // =========================================================================
  // Figure 9.5: Faraday's Electromagnetic Induction & Lenz's Law
  // =========================================================================
  FIG['fig-faraday-induction'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Coil Turns ($N$):</strong>' +
      '<input type="range" id="faraday-turns" min="2" max="10" step="1" value="6" style="width:90px;">' +
      '<span id="faraday-turns-val">6 turns</span>' +
      '</label>' +
      '<button id="faraday-flip-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Flip Magnet Poles</button>' +
      '<button id="faraday-thrust-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Thrust Magnet Through Coil</button>' +
      '<span style="color:var(--color-text-muted, #666); font-size:0.85rem;">Or drag magnet with mouse</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var meterRow = document.createElement('div');
    meterRow.style.display = 'flex';
    meterRow.style.justifyContent = 'space-around';
    meterRow.style.fontSize = '0.88rem';
    meterRow.style.padding = '8px';
    meterRow.style.background = 'var(--color-bg, #fff)';
    meterRow.style.borderRadius = '4px';
    meterRow.style.border = '1px solid var(--color-border, #eee)';

    meterRow.innerHTML =
      '<div><strong>Magnetic Flux ($\\Phi_B$):</strong> <span id="flux-disp" style="font-weight:bold;">0.00 Wb</span></div>' +
      '<div><strong>Flux Rate of Change ($-\\frac{d\\Phi_B}{dt}$):</strong> <span id="dflux-disp" style="font-weight:bold; color:var(--color-accent, #d97706);">0.00 Wb/s</span></div>' +
      '<div><strong>Induced Electromotive Force ($\\mathcal{E}$):</strong> <span id="emf-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">0.00 V</span></div>';

    wrapper.appendChild(meterRow);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var turnsSlider = ctrlRow.querySelector('#faraday-turns');
    var turnsVal = ctrlRow.querySelector('#faraday-turns-val');
    var flipBtn = ctrlRow.querySelector('#faraday-flip-btn');
    var thrustBtn = ctrlRow.querySelector('#faraday-thrust-btn');

    var fluxDisp = meterRow.querySelector('#flux-disp');
    var dfluxDisp = meterRow.querySelector('#dflux-disp');
    var emfDisp = meterRow.querySelector('#emf-disp');

    var magnetX = 140, magnetY = 170;
    var magnetNorthOnRight = true;
    var isDraggingMagnet = false;
    var lastMagnetX = 140;
    var magnetVelocity = 0;
    var coilX = 400, coilY = 170, coilR = 60;
    var galvanometerAngle = 0;

    function render() {
      var colors = getThemeColors();
      var N = parseInt(turnsSlider.value, 10);
      turnsVal.textContent = N + ' turns';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Coil position and turns
      var coilWidth = 120;
      var turnSpacing = coilWidth / (N + 1);

      // Calculate magnetic flux through coil:
      // Distance from magnet pole to coil center:
      var poleX = magnetNorthOnRight ? magnetX + 50 : magnetX - 50;
      var dist = poleX - coilX;
      var poleSign = magnetNorthOnRight ? 1 : -1;
      // Approximate dipole flux through coil: Phi = poleSign * 100 / (1 + (dist/60)^2)
      var flux = poleSign * (120.0 / (1.0 + Math.pow(dist / 55.0, 2)));

      // Induced EMF = -N * (dPhi/dt)
      // dPhi/dt = (dPhi/dx) * (dx/dt)
      var dPhi_dx = -poleSign * 120.0 * (2 * dist / 3025.0) / Math.pow(1.0 + Math.pow(dist / 55.0, 2), 2);
      var dPhi_dt = dPhi_dx * magnetVelocity;
      var emf = -N * dPhi_dt * 0.15; // in Volts

      fluxDisp.textContent = flux.toFixed(2) + ' Wb';
      dfluxDisp.textContent = (-dPhi_dt).toFixed(2) + ' Wb/s';
      emfDisp.textContent = (emf >= 0 ? '+' : '') + emf.toFixed(2) + ' V';

      // Galvanometer deflection
      galvanometerAngle = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, -emf * 0.35));

      // 1. Draw connecting circuit wires to galvanometer
      var meterX = 580, meterY = 80;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;

      // Top wire from coil to meter
      ctx.beginPath();
      ctx.moveTo(coilX - coilWidth / 2, coilY - coilR);
      ctx.lineTo(coilX - coilWidth / 2, 80);
      ctx.lineTo(meterX - 30, 80);
      ctx.stroke();

      // Bottom wire from coil to meter
      ctx.beginPath();
      ctx.moveTo(coilX + coilWidth / 2, coilY + coilR);
      ctx.lineTo(meterX, coilY + coilR);
      ctx.lineTo(meterX, meterY + 40);
      ctx.stroke();

      // Current flow indicator arrows on wire when EMF is active
      if (Math.abs(emf) > 0.05) {
        var currentDir = emf > 0 ? 1 : -1;
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        var arrowX = coilX + 30;
        ctx.moveTo(arrowX, 80);
        ctx.lineTo(arrowX - 8 * currentDir, 75);
        ctx.lineTo(arrowX - 8 * currentDir, 85);
        ctx.fill();
        ctx.font = '10px sans-serif';
        ctx.fillText('Induced Current I', arrowX - 35, 70);
      }

      // 2. Galvanometer Instrument
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(meterX, meterY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Scale arc
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(meterX, meterY + 15, 30, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      // Needle
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meterX, meterY + 15);
      ctx.lineTo(meterX + Math.sin(galvanometerAngle) * 32, meterY + 15 - Math.cos(galvanometerAngle) * 32);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('Galvanometer', meterX - 32, meterY - 42);

      // 3. Draw Cylindrical Wire Coil Turns
      ctx.strokeStyle = isDark() ? '#f59e0b' : '#b45309';
      ctx.lineWidth = 4;
      for (var t = 0; t < N; t++) {
        var tx = coilX - coilWidth / 2 + (t + 1) * turnSpacing;
        ctx.beginPath();
        ctx.ellipse(tx, coilY, 14, coilR, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Moving Bar Magnet
      var mw = 110, mh = 36;
      var mx = magnetX - mw / 2, my = magnetY - mh / 2;

      // North half
      ctx.fillStyle = magnetNorthOnRight ? colors.hot : colors.cold;
      ctx.fillRect(mx + (magnetNorthOnRight ? mw / 2 : 0), my, mw / 2, mh);
      // South half
      ctx.fillStyle = magnetNorthOnRight ? colors.cold : colors.hot;
      ctx.fillRect(mx + (magnetNorthOnRight ? 0 : mw / 2), my, mw / 2, mh);

      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mw, mh);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(magnetNorthOnRight ? 'S' : 'N', mx + 16, my + 23);
      ctx.fillText(magnetNorthOnRight ? 'N' : 'S', mx + mw - 28, my + 23);

      // Magnetic field flux lines exiting poles
      ctx.strokeStyle = isDark() ? 'rgba(96, 165, 250, 0.35)' : 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 1.2;
      [-18, 0, 18].forEach(function (offY) {
        ctx.beginPath();
        ctx.moveTo(mx + mw, my + mh / 2 + offY);
        ctx.bezierCurveTo(mx + mw + 80, my + mh / 2 + offY * 2.5, coilX + 40, coilY + offY * 3, coilX + coilWidth / 2 + 50, coilY + offY * 3.5);
        ctx.stroke();
      });

      // Bottom guidance
      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('Faraday’s Law of Induction: E = -N (dΦ_B / dt). Lenz’s Law: induced current opposes magnetic motion.', 80, 325);
    }

    flipBtn.addEventListener('click', function () {
      magnetNorthOnRight = !magnetNorthOnRight;
      render();
    });

    turnsSlider.addEventListener('input', render);

    var thrustAnimId = null;
    thrustBtn.addEventListener('click', function () {
      if (thrustAnimId) cancelAnimationFrame(thrustAnimId);
      var startX = 120, targetX = 400, returnX = 120;
      var phase = 0; // 0 = forward, 1 = backward
      var speed = 8;

      function animThrust() {
        if (phase === 0) {
          magnetX += speed;
          magnetVelocity = speed;
          if (magnetX >= targetX) {
            phase = 1;
          }
        } else if (phase === 1) {
          magnetX -= speed;
          magnetVelocity = -speed;
          if (magnetX <= returnX) {
            magnetX = returnX;
            magnetVelocity = 0;
            render();
            return;
          }
        }
        render();
        thrustAnimId = requestAnimationFrame(animThrust);
      }
      animThrust();
    });

    // Mouse drag magnet
    function getMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('mousedown', function (evt) {
      var pos = getMousePos(evt);
      if (Math.abs(pos.x - magnetX) < 65 && Math.abs(pos.y - magnetY) < 30) {
        isDraggingMagnet = true;
        lastMagnetX = pos.x;
      }
    });

    canvas.addEventListener('touchstart', function (evt) {
      if (evt.touches && evt.touches.length === 1) {
        var pos = getMousePos(evt);
        if (Math.abs(pos.x - magnetX) < 65 && Math.abs(pos.y - magnetY) < 30) {
          isDraggingMagnet = true;
          lastMagnetX = pos.x;
          evt.preventDefault();
        }
      }
    }, { passive: false });

    window.addEventListener('mousemove', function (evt) {
      if (isDraggingMagnet) {
        var pos = getMousePos(evt);
        magnetVelocity = pos.x - lastMagnetX;
        lastMagnetX = pos.x;
        magnetX = Math.max(80, Math.min(500, pos.x));
        render();
      }
    });

    window.addEventListener('touchmove', function (evt) {
      if (isDraggingMagnet && evt.touches && evt.touches.length === 1) {
        evt.preventDefault();
        var pos = getMousePos(evt);
        magnetVelocity = pos.x - lastMagnetX;
        lastMagnetX = pos.x;
        magnetX = Math.max(80, Math.min(500, pos.x));
        render();
      }
    }, { passive: false });

    window.addEventListener('mouseup', function () {
      if (isDraggingMagnet) {
        isDraggingMagnet = false;
        magnetVelocity = 0;
        render();
      }
    });

    window.addEventListener('touchend', function () {
      if (isDraggingMagnet) {
        isDraggingMagnet = false;
        magnetVelocity = 0;
        render();
      }
    });

    render();
  };

  // =========================================================================
  // Figure 9.6: Maxwell's Transverse Electromagnetic Wave (3D Projection)
  // =========================================================================
  FIG['fig-maxwell-wave'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Frequency ($f$):</strong>' +
      '<input type="range" id="em-freq" min="0.5" max="2.5" step="0.1" value="1.0" style="width:100px;">' +
      '<span id="em-freq-val">1.0×</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Polarization:</strong>' +
      '<select id="em-polar" style="padding:3px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="linear-vertical">Linear Vertical</option>' +
      '<option value="circular">Circular</option>' +
      '</select>' +
      '</label>' +
      '<button id="em-play-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Pause</button>' +
      '<span style="font-weight:bold; color:var(--color-primary, #2160c4);">c = 1 / √(ε₀ μ₀)</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.gap = '24px';
    legend.style.justifyContent = 'center';
    legend.style.fontSize = '0.85rem';
    legend.innerHTML =
      '<div><span style="display:inline-block; width:12px; height:12px; background:var(--color-hot, #dc2626); margin-right:4px;"></span> <strong>Electric Field $\\vec{E}$</strong> (Vertical $y$-axis)</div>' +
      '<div><span style="display:inline-block; width:12px; height:12px; background:var(--color-cold, #2563eb); margin-right:4px;"></span> <strong>Magnetic Field $\\vec{B}$</strong> (Transverse $z$-axis)</div>' +
      '<div><span style="display:inline-block; width:12px; height:12px; background:var(--color-accent, #d97706); margin-right:4px;"></span> <strong>Propagation Velocity $\\vec{c}$</strong> (Along $x$-axis)</div>';
    wrapper.appendChild(legend);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var freqSlider = ctrlRow.querySelector('#em-freq');
    var freqVal = ctrlRow.querySelector('#em-freq-val');
    var polarSelect = ctrlRow.querySelector('#em-polar');
    var playBtn = ctrlRow.querySelector('#em-play-btn');

    var isRunning = true;
    var timePhase = 0;

    // 3D Isometric projection parameters
    var originX = 80, originY = 170;
    var axisLength = 580;
    var zAngle = Math.PI / 6; // 30 degrees for depth axis
    var zScale = 0.65;

    function project3D(x, y, z) {
      // x is along propagation line
      // y is vertical (up/down)
      // z is depth (out of page / into page)
      var px = originX + x + z * Math.cos(zAngle) * zScale;
      var py = originY - y + z * Math.sin(zAngle) * zScale;
      return { x: px, y: py };
    }

    function render() {
      var colors = getThemeColors();
      var f = parseFloat(freqSlider.value);
      var mode = polarSelect.value;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Main Axes:
      // X-axis (propagation line)
      var xEnd = project3D(axisLength, 0, 0);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX - 30, originY);
      ctx.lineTo(xEnd.x + 20, xEnd.y);
      ctx.stroke();

      // X-axis arrow
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(xEnd.x + 28, xEnd.y);
      ctx.lineTo(xEnd.x + 16, xEnd.y - 5);
      ctx.lineTo(xEnd.x + 16, xEnd.y + 5);
      ctx.fill();
      ctx.fillText('Direction of wave (c)', xEnd.x - 110, xEnd.y + 62);

      // Y-axis (E field axis)
      var yTop = project3D(0, 110, 0);
      var yBot = project3D(0, -110, 0);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(yBot.x, yBot.y);
      ctx.lineTo(yTop.x, yTop.y);
      ctx.stroke();
      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('+E', yTop.x - 22, yTop.y + 6);

      // Z-axis (B field axis)
      var zFront = project3D(0, 0, 110);
      var zBack = project3D(0, 0, -110);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(zBack.x, zBack.y);
      ctx.lineTo(zFront.x, zFront.y);
      ctx.stroke();
      ctx.fillStyle = colors.cold;
      ctx.fillText('+B', zFront.x + 8, zFront.y + 6);

      // Sample along x
      var wavelength = 240 / f;
      var k = (2 * Math.PI) / wavelength;
      var numPoints = 140;
      var dx = axisLength / numPoints;

      var ePoints = [];
      var bPoints = [];

      for (var i = 0; i <= numPoints; i++) {
        var x = i * dx;
        var phase = k * x - timePhase;

        var eAmp, bAmp;
        if (mode === 'linear-vertical') {
          eAmp = Math.sin(phase) * 80;
          bAmp = Math.sin(phase) * 80; // in phase for EM wave!
          ePoints.push(project3D(x, eAmp, 0));
          bPoints.push(project3D(x, 0, bAmp));
        } else { // circular
          eAmp = Math.cos(phase) * 65;
          bAmp = Math.sin(phase) * 65;
          ePoints.push(project3D(x, eAmp, 0));
          bPoints.push(project3D(x, 0, bAmp));
        }

        // Draw field vector arrows every 7 points
        if (i % 7 === 0 && i > 0) {
          var pBase = project3D(x, 0, 0);

          // E vector (Red)
          var pE = ePoints[i];
          ctx.strokeStyle = colors.hot;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(pBase.x, pBase.y);
          ctx.lineTo(pE.x, pE.y);
          ctx.stroke();

          // E arrow tip
          ctx.fillStyle = colors.hot;
          ctx.beginPath();
          ctx.arc(pE.x, pE.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // B vector (Blue)
          var pB = bPoints[i];
          ctx.strokeStyle = colors.cold;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(pBase.x, pBase.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();

          // B arrow tip
          ctx.fillStyle = colors.cold;
          ctx.beginPath();
          ctx.arc(pB.x, pB.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw continuous wave envelopes
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var j = 0; j < ePoints.length; j++) {
        if (j === 0) ctx.moveTo(ePoints[j].x, ePoints[j].y);
        else ctx.lineTo(ePoints[j].x, ePoints[j].y);
      }
      ctx.stroke();

      ctx.strokeStyle = colors.cold;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var k_idx = 0; k_idx < bPoints.length; k_idx++) {
        if (k_idx === 0) ctx.moveTo(bPoints[k_idx].x, bPoints[k_idx].y);
        else ctx.lineTo(bPoints[k_idx].x, bPoints[k_idx].y);
      }
      ctx.stroke();

      // Maxwell speed of light banner at top
      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Maxwell’s Wave Equation: ∇²E = μ₀ε₀ (∂²E/∂t²), with c = 1/√(ε₀μ₀) = 2.998 × 10⁸ m/s', 80, 30);
    }

    function anim() {
      if (isRunning) {
        timePhase += 0.08 * parseFloat(freqSlider.value);
        render();
      }
      requestAnimationFrame(anim);
    }

    freqSlider.addEventListener('input', function () {
      freqVal.textContent = freqSlider.value + '×';
      render();
    });

    polarSelect.addEventListener('change', render);

    playBtn.addEventListener('click', function () {
      isRunning = !isRunning;
      playBtn.textContent = isRunning ? 'Pause' : 'Play';
    });

    render();
    anim();
  };

  // =========================================================================
  // Figure 9.7: Heinrich Hertz's Spark Transmitter and Resonant Ring Receiver
  // =========================================================================
  FIG['fig-hertz-dipole'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var ctrlRow = document.createElement('div');
    ctrlRow.style.display = 'flex';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.gap = '16px';
    ctrlRow.style.alignItems = 'center';
    ctrlRow.style.fontSize = '0.9rem';

    ctrlRow.innerHTML =
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Receiver Distance ($d$):</strong>' +
      '<input type="range" id="hertz-dist" min="200" max="440" step="10" value="320" style="width:110px;">' +
      '<span id="hertz-dist-val">3.2 m</span>' +
      '</label>' +
      '<button id="hertz-spark-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-hot, #dc2626); color:#fff; cursor:pointer; font-weight:bold;">Trigger Ruhmkorff Spark</button>' +
      '<span id="hertz-status" style="font-weight:bold; color:var(--color-success, #16a34a);">Status: Ready for Discharge</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var expl = document.createElement('div');
    expl.style.fontSize = '0.85rem';
    expl.style.color = 'var(--color-text-muted, #666)';
    expl.innerHTML = '<strong>Hertz’s Experiment (1887):</strong> An oscillating high-voltage spark across a dipole antenna generates electromagnetic radiation in the radio frequency range (~50 MHz). Meters away, without any connecting wires, the incoming waves induce a miniature microscopic spark across the gap of a tuned copper resonance ring.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var distSlider = ctrlRow.querySelector('#hertz-dist');
    var distVal = ctrlRow.querySelector('#hertz-dist-val');
    var sparkBtn = ctrlRow.querySelector('#hertz-spark-btn');
    var statusDisp = ctrlRow.querySelector('#hertz-status');

    var isSparking = false;
    var sparkTimer = 0;
    var waveRipples = [];

    function triggerSpark() {
      if (isSparking) return;
      isSparking = true;
      sparkTimer = 35; // frames of spark duration
      waveRipples = [0, -25, -50, -75];
      statusDisp.textContent = 'Oscillating Spark Generating Radio Waves!';
      statusDisp.style.color = 'var(--color-hot, #dc2626)';
    }

    function render() {
      var colors = getThemeColors();
      var distPx = parseFloat(distSlider.value);
      distVal.textContent = (distPx / 100.0).toFixed(1) + ' m';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left: Primary Spark-Gap Transmitter (Dipole Antenna & Ruhmkorff Coil) ---
      var txX = 140, txY = 170;

      // Ruhmkorff induction coil box
      ctx.fillStyle = isDark() ? '#374151' : '#e5e7eb';
      ctx.fillRect(txX - 90, txY + 80, 80, 60);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(txX - 90, txY + 80, 80, 60);
      ctx.fillStyle = colors.text;
      ctx.font = '10px sans-serif';
      ctx.fillText('Ruhmkorff Coil', txX - 86, txY + 115);

      // High-voltage lead wires from coil to spark balls
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(txX - 50, txY + 80);
      ctx.lineTo(txX - 50, txY + 30);
      ctx.lineTo(txX - 10, txY + 8);
      ctx.moveTo(txX - 30, txY + 80);
      ctx.lineTo(txX - 30, txY - 30);
      ctx.lineTo(txX - 10, txY - 8);
      ctx.stroke();

      // Dipole antenna rods (vertical zinc brass spheres on poles)
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 4;
      // Top rod
      ctx.beginPath();
      ctx.moveTo(txX, txY - 8);
      ctx.lineTo(txX, txY - 90);
      ctx.stroke();
      // Bottom rod
      ctx.beginPath();
      ctx.moveTo(txX, txY + 8);
      ctx.lineTo(txX, txY + 90);
      ctx.stroke();

      // Zinc capacitive capacity spheres at dipole ends
      ctx.fillStyle = isDark() ? '#9ca3af' : '#6b7280';
      ctx.beginPath();
      ctx.arc(txX, txY - 95, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(txX, txY + 95, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Central polished brass spark knobs
      ctx.fillStyle = colors.gold;
      ctx.beginPath();
      ctx.arc(txX, txY - 7, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(txX, txY + 7, 6, 0, Math.PI * 2);
      ctx.fill();

      // --- Right: Resonant Wire Loop Receiver ---
      var rxX = txX + distPx;
      var rxY = txY;
      var rxRadius = 55;

      // Circular copper wire loop
      ctx.strokeStyle = isDark() ? '#fb923c' : '#ea580c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      // Leave a tiny gap on left side of loop (facing transmitter)
      ctx.arc(rxX, rxY, rxRadius, 0.12 * Math.PI, 1.88 * Math.PI, false);
      ctx.stroke();

      // Microscopic spark gap micrometer knobs on receiver
      var gapY1 = rxY - Math.sin(0.12 * Math.PI) * rxRadius;
      var gapY2 = rxY + Math.sin(0.12 * Math.PI) * rxRadius;
      var gapX = rxX + Math.cos(0.12 * Math.PI) * rxRadius;

      ctx.fillStyle = colors.gold;
      ctx.beginPath();
      ctx.arc(gapX, gapY1, 4, 0, Math.PI * 2);
      ctx.arc(gapX, gapY2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spark Animation
      if (isSparking) {
        // 1. Primary vigorous violet-white spark at transmitter gap
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(txX, txY - 6);
        for (var s = 0; s < 4; s++) {
          ctx.lineTo(txX + (Math.random() - 0.5) * 8, txY - 4 + s * 2.5);
        }
        ctx.lineTo(txX, txY + 6);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radiating electromagnetic wave ripples
        for (var w = 0; w < waveRipples.length; w++) {
          var r = waveRipples[w];
          if (r > 0) {
            var alpha = Math.max(0, 1 - r / (distPx + 60));
            ctx.strokeStyle = isDark()
              ? 'rgba(106, 176, 248, ' + (alpha * 0.7) + ')'
              : 'rgba(33, 96, 196, ' + (alpha * 0.6) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Radiating dipole wavefront
            ctx.arc(txX, txY, r, -Math.PI / 3, Math.PI / 3, false);
            ctx.stroke();
          }
        }

        // Secondary subtle spark at receiver gap when wavefront hits
        var latestWave = waveRipples[0];
        if (latestWave >= distPx - 30) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(gapX, gapY1);
          ctx.lineTo(gapX + (Math.random() - 0.5) * 4, (gapY1 + gapY2) / 2);
          ctx.lineTo(gapX, gapY2);
          ctx.stroke();

          // Spark glow flash
          ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
          ctx.beginPath();
          ctx.arc(gapX, (gapY1 + gapY2) / 2, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Transmitter Dipole (50 MHz)', txX - 70, txY - 115);
      ctx.fillText('Tuned Resonant Loop Detector', rxX - 85, rxY - 70);

      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('Wave propagates across free space at velocity c = 3 × 10⁸ m/s without any connecting wires', 120, 325);
    }

    function tick() {
      if (isSparking) {
        sparkTimer--;
        for (var w = 0; w < waveRipples.length; w++) {
          waveRipples[w] += 12;
        }
        if (sparkTimer <= 0) {
          isSparking = false;
          statusDisp.textContent = 'Status: Discharge Finished';
          statusDisp.style.color = 'var(--color-success, #16a34a)';
        }
      }
      render();
      requestAnimationFrame(tick);
    }

    sparkBtn.addEventListener('click', triggerSpark);
    distSlider.addEventListener('input', render);

    render();
    tick();
  };

  // =========================================================================
  // Figure 9.8: Interactive Diagnostic Evaluation Quiz (Part 9)
  // =========================================================================
  FIG['fig-quiz-part9'] = function (container) {
    container.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';
    wrapper.style.padding = '16px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.border = '1px solid var(--color-border, #ddd)';
    wrapper.style.backgroundColor = 'var(--color-card-bg, #faf9f6)';

    var questions = [
      {
        q: '1. What fundamental physical insight did Count Rumford deduce from his observations of boring brass cannons in Munich (1798)?',
        options: [
          'Heat is an imponderable material fluid called caloric that is squeezed out of metal pores.',
          'Heat cannot be a conserved material substance because a dull borer generates an inexhaustible quantity of heat through continuous mechanical friction.',
          'Heat travels faster through dense brass than through water.',
          'Mechanical work can only generate heat if chemical combustion occurs simultaneously.'
        ],
        answer: 1,
        expl: 'Rumford observed that as long as horses kept turning the dull borer inside the brass cylinder, heat was produced indefinitely without any loss of metal mass. An inexhaustible quantity could not be a material fluid residing inside the metal; heat had to be a mode of mechanical motion.'
      },
      {
        q: '2. Sadi Carnot’s 1824 treatise established that the maximum theoretical efficiency of any heat engine operating between hot ($T_H$) and cold ($T_C$) reservoirs depends strictly on:',
        options: [
          'The absolute temperatures of the two thermal reservoirs: $\\eta = 1 - T_C / T_H$.',
          'The chemical composition of the working substance (steam vs. alcohol vs. air).',
          'The pressure difference inside the piston cylinders.',
          'The mechanical friction of the engine crankshaft.'
        ],
        answer: 0,
        expl: 'Carnot proved that the maximum thermodynamic efficiency of a reversible cycle is independent of the working substance and depends solely on the temperature drop between the heat source and sink: $\\eta = 1 - T_C / T_H$.'
      },
      {
        q: '3. What did James Prescott Joule’s meticulous paddle-wheel calorimeter experiments (1840s) definitively measure?',
        options: [
          'The speed of sound in liquid water.',
          'The exact quantitative conversion factor (mechanical equivalent) between mechanical work and thermal energy ($J \\approx 4.18\\text{ J/cal}$).',
          'The electrical conductivity of copper wire coils.',
          'The chemical enthalpy of combustion of coal.'
        ],
        answer: 1,
        expl: 'Joule measured the mechanical work performed by calibrated falling weights driving rotating brass paddles in water and recorded the exact minute temperature rise of the water, establishing the First Law of Thermodynamics and the constant $J \\approx 4.184\\text{ Joules per calorie}$.'
      },
      {
        q: '4. Rudolf Clausius formulated the Second Law of Thermodynamics and introduced the state function Entropy ($S$). For an isolated system undergoing any spontaneous process:',
        options: [
          'Entropy can never decrease: $\\Delta S \\ge 0$, reaching its maximum at thermodynamic equilibrium.',
          'Entropy is always conserved: $\\Delta S = 0$.',
          'Entropy continuously decreases toward zero: $\\Delta S < 0$.',
          'Entropy oscillates sinusoidally with temperature.'
        ],
        answer: 0,
        expl: 'Clausius famously summarized the laws of the universe: "The energy of the universe is constant; the entropy of the universe tends to a maximum." In any isolated system, entropy never decreases ($dS \\ge 0$).'
      },
      {
        q: '5. What was Alessandro Volta’s crucial counter-argument to Luigi Galvani’s claim of "animal electricity" in twitching frog legs?',
        options: [
          'Frogs have no nerves and cannot conduct electric fluids.',
          'Electric shocks in animals are strictly caused by static atmospheric electricity.',
          'The electrical current was generated not by the animal tissue, but by the contact between two dissimilar metals (copper and zinc) separated by a moist electrolyte.',
          'Frog legs twitch only when exposed to strong magnetic lodestones.'
        ],
        answer: 2,
        expl: 'Volta realized that the frog’s leg served merely as an exquisitely sensitive biological galvanometer. The true source of the continuous electric potential was the bimetallic contact of zinc and copper immersed in a moist conductor, leading directly to the invention of the Voltaic pile (1800).'
      },
      {
        q: '6. Hans Christian Ørsted’s 1820 experiment was revolutionary because it demonstrated for the first time that:',
        options: [
          'Magnets can conduct electric currents without wires.',
          'Electric current generates a circular magnetic field that deflects compass needles perpendicular to the wire.',
          'Light travels in transverse electromagnetic waves.',
          'Iron loses its magnetism when heated past its Curie point.'
        ],
        answer: 1,
        expl: 'Before Ørsted, electricity and magnetism were considered entirely distinct forces. By demonstrating that a steady direct current deflecting a compass needle placed parallel to a wire, Ørsted unveiled the electromagnetic connection.'
      },
      {
        q: '7. According to Michael Faraday’s Law of Electromagnetic Induction, what produces an induced electromotive force (voltage) in a closed conducting loop?',
        options: [
          'A stationary, unchanging magnetic field of high intensity.',
          'The absolute electrostatic charge on the surrounding air.',
          'Heating the copper wire above room temperature.',
          'A time-varying magnetic flux passing through the loop: $\\mathcal{E} = -d\\Phi_B / dt$.'
        ],
        answer: 3,
        expl: 'Faraday discovered in 1831 that an electromotive force is induced only when the magnetic flux passing through the circuit changes over time ($\\mathcal{E} = -d\\Phi_B / dt$), laying the foundation for all modern electric dynamos, motors, and transformers.'
      },
      {
        q: '8. What crucial mathematical term did James Clerk Maxwell add to Ampère’s Law to ensure conservation of electric charge in time-varying fields?',
        options: [
          'The Lorentz force term ($q\\vec{v} \\times \\vec{B}$).',
          'The gravitational constant ($G$).',
          'The quantum Planck constant ($h$).',
          'The displacement current density ($J_D = \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$).'
        ],
        answer: 3,
        expl: 'Maxwell introduced the displacement current $\\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$ to Ampère’s circuital law. This term completed the symmetry of the field equations, predicting that changing electric fields generate magnetic fields, and enabling propagating wave solutions in free space.'
      },
      {
        q: '9. When Maxwell calculated the theoretical propagation velocity of electromagnetic waves from purely electrostatic and magnetostatic laboratory constants ($c = 1 / \\sqrt{\\epsilon_0 \\mu_0}$), what did he discover?',
        options: [
          'The velocity was infinite, proving instantaneous action-at-a-distance.',
          'The velocity matched the speed of sound in air ($340\\text{ m/s}$).',
          'The velocity was approximately $310,740\\text{ km/s}$, matching the independently measured speed of light, proving light is an electromagnetic wave.',
          'The velocity was zero, indicating standing waves only.'
        ],
        answer: 2,
        expl: 'Maxwell noted: "We can scarcely avoid the inference that light consists in the transverse undulations of the same medium which is the cause of electric and magnetic phenomena." The calculated velocity $1/\\sqrt{\\epsilon_0 \\mu_0}$ matched the speed of light measured by Fizeau and Foucault.'
      },
      {
        q: '10. Ludwig Boltzmann’s famous formula $S = k_B \\ln \\Omega$ provided a revolutionary statistical interpretation of entropy by connecting it to:',
        options: [
          'The number of microscopic configurations (microstates $\\Omega$) compatible with a given macroscopic thermodynamic state.',
          'The macroscopic volume occupied by an ideal gas.',
          'The chemical bond energy between atoms.',
          'The total gravitational potential of a closed box.'
        ],
        answer: 0,
        expl: 'Boltzmann showed that macroscopic thermodynamic states correspond to staggering numbers of microscopic permutations (microstates $\\Omega$). Thermodynamic irreversibility is not a mechanical impossibility, but an overwhelming statistical certainty: systems spontaneously evolve toward states with exponentially larger $\\Omega$.'
      }
    ];

    var userAnswers = new Array(questions.length).fill(null);
    var scoreBanner = document.createElement('div');
    scoreBanner.style.padding = '10px 14px';
    scoreBanner.style.borderRadius = '6px';
    scoreBanner.style.background = 'var(--color-bg, #fff)';
    scoreBanner.style.border = '1px solid var(--color-border, #ddd)';
    scoreBanner.style.fontWeight = 'bold';
    scoreBanner.style.display = 'none';
    wrapper.appendChild(scoreBanner);

    var qList = document.createElement('div');
    qList.style.display = 'flex';
    qList.style.flexDirection = 'column';
    qList.style.gap = '16px';

    questions.forEach(function (qObj, qIdx) {
      var qCard = document.createElement('div');
      qCard.style.padding = '12px';
      qCard.style.borderRadius = '6px';
      qCard.style.background = 'var(--color-bg, #fff)';
      qCard.style.border = '1px solid var(--color-border, #eee)';

      var qTitle = document.createElement('div');
      qTitle.style.fontWeight = '600';
      qTitle.style.marginBottom = '8px';
      qTitle.style.fontSize = '0.92rem';
      qTitle.textContent = qObj.q;
      qCard.appendChild(qTitle);

      var optContainer = document.createElement('div');
      optContainer.style.display = 'flex';
      optContainer.style.flexDirection = 'column';
      optContainer.style.gap = '6px';

      var explDiv = document.createElement('div');
      explDiv.style.marginTop = '10px';
      explDiv.style.padding = '8px 12px';
      explDiv.style.borderRadius = '4px';
      explDiv.style.fontSize = '0.85rem';
      explDiv.style.lineHeight = '1.4';
      explDiv.style.display = 'none';

      qObj.options.forEach(function (optText, optIdx) {
        var optBtn = document.createElement('button');
        optBtn.style.textAlign = 'left';
        optBtn.style.padding = '6px 12px';
        optBtn.style.borderRadius = '4px';
        optBtn.style.border = '1px solid var(--color-border, #ccc)';
        optBtn.style.background = 'var(--color-card-bg, #fafafa)';
        optBtn.style.color = 'var(--color-text, #222)';
        optBtn.style.cursor = 'pointer';
        optBtn.style.fontSize = '0.86rem';
        optBtn.textContent = optText;

        optBtn.addEventListener('click', function () {
          if (userAnswers[qIdx] !== null) return; // already answered
          userAnswers[qIdx] = optIdx;

          var btns = optContainer.querySelectorAll('button');
          btns.forEach(function (b, bIdx) {
            b.disabled = true;
            b.style.cursor = 'default';
            if (bIdx === qObj.answer) {
              b.style.background = isDark() ? '#14532d' : '#dcfce7';
              b.style.borderColor = '#22c55e';
              b.style.fontWeight = 'bold';
            } else if (bIdx === optIdx) {
              b.style.background = isDark() ? '#7f1d1d' : '#fee2e2';
              b.style.borderColor = '#ef4444';
            }
          });

          explDiv.style.display = 'block';
          if (optIdx === qObj.answer) {
            explDiv.style.background = isDark() ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4';
            explDiv.style.border = '1px solid #86efac';
            explDiv.innerHTML = '<strong>Correct!</strong> ' + qObj.expl;
          } else {
            explDiv.style.background = isDark() ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
            explDiv.style.border = '1px solid #fca5a5';
            explDiv.innerHTML = '<strong>Incorrect.</strong> ' + qObj.expl;
          }

          // Update total score if all answered
          var answeredCount = userAnswers.filter(function (a) { return a !== null; }).length;
          if (answeredCount === questions.length) {
            var correctCount = userAnswers.filter(function (a, idx) { return a === questions[idx].answer; }).length;
            scoreBanner.style.display = 'block';
            scoreBanner.innerHTML = 'Quiz Complete! Final Score: <span style="color:var(--color-primary, #2160c4);">' +
              correctCount + ' / ' + questions.length + ' (' + (correctCount * 10) + '%)</span>';
          }
        });

        optContainer.appendChild(optBtn);
      });

      qCard.appendChild(optContainer);
      qCard.appendChild(explDiv);
      qList.appendChild(qCard);
    });

    wrapper.appendChild(qList);
    container.appendChild(wrapper);
  };

})();
