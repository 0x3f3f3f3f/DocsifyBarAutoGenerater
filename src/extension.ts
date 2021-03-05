// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "docsifybarautogenerater" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('docsifybarautogenerater.GenSidebar', (url) => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('正在自动生成侧边目录文件……');
		let sidebar = url.fsPath;
		console.log(sidebar);

		//备份 防止手动编辑的目录直接丢失
		let backup = sidebar+'.backup';
		let backupfile = backup;
		let bpnumber = 0;
		while (fs.existsSync(backupfile)) {
			backupfile = backup + bpnumber;
			bpnumber++;
		}

		fs.copyFileSync(sidebar,backupfile);

		let sidebarContent = CreateNewSideBar(vscode.workspace.workspaceFolders);
		fs.writeFileSync(url.fsPath,sidebarContent);
		vscode.window.showInformationMessage('生成侧边目录文件完成!');
	});

	context.subscriptions.push(disposable);
}

/**
 * 根据目录生成侧边栏
 */
function CreateNewSideBar(path:any):string{
	let root = (<vscode.Uri>(path[0].uri)).fsPath;
	console.log(root);

	let ret = "";
	//开头空一些行数
	for (let index = 0; index < 4; index++) {
		ret += `\n`;
	}

	ret += GenDir(root,root,0);
	return ret;
}

/**
 * 按目录递归生成
 * @param currentDir 
 * @param root 
 * @param level 
 */
function GenDir(currentDir:string,root:string, level:number):string {
	let ret = "";
	var filse = fs.readdirSync(currentDir);
	filse.forEach(element => {
		let filedir = path.join(currentDir,element);
		let stats = fs.statSync(filedir);
		if (stats.isFile()) {
			//只处理md文件
			if (element != "_sidebar.md" && !element.match(".backup") && element.match(".md")) {
				let fileName = splitFileName(element);
				//计算相对根目录路径
				let link = path.relative(root,filedir);
				//转译空格
				link = link.replace(/\s/g,"%20");
				//反斜杠全部替换成正斜杠
				link = link.replace(/\\/g,"/"); 
				ret += GenLink(fileName,link,level);
			}
		} else {
			if (!element.startsWith(".") 
				&& !stats.isSymbolicLink()
				&& !element.match(".assets")) 
			{
				ret += GenLink(element,"",level);
				ret += GenDir(filedir,root,level + 1);
			}
		}
	});

	//文件夹结束后加空行
	ret += "\n";

	return ret;
}

/**
 * 生成链接行
 * @param name 
 * @param link 
 * @param level 
 */
function GenLink(name:string,link:string,level:number):string {
	let ret = "";
	for (let index = 0; index < level; index++) {
		ret += "  ";
	}
	return ret +=`- [${name}](${link})  \n`;;
}

/**
 * 去后缀
 * @param text 
 */
function splitFileName(text:string) {
    let pattern = /\.{1}[a-z]{1,}$/;
    if (pattern.exec(text) !== null) {
        return (text.slice(0, (pattern.exec(text) as any).index));
    } else {
        return text;
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
