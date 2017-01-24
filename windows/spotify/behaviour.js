//LOAD
const {ipcMain, globalShortcut, BrowserWindow} = require('electron');
module.exports = function(){
	global.controller = require('./controller');
	global.theme = require('./theme');
	global.tray = require('./tray');
	global.appMenu = require('./appmenu');
	global.sing = require('./Sing!/sing');
	global.shortcuts = require('./shortcuts');
	global.user = require('./user');

	controller.albumCache = app.paths.caches.albums;
	controller.albumCacheDisabled = app.settings.AlbumCacheDisabled;
	controller.on('Quit', () => tray.items.quit.click());
	controller.on('Raise', () => { app.spotify.show(); app.spotify.focus(); });

	controller.on('trackChange', (controller) => {
		var usable = !(controller.isStopped || controller.isAdvertisement);
		var needFocus = app.settings.Notifications.OnlyWhenFocused && app.spotify.isFocused();
		sing.toggleButton(usable);
		theme.refresh();
		tray.toggleMediaButtons(usable);
		sing.load(controller.track.id, controller.track.name, controller.track.artists);
		if(app.settings.Notifications.ShowTrackChange && !needFocus) controller.notify();
	});

	controller.on('playbackChange', (controller) => {
		var usable = !(controller.isStopped || controller.isAdvertisement);
		var needFocus = app.settings.Notifications.OnlyWhenFocused && app.spotify.isFocused();
		if(app.settings.Notifications[`ShowPlayback${controller.status}`] && !needFocus) controller.notify();
		sing.toggleButton(usable);
		tray.toggleMediaButtons(usable);
		theme.refresh();
		sing.load(controller.track.id, controller.track.name, controller.track.artists);
	});
	ipcMain.on('message-for-Spotify', (e, a) => {
		if (typeof(a) !== 'string') return;
		if (a.match(/(:eval)/)) return eval(a.slice(7, a.length - 2));
		if (a.match(/(user:impression)/)) theme.refresh()
		if (a.match(/(user:impression).*(player_loaded)/)) {
			app.spotify.do(`
				var player = document.getElementById('app-player');
				player.contentWindow.addEventListener('message', (e) => {
					MAIN.send('track-metadata', e.data);
				});
			`);
			sing.init();
		}
		if (a.match(/(USER_ACTIVE|spb-connected)/)) {
			user.login();
			tray.toggle(app.settings.ShowTray);
			appMenu.toggle(app.settings.ShowApplicationMenu);
			app.settings.lastURL = app.spotify.webContents.getURL();
			app.settings.save();
		}
	});
	ipcMain.on('message', (e, a) => {
		console.log('SPOTIFY EVAL:', a);
		if (typeof(a) !== 'string') return;
		try {
			if (a.match(/(:eval)/)) return eval(a.slice(7, a.length - 2));
		} catch (e) {
			if (e instanceof SyntaxError){
				console.log(e.message);
			} else {
				throw e;
			}
		}
	})
	app.spotify.on('close', (event) => {
		var alreadyHidden = app.spotify.isVisible() && !app.spotify.isMinimized();
		if(user.loggedIn && ((app.settings.CloseToTray && app.settings.ShowTray) || app.settings.CloseToController)){
			app.spotify.hide();
			event.preventDefault();
		} else if (user.loggedIn && app.settings.CloseToTray && !app.settings.ShowTray){
			app.spotify.minimize();
			event.preventDefault();
		}
		controller.dispose();
		appMenu.toggle(false);
		tray.toggle(false);
	});
	app.spotify.on('focus', () => shortcuts.toggle(true));
	app.spotify.on('blur', () => shortcuts.toggle(false));
	shortcuts.toggle(app.spotify.isFocused());
}
