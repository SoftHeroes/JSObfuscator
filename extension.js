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
		JSObfuscator.clear();

		JSObfuscator.appendLine('Obfuscating process started');

		let fileOnWhichWeWorking;

		try {
			if (typeof vscode.workspace.workspaceFolders === 'undefined' || vscode.workspace.workspaceFolders.length == 0) {
				return vscode.window.showInformationMessage("Open a folder or workspace... (File -> Open Folder)");
			}

			let ignoreMinFiles = vscode.workspace.getConfiguration().get('JSObfuscator.ignoreMinFiles');
			let subPathInWorkspace = "/" + vscode.workspace.getConfiguration().get('JSObfuscator.subPathInWorkspace');
			let ignoreFile = vscode.workspace.getConfiguration().get('JSObfuscator.ignoreFile');

			let ignoreFileArray = ignoreFile.split(",");
			const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath + subPathInWorkspace;

			let filePath = _getAllFilesFromFolder(workspacePath);

			for (let i = 0; i < filePath.length; i++) {
				fileOnWhichWeWorking = filePath[i];

				let currentFileName = filePath[i].split("/");
				currentFileName = currentFileName[currentFileName.length -1 ];

				if (ignoreMinFiles && filePath[i].search(".min.js") != -1 ) {
					continue;
				}

				if(ignoreFileArray.indexOf(currentFileName) != -1 ){
					continue;
				}
				


				let nameSplitted = filePath[i].split(".");

				if (nameSplitted[nameSplitted.length - 1] == 'js') {
					let text = fs.readFileSync(filePath[i]).toString('utf-8');

					fs.writeFile(filePath[i], _JSCodeToObfuscator(text), function (err) {
						if (err) {
							JSObfuscator.appendLine('File on which get error : ' + fileOnWhichWeWorking);
							JSObfuscator.appendLine(err.message);
							return vscode.window.showErrorMessage('Invalid Exception.');
							
						}
					});
				}
			}

			return vscode.window.showInformationMessage('All Script Obfuscated.');
		} catch (error) {
			JSObfuscator.appendLine('File on which get error : ' + fileOnWhichWeWorking);
			JSObfuscator.appendLine(error.stack);
			JSObfuscator.appendLine(error);
			return vscode.window.showErrorMessage('Invalid Exception.');
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
