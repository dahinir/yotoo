var args = arguments[0] || {};
var ownerAccount;
// var ownerAccount = args.ownerAccount || yotoo.currentAccount;

// $.userView.getView().setBackgroundColor("#555");	//test


exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('profile')
		});
		
		$.userView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "profile"
		});
		// $.userView.setUser();
	}
};
