var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

$.titleLabel.text = L('timeline');

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "timeline"
		});
		$.listAccountsButton.init({
			"ownerAccount" : ownerAccount
		});
		$.newTweetButton.init({
			"ownerAccount" : ownerAccount
		});
	}
};

exports.test = function(){
	return "ss";
}

// $.timelineWindow.add(Alloy.createController('tweetsView', {
// "purpose" : "timeline",
// "ownerAccount" : ownerAccount
// }).getView());

// only ios has .rightNavButton
// $.timelineWindow.rightNavButton = Ti.UI.createButton({title:"asd"});

