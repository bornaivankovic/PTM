import { Node } from './node';
import { Edge } from './edge';


export class Topology {
    private nodes: Array<Node>;
    private edges: Array<Edge>;

    constructor() {}

    getNodeById(id: string): Node {
        for(let node of this.nodes){
            if(node.getId() === id){
                return node;
            }
        }
        
    }

    getNodes(): Node[] {
        return this.nodes;
    }

    getEdges(): Edge[] {
        return this.edges
    }

    

    
}