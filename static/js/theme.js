(function () {
  const STORAGE = 'dsa-theme';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE, t);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = t === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  }

  window.toggleTheme = function () {
    const current = localStorage.getItem(STORAGE) || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  // apply saved theme immediately — before CSS paints
  const saved = localStorage.getItem(STORAGE) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  // update icon after DOM loads
  document.addEventListener('DOMContentLoaded', function () {
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = saved === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  });
})();