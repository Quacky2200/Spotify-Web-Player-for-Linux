/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Window menu functionality
 */
let Menu = require('electron').Menu;
function AppMenu(){
	this.menu = Menu.buildFromTemplate([
		{
			label: 'File',
			submenu: [{
				label: 'Search',
				accelerator: 'CmdOrCtrl+S',
				visible: false,
				click: () => app.spotify.do(`
					$('#suggest-area').toggleClass('show');
					$($('.form-control'), $('iframe#suggest').contents()).click();
				`)
			},
			{label: 'Logout', click: () => tray.contextMenu.logout.click()},
			{
				label: 'Quit',
				accelerator: 'CmdOrCtrl+Q',
				click: () => {
					user.LoggedIn = false;
					tray.toggle(false);
					app.quit();
				}
			}]
		},
		{
			label: 'View',
			submenu: [{
				label: 'Toggle Full Screen',
				accelerator: (process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11'),
				click: () => {app.spotify.setFullScreen(!app.spotify.isFullScreen())}
			},
			{
				label: 'Preferences',
				click: () => {app.spotify.showPreferences()}
			}]
		},
		{
			label: 'Controls',
			submenu: [
				{label: 'Play/Pause', accelerator: 'MediaPlayPause', click: () => controller.playPause()},
				{label: 'Next', accelerator: 'MediaNextTrack', click: () => controller.next()},
				{label: 'Previous', accelerator: 'MediaPreviousTrack', click: () => controller.previous()}
			]
		},
		{
			label: 'Help',
			role: 'help',
			submenu: [{
				label: 'About',
				click: () => app.spotify.showAbout()
			}]
		}
	]);
	this.toggle = (toggle) => app.setApplicationMenu((toggle ? this.menu : null))
};
module.exports = new AppMenu();
