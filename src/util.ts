import vscode = require('vscode');
import { ChildProcess } from 'child_process';
import { NearestNeighborDict, Node } from './avlTree';
import path = require('path');
import fs = require('fs');
import os = require('os');
import { goConfig } from './config';
import { 
	fixDriveCasingInWindows,
	getInferredGopath, 
	resolveHomeDir
} from './utils/pathUtils';

let toolsGopath: string;

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

// getCheckForToolsUpdatesConfig returns gno.toolsManagement.checkForUpdates configuration.
export function getCheckForToolsUpdatesConfig(gnocfg: vscode.WorkspaceConfiguration) {
	return gnocfg.get('toolsManagement.checkForUpdates') as string;
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

let currentGopath = '';
export function getCurrentGoPath(workspaceUri?: vscode.Uri): string {
	const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
	const currentFilePath = fixDriveCasingInWindows(activeEditorUri?.fsPath ?? '');
	const currentRoot = (workspaceUri && workspaceUri.fsPath) || getWorkspaceFolderPath(activeEditorUri) || '';
	const config = goConfig(workspaceUri || activeEditorUri);

	// Infer the GOPATH from the current root or the path of the file opened in current editor
	// Last resort: Check for the common case where GOPATH itself is opened directly in VS Code
	let inferredGopath: string | undefined;
	if (config['inferGopath'] === true) {
		inferredGopath = getInferredGopath(currentRoot) || getInferredGopath(currentFilePath);
		if (!inferredGopath) {
			try {
				if (fs.statSync(path.join(currentRoot, 'src')).isDirectory()) {
					inferredGopath = currentRoot;
				}
			} catch (e) {
				// No op
			}
		}
		if (inferredGopath && process.env['GOPATH'] && inferredGopath !== process.env['GOPATH']) {
			inferredGopath += path.delimiter + process.env['GOPATH'];
		}
	}

	const configGopath = config['gopath'] ? resolvePath(substituteEnv(config['gopath']), currentRoot) : '';
	currentGopath = (inferredGopath ? inferredGopath : configGopath || process.env['GOPATH']) ?? '';
	return currentGopath;
}

export function getToolsGopath(useCache = true): string {
	if (!useCache || !toolsGopath) {
		toolsGopath = resolveToolsGopath();
	}
	return toolsGopath;
}

function resolveToolsGopath(): string {
	let toolsGopathForWorkspace = substituteEnv(goConfig()['toolsGopath'] || '');

	// In case of single root
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length <= 1) {
		return resolvePath(toolsGopathForWorkspace);
	}

	// In case of multi-root, resolve ~ and ${workspaceFolder}
	if (toolsGopathForWorkspace.startsWith('~')) {
		toolsGopathForWorkspace = path.join(os.homedir(), toolsGopathForWorkspace.substr(1));
	}
	if (
		toolsGopathForWorkspace &&
		toolsGopathForWorkspace.trim() &&
		!/\${workspaceFolder}|\${workspaceRoot}/.test(toolsGopathForWorkspace)
	) {
		return toolsGopathForWorkspace;
	}

	if (!vscode.workspace.isTrusted) {
		return toolsGopathForWorkspace;
	}

	// If any of the folders in multi root have toolsGopath set and the workspace is trusted, use it.
	for (const folder of vscode.workspace.workspaceFolders) {
		let toolsGopathFromConfig = <string>goConfig(folder.uri).inspect('toolsGopath')?.workspaceFolderValue;
		toolsGopathFromConfig = resolvePath(toolsGopathFromConfig, folder.uri.fsPath);
		if (toolsGopathFromConfig) {
			return toolsGopathFromConfig;
		}
	}
	return toolsGopathForWorkspace;
}

/**
 * Expands ~ to homedir in non-Windows platform and resolves
 * ${workspaceFolder}, ${workspaceRoot} and ${workspaceFolderBasename}
 */
export function resolvePath(inputPath: string, workspaceFolder?: string): string {
	if (!inputPath || !inputPath.trim()) {
		return inputPath;
	}

	if (!workspaceFolder && vscode.workspace.workspaceFolders) {
		workspaceFolder = getWorkspaceFolderPath(
			vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri
		);
	}

	if (workspaceFolder) {
		inputPath = inputPath.replace(/\${workspaceFolder}|\${workspaceRoot}/g, workspaceFolder);
		inputPath = inputPath.replace(/\${workspaceFolderBasename}/g, path.basename(workspaceFolder));
	}
	return resolveHomeDir(inputPath);
}

export function getWorkspaceFolderPath(fileUri?: vscode.Uri): string | undefined {
	if (fileUri) {
		const workspace = vscode.workspace.getWorkspaceFolder(fileUri);
		if (workspace) {
			return fixDriveCasingInWindows(workspace.uri.fsPath);
		}
	}

	// fall back to the first workspace
	const folders = vscode.workspace.workspaceFolders;
	if (folders && folders.length) {
		return fixDriveCasingInWindows(folders[0].uri.fsPath);
	}
	return undefined;
}

export function substituteEnv(input: string): string {
	return input.replace(/\${env:([^}]+)}/g, (match, capture) => {
		return process.env[capture.trim()] || '';
	});
}

/**
 * Removes any diagnostics in collection, where there is a diagnostic in
 * newDiagnostics on the same line in fileUri.
 */
export function removeDuplicateDiagnostics(
	collection: vscode.DiagnosticCollection | undefined,
	fileUri: vscode.Uri,
	newDiagnostics: vscode.Diagnostic[]
) {
	if (collection && collection.has(fileUri)) {
		collection.set(fileUri, deDupeDiagnostics(newDiagnostics, collection.get(fileUri)!.slice()));
	}
}

/**
 * Removes any diagnostics in otherDiagnostics, where there is a diagnostic in
 * buildDiagnostics on the same line.
 */
function deDupeDiagnostics(
	buildDiagnostics: vscode.Diagnostic[],
	otherDiagnostics: vscode.Diagnostic[]
): vscode.Diagnostic[] {
	const buildDiagnosticsLines = buildDiagnostics.map((x) => x.range.start.line);
	return otherDiagnostics.filter((x) => buildDiagnosticsLines.indexOf(x.range.start.line) === -1);
}
