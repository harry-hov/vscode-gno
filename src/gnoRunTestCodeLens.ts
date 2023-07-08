import vscode = require('vscode');
import { CancellationToken, CodeLens, TextDocument } from 'vscode';
import { getGnoConfig } from './config';
import { GnoBaseCodeLensProvider } from './gnoBaseCodeLens';
import { GoLegacyDocumentSymbolProvider } from './language/legacy/goOutline';
import { GnoExtensionContext } from './context';
import { GNO_MODE } from './gnoMode';

export class GnoRunTestCodeLensProvider extends GnoBaseCodeLensProvider {
	static activate(ctx: vscode.ExtensionContext, gnoCtx: GnoExtensionContext) {
		const testCodeLensProvider = new this(gnoCtx);
		ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(GNO_MODE, testCodeLensProvider));
		ctx.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration(async (e: vscode.ConfigurationChangeEvent) => {
				if (!e.affectsConfiguration('gno')) {
					return;
				}
				const updatedGnoConfig = getGnoConfig();
				if (updatedGnoConfig['enableCodeLens']) {
					testCodeLensProvider.setEnabled(updatedGnoConfig['enableCodeLens']['runtest']);
				}
			})
		);
	}

        constructor(private readonly gnoCtx: GnoExtensionContext) {
		super();
	}

	public async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
		if (!this.enabled) {
			return [];
		}
		const config = getGnoConfig(document.uri);
		const codeLensConfig = config.get<{ [key: string]: any }>('enableCodeLens');
		const codelensEnabled = codeLensConfig ? codeLensConfig['runtest'] : false;
		if (!codelensEnabled || !document.fileName.endsWith('_test.gno')) {
			return [];
		}

		const codelenses = await Promise.all([
			this.getCodeLensForPackage(document, token)
		]);
		return ([] as CodeLens[]).concat(...codelenses);
	}

	private async getCodeLensForPackage(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
		const documentSymbolProvider = new GoLegacyDocumentSymbolProvider(false);
		const symbols = await documentSymbolProvider.provideDocumentSymbols(document, token);
		if (!symbols || symbols.length === 0) {
			return [];
		}
		const pkg = symbols[0];
		if (!pkg) {
			return [];
		}
		const range = pkg.range;
		const packageCodeLens = [
			new CodeLens(range, {
				title: 'run package tests',
				command: 'gno.test.package'
			}),
			new CodeLens(range, {
				title: 'run file tests',
				command: 'gno.test.file'
			})
		];
		return packageCodeLens;
	}
}
