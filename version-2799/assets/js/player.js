(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-play]');
      var status = shell.querySelector('[data-player-status]');
      var source = shell.getAttribute('data-src');
      var hls = null;
      var attached = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function attachSource() {
        if (attached || !video || !source) {
          return;
        }
        attached = true;
        setStatus('正在加载播放源');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新后重试');
              if (hls) {
                hls.destroy();
                hls = null;
              }
              video.src = source;
            }
          });
        } else {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪');
          }, { once: true });
        }
      }

      function playVideo() {
        attachSource();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
            setStatus('点击播放器开始播放');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        setStatus('');
      });

      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    });
  });
})();
