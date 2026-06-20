(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var trigger = document.querySelector("[data-play-trigger]");
    var overlay = document.querySelector(".player-overlay");
    var streamUrl = window.movieStreamUrl;
    var started = false;
    var hls = null;

    if (!video || !trigger || !streamUrl) {
      return;
    }

    function startPlayback() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = streamUrl;
      video.play().catch(function () {});
    }

    trigger.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
