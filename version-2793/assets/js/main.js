(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    carousel.addEventListener("mouseleave", function () {
      start();
    });

    show(0);
    start();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applySearch(query) {
      var normalized = normalize(query);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = !normalized || text.indexOf(normalized) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    forms.forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }
      form.addEventListener("submit", function (event) {
        if (!cards.length) {
          return;
        }
        event.preventDefault();
        applySearch(input ? input.value : "");
      });
      if (input && cards.length) {
        input.addEventListener("input", function () {
          applySearch(input.value);
        });
      }
    });

    if (queryFromUrl && cards.length) {
      applySearch(queryFromUrl);
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
  });
})();
