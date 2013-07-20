exports.definition = {
	
	config: {
		"columns": {
			/*
			"name":"string"
			*/
		},
		"adapter": {
			"type": "properties",
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
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.onSuccess] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.onFailure] Callback function executed after a failed fetch.
			 */
			// collection에 있는 fetch보고 배워 
			fetchFromServer: function(options){
				var params = {
					'include_entities' : true,
					'skip_status' : true
				}; 
				_.extend(params, options.params);
				var onSuccess = options.onSuccess;
				var onFailure = options.onFailure;
				
				var thisModel = this;
				var twitterApi = thisModel.twitterApi;
				twitterApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						// thisModel.clear();
						thisModel.set( resultJSON );
						onSuccess();
					},
					'onFailure': function( resultJSON ){
						onFailure();
					}
				});
			},
			
			fetchMetaData: function(options){
				var params = {};
				_.extend(params, options.params);
				var onSuccess = options.onSuccess;
				var onFailure = options.onFailure;
				
				var twitterApi = this.twitterApi;
				twitterApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						onSuccess( resultJSON );
					},
					'onFailure': function( resultJSON ){
						onFailure( resultJSON );
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
				
				this.twitterApi.fetch({
					'purpose': purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						if( add || reset ){
							thisCollection.reset();
						}
						if( options.purpose === 'searchUsers'){
							// Ti.API.info(JSON.stringify(resultJSON));
						}
						
						
						thisCollection.add( resultJSON );
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
			},
		}); // end extend
		
		return Collection;
	}
}

