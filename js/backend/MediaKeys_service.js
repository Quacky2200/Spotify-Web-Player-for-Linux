/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Media Keys D-Bus Service
 */
//Always make sure we're running as a proper name!
process.title = 'spotifywebplayer';

const DBusInterpeter = require('./dbus_interpreter');
var interpreter = new DBusInterpeter(null, process.stdout);

var DBus = require('dbus');
var dbus = new DBus();
var bus = dbus.getBus('session');
bus.getInterface('org.gnome.SettingsDaemon', '/org/gnome/SettingsDaemon/MediaKeys', 'org.gnome.SettingsDaemon.MediaKeys', function(err, iface) {
    if(err) console.log(err);
    iface.on('MediaPlayerKeyPressed', function (n, value) {
        switch (value) {
            case 'Play': 
                interpreter.send('PlayPause'); 
                break;
            case 'Next': 
                interpreter.send('Next'); 
                break;
            case 'Previous': 
                interpreter.send('Previous'); 
                break;
            case 'Stop': 
                interpreter.send('Stop'); 
                break;
        }
    });
    iface.GrabMediaPlayerKeys(0, 'org.gnome.SettingsDaemon.MediaKeys');
});