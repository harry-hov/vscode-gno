import * as vscode from 'vscode';

import { CommandFactory } from '.';

export const welcome: CommandFactory = () => {
        return () => {
                return vscode.window.showInformationMessage("Welcome to Gno.land!")
        }
}
