(function () {
  'use strict';

  var GROUPS = [
    { id: '103s', name: '103С', spec: 'Сестринское дело, 1 курс' },
    { id: '102s', name: '102С', spec: 'Сестринское дело, 1 курс' },
    { id: '101s', name: '101С', spec: 'Лечебное дело, 1 курс' },
    { id: '201s', name: '201С', spec: 'Лечебное дело, 2 курс' }
  ];

  var DAYS = { mon: 'Понедельник', wed: 'Среда', fri: 'Пятница' };

  var DATA = {
    '103s': {
      mon: [
        ['09:00', '10:30', 'Информатика', 'Шамухаммедов Г.Х.', '103С'],
        ['10:40', '12:10', 'Анатомия и физиология', 'Орлова Н.П.', '204'],
        ['12:40', '14:10', '—', 'окно', ''],
        ['14:20', '15:50', 'Латинский язык', 'Ким Е.А.', '118']
      ],
      wed: [
        ['09:00', '10:30', 'Информатика', 'Шамухаммедов Г.Х.', '103С'],
        ['10:40', '12:10', 'Микробиология', 'Соколова И.В.', '310'],
        ['12:40', '14:10', 'Физическая культура', 'Гареев Р.Р.', 'спортзал']
      ],
      fri: [
        ['09:00', '10:30', 'Математика', 'Белова О.С.', '215'],
        ['10:40', '12:10', 'Информатика', 'Шамухаммедов Г.Х.', '102С'],
        ['12:40', '14:10', 'История', 'Морозов А.Л.', '109']
      ]
    },
    '102s': {
      mon: [
        ['09:00', '10:30', 'Анатомия и физиология', 'Орлова Н.П.', '204'],
        ['10:40', '12:10', 'Информатика', 'Шамухаммедов Г.Х.', '102С'],
        ['12:40', '14:10', 'Русский язык', 'Ткач Л.М.', '121']
      ],
      wed: [
        ['09:00', '10:30', 'Фармакология', 'Ковалёв Д.И.', '306'],
        ['10:40', '12:10', '—', 'окно', ''],
        ['12:40', '14:10', 'Информатика', 'Шамухаммедов Г.Х.', '102С']
      ],
      fri: [
        ['09:00', '10:30', 'Информатика', 'Шамухаммедов Г.Х.', '103С'],
        ['10:40', '12:10', 'Химия', 'Панова Е.А.', '302'],
        ['12:40', '14:10', 'Физическая культура', 'Гареев Р.Р.', 'спортзал']
      ]
    },
    '101s': {
      mon: [
        ['09:00', '10:30', 'Химия', 'Панова Е.А.', '302'],
        ['10:40', '12:10', 'Биология', 'Зайцева М.В.', '308'],
        ['12:40', '14:10', 'Информатика', 'Шамухаммедов Г.Х.', '101С']
      ],
      wed: [
        ['09:00', '10:30', 'Информатика', 'Шамухаммедов Г.Х.', '101С'],
        ['10:40', '12:10', 'Анатомия и физиология', 'Орлова Н.П.', '204'],
        ['12:40', '14:10', 'История', 'Морозов А.Л.', '109']
      ],
      fri: [
        ['09:00', '10:30', 'Математика', 'Белова О.С.', '215'],
        ['10:40', '12:10', 'Латинский язык', 'Ким Е.А.', '118'],
        ['12:40', '14:10', '—', 'окно', '']
      ]
    },
    '201s': {
      mon: [
        ['09:00', '10:30', 'Терапия', 'Волкова А.С.', '401'],
        ['10:40', '12:10', 'Информатика', 'Шамухаммедов Г.Х.', '103С'],
        ['12:40', '14:10', 'Хирургия', 'Ибрагимов Т.М.', '405']
      ],
      wed: [
        ['09:00', '10:30', 'Сестринское дело', 'Волкова А.С.', '401'],
        ['10:40', '12:10', 'Информатика', 'Шамухаммедов Г.Х.', '102С'],
        ['12:40', '14:10', '—', 'окно', '']
      ],
      fri: [
        ['09:00', '10:30', 'Реаниматология', 'Ибрагимов Т.М.', '405'],
        ['10:40', '12:10', 'Терапия', 'Волкова А.С.', '401'],
        ['12:40', '14:10', 'Информатика', 'Шамухаммедов Г.Х.', '101С']
      ]
    }
  };

  var state = { group: '103s', day: 'mon', q: '' };

  var groupsBox = document.getElementById('groups');
  var daysBox = document.getElementById('days');
  var list = document.getElementById('list');
  var q = document.getElementById('q');

  function renderGroups() {
    groupsBox.innerHTML = '';
    GROUPS.filter(function (g) {
      var s = state.q.toLowerCase().trim();
      return !s || g.name.toLowerCase().indexOf(s) !== -1 || g.spec.toLowerCase().indexOf(s) !== -1;
    }).forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'demo-group' + (g.id === state.group ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', g.id === state.group ? 'true' : 'false');
      b.textContent = g.name;
      b.title = g.spec;
      b.addEventListener('click', function () { state.group = g.id; render(); });
      groupsBox.appendChild(b);
    });

    if (!groupsBox.children.length) {
      var empty = document.createElement('p');
      empty.className = 'demo-empty';
      empty.textContent = 'Группа не найдена';
      groupsBox.appendChild(empty);
    }
  }

  function renderDay() {
    Array.prototype.forEach.call(daysBox.children, function (b) {
      var on = b.getAttribute('data-day') === state.day;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function renderList() {
    var rows = (DATA[state.group] || {})[state.day] || [];
    list.innerHTML = '';
    rows.forEach(function (r) {
      var isBreak = r[2] === '—';
      var li = document.createElement('li');
      li.className = 'demo-item' + (isBreak ? ' is-break' : '');
      li.innerHTML =
        '<span class="demo-time">' + r[0] + '<small>до ' + r[1] + '</small></span>' +
        '<span><span class="demo-subject">' + r[2] + '</span>' +
        (isBreak ? '' : '<span class="demo-teacher">' + r[3] + '</span>') + '</span>' +
        (r[4] ? '<span class="demo-room">' + r[4] + '</span>' : '');
      list.appendChild(li);
    });
  }

  function render() {
    renderGroups();
    renderDay();
    renderList();
  }

  Array.prototype.forEach.call(daysBox.children, function (b) {
    b.addEventListener('click', function () { state.day = b.getAttribute('data-day'); render(); });
  });

  q.addEventListener('input', function () {
    state.q = q.value;
    renderGroups();
  });

  render();
})();
