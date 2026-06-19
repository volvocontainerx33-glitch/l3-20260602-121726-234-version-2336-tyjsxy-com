(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    if (slides.length > 1) {
      previous?.addEventListener("click", () => {
        showSlide(current - 1);
        restart();
      });

      next?.addEventListener("click", () => {
        showSlide(current + 1);
        restart();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          showSlide(index);
          restart();
        });
      });

      restart();
    }
  }

  const filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    const searchInput = filterRoot.querySelector("[data-search-input]");
    const yearSelect = filterRoot.querySelector("[data-year-select]");
    const regionSelect = filterRoot.querySelector("[data-region-select]");
    const cards = Array.from(filterRoot.querySelectorAll("[data-title]"));
    const empty = filterRoot.querySelector("[data-empty-state]");

    const applyFilter = () => {
      const keyword = (searchInput?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "";
      const region = regionSelect?.value || "";
      let visible = 0;

      cards.forEach((card) => {
        const title = card.dataset.title || "";
        const cardYear = card.dataset.year || "";
        const cardRegion = card.dataset.region || "";
        const matched = (!keyword || title.includes(keyword)) &&
          (!year || cardYear === year) &&
          (!region || cardRegion === region);

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    searchInput?.addEventListener("input", applyFilter);
    yearSelect?.addEventListener("change", applyFilter);
    regionSelect?.addEventListener("change", applyFilter);
  }

  const loadHls = () => {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Hls));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.async = true;
      script.dataset.hlsLoader = "true";
      script.addEventListener("load", () => resolve(window.Hls));
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  };

  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const cover = player.querySelector("[data-play-cover]");
    const source = player.dataset.video || "";
    let started = false;
    let hlsInstance = null;

    const start = async () => {
      if (!video || !source) {
        return;
      }

      cover?.classList.add("is-hidden");

      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          try {
            const Hls = await loadHls();
            if (Hls && Hls.isSupported()) {
              hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hlsInstance.loadSource(source);
              hlsInstance.attachMedia(video);
            } else {
              video.src = source;
            }
          } catch (error) {
            video.src = source;
          }
        }

        started = true;
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    cover?.addEventListener("click", start);
    video?.addEventListener("click", () => {
      if (!started) {
        start();
      }
    });

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
