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
yotoos.on('add', function(e){
	alert('yotoo added');
	Ti.API.info("[peopleView.js] yotoo added");
});
yotoos.on('change:hided change:completed change:unyotooed change:past', function(e){
	alert('yotoo changed');
	Ti.API.info("[peopleView.js] change yotoo status");
});

var userListView = Alloy.createController('userListView');
$.peopleView.add( userListView.getView() );

var userIds = "";
yotoos.map(function(yotoo){
	userIds = userIds + "," + yotoo.get('target_id_str');
});
userIds = userIds.replace( /^,/g , '');

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



 