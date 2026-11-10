// Clima no topo. Pagina sem o clima no cabecalho (liveInfo desligado): nada
// a fazer. Desligado nas Configuracoes (html[data-live-info="off"]): para de
// buscar. Religado (evento mv:live-info), so busca de novo se a ultima
// leitura ja passou do intervalo: ligar e desligar varias vezes nao vira
// varias chamadas a API de clima.
const climaEl = document.getElementById('clima');
const INTERVALO_CLIMA = 900000;
let ultimoClima = 0;

const climaAtivo = () => document.documentElement.dataset.liveInfo !== 'off';

async function carregarClima() {
  if (!climaAtivo()) return;
  ultimoClima = Date.now();
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
  setInterval(carregarClima, INTERVALO_CLIMA);
  document.addEventListener('mv:live-info', () => {
    if (Date.now() - ultimoClima >= INTERVALO_CLIMA) carregarClima();
  });
}
