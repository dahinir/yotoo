// user는 인터페이스만 맞추고 twitterUser, instaUser 등으로 따로 구현 한다.
exports.definition = {
	config: {
		"columns": {
			// twitter column
			"id_str":"string",
			"name":"string",
			"screen_name":"string",
			"profile_image_url_https":"string",
			"profile_background_image_url": "string",
			"friends_count": "string",
			"followers_count": "string",
			"following": "boolean",

			// for ACS
			// "acs_id":"string"

			// for this app
			"cached_at":"int"	// milliseconds since 1970
		},
		"adapter": {
			"idAttribute": "id_str",	// twitter id
			"type": "sql",
			// "type": "properties",
			// "type": "sqlrest",
			"collection_name": "twitterUser"
		}
	},

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			initialize: function(e, e2){
				// AG.testCount++;
			},
			/*
			getUser: function(purpose, params, callback) {
				var twitterAPI = this.ownerAccount.twitterAPI;
				var destinationParams = {
					'include_entities': true,
					'skip_status': true
				};
				_.extend(destinationParams, params);
				twitterAPI.getFromServer(purpose, destinationParams, callback);
				return "babe";
			},
			getMetaData: function(purpose, params, callback) {
				var twitterAPI = this.ownerAccount.twitterAPI;
				params = params || {};
				twitterAPI.getFromServer(purpose, params, callback);
				return "babe";
			},
			*/
			/*
			fetch: function(options){
				Ti.API.info("[user.js] fetch!!");

				// call via "sqlrest" only for local
				var options = options || {};
				options.localOnly = true;
				Backbone.Model.prototype.fetch.call(this, options);

				// call via "externalApi" only for remote(twitter server)
				externalApi.fetch();
			},
			*/
			refresh: function(options){
				var options = _.extend({
					force: false
				}, options),
					success = options.success,
					error = options.error,
					model = this;
				var MIN_REFRESH_MS = 1000*60*60*24; // one day as milliseconds

				// fetch from local sqlite
				this.fetch({query: {
					statement: 'select * from ' + model.config.adapter.collection_name + ' where id_str = ?',
					params: [model.get("id_str")] }});

				// fetch from Twitter.com
				if( !this.get("cached_at")
						|| (Date.now()-this.get("cached_at")) > MIN_REFRESH_MS
						|| options.force ) {
					Ti.API.info("[twitterUser.js] .refresh() go remote!!");
					this.externalApi.fetch({
						"purpose": "profile",
						"params": {
							"include_entities": false,
							"skip_status": true
						},
						"success": function(resultJson){
							// Ti.API.info(resultJson);
							var resultJson = resultJson || {};
							resultJson.cached_at = Date.now();
							model.set(resultJson);
							model.save();
							if(success){
								success();
							}
							model.trigger("remoteRefesh", model);
						},
						"error": function(resultJson){
							if(error){
								error();
							}
						}
					});
				}
			},
			/**
			 * @method fetchFromServer
			 * designed like backbone.fetch()
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.success] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.error] Callback function executed after a failed fetch.
			 */
			fetchFromServer_: function(options){
				var params = {
					'include_entities': true,
					'skip_status': true
				};
				_.extend(params, options.params);
				var success = options.success;
				var error = options.error;

				var thisModel = this;
				var externalApi = this.externalApi;
				externalApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'success': function( resultJson ){
						// thisModel.clear();
						thisModel.set( resultJson );
						if( success ){
							success();
						}
					},
					'error': function( resultJson ){
						if( error ){
							error();
						}
					}
				});
			},

			fetchMetaData_: function(options){
				var params = {};
				_.extend(params, options.params);
				var success = options.success;
				var error = options.error;

				var externalApi = this.externalApi;
				externalApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'success': function( resultJson ){
						success( resultJson );
					},
					'error': function( resultJson ){
						error( resultJson );
					}
				});
			}
		}); // end extend

		return Model;
	},


	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			initialize: function(e, e2){
				// if(this.get(''))
				// alert(e);
				// alert(e2);
				// this.externalApi = require('twitter').create({
					// accessTokenKey: AG.customers.at(0).get('external_access_token'),
					// accessTokenSecret: AG.customers.at(0).get('external_access_token_secret')
				// });
				// if( e && e.ownerCustomer ){
					// this.externalApi = e.ownerCustomer.externalApi;
				// }
			},

			// using for autocomplete: reset
			search: function(options){
				var options = options || {};
				var query = options.query,
						self = this;

				this.externalApi.fetch({
					"purpose": "searchUsers",
					"params": {
						"include_entities": false,
						'skip_status': true,
						"count": 20, // maxium 20
						"q": query
					},
					"success": function(resultJson){
						self.reset(resultJson);
						return;

						for(var i=0; i < resultJson.length; i++){
							var user = self.get(resultJson[i].id_str);
							if( user ){
								user.set(resultJson[i]);
							}else{
								self.add(resultJson[i]);
							}
						}
					},
					"error": function( resultJson ){
						Ti.API.info("[twitterUser.search] remote error  ");
					}
				});
			},
			addByIds: function(options){
				Ti.API.info("[twitterUser.addByIds] .addByids() called");

				var options = options || {};
				var userIds = options.userIds,	// Array!
						reset = options.reset || false,
						self = this;

				if(!userIds){
					Ti.API.warn("[twitterUser.addByIds] where is userIds?");
					return;
				}else if(userIds.length == 0){
					Ti.API.info("[twitterUser.addByIds] empty userIds");
					return;
				}

				// fetch from local sqlite
				var qstring = "(" + userIds.map(function(){return "?";}).join(",") + ")";
				self.fetch({
					query: {
						statement: "select * from "+self.config.adapter.collection_name+" where id_str in "+qstring,
						params: userIds
				}});

				// fetch from remote server
				this.externalApi.fetch({
					purpose: "lookupUsers",
					params: {
						"include_entities": false,
						'skip_status': true,
						"user_id": userIds.join(",")	// TODO: A comma separated list of user IDs, up to 100 are allowed in a single request. You are strongly encouraged to use a POST for larger requests.
					},
					success: function(resultJson){
						Ti.API.info("[twitterUser] sucess fetch by externaApi ");
						if(reset){
							self.reset(resultJson);
						}else{
							resultJson.forEach(function(json){
								var user = self.get(json.id_str);
								if(user){
									user.set(json);
								}else{
									self.add(json);
								}
							});
						}
					},
					error: function(resultJson){
						Ti.API.info("[twitterUser.lookup] remote error ");
					}
				});
			},

			// deprecated :user don't know about Customer
			getOwnerCustomer: function(){
				if( this.ownerCustomer ){
					return this.ownerCustomer;
				}else{
					Ti.API.error("[user.js] getOwnerCustomer() :there is no owner customer");
				}
			},
			/**
			 * @method fetchFromServer
			 * designed like backbone.fetch()
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.success] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.error] Callback function executed after a failed fetch.
			 */
			// deprecated : i dont like this way
			fetchFromServer: function(options){
				var params = {'include_entities' : true};
				_.extend(params, options.params);
				var purpose = options.purpose;
				var add = options.add;
				var reset = options.reset;
				var success = options.success;
				var error = options.error;

				var self = this;

				// cached user
				if( options.purpose === 'lookupUsers'){
					// 로컬에서 직접 패치하는 걸로..
					// query: "select * from user where id_str in ('123','124','11')"
					//this.fetch({query: 'select * from ... where id = ' + 123 });

					var userIds = params.user_id.split(',');
					for(var i = 0; i < userIds.length; i++){
						if( AG.users.get(userIds[i]) ){
							// .clone(); model has only one Collection ref that belongs to
							self.add( AG.users.get(userIds[i]).clone() );
						}
					}
				}
				getOwnerCustomer().externalApi.fetch({
					'purpose': purpose,
					'params': params,
					'success': function( resultJson ){
						if( add || reset ){
							self.reset();
						}

						for(var i=0; i < resultJson.length; i++){
							var user = self.get(resultJson[i].id_str);
							if( user ){
								user.set(resultJson[i]);
							}else{
								self.add(resultJson[i]);
							}
							if( Alloy.Globals.users.length > 1024 ){
								Alloy.Globals.users.reset();
							}
							Alloy.Globals.users.add(resultJson[i]);
						}

						if( success ){
							success(self, resultJson, options);
						}
					},
					'error': function( resultJson ){
						Ti.API.info("[user.fetchFromServer] error ");
						if( error ){
							error();
						}
					}
				});
			}
		}); // end extend

		return Collection;
	}
};
