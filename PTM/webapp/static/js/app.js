(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DrawController = (function () {
    function DrawController() {
    }
    ;
    DrawController.prototype.addNode = function (data, callback) {
        // filling in the popup DOM elements
        console.log("add node");
        document.getElementById('node-operation').innerHTML = "Add Node";
        this.editNode(data, callback);
    };
    DrawController.prototype.addEdge = function (data, callback) {
        document.getElementById('node-operation').innerHTML = "Add Node";
        this.editNode(data, callback);
    };
    DrawController.prototype.editNode = function (data, callback) {
        console.log("tu sam");
        document.getElementById('node-label').value = data.label;
        document.getElementById('node-saveButton').onclick = this.saveNodeData.bind(this, data, callback);
        //document.getElementById('node-cancelButton').onclick = this.clearNodePopUp(this);
        document.getElementById('node-popUp').style.display = 'block';
    };
    DrawController.prototype.clearNodePopUp = function () {
        document.getElementById('node-saveButton').onclick = null;
        document.getElementById('node-cancelButton').onclick = null;
        document.getElementById('node-popUp').style.display = 'none';
    };
    DrawController.prototype.cancelNodeEdit = function (callback) {
        this.clearNodePopUp();
        callback(null);
    };
    DrawController.prototype.saveNodeData = function (data, callback) {
        console.log("save");
        data.label = document.getElementById('node-label').value;
        this.clearNodePopUp();
        data.label = 'nesto';
        callback(data);
    };
    return DrawController;
}());
exports.DrawController = DrawController;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./models/node");
var edge_1 = require("./models/edge");
var draw_1 = require("./controllers/draw");
var nodes = new Array();
var edges = new Array();
function renderTopology() {
    var container = document.getElementById('network');
    console.log(container);
    var testnode = new node_1.Node();
    testnode.setId("borna");
    testnode.setLabel("patak");
    var testnode2 = new node_1.Node();
    testnode2.setId("vedran");
    testnode2.setLabel("patka");
    var testedge = new edge_1.Edge();
    testedge.setFrom("vedran");
    testedge.setTo("borna");
    testedge.setId("tajnaveza");
    testedge.setLabel("istinska ljubav");
    nodes.push(testnode);
    nodes.push(testnode2);
    edges.push(testedge);
    var visnodes = new vis.DataSet(nodes);
    var visedges = new vis.DataSet(edges);
    var data = {
        nodes: visnodes,
        edges: visedges
    };
    var draw = new draw_1.DrawController();
    var options = {
        layout: {
            randomSeed: 2
        },
        manipulation: {
            addNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Add Node";
                console.log("1");
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
    document.getElementById('node-cancelButton').onclick = clearNodePopUp.bind(this);
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
    clearNodePopUp();
    nodes.push(data);
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
    clearEdgePopUp();
    callback(data);
}
renderTopology();
},{"./controllers/draw":1,"./models/edge":3,"./models/node":4}],3:[function(require,module,exports){
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
    function Edge() {
        return _super !== null && _super.apply(this, arguments) || this;
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
    function Node() {
        return _super.call(this) || this;
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
        this.failureRate = 6;
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
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2RyYXcudHMiLCJQVE0vY2xpZW50L21haW4udHMiLCJQVE0vY2xpZW50L21vZGVscy9lZGdlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvbm9kZS50cyIsIlBUTS9jbGllbnQvbW9kZWxzL3JhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtJQUVJO0lBQ0EsQ0FBQztJQUFBLENBQUM7SUFFSyxnQ0FBTyxHQUFkLFVBQWUsSUFBUyxFQUFFLFFBQWE7UUFDbkMsb0NBQW9DO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFbEMsQ0FBQztJQUVELGdDQUFPLEdBQVAsVUFBUSxJQUFTLEVBQUUsUUFBYTtRQUM1QixRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztRQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsaUNBQVEsR0FBUixVQUFTLElBQVMsRUFBRSxRQUFhO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzdFLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMs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RSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUwsV0FBQztBQUFELENBeEJBLEFBd0JDLENBeEJ5QixzQkFBYyxHQXdCdkM7QUF4Qlksb0JBQUk7Ozs7QUNGakI7SUFBQTtRQUNZLGdCQUFXLEdBQVMsQ0FBQyxDQUFDO0lBZWxDLENBQUM7SUFaVSx1Q0FBYyxHQUFyQixVQUFzQixJQUFZO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFDTSxzQ0FBYSxHQUFwQixVQUFxQixJQUFZO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFDTSx1Q0FBYyxHQUFyQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFDTSxzQ0FBYSxHQUFwQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFDTCxxQkFBQztBQUFELENBaEJBLEFBZ0JDLElBQUE7QUFoQlksd0NBQWMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGNsYXNzIERyYXdDb250cm9sbGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGFkZE5vZGUoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJhZGQgbm9kZVwiKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcbiAgICAgICAgdGhpcy5lZGl0Tm9kZShkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYWRkRWRnZShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBOb2RlXCI7XHJcbiAgICAgICAgdGhpcy5lZGl0Tm9kZShkYXRhLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZWRpdE5vZGUoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0dSBzYW1cIik7XHJcbiAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IHRoaXMuc2F2ZU5vZGVEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgIC8vZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IHRoaXMuY2xlYXJOb2RlUG9wVXAodGhpcyk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuXHJcbiAgICBjbGVhck5vZGVQb3BVcCgpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbE5vZGVFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmNsZWFyTm9kZVBvcFVwKCk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2F2ZU5vZGVEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic2F2ZVwiKTtcclxuICAgICAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuY2xlYXJOb2RlUG9wVXAoKTtcclxuICAgICAgICBkYXRhLmxhYmVsID0gJ25lc3RvJztcclxuICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9tb2RlbHMvbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL21vZGVscy9lZGdlJztcclxuaW1wb3J0IHsgRHJhd0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2RyYXcnO1xyXG5cclxuZGVjbGFyZSB2YXIgdmlzOiBhbnk7XHJcblxyXG5sZXQgbm9kZXM6IE5vZGVbXSA9IG5ldyBBcnJheTxOb2RlPigpO1xyXG5sZXQgZWRnZXM6IEVkZ2VbXSA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG5mdW5jdGlvbiByZW5kZXJUb3BvbG9neSgpIHtcclxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV0d29yaycpO1xyXG4gICAgY29uc29sZS5sb2coY29udGFpbmVyKTtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIGxldCB0ZXN0bm9kZTogTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0ZXN0bm9kZS5zZXRJZChcImJvcm5hXCIpO1xyXG4gICAgdGVzdG5vZGUuc2V0TGFiZWwoXCJwYXRha1wiKTtcclxuXHJcbiAgICBsZXQgdGVzdG5vZGUyOiBOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRlc3Rub2RlMi5zZXRJZChcInZlZHJhblwiKTtcclxuICAgIHRlc3Rub2RlMi5zZXRMYWJlbChcInBhdGthXCIpO1xyXG5cclxuICAgIGxldCB0ZXN0ZWRnZTogRWRnZSA9IG5ldyBFZGdlKCk7XHJcbiAgICB0ZXN0ZWRnZS5zZXRGcm9tKFwidmVkcmFuXCIpO1xyXG4gICAgdGVzdGVkZ2Uuc2V0VG8oXCJib3JuYVwiKTtcclxuICAgIHRlc3RlZGdlLnNldElkKFwidGFqbmF2ZXphXCIpO1xyXG4gICAgdGVzdGVkZ2Uuc2V0TGFiZWwoXCJpc3RpbnNrYSBsanViYXZcIik7XHJcblxyXG4gICAgbm9kZXMucHVzaCh0ZXN0bm9kZSk7XHJcbiAgICBub2Rlcy5wdXNoKHRlc3Rub2RlMik7XHJcbiAgICBlZGdlcy5wdXNoKHRlc3RlZGdlKTtcclxuXHJcbiAgICBsZXQgdmlzbm9kZXMgPSBuZXcgdmlzLkRhdGFTZXQobm9kZXMpO1xyXG4gICAgbGV0IHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICBub2Rlczogdmlzbm9kZXMsXHJcbiAgICAgICAgZWRnZXM6IHZpc2VkZ2VzXHJcbiAgICB9O1xyXG4gICAgdmFyIGRyYXcgPSBuZXcgRHJhd0NvbnRyb2xsZXIoKTtcclxuXHJcbiAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgcmFuZG9tU2VlZDogMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFuaXB1bGF0aW9uOiB7XHJcbiAgICAgICAgICAgIGFkZE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJBZGQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIxXCIpO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0Tm9kZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkVkaXQgTm9kZVwiO1xyXG4gICAgICAgICAgICAgICAgZWRpdE5vZGUoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRFZGdlOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5mcm9tID09IGRhdGEudG8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byBjb25uZWN0IHRoZSBub2RlIHRvIGl0c2VsZj9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgIT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiQWRkIEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgIGVkaXRFZGdlV2l0aG91dERyYWcoZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0RWRnZToge1xyXG4gICAgICAgICAgICAgICAgZWRpdFdpdGhvdXREcmFnOiBmdW5jdGlvbiAoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IEVkZ2VcIjtcclxuICAgICAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB5b3VyIG5ldHdvcmshXHJcbiAgICB2YXIgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0Tm9kZShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZSA9IGRhdGEubGFiZWw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IHNhdmVOb2RlRGF0YS5iaW5kKHRoaXMsIGRhdGEsIGNhbGxiYWNrKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBjbGVhck5vZGVQb3BVcC5iaW5kKHRoaXMpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2xlYXJOb2RlUG9wVXAoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1zYXZlQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXBvcFVwJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsTm9kZUVkaXQoY2FsbGJhY2s6IGFueSkge1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKG51bGwpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlTm9kZURhdGEoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XHJcbiAgICBkYXRhLmxhYmVsID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlO1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuICAgICAgICBub2Rlcy5wdXNoKGRhdGEpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhub2Rlcyk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuXHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlRWRnZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsRWRnZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhckVkZ2VQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxFZGdlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVFZGdlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YS50byA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS50byA9IGRhdGEudG8uaWRcclxuICAgIGlmICh0eXBlb2YgZGF0YS5mcm9tID09PSAnb2JqZWN0JylcclxuICAgICAgICBkYXRhLmZyb20gPSBkYXRhLmZyb20uaWRcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2soZGF0YSk7XHJcblxyXG59XHJcblxyXG5yZW5kZXJUb3BvbG9neSgpOyIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRWRnZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIFxyXG4gICAgLyp2aXN1YWxpemF0aW9uKi9cclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgZnJvbTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSB0bzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgICAvKmJhY2tlbmQgcGFyYW1ldGVycyovXHJcbiAgICBwcml2YXRlIHNyYzogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBkZXN0OiBzdHJpbmc7XHJcbiAgICBcclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldFNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNyYztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTcmMoc3JjOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgIH1cclxuXHJcbiAgICBnZXREZXN0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXREZXN0KGRlc3Q6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExlbmd0aChsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZyb20oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb20oZnJvbTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUbygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvKHRvOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7IFxyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgfVxyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcbiAgICBcclxufSIsImV4cG9ydCBjbGFzcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGZhaWx1cmVSYXRlOiBudW1iZXI9NjtcclxuICAgIHByaXZhdGUgcmVwYWlyUmF0ZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBzZXRGYWlsdXJlUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lke1xyXG4gICAgICAgIHRoaXMuZmFpbHVyZVJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldFJlcGFpclJhdGUocmF0ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXBhaXJSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRGYWlsdXJlUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZhaWx1cmVSYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldFJlcGFpclJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZXBhaXJSYXRlO1xyXG4gICAgfVxyXG59Il19
