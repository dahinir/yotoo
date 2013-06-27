var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

var localParams;
var searchBarHintTextUpdater;
var tweets;

exports.init = function( options ){
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		localParams = options.localParams;
		searchBarHintTextUpdater = options.searchBarHintTextUpdater;
		
		tweets = ownerAccount.createCollection('tweet');
		
	}else{
		Ti.API.warn("[localMapView.js] init() witheout ownerAccount");
	}
	Ti.API.info("[localMapView.js] init");
};

exports.setRegion = function(){
	$.mapView.region = {
		"latitude" : localParams.latitude,
		"longitude" : localParams.longitude,
		"latitudeDelta" : localParams.latitudeDelta,
		"longitudeDelta" : localParams.latitudeDelta
	};
};

exports.updateTweets = function(){
	Ti.API.info("[localMapView.updateTweets] localParams.getRadiusByDelta(): "+ localParams.getRadiusByDelta());
	tweets.fetchFromServer({
		'purpose': 'discover',
		'params': {
			// 'q': e.value,
			// 'geocode': "37.49804,127.027236,1mi"
			'geocode': localParams.latitude +","+ localParams.longitude +","+ localParams.getRadiusByDelta() + localParams.unit
		},
		'onSuccess': function(){
			var annotations = [];
			tweets.map(function(tweet){
				var annotation = Ti.Map.createAnnotation({
					latitude: tweet.get('coordinates').coordinates[1],
					longitude: tweet.get('coordinates').coordinates[0],
					title: tweet.get('user').screen_name,
					subtitle: tweet.get('text'),
					animate: true,
					// pincolor: Ti.Map.ANNOTATION_RED,
					// rightButton: 'apple.png',
					image: 'google.png',
					// leftButton: "/images/twitter_verifiedAccountIcon.png",
					// leftView: Ti.UI.createButton({
						// title: 'leftView',
						// height: 32,
						// width: 70
					// }),
					// rightView: Ti.UI.createLabel({
						// text: 'rightView',
						// height: 'auto',
						// width: 'auto',
						// color: '#fff'
					// }),
					customView:Ti.UI.createImageView({
					  image:tweet.get('user').profile_image_url_https.replace(/_normal\./g, '_bigger.')
					})
				});
				annotations.push(annotation);
				Ti.API.info(tweet.get('coordinates').coordinates[0]+"::" + tweet.get('user').screen_name + ": "+ tweet.get('text') );
			});
			$.mapView.addAnnotations(annotations);
		},
		'onFailure': function(){
			Ti.API.debug("[tweetView.js] fail setTweets()");
		}
	});
};

var isLoadingComplete = false;

$.mapView.addEventListener('click', function(evt){
    Ti.API.info("[mapView.js] Annotation " + evt.title + " clicked, id: " + evt.annotation.myid);

    // Check for all of the possible names that clicksouce
    // can report for the left button/view.
    if (evt.clicksource == 'leftButton' || evt.clicksource == 'leftPane' ||
        evt.clicksource == 'leftView') {
        Ti.API.info("[mapView.js] Annotation " + evt.title + ", left button clicked.");
    }
});
$.mapView.addEventListener('complete', function(e) {
	Ti.API.info('[localMapView.js] complete');
	isLoadingComplete = true;
	// Ti.API.info(e);
	// $.mapView.region = {"latitude":"37.31488290584382", "longitude":"-121.9975154126932","latitudeDelta":"0.1", "longitudeDelta":"0.1"};
	// $.mapView.addAnnotation(apple);
	// $.mapView.addAnnotation(google);
});
// $.mapView.addEventListener('error', function(e) {
	// Ti.API.info('error');
	// Ti.API.info(e);
// });
// $.mapView.addEventListener('loading', function(e) {
	// Ti.API.info('loading');
	// Ti.API.info(e);
// });
$.mapView.addEventListener('regionChanged', function(e) {
	Ti.API.info('[localMapView.js] regionChanged. source: ' + e.source + ", type: " + e.type);
	if( !isLoadingComplete ){
		return;
	}
	// Ti.API.info("miles: " + e.latitudeDelta * 69.0);
	// Ti.API.info("km: " + e.latitudeDelta * 111.1);
	Ti.API.info(e);
	localParams.latitude = e.latitude;
	localParams.longitude = e.longitude;
	localParams.latitudeDelta = e.latitudeDelta;
	// Ti.API.info("radius: "+ localParams.getRadiusByDelta());
	// Ti.API.info("latitude: "+ localParams.latitude);
	searchBarHintTextUpdater();
	// localParams.setLatitudeDelta( e.latitudeDelta );
	// if ( localParams.unit === 'mi' ){
		// localParams.radius = e.latitudeDelta * 69.0;
	// }else{
		// localParams.radius = e.latitudeDelta * 111.111;
	// }
});

$.container.addEventListener('postlayout', function() {
	Ti.API.info('[localMapView.js] postlayout');

}); 

// exports.setRegion = function( localParams ){
	// Ti.API.info("[localMapView.js] setRegion");
	// $.mapView.region = localParams.getRegionByRadius();
	// // Ti.API.info("[localMapView.js] delta is " + delta);
// }
