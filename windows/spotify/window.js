/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Window
 */
const {BrowserWindow} = require('electron');
const FacebookPopup = require('../facebook/window');
const About = require('../about/window');
const Preferences = require('../preferences/window');
const appBehaviour = require('./behaviour');
let _preferencesInstance, _aboutInstance;
const shortcuts = require('./shortcuts');
class Spotify extends BrowserWindow{
	constructor(){
		super({
			title: "Spotify Web Player",
			icon: app.icon,
			width: 1200,
			height: 700,
			show: true,
			backgroundColor: "#121314",
			minWidth: 800,
			minHeight: 600,
			webPreferences: {
				nodeIntegration: false,
				preload: `${__dirname}/preload.js`,
				plugins: true,
				webSecurity: false,
				allowDisplayingInsecureContent: true,
				allowRunningInsecureContent: true
			}
		});
		this.hasRadio = true;
		this.openDevTools();
		this.on('page-title-updated', (event) => event.preventDefault());
		this.on('closed', () => { app.quit(); process.exit(0) });
		this.setMenu(null);
		this.webContents.on('new-window', function(event, url, name, disposition){
			if(!~url.indexOf("facebook.com")) return;
			(new FacebookPopup(name, url, this.webContents.session)).show();
			event.preventDefault();
		});
		this.webContents.once('dom-ready', () => {
			this.show();
			appBehaviour();
			if(app.settings.StartHidden) this.minimize();
		});
		var url = (app.settings.lastURL && !!~app.settings.lastURL.indexOf('play.spotify.com') ? app.settings.lastURL : app.host);
		this.loadURL(url);
		this.on('focus', () => shortcuts.toggle(true));
		this.on('blur', () => shortcuts.toggle(false));
	}
	do(str) { this.webContents.executeJavaScript(str); }
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
	send(channel, obj){ this.webContents.send(channel, obj); }
	clearCache(){
		this.loadURL("about:blank");
		this.webContents.session.clearCache(() => {
			this.webContents.session.clearStorageData(() => {
				console.log("Cleared session and cache.");
				this.loadURL(app.host);
			});
		});
	}
	showAbout(){
		if(_aboutInstance) return this.AboutInstance.show();
		_aboutInstance = new About();
		_aboutInstance.on('closed', function(){
			_aboutInstance = null;
		});
	}
	get AboutInstance(){
		return _aboutInstance
	}
	get PreferenceInstance(){
		return _preferencesInstance;
	}
	showPreferences(){
		if(_preferencesInstance) return this.PreferenceInstance.show();
		_preferencesInstance = new Preferences();
		if (!this.hasRadio) _preferencesInstance.webContents.on('dom-ready', () => {
			_preferencesInstance.do(`
				$('input[name="NavBar.Radio"]').parents('tr').hide()
			`);
		});
		_preferencesInstance.on('closed', function(){
			_preferencesInstance = null;
		})
	}
}
module.exports = Spotify;
