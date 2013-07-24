var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = args.users;
var yotoos = args.yotoos;

var uncompletedYotooProps = {
	'borderWidth': 0,
	'width': 80,
	'height': 30,
	'right': 10,
	'title': "kia"
};
var completedYotooProps = {
	'borderWidth': 1,
	'borderColor': "green",
	'borderRadius': 2,
	'width': 80,
	'height': 30,
	'right': 10,
	'title': "k i a"
};

var userListView = Alloy.createController('userListView', {
	'users': users,
	'getRightActionButtonProps': function( user ){
		var yotoo = yotoos.where({'target_id_str': user.get('id_str')}).pop();
		if( yotoo && yotoo.get('completed') ){
			return completedYotooProps;
		}
		return uncompletedYotooProps;
	},
	'rightActionButton': {
		type: 'Ti.UI.Button',
		bindId: 'rightAciontButton',
		properties: uncompletedYotooProps,
		events: {
			'click': function(e){
				alert("unyotoo");
				var yt = yotoos.where({'target_id_str':  e.itemId}).pop();
				// alert(".." + yt.get('unyotooed'));
				yt.unyotoo({
					'mainAgent': ownerAccount,
					'success': function(){},
					'error': function(){}
				});
				// alert(yt.get('unyotooed'));
				// Ti.API.info(JSON.stringify(e));
				// yotoos.where({'target_id_str':  e.itemId}).pop().destroy();
			}
		}
	}
}); 
$.userListView.add( userListView.getView() );


// 그냥 버튼에다가만 밀가우스 효과 주자..(유투 컴플릿 )
