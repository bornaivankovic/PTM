export class DrawController {

    constructor() {
    };

    public addNode(data: any, callback: any) {
        // filling in the popup DOM elements
        console.log("add node");
        document.getElementById('node-operation').innerHTML = "Add Node";
        this.editNode(data, callback);
        
    }

    addEdge(data: any, callback: any) {
        document.getElementById('node-operation').innerHTML = "Add Node";
        this.editNode(data, callback);
    }

    editNode(data: any, callback: any) {
        console.log("tu sam");
        (<HTMLInputElement>document.getElementById('node-label')).value = data.label;
        document.getElementById('node-saveButton').onclick = this.saveNodeData.bind(this, data, callback);
        //document.getElementById('node-cancelButton').onclick = this.clearNodePopUp(this);
        document.getElementById('node-popUp').style.display = 'block';
    }

    clearNodePopUp() {
        document.getElementById('node-saveButton').onclick = null;
        document.getElementById('node-cancelButton').onclick = null;
        document.getElementById('node-popUp').style.display = 'none';
    }

    cancelNodeEdit(callback: any) {
        this.clearNodePopUp();
        callback(null);
    }

    saveNodeData(data: any, callback: any) {
        console.log("save");
        data.label = (<HTMLInputElement>document.getElementById('node-label')).value;
        this.clearNodePopUp();
        data.label = 'nesto';
        callback(data);
    }

}