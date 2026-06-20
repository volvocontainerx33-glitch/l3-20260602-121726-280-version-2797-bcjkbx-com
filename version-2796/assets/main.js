(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function setSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          setSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      setSlide(0);
      start();
    }

    var filterArea = document.querySelector("[data-filter-area]");
    if (filterArea) {
      var searchInput = filterArea.querySelector("[data-card-search]");
      var yearSelect = filterArea.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] article"));

      function filterCards() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !year || card.getAttribute("data-year") === year;
          card.classList.toggle("hidden-card", !(okKeyword && okYear));
        });
      }

      if (searchInput) {
        searchInput.addEventListener("input", filterCards);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", filterCards);
      }
    }
  });
})();
