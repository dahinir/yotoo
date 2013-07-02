
var ownerAccount = Alloy.Globals.accounts.getCurrentAccount();
// Ti.API.info("[globalView.js] currentAccount\'s screen_name: " + ownerAccount.get('screen_name'));




$.dummyScreen.addEventListener('touchstart', function(){
	$.searchBar.blur();
});


/* SearchBar */
$.searchBar.setHintText( L('search_twitter_users') );
$.searchBar.addEventListener('cancel', function(){
	$.searchBar.blur();
});
$.searchBar.addEventListener('focus', function(){
	$.dummyScreen.show();
});
$.searchBar.addEventListener('blur', function(){
	$.dummyScreen.hide();
});
$.searchBar.addEventListener('return', function(e){
	$.searchBar.blur();
	var users = ownerAccount.createCollection('user');
	users.fetchFromServer({
		'purpose': 'searchUsers',
		'params': {
			'count': 20, // maxium 20
			'q': e.value
		},
		'onSuccess': function(){
			users.map(function(user){
				
				Ti.API.info("[globalView.js] " + user.get('name'));
			});
		},
		'onFailure': function(){
			Ti.API.debug("[globalView.js] fail setTweets()");
		}
	});	
});
