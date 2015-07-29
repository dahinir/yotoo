var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

$.discoverWindow.setTitle( L("discover") );

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('discover')
});
*/

// $.navBarView.setTitle( L('dicover') );

/*
$.titleLabel.text = L('discover');
$.titleImageView.setImage( ownerCustomer.get('profile_picture') );

$.titleLabel.addEventListener('click', function(){

});
*/
