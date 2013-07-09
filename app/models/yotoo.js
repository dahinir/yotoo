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
				// remote save
				require('cloudProxy').getCloud().yotooRequest({
					'sourceAccount': sourceUser,
					'targetAccount': targetUser,
					// local save
					'success': function(result){
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
						newYotoo.save();
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


