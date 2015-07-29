migration.up = function(db) {
	db.dropTable("user");
	db.createTable({
		"columns": {
			"id_str":"TEXT PRIMARY KEY",
			"name":"TEXT",
			"screen_name":"TEXT",
			"profile_image_url_https":"TEXT",
			"profile_background_image_url": "TEXT",

			// "acs_id":"TEXT",
			"cached_at":"INTEGER"
		},
		"adapter": {
			"idAttribute": "id_str",
			"type": "sql",
			"collection_name": "twitterUser"
		}
	});
};


migration.down = function(db) {
	db.dropTable("user");
};
