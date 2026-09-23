---
title: 'O Guia Definitivo dos Design Tokens: O que são e como usar?'
description: 'Design Tokens são variáveis que armazenam valores visuais do seu design system, como cores, tipografia e espaçamentos. Saiba como usar e escalar seu design system de forma eficiente.'
date: '2026-04-01'
cover: '/blog/covers/guia-definitivo-design-tokens-1.png'
tags:
  [
    'design tokens',
    'design system',
    'style dictionary',
    'primitive tokens',
    'semantic tokens',
    'component tokens',
  ]
---

Se você já trabalhou com design system, provavelmente já esbarrou naquele problema clássico: manter consistência sem transformar tudo em um caos difícil de escalar. Cenários como cores duplicadas, espaçamentos inconsistentes e decisões espalhadas entre design e código, com o tempo começam a cobrar um preço.

É justamente nesse ponto que os design tokens entram. Eles são uma forma de organizar decisões de design como dados, algo que pode ser compartilhado, versionado e usado em qualquer plataforma.

Neste guia, a ideia é sair do básico e entender de verdade como os design tokens funcionam na prática: desde o conceito até a aplicação em um design system real, passando pelos diferentes níveis de abstração e pelos desafios de escala.

## O que é um design token?

Design tokens são unidades de dados estruturadas que representam decisões de design de forma independente de plataforma.

Quando falamos sobre representar decisões de design, nos referimos a cada atributo utilizado num produto digital. Cada decisão, por menor que seja, possui um significado, e esses significados são representados pelos design tokens.

Por exemplo, uma cor azul solta pode não ter significado algum, mas quando inserida numa interface, como um botão de hierarquia primária, ele ganha uma atribuição, representando a cor de fundo para botões com o maior nível de hierarquia do produto.

Já quando tratamos de ser independente de plataforma, é importante lembrarmos que um design token não é uma variável ou estilo no Figma, muito menos um CSS custom property. Design tokens são estruturados em JSON, de forma que possuam um formato agnóstico que possa ser interpretado por qual sistema ou linguagem, permitindo serem transformados em linguagens usáveis como CSS, Sass, JavaScript, Flutter, Swift, entre várias outras.

O formato de um design token segue o seguinte padrão:

```json
{
  "color": {
    "background": {
      "type": "color",
      "page": {
        "value": "#ffffff",
        "description": "Cor de fundo das páginas"
      }
    }
  }
}
```

Nesse exemplo, temos um design token chamado `color.background.page` que representa a cor branca. Ele possui um valor literal `#ffffff` e uma descrição que explica seu significado.

Conforme vamos afunilando a nomenclatura, por meio de chaves, vamos aumentando a nomenclatura do token, até a sua camada final onde definimos o valor, e opcionalmente, uma descrição. Além disso, design tokens exigem que você identifique seu tipo, representado por `$type`, que pode ser `color`, `dimension`, `number`, `typography`, entre outros.

Em outras palavras, um design token é uma forma de transformar decisões de design em dados reutilizáveis.

## Níveis de design tokens

Quando trabalhamos com design tokens, normalmente seguimos uma estrutura de três níveis, onde cada nível representa um nível de abstração diferente:

- Primitive Tokens
- Semantic Tokens
- Component Tokens

Entenda melhor o conceito e estrutura de cada um a seguir:

### Primitive Tokens

Primitive Tokens (tokens primitivos), também conhecidos como Basic Tokens (tokens básicos), são os blocos de construção fundamentais do seu design system. Eles representam as propriedades visuais puras, como cores, bordas e espaçamentos, sem contexto ou significado. Pense neles como os ingredientes básicos que você usa para criar suas receitas.

Eles existem para garantir consistência e evitar valores soltos no projeto. Em vez de usar `#3B82F6` ou `16px` diretamente no código, você centraliza isso em tokens reutilizáveis.

Comumente, vemos esses tokens nomeados de forma objetiva, descrevendo apenas o valor que recebem, e seguindo um padrão de escala, como `sm`, `md`, `lg`, e `100`, `200`, `300`.

```json
{
  "color": {
    "neutral": {
      "type": "color",
      "100": {
        "value": "#f8f9fa"
      },
      "200": {
        "value": "#e9ecef"
      },
      "300": {
        "value": "#dee2e6"
      }
    }
  }
}
```

