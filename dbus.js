/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * D-Bus support (mpris, mediakeys and notifications)
 */
module.exports = function(appName){
	if (process.platform !== 'linux') return null;

	const EventEmitter = require('events');
	const DBus = require('dbus');
	const notifications = require('freedesktop-notifications');
	const Player = require('mpris-service');
	const dbus = new DBus();
	const bus = dbus.getBus('session');
	notifications.setAppName(appName);
	notifications.setUnflood(true);
	let notification = notifications.createNotification({timeout: 2e3});
	class DBusMediaKeys extends EventEmitter{
		constructor(bus){
			super();
			bus.getInterface('org.gnome.SettingsDaemon', '/org/gnome/SettingsDaemon/MediaKeys', 'org.gnome.SettingsDaemon.MediaKeys', (err, iface) => {
				if(err) return console.log(err);
				iface.on('MediaPlayerKeyPressed', (n, value) => this.emit(value));
				iface.GrabMediaPlayerKeys(0, 'org.gnome.SettingsDaemon.MediaKeys');
			});
		}
	}
	class DBusMPRIS extends EventEmitter{
		constructor(appName) {
			super();
			this._player = Player({
				name: appName,
				identity: appName,
				supportedUriSchemes: ['http'],
				supportedMimeTypes: ['application/www-url'],
				desktopEntry: appName
			});
		}
		on(name, func){
			this._player.on(name, func);
		}
		removeAllListeners(){
			this._player.removeAllListeners();
		}
		set position(pos) {
			if (pos !== this.position) this._player.position = pos;
		}
		get position() {
			return this._player.position;
		}
		set playbackStatus(stat){
			if (stat !== this.playbackStatus) this._player.playbackStatus = stat;
		}
		get playbackStatus(){
			return this._player.playbackStatus;
		}
		set volume(vol) {
			if (vol !== this.volume) this._player.volume = vol;
		}
		get volume() {
			return this._player.volume;
		}
		set shuffle(shuff){
			if (shuff !== this.shuffle) this._player.shuffle = shuff;
		}
		get shuffle(){
			return this._player.shuffle;
		}
		set repeat(rep){
			if (rep !== this.repeat) this._player.repeat = rep;
		}
		get repeat() {
			return this._player.repeat;
		}
		set metadata (met) {
			if (
				(met && !this.metadata) ||
				(this.metadata && this.metadata['xesam:url'] !== met['xesam:url'])
			) {
				this._player.metadata = met;
			}
		}
		get metadata(){
			return this._player.metadata;
		}
		objectPath(str) {
			return this._player.objectPath(str);
		}
	}
	return {
		mediakeys: new DBusMediaKeys(bus),
		notifications: {
			notify: (summary, body, icon) => {
				console.log(`notify('${summary}','${body.replace(/\n/g, '\\n')}','${icon}')`);
				notification.summary = summary;
				notification.body = body;
				notification.icon = icon;
				notification.push();
			}
		},
		mpris: new DBusMPRIS(appName)
	};
};
