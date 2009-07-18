var layer = null;

function configure() {
	var v = getValue(layer);
	var tw = convertFromWorkingToTiddlyWeb(v.working);
	tiddlyweb.saveEntities(tw);
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
	var alwaysSrc = type === "output" ? true : false;
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
		"alwaysSrc": alwaysSrc
	});
	container.bodyEl.appendChild(WireIt.cn('div', null, {lineHeight: "30px", textAlign: align}, name));
	container.addTerminal(container.options.terminals[container.options.terminals.length-1]);
}

function addBag(bag, layer) {
	bag = YAHOO.lang.merge(bag, { type: "bag" });
	return addEntity(bag, layer);
}

function addRecipe(recipe, layer) {
	recipe = YAHOO.lang.merge(recipe, { type: "recipe" });
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
		if(!nodes[from_node].outputs[from_channel]) {
			nodes[from_node].outputs[from_channel] = [];
		}
		nodes[from_node].outputs[from_channel].push(to_node);
	}
	console.log('nodes with wires',nodes);
	// nodes -> bags, recipes
	var tiddlyweb = {
		bags: {},
		recipes: {}
	};
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
				tiddlyweb.bags[i] = bag;
				break;
			case "recipe":
				recipe = [];
				// for each bag connected to me, push the name into recipe
				for(j in node.inputs) {
					for(var k=0; k<node.inputs[j].length; k++) {
						recipe.push(node.inputs[j][k]);	
					}
				}
				tiddlyweb.recipes[i] = recipe;
				break;
		}
	}
	return tiddlyweb;
}
