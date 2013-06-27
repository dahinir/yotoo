var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;



// 기본값 순위: 1.현재 위치 2.예전 위치 3.yotoo사무실  
var localParams = {
	latitude: 0,
	longitude: 0,
	latitudeDelta: 0.01,
	radius: 1,
	unit: 'mi',	// or 'km'
	getRegionByRadius: function(){
		var latitudeDelta;
		if( this.unit === 'mi'){
			latitudeDelta = this.radius / 69.0;
		}else{
			latitudeDelta = this.radius / 111.111;
		}
		var scalingFactor = Math.abs((Math.cos(2 * 3.14 * this.latitude / 360.0) ));
		Ti.API.info("scailFactor "+ scalingFactor);
		return {
			"latitude": this.latitude,
			"longitude": this.longitude,
			"latitudeDelta": latitudeDelta,
			"longitudeDelta": latitudeDelta / scalingFactor
		};
	},
	getRadiusByDelta: function(){
		if ( this.unit === 'mi' ){
			return this.latitudeDelta * 69.0;
		}else{
			return this.latitudeDelta * 111.111;
		}		
	}
};


exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;

		$.mapView.init({
			"ownerAccount": ownerAccount,
			"localParams": localParams,
			"searchBarHintTextUpdater": searchBarHintTextUpdater
		});
		
	}else{
		Ti.API.warn("[discoverWindow.js] must set ownerAccount");
	}
};

var listView;
var mapView = $.mapView;
var currentView = 'MAP'; // MAP or LIST
var showListView = function(){
	currentView = 'LIST';
	Ti.API.info("[localView.js] showListView()");
	if( listView === undefined ){
		listView = Alloy.createController('discover/localListView');
		listView.init({
			"ownerAccount": ownerAccount,
			"localParams": localParams
		});
		listView.getView().setTop( $.searchBarView.getHeight() 	);
		$.containerView.add(listView.getView());
		
	}else{
		listView.getView().show();
	}
	// listView.setRegion( localParams );
	
	if( mapView ){
		mapView.getView().hide();
	}
};
var showMapView = function(){
	currentView = 'MAP';
	Ti.API.info("[localView.js] showMapView()");
	if( mapView === undefined ){
		Ti.API.info("mapView undefined!!!!");
	}else{
		mapView.getView().show();
	}
	// mapView.setRegion( localParams );
	
	if( listView ){
		listView.getView().hide();
	}
};


// according to Apple's guidelines, you should provide a customized message to more clearly tell users why you're requesting their location
Ti.Geolocation.purpose = 'Determine Current Location!!!!';

if (Ti.Geolocation.locationServicesEnabled) {
    // Ti.API.info('[mapView.js] now enable location services');

    // Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
    // Ti.Geolocation.distanceFilter = 10;
    // Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	Ti.Geolocation.getCurrentPosition( function(e){
		// Ti.API.info("[localView.js] "+  JSON.stringify(e.coords) );
		localParams.latitude = e.coords.latitude;
		localParams.longitude = e.coords.longitude;
		$.mapView.setRegion();
		$.mapView.updateTweets();
	});

    // Ti.Geolocation.addEventListener('location', function(e) {
        // if (e.error) {
            // alert('Error: ' + e.error);
        // } else {
            // Ti.API.info(e.coords);
        // }
    // });
} else {
    alert('Please enable location services');
}

$.screen.addEventListener('touchstart', function(){
	$.searchBar.blur();
});

/* SearchBar */
$.searchBar.setHintText( L('search_twitter') );
var searchBarHintTextUpdater = function( ){
	// Ti.API.info("[localView] : "+ localParams.getRadiusByDelta());
	$.searchBar.setHintText( L('search_twitter') + String.format(" %4.1f", localParams.getRadiusByDelta()) + localParams.unit);
};
$.searchBar.addEventListener('cancel', function(e){
	Ti.API.info('search bar cancel fired');
	$.searchBar.blur();
});
$.searchBar.addEventListener('focus', function(e){
	Ti.API.info('search bar focus fired');
	// $.searchBar.setShowCancel(true, { animated: true });
	$.screen.show();
});
$.searchBar.addEventListener('blur', function(e){
	Ti.API.info('search bar blur fired');
	$.screen.hide();
	// $.searchBar.setShowCancel(false, { animated: true });
});
$.searchBar.addEventListener('return', function(e){
	Ti.API.info('search bar change fired');
	$.searchBar.blur();
	var tweets = ownerAccount.createCollection('tweet');
	tweets.fetchFromServer({
		'purpose': 'discover',
		'params': {
			'q': e.value,
			// 'geocode': "37.49804,127.027236,1mi"
			'geocode': localParams.latitude +","+ localParams.longitude +","+ localParams.getRadiusByDelta() + localParams.unit
		},
		'onSuccess': function(){
			tweets.map(function(tweet){
				// var row = Alloy.createController('tweetRow', {
					// 'tweet': tweet,
					// 'ownerAccount': ownerAccount
				// }).getView();
				// row.id_str = tweet.get('id_str');
				// rowArray.push(row);

				Ti.API.info(tweet.get('user').screen_name + ": "+ tweet.get('text'));
			});
			// $.tweetsTable.setData( rowArray );
			// $.tweetsTable.setVisible( true );
		},
		'onFailure': function(){
			Ti.API.debug("[tweetView.js] fail setTweets()");
		}
	});
});
if( OS_IOS ){	
	var searchTabbedBar = Ti.UI.iOS.createTabbedBar({
	    labels: ['LIST', 'MAP'],
	    index: 1,
	    backgroundColor: '#666',
	    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	    height: 35,
	    width: 60,
	    right: 5,
	    top: 5
	});
	
	var buttonFlag = 1;
	searchTabbedBar.addEventListener('click', function(e){
		// Ti.API.info("[discoverWindow.js] click " + e.index);
		// Ti.API.info("[discoverWindow.js] localParams " + localParams.radius);
		if( e.index === buttonFlag ){
			return;
		}
		buttonFlag = e.index;
		if( e.index === 0){
			showListView();
		}
		if( e.index === 1){
			showMapView();
		}

	});
	$.searchBarView.add(searchTabbedBar);
}

