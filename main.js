/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Web Player for Linux
 */
const electron = require('electron');
const app = electron.app;
let dbus = (process.platform == 'linux' ? require('./js/backend/dbus_implementation') : null);
global.dbus = dbus;
let props = require('./js/backend/properties')(electron);
global.props = props;
var plugins = require('./js/backend/plugins')(app);
//Set the caching for the application
app.setPath('userData', props.APP_DIR);
app.setPath('userCache', props.APP_DIR + "/Cache");
//Set the name of the application
app.setName('spotifywebplayer');
//Set the process name
process.title = 'spotifywebplayer';
//When Electron has loaded, start opening the window.
app.on('ready', function(){
    //Start mainWindow
    props.mainWindow = props.mainWindow();
    props.preferencesWindow = props.preferencesWindow();
    props.aboutWindow = props.aboutWindow();

    showDevToolsOnFocus(props.mainWindow);
    showDevToolsOnFocus(props.preferencesWindow);
    showDevToolsOnFocus(props.aboutWindow);
    props.mainWindow.on('closed', () => {
	if(dbus) {
	    try{
	        dbus.quit();
	    } catch (e){
	        console.log(e);
            }
        }
        app.quit();
	    process.exit(0);
    });
});
app.on('quit', () => {
    console.log('Exiting...');
});
function showDevToolsOnFocus(window){
    if(window) window.on('show', () => {if(props.appSettings.ShowDevTools) window.openDevTools()});
}

//Make sure we only run one instance of the application
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    var mainWindow = props.mainWindow;
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
});
//Quit if we're trying to run another instance
if (shouldQuit) {
    console.log('An instance is already running, exiting...');
    app.quit();
    return;
}

//Let's support OS X anyways.
app.on('activate', function () {
    props.mainWindow.show();
    props.mainWindow.unmaximize();
});
