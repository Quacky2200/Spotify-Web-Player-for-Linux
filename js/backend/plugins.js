/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Plugins insertion function
 */
module.exports = function(app){
	/**
 	 * Pepper Flash Player & Widevine are required plugins for Spotify Web Player to play music
 	 */
 	var pluginName = null;
 	switch(process.platform){
 		case 'win32':
 		case 'win64':
		    pluginName = 'pepflashplayer.dll'
		    break
		case 'darwin':
		    pluginName = 'PepperFlashPlayer.plugin'
		    break
		case 'linux':
		    pluginName = 'libpepflashplayer-' + process.arch + '.so'
		    break
		default:
			console.log('No available flash plugin can be used for this platform. Exiting...');
 			process.exit(1);
 	}
	app.commandLine.appendSwitch('ppapi-flash-path', __dirname + '/../../plugins/' + pluginName);
	//Optionally specify flash version, for example, v17.0.0.169
	//app.commandLine.appendSwitch('ppapi-flash-version', '20.0.0.306');
	//These may be necessary when Spotify decides to move to pure HTML5 DRM
	//app.commandLine.appendSwitch('widevine-cdm-path', __dirname + '/plugins/widevinecdmadapter.so');
	// The version of plugin can be got from `chrome://plugins` page in Chrome.
	//app.commandLine.appendSwitch('widevine-cdm-version', '  1.4.8.824');
}
