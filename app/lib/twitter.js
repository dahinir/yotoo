/**
 * twitter.js
 *
 * Autor: rapodor, dasolute Inc.
 * Version: 0.1
 * Designed for yotoo Version:0.1
 * @requires jsOAuth: http://github.com/bytespider/jsOAuth
 */
// test
/*
// 이런 식의 유즈케이스가 나오도록 만들자.
var social = require('alloy/social').create({
    consumerSecret: 'consumer-secret',
    consumerKey: 'consumer-key'
});

// If not authorized, get authorization from the user
if(!social.isAuthorized()) { 
    social.authorize();
}

// 이런식의 객체 전달을 사용하자 
social.share({
    message: "Salut, Monde!",
    success: function(e) {alert('Success!')},
    error: function(e) {alert('Error!')}
});

// Deauthorize the application
social.deauthorize();
*/

// api http://bytespider.github.com/jsOAuth/api-reference/
// var jsOAuth = require('jsOAuth-1.3.6');
// var jsOAuth = require('jsOAuth');
var jsOAuth = require('jsOAuth136');

var cfg = require('tokens').twitter;
cfg.oauthSignatureMethod = 'HMAC-SHA1';
// cfg.callbackUrl = 'if you using callbackUrl';

var urls = {
    'accessToken': "https://api.twitter.com/oauth/access_token",
    'requestToken': "https://api.twitter.com/oauth/request_token",
    'authorize': "https://api.twitter.com/oauth/authorize",
    
    'userStream': "https://userstream.twitter.com/1.1/user.json", // limit :yes
    // 'siteStream': "https://sitestream.twitter.com/1.1/site.json",
    
	'postTweet': "https://api.twitter.com/1.1/statuses/update.json",	// limit :no
	'postTweetWithMedia': "https://api.twitter.com/1.1/statuses/update_with_media.json",	// limit :no
	
	'timeline': "https://api.twitter.com/1.1/statuses/home_timeline.json",	// limit :15
	'mentions': "https://api.twitter.com/1.1/statuses/mentions_timeline.json",	// limit :15
	'searchTweets': "https://api.twitter.com/1.1/search/tweets.json", // 180/user 450/app
	'searchUsers': "https://api.twitter.com/1.1/users/search.json",	// 180/user
	'lookupUsers': "https://api.twitter.com/1.1/users/lookup.json",	// 180/user 60/app
	'profile': "https://api.twitter.com/1.1/account/verify_credentials.json",	// 15/user  Use this method to test if supplied user credentials are valid.
	
	'getDirectMessages': 'https://api.twitter.com/1.1/direct_messages.json',
	
	'userView': "https://api.twitter.com/1.1/users/show.json",	// 180/user 180/app
	'profileBanner': "https://api.twitter.com/1.1/users/profile_banner.json",	// limit :180
	'relationship': "https://api.twitter.com/1.1/friendships/show.json",	// 180/user 15/app.  it was 15! wow!
	
	'userTimeline': "https://api.twitter.com/1.1/statuses/user_timeline.json",	// limit :180
	
	
	'ownershipLists': "https://api.twitter.com/1.1/lists/ownerships.json",	// 15/user, 15/app
	'subscriptionLists': "https://api.twitter.com/1.1/lists/subscriptions.json"	// 15/user, 15/app
};

var toUrlString = function(params){
	var urlString = "";
	for( key in params){
		if( params[key] ){
			urlString = urlString + key + "=" + params[key] + "&";
		}
	}
	return urlString.replace( /&$/g , '');
};


/**
 * @method showAuthorizeUI
 * authorize via webView
 * @param {Object} options object
 * @param {String} options.url Url to open
 * @param {Object} options.oauthClient jsOAuth instance
 * @param {Function} [options.onSuccess] Callback function executed after a success
 * @param {Function} [options.onError] Callback function executed after a fail 
 */
