var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

$.titleLabel.text = L('mentions');

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "mentions"
		});
		$.listAccountsButton.init({
			"ownerAccount" : ownerAccount
		});
		$.newTweetButton.init({
			"ownerAccount" : ownerAccount
		});
	}
};
// only ios has .rightNavButton
// $.mentionsWindow.rightNavButton = Ti.UI.createButton({title:"asd"});

