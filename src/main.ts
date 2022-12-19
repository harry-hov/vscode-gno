import vscode = require('vscode');

import { GnoExtensionContext } from './context';

import * as commands from './commands';

const gnoCtx: GnoExtensionContext = {};

export function activate(ctx: vscode.ExtensionContext) {
        // Auto apply gofumpt on save,
        // TODO: if "editor.formatOnSave" == true, 
        vscode.workspace.onDidSaveTextDocument(function (e) {
                commands.format(ctx, gnoCtx)()
        });

        // Creates registerCommand()
        const registerCommand = commands.createRegisterCommand(ctx, gnoCtx);

        // Register `gno.welcome`
        registerCommand('gno.welcome', commands.welcome);

        // Register `gno.format`
        registerCommand('gno.format', commands.format);
}

export function deactivate() { }
