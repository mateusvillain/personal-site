const script = document.currentScript
const slug = script.dataset.slug

const passwordInput = document.getElementById('password')
const unlockButton = document.getElementById('unlock')
const errorEl = document.getElementById('error')
const passwordBox = document.getElementById('password-box')
const contentEl = document.getElementById('protected-content')

let currentList = null

async function verifyPassword(password) {
  const res = await fetch('/api/project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, password })
  })

  if (res.status === 401) return { ok: false }
  if (!res.ok) throw new Error('Erro ao carregar projeto')

  const data = await res.json()
  return { ok: true, data }
}

function resetList() {
  currentList = null
}

function getList(type) {
  if (!currentList || currentList.tagName.toLowerCase() !== type) {
    currentList = document.createElement(type)
    contentEl.appendChild(currentList)
  }
  return currentList
}

function renderSections(sections) {
  sections.forEach(section => {
    let el

    switch (section.type) {
      case 'heading':
        resetList()
        el = document.createElement(`h${section.level}`)
        el.innerHTML = section.html
        el.className = styles.heading[section.level] || 'headline'
        break

      case 'text':
        resetList()
        el = document.createElement('p')
        el.innerHTML = section.html
        el.className = styles.text
        break

      case 'image':
        resetList()
        el = document.createElement('img')
        el.src = section.src
        el.alt = section.alt || ''
        el.loading = 'lazy'
        el.className = styles.image
        break

      case 'list-item':
        const list = getList(section.listType)
        el = document.createElement('li')
        el.innerHTML = section.html
        list.appendChild(el)
        return

      case 'quote':
        resetList()
        el = document.createElement('blockquote')
        el.innerHTML = section.html
        el.className = styles.quote
        break

      case 'code':
        resetList()
        el = document.createElement('pre')

        const code = document.createElement('code')
        code.className = `language-${section.language || 'css'}`
        code.textContent = section.html

        el.className = 'code-block'
        el.appendChild(code)
        break

      case 'divider':
        resetList()
        el = document.createElement('hr')
        break
    }

    if (el) {
      contentEl.appendChild(el)
    }
  })

  Prism.highlightAll()
}

const styles = {
  heading: {
    1: 'title',
    2: 'headline',
    3: 'block-title'
  },
  text: 'body-lg',
  quote: 'quote',
  code: 'language-css',
  image: 'content-image'
}

unlockButton.addEventListener('click', async () => {
  errorEl.hidden = true

  const password = passwordInput.value

  if (!password) {
    errorEl.textContent = 'Campo obrigatório.'
    errorEl.hidden = false
    return
  }

  try {
    const result = await verifyPassword(password)

    if (!result.ok) {
      errorEl.textContent = 'A senha informada está incorreta. Tente novamente.'
      errorEl.hidden = false
      return
    }

    passwordBox.remove()
    renderSections(result.data.sections)
  } catch (err) {
    errorEl.textContent = 'Erro ao carregar conteúdo.'
    errorEl.hidden = false
  }
})
