(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AjaxController = (function () {
    function AjaxController() {
    }
    AjaxController.prototype.sendTopology = function (topology) {
        var jsonTopology = JSON.stringify(topology);
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
function renderTopology() {
    var container = document.getElementById('network');
    var ajaxRequest = new ajax_controller_1.AjaxController();
    var testnode = new node_1.Node("patak", "borna", 12, 34);
    var testnode2 = new node_1.Node("patka", "vedran", 56, 78);
    var testedge = new edge_1.Edge("istinska ljubav", "tajnaveza", "patak", "patka", 1, 2, 3);
    nodes.push(testnode);
    nodes.push(testnode2);
    edges.push(testedge);
    var visnodes = new vis.DataSet(nodes);
    var visedges = new vis.DataSet(edges);
    var data = {
        nodes: visnodes,
        edges: visedges
    };
    topology.setNodes(nodes);
    topology.setEdges(edges);
    topology.setStartNode(testnode.getLabel());
    topology.setEndNode(testnode2.getLabel());
    ajaxRequest.sendTopology(topology);
    var options = {
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
    showNodeInformation(network);
    showEdgeInformation(network);
}
function editNode(data, callback) {
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelNodeEdit.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}
function showNodeInformation(data) {
    data.on("selectNode", function (params) {
        console.log(params);
        params.event = "[original event]";
        document.getElementById('event-catcher').innerHTML = '<h2>Node parameters: </h2>' + '<p>Label: ' + params.nodes + '</p>'
            + '<p>Edges: ' + params.edges + '</p>'
            + '<p>Failure rate: ' + params.failureRate + '</p>'
            + '<p>Repair rate: ' + params.repairRate + '</p>';
    });
}
function showEdgeInformation(data) {
    data.on("selectEdge", function (params) {
        params.event = "[original event]";
        document.getElementById('event-catcher').innerHTML = '<h2>Edge parameters: </h2>' + '<p>Label: ' + params.edges + '</p>';
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
renderTopology();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFDSTtJQUNBLENBQUM7SUFFTSxxQ0FBWSxHQUFuQixVQUFvQixRQUFhO1FBRTdCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNILEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRSxZQUFZO1lBQ2xCLE9BQU8sRUFBRSxVQUFTLElBQVM7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELEtBQUssRUFBRSxVQUFTLElBQVM7Z0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxxQkFBQztBQUFELENBckJBLEFBcUJDLElBQUE7QUFyQlksd0NBQWM7Ozs7QUNGM0Isc0NBQXFDO0FBQ3JDLHNDQUFxQztBQUNyQyxpRUFBK0Q7QUFDL0QsOENBQTZDO0FBSTdDLElBQUksS0FBSyxHQUFXLElBQUksS0FBSyxFQUFRLENBQUM7QUFDdEMsSUFBSSxLQUFLLEdBQVcsSUFBSSxLQUFLLEVBQVEsQ0FBQztBQUN0QyxJQUFJLFFBQVEsR0FBYSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUl4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O1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCwwQkFBTyxHQUFQLFVBQVEsSUFBVTtRQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsS0FBYTtRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsK0JBQVksR0FBWjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCwrQkFBWSxHQUFaLFVBQWEsS0FBYTtRQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBQ0QsNkJBQVUsR0FBVjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7SUFFRCw2QkFBVSxHQUFWLFVBQVcsR0FBVztRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBQ0wsZUFBQztBQUFELENBbkVBLEFBbUVDLElBQUE7QUFuRVksNEJBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZGVjbGFyZSB2YXIgJDogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIEFqYXhDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyAgIFxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZW5kVG9wb2xvZ3kodG9wb2xvZ3k6IGFueSk6IHZvaWQge1xyXG5cclxuICAgICAgICBsZXQganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkodG9wb2xvZ3kpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9kaWprc3RyYScsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgICAgICAgICBkYXRhOiBqc29uVG9wb2xvZ3ksXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbW9kZWxzL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9tb2RlbHMvZWRnZSc7XHJcbmltcG9ydCB7IEFqYXhDb250cm9sbGVyIH0gZnJvbSAnLi9jb250cm9sbGVycy9hamF4LmNvbnRyb2xsZXInO1xyXG5pbXBvcnQgeyBUb3BvbG9neSB9IGZyb20gJy4vbW9kZWxzL3RvcG9sb2d5JztcclxuXHJcbmRlY2xhcmUgdmFyIHZpczogYW55O1xyXG5cclxubGV0IG5vZGVzOiBOb2RlW10gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxubGV0IGVkZ2VzOiBFZGdlW10gPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxubGV0IHRvcG9sb2d5OiBUb3BvbG9neSA9IG5ldyBUb3BvbG9neSgpO1xyXG5cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJUb3BvbG9neSgpIHtcclxuXHJcbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmsnKTtcclxuXHJcbiAgICB2YXIgYWpheFJlcXVlc3Q6IEFqYXhDb250cm9sbGVyID0gbmV3IEFqYXhDb250cm9sbGVyKCk7XHJcblxyXG4gICAgbGV0IHRlc3Rub2RlOiBOb2RlID0gbmV3IE5vZGUoXCJwYXRha1wiLCBcImJvcm5hXCIsIDEyLCAzNCk7XHJcbiAgICBsZXQgdGVzdG5vZGUyOiBOb2RlID0gbmV3IE5vZGUoXCJwYXRrYVwiLCBcInZlZHJhblwiLCA1NiwgNzgpO1xyXG5cclxuICAgIGxldCB0ZXN0ZWRnZTogRWRnZSA9IG5ldyBFZGdlKFwiaXN0aW5za2EgbGp1YmF2XCIsIFwidGFqbmF2ZXphXCIsIFwicGF0YWtcIiwgXCJwYXRrYVwiLCAxLCAyLCAzKTtcclxuXHJcbiAgICBub2Rlcy5wdXNoKHRlc3Rub2RlKTtcclxuICAgIG5vZGVzLnB1c2godGVzdG5vZGUyKTtcclxuICAgIGVkZ2VzLnB1c2godGVzdGVkZ2UpO1xyXG5cclxuICAgIGxldCB2aXNub2RlcyA9IG5ldyB2aXMuRGF0YVNldChub2Rlcyk7XHJcbiAgICBsZXQgdmlzZWRnZXMgPSBuZXcgdmlzLkRhdGFTZXQoZWRnZXMpO1xyXG5cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIG5vZGVzOiB2aXNub2RlcyxcclxuICAgICAgICBlZGdlczogdmlzZWRnZXNcclxuICAgIH07XHJcbiAgICB0b3BvbG9neS5zZXROb2Rlcyhub2Rlcyk7XHJcbiAgICB0b3BvbG9neS5zZXRFZGdlcyhlZGdlcyk7XHJcblxyXG4gICAgdG9wb2xvZ3kuc2V0U3RhcnROb2RlKHRlc3Rub2RlLmdldExhYmVsKCkpO1xyXG4gICAgdG9wb2xvZ3kuc2V0RW5kTm9kZSh0ZXN0bm9kZTIuZ2V0TGFiZWwoKSk7XHJcbiAgICBhamF4UmVxdWVzdC5zZW5kVG9wb2xvZ3kodG9wb2xvZ3kpO1xyXG5cclxuICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIGxheW91dDoge1xyXG4gICAgICAgICAgICByYW5kb21TZWVkOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYW5pcHVsYXRpb246IHtcclxuICAgICAgICAgICAgaW5pdGlhbGx5QWN0aXZlOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgYWRkTm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0Tm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFZGdlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5mcm9tID09IGRhdGEudG8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byBjb25uZWN0IHRoZSBub2RlIHRvIGl0c2VsZj9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgIT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0RWRnZToge1xyXG4gICAgICAgICAgICAgICAgZWRpdFdpdGhvdXREcmFnOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB5b3VyIG5ldHdvcmshXHJcbiAgICB2YXIgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgc2hvd05vZGVJbmZvcm1hdGlvbihuZXR3b3JrKTtcclxuICAgIHNob3dFZGdlSW5mb3JtYXRpb24obmV0d29yayk7XHJcbiAgICBcclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdE5vZGUoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlTm9kZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsTm9kZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93Tm9kZUluZm9ybWF0aW9uKGRhdGE6YW55KXtcclxuICAgIGRhdGEub24oXCJzZWxlY3ROb2RlXCIsIGZ1bmN0aW9uIChwYXJhbXM6YW55KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGFyYW1zKTtcclxuICAgICAgICBwYXJhbXMuZXZlbnQgPSBcIltvcmlnaW5hbCBldmVudF1cIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9ICc8aDI+Tm9kZSBwYXJhbWV0ZXJzOiA8L2gyPicgKyAnPHA+TGFiZWw6ICcrIHBhcmFtcy5ub2RlcyArICc8L3A+JyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyc8cD5FZGdlczogJyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArJzxwPkZhaWx1cmUgcmF0ZTogJyArIHBhcmFtcy5mYWlsdXJlUmF0ZSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArJzxwPlJlcGFpciByYXRlOiAnICsgcGFyYW1zLnJlcGFpclJhdGUgKyAnPC9wPicgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93RWRnZUluZm9ybWF0aW9uKGRhdGE6YW55KXtcclxuICAgIGRhdGEub24oXCJzZWxlY3RFZGdlXCIsIGZ1bmN0aW9uIChwYXJhbXM6YW55KSB7XHJcbiAgICAgICAgcGFyYW1zLmV2ZW50ID0gXCJbb3JpZ2luYWwgZXZlbnRdXCI7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPkVkZ2UgcGFyYW1ldGVyczogPC9oMj4nICsgJzxwPkxhYmVsOiAnKyBwYXJhbXMuZWRnZXMgKyAnPC9wPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyTm9kZVBvcFVwKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbE5vZGVFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZU5vZGVEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgZGF0YS5sYWJlbCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZTtcclxuICAgIGRhdGEuaWQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtaWQnKSkudmFsdWU7XHJcbiAgICBkYXRhLmZhaWx1cmVSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1mYWlsdXJlUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLnJlcGFpclJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXJlcGFpclJhdGUnKSkudmFsdWUpO1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuXHJcbiAgICBsZXQgdGVtcE5vZGU6IE5vZGUgPSBuZXcgTm9kZShkYXRhLmxhYmVsLCBkYXRhLmlkLCBkYXRhLmZhaWx1cmVSYXRlLCBkYXRhLnJlcGFpclJhdGUpO1xyXG4gICAgbm9kZXMucHVzaCh0ZW1wTm9kZSk7XHJcbiAgICBjb25zb2xlLmxvZyhub2Rlcyk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuXHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlRWRnZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsRWRnZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhckVkZ2VQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxFZGdlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVFZGdlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YS50byA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS50byA9IGRhdGEudG8uaWRcclxuICAgIGlmICh0eXBlb2YgZGF0YS5mcm9tID09PSAnb2JqZWN0JylcclxuICAgICAgICBkYXRhLmZyb20gPSBkYXRhLmZyb20uaWRcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEubGVuZ3RoID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1sZW5ndGgnKSkudmFsdWUpO1xyXG4gICAgbGV0IHRlbXBFZGdlOiBFZGdlID0gbmV3IEVkZ2UoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mcm9tLCBkYXRhLnRvLCBkYXRhLmxlbmd0aCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIGVkZ2VzLnB1c2godGVtcEVkZ2UpO1xyXG4gICAgY29uc29sZS5sb2coZWRnZXMpO1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKGRhdGEpO1xyXG5cclxufVxyXG5cclxucmVuZGVyVG9wb2xvZ3koKTsiLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBcclxuICAgIC8qdmlzdWFsaXphdGlvbiovXHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgLypiYWNrZW5kIHBhcmFtZXRlcnMqL1xyXG4gICAgcHJpdmF0ZSBzcmM6IHN0cmluZztcclxuICAgIHByaXZhdGUgZGVzdDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZnJvbTpzdHJpbmcsIHRvOnN0cmluZywgbGVuZ3RoOm51bWJlciwgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcil7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgICAgIHRoaXMuc3JjID0gZnJvbTtcclxuICAgICAgICB0aGlzLmRlc3QgPSB0bztcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldFNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNyYztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTcmMoc3JjOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgIH1cclxuXHJcbiAgICBnZXREZXN0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXREZXN0KGRlc3Q6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExlbmd0aChsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZyb20oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb20oZnJvbTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUbygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvKHRvOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpIHsgXHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpOyBcclxuICAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIFxyXG59IiwiZXhwb3J0IGNsYXNzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgZmFpbHVyZVJhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVwYWlyUmF0ZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgc2V0RmFpbHVyZVJhdGUocmF0ZTogbnVtYmVyKTogdm9pZHtcclxuICAgICAgICB0aGlzLmZhaWx1cmVSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRSZXBhaXJSYXRlKHJhdGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVwYWlyUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0RmFpbHVyZVJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsdXJlUmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRSZXBhaXJSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwYWlyUmF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9lZGdlJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVG9wb2xvZ3kge1xyXG4gICAgcHJpdmF0ZSBub2RlczogQXJyYXk8Tm9kZT47XHJcbiAgICBwcml2YXRlIGxpbmtzOiBBcnJheTxFZGdlPjtcclxuXHJcbiAgICAvL0RJSktTVFJBIHBhcmFtZXRlcnMgLT4gc3RhcnQgJiBlbmQgbm9kZVxyXG4gICAgcHJpdmF0ZSBzdGFydDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBlbmQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVCeUlkKGlkOiBzdHJpbmcpOiBOb2RlIHtcclxuICAgICAgICBmb3IobGV0IG5vZGUgb2YgdGhpcy5ub2Rlcyl7XHJcbiAgICAgICAgICAgIGlmKG5vZGUuZ2V0SWQoKSA9PT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZUJ5SWQoaWQ6IHN0cmluZyk6IEVkZ2Uge1xyXG4gICAgICAgIGZvcihsZXQgZWRnZSBvZiB0aGlzLmxpbmtzKSB7XHJcbiAgICAgICAgICAgIGlmKGVkZ2UuZ2V0SWQoKSA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlZGdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVzKCk6IE5vZGVbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZXMoKTogRWRnZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGUobm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2Rlcyhub2RlczogTm9kZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2UoZWRnZTogRWRnZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MucHVzaChlZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlcyhlZGdlczogRWRnZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IGVkZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXJ0Tm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0O1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRTdGFydE5vZGUoc3RhcnQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgIH1cclxuICAgIGdldEVuZE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbmQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldEVuZE5vZGUoZW5kOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgIH1cclxufSJdfQ==
