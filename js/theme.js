(function () {
  try {
    var stored = localStorage.getItem('theme');
    document.documentElement.dataset.theme = stored === 'dark' ? 'dark' : 'light';
  } catch (e) {}
})();
