document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navPanel = document.querySelector('.nav-panel');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function () {
      navPanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var next = hero.querySelector('.hero-next');
    var prev = hero.querySelector('.hero-prev');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var selected = slideIndex === active;
        slide.classList.toggle('is-active', selected);
        slide.style.display = selected ? 'block' : 'none';
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-cover');
    var stream = box.getAttribute('data-stream');
    var loaded = false;
    var engine = null;

    function prepare() {
      if (!video || !stream || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        engine = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        engine.loadSource(stream);
        engine.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }

      loaded = true;
    }

    function start() {
      prepare();

      if (!video) {
        return;
      }

      box.classList.add('is-playing');
      var playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
    }
  });

  if (typeof movieSearchItems !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('.search-main input[name="q"]');
    var titleBox = document.getElementById('searchTitle');
    var resultBox = document.getElementById('searchResults');

    if (input) {
      input.value = keyword;
    }

    function render(items) {
      if (!resultBox) {
        return;
      }

      resultBox.innerHTML = items.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.url + '">',
          '    <img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
          '    <span class="score">' + item.rating + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '    <p class="card-meta">' + item.meta + '</p>',
          '    <p class="card-desc">' + item.desc + '</p>',
          '  </div>',
          '</article>'
        ].join('\n');
      }).join('\n');
    }

    if (keyword) {
      var lowered = keyword.toLowerCase();
      var results = movieSearchItems.filter(function (item) {
        return item.keywords.toLowerCase().indexOf(lowered) !== -1;
      });

      if (titleBox) {
        titleBox.innerHTML = '<div><p class="section-kicker">搜索结果</p><h2>“' + keyword.replace(/[<>]/g, '') + '”</h2></div>';
      }

      render(results);
    } else {
      render(movieSearchItems.slice(0, 24));
    }
  }
});
