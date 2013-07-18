var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();


// var firstYotoo = yotoos.at(0);
// firstYotoo.set({'hided': 1});
// firstYotoo.save();
// Ti.API.info("delllllll:" +firstYotoo.get('acs_id'));
// firstYotoo.destroy();

// ownerAccount.getYotoos();
// ownerAccount.getYotoos();
// Ti.API.info(yotoos.length);
yotoos.on('add', function(addedYotoo){
	if( !addedYotoo.targetUser ){
		/*
		 * 의미있는 user는 저장되어 있으므로 로컬에서 한번 검색해 보고  
		 * targetUser를 트위터에서 가져와야 한다.
		 */ 
		// alert("addedYotoo undefined?");
	}else{
		alert('[peopleView.js] yotoo add event' + addedYotoo.get('acs_id'));
		userListView.setUsers( addedYotoo.targetUser );
	}
	Ti.API.info("[peopleView.js] yotoo add event");
});
yotoos.on('change:hided change:completed change:unyotooed change:past', function(e){
	alert('[peopleView.js] yotoo changed');
	Ti.API.info("[peopleView.js] change yotoo status");
});

var userListView = Alloy.createController('userListView', {
	'rightActionButton': {
		type: 'Ti.UI.Button',
		bindId: 'hehe',
		properties: {
			width: 80,
			height: 30,
			right: 10,
			title: 'kia'
		},
		events: {
			'click': function(e){
				// alert("unyotoo");
				alert("delete yotoo");
				alert(JSON.stringify(e));
				// e.itemId
			}
		}
	}
});
$.peopleView.add( userListView.getView() );

var userIds = "";
yotoos.map(function(yotoo){
	userIds = userIds + "," + yotoo.get('target_id_str');
});
userIds = userIds.replace( /^,/g , '');
	// alert("before: " + userIds);

users.fetchFromServer({
	'purpose': 'lookupUsers',
	'params': { 'user_id': userIds },
	'onSuccess': function(){
		userListView.setUsers( users );
	},
	'onFailure': function(){
		Ti.API.info("[peopleView.js] fail to fetch users");
	}
});


var testButton = Ti.UI.createButton();
$.peopleView.add( testButton);
testButton.addEventListener('click', function(){
	var us = "";
	yotoos.map(function(yotoo){
		us = us + "," + yotoo.get('target_id_str');
	});
	// alert("before: " + us);
	
	yotoos.fetchFromServer( ownerAccount );
	
	us = "";
	yotoos.map(function(yotoo){
		us = us + "," + yotoo.get('target_id_str');
	});
	// alert("after: " + us);
	
});
// var localYotoos = Alloy.createCollection('yotoo');
// var globalYotoos = Alloy.Globals.yotoos;
// 
// localYotoos.on('add', function(e){
	// alert("local add event fire!!");
	// Ti.API.info("[peopleView.js] yotoo added");
// });
// 
// globalYotoos.on('add', function(e){
	// alert("global add event fire!!");
	// Ti.API.info("[peopleView.js] yotoo added");
// });
// 
// 
// 
// // localYotoos.add( Alloy.createModel('yotoo'));
// localYotoos.testAdd();



 