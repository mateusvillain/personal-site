async function carregarHora() {
  try {
    const res = await fetch('/api/time');
    const data = await res.json();
    document.getElementById('hora').textContent = data.hora;
  } catch (err) {
    document.getElementById('hora').textContent = 'Erro ao carregar hora';
  }
}
carregarHora();
setInterval(carregarHora, 10000);