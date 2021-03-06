var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
// Ti.API.info("[globalView.js] currentAccount\'s screen_name: " + ownerAccount.get('screen_name'));
var users = ownerAccount.createCollection('user');
var yotoos = ownerAccount.getYotoos();

var autoComplete = function(){
};

var userListView = Alloy.createController('userListView',{
	'users': users
});
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
				'mainAgent': ownerAccount,
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
				'sourceUser' : ownerAccount,
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

$.dummyScreen.addEventListener('touchstart', function(){
	$.searchBar.blur();
});
Ti.App.addEventListener('app:buttonClick', function(){
	$.searchBar.blur();
});

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
	$.dummyScreen.show();
});
$.searchBar.addEventListener('blur', function(){
	$.dummyScreen.hide();
});
var typeDelayTimerId;
$.searchBar.addEventListener('change', function(e){
	if( typeDelayTimerId ){
		clearTimeout( typeDelayTimerId );
	}
	typeDelayTimerId = setTimeout(function(){
		fetchUsers( e.value );
	}, 1000);
});

$.searchBar.focus();

