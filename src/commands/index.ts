import vscode = require('vscode');

import { GnoExtensionContext } from '../context';

export { welcome } from './welcome';

type CommandCallback<T extends unknown[]> = (...args: T) => Promise<unknown> | unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFactory<T extends unknown[] = any[]> = (
	ctx: vscode.ExtensionContext,
	gnoCtx: GnoExtensionContext
) => CommandCallback<T>;

export function createRegisterCommand(ctx: vscode.ExtensionContext, gnoCtx: GnoExtensionContext) {
	return function registerCommand(name: string, fn: CommandFactory) {
		ctx.subscriptions.push(vscode.commands.registerCommand(name, fn(ctx, gnoCtx)));
	};
}
