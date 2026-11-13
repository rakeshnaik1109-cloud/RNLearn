/**
 * Figures for Part 6: The Scientific Revolution
 * RNLearn - Long-form Learning & Essays
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  /* -------------------------------------------------------------------------
   * Figure 1: Retrograde Motion (Copernican vs Ptolemaic)
   * ------------------------------------------------------------------------- */
  FIG['fig-retrograde-motion'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-retro-angle">Orbital Progress (Earth Angle): ' +
            '<span id="fig-retro-angle-val" class="fig-readout">0°</span>' +
          '</label>' +
          '<input type="range" id="fig-retro-angle" min="0" max="360" step="2" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label><input type="radio" name="fig-retro-mode" value="copernican" checked> Copernican Perspective (Heliocentric)</label>' +
          '<label style="margin-left:1.2rem;"><input type="radio" name="fig-retro-mode" value="ptolemaic"> Ptolemaic Epicycle (Geocentric)</label>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-retro-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-retro-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-retro-angle');
    var valReadout = container.querySelector('#fig-retro-angle-val');
    var radios = container.querySelectorAll('input[name="fig-retro-mode"]');
    var svg = container.querySelector('#fig-retro-svg');
    var explain = container.querySelector('#fig-retro-explain');

    // Place the "Apparent Position" label next to the point on the star vault, inside the vault,
    // choosing the first spot that keeps clear of the Earth, Mars and Sun labels.
    function apparentLabel(px, py, avoid) {
      var w = 86, h = 12, inward = px > 190 ? -1 : 1;
      var tries = [[inward * 10, -6], [inward * 10, 14], [inward * 10, -20], [inward * 10, 28], [inward * 10, -34], [inward * 10, 42]];
      for (var i = 0; i < tries.length; i++) {
        var x0 = inward < 0 ? px + tries[i][0] - w : px + tries[i][0];
        var y0 = py + tries[i][1] - h + 2;
        var hit = avoid.some(function (b) { return x0 < b[2] && x0 + w > b[0] && y0 < b[3] && y0 + h > b[1]; });
        if (!hit && y0 > 2 && y0 + h < 358) break;
      }
      if (i === tries.length) i = 0;
      return '<text x="' + (px + tries[i][0]).toFixed(1) + '" y="' + (py + tries[i][1]).toFixed(1) + '" font-size="10" font-weight="600" fill="#10b981" text-anchor="' + (inward < 0 ? 'end' : 'start') + '">Apparent Position</text>';
    }

    function draw() {
      var angleDeg = parseInt(slider.value, 10);
      valReadout.textContent = angleDeg + '°';
      var mode = container.querySelector('input[name="fig-retro-mode"]:checked').value;

      var cx = 190, cy = 180;

      if (mode === 'copernican') {
        // Sun at center
        // Earth radius rE = 75, Mars radius rM = 125
        // Earth period = 1 yr, Mars period = 1.88 yr => omegaM = omegaE / 1.88
        var rE = 75, rM = 125;
        var aE = angleDeg * Math.PI / 180;
        var aM = (angleDeg / 1.88) * Math.PI / 180;

        var ex = cx + rE * Math.cos(aE);
        var ey = cy + rE * Math.sin(aE);
        var mx = cx + rM * Math.cos(aM);
        var my = cy + rM * Math.sin(aM);

        // Line of sight from Earth through Mars to background star vault at radius 165
        var dx = mx - ex;
        var dy = my - ey;
        var dist = Math.sqrt(dx * dx + dy * dy);
        // Extend the sight line until it meets the star vault (radius 165)
        var ux = dx / dist, uy = dy / dist, fx = ex - cx, fy = ey - cy;
        var bq = fx * ux + fy * uy;
        var sightLen = -bq + Math.sqrt(bq * bq - (fx * fx + fy * fy - 165 * 165));
        var sx = ex + ux * sightLen;
        var sy = ey + uy * sightLen;

        var svgContent =
          '<!-- Background star sphere circle -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="165" fill="none" stroke="var(--color-border, #ddd)" stroke-width="1.2" stroke-dasharray="2 3"/>' +
          '<text x="' + cx + '" y="24" font-size="10" fill="var(--color-text-muted, #777)" text-anchor="middle">Fixed Star Vault (Zodiac)</text>' +
          '<!-- Sun at Center -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="#f59e0b"/>' +
          '<text x="' + cx + '" y="' + (cy + 22) + '" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="middle">Sun</text>' +
          '<!-- Earth Orbit -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + rE + '" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3 3"/>' +
          '<!-- Mars Orbit -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + rM + '" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 4"/>' +
          '<!-- Earth -->' +
          '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="6" fill="#3b82f6"/>' +
          '<text x="' + (ex + 8).toFixed(1) + '" y="' + (ey - 6).toFixed(1) + '" font-size="10" font-weight="600" fill="#3b82f6">Earth</text>' +
          '<!-- Mars -->' +
          '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="5" fill="#ef4444"/>' +
          '<text x="' + (mx + 8).toFixed(1) + '" y="' + (my - 6).toFixed(1) + '" font-size="10" font-weight="600" fill="#ef4444">Mars</text>' +
          '<!-- Line of Sight from Earth through Mars -->' +
          '<line x1="' + ex.toFixed(1) + '" y1="' + ey.toFixed(1) + '" x2="' + sx.toFixed(1) + '" y2="' + sy.toFixed(1) + '" stroke="#10b981" stroke-width="1.8"/>' +
          '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="4" fill="#10b981"/>' +
          apparentLabel(sx, sy, [[ex - 10, ey - 22, ex + 42, ey + 12], [mx - 10, my - 22, mx + 38, my + 12], [cx - 20, cy - 14, cx + 20, cy + 30]]) +

          '<!-- Explanatory card on right -->' +
          '<g transform="translate(370, 40)">' +
            '<rect x="0" y="0" width="160" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#3b82f6">Copernican Model</text>' +
            '<line x1="12" y1="34" x2="148" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Retrograde motion is</text>' +
            '<text x="12" y="70" font-size="11" font-weight="bold" fill="#10b981">a perspective illusion!</text>' +
            '<line x1="12" y1="85" x2="148" y2="85" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="105" font-size="11" fill="currentColor">Earth orbits faster</text>' +
            '<text x="12" y="121" font-size="11" fill="currentColor">on an inside track,</text>' +
            '<text x="12" y="137" font-size="11" fill="currentColor">periodically passing</text>' +
            '<text x="12" y="153" font-size="11" fill="#ef4444">Mars on the outside.</text>' +
            '<line x1="12" y1="170" x2="148" y2="170" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="190" font-size="10" fill="var(--color-text-muted, #666)">As Earth overtakes</text>' +
            '<text x="12" y="206" font-size="10" fill="var(--color-text-muted, #666)">Mars, Mars appears</text>' +
            '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">to backtrack across</text>' +
            '<text x="12" y="238" font-size="10" font-weight="bold" fill="#10b981">the starry zodiac.</text>' +
          '</g>';

        svg.innerHTML = svgContent;

        explain.innerHTML =
          '<strong>Copernicus’s Geometric Elegance (1543):</strong> In the heliocentric system, retrograde motion requires zero extra machinery. It is simply an optical parallax effect: just as a passing train appears to move backward relative to distant trees when viewed from a faster-moving train, Mars appears to loop backward across the sky whenever Earth overtakes it on the inside track.';
      } else {
        // Ptolemaic Geocentric model: Earth at center, Deferent radius = 100, Epicycle radius = 40
        var rDef = 100, rEpi = 40;
        var aDef = angleDeg * Math.PI / 180;
        var aEpi = (angleDeg * 2.5) * Math.PI / 180;

        var epiCx = cx + rDef * Math.cos(aDef);
        var epiCy = cy + rDef * Math.sin(aDef);
        var px = epiCx + rEpi * Math.cos(aEpi);
        var py = epiCy + rEpi * Math.sin(aEpi);

        var svgContent =
          '<!-- Earth at Center -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="#3b82f6"/>' +
          '<text x="' + cx + '" y="' + (cy + 22) + '" font-size="11" font-weight="bold" fill="#3b82f6" text-anchor="middle">Earth</text>' +
          '<!-- Deferent Circle -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + rDef + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>' +
          '<!-- Epicycle Center -->' +
          '<circle cx="' + epiCx.toFixed(1) + '" cy="' + epiCy.toFixed(1) + '" r="3" fill="#f59e0b"/>' +
          '<!-- Epicycle Circle -->' +
          '<circle cx="' + epiCx.toFixed(1) + '" cy="' + epiCy.toFixed(1) + '" r="' + rEpi + '" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" stroke-width="1.8"/>' +
          '<!-- Mars on Epicycle -->' +
          '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5" fill="#ef4444"/>' +
          '<text x="' + (px + 8).toFixed(1) + '" y="' + (py - 4).toFixed(1) + '" font-size="11" font-weight="bold" fill="#ef4444">Mars</text>' +
          '<!-- Line connecting Epicycle Center to Mars -->' +
          '<line x1="' + epiCx.toFixed(1) + '" y1="' + epiCy.toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="#f59e0b" stroke-width="1.5"/>' +

          '<!-- Explanatory card on right -->' +
          '<g transform="translate(370, 40)">' +
            '<rect x="0" y="0" width="160" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#ef4444">Ptolemaic Model</text>' +
            '<line x1="12" y1="34" x2="148" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Retrograde motion</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">requires artificial</text>' +
            '<text x="12" y="86" font-size="11" font-weight="bold" fill="#f59e0b">Epicycle Gears!</text>' +
            '<line x1="12" y1="102" x2="148" y2="102" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="122" font-size="11" fill="currentColor">Mars rides on a small</text>' +
            '<text x="12" y="138" font-size="11" fill="currentColor">wheel (epicycle) whose</text>' +
            '<text x="12" y="154" font-size="11" fill="currentColor">center rides on a</text>' +
            '<text x="12" y="170" font-size="11" fill="currentColor">big circle (deferent).</text>' +
            '<line x1="12" y1="185" x2="148" y2="185" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="205" font-size="10" fill="var(--color-text-muted, #666)">Arbitrary gear sizing</text>' +
            '<text x="12" y="221" font-size="10" fill="var(--color-text-muted, #666)">with no physical</text>' +
            '<text x="12" y="237" font-size="10" font-weight="bold" fill="#ef4444">explanation.</text>' +
          '</g>';

        svg.innerHTML = svgContent;

        explain.innerHTML =
          '<strong>The Ptolemaic Geocentric Machinery:</strong> In the ancient geocentric system, Ptolemy had to give each outer planet an ad-hoc secondary circle (an epicycle) whose period was locked to exactly one solar year. There was no physical reason why Mars should spin in an epicycle; it was an ad-hoc mathematical patch to fit observations.';
      }
    }

    slider.addEventListener('input', draw);
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', draw);
    }
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 2: Kepler’s Three Laws Orbit Simulator
   * ------------------------------------------------------------------------- */
  FIG['fig-kepler-laws'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-kepler-ecc">Orbit Eccentricity (e): ' +
            '<span id="fig-kepler-ecc-val" class="fig-readout">e = 0.50</span>' +
          '</label>' +
          '<input type="range" id="fig-kepler-ecc" min="0" max="75" step="5" value="50">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label for="fig-kepler-time">Orbital True Anomaly (θ): ' +
            '<span id="fig-kepler-time-val" class="fig-readout">θ = 30°</span>' +
          '</label>' +
          '<input type="range" id="fig-kepler-time" min="0" max="360" step="5" value="30">' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-kepler-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-kepler-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var eccSlider = container.querySelector('#fig-kepler-ecc');
    var timeSlider = container.querySelector('#fig-kepler-time');
    var eccVal = container.querySelector('#fig-kepler-ecc-val');
    var timeVal = container.querySelector('#fig-kepler-time-val');
    var svg = container.querySelector('#fig-kepler-svg');
    var explain = container.querySelector('#fig-kepler-explain');

    function draw() {
      var e = parseInt(eccSlider.value, 10) / 100;
      var thetaDeg = parseInt(timeSlider.value, 10);
      var theta = thetaDeg * Math.PI / 180;

      eccVal.textContent = 'e = ' + e.toFixed(2) + (e === 0 ? ' (Circle)' : e > 0.6 ? ' (High Comet)' : '');
      timeVal.textContent = 'θ = ' + thetaDeg + '°';

      var cx = 200, cy = 180;
      var a = 120; // semi-major axis
      var b = a * Math.sqrt(Math.max(0.05, 1 - e * e));
      var c = a * e; // distance from center to focus

      // Sun at right focus: focusX = cx + c, focusY = cy
      // Planet position: r = a(1 - e^2) / (1 + e cos theta)
      var p_semi = a * (1 - e * e);
      var r = p_semi / (1 + e * Math.cos(theta));
      var px = (cx + c) - r * Math.cos(theta);
      var py = cy - r * Math.sin(theta);

      // Perihelion and Aphelion
      var rPeri = a * (1 - e);
      var rAph = a * (1 + e);
      var vPeri = Math.sqrt((1 + e) / (1 - e));
      var vAph = Math.sqrt((1 - e) / (1 + e));

      var svgContent =
        '<!-- Coordinate axes -->' +
        '<line x1="' + (cx - a - 25) + '" y1="' + cy + '" x2="' + (cx + a + 25) + '" y2="' + cy + '" stroke="var(--color-border, #ddd)" stroke-width="1.2"/>' +
        '<line x1="' + cx + '" y1="' + (cy - b - 20) + '" x2="' + cx + '" y2="' + (cy + b + 20) + '" stroke="var(--color-border, #ddd)" stroke-width="1.2"/>' +
        '<!-- Elliptical Orbit (Law 1) -->' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + a + '" ry="' + b.toFixed(1) + '" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" stroke-width="2.5"/>' +
        '<!-- Empty Focus F2 -->' +
        '<circle cx="' + (cx - c).toFixed(1) + '" cy="' + cy + '" r="3" fill="var(--color-text-muted, #888)"/>' +
        '<text x="' + (cx - c - 4).toFixed(1) + '" y="' + (cy + 16) + '" font-size="10" fill="var(--color-text-muted, #888)">F₂</text>' +
        '<!-- Sun at Focus F1 -->' +
        '<circle cx="' + (cx + c).toFixed(1) + '" cy="' + cy + '" r="9" fill="#f59e0b"/>' +
        '<text x="' + (cx + c).toFixed(1) + '" y="' + (cy + 22) + '" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="middle">Sun (F₁)</text>' +

        '<!-- Swept Area Sector (Law 2: Equal Areas in Equal Times) -->' +
        '<path d="M ' + (cx + c) + ' ' + cy + ' L ' + (cx - a) + ' ' + cy + ' A ' + a + ' ' + b.toFixed(1) + ' 0 0 1 ' + px.toFixed(1) + ' ' + py.toFixed(1) + ' Z" ' +
              'fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="1.5"/>' +

        '<!-- Radius Vector r -->' +
        '<line x1="' + (cx + c).toFixed(1) + '" y1="' + cy + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="#ef4444" stroke-width="2"/>' +
        '<!-- Planet -->' +
        '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="6" fill="#3b82f6"/>' +
        '<text x="' + (px + 8).toFixed(1) + '" y="' + (py - 6).toFixed(1) + '" font-size="11" font-weight="bold" fill="#3b82f6">Planet</text>' +

        '<!-- Right Info Panel: Kepler\'s 3 Laws Summary -->' +
        '<g transform="translate(370, 30)">' +
          '<rect x="0" y="0" width="160" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Kepler\'s Three Laws</text>' +
          '<line x1="12" y1="34" x2="148" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="600" fill="#3b82f6">Law 1: Ellipses (1609)</text>' +
          '<text x="12" y="68" font-size="10" fill="currentColor">Orbits are ellipses with</text>' +
          '<text x="12" y="82" font-size="10" fill="currentColor">the Sun at one focus.</text>' +
          '<line x1="12" y1="96" x2="148" y2="96" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="114" font-size="11" font-weight="600" fill="#f59e0b">Law 2: Equal Areas (1609)</text>' +
          '<text x="12" y="130" font-size="10" fill="currentColor">Radius vector sweeps</text>' +
          '<text x="12" y="144" font-size="10" font-weight="bold" fill="#f59e0b">dA/dt = constant!</text>' +
          '<text x="12" y="160" font-size="10" fill="currentColor">Fastest at Perihelion;</text>' +
          '<text x="12" y="174" font-size="10" fill="currentColor">Slowest at Aphelion.</text>' +
          '<line x1="12" y1="188" x2="148" y2="188" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="206" font-size="11" font-weight="600" fill="#ef4444">Law 3: Harmonic (1619)</text>' +
          '<text x="12" y="224" font-size="12" font-weight="bold" fill="#ef4444">T² ∝ a³</text>' +
          '<text x="12" y="242" font-size="10" fill="var(--color-text-muted, #666)">Period squared is</text>' +
          '<text x="12" y="256" font-size="10" fill="var(--color-text-muted, #666)">proportional to semi-</text>' +
          '<text x="12" y="270" font-size="10" fill="var(--color-text-muted, #666)">major axis cubed.</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Johannes Kepler’s Shattering of Circular Orbits (1609–1619):</strong> By refusing to ignore an 8-arcminute discrepancy in Tycho Brahe’s Mars observations, Kepler discovered that planets do not travel in uniform circles, but in <strong>ellipses</strong>. The Sun sits at one focus, and the planet sweeps out equal orbital areas in equal intervals of time ($dA/dt = \\text{const}$). Ten years later in <em>Harmonices Mundi</em>, he discovered the universal harmonic law connecting all planetary orbits: $T^2 / a^3 = \\text{constant}$.';
    }

    eccSlider.addEventListener('input', draw);
    timeSlider.addEventListener('input', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 3: Galileo’s Telescopic Discoveries
   * ------------------------------------------------------------------------- */
  FIG['fig-galileo-telescope'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Telescopic Observation (1609–1610): ' +
            '<span id="fig-tele-target-val" class="fig-readout">Moons of Jupiter</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-tele-jupiter" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. Jupiter\'s Moons</button>' +
          '<button type="button" id="fig-btn-tele-venus" class="fig-btn">2. Phases of Venus</button>' +
          '<button type="button" id="fig-btn-tele-moon" class="fig-btn">3. Moon Surface</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-tele-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-tele-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnJup = container.querySelector('#fig-btn-tele-jupiter');
    var btnVen = container.querySelector('#fig-btn-tele-venus');
    var btnMoon = container.querySelector('#fig-btn-tele-moon');
    var targetVal = container.querySelector('#fig-tele-target-val');
    var svg = container.querySelector('#fig-tele-svg');
    var explain = container.querySelector('#fig-tele-explain');

    var currentView = 'jupiter';

    function setBtnActive(activeBtn) {
      btnJup.style.background = ''; btnJup.style.color = ''; btnJup.style.borderColor = '';
      btnVen.style.background = ''; btnVen.style.color = ''; btnVen.style.borderColor = '';
      btnMoon.style.background = ''; btnMoon.style.color = ''; btnMoon.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      var cx = 200, cy = 180, R_field = 135;

      var svgContent =
        '<!-- Telescopic Circular Field of View -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R_field + '" fill="#09090b" stroke="#3f3f46" stroke-width="6"/>' +
        '<!-- Reticle crosshairs -->' +
        '<line x1="' + (cx - R_field) + '" y1="' + cy + '" x2="' + (cx + R_field) + '" y2="' + cy + '" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
        '<line x1="' + cx + '" y1="' + (cy - R_field) + '" x2="' + cx + '" y2="' + (cy + R_field) + '" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>';

      if (currentView === 'jupiter') {
        targetVal.textContent = "Jupiter and the Four Medicean Moons";
        // Jupiter in center
        svgContent +=
          '<!-- Jupiter Disc -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="24" fill="#d97706"/>' +
          '<ellipse cx="' + cx + '" cy="' + (cy - 6) + '" rx="23" ry="4" fill="#b45309"/>' +
          '<ellipse cx="' + cx + '" cy="' + (cy + 6) + '" rx="23" ry="5" fill="#b45309"/>' +
          '<text x="' + cx + '" y="' + (cy + 42) + '" font-size="11" fill="#fbbf24" font-weight="bold" text-anchor="middle">Jupiter</text>' +
          '<!-- 4 Moons: Io, Europa, Ganymede, Callisto -->' +
          '<circle cx="' + (cx - 95) + '" cy="' + cy + '" r="3" fill="#fff"/>' +
          '<text x="' + (cx - 95) + '" y="' + (cy - 8) + '" font-size="9" fill="#fff" text-anchor="middle">Callisto</text>' +
          '<circle cx="' + (cx - 45) + '" cy="' + cy + '" r="3.5" fill="#fff"/>' +
          '<text x="' + (cx - 45) + '" y="' + (cy - 8) + '" font-size="9" fill="#fff" text-anchor="middle">Europa</text>' +
          '<circle cx="' + (cx + 50) + '" cy="' + cy + '" r="3.5" fill="#fff"/>' +
          '<text x="' + (cx + 50) + '" y="' + (cy - 8) + '" font-size="9" fill="#fff" text-anchor="middle">Io</text>' +
          '<circle cx="' + (cx + 105) + '" cy="' + cy + '" r="4" fill="#fff"/>' +
          '<text x="' + (cx + 105) + '" y="' + (cy - 8) + '" font-size="9" fill="#fff" text-anchor="middle">Ganymede</text>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#3b82f6">Sidereus Nuncius (1610)</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">In January 1610, Galileo</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">discovered 4 "stars"</text>' +
            '<text x="12" y="86" font-size="11" font-weight="600" fill="#3b82f6">orbiting Jupiter!</text>' +
            '<line x1="12" y1="102" x2="153" y2="102" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="122" font-size="11" font-weight="bold" fill="#ef4444">Aristotle Refuted:</text>' +
            '<text x="12" y="140" font-size="10" fill="currentColor">Earth is NOT the sole</text>' +
            '<text x="12" y="154" font-size="10" fill="currentColor">center of cosmic motion.</text>' +
            '<line x1="12" y1="170" x2="153" y2="170" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="190" font-size="10" fill="var(--color-text-muted, #666)">If Jupiter can move</text>' +
            '<text x="12" y="206" font-size="10" fill="var(--color-text-muted, #666)">while carrying 4 moons,</text>' +
            '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">Earth can move without</text>' +
            '<text x="12" y="238" font-size="10" font-weight="bold" fill="#10b981">losing its own Moon!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Medicean Stars (January 1610):</strong> Night after night, Galileo watched four tiny pinpricks of light shift back and forth across Jupiter, proving they were moons orbiting another planet. This shattered the Aristotelian dogma that every celestial sphere must revolve exclusively around the stationary Earth.';
      } else if (currentView === 'venus') {
        targetVal.textContent = "Phases of Venus: The Death of Ptolemy";
        // Show crescent vs gibbous phases of Venus inside FOV
        svgContent +=
          '<!-- Crescent Venus (Near Earth, Large) -->' +
          '<g transform="translate(' + (cx - 60) + ', ' + cy + ')">' +
            '<circle cx="0" cy="0" r="38" fill="#27272a"/>' +
            '<path d="M 0 -38 A 38 38 0 0 1 0 38 A 20 38 0 0 0 0 -38" fill="#fef08a"/>' +
            '<text x="0" y="52" font-size="10" fill="#fef08a" text-anchor="middle">Crescent (Near Earth)</text>' +
          '</g>' +
          '<!-- Gibbous Venus (Far from Earth, Small) -->' +
          '<g transform="translate(' + (cx + 60) + ', ' + cy + ')">' +
            '<circle cx="0" cy="0" r="16" fill="#27272a"/>' +
            '<path d="M 0 -16 A 16 16 0 0 1 0 16 A 6 16 0 0 1 0 -16" fill="#fef08a"/>' +
            '<text x="0" y="32" font-size="10" fill="#fef08a" text-anchor="middle">Gibbous (Far Sun-Side)</text>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#f59e0b">Phases of Venus</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Ptolemy predicted that</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">Venus can ONLY appear</text>' +
            '<text x="12" y="86" font-size="11" font-weight="bold" fill="#ef4444">as a crescent.</text>' +
            '<line x1="12" y1="102" x2="153" y2="102" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="122" font-size="11" font-weight="bold" fill="#10b981">Galileo Saw:</text>' +
            '<text x="12" y="140" font-size="10" fill="currentColor">A COMPLETE cycle of</text>' +
            '<text x="12" y="154" font-size="10" fill="currentColor">phases (gibbous to full)!</text>' +
            '<line x1="12" y1="170" x2="153" y2="170" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="190" font-size="10" fill="var(--color-text-muted, #666)">Venus MUST orbit</text>' +
            '<text x="12" y="206" font-size="10" fill="var(--color-text-muted, #666)">the Sun, passing</text>' +
            '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">behind it. Ptolemaic</text>' +
            '<text x="12" y="238" font-size="10" font-weight="bold" fill="#ef4444">geocentrism is IMPOSSIBLE.</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Decisive Test: Phases of Venus (Autumn 1610):</strong> In Ptolemy’s model, Venus remains permanently between Earth and the Sun, meaning it could never appear more than half-illuminated (crescent only). Galileo observed Venus passing from a large thin crescent to a small, nearly full gibbous disc—proving conclusively that Venus orbits the Sun. Ptolemaic astronomy was dead.';
      } else {
        targetVal.textContent = "The Moon's Rugged, Mountainous Surface";
        svgContent +=
          '<!-- Moon Cratered terminator surface -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="100" fill="#e4e4e7"/>' +
          '<!-- Shadowed half (Terminator) -->' +
          '<path d="M ' + cx + ' ' + (cy - 100) + ' A 100 100 0 0 1 ' + cx + ' ' + (cy + 100) + ' Z" fill="#27272a"/>' +
          '<!-- Craters along terminator -->' +
          '<circle cx="' + (cx - 15) + '" cy="' + (cy - 30) + '" r="14" fill="#a1a1aa" stroke="#52525b" stroke-width="2"/>' +
          '<circle cx="' + (cx - 12) + '" cy="' + (cy - 30) + '" r="10" fill="#27272a"/>' +
          '<circle cx="' + (cx + 5) + '" cy="' + (cy + 25) + '" r="18" fill="#52525b" stroke="#71717a" stroke-width="2"/>' +
          '<circle cx="' + (cx + 8) + '" cy="' + (cy + 25) + '" r="14" fill="#18181b"/>' +
          '<circle cx="' + (cx - 40) + '" cy="' + (cy + 45) + '" r="12" fill="#d4d4d8" stroke="#a1a1aa"/>' +

          '<!-- Card on right -->' +
          '<g transform="translate(365, 40)">' +
            '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="#10b981">The Imperfect Moon</text>' +
            '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" fill="currentColor">Aristotle taught that</text>' +
            '<text x="12" y="70" font-size="11" fill="currentColor">heavenly bodies are</text>' +
            '<text x="12" y="86" font-size="11" font-weight="bold" fill="#ef4444">flawless polished glass.</text>' +
            '<line x1="12" y1="102" x2="153" y2="102" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="122" font-size="11" font-weight="bold" fill="#10b981">Galileo Discovered:</text>' +
            '<text x="12" y="140" font-size="10" fill="currentColor">Rugged mountain chains,</text>' +
            '<text x="12" y="154" font-size="10" fill="currentColor">deep craters, and valleys.</text>' +
            '<line x1="12" y1="170" x2="153" y2="170" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="190" font-size="10" fill="var(--color-text-muted, #666)">The Moon is made of</text>' +
            '<text x="12" y="206" font-size="10" fill="var(--color-text-muted, #666)">the same rough rock</text>' +
            '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">as our Earth. Heaven &</text>' +
            '<text x="12" y="238" font-size="10" font-weight="bold" fill="#3b82f6">Earth share one nature!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The Moon’s Rugged Face (1609):</strong> Galileo measured the height of lunar mountain peaks by observing their illuminated tips catching sunlight across the dark side of the terminator line. The celestial realm was not made of an incorruptible crystalline "fifth essence" (quintessence); it was physical, imperfect, and geological.';
      }

      svg.innerHTML = svgContent;
    }

    btnJup.addEventListener('click', function () { currentView = 'jupiter'; setBtnActive(btnJup); draw(); });
    btnVen.addEventListener('click', function () { currentView = 'venus'; setBtnActive(btnVen); draw(); });
    btnMoon.addEventListener('click', function () { currentView = 'moon'; setBtnActive(btnMoon); draw(); });

    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 4: Galileo’s Inclined Plane & Law of Fall
   * ------------------------------------------------------------------------- */
  FIG['fig-inclined-plane'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-ramp-angle">Incline Angle (θ): ' +
            '<span id="fig-ramp-angle-val" class="fig-readout">θ = 15° (Diluted Gravity a = 2.54 m/s²)</span>' +
          '</label>' +
          '<input type="range" id="fig-ramp-angle" min="5" max="30" step="5" value="15">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label for="fig-ramp-time">Elapsed Time Pulses (t): ' +
            '<span id="fig-ramp-time-val" class="fig-readout">t = 3 units</span>' +
          '</label>' +
          '<input type="range" id="fig-ramp-time" min="0" max="4" step="1" value="3">' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-ramp-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-ramp-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var angleSlider = container.querySelector('#fig-ramp-angle');
    var timeSlider = container.querySelector('#fig-ramp-time');
    var angleVal = container.querySelector('#fig-ramp-angle-val');
    var timeVal = container.querySelector('#fig-ramp-time-val');
    var svg = container.querySelector('#fig-ramp-svg');
    var explain = container.querySelector('#fig-ramp-explain');

    function draw() {
      var thetaDeg = parseInt(angleSlider.value, 10);
      var t = parseInt(timeSlider.value, 10);
      var g = 9.81;
      var a = g * Math.sin(thetaDeg * Math.PI / 180);

      angleVal.textContent = 'θ = ' + thetaDeg + '° (a = g sin θ = ' + a.toFixed(2) + ' m/s²)';
      timeVal.textContent = 't = ' + t + ' time pulse' + (t === 1 ? '' : 's');

      var ox = 40, oy = 290;
      var rampLength = 320;
      var rad = thetaDeg * Math.PI / 180;

      var topX = ox + rampLength * Math.cos(rad);
      var topY = oy - rampLength * Math.sin(rad);

      // Distance fraction: s(t) = t^2 / 16 (for t = 0..4)
      var frac = (t * t) / 16;
      var ballDist = frac * rampLength;
      var ballX = topX - ballDist * Math.cos(rad);
      var ballY = topY + ballDist * Math.sin(rad);

      var svgContent =
        '<!-- Ground line -->' +
        '<line x1="20" y1="' + oy + '" x2="380" y2="' + oy + '" stroke="var(--color-border, #999)" stroke-width="2"/>' +
        '<!-- Wooden Inclined Ramp Triangle -->' +
        '<polygon points="' + ox + ',' + oy + ' ' + topX.toFixed(1) + ',' + topY.toFixed(1) + ' ' + topX.toFixed(1) + ',' + oy + '" ' +
                 'fill="rgba(217, 119, 6, 0.15)" stroke="#b45309" stroke-width="2.5"/>' +

        '<!-- Incline Angle Arc -->' +
        '<path d="M ' + (ox + 45) + ' ' + oy + ' A 45 45 0 0 0 ' + (ox + 45 * Math.cos(rad)).toFixed(1) + ' ' + (oy - 45 * Math.sin(rad)).toFixed(1) + '" ' +
              'fill="none" stroke="#d97706" stroke-width="2"/>' +
        '<text x="' + (ox + 52) + '" y="' + (oy - 8) + '" font-size="11" font-weight="bold" fill="#d97706">θ = ' + thetaDeg + '°</text>';

      // Interval Bell Markers along ramp: s = 1, 4, 9, 16 units
      var bells = [1, 4, 9, 16];
      for (var b = 0; b < bells.length; b++) {
        var bDist = (bells[b] / 16) * rampLength;
        var bx = topX - bDist * Math.cos(rad);
        var by = topY + bDist * Math.sin(rad);
        svgContent +=
          '<circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="3" fill="#ef4444"/>' +
          '<text x="' + (bx - 12).toFixed(1) + '" y="' + (by - 8).toFixed(1) + '" font-size="10" fill="#ef4444" font-weight="600">t=' + (b + 1) + '</text>';
      }

      // Rolling Bronze Ball
      var ballR = 9;
      // Perpendicular normal offset to sit on ramp
      var nx = -ballR * Math.sin(rad);
      var ny = -ballR * Math.cos(rad);

      svgContent +=
        '<circle cx="' + (ballX + nx).toFixed(1) + '" cy="' + (ballY + ny).toFixed(1) + '" r="' + ballR + '" ' +
                'fill="#d97706" stroke="#78350f" stroke-width="2"/>' +
        '<circle cx="' + (ballX + nx - 2).toFixed(1) + '" cy="' + (ballY + ny - 2).toFixed(1) + '" r="2.5" fill="#fef3c7"/>' +

        '<!-- Data card on right -->' +
        '<g transform="translate(365, 40)">' +
          '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Galileo\'s Law of Fall</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="11" font-weight="bold" fill="#3b82f6">s ∝ t² (Distance squared)</text>' +
          '<line x1="12" y1="68" x2="153" y2="68" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="88" font-size="11" fill="currentColor">Current time: <tspan font-weight="bold">t = ' + t + '</tspan></text>' +
          '<text x="12" y="106" font-size="11" fill="currentColor">Total distance: <tspan font-weight="bold">s = ' + (t * t) + ' units</tspan></text>' +
          '<line x1="12" y1="122" x2="153" y2="122" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="142" font-size="11" font-weight="bold" fill="#f59e0b">The Odd-Number Rule:</text>' +
          '<text x="12" y="160" font-size="10" fill="currentColor">t=0→1: distance = 1 unit</text>' +
          '<text x="12" y="176" font-size="10" fill="currentColor">t=1→2: distance = 3 units</text>' +
          '<text x="12" y="192" font-size="10" fill="currentColor">t=2→3: distance = 5 units</text>' +
          '<text x="12" y="208" font-size="10" fill="currentColor">t=3→4: distance = 7 units</text>' +
          '<line x1="12" y1="222" x2="153" y2="222" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="240" font-size="10" fill="var(--color-text-muted, #666)">Successive increments</text>' +
          '<text x="12" y="254" font-size="10" font-weight="bold" fill="#10b981">are consecutive odds!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Galileo’s "Diluted Gravity" Experiment (1638):</strong> Free fall is too fast to measure without electronic clocks. Galileo ingeniously rolled polished bronze balls down a smooth wooden grooved beam inclined at gentle angles. He discovered that the distance traveled grows as the <strong>square of the elapsed time</strong> ($s \\propto t^2$), and that the distances traversed in successive equal intervals of time follow the odd numbers: $1, 3, 5, 7, \\dots$';
    }

    angleSlider.addEventListener('input', draw);
    timeSlider.addEventListener('input', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 5: The Law of Refraction (Snell & Descartes)
   * ------------------------------------------------------------------------- */
  FIG['fig-descartes-snell'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-snell-theta">Angle of Incidence (θ₁): ' +
            '<span id="fig-snell-theta-val" class="fig-readout">θ₁ = 45°</span>' +
          '</label>' +
          '<input type="range" id="fig-snell-theta" min="0" max="80" step="1" value="45">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<label for="fig-snell-medium">Lower Medium: </label>' +
          '<select id="fig-snell-medium" class="fig-select">' +
            '<option value="1.33">Water (n = 1.33)</option>' +
            '<option value="1.52" selected>Crown Glass (n = 1.52)</option>' +
            '<option value="2.42">Diamond (n = 2.42)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-snell-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-snell-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-snell-theta');
    var thetaVal = container.querySelector('#fig-snell-theta-val');
    var selectMedium = container.querySelector('#fig-snell-medium');
    var svg = container.querySelector('#fig-snell-svg');
    var explain = container.querySelector('#fig-snell-explain');

    function draw() {
      var theta1Deg = parseInt(slider.value, 10);
      var n2 = parseFloat(selectMedium.value);
      var n1 = 1.00; // air

      thetaVal.textContent = 'θ₁ = ' + theta1Deg + '°';

      var theta1Rad = theta1Deg * Math.PI / 180;
      // n1 sin(theta1) = n2 sin(theta2)
      var sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;
      var theta2Rad = Math.asin(sinTheta2);
      var theta2Deg = (theta2Rad * 180 / Math.PI).toFixed(1);

      var cx = 190, cy = 180;
      var rayLen = 140;

      // Incident ray from top left: normal is vertical
      // Incident ray points: starts at (cx - rayLen * sin(theta1), cy - rayLen * cos(theta1)) to (cx, cy)
      var ix = cx - rayLen * Math.sin(theta1Rad);
      var iy = cy - rayLen * Math.cos(theta1Rad);

      // Refracted ray into lower medium: points from (cx, cy) to (cx + rayLen * sin(theta2), cy + rayLen * cos(theta2))
      var rx = cx + rayLen * Math.sin(theta2Rad);
      var ry = cy + rayLen * Math.cos(theta2Rad);

      // Reflected ray into air: (cx + rayLen * sin(theta1), cy - rayLen * cos(theta1))
      var rfx = cx + rayLen * Math.sin(theta1Rad);
      var rfy = cy - rayLen * Math.cos(theta1Rad);

      var svgContent =
        '<!-- Upper medium (Air n=1.0) -->' +
        '<rect x="0" y="0" width="370" height="180" fill="rgba(244, 244, 245, 0.4)"/>' +
        '<text x="20" y="30" font-size="12" font-weight="600" fill="currentColor">Medium 1: Air (n₁ = 1.00)</text>' +

        '<!-- Lower medium -->' +
        '<rect x="0" y="180" width="370" height="180" fill="rgba(59, 130, 246, ' + (0.12 + (n2 - 1.33) * 0.15).toFixed(2) + ')"/>' +
        '<text x="20" y="210" font-size="12" font-weight="600" fill="#3b82f6">Medium 2 (n₂ = ' + n2 + ')</text>' +

        '<!-- Interface Boundary -->' +
        '<line x1="0" y1="' + cy + '" x2="370" y2="' + cy + '" stroke="currentColor" stroke-width="2"/>' +

        '<!-- Normal line (perpendicular) -->' +
        '<line x1="' + cx + '" y1="30" x2="' + cx + '" y2="330" stroke="#71717a" stroke-width="1.2" stroke-dasharray="4 3"/>' +
        '<text x="' + (cx + 6) + '" y="45" font-size="10" fill="#71717a">Normal</text>' +

        '<!-- Incident Ray (Amber) -->' +
        '<line x1="' + ix.toFixed(1) + '" y1="' + iy.toFixed(1) + '" x2="' + cx + '" y2="' + cy + '" stroke="#f59e0b" stroke-width="3"/>' +
        '<circle cx="' + ix.toFixed(1) + '" cy="' + iy.toFixed(1) + '" r="3" fill="#f59e0b"/>' +
        '<text x="' + (ix - 8).toFixed(1) + '" y="' + iy.toFixed(1) + '" font-size="11" font-weight="bold" fill="#f59e0b" text-anchor="end">Incident Ray</text>' +

        '<!-- Refracted Ray (Blue) -->' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + rx.toFixed(1) + '" y2="' + ry.toFixed(1) + '" stroke="#3b82f6" stroke-width="3"/>' +
        '<circle cx="' + rx.toFixed(1) + '" cy="' + ry.toFixed(1) + '" r="3" fill="#3b82f6"/>' +
        '<text x="' + (rx + 8).toFixed(1) + '" y="' + ry.toFixed(1) + '" font-size="11" font-weight="bold" fill="#3b82f6">Refracted Ray</text>' +

        '<!-- Weak Reflected Ray -->' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + rfx.toFixed(1) + '" y2="' + rfy.toFixed(1) + '" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3 3"/>' +

        '<!-- Angle Arcs -->' +
        '<path d="M ' + cx + ' ' + (cy - 35) + ' A 35 35 0 0 0 ' + (cx - 35 * Math.sin(theta1Rad)).toFixed(1) + ' ' + (cy - 35 * Math.cos(theta1Rad)).toFixed(1) + '" fill="none" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="' + (cx - 24) + '" y="' + (cy - 40) + '" font-size="11" font-weight="bold" fill="#f59e0b">θ₁</text>' +

        '<path d="M ' + cx + ' ' + (cy + 40) + ' A 40 40 0 0 0 ' + (cx + 40 * Math.sin(theta2Rad)).toFixed(1) + ' ' + (cy + 40 * Math.cos(theta2Rad)).toFixed(1) + '" fill="none" stroke="#3b82f6" stroke-width="2"/>' +
        '<text x="' + (cx + 14) + '" y="' + (cy + 52) + '" font-size="11" font-weight="bold" fill="#3b82f6">θ₂</text>' +

        '<!-- Card on right -->' +
        '<g transform="translate(370, 40)">' +
          '<rect x="0" y="0" width="165" height="260" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Snell\'s Law of Refraction</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="54" font-size="12" font-weight="bold" fill="#3b82f6">n₁ sin θ₁ = n₂ sin θ₂</text>' +
          '<line x1="12" y1="68" x2="153" y2="68" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="88" font-size="11" fill="currentColor">Incident θ₁: <tspan font-weight="bold">' + theta1Deg + '°</tspan></text>' +
          '<text x="12" y="106" font-size="11" fill="currentColor">sin(θ₁): <tspan font-weight="bold">' + Math.sin(theta1Rad).toFixed(4) + '</tspan></text>' +
          '<line x1="12" y1="120" x2="153" y2="120" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="140" font-size="11" fill="currentColor">Refracted θ₂: <tspan font-weight="bold">' + theta2Deg + '°</tspan></text>' +
          '<text x="12" y="158" font-size="11" fill="currentColor">sin(θ₂): <tspan font-weight="bold">' + sinTheta2.toFixed(4) + '</tspan></text>' +
          '<line x1="12" y1="174" x2="153" y2="174" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="194" font-size="10" fill="var(--color-text-muted, #666)">Discovered by Willebrord</text>' +
          '<text x="12" y="208" font-size="10" fill="var(--color-text-muted, #666)">Snell (1621) and</text>' +
          '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">published by René</text>' +
          '<text x="12" y="238" font-size="10" font-weight="bold" fill="#10b981">Descartes (1637).</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Sine Law of Refraction:</strong> First documented by the Persian mathematician Ibn Sahl in Baghdad (984 CE), rediscovered by Willebrord Snell in Leiden (1621), and published by René Descartes in <em>La Dioptrique</em> (1637). Light bending across media is governed strictly by the <strong>ratio of the sines of the angles</strong>, demonstrating that physical optics is governed by precise mathematical invariants.';
    }

    slider.addEventListener('input', draw);
    selectMedium.addEventListener('change', draw);
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 6: Newton’s Orbital Cannon Thought Experiment
   * ------------------------------------------------------------------------- */
  FIG['fig-newton-cannon'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-cannon-v">Muzzle Velocity (v): ' +
            '<span id="fig-cannon-v-val" class="fig-readout">v = 7.9 km/s (Circular Orbital Velocity)</span>' +
          '</label>' +
          '<input type="range" id="fig-cannon-v" min="30" max="120" step="5" value="79">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-cannon-sub" class="fig-btn">Sub-orbital (5.0 km/s)</button>' +
          '<button type="button" id="fig-btn-cannon-orbit" class="fig-btn">Circular Orbit (7.9 km/s)</button>' +
          '<button type="button" id="fig-btn-cannon-escape" class="fig-btn">Escape Speed (11.2 km/s)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-cannon-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-cannon-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-cannon-v');
    var valReadout = container.querySelector('#fig-cannon-v-val');
    var btnSub = container.querySelector('#fig-btn-cannon-sub');
    var btnOrb = container.querySelector('#fig-btn-cannon-orbit');
    var btnEsc = container.querySelector('#fig-btn-cannon-escape');
    var svg = container.querySelector('#fig-cannon-svg');
    var explain = container.querySelector('#fig-cannon-explain');

    function draw() {
      var vKm = parseInt(slider.value, 10) / 10;
      valReadout.textContent = 'v = ' + vKm.toFixed(1) + ' km/s' +
        (Math.abs(vKm - 7.9) < 0.2 ? ' (Circular Orbit!)' : vKm >= 11.2 ? ' (Escape Velocity!)' : vKm < 7.9 ? ' (Impacts Ground)' : ' (Elliptical Orbit)');

      var cx = 180, cy = 180, R_earth = 95;
      var mountainH = 15;
      var launchX = cx, launchY = cy - R_earth - mountainH;

      var svgContent =
        '<!-- Atmosphere halo -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R_earth + 20) + '" fill="rgba(59, 130, 246, 0.08)"/>' +
        '<!-- Earth Disc -->' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + R_earth + '" fill="#1e3a8a" stroke="#2563eb" stroke-width="2"/>' +
        '<!-- Continents (Stylized) -->' +
        '<circle cx="' + (cx - 20) + '" cy="' + (cy - 15) + '" r="35" fill="#15803d" opacity="0.8"/>' +
        '<circle cx="' + (cx + 35) + '" cy="' + (cy + 25) + '" r="28" fill="#15803d" opacity="0.8"/>' +

        '<!-- Mountain Peak at North Pole -->' +
        '<polygon points="' + (launchX - 6) + ',' + (cy - R_earth) + ' ' + (launchX + 6) + ',' + (cy - R_earth) + ' ' + launchX + ',' + launchY + '" ' +
                 'fill="#d97706" stroke="#92400e"/>' +
        '<circle cx="' + launchX + '" cy="' + launchY + '" r="3" fill="#ef4444"/>';

      // Trajectory paths based on velocity
      if (vKm < 7.9) {
        // Sub-orbital impact
        var impactDeg = 40 + (vKm / 7.9) * 110;
        var impRad = (impactDeg - 90) * Math.PI / 180;
        var impX = cx + R_earth * Math.cos(impRad);
        var impY = cy + R_earth * Math.sin(impRad);
        svgContent +=
          '<!-- Sub-orbital ballistic trajectory -->' +
          '<path d="M ' + launchX + ' ' + launchY + ' Q ' + (launchX + 110 * (vKm/7.9)) + ' ' + (launchY - 20) + ' ' + impX.toFixed(1) + ' ' + impY.toFixed(1) + '" ' +
                'fill="none" stroke="#ef4444" stroke-width="2.5"/>' +
          '<circle cx="' + impX.toFixed(1) + '" cy="' + impY.toFixed(1) + '" r="4" fill="#ef4444"/>' +
          '<text x="' + (impX + 8).toFixed(1) + '" y="' + impY.toFixed(1) + '" font-size="10" font-weight="bold" fill="#ef4444">Impact</text>';
      } else if (Math.abs(vKm - 7.9) < 0.3) {
        // Perfect circular orbit
        svgContent +=
          '<!-- Circular Orbit -->' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R_earth + mountainH) + '" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<text x="' + cx + '" y="' + (cy + R_earth + mountainH + 16) + '" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">Continuous Circular Free Fall</text>';
      } else if (vKm < 11.2) {
        // Elliptical orbit with apogee on opposite side
        var a_orb = (R_earth + mountainH) * (1 + (vKm - 7.9) * 0.4);
        svgContent +=
          '<!-- Elliptical Orbit -->' +
          '<ellipse cx="' + cx + '" cy="' + (cy + (a_orb - (R_earth + mountainH))/2).toFixed(1) + '" rx="' + (R_earth + mountainH + 20) + '" ry="' + a_orb.toFixed(1) + '" ' +
                   'fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<text x="' + cx + '" y="340" font-size="10" font-weight="bold" fill="#f59e0b" text-anchor="middle">Elliptical Orbit (Apogee Extended)</text>';
      } else {
        // Escape velocity parabolic/hyperbolic
        svgContent +=
          '<!-- Hyperbolic Escape Trajectory -->' +
          '<path d="M ' + launchX + ' ' + launchY + ' Q ' + (launchX + 220) + ' ' + (launchY - 60) + ' 360 40" fill="none" stroke="#8b5cf6" stroke-width="3"/>' +
          '<text x="350" y="30" font-size="11" font-weight="bold" fill="#8b5cf6">Escapes Earth Orbit (v ≥ 11.2 km/s)</text>';
      }

      // Card on right
      svgContent +=
        '<g transform="translate(370, 35)">' +
          '<rect x="0" y="0" width="165" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Newton\'s Cannon (1687)</text>' +
          '<line x1="12" y1="34" x2="153" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" fill="currentColor">From <em>System of the World</em>:</text>' +
          '<text x="12" y="68" font-size="10" fill="currentColor">Firing a cannon from a</text>' +
          '<text x="12" y="82" font-size="10" fill="currentColor">very high mountain.</text>' +
          '<line x1="12" y1="96" x2="153" y2="96" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="114" font-size="11" font-weight="600" fill="#ef4444">1. Sub-orbital (&lt; 7.9):</text>' +
          '<text x="12" y="128" font-size="10" fill="currentColor">Gravity pulls ball down</text>' +
          '<text x="12" y="142" font-size="10" fill="currentColor">to hit the ground.</text>' +
          '<line x1="12" y1="156" x2="153" y2="156" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="174" font-size="11" font-weight="bold" fill="#10b981">2. Orbital Speed (7.9):</text>' +
          '<text x="12" y="190" font-size="10" fill="currentColor">Earth\'s surface curves away</text>' +
          '<text x="12" y="204" font-size="10" fill="currentColor">at the exact same rate the</text>' +
          '<text x="12" y="218" font-size="10" font-weight="bold" fill="#10b981">ball falls! (Moon\'s orbit!)</text>' +
          '<line x1="12" y1="232" x2="153" y2="232" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="250" font-size="11" font-weight="600" fill="#8b5cf6">3. Escape Speed (≥ 11.2):</text>' +
          '<text x="12" y="266" font-size="10" fill="currentColor">Breaks free forever.</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Grand Newtonian Unification:</strong> In <em>A Treatise of the System of the World</em>, Isaac Newton presented his famous thought experiment: fire a cannon horizontally from a mountain peak above air resistance. At $7.9$ km/s, the cannonball falls toward Earth, but Earth’s curvature drops away at the exact same rate ($4.9$ meters every $8$ kilometers). The cannonball falls forever without ever touching the ground: it is in <strong>orbit</strong>! The Moon is simply a celestial cannonball in continuous free fall.';
    }

    slider.addEventListener('input', draw);
    btnSub.addEventListener('click', function () { slider.value = 50; draw(); });
    btnOrb.addEventListener('click', function () { slider.value = 79; draw(); });
    btnEsc.addEventListener('click', function () { slider.value = 112; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 7: Newton’s Experimentum Crucis: Dispersion & Immobility of Colors
   * ------------------------------------------------------------------------- */
  FIG['fig-newton-prism'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-prism-slit">Movable Slit Selection: ' +
            '<span id="fig-prism-slit-val" class="fig-readout">Pure Red Ray Selected</span>' +
          '</label>' +
          '<input type="range" id="fig-prism-slit" min="0" max="4" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-slit-red" class="fig-btn">Select Red (Least Bent)</button>' +
          '<button type="button" id="fig-btn-slit-green" class="fig-btn">Select Green (Mid)</button>' +
          '<button type="button" id="fig-btn-slit-violet" class="fig-btn">Select Violet (Most Bent)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-newton-prism-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-prism-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slitSlider = container.querySelector('#fig-prism-slit');
    var slitVal = container.querySelector('#fig-prism-slit-val');
    var btnRed = container.querySelector('#fig-btn-slit-red');
    var btnGrn = container.querySelector('#fig-btn-slit-green');
    var btnVio = container.querySelector('#fig-btn-slit-violet');
    var svg = container.querySelector('#fig-newton-prism-svg');
    var explain = container.querySelector('#fig-prism-explain');

    var colors = [
      { name: 'Pure Red', hex: '#ef4444', slitY: 140, bend: 18, refrang: 'Least Refrangible' },
      { name: 'Pure Orange', hex: '#f97316', slitY: 155, bend: 22, refrang: 'Low Refrangibility' },
      { name: 'Pure Green', hex: '#10b981', slitY: 175, bend: 28, refrang: 'Intermediate Refrangibility' },
      { name: 'Pure Blue', hex: '#3b82f6', slitY: 195, bend: 34, refrang: 'High Refrangibility' },
      { name: 'Pure Violet', hex: '#8b5cf6', slitY: 215, bend: 40, refrang: 'Most Refrangible' }
    ];

    function draw() {
      var idx = parseInt(slitSlider.value, 10);
      var c = colors[idx];
      slitVal.innerHTML = '<strong style="color:' + c.hex + ';">' + c.name + ' (' + c.refrang + ')</strong>';

      var p1x = 100, p1y = 170; // Prism 1 center
      var slitX = 240;
      var p2x = 340, p2y = 180; // Prism 2 center
      var screenX = 490;

      var svgContent =
        '<defs>' +
          '<linearGradient id="rainbowGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#ef4444"/>' +
            '<stop offset="25%" stop-color="#f59e0b"/>' +
            '<stop offset="50%" stop-color="#10b981"/>' +
            '<stop offset="75%" stop-color="#3b82f6"/>' +
            '<stop offset="100%" stop-color="#8b5cf6"/>' +
          '</linearGradient>' +
        '</defs>' +

        '<!-- Incoming White Sunlight Beam -->' +
        '<line x1="20" y1="' + p1y + '" x2="' + p1x + '" y2="' + p1y + '" stroke="#fff" stroke-width="5"/>' +
        '<line x1="20" y1="' + p1y + '" x2="' + p1x + '" y2="' + p1y + '" stroke="#e4e4e7" stroke-width="3"/>' +
        '<text x="12" y="' + (p1y - 12) + '" font-size="11" font-weight="bold" fill="currentColor">White light</text>' +

        '<!-- First Glass Prism (Prism 1) -->' +
        '<polygon points="' + (p1x - 20) + ',' + (p1y + 50) + ' ' + (p1x + 20) + ',' + (p1y + 50) + ' ' + p1x + ',' + (p1y - 50) + '" ' +
                 'fill="rgba(255, 255, 255, 0.2)" stroke="#a1a1aa" stroke-width="2"/>' +
        '<text x="' + p1x + '" y="' + (p1y + 68) + '" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">Prism 1</text>' +

        '<!-- Dispersed Spectral Fan between Prism 1 and Slit -->' +
        '<polygon points="' + p1x + ',' + p1y + ' ' + slitX + ',135 ' + slitX + ',220" fill="url(#rainbowGrad)" opacity="0.75"/>' +

        '<!-- Slit Board (Diaphragm) -->' +
        '<rect x="' + slitX + '" y="50" width="8" height="' + (c.slitY - 58) + '" fill="#52525b"/>' +
        '<rect x="' + slitX + '" y="' + (c.slitY + 8) + '" width="8" height="' + (310 - (c.slitY + 8)) + '" fill="#52525b"/>' +
        '<text x="' + slitX + '" y="42" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">Slit</text>' +

        '<!-- Isolated Monochromatic Ray passing through slit to Prism 2 -->' +
        '<line x1="' + slitX + '" y1="' + c.slitY + '" x2="' + p2x + '" y2="' + c.slitY + '" stroke="' + c.hex + '" stroke-width="3.5"/>' +

        '<!-- Second Glass Prism (Prism 2) -->' +
        '<polygon points="' + (p2x - 20) + ',' + (p2y + 50) + ' ' + (p2x + 20) + ',' + (p2y + 50) + ' ' + p2x + ',' + (p2y - 50) + '" ' +
                 'fill="rgba(255, 255, 255, 0.2)" stroke="#a1a1aa" stroke-width="2"/>' +
        '<text x="' + p2x + '" y="' + (p2y + 68) + '" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">Prism 2</text>' +

        '<!-- Refracted Ray emerging from Prism 2 to Final Screen -->' +
        '<line x1="' + p2x + '" y1="' + c.slitY + '" x2="' + screenX + '" y2="' + (c.slitY + c.bend) + '" stroke="' + c.hex + '" stroke-width="3.5"/>' +
        '<!-- Target Screen -->' +
        '<line x1="' + screenX + '" y1="80" x2="' + screenX + '" y2="280" stroke="#f4f4f5" stroke-width="5"/>' +
        '<circle cx="' + screenX + '" cy="' + (c.slitY + c.bend) + '" r="6" fill="' + c.hex + '"/>' +
        '<text x="' + (screenX - 10) + '" y="' + (c.slitY + c.bend - 12) + '" font-size="11" font-weight="bold" fill="' + c.hex + '" text-anchor="end">Still ' + c.name.toLowerCase() + '</text>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Newton’s <em>Experimentum Crucis</em> (1672):</strong> Aristotelian philosophers believed that glass prisms "stained" or corrupted pure white light into colors. ' +
        'Newton disproved this forever: after separating white light with Prism 1, he used a small slit to isolate a single pure spectral ray (such as red or violet) and passed it through a second prism. ' +
        'Crucially, <strong style="color:' + c.hex + ';">the second prism bent the ray further, but did NOT alter its color or produce any new hues!</strong> ' +
        'This proved that colors are not modifications of light by matter; white light is a heterogeneous composite of primary rays, each possessing an immutable, intrinsic degree of refrangibility.';
    }

    slitSlider.addEventListener('input', draw);
    btnRed.addEventListener('click', function () { slitSlider.value = 0; draw(); });
    btnGrn.addEventListener('click', function () { slitSlider.value = 2; draw(); });
    btnVio.addEventListener('click', function () { slitSlider.value = 4; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 8: Part 6 Interactive Self-Scoring Quiz
   * ------------------------------------------------------------------------- */
  FIG['fig-quiz-part6'] = function (container) {
    var questions = [
      {
        question: "Why did Copernicus propose a heliocentric model in 'De revolutionibus' (1543)?",
        options: [
          "He proved that the Sun's gravity is stronger than Earth's",
          "It naturally explained planetary retrograde loops as optical perspective effects and eliminated arbitrary planetary epicycle periods",
          "He had observed craters on the Moon through a telescope",
          "He wanted to confirm Johannes Kepler's elliptical orbit equations"
        ],
        answer: 1,
        explanation: "Copernicus showed that retrograde motion is an optical perspective illusion caused by Earth overtaking slower outer planets, naturally explaining why retrograde loops only occur at opposition without needing Ptolemy's ad-hoc epicycle gear synchronizations."
      },
      {
        question: "What observational discovery by Tycho Brahe in 1572 shattered Aristotle's doctrine of immutable heavenly spheres?",
        options: [
          "A 'New Star' (Supernova 1572) that displayed zero measurable daily parallax, proving it lay far beyond the Moon in the supposedly changeless stellar sphere",
          "The moons of Jupiter",
          "The rings of Saturn",
          "The phases of Mercury"
        ],
        answer: 0,
        explanation: "Tycho Brahe's rigorous triangulation showed that the 1572 supernova displayed no diurnal parallax relative to nearby stars, proving it was situated far beyond the Moon in the celestial realm, disproving the Aristotelian dogma that the heavens are eternal and unalterable."
      },
      {
        question: "What stubborn numerical discrepancy forced Johannes Kepler to abandon circular orbits for Mars?",
        options: [
          "A 45-degree error in solar eclipse calculations",
          "A 3-day error in the Martian calendar",
          "The discovery of Martian moons",
          "An 8-arcminute discrepancy between Tycho Brahe's observations and the best possible circular orbit"
        ],
        answer: 3,
        explanation: "In 'Astronomia Nova' (1609), Kepler wrote that if he had believed he could ignore 8 arcminutes of error, he would have patched up the hypothesis; but because Tycho's observations were accurate to within 2 arcminutes, those 8 arcminutes alone paved the way for a total reformation of astronomy (ellipses)."
      },
      {
        question: "How did Galileo’s observation of the phases of Venus in 1610 decisively disprove Ptolemaic geocentrism?",
        options: [
          "Venus exhibited a complete cycle of phases (from crescent to gibbous and full), proving it orbits the Sun, which was geometrically impossible in Ptolemy's model",
          "It showed that Venus emits its own light",
          "It revealed oceans and continents on Venus",
          "It proved Venus has four orbiting moons"
        ],
        answer: 0,
        explanation: "In Ptolemy's system, Venus is permanently tethered between the Earth and the Sun and could never appear more than half illuminated. Galileo observed a full cycle of phases from crescent to gibbous, proving Venus passes behind the Sun as it orbits."
      },
      {
        question: "What did Galileo demonstrate using his inclined plane experiments in the 'Two New Sciences' (1638)?",
        options: [
          "The total distance traveled by an accelerating body is proportional to the square of the elapsed time (s ∝ t²), with distance increments following the odd numbers",
          "Heavier objects fall significantly faster than lighter ones in proportion to their weight",
          "Friction can be completely eliminated by applying olive oil",
          "Pendulum frequency depends strictly on the bob's mass"
        ],
        answer: 0,
        explanation: "By diluting gravity down an inclined plane, Galileo proved that uniform acceleration produces distance proportional to time squared (s ∝ t²), and that successive distances traversed in equal time intervals follow the sequence of odd numbers (1, 3, 5, 7, ...)."
      },
      {
        question: "What was the core epistemological argument of Francis Bacon’s 'Novum Organum' (1620)?",
        options: [
          "All knowledge can be derived through pure Cartesian mathematical deduction",
          "Ancient scholastic authority is superior to modern observation",
          "Physics should be subordinated to astrology",
          "Scientific truth must be built systematically from structured empirical observations and experiments using inductive tables, clearing away 'Idols of the Mind'"
        ],
        answer: 3,
        explanation: "Bacon rejected blind reliance on traditional syllogisms and scholastic authority, arguing that true natural knowledge must be built from the ground up through systematic inductive observation, experimental tables, and elimination of cognitive biases ('Idols')."
      },
      {
        question: "What was the primary scientific motto of the Royal Society of London, founded in 1660?",
        options: [
          "'Cogito, ergo sum' (I think, therefore I am)",
          "'Nullius in verba' (Take nobody's word for it)",
          "'Panta arithmos' (All is number)",
          "'E pur si muove' (And yet it moves)"
        ],
        answer: 1,
        explanation: "The Royal Society adopted the motto 'Nullius in verba' (roughly 'Take nobody's word for it'), declaring its determination to establish scientific facts through verified collaborative experiment rather than deference to authority."
      },
      {
        question: "What did Antoni van Leeuwenhoek discover using his handcrafted single-lens microscopes in Delft?",
        options: [
          "The atomic lattice of silicon crystals",
          "Living single-celled protozoa and bacteria ('animalcules') in pond water and dental plaque",
          "The cellular structure of cork which he named 'cells'",
          "The wave nature of X-rays"
        ],
        answer: 1,
        explanation: "Using tiny, exquisitely ground spherical glass beads achieving 270x magnification, Leeuwenhoek discovered the microscopic living world of bacteria and protozoa, reporting his findings to the Royal Society of London in 1674–1676."
      },
      {
        question: "What did Newton’s 'experimentum crucis' (crucial experiment) with two prisms demonstrate about white light?",
        options: [
          "Glass prisms physically tint and stain pure light into rainbow colors",
          "Light travels faster in glass than in air",
          "Colors exist only in the human eye and have no physical wavelength",
          "White light is a heterogeneous mixture of rays with differing innate refrangibilities; once isolated, monochromatic colors cannot be altered by further refraction"
        ],
        answer: 3,
        explanation: "Newton showed that isolating a single color (like red) with a slit and passing it through a second prism bent the ray but did not change its color, proving that white sunlight is a composite of rays with immutable refrangibilities rather than altered light."
      },
      {
        question: "What is the physical meaning of Newton’s Universal Law of Gravitation (F = G · m₁m₂ / r²)?",
        options: [
          "Planets are pushed along their orbits by swirling Cartesian ether vortexes",
          "The exact same mathematical inverse-square attractive force that causes an apple to fall on Earth governs the orbital motion of the Moon, planets, and comets",
          "Gravity only exists within Earth's atmosphere and stops at the Moon",
          "Mass and energy are interchangeable via E = mc²"
        ],
        answer: 1,
        explanation: "Newton's triumph in the 'Principia' (1687) was proving that terrestrial gravity (the falling apple) and celestial mechanics (the Moon orbiting Earth and planets orbiting the Sun) are governed by the exact same universal inverse-square mathematical force."
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
            '<h4 style="margin:0; font-size:1.15rem;">Part 6 Evaluation: The Scientific Revolution</h4>' +
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
