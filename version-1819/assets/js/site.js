(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var section = panel.parentElement;
    var grid = section ? section.querySelector('[data-movie-grid]') : null;
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    var empty = section ? section.querySelector('[data-empty-state]') : null;
    var keyword = panel.querySelector('.filter-keyword');
    var year = panel.querySelector('.filter-year');
    var type = panel.querySelector('.filter-type');
    var category = panel.querySelector('.filter-category');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var q = normalize(keyword ? keyword.value : '');
      var y = normalize(year ? year.value : '');
      var t = normalize(type ? type.value : '');
      var c = normalize(category ? category.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.dataset.year) === y;
        var matchType = !t || normalize(card.dataset.type).indexOf(t) !== -1;
        var matchCategory = !c || normalize(card.dataset.category) === c;
        var visibleCard = matchKeyword && matchYear && matchType && matchCategory;
        card.classList.toggle('is-hidden', !visibleCard);
        if (visibleCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
