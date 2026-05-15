async function carregarMusica() {
  try {
    const res = await fetch('/api/spotify');
    const data = await res.json();

    const el = document.getElementById('spotify');

    if (!data.isPlaying) {
      el.textContent = '';
    } else {
      el.innerHTML = `
        <a href="${data.songUrl}" target="_blank">${data.title}</a> 🎵
      `;
    }
  } catch (err) {
    document.getElementById('spotify').textContent = "🎵";
  }
}

// <a href="${data.songUrl}" target="_blank">${data.title}</a> - ${data.artist} 🎵

carregarMusica();
setInterval(carregarMusica, 30000);
