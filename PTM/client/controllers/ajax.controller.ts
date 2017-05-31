declare var $: any;

export class AjaxController {
    constructor() {   
    }

    public sendTopology(username: string, password: string, start: string, end: string, t: number, nodes: any, links: any): void {

        let jsonTopology = JSON.stringify({username, password, nodes,links,start,end, t});
        console.log(jsonTopology);
        
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
