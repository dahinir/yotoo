/*
 * alloy.js
 * 
 * this is not a Controller
 * for define some global javascript APIs 
 * -rapodor
 * 
OS_IOS : true if the current compiler target is iOS
OS_ANDROID : true if the current compiler target is Android
OS_MOBILEWEB : true if the current compiler target is Mobile Web
ENV_DEV : true if the current compiler target is built for development (running in the simulator or emulator)
ENV_TEST : true if the current compiler target is built for testing on a device
ENV_PRODUCTION : true if the current compiler target is built for production (running after a packaged installation)
 */
"use strict";
if(ENV_DEV){
	Ti.API.info("ENV_DEV");
	// alert("ENV_DEV");
}
if(ENV_TEST){
	Ti.API.info("ENV_TEST");
	// alert("ENV_TEST");
}
if(ENV_PRODUCTION){
	require('ti.newrelic').start( Ti.App.Properties.getString('newrelic-development') );
}

if (typeof Object.create !== 'function'){
	Ti.API.info("[alloy.js] define Object.create()");
	Object.create = function (o) {
		var F = function (){};
		F.prototype = o;
		return new F();
	};
}else{
	Ti.API.info("[alloy.js] already defined Object.create() ");
}

// global variable
var AG = Alloy.Globals;

_.extend(AG ,{
	COLORS: require('colors'),
	platform: {
		platformHeight: Ti.Platform.displayCaps.platformHeight,
		osname: Ti.Platform.osname,
		model: Ti.Platform.model,
		osVersion: Ti.Platform.version,
		appId: Ti.App.id,
		appVersion: Ti.App.version,
		locale: Ti.Platform.locale
	},
	
	accounts: Alloy.Collections.instance('account'),
	users: Alloy.Collections.instance('user'),
	yotoos: Alloy.Collections.instance('yotoo'),
	chats: Alloy.Collections.instance('chat')
});

AG.accounts.fetch();
AG.users.fetch();
AG.yotoos.fetch();
AG.chats.fetch();

Ti.API.info("[alloy.js] " + AG.accounts.length + " loged in accounts loaded");
Ti.API.info("[alloy.js] " + AG.users.length + " users loaded");
Ti.API.info("[alloy.js] " + AG.yotoos.length + " yotoos");
Ti.API.info("[alloy.js] " + AG.chats.length + " chats");



/*
var w = Titanium.UI.createWindow({
  url:'cloudProxy.js'
});
w.open();
*/

AG.accounts.map(function(account){
	// account.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] account: @" + account.get('screen_name')
	+"\t, "+account.get('id_str')+" ," +account.get('id')
	+", "+ account.get('active') +", "+account.get('status_active_tab_index'));

	account.twitterApi = require('twitter').create({
		accessTokenKey: account.get('access_token'),
		accessTokenSecret: account.get('access_token_secret')
	});

}); // accounts.map()

AG.users.map(function(user){
	// account.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] user: @" + user.get('screen_name')
	+", "+user.get('id_str')+", " +user.get('acs_id'));
});

AG.yotoos.map(function( yotoo){
	Ti.API.info("[alloy.js] yotoo: " + yotoo.get('id')	
		+ " " + yotoo.get('created_at') + " " + yotoo.get('burned_at')
		+ " " + yotoo.get('chat_group_id') + " " + yotoo.get('source_id_str')
		+ " " + yotoo.get('target_id_str') + " " + yotoo.get('unyotooed')
		+ " " + yotoo.get('completed'));
});

AG.chats.map(function( chat ){
	Ti.API.info("[alloy.js] chats: " + chat.get('id')
		+ " " + chat.get('chat_group_id') + " " + chat.get('message'));
});


// AG.updateChecker = function(cb){
	// latest,
// };
// setTimeout(_.debounce(function() {
	// Alloy.createWidget('appMetaFromACS').fetch();
// }), 1000);
// Ti.App.addEventListener('resume', appMetaDebounce);

