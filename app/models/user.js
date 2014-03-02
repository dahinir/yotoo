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
			// extended functions go here
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
			// extended functions go here			

		}); // end extend
		
		return Collection;
	}
		
};

