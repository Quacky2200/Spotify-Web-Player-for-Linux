var electron_path = require('electron-prebuilt');
const spawn = require('child_process').spawn;
const ls = spawn(electron_path, ['./']);

console.log('Running electron from ' + electron_path);

ls.stdout.on('data', function(data) {
    console.log('%s', data);
});

ls.stderr.on('data', function(data) {
    console.log('%s', data);
});

ls.on('close', function(code) {
    console.log('child process exited with code ${code}');
});
