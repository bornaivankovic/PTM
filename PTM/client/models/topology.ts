import { Node } from './node';
import { Edge } from './edge';


export class Topology {
    private nodes: Array<Node>;
    private links: Array<Edge>;

    //DIJKSTRA parameters -> start & end node
    private start: string;
    private end: string;

    constructor() {
        this.nodes = new Array<Node>();
        this.links = new Array<Edge>();
    }

    getNodeById(id: string): Node {
        for(let node of this.nodes){
            if(node.getId() === id){
                return node;
            }
        }
        
    }

    getEdgeById(id: string): Edge {
        for(let edge of this.links) {
            if(edge.getId() === id) {
                return edge;
            }
        }
    }

    getNodes(): Node[] {
        return this.nodes;
    }

    getEdges(): Edge[] {
        return this.links
    }

    setNode(node: Node): void {
        this.nodes.push(node);
    }

    setNodes(nodes: Node[]): void {
        this.nodes = nodes;
    }

    setEdge(edge: Edge): void {
        this.links.push(edge);
    }

    setEdges(edges: Edge[]): void {
        this.links = edges;
    }

    getStartNode(): string {
        return this.start;
    }    

    setStartNode(start: string): void {
        this.start = start;
    }
    getEndNode(): string {
        return this.end;
    }    

    setEndNode(end: string): void {
        this.end = end;
    }
}