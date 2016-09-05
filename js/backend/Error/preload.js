/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Error loading script
 */
var errorpath = __dirname + '/error.html';
props.fs.readFile(errorpath, (err, data) => {
    var newDoc = document.open("text/html", "replace");
	newDoc.write(data);
	document.onreadystatechange = function(){
		window.$ = window.jQuery = require('../../preloaded/jquery');
		let interface = require('../../preloaded/interface');
		interface.load();
		props.fs.readFile(__dirname + '/../About/Spotify_Logo_RGB_White.png', {encoding: 'base64'}, (err, data) => {
			if(err) console.log(err);
			$('#logo').attr('src', 'data:image/png;base64,' + data);
		});
		$('#app_title_and_version').html(props.NAME + ' for Linux (v' + props.electron.app.getVersion() + ')');
		var testInternet = setInterval(() => {
			if (navigator.onLine){
				window.location = (
	                props.appSettings.lastURL && props.appSettings.lastURL.indexOf('play.spotify.com') > -1 ?
	                props.appSettings.lastURL : 
	                global.props.HOST
        		);
			}
		}, 1500);
	}
	newDoc.close();
});