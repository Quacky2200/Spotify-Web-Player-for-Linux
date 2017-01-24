/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
const EventEmitter = require('events');
const request = require('request');
const sanitizeFilename = require('sanitize-filename');
const {ipcMain} = require('electron');
const dbus = require('./dbus')(app.names.process);
class Controller extends EventEmitter {
	constructor (player) {
		super();
		this.track = null;
		this.player_id = 'main';
		this.repeat = 'None';
		this.shuffle = false;
		this.status = 'Stopped';
		this.track = null;
		this.volume = 1.0;
		this.albumCache = '';
		this.albumCacheDisabled = false;

		this.playPause = () => {
			//API doesn't control advertisement playback... SpotifyApi.api.request('player_pause', [this.player_id]);
			app.spotify.do(`$('button#play-pause', $(\`${player}\`).contents()).click()`);
		}
		//Update track information with the details provided
		var update = (details) => {
			var trackChange, playbackChange;
			//If a track is present (i.e. we are listening to a track)
			if(details.track){
				var currentPlayback = (details.playing ? 'Playing' : 'Paused');
				if(!this.track) this.track = {};
				this.isAdvertisement = false;

				trackChange = this.track.uri != details.track.uri;
				playbackChange = this.status != currentPlayback;

				this.status = currentPlayback;
				//If we have a track, update the information for it (position update and track change)
				this.track.trackNumber = details.track.number;
				this.track.discNumber = details.track.disc;
				this.track.id = details.track.uri.replace('spotify:track:', '');
				this.track.uri = details.track.uri;
				this.track.name = details.track.name;
				this.track.album = details.track.album.name;
				this.track.artists = details.track.artistName;
				this.track.popularity = details.track.popularity / 100;
				this.track.length = details.duration * 1000; //Must be in Microseconds (from milliseconds)
				this.track.position = details.position * 1000;
				this.track.art = details.track.images; //Retrieve the smallest image as our album art
				this.track.url = 'https://play.spotify.com/track/' + this.track.uri;
				this.shuffled = details.shuffle;
				this.repeat = (details.repeat == 0 ? 'None' : (details.repeat == 1 ? 'Playlist' : 'Track'));

			} else if (details.type == 'AD_BREAK_CHANGED') {
				var currentPlayback = (details.params.playing ? 'Playing' : 'Paused');

				trackChange = !!this.track.uri;
				playbackChange = this.status != currentPlayback;
				this.status = currentPlayback;
				this.isAdvertisement = true;
				this.track.id = null;
				this.track.discNumber = 1;
				this.track.trackNumber = 0;
				this.track.uri = null;
				this.track.name = details.params.title;
				this.track.album = details.params.description;
				this.track.popularity = 1;
				this.track.artists = 'Spotify';
				this.track.art = [['undetermined-size', details.params.imageUrl]];
				this.track.url = details.params.clickUrl;
				this.track.position = details.params.position * 1000;
				this.track.length = details.params.duration * 1000;
			} else {
				playbackChange = this.status != 'Stopped';
				this.status = 'Stopped';
			}
			if (dbus && this.track){
				var artSizeRequested = this.getArtSizes()[app.settings.AlbumArtSize];
				var artSize = (artSizeRequested < this.track.art.length ? artSizeRequested : this.track.art.length - 1);
				dbus.mpris.metadata = {
					'mpris:trackid': dbus.mpris.objectPath('track/' + this.track.trackNumber),
					'mpris:length': this.track.length,
					'mpris:artUrl': this.track.art[artSize][1],
					'xesam:title': this.track.name.replace(/(\'| - .*| \(.*)/i, ''), //Remove long track titles
					'xesam:album': this.track.album.replace(/(\'| - .*| \(.*)/i, ''), //Remove long album names
					'xesam:artist': this.track.artists,
					'xesam:url': this.track.url
				};
				dbus.mpris.volume = this.volume;
				dbus.mpris.position = this.track.position;
				dbus.mpris.playbackStatus = this.status;
				dbus.mpris.shuffle = this.shuffle;
				dbus.mpris.repeat = this.repeat;
			}
			this.emit('liveChange', this);
			if(trackChange || playbackChange) this.emit((trackChange ? 'track' : 'playback') + 'Change', this);
		};
		//Add an event hook on the messages going through the player iframe element
		//player.contentWindow.addEventListener('message', (e) => {
		ipcMain.on('track-metadata', (e, args) => {
			//Make sure to only try and update the information if we have a payload containing data (an object/associative array)
			if(args.match(/\"payload\":{/)){
				var obj = JSON.parse(args);
				if (obj.payload.type == "ads_break_change" || obj.payload.type == 'change'){
					update(obj.payload.data);
				} else if (obj.payload.track){
					update(obj.payload);
				}
			}
		});

		if (dbus) {
			this.dispose();

			dbus.mediakeys.on('Play', () => this.playPause());
			dbus.mediakeys.on('Stop', () => this.stop());
			dbus.mediakeys.on('Next', () => this.next());
			dbus.mediakeys.on('Previous', () => this.previous());

			dbus.mpris.on('play', () => this.play());
			dbus.mpris.on('playpause', () => this.playPause());
			dbus.mpris.on('next', () => this.next());
			dbus.mpris.on('previous', () => this.previous());
			dbus.mpris.on('stop', () => this.stop());
			dbus.mpris.on('openuri', (e) => {if(e.uri.indexOf('spotify:track:') > -1){this.playTrack(e.uri)}});
			dbus.mpris.on('quit', () => { this.emit('Quit'); });
			dbus.mpris.on('raise', () => { this.emit('Raise'); });
			dbus.mpris.on('volume', (volume) => {this.setVolume(volume);});
			dbus.mpris.on('shuffle', (shuffle) => {this.setShuffle(shuffle);});
			dbus.mpris.on('loopStatus', (loop) => {this.setLoop(loop);});
			dbus.mpris.on('seek', (mms) => {this.seek(mms.delta/1000);});
			dbus.mpris.on('position', (track,pos) => {console.log('SetPosition not yet implemented')});
		}
	}
	dispose(){
		if(dbus){
			dbus.mediakeys.removeAllListeners();
			dbus.mpris.removeAllListeners();
		}
	}
	pause() {
		if(this.status == 'Playing') this.playPause();
	}
	play() {
		if(this.status !== 'Playing') this.playPause();
	}
	stop () {
		app.spotify.do(`SpotifyApi.api.request('player_stop', [\'${this.player_id}\'])`);
	}
	previous () {
		if ((controller.track.position / 1e6) < 5){
			//Go to previous track if we're close enough to it
			app.spotify.do(`SpotifyApi.api.request('player_skip_to_prev', [\'${this.player_id}\'])`);
		} else {
			//Otherwise we want to go back to the start of the track
			this.seek(0);
		}
	}
	next () {
		app.spotify.do(`SpotifyApi.api.request('player_skip_to_next', [\'${this.player_id}\'])`);
	}
	setVolume (decimal) {
		this.volume = decimal;
		app.spotify.do(`SpotifyApi.api.request('player_set_volume', [\'${this.player_id}\', ${decimal}])`);
	}
	seek(ms) {
		app.spotify.do(`SpotifyApi.api.request('player_seek', [\'${this.player_id}\', ${ms}])`);
	}
	setLoop(loop) {
		app.spotify.do(`SpotifyApi.api.request('player_set_repeat', [\'${this.player_id}\', ${loop == 'Playlist'}])`);
	}
	setShuffle(shuffle) {
		app.spotify.do(`SpotifyApi.api.request('player_set_shuffle', [\'${this.player_id}\', ${shuffle}])`);
	}
	notify() {
		if (dbus) {
			this.downloadAlbumArt((err, file) => {
					if (err) return console.log(err);
					dbus.notifications.notify(
						(this.isAdvertisement ? 'Spotify Advertisement (' + this.status + ')' : (this.status == 'Playing' ? 'Now Playing' : this.status)),
						`${this.track.name.replace(/( - .*| \(.*)/i, '')}\n${this.track.album.replace(/( - .*| \(.*)/i, '')}\n${this.track.artists}`,
						file
					);
			});
		} else {
			app.spotify.do(`new Notification(
				${this.status == 'Playing' ? 'Now Playing' : this.status},
				{
					icon: ${this.track.art},
					body: ${this.track.name} + "\n" + ${this.track.album} + "\n" + ${this.track.artists}
				}
			);`)
		}
	};
	getArtSizes(){
		return {
			large: 2,
			medium: 1,
			small: 0
		};
	}
	downloadAlbumArt(cb){
		if (!this.track || (!this.track.uri && !this.isAdvertisement)) return cb(new Error('No track present'));
		var filepath = (this.albumCacheDisabled || this.isAdvertisement ? '/tmp' : this.albumCache);
		var downloadArt = () => {
			var album = sanitizeFilename(this.track.album.match(/(?:(?! [^\w]).)*/)[0]);
			var artist = sanitizeFilename(this.track.artists.split(',')[0]);
			var file = (this.track.art ? `${filepath}/${artist}/${album}.jpeg` : process.cwd() + '/icons/spotify.png');
			app.checkPathExists(file, (err) => {
				var artSizeRequested = this.getArtSizes()[app.settings.AlbumArtSize];
				var artSize = (artSizeRequested < this.track.art.length ? artSizeRequested : this.track.art.length - 1);
				if (err) return request(this.track.art[artSize][1], {encoding: 'binary'}, (error, response, body) => {
					if(error) return cb(err);//console.log(error);
					app.checkPathExists(`${filepath}/${artist}/`, (err) => {
						var createArt = () => app.createFile(file, body, 'binary', (err) => {
							if (err) return cb(err);//console.log(err);
							cb(null, file);
						});
						if (err) return app.createDirectory(`${filepath}/${artist}`, (err) => {
							if (err) return cb(err);
							createArt();
						});
						createArt();
					})
				});
				cb(null, file);
			});
		}
		if (!this.albumCacheDisabled) app.checkPathExists(filepath, (err) => {
			if (err) return app.createDirectory(filepath, (err) => {
				if (err) return cb(new err);
					downloadArt();
			});
			downloadArt();
		});
	}
	get isPlaying() { return this.status == 'Playing' }
	get  isPaused() { return this.status ==  'Paused' }
	get isStopped() { return this.status == 'Stopped' }
}
module.exports = new Controller('#app-player');
