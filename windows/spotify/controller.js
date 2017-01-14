/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
const EventEmitter = require('events');

module.exports = (function() {
	const dbus = props.dbus;
	updateMetadata = function(info){
		if (dbus && info.track){
			dbus.mpris.metadata = {
				'mpris:trackid': dbus.mpris.objectPath('track/' + info.track.trackNumber),
				'mpris:length': info.track.length,
				'mpris:artUrl': info.track.art,
				'xesam:title': info.track.name.replace(/(\'| - .*| \(.*)/i, ''), //Remove long track titles
				'xesam:album': info.track.album.replace(/(\'| - .*| \(.*)/i, ''), //Remove long album names
				'xesam:artist': info.track.artists,
				'xesam:url': info.track.url
			};
			dbus.mpris.volume = info.volume;
			dbus.mpris.position = info.track.position;
			dbus.mpris.playbackStatus = info.status;
			dbus.mpris.shuffle = info.shuffle;
			dbus.mpris.repeat = info.repeat;
		}
	}
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
				$('button#play-pause', $(player).contents()).click();
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
					this.track.id = null;
					this.track.discNumber = 1;
					this.track.trackNumber = 0;
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
				//Try to update mpris information
				updateMetadata(this);
				if(trackChange || playbackChange) this.emit((trackChange ? 'track' : 'playback') + 'Change', this);
			};
			//Add an event hook on the messages going through the player iframe element
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

			if (dbus) {
				this.dispose();

				dbus.mediakeys.on('Play', () => this.playPause());
				dbus.mediakeys.on('Stop', () => this.stop());
				dbus.mediakeys.on('Next', () => this.next());
				dbus.mediakeys.on('Previous', () => this.previous());

				dbus.mpris.on('play', () => this.play());
				dbus.mpris.on('playpause', () => this.playPause());
				dbus.mpris.on('next', () => this.next());
				dbus.mpris.on('previous', this.previous);
				dbus.mpris.on('stop', this.stop);
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
			SpotifyApi.api.request('player_stop', [this.player_id])
		}
		previous () {
			SpotifyApi.api.request('player_skip_to_prev', [this.player_id]);
		}
		next () {
			SpotifyApi.api.request('player_skip_to_next', [this.player_id]);
		}
		setVolume (decimal) {
			this.volume = decimal;
			SpotifyApi.api.request('player_set_volume', [this.player_id, decimal]);
		}
		seek(ms) {
			SpotifyApi.api.request('player_seek', [this.player_id, ms]);
		}
		setLoop(loop) {
			SpotifyApi.api.request('player_set_repeat', [this.player_id, loop == 'Playlist']);
		}
		setShuffle(shuffle) {
			SpotifyApi.api.request('player_set_shuffle', [this.player_id, shuffle]);
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
				new Notification(
					(this.status == 'Playing' ? 'Now Playing' : this.status),
					{
						icon: this.track.art,
						body: this.track.name + "\n" + this.track.album + "\n" + this.track.artists
					}
				);
			}
		};
		// getArtSizes(){
		// 	return {
		// 		large: 2,
		// 		medium: 1,
		// 		small: 0
		// 	};
		// }
		downloadAlbumArt(cb){
			if (!this.track || (!this.track.uri && !this.isAdvertisement)) return cb(new Error('No track present'));
			var filepath = (this.albumCacheDisabled || this.isAdvertisement ? '/tmp' : this.albumCache);
			var downloadArt = () => {
				var album = this.track.album.match(/(?:(?! [^\w]).)*/)[0];
				var file = (this.track.art ? `${filepath}/${props.sanitizeFilename(album)}.jpeg` : process.cwd() + '/icons/spotify.png');
				props.checkPathExists(file, (err) => {
 					if (err) return props.request(this.track.art, {encoding: 'binary'}, (error, response, body) => {
 						if(error) return cb(err);//console.log(error);
 						props.createFile(file, body, 'binary', (err) => {
 							if (err) return cb(err);//console.log(err);
 							cb(null, file);
 						});
					});
 			 		cb(null, file);
 		 		});
			}
			if (!this.albumCacheDisabled) props.checkPathExists(filepath, (err) => {
				if (err) return props.createDirectory(filepath, (err) => {
					if (err) return cb(new err);
						downloadArt();
				});
				downloadArt();
			});
		}
		toggleGlobalMediaButtons(toggle) {
			return;
			var shortcuts = {
				MediaNextTrack: () => {this.next()},
				MediaPlayPause: () => {this.playPause()},
				MediaPreviousTrack: () => {this.previous()},
			};
			for (var shortcut in shortcuts){
				if (shortcuts.hasOwnProperty(shortcut)){
					if (toggle && !globalShortcut.isRegistered(shortcut)){
						globalShortcut.register(shortcut, shortcuts[shortcut]);
					} else if (!toggle && globalShortcut.isRegistered(shortcut)){
						globalShortcut.unregister(shortcut);
					}
				}
			}
		}
	}
	return Controller;
})();
