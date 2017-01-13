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
				iface.on('MediaPlayerKeyPressed', (n, value) => {
					this.emit(value);
				});
				iface.GrabMediaPlayerKeys(0, 'org.gnome.SettingsDaemon.MediaKeys');
			});
		}
	}
	return {
		mediakeys: new DBusMediaKeys(bus),
		notifications: {
			notify: (summary, body, icon) => {
				console.log(summary, body, icon);
				notification.summary = summary;
				notification.body = body;
				notification.icon = icon;
				notification.push();
			}
		},
		mpris: Player({
		    name: appName,
		    identity: appName,
		    supportedUriSchemes: ['http'],
		    supportedMimeTypes: ['application/www-url'],
		    desktopEntry: appName
		})
	};
};
