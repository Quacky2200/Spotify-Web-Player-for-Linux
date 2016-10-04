let mainWindow;
module.exports = function(electron){
    const BrowserWindow = electron.BrowserWindow;
    const os = require('os');
    const fs = require('fs');
    var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    var appSettings = require('./app-settings')(
        home + '/.spotifywebplayer/preferences.json',
        {
            CloseToTray: true,
            CloseToController: false,
            ShowApplicationMenu: true,
            ShowTray: true,
            TrayIcon: 'lime',
            Notifications: {
                ShowTrackChange: true,
                ShowPlaybackPlaying: true,
                ShowPlaybackPaused: true,
                ShowPlaybackStopped: true,
                OnlyWhenFocused: true
            },
            NavBar: {
                Follow: true,
                User: true,
                Radio: true,
                YourMusic: true,
                Browse: true,
                Settings: true,
                Search: true,
                Sing: true
            },
            AlbumCacheDisabled: false,
            Theme: 'dark',
            StartOnLogin: false,
            StartHidden: false,
            ShowDevTools: false,
            lastURL: null
        }
    );
    //Global properties that may be required by the web application
    const props = {
        PROC_NAME: 'spotifywebplayer',
        NAME: 'Spotify Web Player',
        fs: fs,
        os: os,
        electron: electron,
        lyricCache: home + '/.spotifywebplayer/LyricCache',
        albumCache: home + '/.spotifywebplayer/AlbumCache',
        process: process,
        console: console,
        APP_ICON: __dirname + '/../../icons/spotify.png',
        APP_ICON_DIR: __dirname + '/../../icons',
        userhome: home,
        appSettings: appSettings,
        APP_DIR: home + '/.spotifywebplayer',
        HOST: 'https://play.spotify.com',
        VERSION: electron.app.getVersion(),
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
                  preload: __dirname + "/../preloaded/facebook-popup-window.js",
                  nodeIntegration: false, 
                  plugins: true
                }
            });
            popupWindow.loadURL(url);
            popupWindow.setMenu(null);
            if(props.appSettings.ShowDevTools) popupWindow.openDevTools();
            return popupWindow;
        },
        aboutWindow: function(){
            var width = 600;
            var height = 520;
            var aboutWindow = new BrowserWindow({
                title: 'About',
                icon: global.props.APP_ICON,
                width: width,
                height: height,
                minWidth: width,
                minHeight: height,
                maxWidth: width,
                maxHeight: height,
                resizable: false,
                show: false,
                webPreferences: {preload: __dirname + '/About/preload.js'}
            });
            aboutWindow.loadURL('file://' + __dirname + '/About/about.html');
            aboutWindow.setMenu(null);
            return aboutWindow;
        },
        preferencesWindow: function(){
            var width = 800;
            var height = 450;
            preferencesWindow = new BrowserWindow({
                title: 'Preferences',
                icon: global.props.APP_ICON,
                width: width,
                height: height,
                minWidth: width,
                minHeight: height,
                maxWidth: width,
                maxHeight: height,
                resizable: false,
                show: false,
                webPreferences: {preload: __dirname + '/Preferences/preload.js'}
            });
            preferencesWindow.loadURL('file://' + __dirname + '/Preferences/preferences.html');
            return preferencesWindow;
        },
        mainWindow: function(){
            mainWindow = new BrowserWindow({
                title: global.props.NAME,
                icon: global.props.APP_ICON,
                width: 1200,
                height: 700,
                show: false,
                backgroundColor: "#121314",
                minWidth: 800,
                minHeight: 600,
                webPreferences: {
                  nodeIntegration: false,
                  preload: __dirname + "/../preloaded/main.js",
                  plugins: true,
                  webSecurity: false,
                  allowDisplayingInsecureContent: true,
                  allowRunningInsecureContent: true,
                }
            });
            appSettings.open((err, data) => { 
                mainWindow.webContents.once('dom-ready', () => {
                    mainWindow.show();
                    if(appSettings.StartHidden) mainWindow.minimize();
                });
                mainWindow.loadURL((appSettings.lastURL && appSettings.lastURL.indexOf('play.spotify.com') > -1 ? appSettings.lastURL : props.HOST));
                if (appSettings.ShowDevTools) mainWindow.openDevTools();
            });
            mainWindow.on('page-title-updated', function(event){
                event.preventDefault();
            });
            mainWindow.on('closed', () => {
                console.log('I think I should quit?');
                electron.app.quit();
                process.exit(0);
            });
            mainWindow.setMenu(null);
            mainWindow.webContents.on('new-window', function(event, url, name, disposition){
                if(!~url.indexOf("facebook.com")) return;
                global.props.getNewFacebookPopupWindow(name, url);
                event.preventDefault();
            });
            return mainWindow;
        }
    };
    return props;
};
