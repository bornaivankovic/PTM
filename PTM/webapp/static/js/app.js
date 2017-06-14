(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AjaxController = (function () {
    function AjaxController() {
    }
    AjaxController.prototype.dijkstraCalculation = function (username, password, start, end, t, nodes, links) {
        if (start == 'Network' || end == 'Network') {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, t: t });
        }
        else {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, start: start, end: end, t: t });
        }
        return $.ajax({
            url: 'http://localhost:8000/dijkstra',
            method: 'POST',
            async: false,
            context: this,
            data: jsonTopology,
            success: function (data) {
            },
            error: function (data) {
                console.log(data);
            }
        });
    };
    AjaxController.prototype.abrahamCalculation = function (username, password, start, end, t, nodes, links) {
        if (start == 'Network' || end == 'Network') {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, t: t });
        }
        else {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, start: start, end: end, t: t });
        }
        return $.ajax({
            url: 'http://localhost:8000/nodepair',
            method: 'POST',
            context: this,
            async: false,
            data: jsonTopology,
            success: function (data) {
            },
            error: function (data) {
                console.log(data);
            }
        });
    };
    AjaxController.prototype.signup = function (username, password) {
        var jsonSignup = JSON.stringify({ username: username, password: password });
        $.ajax({
            url: 'http://localhost:8000/signup',
            method: 'POST',
            context: this,
            data: jsonSignup,
            success: function (data) {
                console.log(data);
                if (data.user == "wrong_password") {
                    $('.form-validation-error').show();
                    return false;
                }
                else if (data.user == "valid" || data.user == "created") {
                    $('.form-validation-success').show();
                    setTimeout(function () {
                        $('#login-modal').modal('hide');
                    }, 1000);
                }
            },
            error: function (data) {
                $('.form-validation-error').show();
            }
        });
    };
    return AjaxController;
}());
exports.AjaxController = AjaxController;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./models/node");
var edge_1 = require("./models/edge");
var ajax_controller_1 = require("./controllers/ajax.controller");
var topology_1 = require("./models/topology");
var FileSaver = require("file-saver");
var nodes = new Array();
var edges = new Array();
var topology = new topology_1.Topology();
var isNodeSelected = false;
var network;
var globalUsername = '';
var globalPassword = '';
var globalResultDijkstra;
var globalResultAbraham;
var visnodes;
var visedges;
function renderTopology() {
    var container = document.getElementById('network');
    visnodes = new vis.DataSet(nodes);
    visedges = new vis.DataSet(edges);
    var data = {
        nodes: visnodes,
        edges: visedges
    };
    topology.setNodes(nodes);
    topology.setEdges(edges);
    var options = {
        nodes: {
            shape: 'dot',
            size: 30,
            color: {},
            physics: false
        },
        edges: {
            physics: false,
            width: 2,
            length: 10
        },
        layout: {
            randomSeed: 2
        },
        manipulation: {
            initiallyActive: true,
            addNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Add Node";
                editNode(data, callback);
            },
            editNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Edit Node";
                editNode(data, callback);
            },
            addEdge: function (data, callback) {
                if (data.from == data.to) {
                    var r = confirm("Do you want to connect the node to itself?");
                    if (r != true) {
                        callback(null);
                        return;
                    }
                }
                document.getElementById('edge-operation').innerHTML = "Add Edge";
                editEdgeWithoutDrag(data, callback);
            },
            editEdge: {
                editWithoutDrag: function (data, callback) {
                    document.getElementById('edge-operation').innerHTML = "Edit Edge";
                    editEdgeWithoutDrag(data, callback);
                }
            }
        }
    };
    // initialize your network!
    network = new vis.Network(container, data, options);
    registerEvent(network);
}
function editNode(data, callback) {
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelNodeEdit.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}
function registerEvent(data) {
    data.on("select", function (params) {
        console.log(params);
        if (params.nodes.length == 0 && params.edges.length != 0) {
            var edge = topology.getEdgeById(params.edges['0']);
            document.getElementById('event-catcher').innerHTML = '<h2>Edge</h2>' + '<p><span>Label: </span>' + params.edges + '</p>'
                + '<p><span>Failure rate:</span> ' + edge.getFailureRate() + '</p>'
                + '<p><span>Repair rate: </span>' + edge.getRepairRate() + '</p>';
        }
        else if (params.nodes.length > 0) {
            var node = topology.getNodeById(params.nodes['0']);
            document.getElementById('event-catcher').innerHTML = '<h2>Node</h2>' + '<p><span>Label: </span>' + params.nodes + '</p>'
                + '<p><span>Edges: </span>' + params.edges + '</p>'
                + '<p><span>Failure rate: </span>' + node.getFailureRate() + '</p>'
                + '<p><span>Repair rate: </span>' + node.getRepairRate() + '</p>';
        }
        else if (params.nodes.length == 0 && params.edges.length == 0) {
            document.getElementById('event-catcher').innerHTML = "";
        }
    });
}
function clearNodePopUp() {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
}
function cancelNodeEdit(callback) {
    clearNodePopUp();
    callback(null);
}
function saveNodeData(data, callback) {
    data.label = document.getElementById('node-label').value;
    data.id = document.getElementById('node-id').value;
    data.failureRate = Number(document.getElementById('node-failureRate').value);
    data.repairRate = Number(document.getElementById('node-repairRate').value);
    clearNodePopUp();
    var tempNode = new node_1.Node(data.label, data.id, data.failureRate, data.repairRate);
    nodes.push(tempNode);
    callback(data);
    $('.calculation-container').append("<div class='success-msg-green'>Node added...</div>");
}
function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    document.getElementById('edge-label').value = data.label;
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}
function clearEdgePopUp() {
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';
}
function cancelEdgeEdit(callback) {
    clearEdgePopUp();
    callback(null);
}
function saveEdgeData(data, callback) {
    if (typeof data.to === 'object')
        data.to = data.to.id;
    if (typeof data.from === 'object')
        data.from = data.from.id;
    data.label = document.getElementById('edge-label').value;
    data.id = document.getElementById('edge-id').value;
    data.failureRate = Number(document.getElementById('edge-failureRate').value);
    data.repairRate = Number(document.getElementById('edge-repairRate').value);
    data.length = Number(document.getElementById('edge-length').value);
    var tempEdge = new edge_1.Edge(data.label, data.id, data.from, data.to, data.length, data.failureRate, data.repairRate);
    edges.push(tempEdge);
    clearEdgePopUp();
    callback(data);
    $('.calculation-container').append("<div class='success-msg-green'>Edge added...</div>");
}
function abrahamModal() {
    setSelectionOptions();
    $(document).on('click', '.calculate-abraham', function () {
        $('.calculation-container').append("<div class='success-msg-yellow'>Calculating using Abraham algorithm...</div>");
        $('.resultsAbraham').find('.panel-group').remove();
        var username = globalUsername;
        var password = globalPassword;
        var startNode = $('#start-node-abraham').val();
        var endNode = $('#end-node-abraham').val();
        var time = parseInt($('#time-abraham').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        globalResultAbraham = calcDijkstr.abrahamCalculation(username, password, startNode, endNode, time, nodes, edges);
        var resultIterator = 1;
        var result = globalResultAbraham.responseJSON.result;
        if (typeof globalResultAbraham.responseJSON.result.availability == 'object') {
            $('.resultsAbraham').append("<div class='panel-group green' id='accordion2' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbraham" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapseAbraham" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapseAbraham" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Availability(av): </span>" + result.availability.av + "</div>" + "<div><span>Availability(s,t): </span>" + result.availability["s,t"] + "</div>" + "<div><span>Reliablity(av): </span>" + result.reliability.av + "</div>" + "<div><span>Reliability(s,t): </span>" + result.reliability["s,t"] + "</div>" + "</div> </div> </div>");
        }
        else {
            $('.resultsAbraham').append("<div class='panel-group green' id='accordion2' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbraham" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapseAbraham" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapseAbraham" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Availability: </span>" + result.availability + "</div>" + "<div><span>Reliablity: </span>" + result.reliability + "</div>" + "</div> </div> </div>");
        }
        $('.calculation-container').append("<div class='success-msg-green'>Calculation done...</div>");
    });
}
function dijkstraModal() {
    setSelectionOptions();
    $(document).on('click', '.calculate', function () {
        $('.calculation-container').append("<div class='success-msg-yellow'>Calculating using Dijkstra algorithm...</div>");
        $('.results').find('.panel-group').remove();
        for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
            var edge = edges_1[_i];
            console.log();
            visedges.update([{ id: edge.getId(), color: '#97C2FC' }]);
        }
        var username = globalUsername;
        var password = globalPassword;
        var startNode = $('#start-node').val();
        var endNode = $('#end-node').val();
        var time = parseInt($('#time').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        globalResultDijkstra = calcDijkstr.dijkstraCalculation(username, password, startNode, endNode, time, nodes, edges);
        var resultIterator = 1;
        var primaryPath = globalResultDijkstra.responseJSON.result['0'].paths.path1.split("-");
        if (globalResultDijkstra.responseJSON.result['0'].paths.path2) {
            var secondaryPath = globalResultDijkstra.responseJSON.result['0'].paths.path2.split("-");
            var start_1 = 0;
            var end_1 = 1;
            for (var _a = 0, secondaryPath_1 = secondaryPath; _a < secondaryPath_1.length; _a++) {
                var colorPath = secondaryPath_1[_a];
                for (var _b = 0, edges_2 = edges; _b < edges_2.length; _b++) {
                    var edge = edges_2[_b];
                    if ((edge.getFrom() == secondaryPath[end_1] && edge.getTo() == secondaryPath[start_1] && end_1 <= edges.length) || (edge.getFrom() == secondaryPath[start_1] && edge.getTo() == secondaryPath[end_1] && end_1 <= edges.length)) {
                        console.log();
                        visedges.update([{ id: edge.getId(), color: 'green' }]);
                    }
                }
                start_1++;
                end_1++;
            }
        }
        var start = 0;
        var end = 1;
        for (var _c = 0, primaryPath_1 = primaryPath; _c < primaryPath_1.length; _c++) {
            var colorPath = primaryPath_1[_c];
            for (var _d = 0, edges_3 = edges; _d < edges_3.length; _d++) {
                var edge = edges_3[_d];
                if ((edge.getFrom() == primaryPath[end] && edge.getTo() == primaryPath[start] && end <= primaryPath.length) || (edge.getFrom() == primaryPath[start] && edge.getTo() == primaryPath[end] && end <= edges.length)) {
                    console.log();
                    visedges.update([{ id: edge.getId(), color: 'red' }]);
                }
            }
            start++;
            end++;
        }
        /*if(globalResultDijkstra.responseJSON.result['0'].paths.path2) {
            var secondaryPath = globalResultDijkstra.responseJSON.result['0'].paths.path2.split("-");
            for (let edge of edges) {
            let start = 0;
            let end = 1
            if (edge.getFrom() == secondaryPath[end] && edge.getTo() == secondaryPath[start] && end <= secondaryPath.length) {
                console.log();
                visedges.update([{ id: edge.getId(), color: 'green' }]);
                start++;
                end++;
            }
        }
        }

        for (let edge of edges) {
            let start = 0;
            let end = 1;
            if((edge.getFrom() == primaryPath[end] && edge.getTo() == primaryPath[start] && end <= primaryPath.length) || (edge.getFrom() == primaryPath[start] && edge.getTo() == primaryPath[end] && end <= edges.length)) {
                console.log();
                visedges.update([{ id: edge.getId(), color: 'red' }]);
                start++;
                end++;
            }
        }   */
        for (var _e = 0, _f = globalResultDijkstra.responseJSON.result; _e < _f.length; _e++) {
            var result = _f[_e];
            console.log(result);
            $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapse" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapse" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapse" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Path1: </span>" + result.paths.path1 + "</div>" + "<div><span>Path2: </span>" + result.paths.path2 + "</div>" + "<div><span>Availability(av): </span>" + result.availability.av + "</div>" + "<div><span>Availability(s,t): </span>" + result.availability["s,t"] + "</div>" + "<div><span>Reliablity(av): </span>" + result.reliability.av + "</div>" + "<div><span>Reliability(s,t): </span>" + result.reliability["s,t"] + "</div>" + "</div> </div> </div>");
            resultIterator++;
        }
        $('.calculation-container').append("<div class='success-msg-green'>Calculation done...</div>");
    });
}
function exportTopology() {
    $(".export").click(function () {
        var jsonTopology = JSON.stringify({ nodes: nodes, edges: edges }, null, 2);
        var blob = new Blob([jsonTopology], { type: "application/json;charset=utf-8" });
        FileSaver.saveAs(blob, "topology" + ".json");
        $('#export-topology').modal('hide');
        $('.calculation-container').append("<div class='success-msg-white'>Topology exported...</div>");
    });
}
function setSelectionOptions() {
    $('#exampleModal, #abrahamModal').on('show.bs.modal', function () {
        $('#start-node, #start-node-abraham').find('option').remove();
        $('#end-node,  #end-node-abraham').find('option').remove();
        for (var i = 0; i < nodes.length; i++) {
            $('#start-node, #start-node-abraham').append('<option>' + nodes[i].getLabel() + '</option>');
            $('#end-node, #end-node-abraham').append('<option>' + nodes[i].getLabel() + '</option>');
        }
        $('#start-node, #start-node-abraham').append('<option>' + 'Network' + '</option>');
        $('#end-node, #end-node-abraham').append('<option>' + 'Network' + '</option>');
    });
}
function deleteNetwork() {
    $("#delete-topology").on('click', function () {
        edges = [];
        nodes = [];
        network.destroy();
        network = null;
        renderTopology();
        $('.calculation-container').append("<div class='success-msg-red'>Network deleted...</div>");
    });
}
var json;
document.getElementById('file').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                json = JSON.parse(e.target.result);
                setImportedTopology(json);
            };
        })(f);
        reader.readAsText(f);
        $('.calculation-container').append("<div class='success-msg-white'>Topology imported...</div>");
    }
}
function setImportedTopology(json) {
    edges = [];
    nodes = [];
    for (var _i = 0, _a = json.nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        var tmpNode = new node_1.Node(node.label, node.id, node.failureRate, node.repairRate);
        nodes.push(tmpNode);
    }
    for (var _b = 0, _c = json.edges; _b < _c.length; _b++) {
        var edge = _c[_b];
        var tmpEdge = new edge_1.Edge(edge.label, edge.id, edge.from, edge.to, edge.length, edge.failureRate, edge.repairRate);
        edges.push(tmpEdge);
    }
    console.log(nodes);
    console.log(edges);
}
$('.import').on('click', function () {
    network.destroy();
    network = null;
    renderTopology();
    $('#import-topology').modal('hide');
});
document.getElementById('file').addEventListener('change', handleFileSelect, false);
$(document).ready(function () {
    $('.form-validation-success').hide();
    $('.form-validation-error').hide();
    if (globalUsername == '' || globalPassword == '') {
        $('#login-modal').modal('show');
        $('.login').on('click', function () {
            var username = $('#username-input').val();
            var password = $('#password-input').val();
            globalPassword = password;
            globalUsername = username;
            var signAjax = new ajax_controller_1.AjaxController();
            signAjax.signup(username, password);
        });
    }
});
renderTopology();
dijkstraModal();
abrahamModal();
exportTopology();
deleteNetwork();
},{"./controllers/ajax.controller":1,"./models/edge":3,"./models/node":4,"./models/topology":6,"file-saver":7}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rates_1 = require("./rates");
var Edge = (function (_super) {
    __extends(Edge, _super);
    function Edge(label, id, from, to, length, failureRate, repairRate) {
        var _this = _super.call(this) || this;
        _this.label = label;
        _this.id = id;
        _this.from = from;
        _this.to = to;
        _this.src = from;
        _this.dest = to;
        _this.length = length;
        _super.prototype.setFailureRate.call(_this, failureRate);
        _super.prototype.setRepairRate.call(_this, repairRate);
        return _this;
    }
    /* Getters and setters */
    Edge.prototype.getSrc = function () {
        return this.src;
    };
    Edge.prototype.setSrc = function (src) {
        this.src = src;
    };
    Edge.prototype.getDest = function () {
        return this.dest;
    };
    Edge.prototype.setDest = function (dest) {
        this.dest = dest;
    };
    Edge.prototype.getLength = function () {
        return this.length;
    };
    Edge.prototype.setLength = function (length) {
        this.length = length;
    };
    Edge.prototype.getLabel = function () {
        return this.label;
    };
    Edge.prototype.setLabel = function (label) {
        this.label = label;
    };
    Edge.prototype.getId = function () {
        return this.id;
    };
    Edge.prototype.setId = function (id) {
        this.id = id;
    };
    Edge.prototype.getFrom = function () {
        return this.from;
    };
    Edge.prototype.setFrom = function (from) {
        this.from = from;
    };
    Edge.prototype.getTo = function () {
        return this.to;
    };
    Edge.prototype.setTo = function (to) {
        this.to = to;
    };
    return Edge;
}(rates_1.FailRepairRate));
exports.Edge = Edge;
},{"./rates":5}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rates_1 = require("./rates");
var Node = (function (_super) {
    __extends(Node, _super);
    function Node(label, id, failureRate, repairRate) {
        var _this = _super.call(this) || this;
        _this.label = label;
        _this.id = id;
        _super.prototype.setFailureRate.call(_this, failureRate);
        _super.prototype.setRepairRate.call(_this, repairRate);
        return _this;
    }
    Node.prototype.getLabel = function () {
        return this.label;
    };
    Node.prototype.setLabel = function (label) {
        this.label = label;
    };
    Node.prototype.getId = function () {
        return this.id;
    };
    Node.prototype.setId = function (id) {
        this.id = id;
    };
    return Node;
}(rates_1.FailRepairRate));
exports.Node = Node;
},{"./rates":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FailRepairRate = (function () {
    function FailRepairRate() {
    }
    FailRepairRate.prototype.setFailureRate = function (rate) {
        this.failureRate = rate;
    };
    FailRepairRate.prototype.setRepairRate = function (rate) {
        this.repairRate = rate;
    };
    FailRepairRate.prototype.getFailureRate = function () {
        return this.failureRate;
    };
    FailRepairRate.prototype.getRepairRate = function () {
        return this.repairRate;
    };
    return FailRepairRate;
}());
exports.FailRepairRate = FailRepairRate;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Topology = (function () {
    function Topology() {
        this.nodes = new Array();
        this.links = new Array();
    }
    Topology.prototype.getNodeById = function (id) {
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.getId() === id) {
                return node;
            }
        }
    };
    Topology.prototype.getEdgeById = function (id) {
        for (var _i = 0, _a = this.links; _i < _a.length; _i++) {
            var edge = _a[_i];
            if (edge.getId() === id) {
                return edge;
            }
        }
    };
    Topology.prototype.getNodes = function () {
        return this.nodes;
    };
    Topology.prototype.getEdges = function () {
        return this.links;
    };
    Topology.prototype.setNode = function (node) {
        this.nodes.push(node);
    };
    Topology.prototype.setNodes = function (nodes) {
        this.nodes = nodes;
    };
    Topology.prototype.setEdge = function (edge) {
        this.links.push(edge);
    };
    Topology.prototype.setEdges = function (edges) {
        this.links = edges;
    };
    Topology.prototype.getStartNode = function () {
        return this.start;
    };
    Topology.prototype.setStartNode = function (start) {
        this.start = start;
    };
    Topology.prototype.getEndNode = function () {
        return this.end;
    };
    Topology.prototype.setEndNode = function (end) {
        this.end = end;
    };
    return Topology;
}());
exports.Topology = Topology;
},{}],7:[function(require,module,exports){
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyIsIm5vZGVfbW9kdWxlcy9maWxlLXNhdmVyL0ZpbGVTYXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFHSTtJQUNBLENBQUM7SUFFTSw0Q0FBbUIsR0FBMUIsVUFBMkIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsQ0FBUyxFQUFFLEtBQVUsRUFBRSxLQUFVO1FBQ3hILEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNWLEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxF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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZGVjbGFyZSB2YXIgJDogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEFqYXhDb250cm9sbGVyIHtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpamtzdHJhQ2FsY3VsYXRpb24odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIHQ6IG51bWJlciwgbm9kZXM6IGFueSwgbGlua3M6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChzdGFydCA9PSAnTmV0d29yaycgfHwgZW5kID09ICdOZXR3b3JrJykge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgdCB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgc3RhcnQsIGVuZCwgdCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9kaWprc3RyYScsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgc3RhcnQsIGVuZCwgdCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9ub2RlcGFpcicsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2lnbnVwKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBsZXQganNvblNpZ251cCA9IEpTT04uc3RyaW5naWZ5KHsgdXNlcm5hbWUsIHBhc3N3b3JkIH0pO1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zaWdudXAnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgZGF0YToganNvblNpZ251cCxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS51c2VyID09IFwid3JvbmdfcGFzc3dvcmRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5mb3JtLXZhbGlkYXRpb24tZXJyb3InKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZihkYXRhLnVzZXIgPT0gXCJ2YWxpZFwiIHx8IGRhdGEudXNlciA9PSBcImNyZWF0ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5mb3JtLXZhbGlkYXRpb24tc3VjY2VzcycpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICQoJy5mb3JtLXZhbGlkYXRpb24tZXJyb3InKS5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9tb2RlbHMvbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL21vZGVscy9lZGdlJztcclxuaW1wb3J0IHsgQWpheENvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlcic7XHJcbmltcG9ydCB7IFRvcG9sb2d5IH0gZnJvbSAnLi9tb2RlbHMvdG9wb2xvZ3knO1xyXG5pbXBvcnQgKiBhcyBGaWxlU2F2ZXIgZnJvbSAnZmlsZS1zYXZlcic7XHJcblxyXG5kZWNsYXJlIHZhciBGaWxlUmVhZGVyOiBhbnk7XHJcbmRlY2xhcmUgdmFyIHZpczogYW55O1xyXG5kZWNsYXJlIHZhciAkOiBhbnk7XHJcbmRlY2xhcmUgdmFyIERyb3B6b25lOiBhbnk7XHJcblxyXG5sZXQgbm9kZXM6IE5vZGVbXSA9IG5ldyBBcnJheTxOb2RlPigpO1xyXG5sZXQgZWRnZXM6IEVkZ2VbXSA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG5sZXQgdG9wb2xvZ3k6IFRvcG9sb2d5ID0gbmV3IFRvcG9sb2d5KCk7XHJcbmxldCBpc05vZGVTZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5sZXQgbmV0d29yazogYW55O1xyXG5sZXQgZ2xvYmFsVXNlcm5hbWU6IHN0cmluZyA9ICcnO1xyXG5sZXQgZ2xvYmFsUGFzc3dvcmQ6IHN0cmluZyA9ICcnO1xyXG5sZXQgZ2xvYmFsUmVzdWx0RGlqa3N0cmE6IGFueTtcclxubGV0IGdsb2JhbFJlc3VsdEFicmFoYW06IGFueTtcclxubGV0IHZpc25vZGVzOiBhbnk7XHJcbmxldCB2aXNlZGdlczogYW55O1xyXG5cclxuZnVuY3Rpb24gcmVuZGVyVG9wb2xvZ3koKSB7XHJcblxyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrJyk7XHJcblxyXG4gICAgdmlzbm9kZXMgPSBuZXcgdmlzLkRhdGFTZXQobm9kZXMpO1xyXG4gICAgdmlzZWRnZXMgPSBuZXcgdmlzLkRhdGFTZXQoZWRnZXMpO1xyXG5cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIG5vZGVzOiB2aXNub2RlcyxcclxuICAgICAgICBlZGdlczogdmlzZWRnZXNcclxuICAgIH07XHJcblxyXG5cclxuICAgIHRvcG9sb2d5LnNldE5vZGVzKG5vZGVzKTtcclxuICAgIHRvcG9sb2d5LnNldEVkZ2VzKGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBub2Rlczoge1xyXG4gICAgICAgICAgICBzaGFwZTogJ2RvdCcsXHJcbiAgICAgICAgICAgIHNpemU6IDMwLFxyXG4gICAgICAgICAgICBjb2xvcjoge1xyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGh5c2ljczogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVkZ2VzOiB7XHJcbiAgICAgICAgICAgIHBoeXNpY3M6IGZhbHNlLFxyXG4gICAgICAgICAgICB3aWR0aDogMixcclxuICAgICAgICAgICAgbGVuZ3RoOiAxMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGF5b3V0OiB7XHJcbiAgICAgICAgICAgIHJhbmRvbVNlZWQ6IDJcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hbmlwdWxhdGlvbjoge1xyXG4gICAgICAgICAgICBpbml0aWFsbHlBY3RpdmU6IHRydWUsXHJcblxyXG4gICAgICAgICAgICBhZGROb2RlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaWxsaW5nIGluIHRoZSBwb3B1cCBET00gZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIE5vZGVcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBlZGl0Tm9kZShkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVkaXROb2RlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaWxsaW5nIGluIHRoZSBwb3B1cCBET00gZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiRWRpdCBOb2RlXCI7XHJcbiAgICAgICAgICAgICAgICBlZGl0Tm9kZShkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFkZEVkZ2U6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmZyb20gPT0gZGF0YS50bykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByID0gY29uZmlybShcIkRvIHlvdSB3YW50IHRvIGNvbm5lY3QgdGhlIG5vZGUgdG8gaXRzZWxmP1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAociAhPSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJBZGQgRWRnZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVkaXRFZGdlOiB7XHJcbiAgICAgICAgICAgICAgICBlZGl0V2l0aG91dERyYWc6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgRWRnZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB5b3VyIG5ldHdvcmshXHJcbiAgICBuZXR3b3JrID0gbmV3IHZpcy5OZXR3b3JrKGNvbnRhaW5lciwgZGF0YSwgb3B0aW9ucyk7XHJcbiAgICByZWdpc3RlckV2ZW50KG5ldHdvcmspO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdE5vZGUoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlTm9kZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsTm9kZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWdpc3RlckV2ZW50KGRhdGE6IGFueSkge1xyXG4gICAgZGF0YS5vbihcInNlbGVjdFwiLCBmdW5jdGlvbiAocGFyYW1zOiBhbnkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhwYXJhbXMpO1xyXG4gICAgICAgIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID09IDAgJiYgcGFyYW1zLmVkZ2VzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBlZGdlOiBFZGdlID0gdG9wb2xvZ3kuZ2V0RWRnZUJ5SWQocGFyYW1zLmVkZ2VzWycwJ10pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9ICc8aDI+RWRnZTwvaDI+JyArICc8cD48c3Bhbj5MYWJlbDogPC9zcGFuPicgKyBwYXJhbXMuZWRnZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkZhaWx1cmUgcmF0ZTo8L3NwYW4+ICcgKyBlZGdlLmdldEZhaWx1cmVSYXRlKCkgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPlJlcGFpciByYXRlOiA8L3NwYW4+JyArIGVkZ2UuZ2V0UmVwYWlyUmF0ZSgpICsgJzwvcD4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IG5vZGU6IE5vZGUgPSB0b3BvbG9neS5nZXROb2RlQnlJZChwYXJhbXMubm9kZXNbJzAnXSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gJzxoMj5Ob2RlPC9oMj4nICsgJzxwPjxzcGFuPkxhYmVsOiA8L3NwYW4+JyArIHBhcmFtcy5ub2RlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RWRnZXM6IDwvc3Bhbj4nICsgcGFyYW1zLmVkZ2VzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5GYWlsdXJlIHJhdGU6IDwvc3Bhbj4nICsgbm9kZS5nZXRGYWlsdXJlUmF0ZSgpICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5SZXBhaXIgcmF0ZTogPC9zcGFuPicgKyBub2RlLmdldFJlcGFpclJhdGUoKSArICc8L3A+JztcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPT0gMCAmJiBwYXJhbXMuZWRnZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2xlYXJOb2RlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsTm9kZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlTm9kZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgZGF0YS5pZCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1pZCcpKS52YWx1ZTtcclxuICAgIGRhdGEuZmFpbHVyZVJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWZhaWx1cmVSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEucmVwYWlyUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcmVwYWlyUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBjbGVhck5vZGVQb3BVcCgpO1xyXG5cclxuICAgIGxldCB0ZW1wTm9kZTogTm9kZSA9IG5ldyBOb2RlKGRhdGEubGFiZWwsIGRhdGEuaWQsIGRhdGEuZmFpbHVyZVJhdGUsIGRhdGEucmVwYWlyUmF0ZSk7XHJcbiAgICBub2Rlcy5wdXNoKHRlbXBOb2RlKTtcclxuICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLWdyZWVuJz5Ob2RlIGFkZGVkLi4uPC9kaXY+XCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlRWRnZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsRWRnZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhckVkZ2VQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxFZGdlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVFZGdlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YS50byA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS50byA9IGRhdGEudG8uaWRcclxuICAgIGlmICh0eXBlb2YgZGF0YS5mcm9tID09PSAnb2JqZWN0JylcclxuICAgICAgICBkYXRhLmZyb20gPSBkYXRhLmZyb20uaWRcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEubGVuZ3RoID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1sZW5ndGgnKSkudmFsdWUpO1xyXG4gICAgbGV0IHRlbXBFZGdlOiBFZGdlID0gbmV3IEVkZ2UoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mcm9tLCBkYXRhLnRvLCBkYXRhLmxlbmd0aCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIGVkZ2VzLnB1c2godGVtcEVkZ2UpO1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLWdyZWVuJz5FZGdlIGFkZGVkLi4uPC9kaXY+XCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhYnJhaGFtTW9kYWwoKSB7XHJcbiAgICBzZXRTZWxlY3Rpb25PcHRpb25zKCk7XHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNhbGN1bGF0ZS1hYnJhaGFtJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy15ZWxsb3cnPkNhbGN1bGF0aW5nIHVzaW5nIEFicmFoYW0gYWxnb3JpdGhtLi4uPC9kaXY+XCIpO1xyXG4gICAgICAgICQoJy5yZXN1bHRzQWJyYWhhbScpLmZpbmQoJy5wYW5lbC1ncm91cCcpLnJlbW92ZSgpO1xyXG4gICAgICAgIGxldCB1c2VybmFtZSA9IGdsb2JhbFVzZXJuYW1lO1xyXG4gICAgICAgIGxldCBwYXNzd29yZCA9IGdsb2JhbFBhc3N3b3JkO1xyXG4gICAgICAgIGxldCBzdGFydE5vZGUgPSAkKCcjc3RhcnQtbm9kZS1hYnJhaGFtJykudmFsKCk7XHJcbiAgICAgICAgbGV0IGVuZE5vZGUgPSAkKCcjZW5kLW5vZGUtYWJyYWhhbScpLnZhbCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gcGFyc2VJbnQoJCgnI3RpbWUtYWJyYWhhbScpLnZhbCgpKTtcclxuICAgICAgICBsZXQgY2FsY0RpamtzdHIgPSBuZXcgQWpheENvbnRyb2xsZXIoKTtcclxuICAgICAgICBnbG9iYWxSZXN1bHRBYnJhaGFtID0gY2FsY0RpamtzdHIuYWJyYWhhbUNhbGN1bGF0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCwgc3RhcnROb2RlLCBlbmROb2RlLCB0aW1lLCBub2RlcywgZWRnZXMpO1xyXG4gICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGdsb2JhbFJlc3VsdEFicmFoYW0ucmVzcG9uc2VKU09OLnJlc3VsdDtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWxSZXN1bHRBYnJhaGFtLnJlc3BvbnNlSlNPTi5yZXN1bHQuYXZhaWxhYmlsaXR5ID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICQoJy5yZXN1bHRzQWJyYWhhbScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BhbmVsLWdyb3VwIGdyZWVuJyBpZD0nYWNjb3JkaW9uMicgcm9sZT0ndGFibGlzdCcgYXJpYS1tdWx0aXNlbGVjdGFibGU9J3RydWUnPiA8ZGl2IGNsYXNzPSdwYW5lbCBwYW5lbC1kZWZhdWx0Jz4gPGRpdiBjbGFzcz0ncGFuZWwtaGVhZGluZycgcm9sZT0ndGFiJyBpZD0naGVhZGluZ09uZSc+IDxoNCBjbGFzcz0ncGFuZWwtdGl0bGUgIHRleHQtY2VudGVyJz4gPGEgcm9sZT0nYnV0dG9uJyBkYXRhLXRvZ2dsZT0nY29sbGFwc2UnIGRhdGEtcGFyZW50PScjYWNjb3JkaW9uJyBocmVmPSdcIiArIFwiI2NvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCI+XCIgKyBcIlJlc3VsdCBcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCJjbGFzcz0ncGFuZWwtY29sbGFwc2UgY29sbGFwc2UnIHJvbGU9J3RhYnBhbmVsJyBhcmlhLWxhYmVsbGVkYnk9J2hlYWRpbmdPbmUnPiA8ZGl2IGNsYXNzPSdwYW5lbC1ib2R5Jz5cIiArIFwiPGRpdj48c3Bhbj5BdmFpbGFiaWxpdHkoYXYpOiA8L3NwYW4+XCIgKyByZXN1bHQuYXZhaWxhYmlsaXR5LmF2ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5BdmFpbGFiaWxpdHkocyx0KTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eVtcInMsdFwiXSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UmVsaWFibGl0eShhdik6IDwvc3Bhbj5cIiArIHJlc3VsdC5yZWxpYWJpbGl0eS5hdiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UmVsaWFiaWxpdHkocyx0KTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5W1wicyx0XCJdICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5yZXN1bHRzQWJyYWhhbScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BhbmVsLWdyb3VwIGdyZWVuJyBpZD0nYWNjb3JkaW9uMicgcm9sZT0ndGFibGlzdCcgYXJpYS1tdWx0aXNlbGVjdGFibGU9J3RydWUnPiA8ZGl2IGNsYXNzPSdwYW5lbCBwYW5lbC1kZWZhdWx0Jz4gPGRpdiBjbGFzcz0ncGFuZWwtaGVhZGluZycgcm9sZT0ndGFiJyBpZD0naGVhZGluZ09uZSc+IDxoNCBjbGFzcz0ncGFuZWwtdGl0bGUgIHRleHQtY2VudGVyJz4gPGEgcm9sZT0nYnV0dG9uJyBkYXRhLXRvZ2dsZT0nY29sbGFwc2UnIGRhdGEtcGFyZW50PScjYWNjb3JkaW9uJyBocmVmPSdcIiArIFwiI2NvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCI+XCIgKyBcIlJlc3VsdCBcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCJjbGFzcz0ncGFuZWwtY29sbGFwc2UgY29sbGFwc2UnIHJvbGU9J3RhYnBhbmVsJyBhcmlhLWxhYmVsbGVkYnk9J2hlYWRpbmdPbmUnPiA8ZGl2IGNsYXNzPSdwYW5lbC1ib2R5Jz5cIiArIFwiPGRpdj48c3Bhbj5BdmFpbGFiaWxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC5yZWxpYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjwvZGl2PiA8L2Rpdj4gPC9kaXY+XCIpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLWdyZWVuJz5DYWxjdWxhdGlvbiBkb25lLi4uPC9kaXY+XCIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpamtzdHJhTW9kYWwoKSB7XHJcbiAgICBzZXRTZWxlY3Rpb25PcHRpb25zKCk7XHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNhbGN1bGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2cteWVsbG93Jz5DYWxjdWxhdGluZyB1c2luZyBEaWprc3RyYSBhbGdvcml0aG0uLi48L2Rpdj5cIik7XHJcbiAgICAgICAgJCgnLnJlc3VsdHMnKS5maW5kKCcucGFuZWwtZ3JvdXAnKS5yZW1vdmUoKTtcclxuICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2VkZ2VzLnVwZGF0ZShbeyBpZDogZWRnZS5nZXRJZCgpLCBjb2xvcjogJyM5N0MyRkMnIH1dKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICBsZXQgdXNlcm5hbWUgPSBnbG9iYWxVc2VybmFtZTtcclxuICAgICAgICBsZXQgcGFzc3dvcmQgPSBnbG9iYWxQYXNzd29yZDtcclxuICAgICAgICBsZXQgc3RhcnROb2RlID0gJCgnI3N0YXJ0LW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgZW5kTm9kZSA9ICQoJyNlbmQtbm9kZScpLnZhbCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gcGFyc2VJbnQoJCgnI3RpbWUnKS52YWwoKSk7XHJcbiAgICAgICAgbGV0IGNhbGNEaWprc3RyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgZ2xvYmFsUmVzdWx0RGlqa3N0cmEgPSBjYWxjRGlqa3N0ci5kaWprc3RyYUNhbGN1bGF0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCwgc3RhcnROb2RlLCBlbmROb2RlLCB0aW1lLCBub2RlcywgZWRnZXMpO1xyXG4gICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcblxyXG4gICAgICAgIGxldCBwcmltYXJ5UGF0aCA9IGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMS5zcGxpdChcIi1cIik7XHJcbiAgICAgICAgaWYgKGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMikge1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kYXJ5UGF0aCA9IGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMi5zcGxpdChcIi1cIik7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kID0gMVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xvclBhdGggb2Ygc2Vjb25kYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZWRnZSBvZiBlZGdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoZWRnZS5nZXRGcm9tKCkgPT0gc2Vjb25kYXJ5UGF0aFtlbmRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBzZWNvbmRhcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gZWRnZXMubGVuZ3RoKSB8fCAoZWRnZS5nZXRGcm9tKCkgPT0gc2Vjb25kYXJ5UGF0aFtzdGFydF0gJiYgZWRnZS5nZXRUbygpID09IHNlY29uZGFyeVBhdGhbZW5kXSAmJiBlbmQgPD0gZWRnZXMubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdncmVlbicgfV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICBlbmQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgIGxldCBlbmQgPSAxXHJcbiAgICAgICAgZm9yIChsZXQgY29sb3JQYXRoIG9mIHByaW1hcnlQYXRoKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVkZ2Ugb2YgZWRnZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbZW5kXSAmJiBlZGdlLmdldFRvKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVuZCA8PSBwcmltYXJ5UGF0aC5sZW5ndGgpIHx8IChlZGdlLmdldEZyb20oKSA9PSBwcmltYXJ5UGF0aFtzdGFydF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZW5kIDw9IGVkZ2VzLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpc2VkZ2VzLnVwZGF0ZShbeyBpZDogZWRnZS5nZXRJZCgpLCBjb2xvcjogJ3JlZCcgfV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgIGVuZCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyppZihnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10ucGF0aHMucGF0aDIpIHtcclxuICAgICAgICAgICAgdmFyIHNlY29uZGFyeVBhdGggPSBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10ucGF0aHMucGF0aDIuc3BsaXQoXCItXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSAxXHJcbiAgICAgICAgICAgIGlmIChlZGdlLmdldEZyb20oKSA9PSBzZWNvbmRhcnlQYXRoW2VuZF0gJiYgZWRnZS5nZXRUbygpID09IHNlY29uZGFyeVBhdGhbc3RhcnRdICYmIGVuZCA8PSBzZWNvbmRhcnlQYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgIHZpc2VkZ2VzLnVwZGF0ZShbeyBpZDogZWRnZS5nZXRJZCgpLCBjb2xvcjogJ2dyZWVuJyB9XSk7XHJcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSAxO1xyXG4gICAgICAgICAgICBpZigoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbZW5kXSAmJiBlZGdlLmdldFRvKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVuZCA8PSBwcmltYXJ5UGF0aC5sZW5ndGgpIHx8IChlZGdlLmdldEZyb20oKSA9PSBwcmltYXJ5UGF0aFtzdGFydF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZW5kIDw9IGVkZ2VzLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XHJcbiAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdyZWQnIH1dKTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICBlbmQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gICAqL1xyXG4gICAgICAgIGZvciAobGV0IHJlc3VsdCBvZiBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAkKCcucmVzdWx0cycpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BhbmVsLWdyb3VwIGdyZWVuJyBpZD0nYWNjb3JkaW9uJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdoZWFkaW5nT25lJz4gPGg0IGNsYXNzPSdwYW5lbC10aXRsZSAgdGV4dC1jZW50ZXInPiA8YSByb2xlPSdidXR0b24nIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS1wYXJlbnQ9JyNhY2NvcmRpb24nIGhyZWY9J1wiICsgXCIjY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIiBhcmlhLWV4cGFuZGVkPSdmYWxzZScgYXJpYS1jb250cm9scz0nXCIgKyBcImNvbGxhcHNlXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCI+XCIgKyBcIlJlc3VsdCBcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuPlBhdGgxOiA8L3NwYW4+XCIgKyByZXN1bHQucGF0aHMucGF0aDEgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlBhdGgyOiA8L3NwYW4+XCIgKyByZXN1bHQucGF0aHMucGF0aDIgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShhdik6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQuYXZhaWxhYmlsaXR5W1wicyx0XCJdICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5LmF2ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuICAgICAgICAgICAgcmVzdWx0SXRlcmF0b3IrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLWdyZWVuJz5DYWxjdWxhdGlvbiBkb25lLi4uPC9kaXY+XCIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4cG9ydFRvcG9sb2d5KCkge1xyXG4gICAgJChcIi5leHBvcnRcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IG5vZGVzLCBlZGdlcyB9LCBudWxsLCAyKTtcclxuICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtqc29uVG9wb2xvZ3ldLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIgfSk7XHJcbiAgICAgICAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCBcInRvcG9sb2d5XCIgKyBcIi5qc29uXCIpO1xyXG5cclxuICAgICAgICAkKCcjZXhwb3J0LXRvcG9sb2d5JykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctd2hpdGUnPlRvcG9sb2d5IGV4cG9ydGVkLi4uPC9kaXY+XCIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFNlbGVjdGlvbk9wdGlvbnMoKSB7XHJcbiAgICAkKCcjZXhhbXBsZU1vZGFsLCAjYWJyYWhhbU1vZGFsJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnI3N0YXJ0LW5vZGUsICNzdGFydC1ub2RlLWFicmFoYW0nKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKTtcclxuICAgICAgICAkKCcjZW5kLW5vZGUsICAjZW5kLW5vZGUtYWJyYWhhbScpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgJCgnI3N0YXJ0LW5vZGUsICNzdGFydC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArIG5vZGVzW2ldLmdldExhYmVsKCkgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgICQoJyNlbmQtbm9kZSwgI2VuZC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArIG5vZGVzW2ldLmdldExhYmVsKCkgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyAnTmV0d29yaycgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgJCgnI2VuZC1ub2RlLCAjZW5kLW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgJ05ldHdvcmsnICsgJzwvb3B0aW9uPicpO1xyXG4gICAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsZXRlTmV0d29yaygpIHtcclxuICAgICQoXCIjZGVsZXRlLXRvcG9sb2d5XCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBlZGdlcyA9IFtdO1xyXG4gICAgICAgIG5vZGVzID0gW107XHJcbiAgICAgICAgbmV0d29yay5kZXN0cm95KCk7XHJcbiAgICAgICAgbmV0d29yayA9IG51bGw7XHJcbiAgICAgICAgcmVuZGVyVG9wb2xvZ3koKTtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctcmVkJz5OZXR3b3JrIGRlbGV0ZWQuLi48L2Rpdj5cIik7XHJcbiAgICB9KTtcclxufVxyXG5cclxudmFyIGpzb247XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKTtcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUZpbGVTZWxlY3QoZXZ0OiBhbnkpIHtcclxuICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG5cclxuICAgIC8vIGZpbGVzIGlzIGEgRmlsZUxpc3Qgb2YgRmlsZSBvYmplY3RzLiBMaXN0IHNvbWUgcHJvcGVydGllcy5cclxuICAgIHZhciBvdXRwdXQgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBmOyBmID0gZmlsZXNbaV07IGkrKykge1xyXG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDbG9zdXJlIHRvIGNhcHR1cmUgdGhlIGZpbGUgaW5mb3JtYXRpb24uXHJcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAodGhlRmlsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIHNldEltcG9ydGVkVG9wb2xvZ3koanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KShmKTtcclxuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmKTtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctd2hpdGUnPlRvcG9sb2d5IGltcG9ydGVkLi4uPC9kaXY+XCIpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0SW1wb3J0ZWRUb3BvbG9neShqc29uOiBhbnkpIHtcclxuICAgIGVkZ2VzID0gW107XHJcbiAgICBub2RlcyA9IFtdO1xyXG4gICAgZm9yIChsZXQgbm9kZSBvZiBqc29uLm5vZGVzKSB7XHJcbiAgICAgICAgbGV0IHRtcE5vZGUgPSBuZXcgTm9kZShub2RlLmxhYmVsLCBub2RlLmlkLCBub2RlLmZhaWx1cmVSYXRlLCBub2RlLnJlcGFpclJhdGUpO1xyXG4gICAgICAgIG5vZGVzLnB1c2godG1wTm9kZSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBlZGdlIG9mIGpzb24uZWRnZXMpIHtcclxuICAgICAgICBsZXQgdG1wRWRnZSA9IG5ldyBFZGdlKGVkZ2UubGFiZWwsIGVkZ2UuaWQsIGVkZ2UuZnJvbSwgZWRnZS50bywgZWRnZS5sZW5ndGgsIGVkZ2UuZmFpbHVyZVJhdGUsIGVkZ2UucmVwYWlyUmF0ZSk7XHJcbiAgICAgICAgZWRnZXMucHVzaCh0bXBFZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhub2Rlcyk7XHJcbiAgICBjb25zb2xlLmxvZyhlZGdlcyk7XHJcbn1cclxuXHJcbiQoJy5pbXBvcnQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBuZXR3b3JrLmRlc3Ryb3koKTtcclxuICAgIG5ldHdvcmsgPSBudWxsO1xyXG4gICAgcmVuZGVyVG9wb2xvZ3koKTtcclxuICAgICQoJyNpbXBvcnQtdG9wb2xvZ3knKS5tb2RhbCgnaGlkZScpO1xyXG59KTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZVNlbGVjdCwgZmFsc2UpO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1zdWNjZXNzJykuaGlkZSgpO1xyXG4gICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1lcnJvcicpLmhpZGUoKTtcclxuICAgIGlmIChnbG9iYWxVc2VybmFtZSA9PSAnJyB8fCBnbG9iYWxQYXNzd29yZCA9PSAnJykge1xyXG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgJCgnLmxvZ2luJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgdXNlcm5hbWUgPSAkKCcjdXNlcm5hbWUtaW5wdXQnKS52YWwoKTtcclxuICAgICAgICAgICAgbGV0IHBhc3N3b3JkID0gJCgnI3Bhc3N3b3JkLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIGdsb2JhbFBhc3N3b3JkID0gcGFzc3dvcmQ7XHJcbiAgICAgICAgICAgIGdsb2JhbFVzZXJuYW1lID0gdXNlcm5hbWU7XHJcbiAgICAgICAgICAgIGxldCBzaWduQWpheCA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICBzaWduQWpheC5zaWdudXAodXNlcm5hbWUsIHBhc3N3b3JkKTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5yZW5kZXJUb3BvbG9neSgpO1xyXG5kaWprc3RyYU1vZGFsKCk7XHJcbmFicmFoYW1Nb2RhbCgpO1xyXG5leHBvcnRUb3BvbG9neSgpO1xyXG5kZWxldGVOZXR3b3JrKCk7XHJcbiIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRWRnZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIFxyXG4gICAgLyp2aXN1YWxpemF0aW9uKi9cclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgZnJvbTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSB0bzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgICAvKmJhY2tlbmQgcGFyYW1ldGVycyovXHJcbiAgICBwcml2YXRlIHNyYzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBkZXN0OiBzdHJpbmc7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOnN0cmluZywgaWQ6c3RyaW5nLCBmcm9tOnN0cmluZywgdG86c3RyaW5nLCBsZW5ndGg6bnVtYmVyLCBmYWlsdXJlUmF0ZTpudW1iZXIsIHJlcGFpclJhdGU6bnVtYmVyKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICAgICAgdGhpcy5zcmMgPSBmcm9tO1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IHRvO1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKiBHZXR0ZXJzIGFuZCBzZXR0ZXJzICovXHJcblxyXG4gICAgZ2V0U3JjKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFNyYyhzcmM6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3JjID0gc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIGdldERlc3QoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldERlc3QoZGVzdDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kZXN0ID0gZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRMZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGVuZ3RoKGxlbmd0aDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RnJvbSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZyb207XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbShmcm9tOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZyb20gPSBmcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRvKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG87XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG8odG86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudG8gPSB0bztcclxuICAgIH1cclxufSIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZzsgXHJcblxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpIHsgXHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpOyBcclxuICAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIFxyXG59IiwiZXhwb3J0IGNsYXNzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgZmFpbHVyZVJhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVwYWlyUmF0ZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgc2V0RmFpbHVyZVJhdGUocmF0ZTogbnVtYmVyKTogdm9pZHtcclxuICAgICAgICB0aGlzLmZhaWx1cmVSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRSZXBhaXJSYXRlKHJhdGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVwYWlyUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0RmFpbHVyZVJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsdXJlUmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRSZXBhaXJSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwYWlyUmF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9lZGdlJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVG9wb2xvZ3kge1xyXG4gICAgcHJpdmF0ZSBub2RlczogQXJyYXk8Tm9kZT47XHJcbiAgICBwcml2YXRlIGxpbmtzOiBBcnJheTxFZGdlPjtcclxuXHJcbiAgICAvL0RJSktTVFJBIHBhcmFtZXRlcnMgLT4gc3RhcnQgJiBlbmQgbm9kZVxyXG4gICAgcHJpdmF0ZSBzdGFydDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBlbmQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVCeUlkKGlkOiBzdHJpbmcpOiBOb2RlIHtcclxuICAgICAgICBmb3IobGV0IG5vZGUgb2YgdGhpcy5ub2Rlcyl7XHJcbiAgICAgICAgICAgIGlmKG5vZGUuZ2V0SWQoKSA9PT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZUJ5SWQoaWQ6IHN0cmluZyk6IEVkZ2Uge1xyXG4gICAgICAgIGZvcihsZXQgZWRnZSBvZiB0aGlzLmxpbmtzKSB7XHJcbiAgICAgICAgICAgIGlmKGVkZ2UuZ2V0SWQoKSA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlZGdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVzKCk6IE5vZGVbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZXMoKTogRWRnZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGUobm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2Rlcyhub2RlczogTm9kZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2UoZWRnZTogRWRnZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MucHVzaChlZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlcyhlZGdlczogRWRnZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IGVkZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXJ0Tm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0O1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRTdGFydE5vZGUoc3RhcnQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgIH1cclxuICAgIGdldEVuZE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbmQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldEVuZE5vZGUoZW5kOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgIH1cclxufSIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjMuMlxuICogMjAxNi0wNi0xNiAxODoyNToxOVxuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIExpY2Vuc2U6IE1JVFxuICogICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiAqL1xuXG4vKmdsb2JhbCBzZWxmICovXG4vKmpzbGludCBiaXR3aXNlOiB0cnVlLCBpbmRlbnQ6IDQsIGxheGJyZWFrOiB0cnVlLCBsYXhjb21tYTogdHJ1ZSwgc21hcnR0YWJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xuXG52YXIgc2F2ZUFzID0gc2F2ZUFzIHx8IChmdW5jdGlvbih2aWV3KSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHQvLyBJRSA8MTAgaXMgZXhwbGljaXRseSB1bnN1cHBvcnRlZFxuXHRpZiAodHlwZW9mIHZpZXcgPT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXJcblx0XHQgIGRvYyA9IHZpZXcuZG9jdW1lbnRcblx0XHQgIC8vIG9ubHkgZ2V0IFVSTCB3aGVuIG5lY2Vzc2FyeSBpbiBjYXNlIEJsb2IuanMgaGFzbid0IG92ZXJyaWRkZW4gaXQgeWV0XG5cdFx0LCBnZXRfVVJMID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdmlldy5VUkwgfHwgdmlldy53ZWJraXRVUkwgfHwgdmlldztcblx0XHR9XG5cdFx0LCBzYXZlX2xpbmsgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLCBcImFcIilcblx0XHQsIGNhbl91c2Vfc2F2ZV9saW5rID0gXCJkb3dubG9hZFwiIGluIHNhdmVfbGlua1xuXHRcdCwgY2xpY2sgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBuZXcgTW91c2VFdmVudChcImNsaWNrXCIpO1xuXHRcdFx0bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHR9XG5cdFx0LCBpc19zYWZhcmkgPSAvY29uc3RydWN0b3IvaS50ZXN0KHZpZXcuSFRNTEVsZW1lbnQpIHx8IHZpZXcuc2FmYXJpXG5cdFx0LCBpc19jaHJvbWVfaW9zID0vQ3JpT1NcXC9bXFxkXSsvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHRocm93X291dHNpZGUgPSBmdW5jdGlvbihleCkge1xuXHRcdFx0KHZpZXcuc2V0SW1tZWRpYXRlIHx8IHZpZXcuc2V0VGltZW91dCkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGV4O1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHRcdCwgZm9yY2Vfc2F2ZWFibGVfdHlwZSA9IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0Ly8gbm90ZTogeW91ciBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBjb252ZXJ0IFVURi0xNiBVK0ZFRkYgdG8gRUYgQkIgQkZcblx0XHRcdGlmICgvXlxccyooPzp0ZXh0XFwvXFxTKnxhcHBsaWNhdGlvblxcL3htbHxcXFMqXFwvXFxTKlxcK3htbClcXHMqOy4qY2hhcnNldFxccyo9XFxzKnV0Zi04L2kudGVzdChibG9iLnR5cGUpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvYihbU3RyaW5nLmZyb21DaGFyQ29kZSgweEZFRkYpLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgZm9yY2UgPSB0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIGRpc3BhdGNoX2FsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvbiBhbnkgZmlsZXN5cyBlcnJvcnMgcmV2ZXJ0IHRvIHNhdmluZyB3aXRoIG9iamVjdCBVUkxzXG5cdFx0XHRcdCwgZnNfZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoKGlzX2Nocm9tZV9pb3MgfHwgKGZvcmNlICYmIGlzX3NhZmFyaSkpICYmIHZpZXcuRmlsZVJlYWRlcikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHVybCA9IGlzX2Nocm9tZV9pb3MgPyByZWFkZXIucmVzdWx0IDogcmVhZGVyLnJlc3VsdC5yZXBsYWNlKC9eZGF0YTpbXjtdKjsvLCAnZGF0YTphdHRhY2htZW50L2ZpbGU7Jyk7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3B1cCA9IHZpZXcub3Blbih1cmwsICdfYmxhbmsnKTtcblx0XHRcdFx0XHRcdFx0aWYoIXBvcHVwKSB2aWV3LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG5cdFx0XHRcdFx0XHRcdHVybD11bmRlZmluZWQ7IC8vIHJlbGVhc2UgcmVmZXJlbmNlIGJlZm9yZSBkaXNwYXRjaGluZ1xuXHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcblx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRvbid0IGNyZWF0ZSBtb3JlIG9iamVjdCBVUkxzIHRoYW4gbmVlZGVkXG5cdFx0XHRcdFx0aWYgKCFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGZvcmNlKSB7XG5cdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgb3BlbmVkID0gdmlldy5vcGVuKG9iamVjdF91cmwsIFwiX2JsYW5rXCIpO1xuXHRcdFx0XHRcdFx0aWYgKCFvcGVuZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQXBwbGUgZG9lcyBub3QgYWxsb3cgd2luZG93Lm9wZW4sIHNlZSBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvZG9jdW1lbnRhdGlvbi9Ub29scy9Db25jZXB0dWFsL1NhZmFyaUV4dGVuc2lvbkd1aWRlL1dvcmtpbmd3aXRoV2luZG93c2FuZFRhYnMvV29ya2luZ3dpdGhXaW5kb3dzYW5kVGFicy5odG1sXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXG5cdFx0XHRpZiAoY2FuX3VzZV9zYXZlX2xpbmspIHtcblx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdHNhdmVfbGluay5kb3dubG9hZCA9IG5hbWU7XG5cdFx0XHRcdFx0Y2xpY2soc2F2ZV9saW5rKTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZnNfZXJyb3IoKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lIHx8IGJsb2IubmFtZSB8fCBcImRvd25sb2FkXCIsIG5vX2F1dG9fYm9tKTtcblx0XHR9XG5cdDtcblx0Ly8gSUUgMTArIChuYXRpdmUgc2F2ZUFzKVxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYikge1xuXHRcdHJldHVybiBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0bmFtZSA9IG5hbWUgfHwgYmxvYi5uYW1lIHx8IFwiZG93bmxvYWRcIjtcblxuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IoYmxvYiwgbmFtZSk7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKXt9O1xuXHRGU19wcm90by5yZWFkeVN0YXRlID0gRlNfcHJvdG8uSU5JVCA9IDA7XG5cdEZTX3Byb3RvLldSSVRJTkcgPSAxO1xuXHRGU19wcm90by5ET05FID0gMjtcblxuXHRGU19wcm90by5lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVzdGFydCA9XG5cdEZTX3Byb3RvLm9ucHJvZ3Jlc3MgPVxuXHRGU19wcm90by5vbndyaXRlID1cblx0RlNfcHJvdG8ub25hYm9ydCA9XG5cdEZTX3Byb3RvLm9uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlZW5kID1cblx0XHRudWxsO1xuXG5cdHJldHVybiBzYXZlQXM7XG59KFxuXHQgICB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmXG5cdHx8IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93XG5cdHx8IHRoaXMuY29udGVudFxuKSk7XG4vLyBgc2VsZmAgaXMgdW5kZWZpbmVkIGluIEZpcmVmb3ggZm9yIEFuZHJvaWQgY29udGVudCBzY3JpcHQgY29udGV4dFxuLy8gd2hpbGUgYHRoaXNgIGlzIG5zSUNvbnRlbnRGcmFtZU1lc3NhZ2VNYW5hZ2VyXG4vLyB3aXRoIGFuIGF0dHJpYnV0ZSBgY29udGVudGAgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgd2luZG93XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzLnNhdmVBcyA9IHNhdmVBcztcbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lICE9PSBudWxsKSAmJiAoZGVmaW5lLmFtZCAhPT0gbnVsbCkpIHtcbiAgZGVmaW5lKFwiRmlsZVNhdmVyLmpzXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIl19
