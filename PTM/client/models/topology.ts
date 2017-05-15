import { Node } from './node';
import { Edge } from './edge';


export class Topology {
    private nodes: Array<Node>;
    private edges: Array<Edge>;

    constructor() {}

    getNodes(): Node[] {
        return this.nodes;
    }

    getEdges(): Edge[] {
        return this.edges
    }

    

    
}