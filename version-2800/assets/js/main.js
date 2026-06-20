(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const siteNav = document.querySelector('[data-site-nav]');

    if (menuButton && siteNav) {
        menuButton.addEventListener('click', function () {
            siteNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
                slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
                dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 6500);
        }

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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        const searchInput = root.querySelector('[data-filter-search]');
        const typeSelect = root.querySelector('[data-filter-type]');
        const regionSelect = root.querySelector('[data-filter-region]');
        const cards = Array.from(root.querySelectorAll('.movie-card'));
        const empty = root.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            const query = normalize(searchInput ? searchInput.value : '');
            const selectedType = normalize(typeSelect ? typeSelect.value : '');
            const selectedRegion = normalize(regionSelect ? regionSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                const typeMatch = !selectedType || normalize(card.dataset.type).includes(selectedType);
                const regionMatch = !selectedRegion || normalize(card.dataset.region).includes(selectedRegion);
                const queryMatch = !query || text.includes(query);
                const matched = typeMatch && regionMatch && queryMatch;

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        [searchInput, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    document.querySelectorAll('.movie-player').forEach(function (player) {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.player-overlay');
        const toggleButton = player.querySelector('[data-player-toggle]');
        const muteButton = player.querySelector('[data-player-mute]');
        const fullButton = player.querySelector('[data-player-full]');
        const stream = player.getAttribute('data-stream');
        let ready = false;
        let hls = null;

        function setToggleIcon() {
            if (toggleButton) {
                toggleButton.textContent = video.paused ? '▶' : 'Ⅱ';
            }
        }

        function loadStream() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            loadStream();
            player.classList.add('is-playing');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        if (toggleButton) {
            toggleButton.addEventListener('click', togglePlay);
        }

        if (video) {
            video.addEventListener('click', togglePlay);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                setToggleIcon();
            });
            video.addEventListener('pause', function () {
                setToggleIcon();
            });
            video.addEventListener('ended', function () {
                player.classList.remove('is-playing');
                setToggleIcon();
            });
        }

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '🔇' : '🔊';
            });
        }

        if (fullButton) {
            fullButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });

        setToggleIcon();
    });
})();
