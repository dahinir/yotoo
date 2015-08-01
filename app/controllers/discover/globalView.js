var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

var yotoos = ownerCustomer.get("yotoos");
var users = ownerCustomer.createCollection("user");

// var userListView = Alloy.createController("userListView", {
// 	"ownerCustomer": ownerCustomer,
// 	"users": users
// });
// userListView.getView().setTop( $.searchBar.getHeight() );
// $.globalView.add( userListView.getView() );
$.userListView.set({
	"ownerCustomer": ownerCustomer,
	"users": users
});
$.userListView.getView().addEventListener("scrollstart", function(){
	$.searchBar.blur();
});

/*
userListView.getView().addEventListener('rightButtonClick', function(e){
	var id_str = e.id_str;
	var dialogOptions = {
	  'title': 'hello?',
	  'options': [L('unyotoo'), L('yotoo'), L('cancel')],
	  'cancel': 2,
	  'selectedIndex': 1,
	  'destructive': 0
	};
	var optionDialog = Ti.UI.createOptionDialog(dialogOptions);
	optionDialog.show();
	optionDialog.addEventListener('click', function(e){
		if( e.index === 0){
			alert(L('unyotoo_effect'));
			var yt = yotoos.where({'target_id_str':  id_str}).pop();
			yt.unyotoo({
				'mainAgent': ownerCustomer,
				'success': function(){
				},
				'error': function(){
				}
			});
		}else if( e.index === 1 ){
			alert(L('yotoo_effect'));

			var targetUser = users.where({
				'id_str' : id_str
			}).pop();

			yotoos.addNewYotoo({
				'sourceUser' : ownerCustomer,
				'targetUser' : targetUser,
				'success' : function() {
				},
				'error' : function() {
				}
			});
		}
	});
});

userListView.getView().setTop( $.searchBar.getHeight() );
$.globalView.add( userListView.getView() );

var lastSearchQuery;
function fetchUsers(query){
	if(lastSearchQuery === query){
		return;
	}else{
		lastSearchQuery = query;
	}
	users.fetchFromServer({
		'purpose': 'searchUsers',
		'params': {
			'count': 20, // maxium 20
			'q': query
		},
		'reset': true,
		'success': function(){
			Ti.API.debug("[globalView.js] success");
		},
		'error': function(){
			Ti.API.debug("[globalView.js] error");
		}
	});
}


*/



Ti.App.addEventListener('app:buttonClick', function(){
	$.searchBar.blur();
});

// $.dummyScreen.addEventListener('touchstart', function(){
// 	$.searchBar.blur();
// });


/* SearchBar */
$.searchBar.setHintText( L('search_twitter_users') );
$.searchBar.addEventListener('return', function(e){
	$.searchBar.blur();
/* e.value와 정확히 일치하는 유저를 보여주는 특별한 row (실제론 평범한 view겠지?)  하나 추가 */
	fetchUsers( e.value );
});
$.searchBar.addEventListener('cancel', function(){
	$.searchBar.blur();
});
$.searchBar.addEventListener('focus', function(){
	// $.dummyScreen.show();
});
$.searchBar.addEventListener('blur', function(){
	// $.dummyScreen.hide();
});
var timerId;
$.searchBar.addEventListener('change', function(e){
	if( timerId ){
		clearTimeout( timerId );
	}
	timerId = setTimeout(function(){
		fetchUsers( e.value );
	}, 700);
});

$.searchBar.focus();
