migration.up = function(db) {
	db.dropTable("customer");
	db.createTable({
		"columns": {
			"id": "TEXT PRIMARY KEY",
			"accessToken": "TEXT",
			"availableYoNumber": "INTEGER",

			"provider": "TEXT",
			"provider_id": "TEXT",
			"provider_accessToken": "TEXT",
			"provider_accessTokenSecret": "TEXT",

			"profile_username": "TEXT",
			"profile_picture": "TEXT",

			"status_activeTabIndex": "INTEGER"
		}
		// ,
		// adapter는 애초에 내가 잘못 넣은건가?
		// "adapter": {
			// "idAttribute" : "id",	// default is alloy_id
			// "type": "sqlrest",
			// "collection_name": "customer"	// use for sqlite table name
		// }
	});
};

migration.down = function(db) {
	db.dropTable("customer");
};
