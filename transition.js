/*!
 * Переходы главная ⇄ кейс.
 * Выход: портрет рассыпается, контент растворяется, иконки пилюли гаснут, пилюля меняет ширину (колонка главной ⇄ 628) — всё одновременно.
 * Вход на новой странице: иконки пилюли и контент появляются одновременно (на главной ещё и портрет собирается).
 * Назад: кнопка в пилюле, свайп двумя пальцами по трекпаду вправо, кнопка браузера (в этом случае анимируется только вход).
 * Состояние между страницами: sessionStorage.trFlag (запасной вариант window.name), формат "tr|<время>|<пилюля была скрыта при уходе 0/1>".
 */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var role = D.body.getAttribute('data-tr') || '';            // 'home' | 'case'
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pill = D.getElementById('pill'), slot = D.getElementById('pillSlot');
  var wEl = pill && getComputedStyle(pill).position === 'fixed' ? pill : slot;   // у кого меняем ширину
  var portrait = window.__portrait;                                               // есть только на главной
  var OUT_MS = 420, busy = false, forcedAway = null;

  function flag() {
    var away = forcedAway !== null ? forcedAway : (pill && pill.classList.contains('away') ? 1 : 0);
    var v = 'tr|' + Date.now() + '|' + away;
    try { sessionStorage.setItem('trFlag', v); } catch (e) {}
    try { if (!window.name || /^tr\|/.test(window.name)) window.name = v; } catch (e) {}
  }
  function readFlag() {
    var v = ''; try { v = sessionStorage.getItem('trFlag') || ''; } catch (e) {}
    if (!v) v = window.name || '';
    var m = /^tr\|(\d+)\|(\d)/.exec(v);
    return m && Date.now() - +m[1] < 4000 ? m : null;
  }
  function clearFlag() {
    try { sessionStorage.removeItem('trFlag'); } catch (e) {}
    try { if (/^tr\|/.test(window.name)) window.name = ''; } catch (e) {}
  }

  function norm(u) { return new URL(u, location.href).href.split('#')[0].replace(/index\.html$/, ''); }
  function canBack(url) {
    try { return !!D.referrer && norm(D.referrer) === norm(url); } catch (e) { return false; }
  }
  function nav(url, back) {
    if (window.__trNavigate) { window.__trNavigate(url, back); return; }
    if (back && canBack(url)) history.back(); else location.href = url;
  }

  function exit(url, back) {
    if (busy) return; busy = true;
    flag();
    if (reduce) { nav(url, back); return; }
    H.classList.add('tr-out');
    if (portrait) portrait.out();
    if (wEl) {
      var ease = 'cubic-bezier(.4,0,.2,1)', op = wEl === pill ? ', opacity .4s ease' : '';
      if (window.matchMedia('(max-width: 552px)').matches) {
        /* телефон: пилюля главной стоит справа от портрета (left 63, width 100% − 79), у кейсов — на всю ширину (left 16) */
        var CASE_L = 'calc(50% - min(314px, 50% - 16px))', CASE_W = 'min(628px, 100% - 32px)';                      // пилюля кейса = колонка контента 628
        var HOME_L = 'calc(50% - var(--col) / 2 + 47px)', HOME_W = 'calc(var(--col) - 47px)';                      // пилюля главной = колонка контента минус портрет
        if (role === 'home') {
          wEl.style.transition = 'left .4s ' + ease + ', width .4s ' + ease + op;
          wEl.style.left = CASE_L; wEl.style.width = CASE_W;
        } else {
          wEl.style.transition = 'none'; wEl.style.transform = 'none'; wEl.style.left = CASE_L; wEl.style.width = CASE_W;
          void wEl.offsetWidth;                              // фиксируем исходную геометрию без визуального скачка
          wEl.style.transition = 'left .4s ' + ease + ', width .4s ' + ease + op;
          wEl.style.left = HOME_L; wEl.style.width = HOME_W;
        }
      } else {
        wEl.style.transition = 'width .4s ' + ease + op;
        wEl.style.width = role === 'home' ? 'min(628px, 100% - 32px)' : 'var(--col)';
      }
    }
    setTimeout(function () { nav(url, back); }, OUT_MS);
  }

  /* после клика мышью или тапом снимаем фокус с иконки пилюли: иначе правило «не прятать, пока внутри фокус» (оно для клавиатуры) держало бы пилюлю видимой навсегда */
  if (pill) pill.addEventListener('click', function (e) {
    if (e.detail > 0) setTimeout(function () { var el = D.activeElement; if (el && pill.contains(el)) el.blur(); }, 0);
  });

  /* клики по внутренним ссылкам */
  D.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var h = a.getAttribute('href'), url;
    if (window.__trResolve) url = window.__trResolve(h);
    else {
      try { var u = new URL(h, location.href); if (u.origin !== location.origin || u.pathname === location.pathname) return; url = u.href; }
      catch (x) { return; }
    }
    if (!url) return;
    e.preventDefault();
    exit(url, role === 'case');
  });

  /* свайп двумя пальцами вправо на кейсе = назад */
  if (role === 'case') {
    var acc = 0, lock = false, tmr = 0;
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || (e.target.closest && e.target.closest('[data-native-scroll]'))) return;
      clearTimeout(tmr); tmr = setTimeout(function () { acc = 0; lock = false; }, 200);
      if (lock) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) acc += e.deltaX; else { acc = 0; return; }
      if (acc < -80) {
        lock = true; acc = 0;
        var back = D.querySelector('#pill a[href="../"]');
        exit(back ? back.getAttribute('href') : '../', true);
      }
    }, { passive: true });
  }

  /* вход */
  function whenReady(cb) {
    var done = false;
    function go() { if (!done) { done = true; cb(); } }
    var load = new Promise(function (r) { if (D.readyState === 'complete') r(); else window.addEventListener('load', r); });
    var fonts = D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve();
    Promise.all([load, fonts]).then(go);
    setTimeout(go, 1200);
  }
  function play(m) {
    whenReady(function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (role === 'home' && m && m[2] === '0' && window.__pillKeep) window.__pillKeep();   // пилюля была видна: остаётся видимой
        H.classList.remove('tr-enter', 'tr-ph');
        if (portrait) portrait.release();
      }); });
    });
  }
  function enter() {
    var m = readFlag();
    if (m && !reduce) {
      H.classList.add('tr-enter'); if (m[2] === '1') H.classList.add('tr-ph');
      if (portrait) portrait.hold();
      play(m);
    } else {
      H.classList.remove('tr-enter', 'tr-ph');
    }
    clearFlag();
  }
  enter();

  /* возврат из bfcache (кнопка «назад» браузера, жест Safari): страница застыла в состоянии выхода */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    busy = false;
    var m = readFlag();
    if (m && !reduce) { H.classList.add('tr-enter'); if (m[2] === '1') H.classList.add('tr-ph'); }
    H.classList.remove('tr-out');
    [wEl, pill].forEach(function (el) { if (el) el.style.transition = 'none'; });
    if (wEl) { wEl.style.width = ''; wEl.style.left = ''; wEl.style.transform = ''; }
    if (pill) pill.style.opacity = '';
    void D.body.offsetWidth;
    [wEl, pill].forEach(function (el) { if (el) el.style.transition = ''; });
    forcedAway = null;
    if (m && !reduce) { if (portrait) portrait.hold(); play(m); } else if (portrait) portrait.release();
    clearFlag();
  });
  window.addEventListener('pagehide', flag);
})();
