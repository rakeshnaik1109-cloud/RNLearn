/**
 * Interactive Figures for Part 10: The Strange New Physics
 * Topics: Relativity, Quantum Theory, Atomic Models, Wave Mechanics, Uncertainty
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
  // Figure 10.1: Michelson-Morley Interferometer and the Null Ether Drift
  // =========================================================================
  FIG['fig-michelson-interferometer'] = function (container) {
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
      '<strong>Hypothetical Ether Wind ($v/c$):</strong>' +
      '<input type="range" id="mm-ether-v" min="0" max="0.1" step="0.005" value="0.0" style="width:110px;">' +
      '<span id="mm-v-val">0.000 c (Null Result)</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Table Rotation ($\theta$):</strong>' +
      '<input type="range" id="mm-angle" min="0" max="360" step="5" value="0" style="width:110px;">' +
      '<span id="mm-angle-val">0°</span>' +
      '</label>' +
      '<button id="mm-rotate-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Rotate 90°</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 360;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var readout = document.createElement('div');
    readout.style.fontSize = '0.85rem';
    readout.style.color = 'var(--color-text-muted, #666)';
    readout.id = 'mm-readout';
    readout.innerHTML = '<strong>Michelson-Morley (1887):</strong> Optical path difference $\\Delta d \\approx L (v/c)^2 \\cos(2\\theta)$. Expected shift for Earth orbital velocity ($30\\text{ km/s} \\approx 10^{-4}c$) was $\\sim 0.4$ fringes; observed shift was strictly $< 0.01$ fringes—the ether wind was zero.';
    wrapper.appendChild(readout);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var vSlider = ctrlRow.querySelector('#mm-ether-v');
    var vVal = ctrlRow.querySelector('#mm-v-val');
    var angSlider = ctrlRow.querySelector('#mm-angle');
    var angVal = ctrlRow.querySelector('#mm-angle-val');
    var rotateBtn = ctrlRow.querySelector('#mm-rotate-btn');

    var isRotatingAnim = false;
    var targetAngle = 0;

    function render() {
      var colors = getThemeColors();
      var vc = parseFloat(vSlider.value);
      var thetaDeg = parseFloat(angSlider.value);
      var thetaRad = (thetaDeg * Math.PI) / 180;

      vVal.textContent = vc === 0 ? '0.000 c (Observed Null)' : (vc).toFixed(3) + ' c';
      angVal.textContent = thetaDeg + '°';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Left side: Apparatus diagram on sandstone floating slab
      // Center of interferometer table: (240, 180)
      var cx = 230, cy = 180;
      var armLen = 110;

      // Heavy sandstone slab floating in circular mercury trough
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(thetaRad);

      // Octagonal floating block
      ctx.fillStyle = isDark() ? '#27272a' : '#e4e4e7';
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 3;
      ctx.beginPath();
      var octR = 150;
      for (var o = 0; o < 8; o++) {
        var a = (o * Math.PI) / 4 + Math.PI / 8;
        var ox = Math.cos(a) * octR;
        var oy = Math.sin(a) * octR;
        if (o === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Optical Elements mounted on slab:
      // 1. Central Beam Splitter (Half-silvered mirror at 45 deg)
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, 12);
      ctx.lineTo(12, -12);
      ctx.stroke();

      // 2. Light Source (Sodium flame / spark) on Left: (-armLen - 25, 0)
      ctx.fillStyle = colors.gold;
      ctx.fillRect(-armLen - 30, -10, 20, 20);
      ctx.strokeRect(-armLen - 30, -10, 20, 20);

      // 3. Mirror 1 (Arm along x-axis): (+armLen, 0)
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(armLen, -15);
      ctx.lineTo(armLen, 15);
      ctx.stroke();

      // 4. Mirror 2 (Arm along y-axis): (0, -armLen)
      ctx.beginPath();
      ctx.moveTo(-15, -armLen);
      ctx.lineTo(15, -armLen);
      ctx.stroke();

      // 5. Observing Telescope / Detector (0, +armLen + 20)
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.fillRect(-12, armLen + 10, 24, 25);
      ctx.strokeRect(-12, armLen + 10, 24, 25);

      // Light Beams (Gold/Yellow laser-like rays)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;

      // Incoming beam from source to splitter
      ctx.beginPath();
      ctx.moveTo(-armLen - 10, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Arm 1: Splitter to Mirror 1 and return
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLen, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Arm 2: Splitter to Mirror 2 and return
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -armLen);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Recombined beams to telescope
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, armLen + 10);
      ctx.stroke();

      ctx.restore();

      // Ether wind arrows across background if vc > 0
      if (vc > 0.001) {
        ctx.strokeStyle = isDark() ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 1.5;
        for (var row = 40; row < 340; row += 50) {
          ctx.beginPath();
          ctx.moveTo(30, row);
          ctx.lineTo(120, row);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(125, row);
          ctx.lineTo(115, row - 4);
          ctx.lineTo(115, row + 4);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Hypothetical Ether Wind (v = ' + (vc * 300000).toFixed(0) + ' km/s)', 30, 26);
      }

      // --- Right Side: Telescope Field of View with Interference Fringes ---
      var viewCx = 550, viewCy = 180, viewR = 100;

      // Outer bezel
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(viewCx, viewCy, viewR + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Circular viewing aperture
      ctx.save();
      ctx.beginPath();
      ctx.arc(viewCx, viewCy, viewR, 0, Math.PI * 2);
      ctx.clip();

      // Fringe shift formula: deltaN = (2L / lambda) * (v/c)^2 * cos(2 theta)
      // For visual clarity in simulator, scale up effect
      var fringeShift = 12 * (vc / 0.1) * (vc / 0.1) * Math.cos(2 * thetaRad);
      var fringeSpacing = 16;

      // Draw vertical interference fringes
      for (var fx = viewCx - viewR - 40; fx <= viewCx + viewR + 40; fx += 1) {
        var xRel = fx - viewCx - fringeShift;
        var intensity = 0.5 + 0.5 * Math.cos((2 * Math.PI * xRel) / fringeSpacing);
        // Sodium yellow color modulation: rgb(251, 191, 36)
        var rCol = Math.round(251 * intensity);
        var gCol = Math.round(191 * intensity);
        var bCol = Math.round(36 * intensity);
        ctx.fillStyle = 'rgb(' + rCol + ',' + gCol + ',' + bCol + ')';
        ctx.fillRect(fx, viewCy - viewR, 1, viewR * 2);
      }

      // Reticle Crosshairs
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(viewCx, viewCy - viewR);
      ctx.lineTo(viewCx, viewCy + viewR);
      ctx.moveTo(viewCx - viewR, viewCy);
      ctx.lineTo(viewCx + viewR, viewCy);
      ctx.stroke();

      ctx.restore();

      // Readouts and labels
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Telescope Eyepiece: Interference Fringes', viewCx - 130, 45);

      ctx.font = '12px sans-serif';
      ctx.fillText('Relative Fringe Shift: ' + fringeShift.toFixed(2) + ' fringes', viewCx - 80, viewCy + viewR + 35);
      if (vc === 0) {
        ctx.fillStyle = colors.success;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Null Drift: Fringes remain motionless upon 90° rotation', viewCx - 150, viewCy + viewR + 55);
      } else {
        ctx.fillStyle = colors.hot;
        ctx.fillText('Noticeable fringe displacement predicted by classical ether', viewCx - 145, viewCy + viewR + 55);
      }
    }

    vSlider.addEventListener('input', render);
    angSlider.addEventListener('input', render);

    rotateBtn.addEventListener('click', function () {
      var current = parseFloat(angSlider.value);
      targetAngle = (current + 90) % 360;

      function animRotate() {
        var cur = parseFloat(angSlider.value);
        if (Math.abs(cur - targetAngle) > 2) {
          angSlider.value = (cur + 3) % 360;
          render();
          requestAnimationFrame(animRotate);
        } else {
          angSlider.value = targetAngle;
          render();
        }
      }
      animRotate();
    });

    render();
  };

  // =========================================================================
  // Figure 10.2: Blackbody Radiation and the Ultraviolet Catastrophe
  // =========================================================================
  FIG['fig-blackbody-planck'] = function (container) {
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
      '<strong>Temperature ($T$):</strong>' +
      '<input type="range" id="bb-temp" min="2000" max="7000" step="100" value="5000" style="width:130px;">' +
      '<span id="bb-temp-val">5000 K (Sun-like)</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<input type="checkbox" id="bb-show-rj" checked>' +
      '<span>Show Classical Rayleigh-Jeans ($u \\propto \\nu^2$)</span>' +
      '</label>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var readouts = document.createElement('div');
    readouts.style.display = 'flex';
    readouts.style.justifyContent = 'space-around';
    readouts.style.fontSize = '0.85rem';
    readouts.style.padding = '8px';
    readouts.style.background = 'var(--color-bg, #fff)';
    readouts.style.borderRadius = '4px';
    readouts.style.border = '1px solid var(--color-border, #eee)';

    readouts.innerHTML =
      '<div><strong>Wien Peak Wavelength ($\\lambda_{\\max} = b/T$):</strong> <span id="wien-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">580 nm</span></div>' +
      '<div><strong>Planck Quantum Constant ($h$):</strong> <span>6.626 × 10⁻³⁴ J·s</span></div>' +
      '<div><strong>Ultraviolet Catastrophe:</strong> <span style="color:var(--color-accent, #d97706);">Classical energy diverges to $\\infty$</span></div>';
    wrapper.appendChild(readouts);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var tempSlider = ctrlRow.querySelector('#bb-temp');
    var tempVal = ctrlRow.querySelector('#bb-temp-val');
    var showRjCheck = ctrlRow.querySelector('#bb-show-rj');
    var wienDisp = readouts.querySelector('#wien-disp');

    function render() {
      var colors = getThemeColors();
      var T = parseFloat(tempSlider.value);
      var showRJ = showRjCheck.checked;

      tempVal.textContent = T + ' K ' + (T === 5800 ? '(Solar Photosphere)' : '');
      var peakLambdaNm = Math.round(2898000 / T); // Wien's law: lambda_max * T = 2.898 x 10^6 nm K
      wienDisp.textContent = peakLambdaNm + ' nm (' + (peakLambdaNm < 380 ? 'Ultraviolet' : (peakLambdaNm > 750 ? 'Infrared' : 'Visible')) + ')';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Plot area:
      var ox = 70, oy = 290, pw = 610, ph = 240;

      // Axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy - ph);
      ctx.lineTo(ox, oy);
      ctx.lineTo(ox + pw, oy);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Wavelength λ (nm)', ox + pw - 90, oy + 24);
      ctx.save();
      ctx.translate(ox - 45, oy - ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Spectral Energy Density u(λ)', 0, 0);
      ctx.restore();

      // Wavelength scale: 100 nm to 2000 nm
      var minLambda = 100, maxLambda = 2000;
      function mapX(lambda) {
        return ox + ((lambda - minLambda) / (maxLambda - minLambda)) * pw;
      }

      // Draw visible spectrum band (380 nm to 750 nm)
      var visX1 = mapX(380);
      var visX2 = mapX(750);
      var grad = ctx.createLinearGradient(visX1, 0, visX2, 0);
      grad.addColorStop(0.0, 'rgba(147, 51, 234, 0.25)'); // violet
      grad.addColorStop(0.2, 'rgba(59, 130, 246, 0.25)'); // blue
      grad.addColorStop(0.4, 'rgba(34, 197, 94, 0.25)');  // green
      grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.25)');  // yellow
      grad.addColorStop(1.0, 'rgba(239, 68, 68, 0.25)');  // red
      ctx.fillStyle = grad;
      ctx.fillRect(visX1, oy - ph, visX2 - visX1, ph);

      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.fillText('UV', ox + 30, oy - ph + 15);
      ctx.fillText('Visible', (visX1 + visX2) / 2 - 15, oy - ph + 15);
      ctx.fillText('Infrared (IR)', visX2 + 40, oy - ph + 15);

      // Planck's law in wavelength form, u(λ) ∝ λ^-5 / (exp(hc/λkT) − 1), with hc/k = 1.4388e7 nm·K.
      // Both curves share one scale, normalised to the height of the 7000 K peak, so the slider shows
      // the real growth of the peak with temperature and the classical curve meets Planck's at long λ.
      var HCK = 1.4388e7;
      function planck(lam, temp) { return Math.pow(lam, -5) / (Math.exp(HCK / (lam * temp)) - 1); }
      var normMax = planck(2.8978e6 / 7000, 7000);

      ctx.beginPath();
      var peakY = 0, peakX = 0;
      for (var l = minLambda; l <= maxLambda; l += 5) {
        var x = mapX(l);
        var scaleY = (planck(l, T) / normMax) * ph * 0.92;
        var y = oy - Math.min(ph, scaleY);
        if (scaleY > peakY) { peakY = scaleY; peakX = x; }

        if (l === minLambda) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill underneath Planck curve
      ctx.lineTo(mapX(maxLambda), oy);
      ctx.lineTo(mapX(minLambda), oy);
      ctx.closePath();
      ctx.fillStyle = isDark() ? 'rgba(106, 176, 248, 0.12)' : 'rgba(33, 96, 196, 0.08)';
      ctx.fill();

      // 2. Classical Rayleigh-Jeans Curve: u(lambda) = 8*pi*k*T / lambda^4 (Diverges as lambda -> 0)
      if (showRJ) {
        ctx.beginPath();
        for (var rjL = 250; rjL <= maxLambda; rjL += 5) {
          var rjX = mapX(rjL);
          var rjVal = T / (HCK * Math.pow(rjL, 4));   // long-wavelength limit of Planck's law
          var rjY = oy - Math.min(ph, (rjVal / normMax) * ph * 0.92);

          if (rjL === 250) ctx.moveTo(rjX, rjY);
          else ctx.lineTo(rjX, rjY);
        }
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label UV Catastrophe
        ctx.fillStyle = colors.hot;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Rayleigh–Jeans: u → ∞ at short λ (ultraviolet catastrophe)', mapX(900), oy - ph + 40);
      }

      // Mark Wien peak
      var peakMapX = mapX(peakLambdaNm);
      if (peakMapX >= ox && peakMapX <= ox + pw) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(peakMapX, oy);
        ctx.lineTo(peakMapX, oy - ph);
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(peakMapX, oy - peakY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('λ_max = ' + peakLambdaNm + ' nm', peakMapX + 8, oy - peakY - 12);
      }

      // Legend
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Planck Quantum Law (1900): E = nhν', ox + 180, 25);
    }

    tempSlider.addEventListener('input', render);
    showRjCheck.addEventListener('change', render);

    render();
  };

  // =========================================================================
  // Figure 10.3: Einstein's Photoelectric Effect and Stopping Potential
  // =========================================================================
  FIG['fig-photoelectric-effect'] = function (container) {
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
      '<strong>Target Metal:</strong>' +
      '<select id="pe-metal" style="padding:3px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="2.28">Sodium (Na, Φ = 2.28 eV)</option>' +
      '<option value="2.29">Potassium (K, Φ = 2.29 eV)</option>' +
      '<option value="4.31">Zinc (Zn, Φ = 4.31 eV)</option>' +
      '<option value="6.35">Platinum (Pt, Φ = 6.35 eV)</option>' +
      '</select>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Wavelength ($\lambda$):</strong>' +
      '<input type="range" id="pe-lambda" min="200" max="750" step="10" value="450" style="width:110px;">' +
      '<span id="pe-lambda-val">450 nm (Blue)</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Retarding Voltage ($V$):</strong>' +
      '<input type="range" id="pe-volt" min="0" max="4.0" step="0.1" value="0.0" style="width:90px;">' +
      '<span id="pe-volt-val">0.0 V</span>' +
      '</label>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var statRow = document.createElement('div');
    statRow.style.display = 'flex';
    statRow.style.justifyContent = 'space-around';
    statRow.style.fontSize = '0.85rem';
    statRow.style.padding = '8px';
    statRow.style.background = 'var(--color-bg, #fff)';
    statRow.style.borderRadius = '4px';
    statRow.style.border = '1px solid var(--color-border, #eee)';

    statRow.innerHTML =
      '<div><strong>Photon Energy ($h\\nu$):</strong> <span id="pe-hnu" style="font-weight:bold;">2.76 eV</span></div>' +
      '<div><strong>Work Function ($\\Phi$):</strong> <span id="pe-phi">2.28 eV</span></div>' +
      '<div><strong>Max Kinetic Energy ($K_{\\max}$):</strong> <span id="pe-kmax" style="font-weight:bold; color:var(--color-hot, #dc2626);">0.48 eV</span></div>' +
      '<div><strong>Photo-Current ($I$):</strong> <span id="pe-current" style="font-weight:bold; color:var(--color-success, #16a34a);">Active Current</span></div>';

    wrapper.appendChild(statRow);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var metalSelect = ctrlRow.querySelector('#pe-metal');
    var lambdaSlider = ctrlRow.querySelector('#pe-lambda');
    var lambdaVal = ctrlRow.querySelector('#pe-lambda-val');
    var voltSlider = ctrlRow.querySelector('#pe-volt');
    var voltVal = ctrlRow.querySelector('#pe-volt-val');

    var hnuDisp = statRow.querySelector('#pe-hnu');
    var phiDisp = statRow.querySelector('#pe-phi');
    var kmaxDisp = statRow.querySelector('#pe-kmax');
    var currentDisp = statRow.querySelector('#pe-current');

    var emittedElectrons = [];

    function getColorFromWavelength(nm) {
      if (nm < 380) return '#a855f7'; // UV
      if (nm < 450) return '#3b82f6'; // violet-blue
      if (nm < 495) return '#06b6d4'; // cyan
      if (nm < 570) return '#22c55e'; // green
      if (nm < 590) return '#eab308'; // yellow
      if (nm < 620) return '#f97316'; // orange
      return '#ef4444'; // red
    }

    function render() {
      var colors = getThemeColors();
      var phi = parseFloat(metalSelect.value);
      var lambda = parseFloat(lambdaSlider.value);
      var V_retard = parseFloat(voltSlider.value);

      // Photon energy E = hc / lambda (nm) -> 1239.8 / lambda eV
      var hnu = 1239.84 / lambda;
      var Kmax = hnu - phi;
      var canEmit = Kmax > 0;
      var stoppingV = canEmit ? Kmax : 0;
      var hasCurrent = canEmit && (V_retard < stoppingV);

      lambdaVal.textContent = lambda + ' nm (' + (lambda < 380 ? 'UV' : (lambda > 700 ? 'IR' : 'Visible')) + ')';
      voltVal.textContent = V_retard.toFixed(1) + ' V';
      hnuDisp.textContent = hnu.toFixed(2) + ' eV';
      phiDisp.textContent = phi.toFixed(2) + ' eV';

      if (canEmit) {
        kmaxDisp.textContent = Kmax.toFixed(2) + ' eV (Stopping V_s = ' + stoppingV.toFixed(2) + ' V)';
      } else {
        kmaxDisp.textContent = '0.00 eV (hν < Φ, No Emission!)';
      }

      if (hasCurrent) {
        currentDisp.textContent = 'Active Flow (I > 0)';
        currentDisp.style.color = 'var(--color-success, #16a34a)';
      } else if (!canEmit) {
        currentDisp.textContent = 'No Emission (Below Threshold ν₀)';
        currentDisp.style.color = 'var(--color-hot, #dc2626)';
      } else {
        currentDisp.textContent = 'Cutoff: Retarding V ≥ Stopping V_s';
        currentDisp.style.color = 'var(--color-accent, #d97706)';
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left: Vacuum Phototube Chamber ---
      var vx = 80, vy = 60, vw = 260, vh = 200;

      // Glass bulb outline
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(vx + vw / 2, vy + vh / 2, vw / 2 - 10, vh / 2 - 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cathode plate (Metal target emitting electrons) on Left
      var cx = vx + 40, cy = vy + vh / 2;
      ctx.fillStyle = isDark() ? '#94a3b8' : '#64748b';
      ctx.fillRect(cx - 8, cy - 50, 16, 100);
      ctx.strokeRect(cx - 8, cy - 50, 16, 100);

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Cathode (Target)', cx - 45, cy - 60);

      // Anode collector plate on Right
      var ax = vx + vw - 40, ay = vy + vh / 2;
      ctx.fillStyle = colors.border;
      ctx.fillRect(ax - 6, ay - 50, 12, 100);
      ctx.strokeRect(ax - 6, ay - 50, 12, 100);
      ctx.fillText('Anode (Collector)', ax - 35, ay - 60);

      // Incident monochromatic light beam shining onto cathode
      var lightColor = getColorFromWavelength(lambda);
      ctx.strokeStyle = lightColor;
      ctx.lineWidth = 3;
      for (var b = -30; b <= 30; b += 15) {
        ctx.beginPath();
        ctx.moveTo(vx - 20, vy + 40 + b);
        ctx.lineTo(cx, cy + b);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(cx, cy + b);
        ctx.lineTo(cx - 10, cy + b - 4);
        ctx.lineTo(cx - 10, cy + b + 4);
        ctx.fill();
      }

      // Draw flying electrons
      for (var e = 0; e < emittedElectrons.length; e++) {
        var el = emittedElectrons[e];
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(el.x, el.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Battery / retarding voltage symbol below tube
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 50); ctx.lineTo(cx, vy + vh + 30); ctx.lineTo(vx + vw / 2 - 20, vy + vh + 30);
      ctx.moveTo(ax, ay + 50); ctx.lineTo(ax, vy + vh + 30); ctx.lineTo(vx + vw / 2 + 20, vy + vh + 30);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      ctx.fillText('Retarding Potential: -' + V_retard.toFixed(1) + ' V', vx + vw / 2 - 60, vy + vh + 46);

      // --- Right: Einstein's Linear K_max vs Frequency Plot ---
      var px = 430, py = 260, pw = 240, ph = 180;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py - ph);
      ctx.lineTo(px, py);
      ctx.lineTo(px + pw, py);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      ctx.fillText('Frequency ν (×10¹⁴ Hz)', px + pw - 90, py + 24);
      ctx.save();
      ctx.translate(px - 30, py - ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('K_max (eV)', 0, 0);
      ctx.restore();

      // Plot Einstein's line: Kmax = h*nu - phi
      // Threshold frequency nu_0 = phi / h
      // Range: nu = 0 to 15 x 10^14 Hz (h*nu up to 6.2 eV)
      var nu0 = phi; // in eV units where h = 1
      var maxNu = 7.0;

      function mapPlot(nu_ev, k_ev) {
        var x = px + (nu_ev / maxNu) * pw;
        var y = py - (k_ev / 4.5) * ph;
        return { x: x, y: y };
      }

      var pStart = mapPlot(nu0, 0);
      var pEnd = mapPlot(maxNu, maxNu - phi);

      // Negative intercept dashed line (down to -phi)
      var pNeg = mapPlot(0, -phi);
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pNeg.x, py + (phi / 4.5) * ph);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('-Φ (' + phi + ' eV)', pNeg.x + 5, py + (phi / 4.5) * ph);

      // Active photoelectric line
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();

      // Current operating point on the plot
      var curPoint = mapPlot(hnu, Math.max(0, Kmax));
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.arc(curPoint.x, curPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Annotations
      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      ctx.fillText('Threshold ν₀', pStart.x - 20, py + 14);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Einstein: K_max = hν - Φ', px + 40, py - ph + 20);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Slope = Planck constant h', px + 70, py - ph + 35);
    }

    function tickPhysics() {
      var phi = parseFloat(metalSelect.value);
      var lambda = parseFloat(lambdaSlider.value);
      var V_retard = parseFloat(voltSlider.value);
      var hnu = 1239.84 / lambda;
      var Kmax = hnu - phi;

      // Spawn electrons from cathode if Kmax > 0
      if (Kmax > 0 && Math.random() < 0.45) {
        var v0 = Math.sqrt(Kmax) * 2.5; // initial velocity
        emittedElectrons.push({
          x: 125,
          y: 160 + (Math.random() - 0.5) * 60,
          vx: v0,
          vy: (Math.random() - 0.5) * 0.8
        });
      }

      // Decelerate electrons due to retarding potential V_retard
      // a = -qE = -k * V_retard
      var accel = -0.15 * V_retard;

      for (var i = emittedElectrons.length - 1; i >= 0; i--) {
        var el = emittedElectrons[i];
        el.vx += accel;
        el.x += el.vx;
        el.y += el.vy;

        // Reach anode collector
        if (el.x >= 295) {
          emittedElectrons.splice(i, 1);
        } else if (el.vx <= 0 && el.x < 120) { // turned back to cathode
          emittedElectrons.splice(i, 1);
        }
      }

      render();
      requestAnimationFrame(tickPhysics);
    }

    metalSelect.addEventListener('change', render);
    lambdaSlider.addEventListener('input', render);
    voltSlider.addEventListener('input', render);

    render();
    tickPhysics();
  };

  // =========================================================================
  // Figure 10.4: Relativistic Light Clock and Time Dilation (Δt = γ Δt₀)
  // =========================================================================
  FIG['fig-relativity-time-dilation'] = function (container) {
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
      '<strong>Velocity ($v/c$):</strong>' +
      '<input type="range" id="rel-v" min="0" max="0.95" step="0.01" value="0.60" style="width:130px;">' +
      '<span id="rel-v-val">0.60 c</span>' +
      '</label>' +
      '<button id="rel-play-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Pause</button>' +
      '<span id="rel-gamma-disp" style="font-weight:bold; color:var(--color-primary, #2160c4);">Lorentz Factor γ = 1.250</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var footerNote = document.createElement('div');
    footerNote.style.fontSize = '0.85rem';
    footerNote.style.color = 'var(--color-text-muted, #666)';
    footerNote.innerHTML = '<strong>Postulate of Special Relativity:</strong> The speed of light $c$ is invariant for all inertial observers. Because the light pulse must traverse a longer diagonal path ($c \\Delta t = 2\\sqrt{L^2 + (v\\Delta t/2)^2}$) in the moving frame at the identical speed $c$, the moving clock runs slower: $\\Delta t = \\gamma \\Delta t_0$.';
    wrapper.appendChild(footerNote);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var vSlider = ctrlRow.querySelector('#rel-v');
    var vVal = ctrlRow.querySelector('#rel-v-val');
    var playBtn = ctrlRow.querySelector('#rel-play-btn');
    var gammaDisp = ctrlRow.querySelector('#rel-gamma-disp');

    var isRunning = true;
    var clockHeight = 130;
    var photonY1 = 0, photonDir1 = 1; // stationary clock
    var photonY2 = 0, photonDir2 = 1, photonX2 = 0; // moving clock

    function render() {
      var colors = getThemeColors();
      var vc = parseFloat(vSlider.value);
      var gamma = 1.0 / Math.sqrt(Math.max(0.01, 1 - vc * vc));

      vVal.textContent = vc.toFixed(2) + ' c';
      gammaDisp.textContent = 'Lorentz Factor γ = ' + gamma.toFixed(3) + ' (Δt = ' + gamma.toFixed(2) + ' Δt₀)';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left: Stationary Observer Frame (Proper Time Δt₀) ---
      var ox1 = 140, oy1 = 80;

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Rest Frame (Observer at rest)', ox1 - 65, oy1 - 35);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Proper Time: Δt₀ = 2L / c', ox1 - 40, oy1 - 18);

      // Top mirror
      ctx.fillStyle = isDark() ? '#94a3b8' : '#64748b';
      ctx.fillRect(ox1 - 40, oy1, 80, 8);
      ctx.strokeRect(ox1 - 40, oy1, 80, 8);

      // Bottom mirror
      ctx.fillRect(ox1 - 40, oy1 + clockHeight, 80, 8);
      ctx.strokeRect(ox1 - 40, oy1 + clockHeight, 80, 8);

      // Vertical bouncing light path
      ctx.strokeStyle = isDark() ? 'rgba(251, 191, 36, 0.3)' : 'rgba(217, 119, 6, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox1, oy1 + 8);
      ctx.lineTo(ox1, oy1 + clockHeight);
      ctx.stroke();

      // Mirror distance dimension L
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(ox1 - 50, oy1 + 8);
      ctx.lineTo(ox1 - 50, oy1 + clockHeight);
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.fillText('L', ox1 - 65, oy1 + clockHeight / 2);

      // Photon 1
      var py1 = oy1 + 8 + photonY1;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(ox1, py1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // --- Right: Moving Observer Frame (Dilated Time Δt) ---
      var ox2 = 360, oy2 = 80;

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Lab Frame (Clock moving at v = ' + vc.toFixed(2) + 'c)', ox2 + 30, oy2 - 35);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = colors.primary;
      ctx.fillText('Dilated Time: Δt = γ Δt₀ (Diagonal Light Path)', ox2 + 40, oy2 - 18);

      // Continuous diagonal zigzag path representation
      var halfPeriodX = (vc * clockHeight * 1.6);
      ctx.strokeStyle = isDark() ? 'rgba(251, 191, 36, 0.4)' : 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox2, oy2 + clockHeight);
      ctx.lineTo(ox2 + halfPeriodX, oy2 + 8);
      ctx.lineTo(ox2 + 2 * halfPeriodX, oy2 + clockHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving mirrors at current position
      var curMirrorX = ox2 + photonX2;
      ctx.fillStyle = isDark() ? '#94a3b8' : '#64748b';
      ctx.fillRect(curMirrorX - 35, oy2, 70, 8);
      ctx.strokeRect(curMirrorX - 35, oy2, 70, 8);
      ctx.fillRect(curMirrorX - 35, oy2 + clockHeight, 70, 8);
      ctx.strokeRect(curMirrorX - 35, oy2 + clockHeight, 70, 8);

      // Moving velocity vector arrow
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(curMirrorX, oy2 + clockHeight + 25);
      ctx.lineTo(curMirrorX + vc * 60, oy2 + clockHeight + 25);
      ctx.stroke();
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(curMirrorX + vc * 60, oy2 + clockHeight + 25, 4, 0, Math.PI * 2);
      ctx.fill();

      // Photon 2
      var py2 = oy2 + 8 + photonY2;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(curMirrorX, py2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Pythagorean triangle overlay on right
      var triX = 580, triY = 280;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(triX, triY);
      ctx.lineTo(triX + 70, triY); // v * dt / 2
      ctx.lineTo(triX + 70, triY - 50); // L
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '10px sans-serif';
      ctx.fillText('v Δt / 2', triX + 15, triY + 14);
      ctx.fillText('L = c Δt₀ / 2', triX + 75, triY - 22);
      ctx.fillStyle = colors.accent;
      ctx.fillText('Hypotenuse = c Δt / 2', triX - 30, triY - 32);
    }

    function tick() {
      if (isRunning) {
        var vc = parseFloat(vSlider.value);
        var gamma = 1.0 / Math.sqrt(Math.max(0.01, 1 - vc * vc));

        // Speed of light is fixed: stationary photon moves speed 3 px/frame
        var cSpeed = 3.2;
        photonY1 += photonDir1 * cSpeed;
        if (photonY1 >= clockHeight - 16) { photonY1 = clockHeight - 16; photonDir1 = -1; }
        else if (photonY1 <= 0) { photonY1 = 0; photonDir1 = 1; }

        // In moving frame, vertical component is reduced by gamma: v_y = c / gamma
        var movingVy = cSpeed / gamma;
        photonY2 += photonDir2 * movingVy;
        if (photonY2 >= clockHeight - 16) { photonY2 = clockHeight - 16; photonDir2 = -1; }
        else if (photonY2 <= 0) { photonY2 = 0; photonDir2 = 1; }

        // Horizontal mirror motion
        photonX2 = (photonX2 + vc * cSpeed * 0.9) % 220;

        render();
      }
      requestAnimationFrame(tick);
    }

    vSlider.addEventListener('input', render);

    playBtn.addEventListener('click', function () {
      isRunning = !isRunning;
      playBtn.textContent = isRunning ? 'Pause' : 'Play';
    });

    render();
    tick();
  };

  // =========================================================================
  // Figure 10.5: Rutherford Alpha Scattering and the Discovery of the Nucleus
  // =========================================================================
  FIG['fig-rutherford-scattering'] = function (container) {
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
      '<strong>Atomic Model:</strong>' +
      '<select id="ruth-model" style="padding:3px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="rutherford">Rutherford Nuclear Atom (Dense Gold Nucleus Z=+79)</option>' +
      '<option value="thomson">Thomson Plum Pudding (Diffuse + Charge)</option>' +
      '</select>' +
      '</label>' +
      '<button id="ruth-fire-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-hot, #dc2626); color:#fff; cursor:pointer;">Fire Alpha Beam (α²⁺)</button>' +
      '<button id="ruth-clear-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Clear Tracks</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 350;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var caption = document.createElement('div');
    caption.style.fontSize = '0.85rem';
    caption.style.color = 'var(--color-text-muted, #666)';
    caption.innerHTML = '<strong>Geiger-Marsden Experiment (1909–1911):</strong> Most alpha particles penetrate gold foil with negligible deflection ($< 1^\\circ$), but approximately 1 in 8,000 backscatters at angles $> 90^\\circ$. As Rutherford remarked: <em>"It was quite the most incredible event that has ever happened to me in my life. It was almost as incredible as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you."</em>';
    wrapper.appendChild(caption);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var modelSelect = ctrlRow.querySelector('#ruth-model');
    var fireBtn = ctrlRow.querySelector('#ruth-fire-btn');
    var clearBtn = ctrlRow.querySelector('#ruth-clear-btn');

    var alphaParticles = [];
    var finishedTracks = [];
    var nucleusX = 360, nucleusY = 175;

    function render() {
      var colors = getThemeColors();
      var model = modelSelect.value;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold atom boundary (radius ~ 140 px)
      var atomRadius = 135;

      if (model === 'thomson') {
        // Diffuse positive pudding sphere
        ctx.fillStyle = isDark() ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, atomRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Embedded electrons
        ctx.fillStyle = colors.cold;
        var electronOffsets = [
          { x: -50, y: -40 }, { x: 40, y: -60 }, { x: -30, y: 50 },
          { x: 60, y: 30 }, { x: -70, y: 10 }, { x: 20, y: 80 }, { x: 0, y: -20 }
        ];
        electronOffsets.forEach(function (off) {
          ctx.beginPath();
          ctx.arc(nucleusX + off.x, nucleusY + off.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Thomson Plum Pudding: Diffuse + Charge, Negligible Deflection', 180, 25);
      } else {
        // Rutherford nuclear atom
        // Atom boundary (mostly empty space)
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, atomRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Extremely tiny, dense positive gold nucleus (Z = +79)
        ctx.fillStyle = colors.gold;
        ctx.beginPath();
        ctx.arc(nucleusX, nucleusY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Plus symbols
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('+79', nucleusX - 9, nucleusY + 3);

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Rutherford Nuclear Atom: Tiny Massive Nucleus (r ~ 10⁻¹⁴ m)', 190, 25);
      }

      // Draw historical tracks
      ctx.lineWidth = 1.2;
      finishedTracks.forEach(function (track) {
        ctx.strokeStyle = track.deflected ? (isDark() ? 'rgba(248, 113, 113, 0.7)' : 'rgba(220, 38, 38, 0.65)') : (isDark() ? 'rgba(106, 176, 248, 0.3)' : 'rgba(33, 96, 196, 0.25)');
        ctx.beginPath();
        for (var p = 0; p < track.pts.length; p++) {
          if (p === 0) ctx.moveTo(track.pts[p].x, track.pts[p].y);
          else ctx.lineTo(track.pts[p].x, track.pts[p].y);
        }
        ctx.stroke();
      });

      // Draw active particles
      for (var i = 0; i < alphaParticles.length; i++) {
        var ap = alphaParticles[i];
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(ap.x, ap.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Radioactive Radium / Polonium source on left
      ctx.fillStyle = isDark() ? '#374151' : '#64748b';
      ctx.fillRect(20, 140, 35, 70);
      ctx.strokeRect(20, 140, 35, 70);
      ctx.fillStyle = colors.text;
      ctx.font = '10px sans-serif';
      ctx.fillText('α Source', 15, 225);
    }

    function fireBeam() {
      var model = modelSelect.value;
      for (var b = 0; b < 18; b++) {
        var impactY = nucleusY + (Math.random() - 0.5) * 240;
        alphaParticles.push({
          x: 55,
          y: impactY,
          vx: 5.5,
          vy: 0,
          model: model,
          pts: [{ x: 55, y: impactY }]
        });
      }
    }

    function updateParticles() {
      for (var i = alphaParticles.length - 1; i >= 0; i--) {
        var p = alphaParticles[i];
        p.pts.push({ x: p.x, y: p.y });

        if (p.model === 'thomson') {
          // Extremely weak random jiggles inside pudding
          var dToCenter = Math.hypot(p.x - nucleusX, p.y - nucleusY);
          if (dToCenter < 135) {
            p.vy += (Math.random() - 0.5) * 0.05;
          }
        } else {
          // Rutherford Coulomb repulsion F = k * Q1 * Q2 / r^2
          var dx = p.x - nucleusX;
          var dy = p.y - nucleusY;
          var r2 = dx * dx + dy * dy;
          var r = Math.sqrt(r2);

          if (r < 180) {
            var force = 1800.0 / Math.max(100, r2);
            var fx = (dx / r) * force;
            var fy = (dy / r) * force;
            p.vx += fx;
            p.vy += fy;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Exit canvas
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          var finalAngle = Math.atan2(p.vy, p.vx) * (180 / Math.PI);
          var isDeflected = Math.abs(finalAngle) > 40;
          finishedTracks.push({ pts: p.pts, deflected: isDeflected });
          if (finishedTracks.length > 80) finishedTracks.shift();
          alphaParticles.splice(i, 1);
        }
      }
    }

    function loop() {
      updateParticles();
      render();
      requestAnimationFrame(loop);
    }

    fireBtn.addEventListener('click', fireBeam);
    clearBtn.addEventListener('click', function () {
      finishedTracks = [];
      alphaParticles = [];
      render();
    });

    modelSelect.addEventListener('change', function () {
      finishedTracks = [];
      alphaParticles = [];
      render();
    });

    render();
    loop();
  };

  // =========================================================================
  // Figure 10.6: Niels Bohr's Quantized Hydrogen Atom and Spectral Series
  // =========================================================================
  FIG['fig-bohr-atom'] = function (container) {
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
      '<strong>Initial Orbit ($n_i$):</strong>' +
      '<select id="bohr-ni" style="padding:3px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="3">n = 3 (-1.51 eV)</option>' +
      '<option value="4">n = 4 (-0.85 eV)</option>' +
      '<option value="5">n = 5 (-0.54 eV)</option>' +
      '</select>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Final Orbit ($n_f$):</strong>' +
      '<select id="bohr-nf" style="padding:3px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="2">n = 2 (Balmer: Visible)</option>' +
      '<option value="1">n = 1 (Lyman: Ultraviolet)</option>' +
      '<option value="3">n = 3 (Paschen: Infrared)</option>' +
      '</select>' +
      '</label>' +
      '<button id="bohr-jump-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Execute Quantum Leap</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 360;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.justifyContent = 'space-around';
    infoRow.style.fontSize = '0.85rem';
    infoRow.style.padding = '8px';
    infoRow.style.background = 'var(--color-bg, #fff)';
    infoRow.style.borderRadius = '4px';
    infoRow.style.border = '1px solid var(--color-border, #eee)';

    infoRow.innerHTML =
      '<div><strong>Transition:</strong> <span id="bohr-trans-disp" style="font-weight:bold;">3 → 2</span></div>' +
      '<div><strong>Emitted Photon Energy ($\Delta E$):</strong> <span id="bohr-de-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">1.89 eV</span></div>' +
      '<div><strong>Wavelength ($\\lambda = hc/\\Delta E$):</strong> <span id="bohr-lambda-disp" style="font-weight:bold; color:var(--color-accent, #d97706);">656.3 nm (Hα Red)</span></div>' +
      '<div><strong>Spectral Series:</strong> <span id="bohr-series-disp">Balmer Series</span></div>';

    wrapper.appendChild(infoRow);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var niSelect = ctrlRow.querySelector('#bohr-ni');
    var nfSelect = ctrlRow.querySelector('#bohr-nf');
    var jumpBtn = ctrlRow.querySelector('#bohr-jump-btn');

    var transDisp = infoRow.querySelector('#bohr-trans-disp');
    var deDisp = infoRow.querySelector('#bohr-de-disp');
    var lambdaDisp = infoRow.querySelector('#bohr-lambda-disp');
    var seriesDisp = infoRow.querySelector('#bohr-series-disp');

    var currentOrbitN = 3;
    var electronAngle = 0;
    var isJumping = false;
    var emittedPhoton = null;

    // Orbit radii (r_n propto n^2) scaled for screen
    var orbitRadii = {
      1: 35,
      2: 70,
      3: 105,
      4: 140,
      5: 175
    };

    function getEnergy(n) {
      return -13.606 / (n * n);
    }

    function render() {
      var colors = getThemeColors();
      var ni = parseInt(niSelect.value, 10);
      var nf = parseInt(nfSelect.value, 10);

      var Ei = getEnergy(ni);
      var Ef = getEnergy(nf);
      var deltaE = Math.abs(Ei - Ef);
      var lambdaNm = Math.round(1239.84 / deltaE);

      transDisp.textContent = ni + ' → ' + nf;
      deDisp.textContent = deltaE.toFixed(2) + ' eV';

      var seriesName = nf === 1 ? 'Lyman (UV)' : (nf === 2 ? 'Balmer (Visible)' : 'Paschen (IR)');
      var lineName = '';
      if (ni === 3 && nf === 2) lineName = ' (Hα Balmer Red)';
      else if (ni === 4 && nf === 2) lineName = ' (Hβ Cyan)';
      else if (ni === 5 && nf === 2) lineName = ' (Hγ Violet)';

      lambdaDisp.textContent = lambdaNm + ' nm' + lineName;
      seriesDisp.textContent = seriesName;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left: Quantized Concentric Orbits ---
      var ox = 210, oy = 180;

      // Nucleus (Proton +1)
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.arc(ox, oy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('+1', ox - 7, oy + 4);

      // Draw circular stationary orbits n = 1 to 5
      for (var n = 1; n <= 5; n++) {
        var r = orbitRadii[n];
        ctx.strokeStyle = (n === currentOrbitN) ? colors.primary : colors.border;
        ctx.lineWidth = (n === currentOrbitN) ? 2.5 : 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = colors.muted;
        ctx.font = '10px sans-serif';
        ctx.fillText('n=' + n, ox + r - 8, oy - 6);
      }

      // Orbiting electron
      var curR = orbitRadii[currentOrbitN];
      var elX = ox + Math.cos(electronAngle) * curR;
      var elY = oy + Math.sin(electronAngle) * curR;

      ctx.fillStyle = colors.cold;
      ctx.beginPath();
      ctx.arc(elX, elY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Emitted photon wavepacket flying away
      if (emittedPhoton) {
        ctx.strokeStyle = emittedPhoton.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var px = emittedPhoton.x, py = emittedPhoton.y;
        for (var w = 0; w < 24; w++) {
          var wx = px + w * 2;
          var wy = py + Math.sin(w * 0.8) * 6;
          if (w === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        ctx.fillStyle = emittedPhoton.color;
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('hν (' + lambdaNm + ' nm)', px, py - 10);
      }

      // --- Right: Energy Level Diagram ---
      var ex = 450, ey = 310, ew = 130, eh = 260, prevLabelY = Infinity;

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Energy Level Diagram E_n = -13.6 / n² eV', ex, 35);

      for (var k = 1; k <= 5; k++) {
        var en = getEnergy(k);
        // Map -13.6 to -0.5 eV onto vertical scale
        var yPos = ey - ((en + 13.606) / 14.0) * eh;

        ctx.strokeStyle = (k === currentOrbitN) ? colors.primary : colors.border;
        ctx.lineWidth = (k === currentOrbitN) ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.moveTo(ex, yPos);
        ctx.lineTo(ex + ew, yPos);
        ctx.stroke();

        // The upper levels crowd together, so push their labels apart and add a short leader line
        var labelY = Math.min(yPos, prevLabelY - 13);
        prevLabelY = labelY;
        if (labelY !== yPos) {
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ex + ew, yPos);
          ctx.lineTo(ex + ew + 8, labelY);
          ctx.stroke();
        }
        ctx.fillStyle = colors.text;
        ctx.font = '11px sans-serif';
        ctx.fillText('n = ' + k + ' (' + en.toFixed(2) + ' eV)', ex + ew + 10, labelY + 4);
      }

      // Transition arrow between ni and nf
      var yNi = ey - ((getEnergy(ni) + 13.606) / 14.0) * eh;
      var yNf = ey - ((getEnergy(nf) + 13.606) / 14.0) * eh;

      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ex + 80, yNi);
      ctx.lineTo(ex + 80, yNf);
      ctx.stroke();

      // Arrow head pointing down
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.moveTo(ex + 80, yNf);
      ctx.lineTo(ex + 75, yNf - 8);
      ctx.lineTo(ex + 85, yNf - 8);
      ctx.fill();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ΔE = ' + deltaE.toFixed(2) + ' eV', ex + 95, (yNi + yNf) / 2 + 4);
    }

    function tick() {
      electronAngle += 0.04 / Math.sqrt(currentOrbitN);

      if (emittedPhoton) {
        emittedPhoton.x += 6;
        if (emittedPhoton.x > canvas.width) emittedPhoton = null;
      }

      render();
      requestAnimationFrame(tick);
    }

    jumpBtn.addEventListener('click', function () {
      var ni = parseInt(niSelect.value, 10);
      var nf = parseInt(nfSelect.value, 10);
      if (ni === nf) return;

      currentOrbitN = ni;
      render();

      setTimeout(function () {
        currentOrbitN = nf;
        var deltaE = Math.abs(getEnergy(ni) - getEnergy(nf));
        var lambdaNm = Math.round(1239.84 / deltaE);
        var pColor = lambdaNm > 700 ? '#dc2626' : (lambdaNm < 400 ? '#9333ea' : '#3b82f6');
        emittedPhoton = {
          x: 210 + orbitRadii[nf],
          y: 180,
          color: pColor
        };
        render();
      }, 350);
    });

    niSelect.addEventListener('change', render);
    nfSelect.addEventListener('change', render);

    render();
    tick();
  };

  // =========================================================================
  // Figure 10.7: Heisenberg Uncertainty Principle and Wave Packet Spread
  // =========================================================================
  FIG['fig-wave-particle-uncertainty'] = function (container) {
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
      '<strong>Spatial Confinement ($\Delta x$):</strong>' +
      '<input type="range" id="uncert-dx" min="10" max="90" step="2" value="40" style="width:130px;">' +
      '<span id="uncert-dx-val">40 nm</span>' +
      '</label>' +
      '<span id="uncert-dp-val" style="font-weight:bold; color:var(--color-hot, #dc2626);">Momentum Spread Δp ≥ ℏ / (2Δx)</span>';

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
    expl.innerHTML = '<strong>Heisenberg Uncertainty Principle (1927):</strong> $\\sigma_x \\sigma_p \\ge \\frac{\\hbar}{2}$. Compressing a particle’s position into a narrow spatial region requires superposing a vast spectrum of Fourier de Broglie momentum waves ($p = h/\\lambda$), resulting in an unavoidable, intrinsic spread in momentum.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var dxSlider = ctrlRow.querySelector('#uncert-dx');
    var dxVal = ctrlRow.querySelector('#uncert-dx-val');
    var dpVal = ctrlRow.querySelector('#uncert-dp-val');

    function render() {
      var colors = getThemeColors();
      var sigmaX = parseFloat(dxSlider.value);
      dxVal.textContent = sigmaX.toFixed(0) + ' nm';

      // Fourier conjugate: sigma_p = 1 / (2 * sigma_x)
      var sigmaP = (750.0 / sigmaX);
      dpVal.textContent = 'Momentum Spread Δp: ' + sigmaP.toFixed(1) + ' (arb. units) [Δx·Δp = const]';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left Plot: Position Space Wavefunction ψ(x) and |ψ(x)|² ---
      var ox1 = 50, oy1 = 280, w1 = 280, h1 = 230;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox1, oy1 - h1);
      ctx.lineTo(ox1, oy1);
      ctx.lineTo(ox1 + w1, oy1);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Position x', ox1 + w1 - 60, oy1 + 20);
      ctx.save();
      ctx.translate(ox1 - 35, oy1 - h1 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Probability Density |ψ(x)|²', 0, 0);
      ctx.restore();

      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Position Space |ψ(x)|²', ox1 + 45, 30);

      var midX1 = ox1 + w1 / 2;

      // Draw Gaussian probability envelope |ψ(x)|²
      ctx.beginPath();
      for (var px = ox1; px <= ox1 + w1; px += 2) {
        var xNorm = (px - midX1);
        var gVal = Math.exp(- (xNorm * xNorm) / (2 * sigmaX * sigmaX));
        var py = oy1 - gVal * (h1 * 0.85);
        if (px === ox1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw real oscillating wavepacket inside envelope
      ctx.strokeStyle = isDark() ? 'rgba(96, 165, 250, 0.5)' : 'rgba(37, 99, 235, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var wx = ox1; wx <= ox1 + w1; wx += 1) {
        var xN = (wx - midX1);
        var env = Math.exp(- (xN * xN) / (2 * sigmaX * sigmaX));
        var waveVal = env * Math.cos(xN * 0.45);
        var wy = oy1 - (env * 0.85 * h1 / 2) - waveVal * 50;
        if (wx === ox1) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // Delta x width indicator
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(midX1 - sigmaX, oy1 - 30);
      ctx.lineTo(midX1 + sigmaX, oy1 - 30);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Δx', midX1 - 8, oy1 - 36);

      // --- Right Plot: Momentum Space Distribution |φ(p)|² ---
      var ox2 = 410, oy2 = 280, w2 = 280, h2 = 230;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox2, oy2 - h2);
      ctx.lineTo(ox2, oy2);
      ctx.lineTo(ox2 + w2, oy2);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '12px sans-serif';
      ctx.fillText('Momentum p', ox2 + w2 - 70, oy2 + 20);
      ctx.save();
      ctx.translate(ox2 - 35, oy2 - h2 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Momentum Density |φ(p)|²', 0, 0);
      ctx.restore();

      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Momentum Space |φ(p)|²', ox2 + 40, 30);

      var midX2 = ox2 + w2 / 2;

      // Draw Gaussian momentum distribution |phi(p)|^2
      ctx.beginPath();
      for (var qx = ox2; qx <= ox2 + w2; qx += 2) {
        var pNorm = (qx - midX2);
        var pVal = Math.exp(- (pNorm * pNorm) / (2 * sigmaP * sigmaP));
        var qy = oy2 - pVal * (h2 * 0.85);
        if (qx === ox2) ctx.moveTo(qx, qy);
        else ctx.lineTo(qx, qy);
      }
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Delta p width indicator
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(midX2 - Math.min(w2 / 2 - 10, sigmaP), oy2 - 30);
      ctx.lineTo(midX2 + Math.min(w2 / 2 - 10, sigmaP), oy2 - 30);
      ctx.stroke();
      ctx.fillStyle = colors.hot;
      ctx.fillText('Δp', midX2 - 8, oy2 - 36);
    }

    dxSlider.addEventListener('input', render);
    render();
  };

  // =========================================================================
  // Figure 10.8: Interactive Diagnostic Evaluation Quiz (Part 10)
  // =========================================================================
  FIG['fig-quiz-part10'] = function (container) {
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
        q: '1. What was the profound epistemic outcome of the 1887 Michelson-Morley experiment?',
        options: [
          'It accurately measured the orbital velocity of the Earth through the luminiferous ether as 30 km/s.',
          'It yielded a null result, proving that the speed of light is invariant and that a stationary luminiferous ether does not exist.',
          'It discovered that light waves travel in longitudinal compression pulses.',
          'It proved that gravity bends light rays around massive stars.'
        ],
        answer: 1,
        expl: 'Michelson and Morley detected no fringe shift upon rotating their optical interferometer, demonstrating that the speed of light is completely independent of the Earth’s motion through space, abolishing the classical mechanical ether.'
      },
      {
        q: '2. How did Max Planck resolve the "Ultraviolet Catastrophe" of classical blackbody radiation in December 1900?',
        options: [
          'By assuming that light travels at variable speeds inside hot cavities.',
          'By postulating that atomic oscillators can absorb and emit electromagnetic energy only in discrete, indivisible packets called quanta ($E = h\\nu$).',
          'By redefining absolute zero temperature.',
          'By showing that ultraviolet light is absorbed by nitrogen molecules in air.'
        ],
        answer: 1,
        expl: 'Planck introduced the revolutionary hypothesis that vibrational modes in cavity walls cannot exchange continuous energy; energy is quantized in discrete steps proportional to frequency: $E = h\\nu$, introducing Planck’s quantum constant $h$.'
      },
      {
        q: '3. In his 1905 explanation of the photoelectric effect, Albert Einstein proposed that light consists of localized quanta (photons). Why did this overturn classical wave theory?',
        options: [
          'Classical wave theory could not explain why light travels in straight lines.',
          'Classical wave theory predicted that increasing light intensity should increase electron kinetic energy, whereas experiments showed kinetic energy depends strictly on light frequency ($K_{\\max} = h\\nu - \\Phi$).',
          'Electrons were emitted only after hours of continuous illumination.',
          'Photons carry electric charge that repels electrons.'
        ],
        answer: 1,
        expl: 'Under classical wave theory, brighter light carries more energy and should eject faster electrons. Einstein showed that light delivers energy in discrete photon packets; each photon interacts one-on-one with an electron, making kinetic energy depend on frequency ($h\\nu$) rather than intensity.'
      },
      {
        q: '4. In Special Relativity, why is the concept of "simultaneity" relative rather than absolute?',
        options: [
          'Human senses suffer from neurological processing delays.',
          'Clocks run slower at higher altitudes due to gravity.',
          'Simultaneity depends on whether the observer is accelerating.',
          'Because the speed of light $c$ is identical for all inertial observers, events that are simultaneous in one reference frame occur at different times in a frame moving relative to it.'
        ],
        answer: 3,
        expl: 'Einstein demonstrated through his train thought experiment that because light signals take finite time and travel at speed $c$ in all frames, two spatially separated events that appear simultaneous to an observer on the platform do not appear simultaneous to an observer aboard the moving train.'
      },
      {
        q: '5. What astonishing observation in the 1909–1911 Geiger-Marsden experiment compelled Ernest Rutherford to propose the nuclear model of the atom?',
        options: [
          'All alpha particles were completely absorbed by the gold foil.',
          'Gold foil emitted bright blue fluorescence when hit by X-rays.',
          'Electrons transformed into protons upon impact.',
          'A tiny fraction (about 1 in 8,000) of positively charged alpha particles were back-scattered at angles greater than 90 degrees.'
        ],
        answer: 3,
        expl: 'In Thomson’s diffuse "plum pudding" model, the electric field was far too weak to deflect fast alpha particles significantly. The fact that heavy alpha particles rebounded backward proved that almost all the mass and positive charge of the atom is concentrated in a minuscule central nucleus.'
      },
      {
        q: '6. How did Niels Bohr overcome the classical paradox that an orbiting electron should rapidly radiate its energy and spiral into the nucleus in less than a nanosecond?',
        options: [
          'He claimed electrons move in straight lines rather than circles.',
          'He replaced the Coulomb force with gravitational attraction.',
          'He assumed the nucleus is hollow.',
          'He postulated that electrons inhabit discrete, non-radiating "stationary orbits" with quantized orbital angular momentum ($L = n\\hbar$).'
        ],
        answer: 3,
        expl: 'Bohr broke with classical electrodynamics by postulating that electrons do not radiate while in stationary quantized orbits ($L = n\\hbar$). Radiation is emitted or absorbed only when an electron jumps discontinuously between orbits: $\\Delta E = h\\nu$.'
      },
      {
        q: '7. Louis de Broglie proposed in 1924 that material particles possess wave-like properties. What is the de Broglie wavelength of a particle with momentum $p$?',
        options: [
          '$\\lambda = p / h$',
          '$\\lambda = h c / p^2$',
          '$\\lambda = h / p$',
          '$\\lambda = \\sqrt{h p}$'
        ],
        answer: 2,
        expl: 'de Broglie extended the Planck-Einstein relation for photons ($p = h/\\lambda$) to all matter: any moving particle with momentum $p = mv$ has an associated matter wave with wavelength $\\lambda = h/p$, confirmed by electron diffraction in 1927.'
      },
      {
        q: '8. According to Max Born’s statistical interpretation (1926), what does the square modulus of Schrödinger’s wavefunction, $|\\psi(x, t)|^2$, physically represent?',
        options: [
          'The electric charge density smeared continuously throughout space.',
          'The mechanical mass density of the electron.',
          'The probability per unit volume of finding the particle at position $x$ at time $t$.',
          'The velocity of the electron.'
        ],
        answer: 2,
        expl: 'Born showed that $\\psi$ itself is a probability amplitude; its absolute square $|\\psi(x, t)|^2$ gives the probability density of detecting the localized particle at point $x$ upon measurement.'
      },
      {
        q: '9. What does Werner Heisenberg’s Uncertainty Principle ($\\Delta x \\Delta p \\ge \\hbar/2$) state about physical reality?',
        options: [
          'Nature possesses an intrinsic ontological limit: a quantum particle cannot simultaneously possess a precisely defined position and a precisely defined momentum.',
          'Our measuring instruments are technologically imperfect, but particles possess definite simultaneous positions and momenta in reality.',
          'Quantum particles only exist when they are observed by a conscious human.',
          'Measurement changes the mass of the particle.'
        ],
        answer: 0,
        expl: 'The uncertainty principle is not a limitation of experimental apparatus, but an inescapable property of wave mechanics: because position and momentum are Fourier conjugates, narrowing spatial distribution $\\Delta x$ inherently broadens momentum spread $\\Delta p$.'
      },
      {
        q: '10. What historical observation during the May 29, 1919 total solar eclipse led by Arthur Eddington confirmed Einstein’s General Theory of Relativity?',
        options: [
          'The sun’s corona was composed of ionized helium.',
          'The speed of light slowed down inside the sun’s shadow.',
          'Light rays from stars passing near the edge of the darkened sun were deflected by the sun’s gravitational field by close to the 1.75 arcseconds predicted by general relativity — about twice the Newtonian value.',
          'Mercury’s orbit became circular during the eclipse.'
        ],
        answer: 2,
        expl: 'Eddington’s expeditions to Príncipe and Sobral measured the deflection of starlight grazing the sun ($1.75$ arcseconds), twice the Newtonian corpuscular value, triumphantly proving that gravity is the geometric curvature of spacetime.'
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
          if (userAnswers[qIdx] !== null) return;
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
