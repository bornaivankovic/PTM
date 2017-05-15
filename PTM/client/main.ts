import { Node } from './models/node';
import { Edge } from './models/edge';
import { DrawController } from './controllers/draw';

declare var vis: any;
function renderTopology(){
    var container = document.getElementById('network');
    console.log(container);
    
    let nodes : Node[] = new Array<Node>();
    let edges: Edge[] = new Array<Edge>();

    


    let testnode: Node = new Node();
    testnode.setId("borna");
    testnode.setLabel("patak");

    let testnode2: Node = new Node();
    testnode2.setId("vedran");
    testnode2.setLabel("patka");

    let testedge: Edge = new Edge();
    testedge.setFrom("vedran");
    testedge.setTo("borna");
    testedge.setId("tajnaveza");
    testedge.setLabel("istinska ljubav");

    nodes.push(testnode);
    nodes.push(testnode2);
    edges.push(testedge);

    let visnodes = new vis.DataSet(nodes);
    let visedges = new vis.DataSet(edges);

    var data = {
        nodes: visnodes,
        edges: visedges
    };
    var draw = new DrawController();

    var options = {
        manipulation:  draw

    };

    // initialize your network!
    var network = new vis.Network(container, data, options);
}

renderTopology();