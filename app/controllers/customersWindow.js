var args = arguments[0] || {};
// var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();
var customers = AG.customers;


$.backgroundView.addEventListener('click', function(e) {
	$.customersWindow.close();
});

$.addCustomerButton.addEventListener('click', function(e){
	customers.addNewCustomer(function(addedCustomer){
		// if(addedCustomer.get('id') == AG.setting.get('currentCustomerId')){
		if( addedCustomer ){
			$.customersWindow.close();
			// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
			// .addNewAccount() will call .changeCurrentAccount()
		} else {}
	});
});


customers.map(function(customer){
	var row = Alloy.createController('customerTableRow', {
		"customer" : customer
	}).getView();

	row.addEventListener('click', function(e){
		$.customersWindow.close();
		Ti.API.debug("[customerWindow.js] change current customer to : " + customer.get('id'));
		// change current account
		// Alloy.Globals.accounts.changeCurrentAccount( account );
		AG.setting.set("currentCustomerId", customer.get('id'));
		AG.setting.save();
	});

	$.customersTable.appendRow(row);
});
