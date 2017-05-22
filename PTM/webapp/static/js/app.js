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
}
function editNode(data, callback) {
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelNodeEdit.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFDSTtJQUNBLENBQUM7SUFFTSxxQ0FBWSxHQUFuQixVQUFvQixRQUFhO1FBRTdCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNILEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRSxZQUFZO1lBQ2xCLE9BQU8sRUFBRSxVQUFTLElBQVM7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELEtBQUssRUFBRSxVQUFTLElBQVM7Z0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxxQkFBQztBQUFELENBckJBLEFBcUJDLElBQUE7QUFyQlksd0NBQWM7Ozs7QUNGM0Isc0NBQXFDO0FBQ3JDLHNDQUFxQztBQUNyQyxpRUFBK0Q7QUFDL0QsOENBQTZDO0FBSTdDLElBQUksS0FBSyxHQUFXLElBQUksS0FBSyxFQUFRLENBQUM7QUFDdEMsSUFBSSxLQUFLLEdBQVcsSUFBSSxLQUFLLEVBQVEsQ0FBQztBQUN0QyxJQUFJLFFBQVEsR0FBYSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUl4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LEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsMkJBQVEsR0FBUjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ3JCLENBQUM7SUFFRCwwQkFBTyxHQUFQLFVBQVEsSUFBVTtRQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsS0FBYTtRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsMEJBQU8sR0FBUCxVQUFRLElBQVU7UUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsMkJBQVEsR0FBUixVQUFTLEtBQWE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELCtCQUFZLEdBQVo7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsK0JBQVksR0FBWixVQUFhLEtBQWE7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUNELDZCQUFVLEdBQVY7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRUQsNkJBQVUsR0FBVixVQUFXLEdBQVc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQW5FQSxBQW1FQyxJQUFBO0FBbkVZLDRCQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBBamF4Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VuZFRvcG9sb2d5KHRvcG9sb2d5OiBhbnkpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IGpzb25Ub3BvbG9neSA9IEpTT04uc3RyaW5naWZ5KHRvcG9sb2d5KTtcclxuICAgICAgICBcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvZGlqa3N0cmEnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgZGF0YToganNvblRvcG9sb2d5LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL21vZGVscy9ub2RlJztcclxuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4vbW9kZWxzL2VkZ2UnO1xyXG5pbXBvcnQgeyBBamF4Q29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvYWpheC5jb250cm9sbGVyJztcclxuaW1wb3J0IHsgVG9wb2xvZ3kgfSBmcm9tICcuL21vZGVscy90b3BvbG9neSc7XHJcblxyXG5kZWNsYXJlIHZhciB2aXM6IGFueTtcclxuXHJcbmxldCBub2RlczogTm9kZVtdID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbmxldCBlZGdlczogRWRnZVtdID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbmxldCB0b3BvbG9neTogVG9wb2xvZ3kgPSBuZXcgVG9wb2xvZ3koKTtcclxuXHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVyVG9wb2xvZ3koKSB7XHJcblxyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrJyk7XHJcblxyXG4gICAgdmFyIGFqYXhSZXF1ZXN0OiBBamF4Q29udHJvbGxlciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG5cclxuICAgIGxldCB0ZXN0bm9kZTogTm9kZSA9IG5ldyBOb2RlKFwicGF0YWtcIiwgXCJib3JuYVwiLCAxMiwgMzQpO1xyXG4gICAgbGV0IHRlc3Rub2RlMjogTm9kZSA9IG5ldyBOb2RlKFwicGF0a2FcIiwgXCJ2ZWRyYW5cIiwgNTYsIDc4KTtcclxuXHJcbiAgICBsZXQgdGVzdGVkZ2U6IEVkZ2UgPSBuZXcgRWRnZShcImlzdGluc2thIGxqdWJhdlwiLCBcInRham5hdmV6YVwiLCBcInBhdGFrXCIsIFwicGF0a2FcIiwgMSwgMiwgMyk7XHJcblxyXG4gICAgbm9kZXMucHVzaCh0ZXN0bm9kZSk7XHJcbiAgICBub2Rlcy5wdXNoKHRlc3Rub2RlMik7XHJcbiAgICBlZGdlcy5wdXNoKHRlc3RlZGdlKTtcclxuXHJcbiAgICBsZXQgdmlzbm9kZXMgPSBuZXcgdmlzLkRhdGFTZXQobm9kZXMpO1xyXG4gICAgbGV0IHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICBub2Rlczogdmlzbm9kZXMsXHJcbiAgICAgICAgZWRnZXM6IHZpc2VkZ2VzXHJcbiAgICB9O1xyXG4gICAgdG9wb2xvZ3kuc2V0Tm9kZXMobm9kZXMpO1xyXG4gICAgdG9wb2xvZ3kuc2V0RWRnZXMoZWRnZXMpO1xyXG5cclxuICAgIHRvcG9sb2d5LnNldFN0YXJ0Tm9kZSh0ZXN0bm9kZS5nZXRMYWJlbCgpKTtcclxuICAgIHRvcG9sb2d5LnNldEVuZE5vZGUodGVzdG5vZGUyLmdldExhYmVsKCkpO1xyXG4gICAgYWpheFJlcXVlc3Quc2VuZFRvcG9sb2d5KHRvcG9sb2d5KTtcclxuXHJcbiAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgcmFuZG9tU2VlZDogMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFuaXB1bGF0aW9uOiB7XHJcbiAgICAgICAgICAgIGluaXRpYWxseUFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGFkZE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJBZGQgTm9kZVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IE5vZGVcIjtcclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkRWRnZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZnJvbSA9PSBkYXRhLnRvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjb25maXJtKFwiRG8geW91IHdhbnQgdG8gY29ubmVjdCB0aGUgbm9kZSB0byBpdHNlbGY/XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyICE9IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdEVkZ2U6IHtcclxuICAgICAgICAgICAgICAgIGVkaXRXaXRob3V0RHJhZzogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiRWRpdCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgdmFyIG5ldHdvcmsgPSBuZXcgdmlzLk5ldHdvcmsoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdE5vZGUoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlTm9kZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsTm9kZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhck5vZGVQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxOb2RlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhck5vZGVQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVOb2RlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcblxyXG4gICAgbGV0IHRlbXBOb2RlOiBOb2RlID0gbmV3IE5vZGUoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIG5vZGVzLnB1c2godGVtcE5vZGUpO1xyXG4gICAgY29uc29sZS5sb2cobm9kZXMpO1xyXG4gICAgY2FsbGJhY2soZGF0YSk7XHJcblxyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZUVkZ2VEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbEVkZ2VFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJFZGdlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsRWRnZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlRWRnZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEudG8gPT09ICdvYmplY3QnKVxyXG4gICAgICAgIGRhdGEudG8gPSBkYXRhLnRvLmlkXHJcbiAgICBpZiAodHlwZW9mIGRhdGEuZnJvbSA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS5mcm9tID0gZGF0YS5mcm9tLmlkXHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgZGF0YS5pZCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1pZCcpKS52YWx1ZTtcclxuICAgIGRhdGEuZmFpbHVyZVJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWZhaWx1cmVSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEucmVwYWlyUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcmVwYWlyUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLmxlbmd0aCA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGVuZ3RoJykpLnZhbHVlKTtcclxuICAgIGxldCB0ZW1wRWRnZTogRWRnZSA9IG5ldyBFZGdlKGRhdGEubGFiZWwsIGRhdGEuaWQsIGRhdGEuZnJvbSwgZGF0YS50bywgZGF0YS5sZW5ndGgsIGRhdGEuZmFpbHVyZVJhdGUsIGRhdGEucmVwYWlyUmF0ZSk7XHJcbiAgICBlZGdlcy5wdXNoKHRlbXBFZGdlKTtcclxuICAgIGNvbnNvbGUubG9nKGVkZ2VzKTtcclxuICAgIGNsZWFyRWRnZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuXHJcbn1cclxuXHJcbnJlbmRlclRvcG9sb2d5KCk7IiwiaW1wb3J0IHsgRmFpbFJlcGFpclJhdGUgfSBmcm9tICcuL3JhdGVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFZGdlIGV4dGVuZHMgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgXHJcbiAgICAvKnZpc3VhbGl6YXRpb24qL1xyXG4gICAgcHJpdmF0ZSBsYWJlbDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBmcm9tOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHRvOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgIC8qYmFja2VuZCBwYXJhbWV0ZXJzKi9cclxuICAgIHByaXZhdGUgc3JjOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGRlc3Q6IHN0cmluZztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZyb206c3RyaW5nLCB0bzpzdHJpbmcsIGxlbmd0aDpudW1iZXIsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLmZyb20gPSBmcm9tO1xyXG4gICAgICAgIHRoaXMudG8gPSB0bztcclxuICAgICAgICB0aGlzLnNyYyA9IGZyb207XHJcbiAgICAgICAgdGhpcy5kZXN0ID0gdG87XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICAgICAgc3VwZXIuc2V0RmFpbHVyZVJhdGUoZmFpbHVyZVJhdGUpO1xyXG4gICAgICAgIHN1cGVyLnNldFJlcGFpclJhdGUocmVwYWlyUmF0ZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qIEdldHRlcnMgYW5kIHNldHRlcnMgKi9cclxuXHJcbiAgICBnZXRTcmMoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zcmM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3JjKHNyYzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSBzcmM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVzdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGVzdChkZXN0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRlc3QgPSBkZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMZW5ndGgobGVuZ3RoOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRGcm9tKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tKGZyb206IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VG8oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50bztcclxuICAgIH1cclxuXHJcbiAgICBzZXRUbyh0bzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRmFpbFJlcGFpclJhdGUgfSBmcm9tICcuL3JhdGVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBsYWJlbDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOnN0cmluZywgaWQ6c3RyaW5nLCBmYWlsdXJlUmF0ZTpudW1iZXIsIHJlcGFpclJhdGU6bnVtYmVyKSB7IFxyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTsgXHJcbiAgICAgfVxyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcbiAgICBcclxufSIsImV4cG9ydCBjbGFzcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGZhaWx1cmVSYXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlcGFpclJhdGU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gICAgcHVibGljIHNldEZhaWx1cmVSYXRlKHJhdGU6IG51bWJlcik6IHZvaWR7XHJcbiAgICAgICAgdGhpcy5mYWlsdXJlUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0UmVwYWlyUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlcGFpclJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEZhaWx1cmVSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFpbHVyZVJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0UmVwYWlyUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcGFpclJhdGU7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9ub2RlJztcclxuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4vZWRnZSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRvcG9sb2d5IHtcclxuICAgIHByaXZhdGUgbm9kZXM6IEFycmF5PE5vZGU+O1xyXG4gICAgcHJpdmF0ZSBsaW5rczogQXJyYXk8RWRnZT47XHJcblxyXG4gICAgLy9ESUpLU1RSQSBwYXJhbWV0ZXJzIC0+IHN0YXJ0ICYgZW5kIG5vZGVcclxuICAgIHByaXZhdGUgc3RhcnQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgZW5kOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5ldyBBcnJheTxOb2RlPigpO1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlQnlJZChpZDogc3RyaW5nKTogTm9kZSB7XHJcbiAgICAgICAgZm9yKGxldCBub2RlIG9mIHRoaXMubm9kZXMpe1xyXG4gICAgICAgICAgICBpZihub2RlLmdldElkKCkgPT09IGlkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEVkZ2VCeUlkKGlkOiBzdHJpbmcpOiBFZGdlIHtcclxuICAgICAgICBmb3IobGV0IGVkZ2Ugb2YgdGhpcy5saW5rcykge1xyXG4gICAgICAgICAgICBpZihlZGdlLmdldElkKCkgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWRnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXROb2RlcygpOiBOb2RlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVkZ2VzKCk6IEVkZ2VbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlua3NcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2RlKG5vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Tm9kZXMobm9kZXM6IE5vZGVbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlKGVkZ2U6IEVkZ2UpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxpbmtzLnB1c2goZWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RWRnZXMoZWRnZXM6IEVkZ2VbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBlZGdlcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRTdGFydE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFydDtcclxuICAgIH0gICAgXHJcblxyXG4gICAgc2V0U3RhcnROb2RlKHN0YXJ0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcbiAgICB9XHJcbiAgICBnZXRFbmROb2RlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5kO1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRFbmROb2RlKGVuZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XHJcbiAgICB9XHJcbn0iXX0=
