// Clima no topo. Pagina sem o clima no cabecalho (liveInfo desligado): nada
// a fazer. Desligado nas Configuracoes (html[data-live-info="off"]): para de
// buscar e volta na hora quando religado (evento mv:live-info).
const climaEl = document.getElementById('clima');

const climaAtivo = () => document.documentElement.dataset.liveInfo !== 'off';

async function carregarClima() {
  if (!climaAtivo()) return;
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
  document.addEventListener('mv:live-info', carregarClima);
}
