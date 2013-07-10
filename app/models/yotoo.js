exports.definition = {
	config: {
		columns: {
			"acs_id": "string",
			"platform": "string",	// like twitter, facebook..
		    "source_id_str": "string",
		    "target_id_str": "string",
		    
		    // status //
		    "hided": "boolean",
		    "completed": "boolean",
		    "unyotooed": "boolean",
		    "past": "boolean"
		},
		adapter: {
			type: "sql",
			collection_name: "yotoo"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			addNewYotoo: function(sourceUser, targetUser){
				var thisCollection = this;
				
				// remote save
				require('cloudProxy').getCloud().yotooRequest({
					'sourceUser': sourceUser,
					'targetUser': targetUser,
					'success': function(result){
						
						// for local save
						var newYotoo = Alloy.createModel('yotoo');
						newYotoo.set({
							'acs_id': result.id,
							'platform': result.platform,
							'source_id_str': result.source_id_str,
							'target_id_str': result.target_id_str,
							'hided': false,
							'completed': false,
							'unyotooed': false,
							'past': false 
						});
						// to persistence
						newYotoo.save();
						
						// for runtime
						newYotoo.targetUser = targetUser;	// using in peopleView.js
						thisCollection.add( newYotoo );
					},
					'error': function(){
						
					}
				});
				return;
			}
		});
		
		return Collection;
	}
}


