/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * System Tray
 */
const Tray = props.electron.Tray;
const Menu = props.electron.Menu;
const tray = {
	appIcon: null,
	contextMenu: {
		togglePlayback: {label: "Play/Pause", enabled: false, click: () => {
			controller.playPause()
		}},
		previous: {label: "Previous", enabled: false, click: () => {
			controller.previous()
		}},
		next: {label: "Next", enabled: false, click: () => {
			controller.next()
		}},
		toggleSpotifyAppearance: {label: "Hide Spotify", click: function(){
			var prefix;
			if (props.mainWindow.isVisible() && !props.mainWindow.isMinimized()){
				prefix = 'Show';
				props.mainWindow.hide();
			} else {
				prefix = 'Hide';
				props.mainWindow.show();
				props.mainWindow.focus();
			}
			tray.contextMenu.toggleSpotifyAppearance.label = prefix + ' Spotify';
			tray.toggleTray(props.appSettings.ShowTray);
		}},
		appPreferences: {label: "App Preferences", click: function(){
			props.preferencesWindow.show();
			props.preferencesWindow.focus();
		}},
	    logout: {label: "Logout", click: function(){
	    	user.logout();
	    }},
	    quit: {label: "Quit", click:function(){
	    	tray.toggleTray(false);
	    	appMenu.toggleMenu(false);
			controller.stopService();
			windowHook = false;
			props.electron.app.quit();
	    }}
	},
	toggleTray: function(toggle){
		if (toggle && props.appSettings.ShowTray){
			if (!tray.appIcon) tray.appIcon = new Tray(props.APP_ICON_DIR + '/spotify-ico-small-' + props.appSettings.TrayIcon + '.png');
			tray.appIcon.setContextMenu(Menu.buildFromTemplate([
			    tray.contextMenu.togglePlayback,
			    tray.contextMenu.previous,
			    tray.contextMenu.next,
			    {type:'separator'},
			    tray.contextMenu.toggleSpotifyAppearance,
			    tray.contextMenu.appPreferences,
			    tray.contextMenu.logout,
			    tray.contextMenu.quit 
			]));
			tray.appIcon.on('click', () => {
				props.mainWindow.show();
				props.mainWindow.focus();
			});
		} else if (!toggle && tray.appIcon != null){
			tray.appIcon.destroy();
	    	tray.appIcon = null;
		}
	},
	toggleMediaButtons: function(toggle){
		//Show the media buttons on show value
		tray.contextMenu.togglePlayback.enabled = toggle;
		tray.contextMenu.previous.enabled = toggle;
		tray.contextMenu.next.enabled = toggle;
		//Make the changes apparent by reloading the menu
		tray.toggleTray(true);
	}
};
document.addEventListener("visibilitychange", function(){
	tray.contextMenu.toggleSpotifyAppearance.label = (props.mainWindow.isMinimized() || !props.mainWindow.isVisible() ? 'Show' : 'Hide') + ' Spotify';
	tray.toggleTray(props.appSettings.ShowTray);
});
module.exports = tray;
