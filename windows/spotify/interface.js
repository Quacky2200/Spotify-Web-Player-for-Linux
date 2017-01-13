/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Interface controller that modifies the webpage to create
 * non-intrusive advertising and optional themes.
 */

module.exports = (function() {
	//Cache for the loaded CSS
	let CURRENT_THEME = {
		BASETHEME_CACHE: '',
		THEME_CACHE: '',
		THEME_NAME: ''
	};
	//A selector that can find all iframes needed to be styled
	const ALL_IFRAMES = "div[id*='section-'] iframe[id*='app-spotify:'], #app-player, #context-actions";
	//Reduce the prevelence of advertisements
	let tameAdvertisements = function(){
		var frames = $('.root iframe')
		for (var i = 0; i < frames.length; i++) {
			var frame = $(frames[i]).contents();
			var advertContainer = "#header.container,.hpto-container"
			var potentialAdvert = $(advertContainer, frame);
			if ($(potentialAdvert).has("#hpto") && $(`body > *:last-child:not(${advertContainer})`, frame).length == 1){
			    //Place the advert onto the bottom if it's at the top
				var advert = potentialAdvert.detach();
				advert.appendTo($('body', frame));
			}
		}
	}
	//Syncronously read a theme
	let loadTheme = function(name, cb){
		props.getUTF8File(`${props.paths.themes}/${name}-theme.css`, (err, newcss) => {
			if (err) return console.error(err);
			CURRENT_THEME.THEME_CACHE = `/* Theme Styling */\n${newcss}`;
			CURRENT_THEME.THEME_NAME = name;
			cb(err);
		});
	}
	//Behaviour for the interface
	class Interface{
		constructor(){
			//Load the base theme
			props.getUTF8File(`${__dirname}/base-theme.css`, (err, data) => {
				if (err) return;
			   	CURRENT_THEME.BASETHEME_CACHE = `/* Base Theming */\n${data}`;
			})
			//Load current theme into cache
			loadTheme(props.settings.Theme, (err) => {
				if (err) return console.error(err);
				//Apply the interface behaviour
				this.refresh();
			});
		}
		//Set the current theme and automatically try to adapt to it
		set themeName (name) {
			//Check to make sure we can use the theme by checking with those that exist
			//Also check to see that we're not trying to save the same name as before
			//However, make sure to set the theme if it
			if (name == CURRENT_THEME.THEME_NAME || name == this.themeName) return;
			this.isThemeAvailable(name, (err) => {
				if (err) return;
				props.settings.Theme = name;
				props.settings.save();
				loadTheme(name, (err) => {
					this.refresh();
				});
			});
		}
		isThemeAvailable(name, cb){
			props.checkPathExists(this.getThemeFilePath(name), (err) => cb(err));
		}
		getThemeFilePath(name){
			return `${props.paths.themes}/${name}-theme.css`;
		}
		//Get the current theme name
		get themeName () {
			return props.settings.Theme;
		}
		//Get the current theme CSS
		get themeCSS(){
			return CURRENT_THEME.BASETHEME_CACHE + CURRENT_THEME.THEME_CACHE;
		}
		//Get the current NavBar theming
		get navbarCSS(){
			var CSS = `/*NavBar Items*/`;
			var navItems = Object.keys(props.settings.NavBar)
			for (var navItem in navItems){
				if (navItems.hasOwnProperty(navItem)) {
					var property = navItems[navItem].toLowerCase()
					property = (property == 'user' ? 'li.item-profile' : `li #nav-${property.replace('yourmusic', 'collection')}`)
					CSS += `\n#nav-items ${property} {display: ${(props.settings.NavBar[navItems[navItem]] ? 'block' : 'none !important')}}`;
				}
			}
			return CSS;
		}
		//Get all the themes available
		get allThemeNames () {
			//Return a list of all theme names in the themes directory
			//(without -theme.css) and capitalised. (e.g. ['dark', 'light'])
			return props.getFilesInDir(`${__dirname}/themes`).map((e) => {return e.replace('-theme.css','')});
		}
		//Delete any theming present and reload it
		refresh() {
			if (this.themeName != CURRENT_THEME.THEME_NAME){
				loadTheme(this.themeName, (err) => {
					if (err) return console.error(err);
					this.refresh()
				})
			} else {
				tameAdvertisements();
				var interfaceClass = 'controlbot';
				CSS = `<style class="${interfaceClass}">${this.navbarCSS + this.themeCSS}</style>`;
		        $('body').prepend(CSS);
		        $('body', $(ALL_IFRAMES).contents()).prepend(CSS);
		        $('style.controlbot:not(:first-child)', $(ALL_IFRAMES).contents()).remove();
				$('style.controlbot:not(:first-child)').remove();
		        //Always make sure sing button is at the bottom
		        $('li').has('#nav-sing').appendTo('#nav-items');
		        //Hide the ugly flash player box
		        $('#core object').height(0).width(0);
			}
		}
	}
	return new Interface();
})();
