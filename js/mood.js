async function carregarMood() {
  try {
    const res = await fetch('/api/mood');
    const data = await res.json();
    document.getElementById('mood').textContent = data.mood;
  } catch (err) {
    document.getElementById('mood').textContent = 'Erro ao carregar mood';
    console.error(err);
  }
}

carregarMood();
