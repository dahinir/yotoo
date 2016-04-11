// var args = arguments[0] || {};
var customer; // = args.customer || AG.customers.getCurrentCustomer();

exports.init = function( options ) {
	if( options.customer){
		customer = options.customer;
		$.listCustomersButton.init({
			customer: customer
		});
		$.favoriteView.init({
			customer: customer
		});
	}
};

$.favoriteWindow.setTitle( L("favorite") );
$.favoriteWindow.addEventListener("focus", function(){
	Ti.UI.iPhone.setAppBadge(0);
});
/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('favorite')
});
*/


// $.titleLabel.text = L('favorite');
// $.titleImageView.setImage( ownerCustomer.get('profile_image_url_https') );
