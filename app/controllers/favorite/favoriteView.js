// var args = arguments[0] || {};
var customer, // = args.ownerCustomer || AG.customers.getCurrentCustomer();
	users,
	yos;

exports.init = function( options ) {
	if(!options.customer){
		Ti.API.debug("[favoriteView.init] customer is needed   ");
		return;
	}
	customer = options.customer;
	users = customer.yoUsers;
	yos = customer.yos;

	$.userList.init({
		customer: customer,
		users: users,
		defaultTemplate: "withRightButton"
	});
};

$.userList.getView().addEventListener("rightButtonClick", function (e){
 var userId = e.userId;
 Ti.API.debug("[favoriteView] rightButtonClick event fired with userId "+ userId);

 var optionDialog = Ti.UI.createOptionDialog({
	 // title: 'hello?',
	 options: [L("unyo"), L("yo"), L("hide"), L("chat"), L("cancel")],
	 cancel: 4,
	 selectedIndex: 1,
	 destructive: 0
 });

 optionDialog.addEventListener('click', function(e){
	 var yt = yos.where({
		 "provider": customer.get("provider"),
		 "senderId": customer.get("provider_id"),
		 "receiverId": userId
	 }).pop();

	 if( e.index === 0){
		 if(yt.get("unyo")){
			 yt.reyo({
				 'success': function(){
					 alert(L("yo_reyo_success"));
				 },
				 'error': function(){
					 alert(L("yo_reyo_success"));
				 }
			 });
		 }else{
			 yt.unyo({
				 'success': function(){
					 alert(L("yo_unyo_success"));
				 },
				 'error': function(){
					 alert(L("yo_unyo_success"));
				 }
			 });
		 }
		 // yos.where({'target_id_str':  e.itemId}).pop().destroy();
	 }else if( e.index === 1){
		 yos.addNewYo({
			 senderUser: customer.userIdentity,
			 receiverUser: users.get(userId),
			 success: function() {
				 alert(L("yo_save_success"));
			 },
			 error: function() {
				 alert(L("yo_save_error"));
			 }
		 });
	 }else if( e.index === 2 ){
		 yt.hide({
			 'mainAgent': ownerCustomer
		 });
	 }else if( e.index === 3){
		 var chatWindow = Alloy.createController('chatWindow', {
			 'targetUser': users.where({
				 'id_str': id_str
			 }).pop()
		 });
		 chatWindow.getView().open();
	 }
 });	// optionDialog.addEventListener

 optionDialog.show();
});

function fetchYoUsers(newYos) {
	if( !newYos || newYos.length == 0 ){
		return;
	}
	var userIds = [];
	newYos.map(function(yo){
		if( yo.get("hided") ){
			return;
		}
		userIds.push(yo.get("receiverId"));
	});
	// userIds = userIds.replace( /^,/g , '');

	users.addByIds({
		userIds: userIds,
		success: function(){
			Ti.API.info("[peopleView.fetchUsersBy] success ");
		},
		error: function(){
			Ti.API.info("[peopleView.fetchUsersBy] failure ");
		}
	});
}
