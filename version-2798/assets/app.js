function qs(selector, root) {
  return (root || document).querySelector(selector);
}

function qsa(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function setupMobileMenu() {
  var button = qs('[data-mobile-toggle]');
  var panel = qs('[data-mobile-panel]');
  if (!button || !panel) {
    return;
  }
  button.addEventListener('click', function () {
    panel.classList.toggle('open');
  });
}

function setupHeaderSearch() {
  qsa('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var prefix = form.getAttribute('data-prefix') || './';
      if (value) {
        window.location.href = prefix + 'search.html?q=' + encodeURIComponent(value);
      }
    });
  });
}

function setupHeroSlider() {
  var cards = qsa('[data-hero-card]');
  var dots = qsa('[data-hero-dot]');
  if (!cards.length) {
    return;
  }
  var current = 0;
  var timer = null;
  function show(index) {
    current = index % cards.length;
    if (current < 0) {
      current = cards.length - 1;
    }
    cards.forEach(function (card, cardIndex) {
      card.classList.toggle('active', cardIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    });
  });
  timer = setInterval(function () {
    show(current + 1);
  }, 5200);
  show(0);
}

function movieCard(item, prefix) {
  var url = prefix + 'movies/' + item.file;
  return [
    '<a class="movie-card" href="' + url + '">',
    '<div class="poster">',
    '<img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
    '<div class="play-badge"><span>▶</span></div>',
    '<div class="card-tag">' + escapeHtml(item.year || '精选') + '</div>',
    '</div>',
    '<div class="movie-card-body">',
    '<h3>' + escapeHtml(item.title) + '</h3>',
    '<p>' + escapeHtml(item.one_line || item.genre || '') + '</p>',
    '<div class="card-meta">',
    '<span>' + escapeHtml(item.category) + '</span>',
    '<span>' + escapeHtml(item.region) + '</span>',
    '<span>' + escapeHtml(item.type) + '</span>',
    '</div>',
    '</div>',
    '</a>'
  ].join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function setupSearchPage() {
  var root = qs('[data-search-page]');
  if (!root || !window.MOVIE_INDEX) {
    return;
  }
  var input = qs('[data-search-input]');
  var category = qs('[data-filter-category]');
  var region = qs('[data-filter-region]');
  var type = qs('[data-filter-type]');
  var count = qs('[data-result-count]');
  var list = qs('[data-result-list]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  var prefix = root.getAttribute('data-prefix') || './';
  if (input) {
    input.value = initial;
  }
  function match(item) {
    var keyword = input.value.trim().toLowerCase();
    var text = [item.title, item.one_line, item.region, item.type, item.genre, item.category].join(' ').toLowerCase();
    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }
    if (category.value && item.category !== category.value) {
      return false;
    }
    if (region.value && item.region !== region.value) {
      return false;
    }
    if (type.value && item.type !== type.value) {
      return false;
    }
    return true;
  }
  function render() {
    var results = window.MOVIE_INDEX.filter(match).slice(0, 240);
    count.textContent = '找到 ' + results.length + ' 条结果，最多显示前 240 条。';
    if (!results.length) {
      list.className = 'empty-state';
      list.innerHTML = '<strong>未找到相关影片</strong><br>请更换关键词或筛选条件。';
      return;
    }
    list.className = 'grid movie-grid';
    list.innerHTML = results.map(function (item) {
      return movieCard(item, prefix);
    }).join('');
  }
  [input, category, region, type].forEach(function (node) {
    if (node) {
      node.addEventListener('input', render);
      node.addEventListener('change', render);
    }
  });
  render();
}

function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !source) {
    return;
  }
  var ready = false;
  function prepare() {
    if (ready) {
      return Promise.resolve();
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, resolve);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.src = source;
            resolve();
          }
        });
        setTimeout(resolve, 1800);
      });
    }
    video.src = source;
    return Promise.resolve();
  }
  function start() {
    prepare().then(function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    });
  }
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });
}

setupMobileMenu();
setupHeaderSearch();
setupHeroSlider();
setupSearchPage();
