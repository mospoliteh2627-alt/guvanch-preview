(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var themeToggle = document.getElementById('theme-toggle');
  var toast = document.getElementById('toast');
  var year = document.getElementById('year');

  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- тема ---------- */

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f8f9fd' : '#06070b');
  }

  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- шапка ---------- */

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- мобильное меню ---------- */

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('no-scroll');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('no-scroll', open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      closeNav();
    });
  }

  /* ---------- появление блоков ---------- */

  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ---------- активный пункт меню ---------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- копирование почты ---------- */

  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';
      var done = function () {
        if (!toast) return;
        toast.hidden = false;
        clearTimeout(copyBtn._timer);
        copyBtn._timer = setTimeout(function () { toast.hidden = true; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done).catch(function () {});
      } else {
        var input = document.createElement('input');
        input.value = email;
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(input);
      }
    });
  }
})();

/* ---------- динамика ---------- */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');

  /* прогресс чтения + автоскрытие шапки */
  var lastY = window.scrollY;
  var ticking = false;

  function onFrame() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = 'scaleX(' + ratio + ')';
    }
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      var down = y > lastY && y > 160;
      header.classList.toggle('is-hidden', down && !header.contains(document.activeElement));
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }, { passive: true });
  onFrame();

  /* появление героя по очереди */
  var heroItems = document.querySelectorAll('.hero [data-reveal]');
  heroItems.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i * 80, 480) + 'ms';
  });

  /* счётчики */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target + suffix; return; }

    var start = performance.now();
    var dur = 1100;

    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* маркиза: дублируем содержимое для бесшовной прокрутки */
  var track = document.getElementById('stack-track');
  if (track && !reduce) {
    track.parentElement.classList.add('is-marquee');
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* подсветка карточек под курсором */
  document.querySelectorAll('.project, .service').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  });

  /* наклон мокапа */
  var visual = document.querySelector('.hero-visual');
  var mock = visual ? visual.querySelector('.mock') : null;
  if (visual && mock && !reduce && window.matchMedia('(hover: hover) and (min-width: 981px)').matches) {
    visual.addEventListener('mousemove', function (e) {
      var rect = visual.getBoundingClientRect();
      var dx = (e.clientX - rect.left) / rect.width - 0.5;
      var dy = (e.clientY - rect.top) / rect.height - 0.5;
      mock.style.setProperty('--ry', (dx * 7).toFixed(2) + 'deg');
      mock.style.setProperty('--rx', (-dy * 6).toFixed(2) + 'deg');
    }, { passive: true });
    visual.addEventListener('mouseleave', function () {
      mock.style.setProperty('--ry', '0deg');
      mock.style.setProperty('--rx', '0deg');
    });
  }

  /* волна на кнопках */
  if (!reduce) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = size + 'px';
        span.style.left = (e.clientX - rect.left - size / 2) + 'px';
        span.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(span);
        setTimeout(function () { span.remove(); }, 600);
      });
    });
  }
})();
