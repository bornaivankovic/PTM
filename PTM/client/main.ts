import { Node } from './models/node';
import { Edge } from './models/edge';
import { AjaxController } from './controllers/ajax.controller';
import { Topology } from './models/topology';

declare var vis: any;

let nodes: Node[] = new Array<Node>();
let edges: Edge[] = new Array<Edge>();
let topology: Topology = new Topology();



function renderTopology() {

    var container = document.getElementById('network');

    var ajaxRequest: AjaxController = new AjaxController();

    let testnode: Node = new Node("Node1", "1", 12, 34);
    let testnode2: Node = new Node("Node2", "2", 56, 78);


    nodes.push(testnode);
    nodes.push(testnode2);

    let visnodes = new vis.DataSet(nodes);
    let visedges = new vis.DataSet(edges);

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
    showNodeInformation(network);
    showEdgeInformation(network);

}

function editNode(data: any, callback: any) {
    (<HTMLInputElement>document.getElementById('node-label')).value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelNodeEdit.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

function showNodeInformation(data: any) {
    data.on("selectNode", function (params: any) {
        let node: Node = topology.getNodeById(params.nodes['0']);
        document.getElementById('event-catcher').innerHTML = '<h2>Node</h2>' + '<p><span>Label: </span>' + params.nodes + '</p>'
            + '<p><span>Edges: </span>' + params.edges + '</p>'
            + '<p><span>Failure rate: </span>' + node.getFailureRate() + '</p>'
            + '<p><span>Repair rate: </span>' + node.getRepairRate() + '</p>';
    });

        data.on("deselectNode", function(params: any) {
        document.getElementById('event-catcher').innerHTML = "";
    });
}

function showEdgeInformation(data: any) {
    data.on("selectEdge", function (params: any) {
        let edge: Edge = topology.getEdgeById(params.edges['0']);
        document.getElementById('event-catcher').innerHTML = '<h2>Edge</h2>' + '<p><span>Label: </span>' + params.edges + '</p>'
            + '<p><span>Failure rate:</span> ' + edge.getFailureRate() + '</p>'
            + '<p><span>Repair rate: </span>' + edge.getRepairRate() + '</p>';;

    });

    data.on("deselectEdge", function(params: any) {
        document.getElementById('event-catcher').innerHTML = "";
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

renderTopology();