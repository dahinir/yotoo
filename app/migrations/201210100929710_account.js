migration.up = function(db) {
	db.createTable({
		"columns": {
			"id_str":"string",
			"name":"string",
			"screen_name":"string",
			"profile_image_url_https":"string",
			"profile_background_image_url": "string",
			
			"access_token":"string",
			"access_token_secret":"string",
			
			"active":"boolean",
			"status_active_tab_index":"int"
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
