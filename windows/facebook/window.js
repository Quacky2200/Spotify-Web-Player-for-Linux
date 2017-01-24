const {BrowserWindow} = require('electron');
class FacebookPopup extends BrowserWindow{
	constructor(name, url, session){
		super({
			title: name,
			minWidth: 550,
			minHeight: 280,
			width: 550,
			height: 280,
			show: true,
			icon: App.icon,
			session: session,
			webPreferences: {
			  preload: `${__dirname}/facebook/preload.js`,
			  nodeIntegration: false,
			  plugins: true
			}
		});
		this.loadURL(url);
		this.setMenu(null);
		if(app.settings.ShowDevTools) this.openDevTools();
	}
}
module.exports = FacebookPopup;
