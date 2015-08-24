migration.up = function(db) {
	db.dropTable("yotoo");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"provider": "TEXT",	// like twitter, facebook..
		    "senderId": "TEXT",
		    "receiverId": "TEXT",

		    // "chat_group_id": "TEXT",
		    "created": "TEXT",
		    // "burned_at": "TEXT",
		    
		    "hided": "INTEGER",
		    "unyotooed": "INTEGER",
		    "completed": "INTEGER",
		    "burned": "INTEGER"
		},
		"adapter": {
			'idAttribute': "id",
			"type": "sql",
			"collection_name": "yotoo"
		}
	});
};

migration.down = function(db) {
	db.dropTable("yotoo");
};
