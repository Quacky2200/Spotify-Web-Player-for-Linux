/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Preload script for preferences screen
 */
global.MAIN = require('electron').ipcRenderer;

document.onreadystatechange = function(){
	if (document.readyState !== 'complete') return;
	window.$ = window.jQuery = require('../spotify/jquery');
	MAIN.send('message-for-Preferences', `:eval('require(\'./behaviour\')()')`);
	$('input[name=\'StartOnLogin\']').change(function(){
		MAIN.send('message-for-Preferences', `:eval('
			if (process.platform == 'linux'){
				if(${$(this).prop('checked')}) {
					autolaunch.enable();
				} else {
					autolaunch.disable();
				}
			} else {
				app.setLoginItemSettings({openAtLogin: ${$(this).prop('checked')}})
			}
		')`);
	});

	$('input[name*="ShowTray"]').change(function() {
		MAIN.send('message-for-Spotify', `:eval('
			app.settings.ShowTray = ${$(this).prop('checked')};
			app.settings.save();
			tray.toggle(app.settings.ShowTray);
		')`)
	});
	$('input[name*="ShowApplicationMenu"]').change(function() {
		MAIN.send('message-for-Spotify', `:eval('
			app.settings.ShowApplicationMenu = ${$(this).prop('checked')};
			app.settings.save();
			appMenu.toggle(app.settings.ShowApplicationMenu);
		')`)
	});
	$('input[name*="AlbumCacheDisabled"]').change(function() {
		MAIN.send('message-for-Spotify', `:eval('
			app.settings.AlbumCacheDisabled = ${!$(this).prop('checked')};
			app.settings.save();
			controller.albumCacheDisabled = app.settings.AlbumCacheDisabled;
		')`)
	});

	$('select[name=\'Theme\']').change(function(){
		MAIN.send('message', `:eval('
			theme.name = '${$(this).val()}';
			theme.refresh();
		')`);
	});

	$('select[name=\'TrayIcon\']').change(function(){
		console.log($(this).val());
		MAIN.send('message-for-Spotify', `:eval('
			app.settings.TrayIcon = '${$(this).val()}';
			app.settings.save();
			tray.toggle(false);
			tray.toggle(true);
		')`);
	});

	$('a.clean-album-cache').click(() => MAIN.send('message-for-Preferences', `:eval('
		deleteFolderRecursive(app.paths.caches.albums);
	')`));

	$('a.clean-lyric-cache').click(() => MAIN.send('message-for-Preferences', `:eval('
		deleteFolderRecursive(app.paths.caches.lyrics);
	')`));
};
