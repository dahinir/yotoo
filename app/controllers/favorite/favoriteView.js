// var args = arguments[0] || {};
var customer, // = args.ownerCustomer || AG.customers.getCurrentCustomer();
	users,
	yos;

exports.init = function( options ) {
	if(!options.customer){
		Ti.API.debug("[favoriteView.init] customer is needed   ");
		return;
	}
	customer = options.customer;
	users = customer.yoUsers;
	yos = customer.yos;

	$.userList.init({
		// defaultTemplate: "withRightButton",
		customer: customer,
		users: users
	});
};

function fetchYoUsers(newYos) {
	if( !newYos || newYos.length == 0 ){
		return;
	}
	var userIds = [];
	newYos.map(function(yo){
		if( yo.get("hided") ){
			return;
		}
		userIds.push(yo.get("receiverId"));
	});
	// userIds = userIds.replace( /^,/g , '');

	users.addByIds({
		userIds: userIds,
		success: function(){
			Ti.API.info("[peopleView.fetchUsersBy] success ");
		},
		error: function(){
			Ti.API.info("[peopleView.fetchUsersBy] failure ");
		}
	});
}
