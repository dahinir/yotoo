// var args = arguments[0] || {};
var customer,	users, yos;
var defaultTemplate;
/**
* customer, users
*/
exports.init = function(options) {
	Ti.API.debug("[userListView.js] .init() ");
	options = options || {};

	if(users){
		Ti.API.error("[userListView.js] only call .init() once ")
		return;
	}
	if(!options.customer || !options.users){
		Ti.API.error("[userListView.init] customer and users are needed. ");
	}

	users = options.users;
	customer = options.customer;
	yos = options.customer.yos;
	defaultTemplate = options.defaultTemplate || "plain";

	if(users && users.length){
		var listDataItems = users.map(function(mo){
			return settingData(mo);
		});
		$.section.setItems(listDataItems, {'animated': false});
	}

	// users events
	users.on('remove', function(deletedUser){
		Ti.API.debug("[userListView.js] users remove event ");
		var index = _getIndexByItemId( deletedUser.get('id_str') );
		$.section.deleteItemsAt( index, 1 );
	});
	users.on('reset', function(collection, options){
		Ti.API.debug("[userListView.js] users reset event");
		var listDataItems = [];
		collection.each(function(mo){
			listDataItems.push(settingData(mo));
		});
		$.section.setItems(listDataItems, {'animated': false});
	});
	users.on("change:profile_image_url_https change:name change:screen_name change:friends_count change:followers_count", function(changedUser){
			Ti.API.debug("[userListView.js] users change event. ");
			var index = _getIndexByItemId(changedUser.get('id_str'));
			var listDataItem = settingData( changedUser );
			$.section.updateItemAt(index, listDataItem, {'animated': true});
	});
	users.on('add', function(addedUser, collection, options){
		Ti.API.debug("[userListView.js] users add event ");
		addRows({
			'addedUsers': addedUser,
			'reset': false
		});
	});

	// yos events
	yos.on("add remove change:unyo change:complete", function(yo, collection, options){
		Ti.API.debug("[userListView.js] yos change or add event. "+ JSON.stringify(yo));

		var changedUser = users.get(yo.get("receiverId"));
		if( !changedUser ){
			return;
		}

		var index = _getIndexByItemId(changedUser.id);
		var data = $.section.getItemAt(index);

		data.template = chooseItemTemplate(changedUser, yo);
		$.section.updateItemAt(index, data, {'animated': true});
	});

	// refresh controll
	if(_.isFunction(options.refresh)){
		var refreshControl = Ti.UI.createRefreshControl({
		    // tintColor:'red'
		});
		refreshControl.addEventListener("refreshstart",function(e){
		  e.callback = function(){
				refreshControl.endRefreshing();
			};
			options.refresh(e);
			// $.userListView.fireEvent("refreshstart", e);
			// setTimeout(function(){
			//     Ti.API.debug('Timeout');
			//     $.refreshControl.endRefreshing();
			// }, 20000);
			// $.refreshControl.endRefreshing();
		});
		$.userListView.setRefreshControl(refreshControl);
	}
};	// end of .init()

function chooseItemTemplate(user, yo){
	var template;
	if(user.id == customer.get("provider_id")){
		template = "self";
	}else if(yo && yo.get("complete") ){
		template = "complete";
	}else if(yo && yo.get("unyo")){
		template = "unyo";
	}else if(yo && yos.get(yo.id)){
		template = "yo";
	}else {
		template = defaultTemplate;
	}
	return template;
}
function settingData(user) {
	data = {
		profileImage : {
			image : user.get('profile_image_url_https').replace(/_normal\./g, '_bigger.')
		},
		name : {
			text : user.get('name')
		},
		screenName : {
			text : "@" + user.get('screen_name')
		},
		following : {
			text : "Following: " + String.formatDecimal(user.get('friends_count'))
		},
		followers : {
			text : "Followers: " + String.formatDecimal(user.get('followers_count'))
		},
		// description_: { text: user.get('description') },

		// properties are defined ListItem
		properties : {
			itemId : user.id
		}
	};
	if (user.get('verified')) {
		data.verifiedAccountIcon = {
			visible : true
		};
	}

	// template select
	var itsYo = yos.where({
		"receiverId": user.id,
		"provider": customer.get("provider")
	}).pop();
	data.template = chooseItemTemplate(user, itsYo);

	if (OS_ANDROID) {
		data.description_ = {
			text : user.get('description')
		};
		data.properties.height = Ti.UI.SIZE;
		// not support on iOS
	}
	return data;
}

