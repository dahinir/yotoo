var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

$.titleLabel.text = L('new_tweet');
$.cancelButton.title = L('cancel');
$.sendTweetButton.title = L('tweet');
$.charCountLabel.text = "140";

// $.tweetTextArea.height = (Ti.Platform.displayCaps.platformHeight * 0.5) - 80;
// $.tweetTextArea.width = Ti.Platform.displayCaps.platformWidth;
$.tweetTextArea.top = $.navBarView.height;
$.tweetTextArea.height = Ti.Platform.displayCaps.platformHeight - ($.tweetTextArea.top + $.toolbarView.height + $.toolbarView.bottom + 20);
// $.charCountLabel.top = (Ti.Platform.displayCaps.platformHeight * 0.5) - 33;
// $.charCountLabel.top = Ti.Platform.displayCaps.platformWidth - 60; 

var params = {};

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
	}
};

$.cancelButton.addEventListener('click', function(e){
	$.composeTweetWindow.close();
});

$.sendTweetButton.addEventListener('click', function() {
	$.activityIndicator.setMessage(L('sending_tweet'));
	$.activityIndicator.show();
	Ti.API.debug("now trying new tweet via :" + ownerAccount.get('name'));
	
	var tweet = ownerAccount.createModel('tweet');
	// var params = {
		// "status" : encodeURIComponent($.tweetTextArea.value)
	// };
	params.status = $.tweetTextArea.value;
	
	/*
	var twitterAdap = require('twitter_oldVersion');
	var twitterApi = new twitterAdap.Twitter(twitterAdap.tokens);
	twitterApi.setAccessToken(ownerAccount.get('access_token'),ownerAccount.get('access_token_secret'));
	tweet.twitterApi = twitterApi;
	tweet.sendTweet(params, function(){
		Ti.API.info("ssss");
		$.activityIndicator.hide();
	});
	*/
	
	tweet.saveToServer({
		'params': params,
		'onSuccess': function(){
			alert("success!");
			$.composeTweetWindow.close();
			$.activityIndicator.hide();
		},
		'onFailure': function(){
			// some alert..
			alert("fail!");
			$.activityIndicator.hide();
		}
	});
});


$.composeTweetWindow.addEventListener('open', function(){
	$.tweetTextArea.focus();
});

$.addPhotoButton.addEventListener('click', function(){
	Ti.Media.openPhotoGallery({
		success:function(e){
			// Ti.API.debug("success! event: " + JSON.stringify(e) );
			if( e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO ){
				var imageView = createUploadImageView(e.media);
				// params.media = imageView.toBlob();
				params.media = e.media;
				$.toolbarView.add(imageView);
			}
			$.tweetTextArea.focus();
		},
		cancel:function(){
			Ti.API.info("cancel. photoGallery");
			$.tweetTextArea.focus();
		},
		error:function(error){
			Ti.API.info("error. photoGallery");
			$.tweetTextArea.focus();
		},
		allowEditing:true	// IOS only
	});
});

$.tweetTextArea.addEventListener('change', function(e) {
	chars = (140 - e.value.length);
	if (chars < 0) {
		if ($.charCountLabel.color !='#D40D12') {
			$.charCountLabel.color = '#D40D12';
		}
	} else if (chars < 11) {
		if ($.charCountLabel.color != '#5C0002') {
			$.charCountLabel.color = '#5C0002';
		}
	} else {
		if ($.charCountLabel.color != '#000') {
			$.charCountLabel.color = '#000';
		}
	}
	$.charCountLabel.text = parseInt(chars)+'';
});

var createUploadImageView = function(image){
	var uploadImageView = Ti.UI.createImageView({
		image: image,
		height: 20,
		width: 20,
		top: 4,
		left: 4,
		backgroundColor:'#999'
	});
	uploadImageView.addEventListener('click', function(){
		delete params.media;
		$.toolbarView.remove( uploadImageView );
	});
	return uploadImageView;
};
