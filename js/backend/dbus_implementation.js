/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * D-Bus MPRIS Messaging implementer
 */
var child_process = require('child_process');
var spawn = child_process.spawn;
var lib_node = process.cwd() + '/libs/node/bin/node';
const interpreter = require('./dbus_interpreter');
let dbus = spawnDBus();

function spawnDBus(){
    var spawned = spawn(lib_node, [__dirname + '/dbus_service.js']);
    spawned.stderr.on('data', (data) => {
        console.log('D-Bus Error: ' + data.toString())
    });
    spawned.stdout.on('data', (data) => {
        console.log('D-Bus/MPRIS says: \n' + data.toString());
    });
    spawned.on('exit', () => {
        console.log('D-Bus has unexpectedly disconnected.');
    });
    return spawned;
}

module.exports = {
    instance: dbus,
    interpreter: interpreter,
    reload: () => {
	   dbus = spawnDBus();
    },
    quit: () => {
        try {
	       process.kill(dbus.pid);
           dbus = null;
	    } catch (e){
	    //D-Bus quitted early
        }
    }
};
