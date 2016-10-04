global.remote = require('electron').remote;
let fs = require('fs');
let props = remote.getGlobal('props');
var AutoLaunch = require('auto-launch');
let autolaunch = new AutoLaunch({
	name: 'Spotify Web Player for Linux',
	//A 10 second sleep allows the desktop to load, otherwise no dice... :(
	path: '/bin/bash -c "sleep 10 && . ' + props.process.cwd() + '/spotifywebplayer"'
});
global.props = props;
global.windowHook = true;

global.refresh = () => {
	windowHook = false;
	window.location.reload();
}
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
document.onreadystatechange = function(){
	window.$ = window.jQuery = require('../../preloaded/jquery');
	var interface = require('../../preloaded/interface');
	interface.load();
	window.onbeforeunload = (e) => {
		if (windowHook){
			props.preferencesWindow.hide();
			return false;	
		}
	};

	function recursivelySetupSettings(settings, skip, prefix){
		for(var setting in settings){
			if(skip.indexOf(setting) != -1) continue;
			if(typeof(settings[setting]) == 'object'){
				recursivelySetupSettings(settings[setting], skip, (prefix ? prefix + '.' : '') + setting + '.');
			} else {
				var selector = 'input[name=\'' + (prefix ? prefix : '') + setting + '\']';
				$(selector).prop('checked', settings[setting]);
				$(selector).attr('onchange', 
					'props.appSettings.' + (prefix ? prefix : '') + setting + ' = $(this).prop(\'checked\');props.appSettings.save();');
			}
		}
	}
	recursivelySetupSettings(props.appSettings, ['Theme', 'AlbumCacheDisabled']);

	$('input[name=\'StartOnLogin\']').change(function(){
		if (props.process.platform == 'linux'){
			if($(this).prop('checked')){
				autolaunch.enable();
			} else {
				autolaunch.disable();
			}
		} else {
			app.setLoginItemSettings({openAtLogin: $(this).prop('checked')});
		}
	});

	$('input[name*="ShowTray"]').change(function(){
		props.appSettings.ShowTray = $(this).prop('checked');
		props.appSettings.save();
		props.mainWindow.webContents.executeJavaScript('tray.toggleTray(' + props.appSettings.ShowTray + ')');
	});
	$('input[name*="ShowApplicationMenu"]').change(function(){
		props.appSettings.ShowApplicationMenu = $(this).prop('checked');
		props.appSettings.save();
		props.mainWindow.webContents.executeJavaScript('appMenu.toggleMenu(' + props.appSettings.ShowApplicationMenu + ')');
	});
	$('input[name*="AlbumCacheDisabled"]').change(function(){
		props.appSettings.AlbumCacheDisabled = !$(this).prop('checked');
		props.appSettings.save();
		props.mainWindow.webContents.executeJavaScript('controller.albumCacheDisabled = ' + props.appSettings.AlbumCacheDisabled + ';');
	});

	$('input[name*=\'NavBar\'], select').change(() => {
		var i = 0;
		var setTheme = setInterval(() => {
			if(i > 5) clearInterval(setTheme);
			i += 1;
			props.mainWindow.webContents.executeJavaScript('interface.load();interface.clean()');
			interface.load();
			interface.clean();
		}, 1500);
	});

	$('select[name=\'Theme\']').change(function(){
		props.appSettings.Theme = $(this).val();
		props.appSettings.save();
	});
	$('select[name=\'TrayIcon\']').change(function(){
		props.appSettings.TrayIcon = $(this).val();
		props.mainWindow.webContents.executeJavaScript('tray.toggleTray(false);tray.toggleTray(true);');
		props.appSettings.save();
	});
	if(!props.appSettings.AlbumCacheDisabled) $('input[name*="AlbumCacheDisabled"]').attr('checked', 'true');
	$('select[name=\'Theme\']').val(props.appSettings.Theme);
	$('select[name=\'TrayIcon\']').val(props.appSettings.TrayIcon);

	$('a.clean-album-cache').click(() => {
		deleteFolderRecursive(props.albumCache);
	});

	$('a.clean-lyric-cache').click(() => {
		deleteFolderRecursive(props.lyricCache);
	});
};

