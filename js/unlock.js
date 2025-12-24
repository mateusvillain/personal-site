// Elementos do DOM
const form = document.getElementById('unlock-form')
const input = document.getElementById('password')
const error = document.getElementById('error-message')
const contentContainer = document.getElementById('protected-content')

// Verifica se já está desbloqueado
const alreadyUnlocked = sessionStorage.getItem('protectedUnlocked')

if (alreadyUnlocked === 'true') {
  unlockWithSession()
}

// Submit do formulário
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    error.hidden = true

    const password = input.value.trim()
    if (!password) return

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        throw new Error('Senha incorreta')
      }

      const data = await response.json()

      renderContent(data)
      sessionStorage.setItem('protectedUnlocked', 'true')
      form.remove()
    } catch (err) {
      error.hidden = false
    }
  })
}

// Desbloqueio usando sessão
async function unlockWithSession() {
  try {
    const response = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '__SESSION__' })
    })

    if (!response.ok) return

    const data = await response.json()
    renderContent(data)
    form?.remove()
  } catch {
    // silencioso
  }
}

// Renderização do conteúdo
function renderContent(data) {
  if (!contentContainer) return

  contentContainer.innerHTML = ''

  // Título principal
  if (data.title) {
    const h2 = document.createElement('h2')
    h2.textContent = data.title
    contentContainer.appendChild(h2)
  }

  // Descrição
  if (data.description) {
    const p = document.createElement('p')
    p.textContent = data.description
    p.classList.add('body-lg')
    contentContainer.appendChild(p)
  }

  if (!Array.isArray(data.sections)) return

  data.sections.forEach(section => {
    switch (section.type) {
      // Heading
      case 'heading': {
        const level = section.level || 3
        const heading = document.createElement(`h${level}`)
        heading.textContent = section.value
        contentContainer.appendChild(heading)
        break
      }

      // Texto
      case 'block-title': {
        const p = document.createElement('h3')
        p.textContent = section.value
        p.classList.add('block-title')
        contentContainer.appendChild(p)
        break
      }

      // Texto
      case 'text': {
        const p = document.createElement('p')
        p.textContent = section.value
        p.classList.add('body-lg')
        contentContainer.appendChild(p)
        break
      }

      // Lista
      case 'list': {
        const ul = document.createElement('ul')

        section.items.forEach(item => {
          const li = document.createElement('li')
          li.textContent = item
          ul.appendChild(li)
        })

        contentContainer.appendChild(ul)
        break
      }

      // Citação
      case 'quote': {
        const blockquote = document.createElement('blockquote')
        blockquote.textContent = section.value
        contentContainer.appendChild(blockquote)
        break
      }

      // Link
      case 'link': {
        const a = document.createElement('a')
        a.href = section.url
        a.textContent = section.label
        a.target = section.external ? '_blank' : '_self'
        a.rel = 'noopener noreferrer'
        contentContainer.appendChild(a)
        break
      }

      // Imagem
      case 'image': {
        const img = document.createElement('img')
        img.src = section.src
        img.alt = section.alt || ''
        img.loading = 'lazy'
        contentContainer.appendChild(img)
        break
      }

      default:
        // Tipo desconhecido → ignora silenciosamente
        break
    }
  })
}

