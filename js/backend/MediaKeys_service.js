const interpreter = require('./dbus_interpreter');
function send(command, args){
    console.log('Sending ' + command + ' event');
    interpreter.send(process.stdout, command, args);
}
var DBus = require('dbus');
var dbus = new DBus();
var bus = dbus.getBus('session');
bus.getInterface('org.gnome.SettingsDaemon', '/org/gnome/SettingsDaemon/MediaKeys', 'org.gnome.SettingsDaemon.MediaKeys', function(err, iface) {
    if(err) console.log(err);
    iface.on('MediaPlayerKeyPressed', function (n, value) {
        switch (value) {
            case 'Play': 
                send('PlayPause'); 
                break;
            case 'Next': 
                send('Next'); 
                break;
            case 'Previous': 
                send('Previous'); 
                break;
            case 'Stop': 
                send('Stop'); 
                break;
        }
    });
    iface.GrabMediaPlayerKeys(0, 'org.gnome.SettingsDaemon.MediaKeys');
});