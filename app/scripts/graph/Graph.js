"use strict";

function Graph(visualisationNetwork) {
	this._edgesAutoIncrement = 1;
	this._observers = [];

	this.nodes = {};
	this.edges = {};

	if(visualisationNetwork != null) {
		this.visualisationNetwork = visualisationNetwork;
		this.visualisationNetwork.setupListeners(this);
		this.mode = Graph.Mode.ONLINE;
	}
	else this.mode = Graph.Mode.OFFLINE;
}

Graph.Mode = {
	ONLINE: "Online",
	OFFLINE: "Offline"
}

Graph.prototype.setClusteringEngine = function(clusteringEngine) {
	this.clusteringEngine = clusteringEngine;
}

Graph.prototype.disablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("disablePhysics() called for graph without visualisation");
	else this.visualisationNetwork.disablePhysics();
}

Graph.prototype.enablePhysics = function() {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("enablePhysics() called for graph without visualisation");
	else this.visualisationNetwork.enablePhysics();
}

Graph.prototype.addListeners = function(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn) {
	if(this.mode == Graph.Mode.OFFLINE) throw new Error("addListeners() called for graph without visualisation");
	else this.visualisationNetwork.addListeners(selectNodeFn, selectEdgeFn, deselectNodeFn, deselectEdgeFn);
}

Graph.prototype.createCluster = function(options) {
	this.visualisationNetwork.createCluster(options);
}

Graph.prototype.openCluster = function(clusterID) {
	this.visualisationNetwork.openCluster(clusterID);
}

Graph.prototype.triggerDeselectNode = function(node) {
	this.visualisationNetwork.triggerDeselectNode(node);
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
	var edge = new Edge(this._edgesAutoIncrement++, fromNode, toNode, this, this.mode == Graph.Mode.ONLINE ? this.visualisationNetwork.getEdgesDataset() : null);
	this.edges[edge.id] = edge;
	this.notifyForNewEdge(edge);
}

Graph.prototype.getEdges = function() {
	var edges = [];
	for(var key in this.edges) edges.push(this.edges[key]);
	return edges;
}

Graph.prototype.getEdgeBetweenNodes = function(fromHostname, toHostname) {
	var fromNode = this.getNode(fromHostname);
	var toNode = this.getNode(toHostname);
	return fromNode.hasEdgeTo(toNode) ? fromNode.getEdgeTo(toNode) : null;
}

Graph.prototype.getEdge = function(ID) {
	return (ID in this.edges) ? this.edges[ID] : null;
}

Graph.prototype.existsEdge = function(fromHostname, toHostname) {
	return this.getEdgeBetweenNodes(fromHostname, toHostname) != null;
}

Graph.prototype.createNode = function(hostname) {
	var node = new Node(hostname, this, this.mode == Graph.Mode.ONLINE ? this.visualisationNetwork.getNodesDataset() : null);
	this.nodes[hostname] = node;
	this.notifyForNewNode(node);
}

Graph.prototype.getNodes = function() {
	var nodes = [];
	for(var key in this.nodes) nodes.push(this.nodes[key]);
	return nodes;
}

Graph.prototype.getNode = function(ID) {
	return (ID in this.nodes) ? this.nodes[ID] : null;
}

Graph.prototype.existsNode = function(ID) {
	return ID in this.nodes;
}

Graph.prototype.addRequestToEdge = function(fromURL, request) {
	var edge = this.getEdgeBetweenNodes(Util.getUrlHostname(fromURL), Util.getUrlHostname(request.url));
	edge.addRequest(fromURL, request);
}

Graph.prototype.addRequestToNode = function(request) {
	var node = this.nodes[Util.getUrlHostname(request.url)];
	node.addRequest(request);
}

Graph.prototype.addRedirectToEdge = function(redirect) {
	var edge = this.getEdgeBetweenNodes(Util.getUrlHostname(redirect.getInitialURL()), Util.getUrlHostname(redirect.getFinalURL()));
	edge.addRedirect(redirect);
}

Graph.prototype.addReferralToEdge = function(fromURL, request) {
	var edge = this.getEdgeBetweenNodes(Util.getUrlHostname(fromURL), Util.getUrlHostname(request.url));
	edge.addReferral(fromURL, request);
}