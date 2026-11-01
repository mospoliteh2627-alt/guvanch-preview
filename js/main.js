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
  var toTop = document.getElementById('to-top');

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
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
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

/* ---------- v3: фильтр проектов, кейсы, дни в мокапе ---------- */
(function () {
  'use strict';

  /* фильтр */
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('.projects .project');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        var show = key === 'all' || cats.indexOf(key) !== -1;
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('is-shown');
        if (show) {
          void card.offsetWidth;
          card.classList.add('is-shown');
        }
      });
    });
  });

  /* кейсы */
  var cases = {
    schedule: {
      kicker: 'Кейс · PWA и iOS',
      title: 'Расписание колледжа',
      task: 'Расписание приходило PDF и Excel: студенты искали свои пары вручную, изменения терялись.',
      solution: 'Парсер PDF/Excel, PWA с офлайн-режимом и iOS-приложение: группы, кабинеты, напоминания, поиск.',
      result: '29 групп и 50 преподавателей. Расписание обновляется за минуты, работает без интернета.',
      stack: ['PWA', 'JavaScript', 'pdf.js', 'Swift']
    },
    mis: {
      kicker: 'Кейс · учебная лаборатория',
      title: 'МИС–ЛИС: цифровая лаборатория',
      task: 'Отработать работу с медицинской информационной системой без доступа к реальной системе.',
      solution: '10 сценариев в одном HTML-файле: карта пациента, назначения, передача в ЛИС, отчёт для Moodle.',
      result: 'Работает офлайн, встраивается в Moodle, оценка действий автоматическая.',
      stack: ['HTML / JS', 'Moodle', 'SCORM']
    },
    trainers: {
      kicker: 'Кейс · SCORM-тренажёры',
      title: 'Учебные тренажёры',
      task: 'Нужны управляемые сценарии для отработки действий без риска для пациента.',
      solution: 'Пять тренажёров: стационар и эпикриз, лабораторный контроль, рецепт, регистратура, ЭМК.',
      result: 'SCORM и HVP, отчёты в Moodle, работа без интернета.',
      stack: ['SCORM', 'HVP', 'Moodle']
    },
    web: {
      kicker: 'Кейс · веб-инфраструктура',
      title: 'Веб-сервисы и PWA',
      task: 'Проектам нужны домен, HTTPS и предсказуемый деплой без ручных операций.',
      solution: 'Статика и API, nginx, Let\'s Encrypt, бэкапы, поддомены под отдельные сервисы.',
      result: 'Сайт и сервисы живут на своём домене, обновление — одна команда.',
      stack: ['FastAPI', 'React', 'nginx']
    },
    sec: {
      kicker: 'Кейс · информационная безопасность',
      title: 'Информационная безопасность',
      task: 'Персональные данные в образовании обрабатывались без единого регламента.',
      solution: 'Разработал и утвердил национальный регламент защиты ПДн, политики доступа, обучение сотрудников.',
      result: 'Регламент внедрён: доступы и инциденты под контролем.',
      stack: ['152-ФЗ', 'Политики', 'Аудит']
    },
    docs: {
      kicker: 'Кейс · автоматизация',
      title: 'Автоматизация учебных документов',
      task: 'Пособия и рабочие программы собирались вручную, с ошибками оформления.',
      solution: 'Шаблоны, проверки структуры и оформления, выгрузка в DOCX и PDF за один запуск.',
      result: 'Комплект документов вместо многочасовой вёрстки.',
      stack: ['Python', 'DOCX', 'PDF']
    }
  };

  var dialog = document.getElementById('case-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    var fill = function (id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    document.querySelectorAll('.case-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = cases[btn.getAttribute('data-case')];
        if (!item) return;
        fill('case-kicker', item.kicker);
        fill('case-title', item.title);
        fill('case-task', item.task);
        fill('case-solution', item.solution);
        fill('case-result', item.result);

        var stack = document.getElementById('case-stack');
        if (stack) {
          stack.innerHTML = '';
          item.stack.forEach(function (t) {
            var s = document.createElement('span');
            s.textContent = t;
            stack.appendChild(s);
          });
        }
        var cta = document.getElementById('case-cta');
        if (cta) cta.href = 'mailto:glebe.ru@yandex.ru?subject=' + encodeURIComponent('Проект: ' + item.title);

        dialog.showModal();
      });
    });

    var closeBtn = dialog.querySelector('.case-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* дни в мокапе */
  var days = {
    mon: [
      ['09:00', 'Информатика', '103С', false],
      ['10:40', 'Информатика', '102С', false],
      ['12:40', 'окно', '—', true]
    ],
    wed: [
      ['09:00', 'Информатика', '101С', false],
      ['10:40', 'окно', '—', true],
      ['12:40', 'Информатика', '103С', false]
    ],
    fri: [
      ['09:00', 'Информатика', '102С', false],
      ['10:40', 'Информатика', '103С', false],
      ['12:40', 'окно', '—', true]
    ]
  };

  var tabs = document.querySelectorAll('.mock-tab');
  var rows = document.querySelectorAll('.mock-row');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var day = days[tab.getAttribute('data-day')];
      if (!day) return;
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      rows.forEach(function (row, i) {
        var data = day[i];
        if (!data) return;
        var time = row.querySelector('.mock-time');
        var subject = row.querySelector('.mock-subject');
        var badge = row.querySelector('.mock-badge');
        if (time) time.textContent = data[0];
        if (subject) subject.textContent = data[1];
        if (badge) badge.textContent = data[2];
        row.classList.toggle('is-muted', data[3]);
        row.classList.remove('is-swap');
        void row.offsetWidth;
        row.classList.add('is-swap');
      });
    });
  });
})();

