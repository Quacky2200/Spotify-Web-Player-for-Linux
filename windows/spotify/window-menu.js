function toggleMenu(toggle){
	let Menu = props.electron.Menu;
	if(toggle && !toggleMenu.menu){
		toggleMenu.menu = Menu.buildFromTemplate([
			{
				label: 'File',
				submenu: [
					{
						label: 'Search',
						accelerator: 'CmdOrCtrl+S',
						visible: false,
						click: () => {
							$('#suggest-area').toggleClass('show');
							$($('.form-control'), $('iframe#suggest').contents()).click();
						}
					},
					{
						label: 'Logout',
						click: () => {
							user.logout();
						}
					},
					{
						label: 'Quit',
						accelerator: 'CmdOrCtrl+Q',
						click: () => {
							tray.toggleTray(false);
							windowHook = false;
							props.electron.app.quit();
							props.process.exit(0);
						}
					}
				]
			},
			{
				label: 'View',
				submenu: [
					{
						label: 'Toggle Full Screen',
						accelerator: (process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11'),
						click: () => {props.spotify.setFullScreen(!props.spotify.isFullScreen())}
					},
					{
						label: 'Preferences',
						click: () => {props.spotify.showPreferences()}
					}
				]
			},
			{
				label: 'Controls',
				submenu: [
					{label: 'Play/Pause', accelerator: 'MediaPlayPause', click: () => {
						controller.playPause()
					}},
					{label: 'Next', accelerator: 'MediaNextTrack', click: () => {
						controller.next() 
					}},
					{label: 'Previous', accelerator: 'MediaPreviousTrack', click: () => {
						controller.previous() 
					}}
				]
			},
			{
				label: 'Help',
				role: 'help',
				submenu: [{
					label: 'About', 
					click: () => {
						props.spotify.showAbout();
					}
				}]
			}
		]);
		props.electron.app.setApplicationMenu(toggleMenu.menu);
	} else if(!toggle && toggleMenu.menu){
		props.electron.app.setApplicationMenu(null);
		toggleMenu.menu = null;
	}
}
module.exports = {toggleMenu:toggleMenu};