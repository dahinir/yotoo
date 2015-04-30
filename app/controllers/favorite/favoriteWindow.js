
var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('favorite')
});
*/


$.titleLabel.text = L('favorite');
$.titleImageView.setImage( ownerCustomer.get('profile_image_url_https') );
