/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * System Tray
 */
const Tray = props.electron.Tray;
const Menu = props.electron.Menu;
const tray = {
	appIcon: null,
	contextMenu: {
		togglePlayback: {label: "Play/Pause", enabled: false, click: controller.playPause},
		previous: {label: "Previous", enabled: false, click: controller.previous},
		next: {label: "Next", enabled: false, click: controller.next},
		toggleSpotifyAppearance: {label: "Hide Spotify", click: function(){
			if (props.mainWindow.isVisible()){
				props.mainWindow.hide();
			} else {
				props.mainWindow.show();
				props.mainWindow.focus();
			}
			tray.contextMenu.toggleSpotifyAppearance.label = (props.mainWindow.isVisible() ? 'Show' : 'Hide') + ' Spotify';
			tray.toggleTray(true);
		}},
		appPreferences: {label: "App Preferences", click: function(){
			props.preferencesWindow.show();
			props.preferencesWindow.focus();
		}},
		toggleNotifications: {label: "Disable Notifications", click:function(){
	    	props.preferences.notifications = (props.preferences.notifications ? false : true);
	    	tray.contextMenu.toggleNotifications.label = (props.preferences.notifications ? "Disable" : "Enable") + " Notifications";
	    	tray.toggleTray(true);
	    }},
	    logout: {label: "Logout", click: function(){
	    	user.logout();
	    }},
	    quit: {label: "Quit", click:function(){
	    	tray.toggleTray(false);
			windowHook = false;
			props.electron.app.quit();
	    }}
	},
	toggleTray: function(toggle){
		if (toggle && appSettings.ShowTray){
			if (!tray.appIcon) tray.appIcon = new Tray(props.APP_ICON_SMALL);
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
		} else {
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
	tray.contextMenu.toggleSpotifyAppearance.label = (props.mainWindow.isVisible() ? 'Hide' : 'Show') + ' Spotify';
	tray.toggleTray(true);
});
module.exports = tray;
