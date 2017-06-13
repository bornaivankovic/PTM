import { Node } from './models/node';
import { Edge } from './models/edge';
import { AjaxController } from './controllers/ajax.controller';
import { Topology } from './models/topology';
import * as FileSaver from 'file-saver';

declare var FileReader: any;
declare var vis: any;
declare var $: any;
declare var Dropzone: any;

let nodes: Node[] = new Array<Node>();
let edges: Edge[] = new Array<Edge>();
let topology: Topology = new Topology();
let isNodeSelected: boolean = false;
let network: any;
let globalUsername: string = '';
let globalPassword: string = '';
let globalResultDijkstra: any;
let globalResultAbraham: any;
let visnodes: any;
let visedges: any;

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
            color: {

            },
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

            addNode: function (data: any, callback: any) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Add Node";

                editNode(data, callback);
            },
            editNode: function (data: any, callback: any) {
                // filling in the popup DOM elements
                document.getElementById('node-operation').innerHTML = "Edit Node";
                editNode(data, callback);
            },
            addEdge: function (data: any, callback: any) {
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
                editWithoutDrag: function (data: any, callback: any) {
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

function editNode(data: any, callback: any) {
    (<HTMLInputElement>document.getElementById('node-label')).value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelNodeEdit.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

function registerEvent(data: any) {
    data.on("select", function (params: any) {
        console.log(params);
        if (params.nodes.length == 0 && params.edges.length != 0) {
            let edge: Edge = topology.getEdgeById(params.edges['0']);
            document.getElementById('event-catcher').innerHTML = '<h2>Edge</h2>' + '<p><span>Label: </span>' + params.edges + '</p>'
                + '<p><span>Failure rate:</span> ' + edge.getFailureRate() + '</p>'
                + '<p><span>Repair rate: </span>' + edge.getRepairRate() + '</p>';
        } else if (params.nodes.length > 0) {
            let node: Node = topology.getNodeById(params.nodes['0']);
            document.getElementById('event-catcher').innerHTML = '<h2>Node</h2>' + '<p><span>Label: </span>' + params.nodes + '</p>'
                + '<p><span>Edges: </span>' + params.edges + '</p>'
                + '<p><span>Failure rate: </span>' + node.getFailureRate() + '</p>'
                + '<p><span>Repair rate: </span>' + node.getRepairRate() + '</p>';
        } else if (params.nodes.length == 0 && params.edges.length == 0) {
            document.getElementById('event-catcher').innerHTML = "";
        }
    });
}


function clearNodePopUp() {
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';
}

function cancelNodeEdit(callback: any) {
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data: any, callback: any) {
    data.label = (<HTMLInputElement>document.getElementById('node-label')).value;
    data.id = (<HTMLInputElement>document.getElementById('node-id')).value;
    data.failureRate = Number((<HTMLInputElement>document.getElementById('node-failureRate')).value);
    data.repairRate = Number((<HTMLInputElement>document.getElementById('node-repairRate')).value);
    clearNodePopUp();

    let tempNode: Node = new Node(data.label, data.id, data.failureRate, data.repairRate);
    nodes.push(tempNode);
    callback(data);
    $('.calculation-container').append("<div class='success-msg-green'>Node added...</div>");
}

function editEdgeWithoutDrag(data: any, callback: any) {
    // filling in the popup DOM elements
    (<HTMLInputElement>document.getElementById('edge-label')).value = data.label;
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp() {
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';
}

function cancelEdgeEdit(callback: any) {
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data: any, callback: any) {
    if (typeof data.to === 'object')
        data.to = data.to.id
    if (typeof data.from === 'object')
        data.from = data.from.id
    data.label = (<HTMLInputElement>document.getElementById('edge-label')).value;
    data.id = (<HTMLInputElement>document.getElementById('edge-id')).value;
    data.failureRate = Number((<HTMLInputElement>document.getElementById('edge-failureRate')).value);
    data.repairRate = Number((<HTMLInputElement>document.getElementById('edge-repairRate')).value);
    data.length = Number((<HTMLInputElement>document.getElementById('edge-length')).value);
    let tempEdge: Edge = new Edge(data.label, data.id, data.from, data.to, data.length, data.failureRate, data.repairRate);
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
        let username = globalUsername;
        let password = globalPassword;
        let startNode = $('#start-node-abraham').val();
        let endNode = $('#end-node-abraham').val();
        let time = parseInt($('#time-abraham').val());
        let calcDijkstr = new AjaxController();
        globalResultAbraham = calcDijkstr.abrahamCalculation(username, password, startNode, endNode, time, nodes, edges);
        let resultIterator = 1;
        let result = globalResultAbraham.responseJSON.result;
        if (typeof globalResultAbraham.responseJSON.result.availability == 'object') {
            $('.resultsAbraham').append("<div class='panel-group green' id='accordion2' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapseAbraham" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapseAbraham" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapseAbraham" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Availability(av): </span>" + result.availability.av + "</div>" + "<div><span>Availability(s,t): </span>" + result.availability["s,t"] + "</div>" + "<div><span>Reliablity(av): </span>" + result.reliability.av + "</div>" + "<div><span>Reliability(s,t): </span>" + result.reliability["s,t"] + "</div>" + "</div> </div> </div>");

        } else {
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
        let username = globalUsername;
        let password = globalPassword;
        let startNode = $('#start-node').val();
        let endNode = $('#end-node').val();
        let time = parseInt($('#time').val());
        let calcDijkstr = new AjaxController();
        globalResultDijkstra = calcDijkstr.dijkstraCalculation(username, password, startNode, endNode, time, nodes, edges);
        let resultIterator = 1;
        for (let result of globalResultDijkstra.responseJSON.result) {

            console.log(result);
            $('.results').append("<div class='panel-group green' id='accordion' role='tablist' aria-multiselectable='true'> <div class='panel panel-default'> <div class='panel-heading' role='tab' id='headingOne'> <h4 class='panel-title  text-center'> <a role='button' data-toggle='collapse' data-parent='#accordion' href='" + "#collapse" + resultIterator + "'" + " aria-expanded='false' aria-controls='" + "collapse" + resultIterator + "'" + ">" + "Result " + resultIterator + "</a> </h4> </div> <div id='" + "collapse" + resultIterator + "'" + "class='panel-collapse collapse' role='tabpanel' aria-labelledby='headingOne'> <div class='panel-body'>" + "<div><span>Path1: </span>" + result.paths.path1 + "</div>" + "<div><span>Path2: </span>" + result.paths.path2 + "</div>" + "<div><span>Availability(av): </span>" + result.availability.av + "</div>" + "<div><span>Availability(s,t): </span>" + result.availability["s,t"] + "</div>" + "<div><span>Reliablity(av): </span>" + result.reliability.av + "</div>" + "<div><span>Reliability(s,t): </span>" + result.reliability["s,t"] + "</div>" + "</div> </div> </div>");
            resultIterator++;
        }
                $('.calculation-container').append("<div class='success-msg-green'>Calculation done...</div>");
    });
}

function exportTopology() {
    $(".export").click(function () {
        let jsonTopology = JSON.stringify({ nodes, edges }, null, 2);
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
    })
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

function handleFileSelect(evt: any) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e: any) {
                json = JSON.parse(e.target.result);
                setImportedTopology(json);
            }
        })(f);
        reader.readAsText(f);
                $('.calculation-container').append("<div class='success-msg-white'>Topology imported...</div>");
    }

}

function setImportedTopology(json: any) {
    edges = [];
    nodes = [];
    for (let node of json.nodes) {
        let tmpNode = new Node(node.label, node.id, node.failureRate, node.repairRate);
        nodes.push(tmpNode);
    }
    for (let edge of json.edges) {
        let tmpEdge = new Edge(edge.label, edge.id, edge.from, edge.to, edge.length, edge.failureRate, edge.repairRate);
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
            let username = $('#username-input').val();
            let password = $('#password-input').val();
            globalPassword = password;
            globalUsername = username;
            let signAjax = new AjaxController();
            signAjax.signup(username, password);

        });
    }
});
renderTopology();
dijkstraModal();
abrahamModal();
exportTopology();
deleteNetwork();
