---
title: 'Designing in Figma with Claude: how to use AI to create interfaces and control your entire Figma'
description: 'Learn how to use Claude to interact with your Figma files and automate repetitive tasks.'
date: '2026-03-19'
cover: '/blog/covers/claude-figma.png'
slug: 'designing-in-figma-with-claude'
tags: ['figma', 'claude', 'ai', 'mcp']
---

I am sure that over the last few years, just like me, you have brought a lot of artificial intelligence into your routine. You use AI for research, to draft a text, to create an image, to summarize a document, to go through your e-mails and the day's schedule, and now you face the challenge of bringing AI into your work routine.

This is the moment we live in, and none of it is going back. There is no room for neglecting AI in our job market. So if you use AI every day for things that may not even be that useful, why not apply it to make your work easier where it tends to be truly repetitive? In your case as a Figma user, you not only can but should use AI for interface design.

I am going to explain how you can start using Claude to interact with literally everything in your Figma files, and perhaps the best part of this whole process: it's free.

## Using Claude in Figma

### Step 1: Prerequisites

Before we start, I want to point out that this process, at least as of the date this article was published, only works with Claude — and more specifically, only with Claude Desktop (and consequently, Figma Desktop too). The web version does not allow connecting to Figma, and you will see why in the following steps.

A second piece of software you need to install on your machine for everything to work properly is Node.js. If you are not familiar with it, Node.js is a tool that lets you run JavaScript outside the browser, directly on your computer.

- [Claude download page](https://claude.com/download)
- [Figma download page](https://www.figma.com/downloads/)
- [Node.js download page](https://nodejs.org/en/download/current) (version 18+)

### Step 2: Figma access token

For Claude to connect properly to your Figma files, you need to provide an access token tied to your account, in which you define which features Claude will be able to interact with.

To create this access token, open Figma, click your name in the top-left corner, and go to "Settings". This opens a window in the center of the screen. Navigate to the "Security" tab, and in the "Personal access tokens" section click the "Generate new token" button.

This will open a new window asking you for three things:

- **Name of your access token**: use a name that helps you identify what it is. Example: Figma Console MCP.
- **Expiration**: this token grants access to features of your files, so for security reasons there is a limit on how long it can be used. Pick any of the options.
- **Scopes**: each selectable item grants read or write access to the files. For example, enabling `current_user:read` lets Claude read the name, e-mail and photo of the users who access your files. Select the options that make sense for design and handoff.

Once you finish, an access token will be generated in a format similar to this:

`figd_ABc1deF2GHI3_A1b2_j4k56L7MNOP_rst8UvWXYz`

Copy this token and paste it in a notepad for a moment, because as soon as you close this window, **you will never see this token again**. If you lose this code, you will need to create a new access token.

### Step 3: Configuring Claude

With Claude installed, we need to insert a small JSON snippet into Claude's configuration file. There is a common way to edit the configuration file on both Mac and Windows, but just in case, I will also explain how to do it separately for each operating system.

**Mac and Windows**:

Open Claude, click your username and go to "Settings". On that page, select the "Developers" menu and click the "Edit Config" button. This opens your file explorer with the file we need to edit already selected, which is "claude_desktop_config.json".

**Mac**:

Press `Cmd+Space` to open Spotlight and paste the following path:

```
~/Library/Application Support/Claude
```

The first result should show the "Claude" folder. Click to open it, then open the `claude_desktop_config.json` file.

**Windows**:

Press `Win+R` to open the "Run" window, and type the following path:

```
%APPDATA%\Claude\claude_desktop_config.json
```

Another way is to browse the folders manually, or simply paste this full path in Windows Explorer (just replace "YOUR_NAME" with your Windows username):

```
C:\Users\YOUR_NAME\AppData\Roaming\Claude\claude_desktop_config.json
```

**Editing the configuration file**:

Some things will already be written in the file. You don't need to delete anything, just insert the following:

```
"mcpServers": {
  "figma-console": {
    "command":"npx",
    "args": ["-y","figma-console-mcp@latest"],
    "env": {
      "FIGMA_ACCESS_TOKEN":"figd_yourTokenHere",
      "ENABLE_MCP_APPS":"true"
    }
  }
}
```

The complete file should look similar to this:

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

Save the file and close it.

### Step 4: Connecting Figma Desktop

For the connection between Claude and Figma to happen, you will need to run a specific plugin, but instead of finding it in the Figma Community, you will add it manually through the development area.

To do that, download the [Figma Console MCP](https://github.com/southleft/figma-console-mcp) repository. If you are not familiar with GitHub, the easiest way is to click the "Code" button, select the "Local" tab and click "Download ZIP".

To add this plugin to your Figma, open any file, click the menu with the Figma logo in the top-left corner, select "Plugins", then "Development", and finally "Import plugin from manifest".

Look for the repository folder you downloaded, and inside it, go into the "figma-desktop-bridge" subfolder, select the "manifest.json" file and open it.

With that, Figma will load the plugin and you will be able to run it. It is a small interface that only shows the connection status — there is no interaction — but you need to keep it open whenever you want to use Claude with Figma.

### Step 5: Connecting and testing

If Claude is open on your computer, quit the application completely so it can restart and apply the snippet you inserted earlier, then open it again. Start a new conversation and, with the plugin open in Figma, send Claude the following message:

```
Figma status
```

This makes it see the connection with Figma and validate that everything is working properly. On success, it should return information like this:

```
Figma is connected and ready! Here's the summary:

Status: ✅ Connected via WebSocket Bridge
Active File: File name
Current Page: Content
Transport: WebSocket on port 9224 (fallback from 9223)
All design tools: Available

Let me know what you'd like to do with the file!
```

If the plugin happens to be closed or some connection fails, Claude's natural response to "Figma status" is a web search to find out whether the Figma tool is up or down.

## Using Claude

Connection made, and everything confirmed by Claude, you can start asking it to work on your file. In the sessions we ran, there weren't many limits to what it can do. You can ask for things like:

- Creating new pages in your file
- Creating and editing complete prototypes of a page or scenario
- Creating and editing styles, variables and components
- Applying annotations and other Dev Mode features

The effectiveness of each request will depend entirely on how complete your prompt is. You can ask it to create a simple desktop login page, or ask it to create a page with defined resolutions, established actions, and using only the styles, variables and components from your design system.

Each prompt can take a while, because it always validates your file, looking for your components, variables and other information so it doesn't create anything new. As I mentioned earlier, you can use Claude on the free plan; the problem is the number of tokens consumed in this process. Your Claude quota will run out much faster than it would on a paid plan.