/* ---------- карусель проектов: автопрокрутка с паузой ---------- */
(function () {
  'use strict';
  var root = document.getElementById('carousel');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dotsBox = document.getElementById('carousel-dots');
  var arrows = root.querySelectorAll('.carousel-arrow');
  var toggle = document.getElementById('carousel-toggle');
  var progress = root.querySelector('.carousel-progress span');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0;
  var autoOn = !reduce;
  var hover = false;
  var inView = true;

  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Проект ' + (i + 1));
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () { show(i); replay(); });
    dotsBox.appendChild(b);
    return b;
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
    dots.forEach(function (d, n) {
      d.classList.toggle('is-active', n === index);
      d.setAttribute('aria-selected', n === index ? 'true' : 'false');
    });
  }

  function replay() {
    root.classList.remove('is-running', 'is-paused');
    if (!progress) return;
    void progress.offsetWidth;
    if (autoOn && !hover && inView && !document.hidden) root.classList.add('is-running');
  }

  function next(step) { show(index + step); replay(); }

  arrows.forEach(function (btn) {
    btn.addEventListener('click', function () { next(parseInt(btn.getAttribute('data-dir'), 10)); });
  });

  if (progress) {
    progress.addEventListener('animationend', function () { next(1); });
  }

  function setPaused(paused) {
    root.classList.toggle('is-paused', paused);
    if (!paused && autoOn && !hover && inView && !document.hidden && !root.classList.contains('is-running')) {
      replay();
    }
  }

  root.addEventListener('mouseenter', function () { hover = true; setPaused(true); });
  root.addEventListener('mouseleave', function () { hover = false; setPaused(false); });
  root.addEventListener('focusin', function () { hover = true; setPaused(true); });
  root.addEventListener('focusout', function () { hover = false; setPaused(false); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      setPaused(!inView);
    }, { threshold: 0.25 }).observe(root);
  }

  document.addEventListener('visibilitychange', function () {
    setPaused(document.hidden);
  });

  var startX = null;
  root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) next(dx < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });

  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { next(-1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(1); e.preventDefault(); }
  });

  if (toggle) {
    toggle.textContent = autoOn ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-pressed', autoOn ? 'false' : 'true');
    toggle.setAttribute('aria-label', autoOn ? 'Пауза' : 'Продолжить');
    toggle.addEventListener('click', function () {
      autoOn = !autoOn;
      toggle.textContent = autoOn ? 'Ⅱ' : '▶';
      toggle.setAttribute('aria-pressed', autoOn ? 'false' : 'true');
      toggle.setAttribute('aria-label', autoOn ? 'Пауза' : 'Продолжить');
      if (autoOn) replay(); else root.classList.remove('is-running', 'is-paused');
    });
  }

  show(0);
  replay();
})();
