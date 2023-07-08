import vscode = require('vscode');
import { ChildProcess } from 'child_process';
import { NearestNeighborDict, Node } from './avlTree';

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

// Kill a process.
//
// READ THIS BEFORE USING THE FUNCTION:
//
// TODO: This function is kept for historical reasons and should be removed once
// its user (go-outline) is replaced. Outlining uses this function and not
// killProcessTree because of performance issues that were observed in the past.
// See https://go-review.googlesource.com/c/vscode-go/+/242518/ for more
// details and background.
export function killProcess(p: ChildProcess) {
	if (p && p.pid && p.exitCode === null) {
		try {
			p.kill();
		} catch (e) {
			console.log(`Error killing process ${p.pid}: ${e}`);
		}
	}
}

export function getFileArchive(document: vscode.TextDocument): string {
	const fileContents = document.getText();
	return document.fileName + '\n' + Buffer.byteLength(fileContents, 'utf8') + '\n' + fileContents;
}

export function makeMemoizedByteOffsetConverter(buffer: Buffer): (byteOffset: number) => number {
	const defaultValue = new Node<number, number>(0, 0); // 0 bytes will always be 0 characters
	const memo = new NearestNeighborDict(defaultValue, NearestNeighborDict.NUMERIC_DISTANCE_FUNCTION);
	return (byteOffset: number) => {
		const nearest = memo.getNearest(byteOffset);
		const byteDelta = byteOffset - nearest.key;

		if (byteDelta === 0) {
			return nearest.value ?? 0;
		}

		let charDelta: number;
		if (byteDelta > 0) {
			charDelta = buffer.toString('utf8', nearest.key, byteOffset).length;
		} else {
			charDelta = -buffer.toString('utf8', byteOffset, nearest.key).length;
		}

		memo.insert(byteOffset, (nearest.value ?? 0) + charDelta);
		return (nearest.value ?? 0) + charDelta;
	};
}
