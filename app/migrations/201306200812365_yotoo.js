migration.up = function(db) {
	// db.dropTable("yotoo");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"platform": "TEXT",	// like twitter, facebook..
		    "source_id_str": "TEXT",
		    "target_id_str": "TEXT",
		    
		    // status //
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
