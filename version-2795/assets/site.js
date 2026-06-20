(function () {
    var ready = function (fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
        if (!grids.length) {
            return;
        }

        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var type = document.querySelector("[data-type-filter]");
        var clear = document.querySelector("[data-filter-clear]");
        var count = document.querySelector("[data-filter-count]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var yearValue = normalize(year ? year.value : "");
            var typeValue = normalize(type ? type.value : "");
            var total = 0;
            var visible = 0;

            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
                cards.forEach(function (card) {
                    total += 1;
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchedType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
                    var matched = matchedQuery && matchedYear && matchedType;
                    card.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " / " + total + " 部内容";
            }
        }

        [input, year, type].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener("input", apply);
            node.addEventListener("change", apply);
        });

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                apply();
            });
        }

        apply();
    }

    function initPlayer() {
        var player = document.querySelector(".movie-player");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var stream = player.getAttribute("data-stream");
        var hls = null;
        var started = false;

        if (!video || !stream) {
            return;
        }

        function start() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            video.controls = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }

            video.src = stream;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
