var args = arguments[0] || {};

var rightActionButton = args.rightActionButton;
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = args.users;
// || ownerAccount.createCollection('user');

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
		bindId : 'defaultActionButton',
		properties : {
			width : 80,
			height : 30,
			right : 10,
			title : 'action'
		},
		events : {
			click : defaultAction
		}
	}];
	
	if( type === 'self'){
		delete childTemplates[8];
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
userSelfRowTemplate = getTemplate("self");


if (rightActionButton) {
	userRowTemplate.childTemplates[8] = rightActionButton;
}
var listView = Ti.UI.createListView({
	templates : {
		'plain' : userRowTemplate,
		'userSelf': userSelfRowTemplate
	},
	defaultItemTemplate : 'plain'
});

// listView.setTop( $.searchBar.getHeight() );
$.userListView.add(listView);
// $.userListView.addEventListener('swipe', function(e){
	// alert(e);
// });

var section = Ti.UI.createListSection();

exports.setUsers = function(newUsers, withClear) {

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
			data.template = 'userSelf';
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

	if( newUsers.map ){	// if newUsers is Collection
		newUsers.map( settingData );
	}else{	// if newusers is Model
		settingData( newUsers );
	}
	
	if( withClear ){
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


exports.deleteUser = function( deletedUser ) {
	alert('deleted: '+ deletedUser.get('screen_name'));
	// 여기 구현 할 차례 
}


