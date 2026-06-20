(function () {
  function setupPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var button = wrapper.querySelector(".play-toggle");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-source");
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function playVideo() {
      loadSource();
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          wrapper.classList.add("is-playing");
        }).catch(function () {
          wrapper.classList.remove("is-playing");
        });
      } else {
        wrapper.classList.add("is-playing");
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      wrapper.classList.remove("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  if (document.readyState !== "loading") {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), setupPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), setupPlayer);
    });
  }
})();
