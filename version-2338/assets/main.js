document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
});

function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.getElementById("mobileMenu");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
}

function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }
}

function initLocalFilters() {
    var panels = document.querySelectorAll(".filter-panel");

    panels.forEach(function (panel) {
        var section = panel.closest(".section-wrap");
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];
        var emptyState = section ? section.querySelector(".empty-state") : null;
        var search = panel.querySelector(".local-search");
        var region = panel.querySelector(".local-region");
        var year = panel.querySelector(".local-year");
        var type = panel.querySelector(".local-type");

        function applyFilters() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matches = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matches = false;
                }

                if (regionValue && cardRegion !== regionValue) {
                    matches = false;
                }

                if (yearValue && cardYear !== yearValue) {
                    matches = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matches = false;
                }

                card.hidden = !matches;

                if (matches) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        [search, region, year, type].forEach(function (item) {
            if (item) {
                item.addEventListener("input", applyFilters);
                item.addEventListener("change", applyFilters);
            }
        });
    });
}

function initSearchPage() {
    var input = document.getElementById("searchPageInput");
    var resultBox = document.getElementById("searchResults");
    var title = document.getElementById("searchResultTitle");

    if (!input || !resultBox || !window.SEARCH_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function movieTemplate(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
        return "" +
            "<article class=\"movie-card\" data-search=\"" + escapeAttribute([movie.title, movie.region, movie.year, movie.type, movie.genre, tags].join(" ").toLowerCase()) + "\">" +
                "<a href=\"" + escapeAttribute(movie.url) + "\" class=\"movie-card-link\">" +
                    "<div class=\"poster-wrap\">" +
                        "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
                        "<span class=\"type-pill\">" + escapeHtml(movie.type) + "</span>" +
                    "</div>" +
                    "<div class=\"movie-card-body\">" +
                        "<h3>" + escapeHtml(movie.title) + "</h3>" +
                        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                        "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
                    "</div>" +
                "</a>" +
            "</article>";
    }

    function render() {
        var query = input.value.trim().toLowerCase();
        var terms = query.split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (movie) {
            var source = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.category, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
            return terms.every(function (term) {
                return source.indexOf(term) !== -1;
            });
        }).slice(0, 96);

        if (title) {
            title.textContent = query ? "搜索结果" : "精选内容";
        }

        if (results.length === 0) {
            resultBox.innerHTML = "<p class=\"empty-state\">没有找到匹配内容。</p>";
            return;
        }

        resultBox.innerHTML = results.map(movieTemplate).join("");
    }

    input.addEventListener("input", render);
    render();
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}
