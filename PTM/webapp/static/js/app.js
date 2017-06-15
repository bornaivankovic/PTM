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
                console.log(data.result);
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
            visedges.update([{ id: edge.getId(), color: '#97C2FC' }]);
        }
        var username = globalUsername;
        var password = globalPassword;
        var startNode = $('#start-node').val();
        var endNode = $('#end-node').val();
        var time = parseInt($('#time').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        globalResultDijkstra = calcDijkstr.dijkstraCalculation(username, password, startNode, endNode, time, nodes, edges);
        if (startNode != 'Network' && endNode != 'Network') {
            $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseSingleDijkstra" + "'" + " aria-expanded='false' aria-controls='" + "collapseSingleDijkstra" + "'" + ">" + "Result " + "</a> </h4> </div> <div id='" + "collapseSingleDijkstra" + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span class='availability-output'>Availability: </span>" + globalResultDijkstra.responseJSON.result['0'].total.availability + "</div>" + "<div><span id='reliability-output'>Reliablity: </span>" + globalResultDijkstra.responseJSON.result['0'].total.reliability + "</div>" + "<hr>" + "<div><span>Primary path: </span>" + globalResultDijkstra.responseJSON.result['0'].primary.path + "</div>" + "<div><span>Primary path availability: </span>" + globalResultDijkstra.responseJSON.result['0'].primary.availability + "</div>" + "<div><span>Primary path reliability: </span>" + globalResultDijkstra.responseJSON.result['0'].primary.reliability + "</div>" + "<hr>" + "<div><span>Secondary path: </span>" + globalResultDijkstra.responseJSON.result['0'].secondary.path + "</div>" + "<div><span>Secondary path availability: </span>" + globalResultDijkstra.responseJSON.result['0'].secondary.availability + "</div>" + "<div><span>Secondary path reliability: </span>" + globalResultDijkstra.responseJSON.result['0'].secondary.reliability + "</div>" + "</div> </div> </div>");
        }
        else {
            $('.results').append("<div class='panel-group blue' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='blue-heading'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseHead" + "'" + " aria-expanded='false' aria-controls='" + "collapseHead" + "'" + ">" + "Availability & Reliability " + "</a> </h4> </div> <div id='" + "collapseHead" + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span class='availability-output'>Availability (av): </span>" + globalResultDijkstra.responseJSON.availability.av + "</div>" + "<div><span class='reliability-output'>Availability (s,t): </span>" + globalResultDijkstra.responseJSON.availability['s,t'] + "</div>" + "<hr>" + "<div><span class='availability-output'>Reliability (av): </span>" + globalResultDijkstra.responseJSON.reliability.av + "</div>" + "<div><span class='reliability-output'>Reliability (s,t): </span>" + globalResultDijkstra.responseJSON.reliability['s,t'] + "</div>" + "</div> </div> </div>");
            var resultIterator = 1;
            for (var _a = 0, _b = globalResultDijkstra.responseJSON.result; _a < _b.length; _a++) {
                var result = _b[_a];
                $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapse" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapse" + resultIterator + "'" + ">" + "Result " + "</a> </h4> </div> <div id='" + "collapse" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span class='availability-output'>Availability: </span>" + result.total.availability + "</div>" + "<div><span id='reliability-output'>Reliablity: </span>" + result.total.reliability + "</div>" + "<hr>" + "<div><span>Primary path: </span>" + result.primary.path + "</div>" + "<div><span>Primary path availability: </span>" + result.primary.availability + "</div>" + "<div><span>Primary path reliability: </span>" + result.primary.reliability + "</div>" + "<hr>" + "<div><span>Secondary path: </span>" + result.secondary.path + "</div>" + "<div><span>Secondary path availability: </span>" + result.secondary.availability + "</div>" + "<div><span>Secondary path reliability: </span>" + result.secondary.reliability + "</div>" + "</div> </div> </div>");
                resultIterator++;
            }
        }
        /*let primaryPath = globalResultDijkstra.responseJSON.result['0'].paths.path1.split("-");
        if (globalResultDijkstra.responseJSON.result['0'].paths.path2) {
            let secondaryPath = globalResultDijkstra.responseJSON.result['0'].paths.path2.split("-");

            let start = 0;
            let end = 1
            for (let colorPath of secondaryPath) {
                for (let edge of edges) {
                    if ((edge.getFrom() == secondaryPath[end] && edge.getTo() == secondaryPath[start] && end <= edges.length) || (edge.getFrom() == secondaryPath[start] && edge.getTo() == secondaryPath[end] && end <= edges.length)) {
                        console.log();
                        visedges.update([{ id: edge.getId(), color: 'green' }]);
                    }
                }
                start++;
                end++;
            }

        }*/
        /*let start = 0;
        let end = 1
        for (let colorPath of primaryPath) {
            for (let edge of edges) {
                if ((edge.getFrom() == primaryPath[end] && edge.getTo() == primaryPath[start] && end <= primaryPath.length) || (edge.getFrom() == primaryPath[start] && edge.getTo() == primaryPath[end] && end <= edges.length)) {
                    console.log();
                    visedges.update([{ id: edge.getId(), color: 'red' }]);
                }
            }
            start++;
            end++;
        }*/
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
        /*for (let result of globalResultDijkstra.responseJSON.result) {

            console.log(result);
            $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapse" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapse" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapse" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Path1: </span>" + result.paths.path1 + "</div>" + "<div><span>Path2: </span>" + result.paths.path2 + "</div>" + "<div><span>Availability(av): </span>" + result.availability.av + "</div>" + "<div><span>Availability(s,t): </span>" + result.availability["s,t"] + "</div>" + "<div><span>Reliablity(av): </span>" + result.reliability.av + "</div>" + "<div><span>Reliability(s,t): </span>" + result.reliability["s,t"] + "</div>" + "</div> </div> </div>");
            resultIterator++;
        }*/
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyIsIm5vZGVfbW9kdWxlcy9maWxlLXNhdmVyL0ZpbGVTYXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFHSTtJQUNBLENBQUM7SUFFTSw0Q0FBbUIsR0FBMUIsVUFBMkIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsQ0FBUyxFQUFFLEtBQVUsRUFBRSxLQUFVO1FBQ3hILEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNWLEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxF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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZGVjbGFyZSB2YXIgJDogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEFqYXhDb250cm9sbGVyIHtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpamtzdHJhQ2FsY3VsYXRpb24odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIHQ6IG51bWJlciwgbm9kZXM6IGFueSwgbGlua3M6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChzdGFydCA9PSAnTmV0d29yaycgfHwgZW5kID09ICdOZXR3b3JrJykge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgdCB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgc3RhcnQsIGVuZCwgdCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9kaWprc3RyYScsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YS5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhYnJhaGFtQ2FsY3VsYXRpb24odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIHQ6IG51bWJlciwgbm9kZXM6IGFueSwgbGlua3M6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChzdGFydCA9PSAnTmV0d29yaycgfHwgZW5kID09ICdOZXR3b3JrJykge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgdCB9KTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGpzb25Ub3BvbG9neSA9IEpTT04uc3RyaW5naWZ5KHsgdXNlcm5hbWUsIHBhc3N3b3JkLCBub2RlcywgbGlua3MsIHN0YXJ0LCBlbmQsIHQgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvbm9kZXBhaXInLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxyXG4gICAgICAgICAgICBkYXRhOiBqc29uVG9wb2xvZ3ksXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNpZ251cCh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGpzb25TaWdudXAgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCB9KTtcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvc2lnbnVwJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25TaWdudXAsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEudXNlciA9PSBcIndyb25nX3Bhc3N3b3JkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLWVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZGF0YS51c2VyID09IFwidmFsaWRcIiB8fCBkYXRhLnVzZXIgPT0gXCJjcmVhdGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLXN1Y2Nlc3MnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLWVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbW9kZWxzL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9tb2RlbHMvZWRnZSc7XHJcbmltcG9ydCB7IEFqYXhDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVycy9hamF4LmNvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBUb3BvbG9neSB9IGZyb20gJy4vbW9kZWxzL3RvcG9sb2d5JztcclxuaW1wb3J0ICogYXMgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xyXG5cclxuZGVjbGFyZSB2YXIgRmlsZVJlYWRlcjogYW55O1xyXG5kZWNsYXJlIHZhciB2aXM6IGFueTtcclxuZGVjbGFyZSB2YXIgJDogYW55O1xyXG5kZWNsYXJlIHZhciBEcm9wem9uZTogYW55O1xyXG5cclxubGV0IG5vZGVzOiBOb2RlW10gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxubGV0IGVkZ2VzOiBFZGdlW10gPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxubGV0IHRvcG9sb2d5OiBUb3BvbG9neSA9IG5ldyBUb3BvbG9neSgpO1xyXG5sZXQgaXNOb2RlU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG5ldHdvcms6IGFueTtcclxubGV0IGdsb2JhbFVzZXJuYW1lOiBzdHJpbmcgPSAnJztcclxubGV0IGdsb2JhbFBhc3N3b3JkOiBzdHJpbmcgPSAnJztcclxubGV0IGdsb2JhbFJlc3VsdERpamtzdHJhOiBhbnk7XHJcbmxldCBnbG9iYWxSZXN1bHRBYnJhaGFtOiBhbnk7XHJcbmxldCB2aXNub2RlczogYW55O1xyXG5sZXQgdmlzZWRnZXM6IGFueTtcclxuXHJcbmZ1bmN0aW9uIHJlbmRlclRvcG9sb2d5KCkge1xyXG5cclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yaycpO1xyXG5cclxuICAgIHZpc25vZGVzID0gbmV3IHZpcy5EYXRhU2V0KG5vZGVzKTtcclxuICAgIHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICBub2Rlczogdmlzbm9kZXMsXHJcbiAgICAgICAgZWRnZXM6IHZpc2VkZ2VzXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICB0b3BvbG9neS5zZXROb2Rlcyhub2Rlcyk7XHJcbiAgICB0b3BvbG9neS5zZXRFZGdlcyhlZGdlcyk7XHJcblxyXG4gICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgbm9kZXM6IHtcclxuICAgICAgICAgICAgc2hhcGU6ICdkb3QnLFxyXG4gICAgICAgICAgICBzaXplOiAzMCxcclxuICAgICAgICAgICAgY29sb3I6IHtcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlZGdlczoge1xyXG4gICAgICAgICAgICBwaHlzaWNzOiBmYWxzZSxcclxuICAgICAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgICAgIGxlbmd0aDogMTBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dDoge1xyXG4gICAgICAgICAgICByYW5kb21TZWVkOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYW5pcHVsYXRpb246IHtcclxuICAgICAgICAgICAgaW5pdGlhbGx5QWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYWRkTm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0Tm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFZGdlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5mcm9tID09IGRhdGEudG8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byBjb25uZWN0IHRoZSBub2RlIHRvIGl0c2VsZj9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgIT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0RWRnZToge1xyXG4gICAgICAgICAgICAgICAgZWRpdFdpdGhvdXREcmFnOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgcmVnaXN0ZXJFdmVudChuZXR3b3JrKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVkaXROb2RlKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZU5vZGVEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbE5vZGVFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJFdmVudChkYXRhOiBhbnkpIHtcclxuICAgIGRhdGEub24oXCJzZWxlY3RcIiwgZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGFyYW1zKTtcclxuICAgICAgICBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA9PSAwICYmIHBhcmFtcy5lZGdlcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZWRnZTogRWRnZSA9IHRvcG9sb2d5LmdldEVkZ2VCeUlkKHBhcmFtcy5lZGdlc1snMCddKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPkVkZ2U8L2gyPicgKyAnPHA+PHNwYW4+TGFiZWw6IDwvc3Bhbj4nICsgcGFyYW1zLmVkZ2VzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5GYWlsdXJlIHJhdGU6PC9zcGFuPiAnICsgZWRnZS5nZXRGYWlsdXJlUmF0ZSgpICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5SZXBhaXIgcmF0ZTogPC9zcGFuPicgKyBlZGdlLmdldFJlcGFpclJhdGUoKSArICc8L3A+JztcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlOiBOb2RlID0gdG9wb2xvZ3kuZ2V0Tm9kZUJ5SWQocGFyYW1zLm5vZGVzWycwJ10pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9ICc8aDI+Tm9kZTwvaDI+JyArICc8cD48c3Bhbj5MYWJlbDogPC9zcGFuPicgKyBwYXJhbXMubm9kZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkVkZ2VzOiA8L3NwYW4+JyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RmFpbHVyZSByYXRlOiA8L3NwYW4+JyArIG5vZGUuZ2V0RmFpbHVyZVJhdGUoKSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+UmVwYWlyIHJhdGU6IDwvc3Bhbj4nICsgbm9kZS5nZXRSZXBhaXJSYXRlKCkgKyAnPC9wPic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID09IDAgJiYgcGFyYW1zLmVkZ2VzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsZWFyTm9kZVBvcFVwKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbE5vZGVFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZU5vZGVEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgZGF0YS5sYWJlbCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZTtcclxuICAgIGRhdGEuaWQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtaWQnKSkudmFsdWU7XHJcbiAgICBkYXRhLmZhaWx1cmVSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1mYWlsdXJlUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLnJlcGFpclJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXJlcGFpclJhdGUnKSkudmFsdWUpO1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuXHJcbiAgICBsZXQgdGVtcE5vZGU6IE5vZGUgPSBuZXcgTm9kZShkYXRhLmxhYmVsLCBkYXRhLmlkLCBkYXRhLmZhaWx1cmVSYXRlLCBkYXRhLnJlcGFpclJhdGUpO1xyXG4gICAgbm9kZXMucHVzaCh0ZW1wTm9kZSk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+Tm9kZSBhZGRlZC4uLjwvZGl2PlwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZUVkZ2VEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbEVkZ2VFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJFZGdlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsRWRnZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlRWRnZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEudG8gPT09ICdvYmplY3QnKVxyXG4gICAgICAgIGRhdGEudG8gPSBkYXRhLnRvLmlkXHJcbiAgICBpZiAodHlwZW9mIGRhdGEuZnJvbSA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS5mcm9tID0gZGF0YS5mcm9tLmlkXHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgZGF0YS5pZCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1pZCcpKS52YWx1ZTtcclxuICAgIGRhdGEuZmFpbHVyZVJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWZhaWx1cmVSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEucmVwYWlyUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcmVwYWlyUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLmxlbmd0aCA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGVuZ3RoJykpLnZhbHVlKTtcclxuICAgIGxldCB0ZW1wRWRnZTogRWRnZSA9IG5ldyBFZGdlKGRhdGEubGFiZWwsIGRhdGEuaWQsIGRhdGEuZnJvbSwgZGF0YS50bywgZGF0YS5sZW5ndGgsIGRhdGEuZmFpbHVyZVJhdGUsIGRhdGEucmVwYWlyUmF0ZSk7XHJcbiAgICBlZGdlcy5wdXNoKHRlbXBFZGdlKTtcclxuICAgIGNsZWFyRWRnZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+RWRnZSBhZGRlZC4uLjwvZGl2PlwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWJyYWhhbU1vZGFsKCkge1xyXG4gICAgc2V0U2VsZWN0aW9uT3B0aW9ucygpO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUtYWJyYWhhbScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2cteWVsbG93Jz5DYWxjdWxhdGluZyB1c2luZyBBYnJhaGFtIGFsZ29yaXRobS4uLjwvZGl2PlwiKTtcclxuICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5maW5kKCcucGFuZWwtZ3JvdXAnKS5yZW1vdmUoKTtcclxuICAgICAgICBsZXQgdXNlcm5hbWUgPSBnbG9iYWxVc2VybmFtZTtcclxuICAgICAgICBsZXQgcGFzc3dvcmQgPSBnbG9iYWxQYXNzd29yZDtcclxuICAgICAgICBsZXQgc3RhcnROb2RlID0gJCgnI3N0YXJ0LW5vZGUtYWJyYWhhbScpLnZhbCgpO1xyXG4gICAgICAgIGxldCBlbmROb2RlID0gJCgnI2VuZC1ub2RlLWFicmFoYW0nKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lLWFicmFoYW0nKS52YWwoKSk7XHJcbiAgICAgICAgbGV0IGNhbGNEaWprc3RyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgZ2xvYmFsUmVzdWx0QWJyYWhhbSA9IGNhbGNEaWprc3RyLmFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgdGltZSwgbm9kZXMsIGVkZ2VzKTtcclxuXHJcblxyXG4gICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGdsb2JhbFJlc3VsdEFicmFoYW0ucmVzcG9uc2VKU09OLnJlc3VsdDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodHlwZW9mIGdsb2JhbFJlc3VsdEFicmFoYW0ucmVzcG9uc2VKU09OLnJlc3VsdC5hdmFpbGFiaWxpdHkgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHNBYnJhaGFtJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24yJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdoZWFkaW5nT25lJz4gPGg0IGNsYXNzPSdwYW5lbC10aXRsZSAgdGV4dC1jZW50ZXInPiA8YSByb2xlPSdidXR0b24nIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS1wYXJlbnQ9JyNhY2NvcmRpb24nIGhyZWY9J1wiICsgXCIjY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIFwiUmVzdWx0IFwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShhdik6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQuYXZhaWxhYmlsaXR5W1wicyx0XCJdICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5LmF2ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHNBYnJhaGFtJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24yJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdoZWFkaW5nT25lJz4gPGg0IGNsYXNzPSdwYW5lbC10aXRsZSAgdGV4dC1jZW50ZXInPiA8YSByb2xlPSdidXR0b24nIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS1wYXJlbnQ9JyNhY2NvcmRpb24nIGhyZWY9J1wiICsgXCIjY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIFwiUmVzdWx0IFwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UmVsaWFibGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctZ3JlZW4nPkNhbGN1bGF0aW9uIGRvbmUuLi48L2Rpdj5cIik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlqa3N0cmFNb2RhbCgpIHtcclxuICAgIHNldFNlbGVjdGlvbk9wdGlvbnMoKTtcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2FsY3VsYXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy15ZWxsb3cnPkNhbGN1bGF0aW5nIHVzaW5nIERpamtzdHJhIGFsZ29yaXRobS4uLjwvZGl2PlwiKTtcclxuICAgICAgICAkKCcucmVzdWx0cycpLmZpbmQoJy5wYW5lbC1ncm91cCcpLnJlbW92ZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGVkZ2Ugb2YgZWRnZXMpIHtcclxuICAgICAgICAgICAgdmlzZWRnZXMudXBkYXRlKFt7IGlkOiBlZGdlLmdldElkKCksIGNvbG9yOiAnIzk3QzJGQycgfV0pO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHVzZXJuYW1lID0gZ2xvYmFsVXNlcm5hbWU7XHJcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gZ2xvYmFsUGFzc3dvcmQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlJykudmFsKCk7XHJcbiAgICAgICAgbGV0IGVuZE5vZGUgPSAkKCcjZW5kLW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGdsb2JhbFJlc3VsdERpamtzdHJhID0gY2FsY0RpamtzdHIuZGlqa3N0cmFDYWxjdWxhdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgdGltZSwgbm9kZXMsIGVkZ2VzKTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0Tm9kZSAhPSAnTmV0d29yaycgJiYgZW5kTm9kZSAhPSAnTmV0d29yaycpIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHMnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbicgcm9sZT0ndGFibGlzdCcgYXJpYS1tdWx0aXNlbGVjdGFibGU9J3RydWUnPiA8ZGl2IGNsYXNzPSdwYW5lbCBwYW5lbC1kZWZhdWx0Jz4gPGRpdiBjbGFzcz0ncGFuZWwtaGVhZGluZycgcm9sZT0ndGFiJyBpZD0naGVhZGluZ09uZSc+IDxoNCBjbGFzcz0ncGFuZWwtdGl0bGUgIHRleHQtY2VudGVyJz4gPGEgcm9sZT0nYnV0dG9uJyBkYXRhLXRvZ2dsZT0nY29sbGFwc2UnIGRhdGEtcGFyZW50PScjYWNjb3JkaW9uJyBocmVmPSdcIiArIFwiI2NvbGxhcHNlU2luZ2xlRGlqa3N0cmFcIiArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZVNpbmdsZURpamtzdHJhXCIgKyBcIidcIiArIFwiPlwiICsgXCJSZXN1bHQgXCIgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZVNpbmdsZURpamtzdHJhXCIgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J2F2YWlsYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnRvdGFsLmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4gaWQ9J3JlbGlhYmlsaXR5LW91dHB1dCc+UmVsaWFibGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnRvdGFsLnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuPlByaW1hcnkgcGF0aDogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnByaW1hcnkucGF0aCArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UHJpbWFyeSBwYXRoIGF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnByaW1hcnkuYXZhaWxhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5QcmltYXJ5IHBhdGggcmVsaWFiaWxpdHk6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wcmltYXJ5LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnBhdGggKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoIGF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnNlY29uZGFyeS5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoIHJlbGlhYmlsaXR5OiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHMnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBibHVlJyBpZD0nYWNjb3JkaW9uJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdibHVlLWhlYWRpbmcnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUhlYWRcIiArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZUhlYWRcIiAgKyBcIidcIiArIFwiPlwiICsgXCJBdmFpbGFiaWxpdHkgJiBSZWxpYWJpbGl0eSBcIiArIFwiPC9hPiA8L2g0PiA8L2Rpdj4gPGRpdiBpZD0nXCIgKyBcImNvbGxhcHNlSGVhZFwiICArIFwiJ1wiICsgXCJjbGFzcz0ncGFuZWwtY29sbGFwc2UgY29sbGFwc2UnIHJvbGU9J3RhYnBhbmVsJyBhcmlhLWxhYmVsbGVkYnk9J2hlYWRpbmdPbmUnPiA8ZGl2IGNsYXNzPSdwYW5lbC1ib2R5Jz5cIiArIFwiPGRpdj48c3BhbiBjbGFzcz0nYXZhaWxhYmlsaXR5LW91dHB1dCc+QXZhaWxhYmlsaXR5IChhdik6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5hdmFpbGFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdyZWxpYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eSAocyx0KTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLmF2YWlsYWJpbGl0eVsncyx0J10gKyBcIjwvZGl2PlwiICsgXCI8aHI+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J2F2YWlsYWJpbGl0eS1vdXRwdXQnPlJlbGlhYmlsaXR5IChhdik6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZWxpYWJpbGl0eS5hdiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J3JlbGlhYmlsaXR5LW91dHB1dCc+UmVsaWFiaWxpdHkgKHMsdCk6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZWxpYWJpbGl0eVsncyx0J10gKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdEl0ZXJhdG9yID0gMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcmVzdWx0IG9mIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5yZXN1bHRzJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24nIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIFwiUmVzdWx0IFwiICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdhdmFpbGFiaWxpdHktb3V0cHV0Jz5BdmFpbGFiaWxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC50b3RhbC5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuIGlkPSdyZWxpYWJpbGl0eS1vdXRwdXQnPlJlbGlhYmxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC50b3RhbC5yZWxpYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxocj5cIiArIFwiPGRpdj48c3Bhbj5QcmltYXJ5IHBhdGg6IDwvc3Bhbj5cIiArIHJlc3VsdC5wcmltYXJ5LnBhdGggKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlByaW1hcnkgcGF0aCBhdmFpbGFiaWxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC5wcmltYXJ5LmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UHJpbWFyeSBwYXRoIHJlbGlhYmlsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQucHJpbWFyeS5yZWxpYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxocj5cIiArIFwiPGRpdj48c3Bhbj5TZWNvbmRhcnkgcGF0aDogPC9zcGFuPlwiICsgcmVzdWx0LnNlY29uZGFyeS5wYXRoICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5TZWNvbmRhcnkgcGF0aCBhdmFpbGFiaWxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC5zZWNvbmRhcnkuYXZhaWxhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5TZWNvbmRhcnkgcGF0aCByZWxpYWJpbGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LnNlY29uZGFyeS5yZWxpYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjwvZGl2PiA8L2Rpdj4gPC9kaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0SXRlcmF0b3IrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmxldCBwcmltYXJ5UGF0aCA9IGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMS5zcGxpdChcIi1cIik7XHJcbiAgICAgICAgaWYgKGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMikge1xyXG4gICAgICAgICAgICBsZXQgc2Vjb25kYXJ5UGF0aCA9IGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wYXRocy5wYXRoMi5zcGxpdChcIi1cIik7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kID0gMVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2xvclBhdGggb2Ygc2Vjb25kYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZWRnZSBvZiBlZGdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgoZWRnZS5nZXRGcm9tKCkgPT0gc2Vjb25kYXJ5UGF0aFtlbmRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBzZWNvbmRhcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gZWRnZXMubGVuZ3RoKSB8fCAoZWRnZS5nZXRGcm9tKCkgPT0gc2Vjb25kYXJ5UGF0aFtzdGFydF0gJiYgZWRnZS5nZXRUbygpID09IHNlY29uZGFyeVBhdGhbZW5kXSAmJiBlbmQgPD0gZWRnZXMubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdncmVlbicgfV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICBlbmQrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9Ki9cclxuXHJcblxyXG4gICAgICAgIC8qbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBsZXQgZW5kID0gMVxyXG4gICAgICAgIGZvciAobGV0IGNvbG9yUGF0aCBvZiBwcmltYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGVkZ2UuZ2V0RnJvbSgpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gcHJpbWFyeVBhdGgubGVuZ3RoKSB8fCAoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBwcmltYXJ5UGF0aFtlbmRdICYmIGVuZCA8PSBlZGdlcy5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdyZWQnIH1dKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBlbmQrKztcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgLyppZihnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10ucGF0aHMucGF0aDIpIHtcclxuICAgICAgICAgICAgdmFyIHNlY29uZGFyeVBhdGggPSBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10ucGF0aHMucGF0aDIuc3BsaXQoXCItXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSAxXHJcbiAgICAgICAgICAgIGlmIChlZGdlLmdldEZyb20oKSA9PSBzZWNvbmRhcnlQYXRoW2VuZF0gJiYgZWRnZS5nZXRUbygpID09IHNlY29uZGFyeVBhdGhbc3RhcnRdICYmIGVuZCA8PSBzZWNvbmRhcnlQYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgIHZpc2VkZ2VzLnVwZGF0ZShbeyBpZDogZWRnZS5nZXRJZCgpLCBjb2xvcjogJ2dyZWVuJyB9XSk7XHJcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBlbmQgPSAxO1xyXG4gICAgICAgICAgICBpZigoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbZW5kXSAmJiBlZGdlLmdldFRvKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVuZCA8PSBwcmltYXJ5UGF0aC5sZW5ndGgpIHx8IChlZGdlLmdldEZyb20oKSA9PSBwcmltYXJ5UGF0aFtzdGFydF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZW5kIDw9IGVkZ2VzLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XHJcbiAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdyZWQnIH1dKTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICBlbmQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gICAqL1xyXG4gICAgICAgIC8qZm9yIChsZXQgcmVzdWx0IG9mIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHQpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICQoJy5yZXN1bHRzJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24nIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIFwiUmVzdWx0IFwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4+UGF0aDE6IDwvc3Bhbj5cIiArIHJlc3VsdC5wYXRocy5wYXRoMSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UGF0aDI6IDwvc3Bhbj5cIiArIHJlc3VsdC5wYXRocy5wYXRoMiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eS5hdiArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmxpdHkoYXYpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmlsaXR5KHMsdCk6IDwvc3Bhbj5cIiArIHJlc3VsdC5yZWxpYWJpbGl0eVtcInMsdFwiXSArIFwiPC9kaXY+XCIgKyBcIjwvZGl2PiA8L2Rpdj4gPC9kaXY+XCIpO1xyXG4gICAgICAgICAgICByZXN1bHRJdGVyYXRvcisrO1xyXG4gICAgICAgIH0qL1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+Q2FsY3VsYXRpb24gZG9uZS4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHBvcnRUb3BvbG9neSgpIHtcclxuICAgICQoXCIuZXhwb3J0XCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyBub2RlcywgZWRnZXMgfSwgbnVsbCwgMik7XHJcbiAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbanNvblRvcG9sb2d5XSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOFwiIH0pO1xyXG4gICAgICAgIEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgXCJ0b3BvbG9neVwiICsgXCIuanNvblwiKTtcclxuXHJcbiAgICAgICAgJCgnI2V4cG9ydC10b3BvbG9neScpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLXdoaXRlJz5Ub3BvbG9neSBleHBvcnRlZC4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRTZWxlY3Rpb25PcHRpb25zKCkge1xyXG4gICAgJCgnI2V4YW1wbGVNb2RhbCwgI2FicmFoYW1Nb2RhbCcpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCk7XHJcbiAgICAgICAgJCgnI2VuZC1ub2RlLCAgI2VuZC1ub2RlLWFicmFoYW0nKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyBub2Rlc1tpXS5nZXRMYWJlbCgpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICAgICAkKCcjZW5kLW5vZGUsICNlbmQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyBub2Rlc1tpXS5nZXRMYWJlbCgpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcjc3RhcnQtbm9kZSwgI3N0YXJ0LW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgJ05ldHdvcmsnICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICQoJyNlbmQtbm9kZSwgI2VuZC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArICdOZXR3b3JrJyArICc8L29wdGlvbj4nKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlbGV0ZU5ldHdvcmsoKSB7XHJcbiAgICAkKFwiI2RlbGV0ZS10b3BvbG9neVwiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZWRnZXMgPSBbXTtcclxuICAgICAgICBub2RlcyA9IFtdO1xyXG4gICAgICAgIG5ldHdvcmsuZGVzdHJveSgpO1xyXG4gICAgICAgIG5ldHdvcmsgPSBudWxsO1xyXG4gICAgICAgIHJlbmRlclRvcG9sb2d5KCk7XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLXJlZCc+TmV0d29yayBkZWxldGVkLi4uPC9kaXY+XCIpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbnZhciBqc29uO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGUnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVGaWxlU2VsZWN0LCBmYWxzZSk7XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVGaWxlU2VsZWN0KGV2dDogYW55KSB7XHJcbiAgICB2YXIgZmlsZXMgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuXHJcbiAgICAvLyBmaWxlcyBpcyBhIEZpbGVMaXN0IG9mIEZpbGUgb2JqZWN0cy4gTGlzdCBzb21lIHByb3BlcnRpZXMuXHJcbiAgICB2YXIgb3V0cHV0ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMCwgZjsgZiA9IGZpbGVzW2ldOyBpKyspIHtcclxuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc3VyZSB0byBjYXB0dXJlIHRoZSBmaWxlIGluZm9ybWF0aW9uLlxyXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKHRoZUZpbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBzZXRJbXBvcnRlZFRvcG9sb2d5KGpzb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkoZik7XHJcbiAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZik7XHJcbiAgICAgICAgJCgnLmNhbGN1bGF0aW9uLWNvbnRhaW5lcicpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3N1Y2Nlc3MtbXNnLXdoaXRlJz5Ub3BvbG9neSBpbXBvcnRlZC4uLjwvZGl2PlwiKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEltcG9ydGVkVG9wb2xvZ3koanNvbjogYW55KSB7XHJcbiAgICBlZGdlcyA9IFtdO1xyXG4gICAgbm9kZXMgPSBbXTtcclxuICAgIGZvciAobGV0IG5vZGUgb2YganNvbi5ub2Rlcykge1xyXG4gICAgICAgIGxldCB0bXBOb2RlID0gbmV3IE5vZGUobm9kZS5sYWJlbCwgbm9kZS5pZCwgbm9kZS5mYWlsdXJlUmF0ZSwgbm9kZS5yZXBhaXJSYXRlKTtcclxuICAgICAgICBub2Rlcy5wdXNoKHRtcE5vZGUpO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgZWRnZSBvZiBqc29uLmVkZ2VzKSB7XHJcbiAgICAgICAgbGV0IHRtcEVkZ2UgPSBuZXcgRWRnZShlZGdlLmxhYmVsLCBlZGdlLmlkLCBlZGdlLmZyb20sIGVkZ2UudG8sIGVkZ2UubGVuZ3RoLCBlZGdlLmZhaWx1cmVSYXRlLCBlZGdlLnJlcGFpclJhdGUpO1xyXG4gICAgICAgIGVkZ2VzLnB1c2godG1wRWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cobm9kZXMpO1xyXG4gICAgY29uc29sZS5sb2coZWRnZXMpO1xyXG59XHJcblxyXG4kKCcuaW1wb3J0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbmV0d29yay5kZXN0cm95KCk7XHJcbiAgICBuZXR3b3JrID0gbnVsbDtcclxuICAgIHJlbmRlclRvcG9sb2d5KCk7XHJcbiAgICAkKCcjaW1wb3J0LXRvcG9sb2d5JykubW9kYWwoJ2hpZGUnKTtcclxufSk7XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tc3VjY2VzcycpLmhpZGUoKTtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tZXJyb3InKS5oaWRlKCk7XHJcbiAgICBpZiAoZ2xvYmFsVXNlcm5hbWUgPT0gJycgfHwgZ2xvYmFsUGFzc3dvcmQgPT0gJycpIHtcclxuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICQoJy5sb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gJCgnI3VzZXJuYW1lLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIGxldCBwYXNzd29yZCA9ICQoJyNwYXNzd29yZC1pbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgICAgICBnbG9iYWxQYXNzd29yZCA9IHBhc3N3b3JkO1xyXG4gICAgICAgICAgICBnbG9iYWxVc2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgICAgICBsZXQgc2lnbkFqYXggPSBuZXcgQWpheENvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgc2lnbkFqYXguc2lnbnVwKHVzZXJuYW1lLCBwYXNzd29yZCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxucmVuZGVyVG9wb2xvZ3koKTtcclxuZGlqa3N0cmFNb2RhbCgpO1xyXG5hYnJhaGFtTW9kYWwoKTtcclxuZXhwb3J0VG9wb2xvZ3koKTtcclxuZGVsZXRlTmV0d29yaygpO1xyXG4iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBcclxuICAgIC8qdmlzdWFsaXphdGlvbiovXHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgLypiYWNrZW5kIHBhcmFtZXRlcnMqL1xyXG4gICAgcHJpdmF0ZSBzcmM6IHN0cmluZztcclxuICAgIHByaXZhdGUgZGVzdDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZnJvbTpzdHJpbmcsIHRvOnN0cmluZywgbGVuZ3RoOm51bWJlciwgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcil7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgICAgIHRoaXMuc3JjID0gZnJvbTtcclxuICAgICAgICB0aGlzLmRlc3QgPSB0bztcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldFNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNyYztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTcmMoc3JjOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgIH1cclxuXHJcbiAgICBnZXREZXN0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXREZXN0KGRlc3Q6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExlbmd0aChsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZyb20oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb20oZnJvbTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUbygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvKHRvOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7IFxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOnN0cmluZywgaWQ6c3RyaW5nLCBmYWlsdXJlUmF0ZTpudW1iZXIsIHJlcGFpclJhdGU6bnVtYmVyKSB7IFxyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTsgXHJcbiAgICAgfVxyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcbiAgICBcclxufSIsImV4cG9ydCBjbGFzcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGZhaWx1cmVSYXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlcGFpclJhdGU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gICAgcHVibGljIHNldEZhaWx1cmVSYXRlKHJhdGU6IG51bWJlcik6IHZvaWR7XHJcbiAgICAgICAgdGhpcy5mYWlsdXJlUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0UmVwYWlyUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlcGFpclJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEZhaWx1cmVSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFpbHVyZVJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0UmVwYWlyUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcGFpclJhdGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9ub2RlJztcclxuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4vZWRnZSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRvcG9sb2d5IHtcclxuICAgIHByaXZhdGUgbm9kZXM6IEFycmF5PE5vZGU+O1xyXG4gICAgcHJpdmF0ZSBsaW5rczogQXJyYXk8RWRnZT47XHJcblxyXG4gICAgLy9ESUpLU1RSQSBwYXJhbWV0ZXJzIC0+IHN0YXJ0ICYgZW5kIG5vZGVcclxuICAgIHByaXZhdGUgc3RhcnQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgZW5kOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5ldyBBcnJheTxOb2RlPigpO1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlQnlJZChpZDogc3RyaW5nKTogTm9kZSB7XHJcbiAgICAgICAgZm9yKGxldCBub2RlIG9mIHRoaXMubm9kZXMpe1xyXG4gICAgICAgICAgICBpZihub2RlLmdldElkKCkgPT09IGlkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEVkZ2VCeUlkKGlkOiBzdHJpbmcpOiBFZGdlIHtcclxuICAgICAgICBmb3IobGV0IGVkZ2Ugb2YgdGhpcy5saW5rcykge1xyXG4gICAgICAgICAgICBpZihlZGdlLmdldElkKCkgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWRnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlcygpOiBOb2RlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVkZ2VzKCk6IEVkZ2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlua3NcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2RlKG5vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Tm9kZXMobm9kZXM6IE5vZGVbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlKGVkZ2U6IEVkZ2UpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxpbmtzLnB1c2goZWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RWRnZXMoZWRnZXM6IEVkZ2VbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBlZGdlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRTdGFydE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFydDtcclxuICAgIH0gICAgXHJcblxyXG4gICAgc2V0U3RhcnROb2RlKHN0YXJ0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcbiAgICB9XHJcbiAgICBnZXRFbmROb2RlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5kO1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRFbmROb2RlKGVuZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XHJcbiAgICB9XHJcbn0iLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4zLjJcbiAqIDIwMTYtMDYtMTYgMTg6MjU6MTlcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBNSVRcbiAqICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBcyB8fCAoZnVuY3Rpb24odmlldykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0Ly8gSUUgPDEwIGlzIGV4cGxpY2l0bHkgdW5zdXBwb3J0ZWRcblx0aWYgKHR5cGVvZiB2aWV3ID09PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyXG5cdFx0ICBkb2MgPSB2aWV3LmRvY3VtZW50XG5cdFx0ICAvLyBvbmx5IGdldCBVUkwgd2hlbiBuZWNlc3NhcnkgaW4gY2FzZSBCbG9iLmpzIGhhc24ndCBvdmVycmlkZGVuIGl0IHlldFxuXHRcdCwgZ2V0X1VSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZpZXcuVVJMIHx8IHZpZXcud2Via2l0VVJMIHx8IHZpZXc7XG5cdFx0fVxuXHRcdCwgc2F2ZV9saW5rID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiwgXCJhXCIpXG5cdFx0LCBjYW5fdXNlX3NhdmVfbGluayA9IFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcblx0XHQsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdFx0dmFyIGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtcblx0XHRcdG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHRcdCwgaXNfc2FmYXJpID0gL2NvbnN0cnVjdG9yL2kudGVzdCh2aWV3LkhUTUxFbGVtZW50KSB8fCB2aWV3LnNhZmFyaVxuXHRcdCwgaXNfY2hyb21lX2lvcyA9L0NyaU9TXFwvW1xcZF0rLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG5cdFx0LCB0aHJvd19vdXRzaWRlID0gZnVuY3Rpb24oZXgpIHtcblx0XHRcdCh2aWV3LnNldEltbWVkaWF0ZSB8fCB2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aHJvdyBleDtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0XHQsIGZvcmNlX3NhdmVhYmxlX3R5cGUgPSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0c2V0VGltZW91dChyZXZva2VyLCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpO1xuXHRcdH1cblx0XHQsIGRpc3BhdGNoID0gZnVuY3Rpb24oZmlsZXNhdmVyLCBldmVudF90eXBlcywgZXZlbnQpIHtcblx0XHRcdGV2ZW50X3R5cGVzID0gW10uY29uY2F0KGV2ZW50X3R5cGVzKTtcblx0XHRcdHZhciBpID0gZXZlbnRfdHlwZXMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHR2YXIgbGlzdGVuZXIgPSBmaWxlc2F2ZXJbXCJvblwiICsgZXZlbnRfdHlwZXNbaV1dO1xuXHRcdFx0XHRpZiAodHlwZW9mIGxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0bGlzdGVuZXIuY2FsbChmaWxlc2F2ZXIsIGV2ZW50IHx8IGZpbGVzYXZlcik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXgpIHtcblx0XHRcdFx0XHRcdHRocm93X291dHNpZGUoZXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQsIGF1dG9fYm9tID0gZnVuY3Rpb24oYmxvYikge1xuXHRcdFx0Ly8gcHJlcGVuZCBCT00gZm9yIFVURi04IFhNTCBhbmQgdGV4dC8qIHR5cGVzIChpbmNsdWRpbmcgSFRNTClcblx0XHRcdC8vIG5vdGU6IHlvdXIgYnJvd3NlciB3aWxsIGF1dG9tYXRpY2FsbHkgY29udmVydCBVVEYtMTYgVStGRUZGIHRvIEVGIEJCIEJGXG5cdFx0XHRpZiAoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2IoW1N0cmluZy5mcm9tQ2hhckNvZGUoMHhGRUZGKSwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGZvcmNlID0gdHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZVxuXHRcdFx0XHQsIG9iamVjdF91cmxcblx0XHRcdFx0LCBkaXNwYXRjaF9hbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb24gYW55IGZpbGVzeXMgZXJyb3JzIHJldmVydCB0byBzYXZpbmcgd2l0aCBvYmplY3QgVVJMc1xuXHRcdFx0XHQsIGZzX2Vycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKChpc19jaHJvbWVfaW9zIHx8IChmb3JjZSAmJiBpc19zYWZhcmkpKSAmJiB2aWV3LkZpbGVSZWFkZXIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciB1cmwgPSBpc19jaHJvbWVfaW9zID8gcmVhZGVyLnJlc3VsdCA6IHJlYWRlci5yZXN1bHQucmVwbGFjZSgvXmRhdGE6W147XSo7LywgJ2RhdGE6YXR0YWNobWVudC9maWxlOycpO1xuXHRcdFx0XHRcdFx0XHR2YXIgcG9wdXAgPSB2aWV3Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG5cdFx0XHRcdFx0XHRcdGlmKCFwb3B1cCkgdmlldy5sb2NhdGlvbi5ocmVmID0gdXJsO1xuXHRcdFx0XHRcdFx0XHR1cmw9dW5kZWZpbmVkOyAvLyByZWxlYXNlIHJlZmVyZW5jZSBiZWZvcmUgZGlzcGF0Y2hpbmdcblx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkb24ndCBjcmVhdGUgbW9yZSBvYmplY3QgVVJMcyB0aGFuIG5lZWRlZFxuXHRcdFx0XHRcdGlmICghb2JqZWN0X3VybCkge1xuXHRcdFx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChmb3JjZSkge1xuXHRcdFx0XHRcdFx0dmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG9wZW5lZCA9IHZpZXcub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdFx0XHRcdGlmICghb3BlbmVkKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEFwcGxlIGRvZXMgbm90IGFsbG93IHdpbmRvdy5vcGVuLCBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvc2FmYXJpL2RvY3VtZW50YXRpb24vVG9vbHMvQ29uY2VwdHVhbC9TYWZhcmlFeHRlbnNpb25HdWlkZS9Xb3JraW5nd2l0aFdpbmRvd3NhbmRUYWJzL1dvcmtpbmd3aXRoV2luZG93c2FuZFRhYnMuaHRtbFxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblxuXHRcdFx0aWYgKGNhbl91c2Vfc2F2ZV9saW5rKSB7XG5cdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNhdmVfbGluay5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRzYXZlX2xpbmsuZG93bmxvYWQgPSBuYW1lO1xuXHRcdFx0XHRcdGNsaWNrKHNhdmVfbGluayk7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSB8fCBibG9iLm5hbWUgfHwgXCJkb3dubG9hZFwiLCBub19hdXRvX2JvbSk7XG5cdFx0fVxuXHQ7XG5cdC8vIElFIDEwKyAobmF0aXZlIHNhdmVBcylcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdG5hbWUgPSBuYW1lIHx8IGJsb2IubmFtZSB8fCBcImRvd25sb2FkXCI7XG5cblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsIG5hbWUpO1xuXHRcdH07XG5cdH1cblxuXHRGU19wcm90by5hYm9ydCA9IGZ1bmN0aW9uKCl7fTtcblx0RlNfcHJvdG8ucmVhZHlTdGF0ZSA9IEZTX3Byb3RvLklOSVQgPSAwO1xuXHRGU19wcm90by5XUklUSU5HID0gMTtcblx0RlNfcHJvdG8uRE9ORSA9IDI7XG5cblx0RlNfcHJvdG8uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlc3RhcnQgPVxuXHRGU19wcm90by5vbnByb2dyZXNzID1cblx0RlNfcHJvdG8ub253cml0ZSA9XG5cdEZTX3Byb3RvLm9uYWJvcnQgPVxuXHRGU19wcm90by5vbmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZWVuZCA9XG5cdFx0bnVsbDtcblxuXHRyZXR1cm4gc2F2ZUFzO1xufShcblx0ICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZlxuXHR8fCB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvd1xuXHR8fCB0aGlzLmNvbnRlbnRcbikpO1xuLy8gYHNlbGZgIGlzIHVuZGVmaW5lZCBpbiBGaXJlZm94IGZvciBBbmRyb2lkIGNvbnRlbnQgc2NyaXB0IGNvbnRleHRcbi8vIHdoaWxlIGB0aGlzYCBpcyBuc0lDb250ZW50RnJhbWVNZXNzYWdlTWFuYWdlclxuLy8gd2l0aCBhbiBhdHRyaWJ1dGUgYGNvbnRlbnRgIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdpbmRvd1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cy5zYXZlQXMgPSBzYXZlQXM7XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT09IG51bGwpKSB7XG4gIGRlZmluZShcIkZpbGVTYXZlci5qc1wiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc2F2ZUFzO1xuICB9KTtcbn1cbiJdfQ==
