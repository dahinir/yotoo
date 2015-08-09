var args = arguments[0] || {};
var customer = args.ownerCustomer || AG.customers.getCurrentCustomer();

var yotoos = customer.get("yotoos");
var users = customer.createCollection("user");

$.userList.set({
	"ownerCustomer": customer,
	"users": users
});
$.userList.getView().addEventListener("scrollstart", function(){
	$.searchBar.blur();
});

// AG.yts = yotoos;
$.userList.getView().addEventListener('rightButtonClick', function(e){
	var userId = e.userId;
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
			var yt = yotoos.where({'target_id_str':  userId}).pop();
			yt.unyotoo({
				'mainAgent': customer,
				'success': function(){
				},
				'error': function(){
				}
			});
		}else if( e.index === 1 ){
			alert(L('yotoo_effect'));
			// var receiverUser = users.where({'id_str': userId}).pop();
			yotoos.addNewYotoo({
				senderUser: customer.get("userIdentity"),
				receiverUser: users.get(userId),
				success: function() {
					alert(L("yotoo_save_success"));
				},
				error: function() {
					alert(L("yotoo_save_error"));
				}
			});
		}
	});
});


var lastSearchQuery;
function fetchUsers(query){
	Ti.API.info("fetch");

	if(lastSearchQuery === query){
		return;
	}else{
		lastSearchQuery = query;
	}

	users.search({"query":query});
	return;
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
