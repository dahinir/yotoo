// var args = arguments[0] || {},
// 	customer = args.customer,
// 	userId = args.userId,
// 	user = args.user;
var customer, userId, user;

$.userWindow.setTitle(L("profile"));


// $.closeButton.addEventListener('click', function(e){
// 	$.userView.destroy();
// 	$.userWindow.close();
// });
$.userWindow.addEventListener("close", function(e){
	Ti.API.debug("[userWindow.js] window close event fired.");
	// 	$.userView.destroy();
});

// $.userView.getView().setBackgroundColor("#555");	//test
// $.userView.setUser("babamba11");
// $.userView.setUser("37934281");	// should pass user_id. rapodor is 37934281
exports.init = function( options ) {
	if( options.customer){
		customer = options.customer;
		// $.listCustomersButton.init({
		// 	customer: customer
		// });
		// $.globalView.init({
		// 	customer: customer
		// });
	}
	if(options.user){
		user = options.user;
		applyUser();
	}
};

function applyUser(){
				$.profileImage.image = user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.');
				$.name.text = user.get('name');
				if( user.get('verified') ){
					$.verified.visible = true;
				}
				$.screenName.text = "@" + user.get('screen_name');
				$.description.text = user.get('description');
				$.followersCount.text = L('followers') + " " + String.formatDecimal( user.get('followers_count') );
				$.followingCount.text = L('following') + " " + String.formatDecimal( user.get('friends_count') );
}
