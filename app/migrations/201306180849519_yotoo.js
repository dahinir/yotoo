migration.up = function(db) {
	db.createTable({
		"columns": {
			"acs_id": "TEXT",
			"platform": "TEXT",	// like twitter, facebook..
		    "source_id_str": "TEXT",
		    "target_id_str": "TEXT",
		    
		    // status //
		    "hided": "INTEGER",
		    "unyotooed": "INTEGER",
		    "completed": "INTEGER",
		    "burned": "INTEGER",
		    "past": "INTEGER"
		},
		"adapter": {
			"type": "sql",
			"collection_name": "yotoo"
		}
	});
};

migration.down = function(db) {
	db.dropTable("yotoo");
};
