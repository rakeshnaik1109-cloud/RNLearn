/**
 * Interactive Figures for Part 12: What is Science, Really?
 * Topics: Epistemology, Induction, Falsification, Paradigms, Research Programmes, Bayesian Updating, Replication
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
  // Figure 12.1: Hume's Problem of Induction & The Black Swan Paradox
  // =========================================================================
  FIG['fig-hume-induction'] = function (container) {
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
      '<button id="hume-sample-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer; font-weight:bold;">Observe Next Swan</button>' +
      '<button id="hume-batch-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Observe 50 Swans</button>' +
      '<button id="hume-reset-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reset</button>' +
      '<span id="hume-status" style="font-weight:bold; color:var(--color-success, #16a34a);">Sampled: 0 swans</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var readout = document.createElement('div');
    readout.style.fontSize = '0.85rem';
    readout.style.color = 'var(--color-text-muted, #666)';
    readout.id = 'hume-readout';
    readout.innerHTML = '<strong>David Hume (1748):</strong> Universal claim: <em>"All swans are white."</em> No matter how many thousands of white swans are observed, inductive confidence cannot logically guarantee the universal law. A single black swan immediately falsifies the entire generalization.';
    wrapper.appendChild(readout);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var sampleBtn = ctrlRow.querySelector('#hume-sample-btn');
    var batchBtn = ctrlRow.querySelector('#hume-batch-btn');
    var resetBtn = ctrlRow.querySelector('#hume-reset-btn');
    var statusDisp = ctrlRow.querySelector('#hume-status');

    var observedSwans = [];
    var totalObserved = 0;
    var blackSwanFound = false;
    var blackSwanIndex = 84; // The 84th swan will be black

    function addObservation() {
      if (blackSwanFound) return;
      totalObserved++;
      if (totalObserved === blackSwanIndex) {
        blackSwanFound = true;
        observedSwans.push('black');
        statusDisp.textContent = 'BLACK SWAN DETECTED AT N=' + totalObserved + '! Induction Shattered!';
        statusDisp.style.color = 'var(--color-hot, #dc2626)';
      } else {
        observedSwans.push('white');
        statusDisp.textContent = 'Sampled ' + totalObserved + ' white swans. Inductive confidence growing...';
        statusDisp.style.color = 'var(--color-primary, #2160c4)';
      }
      render();
    }

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Left: Swan Population Field ---
      var ox1 = 40, oy1 = 40, w1 = 300, h1 = 260;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(ox1, oy1, w1, h1);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(ox1, oy1, w1, h1);

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Empirical Observations (Swans in Lake)', ox1 + 25, oy1 - 10);

      // Draw swan icons / dots
      var cols = 15;
      for (var s = 0; s < observedSwans.length; s++) {
        var col = s % cols;
        var row = Math.floor(s / cols);
        var sx = ox1 + 18 + col * 18;
        var sy = oy1 + 20 + row * 18;

        if (sy > oy1 + h1 - 10) break;

        var isBlack = (observedSwans[s] === 'black');
        ctx.fillStyle = isBlack ? '#111827' : '#f8fafc';
        ctx.strokeStyle = isBlack ? colors.hot : colors.border;
        ctx.lineWidth = isBlack ? 2.5 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (isBlack) {
          ctx.strokeStyle = colors.hot;
          ctx.beginPath();
          ctx.arc(sx, sy, 11, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // --- Right: Inductive Confidence Curve vs Falsification ---
      var ox2 = 400, oy2 = 280, w2 = 280, h2 = 220;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox2, oy2 - h2);
      ctx.lineTo(ox2, oy2);
      ctx.lineTo(ox2 + w2, oy2);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      ctx.fillText('Observations (N)', ox2 + w2 - 80, oy2 + 20);
      ctx.save();
      ctx.translate(ox2 - 35, oy2 - h2 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Subjective Confidence P(All White)', 0, 0);
      ctx.restore();

      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('The Inductive Illusion', ox2 + 65, 30);

      // Plot curve of confidence
      ctx.beginPath();
      var maxN = 100;
      for (var n = 0; n <= Math.min(totalObserved, maxN); n++) {
        var px = ox2 + (n / maxN) * w2;
        var conf;
        if (n < blackSwanIndex) {
          // Asymptotic rise: 1 - 1/(1 + n*0.1)
          conf = 1.0 - (1.0 / (1.0 + n * 0.15));
        } else {
          // Instantaneous collapse to 0
          conf = 0;
        }
        var py = oy2 - conf * (h2 * 0.85);
        if (n === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = blackSwanFound ? colors.hot : colors.primary;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Collapse drop line if black swan observed
      if (blackSwanFound) {
        var dropX = ox2 + (blackSwanIndex / maxN) * w2;
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(dropX, oy2 - (h2 * 0.85 * 0.92));
        ctx.lineTo(dropX, oy2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = colors.hot;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Instantaneous Collapse to 0', dropX - 80, oy2 - h2 / 2);
      }
    }

    sampleBtn.addEventListener('click', addObservation);
    batchBtn.addEventListener('click', function () {
      for (var b = 0; b < 50; b++) {
        if (!blackSwanFound) addObservation();
      }
    });

    resetBtn.addEventListener('click', function () {
      observedSwans = [];
      totalObserved = 0;
      blackSwanFound = false;
      statusDisp.textContent = 'Sampled: 0 swans';
      statusDisp.style.color = 'var(--color-primary, #2160c4)';
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 12.2: Popperian Falsification Asymmetry (Modus Tollens)
  // =========================================================================
  FIG['fig-popper-falsification'] = function (container) {
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
      '<strong>Test Hypothesis ($H$):</strong>' +
      '<select id="popper-hyp" style="padding:4px 8px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff);">' +
      '<option value="general-relativity">General Relativity (Light Deflection = 1.75")</option>' +
      '<option value="astrology">Astrology (Planetary alignment causes luck)</option>' +
      '<option value="marxism">Vulgar Marxism (All history is class struggle)</option>' +
      '</select>' +
      '</label>' +
      '<span id="popper-status" style="font-weight:bold; padding:3px 8px; border-radius:4px;">Scientific (Falsifiable)</span>';

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
    expl.innerHTML = '<strong>Karl Popper (1934):</strong> The logical asymmetry of demarcation: No amount of positive evidence can verify a universal hypothesis ($H \\implies E, E \\not\\implies H$ is the fallacy of affirming the consequent). But a single negative observation deductively refutes the hypothesis via <em>Modus Tollens</em>: $H \\implies E, \\neg E \\implies \\neg H$. A claim that cannot be falsified is pseudoscience.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var hypSelect = ctrlRow.querySelector('#popper-hyp');
    var statusBadge = ctrlRow.querySelector('#popper-status');

    function render() {
      var colors = getThemeColors();
      var choice = hypSelect.value;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var isFalsifiable = (choice === 'general-relativity');

      if (isFalsifiable) {
        statusBadge.textContent = 'SCIENTIFIC: Genuine Risk of Refutation';
        statusBadge.style.background = isDark() ? '#14532d' : '#dcfce7';
        statusBadge.style.color = '#16a34a';
      } else {
        statusBadge.textContent = 'PSEUDOSCIENCE: Immune to Refutation (Ad Hoc Excuses)';
        statusBadge.style.background = isDark() ? '#7f1d1d' : '#fee2e2';
        statusBadge.style.color = '#dc2626';
      }

      // Left Box: Inductive Verification Fallacy
      var bx1 = 50, by1 = 50, bw = 290, bh = 240;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(bx1, by1, bw, bh);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(bx1, by1, bw, bh);

      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Logical Fallacy: Verification', bx1 + 45, by1 + 30);

      ctx.fillStyle = colors.text;
      ctx.font = '12px monospace';
      ctx.fillText('Premise 1:  H → E', bx1 + 30, by1 + 70);
      ctx.fillText('Premise 2:  E is observed', bx1 + 30, by1 + 95);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(bx1 + 25, by1 + 110); ctx.lineTo(bx1 + bw - 25, by1 + 110);
      ctx.stroke();

      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Conclusion: H is True  [INVALID!]', bx1 + 30, by1 + 135);

      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('Affirming the Consequent: Rival theories', bx1 + 25, by1 + 175);
      ctx.fillText('or coincidence could also predict E.', bx1 + 25, by1 + 195);

      // Right Box: Deductive Falsification (Modus Tollens)
      var bx2 = 380, by2 = 50, bw2 = 290, bh2 = 240;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(bx2, by2, bw2, bh2);
      ctx.strokeStyle = isFalsifiable ? colors.success : colors.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx2, by2, bw2, bh2);

      ctx.fillStyle = colors.success;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Deductive Rigor: Modus Tollens', bx2 + 35, by2 + 30);

      ctx.fillStyle = colors.text;
      ctx.font = '12px monospace';
      ctx.fillText('Premise 1:  H → E', bx2 + 30, by2 + 70);
      ctx.fillText('Premise 2:  ¬E is observed', bx2 + 30, by2 + 95);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(bx2 + 25, by2 + 110); ctx.lineTo(bx2 + bw2 - 25, by2 + 110);
      ctx.stroke();

      ctx.fillStyle = colors.success;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Conclusion: ¬H is True [VALID!]', bx2 + 30, by2 + 135);

      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      if (isFalsifiable) {
        ctx.fillStyle = colors.text;
        ctx.fillText('Einstein boldly stated: If eclipse light', bx2 + 25, by2 + 175);
        ctx.fillText('deflection is not 1.75", relativity is dead.', bx2 + 25, by2 + 195);
      } else {
        ctx.fillStyle = colors.hot;
        ctx.fillText('Non-falsifiable: Negative results are', bx2 + 25, by2 + 175);
        ctx.fillText('reinterpreted with ad-hoc rationalizations.', bx2 + 25, by2 + 195);
      }
    }

    hypSelect.addEventListener('change', render);
    render();
  };

  // =========================================================================
  // Figure 12.3: Thomas Kuhn's Cycle of Scientific Revolutions
  // =========================================================================
  FIG['fig-kuhn-cycle'] = function (container) {
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
      '<button id="kuhn-adv-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer; font-weight:bold;">Advance Paradigm Phase</button>' +
      '<span id="kuhn-phase-title" style="font-weight:bold; color:var(--color-primary, #2160c4);">Phase 1: Normal Science (Puzzle Solving)</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 350;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var phaseDesc = document.createElement('div');
    phaseDesc.style.fontSize = '0.85rem';
    phaseDesc.style.color = 'var(--color-text-muted, #666)';
    phaseDesc.id = 'kuhn-desc';
    phaseDesc.innerHTML = '<strong>Thomas Kuhn (1962):</strong> Science does not progress via smooth, cumulative increments. It alternates between long periods of conservative <em>Normal Science</em> (solving puzzles within an unquestioned paradigm) and dramatic, non-cumulative <em>Paradigm Shifts</em> triggered by accumulating crises.';
    wrapper.appendChild(phaseDesc);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var advBtn = ctrlRow.querySelector('#kuhn-adv-btn');
    var phaseTitle = ctrlRow.querySelector('#kuhn-phase-title');

    var currentPhase = 0; // 0 to 4
    var phases = [
      {
        name: 'Phase 1: Normal Science',
        desc: 'Scientists operate within an established paradigm (e.g. Newtonian mechanics). Research is conservative "puzzle-solving"—fitting nature into pre-formed cognitive boxes without questioning core assumptions.'
      },
      {
        name: 'Phase 2: Anomaly Accumulation',
        desc: 'Persistent observations arise that stubbornly resist explanation within the paradigm (e.g. Mercury’s perihelion precession, Michelson-Morley null ether drift, blackbody UV catastrophe).'
      },
      {
        name: 'Phase 3: Crisis',
        desc: 'Anomalies multiply and threaten the foundational integrity of the paradigm. Younger scientists lose faith; ad-hoc fixes proliferate; philosophical debates return to center stage.'
      },
      {
        name: 'Phase 4: Scientific Revolution',
        desc: 'A radically new conceptual framework emerges (e.g. Einsteinian Relativity or Quantum Mechanics). A fierce intellectual battle ensues between rival paradigms that view the world through incommensurable lenses.'
      },
      {
        name: 'Phase 5: New Normal Science',
        desc: 'The new paradigm achieves dominance. Textbooks are rewritten; older opponents retire or die ("Planck’s Principle"); a new era of conservative puzzle-solving begins anew.'
      }
    ];

    function render() {
      var colors = getThemeColors();
      var pObj = phases[currentPhase];
      phaseTitle.textContent = pObj.name;
      phaseDesc.innerHTML = '<strong>Kuhn’s Dynamic:</strong> ' + pObj.desc;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Circular Cycle Diagram
      var cx = 360, cy = 175, R = 115;
      var numNodes = 5;

      // Draw cycle arrows
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      var nodePositions = [];
      for (var i = 0; i < numNodes; i++) {
        var ang = (i * 2 * Math.PI) / numNodes - Math.PI / 2;
        var nx = cx + Math.cos(ang) * R;
        var ny = cy + Math.sin(ang) * R;
        nodePositions.push({ x: nx, y: ny, ang: ang });
      }

      // Draw nodes
      var shortLabels = ['1. Normal Science', '2. Anomaly', '3. Crisis', '4. Revolution', '5. New Paradigm'];
      nodePositions.forEach(function (pos, idx) {
        var isCurrent = (idx === currentPhase);

        ctx.fillStyle = isCurrent
          ? (idx === 3 ? colors.hot : colors.primary)
          : colors.panelBg;
        ctx.strokeStyle = isCurrent ? colors.text : colors.border;
        ctx.lineWidth = isCurrent ? 3 : 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCurrent ? '#fff' : colors.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText((idx + 1), pos.x - 4, pos.y + 4);

        // Text label outside node
        var labelDist = R + 48;
        var lx = cx + Math.cos(pos.ang) * labelDist;
        var ly = cy + Math.sin(pos.ang) * labelDist;
        ctx.fillStyle = isCurrent ? (idx === 3 ? colors.hot : colors.primary) : colors.text;
        ctx.font = (isCurrent ? 'bold ' : '') + '11px sans-serif';
        ctx.fillText(shortLabels[idx], lx - 38, ly + 4);
      });

      // Center title
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('The Structure of', cx - 50, cy - 8);
      ctx.fillText('Scientific Revolutions', cx - 68, cy + 12);
    }

    advBtn.addEventListener('click', function () {
      currentPhase = (currentPhase + 1) % 5;
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 12.4: Imre Lakatos: Hard Core vs Protective Belt
  // =========================================================================
  FIG['fig-lakatos-belt'] = function (container) {
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
      '<button id="lakatos-attack-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-hot, #dc2626); color:#fff; cursor:pointer; font-weight:bold;">Launch Empirical Anomaly</button>' +
      '<button id="lakatos-modify-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Adjust Auxiliary Hypothesis</button>' +
      '<span id="lakatos-status" style="font-weight:bold; color:var(--color-primary, #2160c4);">Programme Status: Progressive</span>';

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
    expl.innerHTML = '<strong>Imre Lakatos (1970):</strong> A scientific research programme consists of an untouchable <em>Hard Core</em> protected by negative heuristics, shielded by a malleable <em>Protective Belt</em> of auxiliary hypotheses. When anomalies strike, the protective belt absorbs the impact, preserving the core.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var attackBtn = ctrlRow.querySelector('#lakatos-attack-btn');
    var modBtn = ctrlRow.querySelector('#lakatos-modify-btn');
    var statusDisp = ctrlRow.querySelector('#lakatos-status');

    var anomalyActive = false;
    var anomalyAngle = 0.2;
    var beltModified = false;

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var cx = 360, cy = 170;

      // 1. Outer Protective Belt (Auxiliary hypotheses)
      var beltRadius = 125;
      ctx.fillStyle = isDark() ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)';
      ctx.beginPath();
      ctx.arc(cx, cy, beltRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = beltModified ? colors.success : colors.primary;
      ctx.lineWidth = 3;
      ctx.stroke();

      // 2. Central Hard Core (Negative heuristic: DO NOT TOUCH)
      var coreRadius = 55;
      ctx.fillStyle = isDark() ? '#1e3a8a' : '#dbeafe';
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('HARD CORE', cx - 40, cy - 6);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('(Newtonian Laws / Relativistic Laws)', cx - 80, cy + 12);

      // Protective belt labels around perimeter
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('PROTECTIVE BELT: Auxiliary Hypotheses', cx - 110, cy - beltRadius + 18);
      ctx.font = '10px sans-serif';
      ctx.fillText('• Instrument calibrations  • Atmospheric refraction  • Planetary perturbation', cx - 145, cy + beltRadius - 15);

      // Incoming Anomaly projectile
      if (anomalyActive) {
        var ax = cx + Math.cos(anomalyAngle) * (beltRadius - 5);
        var ay = cy + Math.sin(anomalyAngle) * (beltRadius - 5);

        // Anomaly arrow striking the protective belt
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(anomalyAngle) * 220, cy + Math.sin(anomalyAngle) * 220);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(ax, ay, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Empirical Anomaly (Uranus Orbit Deviation)', ax + 14, ay + 4);
      }

      if (beltModified) {
        ctx.fillStyle = colors.success;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Auxiliary Adjusted: Discovered Neptune! (Progressive Problemshift)', 160, 320);
      }
    }

    attackBtn.addEventListener('click', function () {
      anomalyActive = true;
      beltModified = false;
      statusDisp.textContent = 'Anomaly Struck: Protective Belt Absorbing Shock!';
      statusDisp.style.color = 'var(--color-hot, #dc2626)';
      render();
    });

    modBtn.addEventListener('click', function () {
      if (!anomalyActive) return;
      beltModified = true;
      anomalyActive = false;
      statusDisp.textContent = 'Belt Modified: Programme Remains Progressive!';
      statusDisp.style.color = 'var(--color-success, #16a34a)';
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 12.5: Quine's Web of Belief & The Duhem-Quine Thesis
  // =========================================================================
  FIG['fig-duhem-quine-web'] = function (container) {
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
      '<button id="quine-revis-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-accent, #d97706); color:#fff; cursor:pointer; font-weight:bold;">Trigger Discrepant Observation</button>' +
      '<button id="quine-repair-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Sacrifice Peripheral Node</button>' +
      '<span id="quine-status" style="font-weight:bold; color:var(--color-primary, #2160c4);">Web of Belief: Stable</span>';

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
    expl.innerHTML = '<strong>Duhem-Quine Thesis (1951):</strong> Our statements about external reality face the tribunal of sense experience not as isolated sentences, but only as a corporate body—a <em>Web of Belief</em>. Any statement can be held true come what may, if we make drastic enough adjustments elsewhere in the system.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var revisBtn = ctrlRow.querySelector('#quine-revis-btn');
    var repairBtn = ctrlRow.querySelector('#quine-repair-btn');
    var statusDisp = ctrlRow.querySelector('#quine-status');

    var isShocked = false;
    var nodeSacrificed = false;

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var cx = 360, cy = 170;

      // Concentric circles representing distance from sensory periphery
      [45, 95, 145].forEach(function (r, idx) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Nodes in web
      // Center: Formal Logic / Mathematics
      // Middle: Fundamental Physics Laws
      // Outer: Auxiliary hypotheses & observational reports
      var nodes = [
        { name: 'Pure Logic & Math', r: 0, ang: 0, core: true },
        { name: 'Conservation of Energy', r: 80, ang: -0.8, core: false },
        { name: 'Gravitational Law', r: 80, ang: 0.8, core: false },
        { name: 'Electromagnetism', r: 80, ang: 2.3, core: false },
        { name: 'Optics of Telescope', r: 135, ang: -0.6, peripheral: true, target: true },
        { name: 'Atmospheric Model', r: 135, ang: 0.4, peripheral: true },
        { name: 'Sensor Calibration', r: 135, ang: 1.6, peripheral: true },
        { name: 'Clock Timing Sync', r: 135, ang: 2.8, peripheral: true }
      ];

      // Draw web interconnecting fibers
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1.2;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var p1 = { x: cx + Math.cos(nodes[i].ang) * nodes[i].r, y: cy + Math.sin(nodes[i].ang) * nodes[i].r };
          var p2 = { x: cx + Math.cos(nodes[j].ang) * nodes[j].r, y: cy + Math.sin(nodes[j].ang) * nodes[j].r };
          var dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw node spheres
      nodes.forEach(function (nd) {
        var nx = cx + Math.cos(nd.ang) * nd.r;
        var ny = cy + Math.sin(nd.ang) * nd.r;

        var isDamaged = nd.target && isShocked && !nodeSacrificed;
        var isRepaired = nd.target && nodeSacrificed;

        ctx.fillStyle = nd.core
          ? colors.purple
          : (isDamaged ? colors.hot : (isRepaired ? colors.success : colors.primary));

        ctx.beginPath();
        ctx.arc(nx, ny, nd.core ? 14 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = colors.text;
        ctx.font = (nd.core ? 'bold ' : '') + '11px sans-serif';
        if (nd.core === false) {
          // Middle-ring labels sit under their node so they keep clear of the outer-ring labels
          ctx.textAlign = 'center';
          ctx.fillText(nd.name, nx, ny + 22);
          ctx.textAlign = 'left';
        } else {
          ctx.fillText(nd.name, nx + 12, ny + 4);
        }
      });

      // Sensory boundary annotation
      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.fillText('Sensory Boundary (Experience)', cx + 150, cy);
      ctx.fillText('Deep Core (Logic)', cx - 40, cy + 28);
    }

    revisBtn.addEventListener('click', function () {
      isShocked = true;
      nodeSacrificed = false;
      statusDisp.textContent = 'Sensory Anomaly at Edge! Web Under Tension!';
      statusDisp.style.color = 'var(--color-hot, #dc2626)';
      render();
    });

    repairBtn.addEventListener('click', function () {
      if (!isShocked) return;
      nodeSacrificed = true;
      statusDisp.textContent = 'Peripheral Node Modified (Telescope error)! Core Laws Preserved!';
      statusDisp.style.color = 'var(--color-success, #16a34a)';
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 12.6: Bayesian Confirmation & Posterior Belief Updating
  // =========================================================================
  FIG['fig-bayes-updater'] = function (container) {
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
      '<strong>Prior Probability $P(H)$:</strong>' +
      '<input type="range" id="bayes-prior" min="0.05" max="0.95" step="0.05" value="0.20" style="width:100px;">' +
      '<span id="bayes-prior-val">0.20</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Likelihood $P(E|H)$:</strong>' +
      '<input type="range" id="bayes-peh" min="0.5" max="0.99" step="0.01" value="0.90" style="width:90px;">' +
      '<span id="bayes-peh-val">0.90</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>False Positive $P(E|\\neg H)$:</strong>' +
      '<input type="range" id="bayes-penoth" min="0.01" max="0.30" step="0.01" value="0.05" style="width:80px;">' +
      '<span id="bayes-penoth-val">0.05</span>' +
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
      '<div><strong>Total Evidence Likelihood ($P(E)$):</strong> <span id="pe-tot-val">0.220</span></div>' +
      '<div><strong>Updated Posterior ($P(H|E)$):</strong> <span id="post-h-val" style="font-weight:bold; color:var(--color-primary, #2160c4); font-size:1rem;">81.8%</span></div>' +
      '<div><strong>Bayes Theorem:</strong> <span>$P(H|E) = \\frac{P(E|H) P(H)}{P(E)}$</span></div>';

    wrapper.appendChild(readouts);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var priorSlider = ctrlRow.querySelector('#bayes-prior');
    var pehSlider = ctrlRow.querySelector('#bayes-peh');
    var penothSlider = ctrlRow.querySelector('#bayes-penoth');

    var priorVal = ctrlRow.querySelector('#bayes-prior-val');
    var pehVal = ctrlRow.querySelector('#bayes-peh-val');
    var penothVal = ctrlRow.querySelector('#bayes-penoth-val');

    var peTotVal = readouts.querySelector('#pe-tot-val');
    var postHVal = readouts.querySelector('#post-h-val');

    function render() {
      var colors = getThemeColors();
      var pH = parseFloat(priorSlider.value);
      var pE_H = parseFloat(pehSlider.value);
      var pE_notH = parseFloat(penothSlider.value);

      priorVal.textContent = pH.toFixed(2);
      pehVal.textContent = pE_H.toFixed(2);
      penothVal.textContent = pE_notH.toFixed(2);

      // Bayes Formula: P(E) = P(E|H)*P(H) + P(E|notH)*P(notH)
      var pNotH = 1.0 - pH;
      var pE = (pE_H * pH) + (pE_notH * pNotH);
      var pHE = (pE_H * pH) / pE;

      peTotVal.textContent = pE.toFixed(3);
      postHVal.textContent = (pHE * 100).toFixed(1) + '%';

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bar Chart comparison: Prior vs Posterior
      var bx1 = 160, by1 = 260, bw = 100, maxH = 190;
      var bx2 = 440, by2 = 260;

      // Base axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, by1); ctx.lineTo(640, by1);
      ctx.stroke();

      // 1. Prior Bar
      var hPrior = pH * maxH;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(bx1, by1 - hPrior, bw, hPrior);
      ctx.strokeRect(bx1, by1 - hPrior, bw, hPrior);

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Prior P(H)', bx1 + 18, by1 + 22);
      ctx.fillText((pH * 100).toFixed(0) + '%', bx1 + 32, by1 - hPrior - 8);

      // 2. Posterior Bar
      var hPost = pHE * maxH;
      ctx.fillStyle = colors.primary;
      ctx.fillRect(bx2, by2 - hPost, bw, hPost);
      ctx.strokeRect(bx2, by2 - hPost, bw, hPost);

      ctx.fillStyle = colors.text;
      ctx.fillText('Posterior P(H|E)', bx2 + 5, by2 + 22);
      ctx.fillStyle = colors.primary;
      ctx.fillText((pHE * 100).toFixed(1) + '%', bx2 + 25, by2 - hPost - 8);

      // Arrow from Prior to Posterior representing Bayesian shift
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx1 + bw + 20, by1 - maxH / 2);
      ctx.lineTo(bx2 - 20, by1 - maxH / 2);
      ctx.stroke();

      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.moveTo(bx2 - 20, by1 - maxH / 2);
      ctx.lineTo(bx2 - 30, by1 - maxH / 2 - 6);
      ctx.lineTo(bx2 - 30, by1 - maxH / 2 + 6);
      ctx.fill();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('New Evidence E', (bx1 + bx2) / 2 - 20, by1 - maxH / 2 - 12);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Rational Belief Shift', (bx1 + bx2) / 2 - 30, by1 - maxH / 2 + 18);
    }

    priorSlider.addEventListener('input', render);
    pehSlider.addEventListener('input', render);
    penothSlider.addEventListener('input', render);

    render();
  };

  // =========================================================================
  // Figure 12.7: The Replication Crisis, Statistical Power, and Publication Bias
  // =========================================================================
  FIG['fig-replication-meta'] = function (container) {
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
      '<strong>Sample Size ($N$):</strong>' +
      '<input type="range" id="rep-n" min="20" max="300" step="20" value="60" style="width:100px;">' +
      '<span id="rep-n-val">N = 60</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<input type="checkbox" id="rep-bias" checked>' +
      '<span>Simulate Publication Bias (File-Drawer Effect)</span>' +
      '</label>' +
      '<button id="rep-run-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Run 40 Studies</button>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var stats = document.createElement('div');
    stats.style.display = 'flex';
    stats.style.justifyContent = 'space-around';
    stats.style.fontSize = '0.85rem';
    stats.style.padding = '8px';
    stats.style.background = 'var(--color-bg, #fff)';
    stats.style.borderRadius = '4px';
    stats.style.border = '1px solid var(--color-border, #eee)';

    stats.innerHTML =
      '<div><strong>Statistically Significant ($p < 0.05$):</strong> <span id="rep-sig-disp" style="font-weight:bold; color:var(--color-primary, #2160c4);">0</span></div>' +
      '<div><strong>Non-Significant (Filed Away):</strong> <span id="rep-null-disp" style="font-weight:bold; color:var(--color-muted, #666);">0</span></div>' +
      '<div><strong>Replication Success Rate:</strong> <span id="rep-rate-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">~45%</span></div>';

    wrapper.appendChild(stats);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var nSlider = ctrlRow.querySelector('#rep-n');
    var nVal = ctrlRow.querySelector('#rep-n-val');
    var biasCheck = ctrlRow.querySelector('#rep-bias');
    var runBtn = ctrlRow.querySelector('#rep-run-btn');

    var sigDisp = stats.querySelector('#rep-sig-disp');
    var nullDisp = stats.querySelector('#rep-null-disp');
    var rateDisp = stats.querySelector('#rep-rate-disp');

    var simulatedStudies = [];

    function generateStudies() {
      simulatedStudies = [];
      var N = parseInt(nSlider.value, 10);
      var bias = biasCheck.checked;
      var trueEffect = 0.20; // small true effect
      var se = 1.0 / Math.sqrt(N);

      var sigCount = 0;
      var nullCount = 0;

      for (var s = 0; s < 40; s++) {
        // Sample observed effect d ~ Normal(trueEffect, se)
        var randNorm = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.732;
        var dObs = trueEffect + randNorm * se;
        var pVal = 2 * (1 - normalCDF(Math.abs(dObs) / se));
        var isSig = (pVal < 0.05);

        if (isSig) sigCount++;
        else nullCount++;

        // If file drawer bias, hide non-sig studies partially
        simulatedStudies.push({
          id: s + 1,
          d: dObs,
          se: se,
          p: pVal,
          sig: isSig,
          published: bias ? isSig : true
        });
      }

      sigDisp.textContent = sigCount + ' / 40';
      nullDisp.textContent = nullCount + ' / 40';
      var replRate = Math.round((sigCount / 40) * 100);
      rateDisp.textContent = replRate + '% (' + (replRate < 60 ? 'Replication Crisis Risk' : 'Robust Replication') + ')';
      render();
    }

    function normalCDF(x) {
      // standard normal CDF approximation
      var t = 1 / (1 + 0.2316419 * Math.abs(x));
      var d = 0.3989423 * Math.exp(-x * x / 2);
      var prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - prob : prob;
    }

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Forest Plot: 40 simulated studies
      var ox = 280, oy = 30, plotH = 270;

      // Vertical line of zero effect (d = 0)
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.fillText('d = 0 (Null)', ox - 20, oy + plotH + 16);

      // Vertical line of True Effect (d = 0.20)
      var trueX = ox + 0.20 * 300;
      ctx.strokeStyle = colors.success;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(trueX, oy);
      ctx.lineTo(trueX, oy + plotH);
      ctx.stroke();
      ctx.fillStyle = colors.success;
      ctx.fillText('True Effect (d = 0.20)', trueX - 45, oy - 10);

      // Draw study point estimates and 95% confidence intervals
      var rowH = plotH / (simulatedStudies.length || 1);

      simulatedStudies.forEach(function (st, idx) {
        var sy = oy + idx * rowH + 4;
        var sx = ox + st.d * 300;
        var ciW = 1.96 * st.se * 300;

        if (!st.published) {
          // Greyed out / ghosted in file drawer
          ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx - ciW, sy);
          ctx.lineTo(sx + ciW, sy);
          ctx.stroke();
          ctx.fillStyle = isDark() ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        } else {
          // Published study
          ctx.strokeStyle = st.sig ? colors.primary : colors.muted;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx - ciW, sy);
          ctx.lineTo(sx + ciW, sy);
          ctx.stroke();

          ctx.fillStyle = st.sig ? colors.primary : colors.muted;
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Side annotations
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Simulated Forest Plot', 30, 60);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Small sample sizes (low power) +', 30, 85);
      ctx.fillText('publication bias distort scientific', 30, 102);
      ctx.fillText('meta-analyses toward false positives.', 30, 119);
      ctx.fillText('Remedy: Pre-registration & Open Science.', 30, 145);
    }

    nSlider.addEventListener('input', function () {
      nVal.textContent = 'N = ' + nSlider.value;
      generateStudies();
    });

    biasCheck.addEventListener('change', generateStudies);
    runBtn.addEventListener('click', generateStudies);

    generateStudies();
  };

  // =========================================================================
  // Figure 12.8: Final Comprehensive Diagnostic Evaluation Quiz (Part 12)
  // =========================================================================
  FIG['fig-quiz-part12'] = function (container) {
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
        q: '1. Why did David Hume argue that inductive reasoning cannot be justified through purely logical demonstration?',
        options: [
          'Because human senses are fundamentally deceitful.',
          'Because nature operates by random supernatural intervention.',
          'Because any inductive justification of induction (assuming the future will resemble the past because it has in the past) is a circular argument (begging the question).',
          'Because mathematics cannot calculate probabilities.'
        ],
        answer: 2,
        expl: 'Hume demonstrated that justifying induction by appealing to its past success is a circular argument: it assumes the very principle of the uniformity of nature that it attempts to prove.'
      },
      {
        q: '2. According to Karl Popper’s criterion of demarcation, what distinguishes genuine empirical science from pseudoscience and metaphysics?',
        options: [
          'Scientific theories can be proven absolutely true beyond all doubt.',
          'Scientific theories are published in peer-reviewed journals.',
          'Scientific theories are derived directly from unbiased sensory observation.',
          'Scientific theories make precise, testable predictions that are open to potential empirical falsification.'
        ],
        answer: 3,
        expl: 'Popper argued that a theory is scientific if and only if it takes risks: it must specify in advance which empirical observations, if discovered, would refute it. Irrefutable theories are metaphysical or pseudoscientific.'
      },
      {
        q: '3. In Thomas Kuhn’s model, what characterizes the period of "Normal Science"?',
        options: [
          'Conservative "puzzle-solving" within the framework of an accepted paradigm, refining measurements without questioning the paradigm itself.',
          'Constant radical overthrow of core foundational assumptions.',
          'Scientists engaging in philosophical debates about reality.',
          'Total chaos without any shared consensus.'
        ],
        answer: 0,
        expl: 'Normal science is conservative research firmly based on past achievements: scientists take the paradigm for granted, solving specialized puzzles and fitting nature into the paradigm’s conceptual boxes.'
      },
      {
        q: '4. What did Thomas Kuhn mean by the claim that rival scientific paradigms are "incommensurable"?',
        options: [
          'Scientific equations cannot be converted into metric units.',
          'Older scientists always refuse to speak to younger scientists.',
          'Scientific paradigms can only be described in natural language.',
          'Proponents of competing paradigms share no neutral, theory-independent observation language and disagree on standards, meanings, and evidence, making direct objective comparison impossible.'
        ],
        answer: 3,
        expl: 'Incommensurability means that because words and observations change meaning across paradigms (e.g., "mass" in Newton vs. Einstein), there is no neutral meta-language to judge them without bias.'
      },
      {
        q: '5. In Imre Lakatos’s Methodology of Scientific Research Programmes, what is the role of the "Protective Belt"?',
        options: [
          'It is a legal copyright protecting scientific patents.',
          'It consists of auxiliary hypotheses, observational assumptions, and initial conditions that absorb the shock of anomalies, protecting the core theory from immediate falsification.',
          'It is the lead shielding around particle accelerators.',
          'It prevents non-scientists from reading technical journals.'
        ],
        answer: 1,
        expl: 'Lakatos showed that scientists do not abandon a core theory when an anomaly appears; they modify auxiliary hypotheses in the protective belt, keeping the programme progressive as long as it predicts novel facts.'
      },
      {
        q: '6. What radical epistemological thesis did Paul Feyerabend defend in his 1975 book "Against Method"?',
        options: [
          'Science is the only valid source of truth in the universe.',
          'There is no universal, ahistorical "scientific method"; any methodological rule has been violated by great scientists to make progress, summarized by the slogan "anything goes."',
          'Mathematics should be banned from physics.',
          'Experiments are useless compared to pure philosophical meditation.'
        ],
        answer: 1,
        expl: 'Feyerabend argued for epistemological anarchism: historical advances (such as Galileo’s defence of Copernicus) succeeded by violating standard rules of logic and evidence. Imposing a rigid method damages creativity.'
      },
      {
        q: '7. The Duhem-Quine Thesis ("Holism") demonstrates that:',
        options: [
          'All scientific equations must be balanced symmetrically.',
          'Observation is completely independent of theoretical beliefs.',
          'Single experiments can definitively settle all scientific disputes.',
          'An experimental test never tests a theoretical hypothesis in isolation, but always an interconnected web of core theories, auxiliary assumptions, and instrument calibrations.'
        ],
        answer: 3,
        expl: 'Pierre Duhem and W. V. O. Quine showed that when an experiment contradicts a prediction, logic cannot tell you which premise in the web failed: the core theory, the telescope optics, or the atmospheric model.'
      },
      {
        q: '8. How does Bayesian confirmation theory view the relationship between evidence and scientific hypotheses?',
        options: [
          'Evidence shifts the subjective degree of rational belief (probability $P(H)$) according to Bayes’ rule: $P(H|E) = \\frac{P(E|H) P(H)}{P(E)}$.',
          'Theories are either 100% verified or 100% falsified.',
          'Probabilities apply only to rolling dice, never to physical laws.',
          'Evidence has no effect on belief.'
        ],
        answer: 0,
        expl: 'Bayesianism models scientific learning as rational probabilistic updating: new evidence incrementally raises or lowers the posterior confidence in a hypothesis based on its prior likelihood and diagnostic power.'
      },
      {
        q: '9. What is the "Pessimistic Meta-Induction" against scientific realism (formulated by Larry Laudan)?',
        options: [
          'Scientists are too pessimistic about funding.',
          'Human technology is declining over historical epochs.',
          'Because the vast majority of past successful scientific theories (caloric, phlogiston, luminiferous ether) turned out to be false, we have strong inductive reason to expect our current successful theories will also be proven false.',
          'Computers will replace human scientists.'
        ],
        answer: 2,
        expl: 'The pessimistic meta-induction challenges scientific realism by observing that the history of science is a graveyard of empirically successful theories whose central theoretical entities were later rejected as non-existent.'
      },
      {
        q: '10. What is the primary cause of the contemporary "Replication Crisis" in empirical science?',
        options: [
          'Scientists no longer have access to computers.',
          'Mathematical formulas are too complicated.',
          'A combination of low statistical power (small sample sizes), p-hacking, and publication bias (the "file-drawer effect" where negative null results remain unpublished).',
          'The speed of light is changing over time.'
        ],
        answer: 2,
        expl: 'The replication crisis exposed systemic incentives: pressure to publish surprising positive results led to publication bias and p-hacking of underpowered studies, solved today by pre-registration and Open Science.'
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
            scoreBanner.innerHTML = 'Series Evaluation Complete! Final Score: <span style="color:var(--color-primary, #2160c4);">' +
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
