---
title: 'Claude no Figma: como usar IA para criar interfaces e controlar todo o seu Figma'
description: 'Aprenda a usar o Claude para interagir com seus arquivos do Figma e automatizar tarefas repetitivas.'
date: '2026-03-19'
cover: '/blog/covers/claude-figma.png'
tags: ['figma', 'claude', 'ia', 'mcp']
---

Eu tenho certeza que nos últimos anos, assim como eu, você inseriu muito de inteligência artificial na sua rotina. Você usa IA para pesquisa, para redigir um texto, para criar uma imagem, para resumir um documento, para ver os seus e-mails e agendas do dia, e agora se vê no desafio de colocar IA na sua rotina de trabalho.

É o momento que vivemos, e nada disso vai voltar atrás. Não existe espaço para negligenciar IA no nosso mercado de trabalho. Então se você usa IA no seu dia a dia para coisas que talvez nem sejam tão úteis assim, por que não aplicar isso para facilitar o seu trabalho naquilo que costuma ser realmente repetitivo? No seu caso como usuário de Figma, você não só pode como deve usar IA para design de interface.

Eu vou te explicar como você pode começar a usar o Claude para interagir com literalmente tudo nos seus arquivos do Figma, e talvez o melhor desse processo todo: é grátis.

## Usando Claude no Figma

### Etapa 1: Pré-requisitos

Antes de começarmos, quero destacar que esse processo, pelo menos na data em que esse artigo foi publicado, funciona somente com o Claude, e sendo mais específico, somente com o Claude Desktop (e consequentemente, o Figma Desktop também). A versão online não permite se conectar com o Figma, e você verá nas etapas seguintes o porquê.

Um segundo software que você precisa instalar na sua máquina para que tudo funcione corretamente é o Node.js. Caso você não esteja familiarizado, o Node.js é uma ferramenta que permite rodar JavaScript fora do navegador, direto no seu computador.

