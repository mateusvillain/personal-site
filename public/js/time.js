async function carregarHora() {
  try {
    const res = await fetch('/api/time');
    const data = await res.json();
    document.getElementById('hora').textContent = data.hora;
  } catch (err) {
    document.getElementById('hora').textContent = document.documentElement.lang === 'pt-BR'
      ? 'Não foi possível carregar a hora'
      : "Can't load time";
  }
}
carregarHora();
setInterval(carregarHora, 10000);
