/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * MPRIS D-Bus Service
 */
var request = require('request');
var fs = require('fs');
const interpreter = require('./dbus_interpreter');
const notifications = require('freedesktop-notifications');
notifications.setUnflood(true);
let notification = notifications.createNotification({timeout: 1e4});
function setupNotification(info){
    notification.summary = (info.status == 'Playing' ? 'Now Playing' : info.status);
    notification.body = info.activeSong.name.replace(/(\'| - .*| \(.*)/i, '') + '\n' + 
    info.activeSong.album.replace(/(\'| - .*| \(.*)/i, '') + '\n' + 
    info.activeSong.artists;
    notification.icon = info.activeSong.art;;
}
//Always make sure we're running as a proper name!
process.title = 'spotifywebplayer';
interpreter.handle(process.stdin, {
    updateMpris: (info) => {
        player.metadata = {
            'mpris:trackid': player.objectPath('track/' + info.activeSong.id),
            'mpris:length': info.activeSong.length, // In microseconds
            'mpris:artUrl': info.activeSong.art,
            'xesam:title': info.activeSong.name.replace(/(\'| - .*| \(.*)/i, ''), //Remove long track titles
            'xesam:album': info.activeSong.album.replace(/(\'| - .*| \(.*)/i, ''), //Remove long album names
            'xesam:artist': info.activeSong.artists
        };
        player.playbackStatus = info.status;
        player.shuffle = info.shuffle;
        player.repeat = info.repeat;
    },
    notify: (info) => {
        var file = '/tmp/spotifywebplayer-coverart-' + info.activeSong.album + '.jpeg';
        fs.access(file, fs.F_OK, function(err){
            if (err){
                request(info.activeSong.art, {encoding: 'binary'}, function(error, response, body) {
                  fs.writeFile(file, body, 'binary', function (err) {
                    if (err) console.log(err);
                    lastAlbumArt = file;
                    info.activeSong.art = file;
                    setupNotification(info);
                    notification.push();
                  });
                }); 
            } else {
                info.activeSong.art = file;
                setupNotification(info);
                notification.push();
            }
        });
    }
});

const Player = require('mpris-service');

const player = Player({
    name: 'spotifywebplayer',
    identity: 'spotifywebplayer',
    supportedUriSchemes: ['http'],
    supportedMimeTypes: ['application/www-url'],
    desktopEntry: 'spotifywebplayer'
});
function send(command, args){
    console.log('Sending ' + command + ' event');
    interpreter.send(process.stdout, command, args);
}

player.on('quit', () => {send('Quit')});
player.on('raise', () => {send('Raise')});

player.on('playpause', () => {send('PlayPause')});
player.on('play', () => {send('Play')});
player.on('next', () => {send('Next')});
player.on('previous', () => {send('Previous')});
player.on('stop', () => {send('Stop')});
player.on('seek', (Offset) => {send('Seek', {Offset:Offset})});
player.on('position', (TrackID, Position) => {send('SetPosition', {TrackID:TrackID, Position:Position})});
player.on('open', (Uri) => {send('OpenUri', {Uri:Uri})});

//Make sure we stop when we get disconnected from the main process
process.on('disconnect', function(){
    console.log('Main process disconnected. Exiting.');
    process.exit(0);
});
