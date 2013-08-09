var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('favorite')
});
*/


$.titleLabel.text = L('favorite');

