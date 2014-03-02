var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var targetUser = args.targetUser;
var yotoo = ownerAccount.getYotoos().where({'target_id_str': targetUser.get('id_str')}).pop();
// var chats = ownerAccount.getChats();	// all chats that relevant ownerAccount
// Alloy.Globals.chats.fetch();
var chats = Alloy.createCollection('chat', Alloy.Globals.chats.where({
	'chat_group_id' : yotoo.get('chat_group_id')
}));

var YOTOO_CONVERSATION_LIMIT = 100;
var conversationCount = 0;
var softKeyboardHeight = 0;
var nowScrollBottom = true;

$.titleImageView.setImage( ownerAccount.get('profile_image_url_https') );
$.titleTargetImageView.setImage( targetUser.get('profile_image_url_https') );
$.titleLabel.setText( L('between') );
$.remainCountToBurn.setText( YOTOO_CONVERSATION_LIMIT );

var setSoftKeyboardHeight = function(e){
	softKeyboardHeight = e.keyboardFrame.height;
	$.chatTextField.fireEvent('focus');
	Ti.App.removeEventListener('keyboardFrameChanged', setSoftKeyboardHeight);
};
Ti.App.addEventListener('keyboardFrameChanged', setSoftKeyboardHeight);

$.chatTableView.appendRow({
	title: L('chatting_guidance')
});

var testButton = Ti.UI.createButton();
$.chatWindow.add( testButton);
testButton.addEventListener('click', function(){
	// alert(Alloy.Globals.users.length);
	// var tuser = Alloy.Globals.users.where({'id_str': yotoo.get('targer_id_str')}).pop();
	// alert(tuser.get('id_str'));
	// alert(Alloy.Globals.chats.length + ", " + chats.length + ", "+ yotoo.get('burned_at'));
		// $.chatTableView.scrollToIndex(conversationCount);
});

var newRows = [];
var addChatTableRow = function(chat, collection, options){
	if( !yotoo.get('chat_group_id') ){
		yotoo.set('chat_group_id', chat.get('chat_group_id') );
		yotoo.save();
	}
	
	var newRow = Alloy.createController('chatTableViewRow', {
		'ownerAccount': ownerAccount,
		'chat': chat,
		'targetUser': targetUser
	}).getView();
	conversationCount++;
	newRows.push( newRow );
		
	if( options.index === chats.length - 1 && newRows.length > 0){
		$.chatTableView.appendRow(newRows);
		$.remainCountToBurn.setText( YOTOO_CONVERSATION_LIMIT - conversationCount);
		newRows = [];
		if( nowScrollBottom ){
			$.chatTableView.scrollToIndex(conversationCount);
		}
	}
	if( conversationCount === YOTOO_CONVERSATION_LIMIT - 10 ){
		alert(L('when_impending_chat_limit'));
	}
	if( conversationCount >= YOTOO_CONVERSATION_LIMIT ){
		alert(L('when_chat_limit'));
		yotoo.burn({'mainAgent': ownerAccount});
		$.chatWindow.close();
	}
};
chats.on('add', addChatTableRow);	// need to release!

for(var j = 0; j < chats.length; j++){
	addChatTableRow(chats.at(j), chats, {'index': j});
}

var fetchChats = function(){
	var since;
	if( yotoo.get('burned_at') ){
		since = yotoo.get('burned_at');
	}
	chats.fetchFromServer({
		'mainAgent': ownerAccount,
		'targetUser': targetUser,
		'since': since,
		'success': function(chats){
		},
		'error': function(e){
			Ti.API.info(JSON.stringify(e));
		}
	});
};
fetchChats();

$.closeButton.addEventListener('click', function(e){
	$.chatWindow.close();
});
$.burnButton.addEventListener('click', function(e){
	// 심각하게 다시 한번 불어 본 뒤 번!
	yotoo.burn({
		'mainAgent' : ownerAccount,
		'withNotification': true
	}); 
	$.chatWindow.close();
});

$.sendButton.addEventListener('click', function(e){
	if( !$.chatTextField.hasText() ){
		return;
	}
	var value = $.chatTextField.getValue();
	chats.createNewChat({
		'mainAgent': ownerAccount,
		'targetUser': targetUser,
		'message': value,
		'success': function(chat){
			$.chatTextField.setValue("");
			$.chatTextField.setHeight(Ti.UI.SIZE);
		},
		'error': function(e){
			if(e.meta.total_results === 0){
				alert(L('deleted_user'));
			}
		}
	});
});


$.chatTextField.addEventListener('focus', function(e){
	$.chatView.setBottom( softKeyboardHeight );
});

$.chatTextField.addEventListener('postlayout', function(){
	// alert("post");
	$.chatTextField.focus();
	// $.chatTableView.scrollToIndex( chats.length -1 );
});

$.chatTableView.addEventListener('doubletap', function(e){
	$.chatTextField.blur();
	$.chatView.setBottom( 0 );
});

// scrollend는 터치가 끝난후 스크롤이 더 있어야 발생하나..
$.chatTableView.addEventListener('scroll', function(e){
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
		$.chatTableView.scrollToIndex(conversationCount );
	}
});

// need to release!
Ti.App.addEventListener("app:newChat:" + targetUser.get('id_str'), fetchChats );

$.chatWindow.addEventListener('open', function(e){
});

$.chatWindow.addEventListener('close', function(){
	Ti.App.removeEventListener("app:newChat" + targetUser.get('id_str'), fetchChats );
	chats.off('add', addChatTableRow);
	chats.reset();
	$.destroy();
	// yotoo.off('change:chat_group_id', resetChatTable);
});






