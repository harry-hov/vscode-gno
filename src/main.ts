import vscode = require('vscode');

import { GnoExtensionContext } from './context';

import * as commands from './commands';

const gnoCtx: GnoExtensionContext = {};

export function activate(ctx: vscode.ExtensionContext) {
        const res = vscode.workspace.getConfiguration("[gno]")
        const configuration = JSON.parse(JSON.stringify(res))

        // Auto apply gofumpt on save,
        // Respects "editor.formatOnSave"
        vscode.workspace.onDidSaveTextDocument(function (e) {
                const activeEditor = vscode.window.activeTextEditor;
                if (configuration["editor.formatOnSave"] == true && activeEditor?.document.languageId === "gno"){
                        commands.format(ctx, gnoCtx)()
                }
        });

        // Creates registerCommand()
        const registerCommand = commands.createRegisterCommand(ctx, gnoCtx);

        // Register `gno.welcome`
        registerCommand('gno.welcome', commands.welcome);

        // Register `gno.format`
        registerCommand('gno.format', commands.format);
}

export function deactivate() { }
