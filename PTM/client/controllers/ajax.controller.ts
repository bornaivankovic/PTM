declare var $: any;

export class AjaxController {
    constructor() {   
    }

    public sendTopology(topology: any): void {

        let jsonTopology = JSON.stringify(topology);
        
        $.ajax({
            url: 'http://localhost:8000/dijkstra',
            method: 'POST',
            context: this,
            data: jsonTopology,
            success: function(data: any) {
                console.log(data);
            },
            error: function(data: any) {
                console.log(data);
            }
        });
    }
}
