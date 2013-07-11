var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var userId = args.userId; 

$.titleLabel.text = L('profile');	// should be user's name
$.closeButton.title = L('close');


$.closeButton.addEventListener('click', function(e){
	$.userView.destroy();
	$.userWindow.close();
});

// $.userView.getView().setBackgroundColor("#555");	//test
// $.userView.setUser("babamba11");
// $.userView.setUser("37934281");	// should pass user_id. rapodor is 37934281

exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		// $.navBarView.init({
			// "ownerAccount": ownerAccount,
			// "defaultTitle": L('profile')
		// });
		// $.navBarView.setLeftNavButton();
		
		$.userView.init({
			'ownerAccount': ownerAccount
		});
	}
	if( options.userId ){
		userId = options.userId;
		$.userView.init({
			'purpose': 'userView',
			'userId': options.userId
		});
	}
};
