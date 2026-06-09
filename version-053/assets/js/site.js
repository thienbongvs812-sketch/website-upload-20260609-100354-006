(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    function refreshHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    refreshHeader();
    window.addEventListener("scroll", refreshHeader, { passive: true });

    if (toggle && mobilePanel) {
        toggle.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
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
            if (slides.length < 2) {
                return;
            }

            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var typeSelect = scope.querySelector("[data-filter-type]");
        var yearSelect = scope.querySelector("[data-filter-year]");
        var clearButton = scope.querySelector("[data-filter-clear]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var empty = scope.querySelector("[data-filter-empty]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !typeValue || type.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || year === yearValue;
                var matches = matchesKeyword && matchesType && matchesYear;

                card.hidden = !matches;

                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }

                if (typeSelect) {
                    typeSelect.value = "";
                }

                if (yearSelect) {
                    yearSelect.value = "";
                }

                applyFilter();
            });
        }

        applyFilter();
    });

    var searchPage = document.querySelector("[data-search-page]");

    if (searchPage && Array.isArray(window.movieSearchIndex)) {
        var params = new URLSearchParams(window.location.search);
        var searchInput = searchPage.querySelector("[data-search-input]");
        var results = searchPage.querySelector("[data-search-results]");
        var status = searchPage.querySelector("[data-search-status]");
        var initialQuery = params.get("q") || "";

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function createCard(movie) {
            return [
                '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
                '    <div class="movie-poster">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="badge">' + escapeHtml(movie.type) + '</span>',
                '        <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                '        <span class="card-play">▶</span>',
                '    </div>',
                '    <div class="movie-info">',
                '        <h3>' + escapeHtml(movie.title) + '</h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="movie-meta-inline">',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.category) + '</span>',
                '        </div>',
                '    </div>',
                '</a>'
            ].join("");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function renderSearch() {
            if (!results) {
                return;
            }

            var query = normalize(searchInput ? searchInput.value : initialQuery);
            var matched = window.movieSearchIndex.filter(function (movie) {
                if (!query) {
                    return true;
                }

                return normalize([
                    movie.title,
                    movie.oneLine,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.category
                ].join(" ")).indexOf(query) !== -1;
            }).slice(0, 120);

            results.innerHTML = matched.map(createCard).join("");

            if (status) {
                status.textContent = query ? "搜索结果：" + matched.length + " 部" : "输入片名、类型、地区或标签开始搜索";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", renderSearch);
        }

        renderSearch();
    }
})();
