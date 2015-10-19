$.getView().applyProperties({
  cancel: 1,
  // A maximum of 3 buttons is supported on Android.
  buttonNames: ['Confirm', L("cancel")],
  message: 'Would you like to delete the file?',
  title: L("decide")
});

function onClick(e){
  if (e.index == e.source.cancel){
    Ti.API.info('The cancel button was clicked');
  }
  Ti.API.info('e.cancel: ' + e.cancel);
  Ti.API.info('e.source.cancel: ' + e.source.cancel);
  Ti.API.info('e.index: ' + e.index);
};
// dialog.show();

// module.exports = dialog;
function tryRegisterPush(options){
  Ti.API.info("trye");
  $.getView().show();
  return;

  // push notification
  if( OS_IOS & false){
  	// Titanium.App.iOS.registerUserNotificationSettings();
  	// Call this method at application startup.
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
  Ti.API.info("e.data:  "+ JSON.stringify(e.data));
  			var recipientCustomer = AG.customers.where({'id_str': e.data.t}).pop();
  			if( !recipientCustomer ){
  				//예전에 로긴 했던 유저.. 어카운트 지울때 unsubscribe를 해야 겠구만!
  				return;
  			}
  			var relevantYotoo = recipientCustomer.getYotoos().where({
  				'source_id_str': e.data.t,
  				'target_id_str': e.data.f
  			}).pop();
  			/* 상황에 맞게 상대에게 유투 노티피케이션을 보낸다. */
  			if( e.data.sound === 'yotoo1' ){
  				// 유투 알람 완료를 acs에서 따로 관리 할까..
  				Alloy.Globals.yotoos.sendYotooNotification({
  					'sourceUser': recipientCustomer,
  					'targetUser': Alloy.Globals.users.where({'id_str':e.data.f}).pop(),
  					'sound': 'yotoo2',
  					'success': function(){},
  					'error': function(){}
  				});
  			}
  			if( e.data.sound === 'yotoo1' || e.data.sound === 'yotoo2'){
  				relevantYotoo.complete({
  					'mainAgent': recipientCustomer,
  					'success': function(){
  						// need to save?
  					},
  					'error': function(){}
  				});
  			}

  			// case of background
  			if( e.inBackground ) {
  				// e.data.t
  				if( !recipientCustomer ){
  					// 당신이 사용 정지한 receiverCustomer와 e.data.f가 서로 유투 했으니
  					// 로긴만 하면 시크릿 채팅을 할 수 있어용..
  					alert(L('you must loggin'));
  					return;
  				}
  				var chatWindow = Alloy.createController('chatWindow', {
  					'ownerCustomer': recipientCustomer,	// must setted!
  					'targetUser': Alloy.Globals.users.where({'id_str':e.data.f}).pop()
  				});
  				chatWindow.getView().open();
  			// case of running
  			}else {
  				Ti.App.fireEvent("app:newChat:" + e.data.f);
  				// case of chatting with Notified user
  				if( recipientCustomer.currentChatTarget === e.data.f ){
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
  			alert("code:" + e.code + "deviceToken: " + e.deviceToken );
  			Ti.API.info("code:" + e.code + "deviceToken: " + e.deviceToken );
  		}
  	});
  }


	options = options || {};
	if(options.title) $.title.text = options.title;

	if(options.force){
		if(!Ti.Network.remoteNotificationsEnabled && AG.settings.get('haveRequestPushRegist')){ //허용하지 않음 : 설정앱에서 변경해야함을 안내하자
			alert(L('turnOnRemotePushAtSettings'));
		}else{ // 아직 한번도 허용할지 물어보지 않음 : 물어보자!
			registerForPushNotifications(options);
		}
		return;
	}
	//허용 된 상태이거나 내부 허용 dialog(allowPushDialog)에서 취소를 누른적 있거나
	if(Ti.Network.remoteNotificationsEnabled || AG.settings.get('haveCanceledLocalPushDialog')){
		// 채널 subscribed가 되어 있는지 설정값으로 확인 후 안되어있는 channel만 다시 subscribe 요청
		// 일단 현재는 아무 일도 안함
	}else{
		if(AG.settings.get('haveRequestPushRegist')){ //허용하지 않음 : 설정앱에서 변경해야함을 안내하자
			alert(L('turnOnRemotePushAtSettings'));
		}else{ // 아직 한번도 허용할지 물어보지 않음 : 물어보자!
			$.getView().open();
		}
	}
};
exports.tryRegisterPush = tryRegisterPush;
