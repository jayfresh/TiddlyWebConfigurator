function init() {
	try { // XXX: DEBUG
		tiddlyweb.host = "http://tiddlyweb.peermore.com/wiki";
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		layer = new WireIt.Layer({ parentEl: canvas });
		var addRecipes = function(recipes) {
			var recipe;
			var pos;
			for(var i=0;i<recipes.length;i++) {
				recipe = recipes[i];
				pos = calculateVerticalLayout(i,{x:700,y:400},150);
				addRecipe({ name: recipe, pos_x: pos.x, pos_y: pos.y }, layer);
				tiddlyweb.loadRecipe(recipe,function() {
					var recipeName = recipe;
					return function(recipeObj) {
						var recipeBags = recipeObj[recipeName];
						var bag;
						var wireConfig;
						var moduleId = 0;
						var recipeId = lookupModule({
							type:'recipe',
							options: {
								title:recipeName
							}
						},layer);
						for(var i=0;i<recipeBags.length;i++) {
							bag = recipeBags[i];
							bagId = lookupModule({
								type:'bag',
								options: {
									title:recipeBags[i]
								}
							},layer);
							wireConfig = {
								src: { moduleId: bagId, terminal: "tiddlers"},
								tgt: { moduleId: recipeId, terminal: "tiddlers" }
							};
							layer.addWire(wireConfig,layer);
						}
					}
				}());
			}
		};
		var addBags = function(bags) {
			var bag;
			var pos;
			for(var i=0;i<bags.length;i++) {
				bag = bags[i];
				pos = calculateVerticalLayout(i,{x:400,y:0},250);
				addBag({ name: bag, pos_x: pos.x, pos_y: pos.y}, layer);
			}
			tiddlyweb.loadRecipes(addRecipes);
		};
		tiddlyweb.loadBags(addBags);
	} catch(e) {
		console.log(e);
	}
}

YAHOO.util.Event.onDOMReady(init);
