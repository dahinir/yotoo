var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();


exports.init = function( options ) {
	if( options.ownerCustomer){
		ownerCustomer = options.ownerCustomer;
	}
};

var refreshProfileImage = function(){
	$.listCustomersButton.setBackgroundImage(ownerCustomer.get("profile_picture"));
};
refreshProfileImage();

$.listCustomersButton.addEventListener('click', function(e) {
	Ti.API.debug("[listCustomersButton.js] "+ownerCustomer.get('id'));
	Ti.App.fireEvent('app:buttonClick');

	var customersWindow = Alloy.createController('customersWindow', {
		"ownerCustomer" : ownerCustomer
	}).getView();

	// pop animation
	var t0 = Titanium.UI.create2DMatrix();
	t0 = t0.scale(0);
	var t1 = Titanium.UI.create2DMatrix();
	t1 = t1.scale(1.1);

	var openingAnimation = Titanium.UI.createAnimation();
	openingAnimation.transform = t1;
	openingAnimation.duration = 200;

	// when this animation completes, scale to normal size
	openingAnimation.addEventListener('complete', function() {
		var t2 = Titanium.UI.create2DMatrix();
		t2 = t2.scale(1.0);
		customersWindow.animate({transform:t2, duration:200});
	});
	// end of animation

	customersWindow.setTransform(t0);
	customersWindow.open(openingAnimation);
});
