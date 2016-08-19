//We need cookies
require('electron-cookies');
const remote = require('electron').remote;
const props = remote.getGlobal('props');
//If the window is a pop-up window
if (window.opener){
  //Set our default properties for the popup window and escape.
  var popupWindow = remote.getCurrentWindow();
  popupWindow.setSize(800, 600);
  popupWindow.setMenu(null);
  popupWindow.show();
  //Don't process the rest of the file.
  return;
}
document.onreadystatechange = function(){
  document.body.style.backgroundColor = "#121314";
  //Load jQuery
  window.$ = window.jQuery = require('./jquery');
  //If we've logged in and the login screen is still present
  if(window.location.href.indexOf("?electron_logged_in=true") > 0 && $('#login').is(":visible")){
  	$('body').prepend('<style>body.login{opacity: 0;}</style>');
  }
  //We have already injected in the same window
  if($('.CSS_Inject').length > 0) return; 
  require('./spotify-player');
  require('./spotify-adverts');
  console.log('advert & local player injection complete!');
  // $('iframe#app-payer').ready(function(){
  //   $('#track-current', $('iframe#app-player').contents()).bind('DOMNodeInserted DomNodeRemoved', function(){console.log("update");});
  // })
}
