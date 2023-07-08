import vscode = require("vscode")
import cp = require("child_process")
import util = require('../util');
import { dirname, isAbsolute } from 'path';

import { CommandFactory } from "."
import { globalChannel } from "../global";
import dayjs = require("dayjs");

export const precompile: CommandFactory = (ctx, gnoCtx) => {
	return async (calledOnSave: boolean = false) => {
		globalChannel.clear();

		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor == undefined || activeEditor?.document.languageId !== "gno") {
			vscode.window.showErrorMessage("gno.precompile: not a .gno file");
			return new Error("gno.precompile: not a .gno file")
		}

		let filename = activeEditor?.document.fileName
		if (filename === undefined) {
			vscode.window.showErrorMessage("gno.precompile: cannot get filename");
			return new Error("gno.precompile: cannot get filename")
		}

		return await runGnoPrecompile(filename, calledOnSave).then(res => {
			return null
		}).then(undefined, err => {
			return err;
		})
	}
}

/**
 * @param fileName name of the activeEditor file
 * @returns errorMessage in case the method fails, null otherwise
 */
function runGnoPrecompile(
	fileName: string,
	calledOnSave: boolean
): Thenable<void> {
	return new Promise((resolve, reject) => {
		const gno = util.getBinPath('gno');
		const gnoFlags = ['precompile', dirname(fileName)];
		cp.execFile(gno, gnoFlags, { cwd: dirname(fileName) }, (err, stdout, stderr) => {
			if (err && (<any>err).code === 'ENOENT') {
				util.promptForMissingTool(gno);
				return reject();
			}
			if (err) {
				globalChannel.append(`${dayjs().format()} gno.precompile: ${stderr}`);
				globalChannel.show();
				vscode.window.showErrorMessage(stderr || err.message);
				return reject(stderr)
			}
			if (!calledOnSave) {
				globalChannel.show();
				globalChannel.appendLine(`${dayjs().format()} gno.precompile: Done!`)
			}
			return resolve()
		});
	});
}
