const {BrowserWindow, ipcMain} = require('electron');
const shortcuts = require('./shortcuts');
class About extends BrowserWindow{
	constructor(){
		var ABOUT_WIDTH = 600;
		var ABOUT_HEIGHT = 525;
		super({
			title: 'About',
			icon: App.icon,
			width: ABOUT_WIDTH,
			height: ABOUT_HEIGHT,
			minWidth: ABOUT_WIDTH,
			minHeight: ABOUT_HEIGHT,
			maxWidth: ABOUT_WIDTH,
			maxHeight: ABOUT_HEIGHT,
			resizable: false,
			show: false,
			webPreferences: {preload:`${__dirname}/preload.js`}
		});
		this.loadURL(`file://${__dirname}/about.html`);
		this.setMenu(null);
		this.webContents.once('dom-ready', () => {
			theme = require('../spotify/theme');
			this.do(`
				$('#app_title_and_version').html('${app.names.project}<br>v${app.version}');
			`);
			ipcMain.on('message-for-About', function(e, a) {
				console.log('ABOUT EVAL:', a);
				if (typeof(a) !== 'string') return;
				if (a.match(/(:eval)/)) return eval(a.slice(7, a.length - 2));
			})
			theme.refresh();
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
module.exports = About;
