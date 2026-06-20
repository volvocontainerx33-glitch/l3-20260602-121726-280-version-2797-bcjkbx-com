(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
        showSlide(next);
        startHero();
      });
    });

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var clear = scope.querySelector('[data-clear-search]');
      var count = scope.querySelector('[data-result-count]');
      var list = scope.nextElementSibling;
      while (list && !list.matches('[data-card-list]')) {
        list = list.nextElementSibling;
      }
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();
          var matched = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = query ? '匹配到 ' + visible + ' 条内容' : '当前显示 ' + visible + ' 条内容';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (clear && input) {
        clear.addEventListener('click', function () {
          input.value = '';
          applyFilter();
          input.focus();
        });
      }
      applyFilter();
    });
  });
})();
