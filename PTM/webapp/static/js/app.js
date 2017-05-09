(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./models/node");
var edge_1 = require("./models/edge");
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
    var options = {};
    // initialize your network!
    var network = new vis.Network(container, data, options);
}
renderTopology();
},{"./models/edge":2,"./models/node":3}],2:[function(require,module,exports){
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
},{"./rates":4}],3:[function(require,module,exports){
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
},{"./rates":4}],4:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L21haW4udHMiLCJQVE0vY2xpZW50L21vZGVscy9lZGdlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvbm9kZS50cyIsIlBUTS9jbGllbnQvbW9kZWxzL3JhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxzQ0FBcUM7QUFDckMsc0NBQXFDO0FBR3JDO0lBQ0ksSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXZCLElBQUksS0FBSyxHQUFZLElBQUksS0FBSyxFQUFRLENBQUM7SUFDdkMsSUFBSSxLQUFLLEdBQVcsSUFBSSxLQUFLLEVBQVEsQ0FBQztJQUt0QyxJQUFJLFFBQVEsR0FBUyxJQUFJLFdBQUksRUFBRSxDQUFDO0lBQ2hDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixJQUFJLFNBQVMsR0FBUyxJQUFJLFdBQUksRUFBRSxDQUFDO0lBQ2pDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUU1QixJQUFJLFFBQVEsR0FBUyxJQUFJLFdBQUksRUFBRSxDQUFDO0lBQ2hDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVCLFFBQVEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxD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QUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FoQkEsQUFnQkMsSUFBQTtBQWhCWSx3Q0FBYyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9tb2RlbHMvbm9kZSc7XHJcbmltcG9ydCB7IEVkZ2UgfSBmcm9tICcuL21vZGVscy9lZGdlJztcclxuXHJcbmRlY2xhcmUgdmFyIHZpczogYW55O1xyXG5mdW5jdGlvbiByZW5kZXJUb3BvbG9neSgpe1xyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrJyk7XHJcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXIpO1xyXG4gICAgXHJcbiAgICBsZXQgbm9kZXMgOiBOb2RlW10gPSBuZXcgQXJyYXk8Tm9kZT4oKTtcclxuICAgIGxldCBlZGdlczogRWRnZVtdID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcblxyXG4gICAgXHJcblxyXG5cclxuICAgIGxldCB0ZXN0bm9kZTogTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0ZXN0bm9kZS5zZXRJZChcImJvcm5hXCIpO1xyXG4gICAgdGVzdG5vZGUuc2V0TGFiZWwoXCJwYXRha1wiKTtcclxuXHJcbiAgICBsZXQgdGVzdG5vZGUyOiBOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRlc3Rub2RlMi5zZXRJZChcInZlZHJhblwiKTtcclxuICAgIHRlc3Rub2RlMi5zZXRMYWJlbChcInBhdGthXCIpO1xyXG5cclxuICAgIGxldCB0ZXN0ZWRnZTogRWRnZSA9IG5ldyBFZGdlKCk7XHJcbiAgICB0ZXN0ZWRnZS5zZXRGcm9tKFwidmVkcmFuXCIpO1xyXG4gICAgdGVzdGVkZ2Uuc2V0VG8oXCJib3JuYVwiKTtcclxuICAgIHRlc3RlZGdlLnNldElkKFwidGFqbmF2ZXphXCIpO1xyXG4gICAgdGVzdGVkZ2Uuc2V0TGFiZWwoXCJpc3RpbnNrYSBsanViYXZcIik7XHJcblxyXG4gICAgbm9kZXMucHVzaCh0ZXN0bm9kZSk7XHJcbiAgICBub2Rlcy5wdXNoKHRlc3Rub2RlMik7XHJcbiAgICBlZGdlcy5wdXNoKHRlc3RlZGdlKTtcclxuXHJcbiAgICBsZXQgdmlzbm9kZXMgPSBuZXcgdmlzLkRhdGFTZXQobm9kZXMpO1xyXG4gICAgbGV0IHZpc2VkZ2VzID0gbmV3IHZpcy5EYXRhU2V0KGVkZ2VzKTtcclxuXHJcblxyXG5cclxuICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgIG5vZGVzOiB2aXNub2RlcyxcclxuICAgICAgICBlZGdlczogdmlzZWRnZXNcclxuICAgIH07XHJcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgdmFyIG5ldHdvcmsgPSBuZXcgdmlzLk5ldHdvcmsoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKTtcclxufVxyXG5cclxucmVuZGVyVG9wb2xvZ3koKTsiLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldExhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFiZWwobGFiZWw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRJZCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldElkKGlkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RnJvbSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZyb207XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbShmcm9tOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZyb20gPSBmcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRvKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG87XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG8odG86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudG8gPSB0bztcclxuICAgIH1cclxufSIsImltcG9ydCB7IEZhaWxSZXBhaXJSYXRlIH0gZnJvbSAnLi9yYXRlcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgbGFiZWw6IHN0cmluZztcclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgXHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIFxyXG59IiwiZXhwb3J0IGNsYXNzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgZmFpbHVyZVJhdGU6IG51bWJlcj02O1xyXG4gICAgcHJpdmF0ZSByZXBhaXJSYXRlOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIHNldEZhaWx1cmVSYXRlKHJhdGU6IG51bWJlcik6IHZvaWR7XHJcbiAgICAgICAgdGhpcy5mYWlsdXJlUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0UmVwYWlyUmF0ZShyYXRlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlcGFpclJhdGUgPSByYXRlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEZhaWx1cmVSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFpbHVyZVJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0UmVwYWlyUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcGFpclJhdGU7XHJcbiAgICB9XHJcbn0iXX0=
