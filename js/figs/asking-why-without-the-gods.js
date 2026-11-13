/* ==========================================================================
   RNLearn — Figures for "Asking 'Why' Without the Gods"
   Slug: asking-why-without-the-gods
   Figures:
     1. fig-eratosthenes: Eratosthenes' Earth circumference solar geometry simulator
     2. fig-archimedes-balance: Archimedes' hydrostatic buoyancy crown density balance
     3. fig-atomism: Democritean & Vaiśeṣika atomic particle lattice viewer
     4. fig-aristotle-elements: Aristotelian 4-element concentric cosmos & gravitas/levitas
     5. fig-mozi-pinhole: Mohist camera obscura pinhole ray-tracing optical bench
     6. fig-lunar-curved-shadow: Aristotelian spherical Earth proof via lunar eclipse shadow
     7. fig-nyaya-syllogism: The 5-step Indian Nyāya logical inference engine
     8. fig-quiz-part3: 10-question self-assessment quiz with detailed rationale
   ========================================================================== */

(function () {
  'use strict';

  var FIG = window.FIG || {};

  /* -------------------------------------------------------------------------
     Figure 1: Eratosthenes' Earth Circumference Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-eratosthenes'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentAngleDeg = 7.2; // 7° 12' = 1/50 of a circle (7.2 degrees)
    var currentStadiaDist = 5000; // 5,000 stadia between Alexandria and Syene

    var readouts = FIG.readouts(container, [
      { id: "circle-fraction", label: "Angular Fraction of Circle", value: "1 / 50.0 of 360°" },
      { id: "calc-circumference", label: "Calculated Circumference", value: "250,000 stadia (~39,375 km)" },
      { id: "error-vs-modern", label: "Modern Deviation", value: "-1.7% from true polar circumference (40,008 km)" }
    ]);

    function renderEratosthenes() {
      dispWrap.innerHTML = '';
      var theta = currentAngleDeg;
      var fraction = 360 / Math.max(0.1, theta);
      var totalStadia = currentStadiaDist * fraction;

      // 1 Egyptian stadion ≈ 157.5 meters = 0.1575 km
      var kmResult = totalStadia * 0.1575;
      var errorPct = ((kmResult - 40008) / 40008) * 100;

      readouts.update("circle-fraction", "1 / " + fraction.toFixed(1) + " of 360° (" + theta.toFixed(2) + "°)");
      readouts.update("calc-circumference", Math.round(totalStadia).toLocaleString() + " stadia (~" + Math.round(kmResult).toLocaleString() + " km)");
      readouts.update("error-vs-modern", (errorPct > 0 ? "+" : "") + errorPct.toFixed(1) + "% relative to modern polar value (40,008 km)");

      var w = 680, h = 320;
      var svg = FIG.createSVG(dispWrap, w, h, "Eratosthenes geometric measurement of the Earth");

      var earthCol = FIG.getCSSVar('--surface-raised', '#dedbd2');
      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var accentCol = FIG.getCSSVar('--accent', '#1b4965');
      var sunRayCol = "#b45309";

      // Earth Center (x = 180, y = 160, R = 110)
      var ecX = 180, ecY = 160, R = 110;

      // Earth Globe circle
      var earth = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      earth.setAttribute('cx', ecX); earth.setAttribute('cy', ecY); earth.setAttribute('r', R);
      earth.setAttribute('fill', earthCol);
      earth.setAttribute('stroke', strokeCol); earth.setAttribute('stroke-width', "2");
      svg.appendChild(earth);

      // Syene (Aswan) on Tropic of Cancer (angle = 0° relative to horizontal east)
      var syeneX = ecX + R;
      var syeneY = ecY;

      // Alexandria (angle = -theta relative to horizontal east)
      var rad = (theta * Math.PI) / 180;
      var alexX = ecX + Math.cos(rad) * R;
      var alexY = ecY - Math.sin(rad) * R;

      // Vertical radial line from Earth center through Syene (into well)
      var rSyene = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rSyene.setAttribute('x1', ecX); rSyene.setAttribute('y1', ecY);
      rSyene.setAttribute('x2', ecX + R + 45); rSyene.setAttribute('y2', ecY);
      rSyene.setAttribute('stroke', accentCol); rSyene.setAttribute('stroke-width', "1.5");
      rSyene.setAttribute('stroke-dasharray', "3 3");
      svg.appendChild(rSyene);

      // Vertical radial line from Earth center through Alexandria (Gnomon pillar)
      var rAlex = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rAlex.setAttribute('x1', ecX); rAlex.setAttribute('y1', ecY);
      var gnomonLen = 35;
      var gnomonTipX = ecX + Math.cos(rad) * (R + gnomonLen);
      var gnomonTipY = ecY - Math.sin(rad) * (R + gnomonLen);
      rAlex.setAttribute('x2', gnomonTipX); rAlex.setAttribute('y2', gnomonTipY);
      rAlex.setAttribute('stroke', accentCol); rAlex.setAttribute('stroke-width', "2");
      svg.appendChild(rAlex);

      // Parallel Sun Rays (Horizontal from right to left)
      // Ray 1: Deep into the well at Syene (direct vertical)
      var ray1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ray1.setAttribute('x1', "620"); ray1.setAttribute('y1', syeneY);
      ray1.setAttribute('x2', syeneX); ray1.setAttribute('y2', syeneY);
      ray1.setAttribute('stroke', sunRayCol); ray1.setAttribute('stroke-width', "2.5");
      svg.appendChild(ray1);

      // Ray 2: Striking the top of Alexandria Gnomon and casting shadow
      var ray2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ray2.setAttribute('x1', "620"); ray2.setAttribute('y1', gnomonTipY);
      ray2.setAttribute('x2', gnomonTipX); ray2.setAttribute('y2', gnomonTipY);
      ray2.setAttribute('stroke', sunRayCol); ray2.setAttribute('stroke-width', "2.5");
      svg.appendChild(ray2);

      // Gnomon shadow arc at Alexandria
      var shadowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      shadowLine.setAttribute('x1', gnomonTipX); shadowLine.setAttribute('y1', gnomonTipY);
      shadowLine.setAttribute('x2', gnomonTipX - (gnomonLen * Math.tan(rad))); shadowLine.setAttribute('y2', gnomonTipY);
      shadowLine.setAttribute('stroke', "#dc2626"); shadowLine.setAttribute('stroke-width', "3");
      svg.appendChild(shadowLine);

      // Central subtended angle arc at Earth center
      var arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arcPath.setAttribute('d', "M " + (ecX + 45) + " " + ecY + " A 45 45 0 0 0 " + (ecX + Math.cos(rad) * 45) + " " + (ecY - Math.sin(rad) * 45));
      arcPath.setAttribute('fill', 'none'); arcPath.setAttribute('stroke', "#dc2626"); arcPath.setAttribute('stroke-width', "2");
      svg.appendChild(arcPath);

      // Text Labels
      var tArc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tArc.setAttribute('x', ecX + 55); tArc.setAttribute('y', ecY - 10);
      tArc.setAttribute('font-size', '12'); tArc.setAttribute('font-weight', '700');
      tArc.setAttribute('fill', "#dc2626");
      tArc.textContent = "θ = " + theta.toFixed(1) + "°";
      svg.appendChild(tArc);

      var tSyene = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tSyene.setAttribute('x', syeneX + 10); tSyene.setAttribute('y', syeneY - 10);
      tSyene.setAttribute('font-size', '11'); tSyene.setAttribute('font-weight', '700');
      tSyene.setAttribute('fill', strokeCol);
      tSyene.textContent = "Syene (Vertical Noon Well)";
      svg.appendChild(tSyene);

      var tAlex = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tAlex.setAttribute('x', alexX - 8); tAlex.setAttribute('y', alexY - 30);
      tAlex.setAttribute('font-size', '11'); tAlex.setAttribute('font-weight', '700');
      tAlex.setAttribute('fill', strokeCol);
      tAlex.textContent = "Alexandria (Gnomon Shadow)";
      svg.appendChild(tAlex);

      var tDist = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tDist.setAttribute('x', "235"); tDist.setAttribute('y', "140");
      tDist.setAttribute('font-size', '10.5'); tDist.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      tDist.setAttribute('fill', accentCol);
      tDist.textContent = "Arc s = 5,000 stadia";
      svg.appendChild(tDist);

      var tFormula = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tFormula.setAttribute('x', "480"); tFormula.setAttribute('y', "70");
      tFormula.setAttribute('text-anchor', 'middle'); tFormula.setAttribute('font-size', '12');
      tFormula.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      tFormula.setAttribute('fill', strokeCol);
      tFormula.textContent = "Parallel Solar Rays: θ / 360° = s / C";
      svg.appendChild(tFormula);

      var tFormula2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tFormula2.setAttribute('x', "480"); tFormula2.setAttribute('y', "95");
      tFormula2.setAttribute('text-anchor', 'middle'); tFormula2.setAttribute('font-size', '12');
      tFormula2.setAttribute('font-weight', '700');
      tFormula2.setAttribute('fill', accentCol);
      tFormula2.textContent = "C = 50 × 5,000 = 250,000 stadia";
      svg.appendChild(tFormula2);
    }

    FIG.slider(controls, {
      id: "erato-angle",
      label: "Alexandria Solstice Shadow Zenith Angle (θ degrees):",
      min: 5.0,
      max: 10.0,
      step: 0.1,
      value: currentAngleDeg,
      unit: "°",
      onChange: function (val) {
        currentAngleDeg = val;
        renderEratosthenes();
      }
    });

    renderEratosthenes();
  };

  /* -------------------------------------------------------------------------
     Figure 2: Archimedes' Hydrostatic Balance Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-archimedes-balance'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var goldPurityPct = 70; // 70% gold, 30% silver by mass
    var totalMassGrams = 1000; // 1 kg crown

    // Physical Densities
    var rhoGold = 19.32; // g/cm³
    var rhoSilver = 10.49; // g/cm³
    var rhoWater = 1.00; // g/cm³

    var readouts = FIG.readouts(container, [
      { id: "effective-density", label: "Composite Crown Density", value: "15.12 g/cm³" },
      { id: "buoyancy-loss", label: "Submerged Weight Deficit", value: "66.1 g apparent loss (vs 51.8 g pure gold)" },
      { id: "fraud-verdict", label: "Archimedes' Hydrostatic Verdict", value: "FRAUD DETECTED (Balance tips under water)" }
    ]);

    function renderArchimedes() {
      dispWrap.innerHTML = '';
      var fGold = goldPurityPct / 100;
      var fSilver = 1 - fGold;

      var massGold = totalMassGrams * fGold;
      var massSilver = totalMassGrams * fSilver;

      // Total volume V = V_gold + V_silver = m_g / rho_g + m_s / rho_s
      var vCrown = (massGold / rhoGold) + (massSilver / rhoSilver);
      var compositeDensity = totalMassGrams / vCrown;

      // Pure gold volume for 1000 g
      var vPureGold = totalMassGrams / rhoGold; // ≈ 51.76 cm³

      // Buoyant force in water (mass of displaced water in grams)
      var waterDisplacedCrown = vCrown * rhoWater;
      var waterDisplacedPure = vPureGold * rhoWater;
      var deltaBuoyancy = waterDisplacedCrown - waterDisplacedPure; // Crown is lighter in water by this amount!

      var isAdulterated = (goldPurityPct < 98);

      readouts.update("effective-density", compositeDensity.toFixed(2) + " g/cm³ (Pure Gold = 19.32 g/cm³)");
      readouts.update("buoyancy-loss", "Crown displaces " + waterDisplacedCrown.toFixed(1) + " cm³ water (Pure gold: " + waterDisplacedPure.toFixed(1) + " cm³)");
      readouts.update("fraud-verdict", isAdulterated ? "ADULTERATED CROWN: Tipped balance reveals " + (100 - goldPurityPct) + "% silver alloy" : "PURE GOLD: Balance remains in perfect equilibrium under water");

      var w = 680, h = 320;
      var svg = FIG.createSVG(dispWrap, w, h, "Archimedes hydrostatic balance crown alloy test");

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var bronzeCol = "#b45309";
      var waterCol = "rgba(14, 116, 144, 0.25)";

      // In air, both weigh exactly 1000g, so balance is balanced.
      // In water, the crown displaces MORE water, so it experiences GREATER buoyant upthrust.
      // Therefore, the crown rises and the pure gold standard sinks!
      var tiltAngleRad = (deltaBuoyancy / 35) * (Math.PI / 180); // Beam tilts
      var beamLen = 280;
      var bX1 = 340 - Math.cos(tiltAngleRad) * (beamLen / 2);
      var bY1 = 80 + Math.sin(tiltAngleRad) * (beamLen / 2); // Crown side (left) rises when deltaBuoyancy > 0
      var bX2 = 340 + Math.cos(tiltAngleRad) * (beamLen / 2);
      var bY2 = 80 - Math.sin(tiltAngleRad) * (beamLen / 2); // Pure gold side (right) sinks

      // Balance Pillar & Base
      var pillar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      pillar.setAttribute('x1', "340"); pillar.setAttribute('y1', "80");
      pillar.setAttribute('x2', "340"); pillar.setAttribute('y2', "270");
      pillar.setAttribute('stroke', strokeCol); pillar.setAttribute('stroke-width', "4");
      svg.appendChild(pillar);

      // Tilting Beam
      var beam = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      beam.setAttribute('x1', bX1); beam.setAttribute('y1', bY1);
      beam.setAttribute('x2', bX2); beam.setAttribute('y2', bY2);
      beam.setAttribute('stroke', bronzeCol); beam.setAttribute('stroke-width', "4");
      svg.appendChild(beam);

      // Water Tanks (Left tank: Crown | Right tank: Pure Gold)
      var tankL = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tankL.setAttribute('x', "130"); tankL.setAttribute('y', "150");
      tankL.setAttribute('width', "140"); tankL.setAttribute('height', "120");
      tankL.setAttribute('fill', waterCol); tankL.setAttribute('stroke', strokeCol);
      tankL.setAttribute('stroke-width', "2");
      svg.appendChild(tankL);

      var tankR = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tankR.setAttribute('x', "410"); tankR.setAttribute('y', "150");
      tankR.setAttribute('width', "140"); tankR.setAttribute('height', "120");
      tankR.setAttribute('fill', waterCol); tankR.setAttribute('stroke', strokeCol);
      tankR.setAttribute('stroke-width', "2");
      svg.appendChild(tankR);

      // Left Suspension String & Submerged Crown
      var strL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      strL.setAttribute('x1', bX1); strL.setAttribute('y1', bY1);
      strL.setAttribute('x2', "200"); strL.setAttribute('y2', "200");
      strL.setAttribute('stroke', strokeCol); strL.setAttribute('stroke-width', "1.5");
      svg.appendChild(strL);

      var crown = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      crown.setAttribute('d', "M 180 220 L 185 200 L 193 210 L 200 195 L 207 210 L 215 200 L 220 220 Z");
      crown.setAttribute('fill', isAdulterated ? "#d4af37" : "#eab308");
      crown.setAttribute('stroke', strokeCol);
      svg.appendChild(crown);

      // Right Suspension String & Submerged Pure Gold Bar
      var strR = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      strR.setAttribute('x1', bX2); strR.setAttribute('y1', bY2);
      strR.setAttribute('x2', "480"); strR.setAttribute('y2', "210");
      strR.setAttribute('stroke', strokeCol); strR.setAttribute('stroke-width', "1.5");
      svg.appendChild(strR);

      var goldBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      goldBar.setAttribute('x', "465"); goldBar.setAttribute('y', "205");
      goldBar.setAttribute('width', "30"); goldBar.setAttribute('height', "18");
      goldBar.setAttribute('fill', "#eab308"); goldBar.setAttribute('stroke', strokeCol);
      svg.appendChild(goldBar);

      // Labels
      var lblL = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblL.setAttribute('x', "200"); lblL.setAttribute('y', "290");
      lblL.setAttribute('text-anchor', 'middle'); lblL.setAttribute('font-size', '12'); lblL.setAttribute('font-weight', '700');
      lblL.setAttribute('fill', strokeCol);
      lblL.textContent = "Suspect Crown (" + goldPurityPct + "% Au)";
      svg.appendChild(lblL);

      var lblR = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblR.setAttribute('x', "480"); lblR.setAttribute('y', "290");
      lblR.setAttribute('text-anchor', 'middle'); lblR.setAttribute('font-size', '12'); lblR.setAttribute('font-weight', '700');
      lblR.setAttribute('fill', strokeCol);
      lblR.textContent = "Pure Gold Standard (100% Au)";
      svg.appendChild(lblR);
    }

    FIG.slider(controls, {
      id: "crown-gold-pct",
      label: "Gold Content in Crown (% by mass):",
      min: 40,
      max: 100,
      step: 1,
      value: goldPurityPct,
      unit: "%",
      onChange: function (val) {
        goldPurityPct = val;
        renderArchimedes();
      }
    });

    renderArchimedes();
  };

  /* -------------------------------------------------------------------------
     Figure 3: Democritean & Vaiśeṣika Atomic Particle Lattice Viewer
     ------------------------------------------------------------------------- */
  FIG['fig-atomism'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var canvasWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(canvasWrap);

    var currentTradition = 'greek'; // 'greek' or 'indian'
    var agitationSpeed = 2;

    var readouts = FIG.readouts(container, [
      { id: "atom-model-title", label: "Ontological Framework", value: "Democritean Mechanical Atomism (Atoma in Void)" },
      { id: "binding-mechanism", label: "Binding Principle", value: "Mechanical hooks, interlocking geometries, and void collisions" },
      { id: "epistemic-status", label: "Epistemic Status", value: "Secondary qualities (color, taste) are subjective observer constructs" }
    ]);

    var canvasObj = FIG.createCanvas(canvasWrap, 680, 280);
    var ctx = canvasObj.ctx;

    // Simulated particles
    var particles = [];
    for (var i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 660 + 10,
        y: Math.random() * 260 + 10,
        vx: (Math.random() - 0.5) * agitationSpeed,
        vy: (Math.random() - 0.5) * agitationSpeed,
        type: i % 4, // 0: Earth, 1: Water, 2: Fire, 3: Air
        radius: 6 + (i % 3) * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, 680, 280);

      var isGreek = (currentTradition === 'greek');
      readouts.update("atom-model-title", isGreek ? "Democritean Atomism (Abdera, c. 420 BCE)" : "Kaṇāda's Vaiśeṣika Atomism (India, c. 6th–2nd century BCE)");
      readouts.update("binding-mechanism", isGreek ? "Mechanical collision in void (hook-and-eye geometries, barbed shapes)" : "Invisible moral/cosmic force (Adṛṣṭa) combining paramāṇu into dyads and triads");
      readouts.update("epistemic-status", isGreek ? "'By convention color, by convention sweet; in reality atoms and void'" : "Qualities (Guṇa) are real inherences in atoms of Earth, Water, Fire, and Air");

      // Draw particles
      particles.forEach(function (p) {
        p.x += p.vx * agitationSpeed;
        p.y += p.vy * agitationSpeed;

        if (p.x < 10 || p.x > 670) p.vx *= -1;
        if (p.y < 10 || p.y > 270) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (isGreek) {
          ctx.fillStyle = FIG.getCSSVar('--accent', '#1b4965');
          ctx.fill();
          // Draw mechanical hooks on particles
          ctx.strokeStyle = FIG.getCSSVar('--ink', '#17181c');
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.radius + 3, p.y);
          ctx.stroke();
        } else {
          // Indian Vaiśeṣika 4 Mahābhūtas: Earth (Yellow), Water (Blue), Fire (Red), Air (Cyan)
          var colors = ["#ca8a04", "#2563eb", "#dc2626", "#06b6d4"];
          ctx.fillStyle = colors[p.type];
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
        }
      });
    }

    FIG.select(controls, {
      id: "atomism-model-select",
      label: "Select Atomic Tradition to Contrast:",
      options: [
        { value: "greek", label: "Greek Atomism (Leucippus & Democritus: Geometric Hooks & Void)" },
        { value: "indian", label: "Indian Atomism (Kaṇāda's Vaiśeṣika Sūtra: Elemental Paramāṇu Dyads)" }
      ],
      value: "greek",
      onChange: function (val) {
        currentTradition = val;
      }
    });

    FIG.slider(controls, {
      id: "atom-speed",
      label: "Thermal Agitation / Particle Velocity:",
      min: 0.5,
      max: 5.0,
      step: 0.5,
      value: agitationSpeed,
      unit: "x",
      onChange: function (val) {
        agitationSpeed = val;
      }
    });

    FIG.animate(figEl, draw);
  };

  /* -------------------------------------------------------------------------
     Figure 4: Aristotelian 4-Element Concentric Cosmos & Natural Motion
     ------------------------------------------------------------------------- */
  FIG['fig-aristotle-elements'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var displacedElement = "none";

    var readouts = FIG.readouts(container, [
      { id: "cosmos-domain", label: "Cosmological Domain", value: "Sublunary Sphere (Mutable, 4 elements)" },
      { id: "motion-tendency", label: "Natural Motion Law", value: "In equilibrium: Elements rest in concentric spheres by density" },
      { id: "gravitas-levitas", label: "Intrinsic Quality", value: "Earth/Water possess gravitas; Air/Fire possess levitas" }
    ]);

    function renderCosmos() {
      dispWrap.innerHTML = '';

      var w = 680, h = 320;
      var svg = FIG.createSVG(dispWrap, w, h, "Aristotelian four-element concentric cosmos");

      var cx = 340, cy = 160;

      // Concentric Spheres
      // 1. Earth (Center: r = 35)
      // 2. Water (r = 65)
      // 3. Air (r = 100)
      // 4. Fire (r = 135)
      // 5. Celestial Sphere of the Moon (r = 150)
      var spheres = [
        { name: "Sphere of Fire", r: 135, col: "rgba(220, 38, 38, 0.15)", border: "#dc2626" },
        { name: "Sphere of Air", r: 100, col: "rgba(14, 116, 144, 0.15)", border: "#0e7490" },
        { name: "Sphere of Water", r: 65, col: "rgba(37, 99, 235, 0.20)", border: "#2563eb" },
        { name: "Sphere of Earth", r: 35, col: "#854d0e", border: "#713f12" }
      ];

      spheres.forEach(function (s) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', s.r);
        c.setAttribute('fill', s.col); c.setAttribute('stroke', s.border);
        c.setAttribute('stroke-width', "1.5");
        svg.appendChild(c);
      });

      // Moon Orb Border (Boundary to Aether Superlunary Realm)
      var moonOrb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      moonOrb.setAttribute('cx', cx); moonOrb.setAttribute('cy', cy); moonOrb.setAttribute('r', "150");
      moonOrb.setAttribute('fill', 'none'); moonOrb.setAttribute('stroke', FIG.getCSSVar('--ink'));
      moonOrb.setAttribute('stroke-width', "2.5");
      moonOrb.setAttribute('stroke-dasharray', "5 3");
      svg.appendChild(moonOrb);

      // Trajectory arrow if an element is displaced
      if (displacedElement === "stone_in_air") {
        readouts.update("motion-tendency", "NATURAL MOTION (Gravitas): Heavy Earth stone released in Air falls straight down toward cosmic center");
        readouts.update("gravitas-levitas", "Intrinsic Gravitas (Gravity): Seeking natural resting place at the center of the universe");

        var arrowDown = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrowDown.setAttribute('x1', cx + 45); arrowDown.setAttribute('y1', cy - 80);
        arrowDown.setAttribute('x2', cx + 45); arrowDown.setAttribute('y2', cy - 10);
        arrowDown.setAttribute('stroke', "#854d0e"); arrowDown.setAttribute('stroke-width', "4");
        svg.appendChild(arrowDown);

        var rock = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rock.setAttribute('cx', cx + 45); rock.setAttribute('cy', cy - 80); rock.setAttribute('r', "7");
        rock.setAttribute('fill', "#854d0e");
        svg.appendChild(rock);
      } else if (displacedElement === "fire_under_earth") {
        readouts.update("motion-tendency", "NATURAL MOTION (Levitas): Light Fire spark trapped below ascends vertically toward celestial periphery");
        readouts.update("gravitas-levitas", "Intrinsic Levitas (Levity): Tendency to rise away from center toward lunar sphere");

        var arrowUp = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrowUp.setAttribute('x1', cx - 45); arrowUp.setAttribute('y1', cy + 20);
        arrowUp.setAttribute('x2', cx - 45); arrowUp.setAttribute('y2', cy + 120);
        arrowUp.setAttribute('stroke', "#dc2626"); arrowUp.setAttribute('stroke-width', "4");
        svg.appendChild(arrowUp);

        var flame = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        flame.setAttribute('cx', cx - 45); flame.setAttribute('cy', cy + 20); flame.setAttribute('r', "6");
        flame.setAttribute('fill', "#dc2626");
        svg.appendChild(flame);
      } else {
        readouts.update("motion-tendency", "In equilibrium: Elements rest in concentric spheres by intrinsic density");
        readouts.update("gravitas-levitas", "Sublunary realm: Linear rectilinear motion | Superlunary realm: Eternal circular motion of Aether");
      }

      // Sphere labels
      var tFire = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tFire.setAttribute('x', cx + 115); tFire.setAttribute('y', cy - 85);
      tFire.setAttribute('font-size', '11'); tFire.setAttribute('font-weight', '700');
      tFire.setAttribute('fill', "#dc2626");
      tFire.textContent = "Fire (Warm & Dry)";
      svg.appendChild(tFire);

      var tAir = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tAir.setAttribute('x', cx + 80); tAir.setAttribute('y', cy - 55);
      tAir.setAttribute('font-size', '11'); tAir.setAttribute('font-weight', '700');
      tAir.setAttribute('fill', "#0e7490");
      tAir.textContent = "Air (Warm & Moist)";
      svg.appendChild(tAir);

      var tEarth = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tEarth.setAttribute('x', cx); tEarth.setAttribute('y', cy + 4);
      tEarth.setAttribute('text-anchor', 'middle'); tEarth.setAttribute('font-size', '11'); tEarth.setAttribute('font-weight', '700');
      tEarth.setAttribute('fill', "#ffffff");
      tEarth.textContent = "Earth";
      svg.appendChild(tEarth);

      var tSuper = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tSuper.setAttribute('x', "340"); tSuper.setAttribute('y', "20");
      tSuper.setAttribute('text-anchor', 'middle'); tSuper.setAttribute('font-size', '11');
      tSuper.setAttribute('font-family', FIG.getCSSVar('--font-mono'));
      tSuper.setAttribute('fill', FIG.getCSSVar('--accent'));
      tSuper.textContent = "Boundary to Superlunary Realm (Incorruptible Quintessence / Aether)";
      svg.appendChild(tSuper);
    }

    FIG.select(controls, {
      id: "aristotle-displacement",
      label: "Displace an Element to Observe Natural Motion Law:",
      options: [
        { value: "none", label: "Cosmic Equilibrium (Rest in natural concentric spheres)" },
        { value: "stone_in_air", label: "Displace Earth Stone into Air (Natural fall via Gravitas)" },
        { value: "fire_under_earth", label: "Displace Fire Spark near Earth (Natural rise via Levitas)" }
      ],
      value: "none",
      onChange: function (val) {
        displacedElement = val;
        renderCosmos();
      }
    });

    renderCosmos();
  };

  /* -------------------------------------------------------------------------
     Figure 5: Mohist Camera Obscura Pinhole Optics Simulator
     ------------------------------------------------------------------------- */
  FIG['fig-mozi-pinhole'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var objectHeight = 80;
    var screenDist = 180;

    var readouts = FIG.readouts(container, [
      { id: "image-orientation", label: "Screen Image Orientation", value: "INVERTED (Upside Down)" },
      { id: "intersection-point", label: "Optical Principle in Mozi", value: "Light travels in straight lines; rays intersect at the pinhole aperture" },
      { id: "magnification-ratio", label: "Geometric Image Magnification", value: "0.90× object height (72 mm)" }
    ]);

    function renderPinhole() {
      dispWrap.innerHTML = '';

      var pinholeX = 340, pinholeY = 160;
      var objX = 140;
      var screenX = pinholeX + screenDist;

      var objDist = pinholeX - objX; // 200 px
      var imgHeight = objectHeight * (screenDist / objDist);

      readouts.update("image-orientation", "INVERTED: Top of object forms bottom of screen image");
      readouts.update("intersection-point", "Canon 4: 'The place of illumination... rays cross at the aperture like a compass point'");
      readouts.update("magnification-ratio", (screenDist / objDist).toFixed(2) + "× (" + Math.round(imgHeight) + " px high)");

      var w = 680, h = 320;
      var svg = FIG.createSVG(dispWrap, w, h, "Mohist camera obscura pinhole optical ray tracing");

      var strokeCol = FIG.getCSSVar('--ink', '#17181c');
      var rayCol1 = "#dc2626"; // Ray from top
      var rayCol2 = "#2563eb"; // Ray from bottom

      // Darkroom Barrier Wall (x = 340) with pinhole at y = 160
      var wallTop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wallTop.setAttribute('x1', pinholeX); wallTop.setAttribute('y1', "30");
      wallTop.setAttribute('x2', pinholeX); wallTop.setAttribute('y2', pinholeY - 6);
      wallTop.setAttribute('stroke', strokeCol); wallTop.setAttribute('stroke-width', "6");
      svg.appendChild(wallTop);

      var wallBot = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wallBot.setAttribute('x1', pinholeX); wallBot.setAttribute('y1', pinholeY + 6);
      wallBot.setAttribute('x2', pinholeX); wallBot.setAttribute('y2', "290");
      wallBot.setAttribute('stroke', strokeCol); wallBot.setAttribute('stroke-width', "6");
      svg.appendChild(wallBot);

      // Object (Illuminated Pagoda / Arrow) at x = 140
      var objTopY = pinholeY - objectHeight / 2;
      var objBotY = pinholeY + objectHeight / 2;

      var objLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      objLine.setAttribute('x1', objX); objLine.setAttribute('y1', objBotY);
      objLine.setAttribute('x2', objX); objLine.setAttribute('y2', objTopY);
      objLine.setAttribute('stroke', strokeCol); objLine.setAttribute('stroke-width', "3");
      svg.appendChild(objLine);

      var objArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      objArrow.setAttribute('points', (objX - 6) + "," + (objTopY + 12) + " " + (objX + 6) + "," + (objTopY + 12) + " " + objX + "," + objTopY);
      objArrow.setAttribute('fill', strokeCol);
      svg.appendChild(objArrow);

      // Screen at x = screenX
      var imgTopY = pinholeY + imgHeight / 2; // Inverted!
      var imgBotY = pinholeY - imgHeight / 2;

      var screenLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      screenLine.setAttribute('x1', screenX); screenLine.setAttribute('y1', "60");
      screenLine.setAttribute('x2', screenX); screenLine.setAttribute('y2', "260");
      screenLine.setAttribute('stroke', FIG.getCSSVar('--border-strong'));
      screenLine.setAttribute('stroke-width', "4");
      svg.appendChild(screenLine);

      // Inverted Image on screen
      var imgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      imgLine.setAttribute('x1', screenX); imgLine.setAttribute('y1', imgBotY);
      imgLine.setAttribute('x2', screenX); imgLine.setAttribute('y2', imgTopY);
      imgLine.setAttribute('stroke', "#dc2626"); imgLine.setAttribute('stroke-width', "3");
      svg.appendChild(imgLine);

      var imgArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      imgArrow.setAttribute('points', (screenX - 6) + "," + (imgTopY - 12) + " " + (screenX + 6) + "," + (imgTopY - 12) + " " + screenX + "," + imgTopY);
      imgArrow.setAttribute('fill', "#dc2626");
      svg.appendChild(imgArrow);

      // Ray 1: From Object TOP through pinhole to Image BOTTOM
      var rayT = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rayT.setAttribute('x1', objX); rayT.setAttribute('y1', objTopY);
      rayT.setAttribute('x2', screenX); rayT.setAttribute('y2', imgTopY);
      rayT.setAttribute('stroke', rayCol1); rayT.setAttribute('stroke-width', "1.8");
      rayT.setAttribute('stroke-dasharray', "4 2");
      svg.appendChild(rayT);

      // Ray 2: From Object BOTTOM through pinhole to Image TOP
      var rayB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rayB.setAttribute('x1', objX); rayB.setAttribute('y1', objBotY);
      rayB.setAttribute('x2', screenX); rayB.setAttribute('y2', imgBotY);
      rayB.setAttribute('stroke', rayCol2); rayB.setAttribute('stroke-width', "1.8");
      rayB.setAttribute('stroke-dasharray', "4 2");
      svg.appendChild(rayB);

      // Labels
      var lblO = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblO.setAttribute('x', objX); lblO.setAttribute('y', objTopY - 15);
      lblO.setAttribute('text-anchor', 'middle'); lblO.setAttribute('font-size', '11'); lblO.setAttribute('font-weight', '700');
      lblO.setAttribute('fill', strokeCol);
      lblO.textContent = "Illuminated Object";
      svg.appendChild(lblO);

      var lblP = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblP.setAttribute('x', pinholeX); lblP.setAttribute('y', "20");
      lblP.setAttribute('text-anchor', 'middle'); lblP.setAttribute('font-size', '11'); lblP.setAttribute('font-weight', '700');
      lblP.setAttribute('fill', strokeCol);
      lblP.textContent = "Pinhole Aperture (Mozi, c. 380 BCE)";
      svg.appendChild(lblP);

      var lblI = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lblI.setAttribute('x', screenX); lblI.setAttribute('y', "280");
      lblI.setAttribute('text-anchor', 'middle'); lblI.setAttribute('font-size', '11'); lblI.setAttribute('font-weight', '700');
      lblI.setAttribute('fill', "#dc2626");
      lblI.textContent = "Inverted Screen Image";
      svg.appendChild(lblI);
    }

    FIG.slider(controls, {
      id: "pinhole-obj-height",
      label: "Object Height (pixels):",
      min: 40,
      max: 120,
      step: 5,
      value: objectHeight,
      unit: "px",
      onChange: function (val) {
        objectHeight = val;
        renderPinhole();
      }
    });

    FIG.slider(controls, {
      id: "pinhole-screen-dist",
      label: "Distance from Pinhole to Viewing Screen (mm):",
      min: 100,
      max: 250,
      step: 10,
      value: screenDist,
      unit: "mm",
      onChange: function (val) {
        screenDist = val;
        renderPinhole();
      }
    });

    renderPinhole();
  };

  /* -------------------------------------------------------------------------
     Figure 6: Aristotle's Lunar Eclipse Horizon & Spherical Earth Proof
     ------------------------------------------------------------------------- */
  FIG['fig-lunar-curved-shadow'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var shadowProgress = 40; // Percent of Moon covered by Earth shadow

    var readouts = FIG.readouts(container, [
      { id: "shadow-curvature", label: "Shadow Boundary Geometry", value: "Strict Circular Arc" },
      { id: "aristotle-proof", label: "De Caelo Book II Proof", value: "Only a solid sphere casts an invariant circular shadow at all eclipse angles" },
      { id: "flat-earth-refutation", label: "Refutation of Flat Disc", value: "A flat cylinder/disc would cast an elliptical or flat-line shadow at oblique angles" }
    ]);

    function renderEclipse() {
      dispWrap.innerHTML = '';

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Aristotle's lunar eclipse circular shadow proof of spherical Earth");

      var moonCx = 340, moonCy = 150, moonR = 85;

      // Dark night sky box
      var sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      sky.setAttribute('x', "100"); sky.setAttribute('y', "30");
      sky.setAttribute('width', "480"); sky.setAttribute('height', "240");
      sky.setAttribute('fill', "#111216"); sky.setAttribute('rx', "12");
      svg.appendChild(sky);

      // Bright Full Moon Disc
      var moon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      moon.setAttribute('cx', moonCx); moon.setAttribute('cy', moonCy); moon.setAttribute('r', moonR);
      moon.setAttribute('fill', "#f5eed7");
      svg.appendChild(moon);

      // Earth Umbra Shadow (Earth diameter is ~3.7× larger than Moon in space)
      // Shadow radius ≈ 220 px
      var shadowR = 210;
      // Offset calculated from progress (0% = shadow outside, 100% = total eclipse)
      var shadowCx = moonCx - shadowR - moonR + (shadowProgress / 100) * (shadowR + moonR * 1.5);

      // Clip path to confine shadow to Moon disc
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      var clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.setAttribute('id', 'moon-clip');
      var clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      clipCircle.setAttribute('cx', moonCx); clipCircle.setAttribute('cy', moonCy); clipCircle.setAttribute('r', moonR);
      clip.appendChild(clipCircle);
      defs.appendChild(clip);
      svg.appendChild(defs);

      // Earth shadow disc
      var umbra = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      umbra.setAttribute('cx', shadowCx);
      umbra.setAttribute('cy', moonCy);
      umbra.setAttribute('r', shadowR);
      umbra.setAttribute('fill', "rgba(180, 83, 9, 0.85)"); // Reddish copper eclipse umbra
      umbra.setAttribute('clip-path', 'url(#moon-clip)');
      svg.appendChild(umbra);

      // Highlight curved boundary arc
      var arcGuide = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      arcGuide.setAttribute('cx', shadowCx); arcGuide.setAttribute('cy', moonCy); arcGuide.setAttribute('r', shadowR);
      arcGuide.setAttribute('fill', 'none'); arcGuide.setAttribute('stroke', "#dc2626"); arcGuide.setAttribute('stroke-width', "2.5");
      arcGuide.setAttribute('stroke-dasharray', "4 3");
      arcGuide.setAttribute('clip-path', 'url(#moon-clip)');
      svg.appendChild(arcGuide);

      // Labels
      var tTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tTitle.setAttribute('x', "340"); tTitle.setAttribute('y', "55");
      tTitle.setAttribute('text-anchor', 'middle'); tTitle.setAttribute('font-size', '12'); tTitle.setAttribute('font-weight', '700');
      tTitle.setAttribute('fill', "#ffffff");
      tTitle.textContent = "Aristotle's Empirical Observation (De Caelo, Book II, 297b)";
      svg.appendChild(tTitle);

      var tCurve = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tCurve.setAttribute('x', shadowCx + shadowR - 35); tCurve.setAttribute('y', moonCy);
      tCurve.setAttribute('text-anchor', 'middle'); tCurve.setAttribute('font-size', '11'); tCurve.setAttribute('font-weight', '700');
      tCurve.setAttribute('fill', "#ffffff");
      tCurve.textContent = "Curved Circular Umbra Margin";
      svg.appendChild(tCurve);
    }

    FIG.slider(controls, {
      id: "eclipse-progress",
      label: "Advance Lunar Eclipse (Progress across Moon disc):",
      min: 5,
      max: 95,
      step: 1,
      value: shadowProgress,
      unit: "%",
      onChange: function (val) {
        shadowProgress = val;
        renderEclipse();
      }
    });

    renderEclipse();
  };

  /* -------------------------------------------------------------------------
     Figure 7: The Nyāya 5-Step Epistemological Inference Engine
     ------------------------------------------------------------------------- */
  FIG['fig-nyaya-syllogism'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    container.innerHTML = '';
    var controls = document.createElement('div');
    controls.className = 'fig-controls';
    var dispWrap = document.createElement('div');
    container.appendChild(controls);
    container.appendChild(dispWrap);

    var currentScenario = 'valid'; // 'valid' or 'fallacious'

    var readouts = FIG.readouts(container, [
      { id: "syllogism-status", label: "Inference Status (Anumāna)", value: "VALID DEDUCTIVE INFERENCE (Vyāpti Confirmed)" },
      { id: "universal-relation", label: "Invariable Concomitance (Vyāpti)", value: "Smoke is strictly pervaded by fire: Wherever smoke exists, fire is present" },
      { id: "pramana-criterion", label: "Pramāṇa Epistemic Test", value: "Passes all 5 criteria of Akṣapāda Gautama's Nyāya Sūtra" }
    ]);

    function renderSyllogism() {
      dispWrap.innerHTML = '';

      var isValid = (currentScenario === 'valid');
      readouts.update("syllogism-status", isValid ? "VALID INFERENCE (Pramāṇa): Free from Hetvābhāsa (Fallacy)" : "FALLACIOUS INFERENCE (Hetvābhāsa): Unsound vyāpti link");
      readouts.update("universal-relation", isValid ? "Universal Invariable Concomitance: Smoke → Fire (As in a kitchen hearth)" : "Asiddha Fallacy: Claiming fire entails smoke ignores red-hot smokeless iron");
      readouts.update("pramana-criterion", isValid ? "5-Step Syllogism passes: Pratijñā, Hetu, Udāharaṇa, Upanaya, Nigamana" : "Fails Vyāpti test: The middle term (Hetu) is too narrow or unproven");

      var steps = isValid ? [
        { num: "1. Pratijñā (Proposition)", text: "The distant mountain possesses fire." },
        { num: "2. Hetu (Ground / Evidence)", text: "Because it possesses visible smoke." },
        { num: "3. Udāharaṇa (Universal Rule & Example)", text: "Wherever there is smoke, there is fire, as in a domestic kitchen hearth." },
        { num: "4. Upanaya (Application)", text: "This mountain possesses smoke, which is invariably accompanied by fire." },
        { num: "5. Nigamana (Conclusion)", text: "Therefore, this mountain possesses fire." }
      ] : [
        { num: "1. Pratijñā (Proposition)", text: "The glowing iron sphere possesses smoke." },
        { num: "2. Hetu (Ground / Evidence)", text: "Because it possesses fire." },
        { num: "3. Udāharaṇa (Universal Rule - FLAWED)", text: "Wherever there is fire, there is smoke (FALSE: red-hot iron has fire without smoke!)." },
        { num: "4. Upanaya (Application - FLAWED)", text: "This sphere possesses fire, claiming it must have smoke." },
        { num: "5. Nigamana (Conclusion - REJECTED)", text: "FALLACY: Fire does not entail smoke; inference rejected by Nyāya." }
      ];

      var w = 680, h = 300;
      var svg = FIG.createSVG(dispWrap, w, h, "Nyaya five-step epistemological inference engine");

      var boxW = 580, boxH = 42;
      var startX = 50, startY = 20;

      steps.forEach(function (st, idx) {
        var y = startY + idx * 54;

        var box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        box.setAttribute('x', startX); box.setAttribute('y', y);
        box.setAttribute('width', boxW); box.setAttribute('height', boxH);
        box.setAttribute('rx', "6");
        box.setAttribute('fill', isValid ? FIG.getCSSVar('--surface-raised') : (idx >= 2 ? "rgba(220, 38, 38, 0.12)" : FIG.getCSSVar('--surface-raised')));
        box.setAttribute('stroke', isValid ? FIG.getCSSVar('--border-strong') : (idx >= 2 ? "#dc2626" : FIG.getCSSVar('--border-strong')));
        box.setAttribute('stroke-width', "1.5");
        svg.appendChild(box);

        var tNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tNum.setAttribute('x', startX + 15); tNum.setAttribute('y', y + 17);
        tNum.setAttribute('font-size', '10.5'); tNum.setAttribute('font-weight', '700');
        tNum.setAttribute('fill', isValid ? FIG.getCSSVar('--accent') : (idx >= 2 ? "#dc2626" : FIG.getCSSVar('--accent')));
        tNum.textContent = st.num;
        svg.appendChild(tNum);

        var tText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tText.setAttribute('x', startX + 15); tText.setAttribute('y', y + 33);
        tText.setAttribute('font-size', '11.5'); tText.setAttribute('font-weight', '500');
        tText.setAttribute('fill', FIG.getCSSVar('--ink'));
        tText.textContent = st.text;
        svg.appendChild(tText);
      });
    }

    FIG.select(controls, {
      id: "nyaya-scenario-select",
      label: "Select Logical Case to Evaluate in the Nyāya Framework:",
      options: [
        { value: "valid", label: "Valid Anumāna: Smoke on Hill → Fire (True Invariable Concomitance)" },
        { value: "fallacious", label: "Fallacious Case: Fire on Iron → Smoke (Hetvābhāsa: Overextension Fallacy)" }
      ],
      value: "valid",
      onChange: function (val) {
        currentScenario = val;
        renderSyllogism();
      }
    });

    renderSyllogism();
  };

  /* -------------------------------------------------------------------------
     Figure 8: Test Yourself Quiz for Part 3
     ------------------------------------------------------------------------- */
  FIG['fig-quiz-part3'] = function (figEl) {
    var container = figEl.querySelector('.fig-container');
    if (!container) return;

    var questions = [
      {
        question: "What distinguished Thales of Miletus and the early Ionian Presocratics from preceding mythic poets (such as Hesiod and Homer)?",
        options: [
          "They invented the telescope and discovered the rings of Saturn.",
          "They sought to explain physical phenomena (earthquakes, weather, eclipses) using primary natural material principles (arche) without invoking divine wills.",
          "They proved mathematically that the Earth orbits the Sun.",
          "They completely rejected geometry in favor of mystical poetry."
        ],
        answer: 1,
        explanation: "The Ionian revolution consisted of seeking natural, material causes (water, air, boundless matter) rather than treating events as the arbitrary whims of Zeus, Poseidon, or Apollo."
      },
      {
        question: "According to Eratosthenes' geometric calculation (c. 240 BCE), why was the Sun directly vertical at Syene on the summer solstice while casting a 7.2° shadow at Alexandria?",
        options: [
          "Because the Sun is only a few miles above the flat Earth.",
          "Because the Earth is a curved sphere, so parallel incoming solar rays strike different latitudes at different angles relative to the local vertical.",
          "Because Alexandria had taller gnomons that bent sunlight.",
          "Because of atmospheric refraction bending light over the Mediterranean."
        ],
        answer: 1,
        explanation: "Because the Earth's surface is curved, parallel rays from the distant Sun illuminate Syene's vertical well directly while striking Alexandria's plumb line at a 7.2° angle (1/50 of a circle)."
      },
      {
        question: "How did Archimedes actually solve the problem of King Hiero's golden crown according to his treatise 'On Floating Bodies'?",
        options: [
          "By running through Syracuse shouting 'Eureka' after splashing in a bath.",
          "By melting down the crown to separate the gold from silver chemically.",
          "By using a sensitive hydrostatic balance to compare the buoyant force (apparent mass loss) of the crown in water against an equal mass of pure gold.",
          "By measuring the crown's electrical conductivity with copper wires."
        ],
        answer: 2,
        explanation: "Direct water bucket overflow is unworkable due to meniscus and surface tension errors. Archimedes used an hydrostatic balance: silver has lower density than gold, displacing more water and generating greater buoyant upthrust."
      },
      {
        question: "In the atomic theory of Democritus and Leucippus (c. 420 BCE), what physically exists in the universe?",
        options: [
          "Only continuous fluid ether animated by divine spirit.",
          "Indivisible, uncuttable particles (atoma) of various geometric shapes moving through an infinite void (vacuum).",
          "Four eternal elements held together by Love and Strife.",
          "Only consciousness, while matter is a sensory illusion."
        ],
        answer: 1,
        explanation: "Democritus famously declared: 'By convention sweet, by convention bitter, by convention color, but in reality atoms and void.'"
      },
      {
        question: "How did the ancient Indian atomic doctrine of the Vaiśeṣika school (founded by sage Kaṇāda) conceive of atoms (paramāṇu)?",
        options: [
          "As identical billiard balls without elemental differentiation.",
          "As eternal, indestructible particles of four physical substances (Earth, Water, Fire, Air) combining into dyads (dvyaṇuka) and triads through invisible forces (adṛṣṭa).",
          "As pure mathematical points lacking physical reality.",
          "As fleeting packets of light that disappear every microsecond."
        ],
        answer: 1,
        explanation: "The Vaiśeṣika Sūtra derived an atomic model where eternal paramāṇu of the four physical elements aggregate into compound dyads and triads to construct the macroscopic world."
      },
      {
        question: "What optical discovery was recorded in the Mohist Canon (Mozi) in Warring States China (c. 4th century BCE)?",
        options: [
          "The invention of the compound glass microscope.",
          "The camera obscura: proving that light travels in straight lines and that rays intersecting through a pinhole form an inverted image on a screen.",
          "The discovery of the wave nature of light using diffraction slits.",
          "The measurement of the finite speed of light using rotating mirrors."
        ],
        answer: 1,
        explanation: "The Mohist Canon contains the earliest known scientific description of the pinhole camera obscura, explaining image inversion through the rectilinear crossing of light rays."
      },
      {
        question: "What empirical evidence did Aristotle cite in 'De Caelo' to prove that the Earth is a sphere, not a flat disc?",
        options: [
          "Photographs taken from high mountain peaks.",
          "The shadow of the Earth cast upon the Moon during all lunar eclipses is invariably curved and circular, and traveling south reveals new southern constellations.",
          "The myth of Atlas holding the celestial globe.",
          "Ships falling off the western horizon into the void."
        ],
        answer: 1,
        explanation: "Aristotle provided two decisive empirical proofs: only a physical sphere always casts a circular shadow at all eclipse orientations, and moving southward causes southern stars to rise higher above the horizon."
      },
      {
        question: "In Aristotle's physics, what is the difference between 'natural motion' and 'violent (forced) motion'?",
        options: [
          "Natural motion occurs in water; violent motion occurs in air.",
          "Natural motion is the intrinsic tendency of an element to seek its natural resting place (Earth falls to center, Fire rises); violent motion is imposed by continuous contact with an external force.",
          "Natural motion is circular; violent motion is straight.",
          "Natural motion requires gravity; violent motion requires electromagnetism."
        ],
        answer: 1,
        explanation: "Aristotle argued that heavy elements (gravitas) naturally seek the cosmic center, while light elements (levitas) naturally rise; any other motion requires continuous external mechanical pushing."
      },
      {
        question: "In the classical Indian Nyāya epistemology, what is 'vyāpti'?",
        options: [
          "The spiritual liberation of the soul from reincarnation.",
          "The invariant, universal concomitance between the evidence (hetu) and the inferred property (sādhya), such as 'wherever there is smoke, there is fire'.",
          "A ceremonial sacrifice performed before public debates.",
          "The classification of plants into medicinal families."
        ],
        answer: 1,
        explanation: "Vyāpti is the foundational relation of universal concomitance that validates an inference: without a verified vyāpti connection, deduction degenerates into fallacy (hetvābhāsa)."
      },
      {
        question: "Why did modern 17th-century science eventually reject Aristotle's 'Final Cause' (teleology) while retaining Efficient and Material causes?",
        options: [
          "Because Aristotle never wrote about final causes.",
          "Because inanimate objects (falling stones, orbiting planets) do not possess internal desires, intentions, or future goals; physical laws act through blind mechanical forces.",
          "Because teleology was declared illegal by royal decree.",
          "Because final causes can only be measured with mercurial thermometers."
        ],
        answer: 1,
        explanation: "Mechanistic physics demonstrated that matter moves because of immediate physical forces (efficient causes) acting on physical masses, not because rocks 'desire' to reach the ground."
      }
    ];

    FIG.quiz(container, questions);
  };

})();
