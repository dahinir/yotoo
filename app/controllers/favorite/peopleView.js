var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();

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
yotoos.on('change:unyotooed', function(yotoo){
	var changedUser = users.where({'id_str': yotoo.get('target_id_str')}).pop();
	/* case of unyotoo */
	if( yotoo.get('unyotooed') ){
		// users.remove( unYotooedUser );
		users.trigger('disabled', changedUser);
	/* case of reyotoo */
	}else{
		users.trigger('enabled', changedUser);
		// users.add( yotoo.targetUser );
	}
});
yotoos.on('change:hided change:completed change:past', function(e){
	alert('[peopleView.js] yotoo changed');
	Ti.API.info("[peopleView.js] change yotoo status");
});


var userListView = Alloy.createController('userListView', {
	'users': users,
	'rightActionButton': {
		type: 'Ti.UI.Button',
		bindId: 'hehe',
		properties: {
			width: 80,
			height: 30,
			right: 10,
			zIndex: 10,
			title: 'kia'
		},
		events: {
			'click': function(e){
				alert("unyotoo");
				var yt = yotoos.where({'target_id_str':  e.itemId}).pop();
				// alert(".." + yt.get('unyotooed'));
				yt.unYotoo(ownerAccount);
				// alert(yt.get('unyotooed'));
				// Ti.API.info(JSON.stringify(e));
				// yotoos.where({'target_id_str':  e.itemId}).pop().destroy();
			}
		}
	}
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
	var unYotooedUsers = Alloy.createCollection('user');
	var userIds = "";
	newYotoos.map(function(yotoo){
		if( yotoo.get('unyotooed') ){
			var unYotooedUser = users.where({'id_str': yotoo.get('target_id_str')}).pop();
			unYotooedUsers.add( unYotooedUser );
		}
		userIds = userIds + "," + yotoo.get('target_id_str');
	});
	
	userIds = userIds.replace( /^,/g , '');

	/*
	 * 의미있는 user는 저장되어 있으므로 로컬에서 한번 검색해 보고  
	 * targetUser를 트위터에서 가져와야 한다.
	 */ 
	users.fetchFromServer({
		'purpose': 'lookupUsers',
		'params': { 'user_id': userIds },
		'success': function(){
			unYotooedUsers.map(function(user){
				// users.trigger('disabled', user);
			});
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
	// alert(JSON.stringify(yotoos.at(0).__proto__.config));
	// require('cloudProxy').getCloud().deleteAllYotoos( ownerAccount );
	
	yotoos.map(function(yotoo){
		yotoo.save({'unyotooed': 0});
		Ti.API.info( yotoo.get('id')	
			+ " " + yotoo.get('platform') + " " + yotoo.get('source_id_str')
			+ " " + yotoo.get('target_id_str') + " " + yotoo.get('unyotooed'));
	});
			
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
});



 