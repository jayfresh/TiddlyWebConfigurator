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

var layer = null;
YAHOO.util.Event.onDOMReady( function() {
	var canvas = document.getElementById('canvas');
	layer = new WireIt.Layer({parentEl:canvas});
	layer.addContainer({
		xtype: "WireIt.InOutContainer",
		inputs: ["text1", "text2", "option1"], 
		outputs: ["result", "error"],
		title: "test",
		position: [0, 0],
		
	});
	layer.addContainer({
		xtype: "WireIt.InOutContainer",
		inputs: ["text1", "text2", "option1"], 
		outputs: ["result", "error"],
		title: "test2",
		position: [100, 100]
	});
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
