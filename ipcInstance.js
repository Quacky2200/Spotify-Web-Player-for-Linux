//ipcInstance


module.exports = function(electron, mainWindow){
	const ipcMain = electron.ipcMain;
	const Tray = electron.Tray;
	const Menu = electron.Menu;
	var Player = require('mpris-service');

	function playpause(){
		mainWindow.webContents.send("message", {operation: "playpause", args: null})
		return "Playing";
	}
	//Player actions for dbus, and tray icon context menu
	var playerActions = {
		playpause: playpause,
		play: playpause,
		pause: playpause,
		next: function(){
			mainWindow.webContents.send("message", {operation: "next", args: null})
		},
		previous: function(){
			mainWindow.webContents.send("message", {operation: "previous", args: null})
		},
		quit: function(){process.exit(0);}
	};
	//Add mpris dbus instance
	var player = Player({
	    name: 'spotifywebplayer',
	    identity: 'Spotify Web Player for Linux',
	    supportedUriSchemes: ['file'],
	    supportedMimeTypes: ['audio/mpeg', 'application/ogg'],
	    supportedInterfaces: ['player']
	 });
	for (var action in playerActions){
		player.on(action, playerActions[action]);
	}
	
	function logoutUser(){
		mainWindow.webContents.send("message", {operation: 'updateRefreshLock', args: false});
		mainWindow.loadURL("about:blank");
    	mainWindow.webContents.session.clearCache(function(){
    		mainWindow.webContents.session.clearStorageData(function(){
    			console.log("Cleared session and cache.");
    			contextLoggedInMenu.items[0].enabled = false;
	    		contextLoggedInMenu.items[1].enabled = false;
	    		contextLoggedInMenu.items[2].enabled = false;
    			appIcon.destroy();
    			appIcon = null;
    			mainWindow.loadURL("https://play.spotify.com/");
    		});
    	});
	}

	var contextLoggedInMenu = Menu.buildFromTemplate([
        {label: "Play/Pause", enabled: false, click:playerActions['playpause']},
        {label: "Previous", enabled: false, click:playerActions['previous']},
        {label: "Next", enabled: false, click:playerActions['next']},
        {type:'separator'},
        {label: "Spotify", click: function(){mainWindow.show()}},
        {label: "Notifications", type:"radio", checked: true, click:function(){
        	notifications = (contextLoggedInMenu.items[5].checked ? false : true);
        	contextLoggedInMenu.items[5].checked = notifications;
        	mainWindow.webContents.send("message", {operation: "updateNotifications", arg: notifications});
        	appIcon.setContextMenu(contextLoggedInMenu);
        }},
        {label: "Logout", click: logoutUser},
        {label: "Quit", click:playerActions['quit']}
 	]);

 	var appIcon;
 	var notifications = true;
 	//e - Event, o - Object/Args
	var ipcMessageOperations = {
	    FBLoginSuccess: function(e, obj){
	    	//This is to redirect our FB login
		    mainWindow.loadURL(obj.redirectURI);
		    mainWindow.webContents.once('dom-ready', function(){
		   		mainWindow.loadURL('https://play.spotify.com/?electron_logged_in=true');
		    	mainWindow.webContents.once('dom-ready', function(){
		    		mainWindow.webContents.executeJavaScript("document.getElementById('fb-signup-btn').click();");
		    		e.sender.send('message', {operation: "FBLoginFinished", args: null});
		    	});
		    });
		    //setTimeout(function(){}, 2000);
	    },
	    onLogoutClearCache: function(e, obj){
	    	logoutUser();
	    },
	    updatePlayerMetadata: function(e, obj){
	    	player.metadata = obj;
	    },
	    updatePlayerStatus: function(e, obj){
	    	if (obj == "Playing"){
	    		contextLoggedInMenu.items[0].enabled = true;
	    		contextLoggedInMenu.items[1].enabled = true;
	    		contextLoggedInMenu.items[2].enabled = true;
	    		appIcon.setContextMenu(contextLoggedInMenu);
	    	}
	    	player.playbackStatus = obj;
	    },
	    keepAliveMinimize: function(e, obj){
	    	//Client JS manages the browser prevention
	    	mainWindow.hide();
	    }, 
	    updateLoginStatus: function(e, isLoggedIn){
	    	if(isLoggedIn) {
	    		if(!appIcon) appIcon = new Tray(__dirname + "/spotify-large-transparent.png");
	    		contextLoggedInMenu.items[6].enabled = isLoggedIn;
	    		appIcon.setContextMenu(contextLoggedInMenu);
	    	} else if (!isLoggedIn && appIcon){
	    		appIcon.destroy();
	    		appIcon = null;
	    	}
	    	mainWindow.webContents.send("message", {operation: 'updateRefreshLock', args: isLoggedIn});
	    	//TODO: Check if we're actually logged in and make sure we're at the home/login page.
	    }
  	}

  	ipcMain.on('message', function(event, obj){
  		if(obj.operation in ipcMessageOperations){
  			console.log("Received message operation (%s)", obj.operation);
  			ipcMessageOperations[obj.operation](event, obj.args);
  		} else {
  			throw Error("Message operation has no handler.");
  		}
  	});

}
