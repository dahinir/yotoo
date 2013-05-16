exports.definition = {
	config: {
		columns: {
			// twitter column
			"id_str":"TEXT",
			"id_str_acs": "TEXT",
			"name":"TEXT",
			"screen_name":"TEXT",
			"profile_image_url_https":"TEXT",
			"profile_background_image_url": "TEXT",
			
			// token for login			
			"access_token":"TEXT",
			"access_token_secret":"TEXT",
			
			// for yotoo
			"active":"INTEGER",
			"status_active_tab_index":"INTEGER"
		},
		adapter: {
			idAttribute: "id_str", // 64bit.. but TEXT
			type: "sql",
			collection_name: "account"
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			// extended functions go here
			testFunction: function (attrs){
				Ti.API.info("testFunc: "+ this.get('name'));	// it works!
				for (var key in attrs) {
                    var value = attrs[key];
                    Ti.API.info("testFunction: "+ value);
                }
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
			// extended functions go here
			cloud: require('ti.cloud'),
			// getCloud: function(){
				// return cloud;
			// },
			// setCloud: function( pCloud ){
				// this.cloud = pCloud;
			// },
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
				Ti.API.info("will change to " + currentAccount.get('name'));
				
				// cloud login by twitter
				this.cloud.SocialIntegrations.externalAccountLogin({
					id: currentAccount.get('id_str'),
				    type: 'twitter',
				    token: currentAccount.get('access_token')
				}, function (e) {
				    if (e.success) {
				        var user = e.users[0];
				        Ti.API.debug('[account.js] Cloud login success! id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);
				        currentAccount.set("id_str_acs", user.id);
				        currentAccount.save();
				    } else {
				        alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
				    }
				});
				
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
								Ti.API.info("name: " + newAccount.get('name'));
								// save new account to persistence store
								newAccount.save(); // must call after callback
								Ti.API.debug("[account.js] new account saved");
									
								// accounts managed globally
								Alloy.Globals.accounts.add( newAccount);
								Alloy.Globals.accounts.changeCurrentAccount( newAccount );
								
								callback(newAccount);
							},
							'onFailure': function(){
								Ti.API.debug("[account.js] user.fetchFromServer failure")
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

