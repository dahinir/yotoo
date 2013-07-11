var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var defaultTitle = args.defaultTitle || "-";

var leftNavButton = $.listAccountsButton;
var rightNavButton = $.newTweetButton;

exports.init = function( options ){
	if( options.defaultTitle ){
		defaultTitle = options.defaultTitle;
	}
	$.titleLabel.text = defaultTitle;

	ownerAccount = options.ownerAccount;
	
	leftNavButton.init({
		"ownerAccount" : ownerAccount
	});
	rightNavButton.init({
		"ownerAccount" : ownerAccount
	});
};


