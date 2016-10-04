/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Player Injection tool
 * Allows for Spotify Web Player for Linux to implement native-like features
 */
window.user = require('./user');
window.appSettings = props.appSettings;
window.controller = null;
window.tray = require('./tray');
window.interface = require('./interface');
window.sing = require('./Sing!/sing');
window.appMenu = require('./window-menu');
/**
 * Update controls according to login/control status
 */
function checkControlStatus(){
	var loggedIn = user.isLoggedIn();
	windowHook = loggedIn;
	tray.toggleTray(loggedIn && props.appSettings.ShowTray);
	appMenu.toggleMenu(loggedIn && props.appSettings.ShowApplicationMenu);
}
/**
 * When the window closes, hide only if logged in
 */
window.onbeforeunload = function(e) {
	if(windowHook && ((props.appSettings.CloseToTray && props.appSettings.ShowTray) || props.appSettings.CloseToController)){
		props.mainWindow.hide();
		return false;
	} else if (windowHook && props.appSettings.CloseToTray && !props.appSettings.ShowTray){
		props.mainWindow.minimize();
		return false;
	}
	controller.stopService();
	appMenu.toggleMenu(false);
	tray.toggleTray(false);
};
setInterval(() => {
	if($('#modal-notification-area').is(':visible')) {
		windowHook = false;
		window.location.reload();
	}
}, 10000);
interface.load();
/**
 * Check for message events from Spotify
 */
window.addEventListener('message', function(event){
	if (event.data.indexOf('USER_ACTIVE') > 0 || event.data.indexOf("spb-connected") > 0){
		checkControlStatus();
		if (props.appSettings.lastURL !== window.location.href){
			props.appSettings.lastURL = window.location.href;
			props.appSettings.save();
		}
	} else if (event.data.indexOf("user:impression") > 0){
		if(event.data.indexOf('player_loaded') > -1) {
			var Controller = require('./controller');
			controller = new Controller(document.getElementById('app-player'));
			var isFocusWorthy = () => {
				return (props.appSettings.Notifications.OnlyWhenFocused ? !props.mainWindow.isFocused() : true);
			};
			controller.albumCache = props.albumCache;
			controller.albumCacheDisabled = props.appSettings.AlbumCacheDisabled;
			controller.on('Quit', () => {
				tray.contextMenu.quit.click();
			});
			controller.on('Raise', () => {
				props.mainWindow.show(); 
				props.mainWindow.focus();
			});
			controller.on('trackChange', (controller) => {
				sing.toggleButton(true);
				sing.load(controller.track.uri, controller.track.name, controller.track.artists);
				if(isFocusWorthy() && props.appSettings.Notifications.ShowTrackChange) controller.sendNotification();
			});
			controller.on('playbackChange', (controller) => {
				var notificationSwitchTable = {
					Playing: props.appSettings.Notifications.ShowPlaybackPlaying,
					Paused: props.appSettings.Notifications.ShowPlaybackPaused,
					Stopped: props.appSettings.Notifications.ShowPlaybackStopped
				};
				if(isFocusWorthy() && notificationSwitchTable[controller.status]) controller.sendNotification();
				sing.toggleButton(controller.status != 'Stopped');
				sing.load(controller.track.uri, controller.track.name, controller.track.artists);
				tray.toggleMediaButtons(controller.status != 'Stopped');
			});
		}
		interface.updateAdvertisements();
	}
});
//Check for updates
$.getJSON("https://api.github.com/repos/Quacky2200/Spotify-Web-Player-for-Linux/releases", (data) => {
	var updateAvailable = (() => {
		var version_update_tag = data[0].tag_name.match(/([0-9\.]+)/)[1].split('.');
		var version_now_tag = props.electron.app.getVersion().match(/([0-9\.]+)/)[1].split('.');
		for(var num in version_update_tag){
			if(parseInt(version_update_tag[num]) > parseInt(version_now_tag[num])) {
				return true;
			} else if (parseInt(version_update_tag[num]) < parseInt(version_now_tag[num])){
				return false
			}
		}
	})();
	if(updateAvailable){
		props.fs.readFile(__dirname + '/update.png', {encoding: 'base64'}, (err, imgdata)=>{
			if (err) console.err(err);
			button = `
				<li>
					<a id="nav-update" style='padding: 5px' class="standard-menu-item" data-href="` + data[0].html_url + `">
						<img src='data:image/png;base64,` + imgdata + `' style='padding: 5px;height: 70%;margin: auto;display: block;opacity: 0.4;'/>
						<span class="nav-text">Update</span>
					</a>
				</li>
				<style>
				#nav-update.active img{
					opacity: 0.9;
				}
				</style>
			`;
			$('#main-nav #nav-items').append(button);
			$('#nav-update').click(function(){
				props.electron.shell.openExternal($(this).attr('data-href'));
			});
		});
	}
});
