var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();

/* sort this users by order of yotoo id */
users.comparator = function(user) {
	return yotoos.where({'target_id_str': user.get('id_str') }).pop().get('created_at');
};
users.on('add change', function(user){
	// this users is yotooed users that means important
	user.save();
});

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

var userListView = Alloy.createController('userListView', {
	'users': users,
	'yotoos': yotoos
});
userListView.getView().addEventListener('rightButtonClick', function(e){
	var id_str = e.id_str;
	var dialogOptions = {
	  'title': 'hello?',
	  'options': [L('unyotoo'), L('yotoo'), L('hide'), L('chat'), L('cancel')],
	  'cancel': 4,
	  'selectedIndex': 1,
	  'destructive': 0
	};
	var optionDialog = Ti.UI.createOptionDialog(dialogOptions);
	optionDialog.addEventListener('click', function(e){
		var yt = yotoos.where({'target_id_str':  id_str}).pop();
		var targetUser = users.where({
			'id_str': id_str
		}).pop();

		if( e.index === 0){
			yt.unyotoo({
				'mainAgent': ownerAccount,
				'success': function(){
				},
				'error': function(){
				}
			});
			// yotoos.where({'target_id_str':  e.itemId}).pop().destroy();
		}else if( e.index === 1){
			yotoos.addNewYotoo({
				'sourceUser': ownerAccount,
				'targetUser': targetUser,
				'success': function(){
				},
				'error': function(){
				}
			});
		}else if( e.index === 2 ){
			yt.hide({
				'mainAgent': ownerAccount
			});
		}else if( e.index === 3){
			var chatWindow = Alloy.createController('chatWindow', {
				'targetUser': targetUser
			});
			chatWindow.getView().open();
		}
	});
	optionDialog.show();
});
$.peopleView.add( userListView.getView() );

// var retrieveTargetIds = function( yotoos ){
	// var userIds = "";
	// newYotoos.map(function(yotoo){
		// userIds = userIds + "," + yotoo.get('target_id_str');
	// });
// 	
	// return userIds.replace( /^,/g , '');	
// };
var fetchYotooUsers = function( newYotoos ) {
	if( newYotoos.length === 0 ){
		return;
	}
	var userIds = "";
	newYotoos.map(function(yotoo){
		if( yotoo.get('hided') ){
			return;
		}
		userIds = userIds + "," + yotoo.get('target_id_str');
	});
	userIds = userIds.replace( /^,/g , '');

	users.fetchFromServer({
		'purpose': 'lookupUsers',
		'params': { 'user_id': userIds },
		'success': function(){
			Ti.API.info("[peopleView.fetchUsersBy] success");
		},
		'error': function(){
			Ti.API.info("[peopleView.fetchUsersBy] failure");
		}
	});
};
fetchYotooUsers(yotoos);


// should be 'pull to refresh' 
var testButton = Ti.UI.createButton();
$.peopleView.add( testButton);
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






