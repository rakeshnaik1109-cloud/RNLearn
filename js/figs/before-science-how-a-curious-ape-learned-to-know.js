/* ==========================================================================
   RNLearn — Figures for "Before science: how a curious ape learned to know"
   Slug: before-science-how-a-curious-ape-learned-to-know
   Figures:
     1. fig-encephalisation: Cranial capacity vs time across hominin taxa
     2. fig-knapping: Conchoidal fracture angle & mechanics simulator
     3. fig-decay-curve: Radioactive decay & geochronological dating calculator
     4. fig-climate-map: Pleistocene African/Eurasian site map & climate corridors
     5. fig-fire-metabolism: Cooking thermodynamics & digestive energy budget
     6. fig-levallois: Step-by-step prepared core reduction sequence
     7. fig-tally-bone: Lunar synodic cycle & Paleolithic tally bone correlator
     8. fig-quiz-part1: 10-question self-assessment quiz with rationale
   ========================================================================== */

(function () {
  'use strict';

  var FIG = window.FIG || {};

  /* -------------------------------------------------------------------------
     Figure 1: Cranial Capacity vs Geological Age
     ------------------------------------------------------------------------- */
  FIG['fig-encephalisation'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    var homininData = [
      { name: "Sahelanthropus tchadensis", age: 7.0, cc: 360, region: "Central Africa", mode: "Pre-mode" },
      { name: "Ardipithecus ramidus", age: 4.4, cc: 310, region: "East Africa", mode: "Pre-mode" },
      { name: "Australopithecus afarensis (Lucy)", age: 3.2, cc: 438, region: "East Africa", mode: "Mode 0 (Lomekwi)" },
      { name: "Australopithecus africanus", age: 2.5, cc: 452, region: "South Africa", mode: "Mode 1 (Oldowan)" },
      { name: "Homo habilis (KNM-ER 1813)", age: 1.9, cc: 510, region: "East Africa", mode: "Mode 1 (Oldowan)" },
      { name: "Homo rudolfensis (KNM-ER 1470)", age: 1.9, cc: 752, region: "East Africa", mode: "Mode 1 (Oldowan)" },
      { name: "Homo ergaster (Turkana Boy)", age: 1.6, cc: 880, region: "East Africa", mode: "Mode 2 (Acheulean)" },
      { name: "Homo erectus (Trinil, Java)", age: 0.9, cc: 930, region: "Asia", mode: "Mode 2 (Acheulean)" },
      { name: "Homo erectus (Zhoukoudian)", age: 0.5, cc: 1040, region: "Asia", mode: "Mode 2 (Acheulean)" },
      { name: "Homo heidelbergensis (Kabwe)", age: 0.3, cc: 1280, region: "South Africa", mode: "Mode 3 (Levallois)" },
      { name: "Homo heidelbergensis (Petralona)", age: 0.35, cc: 1230, region: "Europe", mode: "Mode 3 (Levallois)" },
      { name: "Homo neanderthalensis (Amud 1)", age: 0.055, cc: 1740, region: "Levant", mode: "Mode 3 (Mousterian)" },
      { name: "Homo neanderthalensis (La Chapelle)", age: 0.06, cc: 1620, region: "Europe", mode: "Mode 3 (Mousterian)" },
      { name: "Homo sapiens (Jebel Irhoud)", age: 0.315, cc: 1375, region: "North Africa", mode: "Mode 3 (MSA)" },
      { name: "Homo sapiens (Omo Kibish 1)", age: 0.233, cc: 1400, region: "East Africa", mode: "Mode 3 (MSA)" },
      { name: "Homo sapiens (Qafzeh 9)", age: 0.095, cc: 1530, region: "Levant", mode: "Mode 3 (MSA)" },
      { name: "Homo sapiens (Cro-Magnon 1)", age: 0.03, cc: 1600, region: "Europe", mode: "Mode 4 (Aurignacian)" },
      { name: "Homo sapiens (Modern Global Average)", age: 0.0, cc: 1350, region: "Global", mode: "Recent" }
    ];

    var controlsWrap = document.createElement('div');
    controlsWrap.className = 'fig-controls';

    var chartWrap = document.createElement('div');
    container.innerHTML = '';
    container.appendChild(controlsWrap);
    container.appendChild(chartWrap);

    var currentRegion = 'All';

    function renderPlot() {
      chartWrap.innerHTML = '';

      var filtered = homininData.filter(function (d) {
        return currentRegion === 'All' || d.region === currentRegion;
      });

      var points = filtered.map(function (d) {
        return [d.age, d.cc];
      });

      var plotObj = FIG.plot(chartWrap, {
        width: 720,
        height: 380,
        xDomain: [7.5, 0], // Inverted geological time: millions of years ago
        yDomain: [200, 1800],
        xLabel: "Geological Age (Millions of Years Ago — Ma)",
        yLabel: "Endocranial Volume (cm³)",
        padding: { top: 30, right: 30, bottom: 55, left: 65 },
        xTicks: 7,
        yTicks: 5,
        title: "Hominin Cranial Capacity Expansion over 7 Million Years",
        bands: [
          { x0: 3.3, x1: 1.76, color: "rgba(11, 102, 195, 0.06)" }, // Oldowan era
          { x0: 1.76, x1: 0.3, color: "rgba(180, 83, 9, 0.06)" },   // Acheulean era
          { x0: 0.3, x1: 0.04, color: "rgba(21, 128, 61, 0.07)" }   // Middle Stone Age / Levallois
        ],
        series: [
          {
            type: 'scatter',
            data: points,
            color: FIG.getCSSVar('--accent', '#1b4965'),
            radius: 5.5,
            label: "Fossil Specimen"
          }
        ]
      });

      // Annotate points with fossil names
      var svg = plotObj.svg;
      var xScale = plotObj.xScale;
      var yScale = plotObj.yScale;

      filtered.forEach(function (d) {
        var px = xScale(d.age);
        var py = yScale(d.cc);

        var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', px + 7);
        txt.setAttribute('y', py - 4);
        txt.setAttribute('font-size', '9.5');
        txt.setAttribute('font-family', FIG.getCSSVar('--font-sans'));
        txt.setAttribute('fill', FIG.getCSSVar('--ink-secondary', '#4a4d57'));
        txt.textContent = d.name.split(' ')[0] + ' ' + (d.name.split(' ')[1] || '') + ' (' + d.cc + ' cc)';
        svg.appendChild(txt);
      });
    }

    FIG.select(controlsWrap, {
      id: "region-filter",
      label: "Filter by Geographical Region:",
      options: [
        { value: "All", label: "All Regions (Global)" },
        { value: "East Africa", label: "East Africa (Turkana, Olduvai, Afar)" },
        { value: "South Africa", label: "South Africa (Sterkfontein, Swartkrans)" },
        { value: "North Africa", label: "North Africa (Jebel Irhoud)" },
        { value: "Europe", label: "Europe (Atapuerca, Petralona, Neander)" },
        { value: "Asia", label: "Asia (Java, Zhoukoudian)" },
        { value: "Levant", label: "Levant (Qafzeh, Skhul, Amud)" }
      ],
      value: "All",
      onChange: function (val) {
        currentRegion = val;
        renderPlot();
      }
    });

    renderPlot();
  };

  /* -------------------------------------------------------------------------
     Figure 2: Conchoidal Fracture Mechanics Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-knapping'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var svgWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(svgWrap);

    var currentAngle = 65; // degrees from horizontal platform
    var currentForce = 350; // Newtons

    var readouts = FIG.readouts(container, [
      { id: "flake-type", label: "Termination Type", value: "Feather (Optimal)" },
      { id: "cone-angle", label: "Hertzian Cone Ingress", value: "58°" },
      { id: "effective-length", label: "Detached Flake Length", value: "72 mm" }
    ]);

    function updatePhysics() {
      svgWrap.innerHTML = '';
      var w = 680, h = 340;
      var svg = FIG.createSVG(svgWrap, w, h, "Conchoidal fracture geometry diagram");

      // Physics outcome logic
      var termination = "Feather (Clean cutting edge)";
      var length = Math.round(currentForce * 0.18 + (90 - currentAngle) * 0.6);
      var coneHalfAngle = Math.round(currentAngle * 0.85);

      if (currentAngle > 80) {
        termination = "Step / Crush (Impact angle too steep; energy dissipates in core)";
        length = Math.round(length * 0.35);
      } else if (currentAngle < 48) {
        termination = "Hinge (Angle too shallow; crack curls inward prematurely)";
        length = Math.round(length * 0.55);
      } else {
        termination = "Feather (Sharp terminal margin; successful Mode 1/2 flake)";
      }

      readouts.update("flake-type", termination);
      readouts.update("cone-angle", coneHalfAngle + "°");
      readouts.update("effective-length", length + " mm");

      var stoneCol = FIG.getCSSVar('--surface-raised', '#e8e6df');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var warnCol = FIG.getCSSVar('--callout-warn', '#b45309');

      // Core profile (silicate pebble)
      var corePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      corePath.setAttribute('d', "M 160 80 L 480 80 C 520 80, 560 160, 520 280 C 480 320, 200 320, 160 270 Z");
      corePath.setAttribute('fill', stoneCol);
      corePath.setAttribute('stroke', strokeCol);
      corePath.setAttribute('stroke-width', "2");
      svg.appendChild(corePath);

      // Striking platform marker
      var platformLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      platformLine.setAttribute('x1', "160");
      platformLine.setAttribute('y1', "80");
      platformLine.setAttribute('x2', "480");
      platformLine.setAttribute('y2', "80");
      platformLine.setAttribute('stroke', accentCol);
      platformLine.setAttribute('stroke-width', "4");
      svg.appendChild(platformLine);

      // Impact Point
      var ipX = 240, ipY = 80;
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', ipX);
      circle.setAttribute('cy', ipY);
      circle.setAttribute('r', "6");
      circle.setAttribute('fill', warnCol);
      svg.appendChild(circle);

      // Hammerstone Impact Vector
      var rad = (currentAngle * Math.PI) / 180;
      var vecLen = 65 + (currentForce / 500) * 35;
      var fromX = ipX - Math.cos(rad) * vecLen;
      var fromY = ipY - Math.sin(rad) * vecLen;

      var vector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vector.setAttribute('x1', fromX);
      vector.setAttribute('y1', fromY);
      vector.setAttribute('x2', ipX);
      vector.setAttribute('y2', ipY);
      vector.setAttribute('stroke', warnCol);
      vector.setAttribute('stroke-width', "3.5");
      vector.setAttribute('marker-end', 'url(#arrow)');
      svg.appendChild(vector);

      // Conchoidal Crack Line
      var crackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var crackEndEndY = ipY + length * 1.8;
      var dCrack = "";

      if (currentAngle > 80) {
        // Step fracture
        dCrack = "M " + ipX + " " + ipY + " Q " + (ipX + 15) + " " + (ipY + 35) + ", " + (ipX + 25) + " " + (ipY + 45) + " L " + (ipX + 5) + " " + (ipY + 45);
      } else if (currentAngle < 48) {
        // Hinge
        dCrack = "M " + ipX + " " + ipY + " Q " + (ipX + 40) + " " + (ipY + 60) + ", " + (ipX + 60) + " " + (ipY + 80) + " Q " + (ipX + 40) + " " + (ipY + 85) + ", " + (ipX + 20) + " " + (ipY + 75);
      } else {
        // Clean feather conchoidal flake
        dCrack = "M " + ipX + " " + ipY + " C " + (ipX + 35) + " " + (ipY + 40) + ", " + (ipX + 45) + " " + (ipY + 110) + ", " + (ipX - 10) + " " + crackEndEndY;
      }

      crackPath.setAttribute('d', dCrack);
      crackPath.setAttribute('fill', 'none');
      crackPath.setAttribute('stroke', accentCol);
      crackPath.setAttribute('stroke-width', "3");
      crackPath.setAttribute('stroke-dasharray', "4 2");
      svg.appendChild(crackPath);

      // Labels
      var lbl1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl1.setAttribute('x', fromX - 25);
      lbl1.setAttribute('y', fromY - 10);
      lbl1.setAttribute('font-size', '12');
      lbl1.setAttribute('font-weight', '700');
      lbl1.setAttribute('fill', warnCol);
      lbl1.textContent = "Hammerstone Blow (" + currentForce + " N @ " + currentAngle + "°)";
      svg.appendChild(lbl1);

      var lbl2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl2.setAttribute('x', "340");
      lbl2.setAttribute('y', "70");
      lbl2.setAttribute('font-size', '11');
      lbl2.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      lbl2.setAttribute('fill', strokeCol);
      lbl2.textContent = "Striking Platform Surface";
      svg.appendChild(lbl2);

      var lbl3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl3.setAttribute('x', ipX + 50);
      lbl3.setAttribute('y', ipY + 70);
      lbl3.setAttribute('font-size', '11');
      lbl3.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      lbl3.setAttribute('fill', accentCol);
      lbl3.textContent = "Hertzian Cone Fracture Front";
      svg.appendChild(lbl3);
    }

    FIG.slider(controls, {
      id: "knap-angle",
      label: "Striking Angle (Degrees from horizontal):",
      min: 40,
      max: 90,
      step: 1,
      value: currentAngle,
      unit: "°",
      onChange: function (val) {
        currentAngle = val;
        updatePhysics();
      }
    });

    FIG.slider(controls, {
      id: "knap-force",
      label: "Hammerstone Impact Force (Newtons):",
      min: 150,
      max: 600,
      step: 10,
      value: currentForce,
      unit: "N",
      onChange: function (val) {
        currentForce = val;
        updatePhysics();
      }
    });

    updatePhysics();
  };

  /* -------------------------------------------------------------------------
     Figure 3: Radioactive Decay & Absolute Geochronology Calculator
     ------------------------------------------------------------------------- */
  FIG['fig-decay-curve'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var chartWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(chartWrap);

    var isotopes = {
      c14: { name: "Carbon-14 (¹⁴C → ¹⁴N)", halfLife: 5730, unit: "years", maxTime: 50000, parent: "¹⁴C", daughter: "¹⁴N" },
      k_ar: { name: "Potassium-Argon (⁴⁰K → ⁴⁰Ar)", halfLife: 1248000000, unit: "years", maxTime: 4000000000, parent: "⁴⁰K", daughter: "⁴⁰Ar" },
      u_pb: { name: "Uranium-238 (²³⁸U → ²⁰⁶Pb)", halfLife: 4468000000, unit: "years", maxTime: 10000000000, parent: "²³⁸U", daughter: "²⁰⁶Pb" }
    };

    var currentIso = 'c14';
    var remainingPct = 50.0; // percent of parent remaining

    var readouts = FIG.readouts(container, [
      { id: "elapsed-time", label: "Calculated Sample Age", value: "5,730 years" },
      { id: "half-lives-elapsed", label: "Half-lives Elapsed", value: "1.00" },
      { id: "parent-daughter-ratio", label: "Parent / Daughter Ratio", value: "1.000" }
    ]);

    function renderDecay() {
      chartWrap.innerHTML = '';
      var iso = isotopes[currentIso];
      var fraction = remainingPct / 100;
      var numHalfLives = Math.log2(1 / Math.max(1e-6, fraction));
      var calculatedAge = numHalfLives * iso.halfLife;
      var ratio = fraction / Math.max(1e-6, (1 - fraction));

      var formattedAge = calculatedAge >= 1e6
        ? (calculatedAge / 1e6).toFixed(3) + " Million years"
        : Math.round(calculatedAge).toLocaleString() + " years";

      readouts.update("elapsed-time", formattedAge);
      readouts.update("half-lives-elapsed", numHalfLives.toFixed(2));
      readouts.update("parent-daughter-ratio", ratio.toFixed(3));

      // Build curve points: x in half-lives (0 to 6), y in percent (100 to 1.56)
      var curveData = [];
      for (var t = 0; t <= 6; t += 0.1) {
        var pct = 100 * Math.pow(0.5, t);
        curveData.push([t, pct]);
      }

      var plotObj = FIG.plot(chartWrap, {
        width: 700,
        height: 350,
        xDomain: [0, 6],
        yDomain: [0, 100],
        xLabel: "Elapsed Time (Number of Half-Lives, t / t₁/₂)",
        yLabel: "Parent Isotope Remaining (%)",
        padding: { top: 30, right: 30, bottom: 50, left: 60 },
        xTicks: 6,
        yTicks: 5,
        title: "Exponential Radioactive Decay: N(t) = N₀ · 2^(-t / t₁/₂)",
        series: [
          {
            type: 'area',
            data: curveData,
            color: FIG.getCSSVar('--accent', '#1b4965'),
            fill: FIG.getCSSVar('--accent-light', '#e8eff5'),
            opacity: 0.35,
            width: 3,
            label: iso.parent + " Fraction"
          },
          {
            type: 'scatter',
            data: [[numHalfLives, remainingPct]],
            color: FIG.getCSSVar('--callout-warn', '#b45309'),
            radius: 7,
            label: "Sample Measurement"
          }
        ]
      });

      // Draw indicator lines from point to axes
      var svg = plotObj.svg;
      var xs = plotObj.xScale;
      var ys = plotObj.yScale;

      var px = xs(numHalfLives);
      var py = ys(remainingPct);

      var guideX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      guideX.setAttribute('x1', px); guideX.setAttribute('y1', py);
      guideX.setAttribute('x2', px); guideX.setAttribute('y2', ys(0));
      guideX.setAttribute('stroke', FIG.getCSSVar('--callout-warn'));
      guideX.setAttribute('stroke-dasharray', "3 3");
      guideX.setAttribute('stroke-width', "1.5");
      svg.appendChild(guideX);

      var guideY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      guideY.setAttribute('x1', xs(0)); guideY.setAttribute('y1', py);
      guideY.setAttribute('x2', px); guideY.setAttribute('y2', py);
      guideY.setAttribute('stroke', FIG.getCSSVar('--callout-warn'));
      guideY.setAttribute('stroke-dasharray', "3 3");
      guideY.setAttribute('stroke-width', "1.5");
      svg.appendChild(guideY);
    }

    FIG.select(controls, {
      id: "isotope-select",
      label: "Radioactive Isotope System:",
      options: [
        { value: "c14", label: "Carbon-14 (t₁/₂ = 5,730 yr; Bone, Charcoal, Wood < 50 ka)" },
        { value: "k_ar", label: "Potassium-Argon / ⁴⁰Ar-³⁹Ar (t₁/₂ = 1.25 Ga; Volcanic Tuff > 100 ka)" },
        { value: "u_pb", label: "Uranium-Lead (t₁/₂ = 4.47 Ga; Zircon crystals, Deep time)" }
      ],
      value: "c14",
      onChange: function (val) {
        currentIso = val;
        renderDecay();
      }
    });

    FIG.slider(controls, {
      id: "remaining-pct",
      label: "Parent Isotope Remaining (% of initial concentration N₀):",
      min: 1.5,
      max: 98.0,
      step: 0.5,
      value: remainingPct,
      unit: "%",
      onChange: function (val) {
        remainingPct = val;
        renderDecay();
      }
    });

    renderDecay();
  };

  /* -------------------------------------------------------------------------
     Figure 4: Pleistocene African Site Map & Climate Corridor
     ------------------------------------------------------------------------- */
  FIG['fig-climate-map'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var mapWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(mapWrap);

    var misStage = 5; // MIS 5 (Eemian interglacial ~120 ka, Green Sahara)

    var sites = [
      { name: "Jebel Irhoud", x: 230, y: 75, date: "315 ka", desc: "Oldest known Homo sapiens crania & Mousterian points" },
      { name: "Taforalt", x: 260, y: 70, date: "82 ka", desc: "Nassarius shell beads pierced for personal adornment" },
      { name: "Gona", x: 395, y: 175, date: "2.6 Ma", desc: "Earliest Mode 1 Oldowan knapped cores" },
      { name: "Lomekwi 3", x: 380, y: 195, date: "3.3 Ma", desc: "Oldest discovered stone tools (flaked cores)" },
      { name: "Olduvai Gorge", x: 385, y: 220, date: "1.9 Ma", desc: "Louis & Mary Leakey Oldowan and Acheulean sequence" },
      { name: "Wonderwerk Cave", x: 320, y: 310, date: "1.0 Ma", desc: "FTIR evidence of in situ burned bone and plant ash" },
      { name: "Klasies River", x: 330, y: 350, date: "115 ka", desc: "Middle Stone Age marine foraging & shell middens" },
      { name: "Blombos Cave", x: 300, y: 345, date: "77 ka", desc: "Engraved geometric ochre & silcrete drawing" },
      { name: "Qafzeh / Skhul", x: 390, y: 90, date: "100 ka", desc: "Levantine early Homo sapiens burials with ochre" }
    ];

    var readouts = FIG.readouts(container, [
      { id: "climate-regime", label: "Climate Regime", value: "MIS 5 Interglacial (Wet 'Green Sahara')" },
      { id: "corridor-status", label: "Trans-Saharan Corridors", value: "Open (River networks & lakes active)" }
    ]);

    function renderMap() {
      mapWrap.innerHTML = '';

      var isGreen = (misStage === 5 || misStage === 1);
      readouts.update("climate-regime", isGreen ? "Interglacial (Pluvial wet phase, ~125 ka)" : "Glacial Maxima (Hyper-arid desert expansion)");
      readouts.update("corridor-status", isGreen ? "Open: Wadi networks and mega-lakes (Lake Mega-Chad) facilitate migration" : "Constrained: Severe aridity; populations restricted to coastal & river refugia");

      var landBg = isGreen ? "#cfdec0" : "#dfd9c7"; // Green Sahara vs Arid Ochre
      var corridorCol = isGreen ? "rgba(11, 102, 195, 0.45)" : "none";

      var svg = FIG.map(mapWrap, {
        width: 720,
        height: 420,
        title: "African Pleistocene Fossil Sites & Paleoclimate Corridors",
        attribution: "Cartographic data: Natural Earth (Public Domain); Paleoclimate: Drake et al., 2011",
        landPaths: [
          // Simplified Africa & Southwest Asia continent silhouette
          "M 210 60 C 270 50, 380 50, 420 80 C 450 100, 420 150, 410 180 C 420 220, 380 320, 330 360 C 280 370, 260 300, 220 240 C 180 200, 160 140, 180 90 Z",
          // Arabian Peninsula
          "M 410 85 C 460 70, 490 110, 470 140 C 440 160, 420 130, 410 85 Z",
          // Southern Europe & Levant
          "M 220 45 C 320 40, 400 45, 410 75 C 380 70, 240 70, 220 45 Z"
        ],
        routes: isGreen ? [
          // Green Sahara fossil river corridors
          { d: "M 380 180 C 350 140, 310 100, 250 80", color: "#0b66c3", width: 3, dashed: true },
          { d: "M 390 170 C 400 130, 410 100, 400 85", color: "#0b66c3", width: 3, dashed: true }
        ] : [],
        markers: sites.map(function (s) {
          return {
            x: s.x,
            y: s.y,
            label: s.name + " (" + s.date + ")",
            color: FIG.getCSSVar('--accent', '#1b4965')
          };
        })
      });
    }

    FIG.select(controls, {
      id: "mis-select",
      label: "Marine Isotope Stage (MIS Climate Cycle):",
      options: [
        { value: "5", label: "MIS 5 Interglacial (~125,000 yr ago — Humid Green Sahara pluvial)" },
        { value: "4", label: "MIS 4 Glacial Stage (~65,000 yr ago — Arid desert expansion, refugia)" },
        { value: "2", label: "MIS 2 Last Glacial Maximum (~20,000 yr ago — Hyper-arid belt)" },
        { value: "1", label: "MIS 1 Holocene (~9,000 yr ago — African Humid Period)" }
      ],
      value: "5",
      onChange: function (val) {
        misStage = parseInt(val, 10);
        renderMap();
      }
    });

    renderMap();
  };

  /* -------------------------------------------------------------------------
     Figure 5: Cooking Thermodynamics & Metabolic Energy Allocation
     ------------------------------------------------------------------------- */
  FIG['fig-fire-metabolism'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var chartWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(chartWrap);

    var rawRatio = 50; // percent cooked vs raw

    var readouts = FIG.readouts(container, [
      { id: "digest-gain", label: "Ileal Energy Digestibility", value: "+38%" },
      { id: "chewing-time", label: "Daily Chewing Time Required", value: "2.1 hours / day" },
      { id: "brain-energy", label: "Basal Energy Available for Brain", value: "22.5%" }
    ]);

    function updateMetabolism() {
      chartWrap.innerHTML = '';

      var cookedFraction = rawRatio / 100;
      // Starch gelatinization & protein denaturation increase ileal digestibility from ~48% to ~88%
      var digestibility = 48 + cookedFraction * 40;
      // Chimpanzees spend ~6 hours chewing raw matter; fully cooked diet drops to ~0.8 hours
      var chewingHours = (6.0 - cookedFraction * 5.2).toFixed(1);
      // Modern human brain consumes ~20-25% resting metabolic rate vs ~8-10% in apes
      var brainBudget = (10 + cookedFraction * 14).toFixed(1);

      readouts.update("digest-gain", digestibility.toFixed(0) + "%");
      readouts.update("chewing-time", chewingHours + " hrs / day");
      readouts.update("brain-energy", brainBudget + "% of BMR");

      var barData = [
        [1, digestibility],
        [2, (chewingHours / 6.0) * 100],
        [3, parseFloat(brainBudget) * 4] // scale for visual comparison
      ];

      FIG.plot(chartWrap, {
        width: 680,
        height: 320,
        xDomain: [0.5, 3.5],
        yDomain: [0, 100],
        xLabel: "1: Digestibility (%)  |  2: Chewing Overhead (% of 6h)  |  3: Relative Encephalisation Energy",
        yLabel: "Relative Percentage Index (%)",
        padding: { top: 30, right: 30, bottom: 50, left: 60 },
        xTicks: 3,
        yTicks: 5,
        title: "Metabolic Impact of Thermal Food Processing (Wrangham Cooking Hypothesis)",
        series: [
          {
            type: 'bar',
            data: barData,
            color: FIG.getCSSVar('--accent', '#1b4965')
          }
        ]
      });
    }

    FIG.slider(controls, {
      id: "cooked-pct",
      label: "Dietary Cooking Proportion (% of caloric intake thermally processed):",
      min: 0,
      max: 100,
      step: 5,
      value: rawRatio,
      unit: "%",
      onChange: function (val) {
        rawRatio = val;
        updateMetabolism();
      }
    });

    updateMetabolism();
  };

  /* -------------------------------------------------------------------------
     Figure 6: Step-by-Step Levallois Prepared Core Reduction Sequence
     ------------------------------------------------------------------------- */
  FIG['fig-levallois'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var svgWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(svgWrap);

    var currentStep = 1;
    var maxSteps = 5;

    var stepInfo = [
      {
        title: "Step 1: Raw Flint Nodule Selection",
        desc: "The knapper selects a cryptocrystalline nodule (flint or chert) with homogeneous texture free from frost cracks.",
        action: "Inspecting core geometry and initial striking margins."
      },
      {
        title: "Step 2: Centripetal Flaking (Shaping the Lower Face)",
        desc: "Series of bifacial radial strikes along the margin establish a perimeter striking platform around the nodule.",
        action: "Establishing a continuous circumferential working platform."
      },
      {
        title: "Step 3: Preparing the Upper Convex Surface (Carapace)",
        desc: "Knapper removes invasive transversal flakes to engineer precise longitudinal and lateral convexities across the top face.",
        action: "Setting dome curvature so the fracture wave will run along desired margins."
      },
      {
        title: "Step 4: Striking Platform Faceting",
        desc: "Small, precise flakes are detached from one edge to create an inclined, multifaceted platform ('chapeau de gendarme').",
        action: "Creating an exact 75° impact angle for the decisive punch."
      },
      {
        title: "Step 5: The Decisive Levallois Strike",
        desc: "A single, heavy, carefully positioned hammerstone blow detaches a broad, razor-sharp flake with pre-determined geometry.",
        action: "Detached Levallois flake ready for hafting; tortoise core remains for second extraction."
      }
    ];

    var readouts = FIG.readouts(container, [
      { id: "step-title", label: "Current Operation", value: stepInfo[0].title },
      { id: "step-action", label: "Knapper Action", value: stepInfo[0].action }
    ]);

    function renderStep() {
      svgWrap.innerHTML = '';
      var info = stepInfo[currentStep - 1];
      readouts.update("step-title", info.title);
      readouts.update("step-action", info.action);

      var w = 680, h = 320;
      var svg = FIG.createSVG(svgWrap, w, h, "Levallois reduction sequence step " + currentStep);

      var coreCol = FIG.getCSSVar('--surface-raised', '#dedbd2');
      var flakeCol = FIG.getCSSVar('--accent-light', '#e8eff5');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var warnCol = FIG.getCSSVar('--callout-warn', '#b45309');

      // Core outline (tortoise shape)
      var core = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      core.setAttribute('cx', "340");
      core.setAttribute('cy', "160");
      core.setAttribute('rx', "180");
      core.setAttribute('ry', "110");
      core.setAttribute('fill', coreCol);
      core.setAttribute('stroke', strokeCol);
      core.setAttribute('stroke-width', "2.5");
      svg.appendChild(core);

      // Radial flake scars based on step
      if (currentStep >= 2) {
        var angles = [0, 45, 90, 135, 180, 225, 270, 315];
        angles.forEach(function (ang) {
          var r = (ang * Math.PI) / 180;
          var x1 = 340 + Math.cos(r) * 170;
          var y1 = 160 + Math.sin(r) * 100;
          var x2 = 340 + Math.cos(r) * 115;
          var y2 = 160 + Math.sin(r) * 65;

          var scar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          scar.setAttribute('x1', x1); scar.setAttribute('y1', y1);
          scar.setAttribute('x2', x2); scar.setAttribute('y2', y2);
          scar.setAttribute('stroke', strokeCol);
          scar.setAttribute('stroke-width', "1.8");
          svg.appendChild(scar);
        });
      }

      // Convex ridges (Step 3+)
      if (currentStep >= 3) {
        var ridge1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        ridge1.setAttribute('d', "M 220 160 Q 340 100 460 160");
        ridge1.setAttribute('fill', 'none');
        ridge1.setAttribute('stroke', accentCol);
        ridge1.setAttribute('stroke-width', "2");
        svg.appendChild(ridge1);

        var ridge2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        ridge2.setAttribute('d', "M 240 170 Q 340 210 440 170");
        ridge2.setAttribute('fill', 'none');
        ridge2.setAttribute('stroke', accentCol);
        ridge2.setAttribute('stroke-width', "2");
        svg.appendChild(ridge2);
      }

      // Striking platform highlight (Step 4+)
      if (currentStep >= 4) {
        var plat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        plat.setAttribute('d', "M 160 150 Q 155 160 160 170 L 175 160 Z");
        plat.setAttribute('fill', warnCol);
        svg.appendChild(plat);
      }

      // Detached flake overlay (Step 5)
      if (currentStep === 5) {
        var flake = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        flake.setAttribute('d', "M 180 160 Q 340 85 450 160 Q 340 235 180 160 Z");
        flake.setAttribute('fill', flakeCol);
        flake.setAttribute('stroke', warnCol);
        flake.setAttribute('stroke-width', "3");
        flake.setAttribute('transform', "translate(25, -20)");
        svg.appendChild(flake);

        var impactArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        impactArrow.setAttribute('x1', "120"); impactArrow.setAttribute('y1', "160");
        impactArrow.setAttribute('x2', "165"); impactArrow.setAttribute('y2', "160");
        impactArrow.setAttribute('stroke', warnCol);
        impactArrow.setAttribute('stroke-width', "4");
        svg.appendChild(impactArrow);
      }

      var expl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      expl.setAttribute('x', "340");
      expl.setAttribute('y', "300");
      expl.setAttribute('text-anchor', 'middle');
      expl.setAttribute('font-size', '12');
      expl.setAttribute('font-family', FIG.getCSSVar('--font-sans'));
      expl.setAttribute('fill', FIG.getCSSVar('--ink-secondary'));
      expl.textContent = info.desc;
      svg.appendChild(expl);
    }

    FIG.button(controls, {
      label: "← Previous Step",
      onClick: function () {
        if (currentStep > 1) {
          currentStep--;
          renderStep();
        }
      }
    });

    FIG.button(controls, {
      label: "Next Step →",
      onClick: function () {
        if (currentStep < maxSteps) {
          currentStep++;
          renderStep();
        }
      }
    });

    renderStep();
  };

  /* -------------------------------------------------------------------------
     Figure 7: Synodic Lunar Cycle & Paleolithic Tally Bone Correlator
     ------------------------------------------------------------------------- */
  FIG['fig-tally-bone'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var svgWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(svgWrap);

    var currentDay = 14; // Day of lunar cycle (0 to 59 days = 2 months)

    var readouts = FIG.readouts(container, [
      { id: "moon-phase-name", label: "Visible Lunar Phase", value: "Full Moon (100% illumination)" },
      { id: "synodic-day", label: "Day in Synodic Month", value: "Day 14.8 / 29.5" },
      { id: "notch-count", label: "Notches Passed on Lebombo Fibula", value: "15 / 29 notches" }
    ]);

    function renderTally() {
      svgWrap.innerHTML = '';
      var synodicPeriod = 29.53059;
      var dayInMonth = currentDay % synodicPeriod;
      var phaseFraction = dayInMonth / synodicPeriod; // 0 = new, 0.5 = full, 1.0 = new

      // Phase identification
      var phaseName = "New Moon";
      if (phaseFraction >= 0.05 && phaseFraction < 0.20) phaseName = "Waxing Crescent";
      else if (phaseFraction >= 0.20 && phaseFraction < 0.30) phaseName = "First Quarter (Half Moon)";
      else if (phaseFraction >= 0.30 && phaseFraction < 0.45) phaseName = "Waxing Gibbous";
      else if (phaseFraction >= 0.45 && phaseFraction < 0.55) phaseName = "Full Moon (Peak Illumination)";
      else if (phaseFraction >= 0.55 && phaseFraction < 0.70) phaseName = "Waning Gibbous";
      else if (phaseFraction >= 0.70 && phaseFraction < 0.80) phaseName = "Last Quarter (Half Moon)";
      else if (phaseFraction >= 0.80 && phaseFraction < 0.95) phaseName = "Waning Crescent";

      var activeNotch = Math.min(29, Math.floor(dayInMonth) + 1);

      readouts.update("moon-phase-name", phaseName);
      readouts.update("synodic-day", "Day " + dayInMonth.toFixed(1) + " / 29.5");
      readouts.update("notch-count", activeNotch + " of 29 notches counted");

      var w = 680, h = 300;
      var svg = FIG.createSVG(svgWrap, w, h, "Lunar tally bone and celestial phase correlator");

      var boneCol = FIG.getCSSVar('--surface-raised', '#dedbd2');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var warnCol = FIG.getCSSVar('--callout-warn', '#b45309');

      // 1. Reconstructed Lebombo Bone (Baboon Fibula, Border Cave, ~44 ka)
      var bone = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bone.setAttribute('d', "M 60 180 C 80 160, 580 160, 600 180 C 620 200, 580 220, 560 215 C 400 205, 200 205, 60 210 Z");
      bone.setAttribute('fill', boneCol);
      bone.setAttribute('stroke', strokeCol);
      bone.setAttribute('stroke-width', "2");
      svg.appendChild(bone);

      // 29 Notches along the superior crest
      var startX = 100, stepX = 16.5;
      for (var n = 1; n <= 29; n++) {
        var nx = startX + (n - 1) * stepX;
        var isPassed = (n <= activeNotch);

        var notch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        notch.setAttribute('x1', nx);
        notch.setAttribute('y1', "165");
        notch.setAttribute('x2', nx + 2);
        notch.setAttribute('y2', "188");
        notch.setAttribute('stroke', isPassed ? warnCol : strokeCol);
        notch.setAttribute('stroke-width', isPassed ? "3.5" : "1.8");
        svg.appendChild(notch);

        if (n === activeNotch) {
          // Highlight arrow on current notch
          var pointer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          pointer.setAttribute('cx', nx + 1);
          pointer.setAttribute('cy', "156");
          pointer.setAttribute('r', "4");
          pointer.setAttribute('fill', warnCol);
          svg.appendChild(pointer);
        }
      }

      // 2. Visible Moon Disc Representation in night sky box
      var moonBoxX = 280, moonBoxY = 40, moonR = 32;
      var skyBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      skyBg.setAttribute('cx', moonBoxX);
      skyBg.setAttribute('cy', moonBoxY + 32);
      skyBg.setAttribute('r', moonR);
      skyBg.setAttribute('fill', "#14151a");
      skyBg.setAttribute('stroke', FIG.getCSSVar('--border-strong'));
      svg.appendChild(skyBg);

      // Light portion of moon disc
      var illP = Math.cos(phaseFraction * 2 * Math.PI); // 1 = full, -1 = new
      var moonLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      moonLight.setAttribute('cx', moonBoxX);
      moonLight.setAttribute('cy', moonBoxY + 32);
      moonLight.setAttribute('r', moonR - 1);
      moonLight.setAttribute('fill', "#f5eed7");
      if (phaseFraction > 0.45 && phaseFraction < 0.55) {
        svg.appendChild(moonLight);
      } else if (phaseFraction < 0.45) {
        // Waxing crescent / gibbous
        svg.appendChild(moonLight);
        var shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        shadow.setAttribute('cx', moonBoxX + illP * (moonR * 0.6));
        shadow.setAttribute('cy', moonBoxY + 32);
        shadow.setAttribute('rx', Math.abs(illP) * moonR);
        shadow.setAttribute('ry', moonR);
        shadow.setAttribute('fill', "#14151a");
        svg.appendChild(shadow);
      } else {
        // Waning
        svg.appendChild(moonLight);
        var shadowWane = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        shadowWane.setAttribute('cx', moonBoxX - illP * (moonR * 0.6));
        shadowWane.setAttribute('cy', moonBoxY + 32);
        shadowWane.setAttribute('rx', Math.abs(illP) * moonR);
        shadowWane.setAttribute('ry', moonR);
        shadowWane.setAttribute('fill', "#14151a");
        svg.appendChild(shadowWane);
      }

      // Text labels
      var tLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tLbl.setAttribute('x', moonBoxX);
      tLbl.setAttribute('y', moonBoxY + 84);
      tLbl.setAttribute('text-anchor', 'middle');
      tLbl.setAttribute('font-size', '11');
      tLbl.setAttribute('font-weight', '700');
      tLbl.setAttribute('fill', strokeCol);
      tLbl.textContent = phaseName;
      svg.appendChild(tLbl);

      var boneLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      boneLbl.setAttribute('x', "340");
      boneLbl.setAttribute('y', "245");
      boneLbl.setAttribute('text-anchor', 'middle');
      boneLbl.setAttribute('font-size', '11');
      boneLbl.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      boneLbl.setAttribute('fill', accentCol);
      boneLbl.textContent = "Lebombo Bone (Eswatini, ~44 ka): 29 Incised Transverse Notches on Baboon Fibula";
      svg.appendChild(boneLbl);
    }

    FIG.slider(controls, {
      id: "lunar-day",
      label: "Day of Observation (0 to 59 days across 2 complete lunar cycles):",
      min: 0,
      max: 59,
      step: 1,
      value: currentDay,
      unit: "days",
      onChange: function (val) {
        currentDay = val;
        renderTally();
      }
    });

    renderTally();
  };

  /* -------------------------------------------------------------------------
     Figure 8: Test Yourself Quiz for Part 1
     ------------------------------------------------------------------------- */
  FIG['fig-quiz-part1'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    var questions = [
      {
        question: "Why do archaeological stone tools from Lomekwi 3 (3.3 Ma) challenge traditional definitions of the genus Homo?",
        options: [
          "They prove that metal extraction occurred millions of years earlier than thought.",
          "They show intentional core reduction predates the earliest known fossil evidence of Homo by roughly 500,000 years.",
          "They demonstrate that chimpanzees had written symbolic language in the Pliocene.",
          "They were manufactured using volcanic glass polished with mechanical grindstones."
        ],
        answer: 1,
        explanation: "Dated to 3.3 Ma, Lomekwi 3 stone tools predate the earliest Homo fossils (~2.8 Ma at Ledi-Geraru), indicating earlier hominins such as Kenyanthropus or Australopithecus possessed flaking ability."
      },
      {
        question: "What physical property of fine-grained silicate rocks (chert, flint, obsidian) makes conchoidal knapping predictable?",
        options: [
          "Crystalline cleavages that snap in strict 90-degree right angles.",
          "Isotropic mechanical behavior lacking internal cleavage planes, allowing shockwaves to radiate in Hertzian cones.",
          "High thermal conductivity that melts the stone under impact.",
          "Organic moisture content that acts as a hydraulic lubricant during fracture."
        ],
        answer: 1,
        explanation: "Because cryptocrystalline silicates are isotropic (uniform in all directions), striking force propagates without following grain boundaries, forming reproducible Hertzian cones."
      },
      {
        question: "Which scientific method provided the microstratigraphic proof of controlled fire at Wonderwerk Cave (~1.0 Ma)?",
        options: [
          "Potassium-argon dating of ash layers directly.",
          "Fourier-Transform Infrared Microspectroscopy (FTIR) identifying thermally altered bone and ashed plant matter at 400–700°C in unweathered cave sediments.",
          "Radiocarbon dating of charred mammoth hides.",
          "Satellite radar detection of ancient smoke plumes."
        ],
        answer: 1,
        explanation: "Berna et al. (2012) used micromorphological thin sections and FTIR to identify ash and burnt bone within cave strata too deep to have been produced by surface wildfires."
      },
      {
        question: "According to the 'Expensive-Tissue Hypothesis' (Aiello & Wheeler), what anatomical trade-off enabled the expansion of hominin brain volume?",
        options: [
          "Reduction in bone density throughout the limbs.",
          "A major reduction in the mass and energy demands of the gastrointestinal tract, made possible by high-calorie cooked diets.",
          "Loss of body hair reducing sweat gland metabolic load.",
          "Shrinkage of the visual cortex in favor of the frontal lobe."
        ],
        answer: 1,
        explanation: "Both gut tissue and neural tissue are metabolically greedy; higher-quality cooked foods allowed gut mass to shrink, liberating metabolic energy for brain growth."
      },
      {
        question: "What did the 2017 thermoluminescence dating of fossil remains at Jebel Irhoud, Morocco reveal about the origin of Homo sapiens?",
        options: [
          "Homo sapiens originated solely in southern Africa roughly 50,000 years ago.",
          "Our species emerged around 315,000 years ago in a pan-African mosaic rather than a single East African event 200,000 years ago.",
          "Neanderthals and modern humans evolved completely independently on different continents without common ancestry.",
          "Stone tool production began simultaneously with the invention of agriculture."
        ],
        answer: 1,
        explanation: "Hublin et al. pushed back the known antiquity of anatomically modern Homo sapiens to ~315 ka, demonstrating our species had evolved across Africa far earlier than previously believed."
      },
      {
        question: "Why does radiocarbon (¹⁴C) dating cannot be applied to Oldowan pebble tools or 1.5-million-year-old Acheulean handaxes?",
        options: [
          "Stone absorbs excessive radiation from groundwater, resetting the clock.",
          "With a half-life of 5,730 years, after roughly 50,000 years (~10 half-lives) the remaining ¹⁴C activity falls below analytical detection thresholds.",
          "¹⁴C decay only begins when rock is exposed to sunlight at the surface.",
          "Only volcanic basalt contains radiocarbon, whereas Oldowan tools are flint."
        ],
        answer: 1,
        explanation: "Radiocarbon is effective only on organic material up to ~50,000 years ago. Early hominin sites are dated using ⁴⁰Ar/³⁹Ar on intercalated volcanic tuffs, paleomagnetism, or luminescence."
      },
      {
        question: "What technological feature distinguishes Mode 3 Levallois flaking from earlier Mode 2 Acheulean handaxes?",
        options: [
          "Levallois tools are made by heating iron ore in ceramic furnaces.",
          "The knapper carefully prepares the convexities of the core in advance so that a single final blow releases a tool of predetermined shape.",
          "Tools are made purely by rubbing river cobbles against abrasive granite.",
          "Levallois techniques eliminate the use of hammerstones in favor of wooden wedges."
        ],
        answer: 1,
        explanation: "Levallois knapping represents sophisticated mental templating: the core is an abstract matrix prepared specifically to extract a predetermined projectile or cutting edge."
      },
      {
        question: "What was discovered at Blombos Cave (South Africa, ~73–100 ka) that provides definitive proof of abstract symbolic communication?",
        options: [
          "Cuneiform clay tablets detailing cattle counts.",
          "Engraved ochre plaques incised with deliberate geometric cross-hatch cross-hatching and compound pigment recipes.",
          "Cast bronze animal figurines.",
          "Glass beads traded from the Mediterranean."
        ],
        answer: 1,
        explanation: "Henshilwood and colleagues excavated carefully ground ochre slabs with intentional, intersecting geometric cross-hatches dated to ~77 ka, far predating European cave art."
      },
      {
        question: "What is the primary scientific consensus regarding the 29 notches on the Lebombo bone (Eswatini, ~44 ka)?",
        options: [
          "It is a weapon tally recording military victories between hominin tribes.",
          "It represents an intentional numerical tally, closely matching the 29.5-day synodic lunar month or menstrual cycle tracking.",
          "It was accidentally produced by hyena gnawing during burial.",
          "It served as a musical flute with pitch holes."
        ],
        answer: 1,
        explanation: "Microscopic analysis (d'Errico et al.) shows the notches were incised sequentially with deliberate tools, making it one of the oldest known mathematical counting and lunar tracking artifacts."
      },
      {
        question: "Why do modern archaeologists reject the mid-20th century concept of a sudden 50,000-year-old 'Upper Paleolithic Human Revolution'?",
        options: [
          "Because stone tools were not invented until 10,000 years ago.",
          "Because Middle Stone Age excavations across Africa demonstrate that art, composite tools, hafting, and trade emerged gradually over 250,000 years.",
          "Because genetic testing proved Neanderthals never interacted with Homo sapiens.",
          "Because ancient humans did not possess vocal cords until the Bronze Age."
        ],
        answer: 1,
        explanation: "As documented by McBrearty and Brooks ('The Revolution That Wasn't'), every marker of cognitive modernity (pigment processing, bladelets, marine foraging, bone points) appeared piecemeal in Africa long before 50 ka."
      }
    ];

    FIG.quiz(container, questions);
  };

})();
