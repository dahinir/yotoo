Ti.API.info("[cloudProxy.js] init cloudProxy.js!!");
var Cloud = require('ti.cloud');

if( !ENV_PRODUCTION ){
	Ti.API.info("[cloudProxy.js] current compiler target is not built for production. ")
	Cloud.debug = true;	// optional; if you add this line, set it to false for production
}else {
	Ti.API.info("[cloudProxy.js] current compiler target is built for production. ")
	Cloud.debug = false;
}

var F = function(){};
F.prototype = Cloud;
var cloudProxy = new F();


// store ACS's current login user as twitter id_str
var currentLoginUserIdStr;
var currentLoginUserCache;

/* just for develope */
cloudProxy.deleteAllYotoos = function( account){
	var yotoos = Alloy.createCollection('yotoo');
	
	Cloud.SocialIntegrations.externalAccountLogin({
		id: account.get('id_str'),
		type: 'twitter',
		token: account.get('access_token')
	}, function(e){
		Cloud.Objects.query({
		    'classname': 'yotoo',
		    'limit': 1000,
		    'where': {'platform': 'twitter'}
		}, function (e) {
	    	yotoos.add( e.yotoo );
	    	alert(yotoos.length + 'yotoos will remove');
			yotoos.map( function(yotoo){
					Cloud.Objects.remove({
						classname: 'yotoo',
						id: yotoo.get('id')
					}, function(e){
						// alert("remove: " + JSON.stringify(e));
					});
			}); 	
		});
	});
	
};

/**
 * @param {String} [options.id]
 * @param {String} [options.type]
 * @param {String} [options.token]
 * @param {Function} [options.onSuccess] Callback function executed after a success
 * @param {Function} [options.onError] Callback function executed after a fail 
 */
cloudProxy.externalAccountLoginAdapter = function(options){
	if( !options.id ){
		Ti.API.warn("[cloudProxy.externalAccountLoginAdapter] id must be described!!!");
	}
	
	// just login to ACS
	if( options.id !== currentLoginUserIdStr){
		Cloud.SocialIntegrations.externalAccountLogin({
			id: options.id,
		    type: options.type,
		    token: options.token
		}, function (e) {
			// alert(e.sessionId);
		    if (e.success) {
		        var user = e.users[0];
		        // Ti.API.info('[cloudProxy.js] Cloud login success! sessionId:'+Cloud.sessionId+ ' id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);
		        // alert('[cloudProxy.js] current '+ currentAccount.get('session_id_acs') );
		        // Ti.API.info('[cloudProxy.js]external id: ' + e.users[0].external_accounts[0].external_id );
				currentLoginUserCache = e;	// store only if success
		        currentLoginUserIdStr = e.users[0].external_accounts[0].external_id;

				if( options.onSuccess ){
					options.onSuccess(e);
				}
		    } else {	// ACS login error
		        Ti.API.info('[cloudProxy.externalAccountLoginAdapter]Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		        if( options.onError ){
		        	options.onError(e);
		        }
		    }
		});
	}else{	// ACS already loggin
		Ti.API.info("[cloudProxy.externalAccountLoginAdapter] already logged in ACS");
		if( options.onSuccess ){
			options.onSuccess(currentLoginUserCache);
		}
	}
};

/**
 * @param {Object} [options.mainAgent] account model
 * @param {String} [options.method] 'get', 'post', 'sendPushNotification'
 * @param {String} [options.modelType] like 'yotoo'
 * @param {Object} [options.fields] fields for post
 * @param {Object} [options.query] query for get
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 */
cloudProxy.excuteWithLogin = function( options){
	var mainAgent = options.mainAgent;
	var method = options.method;
	
	cloudProxy.externalAccountLoginAdapter({
		id: mainAgent.get('id_str'),
	    type: 'twitter',
	    token: options.mainAgent.get('access_token'),
		onSuccess: function (e) {
			cloudProxy[method]( options );
		},
		onError: function(e){	// ACS loggin error
	        Ti.API.info('[cloudProxy.excuteWithLogin] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	        if( options.onError ){
	        	options.onError(e);
	        }
		}
	});
};

