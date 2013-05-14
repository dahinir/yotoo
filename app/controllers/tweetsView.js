var args = arguments[0] || {};
var purpose = args.purpose || "timeline";
var ownerAccount = args.ownerAccount;

// case of purpose is 'userTimeline'
var user;
var userId;
// var additionalParams = {};

// var tweets = $.tweets;	// Collection defined at tweetsView.xml
// var tweets = Alloy.createCollection('tweet');
var tweets;

var rowArray = [];	// tweet row array

var nowUpdatingTweets = false;	// for idempotent
$.tweetsTable.setVisible( false );

// tweetView.js must called .init()
exports.init = function(args) {
	Ti.API.debug("[tweetsView.js] init() :");
	if(args.ownerAccount !== undefined ){
		ownerAccount = args.ownerAccount;
		// tweets.ownerAccount = ownerAccount;
		tweets = ownerAccount.createCollection('tweet');
		purpose = args.purpose;
		user = args.user;
		if( user ){
			// _.extend(additionalParams, {'user_id': user.get('id_str')} );
			userId = user.get('id_str');
		}
		setTweets();
	}
};

/*
var animation = require('alloy/animation');
$.tweetsTable.on('click', function(e) {
	animation.shake($.tweetsTable);
});*/
function setTweets(){
	/*
	 * if(exist data in sql){...}
	 * else{
	 */
	// Ti.API.debug("[tweetsView.js] setTweets() :");
	var params = {
		// 'count': 100,
		'user_id': userId
	};
	tweets.fetchFromServer({
		'purpose': purpose,
		'params': params,
		'onSuccess': function(){
			tweets.map(function(tweet){
				var row = Alloy.createController('tweetRow', {
					'tweet': tweet,
					'ownerAccount': ownerAccount
				}).getView();
				row.id_str = tweet.get('id_str');
				rowArray.push(row);
			});
			$.tweetsTable.setData( rowArray );
			$.tweetsTable.setVisible( true );
		},
		'onFailure': function(){
			Ti.API.debug("[tweetView.js] fail setTweets()");
		}
	});
}	// end of setTweets()




/**
 * updateBottomTweets()
 * 
 */
function updateTopTweets(){
	// Ti.API.info("updateTopTweets called!!");
	if(nowUpdatingTweets){
		return;
	}
	if($.tweetsTable.data[0].rowCount < 2){
		setTweets();
		return;
	}
	nowUpdatingTweets = true;
	
	var topTweetIdString = $.tweetsTable.data[0].rows[0].id_str;
	// Ti.API.debug("topTweetIdString:" + topTweetIdString);
	var count = 3;
	var params = {
		'user_id': userId,
		'count': count, // default 20
		'since_id': topTweetIdString
	};
	tweets.fetchFromServer({
		'purpose': purpose,
		'params': params,
		'onSuccess': function(){
			Ti.API.debug("updated tweets.length: " + tweets.length);
			for(var i = 0; i < tweets.length; i++){
				var row = Alloy.createController('tweetRow', {
					'tweet' : tweets.at(i),
					'ownerAccount' : ownerAccount
				}).getView();
				row.id_str = tweets.at(i).get('id_str');
				rowArray.splice(i, 0, row);				
			}
			 
			// middleRow : skipped tweets exist //
			if( tweets.length === count){
				var middleRow = createMiddleRow(tweets.at(tweets.length-1).get('id_str'), topTweetIdString);
				rowArray.splice(tweets.length, 0, middleRow);	
			}else{
				Ti.API.debug("[tweetView.js] no additional skipped middle tweets.");
			}

			// iOS only support animation
			if( OS_IOS ){
				var animationProps = {
					animated : true,
					// animationStyle : Ti.UI.iPhone.RowAnimationStyle.NONE
					position : Ti.UI.iPhone.TableViewScrollPosition.NONE	// minimum of movement
				};
				// $.tweetsTable.scrollToIndex(0, {animated:false});
				$.tweetsTable.setData( rowArray );
				$.tweetsTable.scrollToIndex(tweets.length, animationProps);
			}else{
				$.tweetsTable.setData( rowArray );
				$.tweetsTable.scrollToIndex(tweets.length );
			}				
			nowUpdatingTweets = false;
		},
		'onFailure': function(){
			Ti.API.debug("[tweetView.js] fail updateTopTweet()");
			nowUpdatingTweets = false;
		}
	});

}	// end of updateTopTweets

