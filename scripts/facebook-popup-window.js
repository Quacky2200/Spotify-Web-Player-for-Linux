if(window.location.href.indexOf("oauth?redirect_uri") >= 0){
	const ipcRenderer = require('electron').ipcRenderer;
	const remote = require('electron').remote;
	const win = remote.getCurrentWindow();
	var loginOperations = {
		"FBLoginFinished": function(){
			win.close();
		}
	};
	ipcRenderer.on('message', function(event, obj){
		if(obj.operation in loginOperations){
			loginOperations[obj.operation]();
		} else {
			alert("Message operation during login process unrecognized (" + obj.operation + ")");
		}
	});
	//Hide the window to show we're logged in
	win.hide();
	//Send the URL to our session to hope our login request is recognised
	var sessionObj = {redirectURI: window.location.href};
	
	ipcRenderer.send('message', {operation: "FBLoginSuccess", args:sessionObj});

}


