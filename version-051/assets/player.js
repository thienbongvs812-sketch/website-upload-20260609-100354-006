(function () {
    window.initMoviePlayer = function (source) {
        var root = document.querySelector("[data-player]");
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var button = root.querySelector(".player-play");
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded || !video) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener("ended", function () {
                if (hls) {
                    hls.stopLoad();
                }
            });
        }
    };
}());