// push notification
if( OS_IOS ){
	// Ti.UI.iPhone.setAppBadge( 11 );
	Ti.Network.registerForPushNotifications({
		'types': [
			Ti.Network.NOTIFICATION_TYPE_ALERT,
			Ti.Network.NOTIFICATION_TYPE_BADGE,
			Ti.Network.NOTIFICATION_TYPE_SOUND
		],
		'callback': function(e){
			/* 
			 * Connection 탭의 activity history를 보여줄까?
			 */
// 이제 상대방이 수동 burn 했을때 날린 noti를 처리 해야 한다.  
Ti.API.info("e.data: "+ JSON.stringify(e.data));
			var recipientAccount = AG.accounts.where({'id_str': e.data.t}).pop();
			if( !recipientAccount ){
				//예전에 로긴 했던 유저.. 어카운트 지울때 unsubscribe를 해야 겠구만!
				return;
			}
			var relevantYotoo = recipientAccount.getYotoos().where({
				'source_id_str': e.data.t,
				'target_id_str': e.data.f
			}).pop(); 
			/* 상황에 맞게 상대에게 유투 노티피케이션을 보낸다. */
			if( e.data.sound === 'yotoo1' ){
				// 유투 알람 완료를 acs에서 따로 관리 할까..
				Alloy.Globals.yotoos.sendYotooNotification({
					'sourceUser': recipientAccount,
					'targetUser': Alloy.Globals.users.where({'id_str':e.data.f}).pop(),
					'sound': 'yotoo2',
					'success': function(){},
					'error': function(){}
				});
			}
			if( e.data.sound === 'yotoo1' || e.data.sound === 'yotoo2'){
				relevantYotoo.complete({
					'mainAgent': recipientAccount,
					'success': function(){
						// need to save?
					},
					'error': function(){}
				});
			}
			
			// case of background
			if( e.inBackground ) {
				// e.data.t
				if( !recipientAccount ){
					// 당신이 사용 정지한 receiverAccount와 e.data.f가 서로 유투 했으니
					// 로긴만 하면 시크릿 채팅을 할 수 있어용..
					alert(L('you must loggin'));
					return;
				}
				var chatWindow = Alloy.createController('chatWindow', {
					'ownerAccount': recipientAccount,	// must setted!
					'targetUser': Alloy.Globals.users.where({'id_str':e.data.f}).pop()
				});
				chatWindow.getView().open();
			// case of running
			}else {
				Ti.App.fireEvent("app:newChat:" + e.data.f);
				// case of chatting with Notified user
				if( recipientAccount.currentChatTarget === e.data.f ){
				// case of chatting with other user or do not chat
				}else{
					// alert("running:"+JSON.stringify(e.data));
				}
			}
			// e.data.alert: hi hehe
			// e.data.badge: 7
			// e.data.sound: 
			
			// e.data.aps.alert: asdf
			// e.data.aps.badge: 1
			// e.data.aps.sound: default
		},
		'error': function(e){
			// alert("err");
			Ti.API.info("error " + e.code + ", " + e.error );
		},
		'success': function(e){
			// alert("su");
			Ti.API.info("code:" + e.code + "deviceToken: " + e.deviceToken );
		}
	});
}


// Alloy.builtins.moment 로 대체하자 
/**
 * Returns a description of this past date in relative terms.
 * Takes an optional parameter (default: 0) setting the threshold in ms which
 * is considered "Just now".
 *
 * Examples, where new Date().toString() == "Mon Nov 23 2009 17:36:51 GMT-0500 (EST)":
 *
 * new Date().toRelativeTime()
 * --> 'Just now'
 *
 * new Date("Nov 21, 2009").toRelativeTime()
 * --> '2 days ago'
 *
 * // One second ago
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime()
 * --> '1 second ago'
 *
 * // One second ago, now setting a now_threshold to 5 seconds
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime(5000)
 * --> 'Just now'
 *
 */
Date.prototype.toRelativeTime = function(now_threshold) {
  var delta = new Date() - this;

  now_threshold = parseInt(now_threshold, 10);

  if (isNaN(now_threshold)) {
    now_threshold = 0;
  }

  if (delta <= now_threshold) {
    return 'just now';
  }

  var units = null;
  var conversions = {
    ms: 1, // ms    -> ms
    s: 1000,   // ms    -> sec
    m: 60,     // sec   -> min
    h:   60,     // min   -> hour
    d:    24     // hour  -> day
    // month:  30,     // day   -> month (roughly)
    // year:   12      // month -> year
  };

  for (var key in conversions) {
    if (delta < conversions[key]) {
      break;
    } else {
      units = key; // keeps track of the selected key over the iteration
      delta = delta / conversions[key];
    }
  }

  // pluralize a unit when the difference is greater than 1.
  delta = Math.floor(delta);
  // if (delta !== 1) { units += "s"; }
  // return [delta, units, "ago"].join(" ");
  return [delta, units].join("");
};

/*
 * Wraps up a common pattern used with this plugin whereby you take a String
 * representation of a Date, and want back a date object.
 */
Date.fromString = function(str) {
  return new Date(Date.parse(str));
};