//-- for pull to refresh (only ios)---//
var nowPullingTable = false;
var nowReloading = false;

$.tweetsTable.addEventListener('scroll',function(e){
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !nowPullingTable) {
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(-180);
		nowPullingTable = true;
		$.arrowImage.animate({
			transform : t,
			duration : 100
		});
		$.statusLabel.text = "Release to refresh...";
		$.actIndicator.show();
	} else if (nowPullingTable && offset > -65.0 && offset < 0) {
		// nowPullingTable = false;
		var t = Ti.UI.create2DMatrix();
		$.arrowImage.animate({
			transform : t,
			duration : 100
		});
		$.statusLabel.text = "Pull down to refresh...";
	}
});

$.tweetsTable.addEventListener('scrollEnd', function(e) {
	// alert("nowPullingTable:"+nowPullingTable+"\n !nowReloading:"+!nowReloading+"\n e.contentOffset.y:"+e.contentOffset.y);
	if (nowPullingTable && !nowReloading /* && e.contentOffset.y <= -65.0 */) {
		nowReloading = true;
		nowPullingTable = false;
		$.arrowImage.hide();
		$.actIndicator.show();
		$.statusLabel.text = "Reloading...";
		$.tweetsTable.setContentInsets({top : 60}, {animated : true});
		$.arrowImage.transform = Ti.UI.create2DMatrix();
		beginReloading();
	}
});

function beginReloading() {
	// alert("beginReloading");
	// just mock out the reload
	updateTopTweets();

	// when you're done, just reset
	$.tweetsTable.setContentInsets({top : 0}, {animated : true});
	nowReloading = false;
	$.lastUpdatedLabel.text = "Last Updated: "; // + some date
	$.statusLabel.text = "Pull down to refresh...";
	$.actIndicator.hide();
	$.arrowImage.show();
}
//-- end of pull to refresh ---//




/**
 * updateBottomTweets()
 * 
 */
function updateMiddleTweets(e){
	if(nowUpdatingTweets){
		return;
	}
	nowUpdatingTweets = true;

	Ti.API.info("up:  " + e.rowData.upsideTweetIdString);
	Ti.API.info("down:" + e.rowData.downsideTweetIdString);
	Ti.API.info("clicked index:" + e.index);
	Ti.API.info("button:" + e.buttonFlag);
	var count = 3;	// one tweet will be ignored
	var params = {
		'user_id': userId,
		'max_id': e.rowData.upsideTweetIdString,	// will be duplicate
		'since_id': e.rowData.downsideTweetIdString,
		'count': count
	}; 
	tweets.fetchFromServer({
		'purpose': purpose,
		'params': params,
		'onSuccess': function(){
			$.tweetsTable.deleteRow(e.index);
			rowArray.splice(e.index, 1);
			
			if( tweets.length < 1){
				Ti.API.info("[tweetView.js] there was no skipped tweets");
				return;
			}

			// add tweetRow //
			for(var i = 1; i < tweets.length; i++){
				var row = Alloy.createController('tweetRow', {
					"tweet" : tweets.at(i),
					"ownerAccount" : ownerAccount
				}).getView();
				row.id_str = tweets.at(i).get('id_str');
				rowArray.splice(e.index + i - 1, 0, row);				
			}
			
			// middleRow : skipped tweets exist //
			if( tweets.length === count){
				var middleRow = createMiddleRow( tweets.at(tweets.length-1).get('id_str'), e.rowData.downsideTweetIdString);
				rowArray.splice(e.index + tweets.length - 1, 0, middleRow);
			} else {
				Ti.API.info("[tweetView.js] no additional skipped middle tweets.");
			}
			
			// iOS only support animation
			if( OS_IOS ){
				var animationProps = {
					animated : true,
					// animationStyle : Ti.UI.iPhone.RowAnimationStyle.NONE
					position : Ti.UI.iPhone.TableViewScrollPosition.NONE	// minimum of movement
				};
				// $.tweetsTable.scrollToIndex(e.index, {animated:false});
				$.tweetsTable.setData( rowArray );
				$.tweetsTable.scrollToIndex(e.index + tweets.length - 1, animationProps);
			}else{
				$.tweetsTable.setData( rowArray );
				$.tweetsTable.scrollToIndex(e.index + tweets.length - 1);
			}
				
			nowUpdatingTweets = false;
		},
		'onFailure': function(){
			Ti.API.debug("[tweetView.js] fail updateMiddleTweet()");
			nowUpdatingTweets = false;
		}
	});
	
}	// end of updateMiddleTweets()

