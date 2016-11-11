/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * D-Bus Services
 */
process.title = 'spotifywebplayer';

const DBusInterpeter = require('./interpreter');
let interpreter = new DBusInterpeter(process.stdin, process.stdout);
let lastURI;

require('./services/mpris')(lastURI, interpreter);
require('./services/notifications')(lastURI, interpreter);
require('./services/mediakeys')(lastURI, interpreter);

process.on('disconnect', function(){
    console.log('Main process disconnected. Exiting.');
    process.exit(0);
});