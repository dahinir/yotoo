var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('favorite')
});
*/


$.titleLabel.text = L('favorite');
$.titleImageView.setImage( ownerAccount.get('profile_image_url_https') );
