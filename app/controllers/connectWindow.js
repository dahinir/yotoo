var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;


exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('connect')
		});
		
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "mentions"
		});
		
	}else{
		Ti.API.warn("[connectWindow.js] must set ownerAccount");
	}
};
// only ios has .rightNavButton
// $.connectWindow.rightNavButton = Ti.UI.createButton({title:"asd"});

