/* ==========================================================================
   RNLearn — Site Scripts
   Mobile navigation, theme toggle (with localStorage try/catch),
   reading progress bar, copy-link headings, and TOC active spy.
   Vanilla ES5-compatible JavaScript.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     Theme Management (light / dark)
     Respects prefers-color-scheme, persists in localStorage safely.
     ------------------------------------------------------------------------- */
  var THEME_KEY = 'rnlearn_theme';

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
    // Notify charts/figures of theme change
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    }
  }

  var currentTheme = getSavedTheme() || getSystemTheme();
  applyTheme(currentTheme);

  // Setup theme toggle listener when DOM is ready
  function initThemeToggle() {
    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var active = document.documentElement.getAttribute('data-theme') || 'light';
        var next = active === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
        applyTheme(next);
      });
    }
  }

  /* -------------------------------------------------------------------------
     Mobile Navigation Drawer
     ------------------------------------------------------------------------- */
  function initNav() {
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');
    if (!navToggle || !navMenu) return;

    var hamburgerSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    var closeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    function closeNav() {
      if (navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = hamburgerSvg;
      }
    }

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      var nextState = !expanded;
      navToggle.setAttribute('aria-expanded', String(nextState));
      navMenu.classList.toggle('is-open', nextState);
      navToggle.innerHTML = nextState ? closeSvg : hamburgerSvg;
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close when tapping any nav-link on mobile
    navMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        closeNav();
      }
    });
  }

  /* -------------------------------------------------------------------------
     Reading Progress Bar
     ------------------------------------------------------------------------- */
  function initReadingProgress() {
    var progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    var ticking = false;
    function updateProgress() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var pct = docH > 0 ? (scrollY / docH) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  /* -------------------------------------------------------------------------
     Copy Heading Anchor Links
     ------------------------------------------------------------------------- */
  function initHeadingAnchors() {
    var headings = document.querySelectorAll('.article-content h2[id], .article-content h3[id], .article-content h4[id]');
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = '#' + h.id;
      anchor.setAttribute('aria-label', 'Link to ' + (h.textContent || '').trim());
      anchor.innerHTML = '#';
      h.insertBefore(anchor, h.firstChild);
    }
  }

  /* -------------------------------------------------------------------------
     TOC Active Spy
     ------------------------------------------------------------------------- */
  function initTocSpy() {
    var tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length || !('IntersectionObserver' in window)) return;

    var headings = [];
    for (var i = 0; i < tocLinks.length; i++) {
      var href = tocLinks[i].getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var el = document.getElementById(href.slice(1));
        if (el) headings.push(el);
      }
    }

    if (!headings.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          for (var j = 0; j < tocLinks.length; j++) {
            var link = tocLinks[j];
            if (link.getAttribute('href') === '#' + id) {
              if (!link.classList.contains('active')) {
                link.classList.add('active');
                if (link.scrollIntoView) {
                  link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
                }
              }
            } else {
              link.classList.remove('active');
            }
          }
        }
      });
    }, {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0
    });

    headings.forEach(function (h) {
      observer.observe(h);
    });
  }

  /* -------------------------------------------------------------------------
     Mobile Table of Contents Collapsible Drawer
     ------------------------------------------------------------------------- */
  function initMobileTOC() {
    var toc = document.querySelector('.article-toc');
    var tocTitle = document.querySelector('.toc-title');
    var tocLinks = document.querySelectorAll('.toc-link');
    if (!toc || !tocTitle) return;

    function isMobile() {
      return window.innerWidth < 1100;
    }

    // Set initial collapsed state on mobile screens (<768px start collapsed)
    if (window.innerWidth < 768) {
      toc.classList.add('is-collapsed');
    }

    tocTitle.addEventListener('click', function () {
      if (isMobile()) {
        toc.classList.toggle('is-collapsed');
      }
    });

    // Auto-collapse when tapping a TOC link on mobile
    for (var i = 0; i < tocLinks.length; i++) {
      tocLinks[i].addEventListener('click', function () {
        if (isMobile()) {
          toc.classList.add('is-collapsed');
        }
      });
    }

    // Reset state on viewport resize
    window.addEventListener('resize', function () {
      if (!isMobile()) {
        toc.classList.remove('is-collapsed');
      }
    });
  }

  /* -------------------------------------------------------------------------
     Floating Back-to-Top Button
     ------------------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
      document.body.appendChild(btn);
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.pageYOffset || document.documentElement.scrollTop;
          if (y > 450) {
            btn.classList.add('is-visible');
          } else {
            btn.classList.remove('is-visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------
     KaTeX Mathematics Auto-Rendering & Reactive Observer
     Supports $...$ (inline), $$...$$ (display), \(...\), \[...\].
     Renders static prose math AND dynamically inserted math in interactive
     figures, simulations, sliders, quiz cards, and value readouts.
     ------------------------------------------------------------------------- */
  var KATEX_DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true }
  ];

  function renderMath(root) {
    if (typeof renderMathInElement !== 'function') return;
    try {
      renderMathInElement(root || document.body, {
        delimiters: KATEX_DELIMITERS,
        throwOnError: false,
        errorColor: '#cc0000',
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml']
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
    }
  }
  window.renderAllMath = renderMath;

  function initKaTeXEngine() {
    // 1. Initial render attempt
    if (typeof renderMathInElement === 'function') {
      renderMath(document.body);
    } else {
      // If KaTeX is still loading via defer, poll briefly
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        if (typeof renderMathInElement === 'function') {
          clearInterval(poll);
          renderMath(document.body);
        } else if (attempts > 60) {
          clearInterval(poll);
        }
      }, 50);
    }

    // 2. Guaranteed render pass after deferred figure scripts construct their DOM
    window.addEventListener('load', function () {
      renderMath(document.body);
    });

    // 3. Reactive MutationObserver: automatically detects when interactive figures or scripts
    // inject new math into the DOM (e.g. slider moves, button clicks, quiz reveals).
    if ('MutationObserver' in window) {
      var debounceTimer = null;
      var pendingTargets = [];

      var observer = new MutationObserver(function (mutations) {
        if (typeof renderMathInElement !== 'function') return;

        for (var i = 0; i < mutations.length; i++) {
          var mut = mutations[i];
          // Skip KaTeX's own internal DOM mutations
          if (mut.target.closest && (mut.target.closest('.katex') || mut.target.closest('.katex-display'))) {
            continue;
          }

          var hasMath = false;
          if (mut.type === 'characterData') {
            var txt = mut.target.textContent || '';
            if (txt.indexOf('$') !== -1 || txt.indexOf('\\(') !== -1 || txt.indexOf('\\[') !== -1) {
              hasMath = true;
            }
          } else if (mut.type === 'childList') {
            for (var j = 0; j < mut.addedNodes.length; j++) {
              var n = mut.addedNodes[j];
              if (n.nodeType === 1 && (n.classList.contains('katex') || n.classList.contains('katex-display'))) {
                continue;
              }
              var nText = n.textContent || '';
              if (nText.indexOf('$') !== -1 || nText.indexOf('\\(') !== -1 || nText.indexOf('\\[') !== -1) {
                hasMath = true;
                break;
              }
            }
          }

          if (hasMath) {
            var targetElem = mut.target.nodeType === 1 ? mut.target : mut.target.parentElement;
            if (targetElem && pendingTargets.indexOf(targetElem) === -1) {
              pendingTargets.push(targetElem);
            }
          }
        }

        if (pendingTargets.length > 0) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function () {
            for (var k = 0; k < pendingTargets.length; k++) {
              var el = pendingTargets[k];
              if (el && document.body.contains(el)) {
                renderMath(el);
              }
            }
            pendingTargets = [];
          }, 35);
        }
      });

      var observeTarget = document.getElementById('main-content') || document.body;
      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  /* Initialize on DOMContentLoaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeToggle();
      initNav();
      initReadingProgress();
      initHeadingAnchors();
      initTocSpy();
      initMobileTOC();
      initBackToTop();
      initKaTeXEngine();
    });
  } else {
    initThemeToggle();
    initNav();
    initReadingProgress();
    initHeadingAnchors();
    initTocSpy();
    initMobileTOC();
    initBackToTop();
    initKaTeXEngine();
  }
})();