- [Página de download do Claude](https://claude.com/download)
- [Página de download do Figma](https://www.figma.com/pt-br/downloads/)
- [Página de download do Node.js](https://nodejs.org/pt-br/download/current.) (versão 18+)

### Etapa 2: Token de acesso do Figma

Para que o Claude consiga se conectar corretamente aos seus arquivos do Figma, você precisa fornecer um token de acesso vinculado a sua conta, do qual você define quais são as funcionalidades que o Claude poderá interagir.

Para criar esse token de acesso, você deve abrir o seu Figma, clicar no seu nome no canto superior esquerdo, e ir na opção “Settings”. Isso abrirá uma janela no centro da tela. Navegue para a aba “Security”, e na seção “Personal access tokens” clique no botão “Generate new token”.

Isso abrirá uma nova janela que irá te pedir três coisas:

- **Nome do seu token de acesso**: coloque um nome que te ajude a identificar o que é. Exemplo: Figma Console MCP.
- **Tempo de expiração**: esse token dá acesso a funcionalidades dos seus arquivos, portanto existe um limite em que ele pode ser usado por razões de segurança. Selecione qualquer uma das opções.
- **Escopos**: cada um dos itens selecionáveis dará acesso de leitura ou escrita nos arquivos. Por exemplo, ao ativar `current_user:read`, o Claude poderá ler o nome, e-mail e foto dos usuários que acessarem seus arquivos. Selecione as opções que fazem sentido para design e handoff.

Assim que você finalizar, um token de acesso será gerado com um formato semelhante a esse:

`figd_ABc1deF2GHI3_A1b2_j4k56L7MNOP_rst8UvWXYz`

Copie esse token e coloque num bloco de notas por um instante, pois assim que você fechar essa janela, **você nunca mais verá esse token**. Se perder esse código, você precisará criar um novo token de acesso.

### Etapa 3: Configurando o Claude

Com o Claude instalado, vamos precisar inserir um pequeno script JSON no arquivo de configuração do Claude. Existe uma forma em comum entre Mac e Windows para editar o arquivo de configuração, mas por via das dúvidas, vou explicar também como fazer isso separadamente para cada sistema operacional.

**Mac e Windows**:

Abra o Claude, clique no seu nome de usuário e vá para “Settings”. Nessa página, selecione o menu “Developers”, e clique no botão “Edit Config”. Isso irá abrir o seu explorador de arquivos já selecionando o arquivo que precisamos editar, que é o “claude_desktop_config.json”.

**Mac**:

Pressione `Cmd+Space` para abrir o Spotlight e cole o caminho à seguir:

```
~/Library/Application Support/Claude
```

O primeiro resultado deve exibir a pasta “Claude”. Clique para abrir, e em seguida abra o arquivo `claude_desktop_config.json`.

**Windows**:

Pressione `Win+R` para abrir a janela “Executar”, e digite o caminho à seguir:

```
%APPDATA%\Claude\claude_desktop_config.json
```

Outra forma que você pode fazer é navegar manualmente nas pastas, ou apenas colocando esse caminho completo no Windows Explorer (substitua apenas o “YOUR_NAME” pelo nome do seu usuário no Windows):

```
C:\Users\YOUR_NAME\AppData\Roaming\Claude\claude_desktop_config.json
```

**Editando o arquivo de configuração**:

No arquivo, algumas coisas já estarão escritas. Não precisa apagar nada, apenas inserir o seguinte:

```
"mcpServers": {
  "figma-console": {
    "command":"npx",
    "args": ["-y","figma-console-mcp@latest"],
    "env": {
      "FIGMA_ACCESS_TOKEN":"figd_seuTokenAqui",
      "ENABLE_MCP_APPS":"true"
    }
  }
}
```

O arquivo completo deve ficar semelhante a isso:

```
{
  "preferences": {
    "quickEntryShortcut": "off",
    "coworkScheduledTasksEnabled": false,
    "ccdScheduledTasksEnabled": false,
    "coworkWebSearchEnabled": true,
    "sidebarMode": "chat"
  },
  "mcpServers": {
    "figma-console": {
      "command":"npx",
      "args": ["-y","figma-console-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN":"figd_ABc1deF2GHI3_A1b2_j4k56L7MNOP_rst8UvWXYz",
        "ENABLE_MCP_APPS":"true"
      }
    }
  }
}
```

Salve o arquivo e feche.

### Etapa 4: Conectando o Figma Desktop

Para que a conexão entre Claude e Figma aconteça, você precisará rodar um plugin em específico, mas em vez de encontrá-lo no Figma Community, você irá inseri-lo manualmente pela área de desenvolvimento.

Para isso, você deve baixar o seguinte repositório [Figma Console MCP](https://github.com/southleft/figma-console-mcp). Caso você não tenha familiaridade com o GitHub, a forma mais prática é clicando no botão “Code”, seleciona a aba “Local” e clique na opção “Download ZIP”.

Para adicionar esse plugin ao seu Figma, abra qualquer arquivo, clique no menu com o logo do Figma no canto superior esquerdo, selecione a opção “Plugins”, em seguida “Development”, e por fim “Import plugin from manifest”.

Busque pela pasta do repositório que você baixou, e nela, entre na subpasta “figma-desktop-bridge”, selecione o arquivo “manifest.json” e abra.

Com isso, o Figma irá carregar esse plugin, e você poderá executá-lo. Ele é uma pequena interface que apenas mostra o status de conexão, não tem nenhuma interação, mas você precisa mantê-lo aberto sempre que desejar usar o Claude com o Figma.

### Etapa 5: Conectando e testando

Se o Claude estiver aberto no seu computador, encerre a aplicação completamente para que ela possa reiniciar e aplicar o script que você inseriu anteriormente, e em seguida abra novamente. Crie uma nova conversa, e com o plugin aberto no Figma, envie a seguinte mensagem para o Claude:

```
Figma status
```

Isso fará com que ele enxergue a conexão com o Figma, e valide se está tudo funcionando corretamente. Como resultado de sucesso, ele deverá trazer informações como essas:

```
Figma is connected and ready! Here's the summary:

Status: ✅ Connected via WebSocket Bridge
Active File: File name
Current Page: Content
Transport: WebSocket on port 9224 (fallback from 9223)
All design tools: Available

Let me know what you'd like to do with the file!
```

Se por acaso o plugin não estiver aberto ou alguma conexão falhar, a resposta natural do Claude ao “Figma status” é uma busca na web para saber se a ferramenta Figma está funcionando ou não.

## Usando o Claude

Conexão feita, e tudo confirmado pelo Claude, você pode começar a pedir para ele trabalhar no seu arquivo. Nas dinâmicas que realizamos, não há muitos limites no que ele pode fazer. Você pode pedir coisas como:

- Criar novas páginas no seu arquivo
- Criar e editar protótipos completos de alguma página ou cenário
- Criar e editar estilos, variáveis e componentes
- Aplicar anotações e outras funcionalidades do Dev Mode

A eficácia de cada solicitação vai depender exclusivamente do quão completo será o seu prompt. Você pode pedir para ele criar uma simples página de login desktop, ou pedir para ele criar uma página com resoluções definidas, ações estabelecidas, e usando apenas estilos, variáveis e componentes do seu design system.

A cada prompt, ele pode levar um tempo, pois ele sempre realiza uma validação no seu arquivo, buscando pelos seus componentes, variáveis e outras informações para não criar nada novo. Como eu mencionei anteriormente, você pode usar o Claude no plano gratuito, o problema é a quantidade de tokens consumidos nesse processo. O seu Claude irá esgotar muito mais rápido do que se estivesse num plano pago.
