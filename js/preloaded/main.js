require('electron-cookies');
global.remote = require('electron').remote;
let props = remote.getGlobal('props');
global.props = props;
let dbus = remote.getGlobal('dbus');
global.dbus = dbus;

console.log = props.console.log;
console.error = props.console.log;
console.info = () => {};

//If the window is a pop-up window
if (window.opener){
  //Set our default properties for the popup window and escape.
  var popupWindow = remote.getCurrentWindow();
  popupWindow.setSize(800, 600);
  popupWindow.setMenu(null);
  popupWindow.show();
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
  //We have already loaded JS in the same window
  if($('.CSS_Inject').length > 0) return; 
  require('./spotify-player');
  console.log('Javascript preloaded without hassle');
}
