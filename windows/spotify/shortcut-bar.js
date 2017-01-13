/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * Load the shortcut bar
 */
var preferencesButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASBAMAAACk4JNkAAAAIVBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmOFP9JAAAACnRSTlMAAxkfPEBRZLT566NXKgAAAFJJREFUCJljYOBYNZkBDEK1Vi0LBQGGVVWrlq8CAQYGzlVLILIMzKGODNiA5aoGoF4QyFq1CKgXBED6IbJeqyZA1YmEGmDRCLIXrBFsL8xi/BoBkA8ma/taJbEAAAAASUVORK5CYII=';
var infoButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAwFBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkGrGOUAAAAP3RSTlMAAQIEBQYIDBEUFxobHB4pKi4xMzU2ODw9R0pWV1hcXmFihYaIjo+Rl5iam6uvt77Fx9HV2dri5Ovt8/X3+fskIZj9AAAAnUlEQVQYGXXBV1ICUQAAwdl1wRwwYsSEYCCIsoqKc/9b8UJplR92k6ye9wePV5v8aj6ZjVfItmZqE9TvfaLlD4MKjNYJno1OWgdGbyVs+9cx3Br0CExG8GpwTWBWMDd4OS3BbInapAKzgnuTCkwmcGhSgckFFLXaJeqoXw1gQ70hOlP3iI70cxi96yXZ2tRstsOPYvduOq8f2iX/WAAO6Cu/XBWcagAAAABJRU5ErkJggg==';
var fullscreenButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAwFBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkGrGOUAAAAP3RSTlMAAQIFBwgJCwwNDg8QERITFxgbHiMmKy80OEJDRFlcXV9jZGlse36AgoOFl6WqrbzMztXa4OLk5uvt8fX5+/1tvrB5AAAAsElEQVQYGX3B6TbDYBRA0ZNWiKGooIaY5yF1qVZVOO//Vr7wh2Ute2NrtE6y/GwSmNxU+11YfIiRGpiMC75k92pgo04Kkk6tNoGx+aaTAjpD9fAsOA5Wx85K6Dd+7HJ6ABXk9RLJxksJ2/yS8a+cn7o7cNSUJIPHBbiAusputenBnk77eI4ntXoJrEz1fWBg64pW79UkMLnm29pMDUyeYjgH81V1pwa2IifZmpoEf30CDzAiSWVMIPcAAAAASUVORK5CYII=';
var exitButtonIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAARVBMVEUAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkBVNYgAAAAFnRSTlMAAQMECQ8QGR4iJCw8RF+RqKvKzODmqz18nwAAAF1JREFUGFdlz9kSgCAIQFHIwnZb+f9PbUhLlPvknAdAYBXEmDePby4TcyB5oSbm3tIYqasIPBytInTSfTaZ5nTHjobWchbBtZiNgz1C3zXVH/pKROEfnxOsSNBQ2QMFEwvTxy9znQAAAABJRU5ErkJggg==';
let appPreferencesButton = `
<div id='infobar' style='position: absolute;bottom: 0;left:0;right:0;width:100%;padding: 10px;'>
  <table style='width: 100%'>
    <tr>
      <td align='center'>
        <a href='javascript:;' class='info appbutton' title='About' style='border:none !important;select:none'><img src='${infoButtonIcon}'/></a>
      </td>
      <td align='center'>
        <a href='javascript:;' class='preferences appbutton' title='Open Preferences' style='border:none !important;'><img src='${preferencesButtonIcon}'/></a>
      </td>
      <td align='center'>
        <a href='javascript:;' class='quit appbutton' title='Quit' style='border:none !important;'><img src='${exitButtonIcon}'/></a>
      </td>
      <td align='center'>
        <a href='javascript:;' class='fullscreen appbutton' title='Go Fullscreen' style='border:none !important;'><img style='transform: rotate(90deg);' src='${fullscreenButtonIcon}'/></a>
      </td>
    </tr>
  </table>
</div>`;
$('body', $('#app-player').contents()).append(appPreferencesButton);
$('.info.appbutton', $('#app-player').contents()).click(() => {
  props.spotify.showAbout();
});
$('.fullscreen.appbutton', $('#app-player').contents()).click(() => {
  props.spotify.setFullScreen(!props.spotify.isFullScreen())
});
$('.preferences.appbutton', $('#app-player').contents()).click(() => {
  props.spotify.showPreferences();
});
$('.quit.appbutton', $('#app-player').contents()).click(() => {
  tray.contextMenu.quit.click();
});
