/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify Web Player for Linux
 */
//app from SWP4L App class, electron and electron's BrowserWindow (app !== electron.app)
module.exports = function(app, electron, BrowserWindow){
    const {globalShortcut} = require('electron');
    let _preferencesInstance, _aboutInstance;
    class Preferences extends BrowserWindow{
        constructor(){
            var PREF_WIDTH = 800;
            var PREF_HEIGHT = 450;
            super({
                title: 'Preferences',
                icon: App.icon,
                width: PREF_WIDTH,
                height: PREF_HEIGHT,
                minWidth: PREF_WIDTH,
                minHeight: PREF_HEIGHT,
                maxWidth: PREF_WIDTH,
                maxHeight: PREF_HEIGHT,
                resizable: false,
                show: false,
                webPreferences: {preload: `${__dirname}/preferences/preload.js`}
            });
            this.loadURL(`file://${__dirname}/preferences/preferences.html`);
            this.setMenu(null);
            this.webContents.once('dom-ready', () => {
                this.show();
            });
            var focusKeys = function(){
                var showdevtools = function(){
                    var win = BrowserWindow.getFocusedWindow();
                    if (!win.isDevToolsOpened()){ 
                        win.openDevTools()
                    } else {
                        win.closeDevTools();
                    }
                }
                globalShortcut.register('CommandOrControl+Shift+I', showdevtools);
                globalShortcut.register('F12', showdevtools);
                globalShortcut.register('CommandOrControl+W', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    win.close();
                });
            }
            this.on('focus', focusKeys);
            this.on('blur', () => {
                globalShortcut.unregisterAll(); 
            });
        }
    }
    class About extends BrowserWindow{
        constructor(){
            var ABOUT_WIDTH = 600;
            var ABOUT_HEIGHT = 525;
            super({
                title: 'About',
                icon: App.icon,
                width: ABOUT_WIDTH,
                height: ABOUT_HEIGHT,
                minWidth: ABOUT_WIDTH,
                minHeight: ABOUT_HEIGHT,
                maxWidth: ABOUT_WIDTH,
                maxHeight: ABOUT_HEIGHT,
                resizable: false,
                show: false,
                webPreferences: {preload:`${__dirname}/about/preload.js`}
            });
            this.loadURL(`file://${__dirname}/about/about.html`);
            this.setMenu(null);
            this.webContents.once('dom-ready', () => {
                this.show();
            });
            var focusKeys = function(){
                var showdevtools = function(){
                    var win = BrowserWindow.getFocusedWindow();
                    if (!win.isDevToolsOpened()){ 
                        win.openDevTools()
                    } else {
                        win.closeDevTools();
                    }
                }
                globalShortcut.register('CommandOrControl+Shift+I', showdevtools);
                globalShortcut.register('F12', showdevtools);
                globalShortcut.register('CommandOrControl+W', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    win.close();
                });
            }
            this.on('focus', focusKeys);
            this.on('blur', () => {
                globalShortcut.unregisterAll(); 
            });
        }
    }
    class FacebookPopup extends BrowserWindow{
        constructor(name, url, session){
            super({
                title: name,
                minWidth: 550,
                minHeight: 280,
                width: 550,
                height: 280,
                show: true,
                icon: App.icon,
                session: session,
                webPreferences: {
                  preload: `${__dirname}/facebook/preload.js`,
                  nodeIntegration: false, 
                  plugins: true
                }
            });
            this.loadURL(url);
            this.setMenu(null);
            if(app.settings.ShowDevTools) this.openDevTools();
        }
    }
    class Spotify extends BrowserWindow{
        constructor(){
            super({
                title: "Spotify Web Player",
                icon: App.icon,
                width: 1200,
                height: 700,
                show: true,
                backgroundColor: "#121314",
                minWidth: 800,
                minHeight: 600,
                webPreferences: {
                  nodeIntegration: false,
                  preload: `${__dirname}/spotify/preload.js`,
                  plugins: true,
                  webSecurity: false,
                  allowDisplayingInsecureContent: true,
                  allowRunningInsecureContent: true
                }
            });
            this.on('page-title-updated', function(event){
                event.preventDefault();
            });
            this.on('closed', () => {
                electron.app.quit();
                process.exit(0);
            });
            this.setMenu(null);
            this.webContents.on('new-window', function(event, url, name, disposition){
                if(!~url.indexOf("facebook.com")) return;
                (new FacebookPopup(name, url, this.webContents.session)).show();
                event.preventDefault();
            });
            this.webContents.once('dom-ready', () => {
                this.show();
                if(app.settings.StartHidden) this.minimize();
            });
            this.webContents.session.setUserAgent('Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36');
            this.loadURL((app.settings.lastURL && app.settings.lastURL.indexOf('play.spotify.com') > -1 ? app.settings.lastURL : App.HOST));
            this.on('show', () => {
                if(props.settings.ShowDevTools) this.openDevTools()
            });
            var focusKeys = function(){
                globalShortcut.register('CommandOrControl+S', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.webContents.executeJavaScript('$(\'#suggest-area\').toggleClass(\'show\');');
                });
                globalShortcut.register('CommandOrControl+Shift+P', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.showPreferences();
                });
                globalShortcut.register('F1', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.showAbout();
                });
                globalShortcut.register('Shift+<', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.webContents.executeJavaScript('controller.previous();');
                });
                globalShortcut.register('Shift+>', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.webContents.executeJavaScript('controller.next();');
                });
                var showdevtools = function(){
                    var win = BrowserWindow.getFocusedWindow();
                    if (!win.isDevToolsOpened()){ 
                        win.openDevTools()
                    } else {
                        win.closeDevTools();
                    }
                }
                globalShortcut.register('CommandOrControl+Shift+I', showdevtools);
                globalShortcut.register('F12', showdevtools);
                globalShortcut.register('F11', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.setFullScreen(!this.isFullScreen());
                });
                globalShortcut.register('CommandOrControl+Shift+L', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    if (win == this) this.webContents.executeJavaScript('user.logout()');
                });
                globalShortcut.register('CommandOrControl+W', () => {
                    var win = BrowserWindow.getFocusedWindow();
                    win.close();
                });
            }
            this.on('focus', focusKeys);
            this.on('blur', () => {
                globalShortcut.unregisterAll(); 
            });
        }
        showAbout(){
            if(_aboutInstance) return this.AboutInstance.show();
            _aboutInstance = new About();
            _aboutInstance.on('closed', function(){
                _aboutInstance = null;
            });
        }
        get AboutInstance(){
            return _aboutInstance
        }
        get PreferenceInstance(){
            return _preferencesInstance;
        }
        showPreferences(){
            if(_preferencesInstance) return this.About.show();
            _preferencesInstance = new Preferences();
            _preferencesInstance.on('closed', function(){
                _preferencesInstance = null;
            })
        }
    }
    return Spotify;
};