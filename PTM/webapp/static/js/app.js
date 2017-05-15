(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DrawController = (function () {
    function DrawController(data) {
        this.enabled = true;
        this.data = data;
    }
    ;
    DrawController.prototype.addEdge = function (data, callback) {
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
function renderTopology() {
    var container = document.getElementById('network');
    console.log(container);
    var nodes = new Array();
    var edges = new Array();
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
        manipulation: draw
    };
    // initialize your network!
    var network = new vis.Network(container, data, options);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2RyYXcudHMiLCJQVE0vY2xpZW50L21haW4udHMiLCJQVE0vY2xpZW50L21vZGVscy9lZGdlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvbm9kZS50cyIsIlBUTS9jbGllbnQvbW9kZWxzL3JhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtJQUtJLHdCQUFZLElBQVM7UUFGYixZQUFPLEdBQVksSUFBSSxDQUFDO1FBRzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFBQSxDQUFDO0lBRUYsZ0NBQU8sR0FBUCxVQUFRLElBQVMsRUFBRSxRQUFZO0lBRS9CLENBQUM7SUFHTCxxQkFBQztBQUFELENBZEEsQUFjQyxJQUFBO0FBZFksd0NBQWM7Ozs7QUNBM0Isc0NBQXFDO0FBQ3JDLHNDQUFxQztBQUNyQywyQ0FBb0Q7QUFHcEQ7SUFDSSxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFdkIsSUFBSSxLQUFLLEdBQVksSUFBSSxLQUFLLEVBQVEsQ0FBQztJQUN2QyxJQUFJLEtBQUssR0FBVyxJQUFJLEtBQUssRUFBUSxDQUFDO0lBS3RDLElBQUksUUFBUSxHQUFTLElBQUksV0FBSSxFQUFFLENBQUM7SUFDaEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTNCLElBQUksU0FBUyxHQUFTLElBQUksV0FBSSxFQUFFLENBQUM7SUFDakMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQixTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lB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eUV2QztBQXpFWSxvQkFBSTs7Ozs7Ozs7Ozs7Ozs7QUNGakIsaUNBQXlDO0FBRXpDO0lBQTBCLHdCQUFjO0lBSXBDO2VBQ0ksaUJBQU87SUFDVixDQUFDO0lBRUYsdUJBQVEsR0FBUjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCx1QkFBUSxHQUFSLFVBQVMsS0FBYTtRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxvQkFBSyxHQUFMLFVBQU0sRUFBVTtRQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFTCxXQUFDO0FBQUQsQ0F4QkEsQUF3QkMsQ0F4QnlCLHNCQUFjLEdBd0J2QztBQXhCWSxvQkFBSTs7OztBQ0ZqQjtJQUFBO1FBQ1ksZ0JBQVcsR0FBUyxDQUFDLENBQUM7SUFlbEMsQ0FBQztJQVpVLHVDQUFjLEdBQXJCLFVBQXNCLElBQVk7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUNNLHNDQUFhLEdBQXBCLFVBQXFCLElBQVk7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUNNLHVDQUFjLEdBQXJCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNNLHNDQUFhLEdBQXBCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsSUFBQTtBQWhCWSx3Q0FBYyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgY2xhc3MgRHJhd0NvbnRyb2xsZXIge1xyXG5cclxuICAgIHByaXZhdGUgZGF0YTogYW55O1xyXG4gICAgcHJpdmF0ZSBlbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcclxuICAgXHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBhbnkpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfTtcclxuXHJcbiAgICBhZGRFZGdlKGRhdGE6IGFueSwgY2FsbGJhY2s6YW55KSB7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9tb2RlbHMvbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL21vZGVscy9lZGdlJztcclxuaW1wb3J0IHsgRHJhd0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2RyYXcnO1xyXG5cclxuZGVjbGFyZSB2YXIgdmlzOiBhbnk7XHJcbmZ1bmN0aW9uIHJlbmRlclRvcG9sb2d5KCl7XHJcbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldHdvcmsnKTtcclxuICAgIGNvbnNvbGUubG9nKGNvbnRhaW5lcik7XHJcbiAgICBcclxuICAgIGxldCBub2RlcyA6IE5vZGVbXSA9IG5ldyBBcnJheTxOb2RlPigpO1xyXG4gICAgbGV0IGVkZ2VzOiBFZGdlW10gPSBuZXcgQXJyYXk8RWRnZT4oKTtcclxuXHJcbiAgICBcclxuXHJcblxyXG4gICAgbGV0IHRlc3Rub2RlOiBOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRlc3Rub2RlLnNldElkKFwiYm9ybmFcIik7XHJcbiAgICB0ZXN0bm9kZS5zZXRMYWJlbChcInBhdGFrXCIpO1xyXG5cclxuICAgIGxldCB0ZXN0bm9kZTI6IE5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGVzdG5vZGUyLnNldElkKFwidmVkcmFuXCIpO1xyXG4gICAgdGVzdG5vZGUyLnNldExhYmVsKFwicGF0a2FcIik7XHJcblxyXG4gICAgbGV0IHRlc3RlZGdlOiBFZGdlID0gbmV3IEVkZ2UoKTtcclxuICAgIHRlc3RlZGdlLnNldEZyb20oXCJ2ZWRyYW5cIik7XHJcbiAgICB0ZXN0ZWRnZS5zZXRUbyhcImJvcm5hXCIpO1xyXG4gICAgdGVzdGVkZ2Uuc2V0SWQoXCJ0YWpuYXZlemFcIik7XHJcbiAgICB0ZXN0ZWRnZS5zZXRMYWJlbChcImlzdGluc2thIGxqdWJhdlwiKTtcclxuXHJcbiAgICBub2Rlcy5wdXNoKHRlc3Rub2RlKTtcclxuICAgIG5vZGVzLnB1c2godGVzdG5vZGUyKTtcclxuICAgIGVkZ2VzLnB1c2godGVzdGVkZ2UpO1xyXG5cclxuICAgIGxldCB2aXNub2RlcyA9IG5ldyB2aXMuRGF0YVNldChub2Rlcyk7XHJcbiAgICBsZXQgdmlzZWRnZXMgPSBuZXcgdmlzLkRhdGFTZXQoZWRnZXMpO1xyXG5cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIG5vZGVzOiB2aXNub2RlcyxcclxuICAgICAgICBlZGdlczogdmlzZWRnZXNcclxuICAgIH07XHJcbiAgICB2YXIgZHJhdyA9IG5ldyBEcmF3Q29udHJvbGxlcigpO1xyXG5cclxuICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIG1hbmlwdWxhdGlvbjogIGRyYXdcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgdmFyIG5ldHdvcmsgPSBuZXcgdmlzLk5ldHdvcmsoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcclxufVxyXG5cclxucmVuZGVyVG9wb2xvZ3koKTsiLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBcclxuICAgIC8qdmlzdWFsaXphdGlvbiovXHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgLypiYWNrZW5kIHBhcmFtZXRlcnMqL1xyXG4gICAgcHJpdmF0ZSBzcmM6IHN0cmluZztcclxuICAgIHByaXZhdGUgZGVzdDogc3RyaW5nO1xyXG4gICAgXHJcblxyXG5cclxuICAgIC8qIEdldHRlcnMgYW5kIHNldHRlcnMgKi9cclxuXHJcbiAgICBnZXRTcmMoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zcmM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3JjKHNyYzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSBzcmM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVzdCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGVzdChkZXN0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRlc3QgPSBkZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMZW5ndGgobGVuZ3RoOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRGcm9tKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tKGZyb206IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VG8oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50bztcclxuICAgIH1cclxuXHJcbiAgICBzZXRUbyh0bzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRmFpbFJlcGFpclJhdGUgfSBmcm9tICcuL3JhdGVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBsYWJlbDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkgeyBcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgIH1cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJleHBvcnQgY2xhc3MgRmFpbFJlcGFpclJhdGUge1xyXG4gICAgcHJpdmF0ZSBmYWlsdXJlUmF0ZTogbnVtYmVyPTY7XHJcbiAgICBwcml2YXRlIHJlcGFpclJhdGU6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgc2V0RmFpbHVyZVJhdGUocmF0ZTogbnVtYmVyKTogdm9pZHtcclxuICAgICAgICB0aGlzLmZhaWx1cmVSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRSZXBhaXJSYXRlKHJhdGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVwYWlyUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0RmFpbHVyZVJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsdXJlUmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRSZXBhaXJSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwYWlyUmF0ZTtcclxuICAgIH1cclxufSJdfQ==
