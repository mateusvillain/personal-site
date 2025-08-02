async function carregarClima() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    document.getElementById('clima').textContent = data.clima;
  } catch (err) {
    document.getElementById('clima').textContent = 'Erro ao carregar clima';
  }
}

carregarHora();
carregarClima();
setInterval(carregarHora, 10000);
setInterval(carregarClima, 900000);