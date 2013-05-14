$.signInButton.addEventListener('click', function(e){
	Alloy.Globals.accounts.addNewAccount(function(addedAccount){
		if(addedAccount.get('active')){
			Ti.API.info("close welcomeWindow");
			$.welcomeWindow.close();
			// create mainTabGroup is only in accounts.on('change:active', funtion(e)){}
			// .addNewAccount() will call .changeCurrentAccount()
		} else {
			Ti.API.warn("added account is not active");
		}
	});
});

$.signUpButton.addEventListener('click', function(e){
	// open web view. https://mobile.twitter.com/signup
	// and wait until sign up, then close web view, then open add account
});

