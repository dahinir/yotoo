var args = arguments[0] || {};
var customer = args.ownerCustomer || AG.customers.getCurrentCustomer();
// var getCurrentCustomer = AG.customers.getCurrentCustomer;
exports.init = function( options ) {
	if( options.customer){
		customer = options.customer;
		customer.on("change:profile_picture", updateData);
		updateData();
	}
};

function updateData(){
	$.listCustomersButton.setBackgroundImage(customer.get("profile_picture"));
}

$.listCustomersButton.addEventListener('click', function(e) {
	Ti.API.debug("[listCustomersButton.js] "+customer.get('id'));
	Ti.App.fireEvent('app:buttonClick');

	var customersWindow = Alloy.createController('customersWindow').getView();

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
