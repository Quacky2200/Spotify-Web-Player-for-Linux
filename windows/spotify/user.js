/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * User controller
 */
const {ipcMain} = require('electron');
function User(){
	this.loggedIn = false;
	//Simple functionality
	this.login = () => {
		this.loggedIn = true;
		this.username = null;
		//Hook onto logout and get user info
		ipcMain.once('getUsername', (e, a) => this.username = a);
		ipcMain.once('userLogout', () => this.logout());
		app.spotify.do(`
			$(document).on('click', 'a#logout-settings[href="/logout"]', () => {
				MAIN.send('userLogout', '')
			});

			var {username} = JSON.parse(
				$('script')
					.filter((i,e) => !!~$(e).text().indexOf('var login'))
					.text()
					.match(/({.*})/)[0]
			);
			MAIN.send('getUsername', username);
		`);
	}
	this.logout = () => {
		tray.toggleMediaButtons(false);
		tray.toggle(false);
		appMenu.toggle(false);
		controller.dispose();
		app.settings.lastURL = null;
		app.settings.save();
		this.loggedIn = false;
		if (!app.spotify.isVisible()) app.spotify.show();
		app.spotify.clearCache();
	}
};
module.exports = new User();
