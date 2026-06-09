document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero-carousel]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    restart();
  }

  var pageSearch = document.querySelector(".page-search");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var activeFilter = "all";

  if (pageSearch && queryValue) {
    pageSearch.value = queryValue;
  }

  var normalize = function (value) {
    return (value || "").toString().toLowerCase().trim();
  };

  var cardText = function (card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.textContent
    ].join(" "));
  };

  var applyFilters = function () {
    var term = normalize(pageSearch ? pageSearch.value : "");
    var filter = normalize(activeFilter);

    cards.forEach(function (card) {
      var haystack = cardText(card);
      var matchesTerm = !term || haystack.indexOf(term) !== -1;
      var matchesFilter = filter === "all" || haystack.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !(matchesTerm && matchesFilter));
    });
  };

  if (pageSearch && cards.length) {
    pageSearch.addEventListener("input", applyFilters);
    applyFilters();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      activeFilter = chip.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });

  var shell = document.querySelector(".player-shell");

  if (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var streamUrl = shell.getAttribute("data-stream-url");
    var loaded = false;
    var hlsInstance = null;

    var loadStream = function () {
      if (!video || !streamUrl || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = streamUrl;
      loaded = true;
    };

    var beginPlay = function () {
      loadStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", beginPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlay();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && !video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }
});