var showAuthorizeUI = function(options){
	var url = options.url;
	var oauthClient = options.oauthClient;
	var onSuccess = options.onSuccess;
	var onError = options.onError;

	var webWindowController = Alloy.createController('webWindow');
	var webView = webWindowController.getWebView();

	var loadCount = 0;

	webView.addEventListener('beforeload', function(e) {
		Ti.API.info(e.url);
		if( e.url === 'https://api.twitter.com/oauth/cancelforyotoobabe'){
			webView.stopLoading();
			webWindowController.getView().close();
		}
	});

	webView.addEventListener('load', function(e) {
		// Ti.API.debug("webView load!");
	    // var cookies = webView.evalJS("document.cookie").split(";"); 
	    // Ti.API.info( "# of cookies -> " + cookies.length  );
	    // for (i = 0; i <= cookies.length - 1; i++) {
	            // Ti.API.info( "cookie -> " + cookies[i] );
	    // }
		loadCount++;
		var pin;

		// e.source.evalJS('Ti.App.fireEvent("webView:cancel");');
		// Ti.API.info(webView.html);
		// ios bug; focus not work  
		// e.source.evalJS('if(document.getElementById("username_or_email")){document.getElementById("username_or_email").focus();}');
		e.source.evalJS('if(document.getElementById("cancel")){document.getElementById("cancel").addEventListener("touchstart", function(){ location.replace("cancelforyotoobabe"); }); }');

		if( cfg.callbackUrl ){
			Ti.API.debug("callbackUrl is defined! ");
			if( e.url.match(cfg.callbackUrl) ){
				Ti.API.debug("login success.");
				(e.url).replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
					if (key === 'oauth_verifier') {
						pin = value;
					}
				});
			}
		}else{
			Ti.API.debug("callbackUrl is undefined");
			var response = e.source.evalJS('(p = document.getElementById("oauth_pin")) && p.innerHTML;');
			if( response ){ 
				pin = response.split("<code>")[1].split("</code>")[0];
			}else{ 
				Ti.API.debug("not yet..");
			}
		}
		
		if( pin ){
			Ti.API.debug("login succes, pin is " + pin);
			oauthClient.setVerifier(pin);
			oauthClient.fetchAccessToken(function(data) {
				onSuccess(data);
				// if (Ti.Platform.osname === "android") {// we have to wait until now to close the modal window on Android: http://developer.appcelerator.com/question/91261/android-probelm-with-httpclient
					webWindowController.getView().close();
				// }
			}, function(data) {
				Ti.API.warn("Failure to fetch access token, try again. ");
				onError(data);
			});
			
			// clear cookies for next login
			Ti.Network.createHTTPClient().clearCookies('https://api.twitter.com/oauth');
		}else if( loadCount > 1){
			Ti.API.info('[twitter.js] you_may_enter_wrong_id/pass');
			loadCount = 0;
			webView.setUrl(url);
		}
	});

	webView.setUrl(url);
	webWindowController.getView().open();
};

/**
 * @method request
 * Make an authenticated twitter API request
 * @param {Object} options Configuration object
 * @param {String} options.httpMethod HTTP method for this request, such as 'GET' or 'POST'
 * @param {String} options.url The url to send the XHR to
 * @param {Object} options.params The parameters to send
 * @param {Function} [options.success] Callback function executed after a success
 * @param {Function} [options.error] Callback function executed after a fail 
 */
var api = function(options){
		
};

/**
 * @method create
 * Initializes an OAuth session to the service provider.
 * @param {Object} settings Configuration object
 * @param {String} settings.consumerKey Application consumer key
 * @param {String} settings.consumerSecret Application consumer secret
 * @param {String} settings.callbackUrl 
 * @param {String} settings.accessTokenKey (optional) The user's access token key
 * @param {String} settings.accessTokenSecret (optional) The user's access token secret
 * @return {Object} Instance of social to make subsequent API calls.
 */