/**
 * createMiddleRow()
 */
function createMiddleRow(upsideTweetIdString, downsideTweetIdString) {
	var middleRow = Ti.UI.createTableViewRow({
		// title : "(tap for skipped tweets)",
		// layout : 'horizontal',
		// layout : 'vertical',
		"height" : 45,
		"upsideTweetIdString" : upsideTweetIdString,
		"downsideTweetIdString" : downsideTweetIdString
	});

	var upButton = Ti.UI.createButton({
		title : "up",
		left : 10
	});
	var downButton = Ti.UI.createButton({
		title : "down",
		right : 10
	});
	var buttonFlag = 'NONE';
	
	middleRow.add(downButton);
	middleRow.add(upButton);

	middleRow.addEventListener("click", function(e) {
		// Ti.API.info("upbutton:" + upButton.rect.x + ", "+ upButton.rect.y + "    " + upButton.rect.height);
		// Ti.API.info("x:" + e.x + ",  " + e.y);
		if (buttonFlag === 'UP') {
			Ti.API.info("up button clicked");
		} else if (buttonFlag === 'DOWN') {
			Ti.API.info("down button clicked");
		}
		e.buttonFlag = buttonFlag;
		updateMiddleTweets(e);
		buttonFlag = 'NONE';
	});
	upButton.addEventListener("click", function(e) {
		buttonFlag = 'UP';
	});
	downButton.addEventListener("click", function(e) {
		buttonFlag = 'DOWN';
	});
	
	return middleRow;
}



/**
 * updateBottomTweets()
 * 
 */
function updateBottomTweets(){
	if( nowUpdatingTweets ){
		return;
	}
	// Ti.API.info("rows: "+$.tweetsTable.data[0].rowCount);
	var bottomRowIndex = $.tweetsTable.data[0].rowCount - 1;
	
	nowUpdatingTweets = true;
	var bottomTweetIdString = $.tweetsTable.data[0].rows[bottomRowIndex].id_str;
	// Ti.API.debug("bottomTweetIdString:"+ bottomTweetIdString);
	var params = {
		'user_id': userId,
		'max_id': bottomTweetIdString,	// will be duplicate
		'count': 20	// default 20
	}; 
	tweets.fetchFromServer({
		'purpose': purpose,
		'params': params,
		'onSuccess': function(){
			for(var i = 1; i < tweets.length; i++){
				// Ti.API.info("hi " + i + " of " + results.length + ", id_str:" + tweets.at(i).get('id_str'));
				var row = Alloy.createController('tweetRow', {
					'tweet': tweets.at(i),
					'ownerAccount': ownerAccount
				}).getView();
				row.id_str = tweets.at(i).get('id_str');
				rowArray.splice(bottomRowIndex + i + 1, 0, row);
			}
			$.tweetsTable.setData( rowArray );
			nowUpdatingTweets = false;
		},
		'onFailure': function(){
			nowUpdatingTweets = false;
		}
	});
	
}	// end of updateBottomTweets()

/* eventListener for updateBottomeTweets() */
$.tweetsTable.addEventListener('scrollEnd', function(e){
	var total = e.contentOffset.y + e.size.height,
	theEnd = e.contentSize.height;
	// distance = theEnd - total;

	// adjust the % of rows scrolled before we decide to start fetching
	var nearEnd = theEnd * .85;
	// if (!updatingBottomTweets && (total >= nearEnd)) {
	if (total >= nearEnd) {
		updateBottomTweets();
	}
});


// function tweetsFilter(tweets){
	// Ti.API.info("collection change?");
	// return tweets;
// }
// function tweetTransform(tweet){
	// // Ti.API.info("model change?" + tweet.id_str);
	// // Ti.API.info("model change?" + tweet);
	// tweet.ownerAccount = ownerAccount;
	// return tweet;
// }
// tweets.on('add', function(tweet){
    // // custom function to update the content on the view
	// Ti.API.info("add:"+ Alloy.globals.testVal2++);
	// var row = Alloy.createController('tweetRow', {
		// "tweet" : tweet,
		// "ownerAccount" : ownerAccount
	// }).getView(); 
	// // $.tweetsTable.insertRowAfter(0, row);
	// Ti.API.info("id_str:::" + tweet.get('id_str'));
	// row.id_str = tweet.get('id_str');
	// $.tweetsTable.appendRow(row);
// });