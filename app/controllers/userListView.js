// var args = arguments[0] || {};
var customer,
		users,
		yotoos;

/**
* customer, users
*/
exports.init = function(options) {
	Ti.API.info("[userListView.js] .init()");
	options = options || {};

	if(users){
		Ti.API.error("[userListView.js] only call .init() once")
		return;
	}
	if(!options.customer || !options.users){
		Ti.API.error("[userListView.init] customer and users are needed.");
	}

	users = options.users;
	customer = options.customer;
	yotoos = options.customer.yotoos;

	if(users.length){
		var listDataItems = users.map(function(mo){
			return _settingData(mo);
		});
		section.setItems(listDataItems, {'animated': false});
	}

	// users events
	users.on('remove', function(deletedUser){
		Ti.API.info("[userListView.js] users remove event ");
		var index = _getIndexByItemId( deletedUser.get('id_str') );
		section.deleteItemsAt( index, 1 );
	});
	users.on('reset', function(collection, options){
		Ti.API.info("[userListView.js] users reset event");
		var listDataItems = [];
		collection.each(function(mo){
			listDataItems.push(_settingData(mo));
		})
		section.setItems(listDataItems, {'animated': false});
	});
	users.on("change:profile_image_url_https change:name change:screen_name change:friends_count change:followers_count", function(changedUser){
			Ti.API.info("[userListView.js] users change event. ");
			var index = _getIndexByItemId(changedUser.get('id_str'));
			var listDataItem = _settingData( changedUser );
			section.updateItemAt(index, listDataItem, {'animated': true});
	});
	users.on('add', function(addedUser, collection, options){
		Ti.API.info("[userListView.js] users add event ");
		addRows({
			'addedUsers': addedUser,
			'reset': false
		});
	});

	// yotoos events
	yotoos.on('change:unyotooed change:completed', function(yotoo){
		var changedUser = users.where({'id_str': yotoo.get('target_id_str')}).pop();
		if( !changedUser ){
			return;
		}
		var index = _getIndexByItemId(changedUser.get('id_str'));
		var data = section.getItemAt(index);

		if( yotoo.get('completed') ){
			data.template = 'completed';
		}else if( yotoo.get('unyotooed') ){
			data.template = 'unyotooed';
		}else{
			data.template = 'plain';
		}
		section.updateItemAt(index, data, {'animated': true});
	});
};


