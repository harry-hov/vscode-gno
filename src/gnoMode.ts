import vscode = require('vscode');

interface Filter extends vscode.DocumentFilter {
	language: string;
	scheme: string;
}

export const GNO_MODE: Filter = { language: 'gno', scheme: 'file' };
export const GNO_MOD_MODE: Filter = { language: 'gno.mod', scheme: 'file' };

export function isGnoFile(document: vscode.TextDocument): boolean {
	if (
		vscode.languages.match(GNO_MODE, document) ||
		vscode.languages.match(GNO_MOD_MODE, document)
	) {
		return true;
	}
	return false;
}
