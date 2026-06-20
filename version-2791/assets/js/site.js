(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initCardFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var context = panel.closest("[data-filter-context]") || document;
            var input = panel.querySelector("[data-card-search]");
            var cards = Array.prototype.slice.call(context.querySelectorAll("[data-card]"));
            var empty = context.querySelector("[data-empty]");
            var filters = {
                region: "",
                year: ""
            };

            function apply() {
                var query = text(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = text(card.getAttribute("data-meta"));
                    var region = card.getAttribute("data-region") || "";
                    var year = card.getAttribute("data-year") || "";
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchRegion = !filters.region || region.indexOf(filters.region) !== -1;
                    var matchYear = !filters.year || year === filters.year;
                    var show = matchText && matchRegion && matchYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            panel.querySelectorAll("[data-filter-field]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var field = button.getAttribute("data-filter-field");
                    filters[field] = button.getAttribute("data-filter-value") || "";
                    panel.querySelectorAll('[data-filter-field="' + field + '"]').forEach(function (peer) {
                        peer.classList.remove("active");
                    });
                    button.classList.add("active");
                    apply();
                });
            });
        });
    }

    function createResult(item) {
        var link = document.createElement("a");
        link.className = "movie-card";
        link.href = item.url;
        link.setAttribute("data-card", "");
        link.innerHTML = [
            '<span class="poster-wrap">',
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="year-chip">' + item.year + '</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>' + item.title + '</strong>',
            '<em>' + item.oneLine + '</em>',
            '<span class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></span>',
            '<span class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</span>',
            '</span>'
        ].join("");
        return link;
    }

    function initSearchPage() {
        var input = document.querySelector("[data-global-search]");
        var output = document.querySelector("[data-search-results]");
        if (!input || !output || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }

        function render() {
            var query = text(input.value);
            var results = window.SEARCH_MOVIES.filter(function (item) {
                if (!query) {
                    return item.featured;
                }
                return text([item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ")).indexOf(query) !== -1;
            }).slice(0, query ? 120 : 36);

            output.innerHTML = "";
            if (!results.length) {
                var empty = document.createElement("div");
                empty.className = "no-results show";
                empty.textContent = "暂未找到匹配内容";
                output.appendChild(empty);
                return;
            }
            results.forEach(function (item) {
                output.appendChild(createResult(item));
            });
        }

        input.addEventListener("input", render);
        render();
    }

    window.SitePlayer = {
        mount: function (videoId, coverId, streamUrl) {
            var video = document.getElementById(videoId);
            var cover = document.getElementById(coverId);
            var hlsInstance = null;
            if (!video || !cover || !streamUrl) {
                return;
            }

            function prepare() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                prepare();
                video.controls = true;
                cover.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                }
            }

            cover.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };

    ready(function () {
        initMenu();
        initCardFilters();
        initSearchPage();
    });
}());
