var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

var localParams;
var searchBarHintTextUpdater;

exports.init = function( options ){
	if( options.ownerAccount ){
		owenerAccount = options.ownerAccount;
		localParams = options.localParams;
		searchBarHintTextUpdater = options.searchBarHintTextUpdater;
	}else{
		Ti.API.warn("[localMapView.js] init() witheout ownerAccount");
	}
	Ti.API.info("[localMapView.js] init");
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
	// Ti.API.info('complete');
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
	Ti.API.info('regionChanged.');
	// Ti.API.info("miles: " + e.latitudeDelta * 69.0);
	// Ti.API.info("km: " + e.latitudeDelta * 111.1);
	Ti.API.info(e);
	localParams.latitude = e.latitude;
	localParams.longitude = e.longitude;
	localParams.latitudeDelta = e.latitudeDelta;
	Ti.API.info("radius: "+ localParams.getRadiusByDelta());
	searchBarHintTextUpdater( );
	// localParams.setLatitudeDelta( e.latitudeDelta );
	// if ( localParams.unit === 'mi' ){
		// localParams.radius = e.latitudeDelta * 69.0;
	// }else{
		// localParams.radius = e.latitudeDelta * 111.111;
	// }
});

$.container.addEventListener('postlayout', function(){
	$.mapView.region = {"latitude":"37.31488290584382", "longitude":"-121.9975154126932","latitudeDelta":"0.1", "longitudeDelta":"0.1"};
	$.mapView.addAnnotation(apple);
	$.mapView.addAnnotation(google);
});
// exports.setRegion = function( localParams ){
	// Ti.API.info("[localMapView.js] setRegion");
	// $.mapView.region = localParams.getRegionByRadius();
	// // Ti.API.info("[localMapView.js] delta is " + delta);
// }
