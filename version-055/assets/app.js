(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var region = filterPanel.querySelector('[data-filter-region]');
        var type = filterPanel.querySelector('[data-filter-type]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var category = filterPanel.querySelector('[data-filter-category]');
        var reset = filterPanel.querySelector('[data-filter-reset]');
        var count = filterPanel.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardText(card) {
            return normalized([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category')
            ].join(' '));
        }

        function runFilter() {
            var query = normalized(input && input.value);
            var selectedRegion = region ? region.value : '';
            var selectedType = type ? type.value : '';
            var selectedYear = year ? year.value : '';
            var selectedCategory = category ? category.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                var isVisible = matchQuery && matchRegion && matchType && matchYear && matchCategory;

                card.classList.toggle('is-hidden', !isVisible);

                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '为你筛选出 ' + visible + ' 部影片';
            }
        }

        [input, region, type, year, category].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', runFilter);
            control.addEventListener('change', runFilter);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                [input, region, type, year, category].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                runFilter();
            });
        }

        runFilter();
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video[data-play]');
        var mask = box.querySelector('.player-mask');
        var stream = video ? video.getAttribute('data-play') : '';
        var loaded = false;

        function loadStream() {
            if (!video || !stream) {
                return;
            }

            if (!loaded) {
                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.hlsController = hls;
                } else {
                    video.src = stream;
                }
            }

            if (mask) {
                mask.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (mask) {
            mask.addEventListener('click', loadStream);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    loadStream();
                }
            });
        }
    });
})();
