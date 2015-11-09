// var args = arguments[0] || {};
var customer,	users, yos;

/**
* customer, users
*/
exports.init = function(options) {
	Ti.API.debug("[userListView.js] .init() ");
	options = options || {};

	if(users){
		Ti.API.error("[userListView.js] only call .init() once ")
		return;
	}
	if(!options.customer || !options.users){
		Ti.API.error("[userListView.init] customer and users are needed.");
	}

	users = options.users;
	customer = options.customer;
	yos = options.customer.yos;

	if(users && users.length){
		var listDataItems = users.map(function(mo){
			return _settingData(mo);
		});
		$.section.setItems(listDataItems, {'animated': false});
	}

	// users events
	users.on('remove', function(deletedUser){
		Ti.API.debug("[userListView.js] users remove event ");
		var index = _getIndexByItemId( deletedUser.get('id_str') );
		$.section.deleteItemsAt( index, 1 );
	});
	users.on('reset', function(collection, options){
		Ti.API.debug("[userListView.js] users reset event");
		var listDataItems = [];
		collection.each(function(mo){
			listDataItems.push(_settingData(mo));
		})
		$.section.setItems(listDataItems, {'animated': false});
	});
	users.on("change:profile_image_url_https change:name change:screen_name change:friends_count change:followers_count", function(changedUser){
			Ti.API.debug("[userListView.js] users change event. ");
			var index = _getIndexByItemId(changedUser.get('id_str'));
			var listDataItem = _settingData( changedUser );
			$.section.updateItemAt(index, listDataItem, {'animated': true});
	});
	users.on('add', function(addedUser, collection, options){
		Ti.API.debug("[userListView.js] users add event ");
		addRows({
			'addedUsers': addedUser,
			'reset': false
		});
	});

	// yos events
	yos.on('change:unyo change:complete', function(yo){
		Ti.API.debug("[userListView.js] yo change event. "+ yo.get("unyo"));

		var changedUser = users.get(yo.get("receiverId"));
		if( !changedUser ){
			return;
		}

		var index = _getIndexByItemId(changedUser.id);
		var data = $.section.getItemAt(index);

		if( yo.get('complete') ){
			data.template = 'complete';
		}else if( yo.get('unyo') ){
			data.template = 'unyo';
		}else{
			data.template = 'plain';
		}
		$.section.updateItemAt(index, data, {'animated': true});
	});
};

function _settingData(user) {
	data = {
		profileImage : {
			image : user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.')
		},
		name : {
			text : user.get('name')
		},
		screenName : {
			text : "@" + user.get('screen_name')
		},
		following : {
			text : "Following: " + String.formatDecimal(user.get('friends_count'))
		},
		followers : {
			text : "Followers: " + String.formatDecimal(user.get('followers_count'))
		},
		// description_: { text: user.get('description') },

		// properties are defined ListItem
		properties : {
			itemId : user.id
		}
	};
	if (user.get('verified')) {
		data.verifiedAccountIcon = {
			visible : true
		};
	}

	// alert(user.get('id_str') +", "+ yos.where({'target_id_str': user.get('id_str')}).pop().get('completed') );

	// template select
	var itsYo = yos.where({
		"receiverId": user.id,
		"provider": customer.get("provider")
	}).pop();
	if(user.id == customer.get("provider_id")){
		data.template = "self";
	}else if( itsYo && itsYo.get("completed") ){
		data.template = "completed";
	// }else if( user.get('unyo') ){
	}else if( itsYo && itsYo.get("unyo") ){
		data.template = "unyo";
	}

	if (OS_ANDROID) {
		data.description_ = {
			text : user.get('description')
		};
		data.properties.height = Ti.UI.SIZE;
		// not support on iOS
	}
	return data;
};

var addRows = function(options){
	var addedUsers = options.addedUsers;
	var reset = options.reset;
	var dataArray = [];

	if( addedUsers.map ){
		for(var i = 0; i < addedUsers.length; i++){
			dataArray.push( _settingData( addedUsers.at(i) ) );
		}
	}else{
		dataArray.push( _settingData( addedUsers ) );
	}

	if( reset ){
		// $.userListView.deleteSectionAt(0);
		$.section.setItems(dataArray, {'animated': true});
	}else{
		$.section.appendItems(dataArray, {'animated': true});
	}

	if ($.userListView.getSectionCount() === 0) {
		$.userListView.setSections([$.section]);
	} else {
		$.userListView.replaceSectionAt(0, $.section, {'animated': true});
		//, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
	}
	$.userListView.scrollToItem(0, 0);
};

var _getIndexByItemId = function(itemId){
	var index;
	var listDataItems = $.section.getItems();
	for ( index = 0; index < listDataItems.length; index++) {
		if (listDataItems[index].properties.itemId === itemId) {
			break;
		}
	}
	if( index === listDataItems.length){
		Ti.API.error("[userListView.js] there is no matched itemId");
	}
	return index;
};

function onRightButtonClick(e){
	Ti.API.debug("[userListView.onRightButtonClick] "+e.itemId + e.bubbles);
	e.userId = e.itemId;
	$.userListView.fireEvent("rightButtonClick", e);
};
// $.trigger('rightButtonClick');

$.userListView.addEventListener("itemclick", function(e){
	Ti.API.debug("[userListView]  itemclick event fired.");
	Ti.API.debug(e);
	AG.uus = users;

	// var userWindow = Titanium.UI.createWindow({title: "Hello",backgroundColor:"yellow"});
	var userController = Alloy.createController("userWindow");
	userController.init({
		customer: customer,
		user: users.get(e.itemId)
	});
	customer.mainTabGroup.activeTab.open(userController.getView());
});
