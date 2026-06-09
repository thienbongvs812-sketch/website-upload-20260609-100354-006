(function () {
    function setupNav() {
        var toggle = document.querySelector(".js-nav-toggle");
        var links = document.querySelector(".js-nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupSearch() {
        var inputs = document.querySelectorAll(".js-search-input");
        inputs.forEach(function (input) {
            var target = input.getAttribute("data-target") || ".js-filter-card";
            var cards = document.querySelectorAll(target);
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.classList.toggle("is-hidden", value.length > 0 && text.indexOf(value) === -1);
                });
            });
        });
    }

    function setupCarousel() {
        var carousels = document.querySelectorAll(".js-carousel");
        carousels.forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            if (slides.length <= 1) {
                return;
            }
            var index = 0;
            var timer = null;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }
            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 4800);
            }
            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    stop();
                    show(dotIndex);
                    start();
                });
            });
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    setupNav();
    setupSearch();
    setupCarousel();
}());
