/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Preload script for about window
 */
global.remote = require('electron').remote;
let props = remote.getGlobal('props');
global.props = props;

document.onreadystatechange = function(){
	window.$ = window.jQuery = require('../spotify/jquery');
	interface = require('../spotify/interface');
  	$('#logo').attr('src', __dirname + '/Spotify_Logo_RGB_White.png');
	$('#app_title_and_version').html(props.names.project + '<br>v' + props.electron.app.getVersion());

	libraries = {
		'Support Homepage': 'https://github.com/Quacky2200/Spotify-Web-Player-for-Linux',
		'mpris-service': 'https://github.com/emersion/mpris-service',
		'freedesktop-notificatons': 'https://github.com/cronvel/freedesktop-notifications',
		'Light theme inspired from': 'https://github.com/devinhalladay/spotio',
		'Electron': 'https://github.com/electron/electron/',
		'Node.JS': 'http://nodejs.org/',
		'Spotify': 'http://spotify.com/'
	};
	html = '';
	function click(){
		props.electron.shell.openExternal($(this).attr('href'));
		return false;
	}
	for (var library in libraries){
		html += `<p><b>${library}</b><br/><a href='${libraries[library]}'>${libraries[library]}<a/></p>`;
	}
	$('#libraries').html(html);
	//For all clicks, open externally
	$('a').click(click);
};

