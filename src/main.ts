import vscode = require('vscode');

import { GnoExtensionContext } from './context';

import * as commands from './commands';
import { format } from 'path';
import { getGnoConfig } from './config';
import { GnoRunTestCodeLensProvider } from './gnoRunTestCodeLens';
import { globalChannel } from './global';

const gnoCtx: GnoExtensionContext = {};
let diagnosticCollection: vscode.DiagnosticCollection;
let completionItemLabel: vscode.CompletionItemLabel;

export async function activate(ctx: vscode.ExtensionContext) {
        const cfg = getGnoConfig();

        const res = vscode.workspace.getConfiguration("[gno]");
        const configuration = JSON.parse(JSON.stringify(res));

        diagnosticCollection = vscode.languages.createDiagnosticCollection('gno');
        ctx.subscriptions.push(diagnosticCollection);

        if (cfg['useLanguageServer'] === false) {
                vscode.workspace.onDidSaveTextDocument(async function (e) {
                        const activeEditor = vscode.window.activeTextEditor;
                        if (activeEditor?.document.languageId === "gno") {
                                diagnosticCollection.set(activeEditor.document.uri, undefined);
                                // Auto apply gofumpt on save,
                                // Respects "editor.formatOnSave"
                                if (configuration["editor.formatOnSave"] == true) {
                                        const err = await commands.format(ctx, gnoCtx)(true)
                                        if (err !== null) {
                                                return
                                        }
                                }
                        }
                });
        }

        // Creates registerCommand()
        const registerCommand = commands.createRegisterCommand(ctx, gnoCtx);

        // Activate `gno.test` CodeLens
        GnoRunTestCodeLensProvider.activate(ctx, gnoCtx);

        await commands.startLanguageServer(ctx, gnoCtx)();

        // Register `gno.welcome`
        registerCommand('gno.welcome', commands.welcome);

        // Register `gno.languageserver.restart`
        registerCommand('gno.languageserver.restart', commands.startLanguageServer);

        // Register `gno.format`
        registerCommand('gno.format', commands.format);

        // Register `gno.precompile`
        registerCommand('gno.precompile', commands.precompile);

        // Register `gno.clean`
        registerCommand('gno.clean', commands.clean);

        // Register `gno.test.package`
        registerCommand('gno.test.package', commands.testPackage);

        // Register `gno.test.file`
        registerCommand('gno.test.file', commands.testFile);

        // Register `gno.test.function`
        registerCommand('gno.test.function', commands.testFunction);

        // Register `gno.mod.init`
        registerCommand('gno.mod.init', commands.modInit);

        // Register `gno.maketx.addpkg`
        registerCommand('gno.maketx.addpkg', commands.addPkg);
}

export function deactivate() { }
