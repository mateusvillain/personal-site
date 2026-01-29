---
title: "Como utilizar e aplicar o 8-pt grid"
description: "Entenda sobre como criar interfaces consistentes e harmônicas com um simples sistema de grid"
date: "2021-10-21"
tags: ["user interface", "ui", "grid"]
---

Você que constrói interfaces, dentre várias skills que você precisa estudar e ter para melhorar sua produção, o 8-point grid (ou grid de 8 pontos) é uma das mais importantes — e que depois de ver portfolios de alguns designers junior, é algo que você precisa saber cedo.

Bom, eu imagino que se você está lendo esse artigo, é porque você já sabe o que é grid em interfaces digitais e quais as vantagens de usá-la. O que eu trago aqui é um modelo diferente da grid convencional que vemos por aí, repleta de colunas ou linhas. Essa é uma grid totalmente quadriculada, consistindo num quadradinho de 8×8 pixels, repetindo-se por toda a sua interface digital.

A primeira vista é estranho mesmo, mas o entendimento e a aplicação é muito mais simples do que se imagina. Todos os elementos e componentes dispostos na interface passarão por essa “revisão” em cima do 8-pt grid. Diferente do sistema de colunas que conhecemos e usamos, aqui trabalhamos a dimensão, margens e paddings dos elementos. Isso quer dizer que todos os valores que você deverá trabalhar devem ser múltiplos de 8 (8, 16, 24, 32, 40…).

## Porquê a escolha do número 8

Talvez você não tenha reparado, mas as resoluções mais comuns hoje, em pixels, são divisíveis por 8. A maioria dos casos envolve a largura — que é a parte com maior relevância — mas algumas alturas também são incluídas nessa tabela. Essa informação já é um guia perfeito para se basear num tamanho para seus designs, considerando ainda que alguns design systems, style guides e frameworks se baseiam fortemente em resoluções divisíveis por 8.

## Utilizando o 8-pt grid

Como eu falei, você utiliza esse sistema para tudo numa interface digital. Enquanto o sistema de colunas é aquele que usamos para alinhar os conteúdos, a grid de 8 pontos é a que vamos utilizar para organizar os espaçamentos ao redor disso.

No exemplo de uma interface de login, temos distanciamentos em vários locais, seja na vertical ou horizontal, para cada elemento que adicionamos na interface. O plano é adequar esse espaçamento com valores múltiplos de 8. Pode ser que à primeira vista isso se reflita apenas nas margens, mas como no campo “e-mail”, o próprio placeholder segue o modelo da grid, contando com um padding total de 16px.

Não existe uma receita de bolo dizendo qual é o valor ideal. Isso é uma decisão de design do responsável, tendo em mente que manter o equilíbrio é extremamente importante — espaçamentos grandes podem ser agradáveis, causando um bom “respiro”, ou problemáticos, desviando olhares e dificultando o fluxo do usuário.

## Tipografias são bem-vindas

Falo sobre distância entre os elementos, mas o fato de basear tudo em múltiplos de 8 pode se refletir até nos tamanhos dos textos. No exemplo do artigo: um título com 32px, um subtítulo com 24px e uma descrição curta com 16px. É uma aplicação simples que agiliza decisões. Para hierarquias maiores, pode chegar a valores como 64 ou 72px, mas em dispositivos menores isso pode causar quebras indesejadas.

## Aplicando 8-pt em grids de coluna

Quando começamos a trabalhar com esse sistema, é importante que as grids de coluna — como a famosa grid de 12 colunas do Bootstrap — também sigam essa matemática. Assim, a disposição dos elementos na tela segue um padrão estabelecido por você.

O post detalha três pontos sobre a grid de colunas: margens laterais, colunas e gutters (espaços entre colunas). A largura das colunas não muda — ela é construída automaticamente a partir do tamanho da margem e dos gutters. Margens costumam ser maiores para centralizar o conteúdo e dar respiro, e gutters têm valor menor para organizar elementos. Recomenda-se usar valores que variem entre 8 e 24px.

## No fim, tudo é 8

Esse é um sistema simples de aprender e aplicar. A tomada de decisão para definir distâncias entre elementos fica mais automática conforme você pratica e incorpora essa grid nos seus projetos. Testar e validar com usuários é sempre a forma ideal de ver se o espaçamento funciona.
