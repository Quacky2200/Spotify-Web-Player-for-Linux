/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Notifications D-Bus Service
 */
module.exports = function(lastURI, interpreter){
	var request = require('request');
	var fs = require('fs');

	var notifications = require('freedesktop-notifications');
	notifications.setUnflood(true);
	var notification = notifications.createNotification({timeout: 2e3});

	function setupNotification(info){
		notification.summary = (info.isAdvertisement ? 'Spotify Advertisement (' + info.status + ')' : (info.status == 'Playing' ? 'Now Playing' : info.status));
		notification.body = `${info.track.name.replace(/( - .*| \(.*)/i, '')}\n${info.track.album.replace(/( - .*| \(.*)/i, '')}\n${info.track.artists}`;
		notification.icon = info.track.art;
	}

	interpreter.on('notify', function(info){
		if (!info.track.uri && !info.isAdvertisement) return;
		var filepath = (info.albumCacheDisabled || info.isAdvertisement ? '/tmp' : info.albumCache);
		console.log(filepath);
		if (!info.albumCacheDisabled) fs.access(filepath, fs.F_OK, (err) => {
			if (err){
				fs.mkdir(filepath, (err) => {
					if (err) console.log(err);
				});
			}
		});

		var album = info.track.album.match(/(?:(?! [^\w]).)*/)[0];

		var file = (info.track.art ? `${filepath}/${album}.jpeg` : process.cwd() + '/icons/spotify.png');
		fs.access(file, fs.F_OK, (err) => {
			if (err){
				request(info.track.art, {encoding: 'binary'}, (error, response, body) => {
				  if(error) console.log(error);
				  fs.writeFile(file, body, 'binary', (err) => {
					if (err) return console.log(err);
					info.track.art = file;
					setupNotification(info);
					notification.push();
				  });
				}); 
			} else {
				info.track.art = file;
				setupNotification(info);
				notification.push();
			}
		}); 
	});
};