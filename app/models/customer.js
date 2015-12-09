// wrapping twiiterUser, instaUser..
// KEEP CUSTOMERS FAT!!
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
			"provider": "string",	// "twitter"
			"provider_id": "string",	// external id
			"provider_accessToken": "string",
			"provider_accessTokenSecret": "string",

			// common used attributes
			// :이 모델(customer)의 .attributes에 저장되는 것은 yotoo앱에서 진짜 쓰는 것만
			"profile_username": "string",
			"profile_picture": "string",

			// for this app
			"status_activeTabIndex": "int"
		},
		adapter: {
			"idAttribute" : "id",	// default is alloy_id
			"type": "sqlrest",
			"collection_name": "customer"	// use for sqlite table name
		},
		URL: baseUrl + "/api/Customers",
		// URL: "https://api.parse.com/1/users",
		disableSaveDataLocallyOnServerError: true,
		// initFetchWithLocalData: true,
		// returnErrorResponse: true,
    deleteAllOnFetch: false,
        // headers: {
        	// "access_token": function(){
        		// return "asdf";
        	// },
        	// "Content-Type: application/json",
            // "X-Parse-Application-Id": "98KUiZhoKumwX37r8EIlRKdUUbC2I9LccrckHrcO",
            // "X-Parse-REST-API-Key": "Jh0DDHAoMfJGGlwfSw8ifChk3Tw4KyQBy0JMPNc4"
        // },

		// "useStrictValidation": 1, // validates each item if all columns are present

	    // optimise the amount of data transfer from remote server to app
	    // addModifedToUrl: true,
	    // lastModifiedColumn: "modified",

	    // "eTagEnabled" : true,
		// parentNode: "results"
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
		// },

		debug: 1
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			initialize: function(e, e2){
				Ti.API.info("[customer.js] initialize customer. cid:  "+ this.cid);
				// alert( this.get("provider_id") +"\n" + e.provider + "\n"+ "haha");

				var self = this;
				// self.on("change",function(e){
				// 	console.log("[customer.js] customer changed");
				// });

				if (!self.get("provider") || !self.get("provider_id") || !self.get("provider_accessToken") || !self.get("provider_accessTokenSecret")) {
				  Ti.API.error("[customer.js] init error");
				  alert("[customer.js] init error");
				  return;
				}

				// for yos
				var yos = Alloy.createCollection("yo", {
					customer: self
				});
				// yos.customer = self;
				yos.fetch({
					localOnly: true,
					// add: true,	// I don't know but if "add" setted as true, problem
					sql: {
								where: {
										provider: self.get("provider"),
										senderId: self.get("provider_id")
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
				this.yos = yos;

				// for userIdentity
				var userIdentity;
				switch (self.get("provider") && self.get("provider").toLowerCase()) {
					case "twitter":
						userIdentity = Alloy.createModel("twitterUser", {
								"id_str": self.get('provider_id')
						});
						userIdentity.externalApi = require('twitter').create({
							accessTokenKey: self.get('provider_accessToken'),
							accessTokenSecret: self.get('provider_accessTokenSecret')
						});
						userIdentity.on("remoteRefesh", function(userIdentity) {
							self.set({
								"profile_username": userIdentity.get("name"),
								"profile_picture": userIdentity.get("profile_image_url_https")
							});
							self.save(undefined, {localOnly:true});
						});
						break;
					default:
						console.log("[customer.js] there is no proper provider.");
				}
				userIdentity.refresh();
				this.userIdentity = userIdentity;
				// self.refresh();	// fetch from server

				// for yoUsers
				var yoUsers = Alloy.createCollection(self.get("provider")+"User");
				// sort this users by order of yo id
				yoUsers.comparator = function(user) {
					// `yos` is this cumstomer's yo
					var yo = yos.where({
						"provider": self.get("provider"),
						"receiverId": user.id
				 	}).pop();
					var date = yo.get("modified") || yo.get("created");
					return -(new Date(date)).getTime();
				};
				yoUsers.externalApi = userIdentity.externalApi;
				yoUsers.addByIds({ userIds: yos.getIds() });

				yoUsers.on("add change", function(user){
					// yo users should be saved (sqlite)
					user.save();
				});
				yos.on("add reset", function(model, collection, options){
					// alert("[customer.js] yos add event fired.");
					yoUsers.addByIds({ userIds: yos.getIds() });
				});
				yos.on("change:hided", function(yo){
				});
				this.yoUsers = yoUsers;

				// Installation for push notification
				var installation = Alloy.createModel("installation", {
					customer: self
				});
				installation.fetch({
					localOnly: true,
					// add: true,	// I don't know but if "add" setted as true, problem
					sql: {
								where: {
										provider: self.get("provider"),
										senderId: self.get("provider_id")
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
				AG.setting.on("change:deviceToken", function(e){
					// allow notification or changed device
					Ti.API.debug("[customer.js] setting.deviceToken changed.");
					Ti.API.debug(e);
					// installation = {inst:"haha"};
				})
				this.on("destroy", function(e){
					Ti.API.debug("[customer.js] destroy event fired.");
					Ti.API.debug(e);
				});
				this.installation = installation;
			},	// end of initialize
			sync : function(method, model, opts){
				// alert(opts);
				console.log("[customer.js] .sync() called   ");
				opts = opts || {};
				opts.headers = _.extend( opts.headers || {},
					this.getHeaders()
				);
				// return Backbone.sync.call(this, method, model, opts);
				return require("alloy/sync/" + this.config.adapter.type).sync.call(this, method, model, opts);
			},
			getHeaders: function(){
				return {
					// And server access token
					"authorization" : this.get("accessToken")
				};
			},
			refresh: function(options){
				Ti.API.info("[customer.js] .refresh() ");
				var options = options || {},
					self = this,
					userIdentity = this.userIdentity;

				this.fetch({
					// "urlparams" : {
          //   filter : JSON.stringify({ include:["identities"] })
	        // },
					"success": function(){
						self.save(undefined, {localOnly:true});
					}
				});

				userIdentity.refresh({
					"force": options.force,
					"success": function(){
						// switch (model.get("provider")) {
						// 	case "twitter":
						// 		break;
						// }
					}
				});
			},
			createCollection: function(name, options){
				if(name == "user"){
					name = this.get("provider") + "User";
				}
				var collection = Alloy.createCollection(name, options);
				collection.externalApi = this.userIdentity.externalApi;
				return collection;
			},

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
						Ti.API.info("[customer.js] there is access token!");
						// AG.tt =  e.source.evalJS('user;');
						var customerId = e.source.evalJS('document.getElementById("yt:id").getAttribute("content");');
						var	newCustomer = AG.customers.get(customerId);
						var	customerObj = {
								"accessToken": accessToken,
								"provider": "twitter",
								"provider_id": e.source.evalJS('document.getElementById("tw:id").getAttribute("content");'),
								"provider_accessToken": e.source.evalJS('document.getElementById("tw:accessToken").getAttribute("content");'),
								"provider_accessTokenSecret": e.source.evalJS('document.getElementById("tw:accessTokenSecret").getAttribute("content");'),
								"status_activeTabIndex": 0
							};

						if( newCustomer ){
							newCustomer.set(customerObj);
						}else{
							customerObj.id = customerId;
							newCustomer = Alloy.createModel('customer', customerObj);
						}

						Ti.API.debug(newCustomer);
						// must save() with id attr, DON'T USE model.set('id'), model.id is metaAttribute
						newCustomer.save(undefined,{
							localOnly: true
						});
						AG.customers.add( newCustomer );

						AG.setting.set("currentCustomerId", newCustomer.id);
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

		});
		return Collection;
	}
};
