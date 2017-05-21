export class ParseController {

    constructor() {}

    public parseResponse(response: any) {

    }

    parseDijkstraResponse(res: any): any {

         let path = {
             path1: (res.path1) ? res.path1 : null,
             path2: (res.path2) ? res.path2 : null,
         }
         return path;
    }
}