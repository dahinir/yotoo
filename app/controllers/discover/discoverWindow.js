var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;



exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('dicover')
		});
		
		$.localView.init({
			"ownerAccount" : ownerAccount
		});
		
	}else{
		Ti.API.warn("[discoverWindow.js] must set ownerAccount");
	}
};





