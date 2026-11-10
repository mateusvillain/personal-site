// Hora no topo. Pagina sem a hora no cabecalho (liveInfo desligado): nada a
// fazer. Desligada nas Configuracoes (html[data-live-info="off"]): para de
// buscar. Religada (evento mv:live-info), so busca de novo se a ultima
// leitura ja passou do intervalo; senao a hora que estava volta a aparecer.
const horaEl = document.getElementById('hora');
const INTERVALO_HORA = 10000;
let ultimaHora = 0;

const horaAtiva = () => document.documentElement.dataset.liveInfo !== 'off';

async function carregarHora() {
  if (!horaAtiva()) return;
  ultimaHora = Date.now();
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
  setInterval(carregarHora, INTERVALO_HORA);
  document.addEventListener('mv:live-info', () => {
    if (Date.now() - ultimaHora >= INTERVALO_HORA) carregarHora();
  });
}
