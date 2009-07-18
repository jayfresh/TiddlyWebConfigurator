var tiddlyweb = {
	host: "http://localhost:8080" // XXX: hardcoded
};

(function() {

tiddlyweb = YAHOO.lang.merge(tiddlyweb, {
	saveEntities: function(obj) {
		for(var bag in obj.bags) {
			this.saveBag(bag, obj.bags[bag]);
		}
		for(var recipe in obj.recipes) {
			this.saveRecipe(recipe, obj.recipes[recipe]);
		}
	},

	/*
	 * on success, callback is passed data and "success"
	 * on error, callback is passed XHR, "error" and the error
	 */
	loadBag: function(name, callback) {
		var uri = this.host + "/bags/" + encodeURIComponent(name);
		callback = console.log; // XXX: DEBUG
		loadData(uri, callback);
	},

	/*
	 * on success, callback is passed data and "success"
	 * on error, callback is passed XHR, "error" and the error
	 */
	loadRecipe: function(name, callback) {
		var uri = this.host + "/recipes/" + encodeURIComponent(name);
		callback = console.log; // XXX: DEBUG
		var _callback = function(data, status, error) {
			// simplify data by removing filters (currently unsupported)
			var bags = [];
			for(var i = 0; i < data.recipe.length; i++) { // TODO: error handling
				bags.push(data.recipe[i][0]);
			}
			var recipe = {};
			recipe[name] = bags;
			callback(recipe);
		};
		loadData(uri, _callback);
	},

	/*
	 * policy is an object with members write, create, delete, manage and accept,
	 * each an array of users/roles
	 */
	saveBag: function(name, policy) {
		var uri = this.host + "/bags/" + encodeURIComponent(name);
		var data = {
			policy: policy
		};
		saveData(uri, data, console.log);
	},

	/*
	 * bags is an array of bag names
	 * filters currently unsupported
	 */
	saveRecipe: function(name, bags) {
		var uri = this.host + "/recipes/" + encodeURIComponent(name);
		var data = {
			recipe: []
		};
		for(var i = 0; i < bags.length; i++) {
			data.recipe.push([bags[i], ""]);
		}
		saveData(uri, data, console.log);
	}
});

var loadData = function(uri, callback) {
	localAjax({ // TODO: use getJSON
		url: uri,
		type: "GET",
		dataType: "json",
		success: callback,
		error: callback
	});
};

var saveData = function(uri, data, callback) {
	localAjax({
		url: uri,
		type: "PUT",
		dataType: "json",
		data: YAHOO.lang.JSON.stringify(data),
		complete: callback
	});
};

/*
 * enable AJAX calls from a local file
 * triggers regular jQuery.ajax call after requesting enhanced privileges
 */
var localAjax = function(args) { // XXX: not required!?
	if(document.location.protocol.indexOf("http") == -1 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return jQuery.ajax(args); // TODO: use YUI
};

})();
