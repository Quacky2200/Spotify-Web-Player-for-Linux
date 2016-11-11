/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * User information/controller
 */
//Grab a hook of the window to prevent it going anywhere
global.windowHook = false;
/**
 * When the user clicks on the logout button in the Web Player
 */
$(document).on('click', 'a#logout-settings[href="/logout"]', function(e){
	logoutUser();
	//e.preventDefault();
});
// var config = JSON.parse(
// 	$('script').filter(
// 		function(){
// 			return $(this).text().indexOf('var login = new Spotify.Web.Login') > -1
// 		}
// 	)
// 	.text()
// 	.match(/(\{.*\})/)[0] //Get the JSON out of the script text
// );
module.exports = {
	/* 
	 * Returns if a user is logged into Spotify
	 * @returns {Boolean}
	 */
	isLoggedIn: function(){
		return !$('#login').is(":visible");
	},
	/**
	 * Logout the Spotify user by removing all cache
	 */
	logout: function(){
		tray.toggleMediaButtons(false);
	    tray.toggleTray(false);
	    appMenu.toggleMenu(false);
	    if (dbus) dbus.interpreter.clearHandles();
	    props.appSettings.lastURL = null;
	    props.appSettings.save();
		windowHook = false;
		if (!props.mainWindow.isVisible()) props.mainWindow.show();
		props.clearCache();
	}
};