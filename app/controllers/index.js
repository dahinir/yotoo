/*
 * index.js
 * 
 * : will be used for globally
 * -rapodor 
 */
// $.index.open();


// load loged account from persistent storage //
// This will create a singleton if it has not been previously created, or retrieves the singleton if it already exists.
var accounts = Alloy.Collections.instance('account');
// var accounts = Alloy.createCollection('account');
accounts.fetch();
Ti.API.debug("[index.js] " + accounts.length + " loged in accounts loaded");
Alloy.Globals.accounts = accounts;

// Backbone events //
// on changed current account, reponse UI, create mainTabGroup is only in this.
accounts.on('change:active', function(e){
	var account = e;
	Ti.API.info("BackboneEvent(changed):" + account.get('name') +"\'s active to "+ account.get('active'));
	if( account.get('active') ){	// for new current account
		if( account.mainTabGroup === undefined){
			Ti.API.info("mainTabGroup is undefined, so will created");
			var mainTabGroup = Alloy.createController('mainTabGroup');
			mainTabGroup.init({"ownerAccount":account});
			account.mainTabGroup = mainTabGroup.getView();
			account.mainTabGroup.open();
		} else {
			Ti.API.info("mainTabGroup is defined, so call .show()");
			account.mainTabGroup.show();
			// account.mainTabGroup.open();
		}
	}else{	// for previous current account	
		if( account.mainTabGroup !== undefined){
			Ti.API.info(account.get('name') + "is deactived, maintabGroup.hide()");
			account.mainTabGroup.hide();
			// account.mainTabGroup.close();
		}
	}
});
accounts.on('add', function(e){
	// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
	var account = e;
	Ti.API.info("BackboneEvent(added):" + account.get('name') );
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


// var TwitterAdapter = require('twitter');
var twitterAdapter = require('twitter');
var activeCount = 0;
// load every account from persistence store
accounts.map(function(account){
	Ti.API.debug("[index.js] load account: " + account.get('name')+" "+account.get('access_token')+" ," +account.get('id_str')+", "+ account.id);
	// var twitterAPI = new TwitterAdapter.Twitter(TwitterAdapter.tokens);
	// twitterAPI.setAccessToken(account.get('access_token'), account.get('access_token_secret'));
	// account.twitterAPI = twitterAPI;

	account.twitterApi = twitterAdapter.create({
		accessTokenKey: account.get('access_token'),
		accessTokenSecret: account.get('access_token_secret')
	});

	// open active account's mainTabGroup UI
	if(account.get('active')){
		activeCount ++;
		Alloy.Globals.accounts.changeCurrentAccount(account);
	}
}); // accounts.map()
if(accounts.length !== 0 && activeCount === 0){
	Alloy.Globals.accounts.changeCurrentAccount(accounts.at(0));
}

if( !ENV_PRODUCTION ){
	Ti.API.info("current compiler target is not built for production. ")
	accounts.cloud.debug = true;  // optional; if you add this line, set it to false for production
}

// accounts.cloud.PushNotifications.subscribe({
    // channel: 'friend_request',
    // device_token: myPushDeviceToken
// }, function (e) {
    // if (e.success) {
        // alert('Success');
    // } else {
        // alert('Error:\n' +
            // ((e.error && e.message) || JSON.stringify(e)));
    // }
// });

// test //
/*
var tweets = Alloy.Globals.accounts.getCurrentAccount().createCollection('tweet');
Ti.API.info("tweets.length: "+ tweets.length);
tweets.fetchFromServer({
	purpose: 'timeline',
	count: 1,
	onSuccess: function(){
		Ti.API.info('success to fetch '+tweets.length + "tweets.");
		Ti.API.info( );
	},
	onFailure: function(){Ti.API.info('failure');}
});
*/