cloudProxy.post = function(options){
	var modelType = options.modelType || 'yotoo';
	var fields = options.fields;
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	
	Cloud.Objects.create({
		'classname': modelType,
		'fields': fields  
	}, function(e) {
		if (e.success) {
			var result = e[modelType][0];
			// alert('Success:\n' +
			// 'id: ' + result.id + '\n' +
			// 'source: ' + result.source_id_str + '\n' +
			// 'target: ' + result.target_id_str + '\n' +
			// 'created_at: ' + result.created_at);
			// Ti.API.info("[cloudProxy.js] " + JSON.stringify(e) );
			if (onSuccess) {
				onSuccess(result);
			}
			
		} else {// ACS create yotoo error
			Ti.API.info('[cloudProxy.post] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if (onError) {
				onError(e);
			}
		}
	});
};

cloudProxy.put = function(options){
	var modelType = options.modelType || 'yotoo';
	var acsId = options.acsId;
	var fields = options.fields;
	var onSuccess = options.onSuccess;
	var onError = options.onError;

	Cloud.Objects.update({
	    'classname': modelType,
	    'id': acsId,
	    'fields': fields
	}, function (e) {
	    if (e.success) {
	    	var result = e[modelType][0];
			if (onSuccess) {
				onSuccess(result);
			}
	    } else {
			Ti.API.info('[cloudProxy.put] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if (onError) {
				onError(e);
			}
	    }
	});
};

cloudProxy.get = function(options){
	var modelType = options.modelType || 'yotoo';
	var query = options.fields;
	var onSuccess = options.onSuccess;
	var onError = options.onError;

	Cloud.Objects.query({
	    'classname': modelType,
	    // limit: 1000, // 1000 is maxium
	    // order: 'created_at',
	    'where': query
	}, function (e) {
	    if (e.success) {
	    	var resultsJSON = e[modelType];
	    	if( onSuccess ){
	    		onSuccess( resultsJSON );
	    	}
	    } else{ 
	        Ti.API.info('[cloudProxy.get] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	        if( onError ){
	        	onError(e);
	        }
	    }
	});
};

cloudProxy.sendPushNotification = function(options){
	var fields = options.fields;
	
	var channel = fields.channel || 'yotoo';
	var receiverAcsId = fields.receiverAcsId;
	var payload = fields.payload;
	var onSuccess = options.onSuccess;
	var onError = options.onError;

	Cloud.PushNotifications.notify({
		'channel' : channel,
		// 'friends' : Any,
		'to_ids' : receiverAcsId,
		'payload' : payload
		// 'payload': {
		    // "atras": "your_user_id",
		    // "tags": [
		        // "tag1",
		        // "tag2"
		    // ],
		    // "badge": 2,
		    // "sound": "default",
		    // "alert" : "Push Notification Test"
		// }
	}, function(e) {
		if (e.success) {
			alert('[cloudProxy.sendNotification] Success');
			if( onSuccess ){
				onSuccess(e);
			}
		} else {
			alert('[cloudProxy.sendNotification] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if( onError ){
				onError(e);
			}
		}
	});
};

cloudProxy.getChatGroup = function(options){
	var query = options.query;
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	
	Cloud.Chats.query(query, function (e) {
	    if (e.success) {
	        for (var i = 0; i < e.chats.length; i++) {
	            var chat = e.chats[i];
	            alert('Success:\n' +
	                'From: ' + chat.from.first_name + ' ' + chat.from.last_name + '\n' +
	                'Updated: ' + chat.updated_at + '\n' +
	                'Message: ' + chat.message);
	        }
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};
cloudProxy.postChat = function(options){
	var fields = options.fields;
	var onSuccess = options.onSuccess;
	var onError = options.onError;
	
	Cloud.Chats.create({
	    'to_ids': ids.join(','),
	    'message': 'Good morning'
	}, function (e) {
	    if (e.success) {
	        for (var i = 0; i < e.chats.length; i++) {
	            var chat = e.chats[i];
	            alert('Success:\n' +
	                'From: ' + chat.from.first_name + ' ' + chat.from.last_name + '\n' +
	                'Updated: ' + chat.updated_at + '\n' +
	                'Message: ' + chat.message);
	        }
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};
// exports.getCurrentCloud = function(){
	// return Cloud;
// }

// exports.cloudProxy = cloudProxy;


exports.getCloud = function(){
	return cloudProxy;
};
