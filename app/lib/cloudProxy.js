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
 * @param {Function} [options.success] Callback function executed after a success
 * @param {Function} [options.error] Callback function executed after a fail 
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

				if( options.success ){
					options.success(e);
				}
		    } else {	// ACS login error
		        Ti.API.info('[cloudProxy.js]Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		        if( options.error ){
		        	options.error(e);
		        }
		    }
		});
	}else{	// ACS already loggin
		Ti.API.info("[cloudProxy.js] already logged in ACS");
		if( options.success ){
			options.success(currentLoginUserCache);
		}
	}
};

/**
 * @param {account} [options.sourceUser]
 * @param {account} [options.targetUser]
 * @param {Function} [options.success]
 * @param {Function} [options.error]
 */
cloudProxy.yotooRequest = function(options) {
	var sourceUser = options.sourceUser;
	var targetUser = options.targetUser;
	
	// alert("inner: "+ currentLoginUserIdStr +"\nouter:"+sourceUser.get('id_str'));
	cloudProxy.externalAccountLoginAdapter({
		id: sourceUser.get('id_str'),
	    type: 'twitter',
	    token: sourceUser.get('access_token'),
		success: function (e) {
	        var user = e.users[0];
	        // Ti.API.info('[cloudProxy.js] Cloud login success! sessionId:'+Cloud.sessionId+ ' id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);
	        // alert('[cloudProxy.js] current '+ currentAccount.get('session_id_acs') );
	        // Ti.API.info('[cloudProxy.js]external id: ' + e.users[0].external_accounts[0].external_id );
	        currentLoginUserIdStr = e.users[0].external_accounts[0].external_id;
	        // now, time to yotoo!
	        postYotoo({
	        	'sourceUser': sourceUser, 
	        	'targetUser': targetUser,
	        	'success': options.success,
	        	'error': options.error
	        });
		},
		error: function(e){	// ACS loggin error
	        Ti.API.info('[cloudProxy.yotooRequest] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	        if( options.error ){
	        	options.error(e);
	        }
		}
	});
};

/**
 * @param {account} [options.sourceUser]
 * @param {account} [options.targetUser]
 * @param {Function} [options.success]
 * @param {Function} [options.error]
 */
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
			if( options.success ){
				options.success(result);
			}
			
			
			// should be add retry action..
			checkTargetYotoo(sourceUser, targetUser);
	    } else {	// ACS create yotoo error
	        Ti.API.info('[cloudProxy.createYotoo] Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			if( options.error ){
				options.error(e);
			}
	    }
	});
};

var checkTargetYotoo = function(sourceUser, targetUser){
	Cloud.Objects.query({
	    classname: 'yotoo',
	    limit: 1000, // 1000 is maxium
	    where: {
	        source_id_str: targetUser.get('id_str'),
	        target_id_str: sourceUser.get('id_str')
	    }
	}, function (e) {
	    if (e.success) {
            var yotoo = e.yotoo[0];
            // alert('id: ' + yotoo.id + '\n' +
                // 'source: ' + yotoo.source + '\n' +
                // 'target: ' + yotoo.target + '\n' +
                // 'created_at: ' + yotoo.created_at);
            if( e.yotoo.length === 0 ){
		        alert('Success:\n' + 'Count: ' + e.yotoo.length);
            }else if ( e.yotoo.length > 0){
            	alert('YOTOO!');
            	sendPushNotification(sourceUser, targetUser);
            }
	    } else {
	        alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

var sendPushNotification = function(sourceUser, targetUser){
	Cloud.PushNotifications.notify({
		channel : 'yotoo',
		// friends : Any,
		to_ids : targetUser.get('id_str_acs'),
		payload : sourceUser.get('name') + " " + L('yotoo_you_too')
		// payload: {
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
			alert('Success');
		} else {
			alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
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
