/**
 * Figures for Part 5: Keepers and Builders of Knowledge
 * RNLearn - Long-form Learning & Essays
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  /* -------------------------------------------------------------------------
   * Figure 1: Ibn al-Haytham’s Camera Obscura & Ray Optics
   * ------------------------------------------------------------------------- */
  FIG['fig-al-haytham-optics'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-optics-lamp1">Height of lamp 1: ' +
            '<span id="fig-optics-lamp1-val" class="fig-readout">High</span>' +
          '</label>' +
          '<input type="range" id="fig-optics-lamp1" min="-60" max="-10" step="5" value="-40">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label for="fig-optics-lamp2">Height of lamp 2: ' +
            '<span id="fig-optics-lamp2-val" class="fig-readout">Low</span>' +
          '</label>' +
          '<input type="range" id="fig-optics-lamp2" min="10" max="60" step="5" value="40">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="checkbox" id="fig-optics-block" style="margin-right:0.4rem;"> Cover lamp 1</label>' +
          '<span style="font-size:0.85rem; color:var(--color-text-muted, #666); margin-left:1rem;">(Tests ray independence)</span>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-optics-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-optics-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider1 = container.querySelector('#fig-optics-lamp1');
    var slider2 = container.querySelector('#fig-optics-lamp2');
    var val1 = container.querySelector('#fig-optics-lamp1-val');
    var val2 = container.querySelector('#fig-optics-lamp2-val');
    var checkBlock = container.querySelector('#fig-optics-block');
    var svg = container.querySelector('#fig-optics-svg');
    var explain = container.querySelector('#fig-optics-explain');

    function draw() {
      var y1 = parseInt(slider1.value, 10);
      var y2 = parseInt(slider2.value, 10);
      var isBlocked = checkBlock.checked;

      val1.textContent = y1 < -35 ? 'High (y = ' + y1 + ')' : 'Mid-High (y = ' + y1 + ')';
      val2.textContent = y2 > 35 ? 'Low (y = ' + y2 + ')' : 'Mid-Low (y = ' + y2 + ')';

      var pinX = 250;
      var pinY = 180;
      var lampX = 80;
      var screenX = 460;

      // Lamp positions
      var l1x = lampX, l1y = pinY + y1;
      var l2x = lampX, l2y = pinY + y2;

      // Straight rays passing through pinhole (pinX, pinY)
      // Ray 1 slope: (pinY - l1y) / (pinX - l1x) = -y1 / (pinX - lampX)
      // Screen intersection: y_screen = pinY + slope * (screenX - pinX)
      var slope1 = (pinY - l1y) / (pinX - l1x);
      var screen1Y = pinY + slope1 * (screenX - pinX);

      var slope2 = (pinY - l2y) / (pinX - l2x);
      var screen2Y = pinY + slope2 * (screenX - pinX);

      var svgContent =
        '<defs>' +
          '<radialGradient id="lamp1Glow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#f59e0b" stop-opacity="1"/>' +
            '<stop offset="40%" stop-color="#ef4444" stop-opacity="0.8"/>' +
            '<stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>' +
          '</radialGradient>' +
          '<radialGradient id="lamp2Glow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#38bdf8" stop-opacity="1"/>' +
            '<stop offset="40%" stop-color="#3b82f6" stop-opacity="0.8"/>' +
            '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Outside environment (Light) -->' +
        '<rect x="0" y="0" width="' + pinX + '" height="360" fill="rgba(244, 244, 245, 0.4)"/>' +
        '<!-- Dark chamber (al-bayt al-muthlim) -->' +
        '<rect x="' + pinX + '" y="0" width="' + (540 - pinX) + '" height="360" fill="#18181b"/>' +
        '<!-- Dark Chamber Partition Wall -->' +
        '<line x1="' + pinX + '" y1="0" x2="' + pinX + '" y2="' + (pinY - 8) + '" stroke="#52525b" stroke-width="8"/>' +
        '<line x1="' + pinX + '" y1="' + (pinY + 8) + '" x2="' + pinX + '" y2="360" stroke="#52525b" stroke-width="8"/>' +
        '<!-- Pinhole (thuqbah) label -->' +
        '<text x="' + (pinX - 12) + '" y="' + (pinY - 14) + '" font-size="11" fill="currentColor" text-anchor="end" font-weight="600">Pinhole (thuqbah)</text>' +
        '<!-- Dark chamber label -->' +
        '<text x="' + (pinX + 16) + '" y="28" font-size="12" fill="#a1a1aa" font-weight="600">Al-Bayt al-Muthlim (Darkened Room)</text>' +
        '<!-- White Screen on right wall -->' +
        '<line x1="' + screenX + '" y1="40" x2="' + screenX + '" y2="320" stroke="#f4f4f5" stroke-width="4"/>' +
        '<text x="' + (screenX + 8) + '" y="180" font-size="11" fill="#f4f4f5" transform="rotate(90, ' + (screenX + 8) + ', 180)">White Screen</text>';

      // Obstacle block if checked
      if (isBlocked) {
        svgContent +=
          '<!-- Barrier blocking lamp 1 -->' +
          '<rect x="150" y="' + (l1y - 25) + '" width="8" height="50" fill="#71717a" stroke="#27272a"/>' +
          '<text x="146" y="' + (l1y - 30) + '" font-size="10" fill="#ef4444" text-anchor="end" font-weight="600">Opaque Barrier</text>';
      }

      // Lamp 1 (Red/Amber flame)
      svgContent +=
        '<!-- Lamp 1 Flame -->' +
        '<circle cx="' + l1x + '" cy="' + l1y + '" r="16" fill="url(#lamp1Glow)"/>' +
        '<circle cx="' + l1x + '" cy="' + l1y + '" r="4" fill="#fff"/>' +
        '<text x="' + (l1x - 12) + '" y="' + (l1y + 4) + '" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="end">Lamp 1</text>';

      // Ray 1
      if (!isBlocked) {
        svgContent +=
          '<!-- Light Rays from Lamp 1 through pinhole -->' +
          '<line x1="' + l1x + '" y1="' + l1y + '" x2="' + pinX + '" y2="' + pinY + '" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.9"/>' +
          '<line x1="' + pinX + '" y1="' + pinY + '" x2="' + screenX + '" y2="' + screen1Y.toFixed(1) + '" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.9"/>' +
          '<!-- Projected Spot 1 on Screen -->' +
          '<circle cx="' + screenX + '" cy="' + screen1Y.toFixed(1) + '" r="6" fill="#f59e0b"/>' +
          '<text x="' + (screenX - 12) + '" y="' + (screen1Y + 4).toFixed(1) + '" font-size="11" font-weight="600" fill="#f59e0b" text-anchor="end">Spot 1 (Inverted to Bottom)</text>';
      } else {
        svgContent +=
          '<!-- Blocked ray 1 -->' +
          '<line x1="' + l1x + '" y1="' + l1y + '" x2="150" y2="' + l1y + '" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3"/>';
      }

      // Lamp 2 (Blue flame)
      svgContent +=
        '<!-- Lamp 2 Flame -->' +
        '<circle cx="' + l2x + '" cy="' + l2y + '" r="16" fill="url(#lamp2Glow)"/>' +
        '<circle cx="' + l2x + '" cy="' + l2y + '" r="4" fill="#fff"/>' +
        '<text x="' + (l2x - 12) + '" y="' + (l2y + 4) + '" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="end">Lamp 2</text>' +
        '<!-- Light Rays from Lamp 2 through pinhole -->' +
        '<line x1="' + l2x + '" y1="' + l2y + '" x2="' + pinX + '" y2="' + pinY + '" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>' +
        '<line x1="' + pinX + '" y1="' + pinY + '" x2="' + screenX + '" y2="' + screen2Y.toFixed(1) + '" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.9"/>' +
        '<!-- Projected Spot 2 on Screen -->' +
        '<circle cx="' + screenX + '" cy="' + screen2Y.toFixed(1) + '" r="6" fill="#38bdf8"/>' +
        '<text x="' + (screenX - 12) + '" y="' + (screen2Y + 4).toFixed(1) + '" font-size="11" font-weight="600" fill="#38bdf8" text-anchor="end">Spot 2 (Inverted to Top)</text>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Ibn al-Haytham’s Definitive Experiment (<em>Kitāb al-Manāẓir</em>, c. 1021 CE):</strong> ' +
        'By aligning multiple oil lamps outside a small pinhole into a totally dark room, Ibn al-Haytham observed two crucial facts: ' +
        '1) The rays cross at the pinhole without colliding, scattering, or blending their colours—each light spot arrives intact and inverted on the screen. ' +
        (isBlocked
          ? '2) <strong style="color:#ef4444;">When Lamp 1 is screened, Spot 1 vanishes instantly, while Spot 2 remains completely undisturbed!</strong> This proved that light travels independently from each luminous point along straight rectilinear paths (*al-khuṭūṭ al-shuʿāʿiyyah*), decisively falsifying both the ancient Greek emission theory (visual rays shooting from the eyes) and Aristotle’s medium-excitation model.'
          : '2) When both lamps are unblocked, the higher lamp (Amber) projects to the bottom, and the lower lamp (Cyan) projects to the top. Try blocking Lamp 1 with the checkbox to observe ray independence.');
    }

    slider1.addEventListener('input', draw);
    slider2.addEventListener('input', draw);
    checkBlock.addEventListener('change', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 2: Al-Bīrūnī’s Mountain Dip Geodesy
   * ------------------------------------------------------------------------- */
  FIG['fig-biruni-radius'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-biruni-h">Height of the hill (h): ' +
            '<span id="fig-biruni-h-val" class="fig-readout">h = 650 cubits (≈ 325 m)</span>' +
          '</label>' +
          '<input type="range" id="fig-biruni-h" min="100" max="1000" step="25" value="650">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label for="fig-biruni-dip">How far the horizon dips below level (α): ' +
            '<span id="fig-biruni-dip-val" class="fig-readout">α = 0° 34\' (0.567°)</span>' +
          '</label>' +
          '<input type="range" id="fig-biruni-dip" min="20" max="50" step="1" value="34">' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-biruni-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-biruni-readout" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var hSlider = container.querySelector('#fig-biruni-h');
    var dipSlider = container.querySelector('#fig-biruni-dip');
    var hVal = container.querySelector('#fig-biruni-h-val');
    var dipVal = container.querySelector('#fig-biruni-dip-val');
    var svg = container.querySelector('#fig-biruni-svg');
    var readout = container.querySelector('#fig-biruni-readout');

    function draw() {
      var hCubits = parseInt(hSlider.value, 10);
      var dipMinutes = parseInt(dipSlider.value, 10);
      var dipDeg = dipMinutes / 60;
      var dipRad = dipDeg * Math.PI / 180;

      // In historical Nandana measurements:
      // 1 Arabian cubit (dhira') ≈ 0.525 m.
      var hMeters = hCubits * 0.525;
      hVal.textContent = hCubits + ' cubits (' + hMeters.toFixed(1) + ' m)';
      dipVal.textContent = '0° ' + dipMinutes + '\' (' + dipDeg.toFixed(3) + '°)';

      // Formula: cos(alpha) = R / (R + h)
      // R * cos(alpha) + h * cos(alpha) = R
      // R = (h * cos(alpha)) / (1 - cos(alpha))
      var cosAlpha = Math.cos(dipRad);
      var R_meters = (hMeters * cosAlpha) / (1 - cosAlpha);
      var R_km = R_meters / 1000;
      var modernRadius = 6371; // km
      var errorPct = ((R_km - modernRadius) / modernRadius * 100).toFixed(2);

      readout.innerHTML =
        '<div style="background:var(--color-surface, #fff); border:1px solid var(--color-border, #e5e7eb); border-radius:6px; padding:0.8rem; margin-bottom:0.5rem;">' +
          '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">' +
            '<div>' +
              '<span style="color:var(--color-text-muted, #666); font-size:0.85rem;">Calculated Earth Radius (R):</span><br>' +
              '<strong style="font-size:1.25rem; color:#10b981;">' + Math.round(R_km).toLocaleString() + ' km</strong> ' +
              '(' + Math.round(R_meters / 0.525).toLocaleString() + ' cubits)' +
            '</div>' +
            '<div>' +
              '<span style="color:var(--color-text-muted, #666); font-size:0.85rem;">Comparison to Modern Mean Radius (6,371 km):</span><br>' +
              '<strong style="font-size:1.15rem; color:' + (Math.abs(errorPct) < 2 ? '#10b981' : '#f59e0b') + ';">' +
                (errorPct > 0 ? '+' : '') + errorPct + '% discrepancy' +
              '</strong>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<strong>Al-Bīrūnī’s method (Nandana Fort, c. 1020s):</strong> ' +
        'Instead of surveying a long north–south baseline, as al-Ma’mūn’s teams had done, al-Bīrūnī used a mountain of known height overlooking a flat plain and measured the tiny dip angle $\\alpha$ of the horizon below the true horizontal. The formula $R = \\frac{h \\cos \\alpha}{1 - \\cos \\alpha}$ then gives the Earth’s radius. Try the slider: a dip of 34′ with this height gives about 7,000 km, while al-Bīrūnī’s own figures convert to about 6,340 km — the angle is so small that tiny measurement errors and atmospheric refraction change the answer a great deal.';

      // SVG schematic
      var cx = 160, cy = 480, R_pix = 340;
      var peakX = cx, peakY = cy - R_pix - 45; // mountain peak
      var horizX2 = 480, horizY2 = peakY; // astronomical horizontal line
      // Line of sight from the peak, drawn as a true tangent to the circle (the dip is exaggerated by the tall mountain)
      var vizRad = Math.acos(R_pix / (cy - peakY));
      var tangLen = Math.sqrt(Math.pow(cy - peakY, 2) - R_pix * R_pix);
      var tx = peakX + tangLen * Math.cos(vizRad);
      var ty = peakY + tangLen * Math.sin(vizRad);

      var svgContent =
        '<defs>' +
          '<radialGradient id="earthGrad" cx="50%" cy="50%" r="50%">' +
            '<stop offset="70%" stop-color="#3b82f6" stop-opacity="0.15"/>' +
            '<stop offset="100%" stop-color="#10b981" stop-opacity="0.3"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Earth curvature arc -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R_pix + '" fill="url(#earthGrad)" stroke="#10b981" stroke-width="2.5"/>' +
        '<!-- Earth Center Point O -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="currentColor"/>' +
        '<text x="' + (cx - 8) + '" y="352" font-size="11" font-weight="600" fill="currentColor" text-anchor="end">↓ to Earth’s centre, O</text>' +
        '<!-- Mountain Triangle at top -->' +
        '<polygon points="' + (peakX - 18) + ',' + (cy - R_pix) + ' ' + (peakX + 18) + ',' + (cy - R_pix) + ' ' + peakX + ',' + peakY + '" ' +
                 'fill="#d97706" stroke="#92400e" stroke-width="1.5"/>' +
        '<text x="' + (peakX - 16) + '" y="' + (peakY + 30) + '" font-size="11" font-weight="bold" fill="#b45309" text-anchor="end">Mountain (h)</text>' +
        '<!-- Radius line from center to mountain base -->' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + peakX + '" y2="' + (cy - R_pix) + '" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>' +
        '<text x="' + (cx - 16) + '" y="' + (cy - R_pix/2) + '" font-size="12" fill="currentColor" font-weight="600">R</text>' +
        '<!-- Astronomical horizontal line from peak -->' +
        '<line x1="' + peakX + '" y1="' + peakY + '" x2="' + horizX2 + '" y2="' + horizY2 + '" stroke="#71717a" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        '<text x="' + horizX2 + '" y="' + (horizY2 - 8) + '" font-size="11" fill="#71717a" text-anchor="end">True horizontal</text>' +
        '<!-- Line of sight tangent to Earth curvature -->' +
        '<line x1="' + peakX + '" y1="' + peakY + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="#ef4444" stroke-width="2.5"/>' +
        '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="4" fill="#ef4444"/>' +
        '<text x="' + (tx + 14).toFixed(1) + '" y="' + (ty + 4).toFixed(1) + '" font-size="11" font-weight="bold" fill="#ef4444">Visible horizon (T)</text>' +
        '<!-- Radius line from center to tangent point T -->' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="#10b981" stroke-width="1.8" stroke-dasharray="3 3"/>' +
        '<text x="' + (cx + (tx - cx)/2 + 10).toFixed(1) + '" y="' + (cy + (ty - cy)/2).toFixed(1) + '" font-size="12" fill="#10b981" font-weight="600">R</text>' +
        '<!-- Right-angle mark at T -->' +
        '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="8" fill="none" stroke="#ef4444" stroke-width="1"/>' +
        '<!-- Dip angle arc at mountain peak -->' +
        '<path d="M ' + (peakX + 45) + ' ' + peakY + ' A 45 45 0 0 1 ' + (peakX + 45 * Math.cos(vizRad)).toFixed(1) + ' ' + (peakY + 45 * Math.sin(vizRad)).toFixed(1) + '" ' +
              'fill="none" stroke="#ef4444" stroke-width="2"/>' +
        '<text x="' + (peakX + 54) + '" y="' + (peakY + 16) + '" font-size="13" font-weight="bold" fill="#ef4444">α (Dip Angle)</text>' +
        '<!-- Mathematical formula panel on right -->' +
        '<g transform="translate(350, 205)">' +
          '<rect x="0" y="0" width="175" height="110" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="11" font-weight="bold" fill="currentColor">Triangle OTP is Right-Angled:</text>' +
          '<text x="12" y="44" font-size="11" fill="currentColor">cos(α) = OT / OP = R / (R + h)</text>' +
          '<text x="12" y="66" font-size="11" fill="currentColor">R · cos(α) + h · cos(α) = R</text>' +
          '<text x="12" y="92" font-size="12" font-weight="bold" fill="#10b981">R = (h cos α) / (1 - cos α)</text>' +
        '</g>';

      svg.innerHTML = svgContent;
    }

    hSlider.addEventListener('input', draw);
    dipSlider.addEventListener('input', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 3: Mādhava’s Infinite Series Convergence
   * ------------------------------------------------------------------------- */
  FIG['fig-madhava-series'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-madhava-terms">Number of terms added: ' +
            '<span id="fig-madhava-terms-val" class="fig-readout">n = 10 terms</span>' +
          '</label>' +
          '<input type="range" id="fig-madhava-terms" min="1" max="40" step="1" value="10">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="checkbox" id="fig-madhava-correction" checked style="margin-right:0.4rem;"> Add Mādhava’s correction (<em>antya-saṁskāra</em>)</label>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-madhava-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-madhava-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-madhava-terms');
    var valReadout = container.querySelector('#fig-madhava-terms-val');
    var checkCorr = container.querySelector('#fig-madhava-correction');
    var svg = container.querySelector('#fig-madhava-svg');
    var explain = container.querySelector('#fig-madhava-explain');

    function draw() {
      var n = parseInt(slider.value, 10);
      var useCorr = checkCorr.checked;
      valReadout.textContent = 'n = ' + n + ' terms';

      // Leibniz-Madhava raw series: pi/4 = sum_{k=0}^{n-1} (-1)^k / (2k + 1)
      // pi_raw = 4 * sum
      var sum = 0;
      var pointsRaw = [];
      var pointsCorr = [];

      for (var k = 0; k < n; k++) {
        var term = (k % 2 === 0 ? 1 : -1) / (2 * k + 1);
        sum += term;
        var curRaw = 4 * sum;
        pointsRaw.push({ n: k + 1, val: curRaw });

        // Madhava correction factor for sum up to k:
        // C(k) = (k+1) / (4(k+1)^2 + 1)
        // Correction applied to (-1)^k / (2k+1) is: - (-1)^k * correction
        var m = k + 1; // number of terms evaluated
        var lastSign = (k % 2 === 0 ? 1 : -1);
        // Madhava 3rd correction term: C_n = (n^2 + 1) / (4n^3 + 5n) or 1 / (4n)
        var corr = (m * m + 1) / (4 * Math.pow(m, 3) + 5 * m);
        var curCorr = 4 * (sum - lastSign * corr);
        pointsCorr.push({ n: k + 1, val: curCorr });
      }

      var finalRaw = pointsRaw[n - 1].val;
      var finalCorr = pointsCorr[n - 1].val;
      var truePi = Math.PI;

      var svgContent =
        '<!-- Background grid -->' +
        '<rect x="0" y="0" width="540" height="360" fill="transparent"/>' +
        '<!-- True Pi reference line (y = 3.14159) -->' +
        '<line x1="50" y1="180" x2="510" y2="180" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4"/>' +
        '<text x="508" y="172" font-size="11" fill="#10b981" font-weight="bold" text-anchor="end">True π ≈ 3.14159</text>' +
        '<!-- Axes -->' +
        '<line x1="50" y1="20" x2="50" y2="330" stroke="var(--color-border, #ccc)" stroke-width="1.5"/>' +
        '<line x1="50" y1="330" x2="510" y2="330" stroke="var(--color-border, #ccc)" stroke-width="1.5"/>' +
        '<text x="500" y="348" font-size="11" fill="var(--color-text-muted, #777)" text-anchor="end">Number of Terms (k)</text>' +
        '<text x="20" y="30" font-size="11" fill="var(--color-text-muted, #777)">Value</text>';

      // Coordinate scaling
      // X-range: 1 to Math.max(10, n)
      // Y-range: 2.5 to 4.0
      var maxN = Math.max(10, n);
      function mapX(k) { return 60 + ((k - 1) / (maxN - 1)) * 430; }
      function mapY(v) { return 180 - (v - truePi) * 260; }

      // Y-ticks
      var yTicks = [3.6, 3.14159, 2.8];
      for (var t = 0; t < yTicks.length; t++) {
        var yVal = yTicks[t];
        var yPix = mapY(yVal);
        svgContent +=
          '<line x1="45" y1="' + yPix.toFixed(1) + '" x2="50" y2="' + yPix.toFixed(1) + '" stroke="var(--color-border, #aaa)"/>' +
          '<text x="40" y="' + (yPix + 4).toFixed(1) + '" font-size="10" fill="var(--color-text-muted, #666)" text-anchor="end">' + yVal.toFixed(2) + '</text>';
      }

      // Plot raw points and connecting line
      var rawPathD = [];
      for (var i = 0; i < pointsRaw.length; i++) {
        var rx = mapX(pointsRaw[i].n);
        var ry = mapY(pointsRaw[i].val);
        rawPathD.push((i === 0 ? 'M ' : 'L ') + rx.toFixed(1) + ' ' + ry.toFixed(1));
      }
      svgContent +=
        '<!-- Raw alternating series line -->' +
        '<path d="' + rawPathD.join(' ') + '" fill="none" stroke="#ef4444" stroke-width="2"/>';

      for (var j = 0; j < pointsRaw.length; j++) {
        var px = mapX(pointsRaw[j].n);
        var py = mapY(pointsRaw[j].val);
        svgContent += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3" fill="#ef4444"/>';
      }

      // Plot corrected points if enabled
      if (useCorr) {
        var corrPathD = [];
        for (var c = 0; c < pointsCorr.length; c++) {
          var cx = mapX(pointsCorr[c].n);
          var cy = mapY(pointsCorr[c].val);
          corrPathD.push((c === 0 ? 'M ' : 'L ') + cx.toFixed(1) + ' ' + cy.toFixed(1));
        }
        svgContent +=
          '<!-- Madhava corrected series line -->' +
          '<path d="' + corrPathD.join(' ') + '" fill="none" stroke="#3b82f6" stroke-width="2.5"/>';

        for (var d = 0; d < pointsCorr.length; d++) {
          var pcx = mapX(pointsCorr[d].n);
          var pcy = mapY(pointsCorr[d].val);
          svgContent += '<circle cx="' + pcx.toFixed(1) + '" cy="' + pcy.toFixed(1) + '" r="4" fill="#3b82f6"/>';
        }
      }

      // Legend in top right
      svgContent +=
        '<g transform="translate(250, 30)">' +
          '<rect x="0" y="0" width="240" height="75" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<line x1="12" y1="22" x2="32" y2="22" stroke="#ef4444" stroke-width="2.5"/>' +
          '<circle cx="22" cy="22" r="3" fill="#ef4444"/>' +
          '<text x="40" y="26" font-size="11" fill="currentColor">Raw Gregory-Leibniz Series</text>' +
          '<line x1="12" y1="46" x2="32" y2="46" stroke="#3b82f6" stroke-width="2.5"/>' +
          '<circle cx="22" cy="46" r="3.5" fill="#3b82f6"/>' +
          '<text x="40" y="50" font-size="11" font-weight="600" fill="#3b82f6">Mādhava with Correction Term</text>' +
          '<text x="12" y="68" font-size="10" fill="var(--color-text-muted, #777)">Error at n=' + n + ': ' +
            (useCorr ? Math.abs(finalCorr - truePi).toExponential(3) : Math.abs(finalRaw - truePi).toFixed(4)) +
          '</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Mādhava of Sangamagrāma (c. 1340–1425 CE, Kerala School):</strong> ' +
        'Two and a half centuries before James Gregory (1671) and Gottfried Wilhelm Leibniz (1673), Indian astronomers formulated the infinite series ' +
        '$\\frac{\\pi}{4} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\dots$ ' +
        'Because this alternating series converges painfully slowly (requiring 5,000 terms to get 3 decimal places), Mādhava introduced brilliant fast-converging correction terms (*antya-saṁskāra*), such as $C_n = \\frac{n^2 + 1}{4n^3 + 5n}$. ' +
        (useCorr
          ? '<span style="color:#3b82f6; font-weight:600;">With Mādhava’s correction factor, just 10 terms yield $\\pi \\approx ' + finalCorr.toFixed(6) + '$ (error &lt; 0.000004)!</span>'
          : '<span style="color:#ef4444;">Without correction, 10 terms oscillate wildly: $\\pi \\approx ' + finalRaw.toFixed(4) + '$. Check the box to activate Mādhava’s correction.</span>');
    }

    slider.addEventListener('input', draw);
    checkCorr.addEventListener('change', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 4: Su Song’s Astronomical Clock Escapement (1092 CE)
   * ------------------------------------------------------------------------- */
  FIG['fig-su-song-clock'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-clock-flow">How fast the water flows: ' +
            '<span id="fig-clock-flow-val" class="fig-readout">Normal Flow</span>' +
          '</label>' +
          '<input type="range" id="fig-clock-flow" min="1" max="4" step="1" value="2">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-clock-btn-trip" class="fig-btn">Manually Trip Bucket Release →</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-clock-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-clock-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var flowSlider = container.querySelector('#fig-clock-flow');
    var flowVal = container.querySelector('#fig-clock-flow-val');
    var btnTrip = container.querySelector('#fig-clock-btn-trip');
    var svg = container.querySelector('#fig-clock-svg');
    var explain = container.querySelector('#fig-clock-explain');

    var waterLevel = 0.3; // 0.0 to 1.0
    var wheelAngle = 0; // degrees
    var isTripping = false;

    function renderClock() {
      var cx = 200, cy = 180, R = 110;

      var svgContent =
        '<!-- Reservoir & Constant-Level Tank -->' +
        '<rect x="30" y="30" width="80" height="70" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="2"/>' +
        '<text x="70" y="24" font-size="11" font-weight="600" fill="#3b82f6" text-anchor="middle">Water Sump</text>' +
        '<!-- Siphon pouring water -->' +
        '<path d="M 110 75 Q 140 75 140 105 L 140 120" fill="none" stroke="#38bdf8" stroke-width="4"/>' +
        '<!-- Falling water drops stream -->' +
        '<line x1="140" y1="120" x2="140" y2="155" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 3"/>' +

        '<!-- Escapement Wheel (Rotating) -->' +
        '<g transform="rotate(' + wheelAngle.toFixed(1) + ', ' + cx + ', ' + cy + ')">' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="rgba(100, 116, 139, 0.08)" stroke="currentColor" stroke-width="2"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="currentColor"/>';

      // 8 Spokes with pivoting scoop buckets
      for (var i = 0; i < 8; i++) {
        var a = (i * 45) * Math.PI / 180;
        var bx = cx + R * Math.cos(a);
        var by = cy + R * Math.sin(a);
        svgContent +=
          '<line x1="' + cx + '" y1="' + cy + '" x2="' + bx.toFixed(1) + '" y2="' + by.toFixed(1) + '" stroke="currentColor" stroke-width="1.5"/>' +
          '<!-- Bucket Scoop -->' +
          '<rect x="' + (bx - 12).toFixed(1) + '" y="' + (by - 12).toFixed(1) + '" width="24" height="24" rx="4" ' +
                'fill="' + (i === 0 ? 'rgba(56, 189, 248, ' + (0.2 + waterLevel * 0.7).toFixed(2) + ')' : 'rgba(100, 116, 139, 0.2)') + '" ' +
                'stroke="currentColor" stroke-width="1.5"/>';
      }
      svgContent += '</g>';

      // Escapement levers (trip lever and balancing counterweight)
      var tripY = isTripping ? 165 : 155;
      svgContent +=
        '<!-- Upper Stop Lever (Holding Dog) -->' +
        '<line x1="180" y1="65" x2="200" y2="' + (cy - R) + '" stroke="#ef4444" stroke-width="4"/>' +
        '<circle cx="180" cy="65" r="4" fill="#ef4444"/>' +
        '<text x="175" y="55" font-size="10" font-weight="bold" fill="#ef4444">Upper Stop Lock</text>' +

        '<!-- Tipping Balance Beam (Weighbridge) -->' +
        '<g transform="translate(130, 240)">' +
          '<line x1="-30" y1="0" x2="30" y2="' + (isTripping ? -10 : 0) + '" stroke="#f59e0b" stroke-width="3.5"/>' +
          '<polygon points="0,0 -8,15 8,15" fill="#f59e0b"/>' +
          '<!-- Counterweight -->' +
          '<circle cx="-28" cy="0" r="7" fill="#92400e"/>' +
          '<text x="-32" y="16" font-size="9" fill="#92400e">Counterweight</text>' +
        '</g>' +

        '<!-- Explanatory legend panel on right -->' +
        '<g transform="translate(340, 40)">' +
          '<rect x="0" y="0" width="185" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Su Song’s Clock (1092 CE)</text>' +
          '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="11" fill="currentColor">World’s earliest mechanical</text>' +
          '<text x="12" y="70" font-size="11" font-weight="600" fill="#3b82f6">clock escapement mechanism.</text>' +
          '<line x1="12" y1="85" x2="173" y2="85" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="105" font-size="11" fill="currentColor">1. Constant water trickle</text>' +
          '<text x="12" y="121" font-size="11" fill="currentColor">fills waiting scoop bucket.</text>' +
          '<text x="12" y="145" font-size="11" fill="currentColor">2. Current Bucket Fill:</text>' +
          '<rect x="12" y="155" width="160" height="12" rx="3" fill="#e5e7eb"/>' +
          '<rect x="12" y="155" width="' + (waterLevel * 160).toFixed(0) + '" height="12" rx="3" fill="#38bdf8"/>' +
          '<text x="12" y="185" font-size="11" fill="currentColor">3. When full, weight trips</text>' +
          '<text x="12" y="201" font-size="11" fill="currentColor">balance lever, releasing</text>' +
          '<text x="12" y="217" font-size="11" font-weight="600" fill="#ef4444">wheel to advance 1 spoke!</text>' +
          '<line x1="12" y1="230" x2="173" y2="230" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="248" font-size="10" fill="var(--color-text-muted, #777)">Drives armillary sphere above.</text>' +
        '</g>';

      svg.innerHTML = svgContent;
    }

    function trip() {
      isTripping = true;
      waterLevel = 0.0;
      wheelAngle += 45;
      renderClock();
      setTimeout(function () {
        isTripping = false;
        renderClock();
      }, 400);
    }

    btnTrip.addEventListener('click', trip);

    // Auto fill cycle
    var clockTimer = setInterval(function () {
      var rate = parseInt(flowSlider.value, 10) * 0.05;
      waterLevel += rate;
      if (waterLevel >= 1.0) {
        trip();
      } else {
        renderClock();
      }
    }, 250);

    explain.innerHTML =
      '<strong>Su Song’s Astronomical Clock Tower (Kaifeng, 1092 CE):</strong> ' +
      'Standing over 12 metres tall, Su Song’s water-powered clock was the crown jewel of Song Dynasty technology. ' +
      'It housed a bronze armillary sphere tracking the stars and a celestial globe, driven continuously by a water wheel governed by an <em>escapement balance beam</em>. ' +
      'Water trickled at a constant rate into a scoop until its weight overcame a counterweight, tripping the release mechanism and advancing the wheel by exactly one bucket spoke—converting fluid hydrostatic flow into discrete, periodic mechanical seconds.';

    renderClock();
  };

  /* -------------------------------------------------------------------------
   * Figure 5: Nicole Oresme & The Mean Speed Theorem
   * ------------------------------------------------------------------------- */
  FIG['fig-oresme-speed'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-oresme-accel">Final speed: ' +
            '<span id="fig-oresme-accel-val" class="fig-readout">v₁ = 80 m/s</span>' +
          '</label>' +
          '<input type="range" id="fig-oresme-accel" min="20" max="100" step="5" value="80">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="checkbox" id="fig-oresme-shear" checked style="margin-right:0.4rem;"> Show Oresme’s triangle-to-rectangle move</label>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-oresme-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-oresme-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-oresme-accel');
    var valReadout = container.querySelector('#fig-oresme-accel-val');
    var checkShear = container.querySelector('#fig-oresme-shear');
    var svg = container.querySelector('#fig-oresme-svg');
    var explain = container.querySelector('#fig-oresme-explain');

    function draw() {
      var v1 = parseInt(slider.value, 10);
      var v0 = 0; // starts from rest
      var vMean = (v0 + v1) / 2;
      var showShear = checkShear.checked;

      valReadout.textContent = 'v₁ = ' + v1 + ' units (Mean Speed = ' + vMean + ' units)';

      var originX = 80, originY = 300;
      var timeWidth = 260; // total duration T
      var maxHeight = 220; // max velocity pixel height

      var v1Pix = (v1 / 100) * maxHeight;
      var vMeanPix = v1Pix / 2;

      var svgContent =
        '<defs>' +
          '<pattern id="oresmeGrid" width="10" height="10" patternUnits="userSpaceOnUse">' +
            '<path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>' +
          '</pattern>' +
        '</defs>' +
        '<rect x="0" y="0" width="540" height="360" fill="url(#oresmeGrid)"/>' +
        '<!-- Axes -->' +
        '<line x1="' + originX + '" y1="' + (originY + 10) + '" x2="' + originX + '" y2="' + (originY - maxHeight - 20) + '" stroke="currentColor" stroke-width="1.8"/>' +
        '<line x1="' + (originX - 10) + '" y1="' + originY + '" x2="' + (originX + timeWidth + 40) + '" y2="' + originY + '" stroke="currentColor" stroke-width="1.8"/>' +
        '<text x="' + (originX + timeWidth + 35) + '" y="' + (originY + 18) + '" font-size="12" font-weight="600" fill="currentColor">Time (t)</text>' +
        '<text x="' + (originX - 12) + '" y="' + (originY - maxHeight - 15) + '" font-size="12" font-weight="600" fill="currentColor" text-anchor="end">Velocity (v)</text>' +

        '<!-- Uniform acceleration velocity line (Hypotenuse) -->' +
        '<line x1="' + originX + '" y1="' + originY + '" x2="' + (originX + timeWidth) + '" y2="' + (originY - v1Pix) + '" stroke="#ef4444" stroke-width="3"/>' +

        '<!-- Shaded Triangle of accelerated motion -->' +
        '<polygon points="' + originX + ',' + originY + ' ' + (originX + timeWidth) + ',' + originY + ' ' + (originX + timeWidth) + ',' + (originY - v1Pix) + '" ' +
                 'fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1.5"/>' +

        '<!-- Mean Velocity Horizontal Line -->' +
        '<line x1="' + originX + '" y1="' + (originY - vMeanPix) + '" x2="' + (originX + timeWidth) + '" y2="' + (originY - vMeanPix) + '" ' +
              'stroke="#3b82f6" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<text x="' + (originX - 8) + '" y="' + (originY - vMeanPix + 4) + '" font-size="11" font-weight="bold" fill="#3b82f6" text-anchor="end">v_mean = ' + vMean + '</text>' +
        '<text x="' + (originX - 8) + '" y="' + (originY - v1Pix + 4) + '" font-size="11" font-weight="bold" fill="#ef4444" text-anchor="end">v₁ = ' + v1 + '</text>';

      // Shearing demonstration
      if (showShear) {
        var midX = originX + timeWidth / 2;
        var midY = originY - vMeanPix;

        svgContent +=
          '<!-- Top excess triangle being sheared -->' +
          '<polygon points="' + midX + ',' + midY + ' ' + (originX + timeWidth) + ',' + midY + ' ' + (originX + timeWidth) + ',' + (originY - v1Pix) + '" ' +
                   'fill="rgba(245, 158, 11, 0.35)" stroke="#f59e0b" stroke-width="1.5"/>' +
          '<!-- Missing bottom triangle receiving the shear -->' +
          '<polygon points="' + originX + ',' + originY + ' ' + midX + ',' + midY + ' ' + originX + ',' + midY + '" ' +
                   'fill="rgba(59, 130, 246, 0.25)" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3 2"/>' +
          '<!-- Curved arrow showing shear transfer -->' +
          '<path d="M ' + (originX + timeWidth * 0.75) + ' ' + (originY - vMeanPix - 15) + ' Q ' + midX + ' ' + (originY - vMeanPix - 45) + ' ' + (originX + timeWidth * 0.25) + ' ' + (originY - vMeanPix + 15) + '" ' +
                'fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>';
      }

      // Mathematical derivation card on the right
      svgContent +=
        '<g transform="translate(365, 50)">' +
          '<rect x="0" y="0" width="165" height="240" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Merton Rule (1330s)</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="11" fill="currentColor">Nicole Oresme proved</text>' +
          '<text x="12" y="70" font-size="11" fill="currentColor">that Distance traveled</text>' +
          '<text x="12" y="86" font-size="11" font-weight="bold" fill="#ef4444">= Area Under Curve!</text>' +
          '<line x1="12" y1="102" x2="153" y2="102" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="122" font-size="11" fill="currentColor">Triangle Area:</text>' +
          '<text x="12" y="138" font-size="11" fill="#ef4444">½ × Base × Height</text>' +
          '<text x="12" y="154" font-size="11" font-weight="600" fill="#ef4444">= ½ × t × v₁</text>' +
          '<line x1="12" y1="170" x2="153" y2="170" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="190" font-size="11" fill="currentColor">Rectangle Area:</text>' +
          '<text x="12" y="206" font-size="11" fill="#3b82f6">Base × Mean Speed</text>' +
          '<text x="12" y="224" font-size="11" font-weight="bold" fill="#3b82f6">= t × (v₁ / 2)</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Merton Calculators and Nicole Oresme (Oxford and Paris, c. 1350):</strong> ' +
        'In his treatise <em>De configurationibus qualitatum et motuum</em>, Nicole Oresme invented coordinate plotting to represent motion visually: time along the horizontal base (*longitudo*) and instantaneous speed along the vertical (*latitudo*). ' +
        'He proved the <strong>Mean Speed Theorem</strong>: a body accelerating uniformly from rest covers the exact same distance (represented by the area of the red triangle) as a body traveling for the same time at constant average velocity $v_{\\text{mean}} = v_1 / 2$ (the blue rectangle). The amber triangle above the mean line fits congruently into the empty lower space!';
    }

    slider.addEventListener('input', draw);
    checkShear.addEventListener('change', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 6: The Ṭūsī Couple Mechanism
   * ------------------------------------------------------------------------- */
  FIG['fig-tusi-couple'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-tusi-angle">How far the circles have turned: ' +
            '<span id="fig-tusi-angle-val" class="fig-readout">θ = 45°</span>' +
          '</label>' +
          '<input type="range" id="fig-tusi-angle" min="0" max="360" step="2" value="45">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-tusi-btn-play" class="fig-btn">▶ Animate Rotation</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-tusi-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-tusi-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-tusi-angle');
    var valReadout = container.querySelector('#fig-tusi-angle-val');
    var btnPlay = container.querySelector('#fig-tusi-btn-play');
    var svg = container.querySelector('#fig-tusi-svg');
    var explain = container.querySelector('#fig-tusi-explain');

    var isPlaying = false;
    var playTimer = null;

    function draw() {
      var theta = parseInt(slider.value, 10);
      valReadout.textContent = 'θ = ' + theta + '°';

      var cx = 200, cy = 180;
      var R_big = 120;
      var r_small = R_big / 2; // radius of small circle = 60

      var rad = theta * Math.PI / 180;

      // Center of small rolling circle: orbits at distance r_small = 60 with angle theta
      var smallCx = cx + r_small * Math.cos(rad);
      var smallCy = cy + r_small * Math.sin(rad);

      // The small circle rolls inside the large circle without slipping.
      // Rotation angle of small circle around its own center is -theta (twice the orbital rate relative to the radius vector):
      // Point P on rim starts at (cx + R_big, cy) when theta = 0.
      // Coordinate of point P:
      // x = smallCx + r_small * cos(-theta) = cx + r_small * cos(theta) + r_small * cos(theta) = cx + 2 * r_small * cos(theta) = cx + R_big * cos(theta)
      // y = smallCy + r_small * sin(-theta) = cy + r_small * sin(theta) - r_small * sin(theta) = cy!
      // Remarkably, y is strictly CONSTANT (cy = 180), producing PURE LINEAR MOTION along the horizontal diameter!
      var px = cx + R_big * Math.cos(rad);
      var py = cy; // strictly 180!

      var svgContent =
        '<!-- Large outer circle of diameter 2R -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R_big + '" fill="rgba(100, 116, 139, 0.05)" stroke="currentColor" stroke-width="2"/>' +
        '<!-- Horizontal Diameter Line (Linear track of Point P) -->' +
        '<line x1="' + (cx - R_big - 20) + '" y1="' + cy + '" x2="' + (cx + R_big + 20) + '" y2="' + cy + '" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<!-- Small inner rolling circle of diameter R -->' +
        '<circle cx="' + smallCx.toFixed(1) + '" cy="' + smallCy.toFixed(1) + '" r="' + r_small + '" ' +
                'fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" stroke-width="2.5"/>' +
        '<circle cx="' + smallCx.toFixed(1) + '" cy="' + smallCy.toFixed(1) + '" r="3" fill="#3b82f6"/>' +
        '<!-- Radius connecting small center to point P -->' +
        '<line x1="' + smallCx.toFixed(1) + '" y1="' + smallCy.toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + py + '" stroke="#3b82f6" stroke-width="2"/>' +
        '<!-- The Oscillating Point P -->' +
        '<circle cx="' + px.toFixed(1) + '" cy="' + py + '" r="7" fill="#ef4444"/>' +
        '<text x="' + px.toFixed(1) + '" y="' + (py - 14) + '" font-size="12" font-weight="bold" fill="#ef4444" text-anchor="middle">Point P</text>' +

        '<!-- Explanatory legend panel on right -->' +
        '<g transform="translate(350, 40)">' +
          '<rect x="0" y="0" width="175" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">The Ṭūsī Couple (1247)</text>' +
          '<line x1="12" y1="34" x2="163" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="11" fill="currentColor">Invented by Naṣīr al-Dīn</text>' +
          '<text x="12" y="70" font-size="11" font-weight="600" fill="#3b82f6">al-Ṭūsī at Marāgha.</text>' +
          '<line x1="12" y1="85" x2="163" y2="85" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="105" font-size="11" fill="currentColor">A circle of radius r rolls</text>' +
          '<text x="12" y="121" font-size="11" fill="currentColor">inside a circle of radius 2r.</text>' +
          '<line x1="12" y1="135" x2="163" y2="135" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="155" font-size="11" font-weight="bold" fill="#ef4444">Mathematical Miracle:</text>' +
          '<text x="12" y="173" font-size="11" fill="currentColor">Point P on the rim</text>' +
          '<text x="12" y="189" font-size="11" fill="currentColor">moves strictly in a</text>' +
          '<text x="12" y="205" font-size="11" font-weight="bold" fill="#ef4444">straight line back & forth!</text>' +
          '<line x1="12" y1="220" x2="163" y2="220" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="238" font-size="10" fill="var(--color-text-muted, #777)">Copied identically in 1543</text>' +
          '<text x="12" y="252" font-size="10" fill="var(--color-text-muted, #777)">by Copernicus (De revolutionibus)!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Naṣīr al-Dīn al-Ṭūsī and the Marāgha Observatory (Iran, 1259 CE):</strong> ' +
        'Ptolemy’s astronomical models violated the sacred Aristotelian principle of uniform circular motion by introducing the "equant point." ' +
        'To eliminate the equant, al-Ṭūsī devised the <strong>Ṭūsī couple</strong>: two concentric spheres or circles (one with diameter half the other) that generate perfectly linear harmonic motion from purely uniform circular motions. ' +
        'In 1543, Nicolaus Copernicus used the exact same mathematical device with identical lettered diagrams in <em>De revolutionibus</em> to model the lunar orbit and planetary latitudinal oscillations.';
    }

    slider.addEventListener('input', draw);

    btnPlay.addEventListener('click', function () {
      if (isPlaying) {
        clearInterval(playTimer);
        isPlaying = false;
        btnPlay.textContent = '▶ Animate Rotation';
      } else {
        isPlaying = true;
        btnPlay.textContent = '⏸ Pause Animation';
        playTimer = setInterval(function () {
          var cur = (parseInt(slider.value, 10) + 2) % 360;
          slider.value = cur;
          draw();
        }, 30);
      }
    });

    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 7: The Medieval Translation & Trade Network
   * ------------------------------------------------------------------------- */
  FIG['fig-translation-map'] = function (container) {
    var nodes = [
      { id: 'baghdad', name: 'Baghdad (Bayt al-Ḥikma)', x: 370, y: 190, era: '750–950 CE', role: 'Greek, Syriac & Sanskrit texts translated into Arabic (Ḥunayn ibn Isḥāq, Thābit ibn Qurra, al-Khwārizmī).' },
      { id: 'cairo', name: 'Cairo (Al-Azhar / Dar al-Hikma)', x: 330, y: 220, era: '970–1200 CE', role: 'Ibn al-Haytham’s optics; Ibn Yūnus astronomical tables; pioneering teaching hospitals (bimaristan).' },
      { id: 'cordoba', name: 'Córdoba & Toledo', x: 120, y: 170, era: '1000–1250 CE', role: 'Moorish Spain: Ibn Rushd (Averroes), Gerard of Cremona translating 80+ Arabic scientific works into Latin.' },
      { id: 'salerno', name: 'Salerno & Palermo', x: 210, y: 180, era: '1080–1250 CE', role: 'Medical school of Salerno; Constantine the African translating Arabic medicine; Norman Sicilian court.' },
      { id: 'paris', name: 'Paris & Oxford', x: 160, y: 100, era: '1150–1350 CE', role: 'First medieval universities; Thomas Aquinas synthesizes Aristotle; Merton Calculators & Oresme kinematics.' },
      { id: 'maragha', name: 'Marāgha & Samarkand', x: 420, y: 150, era: '1259–1440 CE', role: 'Non-Ptolemaic planetary reforms; Ṭūsī Couple; Ulugh Beg’s colossal sextant observatory.' },
      { id: 'kerala', name: 'Kerala (Sangamagrāma)', x: 470, y: 290, era: '1350–1550 CE', role: 'Mādhava’s school: infinite series for sine, cosine, arctan and pi, 250 years before Newton/Leibniz.' }
    ];

    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Pick a centre of learning: ' +
            '<span id="fig-map-selected" class="fig-readout">Baghdad (Bayt al-Ḥikma)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group" style="display:flex; flex-wrap:wrap; gap:0.4rem;">' +
          nodes.map(function(n, idx) {
            return '<button type="button" class="fig-btn fig-map-btn" data-id="' + n.id + '" style="' + (idx === 0 ? 'background:#3b82f6;color:#fff;border-color:#3b82f6;' : '') + '">' + n.name.split(' ')[0] + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-map-svg" viewBox="0 0 540 340" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-map-info" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var selectedSpan = container.querySelector('#fig-map-selected');
    var svg = container.querySelector('#fig-map-svg');
    var info = container.querySelector('#fig-map-info');
    var buttons = container.querySelectorAll('.fig-map-btn');

    function selectNode(id) {
      var n = nodes.find(function(item) { return item.id === id; });
      if (!n) return;

      selectedSpan.textContent = n.name;
      info.innerHTML =
        '<div style="background:var(--color-surface, #fff); border:1px solid var(--color-border, #e5e7eb); border-left:4px solid #3b82f6; border-radius:6px; padding:0.8rem;">' +
          '<strong style="color:#3b82f6; font-size:1.05rem;">' + n.name + ' (' + n.era + ')</strong><br>' +
          n.role +
        '</div>';

      for (var b = 0; b < buttons.length; b++) {
        if (buttons[b].getAttribute('data-id') === id) {
          buttons[b].style.background = '#3b82f6';
          buttons[b].style.color = '#fff';
          buttons[b].style.borderColor = '#3b82f6';
        } else {
          buttons[b].style.background = '';
          buttons[b].style.color = '';
          buttons[b].style.borderColor = '';
        }
      }

      drawMap(id);
    }

    function drawMap(activeId) {
      var svgContent =
        '<defs>' +
          '<linearGradient id="mapBgGrad" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="rgba(100, 116, 139, 0.08)"/>' +
            '<stop offset="100%" stop-color="rgba(100, 116, 139, 0.02)"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect x="0" y="0" width="540" height="340" rx="6" fill="url(#mapBgGrad)"/>' +
        '<!-- Simplified Afro-Eurasian Coastline Outlines (Stylized) -->' +
        '<path d="M 90 90 Q 150 70 200 90 T 300 80 T 450 110 T 520 140 ' +
                 'L 510 260 Q 460 300 420 250 T 360 270 T 300 230 T 200 260 T 110 210 Z" ' +
              'fill="none" stroke="var(--color-border, #ddd)" stroke-width="1.2" stroke-dasharray="3 3"/>' +

        '<!-- Transmission Network Connections -->' +
        '<!-- Baghdad to Cairo -->' +
        '<line x1="370" y1="190" x2="330" y2="220" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.8"/>' +
        '<!-- Cairo to Cordoba -->' +
        '<line x1="330" y1="220" x2="120" y2="170" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.8"/>' +
        '<!-- Cordoba to Toledo/Paris -->' +
        '<line x1="120" y1="170" x2="160" y2="100" stroke="#10b981" stroke-width="2.5" stroke-opacity="0.9"/>' +
        '<!-- Cairo to Salerno -->' +
        '<line x1="330" y1="220" x2="210" y2="180" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.8"/>' +
        '<!-- Salerno to Paris/Oxford -->' +
        '<line x1="210" y1="180" x2="160" y2="100" stroke="#10b981" stroke-width="2.5" stroke-opacity="0.9"/>' +
        '<!-- Baghdad to Maragha -->' +
        '<line x1="370" y1="190" x2="420" y2="150" stroke="#8b5cf6" stroke-width="2" stroke-opacity="0.8"/>' +
        '<!-- Baghdad to Kerala (Maritime / Trade) -->' +
        '<path d="M 370 190 Q 420 240 470 290" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4 3"/>';

      // Draw nodes
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var isActive = n.id === activeId;
        svgContent +=
          '<g transform="translate(' + n.x + ', ' + n.y + ')" style="cursor:pointer;" class="fig-node-point" data-id="' + n.id + '">' +
            (isActive ? '<circle cx="0" cy="0" r="16" fill="rgba(59, 130, 246, 0.25)"/>' : '') +
            '<circle cx="0" cy="0" r="' + (isActive ? '8' : '5') + '" fill="' + (isActive ? '#3b82f6' : '#ef4444') + '" stroke="#fff" stroke-width="1.5"/>' +
            '<text x="0" y="' + (isActive ? '-12' : '-8') + '" font-size="' + (isActive ? '12' : '10') + '" ' +
                  'font-weight="' + (isActive ? 'bold' : 'normal') + '" fill="' + (isActive ? '#3b82f6' : 'currentColor') + '" text-anchor="middle">' +
              n.name.split(' ')[0] +
            '</text>' +
          '</g>';
      }

      svg.innerHTML = svgContent;

      var nodePoints = svg.querySelectorAll('.fig-node-point');
      for (var p = 0; p < nodePoints.length; p++) {
        nodePoints[p].addEventListener('click', function () {
          selectNode(this.getAttribute('data-id'));
        });
      }
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function () {
        selectNode(this.getAttribute('data-id'));
      });
    }

    selectNode('baghdad');
  };

  /* -------------------------------------------------------------------------
   * Figure 8: Part 5 Interactive Self-Scoring Quiz
   * ------------------------------------------------------------------------- */
  FIG['fig-quiz-part5'] = function (container) {
    var questions = [
      {
        question: "How did Ibn al-Haytham's dark-room experiment show that we don't see by sending rays out of our eyes?",
        options: [
          "The spots of light were brighter when he looked straight at them.",
          "He saw the lamps clearly with his eyes closed.",
          "The spots changed colour depending on who was watching.",
          "Each lamp made its own spot through the small hole, and covering one lamp made only its own spot vanish, while the others stayed."
        ],
        answer: 3,
        explanation: "If seeing worked by rays from the eyes, covering a lamp outside couldn't make just one spot disappear inside. Light must travel from each lamp, in straight lines, into the room and into our eyes."
      },
      {
        question: "How did al-Bīrūnī work out the size of the Earth at Nandana Fort?",
        options: [
          "He timed a ship disappearing over the horizon.",
          "He measured the hill's height and how far the horizon dipped below level, then used a right-angled triangle.",
          "He measured shadows in two cities on the same day.",
          "He used the length of a lunar eclipse."
        ],
        answer: 1,
        explanation: "The line of sight just touches the curved Earth at the horizon, making a right angle with the radius. From the hill's height and the dip angle (about half a degree), trigonometry gives the Earth's radius."
      },
      {
        question: "What did Mādhava of Sangamagrāma discover in 14th-century Kerala?",
        options: [
          "Ways of writing π, sine and cosine as sums that go on forever, plus corrections that make them reach the answer quickly.",
          "That the Earth goes round the Sun.",
          "The first telescope.",
          "The law of falling bodies."
        ],
        answer: 0,
        explanation: "π/4 = 1 − 1/3 + 1/5 − 1/7 + ... is usually called the Leibniz or Gregory series, but later Kerala texts credit it to Mādhava more than 250 years earlier."
      },
      {
        question: "What was the key part of Su Song's clock tower (1092 CE)?",
        options: [
          "An escapement: a balance lever that let the water wheel move forward one bucket at a time, turning a steady flow into regular ticks.",
          "A pendulum.",
          "An electric motor.",
          "A sand timer."
        ],
        answer: 0,
        explanation: "When the top bucket filled enough, a lever tipped, released the wheel for one step and locked it again. That stop-and-go action is what makes a clock tick."
      },
      {
        question: "What does the 'mean speed rule' proved at Oxford and by Oresme say?",
        options: [
          "Something speeding up steadily from rest travels as far as something moving for the same time at its average speed (half its final speed).",
          "Heavy things fall faster than light ones.",
          "Speed and distance are always equal.",
          "Nothing can move in empty space."
        ],
        answer: 0,
        explanation: "Oresme showed it with a graph: the distance is the area under the speed line, and the triangle can be rearranged into a rectangle of the same area."
      },
      {
        question: "What did al-Ṭūsī invent to get rid of Ptolemy's 'equant'?",
        options: [
          "The Ṭūsī couple: a small circle rolling inside one twice its size, so a point on it moves in a straight line.",
          "A Sun-centred model of the planets.",
          "The telescope.",
          "Elliptical orbits."
        ],
        answer: 0,
        explanation: "Two steady circular motions combine into a straight back-and-forth motion. Ibn al-Shāṭir and later Copernicus used it to build planet models without the equant."
      },
      {
        question: "Which Spanish city was the main centre for translating Arabic science into Latin in the 12th century?",
        options: [
          "Rome.",
          "Paris.",
          "Venice.",
          "Toledo."
        ],
        answer: 3,
        explanation: "After 1085 Toledo's Arabic libraries drew translators from all over Europe. Gerard of Cremona alone translated more than eighty works there."
      },
      {
        question: "What does the evidence say about the destruction of the Library of Alexandria?",
        options: [
          "It burned in one afternoon in 642 CE.",
          "It declined slowly over centuries, through damage in wars, neglect and lack of money; the story of an Arab burning first appears 500 years later.",
          "It never existed.",
          "It was moved to Baghdad intact."
        ],
        answer: 1,
        explanation: "Writers who lived through the Arab conquest never mention a library, because by then the Great Library had long since gone."
      },
      {
        question: "How did the Paris condemnations of 1277 end up helping physics?",
        options: [
          "They paid for new laboratories.",
          "They banned the study of nature.",
          "By insisting God could make a vacuum or other worlds, they stopped teachers saying 'impossible, because Aristotle said so' and encouraged 'what if?' thinking.",
          "They made Aristotle compulsory."
        ],
        answer: 2,
        explanation: "Thinkers such as Buridan and Oresme began asking how things would fall in a vacuum or what we would feel if the Earth spun, which loosened Aristotle's hold on physics."
      },
      {
        question: "What was a 'disputation' in a medieval university?",
        options: [
          "An exam where students copied out a book from memory.",
          "A formal debate: a question was argued from both sides, and the teacher answered every objection one by one.",
          "A ceremony for new students.",
          "A punishment for breaking rules."
        ],
        answer: 1,
        explanation: "Disputations trained students to take arguments apart and defend claims against challenge, rather than simply accepting authority."
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
            '<h4 style="margin:0; font-size:1.15rem;">Part 5 Evaluation: Medieval Science &amp; Optics</h4>' +
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
