exports.definition = {
	config: {
		"columns": {
			// twitter column
			"id_str":"string",
			"name":"string",
			"screen_name":"string",
			"profile_image_url_https":"string",
			"profile_background_image_url": "string",
			
			// for ACS
			"acs_id":"string"
			
			// for this app
			// "cached_at":
		},
		"adapter": {
			"idAttribute": "id_str",	// twitter id
			"type": "sql",
			"collection_name": "user"
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
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
			/**
			 * @method fetchFromServer
			 * designed like backbone.fetch()
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.success] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.error] Callback function executed after a failed fetch.
			 */
			fetchFromServer: function(options){
				var params = {
					'include_entities' : true,
					'skip_status' : true
				}; 
				_.extend(params, options.params);
				var success = options.success;
				var error = options.error;
				
				var thisModel = this;
				var twitterApi = this.twitterApi;
				twitterApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						// thisModel.clear();
						thisModel.set( resultJSON );
						if( success ){
							success();
						}
					},
					'onFailure': function( resultJSON ){
						if( error ){
							error();
						}
					}
				});
			},
			
			fetchMetaData: function(options){
				var params = {};
				_.extend(params, options.params);
				var success = options.success;
				var error = options.error;
				
				var twitterApi = this.twitterApi;
				twitterApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						success( resultJSON );
					},
					'onFailure': function( resultJSON ){
						error( resultJSON );
					}
				});
			}
		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			/**
			 * @method fetchFromServer
			 * designed like backbone.fetch()
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.success] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.error] Callback function executed after a failed fetch.
			 */
			'fetchFromServer': function(options){
				var params = {'include_entities' : true};
				_.extend(params, options.params);
				var purpose = options.purpose;
				var add = options.add;
				var reset = options.reset;
				var success = options.success;
				var error = options.error;
				
				var thisCollection = this;
				
				// cached user
				if( options.purpose === 'lookupUsers'){
					var userIds = params.user_id.split(',');
					for(var i = 0; i < userIds.length; i++){
						if( Alloy.Globals.users.get(userIds[i]) ){
							// .clone(); model has only one Collection ref that belongs to
							thisCollection.add( Alloy.Globals.users.get(userIds[i]).clone() );
						}
					}
				}
				this.twitterApi.fetch({
					'purpose': purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						if( add || reset ){
							thisCollection.reset();
						}
						
						for(var i=0; i < resultJSON.length; i++){
							var user = thisCollection.get(resultJSON[i].id_str);
							if( user ){
								user.set(resultJSON[i]);
							}else{
								// alert( JSON.stringify(resultJSON[i].id_str) );
								thisCollection.add(resultJSON[i]);
							}
							Alloy.Globals.users.add(resultJSON[i]);
						}
						
						if( success ){
							success(thisCollection, resultJSON, options);
						}
					},
					'onFailure': function( resultJSON ){
						Ti.API.info("[user.fetchFromServer] error");
						if( error ){
							error();
						}
					}
				});
			}
		}); // end extend
		
		return Collection;
	}
}

