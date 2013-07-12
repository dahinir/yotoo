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
			fetchFromServer: function(account){
				this.cloudApi.fetch({
					'onSuccess': function(){
						
					},
					'onError': function(){
						Ti.API.info("[yotoo.fetchFromServer] error");
					}
				});
			},
			addNewYotoo: function(sourceUser, targetUser){
				var thisCollection = this;
//yotooRequest -> postYotoo -> checkTargetYotoo -> sendPushNotification
//post -> get -> sendNotification
				// remote save
				// require('cloudProxy').getCloud().yotooRequest({
				this.cloudApi.post({
					'modelType': 'yotoo',
					'sourceUser': sourceUser,
					'targetUser': targetUser,
					'onSuccess': function(result){
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
						
						// It'll see whether opponent is yotoo me
						// should be add retry action..
						thisCollection.checkTargetYotoo( sourceUser, targetUser);
					},
					'onError': function(){
						Ti.API.info("[yotoo.addNewYotoo] error");
					}
				});
				return;
			},
			checkTargetYotoo: function(sourceUser, targetUser){
				var thisCollection = this;
				var query ={
					'source_id_str': targetUser.get('id_str'),
					'target_id_str': sourceUser.get('id_str')
				};
				this.cloudApi.get({
					'modelType': 'yotoo',
					'query': query,
					'onSuccess': function( resultsJSON ){
						if( resultsJSON.length === 0 ){
							Ti.API.info("[yotoo.checkTargetYotoo] not yet. haha");
						}else if( resultsJSON.length > 0){
							alert('YOTOO!!');
							thisCollection.sendYotooNotification( sourceUser, targetUser);
						};
						var result = resultsJSON[0];
			            // alert('id: ' + result.id + '\n' +
				        // 'source_id_str: ' + result.source_id_str + '\n' +
				        // 'target_id_str: ' + result.target_id_str + '\n' +
				        // 'created_at: ' + result.created_at);
					},
					'onError': function(e){
						Ti.API.info("[yotoo.checkTargetYotoo] error ");
					}
				});
			},
			sendYotooNotification: function(sourceUser, targetUser){
				this.cloud.sendPushNotification({
					'channel': 'yotoo',
					'receiverAcsId': targetUser.get('id_str_acs'),
					'message':  sourceUser.get('name') + " " + L('yotoo_you_too'),
					'onSuccess': function(e){
						Ti.API.info("[yotoo.sendYotooNotification] success");
					},
					'onError': function(e){
						Ti.API.info("[yotoo.sendYotooNotification] error");
					}
				});
			}
		});
		
		return Collection;
	}
}


