migration.up = function(db) {
	db.dropTable("yo");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"provider": "TEXT",	// like twitter, facebook..
		    "senderId": "TEXT",
		    "receiverId": "TEXT",

		    // "chat_group_id": "TEXT",
		    "created": "TEXT",
		    // "burned_at": "TEXT",

		    "hide": "INTEGER",
		    "unyo": "INTEGER",
		    "complete": "INTEGER",
		    "burn": "INTEGER"
		},
		"adapter": {
			'idAttribute': "id",
			"type": "sql",
			"collection_name": "yo"
		}
	});
};

migration.down = function(db) {
	db.dropTable("yo");
};
