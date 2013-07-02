exports.definition = {
	// configuration: ??
	config: {
		"columns": {
			/*
			"id_str":"string",
			"source":"string",
			"text":"string",
			"user":"User"
			*/
		},
		// "defaults": {
			// "id_str":"000000000000000000",
			// "source":"-",
			// "text":"-",
			// "user":"-"
		// },
		"adapter": {
			"type": "properties",
			// collection_table:??
			"collection_name": "tweet"
			// "collection_name": "tweets" // s?
		}
	},		

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			/*
			// it is called by the set and save(attribute) methods 
			// before changing the attributes and is also called 
			// by the isValid method
			validate: function (attrs) {
				for (var key in attrs) {
					var value = attrs[key];
					if (key === "book") {
						if (value.length <= 0) {
							return 'Error: No book!';
						}
					}
					if (key === "author") {
						if (value.length <= 0) {
							return 'Error: No author!';
						}	
					}	
				}
			},
			// Extend Backbone.Model
            customProperty: 'book',
            customFunction: function() {
                Ti.API.info('I am a book model.');
            }
			*/
			sendTweet: function (params, callback){
				// var twitterAPI = this.ownerAccount.twitterAPI;
				var twitterApi = this.twitterApi;
				if( params.hasOwnProperty('media') ){
					twitterApi.sendTweetWithMedia(params, callback);
				}else{
					params.status = encodeURIComponent(params.status);
					twitterApi.sendTweet(params, callback);
				}
			},
			/**
			 * @method saveToServer
			 * send tweet to Twitter.com
			 * @param {Object} options
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.onSuccess] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.onFailure] Callback function executed after a failed fetch.
			 */
			saveToServer: function(options){
				var params = {};
				_.extend(params, options.params);
				// params.status = encodeURIComponent(params.status);
				var onSuccess = options.onSuccess;
				var onFailure = options.onFailure;				
				var purpose = params.hasOwnProperty('media')?'postTweetWithMedia':'postTweet';
				
				var twitterApi = this.twitterApi;
				Ti.API.debug("[tweet.js] sending tweet: "+ params.status+", "+ purpose);
				
				twitterApi.post({
					'purpose': purpose,
					'params': params,
					'onSuccess': function(){
						onSuccess();
					},
					'onFailure': function(){
						onFailure();
					}
				});
			}
		}); // end extend
		
		return Model;
	},
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			/*
			url: 'http://search.twitter.com/search.json?q=NYC&callback=?',
    		parse: function(response, xhr) {
        		Ti.API.info('parsing ...');
        		return response.results;
    		},
    		*/
			// rapodor: we gonna be rich model, so attetch Birdhouse.js
			/*
			getTweets: function (purpose, params, callback) {
				// Ti.API.info("get from twitter.com: "+ purpose);
				// var twitterAPI = this.ownerAccount.twitterAPI;
				var twitterApi = this.twitterApi;
				var destinationParams = {
					// "count" : 10,
					"include_entities" : true
				}; 
				_.extend(destinationParams, params);
				// Ti.API.info("=====destinationParams=====");
				// for ( key in destinationParams){
					// Ti.API.info("key:"+key+", value:"+ destinationParams[key]);
				// }
				twitterApi.getFromServer(purpose, destinationParams, callback);
				// return "babe";
			},
			*/
			/**
			 * @method fetchFromServer
			 * Fetch some tweets from the Twitter.com
			 * @param {Object} options
			 * @param {String} options.purpose Will match url
			 * @param {Object} options.params Will use url parameter
			 * @param {Function} [options.onSuccess] Callback function executed after a successful fetch tweets.
			 * @param {Function} [options.onFailure] Callback function executed after a failed fetch.
			 */
			fetchFromServer: function(options){
				var params = {'include_entities' : true};
				_.extend(params, options.params);
				var onSuccess = options.onSuccess;
				var onFailure = options.onFailure;

				var thisCollection = this;
				var twitterApi = thisCollection.twitterApi;
				twitterApi.fetch({
					'purpose': options.purpose,
					'params': params,
					'onSuccess': function( resultJSON ){
						thisCollection.reset();
						// Ti.API.info("json:"+resultJSON.length+ ", collection"+thisCollection.length	);
						if( options.purpose === 'discover' ){
							resultJSON = resultJSON.statuses;
							Ti.API.info(JSON.stringify(resultJSON));
						}else if( options.purpose === 'ownershipLists'){
							Ti.API.info(JSON.stringify(resultJSON));
							if( resultJSON.next_cursor !== 0 ){
								alert("[tweet.js] list over 1000!, fetch more!");
							}
						}
						
						
						thisCollection.add( resultJSON );
						// Ti.API.info("json:"+resultJSON.length+ ", collection"+thisCollection.length	);
						onSuccess();
					},
					'onFailure': function( resultJSON ){
						onFailure();
					}
				});
			},
			testFdd: function(){
				Ti.API.info("testFdd!!");	
			},
			testFetch: function(val){
				this.add({id_str:val});
			},
			testStream: function(options){
				// var params = { 'with': "followings"};
				var params = {};
				_.extend(params, options.params);
				// params.status = encodeURIComponent(params.status);
				var onSuccess = options.onSuccess;
				var onFailure = options.onFailure;				
				var purpose = options.purpose;
				
				var twitterApi = this.twitterApi;
				Ti.API.debug("[tweet.js] testStream");
				
				twitterApi.stream({
					'purpose': purpose,
					'params': params,
					'onSuccess': function(){
						onSuccess();
					},
					'onFailure': function(){
						onFailure();
					}
				});				
			}
		}); // end extend
		
		return Collection;
	}
		
}	// end exports.definition

