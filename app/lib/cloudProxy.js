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
 * @param {Function} [callback]
 */
cloudProxy.externalAccountLoginAdapter = function(options, callback){
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
		        // now, time to yotoo!
		    } else {
		        Ti.API.info('[cloudProxy.js]Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		    }
		    
		    if( callback ){
		    	// Ti.API.info("[cloudProcy.js] callback is defined.");
		    	callback(e);
		    }
		});
	}else{
		Ti.API.info("[cloudProxy.js] already logged in ACS");
		callback(currentLoginUserCache);
	}
};

cloudProxy.yotooRequest = function(sourceAccount, targetAccount) {
	// alert("inner: "+ currentLoginUserIdStr +"\nouter:"+sourceAccount.get('id_str'));
	cloudProxy.externalAccountLoginAdapter({
		id: sourceAccount.get('id_str'),
	    type: 'twitter',
	    token: sourceAccount.get('access_token')
	}, function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        // Ti.API.info('[cloudProxy.js] Cloud login success! sessionId:'+Cloud.sessionId+ ' id: ' + user.id + ' first name: ' + user.first_name +' last name: ' + user.last_name);
	        // alert('[cloudProxy.js] current '+ currentAccount.get('session_id_acs') );
	        // Ti.API.info('[cloudProxy.js]external id: ' + e.users[0].external_accounts[0].external_id );
	        currentLoginUserIdStr = e.users[0].external_accounts[0].external_id;
	        // now, time to yotoo!
	        createYotoo(sourceAccount, targetAccount);
	    } else {
	        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

var createYotoo = function(sourceAccount, targetAccount){
	// create yotoo
	Cloud.Objects.create({
	    classname: 'yotoo',
	    fields: {
	        source: sourceAccount.get('id_str'),
	        target: targetAccount.get('id_str')
	    }
	}, function (e) {
	    if (e.success) {
	        var yotoo = e.yotoo[0];
	        // alert('Success:\n' +
	            // 'id: ' + yotoo.id + '\n' +
	            // 'source: ' + yotoo.source + '\n' +
	            // 'target: ' + yotoo.target + '\n' +
	            // 'created_at: ' + yotoo.created_at);
	         // Ti.API.info("[cloudProxy.js] " + JSON.stringify(e) );
	         checkTargetYotoo(sourceAccount, targetAccount);
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

var checkTargetYotoo = function(sourceAccount, targetAccount){
	Cloud.Objects.query({
	    classname: 'yotoo',
	    limit: 1000, // 1000 is maxium
	    where: {
	        source: targetAccount.get('id_str'),
	        target: sourceAccount.get('id_str')
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
            	sendPushNotification(sourceAccount, targetAccount);
            }
	    } else {
	        alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
};

var sendPushNotification = function(sourceAccount, targetAccount){
	Cloud.PushNotifications.notify({
		channel : 'yotoo',
		// friends : Any,
		to_ids : targetAccount.get('id_str_acs'),
		payload : sourceAccount.get('name') + " " + L('yotoo_you_too')
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
