---
title: 'Formato e Especificação DTCG: todos os tipos de Design Tokens explicados'
description: 'O formato DTCG define como um design token é escrito em JSON: estrutura, aliases e todos os tipos, de color e dimension a shadow e typography. Com exemplos.'
date: '2026-10-29'
tags:
  [
    'design tokens',
    'dtcg',
    'design tokens community group',
    'token types',
    'composite tokens',
    'json',
    'design system',
  ]
---

No [primeiro artigo do Guia Definitivo dos Design Tokens](https://www.mateusvillain.com/pt/blog/guia-definitivo-design-tokens/), vimos que um design token é uma decisão de design escrita como dado, em JSON, para ser independente de plataforma. Só que "JSON" não basta para duas ferramentas se entenderem. Cada uma poderia inventar sua própria estrutura, seus próprios nomes de propriedades e sua própria forma de escrever uma cor.

É para resolver isso que existe o **DTCG**, o Design Tokens Community Group. Neste artigo, você vai entender o que é essa especificação, como um arquivo de tokens é estruturado e, principalmente, **quais tipos de token existem e como cada um é escrito**, dos mais simples (cor, dimensão) aos compostos (sombra, tipografia, borda).

> **Um aviso sobre o primeiro artigo:** os exemplos dele usam `value` e `type`, o formato legado popularizado pelo Style Dictionary. A especificação DTCG usa `$value` e `$type`, com o prefixo `$`. É esse formato que vamos usar daqui para frente na série.

## O que é o DTCG?

O DTCG (Design Tokens Community Group) é o grupo de comunidade do W3C que mantém a especificação do **formato de arquivo** para trocar design tokens entre ferramentas.

O grupo reúne pessoas de times de design system, fornecedores de ferramentas e especialistas independentes.

Em 28 de outubro de 2025, o grupo publicou a **primeira versão estável**, chamada **2025.10**. Ela é dividida em módulos:

- **Format Module:** estrutura do arquivo, grupos, aliases, tipos simples e compostos.
- **Color Module:** como representar cores em diferentes espaços de cor.
- **Resolver Module:** como combinar conjuntos de tokens para gerar variações como temas e marcas (assunto do artigo sobre theming).

Um detalhe importante: a especificação é um relatório do Community Group. **Ela não é um padrão oficial do W3C** nem está na trilha de padrões do W3C. O próprio documento afirma que é considerada estável e destinada à implementação.

Na prática, o site oficial [designtokens.org](https://www.designtokens.org/) lista ferramentas como Figma, Style Dictionary, Tokens Studio, Penpot, Sketch e zeroheight entre os adotantes e participantes do grupo.

O objetivo é simples: um arquivo de tokens escrito hoje deve poder ser lido por ferramentas de design, de tradução (como o Style Dictionary) e de documentação, sem código de "cola" feito sob medida.

## Como um arquivo de tokens é organizado

Um arquivo de tokens é um JSON em que os objetos com `$value` são tokens e os objetos sem `$value` são grupos, que servem para organizar e compor nomes.

### Formato do arquivo

Arquivos de tokens são JSON. A especificação recomenda:

- **Extensões:** `.tokens` ou `.tokens.json`.
- **Tipo MIME:** `application/design-tokens+json` (o `application/json` também é aceito).

### Token, nome e valor

Um objeto que possui a propriedade `$value` é um token. A chave do objeto pai é o nome do token. Nome e valor são obrigatórios.

```json
{
  "color-brand": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [0, 0.4, 0.8]
    }
  }
}
```

Todas as propriedades definidas pela especificação começam com `$`. Por isso, nomes de tokens e de grupos **não podem começar com `$`**. Além disso, os caracteres `{`, `}` e `.` são proibidos em qualquer nome, porque fazem parte da sintaxe de alias e de caminho.

Os nomes diferenciam maiúsculas de minúsculas. Mesmo assim, evite tokens que só se diferenciam pela caixa (`font-size` e `FONT-SIZE`): ao exportar para outras linguagens, eles podem gerar variáveis duplicadas.

### Propriedades opcionais

Além de `$value`, um token pode ter:

| Propriedade | Para que serve |
|---|---|
| `$type` | Declara o tipo do valor (`color`, `dimension`, `shadow`...) |
| `$description` | Texto simples explicando o propósito do token |
| `$extensions` | Dados proprietários de ferramentas ou times, com chave em notação de domínio reverso |
| `$deprecated` | `true`, `false` ou uma string explicando a depreciação e o substituto |

Ferramentas **devem preservar** as `$extensions` que não entendem. Assim, um arquivo pode passar por várias ferramentas sem perder metadados.

### Grupos

Um grupo é um objeto **sem** `$value`. Ele serve para organizar tokens e compor nomes. A especificação é explícita: grupos são arbitrários, e ferramentas não devem inferir significado ou tipo a partir do nome do grupo.

```json
{
  "color": {
    "$type": "color",
    "$description": "Cores do sistema",
    "brand": {
      "$value": {
        "colorSpace": "srgb",
        "components": [0, 0.4, 0.8]
      }
    }
  }
}
```

Grupos também aceitam `$type`, `$description`, `$deprecated`, `$extensions` e `$extends`.

### Herança de tipo

Todo token precisa de um tipo. Se o token não declara `$type`, o tipo é resolvido nesta ordem:

1. Se o valor é um alias, o tipo é o do token referenciado.
2. Senão, vale o `$type` do grupo pai mais próximo que declare um.
3. Senão, o token é **inválido**.

A especificação proíbe que ferramentas "adivinhem" o tipo olhando o valor. Um `#ffffff` sozinho não é automaticamente uma cor.

### `$root` e `$extends`

Dois recursos de grupo merecem atenção.

O **`$root`** permite que um grupo tenha um token base ao lado de variações. Útil para casos como uma cor de destaque com versões clara e escura:

```json
{
  "color": {
    "accent": {
      "$root": {
        "$type": "color",
        "$value": { "colorSpace": "srgb", "components": [0.867, 0, 0] }
      },
      "light": {
        "$type": "color",
        "$value": { "colorSpace": "srgb", "components": [1, 0.133, 0.133] }
      }
    }
  }
}
```

Aqui, `{color.accent.$root}` aponta para o token base. Já `{color.accent}` é inválido, pois referencia um grupo.

O **`$extends`** faz um grupo herdar tokens de outro, sobrescrevendo apenas o que mudar. A herança é uma mesclagem profunda: o token local substitui o herdado de mesmo caminho por completo.

```json
{
  "button": {
    "$type": "color",
    "background": { "$value": { "colorSpace": "srgb", "components": [0, 0.4, 0.8] } },
    "text": { "$value": { "colorSpace": "srgb", "components": [1, 1, 1] } }
  },
  "button-danger": {
    "$extends": "{button}",
    "background": { "$value": { "colorSpace": "srgb", "components": [0.8, 0, 0.2] } }
  }
}
```

## Aliases: tokens que apontam para tokens

Como vimos no primeiro artigo, um alias é um token sem valor próprio, que aponta para outro. Na especificação, existem duas sintaxes.

**Chaves (curly braces)**, a sintaxe principal. Sempre aponta para um token inteiro:

```json
{
  "color": {
    "blue": {
      "$type": "color",
      "$value": { "colorSpace": "srgb", "components": [0, 0.4, 0.8] }
    },
    "action": { "$value": "{color.blue}" }
  }
}
```

Como `color.action` não declara tipo, ele herda `color` do token referenciado.

**JSON Pointer com `$ref`**, para casos avançados. Permite apontar para uma propriedade *dentro* de um valor, como o primeiro componente de uma cor ou só o `value` de uma dimensão:

```json
{
  "space": {
    "base": {
      "$type": "dimension",
      "$value": { "value": 16, "unit": "px" }
    },
    "base-rem": {
      "$type": "dimension",
      "$value": {
        "value": { "$ref": "#/space/base/$value/value" },
        "unit": "rem"
      }
    }
  }
}
```

Regras que valem para os dois:

- **Aliases encadeados** são permitidos (A aponta para B, que aponta para C). A ferramenta segue a cadeia até achar um valor explícito.
- **Referências circulares são erro** e invalidam todos os tokens da cadeia.
- Ferramentas devem **preservar as referências** e só resolvê-las quando precisarem do valor final. É isso que permite mudar um primitivo e ver o efeito em todos os aliases.

## Tipos simples

Todo token tem um tipo, e o valor precisa seguir a sintaxe daquele tipo. Se não seguir, o token é inválido. Pense como em uma linguagem tipada: o `$type` declara o que é permitido no `$value`.

### `color`

O valor é um objeto com:

| Propriedade | Obrigatória | Descrição |
|---|---|---|
| `colorSpace` | Sim | Espaço de cor |
| `components` | Sim | Array com os componentes (números ou a palavra `none`) |
| `alpha` | Não | Opacidade de 0 a 1. Se omitida, vale 1 |
| `hex` | Não | Cor de reserva (fallback) em 6 dígitos |

```json
{
  "color-translucent": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [0, 0, 0],
      "alpha": 0.5,
      "hex": "#000000"
    }
  }
}
```

Isso muda a forma como pensamos em cor: o `#3B82F6` em string não é mais o formato do valor. Os componentes ficam numéricos e o `hex` vira apenas um fallback. O benefício é que a cor pode estar em qualquer espaço de cor suportado:

| Espaço | `colorSpace` | Componentes |
|---|---|---|
| sRGB | `srgb` | Vermelho, verde, azul (0 a 1) |
| sRGB linear | `srgb-linear` | Vermelho, verde, azul (0 a 1) |
| HSL | `hsl` | Matiz (0 a 360, exclusivo), saturação (0 a 100), luminosidade (0 a 100) |
| HWB | `hwb` | Matiz, brancura, negrura |
| CIELAB | `lab` | Luminosidade (0 a 100), a, b |
| LCH | `lch` | Luminosidade (0 a 100), croma, matiz |
| OKLAB | `oklab` | Luminosidade (0 a 1), a, b |
| OKLCH | `oklch` | Luminosidade (0 a 1), croma, matiz |
| Display P3 | `display-p3` | Vermelho, verde, azul (0 a 1) |
| A98 RGB | `a98-rgb` | Vermelho, verde, azul (0 a 1) |
| ProPhoto RGB | `prophoto-rgb` | Vermelho, verde, azul (0 a 1) |
| Rec 2020 | `rec2020` | Vermelho, verde, azul (0 a 1) |
| XYZ D65 | `xyz-d65` | X, Y, Z |
| XYZ D50 | `xyz-d50` | X, Y, Z |

A palavra-chave **`none`** (herdada do CSS Color Level 4) indica que um componente "não existe" ou não se aplica. Em um cinza em HSL, por exemplo, o matiz pode ser `none` em vez de `0`. Visualmente é igual, mas faz diferença em interpolações e misturas de cor.

Para quem trabalha com cores em OKLCH, a especificação permite escrever:

```json
{
  "color-brand-500": {
    "$type": "color",
    "$value": {
      "colorSpace": "oklch",
      "components": [0.62, 0.19, 259]
    }
  }
}
```

> O `hex` é opcional. Se incluí-lo como fallback, gere-o a partir do valor real com uma ferramenta de conversão, e não à mão.

### `dimension`

Representa uma distância em um único eixo: posição, largura, altura, raio, espessura. O valor é um objeto com `value` (número) e `unit`, que **só pode ser `px` ou `rem`**:

```json
{
  "space-200": {
    "$type": "dimension",
    "$value": { "value": 0.5, "unit": "rem" }
  },
  "space-none": {
    "$type": "dimension",
    "$value": { "value": 0, "unit": "px" }
  }
}
```

Duas observações:

- A `unit` é obrigatória mesmo quando o valor é `0`.
- `px` é um pixel "idealizado" (equivale a `dp` no Android e `pt` no iOS). `rem` é um múltiplo do tamanho de fonte padrão do sistema, que o usuário pode configurar. Em plataformas sem equivalente a `rem`, a ferramenta de tradução pode converter para px assumindo 16px.

### `fontFamily`

Um nome de fonte (string) ou um array de nomes, do mais ao menos preferido:

```json
{
  "font-family-body": {
    "$type": "fontFamily",
    "$value": ["Inter", "Helvetica", "Arial", "sans-serif"]
  }
}
```

### `fontWeight`

Um número entre 1 e 1000 (segundo o eixo `wght` do OpenType) ou um nome predefinido:

| Número | Nomes aceitos |
|---|---|
| 100 | `thin`, `hairline` |
| 200 | `extra-light`, `ultra-light` |
| 300 | `light` |
| 400 | `normal`, `regular`, `book` |
| 500 | `medium` |
| 600 | `semi-bold`, `demi-bold` |
| 700 | `bold` |
| 800 | `extra-bold`, `ultra-bold` |
| 900 | `black`, `heavy` |
| 950 | `extra-black`, `ultra-black` |

Valores fora de 1 a 1000, ou nomes diferentes (inclusive com outra caixa), são inválidos. Isso suporta fontes variáveis: `350` é um valor válido.

```json
{
  "font-weight-body": { "$type": "fontWeight", "$value": 400 },
  "font-weight-strong": { "$type": "fontWeight", "$value": "bold" }
}
```

### `duration`

Tempo de uma animação, como objeto com `value` e `unit` (`ms` ou `s`):

```json
{
  "duration-fast": {
    "$type": "duration",
    "$value": { "value": 150, "unit": "ms" }
  }
}
```

### `cubicBezier`

A curva de progressão de uma animação (aceleração, desaceleração, retorno). É um array com quatro números `[P1x, P1y, P2x, P2y]`. Os valores de x ficam restritos ao intervalo de 0 a 1; os de y podem ser qualquer número.

```json
{
  "easing-standard": {
    "$type": "cubicBezier",
    "$value": [0.4, 0, 0.2, 1]
  }
}
```

### `number`

Um número JSON puro. Serve para valores sem unidade, como posições de parada de gradiente ou altura de linha como multiplicador:

```json
{
  "line-height-body": { "$type": "number", "$value": 1.5 }
}
```

### O que ainda não existe como tipo

A especificação reconhece lacunas. Estilo de fonte (`normal`, `italic`), porcentagem/razão (como opacidade) e arquivos (assets) aparecem apenas como tipos "a documentar". Enquanto isso, o caminho mais comum é usar `number` para valores como opacidade e `$extensions` para necessidades específicas. Trate qualquer uso fora do que está normatizado como escolha do seu time, e não como parte do padrão.

## Tokens compostos

Alguns aspectos de interface são combinações de vários valores que sempre andam juntos. Uma sombra é feita de cor, deslocamentos, desfoque e espalhamento. Uma tipografia é feita de família, tamanho, peso, espaçamento e altura de linha.

Um **token composto** tem como valor um objeto (ou array) com estrutura fixa. Cada subvalor tem um tipo conhecido e pode ser **explícito** ou um **alias** para um token do tipo correto.

Isso é diferente de um grupo:

| | Grupo | Token composto |
|---|---|---|
| É um token? | Não | Sim |
| Pode ser referenciado por alias? | Não | Sim |
| Estrutura | Livre | Fixa, definida pelo tipo |
| Pode ter subvalores extras? | Sim | Não: torna o token inválido |

### `strokeStyle`

Estilo de traço de linhas e bordas. Aceita **uma de duas formas**, mutuamente exclusivas:

**String**, com os valores equivalentes ao CSS: `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `outset`, `inset`.

```json
{
  "stroke-focus": { "$type": "strokeStyle", "$value": "dashed" }
}
```

**Objeto**, com `dashArray` (lista de dimensões alternando traço e espaço) e `lineCap` (`round`, `butt` ou `square`):

```json
{
  "stroke-alert": {
    "$type": "strokeStyle",
    "$value": {
      "dashArray": [
        { "value": 0.5, "unit": "rem" },
        { "value": 0.25, "unit": "rem" }
      ],
      "lineCap": "round"
    }
  }
}
```

Como nem toda plataforma dá conta de todos os estilos (o CSS não permite controlar o padrão de tracejado, e o Figma não suporta `inset`, `outset` ou `double`), as ferramentas devem recorrer à **aproximação mais próxima** que suportam.

### `border`

Objeto com `color`, `width` e `style` (um `strokeStyle`):

```json
{
  "border-subtle": {
    "$type": "border",
    "$value": {
      "color": "{color.border.subtle}",
      "width": { "value": 1, "unit": "px" },
      "style": "solid"
    }
  }
}
```

### `transition`

Objeto com `duration`, `delay` e `timingFunction` (uma `cubicBezier`):

```json
{
  "transition-emphasis": {
    "$type": "transition",
    "$value": {
      "duration": { "value": 200, "unit": "ms" },
      "delay": { "value": 0, "unit": "ms" },
      "timingFunction": [0.5, 0, 1, 1]
    }
  }
}
```

A própria especificação levanta uma questão em aberto: esses parâmetros, sozinhos, não dizem *qual propriedade* é animada nem os estados de início e fim.

### `shadow`

Objeto com `color`, `offsetX`, `offsetY`, `blur`, `spread` e, opcionalmente, `inset` (sombra interna, `false` por padrão). O valor pode ser **um objeto ou um array** de sombras, o que permite sombras em camadas:

```json
{
  "shadow-medium": {
    "$type": "shadow",
    "$value": {
      "color": "{color.shadow-050}",
      "offsetX": "{space.small}",
      "offsetY": "{space.small}",
      "blur": { "value": 1.5, "unit": "rem" },
      "spread": { "value": 0, "unit": "rem" }
    }
  },
  "shadow-elevated": {
    "$type": "shadow",
    "$value": [
      "{shadow-medium}",
      {
        "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.2 },
        "offsetX": { "value": 0, "unit": "px" },
        "offsetY": { "value": 24, "unit": "px" },
        "blur": { "value": 44, "unit": "px" },
        "spread": { "value": 0, "unit": "px" }
      }
    ]
  }
}
```

No array, cada elemento pode ser uma sombra explícita ou uma referência a outro token `shadow`. Referências resolvem para **um único objeto** e não se "achatam" dentro do array.

### `gradient`

Um array de paradas (stops), cada uma com `color` e `position`. A posição é um número de 0 (início) a 1 (fim); fora desse intervalo, o valor é limitado (clamp) a ele. Se não houver parada em 0 ou 1, a cor da parada mais próxima se estende até a ponta.

```json
{
  "gradient-brand": {
    "$type": "gradient",
    "$value": [
      { "color": "{color.brand.500}", "position": 0 },
      { "color": "{color.brand.700}", "position": 1 }
    ]
  }
}
```

A própria especificação pergunta se o tipo deveria indicar o formato do gradiente (linear, radial, cônico). Hoje, esse tipo descreve apenas as paradas.

### `typography`

Objeto com `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` e `lineHeight`. Cada propriedade é um valor do tipo correspondente ou um alias. A `lineHeight` é um `number`, interpretado como multiplicador do `fontSize`.

```json
{
  "text-heading-1": {
    "$type": "typography",
    "$value": {
      "fontFamily": "{font.family.heading}",
      "fontSize": { "value": 2.5, "unit": "rem" },
      "fontWeight": 700,
      "letterSpacing": { "value": 0, "unit": "px" },
      "lineHeight": 1.2
    }
  }
}
```

Também é possível reutilizar partes de uma tipografia em outra, usando `$ref` para apontar só para a `fontFamily` ou a `lineHeight` de um token-base.

## Resumo dos tipos

| Tipo | Valor | Tipo de token |
|---|---|---|
| `color` | Objeto com `colorSpace`, `components`, `alpha`, `hex` | Simples |
| `dimension` | `{ value, unit }` com `px` ou `rem` | Simples |
| `fontFamily` | String ou array de strings | Simples |
| `fontWeight` | Número de 1 a 1000 ou nome predefinido | Simples |
| `duration` | `{ value, unit }` com `ms` ou `s` | Simples |
| `cubicBezier` | Array de 4 números | Simples |
| `number` | Número JSON | Simples |
| `strokeStyle` | String predefinida ou `{ dashArray, lineCap }` | Composto |
| `border` | `{ color, width, style }` | Composto |
| `transition` | `{ duration, delay, timingFunction }` | Composto |
| `shadow` | Objeto ou array de `{ color, offsetX, offsetY, blur, spread, inset }` | Composto |
| `gradient` | Array de `{ color, position }` | Composto |
| `typography` | `{ fontFamily, fontSize, fontWeight, letterSpacing, lineHeight }` | Composto |

## O que isso muda na prática

**1. Atenção à versão do formato.** Rascunhos anteriores da especificação (e muitos exemplos na internet) escreviam cores como `"#3B82F6"` e dimensões como `"16px"`. A versão 2025.10 usa **objetos**. Se você tem arquivos antigos, é preciso migrar. Antes de adotar o formato novo, confirme na documentação da sua ferramenta de tradução e do seu plugin de design qual versão do formato ela lê. A ferramenta pode exigir uma versão específica ou uma configuração para isso.

**2. Os tipos importam para a tradução.** É o `$type` que permite a uma ferramenta transformar uma `dimension` em `rem` para web e em `pt` para iOS, ou uma `color` em OKLCH em um fallback hexadecimal.

**3. Nem tudo cabe em um tipo composto.** Se o seu sistema precisa de um estilo de fonte, de uma opacidade com nome próprio ou de um asset, você vai usar `number`, aliases e `$extensions`. Documente essas decisões, pois elas não são interoperáveis por padrão.

**4. Composto ou separado?** Você pode representar uma tipografia como um token `typography` ou como cinco tokens simples (`font-size`, `font-weight` etc.). O composto garante que as propriedades andem juntas e simplifica o uso em ferramentas de design. Os tokens separados são mais flexíveis para consumir em código. Muitos times mantêm os dois. É uma decisão que depende das plataformas e das ferramentas que você usa.

## O que levar deste artigo

- O DTCG padroniza o **formato de arquivo** dos tokens para que ferramentas troquem dados sem integrações sob medida. A versão estável atual é a **2025.10**.
- Todo token tem `$value` e precisa de um `$type`, declarado nele, herdado de um grupo ou vindo de um alias.
- **Aliases** usam `{caminho.do.token}`; o `$ref` (JSON Pointer) alcança propriedades internas. Referências circulares são erro.
- Os tipos simples são `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier` e `number`.
- Os tipos compostos são `strokeStyle`, `border`, `transition`, `shadow`, `gradient` e `typography`, e cada subvalor pode ser explícito ou um alias.
- Cores e dimensões agora são **objetos**, e não strings.

## Perguntas frequentes (FAQ) sobre o formato DTCG

### O que é o formato DTCG?

É o formato de arquivo definido pelo Design Tokens Community Group (DTCG), grupo de comunidade do W3C, para escrever design tokens em JSON de forma que ferramentas diferentes leiam o mesmo arquivo sem integrações feitas sob medida. A versão estável atual é a 2025.10.

### O formato DTCG é um padrão oficial do W3C?

Não. A especificação é um relatório do Community Group e não está na trilha de padrões do W3C. O próprio documento a considera estável e destinada à implementação.

### Os exemplos que usam `value` e `type` estão errados?

Não: são de outra versão do formato. A forma legada, popularizada pelo Style Dictionary, usa `value` e `type`; a versão estável da especificação usa `$value` e `$type`, com o prefixo `$`. Se o seu arquivo usa a forma sem `$`, ele precisa migrar.

### Como uma cor é escrita no formato DTCG?

O `$value` de um token `color` é um objeto com `colorSpace` e `components`, mais os opcionais `alpha` (opacidade de 0 a 1) e `hex` (fallback de 6 dígitos). Uma string como `"#3B82F6"` é do formato anterior, não da versão atual.

### Que unidades o tipo `dimension` aceita?

Apenas `px` e `rem`. O `px` é um pixel idealizado (equivale a `dp` no Android e `pt` no iOS), e o `rem` é um múltiplo do tamanho de fonte padrão do sistema.

### Qual é a diferença entre grupo e token composto?

Um grupo é um objeto sem `$value`: organiza tokens e compõe nomes, mas não é um token nem pode ser referenciado por alias. Um token composto é um token com estrutura fixa definida pelo tipo, pode ser referenciado e se torna inválido se ganhar subvalores extras.

### Quais são todos os tipos da especificação?

Os simples são `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier` e `number`. Os compostos são `strokeStyle`, `border`, `transition`, `shadow`, `gradient` e `typography`.

---

Este é o segundo artigo do Guia Definitivo de Design Tokens. No próximo, vamos falar sobre **nomenclatura de tokens**: como nomear, estruturar e organizar tokens para que o sistema continue legível quando crescer.

Para não perder as próximas publicações, inscreva-se na newsletter e me siga no [LinkedIn](https://www.linkedin.com/in/mateusvillain/).

---

## Fontes

- [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/)
- [Design Tokens Color Module 2025.10](https://www.designtokens.org/TR/2025.10/color/)
- [Design Tokens Resolver Module 2025.10](https://www.designtokens.org/TR/2025.10/resolver/)
- [designtokens.org](https://www.designtokens.org/): lista de adotantes e participantes.
- [Anúncio da primeira versão estável](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
