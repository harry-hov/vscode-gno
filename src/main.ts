import vscode = require('vscode');

import { GnoExtensionContext } from './context';

import * as commands from './commands';
import { format } from 'path';
import { getGnoConfig } from './config';
import { globalChannel } from './global';

const gnoCtx: GnoExtensionContext = {};
let diagnosticCollection: vscode.DiagnosticCollection;
let completionItemLabel: vscode.CompletionItemLabel;

export async function activate(ctx: vscode.ExtensionContext) {
        const go = vscode.extensions.getExtension("golang.go");
        if (!go?.isActive) {
                await go?.activate();
        }

        const cfg = getGnoConfig();

        const res = vscode.workspace.getConfiguration("[gno]");
        const configuration = JSON.parse(JSON.stringify(res));

        diagnosticCollection = vscode.languages.createDiagnosticCollection('gno');
        ctx.subscriptions.push(diagnosticCollection);

        vscode.workspace.onDidSaveTextDocument(function (e) {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor?.document.languageId === "gno") {
                        diagnosticCollection.set(activeEditor.document.uri, undefined);
 
                        async function format() {
                                // Auto apply gofumpt on save,
                                // Respects "editor.formatOnSave"
                                if (configuration["editor.formatOnSave"] == true) {
                                        commands.format(ctx, gnoCtx)(true)
                                }
                        }

                        async function precompile() {
                                // Auto apply gofumpt on save,
                                // Respects "editor.formatOnSave"
                                if (cfg["precompileOnSave"]) {
                                        commands.precompile(ctx, gnoCtx)(true)
                                }
                        }

                        format().then(() => {
                                precompile().then(() => {
                                        setTimeout(() => {
                                                // Apply diagnostics to `*.gno` file from `*.gno.gen.go`
                                                const genFileUri = vscode.Uri.file(activeEditor.document.fileName + ".gen.go");
                                                diagnosticCollection.set(activeEditor.document.uri, vscode.languages.getDiagnostics(genFileUri));
                                        }, 1000)
                                })
                        })                
                }
        });

        // Creates registerCommand()
        const registerCommand = commands.createRegisterCommand(ctx, gnoCtx);

        // Register `gno.welcome`
        registerCommand('gno.welcome', commands.welcome);

        // Register `gno.format`
        registerCommand('gno.format', commands.format);

        // Register `gno.precompile`
        registerCommand('gno.precompile', commands.precompile);
}

export function deactivate() { }
