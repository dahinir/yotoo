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
	Ti.API.info("mainTabGroup focused, index:" + e.index);
	ownerAccount.set('status_active_tab_index', e.index);
	ownerAccount.save();
});
// var timelineTab = Ti.UI.createTab();
// timelineTab.add(Alloy.createController('timelineWindow',{
	// "ownerAccount": ownerAccount
// }).getView());
// $.mainTabGroup.addTab(timelineTab);



// $.timelineWindow.getView('timelineWindow').addEventListener('click', function(e){
	// Ti.API.info("click babe");
// });


Alloy.Globals.testVal = 0;
Alloy.Globals.testVal2 = 0;




// create an array of anonymous objects
var tbl_data = [
    {title:'Row 0'},
    {title:'Row 1'},
    {title:'Row 2'},
    {title:'Row 3'},
    {title:'Row 4'},
    {title:'Row 5'}
];
var tbl_data2 = [
    {title:'2Row 0'},
    {title:'2Row 1'},
    {title:'2Row 2'},
    {title:'2Row 3'},
    {title:'2Row 4'},
    {title:'2Row 5'}
];
// now assign that array to the table's data property to add those objects as rows
var table = Ti.UI.createTableView({
    data:tbl_data
});
// var tweets = Alloy.createCollection('tweet');
// tweets.add(tbl_data);
// alternatively, you could do
table.setData(tbl_data);
// table.setData(tweets);
$.testView.add(table);

var tableRows = [];

function createTableSection(){
	var tableSection  = Ti.UI.createTableViewSection({headerTitle : "dd"}); 
	for (var i = 0; i < 10; i++) {
		var tableRow = Ti.UI.createTableViewRow({
			title : "added "+ i,
			height : 15,
			layout : "horizontal"
		});
		tableRow.addEventListener("click", function(e){
			// for(key in e){
				// Ti.API.info("key:"+ key);
			// }
			// Ti.API.info("index: " + e.index);
			// table.deleteRow(e.index);

		});
		// tableRow.addEventListener("click", function(e){
			// Ti.API.info("index:"+ e.index);
		// });
		tableSection.add( tableRow  );
	}
	return tableSection;
}
table.anchorPoint = {x:1, y:1};
var a = {
	animated : true,
	animationStyle : Ti.UI.iPhone.RowAnimationStyle.LEFT
	// position : Ti.UI.iPhone.TableViewScrollPosition.MIDDLE
};
var b = {
	// animated : true,
	animationStyle : Ti.UI.iPhone.RowAnimationStyle.NONE
	// position : Ti.UI.iPhone.TableViewScrollPosition.MIDDLE
};
var c = {
	animated : true,
	// animationStyle : Ti.UI.iPhone.RowAnimationStyle.NONE
	position : Ti.UI.iPhone.TableViewScrollPosition.TOP
};

