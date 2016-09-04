/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
function buildArtistsString(artists){
	if(!artists || artists.length == 0) return 'Unknown';
	var str = artists[0]['name'];
	//Add any additional artists
	for(var i = 1; i < artists.length; i++) str += ", " + artists[i]['name'];
	return str;
}
//Global shortcuts assigned
//Must use a function on key value so that controller will be defined later on
//Must be placed up here so that controller can toggle the global shortcuts.
shortcuts = {
    'MediaNextTrack': () => {controller.next()},
    'MediaPlayPause': () => {controller.playPause()},
    'MediaPreviousTrack': () => {controller.previous()},
}
const controller = {
	information: {
		filepath: props.appSettings.AlbumArtCache,
		playlists: [],
		repeat: 'None',
		shuffle: false,
		status: 'Stopped',
		activeSong: {id: '', uri: '', name: '', album: '', artists: '', art: '', length: 0},
		update: () => {
			controller.information.filepath = props.appSettings.AlbumArtCache;
            var isPlaying = controller.isPlaying() == 'Playing';
            var uri = controller.getTrackUri();
    	   	var activeSong = controller.information.activeSong;
			var notify = controller.information._isNotificationWorthy();
			controller.information.status = controller.isPlaying();
			controller.information.shuffle = controller.isShuffled();
			controller.information.repeat = controller.isRepeat();
			controller.toggleGlobalShortcuts(isPlaying);
            if(!uri && isPlaying){
			    activeSong.name = controller.getTrackName();
	            activeSong.id = 0;
	            activeSong.album = '';
	            activeSong.artists = controller.getArtist();
			    activeSong.art = controller.getAlbumArt();
                activeSong.length = 3e+7; //30 Seconds (approximate advertisement length?)
			    controller.information._updateMpris();
			    if(notify && dbus) dbus.interpreter.send(dbus.instance.stdin, "notify", controller.information)
			} else {
		        controller.getTrackInfo((data) => {
			    	activeSong.uri = uri;
		    		activeSong.id = data['id'];
		    		activeSong.name = data['name'];
		    		activeSong.album = data['album']['name'];
		    		activeSong.artists = buildArtistsString(data['artists']);
					activeSong.art = data['album']['images'][0]['url'],
					activeSong.length = data['duration_ms'] * 1000; //Length in Microseconds
					controller.information._updateMpris();
					if(notify && dbus) dbus.interpreter.send(dbus.instance.stdin, "notify", controller.information);
				});
			}
		},
		_isNotificationWorthy: () => {
			return true;
			var changeInPlayback = controller.information.status !== controller.isPlaying();
			var changeInTrack = controller.information.activeSong.uri !== controller.getTrackUri();
			console.log('changeInTrack: ' + changeInTrack + '\nchangeInPlayback: ' + changeInPlayback);
			return (changeInTrack && props.appSettings.ShowTrackChange) ||
				(changeInPlayback && props.appSettings.Notifications['ShowPlayback' + controller.isPlaying()] == true);
		},
		_updateMpris: () => {
			if(dbus) dbus.interpreter.send(dbus.instance.stdin, 'updateMpris', controller.information);
		},
		
	},
	getTrackUri: () => {
            var trackElement = $('#track-name a[href*="play.spotify.com/track/"]', $('iframe#app-player').contents()).attr('href');
	    if (!trackElement) return null;
	    var uri = trackElement.split('/');
	    return uri[uri.length - 1];
	},
	getAlbumArt: () => {
            var artElement = $('.sp-image-img', $('#app-player').contents()).css('background-image');
            return (artElement ? artElement.match(/url\((?:\'|\")?(.*)(?:\'|\")?\)/)[1] : null);
        },
        getArtist: () => {
            return $('#track-artist', $('#app-player').contents()).text();
        },
        getTrackName: () => {
            return $('#track-name', $('#app-player').contents()).text();
        },
        getAlbum: () => {
	    return $('#cover-art a', $('#app-player').contents()).attr('data-tooltip').replace(/( by (.*))/, '');
        },
        getTrackInfo: (callback) => {
            var uri = controller.getTrackUri();
            if (!uri) return;
	    $.getJSON("https://api.spotify.com/v1/tracks/" + uri, callback);
        },
	play: () => {
		if(controller.isPlaying() !== 'Playing') controller.playPause();
	},
	playPause: () => {
		$('button#play-pause', $('iframe#app-player').contents()).click();
		controller.information.status = controller.isPlaying();
	},
	pause: () => {
		if(controller.isPlaying() == 'Playing') controller.playPause();
	},
	stop: () => {
		//We will have to pause because we cannot stop in Spotify.
		controller.pause()
		//Update status information to stopped (make sure we actually stopped though)
		controller.information.status = controller.information.isPlaying();
	},
	previous: () => {
		$('button#previous', $('iframe#app-player').contents()).click();
	},
	next: () => {
		$('button#next', $('iframe#app-player').contents()).click();
	},
	/*
         * Returns whether controller is playing, paused or stopped
         * @returns {String}
         */
	isPlaying: () => {
                var isPlaying = $('title').text().indexOf('▶') > -1;
		var isStopped = $('#controls .playback button#play-pause', $('#app-player').contents()).is('.disabled');
	 	return (isPlaying ? 'Playing' : (isStopped ? 'Stopped' : 'Paused'))
	},
	isShuffled: () => {
		return $('#controls .extra button#shuffle', $('#app-player').contents()).is('.active');
	},
	toggleShuffle: (toggle) => {
		var toggleButton = $('#controls .extra button#shuffle', $('#app-player').contents());
		$(toggleButton).attr('class', (toggle ? 'active' : ''));
		controller.information.shuffle = toggle;
	},
	isRepeat: () => {
		var isRepeatActive = $('#controls .extra button#repeat', $('#app-player').contents()).is('.active');
                var isRepeatTrackActive = false; //Spotify Web Player don't allow repeating tracks? :(
            return (isRepeatActive ? (isRepeatTrackActive ? 'Track' : 'Playlist') : 'None');
	},
	toggleRepeat: (enumStr) => {
		var toggleButton = $('#controls .extra button#repeat', $('#app-player').contents());
		switch(enumStr){
			case 'None' && controller.isRepeat():
				//Turn off repeat
				$(toggleButton.removeClass('active'));
				break;
			//Track repeat is not an option on Spotify Web Player :(
			case 'Track' && !controller.isRepeat():
			case 'Playlist' && !controller.isRepeat():
				//Turn on repeat
				$(toggleButton).addClass('active');
				break;
			default: 
				throw new Error('Unknown repeat enum in controller.toggleRepeat() !');
		};
            controller.information.repeat = controller.isRepeat();
	},
	getPlaylists: () => {
		//Gets the playlists with the play button element attached (Playlist name : Playlist play button)
		if ($('#section-collection > div.root').length == 0) return; //Hasn't been loaded yet
		var playlists = {};
		$('.list-group a', $('#section-collection iframe').contents()).each(function(){
		    var button = $(this).find('.btn.btn-large.btn-play');
		    var playlistTitle = $(this).find('.item-data span:first-child').text();
		    playlists[playlistTitle] = button;
		});
		return playlists;
	},
	setupDBusHandlers: () => {
	    if(props.process.platform == 'linux' && dbus){
	    	if(!dbus.instance) dbus.reload();
			dbus.interpreter.handle(dbus.instance.stdout, {
			    Quit: () => {tray.contextMenu.quit.click},
			    Raise: () => {props.mainWindow.show();props.mainWindow.focus();},
			    Play: controller.play,
			    PlayPause: controller.playPause,
			    Previous: controller.previous,
			    Next: controller.next,
			    Stop: controller.stop,
			    openUri: (uri) => {console.log('openUri (MPRIS specification) not implemented.');}
			});
	    } else if (props.process.platform == 'linux'){
	    	console.err('dbus is undefined');
	    }
    },
    /**
	 * Allow people to toggle playback and swap music by the media keys
	 * Will not work with dbus and already-assigned shortcuts. 
	 */
	toggleGlobalShortcuts: (activate) => {
	    for (var shortcut in shortcuts){
	        if (shortcuts.hasOwnProperty(shortcut)){
	            if (activate && !props.globalShortcut.isRegistered(shortcut)){
	                props.globalShortcut.register(shortcut, shortcuts[shortcut]);
	            } else if (!activate && props.globalShortcut.isRegistered(shortcut)){
	                props.globalShortcut.unregister(shortcut);
	            }
	        }
	    }
	}
};
controller.setupDBusHandlers();
module.exports = controller;
