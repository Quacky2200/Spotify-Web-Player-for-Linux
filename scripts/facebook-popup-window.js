const remote = require('electron').remote;
var props = remote.getGlobal('props');
var popup = remote.getCurrentWindow();

//Thanks to http://stackoverflow.com/questions/12049620/how-to-get-get-variables-value-in-javascript
var uriQuery = {};
if(document.location.toString().indexOf('?') !== -1) {
    var query = document.location
       .toString()
       // get the query string
       .replace(/^.*?\?/, '')
       // and remove any existing hash string (thanks, @vrijdenker)
       .replace(/#.*$/, '')
       .split('&');

    for(var i=0, l=query.length; i<l; i++) {
       var aux = decodeURIComponent(query[i]).split('=');
       uriQuery[aux[0]] = aux[1];
    }
}
//Check if we're trying to authenticate with FB.
if(window.location.href.indexOf("oauth?") >= 0){
    if(!!uriQuery.app_id){
        //Click the button again to make FB check the authentication with our newly created cookie
        props.mainWindow.webContents.executeJavaScript("document.getElementById('fb-signup-btn').click();");
        //Close the FB window, we don't need it anymore
        popup.close();
    } else if (!!uriQuery.redirect_uri){
        popup.hide();
        props.mainWindow.loadURL(props.HOST + '/?');
        props.mainWindow.webContents.once('dom-ready', function(){
            //Click the button again to make FB check the authentication with our newly created cookie
            props.mainWindow.webContents.executeJavaScript("document.getElementById('fb-signup-btn').click();");
            //Close the FB window, we don't need it anymore 
            popup.close();
        });
    }
}


