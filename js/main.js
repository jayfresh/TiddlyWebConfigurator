function init() {
	try { // XXX: DEBUG
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		layer = new WireIt.Layer({ parentEl: canvas });
		addBag({ name: "public", pos_x: 10, pos_y: 0 }, layer);
		addBag({ name: "editors", pos_x: 10, pos_y: 250 }, layer);
		addBag({ name: "system", pos_x: 10, pos_y: 500 }, layer);
		addBag({ name: "team", pos_x: 10, pos_y: 750 }, layer);
		addRecipe({ name: "website", pos_x: 400, pos_y: 250 }, layer);
		addRecipe({ name: "CMS", pos_x: 400, pos_y: 400 }, layer);
		addRecipe({ name: "wiki", pos_x: 400, pos_y: 550 }, layer);
		layer.initContainers();
	} catch(e) {
		console.log(e);
	}
}

YAHOO.util.Event.onDOMReady(init);
