import cp = require('child_process');
import vscode = require('vscode');
import { getGnoConfig } from '../config';
import { getBinPath, promptForMissingTool } from '../util';
import { getTestFunctions } from '../testUtil';
import { CommandFactory } from "."
import { globalChannel } from "../global";
import dayjs = require("dayjs");
import exp = require('constants');
import { dirname } from 'path';

export const testPackage: CommandFactory = (ctx, gnoCtx) => {
        return async () => {
                globalChannel.clear();

                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor == undefined || activeEditor?.document.languageId !== "gno") {
                        vscode.window.showErrorMessage("gno.test.package: not a .gno file");
                        return new Error("gno.test.package: not a .gno file")
                }

                let filename = activeEditor?.document.fileName
                if (filename === undefined) {
                        vscode.window.showErrorMessage("gno.test.package: cannot get filename");
                        return new Error("gno.test.package: cannot get filename")
                }
                if (filename.endsWith("_test.gno") === false) {
                        vscode.window.showErrorMessage("gno.test.package: not a _test.gno file");
                        return new Error("gno.test.package: not a _test.gno file")
                }

                return await runGnoTest(dirname(filename)).then(res => {
                        return null
                }).then(undefined, err => {
                        return err;
                })
        } 
}

export const testFile: CommandFactory = (ctx, gnoCtx) => {
        return async () => {
                globalChannel.clear();

                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor == undefined || activeEditor?.document.languageId !== "gno") {
                        vscode.window.showErrorMessage("gno.test.file: not a .gno file");
                        return new Error("gno.test.file: not a .gno file")
                }

                let filename = activeEditor?.document.fileName
                if (filename === undefined) {
                        vscode.window.showErrorMessage("gno.test.file: cannot get filename");
                        return new Error("gno.test.file: cannot get filename")
                }
                if (filename.endsWith("_test.gno") === false) {
                        vscode.window.showErrorMessage("gno.test.file: not a _test.gno file");
                        return new Error("gno.test.file: not a _test.gno file")
                }

                const getFunctions = getTestFunctions

                return activeEditor.document
			.save()
			.then(() => {
				return getFunctions(gnoCtx, activeEditor.document).then((testFunctions) => {
					const functions= testFunctions?.map((sym) => sym.name);
					return runGnoTest(dirname(filename),functions);
				});
			})
			.then(undefined, (err) => {
				console.error(err);
				return Promise.resolve(false);
			});
        } 
}


function runGnoTest(
        pkgName: string,
        functionNames: string[] = []
): Thenable<void> {
        return new Promise((resolve, reject) => {
                const gno = getBinPath('gno');
                const gnoFlags = ['test', '-timeout', '30s', '-run', 'Test' ];
                if (functionNames.length > 0) {
                        gnoFlags.push('-run')
                        gnoFlags.push(functionNames.map(function(name) {
                                return  "^" + name + '$';
                            }).join('|')
                        )
                }
                gnoFlags.push(pkgName);
                cp.execFile(gno, gnoFlags, { cwd: pkgName }, (err, stdout, stderr) => {
                        if (err && (<any>err).code === 'ENOENT') {
                                promptForMissingTool(gno);
                                return reject();
                        }
                        if (err) {
                                globalChannel.append(`${dayjs().format()} gno.test.package: ${stderr}`);
                                globalChannel.show();
                                vscode.window.showErrorMessage(stderr || err.message);
                                return reject(stderr)
                        }
                        globalChannel.show();
                        globalChannel.appendLine(`${dayjs().format()} gno.test.package: running tests...`)
                        globalChannel.appendLine(`${gno} ${gnoFlags.join(" ")}`)
                        globalChannel.appendLine(stderr)
                        return resolve()
                })
        })
}
