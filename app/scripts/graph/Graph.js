"use strict";

function Graph(visualisationNetwork) {
	this._edgesAutoIncrement = 1;
	this._observers = [];

	this.nodes = {};
	this.edges = {};

	if(visualisationNetwork != null) {
		this.buildGraphWithVisualisation(visualisationNetwork);
		this.mode = Graph.Mode.ONLINE;
	}
	else this.mode = Graph.Mode.OFFLINE;
}

Graph.Mode = {
	ONLINE: "Online",
	OFFLINE: "Offline"
}

Graph.prototype.buildGraphWithVisualisation = function(visualisationNetwork) {
	this._network = visualisationNetwork;

	this._setupListeners();
	this._network._selectEdgeCallback = function(selectedEdge){};
	this._network._selectNodeCallback = function(selectedNode){};
	this._network._deselectEdgeCallback = function(deselectedEdges){};
	this._network._deselectNodeCallback = function(deselectedNodes){};
}



Graph.prototype.disablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: disablePhysics() called for graph without visualisation");
	else this._network.setOptions({physics: {enabled: false}});
}

Graph.prototype.enablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: enablePhysics() called for graph without visualisation");
	else this._network.setOptions({physics: {enabled: true}});
}

Graph.prototype.register = function(observer) {
	this._observers.push(observer);
}

Graph.prototype.notifyForNewNode = function(node) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNewNode(node);
}

Graph.prototype.notifyForNodeChange = function(fromType, toType, node) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNodeChange(fromType, toType, node);
}

Graph.prototype.notifyForNewEdge = function(edge) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onNewEdge(edge);
}

Graph.prototype.notifyForEdgeChange = function(fromType, toType, edge) {
	for(var i=0; i < this._observers.length; i++) this._observers[i].onEdgeChange(fromType, toType, edge);
}

Graph.prototype.createEdge = function(fromHostname, toHostname) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	var edge = new Edge(this._edgesAutoIncrement++, fromNode, toNode, this, this.mode == Graph.Mode.ONLINE ? this._network.body.data.edges : null);
	this.edges[edge.id] = edge;
	this.notifyForNewEdge(edge);
}

Graph.prototype.getEdge = function(fromHostname, toHostname) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	return fromNode.hasEdgeTo(toNode) ? fromNode.getEdgeTo(toNode) : null;
}

Graph.prototype.existsEdge = function(fromHostname, toHostname) {
	return this.getEdge(fromHostname, toHostname) != null;
}

Graph.prototype.createNode = function(hostname) {
	var node = new Node(hostname, this, this.mode == Graph.Mode.ONLINE ? this._network.body.data.nodes : null);
	this.nodes[hostname] = node;
	this.notifyForNewNode(node);
}

Graph.prototype.getNode = function(hostname) {
	return (hostname in this.nodes) ? this.nodes[hostname] : null;
}

Graph.prototype.existsNode = function(hostname) {
	return hostname in this.nodes;
}

Graph.prototype.addRequestToEdge = function(fromURL, toURL) {
	var edge = this.getEdge(Util.getUrlHostname(fromURL), Util.getUrlHostname(toURL));
	edge.addRequest(fromURL, toURL);
}

Graph.prototype.addRequestToNode = function(request) {
	var node = this.nodes[Util.getUrlHostname(request.url)];
	node.addRequest(request);
}

Graph.prototype.addRedirectToEdge = function(fromURL, toURL) {
	var edge = this.getEdge(Util.getUrlHostname(fromURL), Util.getUrlHostname(toURL));
	edge.addRedirect(fromURL, toURL);
}

Graph.prototype.addReferralToEdge = function(fromURL, toURL) {
	var edge = this.getEdge(Util.getUrlHostname(fromURL), Util.getUrlHostname(toURL));
	edge.addReferral(fromURL, toURL);
}

Graph.prototype.onSelectNode = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onSelectNode() called for graph without visualisation");
	else this._network._selectNodeCallback = callbackFunction;
}

Graph.prototype.onSelectEdge = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onSelectEdge() called for graph without visualisation");
	else this._network._selectEdgeCallback = callbackFunction;
}

Graph.prototype.onDeselectNode = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onDeselectNode() called for graph without visualisation");
	else this._network._deselectNodeCallback = callbackFunction;
}

Graph.prototype.onDeselectEdge = function(callbackFunction) {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: onDeselectEdge() called for graph without visualisation");
	else this._network._deselectEdgeCallback = callbackFunction;
}

Graph.prototype._setupListeners = function() {
	if(this.mode == Graph.Mode.OFFLINE) console.log("Error: _setupListeners() called for graph without visualisation");
	else {
		var graph = this;
		this._network.on("select", function(eventParams) {
			if(eventParams.nodes.length == 1) {//Node Selected
				var selectedNode = graph.nodes[eventParams.nodes[0]];
				this._selectNodeCallback(selectedNode);
			}
			else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1) {//Edge Selected
				var selectedEdge = graph.edges[eventParams.edges[0]];
				this._selectEdgeCallback(selectedEdge);
			}
		});

		this._network.on("deselectNode", function(eventParams) {
			var previousSelection = eventParams.previousSelection;
			if(previousSelection.nodes.length == 1) {//Only in node deselections
				var deselectedNodes = previousSelection.nodes;
				this._deselectNodeCallback(deselectedNodes);
			}
		});

		this._network.on("deselectEdge", function(eventParams) {
			var previousSelection = eventParams.previousSelection;
			if(previousSelection.nodes.length == 0 && previousSelection.edges.length == 1) {//Only in edge deselections
				var deselectedEdges = previousSelection.edges;
				this._deselectEdgeCallback(deselectedEdges);
			}
		});
	}
}

Graph.prototype.filterNodes = function(callbackFunction) {
	var filteredNodes = [];
	for(var hostnameKey in this.nodes) {
		var node = this.nodes[hostnameKey];
		if(callbackFunction(node)) filteredNodes.push(node);
	}
	return filteredNodes;
}