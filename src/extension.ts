import * as vscode from 'vscode';

import { RecorderState } from './classes/recorderState.class';

import { createRecorderWebView, stopRecordingWrapper } from './utils';

let recorder: RecorderState = new RecorderState();

function _initRecording() : vscode.Disposable | null {
	let mainTextEditor = vscode.window.activeTextEditor;

	if (mainTextEditor) {
		recorder.startRecording(mainTextEditor?.document.getText());

		return vscode.workspace.onDidChangeTextDocument(evt => {
			if (evt.document.uri === mainTextEditor?.document.uri) {
				recorder.recordingLog.addLogItem(
					new Date(),
					mainTextEditor?.document.getText()
				);
			}
		});
	} else {
		vscode.window.showErrorMessage('No editor to record!');

		return null;
	}
}

async function _runCommand(context: vscode.ExtensionContext) {
	let recorderWebView = await createRecorderWebView(context);
	let changeHandler: vscode.Disposable | null = null;

	recorderWebView.webview.onDidReceiveMessage(({ type }) => {
		if (type === 'startRecording') {
			changeHandler = _initRecording();
		} else if (type === 'stopRecording') {
			stopRecordingWrapper(recorderWebView.webview, recorder, changeHandler, true);
		} else if (type === 'outputCopied') {
			vscode.window.showInformationMessage('Output code copied to clipboard!');
		}
	});

	recorderWebView.onDidDispose(() => {
		if (stopRecordingWrapper(recorderWebView.webview, recorder, changeHandler)) {
			vscode.window.showWarningMessage('Recording was stopped without saving!');
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('rotoscodejs-recorder.startRecording', () => _runCommand(context));

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
