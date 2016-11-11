/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * MPRIS D-Bus Service
 */
module.exports = function(lastURI, interpreter){
	const Player = require('mpris-service');
	const player = Player({
	    name: 'spotifywebplayer',
	    identity: 'spotifywebplayer',
	    supportedUriSchemes: ['http'],
	    supportedMimeTypes: ['application/www-url'],
	    desktopEntry: 'spotifywebplayer'
	});
	interpreter.on('updateMpris', function(info){
	    if (info.status == 'Stopped'){
	        player.playbackStatus = info.status;
	    } else {
	        if ((info.track.uri && lastURI != info.track.uri) || info.isAdvertisement){
	            player.metadata = {
	                'mpris:trackid': player.objectPath('track/' + info.track.trackNumber),
	                'mpris:length': info.track.length,
	                'mpris:artUrl': info.track.art,
	                'xesam:title': info.track.name.replace(/(\'| - .*| \(.*)/i, ''), //Remove long track titles
	                'xesam:album': info.track.album.replace(/(\'| - .*| \(.*)/i, ''), //Remove long album names
	                'xesam:artist': info.track.artists, 
	                'xesam:url': info.track.url
	            };
	            lastURI = info.track.uri;
	        }
	        if (player.metadata['mpris:length'] != info.track.length) {
	            player.metadata['mpris:length'] = info.track.length;
	        }
	        if(player.volume != info.volume) player.volume = info.volume;
	        if (info.track.position && player.position != info.track.position) player.position = info.track.position;
	        if(player.playbackStatus != info.status) player.playbackStatus = info.status;
	        if(player.shuffle != info.shuffle) player.shuffle = info.shuffle;
	        if(player.repeat != info.repeat) player.repeat = info.repeat;
	    }
	});

	player.on('quit', () => {interpreter.send('Quit')});
	player.on('raise', () => {interpreter.send('Raise')});

	player.on('playpause', () => {interpreter.send('PlayPause')});
	player.on('play', () => {interpreter.send('Play')});
	player.on('next', () => {interpreter.send('Next')});
	player.on('previous', () => {interpreter.send('Previous')});
	player.on('stop', () => {interpreter.send('Stop')});
	player.on('shuffle', (shuffle) => {interpreter.send('Shuffle', shuffle)});
	player.on('loopstatus', (loop) => {interpreter.send('Loop', loop)});
	player.on('volume', (volume) => {interpreter.send('Volume', volume)});
	player.on('seek', (Offset) => {interpreter.send('Seek', Offset)});
	player.on('SetPosition', (TrackID, Position) => {interpreter.send('SetPosition', [TrackID, Position])});
	player.on('open', (Uri) => {interpreter.send('OpenUri', Uri)});
};