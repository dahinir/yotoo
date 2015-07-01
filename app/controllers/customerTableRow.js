var args = arguments[0] || {};
// DO NOT! var ownerCustomer = args.ownerCustomer || AG.customers.getCurrentCustomer();
var customer = args.customer;

// alert("[accountRow.js] account.get(name):"+ ownerAccount.get('name') );

$.profileImage.image = customer.get('profile_image_url_https');
$.name.text = customer.get('username');
$.screenName.text = customer.get('id');



// swipe for delete
if( OS_IOS ){
	$.customerRow.setEditable(true);

	$.customerRow.addEventListener('delete', function(e){
		// alert("dd");
		// Alloy.Globals.accounts.deleteAccount( ownerAccount);
		// AG.customers.remove(customer);
		customer.destroy({
			localOnly:true
		});
		
		// 이걸 해줘야
		//customer 를 destroy하고 (앱을 종료시키지 않은채) 다시 추가하면 서버로 POST를 날려서 에러를 예방
		AG.customers.fetch({
			localOnly:true
		});
	});

}
