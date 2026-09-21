async function carregarClima() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    document.getElementById('clima').textContent = data.clima;
  } catch (err) {
    document.getElementById('clima').textContent = document.documentElement.lang === 'pt-BR'
      ? 'Não foi possível carregar o clima'
      : "Can't load weather";
  }
}

carregarClima();
setInterval(carregarClima, 900000);
