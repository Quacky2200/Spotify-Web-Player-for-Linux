/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Controller for the player
 */
const EventEmitter = require('events');
const childProcess = require('child_process');
const fs = require('fs');
const spawn = childProcess.spawn;

class Controller extends EventEmitter {
	constructor (player) {
		super();

		this.playPause = () => {
			if (this.status == 'Playing') {
				this.pause();
			} else if (this.status !== 'Playing'){
				this.play();
			}
		}
		this.play = () => {
			if(this.status !== 'Playing') this.playPause();
		}
		this.playPause = () => {
			//API doesn't control adverts... SpotifyApi.api.request('player_pause', [this.player_id]); 
			$('button#play-pause', $('iframe#app-player').contents()).click();
		}
		this.pause = () => {
			if(this.status == 'Playing') this.playPause();
		}
		this.stop = () => {
			SpotifyApi.api.request('player_stop', [this.player_id])
		}
		this.previous = () => {
			SpotifyApi.api.request('player_skip_to_prev', [this.player_id]);
		}
		this.next = () => {
			SpotifyApi.api.request('player_skip_to_next', [this.player_id]);
		}
		this.setVolume = (decimal) => {
			this.volume = decimal;
			SpotifyApi.api.request('player_set_volume', [this.player_id, decimal]);
		}
		this.seek = (ms) => {
			SpotifyApi.api.request('player_seek', [this.player_id, ms]);
		}
		this.setLoop = (loop) => {
			SpotifyApi.api.request('player_set_repeat', [this.player_id, loop == 'Playlist']);
		}
		this.setShuffle = (shuffle) => {
			SpotifyApi.api.request('player_set_shuffle', [this.player_id, shuffle]);
		}
		var dbus = process.platform == 'linux';

		const LIBNODE = [
			'/usr/bin/node', 
			`${process.cwd()}/libs/node/bin/node`
		];
		var nodeFound = false;
		if (dbus){
			//Setup the service
			for(var i = 0; i < LIBNODE.length; i++){
				var lastErr;
				fs.access(LIBNODE[i], fs.F_OK, (err) => {
					lastErr = err;
					if(err) return;
					const DBusInterpreter = require('./D-Bus/interpreter');
					const service = spawn(LIBNODE[i], [__dirname + '/D-Bus/services.js']);
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
					dbus.interpreter.on('OpenUri', (e) => {if(e.uri.indexOf('spotify:track:') > -1){this.playTrack(e.uri)}});
					dbus.interpreter.on('Quit', () => { this.emit('Quit'); });
					dbus.interpreter.on('Raise', () => { this.emit('Raise'); });
					dbus.interpreter.on('Volume', (volume) => {this.setVolume(volume);});
					dbus.interpreter.on('Shuffle', (shuffle) => {console.log(shuffle);});//this.setShuffle(shuffle);});
					dbus.interpreter.on('Loop', (loop) => {this.setLoop(loop);});
					dbus.interpreter.on('Seek', (mms) => {this.seek(mms.delta/1000);});
					dbus.interpreter.on('SetPosition', (track,pos) => {console.log('SetPosition not yet implemented')});
					lastErr = null;
					return;
				});
				if(i == LIBNODE.length - 1 && lastErr){
					dbus = null;
					console.log('D-Bus could have been used but an executable of Node.js could not be found.');
				} else if (!lastErr){
					break;
				}
			}
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
			if(dbus) dbus.stopService();
		};
		var update = (details) => {
			var trackChange, 
				playbackChange;
			//If we are listening to a track
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
		this.player_id = 'main';
		this.repeat = 'None';
		this.shuffle = false;
		this.status = 'Stopped';
		this.track = null;
		this.volume = 1.0;
		this.albumCache = '';
		this.albumCacheDisabled = false;
		this.toggleGlobalMediaButtons = (toggle) => {
			var shortcuts = {
				'MediaNextTrack': () => {this.next()},
				'MediaPlayPause': () => {this.playPause()},
				'MediaPreviousTrack': () => {this.previous()},
			};
			for (var shortcut in shortcuts){
				if (shortcuts.hasOwnProperty(shortcut)){
					if (toggle && !props.globalShortcut.isRegistered(shortcut)){
						props.globalShortcut.register(shortcut, shortcuts[shortcut]);
					} else if (!toggle && props.globalShortcut.isRegistered(shortcut)){
						props.globalShortcut.unregister(shortcut);
					}
				}
			}
		}
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
