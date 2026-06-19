document.addEventListener("DOMContentLoaded", function () {
    var players = document.querySelectorAll(".player-shell");

    players.forEach(function (shell) {
        setupPlayer(shell);
    });
});

function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var status = shell.querySelector(".player-status");
    var stream = shell.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !stream) {
        return;
    }

    function showStatus(message) {
        if (!status) {
            return;
        }

        status.textContent = message;
        status.hidden = false;
    }

    function attachStream() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showStatus("播放暂时不可用，请稍后重试");
                }
            });

            return;
        }

        showStatus("播放暂时不可用，请稍后重试");
    }

    function playVideo() {
        attachStream();
        shell.classList.add("is-playing");
        video.controls = true;

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                shell.classList.remove("is-playing");
            });
        }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (!loaded) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
            shell.classList.remove("is-playing");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
