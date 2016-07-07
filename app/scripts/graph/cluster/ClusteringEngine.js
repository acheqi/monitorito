"use strict";

function ClusteringEngine(graph) {
	this.graph = graph;

	this.clusters = {};

	this.subdomainsRegExp = "^((.+[.])?)(domains)$";
}


ClusteringEngine.prototype.clusterByDomain = function(domains, clusterID) {
	if(clusterID.trim() == "") throw new Error("Cluster ID field is empty! You have to provide a value.");
	if(clusterID in this.clusters) throw new Error("Cluster ID '" + clusterID + "' already exists. Cluster could not be created, because Cluster ID should be unique.");

	var regExp = new RegExp(this.subdomainsRegExp.replace("domains", domains.join("|")));
	var nodes = this.graph.getDomainNodes();
	var clusteredNodes = [];


	for(var i = 0; i < nodes.length; i++) {
		if(regExp.test(nodes[i].getDomain()))
			clusteredNodes.push(nodes[i]);
	}
	this.disallowNestedClustering(clusteredNodes);

	if(clusteredNodes.length > 1) {
		var cluster = new Cluster(clusterID, this.graph, clusteredNodes);
		this.clusters[clusterID] = cluster;
	}
	else {
		var errorMessage = "Only " + clusteredNodes.length + " nodes matched. More than 1 nodes needed to create a cluster.";
		throw new Error(errorMessage);
	}

}

ClusteringEngine.prototype.disallowNestedClustering = function(clusteredNodes) {
	for(var key in this.clusters) {
		var cluster = this.clusters[key];
		for(var i = 0; i < clusteredNodes.length; i++) {
			if(cluster.containsNode(clusteredNodes[i]))
				throw new Error("Cluster '" + cluster.getID() + "' already contains one of the matched nodes('" + clusteredNodes[i].getID() + "'). De-cluster it first, if you want to create another cluster, containing it.");
		}
	}
}

ClusteringEngine.prototype.getCluster = function(clusterID) {
	if(clusterID in this.clusters) return this.clusters[clusterID];
	else return null;
}

ClusteringEngine.prototype.deCluster = function(clusterID) {
	var cluster = this.clusters[clusterID];
	this.graph.triggerDeselectNode(cluster);
	cluster.delete();
	delete this.clusters[clusterID];
}

ClusteringEngine.prototype.deClusterAll = function() {
	var clusters = this.getClusters();
	for(var i = 0; i < clusters.length; i++) this.deCluster(clusters[i].getID());
}

ClusteringEngine.prototype.isClusterEdge = function(ID) {
	return ID.search("clusterEdge") >= 0;
}

ClusteringEngine.prototype.getClusters = function() {
	var clusters = [];
	for(var key in this.clusters)
		clusters.push(this.clusters[key]);
	return clusters;
}