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

    public signup(username: string, password: string): void {
        let jsonSignup = JSON.stringify({ username, password });
        $.ajax({
            url: 'http://localhost:8000/signup',
            method: 'POST',
            context: this,
            data: jsonSignup,
            success: function (data: any) {
                console.log(data);
                if (data.user == "wrong_password") {
                    $('.form-validation-error').show();
                    return false;
                }
                else if(data.user == "valid" || data.user == "created") {
                    $('.form-validation-success').show();
                                    
                setTimeout(function () {
                    $('#login-modal').modal('hide');
                }, 1000);
                }
                
            },
            error: function (data: any) {
                $('.form-validation-error').show();
            }
        });
    }
}
