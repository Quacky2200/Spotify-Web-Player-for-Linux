const request = require('request');
const cookieJar = request.jar();
let available = false;
let retrieveWait = null;
var Sync = function() {
	this.agent = app.spotify.webContents.session.getUserAgent();
	this.host = 'http://quacky2200.co.nf/projects/spotifywebplayer/v1.0.0';
	const go = (url, cb) => {
		request({url: url, jar: cookieJar, headers: {'User-Agent': this.agent}},
		(err, resp, data) => cb(err, resp, data));
	};
	//Gain cookies to gain 3 minute upload slot
	go(this.host, (err, resp, data) => {
		if (resp.statusCode == 200) available = true;
	});

	this.retrieve = (uri, cb) => {
		if (!available) return cb(new Error('Not ready!'))
		if (retrieveWait && retrieveWait.uri !== uri) clearTimeout(retrieveWait.time);
		//Try getting a track
		go(`${this.host}/track/${uri}`, (err, resp, data) => {
			if (resp.statusCode == 429) {
				retrieveWait = {
					uri: uri,
					time: setTimeout(() => this.retrieve(uri, cb), 3000)
				}
			} else if (resp.statusCode == 200) {
				var obj = JSON.parse(data);
				obj.url = `${this.host}/track/${uri}`;
				cb(null, obj);
			} else {
				var obj = JSON.parse(data);
				cb(obj.error, obj);
			}
		});
	},
	this.upload = (uri, lyrics, syncd, username, cb) => {
		request.post({
			url: `${this.host}/track`,
			jar: cookieJar,
			form: {
				uri: uri,
				lyrics: lyrics,
				sync: JSON.stringify(syncd),
				username: username
			}
		}, (err, resp, data) => {
			if (resp.statusCode == 201) {
				cb(null, data);
			} else {
				//var obj = JSON.parse(data);
				cb(err, data);
			}
		});
	};
}
module.exports = new Sync();
