$.signInButton.addEventListener('click', function(e){
	AG.customers.addNewCustomer(function(addedCustomer){
		// alert("wel");
		if(addedCustomer.get('id') == AG.setting.get('currentCustomerId')){
			Ti.API.info("[welcomWindow.js] close welcomeWindow");
			$.welcomeWindow.close();
			// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
			// .addNewAccount() will call .changeCurrentAccount()
		} else {
			Ti.API.warn("[welcomeWindow.js] added customer is not active");
		}
	});
});

$.signUpButton.addEventListener('click', function(e){
	// open web view. https://mobile.twitter.com/signup
	// and wait until sign up, then close web view, then open add account
});

