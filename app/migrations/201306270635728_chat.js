migration.up = function(db) {
	// db.dropTable("chat");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"chatgroup": "TEXT",	// like twitter, facebook..
		    "created_at": "DATETIME",
		    "message": "TEXT",
		    "photo": "TEXT",
		    
		    "owner_id": "TEXT"
		},
		"adapter": {
			'idAttribute': "id",
			"type": "sql",
			"collection_name": "chat"
		}
	});
};

migration.down = function(db) {
	db.dropTable("chat");
};
