import vscode = require('vscode');

export const getGnoConfig = (uri?: vscode.Uri) => {
	return getConfig('gno', uri);
};

function getConfig(section: string, uri?: vscode.Uri | null) {
	if (!uri) {
		if (vscode.window.activeTextEditor) {
			uri = vscode.window.activeTextEditor.document.uri;
		} else {
			uri = null;
		}
	}
	return vscode.workspace.getConfiguration(section, uri);
}
