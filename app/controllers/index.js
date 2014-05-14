/*
 * index.js
 * 
 */
var accounts = Alloy.Globals.accounts;
var yotoos = Alloy.Globals.yotoos;

/* Backbone events */
// on changed current account, reponse UI, create mainTabGroup is only in this.
accounts.on('change:active', function(account){
	Ti.API.info("[index.js] BackboneEvent(changed):" + account.get('name') +"\'s active to "+ account.get('active'));
	
	// actived account
	if( account.get('active') ){	// for new current account
		if( account.mainTabGroup ){
			Ti.API.info("[index.js] mainTabGroup is defined, call maintabGroup.open()");
			// account.mainTabGroup.show();
			account.mainTabGroup.open();
		}else {
			Ti.API.info("[index.js] mainTabGroup is undefined, so will be created");

			var mainTabGroup = Alloy.createController('mainTabGroup', {
				"ownerAccount" : account
			}); 
			account.mainTabGroup = mainTabGroup.getView();
			account.mainTabGroup.open();
		}
	// deactived account
	}else{	
		if( account.mainTabGroup ){
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
accounts.on('remove', function(account){	// how about 'destroy'
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
	// alert(L('when_first_run'));
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
	Ti.API.info("[index.js] last session was something wrong.   ");
	accounts.changeCurrentAccount(accounts.at(0));
}


// telegrams from server!
var showTelegrams = function(telegrams){
	telegrams.each(function(telegram){
		if( !telegram.get('viewed') ){
			alert(JSON.parse(telegram.get('data') || '').message);
			// telegram.destroy({localOnly: true});
			// telegram.save({'viewed': 1}, {localOnly: true});
		}
		Ti.API.info("hahahahahah:    "+telegram.get('id'));
	});
	// alert(telegrams.length);
	// alert(telegram.get('data').message);
};
var telegrams = Alloy.createCollection('telegram');
telegrams.on('fetch', function(e, e2){
	// alert('f');
	if( e && !e.serverData){
		// alert("this from local");
	}else{
		// fetch success on server
		showTelegrams(telegrams);
	}
});
telegrams.fetch({
	// localOnly: true,
	// disableSaveDataLocallyOnServerError: false,
	urlparams:{
		condition: JSON.stringify(AG.platform)
	},
	success: function(tels, res){
		// alert(tels.length);
		telegrams.each(function(tel){
			Ti.API.info("local:  "+tel.get('id'));
			// alert(tel.attributes);
			// telegram.destroy({localOnly: true});
			// return;
			// tel.save({'viewed': 1}, {localOnly: true});
			// if( !tel.get('viewed') ){
				// alert("new telegram!  ");
			// }
			// alert(tel.attributes);
		});
	},
	error: function(e){
		// Ti.API.info(telegrams.size());
		// i don't know why duplicated models in collection when fetch error
		// while( telegrams.size() > telegrams.length ){
			// Ti.API.info(telegrams.size() + ",   " + telegrams.length);
		// }
		// telegrams.each(function(tel){
			// Ti.API.info("asdhf:"+ tel.get('id'));
		// });
		// fetch error on server, so show telegram of local
		showTelegrams(telegrams);
	}
});
/*
tel.fetch({
	// localOnly: true,
	urlparams: {
		condition: JSON.stringify(AG.platform)
	},
	// add : true,
	success: function(tels, response){
		tels.each(function(tel){
			if( !!tel.get('viewed') ){
				alert("true");
			}else{
				alert("false");
			}
		});
		// alert(tel.at(0).get('viewed'));
		// alert(JSON.stringify(collection));
		// alert(JSON.stringify(response));
		// alert(tel.at(0).attributes);
	}
});
*/

