var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('discover')
});
*/

// $.navBarView.setTitle( L('dicover') );

$.titleLabel.text = L('discover');
$.titleImageView.setImage( ownerAccount.get('profile_image_url_https') );

$.titleLabel.addEventListener('click', function(){

});
