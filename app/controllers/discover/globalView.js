
var ownerAccount = Alloy.Globals.accounts.getCurrentAccount();
// Ti.API.info("[globalView.js] currentAccount\'s screen_name: " + ownerAccount.get('screen_name'));


var autoComplete = function(){
};


var userRowTemplate = {
    childTemplates: [
        {
            type: 'Ti.UI.ImageView',
            bindId: 'profileImage',
            properties: {
            	defaultImage: 'images/defaultImageView.png',
            	borderWidth: 0.5,
            	borderRadius: 3,
            	borderColor: '#030303',
            	height: 36.5,	// 73/2
            	width: 36.5,
            	top: 10,
            	left: 10
            },
            events: {
            	click: function(e){
            		Ti.API.info(e.source.rect.x + ", " +  e.source.rect.y);
            		Ti.API.info("dpi: " + Titanium.Platform.displayCaps.dpi);
            	}
            }
        },               
        {
        	type: 'Ti.UI.ImageView',
        	bindId: 'verifiedAccountIcon',
        	properties: {
        		visible: false,
        		image: 'images/twitter_verifiedAccountIcon.png',
        		height: 11.5,
        		width: 11.5,
        		top: 5,
        		left: 5
        	}
        },  
        {
            type: 'Ti.UI.Label',
            bindId: 'name',
            properties: {
            	color: '#070707',
            	font: {
            		fontFamily:'Arial',
            		fontSize: 16,
            		fontWeight:'bold'
            	},
            	top: 6,
                left: 55
            }
        },
        {
            type: 'Ti.UI.Label',
            bindId: 'screenName',	// @id
            properties: {
            	color: '#445044',
            	font: { 
        			// fontFamily: 'monospace',
            		fontSize: 14, 
            		fontWeight: 'normal'
            	},
            	top: 19,
                left: 60
            }
        },
        {
        	type: 'Ti.UI.Label',
        	bindId: 'following',
        	properties: {
        		color: '#333',
        		font: {
        			fontSize: 12
        		},
        		top: 37,
        		left: 55
        	}
        },
        {
        	type: 'Ti.UI.Label',
        	bindId: 'followers',
        	properties: {
        		color: '#333',
        		font: {
        			fontSize: 12
        		},
        		top: 48,
        		left: 55
        	}
        },
        {
        	type: 'Ti.UI.Label',
        	bindId: 'description_',	// 'description' is keyword
        	properties: {
        		color: '#444',
        		font: {
            		fontFamily: 'Arial',
        			fontSize: 12,
        			fontStyle: 'italic', // only iOS
        			fontWeight: 'normal'
        		},
        		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
        		borderWidth: 1,
        		borderColor: '#DDD',
        		width: 210,
        		height: Ti.UI.SIZE,
        		top: 34,
        		left: 55
        	}
        },
        {
            type: 'Ti.UI.Button',   // Use a button
            bindId: 'yotooButton',       // Bind ID for this button
            properties: {           // Sets several button properties
                width: 80,
                height: 30,                        	
                right: 10,
                title: 'yotoo'
            },
            events: { click : report }  // Binds a callback to the button's click event
        }
    ],
    events: {},
    properties: {
        // accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
        // backgroundColor: '#FFF',
        height: 80,
        selectionStyle: Ti.UI.iPhone.ListViewCellSelectionStyle.NONE	// only iOS
    }
};
function report(e) {
	Ti.API.info(e.type);
}
var listView = Ti.UI.createListView({
    templates: { 'plain': userRowTemplate },
    defaultItemTemplate: 'plain'               
});
var data = [];


listView.setTop( $.searchBar.getHeight() );
$.globalView.add(listView);	


$.dummyScreen.addEventListener('touchstart', function(){
	$.searchBar.blur();
});

/* SearchBar */
$.searchBar.setHintText( L('search_twitter_users') );
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
			var section = Ti.UI.createListSection();
			
			users.map(function(user){
				var data = {
					profileImage: { image: user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.')},
			        name: { text: user.get('name') },
			        screenName: { text: "@" + user.get('screen_name') },
			        following: { text: "Following: " + String.formatDecimal( user.get('friends_count')) },
			        followers: { text: "Followers: " + String.formatDecimal( user.get('followers_count')) },
			        // description_: { text: user.get('description') },

					// template: 'plain',
			        properties: {
			            itemId: user.get('id_str')
			        }
				};
				
				if( OS_ANDROID ){
			        data.description_ = { text: user.get('description') };
					data.properties.height = Ti.UI.SIZE;	// not support on iOS
				}
				if( user.get('verified') ){
					data.verifiedAccountIcon = { visible: true };
				}
				
				section.appendItems([data]);
			});
			
			if( listView.getSectionCount() === 0){
				Ti.API.info("0 " + listView.getSectionCount());
				listView.setSections([section]);
			}else{
				Ti.API.info("1 " + listView.getSectionCount());
				listView.replaceSectionAt(0, section); //, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
			}
			listView.scrollToItem(0, 0);
	        // section.setItems( data);

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

