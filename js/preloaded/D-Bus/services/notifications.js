/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Notifications D-Bus Service
 */
module.exports = function(lastURI, interpreter){
	var request = require('request');
	var fs = require('fs');

	const notifications = require('freedesktop-notifications');
	notifications.setUnflood(true);
	let notification = notifications.createNotification({timeout: 2e3});

	function setupNotification(info){
	    notification.summary = (info.isAdvertisement ? 'Spotify Advertisement (' + info.status + ')' : (info.status == 'Playing' ? 'Now Playing' : info.status));
	    notification.body = info.track.name.replace(/( - .*| \(.*)/i, '') + '\n' + 
	        info.track.album.replace(/( - .*| \(.*)/i, '') + '\n' + 
	        info.track.artists;
	    notification.icon = info.track.art;
	}

	interpreter.on('notify', function(info){
	    if (!info.track.uri && !info.isAdvertisement) return;
	    var filepath = (info.albumCacheDisabled ? '/tmp' : info.albumCache);
	    if (!info.albumCacheDisabled) fs.access(filepath, fs.F_OK, (err) => {
	        if (err){
	            fs.mkdir(filepath, (err) => {
	                if (err) console.log(err);
	            });
	        }
	    });
	    //Set filename using album name (album art) but make sure to remove special characters 
	    //(e.g. I Heard It Through The Grapevine / In The Groove (Stereo) becomes I Heard It Through The Grapevine)
	    var file = (info.track.art ? filepath + '/' + info.track.album.match(/(?:(?! [^\w]).)*/)[0] + '.jpeg' : process.cwd() + '/icons/spotify-web-player.png');
	    fs.access(file, fs.F_OK, function(err){
	        if (err){
	            request(info.track.art, {encoding: 'binary'}, function(error, response, body) {
	              if(error) console.log(error);
	              fs.writeFile(file, body, 'binary', function (err) {
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