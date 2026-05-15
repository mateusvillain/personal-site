---
title: 'Design Tokens Resolver: o módulo nativo para gerar tokens e condicionais'
description: 'Aprenda a usar o Design Tokens Resolver para dar escalabilidade aos seus tokens e criar múltiplas condicionais para temas e breakpoints.'
date: '2026-02-17'
cover: '/blog/covers/design-tokens-resolver.png'
tags:
  [
    'design system',
    'design tokens',
    'design tokens community group',
    'dtcg',
    'design tokens resolver module',
    'resolver',
  ]
---

Um desafio que toda empresa passa quando está estruturando os seus design tokens, principalmente do lado de engenharia, é na forma que será executada a leitura dos seus tokens para converter em formato de estilo.

Cada caso é um caso. Muitas plataformas precisam apenas do simples, como o light e dark mode, outras precisam se adaptar a marcas diferentes (o chamado multi-brand), e ainda há quem vai além com múltiplos temas visuais atendendo a acessibilidade e até mesmo a diferentes breakpoints.

Não há limitação para nenhum desses exemplos que dei quando falamos de design tokens, contudo, o gargalo está mais concentrado na parte técnica. Muitas empresas optam por utilizar Style Dictionary como pacote de leitura e conversão de tokens para diversos sistemas, exigindo configuração manual para que a build dos tokens aconteça de forma correta. Popularmente nos últimos anos, vemos uma aderência forte ao Tokens Studio (antigo Figma Tokens) junto do Style Dictionary, terceirizando o trabalho de configuração para múltiplos temas, mas a um custo que nem toda a empresa consegue arcar.

Para solucionar esses problemas e evitar que a dependência continue com a ferramenta, a [Design Tokens Community Group (DTCG)](https://www.designtokens.org) criou o [resolver](https://www.designtokens.org/tr/2025.10/resolver/), lançado oficialmente em 28 de outubro de 2025 (dia também conhecido como meu aniversário), com um módulo nativo para calcular como os design tokens são conectados e gerados. O resolver trata de como decidir, de forma determinística, qual valor final deve emergir quando existem aliases, modos, sets e sobreposições contextuais.

## Estruturando um resolver

Vamos começar com um exemplo simples, imaginando a seguinte estrutura de arquivos:

```
design-system/
├── dist/
│   └── tokens.css
├── tokens/
│   ├── primitive/
│   │   ├── theme/
│   │   │   ├── color.dark.json
│   │   │   └── color.light.json
│   │   ├── spacing/
│   │   │   ├── spacing.desktop.json
│   │   │   └── spacing.mobile.json
│   │   └── typography/
│   │       ├── typography.base.json
│   │       ├── typography.desktop.json
│   │       └── typography.mobile.json
│   └── semantic/
│       ├── color/
│       │   ├── color.background.json
│       │   └── color.text.json
│       ├── spacing/
│       │   ├── spacing.breakpoint.json
│       │   └── spacing.layout.json
│       └── typography/
│           └── typography.size.json
├── tokens.resolver.json
└── package.json
```

Nessa estrutura, estou separando os design tokens em pastas, pelos grupos primitivo e semântico, e por arquivos, mantendo um controle de edição e versionamento mais preciso. Repare que na pasta primitive, inclusive, estou separando os design tokens em arquivos diferentes por modos, sendo um para temas de cor claro e escuro, e o outro para breakpoints, onde a nomenclatura se mantém igual, mas os valores são diferentes.

```json
//color.light.json
{
  "color": {
    "$type": "color",
    "brand": {
      "100": { "value": "#eff4ff" },
      "200": { "value": "#adc9ff" },
      "300": { "value": "#6095ff" },
      "400": { "value": "#1e69ff" }
    }
  }
}
```

```json
//spacing.desktop.json
{
  "spacing": {
    "$type": "dimension",
    "sm": {
      "value": "4",
      "unit": "px"
    },
    "md": {
      "value": "8",
      "unit": "px"
    },
    "lg": {
      "value": "16",
      "unit": "px"
    }
  }
}
```

Esses design tokens são posteriormente utilizados para criar novos design tokens, mas sendo utilizando como alias. De forma extremamente simples, podemos ter o seguinte:

```json
//color.background.json
{
  "color": {
    "$type": "color",
    "background": {
      "surface": {
        "$value": "{color.brand.200}"
      },
      "container": {
        "$value": "{color.brand.400}"
      }
    }
  }
}
```

Com isso, o valor final de `color.background.surface` depende do modo que estará ativo no produto, que no nosso caso, é controlado via `@media` e data attributes (`data-*`). Para evitar que seja necessário fazer uma série de configurações manuais, como faz parte do cenário atual de muitas empresas, o Resolver ajuda a mapear todos os arquivos e a separar os valores sem substituições.

### Critérios obrigatórios

Antes de te explicar como funciona cada parte do resolver, duas coisas importantes que você precisa saber para a configuração correta do arquivo:

- O resolver deve utilizar a sintaxe em JSON
- O nome do arquivo deve conter a extensão `.resolver.json`
- O versionamento correto para funcionamento (a atual é 2025.10)
- O `resolutionOrder` definido no documento

### Versionamento e identificação

Para que o resolver funcione corretamente, o arquivo deve obrigatoriamente ter declarado a versão. Até o momento, a versão `2025.10` é a única lançada e em funcionamento.

Além disso, também é possível declarar `name` e `description` para identificação do resolver, apesar de serem valores opcionais.

```json
{
  "name": "Design System",
  "description": "Design Tokens Resolver",
  "version": "2025.10"
}
```

### Sets

Os sets são as coleções de design tokens organizadas pelo próprio responsável do design system. Como eu mencionei no início do artigo, existem inúmeras formas de organizar os tokens. Muitos designers e engenheiros definem todos os tokens num arquivo único, ou separam por categorias (primitivos, semânticos e componentes), e até mesmo um arquivo único para cada tipo de token, como no exemplo que trouxe.

A definição dos sets no resolver corresponde a quais arquivos de design tokens você deseja mapear quando for executar a build de tokens para estilo.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    "colors": {
      "description": "Semantic colors",
      "sources": [
        { "$ref": "semantic/color.background.json" },
        { "$ref": "semantic/color.text.json" }
      ]
    },
    "spacing": {
      "description": "Semantic spacing",
      "sources": [
        { "$ref": "spacing.layout.json" },
        { "$ref": "spacing.breakpoint.json" }
      ]
    }
  }
}
```

No exemplo, criei dois sets, sendo o primeiro para cores referenciando apenas um único arquivo, e o segundo para espaçamentos, também fazendo referência a um único arquivo. O formato exige que cada `source` seja obrigatoriamente um array, mesmo que haja apenas um único arquivo de referência. A ordem dos sets não é importante, pois é definida no `resolutionOrder` (já falaremos dele), mas dos `sources` é importante. Caso hajam valores repetidos entre os arquivos, apenas o último valor mencionado na ordem será gerada.

Além disso, também é possível definir uma `description` para cada set criado, para dar maior contexto do seu uso.

### Modifiers

Os modificadores são como os sets, organizam coleções de design tokens, mas possuem a finalidade de criar condicionais com os valores.

No nosso exemplo, temos arquivos de design tokens voltados para os modos de cor claro e noturno, e para espaçamentos mobile e desktop. Para que não haja dados sobrescritos, além das nomenclaturas dos tokens estarem batendo, é importante que os modifiers estejam indicando quais arquivos farão trocas de valores.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    // ...
  },
  "modifiers": {
    "theme": {
      "description": "Light and dark mode",
      "contexts": {
        "dark": [{ "$ref": "primitive/colors/color.dark.json" }],
        "light": [{ "$ref": "primitive/colors/color.light.json" }]
      },
      "default": "light"
    },
    "size": {
      "description": "Mobile and desktop sizes",
      "contexts": {
        "mobile": [
          { "$ref": "primitive/spacing/spacing.mobile.json" },
          { "$ref": "primitive/typography/typography.mobile.json" }
        ],
        "desktop": [
          { "$ref": "primitive/spacing/spacing.desktop.json" },
          { "$ref": "primitive/typography/typography.desktop.json" }
        ]
      },
      "default": "desktop"
    }
  }
}
```

