/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * D-Bus MPRIS, Notifications and Media Keys Messaging Implementer
 */
var child_process = require('child_process');
var spawn = child_process.spawn;
var lib_node = process.cwd() + '/libs/node/bin/node';
const interpreter = require('./dbus_interpreter');
let MPRISAndNotifications = spawnMPRISAndNotificationService();
let MediaKeys = spawnMediaKeyService();

function spawnMPRISAndNotificationService(){
    var spawned = spawn(lib_node, [__dirname + '/MPRISAndNotifications_service.js']);
    spawned.stderr.on('data', (data) => {
        console.log('MPRIS & Notification Error: ' + data.toString())
    });
    spawned.stdout.on('data', (data) => {
        console.log('MPRIS & Notification service: \n' + data.toString());
    });
    spawned.on('exit', () => {
        console.log('MPRIS & Notification service quit!');
    });
    return spawned;
}
function spawnMediaKeyService(){
    var spawned = spawn(lib_node, [__dirname + '/MediaKeys_service.js']);
    spawned.stderr.on('data', (data)=>{
        console.log('Media Key Error: ' + data.toString());
    });
    spawned.stdout.on('data', (data) => {
        console.log('Media Keys service: ' + data.toString());
    });
    spawned.on('exit', () => {
        console.log('Media Keys quit!');
    });
    return spawned;
}

module.exports = {
    instances: {
        MPRISAndNotifications: MPRISAndNotifications,
        MediaKeys: MediaKeys
    },
    interpreter: interpreter,
    reload: () => {
	   MPRISAndNotifications = spawnMPRISAndNotificationService();
       MediaKeys = spawnMediaKeyService();
    },
    quit: () => {
        try {
	       process.kill(MPRISAndNotifications.pid);
           process.kill(MediaKeys.pid);
           MPRISAndNotifications = null;
           MediaKeys = null;
	    } catch (e){}
    }
};
