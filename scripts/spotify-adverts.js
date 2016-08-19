/*

	Spotify Advert Redirection

*/
var advertHTML = "<div id='window_advert'><div id='window_advert_container'><div id='advert_container'><div id='advert'></div></div></div></div>";
var CSS = `
#notification-area{display:none;}
#cookie-compliance{display:none !important;}
#header #appName{height: 0;overflow: hidden;display:none !important;}
:not(#advert) > #hpto-container{display:none;}
#now-playing-widgets{display:none !important;}
.etched-top::before{background-color:#343434 !important;}
html, body{width: 100%;height:100%;border:0 !important;margin:0;padding:0;}
.ads-leaderboard-container{display:none !important;}
#window_advert{position: fixed; display:none;height:100%;width:100%;background:rgba(0,0,0,0.75);z-index:10000}
#window_advert_container{display:table;position:relative;width:100%;height:100%}
#advert_container{display:table-cell;vertical-align:middle;text-align:center}
#advert{position:relative;text-align:right;display:inline-block;border-radius:10px;overflow:hidden;width:1200px;height:270px;min-width: 800px;max-width: 75%;}
#advert a, #advert a:hover, #advert a:active, #advert a:visited{display:block;position:absolute;width:100%;height:100%;left:0;top:0;border:none;text-decoration: none}
#advert #hpto-container .hpto-button{background:rgba(0,0,0,0.75);padding:5px;display:inline-block;border-radius:5px;margin:10px;}
#advert #hpto-container{position:relative;height:100%;width:100%}
`,
currentWindowAdvert = null;

function injectIframe(obj){
    //Get the iframe
    var iframe = jQuery(obj);
    //Append it to the iframe
    jQuery('body', jQuery(iframe).contents()).append("<style>" + CSS + "<style>");
    //Always make sure spotify player controls are covering advert area
	//$('html, body', $('#app-player').contents()).css({height: '100%', 'border-bottom': 'none'});
}
function showWindowAdvert(){
	if(jQuery('#window_advert').length > 0) jQuery('#window_advert').remove();
	var newWindowAdvert = $("#hpto-container", jQuery('.root iframe').contents());
	console.log("%s \n %s", newWindowAdvert.length, currentWindowAdvert);
	if (newWindowAdvert.length == 0 && currentWindowAdvert == null || $('#login').is(":visible")) return;
	currentWindowAdvert = $((newWindowAdvert.length == 0 ? currentWindowAdvert : newWindowAdvert.eq(0))).clone();
	$(currentWindowAdvert).css("background-position", "center");
	//currentWindowAdvert.children('.hpto-interactive').remove();
	jQuery('body #wrapper').prepend(advertHTML);
	//Add the new advert
	jQuery('#window_advert_container #advert').append(currentWindowAdvert);
	//Add the advert link
	$('#window_advert_container #advert').append("<a href='" + currentWindowAdvert.attr('data-url') + "' target='_blank'></a>");
	jQuery('#window_advert').fadeToggle();
}
function hideWindowAdvert(e){
  if(jQuery('#window_advert').is(':visible')){
	  jQuery('#window_advert').fadeToggle();
	  jQuery('#window_advert').remove();
  }
  return false;
}

jQuery('body').prepend("<style class='CSS_Inject'>" + CSS + "</style>");
var window_focus = true;
document.addEventListener("visibilitychange", function(){
	window_focus = document.visibilityState == "visible";
	if(!window_focus){
		console.log("Window is minimized.");
		setTimeout(function(){
			if(!window_focus && !$('#window_advert').is(":visible")) showWindowAdvert();
		}, 2e4);
	} else {
		console.log("Window is in focus.");
		if($('#window_advert').is(":visible")) { 
			setTimeout(function(){
				if(window_focus && $('#window_advert').is(":visible")) $('#window_advert').click(hideWindowAdvert); 
			}, 500);
		}
	}
}, false);

//Listening for the adverts to appear
window.addEventListener("message", function(event){
    //Check if the result is JSON
    if(event.data.indexOf("user:impression") > 0){
        //console.log("injected advert redirect");
        var newWindowAdvert = $("#hpto-container", jQuery('.root iframe').contents());
        if(currentWindowAdvert == null && newWindowAdvert.length > 0) currentWindowAdvert = newWindowAdvert.eq(0).clone();
        injectIframe(jQuery("div[id*='section-'] iframe[id*='app-spotify:'], #app-player"));
    } else {
    	//console.log(event.data);
    }
}, false);
