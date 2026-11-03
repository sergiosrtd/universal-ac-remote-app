// Picks Spanish or English: saved choice first, then the browser language.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var lang = saved || ((navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');

  function apply(next) {
    lang = next;
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next);
    var title = root.getAttribute('data-title-' + next);
    if (title) document.title = title;
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === next));
    });
  }

  apply(lang);
  document.addEventListener('DOMContentLoaded', function () {
    apply(lang);
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-set-lang');
        try { localStorage.setItem('lang', next); } catch (e) {}
        apply(next);
      });
    });
  });
})();
