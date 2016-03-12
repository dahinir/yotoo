/*
 * alloy.js
 *
 * this is not a Controller
 * for define some global javascript APIs
 * -rapodor
 *
OS_IOS: true if the current compiler target is iOS
OS_ANDROID: true if the current compiler target is Android
OS_MOBILEWEB: true if the current compiler target is Mobile Web
ENV_DEV: true if the current compiler target is built for development (running in the simulator or emulator)
ENV_TEST: true if the current compiler target is built for testing on a device
ENV_PRODUCTION: true if the current compiler target is built for production (running after a packaged installation)
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
	Ti.API.info("[alloy.js] already defined Object.create()");
}

// global variable
var AG = Alloy.Globals;
(function(){
	var platformVersionInt = parseInt(Ti.Platform.version, 10);
	var platformHeight = Ti.Platform.displayCaps.platformHeight;
	AG.is = {
		iOS7: (OS_IOS && platformVersionInt == 7),
		iOS8: (OS_IOS && platformVersionInt >= 8),
		talliPhone: (OS_IOS && platformHeight == 568),
		iPhone6: (OS_IOS && platformHeight == 667),
		iPhone6Plus: (OS_IOS && platformHeight == 736)
	};
})();
_.extend(AG ,{
	COLORS: require('colors'),
	platform: {
		// will be move to AG.settings
		platformHeight: Ti.Platform.displayCaps.platformHeight,
		osname: Ti.Platform.osname,
		model: Ti.Platform.model,
		osVersion: Ti.Platform.version,
		appId: Ti.App.id,
		appVersion: Ti.App.version,
		locale: Ti.Platform.locale
	},

	//settings가 먼저 이뤄저야함
	//singleton Models (static id)
	setting: Alloy.Models.instance('setting'),
	customers: Alloy.Collections.instance('customer'),
	// customers: Alloy.createCollection("customer"),
	// accounts: Alloy.Collections.instance('account'),

	// 유저, 유투, 챗은 글로벌 하게 사용할 필요 없다. 삭제요망.
	// 각 커스토머마다 생성되어야 한다.
	// users: Alloy.Collections.instance('twitterUser'),	// only important user
	// users: Alloy.createCollection('user', {temp:"hehe"}),	// only important user
	// yos: Alloy.Collections.instance('yo'),
	chats: Alloy.Collections.instance('chat')
});

AG.testCount = 0;

AG.setting.fetch({
	success: function(){
		var deviceToken = Ti.Network.getRemoteDeviceUUID();
		// you got a new phone!
		if(deviceToken && (deviceToken != AG.setting.set("deviceToken"))){
			AG.setting.save("deviceToken", deviceToken);
		}else{
		}
	}
});

AG.customers.fetch({
	add: true,	// must set "add" sqlrest.js가 add를 셋팅해야 쓸모없는 모델이 생성 안한다. 대신 customers.length 숫자가 이상해짐.. don't believe customers.length..
	localOnly: true
});

// AG.accounts.fetch();
// AG.users.fetch();
// AG.yos.fetch();
// AG.chats.fetch();
/*
Ti.API.info("[alloy.js] " + AG.customers.length + " loged in customers loaded");
Ti.API.info("[alloy.js] " + AG.users.length + " users loaded");
Ti.API.info("[alloy.js] " + AG.yos.length + " yos");
Ti.API.info("[alloy.js] " + AG.chats.length + " chats");

AG.customers.map(function(customer){
	// customer.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] customer: @" + customer.get('screen_name')
	+"\t, "+customer.get('id_str')+" ," +customer.get('id')
	+", "+ customer.get('active') +", "+customer.get('status_active_tab_index'));

}); // customers.map()

AG.users.map(function(user){
	// customer.save({'status_active_tab_index': 12})
	Ti.API.info("[alloy.js] user: @" + user.get('screen_name')
	+", "+user.get('id_str')+", " +user.get('acs_id'));
});

AG.chats.map(function( chat ){
	Ti.API.info("[alloy.js] chats: " + chat.get('id')
		+ " " + chat.get('chat_group_id') + " " + chat.get('message'));
});
*/


// singleton Controller;
AG.allowPushController = Alloy.createController("allowPushAlertDialog");
// AG.loginController =  Alloy.createController('login');
// AG.notifyController = Alloy.createController('notifyView');
// AG.allowPushController = Alloy.createController("allowPushDialogWindow");


// use Alloy.builtins.moment!
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
