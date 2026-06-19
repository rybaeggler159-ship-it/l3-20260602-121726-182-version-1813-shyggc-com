(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (!query) {
      return;
    }
    var inputs = document.querySelectorAll('[data-search-input]');
    inputs.forEach(function (input) {
      input.value = query;
    });
  }

  function initFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var category = scope.querySelector('[data-category-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var selectedCategory = category ? category.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var yearValue = card.getAttribute('data-year') || '';
          var typeValue = card.getAttribute('data-type') || '';
          var categoryValue = card.getAttribute('data-category') || '';
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && yearValue !== selectedYear) {
            matched = false;
          }
          if (selectedType && typeValue !== selectedType) {
            matched = false;
          }
          if (selectedCategory && categoryValue !== selectedCategory) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSearchForms();
    initFilters();
  });
})();
