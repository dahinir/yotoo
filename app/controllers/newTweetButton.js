var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

exports.init = function(args) {
	if(args.ownerAccount != undefined ){
		ownerAccount = args.ownerAccount;
	}
};

$.newTweetButton.addEventListener('click', function(e) {
	if(ownerAccount != undefined){
		var composeWindow = Alloy.createController('composeTweetWindow', {
			"ownerAccount" : ownerAccount
		}).getView();
		composeWindow.open();
		// alert("hi"+ Alloy.globals.myVal);
	}else{
		Ti.API.info("fuck! did not set ownerAccount. but maybe works next try");
	}
});

