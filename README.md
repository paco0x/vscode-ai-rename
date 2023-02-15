![icon](./assets/logo.png)

# `ai-rename` Visual Studio Code Extension

> "There are only two hard things in Computer Science: cache invalidation and naming things."
> -- Phil Karlton

`ai-rename` is a Visual Studio Code extension that leverages OpenAI's API to rename the symbol under the cursor. It uses OpenAI's API to provide naming suggestions and apply a new name automatically.

## Installation

Install it from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=paco0x.ai-rename).

An OpenAI API key is required before using. For more information on how to get a key, visit [OpenAI's website](https://openai.com/api/).

Set your OpenAI key to `"aiRename.openAiApiKey"` in your VS Code `settings.json` or `Open Ai Api Key` on the UI:

![key-config](./assets/key-config.png)

## Usage

Call up the command palette by pressing `cmd+shift+p` (mac) or `ctrl+shift+p` (win). Then use the command `AI Rename: Rename` to generate naming suggestions for the symbol under your cursor. Select an item and it will rename it automatically.

You can also bind this command to a shortcut for convenience.

See the demo:

![demo](./assets/demo.gif)

## Extension Settings

This extension contributes the following settings:

-   `aiRename.openAiApiKey`: the API key of OpenAI.
-   `aiRename.maxChoicesNum`: the maximum number of choices generated by OpenAI; it can quickly consume your token quota if it's too high.
-   `aiRename.maxNameLength`: the maximum length of the generated name.
-   `aiRename.openAiTemperature`: the temperature parameter in OpenAI requests.
-   `aiRename.maxCharactersNum`: the maximum number of characters in the document.

## Known Issues

-   Cannot auto-rename when there are syntax errors in the code. This is the same as the built-in VS Code rename tool.
-   May not provide accurate or appropriate suggestions for long functions.
-   Not accurate when the variable is too short or the document contains non-ASCII characters.
-   Sometimes, the new name may conflict with other symbol names.
-   Lack of context of the whole project.

## To-Do List

-   Support a right-click menu item.
-   Only send surrounding text to OpenAI API.
-   Add tests.

## Contributing

Feel free to contribute to the `ai-rename` extension by submitting bug reports, feature requests, or pull requests on the [GitHub repository](https://github.com/paco0x/vscode-ai-rename.gi).

---

**Enjoy!**
