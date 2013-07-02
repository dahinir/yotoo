var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

var tweets;


// asdf


var dropDownMenu = {

};

exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		tweets = ownerAccount.createCollection('tweet');
		tweets.fetchFromServer({
			'purpose': 'ownershipLists',
			'params': {
				'user_id': ownerAccount.get('id_str'),
				'count': 1000
			},
			'onSuccess': function(){
				$.navBarView.setDropDownMenu({
					"dropDownMenu": dropDownMenu
				});
			},
			'onFailure': function(){
				Ti.API.info("[timelineWindow.js] fetch lists fail");
			}
		});
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('timeline')
		});
		
		$.tweetsView.init({
			"ownerAccount" : ownerAccount,
			"purpose" : "timeline"
		});
		
	}else{
		Ti.API.warn("[timeline.js] must set ownerAccount");
	}
};


