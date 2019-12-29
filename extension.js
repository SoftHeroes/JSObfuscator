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
		} else results.push(file);

	});

	return results;

};

let _JSCodeToObfuscator = function(text){

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

	let disposable = vscode.commands.registerCommand('extension.JSObfuscatorEncodeJSCode', function () {

		const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath+"/";
		
		let filePath = _getAllFilesFromFolder(workspacePath);

		filePath.forEach(singleFilePath => {

			let text = fs.readFileSync(singleFilePath).toString('utf-8');

			fs.writeFile(singleFilePath ,_JSCodeToObfuscator(text), function(err){
				if(err){
					return console.log(err);
				}
			});
		});

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
