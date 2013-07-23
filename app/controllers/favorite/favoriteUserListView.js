var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = args.users;
var yotoos = args.yotoos;

var yotooButtonProps = {
	width : 80,
	height : 30,
	right : 10,
	title : 'yotoo'
};
var unyotooButtonProps = {
	width: 80,
	height: 30,
	right: 10,
	title: 'unyotoo'
};
var yotooButton = {
	type : 'Ti.UI.Button',
	bindId : 'rightActionButton', 
	properties : yotooButtonProps,
	events : {
		'click': function(e) {
			Ti.API.info(JSON.stringify(e));
			
			if(e.source.title === 'yotoo'){
				alert(L('yotoo_effect') + e.itemId);
				
				var targetUser = users.where({
					'id_str' : e.itemId
				}).pop();
				
				yotoos.addNewYotoo({
					'sourceUser' : ownerAccount,
					'targetUser' : targetUser,
					'success' : function() {
						alert("suc");
						e.source.title = unyotooButtonProps.title;
					},
					'error' : function() {
						alert("e");
					}
				}); 
			}else if(e.source.title === 'unyotoo'){
				alert(L('unyotoo_effect'));
				
				var yt = yotoos.where({'target_id_str': e.itemId}).pop();
				yt.unyotoo({
					'mainAgent': ownerAccount,
					'success': function(){
						e.source.title = yotooButtonProps.title;
					},
					'error': function(){
					}
				});
			}
		}
	}
};


var userListView = Alloy.createController('userListView', {
	'users': users,
	'getRightActionButtonProps': function( user ){
		if( yotoos.where({'target_id_str': user.get('id_str') }).pop() ){
			return unyotooButtonProps;
		}else{
			return yotooButtonProps;
		}
	},
	'rightActionButton': yotooButton
}); 
$.favoriteUserListView.add( userListView.getView() );
