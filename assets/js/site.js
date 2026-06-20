(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            document.body.classList.toggle('is-nav-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previousButton = hero.querySelector('[data-hero-prev]');
        var nextButton = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function setupPageFilter() {
        var input = document.querySelector('[data-page-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var count = document.querySelector('[data-filter-count]');

        if (!input || !cards.length) {
            return;
        }

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function createSearchCard(movie) {
        return '' +
            '<article class="movie-card" data-movie-card>' +
                '<a class="card-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">' +
                    '<span class="play-badge">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<div class="card-kicker">' +
                        '<span>' + escapeHtml(movie.category_name) + '</span>' +
                        '<em>' + escapeHtml(movie.year) + '</em>' +
                    '</div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="card-summary">' + escapeHtml(movie.one_line) + '</p>' +
                    '<div class="card-meta">' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                        '<span>' + escapeHtml(movie.genre) + '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var title = document.querySelector('[data-search-title]');
        var summary = document.querySelector('[data-search-summary]');
        var form = document.querySelector('[data-search-form]');

        if (!results || !input) {
            return;
        }

        var parameters = new URLSearchParams(window.location.search);
        var initialQuery = parameters.get('q') || '';
        input.value = initialQuery;

        function render(movies, query) {
            var keyword = query.trim().toLowerCase();
            var filtered = movies;

            if (keyword) {
                filtered = movies.filter(function (movie) {
                    return movie.search_text.indexOf(keyword) !== -1;
                });
            }

            if (title) {
                title.textContent = keyword ? '“' + query + '” 的搜索结果' : '推荐浏览';
            }

            if (summary) {
                summary.textContent = keyword ? '共找到 ' + filtered.length + ' 部相关影片。' : '输入关键词后即可搜索全部影片。';
            }

            results.innerHTML = filtered.slice(0, 160).map(createSearchCard).join('');

            if (!filtered.length) {
                results.innerHTML = '<p class="empty-state">没有找到匹配影片，请换一个关键词继续搜索。</p>';
            }
        }

        fetch('./assets/data/movies-index.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (movies) {
                render(movies, initialQuery);

                if (form) {
                    form.addEventListener('submit', function (event) {
                        event.preventDefault();
                        var query = input.value.trim();
                        var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
                        window.history.replaceState(null, '', url);
                        render(movies, query);
                    });
                }
            })
            .catch(function () {
                results.innerHTML = '<p class="empty-state">搜索内容暂时无法加载，请从分类页继续浏览。</p>';
            });
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupPageFilter();
        setupSearchPage();
    });
})();
