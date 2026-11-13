/* RNLearn — Glossary page: filter terms as you type. */
(function () {
  'use strict';
  var box = document.getElementById('gloss-filter');
  if (!box) return;
  var entries = [].slice.call(document.querySelectorAll('.gloss-entry'));
  var letters = [].slice.call(document.querySelectorAll('.gloss-letter'));
  var count = document.getElementById('gloss-count');
  var fold = function (s) { return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() : s.toLowerCase(); };
  entries.forEach(function (e) { e._t = fold(e.querySelector('.gloss-entry-term').textContent); e._d = fold(e.querySelector('.gloss-entry-def').textContent); });
  function run() {
    var q = fold(box.value.trim()), shown = 0;
    entries.forEach(function (e) { var hit = !q || e._t.indexOf(q) !== -1 || e._d.indexOf(q) !== -1; e.hidden = !hit; if (hit) shown++; });
    letters.forEach(function (l) { l.hidden = !l.querySelector('.gloss-entry:not([hidden])'); });
    count.textContent = q ? shown + ' of ' + entries.length + ' terms' : entries.length + ' terms';
  }
  box.addEventListener('input', run);
  run();
  // Highlight the entry linked from an article pop-up
  if (location.hash) { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t && t.classList.contains('gloss-entry')) { t.classList.add('gloss-entry-target'); var go = function () { t.scrollIntoView({ block: 'center' }); }; go(); window.addEventListener('load', function () { setTimeout(go, 50); }); } }
})();
