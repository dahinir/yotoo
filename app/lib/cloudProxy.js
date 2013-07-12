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

/**
 * @param {String} [options.id]
 * @param {String} [options.type]
 * @param {String} [options.token]
 * @param {Function} [options.onSuccess] Callback function executed after a success
 * @param {Function} [options.onError] Callback function executed after a fail 
 */
cloudProxy.externalAccountLoginAdapter = function(options){
	if( !options.id ){
		Ti.API.warn("[cloudProxy.js] id must be described!!!");
	}
	
	// just login to ACS
	if( options.id !== currentLoginUserIdStr){
		Cloud.SocialIntegrations.externalAccountLogin({
			id: options.id,
		    type: options.type,
		    token: options.token
		}, function (e) {
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
		        Ti.API.info('[cloudProxy.js]Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		        if( options.onError ){
		        	options.onError(e);
		        }
		    }
		});
	}else{	// ACS already loggin
		Ti.API.info("[cloudProxy.js] already logged in ACS");
		if( options.onSuccess ){
			options.onSuccess(currentLoginUserCache);
		}
	}
};

/**
 * @method fetch
 * @param {Object} options
 * @param {String} options.url If this described, options.purpose will ignored
 * @param {String} options.purpose We got some twitter.com urls
 * @param {Object} options.params  
 * @param {Functioin} [options.onSuccess]
 * @param {Functioin} [options.onError]
 */
cloudProxy.fetch = function(options){
	/* user객체를 받느냐 id_str만 받느냐 그것이 문제로다. */
	/* id_str을 받아야 겠지.. */ 
}


/**
 * @param {String} options.modelType like 'yotoo'
 * @param {Object} [options.sourceUser]
 * @param {Object} [options.targetUser]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 */
cloudProxy.post = function(options) {
	var modelType = options.modelType || 'yotoo';
	var sourceUser = options.sourceUser;
	var targetUser = options.targetUser;
	
	var createNewModel = function(){
		Cloud.Objects.create({
			classname : modelType,
			fields : {
				source_id_str : sourceUser.get('id_str'),
				target_id_str : targetUser.get('id_str'),
				platform : 'twitter'	// default
			}
		}, function(e) {
			if (e.success) {
				var result = e.yotoo[0];
				// alert('Success:\n' +
				// 'id: ' + result.id + '\n' +
				// 'source: ' + result.source_id_str + '\n' +
				// 'target: ' + result.target_id_str + '\n' +
				// 'created_at: ' + result.created_at);
				// Ti.API.info("[cloudProxy.js] " + JSON.stringify(e) );
				if (options.onSuccess) {
					options.onSuccess(result);
				}
				
			} else {// ACS create yotoo error
				Ti.API.info('[cloudProxy.createYotoo] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
				if (options.onError) {
					options.onError(e);
				}
			}
		}); 
	};
	
	cloudProxy.externalAccountLoginAdapter({
		id: sourceUser.get('id_str'),
	    type: 'twitter',
	    token: sourceUser.get('access_token'),
		onSuccess: function (e) {
	        // now, time to yotoo!
	        createNewModel();
		},
		onError: function(e){	// ACS loggin error
	        Ti.API.info('[cloudProxy.yotooRequest] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	        if( options.onError ){
	        	options.onError(e);
	        }
		}
	});
};

/**
 * @param {account} [options.sourceUser]
 * @param {account} [options.targetUser]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 *
var postYotoo = function(options){
	var sourceUser = options.sourceUser;
	var targetUser = options.targetUser;
	
	// create yotoo
	Cloud.Objects.create({
	    classname: 'yotoo',
	    fields: {
	        source_id_str: sourceUser.get('id_str'),
	        target_id_str: targetUser.get('id_str'),
	        platform: 'twitter'	// default
	    }
	}, function (e) {
	    if (e.success) {
	        var result = e.yotoo[0];
	        // alert('Success:\n' +
	            // 'id: ' + result.id + '\n' +
	            // 'source: ' + result.source_id_str + '\n' +
	            // 'target: ' + result.target_id_str + '\n' +
	            // 'created_at: ' + result.created_at);
	         // Ti.API.info("[cloudProxy.js] " + JSON.stringify(e) );
			if( options.onSuccess ){
				options.onSuccess(result);
			}
			
			
			// should be add retry action..
			checkTargetYotoo(sourceUser, targetUser);
	    } else {	// ACS create yotoo error
	        Ti.API.info('[cloudProxy.createYotoo] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if( options.onError ){
				options.onError(e);
			}
	    }
	});
};
*/

/**
 * @param {String} options.modelType like 'yotoo'
 * @param {Object} [options.query] query for get
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 */
cloudProxy.get = function(options){
	var modelType = options.modelType || 'yotoo';
	var query = options.query;
	
	Cloud.Objects.query({
	    'classname': modelType,
	    // limit: 1000, // 1000 is maxium
	    // order: 'created_at',
	    'where': query
	}, function (e) {
	    if (e.success) {
	    	var resultsJSON = e[modelType];
	    	if( options.onSuccess ){
	    		options.onSuccess( resultsJSON );
	    	}
	    } else{ 
	        Ti.API.info('[cloudProxy.get] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	        if( options.onError ){
	        	options.onError(e);
	        }
	    }
	});
};

cloudProxy.sendPushNotification = function( options ){
	var channel = options.channel || 'yotoo';
	var message = options.message;
	var receiverAcsId = options.receiverAcsId;
	
	Cloud.PushNotifications.notify({
		'channel' : channel,
		// 'friends' : Any,
		'to_ids' : receiverAcsId,
		'payload' : message
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
			if( options.onSuccess ){
				options.onSuccess(e);
			}
		} else {
			alert('[cloudProxy.sendNotification] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if( options.onError ){
				options.onError(e);
			}
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
