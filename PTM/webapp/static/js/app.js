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
        var username = globalUsername;
        var password = globalPassword;
        var startNode = $('#start-node').val();
        var endNode = $('#end-node').val();
        var time = parseInt($('#time').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        globalResultDijkstra = calcDijkstr.dijkstraCalculation(username, password, startNode, endNode, time, nodes, edges);
        var resultIterator = 1;
        for (var _i = 0, _a = globalResultDijkstra.responseJSON.result; _i < _a.length; _i++) {
            var result = _a[_i];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyIsIm5vZGVfbW9kdWxlcy9maWxlLXNhdmVyL0ZpbGVTYXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFHSTtJQUNBLENBQUM7SUFFTSw0Q0FBbUIsR0FBMUIsVUFBMkIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsQ0FBUyxFQUFFLEtBQVUsRUFBRSxLQUFVO1FBQ3hILEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNWLEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxF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LFVBQVcsR0FBVztRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBQ0wsZUFBQztBQUFELENBbkVBLEFBbUVDLElBQUE7QUFuRVksNEJBQVE7O0FDSnJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJkZWNsYXJlIHZhciAkOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgQWpheENvbnRyb2xsZXIge1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlqa3N0cmFDYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCBzdGFydCwgZW5kLCB0IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2RpamtzdHJhJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgZGF0YToganNvblRvcG9sb2d5LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJyYWhhbUNhbGN1bGF0aW9uKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nLCB0OiBudW1iZXIsIG5vZGVzOiBhbnksIGxpbmtzOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAoc3RhcnQgPT0gJ05ldHdvcmsnIHx8IGVuZCA9PSAnTmV0d29yaycpIHtcclxuICAgICAgICAgICAgdmFyIGpzb25Ub3BvbG9neSA9IEpTT04uc3RyaW5naWZ5KHsgdXNlcm5hbWUsIHBhc3N3b3JkLCBub2RlcywgbGlua3MsIHQgfSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCBzdGFydCwgZW5kLCB0IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL25vZGVwYWlyJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcclxuICAgICAgICAgICAgZGF0YToganNvblRvcG9sb2d5LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaWdudXAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxldCBqc29uU2lnbnVwID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQgfSk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NpZ251cCcsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgICAgICAgICBkYXRhOiBqc29uU2lnbnVwLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnVzZXIgPT0gXCJ3cm9uZ19wYXNzd29yZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1lcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGRhdGEudXNlciA9PSBcInZhbGlkXCIgfHwgZGF0YS51c2VyID09IFwiY3JlYXRlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1zdWNjZXNzJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1lcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL21vZGVscy9ub2RlJztcclxuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4vbW9kZWxzL2VkZ2UnO1xyXG5pbXBvcnQgeyBBamF4Q29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvYWpheC5jb250cm9sbGVyJztcclxuaW1wb3J0IHsgVG9wb2xvZ3kgfSBmcm9tICcuL21vZGVscy90b3BvbG9neSc7XHJcbmltcG9ydCAqIGFzIEZpbGVTYXZlciBmcm9tICdmaWxlLXNhdmVyJztcclxuXHJcbmRlY2xhcmUgdmFyIEZpbGVSZWFkZXI6IGFueTtcclxuZGVjbGFyZSB2YXIgdmlzOiBhbnk7XHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuZGVjbGFyZSB2YXIgRHJvcHpvbmU6IGFueTtcclxuXHJcbmxldCBub2RlczogTm9kZVtdID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbmxldCBlZGdlczogRWRnZVtdID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbmxldCB0b3BvbG9neTogVG9wb2xvZ3kgPSBuZXcgVG9wb2xvZ3koKTtcclxubGV0IGlzTm9kZVNlbGVjdGVkOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBuZXR3b3JrOiBhbnk7XHJcbmxldCBnbG9iYWxVc2VybmFtZTogc3RyaW5nID0gJyc7XHJcbmxldCBnbG9iYWxQYXNzd29yZDogc3RyaW5nID0gJyc7XHJcbmxldCBnbG9iYWxSZXN1bHREaWprc3RyYTogYW55O1xyXG5sZXQgZ2xvYmFsUmVzdWx0QWJyYWhhbTogYW55O1xyXG5sZXQgdmlzbm9kZXM6IGFueTtcclxubGV0IHZpc2VkZ2VzOiBhbnk7XHJcblxyXG5mdW5jdGlvbiByZW5kZXJUb3BvbG9neSgpIHtcclxuXHJcbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmsnKTtcclxuXHJcbiAgICAgdmlzbm9kZXMgPSBuZXcgdmlzLkRhdGFTZXQobm9kZXMpO1xyXG4gICAgIHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICBub2Rlczogdmlzbm9kZXMsXHJcbiAgICAgICAgZWRnZXM6IHZpc2VkZ2VzXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICB0b3BvbG9neS5zZXROb2Rlcyhub2Rlcyk7XHJcbiAgICB0b3BvbG9neS5zZXRFZGdlcyhlZGdlcyk7XHJcblxyXG4gICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgbm9kZXM6IHtcclxuICAgICAgICAgICAgc2hhcGU6ICdkb3QnLFxyXG4gICAgICAgICAgICBzaXplOiAzMCxcclxuICAgICAgICAgICAgY29sb3I6IHtcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlZGdlczoge1xyXG4gICAgICAgICAgICBwaHlzaWNzOiBmYWxzZSxcclxuICAgICAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgICAgIGxlbmd0aDogMTBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dDoge1xyXG4gICAgICAgICAgICByYW5kb21TZWVkOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYW5pcHVsYXRpb246IHtcclxuICAgICAgICAgICAgaW5pdGlhbGx5QWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYWRkTm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0Tm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFZGdlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5mcm9tID09IGRhdGEudG8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byBjb25uZWN0IHRoZSBub2RlIHRvIGl0c2VsZj9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgIT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0RWRnZToge1xyXG4gICAgICAgICAgICAgICAgZWRpdFdpdGhvdXREcmFnOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgcmVnaXN0ZXJFdmVudChuZXR3b3JrKTtcclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0Tm9kZShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZSA9IGRhdGEubGFiZWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IHNhdmVOb2RlRGF0YS5iaW5kKHRoaXMsIGRhdGEsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBjYW5jZWxOb2RlRWRpdC5iaW5kKHRoaXMsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnQoZGF0YTogYW55KSB7XHJcbiAgICBkYXRhLm9uKFwic2VsZWN0XCIsIGZ1bmN0aW9uIChwYXJhbXM6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhcmFtcyk7XHJcbiAgICAgICAgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPT0gMCAmJiBwYXJhbXMuZWRnZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2U6IEVkZ2UgPSB0b3BvbG9neS5nZXRFZGdlQnlJZChwYXJhbXMuZWRnZXNbJzAnXSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gJzxoMj5FZGdlPC9oMj4nICsgJzxwPjxzcGFuPkxhYmVsOiA8L3NwYW4+JyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RmFpbHVyZSByYXRlOjwvc3Bhbj4gJyArIGVkZ2UuZ2V0RmFpbHVyZVJhdGUoKSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+UmVwYWlyIHJhdGU6IDwvc3Bhbj4nICsgZWRnZS5nZXRSZXBhaXJSYXRlKCkgKyAnPC9wPic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbm9kZTogTm9kZSA9IHRvcG9sb2d5LmdldE5vZGVCeUlkKHBhcmFtcy5ub2Rlc1snMCddKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPk5vZGU8L2gyPicgKyAnPHA+PHNwYW4+TGFiZWw6IDwvc3Bhbj4nICsgcGFyYW1zLm5vZGVzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5FZGdlczogPC9zcGFuPicgKyBwYXJhbXMuZWRnZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkZhaWx1cmUgcmF0ZTogPC9zcGFuPicgKyBub2RlLmdldEZhaWx1cmVSYXRlKCkgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPlJlcGFpciByYXRlOiA8L3NwYW4+JyArIG5vZGUuZ2V0UmVwYWlyUmF0ZSgpICsgJzwvcD4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA9PSAwICYmIHBhcmFtcy5lZGdlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjbGVhck5vZGVQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxOb2RlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhck5vZGVQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVOb2RlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcblxyXG4gICAgbGV0IHRlbXBOb2RlOiBOb2RlID0gbmV3IE5vZGUoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIG5vZGVzLnB1c2godGVtcE5vZGUpO1xyXG4gICAgY2FsbGJhY2soZGF0YSk7XHJcbiAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctZ3JlZW4nPk5vZGUgYWRkZWQuLi48L2Rpdj5cIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAvLyBmaWxsaW5nIGluIHRoZSBwb3B1cCBET00gZWxlbWVudHNcclxuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1sYWJlbCcpKS52YWx1ZSA9IGRhdGEubGFiZWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1zYXZlQnV0dG9uJykub25jbGljayA9IHNhdmVFZGdlRGF0YS5iaW5kKHRoaXMsIGRhdGEsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBjYW5jZWxFZGdlRWRpdC5iaW5kKHRoaXMsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyRWRnZVBvcFVwKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbEVkZ2VFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGNsZWFyRWRnZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZUVkZ2VEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhLnRvID09PSAnb2JqZWN0JylcclxuICAgICAgICBkYXRhLnRvID0gZGF0YS50by5pZFxyXG4gICAgaWYgKHR5cGVvZiBkYXRhLmZyb20gPT09ICdvYmplY3QnKVxyXG4gICAgICAgIGRhdGEuZnJvbSA9IGRhdGEuZnJvbS5pZFxyXG4gICAgZGF0YS5sYWJlbCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1sYWJlbCcpKS52YWx1ZTtcclxuICAgIGRhdGEuaWQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtaWQnKSkudmFsdWU7XHJcbiAgICBkYXRhLmZhaWx1cmVSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1mYWlsdXJlUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLnJlcGFpclJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXJlcGFpclJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5sZW5ndGggPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxlbmd0aCcpKS52YWx1ZSk7XHJcbiAgICBsZXQgdGVtcEVkZ2U6IEVkZ2UgPSBuZXcgRWRnZShkYXRhLmxhYmVsLCBkYXRhLmlkLCBkYXRhLmZyb20sIGRhdGEudG8sIGRhdGEubGVuZ3RoLCBkYXRhLmZhaWx1cmVSYXRlLCBkYXRhLnJlcGFpclJhdGUpO1xyXG4gICAgZWRnZXMucHVzaCh0ZW1wRWRnZSk7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2soZGF0YSk7XHJcbiAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctZ3JlZW4nPkVkZ2UgYWRkZWQuLi48L2Rpdj5cIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFicmFoYW1Nb2RhbCgpIHtcclxuICAgIHNldFNlbGVjdGlvbk9wdGlvbnMoKTtcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2FsY3VsYXRlLWFicmFoYW0nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLXllbGxvdyc+Q2FsY3VsYXRpbmcgdXNpbmcgQWJyYWhhbSBhbGdvcml0aG0uLi48L2Rpdj5cIik7XHJcbiAgICAgICAgJCgnLnJlc3VsdHNBYnJhaGFtJykuZmluZCgnLnBhbmVsLWdyb3VwJykucmVtb3ZlKCk7XHJcbiAgICAgICAgbGV0IHVzZXJuYW1lID0gZ2xvYmFsVXNlcm5hbWU7XHJcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gZ2xvYmFsUGFzc3dvcmQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlLWFicmFoYW0nKS52YWwoKTtcclxuICAgICAgICBsZXQgZW5kTm9kZSA9ICQoJyNlbmQtbm9kZS1hYnJhaGFtJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSBwYXJzZUludCgkKCcjdGltZS1hYnJhaGFtJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGdsb2JhbFJlc3VsdEFicmFoYW0gPSBjYWxjRGlqa3N0ci5hYnJhaGFtQ2FsY3VsYXRpb24odXNlcm5hbWUsIHBhc3N3b3JkLCBzdGFydE5vZGUsIGVuZE5vZGUsIHRpbWUsIG5vZGVzLCBlZGdlcyk7XHJcbiAgICAgICAgbGV0IHJlc3VsdEl0ZXJhdG9yID0gMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gZ2xvYmFsUmVzdWx0QWJyYWhhbS5yZXNwb25zZUpTT04ucmVzdWx0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgZ2xvYmFsUmVzdWx0QWJyYWhhbS5yZXNwb25zZUpTT04ucmVzdWx0LmF2YWlsYWJpbGl0eSA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbjInIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIiBhcmlhLWV4cGFuZGVkPSdmYWxzZScgYXJpYS1jb250cm9scz0nXCIgKyBcImNvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiPlwiICsgXCJSZXN1bHQgXCIgKyByZXN1bHRJdGVyYXRvciArIFwiPC9hPiA8L2g0PiA8L2Rpdj4gPGRpdiBpZD0nXCIgKyBcImNvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eS5hdiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmxpdHkoYXYpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5yZWxpYWJpbGl0eVtcInMsdFwiXSArIFwiPC9kaXY+XCIgKyBcIjwvZGl2PiA8L2Rpdj4gPC9kaXY+XCIpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbjInIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIiBhcmlhLWV4cGFuZGVkPSdmYWxzZScgYXJpYS1jb250cm9scz0nXCIgKyBcImNvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiPlwiICsgXCJSZXN1bHQgXCIgKyByZXN1bHRJdGVyYXRvciArIFwiPC9hPiA8L2g0PiA8L2Rpdj4gPGRpdiBpZD0nXCIgKyBcImNvbGxhcHNlQWJyYWhhbVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQuYXZhaWxhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+Q2FsY3VsYXRpb24gZG9uZS4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaWprc3RyYU1vZGFsKCkge1xyXG4gICAgc2V0U2VsZWN0aW9uT3B0aW9ucygpO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2cteWVsbG93Jz5DYWxjdWxhdGluZyB1c2luZyBEaWprc3RyYSBhbGdvcml0aG0uLi48L2Rpdj5cIik7XHJcbiAgICAgICAgJCgnLnJlc3VsdHMnKS5maW5kKCcucGFuZWwtZ3JvdXAnKS5yZW1vdmUoKTtcclxuICAgICAgICBsZXQgdXNlcm5hbWUgPSBnbG9iYWxVc2VybmFtZTtcclxuICAgICAgICBsZXQgcGFzc3dvcmQgPSBnbG9iYWxQYXNzd29yZDtcclxuICAgICAgICBsZXQgc3RhcnROb2RlID0gJCgnI3N0YXJ0LW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgZW5kTm9kZSA9ICQoJyNlbmQtbm9kZScpLnZhbCgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gcGFyc2VJbnQoJCgnI3RpbWUnKS52YWwoKSk7XHJcbiAgICAgICAgbGV0IGNhbGNEaWprc3RyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgZ2xvYmFsUmVzdWx0RGlqa3N0cmEgPSBjYWxjRGlqa3N0ci5kaWprc3RyYUNhbGN1bGF0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCwgc3RhcnROb2RlLCBlbmROb2RlLCB0aW1lLCBub2RlcywgZWRnZXMpO1xyXG4gICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcbiAgICAgICAgZm9yIChsZXQgcmVzdWx0IG9mIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHQpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICQoJy5yZXN1bHRzJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24nIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIFwiUmVzdWx0IFwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4+UGF0aDE6IDwvc3Bhbj5cIiArIHJlc3VsdC5wYXRocy5wYXRoMSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UGF0aDI6IDwvc3Bhbj5cIiArIHJlc3VsdC5wYXRocy5wYXRoMiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eS5hdiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmxpdHkoYXYpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5yZWxpYWJpbGl0eVtcInMsdFwiXSArIFwiPC9kaXY+XCIgKyBcIjwvZGl2PiA8L2Rpdj4gPC9kaXY+XCIpO1xyXG4gICAgICAgICAgICByZXN1bHRJdGVyYXRvcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+Q2FsY3VsYXRpb24gZG9uZS4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHBvcnRUb3BvbG9neSgpIHtcclxuICAgICQoXCIuZXhwb3J0XCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyBub2RlcywgZWRnZXMgfSwgbnVsbCwgMik7XHJcbiAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbanNvblRvcG9sb2d5XSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOFwiIH0pO1xyXG4gICAgICAgIEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgXCJ0b3BvbG9neVwiICsgXCIuanNvblwiKTtcclxuXHJcbiAgICAgICAgJCgnI2V4cG9ydC10b3BvbG9neScpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctd2hpdGUnPlRvcG9sb2d5IGV4cG9ydGVkLi4uPC9kaXY+XCIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFNlbGVjdGlvbk9wdGlvbnMoKSB7XHJcbiAgICAkKCcjZXhhbXBsZU1vZGFsLCAjYWJyYWhhbU1vZGFsJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnI3N0YXJ0LW5vZGUsICNzdGFydC1ub2RlLWFicmFoYW0nKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKTtcclxuICAgICAgICAkKCcjZW5kLW5vZGUsICAjZW5kLW5vZGUtYWJyYWhhbScpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgJCgnI3N0YXJ0LW5vZGUsICNzdGFydC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArIG5vZGVzW2ldLmdldExhYmVsKCkgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgICQoJyNlbmQtbm9kZSwgI2VuZC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArIG5vZGVzW2ldLmdldExhYmVsKCkgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyAnTmV0d29yaycgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgJCgnI2VuZC1ub2RlLCAjZW5kLW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgJ05ldHdvcmsnICsgJzwvb3B0aW9uPicpO1xyXG4gICAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsZXRlTmV0d29yaygpIHtcclxuICAgICQoXCIjZGVsZXRlLXRvcG9sb2d5XCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBlZGdlcyA9IFtdO1xyXG4gICAgICAgIG5vZGVzID0gW107XHJcbiAgICAgICAgbmV0d29yay5kZXN0cm95KCk7XHJcbiAgICAgICAgbmV0d29yayA9IG51bGw7XHJcbiAgICAgICAgcmVuZGVyVG9wb2xvZ3koKTtcclxuICAgICAgICAgICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1yZWQnPk5ldHdvcmsgZGVsZXRlZC4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG52YXIganNvbjtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZVNlbGVjdCwgZmFsc2UpO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlRmlsZVNlbGVjdChldnQ6IGFueSkge1xyXG4gICAgdmFyIGZpbGVzID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcblxyXG4gICAgLy8gZmlsZXMgaXMgYSBGaWxlTGlzdCBvZiBGaWxlIG9iamVjdHMuIExpc3Qgc29tZSBwcm9wZXJ0aWVzLlxyXG4gICAgdmFyIG91dHB1dCA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGY7IGYgPSBmaWxlc1tpXTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIENsb3N1cmUgdG8gY2FwdHVyZSB0aGUgZmlsZSBpbmZvcm1hdGlvbi5cclxuICAgICAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uICh0aGVGaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgc2V0SW1wb3J0ZWRUb3BvbG9neShqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKGYpO1xyXG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGYpO1xyXG4gICAgICAgICAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLXdoaXRlJz5Ub3BvbG9neSBpbXBvcnRlZC4uLjwvZGl2PlwiKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEltcG9ydGVkVG9wb2xvZ3koanNvbjogYW55KSB7XHJcbiAgICBlZGdlcyA9IFtdO1xyXG4gICAgbm9kZXMgPSBbXTtcclxuICAgIGZvciAobGV0IG5vZGUgb2YganNvbi5ub2Rlcykge1xyXG4gICAgICAgIGxldCB0bXBOb2RlID0gbmV3IE5vZGUobm9kZS5sYWJlbCwgbm9kZS5pZCwgbm9kZS5mYWlsdXJlUmF0ZSwgbm9kZS5yZXBhaXJSYXRlKTtcclxuICAgICAgICBub2Rlcy5wdXNoKHRtcE5vZGUpO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgZWRnZSBvZiBqc29uLmVkZ2VzKSB7XHJcbiAgICAgICAgbGV0IHRtcEVkZ2UgPSBuZXcgRWRnZShlZGdlLmxhYmVsLCBlZGdlLmlkLCBlZGdlLmZyb20sIGVkZ2UudG8sIGVkZ2UubGVuZ3RoLCBlZGdlLmZhaWx1cmVSYXRlLCBlZGdlLnJlcGFpclJhdGUpO1xyXG4gICAgICAgIGVkZ2VzLnB1c2godG1wRWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cobm9kZXMpO1xyXG4gICAgY29uc29sZS5sb2coZWRnZXMpO1xyXG59XHJcblxyXG4kKCcuaW1wb3J0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbmV0d29yay5kZXN0cm95KCk7XHJcbiAgICBuZXR3b3JrID0gbnVsbDtcclxuICAgIHJlbmRlclRvcG9sb2d5KCk7XHJcbiAgICAkKCcjaW1wb3J0LXRvcG9sb2d5JykubW9kYWwoJ2hpZGUnKTtcclxufSk7XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tc3VjY2VzcycpLmhpZGUoKTtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tZXJyb3InKS5oaWRlKCk7XHJcbiAgICBpZiAoZ2xvYmFsVXNlcm5hbWUgPT0gJycgfHwgZ2xvYmFsUGFzc3dvcmQgPT0gJycpIHtcclxuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICQoJy5sb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gJCgnI3VzZXJuYW1lLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIGxldCBwYXNzd29yZCA9ICQoJyNwYXNzd29yZC1pbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgICAgICBnbG9iYWxQYXNzd29yZCA9IHBhc3N3b3JkO1xyXG4gICAgICAgICAgICBnbG9iYWxVc2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgICAgICBsZXQgc2lnbkFqYXggPSBuZXcgQWpheENvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgc2lnbkFqYXguc2lnbnVwKHVzZXJuYW1lLCBwYXNzd29yZCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxucmVuZGVyVG9wb2xvZ3koKTtcclxuZGlqa3N0cmFNb2RhbCgpO1xyXG5hYnJhaGFtTW9kYWwoKTtcclxuZXhwb3J0VG9wb2xvZ3koKTtcclxuZGVsZXRlTmV0d29yaygpO1xyXG4iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBcclxuICAgIC8qdmlzdWFsaXphdGlvbiovXHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgLypiYWNrZW5kIHBhcmFtZXRlcnMqL1xyXG4gICAgcHJpdmF0ZSBzcmM6IHN0cmluZztcclxuICAgIHByaXZhdGUgZGVzdDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZnJvbTpzdHJpbmcsIHRvOnN0cmluZywgbGVuZ3RoOm51bWJlciwgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcil7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgICAgIHRoaXMuc3JjID0gZnJvbTtcclxuICAgICAgICB0aGlzLmRlc3QgPSB0bztcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldFNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNyYztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTcmMoc3JjOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgIH1cclxuXHJcbiAgICBnZXREZXN0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXREZXN0KGRlc3Q6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExlbmd0aChsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZyb20oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb20oZnJvbTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUbygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvKHRvOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpIHsgXHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpOyBcclxuICAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIFxyXG59IiwiZXhwb3J0IGNsYXNzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgZmFpbHVyZVJhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVwYWlyUmF0ZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgc2V0RmFpbHVyZVJhdGUocmF0ZTogbnVtYmVyKTogdm9pZHtcclxuICAgICAgICB0aGlzLmZhaWx1cmVSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRSZXBhaXJSYXRlKHJhdGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVwYWlyUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0RmFpbHVyZVJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsdXJlUmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRSZXBhaXJSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwYWlyUmF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9lZGdlJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVG9wb2xvZ3kge1xyXG4gICAgcHJpdmF0ZSBub2RlczogQXJyYXk8Tm9kZT47XHJcbiAgICBwcml2YXRlIGxpbmtzOiBBcnJheTxFZGdlPjtcclxuXHJcbiAgICAvL0RJSktTVFJBIHBhcmFtZXRlcnMgLT4gc3RhcnQgJiBlbmQgbm9kZVxyXG4gICAgcHJpdmF0ZSBzdGFydDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBlbmQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVCeUlkKGlkOiBzdHJpbmcpOiBOb2RlIHtcclxuICAgICAgICBmb3IobGV0IG5vZGUgb2YgdGhpcy5ub2Rlcyl7XHJcbiAgICAgICAgICAgIGlmKG5vZGUuZ2V0SWQoKSA9PT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZUJ5SWQoaWQ6IHN0cmluZyk6IEVkZ2Uge1xyXG4gICAgICAgIGZvcihsZXQgZWRnZSBvZiB0aGlzLmxpbmtzKSB7XHJcbiAgICAgICAgICAgIGlmKGVkZ2UuZ2V0SWQoKSA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlZGdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVzKCk6IE5vZGVbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZXMoKTogRWRnZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGUobm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2Rlcyhub2RlczogTm9kZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2UoZWRnZTogRWRnZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MucHVzaChlZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlcyhlZGdlczogRWRnZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IGVkZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXJ0Tm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0O1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRTdGFydE5vZGUoc3RhcnQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgIH1cclxuICAgIGdldEVuZE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbmQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldEVuZE5vZGUoZW5kOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgIH1cclxufSIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjMuMlxuICogMjAxNi0wNi0xNiAxODoyNToxOVxuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIExpY2Vuc2U6IE1JVFxuICogICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiAqL1xuXG4vKmdsb2JhbCBzZWxmICovXG4vKmpzbGludCBiaXR3aXNlOiB0cnVlLCBpbmRlbnQ6IDQsIGxheGJyZWFrOiB0cnVlLCBsYXhjb21tYTogdHJ1ZSwgc21hcnR0YWJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xuXG52YXIgc2F2ZUFzID0gc2F2ZUFzIHx8IChmdW5jdGlvbih2aWV3KSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHQvLyBJRSA8MTAgaXMgZXhwbGljaXRseSB1bnN1cHBvcnRlZFxuXHRpZiAodHlwZW9mIHZpZXcgPT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXJcblx0XHQgIGRvYyA9IHZpZXcuZG9jdW1lbnRcblx0XHQgIC8vIG9ubHkgZ2V0IFVSTCB3aGVuIG5lY2Vzc2FyeSBpbiBjYXNlIEJsb2IuanMgaGFzbid0IG92ZXJyaWRkZW4gaXQgeWV0XG5cdFx0LCBnZXRfVVJMID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdmlldy5VUkwgfHwgdmlldy53ZWJraXRVUkwgfHwgdmlldztcblx0XHR9XG5cdFx0LCBzYXZlX2xpbmsgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLCBcImFcIilcblx0XHQsIGNhbl91c2Vfc2F2ZV9saW5rID0gXCJkb3dubG9hZFwiIGluIHNhdmVfbGlua1xuXHRcdCwgY2xpY2sgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBuZXcgTW91c2VFdmVudChcImNsaWNrXCIpO1xuXHRcdFx0bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHR9XG5cdFx0LCBpc19zYWZhcmkgPSAvY29uc3RydWN0b3IvaS50ZXN0KHZpZXcuSFRNTEVsZW1lbnQpIHx8IHZpZXcuc2FmYXJpXG5cdFx0LCBpc19jaHJvbWVfaW9zID0vQ3JpT1NcXC9bXFxkXSsvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHRocm93X291dHNpZGUgPSBmdW5jdGlvbihleCkge1xuXHRcdFx0KHZpZXcuc2V0SW1tZWRpYXRlIHx8IHZpZXcuc2V0VGltZW91dCkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGV4O1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHRcdCwgZm9yY2Vfc2F2ZWFibGVfdHlwZSA9IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0Ly8gbm90ZTogeW91ciBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBjb252ZXJ0IFVURi0xNiBVK0ZFRkYgdG8gRUYgQkIgQkZcblx0XHRcdGlmICgvXlxccyooPzp0ZXh0XFwvXFxTKnxhcHBsaWNhdGlvblxcL3htbHxcXFMqXFwvXFxTKlxcK3htbClcXHMqOy4qY2hhcnNldFxccyo9XFxzKnV0Zi04L2kudGVzdChibG9iLnR5cGUpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvYihbU3RyaW5nLmZyb21DaGFyQ29kZSgweEZFRkYpLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgZm9yY2UgPSB0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIGRpc3BhdGNoX2FsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvbiBhbnkgZmlsZXN5cyBlcnJvcnMgcmV2ZXJ0IHRvIHNhdmluZyB3aXRoIG9iamVjdCBVUkxzXG5cdFx0XHRcdCwgZnNfZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoKGlzX2Nocm9tZV9pb3MgfHwgKGZvcmNlICYmIGlzX3NhZmFyaSkpICYmIHZpZXcuRmlsZVJlYWRlcikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHVybCA9IGlzX2Nocm9tZV9pb3MgPyByZWFkZXIucmVzdWx0IDogcmVhZGVyLnJlc3VsdC5yZXBsYWNlKC9eZGF0YTpbXjtdKjsvLCAnZGF0YTphdHRhY2htZW50L2ZpbGU7Jyk7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3B1cCA9IHZpZXcub3Blbih1cmwsICdfYmxhbmsnKTtcblx0XHRcdFx0XHRcdFx0aWYoIXBvcHVwKSB2aWV3LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG5cdFx0XHRcdFx0XHRcdHVybD11bmRlZmluZWQ7IC8vIHJlbGVhc2UgcmVmZXJlbmNlIGJlZm9yZSBkaXNwYXRjaGluZ1xuXHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcblx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRvbid0IGNyZWF0ZSBtb3JlIG9iamVjdCBVUkxzIHRoYW4gbmVlZGVkXG5cdFx0XHRcdFx0aWYgKCFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGZvcmNlKSB7XG5cdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgb3BlbmVkID0gdmlldy5vcGVuKG9iamVjdF91cmwsIFwiX2JsYW5rXCIpO1xuXHRcdFx0XHRcdFx0aWYgKCFvcGVuZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQXBwbGUgZG9lcyBub3QgYWxsb3cgd2luZG93Lm9wZW4sIHNlZSBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvZG9jdW1lbnRhdGlvbi9Ub29scy9Db25jZXB0dWFsL1NhZmFyaUV4dGVuc2lvbkd1aWRlL1dvcmtpbmd3aXRoV2luZG93c2FuZFRhYnMvV29ya2luZ3dpdGhXaW5kb3dzYW5kVGFicy5odG1sXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXG5cdFx0XHRpZiAoY2FuX3VzZV9zYXZlX2xpbmspIHtcblx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdHNhdmVfbGluay5kb3dubG9hZCA9IG5hbWU7XG5cdFx0XHRcdFx0Y2xpY2soc2F2ZV9saW5rKTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZnNfZXJyb3IoKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lIHx8IGJsb2IubmFtZSB8fCBcImRvd25sb2FkXCIsIG5vX2F1dG9fYm9tKTtcblx0XHR9XG5cdDtcblx0Ly8gSUUgMTArIChuYXRpdmUgc2F2ZUFzKVxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYikge1xuXHRcdHJldHVybiBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0bmFtZSA9IG5hbWUgfHwgYmxvYi5uYW1lIHx8IFwiZG93bmxvYWRcIjtcblxuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IoYmxvYiwgbmFtZSk7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKXt9O1xuXHRGU19wcm90by5yZWFkeVN0YXRlID0gRlNfcHJvdG8uSU5JVCA9IDA7XG5cdEZTX3Byb3RvLldSSVRJTkcgPSAxO1xuXHRGU19wcm90by5ET05FID0gMjtcblxuXHRGU19wcm90by5lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVzdGFydCA9XG5cdEZTX3Byb3RvLm9ucHJvZ3Jlc3MgPVxuXHRGU19wcm90by5vbndyaXRlID1cblx0RlNfcHJvdG8ub25hYm9ydCA9XG5cdEZTX3Byb3RvLm9uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlZW5kID1cblx0XHRudWxsO1xuXG5cdHJldHVybiBzYXZlQXM7XG59KFxuXHQgICB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmXG5cdHx8IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93XG5cdHx8IHRoaXMuY29udGVudFxuKSk7XG4vLyBgc2VsZmAgaXMgdW5kZWZpbmVkIGluIEZpcmVmb3ggZm9yIEFuZHJvaWQgY29udGVudCBzY3JpcHQgY29udGV4dFxuLy8gd2hpbGUgYHRoaXNgIGlzIG5zSUNvbnRlbnRGcmFtZU1lc3NhZ2VNYW5hZ2VyXG4vLyB3aXRoIGFuIGF0dHJpYnV0ZSBgY29udGVudGAgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgd2luZG93XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzLnNhdmVBcyA9IHNhdmVBcztcbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lICE9PSBudWxsKSAmJiAoZGVmaW5lLmFtZCAhPT0gbnVsbCkpIHtcbiAgZGVmaW5lKFwiRmlsZVNhdmVyLmpzXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIl19
