(function () {
  var Hls = window.Hls;

  document.querySelectorAll('.player-box').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var url = box.getAttribute('data-video-url');
    var ready = false;
    var hls = null;

    function attachVideo() {
      if (ready || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        ready = true;
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = url;
      ready = true;
    }

    function start() {
      attachVideo();
      box.classList.add('is-playing');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
