export interface FailRepairRateInterface {
    failureRate: number;
    repairRate: number;

    setFailureRate(rate: number): void;
    setRepairRate(rate: number): void;
    getFailureRate(): number;
    getRepairRate(): number;
}