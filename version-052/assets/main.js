(function () {
    function toArray(list) {
        return Array.prototype.slice.call(list || []);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var header = document.querySelector('.site-header');
        var button = document.querySelector('[data-mobile-menu]');
        if (!header || !button) {
            return;
        }
        button.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = toArray(hero.querySelectorAll('.hero-slide'));
        var dots = toArray(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
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
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var query = new URLSearchParams(window.location.search).get('q') || '';
        toArray(document.querySelectorAll('input[name="q"]')).forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
        });
        toArray(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
            var keyword = root.querySelector('[data-filter-keyword]');
            var year = root.querySelector('[data-filter-year]');
            var type = root.querySelector('[data-filter-type]');
            var category = root.querySelector('[data-filter-category]');
            var empty = root.querySelector('[data-filter-empty]');
            var cards = toArray(root.querySelectorAll('.movie-card'));

            if (query && root.hasAttribute('data-use-query') && keyword && !keyword.value) {
                keyword.value = query;
            }

            function matchCard(card) {
                var key = normalize(keyword ? keyword.value : '');
                var yearValue = normalize(year ? year.value : '');
                var typeValue = normalize(type ? type.value : '');
                var categoryValue = normalize(category ? category.value : '');
                var text = normalize(card.textContent + ' ' + (card.getAttribute('data-keywords') || ''));
                var ok = true;

                if (key && text.indexOf(key) === -1) {
                    ok = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    ok = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                    ok = false;
                }
                if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                    ok = false;
                }
                return ok;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matchCard(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, year, type, category].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
