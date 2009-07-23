function init() {
	try { // XXX: DEBUG [JRL: what does this mean FND?]
		tiddlyweb.host = "http://tiddlyweb.peermore.com/wiki";
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		layer = new WireIt.Layer({ parentEl: canvas });
		var bags = tiddlyweb.loadBags();
		var bag;
		var pos = {
			x:0,
			y:0
		};
		for(var i=0;i<bags.length;i++) {
			bag = bags[i];
			pos = calculateVerticalLayout(i,{x:10,y:0},250);
			addBag({ name: bag, pos_x: pos.x, pos_y: pos.y}, layer);
		}
		var recipes = tiddlyweb.loadRecipes();
		var recipe;
		for(i=0;i<recipes.length;i++) {
			recipe = recipes[i];
			pos = calculateVerticalLayout(i,{x:10,y:400},150);
			addRecipe({ name: recipe, pos_x: pos.x, pos_y: pos.y }, layer);
		}
		layer.initContainers();
	} catch(e) {
		console.log(e);
	}
}

YAHOO.util.Event.onDOMReady(init);
