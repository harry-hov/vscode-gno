import vscode = require('vscode');
import { GoDocumentFormattingEditProvider } from './legacy/goFormat';
import { GnoExtensionContext } from '../context';
import { GNO_MODE } from '../gnoMode';

export class LegacyLanguageService implements vscode.Disposable {
	private _disposables: vscode.Disposable[] = [];

	constructor(ctx: vscode.ExtensionContext, goCtx: GnoExtensionContext) {
		this._disposables.push(
			vscode.languages.registerDocumentFormattingEditProvider(GNO_MODE, new GoDocumentFormattingEditProvider())
		);
	}

	dispose() {
		for (const d of this._disposables) {
			d.dispose();
		}
	}
}
