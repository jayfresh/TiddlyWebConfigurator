function init() {
	try { // XXX: DEBUG
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		layer = new WireIt.Layer({ parentEl: canvas });
		addBag({ name: "public" }, layer);
		addBag({ name: "editors" }, layer);
		addBag({ name: "system" }, layer);
		addBag({ name: "team" }, layer);
		addRecipe({ name: "website" }, layer);
		addRecipe({ name: "CMS" }, layer);
		addRecipe({ name: "wiki" }, layer);
		layer.initContainers();
	} catch(e) {
		console.log(e);
	}
}

YAHOO.util.Event.onDOMReady(init);
