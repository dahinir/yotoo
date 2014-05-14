migration.up = function(db) {
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"data": "TEXT",
			"viewed": "INTEGER"
		},
		"adapter": {
			"idAttribute": "id",
			"type": "sqlrest",
			"collection_name": "telegram"
		}
	});
};

migration.down = function(db) {
	db.dropTable("telegram");
};
