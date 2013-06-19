var args = arguments[0] || {};
var ownerAccount = args.ownerAccount;

var localParams;

exports.init = function( options ){
	if( options.ownerAccount ){
		owenerAccount = options.ownerAccount;
		localParams = options.localParams;
		
		$.slider.setValue( localParams.radius );
		
	}else{
		Ti.API.warn("[localListView.js] init() witheout ownerAccount");
	}
	Ti.API.info("[localListView.js] init");
}




// $.slider.text = $.slider.value;
function updateLabel(e){
    $.label.text = String.format("%4.1f", e.value);
    localParams.radius = e.value;
}

exports.setRegion = function( localParams ){
	Ti.API.info("[localListView.js] setRegion : "+ localParams.getRadiusByDelta());
	$.slider.value =  localParams.getRadiusByDelta();
    // $.label.text = String.format("%4.1f", localParams.getRadiusByDelta() );
}

