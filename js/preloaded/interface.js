/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Interface controller that modifies the webpage to create 
 * non-intrusive advertising and optional themes.
 */

let advertisement_CSS;
let fs = props.fs;
let timeout;
let currentWindowAdvert;
let window_focus = true;
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
let advertHTML = "<div id='window_advert'><div id='window_advert_container'><div id='advert_container'><div id='advert'></div></div></div></div>";
fs.readFile(props.process.cwd() + '/js/preloaded/advertisements.css', (err, data) => {
    advertisement_CSS = data;
});

function injectIframe(obj, CSS){
    //Get the iframe
    var iframe = $(obj);
    //Append CSS to the iframe
    $('body', $(iframe).contents()).prepend(CSS);
}
const ALL_IFRAMES = "div[id*='section-'] iframe[id*='app-spotify:'], #app-player, #context-actions";
let theme = {
	name: props.appSettings.Theme,
	content: null
};
let interface = {
	updateAdvertisements: () => {
		var newWindowAdvert = $("#hpto-container", $('.root iframe').contents());
        if(currentWindowAdvert == null && newWindowAdvert.length > 0) currentWindowAdvert = newWindowAdvert.eq(0).clone();
		interface.load();
	},
	load: () => {
		if (props.appSettings.Theme != theme.name || !theme.content){
			props.fs.readFile(props.process.cwd() + '/js/preloaded/themes/' + props.appSettings.Theme + '-theme.css', (err, themedata) => {
	    		theme.name = props.appSettings.Theme;
	    		theme.content = (themedata ? themedata : "/* The theme " + props.appSettings.Theme + "couldn't be applied */");
	    		interface.load();
	    	});
		} else {
			NavBarCSS = '';
			for (var i in NavBarItems){
				if(props.appSettings.NavBar.hasOwnProperty(i) && NavBarItems.hasOwnProperty(i)){
					NavBarCSS += NavBarItems[i](props.appSettings.NavBar[i])
				}
			}
			//Don't bother with the error, if the theme can't load it will use the default theme instead.
			CSS = '<style class="controlbot">' + advertisement_CSS + theme.content + NavBarCSS + '</style>';
	        $('body').prepend(CSS);
	        injectIframe($(ALL_IFRAMES), CSS);
		}
		
	},
	showAdvert: () => {
		if($('#window_advert').length > 0) $('#window_advert').remove();
		var newWindowAdvert = $("#hpto-container", $('.root iframe').contents());
		//Cannot show advertisements for playlists so don't display them
		if($(newWindowAdvert).find('header').is('.header-playlist')) return
		//Only show advertisements we have whilst we're logged in
		if (newWindowAdvert.length == 0 && currentWindowAdvert == null || $('#login').is(":visible")) return;
		currentWindowAdvert = $((newWindowAdvert.length == 0 ? currentWindowAdvert : newWindowAdvert.eq(0))).clone();
		$(currentWindowAdvert).css("background-position", "center");
		//currentWindowAdvert.children('.hpto-interactive').remove();
		$('body #wrapper').prepend(advertHTML);
		//Add the new advert
		$('#window_advert_container #advert').append(currentWindowAdvert);
		//Add the advert link
		$('#window_advert_container #advert').append("<a href='" + currentWindowAdvert.attr('data-url') + "' target='_blank'></a>");
		$('#window_advert').fadeToggle();
	},
	hideAdvert: () => {
		if($('#window_advert').is(':visible')){
			$('#window_advert').fadeToggle();
			$('#window_advert').remove();
		}
		return false;
	},
	clean: () => {
		$('style.controlbot:not(:first-child)', $(ALL_IFRAMES).contents()).remove();
		$('style.controlbot:not(:first-child)').remove();
	}
};
setInterval(() => {
	interface.clean();
	interface.load();
}, 5e3);
document.addEventListener("visibilitychange", function(){
	window_focus = document.visibilityState == "visible";
	if(!window_focus){
		setTimeout(function(){
			if(!window_focus && !$('#window_advert').is(":visible")) interface.showAdvert();
		}, 2e4);
	} else {
		if($('#window_advert').is(":visible")) { 
			setTimeout(function(){
				if(window_focus && $('#window_advert').is(":visible")) $('#window_advert').click(interface.hideAdvert); 
			}, 500);
		}
	}
}, false);

module.exports = interface;