const theme = require('../spotify/theme');

module.exports = function(){

	app.spotify.PreferenceInstance.do(`
		${JSON.stringify(theme.allThemeNames)}.forEach((theme) => {
			$('select[name*="Theme"]').append(\`<option value=\'\${theme}\'>\${theme.charAt(0).toUpperCase() + theme.slice(1)}</option>\`);
		});
		function recursivelySetupSettings(settings, skip, prefix){
			for(var setting in settings){
				if(skip.indexOf(setting) != -1) continue;
				if(typeof(settings[setting]) == 'object'){
					recursivelySetupSettings(settings[setting], skip, (prefix ? prefix + '.' : '') + setting + '.');
				} else {
					var selector = 'input[name="' + (prefix || '') + setting + '"]';
					$(selector).prop('checked', settings[setting]);
					$(selector).on('change', function() {
						MAIN.send('message', \`:eval('app.settings.\${$(this).attr('name')} = \${$(this).prop('checked')}; app.settings.save(); theme.refresh();')\`)
					});
				}
			}
		}
		recursivelySetupSettings(${JSON.stringify(app.settings)}, ['Theme', 'AlbumArtSize' , 'lastURL', 'AlbumCacheDisabled']);

		$('input[name*="AlbumCacheDisabled"]').attr('checked', ${!app.settings.AlbumCacheDisabled});
		$('select[name="Theme"]').val('${app.settings.Theme}');
		$('select[name="TrayIcon"]').val('${app.settings.TrayIcon}');
		$('select[name="AlbumArtSize"]').val('${app.settings.AlbumArtSize}');
		$('select[name="AlbumArtSize"]').change(function() {
			MAIN.send('message', \`:eval('app.settings.AlbumArtSize = '\${$(this).val()}';app.settings.save()')\`);
		});

	`);
	theme.refresh();
}
