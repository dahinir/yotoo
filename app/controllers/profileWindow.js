var args = arguments[0] || {};
var ownerAccount;
// var ownerAccount = args.ownerAccount || yotoo.currentAccount;

$.titleLabel.text = L('profile');
// $.userView.getView().setBackgroundColor("#555");	//test

// only ios has .rightNavButton
// $.mentionsWindow.rightNavButton = Ti.UI.createButton({title:"asd"});

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
		$.userView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "profile"
		});
		// $.userView.setUser();
	}
};
