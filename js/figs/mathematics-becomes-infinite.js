/**
 * Interactive Figures for Part 11: Mathematics Becomes Infinite
 * Topics: Calculus, Limits, Epsilon-Delta, Non-Euclidean Geometry, Cantor Transfinite Sets, Turing Machine
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
  // Figure 11.1: Secant to Tangent Limit in Calculus (df/dx = lim Δx->0 Δy/Δx)
  // =========================================================================
  FIG['fig-calculus-limit'] = function (container) {
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
      '<strong>Gap between the two points:</strong>' +
      '<input type="range" id="calc-dx" min="0.02" max="1.50" step="0.02" value="0.80" style="width:130px;">' +
      '<span id="calc-dx-val">0.80</span>' +
      '</label>' +
      '<button id="calc-zero-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Shrink the gap</button>' +
      '<span id="calc-slope-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">Secant Slope: 0.00</span>';

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
      '<div><strong>Curve:</strong> <span>$f(x) = x^3 - 2x$</span> at $x_0 = 1.0$</div>' +
      '<div><strong>Slope of the line through two points:</strong> <span id="sec-slope-val" style="font-weight:bold;">1.84</span></div>' +
      '<div><strong>Slope at the point itself:</strong> <span style="font-weight:bold; color:var(--color-primary, #2160c4);">1.000</span></div>' +
      '<div><strong>Berkeley’s worry:</strong> <span>can the gap be zero and not zero?</span></div>';
    wrapper.appendChild(readouts);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var dxSlider = ctrlRow.querySelector('#calc-dx');
    var dxVal = ctrlRow.querySelector('#calc-dx-val');
    var zeroBtn = ctrlRow.querySelector('#calc-zero-btn');
    var slopeDisp = ctrlRow.querySelector('#calc-slope-disp');
    var secSlopeVal = readouts.querySelector('#sec-slope-val');

    // Function f(x) = x^3 - 2x at x0 = 1.0
    var x0 = 1.0;
    function f(x) {
      return x * x * x - 2 * x;
    }
    function fPrime(x) {
      return 3 * x * x - 2;
    }

    function render() {
      var colors = getThemeColors();
      var dx = parseFloat(dxSlider.value);
      dxVal.textContent = dx.toFixed(2);

      var y0 = f(x0);
      var x1 = x0 + dx;
      var y1 = f(x1);
      var secantSlope = (y1 - y0) / dx;
      var trueSlope = fPrime(x0);

      slopeDisp.textContent = 'Slope: ' + secantSlope.toFixed(3);
      secSlopeVal.textContent = secantSlope.toFixed(3);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Coordinate mapping: x in [-1.5, 2.5], y in [-2.5, 3.5]
      var ox = 260, oy = 210, scaleX = 140, scaleY = 48;

      function toScreen(x, y) {
        return {
          x: ox + x * scaleX,
          y: oy - y * scaleY
        };
      }

      // Draw Axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, oy);
      ctx.lineTo(690, oy); // x axis
      ctx.moveTo(ox, 20);
      ctx.lineTo(ox, 320); // y axis
      ctx.stroke();

      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      ctx.fillText('x', 680, oy + 16);
      ctx.fillText('y', ox + 8, 30);

      // Plot curve f(x) = x^3 - 2x
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var cx = -1.6; cx <= 2.2; cx += 0.02) {
        var p = toScreen(cx, f(cx));
        if (cx === -1.6) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Tangent line at x0 (true derivative slope = 1.0)
      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      var tanP1 = toScreen(-0.5, y0 + trueSlope * (-0.5 - x0));
      var tanP2 = toScreen(2.2, y0 + trueSlope * (2.2 - x0));
      ctx.beginPath();
      ctx.moveTo(tanP1.x, tanP1.y);
      ctx.lineTo(tanP2.x, tanP2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Secant line through P(x0, y0) and Q(x0+dx, y1)
      var secP1 = toScreen(-0.5, y0 + secantSlope * (-0.5 - x0));
      var secP2 = toScreen(2.3, y0 + secantSlope * (2.3 - x0));
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(secP1.x, secP1.y);
      ctx.lineTo(secP2.x, secP2.y);
      ctx.stroke();

      // Points P and Q
      var ptP = toScreen(x0, y0);
      var ptQ = toScreen(x1, y1);

      // Delta x and Delta y triangle
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ptP.x, ptP.y);
      ctx.lineTo(ptQ.x, ptP.y); // horizontal dx
      ctx.lineTo(ptQ.x, ptQ.y); // vertical dy
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Δx', (ptP.x + ptQ.x) / 2 - 8, ptP.y + 14);
      ctx.fillText('Δy', ptQ.x + 8, (ptP.y + ptQ.y) / 2 + 4);

      // Point P
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(ptP.x, ptP.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('P (x₀, f(x₀))', ptP.x - 65, ptP.y - 10);

      // Point Q
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.arc(ptQ.x, ptQ.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('Q (x₀+Δx, f(x₀+Δx))', ptQ.x + 8, ptQ.y - 8);

      // Legend in top-left corner
      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Red: line through P and Q', 40, 40);
      ctx.fillStyle = colors.muted;
      ctx.fillText('Dashed: slope at P itself = 1.000', 40, 60);
    }

    dxSlider.addEventListener('input', render);

    zeroBtn.addEventListener('click', function () {
      function animZero() {
        var cur = parseFloat(dxSlider.value);
        if (cur > 0.04) {
          dxSlider.value = (cur * 0.92).toFixed(3);
          render();
          requestAnimationFrame(animZero);
        } else {
          dxSlider.value = '0.02';
          render();
        }
      }
      animZero();
    });

    render();
  };

  // =========================================================================
  // Figure 11.2: Weierstrassian Epsilon-Delta Definition of Limits & Continuity
  // =========================================================================
  FIG['fig-epsilon-delta'] = function (container) {
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
      '<strong>Margin of error, epsilon:</strong>' +
      '<input type="range" id="ed-eps" min="0.2" max="1.2" step="0.05" value="0.6" style="width:110px;">' +
      '<span id="ed-eps-val">0.60</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Your distance, delta:</strong>' +
      '<input type="range" id="ed-del" min="0.05" max="0.8" step="0.02" value="0.25" style="width:110px;">' +
      '<span id="ed-del-val">0.25</span>' +
      '</label>' +
      '<span id="ed-status-badge" style="font-weight:bold; padding:3px 8px; border-radius:4px;">Checking...</span>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var explBox = document.createElement('div');
    explBox.style.fontSize = '0.85rem';
    explBox.style.color = 'var(--color-text-muted, #666)';
    explBox.innerHTML = '<strong>The game:</strong> your opponent picks a margin of error (epsilon, the height of the band). You must choose a distance (delta, the width of the box) so that the curve stays inside the band everywhere within that distance. If you can always win, however thin the band, the limit is real.';
    wrapper.appendChild(explBox);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var epsSlider = ctrlRow.querySelector('#ed-eps');
    var delSlider = ctrlRow.querySelector('#ed-del');
    var epsVal = ctrlRow.querySelector('#ed-eps-val');
    var delVal = ctrlRow.querySelector('#ed-del-val');
    var badge = ctrlRow.querySelector('#ed-status-badge');

    // Function f(x) = x^2 at x0 = 1.5, L = 2.25
    var x0 = 1.5;
    var L = 2.25;
    function f(x) { return x * x; }

    function render() {
      var colors = getThemeColors();
      var eps = parseFloat(epsSlider.value);
      var del = parseFloat(delSlider.value);

      epsVal.textContent = eps.toFixed(2);
      delVal.textContent = del.toFixed(2);

      // Check if for all x in (x0 - del, x0 + del), f(x) is within (L - eps, L + eps)
      var maxF = f(x0 + del);
      var minF = f(x0 - del);
      var isValid = (maxF <= L + eps + 1e-4) && (minF >= L - eps - 1e-4);

      if (isValid) {
        badge.textContent = 'You win: the curve stays inside the band';
        badge.style.background = isDark() ? '#14532d' : '#dcfce7';
        badge.style.color = '#16a34a';
      } else {
        badge.textContent = 'Not yet: the curve leaves the band. Make delta smaller';
        badge.style.background = isDark() ? '#7f1d1d' : '#fee2e2';
        badge.style.color = '#dc2626';
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Coordinates: x in [0.5, 2.5], y in [0.0, 5.0]
      var ox = 140, oy = 290, pw = 500, ph = 240;

      function toScreen(x, y) {
        return {
          x: ox + ((x - 0.5) / 2.0) * pw,
          y: oy - (y / 5.0) * ph
        };
      }

      // Draw Epsilon horizontal band (L - eps to L + eps)
      var yEpsTop = toScreen(0, L + eps).y;
      var yEpsBot = toScreen(0, L - eps).y;

      ctx.fillStyle = isDark() ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
      ctx.fillRect(ox, yEpsTop, pw, yEpsBot - yEpsTop);

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, yEpsTop); ctx.lineTo(ox + pw, yEpsTop);
      ctx.moveTo(ox, yEpsBot); ctx.lineTo(ox + pw, yEpsBot);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Delta vertical band (x0 - del to x0 + del)
      var xDelLeft = toScreen(x0 - del, 0).x;
      var xDelRight = toScreen(x0 + del, 0).x;

      ctx.fillStyle = isValid
        ? (isDark() ? 'rgba(74, 222, 128, 0.15)' : 'rgba(22, 163, 74, 0.12)')
        : (isDark() ? 'rgba(248, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.12)');
      ctx.fillRect(xDelLeft, oy - ph, xDelRight - xDelLeft, ph);

      ctx.strokeStyle = isValid ? colors.success : colors.hot;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xDelLeft, oy); ctx.lineTo(xDelLeft, oy - ph);
      ctx.moveTo(xDelRight, oy); ctx.lineTo(xDelRight, oy - ph);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy); ctx.lineTo(ox + pw, oy);
      ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - ph);
      ctx.stroke();

      // Curve f(x) = x^2
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var cx = 0.5; cx <= 2.3; cx += 0.02) {
        var pt = toScreen(cx, f(cx));
        if (cx === 0.5) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Point (x0, L)
      var pt0 = toScreen(x0, L);
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(pt0.x, pt0.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Labels on axes
      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      ctx.fillText('L = 2.25', ox - 55, pt0.y + 4);
      ctx.fillStyle = colors.accent;
      ctx.fillText('L + ε', ox - 40, yEpsTop + 4);
      ctx.fillText('L - ε', ox - 40, yEpsBot + 4);

      ctx.fillStyle = colors.text;
      ctx.fillText('x₀ = 1.5', pt0.x - 18, oy + 16);
      ctx.fillStyle = isValid ? colors.success : colors.hot;
      ctx.fillText('x₀-δ', xDelLeft - 12, oy + 16);
      ctx.fillText('x₀+δ', xDelRight - 12, oy + 16);

      // Challenge annotation
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Function f(x) = x²', ox + 20, 35);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Keep the curve inside the band within the shaded box', ox + 20, 52);
    }

    epsSlider.addEventListener('input', render);
    delSlider.addEventListener('input', render);
    render();
  };

  // =========================================================================
  // Figure 11.3: Non-Euclidean Geometries (Euclidean vs Hyperbolic vs Spherical)
  // =========================================================================
  FIG['fig-non-euclidean-geometry'] = function (container) {
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
      '<strong>Choose a geometry:</strong>' +
      '<select id="geom-type" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); font-weight:bold;">' +
      '<option value="hyperbolic">Hyperbolic (Lobachevsky/Bolyai, K < 0)</option>' +
      '<option value="euclidean">Euclidean Flat (Parallels = 1, K = 0)</option>' +
      '<option value="spherical">Elliptic / Spherical (Riemann, K > 0)</option>' +
      '</select>' +
      '</label>';

    wrapper.appendChild(ctrlRow);

    var canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 340;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '6px';
    wrapper.appendChild(canvas);

    var metrics = document.createElement('div');
    metrics.style.display = 'flex';
    metrics.style.justifyContent = 'space-around';
    metrics.style.fontSize = '0.85rem';
    metrics.style.padding = '8px';
    metrics.style.background = 'var(--color-bg, #fff)';
    metrics.style.borderRadius = '4px';
    metrics.style.border = '1px solid var(--color-border, #eee)';

    metrics.innerHTML =
      '<div><strong>Curvature:</strong> <span id="geom-k" style="font-weight:bold;">Negative (saddle)</span></div>' +
      '<div><strong>Parallel lines through a point:</strong> <span id="geom-par" style="font-weight:bold; color:var(--color-hot, #dc2626);">Infinitely many</span></div>' +
      '<div><strong>Angles of a triangle add up to:</strong> <span id="geom-sum" style="font-weight:bold; color:var(--color-primary, #2160c4);">< 180°</span></div>';

    wrapper.appendChild(metrics);
    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var geomSelect = ctrlRow.querySelector('#geom-type');
    var kDisp = metrics.querySelector('#geom-k');
    var parDisp = metrics.querySelector('#geom-par');
    var sumDisp = metrics.querySelector('#geom-sum');

    function render() {
      var colors = getThemeColors();
      var type = geomSelect.value;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (type === 'hyperbolic') {
        kDisp.textContent = 'Negative (saddle-shaped)';
        parDisp.textContent = 'Infinitely many';
        sumDisp.textContent = 'Less than 180°';

        // Poincaré Disk Model
        var cx = 360, cy = 170, R = 135;

        // Disk boundary
        ctx.fillStyle = isDark() ? '#27272a' : '#f4f4f5';
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Base geodesic line (circular arc orthogonal to boundary)
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx - 100, cy, 168, -0.65, 0.65, false);
        ctx.stroke();

        // External point P
        var px = cx + 30, py = cy - 25;
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Point P', px + 10, py - 4);

        // Multiple non-intersecting parallel geodesics through point P
        ctx.strokeStyle = isDark() ? 'rgba(248, 113, 113, 0.7)' : 'rgba(220, 38, 38, 0.65)';
        ctx.lineWidth = 2;
        [-40, -10, 20, 50].forEach(function (off) {
          ctx.beginPath();
          ctx.arc(cx + off, cy - 80, 110, 0.4, 2.7, false);
          ctx.stroke();
        });

        // Hyperbolic triangle with curved sides
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // 3 circular arc geodesics forming triangle
        ctx.moveTo(cx - 50, cy + 40);
        ctx.quadraticCurveTo(cx - 10, cy + 70, cx + 40, cy + 50);
        ctx.quadraticCurveTo(cx + 10, cy, cx, cy - 50);
        ctx.quadraticCurveTo(cx - 30, cy, cx - 50, cy + 40);
        ctx.fillStyle = isDark() ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Hyperbolic Triangle: α+β+γ < 180°', cx - 90, cy + 100);

      } else if (type === 'euclidean') {
        kDisp.textContent = 'Zero (flat)';
        parDisp.textContent = 'Exactly one (Euclid)';
        sumDisp.textContent = 'Exactly 180°';

        // Flat plane grid
        var ox = 180, oy = 60, pw = 360, ph = 220;
        ctx.fillStyle = colors.panelBg;
        ctx.fillRect(ox, oy, pw, ph);
        ctx.strokeStyle = colors.border;
        ctx.strokeRect(ox, oy, pw, ph);

        // Base line L
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ox + 30, oy + 160);
        ctx.lineTo(ox + pw - 30, oy + 160);
        ctx.stroke();
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Line L', ox + pw - 20, oy + 165);

        // Point P
        var px2 = ox + pw / 2, py2 = oy + 70;
        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(px2, py2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.text;
        ctx.fillText('Point P', px2 + 10, py2 - 6);

        // Exactly ONE parallel line through P
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ox + 30, py2);
        ctx.lineTo(ox + pw - 30, py2);
        ctx.stroke();

        // Euclidean triangle
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ox + 70, oy + 140);
        ctx.lineTo(ox + 160, oy + 40);
        ctx.lineTo(ox + 190, oy + 140);
        ctx.closePath();
        ctx.fillStyle = isDark() ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Euclidean Triangle: α+β+γ = 180°', ox + 40, oy + 200);

      } else { // spherical
        kDisp.textContent = 'Positive (like a ball)';
        parDisp.textContent = 'None: all great circles meet';
        sumDisp.textContent = 'More than 180°';

        // 3D Sphere projection
        var scx = 360, scy = 170, sR = 120;
        ctx.fillStyle = isDark() ? '#1e293b' : '#f1f5f9';
        ctx.beginPath();
        ctx.arc(scx, scy, sR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Equator ellipse
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(scx, scy, sR, sR * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Spherical Triangle with 3 right angles (Sum = 270 degrees!)
        // Vertex 1: North pole (scx, scy - sR)
        // Vertex 2: Equator at 0 deg (scx + sR, scy)
        // Vertex 3: Equator at 90 deg (scx, scy + sR * 0.35)
        ctx.strokeStyle = colors.hot;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Meridian 1: North pole down to (scx, scy + sR * 0.35)
        ctx.moveTo(scx, scy - sR);
        ctx.lineTo(scx, scy + sR * 0.35);
        // Equator segment: to (scx + sR, scy)
        ctx.ellipse(scx, scy, sR, sR * 0.35, 0, 0, Math.PI / 2, true);
        // Meridian 2: from (scx + sR, scy) back to North pole
        ctx.arc(scx, scy, sR, 0, -Math.PI / 2, true);
        ctx.fillStyle = isDark() ? 'rgba(248, 113, 113, 0.2)' : 'rgba(220, 38, 38, 0.15)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.hot;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Tri-Rectangular Triangle: 90°+90°+90° = 270°', scx - 110, scy + sR + 25);
      }
    }

    geomSelect.addEventListener('change', render);
    render();
  };

  // =========================================================================
  // Figure 11.4: Parallel Transport, Curvature, and Holonomy
  // =========================================================================
  FIG['fig-riemann-curvature'] = function (container) {
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
      '<button id="holo-step-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer; font-weight:bold;">Step Vector Along Triangle</button>' +
      '<button id="holo-reset-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reset to North Pole</button>' +
      '<span id="holo-angle-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">Holonomy Deflection: 0°</span>';

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
    expl.innerHTML = '<strong>What to notice:</strong> walk an arrow round a loop, never turning it. On a flat sheet it comes back pointing the same way. On a sphere it comes back turned, and the more curved the surface inside the loop, the more it turns. That is how a creature living on the surface could detect the curvature.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var stepBtn = ctrlRow.querySelector('#holo-step-btn');
    var resetBtn = ctrlRow.querySelector('#holo-reset-btn');
    var angleDisp = ctrlRow.querySelector('#holo-angle-disp');

    var currentStep = 0; // 0 = North pole, 1 = Equator prime, 2 = Equator 90 deg, 3 = Return to North pole

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var cx = 360, cy = 170, R = 125;

      // Sphere base
      ctx.fillStyle = isDark() ? '#1e293b' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Equator
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Triangle vertices:
      // A (North Pole): (cx, cy - R)
      // B (Equator 0 deg): (cx, cy + R * 0.35)
      // C (Equator 90 deg): (cx + R, cy)
      var ptA = { x: cx, y: cy - R };
      var ptB = { x: cx, y: cy + R * 0.35 };
      var ptC = { x: cx + R, y: cy };

      // Geodesic path: A -> B -> C -> A
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      // Leg 1: A -> B
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.stroke();

      // Leg 2: B -> C (along equator arc)
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.35, 0, Math.PI / 2, 0, true);
      ctx.stroke();

      // Leg 3: C -> A
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, -Math.PI / 2, true);
      ctx.stroke();

      // Vector properties at each stage
      var vecPos, vecAngle, vecLabel;
      if (currentStep === 0) {
        vecPos = ptA;
        vecAngle = Math.PI / 2; // pointing down along meridian AB
        vecLabel = 'Stage 0: Vector at North Pole, pointing South';
        angleDisp.textContent = 'Arrow turned by: 0°';
      } else if (currentStep === 1) {
        vecPos = ptB;
        vecAngle = Math.PI / 2; // still pointing down (parallel transport along meridian)
        vecLabel = 'Stage 1: Arrived at Equator without turning (angle preserved)';
        angleDisp.textContent = 'Walking from A to B: arrow not turned';
      } else if (currentStep === 2) {
        vecPos = ptC;
        vecAngle = Math.PI / 2; // still pointing South (perpendicular to equator BC)
        vecLabel = 'Stage 2: Slide along Equator to 90° East';
        angleDisp.textContent = 'Walking from B to C: arrow still points south';
      } else { // 3: Return to North Pole
        vecPos = ptA;
        vecAngle = 0; // pointing East! Rotated by 90 degrees!
        vecLabel = 'Stage 3: Returned to North Pole! Deflected by 90°!';
        angleDisp.textContent = 'Back at the start: the arrow has turned 90°';
      }

      // Draw the transported tangent vector (Arrow)
      var vecLen = 42;
      var vx = vecPos.x + Math.cos(vecAngle) * vecLen;
      var vy = vecPos.y + Math.sin(vecAngle) * vecLen;

      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(vecPos.x, vecPos.y);
      ctx.lineTo(vx, vy);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      var headAng = vecAngle;
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx - 10 * Math.cos(headAng - 0.4), vy - 10 * Math.sin(headAng - 0.4));
      ctx.lineTo(vx - 10 * Math.cos(headAng + 0.4), vy - 10 * Math.sin(headAng + 0.4));
      ctx.fill();

      // Vertex base circles
      [ptA, ptB, ptC].forEach(function (pt) {
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stage description
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(vecLabel, 160, 35);
    }

    stepBtn.addEventListener('click', function () {
      currentStep = (currentStep + 1) % 4;
      render();
    });

    resetBtn.addEventListener('click', function () {
      currentStep = 0;
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 11.5: Cantor's Diagonal Pairing for Rational Numbers (|Q| = ℵ₀)
  // =========================================================================
  FIG['fig-cantor-pairing'] = function (container) {
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
      '<strong>How many fractions counted:</strong>' +
      '<input type="range" id="pair-n" min="1" max="25" step="1" value="12" style="width:120px;">' +
      '<span id="pair-n-val">N = 12</span>' +
      '</label>' +
      '<button id="pair-step-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Next Fraction</button>' +
      '<span id="pair-cur-frac" style="font-weight:bold; color:var(--color-hot, #dc2626);">Fraction: 2/3</span>';

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
    expl.innerHTML = '<strong>The idea:</strong> zigzag through the grid of fractions (top number across, bottom number down), giving each fraction the next counting number. Every fraction is reached sooner or later, so there are exactly as many fractions as counting numbers.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var nSlider = ctrlRow.querySelector('#pair-n');
    var nVal = ctrlRow.querySelector('#pair-n-val');
    var stepBtn = ctrlRow.querySelector('#pair-step-btn');
    var curFracDisp = ctrlRow.querySelector('#pair-cur-frac');

    // Generate ordered Cantor zig-zag sequence
    var sequence = [];
    for (var sum = 2; sum <= 12; sum++) {
      for (var p = 1; p < sum; p++) {
        var q = sum - p;
        sequence.push({ p: p, q: q });
      }
    }

    function render() {
      var colors = getThemeColors();
      var maxIdx = parseInt(nSlider.value, 10);
      nVal.textContent = 'N = ' + maxIdx;

      var curItem = sequence[maxIdx - 1];
      curFracDisp.textContent = 'Fraction number ' + maxIdx + ' is ' + curItem.p + '/' + curItem.q;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid of p (rows 1..5) and q (columns 1..5)
      var startX = 140, startY = 70, cellW = 85, cellH = 50;

      // Axis labels
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Denominator q →', startX + 160, startY - 35);
      ctx.save();
      ctx.translate(startX - 45, startY + 120);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Numerator p ↓', 0, 0);
      ctx.restore();

      // Column headers (q = 1..5)
      ctx.fillStyle = colors.muted;
      ctx.font = '11px sans-serif';
      for (var col = 1; col <= 5; col++) {
        ctx.fillText('q=' + col, startX + (col - 1) * cellW + 30, startY - 12);
      }
      // Row headers (p = 1..5)
      for (var row = 1; row <= 5; row++) {
        ctx.fillText('p=' + row, startX - 35, startY + (row - 1) * cellH + 30);
      }

      // Draw grid cells with fractions
      for (var r = 1; r <= 5; r++) {
        for (var c = 1; c <= 5; c++) {
          var x = startX + (c - 1) * cellW;
          var y = startY + (r - 1) * cellH;

          ctx.fillStyle = colors.panelBg;
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 1;
          ctx.fillRect(x, y, cellW - 6, cellH - 6);
          ctx.strokeRect(x, y, cellW - 6, cellH - 6);

          ctx.fillStyle = colors.text;
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(r + '/' + c, x + 28, y + 28);
        }
      }

      // Draw zigzag enumeration path up to maxIdx
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var s = 0; s < maxIdx; s++) {
        var it = sequence[s];
        if (it.p <= 5 && it.q <= 5) {
          var px = startX + (it.q - 1) * cellW + (cellW - 6) / 2;
          var py = startY + (it.p - 1) * cellH + (cellH - 6) / 2;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Highlight active node
      if (curItem.p <= 5 && curItem.q <= 5) {
        var hx = startX + (curItem.q - 1) * cellW + (cellW - 6) / 2;
        var hy = startY + (curItem.p - 1) * cellH + (cellH - 6) / 2;

        ctx.fillStyle = colors.hot;
        ctx.beginPath();
        ctx.arc(hx, hy, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(maxIdx, hx - 5, hy + 3);
      }

      // Cardinality equality banner
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Bijection: f : ℕ → ℚ⁺ proves |ℚ| = ℵ₀ (Countable)', startX + 70, startY + 5 * cellH + 20);
    }

    nSlider.addEventListener('input', render);
    stepBtn.addEventListener('click', function () {
      var cur = parseInt(nSlider.value, 10);
      if (cur < 25) nSlider.value = cur + 1;
      else nSlider.value = 1;
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 11.6: Cantor's Diagonalization Argument (|R| > ℵ₀, Uncountable)
  // =========================================================================
  FIG['fig-cantor-diagonal'] = function (container) {
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
      '<button id="diag-flip-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-hot, #dc2626); color:#fff; cursor:pointer; font-weight:bold;">Construct Diagonal Number D</button>' +
      '<button id="diag-shuffle-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Shuffle List</button>' +
      '<span id="diag-result-num" style="font-weight:bold; color:var(--color-primary, #2160c4);">D = 0. ? ? ? ? ? ?</span>';

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
    expl.innerHTML = '<strong>The idea:</strong> build a new number D by changing every digit on the diagonal. D differs from the 1st number in its 1st digit, from the 2nd in its 2nd digit, and so on, so it can\'t be anywhere on the list. No list of decimals can ever be complete.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var flipBtn = ctrlRow.querySelector('#diag-flip-btn');
    var shuffleBtn = ctrlRow.querySelector('#diag-shuffle-btn');
    var resultNumDisp = ctrlRow.querySelector('#diag-result-num');

    var listRows = [
      [3, 1, 4, 1, 5, 9, 2],
      [7, 8, 2, 5, 0, 1, 8],
      [4, 5, 9, 2, 3, 7, 1],
      [1, 0, 3, 6, 8, 4, 2],
      [9, 2, 8, 4, 7, 3, 5],
      [6, 4, 1, 9, 2, 0, 8],
      [2, 7, 5, 3, 8, 1, 4]
    ];

    var isConstructed = false;

    function render() {
      var colors = getThemeColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var startX = 180, startY = 40, colW = 34, rowH = 32;

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Hypothetical Complete List of Real Numbers in [0, 1):', startX - 80, startY - 15);

      // Compute diagonal number D
      var diagDigits = [];
      for (var d = 0; d < 7; d++) {
        var orig = listRows[d][d];
        var modified = (orig + 1) % 10;
        diagDigits.push(modified);
      }

      if (isConstructed) {
        resultNumDisp.textContent = 'D = 0.' + diagDigits.join('');
      } else {
        resultNumDisp.textContent = 'D = 0. ? ? ? ? ? ? ?';
      }

      // Draw rows
      for (var r = 0; r < 7; r++) {
        var ry = startY + r * rowH;

        // Label n = 1..7
        ctx.fillStyle = colors.muted;
        ctx.font = '11px sans-serif';
        ctx.fillText('s_' + (r + 1) + ' = 0.', startX - 60, ry + 16);

        for (var c = 0; c < 7; c++) {
          var rx = startX + c * colW;
          var digit = listRows[r][c];

          var isDiagonal = (r === c);

          if (isDiagonal) {
            ctx.fillStyle = isDark() ? 'rgba(248, 113, 113, 0.25)' : 'rgba(220, 38, 38, 0.18)';
            ctx.fillRect(rx - 4, ry, colW - 4, rowH - 4);
            ctx.strokeStyle = colors.hot;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rx - 4, ry, colW - 4, rowH - 4);
          }

          ctx.fillStyle = isDiagonal ? colors.hot : colors.text;
          ctx.font = (isDiagonal ? 'bold ' : '') + '14px monospace';
          ctx.fillText(digit, rx + 6, ry + 18);
        }
      }

      // Divider line
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX - 60, startY + 7 * rowH + 8);
      ctx.lineTo(startX + 7 * colW + 20, startY + 7 * rowH + 8);
      ctx.stroke();

      // Diagonal result number D below divider
      var dY = startY + 7 * rowH + 34;
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 13px sans-serif';
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText('D = 0.', startX - 10, dY);
      ctx.restore();

      for (var k = 0; k < 7; k++) {
        var kx = startX + k * colW;
        if (isConstructed) {
          ctx.fillStyle = isDark() ? 'rgba(106, 176, 248, 0.3)' : 'rgba(33, 96, 196, 0.2)';
          ctx.fillRect(kx - 4, dY - 18, colW - 4, 24);
          ctx.strokeStyle = colors.primary;
          ctx.strokeRect(kx - 4, dY - 18, colW - 4, 24);

          ctx.fillStyle = colors.primary;
          ctx.font = 'bold 15px monospace';
          ctx.fillText(diagDigits[k], kx + 6, dY - 1);
        } else {
          ctx.fillStyle = colors.muted;
          ctx.font = '14px monospace';
          ctx.fillText('?', kx + 6, dY - 1);
        }
      }

      // Conclusion note
      ctx.fillStyle = colors.text;
      ctx.font = '11px sans-serif';
      if (isConstructed) {
        ctx.fillStyle = colors.success;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('D differs from s₁ at digit 1, from s₂ at digit 2, ..., from s_n at digit n.', startX - 60, dY + 36);
        ctx.fillText('Therefore D is NOT on the list! Continuum is uncountable: 2^ℵ₀ > ℵ₀', startX - 60, dY + 54);
      }
    }

    flipBtn.addEventListener('click', function () {
      isConstructed = true;
      render();
    });

    shuffleBtn.addEventListener('click', function () {
      for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 7; c++) {
          listRows[r][c] = Math.floor(Math.random() * 10);
        }
      }
      isConstructed = false;
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 11.7: Alan Turing's Universal Machine Simulator (1936)
  // =========================================================================
  FIG['fig-turing-machine'] = function (container) {
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
      '<button id="tm-step-btn" style="padding:4px 14px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer; font-weight:bold;">Step Machine</button>' +
      '<button id="tm-run-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Run Auto</button>' +
      '<button id="tm-reset-btn" style="padding:4px 10px; border-radius:4px; border:1px solid #999; background:var(--color-bg, #fff); cursor:pointer;">Reset</button>' +
      '<span id="tm-state-disp" style="font-weight:bold; color:var(--color-hot, #dc2626);">State: q0 (Binary Incrementer)</span>';

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
    expl.innerHTML = '<strong>The idea:</strong> this machine only reads a square, writes a symbol, moves one step and changes its state, yet machines like it can carry out any step-by-step calculation. Turing also proved that no program can always tell whether another program will stop or run forever.';
    wrapper.appendChild(expl);

    container.appendChild(wrapper);

    var ctx = canvas.getContext('2d');
    var stepBtn = ctrlRow.querySelector('#tm-step-btn');
    var runBtn = ctrlRow.querySelector('#tm-run-btn');
    var resetBtn = ctrlRow.querySelector('#tm-reset-btn');
    var stateDisp = ctrlRow.querySelector('#tm-state-disp');

    // Turing Machine tape setup: Binary incrementer
    // Input: ... B, 1, 0, 1, 1, B ... (binary 11 = decimal 11). Increment by 1 -> 1100 (binary 12)
    var tape = ['B', 'B', '1', '0', '1', '1', 'B', 'B', 'B', 'B'];
    var headPos = 5; // pointing at least-significant bit '1'
    var currentState = 'q_inc';
    var isRunning = false;
    var stepCount = 0;

    // Transition table:
    // State q_inc (incrementing bit):
    //   if '1': write '0', move Left, stay in q_inc (carry)
    //   if '0': write '1', move Left, transition to q_done
    //   if 'B': write '1', move Left, transition to q_done
    // State q_done: HALT

    function stepTM() {
      if (currentState === 'HALT') return;
      var sym = tape[headPos];

      if (currentState === 'q_inc') {
        if (sym === '1') {
          tape[headPos] = '0';
          headPos--;
          // stay in q_inc
        } else if (sym === '0' || sym === 'B') {
          tape[headPos] = '1';
          headPos--;
          currentState = 'HALT';
        }
      }

      stepCount++;
      render();
    }

    function render() {
      var colors = getThemeColors();
      stateDisp.textContent = 'State: ' + currentState + ' | Steps: ' + stepCount;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Draw Infinite Tape Cells ---
      var cellW = 55, cellH = 55;
      var tapeStartX = 85, tapeY = 130;

      for (var i = 0; i < tape.length; i++) {
        var cx = tapeStartX + i * cellW;
        var isHead = (i === headPos);

        ctx.fillStyle = isHead
          ? (isDark() ? 'rgba(106, 176, 248, 0.25)' : 'rgba(33, 96, 196, 0.18)')
          : colors.panelBg;
        ctx.fillRect(cx, tapeY, cellW, cellH);

        ctx.strokeStyle = isHead ? colors.primary : colors.border;
        ctx.lineWidth = isHead ? 2.5 : 1;
        ctx.strokeRect(cx, tapeY, cellW, cellH);

        // Symbol
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 20px monospace';
        ctx.fillText(tape[i], cx + 22, tapeY + 36);
      }

      // Draw Read/Write Tape Head (Arrow pointing down at current cell)
      var headX = tapeStartX + headPos * cellW + cellW / 2;
      ctx.fillStyle = colors.hot;
      ctx.beginPath();
      ctx.moveTo(headX, tapeY - 8);
      ctx.lineTo(headX - 12, tapeY - 26);
      ctx.lineTo(headX + 12, tapeY - 26);
      ctx.fill();

      // Machine control unit box above head
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.hot;
      ctx.lineWidth = 2;
      ctx.fillRect(headX - 60, tapeY - 75, 120, 45);
      ctx.strokeRect(headX - 60, tapeY - 75, 120, 45);

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Turing Read/Write Head', headX - 55, tapeY - 58);
      ctx.fillStyle = colors.hot;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('State: ' + currentState, headX - 40, tapeY - 40);

      // Program state transition rules on side
      var rx = 100, ry = 220;
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Machine Program: Binary Incrementer (+1)', rx, ry);

      ctx.font = '11px monospace';
      ctx.fillStyle = colors.muted;
      ctx.fillText('Rule 1: (q_inc, 1) → (0, L, q_inc)  [Carry bit]', rx, ry + 22);
      ctx.fillText('Rule 2: (q_inc, 0) → (1, L, HALT)   [Flip 0 to 1 and halt]', rx, ry + 38);
      ctx.fillText('Rule 3: (q_inc, B) → (1, L, HALT)   [Expand tape with leading 1]', rx, ry + 54);

      // Halting Problem theorem note
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Turing’s Halting Theorem: No universal algorithm can decide if program M halts on input w', 80, 320);
    }

    stepBtn.addEventListener('click', stepTM);

    runBtn.addEventListener('click', function () {
      if (isRunning) {
        isRunning = false;
        runBtn.textContent = 'Run Auto';
      } else {
        isRunning = true;
        runBtn.textContent = 'Pause';
        function auto() {
          if (isRunning && currentState !== 'HALT') {
            stepTM();
            setTimeout(auto, 600);
          } else {
            isRunning = false;
            runBtn.textContent = 'Run Auto';
          }
        }
        auto();
      }
    });

    resetBtn.addEventListener('click', function () {
      tape = ['B', 'B', '1', '0', '1', '1', 'B', 'B', 'B', 'B'];
      headPos = 5;
      currentState = 'q_inc';
      stepCount = 0;
      isRunning = false;
      runBtn.textContent = 'Run Auto';
      render();
    });

    render();
  };

  // =========================================================================
  // Figure 11.8: Interactive Diagnostic Evaluation Quiz (Part 11)
  // =========================================================================
  FIG['fig-quiz-part11'] = function (container) {
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
        q: '1. What was Bishop Berkeley\'s complaint about early calculus in "The Analyst" (1734)?',
        options: [
          'That calculus gave wrong answers for planetary orbits.',
          'That Newton had stolen it from Leibniz.',
          'That it used too many symbols.',
          'That it treated tiny quantities as not zero in one step and as zero in the next, which is a contradiction.'
        ],
        answer: 3,
        expl: 'You can\'t divide by zero, yet the tiny leftover was then thrown away as if it were zero. Berkeley called these quantities "ghosts of departed quantities".'
      },
      {
        q: '2. How did Weierstrass get rid of "infinitely small" quantities?',
        options: [
          'By banning calculus.',
          'By measuring them with a microscope.',
          'With the epsilon–delta definition: for any margin of error you pick, you can find a small enough distance that keeps the curve within it.',
          'By making them equal to one.'
        ],
        answer: 2,
        expl: 'It works like a challenge game: whatever margin your opponent picks, you must be able to respond. No infinitely small numbers and no motion are needed.'
      },
      {
        q: '3. What did Lobachevsky and Bolyai find when they assumed that more than one parallel can pass through a point?',
        options: [
          'An immediate contradiction.',
          'That Euclid had made an arithmetic mistake.',
          'That all lines are circles.',
          'A complete, consistent new geometry in which the angles of a triangle add up to less than 180°.'
        ],
        answer: 3,
        expl: 'Hyperbolic geometry is as free of contradiction as Euclid\'s. Euclid\'s parallel rule is a choice, not a necessary truth.'
      },
      {
        q: '4. What new idea of space did Riemann introduce in his 1854 lecture?',
        options: [
          'Space is always flat and three-dimensional.',
          'Spaces of any number of dimensions whose curvature can change from place to place, measured from the inside.',
          'Space is made of tiny cubes.',
          'Space doesn\'t exist.'
        ],
        answer: 1,
        expl: 'Riemann\'s curved spaces later gave Einstein the mathematics for general relativity, in which matter curves spacetime.'
      },
      {
        q: '5. What did Cantor show about the fractions compared with the counting numbers?',
        options: [
          'There are far more fractions.',
          'There are fewer fractions.',
          'Fractions can\'t be compared with counting numbers at all.',
          'They are the same size: every fraction can be paired with a counting number, by zigzagging through a grid.'
        ],
        answer: 3,
        expl: 'Even though fractions are packed tightly along the line, they are only "countably infinite", the same size of infinity as 1, 2, 3...'
      },
      {
        q: '6. What did Cantor\'s diagonal argument prove about the decimals between 0 and 1?',
        options: [
          'They can be listed one by one.',
          'They are a bigger infinity than the counting numbers: no list can ever contain them all.',
          'There are only finitely many.',
          'They are the same as the fractions.'
        ],
        answer: 1,
        expl: 'Change every digit on the diagonal of any list and you get a decimal that differs from every number on the list, so the list was never complete.'
      },
      {
        q: '7. What is Russell\'s paradox (sent to Frege in 1902)?',
        options: [
          'A puzzle about two trains passing.',
          'A proof that 1 = 2.',
          'Think of the set of all sets that are not members of themselves: if it is a member of itself, it isn\'t, and if it isn\'t, it is.',
          'A question about the largest number.'
        ],
        answer: 2,
        expl: 'It showed that "for any property there is a set of things with it" leads to contradiction. New, more careful rules for sets were needed.'
      },
      {
        q: '8. What was Hilbert\'s programme?',
        options: [
          'To abolish infinity from mathematics.',
          'To write mathematics as a precise system of rules and prove that it is complete, free of contradiction and mechanically decidable.',
          'To build the first computer.',
          'To prove Euclid right.'
        ],
        answer: 1,
        expl: 'Hilbert hoped to put mathematics beyond all doubt: "We must know. We will know."'
      },
      {
        q: '9. What did Gödel\'s first incompleteness theorem (1931) show?',
        options: [
          'Any consistent system of rules strong enough for arithmetic contains true statements it cannot prove.',
          'Arithmetic is full of contradictions.',
          'Every true statement can be proved.',
          'Mathematics is only a game.'
        ],
        answer: 0,
        expl: 'Gödel built a statement that says, in effect, "this statement cannot be proved". If the system is consistent, it is true but unprovable.'
      },
      {
        q: '10. What did Turing prove about the "halting problem" in 1936?',
        options: [
          'No program can ever decide, for every program and input, whether it will eventually stop or run forever.',
          'Every program eventually stops.',
          'Computers can answer any question given enough time.',
          'Programs can only add numbers.'
        ],
        answer: 0,
        expl: 'A contrary program that does the opposite of whatever the checker predicts about it would make any such checker wrong. Some questions can never be computed.'
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
