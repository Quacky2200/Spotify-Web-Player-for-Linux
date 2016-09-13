global.remote = require('electron').remote;
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
	recursivelySetupSettings(props.appSettings, ['Theme']);

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

	$('input[name*=\'NavBar\'], select').change(() => {
		props.mainWindow.webContents.executeJavaScript('interface.load();interface.clean()');
		interface.load();
		interface.clean();
	});

	$('select').change(function(){
		props.appSettings.Theme = $(this).val();
		props.appSettings.save();
	});
	$('select').val(props.appSettings.Theme);
};

