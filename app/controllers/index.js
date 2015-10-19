/*
 * index.js
 * deals with TabGroup and Telegrams
 *
 */
var customers = AG.customers;
var yotoos = AG.yotoos;
var setting = AG.setting;

function openWelcomeWindow(){
	Alloy.createController('welcomeWindow').getView().open();
}
function openMainTabGroup(customer){
	if(!customer){
		Ti.API.warn("[index.js] .openMainTabGroup() customer is undefined ");
		return;
	}
	if(customer.mainTabGroup){
		Ti.API.info("[index.js] mainTabGroup is defined, call maintabGroup.open()");
		// account.mainTabGroup.show();
		customer.mainTabGroup.open();
	}else{
		Ti.API.info("[index.js] mainTabGroup is undefined, so will be created");
		customer.mainTabGroup = Alloy.createController("mainTabGroup", {
			customer: customer
		}).getView();
		customer.mainTabGroup.open();
	}
}
function closeMainTabGroup(customer){
	if(!customer){
		Ti.API.warn("[index.js] .closeMainTabGroup() customer is undefined");
		return;
	}
	if(customer.mainTabGroup){
		Ti.API.info("[index.js] previous maintabGroup.close()");
		// customer.mainTabGroup.hide();
		customer.mainTabGroup.close();
	}
}

/* Backbone events */
// on changed current customers, reponse UI, create mainTabGroup is only in this.
setting.on('change:currentCustomerId', function(setting ){
	Ti.API.debug("[index.js] was:  " + setting.previous('currentCustomerId'));
	// previousCustomer
	closeMainTabGroup(customers.get(setting.previous('currentCustomerId')));
	// currentCustomer
	openMainTabGroup(customers.get(setting.get('currentCustomerId')));
});
customers.on('add', function(customer){
	// create mainTabGroup is only in customers.on('change:active', funtion(e)){}
	Ti.API.info("[index.js] BackboneEvent(customer added):" + customer.get('id') );
});
customers.on("remove", function(customer){	// how about 'destroy'
	// !!! `customer.id` IS NULL!! USE `customer.get('id')`
	Ti.API.info("[index.js] BackboneEvent(removed):" + customer.get("id") +", current id is" + setting.get('currentCustomerId'));
	closeMainTabGroup(customer);

	if( customers.at(0) == undefined ){
		Ti.API.debug("[index.js] customers.at(0) is empty" );
		setting.set("currentCustomerId", "THERE_IS_NO_CUSTOMER");
		setting.save();
		openWelcomeWindow();
	}else if( customer.get("id") == setting.get("currentCustomerId")){
		Ti.API.debug("[index.js] customers.length is not 0, change currentCustomer to "+ customers.at(0).get("id") );
		setting.set("currentCustomerId", customers.at(0).get("id"));
		setting.save();
	}
});

// Welcome Window
if( customers.at(0) ){
// if( setting.get("currentCustomerId") ){
	openMainTabGroup( AG.customers.getCurrentCustomer() );
}else{
	// very first using this app, maybe //
	openWelcomeWindow();
}


// telegrams from server!
var showTelegrams = function(telegrams){
	telegrams.each(function(telegram){
		if( !telegram.get('viewed') ){
			var data = JSON.parse(telegram.get('data') || "");

			var ad = Ti.UI.createAlertDialog({
				title: data.title,
				message: data.message,
				buttonNames: data.buttonNames || [L('remindLater','Remind Later'), L('go','Go')],
				cancel: data.cancel || 0
			});
			ad.addEventListener('click', function(e){
				if(e.index !== ad.getCancel() ){
					if(Ti.Platform.canOpenURL(data.url ||"")){
						Ti.Platform.openURL(data.url);
					}
					telegram.save({'viewed': 1}, {localOnly: true});
				}
			});
			ad.show();
		}
	});
	telegrams = null;
	showTelegrams = null;
};
var telegrams = Alloy.createCollection('telegram');
// fetch will fire only success on server
telegrams.on('fetch', function(e, e2){
	if( e && !e.serverData){
		// alert("this from local");
	}else{
		showTelegrams(telegrams);
	}
});
setTimeout(function(){
	telegrams.fetch({
		// localOnly: true,
		urlparams:{
			criteria: JSON.stringify(AG.platform)
		},
		success: function(tels, res){
			telegrams.each(function(tel){
				Ti.API.info("local: "+tel.get('id'));
			});
		},
		error: function(e){
			showTelegrams(telegrams);
		}
	});
}, 10000);
