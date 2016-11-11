/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * System Tray
 */
const {Menu,Tray} = require('electron').remote;
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
			if (props.spotify.isVisible() && !props.spotify.isMinimized()){
				prefix = 'Show';
				props.spotify.hide();
			} else {
				prefix = 'Hide';
				props.spotify.show();
				props.spotify.focus();
			}
			tray.contextMenu.toggleSpotifyAppearance.label = prefix + ' Spotify';
			tray.toggleTray(props.settings.ShowTray);
		}},
		appPreferences: {label: "App Preferences", click: function(){
			props.spotify.showPreferences();
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
		if (toggle && props.settings.ShowTray){
			if (!tray.appIcon) tray.appIcon = new Tray(`${props.paths.icons}/spotify-ico-small-${props.settings.TrayIcon}.png`);
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
				props.spotify.show();
				props.spotify.focus();
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
	tray.contextMenu.toggleSpotifyAppearance.label = (props.spotify.isMinimized() || !props.spotify.isVisible() ? 'Show' : 'Hide') + ' Spotify';
	tray.toggleTray(props.settings.ShowTray);
});
module.exports = tray;
