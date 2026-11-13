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
      '<strong>Step Size ($\Delta x$):</strong>' +
      '<input type="range" id="calc-dx" min="0.02" max="1.50" step="0.02" value="0.80" style="width:130px;">' +
      '<span id="calc-dx-val">0.80</span>' +
      '</label>' +
      '<button id="calc-zero-btn" style="padding:4px 12px; border-radius:4px; border:1px solid #999; background:var(--color-primary, #2160c4); color:#fff; cursor:pointer;">Approach Zero ($\Delta x \\to 0$)</button>' +
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
      '<div><strong>Secant Slope ($\\frac{\\Delta y}{\\Delta x}$):</strong> <span id="sec-slope-val" style="font-weight:bold;">1.84</span></div>' +
      '<div><strong>Exact Derivative ($f\'(x_0) = 3x_0^2 - 2$):</strong> <span style="font-weight:bold; color:var(--color-primary, #2160c4);">1.000</span></div>' +
      '<div><strong>Bishop Berkeley’s Paradox:</strong> <span>"Ghosts of departed quantities"</span></div>';
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

      slopeDisp.textContent = 'Secant Slope: ' + secantSlope.toFixed(3);
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
      ctx.fillText('Secant Line Slope = Δy/Δx', 40, 40);
      ctx.fillStyle = colors.muted;
      ctx.fillText('Tangent Line Slope = f\'(x₀) = 1.000', 40, 60);
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
      '<strong>Target Tolerance ($\epsilon$):</strong>' +
      '<input type="range" id="ed-eps" min="0.2" max="1.2" step="0.05" value="0.6" style="width:110px;">' +
      '<span id="ed-eps-val">0.60</span>' +
      '</label>' +
      '<label style="display:flex; align-items:center; gap:6px;">' +
      '<strong>Chosen Window ($\delta$):</strong>' +
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
    explBox.innerHTML = '<strong>Karl Weierstrass’s Modern Formal Definition:</strong> $\\lim_{x \\to x_0} f(x) = L$ if and only if for every $\\epsilon > 0$, there exists a $\\delta > 0$ such that whenever $0 < |x - x_0| < \\delta$, we are guaranteed that $|f(x) - L| < \\epsilon$. The infinitesimal has been replaced by a dynamic challenge-and-response game.';
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
        badge.textContent = 'VALID: |f(x) - L| < ε Holds!';
        badge.style.background = isDark() ? '#14532d' : '#dcfce7';
        badge.style.color = '#16a34a';
      } else {
        badge.textContent = 'INVALID: Curve spills outside ε-band!';
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
      ctx.fillText('Given target ε band, choose δ small enough so curve stays inside yellow box', ox + 20, 52);
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
      '<strong>Select Geometry:</strong>' +
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
      '<div><strong>Gaussian Curvature ($K$):</strong> <span id="geom-k" style="font-weight:bold;">-1 (Constant Negative)</span></div>' +
      '<div><strong>Fifth Postulate (Parallel Lines):</strong> <span id="geom-par" style="font-weight:bold; color:var(--color-hot, #dc2626);">Infinitely Many Parallels</span></div>' +
      '<div><strong>Triangle Angle Sum ($\alpha+\beta+\gamma$):</strong> <span id="geom-sum" style="font-weight:bold; color:var(--color-primary, #2160c4);">< 180°</span></div>';

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
        kDisp.textContent = '-1 (Negative Curvature)';
        parDisp.textContent = 'Infinitely Many Non-Intersecting Parallels';
        sumDisp.textContent = '< 180° (Sum = 180° - Area)';

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
        kDisp.textContent = '0 (Flat Plane)';
        parDisp.textContent = 'Exactly 1 Unique Parallel Line (Fifth Postulate)';
        sumDisp.textContent = '= 180° (Exact)';

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
        kDisp.textContent = '+1 (Positive Curvature)';
        parDisp.textContent = 'Zero Parallels: All Great Circles Intersect';
        sumDisp.textContent = '> 180° (Sum = 180° + Area)';

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
    expl.innerHTML = '<strong>Riemannian Holonomy:</strong> Transporting a tangent vector parallel to itself along a closed circuit on a curved surface causes the vector to return rotated by an angle $\\Delta \\theta = \\iint K dA$. On a flat plane ($K=0$), the deflection is strictly zero.';
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
        angleDisp.textContent = 'Holonomy Deflection: 0°';
      } else if (currentStep === 1) {
        vecPos = ptB;
        vecAngle = Math.PI / 2; // still pointing down (parallel transport along meridian)
        vecLabel = 'Stage 1: Arrived at Equator without turning (angle preserved)';
        angleDisp.textContent = 'Parallel Transport along AB: 0° relative rotation';
      } else if (currentStep === 2) {
        vecPos = ptC;
        vecAngle = Math.PI / 2; // still pointing South (perpendicular to equator BC)
        vecLabel = 'Stage 2: Slide along Equator to 90° East';
        angleDisp.textContent = 'Parallel Transport along BC: Vector remains pointing South';
      } else { // 3: Return to North Pole
        vecPos = ptA;
        vecAngle = 0; // pointing East! Rotated by 90 degrees!
        vecLabel = 'Stage 3: Returned to North Pole! Deflected by 90°!';
        angleDisp.textContent = 'Final Holonomy Deflection: 90° (Δθ = ∬ K dA = π/2)';
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
      '<strong>Enumeration Step ($N$):</strong>' +
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
    expl.innerHTML = '<strong>Georg Cantor (1874):</strong> By weaving along anti-diagonals of numerator $p$ and denominator $q$, every rational fraction $p/q$ is paired bijectively with a unique integer $N \\in \\mathbb{N}$. Therefore, the infinite set of rational numbers has the exact same cardinality as natural counting numbers: $|\\mathbb{Q}| = \\aleph_0$.';
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
      curFracDisp.textContent = 'N = ' + maxIdx + ' ↔ Fraction ' + curItem.p + '/' + curItem.q;

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
    expl.innerHTML = '<strong>Cantor’s Diagonal Slash (1891):</strong> Construct a real number $D = 0.d_1 d_2 d_3 \\dots$ by choosing $d_n \\neq s_{nn}$. $D$ differs from the 1st number at the 1st digit, from the 2nd at the 2nd digit, and from the $n$-th number at the $n$-th digit. $D$ cannot be anywhere on the infinite list: the real numbers $\\mathbb{R}$ are uncountably infinite ($|\\mathbb{R}| = \\mathfrak{c} > \\aleph_0$).';
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
      ctx.fillText('New Number D = 0.', startX - 70, dY);

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
    expl.innerHTML = '<strong>Alan Turing (1936):</strong> A simple discrete machine reading and writing symbols on an infinite tape can execute any algorithm conceivable by human reason. Yet Turing proved that no general algorithm can decide whether an arbitrary program will ever halt—the <strong>Halting Problem</strong> is undecidable.';
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
        q: '1. What was Bishop George Berkeley’s famous philosophical critique of early calculus in his 1734 treatise "The Analyst"?',
        options: [
          'Calculus could not be applied to planetary orbits.',
          'Infinitesimals were logically incoherent: mathematicians treated $dx$ as non-zero when dividing, and then set it to zero to eliminate it, calling them "the ghosts of departed quantities."',
          'Leibniz stole the integral symbol from Archimedes.',
          'Calculus contradicted Christian theology because God made all numbers finite.'
        ],
        answer: 1,
        expl: 'Berkeley pointed out that dividing by an infinitesimal increment and subsequently setting it to zero was a logical fallacy: a quantity cannot be simultaneously non-zero and zero. He famously dubbed them "the ghosts of departed quantities."'
      },
      {
        q: '2. How did Karl Weierstrass eliminate mystical infinitesimals from nineteenth-century mathematical analysis?',
        options: [
          'By banning derivatives and integrals from pure mathematics.',
          'By formulating the rigorous $\\epsilon$-$\\delta$ definition of limits, reducing continuity and convergence to static arithmetic inequalities involving real numbers.',
          'By proving that all curves are composed of microscopic straight line segments.',
          'By introducing imaginary numbers into coordinate systems.'
        ],
        answer: 1,
        expl: 'Weierstrass replaced mysterious "vanishing quantities" with the static, rigorous $\\epsilon$-$\\delta$ language of inequalities: $\\lim_{x \\to a} f(x) = L$ means for every $\\epsilon > 0$, there exists $\\delta > 0$ such that $0 < |x - a| < \\delta \\implies |f(x) - L| < \\epsilon$.'
      },
      {
        q: '3. What did Nikolai Lobachevsky and János Bolyai discover when they replaced Euclid’s Fifth Postulate (the Parallel Postulate) with the assumption that through a point not on a line, more than one parallel line can be drawn?',
        options: [
          'They immediately ran into logical contradictions, proving Euclid’s geometry is the only possible one.',
          'They constructed a completely consistent, non-contradictory new geometry (Hyperbolic geometry) where triangle angles sum to strictly less than 180 degrees.',
          'They showed that circles cannot exist in three dimensions.',
          'They derived the algebraic formula for solving quintic equations.'
        ],
        answer: 1,
        expl: 'Lobachevsky and Bolyai proved that Euclid’s Fifth Postulate is not an absolute logical necessity: denying it produces Hyperbolic geometry, a self-consistent mathematical world with constant negative curvature where triangle angles sum to $< 180^\\circ$.'
      },
      {
        q: '4. Bernhard Riemann’s revolutionary 1854 Habilitation lecture expanded geometry by defining space through:',
        options: [
          'An immutable 3D Cartesian grid governed by Euclidean distances.',
          'An $n$-dimensional continuous manifold whose geometry is determined intrinsically by an infinitesimal quadratic differential metric tensor ($ds^2 = \\sum g_{ij} dx^i dx^j$).',
          'A discrete collection of isolated points.',
          'Complex quarternions only.'
        ],
        answer: 1,
        expl: 'Riemann liberated geometry from flat Euclidean constraints by defining the manifold: an $n$-dimensional space where curvature varies continuously from point to point, governed by the metric tensor $g_{ij}$, providing the exact mathematical language Einstein needed for General Relativity.'
      },
      {
        q: '5. What did Georg Cantor prove regarding the infinite set of rational fractions $\\mathbb{Q}$ compared to the set of natural counting numbers $\\mathbb{N}$?',
        options: [
          'There are infinitely more rational numbers than natural numbers.',
          'The set of rational numbers has the exact same cardinality (countably infinite, $\\aleph_0$) as the natural numbers, because they can be arranged in a one-to-one diagonal bijection.',
          'Rational numbers cannot be put into any order.',
          'The cardinality of fractions depends on whether they are positive or negative.'
        ],
        answer: 1,
        expl: 'Using his famous diagonal pairing path, Cantor demonstrated a one-to-one correspondence (bijection) between $\\mathbb{N}$ and $\\mathbb{Q}$, proving that despite being dense on the line, the rational numbers are countably infinite: $|\\mathbb{Q}| = \\aleph_0$.'
      },
      {
        q: '6. Cantor’s 1891 "diagonal argument" proved that the real numbers $\\mathbb{R}$ in the interval $[0, 1)$ are:',
        options: [
          'Countably infinite like the integers.',
          'Uncountably infinite: any hypothetical list of real numbers can be shown to omit a newly constructed diagonal real number $D$, proving $|\\mathbb{R}| = \\mathfrak{c} > \\aleph_0$.',
          'A finite set of extreme density.',
          'Empty of irrational numbers.'
        ],
        answer: 1,
        expl: 'Cantor constructed a real number $D$ whose $n$-th decimal digit differs from the $n$-th digit of the $n$-th listed number. Because $D$ differs from every number on the list, no list can contain all real numbers: the continuum is uncountably infinite.'
      },
      {
        q: '7. What was Bertrand Russell’s famous paradox (1901) that threw Gottlob Frege’s naive set theory into foundational crisis?',
        options: [
          'The set of all primes is infinite.',
          'Consider the set $R$ of all sets that do not contain themselves ($R = \\{x \\mid x \\notin x\\}$). If $R$ belongs to $R$, then by definition it does not; if it does not belong to $R$, then it does: $R \\in R \\iff R \\notin R$.',
          'Parallel lines can never meet at infinity.',
          'Zero cannot be divided by zero.'
        ],
        answer: 1,
        expl: 'Russell’s Barber Paradox exposed a fatal self-referential contradiction in unrestricted set comprehension: a set defined as containing all sets that do not contain themselves cannot consistently contain or not contain itself.'
      },
      {
        q: '8. What was David Hilbert’s grand formalist program proposed at the International Congress of Mathematicians?',
        options: [
          'To replace all mathematics with computer programs.',
          'To place all of mathematics on a complete, consistent, and decidable formal axiomatic foundation, proving from within that no contradiction could ever arise.',
          'To discard all transfinite numbers as theological mysticism.',
          'To prove that every mathematical problem is unsolvable.'
        ],
        answer: 1,
        expl: 'Hilbert sought to secure mathematics once and for all: to formalize all mathematical systems into rigorous symbolic axioms and prove through metamathematics that the system is complete (every truth can be proved) and consistent (no contradictions).'
      },
      {
        q: '9. Kurt Gödel’s First Incompleteness Theorem (1931) dealt a fatal blow to Hilbert’s program by proving that:',
        options: [
          'All mathematical axioms are inherently false.',
          'In any consistent formal axiomatic system capable of doing basic arithmetic, there are always true mathematical statements that cannot be proven from within the axioms.',
          'Computers will never be able to calculate logarithms.',
          'Set theory is completely contradictory.'
        ],
        answer: 1,
        expl: 'Gödel showed through arithmetical encoding (Gödel numbering) that any consistent formal system rich enough to contain arithmetic can construct a self-referential statement asserting its own unprovability ($G \\iff \\neg\\text{Prov}(\\ulcorner G \\urcorner)$). Truth in mathematics forever outruns formal proof.'
      },
      {
        q: '10. What profound limit did Alan Turing discover in 1936 regarding universal computation (the Halting Problem)?',
        options: [
          'Computers can never solve problems faster than human brains.',
          'No general algorithm can exist that can determine, for all possible programs and inputs, whether the program will eventually halt or run forever.',
          'All mechanical Turing machines require infinite electrical power.',
          'Binary numbers cannot represent real numbers.'
        ],
        answer: 1,
        expl: 'Turing proved that the Halting Problem is undecidable: assuming an algorithm $H$ exists that decides whether any machine halts leads to a self-referential contradiction when fed an inverted copy of itself, establishing the non-computable horizon of reason.'
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
