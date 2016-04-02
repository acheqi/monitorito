nodesAutoIncrement = 1;
edgesAutoIncrement = 1;
graph = {};

document.addEventListener("DOMContentLoaded", function(event) {
    var container = document.getElementById('graph');

    nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	var data = {
		nodes: nodes,
		edges: edges
	};
	var options = {};

	var network = new vis.Network(container, data, options);

	network.on("select", function(eventParams) {
		if(eventParams.nodes.length == 1) {		//only in node selections
			emptyEdgeStatistics();
			showNodeStatistics(eventParams);
		}
		else if(eventParams.nodes.length == 0 && eventParams.edges.length == 1) {	//only in edge selections
			emptyNodeStatistics();
			showEdgeStatistics(eventParams);
		}
	});

	network.on("deselectNode", function(eventParams) {
		var previousSelection = eventParams.previousSelection;
		if(previousSelection.nodes.length == 1) {		//only in node selections
			emptyNodeStatistics();
		}
	});

	network.on("deselectEdge", function(eventParams) {
		var previousSelection = eventParams.previousSelection;
		if(previousSelection.nodes.length == 0 && previousSelection.edges.length == 1) {	//only in edge selections
			emptyEdgeStatistics();
		}
	});

});

function showNodeStatistics(eventParams) {
	nodeId = eventParams.nodes[0];
	node = nodes.get(nodeId);

	document.getElementById('node_domain').innerHTML = node.title;

	var requestsList = document.getElementById('node_requests');
	for(var i=0; i < node.requests.length; i++) {
		var entry = document.createElement('li');
		var link = document.createElement('a');
		link.setAttribute("href", node.requests[i]);
		link.setAttribute("title", node.requests[i]);
		link.setAttribute("target", "_blank");
		link.innerHTML = "Request " + (i+1);
		entry.appendChild(link);
		requestsList.appendChild(entry);
	}
}

function showEdgeStatistics(eventParams) {
	edgeId = eventParams.edges[0];
	edge = edges.get(edgeId);

	fromNode = nodes.get(edge.from);
	toNode = nodes.get(edge.to);

	document.getElementById('edge_type').innerHTML = edge.type;
	document.getElementById('edge_from').innerHTML = fromNode.title;
	document.getElementById('edge_to').innerHTML = toNode.title;

	var requestsList = document.getElementById('edge_requests');
	for(var i=0; i < edge.links.length; i++) {
		var entry = document.createElement('li');
		var link1 = document.createElement('a');
		link1.setAttribute("href", edge.links[i].from);
		link1.setAttribute("title", edge.links[i].from);
		link1.setAttribute("target", "_blank");
		link1.innerHTML = "from";

		var span = document.createElement('span');
		span.innerHTML = " --> "

		var link2 = document.createElement('a');
		link2.setAttribute("href", edge.links[i].to);
		link2.setAttribute("title", edge.links[i].to);
		link2.setAttribute("target", "_blank");
		link2.innerHTML = "to";


		entry.appendChild(link1);
		entry.appendChild(span);
		entry.appendChild(link2);
		requestsList.appendChild(entry);
	}
}

function emptyNodeStatistics() {
	document.getElementById('node_domain').innerHTML = "";
		
	var requestsList = document.getElementById('node_requests');
	while(requestsList.firstChild) requestsList.removeChild(requestsList.firstChild);
}

function emptyEdgeStatistics() {
	document.getElementById('edge_type').innerHTML = "";
	document.getElementById('edge_from').innerHTML = "";
	document.getElementById('edge_to').innerHTML = "";

	var requestsList = document.getElementById('edge_requests');
	while(requestsList.firstChild) requestsList.removeChild(requestsList.firstChild);
}

function addRequestNode(rootRequest, request) {
	var parsedRootRequestUrl = parseURL(rootRequest);
	var parsedRequestUrl = parseURL(request.url);

	if(!(parsedRequestUrl.hostname in graph)) {
		createGraphNode(parsedRequestUrl, request.type == "main_frame");
	}
	else {
		addRequestToNode(parsedRequestUrl);
	}

	if(!sameDomain(parsedRootRequestUrl, parsedRequestUrl)) {
		if(!existsEdge(parsedRootRequestUrl, parsedRequestUrl)) {
			createDependencyEdge(parsedRootRequestUrl, parsedRequestUrl);
		}
	}

}

function createGraphNode(parsedRequestUrl, isRootRequest) {
	var nodeSize = isRootRequest ? 40 : 20;
	var faviconURL = "http://www.google.com/s2/favicons?domain=" + parsedRequestUrl.host;
	nodes.add({
		id: nodesAutoIncrement, 
		shape: 'circularImage', 
		size: nodeSize, 
		image: faviconURL,
		brokenImage: 'resources/img/default_node_img.jpg', 
		borderWidth: 5,
		'color.border': '#04000F',
		'color.highlight.border': '#CCC6E2', 
		title: parsedRequestUrl.hostname,
		requests: [parsedRequestUrl.text]
	});
	graph[parsedRequestUrl.hostname] = {ID: nodesAutoIncrement, adjacent: {}};
	nodesAutoIncrement++;
}

function existsEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	fromNodeAdjVertices = graph[fromParsedRequestUrl.hostname].adjacent;
	return toParsedRequestUrl.hostname in fromNodeAdjVertices;
}

function createDependencyEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, "dependency");
}

function createRedirectEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	createEdge(fromParsedRequestUrl, toParsedRequestUrl, "redirect");
}

function createEdge(fromParsedRequestUrl, toParsedRequestUrl, edgeType) {
	var fromNodeId = graph[fromParsedRequestUrl.hostname].ID;
	var toNodeId = graph[toParsedRequestUrl.hostname].ID;
	edges.add({
		id: edgesAutoIncrement,
		arrows: {
			to: {scaleFactor: 1}
		},
		from: fromNodeId,
		to: toNodeId,
		width: 3,
		dashes: edgeType == "redirect" ? true: false,
		type: edgeType,
		links: [{from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text}]
	})
	graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname] = {edge: edgesAutoIncrement};
	edgesAutoIncrement++;
}

function addLinkToEdge(fromParsedRequestUrl, toParsedRequestUrl) {
	var edgeId = graph[fromParsedRequestUrl.hostname].adjacent[toParsedRequestUrl.hostname].edge;
	edges.get(edgeId).links.push({from: fromParsedRequestUrl.text, to: toParsedRequestUrl.text});
}

function addRequestToNode(parsedRequestUrl) {
	var nodeID = graph[parsedRequestUrl.hostname].ID;
	nodes.get(nodeID).requests.push(parsedRequestUrl.text);
}

function sameDomain(parsedRootRequestUrl, parsedRequestUrl) {
	return parsedRootRequestUrl.hostname == parsedRequestUrl.hostname;
}