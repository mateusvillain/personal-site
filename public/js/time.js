// Hora no topo. Pagina sem a hora no cabecalho (liveInfo desligado): nada a
// fazer. Desligada nas Configuracoes (html[data-live-info="off"]): para de
// buscar e volta na hora quando religada (evento mv:live-info).
const horaEl = document.getElementById('hora');

const horaAtiva = () => document.documentElement.dataset.liveInfo !== 'off';

async function carregarHora() {
  if (!horaAtiva()) return;
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
  document.addEventListener('mv:live-info', carregarHora);
}
