const {BrowserWindow, ipcMain} = require('electron');
const shortcuts = require('./shortcuts');
const fs = require('fs');
class Preferences extends BrowserWindow{
	constructor(){
		var PREF_WIDTH = 800;
		var PREF_HEIGHT = 450;
		super({
			title: 'Preferences',
			icon: app.icon,
			width: PREF_WIDTH,
			height: PREF_HEIGHT,
			minWidth: PREF_WIDTH,
			minHeight: PREF_HEIGHT,
			maxWidth: PREF_WIDTH,
			maxHeight: PREF_HEIGHT,
			resizable: false,
			show: false,
			webPreferences: {preload: `${__dirname}/preload.js`}
		});
		this.loadURL(`file://${__dirname}/preferences.html`);
		this.setMenu(null);
		this.webContents.once('dom-ready', () => {
			const AutoLaunch = require('auto-launch');
			let autolaunch = new AutoLaunch({
				name: app.names.project,
				//A 10 second sleep allows the desktop to load, otherwise no dice... :(
				path: '/bin/bash -c "sleep 10 && . ' + process.cwd() + '/spotifywebplayer"'
			});
			var deleteFolderRecursive = function(path) {
				if( fs.existsSync(path) ) {
					fs.readdirSync(path).forEach(function(file,index){
						var curPath = path + "/" + file;
						if(fs.lstatSync(curPath).isDirectory()) { // recurse
							deleteFolderRecursive(curPath);
						} else { // delete file
							fs.unlinkSync(curPath);
						}
					});
					fs.rmdirSync(path);
				}
			};
			ipcMain.on('message-for-Preferences', (e, a) => {
				console.log('PREFERENCES EVAL:', a);
				if (typeof(a) !== 'string') return;
				if (a.match(/(:eval)/)) return eval(a.slice(7, a.length - 2));
			});
			this.show();
		});
		this.on('focus', () => shortcuts.toggle(true));
		this.on('blur', () => shortcuts.toggle(false));
	}
	do(str){
		this.webContents.executeJavaScript(str);
	}
	doFunc(variables, func) {
		var vars = "";
		for (var curvar in variables){
			if (variables.hasOwnProperty(curvar)) {
				if (typeof(variables[curvar]) == 'function') {
					vars += `var ${curvar} = ${variables[curvar].toString()};\n`;
				} else if (typeof(variables[curvar]) == 'object'){
					vars += `var ${curvar} = ${JSON.stringify(variables[curvar])};\n`;
				} else if (typeof(variables[curvar]) == 'string'){
					vars += `var ${curvar} = \`${variables[curvar]}\`;\n`;
				} else {
					vars += `var ${curvar} = ${variables[curvar]};\n`; //Numbers, bools?
				}
			}
		}
		vars += `\n(${func.toString()})();\n`;
		this.do(vars)
	}
}
module.exports = Preferences;
