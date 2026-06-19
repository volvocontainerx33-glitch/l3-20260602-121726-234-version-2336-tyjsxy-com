
(function () {
  window.initMoviePlayer = function (source) {
    const video = document.getElementById("moviePlayer");
    const overlay = document.getElementById("playOverlay");
    let started = false;
    let hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      started = true;
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
