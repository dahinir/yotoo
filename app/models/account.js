exports.definition = {
	config: {
		columns: {
			// twitter column
			"id_str":"string",
			"name":"string",
			"screen_name":"string",
			"profile_image_url_https":"string",
			"profile_background_image_url": "string",
			
			// twitter token for login			
			"access_token":"string",
			"access_token_secret":"string",
			
			// for ACS
			"id_str_acs": "string",
			// "session_id_acs": "string",
			
			// for this app
			"active":"boolean",
			"status_active_tab_index":"int"
		},
		adapter: {
			// idAttribute: "id_str", // 64bit.. but TEXT
			type: "sql",
			collection_name: "account"
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			
			testFunction: function (attrs){
				Ti.API.info("testFunc: "+ this.get('name'));	// it works!
				for (var key in attrs) {
                    var value = attrs[key];
                    Ti.API.info("testFunction: "+ value);
                }
			},
			yotooTo: function( targetAccount ){
				Ti.API.info("[account.js] yotoo!! " + this.get('name') + " to " + targetAccount.get('name') );
				Alloy.Collections.instance('yotoo').addNewYotoo( this, targetAccount);
			},
			getYotooCollection: function(){
				return Alloy.Collections.instance('yotoo').where({'source_id_str': this.get('id_str')});
			},
			createCollection: function(typeOfCollection){
				var collection = Alloy.createCollection(typeOfCollection);
				collection.twitterApi = this.twitterApi;
				return collection;
			},
			createModel: function(typeOfModel){
				var model = Alloy.createModel(typeOfModel);
				model.twitterApi = this.twitterApi;
				return model;
			}
		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			
			getCurrentAccount: function(){
				var currentAccount;
				var activeFlag = 0;
				Alloy.Globals.accounts.map(function(account){
					if(account.get('active')){
						currentAccount = account;
						activeFlag++;
					}
				});
				if( activeFlag !== 1){
					Ti.API.warn("now currentAccount is " + activeFlag + ". this is account.js");
				}
				return currentAccount;
			},
			changeCurrentAccount: function(currentAccount){
				Ti.API.info("[account.js] will change to " + currentAccount.get('name'));
				
				var isInCollection = false;
				Alloy.Globals.accounts.map(function(account){
					if(account.get('active')){
						account.set('active', false);
						account.save();
					}
					if(account === currentAccount){
						Ti.API.info(currentAccount.get('name') +" is in Collection");
						isInCollection = true;
					}
				});
				if( !isInCollection ){
					Ti.API.info(currentAccount.get('name')+" will added in Collection");
					Alloy.Globals.accounts.add(currentAccount);
				}
				currentAccount.set('active', true);
				currentAccount.save();
				
				Alloy.Globals.currentAccount = currentAccount;
			},
			deleteAccount: function (account){
				Ti.API.debug("before delete: " + Alloy.Globals.accounts.length);
				var currentAccountDeleted = account.get('active');
				
				Alloy.Globals.accounts.remove(account);
				account.destroy();
				
				if( currentAccountDeleted && Alloy.Globals.accounts.length > 0){
					Alloy.Globals.accounts.changeCurrentAccount( Alloy.Globals.accounts.at(0) );
				}
				
				Ti.API.debug("after delete: " + Alloy.Globals.accounts.length);
			},
			addNewAccount: function (callback){
				var newAccount = Alloy.createModel('account');
				var twitterAdapter = require('twitter');
				////// var twitterAPI = new TwitterAdapter.Twitter(TwitterAdapter.tokens);
				var twitterApi = twitterAdapter.create();
				
				// log in via webView
				twitterApi.authorize({
					'onSuccess': function(){
						// Ti.API.debug("authorize success");
						// after log in.
						newAccount.set({
							'access_token': twitterApi.getAccessTokenKey(),
							'access_token_secret': twitterApi.getAccessTokenSecret()
						});
						
						// newAccount.set('active', true);
						newAccount.set('status_active_tab', 0);
						newAccount.twitterApi = twitterApi;
						Ti.API.debug("[account.js] accessTokenKey: " + newAccount.get('access_token'));
						Ti.API.debug("[account.js] accessTokenSecret: " + newAccount.get('access_token_secret'));
						/////var user = Alloy.createModel('User');
						/////user.ownerAccount = newAccount;
						var user = newAccount.createModel('user');
						
						user.fetchFromServer({
							'purpose': 'profile',
							'params': {},
							'onSuccess': function(){
								newAccount.set({
									'id_str': user.get('id_str'),
									'name': user.get('name'),
									'screen_name': user.get('screen_name'),
									'profile_image_url_https': user.get('profile_image_url_https').replace(/_normal/g, '_bigger'),
									'profile_background_image_url': user.get('profile_background_image_url')
								});
								Ti.API.info("[account.js] name: " + newAccount.get('name'));
								
								// cloud externalAccount create (twitter) //
								var Cloud = require('cloudProxy').getCloud();
								Cloud.externalAccountLoginAdapter({
									id: user.get('id_str'),
									type: 'twitter',
									token: newAccount.get('access_token')
								}, function (e) {
								    if (e.success) {
								        var user = e.users[0];
								        Ti.API.info('[account.js] Cloud login success! sessionId:'+Cloud.sessionId+ ' id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);
								        newAccount.set('id_str_acs', user.id);
								        newAccount.save();
								        // alert('[account.js] current '+ currentAccount.get('session_id_acs') );
								        
								        // push notification subscribe.. only fo iOS?
										Cloud.PushNotifications.subscribe({
										    channel: 'yotoo',
										    type: 'ios',
										    device_token: Ti.Network.getRemoteDeviceUUID()
										}, function (e) {
										    if (e.success) {
										        alert('Success subscribe');
										    } else {
										        alert('Error subscribe:\n' + ((e.error && e.message) || JSON.stringify(e)));
										    }
										});								        
								    } else {
								        Ti.API.info('[accounts.js] Error: ' + ((e.error && e.message) || JSON.stringify(e)));
								    }
								});
								
								/* 이 로직은 user 모델에  있어야 겠지? refreshFriends() 같은 메소드에 
								// retrieve friends for auto complete //
								if( user.get('followers_count') < 300 ){
									Ti.API.info("[account.js] follower is under 300");
								}
								if( user.get('friends_count') < 300 ){
									Ti.API.info("[account.js] following is under 300");
								}
								*/
								
								// save new account to persistence store
								newAccount.save(); // must call after callback
								Ti.API.info("[account.js] new account saved");
									
								// accounts managed globally
								Alloy.Globals.accounts.add( newAccount);
								Alloy.Globals.accounts.changeCurrentAccount( newAccount );
								
								callback(newAccount);
							},
							'onFailure': function(){
								Ti.API.info("[account.js] user.fetchFromServer failure")
							}
						});	// user.getUser()
						

					},
					'onFailure': function(){
						Ti.API.debug("[account.js] fail to add account");
					}
				});	// twitterAPI.authorize()
			}	// addNewAccount
		}); // end extend
		
		return Collection;
	}
		
}

