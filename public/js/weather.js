// Pagina sem o clima no cabecalho (liveInfo desligado): nada a fazer
const climaEl = document.getElementById('clima');

async function carregarClima() {
  try {
    const res = await fetch('/api/weather/');
    const data = await res.json();
    climaEl.textContent = data.clima;
  } catch (err) {
    climaEl.textContent = document.documentElement.lang === 'pt-BR'
      ? 'Não foi possível carregar o clima'
      : "Can't load weather";
  }
}

if (climaEl) {
  carregarClima();
  setInterval(carregarClima, 900000);
}
