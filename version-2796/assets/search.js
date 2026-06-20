(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  ready(function () {
    var input = document.getElementById("siteSearchInput");
    var button = document.getElementById("siteSearchButton");
    var results = document.getElementById("searchResults");
    var hot = document.getElementById("searchHot");
    var data = window.SEARCH_MOVIES || [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function render(query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) {
        results.innerHTML = "";
        if (hot) {
          hot.style.display = "block";
        }
        return;
      }

      var matched = data.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.summary,
          item.category
        ].join(" ").toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 80);

      if (hot) {
        hot.style.display = "none";
      }

      if (!matched.length) {
        results.innerHTML = '<div class="detail-section"><h2>没有找到相关影片</h2><p>可以尝试输入年份、地区、题材或更短的片名关键词。</p></div>';
        return;
      }

      results.innerHTML = matched.map(function (item) {
        return '<article class="search-result-card">' +
          '<a class="search-result-cover" href="' + escapeHtml(item.url) + '">' +
          '<img class="cover-img" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()">' +
          '</a>' +
          '<div>' +
          '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>热播指数 ' + escapeHtml(item.score) + '</span></div>' +
          '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
          '<p>' + escapeHtml(item.summary) + '</p>' +
          '</div>' +
          '</article>';
      }).join("");
    }

    if (input) {
      input.value = initial;
      input.addEventListener("input", function () {
        render(input.value);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          render(input.value);
        }
      });
    }

    if (button) {
      button.addEventListener("click", function () {
        render(input ? input.value : "");
      });
    }

    render(initial);
  });
})();
