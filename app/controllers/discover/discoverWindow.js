// var args = arguments[0] || {};

var ownerAccount = Alloy.Globals.accounts.getCurrentAccount();



exports.init = function( options ) {
		
	$.navBarView.init({
		"ownerAccount": ownerAccount,
		"defaultTitle": L('dicover')
	});
	
	// $.localView.init({
		// "ownerAccount" : ownerAccount
	// });
		
};





