const {globalShortcut, BrowserWindow} = require('electron');
function Shortcuts(){
	this.toggle = (toggle) => {
		if (toggle){
			var showdevtools = function(){
				var win = BrowserWindow.getFocusedWindow();
				if (!win.isDevToolsOpened()){
					win.openDevTools()
				} else {
					win.closeDevTools();
				}
			}
			globalShortcut.register('CommandOrControl+Shift+I', showdevtools);
			globalShortcut.register('F12', showdevtools);
			globalShortcut.register('CommandOrControl+W', () => {
				BrowserWindow.getFocusedWindow().close()
			});
		} else {
			globalShortcut.unregisterAll();
		}
	}
}
module.exports = new Shortcuts();
