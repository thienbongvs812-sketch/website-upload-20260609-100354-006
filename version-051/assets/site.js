(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
                document.body.classList.toggle("menu-open", nav.classList.contains("open"));
            });
        }

        document.querySelectorAll(".hero-slider").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function move(step) {
                show(index + step);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    move(1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    restart();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector(".site-search");
            var selects = Array.prototype.slice.call(scope.querySelectorAll(".filter-select"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var query = normalize(search ? search.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter-key"),
                        value: normalize(select.value)
                    };
                }).filter(function (item) {
                    return item.value;
                });
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var ok = !query || haystack.indexOf(query) !== -1;
                    activeFilters.forEach(function (item) {
                        var field = normalize(card.getAttribute("data-" + item.key));
                        if (field !== item.value) {
                            ok = false;
                        }
                    });
                    card.classList.toggle("hidden-card", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    });
}());
