/**
 * mainTabGroup.js
 */
var args = arguments[0] || {};
var customer = args.customer;	// no mercy!

Ti.API.debug("[mainTabGroup.js] called.");

$.mainTabGroup.setActiveTab(customer.get('status_activeTabIndex'));

$.mainTabGroup.addEventListener('focus', function(e){
	// Ti.API.debug("[mainTabGroup] focused, index:" + e.index);
	customer.set('status_activeTabIndex', e.index);
	customer.save(undefined, {
		localOnly:true
	});
});

$.mainTabGroup.addEventListener('postlayout', function(e){
	// Ti.API.debug("[mainTabGroup] postlayout");
	// slow down.. animate 알파값 상승
	// $.mainTabGroup.borderWidth = 0;
});

// init child views
$.discoverWindow.init({
	customer: customer
});
$.favoriteWindow.init({
	customer: customer
});
$.userWindow.init({
	customer: customer
});
