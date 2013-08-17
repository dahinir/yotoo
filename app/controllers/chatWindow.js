var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var targetUser = args.targetUser;
var yotoo = ownerAccount.getYotoos().where({'target_id_str': targetUser.get('id_str')}).pop();

var chats = ownerAccount.getChats();
var conversationCount = 100;
var softKeyboardHeight = 0;

$.titleImageView.setImage( ownerAccount.get('profile_image_url_https') );
$.titleTargetImageView.setImage( targetUser.get('profile_image_url_https') );
$.titleLabel.setText( L('between') );
$.remainCountToBurn.setText( conversationCount );

var setSoftKeyboardHeight = function(e){
	softKeyboardHeight = e.keyboardFrame.height;
	$.chatTextArea.fireEvent('focus');
	Ti.App.removeEventListener('keyboardFrameChanged', setSoftKeyboardHeight);
};
Ti.App.addEventListener('keyboardFrameChanged', setSoftKeyboardHeight);


var testButton = Ti.UI.createButton();
$.chatWindow.add( testButton);
testButton.addEventListener('click', function(){
	alert(Alloy);
});

var addChatTableRow = function(chat){
	/* 현재 채팅 윈도우와 관계있는 chat일 경우에만 추가*/
	if( yotoo.get('chat_group_id') ){   
		if( yotoo.get('chat_group_id') !== chat.get('chat_group_id') ){
			return;
		}
	}else if( chat.get('sender_id_str') === targetUser.get('id_str') ){
			yotoo.set({'chat_group_id': chat.get('chat_group_id')});
			yotoo.save();
	}else {
		return;
	}
	
	var newRow = Alloy.createController('chatTableViewRow', {
		'ownerAccount': ownerAccount,
		'chat': chat,
		'targetUser': targetUser
	}).getView();
	$.chatTableView.appendRow(newRow);
	$.remainCountToBurn.setText( --conversationCount );
	$.chatTableView.scrollToIndex( chats.length - 1 );
	chat.save();
};
chats.on('add', addChatTableRow);

chats.map(function(chat){
	addChatTableRow(chat);
});

var fetch = function(){
	chats.fetchFromServer({
		'mainAgent': ownerAccount
	});
};
fetch();

$.closeButton.addEventListener('click', function(e){
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

Ti.App.addEventListener("app:newChat:" + targetUser.get('id_str'), fetch );

$.chatWindow.addEventListener('open', function(e){
});

$.chatWindow.addEventListener('close', function(){
	Ti.App.removeEventListener("app:newChat" + targetUser.get('id_str'), fetch );
	chats.off('add', addChatTableRow);
});