No exemplo, criei dois modifiers para o design system: o primeiro para os modos de cor claro e noturno, e o segundo para espaçamentos em dispositivos mobile e desktop.

Assim como os sets que utilizam `sources`, os modifiers devem ter obrigatoriamente `contexts` com pelo menos dois contextos, em formato array. Para cada `contexts` é possível definir um valor `default` que indica qual a base padrão do produto.

### resolutionOrder

A última definição do resolver é o resolution order, que define a ordem em que as coleções de tokens (sets e modifiers) serão geradas durante a build. Mesmo que a ordem dos arquivos sejam importantes nos sets e modifiers, essa é a ordenação prioritária do resolver.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    // ...
  },
  "modifiers": {
    // ...
  },
  "resolutionOrder": [
    { "$ref": "#/modifiers/theme" },
    { "$ref": "#/modifiers/size" },
    { "$ref": "#/sets/colors" },
    { "$ref": "#/sets/spacing" }
  ]
}
```

Como a ordem dos arquivos já foi definida anteriormente, no resolution order precisamos apenas aplicar a ordem dos sets e modifiers. No exemplo, estou priorizando a geração dos modos de cor e valores desktop e mobile, ou seja, tokens primitivos, para em seguida gerar os tokens semânticos.

## Esse é só o começo

Estruturei e escrevi esse artigo com exemplos que você pode utilizar na prática, mas eu não dispenso de forma alguma a leitura da [documentação oficial da DTCG](https://www.designtokens.org/tr/2025.10/resolver/#bundling). Não se espante com a página longa, os textos são curtos e a documentação é repleta de exemplos.

Por ser um módulo criado recentemente, ainda está na sua primeira versão e com poucas aplicações que permitem utilizá-la. Se quiser experimentar, recomendo utilizar o [Terrazzo](https://terrazzo.app/docs/2.0/guides/resolvers/), um pacote semelhante ao Style Dictionary, mas que está em maior conformidade com as novas diretrizes da DTCG.
