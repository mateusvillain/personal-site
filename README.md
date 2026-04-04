# Mateus Villain

Este repositório contém o código do meu site pessoal, com páginas com conteúdo estático, suporte a múltiplos idiomas via JSON, e blog desenvolvido em Astro com posts em markdown.

O site está publicado em: https://mateusvillain.com

## Tecnologias

- HTML: Estrutura das páginas
- SCSS: Estilos e organização do design
- JavaScript: Interações
- JSON: Arquivos de idioma
- Astro: Blog
- Markdown: Posts do blog

## Estrutura

```
personal-site/
├── api/
│   ├── callback.js                 # Callback do Spotify
│   ├── mood.js                     # Estrutura de mood conectada ao Notion
│   ├── newsletter.js               # Estrutura de newsletter conectada ao Notion
│   ├── project.js                  # Cria a estrutura do projeto e insere a senha
│   ├── projects.js                 # Realiza a conexão com a database do Notion
│   ├── spotify.js                  # Busca a música ouvida no momento no Spotify
│   ├── time.js                     # Busca o horário atual do local
│   └── weather.js                  # Busca o clima atual do local
│
├── blog/                           # Blog desenvolvido em Astro
│   ├── public/                     # Arquivos públicos do blog
│   │   ├── covers/                 # Capas dos posts do blog
│   │   └── js/                     # Scripts do blog
│   │
│   └── src/                        # Arquivos privados do blog
│       ├── content/                # Posts do blog
│       ├── layouts/                # Layouts do blog
│       └── scss/                   # Arquivos .scss do blog
│
├── src/
│   ├── font/                       # Fontes utilizadas no site
│   ├── img/                        # Imagens e assets visuais
│   │
│   ├── js/
│   │   ├── analytics.js            # Eventos enviados para o Google Analytics
│   │   ├── copy-link.js            # Copia o link da página
│   │   ├── images.js               # Exporta as imagens em `webp`
│   │   ├── lang.js                 # Realiza a mudança de idioma do site
│   │   ├── mood.js                 # Adiciona o sistema de mood no site
│   │   ├── project-protected.js    # Adiciona senha para relevar conteúdo
│   │   ├── spotify.js              # Exibe a música e artista tocando no momento
│   │   ├── theme.js                # Realiza a mudança de tema do site
│   │   ├── time.js                 # Exibe e atualiza o horário da cidade a cada 1s
│   │   └── weather.js              # Exibe o clima local da cidade
│   │
│   ├── lang/                       # Arquivos de idioma do site
│   │   ├── en.js
│   │   └── pt.js
|   |
│   ├── pages/                      # Páginas do site
│   │   ├── case/                   # Páginas de cases
│   │   ├── 404.html                # Página de erro 404
│   │   ├── about.html              # Página sobre mim
│   │   ├── index.html              # Página inicial
│   │   └── mentorship.html         # Página de mentorias e consultoria
|   |
│   ├── partials/                   # Partials do site
│   │   ├── 404.html                # Conteúdo da página de erro 404
│   │   ├── about.html              # Conteúdo da página sobre mim
│   │   ├── index.html              # Conteúdo da página inicial
│   │   ├── mentorship.html         # Conteúdo da página de mentorias e consultoria
│   │   └── scripts.html            # Scripts do site
│   │
│   ├── sass/                       # Arquivos .scss do site
│   │   ├── blog/                   # Arquivos .scss de blog
│   │   ├── general/                # Arquivos .scss gerais
│   │   ├── blog.scss               # Conexão dos arquivos .scss de blog
│   │   └── general.scss            # Conexão dos arquivos .scss gerais
```

## Como rodar localmente

```
git clone https://github.com/mateusvillain/personal-site.git
cd personal-site
npm install
```

## Contato

- [LinkedIn](https://linkedin.com/in/mateusvillain)
- contato@mateusvillain.com
