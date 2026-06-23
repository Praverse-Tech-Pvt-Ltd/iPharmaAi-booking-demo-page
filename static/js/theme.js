(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
      window.dispatchEvent(new CustomEvent('themechange', { detail: { dark: isDark } }));
    });
  });
})();
