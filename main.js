const electron = require('electron');
//If Electron is a Path, start Electron by ourselves as we're starting from Node.JS
if (typeof electron == 'string'){
	const spawn = require('child_process').spawn;
	const ls = spawn(electron, ['./']);

	console.log(`Starting up app with Electron found at "${electron}"`);

	ls.stdout.on('data', function(data) {
	     console.log(data.toString());
	 });

 	ls.stderr.on('data', function(data) {
	     console.log(data.toString());
	});

	 ls.on('close', function(code) {
	     console.log(`child process exited with code ${code}`);
	 });
	//process.exit(0);
} else if (typeof electron == 'object' && electron.app){
	require('./app');
} else {
 	console.log('Cannot start up. Exiting...');
	process.exit(-1);
}
