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
_.extend(Alloy.Globals,{
     // util : require('util'),
     myVal : 3,
     myFunction : function(){
         //do somethingSpringpad
     },
     // todoCollection : Alloy.createCollection(‘Todo’),  currentModel : null
});

// Object.create()
if (typeof Object.create !== 'function'){
	Ti.API.debug("define Object.create()");
	Object.create = function (o) {
		var F = function (){};
		F.prototype = o;
		return new F();
	}
}else{
	Ti.API.warn("already defined Object.create()");
}


// load loged account from persistent storage //
// This will create a singleton if it has not been previously created, or retrieves the singleton if it already exists.
var accounts = Alloy.Collections.instance('account');
var users = Alloy.Collections.instance('user');
var yotoos = Alloy.Collections.instance('yotoo');
var chats = Alloy.Collections.instance('chat');

accounts.fetch();
users.fetch();
yotoos.fetch();
chats.fetch();

Ti.API.info("[alloy.js] " + accounts.length + " loged in accounts loaded");
Ti.API.info("[alloy.js] " + users.length + " users loaded");
Ti.API.info("[alloy.js] " + yotoos.length + " yotoos");
Ti.API.info("[alloy.js] " + chats.length + " chats");

Alloy.Globals.accounts = accounts;
Alloy.Globals.users = users;
Alloy.Globals.yotoos = yotoos;
Alloy.Globals.chats = chats;

/*
var w = Titanium.UI.createWindow({
  url:'cloudProxy.js'
});
w.open();
*/
var twitterAdapter = require('twitter');
accounts.map(function(account){
	
	// account.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] load account: @" + account.get('screen_name')
	+"\t, "+account.get('id_str')+" ," +account.get('id')
	+", "+ account.get('active') +", "+account.get('status_active_tab_index'));

	account.twitterApi = twitterAdapter.create({
		accessTokenKey: account.get('access_token'),
		accessTokenSecret: account.get('access_token_secret')
	});

}); // accounts.map()

users.map(function(user){
	// account.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] load user: @" + user.get('screen_name')
	+", "+user.get('id_str')+", " +user.get('acs_id'));
});

yotoos.map(function( yotoo){
	// yotoo.set({'unyotooed': 12});
	// yotoo.save({'platform': "fuck"},"",{
		// error:function(){
			// alert("e");
		// },
		// success: function(){
			// alert("s");
		// }
	// });
	Ti.API.info("[alloy.js] yotoo: " + yotoo.get('id')	
		+ " " + yotoo.get('platform') + " " + yotoo.get('source_id_str')
		+ " " + yotoo.get('target_id_str') + " " + yotoo.get('unyotooed')
		+ " " + yotoo.get('completed'));
});

chats.map(function( chat ){
	Ti.API.info("[alloy.js] chats: " + chat.get('id')
		+ " " + chat.get('chatgroup') + " " + chat.get('message'));
});


if( ENV_DEV ){
	// alert("ENV_DEV");
}
if( ENV_TEST ){
	// alert("ENV_TEST");
}
if( ENV_PRODUCTION ){
	// alert("ENV_PRODUCTION");
}

// push notification
if( OS_IOS ){
	// alert("os");
	// Ti.API.debug("[index.js] this is IOS");
	// alert("[index.js] this is IOS");
	Ti.UI.iPhone.setAppBadge( 12 );
	Ti.Network.registerForPushNotifications({
		type: [
			Ti.Network.NOTIFICATION_TYPE_ALERT,
			Ti.Network.NOTIFICATION_TYPE_BADGE,
			Ti.Network.NOTIFICATION_TYPE_SOUND
		],
		callback: function(e){
			/* 
			 * Connection 탭의 activity history를 보여줄까?
			 */
			// alert("notification callback");
			// alert(JSON.stringify(e));
			// Ti.API.info(JSON.stringify(e.data));
			var recipientAccount = accounts.where({'id_str': e.data.t}).pop();

	
			/* 상황에 맞게 상대에게 유투 노티피케이션을 보낸다.
			if( e.data.sound === 'yotoo' ){
				// 로컬 유투를 컴플릿 하고 새이브 하는 코드 삽입, 서버의 요투도. 
				
				var relevantYotoo = recipientAccount.getYotoos().where({
					'source_id_str': e.data.t,
					'target_id_str': e.data.f
				}).pop(); 
				// 유투 알람 완료를 acs에서 관리할까..
				recipientAccount.getYotoos().sendYotooNotification({
					'sourceUser': recipientAccount,
					'targetUser': dd,
					'sound': 'yotoo2',
					'success': function(){
					},
					'error': function(){
						
					}
				});
			}
			if( e.data.sound === 'yotoo2' ){
				// 요투 노티는 안보내고 로컬 요투를 컴플릿 하고 세이브 하는 코드 삽입, 서버도. 
			}
			*/
			
			var openChatWindow = function(){
				// e.data.t
				if( !recipientAccount ){
					// 당신이 사용 정지한 receiverAccount와 e.data.f가 서로 유투 했으니
					// 로긴만 하면 시크릿 채팅을 할 수 있어용..
					alert(L('you must loggin'));
					return;
				}
				var user = recipientAccount.createModel('user');
				user.fetchFromServer({
					'purpose': "userView",
					'params': {
						'user_id': e.data.f
					},
					'success': function(){
						alert(user.get('screen_name'));
						var chatWindow = Alloy.createController('chatWindow', {
							'ownerAccount': recipientAccount,	// must setted!
							'targetUser': user
						});
						chatWindow.getView().open();
					},
					'error': function(){}
				});
			};
			
			// case of background
			if( e.inBackground ) {
				openChatWindow();
			// case of running
			}else {
				recipientAccount.getChats().fetchFromServer({
					'mainAgent': recipientAccount
				});
				// case of chatting with Notified user
				if( recipientAccount.currentChatTarget === e.data.f ){
					// do notting
				// case of chatting with other user
				}else{
					alert(JSON.stringify(e.data));
				}
			}
			// e.data.alert: hi hehe
			// e.data.badge: 7
			// e.data.sound: 
			
			// e.data.aps.alert: asdf
			// e.data.aps.badge: 1
			// e.data.aps.sound: default
		},
		error: function(e){
			alert("error");
			alert("error " + e.code + ", " + e.error );
		},
		success: function(e){
			alert("success");
			alert("code:" + e.code + "deviceToken: " + e.deviceToken );
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