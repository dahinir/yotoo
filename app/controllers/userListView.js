var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = args.users;
var rightActionButton = args.rightActionButton;
var getRightActionButtonProps = args.getRightActionButtonProps;

var getTemplate = function(type){
	var childTemplates = [{
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
			click : defaultAction
		}
	}];
	
	var rightActionButttonIndex = 8;
	
	if (rightActionButton) {
		childTemplates[rightActionButttonIndex] = rightActionButton;
	}
	childTemplates[rightActionButttonIndex].properties.zIndex = 10;

	if( type === 'self'){
		delete childTemplates[rightActionButttonIndex];
	}else if( type === 'disabled'){
		 childTemplates.push({
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
	}
	
	return {
		childTemplates: childTemplates,
		events: {
			'swipe': function(e){
				alert( JSON.stringify(e) + e.itemIndex + ": " + e.itemId );
			}
		},
		properties : {
			// accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
			// backgroundColor: '#FFF',
			height : 80,
			selectionStyle : Ti.UI.iPhone.ListViewCellSelectionStyle.NONE	// only iOS
		}
	};
};
function defaultAction(e) {
	alert("defaultAction\nitemId: " + e.itemId+"\nitemIndex:"+ e.itemIndex);
	var user = ownerAccount.createModel('user');
	user.fetchMetaData({
		'purpose': 'relationship',
		'params': {
			'source_id': ownerAccount.get('id_str'),
			'target_id': e.itemId// user.get('id_str')
		},
		'onSuccess': function( results ){
			var data = section.getItemAt( e.itemIndex);
			if( results.relationship.source.followed_by){
				data.relationshipIndicator = {
					visible: true,
					backgroundColor:"#999"
				};
			}
			section.updateItemAt( e.itemIndex, data );
			// alert(results.relationship.source.followed_by);
		},
		'onFailure': function(){
			Ti.API.debug("[userView] fetchFromServer(for relationship) failure");
		}				
	});
}
function openUserView(e) {
	alert("openUserView");
	Ti.API.info(e.source.rect.x + ", " + e.source.rect.y);
	Ti.API.info("dpi: " + Titanium.Platform.displayCaps.dpi);
}

userRowTemplate = getTemplate();
selfUserRowTemplate = getTemplate("self");
disabledUserRowTemplate = getTemplate('disabled');

var listView = Ti.UI.createListView({
	templates : {
		'plain' : userRowTemplate,
		'self': selfUserRowTemplate,
		'disabled': disabledUserRowTemplate
	},
	defaultItemTemplate : 'plain'
});

// listView.setTop( $.searchBar.getHeight() );
$.userListView.add(listView);
// $.userListView.addEventListener('swipe', function(e){
	// alert(e);
// });


var section = Ti.UI.createListSection();

var addRows = function(options){
	var addedUsers = options.addedUsers;
	var reset = options.reset;
	 
	var dataArray = [];
	var settingData = function(user) {
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

			// template: 'plain',
			properties : {
				itemId : user.get('id_str')
			}
		};
		if( user.get('id_str') === ownerAccount.get('id_str')){
			data.template = 'self';
		}else if( user.get('disabled') ){
			data.template = 'disabled';
		}
		
		if (getRightActionButtonProps){
			data.rightActionButton = getRightActionButtonProps(user);
		}

		if (OS_ANDROID) {
			data.description_ = {
				text : user.get('description')
			};
			data.properties.height = Ti.UI.SIZE;
			// not support on iOS
		}
		if (user.get('verified')) {
			data.verifiedAccountIcon = {
				visible : true
			};
		}
		dataArray.push(data);
	};

	if( addedUsers.map ){	// if newUsers is Collection
		addedUsers.map( settingData );
	}else{	// if newusers is Model
		settingData( addedUsers );
	}
	
	if( reset ){
		// listView.deleteSectionAt(0);
		section.setItems(dataArray);
	}else{
		section.appendItems(dataArray);
	}

	if (listView.getSectionCount() === 0) {
		listView.setSections([section]);
	} else {
		listView.replaceSectionAt(0, section);
		//, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
	}
	listView.scrollToItem(0, 0);
};

var getIndexByItemId = function(itemId){
	var index;
	var listDataItems = section.getItems();
	for ( index = 0; index < listDataItems.length; index++) {
		if (listDataItems[index].properties.itemId === itemId) {
			break;
		}
	}
	if( index === listDataItems.length){
		alert("there is no matched itemId");
	}
	return index;
};


/* event listeners */
users.on('remove', function(deletedUser){
	var index = getIndexByItemId( deletedUser.get('id_str') );
	section.deleteItemsAt( index, 1 );
});

users.on('reset', function(){
	section.deleteItemsAt( 0, section.getItems().length);
});

var tempAddedUsers = Alloy.createCollection('user');
users.on('add', function(addedUser, collection, options){
	// alert(addedUser.get('id_str'));
	// alert( options.index + ", " + (users.length - 1) );
	tempAddedUsers.add(addedUser);
	if( options.index === (users.length - 1) ){
		addRows({ 
			'addedUsers': tempAddedUsers,
			'reset': false 
		});
		tempAddedUsers.reset();
	}
});

users.on('disabled', function(disabledUser) {
	var index = getIndexByItemId(disabledUser.get('id_str'));
	var data = section.getItemAt(index);
	
	data.template = 'disabled';
	section.updateItemAt(index, data);
});

users.on('enabled', function(enabledUser){
	var index = getIndexByItemId(enabledUser.get('id_str'));
	var data = section.getItemAt(index);
	
	data.template = 'plain';
	section.updateItemAt(index, data);
});

// users.on('yotooed', function(yotooedUser, collection, options){
	// // alert("y");
	// var index = getIndexByItemId(yotooedUser.get('id_str'));
	// var data = section.getItemAt(index);
// 	
	// data.name.text = "asdfasdfawef";
	// // data.rightActionButton.title = "uiu";
	// // data.rightActionButton = options.rightActionButton;
	// // data.template = 'disabled';
	// section.updateItemAt(index, data);
// });


