/*
 * mainTabGroup.js
 * -rapodor
 */
var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

Ti.API.info("[mainTabGroup.js] hello");

// $.timelineTab.title = L('timeline');
// $.connectTab.title = L('connect');
$.discoverTab.title = L('discover');
$.favoriteTab.title = L('favorite');
// $.profileTab.title = L('profile');

$.mainTabGroup.setActiveTab( ownerCustomer.get('status_activeTabIndex'));

$.mainTabGroup.addEventListener('focus', function(e){
	// Ti.API.debug("[mainTabGroup] focused, index:" + e.index);
	ownerCustomer.set('status_activeTabIndex', e.index);
	ownerCustomer.save(undefined, {
		localOnly:true
	});
});

$.mainTabGroup.addEventListener('postlayout', function(e){
	// Ti.API.debug("[mainTabGroup] postlayout");
	// slow down.. animate 알파값 상승
	// $.mainTabGroup.borderWidth = 0;
});

/*
exports.init = function( options ){
	ownerAccount = options.ownerAccount;
	Ti.API.info("[mainTabGroup] mainTabGroup init with owner: " + ownerAccount.get('access_token'));

	$.timelineWindow.init({"ownerAccount" : ownerAccount});
	$.connectWindow.init({"ownerAccount" : ownerAccount});
	$.discoverWindow.init({"ownerAccount" : ownerAccount});
	$.profileWindow.init({"ownerAccount" : ownerAccount});
};
*/
