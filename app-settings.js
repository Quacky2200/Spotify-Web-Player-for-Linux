/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * appSettings file for local application
 */
module.exports = function(prefFile, defaults) {
	const fs = require('fs');
	const _file = prefFile;
	const appSettings = {
		save: function(callback){
			fs.writeFile(prefFile, JSON.stringify(appSettings.export()), 'utf8', callback);
		},
		where: function(){
			return _file;
		},
		open: function(callback){
			//Check the file exists so that we can automatically create one.
			fs.access(prefFile, fs.F_OK, function(err){
				//If the file doesn't exist, save it.
				if(err) return appSettings.save(callback);
				//Otherwise open the file, parse it and use the callback
				fs.readFile(prefFile, 'utf8', function(err, data){
					if (err) return callback(err);
					appSettings.import(JSON.parse(data));
					callback(null, appSettings);
				});
			});
		},
		import: function(prefs){
			//Append all appSettings
			for(var i in prefs){
				if(prefs.hasOwnProperty(i)){
					appSettings[i] = prefs[i];
				}
			}
		},
		export: function() {
			//JSON.stringify will remove any built in functions - leaving only the data.
			//parse it again and we have extracted everything.
			return JSON.parse(JSON.stringify(appSettings));
		}
	};
	//Import defaults 
	appSettings.import(defaults);
	//Always try to open our prefFile to check we don't have their settings
	appSettings.open(function(err){
		if(err) throw err;
	});
	//Give the appSettings
	return appSettings;
};