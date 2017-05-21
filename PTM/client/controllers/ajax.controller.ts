import { ParseController } from './parse.controller';

declare var $: any;

export class AjaxController {
    private responseParser: ParseController;

    constructor() { 
        this.responseParser = new ParseController();    
    }

    public sendTopology(topology: any): void {

        let jsonTopology = JSON.stringify(topology);
        console.log(JSON.stringify(topology));
        
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
