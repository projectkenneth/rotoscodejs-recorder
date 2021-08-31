import * as vscode from 'vscode';
import * as path from 'path';
import { readFile } from 'fs/promises';

import { RecorderState } from './classes/recorderState.class';
import { RecordingLog } from './classes/recordingLog.class';

export async function createRecorderWebView(context: vscode.ExtensionContext) {
	const panel = vscode.window.createWebviewPanel(
		'rotoscodejs-recordingpanel',
		'RotoscodeJS: Recording Panel',
		{
			viewColumn: vscode.ViewColumn.Beside,
			preserveFocus: true
		},
		{
			enableScripts: true,
			localResourceRoots: [vscode.Uri.file(context.extensionPath)]
		}
	);

	const webviewFilesUri = panel.webview.asWebviewUri(vscode.Uri.file(
		path.join(context.extensionPath, 'webview')
	));

	let html = await readFile(path.resolve(context.extensionPath, 'webview/index.html'), 'utf-8');

	html = html.replace(/{PATH}/gi, webviewFilesUri.toString());

	panel.webview.html = html;

	return panel;
};

export function stopRecordingWrapper(webview: vscode.Webview, recorderState: RecorderState, changeHandler: vscode.Disposable | null, isSave: boolean = false): boolean {
	if (recorderState.isRecording) {
		changeHandler?.dispose();

		recorderState.stopRecording();

		if (isSave) {
			webview.postMessage({ type: 'stopRecording', recordingData: recorderState.recordingLog.export() });
		}

		return true;
	}

	return false;
}