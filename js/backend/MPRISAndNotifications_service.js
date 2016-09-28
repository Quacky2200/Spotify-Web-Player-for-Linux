/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * MPRIS D-Bus Service
 */

//Always make sure we're running as a proper name!
process.title = 'spotifywebplayer';

var request = require('request');
var fs = require('fs');

const DBusInterpeter = require('./dbus_interpreter');
var interpreter = new DBusInterpeter(process.stdin, process.stdout);

const notifications = require('freedesktop-notifications');
notifications.setUnflood(true);
let notification = notifications.createNotification({timeout: 2e3});

const Player = require('mpris-service');
const player = Player({
    name: 'spotifywebplayer',
    identity: 'spotifywebplayer',
    supportedUriSchemes: ['http'],
    supportedMimeTypes: ['application/www-url'],
    desktopEntry: 'spotifywebplayer'
});


function setupNotification(info){
    notification.summary = (info.status == 'Playing' ? 'Now Playing' : info.status);
    notification.body = info.track.name.replace(/( - .*| \(.*)/i, '') + '\n' + 
        info.track.album.replace(/( - .*| \(.*)/i, '') + '\n' + 
        info.track.artists;
    notification.icon = info.track.art;
}
let lastURI = '';
interpreter.on('updateMpris', function(info){
    if (info.status == 'Stopped'){
        player.playbackStatus = info.status;
    } else {
        if (info.track.uri && lastURI != info.track.uri){
            player.metadata = {
                'mpris:trackid': player.objectPath('track/' + info.track.id),
                'mpris:length': info.track.length,
                'mpris:artUrl': info.track.art,
                'xesam:title': info.track.name.replace(/(\'| - .*| \(.*)/i, ''), //Remove long track titles
                'xesam:album': info.track.album.replace(/(\'| - .*| \(.*)/i, ''), //Remove long album names
                'xesam:artist': info.track.artists, 
                'xesam:url': 'https://play.spotify.com/track/' + info.track.uri
            };
            lastURI = info.track.uri;
        }
        if (player.metadata['mpris:length'] != info.track.length) {
            player.metadata['mpris:length'] = info.track.length;
        }
        if (info.track.uri) player.position = info.track.position;
        if(player.playbackStatus != info.status) player.playbackStatus = info.status;
        if(player.shuffle != info.shuffle) player.shuffle = info.shuffle;
        if(player.repeat != info.repeat) player.repeat = info.repeat;
    }
});

interpreter.on('notify', function(info){
    if (!info.track.uri) return;
    var filepath = (info.albumCacheDisabled ? '/tmp' : info.albumCache);
    if (!info.albumCacheDisabled) fs.access(filepath, fs.F_OK, (err) => {
        if (err){
            fs.mkdir(filepath, (err) => {
                if (err) console.log(err);
            });
        }
    });
    var file = (info.track.art ? filepath + '/' + info.track.album + '.jpeg' : process.cwd() + '/icons/spotify-web-player.png');
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

player.on('quit', () => {interpreter.send('Quit')});
player.on('raise', () => {interpreter.send('Raise')});

player.on('playpause', () => {interpreter.send('PlayPause')});
player.on('play', () => {interpreter.send('Play')});
player.on('next', () => {interpreter.send('Next')});
player.on('previous', () => {interpreter.send('Previous')});
player.on('stop', () => {interpreter.send('Stop')});
player.on('seek', (Offset) => {interpreter.send('Seek', {Offset:Offset})});
player.on('position', (TrackID, Position) => {interpreter.send('SetPosition', {TrackID:TrackID, Position:Position})});
player.on('open', (Uri) => {interpreter.send('OpenUri', {Uri:Uri})});

//Make sure we stop when we get disconnected from the main process
process.on('disconnect', function(){
    console.log('Main process disconnected. Exiting.');
    process.exit(0);
});
