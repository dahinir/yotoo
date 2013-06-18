var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;




var localParams = {
	latitude: 0,
	longitude: 0,
	radius: 1,
	unit: 'mi'	// or 'km'
};


exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.mapView.init({
			"ownerAccount": ownerAccount,
			"localParams": localParams
		});
		
	}else{
		Ti.API.warn("[discoverWindow.js] must set ownerAccount");
	}
};

var listView;
var mapView = $.mapView;
var showListView = function(){
	Ti.API.info("[localView.js] showListView()");
	if( listView === undefined ){
		listView = Alloy.createController('discover/localListView');
		listView.init({
			"ownerAccount": ownerAccount,
			"localParams": localParams
		});
		listView.getView().setTop( searchBarView.getHeight() 	);
		$.containerView.add(listView.getView());
		
	}else{
		listView.setRegion( localParams );
		listView.getView().show();
		if( mapView ){
			mapView.getView().hide();
		}
	}
};
var showMapView = function(){
	Ti.API.info("[localView.js] showMapView()");
	if( mapView === undefined ){
		Ti.API.info("un");
	}else{
		mapView.setRegion( localParams );
		mapView.getView().show();
		if( listView ){
			listView.getView().hide();
		}
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
		Ti.API.info("[localView.js] "+  JSON.stringify(e.coords) );
		localParams.latitude = e.coords.latitude;
		localParams.longitude = e.coords.longitude;
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



/* SearchBar */
var searchBarView = Ti.UI.createView({
	// layout: 'horizontal',
	backgroundColor: '#000',
	opacity: 0.7,
	top: 0,
	height: 43,
	zIndex: 1
});
var searchBar = Ti.UI.createSearchBar({
    barColor: '#000',
    // opacity: 0.8, 
    showCancel: false,
    height: 43,
    top: 0,
    right: 70,
    // width: 290,
    hintText: L('search_twitter')
});
// $.mapView.getView().addEventListener('click', function(e){
	// Ti.API.info('mapView click fired');
	// searchBar.blur();
// });
searchBar.addEventListener('cancel', function(e){
	Ti.API.info('search bar cancel fired');
	searchBar.blur();
});
searchBar.addEventListener('focus', function(e){
	Ti.API.info('search bar focus fired');
	searchBar.setShowCancel(true, { animated: true });
	// $.mapView.hide();
});
searchBar.addEventListener('blur', function(e){
	Ti.API.info('search bar blur fired');
	searchBar.setShowCancel(false, { animated: true });
});
if( OS_IOS ){	
	var searchButtonBar = Ti.UI.createButtonBar({
	    labels: ['LIST', 'MAP'],
	    backgroundColor: '#666',
	    style:Ti.UI.iPhone.SystemButtonStyle.PLAIN,
	    height: 35,
	    width: 60,
	    right: 5,
	    top: 5
	});
	
	searchButtonBar.addEventListener('click', function(e){

		Ti.API.info("[discoverWindow.js] click " + e.index);
		Ti.API.info("[discoverWindow.js] localParams " + localParams.radius);
		
		if( e.index === 0){
			showListView();
		}
		if( e.index === 1){
			showMapView();
		}
		/*
		var tweets = ownerAccount.createCollection('tweet');
		tweets.fetchFromServer({
			'purpose': 'discover',
			'params': {
				// 'q': "",
				'geocode': "37.49804,127.027236,1mi"
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
		*/
	});

}

searchBarView.add(searchBar);
searchBarView.add(searchButtonBar);
$.containerView.add(searchBarView);
