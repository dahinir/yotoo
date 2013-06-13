var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;


exports.init = function( options ){
	if( options.ownerAccount ){
		owenerAccount = options.ownerAccount;
		
	}else{
		Ti.API.warn("[mapView.js] init() witheout ownerAccount");
	}
	Ti.API.info("[mapView.js] init");

}

// according to Apple's guidelines, you should provide a customized message to more clearly tell users why you're requesting their location
Ti.Geolocation.purpose = 'Determine Current Location!!!!';

if (Ti.Geolocation.locationServicesEnabled) {
    // Ti.API.info('[mapView.js] now enable location services');

    // Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
    // Ti.Geolocation.distanceFilter = 10;
    // Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	Ti.Geolocation.getCurrentPosition( function(e){
		Ti.API.info("[mapView.js] "+  JSON.stringify(e.coords) );
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


var apple =	Ti.Map.createAnnotation({
		latitude: 37.331689,
		longitude: -122.030731,
		title: 'Apple HQ',
		subtitle: 'Cupertino, CA',
		animate: true,
		pincolor: Ti.Map.ANNOTATION_RED,
		rightButton: 'apple.png'
});
var google = Ti.Map.createAnnotation({
		latitude: 37.422502,
		longitude: -122.0855498,
		title: 'Google HQ',
		subtitle: 'Mountain View, CA',
		animate: true,
		image: 'google.png',
		customView:Ti.UI.createImageView({
		  image:'https://si0.twimg.com/profile_images/3558850501/e77fc26ebf3469786554a718efc0e5ef_normal.jpeg'
		}),
		leftView: Ti.UI.createButton({
			title: 'leftView',
			height: 32,
			width: 70
		}),
		rightView: Ti.UI.createLabel({
			text: 'rightView',
			height: 'auto',
			width: 'auto',
			color: '#fff'
		})
});
// These parameters can also be defined in the TSS file.
$.mapView.annotations = [$.mountainView];
// $.mapView.region = {
	// latitude:37.389569, 
	// longitude:-122.050212, 
	// latitudeDelta:0.01, 
	// longitudeDelta:0.01
// };

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
	Ti.API.info('complete');
	Ti.API.info(e);
});
$.mapView.addEventListener('error', function(e) {
	Ti.API.info('error');
	Ti.API.info(e);
});
$.mapView.addEventListener('loading', function(e) {
	Ti.API.info('loading');
	Ti.API.info(e);
});
$.mapView.addEventListener('regionChanged', function(e) {
	Ti.API.info('regionChanged');
	Ti.API.info(e);
});

$.container.addEventListener('postlayout', function(){
	$.mapView.region = {"latitude":"37.31488290584382", "longitude":"-121.9975154126932","latitudeDelta":"0.1", "longitudeDelta":"0.1"};
	$.mapView.addAnnotation(apple);
	$.mapView.addAnnotation(google);
});


