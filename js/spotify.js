async function carregarMusica() {
  try {
    const res = await fetch('/api/spotify');
    const data = await res.json();

    const el = document.getElementById('spotify');

    if (!data.isPlaying) {
      el.textContent = 'Nenhuma música tocando agora';
    } else {
      el.innerHTML = `
        🎵 <a href="${data.songUrl}" target="_blank">${data.title}</a> - ${data.artist}
      `;
    }
  } catch (err) {
    document.getElementById('spotify').textContent = 'Erro ao carregar música';
  }
}

carregarMusica();
setInterval(carregarMusica, 30000); // Atualiza a cada 30 segundos
