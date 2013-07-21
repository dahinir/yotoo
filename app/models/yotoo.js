// shared
// var cloudApi = {a: 1};
// var asdf = function(){ alert("asdf");return "dd";}();

exports.definition = {
	config: {
		columns: {
			"id": "string",	// acs id; make this by ACS	
			"platform": "string",	// like twitter, facebook..
		    "source_id_str": "string",
		    "target_id_str": "string",
		    
		    // status //
		    "hided": "boolean",
		    "unyotooed": "boolean",
		    "completed": "boolean",
		    "burned": "boolean"
		},
		adapter: {
			// 'migration': ,
			'idAttribute': "id",
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
					'unyotooed': 1	// true
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': account,
					'method': 'put',
					'acsId': this.get('id'),
					'fields': fields,
					'onSuccess': function( result ){
						thisModel.set(fields);
						
						// to persistence :must save after success of server post
						thisModel.save();
					},
					'onError': function(e){
						alert(JSON.stringify(e));
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
			/**
			 * designed like backbone.fetch()
 			 * @param {Object} options
			 */
			'fetchFromServer': function(options){
				var mainAgent = options.mainAgent;
				var thisCollection = this;
				var query ={
					'source_id_str': mainAgent.get('id_str')
				};
				var add = options.add;
				var reset = options.reset;
				var success = options.success;
				var error = options.error;
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'get',
					'modelType': 'yotoo',
					'fields': query,
					'onSuccess': function( resultsJSON ){
						if( add || reset ){
							thisCollection.reset();
						}
						thisCollection.add( resultsJSON );
						if( success ){
							// success(collection, response, options);
							success(thisCollection, resultsJSON, options);
						}
					},
					'onError': function(e){
						Ti.API.info("[yotoo.fetchFromServer] error ");
						if( error ){
							error();
						}
					}
				});
			},
			'addNewYotoo': function(sourceUser, targetUser){
				var thisCollection = this;

				// 기존 yotoo 있는지 검사 부터..
				
				// remote save
				this.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'method': 'post',
					'modelType': 'yotoo',
					'fields': {
						'source_id_str': sourceUser.get('id_str'),
						'target_id_str': targetUser.get('id_str'),
						'hided': 0,	// false
						'completed': 0,
						'unyotooed': 0,
						'platform': 'twitter'	// default
					},
					'onSuccess': function(result){
						// for local save
						var newYotoo = Alloy.createModel('yotoo');
						newYotoo.set(result);
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


