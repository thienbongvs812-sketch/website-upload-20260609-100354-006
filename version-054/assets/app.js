(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setSearchForms() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    show(0);
    play();
  }

  function setFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-type-filter]");
      var yearSelect = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value : "all";
        var yearValue = yearSelect ? yearSelect.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var cardType = card.getAttribute("data-type-group") || "";
          var cardYear = card.getAttribute("data-year-group") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchType = typeValue === "all" || cardType === typeValue;
          var matchYear = yearValue === "all" || cardYear === yearValue;
          var match = matchKeyword && matchType && matchYear;
          card.classList.toggle("is-hidden", !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (scope.hasAttribute("data-search-page") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    setMenu();
    setSearchForms();
    setHero();
    setFilters();
  });
})();

window.initMoviePlayer = function (videoId, streamUrl) {
  var video = document.getElementById(videoId);
  if (!video || !streamUrl) {
    return;
  }
  var shell = video.closest(".player-shell");
  var button = shell ? shell.querySelector("[data-player-action]") : null;
  var loaded = false;
  var hlsInstance = null;

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    loadStream();
    if (shell) {
      shell.classList.add("player-started");
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }
  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("player-started");
    }
  });
  video.addEventListener("emptied", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    loaded = false;
  });
};
