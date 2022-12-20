import vscode = require("vscode")
import cp = require("child_process")
import util = require('../util');
import { dirname, isAbsolute } from 'path';

import { CommandFactory } from "."

export const format: CommandFactory = () => {
	return () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor == undefined || activeEditor?.document.languageId !== "gno") {
			return vscode.window.showErrorMessage("gno.format: not a .gno file");
		}

		let filename = activeEditor?.document.fileName
		if (filename != undefined) {
			const res = runGoFumpt(filename)
			return res
		}
		return vscode.window.showErrorMessage("gno.format: cannot get filename");
	}
}

/**
 * @param fileName name of the activeEditor file
 * @returns errorMessage in case the method fails, null otherwise
 */
function runGoFumpt(
	fileName: string,
): Thenable<void> {
	const gofumpt = util.getBinPath('gofumpt');

	return new Promise((resolve, reject) => {
		cp.execFile(
			gofumpt,
			[
				'-w',
				fileName,
			],
			{
				//env: toolExecutionEnvironment(),
				cwd: dirname(fileName)
			},
			(err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(stderr || err.message)
					return vscode.window.showErrorMessage("gno.format: gofumpt failed");
				}
			}
		);
	});
}
