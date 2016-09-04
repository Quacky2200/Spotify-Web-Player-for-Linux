/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Player Injection tool
 * Allows for Spotify Web Player for Linux to implement native-like features
 */
global.user = require('./user');
global.appSettings = props.appSettings;
global.controller = require('./controller');
global.tray = require('./tray');
global.interface = require('./interface');
/**
 * Update controls according to login/control status
 */
function checkControlStatus(){
	var loggedIn = user.isLoggedIn();
	windowHook = loggedIn;
	tray.toggleTray(loggedIn);
}
/**
 * When the window closes, hide only if logged in
 */
window.onbeforeunload = function(e) {
  if(windowHook && props.appSettings.CloseToTray && props.appSettings.ShowTray){
  	props.mainWindow.hide();
  	return false;
  } else if (windowHook && props.appSettings.CloseToTray && !props.appSettings.ShowTray){
    props.mainWindow.minimize();
    return false;
  }
};
/**
 * Allow people to reload the page when necessary
 */
// global.reload = function(){
//     windowHook = false;
//     dbus.quit();
//     props.electron.app.setApplicationMenu(null);
//     controller.toggleGlobalShortcuts(false);
//     tray.toggleMediaButtons(false);
//     tray.toggleTray(false);
//     window.location = window.location;
// }
var windowMenu = require('./window-menu');
props.electron.app.setApplicationMenu(windowMenu);
interface.load();
/**
 * Check for message events from Spotify
 */
window.addEventListener('message', function(event){
    //Check if we want to change the title (normally due to song change)
    if (event.data.indexOf("application_set_title") > 0) {
        //If there's no song, don't do anything
    	if(JSON.parse(event.data)['args'][0].indexOf("Spotify Web Player") >= 0) return;
    	//If there's nothing, we have stopped playback
    	if(JSON.parse(event.data)['args'][0] == "") controller.information.update();
    	//If the title starts with http, it may be an advertisement from Spotify.
    	if(JSON.parse(event.data)['args'][0].indexOf("http") > 0) controller.information.update(); //Playing advert?
    	//Get our metadata from Spotify as we need a new image and the album name.
    	tray.toggleMediaButtons(true);
	   controller.information.update();
    } else if (event.data.indexOf("player_play") > 0){
        controller.information.update();
    } else if (event.data.indexOf("player_pause") > 0){
    	//We pressed pause - update the information
    	controller.information.update();
    } else if (event.data.indexOf('USER_ACTIVE') > 0 || event.data.indexOf("spb-connected") > 0){
        checkControlStatus();
        //interface.load();
    } else if (event.data.indexOf("user:impression") > 0){
        interface.updateAdvertisements();
    }
});
