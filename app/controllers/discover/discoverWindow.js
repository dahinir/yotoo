var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();

/*
$.navBarView.init({
	// "ownerAccount": ownerAccount,
	"defaultTitle": L('discover')
});
*/

// $.navBarView.setTitle( L('dicover') );

$.titleLabel.text = L('discover');
$.titleImageView.setImage( ownerAccount.get('profile_image_url_https') );

$.titleLabel.addEventListener('click', function(){
	// var tel = Alloy.createModel('telegram');
	// tel.set('id', "5370fe33a67fe1f4cde9b576");
	// alert(tel.attributes);
	// tel.fetch({
		// success: function(){
			// alert(tel.attributes);
		// }
	// });
	// return;
	var tel = Alloy.createCollection('telegram');
	// alert(JSON.stringify(tel.attributes));
	// alert(tel.length);
	
	// fetch 하면 로컬에 자동 저장도 하나보다.. 그렇다면..이제..
	tel.fetch({
		localOnly: true,
		urlparams:{
			condition: JSON.stringify(AG.platform)
		},
		success:function(e){
			// alert(JSON.stringify(e));
			// alert(e);
			// alert(tel.pop().attributes);
			// alert(tel.length);
			// alert(tel.get("0"));
			tel.each(function(t){
				alert(t.attributes);
				// t.destroy();
			});
		}
	});
	// alert(tel.attributes);
});
