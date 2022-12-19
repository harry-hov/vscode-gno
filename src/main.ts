import vscode = require('vscode');

import { GnoExtensionContext } from './context';

import * as commands from './commands';

const goCtx: GnoExtensionContext = {};

export function activate(ctx: vscode.ExtensionContext) {
        // Creates registerCommand()
        const registerCommand = commands.createRegisterCommand(ctx, goCtx);
	
        // Register `gno.welcome`
        registerCommand('gno.welcome', commands.welcome);

        // Register `gno.format`
        registerCommand('gno.format', commands.format);
}

export function deactivate() { }
