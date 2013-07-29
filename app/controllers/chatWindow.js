var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var targetIdStr = args.targetIdStr;

var chats = ownerAccount.getChats();

$.titleLabel.setText("secret chat with " + targetIdStr);



$.cancelButton.addEventListener('click', function(e){
	$.chatWindow.close();
});


$.sendButton.addEventListener('click', function(e){
	if( !$.chatTextArea.hasText() ){
		return;
	}
	var value = $.chatTextArea.getValue();
	chats.createNewChat({
		'mainAgent': ownerAccount
	});
});


