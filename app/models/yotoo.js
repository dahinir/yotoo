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
		    
		    "chat_group_id": "string", // acs chat group id
		    
		    // status //
		    "hided": "boolean",		// 1:true, 0:false
		    "unyotooed": "boolean",
		    "completed": "boolean",
		    "burned": "boolean"
		},
        'defaults': {
        	'burned': 0	// false
        },
		adapter: {
			// 'migration': ,
			'idAttribute': "id",	// ACS id
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
			'complete': function( options ){
				var mainAgent = options.mainAgent;
				var success = options.success;
				var error = options.error;
				
				var thisModel = this;
				var fields = {
					'completed': 1	// true
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'put',
					'modelType': 'yotoo',
					'id': this.get('id'),
					'fields': fields,
					'onSuccess': function( result ){
						thisModel.set(fields);
						
						// to persistence :must save after success of server post
						thisModel.save();
						if( success ){
							success();
						}
					},
					'onError': function(e){
						Ti.API.info("[yotoo.unYotoo] error ");
						if( error ){
							error(e);
						}
					}
				});
			},
			'unyotoo': function( options ){
				var mainAgent = options.mainAgent;
				var success = options.success;
				var error = options.error;
				
				var thisModel = this;
				var fields = {
					'unyotooed': 1	// true
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'put',
					'modelType': 'yotoo',
					'id': this.get('id'),
					'fields': fields,
					'onSuccess': function( result ){
						thisModel.set(fields);
						
						// to persistence :must save after success of server post
						thisModel.save();
						if( success ){
							success();
						}
					},
					'onError': function(e){
						Ti.API.info("[yotoo.unYotoo] error ");
						if( error ){
							error(e);
						}
					}
				});
			},
			'hide': function( options ){
				var mainAgent = options.mainAgent;
				var success = options.success;
				var error = options.error;

				var thisModel = this;
				var fields = {
					'hided': 1	// true
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'put',
					'modelType': 'yotoo',
					'id': this.get('id'),
					'fields': fields,
					'onSuccess': function( result ){
						thisModel.set(fields);
						
						// to persistence :must save after success of server post
						thisModel.save();
						if( success ){
							success();
						}
					},
					'onError': function(e){
						Ti.API.info("[yotoo.unYotoo] error ");
						if( error ){
							error(e);
						}
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
				var add = options.add;
				var reset = options.reset;
				var success = options.success;
				var error = options.error;
				
				var thisCollection = this;
				var query ={
					'source_id_str': mainAgent.get('id_str')
				};
				
				this.cloudApi.excuteWithLogin({
					'mainAgent': mainAgent,
					'method': 'get',
					'modelType': 'yotoo',
					'query': query,
					'onSuccess': function( resultsJSON ){
						if( reset ){
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
			'addNewYotoo': function(options){
				var sourceUser = options.sourceUser;
				var targetUser = options.targetUser;
				var success = options.success;
				var error = options.error;
				var thisCollection = this;
				var fields = {
						'hided': 0,	// false
						'completed': 0,
						'unyotooed': 0,
						'burned': 0
				};

				var existYotoo = this.where({'target_id_str': targetUser.get('id_str')}).pop();
				/* case of reyotoo */
				if ( existYotoo ){
					// alert("exist");
					this.cloudApi.excuteWithLogin({
						'mainAgent': sourceUser,
						'modelType': 'yotoo',
						'method': 'put',
						'id': existYotoo.get('id'),
						'fields': fields,
						'onSuccess': function( result ){
							existYotoo.targetUser = targetUser;
							existYotoo.set(result);
							
							// to persistence :must save after success of server post
							existYotoo.save();
							
							thisCollection.checkTargetYotoo({
								'sourceUser': sourceUser,
								'targetUser': targetUser,
								'success': success,
								'error': error
							});
							Ti.API.info("[yotoo.addNewYotoo] success ");
						},
						'onError': function(e){
							Ti.API.info("[yotoo.addNewYotoo] error ");
							if( error ){
								error(e);
							}
							// alert(JSON.stringify(e));
						}
					});
				/* case of new yotoo */
				}else{
					_.extend(fields, {
						'source_id_str': sourceUser.get('id_str'),
						'target_id_str': targetUser.get('id_str'),
						'platform': 'twitter'	// default
					});
					this.cloudApi.excuteWithLogin({
						'mainAgent': sourceUser,
						'method': 'post',
						'modelType': 'yotoo',
						'fields': fields,
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
							thisCollection.checkTargetYotoo({
								'sourceUser': sourceUser,
								'targetUser': targetUser,
								'success': success,
								'error': error
							});
						},
						'onError': function(e){
							Ti.API.info("[yotoo.addNewYotoo] error");
							if( error ){
								error(e);
							}
						}
					});
				}
				return;
			},
			'checkTargetYotoo': function(options){
				var sourceUser = options.sourceUser;
				var targetUser = options.targetUser;
				var success = options.success;
				var error = options.error;
				
				var thisCollection = this;
				
				var query ={
					'source_id_str': targetUser.get('id_str'),
					'target_id_str': sourceUser.get('id_str')
				};
				this.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'method': 'get',
					'modelType': 'yotoo',
					'query': query,
					'onSuccess': function( resultsJSON ){
						var checkingYotoo = thisCollection.where({
							'source_id_str' : sourceUser.get('id_str'),
							'target_id_str' : targetUser.get('id_str')
						}).pop(); 
						
						if( resultsJSON.length === 0 ){
							Ti.API.info("[yotoo.checkTargetYotoo] not yet. haha");
							if( success ){
								success( checkingYotoo );
							}
						}else if( resultsJSON.length > 0){
							// 요투 컴플릿은 노티를 받았을 때 해야지!  
							// checkingYotoo.set({'completed': 1});
							// checkingYotoo.save();
							// alert(L('YOTOO!!'));

							thisCollection.sendYotooNotification({
								'sourceUser': sourceUser,
								'targetUser': targetUser,
								'success': success,
								'error': error
							});
						};
						// var result = resultsJSON[0];
					},
					'onError': function(e){
						Ti.API.info("[yotoo.checkTargetYotoo] error ");
						if(error){
							error(e);
						}
					}
				});
			},
			'sendYotooNotification': function(options){
				var sourceUser = options.sourceUser;
				var targetUser = options.targetUser;
				var sound = options.sound || 'yotoo1';
				var success = options.success;
				var error = options.error;
				
				var thisCollection = this;
				
				var payload = {
					'sound': sound,
					'alert':"@"+sourceUser.get('screen_name') + " " + L('yotoo_you_too'),
					'f':sourceUser.get('id_str'),
					't':targetUser.get('id_str')
				};
				
				thisCollection.cloudApi.excuteWithLogin({
					'mainAgent': sourceUser,
					'targetUser': targetUser,
					'method': 'sendPushNotification',
					'channel': 'yotoo',
					'payload': payload,
					'onSuccess': function(e){
						Ti.API.info("[yotoo.sendYotooNotification] success");

						var relevantYotoo = thisCollection.where({
							'source_id_str': sourceUser.get('id_str'),
							'target_id_str': targetUser.get('id_str')
						}).pop();
						
						/* update relevant yotoo's completed :콜백으로 이전 
						thisCollection.cloudApi.excuteWithLogin({
							'mainAgent': sourceUser,
							'method': 'put',
							'id': relevantYotoo.get('id'),
							'fields': {
								'completed': 1
							},
							'onSuccess': function( result ){
								if( success ){
									success( relevantYotoo );
								}
								Ti.API.info("[yotoo.sendNoti] success ");
							},
							'onError': function(e){
								Ti.API.info("[yotoo.sendNoti] error ");
								if( error ){
									error(e);
								}
							}
						});
						*/		
					},
					'onError': function(e){
						// 노티피케이션을 보냈는지 확인하고 실패했으면 큐에 넣던지
						// 해서 반드시 성공 시켜야 한다. 
						Ti.API.info("[yotoo.sendYotooNotification] error");
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


