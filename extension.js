// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let _getAllFilesFromFolder = function (dir) {

	let filesystem = require("fs");
	let results = [];

	filesystem.readdirSync(dir).forEach(function (file) {

		file = dir + '/' + file;
		let stat = filesystem.statSync(file);

		if (stat && stat.isDirectory()) {
			results = results.concat(_getAllFilesFromFolder(file))
		} else {
			results.push(file);
		}

	});

	return results;

};

let _JSCodeToObfuscator = function (text) {

	let obfuscationResult = JavaScriptObfuscator.obfuscate(
		text,
		{
			compact: false,
			controlFlowFlattening: true
		}
	);

	return obfuscationResult.getObfuscatedCode();
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations , your extension "JSObfuscator" is now active!');

	let disposable = vscode.commands.registerCommand('extension.JSObfuscatorEncodeJSCode', function () {

		let JSObfuscator = vscode.window.createOutputChannel("JSObfuscator");

		try {
			if (typeof vscode.workspace.workspaceFolders === 'undefined' || vscode.workspace.workspaceFolders.length == 0) {
				return vscode.window.showInformationMessage("Open a folder or workspace... (File -> Open Folder)");
			}

			const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath + "/";

			let filePath = _getAllFilesFromFolder(workspacePath);

			filePath.forEach(singleFilePath => {

				let nameSplitted = singleFilePath.split(".");

				if (nameSplitted[nameSplitted.length - 1] == 'js') {
					let text = fs.readFileSync(singleFilePath).toString('utf-8');

					JSObfuscator.clear();

					fs.writeFile(singleFilePath, _JSCodeToObfuscator(text), function (err) {
						if (err) {
							return JSObfuscator.appendLine(err.message);
						}
					});

				}
			});

		} catch (error) {
			return JSObfuscator.appendLine(error);
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
