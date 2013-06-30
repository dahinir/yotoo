var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;







var dropDownMenu = {
	
};

exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('timeline'),
			"dropDownMenu": dropDownMenu
		});
		
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "timeline"
		});
		
	}else{
		Ti.API.warn("[timeline.js] must set ownerAccount");
	}
};