var addRows = function(options){
	var addedUsers = options.addedUsers;
	var reset = options.reset;
	var dataArray = [];

	if( addedUsers.map ){
		for(var i = 0; i < addedUsers.length; i++){
			dataArray.push( settingData( addedUsers.at(i) ) );
		}
	}else{
		dataArray.push( settingData( addedUsers ) );
	}

	if( reset ){
		// $.userListView.deleteSectionAt(0);
		$.section.setItems(dataArray, {'animated': true});
	}else{
		$.section.appendItems(dataArray, {'animated': true});
	}

	if ($.userListView.getSectionCount() === 0) {
		$.userListView.setSections([$.section]);
	} else {
		$.userListView.replaceSectionAt(0, $.section, {'animated': true});
		//, {animated: true, position: Ti.UI.iPhone.ListViewScrollPosition.TOP});
	}
	$.userListView.scrollToItem(0, 0);
};

var _getIndexByItemId = function(itemId){
	var index;
	var listDataItems = $.section.getItems();
	for ( index = 0; index < listDataItems.length; index++) {
		if (listDataItems[index].properties.itemId === itemId) {
			break;
		}
	}
	if( index === listDataItems.length){
		Ti.API.error("[userListView.js] there is no matched itemId");
	}
	return index;
};

function onRightButtonClick(e){
	Ti.API.debug("[userListView.onRightButtonClick] "+e.itemId + e.bubbles);
	e.userId = e.itemId;
	$.userListView.fireEvent("rightButtonClick", e);
}
// $.trigger('rightButtonClick');
function onUnyoButton(e){
	Ti.API.debug("[userListView.onUnyooButton] "+e.itemId + e.bubbles);
	var userId = e.itemId;

	var optionDialog = Ti.UI.createOptionDialog({
		title: L("unyo_effect"),
		options: [L("unyo"), L("cancel")],
		// selectedIndex: 1,	// android only
		destructive: 0,	// red type by ios
		persistent: false,
		cancel: 1
	});

	optionDialog.addEventListener("click", function(e){
		var yo = yos.where({"receiverId": userId}).pop();
		if( e.index === 0){
			yo.destroy({
				success: function(){
					// yos.remove(yo);	// don't need: Backbone Optimistically removes the model from its collection, if it has one
					// alert(L("yo_unyo_success"));
				},
				error: function(){
					alert(L("yo_unyo_error"));
				}
			});
		}
	});
	optionDialog.show();
}

function onYoButtonClick(e){
	Ti.API.debug("[userListView.onYoClick] "+e.itemId + e.bubbles);

	var userId = e.itemId;
	var optionDialog = Ti.UI.createOptionDialog({
		title: L("yo_effect"),
		options: [L("yo"), L("cancel")],
		persistent: false,
		cancel: 1
	});
	optionDialog.addEventListener("click", function(e){
		var yo = yos.where({"receiverId": userId}).pop();
		if(e.index === 0){
			if(yo && yo.get("unyo")){
				yo.reyo({
					success: function(){
						// alert(L("yo_reyo_success"));
					},
					error: function(){
						alert(L("yo_reyo_error"));
					}
				});
			}else{
				yos.addNewYo({
					senderUser: customer.userIdentity,
					receiverUser: users.get(userId),
					success: function() {
						// alert(L("yo_save_success"));
					},
					error: function() {
						alert(L("yo_save_error"));
					}
				});
			}
		}
	});
	optionDialog.show();
}

$.userListView.addEventListener("itemclick", function(e){
	Ti.API.debug("[userListView]  itemclick event fired.");
	Ti.API.debug(e);

	// var userWindow = Titanium.UI.createWindow({title: "Hello",backgroundColor:"yellow"});
	var userController = Alloy.createController("userWindow");
	userController.init({
		customer: customer,
		user: users.get(e.itemId)
	});
	customer.mainTabGroup.activeTab.open(userController.getView());
});
