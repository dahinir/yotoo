var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('timeline')
		});
		
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "timeline"
		});
		
	}else{
		Ti.API.warn("[timeline.js] must set ownerAccount");
	}
};

// exports.test = function(){
	// return "ss";
// }


