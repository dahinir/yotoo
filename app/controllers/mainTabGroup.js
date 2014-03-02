/*
 * mainTabGroup.js
 * -rapodor
 */
var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

// $.timelineTab.title = L('timeline');
// $.connectTab.title = L('connect');
$.discoverTab.title = L('discover');
$.favoriteTab.title = L('favorite');
// $.profileTab.title = L('profile');

$.mainTabGroup.setActiveTab( ownerAccount.get('status_active_tab_index') );

$.mainTabGroup.addEventListener('focus', function(e){
	// Ti.API.debug("[mainTabGroup] focused, index:" + e.index);
	ownerAccount.set('status_active_tab_index', e.index);
	ownerAccount.save();
});

$.mainTabGroup.addEventListener('postlayout', function(e){
	Ti.API.debug("[mainTabGroup] postlayout");
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