exports.create = function(settings) {
	Ti.API.debug("[twitter.js] create()");
	if( !settings ){
		settings = {};
	}
	
	// instance variables //
	var authorized = false;
	var accessTokenKey = settings.accessTokenKey;
	var accessTokenSecret = settings.accessTokenSecret;

	// shared variables //
	if( settings.callbackUrl ){
		cfg.callbackUrl = settings.callbackUrl;
	}	
	if( settings.consumerKey && settings.consumerSecret ){
		cfg.consumerKey = settings.consumerKey;
		cfg.consumerSecret = settings.consumerSecret;
	}

	// new instance of jsOAuth
	var oauthClient = jsOAuth.OAuth({
		requestTokenUrl: urls.requestToken,	// Required for 3-legged requests
		authorizationUrl: urls.authorize,	// Required for 3-legged requests
		accessTokenUrl: urls.accessToken,	// Required for 3-legged requests
		
		callbackUrl: cfg.callbackUrl,		// Required for 3-legged requests with callback url
		consumerKey: cfg.consumerKey,
		consumerSecret: cfg.consumerSecret,
		signatureMethod: cfg.oauthSignatureMethod,
		
		accessTokenKey: accessTokenKey,	// if already login
		accessTokenSecret: accessTokenSecret	// if already login
	});

	return {
		/**
		 * @param {Function} [options.onSuccess]
		 * @param {Function} [options.onFailure]
		 */
		authorize: function(options){
			var onSuccess = options.onSuccess;
			var onFailure = options.onFailure;
			
			Ti.API.debug("[twitter.js] authorize()");
			oauthClient.fetchRequestToken(function(authorizationUrlWithParams){ // on success
				showAuthorizeUI({
					'url': authorizationUrlWithParams,
					'oauthClient': oauthClient,
					'onSuccess': function(data){
						accessTokenKey = oauthClient.getAccessTokenKey();
						accessTokenSecret = oauthClient.getAccessTokenSecret();
						Ti.API.info("wow: "+ accessTokenKey+ " "+ accessTokenSecret);
						onSuccess();
					},
					'onError': function(data){
						Ti.API.debug("[twitter.js] authorize error. with this data:"+data);
						onFailure();
					}
				});
			},function(data){ // on failure
				Ti.API.error("[twitter.js] Failure to fetch request token: "+ JSON.stringify(data));
				onFailure();
			});
		},
		getAccessTokenKey: function(){
			return accessTokenKey;
		},
		getAccessTokenSecret: function(){
			return accessTokenSecret;
		},
		// request: function(options){
			// oauthClient.request(options);
		// },
		/**
		 * @method fetch
		 * @param {Object} options
		 * @param {String} options.url If this described, options.purpose will ignored
		 * @param {String} options.purpose We got some twitter.com urls
		 * @param {Object} options.params  
		 * @param {Functioin} [options.onSuccess]
		 * @param {Functioin} [options.onFailure]
		 */
		fetch: function(options){
			// Ti.API.debug("[twitter.js] fetch");
			var url = options.url || urls[options.purpose];
			var params = toUrlString( options.params );
			if( params.length > 1){
				url = url + "?" + params;
			}
			var onSuccess = options.onSuccess;
			var onFailure = options.onFailure;
			
			Ti.API.debug("[twitter.js] url: "+ url);
			oauthClient.request({
				'url': url,
				'success': function(data){
					Ti.API.debug("[twitter.js] fetch success.");
					var result = JSON.parse(data.text || '');
					onSuccess(result); 
				},
				'failure': function(data){
					Ti.API.debug("[twitter.js] failure to fetch.");
					var result = JSON.parse(data.text);
					
					if (result.errors) {
						Ti.API.debug("[twitter.js] error code: " + result.errors[0].code + ", " + result.errors[0].message);
						
						if (result.errors[0].code === 32) {
							// "Could not authenticate you", why?
						}else if (result.errors[0].code === 34) {
							// "Sorry, that page does not exist"
						}else if (result.errors[0].code === 88) {
							// "Rate limit exceeded"
							alert("limit! Rate limit window duration is currently 15 minutes long");
						}else {
							Ti.API.debug("[twitter.js] unexpected error.");
						}
					}else {
						Ti.API.debug("[twitter.js] fetch() unkwon error.");
					}
					onFailure( result );
				}	 
			});
		},
		post: function(options){
			var url = options.url || urls[options.purpose];
			var header;
			if( options.purpose === 'postTweetWithMedia' ){
				header = {
					'Content-Type': 'multipart/form-data'
				};
			}
			var onSuccess = options.onSuccess;
			var onFailure = options.onFailure;
			Ti.API.debug("[twitter.js] url: "+ url);
			oauthClient.request({
				'method': 'POST',
				'headers': header,
				'url': url,
				'data': options.params,
				'success': function(data){
					var result = JSON.parse(data.text);
					// Ti.API.debug("[twitter.js] JSON.stringify" + JSON.stringify(data.text));
					Ti.API.debug("[twitter.js] success post. id_str:" + result.id_str);
					if( result.id_str ){
						onSuccess();
					}else{
						onFailure();
					}
				},
				'failure': function(data){
					var result = JSON.parse(data.text);
					Ti.API.debug(JSON.stringify(data.text));
					Ti.API.debug("[twitter.js] failure post.");
					onFailure();
				}
			});
		},
		stream: function(options){
			/*
			var url = options.url || urls[options.purpose];
			// var url = urls['siteStream'];
			// var header;
			var params = toUrlString( options.params );
			if( params.length > 1){
				url = url + "?" + params;
			}
			var onSuccess = options.onSuccess;
			var onFailure = options.onFailure;
			Ti.API.debug("[twitter.js] url: "+ url);
			oauthClient.post({
				'method': 'POST',
				// 'headers': header,
				'stream': true,
				'url': url,
				'data': options.params,
				'success': function(data){
					var result = JSON.parse(data.text);
					Ti.API.debug("[twitter.js] JSON.stringify" + JSON.stringify(data.text));
					Ti.API.debug("[twitter.js] success post. id_str:" + result.id_str);
					if( result.id_str ){
						onSuccess();
					}else{
						onFailure();
					}
				},
				'failure': function(data){
					var result = JSON.parse(data.text);
					Ti.API.debug(JSON.stringify(data.text));
					Ti.API.debug("[twitter.js] failure post.");
					onFailure();
				}
			});
			*/
		}
		
	}; // return object
};
