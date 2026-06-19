async function createHlsPlayer(video, source) {
  if (!video || !source) {
    return false;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return true;
  }

  try {
    const module = await import('./hls-vendor.js');
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return true;
    }
  } catch (error) {
    video.dataset.playerError = error && error.message ? error.message : 'hls-load-failed';
  }

  video.src = source;
  return true;
}

function setupPlayer(player) {
  const video = player.querySelector('[data-player-video]');
  const button = player.querySelector('[data-player-button]');
  const source = player.dataset.src || (video ? video.dataset.src : '');
  let ready = false;
  let loading = false;

  async function prepare() {
    if (ready || loading) {
      return ready;
    }

    loading = true;
    ready = await createHlsPlayer(video, source);
    loading = false;
    return ready;
  }

  async function play() {
    const canPlay = await prepare();

    if (!canPlay || !video) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (button) {
        button.classList.remove('is-hidden');
      }
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
