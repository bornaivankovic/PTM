declare var $: any;

export class AjaxController {
    constructor() {
    }

    public dijkstraCalculation(username: string, password: string, start: string, end: string, t: number, nodes: any, links: any): void {
        if (start == 'Network' || end == 'Network') {
            var jsonTopology = JSON.stringify({ username, password, nodes, links, t });
        } else {
            var jsonTopology = JSON.stringify({ username, password, nodes, links, start, end, t });
        }
        $.ajax({
            url: 'http://localhost:8000/dijkstra',
            method: 'POST',
            context: this,
            data: jsonTopology,
            success: function (data: any) {
                console.log(data);
            },
            error: function (data: any) {
                console.log(data);
            }
        });
    }

    public abrahamCalculation(username: string, password: string, start: string, end: string, t: number, nodes: any, links: any): void {
        if (start == 'Network' || end == 'Network') {
            var jsonTopology = JSON.stringify({ username, password, nodes, links, t });
            console.log(jsonTopology);
            
        } else {
            var jsonTopology = JSON.stringify({ username, password, nodes, links, start, end, t });
            console.log(jsonTopology);
        }
        $.ajax({
            url: 'http://localhost:8000/nodepair',
            method: 'POST',
            context: this,
            data: jsonTopology,
            success: function (data: any) {
                console.log(data);
            },
            error: function (data: any) {
                console.log(data);
            }
        });
    }
}
