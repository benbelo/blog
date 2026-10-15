// Bouton clair / sombre du blog. Le thème initial est appliqué dans <head>.
(function () {
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    sync();
  }

  // Met le bouton en accord avec le thème réellement appliqué au chargement.
  function sync() {
    var button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', current() === 'dark' ? 'true' : 'false');
    }
  }

  sync();

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.theme-toggle');
    if (!button) { return; }
    apply(current() === 'dark' ? 'light' : 'dark');
  });
})();
