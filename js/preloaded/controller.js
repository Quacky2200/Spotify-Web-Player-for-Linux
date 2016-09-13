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
		albumCache: props.albumCache,
		playlists: [],
		repeat: 'None',
		shuffle: false,
		status: 'Stopped',
		activeSong: {id: '', uri: '', name: '', album: '', artists: '', art: '', length: 0},
		update: (notify) => {
	  		var isPlaying = controller.isPlaying() == 'Playing';
			var uri = controller.getTrackUri();
			var activeSong = controller.information.activeSong;
			controller.information.status = controller.isPlaying();
			controller.information.shuffle = controller.isShuffled();
			controller.information.repeat = controller.isRepeat();
			controller.toggleGlobalShortcuts(isPlaying);
			
			if(uri && uri != activeSong.uri){
				controller.getTrackInfo(uri, (data) => {
					activeSong.uri = uri;
					activeSong.id = data['track_number'];
					activeSong.name = data['name'];
					activeSong.album = data['album']['name'];
					activeSong.artists = buildArtistsString(data['artists']);
					activeSong.art = data['album']['images'][1]['url'],
					activeSong.length = data['duration_ms'] * 1000; //Length in Microseconds
					controller.information._updateMpris();
					activeSong.artists = controller.getArtist();
					
					sing.load(uri, activeSong.name, activeSong.artists);
					if (notify) controller.information.sendNotification();
					controller.information._updateMpris();
				});
			} else if(uri && uri == activeSong.uri) {
				if (notify) controller.information.sendNotification();
				controller.information._updateMpris();
				sing.load(uri, controller.getTrackName(), controller.getArtist());
				// activeSong.name = controller.getTrackName();
				// //Adverts don't have albums!
				// activeSong.album = (!uri ? '' : controller.getAlbum()); 
				// activeSong.artists = controller.getArtist();
				// activeSong.id = 0;
				// activeSong.uri = uri;
				// activeSong.length = 3e7;//30 seconds for average advert?
				// activeSong.art = controller.getAlbumArt();
				// if (notify) controller.information.sendNotification();
				// controller.information._updateMpris();
			}
		},
		sendNotification: () => {
			if(dbus) {
				dbus.interpreter.send(dbus.instances.MPRISAndNotifications.stdin, "notify", controller.information);
			} else {
				//Suport OS X & Windows with other notification systems
				new Notification(
					(controller.isPlaying() == 'Playing' ? 'Now Playing' : controller.isPlaying()), 
					{
						icon: controller.information.activeSong.art,
						body: controller.information.activeSong.name + "\n" + 
							controller.information.activeSong.album + "\n" + 
							controller.information.activeSong.artists
					}
				);
			}
		},
		_updateMpris: () => {
			if(dbus) dbus.interpreter.send(dbus.instances.MPRISAndNotifications.stdin, 'updateMpris', controller.information);
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
	getTrackInfo: (uri, callback) => {
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
		dbus.interpreter.clearHandles();
		if(props.process.platform == 'linux' && dbus){
			if(!dbus.instances.MPRISAndNotifications) dbus.reload();
			dbus.interpreter.handle(dbus.instances.MPRISAndNotifications.stdout, {
				Quit: () => {tray.contextMenu.quit.click},
				Raise: () => {props.mainWindow.show();props.mainWindow.focus();},
				Play: controller.play,
				PlayPause: controller.playPause,
				Previous: controller.previous,
				Next: controller.next,
				Stop: controller.stop,
				openUri: (uri) => {console.log('openUri (MPRIS specification) not implemented.');}
			});
			dbus.interpreter.handle(dbus.instances.MediaKeys.stdout, {
				PlayPause: controller.playPause,
				Next: controller.next,
				Previous: controller.previous
			});
		} else if (props.process.platform == 'linux'){
			console.err('dbus is undefined')
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
$('button#next, button#previous, button#play-pause', $('iframe#app-player').contents()).click(() => {
	var times = 0; 
	var timer = setInterval(() => {
		if (times > 5) return clearInterval(timer);
		controller.update(false);
	}, 1000);
})

controller.setupDBusHandlers();
module.exports = controller;
