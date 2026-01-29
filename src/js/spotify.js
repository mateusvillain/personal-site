async function carregarMusica() {
  try {
    const res = await fetch('/api/spotify');
    const data = await res.json();

    const el = document.getElementById('spotify');

    if (!data.isPlaying) {
      el.textContent = 'No music playing now';
    } else {
      el.innerHTML = `
        <a href="${data.songUrl}" target="_blank">${data.title}</a> 🎵
      `;
    }
  } catch (err) {
    document.getElementById('spotify').textContent = "Can't load Spotify";
  }
}

// <a href="${data.songUrl}" target="_blank">${data.title}</a> - ${data.artist} 🎵

carregarMusica();
setInterval(carregarMusica, 30000);
