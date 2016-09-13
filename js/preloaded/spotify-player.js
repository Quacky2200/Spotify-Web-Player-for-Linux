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
global.sing = require('./Sing!/sing');
global.appMenu = require('./window-menu');
/**
 * Update controls according to login/control status
 */
function checkControlStatus(){
    var loggedIn = user.isLoggedIn();
    windowHook = loggedIn;
    tray.toggleTray(loggedIn);
    appMenu.toggleMenu(loggedIn && props.appSettings.ShowApplicationMenu);
}
/**
 * When the window closes, hide only if logged in
 */
window.onbeforeunload = function(e) {
    if (!user.isLoggedIn()){
        props.mainWindow.setApplicationMenu(null);
        return true;
    }
  if(windowHook && ((props.appSettings.CloseToTray && props.appSettings.ShowTray) || props.appSettings.CloseToController)){
    props.mainWindow.hide();
    return false;
  } else if (windowHook && props.appSettings.CloseToTray && !props.appSettings.ShowTray){
    props.mainWindow.minimize();
    return false;
  }
};
setInterval(() => {
    if($('#modal-notification-area').is(':visible')) {
        tray.toggleTray(false);
        if(dbus) dbus.clearHandles();
        appMenu.toggleMenu(false);
        windowHook = false;
        window.location.reload();
    }
}, 1000);
interface.load();
/**
 * Check for message events from Spotify
 */
window.addEventListener('message', function(event){
    var isFocusWorthy = (props.appSettings.Notifications.OnlyWhenFocused ? !props.mainWindow.isFocused() : true);
    //Update our information early when the buttons play_pause, next and previous are pressed
    if (event.data.indexOf('track_id') > -1) return controller.information.update(false);
    if (event.data.indexOf("application_set_title") > 0) {
        var args = JSON.parse(event.data)['args'][0];
        //If there's no song, don't do anything
        if(args.indexOf("Spotify Web Player") >= 0) return;
        //If there's nothing, we have stopped playback
        if(args == "") return controller.information.update(props.appSettings.Notifications.ShowPlaybackStopped && isFocusWorthy);
        //An advert from Spotify
        if(args.indexOf("http") > 0) {
            //An advert from Spotify, let's update manually...
            console.log('advert');
            controller.information.status = 'Playing';
            controller.information.activeSong.name = controller.getTrackName();
            controller.information.activeSong.album = '';
            controller.information.activeSong.artists = controller.getArtist();
            controller.information.activeSong.id = 0;
            controller.information.activeSong.uri = '';
            controller.informationactiveSong.length = 3e7;//30 seconds for average advert?
            controller.informationactiveSong.art = controller.getAlbumArt();
            return controller.information._updateMpris();
        }
        //Get our metadata from Spotify as we need a new image and the album name.
        tray.toggleMediaButtons(true);
        sing.enableButton();
        setTimeout(() => {
            //1 second gives us and spotify enough time to 'change' tracks successful so we can show the right information
            controller.information.update(props.appSettings.Notifications.ShowTrackChange && isFocusWorthy);
        }, 500);
    } else if (event.data.indexOf("player_play") > 0){
        controller.information.update(props.appSettings.Notifications.ShowPlaybackPlaying && isFocusWorthy);
    } else if (event.data.indexOf("player_pause") > 0){
        //We pressed pause - update the information
        controller.information.update(props.appSettings.Notifications.ShowPlaybackPaused && isFocusWorthy);
    } else if (event.data.indexOf('USER_ACTIVE') > 0 || event.data.indexOf("spb-connected") > 0){
        checkControlStatus();
        if (props.appSettings.lastURL !== window.location.href){
            props.appSettings.lastURL = window.location.href;
            props.appSettings.save();
        }
    } else if (event.data.indexOf("user:impression") > 0){
        interface.updateAdvertisements();
    }
});
