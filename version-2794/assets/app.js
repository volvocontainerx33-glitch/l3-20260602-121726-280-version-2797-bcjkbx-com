(function () {
  const menuButton = document.querySelector(".menu-button");
  const mobilePanel = document.querySelector(".mobile-panel");
  const searchResults = document.querySelector(".search-results");
  const forms = document.querySelectorAll("form[role='search']");
  const filterInput = document.querySelector(".filter-input");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  function renderResults(query) {
    const keyword = query.trim().toLowerCase();
    if (!keyword || !Array.isArray(window.SITE_MOVIES)) {
      searchResults.classList.remove("open");
      searchResults.innerHTML = "";
      return;
    }

    const result = window.SITE_MOVIES.filter(function (movie) {
      return movie.text.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 18);

    if (!result.length) {
      searchResults.innerHTML = "<div class=\"search-empty\">未找到相关影片</div>";
      searchResults.classList.add("open");
      return;
    }

    searchResults.innerHTML = result.map(function (movie) {
      return "<a class=\"search-result-item\" href=\"./" + movie.url + "\">" +
        "<img src=\"" + movie.image + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\">" +
        "<span><strong>" + movie.title + "</strong>" + movie.year + " · " + movie.genre + " · " + movie.region + "</span>" +
        "</a>";
    }).join("");
    searchResults.classList.add("open");
  }

  forms.forEach(function (form) {
    const input = form.querySelector(".search-input");
    if (!input) {
      return;
    }
    input.addEventListener("input", function () {
      renderResults(input.value);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      renderResults(input.value);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".site-header") && searchResults) {
      searchResults.classList.remove("open");
    }
  });

  if (filterInput) {
    filterInput.addEventListener("input", function () {
      const keyword = filterInput.value.trim().toLowerCase();
      document.querySelectorAll(".movie-card").forEach(function (card) {
        const text = card.innerText.toLowerCase();
        card.style.display = text.indexOf(keyword) === -1 ? "none" : "";
      });
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const triggers = Array.from(document.querySelectorAll(".hero-mini-card"));
  let current = 0;

  function showSlide(index) {
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

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  triggers.forEach(function (trigger) {
    trigger.addEventListener("mouseenter", function () {
      showSlide(Number(trigger.getAttribute("data-hero-trigger")) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }
}());
