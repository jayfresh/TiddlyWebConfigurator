var tiddlyweb;

(function($) {

var host = "http://localhost:8080"; // XXX: hardcoded

tiddlyweb = {
	saveEntities: function(obj) {
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
		var uri = host + "/bags/" + encodeURIComponent(name);
		var data = {
			policy: policy
		};
		$.localAjax({
			url: uri,
			type: "PUT",
			dataType: "json",
			data: YAHOO.lang.JSON.stringify(data),
			complete: console.log // DEBUG
		});
	},

	/*
	 * bags is an array of bag names
	 * filters currently unsupported
	 */
	saveRecipe: function(name, bags) {
		var uri = host + "/recipes/" + encodeURIComponent(name);
		var data = {
			recipe: []
		};
		for(var i = 0; i < bags.length; i++) {
			data.recipe.push([bags[i], ""]);
		}
		$.localAjax({
			url: uri,
			type: "PUT",
			dataType: "json",
			data: YAHOO.lang.JSON.stringify(data),
			complete: console.log // DEBUG
		});
	}
};

/*
 * enable AJAX calls from a local file
 * triggers regular $.ajax call after requesting enhanced privileges
 */
$.localAjax = function(args) {
	if(document.location.protocol.indexOf("http") == -1 && window.Components &&
		window.netscape && window.netscape.security) {
		window.netscape.security.PrivilegeManager.
			enablePrivilege("UniversalBrowserRead");
	}
	return $.ajax(args);
};

})(jQuery);
