/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Interface controller that modifies the webpage to create
 * non-intrusive advertising and optional themes.
 */

module.exports = (function() {
	var preferencesButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASBAMAAACk4JNkAAAAIVBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmOFP9JAAAACnRSTlMAAxkfPEBRZLT566NXKgAAAFJJREFUCJljYOBYNZkBDEK1Vi0LBQGGVVWrlq8CAQYGzlVLILIMzKGODNiA5aoGoF4QyFq1CKgXBED6IbJeqyZA1YmEGmDRCLIXrBFsL8xi/BoBkA8ma/taJbEAAAAASUVORK5CYII=';
	var infoButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAwFBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkGrGOUAAAAP3RSTlMAAQIEBQYIDBEUFxobHB4pKi4xMzU2ODw9R0pWV1hcXmFihYaIjo+Rl5iam6uvt77Fx9HV2dri5Ovt8/X3+fskIZj9AAAAnUlEQVQYGXXBV1ICUQAAwdl1wRwwYsSEYCCIsoqKc/9b8UJplR92k6ye9wePV5v8aj6ZjVfItmZqE9TvfaLlD4MKjNYJno1OWgdGbyVs+9cx3Br0CExG8GpwTWBWMDd4OS3BbInapAKzgnuTCkwmcGhSgckFFLXaJeqoXw1gQ70hOlP3iI70cxi96yXZ2tRstsOPYvduOq8f2iX/WAAO6Cu/XBWcagAAAABJRU5ErkJggg==';
	var fullscreenButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAwFBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkGrGOUAAAAP3RSTlMAAQIFBwgJCwwNDg8QERITFxgbHiMmKy80OEJDRFlcXV9jZGlse36AgoOFl6WqrbzMztXa4OLk5uvt8fX5+/1tvrB5AAAAsElEQVQYGX3B6TbDYBRA0ZNWiKGooIaY5yF1qVZVOO//Vr7wh2Ute2NrtE6y/GwSmNxU+11YfIiRGpiMC75k92pgo04Kkk6tNoGx+aaTAjpD9fAsOA5Wx85K6Dd+7HJ6ABXk9RLJxksJ2/yS8a+cn7o7cNSUJIPHBbiAusputenBnk77eI4ntXoJrEz1fWBg64pW79UkMLnm29pMDUyeYjgH81V1pwa2IifZmpoEf30CDzAiSWVMIPcAAAAASUVORK5CYII=';
	var exitButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAARVBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkBVNYgAAAAFnRSTlMAAQMECQ8QGR4iJCw8RF+RqKvKzODmqz18nwAAAF1JREFUGFdlz9kSgCAIQFHIwnZb+f9PbUhLlPvknAdAYBXEmDePby4TcyB5oSbm3tIYqasIPBytInTSfTaZ5nTHjobWchbBtZiNgz1C3zXVH/pKROEfnxOsSNBQ2QMFEwvTxy9znQAAAABJRU5ErkJggg==';
	let appPreferencesButton = `
	<div id='infobar' style='position: absolute;bottom: 0;left:0;right:0;width:100%;padding: 10px;'>
		<table style='width: 100%'>
		<tr>
			<td align='center'>
				<a href='javascript:;' class='info appbutton' title='About' style='border:none !important;select:none'><img src='${infoButtonIcon}'/></a>
			</td>
			<td align='center'>
				<a href='javascript:;' class='preferences appbutton' title='Open Preferences' style='border:none !important;'><img src='${preferencesButtonIcon}'/></a>
			</td>
			<td align='center'>
				<a href='javascript:;' class='quit appbutton' title='Quit' style='border:none !important;'><img src='${exitButtonIcon}'/></a>
			</td>
			<td align='center'>
				<a href='javascript:;' class='fullscreen appbutton' title='Go Fullscreen' style='border:none !important;'><img style='transform: rotate(90deg);' src='${fullscreenButtonIcon}'/></a>
			</td>
		</tr>
		</table>
	</div>`;
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
		var frames = $('.root iframe') || 0;
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
		app.getUTF8File(`${app.paths.themes}/${name}-theme.css`, (err, newcss) => {
			if (err) return cb(err);
			CURRENT_THEME.THEME_CACHE = `/* Theme Styling */\n${newcss}`;
			CURRENT_THEME.THEME_NAME = name;
			cb(err);
		});
	}
	//Behaviour for the interface
	class Theme{
		constructor(){
			//Load the base theme
			app.getUTF8File(`${__dirname}/base-theme.css`, (err, data) => {
				if (err) return console.error(err);
				CURRENT_THEME.BASETHEME_CACHE = `/* Base Theming */\n${data}`;
			})
			//Load current theme into cache
			loadTheme(app.settings.Theme, (err) => {
				if (err) return console.error(err);
				//Apply the interface behaviour
				this.refresh();
			});
		}
		//Set the current theme and automatically try to adapt to it
		set name (newstr) {
			//Check to make sure we can use the theme by checking with those that exist
			//Also check to see that we're not trying to save the same name as before
			//However, make sure to set the theme if it
			if (newstr == CURRENT_THEME.THEME_NAME || newstr == this.name) return;
			this.isThemeAvailable(newstr, (err) => {
				if (err) return console.error(err);
				app.settings.Theme = newstr;
				app.settings.save();
				loadTheme(newstr, (err) => {
					this.refresh();
				});
			});
		}
		isThemeAvailable(name, cb){
			app.checkPathExists(this.getThemeFilePath(name), (err) => cb(err));
		}
		getThemeFilePath(name){
			return `${app.paths.themes}/${name}-theme.css`;
		}
		//Get the current theme name
		get name () {
			return app.settings.Theme;
		}
		//Get the current theme CSS
		get themeCSS(){
			return CURRENT_THEME.BASETHEME_CACHE + CURRENT_THEME.THEME_CACHE;
		}
		//Get the current NavBar theming
		get navbarCSS(){
			var CSS = `/*NavBar Items*/`;
			var navItems = Object.keys(app.settings.NavBar)
			for (var navItem in navItems){
				if (navItems.hasOwnProperty(navItem)) {
					var property = navItems[navItem].toLowerCase()
					property = (property == 'user' ? 'li.item-profile' : `li #nav-${property.replace('yourmusic', 'collection')}`)
					CSS += `\n#nav-items ${property} {display: ${(app.settings.NavBar[navItems[navItem]] ? 'block' : 'none !important')}}`;
				}
			}
			return CSS;
		}
		//Get all the themes available
		get allThemeNames () {
			//Return a list of all theme names in the themes directory
			//(without -theme.css) and capitalised. (e.g. ['dark', 'light'])
			return app.getFilesInDir(`${__dirname}/themes`).map((e) => {return e.replace('-theme.css','')});
		}
		//Delete any theming present and reload it
		refresh() {
			if (this.name != CURRENT_THEME.THEME_NAME){
				loadTheme(this.name, (err) => {
					if (err) return console.error(err);
					this.refresh()
				})
			} else {
				//tameAdvertisements();
				var interfaceClass = 'controlbot';
				var CSS = `<style class="${interfaceClass}">${this.navbarCSS + this.themeCSS}</style>`;
				var setTheme = () => {
					$('body').prepend(CSS);
					$('body', $(ALL_IFRAMES).contents()).prepend(CSS);
					$('style.controlbot:not(:first-child)', $(ALL_IFRAMES).contents()).remove();
					$('style.controlbot:not(:first-child)').remove();
				};
				if (app.spotify.AboutInstance) {
					app.spotify.AboutInstance.doFunc(
						{
							CSS: CSS,
							ALL_IFRAMES: ALL_IFRAMES
						},
						setTheme
					);
				}
				if (app.spotify.PreferenceInstance) {
					app.spotify.PreferenceInstance.doFunc(
						{
							CSS: CSS,
							ALL_IFRAMES: ALL_IFRAMES
						},
						setTheme
					);
				}
				app.spotify.doFunc(
					{
						tameAdvertisements: tameAdvertisements,
						CSS: CSS,
						ALL_IFRAMES: ALL_IFRAMES,
						appPreferencesButton: appPreferencesButton,
						setTheme: setTheme
					}, () => {
						setTheme();
						tameAdvertisements();
						//Always make sure sing button is at the bottom
						$('li').has('#nav-update').appendTo('#nav-items');
						$('li').has('#nav-sing').appendTo('#nav-items');
						//Hide the ugly flash player box
						$('#core object').height(0).width(0);

						$('#infobar', $('#app-player').contents()).remove();
						$('body', $('#app-player').contents()).append(appPreferencesButton);
						$('.info.appbutton', $('#app-player').contents()).click(() => {
							MAIN.sendFunc({}, () => app.spotify.showAbout());
						});
						$('.fullscreen.appbutton', $('#app-player').contents()).click(() => {
							MAIN.sendFunc({}, () => app.spotify.setFullScreen(!app.spotify.isFullScreen()));
						});
						$('.preferences.appbutton', $('#app-player').contents()).click(() => {
							MAIN.sendFunc({}, () => app.spotify.showPreferences());
						});
						$('.quit.appbutton', $('#app-player').contents()).click(() => {
							MAIN.sendFunc({}, () => tray.items.quit.click());
						});
					}
				);
			}
		}
	}
	return new Theme();
})();
