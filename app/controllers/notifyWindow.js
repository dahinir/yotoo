/**
 * notifyWindow.js
 *
 */
var args = arguments[0] || {};

var THIS_HEIGHT = $.notifyWindow.getHeight(),
	DURATION = 2900;
var processing,
	timerId,
	queue = [],
	nowExposing = false;

function _hide(){
	clearTimeout(timerId);
	$.notifyWindow.animate({
		duration: 100,
		top: -THIS_HEIGHT
	}, function(){
		// Ti.API.info("[notifyWindow] queue length: "+ queue.length);
		if (queue.length > 0){
			_notifies();
		}else{
			nowExposing = false;
		}
	});
}
function _notifies(){
	processing = queue.shift();
	var pushEvent = processing.pushEvent;
	var message = processing.message || pushEvent.data.alert;

	if(pushEvent && pushEvent.inBackground){
		_doAction();
	}else{
		// expose
		$.message.setText(message);
		// $.notifyWindow.fireEvent( "notifyExpose", {ndata: processing});
		$.notifyWindow.animate({
			duration: 100,
			top:0
		});
	}

	// notibar를 보여주지 않아도 queue는 일정 간격으로 계속 처리 하기 위해 실행
	timerId = setTimeout(_hide, processing.duration || DURATION);
	// timerId = setTimeout(_hide, 2900);
}

function _doAction(){
	AG.customers.getCurrentCustomer().mainTabGroup.setActiveTab(1);	// index 1 is favorite
	return;

	// below was for licky..
	var pushEvent = processing.pushEvent;
	if( pushEvent && pushEvent.data.post_id ){
		AG.mainTabGroup.setActiveTab(2);	// index 2 is pushHistory
		setBadge("-1");
		AG.utils.openController(AG.mainTabGroup.activeTab, 'postDetail', {
			post_id: pushEvent.data.post_id
		});
	}
}
$.notifyWindow.addEventListener('click', function(){
	_doAction();
	_hide();
});


// number can be integer or string like "+1" or "-2"
function setBadge(number){
	// if( AG.isLogIn() ){
	// 	AG.Cloud.PushNotifications.setBadge({
	//     device_token: AG.settings.get('deviceToken'),
	//     badge_number: number
	// 	}, function (e) {
	//     if (e.success) {
  //       Ti.API.info('Badge Set!');
	//     }
	//     else {
  //       Ti.API.error(e);
	//     }
	// 	});
	// }
	if( _.isString(number) ){
		number =  Ti.UI.iPhone.getAppBadge() + parseInt(number);
		number = (number<0)? 0: number;
	}
	Ti.App.fireEvent( "changeBadge", {"number": number});
};
exports.setBadge = setBadge;

/**
 * @param {options} must be set `options.message` or `options.pushEvent`
 * @param {options.message} notibar에 보여질 메세지
 * @param {options.pushEvent} pushNotification으로 받은 이벤트 객체
 * @param {options.duration} 보여질 시간
 * @example
 * AG.notifyController.push({
 *	message: "hello"
 * });
 * AG.notifyController.push({
 * 	message: "fucking"
 * });
 * AG.notifyController.push({
 * 	message: "world"
 * });
 */
function push(options){
	Ti.API.info("push, nowExposing: "+nowExposing);
	setBadge("+1");

	// queueing
	queue.push(options);
	if( nowExposing ){
		return;
	}
	nowExposing = true;
  $.notifyWindow.open();
	_notifies();
};
exports.push = push;
