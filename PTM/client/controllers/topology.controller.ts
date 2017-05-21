export class TopologyController {
    constructor() { }

    editNode(data: any, callback: any) {
        (<HTMLInputElement>document.getElementById('node-label')).value = data.label;
        document.getElementById('node-saveButton').onclick = this.saveNodeData.bind(this, data, callback);
        document.getElementById('node-cancelButton').onclick = this.clearNodePopUp.bind(this);
        document.getElementById('node-popUp').style.display = 'block';
    }

    clearNodePopUp() {
        document.getElementById('node-saveButton').onclick = null;
        document.getElementById('node-cancelButton').onclick = null;
        document.getElementById('node-popUp').style.display = 'none';
    }

    cancelNodeEdit(callback: any) {
        this.clearNodePopUp(); 3
        callback(null);
    }

    saveNodeData(data: any, callback: any) {
        data.label = (<HTMLInputElement>document.getElementById('node-label')).value;
        data.id = (<HTMLInputElement>document.getElementById('node-id')).value;
        data.failureRate = Number((<HTMLInputElement>document.getElementById('node-failureRate')).value);
        data.repairRate = Number((<HTMLInputElement>document.getElementById('node-repairRate')).value);
        this.clearNodePopUp();

        let tempNode: Node = new Node(data.label, data.id, data.failureRate, data.repairRate);
        nodes.push(tempNode);
        console.log(nodes);
        callback(data);


    }

    editEdgeWithoutDrag(data: any, callback: any) {
        // filling in the popup DOM elements
        (<HTMLInputElement>document.getElementById('edge-label')).value = data.label;
        document.getElementById('edge-saveButton').onclick = this.saveEdgeData.bind(this, data, callback);
        document.getElementById('edge-cancelButton').onclick = this.cancelEdgeEdit.bind(this, callback);
        document.getElementById('edge-popUp').style.display = 'block';
    }

    clearEdgePopUp() {
        document.getElementById('edge-saveButton').onclick = null;
        document.getElementById('edge-cancelButton').onclick = null;
        document.getElementById('edge-popUp').style.display = 'none';
    }

    cancelEdgeEdit(callback: any) {
        this.clearEdgePopUp();
        callback(null);
    }

    saveEdgeData(data: any, callback: any) {
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
        this.clearEdgePopUp();
        callback(data);

    }
}