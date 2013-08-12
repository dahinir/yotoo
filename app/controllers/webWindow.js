var args = arguments[0] || {};

// var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
// var url = args.url;
$.titleLabel.setText( L('web') );
// exports.addEventListener = function(a, b ){
	// $.webView.addEventListener(a, b);
// };
	/*
	Ti.API.debug("[twitter2] showAuthorizeUI() " + url);
	var win = Ti.UI.createWindow({
		// top: 0,
		// fullscreen: true,
		navBarHidden: true,
		modal: true
	});

	var webView = Ti.UI.createWebView({
		// scalesPageToFit: true,
		// url: url,
		touchEnabled: true
		// top:43,
		// backgroundColor: '#FFF'
	});
	win.add(webView);
	*/
// exports.setUrl = function(url){
	// $.webView.setUrl(url);
// };
// exports.stopLoading = function(){
	// $.webView.stopLoading();
// };
$.webView.addEventListener('load', function(e){
	var titleText = e.url
	if(titleText.length > 27){
		titleText = titleText.substring(0, 25) + "..";
	}
	$.titleLabel.setText(titleText);
});
$.closeButton.addEventListener('click', function(e){
	$.webWindow.close();
});

exports.getWebView = function(){
	return $.webView;
};

