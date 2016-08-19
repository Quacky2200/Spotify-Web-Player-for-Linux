/*
	Spotify Player Controller
*/
const remote = require('electron').remote;
const props = remote.getGlobal('props');
const Tray = props.electron.Tray;
const Menu = props.electron.Menu;
var mainWindow = props.mainWindow;
var mprisPlayer;
var lastMprisMetaData;
var appIcon;
var preventWindowRedirection = false;
var showNotifications = true;
var isMainWindowHidden = false;
/**
 * List items for the Tray
 */
var contextMenu = {
	togglePlayback: {label: "Play/Pause", enabled: false, click: function(){
		$('button#play-pause', $('iframe#app-player').contents()).click();
	}},
	previous: {label: "Previous", enabled: false, click: function(){
		$('button#previous', $('iframe#app-player').contents()).click();
	}},
	next: {label: "Next", enabled: false, click: function(){
		$('button#next', $('iframe#app-player').contents()).click();
	}},
	toggleSpotifyAppearance: {label: "Hide Spotify", click: function(){
		if (mainWindow.isVisible()){
			mainWindow.hide();
		} else {
			mainWindow.show();
		}
		contextMenu.toggleSpotifyAppearance.label = (mainWindow.isVisible() ? 'Show' : 'Hide') + ' Spotify';
		console.log('toggleSpotifyAppearance: ' + contextMenu.toggleSpotifyAppearance.label);
		toggleLoggedInMenu(true);
	}},
	toggleNotifications: {label: "Disable Notifications", click:function(){
    	showNotifications = (showNotifications ? false : true);
    	contextMenu.toggleNotifications.label = (showNotifications ? "Disable" : "Enable") + " Notifications";
    	toggleLoggedInMenu(true);
    }},
    reload: {label: 'Refresh', click: function(){
    	toggleLoggedInMenu(false);
    	preventWindowRedirection = false;
    	mainWindow.loadURL(props.HOST);
    }},
    toggleDevTools: {label: 'Show DevTools', click: function(){
    	mainWindow.openDevTools();
    }},
    logout: {label: "Logout", click: logoutUser},
    quit: {label: "Quit", click:function(){
    	mainWindow.destroy()
    }}
};
document.addEventListener("visibilitychange", function(){
	contextMenu.toggleSpotifyAppearance.label = (mainWindow.isVisible() ? 'Hide' : 'Show') + ' Spotify';
	console.log('visibilitychange: ' + contextMenu.toggleSpotifyAppearance.label);
	toggleLoggedInMenu(true);
});
/**
 * Setup a new instance mpris player
 */
function setupMprisPlayer(){
	if(props.mpris){
		mprisPlayer = props.mpris.Player({
		    name: 'spotifywebplayer',
		    identity: 'Spotify Web Player for Linux',
		    supportedUriSchemes: ['file'],
		    supportedMimeTypes: ['audio/mpeg', 'application/ogg'],
		    supportedInterfaces: ['player']
		});
		//TODO: Setup Player events
		mprisPlayer.on('playpause', contextMenu.togglePlayback.click);
		mprisPlayer.on('play', contextMenu.togglePlayback.click);
		mprisPlayer.on('pause', contextMenu.togglePlayback.click);
		mprisPlayer.on('previous', contextMenu.previous.click);
		mprisPlayer.on('next', contextMenu.next.click);
		mprisPlayer.on('quit', contextMenu.quit.click);
	}
}
/**
 * Update the mpris player instance
 */
function updateMprisPlayer(data){
	if(mprisPlayer && data){
		mprisPlayer.metadata = data;
	}
	lastMprisMetaData = data
}
/**
 * Whether to show or hide the contextMenu
 */
function toggleLoggedInMenu(show){
	if (show){
		if (!appIcon) appIcon = new Tray(props.APP_ICON);
		appIcon.setContextMenu(Menu.buildFromTemplate([
		    contextMenu.togglePlayback,
		    contextMenu.previous,
		    contextMenu.next,
		    {type:'separator'},
		    contextMenu.toggleSpotifyAppearance,
		    contextMenu.toggleNotifications,
		    contextMenu.reload,
		    contextMenu.toggleDevTools,
		    contextMenu.logout,
		    contextMenu.quit 
		]));
	} else {
		appIcon.destroy();
    	appIcon = null;
	}
}
/**
 * Whether to show or hide the contextMenu media buttons
 * @param {Boolean} show
 */
