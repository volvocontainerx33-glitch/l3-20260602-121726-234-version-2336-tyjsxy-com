(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
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

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var searchInput = filterForm.querySelector('[data-filter-search]');
    var yearSelect = filterForm.querySelector('[data-filter-year]');
    var regionSelect = filterForm.querySelector('[data-filter-region]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var resetButton = filterForm.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var cardText = normalize(card.getAttribute('data-filter'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (keyword && cardText.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (regionSelect) {
          regionSelect.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        applyFilter();
      });
    }

    applyFilter();
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-player-overlay]');
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function startPlayback() {
    hideOverlay();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  attachStream();

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', hideOverlay);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
