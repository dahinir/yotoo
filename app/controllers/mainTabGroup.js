/*
 * mainTabGroup.js
 * -rapodor
 */
var args = arguments[0] || {};
var ownerAccount = args.ownerAccount; // || yotoo.currentAccount;

$.timelineTab.title = L('timeline');
$.mentionsTab.title = L('mentions');
$.profileTab.title = L('profile');

exports.init = function(args){
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
		Ti.API.info("mainTabGroup's owner: " + ownerAccount.get('access_token'));
		$.timelineWindow.init({"ownerAccount" : ownerAccount});
		$.mentionsWindow.init({"ownerAccount" : ownerAccount});
		$.profileWindow.init({"ownerAccount" : ownerAccount});
		
		$.mainTabGroup.setActiveTab( ownerAccount.get('status_active_tab_index') );
	}
};

$.mainTabGroup.addEventListener('focus', function(e){
	// Ti.API.debug("[mainTabGroup] focused, index:" + e.index);
	ownerAccount.set('status_active_tab_index', e.index);
	ownerAccount.save();
});
$.mainTabGroup.addEventListener('postlayout', function(e){
	Ti.API.debug("[mainTabGroup] postlayout");
	// slow down.. animate 알파값 상승 
	// $.mainTabGroup.borderWidth = 0;
});

Alloy.Globals.testVal = 0;
Alloy.Globals.testVal2 = 0;





var tweetTemplate = {
    properties: {
        // These are the same as the list data item properties
        // The list data item properties supersedes these if both are defined
        accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
    },
    events: {
        // Bind event callbacks for bubbled events
        // Events caught here are fired by the subcomponent views of the ListItem
        // click: clickCB
    },
    childTemplates: [
        {
            type: 'Ti.UI.Label', // Use a label
            bindId: 'rowtitle',  // Bind ID for this label
            properties: {        // Sets the Label.left property
                left: '10dp'
            }
        },
        {
            type: 'Ti.UI.ImageView',  // Use an image view
            bindId: 'pic',            // Bind ID for this image view
            properties: {             // Sets the ImageView.image property
            	image: 'KS_nav_ui.png'
            }
        },                    
        {
            type: 'Ti.UI.Button',   // Use a button
            bindId: 'button',       // Bind ID for this button
            properties: {           // Sets several button properties
                width: '80dp',
                height: '30dp',                        	
                right: '10dp',
                title: 'press me'
            },
            events: { click : report }  // Binds a callback to the button's click event
        }
    ]
};

function report(e) {
	Ti.API.info(e.type);
}

var listView = Ti.UI.createListView({
    // Maps the plainTemplate object to the 'plain' style name
    templates: { 'plain': tweetTemplate },
    // Use the plain template, that is, the plainTemplate object defined earlier
    // for all data list items in this list view
    defaultItemTemplate: 'plain'               
});

listView.addEventListener('itemclick', function(e){
    // Only respond to clicks on the label (rowtitle) or image (pic)
    if (e.bindId == 'rowtitle' || e.bindId == 'pic') {
        var item = e.section.getItemAt(e.itemIndex);
        if (item.properties.accessoryType == Ti.UI.LIST_ACCESSORY_TYPE_NONE) {
            item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
        }
        else {
            item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
        }
        e.section.updateItemAt(e.itemIndex, item);
    }      
});

var createDataItem = function( tweet ){
	var dataItem = {
		rowtitle : {
			text : tweet.get('text')
		},
		pic : {
			image : tweet.get('user').profile_image_url_https.replace(/_normal\./g, '_bigger.')
		},
		properties : {
			// itemid :set to identify this item when events are fired by this item.
			itemId : tweet.get('id_str'),
			accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE
		}
	};
	return dataItem;
};

$.testButton.addEventListener("click", function(e){
	var data = [];
	var tweets = ownerAccount.createCollection('tweet');
	tweets.fetchFromServer({
		'purpose': 'timeline',
		'params': { 'count': 100},
		'onSuccess': function(){
			tweets.map(function(tweet){
				data.push( createDataItem(tweet) );
			});
			listView.sections = [ Ti.UI.createListSection({items: data}) ];
			$.testView.add(listView);
		},
		'onFailure': function(){
			Ti.API.debug("[] fail tweet fetch");
		}
	});
});

$.testButton2.addEventListener("click", function(e){
	/*
	// only for IOS?
	Alloy.Globals.accounts.cloud.PushNotifications.subscribe({
	    channel: 'friend_request',
	    type: 'ios',
	    device_token: Ti.Network.getRemoteDeviceUUID()
	}, function (e) {
	    if (e.success) {
	        alert('Success');
	    } else {
	        alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
	*/

	Alloy.Globals.accounts.cloud.PushNotifications.notify({
		channel : 'friend_request',
		// friends : Any,
		to_ids : Alloy.Globals.accounts.getCurrentAccount().get('id_str_ACS'),
		payload : 'Welcome to push notifications'
		// payload: {
		    // "atras": "your_user_id",
		    // "tags": [
		        // "tag1",
		        // "tag2"
		    // ],
		    // "badge": 2,
		    // "sound": "default",
		    // "alert" : "Push Notification Test"
		// }
	}, function(e) {
		if (e.success) {
			alert('Success');
		} else {
			alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		}
	}); 
});

// var Cloud = require('ti.cloud');
var Cloud = Alloy.Globals.accounts.cloud;
var Cloud1 = Object.create(Cloud);
var Cloud2 = Object.create(Cloud);

// Cloud.sessionId = Ti.App.Properties.getString('cloudSessionId');
// Ti.API.info("cloud.sessionId: "+ Ti.App.Properties.getString('cloudSessionId') );
Ti.API.info("01:"+Cloud1.sessionId+", 02:"+Cloud2.sessionId);


