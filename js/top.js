(function () {
  'use strict';
  var btn = document.getElementById('to-top');
  if (!btn) return;
  var ticking = false;
  function update() {
    btn.classList.toggle('is-visible', window.scrollY > 500);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
})();
