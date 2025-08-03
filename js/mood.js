async function carregarMood() {
  try {
    const res = await fetch('/api/mood');
    const data = await res.json();

    document.getElementById('mood').textContent = data.mood;
    document.getElementById('mensagem').textContent = data.mensagem || '';
  } catch (err) {
    document.getElementById('mood').textContent = '🤔';
    document.getElementById('mensagem').textContent = 'Não foi possível carregar o mood.';

    console.error(err);
  }
}

carregarMood();
