import * as vscode from "vscode";
import { renameSymbol } from "./openai";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand("ai-rename.rename", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("AI Rename: No active editor");
            return;
        }
        const config = vscode.workspace.getConfiguration("aiRename");
        const maxCharactersNum = config.get<number>("maxCharactersNum")!;
        const maxChoicesNum = config.get<number>("maxChoicesNum")!;
        const maxToken = config.get<number>("maxNameLength")!;
        const temperature = config.get<number>("temperature")!;
        const apiKey = config.get<string>("openAiApiKey");
        if (!apiKey) {
            vscode.window.showErrorMessage("AI Rename: Please set OpenAI API key in configuration");
            return;
        }

        const document = editor.document;
        const curPos = editor.selection.active;
        if (document.getText().length > maxCharactersNum) {
            vscode.window.showErrorMessage(
                "AI Rename: File too large, try increasing `aiRename.maxCharactersNum` in configuration"
            );
            return;
        }

        let choices: Set<string>;
        try {
            choices = await renameSymbol(apiKey, maxChoicesNum, maxToken, temperature, document.getText(), curPos);
            console.log("new names: ", choices);
        } catch (error) {
            vscode.window.showErrorMessage(`AI Rename: Request failed: ${error}`);
            return;
        }

        if (choices.size === 0) {
            vscode.window.showErrorMessage("AI Rename: Failed to generate renaming choices");
            return;
        }

        const pick = await vscode.window.showQuickPick([...choices]);
        if (!pick) {
            console.log("AI Rename: User canceled");
            return;
        }

        const edit = await vscode.commands.executeCommand<Promise<vscode.WorkspaceEdit>>(
            "vscode.executeDocumentRenameProvider",
            document.uri,
            curPos,
            pick
        );
        await vscode.workspace.applyEdit(edit);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
