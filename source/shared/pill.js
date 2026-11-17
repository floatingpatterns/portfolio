/* Пилюля: прячется при скролле, возвращается по наведению на своё место, наверху страницы и при фокусе с клавиатуры. */
(function () {
  var AT_TOP = 2, HOVER_PAD = 10, TOUCH_STEP = 4;
  var pill = document.getElementById('pill'), slot = document.getElementById('pillSlot');
  var hover = false, up = false, lastY = window.scrollY;
  var touch = window.matchMedia('(hover: none)').matches;
  function apply() { pill.classList.toggle('away', !(window.scrollY <= AT_TOP || hover || up)); }
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y !== lastY) hover = false;
    if (touch) { if (y > lastY + TOUCH_STEP) up = false; else if (y < lastY - TOUCH_STEP) up = true; }
    lastY = y; apply();
  }, { passive: true });
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = slot.getBoundingClientRect();
    hover = e.clientX >= r.left - HOVER_PAD && e.clientX <= r.right + HOVER_PAD &&
            e.clientY >= 0 && e.clientY <= r.bottom + HOVER_PAD;
    apply();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { hover = false; apply(); });
  apply();
})();
