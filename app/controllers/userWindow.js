var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var userId = args.userId; 

$.titleLabel.text = L('profile');	// should be user's name
$.cancelButton.title = L('cancel');
// $.userView.getView().setBackgroundColor("#555");	//test
// $.userView.setUser("babamba11");
// $.userView.setUser("37934281");	// should pass user_id. rapodor is 37934281

exports.init = function(args) {
	if(args.ownerAccount !== undefined ){
		ownerAccount = args.ownerAccount;
		$.userView.init({
			'ownerAccount': ownerAccount
		});
	}
	if(args.userId !== undefined ){
		userId = args.userId;
		$.userView.init({
			'purpose': 'userView',
			'userId': args.userId
		});
	}
};

$.cancelButton.addEventListener('click', function(e){
	$.userView.destroy();
	$.userWindow.close();
});
