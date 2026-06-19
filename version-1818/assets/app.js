(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function bindBrokenImages() {
    selectAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      });
    });
  }

  function bindHero() {
    var slides = selectAll('.hero-slide');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    window.setInterval(function () {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindFilter() {
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = selectAll('[data-title][data-text]');
    var empty = document.querySelector('[data-empty-message]');
    if (!input || cards.length === 0) {
      return;
    }

    function update() {
      var keyword = normalize(input.value);
      var selectedYear = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var year = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !selectedYear || year === selectedYear;
        var show = matchedKeyword && matchedYear;
        card.classList.toggle('hidden', !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', update);
    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      update();
    }
  }

  function bindHeroSearch() {
    var form = document.querySelector('[data-hero-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = './search.html';
      if (keyword) {
        target += '?q=' + encodeURIComponent(keyword);
      }
      window.location.href = target;
    });
  }

  function attachHls(video, source) {
    if (!video || !source) {
      return Promise.reject(new Error('missing video source'));
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      video._hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = source;
    return Promise.resolve();
  }

  function bindPlayer() {
    var stage = document.querySelector('[data-player-stage]');
    var video = document.querySelector('[data-hls-video]');
    var button = document.querySelector('[data-play-button]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!stage || !video || !button || !overlay) {
      return;
    }
    var source = video.getAttribute('data-src');
    var initialized = false;

    function start() {
      if (!initialized) {
        initialized = true;
        attachHls(video, source).then(function () {
          return video.play();
        }).catch(function () {
          video.setAttribute('controls', 'controls');
        });
      } else {
        video.play();
      }
      overlay.classList.add('hide');
      video.setAttribute('controls', 'controls');
    }

    button.addEventListener('click', start);
    stage.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      if (!overlay.classList.contains('hide')) {
        start();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindBrokenImages();
    bindHero();
    bindFilter();
    bindHeroSearch();
    bindPlayer();
  });
})();
