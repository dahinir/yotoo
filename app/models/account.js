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
			"id": "string",
			// "session_id_acs": "string",
			
			// for this app
			"active": "boolean",
			"status_active_tab_index": "int"
		},
		adapter: {
			idAttribute: "id",	// ACS id
			type: "sql",
			collection_name: "account"
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			'initialize': function(e, e2){
				// alert("init" + JSON.stringify(e));
				// alert("init2" + JSON.stringify(e2));
			},
			/* custom functions */
			'getYotoos': function(){
				if( this.yotoos ){
					// alert("exist yotoos: " + this.yotoos.length);
				}else{
					var relevantYotoos = Alloy.Globals.yotoos.where({'source_id_str': this.get('id_str')});
					this.yotoos = Alloy.createCollection('yotoo', relevantYotoos);
				}
				return this.yotoos;
			},
			// 'getChats': function(){
				// if( this.chats ){
				// }else {
					// var relevantChats = [];
					// this.getYotoos().map(function(yotoo){
						// if( yotoo.get('chat_group_id') ){
							// if(relevantChats.length > 0){
								// relevantChats.concat( Alloy.Globals.chats.where({'chat_group_id': yotoo.get('chat_group_id')}) );
							// }else{
								// relevantChats = Alloy.Globals.chats.where({'chat_group_id': yotoo.get('chat_group_id')});
							// }
						// }
					// });
					// this.chats = Alloy.createCollection('chat', relevantChats);
				// }
				// // all chats relevant this account
				// return this.chats;
			// },
			'createCollection': function(typeOfCollection){
				var collection = Alloy.createCollection(typeOfCollection);
				collection.twitterApi = this.twitterApi;
				return collection;
			},
			'createModel': function(typeOfModel){
				var model = Alloy.createModel(typeOfModel);
				model.twitterApi = this.twitterApi;
				return model;
			}
		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			// 'comparator': function(account){
				// return account.get('id_str');
			// },
			/* custom functions */
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
						account.set('active', 0);	// false
						account.save();
					}
					if(account === currentAccount){
						Ti.API.info("[account.js] " + currentAccount.get('name') +" is in Collection");
						isInCollection = true;
					}
				});
				if( !isInCollection ){
					Ti.API.info(currentAccount.get('name')+" will added in Collection");
					Alloy.Globals.accounts.add(currentAccount);
				}
				currentAccount.set('active', 1);	// ture
				currentAccount.save();
				
				Alloy.Globals.currentAccount = currentAccount;
			},
			deleteAccount: function (account){
				Ti.API.debug("before delete: " + Alloy.Globals.accounts.length);
				
				var cloudApi = require('cloudProxy').getCloud();
				cloudApi.excuteWithLogin({
					'mainAgent': account,
					'method': 'unsubscribePushNotification',
					'onSuccess': function(e){
				        Ti.API.info('[accounts.js] Success subscribe');
					},
					'onError': function(e){
				        Ti.API.info('[accounts.js] Error acs login: ' + ((e.error && e.message) || JSON.stringify(e)));
					}
				});
				
				// don't delete acs user!!
				
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
				var twitterApi = twitterAdapter.create();
				
				// log in via webView
				twitterApi.authorize({
					'onSuccess': function(){
						newAccount.set({
							'access_token': twitterApi.getAccessTokenKey(),
							'access_token_secret': twitterApi.getAccessTokenSecret(),
							'status_active_tab': 0
						});
						// authorized twitter api
						newAccount.twitterApi = twitterApi;

						// Ti.API.debug("[account.js] accessTokenKey: " + newAccount.get('access_token'));
						// Ti.API.debug("[account.js] accessTokenSecret: " + newAccount.get('access_token_secret'));

						var user = newAccount.createModel('user');
						
						
						user.fetchFromServer({
							'purpose': 'profile',
							'params': {},
							'success': function(){
								newAccount.set({
									'id_str': user.get('id_str'),
									'name': user.get('name'),
									'screen_name': user.get('screen_name'),
									'profile_image_url_https': user.get('profile_image_url_https').replace(/_normal/g, '_bigger'),
									'profile_background_image_url': user.get('profile_background_image_url')
								});
								Ti.API.info("[account.js] name: " + newAccount.get('name'));
								
								var yotoos = newAccount.getYotoos();
								yotoos.fetchFromServer({
									'mainAgent': newAccount,
									'success': function(){
										yotoos.map(function(yotoo){
											yotoo.save();
										});
									},
									'error': function(){}
								});

								// cloud externalAccount create (twitter) //
								var cloudApi = require('cloudProxy').getCloud();
								cloudApi.externalAccountLoginAdapter({
									'id': user.get('id_str'),
									'type': 'twitter',
									'token': newAccount.get('access_token'),
									'onSuccess': function(e){
								        var user = e.users[0];
								        Ti.API.info('[account.js] Cloud login success! sessionId:'+cloudApi.sessionId+ ' id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);

								        newAccount.set('id', user.id);
										// must save() with id attr.
								        newAccount.save();
								        
										// accounts managed globally
										Alloy.Globals.accounts.add( newAccount);
										Alloy.Globals.accounts.changeCurrentAccount( newAccount );
										
										callback(newAccount);
								        
								        // push notification subscribe..
										cloudApi.excuteWithLogin({
											'mainAgent': newAccount,
											'method': 'subscribePushNotification',
											'onSuccess': function(e){
										        Ti.API.info('[accounts.js] Success subscribe');
											},
											'onError': function(e){
												// 반드시 성공 시켜야 한다.. 
										        Ti.API.info('[accounts.js] Error subscribe: ' + ((e.error && e.message) || JSON.stringify(e)));
											}
										});
									},
									'onError': function(){
								        Ti.API.info('[accounts.js] Error acs login: ' + ((e.error && e.message) || JSON.stringify(e)));
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
							},
							'error': function(){
								Ti.API.info("[account.js] user.fetchFromServer failure");
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
		
};

