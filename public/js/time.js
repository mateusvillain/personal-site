// Pagina sem a hora no cabecalho (liveInfo desligado): nada a fazer
const horaEl = document.getElementById('hora');

async function carregarHora() {
  try {
    const res = await fetch('/api/time/');
    const data = await res.json();
    horaEl.textContent = data.hora;
  } catch (err) {
    horaEl.textContent = document.documentElement.lang === 'pt-BR'
      ? 'Não foi possível carregar a hora'
      : "Can't load time";
  }
}

if (horaEl) {
  carregarHora();
  setInterval(carregarHora, 10000);
}
