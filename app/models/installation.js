var baseUrl = ( ENV_PRODUCTION ?
			Ti.App.Properties.getString("and-baseurl-production")
			: Ti.App.Properties.getString("and-baseurl-local"));

// test for local
baseUrl = Ti.App.Properties.getString("and-baseurl-local");

exports.definition = {
	config: {
		columns: {
			// for And server
			id: "string",

			appId: "string",
	    appVersion: "string",
	    badge: "int",
	    deviceToken: "string",	// required
	    deviceType: "string",	// required
			// "created": "datetime",
	    // "modified": "datetime",
	    userId: "string" // required
		},
    defaults: {
    	appId: AG.platform.appId
    },
		adapter: {
			// 'migration': ,
			idAttribute: "id",	// default is alloy_id
			type: "sqlrest",
			collection_name: "installation"
		},
		debug: 1,
		URL: baseUrl + "/api/Installations",
		initFetchWithLocalData: true,
    deleteAllOnFetch: false,
		disableSaveDataLocallyOnServerError: true,	// important!!
		// headers: function(){
			// return "asdf";
			// "i":"ii"
			// "access_token": function(){
			// 	return "asdf";
		// },

		// optimise the amount of data transfer from remote server to app
    addModifedToUrl: true,
    lastModifiedColumn: "modified"
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
      // defaults: {
      	// 'burned': 0	// false
      // },
			initialize: function(e, e2){
				this.customer = e.customer;
				this.asdf = {asdf:"asdf"};
				// alert("init2" + JSON.stringify(e2));
				// this.cloudApi = require('cloudProxy').getCloud();
			},
			getCustomer: function(){
				if( this.customer ){
					return this.customer;
				}else if( this.collection ){
					return this.collection.customer;
				}else{
					Ti.API.error("[installation.js] getCustomer(): there is no owner customer");
				}
			},
			test: function(){
			},
			sync: function(method, model, opts){
				opts = opts || {};
				opts.headers = _.extend( opts.headers || {},
					this.getCustomer()?this.getCustomer().getHeaders():{}
				);
				// return Backbone.sync(method, model, opts);
				return require("alloy/sync/"+this.config.adapter.type).sync.call(this, method, model, opts);
			},
			unyo: function(options){
				var success = options.success,
					error = options.error;

				// save remote and local
				this.save({
					unyo: true	// true
				}, options);
			},
			reyo: function(options){
				Ti.API.info("[yo.reyo] ");
				this.save({
					unyo: false
				}, options);
			}
		});
		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			initialize: function(e, e2) {
				// Ti.API.info(arguments);
				// Ti.API.info(e2);
				this.customer = e.customer;
			},
			sync: function(method, model, opts){
				Ti.API.info("[yo.js] .sync() called ");
				opts = opts || {};
				opts.headers = _.extend( opts.headers || {},
					this.customer.getHeaders()
				);
				// return Backbone.sync.call(this, method, model, opts);
				return require("alloy/sync/" + this.config.adapter.type).sync.call(this, method, model, opts);
			},
			/**
			* @returns {Array}
			*/
			getIds: function(options){
				return this.map(function(yo){
					if( !yo.get("hided") ){
						return yo.get("receiverId");
					}
				});
			},
			addNewYo: function(options){
				var senderUser = options.senderUser  || this.customer.userIdentity,
					receiverUser = options.receiverUser,
					success = options.success,
					error = options.error,
					self = this,
					fields = {
						"hide": 0,	// 0 for false
						"complete": 0,
						"unyo": 0,
						"burn": 0
					};
				var existYo;
				// = this.where({
				// 	"senderId": receiverUser.id,
				// 	"provider": self.customer.get("provider")
				// }).pop();

				/* case of reyo */
				if ( existYo ){
					Ti.API.debug("[yo.js] reyo didnt implemented...");
				/* case of new yo */
				}else{
					var newYo = Alloy.createModel("yo", {
						"provider": self.customer.get("provider"),
						"senderId": senderUser.id,
						"receiverId": receiverUser.id
					});
					newYo.customer = self.customer;

					// save remote and local
					newYo.save(undefined, {
						success: function(){
							// new yoed users should be saved (sqlite)
							receiverUser.save();
							// add only if success remote and local
							self.add(newYo);
							success && success();
						},
						error: function(){
							error && error();
						}
					});
				}
				return;
			}
		});

		return Collection;
	}
};
