(function () {
    window.startFilmPlayer = function (videoId, triggerSelector, streamUrl) {
        var video = document.getElementById(videoId);
        var trigger = document.querySelector(triggerSelector);
        var ready = false;
        var hlsPlayer = null;

        function loadStream() {
            if (!video || ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsPlayer.loadSource(streamUrl);
                hlsPlayer.attachMedia(video);
                video.hlsPlayer = hlsPlayer;
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function playStream() {
            if (!video) {
                return;
            }
            loadStream();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            video.controls = true;
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playStream);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    playStream();
                }
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
        }
    };
})();
