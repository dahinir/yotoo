var args = arguments[0] || {};
var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

exports.init = function( options ) {
	if( options.ownerAccount){
		ownerAccount = options.ownerAccount;
	}
};

$.listAccountsButton.addEventListener('click', function(e) {
	if( ownerAccount ){
		var accountsWindow = Alloy.createController('accountsWindow', {
			"ownerAccount" : ownerAccount
		}).getView();

		// pop animation		
		var t0 = Titanium.UI.create2DMatrix();
		t0 = t0.scale(0);
		var t1 = Titanium.UI.create2DMatrix();
		t1 = t1.scale(1.1);
		
		var openingAnimation = Titanium.UI.createAnimation();
		openingAnimation.transform = t1;
		openingAnimation.duration = 200;
	
		// when this animation completes, scale to normal size
		openingAnimation.addEventListener('complete', function() {
			Titanium.API.info('here in complete');
			var t2 = Titanium.UI.create2DMatrix();
			t2 = t2.scale(1.0);
			accountsWindow.animate({transform:t2, duration:200});
		});
		accountsWindow.setTransform(t0);
		// end of animation
		
		accountsWindow.open(openingAnimation);
		// alert("hi"+ Alloy.globals.myVal);
	}else{
		Ti.API.info("[listAccountButton.js] fuck! did not set ownerAccount. but maybe works next try");
	}
});

