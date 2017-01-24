let mxm = require('node-unofficialmxm');
let sync = require('./sync');
let fs = require('fs');
const Sing = function(){
	this.upload = sync.upload;
	this.lastTrackURI = null;
	this._isUIShowing = false;
	//Load the UI
	this.init = () => {
		this.lastTrackURI = null;
		this._isUIShowing = false;
		app.getUTF8File(`${__dirname}/ui.html`, function(err, data){
			if(err) return console.error(err);
			ui = data.toString();
			//Read the microphone icon and add as a navbar icon
			app.getImageFileAsBase64(__dirname + '/microphone.png', function(err, data){
				if (err) return console.err(err);
				button = `
				<li>
				<a id="nav-sing" style='padding: 5px' class="standard-menu-item disabled">
				<img src='data:image/png;base64,${data}' style='padding: 5px;height: 60%;margin: auto;display: block;opacity: 0.4;'/>
				<span class="nav-text">Sing!</span>
				</a>
				</li>
				<style>
				#nav-sing.disabled{pointer-events: none;opacity: 0.2;}
				#nav-sing.active img{opacity: 0.9;}
				</style>
				`;
				app.spotify.doFunc({button: button, ui: ui}, () => {
					if ($('#nav-sing').length == 0) {
						$('#main-nav #nav-items').append(button);
						$('#wrapper').prepend(ui);
						$('#nav-sing').click(() => {
							var visible = $('#sing-ui').is('.active');
							$('#sing-ui').toggleClass('active', !visible);
							$('#nav-sing').toggleClass('active', !visible);
							MAIN.sendFunc({v: !visible}, () => sing._isUIShowing = v);
							if (!visible) MAIN.sendFunc({}, () => {
								sing.load(controller.track.id, controller.track.name, controller.track.artists)
							});
						});
						$('#sing-ui #overlaydialog a:contains(\'Yes\')').click(() => {
							//Update file and send online
							MAIN.sendFunc({obj: obj}, () => {
								obj.username = user.username;
								obj.type = 'sync';
								app.createUTF8File(`${app.paths.caches.lyrics}/${obj.uri}.json`, JSON.stringify(obj), (err) => {
									if(err) console.error(err);
									sing.upload(obj.uri, obj.lyrics, obj.sync, obj.username, (err, data) => {
										app.spotify.doFunc({}, () => {
											$('#sing-ui #overlaydialog').toggleClass('active', false);
											$('#sing-ui #overlaydialog a:contains(\'Save\')').off();
											$('#sing-sync').click();
										});
										sing.lastTrackURI = null;
									});
								});
							});
						});
						$('#sing-ui #overlaydialog a:contains(\'No\')').click(() => {
							//Put everything back to way it was
							$('#sing-ui #overlaydialog').toggleClass('active', false);
							$('#sing-sync').click();
						});
						$('a[id*=\'nav-\']').not('#nav-sing').click(function(){
							$('#sing-ui').fadeOut(function() {
								var v = $(this).is(':visible');
								$('#nav-sing').toggleClass('active', v);
								MAIN.sendFunc({v:v}, () => sing._isUIShowing = v);
							});
						});
					}
				});
			});
		});
	};
	this.showLoader = () => app.spotify.do(`$('#sing-ui #sing-container').html(\`<main class='centerstage'><div><div class='loader'></div></div></main>\`)`);
	this.hideLoader = () => app.spotify.do(`$('#sing-ui #sing-container').removeClass('.loader'); if($('#sing-ui #sing-container #lyrics')) MAIN.send(\`:eval('sing.toggleLyricScroller(\${$(this).is('active')})')\`);`);
	//Fetch some lyrics
	const fetchOffline = (filepath, cb) => {
		//Load it into view!
		app.getUTF8File(filepath, (err, data) => {
			if (err) return cb(err);
			var obj = JSON.parse(data);
			var showLyrics = () => app.spotify.doFunc({obj: obj, art: controller.track.art[controller.track.art.length - 1][1]}, function(){
				$('#sing-sync').attr('title', (!!obj.sync ? 'Prompt me to sing' : 'Record lyrics to music'));
				$('#sing-sync').toggleClass('available', !!obj.sync);
				var footer = (obj.type == 'mxm' ? `
					<a href='${obj.url}'>View on MusixMatch</a><br/>Lyrics from MusixMatch, using <a href='https://github.com/Quacky2200/node-unofficialmxm'>node-unofficialmxm</a>
				` : `Lyrics from Quacky2200 Sync API, posted by ${obj.username}`);
				let scroll = function(i){
					$('#sing-ui').stop().animate({
						scrollTop:
							($('#lyrics span.part').eq(i).offset().top - $('#lyrics').offset().top) -
							($('#sing-container span').eq(i).height() / 2)
					});
					$('#sing-container').toggleClass('sync', true);
					$('#lyrics span.active').removeClass('active');
					$(`#lyrics span.part:eq(${i})`).addClass('active');
				};
				$('#sing-container').removeClass('record');
				$('#sing-sync').off();
				$('#sing-sync').click(function(){
					var hasSync = !!obj.sync;
					$(this).toggleClass('active');
					$('#sing-ui').css('background-image', ``);
					if ($(this).is('.active')){
						$('#sing-sync').attr('title', (hasSync ? 'Stop prompt' : 'Cancel synchronise recording'));
						$('#sing-container').toggleClass('sync', true);
						if (!hasSync) {
							$('#sing-container span.buffer').toggleClass('active', true);
							$('#sing-ui').animate({
								scrollTop: $('#sing-container span.buffer').offset().top - $('#lyrics').offset().top
							});
							$('#sing-container').addClass('record');
							MAIN.sendFunc({obj: obj, scroll: scroll}, () => {
								if (stopSync) stopSync(false);
								var lyrics = obj.lyrics.split('\n');
								var sync = [];
								var keys = require('electron').globalShortcut;
								var last = {time: null, accumulate: 0};
								var lyricTimer = null;
								var lyricTimerFunc = () => {
									if (!controller.isPlaying) return
									last.accumulate += 100;
									if (last.time !== controller.track.position){
										last.accumulate = 0;
										last.time = controller.track.position;
									}
									if (!sing._isUIShowing) return clearTimeout(lyricTimer);
								};
								var syncPart = () => {
									if (!sing._isUIShowing) return stopSync(false);
									var i = (sync.length > 0 ? sync[sync.length - 1].index + 1 : 0);
									sync.push({index: i, time: ((last.time / 1000) + last.accumulate)});
									app.spotify.doFunc({scroll: scroll, i: i}, () => {scroll(i)});
									if (i == (lyrics.length - 1)) {
										obj.sync = sync;
										controller.playPause();
										stopSync(false);
										app.spotify.doFunc({obj: obj}, () => {
											$('#sing-ui #overlaydialog').toggleClass('active', true);
										});
									}
								};
								var newLinePart = () => { syncPart(); syncPart(); }
								var goBackPart = () => {
									if(!sing._isUIShowing) return stopSync(false);
									//Commented below due to being confirmed unstable
									//Otherwise, later sync'd lyrics get delayed -_-
									// if (sync.length > 1) {
									// 	var lastItem = sync[sync.length - 2];
									// 	sync.pop(sync[sync.length - 1]);//Remove old!
									// 	controller.seek(lastItem.time);//Go back to before we got where we were
									// 	app.spotify.doFunc({i: lastItem.index}, () => {scroll(i)});
									// } else {
									controller.seek(0);
									app.spotify.doFunc({}, () => {
										$('#lyrics span').removeClass('active');
										$('#lyrics span.buffer:eq(0)').addClass('active');
										$('#sing-ui').stop().animate({
											scrollTop: $('#lyrics span.buffer:eq(0)').offset().top - $('#lyrics').offset().top
										});
									});
									sync = [];
									//}
								};
								var blurFunc = () => {stopSync(true)};
								var stopSync = (tidy) => {
									sync = [];
									clearTimeout(lyricTimer);
									keys.unregister('DOWN', syncPart);
									keys.unregister('UP', goBackPart);
									keys.unregister('ENTER', newLinePart);
									app.spotify.removeListener('blur', blurFunc);
									if (tidy) app.spotify.doFunc({}, () => {
										$('#sing-sync').click();
										$('#sing-sync').attr('title', 'Record lyrics to music');
										$('#sing-container span').toggleClass('active', false);
									});
								}
								stopSync(false);
								keys.register('DOWN', syncPart);
								keys.register('UP', goBackPart);
								keys.register('ENTER', newLinePart);
								app.spotify.once('blur', blurFunc);
								controller.seek(0);
								lyricTimer = setInterval(lyricTimerFunc, 100);
								if (!controller.isPlaying) controller.play();
							});
						} else {
							$('#sing-ui').css({
								'background-image': `url('${art}')`,
								'background-position': 'center',
								'background-repeat': 'no-repeat',
								'background-size': 'cover'
							});
							$('#sing-container span.buffer').toggleClass('active', true);
							$('#sing-ui').animate({
								scrollTop: $('#lyrics span.buffer').offset().top - $('#lyrics').offset().top
							});
							MAIN.sendFunc({obj: obj, scroll: scroll}, () => {
								var last = {time: null, accumulate: 0, lyricIndex: null};
								var lyricTimer = setInterval(() => {
									if (!controller.isPlaying) return
									last.accumulate += 100;
									if (last.time !== controller.track.position){
										last.accumulate = 0;
										last.time = controller.track.position;
									}
									var lyricsPassed = obj.sync.filter((e) => {return e.time < ((last.time / 1000) + last.accumulate)});
									if (controller.track.position < obj.sync.filter((e) => e.index == 0)[0].time){
										app.spotify.doFunc({}, () => {
											$('#lyrics span').removeClass('active');
											$('#lyrics span.buffer:eq(0)').addClass('active');
											$('#sing-ui').stop().animate({
												scrollTop: $('#lyrics span.buffer:eq(0)').offset().top - $('#lyrics').offset().top
											});
										})
									}
									if (!lyricsPassed.length) return;
									var currentLyric = lyricsPassed[lyricsPassed.length - 1];
									if (currentLyric.index !== last.lyricIndex) {
										last.lyricIndex = currentLyric.index;
										app.spotify.doFunc({scroll: scroll, i: currentLyric.index}, () => {if($('#sing-container').is('.sync')) {scroll(i)}});
									}
									if (!sing._isUIShowing) return clearTimeout(lyricTimer);
								}, 100);
								controller.once('trackChange', () => clearTimeout(lyricTimer));
							});
						}
					} else {
						$('#sing-sync').attr('title', (!!obj.sync ? 'Let the lyrics prompt you when to sing' : 'Syncronise lyrics with the music'));
						$('#sing-container span.buffer').removeClass('active');
						$('#sing-container').removeClass('sync');
						$('#sing-container').removeClass('record');
						MAIN.sendFunc({obj: obj, scroll: scroll}, () => {
							var keys = require('electron').globalShortcut;
							keys.unregister('UP');
							keys.unregister('DOWN');
							keys.unregister('ENTER');
							shortcuts.toggle(app.spotify.isFocused);
							app.spotify.removeAllListeners('blur');
							app.spotify.on('blur', () => shortcuts.toggle(false));
						});
					}
				});
				$('#sing-ui #sing-container').html(`
					<div id='header'>
						<h1>${obj.name.replace(/( - .*| \(.*)/i, '')}</h1>
						<h2>${obj.artists}</h2>
					</div>
					<div id='lyrics'>
						<div>
							<span class='buffer'>•••</span><br/>
							${obj.lyrics.split('\n').map((e) => {
								return `<span class='${(e ? '' : 'blank ')}part'>${(e ? e : '•••')}</span>`;
							}).join('<br/>')}
						</div>
						<br/><br/>
						<p>${footer}</p>
					</div>
					<div id='footer'>
						<p>Is the track timed incorrectly? <a href='https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/issues'>Please report it to be improved</a></p>
					</div>
				`);
				$('#sing-ui #sing-container a:not([href=\'javascript:;\'])').click(function() {
					MAIN.sendFunc({link: $(this).attr('href')}, () => app.openLink(link));
					return false;
				});
			});
			sync.retrieve(obj.uri, (err, resp) => {
				if (resp.error.code !== '200' || resp.error.code == '404') return showLyrics();
				resp.data[0].sync = JSON.parse(resp.data[0].sync);
				if(obj.sync !== resp.data[0].sync){
					obj.sync = resp.data[0].sync;
					obj.lyrics = resp.data[0].lyrics;
					obj.username = resp.data[0].username;
					obj.type = 'sync';
					obj.url = resp.url;
					app.createUTF8File(filepath, JSON.stringify(obj), (err) => {
						if (err) return fetchError(`Couldn't update Lyrics (${obj.uri}) with Sync`);
						showLyrics();
					})
				} else {
					showLyrics();
				}
			});
		});
	};
	//Returns lyrics from an online source (MXM and Sync) - returns cb error and filepath to lyrics
	const fetchOnline = (uri, name, artist, filepath, cb) => {
		sync.retrieve(uri, (err, obj) => {
			if (obj && obj.error.code == 200) {
				var lyrics = {
					uri: uri,
					name: name,
					artists: artist,
					lyrics: obj.data[0].lyrics,
					sync: JSON.parse(obj.data[0].sync),
					username: obj.data[0].username,
					type: 'sync',
					url: obj.url
				};
				app.createUTF8File(filepath, JSON.stringify(lyrics), (err) => cb(err, filepath));
			} else if (obj.error.code == 404 || obj.error.code == 500 || obj.error.code == 503) {
				mxm(name, artist, (err, result) => {
					if (err) return cb(err);
					var lyrics = {
						uri: uri,
						name: result.name,
						artists: result.artists,
						lyrics: result.lyrics,
						sync: null,
						username: user.username,
						type: 'mxm',
						url: result.url
					};
					app.createUTF8File(filepath, JSON.stringify(lyrics), (err) => cb(err, filepath));
				});
			} else {
				cb(obj.error);
			}
		});
	}
	const fetchError = (err, cb) => {
		this.hideLoader();
		app.spotify.do(`
			$('#sing-ui #sing-container').html(\`
				<main class='centerstage'>
					<div>
						<h1>Sorry, I couldn't retrieve any lyrics to this song.</h1>
						<h4>(${err})</h4>
					</div>
				</main>
			\`)
		`);
		if (cb) cb();
	}
	this.load = (uri, name, artist) => {
		if (!this._isUIShowing || !app.settings.NavBar.Sing || this.lastTrackURI == uri || !name || !artist) return;
		if (uri == null) return fetchError(new Error('No URI found with current track'), null);
		var oldpath = `${app.paths.caches.lyrics}/${artist.split(',')[0]}-${name.match(/(\w+)/g).join('-')}.html`;
		var filepath = `${app.paths.caches.lyrics}/${uri}.json`;
		this.lastTrackURI = uri;
		app.spotify.doFunc({}, () => {
			$('#sing-container').removeClass('sync');
			$('#sing-ui').css('background-image', '');
			$('#sing-sync').removeClass('active');
		});
		//Allow us to convert old lyrics
		fs.access(oldpath, fs.F_OK, (err) => {
			if(!err) {
				//Convert old
				app.getUTF8File(oldpath, (err, data) => {
					if (err) return fetchError(err);
					var newLyrics = {
						uri: uri,
						name: name,
						artists: artist,
						lyrics: (/(?:<div>(.*)<\/div><br\/>)/g).exec(data)[1].replace(/<br\/?>/g, '\n'),
						sync: null,
						type: 'mxm',
						username: user.username,
						url: (/(?:<a href=\')(.*)(?:\'>View on)/g).exec(data)[1]
					};
					app.createUTF8File(filepath, JSON.stringify(newLyrics), (err) => {
						if (err) return fetchError(createErr);
						fs.unlinkSync(oldpath);
						fetchOffline(filepath, (err) => fetchErr);
					});
				});
			} else {
				this.showLoader();
				app.checkPathExists(filepath, (err) => {
					if (err) {
						fetchOnline(uri, name, artist, filepath, (err, file) => {
							if (err) return fetchError(err);
							return fetchOffline(file, (err, callback) => fetchError(err));
						});
					} else {
						fetchOffline(filepath, (err) => fetchError(err));
					}
				});
			}
		});
	}
	this.toggleButton = (toggle) => {
		if (toggle) {
			app.spotify.do(`if($('#nav-sing').has('.disabled')) $('#nav-sing').removeClass('disabled');`);
		} else {
			app.spotify.do(`if(!$('#nav-sing').has('.disabled')) $('#nav-sing').addClass('disabled');`);
		}
	};
}
module.exports = new Sing();
