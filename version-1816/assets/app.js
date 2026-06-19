
document.addEventListener("DOMContentLoaded", function () {
  var body = document.body;
  var prefix = body ? body.getAttribute("data-prefix") || "" : "";
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".poster-frame img").forEach(function (image) {
    image.addEventListener("error", function () {
      var frame = image.closest(".poster-frame");
      if (frame) {
        frame.classList.add("is-missing");
      }
    });
  });

  var searchToggle = document.querySelector("[data-search-toggle]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var searchClose = document.querySelector("[data-search-close]");
  var searchInput = document.querySelector("[data-global-search]");
  var searchResults = document.querySelector("[data-search-results]");

  function closeSearch() {
    if (searchPanel) {
      searchPanel.classList.remove("is-open");
    }
  }

  function openSearch() {
    if (searchPanel) {
      searchPanel.classList.add("is-open");
    }
    if (searchInput) {
      searchInput.focus();
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener("click", openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener("click", closeSearch);
  }

  if (searchPanel) {
    searchPanel.addEventListener("click", function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
    }
  });

  function renderSearchResults(query) {
    if (!searchResults) {
      return;
    }

    var data = window.SEARCH_INDEX || [];
    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      searchResults.innerHTML = "<p class="rank-meta">输入关键词后显示匹配影片。</p>";
      return;
    }

    var matches = data.filter(function (item) {
      var text = [
        item.title,
        item.category,
        item.genre,
        item.region,
        item.year,
        item.tags,
        item.summary
      ].join(" ").toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      searchResults.innerHTML = "<p class="rank-meta">没有找到匹配影片。</p>";
      return;
    }

    searchResults.innerHTML = matches.map(function (item) {
      return [
        "<a class="search-result-item" href="" + prefix + item.url + "">",
        "  <strong>" + escapeHtml(item.title) + "</strong>",
        "  <span>" + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + "</span>",
        "</a>"
      ].join("");
    }).join("");
  }

  if (searchInput) {
    renderSearchResults("");
    searchInput.addEventListener("input", function () {
      renderSearchResults(searchInput.value);
    });
  }

  document.querySelectorAll("[data-filter-form]").forEach(function (form) {
    var q = form.querySelector("[data-filter-q]");
    var year = form.querySelector("[data-filter-year]");
    var region = form.querySelector("[data-filter-region]");
    var genre = form.querySelector("[data-filter-genre]");
    var counter = form.querySelector("[data-filter-count]");
    var scope = form.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card='movie']"));

    function getValue(input) {
      return input ? input.value.trim().toLowerCase() : "";
    }

    function applyFilters() {
      var query = getValue(q);
      var selectedYear = getValue(year);
      var selectedRegion = getValue(region);
      var selectedGenre = getValue(genre);
      var visible = 0;

      cards.forEach(function (card) {
        var cardText = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchesQuery = !query || cardText.indexOf(query) !== -1;
        var matchesYear = !selectedYear || (card.getAttribute("data-year") || "").toLowerCase() === selectedYear;
        var matchesRegion = !selectedRegion || (card.getAttribute("data-region") || "").toLowerCase() === selectedRegion;
        var matchesGenre = !selectedGenre || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(selectedGenre) !== -1;
        var shouldShow = matchesQuery && matchesYear && matchesRegion && matchesGenre;

        card.classList.toggle("is-filter-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }
    }

    [q, year, region, genre].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilters);
        input.addEventListener("change", applyFilters);
      }
    });
  });
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
