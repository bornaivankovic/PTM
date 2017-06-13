import { FailRepairRate } from './rates';

export class Node extends FailRepairRate {
    private label: string;
    private id: string; 

    constructor(label:string, id:string, failureRate:number, repairRate:number) { 
        super();
        this.label = label;
        this.id = id;
        super.setFailureRate(failureRate);
        super.setRepairRate(repairRate); 
     }

    getLabel(): string {
        return this.label;
    }

    setLabel(label: string): void {
        this.label = label;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string): void {
        this.id = id;
    }
    
}