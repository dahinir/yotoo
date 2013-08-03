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
			'comparator': function(chat){
				return chat.get('updated_at');
			},
			/* custom functions */
			'fetchFromServer': function(options){
				var mainAgent = options.mainAgent;
				var success = options.success;
				var error = options.error;
				
				var lastUpdateDateTime;
				var query = {};
				var thisCollection = this;
				
				if( lastUpdateDateTime ){
					query.updated_at = { '$gt': lastUpdateDateTime };
				}
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'getChats',
					'query': query,
					'onSuccess': function(chats){
						thisCollection.add(chats);
					},
					'onError': function(){}
				});
			},
			'createNewChat': function(options){
				var mainAgent = options.mainAgent;
				var targetUser = options.targetUser;
				var message = options.message;
				var success = options.success;
				var error = options.error;
				
				var thisCollection = this;
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'targetUser': targetUser,
					'method': 'postChat',
					'message': message,
					'onSuccess': function(chat){
						thisCollection.add(chat);
					},
					'onError': function(e){
						Ti.API.info(JSON.stringify(e));
					}
				});
			}
		});
		
		return Collection;
	}
}

