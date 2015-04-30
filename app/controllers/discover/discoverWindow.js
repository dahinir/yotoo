
var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('discover')
});
*/

// $.navBarView.setTitle( L('dicover') );

$.titleLabel.text = L('discover');
$.titleImageView.setImage( ownerCustomer.get('profile_image_url_https') );

$.titleLabel.addEventListener('click', function(){

});
