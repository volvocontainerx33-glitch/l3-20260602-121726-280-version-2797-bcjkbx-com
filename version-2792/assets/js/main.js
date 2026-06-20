(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";

        if (!value) {
          event.preventDefault();
          window.location.href = "categories.html";
        }
      });
    });

    var carousel = document.querySelector(".hero-carousel");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-arrow.prev");
      var next = carousel.querySelector(".hero-arrow.next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    }

    document.querySelectorAll("[data-page-filter]").forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();

          card.classList.toggle("hidden-card", query && haystack.indexOf(query) === -1);
        });
      });
    });

    document.querySelectorAll("[data-filter-tag]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-tag") || "";
        var scope = button.closest(".content-section") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var active = button.classList.toggle("active");

        scope.querySelectorAll("[data-filter-tag]").forEach(function (item) {
          if (item !== button) {
            item.classList.remove("active");
          }
        });

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ");

          card.classList.toggle("hidden-card", active && haystack.indexOf(value) === -1);
        });
      });
    });

    var results = document.querySelector("[data-search-results]");

    if (results && window.searchItems) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var note = document.querySelector("[data-search-note]");
      var normalized = query.toLowerCase();
      var matched = window.searchItems.filter(function (item) {
        return !normalized || item.text.toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (note) {
        note.textContent = query ? "与“" + query + "”相关的作品" : "精选作品";
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">未找到相关内容</div>';
      } else {
        results.innerHTML = matched.map(function (item) {
          return [
            '<a class="movie-card horizontal-card" href="' + item.link + '" data-card data-title="' + escapeHtml(item.title) + '" data-tags="' + escapeHtml(item.tags) + '" data-year="' + escapeHtml(item.year) + '">',
            '<span class="cover-frame horizontal-cover"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></span>',
            '<span class="card-body">',
            '<strong>' + escapeHtml(item.title) + '</strong>',
            '<em>' + escapeHtml(item.oneLine) + '</em>',
            '<span class="meta-line">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span>',
            '</span>',
            '</a>'
          ].join("");
        }).join("");
      }
    }
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
