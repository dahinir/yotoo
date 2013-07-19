var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();


yotoos.on('add', function(addedYotoo){
	if( !addedYotoo.targetUser ){
		alert("[peopleView.js] addedYotoo undefined?");
		setUsersBy( Alloy.createCollection('yotoo', [addedYotoo]) );
	}else{
		alert('[peopleView.js] yotoo add event' + addedYotoo.get('acs_id'));
		userListView.setUsers( addedYotoo.targetUser );
	}
	Ti.API.info("[peopleView.js] yotoo add event");
});
yotoos.on('addMultiple', function(e){
	// alert(JSON.stringify(e));
	setUsersBy( Alloy.createCollection('yotoo', e) );
});
yotoos.on('change:hided change:completed change:unyotooed change:past', function(e){
	alert('[peopleView.js] yotoo changed');
	Ti.API.info("[peopleView.js] change yotoo status");
});
yotoos.on('remove', function(e){
	alert(JSON.stringify(e));	
	userListView.deleteUser();
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
				Ti.API.info(JSON.stringify(e));
				yotoos.where({'target_id_str':  e.itemId}).pop().destroy();
				// yotoos.where({'target_id_str':  e.itemId}).pop().unYotoo();
			}
		}
	}
});
$.peopleView.add( userListView.getView() );

var setUsersBy = function( newYotoos ) {
	var userIds = "";
	newYotoos.map(function(yotoo){
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
		'onSuccess': function(){
			userListView.setUsers( users );
		},
		'onFailure': function(){
			Ti.API.info("[peopleView.js] fail to fetch users");
		}
	});
};
setUsersBy(yotoos);


// should be 'pull to refresh' 
var testButton = Ti.UI.createButton();
$.peopleView.add( testButton);
testButton.addEventListener('click', function(){
	// yo.cloudApi_ = 2;
	// alert(JSON.stringify(yotoos.at(0).__proto__.config));
	
	
	// yotoos.at(0).unYotoo(ownerAccount);
	yotoos.fetchFromServer( ownerAccount );
	
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



 