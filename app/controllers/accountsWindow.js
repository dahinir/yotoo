var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var accounts = Alloy.Globals.accounts;

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
	}
};

$.backgroundView.addEventListener('click', function(e) {
	$.accountsWindow.close();
});

$.addAccountButton.addEventListener('click', function(e){
	Alloy.Globals.accounts.addNewAccount(function(addedAccount){
		if(addedAccount.get('active')){
			$.accountsWindow.close();
			// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
			// .addNewAccount() will call .changeCurrentAccount()
		} else {}
	});
});


accounts.map(function(account){
	var row = Alloy.createController('accountTableRow', {
		"ownerAccount" : account
	}).getView();

	row.addEventListener('click', function(e){
		$.accountsWindow.close();
		if( account !== ownerAccount ){
			// change current account
			Alloy.Globals.accounts.changeCurrentAccount( account );
		}
	});
		
	$.accountsTable.appendRow(row);
});





