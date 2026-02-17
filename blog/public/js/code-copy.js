// Adiciona botões de copiar automaticamente em todos os blocos de código
(function() {
  function initCodeCopyButtons() {
    // Encontra todos os blocos pre que contêm code
    document.querySelectorAll('pre code').forEach((codeElement) => {
      const preElement = codeElement.parentElement;

      // Evita adicionar múltiplos botões se já existir um
      if (preElement.querySelector('.code-copy-btn')) {
        return;
      }

      // Cria o botão de copiar
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.type = 'button';
      copyButton.textContent = 'Copiar';
      copyButton.setAttribute('aria-label', 'Copiar código');

      // Adiciona o botão ao pre
      preElement.appendChild(copyButton);

      // Adiciona o event listener
      copyButton.addEventListener('click', async () => {
        try {
          // Obtém o texto do código
          const codeText = codeElement.textContent || codeElement.innerText;

          // Copia para a área de transferência
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(codeText);
          } else {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          // Feedback visual
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copiado!';
          copyButton.classList.add('copied');

          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Erro ao copiar código:', err);
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Erro';
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        }
      });
    });
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopyButtons);
  } else {
    // DOM já está pronto
    initCodeCopyButtons();
  }
})();
