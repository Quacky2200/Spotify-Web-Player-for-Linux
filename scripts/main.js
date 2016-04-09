//We need cookies
require('electron-cookies');
var isPopup = window.opener;
// var isFacebookLoginPopup = isPopup && window.location.href.indexOf("https://www.facebook.com/login.php?") >= 0;
var popupSize = {width: 800, height:600}; //(isFacebookLoginPopup ? {width: 650, height: 350} : {width: 800, height: 600});
if (isPopup){
  //Set properties for window and escape.
  var w = require('remote').getCurrentWindow();
  w.setSize(popupSize.width, popupSize.height);
  w.setMenu(null);
  w.show();
  return;
}
document.onreadystatechange = function(){
document.body.style.backgroundColor = "#121314";
  //Get jQuery
  window.$ = window.jQuery = require('./jquery');

  if(window.location.href.indexOf("?electron_logged_in=true") > 0 && $('#login').is(":visible")){
  	$('body').prepend('<style>body.login{opacity: 0;}</style>');
  }
  if($('.CSS_Inject').length > 0) return; //We have already injected in the same window
  require('./spotify-player');
  require('./spotify-adverts');
  

  // $('iframe#app-payer').ready(function(){
  //   $('#track-current', $('iframe#app-player').contents()).bind('DOMNodeInserted DomNodeRemoved', function(){console.log("update");});
    
  // })
}
