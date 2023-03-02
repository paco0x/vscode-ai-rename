import * as vscode from "vscode"
import { getRenameSuggestions } from "./openai"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand("ai-rename.rename", async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            vscode.window.showErrorMessage("AI Rename: No active editor")
            return
        }
        const config = vscode.workspace.getConfiguration("aiRename")
        const maxCharactersNum = config.get<number>("maxCharactersNum")!
        const maxSuggestionsNum = config.get<number>("maxSuggestionsNum")!
        const maxToken = config.get<number>("maxNameLength")!
        const temperature = config.get<number>("temperature")!
        const apiKey = config.get<string>("openAiApiKey")
        if (!apiKey) {
            vscode.window.showErrorMessage("AI Rename: please set OpenAI API key in configuration")
            return
        }

        const document = editor.document
        const curPos = editor.selection.active
        const symbol = document.getText(document.getWordRangeAtPosition(curPos))

        let documentText = document.getText()
        if (documentText.length > maxCharactersNum) {
            const range = document.validateRange(
                new vscode.Range(Math.max(curPos.line - 30, 0), 0, curPos.line + 30, 0),
            )
            documentText = document.getText(range)
        }

        let choices = new Set<string>()
        try {
            choices = await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    cancellable: true,
                    title: "AI Rename",
                },
                async progress => {
                    progress.report({ message: "Loading naming suggestions from openAI..." })
                    return await getRenameSuggestions(
                        apiKey,
                        maxSuggestionsNum,
                        maxToken,
                        temperature,
                        documentText,
                        symbol,
                        curPos,
                    )
                },
            )
        } catch (error) {
            vscode.window.showErrorMessage(`AI Rename: request failed -> ${error}`)
            return
        }

        if (choices.size === 0) {
            vscode.window.showErrorMessage("AI Rename: failed to generate renaming choices")
            return
        }

        console.log("new names: ", choices)
        const pick = await vscode.window.showQuickPick([...choices])
        if (!pick) {
            console.log("AI Rename: user canceled")
            return
        }

        const edit = await vscode.commands.executeCommand<Promise<vscode.WorkspaceEdit>>(
            "vscode.executeDocumentRenameProvider",
            document.uri,
            curPos,
            pick,
        )
        await vscode.workspace.applyEdit(edit)
    })

    context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
