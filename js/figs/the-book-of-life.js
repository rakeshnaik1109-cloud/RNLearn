/**
 * Figures for Part 8: The Book of Life
 * RNLearn - Long-form Learning & Essays
 */

(function () {
  'use strict';

  var FIG = window.FIG || {};
  window.FIG = FIG;

  /* -------------------------------------------------------------------------
   * Figure 1: Geological Strata & Fossil Succession (Deep Time)
   * ------------------------------------------------------------------------- */
  FIG['fig-deep-time-strata'] = function (container) {
    var strata = [
      { name: 'Cenozoic (Quaternary/Tertiary)', age: '0–66 Ma', color: '#fef08a', fossil: 'Mammoth & Hominin Bones', depth: 40 },
      { name: 'Mesozoic (Cretaceous)', age: '66–145 Ma', color: '#fed7aa', fossil: 'Tyrannosaur & Ammonite shells', depth: 100 },
      { name: 'Mesozoic (Jurassic/Triassic)', age: '145–252 Ma', color: '#fdba74', fossil: 'Brachiosaur & Belemnites', depth: 160 },
      { name: 'Paleozoic (Carboniferous/Devonian)', age: '252–419 Ma', color: '#bbf7d0', fossil: 'Giant Clubmoss Trees & Armored Fish', depth: 220 },
      { name: 'Paleozoic (Cambrian/Ordovician)', age: '419–541 Ma', color: '#86efac', fossil: 'Trilobites (Olenellus) & Anomalocaris', depth: 280 }
    ];

    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-strata-layer">Select Geological Stratum: ' +
            '<span id="fig-strata-layer-val" class="fig-readout">Cenozoic (Surface Layer)</span>' +
          '</label>' +
          '<input type="range" id="fig-strata-layer" min="0" max="4" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-strata-btn-top" class="fig-btn">Top: Cenozoic (Recent)</button>' +
          '<button type="button" id="fig-strata-btn-mid" class="fig-btn">Mid: Cretaceous (Dinosaurs)</button>' +
          '<button type="button" id="fig-strata-btn-deep" class="fig-btn">Base: Cambrian (Trilobites)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-strata-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-strata-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-strata-layer');
    var valReadout = container.querySelector('#fig-strata-layer-val');
    var btnTop = container.querySelector('#fig-strata-btn-top');
    var btnMid = container.querySelector('#fig-strata-btn-mid');
    var btnDeep = container.querySelector('#fig-strata-btn-deep');
    var svg = container.querySelector('#fig-strata-svg');
    var explain = container.querySelector('#fig-strata-explain');

    function draw() {
      var idx = parseInt(slider.value, 10);
      var current = strata[idx];
      valReadout.textContent = current.name + ' (' + current.age + ')';

      var svgContent =
        '<!-- Background Ground Surface -->' +
        '<rect x="0" y="0" width="340" height="340" fill="#f8fafc"/>';

      // Draw 5 strata layers
      for (var i = 0; i < strata.length; i++) {
        var s = strata[i];
        var isSelected = (i === idx);
        var yPos = 30 + i * 58;

        svgContent +=
          '<g transform="translate(30, ' + yPos + ')">' +
            '<rect x="0" y="0" width="280" height="54" rx="4" fill="' + s.color + '" ' +
                  'stroke="' + (isSelected ? '#1e293b' : '#cbd5e1') + '" stroke-width="' + (isSelected ? '3' : '1.5') + '"/>' +
            '<text x="12" y="22" font-size="11" font-weight="bold" fill="#0f172a">' + s.name + '</text>' +
            '<text x="12" y="40" font-size="10" fill="#475569">Fossil: ' + s.fossil + ' (' + s.age + ')</text>' +
            (isSelected ? '<circle cx="260" cy="27" r="6" fill="#ef4444"/>' : '') +
          '</g>';
      }

      // Depth indicator line
      svgContent +=
        '<line x1="18" y1="30" x2="18" y2="320" stroke="#64748b" stroke-width="2"/>' +
        '<text x="12" y="24" font-size="10" font-weight="bold" fill="#64748b">Newer</text>' +
        '<text x="12" y="335" font-size="10" font-weight="bold" fill="#64748b">Older</text>';

      // Right Info Card
      svgContent +=
        '<g transform="translate(340, 30)">' +
          '<rect x="0" y="0" width="185" height="290" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Faunal Succession</text>' +
          '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">' + current.name.split(' ')[0] + '</text>' +
          '<text x="12" y="70" font-size="11" fill="currentColor">Age: <strong>' + current.age + '</strong></text>' +
          '<line x1="12" y1="84" x2="173" y2="84" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="104" font-size="11" font-weight="bold" fill="#ef4444">Key Index Fossil:</text>' +
          '<text x="12" y="122" font-size="10" fill="currentColor">' + current.fossil + '</text>' +
          '<line x1="12" y1="140" x2="173" y2="140" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="160" font-size="11" font-weight="bold" fill="#10b981">Geological Principle:</text>' +
          '<text x="12" y="178" font-size="10" fill="currentColor">William Smith (1799) &amp;</text>' +
          '<text x="12" y="192" font-size="10" fill="currentColor">Georges Cuvier proved that</text>' +
          '<text x="12" y="206" font-size="10" fill="currentColor">strata succeed each other</text>' +
          '<text x="12" y="220" font-size="10" font-weight="bold" fill="#10b981">in an unalterable order.</text>' +
          '<line x1="12" y1="234" x2="173" y2="234" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="252" font-size="10" fill="var(--color-text-muted, #666)">Never is a mammal found</text>' +
          '<text x="12" y="266" font-size="10" fill="var(--color-text-muted, #666)">in the Cambrian stratum!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Law of Fossil Succession:</strong> By examining the sedimentary layers of the Earth, early geologists (William Smith, Georges Cuvier, and Charles Lyell) discovered that fossils appear in an invariant vertical sequence. Primitive marine trilobites never mingle with Jurassic reptiles, and dinosaurs never co-occur with fossil humans. This established the reality of extinction and Charles Lyell’s concept of <em>deep time</em>—the millions of years required for biological evolution.';
    }

    slider.addEventListener('input', draw);
    btnTop.addEventListener('click', function () { slider.value = 0; draw(); });
    btnMid.addEventListener('click', function () { slider.value = 1; draw(); });
    btnDeep.addEventListener('click', function () { slider.value = 4; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 2: Adaptive Radiation of Galápagos Finches
   * ------------------------------------------------------------------------- */
  FIG['fig-darwin-finches'] = function (container) {
    var niches = [
      {
        id: 'seed',
        name: 'Large Ground Finch (Geospiza magnirostris)',
        food: 'Hard, Large Woody Seeds',
        beak: 'Deep, heavy, crushing bill',
        beakPath: 'M 160 170 L 195 180 L 160 210 Z',
        beakColor: '#b45309'
      },
      {
        id: 'cactus',
        name: 'Cactus Finch (Geospiza scandens)',
        food: 'Cactus Flowers & Pulp (Opuntia)',
        beak: 'Long, sharp, probing bill',
        beakPath: 'M 160 175 L 210 182 L 160 195 Z',
        beakColor: '#d97706'
      },
      {
        id: 'insect',
        name: 'Warbler Finch (Certhidea olivacea)',
        food: 'Small Insects in Tree Bark',
        beak: 'Slender, pointed, forceps-like bill',
        beakPath: 'M 160 178 L 195 182 L 160 188 Z',
        beakColor: '#10b981'
      }
    ];

    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Feeding Niche: ' +
            '<span id="fig-finch-niche-val" class="fig-readout">Large Ground Finch (Hard Seeds)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-finch-seed" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. Hard Seeds (Crushing Beak)</button>' +
          '<button type="button" id="fig-btn-finch-cactus" class="fig-btn">2. Cactus (Probing Beak)</button>' +
          '<button type="button" id="fig-btn-finch-insect" class="fig-btn">3. Insects (Forceps Beak)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-finch-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-finch-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnSeed = container.querySelector('#fig-btn-finch-seed');
    var btnCactus = container.querySelector('#fig-btn-finch-cactus');
    var btnInsect = container.querySelector('#fig-btn-finch-insect');
    var nicheVal = container.querySelector('#fig-finch-niche-val');
    var svg = container.querySelector('#fig-finch-svg');
    var explain = container.querySelector('#fig-finch-explain');

    var currentNiche = niches[0];

    function setBtnActive(activeBtn) {
      btnSeed.style.background = ''; btnSeed.style.color = ''; btnSeed.style.borderColor = '';
      btnCactus.style.background = ''; btnCactus.style.color = ''; btnCactus.style.borderColor = '';
      btnInsect.style.background = ''; btnInsect.style.color = ''; btnInsect.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      nicheVal.textContent = currentNiche.name;

      var svgContent =
        '<!-- Stylized Bird Head Body -->' +
        '<g transform="translate(40, 20)">' +
          '<!-- Bird Head Outline -->' +
          '<circle cx="110" cy="180" r="55" fill="#e2e8f0" stroke="#64748b" stroke-width="2.5"/>' +
          '<!-- Eye -->' +
          '<circle cx="125" cy="165" r="7" fill="#0f172a"/>' +
          '<circle cx="123" cy="163" r="2" fill="#fff"/>' +
          '<!-- Neck / Body curve -->' +
          '<path d="M 65 205 Q 40 250 50 300 L 160 300 Q 155 240 145 220" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>' +
          '<!-- Dynamic Specialized Beak -->' +
          '<path d="' + currentNiche.beakPath + '" fill="' + currentNiche.beakColor + '" stroke="#78350f" stroke-width="2"/>' +
          '<text x="110" y="70" font-size="13" font-weight="bold" fill="currentColor" text-anchor="middle">Galápagos Finch Morphology</text>' +
        '</g>' +

        '<!-- Right Information Panel -->' +
        '<g transform="translate(340, 35)">' +
          '<rect x="0" y="0" width="185" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="#3b82f6">Adaptive Radiation</text>' +
          '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="currentColor">Species:</text>' +
          '<text x="12" y="68" font-size="10" font-style="italic" fill="currentColor">' + currentNiche.name + '</text>' +
          '<line x1="12" y1="82" x2="173" y2="82" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="102" font-size="11" font-weight="bold" fill="#ef4444">Food Niche:</text>' +
          '<text x="12" y="118" font-size="10" fill="currentColor">' + currentNiche.food + '</text>' +
          '<line x1="12" y1="132" x2="173" y2="132" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="152" font-size="11" font-weight="bold" fill="#10b981">Beak Adaptation:</text>' +
          '<text x="12" y="168" font-size="10" fill="currentColor">' + currentNiche.beak + '</text>' +
          '<line x1="12" y1="184" x2="173" y2="184" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="204" font-size="10" fill="var(--color-text-muted, #666)">Darwin in 1845 noted:</text>' +
          '<text x="12" y="218" font-size="10" font-style="italic" fill="var(--color-text-muted, #666)">"Seeing this gradation and</text>' +
          '<text x="12" y="232" font-size="10" font-style="italic" fill="var(--color-text-muted, #666)">diversity of structure in one</text>' +
          '<text x="12" y="246" font-size="10" font-style="italic" fill="var(--color-text-muted, #666)">small group, one might fancy</text>' +
          '<text x="12" y="260" font-size="10" font-style="italic" fill="#10b981">one species had been modified."</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Adaptive Radiation on the Galápagos Islands:</strong> A single ancestral seed-eating finch species arrived from the South American mainland. In the absence of mainland bird competitors, populations on different isolated islands adapted to distinct ecological food sources. Natural selection favored heavy, crushing jaws for tough seeds, long pointed bills for cactus flowers, and slender forceps bills for insects—demonstrating <em>descent with modification</em>.';
    }

    btnSeed.addEventListener('click', function () { currentNiche = niches[0]; setBtnActive(btnSeed); draw(); });
    btnCactus.addEventListener('click', function () { currentNiche = niches[1]; setBtnActive(btnCactus); draw(); });
    btnInsect.addEventListener('click', function () { currentNiche = niches[2]; setBtnActive(btnInsect); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 3: Natural Selection (Differential Survival & Allele Shift)
   * ------------------------------------------------------------------------- */
  FIG['fig-natural-selection'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-sel-env">Environment Type: ' +
            '<span id="fig-sel-env-val" class="fig-readout">Pristine Lichen Forest (Light Tree Trunks)</span>' +
          '</label>' +
          '<input type="range" id="fig-sel-env" min="0" max="100" step="10" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-sel-pristine" class="fig-btn">Pristine Forest (Light Background)</button>' +
          '<button type="button" id="fig-btn-sel-industrial" class="fig-btn">Industrial Soot (Dark Background)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-sel-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-sel-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-sel-env');
    var envVal = container.querySelector('#fig-sel-env-val');
    var btnPristine = container.querySelector('#fig-btn-sel-pristine');
    var btnIndustrial = container.querySelector('#fig-btn-sel-industrial');
    var svg = container.querySelector('#fig-sel-svg');
    var explain = container.querySelector('#fig-sel-explain');

    function draw() {
      var sootPct = parseInt(slider.value, 10);
      var darkMothFreq = 10 + (sootPct / 100) * 80; // 10% to 90%
      var lightMothFreq = 100 - darkMothFreq;

      envVal.textContent = sootPct < 40 ? 'Pristine Lichen Forest (Light Trees)' : sootPct > 70 ? 'Industrial Soot Pollution (Dark Bark)' : 'Intermediate Transition Zone';

      // Background trunk color from light birch (#e2e8f0) to dark soot (#18181b)
      var rCol = Math.round(226 - (sootPct / 100) * (226 - 24));
      var gCol = Math.round(232 - (sootPct / 100) * (232 - 24));
      var bCol = Math.round(240 - (sootPct / 100) * (240 - 27));
      var trunkBg = 'rgb(' + rCol + ',' + gCol + ',' + bCol + ')';

      var svgContent =
        '<!-- Forest Tree Trunk Background -->' +
        '<rect x="30" y="30" width="300" height="300" rx="6" fill="' + trunkBg + '" stroke="#64748b" stroke-width="2"/>' +
        '<text x="180" y="24" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">Tree Trunk Habitat (Biston betularia)</text>';

      // Draw light and dark moths scattered
      // Total 20 moths
      var darkCount = Math.round((darkMothFreq / 100) * 20);
      var lightCount = 20 - darkCount;

      var positions = [
        [60,60], [120,70], [200,60], [260,80],
        [80,120], [160,110], [240,130], [290,120],
        [50,180], [130,170], [210,180], [270,190],
        [90,230], [170,240], [250,230], [290,250],
        [60,290], [130,290], [200,300], [270,300]
      ];

      for (var m = 0; m < 20; m++) {
        var pos = positions[m];
        var isDark = (m < darkCount);
        var mothCol = isDark ? '#18181b' : '#f8fafc';
        var mothBorder = isDark ? '#3f3f46' : '#cbd5e1';

        svgContent +=
          '<g transform="translate(' + pos[0] + ', ' + pos[1] + ')">' +
            '<!-- Wings -->' +
            '<polygon points="0,0 -12,-8 -8,6" fill="' + mothCol + '" stroke="' + mothBorder + '"/>' +
            '<polygon points="0,0 12,-8 8,6" fill="' + mothCol + '" stroke="' + mothBorder + '"/>' +
            '<line x1="0" y1="-8" x2="0" y2="8" stroke="' + (isDark ? '#52525b' : '#94a3b8') + '" stroke-width="1.5"/>' +
          '</g>';
      }

      // Card on right
      svgContent +=
        '<g transform="translate(350, 30)">' +
          '<rect x="0" y="0" width="175" height="290" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Natural Selection</text>' +
          '<line x1="12" y1="34" x2="163" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">Population Frequencies:</text>' +
          '<text x="12" y="74" font-size="11" fill="currentColor">Light Form: <strong>' + Math.round(lightMothFreq) + '%</strong></text>' +
          '<text x="12" y="94" font-size="11" fill="currentColor">Dark Form: <strong>' + Math.round(darkMothFreq) + '%</strong></text>' +
          '<line x1="12" y1="110" x2="163" y2="110" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="130" font-size="11" font-weight="bold" fill="#ef4444">Selective Mechanism:</text>' +
          '<text x="12" y="148" font-size="10" fill="currentColor">Predatory birds visually</text>' +
          '<text x="12" y="162" font-size="10" fill="currentColor">hunt contrast moths.</text>' +
          '<line x1="12" y1="178" x2="163" y2="178" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="198" font-size="10" fill="var(--color-text-muted, #666)">On dark sooty trees,</text>' +
          '<text x="12" y="212" font-size="10" fill="var(--color-text-muted, #666)">light moths are eaten;</text>' +
          '<text x="12" y="226" font-size="10" fill="var(--color-text-muted, #666)">dark moths survive,</text>' +
          '<text x="12" y="240" font-size="10" font-weight="bold" fill="#10b981">shifting allele ratios</text>' +
          '<text x="12" y="254" font-size="10" font-weight="bold" fill="#10b981">over generations!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>Differential Survival &amp; Adaptation:</strong> Natural selection requires only three conditions: phenotypic variation, differential survival/reproduction based on those traits, and heritability. In the peppered moth (*Biston betularia*), industrial air pollution darkened tree trunks in nineteenth-century England, reversing the survival advantage and shifting the population from 90% light to 90% melanic (dark) form within decades.';
    }

    slider.addEventListener('input', draw);
    btnPristine.addEventListener('click', function () { slider.value = 0; draw(); });
    btnIndustrial.addEventListener('click', function () { slider.value = 100; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 4: Pasteur’s Swan-Neck Flask Experiment
   * ------------------------------------------------------------------------- */
  FIG['fig-pasteur-flask'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Flask Treatment: ' +
            '<span id="fig-pasteur-state-val" class="fig-readout">Intact Swan-Neck (Air enters; dust trapped in curve)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-flask-intact" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">1. Intact Swan-Neck (Sterile for Years)</button>' +
          '<button type="button" id="fig-btn-flask-broken" class="fig-btn">2. Broken Neck (Direct Airborne Contamination)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-pasteur-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-pasteur-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnIntact = container.querySelector('#fig-btn-flask-intact');
    var btnBroken = container.querySelector('#fig-btn-flask-broken');
    var stateVal = container.querySelector('#fig-pasteur-state-val');
    var svg = container.querySelector('#fig-pasteur-svg');
    var explain = container.querySelector('#fig-pasteur-explain');

    var isBroken = false;

    function setBtnActive(activeBtn) {
      btnIntact.style.background = ''; btnIntact.style.color = ''; btnIntact.style.borderColor = '';
      btnBroken.style.background = ''; btnBroken.style.color = ''; btnBroken.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (!isBroken) {
        stateVal.textContent = "Intact Swan-Neck: Air freely circulates; dust settles in curve; broth remains clear";
      } else {
        stateVal.textContent = "Neck Snapped Off: Airborne bacterial spores enter directly; broth turns cloudy (turbid)";
      }

      var brothFill = isBroken ? 'rgba(163, 230, 53, 0.6)' : 'rgba(254, 240, 138, 0.4)';
      var brothLabel = isBroken ? 'Cloudy / Teeming with Microbes' : 'Sterile Clear Broth';

      var svgContent =
        '<!-- Flask Round Base Body -->' +
        '<path d="M 100 280 C 70 280 60 210 110 170 L 110 130 L 130 130 L 130 170 C 180 210 170 280 140 280 Z" ' +
              'fill="rgba(255,255,255,0.4)" stroke="#64748b" stroke-width="2.5"/>' +

        '<!-- Broth Liquid Inside Base -->' +
        '<path d="M 78 260 C 75 220 165 220 162 260 C 160 278 80 278 78 260 Z" fill="' + brothFill + '"/>' +
        '<text x="120" y="255" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">' + brothLabel + '</text>';

      if (!isBroken) {
        // Long S-shaped swan neck
        svgContent +=
          '<!-- Swan Neck Glass Tube S-curve -->' +
          '<path d="M 120 130 Q 120 70 170 70 Q 220 70 220 130 Q 220 170 260 170 Q 290 170 290 120" ' +
                'fill="none" stroke="#64748b" stroke-width="4"/>' +
          '<path d="M 120 130 Q 120 70 170 70 Q 220 70 220 130 Q 220 170 260 170 Q 290 170 290 120" ' +
                'fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>' +

          '<!-- Dust Specks Trapped in Bottom Bend of S-curve -->' +
          '<circle cx="218" cy="165" r="2" fill="#78350f"/><circle cx="223" cy="167" r="2.5" fill="#78350f"/><circle cx="227" cy="164" r="2" fill="#78350f"/>' +
          '<text x="240" y="195" font-size="10" font-weight="bold" fill="#78350f">Airborne Dust Trapped Here</text>' +

          '<!-- Clean Air Exchange Arrow -->' +
          '<path d="M 295 105 Q 290 145 260 155 Q 235 155 225 125" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-dasharray="3 3"/>' +
          '<text x="295" y="90" font-size="10" font-weight="bold" fill="#3b82f6">Air Enters Freely</text>';
      } else {
        // Broken neck
        svgContent +=
          '<!-- Broken Neck Spout -->' +
          '<path d="M 110 130 L 105 105 L 135 105 L 130 130" fill="none" stroke="#64748b" stroke-width="2.5"/>' +
          '<!-- Jagged break marker -->' +
          '<line x1="102" y1="105" x2="138" y2="105" stroke="#ef4444" stroke-width="2"/>' +
          '<text x="145" y="105" font-size="11" font-weight="bold" fill="#ef4444">Neck Snapped Off</text>' +

          '<!-- Falling Spores directly into broth -->' +
          '<circle cx="120" cy="120" r="2.5" fill="#ef4444"/><circle cx="115" cy="140" r="3" fill="#ef4444"/><circle cx="125" cy="160" r="2.5" fill="#ef4444"/>' +
          '<text x="120" y="80" font-size="10" fill="#ef4444" font-weight="bold" text-anchor="middle">Airborne Spores Fall In</text>';
      }

      // Card on right
      svgContent +=
        '<g transform="translate(340, 35)">' +
          '<rect x="0" y="0" width="185" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Louis Pasteur (1861)</text>' +
          '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">Spontaneous Generation Defeated:</text>' +
          '<text x="12" y="70" font-size="10" fill="currentColor">Opponents claimed life</text>' +
          '<text x="12" y="84" font-size="10" fill="currentColor">needed a "vital force"</text>' +
          '<text x="12" y="98" font-size="10" fill="currentColor">in fresh air.</text>' +
          '<line x1="12" y1="112" x2="173" y2="112" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="132" font-size="11" font-weight="bold" fill="#10b981">Pasteur\'s Elegance:</text>' +
          '<text x="12" y="150" font-size="10" fill="currentColor">Fresh air has free entry,</text>' +
          '<text x="12" y="164" font-size="10" fill="currentColor">yet NO microbes grow</text>' +
          '<text x="12" y="178" font-size="10" font-weight="bold" fill="#10b981">because dust is trapped!</text>' +
          '<line x1="12" y1="192" x2="173" y2="192" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="212" font-size="11" font-weight="bold" fill="#ef4444">Biogenesis Law:</text>' +
          '<text x="12" y="230" font-size="11" font-style="italic" fill="#ef4444">Omne vivum ex vivo</text>' +
          '<text x="12" y="248" font-size="10" fill="var(--color-text-muted, #666)">Life only comes from</text>' +
          '<text x="12" y="262" font-size="10" fill="var(--color-text-muted, #666)">pre-existing life.</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Overthrow of Spontaneous Generation (1861):</strong> For millennia, people believed that rotting broth spontaneously created bacteria. Louis Pasteur boiled nutrient broth in swan-neck flasks. The curved neck allowed air to circulate freely while gravity trapped dust and bacterial spores in the curve. The broth remained sterile indefinitely—until the neck was snapped off, proving that microbial life arrives from airborne contamination.';
    }

    btnIntact.addEventListener('click', function () { isBroken = false; setBtnActive(btnIntact); draw(); });
    btnBroken.addEventListener('click', function () { isBroken = true; setBtnActive(btnBroken); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 5: Mendelian Genetics & Punnett Square
   * ------------------------------------------------------------------------- */
  FIG['fig-mendel-peas'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Genetic Cross: ' +
            '<span id="fig-mendel-cross-val" class="fig-readout">F₂ Monohybrid Cross (Yy × Yy)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-mendel-f1" class="fig-btn">P Generation (YY × yy → All Yy)</button>' +
          '<button type="button" id="fig-btn-mendel-f2" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">F₂ Generation (Yy × Yy → 3:1)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-mendel-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-mendel-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnF1 = container.querySelector('#fig-btn-mendel-f1');
    var btnF2 = container.querySelector('#fig-btn-mendel-f2');
    var crossVal = container.querySelector('#fig-mendel-cross-val');
    var svg = container.querySelector('#fig-mendel-svg');
    var explain = container.querySelector('#fig-mendel-explain');

    var isF2 = true;

    function setBtnActive(activeBtn) {
      btnF1.style.background = ''; btnF1.style.color = ''; btnF1.style.borderColor = '';
      btnF2.style.background = ''; btnF2.style.color = ''; btnF2.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (isF2) {
        crossVal.textContent = "F₂ Generation Cross: Heterozygous Parents (Yy × Yy)";

        var svgContent =
          '<!-- Punnett 2x2 Grid -->' +
          '<g transform="translate(80, 80)">' +
            '<!-- Column headers (Pollen Gametes) -->' +
            '<text x="50" y="-15" font-size="16" font-weight="bold" fill="#f59e0b" text-anchor="middle">Y (Yellow)</text>' +
            '<text x="130" y="-15" font-size="16" font-weight="bold" fill="#10b981" text-anchor="middle">y (Green)</text>' +

            '<!-- Row headers (Ovule Gametes) -->' +
            '<text x="-25" y="45" font-size="16" font-weight="bold" fill="#f59e0b" text-anchor="middle">Y</text>' +
            '<text x="-25" y="125" font-size="16" font-weight="bold" fill="#10b981" text-anchor="middle">y</text>' +

            '<!-- Cell 1: YY (Yellow) -->' +
            '<rect x="10" y="0" width="80" height="80" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="2"/>' +
            '<circle cx="50" cy="35" r="16" fill="#f59e0b"/>' +
            '<text x="50" y="68" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">YY (Yellow)</text>' +

            '<!-- Cell 2: Yy (Yellow) -->' +
            '<rect x="90" y="0" width="80" height="80" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="2"/>' +
            '<circle cx="130" cy="35" r="16" fill="#f59e0b"/>' +
            '<text x="130" y="68" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Yy (Yellow)</text>' +

            '<!-- Cell 3: Yy (Yellow) -->' +
            '<rect x="10" y="80" width="80" height="80" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" stroke-width="2"/>' +
            '<circle cx="50" cy="115" r="16" fill="#f59e0b"/>' +
            '<text x="50" y="148" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Yy (Yellow)</text>' +

            '<!-- Cell 4: yy (Green) -->' +
            '<rect x="90" y="80" width="80" height="80" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2"/>' +
            '<circle cx="130" cy="115" r="16" fill="#10b981"/>' +
            '<text x="130" y="148" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">yy (Green)</text>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(340, 35)">' +
            '<rect x="0" y="0" width="185" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Mendel\'s Laws (1865)</text>' +
            '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">Particulate Heredity:</text>' +
            '<text x="12" y="70" font-size="10" fill="currentColor">Traits do NOT blend like</text>' +
            '<text x="12" y="84" font-size="10" fill="currentColor">liquids; they act as</text>' +
            '<text x="12" y="98" font-size="10" font-weight="bold" fill="#3b82f6">discrete particulate units.</text>' +
            '<line x1="12" y1="112" x2="173" y2="112" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="132" font-size="11" font-weight="bold" fill="#f59e0b">Genotype Ratio:</text>' +
            '<text x="12" y="150" font-size="11" fill="currentColor">1 YY : 2 Yy : 1 yy</text>' +
            '<line x1="12" y1="166" x2="173" y2="166" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="186" font-size="12" font-weight="bold" fill="#ef4444">Phenotype Ratio:</text>' +
            '<text x="12" y="210" font-size="18" font-weight="800" fill="#ef4444">3 Yellow : 1 Green</text>' +
            '<line x1="12" y1="228" x2="173" y2="228" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="248" font-size="10" fill="var(--color-text-muted, #666)">The recessive green trait</text>' +
            '<text x="12" y="262" font-size="10" fill="var(--color-text-muted, #666)">reappears uncorrupted!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>Gregor Mendel’s 3:1 Ratio (1865):</strong> In the monastery garden at Brünn (Brno), Gregor Mendel cross-bred pea plants. When pure yellow and pure green peas were crossed, the first generation ($F_1$) was 100% yellow (Yellow is dominant). But when $F_1$ was self-pollinated, the hidden recessive green trait reappeared in exactly 25% of the offspring—a clean <strong>3:1 ratio</strong>. Heredity was governed by discrete, particulate factors (genes).';
      } else {
        crossVal.textContent = "Parental (P) Cross: Pure Yellow (YY) × Pure Green (yy)";

        var svgContent =
          '<!-- P Generation illustration -->' +
          '<g transform="translate(60, 100)">' +
            '<rect x="0" y="0" width="100" height="120" rx="6" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="2"/>' +
            '<circle cx="50" cy="50" r="22" fill="#f59e0b"/>' +
            '<text x="50" y="95" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">YY (Yellow)</text>' +
          '</g>' +
          '<text x="185" y="165" font-size="24" font-weight="bold" fill="currentColor">×</text>' +
          '<g transform="translate(210, 100)">' +
            '<rect x="0" y="0" width="100" height="120" rx="6" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="2"/>' +
            '<circle cx="50" cy="50" r="22" fill="#10b981"/>' +
            '<text x="50" y="95" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">yy (Green)</text>' +
          '</g>' +

          '<!-- Card on right -->' +
          '<g transform="translate(340, 35)">' +
            '<rect x="0" y="0" width="185" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
            '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">F₁ Generation</text>' +
            '<line x1="12" y1="34" x2="173" y2="34" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="54" font-size="11" font-weight="bold" fill="#3b82f6">All Offspring: 100% Yy</text>' +
            '<text x="12" y="74" font-size="10" fill="currentColor">Every plant in F₁ displays</text>' +
            '<text x="12" y="88" font-size="10" fill="currentColor">the yellow seed color.</text>' +
            '<line x1="12" y1="104" x2="173" y2="104" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="124" font-size="11" font-weight="bold" fill="#10b981">Recessive Not Lost:</text>' +
            '<text x="12" y="142" font-size="10" fill="currentColor">The green allele is masked,</text>' +
            '<text x="12" y="156" font-size="10" fill="currentColor">not destroyed or blended.</text>' +
            '<line x1="12" y1="174" x2="173" y2="174" stroke="var(--color-border, #eee)"/>' +
            '<text x="12" y="200" font-size="11" font-weight="bold" fill="#ef4444">Click Button 2 to see</text>' +
            '<text x="12" y="218" font-size="11" font-weight="bold" fill="#ef4444">the F₂ Punnett Grid!</text>' +
          '</g>';

        explain.innerHTML =
          '<strong>The First Filial Generation ($F_1$):</strong> Crossing pure yellow ($YY$) with pure green ($yy$) produces uniform heterozygous plants ($Yy$). Because Yellow is dominant, all $F_1$ peas look yellow, appearing to swallow the green trait entirely until the next generation.';
      }

      svg.innerHTML = svgContent;
    }

    btnF1.addEventListener('click', function () { isF2 = false; setBtnActive(btnF1); draw(); });
    btnF2.addEventListener('click', function () { isF2 = true; setBtnActive(btnF2); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 6: The DNA Double Helix & Base-Pairing
   * ------------------------------------------------------------------------- */
  FIG['fig-dna-helix'] = function (container) {
    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label>Select Complementary Base Pair: ' +
            '<span id="fig-dna-pair-val" class="fig-readout">Adenine = Thymine (2 Hydrogen Bonds)</span>' +
          '</label>' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-dna-at" class="fig-btn" style="background:#3b82f6;color:#fff;border-color:#3b82f6;">A = T (2 H-Bonds)</button>' +
          '<button type="button" id="fig-btn-dna-gc" class="fig-btn">G ≡ C (3 H-Bonds)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-dna-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-dna-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var btnAT = container.querySelector('#fig-btn-dna-at');
    var btnGC = container.querySelector('#fig-btn-dna-gc');
    var pairVal = container.querySelector('#fig-dna-pair-val');
    var svg = container.querySelector('#fig-dna-svg');
    var explain = container.querySelector('#fig-dna-explain');

    var isGC = false;

    function setBtnActive(activeBtn) {
      btnAT.style.background = ''; btnAT.style.color = ''; btnAT.style.borderColor = '';
      btnGC.style.background = ''; btnGC.style.color = ''; btnGC.style.borderColor = '';
      activeBtn.style.background = '#3b82f6';
      activeBtn.style.color = '#fff';
      activeBtn.style.borderColor = '#3b82f6';
    }

    function draw() {
      if (!isGC) {
        pairVal.textContent = "Adenine (Purine) = Thymine (Pyrimidine): 2 Hydrogen Bonds";
      } else {
        pairVal.textContent = "Guanine (Purine) ≡ Cytosine (Pyrimidine): 3 Hydrogen Bonds";
      }

      var b1Name = !isGC ? 'Adenine (A)' : 'Guanine (G)';
      var b1Col = !isGC ? '#ef4444' : '#3b82f6';
      var b2Name = !isGC ? 'Thymine (T)' : 'Cytosine (C)';
      var b2Col = !isGC ? '#f59e0b' : '#10b981';
      var bondCount = !isGC ? 2 : 3;

      var svgContent =
        '<!-- Sugar-Phosphate Backbones -->' +
        '<line x1="50" y1="40" x2="50" y2="320" stroke="#334155" stroke-width="6"/>' +
        '<text x="50" y="30" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">5\' End</text>' +
        '<text x="50" y="340" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">3\' End</text>' +

        '<line x1="290" y1="40" x2="290" y2="320" stroke="#334155" stroke-width="6"/>' +
        '<text x="290" y="30" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">3\' End</text>' +
        '<text x="290" y="340" font-size="11" font-weight="bold" fill="currentColor" text-anchor="middle">5\' End</text>' +

        '<!-- Antiparallel label -->' +
        '<text x="170" y="30" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">Antiparallel Strands (2.0 nm width)</text>' +

        '<!-- Left Base (Purine - Double Ring) -->' +
        '<rect x="53" y="140" width="85" height="80" rx="6" fill="' + b1Col + '"/>' +
        '<text x="95" y="185" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">' + b1Name + '</text>' +

        '<!-- Right Base (Pyrimidine - Single Ring) -->' +
        '<rect x="202" y="140" width="85" height="80" rx="6" fill="' + b2Col + '"/>' +
        '<text x="245" y="185" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">' + b2Name + '</text>';

      // Hydrogen bonds (dashed lines between bases)
      if (bondCount === 2) {
        svgContent +=
          '<line x1="138" y1="165" x2="202" y2="165" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 3"/>' +
          '<line x1="138" y1="195" x2="202" y2="195" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 3"/>' +
          '<text x="170" y="152" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">2 H-Bonds</text>';
      } else {
        svgContent +=
          '<line x1="138" y1="155" x2="202" y2="155" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<line x1="138" y1="180" x2="202" y2="180" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<line x1="138" y1="205" x2="202" y2="205" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<text x="170" y="142" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle">3 H-Bonds</text>';
      }

      // Card on right
      svgContent +=
        '<g transform="translate(350, 35)">' +
          '<rect x="0" y="0" width="175" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">Watson &amp; Crick (1953)</text>' +
          '<line x1="12" y1="34" x2="163" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">Chargaff\'s Rules:</text>' +
          '<text x="12" y="70" font-size="11" fill="currentColor">In all DNA:</text>' +
          '<text x="12" y="88" font-size="12" font-weight="bold" fill="#ef4444">A = T &nbsp;and&nbsp; G ≡ C</text>' +
          '<line x1="12" y1="104" x2="163" y2="104" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="124" font-size="11" font-weight="bold" fill="#10b981">Franklin\'s Photo 51:</text>' +
          '<text x="12" y="142" font-size="10" fill="currentColor">Proved the helical</text>' +
          '<text x="12" y="156" font-size="10" fill="currentColor">B-form with phosphates</text>' +
          '<text x="12" y="170" font-size="10" fill="currentColor">on the outside!</text>' +
          '<line x1="12" y1="184" x2="163" y2="184" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="204" font-size="11" font-weight="bold" fill="#3b82f6">Copying Mechanism:</text>' +
          '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">Unzipping the two</text>' +
          '<text x="12" y="236" font-size="10" fill="var(--color-text-muted, #666)">strands provides two</text>' +
          '<text x="12" y="250" font-size="10" font-weight="bold" fill="#10b981">exact templates for</text>' +
          '<text x="12" y="264" font-size="10" font-weight="bold" fill="#10b981">identical replication!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Molecular Architecture of Heredity (1953):</strong> Rosalind Franklin’s X-ray diffraction (Photo 51) revealed the helical structure. James Watson and Francis Crick recognized that a purine (A or G) must always pair with a pyrimidine (T or C) to maintain a constant 2.0 nm diameter. Adenine pairs with Thymine via 2 hydrogen bonds ($A=T$); Guanine pairs with Cytosine via 3 hydrogen bonds ($G\\equiv C$). This complementary base pairing directly suggested the self-copying mechanism of life.';
    }

    btnAT.addEventListener('click', function () { isGC = false; setBtnActive(btnAT); draw(); });
    btnGC.addEventListener('click', function () { isGC = true; setBtnActive(btnGC); draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 7: The Triplet Codon Decoder
   * ------------------------------------------------------------------------- */
  FIG['fig-genetic-code'] = function (container) {
    var codons = [
      { triplet: 'AUG', amino: 'Methionine (Met)', type: 'START Codon (Initiates Translation)' },
      { triplet: 'UUU', amino: 'Phenylalanine (Phe)', type: 'Nirenberg & Matthaei First Breakthrough (1961)' },
      { triplet: 'GAG', amino: 'Glutamic Acid (Glu)', type: 'Normal Hemoglobin (Mutates to Val in Sickle Cell)' },
      { triplet: 'UAA', amino: 'STOP (Ochre)', type: 'Nonsense Codon (Terminates Protein Synthesis)' }
    ];

    container.innerHTML =
      '<div class="fig-controls">' +
        '<div class="fig-control-group">' +
          '<label for="fig-codon-select">Select mRNA Triplet Codon: ' +
            '<span id="fig-codon-val" class="fig-readout">AUG → Methionine (START)</span>' +
          '</label>' +
          '<input type="range" id="fig-codon-select" min="0" max="3" step="1" value="0">' +
        '</div>' +
        '<div class="fig-control-group">' +
          '<button type="button" id="fig-btn-c-aug" class="fig-btn">AUG (Start)</button>' +
          '<button type="button" id="fig-btn-c-uuu" class="fig-btn">UUU (Phe)</button>' +
          '<button type="button" id="fig-btn-c-gag" class="fig-btn">GAG (Glu)</button>' +
          '<button type="button" id="fig-btn-c-uaa" class="fig-btn">UAA (Stop)</button>' +
        '</div>' +
      '</div>' +
      '<div class="fig-canvas-container" style="min-height:360px;">' +
        '<svg id="fig-code-svg" viewBox="0 0 540 360" style="width:100%;height:auto;display:block;margin:0 auto;"></svg>' +
      '</div>' +
      '<div id="fig-code-explain" class="fig-caption" style="margin-top:0.75rem; font-size:0.9rem; line-height:1.5;"></div>';

    var slider = container.querySelector('#fig-codon-select');
    var valReadout = container.querySelector('#fig-codon-val');
    var btnAug = container.querySelector('#fig-btn-c-aug');
    var btnUuu = container.querySelector('#fig-btn-c-uuu');
    var btnGag = container.querySelector('#fig-btn-c-gag');
    var btnUaa = container.querySelector('#fig-btn-c-uaa');
    var svg = container.querySelector('#fig-code-svg');
    var explain = container.querySelector('#fig-code-explain');

    function draw() {
      var idx = parseInt(slider.value, 10);
      var cur = codons[idx];
      valReadout.textContent = cur.triplet + ' → ' + cur.amino;

      var svgContent =
        '<!-- Ribosome Machine Background -->' +
        '<ellipse cx="180" cy="180" rx="140" ry="110" fill="rgba(148, 163, 184, 0.2)" stroke="#64748b" stroke-width="2"/>' +
        '<text x="180" y="95" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">Ribosome Translation Complex</text>' +

        '<!-- mRNA Strand Tape passing through -->' +
        '<rect x="20" y="190" width="320" height="40" rx="4" fill="#1e293b"/>' +
        '<text x="35" y="215" font-size="11" font-weight="bold" fill="#94a3b8">5\' mRNA</text>' +
        '<text x="305" y="215" font-size="11" font-weight="bold" fill="#94a3b8">3\'</text>' +

        '<!-- The Active Codon on the tape -->' +
        '<rect x="135" y="185" width="90" height="50" rx="4" fill="#3b82f6" stroke="#fff" stroke-width="2"/>' +
        '<text x="180" y="218" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">' + cur.triplet + '</text>' +

        '<!-- tRNA Anticodon bringing Amino Acid -->' +
        '<path d="M 180 185 L 180 140 Q 180 120 160 120" fill="none" stroke="#f59e0b" stroke-width="4"/>' +
        '<!-- Amino Acid Sphere -->' +
        '<circle cx="150" cy="120" r="18" fill="#10b981" stroke="#047857" stroke-width="2"/>' +
        '<text x="150" y="125" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">' + cur.amino.split(' ')[0].substring(0,3) + '</text>' +

        '<!-- Card on right -->' +
        '<g transform="translate(350, 35)">' +
          '<rect x="0" y="0" width="175" height="280" rx="6" fill="var(--color-surface, #fff)" stroke="var(--color-border, #ddd)" stroke-width="1"/>' +
          '<text x="12" y="24" font-size="12" font-weight="bold" fill="currentColor">The Genetic Code (1961)</text>' +
          '<line x1="12" y1="34" x2="163" y2="34" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="52" font-size="11" font-weight="bold" fill="#3b82f6">Codon: ' + cur.triplet + '</text>' +
          '<text x="12" y="70" font-size="11" fill="currentColor">Translates to:</text>' +
          '<text x="12" y="88" font-size="12" font-weight="bold" fill="#10b981">' + cur.amino + '</text>' +
          '<line x1="12" y1="104" x2="163" y2="104" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="124" font-size="10" font-weight="bold" fill="currentColor">Biological Role:</text>' +
          '<text x="12" y="142" font-size="10" fill="currentColor">' + cur.type + '</text>' +
          '<line x1="12" y1="170" x2="163" y2="170" stroke="var(--color-border, #eee)"/>' +
          '<text x="12" y="190" font-size="11" font-weight="bold" fill="#ef4444">Universality of Life:</text>' +
          '<text x="12" y="208" font-size="10" fill="var(--color-text-muted, #666)">This identical 64-codon</text>' +
          '<text x="12" y="222" font-size="10" fill="var(--color-text-muted, #666)">code is used by bacteria,</text>' +
          '<text x="12" y="236" font-size="10" fill="var(--color-text-muted, #666)">trees, and humans—proving</text>' +
          '<text x="12" y="250" font-size="10" font-weight="bold" fill="#10b981">a single common ancestor!</text>' +
        '</g>';

      svg.innerHTML = svgContent;

      explain.innerHTML =
        '<strong>The Deciphering of the Genetic Code (1961–1966):</strong> Marshall Nirenberg and Heinrich Matthaei synthesized synthetic RNA composed purely of uracil ($UUU$) and added it to cell-free bacterial extracts, producing a polypeptide chain of pure phenylalanine. The full $4^3 = 64$ triplet codon dictionary maps the 4 bases of RNA to the 20 amino acids of living proteins—a universal software shared by all life on Earth.';
    }

    slider.addEventListener('input', draw);
    btnAug.addEventListener('click', function () { slider.value = 0; draw(); });
    btnUuu.addEventListener('click', function () { slider.value = 1; draw(); });
    btnGag.addEventListener('click', function () { slider.value = 2; draw(); });
    btnUaa.addEventListener('click', function () { slider.value = 3; draw(); });
    draw();
  };

  /* -------------------------------------------------------------------------
   * Figure 8: Part 8 Interactive Self-Scoring Quiz
   * ------------------------------------------------------------------------- */
  FIG['fig-quiz-part8'] = function (container) {
    var questions = [
      {
        question: "How did Georges Cuvier's comparative anatomy in Paris establish the reality of extinction?",
        options: [
          "He proved that fossils are mineral concretions grown inside rocks",
          "He claimed that animals transform into trees during floods",
          "He proved that fossil mammoth and mastodon bones were anatomically distinct from all living African and Indian elephants, demonstrating that entire species had vanished from the Earth",
          "He discovered fossil dinosaur DNA in amber"
        ],
        answer: 2,
        explanation: "By meticulously comparing jaw and tooth anatomy, Cuvier demonstrated that fossil mammoths were distinct from any living elephant species, overthrowing the theological dogma that extinction is impossible because God would never permit a link in the Great Chain of Being to break."
      },
      {
        question: "What is the biological principle established by Rudolf Virchow in 1858 ('Omnis cellula e cellula')?",
        options: [
          "All living cells arise exclusively from the division of pre-existing cells",
          "Cells generate spontaneously from inorganic crystals",
          "Cells have no nuclei",
          "Plants and animals are not related"
        ],
        answer: 0,
        explanation: "Virchow completed the cell doctrine of Schleiden and Schwann by establishing that cells do not crystallize out of a formless blastema, but multiply strictly through the division of pre-existing living cells."
      },
      {
        question: "What core ecological concept from Thomas Malthus’s 'Essay on Population' catalyzed Darwin’s insight into natural selection?",
        options: [
          "Farming techniques double every generation",
          "Predators always outnumber prey",
          "Organisms reproduce geometrically, while food resources increase only arithmetically, creating an inevitable struggle for survival in which favorable variations are preserved",
          "Human population decreases during peacetime"
        ],
        answer: 2,
        explanation: "Reading Malthus in October 1838, Darwin realized that because far more individuals are born than can possibly survive, any slight variation that gives an organism an advantage in the struggle for life will tend to be preserved and passed on."
      },
      {
        question: "How did Louis Pasteur's 1861 swan-neck flask experiment disprove the theory of spontaneous generation?",
        options: [
          "He boiled broth in sealed lead containers that prevented all air exchange",
          "He proved that bacteria only grow in ice",
          "He allowed air to circulate freely into boiled broth through an S-shaped neck that trapped airborne dust in its curve; broth remained sterile indefinitely until dust was admitted",
          "He added antibiotics to the broth"
        ],
        answer: 2,
        explanation: "Pasteur demonstrated that air itself carries no 'vital force' capable of generating life spontaneously; broth decomposed only when living airborne microbial spores and dust particles were permitted to enter."
      },
      {
        question: "What did Gregor Mendel’s pea-plant experiments prove about heredity?",
        options: [
          "Parental traits blend together like colored paints",
          "Hereditary traits are inherited as discrete, particulate factors (genes) that segregate during gamete formation and do not blend or corrupt each other",
          "Acquired characteristics during lifetime are passed to offspring",
          "Inheritance is determined entirely by soil quality"
        ],
        answer: 1,
        explanation: "Mendel proved particulate inheritance: recessive traits (like green pea seeds) disappear in the F₁ generation when crossed with dominant yellow, but reappear completely intact and unblended in a 3:1 ratio in the F₂ generation."
      },
      {
        question: "What did Thomas Hunt Morgan and his 'Fly Room' team at Columbia University discover using Drosophila melanogaster?",
        options: [
          "Genes reside at specific linear loci on physical chromosomes, displaying sex linkage and crossing over during meiosis",
          "Fruit flies reproduce by binary fission",
          "Flies have no genes",
          "Mutations cannot be produced by radiation"
        ],
        answer: 0,
        explanation: "Morgan's group demonstrated the chromosome theory of heredity: tracking white-eyed fly mutations proved that specific genes are physically located on chromosomes, enabling the construction of the world's first genetic linkage maps."
      },
      {
        question: "What did the Avery-MacLeod-McCarty (1944) and Hershey-Chase (1952) experiments prove about the chemical nature of genes?",
        options: [
          "Deoxyribonucleic acid (DNA), not protein, is the chemical carrier of genetic information",
          "Genes are made of structural proteins with 20 amino acids",
          "Genes are made of lipid membranes",
          "Genes exist only in bacterial ribosomes"
        ],
        answer: 0,
        explanation: "For decades, biologists believed complex proteins must carry heredity. Avery's team showed that pure DNA transfers virulent traits between pneumococcal strains, and Hershey-Chase proved viral DNA enters bacteria to direct replication."
      },
      {
        question: "What critical empirical feature did Rosalind Franklin’s 'Photo 51' X-ray diffraction photograph demonstrate about DNA?",
        options: [
          "That DNA has an antiparallel double helical structure (B-form) with the phosphate-sugar backbones on the outside and bases packed within",
          "That DNA is a triple helix with bases on the outside",
          "That DNA is a circular single-stranded ring",
          "That DNA contains no phosphorus"
        ],
        answer: 0,
        explanation: "Franklin's crystalline Photo 51 revealed the classic X-shaped diffraction pattern characteristic of a double helix, providing the exact helical pitch (3.4 nm per turn) and diameter (2.0 nm) that guided Watson and Crick's model."
      },
      {
        question: "Why was the specific base-pairing rule ($A=T$ and $G\\equiv C$) the key to Watson and Crick's 1953 model?",
        options: [
          "It made DNA soluble in cold water",
          "It maintained a constant 2.0 nm helical diameter and immediately explained how genetic information is accurately copied through complementary replication",
          "It allowed DNA to fold into crystalline cubes",
          "It prevented all genetic mutations from ever occurring"
        ],
        answer: 1,
        explanation: "Complementary base pairing meant that each strand of DNA contains all the information needed to reconstruct the opposite strand: when the helix unzips, each single strand serves as a template to synthesize an identical copy."
      },
      {
        question: "What profound evolutionary truth is demonstrated by the universality of the genetic code across all living organisms?",
        options: [
          "All terrestrial life—from bacteria and fungi to oak trees and humans—shares a single common ancestry from a Last Universal Common Ancestor (LUCA)",
          "Life originated independently in thousands of separate events",
          "Viruses are not biological entities",
          "DNA mutates at a strictly constant rate across all species"
        ],
        answer: 0,
        explanation: "Because a bacterium, a fruit fly, and a human cell read the same triplet codon (e.g., UUU for phenylalanine, AUG for methionine), all living things are branches of a single unbroken tree of life originating from a common ancestor billions of years ago."
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
            '<h4 style="margin:0; font-size:1.15rem;">Part 8 Evaluation: The Book of Life</h4>' +
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
