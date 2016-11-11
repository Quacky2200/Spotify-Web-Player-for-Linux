const OS = require('os');
const FS = require('fs');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const MXM = require('node-unofficialmxm');
App = (function(){
	let Spotify;
	let _spotify;
	class App {
		constructor(){
			this.settings = require('./app-settings')(
		        `${App.paths.home}/preferences.json`,
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
		    this.settings.open((err, data) => { 
		    	if(err){
					console.log("The settings are corrupt, cannot continue.");
					process.exit(-1);
		    	}
			});
			require('./plugins')(app);
			//Set Cache
			app.setPath('userData', App.paths.home);
			app.setPath('userCache', `${App.paths.home}/Cache`);
			//Set the name of the application
			app.setName(App.names.process);
			//Set the process name
			process.title = App.names.process;
			//When Electron has loaded, start opening the window.
			app.on('ready', () => {
				Spotify = require('./windows/windows')(this, electron, BrowserWindow);
				_spotify = new Spotify();
				//Spotify.showAbout();
				_spotify.openDevTools();
			});
			app.on('quit', () => {
			    console.log('Exiting...');
			});
			//Make sure we only run one instance of the application
			var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
			    // Someone tried to run a second instance, we should focus our window.
			    _spotify;
			    if (_spotify) {
			        if (_spotify.isMinimized()) _spotify.restore();
			        _spotify.show();
			        _spotify.focus();
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
			    _spotify.show();
			    _spotify.unmaximize();
			});
		}
		get VERSION(){
			return electron.app.getVersion();
		}
		static get names(){
			return {
				process: 'spotifywebplayer',
				service: 'Spotify Web Player',
				project: 'Spotify Web Player for Linux'
			}
		}
		get names(){
			return App.names;
		}
		static get HOST(){
			return 'https://play.spotify.com';
		}
		get HOST(){
			return App.HOST;
		}
		get electron(){
			return electron;
		}
		get globalShortcut(){
			return electron.globalShortcut;
		}
		get mxm(){
			return MXM;
		}
		get process(){
			return process;
		}
		get console(){
			return console;
		}
		static get paths(){
			var USER_PATH = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
			var HOME_PATH = `${USER_PATH}/.spotifywebplayer`;
			return {
				user: USER_PATH,
				home: HOME_PATH,
				caches: {
					lyrics: `${HOME_PATH}/LyricCache`,
					albums: `${HOME_PATH}/AlbumCache`
				},
				icons: `${__dirname}/icons`
			}
		}
		get paths(){
			return App.paths;
		}
		static get icon(){
			return `${App.paths.icons}/spotify.png`;
		}
		get icon(){
			return App.icon;
		}
		get os(){
			return OS;
		}
		static get HOSTNAME(){
			return os.hostname();
		}
		get HOSTNAME(){
			return App.HOSTNAME;
		}
		static get FILEPATH(){
			process.cwd();
		}
		get FILEPATH(){
			App.FILEPATH;
		}
		get fs(){
			return FS;
		}
		get spotify(){
			return _spotify;
		}
	}
	return App;
})();

//Let's load up our application
if(typeof(electron) != 'object' && !electron.app){
	console.log('The Electron installation cannot be found. Aborting...');
	process.exit(-1);
}
const SWP4L = new App();
//Make our application backend available on the renderer
//(i.e. props for properties)
global.props = SWP4L;