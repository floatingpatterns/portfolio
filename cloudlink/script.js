(function(){document.querySelectorAll("img[data-same]").forEach(function(i){var o=document.querySelector('img[data-key="'+i.dataset.same+'"]');if(o)i.src=o.src});
var lb=document.getElementById("lb"),im=lb.querySelector("img");
function open(s,a){im.src=s;im.alt=a||"";lb.classList.add("on");document.body.classList.add("lock")}
function close(){lb.classList.remove("on");document.body.classList.remove("lock")}
document.querySelectorAll(".shot").forEach(function(b){b.addEventListener("click",function(){var i=b.querySelector("img");open(i.currentSrc||i.src,i.alt)})});
lb.addEventListener("click",close);document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});})();
(function () {
  var AT_TOP = 2, HOVER_PAD = 10, TOUCH_STEP = 4;   // px
  var pill = document.getElementById('pill'), slot = document.getElementById('pillSlot');
  var hover = false, up = false, lastY = window.scrollY;
  var scrollDir = window.matchMedia('(hover: none), (max-width: 552px)');   // телефонная раскладка: вниз — прячем, вверх — показываем
  var dir = 0, anchor = window.scrollY;
  function apply() { pill.classList.toggle('away', !(window.scrollY <= AT_TOP || hover || up)); }
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y !== lastY) hover = false;
    if (scrollDir.matches) {                       // считаем пройденный путь от точки разворота, а не шаг между кадрами скролла
      if (y > lastY) { if (dir <= 0) { dir = 1; anchor = lastY; } if (y - anchor > 6) up = false; }
      else if (y < lastY) { if (dir >= 0) { dir = -1; anchor = lastY; } if (anchor - y > 14) up = true; }
    }
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
  // клавиатура, полоса прокрутки и т.п.: подхватываем позицию, когда наша анимация не идёт
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
(function(){var b=document.querySelector(".tg"),m=document.getElementById("moreBox");b.addEventListener("click",function(){var o=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",String(!o));m.classList.toggle("open",!o);if(o)m.setAttribute("inert","");else m.removeAttribute("inert")})})();
