"use strict";

function CentralController(interfaceHandler, monitoringService, graphHandler) {
	this.interfaceHandler = interfaceHandler;
	this.monitoringService = monitoringService;
	this.graphHandler = graphHandler;
}

CentralController.prototype.addRequestToGraph = function(httpRootRequest, httpCurrentRequest) {
	this.graphHandler.addRequest(httpRootRequest, httpCurrentRequest);
}

CentralController.prototype.addRedirectToGraph = function(redirect) {
	this.graphHandler.addRedirect(redirect);
}

CentralController.prototype.enableMonitoring = function() {
	this.monitoringService.enable();
}

CentralController.prototype.disableMonitoring = function() {
	this.monitoringService.disable();
}

CentralController.prototype.getGraphStatistics = function() {
	return this.graphHandler.graphStatsCalculator.getStatistics();
}

CentralController.prototype.getNodeMetrics = function(node) {
	return this.graphHandler.graphStatsCalculator.getNodeMetrics(node);
}

CentralController.prototype.disableGraphPhysics = function() {
	this.graphHandler.disableGraphPhysics();
}

CentralController.prototype.enableGraphPhysics = function() {
	this.graphHandler.enableGraphPhysics();
}