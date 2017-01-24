/**
 * @author Matthew James <Quacky2200@hotmail.com>
 * Spotify new preload
 */
require('electron-cookies');
window.MAIN = require('electron').ipcRenderer;
MAIN.sendFunc = (variables, func) => {
	var vars = "";
	for (var curvar in variables){
		if (variables.hasOwnProperty(curvar)) {
			if (typeof(variables[curvar]) == 'function') {
				vars += `var ${curvar} = ${variables[curvar].toString()};\n`;
			} else if (typeof(variables[curvar]) == 'object'){
				vars += `var ${curvar} = ${JSON.stringify(variables[curvar])};\n`;
			} else if (typeof(variables[curvar]) == 'string'){
				vars += `var ${curvar} = \`${variables[curvar]}\`;\n`;
			} else {
				vars += `var ${curvar} = ${variables[curvar]};\n`;
			}
		}
	}
	vars += `\n(${func.toString()})();\n`;
	MAIN.send('message-for-Spotify', `:eval('${vars}')`);
}
global.require = require;
//If the window is a pop-up window
if (window.opener){
	var remote = require('electron').remote;
	var popupWindow = remote.getCurrentWindow();
	//Set our default properties for the popup window and escape.
	popupWindow.setSize(800, 600);
	popupWindow.setMenu(null);
	popupWindow.show();
	return;
}
document.addEventListener("visibilitychange", function(){
	MAIN.send('message', ':eval(\'tray.toggle(app.settings.ShowTray);\')')
});
function checkForUpdates(){
	$.getJSON("https://api.github.com/repos/Quacky2200/Spotify-Web-Player-for-Linux/releases", (data) => {
		var updateAvailable = (() => {
			var version_update_tag = data[0].tag_name.match(/([0-9\.]+)/)[1].split('.');
			var version_now_tag = navigator.userAgent.match(/(?:spotifywebplayer\/([0-9\.]+))/)[1].split('.');
			for(var num in version_update_tag){
				if(parseInt(version_update_tag[num]) > parseInt(version_now_tag[num])) {
					return true;
				} else if (parseInt(version_update_tag[num]) < parseInt(version_now_tag[num])){
					return false
				}
			}
		})();
		if(updateAvailable){
			var updateAvailableButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAA21BMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABm7yWAAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfgCRsAHhHuaRzgAAAD9ElEQVR42u2dvY7aQBhF50oUrqjcrKjpqFZCgnbe/6GiREqyq7AbsOf7m3vPA4DPsTFmZmxaE0IIIYQQQgghhBBCCCGEEEIIIYQI4oBPHBZa9Y8cmeUJIqx4lhnt3/ASp8n0sQFy/YkSYAcT6J+xD+bdP8HpEENg9wdWbv2qBwHAXQCDOdfSv2A8TF/+1QvACHb/KgUA7gIAd4EjuAu8A9wFzP3TXBFdrp+G9d38MxwCX47uLsD0BW5IQJj9HTlYZz2/pT4EkApyffeRUuSDXN+1ALgDIC3s/mD39yhwB3eAFaAuAHAHyO//ZxCC1d/0EFjJA9wB7gIgDwDyAGX8jdYVoxAKQO4Pdn+Lk0CtAGD3VwB2fwVYyP1HjwnUCwB2fwVgHAYxCwAF4A5wYw/gs0EKoABZA6zsAaAAFQMc2AM0BRjFpWaAy7AA16InQST7BPgHGLV4vm6AQQdB5QBDFo+XDjDiICgeAPQBQB9g74mgfgBc2QPs+Bic/bYh4Qjhu+smpBsjPTlvgXGAV+8tX913gfUw+Us/D28Bx2CmiYKQ988zVRL09mkmizBvAATqVwmAuQOEbkSOOfjEl+PxAToIAiDMP0uAc5R/lgBfbccClgDIeiEaGwBEAZD0KiwyALgCwGoCvGwAsAW4JLsE81+PG7IQNm0AEAZY81yABS1JV4Ac119xAQ7sAWDwrm/NlJ4+AHohf5gcdr2O/++TAIoU6EYngeGv28v4w+jE26v4WwWwKGAzXPvzlU3uiO01/GF36dFL+P/6GkCBAnbTFYYXn72CPyz/9qUX8Ifpr4+e3982wJgCttOVxr8/e3Z/6wD7C5hP11u/Qc/tD/sH5PbU/nAYguqZ/T0CbC/g4O8SYGsBD3+fANsKuPg7BdhSwMffK8DrBZz8D24TET2lPxa/mZie0R+eU1E9ob9rgOcL+Pn7Bni2gKO/c4DnCnj6H8c9HGVYAU9/uK0OfL6Aq7/htMDWAr7+EQG+L+Dsf4wI8F0BZ3+zqdGtBbz9YXSD+NYC7v5oQYfA4wJR/iGPC+4Z/CMD/FsgwP/kvE782wIB/ghanPmwQIR/dICPBWL9wx6b30P9Q9bKPy4Q7h/33Pwe5x9zv8yjAhn8A/86oQf5o2UpkMOfLsCpkRdo5AHib1aKZWUPkOF+tXz+PAUaeYBzIy+Q57bVfP4MBf4zM3kn9w+ZJUnlP/mHIPRhqlX8Jy4Q+Djt5Nc/FN8FLy7UZfefrcCW/5qi3v1zJThuvmOJevfPkmD3favk+rUTDHt6QUn7UxvJnXbn+z9xM/Jrb4JfSYbyf58+fE2pfliaEEIIIYQQQgghhBBCCCGEEEIIIcRjfgDj86cKVDgsEwAAAABJRU5ErkJggg==';
			button = `
			<li>
			<a id="nav-update" style='padding: 5px' class="standard-menu-item" data-href="${data[0].html_url}">
			<img src='${updateAvailableButtonIcon}' style='padding: 5px;height: 70%;margin: auto;display: block;opacity: 0.4;'/>
			<span class="nav-text">Update</span>
			</a>
			</li>
			<style>
			#nav-update.active img{
				opacity: 0.9;
			}
			</style>
			`;
			$('#main-nav #nav-items').append(button);
			$('#nav-update').click(function(){
				MAIN.send('message', `:eval('app.openLink(\'${$(this).attr('data-href')}\')')`)
			});
		}
	});
}
document.onreadystatechange = function() {
	MAIN.send('message-for-Spotify', `:eval('theme.refresh()')`);
	window.$ = window.jQuery = require('./jquery');
	if (document.readyState !== 'complete') return;
	MAIN.send('message-for-Spotify', `:eval('app.spotify.hasRadio = ${!~$('#nav-items').has('#nav-radio')}')`);
	window.addEventListener('message', function(e){
		if (typeof(e.data) == 'string' &&
			e.data.match(/(USER_ACTIVE|spb-connected|user:impression)/)
		) {
			MAIN.send('message-for-Spotify', e.data);
		}
	});
	MAIN.send('message-for-Spotify', 'user:impression player_loaded');
	//Make sure we don't get stuck when we cannot connect to Spotify
	setInterval(() => {
		if($('#modal-notification-area').is(':visible')) {
			window.location.reload();
		}
	}, 10000);
	checkForUpdates();
	setInterval(checkForUpdates, 2.16e+7)
}
