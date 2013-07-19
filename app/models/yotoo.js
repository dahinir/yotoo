// shared
// var cloudApi = {a: 1};
// var asdf = function(){ alert("asdf");return "dd";}();

exports.definition = {
	config: {
		columns: {
			"acs_id": "string",
			"platform": "string",	// like twitter, facebook..
		    "source_id_str": "string",
		    "target_id_str": "string",
		    
		    // status //
		    "hided": "boolean",
		    "unyotooed": "boolean",
		    "completed": "boolean",
		    "burned": "boolean",
		    "past": "boolean"
		},
		adapter: {
			// 'migration': ,
			'type': "sql",
			'collection_name': "yotoo"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			'initialize': function(e, e2){
				// alert("haha");
				// alert("init" + JSON.stringify(e));
				// alert("init2" + JSON.stringify(e2));
				this.cloudApi = require('cloudProxy').getCloud();
			},
			'unYotoo': function( account ){
				var thisModel = this;
				var fields = {
					'unyotooed': true
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': account,
					'method': 'put',
					'acsId': this.get('acs_id'),
					'fields': fields,
					'onSuccess': function( result ){
						// alert(JSON.stringify(result));
						thisModel.set({
							'unyotooed': true,
						});
						// to persistence :must save after success of server post
						thisModel.save();
					},
					'onError': function(e){
						Ti.API.info("[yotoo.unYotoo] error ");
					}
				});
			}
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			'initialize': function(e) {
				this.cloudApi = require('cloudProxy').getCloud();
			},
			'fetchFromServer': function(account){
				var thisCollection = this;
				var query ={
					'source_id_str': account.get('id_str')
				};
				// this.cloudApi.get({
				this.cloudApi.excuteWithLogin({
					'mainAgent': account,
					'method': 'get',
					'modelType': 'yotoo',
					'fields': query,
					'onSuccess': function( resultsJSON ){
						// thisCollection.reset();
						// alert( JSON.stringify(resultsJSON) );
						
						var tempYotooArray = [];
						for(var i = 0; i < resultsJSON.length; i++){
							if ( thisCollection.where({'target_id_str': resultsJSON[i].target_id_str}).pop() ){
								// this yotoo already in this collection 
								alert("in: " + resultsJSON[i].target_id_str);
							}else{
								// this yotoo is not in this collection
								alert("no: " + resultsJSON[i].target_id_str);
								var newYotoo = Alloy.createModel('yotoo');
								newYotoo.set({
									'acs_id': resultsJSON[i].id,
									'platform': resultsJSON[i].platform,
									'source_id_str': resultsJSON[i].source_id_str,
									'target_id_str': resultsJSON[i].target_id_str,
									'hided': resultsJSON[i].hided,
									'completed': resultsJSON[i].hided,
									'unyotooed': resultsJSON[i].unyotooed,
									'past': resultsJSON[i].past
								});
								newYotoo.save();
								tempYotooArray.push( newYotoo );
							}
						}
						thisCollection.add( tempYotooArray );
						// thisCollection.add( tempYotooArray, {silent: true} );
						// thisCollection.trigger('addMultiple', tempYotooArray);
					},
					'onError': function(e){
						Ti.API.info("[yotoo.fetchFromServer] error ");
					}
				});
			},
			'addNewYotoo': function(sourceUser, targetUser){
				var thisCollection = this;

				// remote save
				this.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'method': 'post',
					'modelType': 'yotoo',
					'fields': {
						'source_id_str': sourceUser.get('id_str'),
						'target_id_str': targetUser.get('id_str'),
						'hided': false,
						'completed': false,
						'unyotooed': false,
						'past': false,
						'platform': 'twitter'	// default
					},
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
						// to persistence :must save after success of server post
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
			'checkTargetYotoo': function(sourceUser, targetUser){
				var thisCollection = this;
				var query ={
					'source_id_str': targetUser.get('id_str'),
					'target_id_str': sourceUser.get('id_str')
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'method': 'get',
					'modelType': 'yotoo',
					'fields': query,
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
			'sendYotooNotification': function(sourceUser, targetUser){
				var fields = {
					'channel': 'yotoo',
					'receiverAcsId': targetUser.get('id_str_acs'),
					'message':  sourceUser.get('name') + " " + L('yotoo_you_too'),
				};
				// this.cloudApi.sendPushNotification({
				this.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'method': 'sendPushNotification',
					'fields': fields,
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


