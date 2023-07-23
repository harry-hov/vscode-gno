import vscode = require("vscode"); 
import cp = require('child_process');
import { CommandFactory } from ".";
import { getGnoConfig } from '../config';
import { getBinPath, promptForMissingTool } from '../util';
import { globalChannel } from "../global";
import dayjs = require("dayjs");

export const addPkg: CommandFactory = (ctx, gnoCtx) => {
        return async () => {
                const wsFolders = vscode.workspace.workspaceFolders;
                if (wsFolders === undefined || wsFolders?.length === 0) {
                        vscode.window.showErrorMessage("gno.maketx.addpkg: cannot get workspace folder");
                        return new Error("gno.maketx.addpkg: cannot get workspace folder")
                }
                const rootDir = wsFolders?.[0].uri.fsPath;

                const pkgDir = await vscode.window.showInputBox({
                        prompt: "Enter package dir",
                        value: rootDir,
                        validateInput: (value) => {
                                if (value.length === 0) {
                                        return "should not be empty"
                                }
                                return null;
                        }
                })
                if (pkgDir === undefined) {
                        return new Error("gno.maketx.addpkg: cannot get package dir")
                }
                const pkgPath = await vscode.window.showInputBox({
                        prompt: "Enter package name",
                        value: "gno.land/",
                        validateInput: (value) => {
                                if (!value.startsWith("gno.land/")) {
                                        return "should start with gno.land/r/ or gno.land/r/"
                                }
                                return null;
                        }
                })
                if (pkgPath === undefined) {
                        return new Error("gno.maketx.addpkg: cannot get package name")
                }
                const deposit = await vscode.window.showInputBox({
                        prompt: "Enter deposit amount",
                        value: "10000000ugnot",
                        validateInput: (value) => {
                                if (!value.endsWith("ugnot")) {
                                        return "amount should be in ugnot"
                                }
                                return null;
                        }
                })
                if (deposit === undefined) {
                        return new Error("gno.maketx.addpkg: cannot get deposit amount")
                }
                const remote = await vscode.window.showInputBox({
                        prompt: "Enter remote url",
                        value: "localhost:26657",
                        validateInput: (value) => {
                                if (value.length === 0) {
                                        return "should not be empty"
                                }
                                return null;
                        }
                })
                if (remote === undefined) {
                        return new Error("gno.maketx.addpkg: cannot get remote url")
                }
                const keyname = await vscode.window.showInputBox({
                        prompt: "Enter key name",
                        validateInput: (value) => {
                                if (value.length === 0) {
                                        return "should not be empty"
                                }
                                return null;
                        }
                })
                if (keyname === undefined) {
                        return new Error("gno.maketx.addpkg: cannot get keyname")
                }
                let pass = await vscode.window.showInputBox({
                        prompt: "Enter password",
                        password: true,
                        validateInput: (value) => {
                                return null;
                        }
                })
                if (pass === undefined) {
                        pass = "";
                }

                const config = getGnoConfig();
                const makeTxConfig = config.get<{ [key: string]: any }>('makeTx');
                const broadcast = makeTxConfig ? makeTxConfig['broadcast'] : true;
                const gasFee = makeTxConfig ? makeTxConfig['gasFee'] : "1000000ugnot";
                const gasWanted = makeTxConfig ? makeTxConfig['gasWanted'] : "2000000";

                return await runMaketxAddpkg(
                        rootDir, 
                        pkgDir.toString(),
                        pkgPath.toString(),
                        deposit.toString(),
                        gasFee,
                        gasWanted,
                        broadcast,
                        remote.toString(),
                        keyname.toString(),
                        pass.toString(),
                ).then(res => {
			return null
		}).then(undefined, err => {
			return err;
		});
        }
}

function runMaketxAddpkg(
        rootDir: string,
        pkgdir: string,
        pkgPath: string,
        deposit: string,
        gasFee: string,
        gasWanted: string,
        broadcast: boolean,
        remote: string,
        keyname: string,
        pass: string,
): Thenable<void> {
        return new Promise(async (resolve, reject) => {
                const gnokey = getBinPath('gnokey');
                const gnokeyMaketxAddpkgFlags = ['maketx', 'addpkg'];
                gnokeyMaketxAddpkgFlags.push('-pkgpath', pkgPath)
                gnokeyMaketxAddpkgFlags.push('-pkgdir', pkgdir)
                gnokeyMaketxAddpkgFlags.push('-deposit', deposit)
                gnokeyMaketxAddpkgFlags.push('-gas-fee', gasFee)
                gnokeyMaketxAddpkgFlags.push('-gas-wanted', gasWanted)
                if (broadcast){
                        gnokeyMaketxAddpkgFlags.push('-broadcast')
                }
                gnokeyMaketxAddpkgFlags.push('-remote', remote)
                gnokeyMaketxAddpkgFlags.push('-insecure-password-stdin')
                gnokeyMaketxAddpkgFlags.push(keyname)

                const child = cp.spawn(gnokey, gnokeyMaketxAddpkgFlags, { cwd: rootDir });
                globalChannel.show();
                globalChannel.appendLine(`${dayjs().format()} gno.maketx.addpkg: ${gnokey} ${gnokeyMaketxAddpkgFlags.join(' ')}`);
                child.stderr.on('data', function (data) {
                        globalChannel.appendLine(`${dayjs().format()} gno.maketx.addpkg: ${data.toString()}`);
                        if (data.toString().startsWith("Enter password")) {
                                for (let i = 0; i < pass.length; i++) {
                                        child.stdin.write(pass[i]);
                                }
                                child.stdin.write("\n");
                        }
                });
                child.stdout.on('data', function (data) {
                        globalChannel.appendLine(`${dayjs().format()} gno.maketx.addpkg: ${data.toString()}`);
                });
                child.on('error', function (err) {
                        if (err instanceof Error && (<any>err).code === 'ENOENT') {
                                promptForMissingTool(gnokey);
                        }
                        return reject();
                });
                child.on('exit', function (code) {
                        if (code == 0) {
                                globalChannel.appendLine("gno.maketx.addpkg: Done!")
                                return resolve();
                        }
                        globalChannel.appendLine("gno.maketx.addpkg: Failed!")
                        return reject();
                });
        })
}
