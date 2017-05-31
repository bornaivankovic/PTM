import { Node } from './models/node';
import { Edge } from './models/edge';
import { AjaxController } from './controllers/ajax.controller';
import { Topology } from './models/topology';
import * as FileSaver from 'file-saver';

declare var vis: any;
declare var $: any;

let nodes: Node[] = new Array<Node>();
let edges: Edge[] = new Array<Edge>();
let topology: Topology = new Topology();
let isNodeSelected: boolean = false;



function renderTopology() {

    var container = document.getElementById('network');

    let testNode1 = new Node('Node1', 'Node1', 1, 2);
    let testNode2 = new Node('Node2', 'Node2', 1, 2);
    let testNode3 = new Node('Node3', 'Node3', 1, 2);

    nodes.push(testNode1);
    nodes.push(testNode2);
    nodes.push(testNode3);
    var ajaxRequest: AjaxController = new AjaxController();

    let visnodes = new vis.DataSet(nodes);
    let visedges = new vis.DataSet(edges);

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
    var network = new vis.Network(container, data, options);
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
    console.log(nodes);
    callback(data);


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
    })

    $(document).on('click', '.calculate', function () {
        let username = $('#username').val();
        let password = $('#password').val();
        let startNode = $('#start-node').val();
        let endNode = $('#end-node').val();
        let time = parseInt($('#time').val());
        let calcDijkstr = new AjaxController();
        calcDijkstr.sendTopology(username, password, startNode, endNode, time, nodes, edges);
        $('#exampleModal').modal('hide');
    });
}

function exportTopology() {
    $(".export").click(function () {
        let jsonTopology = JSON.stringify({nodes,edges}, null, 2);
        var blob = new Blob([jsonTopology], { type: "application/json;charset=utf-8" });
        FileSaver.saveAs(blob, "topology" + ".json");
        
        $('#export-topology').modal('hide');

    });

}
renderTopology();
dijkstraModal();
exportTopology();