---
title: 'The Ultimate Guide to Design Tokens: Formats, Types and Specifications'
description: 'How the DTCG format writes design tokens in JSON: file structure, aliases and all 13 token types, from color and dimension to shadow and typography.'
date: '2026-10-29'
cover: '/blog/covers/guia-definitivo-design-tokens-2-en.png'
slug: 'design-tokens-format-specification'
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

In the [first article of the Ultimate Guide to Design Tokens](https://www.mateusvillain.com/blog/ultimate-guide-to-design-tokens/), we saw that a design token is a design decision written as data, in JSON, so it can be platform-independent. But "JSON" alone is not enough for two tools to understand each other. Each one could invent its own structure, its own property names and its own way of writing a color.

That is what the **DTCG**, the Design Tokens Community Group, exists to solve. In this article, you will learn what this specification is, how a token file is structured and, above all, **which token types exist and how each one is written**, from the simplest (color, dimension) to the composite ones (shadow, typography, border).

> **A note on the first article:** its examples use `value` and `type`, the legacy format popularized by Style Dictionary. The DTCG specification uses `$value` and `$type`, with the `$` prefix. This is the format we will use from now on in the series.

## What is the DTCG?

The DTCG (Design Tokens Community Group) is the W3C community group that maintains the specification of the **file format** for exchanging design tokens between tools.

The group brings together people from design system teams, tool vendors and independent specialists.

On October 28, 2025, the group published the **first stable version**, called **2025.10**. It is split into modules:

- **Format Module:** file structure, groups, aliases, simple and composite types.
- **Color Module:** how to represent colors in different color spaces.
- **Resolver Module:** how to combine sets of tokens to produce variations such as themes and brands (the subject of the article on theming).

One important detail: the specification is a Community Group report. **It is not an official W3C standard** and is not on the W3C standards track. The document itself describes it as stable and intended for implementation. ^[stable, but not a W3C standard]

In practice, the official site [designtokens.org](https://www.designtokens.org/) lists tools such as Figma, Style Dictionary, Tokens Studio, Penpot, Sketch and zeroheight among the group's adopters and participants.

The goal is simple: a token file written today should be readable by design tools, translation tools (like Style Dictionary) and documentation tools, without custom-built glue code.

## How a token file is organized

A token file is a JSON document in which objects with a `$value` are tokens and objects without a `$value` are groups, which organize tokens and compose their names.

### File format

Token files are JSON. The specification recommends:

- **Extensions:** `.tokens` or `.tokens.json`.
- **MIME type:** `application/design-tokens+json` (`application/json` is also accepted).

### Token, name and value

An object that has a `$value` property is a token. The key of the parent object is the token name. Both name and value are required.

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

Every property defined by the specification starts with `$`. For that reason, token and group names **cannot start with `$`**. In addition, the characters `{`, `}` and `.` are forbidden in any name, because they are part of the alias and path syntax.

Names are case-sensitive. Even so, avoid tokens that differ only by case (`font-size` and `FONT-SIZE`): when exported to other languages, they can generate duplicate variables.

### Optional properties

Besides `$value`, a token can have:

| Property | What it is for |
|---|---|
| `$type` | Declares the type of the value (`color`, `dimension`, `shadow`...) |
| `$description` | Plain text explaining the token's purpose |
| `$extensions` | Tool- or team-specific data, with a key in reverse domain name notation |
| `$deprecated` | `true`, `false` or a string explaining the deprecation and the replacement |

Tools **must preserve** the `$extensions` they do not understand. That way, a file can pass through several tools without losing metadata.

### Groups

A group is an object **without** a `$value`. It organizes tokens and composes names. The specification is explicit: groups are arbitrary, and tools should not infer meaning or type from a group's name.

```json
{
  "color": {
    "$type": "color",
    "$description": "System colors",
    "brand": {
      "$value": {
        "colorSpace": "srgb",
        "components": [0, 0.4, 0.8]
      }
    }
  }
}
```

Groups also accept `$type`, `$description`, `$deprecated`, `$extensions` and `$extends`.

### Type inheritance

Every token needs a type. If the token does not declare `$type`, its type is resolved in this order:

1. If the value is an alias, the type is that of the referenced token.
2. Otherwise, the `$type` of the closest parent group that declares one applies.
3. Otherwise, the token is **invalid**.

==The specification forbids tools from "guessing" the type by looking at the value==. A lone `#ffffff` is not automatically a color.

### `$root` and `$extends`

Two group features deserve attention.

**`$root`** lets a group have a base token alongside its variations. It is useful for cases such as an accent color with light and dark versions:

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

Here, `{color.accent.$root}` points to the base token. `{color.accent}`, on the other hand, is invalid, because it references a group.

**`$extends`** makes a group inherit tokens from another one, overriding only what changes. Inheritance is a deep merge: a local token completely replaces the inherited one at the same path.

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

## Aliases: tokens that point to tokens

As we saw in the first article, an alias is a token with no value of its own that points to another token. The specification has two syntaxes.

**Curly braces**, the main syntax, which always point to a whole token:

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

Since `color.action` does not declare a type, it inherits the `color` type from the token it references.

**JSON Pointer with `$ref`**, for advanced cases. It lets you point to a property *inside* a value, such as the first component of a color or just the `value` of a dimension:

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

Rules that apply to both:

- **Chained aliases** are allowed (A points to B, which points to C). The tool follows the chain until it finds an explicit value.
- **Circular references are an error** and invalidate every token in the chain.
- Tools should **preserve references** and only resolve them when the final value is needed. That is what ==lets you change a primitive and see the effect on every alias==.

## Simple types

Every token has a type, and its value must follow the syntax of that type. If it does not, the token is invalid. Think of a typed language: `$type` declares what is allowed in `$value`.

### `color`

The value is an object with:

| Property | Required | Description |
|---|---|---|
| `colorSpace` | Yes | Color space |
| `components` | Yes | Array with the components (numbers or the keyword `none`) |
| `alpha` | No | Opacity from 0 to 1. If omitted, it is 1 |
| `hex` | No | Fallback color in 6 digits |

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

This changes how we think about color: a string like `#3B82F6` is no longer the format of the value. The components are numeric and the `hex` becomes just a fallback. The benefit is that a token can express a color in any supported color space:

| Space | `colorSpace` | Components |
|---|---|---|
| sRGB | `srgb` | Red, green, blue (0 to 1) |
| Linear sRGB | `srgb-linear` | Red, green, blue (0 to 1) |
| HSL | `hsl` | Hue (0 to 360, exclusive), saturation (0 to 100), lightness (0 to 100) |
| HWB | `hwb` | Hue, whiteness, blackness |
| CIELAB | `lab` | Lightness (0 to 100), a, b |
| LCH | `lch` | Lightness (0 to 100), chroma, hue |
| OKLAB | `oklab` | Lightness (0 to 1), a, b |
| OKLCH | `oklch` | Lightness (0 to 1), chroma, hue |
| Display P3 | `display-p3` | Red, green, blue (0 to 1) |
| A98 RGB | `a98-rgb` | Red, green, blue (0 to 1) |
| ProPhoto RGB | `prophoto-rgb` | Red, green, blue (0 to 1) |
| Rec 2020 | `rec2020` | Red, green, blue (0 to 1) |
| XYZ D65 | `xyz-d65` | X, Y, Z |
| XYZ D50 | `xyz-d50` | X, Y, Z |

The **`none`** keyword (inherited from CSS Color Level 4) indicates that a component is "missing" or does not apply. In a gray in HSL, for example, the hue can be `none` instead of `0`. The two look the same on screen, but they behave differently in interpolation and color mixing.

If you work with colors in OKLCH, the specification lets you write:

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

> The `hex` is optional. If you include it as a fallback, generate it from the real value with a conversion tool rather than by hand.

### `dimension`

Represents a distance on a single axis: position, width, height, radius, thickness. The value is an object with `value` (a number) and `unit`, which **can only be `px` or `rem`**: ^[em, vh and % are out]

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

Two things to keep in mind:

- The `unit` is required even when the value is `0`.
- `px` is an "idealized" pixel (the equivalent of `dp` on Android and `pt` on iOS). `rem` is a multiple of the system's default font size, which the user can configure. On platforms with no equivalent to `rem`, the translation tool may convert it to px assuming 16px.

### `fontFamily`

A font name (string) or an array of names, from most to least preferred:

```json
{
  "font-family-body": {
    "$type": "fontFamily",
    "$value": ["Inter", "Helvetica", "Arial", "sans-serif"]
  }
}
```

### `fontWeight`

A number between 1 and 1000 (following the OpenType `wght` axis) or a predefined name:

| Number | Accepted names |
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

Values outside 1 to 1000, or any other names (including ones that differ only by case), are invalid. This supports variable fonts: `350` is a valid value.

```json
{
  "font-weight-body": { "$type": "fontWeight", "$value": 400 },
  "font-weight-strong": { "$type": "fontWeight", "$value": "bold" }
}
```

### `duration`

The length of an animation, as an object with `value` and `unit` (`ms` or `s`):

```json
{
  "duration-fast": {
    "$type": "duration",
    "$value": { "value": 150, "unit": "ms" }
  }
}
```

### `cubicBezier`

The progression curve of an animation (acceleration, deceleration, bounce). It is an array of four numbers `[P1x, P1y, P2x, P2y]`. The x values are restricted to the range 0 to 1; the y values can be any number.

```json
{
  "easing-standard": {
    "$type": "cubicBezier",
    "$value": [0.4, 0, 0.2, 1]
  }
}
```

### `number`

A plain JSON number. It is used for unitless values, such as gradient stop positions or line height as a multiplier:

```json
{
  "line-height-body": { "$type": "number", "$value": 1.5 }
}
```

### What does not exist as a type yet

The specification acknowledges gaps. Font style (`normal`, `italic`), percentage/ratio (such as opacity) and files (assets) only appear as types "to be documented". In the meantime, the most common approach is to use `number` for values such as opacity and `$extensions` for specific needs. Treat anything outside what is standardized as your team's own choice, not as part of the standard.

## Composite tokens

Some interface aspects are combinations of several values that always go together. A shadow is made of a color, offsets, blur and spread. A typography style is made of a family, size, weight, letter spacing and line height.

A **composite token** has an object (or array) with a fixed structure as its value. Each sub-value has a known type and can be **explicit** or an **alias** to a token of the right type.

This is different from a group:

| | Group | Composite token |
|---|---|---|
| Is it a token? | No | Yes |
| Can it be referenced by an alias? | No | Yes |
| Structure | Free | Fixed, defined by the type |
| Can it have extra sub-values? | Yes | No: it makes the token invalid |

### `strokeStyle`

The stroke style of lines and borders. It accepts **one of two forms**, which are mutually exclusive:

**String**, with values equivalent to CSS: `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `outset`, `inset`.

```json
{
  "stroke-focus": { "$type": "strokeStyle", "$value": "dashed" }
}
```

**Object**, with `dashArray` (a list of dimensions alternating dash and gap) and `lineCap` (`round`, `butt` or `square`):

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

Since not every platform handles every style (CSS does not let you control the dash pattern, and Figma does not support `inset`, `outset` or `double`), tools should fall back to the **closest approximation** they support.

### `border`

An object with `color`, `width` and `style` (a `strokeStyle`):

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

An object with `duration`, `delay` and `timingFunction` (a `cubicBezier`):

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

The specification itself raises an open question: these parameters alone do not say *which property* is animated, nor the start and end states.

### `shadow`

An object with `color`, `offsetX`, `offsetY`, `blur`, `spread` and, optionally, `inset` (an inner shadow, `false` by default). The value can be **an object or an array** of shadows, which allows layered shadows:

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

In the array, each element can be an explicit shadow or a reference to another `shadow` token. References resolve to **a single object** and are not "flattened" into the array.

### `gradient`

An array of stops, each with a `color` and a `position`. The position is a number from 0 (start) to 1 (end); outside that range, the value is clamped to it. If there is no stop at 0 or 1, the color of the nearest stop extends to the edge.

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

The specification itself asks whether the type should indicate the gradient shape (linear, radial, conic). Today, this type only describes the stops.

### `typography`

An object with `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing` and `lineHeight`. Each property is a value of the corresponding type or an alias. The `lineHeight` is a `number`, interpreted as a multiplier of `fontSize`.

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

You can also reuse parts of one typography style in another, using `$ref` to point only to the `fontFamily` or the `lineHeight` of a base token.

## Types at a glance

| Type | Value | Token kind |
|---|---|---|
| `color` | Object with `colorSpace`, `components`, `alpha`, `hex` | Simple |
| `dimension` | `{ value, unit }` with `px` or `rem` | Simple |
| `fontFamily` | String or array of strings | Simple |
| `fontWeight` | Number from 1 to 1000 or a predefined name | Simple |
| `duration` | `{ value, unit }` with `ms` or `s` | Simple |
| `cubicBezier` | Array of 4 numbers | Simple |
| `number` | JSON number | Simple |
| `strokeStyle` | Predefined string or `{ dashArray, lineCap }` | Composite |
| `border` | `{ color, width, style }` | Composite |
| `transition` | `{ duration, delay, timingFunction }` | Composite |
| `shadow` | Object or array of `{ color, offsetX, offsetY, blur, spread, inset }` | Composite |
| `gradient` | Array of `{ color, position }` | Composite |
| `typography` | `{ fontFamily, fontSize, fontWeight, letterSpacing, lineHeight }` | Composite |

## What this changes in practice

**1. Mind the format version.** Earlier drafts of the specification (and many examples on the internet) wrote colors as `"#3B82F6"` and dimensions as `"16px"`. ==Version 2025.10 uses **objects**==. If you have old files, you will need to migrate them. Before adopting the new format, check the documentation of your translation tool and design plugin to see which version of the format it reads. The tool may require a specific version or a setting for it.

**2. Types matter for translation.** It is `$type` that lets a tool turn a `dimension` into `rem` for the web and `pt` for iOS, or an OKLCH `color` into a hexadecimal fallback.

**3. Not everything fits a composite type.** If your system needs a font style, an opacity with its own name or an asset, you will use `number`, aliases and `$extensions`. Document these decisions, because they are not interoperable by default.

**4. Composite or separate?** You can represent typography as a single `typography` token or as five simple tokens (`font-size`, `font-weight`, and so on). The composite keeps the properties together and simplifies use in design tools. Separate tokens are more flexible to consume in code. Many teams keep both. It is a decision that depends on the platforms and tools you use.

## Key takeaways

- The DTCG standardizes the **file format** of tokens so that tools can exchange data without custom integrations. The current stable version is **2025.10**.
- Every token has a `$value` and needs a `$type`, declared on it, inherited from a group or coming from an alias.
- **Aliases** use `{path.to.token}`; `$ref` (JSON Pointer) reaches inner properties. Circular references are an error.
- The simple types are `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier` and `number`.
- The composite types are `strokeStyle`, `border`, `transition`, `shadow`, `gradient` and `typography`, and each sub-value can be explicit or an alias.
- Colors and dimensions are now **objects**, not strings.

## Frequently asked questions (FAQ) about the DTCG format

### What is the DTCG format?

It is the file format defined by the Design Tokens Community Group (DTCG), a W3C community group, for writing design tokens in JSON so that different tools read the same file without custom integrations. The current stable version is 2025.10.

### Is the DTCG format an official W3C standard?

No. The specification is a Community Group report and is not on the W3C standards track. The document itself considers it stable and intended for implementation.

### Are the examples that use `value` and `type` wrong?

No: they come from another version of the format. The legacy form, popularized by Style Dictionary, uses `value` and `type`; the stable version of the specification uses `$value` and `$type`, with the `$` prefix. If your file uses the form without `$`, it needs to be migrated.

### How is a color written in the DTCG format?

The `$value` of a `color` token is an object with `colorSpace` and `components`, plus the optional `alpha` (opacity from 0 to 1) and `hex` (a 6-digit fallback). A string like `"#3B82F6"` belongs to the earlier format, not the current version.

### Which units does the `dimension` type accept?

Only `px` and `rem`. `px` is an idealized pixel (the equivalent of `dp` on Android and `pt` on iOS), and `rem` is a multiple of the system's default font size.

### What is the difference between a group and a composite token?

A group is an object without a `$value`: it organizes tokens and composes names, but it is not a token and cannot be referenced by an alias. A composite token is a token with a fixed structure defined by its type; it can be referenced and becomes invalid if it gains extra sub-values.

### What are all the types in the specification?

The simple ones are `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier` and `number`. The composite ones are `strokeStyle`, `border`, `transition`, `shadow`, `gradient` and `typography`.

---

This is the second article of the Ultimate Guide to Design Tokens. In the next one, we will talk about **token naming**: how to name, structure and organize tokens so the system stays readable as it grows.

So you don't miss what comes next, subscribe to the newsletter and follow me on [LinkedIn](https://www.linkedin.com/in/mateusvillain/).

---

## Sources

- [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/)
- [Design Tokens Color Module 2025.10](https://www.designtokens.org/TR/2025.10/color/)
- [Design Tokens Resolver Module 2025.10](https://www.designtokens.org/TR/2025.10/resolver/)
- [designtokens.org](https://www.designtokens.org/): list of adopters and participants.
- [Announcement of the first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
