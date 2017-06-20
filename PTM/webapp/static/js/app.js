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
                console.log(data);
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
    data.failureRate = Number(document.getElementById('node-failureRate').value) / (Math.pow(10, 9));
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
    data.failureRate = Number(document.getElementById('edge-failureRate').value) / (Math.pow(10, 9));
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
        var result = globalResultAbraham.responseJSON.result;
        if (startNode != 'Network' && endNode != 'Network') {
            $('.resultsAbraham').append("<div class='panel-group green' id='accordion2' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbrahamPair" + "'" + " aria-expanded='false' aria-controls='" + "collapseAbrahamPair" + "'" + ">" + "Node pair result " + "</a> </h4> </div> <div id='" + "collapseAbrahamPair" + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Node pair: </span>" + result.pair + "</div>" + "<hr>" + "<div><span>Availability: </span>" + result.availability + "</div>" + "<div><span>Reliablity: </span>" + result.reliability + "</div>" + "</div> </div> </div>");
        }
        else {
            var resultIterator = 1;
            console.log(result);
            $('.resultsAbraham').append("<div class='panel-group blue' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='blue-heading'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbrahamMain" + "'" + " aria-expanded='false' aria-controls='" + "collapseAbrahamMain" + "'" + ">" + "Availability & Reliability " + "</a> </h4> </div> <div id='" + "collapseAbrahamMain" + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span class='availability-output'>Availability (av): </span>" + globalResultAbraham.responseJSON.availability.av + "</div>" + "<div><span class='reliability-output'>Availability (s,t): </span>" + globalResultAbraham.responseJSON.availability['s,t'] + "</div>" + "<hr>" + "<div><span class='availability-output'>Reliability (av): </span>" + globalResultAbraham.responseJSON.reliability.av + "</div>" + "<div><span class='reliability-output'>Reliability (s,t): </span>" + globalResultAbraham.responseJSON.reliability['s,t'] + "</div>" + "</div> </div> </div>");
            for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                var nodepair = result_1[_i];
                var resultPath = nodepair.pair.split(",");
                var startNodeTitle = resultPath[0];
                var endNodeTitle = resultPath[1];
                $('.resultsAbraham').append("<div class='panel-group green' id='accordion2' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbraham" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapseAbraham" + resultIterator + "'" + ">" + startNodeTitle + "-" + endNodeTitle + "</a> </h4> </div> <div id='" + "collapseAbraham" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Node pair: </span>" + nodepair.pair + "</div>" + "<div><span>Availability: </span>" + nodepair.availability + "</div>" + "<div><span>Reliability: </span>" + nodepair.reliability + "</div></div></div></div>");
                resultIterator++;
            }
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
                var resultPath = result.primary.path.split("-");
                var startNodeTitle = resultPath[0];
                var endNodeTitle = resultPath[resultPath.length - 1];
                $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapse" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapse" + resultIterator + "'" + ">" + startNodeTitle + "-" + endNodeTitle + "</a> </h4> </div> <div id='" + "collapse" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span class='availability-output'>Availability: </span>" + result.total.availability + "</div>" + "<div><span id='reliability-output'>Reliablity: </span>" + result.total.reliability + "</div>" + "<hr>" + "<div><span>Primary path: </span>" + result.primary.path + "</div>" + "<div><span>Primary path availability: </span>" + result.primary.availability + "</div>" + "<div><span>Primary path reliability: </span>" + result.primary.reliability + "</div>" + "<hr>" + "<div><span>Secondary path: </span>" + result.secondary.path + "</div>" + "<div><span>Secondary path availability: </span>" + result.secondary.availability + "</div>" + "<div><span>Secondary path reliability: </span>" + result.secondary.reliability + "</div>" + "</div> </div> </div>");
                resultIterator++;
            }
        }
        var primaryPath = globalResultDijkstra.responseJSON.result['0'].primary.path.split("-");
        if (globalResultDijkstra.responseJSON.result['0'].secondary.path) {
            var secondaryPath = globalResultDijkstra.responseJSON.result['0'].secondary.path.split("-");
            var start_1 = 0;
            var end_1 = 1;
            for (var _c = 0, secondaryPath_1 = secondaryPath; _c < secondaryPath_1.length; _c++) {
                var colorPath = secondaryPath_1[_c];
                for (var _d = 0, edges_2 = edges; _d < edges_2.length; _d++) {
                    var edge = edges_2[_d];
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
        for (var _e = 0, primaryPath_1 = primaryPath; _e < primaryPath_1.length; _e++) {
            var colorPath = primaryPath_1[_e];
            for (var _f = 0, edges_3 = edges; _f < edges_3.length; _f++) {
                var edge = edges_3[_f];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyIsIm5vZGVfbW9kdWxlcy9maWxlLXNhdmVyL0ZpbGVTYXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFHSTtJQUNBLENBQUM7SUFFTSw0Q0FBbUIsR0FBMUIsVUFBMkIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsQ0FBUyxFQUFFLEtBQVUsRUFBRSxLQUFVO1FBQ3hILEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNWLEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxF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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJkZWNsYXJlIHZhciAkOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgQWpheENvbnRyb2xsZXIge1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlqa3N0cmFDYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCBzdGFydCwgZW5kLCB0IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2RpamtzdHJhJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgZGF0YToganNvblRvcG9sb2d5LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgc3RhcnQsIGVuZCwgdCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9ub2RlcGFpcicsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNpZ251cCh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGpzb25TaWdudXAgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCB9KTtcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvc2lnbnVwJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25TaWdudXAsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEudXNlciA9PSBcIndyb25nX3Bhc3N3b3JkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLWVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZGF0YS51c2VyID09IFwidmFsaWRcIiB8fCBkYXRhLnVzZXIgPT0gXCJjcmVhdGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLXN1Y2Nlc3MnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZm9ybS12YWxpZGF0aW9uLWVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbW9kZWxzL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9tb2RlbHMvZWRnZSc7XHJcbmltcG9ydCB7IEFqYXhDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVycy9hamF4LmNvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBUb3BvbG9neSB9IGZyb20gJy4vbW9kZWxzL3RvcG9sb2d5JztcclxuaW1wb3J0ICogYXMgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xyXG5cclxuZGVjbGFyZSB2YXIgRmlsZVJlYWRlcjogYW55O1xyXG5kZWNsYXJlIHZhciB2aXM6IGFueTtcclxuZGVjbGFyZSB2YXIgJDogYW55O1xyXG5kZWNsYXJlIHZhciBEcm9wem9uZTogYW55O1xyXG5cclxubGV0IG5vZGVzOiBOb2RlW10gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxubGV0IGVkZ2VzOiBFZGdlW10gPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxubGV0IHRvcG9sb2d5OiBUb3BvbG9neSA9IG5ldyBUb3BvbG9neSgpO1xyXG5sZXQgaXNOb2RlU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxubGV0IG5ldHdvcms6IGFueTtcclxubGV0IGdsb2JhbFVzZXJuYW1lOiBzdHJpbmcgPSAnJztcclxubGV0IGdsb2JhbFBhc3N3b3JkOiBzdHJpbmcgPSAnJztcclxubGV0IGdsb2JhbFJlc3VsdERpamtzdHJhOiBhbnk7XHJcbmxldCBnbG9iYWxSZXN1bHRBYnJhaGFtOiBhbnk7XHJcbmxldCB2aXNub2RlczogYW55O1xyXG5sZXQgdmlzZWRnZXM6IGFueTtcclxuXHJcbmZ1bmN0aW9uIHJlbmRlclRvcG9sb2d5KCkge1xyXG5cclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yaycpO1xyXG5cclxuICAgIHZpc25vZGVzID0gbmV3IHZpcy5EYXRhU2V0KG5vZGVzKTtcclxuICAgIHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICBub2Rlczogdmlzbm9kZXMsXHJcbiAgICAgICAgZWRnZXM6IHZpc2VkZ2VzXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICB0b3BvbG9neS5zZXROb2Rlcyhub2Rlcyk7XHJcbiAgICB0b3BvbG9neS5zZXRFZGdlcyhlZGdlcyk7XHJcblxyXG4gICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgbm9kZXM6IHtcclxuICAgICAgICAgICAgc2hhcGU6ICdkb3QnLFxyXG4gICAgICAgICAgICBzaXplOiAzMCxcclxuICAgICAgICAgICAgY29sb3I6IHtcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlZGdlczoge1xyXG4gICAgICAgICAgICBwaHlzaWNzOiBmYWxzZSxcclxuICAgICAgICAgICAgd2lkdGg6IDIsXHJcbiAgICAgICAgICAgIGxlbmd0aDogMTBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dDoge1xyXG4gICAgICAgICAgICByYW5kb21TZWVkOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYW5pcHVsYXRpb246IHtcclxuICAgICAgICAgICAgaW5pdGlhbGx5QWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYWRkTm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0Tm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFZGdlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5mcm9tID09IGRhdGEudG8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byBjb25uZWN0IHRoZSBub2RlIHRvIGl0c2VsZj9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgIT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0RWRnZToge1xyXG4gICAgICAgICAgICAgICAgZWRpdFdpdGhvdXREcmFnOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgcmVnaXN0ZXJFdmVudChuZXR3b3JrKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVkaXROb2RlKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZU5vZGVEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbE5vZGVFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJFdmVudChkYXRhOiBhbnkpIHtcclxuICAgIGRhdGEub24oXCJzZWxlY3RcIiwgZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGFyYW1zKTtcclxuICAgICAgICBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA9PSAwICYmIHBhcmFtcy5lZGdlcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZWRnZTogRWRnZSA9IHRvcG9sb2d5LmdldEVkZ2VCeUlkKHBhcmFtcy5lZGdlc1snMCddKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPkVkZ2U8L2gyPicgKyAnPHA+PHNwYW4+TGFiZWw6IDwvc3Bhbj4nICsgcGFyYW1zLmVkZ2VzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5GYWlsdXJlIHJhdGU6PC9zcGFuPiAnICsgZWRnZS5nZXRGYWlsdXJlUmF0ZSgpICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5SZXBhaXIgcmF0ZTogPC9zcGFuPicgKyBlZGdlLmdldFJlcGFpclJhdGUoKSArICc8L3A+JztcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlOiBOb2RlID0gdG9wb2xvZ3kuZ2V0Tm9kZUJ5SWQocGFyYW1zLm5vZGVzWycwJ10pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9ICc8aDI+Tm9kZTwvaDI+JyArICc8cD48c3Bhbj5MYWJlbDogPC9zcGFuPicgKyBwYXJhbXMubm9kZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkVkZ2VzOiA8L3NwYW4+JyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RmFpbHVyZSByYXRlOiA8L3NwYW4+JyArIG5vZGUuZ2V0RmFpbHVyZVJhdGUoKSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+UmVwYWlyIHJhdGU6IDwvc3Bhbj4nICsgbm9kZS5nZXRSZXBhaXJSYXRlKCkgKyAnPC9wPic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID09IDAgJiYgcGFyYW1zLmVkZ2VzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsZWFyTm9kZVBvcFVwKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbE5vZGVFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZU5vZGVEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgZGF0YS5sYWJlbCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZTtcclxuICAgIGRhdGEuaWQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtaWQnKSkudmFsdWU7XHJcbiAgICBkYXRhLmZhaWx1cmVSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1mYWlsdXJlUmF0ZScpKS52YWx1ZSkgLyAoMTAgKiogOSk7XHJcbiAgICBkYXRhLnJlcGFpclJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXJlcGFpclJhdGUnKSkudmFsdWUpO1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuXHJcbiAgICBsZXQgdGVtcE5vZGU6IE5vZGUgPSBuZXcgTm9kZShkYXRhLmxhYmVsLCBkYXRhLmlkLCBkYXRhLmZhaWx1cmVSYXRlLCBkYXRhLnJlcGFpclJhdGUpO1xyXG4gICAgbm9kZXMucHVzaCh0ZW1wTm9kZSk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+Tm9kZSBhZGRlZC4uLjwvZGl2PlwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZUVkZ2VEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbEVkZ2VFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJFZGdlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsRWRnZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlRWRnZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEudG8gPT09ICdvYmplY3QnKVxyXG4gICAgICAgIGRhdGEudG8gPSBkYXRhLnRvLmlkXHJcbiAgICBpZiAodHlwZW9mIGRhdGEuZnJvbSA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS5mcm9tID0gZGF0YS5mcm9tLmlkXHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgZGF0YS5pZCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1pZCcpKS52YWx1ZTtcclxuICAgIGRhdGEuZmFpbHVyZVJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWZhaWx1cmVSYXRlJykpLnZhbHVlKSAvICgxMCAqKiA5KTtcclxuICAgIGRhdGEucmVwYWlyUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcmVwYWlyUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLmxlbmd0aCA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGVuZ3RoJykpLnZhbHVlKTtcclxuICAgIGxldCB0ZW1wRWRnZTogRWRnZSA9IG5ldyBFZGdlKGRhdGEubGFiZWwsIGRhdGEuaWQsIGRhdGEuZnJvbSwgZGF0YS50bywgZGF0YS5sZW5ndGgsIGRhdGEuZmFpbHVyZVJhdGUsIGRhdGEucmVwYWlyUmF0ZSk7XHJcbiAgICBlZGdlcy5wdXNoKHRlbXBFZGdlKTtcclxuICAgIGNsZWFyRWRnZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1ncmVlbic+RWRnZSBhZGRlZC4uLjwvZGl2PlwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWJyYWhhbU1vZGFsKCkge1xyXG4gICAgc2V0U2VsZWN0aW9uT3B0aW9ucygpO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUtYWJyYWhhbScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2cteWVsbG93Jz5DYWxjdWxhdGluZyB1c2luZyBBYnJhaGFtIGFsZ29yaXRobS4uLjwvZGl2PlwiKTtcclxuICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5maW5kKCcucGFuZWwtZ3JvdXAnKS5yZW1vdmUoKTtcclxuICAgICAgICBsZXQgdXNlcm5hbWUgPSBnbG9iYWxVc2VybmFtZTtcclxuICAgICAgICBsZXQgcGFzc3dvcmQgPSBnbG9iYWxQYXNzd29yZDtcclxuICAgICAgICBsZXQgc3RhcnROb2RlID0gJCgnI3N0YXJ0LW5vZGUtYWJyYWhhbScpLnZhbCgpO1xyXG4gICAgICAgIGxldCBlbmROb2RlID0gJCgnI2VuZC1ub2RlLWFicmFoYW0nKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lLWFicmFoYW0nKS52YWwoKSk7XHJcbiAgICAgICAgbGV0IGNhbGNEaWprc3RyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgZ2xvYmFsUmVzdWx0QWJyYWhhbSA9IGNhbGNEaWprc3RyLmFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgdGltZSwgbm9kZXMsIGVkZ2VzKTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGdsb2JhbFJlc3VsdEFicmFoYW0ucmVzcG9uc2VKU09OLnJlc3VsdDtcclxuICAgICAgICBpZiAoc3RhcnROb2RlICE9ICdOZXR3b3JrJyAmJiBlbmROb2RlICE9ICdOZXR3b3JrJykge1xyXG4gICAgICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbjInIHJvbGU9J3RhYmxpc3QnIGFyaWEtbXVsdGlzZWxlY3RhYmxlPSd0cnVlJz4gPGRpdiBjbGFzcz0ncGFuZWwgcGFuZWwtZGVmYXVsdCc+IDxkaXYgY2xhc3M9J3BhbmVsLWhlYWRpbmcnIHJvbGU9J3RhYicgaWQ9J2hlYWRpbmdPbmUnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUFicmFoYW1QYWlyXCIgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtUGFpclwiICsgXCInXCIgKyBcIj5cIiArIFwiTm9kZSBwYWlyIHJlc3VsdCBcIiArIFwiPC9hPiA8L2g0PiA8L2Rpdj4gPGRpdiBpZD0nXCIgKyBcImNvbGxhcHNlQWJyYWhhbVBhaXJcIiArIFwiJ1wiICsgXCJjbGFzcz0ncGFuZWwtY29sbGFwc2UgY29sbGFwc2UnIHJvbGU9J3RhYnBhbmVsJyBhcmlhLWxhYmVsbGVkYnk9J2hlYWRpbmdPbmUnPiA8ZGl2IGNsYXNzPSdwYW5lbC1ib2R5Jz5cIiArIFwiPGRpdj48c3Bhbj5Ob2RlIHBhaXI6IDwvc3Bhbj5cIiArIHJlc3VsdC5wYWlyICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UmVsaWFibGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgICAkKCcucmVzdWx0c0FicmFoYW0nKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBibHVlJyBpZD0nYWNjb3JkaW9uJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdibHVlLWhlYWRpbmcnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUFicmFoYW1NYWluXCIgKyBcIidcIiArIFwiIGFyaWEtZXhwYW5kZWQ9J2ZhbHNlJyBhcmlhLWNvbnRyb2xzPSdcIiArIFwiY29sbGFwc2VBYnJhaGFtTWFpblwiICsgXCInXCIgKyBcIj5cIiArIFwiQXZhaWxhYmlsaXR5ICYgUmVsaWFiaWxpdHkgXCIgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1NYWluXCIgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J2F2YWlsYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eSAoYXYpOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHRBYnJhaGFtLnJlc3BvbnNlSlNPTi5hdmFpbGFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdyZWxpYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eSAocyx0KTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0QWJyYWhhbS5yZXNwb25zZUpTT04uYXZhaWxhYmlsaXR5WydzLHQnXSArIFwiPC9kaXY+XCIgKyBcIjxocj5cIiArIFwiPGRpdj48c3BhbiBjbGFzcz0nYXZhaWxhYmlsaXR5LW91dHB1dCc+UmVsaWFiaWxpdHkgKGF2KTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0QWJyYWhhbS5yZXNwb25zZUpTT04ucmVsaWFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdyZWxpYWJpbGl0eS1vdXRwdXQnPlJlbGlhYmlsaXR5IChzLHQpOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHRBYnJhaGFtLnJlc3BvbnNlSlNPTi5yZWxpYWJpbGl0eVsncyx0J10gKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZXBhaXIgb2YgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0UGF0aCA9IG5vZGVwYWlyLnBhaXIuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0Tm9kZVRpdGxlID0gcmVzdWx0UGF0aFswXTtcclxuICAgICAgICAgICAgICAgIGxldCBlbmROb2RlVGl0bGUgPSByZXN1bHRQYXRoWzFdO1xyXG4gICAgICAgICAgICAgICAgJCgnLnJlc3VsdHNBYnJhaGFtJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncGFuZWwtZ3JvdXAgZ3JlZW4nIGlkPSdhY2NvcmRpb24yJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdoZWFkaW5nT25lJz4gPGg0IGNsYXNzPSdwYW5lbC10aXRsZSAgdGV4dC1jZW50ZXInPiA8YSByb2xlPSdidXR0b24nIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS1wYXJlbnQ9JyNhY2NvcmRpb24nIGhyZWY9J1wiICsgXCIjY29sbGFwc2VBYnJhaGFtXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIj5cIiArIHN0YXJ0Tm9kZVRpdGxlICsgXCItXCIgKyBlbmROb2RlVGl0bGUgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZUFicmFoYW1cIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuPk5vZGUgcGFpcjogPC9zcGFuPlwiICsgbm9kZXBhaXIucGFpciArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+QXZhaWxhYmlsaXR5OiA8L3NwYW4+XCIgKyBub2RlcGFpci5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlJlbGlhYmlsaXR5OiA8L3NwYW4+XCIgKyBub2RlcGFpci5yZWxpYWJpbGl0eSArIFwiPC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0SXRlcmF0b3IrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctZ3JlZW4nPkNhbGN1bGF0aW9uIGRvbmUuLi48L2Rpdj5cIik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGlqa3N0cmFNb2RhbCgpIHtcclxuICAgIHNldFNlbGVjdGlvbk9wdGlvbnMoKTtcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2FsY3VsYXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy15ZWxsb3cnPkNhbGN1bGF0aW5nIHVzaW5nIERpamtzdHJhIGFsZ29yaXRobS4uLjwvZGl2PlwiKTtcclxuICAgICAgICAkKCcucmVzdWx0cycpLmZpbmQoJy5wYW5lbC1ncm91cCcpLnJlbW92ZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGVkZ2Ugb2YgZWRnZXMpIHtcclxuICAgICAgICAgICAgdmlzZWRnZXMudXBkYXRlKFt7IGlkOiBlZGdlLmdldElkKCksIGNvbG9yOiAnIzk3QzJGQycgfV0pO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHVzZXJuYW1lID0gZ2xvYmFsVXNlcm5hbWU7XHJcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gZ2xvYmFsUGFzc3dvcmQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlJykudmFsKCk7XHJcbiAgICAgICAgbGV0IGVuZE5vZGUgPSAkKCcjZW5kLW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGdsb2JhbFJlc3VsdERpamtzdHJhID0gY2FsY0RpamtzdHIuZGlqa3N0cmFDYWxjdWxhdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgdGltZSwgbm9kZXMsIGVkZ2VzKTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0Tm9kZSAhPSAnTmV0d29yaycgJiYgZW5kTm9kZSAhPSAnTmV0d29yaycpIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHMnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbicgcm9sZT0ndGFibGlzdCcgYXJpYS1tdWx0aXNlbGVjdGFibGU9J3RydWUnPiA8ZGl2IGNsYXNzPSdwYW5lbCBwYW5lbC1kZWZhdWx0Jz4gPGRpdiBjbGFzcz0ncGFuZWwtaGVhZGluZycgcm9sZT0ndGFiJyBpZD0naGVhZGluZ09uZSc+IDxoNCBjbGFzcz0ncGFuZWwtdGl0bGUgIHRleHQtY2VudGVyJz4gPGEgcm9sZT0nYnV0dG9uJyBkYXRhLXRvZ2dsZT0nY29sbGFwc2UnIGRhdGEtcGFyZW50PScjYWNjb3JkaW9uJyBocmVmPSdcIiArIFwiI2NvbGxhcHNlU2luZ2xlRGlqa3N0cmFcIiArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZVNpbmdsZURpamtzdHJhXCIgKyBcIidcIiArIFwiPlwiICsgXCJSZXN1bHQgXCIgKyBcIjwvYT4gPC9oND4gPC9kaXY+IDxkaXYgaWQ9J1wiICsgXCJjb2xsYXBzZVNpbmdsZURpamtzdHJhXCIgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J2F2YWlsYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnRvdGFsLmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4gaWQ9J3JlbGlhYmlsaXR5LW91dHB1dCc+UmVsaWFibGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnRvdGFsLnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuPlByaW1hcnkgcGF0aDogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnByaW1hcnkucGF0aCArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+UHJpbWFyeSBwYXRoIGF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnByaW1hcnkuYXZhaWxhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5QcmltYXJ5IHBhdGggcmVsaWFiaWxpdHk6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wcmltYXJ5LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnBhdGggKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoIGF2YWlsYWJpbGl0eTogPC9zcGFuPlwiICsgZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnNlY29uZGFyeS5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlNlY29uZGFyeSBwYXRoIHJlbGlhYmlsaXR5OiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnJlbGlhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLnJlc3VsdHMnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBibHVlJyBpZD0nYWNjb3JkaW9uJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdibHVlLWhlYWRpbmcnPiA8aDQgY2xhc3M9J3BhbmVsLXRpdGxlICB0ZXh0LWNlbnRlcic+IDxhIHJvbGU9J2J1dHRvbicgZGF0YS10b2dnbGU9J2NvbGxhcHNlJyBkYXRhLXBhcmVudD0nI2FjY29yZGlvbicgaHJlZj0nXCIgKyBcIiNjb2xsYXBzZUhlYWRcIiArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZUhlYWRcIiArIFwiJ1wiICsgXCI+XCIgKyBcIkF2YWlsYWJpbGl0eSAmIFJlbGlhYmlsaXR5IFwiICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VIZWFkXCIgKyBcIidcIiArIFwiY2xhc3M9J3BhbmVsLWNvbGxhcHNlIGNvbGxhcHNlJyByb2xlPSd0YWJwYW5lbCcgYXJpYS1sYWJlbGxlZGJ5PSdoZWFkaW5nT25lJz4gPGRpdiBjbGFzcz0ncGFuZWwtYm9keSc+XCIgKyBcIjxkaXY+PHNwYW4gY2xhc3M9J2F2YWlsYWJpbGl0eS1vdXRwdXQnPkF2YWlsYWJpbGl0eSAoYXYpOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04uYXZhaWxhYmlsaXR5LmF2ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3BhbiBjbGFzcz0ncmVsaWFiaWxpdHktb3V0cHV0Jz5BdmFpbGFiaWxpdHkgKHMsdCk6IDwvc3Bhbj5cIiArIGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5hdmFpbGFiaWxpdHlbJ3MsdCddICsgXCI8L2Rpdj5cIiArIFwiPGhyPlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdhdmFpbGFiaWxpdHktb3V0cHV0Jz5SZWxpYWJpbGl0eSAoYXYpOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVsaWFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuIGNsYXNzPSdyZWxpYWJpbGl0eS1vdXRwdXQnPlJlbGlhYmlsaXR5IChzLHQpOiA8L3NwYW4+XCIgKyBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVsaWFiaWxpdHlbJ3MsdCddICsgXCI8L2Rpdj5cIiArIFwiPC9kaXY+IDwvZGl2PiA8L2Rpdj5cIik7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRJdGVyYXRvciA9IDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlc3VsdCBvZiBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0UGF0aCA9IHJlc3VsdC5wcmltYXJ5LnBhdGguc3BsaXQoXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0Tm9kZVRpdGxlID0gcmVzdWx0UGF0aFswXTtcclxuICAgICAgICAgICAgICAgIGxldCBlbmROb2RlVGl0bGUgPSByZXN1bHRQYXRoW3Jlc3VsdFBhdGgubGVuZ3RoLTFdO1xyXG4gICAgICAgICAgICAgICAgJCgnLnJlc3VsdHMnKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdwYW5lbC1ncm91cCBncmVlbicgaWQ9J2FjY29yZGlvbicgcm9sZT0ndGFibGlzdCcgYXJpYS1tdWx0aXNlbGVjdGFibGU9J3RydWUnPiA8ZGl2IGNsYXNzPSdwYW5lbCBwYW5lbC1kZWZhdWx0Jz4gPGRpdiBjbGFzcz0ncGFuZWwtaGVhZGluZycgcm9sZT0ndGFiJyBpZD0naGVhZGluZ09uZSc+IDxoNCBjbGFzcz0ncGFuZWwtdGl0bGUgIHRleHQtY2VudGVyJz4gPGEgcm9sZT0nYnV0dG9uJyBkYXRhLXRvZ2dsZT0nY29sbGFwc2UnIGRhdGEtcGFyZW50PScjYWNjb3JkaW9uJyBocmVmPSdcIiArIFwiI2NvbGxhcHNlXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCIgYXJpYS1leHBhbmRlZD0nZmFsc2UnIGFyaWEtY29udHJvbHM9J1wiICsgXCJjb2xsYXBzZVwiICsgcmVzdWx0SXRlcmF0b3IgKyBcIidcIiArIFwiPlwiICsgc3RhcnROb2RlVGl0bGUgKyBcIi1cIiArIGVuZE5vZGVUaXRsZSArIFwiPC9hPiA8L2g0PiA8L2Rpdj4gPGRpdiBpZD0nXCIgKyBcImNvbGxhcHNlXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCJjbGFzcz0ncGFuZWwtY29sbGFwc2UgY29sbGFwc2UnIHJvbGU9J3RhYnBhbmVsJyBhcmlhLWxhYmVsbGVkYnk9J2hlYWRpbmdPbmUnPiA8ZGl2IGNsYXNzPSdwYW5lbC1ib2R5Jz5cIiArIFwiPGRpdj48c3BhbiBjbGFzcz0nYXZhaWxhYmlsaXR5LW91dHB1dCc+QXZhaWxhYmlsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQudG90YWwuYXZhaWxhYmlsaXR5ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3BhbiBpZD0ncmVsaWFiaWxpdHktb3V0cHV0Jz5SZWxpYWJsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQudG90YWwucmVsaWFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8aHI+XCIgKyBcIjxkaXY+PHNwYW4+UHJpbWFyeSBwYXRoOiA8L3NwYW4+XCIgKyByZXN1bHQucHJpbWFyeS5wYXRoICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5QcmltYXJ5IHBhdGggYXZhaWxhYmlsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQucHJpbWFyeS5hdmFpbGFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlByaW1hcnkgcGF0aCByZWxpYWJpbGl0eTogPC9zcGFuPlwiICsgcmVzdWx0LnByaW1hcnkucmVsaWFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8aHI+XCIgKyBcIjxkaXY+PHNwYW4+U2Vjb25kYXJ5IHBhdGg6IDwvc3Bhbj5cIiArIHJlc3VsdC5zZWNvbmRhcnkucGF0aCArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+U2Vjb25kYXJ5IHBhdGggYXZhaWxhYmlsaXR5OiA8L3NwYW4+XCIgKyByZXN1bHQuc2Vjb25kYXJ5LmF2YWlsYWJpbGl0eSArIFwiPC9kaXY+XCIgKyBcIjxkaXY+PHNwYW4+U2Vjb25kYXJ5IHBhdGggcmVsaWFiaWxpdHk6IDwvc3Bhbj5cIiArIHJlc3VsdC5zZWNvbmRhcnkucmVsaWFiaWxpdHkgKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdEl0ZXJhdG9yKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwcmltYXJ5UGF0aCA9IGdsb2JhbFJlc3VsdERpamtzdHJhLnJlc3BvbnNlSlNPTi5yZXN1bHRbJzAnXS5wcmltYXJ5LnBhdGguc3BsaXQoXCItXCIpO1xyXG4gICAgICAgIGlmIChnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnBhdGgpIHtcclxuICAgICAgICAgICAgbGV0IHNlY29uZGFyeVBhdGggPSBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0WycwJ10uc2Vjb25kYXJ5LnBhdGguc3BsaXQoXCItXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICAgICAgbGV0IGVuZCA9IDFcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sb3JQYXRoIG9mIHNlY29uZGFyeVBhdGgpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGVkZ2Ugb2YgZWRnZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKGVkZ2UuZ2V0RnJvbSgpID09IHNlY29uZGFyeVBhdGhbZW5kXSAmJiBlZGdlLmdldFRvKCkgPT0gc2Vjb25kYXJ5UGF0aFtzdGFydF0gJiYgZW5kIDw9IGVkZ2VzLmxlbmd0aCkgfHwgKGVkZ2UuZ2V0RnJvbSgpID09IHNlY29uZGFyeVBhdGhbc3RhcnRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBzZWNvbmRhcnlQYXRoW2VuZF0gJiYgZW5kIDw9IGVkZ2VzLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzZWRnZXMudXBkYXRlKFt7IGlkOiBlZGdlLmdldElkKCksIGNvbG9yOiAnZ3JlZW4nIH1dKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBsZXQgZW5kID0gMVxyXG4gICAgICAgIGZvciAobGV0IGNvbG9yUGF0aCBvZiBwcmltYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlZGdlIG9mIGVkZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGVkZ2UuZ2V0RnJvbSgpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gcHJpbWFyeVBhdGgubGVuZ3RoKSB8fCAoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBwcmltYXJ5UGF0aFtlbmRdICYmIGVuZCA8PSBlZGdlcy5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdyZWQnIH1dKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICBlbmQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qaWYoZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnBhdGhzLnBhdGgyKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRhcnlQYXRoID0gZ2xvYmFsUmVzdWx0RGlqa3N0cmEucmVzcG9uc2VKU09OLnJlc3VsdFsnMCddLnBhdGhzLnBhdGgyLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZWRnZSBvZiBlZGdlcykge1xyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kID0gMVxyXG4gICAgICAgICAgICBpZiAoZWRnZS5nZXRGcm9tKCkgPT0gc2Vjb25kYXJ5UGF0aFtlbmRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBzZWNvbmRhcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gc2Vjb25kYXJ5UGF0aC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCk7XHJcbiAgICAgICAgICAgICAgICB2aXNlZGdlcy51cGRhdGUoW3sgaWQ6IGVkZ2UuZ2V0SWQoKSwgY29sb3I6ICdncmVlbicgfV0pO1xyXG4gICAgICAgICAgICAgICAgc3RhcnQrKztcclxuICAgICAgICAgICAgICAgIGVuZCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgZWRnZSBvZiBlZGdlcykge1xyXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kID0gMTtcclxuICAgICAgICAgICAgaWYoKGVkZ2UuZ2V0RnJvbSgpID09IHByaW1hcnlQYXRoW2VuZF0gJiYgZWRnZS5nZXRUbygpID09IHByaW1hcnlQYXRoW3N0YXJ0XSAmJiBlbmQgPD0gcHJpbWFyeVBhdGgubGVuZ3RoKSB8fCAoZWRnZS5nZXRGcm9tKCkgPT0gcHJpbWFyeVBhdGhbc3RhcnRdICYmIGVkZ2UuZ2V0VG8oKSA9PSBwcmltYXJ5UGF0aFtlbmRdICYmIGVuZCA8PSBlZGdlcy5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygpO1xyXG4gICAgICAgICAgICAgICAgdmlzZWRnZXMudXBkYXRlKFt7IGlkOiBlZGdlLmdldElkKCksIGNvbG9yOiAncmVkJyB9XSk7XHJcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xyXG4gICAgICAgICAgICAgICAgZW5kKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICAgKi9cclxuICAgICAgICAvKmZvciAobGV0IHJlc3VsdCBvZiBnbG9iYWxSZXN1bHREaWprc3RyYS5yZXNwb25zZUpTT04ucmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAkKCcucmVzdWx0cycpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3BhbmVsLWdyb3VwIGdyZWVuJyBpZD0nYWNjb3JkaW9uJyByb2xlPSd0YWJsaXN0JyBhcmlhLW11bHRpc2VsZWN0YWJsZT0ndHJ1ZSc+IDxkaXYgY2xhc3M9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPiA8ZGl2IGNsYXNzPSdwYW5lbC1oZWFkaW5nJyByb2xlPSd0YWInIGlkPSdoZWFkaW5nT25lJz4gPGg0IGNsYXNzPSdwYW5lbC10aXRsZSAgdGV4dC1jZW50ZXInPiA8YSByb2xlPSdidXR0b24nIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS1wYXJlbnQ9JyNhY2NvcmRpb24nIGhyZWY9J1wiICsgXCIjY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcIiBhcmlhLWV4cGFuZGVkPSdmYWxzZScgYXJpYS1jb250cm9scz0nXCIgKyBcImNvbGxhcHNlXCIgKyByZXN1bHRJdGVyYXRvciArIFwiJ1wiICsgXCI+XCIgKyBcIlJlc3VsdCBcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCI8L2E+IDwvaDQ+IDwvZGl2PiA8ZGl2IGlkPSdcIiArIFwiY29sbGFwc2VcIiArIHJlc3VsdEl0ZXJhdG9yICsgXCInXCIgKyBcImNsYXNzPSdwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZScgcm9sZT0ndGFicGFuZWwnIGFyaWEtbGFiZWxsZWRieT0naGVhZGluZ09uZSc+IDxkaXYgY2xhc3M9J3BhbmVsLWJvZHknPlwiICsgXCI8ZGl2PjxzcGFuPlBhdGgxOiA8L3NwYW4+XCIgKyByZXN1bHQucGF0aHMucGF0aDEgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPlBhdGgyOiA8L3NwYW4+XCIgKyByZXN1bHQucGF0aHMucGF0aDIgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShhdik6IDwvc3Bhbj5cIiArIHJlc3VsdC5hdmFpbGFiaWxpdHkuYXYgKyBcIjwvZGl2PlwiICsgXCI8ZGl2PjxzcGFuPkF2YWlsYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQuYXZhaWxhYmlsaXR5W1wicyx0XCJdICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJsaXR5KGF2KTogPC9zcGFuPlwiICsgcmVzdWx0LnJlbGlhYmlsaXR5LmF2ICsgXCI8L2Rpdj5cIiArIFwiPGRpdj48c3Bhbj5SZWxpYWJpbGl0eShzLHQpOiA8L3NwYW4+XCIgKyByZXN1bHQucmVsaWFiaWxpdHlbXCJzLHRcIl0gKyBcIjwvZGl2PlwiICsgXCI8L2Rpdj4gPC9kaXY+IDwvZGl2PlwiKTtcclxuICAgICAgICAgICAgcmVzdWx0SXRlcmF0b3IrKztcclxuICAgICAgICB9Ki9cclxuICAgICAgICAkKCcuY2FsY3VsYXRpb24tY29udGFpbmVyJykuYXBwZW5kKFwiPGRpdiBjbGFzcz0nc3VjY2Vzcy1tc2ctZ3JlZW4nPkNhbGN1bGF0aW9uIGRvbmUuLi48L2Rpdj5cIik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXhwb3J0VG9wb2xvZ3koKSB7XHJcbiAgICAkKFwiLmV4cG9ydFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IGpzb25Ub3BvbG9neSA9IEpTT04uc3RyaW5naWZ5KHsgbm9kZXMsIGVkZ2VzIH0sIG51bGwsIDIpO1xyXG4gICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2pzb25Ub3BvbG9neV0sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLThcIiB9KTtcclxuICAgICAgICBGaWxlU2F2ZXIuc2F2ZUFzKGJsb2IsIFwidG9wb2xvZ3lcIiArIFwiLmpzb25cIik7XHJcblxyXG4gICAgICAgICQoJyNleHBvcnQtdG9wb2xvZ3knKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy13aGl0ZSc+VG9wb2xvZ3kgZXhwb3J0ZWQuLi48L2Rpdj5cIik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0U2VsZWN0aW9uT3B0aW9ucygpIHtcclxuICAgICQoJyNleGFtcGxlTW9kYWwsICNhYnJhaGFtTW9kYWwnKS5vbignc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcjc3RhcnQtbm9kZSwgI3N0YXJ0LW5vZGUtYWJyYWhhbScpLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpO1xyXG4gICAgICAgICQoJyNlbmQtbm9kZSwgICNlbmQtbm9kZS1hYnJhaGFtJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAkKCcjc3RhcnQtbm9kZSwgI3N0YXJ0LW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgbm9kZXNbaV0uZ2V0TGFiZWwoKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgJCgnI2VuZC1ub2RlLCAjZW5kLW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgbm9kZXNbaV0uZ2V0TGFiZWwoKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnI3N0YXJ0LW5vZGUsICNzdGFydC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArICdOZXR3b3JrJyArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAkKCcjZW5kLW5vZGUsICNlbmQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyAnTmV0d29yaycgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxldGVOZXR3b3JrKCkge1xyXG4gICAgJChcIiNkZWxldGUtdG9wb2xvZ3lcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGVkZ2VzID0gW107XHJcbiAgICAgICAgbm9kZXMgPSBbXTtcclxuICAgICAgICBuZXR3b3JrLmRlc3Ryb3koKTtcclxuICAgICAgICBuZXR3b3JrID0gbnVsbDtcclxuICAgICAgICByZW5kZXJUb3BvbG9neSgpO1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy1yZWQnPk5ldHdvcmsgZGVsZXRlZC4uLjwvZGl2PlwiKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG52YXIganNvbjtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxlJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlRmlsZVNlbGVjdCwgZmFsc2UpO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlRmlsZVNlbGVjdChldnQ6IGFueSkge1xyXG4gICAgdmFyIGZpbGVzID0gZXZ0LnRhcmdldC5maWxlczsgLy8gRmlsZUxpc3Qgb2JqZWN0XHJcblxyXG4gICAgLy8gZmlsZXMgaXMgYSBGaWxlTGlzdCBvZiBGaWxlIG9iamVjdHMuIExpc3Qgc29tZSBwcm9wZXJ0aWVzLlxyXG4gICAgdmFyIG91dHB1dCA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGY7IGYgPSBmaWxlc1tpXTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIENsb3N1cmUgdG8gY2FwdHVyZSB0aGUgZmlsZSBpbmZvcm1hdGlvbi5cclxuICAgICAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uICh0aGVGaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgc2V0SW1wb3J0ZWRUb3BvbG9neShqc29uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKGYpO1xyXG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGYpO1xyXG4gICAgICAgICQoJy5jYWxjdWxhdGlvbi1jb250YWluZXInKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSdzdWNjZXNzLW1zZy13aGl0ZSc+VG9wb2xvZ3kgaW1wb3J0ZWQuLi48L2Rpdj5cIik7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRJbXBvcnRlZFRvcG9sb2d5KGpzb246IGFueSkge1xyXG4gICAgZWRnZXMgPSBbXTtcclxuICAgIG5vZGVzID0gW107XHJcbiAgICBmb3IgKGxldCBub2RlIG9mIGpzb24ubm9kZXMpIHtcclxuICAgICAgICBsZXQgdG1wTm9kZSA9IG5ldyBOb2RlKG5vZGUubGFiZWwsIG5vZGUuaWQsIG5vZGUuZmFpbHVyZVJhdGUsIG5vZGUucmVwYWlyUmF0ZSk7XHJcbiAgICAgICAgbm9kZXMucHVzaCh0bXBOb2RlKTtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGVkZ2Ugb2YganNvbi5lZGdlcykge1xyXG4gICAgICAgIGxldCB0bXBFZGdlID0gbmV3IEVkZ2UoZWRnZS5sYWJlbCwgZWRnZS5pZCwgZWRnZS5mcm9tLCBlZGdlLnRvLCBlZGdlLmxlbmd0aCwgZWRnZS5mYWlsdXJlUmF0ZSwgZWRnZS5yZXBhaXJSYXRlKTtcclxuICAgICAgICBlZGdlcy5wdXNoKHRtcEVkZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKG5vZGVzKTtcclxuICAgIGNvbnNvbGUubG9nKGVkZ2VzKTtcclxufVxyXG5cclxuJCgnLmltcG9ydCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgIG5ldHdvcmsuZGVzdHJveSgpO1xyXG4gICAgbmV0d29yayA9IG51bGw7XHJcbiAgICByZW5kZXJUb3BvbG9neSgpO1xyXG4gICAgJCgnI2ltcG9ydC10b3BvbG9neScpLm1vZGFsKCdoaWRlJyk7XHJcbn0pO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGUnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVGaWxlU2VsZWN0LCBmYWxzZSk7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCcuZm9ybS12YWxpZGF0aW9uLXN1Y2Nlc3MnKS5oaWRlKCk7XHJcbiAgICAkKCcuZm9ybS12YWxpZGF0aW9uLWVycm9yJykuaGlkZSgpO1xyXG4gICAgaWYgKGdsb2JhbFVzZXJuYW1lID09ICcnIHx8IGdsb2JhbFBhc3N3b3JkID09ICcnKSB7XHJcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAkKCcubG9naW4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB1c2VybmFtZSA9ICQoJyN1c2VybmFtZS1pbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgICAgICBsZXQgcGFzc3dvcmQgPSAkKCcjcGFzc3dvcmQtaW5wdXQnKS52YWwoKTtcclxuICAgICAgICAgICAgZ2xvYmFsUGFzc3dvcmQgPSBwYXNzd29yZDtcclxuICAgICAgICAgICAgZ2xvYmFsVXNlcm5hbWUgPSB1c2VybmFtZTtcclxuICAgICAgICAgICAgbGV0IHNpZ25BamF4ID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHNpZ25BamF4LnNpZ251cCh1c2VybmFtZSwgcGFzc3dvcmQpO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcbnJlbmRlclRvcG9sb2d5KCk7XHJcbmRpamtzdHJhTW9kYWwoKTtcclxuYWJyYWhhbU1vZGFsKCk7XHJcbmV4cG9ydFRvcG9sb2d5KCk7XHJcbmRlbGV0ZU5ldHdvcmsoKTtcclxuIiwiaW1wb3J0IHsgRmFpbFJlcGFpclJhdGUgfSBmcm9tICcuL3JhdGVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFZGdlIGV4dGVuZHMgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgXHJcbiAgICAvKnZpc3VhbGl6YXRpb24qL1xyXG4gICAgcHJpdmF0ZSBsYWJlbDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBmcm9tOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHRvOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgIC8qYmFja2VuZCBwYXJhbWV0ZXJzKi9cclxuICAgIHByaXZhdGUgc3JjOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGRlc3Q6IHN0cmluZztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZyb206c3RyaW5nLCB0bzpzdHJpbmcsIGxlbmd0aDpudW1iZXIsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLmZyb20gPSBmcm9tO1xyXG4gICAgICAgIHRoaXMudG8gPSB0bztcclxuICAgICAgICB0aGlzLnNyYyA9IGZyb207XHJcbiAgICAgICAgdGhpcy5kZXN0ID0gdG87XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgICAgc3VwZXIuc2V0RmFpbHVyZVJhdGUoZmFpbHVyZVJhdGUpO1xyXG4gICAgICAgIHN1cGVyLnNldFJlcGFpclJhdGUocmVwYWlyUmF0ZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qIEdldHRlcnMgYW5kIHNldHRlcnMgKi9cclxuXHJcbiAgICBnZXRTcmMoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zcmM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3JjKHNyYzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSBzcmM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVzdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGVzdChkZXN0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRlc3QgPSBkZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMZW5ndGgobGVuZ3RoOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRGcm9tKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tKGZyb206IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VG8oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50bztcclxuICAgIH1cclxuXHJcbiAgICBzZXRUbyh0bzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRmFpbFJlcGFpclJhdGUgfSBmcm9tICcuL3JhdGVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBsYWJlbDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nOyBcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcikgeyBcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgc3VwZXIuc2V0RmFpbHVyZVJhdGUoZmFpbHVyZVJhdGUpO1xyXG4gICAgICAgIHN1cGVyLnNldFJlcGFpclJhdGUocmVwYWlyUmF0ZSk7IFxyXG4gICAgIH1cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJleHBvcnQgY2xhc3MgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBmYWlsdXJlUmF0ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZXBhaXJSYXRlOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzZXRGYWlsdXJlUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lke1xyXG4gICAgICAgIHRoaXMuZmFpbHVyZVJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldFJlcGFpclJhdGUocmF0ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXBhaXJSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRGYWlsdXJlUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhaWx1cmVSYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFJlcGFpclJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZXBhaXJSYXRlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL2VkZ2UnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUb3BvbG9neSB7XHJcbiAgICBwcml2YXRlIG5vZGVzOiBBcnJheTxOb2RlPjtcclxuICAgIHByaXZhdGUgbGlua3M6IEFycmF5PEVkZ2U+O1xyXG5cclxuICAgIC8vRElKS1NUUkEgcGFyYW1ldGVycyAtPiBzdGFydCAmIGVuZCBub2RlXHJcbiAgICBwcml2YXRlIHN0YXJ0OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGVuZDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmxpbmtzID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZUJ5SWQoaWQ6IHN0cmluZyk6IE5vZGUge1xyXG4gICAgICAgIGZvcihsZXQgbm9kZSBvZiB0aGlzLm5vZGVzKXtcclxuICAgICAgICAgICAgaWYobm9kZS5nZXRJZCgpID09PSBpZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRFZGdlQnlJZChpZDogc3RyaW5nKTogRWRnZSB7XHJcbiAgICAgICAgZm9yKGxldCBlZGdlIG9mIHRoaXMubGlua3MpIHtcclxuICAgICAgICAgICAgaWYoZWRnZS5nZXRJZCgpID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVkZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZXMoKTogTm9kZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRFZGdlcygpOiBFZGdlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpbmtzXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Tm9kZShub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGVzKG5vZGVzOiBOb2RlW10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RWRnZShlZGdlOiBFZGdlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcy5wdXNoKGVkZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2VzKGVkZ2VzOiBFZGdlW10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxpbmtzID0gZWRnZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhcnROb2RlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldFN0YXJ0Tm9kZShzdGFydDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgfVxyXG4gICAgZ2V0RW5kTm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZDtcclxuICAgIH0gICAgXHJcblxyXG4gICAgc2V0RW5kTm9kZShlbmQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5kID0gZW5kO1xyXG4gICAgfVxyXG59IiwiLyogRmlsZVNhdmVyLmpzXG4gKiBBIHNhdmVBcygpIEZpbGVTYXZlciBpbXBsZW1lbnRhdGlvbi5cbiAqIDEuMy4yXG4gKiAyMDE2LTA2LTE2IDE4OjI1OjE5XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgdmlldyA9PT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9jb25zdHJ1Y3Rvci9pLnRlc3Qodmlldy5IVE1MRWxlbWVudCkgfHwgdmlldy5zYWZhcmlcblx0XHQsIGlzX2Nocm9tZV9pb3MgPS9DcmlPU1xcL1tcXGRdKy8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdC8vIHRoZSBCbG9iIEFQSSBpcyBmdW5kYW1lbnRhbGx5IGJyb2tlbiBhcyB0aGVyZSBpcyBubyBcImRvd25sb2FkZmluaXNoZWRcIiBldmVudCB0byBzdWJzY3JpYmUgdG9cblx0XHQsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCA9IDEwMDAgKiA0MCAvLyBpbiBtc1xuXHRcdCwgcmV2b2tlID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHJldm9rZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiKSB7IC8vIGZpbGUgaXMgYW4gb2JqZWN0IFVSTFxuXHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdHNldFRpbWVvdXQocmV2b2tlciwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0KTtcblx0XHR9XG5cdFx0LCBkaXNwYXRjaCA9IGZ1bmN0aW9uKGZpbGVzYXZlciwgZXZlbnRfdHlwZXMsIGV2ZW50KSB7XG5cdFx0XHRldmVudF90eXBlcyA9IFtdLmNvbmNhdChldmVudF90eXBlcyk7XG5cdFx0XHR2YXIgaSA9IGV2ZW50X3R5cGVzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0dmFyIGxpc3RlbmVyID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50X3R5cGVzW2ldXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLCBldmVudCB8fCBmaWxlc2F2ZXIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdFx0XHR0aHJvd19vdXRzaWRlKGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0LCBhdXRvX2JvbSA9IGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRcdC8vIHByZXBlbmQgQk9NIGZvciBVVEYtOCBYTUwgYW5kIHRleHQvKiB0eXBlcyAoaW5jbHVkaW5nIEhUTUwpXG5cdFx0XHQvLyBub3RlOiB5b3VyIGJyb3dzZXIgd2lsbCBhdXRvbWF0aWNhbGx5IGNvbnZlcnQgVVRGLTE2IFUrRkVGRiB0byBFRiBCQiBCRlxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkVGRiksIGJsb2JdLCB7dHlwZTogYmxvYi50eXBlfSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYmxvYjtcblx0XHR9XG5cdFx0LCBGaWxlU2F2ZXIgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHQvLyBGaXJzdCB0cnkgYS5kb3dubG9hZCwgdGhlbiB3ZWIgZmlsZXN5c3RlbSwgdGhlbiBvYmplY3QgVVJMc1xuXHRcdFx0dmFyXG5cdFx0XHRcdCAgZmlsZXNhdmVyID0gdGhpc1xuXHRcdFx0XHQsIHR5cGUgPSBibG9iLnR5cGVcblx0XHRcdFx0LCBmb3JjZSA9IHR5cGUgPT09IGZvcmNlX3NhdmVhYmxlX3R5cGVcblx0XHRcdFx0LCBvYmplY3RfdXJsXG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICgoaXNfY2hyb21lX2lvcyB8fCAoZm9yY2UgJiYgaXNfc2FmYXJpKSkgJiYgdmlldy5GaWxlUmVhZGVyKSB7XG5cdFx0XHRcdFx0XHQvLyBTYWZhcmkgZG9lc24ndCBhbGxvdyBkb3dubG9hZGluZyBvZiBibG9iIHVybHNcblx0XHRcdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRcdFx0cmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgdXJsID0gaXNfY2hyb21lX2lvcyA/IHJlYWRlci5yZXN1bHQgOiByZWFkZXIucmVzdWx0LnJlcGxhY2UoL15kYXRhOlteO10qOy8sICdkYXRhOmF0dGFjaG1lbnQvZmlsZTsnKTtcblx0XHRcdFx0XHRcdFx0dmFyIHBvcHVwID0gdmlldy5vcGVuKHVybCwgJ19ibGFuaycpO1xuXHRcdFx0XHRcdFx0XHRpZighcG9wdXApIHZpZXcubG9jYXRpb24uaHJlZiA9IHVybDtcblx0XHRcdFx0XHRcdFx0dXJsPXVuZGVmaW5lZDsgLy8gcmVsZWFzZSByZWZlcmVuY2UgYmVmb3JlIGRpc3BhdGNoaW5nXG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoIW9iamVjdF91cmwpIHtcblx0XHRcdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoZm9yY2UpIHtcblx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHZhciBvcGVuZWQgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAoIW9wZW5lZCkge1xuXHRcdFx0XHRcdFx0XHQvLyBBcHBsZSBkb2VzIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L3NhZmFyaS9kb2N1bWVudGF0aW9uL1Rvb2xzL0NvbmNlcHR1YWwvU2FmYXJpRXh0ZW5zaW9uR3VpZGUvV29ya2luZ3dpdGhXaW5kb3dzYW5kVGFicy9Xb3JraW5nd2l0aFdpbmRvd3NhbmRUYWJzLmh0bWxcblx0XHRcdFx0XHRcdFx0dmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdH1cblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRmc19lcnJvcigpO1xuXHRcdH1cblx0XHQsIEZTX3Byb3RvID0gRmlsZVNhdmVyLnByb3RvdHlwZVxuXHRcdCwgc2F2ZUFzID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdHJldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsIG5hbWUgfHwgYmxvYi5uYW1lIHx8IFwiZG93bmxvYWRcIiwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRuYW1lID0gbmFtZSB8fCBibG9iLm5hbWUgfHwgXCJkb3dubG9hZFwiO1xuXG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lKTtcblx0XHR9O1xuXHR9XG5cblx0RlNfcHJvdG8uYWJvcnQgPSBmdW5jdGlvbigpe307XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoXCJGaWxlU2F2ZXIuanNcIiwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iXX0=