function toggleMediaButtons(show){
	//Show the media buttons on show value
	contextMenu.togglePlayback.enabled = show;
	contextMenu.previous.enabled = show;
	contextMenu.next.enabled = show;
	//Make the changes apparent by reloading the menu
	toggleLoggedInMenu(true);
}
/* 
 * Returns if a user is logged into Spotify
 * @returns {Boolean}
 */
function isLoggedIn(){
	return !$('#login').is(":visible");
}
/**
 * Logout the Spotify user by removing all cache
 */
function logoutUser(){
	preventWindowRedirection = false;
	toggleMediaButtons(false);
	toggleLoggedInMenu(false);
	if (!mainWindow.isVisible()) mainWindow.show();
	props.clearCache();
}
/**
 * Make sure we're logged in, if not, update our contextMenu accordingly
 */
function checkLoginStatus(){
	var loggedIn = isLoggedIn();
	//Only show/hide the media buttons if we have a reason 
	//to hide them (AKA they were used to play music before)
	preventWindowRedirection = loggedIn;
	if (lastMprisMetaData) toggleMediaButtons(loggedIn);
	toggleLoggedInMenu(loggedIn);
}
/**
 * When the window closes, hide only if logged in
 */
window.onbeforeunload = function(e) {
  if(preventWindowRedirection){
  	mainWindow.hide();
  	return false;
  }
};
$(document).on('click', 'a#logout-settings[href="/logout"]', function(e){
	logoutUser();
	//e.preventDefault();
});
function formatMprisToNotification(){
	return {
		icon: lastMprisMetaData['mpris:artUrl'],
		body: lastMprisMetaData['xesam:title'] + "\n" + lastMprisMetaData['xesam:album'] + "\n" + lastMprisMetaData['xesam:artist']
	};
}
var lastNotification = {title: '', details: null};
/**
 * Update the status by enabling contextMenu buttons 
 * and trying to show a notification
 */
function updateStatus(playbackStatus){
	toggleMediaButtons(true);
	var newNotification = {
		title: {
			Stopped: "Playback Stopped", 
			Playing: "Now Playing",
			Paused: "Playback Paused"
		}[playbackStatus], 
		details: formatMprisToNotification()
	};
	var isDuplicate = JSON.stringify(lastNotification) === JSON.stringify(newNotification);
	if (showNotifications && !isDuplicate){
		lastNotification = newNotification;
		new Notification(lastNotification.title, lastNotification.details);
	} 
}
/**
 * Check for message events from Spotify
 */
window.addEventListener('message', function(event){
	//Check if we want to change the title (normally due to song change)
	if (event.data.indexOf("application_set_title") > 0) {
		//If there's no song, don't do anything
    	if(JSON.parse(event.data)['args'][0].indexOf("Spotify Web Player") >= 0) return;
    	//If there's nothing, we have stopped playback
    	if(JSON.parse(event.data)['args'][0] == "") updateStatus("Stopped");
    	//If the title starts with http, it may be an advertisement from Spotify.
    	if(JSON.parse(event.data)['args'][0].indexOf("http") > 0) return; //Playing advert?
    	//Get our metadata from Spotify as we need a new image and the album name.
    	setTimeout(function(){
    		var trackURI = $('#track-name a', $('iframe#app-player').contents()).attr('href').replace("play.spotify.com/track", "api.spotify.com/v1/tracks");
	    	$.getJSON(trackURI, function(data){
	    		//Setup mpris information
				trackData = {
					'mpris:trackid': data['id'],
					'mpris:length': data['duration_ms'] * 1000,
					'mpris:artUrl': data['album']['images'][0]['url'],
					'xesam:title': data['name'],
					'xesam:album': data['album']['name'],
					'xesam:artist': data['artists'][0]['name']
				};
				//Add any additional artists
				for(var i = 1; i < data['artists'].length; i++) trackData['xesam:artist'] += ", " + data['artists'][i]['name'];
				updateMprisPlayer(trackData);
				//After we've updated the track data, let's see if we're playing now
				if (JSON.parse(event.data)['args'][0].indexOf("▶") >= 0) updateStatus("Playing");
			});
	    }, 2500);
    } else if (event.data.indexOf("player_pause") > 0) {
    	//We pressed pause - update the information
    	updateStatus("Paused");
    } else if (event.data.indexOf("player_play") > 0) {
    	//We've pressed play - update the information
    	updateStatus("Playing");
	} else if (event.data.indexOf('USER_ACTIVE') > 0 || event.data.indexOf("spb-connected") > 0){
		checkLoginStatus();
	}
});
setupMprisPlayer();
