migration.up = function(db) {
	// db.dropTable("chat");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
		    "created_at": "TEXT",	// [WARN] "DATETIME" is not a valid sqlite field, using TEXT instead
		    "updated_at": "TEXT",
		    "message": "TEXT",
		    "photo": "TEXT",
		    
		    "chat_group_id": "TEXT",
		    "sender_id_str": "TEXT"
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
