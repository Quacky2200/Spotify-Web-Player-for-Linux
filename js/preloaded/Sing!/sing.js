//Elements
let ui, navButton, timeButton, timer;
//Make lyrics cache if it doesn't exist
props.fs.access(props.lyricCache, props.fs.F_OK, (err) => {
	if (err){
		props.fs.mkdir(props.lyricCache, (err) => {
			if (err) console.log(err);
		});
	}
});
//Load UI Element first
props.fs.readFile(__dirname + '/ui.html', function(err, data){
	if(err) console.log(err);
	ui = data.toString();
	//Load the timer icon
	props.fs.readFile(__dirname + '/time.png', {encoding: 'base64'}, function(err, data){
		if(err) console.log(err);
		$('#sing-ui #timeButton').attr('src', 'data:image/png;base64,' + data);
		$('#sing-ui #timeButton').click(function(){
			toggleLyricScroller(!$(this).is('active'));
			$(this).toggleClass('active');
		});
	});
	//Read the microphone icon and add as a navbar icon
	props.fs.readFile(__dirname + '/microphone.png', {encoding: 'base64'}, function(err, data){
	  if (err) console.err(err);
	  button = `
	  	<li>
			<a id="nav-sing" style='padding: 5px' class="standard-menu-item disabled">
			    <img src='data:image/png;base64,` + data + `' style='padding: 5px;height: 32px;margin: auto;display: block;opacity: 0.4;'/>
				<span class="nav-text">Sing!</span>
			</a>
		</li>
		<style>
		#nav-sing.disabled{
			pointer-events: none;
    		opacity: 0.2;
		}
		#nav-sing.active img{
			opacity: 0.9;
		}
		</style>
	  	`;
	    $('#main-nav #nav-items').append(button);
	    $('#nav-sing').click(()=>{
	    	if($('#sing-ui').length == 0){
	    		$('#wrapper').prepend(ui);
	    		$('#nav-sing').addClass('active');
	    		singFuncs.load(controller.getTrackUri(), controller.getTrackName(), controller.getArtist());
	    	} else {
	    		singFuncs.toggleUI(!singFuncs.isOpen());
	    		singFuncs.load(controller.getTrackUri(), controller.getTrackName(), controller.getArtist());
	    	}
	    });
	});
});
function toggleLyricScroller(toggle){
	if(toggle && !timer){
		timer = setInterval(() => {
			var currentTime = $('#bar-inner', $('#app-player').contents()).outerWidth();
			var fullTime = $('#bar-outer', $('#app-player').contents()).outerWidth();
			$('#sing-ui').scrollTop((currentTime / fullTime) * $('#sing-ui').outerHeight());
		}, 4000);
	} else if(!toggle && timer) {
		clearInterval(timer);
	}
}
const singFuncs = {
	load: (trackURI, trackName, trackArtist) => {
		//alert('TrackURI: ' + trackURI + ' \nName: ' + trackName + '\nArtist: ' + trackArtist);
		if (singFuncs.isOpen() && props.appSettings.NavBar.Sing && $('#sing-ui').attr('data-ref') != trackURI && trackURI && trackName && trackArtist){
			singFuncs.showLoader();
			var filepath = props.lyricCache + '/' + trackArtist.split(',')[0] + '-' + trackName.match(/(\w+)/g).join('-') + '.html';
			$('#sing-ui').attr('data-ref', trackURI);
			props.fs.access(filepath, props.fs.F_OK, (err, data) => {
				if (err){
					//Either exists or corrupt, let's get it again
					props.mxm(trackName, trackArtist, (err, result) => {
						singFuncs.hideLoader();
						if (err){
							console.log(err);
							$('#sing-ui #sing-container').html("<main class='centerstage'><div><h1>Sorry, I couldn't find the lyrics to this song.</h1></div></main>");
						} else {
							lyrics = "<div id='lyrics'><h1>" + result.title + "</h1><h2>" + result.artist + "</h2><div>" + result.lyrics.replace(/\n/g, '<br/>') + "</div><br/><br/><p>Lyrics from MusixMatch, using <a href='https://github.com/Quacky2200/node-unofficialmxm'>node-unofficialmxm</a></p></div>";
							props.fs.writeFile(filepath, lyrics, (err) => {
								if (err) console.log(err);
								$('#sing-ui #sing-container').html(lyrics);
							});
						}
					});
				} else {
					props.fs.readFile(filepath, (error, data) => {
						singFuncs.hideLoader();
						if (err){
							$('#sing-ui #sing-container').html("<main class='centerstage'><div><h1>Sorry, I couldn't get the lyrics to this song.</h1></div></main>");
						} else {
							$('#sing-ui #sing-container').html(data.toString());
						}
					});
				}
			});
		}
	},
	hide: () => {
		if(timer) clearInterval(timer);
		if (singFuncs.isOpen()) $('#sing-ui').fadeToggle(() => {
			$('#nav-sing').toggleClass('active');
		});
	},
	show: () => {
		if (!singFuncs.isOpen()) $('#sing-ui').fadeToggle(() => {
			$('#nav-sing').toggleClass('active');
		});
	},
	enableButton: () => {
		$('#nav-sing').removeClass('disabled');
	},
	toggleUI: (toggle) => {
		if(toggle) {
			singFuncs.show();
		} else {
			singFuncs.hide();
		}
	},
	isOpen: () => {
		return $('#sing-ui').is(':visible');
	},
	showLoader: () => {
		if(timer) clearInterval(timer);
		$('#sing-ui #sing-container').html(`<main class='centerstage'><div><div class='loader'></div></div></main>`);
	},
	hideLoader: () => {
		$('#sing-ui #sing-container').removeClass('.loader');
		if($('#sing-ui #sing-container #lyrics')){
			toggleLyricScroller($(this).is('active'));
		}
	}
};
module.exports = singFuncs;