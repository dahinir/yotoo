var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();

/* sort this users by order of yotoo id */
users.comparator = function(user) {
	return yotoos.where({'target_id_str': user.get('id_str') }).pop().get('id');
};
users.on('add change', function(user){
	// this users is yotooed users that means important
	user.save();
});

var tempAddedYotoos = Alloy.createCollection('yotoo');
yotoos.on('add', function(addedYotoo, collection, options){
	// alert(JSON.stringify(b));	// collection
	// alert(JSON.stringify(options));	// {index: collections index}
	if( addedYotoo.targetUser ){
		users.add( addedYotoo.targetUser );
		// delete addedYotoo.targetUser;
	}else{
		// alert( options.index + ", " + (yotoos.length - 1) );
		tempAddedYotoos.add(addedYotoo);
		if( options.index === yotoos.length - 1){
			fetchYotooUsers( tempAddedYotoos );
			tempAddedYotoos.reset();
		}
		addedYotoo.save();
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
	'users': users
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
	var userIds = "";
	newYotoos.map(function(yotoo){
		if( yotoo.get('hided') ){
			return;
		}
		userIds = userIds + "," + yotoo.get('target_id_str');
	});
	userIds = userIds.replace( /^,/g , '');

	/*
	 */ 
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
	/*
	alert(Alloy.Globals.users.at(0).get('screen_name')
	+ users.at(0).get('screen_name'));
	
	Alloy.Globals.users.at(0).save();
	users.at(0).save();
	users.at(0).set('screen_name', 'fuck');
	
	alert(Alloy.Globals.users.at(0).get('screen_name')
	+ users.at(0).get('screen_name'));
	*/
	/*
	yotoos.checkTargetYotoo({
		sourceUser: ownerAccount,
		targetUser: users.at(0),
		success: function(yotoo){
			alert(JSON.stringify(yotoo));
		},
		error: function(e){
			alert(e);
		}
	});
	*/
	/*
	Cloud.Users.login({
	    login: 'uu',
	    password: '1111'
	}, function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        alert('Success:\n' +
	            'id: ' + user.id + '\n' +
	            'sessionId: ' + Cloud.sessionId + '\n' +
	            'first name: ' + user.first_name + '\n' +
	            'last name: ' + user.last_name);
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
	*/
	// if(ownerAccount.currentChatTarget  ){
		// alert( ownerAccount.currentChatTarget );
	// }	
	/*
	var usersA = Alloy.createCollection('user');
	var usersB = Alloy.createCollection('user');
	var uA = Alloy.createModel('user');
	var uB = Alloy.createModel('user');
	
	usersA.on("haha", function(){
		alert("A");
	});
	usersB.on("haha", function(){
		alert("B");
	});
	
	usersB.trigger("haha");
	*/
	// usersA.add( uA );
	// usersB.add( usersA.models );
	// alert(usersA.length + ", " + usersB.length);
	
	// usersB.reset();
	// uA.destroy();
	// alert(usersA.length + ", " + usersB.length);
	
	
	
	
	
	// alert(JSON.stringify(yotoos.at(0).__proto__.config));
	// require('cloudProxy').getCloud().deleteAllYotoos( ownerAccount );
	
	/*
	yotoos.map(function(yotoo){
		yotoo.save({'unyotooed': 0});
		Ti.API.info( yotoo.get('id')	
			+ " " + yotoo.get('platform') + " " + yotoo.get('source_id_str')
			+ " " + yotoo.get('target_id_str') + " " + yotoo.get('unyotooed'));
	});
	*/

/*
	yotoos.fetchFromServer({ 
		'mainAgent': ownerAccount,
		'success': function(){
			// save fetched yotoos in 'add' event listener
			Ti.API.info("[peopleView.js]");
		},
		'error': function(){
			Ti.API.info("[peopleView.js]");
		}
	});
	*/
/*
var Cloud = require('ti.cloud');
Cloud.Users.logout(function (e) {
    if (e.success) {
		Cloud.SocialIntegrations.externalAccountLogin({
			id: ownerAccount.get('id_str'),
		    type: "twitter",
		    token: "dfas"
		}, function (e) {
			// Ti.API.info( JSON.stringify(e) );
			Ti.API.info( Cloud.sessionId );
		    if (e.success) {
				alert("ss");
		    } else {	// ACS login error
		    	alert("f");
		    }
		});
    } else {
    }
});
*/
});






