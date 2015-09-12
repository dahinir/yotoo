// var args = arguments[0] || {};
var customer, // = args.ownerCustomer || AG.customers.getCurrentCustomer();
	users,
	yotoos;

exports.init = function( options ) {
	if(!options.customer){
		Ti.API.debug("[favoriteView.init] customer is needed ");
		return;
	}
	customer = options.customer;
	users = customer.yotooedUsers;
	yotoos = customer.yotoos;

	$.userList.init({
		customer: customer,
		users: users
	});
// fetchYotooUsers(yotoos);
};

$.userList.getView().addEventListener("rightButtonClick", function(e){
	var userId = e.userId;

	var optionDialog = Ti.UI.createOptionDialog({
	  // title: 'hello?',
	  options: [L("unyotoo"), L("yotoo"), L("hide"), L("chat"), L("cancel")],
	  cancel: 4,
	  selectedIndex: 1,
	  destructive: 0
	});

	optionDialog.addEventListener('click', function(e){
		var yt = yotoos.where({
			"provider": customer.get("provider"),
			"senderId": customer.get("provider_id"),
			"receiverId": userId
		}).pop();

		if( e.index === 0){
			if(yt.get("unyotooed")){
				yt.reyotoo({
					'success': function(){
						alert(L("yotoo_reyotoo_success"));
					},
					'error': function(){
						alert(L("yotoo_reyotoo_success"));
					}
				});
			}else{
				yt.unyotoo({
					'success': function(){
						alert(L("yotoo_unyotoo_success"));
					},
					'error': function(){
						alert(L("yotoo_unyotoo_success"));
					}
				});
			}
			// yotoos.where({'target_id_str':  e.itemId}).pop().destroy();
		}else if( e.index === 1){
			yotoos.addNewYotoo({
				senderUser: customer.userIdentity,
				receiverUser: users.get(userId),
				success: function() {
					alert(L("yotoo_save_success"));
				},
				error: function() {
					alert(L("yotoo_save_error"));
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

function fetchYotooUsers(newYotoos) {
	if( !newYotoos || newYotoos.length == 0 ){
		return;
	}
	var userIds = [];
	newYotoos.map(function(yotoo){
		if( yotoo.get("hided") ){
			return;
		}
		userIds.push(yotoo.get("receiverId"));
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



/*
var tempAddedYotoos = Alloy.createCollection('yotoo');
yotoos.on('add', function(addedYotoo, collection, options){
	// alert(addedYotoo.get('source_id_str'));
	// alert(options.index + ", "+ collection.length + ", "+ yotoos.length);
	addedYotoo.save();
	if( addedYotoo.targetUser ){
		users.add( addedYotoo.targetUser );
	}else{
		tempAddedYotoos.add(addedYotoo);
		if( options.index === yotoos.length - 1){
			fetchYotooUsers( tempAddedYotoos );
			tempAddedYotoos.reset();
		}
	}
	Ti.API.info("[peopleView.js] yotoo add event");
});

yotoos.on('change:hided', function(yotoo){
	var changedUser = users.where({'id_str': yotoo.get('target_id_str')}).pop();
	if( yotoo.get('hided') ){
		users.remove( changedUser );
	}else{
		var tempUnhidedYotoos = Alloy.createCollection('yotoo');
		tempUnhidedYotoos.add( yotoo );
		fetchYotooUsers( tempUnhidedYotoos );
	}
});



// var retrieveTargetIds = function( yotoos ){
	// var userIds = "";
	// newYotoos.map(function(yotoo){
		// userIds = userIds + "," + yotoo.get('target_id_str');
	// });
//
	// return userIds.replace( /^,/g , '');
// };



// should be 'pull to refresh'
var testButton = Ti.UI.createButton();
$.favoriteView.add( testButton);
testButton.addEventListener('click', function(){
	// tUser = Alloy.createModel('user',{
		// id_str: '603155477',
		// acs_id: '5218870525e74b0b2402a4c4'
	// });
	// Alloy.Globals.yotoos.sendYotooNotification({
		// 'sourceUser': ownerAccount,
		// 'targetUser': tUser,
		// 'sound': 'yotoo2',
		// 'success': function(e){
			// alert("success");
		// },
		// 'error': function(e){
			// alert("error\n"+ JSON.stringify(e));
		// }
	// });
	require('ti.cloud').PushNotifications.query();
	// yyyy-mm-ddThh:mm:ss+zzzz
	// yotoos.map(function(yotoo){
		// Ti.API.info("[people.js] yotoo: " + yotoo.get('id')
			// + " " + yotoo.get('chat_group_id') + " " + yotoo.get('source_id_str')
			// + " " + yotoo.get('target_id_str') + " " + yotoo.get('unyotooed')
			// + " " + yotoo.get('completed'));
	// });
	// var relevantYotoo = yotoos.where({'target_id_str': "283003008"}).pop();
	// alert( relevantYotoo.get('completed') );

	// var cloudApi = require('cloudProxy').getCloud();
	// cloudApi.deleteAllYotoos(ownerAccount);

	// yotoos.fetchFromServer({
		// 'mainAgent': ownerAccount,
		// 'success': function(){
			// yotoos.map(function(yotoo){
				// yotoo.save();
			// });
			// // save fetched yotoos in 'add' event listener
			// Ti.API.info("[peopleView.js]");
		// },
		// 'error': function(){
			// Ti.API.info("[peopleView.js]");
		// }
	// });
});
*/
