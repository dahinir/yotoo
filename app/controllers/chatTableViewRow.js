var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var chat = args.chat;
var targetUser = args.targetUser;
var user; // user for this Row

if( chat.get('sender_id_str') === ownerAccount.get('id_str') ){
	user = ownerAccount;
}else if(chat.get('sender_id_str') === targetUser.get('id_str')){
	user = targetUser;
}else{
	Ti.API.info("[chatTableViewRow.js] invalid row");
}


// setting tweet
$.id.text = chat.id || '';
if( true ){	// for retina display
	$.profileImage.image = user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.');
}else {
	$.profileImage.image = user.get('profile_image_url_https');
}

$.screenName.text = user.get('screen_name');
$.createdAt.text = new Date(chat.get('created_at')).toRelativeTime();
$.message.text = _.unescape(chat.get('message'));

$.profileImage.addEventListener('click', function(e) {
	alert('hi');
});




