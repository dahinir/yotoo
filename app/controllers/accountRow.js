var args = arguments[0] || {};
// var ownerAccount = args.ownerAccount;
var account = args.account;

Ti.API.info("[accountRow.js] account.get(name):"+ account.get('name') );

$.profileImage.image = account.get('profile_image_url_https');
$.name.text = account.get('name');
$.screenName.text = account.get('screen_name');



// swipe for delete
if( OS_IOS ){
	$.accountRow.setEditable(true);

	$.accountRow.addEventListener('delete', function(e){
		Alloy.Globals.accounts.deleteAccount( account);
	});

}
