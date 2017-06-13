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
    AjaxController.prototype.abrahamCalculation = function (username, password, start, end, t, nodes, links) {
        if (start == 'Network' || end == 'Network') {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, t: t });
            console.log(jsonTopology);
        }
        else {
            var jsonTopology = JSON.stringify({ username: username, password: password, nodes: nodes, links: links, start: start, end: end, t: t });
            console.log(jsonTopology);
        }
        $.ajax({
            url: 'http://localhost:8000/nodepair',
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
function renderTopology() {
    var container = document.getElementById('network');
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
function abrahamModal() {
    setSelectionOptions();
    $(document).on('click', '.calculate-abraham', function () {
        var username = $('#username-abraham').val();
        var password = $('#password-abraham').val();
        var startNode = $('#start-node-abraham').val();
        var endNode = $('#end-node-abraham').val();
        var time = parseInt($('#time-abraham').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        calcDijkstr.abrahamCalculation(username, password, startNode, endNode, time, nodes, edges);
        $('#abrahamModal').modal('hide');
    });
}
function dijkstraModal() {
    setSelectionOptions();
    $(document).on('click', '.calculate', function () {
        var username = $('#username').val();
        var password = $('#password').val();
        var startNode = $('#start-node').val();
        var endNode = $('#end-node').val();
        var time = parseInt($('#time').val());
        var calcDijkstr = new ajax_controller_1.AjaxController();
        calcDijkstr.dijkstraCalculation(username, password, startNode, endNode, time, nodes, edges);
        $('#exampleModal').modal('hide');
    });
}
function exportTopology() {
    $(".export").click(function () {
        var jsonTopology = JSON.stringify({ nodes: nodes, edges: edges }, null, 2);
        var blob = new Blob([jsonTopology], { type: "application/json;charset=utf-8" });
        FileSaver.saveAs(blob, "topology" + ".json");
        $('#export-topology').modal('hide');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQVE0vY2xpZW50L2NvbnRyb2xsZXJzL2FqYXguY29udHJvbGxlci50cyIsIlBUTS9jbGllbnQvbWFpbi50cyIsIlBUTS9jbGllbnQvbW9kZWxzL2VkZ2UudHMiLCJQVE0vY2xpZW50L21vZGVscy9ub2RlLnRzIiwiUFRNL2NsaWVudC9tb2RlbHMvcmF0ZXMudHMiLCJQVE0vY2xpZW50L21vZGVscy90b3BvbG9neS50cyIsIm5vZGVfbW9kdWxlcy9maWxlLXNhdmVyL0ZpbGVTYXZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7SUFDSTtJQUNBLENBQUM7SUFFTSw0Q0FBbUIsR0FBMUIsVUFBMkIsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsQ0FBUyxFQUFFLEtBQVUsRUFBRSxLQUFVO1FBQ3hILEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ0gsR0FBRyxFQUFFLGdDQUFnQztZQUNyQyxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFLFVBQVUsSUFBUztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQ0QsS0FBSyxFQUFFLFVBQVUsSUFBUztnQkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixDQUFDO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDJDQUFrQixHQUF6QixVQUEwQixRQUFnQixFQUFFLFFBQWdCLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxDQUFTLEVBQUUsS0FBVSxFQUFFLEtBQVU7UUFDdkgsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLFNBQVMsSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxHQUFBLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFOUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsVUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLENBQUMsR0FBQSxFQUFFLENBQUMsQ0FBQztZQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ0gsR0FBRyxFQUFFLGdDQUFnQztZQUNyQyxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFLFVBQVUsSUFBUztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBQ0QsS0FBSyxFQUFFLFVBQVUsSUFBUztnQkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixDQUFDO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLCtCQUFNLEdBQWIsVUFBYyxRQUFnQixFQUFFLFFBQWdCO1FBQzVDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLFVBQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNILEdBQUcsRUFBRSw4QkFBOEI7WUFDbkMsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxVQUFVLElBQVM7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxJQUFJLENBQUMsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFekMsVUFBVSxDQUFDO3dCQUNQLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3BDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDVCxDQUFDO1lBRUwsQ0FBQztZQUNELEtBQUssRUFBRSxVQUFVLElBQVM7Z0JBQ3RCLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZDLENBQUM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQTFFQSxBQTBFQyxJQUFBO0FBMUVZLHdDQUFjOzs7O0FDRjNCLHNDQUFxQztBQUNyQyxzQ0FBcUM7QUFDckMsaUVBQStEO0FBQy9ELDhDQUE2QztBQUM3QyxzQ0FBd0M7QUFPeEMsSUFBSSxLQUFLLEdBQVcsSUFBSSxLQUFLLEVBQVEsQ0FBQztBQUN0QyxJQUFJLEtBQUssR0FBVyxJQUFJLEtBQUssRUFBUSxDQUFDO0FBQ3RDLElBQUksUUFBUSxHQUFhLElBQUksbUJBQVEsRUFBRSxDQUFDO0FBQ3hDLElBQUksY0FBYyxHQUFZLEtBQUssQ0FBQztBQUNwQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGNBQWMsR0FBVyxFQUFFLENBQUM7QUFDaEMsSUFBSSxjQUFjLEdBQVcsRUFBRSxDQUFDO0FBR2hDO0lBRUksSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXRDLElBQUksSUFBSSxHQUFHO1FBQ1AsS0FBSyxFQUFFLFFBQVE7UUFDZixLQUFLLEVBQUUsUUFBUTtLQUNsQixDQUFDO0lBR0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXpCLElBQUksT0FBTyxHQUFHO1FBQ1YsS0FBSyxFQUFFO1lBQ0gsS0FBSyxFQUFFLEtBQUs7WUFDWixJQUFJLEVBQUUsRUFBRTtZQUNSLEtBQUssRUFBRSxFQUVOO1lBQ0QsT0FBTyxFQUFFLEtBQUs7U0FDakI7UUFDRCxLQUFLLEVBQUU7WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxDQUFDO1lBQ1IsTUFBTSxFQUFFLEVBQUU7U0FDYjtRQUNELE1BQU0sRUFBRTtZQUNKLFVBQVUsRUFBRSxDQUFDO1NBQ2hCO1FBQ0QsWUFBWSxFQUFFO1lBQ1YsZUFBZSxFQUFFLElBQUk7WUFFckIsT0FBTyxFQUFFLFVBQVUsSUFBUyxFQUFFLFFBQWE7Z0JBQ3ZDLG9DQUFvQztnQkFDcEMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7Z0JBRWpFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELFFBQVEsRUFBRSxVQUFVLElBQVMsRUFBRSxRQUFhO2dCQUN4QyxvQ0FBb0M7Z0JBQ3BDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO2dCQUNsRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdCLENBQUM7WUFDRCxPQUFPLEVBQUUsVUFBVSxJQUFTLEVBQUUsUUFBYTtnQkFDdkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7b0JBQzlELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDZixNQUFNLENBQUM7b0JBQ1gsQ0FBQztnQkFDTCxDQUFDO2dCQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO2dCQUNqRSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUNELFFBQVEsRUFBRTtnQkFDTixlQUFlLEVBQUUsVUFBVSxJQUFTLEVBQUUsUUFBYTtvQkFDL0MsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7b0JBQ2xFLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDeEMsQ0FBQzthQUNKO1NBQ0o7S0FDSixDQUFDO0lBRUYsMkJBQTJCO0lBQzNCLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFM0IsQ0FBQztBQUVELGtCQUFrQixJQUFTLEVBQUUsUUFBYTtJQUNuQixRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzdFLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzdGLFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0YsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNsRSxDQUFDO0FBRUQsdUJBQXVCLElBQVM7SUFDNUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxNQUFXO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsSUFBSSxJQUFJLEdBQVMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLEdBQUcsZUFBZSxHQUFHLHlCQUF5QixHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTTtrQkFDbEgsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLE1BQU07a0JBQ2pFLCtCQUErQixHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDMUUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksSUFBSSxHQUFTLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pELFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxHQUFHLGVBQWUsR0FBRyx5QkFBeUIsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU07a0JBQ2xILHlCQUF5QixHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTTtrQkFDakQsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLE1BQU07a0JBQ2pFLCtCQUErQixHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDMUUsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RCxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDNUQsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdEO0lBQ0ksUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDMUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDNUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNqRSxDQUFDO0FBRUQsd0JBQXdCLFFBQWE7SUFDakMsY0FBYyxFQUFFLENBQUM7SUFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFFRCxzQkFBc0IsSUFBUyxFQUFFLFFBQWE7SUFDMUMsSUFBSSxDQUFDLEtBQUssR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUUsQ0FBQyxLQUFLLENBQUM7SUFDN0UsSUFBSSxDQUFDLEVBQUUsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUUsQ0FBQyxLQUFLLENBQUM7SUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQW9CLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBb0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9GLGNBQWMsRUFBRSxDQUFDO0lBRWpCLElBQUksUUFBUSxHQUFTLElBQUksV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0RixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBR25CLENBQUM7QUFFRCw2QkFBNkIsSUFBUyxFQUFFLFFBQWE7SUFDakQsb0NBQW9DO0lBQ2pCLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDN0UsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0YsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzRixRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ2xFLENBQUM7QUFFRDtJQUNJLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFELFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzVELFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDakUsQ0FBQztBQUVELHdCQUF3QixRQUFhO0lBQ2pDLGNBQWMsRUFBRSxDQUFDO0lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQixDQUFDO0FBRUQsc0JBQXNCLElBQVMsRUFBRSxRQUFhO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQTtJQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUE7SUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUUsQ0FBQyxLQUFLLENBQUM7SUFDN0UsSUFBSSxDQUFDLEVBQUUsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUUsQ0FBQyxLQUFLLENBQUM7SUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQW9CLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBb0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9GLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFvQixRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZGLElBQUksUUFBUSxHQUFTLElBQUksV0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2SCxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsY0FBYyxFQUFFLENBQUM7SUFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRW5CLENBQUM7QUFFRDtJQUNJLG1CQUFtQixFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7UUFDMUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDL0MsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDM0MsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksV0FBVyxHQUFHLElBQUksZ0NBQWMsRUFBRSxDQUFDO1FBQ3ZDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVEO0lBQ0ksbUJBQW1CLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7UUFDbEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ25DLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0QyxJQUFJLFdBQVcsR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztRQUN2QyxXQUFXLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDtJQUNJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDZixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxnQ0FBZ0MsRUFBRSxDQUFDLENBQUM7UUFDaEYsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDtJQUNJLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUU7UUFDbEQsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlELENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwQyxDQUFDLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQztZQUM3RixDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBQ0QsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDbkYsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDO0FBRUQ7SUFDSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQzlCLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWCxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDZixjQUFjLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxJQUFJLElBQUksQ0FBQztBQUVULFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBRXBGLDBCQUEwQixHQUFRO0lBQzlCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsa0JBQWtCO0lBRWhELDZEQUE2RDtJQUM3RCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUU5QiwyQ0FBMkM7UUFDM0MsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLFVBQVUsT0FBTztZQUM5QixNQUFNLENBQUMsVUFBVSxDQUFNO2dCQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUE7UUFDTCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsQ0FBQztBQUVMLENBQUM7QUFFRCw2QkFBNkIsSUFBUztJQUNsQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1gsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFhLFVBQVUsRUFBVixLQUFBLElBQUksQ0FBQyxLQUFLLEVBQVYsY0FBVSxFQUFWLElBQVU7UUFBdEIsSUFBSSxJQUFJLFNBQUE7UUFDVCxJQUFJLE9BQU8sR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0UsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QjtJQUNELEdBQUcsQ0FBQyxDQUFhLFVBQVUsRUFBVixLQUFBLElBQUksQ0FBQyxLQUFLLEVBQVYsY0FBVSxFQUFWLElBQVU7UUFBdEIsSUFBSSxJQUFJLFNBQUE7UUFDVCxJQUFJLE9BQU8sR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEgsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRUQsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDckIsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDZixjQUFjLEVBQUUsQ0FBQztJQUNqQixDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVwRixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkMsRUFBRSxDQUFDLENBQUMsY0FBYyxJQUFJLEVBQUUsSUFBSSxjQUFjLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO1lBQ3BCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzFDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzFDLGNBQWMsR0FBRyxRQUFRLENBQUM7WUFDMUIsY0FBYyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLFFBQVEsR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztZQUNwQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV4QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUNILGNBQWMsRUFBRSxDQUFDO0FBQ2pCLGFBQWEsRUFBRSxDQUFDO0FBQ2hCLFlBQVksRUFBRSxDQUFDO0FBQ2YsY0FBYyxFQUFFLENBQUM7QUFDakIsYUFBYSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDM1RoQixpQ0FBeUM7QUFFekM7SUFBMEIsd0JBQWM7SUFhcEMsY0FBWSxLQUFZLEVBQUUsRUFBUyxFQUFFLElBQVcsRUFBRSxFQUFTLEVBQUUsTUFBYSxFQUFFLFdBQWtCLEVBQUUsVUFBaUI7UUFBakgsWUFDSSxpQkFBTyxTQVVWO1FBVEcsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsS0FBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixLQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLEtBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsaUJBQU0sY0FBYyxhQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xDLGlCQUFNLGFBQWEsYUFBQyxVQUFVLENBQUMsQ0FBQzs7SUFDcEMsQ0FBQztJQUdELHlCQUF5QjtJQUV6QixxQkFBTSxHQUFOO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUVELHFCQUFNLEdBQU4sVUFBTyxHQUFXO1FBQ2QsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELHNCQUFPLEdBQVA7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsc0JBQU8sR0FBUCxVQUFRLElBQVk7UUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELHdCQUFTLEdBQVQ7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsd0JBQVMsR0FBVCxVQUFVLE1BQWM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUdELHVCQUFRLEdBQVI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsdUJBQVEsR0FBUixVQUFTLEtBQWE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELG9CQUFLLEdBQUw7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsb0JBQUssR0FBTCxVQUFNLEVBQVU7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsc0JBQU8sR0FBUDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBTyxHQUFQLFVBQVEsSUFBWTtRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsb0JBQUssR0FBTDtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxvQkFBSyxHQUFMLFVBQU0sRUFBVTtRQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FyRkEsQUFxRkMsQ0FyRnlCLHNCQUFjLEdBcUZ2QztBQXJGWSxvQkFBSTs7Ozs7Ozs7Ozs7Ozs7QUNGakIsaUNBQXlDO0FBRXpDO0lBQTBCLHdCQUFjO0lBSXBDLGNBQVksS0FBWSxFQUFFLEVBQVMsRUFBRSxXQUFrQixFQUFFLFVBQWlCO1FBQTFFLFlBQ0ksaUJBQU8sU0FLVDtRQUpFLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLEtBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsaUJBQU0sY0FBYyxhQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xDLGlCQUFNLGFBQWEsYUFBQyxVQUFVLENBQUMsQ0FBQzs7SUFDbkMsQ0FBQztJQUVGLHVCQUFRLEdBQVI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsdUJBQVEsR0FBUixVQUFTLEtBQWE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELG9CQUFLLEdBQUw7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsb0JBQUssR0FBTCxVQUFNLEVBQVU7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUwsV0FBQztBQUFELENBNUJBLEFBNEJDLENBNUJ5QixzQkFBYyxHQTRCdkM7QUE1Qlksb0JBQUk7Ozs7QUNGakI7SUFJSTtJQUFlLENBQUM7SUFFVCx1Q0FBYyxHQUFyQixVQUFzQixJQUFZO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFDTSxzQ0FBYSxHQUFwQixVQUFxQixJQUFZO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFDTSx1Q0FBYyxHQUFyQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFDTSxzQ0FBYSxHQUFwQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFDTCxxQkFBQztBQUFELENBbEJBLEFBa0JDLElBQUE7QUFsQlksd0NBQWM7Ozs7QUNJM0I7SUFRSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQVEsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFRLENBQUM7SUFDbkMsQ0FBQztJQUVELDhCQUFXLEdBQVgsVUFBWSxFQUFVO1FBQ2xCLEdBQUcsQ0FBQSxDQUFhLFVBQVUsRUFBVixLQUFBLElBQUksQ0FBQyxLQUFLLEVBQVYsY0FBVSxFQUFWLElBQVU7WUFBdEIsSUFBSSxJQUFJLFNBQUE7WUFDUixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUEsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoQixDQUFDO1NBQ0o7SUFDTCxDQUFDO0lBRUQsOEJBQVcsR0FBWCxVQUFZLEVBQVU7UUFDbEIsR0FBRyxDQUFBLENBQWEsVUFBVSxFQUFWLEtBQUEsSUFBSSxDQUFDLEtBQUssRUFBVixjQUFVLEVBQVYsSUFBVTtZQUF0QixJQUFJLElBQUksU0FBQTtZQUNSLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7U0FDSjtJQUNMLENBQUM7SUFFRCwyQkFBUSxHQUFSO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELDJCQUFRLEdBQVI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNyQixDQUFDO0lBRUQsMEJBQU8sR0FBUCxVQUFRLElBQVU7UUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsMkJBQVEsR0FBUixVQUFTLEtBQWE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELDBCQUFPLEdBQVAsVUFBUSxJQUFVO1FBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELDJCQUFRLEdBQVIsVUFBUyxLQUFhO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCwrQkFBWSxHQUFaO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELCtCQUFZLEdBQVosVUFBYSxLQUFhO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCw2QkFBVSxHQUFWO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUVELDZCQUFVLEdBQVYsVUFBVyxHQUFXO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0FuRUEsQUFtRUMsSUFBQTtBQW5FWSw0QkFBUTs7QUNKckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImRlY2xhcmUgdmFyICQ6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBBamF4Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlqa3N0cmFDYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCBzdGFydCwgZW5kLCB0IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvZGlqa3N0cmEnLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcyxcclxuICAgICAgICAgICAgZGF0YToganNvblRvcG9sb2d5LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgdDogbnVtYmVyLCBub2RlczogYW55LCBsaW5rczogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHN0YXJ0ID09ICdOZXR3b3JrJyB8fCBlbmQgPT0gJ05ldHdvcmsnKSB7XHJcbiAgICAgICAgICAgIHZhciBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZXMsIGxpbmtzLCB0IH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhqc29uVG9wb2xvZ3kpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIganNvblRvcG9sb2d5ID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQsIG5vZGVzLCBsaW5rcywgc3RhcnQsIGVuZCwgdCB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coanNvblRvcG9sb2d5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL25vZGVwYWlyJyxcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICAgICAgICAgIGRhdGE6IGpzb25Ub3BvbG9neSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaWdudXAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxldCBqc29uU2lnbnVwID0gSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSwgcGFzc3dvcmQgfSk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NpZ251cCcsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgICAgICAgICBkYXRhOiBqc29uU2lnbnVwLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLnVzZXIgPT0gXCJ3cm9uZ19wYXNzd29yZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1lcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGRhdGEudXNlciA9PSBcInZhbGlkXCIgfHwgZGF0YS51c2VyID09IFwiY3JlYXRlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1zdWNjZXNzJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGRhdGE6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmZvcm0tdmFsaWRhdGlvbi1lcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL21vZGVscy9ub2RlJztcclxuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4vbW9kZWxzL2VkZ2UnO1xyXG5pbXBvcnQgeyBBamF4Q29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvYWpheC5jb250cm9sbGVyJztcclxuaW1wb3J0IHsgVG9wb2xvZ3kgfSBmcm9tICcuL21vZGVscy90b3BvbG9neSc7XHJcbmltcG9ydCAqIGFzIEZpbGVTYXZlciBmcm9tICdmaWxlLXNhdmVyJztcclxuXHJcbmRlY2xhcmUgdmFyIEZpbGVSZWFkZXI6IGFueTtcclxuZGVjbGFyZSB2YXIgdmlzOiBhbnk7XHJcbmRlY2xhcmUgdmFyICQ6IGFueTtcclxuZGVjbGFyZSB2YXIgRHJvcHpvbmU6IGFueTtcclxuXHJcbmxldCBub2RlczogTm9kZVtdID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbmxldCBlZGdlczogRWRnZVtdID0gbmV3IEFycmF5PEVkZ2U+KCk7XHJcbmxldCB0b3BvbG9neTogVG9wb2xvZ3kgPSBuZXcgVG9wb2xvZ3koKTtcclxubGV0IGlzTm9kZVNlbGVjdGVkOiBib29sZWFuID0gZmFsc2U7XHJcbmxldCBuZXR3b3JrOiBhbnk7XHJcbmxldCBnbG9iYWxVc2VybmFtZTogc3RyaW5nID0gJyc7XHJcbmxldCBnbG9iYWxQYXNzd29yZDogc3RyaW5nID0gJyc7XHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVyVG9wb2xvZ3koKSB7XHJcblxyXG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXR3b3JrJyk7XHJcblxyXG4gICAgbGV0IHZpc25vZGVzID0gbmV3IHZpcy5EYXRhU2V0KG5vZGVzKTtcclxuICAgIGxldCB2aXNlZGdlcyA9IG5ldyB2aXMuRGF0YVNldChlZGdlcyk7XHJcblxyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgbm9kZXM6IHZpc25vZGVzLFxyXG4gICAgICAgIGVkZ2VzOiB2aXNlZGdlc1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdG9wb2xvZ3kuc2V0Tm9kZXMobm9kZXMpO1xyXG4gICAgdG9wb2xvZ3kuc2V0RWRnZXMoZWRnZXMpO1xyXG5cclxuICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIG5vZGVzOiB7XHJcbiAgICAgICAgICAgIHNoYXBlOiAnZG90JyxcclxuICAgICAgICAgICAgc2l6ZTogMzAsXHJcbiAgICAgICAgICAgIGNvbG9yOiB7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwaHlzaWNzOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWRnZXM6IHtcclxuICAgICAgICAgICAgcGh5c2ljczogZmFsc2UsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyLFxyXG4gICAgICAgICAgICBsZW5ndGg6IDEwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgcmFuZG9tU2VlZDogMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFuaXB1bGF0aW9uOiB7XHJcbiAgICAgICAgICAgIGluaXRpYWxseUFjdGl2ZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIGFkZE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJBZGQgTm9kZVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdE5vZGU6IGZ1bmN0aW9uIChkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgaW4gdGhlIHBvcHVwIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtb3BlcmF0aW9uJykuaW5uZXJIVE1MID0gXCJFZGl0IE5vZGVcIjtcclxuICAgICAgICAgICAgICAgIGVkaXROb2RlKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkRWRnZTogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZnJvbSA9PSBkYXRhLnRvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjb25maXJtKFwiRG8geW91IHdhbnQgdG8gY29ubmVjdCB0aGUgbm9kZSB0byBpdHNlbGY/XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyICE9IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1vcGVyYXRpb24nKS5pbm5lckhUTUwgPSBcIkFkZCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGEsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdEVkZ2U6IHtcclxuICAgICAgICAgICAgICAgIGVkaXRXaXRob3V0RHJhZzogZnVuY3Rpb24gKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLW9wZXJhdGlvbicpLmlubmVySFRNTCA9IFwiRWRpdCBFZGdlXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRpdEVkZ2VXaXRob3V0RHJhZyhkYXRhLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgeW91ciBuZXR3b3JrIVxyXG4gICAgbmV0d29yayA9IG5ldyB2aXMuTmV0d29yayhjb250YWluZXIsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgcmVnaXN0ZXJFdmVudChuZXR3b3JrKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVkaXROb2RlKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLWxhYmVsJykpLnZhbHVlID0gZGF0YS5sYWJlbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gc2F2ZU5vZGVEYXRhLmJpbmQodGhpcywgZGF0YSwgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IGNhbmNlbE5vZGVFZGl0LmJpbmQodGhpcywgY2FsbGJhY2spO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJFdmVudChkYXRhOiBhbnkpIHtcclxuICAgIGRhdGEub24oXCJzZWxlY3RcIiwgZnVuY3Rpb24gKHBhcmFtczogYW55KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocGFyYW1zKTtcclxuICAgICAgICBpZiAocGFyYW1zLm5vZGVzLmxlbmd0aCA9PSAwICYmIHBhcmFtcy5lZGdlcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZWRnZTogRWRnZSA9IHRvcG9sb2d5LmdldEVkZ2VCeUlkKHBhcmFtcy5lZGdlc1snMCddKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWNhdGNoZXInKS5pbm5lckhUTUwgPSAnPGgyPkVkZ2U8L2gyPicgKyAnPHA+PHNwYW4+TGFiZWw6IDwvc3Bhbj4nICsgcGFyYW1zLmVkZ2VzICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5GYWlsdXJlIHJhdGU6PC9zcGFuPiAnICsgZWRnZS5nZXRGYWlsdXJlUmF0ZSgpICsgJzwvcD4nXHJcbiAgICAgICAgICAgICAgICArICc8cD48c3Bhbj5SZXBhaXIgcmF0ZTogPC9zcGFuPicgKyBlZGdlLmdldFJlcGFpclJhdGUoKSArICc8L3A+JztcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5ub2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlOiBOb2RlID0gdG9wb2xvZ3kuZ2V0Tm9kZUJ5SWQocGFyYW1zLm5vZGVzWycwJ10pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZlbnQtY2F0Y2hlcicpLmlubmVySFRNTCA9ICc8aDI+Tm9kZTwvaDI+JyArICc8cD48c3Bhbj5MYWJlbDogPC9zcGFuPicgKyBwYXJhbXMubm9kZXMgKyAnPC9wPidcclxuICAgICAgICAgICAgICAgICsgJzxwPjxzcGFuPkVkZ2VzOiA8L3NwYW4+JyArIHBhcmFtcy5lZGdlcyArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+RmFpbHVyZSByYXRlOiA8L3NwYW4+JyArIG5vZGUuZ2V0RmFpbHVyZVJhdGUoKSArICc8L3A+J1xyXG4gICAgICAgICAgICAgICAgKyAnPHA+PHNwYW4+UmVwYWlyIHJhdGU6IDwvc3Bhbj4nICsgbm9kZS5nZXRSZXBhaXJSYXRlKCkgKyAnPC9wPic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubm9kZXMubGVuZ3RoID09IDAgJiYgcGFyYW1zLmVkZ2VzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1jYXRjaGVyJykuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsZWFyTm9kZVBvcFVwKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtY2FuY2VsQnV0dG9uJykub25jbGljayA9IG51bGw7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbE5vZGVFZGl0KGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGNsZWFyTm9kZVBvcFVwKCk7XHJcbiAgICBjYWxsYmFjayhudWxsKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZU5vZGVEYXRhKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgZGF0YS5sYWJlbCA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1sYWJlbCcpKS52YWx1ZTtcclxuICAgIGRhdGEuaWQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vZGUtaWQnKSkudmFsdWU7XHJcbiAgICBkYXRhLmZhaWx1cmVSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbm9kZS1mYWlsdXJlUmF0ZScpKS52YWx1ZSk7XHJcbiAgICBkYXRhLnJlcGFpclJhdGUgPSBOdW1iZXIoKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdub2RlLXJlcGFpclJhdGUnKSkudmFsdWUpO1xyXG4gICAgY2xlYXJOb2RlUG9wVXAoKTtcclxuXHJcbiAgICBsZXQgdGVtcE5vZGU6IE5vZGUgPSBuZXcgTm9kZShkYXRhLmxhYmVsLCBkYXRhLmlkLCBkYXRhLmZhaWx1cmVSYXRlLCBkYXRhLnJlcGFpclJhdGUpO1xyXG4gICAgbm9kZXMucHVzaCh0ZW1wTm9kZSk7XHJcbiAgICBjb25zb2xlLmxvZyhub2Rlcyk7XHJcbiAgICBjYWxsYmFjayhkYXRhKTtcclxuXHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0RWRnZVdpdGhvdXREcmFnKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgLy8gZmlsbGluZyBpbiB0aGUgcG9wdXAgRE9NIGVsZW1lbnRzXHJcbiAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWUgPSBkYXRhLmxhYmVsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2Utc2F2ZUJ1dHRvbicpLm9uY2xpY2sgPSBzYXZlRWRnZURhdGEuYmluZCh0aGlzLCBkYXRhLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1jYW5jZWxCdXR0b24nKS5vbmNsaWNrID0gY2FuY2VsRWRnZUVkaXQuYmluZCh0aGlzLCBjYWxsYmFjayk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1wb3BVcCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGVhckVkZ2VQb3BVcCgpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLXNhdmVCdXR0b24nKS5vbmNsaWNrID0gbnVsbDtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWNhbmNlbEJ1dHRvbicpLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtcG9wVXAnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxFZGdlRWRpdChjYWxsYmFjazogYW55KSB7XHJcbiAgICBjbGVhckVkZ2VQb3BVcCgpO1xyXG4gICAgY2FsbGJhY2sobnVsbCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVFZGdlRGF0YShkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YS50byA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgZGF0YS50byA9IGRhdGEudG8uaWRcclxuICAgIGlmICh0eXBlb2YgZGF0YS5mcm9tID09PSAnb2JqZWN0JylcclxuICAgICAgICBkYXRhLmZyb20gPSBkYXRhLmZyb20uaWRcclxuICAgIGRhdGEubGFiZWwgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtbGFiZWwnKSkudmFsdWU7XHJcbiAgICBkYXRhLmlkID0gKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlZGdlLWlkJykpLnZhbHVlO1xyXG4gICAgZGF0YS5mYWlsdXJlUmF0ZSA9IE51bWJlcigoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkZ2UtZmFpbHVyZVJhdGUnKSkudmFsdWUpO1xyXG4gICAgZGF0YS5yZXBhaXJSYXRlID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1yZXBhaXJSYXRlJykpLnZhbHVlKTtcclxuICAgIGRhdGEubGVuZ3RoID0gTnVtYmVyKCg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRnZS1sZW5ndGgnKSkudmFsdWUpO1xyXG4gICAgbGV0IHRlbXBFZGdlOiBFZGdlID0gbmV3IEVkZ2UoZGF0YS5sYWJlbCwgZGF0YS5pZCwgZGF0YS5mcm9tLCBkYXRhLnRvLCBkYXRhLmxlbmd0aCwgZGF0YS5mYWlsdXJlUmF0ZSwgZGF0YS5yZXBhaXJSYXRlKTtcclxuICAgIGVkZ2VzLnB1c2godGVtcEVkZ2UpO1xyXG4gICAgY29uc29sZS5sb2coZWRnZXMpO1xyXG4gICAgY2xlYXJFZGdlUG9wVXAoKTtcclxuICAgIGNhbGxiYWNrKGRhdGEpO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gYWJyYWhhbU1vZGFsKCkge1xyXG4gICAgc2V0U2VsZWN0aW9uT3B0aW9ucygpO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUtYWJyYWhhbScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgdXNlcm5hbWUgPSAkKCcjdXNlcm5hbWUtYWJyYWhhbScpLnZhbCgpO1xyXG4gICAgICAgIGxldCBwYXNzd29yZCA9ICQoJyNwYXNzd29yZC1hYnJhaGFtJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlLWFicmFoYW0nKS52YWwoKTtcclxuICAgICAgICBsZXQgZW5kTm9kZSA9ICQoJyNlbmQtbm9kZS1hYnJhaGFtJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSBwYXJzZUludCgkKCcjdGltZS1hYnJhaGFtJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGNhbGNEaWprc3RyLmFicmFoYW1DYWxjdWxhdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgdGltZSwgbm9kZXMsIGVkZ2VzKTtcclxuICAgICAgICAkKCcjYWJyYWhhbU1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaWprc3RyYU1vZGFsKCkge1xyXG4gICAgc2V0U2VsZWN0aW9uT3B0aW9ucygpO1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jYWxjdWxhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHVzZXJuYW1lID0gJCgnI3VzZXJuYW1lJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHBhc3N3b3JkID0gJCgnI3Bhc3N3b3JkJykudmFsKCk7XHJcbiAgICAgICAgbGV0IHN0YXJ0Tm9kZSA9ICQoJyNzdGFydC1ub2RlJykudmFsKCk7XHJcbiAgICAgICAgbGV0IGVuZE5vZGUgPSAkKCcjZW5kLW5vZGUnKS52YWwoKTtcclxuICAgICAgICBsZXQgdGltZSA9IHBhcnNlSW50KCQoJyN0aW1lJykudmFsKCkpO1xyXG4gICAgICAgIGxldCBjYWxjRGlqa3N0ciA9IG5ldyBBamF4Q29udHJvbGxlcigpO1xyXG4gICAgICAgIGNhbGNEaWprc3RyLmRpamtzdHJhQ2FsY3VsYXRpb24odXNlcm5hbWUsIHBhc3N3b3JkLCBzdGFydE5vZGUsIGVuZE5vZGUsIHRpbWUsIG5vZGVzLCBlZGdlcyk7XHJcbiAgICAgICAgJCgnI2V4YW1wbGVNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcblxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4cG9ydFRvcG9sb2d5KCkge1xyXG4gICAgJChcIi5leHBvcnRcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCBqc29uVG9wb2xvZ3kgPSBKU09OLnN0cmluZ2lmeSh7IG5vZGVzLCBlZGdlcyB9LCBudWxsLCAyKTtcclxuICAgICAgICB2YXIgYmxvYiA9IG5ldyBCbG9iKFtqc29uVG9wb2xvZ3ldLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04XCIgfSk7XHJcbiAgICAgICAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCBcInRvcG9sb2d5XCIgKyBcIi5qc29uXCIpO1xyXG5cclxuICAgICAgICAkKCcjZXhwb3J0LXRvcG9sb2d5JykubW9kYWwoJ2hpZGUnKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRTZWxlY3Rpb25PcHRpb25zKCkge1xyXG4gICAgJCgnI2V4YW1wbGVNb2RhbCwgI2FicmFoYW1Nb2RhbCcpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuZmluZCgnb3B0aW9uJykucmVtb3ZlKCk7XHJcbiAgICAgICAgJCgnI2VuZC1ub2RlLCAgI2VuZC1ub2RlLWFicmFoYW0nKS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICQoJyNzdGFydC1ub2RlLCAjc3RhcnQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyBub2Rlc1tpXS5nZXRMYWJlbCgpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICAgICAkKCcjZW5kLW5vZGUsICNlbmQtbm9kZS1hYnJhaGFtJykuYXBwZW5kKCc8b3B0aW9uPicgKyBub2Rlc1tpXS5nZXRMYWJlbCgpICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcjc3RhcnQtbm9kZSwgI3N0YXJ0LW5vZGUtYWJyYWhhbScpLmFwcGVuZCgnPG9wdGlvbj4nICsgJ05ldHdvcmsnICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICQoJyNlbmQtbm9kZSwgI2VuZC1ub2RlLWFicmFoYW0nKS5hcHBlbmQoJzxvcHRpb24+JyArICdOZXR3b3JrJyArICc8L29wdGlvbj4nKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlbGV0ZU5ldHdvcmsoKSB7XHJcbiAgICAkKFwiI2RlbGV0ZS10b3BvbG9neVwiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZWRnZXMgPSBbXTtcclxuICAgICAgICBub2RlcyA9IFtdO1xyXG4gICAgICAgIG5ldHdvcmsuZGVzdHJveSgpO1xyXG4gICAgICAgIG5ldHdvcmsgPSBudWxsO1xyXG4gICAgICAgIHJlbmRlclRvcG9sb2d5KCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxudmFyIGpzb247XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKTtcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUZpbGVTZWxlY3QoZXZ0OiBhbnkpIHtcclxuICAgIHZhciBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7IC8vIEZpbGVMaXN0IG9iamVjdFxyXG5cclxuICAgIC8vIGZpbGVzIGlzIGEgRmlsZUxpc3Qgb2YgRmlsZSBvYmplY3RzLiBMaXN0IHNvbWUgcHJvcGVydGllcy5cclxuICAgIHZhciBvdXRwdXQgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBmOyBmID0gZmlsZXNbaV07IGkrKykge1xyXG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDbG9zdXJlIHRvIGNhcHR1cmUgdGhlIGZpbGUgaW5mb3JtYXRpb24uXHJcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbiAodGhlRmlsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGU6IGFueSkge1xyXG4gICAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIHNldEltcG9ydGVkVG9wb2xvZ3koanNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KShmKTtcclxuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEltcG9ydGVkVG9wb2xvZ3koanNvbjogYW55KSB7XHJcbiAgICBlZGdlcyA9IFtdO1xyXG4gICAgbm9kZXMgPSBbXTtcclxuICAgIGZvciAobGV0IG5vZGUgb2YganNvbi5ub2Rlcykge1xyXG4gICAgICAgIGxldCB0bXBOb2RlID0gbmV3IE5vZGUobm9kZS5sYWJlbCwgbm9kZS5pZCwgbm9kZS5mYWlsdXJlUmF0ZSwgbm9kZS5yZXBhaXJSYXRlKTtcclxuICAgICAgICBub2Rlcy5wdXNoKHRtcE5vZGUpO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgZWRnZSBvZiBqc29uLmVkZ2VzKSB7XHJcbiAgICAgICAgbGV0IHRtcEVkZ2UgPSBuZXcgRWRnZShlZGdlLmxhYmVsLCBlZGdlLmlkLCBlZGdlLmZyb20sIGVkZ2UudG8sIGVkZ2UubGVuZ3RoLCBlZGdlLmZhaWx1cmVSYXRlLCBlZGdlLnJlcGFpclJhdGUpO1xyXG4gICAgICAgIGVkZ2VzLnB1c2godG1wRWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cobm9kZXMpO1xyXG4gICAgY29uc29sZS5sb2coZWRnZXMpO1xyXG59XHJcblxyXG4kKCcuaW1wb3J0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbmV0d29yay5kZXN0cm95KCk7XHJcbiAgICBuZXR3b3JrID0gbnVsbDtcclxuICAgIHJlbmRlclRvcG9sb2d5KCk7XHJcbiAgICAkKCcjaW1wb3J0LXRvcG9sb2d5JykubW9kYWwoJ2hpZGUnKTtcclxufSk7XHJcblxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tc3VjY2VzcycpLmhpZGUoKTtcclxuICAgICQoJy5mb3JtLXZhbGlkYXRpb24tZXJyb3InKS5oaWRlKCk7XHJcbiAgICBpZiAoZ2xvYmFsVXNlcm5hbWUgPT0gJycgfHwgZ2xvYmFsUGFzc3dvcmQgPT0gJycpIHtcclxuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICQoJy5sb2dpbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gJCgnI3VzZXJuYW1lLWlucHV0JykudmFsKCk7XHJcbiAgICAgICAgICAgIGxldCBwYXNzd29yZCA9ICQoJyNwYXNzd29yZC1pbnB1dCcpLnZhbCgpO1xyXG4gICAgICAgICAgICBnbG9iYWxQYXNzd29yZCA9IHBhc3N3b3JkO1xyXG4gICAgICAgICAgICBnbG9iYWxVc2VybmFtZSA9IHVzZXJuYW1lO1xyXG4gICAgICAgICAgICBsZXQgc2lnbkFqYXggPSBuZXcgQWpheENvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgc2lnbkFqYXguc2lnbnVwKHVzZXJuYW1lLCBwYXNzd29yZCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxucmVuZGVyVG9wb2xvZ3koKTtcclxuZGlqa3N0cmFNb2RhbCgpO1xyXG5hYnJhaGFtTW9kYWwoKTtcclxuZXhwb3J0VG9wb2xvZ3koKTtcclxuZGVsZXRlTmV0d29yaygpO1xyXG4iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVkZ2UgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBcclxuICAgIC8qdmlzdWFsaXphdGlvbiovXHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZyb206IHN0cmluZztcclxuICAgIHByaXZhdGUgdG86IHN0cmluZztcclxuICAgIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgLypiYWNrZW5kIHBhcmFtZXRlcnMqL1xyXG4gICAgcHJpdmF0ZSBzcmM6IHN0cmluZztcclxuICAgIHByaXZhdGUgZGVzdDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDpzdHJpbmcsIGlkOnN0cmluZywgZnJvbTpzdHJpbmcsIHRvOnN0cmluZywgbGVuZ3RoOm51bWJlciwgZmFpbHVyZVJhdGU6bnVtYmVyLCByZXBhaXJSYXRlOm51bWJlcil7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XHJcbiAgICAgICAgdGhpcy50byA9IHRvO1xyXG4gICAgICAgIHRoaXMuc3JjID0gZnJvbTtcclxuICAgICAgICB0aGlzLmRlc3QgPSB0bztcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgICAgICBzdXBlci5zZXRGYWlsdXJlUmF0ZShmYWlsdXJlUmF0ZSk7XHJcbiAgICAgICAgc3VwZXIuc2V0UmVwYWlyUmF0ZShyZXBhaXJSYXRlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyogR2V0dGVycyBhbmQgc2V0dGVycyAqL1xyXG5cclxuICAgIGdldFNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNyYztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTcmMoc3JjOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgIH1cclxuXHJcbiAgICBnZXREZXN0KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXREZXN0KGRlc3Q6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVzdCA9IGRlc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExlbmd0aChsZW5ndGg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXRMYWJlbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExhYmVsKGxhYmVsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJZChpZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZyb20oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb20oZnJvbTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUbygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvKHRvOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnRvID0gdG87XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBGYWlsUmVwYWlyUmF0ZSB9IGZyb20gJy4vcmF0ZXMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBGYWlsUmVwYWlyUmF0ZSB7XHJcbiAgICBwcml2YXRlIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6c3RyaW5nLCBpZDpzdHJpbmcsIGZhaWx1cmVSYXRlOm51bWJlciwgcmVwYWlyUmF0ZTpudW1iZXIpIHsgXHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHN1cGVyLnNldEZhaWx1cmVSYXRlKGZhaWx1cmVSYXRlKTtcclxuICAgICAgICBzdXBlci5zZXRSZXBhaXJSYXRlKHJlcGFpclJhdGUpOyBcclxuICAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRMYWJlbChsYWJlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SWQoaWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuICAgIFxyXG59IiwiZXhwb3J0IGNsYXNzIEZhaWxSZXBhaXJSYXRlIHtcclxuICAgIHByaXZhdGUgZmFpbHVyZVJhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVwYWlyUmF0ZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICBwdWJsaWMgc2V0RmFpbHVyZVJhdGUocmF0ZTogbnVtYmVyKTogdm9pZHtcclxuICAgICAgICB0aGlzLmZhaWx1cmVSYXRlID0gcmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRSZXBhaXJSYXRlKHJhdGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVwYWlyUmF0ZSA9IHJhdGU7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0RmFpbHVyZVJhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mYWlsdXJlUmF0ZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRSZXBhaXJSYXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwYWlyUmF0ZTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUnO1xyXG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi9lZGdlJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVG9wb2xvZ3kge1xyXG4gICAgcHJpdmF0ZSBub2RlczogQXJyYXk8Tm9kZT47XHJcbiAgICBwcml2YXRlIGxpbmtzOiBBcnJheTxFZGdlPjtcclxuXHJcbiAgICAvL0RJSktTVFJBIHBhcmFtZXRlcnMgLT4gc3RhcnQgJiBlbmQgbm9kZVxyXG4gICAgcHJpdmF0ZSBzdGFydDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBlbmQ6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5vZGVzID0gbmV3IEFycmF5PE5vZGU+KCk7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IG5ldyBBcnJheTxFZGdlPigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVCeUlkKGlkOiBzdHJpbmcpOiBOb2RlIHtcclxuICAgICAgICBmb3IobGV0IG5vZGUgb2YgdGhpcy5ub2Rlcyl7XHJcbiAgICAgICAgICAgIGlmKG5vZGUuZ2V0SWQoKSA9PT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZUJ5SWQoaWQ6IHN0cmluZyk6IEVkZ2Uge1xyXG4gICAgICAgIGZvcihsZXQgZWRnZSBvZiB0aGlzLmxpbmtzKSB7XHJcbiAgICAgICAgICAgIGlmKGVkZ2UuZ2V0SWQoKSA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlZGdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE5vZGVzKCk6IE5vZGVbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RWRnZXMoKTogRWRnZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1xyXG4gICAgfVxyXG5cclxuICAgIHNldE5vZGUobm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXROb2Rlcyhub2RlczogTm9kZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEVkZ2UoZWRnZTogRWRnZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGlua3MucHVzaChlZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRFZGdlcyhlZGdlczogRWRnZVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rcyA9IGVkZ2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXJ0Tm9kZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0O1xyXG4gICAgfSAgICBcclxuXHJcbiAgICBzZXRTdGFydE5vZGUoc3RhcnQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgIH1cclxuICAgIGdldEVuZE5vZGUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbmQ7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldEVuZE5vZGUoZW5kOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgIH1cclxufSIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjMuMlxuICogMjAxNi0wNi0xNiAxODoyNToxOVxuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIExpY2Vuc2U6IE1JVFxuICogICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiAqL1xuXG4vKmdsb2JhbCBzZWxmICovXG4vKmpzbGludCBiaXR3aXNlOiB0cnVlLCBpbmRlbnQ6IDQsIGxheGJyZWFrOiB0cnVlLCBsYXhjb21tYTogdHJ1ZSwgc21hcnR0YWJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xuXG52YXIgc2F2ZUFzID0gc2F2ZUFzIHx8IChmdW5jdGlvbih2aWV3KSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHQvLyBJRSA8MTAgaXMgZXhwbGljaXRseSB1bnN1cHBvcnRlZFxuXHRpZiAodHlwZW9mIHZpZXcgPT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXJcblx0XHQgIGRvYyA9IHZpZXcuZG9jdW1lbnRcblx0XHQgIC8vIG9ubHkgZ2V0IFVSTCB3aGVuIG5lY2Vzc2FyeSBpbiBjYXNlIEJsb2IuanMgaGFzbid0IG92ZXJyaWRkZW4gaXQgeWV0XG5cdFx0LCBnZXRfVVJMID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdmlldy5VUkwgfHwgdmlldy53ZWJraXRVUkwgfHwgdmlldztcblx0XHR9XG5cdFx0LCBzYXZlX2xpbmsgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLCBcImFcIilcblx0XHQsIGNhbl91c2Vfc2F2ZV9saW5rID0gXCJkb3dubG9hZFwiIGluIHNhdmVfbGlua1xuXHRcdCwgY2xpY2sgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBuZXcgTW91c2VFdmVudChcImNsaWNrXCIpO1xuXHRcdFx0bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHR9XG5cdFx0LCBpc19zYWZhcmkgPSAvY29uc3RydWN0b3IvaS50ZXN0KHZpZXcuSFRNTEVsZW1lbnQpIHx8IHZpZXcuc2FmYXJpXG5cdFx0LCBpc19jaHJvbWVfaW9zID0vQ3JpT1NcXC9bXFxkXSsvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHRocm93X291dHNpZGUgPSBmdW5jdGlvbihleCkge1xuXHRcdFx0KHZpZXcuc2V0SW1tZWRpYXRlIHx8IHZpZXcuc2V0VGltZW91dCkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGV4O1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHRcdCwgZm9yY2Vfc2F2ZWFibGVfdHlwZSA9IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0Ly8gbm90ZTogeW91ciBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBjb252ZXJ0IFVURi0xNiBVK0ZFRkYgdG8gRUYgQkIgQkZcblx0XHRcdGlmICgvXlxccyooPzp0ZXh0XFwvXFxTKnxhcHBsaWNhdGlvblxcL3htbHxcXFMqXFwvXFxTKlxcK3htbClcXHMqOy4qY2hhcnNldFxccyo9XFxzKnV0Zi04L2kudGVzdChibG9iLnR5cGUpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvYihbU3RyaW5nLmZyb21DaGFyQ29kZSgweEZFRkYpLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgZm9yY2UgPSB0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIGRpc3BhdGNoX2FsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvbiBhbnkgZmlsZXN5cyBlcnJvcnMgcmV2ZXJ0IHRvIHNhdmluZyB3aXRoIG9iamVjdCBVUkxzXG5cdFx0XHRcdCwgZnNfZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoKGlzX2Nocm9tZV9pb3MgfHwgKGZvcmNlICYmIGlzX3NhZmFyaSkpICYmIHZpZXcuRmlsZVJlYWRlcikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIHVybCA9IGlzX2Nocm9tZV9pb3MgPyByZWFkZXIucmVzdWx0IDogcmVhZGVyLnJlc3VsdC5yZXBsYWNlKC9eZGF0YTpbXjtdKjsvLCAnZGF0YTphdHRhY2htZW50L2ZpbGU7Jyk7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3B1cCA9IHZpZXcub3Blbih1cmwsICdfYmxhbmsnKTtcblx0XHRcdFx0XHRcdFx0aWYoIXBvcHVwKSB2aWV3LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG5cdFx0XHRcdFx0XHRcdHVybD11bmRlZmluZWQ7IC8vIHJlbGVhc2UgcmVmZXJlbmNlIGJlZm9yZSBkaXNwYXRjaGluZ1xuXHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcblx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRvbid0IGNyZWF0ZSBtb3JlIG9iamVjdCBVUkxzIHRoYW4gbmVlZGVkXG5cdFx0XHRcdFx0aWYgKCFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGZvcmNlKSB7XG5cdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgb3BlbmVkID0gdmlldy5vcGVuKG9iamVjdF91cmwsIFwiX2JsYW5rXCIpO1xuXHRcdFx0XHRcdFx0aWYgKCFvcGVuZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQXBwbGUgZG9lcyBub3QgYWxsb3cgd2luZG93Lm9wZW4sIHNlZSBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvZG9jdW1lbnRhdGlvbi9Ub29scy9Db25jZXB0dWFsL1NhZmFyaUV4dGVuc2lvbkd1aWRlL1dvcmtpbmd3aXRoV2luZG93c2FuZFRhYnMvV29ya2luZ3dpdGhXaW5kb3dzYW5kVGFicy5odG1sXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXG5cdFx0XHRpZiAoY2FuX3VzZV9zYXZlX2xpbmspIHtcblx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdHNhdmVfbGluay5kb3dubG9hZCA9IG5hbWU7XG5cdFx0XHRcdFx0Y2xpY2soc2F2ZV9saW5rKTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZnNfZXJyb3IoKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lIHx8IGJsb2IubmFtZSB8fCBcImRvd25sb2FkXCIsIG5vX2F1dG9fYm9tKTtcblx0XHR9XG5cdDtcblx0Ly8gSUUgMTArIChuYXRpdmUgc2F2ZUFzKVxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYikge1xuXHRcdHJldHVybiBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0bmFtZSA9IG5hbWUgfHwgYmxvYi5uYW1lIHx8IFwiZG93bmxvYWRcIjtcblxuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IoYmxvYiwgbmFtZSk7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKXt9O1xuXHRGU19wcm90by5yZWFkeVN0YXRlID0gRlNfcHJvdG8uSU5JVCA9IDA7XG5cdEZTX3Byb3RvLldSSVRJTkcgPSAxO1xuXHRGU19wcm90by5ET05FID0gMjtcblxuXHRGU19wcm90by5lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVzdGFydCA9XG5cdEZTX3Byb3RvLm9ucHJvZ3Jlc3MgPVxuXHRGU19wcm90by5vbndyaXRlID1cblx0RlNfcHJvdG8ub25hYm9ydCA9XG5cdEZTX3Byb3RvLm9uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlZW5kID1cblx0XHRudWxsO1xuXG5cdHJldHVybiBzYXZlQXM7XG59KFxuXHQgICB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmXG5cdHx8IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93XG5cdHx8IHRoaXMuY29udGVudFxuKSk7XG4vLyBgc2VsZmAgaXMgdW5kZWZpbmVkIGluIEZpcmVmb3ggZm9yIEFuZHJvaWQgY29udGVudCBzY3JpcHQgY29udGV4dFxuLy8gd2hpbGUgYHRoaXNgIGlzIG5zSUNvbnRlbnRGcmFtZU1lc3NhZ2VNYW5hZ2VyXG4vLyB3aXRoIGFuIGF0dHJpYnV0ZSBgY29udGVudGAgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgd2luZG93XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzLnNhdmVBcyA9IHNhdmVBcztcbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lICE9PSBudWxsKSAmJiAoZGVmaW5lLmFtZCAhPT0gbnVsbCkpIHtcbiAgZGVmaW5lKFwiRmlsZVNhdmVyLmpzXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIl19
