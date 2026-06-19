(function () {
  'use strict';

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $all(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = $('[data-mobile-menu-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHeroCarousel() {
    var carousel = $('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function readQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initFiltering() {
    var form = $('[data-filter-form]');
    var cards = $all('[data-movie-card]');
    var counter = $('[data-result-counter]');
    var empty = $('[data-no-results]');

    if (!form || !cards.length) {
      return;
    }

    var keywordInput = $('[name="q"]', form);
    var typeSelect = $('[name="type"]', form);
    var regionSelect = $('[name="region"]', form);
    var yearSelect = $('[name="year"]', form);
    var initialQuery = readQueryParam('q');

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function matches(card) {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var haystack = normalize(card.getAttribute('data-search'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (type && cardType !== type) {
        return false;
      }

      if (region && cardRegion !== region) {
        return false;
      }

      if (year && cardYear !== year) {
        return false;
      }

      return true;
    }

    function applyFilter() {
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visible + ' 部影片';
      }

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    $all('input, select', form).forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();
  }

  function showPlayerStatus(shell, message, persist) {
    var status = $('.player-status', shell);

    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.add('is-visible');

    if (!persist) {
      window.setTimeout(function () {
        status.classList.remove('is-visible');
      }, 2800);
    }
  }

  function initPlayerShell(shell) {
    var video = $('.player-video', shell);
    var overlay = $('.player-overlay', shell);
    var source = shell.getAttribute('data-video-src');
    var hlsInstance = null;
    var hasLoaded = false;

    if (!video || !overlay || !source) {
      return;
    }

    function loadAndPlay() {
      if (hasLoaded) {
        video.play().catch(function () {
          showPlayerStatus(shell, '浏览器阻止了自动播放，请再次点击播放按钮。', true);
        });
        return;
      }

      hasLoaded = true;
      shell.classList.add('is-playing');
      showPlayerStatus(shell, '正在连接播放源，请稍候。', false);

      if (window.Hls && window.Hls.isSupported() && source.indexOf('.m3u8') !== -1) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showPlayerStatus(shell, '播放源已就绪，请再次点击播放。', true);
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showPlayerStatus(shell, '播放源暂时无法连接，请检查网络或稍后重试。', true);
          }
        });
      } else {
        video.src = source;
        video.play().catch(function () {
          showPlayerStatus(shell, '播放源已载入，请再次点击播放。', true);
        });
      }
    }

    overlay.addEventListener('click', loadAndPlay);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('error', function () {
      showPlayerStatus(shell, '视频播放出现异常，请刷新页面或稍后重试。', true);
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    $all('[data-player-shell]').forEach(initPlayerShell);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initFiltering();
    initPlayers();
  });
})();