var flag = 0;
$.testButton.addEventListener("click", function(e){
	/*
	Ti.API.info("testButton clicked(s) "+ tbl_data.length);
	// 여기서 테이블로 추가될때 에니메이션 되는 것을 테스트 하자. 아래쪽 데이터가 정지된 상태여야 하는데
	// table.insertRowBefore(10, {title:"added Row"+flag}, a);
	
	// tbl_data.push({title:'wow'});
	for(var i=0; i < 100; i++){
		tbl_data.push({title:"added Row " + i});
	}
	table.setData(tbl_data);
	flag++;
	Ti.API.info("testButton clicked(e) "+ tbl_data.length);
	*/
	
	// Ti.API.info(Titanium.Platform.id);
	// Cloud.PushNotifications.subscribe({
	    // channel: 'test_request',
	    // type: 'ios',
	    // device_token: Titanium.Platform.id
	// }, function (e) {
	    // if (e.success) {
	        // alert('Success');
	    // } else {
	        // alert('Error:\\n' +
	            // ((e.error && e.message) || JSON.stringify(e)));
	    // }
	// });
	
	// // register for push notifications
	// Titanium.Network.registerForPushNotifications({
	    // types: [
	        // Titanium.Network.NOTIFICATION_TYPE_BADGE,
	        // Titanium.Network.NOTIFICATION_TYPE_ALERT,
	        // Titanium.Network.NOTIFICATION_TYPE_SOUND
	    // ],
	    // success:function(e)
	    // {
	        // alert('LOL :'+ e.deviceToken);
	        // var deviceToken = e.deviceToken;
	        // Ti.API.info(deviceToken);
	        // label.text = "Device registered. Device token: nn"+deviceToken;
	        // alert("Push notification device token is:"+deviceToken+"Push notification types: "+Titanium.Network.remoteNotificationTypes+"Push notificationenabled: "+Titanium.Network.remoteNotificationsEnabled);
	    // },
	    // error:function(e)
	    // {
	        // Ti.API.info("Error during registration: "+e.error);
	    // },
	    // callback:function(e)
	    // {
	        // // called when a push notification is received.
	        // alert("Received a push notificationnnPayload:nn"+JSON.stringify(e.data));
	    // }
	// });

});
$.testButton2.addEventListener("click", function(e){
	/*
	Ti.API.info("testButton clicked");
	// 여기서 테이블로 추가될때 에니메이션 되는 것을 테스트 하자. 아래쪽 데이터가 정지된 상태여야 하는데
	flag++;
	// var aaaa = Ti.UI.createTableViewRow({title:"added Row"+flag});
	// aaaa.setCenter({x:10,y:10});
	// tableSection.setHeaderTitle("added section: "+ flag);
	// table.scrollToIndex( 1, c);
	// table.insertSectionAfter(0, createTableSection());
	// table.scrollToIndex( 11, c);
	
	if( tbl_data === tbl_data){
		Ti.API.info("eeee");
	}
	var tbl_data3 = tbl_data.concat(tbl_data, tbl_data2); 
	if( tbl_data === tbl_data3){
		Ti.API.info("eeee2");
	}
	
	social.share({
		message : "Salut, Monde!",
		success : function(e) {
			alert('Success!')
		},
		error : function(e) {
			alert('Error!')
		}
	});
	*/

	
	// var tweets = ownerAccount.createCollection('tweet');
	// tweets.testStream({
		// 'purpose': 'userStream',
		// 'params': {},
		// 'onSuccess': function(){
			// Ti.API.debug("[tweetView.js] success setTweets()");
		// },
		// 'onFailure': function(){
			// Ti.API.debug("[tweetView.js] fail setTweets()");
		// }
	// });
/*
	Cloud2.Users.logout(function (e) {
	    if (e.success) {
	        alert('Success: Logged out');
	    } else {
	        alert('Error:\\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
	// example assumes you have a set of text fields named username, password, etc.
	Cloud2.Users.create({
		// A username, email or external account is required //
	    username: "userTest2",
	    password: "password",
	    password_confirmation: "password",
	    first_name: "uu",
	    last_name: "ii"
	}, function (e) {
	    if (e.success) {
	    	Ti.API.info("cloud success");
	    } else {
	    	Ti.API.info("cloud fail");
	    }
	});
*/
// Ti.API.info("01:"+Cloud1.sessionId+", 02:"+Cloud2.sessionId);
// Cloud1.asdf = "11";
// Cloud2.asdf = "22";
// Ti.API.info("01:"+Cloud1.asdf+", 02:"+Cloud2.asdf);
// Ti.API.info("01:"+Cloud1.sessionId+", 02:"+Cloud2.sessionId);


alert("..UUID: " + Ti.Network.getRemoteDeviceUUID() ); 
	// accounts.cloud.PushNotifications.subscribe({
	    // channel: 'friend_request',
	    // device_token: myPushDeviceToken
	// }, function (e) {
	    // if (e.success) {
	        // alert('Success');
	    // } else {
	        // alert('Error:\n' +
	            // ((e.error && e.message) || JSON.stringify(e)));
	    // }
	// });
});

// var Cloud = require('ti.cloud');
var Cloud = Alloy.Globals.accounts.cloud;
var Cloud1 = Object.create(Cloud);
var Cloud2 = Object.create(Cloud);

// var Cloud1 = new Cloud();
// var Cloud2 = new Cloud();


// Cloud.sessionId = Ti.App.Properties.getString('cloudSessionId');
// Ti.API.info("cloud.sessionId: "+ Ti.App.Properties.getString('cloudSessionId') );
Ti.API.info("01:"+Cloud1.sessionId+", 02:"+Cloud2.sessionId);
/*
Cloud1.Users.login({
    login: 'userTest',
    password: 'password'
}, function (e) {
    if (e.success) {
        var user = e.users[0];
        alert('Success:\\n' +
            'id: ' + user.id + '\\n' +
            'first name: ' + user.first_name + '\\n' +
            'last name: ' + user.last_name);
    } else {
        alert('Error:\\n' +
            ((e.error && e.message) || JSON.stringify(e)));
    }
});
Cloud2.Users.login({
    login: 'userTest2',
    password: 'password'
}, function (e) {
    if (e.success) {
        var user = e.users[0];
        alert('Success:\\n' +
            'id: ' + user.id + '\\n' +
            'first name: ' + user.first_name + '\\n' +
            'last name: ' + user.last_name);
    } else {
        alert('Error:\\n' +
            ((e.error && e.message) || JSON.stringify(e)));
    }
});
*/



table.addEventListener("click", function(e){
	Ti.API.info("index is "+ e.index + ", table length " + tbl_data.length);
	tbl_data.splice(e.index, 1);	
	for(var i=0; i < 10; i++){
		tbl_data.splice(e.index, 0, {title:"added Row " + i});
	}
	table.setData(tbl_data);
	Ti.API.info("after table length "+ tbl_data.length);
});



// var social = require('twitter2').create({
	// // callbackUrl : "http://zazima.com/",
	// consumerSecret : '1BxWzFDjhJkrXMiP9aoi9eXhySnISWlYb8vtIwRHpM',
	// consumerKey : 'JCOOHvCQE617qdnJChrtA'
// });
// var social2 = require('twitter2').create({
	// // callbackUrl : "http://zazima.com/",
	// consumerSecret : '1BxWzFDjhJkrXMiP9aoi9eXhySnISWlYb8vtIwRHpM',
	// consumerKey : 'JCOOHvCQE617qdnJChrtA'
// });
// if(!social.isAuthorized()) { 
    // social.authorize();
// }

