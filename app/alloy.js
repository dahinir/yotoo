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
// Alloy.globals = Alloy.globals || {};
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

if( OS_IOS ){
	// Ti.API.debug("[index.js] this is IOS");
	// alert("[index.js] this is IOS");
}
Ti.Network.registerForPushNotifications({
	type: [
		Ti.Network.NOTIFICATION_TYPE_ALERT,
		Ti.Network.NOTIFICATION_TYPE_BADGE,
		Ti.Network.NOTIFICATION_TYPE_SOUND
	],
	callback: function(e){
		alert("push ");
		 // + e.data + ", " + e.inBackground );
	},
	error: function(e){
		alert("error " + e.code + ", " + e.error );
	},
	success: function(e){
		alert("code: ");
		 // + e.code + "deviceToken: " + e.deviceToken );
	}
});

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