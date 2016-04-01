var options;


function onClick(e){
  // Ti.API.info('e.cancel: ' + e.cancel);
  // Ti.API.info('e.source.cancel: ' + e.source.cancel);
  // Ti.API.info('e.index: ' + e.index);
  if (e.index == e.source.cancel){
    Ti.API.info("[allowPushAlertDialog] The cancel button was clicked.");
  }else{
		var pushRegHandlers = {
			callback: function(e){
				// alert("data: "+JSON.stringify(e.data) +"\n"+e.inBackground);
				// 뱃지를 0으로 하는거를 무시하지 않으면 무한 반복 푸쉬 됨..
				if(  e.data.badge === 0 ){
					return;
				}
				AG.notifyController.push({
					pushEvent: e
				});
			},
			error: function(e){
				Ti.API.warn("[allowPushAlertDialog] register for pushnotification error");
				_.isFunction(options.error) && options.error();
			},
			success: function(e){
				Ti.API.debug("[allowPushAlertDialog] register for pushnotification success");
				AG.setting.save("deviceToken", e.deviceToken || Ti.Network.getRemoteDeviceUUID()  );
				// subscribePushChannel(options);
				_.isFunction(options.success) && options.success();
			}
		};
    if(require("compare-version")(AG.platform.osVersion, "8.0") >= 0){
			/*
      function register() {
        Ti.API.debug("[allowPushAlertDialog] usernotificationsettings event!! categories:" + e.categories);
        Ti.Network.registerForPushNotifications(pushRegHandlers);
        // Remove event listener once registered for push notifications
        Ti.App.iOS.removeEventListener("usernotificationsettings", register);
      }
			*/
      // Wait for user settings to be registered before registering for push notifications
      Ti.App.iOS.addEventListener("usernotificationsettings", function(){
				Ti.API.debug("[allowPushAlertDialog] usernotificationsettings event!! categories:" + e.categories);
        Ti.Network.registerForPushNotifications(pushRegHandlers);
			});
      // Register notification types to use. this will fire "usernotificationsettings" event
      Ti.App.iOS.registerUserNotificationSettings({
        types: [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE]
      });
      AG.setting.save("haveTriedToRegister", true);
    }else{
      Ti.Network.registerForPushNotifications(_.extend({
        types: [
          Ti.Network.NOTIFICATION_TYPE_BADGE,
          Ti.Network.NOTIFICATION_TYPE_ALERT,
          Ti.Network.NOTIFICATION_TYPE_SOUND
        ]
      }, pushRegHandlers));
      AG.setting.save("haveTriedToRegister", true);
    }
  }
};

exports.tryRegistring = function(opts){
  options = opts || {};

  if(!Ti.Network.remoteNotificationsEnabled){
    if(AG.setting.get("haveTriedToRegister")){
      alert(L("turnOnRemoteNotificationsAtSettings"));
    }else{
      // first time!
      $.getView().applyProperties({
        cancel: 1,
        // A maximum of 3 buttons is supported on Android.
        buttonNames: [L("pleasePush"), L("cancel")],
        message: L("youNeedPushNotificationForYo") || options.message,
        title: L("doYouWantPushNotification") || options.title
      });
      $.getView().show();
    }
  }else{
    // already enable push norification~
  }
};
