var baseUrl = ( ENV_PRODUCTION ?
			Ti.App.Properties.getString("and-baseurl-production")
			: Ti.App.Properties.getString("and-baseurl-local"));

// test for local
baseUrl = Ti.App.Properties.getString("and-baseurl-local");

exports.definition = {
	config: {
		columns: {
			// for And server
			"id": "string",

			"provider": "string",	// like twitter, facebook..
	    "senderId": "string",
	    "receiverId": "string",

	    // "chat_group_id": "string",	// acs chat group id
	    "created": "datetime",
	    // "burned_at": "datetime",	// for last burned_at

	    // status //
	    "hide": "boolean",		// 1:true, 0:false
	    "unyo": "boolean",	// don't use. just delete Yo
	    "complete": "boolean",
	    "burn": "boolean"
		},
    // 'defaults': {
    	// 'burned': 0	// false
    // },
		adapter: {
			// 'migration': ,
			'idAttribute': "id",	// default is alloy_id
			'type': "sqlrest",
			'collection_name': "yo"
		},
		debug: 1,
		URL: baseUrl + "/api/Yos",
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
				// alert("init2" + JSON.stringify(e2));
				// this.cloudApi = require('cloudProxy').getCloud();
			},
			getCustomer: function(){
				if( this.customer ){
					return this.customer;
				}else if( this.collection ){
					return this.collection.customer;
				}else{
					Ti.API.error("[yo.js] getCustomer(): there is no owner customer");
				}
			},
			test: function(){
			},
			sync: function(method, model, opts){
				opts = opts || {};
				opts.headers = _.extend( opts.headers || {},
					this.getCustomer().getHeaders()
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
				// this.customer = e.customer;
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
			refresh: function(options){
				options = options || {};
				var self = this;
				var success = options.success,
					error = options.error;
				self.fetch({
					// localOnly: true,
					// add: true,	// I don't know but if "add" setted as true, problem
					success: success,
					error: error,
					deleteAllOnFetch: true,
					sql: {
						where: {
								provider: self.customer.get("provider"),
								senderId: self.customer.get("provider_id")
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
