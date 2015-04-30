var baseUrl = ( ENV_PRODUCTION ? 
			Ti.App.Properties.getString("and-baseurl-production") 
			: Ti.App.Properties.getString("and-baseurl-local"));
// test for twitter
baseUrl = Ti.App.Properties.getString("and-baseurl-production");

			
exports.definition = {
	config: {
		columns: {
			// for And server
			"id": "string",
			"accessToken": "string",
			
			// for 3rd party
			"provider": "string",
			"provider_accessToken": "string",
			"provider_accessTokenSecret": "string",
			
			// common used attributes
			// :이 모델(customer)의 .attributes에 저장되는 것은 여러 써드 파티 중에서 공통적으로 사용되는 것만(ex: 이름, 프로필 이미지,)
			// "name": "string",
			// "profile_picture":"",
			
			// for this app
			// "active": "boolean", // moved to AG.setting.currentCustomerId
			"status_activeTabIndex": "int"
		},
		adapter: {
			"idAttribute" : "id",	// default is alloy_id
			"type": "sqlrest",
			"collection_name": "customer"	// use for sqlite table name
		},
		// idAttribute: 'id',	// default is alloy_id
		URL: baseUrl + "/api/Customers",
		// URL: "https://api.parse.com/1/users",
		disableSaveDataLocallyOnServerError: false,
		// initFetchWithLocalData: true,
	    deleteAllOnFetch: false,
        // headers: {
        	// "access_token": function(){
        		// return "asdf";
        	// },
        	// "Content-Type: application/json",
            // "X-Parse-Application-Id": "98KUiZhoKumwX37r8EIlRKdUUbC2I9LccrckHrcO",
            // "X-Parse-REST-API-Key": "Jh0DDHAoMfJGGlwfSw8ifChk3Tw4KyQBy0JMPNc4"
        // },
		debug: 1, 
		// "useStrictValidation": 1, // validates each item if all columns are present
		
	    // optimise the amount of data transfer from remote server to app
	    addModifedToUrl: true,
	    lastModifiedColumn: "modified",
	    
	    // "eTagEnabled" : true,
        // "deleteAllOnFetch": true,	// delete all models on fetch
		parentNode:"results"
		// .parentNode called only from Remote, not local db
		// parentNode: function (data) {
		    // var entries = [];
		    // _.each(data.results, function(_entry) {
		    	// // alert(JSON.stringify(_entry));
		        // var entry = {};
// 		
		        // entry.id = _entry.id;
		        // entry.data = _entry.data;
		        // // .parentNode called only from Remote, not local db
		        // // entry.viewed = 0;
// 		
		        // entries.push(entry);
		    // });
		    // return entries;
		// }
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			initialize: function(e, e2){
					// alert(e);
				// AG.users중에 자신의 프로필을 골라 셋팅(twitter 유저면 twitterApi 셋팅 )
				if( e.provider.toLowerCase() == "twitter"){
					this.externalApi = require('twitter').create({
						accessTokenKey: this.get('provider_accessToken'),
						accessTokenSecret: this.get('provider_accessTokenSecret')
					}); 
					// Ti.API.info(this.get('external_access_token'));
					// alert( this.externalApi.getAccessTokenKey());
				}
			},
			sync : function(method, model, opts){
				// alert(opts);
				opts = opts || {};
				opts.headers = _.extend( opts.headers || {},
					this.getHeaders()
				);
				// return Backbone.sync(method, model, opts);
				return require("alloy/sync/" + this.config.adapter.type).sync.call(this, method, model, opts);
			},
			getHeaders: function(){
				return {
					// And server access token
					"authorization" : this.get("accessToken")
				};
			},
			getYotoos: function(){
				Ti.API.info("[customer.js] .getYootoos()");
				if( this.yotoos ){
					// alert("exist yotoos: " + this.yotoos.length);
				}else{
					// this.yotoos = Alloy.createCollection('yotoo').fetch({
						// query: "SELECT * FROM yotoo WHERE source_id = "+ this.get('id')
					// });
					this.yotoos = Alloy.createCollection('yotoo');
					this.yotoos.ownerCustomer = this;
					this.yotoos.fetch({
						localOnly: true,
						sql: {  
					        where: {  
					            senderId: this.get('id')
					        }
					        // wherenot: {
					            // title: "Hello World"
					        // },
					        // orderBy:"title",
					        // offset:20,
					        // limit:20,
					        // like: {
					            // description: "search query"
					        // }
					    }
					});
					// var relevantYotoos = AG.yotoos.where({'source_id': this.get('id')});
					// this.yotoos = Alloy.createCollection('yotoo', relevantYotoos);
				}
				return this.yotoos;
			},
			createCollection: function(name, options){
				var collection = Alloy.createCollection(name, options);
				collection.ownerCustomer = this;
				return collection;
			}
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			cleanup: function(){
				// Ti.API.info(this.config);
				this.fetch({
					localOnly: true,
					query:'DROP TABLE IF EXISTS ' + this.config.adapter.collection_name
				});
			},
			// changeCurrentCustomer: function(currentCustomer){
				// Ti.API.info("[customer.js] will change to " + currentCustomer.get('id'));
				// AG.setting.save('currentCustomerId', currentCustomer.get('id'));
			// },
			getCurrentCustomer: function(){
				return AG.customers.get(AG.setting.get('currentCustomerId')) || AG.customers.at(0);
			},
			deleteCustomer: function(customer){
				AG.customers.remove(customer);
			},
			addNewCustomer: function(callback){
				var webWindowController = Alloy.createController('webWindow', {title:L("login_via_twitter")});
				var webView = webWindowController.getWebView();
				
				// Ti.Network.removeHTTPCookiesForDomain("yotoo.co");
				Ti.Network.removeAllHTTPCookies();
				
				webView.addEventListener('beforeload', function(e){
					if( e.url == 'https://api.twitter.com/oauth/cancelforyotoobabe_'){
						webView.stopLoading();
						webWindowController.getView().close();
					}
				});
				
				webView.addEventListener('load', function(e){
					Ti.API.info("[customer.js] afterload: "+e.url);
					
					var accessToken = (e.source.evalJS('if(document.getElementById("yt:accessToken")){document.getElementById("yt:accessToken").getAttribute("content");}'));
					// login sucess!!
					if( accessToken ){
						Ti.API.info("[customer.js] there is access token~");
						// AG.tt =  e.source.evalJS('user;');
						// alert( yotooAccessToken);
						var newCustomer = Alloy.createModel('customer',{
							// "tt":"t+_haha"
							// localOnly: true,
							"id" : e.source.evalJS('document.getElementById("yt:id").getAttribute("content");'),
							"accessToken": accessToken,
							"provider": "twitter",
							"provider_accessToken": e.source.evalJS('document.getElementById("tw:accessToken").getAttribute("content");'),
							"provider_accessTokenSecret": e.source.evalJS('document.getElementById("tw:accessTokenSecret").getAttribute("content");'),
							"status_activeTabIndex": 0
						});
						Ti.API.debug(newCustomer);
						// must save() with id attr, DON'T USE model.set('id'), model.id is metaAttribute
						newCustomer.save(undefined,{
							localOnly: true
						});
						AG.customers.add( newCustomer );
						
						AG.setting.set("currentCustomerId", newCustomer.get('id'));
						AG.setting.save();
						
						if(_.isFunction(callback)){
							callback(newCustomer);
						}
						webWindowController.getView().close();
					}else{
						e.source.evalJS('if(document.getElementById("cancel")){document.getElementById("cancel").addEventListener("touchend", function(){ location.replace("cancelforyotoobabe_"); }); }');
						// e.source.evalJS('if(document.getElementById("username_or_email")){document.getElementById("username_or_email").focus() }');			
					}
				});
				
				webView.setUrl(baseUrl + "/auth/twitter");
				webWindowController.getView().open();
			} // end of .addNewCustomer()
			
			/*
			addNewCustomer_parse: function(){
				var twitterApi = require('twitter').create();
						Ti.API.info("before====");
						Ti.API.info(twitterApi.getAccessTokenKey());
						Ti.API.info(twitterApi.getAccessTokenSecret());
				twitterApi.authorize({
					'onSuccess': function(){
						var newCustomer = Alloy.createModel('customer');
						
						twitterApi.fetch({
							"purpose": 'profile',
							"params":{
								'include_entities': true,
								'skip_status': true
							},
							"onSuccess": function( resultJSON ){
								_.extend(resultJSON );
								Ti.API.info(resultJSON);
								newCustomer.set({
									"authData" : {
										"twitter" : {
											"id" : resultJSON.id_str,
											"screen_name" : resultJSON.screen_name,
											"consumer_key" : require('tokens').twitter.consumerKey,
											"consumer_secret" : require('tokens').twitter.consumerSecret,
											"auth_token" : twitterApi.getAccessTokenKey(),
											"auth_token_secret" : twitterApi.getAccessTokenSecret()
										}
									}
								});
								newCustomer.save();
							},
							"onFailure": function(){
								Ti.API.info("[customer.js] twitterApi.fetch failure");
							}
						});
					},
					'onFailure': function(){
						Ti.API.info("failure");
					}
				});
			}
			*/

		});
		return Collection;
	}
};

