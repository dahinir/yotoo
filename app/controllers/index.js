/*
 * index.js
 * 
 * : will be used for globally
 * -rapodor 
 */
// $.index.open();


var accounts = Alloy.Globals.accounts;
var yotoos = Alloy.Globals.yotoos;

/* Backbone events */
// on changed current account, reponse UI, create mainTabGroup is only in this.
accounts.on('change:active', function(e){
	var account = e;
	Ti.API.info("[index.js] BackboneEvent(changed):" + account.get('name') +"\'s active to "+ account.get('active'));
	if( account.get('active') ){	// for new current account
		if( account.mainTabGroup === undefined){
			Ti.API.info("[index.js] mainTabGroup is undefined, so will be created");
			var mainTabGroup = Alloy.createController('mainTabGroup');
			mainTabGroup.init({"ownerAccount":account});
			account.mainTabGroup = mainTabGroup.getView();
			account.mainTabGroup.open();
		} else {
			Ti.API.info("[index.js] mainTabGroup is defined, call maintabGroup.open()");
			// account.mainTabGroup.show();
			account.mainTabGroup.open();
		}
	}else{	// for previous current account	
		if( account.mainTabGroup !== undefined){
			Ti.API.info("[index.js] "+ account.get('name') + " is deactived, maintabGroup.close()");
			// account.mainTabGroup.hide();
			account.mainTabGroup.close();
		}
	}
});
accounts.on('add', function(addedAccount){
	// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
	Ti.API.info("BackboneEvent(added):" + addedAccount.get('name') );
});
accounts.on('remove', function(e){	// how about 'destroy'
	var account = e;
	Ti.API.info("BackboneEvent(removed):" + account.get('name') );
	if( account.mainTabGroup !== undefined){
		account.mainTabGroup.close();
	}
	if( Alloy.Globals.accounts.length === 0 ){
		alert(L('when_delete_last_account'));
		Alloy.createController('welcomeWindow').getView().open();
	}
});

// very first using this app, maybe //
if( accounts.length === 0 ){
	alert(L('when_first_run'));
	Alloy.createController('welcomeWindow').getView().open();
}

var activeCount = 0;
accounts.map(function(account){
	// open active account's mainTabGroup UI
	if(account.get('active') ){
		activeCount++;
		Ti.API.info("[index.js] good!");
		accounts.changeCurrentAccount(account);
	}
}); // accounts.map()

if(accounts.length !== 0 && activeCount === 0){
	Ti.API.info("[index.js] last session was something wrong.");
	accounts.changeCurrentAccount(accounts.at(0));
}




