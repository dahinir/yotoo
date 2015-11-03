// var args = arguments[0] || {};
var customer; // = args.customer;

exports.init = function( options ) {
	if( options.customer){
		customer = options.customer;
		$.listCustomersButton.init({
			customer: customer
		});
		$.globalView.init({
			customer: customer
		});
	}
};

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
