migration.up = function(db) {
	// db.dropTable("account");
	db.createTable({
		"columns": {
			"id_str":"TEXT",
			"name":"TEXT",
			"screen_name":"TEXT",
			"profile_image_url_https":"TEXT",
			"profile_background_image_url": "TEXT",
			
			"access_token":"TEXT",
			"access_token_secret":"TEXT",
			
			"id":"TEXT PRIMARY KEY", 
			// "session_id_acs": "TEXT",
			
			"active":"INTEGER",
			"status_active_tab_index":"INTEGER"
		},
		"adapter": {
			"idAttribute": "id",
			"type": "sql",
			"collection_name": "account"
		}
	});
};


migration.down = function(db) {
	db.dropTable("account");
};
