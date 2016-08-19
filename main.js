/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Web Player for Linux
 */
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const userhome = require('userhome');
const os = require('os');
const fs = require('fs');
//Set the process name
process.title = "spotifywebplayer";
//Global properties that may be required by the web application
global.props = {
    NAME: 'Spotify Web Player',
    fs: fs,
    os: os,
    electron: electron,
    mpris: null,//require('mpris-service'),
    APP_ICON: __dirname + '/spotify-large-transparent.png',
    userhome: userhome,
    APP_DIR: userhome('.spotifywebplayer'),
    HOST: 'https://play.spotify.com',
    PORT: null,
    VERSION: '0.8.19',
    HOSTNAME: os.hostname(),
    FILE_PATH: process.cwd(),
    clearCache: function(){
        global.props.mainWindow.loadURL("about:blank");
        global.props.mainWindow.webContents.session.clearCache(function(){
        global.props.mainWindow.webContents.session.clearStorageData(function(){
          console.log("Cleared session and cache.");
          global.props.mainWindow.loadURL(props.HOST);
        });
      });
    },
    getNewFacebookPopupWindow: function(title, url){
        var popupWindow = new BrowserWindow({
            title: title,
            minWidth: 550,
            minHeight: 280,
            width: 550,
            height: 280,
            show: true,
            icon: global.props.APP_ICON,
            session: global.props.mainWindow.webContents.session,
            webPreferences: {
              preload: __dirname + "/scripts/facebook-popup-window.js",
              nodeIntegration: false, 
              plugins: true
            }
        });
        popupWindow.loadURL(url);
        //popupWindow.openDevTools();
        popupWindow.setMenu(null);
        return popupWindow;
    },
    mainWindow: function(){
        return new BrowserWindow({
            title: global.props.NAME,
            icon: global.props.APP_ICON,
            width: 1200,
            height: 700,
            show: false,
            backgroundColor: "#121314",
            minWidth: 800,
            minHeight: 600,
            show: false,
            webPreferences: {
              nodeIntegration: false,
              preload: __dirname + "/scripts/main.js",
              plugins: true,
              allowDisplayingInsecureContent: true,
              allowRunningInsecureContent: true
            }
        });
    }
};

/**
 * Pepper Flash Player & Widevine are required plugins for Spotify Web Player to play music
 */
app.commandLine.appendSwitch('ppapi-flash-path', __dirname + '/plugins/PepperFlash/libpepflashplayer.so');
// Specify flash version, for example, v17.0.0.169
app.commandLine.appendSwitch('ppapi-flash-version', '20.0.0.306');
app.commandLine.appendSwitch('widevine-cdm-path', __dirname + '/plugins/widevinecdmadapter.so');
// The version of plugin can be got from `chrome://plugins` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '  1.4.8.824');
//Set the caching for the application
app.setPath('userData', global.props.APP_DIR);
app.setPath('userCache', global.props.APP_DIR + "/Cache");
//Set the name of the application
app.setName(global.props.NAME);

//When Electron has loaded, start opening the window.
app.on('ready', function(){
    global.props.mainWindow = global.props.mainWindow();
    var mainWindow = global.props.mainWindow;
    mainWindow.loadURL(global.props.HOST);
    mainWindow.on('page-title-updated', function(event){
        event.preventDefault();
    });
    mainWindow.setMenu(null);
    mainWindow.show();
    mainWindow.webContents.on('new-window', function(event, url, name, disposition){
        if(!~url.indexOf("facebook.com")) return;
        global.props.getNewFacebookPopupWindow(name, url);
        event.preventDefault();
    });
});
//Make sure we only run one instance of the application
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    var mainWindow = global.props.mainWindow;
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
});
//Quit if we're trying to run another instance
if (shouldQuit) {
    app.quit();
    return;
}
console.log("Cache saving to: " + app.getPath('userData') + '/Cache');

//Let's support OS X anyways.
app.on('activate', function () {
    global.props.mainWindow.show();
    global.props.mainWindow.unmaximize();
});