Nesse nível, não importa onde esses valores serão usados. Eles são apenas a base que sustenta todo o restante do sistema.

### Semantic Tokens

Semantic Tokens (tokens semânticos) são o segundo nível, que adicionam significado aos tokens primitivos. Em vez de representar um valor direto, eles representam uma intenção dentro da interface, como “cor de fundo”, “texto principal” ou “espaçamento entre elementos”.

Eles normalmente referenciam tokens primitivos, fazendo o que chamamos de **alias**, que é quando um design token não possui valor próprio, apenas aponta para outro token.

Aqui, o foco não é mais o valor em si, mas o papel que ele desempenha. Isso deixa o design system mais flexível e fácil de manter.

```json
{
  "color": {
    "background": {
      "type": "color",
      "primary": {
        "value": "{color.neutral.100}"
      },
      "secondary": {
        "value": "{color.neutral.200}"
      }
    },
    "text": {
      "primary": {
        "value": "{color.neutral.600}"
      },
      "secondary": {
        "value": "{color.neutral.500}"
      }
    }
  }
}
```

### Component Tokens

Component Tokens (tokens de componente), como o próprio nome sugere, são design tokens específicos para componentes do design system, como `Button`, `Card`, `Text Field`, entre outros. Eles conectam os tokens semânticos diretamente à implementação dos componentes.

Nesse nível, você define como cada parte do componente deve se comportar visualmente: cor de fundo, padding, borda, estado hover, entre outros.

```json
{
  "button": {
    "background": {
      "type": "color",
      "primary": {
        "value": "{color.background.primary}"
      },
      "secondary": {
        "value": "{color.background.secondary}"
      }
    }
  }
}
```

Diferente dos dois anteriores, Component Tokens são mais difíceis de escalar e dar manutenção. Conforme vamos criando cada token a partir de cada detalhe do componente, rapidamente aumentamos o número de tokens em larga escala, o que pode causar mais bagunça ao produto do que um verdadeiro auxílio.

Além disso, Component Tokens não são reutilizáveis como Semantic Tokens. Uma vez que você cria um token como `button-background-primary`, ele servirá apenas para o `Button`, diferente de um token semântico chamado `color-background-primary` que pode ser utilizado para diferentes casos de plano de fundo primário.

## Uso prático

A estrutura de um token nada mais é do que um JSON, para ser completamente agnóstico de plataformas. Ao mesmo que você usa tokens para web, você também pode usar para aplicativos mobile. Cada sistema vai usar uma linguagem diferente, e para não precisar recriar tokens, usamos JSON como base, e traduzimos esses tokens para a linguagem que precisamos.

No caso da web, traduzimos design tokens de JSON para CSS, que é a linguagem de estilo aceita pelos navegadores. Para isso, usamos ferramentas que realizam a leitura dos tokens e geram os arquivos CSS necessários.

Pegando novamente o exemplo de design tokens primitivos:

```json
{
  "color": {
    "neutral": {
      "type": "color",
      "100": {
        "value": "#f8f9fa"
      },
      "200": {
        "value": "#e9ecef"
      },
      "300": {
        "value": "#dee2e6"
      }
    }
  }
}
```

Quando rodamos essa estrutura num tradutor de design tokens para CSS, recebemos o seguinte formato:

```css
:root {
  --color-neutral-100: #f8f9fa;
  --color-neutral-200: #e9ecef;
  --color-neutral-300: #dee2e6;
}
```

Com isso, conseguimos usar as cores no projeto sem precisar realizar qualquer tipo de trabalho manual.

Existem algumas ferramentas que realizam essa tradução, e felizmente a maioria delas é open-source. A mais famosa entre elas e uma das mais completas é o [Style Dictionary](https://styledictionary.com/), que permite transformar seus tokens para todo tipo de plataforma (Web, iOS e Android).

---

Essa é apenas a primeira publicação do Guia Definitivo de Design Tokens. Nos próximos dias, trarei uma sequência de artigos aprofundando melhor em cada um dos tópicos abordados, mas indo além no conceito e aplicação.

Caso não queira perder as próximas publicações, fica a recomendação: você se inscrever na newsletter e me seguir no [LinkedIn](https://www.linkedin.com/in/mateusvillain/).
