/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * System Tray
 */
const {Menu,Tray} = require('electron');
const TrayMenu = function() {
	this.appIcon = null;
	this.items = {
		togglePlayback: {label: "Play/Pause", enabled: false, click: () => controller.playPause()},
		previous: {label: "Previous", enabled: false, click: () => controller.previous()},
		next: {label: "Next", enabled: false, click: () => controller.next()},
		toggleVisibility: {label: "Hide Spotify", click: () => {
			var prefix;
			if (app.spotify.isVisible() && !app.spotify.isMinimized()){
				prefix = 'Show';
				app.spotify.hide();
			} else {
				prefix = 'Hide';
				app.spotify.show();
				app.spotify.focus();
			}
			this.items.toggleVisibility.label = prefix + ' Spotify';
			this.toggle(app.settings.ShowTray);
		}},
		appPreferences: {label: "App Preferences", click: () => app.spotify.showPreferences()},
		logout: {label: "Logout", click: () => user.logout()},
		quit: {label: "Quit", click: () => {
			this.toggle(false);
			appMenu.toggle(false);
			user.loggedIn = false;
			app.quit();
		}}
	};
	this.toggle = (toggle) => {
		if (toggle && app.settings.ShowTray){
			this.items.toggleVisibility.label = (app.spotify.isMinimized() || !app.spotify.isVisible() ? 'Show' : 'Hide') + ' Spotify';
			if (!this.appIcon) this.appIcon = new Tray(`${app.paths.icons}/spotify-ico-small-${app.settings.TrayIcon}.png`);
			this.appIcon.setContextMenu(Menu.buildFromTemplate([
				this.items.togglePlayback,
				this.items.previous,
				this.items.next,
				{type:'separator'},
				this.items.toggleVisibility,
				this.items.appPreferences,
				this.items.logout,
				this.items.quit
			]));
			this.appIcon.on('click', () => {
				app.spotify.show();
				app.spotify.focus();
			});
		} else if (!toggle && this.appIcon != null){
			this.appIcon.destroy();
			this.appIcon = null;
		}
	};
	this.toggleMediaButtons = function(toggle){
		//Show the media buttons on show value
		this.items.togglePlayback.enabled = toggle;
		this.items.previous.enabled = toggle;
		this.items.next.enabled = toggle;
		//Make the changes apparent by reloading the menu
		this.toggle(true);
	};
};
module.exports = new TrayMenu();
