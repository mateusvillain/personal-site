// Balao "ouvindo agora" da home (src/components/NowPlaying.astro).
// Consulta /api/spotify periodicamente e, entre as consultas, avanca o
// progresso localmente para o tempo e a letra andarem em tempo real.
(function () {
  const root = document.getElementById('now-playing');
  if (!root) return;

  const POLL_MS = 30000;
  const TICK_MS = 250;

  const toggle = root.querySelector('.now-playing__toggle');
  const card = root.querySelector('.now-playing__card');
  const artistEl = root.querySelector('[data-np-artist]');
  const titleEl = root.querySelector('[data-np-title]');
  const lyricsEl = root.querySelector('[data-np-lyrics]');
  const lyricsList = root.querySelector('[data-np-lyrics-list]');
  const barEl = root.querySelector('[data-np-bar]');
  const elapsedEl = root.querySelector('[data-np-elapsed]');
  const durationEl = root.querySelector('[data-np-duration]');

  let track = null;
  // Progresso informado pelo Spotify e o instante (relogio local) em que chegou.
  let anchor = { progressMs: 0, at: 0 };
  let syncedLines = null;
  let activeLine = null;
  let lyricsRequest = null;
  let pollTimer = null;
  let tickTimer = null;
  let waitingNextTrack = false;

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function currentProgress() {
    if (!track) return 0;
    return Math.min(anchor.progressMs + (performance.now() - anchor.at), track.durationMs);
  }

  // --- Abrir e fechar ------------------------------------------------------

  function setOpen(open) {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => {
    setOpen(!root.classList.contains('is-open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) setOpen(false);
  });

  // O container anima ate a altura real do card, que muda com a letra e com o
  // tamanho de fonte fluido.
  new ResizeObserver(() => {
    root.style.setProperty('--np-height', `${card.offsetHeight}px`);
  }).observe(card);

  // --- Letra -----------------------------------------------------------------

  function renderStaticLyrics(lines) {
    syncedLines = null;
    activeLine = null;
    lyricsEl.classList.add('is-static');
    lyricsList.style.transform = '';
    lyricsList.replaceChildren(
      ...lines.map((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      })
    );
    lyricsEl.hidden = false;
  }

  function renderSyncedLyrics(lines) {
    syncedLines = lines;
    activeLine = null;
    lyricsEl.classList.remove('is-static');
    lyricsEl.scrollTop = 0;
    lyricsList.replaceChildren(
      ...lines.map((line) => {
        const li = document.createElement('li');
        // Linhas vazias no LRC marcam trechos instrumentais.
        li.textContent = line.text || '♪';
        return li;
      })
    );
    lyricsEl.hidden = false;
    updateLyrics(currentProgress(), true);
  }

  function updateLyrics(progressMs, force) {
    if (!syncedLines) return;

    let index = -1;
    while (index + 1 < syncedLines.length && syncedLines[index + 1].time <= progressMs) {
      index++;
    }
    if (index === activeLine && !force) return;
    activeLine = index;

    const items = lyricsList.children;
    for (let i = 0; i < items.length; i++) {
      items[i].dataset.distance = String(Math.min(Math.abs(i - index), 2));
    }

    // Mantem a linha atual na 3a posicao da janela.
    const first = items[Math.max(0, index - 2)];
    lyricsList.style.transform = `translateY(${-(first ? first.offsetTop - items[0].offsetTop : 0)}px)`;
  }

  async function loadLyrics(forTrack) {
    lyricsRequest?.abort();
    lyricsRequest = new AbortController();

    syncedLines = null;
    lyricsEl.hidden = true;
    lyricsList.replaceChildren();

    const params = new URLSearchParams({
      title: forTrack.title,
      artist: forTrack.artist,
      album: forTrack.album,
      duration: String(Math.round(forTrack.durationMs / 1000)),
    });

    try {
      const res = await fetch(`/api/lyrics?${params}`, { signal: lyricsRequest.signal });
      const data = await res.json();
      if (track?.id !== forTrack.id) return;

      if (data.synced?.length) {
        renderSyncedLyrics(data.synced);
      } else if (data.instrumental) {
        renderStaticLyrics([root.dataset.instrumental]);
      } else if (data.plain) {
        renderStaticLyrics(data.plain.split('\n').filter((line) => line.trim()));
      } else {
        renderStaticLyrics([root.dataset.lyricsUnavailable]);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      renderStaticLyrics([root.dataset.lyricsUnavailable]);
    }
  }

  // --- Progresso ---------------------------------------------------------------

  function tick() {
    if (!track) return;
    const progress = currentProgress();

    elapsedEl.textContent = formatTime(progress);
    barEl.style.transform = `scaleX(${progress / track.durationMs})`;
    updateLyrics(progress);

    // A faixa acabou: busca a proxima sem esperar o intervalo.
    if (progress >= track.durationMs && !waitingNextTrack) {
      waitingNextTrack = true;
      poll();
    }
  }

  function startTicking() {
    if (!tickTimer) tickTimer = setInterval(tick, TICK_MS);
  }

  function stopTicking() {
    clearInterval(tickTimer);
    tickTimer = null;
  }

  // --- Spotify -----------------------------------------------------------------

  function hide() {
    track = null;
    stopTicking();
    setOpen(false);
    root.hidden = true;
  }

  async function poll() {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(poll, POLL_MS);

    let data;
    try {
      const res = await fetch('/api/spotify');
      data = await res.json();
    } catch (err) {
      return;
    } finally {
      waitingNextTrack = false;
    }

    if (!data.isPlaying || !data.durationMs) {
      hide();
      return;
    }

    const changed = track?.id !== data.id;
    track = data;
    anchor = { progressMs: data.progressMs, at: performance.now() };

    if (changed) {
      artistEl.textContent = data.artist;
      titleEl.textContent = data.title;
      titleEl.href = data.songUrl;
      durationEl.textContent = formatTime(data.durationMs);
      loadLyrics(data);
    }

    root.hidden = false;
    tick();
    startTicking();
  }

  // Sem aba visivel, nada de consultar a API nem animar o progresso.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(pollTimer);
      stopTicking();
    } else {
      poll();
    }
  });

  poll();
})();
