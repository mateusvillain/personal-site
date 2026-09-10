# Auditoria de acessibilidade — mateusvillain.com

Levantamento estático (sem execução em navegador) do código-fonte Astro, baseado em WCAG 2.1/2.2 nível AA. Nenhuma alteração foi feita no código.

## Críticos

### 1. Trocador de idioma inoperável via teclado
`<a id="lang-switch" data-i18n="language" data-link="language">` não tem atributo `href`. Um `<a>` sem `href` não é focável nem tem role de link, então o clique tratado em `public/js/lang.js` nunca é alcançável via Tab/Enter.

- `src/components/HomeContent.astro:41-45`
- `src/components/AboutContent.astro:9-13`
- `src/components/NotFoundContent.astro:1`
- **WCAG:** 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)
- **Correção sugerida:** trocar por `<button type="button">`.

### 2. Página `/about` renderiza "undefined" em vários textos
`AboutContent.astro` usa `data-i18n="menu-about"` e `data-i18n="about-1"` até `"about-6"`, mas essas chaves **não existem mais** em `public/lang/en.json` nem `public/lang/pt.json` (foram removidas numa edição anterior do bio). Como `lang.js` faz `el.innerHTML = data[key]`, o resultado é a string literal **"undefined"** escrita no heading e nos parágrafos da página, para todos os usuários — inclusive leitores de tela.

- `src/components/AboutContent.astro:65,67,76,79,82,85,88`
- **WCAG:** 1.3.1 (Info and Relationships) — conteúdo sem sentido semântico
- **Correção sugerida:** reintroduzir as chaves em `public/lang/*.json` ou reescrever `AboutContent.astro` para não depender delas.

## Médios

### 3. Conteúdo i18n sem fallback no HTML
Elementos como `<lui-heading data-i18n="blog-title"></lui-heading>` nascem vazios no SSR e só recebem texto via fetch assíncrono em `lang.js`. Se o JS falhar, atrasar ou for bloqueado, headings/parágrafos ficam vazios para o leitor de tela.

- Todas as ocorrências de `data-i18n` sem texto interno em `HomeContent.astro`, `ProjectWidgets.astro`, `AboutContent.astro`, `NotFoundContent.astro`
- **WCAG:** 1.3.1, 4.1.2

### 4. Skip link existe em apenas uma página
`.skip-link` (`src/sass/general/_style.scss:197-209`) está implementado somente em `LocawebDesignSystemContent.astro`. Home, Blog, About, Mentoria e 404 não têm link "Ir para o conteúdo principal".

- **WCAG:** 2.4.1 (Bypass Blocks)

### 5. Conteúdo principal fora do landmark `<main>` na Home
`<main class="hero">` fecha antes do quadro de projetos (`ProjectWidgets`) e da seção "Last posts" — a maior parte do conteúdo da página fica fora do `<main>`.

- `src/components/HomeContent.astro` (fechamento do `<main>` antes de `<ProjectWidgets />` e da seção de posts)
- **WCAG:** 1.3.1 / navegação por landmarks

### 6. Pulo de nível de heading no FAQ da Mentoria
"Perguntas frequentes" renderiza como `h3` (variant `headline`), e cada pergunta usa `variant="block-title"`, que renderiza como `h5` — pulando o `h4`.

- `src/components/MentorshipContent.astro:260-303`
- **WCAG:** 1.3.1, 2.4.6

### 7. Toggle de tema sem indicador de foco visível
O `<input type="checkbox" id="theme-toggle">` fica com `opacity: 0; position: absolute` e não há regra `:focus`/`:focus-visible` associada ao track/thumb visível. Usuário de teclado não vê onde está o foco ao tabular até o toggle.

- `src/sass/general/_style.scss:211-262`
- **WCAG:** 2.4.7 (Focus Visible)

### 8. Cards arrastáveis sem instrução nem anúncio de estado
`<article class="pcard" tabindex="0" aria-roledescription="card de projeto">` responde a setas do teclado e Escape, mas não há texto explicando que o card é arrastável, e a mudança de posição não é comunicada via `aria-live`/`role="status"`.

- `src/components/ProjectWidgets.astro:43-49, 368-392`
- **WCAG:** 4.1.2, 4.1.3

### 9. Ações de cópia sem feedback assistivo
O botão "Copiar link" do post e o script associado só mudam classe CSS (tooltip visual); não há `aria-live`/`role="status"` anunciando "link copiado" para leitores de tela.

- `src/pages/blog/[slug].astro:72,147-155`, `public/js/copy-link.js`
- **WCAG:** 4.1.3 (Status Messages)

### 10. Alt inconsistente entre fotos semelhantes
`polaroid-1.png` tem alt descritivo completo, mas `polaroid-2.png` (mesma seção, mesmo tipo de foto editorial) está com `alt=""`, tratando uma imagem de conteúdo como puramente decorativa.

- `src/components/AboutContent.astro:85` (comparar com linhas 71-72)
- **WCAG:** 1.1.1

## Baixos

### 11. Links externos sem aviso de nova aba
23 ocorrências de `target="_blank"` no código não indicam textual/visualmente que abrem em nova guia.

- **WCAG:** 3.2.5 (boa prática, não obrigatório em AA)

### 12. Campo de senha fora de `<form>`
`#password` + `#unlock` no case study não estão dentro de um `<form>`; pressionar Enter no campo não dispara a verificação, só o clique/Enter no botão funciona.

- `src/components/LocawebDesignSystemContent.astro:297-306`

### 13. Possível aninhamento de elementos interativos
Os botões de compartilhar (LinkedIn/X) usam `<lui-link>` envolvendo `<lui-icon-button>`, o que pode gerar `<a><button></button></a>` no DOM renderizado (elementos interativos aninhados, inválido em HTML/AT). Precisa verificação do shadow DOM real do design system.

- `src/pages/blog/[slug].astro:79-136`

---

## Observação fora do escopo estrito de acessibilidade

A lista de navegação com os links "Blog" e "Mentorias" no hero da Home foi removida na última edição de `HomeContent.astro` — hoje não há mais caminho direto para `/mentorship/` a partir da Home. Não é uma falha WCAG por si só, mas vale revisar a navegação do site.
