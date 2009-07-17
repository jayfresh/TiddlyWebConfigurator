/*
A bag is:
bagName: {
	write: ["GUEST",...],
	create: ["GUEST",...],
	delete: ["GUEST",...],
	manage: ["GUEST",...],
	accept: ["GUEST",...]
}

A recipe is:
recipeName: ["bag A","bag B",...]
*/

var tiddlyweb = {};

(function($) {

var host = "http://localhost:8080"; // XXX: hardcoded

tiddlyweb.saveEntities = function(obj) {
	tiddlyweb.saveBags(obj.bags);
	tiddlyweb.saveRecipes(obj.recipes);
};

tiddlyweb.saveBags = function(bags) {
	for(var bag in bags) {
		tiddlyweb.saveBag(bag, bags[bag]);
	}
};

tiddlyweb.saveRecipes = function(recipes) {
	for(var recipe in recipes) {
		tiddlyweb.saveRecipe(recipe, recipes[recipe]);
	}
};

tiddlyweb.saveBag = function(name, policy) {
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
};

tiddlyweb.saveRecipe = function(name, bags) {
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
