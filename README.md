# Mateus Villain

Este repositório contém o código do meu site pessoal em Astro, com páginas estáticas, dois idiomas e blog com posts em Markdown.

O site está publicado em: https://www.mateusvillain.com

## Idiomas

- `www.mateusvillain.com` — inglês (padrão, sem prefixo)
- `www.mateusvillain.com/pt/` — português brasileiro

As rotas ficam em `src/pages/[...locale]/` e são geradas uma vez por idioma. Os textos de interface ficam em `src/i18n/` (um arquivo por página, com `en` e `pt` tipados a partir do mesmo objeto). Cada página declara `canonical`, `hreflang` (`en`, `pt-BR`, `x-default`) e `og:locale`, e o `sitemap.xml` repete os mesmos pares.

Os posts do blog têm um arquivo por idioma em `src/content/blog/{en,pt}/`. O nome do arquivo liga as traduções; o `slug` do frontmatter define a URL naquele idioma.

### Marca-texto

Para destacar um trecho do post, envolva o texto em `==`:

```markdown
Duas linhas para ==colocar dentro do app==.
```

O `==` vira `<mark>` (`src/lib/remark-highlight.mjs`) e recebe um dos oito traços de marcador desenhados em `src/sass/blog/_highlight.scss` — uns cheios, outros finos passando só na parte de baixo do texto, cada um torto de um jeito, como caneta de verdade. O sorteio parte do texto do primeiro destaque e anda com a posição dos seguintes, percorrendo os oito antes de repetir qualquer um: parece aleatório na leitura, mas o mesmo post rende sempre o mesmo desenho, sem mudar de forma a cada build.

- O `==` precisa colar no texto (`==assim==`), então comparações soltas como `x == y` continuam texto normal.
- Dentro de bloco de código ou de `code` inline nada é convertido.
- Formatação aninhada funciona: `==um **destaque** forte==`.
- Escrever a tag na mão também funciona, inclusive escolhendo o traço: `<mark data-hl="3">trecho</mark>`.

Quando o trecho entra na tela, o traço é desenhado da esquerda para a direita (`public/blog/js/highlight.js`), como quem passa a caneta — uma vez só, com duração proporcional ao tamanho do destaque. Num destaque que quebra de linha, o traço termina uma linha antes de começar a próxima, na ordem da leitura. Sem JavaScript, ou com "reduzir movimento" ligado no sistema, o destaque simplesmente já aparece pronto.

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
