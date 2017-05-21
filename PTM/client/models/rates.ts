export class FailRepairRate {
    private failureRate: number;
    private repairRate: number;

    constructor() {}

    public setFailureRate(rate: number): void{
        this.failureRate = rate;
    }
    public setRepairRate(rate: number): void {
        this.repairRate = rate;
    }
    public getFailureRate(): number {
        return this.failureRate;
    }
    public getRepairRate(): number {
        return this.repairRate;
    }
}