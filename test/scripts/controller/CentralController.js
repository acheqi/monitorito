QUnit.module( "controller.CentralController", {
	beforeEach: function() {
		var interfaceHandler = new InterfaceHandler();
		this.mockInterfaceHandler = sinon.mock(interfaceHandler);

		var monitoringService = new MonitoringService(new EventSource());
		this.mockMonitoringService = sinon.mock(monitoringService);

		var visNetwork = sinon.createStubInstance(vis.Network);
		var graph = new Graph(visNetwork);
		var graphHandler = new GraphHandler(graph);
		this.mockGraphHandler = sinon.mock(graphHandler);

		var storageService = new ChromeStorageService({clear: function(){}, get: function(){}, set: function(){}});
		this.mockStorageService = sinon.mock(storageService);

		this.controller = new CentralController(interfaceHandler, monitoringService, graphHandler, storageService);
	}
});

QUnit.test("addRequestToGraph(), addRedirectToGraph() methods", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);
	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());

	mockGraphHandler.expects("addRequest").exactly(1).withArgs(rootRequest, request);
	mockGraphHandler.expects("addRedirect").exactly(1).withArgs(redirect);

	controller.addRequestToGraph(rootRequest, request);
	controller.addRedirectToGraph(redirect);

	mockGraphHandler.verify();
});

QUnit.test("enableMonitoring(), disableMonitoring() methods", function(assert) {
	var controller = this.controller;
	var mockMonitoringService = this.mockMonitoringService;

	mockMonitoringService.expects("enable").exactly(1);
	mockMonitoringService.expects("disable").exactly(1);

	controller.enableMonitoring();
	controller.disableMonitoring();

	mockMonitoringService.verify();
});

QUnit.test("extractMonitoredData()", function(assert) {
	var controller = this.controller;
	var mockMonitoringService = this.mockMonitoringService;
	var mockStorageService = this.mockStorageService;

	var mockSessions = new Object();
	var mockRedirects = new Object();

	mockMonitoringService.expects("archiveRemainingData").once();
	mockStorageService.expects("extractData").once();

	var monitoredData = controller.extractMonitoredData();

	mockMonitoringService.verify();
	mockStorageService.verify();
});

QUnit.test("getGraphStatistics(), getGraphNodeMetrics() methods", function(assert) {
	var mockGraphHandler = this.mockGraphHandler;
	var controller = this.controller;
	var stubNode = sinon.createStubInstance(Node);

	mockGraphHandler.expects("getGraphStatistics").exactly(1);
	mockGraphHandler.expects("getGraphNodeMetrics").exactly(1).withArgs(stubNode);

	controller.getGraphStatistics();
	controller.getGraphNodeMetrics(stubNode);

	mockGraphHandler.verify();
});

QUnit.test("enableGraphPhysics(), disableGraphPhysics() methods", function(assert) {
	var mockGraphHandler = this.mockGraphHandler;
	var controller = this.controller;

	mockGraphHandler.expects("enableGraphPhysics").exactly(1);
	mockGraphHandler.expects("disableGraphPhysics").exactly(1);

	controller.enableGraphPhysics();
	controller.disableGraphPhysics();

	mockGraphHandler.verify();
});

QUnit.test("storeSession(), storeRedirect() methods", function(assert) {
	var mockStorageService = this.mockStorageService;
	var controller = this.controller;

	var session = sinon.createStubInstance(Session);
	var redirect = sinon.createStubInstance(Redirect);

	mockStorageService.expects("storeSession").once().withExactArgs(session);
	mockStorageService.expects("storeRedirect").once().withExactArgs(redirect);

	controller.storeSession(session);
	controller.storeRedirect(redirect);

	mockStorageService.verify();
});