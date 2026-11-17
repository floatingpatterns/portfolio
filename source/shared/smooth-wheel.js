/* Плавный скролл колесом и трекпадом (без якорей). Параметры: константы в начале. */
(function () {
  var TAU = 90, LINE_PX = 16, MAX_DT = 50, STOP_PX = .5;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var doc = document.documentElement, raf = 0, target = 0, cur = 0, last = 0;
  function max() { return Math.max(0, doc.scrollHeight - window.innerHeight); }
  function clamp(v) { return Math.max(0, Math.min(max(), v)); }
  function loop(t) {
    var dt = Math.min(MAX_DT, t - last) || 16; last = t;
    cur += (target - cur) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(target - cur) < STOP_PX) { cur = target; window.scrollTo(0, cur); raf = 0; return; }
    window.scrollTo(0, cur);
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener('scroll', function () { if (!raf) cur = target = window.scrollY; }, { passive: true });
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || reduce.matches || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target.closest && e.target.closest('[data-native-scroll]')) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? window.innerHeight : 1);
    if (!raf) cur = target = window.scrollY;
    target = clamp(target + d);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }, { passive: false });
})();
