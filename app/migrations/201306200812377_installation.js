migration.up = function(db) {
	db.dropTable("installation");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"appId": "TEXT",
	    "appVersion": "TEXT",
	    "badge": "INTEGER",
			"deviceToken": "TEXT",
			"deviceType": "TEXT",
			"userId": "TEXT"
		}
		// ,
		// "adapter": {
		// 	'idAttribute': "id",
		// 	"type": "sql",
		// 	"collection_name": "installation"
		// }
	});
};

migration.down = function(db) {
	db.dropTable("installation");
};
