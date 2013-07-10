var args = arguments[0] || {};

var rightActionButton = args.rightActionButton;
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = args.users;
// || ownerAccount.createCollection('user');

var userRowTemplate = {
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'profileImage',
		properties : {
			defaultImage : 'images/defaultImageView.png',
			borderWidth : 0.5,
			borderRadius : 3,
			borderColor : '#030303',
			height : 36.5, // 73/2
			width : 36.5,
			top : 10,
			left : 10
		},
		events : {
			click : function(e) {
				Ti.API.info(e.source.rect.x + ", " + e.source.rect.y);
				Ti.API.info("dpi: " + Titanium.Platform.displayCaps.dpi);
			}
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
			left : 55
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
			left : 60
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
			left : 55
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
			left : 55
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
	}],
	events : {},
	properties : {
		// accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
		// backgroundColor: '#FFF',
		height : 80,
		selectionStyle : Ti.UI.iPhone.ListViewCellSelectionStyle.NONE	// only iOS
	}
};
function defaultAction(e) {
	alert("defaultAction " + e.itemId);
};

if (rightActionButton) {
	userRowTemplate.childTemplates[7] = rightActionButton;
}
var listView = Ti.UI.createListView({
	templates : {
		'plain' : userRowTemplate
	},
	defaultItemTemplate : 'plain'
});
var data = [];

// listView.setTop( $.searchBar.getHeight() );
$.userListView.add(listView);

exports.setUsers = function(newUsers) {
	var section = Ti.UI.createListSection();

	newUsers.map(function(user) {
		var data = {
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

		section.appendItems([data]);
	});

	if (listView.getSectionCount() === 0) {
		listView.setSections([section]);
	} else {
		listView.replaceSectionAt(0, section);
		//, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
	}
	listView.scrollToItem(0, 0);
};

