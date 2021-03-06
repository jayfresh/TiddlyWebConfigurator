var layer = null;

/* LOAD FROM TIDDLYWEB */

function lookupModule(matchObj,layer) {
	var container;
	var match;
	var matchObjects = function(obj1,obj2) {
		for(var n in obj1) {
			if(obj1.hasOwnProperty(n)) {
				// ignore functions
				if(typeof obj1[n]!=='function' && obj2[n]) {
					if(typeof obj1[n]==='object') { // catches arrays and objects
						if(!arguments.callee(obj1[n],obj2[n])) {
							return false;
						}
					} else {
						if(obj2[n]!==obj1[n]) {
							return false;
						}
					}				
				}
			}
		}
		return true;
	};
	for(var i=0;i<layer.containers.length;i++) {
		container = layer.containers[i];
		match = null;
		if(matchObjects(matchObj,container)) {
			match = i;
			break;
		}
	}
	return match;
}

function loadFromTiddlyWeb() {
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
					var recipeBags = recipeObj.recipe;
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
						bag = recipeBags[i][0];
						bagId = lookupModule({
							type:'bag',
							options: {
								title:bag
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
}

/* end of LOAD FROM TIDDLYWEB */

/* ADDING MODULES */

// n runs from 0 to N-1, where N is the number of items to be laid out
function calculateVerticalLayout(n,offset,height) {
	if(!offset) {
		offset = {x:0,y:0};
	}
	var pos = {
		x:offset.x,
		y:offset.y
	};
	if(!height) {
		height = 100;
	}
	pos.y += n*height;
	return pos;
}

function addBag(bag, layer) {
	bag = YAHOO.lang.merge(bag, { type: "bag" });
	return addContainer(bag, layer);
}

function addRecipe(recipe, layer) {
	recipe = YAHOO.lang.merge(recipe, { type: "recipe" });
	return addContainer(recipe, layer);
}

function addContainer(obj, layer) {
	var x = obj.pos_x || 0;
	var y = obj.pos_y || 0;
	var permissions = ["write", "create", "delete", "manage", "accept"];
	var container = {
		xtype: "WireIt.InOutContainer",
		inputs: obj.type == "bag" ? permissions : ["tiddlers"],
		outputs: [obj.type == "bag" ? "tiddlers" : "document"],
		title: obj.name,
		position: [x, y],
		close: false
	};
	container = layer.addContainer(container);
	container.type = obj.type;
	var el = container.el;
	el.title = obj.desc || ""; // XXX: don't use title? -- XXX: use setAttribute?
	YAHOO.util.Dom.addClass(el, obj.type);
	return container;
}

/* ADDING MODULES */

/* AUTO-RESIZE OF InOut MODULES */

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

/* end of AUTO-RESIZE OF InOut MODULES */

/* SAVING TO TIDDLYWEB */

function configure() {
	var v = getValue(layer);
	var tw = convertFromWorkingToTiddlyWeb(v.working);
	saveEntities(tw.bags, tw.recipes);
}

function saveEntities(bags, recipes) {
	for(var bag in bags) {
		this.saveBag(bag, tw.bags[bag]);
	}
	for(var recipe in recipes) {
		// add filters
		recipe = recipe.map(function(item, i) {
			return [item, ""];
		});
		this.saveRecipe(recipe, tw.recipes[recipe]);
	}
}

// mainly nicked from WiringEditor.js
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

/* end of SAVING TO TIDDLYWEB */
