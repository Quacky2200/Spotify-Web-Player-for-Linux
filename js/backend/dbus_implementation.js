const childProcess = require('child_process');
const spawn = childProcess.spawn;
const LIBNODE = process.cwd() + '/libs/node/bin/node';
const DBusInterpreter = require('./dbus_interpreter');

let serviceMediaKeys = spawn(LIBNODE, [__dirname + '/MediaKeys_service.js']);
let serviceMPRISAndNotifications = spawn(LIBNODE, [__dirname + '/MPRISAndNotifications_service.js']);

serviceMediaKeys.on('exit', () => {
    console.log('MediaKeys service quit!');
});

serviceMPRISAndNotifications.stdout.on('data', (data)=>{
    console.log(data.toString())
});

serviceMPRISAndNotifications.stderr.on('data', (data) => {
    console.log(data.toString());
})

serviceMPRISAndNotifications.on("error", function(e) { 
    console.log(e); 
});

serviceMPRISAndNotifications.on('exit', () => {
    console.log('MPRIS & Notification service quit!');
});
let MediaKeys = new DBusInterpreter(serviceMediaKeys.stdout, null);
let MPRISAndNotifications = new DBusInterpreter(serviceMPRISAndNotifications.stdout, serviceMPRISAndNotifications.stdin);

module.exports = {
    killall: () => {
        process.kill(serviceMediaKeys.pid);
        process.kill(serviceMPRISAndNotifications.pid);
    },
    services: {
        MediaKeys: serviceMediaKeys,
        MPRISAndNotifications: serviceMPRISAndNotifications
    },
    MediaKeys: MediaKeys,
    MPRISAndNotifications: MPRISAndNotifications,
};