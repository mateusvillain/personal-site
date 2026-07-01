async function carregarMood() {
  try {
    const res = await fetch('/api/mood');
    const data = await res.json();

    document.getElementById('mood').textContent = data.mood;
    document.getElementById('mensagem').textContent = data.mensagem || '';
  } catch (err) {
    document.getElementById('mood').textContent = '🤔';
    document.getElementById('mensagem').textContent = "Can't load mood";

    console.error(err);
  }
}

window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      carregarMood();
    });
  } else {
    setTimeout(carregarMood, 1000);
  }
});
