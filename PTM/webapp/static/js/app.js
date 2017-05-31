(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AjaxController = (function () {
    function AjaxController() {
    }
    AjaxController.prototype.sendTopology = function (username, password, start, end, t, nodes, links) {
        var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, start: start, end: end, t: t });
        console.log(jsonTopology);
        $.ajax({
            url: 'http://localhost:8000/dijkstra',
            method: 'POST',
            context: this,
            data: jsonTopology,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log(data);
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
var nodes = new Array();
var edges = new Array();
var topology = new topology_1.Topology();
var isNodeSelected = false;
function renderTopology() {
    var container = document.getElementById('network');
    var testNode1 = new node_1.Node('Node1', 'Node1', 1, 2);
    var testNode2 = new node_1.Node('Node2', 'Node2', 1, 2);
    var testNode3 = new node_1.Node('Node3', 'Node3', 1, 2);
    nodes.push(testNode1);
    nodes.push(testNode2);
    nodes.push(testNode3);
    var ajaxRequest = new ajax_controller_1.AjaxController();
    var visnodes = new vis.DataSet(nodes);
    var visedges = new vis.DataSet(edges);
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
    var network = new vis.Network(container, data, options);
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
    console.log(nodes);
    callback(data);
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
    console.log(edges);
    clearEdgePopUp();
    callback(data);
}
function dijkstraModal() {
    $('#exampleModal').on('show.bs.modal', function () {
        $('#start-node').find('option').remove();
        $('#end-node').find('option').remove();
        for (var i = 0; i < nodes.length; i++) {
            $('#start-node').append('<option>' + nodes[i].getLabel() + '</option>');
            $('#end-node').append('<option>' + nodes[i].getLabel() + '</option>');
        }
    });
    $(document).on('click', '.calculate', function () {
        var username = $('#username').val();
        var password = $('#password').val();
        var startNode = $('#start-node').val();
        var endNode = $('#end-node').val();
        var time = parseInt($('#time').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        calcDijkstr.sendTopology(username, password, startNode, endNode, time, nodes, edges);
        $('#exampleModal').modal('hide');
    });
}
renderTopology();
dijkstraModal();
},{"./controllers/ajax.controller":1,"./models/edge":3,"./models/node":4,"./models/topology":6}],3:[function(require,module,exports){
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
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFDSTtJQUNBLENBQUM7SUFFTSxxQ0FBWSxHQUFuQixVQUFvQixRQUFnQixFQUFFLFFBQWdCLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxDQUFTLEVBQUUsS0FBVSxFQUFFLEtBQVU7UUFFakgsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFDLEtBQUssT0FBQSxFQUFDLEtBQUssT0FBQSxFQUFDLEdBQUcsS0FBQSxFQUFFLENBQUMsR0FBQSxFQUFDLENBQUMsQ0FBQztRQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDSCxHQUFHLEVBQUUsZ0NBQWdDO1lBQ3JDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsWUFBWTtZQUNsQixPQUFPLEVBQUUsVUFBUyxJQUFTO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxLQUFLLEVBQUUsVUFBUyxJQUFTO2dCQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLENBQUM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQXRC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Q0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsS0FBYTtRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsMEJBQU8sR0FBUCxVQUFRLElBQVU7UUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsMkJBQVEsR0FBUixVQUFTLEtBQWE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELCtCQUFZLEdBQVo7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsK0JBQVksR0FBWixVQUFhLEtBQWE7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUNELDZCQUFVLEdBQVY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRUQsNkJBQVUsR0FBVixVQUFXLEdBQVc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQW5FQSxBQW1FQyxJQUFBO0FBbkVZLDRCQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBBamF4Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VuZFRvcG9sb2d5KHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nLCB0OiBudW1iZXIsIG5vZGVzOiBhbnksIGxpbmtzOiBhbnkpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IGpzb25Ub3BvbG9neSA9IEpTT04uc3RyaW5naWZ5KHt1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLGxpbmtzLHN0YXJ0LGVuZCwgdH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGpzb25Ub3BvbG9neSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2RpamtzdHJhJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9tb2RlbHMvbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL21vZGVscy9lZGdlJztcclxuaW1wb3J0IHsgQWpheENvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlcic7XHJcbmltcG9ydCB7IFRvcG9sb2d5IH0gZnJvbSAnLi9tb2RlbHMvdG9wb2xvZ3knO1xyXG5cclxuZGVjbGFyZSB2YXIgdmlzOiBhbnk7XHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmxldCBub2RlczogTm9kZVtdID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbmxldCBlZGdlczogRWRnZVtdID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbmxldCB0b3BvbG9neTogVG9wb2xvZ3kgPSBuZXcgVG9wb2xvZ3koKTtcclxubGV0IGlzTm9kZVNlbGVjdGVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlclRvcG9sb2d5KCkge1xyXG5cclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yaycpO1xyXG5cclxuICAgIGxldCB0ZXN0Tm9kZTEgPSBuZXcgTm9kZSgnTm9kZTEnLCAnTm9kZTEnLCAxLCAyKTtcclxuICAgIGxldCB0ZXN0Tm9kZTIgPSBuZXcgTm9kZSgnTm9kZTInLCAnTm9kZTInLCAxLCAyKTtcclxuICAgIGxldCB0ZXN0Tm9kZTMgPSBuZXcgTm9kZSgnTm9kZTMnLCAnTm9kZTMnLCAxLCAyKTtcclxuXHJcbiAgICBub2Rlcy5wdXNoKHRlc3ROb2RlMSk7XHJcbiAgICBub2Rlcy5wdXNoKHRlc3ROb2RlMik7XHJcbiAgICBub2Rlcy5wdXNoKHRlc3ROb2RlMyk7XHJcbiAgICB2YXIgYWpheFJlcXVlc3Q6IEFqYXhDb250cm9sbGVyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcblxyXG4gICAgbGV0IHZpc25vZGVzID0gbmV3IHZpcy5EYXRhU2V0KG5vZGVzKTtcclxuICAgIGxldCB2aXNlZGdlcyA9IG5ldyB2aXMuRGF0YVNldChlZGdlcyk7XHJcblxyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgbm9kZXM6IHZpc25vZGVzLFxyXG4gICAgICAgIGVkZ2VzOiB2aXNlZGdlc1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdG9wb2xvZ3kuc2V0Tm9kZXMobm9kZXMpO1xyXG4gICAgdG9wb2xvZ3kuc2V0RWRnZXMoZWRnZXMpO1xyXG5cclxuICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIG5vZGVzOiB7XHJcbiAgICAgICAgICAgIHNoYXBlOiAnZG90JyxcclxuICAgICAgICAgICAgc2l6ZTogMzAsXHJcbiAgICAgICAgICAgIGNvbG9yOiB7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwaHlzaWNzOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWRnZXM6IHtcclxuICAgICAgICAgICAgcGh5c2ljczogZmFsc2UsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgICAgICBsZW5ndGg6IDEwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgcmFuZG9tU2VlZDogMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFuaXB1bGF0aW9uOiB7XHJcbiAgICAgICAgICAgIGluaXRpYWxseUFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGFkZE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJBZGQgTm9kZVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IE5vZGVcIjtcclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkRWRnZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZnJvbSA9PSBkYXRhLnRvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjb25maXJtKFwiRG8geW91IHdhbnQgdG8gY29ubmVjdCB0aGUgbm9kZSB0byBpdHNlbGY/XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyICE9IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdEVkZ2U6IHtcclxuICAgICAgICAgICAgICAgIGVkaXRXaXRob3V0RHJhZzogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiRWRpdCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgdmFyIG5ldHdvcmsgPSBuZXcgdmlzLk5ldHdvcmsoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcclxuICAgIHJlZ2lzdGVyRXZlbnQobmV0d29yayk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0Tm9kZShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZSA9IGRhdGEubGFiZWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IHNhdmVOb2RlRGF0YS5iaW5kKHRoaXMsIGRhdGEsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBjYW5jZWxOb2RlRWRpdC5iaW5kKHRoaXMsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlZ2lzdGVyRXZlbnQoZGF0YTogYW55KSB7XHJcbiAgICBkYXRhLm9uKFwic2VsZWN0XCIsIGZ1bmN0aW9uIChwYXJhbXM6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhcmFtcyk7XHJcbiAgICAgICAgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPT0gMCAmJiBwYXJhbXMuZWRnZXMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2U6IEVkZ2UgPSB0b3BvbG9neS5nZXRFZGdlQnlJZChwYXJhbXMuZWRnZXNbJzAnXSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gJzxoMj5FZGdlPC9oMj4nICsgJzxwPjxzcGFuPkxhYmVsOiA8L3NwYW4+JyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RmFpbHVyZSByYXRlOjwvc3Bhbj4gJyArIGVkZ2UuZ2V0RmFpbHVyZVJhdGUoKSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+UmVwYWlyIHJhdGU6IDwvc3Bhbj4nICsgZWRnZS5nZXRSZXBhaXJSYXRlKCkgKyAnPC9wPic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbm9kZTogTm9kZSA9IHRvcG9sb2d5LmdldE5vZGVCeUlkKHBhcmFtcy5ub2Rlc1snMCddKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPk5vZGU8L2gyPicgKyAnPHA+PHNwYW4+TGFiZWw6IDwvc3Bhbj4nICsgcGFyYW1zLm5vZGVzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5FZGdlczogPC9zcGFuPicgKyBwYXJhbXMuZWRnZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkZhaWx1cmUgcmF0ZTogPC9zcGFuPicgKyBub2RlLmdldEZhaWx1cmVSYXRlKCkgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPlJlcGFpciByYXRlOiA8L3NwYW4+JyArIG5vZGUuZ2V0UmVwYWlyUmF0ZSgpICsgJzwvcD4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA9PSAwICYmIHBhcmFtcy5lZGdlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjbGVhck5vZGVQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxOb2RlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhck5vZGVQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVOb2RlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcblxyXG4gICAgbGV0IHRlbXBOb2RlOiBOb2RlID0gbmV3IE5vZGUoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIG5vZGVzLnB1c2godGVtcE5vZGUpO1xyXG4gICAgY29uc29sZS5sb2cobm9kZXMpO1xyXG4gICAgY2FsbGJhY2soZGF0YSk7XHJcblxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZUVkZ2VEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbEVkZ2VFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJFZGdlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsRWRnZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlRWRnZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEudG8gPT09ICdvYmplY3QnKVxyXG4gICAgICAgIGRhdGEudG8gPSBkYXRhLnRvLmlkXHJcbiAgICBpZiAodHlwZW9mIGRhdGEuZnJvbSA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS5mcm9tID0gZGF0YS5mcm9tLmlkXHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgZGF0YS5pZCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1pZCcpKS52YWx1ZTtcclxuICAgIGRhdGEuZmFpbHVyZVJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWZhaWx1cmVSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEucmVwYWlyUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcmVwYWlyUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLmxlbmd0aCA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGVuZ3RoJykpLnZhbHVlKTtcclxuICAgIGxldCB0ZW1wRWRnZTogRWRnZSA9IG5ldyBFZGdlKGRhdGEubGFiZWwsIGRhdGEuaWQsIGRhdGEuZnJvbSwgZGF0YS50bywgZGF0YS5sZW5ndGgsIGRhdGEuZmFpbHVyZVJhdGUsIGRhdGEucmVwYWlyUmF0ZSk7XHJcbiAgICBlZGdlcy5wdXNoKHRlbXBFZGdlKTtcclxuICAgIGNvbnNvbGUubG9nKGVkZ2VzKTtcclxuICAgIGNsZWFyRWRnZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpamtzdHJhTW9kYWwoKSB7XHJcblxyXG4gICAgJCgnI2V4YW1wbGVNb2RhbCcpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJyNzdGFydC1ub2RlJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCk7XHJcbiAgICAgICAgJCgnI2VuZC1ub2RlJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAkKCcjc3RhcnQtbm9kZScpLmFwcGVuZCgnPG9wdGlvbj4nICsgbm9kZXNbaV0uZ2V0TGFiZWwoKSArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgJCgnI2VuZC1ub2RlJykuYXBwZW5kKCc8b3B0aW9uPicgKyBub2Rlc1tpXS5nZXRMYWJlbCgpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHVzZXJuYW1lID0gJCgnI3VzZXJuYW1lJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gJCgnI3Bhc3N3b3JkJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlJykudmFsKCk7XHJcbiAgICAgICAgbGV0IGVuZE5vZGUgPSAkKCcjZW5kLW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGNhbGNEaWprc3RyLnNlbmRUb3BvbG9neSh1c2VybmFtZSxwYXNzd29yZCxzdGFydE5vZGUsZW5kTm9kZSx0aW1lLG5vZGVzLGVkZ2VzKTtcclxuICAgICAgICAgJCgnI2V4YW1wbGVNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxucmVuZGVyVG9wb2xvZ3koKTtcclxuZGlqa3N0cmFNb2RhbCgpOyIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRWRnZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIFxyXG4gICAgLyp2aXN1YWxpemF0aW9uKi9cclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgZnJvbTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSB0bzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgICAvKmJhY2tlbmQgcGFyYW1ldGVycyovXHJcbiAgICBwcml2YXRlIHNyYzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBkZXN0OiBzdHJpbmc7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOnN0cmluZywgaWQ6c3RyaW5nLCBmcm9tOnN0cmluZywgdG86c3RyaW5nLCBsZW5ndGg6bnVtYmVyLCBmYWlsdXJlUmF0ZTpudW1iZXIsIHJlcGFpclJhdGU6bnVtYmVyKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICAgICAgdGhpcy5zcmMgPSBmcm9tO1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IHRvO1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKiBHZXR0ZXJzIGFuZCBzZXR0ZXJzICovXHJcblxyXG4gICAgZ2V0U3JjKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFNyYyhzcmM6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3JjID0gc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIGdldERlc3QoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldERlc3QoZGVzdDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kZXN0ID0gZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRMZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGVuZ3RoKGxlbmd0aDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RnJvbSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZyb207XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbShmcm9tOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZyb20gPSBmcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRvKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG87XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG8odG86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudG8gPSB0bztcclxuICAgIH1cclxufSIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcikgeyBcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgc3VwZXIuc2V0RmFpbHVyZVJhdGUoZmFpbHVyZVJhdGUpO1xyXG4gICAgICAgIHN1cGVyLnNldFJlcGFpclJhdGUocmVwYWlyUmF0ZSk7IFxyXG4gICAgIH1cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJleHBvcnQgY2xhc3MgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBmYWlsdXJlUmF0ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZXBhaXJSYXRlOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIHB1YmxpYyBzZXRGYWlsdXJlUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lke1xyXG4gICAgICAgIHRoaXMuZmFpbHVyZVJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldFJlcGFpclJhdGUocmF0ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXBhaXJSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRGYWlsdXJlUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhaWx1cmVSYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFJlcGFpclJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZXBhaXJSYXRlO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL2VkZ2UnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUb3BvbG9neSB7XHJcbiAgICBwcml2YXRlIG5vZGVzOiBBcnJheTxOb2RlPjtcclxuICAgIHByaXZhdGUgbGlua3M6IEFycmF5PEVkZ2U+O1xyXG5cclxuICAgIC8vRElKS1NUUkEgcGFyYW1ldGVycyAtPiBzdGFydCAmIGVuZCBub2RlXHJcbiAgICBwcml2YXRlIHN0YXJ0OiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGVuZDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxuICAgICAgICB0aGlzLmxpbmtzID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZUJ5SWQoaWQ6IHN0cmluZyk6IE5vZGUge1xyXG4gICAgICAgIGZvcihsZXQgbm9kZSBvZiB0aGlzLm5vZGVzKXtcclxuICAgICAgICAgICAgaWYobm9kZS5nZXRJZCgpID09PSBpZCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRFZGdlQnlJZChpZDogc3RyaW5nKTogRWRnZSB7XHJcbiAgICAgICAgZm9yKGxldCBlZGdlIG9mIHRoaXMubGlua3MpIHtcclxuICAgICAgICAgICAgaWYoZWRnZS5nZXRJZCgpID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVkZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Tm9kZXMoKTogTm9kZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRFZGdlcygpOiBFZGdlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpbmtzXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Tm9kZShub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGVzKG5vZGVzOiBOb2RlW10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RWRnZShlZGdlOiBFZGdlKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcy5wdXNoKGVkZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2VzKGVkZ2VzOiBFZGdlW10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxpbmtzID0gZWRnZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhcnROb2RlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldFN0YXJ0Tm9kZShzdGFydDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgfVxyXG4gICAgZ2V0RW5kTm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVuZDtcclxuICAgIH0gICAgXHJcblxyXG4gICAgc2V0RW5kTm9kZShlbmQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZW5kID0gZW5kO1xyXG4gICAgfVxyXG59Il19
