
(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  const filterInputs = Array.from(document.querySelectorAll("[data-filter-input]"));

  filterInputs.forEach(function (input) {
    const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search-text") || "").toLowerCase();
        card.classList.toggle("is-filtered", query !== "" && text.indexOf(query) === -1);
      });
    });
  });
})();
