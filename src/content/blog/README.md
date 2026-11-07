# Blog

Como escrever, traduzir e anotar os posts do blog.

## Onde ficam os posts

Cada post é um arquivo Markdown por idioma:

```
src/content/blog/
├── en/<chave>.md   → /blog/<slug>/
└── pt/<chave>.md   → /pt/blog/<slug>/
```

- **A chave é o nome do arquivo** e é o que liga as traduções: `en/guia-definitivo-design-tokens.md` e `pt/guia-definitivo-design-tokens.md` são o mesmo post. Use o mesmo nome nas duas pastas.
- **O slug da URL** é a própria chave, a menos que o frontmatter defina `slug`. Use isso para a URL ficar no idioma do post (veja o exemplo abaixo).
- **Post sem tradução** funciona normalmente. O botão de troca de idioma leva para a listagem do blog no outro idioma.
- **A listagem** é ordenada pela data, do mais recente para o mais antigo.

## Frontmatter

```yaml
---
title: 'The Ultimate Guide to Design Tokens: What they are and how to use them'
description: 'Uma ou duas frases. Vira a descrição do post no SEO, no RSS e no compartilhamento.'
date: '2026-04-01'
cover: '/blog/covers/guia-definitivo-design-tokens-1.png'
slug: 'ultimate-guide-to-design-tokens'
tags: ['design tokens', 'design system']
related: ['design-tokens-resolver']
series: { id: 'guia-design-tokens', part: 1 }
---
```

