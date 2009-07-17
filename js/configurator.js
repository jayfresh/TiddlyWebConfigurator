// mainly nicked from WiringEditor
function getValue(layer) {
   var i;
   var obj = {modules: [], wires: []};
   for (i=0; i<layer.containers.length; i++) {
      obj.modules.push( {name: layer.containers[i].options.title, value: layer.containers[i].getValue(), config: layer.containers[i].getConfig()});
   }
   for(i=0; i<layer.wires.length; i++) {
      var wire = layer.wires[i];
      var wireObj = {
         src: {moduleId: WireIt.indexOf(wire.terminal1.container, layer.containers), terminal: wire.terminal1.options.name},
         tgt: {moduleId: WireIt.indexOf(wire.terminal2.container, layer.containers), terminal: wire.terminal2.options.name}
      };
      obj.wires.push(wireObj);
   }
   return {
      working: obj
   };
}

YAHOO.util.Event.onDOMReady(function() {
	try { // XXX: DEBUG
		var canvas = document.getElementById("canvas"); // TODO: use YUI selector?
		var layer = new WireIt.Layer({ parentEl: canvas });
		addBag({ name: "Foo" }, layer);
		addBag({ name: "Bar" }, layer);
		addRecipe({ name: "Baz" }, layer);
		layer.initContainers();
	} catch(e) {
		console.log(e);
	}
});

function configure() {
	var v = getValue(layer);
	console.log(v);
}

function addExtraInput(container,name) {
	addExtraTerminal(container,name,"input");
}

function addExtraOutput(container,name) {
	addExtraTerminal(container,name,"output");
}

// defaults to adding an input
function addExtraTerminal(container,name,type) {
	if(type!=="input" && type!=="output") {
		return false;
	}
	if(!name) {
		return false;
	}
	var i = container.terminals.length;
	var notType = type === "output" ? "input" : "output";
	var direction = type === "output" ? [-1,0] : [1,0];
	var align = type === "output" ? "right" : "left";
	var offsetPosition = {};
	offsetPosition[align] = -14;
	offsetPosition["top"] = 3+30*(i+1);
	container.options.terminals.push({
		"name": name,
		"direction": direction,
		"offsetPosition": offsetPosition,
		"ddConfig": {              
			"type": type,              	
			"allowedTypes": [notType]
		},
		"alwaysSrc": true
	});
	container.bodyEl.appendChild(WireIt.cn('div', null, {lineHeight: "30px", textAlign: align}, name));
	container.addTerminal(container.options.terminals[container.options.terminals.length-1]);
}

function addBag(bag, layer) {
	bag = {
		type: "bag",
		name: bag.name,
		pos_x: bag.pos_x,
		pos_y: bag.pos_y
	}; // TODO: merge recipe object into { type: "bag" }
	return addEntity(bag, layer);
}

function addRecipe(recipe, layer) {
	recipe = {
		type: "recipe",
		name: recipe.name,
		pos_x: recipe.pos_x,
		pos_y: recipe.pos_y
	}; // TODO: merge recipe object into { type: "recipe" }
	return addEntity(recipe, layer);
}

function addEntity(obj, layer) {
	var x = obj.pos_x || 0;
	var y = obj.pos_y || 0;
	var container = {
		xtype: "WireIt.InOutContainer",
		inputs: ["write", "create", "delete", "manage", "accept"],
		outputs: [obj.type == "bag" ? "tiddlers" : "document"],
		title: obj.name,
		position: [x, y]
	};
	container = layer.addContainer(container);
	var el = container.el;
	el.title = obj.desc || ""; // XXX: don't use title? -- XXX: use setAttribute?
	YAHOO.util.Dom.addClass(el, obj.type);
	return container;
}
