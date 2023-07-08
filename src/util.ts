import vscode = require('vscode');

export const envPath = process.env['PATH'] || (process.platform === 'win32' ? process.env['Path'] : null);

// getBinPath returns the path to the tool.
// TODO: Implementation
export function getBinPath(tool: string): string {
	return tool;
}

export async function promptForMissingTool(toolName: string) {
	vscode.window.showWarningMessage(
		`${toolName} is not found. Please make sure it is installed and available in the PATH ${envPath}`
	);
}

