import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { LanguageServerConfig, ServerInfo } from './language/gnoLanguageServer';
import { LegacyLanguageService } from './language/registerDefaultProviders';

export interface GnoExtensionContext {
        languageClient?: LanguageClient;
	legacyLanguageService?: LegacyLanguageService;
	latestConfig?: LanguageServerConfig;
        serverOutputChannel?: vscode.OutputChannel; // server-side output.
	serverTraceChannel?: vscode.OutputChannel; // client-side tracing.
        govulncheckOutputChannel?: vscode.OutputChannel; // govulncheck output.

        languageServerIsRunning?: boolean;
	// serverInfo is the information from the server received during initialization.
	serverInfo?: ServerInfo;
        // lastUserAction is the time of the last user-triggered change.
	// A user-triggered change is a didOpen, didChange, didSave, or didClose event.
	lastUserAction?: Date;
        crashCount?: number;
        buildDiagnosticCollection?: vscode.DiagnosticCollection;
	lintDiagnosticCollection?: vscode.DiagnosticCollection;
	vetDiagnosticCollection?: vscode.DiagnosticCollection;
}
