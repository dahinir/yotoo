var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var defaultTitle = args.defaultTitle || "-";



exports.init = function( options ){
	if( options.defaultTitle ){
		defaultTitle = options.defaultTitle;
	}
	$.titleLabel.text = defaultTitle;

	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.listAccountsButton.init({
			"ownerAccount" : ownerAccount
		});
		$.newTweetButton.init({
			"ownerAccount" : ownerAccount
		});
	}else{
		Ti.API.warn("[navBarView.js] must set ownerAccount");
	}
}


