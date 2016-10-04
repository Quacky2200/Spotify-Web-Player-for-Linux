/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
const EventEmitter = require('events');
const childProcess = require('child_process');
const spawn = childProcess.spawn;

class Controller extends EventEmitter {
	constructor (player) {
		super();

		var dbus = process.platform == 'linux';

		if (dbus){
			//Setup the service
			const LIBNODE = process.cwd() + '/libs/node/bin/node';
			const DBusInterpreter = require('./D-Bus/interpreter');
			const service = spawn(LIBNODE, [__dirname + '/D-Bus/services.js']);
			service.on('exit', () => {
			    console.log('D-Bus services have died');
			})
			service.stdout.on('data', (data) => {
				//console.log(data.toString());
			});
			service.stderr.on('data', (data) => {
				console.error(data.toString())
			});
			service.on('error', (e) => {
				console.error(e.toString())
			});
			//Setup a new interpreter
			dbus = {
				interpreter: new DBusInterpreter(service.stdout, service.stdin),
				stopService: () => {
					process.kill(service.pid)
				}
			}

			//Attach DBus interaction 
			dbus.interpreter.on('Play', this.play);
			dbus.interpreter.on('PlayPause', this.playPause);
			dbus.interpreter.on('Next', this.next);
			dbus.interpreter.on('Previous', this.previous);
			dbus.interpreter.on('Stop', this.stop);
			dbus.interpreter.on('openUri', (uri) => {console.log('openUri not implemented (uri = \'' + uri + '\')')});
			dbus.interpreter.on('Quit', () => { this.emit('Quit'); });
			dbus.interpreter.on('Raise', () => { this.emit('Raise'); });
			
		}

		var updateMpris = () => {
			if(dbus) dbus.interpreter.send('updateMpris', this)
		};

		this.sendNotification = () => {
			if(dbus) {
				dbus.interpreter.send("notify", this);
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
			dbus.stopService();
		};
		var update = (details) => {
			var trackChange, 
				playbackChange;
			//If we are listening to a track
			if(details.track){
				var currentPlayback = (details.playing ? 'Playing' : 'Paused');
				if(!this.track) this.track = {};
				this.isAdvertisement = false;

				trackChange = this.track.uri != details.track.uri.replace('spotify:track:', '');
				playbackChange = this.status != currentPlayback;

				this.status = currentPlayback;
				//If we have a track, update the information for it (position update and track change)
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
				this.track.url = 'https://play.spotify.com/track/' + this.track.uri;
				this.shuffled = details.shuffle;
				this.repeat = (details.repeat == 0 ? 'None' : (details.repeat == 1 ? 'Playlist' : 'Track'));

			} else if (details.type == 'AD_BREAK_CHANGED') {
				var currentPlayback = (details.params.playing ? 'Playing' : 'Paused');

				trackChange = !!this.track.uri;
				playbackChange = this.status != currentPlayback;
				this.status = currentPlayback;
				this.isAdvertisement = true;
				this.track.id = 0; 
				this.track.disc = 1;
				this.track.uri = null;
				this.track.name = details.params.title;
				this.track.album = details.params.description;
				this.track.popularity = 1;
				this.track.artists = 'Spotify';
				this.track.art = details.params.imageUrl;
				this.track.url = details.params.clickUrl;
				this.track.position = details.params.position * 1000;
				this.track.length = details.params.duration * 1000;
			} else {
				playbackChange = this.status != 'Stopped';
				this.status = 'Stopped';
			}

			updateMpris();
			if(trackChange || playbackChange) this.emit((trackChange ? 'track' : 'playback') + 'Change', this);
		};

		player.contentWindow.addEventListener('message', (e) => {
			//Make sure to only try and update the information if we have a payload containing data (an object/associative array)
			if(e.data.match(/\"payload\":{/)){
				var obj = JSON.parse(e.data);
				if (obj.payload.type == "ads_break_change" || obj.payload.type == 'change'){
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
