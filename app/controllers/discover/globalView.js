var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
// Ti.API.info("[globalView.js] currentAccount\'s screen_name: " + ownerAccount.get('screen_name'));
var users = ownerAccount.createCollection('user');

var autoComplete = function(){
};



var userListView = Alloy.createController('userListView', {
	'rightActionButton': {
            type: 'Ti.UI.Button',   // Use a button
            bindId: 'yotooButton',       // Bind ID for this button
            properties: {           // Sets several button properties
                width: 80,
                height: 30,                        	
                right: 10,
                title: 'yotoo'
            },
            events: { click : function(e){
				alert( L('yotoo_effect')  + e.itemId);
				
				var targetUser = users.where({'id_str': e.itemId}).pop();
				// Ti.API.info( users.where({'id_str': e.itemId}).pop().get('screen_name') );
				// Ti.API.info( users.findWhere({'id_str': e.itemId}).get('screen_name') );
				
				ownerAccount.yotooTo( targetUser );
            } }
        }
});
userListView.getView().setTop( $.searchBar.getHeight() );
$.globalView.add( userListView.getView() );


$.dummyScreen.addEventListener('touchstart', function(){
	$.searchBar.blur();
});

/* SearchBar */
$.searchBar.setHintText( L('search_twitter_users') );
$.searchBar.addEventListener('return', function(e){
	$.searchBar.blur();

	users.fetchFromServer({
		'purpose': 'searchUsers',
		'params': {
			'count': 20, // maxium 20
			'q': e.value
		},
		'onSuccess': function(){
			userListView.setUsers( users );
		},
		'onFailure': function(){
			Ti.API.debug("[globalView.js] fail setTweets()");
		}
	});
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
$.searchBar.addEventListener('change', function(e){
	// Ti.API.info(e.value);
});

$.searchBar.focus();

