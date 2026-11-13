/* ==========================================================================
   RNLearn — Figures for "Gods, Stars and Calendars: The Dawn of Systematic Order"
   Slug: gods-stars-and-calendars
   Figures:
     1. fig-sexagesimal-calc: Base-60 positional converter & cuneiform visualizer
     2. fig-heliacal-rising: Heliacal rising of Sirius (Sopdet) twilight simulator
     3. fig-plimpton322: Plimpton 322 Pythagorean triples & reciprocal calculator
     4. fig-indus-weights: Indus Valley dual binary-decimal metrological balance
     5. fig-egyptian-seked: Egyptian architectural pyramid slope (seked) calculator
     6. fig-metonic-cycle: 19-year solar-lunar synchronization cycle simulator
     7. fig-mayan-calendar: Maya Calendar Round intermeshing gear train
     8. fig-quiz-part2: 10-question self-assessment quiz with detailed rationale
   ========================================================================== */

(function () {
  'use strict';

  var FIG = window.FIG || {};

  /* -------------------------------------------------------------------------
     Figure 1: Sumerian / Babylonian Sexagesimal Positional Converter
     ------------------------------------------------------------------------- */
  FIG['fig-sexagesimal-calc'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentNum = 4283; // Default test number

    var readouts = FIG.readouts(container, [
      { id: "sexag-repr", label: "Sexagesimal Positional Form", value: "1, 11, 23" },
      { id: "expanded-math", label: "Polynomial Decomposition", value: "1×3600 + 11×60 + 23" },
      { id: "divisors-count", label: "Base 60 Divisors", value: "12 distinct factors" }
    ]);

    function renderCuneiform() {
      dispWrap.innerHTML = '';
      var n = Math.max(1, Math.min(215999, currentNum));

      // Decompose into powers of 60: 60^2 (3600s), 60^1 (60s), 60^0 (1s)
      var p2 = Math.floor(n / 3600);
      var rem = n % 3600;
      var p1 = Math.floor(rem / 60);
      var p0 = rem % 60;

      readouts.update("sexag-repr", (p2 > 0 ? p2 + ", " : "") + p1 + ", " + p0);
      readouts.update("expanded-math", (p2 > 0 ? p2 + "×60² + " : "") + p1 + "×60¹ + " + p0 + "×60⁰ = " + n);

      var w = 680, h = 260;
      var svg = FIG.createSVG(dispWrap, w, h, "Babylonian cuneiform sexagesimal numerals");

      var bgCol = FIG.getCSSVar('--surface-raised', '#dedbd2');
      var clayCol = FIG.getCSSVar('--surface', '#fcfbf9');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var textCol = FIG.getCSSVar('--ink-secondary', '#4a4d57');

      // 3 Clay Tablet Column Sections
      var cols = [
        { title: "60² Place (×3,600)", val: p2, x: 80, show: (p2 > 0) },
        { title: "60¹ Place (×60)", val: p1, x: 280, show: true },
        { title: "60⁰ Place (Units)", val: p0, x: 480, show: true }
      ];

      cols.forEach(function (col) {
        if (!col.show) return;

        // Column tablet card
        var card = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        card.setAttribute('x', col.x - 60);
        card.setAttribute('y', "30");
        card.setAttribute('width', "170");
        card.setAttribute('height', "180");
        card.setAttribute('rx', "10");
        card.setAttribute('fill', bgCol);
        card.setAttribute('stroke', FIG.getCSSVar('--border-strong'));
        card.setAttribute('stroke-width', "1.5");
        svg.appendChild(card);

        // Header label
        var tHeader = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tHeader.setAttribute('x', col.x + 25);
        tHeader.setAttribute('y', "55");
        tHeader.setAttribute('text-anchor', 'middle');
        tHeader.setAttribute('font-size', '11');
        tHeader.setAttribute('font-weight', '700');
        tHeader.setAttribute('fill', strokeCol);
        tHeader.textContent = col.title;
        svg.appendChild(tHeader);

        // Numeric value
        var tVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tVal.setAttribute('x', col.x + 25);
        tVal.setAttribute('y', "80");
        tVal.setAttribute('text-anchor', 'middle');
        tVal.setAttribute('font-size', '18');
        tVal.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
        tVal.setAttribute('font-weight', '700');
        tVal.setAttribute('fill', accentCol);
        tVal.textContent = col.val;
        svg.appendChild(tVal);

        // Draw Cuneiform Glyphs: Chevrons (tens) and Wedges (units)
        var tens = Math.floor(col.val / 10);
        var units = col.val % 10;

        // Draw Chevrons (angle corner wedges for 10)
        for (var i = 0; i < tens; i++) {
          var cx = col.x - 40 + (i % 3) * 22;
          var cy = 100 + Math.floor(i / 3) * 25;
          var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          chevron.setAttribute('d', "M " + cx + " " + cy + " L " + (cx + 14) + " " + (cy + 7) + " L " + cx + " " + (cy + 14) + " L " + (cx + 5) + " " + (cy + 7) + " Z");
          chevron.setAttribute('fill', strokeCol);
          svg.appendChild(chevron);
        }

        // Draw Vertical Wedges (units)
        for (var j = 0; j < units; j++) {
          var ux = col.x + 30 + (j % 3) * 16;
          var uy = 100 + Math.floor(j / 3) * 25;
          var wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          wedge.setAttribute('d', "M " + ux + " " + uy + " L " + (ux + 8) + " " + uy + " L " + (ux + 4) + " " + (uy + 16) + " Z");
          wedge.setAttribute('fill', accentCol);
          svg.appendChild(wedge);
        }

        // Subtitle explanation
        var subTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subTxt.setAttribute('x', col.x + 25);
        subTxt.setAttribute('y', "195");
        subTxt.setAttribute('text-anchor', 'middle');
        subTxt.setAttribute('font-size', '10');
        subTxt.setAttribute('fill', textCol);
        subTxt.textContent = tens + " tens + " + units + " units";
        svg.appendChild(subTxt);
      });

      // Bottom note
      var botNote = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      botNote.setAttribute('x', "340");
      botNote.setAttribute('y', "240");
      botNote.setAttribute('text-anchor', 'middle');
      botNote.setAttribute('font-size', '11');
      botNote.setAttribute('font-family', FIG.getCSSVar('--font-sans'));
      botNote.setAttribute('fill', textCol);
      botNote.textContent = "Corner chevrons (<) represent 10; vertical downward wedges (v) represent 1.";
      svg.appendChild(botNote);
    }

    FIG.slider(controls, {
      id: "number-input",
      label: "Decimal Integer Value to Convert to Base 60:",
      min: 1,
      max: 25000,
      step: 1,
      value: currentNum,
      unit: "",
      onChange: function (val) {
        currentNum = val;
        renderCuneiform();
      }
    });

    renderCuneiform();
  };

  /* -------------------------------------------------------------------------
     Figure 2: Heliacal Rising of Sirius (Sopdet) Twilight Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-heliacal-rising'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var svgWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(svgWrap);

    var currentSunAltitude = -12; // Degrees below horizon (-20 to 0)

    var readouts = FIG.readouts(container, [
      { id: "twilight-state", label: "Twilight Regime", value: "Nautical Twilight (-12°)" },
      { id: "sirius-visibility", label: "Sirius Visibility", value: "EMERGING (First Glimpse at Dawn Horizon)" },
      { id: "nile-flood-alert", label: "Egyptian Calendar Event", value: "Wep Ronpet (New Year & Annual Flood)" }
    ]);

    function renderHorizon() {
      svgWrap.innerHTML = '';
      var alt = currentSunAltitude;

      var isVisible = (alt <= -10 && alt >= -15);
      var stateText = "Astronomical Darkness";
      if (alt > -6) stateText = "Civil Twilight (Sky too bright; washed out)";
      else if (alt > -12) stateText = "Nautical Twilight (Optimal Heliacal Window: -11° to -14°)";
      else if (alt > -18) stateText = "Astronomical Twilight (Stars bright, sun deep)";
      else stateText = "Full Night";

      readouts.update("twilight-state", stateText + " (" + alt + "°)");
      readouts.update("sirius-visibility", isVisible ? "VISIBLE: Heliacal Rising Confirmed (Sopdet spotted!)" : (alt > -10 ? "WASHED OUT: Solar glare overpowers Sirius" : "TOO EARLY: Horizon obstructed by pre-dawn haze"));
      readouts.update("nile-flood-alert", isVisible ? "Heralds Akhet Inundation & Sothic New Year (I Akhet 1)" : "Awaiting seasonal heliacal conjunction");

      var w = 680, h = 320;
      var svg = FIG.createSVG(svgWrap, w, h, "Heliacal rising of Sirius at dawn over Egypt");

      // Sky background gradient dynamically colored by solar altitude
      var skyBrightness = Math.max(0, Math.min(1, (alt + 20) / 20));
      var skyColor = "rgb(" + Math.round(15 + skyBrightness * 180) + "," + Math.round(15 + skyBrightness * 120) + "," + Math.round(35 + skyBrightness * 140) + ")";

      var skyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      skyRect.setAttribute('x', "0"); skyRect.setAttribute('y', "0");
      skyRect.setAttribute('width', w); skyRect.setAttribute('height', "220");
      skyRect.setAttribute('fill', skyColor);
      svg.appendChild(skyRect);

      // Desert & Nile horizon line at y = 220
      var ground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      ground.setAttribute('x', "0"); ground.setAttribute('y', "220");
      ground.setAttribute('width', w); ground.setAttribute('height', "100");
      ground.setAttribute('fill', "#2b1c10");
      svg.appendChild(ground);

      // Distant Pyramids & Nile water on horizon
      var pyramid = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      pyramid.setAttribute('points', "120,220 180,165 240,220");
      pyramid.setAttribute('fill', "#1a120b");
      svg.appendChild(pyramid);

      var nile = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      nile.setAttribute('d', "M 0 260 Q 340 240, 680 270 L 680 320 L 0 320 Z");
      nile.setAttribute('fill', "#142d42");
      svg.appendChild(nile);

      // Eastern Horizon Line
      var hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hLine.setAttribute('x1', "0"); hLine.setAttribute('y1', "220");
      hLine.setAttribute('x2', w); hLine.setAttribute('y2', "220");
      hLine.setAttribute('stroke', "#b45309");
      hLine.setAttribute('stroke-width', "1.5");
      svg.appendChild(hLine);

      // Sun position below horizon (x = 520, y calculated from altitude)
      var sunY = 220 - (alt * 5); // When alt = -10, y = 270 (below ground)
      var sunGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      sunGlow.setAttribute('cx', "520"); sunGlow.setAttribute('cy', sunY);
      sunGlow.setAttribute('r', "45");
      sunGlow.setAttribute('fill', "rgba(255, 180, 50, 0.35)");
      svg.appendChild(sunGlow);

      // Sirius (Sopdet) Star Position (East Horizon: x = 440, altitude above horizon ~ 4° to 8°)
      var siriusAltitude = (alt + 18) * 0.8; // Sirius is slightly higher than the sun
      var siriusY = 220 - (siriusAltitude * 6);

      if (siriusY < 220) {
        var siriusStar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        siriusStar.setAttribute('cx', "440");
        siriusStar.setAttribute('cy', siriusY);
        siriusStar.setAttribute('r', isVisible ? "6" : "2.5");
        siriusStar.setAttribute('fill', isVisible ? "#60a5fa" : "#ffffff");
        siriusStar.setAttribute('stroke', isVisible ? "#ffffff" : "none");
        siriusStar.setAttribute('stroke-width', "2");
        svg.appendChild(siriusStar);

        // Rays for Sirius if in heliacal window
        if (isVisible) {
          var rayH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          rayH.setAttribute('x1', "425"); rayH.setAttribute('y1', siriusY);
          rayH.setAttribute('x2', "455"); rayH.setAttribute('y2', siriusY);
          rayH.setAttribute('stroke', "#ffffff"); rayH.setAttribute('stroke-width', "1.5");
          svg.appendChild(rayH);

          var rayV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          rayV.setAttribute('x1', "440"); rayV.setAttribute('y1', siriusY - 15);
          rayV.setAttribute('x2', "440"); rayV.setAttribute('y2', siriusY + 15);
          rayV.setAttribute('stroke', "#ffffff"); rayV.setAttribute('stroke-width', "1.5");
          svg.appendChild(rayV);

          var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', "455"); label.setAttribute('y', siriusY - 8);
          label.setAttribute('font-size', "12"); label.setAttribute('font-weight', "700");
          label.setAttribute('fill', "#ffffff");
          label.textContent = "Sirius (Sopdet) Rising!";
          svg.appendChild(label);
        }
      }

      // Compass text
      var eastTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      eastTxt.setAttribute('x', "480"); eastTxt.setAttribute('y', "240");
      eastTxt.setAttribute('font-size', "12"); eastTxt.setAttribute('font-weight', "700");
      eastTxt.setAttribute('fill', "#f59e0b");
      eastTxt.textContent = "Eastern Horizon (Dawn)";
      svg.appendChild(eastTxt);
    }

    FIG.slider(controls, {
      id: "solar-altitude",
      label: "Solar Altitude Angle (Degrees below eastern horizon):",
      min: -20,
      max: -2,
      step: 0.5,
      value: currentSunAltitude,
      unit: "°",
      onChange: function (val) {
        currentSunAltitude = val;
        renderHorizon();
      }
    });

    renderHorizon();
  };

  /* -------------------------------------------------------------------------
     Figure 3: Plimpton 322 Babylonian Pythagorean Triples Calculator
     ------------------------------------------------------------------------- */
  FIG['fig-plimpton322'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    // 15 Preserved Rows on Tablet Plimpton 322
    // Data: row number, reciprocal pair (p, q), width b, diagonal d, length l = sqrt(d^2 - b^2)
    var rows = [
      { row: 1, p: 12, q: 5, b: 119, d: 169, l: 120, sexagRatio: "1;59,00,15" },
      { row: 2, p: 64, q: 27, b: 3367, d: 4825, l: 3456, sexagRatio: "1;56,56,58" },
      { row: 3, p: 75, q: 32, b: 4601, d: 6649, l: 4800, sexagRatio: "1;55,07,41" },
      { row: 4, p: 125, q: 54, b: 12709, d: 18541, l: 13500, sexagRatio: "1;53,10,29" },
      { row: 5, p: 9, q: 4, b: 65, d: 97, l: 72, sexagRatio: "1;48,54,01" },
      { row: 6, p: 20, q: 9, b: 319, d: 481, l: 360, sexagRatio: "1;47,06,41" },
      { row: 7, p: 54, q: 25, b: 2291, d: 3541, l: 2700, sexagRatio: "1;43,11,56" },
      { row: 8, p: 32, q: 15, b: 799, d: 1249, l: 960, sexagRatio: "1;41,33,59" },
      { row: 9, p: 25, q: 12, b: 481, d: 769, l: 600, sexagRatio: "1;38,33,36" },
      { row: 10, p: 81, q: 40, b: 4961, d: 8161, l: 6480, sexagRatio: "1;35,10,02" },
      { row: 11, p: 2, q: 1, b: 3, d: 5, l: 4, sexagRatio: "1;33,45" },
      { row: 12, p: 48, q: 25, b: 1679, d: 2929, l: 2400, sexagRatio: "1;29,21,54" },
      { row: 13, p: 15, q: 8, b: 161, d: 289, l: 240, sexagRatio: "1;27,00,03" },
      { row: 14, p: 50, q: 27, b: 1771, d: 3229, l: 2700, sexagRatio: "1;25,48,51" },
      { row: 15, p: 9, q: 5, b: 56, d: 106, l: 90, sexagRatio: "1;23,13,46" }
    ];

    var selectedIdx = 0;

    var readouts = FIG.readouts(container, [
      { id: "pythag-identity", label: "Pythagorean Equation Verified", value: "119² + 120² = 169² (14161 + 14400 = 28561)" },
      { id: "generator-pair", label: "Sexagesimal Reciprocal Generators (p, q)", value: "p = 12, q = 5" },
      { id: "diag-angle", label: "Triangle Angle (arctan b / l)", value: "44.76°" }
    ]);

    function renderTriangle() {
      dispWrap.innerHTML = '';
      var r = rows[selectedIdx];

      var bSquared = r.b * r.b;
      var lSquared = r.l * r.l;
      var dSquared = r.d * r.d;
      var angle = (Math.atan(r.b / r.l) * 180 / Math.PI).toFixed(2);

      readouts.update("pythag-identity", r.b + "² + " + r.l + "² = " + r.d + "² (" + bSquared + " + " + lSquared + " = " + dSquared + ")");
      readouts.update("generator-pair", "p = " + r.p + ", q = " + r.q + " (b = p² - q², l = 2pq, d = p² + q²)");
      readouts.update("diag-angle", angle + "° (Col 1 Ratio: " + r.sexagRatio + ")");

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Babylonian tablet Plimpton 322 right-triangle geometry");

      // Draw right triangle scaled to box
      var scale = 180 / Math.max(r.b, r.l);
      var tWidth = r.l * scale;
      var tHeight = r.b * scale;

      var originX = 140, originY = 240;
      var cornerX = originX + tWidth;
      var topY = originY - tHeight;

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var fillCol = FIG.getCSSVar('--accent-light', '#e8eff5');

      // Triangle polygon
      var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      tri.setAttribute('points', originX + "," + originY + " " + cornerX + "," + originY + " " + cornerX + "," + topY);
      tri.setAttribute('fill', fillCol);
      tri.setAttribute('stroke', strokeCol);
      tri.setAttribute('stroke-width', "2.5");
      svg.appendChild(tri);

      // Right angle square marker
      var sq = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sq.setAttribute('d', "M " + (cornerX - 15) + " " + originY + " L " + (cornerX - 15) + " " + (originY - 15) + " L " + cornerX + " " + (originY - 15));
      sq.setAttribute('fill', 'none');
      sq.setAttribute('stroke', strokeCol);
      sq.setAttribute('stroke-width', "1.5");
      svg.appendChild(sq);

      // Side Labels
      var lblL = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblL.setAttribute('x', originX + tWidth / 2); lblL.setAttribute('y', originY + 25);
      lblL.setAttribute('text-anchor', 'middle'); lblL.setAttribute('font-size', '13'); lblL.setAttribute('font-weight', '700');
      lblL.setAttribute('fill', strokeCol);
      lblL.textContent = "Length l = " + r.l;
      svg.appendChild(lblL);

      var lblB = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblB.setAttribute('x', cornerX + 15); lblB.setAttribute('y', originY - tHeight / 2);
      lblB.setAttribute('font-size', '13'); lblB.setAttribute('font-weight', '700');
      lblB.setAttribute('fill', strokeCol);
      lblB.textContent = "Width b = " + r.b;
      svg.appendChild(lblB);

      var lblD = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblD.setAttribute('x', originX + tWidth / 2 - 25); lblD.setAttribute('y', originY - tHeight / 2 - 10);
      lblD.setAttribute('font-size', '13'); lblD.setAttribute('font-weight', '700');
      lblD.setAttribute('fill', accentCol);
      lblD.textContent = "Diagonal d = " + r.d;
      svg.appendChild(lblD);

      // Explanatory note
      var note = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      note.setAttribute('x', "450"); note.setAttribute('y', "90");
      note.setAttribute('font-size', "11"); note.setAttribute('fill', FIG.getCSSVar('--ink-secondary'));
      note.textContent = "Tablet Plimpton 322 (Larsa, ~1800 BCE)";
      svg.appendChild(note);

      var note2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      note2.setAttribute('x', "450"); note2.setAttribute('y', "110");
      note2.setAttribute('font-size', "11"); note2.setAttribute('fill', FIG.getCSSVar('--ink-secondary'));
      note2.textContent = "Col II: " + r.b + " (b) | Col III: " + r.d + " (d)";
      svg.appendChild(note2);

      var note3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      note3.setAttribute('x', "450"); note3.setAttribute('y', "130");
      note3.setAttribute('font-size', "11"); note3.setAttribute('fill', accentCol);
      note3.textContent = "Generated via regular reciprocal pairs!";
      svg.appendChild(note3);
    }

    FIG.select(controls, {
      id: "plimpton-row-select",
      label: "Select Row from Tablet Plimpton 322:",
      options: rows.map(function (r, idx) {
        return {
          value: String(idx),
          label: "Row " + r.row + ": b=" + r.b + ", d=" + r.d + ", l=" + r.l + " (" + (Math.atan(r.b / r.l) * 180 / Math.PI).toFixed(1) + "°)"
        };
      }),
      value: "0",
      onChange: function (val) {
        selectedIdx = parseInt(val, 10);
        renderTriangle();
      }
    });

    renderTriangle();
  };

  /* -------------------------------------------------------------------------
     Figure 4: Indus Valley Dual Binary-Decimal Weight Balance Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-indus-weights'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    // Standard Indus Unit = 0.857 grams (Base 1)
    var unitWeight = 0.857;
    var currentMultiplier = 16; // Standard trade unit = 16 (13.71 grams)

    var readouts = FIG.readouts(container, [
      { id: "nominal-mass", label: "Indus Standard Mass", value: "13.71 grams" },
      { id: "binary-ratio", label: "Metrological Class", value: "Unit 16 (Standard Commercial Weight)" },
      { id: "inter-city-error", label: "Harappa vs Mohenjo-daro Tolerance", value: "< 1.2% analytical error" }
    ]);

    function renderBalance() {
      dispWrap.innerHTML = '';
      var mass = (currentMultiplier * unitWeight).toFixed(2);
      var className = currentMultiplier <= 64 ? "Binary Ratio (" + currentMultiplier + "× base)" : "Decimal Ratio (" + (currentMultiplier / 16) + "× decade of Unit 16)";

      readouts.update("nominal-mass", mass + " grams (" + (mass * 15.432).toFixed(1) + " grains)");
      readouts.update("binary-ratio", className);

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Indus Valley metrological cubic chert balance");

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var chertCol = FIG.getCSSVar('--surface-raised', '#cfcbbe');
      var bronzeCol = "#b45309";

      // Balance Beam (Fulcrum at x = 340, y = 100)
      var beam = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      beam.setAttribute('x1', "160"); beam.setAttribute('y1', "100");
      beam.setAttribute('x2', "520"); beam.setAttribute('y2', "100");
      beam.setAttribute('stroke', bronzeCol); beam.setAttribute('stroke-width', "4");
      svg.appendChild(beam);

      // Central Pillar
      var pillar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      pillar.setAttribute('x1', "340"); pillar.setAttribute('y1', "100");
      pillar.setAttribute('x2', "340"); pillar.setAttribute('y2', "260");
      pillar.setAttribute('stroke', strokeCol); pillar.setAttribute('stroke-width', "5");
      svg.appendChild(pillar);

      // Fulcrum Pivot Triangle
      var pivot = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      pivot.setAttribute('points', "340,92 330,110 350,110");
      pivot.setAttribute('fill', bronzeCol);
      svg.appendChild(pivot);

      // Left Pan Strings & Pan (Weights)
      var s1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      s1.setAttribute('x1', "160"); s1.setAttribute('y1', "100"); s1.setAttribute('x2', "130"); s1.setAttribute('y2', "180");
      s1.setAttribute('stroke', strokeCol); s1.setAttribute('stroke-width', "1");
      svg.appendChild(s1);

      var s2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      s2.setAttribute('x1', "160"); s2.setAttribute('y1', "100"); s2.setAttribute('x2', "190"); s2.setAttribute('y2', "180");
      s2.setAttribute('stroke', strokeCol); s2.setAttribute('stroke-width', "1");
      svg.appendChild(s2);

      var panLeft = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      panLeft.setAttribute('d', "M 115 180 Q 160 205, 205 180 Z");
      panLeft.setAttribute('fill', bronzeCol);
      svg.appendChild(panLeft);

      // Chert Cube on Left Pan (scaled to multiplier)
      var cubeSize = Math.max(14, Math.min(48, 12 + Math.sqrt(currentMultiplier) * 3.5));
      var cube = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      cube.setAttribute('x', 160 - cubeSize / 2);
      cube.setAttribute('y', 178 - cubeSize);
      cube.setAttribute('width', cubeSize);
      cube.setAttribute('height', cubeSize);
      cube.setAttribute('fill', chertCol);
      cube.setAttribute('stroke', strokeCol);
      cube.setAttribute('stroke-width', "1.5");
      svg.appendChild(cube);

      // Right Pan Strings & Pan (Commercial Trade Goods: Carnelian Beads)
      var s3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      s3.setAttribute('x1', "520"); s3.setAttribute('y1', "100"); s3.setAttribute('x2', "490"); s3.setAttribute('y2', "180");
      s3.setAttribute('stroke', strokeCol); s3.setAttribute('stroke-width', "1");
      svg.appendChild(s3);

      var s4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      s4.setAttribute('x1', "520"); s4.setAttribute('y1', "100"); s4.setAttribute('x2', "550"); s4.setAttribute('y2', "180");
      s4.setAttribute('stroke', strokeCol); s4.setAttribute('stroke-width', "1");
      svg.appendChild(s4);

      var panRight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      panRight.setAttribute('d', "M 475 180 Q 520 205, 565 180 Z");
      panRight.setAttribute('fill', bronzeCol);
      svg.appendChild(panRight);

      // Beads on Right Pan
      var beadsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var numBeads = Math.min(18, currentMultiplier);
      for (var b = 0; b < numBeads; b++) {
        var bd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bd.setAttribute('cx', 505 + (b % 5) * 7);
        bd.setAttribute('cy', 176 - Math.floor(b / 5) * 6);
        bd.setAttribute('r', "3.5");
        bd.setAttribute('fill', "#dc2626"); // Carnelian red
        beadsG.appendChild(bd);
      }
      svg.appendChild(beadsG);

      // Label
      var cap = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      cap.setAttribute('x', "160"); cap.setAttribute('y', "225");
      cap.setAttribute('text-anchor', 'middle'); cap.setAttribute('font-size', '12'); cap.setAttribute('font-weight', '700');
      cap.setAttribute('fill', strokeCol);
      cap.textContent = "Chert Weight: " + mass + " g";
      svg.appendChild(cap);

      var capR = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      capR.setAttribute('x', "520"); capR.setAttribute('y', "225");
      capR.setAttribute('text-anchor', 'middle'); capR.setAttribute('font-size', '12'); capR.setAttribute('font-weight', '700');
      capR.setAttribute('fill', "#dc2626");
      capR.textContent = "Harappan Trade Commodities";
      svg.appendChild(capR);
    }

    FIG.select(controls, {
      id: "indus-weight-ratio",
      label: "Select Standard Indus Chert Weight Unit:",
      options: [
        { value: "1", label: "Ratio 1 (Base Unit = 0.86 g — Fine Gold/Gems)" },
        { value: "2", label: "Ratio 2 (1.71 g)" },
        { value: "4", label: "Ratio 4 (3.43 g)" },
        { value: "8", label: "Ratio 8 (6.86 g)" },
        { value: "16", label: "Ratio 16 (13.71 g — Standard Commercial Benchmark)" },
        { value: "32", label: "Ratio 32 (27.42 g)" },
        { value: "64", label: "Ratio 64 (54.85 g)" },
        { value: "160", label: "Ratio 160 (137.1 g — Decimal 10× of Unit 16)" },
        { value: "320", label: "Ratio 320 (274.2 g — Decimal 20× of Unit 16)" }
      ],
      value: "16",
      onChange: function (val) {
        currentMultiplier = parseInt(val, 10);
        renderBalance();
      }
    });

    renderBalance();
  };

  /* -------------------------------------------------------------------------
     Figure 5: Egyptian Architectural Pyramid Slope (Seked) Calculator
     ------------------------------------------------------------------------- */
  FIG['fig-egyptian-seked'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentBase = 440; // Royal Cubits (Great Pyramid Khufu base)
    var currentHeight = 280; // Royal Cubits (Great Pyramid Khufu height)

    var readouts = FIG.readouts(container, [
      { id: "seked-result", label: "Calculated Seked", value: "5 palms, 2 fingers per cubit rise" },
      { id: "slope-angle", label: "Face Incline Angle", value: "51.84° (51° 50')" },
      { id: "royal-metrology", label: "Egyptian Royal Metrology", value: "1 Royal Cubit = 7 Palms = 28 Fingers" }
    ]);

    function renderPyramid() {
      dispWrap.innerHTML = '';

      // Egyptian Seked Formula (RMP 56):
      // Half-base in cubits = Base / 2
      // Seked (in palms) = (Half-base / Height) * 7 palms
      var halfBase = currentBase / 2;
      var sekedPalmsTotal = (halfBase / currentHeight) * 7;
      var wholePalms = Math.floor(sekedPalmsTotal);
      var fingers = Math.round((sekedPalmsTotal - wholePalms) * 4);
      if (fingers === 4) { wholePalms += 1; fingers = 0; }

      var angleRad = Math.atan(currentHeight / halfBase);
      var angleDeg = (angleRad * 180 / Math.PI).toFixed(2);

      readouts.update("seked-result", wholePalms + " palms" + (fingers > 0 ? ", " + fingers + " fingers" : "") + " per cubit rise (" + sekedPalmsTotal.toFixed(2) + " palms)");
      readouts.update("slope-angle", angleDeg + "° inclination");

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Egyptian seked architectural slope geometry");

      // Draw Cross-Section
      var basePx = 360;
      var heightPx = (currentHeight / halfBase) * (basePx / 2);
      // Scale if too tall
      if (heightPx > 200) {
        var sc = 200 / heightPx;
        basePx *= sc;
        heightPx *= sc;
      }

      var midX = 340, groundY = 250;
      var leftX = midX - basePx / 2;
      var rightX = midX + basePx / 2;
      var apexY = groundY - heightPx;

      var fillCol = FIG.getCSSVar('--accent-light', '#e8eff5');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');

      // Pyramid triangle
      var pyr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      pyr.setAttribute('points', leftX + "," + groundY + " " + midX + "," + apexY + " " + rightX + "," + groundY);
      pyr.setAttribute('fill', fillCol);
      pyr.setAttribute('stroke', strokeCol);
      pyr.setAttribute('stroke-width', "2.5");
      svg.appendChild(pyr);

      // Central Height Axis
      var cLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      cLine.setAttribute('x1', midX); cLine.setAttribute('y1', apexY);
      cLine.setAttribute('x2', midX); cLine.setAttribute('y2', groundY);
      cLine.setAttribute('stroke', accentCol);
      cLine.setAttribute('stroke-width', "2");
      cLine.setAttribute('stroke-dasharray', "4 3");
      svg.appendChild(cLine);

      // Ground Line
      var gLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gLine.setAttribute('x1', "60"); gLine.setAttribute('y1', groundY);
      gLine.setAttribute('x2', "620"); gLine.setAttribute('y2', groundY);
      gLine.setAttribute('stroke', strokeCol);
      gLine.setAttribute('stroke-width', "2");
      svg.appendChild(gLine);

      // Seked Slope Triangle Unit Step on the right edge
      var stepScale = 35;
      var stepX = midX + (basePx / 4);
      var stepY = groundY - (heightPx / 2);

      // Labels
      var lblB = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblB.setAttribute('x', midX); lblB.setAttribute('y', groundY + 22);
      lblB.setAttribute('text-anchor', 'middle'); lblB.setAttribute('font-size', '12'); lblB.setAttribute('font-weight', '700');
      lblB.setAttribute('fill', strokeCol);
      lblB.textContent = "Base = " + currentBase + " cubits (Half-base = " + halfBase + " cubits)";
      svg.appendChild(lblB);

      var lblH = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblH.setAttribute('x', midX - 15); lblH.setAttribute('y', groundY - heightPx / 2);
      lblH.setAttribute('text-anchor', 'end'); lblH.setAttribute('font-size', '12'); lblH.setAttribute('font-weight', '700');
      lblH.setAttribute('fill', accentCol);
      lblH.textContent = "Height = " + currentHeight + " cubits";
      svg.appendChild(lblH);

      var lblSeked = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblSeked.setAttribute('x', rightX - 20); lblSeked.setAttribute('y', groundY - 20);
      lblSeked.setAttribute('font-size', '12'); lblSeked.setAttribute('font-weight', '700');
      lblSeked.setAttribute('fill', "#b45309");
      lblSeked.textContent = "Seked = " + wholePalms + " palms, " + fingers + " fingers";
      svg.appendChild(lblSeked);
    }

    FIG.slider(controls, {
      id: "pyramid-base",
      label: "Pyramid Base Width (Royal Cubits):",
      min: 100,
      max: 500,
      step: 10,
      value: currentBase,
      unit: "cubits",
      onChange: function (val) {
        currentBase = val;
        renderPyramid();
      }
    });

    FIG.slider(controls, {
      id: "pyramid-height",
      label: "Pyramid Vertical Height (Royal Cubits):",
      min: 50,
      max: 300,
      step: 5,
      value: currentHeight,
      unit: "cubits",
      onChange: function (val) {
        currentHeight = val;
        renderPyramid();
      }
    });

    renderPyramid();
  };

  /* -------------------------------------------------------------------------
     Figure 6: The 19-Year Metonic Intercalation Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-metonic-cycle'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentYear = 1;

    // Leap years in a 19-year cycle (the pattern of the later Hebrew calendar; the Babylonian cycle spaced them similarly):
    // Intercalary 13th month added in years: 3, 6, 8, 11, 14, 17, 19
    var leapYears = [3, 6, 8, 11, 14, 17, 19];

    var readouts = FIG.readouts(container, [
      { id: "cycle-year", label: "Metonic Year in 19-Year Cycle", value: "Year 1 of 19" },
      { id: "intercalation-action", label: "Calendar Action", value: "Standard Year (12 lunar months = 354 days)" },
      { id: "cumulative-drift", label: "Cumulative Solar Drift Offset", value: "-11.24 days" }
    ]);

    function renderCycle() {
      dispWrap.innerHTML = '';
      var yr = currentYear;
      var isLeap = leapYears.indexOf(yr) !== -1;

      // Cumulative drift calculation:
      // Solar year = 365.2422 days. Standard lunar year = 12 * 29.53059 = 354.367 days (deficit ~ 10.875 days).
      // Leap year adds 1 synodic month (+29.53 days).
      var drift = 0;
      for (var y = 1; y <= yr; y++) {
        var leap = (leapYears.indexOf(y) !== -1);
        drift += (leap ? 29.53059 : 0) - (365.2422 - 354.367);
      }

      readouts.update("cycle-year", "Year " + yr + " of 19");
      readouts.update("intercalation-action", isLeap ? "LEAP YEAR: Intercalary 13th month (Addaru II or Ululu II) added" : "Regular Year (12 lunar months)");
      readouts.update("cumulative-drift", (drift >= 0 ? "+" : "") + drift.toFixed(1) + " days relative to Solar Equinox");

      var w = 680, h = 320;
      var svg = FIG.createSVG(dispWrap, w, h, "Babylonian 19-year Metonic cycle calendar synchronization");

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var warnCol = "#b45309";
      var cx = 340, cy = 160, r = 110;

      // Central Hub
      var hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hub.setAttribute('cx', cx); hub.setAttribute('cy', cy); hub.setAttribute('r', "35");
      hub.setAttribute('fill', FIG.getCSSVar('--surface-raised'));
      hub.setAttribute('stroke', strokeCol); hub.setAttribute('stroke-width', "2");
      svg.appendChild(hub);

      var hubTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      hubTxt.setAttribute('x', cx); hubTxt.setAttribute('y', cy + 4);
      hubTxt.setAttribute('text-anchor', 'middle'); hubTxt.setAttribute('font-size', '11'); hubTxt.setAttribute('font-weight', '700');
      hubTxt.setAttribute('fill', accentCol);
      hubTxt.textContent = "19 Solar Yrs";
      svg.appendChild(hubTxt);

      // 19 Outer Year Nodes
      for (var i = 1; i <= 19; i++) {
        var ang = ((i - 1) / 19) * 2 * Math.PI - Math.PI / 2;
        var nx = cx + Math.cos(ang) * r;
        var ny = cy + Math.sin(ang) * r;

        var isNodeLeap = leapYears.indexOf(i) !== -1;
        var isCurrent = (i === yr);

        var node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        node.setAttribute('cx', nx); node.setAttribute('cy', ny);
        node.setAttribute('r', isCurrent ? "16" : "11");
        node.setAttribute('fill', isCurrent ? (isNodeLeap ? warnCol : accentCol) : (isNodeLeap ? "rgba(180, 83, 9, 0.25)" : FIG.getCSSVar('--surface-raised')));
        node.setAttribute('stroke', isNodeLeap ? warnCol : strokeCol);
        node.setAttribute('stroke-width', isCurrent ? "3" : "1.5");
        svg.appendChild(node);

        var nTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nTxt.setAttribute('x', nx); nTxt.setAttribute('y', ny + 4);
        nTxt.setAttribute('text-anchor', 'middle');
        nTxt.setAttribute('font-size', isCurrent ? '11' : '9');
        nTxt.setAttribute('font-weight', '700');
        nTxt.setAttribute('fill', isCurrent ? "#ffffff" : strokeCol);
        nTxt.textContent = i;
        svg.appendChild(nTxt);
      }

      // Indicator Hand to current year
      var curAng = ((yr - 1) / 19) * 2 * Math.PI - Math.PI / 2;
      var hx = cx + Math.cos(curAng) * (r - 20);
      var hy = cy + Math.sin(curAng) * (r - 20);

      var hand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hand.setAttribute('x1', cx); hand.setAttribute('y1', cy);
      hand.setAttribute('x2', hx); hand.setAttribute('y2', hy);
      hand.setAttribute('stroke', isLeap ? warnCol : accentCol);
      hand.setAttribute('stroke-width', "3");
      svg.appendChild(hand);

      // Footer Equation Note
      var eqNote = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      eqNote.setAttribute('x', "340"); eqNote.setAttribute('y', "300");
      eqNote.setAttribute('text-anchor', 'middle');
      eqNote.setAttribute('font-size', '11');
      eqNote.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      eqNote.setAttribute('fill', strokeCol);
      eqNote.textContent = "235 Synodic Months = 6,939.69 Days ≈ 19 Tropical Years (6,939.60 Days). Difference: 2.1 Hours!";
      svg.appendChild(eqNote);
    }

    FIG.slider(controls, {
      id: "metonic-year",
      label: "Advance Year in the 19-Year Cycle:",
      min: 1,
      max: 19,
      step: 1,
      value: currentYear,
      unit: "yr",
      onChange: function (val) {
        currentYear = val;
        renderCycle();
      }
    });

    renderCycle();
  };

  /* -------------------------------------------------------------------------
     Figure 7: Maya Calendar Round Intermeshing Gear Train
     ------------------------------------------------------------------------- */
  FIG['fig-mayan-calendar'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentDayOffset = 0; // Days elapsed

    var tzDayNames = ["Imix", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "Kib'", "Kab'an", "Etz'nab'", "Kawak", "Ajaw"];
    var haabMonths = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];

    var readouts = FIG.readouts(container, [
      { id: "tzolkin-date", label: "260-day Sacred Date (Tzolk'in)", value: "4 Ajaw" },
      { id: "haab-date", label: "365-day Civil Date (Haab')", value: "8 Kumk'u" },
      { id: "calendar-round-cycle", label: "Calendar Round Cycle", value: "Day 0 of 18,980 (52 Solar Years)" }
    ]);

    function renderGears() {
      dispWrap.innerHTML = '';
      var d = currentDayOffset;

      // Tzolk'in calculation: number (1-13) and name (0-19)
      // Reference anchor: 4 Ajaw (day 0) -> number = ((d + 3) % 13) + 1; name = tzDayNames[(d + 19) % 20]
      var tzNum = ((d + 3) % 13) + 1;
      var tzName = tzDayNames[(d + 19) % 20];

      // Haab' calculation: 18 months of 20 days (0-19) + Wayeb' (5 days: 0-4)
      // Reference anchor: 8 Kumk'u (Kumk'u is month 17) -> total days from Pop 0 = 17*20 + 8 = 348
      var haabDayOfYear = (d + 348) % 365;
      var haabMonthIdx = Math.floor(haabDayOfYear / 20);
      var haabDay = haabDayOfYear % 20;
      var haabMonthName = haabMonths[haabMonthIdx];

      readouts.update("tzolkin-date", tzNum + " " + tzName);
      readouts.update("haab-date", haabDay + " " + haabMonthName);
      readouts.update("calendar-round-cycle", "Day " + (d % 18980) + " of 18,980 days (" + ((d % 18980) / 365.2422).toFixed(1) + " years elapsed)");

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Maya Calendar Round interlocking Tzolk'in and Haab' gears");

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var tzolkinCol = "#0b66c3";
      var haabCol = "#15803d";

      // Gear 1: Tzolk'in (260-day gear, center at x = 240, y = 150, r = 85)
      var g1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      g1.setAttribute('cx', "240"); g1.setAttribute('cy', "150"); g1.setAttribute('r', "85");
      g1.setAttribute('fill', "rgba(11, 102, 195, 0.12)");
      g1.setAttribute('stroke', tzolkinCol); g1.setAttribute('stroke-width', "3");
      svg.appendChild(g1);

      // Gear 2: Haab' (365-day gear, center at x = 440, y = 150, r = 115)
      var g2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      g2.setAttribute('cx', "440"); g2.setAttribute('cy', "150"); g2.setAttribute('r', "115");
      g2.setAttribute('fill', "rgba(21, 128, 61, 0.12)");
      g2.setAttribute('stroke', haabCol); g2.setAttribute('stroke-width', "3");
      svg.appendChild(g2);

      // Interlocking Contact Point marker (x = 325, y = 150)
      var contact = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      contact.setAttribute('cx', "325"); contact.setAttribute('cy', "150"); contact.setAttribute('r', "6");
      contact.setAttribute('fill', "#b45309");
      svg.appendChild(contact);

      // Gear 1 Labels
      var txtG1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txtG1.setAttribute('x', "240"); txtG1.setAttribute('y', "145");
      txtG1.setAttribute('text-anchor', 'middle'); txtG1.setAttribute('font-size', '14'); txtG1.setAttribute('font-weight', '700');
      txtG1.setAttribute('fill', tzolkinCol);
      txtG1.textContent = tzNum + " " + tzName;
      svg.appendChild(txtG1);

      var txtG1sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txtG1sub.setAttribute('x', "240"); txtG1sub.setAttribute('y', "165");
      txtG1sub.setAttribute('text-anchor', 'middle'); txtG1sub.setAttribute('font-size', '11');
      txtG1sub.setAttribute('fill', strokeCol);
      txtG1sub.textContent = "Tzolk'in (260 Days)";
      svg.appendChild(txtG1sub);

      // Gear 2 Labels
      var txtG2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txtG2.setAttribute('x', "440"); txtG2.setAttribute('y', "145");
      txtG2.setAttribute('text-anchor', 'middle'); txtG2.setAttribute('font-size', '14'); txtG2.setAttribute('font-weight', '700');
      txtG2.setAttribute('fill', haabCol);
      txtG2.textContent = haabDay + " " + haabMonthName;
      svg.appendChild(txtG2);

      var txtG2sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txtG2sub.setAttribute('x', "440"); txtG2sub.setAttribute('y', "165");
      txtG2sub.setAttribute('text-anchor', 'middle'); txtG2sub.setAttribute('font-size', '11');
      txtG2sub.setAttribute('fill', strokeCol);
      txtG2sub.textContent = "Haab' (365 Days)";
      svg.appendChild(txtG2sub);

      // Explanatory LCM note
      var lcmNote = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lcmNote.setAttribute('x', "340"); lcmNote.setAttribute('y', "285");
      lcmNote.setAttribute('text-anchor', 'middle');
      lcmNote.setAttribute('font-size', '11');
      lcmNote.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      lcmNote.setAttribute('fill', strokeCol);
      lcmNote.textContent = "LCM(260, 365) = 18,980 Days = Exactly 52 Solar Years (Calendar Round)";
      svg.appendChild(lcmNote);
    }

    FIG.slider(controls, {
      id: "calendar-step-day",
      label: "Advance Calendar Date (Days elapsed):",
      min: 0,
      max: 18980,
      step: 10,
      value: currentDayOffset,
      unit: "days",
      onChange: function (val) {
        currentDayOffset = val;
        renderGears();
      }
    });

    renderGears();
  };

  /* -------------------------------------------------------------------------
     Figure 8: Test Yourself Quiz for Part 2
     ------------------------------------------------------------------------- */
  FIG['fig-quiz-part2'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    var questions = [
      {
        question: "Why did Mesopotamian scribes adopt a sexagesimal (base 60) numeral system rather than decimal (base 10)?",
        options: [
          "They possessed six fingers on each hand according to temple reliefs.",
          "It was mandated by a royal decree of Hammurabi to prevent counterfeit accounts.",
          "Base 60 was the only number system permitted by astrological omen treatises.",
          "60 is divisible by 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, and 30, eliminating recurring fractional remainders in commercial and grain division."
        ],
        answer: 3,
        explanation: "The high divisibility of 60 vastly simplifies fractional arithmetic, making grain distribution, wages, and trade divisions cleanly terminating values without infinite fractions."
      },
      {
        question: "What celestial event served as the benchmark for the ancient Egyptian agricultural new year and the Nile flood?",
        options: [
          "The winter solstice sunset behind the Western Desert cliffs.",
          "The transit of the full moon across the constellation Orion.",
          "The heliacal rising of Sirius (Sopdet), reappearing on the eastern horizon just before sunrise after 70 days of invisibility.",
          "A total solar eclipse occurring every four years."
        ],
        answer: 2,
        explanation: "The reappearance of Sirius at dawn in mid-July after its 70-day absence coincided with the arrival of the life-giving Nile inundation (Akhet)."
      },
      {
        question: "What did Eleanor Robson's 2001 reassessment argue about Babylonian tablet Plimpton 322 (~1800 BCE)?",
        options: [
          "It is a magical incantation table used for exorcising demons.",
          "It is a school text of regular reciprocal pairs generating integer Pythagorean triples, not anachronistic trigonometry or secret astronomy.",
          "It was carved by Greek philosophers visiting Babylon during the reign of Alexander.",
          "It proves the Babylonians possessed telescopes capable of seeing Jupiter's moons."
        ],
        answer: 1,
        explanation: "Robson argued, from the tablet's context and arithmetic, that the tablet was generated by standard Old Babylonian scribal school algebra using reciprocal pairs (x, 1/x) to construct right triangles."
      },
      {
        question: "What remarkable characteristic defines the cubic chert weights excavated across Indus Valley cities (Mohenjo-daro, Harappa, Lothal)?",
        options: [
          "Every city had an entirely different weight standard to tax foreign merchants.",
          "They were manufactured from hollow bronze filled with varying amounts of sand.",
          "Weights were calibrated solely by measuring the volume of barley seeds.",
          "They followed an invariant binary ratio (1, 2, 4, 8, 16, 32...) transitioning into decimal decades, kept remarkably consistent across a vast region."
        ],
        answer: 3,
        explanation: "Indus metrology was astonishingly uniform across thousands of kilometres, combining binary doubling for small commercial transactions with decimal multiples for bulk goods."
      },
      {
        question: "In Egyptian architectural mathematics (Rhind Papyrus Problem 56), what is the 'seked'?",
        options: [
          "The total volume of stone blocks quarried from Aswan.",
          "The daily grain ration awarded to pyramid masons.",
          "The horizontal run measured in palms and fingers per vertical royal cubit rise (governing pyramid slope).",
          "The astrological alignment angle relative to true magnetic north."
        ],
        answer: 2,
        explanation: "The seked measures the slope of an inclined face: how many palms (1 cubit = 7 palms) and fingers (1 palm = 4 fingers) the face retreats horizontally for each royal cubit of vertical rise."
      },
      {
        question: "Why was the 19-year Metonic cycle (used by Babylonian astronomers and later named after Meton of Athens) so vital to ancient states?",
        options: [
          "235 synodic lunar months equal almost exactly 19 tropical solar years (differing by only 2 hours), allowing 7 intercalary months to prevent lunar calendar seasons from drifting.",
          "It predicted the exact year of the Roman Republic's founding.",
          "It was used exclusively to calculate the precession of the equinoxes.",
          "It dictated the 19-year reign of Babylonian kings."
        ],
        answer: 0,
        explanation: "By inserting 7 leap months across 19 years, agrarian civilizations kept their 354-day lunar calendar synchronized with the 365.24-day solar agricultural seasons."
      },
      {
        question: "How did Egyptian water clocks (clepsydrae), such as the 1400 BCE specimen from Karnak, solve the physical problem of changing hydrostatic pressure?",
        options: [
          "By using boiling water to maintain constant viscosity.",
          "By employing mechanical bronze gears to regulate the outflow siphon.",
          "By constructing the vessel with inward-sloping conical walls (~70°), so that the water level fell at a roughly steady rate even as the pressure decreased.",
          "By floating an oil layer on top to prevent evaporation."
        ],
        answer: 2,
        explanation: "As water drains, hydrostatic pressure falls ($P = \rho g h$). The conical cross-section compensates: smaller water volumes near the bottom take the same time to drain as larger volumes at the top."
      },
      {
        question: "How long is the Mesoamerican 'Calendar Round' cycle formed by intertwining the 260-day Tzolk'in and 365-day Haab'?",
        options: [
          "100 solar years.",
          "365 lunar months.",
          "1,000 days.",
          "52 years of 365 days (18,980 days), after which the combination of day name and month day repeats identically."
        ],
        answer: 3,
        explanation: "The least common multiple of 260 and 365 is 18,980 days, corresponding to exactly 52 Haab' years (365 days each) or 73 Tzolk'in cycles."
      },
      {
        question: "What was discovered in 2013 at Wadi al-Jarf on the Red Sea coast regarding the construction of the Great Pyramid of Giza?",
        options: [
          "Alien hieroglyphs describing acoustic levitation machines.",
          "A steel chisel proving the Egyptians had iron technology in the Old Kingdom.",
          "The Diary of Merer, a 4th-Dynasty papyrus logbook recording the daily transport of limestone blocks by boat from Tura to Khufu's pyramid.",
          "A map of the solar system showing Neptune and Pluto."
        ],
        answer: 2,
        explanation: "Tallet's discovery of the Diary of Merer provided firsthand documentary proof of Old Kingdom administrative logistics, boat transport, and harbor infrastructure."
      },
      {
        question: "In the history of science, why is it incorrect to view ancient Babylonian omen astrology as purely anti-scientific superstition?",
        options: [
          "Because the religious imperative to detect divine portents motivated state scribes to maintain continuous, empirical observational diaries of celestial positions for over six centuries.",
          "Because the astrology was completely accurate in predicting personal fortunes.",
          "Because the Babylonians did not believe in gods.",
          "Because Greek philosophy borrowed nothing from Mesopotamia."
        ],
        answer: 0,
        explanation: "The belief that celestial bodies conveyed divine messages provided the institutional justification for centuries of meticulous, unbroken empirical astronomy, yielding some of the first mathematical tables of celestial cycles."
      }
    ];

    FIG.quiz(container, questions);
  };

})();
