import vscode = require('vscode');

// statusbar item for switching the Gno environment
export let gnoEnvStatusbarItem: vscode.StatusBarItem;

export const languageServerIcon = '$(arrow-up)';
export const languageServerErrorIcon = '$(arrow-down)';

export function updateLanguageServerIconGnoStatusBar(started: boolean, enabled: boolean) {
	if (!gnoEnvStatusbarItem) {
		return;
	}

	// Split the existing gnoEnvStatusbarItem.text into the version string part and
	// the gnopls icon part.
	let text = gnoEnvStatusbarItem.text;
	let icon = '';
	if (text.endsWith(languageServerIcon)) {
		text = text.substring(0, text.length - languageServerIcon.length);
	} else if (text.endsWith(languageServerErrorIcon)) {
		text = text.substring(0, text.length - languageServerErrorIcon.length);
	}

	if (started && enabled) {
		icon = languageServerIcon;
	} else if (!started && enabled) {
		icon = languageServerErrorIcon;
	}

	gnoEnvStatusbarItem.text = text + icon;
}
