
var args = arguments[0] || {};
var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();

exports.init = function(args) {
	if(args.ownerCustomer != undefined ){
		ownerCustomer = args.ownerCustomer;
	}
};

$.newTweetButton.addEventListener('click', function(e) {
	if(ownerCustomer != undefined){
		var composeWindow = Alloy.createController('composeTweetWindow', {
			"ownerCustomer" : ownerCustomer
		}).getView();
		composeWindow.open();
		// alert("hi"+ Alloy.globals.myVal);
	}else{
		Ti.API.info("fuck! did not set ownerAccount. but maybe works next try");
	}
});

