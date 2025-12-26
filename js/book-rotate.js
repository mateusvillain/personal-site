const book = document.getElementById('book');
// Cria o observador
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
  if (entry.isIntersecting) {
    // Quando o livro estiver visível → gira até -15°
    book.style.transform = 'rotate(-15deg)';
  } else {
    // Quando sair da tela → volta para 0°
    book.style.transform = 'rotate(15deg)';
  }
  });
}, {
  threshold: 0.3 // ativa quando 30% do livro estiver visível
});
observer.observe(book);