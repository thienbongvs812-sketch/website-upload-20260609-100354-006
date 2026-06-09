(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var backTop = document.querySelector('[data-back-top]');
        if (backTop) {
            window.addEventListener('scroll', function () {
                backTop.classList.toggle('is-visible', window.scrollY > 420);
            });
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var showSlide = function (index) {
                current = index % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
        var categorySelect = document.querySelector('[data-category-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var noResults = document.querySelector('[data-no-results]');

        var applyFilters = function () {
            var term = '';
            if (searchInputs.length) {
                term = searchInputs[0].value.trim().toLowerCase();
            }
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var passTerm = !term || text.indexOf(term) !== -1;
                var passCategory = !category || card.getAttribute('data-category') === category;
                var passYear = !year || card.getAttribute('data-year') === year;
                var pass = passTerm && passCategory && passYear;
                card.style.display = pass ? '' : 'none';
                if (pass) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        };

        if (queryFromUrl && searchInputs.length) {
            searchInputs.forEach(function (input) {
                input.value = queryFromUrl;
            });
        }
        searchInputs.forEach(function (input) {
            input.addEventListener('input', function () {
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyFilters();
            });
        });
        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }
        if (cards.length && (searchInputs.length || categorySelect || yearSelect)) {
            applyFilters();
        }

        var video = document.querySelector('[data-stream]');
        var playButton = document.querySelector('[data-play-button]');
        if (video) {
            var streamUrl = video.getAttribute('data-stream');
            if (streamUrl) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                }
            }
            if (playButton) {
                playButton.addEventListener('click', function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.then === 'function') {
                        playPromise.then(function () {
                            playButton.classList.add('is-hidden');
                        }).catch(function () {
                            playButton.classList.remove('is-hidden');
                        });
                    } else {
                        playButton.classList.add('is-hidden');
                    }
                });
                video.addEventListener('play', function () {
                    playButton.classList.add('is-hidden');
                });
                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        playButton.classList.remove('is-hidden');
                    }
                });
            }
        }
    });
}());
