'use strict';
process.title = "spotifywebplayer";
const electron = require('electron');
// Module to control application life.
const app = electron.app;
app.setName("Spotify Web Player");
var userhome = require('userhome');
var path = userhome('.spotifywebplayer');
app.setPath('userData', path);
app.setPath('userCache', path + "/Cache");
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var webFrame = require('electron').webFrame;

//Plugins
app.commandLine.appendSwitch('ppapi-flash-path', __dirname + '/plugins/PepperFlash/libpepflashplayer.so');
// Specify flash version, for example, v17.0.0.169
app.commandLine.appendSwitch('ppapi-flash-version', '20.0.0.306');
app.commandLine.appendSwitch('widevine-cdm-path', __dirname + '/plugins/widevinecdmadapter.so');
// The version of plugin can be got from `chrome://plugins` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '  1.4.8.824');

function createWindow () {
  var mainWindow = new BrowserWindow({
    title: "Spotify Web Player",
    width: 1200, 
    height: 700, 
    show: false,
    backgroundColor: "#121314", 
    icon: __dirname + "/spotify-large-transparent.png", 
    preload: __dirname + "/scripts/main.js",
    webPreferences: {
      "node-integration": false, 
      plugins: true, 
      llowDisplayingInsecureContent: true, 
      allowRunningInsecureContent: true
    }
  });
  mainWindow.loadURL("https://play.spotify.com");
  // Emitted when the window is closed.
  mainWindow.openDevTools();
  mainWindow.onbeforeunload = function(e) {
  	console.log('Spotify has been moved to the background');
  	return false;
  };
  var ipcInstance = require('./ipcInstance')(electron, mainWindow);
  mainWindow.webContents.on('new-window', function(event, url, name, disposition){
   if(!~url.indexOf("facebook.com")) return;
   
      var popup = new BrowserWindow({
        title: name,
        width: 550,
        height: 280,
        preload: __dirname + "/scripts/facebook-popup-window.js",
        show: false, 
        icon: __dirname + "/spotify-large-transparent.png", 
        session: mainWindow.webContents.session,
        webPreferences: {nodeIntegration: false,plugins: true}
      });
      popup.loadURL(url);
      popup.setMenu(null);
      popup.show();
      event.preventDefault();
  });
  mainWindow.on('page-title-updated', function(event){
    event.preventDefault();
  });
  mainWindow.setMenu(null);
  mainWindow.show();
}
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}
console.log("Cache saving to: " + app.getPath('userData') + '/Cache');
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
