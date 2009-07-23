function init() {
	try { // XXX: DEBUG
		tiddlyweb.host = "http://tiddlyweb.peermore.com/wiki";
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		layer = new WireIt.Layer({ parentEl: canvas });
		loadFromTiddlyWeb();
	} catch(e) {
		console.log(e);
	}
}

YAHOO.util.Event.onDOMReady(init);
