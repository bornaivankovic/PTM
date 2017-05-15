export class DrawController {


    constructor() {
    };

    

    editNode(data:any, callback:any): void {
      (<HTMLInputElement>document.getElementById('node-label')).value = data.label;
      document.getElementById('node-saveButton').onclick = this.saveNodeData.bind(this, data, callback);
      document.getElementById('node-cancelButton').onclick = this.clearNodePopUp.bind(this, data, callback);
      document.getElementById('node-popUp').style.display = 'block';
    }

    clearNodePopUp(): void {
        document.getElementById('node-saveButton').onclick = null;
        document.getElementById('node-cancelButton').onclick = null;
        document.getElementById('node-popUp').style.display = 'none';
    }

    saveNodeData(data:any,callback:any) {
      data.label = (<HTMLInputElement>document.getElementById('node-label')).value;
      this.clearNodePopUp();
      callback(data);
    }
}