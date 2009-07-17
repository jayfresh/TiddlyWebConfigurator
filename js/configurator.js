// mainly nicked from WiringEditor
function getValue(layer) {
   var i;
   var obj = {modules: [], wires: []};
   for (i=0; i<layer.containers.length; i++) {
      obj.modules.push( {name: layer.containers[i].options.title, type: layer.containers[i].type, value: layer.containers[i].getValue(), config: layer.containers[i].getConfig()});
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

var layer = null;
YAHOO.util.Event.onDOMReady(function() {
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
});

function configure() {
	var v = getValue(layer);
	var tw = convertFromWorkingToTiddlyWeb(v);
	console.log(v);
	console.log(tw);
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
	offsetPosition.top = 3+30*(i+1);
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
	var permissions = ["write", "create", "delete", "manage", "accept"];
	var container = {
		xtype: "WireIt.InOutContainer",
		inputs: obj.type == "bag" ? permissions : ["tiddlers"],
		outputs: [obj.type == "bag" ? "tiddlers" : "document"],
		title: obj.name,
		position: [x, y]
	};
	container = layer.addContainer(container);
	container.type = obj.type;
	var el = container.el;
	el.title = obj.desc || ""; // XXX: don't use title? -- XXX: use setAttribute?
	YAHOO.util.Dom.addClass(el, obj.type);
	return container;
}

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
function convertFromWorkingToTiddlyWeb(working) {
	var tiddlyweb = {
		bags: {},
		recipes: {}
	};
	// modules -> nodes
	var module = {};
	var nodes = {};
	for(var i=0;i<working.modules.length;i++) {
		module = working.modules[i];
		name = module.name;
		nodes[name] = {
			type:module.type,
			inputs:{},
			outputs:{}
		};
	}
	// wires -> edges
	var wire = {};
	var to_node, to_channel, from_node, from_channel;
	for(i=0;i<working.wires.length;i++) {
		wire = working.wires[i];
		to_node = working.modules[wire.tgt.moduleId].name;
		to_channel = wire.tgt.terminal;
		from_node = working.modules[wire.src.moduleId].name;
		from_channel = wire.src.terminal;
		if(!nodes[to_node].inputs[to_channel]) {
			nodes[to_node].inputs[to_channel] = [];
		}
		nodes[to_node].inputs[to_channel].push(from_node);
	}
	// nodes -> bags, recipes
	var node;
	var bag, recipe;
	for(i in nodes) {
		node = nodes[i];
		var j;
		switch(node.type) {
			case "bag":
				bag = {};
				// for each role attached to my various terminals, push the name into the appropriate property's array
				/*
					"write": ["GUEST",...],
					"create": ["GUEST",...],
					"delete": ["GUEST",...],
					"manage": ["GUEST",...],
					"accept": ["GUEST",...]
				*/
				for(j in node.inputs) {
					bag[j] = node.inputs[j];
				}
				tiddlyweb.bags[name] = bag;
				break;
			case "recipe":
				recipe = [];
				// for each bag connected to me, push the name into recipe
				for(j in node.inputs) {
					for(var k=0; k<node.inputs[j].length; k++) {
						recipe.push(node.inputs[j][k]);	
					}
				}
				tiddlyweb.recipes[name] = recipe;
				break;
		}
	}
}