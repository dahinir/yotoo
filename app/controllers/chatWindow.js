var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var targetUser = args.targetUser;

var chats = ownerAccount.getChats();
var conversationCount = 100;
var softKeyboardHeight = 0;

$.titleLabel.setText("secret chat with @" + targetUser.get('screen_name'));
$.remainCountToBurn.setText( conversationCount );

var setSoftKeyboardHeight = function(e){
	softKeyboardHeight = e.keyboardFrame.height;
	$.chatTextArea.fireEvent('focus');
	Ti.App.removeEventListener('keyboardFrameChanged', setSoftKeyboardHeight);
}
Ti.App.addEventListener('keyboardFrameChanged', setSoftKeyboardHeight);



var testButton = Ti.UI.createButton();
$.chatWindow.add( testButton);
testButton.addEventListener('click', function(){
	alert(Alloy);
});

chats.fetchFromServer({
	'mainAgent': ownerAccount
});
	
var addChatTableRow = function(chat, fixScroll){
	if( chat ){ // 현재 채팅 윈도우와 관계있는 chat일 경우에만 추가  
	}
	var newRow = Alloy.createController('chatTableViewRow', {
		'ownerAccount': ownerAccount,
		'chat': chat,
		'targetUser': targetUser
	}).getView();
	$.chatTableView.appendRow(newRow);
	conversationCount = conversationCount - chats.length;
	if( !fixScroll ){
		$.chatTableView.scrollToIndex( chats.length - 1 );
	}
};
chats.on('add', function(addedChat){
	// alert(JSON.stringify(addedChat));
	addChatTableRow(addedChat);
});


if( chats.length > 0){
	chats.map(function(chat){
		addChatTableRow(chat, true);
	});
	$.chatTableView.scrollToIndex( chats.length -1 );
}


$.cancelButton.addEventListener('click', function(e){
	$.chatWindow.close();
});

$.sendButton.addEventListener('click', function(e){
	if( !$.chatTextArea.hasText() ){
		return;
	}
	var value = $.chatTextArea.getValue();
	chats.createNewChat({
		'mainAgent': ownerAccount,
		'targetUser': targetUser,
		'message': value,
		'success': function(){
			$.chatTextArea.setValue("");
		},
		'error': function(){}
	});
});

$.chatTableView.addEventListener('doubletap', function(e){
	$.chatTextArea.blur();
	$.chatView.setBottom( 0 );
});

$.chatTextArea.addEventListener('focus', function(e){
	$.chatView.setBottom( softKeyboardHeight );
});

$.chatTextArea.addEventListener('postlayout', function(){
	// alert("post");
	$.chatTextArea.focus();
	// $.chatTableView.scrollToIndex( chats.length -1 );
});

// scrollend는 터치가 끝난후 스크롤이 더 있어야 발생하나..
var nowScrollBottom = true;
$.chatTableView.addEventListener('scrollend', function(e){
	// alert($.chatTableView.size.height);
	// alert(e.contentSize.height - e.contentOffset.y);
	if($.chatTableView.size.height > e.contentSize.height - e.contentOffset.y - 10){
		nowScrollBottom = true;
	}else{
		nowScrollBottom = false;
	}
});

$.chatTableView.addEventListener('postlayout', function(e){
	if( nowScrollBottom ){
		$.chatTableView.scrollToIndex( chats.length -1 );
	}
});

$.chatWindow.addEventListener('open', function(e){
	ownerAccount.currentChatTarget = targetUser.get('id_str');
});

$.chatWindow.addEventListener('close', function(){
	// ownerAccount.currentChatTarget = undefined;
});






