var args = arguments[0] || {};
// DO NOT! var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var ownerAccount = args.ownerAccount;

// alert("[accountRow.js] account.get(name):"+ ownerAccount.get('name') );

$.profileImage.image = ownerAccount.get('profile_image_url_https');
$.name.text = ownerAccount.get('name');
$.screenName.text = ownerAccount.get('screen_name');



// swipe for delete
if( OS_IOS ){
	$.accountRow.setEditable(true);

	$.accountRow.addEventListener('delete', function(e){
		// alert("dd");
		Alloy.Globals.accounts.deleteAccount( ownerAccount);
	});

}
