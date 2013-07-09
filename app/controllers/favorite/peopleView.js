var args = arguments[0] || {};

var ownerAccount = args.ownerAccount || Alloy.Globals.accounts.getCurrentAccount();
var users = ownerAccount.createCollection('user');

var userListView = Alloy.createController('userListView');
$.peopleView.add( userListView.getView() );

