(function () {
    var hlsPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('Hls.js 加载失败'));
                }
            };
            script.onerror = function () {
                reject(new Error('Hls.js 加载失败'));
            };
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function updateStatus(player, message) {
        var panel = player.closest('.player-panel');
        var status = panel ? panel.querySelector('[data-player-status]') : null;

        if (status) {
            status.textContent = message;
        }
    }

    function initializeVideo(player) {
        var video = player.querySelector('video[data-hls]');
        var startButton = player.querySelector('[data-player-start]');

        if (!video || !startButton) {
            return;
        }

        var source = video.getAttribute('data-hls');
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            if (!source) {
                updateStatus(player, '当前影片没有可用播放源。');
                return;
            }

            if (started) {
                video.play();
                return;
            }

            started = true;
            startButton.classList.add('is-hidden');
            updateStatus(player, '正在加载 HLS / M3U8 视频流...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {
                    startButton.classList.remove('is-hidden');
                    updateStatus(player, '浏览器阻止了自动播放，请再次点击播放。');
                });
                return;
            }

            loadHlsLibrary()
                .then(function (Hls) {
                    if (!Hls.isSupported()) {
                        video.src = source;
                        return video.play();
                    }

                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);

                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            startButton.classList.remove('is-hidden');
                            updateStatus(player, '浏览器阻止了自动播放，请再次点击播放。');
                        });
                    });

                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            updateStatus(player, '网络异常，正在重试加载播放源...');
                            hlsInstance.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            updateStatus(player, '媒体解码异常，正在尝试恢复播放...');
                            hlsInstance.recoverMediaError();
                        } else {
                            updateStatus(player, '播放源暂时无法恢复，请稍后再试。');
                            hlsInstance.destroy();
                        }
                    });
                })
                .catch(function () {
                    video.src = source;
                    video.play().catch(function () {
                        startButton.classList.remove('is-hidden');
                        updateStatus(player, '播放器初始化失败，请确认网络环境后重试。');
                    });
                });
        }

        startButton.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            startButton.classList.add('is-hidden');
            updateStatus(player, '正在播放。');
        });
        video.addEventListener('ended', function () {
            updateStatus(player, '播放结束，可重新点击进度条回看。');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), initializeVideo);
    });
})();
