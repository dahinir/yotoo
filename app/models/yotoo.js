exports.definition = {
	config: {
		columns: {
		    "hide": "boolean",
		    "source": "string",
		    "target": "string"
		},
		adapter: {
			type: "sql",
			collection_name: "yotoo"
		}
	},		
	extendModel: function(Model) {		
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});
		
		return Collection;
	}
}

