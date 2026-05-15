# Mateus Villain

Este repositório contém o código do meu site pessoal em Astro, com páginas estáticas, suporte a múltiplos idiomas via JSON e blog com posts em Markdown.

O site está publicado em: https://mateusvillain.com

## Tecnologias

- Astro: Estrutura das páginas e geração estática
- SCSS: Estilos e organização do design
- JavaScript: Interações
- JSON: Arquivos de idioma
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
├── public/                         # Assets servidos diretamente pelo Astro
│   ├── blog/                       # Capas e scripts públicos do blog
│   ├── fonts/                      # Fontes utilizadas no site
│   ├── img/                        # Imagens e assets visuais
│   ├── js/                         # Scripts públicos do site
│   └── lang/                       # Arquivos de idioma do site
│
├── scripts/
│   └── images.js                   # Exporta as imagens em `webp` no `dist`
│
├── src/
│   ├── components/                 # Componentes e conteúdos das páginas
│   ├── content/                    # Coleções de conteúdo do Astro
│   │   └── blog/                   # Posts do blog
│   │
│   ├── layouts/                    # Layouts Astro
│   ├── pages/                      # Rotas do site
│   │   ├── blog/                   # Blog e posts
│   │   ├── case/                   # Páginas de cases
│   │   ├── 404.astro               # Página de erro 404
│   │   ├── about.astro             # Página sobre mim
│   │   ├── index.astro             # Página inicial
│   │   └── mentorship.astro        # Página de mentorias e consultoria
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
npm run dev
```

Para gerar a versão de produção:

```
npm run build
```

## Contato

- [LinkedIn](https://linkedin.com/in/mateusvillain)
- contato@mateusvillain.com
