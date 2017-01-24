const {globalShortcut, BrowserWindow} = require('electron');
const bind = (s,e) => globalShortcut.register(s,e);
const unbind = globalShortcut.unregister;
const getFocusedWindow = BrowserWindow.getFocusedWindow;
const media = {
	MediaNextTrack: () => controller.next(),
	MediaPlayPause: () => controller.playPause(),
	MediaPreviousTrack: () => controller.previous(),
};
for (var key in media) if (media.hasOwnProperty(key)) bind(key, media[key]);
module.exports = {
	toggle: function(toggle){
		if (toggle) {
			bind('CommandOrControl+S', () => app.spotify.do('$(\'#suggest-area\').toggleClass(\'show\');'));
			bind('CommandOrControl+Shift+P', () => app.spotify.showPreferences());
			bind('F1', () => app.spotify.showAbout());
			bind('Shift+<', () => controller.previous())
			bind('Shift+>', () => controller.next())
			bind('F11', () => app.spotify.setFullScreen(!app.spotify.isFullScreen()));
			bind('CommandOrControl+Shift+L', () => tray.contextMenu.logout.click());
			bind('CommandOrControl+W', () => app.spotify.close());
			var showdevtools = function(){
				if (app.spotify.isDevToolsOpened()){
					app.spotify.closeDevTools();
				} else {
					app.spotify.closeDevTools()
				}
			}
			bind('CommandOrControl+Shift+I', showdevtools);
			bind('F12', showdevtools);
		} else {
			globalShortcut.unregisterAll();
		}
	}
};
