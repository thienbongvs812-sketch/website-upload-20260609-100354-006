(function () {
    'use strict';

    var SELECTORS = {
        menuToggle: '[data-menu-toggle]',
        mobileNav: '[data-mobile-nav]',
        heroCarousel: '[data-hero-carousel]',
        heroSlide: '[data-hero-slide]',
        heroDot: '[data-hero-dot]',
        card: '[data-movie-card]',
        cardSearch: '[data-card-search]',
        yearFilter: '[data-year-filter]',
        typeFilter: '[data-type-filter]',
        resultCounter: '[data-filter-result]',
        noResults: '[data-no-results]',
        videoPlayer: '[data-video-player]',
        backToTop: '[data-back-to-top]'
    };

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMobileNavigation() {
        var toggle = document.querySelector(SELECTORS.menuToggle);
        var nav = document.querySelector(SELECTORS.mobileNav);

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            var open = !nav.classList.contains('is-open');
            nav.classList.toggle('is-open', open);
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector(SELECTORS.heroCarousel);

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll(SELECTORS.heroSlide));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(SELECTORS.heroDot));
        var index = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
                dot.setAttribute('aria-selected', dotIndex === index ? 'true' : 'false');
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function initCardFilters() {
        var searchInput = document.querySelector(SELECTORS.cardSearch);
        var yearFilter = document.querySelector(SELECTORS.yearFilter);
        var typeFilter = document.querySelector(SELECTORS.typeFilter);
        var cards = Array.prototype.slice.call(document.querySelectorAll(SELECTORS.card));
        var resultCounter = document.querySelector(SELECTORS.resultCounter);
        var noResults = document.querySelector(SELECTORS.noResults);

        if (!cards.length || (!searchInput && !yearFilter && !typeFilter)) {
            return;
        }

        function applyFilters() {
            var query = normalize(searchInput && searchInput.value);
            var year = normalize(yearFilter && yearFilter.value);
            var type = normalize(typeFilter && typeFilter.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var blob = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (query && blob.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (resultCounter) {
                resultCounter.textContent = '当前显示 ' + visibleCount + ' 部影片';
            }

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        }

        [searchInput, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        applyFilters();
    }

    function initVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(SELECTORS.videoPlayer));

        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('[data-player-overlay]');
            var message = shell.querySelector('[data-player-message]');
            var src = shell.getAttribute('data-src');
            var hlsInstance = null;

            if (!video || !overlay || !src) {
                return;
            }

            function showMessage(text) {
                if (!message) {
                    return;
                }

                message.textContent = text;
                message.classList.add('is-visible');
            }

            function attachSource() {
                if (shell.getAttribute('data-loaded') === 'true') {
                    return true;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    shell.setAttribute('data-loaded', 'true');
                    return true;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });

                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('播放源加载失败，请稍后重试。');
                            overlay.classList.remove('is-hidden');
                        }
                    });
                    shell.setAttribute('data-loaded', 'true');
                    return true;
                }

                showMessage('当前浏览器不支持 HLS 播放。');
                return false;
            }

            function startPlayback() {
                if (!attachSource()) {
                    return;
                }

                overlay.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                        showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                }
            }

            overlay.addEventListener('click', startPlayback);

            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    return;
                }

                overlay.classList.remove('is-hidden');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initBackToTop() {
        var button = document.querySelector(SELECTORS.backToTop);

        if (!button) {
            return;
        }

        function sync() {
            button.classList.toggle('is-visible', window.scrollY > 420);
        }

        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', sync, { passive: true });
        sync();
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initCardFilters();
        initVideoPlayers();
        initBackToTop();
    });
}());