// var _PLAIN = 1;
// var _SELF = 2;
// var _UNYOTOOED = 3;
// var _COMPLETED = 4;
// var _HIDED = 5;
// var _BURNED = 6;
/*
var getTemplate = function(type){
	var plainTemplates = [{
		type: 'Ti.UI.View',
		bindId: 'relationshipIndicator',
		properties: {
			visible: false,
			top: 0,
			left: 0,
			height: 10,
			widht: 100,
			backgroundColor: "#000",
			opacity: 0.5
		}
		,childTemplates : [{
			type: 'Ti.UI.View',
			bindId: 'ttfased',
			properties:{
				top:0,
				left:0,
				width:10,
				backgroundColor: "#222"
			},
			events: {
				click: function(){
					$.userListView.fireEvent('wow');
				}
			}
		}]
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'profileImage',
		properties : {
			defaultImage : 'images/defaultImageView.png',
			borderWidth : 0.5,
			borderRadius : 3,
			borderColor : '#030303',
			height : 48, // 73/2 is 36.5 but it's too small
			width : 48,
			top : 10,
			left : 10
		},
		events : {
			click: openUserView
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'verifiedAccountIcon',
		properties : {
			visible : false,
			image : 'images/twitter_verifiedAccountIcon.png',
			height : 11.5,
			width : 11.5,
			top : 5,
			left : 5
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'name',
		properties : {
			color : '#070707',
			font : {
				fontFamily : 'Arial',
				fontSize : 16,
				fontWeight : 'bold'
			},
			top : 6,
			left : 67
		},
		events: {
			// postlayout: function(e){ alert(e.source.rect.width);}
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'screenName', // @id
		properties : {
			color : '#445044',
			font : {
				// fontFamily: 'monospace',
				fontSize : 14,
				fontWeight : 'normal'
			},
			top : 19,
			left : 72
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'following',
		properties : {
			color : '#333',
			font : {
				fontSize : 12
			},
			top : 37,
			left : 67
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'followers',
		properties : {
			color : '#333',
			font : {
				fontSize : 12
			},
			top : 48,
			left : 67
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'description_', // 'description' is keyword
		properties : {
			color : '#444',
			font : {
				fontFamily : 'Arial',
				fontSize : 12,
				fontStyle : 'italic', // only iOS
				fontWeight : 'normal'
			},
			verticalAlign : Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
			borderWidth : 1,
			borderColor : '#DDD',
			width : 210,
			height : Ti.UI.SIZE,
			top : 34,
			left : 55
		}
	}, {
		type : 'Ti.UI.Button',
		bindId : 'rightActionButton',
		properties : {
			width : 90,
			height : 30,
			right : 10,
			zIndex: 10,
			title: 'action'
		},
		events : {
			click : rightButtonAction
		}
	}];

	var listItemProps = {
		// accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
		// backgroundColor: '#0F0',
		height : 80,
		selectionStyle : Ti.UI.iPhone.ListViewCellSelectionStyle.NONE	// only iOS
	};
	var rightActionButtonIndex = 8;

	// if (rightActionButton) {
		// plainTemplates[rightActionButttonIndex] = rightActionButton;
	// }
	plainTemplates[rightActionButtonIndex].properties.zIndex = 10;

	if( type === 'self'){
		delete plainTemplates[rightActionButtonIndex];
	}else if( type === 'unyotooed'){
		 plainTemplates.push({
			type: 'Ti.UI.View',
			bindId: 'blackoutScreen',
			properties: {
				zIndex: 1,
				visible: true,
				top: 0,
				left: 0,
				backgroundColor: "#000",
				opacity: 0.5
			}
		});
	}else if( type === 'completed'){
		listItemProps.backgroundColor = '#AFA';
		// plainTemplates[rightActionButtonIndex].properties.width = 80;
		// plainTemplates[rightActionButtonIndex].properties.borderWidth = 1;
		// plainTemplates[rightActionButtonIndex].properties.borderRadius = 2;
		// plainTemplates[rightActionButtonIndex].properties.borderColor = '#0F0';
		// plainTemplates[rightActionButtonIndex].properties.title = 'completed';
	}

	return {
		'childTemplates': plainTemplates,
		'events': {
			'swipe': function(e){
				alert( JSON.stringify(e) + e.itemIndex + ": " + e.itemId );
			}
		},
		'properties' : listItemProps
	};
};
function rightButtonAction(e) {
	$.userListView.fireEvent('rightButtonClick', {
		'id_str': e.itemId
	});
}
function openUserView(e) {
	alert("openUserView");
	// Ti.API.info(e.source.rect.x + ", " + e.source.rect.y);
	// Ti.API.info("dpi: " + Titanium.Platform.displayCaps.dpi);
}

var listView = Ti.UI.createListView({
	'templates' : {
		'plain' : getTemplate(),
		'self': getTemplate('self'),
		'unyotooed': getTemplate('unyotooed'),
		'completed': getTemplate('completed')
	},
	'defaultItemTemplate' : 'plain'
});
$.userListView.add(listView);

// listView.setTop( $.searchBar.getHeight() );
// $.userListView.addEventListener('swipe', function(e){
	// alert(e);
// });
var section = Ti.UI.createListSection();
*/


var section = $.section;
var listView = $.userListView;
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

	// alert(user.get('id_str') +", "+ yotoos.where({'target_id_str': user.get('id_str')}).pop().get('completed') );

	// template select
	var itsYotoo = yotoos.where({'target_id_str': user.get('id_str')}).pop();
	if( user.get('id_str') === customer.get('id_str')){
		data.template = 'self';
	}else if( itsYotoo && itsYotoo.get('completed') ){
		data.template = 'completed';
	// }else if( user.get('unyotooed') ){
	}else if( itsYotoo && itsYotoo.get('unyotooed') ){
		data.template = 'unyotooed';
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
		// listView.deleteSectionAt(0);
		section.setItems(dataArray, {'animated': true});
	}else{
		section.appendItems(dataArray, {'animated': true});
	}

	if (listView.getSectionCount() === 0) {
		listView.setSections([section]);
	} else {
		listView.replaceSectionAt(0, section, {'animated': true});
		//, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
	}
	listView.scrollToItem(0, 0);
};

var _getIndexByItemId = function(itemId){
	var index;
	var listDataItems = section.getItems();
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
	Ti.API.info("[userListView.onRightButtonClick] "+e.itemId + e.bubbles);
	e.userId = e.itemId;
	$.userListView.fireEvent("rightButtonClick", e);
};
// $.trigger('rightButtonClick');

// listView.addEventListener('itemclick', function(e){
// });
