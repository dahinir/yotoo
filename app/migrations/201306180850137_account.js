migration.up = function(db) {
	db.createTable({
		"columns": {
			"id_str":"TEXT",
			"name":"TEXT",
			"screen_name":"TEXT",
			"profile_image_url_https":"TEXT",
			"profile_background_image_url": "TEXT",
			
			"access_token":"TEXT",
			"access_token_secret":"TEXT",
			
			"id_str_acs":"TEXT", 
			// "session_id_acs": "TEXT",
			
			"active":"INTEGER",
			"status_active_tab_index":"INTEGER"
		},
		"adapter": {
			// "idAttribute": "id_str",
			"type": "sql",
			"collection_name": "account"
		}
	});
};


migration.down = function(db) {
	db.dropTable("account");
};
