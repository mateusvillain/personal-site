# Mateus Villain

Este repositório contém o código do meu site pessoal em Astro, com páginas estáticas, dois idiomas e blog com posts em Markdown.

O site está publicado em: https://www.mateusvillain.com

## Idiomas

- `www.mateusvillain.com` — inglês (padrão, sem prefixo)
- `www.mateusvillain.com/pt/` — português brasileiro

As rotas ficam em `src/pages/[...locale]/` e são geradas uma vez por idioma. Os textos de interface ficam em `src/i18n/` (um arquivo por página, com `en` e `pt` tipados a partir do mesmo objeto). Cada página declara `canonical`, `hreflang` (`en`, `pt-BR`, `x-default`) e `og:locale`, e o `sitemap.xml` repete os mesmos pares.

Os posts do blog têm um arquivo por idioma em `src/content/blog/{en,pt}/`. O nome do arquivo liga as traduções; o `slug` do frontmatter define a URL naquele idioma.

## Tecnologias

- Astro: Estrutura das páginas e geração estática
- SCSS: Estilos e organização do design
- JavaScript: Interações
- TypeScript: Dicionários de idioma
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
│   └── js/                         # Scripts públicos do site
│
├── scripts/
│   └── images.js                   # Exporta as imagens em `webp` no `dist`
│
├── src/
│   ├── components/                 # Componentes e conteúdos das páginas
│   ├── content/                    # Coleções de conteúdo do Astro
│   │   └── blog/
│   │       ├── en/                 # Posts em inglês
│   │       └── pt/                 # Posts em português
│   │
│   ├── i18n/                       # Configuração de idiomas e dicionários
│   ├── layouts/                    # Layouts Astro
│   ├── lib/                        # Helpers (posts, datas)
│   ├── pages/                      # Rotas do site
│   │   ├── [...locale]/            # Rotas geradas para cada idioma
│   │   │   ├── blog/               # Blog e posts
│   │   │   ├── case/               # Páginas de cases
│   │   │   ├── index.astro         # Página inicial
│   │   │   └── mentorship.astro    # Página de mentorias e consultoria
│   │   └── 404.astro               # Página de erro 404 (bilíngue)
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
