/*
	Spotify Player Controller
*/
const ipcRenderer = require('electron').ipcRenderer;
var windowRefreshLock = false;
var ipcRendererOperations = {
	playpause: function(){$('button#play-pause', $('iframe#app-player').contents()).click();},
	next: function(){$('button#next', $('iframe#app-player').contents()).click();},
	previous: function(){$('button#previous', $('iframe#app-player').contents()).click();},
	updateNotifications: function(e, obj){notifications = obj;},
	updateRefreshLock: function(e, obj){windowRefreshLock = obj;}
};
function checkAlive(){
	ipcRenderer.send('message', {operation: 'updateLoginStatus', args: !$('#login').is(":visible")});
}
ipcRenderer.on('message', function(event, obj){
	if(obj.operation in ipcRendererOperations){
		console.log("Received message operation (%s)", obj.operation);
		ipcRendererOperations[obj.operation](event, obj.args);
	} else {
		console.log("Message operation has no handler. (%s)" + obj.operation);
	}
});
window.onbeforeunload = function(e) {
  if(windowRefreshLock){
  	console.log("I am now minimized. :)");
  	 ipcRenderer.send('message', {operation: 'keepAliveMinimize', args:null});
  	return false;
  }
};
$(document).on('click', 'a#logout-settings[href="/logout"]', function(e){
	setTimeout(function(){
		//Send a message to clear the cache on next load.
		ipcRenderer.send('message', {operation:'onLogoutClearCache', args: null});
	}, 10);
	//e.preventDefault();
});
var trackData;
var _playbackStatus;
function trackFormatToNotification(){
	return {
		icon: trackData['mpris:artUrl'],
		body: trackData['xesam:title'] + "\n" + trackData['xesam:album'] + "\n" + trackData['xesam:artist']
	};
}
var notifications = true;
function updateStatus(playbackStatus){
	_playbackStatus = playbackStatus;
	ipcRenderer.send("message", {operation: "updatePlayerStatus", args:playbackStatus});
	console.log("Sending notification");
	if(notifications) new Notification({Stopped: "Playback has stopped", Playing: "Now Playing", Paused: "Playback is paused"}[playbackStatus], trackFormatToNotification());
}

window.addEventListener('message', function(event){
	if (event.data.indexOf("application_set_title") > 0) {
    	//We've loaded a new song
    	//Remove track events and add them again (this could be the first time setting the track event)
    	if(JSON.parse(event.data)['args'][0].indexOf("Spotify Web Player") >= 0) return;
    	if(JSON.parse(event.data)['args'][0] == "") updateStatus("Stopped");
    	if(JSON.parse(event.data)['args'][0].indexOf("http") > 0) return; //Playing advert?
    	//Get our metadata from Spotify as we need a new image and the album name.
    	var trackURI = $('#track-name a', $('iframe#app-player').contents()).attr('href').replace("play.spotify.com/track", "api.spotify.com/v1/tracks");
    	$.getJSON(trackURI, function(data){
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
			ipcRenderer.send("message", {operation: "updatePlayerMetadata", args: trackData});
			//After we've updated the track data, let's see if we're playing now
			if (JSON.parse(event.data)['args'][0].indexOf("▶") >= 0) updateStatus("Playing");
			//Check we're logged in!
			//checkAlive();
		});
    } else if (event.data.indexOf("player_pause") > 0) {
    	//We pressed pause - update the information
    	updateStatus("Paused");
    } else if (event.data.indexOf("player_play") > 0) {
    	//We've pressed play - update the information
    	updateStatus("Playing");
	} else if (event.data.indexOf('USER_ACTIVE') > 0 || event.data.indexOf("spb-connected") > 0){
		checkAlive();
	}
});
