migration.up = function(db) {
	// db.dropTable("chat");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"chatgroup": "TEXT",	// like twitter, facebook..
		    "created_at": "TEXT",	// [WARN] "DATETIME" is not a valid sqlite field, using TEXT instead
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
