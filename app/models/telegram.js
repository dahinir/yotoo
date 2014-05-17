// shared
// var cloudApi = {a: 1};
// var asdf = function(){ alert("asdf");return "dd";}();

exports.definition = {
	config: {
		columns: {
			"id": "TEXT",
			"data": "TEXT",
			"viewed": "INTEGER"
		},
		adapter: {
			'idAttribute': "id",
			'type': "sqlrest",
			'collection_name': "telegram"
			// "lastModifiedColumn": "modified"
		},
		defaults: {
			'viewed': 0	// false
		},
		URL: "http://localhost:3030/api/telegrams/mine",
		disableSaveDataLocallyOnServerError: true,
		initFetchWithLocalData: true,
	    addModifedToUrl: true,
	    deleteAllOnFetch: false,
		// debug: 1, 
		// "useStrictValidation": 1, // validates each item if all columns are present
	    // optimise the amount of data transfer from remote server to app
	    // "lastModifiedColumn": "modified",
        // "deleteAllOnFetch": true,	// delete all models on fetch
		parentNode:"results"
		// .parentNode called only from Remote, not local db
		// parentNode: function (data) {
		    // var entries = [];
		    // _.each(data.results, function(_entry) {
		    	// // alert(JSON.stringify(_entry));
		        // var entry = {};
// 		
		        // entry.id = _entry.id;
		        // entry.data = _entry.data;
		        // // .parentNode called only from Remote, not local db
		        // // entry.viewed = 0;
// 		
		        // entries.push(entry);
		    // });
		    // return entries;
		// }
	},		
	extendModel: function(Model) {
		_.extend(Model.prototype, {
	        // 'defaults': {
	        	// 'viewed': 0	// false
	        // }
			// 'initialize': function(e, e2){
				// this.cloudApi = require('cloudProxy').getCloud();
			// }
		});
		
		return Model;
	},
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			// 'initialize': function(e) {
				// this.cloudApi = require('cloudProxy').getCloud();
			// }
		});
		
		return Collection;
	}
};

