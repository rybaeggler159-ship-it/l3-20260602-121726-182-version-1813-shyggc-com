
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector(".hls-player");
    var button = shell.querySelector("[data-player-play]");
    var status = shell.querySelector("[data-player-status]");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-hls-src");

    function setStatus(message, isError) {
      if (!status) {
        return;
      }
      status.textContent = message;
      status.classList.toggle("is-error", Boolean(isError));
    }

    function initializePlayer() {
      if (!source) {
        setStatus("未找到播放源", true);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪", false);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后再试", true);
          }
        });
        video._hlsInstance = hls;
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源已就绪", false);
        }, { once: true });
        video.addEventListener("error", function () {
          setStatus("视频加载失败，请稍后再试", true);
        });
        return;
      }

      video.src = source;
      setStatus("当前浏览器可能需要 HLS 支持脚本", false);
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器拦截自动播放，请再次点击播放器", true);
        });
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        playVideo();
      });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
      setStatus("正在播放", false);
    });

    video.addEventListener("pause", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    initializePlayer();
  });
});