| Campo | Obrigatório | Uso |
| --- | --- | --- |
| `title` | sim | Título do post, da página e do compartilhamento. |
| `description` | sim | Descrição para SEO, RSS e redes sociais. |
| `date` | sim | Data de publicação no formato `AAAA-MM-DD`. Define a ordem da listagem. |
| `cover` | não | Imagem de compartilhamento, em `public/blog/covers/` (1200×675). Pode ser gerada com `npm run blog:covers` (veja [Capa de SEO](#capa-de-seo)). Sem ela, usa `/blog/covers/cover.png`. |
| `slug` | não | Segmento da URL. Sem ele, usa o nome do arquivo. |
| `tags` | não | Palavras-chave do post: vão para os metadados de SEO, as categorias do RSS e a versão em Markdown. As que forem [temas](#temas) aparecem no fim do post, com link para a página do tema. |
| `related` | não | Chaves (nome do arquivo, sem `.md`) dos posts relacionados, na ordem desejada. Veja [Posts relacionados](#posts-relacionados). |
| `series` | não | Série da qual o post faz parte: `id` liga as partes e `part` define a ordem. Veja [Séries](#séries). |

O tempo de leitura é calculado sozinho (200 palavras por minuto).

## Fim do post

Depois do texto, cada post mostra, nesta ordem, o que se aplicar a ele:

### Séries

Posts com o mesmo `series.id` ganham um bloco "Parte 1 de 2 da série …" com a lista das partes em ordem e link para as outras. O nome da série fica em `series` no `src/i18n/blog.ts`, um por idioma; série sem nome quebra o build. A série também vai para o JSON-LD (`CreativeWorkSeries` e `position`).

### Temas

Alguns assuntos têm página própria, em `/blog/tag/<slug>/`, com uma introdução e a lista dos posts. Eles ficam em `src/lib/topics.ts`, com a tag de cada idioma, o slug, o nome e a descrição (que também é a meta description, de 120 a 155 caracteres).

- A página só existe no idioma em que o tema tiver pelo menos 2 posts. Abaixo disso ela seria rasa.
- Uma tag que não está em `topics.ts` continua só nos metadados. Antes de criar um tema, confira se ele não repete os mesmos posts de outro já existente.
- Os temas aparecem no fim de cada post e no topo da listagem do blog.

### Posts relacionados

Até 3 posts do mesmo idioma. Primeiro entram os do `related`, na ordem dada. O que faltar é preenchido pelos posts com mais tags em comum, desempatando pelo mais recente. As outras partes da mesma série não entram no preenchimento automático, porque já aparecem no bloco da série. Uma chave em `related` que não existe no idioma quebra o build.

Detalhes em `src/lib/posts.ts` e `src/components/PostFooter.astro`.

## Escrevendo

Markdown comum: `##` e `###` para seções (o `#` é o título, que já vem do frontmatter), listas, links, `**negrito**`, `` `código` `` e `---` para separar o fim do post.

Blocos de código ganham botão de copiar. Indique a linguagem para o realce de sintaxe:

````md
```json
{ "color": { "neutral": { "100": { "value": "#f8f9fa" } } } }
```
````

## Marca-texto

```md
Um design token é uma forma de ==transformar decisões de design em dados reutilizáveis==.
```

Vira um destaque amarelo desenhado à mão, que é traçado quando o trecho entra na tela.

- O `==` precisa colar no texto: `==assim==`. Comparações soltas como `x == y` ficam como texto.
- O destaque não atravessa parágrafos, itens de lista nem células de tabela.
- Dentro de código nada é tocado.
- Formatação dentro do destaque funciona: `==um **destaque** forte==`.
- Cada destaque sai com um traço diferente, e o mesmo post sempre rende o mesmo desenho.

Detalhes em `src/lib/remark-highlight.mjs`.

## Nota na margem

```md
Já quando tratamos de ser independente de plataforma, (...) entre várias outras. ^[token não é variável do Figma!]
```

Vira uma nota escrita à mão, com um colchete marcando o parágrafo inteiro:

- a partir de 1280px, o colchete fica ao lado do parágrafo e a nota na margem direita;
- abaixo disso, o colchete fica deitado embaixo do parágrafo e a nota centralizada sob ele.

Regras:

- O `^[...]` precisa ser a última coisa do parágrafo e vale para ele inteiro.
- Só em parágrafos soltos do texto. Dentro de lista, citação ou tabela, fica como texto.
- O texto da nota é simples: sem formatação e sem `]`.
- Prefira notas curtas, de poucas palavras. Uma nota mais alta que o parágrafo empurra o texto seguinte para baixo.
- Evite símbolos fora do alfabeto latino (como `≠` ou `→`). A fonte manuscrita (Caveat) não tem esses caracteres e eles aparecem em outra fonte.

Leitores de tela ouvem "Nota na margem:" (ou "Margin note:") antes do texto. Detalhes em `src/lib/remark-margin-note.mjs`.

Com o cursor sobre a nota (só em dispositivos com mouse), o resto do post esmaece e só o parágrafo anotado fica em destaque. É um efeito apenas visual, sem impacto em leitores de tela ou na navegação por teclado.

## Usando com moderação

Destaques e notas chamam atenção justamente por serem raros. Como referência, o guia de design tokens tem 3 destaques e 1 nota em todo o post.

- **Destaque:** a frase que resume uma ideia, no máximo um por seção.
- **Nota:** um comentário pessoal, que não caberia no texto, sobre um ponto em que o leitor costuma tropeçar.
- **Traduções:** as duas versões devem ter os mesmos destaques e notas, nos mesmos parágrafos.

## Capa de SEO

```sh
npm run blog:covers                      # posts sem capa e capas já geradas
npm run blog:covers -- <chave>           # só esse post, nos dois idiomas
npm run blog:covers -- <chave> --force   # substitui também uma capa feita à mão
```

Gera uma capa por idioma em `public/blog/covers/<chave>-<idioma>.png`, com a foto do autor (`public/img/mtsvlln.jpg`) no topo, o título do post sobre fundo claro e "Mateus Villain" embaixo, e grava o caminho no `cover` do frontmatter.

- Capas feitas à mão (um `cover` com outro caminho) não são tocadas sem `--force`.
- Mudou o título? Rode de novo para atualizar a imagem.
- O texto usa a Geist, de `scripts/fonts/`, então a capa sai igual em qualquer máquina.

Detalhes em `scripts/blog-covers.js`.

## Versão em Markdown

Cada post também é publicado como Markdown cru em `/blog/<slug>.md` (e `/pt/blog/<slug>.md`), para agentes e LLMs, e aparece no `llms.txt`. As marcações ficam legíveis nessa versão: `==trecho==` e `^[nota]`, esta última no formato de nota de rodapé em linha do Pandoc.

## Antes de publicar

- [ ] Arquivo com o mesmo nome em `en/` e `pt/` (se houver tradução)
- [ ] `title`, `description` e `date` preenchidos; `slug` em inglês na versão `en`
- [ ] `related` e `series` (se houver) iguais nas duas versões
- [ ] Capa em `public/blog/covers/` (feita à mão ou com `npm run blog:covers`)
- [ ] Destaques e notas iguais nas duas versões
- [ ] Conferir o post no celular e no desktop (a partir de 1280px, por causa das notas na margem)
