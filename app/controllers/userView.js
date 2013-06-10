var args = arguments[0] || {};
var purpose = args.purpose || "userView";
var ownerAccount;
// var user = $.user;	// Model defined at userView.xml as instance
var user;

exports.destroy = function(){
	Ti.API.info("[userView.js] userView closed, destroy binded model.");
    user.destroy();
};
// userView.js must called .init() //
exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		user = ownerAccount.createModel('user');
		// $.tweetsView.init({
			// "ownerAccount" : ownerAccount,
			// "purpose" : "mentions"
		// });
	}
	if( options.purpose ){
		purpose = options.purpose;
		if(purpose === 'profile'){
			setUser();
		}
	}
	if( options.userId ){
		user.set('id_str', options.userId );
		setUser( options.userId );
	}
};

Ti.API.info(String.format(L('phrase'), "hi1", "hi2"));
Ti.API.info(String.format(L('phrase2'), "hi1", "hi2"));
Ti.API.info("getTopLevelViews( ) : " + this.getTopLevelViews( ) );
// $.userView.setVerticalBounce( false);


/* userTabGroup */
$.userView.setCanCancelEvents( false );
var isAddedUserTabGroup = false;
// The rect and size values should be usable when postlayout event is fired.
$.userView.addEventListener('postlayout', function(){
	// altering properties that affect layout from the postlayout callback may result in an endless loop.
	if( !isAddedUserTabGroup ){
		isAddedUserTabGroup = true;
		var userTabGroup = Alloy.createController('userTabGroup', {
				'ownerAccount': ownerAccount,
				'user': user,
				'parentView': $.userView
			}).getView(); 
		$.userView.add(userTabGroup);
		// Ti.API.debug("userTabGroup added");
	}
			
});

/*  */
$.yotooButton.addEventListener('click', function(){
	alert( L('yotoo_effect') );
	
	
	// sourceAccount, targetAccount
	require('cloudProxy').getCloud().yotooRequest(ownerAccount, user);
});


var setUser = function( userId ){
	if(ownerAccount.get('id_str') === userId){
		purpose = "profile";
	}
	
	// userId = "881373588";	// 안철수 
	var params = {};
	if( userId ){
		params.user_id = userId;
	}
	
	user.fetchFromServer({
		'purpose': purpose,
		'params': params,
		'onSuccess': function(){
			$.profileImage.image = user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.');
			$.name.text = user.get('name');
			if( user.get('verified') ){
				$.verified.visible = true;
			}
			$.screenName.text = "@" + user.get('screen_name');
			$.description.text = user.get('description');
			$.followersCount.text = L('followers') + " " + String.formatDecimal( user.get('followers_count') );
			$.followingCount.text = L('following') + " " + String.formatDecimal( user.get('friends_count') );
			
			// if name is too long
			if( user.get('name').length > 13){
				$.nameAndYotooButton.remove($.dummyButton);
			}
			if( user.get('name').length > 17 ){
				$.nameAndYotooButton.remove($.yotooButton);
				$.mainProfileView.add($.yotooButton);
				$.yotooButton.left = $.profileImage.rect.width + $.profileImage.rect.x + 6;
				$.yotooButton.top = $.profileImage.rect.height + $.profileImage.rect.y - 22;
			}
			if( purpose !== 'profile' ){
				$.yotooButton.visible = true;
			}

			if(purpose === 'userView'){
				var moreTaskOptions = {};
				if( user.get('following') ){
					$.followingButton.title = L('following');
					$.followingButton.color = "#1D87F7";
					
					moreTaskOptions.options = [L('manage_list_memberships'), L('turn_on_notifications'), L('enable_retweets'), L('mute'), L('unfollow'), L('cancel')];
	
					moreTaskOptions.destructive = 4;
					moreTaskOptions.cancel = 5;
					moreTaskOptions.selectedIndex = 5;
				}else if( user.get('follow_request_sent') ){
					$.followingButton.title = L('follow_request_sent');
					$.followingButton.color = "#1C86F6";
				}else{
					$.followingButton.title = L('follow');
					
					moreTaskOptions.options = [L('manage_list_memberships'), L('mute'), L('follow'), L('cancel')];
					moreTaskOptions.cancel = 3;
					moreTaskOptions.selectedIndex = 3;
				}
				$.moreTaskButton.addEventListener('click', function(e) {
					var dialog = Ti.UI.createOptionDialog(moreTaskOptions).show();
				}); 
				$.followingButton.visible = true;
				$.moreTaskButton.visible = true;

				$.relationshipIndicator.visible = true;
				
				
				//* 상대가 날 팔로하는지에 대한 15 limit 해결책이 나지 않으면,
				// * 상대에게 내용없는 디엠을 보내고 받은 에러메세지 종류로 판별한다.
				//* 릴레이션쉽 리퀘스트는 moreTask버튼을 눌렀을때 보내는걸로 수정한다.
				user.fetchMetaData({
					'purpose': 'relationship',
					'params': {
						'source_id': ownerAccount.get('id_str'),
						'target_id': userId
					},
					'onSuccess': function( results ){
						if( user.get('following') ){
							if(results.relationship.source.want_retweets){
								moreTaskOptions.options[2] = L('disable_retweets');
							}
							if(results.relationship.source.notifications_enabled){
								moreTaskOptions.options[1] = L('turn_off_notifications');
							}
						}
						if(results.relationship.source.followed_by === true && results.relationship.source.following){
							$.relationshipIndicator.backgroundColor = "#CCFF66";
							$.relationshipIndicator.text = L('we_are_following_each_other');
						}else if(results.relationship.source.followed_by === true){
							$.relationshipIndicator.backgroundColor = "#1D87F7";
							$.relationshipIndicator.text = "@" + user.get('screen_name') + " " + L('is_following_you');
						}else{
							$.relationshipIndicator.text = "@" + user.get('screen_name') + " " + L('is_not_following_you');
						}
						moreTaskOptions.title = $.relationshipIndicator.text;
					},
					'onFailure': function(){
						Ti.API.debug("[userView] fetchFromServer(for relationship) failure");
					}				
				});

			} // end of if(purpose == "userView" )
		},
		'onFailure': function(){
			Ti.API.debug("[userView] fetchFromServer failure");
		}
	});

	if(purpose === "profile"){
		userId = ownerAccount.get('id_str');
	}
	// have concurrency problem?
	user.fetchMetaData({
		'purpose': 'profileBanner',
		'params': {'user_id': userId },
		'onSuccess': function( result ){
			if( typeof(result) === 'object' && typeof(result.sizes) === 'object' ){
				$.profileBannerImage.image = result.sizes.mobile_retina.url;
			}else{
				Ti.API.debug("[userView] what the hell is going on?");
			}
		},
		'onFailure': function( result ){
			if( result.errors[0].code === 34 ){
				Ti.API.debug("[userView] does not exist profileBanner");
				$.userScrollableView.backgroundColor = '#666';
			}else{
				Ti.API.debug("[userView] fetchFromServer(for profileBanner) failure");
			}
		}		
	});

}; // end of setUser()





