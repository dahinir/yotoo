/*
 * userTabGroup.js
 * : design for ScrollView's son
 *
 * ScrollView's height should setted with Ti.UI.FILL
 * and contentHeight with 'auto'
 *
 * userTabGroup's height should setted with
 * parent view(maybe ScrollView)' height
 *
 */

var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;
var user = args.user;
var parentView = args.parentView;

Ti.API.info(ownerAccount.get('name') + ", hi i'm userTab");

if (!parentView.scrollingEnabled) {
	Ti.API.warn("userTabGroup's parent should be ScrollView");
}
if (parentView.height !== Ti.UI.FILL) {
	Ti.API.warn("userTabGroup's parent height should be Ti.UI.FILL");
}
if (parentView.contentHeight !== 'auto') {
	Ti.API.warn("userTabGroup's parent contentHeight should be auto");
}

$.userTabGroup.bubbleParent = false;
$.userTabGroup.height = parentView.getSize().height;

$.toTheTop.bubbleParent = false;
$.toTheTop.addEventListener('click', function() {
	Ti.API.debug("toTheTop ");
	parentView.scrollTo(0, 0);
	parentView.setScrollingEnabled(true);
});

// $.tabBar.addEventListener('click', function() {
// Ti.API.debug("tabBar ");
// });

// $.tweetsTabButton.addEventListener('click', function() {
// $.tweetsTabButton.focusable = false;
// $.tweetsTabButton.enabled = false;
// });

var activeTabButtonProperties = {
	backgroundImage : '',
	backgroundColor : '#555',
	borderColor : '#333'
};
var inactiveTabButtonProperties = {
	backgroundImage : '/images/transparent.png', // OS_IOS works, how about android?
	backgroundColor : $.tabBar.getBackgroundColor(),
	borderColor : $.tabBar.getBackgroundColor()
};

var tabs = [];
var createTab = function(initArgs) {
	if (!initArgs || !initArgs.button) {
		Ti.API.warn("button of tab must be setted at create time");
		return;
	}

	var button = initArgs.button;
	var view = initArgs.view;
	var createView = initArgs.createView;	// must be function
	var active = false;

	button.applyProperties(inactiveTabButtonProperties);
	button.addEventListener('click', function(e) {
		if( !e.defalutTab ){
			parentView.scrollTo(0, $.userTabGroup.getRect().y);
			parentView.setScrollingEnabled(false);
		}
		if (active) {
			Ti.API.debug("actived tab");
			return;
		}
		for (var i = 0; i < tabs.length; i++) {
			// tabs[x].xx is outside of clouser
			tabs[i].getButton().applyProperties(inactiveTabButtonProperties);
			if (tabs[i].getView()) {
				tabs[i].getView().hide();
			}
			tabs[i].setActive(false);
		}
		active = true;
		button.applyProperties(activeTabButtonProperties);
		if ( view ) {
			Ti.API.debug("tab\'s view is created already. call .show()");
			view.show();
		} else if (createView) {
			Ti.API.debug("create Tab\' view by call .createView()");
			var createdView = createView();
			createdView.setTop($.tabBar.getHeight());
			$.userTabGroup.add(createdView);
			view = createdView;
		} else {
			Ti.API.warn("createView must be setted");
		}
	});

	return {
		getButton : function() {
			return button;
		},
		getView : function() {
			return view;
		},
		setActive : function(val) {
			active = val;
		}
	};
};

// custom tabs! //
tabs.push(createTab({
	button : $.timelineTabButton
}));
tabs.push(createTab({
	button : $.tweetsTabButton,
	createView : function() {
		Ti.API.info("this is userTabGroup "+ user.get('id_str'));
		var tweetsView = Alloy.createController('tweetsView');
		tweetsView.init({
			'ownerAccount': ownerAccount,
			'purpose': 'userTimeline',
			'user': user
		});
		tweetsView = tweetsView.getView();
		return tweetsView;
	}
}) );
tabs.push(createTab({
	button : $.photoTabButton
}));
tabs.push(createTab({
	button : $.mentionTabButton
}));
tabs.push(createTab({
	button : $.favoriteTabButton
})); 


// tweetsTab
$.tweetsTabButton.fireEvent('click', {defalutTab:true});

/*
 var tabButtons = [$.timelineTabButton, $.tweetsTabButton, $.photoTabButton,
 $.mentionTabButton, $.favoriteTabButton];
 // default tab UI action. just add EventListener to all tabs
 for(var i = 0; i < tabButtons.length; i++){
 tabButtons[i].applyProperties( inactiveTabButtonProperties );
 var tabButton = tabButtons[i];
 tabButtons[i].addEventListener('click', function(i){
 return function(){
 for(var j = 0; j < tabButtons.length; j++){
 tabButtons[j].applyProperties( inactiveTabButtonProperties );
 }
 tabButtons[i].applyProperties( activeTabButtonProperties );
 parentView.scrollTo(0, $.userTabGroup.getRect().y);
 parentView.setScrollingEnabled(false);
 tabButtons[i].fireEvent('tabActive');
 };
 }(i) );	// refer 70 page
 }

 $.tweetsTabButton.addEventListener('tabActive', function(){
 Ti.API.info(" tweetsTab tabActive ");
 var tweetsView = Alloy.createController('tweetsView');
 tweetsView.init({
 "ownerAccount" : ownerAccount,
 "purpose" : "mentions"
 });
 tweetsView = tweetsView.getView();
 tweetsView.setTop( $.tabBar.getHeight() );
 $.userTabGroup.add(tweetsView);
 // if exists calll .show() and add with top value as tabBar's height
 // else create tweetsView.js
 //
 });

 // default open tab
 $.tweetsTabButton.applyProperties( activeTabButtonProperties );
 $.tweetsTabButton.fireEvent('tabActive');

 */

