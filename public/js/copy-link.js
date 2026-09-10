const copyLinks = document.querySelectorAll('.copy-link')

copyLinks.forEach((link) => {
  link.addEventListener('click', async (e) => {
    e.preventDefault()

    const email = link.dataset.email

    // Prefer the small container (the right-side div) so tooltip is positioned
    // only under the email text. Fallback to the link itself.
    const tooltipContainer = link.querySelector('div') || link
    const status =
      link.querySelector('[role="status"]') ||
      document.getElementById('copy-link-status')

    try {
      await navigator.clipboard.writeText(email)

      tooltipContainer.classList.add('appear-tooltip')
      if (status) status.textContent = 'E-mail copiado!'

      setTimeout(() => {
        tooltipContainer.classList.remove('appear-tooltip')
        if (status) status.textContent = ''
      }, 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      if (status) status.textContent = 'Não foi possível copiar o e-mail.'
    }
  })
})
