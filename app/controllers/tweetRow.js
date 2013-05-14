var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var tweet = args.tweet;
// var tweet = args.$model;
// ownerAccount = tweet.ownerAccount;

// Ti.API.info("tweetRow created:"+ Alloy.globals.testVal++);
// $.tweetRow.title = tweet.get('id_str');	// for dev	

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
	}
};

// is this retweet?
if(tweet.get('retweeted_status')){
	$.tweetRow.className = "retweetRow";
	// meta data for retweet
	$.retweetedBy.text = L('retweeted_by') + " " + tweet.get('user').screen_name;
	$.retweetedBy.visible = true;
	$.text.bottom = $.text.bottom + 18;
	
	$.retweeterProfileImage.image = tweet.get('user').profile_image_url_https;
	$.retweeterProfileImage.visible = true;
	
	tweet = tweet.get('retweeted_status');
}else{
	tweet = tweet.attributes;
}

// searchBar searchs title value
// there is an issue : special character is not transparent.
$.tweetRow.setColor('transparent');	// set title color
$.tweetRow.title = tweet.user.name + " " + tweet.user.screen_name + " "+ _.unescape(tweet.text); 


// setting tweet
$.id_str.text = tweet.id_str || '';
if( true ){	// for retina
	$.profileImage.image = tweet.user.profile_image_url_https.replace(/_normal\./g, '_bigger.');
}else {
	$.profileImage.image = tweet.user.profile_image_url_https;
}
$.screenName.text = tweet.user.screen_name;
$.createdAt.text = new Date(tweet.created_at).toRelativeTime();
$.text.text = _.unescape(tweet.text);

// $.textView.add(Ti.UI.createLabel({text:tweet.text, width:'auto', borderWidth : 1, left:2})	);
// $.textView.add(Ti.UI.createLabel({text:"tweetext", width:'auto', borderWidth : 1, left:2})	);
// $.textView.add(Ti.UI.createLabel({text:"hel ext", width:'auto', borderWidth : 1, left:2})	);
// var textarea = Ti.UI.createTextArea({
    // top:10,
    // left:10,
    // right:10,
    // bottom:10,
    // editable:false,
    // value:tweet.text,
    // font:{fontSize:15},
    // autoLink:Ti.UI.AUTOLINK_ALL
// });
// $.textView.add(textarea);

// 단어단위로 chop해서 label로 horizontal View에 add하면 될것같다. 
// :no! 이걸론 안된다. 기다려 보자.
// var str="How are you doing today?";
// var n=str.split(" ");
// Ti.API.info(n);
//wonderwallkr 계정에 쓴 트윗으로 시험해 볼것.

// 아니면 styled label 모듈을 써야하나.. 마켓플래이스에 tweet label 같은거 있을것 같다.

if(tweet.retweet_count > 0){
	$.text.bottom = $.text.bottom + 18;
	$.retweetedBy.bottom = $.retweetedBy.bottom + 15;
	$.retweeterProfileImage.bottom = $.retweeterProfileImage.bottom + 15;
	if(tweet.retweet_count == 1){
		$.retweetCount.text = tweet.retweet_count + " " + L('time_retweeted');
	}else{
		$.retweetCount.text = tweet.retweet_count + " " + L('times_retweeted');
	}
	$.retweetCount.visible = true;
}

$.profileImage.addEventListener('click', function(e) {
	// var window2 = Titanium.UI.createWindow({url:'foo.js'});
	// var t = Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT;
	// window1.animate({view:window2,transition:t});
	// Ti.API.info("id_str:"+ tweet.user.id);
	var userWindow = Alloy.createController('userWindow');
	userWindow.init({
		"ownerAccount" : ownerAccount,
		"userId" : tweet.user.id
	}); 
	userWindow.getView().open();
});





// set timer for $.timeAgo Label
var created_at = tweet.created_at || '';
var timer = setInterval(function(){
    $.createdAt.text = new Date(created_at).toRelativeTime();
    if ( new Date() - new Date(created_at) > 60000) {	// min
        clearInterval(timer);
        setInterval(function(){
        	$.createdAt.text = new Date(created_at).toRelativeTime();
        }, 15000);	// every 15 sec
    }
}, 1000);	// every sec

