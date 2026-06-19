(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-filter-category]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (input && q) {
      input.value = q;
    }

    function value(el) {
      return el ? el.value.trim().toLowerCase() : "";
    }

    function filter() {
      var query = value(input);
      var cat = value(category);
      var yr = value(year);
      var tp = value(type);

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || ""
        ].join(" ").toLowerCase();

        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (cat && (card.getAttribute("data-category") || "").toLowerCase() !== cat) {
          ok = false;
        }
        if (yr && (card.getAttribute("data-year") || "") !== yr) {
          ok = false;
        }
        if (tp && (card.getAttribute("data-type") || "").toLowerCase() !== tp) {
          ok = false;
        }
        card.classList.toggle("hidden-card", !ok);
      });
    }

    [input, category, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", filter);
        el.addEventListener("change", filter);
      }
    });

    filter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var button = box.querySelector(".player-play");
      var url = box.getAttribute("data-url");
      var hls = null;

      if (!video || !url) {
        return;
      }

      function attach() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        video.setAttribute("data-ready", "1");
      }

      function start() {
        attach();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          start();
        });
      }

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
