exports.definition = {
	config: {
		'columns': {
			// ACS fields
		    "id": "string",	// acs id; make this by ACS	
		    "created_at": "datetime",
		    "updated_at": "datetime",
		    "message": "string",
		    "photo": "string",
		    
		    // modified for this app
		    "chat_group_id": "string",	// acs id
		    "sender_id_str": "string"	// twitter id
		},
		'adapter': {
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
				var targetUser = options.targetUser;
				var since = options.since;
				var success = options.success;
				var error = options.error;
				
				var query = {};
				var thisCollection = this;
				
				if( since ){
					// alert( since );
					query.updated_at = { 
						'$gte': since
					};
				}else if( this.length > 0 ){
					query.updated_at = { 
						'$gte': this.at(this.length - 1).get('updated_at')
					};
				}
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'targetUser': targetUser,
					'method': 'getChats',
					'query': query,
					'onSuccess': function(chats){
						var newChats = [];
						for(var i = 0; i < chats.length; i++){
							chats[i].chat_group_id = chats[i].chat_group.id;
							chats[i].sender_id_str = chats[i].from.external_accounts[0].external_id;
							var newChat = Alloy.createModel('chat', chats[i]);
							newChat.save();
							newChats.push( newChat );
						}
						thisCollection.add( newChats );
						Alloy.Globals.chats.add( newChats );
						if( success ){
							success( thisCollection );
						}
					},
					'onError': function(e){
						if( error ){
							error(e);
						}
					}
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
						var newChat = Alloy.createModel('chat', chat);
						newChat.set({
							// 'owner_id_str': mainAgent.get('id_str'),
							'chat_group_id': chat.chat_group.id,
							'sender_id_str': mainAgent.get('id_str')
						});
						newChat.save();
						thisCollection.add( newChat );
						if( success ){
							success(newChat);
						}
					},
					'onError': function(e){
						Ti.API.info(JSON.stringify(e));
						if( error ){
							error(e);
						}
					}
				});
			}
		});
		
		return Collection;
	}
};

