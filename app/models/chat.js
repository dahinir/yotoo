exports.definition = {
	config: {
		columns: {
			// ACS fields
		    "id": "string",	// acs id; make this by ACS	
		    "chatgroup": "string",
		    "created_at": "datetime",
		    "message": "string",
		    "photo": "string",
		    
		    // for this app
		    "owner_id": "string"
		},
		adapter: {
			'idAttribute': "id",
			'type': "sql",
			'collection_name': "chat"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			'initialize': function(e, e2){
				this.cloudApi = require('cloudProxy').getCloud();
			}
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			'initialize': function(e) {
				this.cloudApi = require('cloudProxy').getCloud();
			},
			'fetchFromServer': function(options){
				var mainAgent = options.mainAgent;
				var thisCollection = this;
				var success = options.success;
				var error = options.error;
				var query = {};
				var lastUpdateDateTime;
				
				if( lastUpdateDateTime ){
					query.where = {
						'updated_at': { '$gt': lastUpdateDateTime }
					};
				}
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'getChats',
					'query': query,
					'onSuccess': function(){},
					'onError': function(){}
				});
			},
			'createNewChat': function(options){
				var mainAgent = options.mainAgent;
				var thisCollection = this;
				var success = options.success;
				var error = options.error;
				var fields;
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'postChat',
					'fields': fields,
					'onSuccess': function(){},
					'onError': function(){}
				});
			}
		});
		
		return Collection;
	}
}

