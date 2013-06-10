var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var defaultTitle = args.defaultTitle || "-";


var leftNavButton = $.listAccountsButton;
var rightNavButton = $.newTweetButton;

exports.init = function( options ){
	if( options.defaultTitle ){
		defaultTitle = options.defaultTitle;
	}
	$.titleLabel.text = defaultTitle;

	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		leftNavButton.init({
			"ownerAccount" : ownerAccount
		});
		rightNavButton.init({
			"ownerAccount" : ownerAccount
		});
	}else{
		Ti.API.warn("[navBarView.js] must set ownerAccount");
	}
}


