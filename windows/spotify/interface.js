/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Interface controller that modifies the webpage to create 
 * non-intrusive advertising and optional themes.
 */
const ALL_IFRAMES = "div[id*='section-'] iframe[id*='app-spotify:'], #app-player, #context-actions";
let fs = props.fs;
let theme = {
	name: props.settings.Theme,
	content: null
};
function NavBarItemCSSToggle(item, attribute, toggle){
	return '#nav-items li #nav-' + item + ' {' + attribute + ': ' + (toggle ? 'block' : 'none') + '}';
}
let NavBarItems = {
	'Follow': (toggle) => {
		return NavBarItemCSSToggle('follow', 'display', toggle);
	},
	'User': (toggle) => {
		return  '#nav-items li.item-profile{ display: ' + (toggle ? 'block' : 'none !important') + '}';
	}, 
	'Radio': (toggle) => {
		return NavBarItemCSSToggle('radio', 'display', toggle);
	},
	'YourMusic': (toggle) => {
		return NavBarItemCSSToggle('collection', 'display', toggle);
	},
	'Browse': (toggle) => {
		return NavBarItemCSSToggle('browse', 'display', toggle);
	},
	'Settings': (toggle) => {
		return NavBarItemCSSToggle('settings', 'display', toggle);
	},
	'Search': (toggle) => {
		return NavBarItemCSSToggle('search', 'display', toggle);
	},
	'Sing': (toggle) => {
		return NavBarItemCSSToggle('sing', 'display', toggle);
	}
}
let base_theme_css;
fs.readFile(`${__dirname}/base-theme.css`, (err, data) => {
    base_theme_css = data;
});

function appendCSSToFrame(obj, CSS){
    //Get the iframe
    var iframe = $(obj);
    //Append CSS to the iframe
    $('body', $(iframe).contents()).prepend(CSS);
}


let interface = {
	updateAdvertisements: () => {
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
		interface.load();
	},
	load: () => {
		if (props.settings.Theme != theme.name || !theme.content){
			props.fs.readFile(`${__dirname}/themes/${props.settings.Theme}-theme.css`, (err, themedata) => {
				if(err) return console.err(`Could not load ${props.settings.Theme} theme!?`);
	    		theme.name = props.settings.Theme;
	    		theme.content = (themedata ? themedata : "/* The theme " + props.settings.Theme + "couldn't be applied */");
	    		interface.load();
	    	});
		} else {
			NavBarCSS = '';
			for (var i in NavBarItems){
				if(props.settings.NavBar.hasOwnProperty(i) && NavBarItems.hasOwnProperty(i)){
					NavBarCSS += NavBarItems[i](props.settings.NavBar[i])
				}
			}
			//Don't bother with the error, if the theme can't load it will use the default theme instead.
			CSS = `<style class="controlbot">${base_theme_css}${theme.content}${NavBarCSS}</style>`;
	        $('body').prepend(CSS);
	        appendCSSToFrame($(ALL_IFRAMES), CSS);
		}
	},
	clean: () => {
		$('style.controlbot:not(:first-child)', $(ALL_IFRAMES).contents()).remove();
		$('style.controlbot:not(:first-child)').remove();
	}
};

module.exports = interface;