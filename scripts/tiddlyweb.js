var tiddlyweb = {
	host: "" // defaults to current domain -- XXX: lacks server_prefix
};

(function() {

tiddlyweb = YAHOO.lang.merge(tiddlyweb, {
	/*
	 * entity has members type ("bag" or "recipe") and name
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadTiddlers: function(entity, callback) {// TODO: use "resource" instead of "entity" throughout?
		var uri = this.host + "/" + entity.type + "s/" +
			encodeURIComponent(entity.name) + "/tiddlers"
		callback = console.log; // XXX: DEBUG
		// simplify data by only returning titles
		var _callback = function(data, status, error) {
			var tiddlers = [];
			for(var i = 0; i < data.length; i++) {
				tiddlers.push(data[i].title);
			}
			callback(tiddlers);
		};
		loadData(uri, _callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadBag: function(name, callback) {
		var uri = this.host + "/bags/" + encodeURIComponent(name);
		callback = console.log; // XXX: DEBUG
		loadData(uri, callback);
	},

	/*
	 * callback is passed data, status and error (if applicable)
	 * see jQuery.ajax for details
	 */
	loadRecipe: function(name, callback) {
		var uri = this.host + "/recipes/" + encodeURIComponent(name);
		callback = console.log; // XXX: DEBUG
		// simplify data by removing filters (currently unsupported)
		var _callback = function(data, status, error) {
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

	saveEntities: function(obj) { // XXX: helper function belongs into configurator.js
		for(var bag in obj.bags) {
			this.saveBag(bag, obj.bags[bag]);
		}
		for(var recipe in obj.recipes) {
			this.saveRecipe(recipe, obj.recipes[recipe]);
		}
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
	return jQuery.ajax(args); // TODO: use YAHOO.util.Connect.asyncRequest
};

})();
