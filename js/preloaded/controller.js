/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
const EventEmitter = require('events');

class Controller extends EventEmitter {
	constructor (player) {
		super();

		var dbus = (process.platform == 'linux' ? require('./../backend/dbus_implementation') : null);

		if(dbus){
			//Attach DBus interaction 
			dbus.MediaKeys.on('PlayPause', this.playPause);
			dbus.MediaKeys.on('Next', this.next);
			dbus.MediaKeys.on('Previous', this.previous);

			dbus.MPRISAndNotifications.on('Quit', () => {
				this.emit('Quit');
			});
			dbus.MPRISAndNotifications.on('Raise', () => {
				this.emit('Raise');
			});
			dbus.MPRISAndNotifications.on('Play', this.play);
			dbus.MPRISAndNotifications.on('PlayPause', this.playPause);
			dbus.MPRISAndNotifications.on('Previous', this.previous);
			dbus.MPRISAndNotifications.on('Next', this.next);
			dbus.MPRISAndNotifications.on('Stop', this.stop);
			dbus.MPRISAndNotifications.on('openUri', (uri) => {console.log('openUri not implemented (uri = \'' + uri + '\')')});
		}

		var updateMpris = () => {
			if(dbus) dbus.MPRISAndNotifications.send('updateMpris', this)
		};

		this.sendNotification = () => {
			if(dbus) {
				dbus.MPRISAndNotifications.send("notify", this);
				//Suport OS X & Windows with other notification systems
			} else {
				new Notification(
					(this.status == 'Playing' ? 'Now Playing' : this.status), 
					{
						icon: this.track.art,
						body: this.track.name + "\n" + this.track.album + "\n" + this.track.artists
					}
				);
			}
		};
		this.stopService = () => {
			dbus.killall();
		};
		var update = (details) => {
			//If we have a current track loaded and the track is different, or if we have never stored a track before, it's a trackChange
			var trackChange = (!this.track && details.track) || (details.track && this.track.uri != details.track.uri.replace('spotify:track:', ''));
			//If we are not playing and there's no track, we have reached the end of the queue, otherwise we have either paused or we're playing
			var currentPlayback = (details.playing ? 'Playing' : (details.track == null ? 'Stopped' : 'Paused'));
			var playbackChange = this.status != currentPlayback;
			this.status = currentPlayback;
			this.shuffled = details.shuffle;
			this.repeat = (details.repeat == 0 ? 'None' : (details.repeat == 1 ? 'Playlist' : 'Track'));
			if(details.track){
				if(!this.track) this.track = {};
				//If we have a track, update the information for it
				this.track.id = details.track.number;
				this.track.disc = details.track.disc;
				this.track.uri = details.track.uri.replace('spotify:track:', '');
				this.track.name = details.track.name;
				this.track.album = details.track.album.name;
				this.track.artists = details.track.artistName;
				this.track.popularity = details.track.popularity / 100;
				this.track.length = details.duration * 1000; //Must be in Microseconds (from milliseconds)
				this.track.position = details.position * 1000;
				this.track.art = details.track.images[0][1]; //Retrieve the smallest image as our album art
			}
			updateMpris();
			if(trackChange || playbackChange) this.emit((trackChange ? 'track' : 'playback') + 'Change', this);
		};

		player.contentWindow.addEventListener('message', (e) => {
			if(e.data.indexOf('payload') > 0){
				var obj = JSON.parse(e.data);
				if (obj.payload.event){
					update(obj.payload.data);
				} else if (obj.payload.track){
					update(obj.payload);
				}
			}
		});

		this.repeat = 'None';
		this.shuffle = false;
		this.status = 'Stopped';
		this.track = null;

		this.albumCache = '';
		this.albumCacheDisabled = false;
		//How many seconds till the notification expires
		this.notificationTimeUntilExpire = 10;
	}
	play(){
		if(this.status !== 'Playing') this.playPause();
	}
	playPause() {
		$('button#play-pause', $('iframe#app-player').contents()).click();
	}
	pause(){
		if(this.status == 'Playing') this.playPause();
	}
	stop(){
		//We will have to pause because we cannot stop in Spotify.
		this.pause();
	}
	previous(){
		$('button#previous', $('iframe#app-player').contents()).click();
	}
	next(){
		$('button#next', $('iframe#app-player').contents()).click();
	}
	getPlaylists(){
		//Gets the playlists with the play button element attached (Playlist name : Playlist play button)
		if ($('#section-collection > div.root').length == 0) return; //Hasn't been loaded yet
		var playlists = {};
		$('.list-group a', $('#section-collection iframe').contents()).each(function(){
			var button = $(this).find('.btn.btn-large.btn-play');
			var playlistTitle = $(this).find('.item-data span:first-child').text();
			playlists[playlistTitle] = button;
		});
		return playlists;
	}
}
module.exports = Controller;
