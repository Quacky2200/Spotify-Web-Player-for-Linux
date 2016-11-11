global.remote = require('electron').remote;
let fs = require('fs');
let props = remote.getGlobal('props');
var AutoLaunch = require('auto-launch');
let autolaunch = new AutoLaunch({
	name: props.names.project,
	//A 10 second sleep allows the desktop to load, otherwise no dice... :(
	path: '/bin/bash -c "sleep 10 && . ' + props.process.cwd() + '/spotifywebplayer"'
});
global.props = props;

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
	window.$ = window.jQuery = require('../spotify/jquery');
	var interface = require('../spotify/interface');
	interface.load();

	function recursivelySetupSettings(settings, skip, prefix){
		for(var setting in settings){
			if(skip.indexOf(setting) != -1) continue;
			if(typeof(settings[setting]) == 'object'){
				recursivelySetupSettings(settings[setting], skip, (prefix ? prefix + '.' : '') + setting + '.');
			} else {
				var selector = 'input[name=\'' + (prefix ? prefix : '') + setting + '\']';
				$(selector).prop('checked', settings[setting]);
				$(selector).attr('onchange', 
					'props.settings.' + (prefix ? prefix : '') + setting + ' = $(this).prop(\'checked\');props.settings.save();');
			}
		}
	}
	recursivelySetupSettings(props.settings, ['Theme', 'AlbumCacheDisabled']);

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
		props.settings.ShowTray = $(this).prop('checked');
		props.settings.save();
		props.spotify.webContents.executeJavaScript('tray.toggleTray(' + props.settings.ShowTray + ')');
	});
	$('input[name*="ShowApplicationMenu"]').change(function(){
		props.settings.ShowApplicationMenu = $(this).prop('checked');
		props.settings.save();
		props.spotify.webContents.executeJavaScript('appMenu.toggleMenu(' + props.settings.ShowApplicationMenu + ')');
	});
	$('input[name*="AlbumCacheDisabled"]').change(function(){
		props.settings.AlbumCacheDisabled = !$(this).prop('checked');
		props.settings.save();
		props.spotify.webContents.executeJavaScript('controller.albumCacheDisabled = ' + props.settings.AlbumCacheDisabled + ';');
	});

	$('input[name*=\'NavBar\'], select').change(() => {
		var i = 0;
		var setTheme = setInterval(() => {
			if(i > 5) clearInterval(setTheme);
			i += 1;
			props.spotify.webContents.executeJavaScript('interface.load();interface.clean()');
			interface.load();
			interface.clean();
		}, 1500);
	});

	$('select[name=\'Theme\']').change(function(){
		props.settings.Theme = $(this).val();
		props.settings.save();
	});
	$('select[name=\'TrayIcon\']').change(function(){
		props.settings.TrayIcon = $(this).val();
		props.spotify.webContents.executeJavaScript('tray.toggleTray(false);tray.toggleTray(true);');
		props.settings.save();
	});
	if(!props.settings.AlbumCacheDisabled) $('input[name*="AlbumCacheDisabled"]').attr('checked', 'true');
	$('select[name=\'Theme\']').val(props.settings.Theme);
	$('select[name=\'TrayIcon\']').val(props.settings.TrayIcon);

	$('a.clean-album-cache').click(() => {
		deleteFolderRecursive(props.albumCache);
	});

	$('a.clean-lyric-cache').click(() => {
		deleteFolderRecursive(props.lyricCache);
	});
};

