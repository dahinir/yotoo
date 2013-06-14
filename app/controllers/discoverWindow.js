var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;


exports.init = function( options ) {
	if( options.ownerAccount ){
		ownerAccount = options.ownerAccount;
		
		$.navBarView.init({
			"ownerAccount": ownerAccount,
			"defaultTitle": L('dicover')
		});
		
		$.mapView.init({
			"ownerAccount" : ownerAccount
		});
		
	}else{
		Ti.API.warn("[discoverWindow.js] must set ownerAccount");
	}
};


/* SearchBar */
var searchBarView = Ti.UI.createView({
	// layout: 'horizontal',
	backgroundColor: '#000',
	opacity: 0.7,
	top: 0,
	height: 43
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
	    style:Ti.UI.iPhone.SystemButtonStyle.BAR,
	    height: 35,
	    width: 60,
	    right: 5,
	    top: 5
	});
}

searchBarView.add(searchBar);
searchBarView.add(searchButtonBar);
$.contentView.add(searchBarView);



